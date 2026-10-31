import * as THREE from "three";
import { clamp01, fbm, smoothstep } from "./noise";
import { seededRandom } from "./random";
import { isLowQuality } from "./quality";

// Procedural planet textures keep the game fully offline and tiny.
// They are built once and shared by every scene (never disposed while the app runs).
type Rgb = [number, number, number];

/** Samples 3D noise on a sphere so the equirectangular texture has no seam. */
function paintSphere(width: number, height: number, fn: (x: number, y: number, z: number, lat: number) => Rgb) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d")!;
  const img = g.createImageData(width, height);
  for (let py = 0; py < height; py++) {
    const lat = (0.5 - py / height) * Math.PI;
    for (let px = 0; px < width; px++) {
      const lon = (px / width) * Math.PI * 2;
      const [r, gr, b] = fn(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon), lat);
      const i = (py * width + px) * 4;
      img.data[i] = r;
      img.data[i + 1] = gr;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return { canvas, g };
}

function toTexture(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

let earth: THREE.CanvasTexture | null = null;
let moon: THREE.CanvasTexture | null = null;

export function getEarthTexture(): THREE.CanvasTexture {
  if (earth) return earth;
  const { canvas } = paintSphere(isLowQuality() ? 768 : 1536, isLowQuality() ? 384 : 768, (x, y, z, lat) => {
    const land = fbm(x * 2 + 5, y * 2, z * 2, 5);
    let c: Rgb;
    if (Math.abs(lat) > 1.45 + (land - 0.5) * 0.15) c = [236, 244, 250];
    else if (land > 0.53) {
      const dry = clamp01((land - 0.53) * 6 + (1 - Math.abs(Math.sin(lat * 1.4))) * 0.3);
      c = [60 + dry * 110, 130 - dry * 15, 62 + dry * 20];
    } else {
      const depth = clamp01((0.53 - land) * 4);
      c = [22 - depth * 10, 90 - depth * 35, 170 - depth * 50];
    }
    return c;
  });
  return (earth = toTexture(canvas));
}

export function getMoonTexture(): THREE.CanvasTexture {
  if (moon) return moon;
  const w = isLowQuality() ? 768 : 1536, h = isLowQuality() ? 384 : 768;
  const { canvas, g } = paintSphere(w, h, (x, y, z) => {
    // light highlands with fine detail, and big dark plains ("seas" of old lava) like the real near side
    const detail = fbm(x * 6, y * 6, z * 6, 5);
    const sea = smoothstep(0.52, 0.6, fbm(x * 1.6 + 4, y * 1.6, z * 1.6, 3)) * smoothstep(-0.2, 0.15, 0.55 - Math.abs(y) * 0.9);
    const v = (125 + detail * 95) * (1 - sea * 0.52);
    return [v * (1 - sea * 0.04), v * (1 - sea * 0.02), v * (0.96 + sea * 0.05)];
  });
  // Craters: dark floor with a bright rim. Wrapped copies avoid a visible seam.
  const rand = seededRandom(7);
  for (let i = 0; i < 280; i++) {
    const r = 3 + Math.pow(rand(), 2.5) * 56;
    const cx = rand() * w;
    const cy = h * (0.12 + rand() * 0.76);
    for (const dx of [-w, 0, w]) {
      const x = cx + dx;
      const grad = g.createRadialGradient(x, cy, r * 0.2, x, cy, r);
      grad.addColorStop(0, "rgba(40,40,42,0.5)");
      grad.addColorStop(0.8, "rgba(60,60,62,0.35)");
      grad.addColorStop(0.92, "rgba(235,235,235,0.5)");
      grad.addColorStop(1, "rgba(200,200,200,0)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, cy, r, 0, Math.PI * 2);
      g.fill();
    }
  }
  // a few young craters throw bright rays far across the surface
  for (let i = 0; i < 4; i++) {
    const cx = rand() * w, cy = h * (0.25 + rand() * 0.5), r = 9 + rand() * 9;
    for (let k = 0; k < 26; k++) {
      const a = rand() * Math.PI * 2, len = r * (3 + rand() * 9);
      const x2 = cx + Math.cos(a) * len, y2 = cy + Math.sin(a) * len * 0.8;
      const ray = g.createLinearGradient(cx, cy, x2, y2);
      ray.addColorStop(0, "rgba(245,245,240,0.38)");
      ray.addColorStop(1, "rgba(245,245,240,0)");
      g.strokeStyle = ray;
      g.lineWidth = 1 + rand() * 2.5;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(x2, y2);
      g.stroke();
    }
    g.fillStyle = "rgba(250,250,245,0.8)";
    g.beginPath();
    g.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    g.fill();
  }
  return (moon = toTexture(canvas));
}

let clouds: THREE.CanvasTexture | null = null;

/** White clouds with transparency, used on a slightly larger sphere around Earth. */
export function getCloudTexture(): THREE.CanvasTexture {
  if (clouds) return clouds;
  const w = isLowQuality() ? 512 : 1024, h = isLowQuality() ? 256 : 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d")!;
  const img = g.createImageData(w, h);
  for (let py = 0; py < h; py++) {
    const lat = (0.5 - py / h) * Math.PI;
    for (let px = 0; px < w; px++) {
      const lon = (px / w) * Math.PI * 2;
      const x = Math.cos(lat) * Math.cos(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.sin(lon);
      const c = fbm(x * 3.2 + 20, y * 3.2, z * 3.2, 5);
      const a = clamp01((c - 0.5) * 3.2);
      const i = (py * w + px) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
      img.data[i + 3] = a * 235;
    }
  }
  g.putImageData(img, 0, 0);
  return (clouds = toTexture(canvas));
}
