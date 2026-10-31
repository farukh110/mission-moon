"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_PROGRESS,
  loadProgress,
  loadSettings,
  saveProgress,
  saveSettings,
  type Progress,
  type Settings,
} from "@/lib/progress";
import { isStageComplete } from "@/lib/stageProgress";
import { playSound, type SoundName } from "@/lib/sound";
import { detectWeakComputer, setLowQuality } from "@/lib/quality";
import { STAGES } from "@/data/stages";
import type { Vec3 } from "@/data/types";

export type Overlay = "settings" | "help" | null;

export interface WalkGoal {
  point: Vec3;
  key: number;
}

const clampStage = (i: number) => Math.min(STAGES.length - 1, Math.max(0, Math.floor(i) || 0));
const addOnce = (list: string[], value: string) => (list.includes(value) ? list : [...list, value]);

/** Central game state. The app is client-only, so storage can be read in the initializers. */
export function useGame() {
  const [screen, setScreen] = useState<"menu" | "playing">("menu");
  const [paused, setPaused] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [viewKey, setViewKey] = useState(0);
  const [walkGoal, setWalkGoal] = useState<WalkGoal | null>(null);
  const [progress, setProgress] = useState<Progress>(() => {
    const p = loadProgress();
    return { ...p, currentStage: clampStage(p.currentStage) };
  });
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = loadSettings();
    // On the first run, switch to light graphics by themselves on a weak computer.
    const next = saved.qualityChecked ? saved : { ...saved, reducedEffects: saved.reducedEffects || detectWeakComputer(), qualityChecked: true };
    setLowQuality(next.reducedEffects);
    return next;
  });

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => setLowQuality(settings.reducedEffects), [settings.reducedEffects]);

  const stageIndex = progress.currentStage;
  const stage = STAGES[stageIndex];
  const view = stage.views.find((v) => v.id === viewId) ?? stage.views[0];
  const stageDone = isStageComplete(stage, progress);
  const completedCount = useMemo(() => STAGES.filter((s) => isStageComplete(s, progress)).length, [progress]);

  const play = useCallback(
    (name: SoundName) => {
      if (settings.sound) playSound(name, settings.volume);
    },
    [settings.sound, settings.volume],
  );

  const goToStage = useCallback((index: number) => {
    setProgress((p) => ({ ...p, currentStage: clampStage(index) }));
    setViewId(null);
    setViewKey((k) => k + 1);
    setWalkGoal(null);
  }, []);

  const startMission = useCallback(() => {
    setScreen("playing");
    setPaused(false);
    setViewKey((k) => k + 1);
  }, []);

  const goToMenu = useCallback(() => {
    setScreen("menu");
    setPaused(false);
    setOverlay(null);
  }, []);

  const selectView = useCallback(
    (id: string) => {
      const target = stage.views.find((v) => v.id === id);
      if (!target) return;
      if (stage.walk && target.walkTo) setWalkGoal((g) => ({ point: target.walkTo!, key: (g?.key ?? 0) + 1 }));
      else {
        setViewId(id);
        setViewKey((k) => k + 1);
      }
    },
    [stage],
  );

  const markEvent = useCallback((name: string) => {
    setProgress((p) => ({ ...p, events: addOnce(p.events, name) }));
  }, []);

  const restart = useCallback(() => {
    setProgress({ ...DEFAULT_PROGRESS });
    setPaused(false);
    setViewId(null);
    setWalkGoal(null);
    setViewKey((k) => k + 1);
  }, []);

  return {
    screen, paused, overlay, view, viewKey, walkGoal, progress, settings,
    stage, stageIndex, stageDone, completedCount,
    setPaused, setOverlay, setSettings,
    startMission, goToMenu, goToStage, selectView, markEvent, restart, play,
  };
}
