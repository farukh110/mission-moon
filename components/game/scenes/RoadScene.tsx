"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { groundTexture } from "@/lib/canvasTextures";
import { Student } from "../objects/Student";
import { DriftingClouds, SkyDome } from "../objects/Sky";
import { Car, Taxi } from "../objects/Taxi";
import { HouseRow, Lamps, Mosque, Road, Trees, UtilityPoles, makeHouseRow, type HouseSpec } from "../objects/Town";
import { Bus, FruitCart, Motorbike, Rickshaw, RubbishBin, SpeedBreaker } from "../objects/Traffic";
import { ConstructionFrame, KerbPaint, MedianGarden, MedianLamps, Tower, Zebra } from "../objects/Boulevard";
import { SchoolCompound } from "../objects/SchoolBuilding";
import { SuparcoCompound } from "../objects/SuparcoCompound";
import { useKeys } from "@/hooks/useKeys";
import { getFlightInput, setAltitude } from "@/lib/flightInput";
import { GATE_LINES } from "@/data/narration";
import type { SceneProps } from "./types";

const SKY = "#9cc6e6";
const HAZE = "#c9d6e0";
/** The school and the research centre are 2 kilometres apart in the game. */
const SCHOOL_X = -50;
const GATE_X = SCHOOL_X + 2000;
const START_X = SCHOOL_X;
const STOP_X = GATE_X - 7;
const END_X = GATE_X + 40;
const MAX_SPEED = 28;
const TILE = 200;
const TILES = 10; // 10 x 200 m = 2000 m
const LANE_DEFAULT = -3.2;
const Z_MIN = -5.3;
const Z_MAX = -1.5;
const GUARD_HOME = new THREE.Vector3(GATE_X - 3.2, 0.24, 0);

type GateState = "closed" | "approach" | "check" | "opening" | "open";
type Kind = "car" | "rickshaw" | "bus" | "bike";

interface Vehicle {
  kind: Kind;
  color: string;
  z: number;
  /** +1 drives the same way as the taxi, -1 comes toward it. */
  dir: 1 | -1;
  speed: number;
  /** Distance ahead of (+) or behind (-) the taxi. Traffic is always around the taxi, wherever it is on the 2 km road. */
  rel: number;
}

const SIZE: Record<Kind, { len: number; hw: number }> = {
  car: { len: 4.4, hw: 0.9 },
  rickshaw: { len: 2.7, hw: 0.7 },
  bus: { len: 7, hw: 1.15 },
  bike: { len: 1.8, hw: 0.45 },
};

const TRAFFIC: Omit<Vehicle, "rel">[] = [
  { kind: "car", color: "#e8ecf2", z: -2.2, dir: 1, speed: 14 },
  { kind: "bike", color: "#b3261e", z: -1.8, dir: 1, speed: 17 },
  { kind: "rickshaw", color: "#2f9a4f", z: -5.0, dir: 1, speed: 7 },
  { kind: "bus", color: "#ffffff", z: -5.2, dir: 1, speed: 8 },
  { kind: "bike", color: "#e8731a", z: -4.6, dir: 1, speed: 10 },
  { kind: "car", color: "#31507e", z: -2.4, dir: 1, speed: 12 },
  { kind: "car", color: "#8e1f2b", z: 2.3, dir: -1, speed: 13 },
  { kind: "bike", color: "#2a6fb8", z: 1.8, dir: -1, speed: 15 },
  { kind: "rickshaw", color: "#d9a21a", z: 5.0, dir: -1, speed: 7 },
  { kind: "bus", color: "#ffffff", z: 5.2, dir: -1, speed: 8 },
  { kind: "car", color: "#2e2f33", z: 2.5, dir: -1, speed: 12 },
  { kind: "bike", color: "#4a4a4a", z: 4.4, dir: -1, speed: 10 },
  { kind: "car", color: "#c9ccd2", z: 5.0, dir: -1, speed: 9 },
  { kind: "rickshaw", color: "#2f9a4f", z: 2.2, dir: -1, speed: 11 },
  { kind: "car", color: "#e3c24a", z: -4.9, dir: 1, speed: 9 },
  { kind: "bike", color: "#b3261e", z: 4.9, dir: -1, speed: 12 },
];

