import assert from "node:assert/strict";
import { beforeEach, afterEach, test } from "node:test";
import {
  ApiError,
  login,
  logout,
  registerAccount,
  listChallenges,
  getCurrentAccount,
  getStoredAccount,
  listUsers,
  getUser,
  listGroups,
  getGroup,
  createGroup,
  deleteUser,
  deleteGroup,
  createUser,
  updateUser,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  parseApiUser,
} from "../src/services/api.ts";

const originalFetch = globalThis.fetch;
const storage = new Map();
Object.defineProperty(globalThis, "sessionStorage", {
  value: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
  configurable: true,
});
globalThis.window = { location: { origin: "http://localhost:5173" } };
const user = {
  id: 1,
  nome: "Ana",
  email: "ana@example.test",
  pontosAdquiridos: 100,
};
const group = { id: 7, nome: "Guardiões", membros: [user] };
let calls;
beforeEach(() => {
  storage.clear();
  calls = [];
});
afterEach(() => {
  globalThis.fetch = originalFetch;
});
function mock(responses) {
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), ...options });
    const next = responses.shift();
    assert.ok(next, "Requisição adicional inesperada");
    return new Response(
      next.status === 204
        ? null
        : next.body === undefined
          ? ""
          : JSON.stringify(next.body),
      { status: next.status ?? 200 },
    );
  };
}

test("wrong password never falls back to a public email lookup", async () => {
  mock([{ status: 401, body: { message: "invalid" } }]);
  await assert.rejects(
    login({ email: user.email, senha: "wrong-password" }),
    (error) => error instanceof ApiError && error.status === 401,
  );
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /auth\/login$/);
  assert.equal(getStoredAccount(), null);
});
test("missing auth route fails closed without an email-only fallback", async () => {
  mock([{ status: 404 }]);
  await assert.rejects(
    login({ email: user.email, senha: "any-password" }),
    /ainda não disponibiliza autenticação/,
  );
  assert.equal(calls.length, 1);
});
test("successful login must also be confirmed by the server session endpoint", async () => {
  mock([{ body: user }, { body: user }]);
  assert.deepEqual(
    await login({ email: user.email, senha: "correct-password" }),
    user,
  );
  assert.match(calls[1].url, /auth\/me$/);
  assert.equal(calls[0].credentials, "include");
  assert.deepEqual(getStoredAccount(), user);
  assert.equal(calls[0].url, "http://localhost:5173/api/auth/login");
  assert.equal(calls[1].url, "http://localhost:5173/api/auth/me");
});

