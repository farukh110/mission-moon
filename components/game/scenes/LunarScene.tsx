"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MoonStations } from "../objects/MoonStations";
import { Team, type Dust } from "./MoonTeam";
import { Rocket } from "../objects/Rocket";
import { Earth } from "../objects/Earth";
import { Starfield } from "../objects/Starfield";
import { Puffs } from "../objects/Effects";
import { moonDustTexture } from "@/lib/moonTextures";
import { noise3 } from "@/lib/noise";
import { seededRandom } from "@/lib/random";
import { CRATERS, MOUNTAINS, OBSTACLES, nearStation, terrainHeight } from "@/lib/lunar";
import { makeRockGeometry } from "@/lib/rockGeometry";
import { isLowQuality } from "@/lib/quality";
import type { SceneProps } from "./types";

const ROCKET_START_HEIGHT = 36;

function Terrain() {
  const dust = moonDustTexture();
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(120, 120, isLowQuality() ? 110 : 220, isLowQuality() ? 110 : 220);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = terrainHeight(x, z);
      pos.setY(i, h + (noise3(x * 2.3, 7, z * 2.3) - 0.5) * 0.08 + (noise3(x * 6, 2, z * 6) - 0.5) * 0.03);
      let shade = 0.43 + (noise3(x * 0.5, 3, z * 0.5) - 0.5) * 0.14 + h * 0.03;
      // bright rays thrown out around the big crater (ejecta), like on the real Moon
      const big = CRATERS[0];
      const dBig = Math.hypot(x - big.x, z - big.z);
      if (dBig > big.r * 0.9 && dBig < 34) {
        const a = Math.atan2(z - big.z, x - big.x);
        const ray = Math.max(0, noise3(Math.cos(a) * 7, 1, Math.sin(a) * 7) - 0.58) * 1.6;
        shade += ray * 0.5 * (1 - (dBig - big.r) / 26);
      }
      // the ice crater never sees the Sun: its floor is very dark
      const ice = CRATERS[CRATERS.length - 1];
      const dIce = Math.hypot(x - ice.x, z - ice.z);
      if (dIce < ice.r) shade *= 0.4 + 0.6 * (dIce / ice.r) ** 2;
      // mountain tops are a little lighter, the valley a little darker
      shade += Math.max(0, h - 3) * 0.02;
      shade = Math.min(0.7, Math.max(0.14, shade));
      colors.set([shade * 1.02, shade, shade * 0.93], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors map={dust} roughness={1} bumpMap={dust} bumpScale={1.4} />
    </mesh>
  );
}

/** A far-away ring of low mountains and a dark plain beyond the play area, so the world has no visible edge. */
function Horizon() {
  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(170, 170, 40, 160, 4, true);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const a = Math.atan2(pos.getZ(i), pos.getX(i));
      const top = pos.getY(i) > 0;
      pos.setY(i, top ? 6 + noise3(Math.cos(a) * 3, 2, Math.sin(a) * 3) * 26 + noise3(Math.cos(a) * 11, 9, Math.sin(a) * 11) * 6 : -10);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#6f6f6c" roughness={1} flatShading side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -4.5, 0]}>
        <circleGeometry args={[175, 48]} />
        <meshStandardMaterial color="#5d5d5a" roughness={1} />
      </mesh>
    </>
  );
}

function Rocks({ count }: { count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => makeRockGeometry(1, 2), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const random = seededRandom(23);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let placed = 0;
    while (placed < count) {
      const x = (random() - 0.5) * 108;
      const z = (random() - 0.5) * 108;
      if (OBSTACLES.some((o) => Math.hypot(x - o.x, z - o.z) < o.r + 2.5) || nearStation(x, z, 2) || MOUNTAINS.some((m) => Math.hypot(x - m.x, z - m.z) < m.r)) continue;
      const s = 0.15 + random() * random() * 0.7;
      dummy.position.set(x, terrainHeight(x, z) + s * 0.25, z);
      dummy.rotation.set(random() * 3, random() * 3, random() * 3);
      dummy.scale.set(s, s * (0.5 + random() * 0.4), s);
      dummy.updateMatrix();
      m.setMatrixAt(placed, dummy.matrix);
      const g = 0.3 + random() * 0.25;
      m.setColorAt(placed, color.setRGB(g, g, g * 0.96));
      placed++;
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count]);
  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, count]} castShadow receiveShadow>
      <meshStandardMaterial roughness={1} />
    </instancedMesh>
  );
}

