"use client";

import { useEffect, useRef, useState } from "react";
import type { SoundName } from "@/lib/sound";
import type { StoryLine } from "@/data/types";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getJourneyProgress, setJourneyProgress } from "@/lib/journeyState";
import { JOURNEY_CARDS, JOURNEY_HOURS, JOURNEY_URDU, JOURNEY_SECONDS, MOON_DISTANCE_KM } from "@/data/stages/journey";

interface JourneyPanelProps {
  onArrive: () => void;
  onSound: (n: SoundName) => void;
  /** Says a line in Urdu and shows its English subtitle. */
  onSay: (lines: StoryLine[]) => void;
}

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/** The trip to the Moon plays by itself. The panel shows how far we have come and one fact at a time. */
export function JourneyPanel({ onArrive, onSound, onSay }: JourneyPanelProps) {
  const [p, setP] = useState(getJourneyProgress);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const next = Math.min(1, getJourneyProgress() + (now - last) / 1000 / JOURNEY_SECONDS);
      last = now;
      setJourneyProgress(next);
      setP(next);
      if (next >= 1) {
        setPlaying(false);
        onArrive();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [playing, onArrive]);

  const reached = JOURNEY_CARDS.filter((c) => p >= c.at);
  const card = reached[reached.length - 1];

  // A soft chime each time a new fact appears.
  const lastCard = useRef(reached.length);
  useEffect(() => {
    if (reached.length > lastCard.current) {
      onSound("chime");
      onSay([{ ur: JOURNEY_URDU[reached.length - 1], en: `${card.title}. ${card.text}` }]);
    }
    lastCard.current = reached.length;
  }, [reached.length, card, onSound, onSay]);

  const travelled = p * MOON_DISTANCE_KM;

  return (
    <aside className="panel journey-panel" aria-label="Journey to the Moon">
      <dl className="status-grid">
        <div><dt>Travelled</dt><dd>{fmt(travelled)} km</dd></div>
        <div><dt>To go</dt><dd>{fmt(MOON_DISTANCE_KM - travelled)} km</dd></div>
        <div><dt>Time</dt><dd>{Math.round(p * JOURNEY_HOURS)} h</dd></div>
      </dl>
      <ProgressBar value={Math.round(p * 100)} max={100} label="Journey progress" />
      <div className="key-concept">
        <strong>{card.title}</strong>
        <p>{card.text}</p>
      </div>
      {p < 1 && (
        <div className="modal-actions" style={{ justifyContent: "flex-start" }}>
          <Button onClick={() => setPlaying((v) => !v)}>{playing ? "Pause" : "Play"}</Button>
        </div>
      )}
    </aside>
  );
}
