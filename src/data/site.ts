import bryanPhoto from "../assets/team/bryan.png";
import enzoPhoto from "../assets/team/enzo.png";
import raphaelPhoto from "../assets/team/raphael.png";
import victorPhoto from "../assets/team/victor.png";
import viniciosPhoto from "../assets/team/vinicios.png";

interface TeamIdentity {
  name: string;
  photo: string;
}

interface TeamAcademicDetails {
  rm: string;
  turma: string;
}

interface TeamProfiles {
  linkedin: string;
  github: string;
}

export type TeamMember = TeamIdentity & TeamAcademicDetails & TeamProfiles;

export const teamMembers: TeamMember[] = [
  {
    name: "Raphael Ferreira Tavares",
    rm: "569767",
    turma: "1TDSPY",
    photo: raphaelPhoto,
    linkedin:
      "https://www.linkedin.com/in/raphael-ferreira-0111323b8?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    github: "https://github.com/raph-ferreira",
  },
  {
    name: "Bryan Germano",
    rm: "569716",
    turma: "1TDSPY",
    photo: bryanPhoto,
    linkedin:
      "https://www.linkedin.com/in/bryan-germano-84016729b?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    github: "https://github.com/BryanGermano",
  },
  {
    name: "Enzo Macedo",
    rm: "569427",
    turma: "1TDSPY",
    photo: enzoPhoto,
    linkedin:
      "https://www.linkedin.com/in/enzo-alves-de-macedo-408359356?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    github: "https://github.com/alvesdemacedoenzo-beep",
  },
  {
    name: "Victor Hugo Velasco Guzman",
    rm: "573173",
    turma: "1TDSPY",
    photo: victorPhoto,
    linkedin:
      "https://www.linkedin.com/in/victor-hugo-velasco-guzman-296256235?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    github: "https://github.com/velascoguzmanvictorhugo-ui",
  },
  {
    name: "Vinicios Alves",
    rm: "573002",
    turma: "1TDSPY",
    photo: viniciosPhoto,
    linkedin:
      "https://www.linkedin.com/in/vinicios-alves-dos-santos-434128327/",
    github: "https://github.com/ViniciosAlvees",
  },
];

export type SolutionTopic = {
  slug: string;
  title: string;
  summary: string;
  detail: string;
};

export const solutionTopics: SolutionTopic[] = [
  {
    slug: "desafios",
    title: "Desafios sustentáveis",
    summary: "Ações individuais e coletivas que aproximam intenção e impacto.",
    detail:
      "Os usuários encontram atividades como reciclagem, limpeza de praças, economia de energia e plantio. Cada desafio apresenta uma ação concreta e pode ser realizado em grupo para fortalecer a participação comunitária.",
  },
  {
    slug: "avatar",
    title: "Avatar inteligente",
    summary: "Um mentor que recomenda desafios e acompanha a jornada.",
    detail:
      "O avatar atua como mestre do jogo e mentor: entende os interesses dos participantes, sugere desafios adequados ao perfil do grupo, acompanha metas e celebra as conquistas.",
  },
  {
    slug: "validacao",
    title: "Validação comunitária",
    summary: "Evidências analisadas por outros membros da comunidade.",
    detail:
      "Depois de realizar uma ação, o participante publica uma evidência para análise de membros diferentes do autor. No protótipo, dois validadores externos confirmam a atividade antes da atribuição de pontos.",
  },
  {
    slug: "gamificacao",
    title: "Gamificação e reconhecimento",
    summary: "Pontos, níveis e rankings para reconhecer a participação.",
    detail:
      "A participação em desafios e a validação das evidências podem gerar pontos, conquistas e evolução no ranking. As mecânicas foram pensadas para reconhecer o esforço coletivo e manter o engajamento.",
  },
  {
    slug: "impacto",
    title: "Impacto e oportunidades",
    summary: "Uma ponte entre comunidades, organizações e capacitação.",
    detail:
      "A proposta conecta usuários, empresas, marcas e organizações ambientais. Desafios patrocinados e oportunidades de capacitação são possibilidades futuras, sem representar parcerias formalizadas ou benefícios garantidos.",
  },
];

