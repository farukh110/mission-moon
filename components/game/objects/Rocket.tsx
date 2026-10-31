"use client";

import { useEffect, useMemo, type Ref } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { flagTexture, flameTexture, glowTexture, rocketBodyTexture } from "@/lib/canvasTextures";

interface RocketProps {
  scale?: number;
  /** Landing legs, for standing on the Moon. */
  legs?: boolean;
  groupRef?: Ref<THREE.Group>;
  flameRef?: Ref<THREE.Group>;
}

/** Teardrop plume profile from the tip (bottom) up to the nozzle: wide near the engine, long and thin at the tail. */
const plumeProfile = [[0.001, -3.4], [0.08, -2.9], [0.2, -2.2], [0.34, -1.5], [0.46, -0.8], [0.5, -0.35], [0.44, 0]].map(([r, y]) => new THREE.Vector2(r, y));

/** The rocket's fire: three glowing layers (red, orange, white-hot), a glow halo and bright shock rings. */
function Flame() {
  const texture = flameTexture();
  const glow = glowTexture();
  const geometry = useMemo(() => new THREE.LatheGeometry(plumeProfile, 24), []);
  const layers = useMemo(
    () => [
      { color: "#ff3d14", scale: [1.2, 1, 1.2] as const, opacity: 0.55 },
      { color: "#ff9a2e", scale: [0.82, 0.86, 0.82] as const, opacity: 0.75 },
      { color: "#fff0b0", scale: [0.46, 0.62, 0.46] as const, opacity: 0.95 },
    ],
    [],
  );
  const group = useMemo(() => ({ current: null as THREE.Group | null }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // The layers wobble a little out of step with each other, like a real plume.
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    group.current?.children.forEach((child, i) => {
      if (i > 2) return;
      const flick = 1 + Math.sin(t * (38 + i * 11) + i * 2) * 0.08 + Math.sin(t * (71 + i * 7)) * 0.05;
      const base = layers[i].scale;
      child.scale.set(base[0] * (1 + (flick - 1) * 0.5), base[1] * flick, base[2] * (1 + (flick - 1) * 0.5));
    });
  });

  return (
    <group ref={(el) => { group.current = el; }}>
      {layers.map((l, i) => (
        <mesh key={i} geometry={geometry} scale={l.scale as unknown as [number, number, number]}>
          <meshBasicMaterial map={texture} color={l.color} transparent opacity={l.opacity} blending={THREE.AdditiveBlending} depthWrite={false} side={2} />
        </mesh>
      ))}
      {/* bright shock rings along the plume */}
      {[-0.9, -1.7, -2.4].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} scale={[1, 0.28, 1]}>
          <sphereGeometry args={[0.3 - i * 0.07, 12, 8]} />
          <meshBasicMaterial color="#fff6d0" transparent opacity={0.7 - i * 0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      {/* glow halo that always faces the camera */}
      <sprite position={[0, -0.6, 0]} scale={[4.2, 4.2, 1]}>
        <spriteMaterial map={glow} color="#ff8a30" transparent opacity={0.65} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
    </group>
  );
}

const ENGINES: [number, number][] = [[0, 0], [0.5, 0.5], [-0.5, 0.5], [0.5, -0.5], [-0.5, -0.5]];

/** Procedural rocket, about 11 units tall, standing on y = 0. */
export function Rocket({ groupRef, flameRef, scale = 1, legs = false }: RocketProps) {
  const skin = rocketBodyTexture();
  const plain = rocketBodyTexture(false);
  const flag = flagTexture();

  const { bell, nose, fin } = useMemo(() => {
    // Engine bell: narrow at the top, flared at the bottom.
    const bellProfile = [[0.42, 0], [0.34, 0.25], [0.24, 0.5], [0.15, 0.75], [0.12, 0.95]].map(([r, y]) => new THREE.Vector2(r, y));
    // Smooth pointed nose (an ogive curve).
    const noseProfile = Array.from({ length: 14 }, (_, i) => {
      const t = i / 13;
      return new THREE.Vector2(0.46 * (1 - Math.pow(t, 1.7)) + 0.001, 0.95 * t);
    });
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.95, 0);
    finShape.lineTo(0.35, 1.8);
    finShape.lineTo(0, 1.8);
    finShape.closePath();
    return {
      bell: new THREE.LatheGeometry(bellProfile, 20),
      nose: new THREE.LatheGeometry(noseProfile, 28),
      fin: new THREE.ExtrudeGeometry(finShape, { depth: 0.1, bevelEnabled: false }),
    };
  }, []);
  useEffect(
    () => () => {
      bell.dispose();
      nose.dispose();
      fin.dispose();
    },
    [bell, nose, fin],
  );

  return (
    <group ref={groupRef} scale={scale}>
      {/* engines: gold heat shield, dark nozzles with a hot glow inside */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[1, 0.95, 0.16, 40]} />
        <meshStandardMaterial color="#b8923a" metalness={0.85} roughness={0.3} />
      </mesh>
      {ENGINES.map(([x, z], i) => (
        <group key={i} position={[x, 0.08, z]} scale={i === 0 ? 1.25 : 1}>
          <mesh geometry={bell} castShadow>
            <meshStandardMaterial color="#3d424d" metalness={0.9} roughness={0.35} side={2} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#ff8a3d" emissive="#ff6a1a" emissiveIntensity={0.9} />
          </mesh>
        </group>
      ))}

      {/* lower stage: painted tank with panel seams, soot near the bottom */}
      <mesh castShadow receiveShadow position={[0, 3.1, 0]}>
        <cylinderGeometry args={[1, 1, 4.2, 64]} />
        <meshStandardMaterial map={skin} bumpMap={skin} bumpScale={1.2} roughness={0.38} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 1.7, 0]}>
        <cylinderGeometry args={[1.025, 1.025, 0.6, 48]} />
        <meshStandardMaterial color="#e8590c" roughness={0.55} />
      </mesh>
      {/* interstage: dark ring with ribs */}
      <mesh castShadow position={[0, 4.4, 0]}>
        <cylinderGeometry args={[1.03, 1.03, 0.3, 48]} />
        <meshStandardMaterial color="#232a38" roughness={0.5} metalness={0.4} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI) / 4) * 1.04, 4.4, Math.sin((i * Math.PI) / 4) * 1.04]} rotation={[0, -(i * Math.PI) / 4, 0]}>
          <boxGeometry args={[0.04, 0.3, 0.12]} />
          <meshStandardMaterial color="#3a4256" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}

      {/* upper stage with the national flag and a cable duct */}
      <mesh castShadow receiveShadow position={[0, 6.4, 0]}>
        <cylinderGeometry args={[0.85, 1, 3.4, 64]} />
        <meshStandardMaterial map={plain} bumpMap={plain} bumpScale={1.2} roughness={0.38} metalness={0.2} />
      </mesh>
      <mesh position={[0, 7.4, 0.89]}>
        <planeGeometry args={[0.6, 0.4]} />
        <meshStandardMaterial map={flag} roughness={0.6} />
      </mesh>
      <mesh position={[0.62, 6.3, 0.72]} rotation={[0, 0.7, 0]}>
        <boxGeometry args={[0.12, 3.2, 0.1]} />
        <meshStandardMaterial color="#9aa0aa" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* crew capsule with windows and small thruster pods */}
      <mesh castShadow position={[0, 8.9, 0]}>
        <cylinderGeometry args={[0.46, 0.85, 1.7, 48]} />
        <meshStandardMaterial color="#f7f8fb" roughness={0.35} metalness={0.15} />
      </mesh>
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={[x, 8.98, 0.64 - Math.abs(x) * 0.3]} rotation={[0.18, x * 0.6, 0]} scale={[1, 1.15, 0.35]}>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshStandardMaterial color="#10263f" emissive="#1f6fd1" emissiveIntensity={0.35} metalness={0.9} roughness={0.08} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI) / 2 + 0.78) * 0.86, 8.2, Math.sin((i * Math.PI) / 2 + 0.78) * 0.86]}>
          <boxGeometry args={[0.16, 0.2, 0.16]} />
          <meshStandardMaterial color="#59606e" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 9.75, 0]} geometry={nose}>
        <meshStandardMaterial color="#d62828" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 10.9, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.85, 8]} />
        <meshStandardMaterial color="#aab0ba" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* swept fins */}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
          <mesh geometry={fin} position={[0.98, 0.45, -0.05]} castShadow>
            <meshStandardMaterial color="#c9242a" roughness={0.45} metalness={0.25} />
          </mesh>
        </group>
      ))}

      {legs &&
        [0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 2 + Math.PI / 4, 0]}>
            <mesh castShadow position={[1.45, 0.78, 0]} rotation={[0, 0, 0.56]}>
              <cylinderGeometry args={[0.06, 0.06, 1.75, 8]} />
              <meshStandardMaterial color="#9aa0aa" metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh castShadow position={[1.9, 0.04, 0]}>
              <cylinderGeometry args={[0.35, 0.4, 0.08, 16]} />
              <meshStandardMaterial color="#c9b37a" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        ))}

      {/* flame (shown during flight) */}
      <group ref={flameRef} visible={false} position={[0, 0.25, 0]}>
        <Flame />
      </group>
    </group>
  );
}
