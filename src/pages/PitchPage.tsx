import SectionTitle from "../components/SectionTitle";
import { pitches } from "../data/pitches";

export default function PitchPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
      <SectionTitle
        eyebrow="Soul Up · Nexus Elite"
        title="PITCH"
        description="Confira as apresentações de Python e Frontend do projeto Soul Up."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {pitches.map((pitch) => (
          <section
            key={pitch.id}
            aria-labelledby={`pitch-${pitch.id}`}
            className="min-w-0 rounded-2xl border border-white/10 bg-forest-soft/80 p-5 sm:p-6"
          >
            <h2
              id={`pitch-${pitch.id}`}
              className="mb-5 text-xl font-black tracking-tight text-white sm:text-2xl"
            >
              {pitch.title}
            </h2>

            {pitch.videoSrc ? (
              <video
                controls
                preload="metadata"
                aria-label={`Vídeo ${pitch.title}`}
                className="aspect-video w-full rounded-xl bg-black object-contain"
                src={pitch.videoSrc}
              >
                Seu navegador não suporta a reprodução deste vídeo.
                <a href={pitch.videoSrc}>Baixar vídeo {pitch.title}</a>
              </video>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-leaf/25 bg-black/20 px-5 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-leaf/25 bg-leaf/10 text-leaf">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-mint">Vídeo em breve</p>
                  <p className="mt-1 text-sm text-muted">
                    Espaço reservado para o {pitch.title}.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold text-mint">
                Link do YouTube
              </h3>
              {pitch.youtubeUrl ? (
                <a
                  href={pitch.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Assistir ao ${pitch.title} no YouTube (abre em nova aba)`}
                  className="block break-all rounded-xl border border-leaf/30 bg-leaf/5 px-4 py-3 text-sm text-leaf transition hover:border-leaf/60 hover:bg-leaf/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf"
                >
                  {pitch.youtubeUrl}
                </a>
              ) : (
                <p className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-muted">
                  O link do vídeo no YouTube será adicionado em breve.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
