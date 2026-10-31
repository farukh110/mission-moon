"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { seededRandom } from "@/lib/random";
import { getJourneyProgress } from "@/lib/journeyState";

const SKY_VERTEX = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uSun;
  uniform float uSpace;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, 0.0, 1.0);
    vec3 col = mix(uHorizon, uTop, pow(h, 0.55));
    float s = max(dot(vDir, normalize(uSun)), 0.0);
    col += vec3(1.0, 0.92, 0.75) * (pow(s, 900.0) * 3.0 + pow(s, 60.0) * 0.45 + pow(s, 6.0) * 0.12);
    col = mix(col, vec3(0.0, 0.0, 0.015), uSpace);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

interface SkyDomeProps {
  top?: string;
  horizon?: string;
  sun?: [number, number, number];
  /** 0 = daytime sky, 1 = black space. */
  space?: RefObject<number>;
}

/** A gradient sky with a soft sun, drawn on a huge inside-out sphere. */
export function SkyDome({ top = "#3f86e0", horizon = "#bfe0ff", sun = [0.5, 0.6, 0.4], space }: SkyDomeProps) {
  const uniforms = useMemo(
    () => ({ uTop: { value: new THREE.Color(top) }, uHorizon: { value: new THREE.Color(horizon) }, uSun: { value: new THREE.Vector3(...sun) }, uSpace: { value: 0 } }),
    [top, horizon, sun],
  );
  useFrame(() => {
    uniforms.uSpace.value = space?.current ?? 0;
  });
  return (
    <mesh renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[700, 32, 20]} />
      <shaderMaterial vertexShader={SKY_VERTEX} fragmentShader={SKY_FRAGMENT} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
}

interface DriftingCloudsProps {
  count?: number;
  /** Cloud centres are spread over x in ±span and z in [zMin, zMax]. */
  span: number;
  y: [number, number];
  z: [number, number];
  speed?: number;
  size?: number;
  seed?: number;
}

/** Soft low-poly clouds that slowly drift sideways and wrap around. One instanced mesh. */
export function DriftingClouds({ count = 10, span, y, z, speed = 0.6, size = 5, seed = 3 }: DriftingCloudsProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const clouds = useMemo(() => {
    const random = seededRandom(seed);
    return Array.from({ length: count }, () => ({
      x: (random() * 2 - 1) * span,
      y: y[0] + random() * (y[1] - y[0]),
      z: z[0] + random() * (z[1] - z[0]),
      s: size * (0.6 + random() * 0.9),
      v: speed * (0.6 + random() * 0.8),
    }));
  }, [count, span, y, z, speed, size, seed]);

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    clouds.forEach((c, i) => {
      c.x += c.v * Math.min(delta, 0.1);
      if (c.x > span) c.x = -span;
      dummy.position.set(c.x, c.y, c.z);
      dummy.scale.set(c.s * 1.7, c.s * 0.55, c.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#ffffff" emissive="#dfeeff" emissiveIntensity={0.55} flatShading fog={false} />
    </instancedMesh>
  );
}

/** An occasional streak of light across the sky, placed relative to the camera. */
export function ShootingStars() {
  const mesh = useRef<THREE.Mesh>(null);
  const camera = useThree((s) => s.camera);
  const state = useRef({ wait: 3, age: 0, active: false, from: new THREE.Vector3(), dir: new THREE.Vector3() });
  const tmp = useMemo(() => ({ fwd: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3() }), []);

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    const s = state.current;
    const dt = Math.min(delta, 0.1);
    if (!s.active) {
      m.visible = false;
      s.wait -= dt;
      if (s.wait > 0) return;
      // Start a new streak somewhere in front of the camera.
      camera.getWorldDirection(tmp.fwd);
      tmp.right.crossVectors(tmp.fwd, camera.up).normalize();
      tmp.up.crossVectors(tmp.right, tmp.fwd).normalize();
      const side = Math.random() < 0.5 ? -1 : 1;
      s.from.copy(camera.position).addScaledVector(tmp.fwd, 120).addScaledVector(tmp.right, -side * 70).addScaledVector(tmp.up, 25 + Math.random() * 30);
      s.dir.copy(tmp.right).multiplyScalar(side * 1).addScaledVector(tmp.up, -0.35).normalize();
      s.age = 0;
      s.active = true;
      return;
    }
    s.age += dt;
    const k = s.age / 0.8;
    if (k >= 1) {
      s.active = false;
      s.wait = 4 + Math.random() * 6;
      return;
    }
    m.visible = true;
    m.position.copy(s.from).addScaledVector(s.dir, k * 130);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), s.dir);
    m.scale.set(10 * Math.sin(Math.PI * k) + 0.1, 1, 1);
  });

  return (
    <mesh ref={mesh} visible={false} frustumCulled={false}>
      <boxGeometry args={[1, 0.18, 0.18]} />
      <meshBasicMaterial color="#ffffff" fog={false} />
    </mesh>
  );
}

/** Streaks rushing past the camera while the spacecraft travels (they follow the journey speed). */
export function SpeedLines({ count = 70 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const last = useRef(getJourneyProgress());
  const lines = useMemo(() => {
    const random = seededRandom(19);
    return Array.from({ length: count }, () => {
      const angle = random() * Math.PI * 2;
      const radius = 3 + random() * 11;
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: -60 + random() * 70 };
    });
  }, [count]);

  useFrame((_, delta) => {
    const m = mesh.current;
    const dt = Math.max(delta, 0.001);
    const p = getJourneyProgress();
    const speed = Math.abs(p - last.current) / dt; // journey progress per second
    last.current = p;
    if (group.current) group.current.visible = speed > 0.001;
    if (!m || speed <= 0.001) return;
    const v = 25 + speed * 2500;
    lines.forEach((l, i) => {
      l.z += v * Math.min(dt, 0.1);
      if (l.z > 10) l.z = -60;
      dummy.position.set(l.x, l.y, l.z);
      dummy.scale.set(1, 1, 1 + speed * 120);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} visible={false}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[0.035, 0.035, 2.4]} />
        <meshBasicMaterial color="#cfe6ff" fog={false} />
      </instancedMesh>
    </group>
  );
}
