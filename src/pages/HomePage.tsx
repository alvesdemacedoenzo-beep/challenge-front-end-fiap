import { useNavigate } from "react-router-dom";
import InfoCard from "../components/InfoCard";

const destinations = [
  {
    title: "Sobre o projeto",
    text: "Conheça o propósito e os pilares da Soul Up.",
    to: "/sobre",
  },
  {
    title: "Nossa solução",
    text: "Veja como a tecnologia transforma atitudes em impacto.",
    to: "/solucao",
  },
  {
    title: "Avatar mentor",
    text: "Descubra como o guia acompanha cada desafio.",
    to: "/avatar",
  },
  {
    title: "Integrantes",
    text: "Conheça as pessoas por trás desta iniciativa.",
    to: "/integrantes",
  },
  {
    title: "Perguntas frequentes",
    text: "Encontre respostas sobre a plataforma.",
    to: "/faq",
  },
  {
    title: "Fale com a equipe",
    text: "Envie uma mensagem para o nosso time.",
    to: "/contato",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <section className="grid min-h-[570px] items-center gap-12 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-24">
        <div>
          <p className="mb-6 inline-flex rounded-full border border-leaf/30 bg-leaf/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-leaf">
            Gamificação &amp; sustentabilidade
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Pequenas ações.
            <span className="block text-leaf">Grande movimento.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-mint">
            A Soul Up transforma a sustentabilidade em uma experiência social e
            coletiva, aproximando pessoas, desafios e impacto positivo.
          </p>
          <blockquote className="mt-7 max-w-xl border-l-2 border-leaf/70 pl-5 text-base italic leading-7 text-muted">
            “Unir a vontade de socializar com a vontade de melhorar o mundo de
            um jeito que não parece lição de casa.”
          </blockquote>
          <div className="mt-9 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/solucao")}
              className="rounded-full bg-leaf px-6 py-3 font-bold text-forest transition hover:bg-leaf-bright focus:outline-2 focus:outline-offset-4 focus:outline-leaf"
            >
              Conheça a solução
            </button>
            <button
              type="button"
              onClick={() => navigate("/sobre")}
              className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-leaf/60 hover:text-leaf"
            >
              Sobre a Soul Up
            </button>
            <button
              type="button"
              onClick={() => navigate("/cadastro")}
              className="rounded-full border border-leaf/40 px-6 py-3 font-semibold text-leaf transition hover:bg-leaf/10 focus:outline-2 focus:outline-offset-4 focus:outline-leaf"
            >
              Cadastre-se
            </button>
          </div>
        </div>

        <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-full border border-leaf/20 bg-[radial-gradient(circle,rgba(163,243,107,0.16),rgba(13,33,21,0.25)_48%,transparent_70%)]">
          <div className="absolute inset-[12%] rounded-full border border-dashed border-leaf/25" />
          <div className="absolute inset-[24%] rounded-full border border-leaf/20" />
          <div className="flex h-40 w-40 items-center justify-center rounded-[2.5rem] border border-leaf/35 bg-forest-soft text-center text-lg font-bold text-leaf shadow-[0_0_90px_rgba(163,243,107,0.15)] sm:h-48 sm:w-48">
            Sustentabilidade
          </div>
          <span className="absolute left-[12%] top-[27%] rounded-full border border-white/10 bg-forest-soft px-4 py-2 text-sm text-mint">
            Ação
          </span>
          <span className="absolute right-[3%] top-[10%] rounded-full border border-white/10 bg-forest-soft px-4 py-2 text-sm text-mint">
            Comunidade
          </span>
          <span className="absolute bottom-[20%] left-[15%] rounded-full border border-white/10 bg-forest-soft px-4 py-2 text-sm text-mint">
            Impacto
          </span>
        </div>
      </section>

      <section className="pb-20">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf">
              Explore
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Um projeto feito para agir junto
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-muted">
            Desafios sustentáveis, validação comunitária e reconhecimento em uma
            única jornada.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <button
              key={destination.to}
              type="button"
              onClick={() => navigate(destination.to)}
              className="text-left"
            >
              <InfoCard title={destination.title}>
                <span>{destination.text}</span>
                <span className="mt-4 block text-sm font-semibold text-leaf">
                  Saiba mais →
                </span>
              </InfoCard>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
