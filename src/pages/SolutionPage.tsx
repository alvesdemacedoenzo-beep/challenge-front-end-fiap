import { Link } from "react-router-dom";
import InfoCard from "../components/InfoCard";
import SectionTitle from "../components/SectionTitle";
import { solutionTopics } from "../data/site";

export default function SolutionPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="A solução"
        title="Uma jornada para fazer o bem acontecer"
        description="A Soul Up transforma sustentabilidade em uma experiência social, agradável e colaborativa, conectando desafios, comunidade e reconhecimento."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {solutionTopics.map((topic) => (
          <Link
            key={topic.slug}
            to={`/solucao/${topic.slug}`}
            className="rounded-2xl focus:outline-2 focus:outline-offset-4 focus:outline-leaf"
          >
            <InfoCard title={topic.title} className="h-full">
              <p>{topic.summary}</p>
              <span className="mt-4 block text-sm font-semibold text-leaf">
                Ver detalhes →
              </span>
            </InfoCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
