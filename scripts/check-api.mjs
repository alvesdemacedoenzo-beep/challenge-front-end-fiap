import { loadEnv } from "vite";

const environment = {
  ...loadEnv("production", process.cwd(), ""),
  ...process.env,
};
const bases = {
  python: (
    environment.SOULUP_PYTHON_API_URL ||
    "https://soulup-api-python.onrender.com"
  ).replace(/\/$/, ""),
  java: (
    environment.SOULUP_JAVA_API_URL ||
    environment.SOULUP_API_URL ||
    "https://challeng-sprin4-java.onrender.com"
  ).replace(/\/$/, ""),
};
const endpoints = [
  { backend: "python", path: "/", expectedStatus: 200 },
  { backend: "python", path: "/desafios", expectedStatus: 200 },
  // Sem credenciais, a resposta correta é uma sessão não autenticada.
  { backend: "python", path: "/auth/me", expectedStatus: 401 },
  { backend: "java", path: "/usuarios", expectedStatus: 200 },
  { backend: "java", path: "/grupos", expectedStatus: 200 },
  { backend: "java", path: "/desafios", expectedStatus: 200 },
];
if (process.argv.includes("--discover")) {
  endpoints.push(
    { backend: "python", path: "/openapi.json", expectedStatus: [200, 404] },
    { backend: "java", path: "/v3/api-docs", expectedStatus: [200, 404] },
    { backend: "java", path: "/swagger.json", expectedStatus: [200, 404] },
  );
}
const results = await Promise.all(
  endpoints.map(async ({ backend, path, expectedStatus }) => {
    try {
      const response = await fetch(`${bases[backend]}${path}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(45000),
      });
      const content = await response.text();
      let body;
      try {
        body = JSON.parse(content);
      } catch {
        /* Pode retornar HTML em caso de falha. */
      }
      const validStatus = (
        Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus]
      ).includes(response.status);
      return {
        backend,
        path,
        status: response.status,
        json: body !== undefined,
        ok: validStatus && body !== undefined,
        ...(Array.isArray(body) ? { registros: body.length } : {}),
        ...(body?.paths ? { endpoints: Object.keys(body.paths) } : {}),
      };
    } catch (cause) {
      return {
        backend,
        path,
        ok: false,
        error: cause.message,
        cause: cause.cause?.code,
      };
    }
  }),
);
console.log(JSON.stringify({ bases, results }, null, 2));
if (results.some((result) => !result.ok)) process.exitCode = 1;
