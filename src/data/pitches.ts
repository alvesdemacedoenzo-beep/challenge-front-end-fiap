type Pitch = {
  id: string;
  title: string;
  videoSrc: string;
  youtubeUrl: string;
  youtubeVideoId?: string;
};

// Preencha videoSrc com o caminho do vídeo e youtubeUrl com o link do YouTube.
// Enquanto estiverem vazios, a página exibe os espaços reservados.
export const pitches: Pitch[] = [
  {
    id: "python",
    title: "PITCH PYTHON",
    videoSrc: "",
    youtubeUrl: "https://youtu.be/MQaApM-Mmd4",
    youtubeVideoId: "MQaApM-Mmd4",
  },
  {
    id: "frontend",
    title: "PITCH FRONTEND",
    videoSrc: "",
    youtubeUrl: "https://youtu.be/KheioXjjurU",
    youtubeVideoId: "KheioXjjurU",
  },
];
