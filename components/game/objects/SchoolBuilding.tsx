"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { flagTexture, groundTexture } from "@/lib/canvasTextures";
import { barWindowTexture, grassTexture, plasterTexture, schoolBoardTexture, schoolMuralTexture } from "@/lib/townTextures";
import { Trees } from "./Town";

/** Compound size, in metres: 30 x 28 = 840 square metres, about 1000 square yards. */
export const SCHOOL = { halfW: 15, halfD: 14, gateHalf: 2.5 };

const GREEN = "#94d64e";
const BLUE = { color: "#2d70c4", metalness: 0.5, roughness: 0.45 } as const;
const FRONT = -5.5; // z of the front wall
const WHITE = { color: "#f1f3ee", roughness: 0.85 } as const;

/** The two-storey green school: name board, barred windows, wall paintings, balcony and stairs. */
function Building() {
  const wall = plasterTexture("school-wall", GREEN);
  const board = schoolBoardTexture();
  const windows = barWindowTexture();
  const mural = schoolMuralTexture();
  const rails = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const m = rails.current;
    if (!m) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 27; i++) {
      dummy.position.set(-12.8 + i * 0.98, 4.55, FRONT + 1.5);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      <mesh position={[0, 4, -9]} castShadow receiveShadow>
        <boxGeometry args={[26, 8, 7]} />
        <meshStandardMaterial map={wall} roughness={0.9} />
      </mesh>
      {/* floor ledge, parapet and the balcony in front of the first floor */}
      <mesh position={[0, 4.05, -8.9]} castShadow>
        <boxGeometry args={[26.4, 0.3, 7.2]} />
        <meshStandardMaterial {...WHITE} />
      </mesh>
      <mesh position={[0, 8.2, -9]} castShadow>
        <boxGeometry args={[26.4, 0.5, 7.4]} />
        <meshStandardMaterial {...WHITE} />
      </mesh>
      <mesh position={[0, 4.12, FRONT + 0.75]} castShadow receiveShadow>
        <boxGeometry args={[26, 0.25, 1.5]} />
        <meshStandardMaterial {...WHITE} />
      </mesh>
      <instancedMesh ref={rails} args={[undefined, undefined, 27]}>
        <boxGeometry args={[0.07, 0.95, 0.07]} />
        <meshStandardMaterial {...BLUE} />
      </instancedMesh>
      <mesh position={[0, 5.05, FRONT + 1.5]}>
        <boxGeometry args={[26, 0.08, 0.1]} />
        <meshStandardMaterial {...BLUE} />
      </mesh>
      {[-12, -4, 4, 12].map((x) => (
        <mesh key={x} position={[x, 2, FRONT + 0.8]} castShadow>
          <boxGeometry args={[0.4, 4, 0.4]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
      ))}

      {/* the name board on the first floor, with a blue frame */}
      <mesh position={[0, 6.45, FRONT + 0.02]}>
        <planeGeometry args={[19.6, 3.27]} />
        <meshStandardMaterial map={board} roughness={0.7} />
      </mesh>
      {[-11.6, 11.6].map((x) => (
        <mesh key={x} position={[x, 6.35, FRONT + 0.02]}>
          <planeGeometry args={[1.9, 1.9]} />
          <meshStandardMaterial map={windows} roughness={0.6} />
        </mesh>
      ))}

      {/* ground floor: wall paintings, barred windows and a blue door */}
      {[-9.2, 9.2].map((x) => (
        <mesh key={x} position={[x, 2.1, FRONT + 0.02]}>
          <planeGeometry args={[6.2, 3.1]} />
          <meshStandardMaterial map={mural} roughness={0.8} />
        </mesh>
      ))}
      {[-4.3, 4.3].map((x) => (
        <mesh key={x} position={[x, 2.2, FRONT + 0.02]}>
          <planeGeometry args={[2.2, 2.2]} />
          <meshStandardMaterial map={windows} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 1.55, FRONT + 0.03]}>
        <boxGeometry args={[2.4, 3.1, 0.1]} />
        <meshStandardMaterial {...BLUE} />
      </mesh>
      <mesh position={[0, 3.35, FRONT + 0.05]}>
        <boxGeometry args={[3.1, 0.3, 0.12]} />
        <meshStandardMaterial {...WHITE} />
      </mesh>

      {/* stairs to the first floor, with blue railings */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[11.8, 0.2 + i * 0.4, 0.2 - i * 0.55]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.4 + (i ? 0 : 0), 0.55]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
      ))}
      {[10.45, 13.15].map((x) => (
        <mesh key={x} position={[x, 2.6, -2.1]} rotation={[0.6, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 6.4]} />
          <meshStandardMaterial {...BLUE} />
        </mesh>
      ))}
    </group>
  );
}

