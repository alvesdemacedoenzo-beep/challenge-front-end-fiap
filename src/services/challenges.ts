import type { AccountUser, ApiChallenge } from "./api";

export type SustainableChallenge = {
  id: number;
  category: string;
  description: string;
  points: number;
  active?: boolean;
};

export const sustainableChallenges: SustainableChallenge[] = [
  {
    id: 1,
    category: "Reciclagem",
    description: "Separar resíduos recicláveis por 5 dias",
    points: 100,
  },
  {
    id: 2,
    category: "Limpeza de Praças",
    description: "Participar da limpeza de uma praça local",
    points: 250,
  },
  {
    id: 3,
    category: "Economia de Energia",
    description: "Desligar aparelhos sem uso durante uma semana",
    points: 150,
  },
  {
    id: 4,
    category: "Plantio de Árvores",
    description: "Plantar uma árvore em local permitido",
    points: 300,
  },
  {
    id: 5,
    category: "Reciclagem",
    description: "Separar plástico, papel e vidro corretamente",
    points: 120,
  },
  {
    id: 6,
    category: "Economia de Energia",
    description: "Trocar lâmpadas comuns por LED",
    points: 180,
  },
];

function getStorageKey(userId: number | null): string {
  return `soul-up:completed-challenges:${userId ?? "visitante"}`;
}

export type LocalAction = {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  challengeId: number;
  challengeSource?: "java";
  description: string;
  evidence: string;
  evidenceImage?: string;
  points: number;
  status: "pendente" | "aprovada" | "rejeitada";
  opinion: string;
  createdAt: string;
};

const challengesKey = "soul-up:managed-challenges";
const actionsKey = "soul-up:actions";

export function getLocalChallenges(): SustainableChallenge[] {
  const stored = localStorage.getItem(challengesKey);
  if (!stored)
    return sustainableChallenges.map((challenge) => ({
      ...challenge,
      active: true,
    }));
  const parsed: unknown = JSON.parse(stored);
  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (item) =>
        item &&
        Number.isSafeInteger(item.id) &&
        typeof item.description === "string" &&
        typeof item.category === "string" &&
        Number.isInteger(item.points) &&
        item.points > 0 &&
        typeof item.active === "boolean",
    )
  ) {
    throw new Error("Não foi possível ler os desafios locais salvos.");
  }
  return parsed;
}

export function createLocalChallenge(
  description: string,
  category: string,
  points: number,
) {
  if (
    description.trim().length < 5 ||
    category.trim().length < 3 ||
    !Number.isInteger(points) ||
    points < 1 ||
    points > 10000
  ) {
    throw new Error(
      "Informe descrição com pelo menos 5 caracteres, categoria com pelo menos 3 e pontos inteiros entre 1 e 10000.",
    );
  }
  const challenges = getLocalChallenges();
  const challenge = {
    id: Math.max(0, ...challenges.map((item) => item.id)) + 1,
    description: description.trim(),
    category: category.trim(),
    points,
    active: true,
  };
  localStorage.setItem(
    challengesKey,
    JSON.stringify([...challenges, challenge]),
  );
  return challenge;
}

export function toggleLocalChallenge(id: number) {
  const challenges = getLocalChallenges();
  if (!challenges.some((challenge) => challenge.id === id))
    throw new Error("Desafio não encontrado.");
  localStorage.setItem(
    challengesKey,
    JSON.stringify(
      challenges.map((challenge) =>
        challenge.id === id
          ? { ...challenge, active: !challenge.active }
          : challenge,
      ),
    ),
  );
}

export function getLocalActions(): LocalAction[] {
  const stored = localStorage.getItem(actionsKey);
  if (!stored) return [];
  const parsed: unknown = JSON.parse(stored);
  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (item) =>
        item &&
        Number.isSafeInteger(item.id) &&
        Number.isSafeInteger(item.userId) &&
        Number.isSafeInteger(item.challengeId) &&
        (item.challengeSource === undefined ||
          item.challengeSource === "java") &&
        typeof item.userName === "string" &&
        typeof item.userEmail === "string" &&
        typeof item.description === "string" &&
        typeof item.evidence === "string" &&
        typeof item.opinion === "string" &&
        typeof item.createdAt === "string" &&
        Number.isInteger(item.points) &&
        item.points >= 0 &&
        ["pendente", "aprovada", "rejeitada"].includes(item.status),
    )
  ) {
    throw new Error("Não foi possível ler as ações locais salvas.");
  }
  return parsed;
}

