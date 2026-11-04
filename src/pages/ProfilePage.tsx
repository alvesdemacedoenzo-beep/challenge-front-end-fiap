import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import {
  ApiError,
  clearStoredAccount,
  getCurrentAccount,
  getStoredAccount,
  login,
  storeAccount,
  resgatarRecompensaApi,
  listEmpresas,
} from "../services/api";
import type { AccountUser, ApiEmpresa } from "../services/api";

export default function ProfilePage() {
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [empresas, setEmpresas] = useState<ApiEmpresa[]>([]);

  useEffect(() => {
    let active = true;
    getCurrentAccount()
      .then((currentAccount) => {
        if (!active) return;
        const signedInAccount = currentAccount ?? getStoredAccount();
        setAccount(signedInAccount);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          clearStoredAccount();
          setAccount(null);
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          try {
            const storedAccount = getStoredAccount();
            setAccount(storedAccount);
          } catch (storageError) {
            setErrorMessage(
              storageError instanceof Error
                ? storageError.message
                : "Não foi possível recuperar a conta salva.",
            );
          }
          return;
        }
        try {
          const storedAccount = getStoredAccount();
          setAccount(storedAccount);
        } catch (storageError) {
          setErrorMessage(
            storageError instanceof Error
              ? storageError.message
              : error instanceof Error
                ? error.message
                : "Não foi possível carregar os dados do perfil.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    listEmpresas()
      .then((data) => {
        if (active) setEmpresas(data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const accountPoints = account?.pontosAcumulados ?? 0;

  const handleRedeem = async (cost: number, description: string) => {
    if (!account) return;
    if (accountPoints < cost) {
      setErrorMessage("Pontos insuficientes para resgatar.");
      setRewardMessage("");
      return;
    }

    try {
      setIsLoading(true);
      await resgatarRecompensaApi(account.id, cost);

      setAccount({
        ...account,
        pontosAcumulados: accountPoints - cost,
      } as AccountUser);
      
      setErrorMessage("");
      setRewardMessage(`Sucesso! Você resgatou: ${description}`);
    } catch (error) {
      setErrorMessage("Erro ao conectar com a API Java para resgate.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const signedInAccount = await login({ email: email.trim(), senha: password });
      if (!signedInAccount) {
        throw new Error("A API não retornou os dados da conta.");
      }
      storeAccount(signedInAccount);
      setAccount(signedInAccount);
      setPassword("");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError && [401, 403].includes(error.status)
          ? "E-mail ou senha incorretos."
          : error instanceof Error
            ? error.message
            : "Não foi possível entrar. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="Minha conta"
        title="Perfil"
        description="Acompanhe seus dados e os pontos conquistados nos desafios sustentáveis."
      />

      {isLoading ? (
        <p role="status" className="rounded-2xl bg-forest-soft p-6 text-mint">
          Carregando perfil...
        </p>
      ) : account ? (
        <section className="rounded-3xl border border-leaf/25 bg-forest-soft p-6 sm:p-8">
          <h2 className="mt-6 text-2xl font-bold text-white">{account.nome}</h2>
          <p className="mt-2 break-all text-mint">{account.email}</p>
          
          <div className="mt-8 rounded-2xl border border-leaf/20 bg-leaf/5 p-5">
            <p className="text-sm font-semibold text-mint">Saldo Atual (Oracle DB)</p>
            <p className="mt-2 text-4xl font-black text-leaf">
              {accountPoints}
              <span className="ml-2 text-base font-semibold">pontos</span>
            </p>
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-bold text-white mb-4">Catálogo de Recompensas</h3>
            
            {rewardMessage && (
              <p role="status" className="mb-4 rounded-xl border border-leaf/20 bg-leaf/5 p-4 text-sm text-leaf">
                {rewardMessage}
              </p>
            )}
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-forest p-5 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white">Desconto Conta de Luz</h4>
                  <p className="text-sm text-mint mt-1">Custa: 50 pontos (Parceria EnergiaLimpa)</p>
                </div>
                <button 
                  type="button"
                  onClick={() => handleRedeem(50, "Desconto na Conta de Luz")}
                  className="mt-4 w-full rounded-lg bg-leaf/10 border border-leaf/40 px-4 py-2 text-sm font-bold text-leaf transition hover:bg-leaf/20"
                >
                  Resgatar
                </button>
              </div>

              <div className="rounded-xl border border-white/10 bg-forest p-5 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white">Bolsa Curso EAD</h4>
                  <p className="text-sm text-mint mt-1">Custa: 30 pontos (Gestão Ambiental)</p>
                </div>
                <button 
                  type="button"
                  onClick={() => handleRedeem(30, "Bolsa Curso EAD")}
                  className="mt-4 w-full rounded-lg bg-leaf/10 border border-leaf/40 px-4 py-2 text-sm font-bold text-leaf transition hover:bg-leaf/20"
                >
                  Resgatar
                </button>
              </div>
            </div>
          </div>
          
          {empresas.length > 0 && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-forest-soft p-5">
              <h3 className="font-bold text-white mb-3">Nossas Empresas Parceiras</h3>
              <ul className="mt-3 text-sm text-mint space-y-2">
                {empresas.map((emp) => (
                  <li key={emp.id}>🏢 {emp.nome} - {emp.endereco}</li>
                ))}
              </ul>
            </div>
          )}

          <Link
            to="/desafios"
            className="mt-6 inline-flex rounded-full bg-leaf px-6 py-3 font-bold text-forest transition hover:bg-leaf-bright"
          >
            Explorar desafios
          </Link>
        </section>
      ) : (
        <section className="rounded-3xl border border-white/10 bg-forest-soft p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white">Entre na sua conta</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Informe seu e-mail e senha para visualizar seu perfil.
          </p>
          <form onSubmit={submitLogin} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="profile-email"
                className="block text-sm font-semibold text-mint"
              >
                E-mail
              </label>
              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-forest px-4 py-3 text-white outline-none transition placeholder:text-muted/70 focus:border-leaf"
                placeholder="voce@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="profile-password"
                className="block text-sm font-semibold text-mint"
              >
                Senha
              </label>
              <input
                id="profile-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-forest px-4 py-3 text-white outline-none transition placeholder:text-muted/70 focus:border-leaf"
                placeholder="Sua senha"
              />
            </div>
            {errorMessage && (
              <p
                role="alert"
                className="rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-200"
              >
                {errorMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-leaf px-6 py-3 font-bold text-forest transition hover:bg-leaf-bright disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            Ainda não tem conta?{" "}
            <Link
              to="/cadastro"
              className="font-semibold text-leaf hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}