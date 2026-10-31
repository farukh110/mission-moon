"use client";

import { Button } from "@/components/ui/Button";

interface MainMenuProps {
  onStart: () => void;
  onSettings: () => void;
  onHelp: () => void;
}

export function MainMenu({ onStart, onSettings, onHelp }: MainMenuProps) {
  return (
    <main className="menu">
      <div className="menu-card panel">
        <p className="eyebrow">A space exploration journey</p>
        <h1 className="menu-title">Mission Moon</h1>
        <p className="menu-intro">
          Travel from GBLSS Ghulam Muhammad Village in Malir to a space research centre, train as an astronaut, launch a rocket and land
          on the Moon. This is a simulation, and you will learn real science on the way.
        </p>

        <Button variant="primary" size="lg" onClick={onStart} autoFocus>
          Start Mission
        </Button>

        <div className="menu-row">
          <Button variant="ghost" onClick={onSettings}>
            Sound &amp; settings
          </Button>
          <Button variant="ghost" onClick={onHelp}>
            How to play
          </Button>
        </div>

      </div>
    </main>
  );
}