export const faqItems = [
  {
    question: "O que é a Soul Up?",
    answer:
      "A Soul Up é uma rede social sustentável que transforma atitudes ambientais em experiências sociais. A plataforma utiliza desafios, gamificação, validação comunitária, rankings e conquistas para incentivar práticas sustentáveis e gerar reconhecimento entre os usuários.",
  },
  {
    question: "Qual problema a Soul Up busca resolver?",
    answer:
      "A plataforma busca enfrentar a dificuldade de transformar a consciência ambiental em ações práticas e frequentes. A Soul Up cria incentivos para que os usuários participem de atividades sustentáveis e compartilhem seus resultados com a comunidade.",
  },
  {
    question: "Como funcionam os desafios?",
    answer:
      "O usuário acessa um desafio disponível, realiza a ação proposta e publica uma evidência. A comunidade participa da validação e, após a confirmação, o usuário pode receber pontos, reconhecimento e avançar no ranking.",
  },
  {
    question: "Como funciona a validação comunitária?",
    answer:
      "A validação é realizada por outros membros da comunidade. O próprio usuário não pode validar sua participação. No protótipo, são necessários dois validadores diferentes para confirmar a evidência apresentada.",
  },
  {
    question: "O que acontece depois que um desafio é validado?",
    answer:
      "Após a validação, o usuário pode receber pontos e avançar no sistema de ranking e conquistas. Essas mecânicas ajudam a transformar as ações sustentáveis em uma experiência coletiva e contínua.",
  },
  {
    question: "Como funciona a gamificação?",
    answer:
      "A Soul Up utiliza pontos, rankings, conquistas e desafios coletivos para incentivar a participação e o reconhecimento dentro da comunidade.",
  },
  {
    question: "Qual é a função do Avatar?",
    answer:
      "O Avatar funciona como um guia de engajamento: pode apresentar perguntas sobre os interesses do usuário, recomendar desafios compatíveis, lembrar metas e celebrar conquistas.",
  },
  {
    question: "As empresas podem participar da Soul Up?",
    answer:
      "A proposta prevê que empresas e marcas sustentáveis apoiem desafios e campanhas, demonstrando seu impacto socioambiental e se aproximando de comunidades interessadas em sustentabilidade.",
  },
  {
    question: "Como a Soul Up pode gerar receita?",
    answer:
      "O modelo de negócio prevê receitas por meio de patrocínios de desafios, campanhas de marcas, planos e funcionalidades empresariais, publicidade contextual e, futuramente, projetos institucionais.",
  },
  {
    question: "A Soul Up possui parceria com SENAI, SENAC ou ETEC?",
    answer:
      "Essas instituições são consideradas possíveis parceiras educacionais. Isso não representa uma parceria formal ou uma garantia de participação em cursos.",
  },
  {
    question: "Como funciona a capacitação profissional?",
    answer:
      "A plataforma pretende conectar usuários a oportunidades de formação oferecidas por instituições educacionais, em áreas como tecnologia, logística, indústria, gastronomia, serviços, comércio e gestão.",
  },
  {
    question: "A Soul Up garante bolsas, vagas ou certificados?",
    answer:
      "Não. Bolsas, vagas, gratuidades e certificados dependem das condições e regras da instituição responsável. A Soul Up funciona como uma ponte para essas possibilidades, sem garantir sua concessão.",
  },
  {
    question: "Que tipos de ações sustentáveis podem ser realizadas?",
    answer:
      "Os desafios podem envolver reciclagem, limpeza de espaços públicos, economia de energia, plantio e outras práticas sustentáveis, realizadas individual ou coletivamente e submetidas à validação.",
  },
  {
    question: "O que diferencia a Soul Up de outras redes sociais?",
    answer:
      "A Soul Up combina sustentabilidade, interação social e gamificação. Entre seus diferenciais estão a validação comunitária, os desafios coletivos, a reputação sustentável e a conexão com oportunidades de capacitação.",
  },
];
