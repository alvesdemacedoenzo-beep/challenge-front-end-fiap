import { ApiError, parseApiUser } from "./api.ts";
import type { ApiUser } from "./api";

async function employeeRequest<T>(
  method = "GET",
  senha?: string,
  resource = "",
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/acesso-funcionario${resource}`, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      signal: AbortSignal.timeout(resource ? 90000 : 60000),
      ...(senha !== undefined
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senha }),
          }
        : {}),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor do site. Atualize a página e tente novamente.",
    );
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(
      "O servidor do site não retornou uma resposta válida. Atualize a página e tente novamente.",
    );
  }
  if (!response.ok)
    throw new ApiError(
      body &&
        typeof body === "object" &&
        "message" in body &&
        typeof body.message === "string"
        ? body.message
        : "Não foi possível acessar a área de funcionários.",
      response.status,
    );
  return body as T;
}

function requireEmployeeSession(body: unknown): void {
  if (
    !body ||
    typeof body !== "object" ||
    !("authenticated" in body) ||
    body.authenticated !== true
  ) {
    throw new Error(
      "O servidor não confirmou a sessão de funcionário. Tente entrar novamente.",
    );
  }
}

export async function checkEmployeeAccess(): Promise<boolean> {
  try {
    requireEmployeeSession(await employeeRequest("GET"));
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return false;
    throw error;
  }
}

export async function loginEmployee(password: string): Promise<void> {
  requireEmployeeSession(await employeeRequest("POST", password));
}
export const logoutEmployee = () => employeeRequest("DELETE");
export async function listEmployeeUsers(): Promise<ApiUser[]> {
  const body = await employeeRequest<unknown>(
    "GET",
    undefined,
    "?recurso=usuarios",
  );
  if (!Array.isArray(body))
    throw new Error("O servidor não retornou uma lista de usuários válida.");
  return body.map(parseApiUser);
}