/** Flag on a tall pole that waves a little. */
function Flagpole({ x, z }: { x: number; z: number }) {
  const flag = flagTexture();
  const cloth = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (cloth.current) {
      cloth.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.14;
      cloth.current.rotation.z = Math.sin(clock.elapsedTime * 3.1) * 0.03;
    }
  });
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.45, 0.55, 0.3, 14]} />
        <meshStandardMaterial {...WHITE} />
      </mesh>
      <mesh position={[0, 5.2, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 10, 10]} />
        <meshStandardMaterial color="#d6dae0" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 10.15, 0]}>
        <sphereGeometry args={[0.14, 10, 8]} />
        <meshStandardMaterial color="#e6c453" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh ref={cloth} position={[1.65, 8.9, 0]}>
        <planeGeometry args={[3.3, 2.2]} />
        <meshStandardMaterial map={flag} side={2} roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Swing set and slide for the little ones. */
function Playground({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* swings */}
      {[-2, 2].map((sx) =>
        [-0.9, 0.9].map((s) => (
          <mesh key={`${sx}${s}`} position={[sx, 1.4, s * 0.4]} rotation={[s * 0.35, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 3, 8]} />
            <meshStandardMaterial color="#d6453d" metalness={0.5} roughness={0.5} />
          </mesh>
        )),
      )}
      <mesh position={[0, 2.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 4.1, 8]} />
        <meshStandardMaterial color="#d6453d" metalness={0.5} roughness={0.5} />
      </mesh>
      {[-0.8, 0.8].map((sx) => (
        <group key={sx} position={[sx, 0, 0]}>
          {[-0.28, 0.28].map((c) => (
            <mesh key={c} position={[c, 1.6, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 2.4, 6]} />
              <meshStandardMaterial color="#9aa0aa" metalness={0.8} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[0.7, 0.07, 0.3]} />
            <meshStandardMaterial color="#2d70c4" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* slide */}
      <group position={[4.5, 0, 0]}>
        <mesh position={[0, 0.9, -0.6]} castShadow>
          <boxGeometry args={[1, 1.8, 1]} />
          <meshStandardMaterial color="#f0a202" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.0, 1.0]} rotation={[0.72, 0, 0]} castShadow>
          <boxGeometry args={[0.8, 0.07, 2.6]} />
          <meshStandardMaterial color="#d9dde3" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

/** Low green boundary wall with a blue top stripe. Runs along the x axis (rotate for the other sides). */
function Wall({ length, position, rotation = 0 }: { length: number; position: [number, number, number]; rotation?: number }) {
  const wall = plasterTexture("school-wall", GREEN);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 2.6, 0.4]} />
        <meshStandardMaterial map={wall} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[length + 0.05, 0.25, 0.46]} />
        <meshStandardMaterial {...BLUE} />
      </mesh>
    </group>
  );
}

