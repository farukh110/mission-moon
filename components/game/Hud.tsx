"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { StageDef } from "@/data/types";

interface HudProps {
  stage: StageDef;
  onPause: () => void;
  /** Small progress badge, e.g. places explored on the Moon. */
  badge?: string;
}

/** A short line of learning that changes every few seconds. No clicking needed. */
function Facts({ stage }: { stage: StageDef }) {
  const facts = [stage.summary, ...stage.hotspots.map((h) => h.keyConcept)];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (facts.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % facts.length), 7000);
    return () => window.clearInterval(id);
  }, [facts.length]);

  return (
    <p className="hud-fact" key={index} aria-live="polite">
      {index > 0 && <strong>Did you know? </strong>}
      {facts[index % facts.length]}
    </p>
  );
}

export function Hud({ stage, onPause, badge }: HudProps) {
  return (
    <>
      <header className="hud-top">
        <div>{stage.disclaimer && <p className="hud-note">{stage.disclaimer}</p>}</div>
        <Button onClick={onPause} aria-label="Pause menu">
          Pause (Esc)
        </Button>
      </header>

      <div className="hud-bottom">
        {badge && (
          <p className="hud-score" key={badge}>🔭 {badge}</p>
        )}
        <Facts key={stage.id} stage={stage} />
        {stage.hint && <p className="hud-hint">{stage.hint}</p>}
      </div>
    </>
  );
}
