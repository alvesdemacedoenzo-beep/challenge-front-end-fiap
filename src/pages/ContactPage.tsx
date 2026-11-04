import { useState } from "react";
import { useForm } from "react-hook-form";
import SectionTitle from "../components/SectionTitle";

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-white/15 bg-forest px-4 py-3 text-white outline-none transition placeholder:text-muted/70 focus:border-leaf";
const labelClass = "block text-sm font-semibold text-mint";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = () => {
    setSubmitted(true);
    reset();
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="Contato"
        title="Vamos conversar?"
        description="Estamos prontos para ouvir dúvidas, sugestões e ideias para futuros projetos."
      />

      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-forest-soft p-6">
            <h2 className="text-lg font-bold text-white">
              Informações da equipe
            </h2>
            <p className="mt-4 text-sm leading-6 text-mint">
              Acompanhe o projeto e fale com os integrantes pelos perfis
              listados na página da equipe.
            </p>
            <a
              className="mt-4 inline-flex font-semibold text-leaf underline-offset-4 hover:underline"
              href="mailto:soulup@gmail.com"
            >
              soulup@gmail.com
            </a>
            <p className="mt-3 text-sm text-muted">São Paulo — SP, Brasil</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-forest-soft p-6">
            <h2 className="text-lg font-bold text-white">
              Horário de atendimento
            </h2>
            <p className="mt-3 text-sm leading-7 text-mint">
              Segunda a sexta: 9h às 18h
              <br />
              Sábados: 10h às 14h
              <br />
              Domingos e feriados: fechado
            </p>
          </div>
        </aside>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-white/10 bg-forest-soft/80 p-6 sm:p-8"
        >
          <h2 className="text-2xl font-bold text-white">Envie uma mensagem</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Preencha os campos para validar sua mensagem. Este formulário é
            demonstrativo e não envia nem armazena dados.
          </p>

          {submitted && (
            <p
              role="status"
              className="mt-5 rounded-xl border border-leaf/30 bg-leaf/10 p-4 text-sm text-leaf"
            >
              Formulário validado. O envio de mensagens de contato ainda não
              está disponível; sua mensagem não foi enviada.
            </p>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="name">
                Nome completo
              </label>
              <input
                id="name"
                autoComplete="name"
                placeholder="Seu nome"
                aria-invalid={Boolean(errors.name)}
                className={inputClass}
                {...register("name", { required: "Informe seu nome." })}
              />
              {errors.name && (
                <p role="alert" className="mt-2 text-sm text-red-300">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@email.com"
                aria-invalid={Boolean(errors.email)}
                className={inputClass}
                {...register("email", {
                  required: "Informe seu e-mail.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Informe um e-mail válido.",
                  },
                })}
              />
              {errors.email && (
                <p role="alert" className="mt-2 text-sm text-red-300">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5">
            <label className={labelClass} htmlFor="subject">
              Assunto
            </label>
            <input
              id="subject"
              placeholder="Como podemos ajudar?"
              aria-invalid={Boolean(errors.subject)}
              className={inputClass}
              {...register("subject", { required: "Informe o assunto." })}
            />
            {errors.subject && (
              <p role="alert" className="mt-2 text-sm text-red-300">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="mt-5">
            <label className={labelClass} htmlFor="message">
              Mensagem
            </label>
            <textarea
              id="message"
              rows={5}
              placeholder="Escreva sua mensagem..."
              aria-invalid={Boolean(errors.message)}
              className={`${inputClass} resize-y`}
              {...register("message", {
                required: "Escreva uma mensagem.",
                minLength: {
                  value: 10,
                  message: "A mensagem deve ter pelo menos 10 caracteres.",
                },
              })}
            />
            {errors.message && (
              <p role="alert" className="mt-2 text-sm text-red-300">
                {errors.message.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="mt-6 rounded-full bg-leaf px-6 py-3 font-bold text-forest transition hover:bg-leaf-bright focus:outline-2 focus:outline-offset-4 focus:outline-leaf"
          >
            Validar mensagem
          </button>
        </form>
      </div>
    </div>
  );
}
