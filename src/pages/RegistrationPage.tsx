import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../contexts/AuthContext";
import { login, logout, registerAccount } from "../services/api";

type AccountForm = { nome: string; email: string; senha: string };
const inputClass =
  "mt-2 w-full rounded-xl border border-white/20 bg-forest px-4 py-3 text-white outline-none focus:border-leaf";
const buttonClass =
  "rounded-full bg-leaf px-6 py-3 font-bold text-forest hover:bg-leaf-bright disabled:cursor-not-allowed disabled:opacity-60";

export default function RegistrationPage() {
  const { user, setUser, isLoading, errorMessage: sessionError } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [leaving, setLeaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountForm>({ shouldUnregister: true });

  function switchMode(next: typeof mode) {
    setMode(next);
    reset();
    setError("");
    setSuccess("");
  }
  async function submit(values: AccountForm) {
    setError("");
    setSuccess("");
    try {
      if (mode === "register") {
        await registerAccount({
          nome: values.nome.trim(),
          email: values.email.trim().toLowerCase(),
          senha: values.senha,
        });
        switchMode("login");
        setSuccess(
          "Cadastro confirmado pela API. Entre para verificar sua conta.",
        );
      } else {
        setUser(
          await login({
            email: values.email.trim().toLowerCase(),
            senha: values.senha,
          }),
        );
        reset();
        navigate("/perfil");
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível concluir a solicitação.",
      );
    }
  }
  async function leave() {
    setLeaving(true);
    setError("");
    try {
      await logout();
      setUser(null);
      switchMode("login");
      setSuccess("Sessão encerrada.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível encerrar a sessão.",
      );
    } finally {
      setLeaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="Sua conta Soul Up"
        title="Entre para fazer parte"
        description="Crie uma conta ou entre para continuar sua jornada."
        centered
      />
      <section className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-forest-soft p-6 sm:p-8">
        {isLoading ? (
          <p role="status" className="text-mint">
            Verificando sua sessão...
          </p>
        ) : user ? (
          <div>
            <h2 className="break-words text-2xl font-bold text-white">
              Olá, {user.nome}!
            </h2>
            <p className="mt-2 break-all text-mint">{user.email}</p>
            <Link
              to="/perfil"
              className="mt-5 block font-semibold text-leaf hover:underline"
            >
              Acessar meu perfil
            </Link>
            <button
              type="button"
              disabled={leaving}
              onClick={() => void leave()}
              className={`${buttonClass} mt-6`}
            >
              {leaving ? "Saindo..." : "Sair da conta"}
            </button>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-2 gap-2 rounded-full border border-white/10 p-1"
              aria-label="Opções de conta"
            >
              {(["register", "login"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={isSubmitting}
                  aria-pressed={mode === option}
                  onClick={() => switchMode(option)}
                  className={`rounded-full px-3 py-2 text-sm font-semibold ${mode === option ? "bg-leaf text-forest" : "text-mint hover:bg-white/5"}`}
                >
                  {option === "register" ? "Criar conta" : "Entrar"}
                </button>
              ))}
            </div>
            <h2 className="mt-7 text-2xl font-bold text-white">
              {mode === "register" ? "Crie sua conta" : "Bem-vindo de volta"}
            </h2>
            {sessionError && (
              <p role="status" className="mt-4 text-sm leading-6 text-muted">
                {sessionError}
              </p>
            )}
            <form
              noValidate
              onSubmit={handleSubmit(submit)}
              className="mt-6 space-y-5"
            >
              {mode === "register" && (
                <div>
                  <label
                    htmlFor="account-name"
                    className="text-sm font-semibold text-mint"
                  >
                    Nome
                  </label>
                  <input
                    id="account-name"
                    autoComplete="name"
                    aria-invalid={!!errors.nome}
                    aria-describedby={
                      errors.nome ? "account-name-error" : undefined
                    }
                    className={inputClass}
                    {...register("nome", {
                      required: "Informe seu nome.",
                      validate: (value) =>
                        value.trim().length >= 2 ||
                        "Informe pelo menos 2 caracteres.",
                      maxLength: {
                        value: 100,
                        message: "Use até 100 caracteres.",
                      },
                    })}
                  />
                  {errors.nome && (
                    <p
                      id="account-name-error"
                      role="alert"
                      className="mt-2 text-sm text-red-200"
                    >
                      {errors.nome.message}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label
                  htmlFor="account-email"
                  className="text-sm font-semibold text-mint"
                >
                  E-mail
                </label>
                <input
                  id="account-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={
                    errors.email ? "account-email-error" : undefined
                  }
                  className={inputClass}
                  {...register("email", {
                    required: "Informe seu e-mail.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Informe um e-mail válido.",
                    },
                    maxLength: {
                      value: 254,
                      message: "Use até 254 caracteres.",
                    },
                  })}
                />
                {errors.email && (
                  <p
                    id="account-email-error"
                    role="alert"
                    className="mt-2 text-sm text-red-200"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="account-password"
                  className="text-sm font-semibold text-mint"
                >
                  Senha
                </label>
                <input
                  id="account-password"
                  type="password"
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                  aria-invalid={!!errors.senha}
                  aria-describedby={
                    errors.senha ? "account-password-error" : undefined
                  }
                  className={inputClass}
                  {...register("senha", {
                    required: "Informe a senha.",
                    minLength: {
                      value: 8,
                      message: "Use pelo menos 8 caracteres.",
                    },
                    maxLength: { value: 72, message: "Use até 72 caracteres." },
                  })}
                />
                {errors.senha && (
                  <p
                    id="account-password-error"
                    role="alert"
                    className="mt-2 text-sm text-red-200"
                  >
                    {errors.senha.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${buttonClass} w-full`}
              >
                {isSubmitting
                  ? "Aguarde..."
                  : mode === "register"
                    ? "Cadastrar"
                    : "Entrar"}
              </button>
            </form>
          </>
        )}
        {error && (
          <p
            role="alert"
            className="mt-5 break-words rounded-xl border border-red-300/20 p-4 text-sm text-red-200"
          >
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="mt-5 text-sm text-leaf">
            {success}
          </p>
        )}
      </section>
    </div>
  );
}