test("Python account session stays independent from Java users and challenge catalog", async () => {
  const account = { ...user, id: 42 };
  mock([
    { body: account },
    { body: account },
    { body: account },
    { body: [user] },
    { body: [] },
    { status: 204 },
  ]);
  const credentials = {
    nome: account.nome,
    email: account.email,
    senha: "correct-password",
  };
  assert.equal((await registerAccount(credentials)).id, 42);
  await login(credentials);
  assert.equal((await listUsers())[0].id, 1);
  assert.equal(getStoredAccount().id, 42);
  assert.deepEqual(await listChallenges(), []);
  await logout();
  assert.equal(getStoredAccount(), null);
  assert.deepEqual(
    calls.map((call) => new URL(call.url).pathname),
    [
      "/api/usuarios",
      "/api/auth/login",
      "/api/auth/me",
      "/api/java/usuarios",
      "/api/java/desafios",
      "/api/auth/logout",
    ],
  );
  assert.deepEqual(JSON.parse(calls[0].body), credentials);
  assert.ok(
    calls
      .filter((call) => !call.url.includes("/java/"))
      .every((call) => call.credentials === "include"),
  );
  assert.equal(calls[3].credentials, "omit");
});
test("a login response without an authenticated session does not log in", async () => {
  mock([{ body: user }, { status: 401 }]);
  await assert.rejects(
    login({ email: user.email, senha: "incorrect-password" }),
  );
  assert.equal(getStoredAccount(), null);
});
test("a forged local account does not authenticate the user", async () => {
  storage.set("soul-up:account:v2", JSON.stringify(user));
  mock([{ status: 401 }]);
  assert.equal(await getCurrentAccount(), null);
  assert.equal(getStoredAccount(), null);
});
test("user and group details are selected from current API records, including 404", async () => {
  mock([{ body: [user] }, { body: [group] }, { body: [] }]);
  assert.deepEqual(await getUser(1), user);
  assert.equal((await getGroup(7)).membros[0].id, 1);
  await assert.rejects(getUser(999), (error) => error.status === 404);
  assert.deepEqual(
    calls.map((call) => new URL(call.url).pathname),
    ["/api/java/usuarios", "/api/java/grupos", "/api/java/usuarios"],
  );
});
test("rejects malformed lists and records instead of fabricating IDs or dates", async () => {
  mock([
    { body: [{ nome: "Sem ID", email: user.email }] },
    { body: null },
    { body: [{ id: 7, nome: "Grupo" }] },
  ]);
  await assert.rejects(listUsers(), /identificador inválido/);
  await assert.rejects(listGroups(), /lista válida/);
  assert.equal((await listGroups())[0].dataCriacao, undefined);
});
test("backend failures remain failures and do not become empty lists", async () => {
  mock([{ status: 500, body: "sensitive SQL error" }]);
  await assert.rejects(
    listUsers(),
    (error) => error.status === 500 && !error.message.includes("SQL"),
  );
});
test("group creation sends selected members and verifies a real identifier", async () => {
  mock([{ status: 201, body: group }]);
  assert.equal(
    (await createGroup({ nome: group.nome, membros: [{ id: 1 }] })).id,
    7,
  );
  assert.deepEqual(JSON.parse(calls[0].body).membros, [{ id: 1 }]);
  assert.equal(calls[0].url, "http://localhost:5173/api/java/grupos");
  assert.equal(calls[0].credentials, "omit");
});
test("deletion follows the Java query parameter contract", async () => {
  mock([{ status: 204 }, { status: 204 }, { status: 204 }]);
  await deleteUser(1);
  await deleteGroup(7);
  await deleteChallenge(9);
  assert.equal(calls[0].url, "http://localhost:5173/api/java/usuarios?id=1");
  assert.equal(calls[1].url, "http://localhost:5173/api/java/grupos?id=7");
  assert.equal(calls[2].url, "http://localhost:5173/api/java/desafios?id=9");
  assert.ok(calls.every((call) => call.method === "DELETE"));
});

test("accepts Java user score names without losing accumulated points", () => {
  assert.equal(
    parseApiUser({ ...user, pontosAcumulados: 230 }).pontosAdquiridos,
    230,
  );
  assert.equal(
    parseApiUser({ ...user, pontos_acumulados: 120 }).pontosAdquiridos,
    120,
  );
});

test("Java user creation sends credentials once and verifies the persisted user", async () => {
  mock([{ status: 201, body: user }, { body: [user] }]);
  assert.deepEqual(
    await createUser({
      nome: " Ana ",
      email: " ANA@example.test ",
      senha: "correct-password",
    }),
    user,
  );
  assert.equal(calls[0].url, "http://localhost:5173/api/java/usuarios");
  assert.equal(calls[0].method, "POST");
  assert.deepEqual(JSON.parse(calls[0].body), {
    nome: "Ana",
    email: user.email,
    senha: "correct-password",
  });
  assert.equal(calls[1].method, undefined);
  assert.equal(getStoredAccount(), null);
});

