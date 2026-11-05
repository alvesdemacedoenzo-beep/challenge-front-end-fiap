import { sendJson } from "./python-session.mjs";

// A exclusão passa exclusivamente por /api/acesso-funcionario.
export default async function javaGroups(req, res) {
  if (req.method === "DELETE")
    return sendJson(res, 403, { message: "Exclusão disponível somente na área de funcionários." });
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, { message: "Método não permitido." });
  }
  try {
    const base = (process.env.SOULUP_JAVA_API_URL || process.env.SOULUP_API_URL || "https://challeng-sprin4-java.onrender.com").replace(/\/$/, "");
    let body;
    if (req.method === "POST") {
      body = req.body;
      if (body === undefined) {
        body = "";
        for await (const chunk of req) {
          body += chunk;
          if (body.length > 1048576) return sendJson(res, 413, { message: "Requisição muito grande." });
        }
      } else if (typeof body !== "string") body = JSON.stringify(body);
    }
    const response = await fetch(`${base}/grupos${new URL(req.url, "http://localhost").search}`, {
      method: req.method,
      headers: { Accept: "application/json", ...(req.method === "POST" ? { "Content-Type": "application/json" } : {}) },
      ...(body !== undefined ? { body } : {}),
      signal: AbortSignal.timeout(45000),
    });
    res.statusCode = response.status;
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(await response.text());
  } catch {
    return sendJson(res, 502, { message: "Não foi possível consultar a API de grupos. Consulte os registros antes de repetir a operação." });
  }
}
