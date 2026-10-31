"use client";

import { useEffect, useMemo, type RefObject } from "react";
import * as THREE from "three";
import { labelTexture } from "@/lib/canvasTextures";
import { plateTexture } from "@/lib/townTextures";
import { Student } from "./Student";

export const TAXI_WHEELS: [number, number][] = [[1.38, 0.86], [1.38, -0.86], [-1.38, 0.86], [-1.38, -0.86]];

const BLACK = { color: "#17181b", metalness: 0.3, roughness: 0.6 } as const;
const GLASS = { color: "#16222c", metalness: 0.9, roughness: 0.08, transparent: true, opacity: 0.62, side: THREE.DoubleSide } as const;
const WIDTH = 1.74;

/** Side view of a small sedan (x forward, y up) extruded to the car's width, with softly rounded edges. */
function useBodyGeometry(low: boolean) {
  const geometry = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.1, 0.34);
    s.lineTo(-2.2, 0.5);
    s.lineTo(-2.2, 0.88);
    s.quadraticCurveTo(-2.18, 0.98, -2.05, 1.0);
    s.lineTo(-1.35, 1.04);
    s.quadraticCurveTo(-1.18, 1.06, -1.05, 1.28);
    s.lineTo(-0.9, 1.5);
    s.quadraticCurveTo(-0.85, 1.58, -0.7, 1.58);
    s.lineTo(0.35, 1.58);
    s.quadraticCurveTo(0.5, 1.58, 0.6, 1.46);
    s.lineTo(0.98, 1.06);
    s.quadraticCurveTo(1.05, 1.0, 1.2, 1.0);
    s.lineTo(1.95, 0.96);
    s.quadraticCurveTo(2.2, 0.92, 2.22, 0.74);
    s.lineTo(2.22, 0.46);
    s.quadraticCurveTo(2.2, 0.36, 2.08, 0.34);
    s.closePath();
    const d = WIDTH - 0.16;
    const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: low ? 1 : 3, curveSegments: low ? 5 : 10 });
    geo.translate(0, 0, -d / 2);
    geo.computeVertexNormals();
    return geo;
  }, [low]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

