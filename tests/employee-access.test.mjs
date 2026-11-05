import assert from "node:assert/strict";
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { after, before, beforeEach, test } from "node:test";
import employeeAccess from "../server/employee-access.mjs";
import auth from "../server/auth.mjs";
import javaGroups from "../server/java-groups.mjs";

let server,
  upstream,
  base,
  calls,
  sessions,
  upstreamFailure,
  profileOverride,
  malformedToken,
  javaUsers,
  groupDeleteStatus;
const originalPython = process.env.SOULUP_PYTHON_API_URL;
const originalJava = process.env.SOULUP_JAVA_API_URL;
function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}
before(async () => {
  upstream = createServer(async (req, res) => {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const body = raw ? JSON.parse(raw) : null;
    calls.push({
      path: req.url,
      method: req.method,
      body,
      authorization: req.headers.authorization,
    });
    if (req.url === "/java/usuarios") return json(res, 200, javaUsers);
    if (req.url === "/java/grupos?id=7" && req.method === "DELETE") {
      res.writeHead(groupDeleteStatus);
      return res.end();
    }
    if (upstreamFailure)
      return json(res, 503, { erro: "Serviço indisponível." });
    if (["/auth/funcionarios", "/auth/login"].includes(req.url)) {
      if (body?.senha !== "12345678")
        return json(res, 401, { erro: "Senha incorreta." });
      const role = req.url === "/auth/funcionarios" ? "funcionario" : "usuario";
      const token = randomBytes(32).toString("base64url");
      sessions.set(token, role);
      return json(res, 200, {
        token: malformedToken ? "" : token,
        tipo: "Bearer",
        expira_em: 3600,
        perfil: role,
      });
    }
    const token = req.headers.authorization?.replace(/^Bearer /, "");
    const role = sessions.get(token);
    if (!role) return json(res, 401, { erro: "Sessão expirada." });
    if (req.url === "/auth/me")
      return json(
        res,
        200,
        profileOverride ??
          (role === "funcionario"
            ? { perfil: role }
            : {
                id: 42,
                nome: "Pessoa",
                email: "pessoa@example.test",
                api_id: 8,
              }),
      );
    if (req.url === "/auth/logout") {
      sessions.delete(token);
      res.writeHead(204);
      return res.end();
    }
    return json(res, 404, {});
  });
  await new Promise((resolve) => upstream.listen(0, "127.0.0.1", resolve));
  process.env.SOULUP_PYTHON_API_URL = `http://127.0.0.1:${upstream.address().port}`;
  process.env.SOULUP_JAVA_API_URL = `${process.env.SOULUP_PYTHON_API_URL}/java`;
  server = createServer((req, res) =>
    req.url.startsWith("/api/acesso-funcionario")
      ? employeeAccess(req, res)
      : req.url.startsWith("/api/java/grupos") ? javaGroups(req, res)
      : auth(req, res),
  );
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
beforeEach(() => {
  calls = [];
  sessions = new Map();
  upstreamFailure = false;
  profileOverride = null;
  malformedToken = false;
  javaUsers = [];
  groupDeleteStatus = 204;
});
after(async () => {
  await Promise.all([
    new Promise((resolve) => server.close(resolve)),
    new Promise((resolve) => upstream.close(resolve)),
  ]);
  if (originalPython === undefined) delete process.env.SOULUP_PYTHON_API_URL;
  else process.env.SOULUP_PYTHON_API_URL = originalPython;
  if (originalJava === undefined) delete process.env.SOULUP_JAVA_API_URL;
  else process.env.SOULUP_JAVA_API_URL = originalJava;
});
const staffPath = "/api/acesso-funcionario";
const login = (senha = "12345678", path = staffPath) =>
  fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senha, email: "pessoa@example.test" }),
  });
const cookieOf = (response) => response.headers.get("set-cookie").split(";")[0];

test("group deletion rejects anonymous users, account sessions, expired sessions, and wrong roles", async () => {
  const path = base + staffPath + "?recurso=grupos&id=7";
  assert.equal((await fetch(path, { method: "DELETE" })).status, 401);
  const account = cookieOf(await login("12345678", "/api/auth/login"));
  assert.equal((await fetch(path, { method: "DELETE", headers: { Cookie: account } })).status, 401);
  const employee = cookieOf(await login());
  profileOverride = { perfil: "usuario" };
  assert.equal((await fetch(path, { method: "DELETE", headers: { Cookie: employee } })).status, 403);
  profileOverride = null;
  sessions.clear();
  assert.equal((await fetch(path, { method: "DELETE", headers: { Cookie: employee } })).status, 401);
  assert.ok(!calls.some((call) => call.path.startsWith("/java/grupos")));
});

test("verified employees delete a Java group without logging out", async () => {
  const cookie = cookieOf(await login());
  const response = await fetch(base + staffPath + "?recurso=grupos&id=7", { method: "DELETE", headers: { Cookie: cookie } });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { deleted: true });
  assert.equal(response.headers.get("set-cookie"), null);
  assert.deepEqual(calls.at(-1), { path: "/java/grupos?id=7", method: "DELETE", body: null, authorization: undefined });
  assert.equal((await fetch(base + staffPath, { headers: { Cookie: cookie } })).status, 200);
});

test("group deletion rejects cross-origin requests and invalid IDs before deleting upstream", async () => {
  const cookie = cookieOf(await login());
  for (const id of ["0", "-1", "7.5", "abc", "9007199254740992", ""]) {
    assert.equal((await fetch(base + staffPath + `?recurso=grupos&id=${id}`, { method: "DELETE", headers: { Cookie: cookie } })).status, 400);
  }
  assert.equal((await fetch(base + staffPath + "?recurso=grupos&id=7", { method: "DELETE", headers: { Cookie: cookie, Origin: "https://other.example" } })).status, 403);
  assert.ok(!calls.some((call) => call.path.startsWith("/java/grupos")));
});

