import { Howl } from 'howler';

type SoundName = 'card-flip' | 'card-deal' | 'chip-bet' | 'fold' | 'turn-ding' | 'win-fanfare';

const soundCache = new Map<SoundName, Howl>();
let muted = false;

function getSound(name: SoundName): Howl {
  if (!soundCache.has(name)) {
    const sound = new Howl({
      src: [`/sounds/${name}.mp3`],
      volume: 0.5,
      preload: false,
    });
    soundCache.set(name, sound);
  }
  return soundCache.get(name)!;
}

export function playSound(name: SoundName) {
  if (muted) return;
  try {
    const sound = getSound(name);
    sound.play();
  } catch {
    // Silently fail if sound can't play
  }
}

export function setMuted(value: boolean) {
  muted = value;
  Howler.mute(value);
}

export function isMuted(): boolean {
  return muted;
}

export function haptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(50);
  }
}
