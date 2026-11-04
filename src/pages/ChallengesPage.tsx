import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import SectionTitle from "../components/SectionTitle";
import { ApiError, getCurrentAccount, listChallenges, concluirDesafioApi } from "../services/api";
import type { AccountUser, ApiChallenge } from "../services/api";

export default function ChallengesPage() {
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [challenges, setChallenges] = useState<ApiChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<ApiChallenge | null>(null);
  const [evidence, setEvidence] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    getCurrentAccount().then(setAccount).catch(() => setAccount(null));
    
    listChallenges()
      .then(setChallenges)
      .catch(() => setErrorMessage("Erro ao carregar desafios do banco de dados."));
  }, []);

  const selectEvidence = (event: ChangeEvent<HTMLInputElement>) => {
    setEvidence(event.target.files?.[0] ?? null);
    setErrorMessage("");
    setSavedMessage("");
  };

  const submitChallenge = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedChallenge) return;
    if (!evidence) {
      setErrorMessage("Selecione uma foto como evidência antes de concluir.");
      return;
    }

    try {
      if (account?.id) {
         await concluirDesafioApi(account.id, selectedChallenge.id, selectedChallenge.pontos);
      }
      
      setSavedMessage("Desafio concluído! Os pontos foram salvos no banco de dados.");
      setEvidence(null);
      setErrorMessage("");
      setSelectedChallenge(null);
      event.currentTarget.reset();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao conectar com a API Java."
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle eyebrow="Ação sustentável" title="Desafios sustentáveis" description="Escolha uma atividade e ganhe pontos reais no banco de dados." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.length === 0 ? (
           <p className="text-mint">Nenhum desafio encontrado no banco de dados.</p>
        ) : (
          challenges.map((challenge) => (
            <button
              key={challenge.id}
              type="button"
              onClick={() => { setSelectedChallenge(challenge); setSavedMessage(""); }}
              className={`rounded-2xl border p-5 text-left transition focus:outline-2 focus:outline-leaf ${
                selectedChallenge?.id === challenge.id ? "border-leaf bg-leaf/10" : "border-white/10 bg-forest-soft hover:border-leaf/40"
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">ID: {challenge.id}</span>
              <span className="mt-2 block text-lg font-bold text-white">{challenge.titulo}</span>
              <span className="mt-1 block text-sm leading-6 text-mint">{challenge.descricao}</span>
              <span className="mt-4 block font-semibold text-leaf">+{challenge.pontos} pontos</span>
            </button>
          ))
        )}
      </div>

      {selectedChallenge && (
        <section className="mt-8 rounded-3xl border border-leaf/25 bg-forest-soft p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white">Concluir: {selectedChallenge.titulo}</h2>
          <form className="mt-7 space-y-5" onSubmit={submitChallenge}>
            <input type="file" accept="image/*" required onChange={selectEvidence} className="text-white" />
            <p className="text-sm text-muted">A foto é demonstrativa, mas a conclusão atualizará seus pontos no backend.</p>
            {errorMessage && <p className="text-red-300">{errorMessage}</p>}
            {savedMessage && <p className="text-leaf font-bold">{savedMessage}</p>}
            <button type="submit" className="rounded-full bg-leaf px-6 py-3 font-bold text-forest transition hover:bg-leaf-bright">
              Enviar e Ganhar Pontos
            </button>
          </form>
        </section>
      )}
    </div>
  );
}