/** One 200 m block of town: houses and shops, towers, trees, lamps, the green median, a mosque and a half-built frame. */
function TownTile({ low, specs }: { low: boolean; specs: { north: HouseSpec[]; southA: HouseSpec[]; southB: HouseSpec[] } }) {
  const trees = useMemo(() => {
    const out: [number, number][] = [];
    for (let x = 22; x < 184; x += low ? 28 : 14) out.push([x, -8.3], [x + 7, 8.3]);
    return out;
  }, [low]);
  const lamps = useMemo(() => Array.from({ length: low ? 6 : 13 }, (_, i) => 20 + i * (low ? 26 : 13)), [low]);
  const medianLamps = useMemo(() => Array.from({ length: low ? 4 : 7 }, (_, i) => 14 + i * (low ? 44 : 26)), [low]);
  const poles = useMemo(() => Array.from({ length: 9 }, (_, i) => 20 + i * 20), []);
  return (
    <group>
      <HouseRow specs={specs.north} z={-10} front={1} low={low} />
      <HouseRow specs={specs.southA} z={10} front={-1} low={low} />
      <HouseRow specs={specs.southB} z={10} front={-1} low={low} />
      <Mosque x={92} z={10} front={-1} low={low} />
      <MedianGarden x0={0} x1={188} low={low} />
      <MedianLamps xs={medianLamps} />
      {!low && <KerbPaint x0={0} x1={188} z={-6.1} />}
      {!low && <KerbPaint x0={0} x1={188} z={6.1} />}
      <Tower x={60} z={-25} floors={11} front={1} tone="#bfbab0" />
      <Tower x={150} z={-24} width={18} floors={14} front={1} tone="#aeb4b8" />
      <Tower x={40} z={27} floors={12} front={-1} tone="#c9c2b2" />
      <Tower x={130} z={26} width={18} floors={9} front={-1} tone="#b9b4aa" />
      <ConstructionFrame x={108} z={-24} floors={7} front={1} />
      <Trees points={trees} low={low} />
      <Lamps xs={lamps} z={-7.4} side={1} />
      <Lamps xs={lamps.map((x) => x + 6)} z={7.4} side={-1} />
      {!low && <UtilityPoles xs={poles} z={-8.6} low={low} />}
      <Zebra x={100} />
      <Zebra x={30} />
      <SpeedBreaker x={70} z={-3.2} width={6} />
      <RubbishBin x={50} z={7.6} />
      <RubbishBin x={120} z={-7.6} />
      <FruitCart x={78} z={7.8} rotation={0.1} />
    </group>
  );
}

function VehicleModel({ kind, color }: { kind: Kind; color: string }) {
  if (kind === "rickshaw") return <Rickshaw body={color} />;
  if (kind === "bus") return <Bus />;
  if (kind === "bike") return <Motorbike color={color} />;
  return <Car color={color} />;
}

/** Guards at the gate: a moving one and one who stands by the pillar and waves. */
function Guard({ group, wave, motion, home }: { home?: THREE.Vector3; group: React.RefObject<THREE.Group | null>; wave?: React.RefObject<boolean>; motion: React.RefObject<number> }) {
  return (
    <group ref={group} position={home}>
      <Student index={5} scale={1.25} motion={motion} wave={wave ?? false} bag={false} phase={1.3} />
    </group>
  );
}

