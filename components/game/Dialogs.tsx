"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Settings } from "@/lib/progress";

interface SettingsDialogProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
}

export function SettingsDialog({ settings, onChange, onClose }: SettingsDialogProps) {
  return (
    <Modal title="Sound & settings" onClose={onClose}>
      <label className="field">
        <input
          type="checkbox"
          checked={settings.sound}
          onChange={(e) => onChange({ ...settings, sound: e.target.checked })}
        />
        Sound effects
      </label>
      <label className="field">
        <input
          type="checkbox"
          checked={settings.voice}
          onChange={(e) => onChange({ ...settings, voice: e.target.checked })}
        />
        Urdu voice (اردو آواز) with English subtitles
      </label>
      <label className="field">
        Volume
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={settings.volume}
          disabled={!settings.sound}
          onChange={(e) => onChange({ ...settings, volume: Number(e.target.value) })}
        />
      </label>
      <label className="field">
        <input
          type="checkbox"
          checked={settings.reducedEffects}
          onChange={(e) => onChange({ ...settings, reducedEffects: e.target.checked })}
        />
        Reduced effects (smoother on older computers)
      </label>
      <div className="modal-actions">
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}

const CONTROLS: [string, string][] = [
  ["Up arrow (or W)", "Drive the taxi, fly the rocket, walk on the Moon"],
  ["Arrow keys (or W A S D)", "Steer, and move the students on the Moon"],
  ["Space", "Honk the horn, or jump on the Moon"],
  ["Tab", "Switch to another student on the Moon"],
  ["Mouse drag and scroll", "Look around and zoom"],
  ["Esc", "Pause"],
];

export function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="How to play" onClose={onClose}>
      <dl className="controls-list">
        {CONTROLS.map(([key, action]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{action}</dd>
          </div>
        ))}
      </dl>
      <p className="muted">Your progress is saved on this computer. You do not need the internet.</p>
      <div className="modal-actions">
        <Button variant="primary" onClick={onClose}>
          Got it
        </Button>
      </div>
    </Modal>
  );
}

interface PauseMenuProps {
  onResume: () => void;
  onSettings: () => void;
  onHelp: () => void;
  /** Missing on the last scene. */
  onSkip?: () => void;
  onMainMenu: () => void;
}

export function PauseMenu({ onResume, onSettings, onHelp, onSkip, onMainMenu }: PauseMenuProps) {
  return (
    <Modal title="Paused" onClose={onResume}>
      <div className="stack">
        <Button variant="primary" onClick={onResume}>Resume</Button>
        <Button onClick={onSettings}>Sound &amp; settings</Button>
        <Button onClick={onHelp}>How to play</Button>
        {onSkip && <Button onClick={onSkip}>Skip this scene</Button>}
        <Button onClick={onMainMenu}>Main menu</Button>
      </div>
    </Modal>
  );
}