/** The car shell: painted body, glass, doors, lights, bumpers and mirrors. */
function Sedan({ color, roof, low, taxi }: { color: string; roof: string; low: boolean; taxi: boolean }) {
  const body = useBodyGeometry(low);
  const plate = plateTexture(taxi ? "KHI 4821" : "LEC 1507");
  const paint = { color, metalness: 0.4, roughness: 0.38 } as const;
  return (
    <group>
      <mesh geometry={body} castShadow receiveShadow>
        <meshStandardMaterial {...paint} />
      </mesh>
      {/* roof panel in its own colour */}
      <mesh position={[-0.18, 1.6, 0]} castShadow>
        <boxGeometry args={[1.1, 0.05, WIDTH - 0.14]} />
        <meshStandardMaterial color={roof} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* side windows, split by a pillar, on both sides */}
      {[1, -1].map((side) => (
        <group key={side} position={[0, 0, side * (WIDTH / 2 + 0.012)]}>
          <mesh position={[-0.52, 1.3, 0]}>
            <planeGeometry args={[0.62, 0.3]} />
            <meshStandardMaterial {...GLASS} />
          </mesh>
          <mesh position={[0.28, 1.3, 0]}>
            <planeGeometry args={[0.55, 0.3]} />
            <meshStandardMaterial {...GLASS} />
          </mesh>
          <mesh position={[-0.1, 1.3, 0.005]}>
            <boxGeometry args={[0.06, 0.34, 0.02]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
          {/* door gaps and handles */}
          {[-1.02, -0.12, 0.76].map((x) => (
            <mesh key={x} position={[x, 0.74, 0.003]}>
              <boxGeometry args={[0.012, 0.66, 0.01]} />
              <meshStandardMaterial color="#2a2417" />
            </mesh>
          ))}
          {[-0.28, 0.6].map((x) => (
            <mesh key={x} position={[x, 0.98, 0.02]}>
              <boxGeometry args={[0.14, 0.03, 0.03]} />
              <meshStandardMaterial color="#c9ccd2" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
          {/* black lower skirt and wheel arches */}
          <mesh position={[-0.02, 0.45, 0.004]}>
            <boxGeometry args={[2.3, 0.1, 0.01]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
          {[1.38, -1.38].map((x) => (
            <mesh key={x} position={[x, 0.37, 0.002]}>
              <circleGeometry args={[0.47, low ? 14 : 24]} />
              <meshStandardMaterial color="#0f1012" side={THREE.DoubleSide} />
            </mesh>
          ))}
          {/* mirror */}
          <mesh position={[0.82, 1.1, side * 0.07]}>
            <boxGeometry args={[0.1, 0.1, 0.14]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
        </group>
      ))}
      {/* windscreen and rear window */}
      <mesh position={[0.78, 1.27, 0]} rotation={[0, 0, -0.84]}>
        <boxGeometry args={[0.6, 0.02, WIDTH - 0.28]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>
      <mesh position={[-1.04, 1.27, 0]} rotation={[0, 0, 1.0]}>
        <boxGeometry args={[0.5, 0.02, WIDTH - 0.3]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>
      {/* wipers */}
      {[-0.35, 0.35].map((z) => (
        <mesh key={z} position={[0.9, 1.12, z]} rotation={[0, 0, -0.84]}>
          <boxGeometry args={[0.02, 0.015, 0.4]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}
      {/* grille, headlights, indicators */}
      <mesh position={[2.28, 0.7, 0]}>
        <boxGeometry args={[0.04, 0.2, 0.9]} />
        <meshStandardMaterial color="#202226" metalness={0.7} roughness={0.4} />
      </mesh>
      {[0.64, -0.64].map((z) => (
        <group key={z}>
          <mesh position={[2.2, 0.8, z]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.16, 0.16, 0.3]} />
            <meshStandardMaterial color="#fffbe6" emissive="#fff3b8" emissiveIntensity={0.9} metalness={0.5} roughness={0.15} />
          </mesh>
          <mesh position={[2.21, 0.64, z]}>
            <boxGeometry args={[0.12, 0.06, 0.2]} />
            <meshStandardMaterial color="#e8962a" emissive="#c96d00" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-2.22, 0.84, z]}>
            <boxGeometry args={[0.08, 0.16, 0.34]} />
            <meshStandardMaterial color="#c8201f" emissive="#a01010" emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
      {/* bumpers, plates, exhaust */}
      {[2.2, -2.2].map((x) => (
        <mesh key={x} position={[x, 0.42, 0]}>
          <boxGeometry args={[0.14, 0.14, WIDTH + 0.02]} />
          <meshStandardMaterial color="#2a2c31" metalness={0.6} roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[2.29, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.5, 0.17]} />
        <meshBasicMaterial map={plate} />
      </mesh>
      <mesh position={[-2.29, 0.56, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.5, 0.17]} />
        <meshBasicMaterial map={plate} />
      </mesh>
      <mesh position={[-2.28, 0.3, 0.55]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
        <meshStandardMaterial color="#555960" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* dark underbody so the car never looks hollow */}
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[4.2, 0.12, WIDTH - 0.3]} />
        <meshStandardMaterial color="#0e0f11" />
      </mesh>
    </group>
  );
}

function Wheel({ x, z, low, setRef }: { x: number; z: number; low: boolean; setRef: (el: THREE.Group | null) => void }) {
  const out = z > 0 ? 1 : -1;
  return (
    <group position={[x, 0.37, z]} ref={setRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.37, 0.37, 0.24, low ? 14 : 26]} />
        <meshStandardMaterial color="#141518" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0, out * 0.125]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.03, low ? 12 : 22]} />
        <meshStandardMaterial color="#b9bcc3" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, out * 0.142]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.03, 10]} />
        <meshStandardMaterial color="#e1e3e8" metalness={0.9} roughness={0.2} />
      </mesh>
      {!low &&
        [0, 1, 2, 3, 4].map((k) => (
          <mesh key={k} position={[0, 0, out * 0.145]} rotation={[0, 0, (k * Math.PI * 2) / 5]}>
            <boxGeometry args={[0.04, 0.4, 0.012]} />
            <meshStandardMaterial color="#8d9098" metalness={0.8} roughness={0.35} />
          </mesh>
        ))}
    </group>
  );
}

/**
 * A Karachi-style yellow taxi: small sedan with a black roof, a TAXI sign, a roof carrier and passengers.
 * About 4.4 m long, nose toward +x. `wheels` receives the four wheel groups so they can spin.
 */
export function Taxi({ wheels, low = false }: { wheels: RefObject<(THREE.Group | null)[]>; low?: boolean }) {
  const roofSign = labelTexture("taxi-sign", ["TAXI"], { bg: "#f6f3e4", fg: "#111111", border: "#f6f3e4", size: [256, 96], font: [64, 40] });
  return (
    <group>
      <Sedan color="#f4c10f" roof="#16171a" low={low} taxi />
      {/* black-and-yellow check band along the sides */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[0, 0.6, side * (WIDTH / 2 + 0.014)]}>
          <boxGeometry args={[2.9, 0.07, 0.012]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}
      {/* TAXI roof sign, readable from both sides */}
      <mesh position={[-0.18, 1.74, 0]}>
        <boxGeometry args={[0.72, 0.2, 0.3]} />
        <meshStandardMaterial color="#f6f3e4" emissive="#fff6c8" emissiveIntensity={0.45} />
      </mesh>
      {[0.155, -0.155].map((z) => (
        <mesh key={z} position={[-0.18, 1.74, z]} rotation={[0, z < 0 ? Math.PI : 0, 0]}>
          <planeGeometry args={[0.68, 0.18]} />
          <meshBasicMaterial map={roofSign} />
        </mesh>
      ))}
      {/* roof carrier with a tied bundle, as many city taxis carry */}
      {!low && (
        <group position={[-0.3, 1.66, 0]}>
          {[-0.7, 0.7].map((z) => (
            <mesh key={z} position={[0, 0.03, z * 0.9]}>
              <boxGeometry args={[1.0, 0.03, 0.03]} />
              <meshStandardMaterial color="#8d9098" metalness={0.8} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )}
      {/* passengers visible through the side windows */}
      {[-0.7, 0.1].map((x, i) => (
        <group key={x} position={[x - 0.2, 0.52, i === 1 ? -0.36 : 0.36]} rotation={[0, i === 1 ? 0 : -0.15, 0]}>
          <Student index={i} scale={0.5} bag={false} wave={i === 0} phase={i} />
        </group>
      ))}
      {TAXI_WHEELS.map(([x, z], i) => (
        <Wheel
          key={i}
          x={x}
          z={z}
          low={low}
          setRef={(el) => {
            if (wheels.current) wheels.current[i] = el;
          }}
        />
      ))}
    </group>
  );
}

/** A plain car in any colour, for parked and passing traffic. */
export function Car({ color = "#e8ecf2" }: { color?: string }) {
  return (
    <group>
      <Sedan color={color} roof={color} low taxi={false} />
      {TAXI_WHEELS.map(([x, z]) => (
        <Wheel key={`${x}${z}`} x={x} z={z} low setRef={() => undefined} />
      ))}
    </group>
  );
}
