import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import RequestFeedback from "../components/RequestFeedback";
import { ApiError, getGroup, getUser } from "../services/api";
import type { ApiGroup, ApiUser } from "../services/api";

export default function ApiRecordPage({ kind }: { kind: "user" | "group" }) {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ApiGroup | ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const back = kind === "user" ? "/acesso-funcionario" : "/grupos";

  useEffect(() => {
    let active = true;
    setData(null);
    setLoading(true);
    setError("");
    setMissing(false);
    const number = Number(id);
    if (
      !id ||
      !/^\d+$/.test(id) ||
      !Number.isSafeInteger(number) ||
      number < 1
    ) {
      setError("O identificador informado na URL é inválido.");
      setMissing(true);
      setLoading(false);
      return;
    }
    const promise = kind === "user" ? getUser(number) : getGroup(number);
    promise
      .then((record) => {
        if (active) setData(record);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Não foi possível consultar este registro.",
          );
          setMissing(cause instanceof ApiError && cause.status === 404);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, kind, attempt]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="Dados da plataforma"
        title={kind === "user" ? "Detalhes do usuário" : "Detalhes do grupo"}
        description="Consulte as informações atuais deste cadastro."
      />
      <RequestFeedback
        loading={loading}
        error={error}
        onRetry={missing ? undefined : () => setAttempt((value) => value + 1)}
      />
      {!loading && !error && data && (
        <article className="rounded-3xl border border-leaf/20 bg-forest-soft p-6 sm:p-8">
          <h2 className="break-words text-2xl font-bold text-white">
            {data.nome}
          </h2>
          <dl className="mt-6 space-y-5 text-mint">
            <div>
              <dt className="text-sm text-muted">Identificador</dt>
              <dd className="mt-1 font-semibold">{data.id}</dd>
            </div>
            {"email" in data ? (
              <>
                <div>
                  <dt className="text-sm text-muted">E-mail</dt>
                  <dd className="mt-1 break-all">{data.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Pontos adquiridos</dt>
                  <dd className="mt-1 font-bold text-leaf">
                    {data.pontosAdquiridos ?? 0}
                  </dd>
                </div>
              </>
            ) : (
              <>
                <div>
                  <dt className="text-sm text-muted">Pontos acumulados</dt>
                  <dd className="mt-1 font-bold text-leaf">
                    {data.pontosAcumulados ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Data de criação</dt>
                  <dd className="mt-1">
                    {data.dataCriacao || "Não informada"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Membros</dt>
                  <dd className="mt-2">
                    {data.membros?.length ? (
                      <ul className="space-y-2">
                        {data.membros.map((member) => (
                          <li key={member.id} className="break-words">
                            {member.nome}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "Nenhum membro informado pela API."
                    )}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </article>
      )}
      <Link
        to={back}
        className="mt-7 inline-flex rounded-full border border-white/20 px-5 py-3 font-semibold text-mint hover:border-leaf"
      >
        {kind === "user"
          ? "Voltar à área de funcionários"
          : "Voltar aos grupos"}
      </Link>
    </div>
  );
}