/** Small puffs of dust kicked up by each step. One instanced mesh. */
function FootDust({ dust }: { dust: React.RefObject<Dust[]> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    const m = mesh.current;
    const list = dust.current;
    if (!m || !list) return;
    const now = performance.now() / 1000;
    while (list.length && now - list[0].born > 0.9) list.shift();
    for (let i = 0; i < 12; i++) {
      const d = list[i];
      if (!d) dummy.scale.setScalar(0);
      else {
        const k = (now - d.born) / 0.9;
        dummy.position.set(d.x, d.y + 0.1 + k * 0.4, d.z);
        dummy.scale.setScalar(0.08 + Math.sin(Math.PI * k) * 0.28);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 12]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#8a8a86" />
    </instancedMesh>
  );
}

export default function LunarScene({ stage, sequence, motion, reducedEffects, onSound, onExplore, explored }: SceneProps) {
  const boulder = useMemo(() => makeRockGeometry(8, 3), []);
  useEffect(() => () => boulder.dispose(), [boulder]);
  const dust = useRef<Dust[]>([]);
  const rocket = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Group>(null);
  const seq = useRef(sequence);
  const duration = stage.sequence?.duration ?? 10;
  const isLanding = stage.kind === "landing";
  const landed = !isLanding || sequence.phase === "done";

  useEffect(() => {
    seq.current = sequence;
  }, [sequence]);

  /** Seconds since the descent began (0 until it starts, `duration` when finished). */
  const getTime = () => {
    const s = seq.current;
    if (!isLanding || s.phase === "done") return duration;
    if (s.phase === "flight") return Math.min(duration, (performance.now() - s.startedAt) / 1000);
    return 0;
  };

  useFrame(({ clock }) => {
    const t = getTime();
    const u = t / duration;
    if (rocket.current) rocket.current.position.y = ROCKET_START_HEIGHT * (1 - u) * (1 - u);
    if (flame.current) {
      flame.current.visible = t < duration - 0.05;
      flame.current.scale.set(1, (0.4 + (1 - u)) * (1 + Math.sin(clock.elapsedTime * 50) * 0.12), 1);
    }
  });

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.22} />
      <Starfield count={reducedEffects ? 700 : 1800} radius={210} />
      <Earth position={[-70, 46, -110]} scale={5} spin={motion} showAtmosphere={false} />
      <Terrain />
      <Horizon />
      <Rocks count={reducedEffects ? 80 : 240} />
      {OBSTACLES.slice(1).map((o) => (
        <mesh
          key={`${o.x}-${o.z}`}
          geometry={boulder}
          position={[o.x, terrainHeight(o.x, o.z) + o.r * 0.25, o.z]}
          scale={[o.r * 1.15, o.r * 0.9, o.r * 1.15]}
          rotation={[0, o.x, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#6d6b67" roughness={1} />
        </mesh>
      ))}
      <Rocket groupRef={rocket} flameRef={flame} scale={0.5} legs />
      {isLanding && (
        <Puffs
          count={reducedEffects ? 14 : 30}
          color="#8c8c8c"
          origin={[0, 0.3, 0]}
          getTime={() => (seq.current.phase === "done" ? 99 : getTime() - (duration - 4))}
          emitSpan={3}
          life={3}
          spread={3.2}
          rise={0.15}
          size={1.5}
        />
      )}
      <MoonStations explored={explored} />
      <Team landed={landed} shadows={!reducedEffects} onSound={onSound} onExplore={onExplore} dust={dust} />
      <FootDust dust={dust} />
    </>
  );
}