test("Java user update uses collection PUT and confirms real data instead of echoed success", async () => {
  const updated = { ...user, nome: "Ana Nova" };
  mock([{ body: updated }, { body: [updated] }]);
  assert.deepEqual(
    await updateUser(1, { nome: updated.nome, email: updated.email }),
    updated,
  );
  assert.equal(calls[0].url, "http://localhost:5173/api/java/usuarios");
  assert.equal(calls[0].method, "PUT");
  assert.deepEqual(JSON.parse(calls[0].body), {
    id: 1,
    nome: updated.nome,
    email: updated.email,
  });
  mock([{ body: updated }, { body: [user] }]);
  await assert.rejects(updateUser(1, updated), /alteração não foi confirmada/);
});

const challenge = {
  id: 9,
  titulo: "Reciclagem Básica",
  descricao: "Separar os resíduos",
  pontos: 50,
  categoria: "Reciclagem",
};
const { id: challengeId, ...challengeFields } = challenge;

test("challenge creation resolves the ID from persisted Java data when POST returns zero", async () => {
  mock([
    { body: [] },
    { status: 201, body: { ...challenge, id: 0 } },
    { body: [challenge] },
  ]);
  assert.deepEqual(await createChallenge(challengeFields), challenge);
  assert.deepEqual(
    calls.map((call) => call.method ?? "GET"),
    ["GET", "POST", "GET"],
  );
  assert.ok(
    calls.every(
      (call) => call.url === "http://localhost:5173/api/java/desafios",
    ),
  );
  assert.deepEqual(JSON.parse(calls[1].body), challengeFields);
});

test("challenge creation never fabricates an ID or repeats POST when persistence is uncertain", async () => {
  for (const persisted of [[], [challenge, { ...challenge, id: 10 }]]) {
    calls = [];
    mock([
      { body: [] },
      { status: 201, body: { ...challenge, id: 0 } },
      { body: persisted },
    ]);
    await assert.rejects(
      createChallenge(challengeFields),
      /Consulte a lista antes de repetir/,
    );
    assert.equal(calls.filter((call) => call.method === "POST").length, 1);
  }
});

test("unavailable challenge catalog prevents POST and invalid forms never make requests", async () => {
  mock([{ status: 503, body: {} }]);
  await assert.rejects(
    createChallenge(challengeFields),
    (error) => error.status === 503,
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, undefined);
  calls = [];
  for (const pontos of [0, -1, 1.5, NaN])
    await assert.rejects(
      createChallenge({ ...challengeFields, pontos }),
      /pontos inteiros/,
    );
  await assert.rejects(
    createUser({ nome: " ", email: user.email, senha: "correct-password" }),
  );
  assert.equal(calls.length, 0);
});

test("challenge PUT includes its ID and success requires matching persisted fields", async () => {
  const updated = { ...challenge, pontos: 80 };
  mock([{ body: updated }, { body: [updated] }]);
  assert.deepEqual(await updateChallenge(challengeId, updated), updated);
  assert.equal(calls[0].method, "PUT");
  assert.equal(calls[0].url, "http://localhost:5173/api/java/desafios");
  assert.deepEqual(JSON.parse(calls[0].body), updated);
  mock([{ body: updated }, { body: [challenge] }]);
  await assert.rejects(
    updateChallenge(challengeId, updated),
    /alteração do desafio não foi confirmada/,
  );
});

test("Java challenge responses require title, valid ID and integer points", async () => {
  for (const value of [
    { ...challenge, titulo: undefined },
    { ...challenge, id: 0 },
    { ...challenge, pontos: 1.2 },
  ]) {
    mock([{ body: [value] }]);
    await assert.rejects(listChallenges());
  }
});

test("follow-up GET failures clearly warn that POST may already have persisted", async () => {
  mock([
    { body: [] },
    { status: 201, body: { ...challenge, id: 0 } },
    { status: 503, body: {} },
  ]);
  await assert.rejects(
    createChallenge(challengeFields),
    /Não repita a operação antes de atualizar/,
  );
  assert.equal(calls.filter((call) => call.method === "POST").length, 1);
});
