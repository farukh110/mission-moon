"use client";

import { Button } from "@/components/ui/Button";
import { STAGES } from "@/data/stages";
import type { Progress } from "@/lib/progress";
import { isStageComplete } from "@/lib/stageProgress";

interface CompletionScreenProps {
  progress: Progress;
  onReplay: () => void;
  onMainMenu: () => void;
}

export function CompletionScreen({ progress, onReplay, onMainMenu }: CompletionScreenProps) {
  const done = STAGES.filter((s) => s.kind !== "complete" && isStageComplete(s, progress));
  const required = STAGES.length - 1;
  const allDone = done.length === required;
  const concepts = [
    ...new Set(
      STAGES.filter((s) => isStageComplete(s, progress)).flatMap((s) => s.hotspots.map((h) => h.keyConcept)),
    ),
  ];

  return (
    <div className="screen-overlay">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 36 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 37) % 100}%`,
              background: ["#ffb703", "#4cc9f0", "#5be584", "#ff6b6b", "#c77dff"][i % 5],
              animationDelay: `${((i * 13) % 30) / 10}s`,
              animationDuration: `${3 + ((i * 7) % 20) / 10}s`,
            }}
          />
        ))}
      </div>
      <div className="panel completion">
        <p className="eyebrow">Mission status</p>
        <h2 className="panel-title">{allDone ? "Mission complete! Well done, astronaut." : "Mission report"}</h2>
        <p>
          {allDone
            ? "You finished every stage of Mission Moon."
            : `You finished ${done.length} of ${required} stages. You can go back to any stage to finish the rest.`}
        </p>

        <div className="stat-row">
          <div className="stat"><strong>{done.length}/{required}</strong><span>stages</span></div>
        </div>

        <h3>Completed stages</h3>
        <ul className="stage-list">
          {STAGES.filter((s) => s.kind !== "complete").map((s) => (
            <li key={s.id} className={isStageComplete(s, progress) ? "done" : ""}>
              <span aria-hidden="true">{isStageComplete(s, progress) ? "✔" : "○"}</span> {s.title}
            </li>
          ))}
        </ul>

        {concepts.length > 0 && (
          <>
            <h3>Concepts you learned</h3>
            <ul className="concept-list">
              {concepts.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </>
        )}

        <div className="modal-actions">
          <Button onClick={onReplay}>Replay mission</Button>
          <Button variant="primary" onClick={onMainMenu}>Main menu</Button>
        </div>
      </div>
    </div>
  );
}
