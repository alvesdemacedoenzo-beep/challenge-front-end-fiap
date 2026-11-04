import { ApiError } from "./api";
import type { ApiUser } from "./api";

async function employeeRequest<T>(
  method = "GET",
  senha?: string,
  resource = "",
): Promise<T> {
  const response = await fetch(`/api/acesso-funcionario${resource}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    ...(senha !== undefined
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senha }),
        }
      : {}),
  });
  const body = await response.json();
  if (!response.ok)
    throw new ApiError(
      body.message || "Não foi possível acessar a área de funcionários.",
      response.status,
    );
  return body as T;
}

export async function checkEmployeeAccess(): Promise<boolean> {
  try {
    await employeeRequest("GET");
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return false;
    throw error;
  }
}

export const loginEmployee = (password: string) =>
  employeeRequest("POST", password);
export const logoutEmployee = () => employeeRequest("DELETE");
export const listEmployeeUsers = () =>
  employeeRequest<ApiUser[]>("GET", undefined, "?recurso=usuarios");
