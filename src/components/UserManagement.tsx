import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { createUser, updateUser, deleteUser, listUsers } from "../services/api";
import type { ApiUser, CreateUserRequest } from "../services/api";
import useApiList from "../hooks/useApiList";
import RequestFeedback from "./RequestFeedback";

const inputClass =
  "mt-2 w-full rounded-xl border border-white/20 bg-forest px-4 py-3 text-white focus:border-leaf";
const buttonClass =
  "rounded-full border border-leaf/40 px-5 py-2 font-semibold text-leaf hover:bg-leaf/10 disabled:opacity-50";

function UserEditor({
  user,
  onSaved,
  onCancel,
}: {
  user: ApiUser | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserRequest>({
    defaultValues: {
      nome: user?.nome ?? "",
      email: user?.email ?? "",
      senha: "",
    },
  });
  async function save(values: CreateUserRequest) {
    setError("");
    try {
      if (user)
        await updateUser(user.id, { nome: values.nome, email: values.email });
      else await createUser(values);
      resetField("senha");
      onSaved();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar o usuário.",
      );
    }
  }
  return (
    <form
      noValidate
      onSubmit={handleSubmit(save)}
      className="mb-6 space-y-4 rounded-2xl border border-leaf/30 p-5"
    >
      <h3 className="text-xl font-bold text-white">
        {user ? `Editar usuário ${user.id}` : "Cadastrar usuário no Java"}
      </h3>
      <fieldset
        disabled={isSubmitting}
        className="space-y-4 disabled:opacity-60"
      >
        <label className="block text-sm text-mint">
          Nome
          <input
            autoFocus
            autoComplete="name"
            maxLength={100}
            aria-invalid={!!errors.nome}
            className={inputClass}
            {...register("nome", {
              validate: (value) =>
                (value.trim().length >= 2 && value.trim().length <= 100) ||
                "Use um nome de 2 a 100 caracteres.",
            })}
          />
          {errors.nome && (
            <span role="alert" className="mt-1 block text-red-200">
              {errors.nome.message}
            </span>
          )}
        </label>
        <label className="block text-sm text-mint">
          E-mail
          <input
            type="email"
            autoComplete="email"
            maxLength={254}
            aria-invalid={!!errors.email}
            className={inputClass}
            {...register("email", {
              required: "Informe o e-mail.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Informe um e-mail válido.",
              },
            })}
          />
          {errors.email && (
            <span role="alert" className="mt-1 block text-red-200">
              {errors.email.message}
            </span>
          )}
        </label>
        {!user && (
          <label className="block text-sm text-mint">
            Senha
            <input
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.senha}
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
              <span role="alert" className="mt-1 block text-red-200">
                {errors.senha.message}
              </span>
            )}
          </label>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={buttonClass}>
            {isSubmitting ? "Salvando..." : "Salvar usuário"}
          </button>
          <button type="button" onClick={onCancel} className={buttonClass}>
            Cancelar
          </button>
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="break-words text-sm text-red-200">
          {error}
        </p>
      )}
    </form>
  );
}

export default function UserManagement() {
  const { items, loading, error, reload } = useApiList(listUsers);
  const [editor, setEditor] = useState<ApiUser | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [operationError, setOperationError] = useState("");
  function open(value: ApiUser | "new") {
    setEditor(value);
    setMessage("");
    setOperationError("");
  }
  async function remove(user: ApiUser) {
    if (
      !window.confirm(
        `Excluir o usuário “${user.nome}” do banco? Esta operação não pode ser desfeita.`,
      )
    )
      return;
    setBusy(true);
    setMessage("");
    setOperationError("");
    try {
      await deleteUser(user.id);
      if ((await listUsers()).some((item) => item.id === user.id))
        throw new Error(
          "O usuário continua cadastrado. Atualize a lista antes de repetir.",
        );
      setMessage("Exclusão do usuário confirmada pela API.");
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
    <section id="usuarios" className="min-w-0 scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-white">Usuários da API Java</h2>
        <button
          type="button"
          disabled={busy || editor !== null}
          onClick={() => open("new")}
          className={buttonClass}
        >
          Cadastrar usuário
        </button>
      </div>
      <button
        type="button"
        disabled={busy || loading || editor !== null}
        onClick={reload}
        className="mb-5 text-sm font-semibold text-leaf disabled:opacity-50"
      >
        Atualizar usuários
      </button>
      {editor !== null && (
        <UserEditor
          key={editor === "new" ? "new" : editor.id}
          user={editor === "new" ? null : editor}
          onCancel={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            setMessage("Usuário salvo e consultado na API com sucesso.");
            reload();
          }}
        />
      )}
      <RequestFeedback
        loading={loading}
        error={error}
        empty={
          !items.length ? "Nenhum usuário cadastrado na API Java." : undefined
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
          {items.map((user) => (
            <li
              key={user.id}
              className="min-w-0 rounded-2xl border border-white/10 bg-forest-soft p-5"
            >
              <h3 className="break-words text-lg font-bold text-white">
                {user.nome}
              </h3>
              <p className="mt-2 break-all text-mint">{user.email}</p>
              <p className="mt-2 text-sm text-muted">
                ID {user.id} · {user.pontosAdquiridos ?? 0} pontos
              </p>
              <Link
                to={`/funcionarios/usuarios/${user.id}`}
                className="mt-4 inline-flex font-semibold text-leaf hover:underline"
              >
                Ver detalhes<span className="sr-only"> de {user.nome}</span>
              </Link>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy || editor !== null}
                  onClick={() => open(user)}
                  className={buttonClass}
                >
                  Editar usuário<span className="sr-only"> {user.id}</span>
                </button>
                <button
                  type="button"
                  disabled={busy || editor !== null}
                  onClick={() => void remove(user)}
                  className="rounded-full border border-red-300/30 px-4 py-2 text-red-200 disabled:opacity-50"
                >
                  Excluir usuário<span className="sr-only"> {user.id}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
