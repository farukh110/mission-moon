import * as THREE from "three";
import { canvasTexture } from "./canvasTextures";
import { fbm } from "./noise";
import { isLowQuality } from "./quality";
import { seededRandom } from "./random";

let dust: THREE.CanvasTexture | null = null;

/** Moon soil: fine grains, soft patches and many tiny craters with a lit rim and a dark side. Tiles without a visible edge. */
export function moonDustTexture(): THREE.CanvasTexture {
  if (dust) return dust;
  const size = isLowQuality() ? 256 : 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const g = canvas.getContext("2d")!;
  const img = g.createImageData(size, size);
  const random = seededRandom(5);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // looping noise: sample on a torus so the texture tiles
      const a = (x / size) * Math.PI * 2, b = (y / size) * Math.PI * 2;
      const patch = fbm(Math.cos(a) * 2 + 5, Math.sin(a) * 2 + Math.cos(b) * 2, Math.sin(b) * 2 + 5, 4);
      const grain = (random() - 0.5) * 34;
      const v = 150 + (patch - 0.5) * 90 + grain;
      const i = (y * size + x) * 4;
      img.data[i] = v * 1.01;
      img.data[i + 1] = v;
      img.data[i + 2] = v * 0.94;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const count = isLowQuality() ? 40 : 110;
  for (let i = 0; i < count; i++) {
    const r = 3 + Math.pow(random(), 2) * 22;
    const cx = random() * size, cy = random() * size;
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        const x = cx + dx, y = cy + dy;
        if (x < -r || y < -r || x > size + r || y > size + r) continue;
        // dark bowl, lit rim on the sun side
        const bowl = g.createRadialGradient(x + r * 0.15, y + r * 0.15, r * 0.1, x, y, r);
        bowl.addColorStop(0, "rgba(60,60,60,0.5)");
        bowl.addColorStop(0.75, "rgba(90,90,90,0.25)");
        bowl.addColorStop(1, "rgba(90,90,90,0)");
        g.fillStyle = bowl;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = "rgba(235,235,230,0.45)";
        g.lineWidth = Math.max(1, r * 0.14);
        g.beginPath();
        g.arc(x, y, r * 0.95, Math.PI * 1.05, Math.PI * 1.75);
        g.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(30, 30);
  tex.anisotropy = 4;
  return (dust = tex);
}

/** Frozen water: milky blue-white, cracks, trapped bubbles and bright frost. */
export const iceTexture = () =>
  canvasTexture("moon-ice", 512, 512, (g, w, h) => {
    const base = g.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, "#bfe4f7");
    base.addColorStop(0.5, "#f1fbff");
    base.addColorStop(1, "#a9d6ee");
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    const random = seededRandom(41);
    // cloudy depth
    for (let i = 0; i < 70; i++) {
      const x = random() * w, y = random() * h, r = 20 + random() * 70;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, random() < 0.5 ? "rgba(120,185,225,0.28)" : "rgba(255,255,255,0.4)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // cracks
    g.lineCap = "round";
    for (let i = 0; i < 26; i++) {
      let x = random() * w, y = random() * h, ang = random() * Math.PI * 2;
      g.strokeStyle = random() < 0.6 ? "rgba(70,130,175,0.65)" : "rgba(255,255,255,0.85)";
      g.lineWidth = 1 + random() * 2;
      g.beginPath();
      g.moveTo(x, y);
      for (let k = 0; k < 9; k++) {
        ang += (random() - 0.5) * 1.1;
        x += Math.cos(ang) * (14 + random() * 26);
        y += Math.sin(ang) * (14 + random() * 26);
        g.lineTo(x, y);
      }
      g.stroke();
    }
    // bubbles
    for (let i = 0; i < 120; i++) {
      g.fillStyle = "rgba(255,255,255,0.55)";
      g.beginPath();
      g.arc(random() * w, random() * h, 1 + random() * 3.5, 0, Math.PI * 2);
      g.fill();
    }
  });
