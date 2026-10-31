import { noise3, smoothstep } from "./noise";

export interface Crater {
  x: number;
  z: number;
  r: number;
  depth: number;
}

/** Terrain data shared by the terrain mesh, rocks and the students' walking height. */
export const CRATERS: Crater[] = [
  { x: 18, z: -14, r: 10, depth: 2.6 }, // "Craters" station: a big impact crater
  { x: -17, z: -20, r: 4.5, depth: 1 },
  { x: 8, z: -32, r: 3, depth: 0.7 },
  { x: -9, z: 13, r: 2.6, depth: 0.6 },
  { x: 14, z: 22, r: 3, depth: 0.7 },
  { x: -40, z: 8, r: 3.5, depth: 0.9 },
  { x: -26, z: 28, r: 6.5, depth: 2.4 }, // "Water ice" station: a deep crater that stays in shadow
];

export interface Mountain {
  x: number;
  z: number;
  r: number;
  height: number;
}

/** A ring of mountains around the valley of the "Mountains and valleys" station. */
export const MOUNTAINS: Mountain[] = [
  { x: 42, z: 24, r: 9, height: 8 },
  { x: 40, z: 38, r: 9, height: 10 },
  { x: 24, z: 42, r: 8, height: 7 },
  { x: 22, z: 20, r: 7, height: 5 },
];

export interface Obstacle {
  x: number;
  z: number;
  r: number;
}

/** Things the students cannot walk through. */
export const OBSTACLES: Obstacle[] = [
  { x: 0, z: 0, r: 1.8 }, // rocket
  { x: -6, z: 2, r: 1.3 }, // large boulder
  { x: 12, z: 5, r: 1.1 }, // boulder
  { x: -3, z: -9, r: 1.2 }, // boulder
];

export const MOON_BOUND = 52;

export type StationId = "craters" | "rocks" | "ice" | "mountains" | "experiments";

export interface Station {
  id: StationId;
  /** Centre on the ground. */
  x: number;
  z: number;
  /** A student closer than this has "explored" the place. */
  r: number;
  /** Radius of the glowing ring on the ground. */
  ring: number;
  color: string;
  signLines: [string, string];
}

/** The five places to explore on the Moon. */
export const STATIONS: Station[] = [
  { id: "craters", x: 18, z: -14, r: 7, ring: 2.6, color: "#ffb703", signLines: ["CRATERS", "Pits made by space rocks"] },
  { id: "rocks", x: -24, z: -4, r: 6, ring: 4.5, color: "#ff8a5c", signLines: ["MOON ROCKS", "Rock and soil samples"] },
  { id: "ice", x: -26, z: 28, r: 6, ring: 3.2, color: "#4cc9f0", signLines: ["WATER ICE", "Ice in a shadowed crater"] },
  { id: "mountains", x: 32, z: 31, r: 7, ring: 3.2, color: "#c77dff", signLines: ["MOUNTAINS & VALLEYS", "Tall peaks and wide valleys"] },
  { id: "experiments", x: 0, z: -24, r: 6, ring: 5, color: "#5be584", signLines: ["SCIENCE EXPERIMENTS", "Soil, heat and moonquakes"] },
];

/** Where the three students start after stepping out of the rocket. */
export const PLAYER_SPOTS: [number, number][] = [[4, 4], [6.2, 1.6], [7, 5.2]];
export const ROCKET_DOOR: [number, number] = [1.4, 1.2];

/** True within `margin` metres of a station (used to keep loose rocks off them). */
export const nearStation = (x: number, z: number, margin = 0) => STATIONS.some((s) => Math.hypot(x - s.x, z - s.z) < s.r + margin);

export function terrainHeight(x: number, z: number): number {
  let h =
    (noise3(x * 0.08, 0, z * 0.08) - 0.5) * 1.6 +
    (noise3(x * 0.3, 7, z * 0.3) - 0.5) * 0.25 +
    (noise3(x * 0.9, 11, z * 0.9) - 0.5) * 0.14 +
    (noise3(x * 2.4, 5, z * 2.4) - 0.5) * 0.04;
  for (const c of CRATERS) {
    const t = Math.hypot(x - c.x, z - c.z) / c.r;
    if (t < 1) h -= c.depth * (1 - t * t);
    h += c.depth * 0.35 * Math.exp(-(((t - 1.05) / 0.18) ** 2));
  }
  for (const m of MOUNTAINS) {
    const t = Math.hypot(x - m.x, z - m.z) / m.r;
    if (t < 1) h += m.height * (1 - t * t) ** 2 * (0.85 + noise3(x * 0.35, 2, z * 0.35) * 0.3);
  }
  return h * smoothstep(8, 14, Math.hypot(x, z));
}
