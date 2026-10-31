"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { canvasTexture, flagTexture, labelTexture } from "@/lib/canvasTextures";
import { makeRockGeometry } from "@/lib/rockGeometry";
import { seededRandom } from "@/lib/random";
import { iceTexture } from "@/lib/moonTextures";
import { isLowQuality } from "@/lib/quality";
import { noise3 } from "@/lib/noise";
import { STATIONS, terrainHeight, type Station } from "@/lib/lunar";

/** Crumpled gold foil, as used to wrap real lunar instruments. */
const goldFoil = () =>
  canvasTexture("gold-foil", 256, 256, (g, w, h) => {
    g.fillStyle = "#b8901f";
    g.fillRect(0, 0, w, h);
    const random = seededRandom(3);
    for (let i = 0; i < 420; i++) {
      const x = random() * w, y = random() * h, s = 8 + random() * 26;
      g.fillStyle = random() < 0.5 ? "rgba(255,226,130,0.35)" : "rgba(90,60,10,0.3)";
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + s, y + random() * s * 0.6);
      g.lineTo(x + random() * s * 0.5, y + s);
      g.closePath();
      g.fill();
    }
  });

/** A grid of small circles: the corner-cube mirrors of a laser reflector. */
const reflectorTexture = () =>
  canvasTexture("reflector", 256, 192, (g, w, h) => {
    g.fillStyle = "#3a3d44";
    g.fillRect(0, 0, w, h);
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 8; c++) {
        const x = 18 + c * 31, y = 18 + r * 31;
        const grad = g.createRadialGradient(x, y, 2, x, y, 13);
        grad.addColorStop(0, "#e9f4ff");
        grad.addColorStop(1, "#6d8aa3");
        g.fillStyle = grad;
        g.beginPath();
        g.arc(x, y, 12, 0, Math.PI * 2);
        g.fill();
      }
    }
  });

/** Puts its children on the ground at (x, z), at the terrain height there. */
function OnGround({ x, z, children, rotation = 0 }: { x: number; z: number; children: ReactNode; rotation?: number }) {
  return (
    <group position={[x, terrainHeight(x, z), z]} rotation={[0, rotation, 0]}>
      {children}
    </group>
  );
}

/** Glowing ring on the ground and a soft beam of light that shows where a place is. Turns green once visited. */
function Marker({ station, visited }: { station: Station; visited: boolean }) {
  const beam = useRef<THREE.Mesh>(null);
  const y = terrainHeight(station.x, station.z);
  const color = visited ? "#5be584" : station.color;
  useFrame(({ clock }) => {
    if (beam.current) (beam.current.material as THREE.MeshBasicMaterial).opacity = (visited ? 0.08 : 0.17) + Math.sin(clock.elapsedTime * 2.2) * 0.05;
  });
  return (
    <group position={[station.x, y, station.z]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.07, 0]}>
        <ringGeometry args={[station.ring - 0.18, station.ring, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh ref={beam} position={[0, 5, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 10, 24, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} side={2} />
      </mesh>
    </group>
  );
}

/** A sign on a pole that always turns to face the camera. */
function Sign({ station, visited }: { station: Station; visited: boolean }) {
  const texture = labelTexture(`moon-sign-${station.id}-${visited}`, station.signLines, {
    bg: visited ? "#0f3d2e" : "#14264f",
    border: visited ? "#5be584" : "#ffd166",
    size: [768, 200],
    font: [58, 38],
  });
  const x = station.x + station.r * 0.9;
  const z = station.z - station.r * 0.5;
  return (
    <group position={[x, terrainHeight(x, z), z]}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 3.2, 8]} />
        <meshStandardMaterial color="#9aa0aa" metalness={0.7} roughness={0.4} />
      </mesh>
      <Billboard position={[0, 3.6, 0]}>
        <mesh>
          <planeGeometry args={[5.6, 1.45]} />
          <meshBasicMaterial map={texture} />
        </mesh>
      </Billboard>
    </group>
  );
}

