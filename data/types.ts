export type Vec3 = [number, number, number];

/** One line of narration: spoken in Urdu, shown in English. */
export interface StoryLine {
  ur: string;
  en: string;
}

export interface HotspotContent {
  id: string;
  title: string;
  short: string;
  detail: string[];
  keyConcept: string;
  instructions: string;
  /** World position of the clickable dot. */
  position: Vec3;
  /** Optional hotspots are not needed to finish the stage. */
  optional?: boolean;
}

/** A guided camera position. In walking stages `walkTo` sends the astronaut there instead. */
export interface ViewDef {
  id: string;
  label: string;
  position: Vec3;
  target: Vec3;
  walkTo?: Vec3;
}

export type SceneId =
  | "earth-moon"
  | "school"
  | "road"
  | "research"
  | "training"
  | "launch"
  | "orbit"
  | "journey"
  | "lunar";

export type StageKind = "explore" | "launch" | "journey" | "landing" | "taxi" | "complete";

/** Timed animation (launch or landing) with simple captions. */
export interface SequenceDef {
  countdown: number;
  duration: number;
  autoStart: boolean;
  phases: { until: number; text: string }[];
  manualHelp?: string;
  doneTitle: string;
  doneText: string[];
}

export interface StageDef {
  id: string;
  title: string;
  summary: string;
  objective: string;
  kind: StageKind;
  scene: SceneId;
  views: ViewDef[];
  hotspots: HotspotContent[];
  /** The scene moves on by itself: after `seconds`, counted from entering the scene or from finishing its task. */
  autoAdvance?: { seconds: number; after: "enter" | "event" };
  /** What is said in Urdu (`ur`) and shown as an English subtitle (`en`). `intro` plays when the scene opens, `done` when its task finishes. */
  story: { intro: StoryLine[]; done?: StoryLine[] };
  /** One short control hint shown on screen, e.g. which keys to press. */
  hint?: string;
  /** Camera zoom limits for orbit controls. */
  orbit?: { min: number; max: number };
  /** Free walking with WASD (lunar surface). */
  walk?: boolean;
  sequence?: SequenceDef;
  /** Shown as a reminder that this is a simulation. */
  disclaimer?: string;
}