export function publishLocalAction(
  account: AccountUser,
  challengeId: number,
  evidence: string,
  evidenceImage?: string,
) {
  const challenge = getLocalChallenges().find(
    (item) => item.id === challengeId && item.active,
  );
  if (!challenge) throw new Error("Desafio ativo não encontrado.");
  return saveLocalAction(account, challenge, evidence, evidenceImage);
}

export function publishApiChallengeAction(
  account: AccountUser,
  challenge: ApiChallenge,
  evidence: string,
  evidenceImage?: string,
) {
  return saveLocalAction(
    account,
    {
      id: challenge.id,
      description: `${challenge.titulo}: ${challenge.descricao}`,
      points: challenge.pontos,
    },
    evidence,
    evidenceImage,
    "java",
  );
}

function saveLocalAction(
  account: AccountUser,
  challenge: Pick<SustainableChallenge, "id" | "description" | "points">,
  evidence: string,
  evidenceImage?: string,
  source?: "java",
) {
  if (evidence.trim().length < 5)
    throw new Error("Descreva a evidência com pelo menos 5 caracteres.");
  if (
    evidenceImage &&
    !/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(
      evidenceImage,
    )
  )
    throw new Error("Formato da foto inválido.");
  const actions = getLocalActions();
  if (
    actions.some(
      (action) =>
        action.userId === account.id &&
        action.challengeId === challenge.id &&
        action.challengeSource === source,
    )
  ) {
    throw new Error("Você já enviou uma ação para este desafio.");
  }
  const action: LocalAction = {
    id: Math.max(0, ...actions.map((item) => item.id)) + 1,
    userId: account.id,
    userName: account.nome,
    userEmail: account.email,
    challengeId: challenge.id,
    ...(source ? { challengeSource: source } : {}),
    description: challenge.description,
    evidence: evidence.trim(),
    evidenceImage,
    points: challenge.points,
    status: "pendente",
    opinion: "",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(actionsKey, JSON.stringify([...actions, action]));
  return action;
}

export function decideLocalAction(
  id: number,
  approve: boolean,
  opinion: string,
) {
  if (opinion.trim().length < 5)
    throw new Error(
      "Descreva o motivo da decisão com pelo menos 5 caracteres.",
    );
  const actions = getLocalActions();
  const action = actions.find(
    (item) => item.id === id && item.status === "pendente",
  );
  if (!action) throw new Error("Ação pendente não encontrada ou já analisada.");
  localStorage.setItem(
    actionsKey,
    JSON.stringify(
      actions.map((item) =>
        item.id === id
          ? {
              ...item,
              status: approve ? "aprovada" : "rejeitada",
              opinion: opinion.trim(),
            }
          : item,
      ),
    ),
  );
}

export function getLocalRanking() {
  const ranking = new Map<
    number,
    { userId: number; name: string; points: number }
  >();
  for (const action of getLocalActions()) {
    const entry = ranking.get(action.userId) ?? {
      userId: action.userId,
      name: action.userName,
      points: 0,
    };
    if (action.status === "aprovada") entry.points += action.points;
    ranking.set(action.userId, entry);
  }
  return [...ranking.values()].sort(
    (a, b) => b.points - a.points || a.name.localeCompare(b.name, "pt-BR"),
  );
}

export function getCompletedChallengeIds(userId: number | null): number[] {
  const storedValue = localStorage.getItem(getStorageKey(userId));
  const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : [];
  if (
    !Array.isArray(parsedValue) ||
    !parsedValue.every((id) => typeof id === "number")
  ) {
    throw new Error("Não foi possível ler os desafios concluídos salvos.");
  }

  return [
    ...new Set([
      ...parsedValue,
      ...getLocalActions()
        .filter(
          (action) => action.userId === userId && action.status === "aprovada",
        )
        .map((action) => action.challengeId),
    ]),
  ];
}

export function getChallengePoints(completedIds: number[]): number {
  return getLocalChallenges().reduce(
    (total, challenge) =>
      completedIds.includes(challenge.id) ? total + challenge.points : total,
    0,
  );
}

export function getApprovedActionPoints(userId: number): number {
  return getLocalActions()
    .filter(
      (action) => action.userId === userId && action.status === "aprovada",
    )
    .reduce((total, action) => total + action.points, 0);
}

export function getCompletedApiChallengeIds(userId: number | null): number[] {
  return getLocalActions()
    .filter(
      (action) =>
        action.userId === userId &&
        action.challengeSource === "java" &&
        action.status === "aprovada",
    )
    .map((action) => action.challengeId);
}
