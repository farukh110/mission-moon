"use client";

import { useEffect, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { SequenceDef, StageKind } from "@/data/types";
import type { SequenceState } from "@/hooks/useSequence";
import { getAltitude, setFlightInput, type FlightKey } from "@/lib/flightInput";

interface SequencePanelProps {
  def: SequenceDef;
  kind: StageKind;
  state: SequenceState;
  onSkip: () => void;
}

/** A button that counts as held while the mouse or finger is down. */
function HoldButton({ input, children }: { input: FlightKey; children: string }) {
  const press = (e: PointerEvent<HTMLButtonElement>, value: boolean) => {
    if (value) e.currentTarget.setPointerCapture(e.pointerId);
    setFlightInput(input, value);
  };
  return (
    <button
      type="button"
      className="btn btn-secondary btn-lg hold-btn"
      onPointerDown={(e) => press(e, true)}
      onPointerUp={(e) => press(e, false)}
      onPointerCancel={(e) => press(e, false)}
      onLostPointerCapture={() => setFlightInput(input, false)}
    >
      {children}
    </button>
  );
}

/** The result of a scene. It fades away after a few seconds so it does not cover the play area. */
function DonePanel({ def }: { def: SequenceDef }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setVisible(false), 7000);
    return () => window.clearTimeout(id);
  }, []);
  if (!visible) return null;
  return (
    <div className="panel sequence-panel">
      <h2 className="panel-title">{def.doneTitle}</h2>
      {def.doneText.map((t) => (
        <p key={t}>{t}</p>
      ))}
    </div>
  );
}

/**
 * The rocket and taxi are flown by the player (arrow keys or the buttons here).
 * The landing plays by itself. Everything else about the scene is left to the story.
 */
export function SequencePanel({ def, kind, state, onSkip }: SequencePanelProps) {
  const [elapsed, setElapsed] = useState(0);
  const [meter, setMeter] = useState(0);

  useEffect(() => {
    if (state.phase !== "flight") return;
    const id = window.setInterval(() => {
      setElapsed((performance.now() - state.startedAt) / 1000);
      setMeter(getAltitude());
    }, 150);
    return () => window.clearInterval(id);
  }, [state.phase, state.startedAt]);

  const isRocket = kind === "launch";
  const playerFlown = isRocket || kind === "taxi";

  if (state.phase === "countdown") {
    return (
      <div className="countdown" role="status" aria-live="assertive">
        <span key={state.count}>{state.count}</span>
      </div>
    );
  }
  if (state.phase === "idle") return null;

  if (state.phase === "done") return <DonePanel def={def} />;

  if (playerFlown) {
    return (
      <div className="panel sequence-panel">
        <p role="status">{def.manualHelp}</p>
        <ProgressBar value={Math.round(isRocket ? Math.min(meter, 300) : meter)} max={isRocket ? 300 : 100} label={isRocket ? "Altitude" : "Distance"} />
        <div className="hold-row">
          {!isRocket && <HoldButton input="left">◀ Left</HoldButton>}
          <HoldButton input="thrust">{isRocket ? "▲ Thrust" : "▲ Gas"}</HoldButton>
          {isRocket && <HoldButton input="left">◀</HoldButton>}
          {!isRocket && <HoldButton input="brake">■ Brake</HoldButton>}
          {!isRocket && <HoldButton input="horn">📣 Horn</HoldButton>}
          <HoldButton input="right">{isRocket ? "▶" : "Right ▶"}</HoldButton>
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onSkip}>Skip</Button>
        </div>
      </div>
    );
  }

  const caption = def.phases.find((p) => elapsed < p.until)?.text ?? def.phases[def.phases.length - 1].text;
  return (
    <div className="panel sequence-panel">
      <p role="status" aria-live="polite">{caption}</p>
      <ProgressBar value={Math.min(elapsed, def.duration)} max={def.duration} label="Progress" />
      <div className="modal-actions">
        <Button variant="ghost" onClick={onSkip}>Skip</Button>
      </div>
    </div>
  );
}
