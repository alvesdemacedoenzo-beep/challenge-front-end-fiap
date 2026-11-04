import InfoCard from "../components/InfoCard";
import SectionTitle from "../components/SectionTitle";

const pillars = [
  {
    title: "Gamificação coletiva",
    description:
      "Grupos, níveis, conquistas, rankings e desafios tornam a sustentabilidade uma experiência social e recorrente, com mutirões, gincanas e plantios urbanos.",
  },
  {
    title: "Validação comunitária",
    description:
      "As ações são publicadas com evidências e submetidas à confirmação de membros diferentes do autor, ajudando a proteger a confiança na plataforma.",
  },
  {
    title: "Reputação sustentável",
    description:
      "Empresas e marcas podem apoiar campanhas e apresentar indicadores de impacto, fortalecendo sua reputação junto à comunidade.",
  },
  {
    title: "Capacitação profissional",
    description:
      "A proposta conecta o engajamento sustentável a oportunidades de formação e desenvolvimento pessoal e profissional.",
  },
];

const journey = [
  ["Descobrir", "Encontrar desafios sustentáveis no feed."],
  ["Participar", "Escolher uma atividade e consultar suas regras."],
  ["Agir", "Realizar a ação e publicar uma evidência."],
  ["Validar", "A comunidade analisa e confirma a atividade."],
  ["Conquistar", "A validação libera pontos e reconhecimentos."],
  ["Evoluir", "Avançar no ranking e conhecer novas oportunidades."],
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="Sobre o projeto"
        title="Sustentabilidade que aproxima pessoas"
        description="Uma rede social sustentável criada para transformar atitudes ambientais em experiências sociais, conectando pessoas, desafios, reconhecimento, impacto e oportunidades de desenvolvimento."
      />

      <section className="grid gap-6 md:grid-cols-2">
        <InfoCard title="Quem somos">
          <p>
            A <strong className="text-white">Soul Up</strong> busca transformar
            a maneira como as pessoas se relacionam com a sustentabilidade.
            Muitos jovens têm consciência ambiental, mas encontram dificuldades
            para transformar essa consciência em atitudes concretas quando as
            experiências são individuais e sem retorno visível.
          </p>
          <p className="mt-3">
            Em vez de uma lista de tarefas, a plataforma cria um ambiente para
            participar de desafios, formar grupos, compartilhar evidências,
            validar ações, conquistar reconhecimento e acompanhar o próprio
            desenvolvimento.
          </p>
        </InfoCard>
        <InfoCard title="O desafio que identificamos">
          A intenção de cuidar do meio ambiente nem sempre se transforma em
          ação. A falta de incentivo social, acompanhamento e validação pode
          reduzir o engajamento e a confiança em sistemas de pontuação.
        </InfoCard>
      </section>

      <section className="mt-16">
        <SectionTitle
          eyebrow="Nossa proposta"
          title="Quatro pilares para gerar impacto"
          description="A plataforma combina ação ambiental, interação social, confiança, reputação e oportunidades em uma mesma experiência."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <InfoCard key={pillar.title} title={pillar.title}>
              {pillar.description}
            </InfoCard>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle
          eyebrow="Experiência do usuário"
          title="Do desafio ao impacto"
          description="Uma jornada de participação, validação, reconhecimento e benefícios potenciais."
        />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {journey.map(([title, description], index) => (
            <li
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-leaf">
                Etapa {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-mint">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <InfoCard title="Inovação e modelo de negócio">
          A inovação está em transformar ações ambientais individuais em
          experiências coletivas, participativas e verificáveis. O modelo prevê
          patrocínios de desafios, campanhas de marcas, recursos empresariais e
          indicadores de impacto.
        </InfoCard>
        <InfoCard title="Capacitação profissional">
          SENAI, SENAC e ETEC são instituições pretendidas como possíveis
          parceiras educacionais, sem convênios formalizados. A Soul Up não
          garante vagas, bolsas, gratuidades ou certificados; oportunidades e
          requisitos dependem de cada instituição.
        </InfoCard>
      </section>
    </div>
  );
}
