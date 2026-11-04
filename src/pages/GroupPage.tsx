import { useState } from "react";
import { Link } from "react-router-dom";
import type { FormEvent } from "react";
import SectionTitle from "../components/SectionTitle";
import { ApiError, createGroup, listUsers, getGroup } from "../services/api";
import type { ApiUser } from "../services/api";

export default function GroupPage() {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<ApiUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdGroupId, setCreatedGroupId] = useState<number | null>(null);

  const findUsers = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!search.trim()) {
      setErrorMessage("Digite um nome ou e-mail para pesquisar.");
      return;
    }

    setIsSearching(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const allUsers = await listUsers();
      const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
      setUsers(
        allUsers.filter(
          (user) =>
            user.nome.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
            user.email.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
        ),
      );
      setHasSearched(true);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? `Não foi possível buscar usuários (HTTP ${error.status}).`
          : error instanceof Error
            ? error.message
            : "Não foi possível conectar à API.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const toggleUser = (user: ApiUser) => {
    setSelectedUsers((selected) =>
      selected.some((item) => item.id === user.id)
        ? selected.filter((item) => item.id !== user.id)
        : [...selected, user],
    );
  };

  const submitGroup = async () => {
    if (!groupName.trim()) {
      setErrorMessage("Informe um nome para o grupo.");
      return;
    }
    setIsCreating(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const createdGroup = await createGroup({
        nome: groupName.trim(),
        membros: selectedUsers.map((user) => ({ id: user.id })),
      });
      if (!createdGroup) {
        throw new Error("A API não confirmou a criação do grupo.");
      }
      setCreatedGroupId(createdGroup.id);
      setSuccessMessage(
        `Grupo “${createdGroup.nome}” criado. Verificando os membros...`,
      );
      const persisted = await getGroup(createdGroup.id);
      const confirmedIds = new Set(
        persisted.membros?.map((member) => member.id),
      );
      const confirmed = selectedUsers.every((member) =>
        confirmedIds.has(member.id),
      );
      setSuccessMessage(
        confirmed
          ? `Grupo “${createdGroup.nome}” cadastrado e consultado na API com sucesso.`
          : `O grupo “${createdGroup.nome}” foi criado, mas a API não confirmou os membros. Não repita o cadastro; o vínculo precisa ser corrigido no servidor.`,
      );
      setGroupName("");
      setSearch("");
      setUsers([]);
      setHasSearched(false);
      setSelectedUsers([]);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? `Não foi possível criar o grupo (HTTP ${error.status}).`
          : error instanceof Error
            ? error.message
            : "Não foi possível conectar à API.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="Comunidade Soul Up"
        title="Cadastrar grupo"
        description="Dê um nome ao grupo e pesquise pessoas por nome ou e-mail para convidá-las."
      />

      <p className="mb-5 rounded-xl border border-leaf/20 bg-leaf/5 p-4 text-sm leading-6 text-mint">
        Escolha um nome e selecione os participantes. Após o cadastro, vamos
        consultar o grupo para verificar os membros confirmados.
      </p>

      <div className="space-y-8 rounded-3xl border border-white/10 bg-forest-soft/80 p-6 sm:p-8">
        <div>
          <label
            htmlFor="group-name"
            className="block text-sm font-semibold text-mint"
          >
            Nome do grupo
          </label>
          <input
            id="group-name"
            required
            maxLength={100}
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="Ex.: Guardiões do bairro"
            className="mt-2 w-full rounded-xl border border-white/15 bg-forest px-4 py-3 text-white outline-none transition placeholder:text-muted/70 focus:border-leaf"
          />
        </div>

        <section>
          <h2 className="text-lg font-bold text-white">Adicionar pessoas</h2>
          <form
            onSubmit={findUsers}
            className="mt-3 flex flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="user-search" className="sr-only">
              Pesquisar por nome ou e-mail
            </label>
            <input
              id="user-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setUsers([]);
                setHasSearched(false);
              }}
              placeholder="Nome ou e-mail"
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-forest px-4 py-3 text-white outline-none transition placeholder:text-muted/70 focus:border-leaf"
            />
            <button
              type="submit"
              className="rounded-full border border-leaf/40 px-5 py-3 font-semibold text-leaf transition hover:bg-leaf/10"
              disabled={isSearching}
            >
              {isSearching ? "Pesquisando..." : "Pesquisar"}
            </button>
          </form>

          {users.length > 0 && (
            <ul className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10">
              {users.map((user) => {
                const isSelected = selectedUsers.some(
                  (item) => item.id === user.id,
                );
                return (
                  <li
                    key={user.id}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <span className="min-w-0">
                      <strong className="block truncate text-white">
                        {user.nome}
                      </strong>
                      <span className="block truncate text-sm text-muted">
                        {user.email}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleUser(user)}
                      className="shrink-0 rounded-full border border-leaf/40 px-4 py-2 text-sm font-semibold text-leaf transition hover:bg-leaf/10"
                    >
                      {isSelected ? "Remover" : "Adicionar"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {hasSearched &&
            !isSearching &&
            users.length === 0 &&
            !errorMessage && (
              <p className="mt-4 text-sm text-muted">
                Nenhum usuário encontrado com esse nome ou e-mail.
              </p>
            )}
          {selectedUsers.length > 0 && (
            <p className="mt-4 text-sm text-mint">
              {selectedUsers.length} pessoa(s) selecionada(s):{" "}
              {selectedUsers.map((user) => user.nome).join(", ")}
            </p>
          )}
        </section>

        {errorMessage && (
          <p
            role="alert"
            className="rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-200"
          >
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p role="status" className="text-sm text-leaf">
            {successMessage}
          </p>
        )}
        <button
          type="button"
          onClick={submitGroup}
          disabled={isCreating || createdGroupId !== null}
          className="w-full rounded-full bg-leaf px-6 py-3 font-bold text-forest transition hover:bg-leaf-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCreating ? "Criando grupo..." : "Criar grupo"}
        </button>
        {createdGroupId !== null && (
          <Link
            to={`/grupos/${createdGroupId}`}
            className="block font-semibold text-leaf hover:underline"
          >
            Ver grupo criado
          </Link>
        )}
        <Link
          to="/grupos"
          className="inline-flex font-semibold text-leaf hover:underline"
        >
          Consultar grupos cadastrados
        </Link>
      </div>
    </div>
  );
}