test("Java deletion failures are not reported as successful", async () => {
  const cookie = cookieOf(await login());
  for (const status of [404, 409, 500]) {
    groupDeleteStatus = status;
    const response = await fetch(base + staffPath + "?recurso=grupos&id=7", { method: "DELETE", headers: { Cookie: cookie } });
    assert.equal(response.status, status === 500 ? 502 : status);
    assert.notEqual((await response.json()).deleted, true);
  }
});

test("the public Java proxy never forwards group deletion", async () => {
  assert.equal((await fetch(base + "/api/java/grupos?id=7", { method: "DELETE" })).status, 403);
  assert.equal(calls.length, 0);
});

test("anonymous employee access and Java user lookup require a verified Python session", async () => {
  assert.equal((await fetch(base + staffPath)).status, 401);
  assert.equal(
    (await fetch(base + staffPath + "?recurso=usuarios")).status,
    401,
  );
  assert.equal(calls.length, 0);
});

test("Python accepts 12345678 and no local nine-digit password overrides its decision", async () => {
  for (const password of ["123456789", "123456780", "12345678 ", ""]) {
    const response = await login(password);
    assert.equal(response.status, 401);
    assert.match(response.headers.get("set-cookie"), /Max-Age=0/);
  }
  const response = await login();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { authenticated: true });
  assert.equal(
    calls.filter((call) => call.path === "/auth/funcionarios").at(-1).body
      .senha,
    "12345678",
  );
});

test("upstream token stays in HttpOnly cookie and /auth/me confirms access after refresh", async () => {
  const response = await login();
  const cookie = response.headers.get("set-cookie");
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Max-Age=3600/);
  const token = cookieOf(response).split("=")[1];
  assert.ok(!JSON.stringify(await response.json()).includes(token));
  assert.equal(
    (await fetch(base + staffPath, { headers: { Cookie: cookieOf(response) } }))
      .status,
    200,
  );
  assert.equal(calls.at(-1).authorization, `Bearer ${token}`);
  assert.equal(
    (
      await fetch(base + staffPath, {
        headers: { Cookie: cookieOf(response) + "tampered" },
      })
    ).status,
    401,
  );
});

test("Python outages never become invalid-password errors or a local login fallback", async () => {
  upstreamFailure = true;
  const response = await login();
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.doesNotMatch((await response.json()).message, /incorret/);
});

test("wrong role or malformed upstream token never creates an employee session", async () => {
  profileOverride = { id: 42, nome: "Pessoa", email: "pessoa@example.test" };
  assert.equal((await login()).status, 403);
  profileOverride = null;
  malformedToken = true;
  const response = await login();
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("set-cookie"), null);
});

test("logout revokes the upstream token before clearing its cookie", async () => {
  const cookie = cookieOf(await login());
  const response = await fetch(base + staffPath, {
    method: "DELETE",
    headers: { Cookie: cookie },
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/);
  assert.equal(
    (await fetch(base + staffPath, { headers: { Cookie: cookie } })).status,
    401,
  );
});

test("employee user listing rejects invalid records instead of inventing IDs or profile data", async () => {
  const cookie = cookieOf(await login());
  for (const value of [
    { nome: "Sem ID", email: "a@example.test" },
    { id: 1, nome: "", email: "a@example.test" },
    { id: 1, nome: "Teste" },
  ]) {
    javaUsers = [value];
    assert.equal(
      (
        await fetch(base + staffPath + "?recurso=usuarios", {
          headers: { Cookie: cookie },
        })
      ).status,
      502,
    );
  }
  javaUsers = [{ id_usuario: 42, nome: "Teste", email: "a@example.test" }];
  assert.deepEqual(
    await (
      await fetch(base + staffPath + "?recurso=usuarios", {
        headers: { Cookie: cookie },
      })
    ).json(),
    [{ id: 42, nome: "Teste", email: "a@example.test" }],
  );
});

test("rejects cross-origin login, malformed JSON, and unsupported methods before contacting Python", async () => {
  assert.equal(
    (
      await fetch(base + staffPath, {
        method: "POST",
        headers: {
          Origin: "https://other.example",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ senha: "12345678" }),
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + staffPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      })
    ).status,
    400,
  );
  assert.equal((await fetch(base + staffPath, { method: "PUT" })).status, 405);
  assert.equal(calls.length, 0);
});

test("account login also bridges Bearer sessions without returning tokens or mixing employee cookies", async () => {
  const response = await login("12345678", "/api/auth/login");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    id: 42,
    nome: "Pessoa",
    email: "pessoa@example.test",
    api_id: 8,
  });
  const cookie = cookieOf(response);
  assert.match(cookie, /^soulup_account=/);
  assert.equal(
    (await fetch(base + "/api/auth/me", { headers: { Cookie: cookie } }))
      .status,
    200,
  );
  assert.equal(
    (await fetch(base + staffPath, { headers: { Cookie: cookie } })).status,
    401,
  );
  const logout = await fetch(base + "/api/auth/logout", {
    method: "POST",
    headers: { Cookie: cookie },
  });
  assert.equal(logout.status, 200);
  assert.equal(
    (await fetch(base + "/api/auth/me", { headers: { Cookie: cookie } }))
      .status,
    401,
  );
});

test("Vercel rewritten auth query selects the same login handler", async () => {
  assert.equal((await login("12345678", "/api/auth?action=login")).status, 200);
});
