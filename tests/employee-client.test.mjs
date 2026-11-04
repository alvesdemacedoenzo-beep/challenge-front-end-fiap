import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  checkEmployeeAccess,
  loginEmployee,
  listEmployeeUsers,
} from "../src/services/employee.ts";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("network failure is explained without exposing Failed to fetch or blaming the password", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new TypeError("Failed to fetch");
  };
  await assert.rejects(
    loginEmployee("12345678"),
    (error) =>
      /conectar ao servidor do site/.test(error.message) &&
      !/Failed to fetch|senha incorreta/i.test(error.message),
  );
  assert.equal(calls, 1);
});

test("only an explicit authenticated session is accepted, even with HTTP 200", async () => {
  for (const body of [null, {}, { authenticated: false }]) {
    globalThis.fetch = async () => Response.json(body);
    await assert.rejects(loginEmployee("12345678"), /não confirmou a sessão/);
    await assert.rejects(checkEmployeeAccess(), /não confirmou a sessão/);
  }
  globalThis.fetch = async () => Response.json({ authenticated: true });
  assert.equal(await checkEmployeeAccess(), true);
});

test("an expired session is distinguished from a server outage or invalid response", async () => {
  globalThis.fetch = async () =>
    Response.json({ message: "Sessão expirada." }, { status: 401 });
  assert.equal(await checkEmployeeAccess(), false);
  globalThis.fetch = async () =>
    Response.json({ message: "API Python indisponível." }, { status: 503 });
  await assert.rejects(checkEmployeeAccess(), /API Python indisponível/);
  globalThis.fetch = async () => new Response("<html>Erro de proxy</html>");
  await assert.rejects(checkEmployeeAccess(), /resposta válida/);
});

test("employee user listing validates server records instead of accepting fabricated data", async () => {
  globalThis.fetch = async () =>
    Response.json([{ nome: "Sem ID", email: "teste@example.test" }]);
  await assert.rejects(listEmployeeUsers(), /identificador inválido/);
});
