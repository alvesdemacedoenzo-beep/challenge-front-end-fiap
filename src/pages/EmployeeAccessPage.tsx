import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import ChallengeManagement from "../components/ChallengeManagement";
import GroupManagement from "../components/GroupManagement";
import { ApiError } from "../services/api";
import type { ApiUser } from "../services/api";
import { checkEmployeeAccess, listEmployeeUsers } from "../services/employee";
import {
  decideLocalAction,
  getLocalActions,
  getLocalRanking,
} from "../services/challenges";
import type { LocalAction } from "../services/challenges";

const options = [
  "Consultar usuários da API",
  "Criar desafio",
  "Editar/excluir desafios",
  "Consultar ações",
  "Aprovar/rejeitar ação",
  "Ranking local",
  "Consultar/excluir grupos",
];
const inputClass =
  "mt-2 w-full rounded-xl border border-white/20 bg-forest px-4 py-3 text-white outline-none focus:border-leaf";
const buttonClass =
  "rounded-full bg-leaf px-5 py-3 text-sm font-bold text-forest hover:bg-leaf-bright disabled:opacity-50";

export default function EmployeeAccessPage() {
  const [selected, setSelected] = useState(0);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [actions, setActions] = useState<LocalAction[]>([]);
  const [ranking, setRanking] = useState<ReturnType<typeof getLocalRanking>>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [opinions, setOpinions] = useState<Record<number, string>>({});
  const loadVersion = useRef(0);

  function refreshLocal() {
    setActions(getLocalActions());
    setRanking(getLocalRanking());
  }

  async function load() {
    const version = ++loadVersion.current;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!(await checkEmployeeAccess()))
        throw new Error(
          "Sua sessão expirou. Saia desta área e informe a senha novamente.",
        );
      if (selected === 0) {
        const result = await listEmployeeUsers();
        if (version !== loadVersion.current) return;
        setUsers(result);
      }
      if (version !== loadVersion.current) return;
      refreshLocal();
    } catch (cause) {
      if (version === loadVersion.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível carregar os dados.",
        );
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    return () => {
      loadVersion.current += 1;
    };
  }, [selected]);

  async function change(operation: () => void, message: string) {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!(await checkEmployeeAccess()))
        throw new ApiError(
          "Sua sessão expirou. Saia desta área e informe a senha novamente.",
          401,
        );
      operation();
      refreshLocal();
      setSuccess(message);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar a alteração.",
      );
    } finally {
      setLoading(false);
    }
  }

  const visibleActions =
    selected === 4
      ? actions.filter((action) => action.status === "pendente")
      : actions;

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <SectionTitle
        eyebrow="Gestão Soul Up"
        title="Acesso Funcionário"
        description="Gerencie desafios e acompanhe as ações sustentáveis da comunidade."
      />
      <Link
        to="/gestao"
        className="mb-6 inline-flex text-sm font-semibold text-leaf hover:underline"
      >
        Consultar e gerenciar cadastros da API
      </Link>
      <div className="grid items-start gap-7 lg:grid-cols-[280px_1fr]">
        <nav
          aria-label="Ferramentas de funcionários"
          className="grid gap-2 rounded-3xl border border-white/10 bg-forest-soft p-3 sm:grid-cols-2 lg:grid-cols-1"
        >
          {options.map((label, index) => (
            <button
              key={label}
              type="button"
              aria-current={selected === index ? "page" : undefined}
              onClick={() => {
                setSelected(index);
                setError("");
                setSuccess("");
              }}
              className={`flex items-start gap-3 rounded-2xl px-4 py-4 text-left text-sm font-semibold transition ${selected === index ? "bg-leaf/10 text-leaf" : "text-mint hover:bg-white/5"}`}
            >
              <span className="font-black">{index + 1}</span>
              {label}
            </button>
          ))}
        </nav>
        <section
          aria-labelledby="employee-section-title"
          className="min-w-0 rounded-3xl border border-white/10 bg-forest-soft p-5 sm:p-8"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2
              id="employee-section-title"
              className="text-2xl font-bold text-white"
            >
              {options[selected]}
            </h2>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-mint hover:border-leaf disabled:opacity-50"
            >
              Atualizar
            </button>
          </div>
          {loading && (
            <p role="status" className="mb-5 text-mint">
              Carregando...
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-red-300/20 p-4 text-sm text-red-200"
            >
              {error}
            </p>
          )}
          {success && (
            <p
              role="status"
              className="mb-5 rounded-xl border border-leaf/20 p-4 text-sm text-leaf"
            >
              {success}
            </p>
          )}

          {selected === 0 &&
            !loading &&
            !error &&
            (users.length ? (
              <ul className="space-y-3">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="rounded-2xl border border-white/10 p-4"
                  >
                    <p className="break-words font-bold text-white">
                      {user.nome}{" "}
                      <span className="text-sm font-normal text-muted">
                        · ID {user.id}
                      </span>
                    </p>
                    <p className="mt-1 break-all text-sm text-mint">
                      {user.email}
                    </p>
                    <Link
                      to={`/funcionarios/usuarios/${user.id}`}
                      className="mt-3 inline-flex text-sm font-semibold text-leaf hover:underline"
                    >
                      Ver detalhes
                      <span className="sr-only"> de {user.nome}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">Nenhum usuário retornado pela API.</p>
            ))}

          {(selected === 1 || selected === 2) && (
            <ChallengeManagement
              key={selected}
              initialCreate={selected === 1}
            />
          )}

          {selected === 6 && <GroupManagement />}

          {(selected === 3 || selected === 4) &&
            (visibleActions.length ? (
              <ul className="space-y-4">
                {visibleActions.map((action) => (
                  <li
                    key={action.id}
                    className="rounded-2xl border border-white/10 p-5"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-leaf">
                      Ação {action.id} · {action.status} · {action.points}{" "}
                      pontos
                    </p>
                    <h3 className="mt-2 font-bold text-white">
                      {action.description}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {action.userName} · {action.userEmail}
                    </p>
                    <p className="mt-4 whitespace-pre-wrap break-words text-sm text-mint">
                      {action.evidence}
                    </p>
                    {action.evidenceImage &&
                      /^data:image\/(jpeg|png|webp|gif);base64,/.test(
                        action.evidenceImage,
                      ) && (
                        <img
                          src={action.evidenceImage}
                          alt={`Evidência da ação de ${action.userName}`}
                          className="mt-4 max-h-72 max-w-full rounded-xl object-contain"
                        />
                      )}
                    {action.opinion && (
                      <p className="mt-3 text-sm text-muted">
                        Parecer: {action.opinion}
                      </p>
                    )}
                    {selected === 4 && (
                      <form
                        className="mt-5 space-y-3"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const submitter = (event.nativeEvent as SubmitEvent)
                            .submitter as HTMLButtonElement | null;
                          if (
                            !submitter ||
                            !["aprovar", "rejeitar"].includes(submitter.value)
                          ) {
                            setError("Escolha Aprovar ação ou Rejeitar ação.");
                            return;
                          }
                          void change(
                            () =>
                              decideLocalAction(
                                action.id,
                                submitter.value === "aprovar",
                                opinions[action.id] || "",
                              ),
                            "Análise registrada. O ranking local foi atualizado.",
                          );
                        }}
                      >
                        <label
                          htmlFor={`opinion-${action.id}`}
                          className="block text-sm font-semibold text-mint"
                        >
                          Parecer da análise
                          <textarea
                            id={`opinion-${action.id}`}
                            required
                            minLength={5}
                            rows={2}
                            value={opinions[action.id] || ""}
                            onChange={(event) =>
                              setOpinions((previous) => ({
                                ...previous,
                                [action.id]: event.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                        </label>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            value="aprovar"
                            disabled={loading}
                            className={buttonClass}
                          >
                            Aprovar ação
                          </button>
                          <button
                            type="submit"
                            value="rejeitar"
                            disabled={loading}
                            className="rounded-full border border-red-300/40 px-5 py-3 text-sm font-bold text-red-200 disabled:opacity-50"
                          >
                            Rejeitar ação
                          </button>
                        </div>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">
                {selected === 4
                  ? "Nenhuma ação pendente de análise."
                  : "Nenhuma ação publicada neste navegador. As evidências enviadas em Desafios aparecerão aqui."}
              </p>
            ))}

          {selected === 5 && (
            <>
              <p className="mb-5 text-sm leading-6 text-muted">
                Somente ações aprovadas somam pontos neste ranking. Esta
                pontuação local não altera os pontos da API Java.
              </p>
              {ranking.length ? (
                <ol className="space-y-3">
                  {ranking.map((entry, index) => (
                    <li
                      key={entry.userId}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 p-4"
                    >
                      <span className="text-xl font-black text-leaf">
                        {index + 1}º
                      </span>
                      <span className="min-w-0 flex-1 break-words font-semibold text-white">
                        {entry.name}
                      </span>
                      <span className="text-sm font-bold text-leaf">
                        {entry.points} pontos
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted">
                  O ranking aparecerá quando os usuários publicarem ações.
                </p>
              )}
            </>
          )}
        </section>
      </div>
      <p className="mt-7 text-sm leading-6 text-muted">
        Usuários e desafios são consultados na API Java. As evidências, os
        pareceres e o ranking de demonstração ficam neste navegador.
      </p>
    </div>
  );
}
