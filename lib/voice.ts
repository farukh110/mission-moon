import type { StoryLine } from "@/data/types";
import { COUNTDOWN_LINES } from "@/data/narration";
import { VOICE_FILES } from "@/data/voiceFiles";

// Urdu narration plays from MP3 files stored in public/audio/ur (made once by `npm run audio`),
// so it works fully offline on any computer. The English subtitle of each line is shown while it plays.
let cancelCurrent: (() => void) | null = null;

/** The countdown number as a story line (Urdu voice, number as subtitle). */
export const countdownLine = (n: number): StoryLine => COUNTDOWN_LINES[n] ?? { ur: String(n), en: String(n) };

export function stopVoice() {
  cancelCurrent?.();
  cancelCurrent = null;
}

interface NarrateOptions {
  volume: number;
  /** Called with the English subtitle of the line being spoken, and with "" when finished or stopped. */
  onLine: (text: string) => void;
}

/** Says the lines one after another (replacing anything being said) and returns a function that stops it. */
export function narrate(lines: StoryLine[], { volume, onLine }: NarrateOptions): () => void {
  stopVoice();
  let cancelled = false;
  let index = 0;
  let timer: number | undefined;
  let audio: HTMLAudioElement | null = null;

  const next = () => {
    if (cancelled) return;
    if (index >= lines.length) {
      onLine("");
      return;
    }
    const line = lines[index++];
    onLine(line.en);
    // Every subtitle stays on screen long enough to read, even if the audio is shorter.
    const shownAt = performance.now();
    const minMs = Math.max(1500, line.en.length * 55);
    const done = () => {
      timer = window.setTimeout(next, Math.max(0, minMs - (performance.now() - shownAt)));
    };
    const file = VOICE_FILES[line.ur];
    if (!file) return done();
    audio = new Audio(file);
    audio.volume = Math.min(1, Math.max(0, volume));
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
  };

  const cancel = () => {
    cancelled = true;
    window.clearTimeout(timer);
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio = null;
    }
    onLine("");
  };
  cancelCurrent = cancel;
  next();
  return cancel;
}
