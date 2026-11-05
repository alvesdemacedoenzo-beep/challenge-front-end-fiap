import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { deleteGroup, listGroups } from "../services/api";
import type { ApiGroup } from "../services/api";
import RequestFeedback from "./RequestFeedback";

export default function GroupManagement() {
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listGroups()
      .then((items) => { if (active) setGroups(items); })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Não foi possível consultar os grupos.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  async function remove(group: ApiGroup) {
    if (busy.current || !window.confirm(`Excluir o grupo “${group.nome}” (ID ${group.id})? Esta operação não pode ser desfeita.`)) return;
    busy.current = true;
    setDeletingId(group.id);
    setError("");
    setMessage("");
    try {
      await deleteGroup(group.id);
      const updated = await listGroups();
      setGroups(updated);
      if (updated.some((item) => item.id === group.id))
        throw new Error("O grupo continua cadastrado. Atualize a lista antes de repetir a exclusão.");
      setMessage(`Grupo “${group.nome}” excluído com sucesso.`);
    } catch (cause) {
      setError(cause instanceof Error ? `${cause.message} Consulte a lista antes de repetir a operação.` : "Não foi possível confirmar a exclusão. Atualize a lista.");
    } finally {
      busy.current = false;
      setDeletingId(null);
    }
  }

  return (
    <section id="grupos" className="min-w-0 scroll-mt-28" aria-labelledby="groups-title">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="groups-title" className="text-2xl font-bold text-white">Grupos da API Java</h2>
        <Link to="/grupos/novo" className="font-semibold text-leaf hover:underline">Cadastrar grupo</Link>
      </div>
      <p className="mb-4 text-sm text-muted">Somente funcionários autenticados podem excluir grupos.</p>
      <button type="button" disabled={loading || deletingId !== null} onClick={() => { setMessage(""); setAttempt((value) => value + 1); }} className="mb-5 text-sm font-semibold text-leaf disabled:opacity-50">Atualizar grupos</button>
      <RequestFeedback loading={loading} error={error} empty={!groups.length ? "Nenhum grupo cadastrado na API Java." : undefined} onRetry={deletingId === null ? () => setAttempt((value) => value + 1) : undefined} />
      {message && <p role="status" className="mb-5 text-leaf">{message}</p>}
      {!loading && !error && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <li key={group.id} className="min-w-0 rounded-2xl border border-white/10 bg-forest-soft p-5">
              <h3 className="break-words text-lg font-bold text-white">{group.nome}</h3>
              <p className="mt-2 text-sm text-muted">ID {group.id} · {group.pontosAcumulados ?? 0} pontos</p>
              <Link to={`/grupos/${group.id}`} className="mt-4 block font-semibold text-leaf hover:underline">Ver detalhes<span className="sr-only"> de {group.nome}</span></Link>
              <button type="button" disabled={deletingId !== null} onClick={() => void remove(group)} className="mt-4 rounded-full border border-red-300/30 px-4 py-2 text-red-200 disabled:opacity-50">
                {deletingId === group.id ? "Excluindo..." : "Excluir grupo"}<span className="sr-only"> {group.nome} (ID {group.id})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