/** Moon rocks: jagged boulders of different sizes and shades, plus a sample case, bags and a gnomon. */
function RocksStation({ station }: { station: Station }) {
  const geometry = useMemo(() => makeRockGeometry(4, 3), []);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const flag = flagTexture();
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const random = seededRandom(41);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < 14; i++) {
      const a = random() * Math.PI * 2;
      const d = 1.6 + random() * 3.6;
      const x = station.x + Math.cos(a) * d, z = station.z + Math.sin(a) * d;
      const s = 0.18 + random() * random() * 0.85;
      dummy.position.set(x, terrainHeight(x, z) + s * 0.1, z);
      dummy.rotation.set(random() * 0.4, random() * 6, random() * 0.4);
      dummy.scale.set(s * (0.8 + random() * 0.5), s * (0.55 + random() * 0.4), s * (0.8 + random() * 0.5));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      const tone = 0.27 + random() * 0.3;
      m.setColorAt(i, color.setRGB(tone * (1 + random() * 0.18), tone, tone * 0.9));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [station]);

  return (
    <>
      <instancedMesh ref={mesh} args={[geometry, undefined, 14]} castShadow receiveShadow>
        <meshStandardMaterial roughness={1} metalness={0} />
      </instancedMesh>
      <OnGround x={station.x} z={station.z}>
        {/* sample case with open lid, and two sample bags */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.9, 0.4, 0.6]} />
          <meshStandardMaterial color="#c9ced6" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.62, -0.32]} rotation={[-1.3, 0, 0]} castShadow>
          <boxGeometry args={[0.9, 0.05, 0.5]} />
          <meshStandardMaterial color="#c9ced6" metalness={0.8} roughness={0.35} />
        </mesh>
        {[-0.7, 0.8].map((x) => (
          <mesh key={x} position={[x, 0.1, 0.6]} scale={[1, 0.5, 0.8]} castShadow>
            <sphereGeometry args={[0.22, 12, 10]} />
            <meshStandardMaterial color="#f3f3ee" roughness={0.9} />
          </mesh>
        ))}
        {/* gnomon: a tripod with a post and a grey-scale bar, used to measure size and sun direction in photos */}
        <group position={[-1.8, 0, -0.6]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[Math.cos((i * 2 * Math.PI) / 3) * 0.28, 0.35, Math.sin((i * 2 * Math.PI) / 3) * 0.28]} rotation={[Math.sin((i * 2 * Math.PI) / 3) * 0.4, 0, -Math.cos((i * 2 * Math.PI) / 3) * 0.4]}>
              <cylinderGeometry args={[0.018, 0.018, 0.75, 6]} />
              <meshStandardMaterial color="#8a8f99" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
            <meshStandardMaterial color="#555b66" metalness={0.5} roughness={0.5} />
          </mesh>
          {["#ffffff", "#9b9b9b", "#2b2b2b"].map((c, i) => (
            <mesh key={c} position={[0, 0.35 + i * 0.12, 0.05]}>
              <boxGeometry args={[0.16, 0.1, 0.02]} />
              <meshStandardMaterial color={c} roughness={0.8} />
            </mesh>
          ))}
        </group>
        {/* national flag on a pole */}
        <group position={[2, 0, -1.2]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 2.4, 8]} />
            <meshStandardMaterial color="#cfd3d8" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.45, 2.05, 0]}>
            <planeGeometry args={[0.9, 0.6]} />
            <meshStandardMaterial map={flag} side={2} roughness={0.8} />
          </mesh>
        </group>
      </OnGround>
    </>
  );
}

