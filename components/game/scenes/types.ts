import type { SequenceState } from "@/hooks/useSequence";
import type { StageDef, StoryLine, Vec3 } from "@/data/types";
import type { SoundName } from "@/lib/sound";

/** Props shared by every 3D scene. */
export interface SceneProps {
  stage: StageDef;
  /** False pauses decorative animation. */
  motion: boolean;
  reducedEffects: boolean;
  sequence: SequenceState;
  /** Lets a scene play a sound effect (footsteps, hatch). */
  onSound: (name: SoundName) => void;
  /** The player is flying the rocket / driving the taxi (arrow keys, mouse and on-screen buttons). */
  manualFlight: boolean;
  /** Called when the player reaches the goal of a manual flight or drive. */
  onFlightDone: () => void;
  /** Engine thrust started or stopped (for the engine sound). */
  onThrust: (on: boolean) => void;
  /** Taxi engine hum, 0 (silent) to 1 (full speed). */
  onEngine: (level: number) => void;
  /** City traffic noise on or off (called repeatedly while the road scene is on screen). */
  onTraffic: (on: boolean) => void;
  /** Say story lines (Urdu voice and English subtitles), e.g. the guards at the gate. */
  onSay: (lines: StoryLine[]) => void;
  /** A student reached one of the five places on the Moon (first time only). */
  onExplore: (stationId: string) => void;
  /** Ids of the places already explored. */
  explored: string[];
  walkGoal: { point: Vec3; key: number } | null;
  /** The student crew has put on their spacesuits (training "Get dressed" done). */
  crewDressed: boolean;
  /** Show the suited crew near the rocket and inside the capsule. */
  showCrew: boolean;
}
