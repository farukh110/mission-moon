"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Astronaut } from "../objects/Astronaut";
import { useKeys } from "@/hooks/useKeys";
import { clamp01, lerp } from "@/lib/noise";
import { MOON_BOUND, OBSTACLES, PLAYER_SPOTS, ROCKET_DOOR, STATIONS, terrainHeight } from "@/lib/lunar";
import type { SceneProps } from "./types";

const GRAVITY = 1.62; // Moon gravity, about one sixth of Earth's
const RUN_SPEED = 5.2;
const FOLLOW_SPEED = 4.2;
const ARRIVAL_MS = 3500;

export interface Dust {
  x: number;
  y: number;
  z: number;
  born: number;
}

interface Player {
  /** x, z on the ground; y is the height of the feet. */
  pos: THREE.Vector3;
  /** x, z are the running speed; y is the vertical speed. */
  vel: THREE.Vector3;
  heading: number;
  stride: number;
  motion: { current: number };
  wave: { current: boolean };
  group: THREE.Group | null;
}

interface TeamProps {
  landed: boolean;
  shadows: boolean;
  onSound: SceneProps["onSound"];
  onExplore: SceneProps["onExplore"];
  dust: RefObject<Dust[]>;
}

/**
 * The three students on the Moon. You move one with the arrow keys (Tab switches student),
 * the others follow. Walking into one of the five places explores it. Moon gravity makes jumps float.
 */
