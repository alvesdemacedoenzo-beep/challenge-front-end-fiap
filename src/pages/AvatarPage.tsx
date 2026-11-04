import SectionTitle from "../components/SectionTitle";

export default function AvatarPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="Mentor digital"
        title="Conheça o papel do Avatar"
        description="O avatar atua como mestre do jogo e mentor do sistema: entende as preferências do grupo e recomenda desafios adequados."
      />

      <section className="max-w-3xl rounded-2xl border border-white/10 bg-forest-soft p-6">
        <h2 className="text-xl font-bold text-white">
          O que torna o modelo diferente?
        </h2>
        <ul className="mt-5 space-y-4 text-sm leading-6 text-mint">
          <li>
            <strong className="text-leaf">Foco coletivo:</strong> quando o grupo
            avança, seus membros acumulam pontos juntos.
          </li>
          <li>
            <strong className="text-leaf">Validação por proximidade:</strong>{" "}
            outras pessoas podem confirmar a realização da ação.
          </li>
          <li>
            <strong className="text-leaf">Gamificação real:</strong> rankings e
            desafios ajudam a manter o engajamento.
          </li>
        </ul>
      </section>
    </div>
  );
}
