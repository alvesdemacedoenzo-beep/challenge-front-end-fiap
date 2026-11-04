import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import RequestFeedback from "../components/RequestFeedback";
import { listGroups } from "../services/api";
import type { ApiGroup } from "../services/api";

export default function ApiDirectoryPage() {
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listGroups()
      .then((data) => {
        if (active) setGroups(data);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Não foi possível consultar os grupos.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="Comunidade"
        title="Grupos da comunidade"
        description="Conheça os grupos cadastrados e acompanhe seus dados publicados na plataforma."
      />
      <Link
        to="/grupos/novo"
        className="mb-7 inline-flex rounded-full bg-leaf px-6 py-3 font-bold text-forest hover:bg-leaf-bright"
      >
        Cadastrar grupo
      </Link>
      <RequestFeedback
        loading={loading}
        error={error}
        empty={!groups.length ? "Nenhum grupo cadastrado na API." : undefined}
        onRetry={() => setAttempt((value) => value + 1)}
      />
      {!loading && !error && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <li
              key={group.id}
              className="min-w-0 rounded-2xl border border-white/10 bg-forest-soft p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Grupo {group.id}
              </p>
              <h2 className="mt-2 break-words text-xl font-bold text-white">
                {group.nome}
              </h2>
              <p className="mt-3 text-sm text-mint">
                {group.pontosAcumulados ?? 0} pontos
              </p>
              <Link
                to={`/grupos/${group.id}`}
                className="mt-5 inline-flex font-semibold text-leaf hover:underline"
              >
                Ver detalhes<span className="sr-only"> de {group.nome}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
