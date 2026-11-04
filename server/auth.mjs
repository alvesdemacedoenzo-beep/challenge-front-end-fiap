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

export default async function auth(req, res) {
  try {
    const url = new URL(req.url, "http://localhost");
    const action =
      url.searchParams.get("action") || url.pathname.split("/").at(-1);
    if (req.method !== "GET") requireSameOrigin(req);
    if (action === "login" && req.method === "POST") {
      const body = await readJsonBody(req);
      return sendJson(
        res,
        200,
        await startSession(req, res, "usuario", {
          email: body.email,
          senha: body.senha,
        }),
      );
    }
    if (action === "me" && req.method === "GET")
      return sendJson(res, 200, await getSession(req, "usuario"));
    if (action === "logout" && req.method === "POST") {
      await endSession(req, res, "usuario");
      return sendJson(res, 200, { authenticated: false });
    }
    return sendJson(res, 405, { message: "Método ou operação não permitido." });
  } catch (cause) {
    if (cause instanceof SessionError && [401, 403].includes(cause.status))
      clearSession(req, res, "usuario");
    return sendJson(res, cause instanceof SessionError ? cause.status : 502, {
      message:
        cause instanceof SessionError
          ? cause.message
          : "Não foi possível consultar a API Python.",
    });
  }
}