/** Water ice: irregular frosty patches on the floor of a crater that never sees the Sun. */
function IceStation({ station }: { station: Station }) {
  const low = isLowQuality();
  const ice = iceTexture();
  const sparkles = useRef<THREE.InstancedMesh>(null);
  const SPARKLES = low ? 14 : 40;

  const data = useMemo(() => {
    const random = seededRandom(77);
    // frozen pond: a ring-shaped mesh that follows the crater floor, with an uneven shoreline
    const pond = new THREE.RingGeometry(0.01, 1, 44, 7);
    pond.rotateX(-Math.PI / 2);
    const pos = pond.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i), vz = pos.getZ(i);
      const a = Math.atan2(vz, vx);
      const shore = 2.9 * (0.78 + 0.3 * noise3(Math.cos(a) * 1.7 + 3, 1, Math.sin(a) * 1.7 + 3) + 0.12 * Math.sin(a * 5));
      const x = station.x + vx * shore, z = station.z + vz * shore * 0.85;
      pos.setXYZ(i, x, terrainHeight(x, z) + 0.07, z);
    }
    pond.computeVertexNormals();
    // frost and ice sheets on the slopes around the pond
    const patches = Array.from({ length: low ? 8 : 16 }, () => {
      const a = random() * Math.PI * 2;
      const d = 2.2 + random() * 3.4;
      const x = station.x + Math.cos(a) * d, z = station.z + Math.sin(a) * d;
      const shape = new THREE.Shape();
      const points = 14;
      const size = 0.35 + random() * 0.8;
      for (let k = 0; k < points; k++) {
        const t = (k / points) * Math.PI * 2;
        const rr = size * (0.7 + random() * 0.55);
        const px = Math.cos(t) * rr * 1.25, py = Math.sin(t) * rr;
        if (k === 0) shape.moveTo(px, py);
        else shape.lineTo(px, py);
      }
      shape.closePath();
      return { x, z, shape: new THREE.ShapeGeometry(shape), turn: random() * 6 };
    });
    // ice chunks standing at the edge of the pond
    const chunks = Array.from({ length: low ? 5 : 9 }, (_, i) => {
      const a = random() * Math.PI * 2;
      const d = 2 + random() * 2.2;
      const x = station.x + Math.cos(a) * d, z = station.z + Math.sin(a) * d;
      return { x, z, s: 0.25 + random() * 0.5, turn: random() * 6, seed: i + 2 };
    });
    const glints = Array.from({ length: SPARKLES }, () => {
      const a = random() * Math.PI * 2, d = random() * 4.6;
      const x = station.x + Math.cos(a) * d, z = station.z + Math.sin(a) * d;
      return { x, y: terrainHeight(x, z) + 0.12 + random() * 0.5, z, phase: random() * 6, speed: 1.5 + random() * 2.5 };
    });
    return { pond, patches, chunks, glints };
  }, [station, low, SPARKLES]);
  const chunkGeometry = useMemo(() => makeRockGeometry(31, 1), []);
  useEffect(
    () => () => {
      data.pond.dispose();
      data.patches.forEach((p) => p.shape.dispose());
      chunkGeometry.dispose();
    },
    [data, chunkGeometry],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const m = sparkles.current;
    if (!m) return;
    data.glints.forEach((s, i) => {
      // each glint flashes briefly, like sunlight on ice crystals
      const k = Math.max(0, Math.sin(clock.elapsedTime * s.speed + s.phase));
      dummy.position.set(s.x, s.y, s.z);
      dummy.scale.setScalar(0.02 + k ** 6 * 0.12);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  const material = low ? (
    <meshStandardMaterial map={ice} color="#f2fbff" roughness={0.45} metalness={0} emissiveMap={ice} emissive="#9fd0ee" emissiveIntensity={0.55} />
  ) : (
    <meshPhysicalMaterial map={ice} bumpMap={ice} bumpScale={0.4} color="#f2fbff" roughness={0.4} metalness={0} clearcoat={0.5} clearcoatRoughness={0.4} emissiveMap={ice} emissive="#9fd0ee" emissiveIntensity={0.55} />
  );

  return (
    <>
      <mesh geometry={data.pond} receiveShadow>
        {material}
      </mesh>
      {data.patches.map((p, i) => (
        <mesh key={i} geometry={p.shape} position={[p.x, terrainHeight(p.x, p.z) + 0.05, p.z]} rotation={[-Math.PI / 2, 0, p.turn]} receiveShadow>
          <meshStandardMaterial map={ice} color="#f2fbff" roughness={0.5} emissiveMap={ice} emissive="#9fd0ee" emissiveIntensity={0.45} />
        </mesh>
      ))}
      {data.chunks.map((c, i) => (
        <mesh key={i} geometry={chunkGeometry} position={[c.x, terrainHeight(c.x, c.z) + c.s * 0.35, c.z]} scale={[c.s, c.s * 1.5, c.s]} rotation={[0, c.turn, 0]} castShadow>
          <meshStandardMaterial color="#cdeaff" roughness={0.15} metalness={0.15} transparent opacity={0.88} emissive="#4a86b0" emissiveIntensity={0.4} />
        </mesh>
      ))}
      <instancedMesh ref={sparkles} args={[undefined, undefined, SPARKLES]} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#ffffff" />
      </instancedMesh>
      {/* a faint cold glow so the ice can be seen in the dark crater */}
      <pointLight position={[station.x, terrainHeight(station.x, station.z) + 2.2, station.z]} color="#8fd0ff" intensity={16} distance={14} />
    </>
  );
}

/** Science experiments: a gold-wrapped hub, seismometer, laser reflector, antenna, probe, drill and a power unit. */
function ExperimentsStation({ station }: { station: Station }) {
  const foil = goldFoil();
  const reflector = reflectorTexture();
  const led = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (led.current) (led.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + 2 * Math.max(0, Math.sin(clock.elapsedTime * 3.4));
  });
  const { x, z } = station;
  return (
    <>
      {/* central hub wrapped in gold foil */}
      <OnGround x={x} z={z}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.9, 1.2]} />
          <meshStandardMaterial map={foil} bumpMap={foil} bumpScale={1.5} metalness={0.9} roughness={0.38} />
        </mesh>
        <mesh position={[0.55, 1.02, 0.3]} castShadow>
          <boxGeometry args={[0.28, 0.14, 0.28]} />
          <meshStandardMaterial color="#d8dce3" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh ref={led} position={[-0.5, 1.0, 0.45]}>
          <sphereGeometry args={[0.06, 10, 8]} />
          <meshStandardMaterial color="#37d67a" emissive="#37d67a" emissiveIntensity={1} />
        </mesh>
      </OnGround>

      {/* seismometer: a silver dome on three legs (it feels moonquakes) */}
      <OnGround x={x - 2.6} z={z + 1.2}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos((i * 2 * Math.PI) / 3) * 0.42, 0.14, Math.sin((i * 2 * Math.PI) / 3) * 0.42]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 0.28, 8]} />
            <meshStandardMaterial color="#9aa0aa" metalness={0.8} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 0.4, 0]} castShadow>
          <sphereGeometry args={[0.55, 28, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#cfd5dd" metalness={0.95} roughness={0.22} side={2} />
        </mesh>
      </OnGround>

      {/* laser reflector: a panel of mirrors tilted toward Earth */}
      <OnGround x={x + 2.8} z={z + 1.4} rotation={-0.5}>
        <mesh position={[0, 0.55, 0]} rotation={[-0.9, 0, 0]} castShadow>
          <boxGeometry args={[1.3, 0.06, 0.95]} />
          <meshStandardMaterial map={reflector} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.25, -0.25]}>
          <boxGeometry args={[0.08, 0.5, 0.08]} />
          <meshStandardMaterial color="#8a8f99" metalness={0.7} roughness={0.4} />
        </mesh>
      </OnGround>

      {/* antenna dish pointing at Earth */}
      <OnGround x={x} z={z - 2.8} rotation={0.4}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 1.6, 8]} />
          <meshStandardMaterial color="#cfd3d8" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.75, 0]} rotation={[-0.9, 0, 0]} castShadow>
          <coneGeometry args={[0.85, 0.34, 32, 1, true]} />
          <meshStandardMaterial color="#f1f2f4" metalness={0.5} roughness={0.35} side={2} />
        </mesh>
      </OnGround>

      {/* temperature probe: a rod pushed into the soil with a red sensor bulb */}
      <OnGround x={x - 1.5} z={z - 1.8}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 1.3, 6]} />
          <meshStandardMaterial color="#b7bcc6" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.3, 0]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color="#e03a3a" roughness={0.5} />
        </mesh>
      </OnGround>

      {/* soil drill on a tripod */}
      <OnGround x={x + 1.9} z={z - 1.9}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos((i * 2 * Math.PI) / 3 + 0.5) * 0.4, 0.65, Math.sin((i * 2 * Math.PI) / 3 + 0.5) * 0.4]} rotation={[Math.sin((i * 2 * Math.PI) / 3 + 0.5) * 0.35, 0, -Math.cos((i * 2 * Math.PI) / 3 + 0.5) * 0.35]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.4, 6]} />
            <meshStandardMaterial color="#868c97" metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
          <meshStandardMaterial color="#c6cbd3" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.7, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#e8e8e8" metalness={0.5} roughness={0.45} />
        </mesh>
      </OnGround>

      {/* power unit with cooling fins */}
      <OnGround x={x + 0.2} z={z + 3.6}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.9, 16]} />
          <meshStandardMaterial color="#2d3037" metalness={0.8} roughness={0.4} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[Math.cos((i * Math.PI) / 3) * 0.36, 0.45, Math.sin((i * Math.PI) / 3) * 0.36]} rotation={[0, -(i * Math.PI) / 3, 0]}>
            <boxGeometry args={[0.2, 0.8, 0.03]} />
            <meshStandardMaterial color="#454a54" metalness={0.8} roughness={0.4} />
          </mesh>
        ))}
      </OnGround>
    </>
  );
}

/** The five places to explore: glowing marker, sign and the real-looking things that belong there. */
export function MoonStations({ explored }: { explored: string[] }) {
  return (
    <>
      {STATIONS.map((s) => (
        <group key={s.id}>
          <Marker station={s} visited={explored.includes(s.id)} />
          <Sign station={s} visited={explored.includes(s.id)} />
          {s.id === "rocks" && <RocksStation station={s} />}
          {s.id === "ice" && <IceStation station={s} />}
          {s.id === "experiments" && <ExperimentsStation station={s} />}
        </group>
      ))}
    </>
  );
}
