let audio: HTMLAudioElement | null = null;

export function playSound(type: string) {
  stopSound();

  let src = "";

  switch (type) {
    case "breathing":
      src = "/sounds/breathing.mp3";
      break;
    case "meditation":
      src = "/sounds/rain.mp3";
      break;
    case "bodyscan":
      src = "/sounds/soft-piano.mp3";
      break;
    case "grounding":
      src = "/sounds/nature.mp3";
      break;
    default:
      return;
  }

  audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0.4;
  audio.play().catch(() => {});
}

export function stopSound() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio = null;
  }
}
