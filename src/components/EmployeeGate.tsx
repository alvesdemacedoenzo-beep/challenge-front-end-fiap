import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import SectionTitle from "./SectionTitle";
import {
  checkEmployeeAccess,
  loginEmployee,
  logoutEmployee,
} from "../services/employee";

export default function EmployeeGate({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(() => {
    let active = true;
    setLoading(true);
    checkEmployeeAccess()
      .then((allowed) => {
        if (active) setAuthenticated(allowed);
      })
      .catch(() => {
        if (active) {
          setAuthenticated(false);
          setError(
            "Não foi possível verificar o acesso. Tente entrar novamente.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [location.pathname]);

  async function enter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await loginEmployee(password);
      setPassword("");
      setAuthenticated(true);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Não foi possível entrar.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    setBusy(true);
    setError("");
    try {
      await logoutEmployee();
      setAuthenticated(false);
    } catch {
      setError("Não foi possível encerrar a sessão. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <p role="status" className="px-5 py-20 text-center text-mint">
        Verificando acesso de funcionário...
      </p>
    );
  if (authenticated)
    return (
      <>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 pt-8 sm:px-8">
          <p className="text-sm font-semibold text-leaf">
            Sessão de funcionário
          </p>
          <button
            type="button"
            onClick={leave}
            disabled={busy}
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-mint hover:border-leaf disabled:opacity-60"
          >
            {busy ? "Saindo..." : "Sair da área de funcionários"}
          </button>
        </div>
        {error && (
          <p role="alert" className="mx-auto max-w-7xl px-5 pt-4 text-red-200">
            {error}
          </p>
        )}
        {children}
      </>
    );

  return (
    <div className="mx-auto max-w-xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="Área restrita"
        title="Acesso Funcionário"
        description="Informe a senha compartilhada dos funcionários para acessar as ferramentas de gestão."
      />
      <form
        onSubmit={enter}
        className="space-y-5 rounded-3xl border border-white/10 bg-forest-soft p-6 sm:p-8"
      >
        <label
          htmlFor="employee-password"
          className="block text-sm font-semibold text-mint"
        >
          Senha de funcionário
        </label>
        <input
          id="employee-password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "employee-error" : "employee-password-help"}
          className="w-full rounded-xl border border-white/20 bg-forest px-4 py-3 text-white outline-none focus:border-leaf"
        />
        <p id="employee-password-help" className="text-sm text-muted">
          Use a senha única fornecida pelo responsável. Mínimo de 8 caracteres.
        </p>
        {error && (
          <p id="employee-error" role="alert" className="text-sm text-red-200">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-leaf px-6 py-3 font-bold text-forest hover:bg-leaf-bright disabled:opacity-60"
        >
          {busy ? "Verificando..." : "Acessar área de funcionários"}
        </button>
      </form>
    </div>
  );
}
