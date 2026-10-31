import * as THREE from "three";
import { noise3 } from "./noise";

/**
 * A jagged, irregular boulder: a sphere pushed in and out by layers of noise, with a flattened bottom.
 * Share one geometry between many rocks and vary them with scale, rotation and colour.
 */
export function makeRockGeometry(seed = 0, detail = 3): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, detail);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const n =
      (noise3(v.x * 1.8 + seed, v.y * 1.8, v.z * 1.8) - 0.5) * 0.7 +
      (noise3(v.x * 5 + seed, v.y * 5, v.z * 5) - 0.5) * 0.22 +
      (noise3(v.x * 14, v.y * 14 + seed, v.z * 14) - 0.5) * 0.07;
    v.multiplyScalar(1 + n);
    if (v.y < -0.45) v.y = -0.45 + (v.y + 0.45) * 0.15;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}
