"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Rocket } from "../objects/Rocket";
import { Starfield } from "../objects/Starfield";
import { LaunchSite } from "../objects/LaunchSite";
import { SkyDome } from "../objects/Sky";
import { Crew } from "../objects/Crew";
import { Clouds, Puffs } from "../objects/Effects";
import { clamp01, lerp } from "@/lib/noise";
import { useKeys } from "@/hooks/useKeys";
import { getFlightInput, setAltitude } from "@/lib/flightInput";
import type { SequencePhase } from "@/hooks/useSequence";
import type { SceneProps } from "./types";

const SKY = new THREE.Color("#c3dcf2"); // matches the horizon of the sky dome, so the haze blends in
const SPACE = new THREE.Color("#000006");
const PAD_TOP = 0.3;
const CLIMB = 300; // world units gained during the flight

const CREW_WAIT: [number, number] = [-3.4, 5];
const CREW_HATCH: [number, number] = [0.2, 2];

/** The suited crew waves beside the rocket, then walks to it during the countdown and boards. */
function BoardingCrew({ phase, countdown, onSound }: { phase: SequencePhase; countdown: number; onSound: SceneProps["onSound"] }) {
  const group = useRef<THREE.Group>(null);
  const motion = useRef(0);
  const startedAt = useRef(0);
  const stride = useRef(0);
  const boarded = useRef(false);

  useEffect(() => {
    if (phase === "countdown") startedAt.current = performance.now();
  }, [phase]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const walking = phase === "countdown";
    const u = walking ? clamp01((performance.now() - startedAt.current) / (countdown * 850)) : 0;
    g.visible = phase === "idle" || (walking && u < 1);
    g.position.set(lerp(CREW_WAIT[0], CREW_HATCH[0], u), 0.3, lerp(CREW_WAIT[1], CREW_HATCH[1], u));
    g.rotation.y = walking ? Math.atan2(CREW_HATCH[0] - CREW_WAIT[0], CREW_HATCH[1] - CREW_WAIT[1]) : 0.5;
    motion.current = walking && u < 1 ? 1 : 0;
    if (walking && u < 1) {
      stride.current += delta;
      if (stride.current > 0.4) {
        stride.current = 0;
        onSound("step");
      }
    }
    if (phase === "idle") boarded.current = false;
    if (walking && u >= 1 && !boarded.current) {
      boarded.current = true;
      onSound("hatch");
    }
  });

  return (
    <group ref={group}>
      <Crew points={[[-0.9, 0, -0.5], [0, 0, 0], [0.9, 0, -0.5]]} suited wave={phase === "idle"} motion={motion} scale={0.8} />
    </group>
  );
}

