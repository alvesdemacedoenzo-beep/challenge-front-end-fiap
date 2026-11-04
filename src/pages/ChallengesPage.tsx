import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import {
  getChallenge,
  getCurrentAccount,
  listChallenges,
} from "../services/api";
import RequestFeedback from "../components/RequestFeedback";
import useApiList from "../hooks/useApiList";
import { useAuth } from "../contexts/AuthContext";
import {
  getCompletedApiChallengeIds,
  getApprovedActionPoints,
  getLocalActions,
  publishApiChallengeAction,
} from "../services/challenges";

export default function ChallengesPage() {
  const location = useLocation();
  const {
    items: challenges,
    loading,
    error: catalogError,
    reload,
  } = useApiList(listChallenges);
  const [actions, setActions] = useState<ReturnType<typeof getLocalActions>>(
    [],
  );
  const initialChallengeId =
    typeof location.state === "object" &&
    location.state !== null &&
    "challengeId" in location.state &&
    typeof location.state.challengeId === "number" &&
    Number.isSafeInteger(location.state.challengeId) &&
    location.state.challengeId > 0
      ? location.state.challengeId
      : null;
  const { user: account, errorMessage: accountNotice } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(
    initialChallengeId,
  );
  const [startedChallengeId, setStartedChallengeId] = useState<number | null>(
    null,
  );
  const [evidence, setEvidence] = useState<File | null>(null);
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [localPoints, setLocalPoints] = useState(0);

  useEffect(() => {
    try {
      setActions(getLocalActions());
      setCompletedIds(getCompletedApiChallengeIds(account?.id ?? null));
      setLocalPoints(account ? getApprovedActionPoints(account.id) : 0);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível ler seu progresso.",
      );
    }
  }, [account]);

  const selectedChallenge = challenges.find(
    (challenge) => challenge.id === selectedId,
  );
  const submittedAction = actions.find(
    (action) =>
      action.userId === account?.id &&
      action.challengeId === selectedId &&
      action.challengeSource === "java",
  );

  const selectEvidence = (event: ChangeEvent<HTMLInputElement>) => {
    setEvidence(event.target.files?.[0] ?? null);
    setErrorMessage("");
    setSavedMessage("");
  };

  const submitChallenge = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!selectedChallenge) return;
    if (!account) {
      setErrorMessage("Entre na sua conta para publicar uma ação.");
      return;
    }
    if (!evidence) {
      setErrorMessage("Selecione uma foto como evidência antes de concluir.");
      return;
    }
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        evidence.type,
      ) ||
      evidence.size > 2 * 1024 * 1024
    ) {
      setErrorMessage(
        "Selecione uma imagem JPG, PNG, WebP ou GIF de até 2 MB.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const verified = await getCurrentAccount();
      if (!verified || verified.id !== account.id)
        throw new Error(
          "Sua sessão expirou. Entre novamente antes de publicar.",
        );
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () =>
          reject(new Error("Não foi possível ler a foto selecionada."));
        reader.readAsDataURL(evidence);
      });
      const currentChallenge = await getChallenge(selectedChallenge.id);
      publishApiChallengeAction(
        account,
        currentChallenge,
        evidenceDescription,
        image,
      );
      setActions(getLocalActions());
      setSavedMessage(
        "Ação enviada! Aguarde a aprovação de um funcionário para receber os pontos.",
      );
      setEvidence(null);
      setEvidenceDescription("");
      setErrorMessage("");
      form.reset();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a ação. O armazenamento deste navegador pode estar cheio.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="Ação sustentável"
        title="Desafios sustentáveis"
        description="Escolha uma atividade, descreva sua ação e envie uma foto como evidência. Os pontos são liberados após a aprovação de um funcionário."
      />

      <RequestFeedback
        loading={loading}
        error={catalogError}
        empty={
          !challenges.length
            ? "Nenhum desafio cadastrado na API Java."
            : undefined
        }
        onRetry={reload}
      />
      {!loading && !catalogError && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => {
            const isSelected = selectedId === challenge.id;
            const isComplete = completedIds.includes(challenge.id);
            return (
              <button
                key={challenge.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedId(challenge.id);
                  setStartedChallengeId(null);
                  setEvidence(null);
                  setEvidenceDescription("");
                  setErrorMessage("");
                  setSavedMessage("");
                }}
                className={`rounded-2xl border p-5 text-left transition focus:outline-2 focus:outline-offset-2 focus:outline-leaf ${
                  isSelected
                    ? "border-leaf bg-leaf/10"
                    : "border-white/10 bg-forest-soft hover:border-leaf/40"
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  ID: {challenge.id} | {isComplete ? "Concluído" : "Ativo"}
                </span>
                <span className="mt-2 block text-lg font-bold text-white">
                  {challenge.titulo}
                </span>
                <span className="mt-1 block text-xs text-leaf">
                  {challenge.categoria}
                </span>
                <span className="mt-1 block text-sm leading-6 text-mint">
                  {challenge.descricao}
                </span>
                <span className="mt-4 block font-semibold text-leaf">
                  {challenge.pontos} pontos
                </span>
              </button>
            );
          })}
        </div>
      )}
      {accountNotice && (
        <p role="status" className="mt-5 text-sm text-muted">
          {accountNotice} Entre na sua conta para publicar ações.
        </p>
      )}

      {!loading && !catalogError && selectedChallenge && (
        <section
          className="mt-8 rounded-3xl border border-leaf/25 bg-forest-soft p-6 sm:p-8"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-leaf">
                Desafio selecionado · ID {selectedChallenge.id}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                {selectedChallenge.titulo}
              </h2>
              <p className="mt-2 text-mint">{selectedChallenge.descricao}</p>
            </div>
            <span className="shrink-0 rounded-full bg-leaf/10 px-4 py-2 text-sm font-bold text-leaf">
              {selectedChallenge.pontos} pontos
            </span>
          </div>

          {submittedAction ? (
            <div className="mt-7 rounded-xl border border-leaf/20 bg-leaf/5 p-4 text-mint">
              <p className="font-semibold">
                Ação{" "}
                {submittedAction.status === "pendente"
                  ? "aguardando aprovação"
                  : submittedAction.status}
                .
              </p>
              {submittedAction.opinion && (
                <p className="mt-2 text-sm">
                  Parecer: {submittedAction.opinion}
                </p>
              )}
            </div>
          ) : completedIds.includes(selectedChallenge.id) ? (
            <p className="mt-7 rounded-xl border border-leaf/20 bg-leaf/5 p-4 font-semibold text-leaf">
              Desafio concluído. Os pontos já estão contabilizados no seu
              perfil.
            </p>
          ) : !account ? (
            <Link
              to="/cadastro"
              className="mt-6 inline-flex rounded-full bg-leaf px-6 py-3 font-bold text-forest"
            >
              Entre para participar
            </Link>
          ) : startedChallengeId !== selectedChallenge.id ? (
            <button
              type="button"
              onClick={() => {
                setStartedChallengeId(selectedChallenge.id);
                setErrorMessage("");
                setSavedMessage("");
              }}
              className="mt-6 rounded-full bg-leaf px-6 py-3 font-bold text-forest transition hover:bg-leaf-bright"
            >
              Iniciar desafio
            </button>
          ) : null}
        </section>
      )}

      {!loading &&
        !catalogError &&
        selectedChallenge &&
        startedChallengeId === selectedChallenge.id &&
        !completedIds.includes(selectedChallenge.id) &&
        !submittedAction && (
          <section className="mt-5 rounded-3xl border border-white/10 bg-forest-soft/70 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-leaf">
              Etapa de conclusão · ID {selectedChallenge.id}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Envie a evidência
            </h2>
            <p className="mt-2 text-mint">
              Quando concluir “{selectedChallenge.descricao}”, envie uma foto e
              descreva a ação para análise.
            </p>
            <form className="mt-7 space-y-5" onSubmit={submitChallenge}>
              <div>
                <label
                  className="block text-sm font-semibold text-white"
                  htmlFor="challenge-evidence"
                >
                  Envie uma foto como evidência
                </label>
                <input
                  id="challenge-evidence"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  required
                  onChange={selectEvidence}
                  className="mt-3 block w-full text-sm text-mint file:mr-4 file:rounded-full file:border-0 file:bg-leaf/10 file:px-4 file:py-2 file:font-semibold file:text-leaf hover:file:bg-leaf/20"
                />
                {evidence && (
                  <p className="mt-2 text-sm text-muted">
                    Foto selecionada: {evidence.name}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="action-description"
                  className="block text-sm font-semibold text-white"
                >
                  Descreva a evidência da ação
                </label>
                <textarea
                  id="action-description"
                  required
                  minLength={5}
                  rows={3}
                  value={evidenceDescription}
                  onChange={(event) =>
                    setEvidenceDescription(event.target.value)
                  }
                  className="mt-3 w-full rounded-xl border border-white/20 bg-forest px-4 py-3 text-white outline-none focus:border-leaf"
                />
              </div>
              <p className="text-sm leading-6 text-muted">
                A foto (até 2 MB) e a descrição ficam salvas neste navegador
                para análise dos funcionários. Os pontos contam após a
                aprovação.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-leaf px-6 py-3 font-bold text-forest transition hover:bg-leaf-bright"
              >
                {submitting ? "Enviando..." : "Enviar ação para análise"}
              </button>
            </form>
          </section>
        )}

      <p className="mt-8 text-sm text-muted">
        Pontos acumulados: <strong className="text-leaf">{localPoints}</strong>
        {" · "}
        <Link className="font-semibold text-leaf hover:underline" to="/perfil">
          Ver meu perfil
        </Link>
      </p>
      {savedMessage && (
        <p role="status" className="mt-4 text-sm text-leaf">
          {savedMessage}
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="mt-4 text-sm text-red-200">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
