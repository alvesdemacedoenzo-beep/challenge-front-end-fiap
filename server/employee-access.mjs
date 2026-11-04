import {
  SessionError,
  sendJson,
  requireSameOrigin,
  readJsonBody,
  startSession,
  getSession,
  endSession,
  clearSession,
} from "./python-session.mjs";

export default async function employeeAccess(req, res) {
  try {
    if (["POST", "DELETE"].includes(req.method)) requireSameOrigin(req);
    if (req.method === "POST") {
      const body = await readJsonBody(req);
      return sendJson(
        res,
        200,
        await startSession(req, res, "funcionario", { senha: body.senha }),
      );
    }
    if (req.method === "DELETE") {
      await endSession(req, res, "funcionario");
      return sendJson(res, 200, { authenticated: false });
    }
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET, POST, DELETE");
      return sendJson(res, 405, { message: "Método não permitido." });
    }
    await getSession(req, "funcionario");
    const url = new URL(req.url, "http://localhost");
    if (url.searchParams.get("recurso") === "usuarios") {
      const base = (
        process.env.SOULUP_JAVA_API_URL ||
        process.env.SOULUP_API_URL ||
        "https://challeng-sprin4-java.onrender.com"
      ).replace(/\/$/, "");
      const response = await fetch(`${base}/usuarios`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(45000),
      });
      if (!response.ok)
        return sendJson(res, 502, {
          message: `A API de usuários retornou HTTP ${response.status}.`,
        });
      const users = await response.json();
      if (
        !Array.isArray(users) ||
        users.some((user) => {
          if (!user || typeof user !== "object" || Array.isArray(user))
            return true;
          const id = user.id ?? user.id_usuario;
          return (
            !Number.isSafeInteger(id) ||
            id <= 0 ||
            typeof user.nome !== "string" ||
            !user.nome.trim() ||
            typeof user.email !== "string" ||
            !user.email.trim()
          );
        })
      )
        return sendJson(res, 502, {
          message: "A API não retornou uma lista de usuários válida.",
        });
      return sendJson(
        res,
        200,
        users.map((user) => ({
          id: user.id ?? user.id_usuario,
          nome: user.nome,
          email: user.email,
        })),
      );
    }
    return sendJson(res, 200, { authenticated: true });
  } catch (cause) {
    if (cause instanceof SessionError && [401, 403].includes(cause.status))
      clearSession(req, res, "funcionario");
    return sendJson(res, cause instanceof SessionError ? cause.status : 502, {
      message:
        cause instanceof SessionError
          ? cause.message
          : "Não foi possível consultar o serviço. Tente novamente.",
    });
  }
}
