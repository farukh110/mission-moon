"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SequencePhase = "idle" | "countdown" | "flight" | "done";

export interface SequenceState {
  phase: SequencePhase;
  /** Seconds left in the countdown. */
  count: number;
  /** performance.now() when the flight began. */
  startedAt: number;
}

export const IDLE_SEQUENCE: SequenceState = { phase: "idle", count: 0, startedAt: 0 };

/**
 * A timed animation: optional countdown, then a flight of `duration` seconds.
 * Scenes read `startedAt` to work out how far along the flight is.
 */
export function useSequence(countdown: number, duration: number, onDone: () => void) {
  const [state, setState] = useState<SequenceState>(IDLE_SEQUENCE);
  const timers = useRef<{ tick?: number; end?: number }>({});
  const flightLength = useRef<number | undefined>(undefined);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const clear = useCallback(() => {
    window.clearInterval(timers.current.tick);
    window.clearTimeout(timers.current.end);
  }, []);

  const finish = useCallback(() => {
    clear();
    setState((s) => ({ ...s, phase: "done", count: 0 }));
    onDoneRef.current();
  }, [clear]);

  const beginFlight = useCallback(() => {
    clear();
    setState({ phase: "flight", count: 0, startedAt: performance.now() });
    timers.current.end = window.setTimeout(finish, (flightLength.current ?? duration) * 1000);
  }, [clear, duration, finish]);

  /** `flightSeconds` overrides the stage's flight length (used for the player-flown launch). */
  const start = useCallback((flightSeconds?: number) => {
    clear();
    flightLength.current = flightSeconds;
    if (countdown <= 0) return beginFlight();
    let left = countdown;
    setState({ phase: "countdown", count: left, startedAt: 0 });
    timers.current.tick = window.setInterval(() => {
      left -= 1;
      if (left <= 0) beginFlight();
      else setState({ phase: "countdown", count: left, startedAt: 0 });
    }, 1000);
  }, [beginFlight, clear, countdown]);

  /** Go back to the start (idle) or jump straight to the finished state. */
  const reset = useCallback(
    (phase: "idle" | "done") => {
      clear();
      setState({ phase, count: 0, startedAt: 0 });
    },
    [clear],
  );

  useEffect(() => clear, [clear]);

  return { state, start, skip: finish, reset };
}
