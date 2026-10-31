import type { StageDef, StageKind } from "@/data/types";
import type { Progress } from "./progress";

const EVENT_BY_KIND: Partial<Record<StageKind, { event: string; label: string }>> = {
  taxi: { event: "taxi", label: "Ride the taxi to the research centre" },
  launch: { event: "launch", label: "Launch the rocket" },
  journey: { event: "journey", label: "Travel all the way to the Moon" },
  landing: { event: "landing", label: "Land the spacecraft safely" },
};

export const stageEvent = (stage: StageDef) => EVENT_BY_KIND[stage.kind]?.event;

export interface Task {
  id: string;
  label: string;
  done: boolean;
  optional: boolean;
}

export function stageTasks(stage: StageDef, progress: Progress): Task[] {
  const tasks: Task[] = [];
  const special = EVENT_BY_KIND[stage.kind];
  if (special) {
    tasks.push({ id: special.event, label: special.label, done: progress.events.includes(special.event), optional: false });
  }
  return tasks;
}

export function isStageComplete(stage: StageDef, progress: Progress): boolean {
  if (stage.kind === "complete") return progress.events.includes("complete");
  return stageTasks(stage, progress)
    .filter((t) => !t.optional)
    .every((t) => t.done);
}
