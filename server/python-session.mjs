const cookieNames = {
  funcionario: "soulup_employee",
  usuario: "soulup_account",
};

export class SessionError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export function requireSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  try {
    if (new URL(origin).host === host) return;
  } catch {
    /* Origem inválida. */
  }
  throw new SessionError("Origem não autorizada.", 403);
}

export async function readJsonBody(req) {
  if (!req.headers["content-type"]?.startsWith("application/json"))
    throw new SessionError("Envie os dados em formato JSON.", 415);
  let body = req.body;
  if (body === undefined) {
    let raw = "";
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 4096)
        throw new SessionError("Requisição muito grande.", 413);
    }
    body = raw;
  }
  try {
    if (typeof body === "string") body = JSON.parse(body);
  } catch {
    throw new SessionError("Requisição inválida.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new SessionError("Requisição inválida.", 400);
  if (JSON.stringify(body).length > 4096)
    throw new SessionError("Requisição muito grande.", 413);
  return body;
}

function tokenFromCookie(req, role) {
  const value = (req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieNames[role]}=`))
    ?.slice(cookieNames[role].length + 1);
  return typeof value === "string" && /^[A-Za-z0-9_-]{20,512}$/.test(value)
    ? value
    : null;
}

function setSessionCookie(req, res, role, token, age) {
  const secure =
    req.headers["x-forwarded-proto"] === "https" || req.socket?.encrypted;
  const path = role === "funcionario" ? "/api/acesso-funcionario" : "/api/auth";
  res.setHeader(
    "Set-Cookie",
    `${cookieNames[role]}=${token}; HttpOnly; SameSite=Strict; Path=${path}; Max-Age=${age}${secure ? "; Secure" : ""}`,
  );
}

export function clearSession(req, res, role) {
  setSessionCookie(req, res, role, "", 0);
}

async function python(path, { method = "GET", body, token } = {}) {
  const base = (
    process.env.SOULUP_PYTHON_API_URL ||
    "https://soulup-api-python.onrender.com"
  ).replace(/\/$/, "");
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(25000),
    });
  } catch {
    throw new SessionError(
      "Não foi possível consultar a API Python. Tente novamente.",
      502,
    );
  }
  const raw = await response.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    throw new SessionError("A API Python retornou uma resposta inválida.", 502);
  }
  if (!response.ok) {
    const status = [400, 401, 403, 409, 413, 415, 429, 503].includes(
      response.status,
    )
      ? response.status
      : 502;
    const messages = {
      400: "Confira os dados informados.",
      401: "Credenciais incorretas ou sessão expirada.",
      403: "A API Python não autorizou este acesso.",
      429: "Muitas tentativas. Aguarde antes de tentar novamente.",
      503: "A API Python está indisponível ou não foi configurada.",
    };
    throw new SessionError(
      messages[status] || "Não foi possível consultar a API Python.",
      status,
    );
  }
  return data;
}

function validateProfile(data, role) {
  if (role === "funcionario") {
    if (data?.perfil !== "funcionario")
      throw new SessionError(
        "A sessão não possui permissão de funcionário.",
        403,
      );
    return { authenticated: true };
  }
  if (
    !data ||
    data.perfil === "funcionario" ||
    !Number.isSafeInteger(data.id) ||
    data.id <= 0 ||
    typeof data.nome !== "string" ||
    !data.nome.trim() ||
    typeof data.email !== "string" ||
    !data.email.trim()
  )
    throw new SessionError(
      "A API Python não confirmou os dados da conta.",
      502,
    );
  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    ...(Number.isSafeInteger(data.api_id) ? { api_id: data.api_id } : {}),
  };
}

export async function startSession(req, res, role, credentials) {
  const result = await python(
    role === "funcionario" ? "/auth/funcionarios" : "/auth/login",
    { method: "POST", body: credentials },
  );
  if (
    result?.perfil !== role ||
    result.tipo !== "Bearer" ||
    typeof result.token !== "string" ||
    !/^[A-Za-z0-9_-]{20,512}$/.test(result.token) ||
    !Number.isSafeInteger(result.expira_em) ||
    result.expira_em <= 0
  )
    throw new SessionError(
      "A API Python não confirmou uma sessão válida.",
      502,
    );
  const profile = validateProfile(
    await python("/auth/me", { token: result.token }),
    role,
  );
  setSessionCookie(
    req,
    res,
    role,
    result.token,
    Math.min(result.expira_em, 3600),
  );
  return profile;
}

export async function getSession(req, role) {
  const token = tokenFromCookie(req, role);
  if (!token)
    throw new SessionError("Entre novamente; sessão ausente ou expirada.", 401);
  return validateProfile(await python("/auth/me", { token }), role);
}

export async function endSession(req, res, role) {
  const token = tokenFromCookie(req, role);
  if (token) {
    try {
      await python("/auth/logout", { method: "POST", token });
    } catch (cause) {
      if (!(cause instanceof SessionError && cause.status === 401)) throw cause;
    }
  }
  clearSession(req, res, role);
}
