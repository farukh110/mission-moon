"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import type { ReactNode } from "react";
import type { StageDef, ViewDef } from "@/data/types";
import { CameraRig } from "../CameraRig";
import { StudioLight } from "../StudioLight";
import EarthMoonScene from "./EarthMoonScene";
import SchoolScene from "./SchoolScene";
import RoadScene from "./RoadScene";
import ResearchScene from "./ResearchScene";
import TrainingScene from "./TrainingScene";
import LaunchScene from "./LaunchScene";
import OrbitScene from "./OrbitScene";
import JourneyScene from "./JourneyScene";
import LunarScene from "./LunarScene";
import type { SceneProps } from "./types";

/** How strongly the soft studio lighting (reflections and fill) shows in each place. */
const ENVIRONMENT: Record<StageDef["scene"], number> = {
  "earth-moon": 0.12, school: 0.55, road: 0.55, research: 0.5, training: 0.5, launch: 0.55, orbit: 0.14, journey: 0.14, lunar: 0.1,
};

const SCENES = {
  "earth-moon": EarthMoonScene,
  school: SchoolScene,
  road: RoadScene,
  research: ResearchScene,
  training: TrainingScene,
  launch: LaunchScene,
  orbit: OrbitScene,
  journey: JourneyScene,
  lunar: LunarScene,
} as const;

/** Watches the frame rate; calls `onSlow` once if the game runs below about 18 frames per second. */
function FrameMonitor({ onSlow }: { onSlow: () => void }) {
  const state = useRef({ frames: 0, total: 0, fired: false });
  useFrame((_, delta) => {
    const s = state.current;
    if (s.fired) return;
    s.frames += 1;
    if (s.frames <= 90) return; // ignore the first frames: shaders and textures are still being prepared
    s.total += Math.min(delta, 0.5);
    if (s.frames === 90 + 120) {
      if (s.total / 120 > 0.055) {
        s.fired = true;
        onSlow();
      } else {
        s.frames = 90;
        s.total = 0;
      }
    }
  });
  return null;
}

export interface StageCanvasProps extends Omit<SceneProps, "stage"> {
  stage: StageDef;
  view: ViewDef;
  viewKey: number;
  /** Changes when a different scene should be shown. */
  sceneKey: string;
  paused: boolean;
  /** The camera is controlled by the scene (e.g. rocket follow). */
  cameraLocked: boolean;
  /** Called when the frame rate is too low, so the game can switch to light graphics. */
  onSlow: () => void;
  children?: ReactNode;
}

export default function StageCanvas(props: StageCanvasProps) {
  const { stage, view, viewKey, sceneKey, paused, cameraLocked, onSlow, ...sceneProps } = props;
  const Scene = SCENES[stage.scene];
  const zoom = stage.orbit ?? { min: 3, max: 30 };

  return (
    <Canvas
      key={sceneProps.reducedEffects ? "light" : "full"}
      frameloop={paused ? "never" : "always"}
      dpr={sceneProps.reducedEffects ? 1 : [1, 2]}
      shadows={sceneProps.reducedEffects ? false : "percentage"}
      camera={{ fov: 45, near: 0.1, far: 1500, position: view.position }}
      gl={{ antialias: !sceneProps.reducedEffects, powerPreference: "high-performance" }}
    >
      <Scene key={sceneKey} stage={stage} {...sceneProps} />
      {!sceneProps.reducedEffects && <FrameMonitor onSlow={onSlow} />}
      {!sceneProps.reducedEffects && <StudioLight intensity={ENVIRONMENT[stage.scene]} />}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        minDistance={zoom.min}
        maxDistance={zoom.max}
        maxPolarAngle={stage.walk ? Math.PI * 0.49 : Math.PI}
      />
      <CameraRig
        view={view}
        viewKey={viewKey}
        snapKey={sceneKey}
        zoom={zoom}
        walk={Boolean(stage.walk)}
        locked={cameraLocked}
      />
    </Canvas>
  );
}
