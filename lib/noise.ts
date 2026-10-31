export const smooth = (t: number) => t * t * (3 - 2 * t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smoothstep = (e0: number, e1: number, x: number) => smooth(clamp01((x - e0) / (e1 - e0)));

export function hash(x: number, y: number, z: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 982451653);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function noise3(x: number, y: number, z: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const u = smooth(x - xi), v = smooth(y - yi), w = smooth(z - zi);
  const plane = (dz: number) =>
    lerp(
      lerp(hash(xi, yi, zi + dz), hash(xi + 1, yi, zi + dz), u),
      lerp(hash(xi, yi + 1, zi + dz), hash(xi + 1, yi + 1, zi + dz), u),
      v,
    );
  return lerp(plane(0), plane(1), w);
}

export function fbm(x: number, y: number, z: number, octaves: number): number {
  let sum = 0, amp = 0.5, freq = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise3(x * freq, y * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}