/** From the school gate, 2 km through the town, to the research centre gate where the guards check the taxi. */
export default function RoadScene({ sequence, manualFlight, onFlightDone, onSound, onEngine, onSay, onTraffic, reducedEffects }: SceneProps) {
  const low = reducedEffects;
  const taxi = useRef<THREE.Group>(null);
  const wheels = useRef<(THREE.Group | null)[]>([]);
  const light = useRef<THREE.DirectionalLight>(null);
  const skyGroup = useRef<THREE.Group>(null);
  const tiles = useRef<(THREE.Group | null)[]>([]);
  const tileBase = useRef(-99);
  const vehicleRefs = useRef<(THREE.Group | null)[]>([]);
  const seq = useRef(sequence);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const keys = useKeys();
  const drive = useRef({ x: START_X, z: LANE_DEFAULT, v: 0, vz: 0, honkHeld: false, finished: false, camReady: false, hum: 0, bump: 0, trafficPing: 0 });
  const gate = useRef({ state: "closed" as GateState, t: 0 });
  const barrier = useRef(0);
  const guardA = useRef<THREE.Group>(null);
  const guardB = useRef<THREE.Group>(null);
  const guardMove = useRef(0);
  const waveB = useRef(false);
  const noMove = useRef(0);
  const windowSpot = useMemo(() => new THREE.Vector3(), []);

  const vehicles = useMemo<Vehicle[]>(() => {
    const list = low ? TRAFFIC.filter((_, i) => i % 2 === 0) : TRAFFIC;
    return list.map((v, i) => ({ ...v, rel: -110 + (i * 330) / list.length + (i % 3) * 7 }));
  }, [low]);
  const vehicleState = useRef(vehicles.map((v) => ({ ...v })));
  useEffect(() => {
    vehicleState.current = vehicles.map((v) => ({ ...v }));
  }, [vehicles]);

  useEffect(() => {
    seq.current = sequence;
  }, [sequence]);

  const grass = groundTexture("grass-road-long", "#6fa05a", { variance: 38, repeat: [700, 60] });
  const specs = useMemo(() => {
    const thin = (list: HouseSpec[]) => (low ? list.filter((_, i) => i % 2 === 0) : list);
    return {
      north: thin(makeHouseRow(16, 184, 21, ["TAILOR", "TEA HOTEL", "MOBILE SHOP", "BAKERY", "GENERAL STORE"])),
      southA: thin(makeHouseRow(16, 84, 41, ["GENERAL STORE", "TEA HOTEL", "MEDICAL", "FRUIT SHOP"])),
      southB: thin(makeHouseRow(104, 184, 51, ["TAILOR", "BAKERY", "MEDICAL"])),
    };
  }, [low]);
  const startNorth = useMemo(() => makeHouseRow(-88, -68, 11, ["GENERAL STORE", "BAKERY", "MEDICAL"]), []);
  const startSouth = useMemo(() => makeHouseRow(-88, -34, 71, ["GENERAL STORE", "TEA HOTEL", "MEDICAL"]), []);

  const resetGate = () => {
    gate.current = { state: "closed", t: 0 };
    barrier.current = 0;
    guardA.current?.position.copy(GUARD_HOME);
  };

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    const d = drive.current;
    const g = gate.current;
    const phase = seq.current.phase;
    let following = false;

    d.trafficPing -= dt;
    if (d.trafficPing <= 0) {
      d.trafficPing = 1;
      onTraffic(true);
    }

    if (!manualFlight) {
      // Not driven by the player (for example after "Skip"): the gate is simply open.
      barrier.current = 1;
      d.x = phase === "done" ? END_X : START_X;
      d.v = 0;
    } else if (phase === "flight") {
      const held = (...n: string[]) => n.some((k) => keys.current.has(k));
      const input = getFlightInput();
      const gas = held("arrowup", "w") || input.thrust;
      const brake = held("arrowdown", "s") || input.brake;
      d.v = Math.min(MAX_SPEED, Math.max(0, d.v + (gas ? 8 : brake ? -18 : -3) * dt));
      d.x = Math.min(END_X, d.x + d.v * dt);
      // steering: Left/A toward the kerb, Right/D toward the median
      const steer = (held("arrowright", "d") || input.right ? 1 : 0) - (held("arrowleft", "a") || input.left ? 1 : 0);
      const targetVz = steer * 3.6 * Math.min(1, d.v / 4);
      d.vz += (targetVz - d.vz) * Math.min(1, dt * 7);
      d.z = Math.min(Z_MAX, Math.max(Z_MIN, d.z + d.vz * dt));
      const honk = held(" ") || input.horn;
      if (honk && !d.honkHeld) onSound("horn");
      d.honkHeld = honk;

      // other vehicles: touching one slows the taxi down and nudges it aside
      d.bump -= dt;
      for (const v of vehicleState.current) {
        const size = SIZE[v.kind];
        if (Math.abs(v.rel) < size.len / 2 + 2.2 && Math.abs(v.z - d.z) < size.hw + 0.9) {
          d.v = Math.min(d.v, v.dir === 1 ? v.speed * 0.8 : 1.5);
          d.z = Math.min(Z_MAX, Math.max(Z_MIN, d.z + Math.sign(d.z - v.z || 1) * 2.5 * dt));
          if (v.rel > 0 && v.dir === -1) d.x -= 3 * dt;
          if (d.bump <= 0) {
            d.bump = 1.6;
            onSound("horn");
          }
        }
      }

      // the barrier keeps the taxi back until the guards have checked it
      if (g.state !== "open" && d.x >= STOP_X) {
        d.x = STOP_X;
        d.v = 0;
        if (g.state === "closed") {
          g.state = "approach";
          g.t = 0;
          onSay([GATE_LINES.stop]);
        }
      }
      if (!d.finished && d.x >= END_X - 0.2) {
        d.finished = true;
        onFlightDone();
      }
      following = true;
      if (Math.abs(d.v / MAX_SPEED - d.hum) > 0.04) {
        d.hum = d.v / MAX_SPEED;
        onEngine(d.hum);
      }
    } else if (phase === "done") {
      d.x = END_X;
      d.v = 0;
      barrier.current = 1;
      if (d.hum > 0) {
        d.hum = 0;
        onEngine(0);
      }
      following = true;
    } else {
      Object.assign(d, { x: START_X, z: LANE_DEFAULT, v: 0, vz: 0, finished: false, camReady: false });
      if (g.state !== "closed") resetGate();
      if (d.hum > 0) {
        d.hum = 0;
        onEngine(0);
      }
    }

    // ---- traffic moves relative to the taxi, so there is always some around ----
    vehicleState.current.forEach((v, i) => {
      v.rel += (v.dir * v.speed - d.v) * dt;
      if (v.rel < -130) v.rel += 360;
      else if (v.rel > 230) v.rel -= 360;
      const worldX = d.x + v.rel;
      const ref = vehicleRefs.current[i];
      if (!ref) return;
      ref.visible = worldX < GATE_X - 16 && worldX > START_X - 60;
      ref.position.set(worldX, 0, v.z);
    });

    // ---- the town is built from 200 m blocks that are moved along with the taxi ----
    const n0 = Math.min(TILES - 1, Math.max(0, Math.floor((d.x - START_X) / TILE)));
    if (n0 !== tileBase.current) {
      tileBase.current = n0;
      tiles.current.forEach((t, s) => {
        if (!t) return;
        const n = n0 + s - 1;
        t.visible = n >= 0 && n < TILES;
        t.position.x = START_X + n * TILE;
      });
    }
    if (skyGroup.current) skyGroup.current.position.x = d.x;

    // ---- guards at the checkpoint ----
    const guard = guardA.current;
    guardMove.current = 0;
    if (g.state !== "closed" && g.state !== "open" && manualFlight) g.t += dt;
    if (guard && manualFlight) {
      const win = windowSpot.set(d.x + 0.6, 0, d.z + 1.3);
      if (g.state === "approach") {
        const k = Math.min(1, g.t / 1.5);
        guard.position.lerpVectors(GUARD_HOME, win, k);
        guard.rotation.y = Math.atan2(win.x - GUARD_HOME.x, win.z - GUARD_HOME.z);
        guardMove.current = k < 1 ? 1 : 0;
        if (k >= 1) {
          g.state = "check";
          g.t = 0;
          onSay([GATE_LINES.check]);
        }
      } else if (g.state === "check") {
        guard.rotation.y = Math.PI;
        guard.position.copy(win);
        if (g.t > 3.2) {
          g.state = "opening";
          g.t = 0;
          onSay([GATE_LINES.open]);
        }
      } else if (g.state === "opening") {
        const k = Math.min(1, g.t / 1.6);
        barrier.current = Math.min(1, g.t / 1.2);
        guard.position.lerpVectors(win, GUARD_HOME, k);
        guard.rotation.y = Math.atan2(GUARD_HOME.x - win.x, GUARD_HOME.z - win.z);
        guardMove.current = k < 1 ? 1 : 0;
        if (g.t > 1.7) {
          g.state = "open";
          guard.rotation.y = -Math.PI / 2 - 0.4;
        }
      }
      waveB.current = g.state === "opening" || g.state === "open";
    }

    if (taxi.current) {
      taxi.current.position.set(d.x, d.v > 0.05 ? Math.abs(Math.sin(clock.elapsedTime * 18)) * 0.02 * Math.min(1, d.v / 8) : 0, d.z);
      taxi.current.rotation.y = -Math.atan2(d.vz, Math.max(4, d.v)) * 0.8;
    }
    wheels.current.forEach((w) => w && (w.rotation.z -= (d.v / 0.37) * delta));
    if (manualFlight) setAltitude(((d.x - START_X) / (END_X - START_X)) * 100);

    // the sun and its shadows travel with the taxi
    if (light.current) {
      light.current.position.set(d.x + 14, 24, 10);
      light.current.target.position.set(d.x, 0, 0);
      light.current.target.updateMatrixWorld();
    }

    if (following && controls) {
      // The mouse stays free: the camera keeps its angle and follows the taxi.
      controls.enabled = true;
      const focus = new THREE.Vector3(d.x + 4, 1.5, d.z);
      if (!d.camReady) {
        d.camReady = true;
        camera.position.set(d.x - 9, 3.9, d.z + 6);
        controls.target.copy(focus);
      } else {
        camera.position.add(focus.clone().sub(controls.target));
        controls.target.copy(focus);
      }
      controls.update();
    } else if (controls) controls.enabled = true;
  });

  return (
    <>
      <color attach="background" args={[SKY]} />
      <group ref={skyGroup}>
        <SkyDome />
        <DriftingClouds span={160} y={[34, 54]} z={[-140, -50]} count={low ? 5 : 10} size={9} speed={0.8} />
      </group>
      <fog attach="fog" args={[HAZE, low ? 40 : 55, low ? 115 : 185]} />
      <hemisphereLight args={["#d6ecff", "#7a8f5a", 1.15]} />
      <directionalLight
        ref={light}
        position={[14, 24, 10]}
        intensity={2.2}
        castShadow={!low}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-34}
        shadow-camera-right={34}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0006}
      />

      <mesh rotation-x={-Math.PI / 2} position={[GATE_X / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[GATE_X + 400, 240]} />
        <meshStandardMaterial map={grass} roughness={1} />
      </mesh>
      <Road x0={-90} x1={GATE_X + 70} />

      <group position={[SCHOOL_X, 0, -24]}>
        <SchoolCompound low={low} />
      </group>
      <group position={[GATE_X, 0, 0]}>
        <SuparcoCompound open={barrier} low={low} />
      </group>

      {/* the first stretch, beside the school */}
      <HouseRow specs={startNorth} z={-10} front={1} low={low} />
      <HouseRow specs={startSouth} z={10} front={-1} low={low} />
      <MedianGarden x0={-88} x1={-52} low={low} />
      <Zebra x={-24} />

      {[0, 1, 2].map((s) => (
        <group key={s} ref={(el) => void (tiles.current[s] = el)} visible={false}>
          <TownTile low={low} specs={specs} />
        </group>
      ))}

      {vehicles.map((v, i) => (
        <group key={i} ref={(el) => void (vehicleRefs.current[i] = el)} rotation={[0, v.dir === 1 ? 0 : Math.PI, 0]}>
          <VehicleModel kind={v.kind} color={v.color} />
        </group>
      ))}

      {/* guards at the research centre gate */}
      <Guard group={guardA} motion={guardMove} home={GUARD_HOME} />
      <group position={[GATE_X - 2.6, 0, -7]} rotation={[0, -0.5, 0]}>
        <Guard group={guardB} wave={waveB} motion={noMove} />
      </group>

      <group ref={taxi} position={[START_X, 0, LANE_DEFAULT]}>
        <Taxi wheels={wheels} low={low} />
      </group>
    </>
  );
}
