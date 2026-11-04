import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../contexts/AuthContext";
import { getApprovedActionPoints } from "../services/challenges";

export default function ProfilePage() {
  const { user, isLoading, errorMessage } = useAuth();
  const [localPoints, setLocalPoints] = useState(0);
  const [progressError, setProgressError] = useState("");
  useEffect(() => {
    if (!user) {
      setLocalPoints(0);
      return;
    }
    try {
      setLocalPoints(getApprovedActionPoints(user.id));
      setProgressError("");
    } catch {
      setProgressError(
        "Não foi possível ler os pontos locais deste navegador.",
      );
    }
  }, [user]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="Minha conta"
        title="Perfil"
        description="Acompanhe os dados da sua conta e o progresso nos desafios sustentáveis."
      />
      {isLoading ? (
        <p role="status" className="rounded-2xl bg-forest-soft p-6 text-mint">
          Verificando sua sessão...
        </p>
      ) : user ? (
        <section className="rounded-3xl border border-leaf/25 bg-forest-soft p-6 sm:p-8">
          <h2 className="break-words text-2xl font-bold text-white">
            {user.nome}
          </h2>
          <p className="mt-2 break-all text-mint">{user.email}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-leaf/20 bg-leaf/5 p-5">
              <p className="text-sm font-semibold text-mint">Pontos na API</p>
              <p className="mt-2 text-4xl font-black text-leaf">
                {user.pontosAdquiridos ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 p-5">
              <p className="text-sm font-semibold text-mint">
                Pontos locais aprovados
              </p>
              <p className="mt-2 text-4xl font-black text-leaf">
                {localPoints}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            O progresso local pertence a este navegador e não é somado
            automaticamente aos pontos do servidor.
          </p>
          {progressError && (
            <p role="alert" className="mt-4 text-sm text-red-200">
              {progressError}
            </p>
          )}
          <Link
            to="/desafios"
            className="mt-6 inline-flex rounded-full bg-leaf px-6 py-3 font-bold text-forest hover:bg-leaf-bright"
          >
            Explorar desafios
          </Link>
        </section>
      ) : (
        <section className="rounded-3xl border border-white/10 bg-forest-soft p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white">Entre na sua conta</h2>
          <p className="mt-3 leading-6 text-mint">
            Acesse sua conta para visualizar o perfil e publicar ações.
          </p>
          {errorMessage && (
            <p role="alert" className="mt-4 text-sm text-red-200">
              {errorMessage}
            </p>
          )}
          <Link
            to="/cadastro"
            className="mt-6 inline-flex rounded-full bg-leaf px-6 py-3 font-bold text-forest hover:bg-leaf-bright"
          >
            Acessar minha conta
          </Link>
        </section>
      )}
    </div>
  );
}