/** The blue metal gate: two leaves with vertical bars, between two white pillars. */
function Gate() {
  return (
    <group position={[0, 0, SCHOOL.halfD]}>
      {[-SCHOOL.gateHalf - 0.3, SCHOOL.gateHalf + 0.3].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 1.8, 0]} castShadow>
            <boxGeometry args={[0.7, 3.6, 0.7]} />
            <meshStandardMaterial {...WHITE} />
          </mesh>
          <mesh position={[0, 3.7, 0]}>
            <boxGeometry args={[0.9, 0.2, 0.9]} />
            <meshStandardMaterial {...BLUE} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * SCHOOL.gateHalf * 0.5, 0, 0]}>
          <mesh position={[0, 2.2, 0]}>
            <boxGeometry args={[SCHOOL.gateHalf, 0.12, 0.1]} />
            <meshStandardMaterial {...BLUE} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[SCHOOL.gateHalf, 0.12, 0.1]} />
            <meshStandardMaterial {...BLUE} />
          </mesh>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[-SCHOOL.gateHalf / 2 + 0.15 + (i * (SCHOOL.gateHalf - 0.3)) / 8, 1.3, 0]}>
              <boxGeometry args={[0.05, 1.95, 0.05]} />
              <meshStandardMaterial {...BLUE} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Everything inside and around the school wall. The gate faces +z; the building is at the back. */
export function SchoolCompound({ low }: { low: boolean }) {
  const paving = groundTexture("school-paving", "#cfc8b6", { variance: 16, grid: { color: "rgba(110,100,80,0.45)", step: 64, width: 3 }, repeat: [9, 8] });
  const grass = grassTexture([10, 1]);
  const { halfW, halfD, gateHalf } = SCHOOL;
  const sideLength = halfW - gateHalf;
  const treePoints: [number, number][] = [[-12.5, 2], [13, 1], [-12.5, 9.5], [13, 11], [-6, 11.5], [6, 12]];

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[halfW * 2, halfD * 2]} />
        <meshStandardMaterial map={paving} roughness={0.95} />
      </mesh>
      {/* lawn strips along the front wall and a painted assembly circle */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, halfD - 1.4]} receiveShadow>
        <planeGeometry args={[halfW * 2 - 1, 1.8]} />
        <meshStandardMaterial map={grass} roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.04, 1]}>
        <ringGeometry args={[4.2, 4.4, 48]} />
        <meshBasicMaterial color="#f3c63d" />
      </mesh>

      <Building />

      {/* boundary walls: front (with the gate gap), sides and back */}
      <Wall length={sideLength} position={[-(gateHalf + sideLength / 2), 0, halfD]} />
      <Wall length={sideLength} position={[gateHalf + sideLength / 2, 0, halfD]} />
      <Wall length={halfD * 2} position={[-halfW, 0, 0]} rotation={Math.PI / 2} />
      <Wall length={halfD * 2} position={[halfW, 0, 0]} rotation={Math.PI / 2} />
      <Wall length={halfW * 2} position={[0, 0, -halfD]} />
      <Gate />

      <Flagpole x={-9} z={5} />
      <Playground x={6} z={8} />
      <Trees points={treePoints} low={low} />

      {/* a water cooler and a few benches */}
      <group position={[12.2, 0, -3]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[2.2, 1, 0.6]} />
          <meshStandardMaterial color="#9aa0aa" metalness={0.7} roughness={0.4} />
        </mesh>
        {[-0.8, -0.27, 0.27, 0.8].map((x) => (
          <mesh key={x} position={[x, 1.1, 0.2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.25, 6]} />
            <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.25} />
          </mesh>
        ))}
      </group>
      {[-9, -3.5].map((x) => (
        <group key={x} position={[x, 0, -2]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[2, 0.12, 0.6]} />
            <meshStandardMaterial color="#8a5a34" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.9, -0.25]} castShadow>
            <boxGeometry args={[2, 0.5, 0.08]} />
            <meshStandardMaterial color="#8a5a34" roughness={0.9} />
          </mesh>
          {[-0.85, 0.85].map((lx) => (
            <mesh key={lx} position={[lx, 0.25, 0]}>
              <boxGeometry args={[0.08, 0.5, 0.5]} />
              <meshStandardMaterial color="#444" metalness={0.6} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
