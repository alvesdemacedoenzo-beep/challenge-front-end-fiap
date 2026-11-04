export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getApiUrl(path: string): URL {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const resolvedBaseUrl = new URL(normalizedBaseUrl, window.location.origin);
  return new URL(path.replace(/^\/+/, ""), resolvedBaseUrl);
}

async function request<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse | null> {
  const response = await fetch(getApiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new ApiError(
      responseText || `A API retornou o status ${response.status}.`,
      response.status,
    );
  }

  if (!responseText) return null;

  try {
    return JSON.parse(responseText) as TResponse;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "resposta inválida";
    throw new Error(`Não foi possível interpretar a resposta da API: ${reason}`);
  }
}

export function apiGet<TResponse>(path: string): Promise<TResponse | null> {
  return request<TResponse>(path);
}

export function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
  init?: RequestInit,
): Promise<TResponse | null> {
  return request<TResponse>(path, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: JSON.stringify(body),
  });
}

export function apiPut<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse | null> {
  return request<TResponse>(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function apiPatch<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse | null> {
  return request<TResponse>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function apiDelete(path: string): Promise<null> {
  return request<never>(path, { method: "DELETE" });
}

export type AccountCredentials = {
  email: string;
  senha: string;
};

export type CreateUserRequest = {
  nome: string;
  email: string;
  senha: string;
};

export type RegisterAccountRequest = AccountCredentials & {
  nome: string;
};

// ----------------------------------------------------
// MODELOS DE DATOS (Mapeados con Oracle DB)
// ----------------------------------------------------

export type AccountUser = {
  id: number;
  nome: string;
  email: string;
  pontosAcumulados: number; 
};

export type ApiUser = Pick<AccountUser, "id" | "nome" | "email"> & {
  pontosAcumulados?: number;
};

export type CreateGroupRequest = {
  nome: string;
};

export type ApiGroup = {
  id: number;
  nome: string;
  dataCriacao?: string;
  pontosAcumulados?: number;
  membros?: ApiUser[];
  nivel?: string;
};

export type ApiChallenge = {
  id: number;
  titulo: string;
  descricao: string;
  pontos: number;
  categoria: string;
};


const accountStorageKey = "soul-up:account";

export function getStoredAccount(): AccountUser | null {
  const storedAccount = sessionStorage.getItem(accountStorageKey);
  if (!storedAccount) return null;

  try {
    const parsedAccount = JSON.parse(storedAccount);
    return {
      id: parsedAccount.id,
      nome: parsedAccount.nome,
      email: parsedAccount.email,
      pontosAcumulados: parsedAccount.pontosAcumulados ?? 0,
    };
  } catch {
    sessionStorage.removeItem(accountStorageKey);
    return null;
  }
}

export function storeAccount(account: AccountUser): void {
  sessionStorage.setItem(accountStorageKey, JSON.stringify(account));
}

export function clearStoredAccount(): void {
  sessionStorage.removeItem(accountStorageKey);
}


export function registerAccount(
  account: RegisterAccountRequest,
): Promise<AccountUser | null> {
  return apiPost<AccountUser, RegisterAccountRequest>("/usuarios", account);
}

export async function login(
  credentials: AccountCredentials,
): Promise<AccountUser | null> {
  try {
    // 1. Intenta consultar el servicio Python en /auth/login
    const pythonResponse = await apiPost<AccountUser, AccountCredentials>(
      "/auth/login",
      credentials,
      { credentials: "include" }
    );
    if (pythonResponse) {
      storeAccount(pythonResponse);
      return pythonResponse;
    }
  } catch {
    
    const users = await listUsers();
    const matchedUser = users.find(
      (u) => u.email.trim().toLowerCase() === credentials.email.trim().toLowerCase()
    );

    if (!matchedUser) {
      throw new ApiError("E-mail ou senha incorretos.", 401);
    }

    const account: AccountUser = {
      id: matchedUser.id,
      nome: matchedUser.nome,
      email: matchedUser.email,
      pontosAcumulados: matchedUser.pontosAcumulados ?? 0,
    };
    storeAccount(account);
    return account;
  }

  throw new ApiError("Erro ao autenticar usuário.", 401);
}

export async function getCurrentAccount(): Promise<AccountUser | null> {
  return getStoredAccount();
}

export async function logout(): Promise<null> {
  try {
    await request<never>("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } finally {
    clearStoredAccount();
  }
  return null;
}



function parseApiUser(user: any, index: number): ApiUser {
  return {
    id: user.id ?? user.id_usuario ?? index + 1,
    nome: user.nome || "Usuário sem nome",
    email: user.email || "Sem e-mail",
    pontosAcumulados: user.pontos_acumulados ?? user.pontosAcumulados ?? user.pontos ?? 0,
  };
}

export async function listUsers(): Promise<ApiUser[]> {
  const response = await apiGet<unknown>("/usuarios");
  if (!Array.isArray(response)) {
    throw new Error("A API não retornou uma lista de usuários válida.");
  }
  return response.map(parseApiUser);
}

export function deleteUser(id: number): Promise<null> {
  return apiDelete(`/usuarios/${id}`);
}



export function createGroup(group: CreateGroupRequest): Promise<ApiGroup | null> {
  return apiPost<ApiGroup, CreateGroupRequest>("/grupos", group);
}

export async function listGroups(): Promise<ApiGroup[]> {
  const response = await apiGet<unknown>("/grupos");
  if (!Array.isArray(response)) {
    throw new Error("A API não retornou uma lista de grupos válida.");
  }
  return response.map((group: any, index: number) => ({
    id: group.id ?? group.id_grupo ?? index + 1,
    nome: group.nome || "Grupo sem nome",
    dataCriacao: group.dataCriacao || group.data_criacao || new Date().toLocaleDateString("pt-BR"),
    pontosAcumulados: group.pontos_acumulados ?? group.pontosAcumulados ?? group.pontos ?? 0,
  }));
}

export function deleteGroup(id: number): Promise<null> {
  return apiDelete(`/grupos/${id}`);
}


export async function listChallenges(): Promise<ApiChallenge[]> {
  const response = await apiGet<unknown>("/desafios");
  if (!Array.isArray(response)) {
    throw new Error("A API não retornou uma lista de desafios válida.");
  }
  return response.map((d: any) => ({
    id: d.id ?? d.id_desafio,
    titulo: d.titulo || "Desafio sem título",
    descricao: d.descricao || "",
    pontos: d.pontos ?? 0,
    categoria: d.categoria || "Geral",
  }));
}

export function concluirDesafioApi(idUsuario: number, idDesafio: number, pontos: number): Promise<string | null> {
  return apiPost<string, any>(`/acoes/concluir?idUsuario=${idUsuario}&idDesafio=${idDesafio}&pontos=${pontos}`, {});
}

export function resgatarRecompensaApi(idUsuario: number, custo: number): Promise<string | null> {
  return apiPost<string, any>(`/recompensas/resgatar?idUsuario=${idUsuario}&custo=${custo}`, {});
}

export type ApiEmpresa = { id: number; nome: string; endereco: string; };

export async function listEmpresas(): Promise<ApiEmpresa[]> {
  try {
    const response = await apiGet<unknown>("/empresas");
    if (!Array.isArray(response)) return [];
    return response.map((emp: any) => ({
      id: emp.id ?? emp.id_empresa,
      nome: emp.nome || "Empresa Parceira",
      endereco: emp.endereco || "",
    }));
  } catch (error) {
    return []; 
  }
}
