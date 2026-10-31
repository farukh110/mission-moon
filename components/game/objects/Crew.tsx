"use client";

import type { RefObject } from "react";
import { Astronaut } from "./Astronaut";
import { Student } from "./Student";
import type { Vec3 } from "@/data/types";

interface CrewProps {
  /** Ground positions for each crew member. */
  points: Vec3[];
  /** Suited up as astronauts, or still in school clothes. */
  suited: boolean;
  scale?: number;
  /** Rotation around the y axis, so the crew can face the camera. */
  facing?: number;
  /** Suited crew wave and sway. */
  wave?: boolean;
  motion?: RefObject<number>;
}

/** The student crew: schoolchildren before dressing, astronauts after. */
export function Crew({ points, suited, scale = 1, facing = 0, wave = false, motion }: CrewProps) {
  return (
    <>
      {points.map((p, i) => (
        <group key={i} position={p} rotation={[0, facing, 0]}>
          {suited ? <Astronaut scale={scale} wave={wave} motion={motion} phase={i * 1.3} face={i} /> : <Student index={i} scale={scale * 1.35} wave={wave} motion={motion} phase={i * 1.3} />}
        </group>
      ))}
    </>
  );
}
