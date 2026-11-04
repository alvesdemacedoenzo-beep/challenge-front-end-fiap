import { useState } from "react";
import SectionTitle from "../components/SectionTitle";
import { faqItems } from "../data/site";

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="Central de informações"
        title="Perguntas frequentes"
        description="Respostas sobre a Soul Up, seu funcionamento, desafios, validação comunitária, gamificação e oportunidades."
      />
      <div className="space-y-3">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          const answerId = `faq-answer-${index}`;
          return (
            <article
              key={item.question}
              className="rounded-2xl border border-white/10 bg-forest-soft/70"
            >
              <h2>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left font-semibold text-white sm:px-6"
                >
                  {item.question}
                  <span aria-hidden="true" className="text-xl text-leaf">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
              </h2>
              {isOpen && (
                <p
                  id={answerId}
                  className="border-t border-white/10 px-5 py-5 leading-7 text-mint sm:px-6"
                >
                  {item.answer}
                </p>
              )}
            </article>
          );
        })}
      </div>
      <div className="mt-10 rounded-2xl border border-leaf/20 bg-leaf/5 p-6">
        <h2 className="text-xl font-bold text-white">
          Transformando atitudes em impacto
        </h2>
        <p className="mt-3 leading-7 text-mint">
          A Soul Up foi criada para mostrar que pequenas ações podem gerar
          grandes mudanças quando realizadas de forma coletiva. Mais do que uma
          rede social, a plataforma busca criar uma comunidade engajada em
          sustentabilidade, reconhecimento e desenvolvimento profissional.
        </p>
      </div>
    </div>
  );
}