export function Team({ landed, shadows, onSound, onExplore, dust }: TeamProps) {
  const keys = useKeys();
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const sun = useRef<THREE.DirectionalLight>(null);
  const marker = useRef<THREE.Group>(null);

  const world = useMemo(
    () => ({
      players: PLAYER_SPOTS.map(
        (s, i): Player => ({
          pos: new THREE.Vector3(s[0], 0, s[1]),
          vel: new THREE.Vector3(),
          heading: 0.8 + i * 0.3,
          stride: 0,
          motion: { current: 0 },
          wave: { current: false },
          group: null,
        }),
      ),
      ctrl: 0,
      explored: new Set<string>(),
      wasLanded: false,
      landedAt: 0,
      placed: false,
      tabHeld: false,
      spaceHeld: false,
      focus: new THREE.Vector3(),
      f: new THREE.Vector3(),
      r: new THREE.Vector3(),
      want: new THREE.Vector3(),
    }),
    [],
  );

  // Tab switches student, so it must not move the keyboard focus around the page.
  useEffect(() => {
    if (!landed) return;
    const stop = (e: KeyboardEvent) => {
      if (e.key === "Tab") e.preventDefault();
    };
    window.addEventListener("keydown", stop);
    return () => window.removeEventListener("keydown", stop);
  }, [landed]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const w = world;
    const now = performance.now();
    const { players } = w;

    if (!landed) {
      w.wasLanded = false;
      w.placed = false;
      players.forEach((p) => p.group && (p.group.visible = false));
      if (marker.current) marker.current.visible = false;
      return;
    }
    if (!w.wasLanded) {
      w.wasLanded = true;
      w.landedAt = now;
      w.ctrl = 0;
      w.explored.clear();
      players.forEach((p) => p.pos.set(ROCKET_DOOR[0], terrainHeight(ROCKET_DOOR[0], ROCKET_DOOR[1]), ROCKET_DOOR[1]));
    }

    const held = (...n: string[]) => n.some((k) => keys.current.has(k));
    const arrival = clamp01((now - w.landedAt) / ARRIVAL_MS);

    if (arrival < 1) {
      // The students step out of the rocket and walk to their starting spots.
      players.forEach((p, i) => {
        const x = lerp(ROCKET_DOOR[0], PLAYER_SPOTS[i][0], arrival);
        const z = lerp(ROCKET_DOOR[1], PLAYER_SPOTS[i][1], arrival);
        p.pos.set(x, terrainHeight(x, z), z);
        p.heading = Math.atan2(PLAYER_SPOTS[i][0] - ROCKET_DOOR[0], PLAYER_SPOTS[i][1] - ROCKET_DOOR[1]);
        p.motion.current = 1;
        p.wave.current = false;
      });
    } else {
      // ---- switching students ----
      const tab = held("tab");
      if (tab && !w.tabHeld) w.ctrl = (w.ctrl + 1) % players.length;
      w.tabHeld = tab;

      // ---- movement input, relative to where the camera looks ----
      camera.getWorldDirection(w.f);
      w.f.y = 0;
      w.f.normalize();
      w.r.set(-w.f.z, 0, w.f.x);
      const fw = (held("arrowup", "w") ? 1 : 0) - (held("arrowdown", "s") ? 1 : 0);
      const sd = (held("arrowright", "d") ? 1 : 0) - (held("arrowleft", "a") ? 1 : 0);
      const space = held(" ");
      const jumpPressed = space && !w.spaceHeld;
      w.spaceHeld = space;
      const leader = players[w.ctrl];

      players.forEach((p, i) => {
        let wantX = 0;
        let wantZ = 0;
        let idle = false;

        if (i === w.ctrl) {
          w.want.set(0, 0, 0).addScaledVector(w.f, fw).addScaledVector(w.r, sd);
          if (w.want.lengthSq() > 0) w.want.normalize().multiplyScalar(RUN_SPEED);
          wantX = w.want.x;
          wantZ = w.want.z;
        } else {
          // The others walk along behind the student you control, and wave when they have caught up.
          const tx = leader.pos.x + (i % 2 ? 2.6 : -2.6);
          const tz = leader.pos.z - 2.2;
          const dx = tx - p.pos.x;
          const dz = tz - p.pos.z;
          const d = Math.hypot(dx, dz);
          if (d > 0.8) {
            const s = Math.min(FOLLOW_SPEED, d * 2.5);
            wantX = (dx / d) * s;
            wantZ = (dz / d) * s;
          } else idle = true;
        }

        // ---- horizontal movement ----
        const k = 1 - Math.exp(-8 * dt);
        p.vel.x += (wantX - p.vel.x) * k;
        p.vel.z += (wantZ - p.vel.z) * k;
        p.pos.x += p.vel.x * dt;
        p.pos.z += p.vel.z * dt;
        const speedNow = Math.hypot(p.vel.x, p.vel.z);
        if (speedNow > 0.4) {
          const diff = ((Math.atan2(p.vel.x, p.vel.z) - p.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
          p.heading += diff * Math.min(1, dt * 10);
        }

        // ---- jumping (Space): a high, floaty hop in Moon gravity ----
        const ground = terrainHeight(p.pos.x, p.pos.z);
        const grounded = p.pos.y <= ground + 0.02 && p.vel.y <= 0;
        if (i === w.ctrl && jumpPressed && grounded) p.vel.y = 3.2;
        if (grounded && p.vel.y <= 0) {
          p.pos.y = ground;
          p.vel.y = 0;
        } else {
          p.vel.y -= GRAVITY * dt;
          p.pos.y += p.vel.y * dt;
          if (p.pos.y <= ground && p.vel.y < 0) {
            p.pos.y = ground;
            p.vel.y = 0;
          }
        }

        // ---- keep out of boulders and the rocket, and inside the play area ----
        for (const o of OBSTACLES) {
          const ox = p.pos.x - o.x, oz = p.pos.z - o.z;
          const d = Math.hypot(ox, oz);
          const min = o.r + 0.6;
          if (d < min && d > 0.0001) {
            p.pos.x = o.x + (ox / d) * min;
            p.pos.z = o.z + (oz / d) * min;
          }
        }
        players.forEach((q, j) => {
          if (j <= i) return;
          const ox = p.pos.x - q.pos.x, oz = p.pos.z - q.pos.z;
          const d = Math.hypot(ox, oz);
          if (d < 0.9 && d > 0.0001) {
            const push = (0.9 - d) / 2;
            p.pos.x += (ox / d) * push;
            p.pos.z += (oz / d) * push;
            q.pos.x -= (ox / d) * push;
            q.pos.z -= (oz / d) * push;
          }
        });
        const radius = Math.hypot(p.pos.x, p.pos.z);
        if (radius > MOON_BOUND) {
          p.pos.x *= MOON_BOUND / radius;
          p.pos.z *= MOON_BOUND / radius;
        }

        // ---- reaching one of the five places explores it ----
        for (const s of STATIONS) {
          if (!w.explored.has(s.id) && Math.hypot(p.pos.x - s.x, p.pos.z - s.z) < s.r) {
            w.explored.add(s.id);
            onExplore(s.id);
          }
        }

        // ---- animation, footsteps and dust ----
        const onGround = p.pos.y <= terrainHeight(p.pos.x, p.pos.z) + 0.05;
        p.motion.current += ((onGround && speedNow > 0.6 ? Math.min(1, speedNow / RUN_SPEED + 0.3) : 0) - p.motion.current) * Math.min(1, dt * 10);
        p.wave.current = i !== w.ctrl && idle;
        if (onGround && speedNow > 1) {
          p.stride += dt * (speedNow / RUN_SPEED);
          if (p.stride > 0.38) {
            p.stride = 0;
            if (i === w.ctrl) onSound("moonstep");
            const list = dust.current;
            if (list) {
              list.push({ x: p.pos.x, y: terrainHeight(p.pos.x, p.pos.z), z: p.pos.z, born: now / 1000 });
              if (list.length > 12) list.shift();
            }
          }
        }
      });
    }

    // ---- show everything ----
    players.forEach((p) => {
      if (!p.group) return;
      p.group.visible = true;
      p.group.position.copy(p.pos);
      p.group.rotation.y = p.heading;
    });
    const lead = players[world.ctrl];
    if (marker.current) {
      marker.current.visible = arrival >= 1;
      marker.current.position.set(lead.pos.x, lead.pos.y + 2.95 + Math.sin(now / 250) * 0.12, lead.pos.z);
      marker.current.rotation.y = now / 600;
    }

    // ---- third-person camera follows the student you control ----
    if (controls) {
      world.focus.set(lead.pos.x, lead.pos.y + 1.2, lead.pos.z);
      if (!world.placed) {
        world.placed = true;
        camera.position.set(lead.pos.x - 4, lead.pos.y + 4.5, lead.pos.z - 10);
        controls.target.copy(world.focus);
      } else {
        const k = 1 - Math.exp(-6 * dt);
        world.want.copy(controls.target).lerp(world.focus, k);
        camera.position.add(world.want.clone().sub(controls.target));
        controls.target.copy(world.want);
      }
      controls.update();
    }

    if (sun.current) {
      sun.current.position.set(world.focus.x - 26, world.focus.y + 18, world.focus.z + 14);
      sun.current.target.position.set(world.focus.x, world.focus.y - 1, world.focus.z);
      sun.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <directionalLight
        ref={sun}
        intensity={3.2}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0006}
      />
      {PLAYER_SPOTS.map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            world.players[i].group = el;
          }}
          visible={false}
        >
          <Astronaut motion={world.players[i].motion} wave={world.players[i].wave} phase={i * 1.7} face={i} />
        </group>
      ))}
      {/* a spinning arrow above the student you control */}
      <group ref={marker} visible={false}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.22, 0.45, 4]} />
          <meshBasicMaterial color="#ffd166" />
        </mesh>
      </group>
    </>
  );
}
