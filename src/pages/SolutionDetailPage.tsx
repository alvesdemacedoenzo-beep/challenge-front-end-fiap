import { useNavigate, useParams } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import { solutionTopics } from "../data/site";

export default function SolutionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const topic = solutionTopics.find((item) => item.slug === slug);

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <SectionTitle
          eyebrow="Solução"
          title="Tópico não encontrado"
          centered
        />
        <button
          type="button"
          onClick={() => navigate("/solucao")}
          className="rounded-full bg-leaf px-6 py-3 font-bold text-forest transition hover:bg-leaf-bright"
        >
          Voltar para a solução
        </button>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-24">
      <SectionTitle
        eyebrow="Detalhe da solução"
        title={topic.title}
        description={topic.summary}
      />
      <div className="rounded-3xl border border-white/10 bg-forest-soft p-6 sm:p-9">
        <p className="text-lg leading-8 text-mint">{topic.detail}</p>
      </div>
      <button
        type="button"
        onClick={() => navigate("/solucao")}
        className="mt-8 rounded-full border border-white/20 px-5 py-3 font-semibold text-white transition hover:border-leaf/50 hover:text-leaf"
      >
        ← Todas as frentes da solução
      </button>
    </article>
  );
}
