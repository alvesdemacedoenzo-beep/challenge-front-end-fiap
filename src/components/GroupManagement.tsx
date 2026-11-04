import { useState } from "react";
import { Link } from "react-router-dom";
import { deleteGroup, listGroups } from "../services/api";
import type { ApiGroup } from "../services/api";
import useApiList from "../hooks/useApiList";
import RequestFeedback from "./RequestFeedback";

export default function GroupManagement() {
  const { items, loading, error, reload } = useApiList(listGroups);
  const [busy, setBusy] = useState(false);
  const [operationError, setOperationError] = useState("");
  const [message, setMessage] = useState("");
  async function remove(group: ApiGroup) {
    if (
      !window.confirm(
        `Excluir o grupo “${group.nome}” do banco? Esta operação não pode ser desfeita.`,
      )
    )
      return;
    setBusy(true);
    setOperationError("");
    setMessage("");
    try {
      await deleteGroup(group.id);
      if ((await listGroups()).some((item) => item.id === group.id))
        throw new Error(
          "O grupo continua cadastrado. Atualize a lista antes de repetir.",
        );
      setMessage("Exclusão do grupo confirmada pela API.");
      reload();
    } catch (cause) {
      setOperationError(
        cause instanceof Error ? cause.message : "Não foi possível excluir.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section id="grupos" className="min-w-0 scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-white">Grupos da API Java</h2>
        <Link
          to="/grupos/novo"
          className="rounded-full border border-leaf/40 px-5 py-2 font-semibold text-leaf hover:bg-leaf/10"
        >
          Cadastrar grupo
        </Link>
      </div>
      <button
        type="button"
        disabled={busy || loading}
        onClick={reload}
        className="mb-5 text-sm font-semibold text-leaf disabled:opacity-50"
      >
        Atualizar grupos
      </button>
      <RequestFeedback
        loading={loading}
        error={error}
        empty={
          !items.length ? "Nenhum grupo cadastrado na API Java." : undefined
        }
        onRetry={reload}
      />
      {message && (
        <p role="status" className="mb-5 text-leaf">
          {message}
        </p>
      )}
      {operationError && (
        <p role="alert" className="mb-5 text-red-200">
          {operationError}
        </p>
      )}
      {!loading && !error && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((group) => (
            <li
              key={group.id}
              className="min-w-0 rounded-2xl border border-white/10 bg-forest-soft p-5"
            >
              <h3 className="break-words text-lg font-bold text-white">
                {group.nome}
              </h3>
              <p className="mt-2 text-sm text-muted">
                ID {group.id} · {group.pontosAcumulados ?? 0} pontos
              </p>
              <Link
                to={`/grupos/${group.id}`}
                className="mt-4 block font-semibold text-leaf hover:underline"
              >
                Ver detalhes<span className="sr-only"> de {group.nome}</span>
              </Link>
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove(group)}
                className="mt-4 rounded-full border border-red-300/30 px-4 py-2 text-red-200 disabled:opacity-50"
              >
                Excluir grupo<span className="sr-only"> {group.id}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
