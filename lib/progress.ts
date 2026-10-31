const PROGRESS_KEY = "mission-moon:progress:v3";
const SETTINGS_KEY = "mission-moon:settings:v1";

export interface Progress {
  currentStage: number;
  /** Milestones: dressed, taxi, launch, journey, landing, complete. */
  events: string[];
}

export interface Settings {
  sound: boolean;
  volume: number;
  reducedEffects: boolean;
  /** Urdu voice and subtitles. */
  voice: boolean;
  /** The first-run check for a weak computer has been done. */
  qualityChecked: boolean;
}

export const DEFAULT_PROGRESS: Progress = { currentStage: 0, events: [] };
export const DEFAULT_SETTINGS: Settings = { sound: true, volume: 0.5, reducedEffects: false, voice: true, qualityChecked: false };

function read<T extends object>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<T>) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: object) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked (private mode); the game still works without saving.
  }
}

export const loadProgress = () => read(PROGRESS_KEY, DEFAULT_PROGRESS);
export const saveProgress = (p: Progress) => write(PROGRESS_KEY, p);
export const loadSettings = () => read(SETTINGS_KEY, DEFAULT_SETTINGS);
export const saveSettings = (s: Settings) => write(SETTINGS_KEY, s);
