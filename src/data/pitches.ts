type Pitch = {
  id: string;
  title: string;
  videoSrc: string;
  youtubeUrl: string;
};

// Preencha videoSrc com o caminho do vídeo e youtubeUrl com o link do YouTube.
// Enquanto estiverem vazios, a página exibe os espaços reservados.
export const pitches: Pitch[] = [
  {
    id: "python",
    title: "PITCH PYTHON",
    videoSrc: "",
    youtubeUrl: "",
  },
  {
    id: "frontend",
    title: "PITCH FRONTEND",
    videoSrc: "",
    youtubeUrl: "",
  },
];
