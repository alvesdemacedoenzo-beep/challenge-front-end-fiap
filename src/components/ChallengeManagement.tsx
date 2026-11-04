import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  createChallenge,
  updateChallenge,
  deleteChallenge,
  listChallenges,
} from "../services/api";
import type { ApiChallenge, SaveChallengeRequest } from "../services/api";
import useApiList from "../hooks/useApiList";
import RequestFeedback from "./RequestFeedback";

const inputClass =
  "mt-2 w-full rounded-xl border border-white/20 bg-forest px-4 py-3 text-white focus:border-leaf";
const buttonClass =
  "rounded-full border border-leaf/40 px-5 py-2 font-semibold text-leaf hover:bg-leaf/10 disabled:opacity-50";

function ChallengeEditor({
  challenge,
  onSaved,
  onCancel,
}: {
  challenge: ApiChallenge | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SaveChallengeRequest>({
    defaultValues: challenge ?? {
      titulo: "",
      descricao: "",
      categoria: "",
      pontos: 100,
    },
  });
  async function save(values: SaveChallengeRequest) {
    setError("");
    try {
      if (challenge) await updateChallenge(challenge.id, values);
      else await createChallenge(values);
      onSaved();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar o desafio.",
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
        {challenge ? `Editar desafio ${challenge.id}` : "Cadastrar desafio"}
      </h3>
      <fieldset
        disabled={isSubmitting}
        className="space-y-4 disabled:opacity-60"
      >
        <label className="block text-sm text-mint">
          Título
          <input
            autoFocus
            className={inputClass}
            aria-invalid={!!errors.titulo}
            {...register("titulo", {
              validate: (value) => !!value.trim() || "Informe o título.",
            })}
          />
          {errors.titulo && (
            <span role="alert" className="mt-1 block text-red-200">
              {errors.titulo.message}
            </span>
          )}
        </label>
        <label className="block text-sm text-mint">
          Descrição
          <textarea
            rows={3}
            className={inputClass}
            aria-invalid={!!errors.descricao}
            {...register("descricao", {
              validate: (value) => !!value.trim() || "Informe a descrição.",
            })}
          />
          {errors.descricao && (
            <span role="alert" className="mt-1 block text-red-200">
              {errors.descricao.message}
            </span>
          )}
        </label>
        <label className="block text-sm text-mint">
          Categoria
          <input
            className={inputClass}
            aria-invalid={!!errors.categoria}
            {...register("categoria", {
              validate: (value) => !!value.trim() || "Informe a categoria.",
            })}
          />
          {errors.categoria && (
            <span role="alert" className="mt-1 block text-red-200">
              {errors.categoria.message}
            </span>
          )}
        </label>
        <label className="block text-sm text-mint">
          Pontos
          <input
            type="number"
            min={1}
            max={10000}
            step={1}
            className={inputClass}
            aria-invalid={!!errors.pontos}
            {...register("pontos", {
              valueAsNumber: true,
              validate: (value) =>
                (Number.isInteger(value) && value >= 1 && value <= 10000) ||
                "Use pontos inteiros entre 1 e 10000.",
            })}
          />
          {errors.pontos && (
            <span role="alert" className="mt-1 block text-red-200">
              {errors.pontos.message}
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={buttonClass}>
            {isSubmitting ? "Salvando..." : "Salvar desafio"}
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

export default function ChallengeManagement({
  initialCreate = false,
}: {
  initialCreate?: boolean;
}) {
  const { items, loading, error, reload } = useApiList(listChallenges);
  const [editor, setEditor] = useState<ApiChallenge | "new" | null>(
    initialCreate ? "new" : null,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [operationError, setOperationError] = useState("");
  function open(value: ApiChallenge | "new") {
    setEditor(value);
    setMessage("");
    setOperationError("");
  }
  async function remove(challenge: ApiChallenge) {
    if (
      !window.confirm(
        `Excluir o desafio “${challenge.titulo}” do banco? Esta operação não pode ser desfeita.`,
      )
    )
      return;
    setBusy(true);
    setMessage("");
    setOperationError("");
    try {
      await deleteChallenge(challenge.id);
      if ((await listChallenges()).some((item) => item.id === challenge.id))
        throw new Error(
          "O desafio continua cadastrado. Atualize a lista antes de repetir.",
        );
      setMessage("Exclusão do desafio confirmada pela API.");
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
    <section id="desafios" className="min-w-0 scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-white">Desafios da API Java</h2>
        <button
          type="button"
          disabled={busy || editor !== null}
          onClick={() => open("new")}
          className={buttonClass}
        >
          Cadastrar desafio
        </button>
      </div>
      <button
        type="button"
        disabled={busy || loading || editor !== null}
        onClick={reload}
        className="mb-5 text-sm font-semibold text-leaf disabled:opacity-50"
      >
        Atualizar desafios
      </button>
      {editor !== null && (
        <ChallengeEditor
          key={editor === "new" ? "new" : editor.id}
          challenge={editor === "new" ? null : editor}
          onCancel={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            setMessage("Desafio salvo e consultado na API com sucesso.");
            reload();
          }}
        />
      )}
      <RequestFeedback
        loading={loading}
        error={error}
        empty={
          !items.length ? "Nenhum desafio cadastrado na API Java." : undefined
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
          {items.map((challenge) => (
            <li
              key={challenge.id}
              className="min-w-0 rounded-2xl border border-white/10 bg-forest-soft p-5"
            >
              <p className="break-words text-sm text-muted">
                ID {challenge.id} · {challenge.categoria}
              </p>
              <h3 className="mt-2 break-words text-lg font-bold text-white">
                {challenge.titulo}
              </h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-mint">
                {challenge.descricao}
              </p>
              <p className="mt-3 font-semibold text-leaf">
                {challenge.pontos} pontos
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy || editor !== null}
                  onClick={() => open(challenge)}
                  className={buttonClass}
                >
                  Editar desafio<span className="sr-only"> {challenge.id}</span>
                </button>
                <button
                  type="button"
                  disabled={busy || editor !== null}
                  onClick={() => void remove(challenge)}
                  className="rounded-full border border-red-300/30 px-4 py-2 text-red-200 disabled:opacity-50"
                >
                  Excluir desafio
                  <span className="sr-only"> {challenge.id}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
