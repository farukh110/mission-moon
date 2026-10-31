# Mission Moon

An offline 3D educational space game for lower secondary students (Next.js App Router, React, TypeScript, Three.js via React Three Fiber). Students travel through 10 stages: school, a taxi ride, a space research centre, astronaut training, launch preparation, rocket launch, Earth orbit, the journey to the Moon and landing on the Moon. The same rocket carries the student crew, dressed as astronauts, from the launchpad to the Moon.

The mission plays like a story: every scene moves on by itself and there are no Next buttons. The player only controls the vehicle: hold the Up arrow to drive the taxi and fly the rocket, and on the Moon move the students with the arrow keys to visit five places: craters, Moon rocks, water ice, mountains and valleys, and science experiments. The whole mission takes about 4 to 5 minutes.

The school and research centre are fictional models. The research centre is only *inspired by* SUPARCO and is not a real SUPARCO mission.

## Run on Windows (no internet after setup)

One-time setup on a computer with Node.js 20+ and internet:

```
npm install
npm run build
```

Then, on any later run (offline is fine), double-click `start-game.bat`, or run `npm start` and open <http://localhost:3000> in Edge or Chrome.

Development: `npm run dev`. Checks: `npx tsc --noEmit` and `npm run lint`.

## Controls

Hold **Up arrow (or W)** to drive the taxi and fly the rocket, **Left / Right** to steer, **Space** to honk the taxi horn. On the Moon the **arrow keys** (or W A S D) move the student, **Space** jumps and **Tab** switches student. Drag the mouse to look around and scroll to zoom. **Esc** pauses (from there you can skip a scene). Everything also works with the on-screen buttons.

## Voice narration

Every scene is narrated in simple English (an Asian-accent voice) with English subtitles. The voice comes from MP3 files in `public/audio/ur/` (44 short clips), so it works offline on any computer.

The clips were made once with Microsoft Edge online voice en-IN-NeerjaNeural. To change the wording, edit the `en` lines in `data/` and run `npm run audio` (needs internet) to make the missing clips, then `npm run build`.

## Where things live

- `data/` – all educational content (stage definitions, hotspots, activities). Edit text here, not in scene code.
- `components/game/scenes/` – one 3D scene per environment; `objects/` – Earth, Moon, rocket, spacecraft, astronaut, lander, effects.
- `components/presentation/`, `components/game/` – UI.
- `lib/progress.ts` – progress and settings saved in the browser's localStorage (key `mission-moon:*`).

All art is generated in code; there are no remote assets, fonts or network calls.

## Weak computers

Mission Moon switches to light graphics by itself on computers without a graphics card (or when the frame rate is low): fewer houses and trees, no shadows, no power lines. You can also turn this on under Sound & settings. New Urdu lines are made with `npm run audio` (needs internet once).