/** Launchpad. During the launch stage it also plays the flight. */
export default function LaunchScene({ stage, sequence, reducedEffects, showCrew, onSound, manualFlight, onFlightDone, onThrust }: SceneProps) {
  const rocket = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  const clouds = useRef<THREE.Group>(null);
  const bg = useRef<THREE.Color>(null);
  const fog = useRef<THREE.Fog>(null);
  const starFade = useRef(0);
  const spaceFade = useRef(0);
  const seq = useRef(sequence);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const duration = stage.sequence?.duration ?? 12;
  const isLaunch = stage.kind === "launch";
  const keys = useKeys();
  const smokeTime = useRef(-1);
  const fly = useRef({ y: 0, vy: 0, x: 0, vx: 0, ignitedAt: -1, thrusting: false, finished: false, camReady: false });

  useEffect(() => {
    seq.current = sequence;
  }, [sequence]);

  /** Seconds since ignition, or -1 before it (automatic launch). */
  const getTime = () => {
    const s = seq.current;
    if (!isLaunch) return -1;
    if (s.phase === "done") return duration;
    if (s.phase === "flight") return Math.min(duration, (performance.now() - s.startedAt) / 1000);
    return -1;
  };

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    const f = fly.current;
    const phase = seq.current.phase;
    const manual = manualFlight && isLaunch;
    let y = 0;
    let x = 0;
    let tilt = 0;
    let flameOn = false;
    let shake = 0;
    let flying = false;

    if (manual) {
      // The player flies: Up = thrust (stronger than gravity), Left/Right = steer.
      if (phase === "flight") {
        const held = (...n: string[]) => n.some((k) => keys.current.has(k));
        const input = getFlightInput();
        const thrusting = held("arrowup", "w", " ") || input.thrust;
        const steer = (held("arrowright", "d") || input.right ? 1 : 0) - (held("arrowleft", "a") || input.left ? 1 : 0);
        f.vy = Math.min(38, Math.max(-30, f.vy + ((thrusting ? 20 : 0) - 9) * dt));
        f.y += f.vy * dt;
        if (f.y <= 0) {
          f.y = 0;
          f.vy = Math.max(0, f.vy);
        }
        f.vx += (steer * 16 - f.vx * 1.5) * dt;
        f.x = Math.min(30, Math.max(-30, f.x + f.vx * dt));
        if (thrusting && f.ignitedAt < 0) f.ignitedAt = performance.now();
        if (thrusting !== f.thrusting) onThrust(thrusting);
        f.thrusting = thrusting;
        flameOn = thrusting;
        shake = thrusting && f.y < 3 ? 0.04 : 0;
        if (!f.finished && f.y >= CLIMB) {
          f.finished = true;
          onThrust(false);
          onFlightDone();
        }
      } else if (phase === "done") {
        f.y = Math.max(f.y, CLIMB);
        flameOn = true;
      } else {
        Object.assign(f, { y: 0, vy: 0, x: 0, vx: 0, ignitedAt: -1, finished: false, camReady: false });
        if (f.thrusting) onThrust(false);
        f.thrusting = false;
      }
      y = f.y;
      x = f.x;
      tilt = -Math.max(-0.35, Math.min(0.35, f.vx * 0.02));
      flying = phase === "flight" || phase === "done";
      smokeTime.current = f.ignitedAt >= 0 ? (performance.now() - f.ignitedAt) / 1000 : -1;
      setAltitude(y);
    } else {
      const t = getTime();
      y = t < 0 ? 0 : 0.5 * ((2 * CLIMB) / (duration * duration)) * t * t;
      x = t >= 0 && t < 2 ? Math.sin(t * 60) * 0.05 * (1 - t / 2) : 0;
      tilt = t > 6 ? Math.min(0.25, (t - 6) * 0.06) : 0;
      flameOn = t >= 0;
      flying = t >= 0;
      smokeTime.current = t;
    }

    const r = rocket.current;
    if (r) {
      r.position.set(x + (shake ? Math.sin(clock.elapsedTime * 70) * shake : 0), PAD_TOP + y, 0);
      r.rotation.z = tilt;
    }
    if (flame.current) {
      flame.current.visible = flameOn;
      flame.current.scale.set(1, 1 + Math.sin(clock.elapsedTime * 45) * 0.15, 1);
    }
    if (glow.current) glow.current.intensity = flameOn && y < 40 ? 120 : 0;

    const skyT = clamp01((y - 40) / 180);
    bg.current?.copy(SKY).lerp(SPACE, skyT);
    if (bg.current && fog.current) fog.current.color.copy(bg.current);
    starFade.current = clamp01((skyT - 0.3) / 0.5);
    spaceFade.current = skyT;
    if (clouds.current) clouds.current.visible = skyT < 0.85;

    if (r && controls) {
      const focus = new THREE.Vector3(r.position.x, r.position.y + 4, 0);
      if (manual && flying) {
        // Mouse stays free: the camera keeps its angle and just follows the rocket.
        controls.enabled = true;
        if (!f.camReady) {
          f.camReady = true;
          camera.position.set(focus.x + 7, focus.y - 3.5, focus.z + 15);
          controls.target.copy(focus);
        } else {
          camera.position.add(focus.clone().sub(controls.target));
          controls.target.copy(focus);
        }
        controls.update();
      } else if (flying) {
        controls.enabled = false;
        const k = 1 - Math.exp(-4 * delta);
        camera.position.lerp(new THREE.Vector3(r.position.x + 7, r.position.y + 1, 15), k);
        controls.target.lerp(focus, k);
        controls.update();
      } else controls.enabled = true;
    }
  });

  return (
    <>
      <color ref={bg} attach="background" args={["#c3dcf2"]} />
      <SkyDome space={spaceFade} />
      <fog ref={fog} attach="fog" args={["#c3dcf2", 120, 800]} />
      <hemisphereLight args={["#dbe9f7", "#a08f68", 0.9]} />
      <directionalLight
        position={[26, 42, 22]}
        color="#fff1d8"
        intensity={3.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-bias={-0.0004}
      />
      <pointLight ref={glow} position={[0, 1.5, 1]} color="#ff9a3c" intensity={0} distance={40} />
      <Starfield count={reducedEffects ? 500 : 1200} radius={400} fade={starFade} />

      <LaunchSite shrubs={reducedEffects ? 30 : 70} />

      <Rocket groupRef={rocket} flameRef={flame} />
      {/* the crew waits by the rocket, then boards when the launch starts */}
      {showCrew && <BoardingCrew phase={sequence.phase} countdown={stage.sequence?.countdown ?? 5} onSound={onSound} />}

      {/* steam venting from the fuel tanks while the rocket waits */}
      <Puffs
        count={14}
        color="#e9eef5"
        origin={[1.1, 3.2, 0.4]}
        getTime={() => (seq.current.phase === "idle" || seq.current.phase === "countdown" ? (performance.now() / 1000) % 4 : -1)}
        emitSpan={3}
        life={3}
        spread={0.25}
        rise={0.9}
        size={0.5}
      />
      {isLaunch && (
        <>
          <Puffs
            count={reducedEffects ? 18 : 36}
            color="#dcdcdc"
            origin={[0, 0.6, 0]}
            getTime={() => smokeTime.current}
            emitSpan={6}
            life={3.5}
            spread={2.4}
            rise={1.1}
            size={3.2}
          />
          <group ref={clouds}>
            <Clouds count={reducedEffects ? 20 : 48} minY={30} maxY={170} spread={150} />
          </group>
        </>
      )}
    </>
  );
}
