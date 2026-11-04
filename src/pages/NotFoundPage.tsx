import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-28 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-leaf">
        Erro 404
      </p>
      <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
        Esta página não existe
      </h1>
      <p className="mt-4 text-mint">
        Confira o endereço ou volte para a página inicial.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-full bg-leaf px-6 py-3 font-bold text-forest transition hover:bg-leaf-bright"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
