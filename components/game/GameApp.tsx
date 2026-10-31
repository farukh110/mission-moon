"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/hooks/useGame";
import { useSequence, type SequencePhase } from "@/hooks/useSequence";
import { useLatest } from "@/hooks/useLatest";
import { MENU_VIEW, STAGES } from "@/data/stages";
import { stageEvent } from "@/lib/stageProgress";
import { setJourneyProgress } from "@/lib/journeyState";
import { setEngineLevel, setThrustSound, setTrafficSound, stopAllSounds } from "@/lib/sound";
import { countdownLine, narrate, stopVoice } from "@/lib/voice";
import { LIFTOFF_LINE } from "@/data/narration";
import { ALL_EXPLORED_LINE, STATION_STORY } from "@/data/moonStations";
import { STATIONS, type StationId } from "@/lib/lunar";
import type { StoryLine } from "@/data/types";
import StageCanvas from "./scenes/StageCanvas";
import { MainMenu } from "./MainMenu";
import { Hud } from "./Hud";
import { SequencePanel } from "./SequencePanel";
import { JourneyPanel } from "./JourneyPanel";
import { CompletionScreen } from "./CompletionScreen";
import { HelpDialog, PauseMenu, SettingsDialog } from "./Dialogs";

/** The mission plays like a story: each scene moves on by itself. The player only controls the vehicle. */
export default function GameApp() {
  const g = useGame();
  const { stage, progress, markEvent, goToStage, stageIndex, settings } = g;
  const playing = g.screen === "playing";
  const paused = g.paused;
  const [explored, setExplored] = useState<string[]>([]);
  const [subtitle, setSubtitle] = useState("");
  // The taxi and the rocket are flown by the player (hold the Up arrow).
  const playerFlown = stage.kind === "taxi" || stage.kind === "launch";

  const seq = useSequence(stage.sequence?.countdown ?? 0, stage.sequence?.duration ?? 1, () => markEvent(stage.kind));
  const { phase } = seq.state;
  const { reset: resetSeq, start: startSeq, skip: skipSeq } = seq;

  // ---- when a scene opens ----
  const eventsSeen = useRef<string[]>([]);
  useEffect(() => {
    eventsSeen.current = progress.events;
  }, [progress.events]);
  useEffect(() => {
    if (!playing) return;
    setJourneyProgress(0);
    if (stage.sequence?.autoStart) {
      if (eventsSeen.current.includes(stageEvent(stage) ?? "")) resetSeq("done");
      else startSeq(playerFlown ? 3600 : undefined);
    } else resetSeq("idle");
    if (stage.kind === "complete") markEvent("complete");
  }, [playing, stage, playerFlown, resetSeq, startSeq, markEvent]);

  // ---- Urdu voice and subtitles ----
  const playRef = useLatest(g.play);
  const voiceRef = useLatest({ on: settings.voice, volume: settings.volume });
  const say = useCallback((lines: StoryLine[]) => {
    if (!voiceRef.current.on) return;
    narrate(lines, { volume: voiceRef.current.volume, onLine: setSubtitle });
  }, [voiceRef]);
  // The scene's own story, when it opens.
  useEffect(() => {
    if (!playing || paused) return;
    say(stage.story.intro);
    return () => {
      stopVoice();
      setSubtitle("");
    };
  }, [playing, paused, stage, say]);

  // ---- the students put on their spacesuits during training ----
  useEffect(() => {
    if (!playing || paused || stage.id !== "training") return;
    const id = window.setTimeout(() => {
      markEvent("dressed");
      playRef.current("correct");
    }, 6000);
    return () => window.clearTimeout(id);
  }, [playing, paused, stage.id, markEvent, playRef]);

  // ---- scenes move on by themselves ----
  const stageDone = g.stageDone;
  const subtitleRef = useLatest(subtitle);
  useEffect(() => {
    const advance = stage.autoAdvance;
    if (!playing || paused || !advance || stage.kind === "complete") return;
    if (advance.after === "event" && !stageDone) return;
    // Move on after the scene time, but never in the middle of the narration (waiting at most 25 s more).
    let timer: number | undefined;
    let waited = 0;
    const tryAdvance = () => {
      if (subtitleRef.current && waited < 25000) {
        waited += 500;
        timer = window.setTimeout(tryAdvance, 500);
      } else goToStage(stageIndex + 1);
    };
    timer = window.setTimeout(tryAdvance, advance.seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [playing, paused, stage, stageDone, stageIndex, goToStage, subtitleRef]);

  // When all five places are explored, say well done and move on.
  useEffect(() => {
    if (!playing || paused || stage.kind !== "landing" || explored.length < STATIONS.length) return;
    const talk = window.setTimeout(() => say([ALL_EXPLORED_LINE]), 9000);
    const next = window.setTimeout(() => goToStage(stageIndex + 1), 16000);
    return () => {
      window.clearTimeout(talk);
      window.clearTimeout(next);
    };
  }, [playing, paused, stage.kind, explored.length, stageIndex, goToStage, say]);

  // The computer is too slow for full graphics: switch to light graphics by itself and say so.
  const [notice, setNotice] = useState("");
  const { setSettings } = g;
  const onSlow = useCallback(() => {
    setSettings((s) => ({ ...s, reducedEffects: true }));
    setNotice("Your computer is a little slow, so Mission Moon switched to light graphics.");
    window.setTimeout(() => setNotice(""), 7000);
  }, [setSettings]);

  const onFlightDone = useCallback(() => {
    setThrustSound(false, 0);
    skipSeq();
  }, [skipSeq]);

  // If nobody presses the keys, the vehicle gets there by itself after a while.
  useEffect(() => {
    if (!playing || paused || !playerFlown || phase !== "flight") return;
    const id = window.setTimeout(onFlightDone, stage.kind === "taxi" ? 360000 : 45000);
    return () => window.clearTimeout(id);
  }, [playing, paused, playerFlown, phase, onFlightDone, stage.kind]);

  // ---- sounds belong to what is happening ----
  const prevPhase = useRef<SequencePhase>("idle");
  const { count } = seq.state;
  useEffect(() => {
    if (!playing) return;
    const prev = prevPhase.current;
    prevPhase.current = phase;
    const play = playRef.current;
    if (phase === "countdown") {
      play("beep");
      say([countdownLine(count)]);
    }
    if (phase === "flight" && prev === "countdown" && stage.kind === "launch") say([LIFTOFF_LINE]);
    if (phase === "flight" && prev !== "flight" && stage.kind === "landing") play("descent");
    if (phase === "done" && prev === "flight") {
      play(stage.kind === "landing" ? "touchdown" : "arrive");
      if (stage.story.done) say(stage.story.done);
    }
  }, [phase, count, playing, stage, playRef, say]);

  // Stop every sound when the scene changes, on pause, or when leaving.
  useEffect(() => {
    stopAllSounds();
  }, [stage.id, playing, paused]);

  const onArrive = useCallback(() => {
    if (!eventsSeen.current.includes("journey")) playRef.current("arrive");
    markEvent("journey");
  }, [markEvent, playRef]);

  const showCanvasStage = playing ? stage : STAGES[0];
  const finalScene = stage.kind === "complete";
  const isLast = stageIndex >= STAGES.length - 1;
  const modalOpen = g.overlay !== null || (playing && paused);
  const dressed = progress.events.includes("dressed");

  // Escape closes a dialog, otherwise toggles pause.
  const { overlay, setOverlay, setPaused } = g;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !playing) return;
      if (overlay) setOverlay(null);
      else setPaused(!paused);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, overlay, paused, setOverlay, setPaused]);

  const skipScene = () => {
    setPaused(false);
    goToStage(stageIndex + 1);
  };

  return (
    <div className="app">
      <div className="scene-layer" aria-hidden={modalOpen}>
        <StageCanvas
          stage={showCanvasStage}
          view={playing ? g.view : MENU_VIEW}
          viewKey={g.viewKey}
          sceneKey={showCanvasStage.id}
          paused={playing && paused}
          onSlow={onSlow}
          cameraLocked={playing && playerFlown && (phase === "flight" || phase === "done")}
          motion
          reducedEffects={settings.reducedEffects}
          sequence={seq.state}
          walkGoal={g.walkGoal}
          onSound={g.play}
          explored={explored}
          onExplore={(id) => {
            setExplored((list) => (list.includes(id) ? list : [...list, id]));
            say([STATION_STORY[id as StationId]]);
          }}
          manualFlight={playerFlown}
          onFlightDone={onFlightDone}
          onSay={say}
          onTraffic={(on) => setTrafficSound(on, settings.sound ? settings.volume : 0)}
          onThrust={(on) => setThrustSound(on, settings.sound ? settings.volume : 0)}
          onEngine={(level) => setEngineLevel(level, settings.sound ? settings.volume : 0)}
          crewDressed={dressed}
          showCrew={dressed}
        />
      </div>

      {!playing && (
        <MainMenu
          onStart={() => {
            setExplored([]);
            g.restart();
            g.startMission();
          }}
          onSettings={() => g.setOverlay("settings")}
          onHelp={() => g.setOverlay("help")}
        />
      )}

      {notice && <p className="notice" role="status">{notice}</p>}

      {playing && subtitle && (
        <p className="subtitle" aria-live="polite">
          {subtitle}
        </p>
      )}

      {playing && !finalScene && (
        <>
          <div key={stage.id} className="stage-banner" aria-hidden="true">
            <span>Stage {stageIndex + 1} of {STAGES.length}</span>
            <strong>{stage.title}</strong>
          </div>
          <Hud stage={stage} onPause={() => g.setPaused(true)} badge={stage.kind === "landing" && phase === "done" ? `Explored ${explored.length} of ${STATIONS.length}` : undefined} />
          {stage.sequence && <SequencePanel def={stage.sequence} kind={stage.kind} state={seq.state} onSkip={() => { stopAllSounds(); skipSeq(); }} />}
          {stage.kind === "journey" && <JourneyPanel onArrive={onArrive} onSound={g.play} onSay={say} />}
        </>
      )}

      {playing && finalScene && <CompletionScreen progress={progress} onReplay={() => {
            setExplored([]);
            g.restart();
          }} onMainMenu={g.goToMenu} />}

      {playing && paused && !overlay && (
        <PauseMenu
          onResume={() => g.setPaused(false)}
          onSettings={() => g.setOverlay("settings")}
          onHelp={() => g.setOverlay("help")}
          onSkip={isLast || finalScene ? undefined : skipScene}
          onMainMenu={g.goToMenu}
        />
      )}
      {overlay === "settings" && <SettingsDialog settings={settings} onChange={(next) => {
            if (!next.voice) {
              stopVoice();
              setSubtitle("");
            }
            g.setSettings(next);
          }} onClose={() => g.setOverlay(null)} />}
      {overlay === "help" && <HelpDialog onClose={() => g.setOverlay(null)} />}
    </div>
  );
}
