import * as THREE from "three";
import { seededRandom } from "./random";

// Small drawn textures for signs, flags and screens. Cached by key so each is built once.
const cache = new Map<string, THREE.CanvasTexture>();

type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;

export function canvasTexture(key: string, w: number, h: number, draw: Draw): THREE.CanvasTexture {
  let tex = cache.get(key);
  if (!tex) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    draw(canvas.getContext("2d")!, w, h);
    tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    cache.set(key, tex);
  }
  return tex;
}

interface LabelOptions {
  /** Canvas size; match it to the sign's shape so text is not stretched. */
  size?: [number, number];
  /** Font sizes (px) of the first line and the other lines. */
  font?: [number, number];
  bg?: string;
  fg?: string;
  border?: string;
}

/** A sign with centred lines of text. The first line is drawn larger. */
export function labelTexture(key: string, lines: string[], { bg = "#12306b", fg = "#ffffff", border = "#ffd166", size = [512, 256], font = [52, 34] }: LabelOptions = {}) {
  return canvasTexture(key, size[0], size[1], (g, w, h) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = border;
    g.lineWidth = 10;
    g.strokeRect(5, 5, w - 10, h - 10);
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const step = h / (lines.length + 1);
    lines.forEach((line, i) => {
      g.font = `bold ${i === 0 ? font[0] : font[1]}px Segoe UI, Arial, sans-serif`;
      g.fillText(line, w / 2, step * (i + 1), w - 40);
    });
  });
}

export const flagTexture = () =>
  canvasTexture("flag", 384, 256, (g, w, h) => {
    g.fillStyle = "#01411c";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, w / 4, h);
    const cx = w * 0.62, cy = h / 2, r = h * 0.3;
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#01411c";
    g.beginPath();
    g.arc(cx + r * 0.3, cy - r * 0.12, r * 0.82, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#ffffff";
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? r * 0.3 : r * 0.12;
      g.lineTo(cx + r * 0.55 + Math.cos(a) * rad, cy - r * 0.45 + Math.sin(a) * rad);
    }
    g.fill();
  });

/** A glowing monitor with a fake telemetry trace. `seed` changes the look. */
export const screenTexture = (seed: number) =>
  canvasTexture(`screen-${seed}`, 256, 160, (g, w, h) => {
    g.fillStyle = "#06141f";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(80,220,255,0.18)";
    g.lineWidth = 1;
    for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = seed % 2 ? "#5be584" : "#4cc9f0";
    g.lineWidth = 3;
    g.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = h / 2 + Math.sin(x * 0.05 * (seed + 1)) * 30 + Math.sin(x * 0.17 + seed) * 10;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    g.fillStyle = "#ffb703";
    g.fillRect(12, 12, 50 + seed * 20, 8);
  });

export const mapTexture = () =>
  canvasTexture("earth-moon-map", 1024, 480, (g, w, h) => {
    g.fillStyle = "#061a33";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(80,160,255,0.2)";
    for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = "#ffffff";
    g.font = "bold 44px Segoe UI, Arial, sans-serif";
    g.textAlign = "center";
    g.fillText("EARTH – MOON MAP", w / 2, 60);
    const earthGrad = g.createRadialGradient(170, 270, 10, 170, 270, 110);
    earthGrad.addColorStop(0, "#5fb0ff");
    earthGrad.addColorStop(1, "#1250a0");
    g.fillStyle = earthGrad;
    g.beginPath(); g.arc(170, 270, 110, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#cfcfcf";
    g.beginPath(); g.arc(860, 270, 30, 0, Math.PI * 2); g.fill();
    g.setLineDash([16, 12]);
    g.strokeStyle = "#ffd166";
    g.lineWidth = 4;
    g.beginPath(); g.moveTo(290, 270); g.lineTo(820, 270); g.stroke();
    g.setLineDash([]);
    g.fillStyle = "#ffd166";
    g.font = "bold 34px Segoe UI, Arial, sans-serif";
    g.fillText("about 384,400 km", 555, 250);
    g.fillStyle = "#ffffff";
    g.font = "30px Segoe UI, Arial, sans-serif";
    g.fillText("Earth", 170, 430);
    g.fillText("Moon", 860, 350);
  });

interface GroundOptions {
  /** Brightness variation of the speckle (0-255). */
  variance?: number;
  /** Optional tile lines (pavement, floor tiles). */
  grid?: { color: string; step: number; width?: number };
  repeat: [number, number];
}

/** Speckled, tiling ground texture (grass, asphalt, sand, tiles). */
export function groundTexture(key: string, base: string, { variance = 24, grid, repeat }: GroundOptions): THREE.CanvasTexture {
  const tex = canvasTexture(`ground-${key}`, 256, 256, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    const img = g.getImageData(0, 0, w, h);
    const random = seededRandom(key.length * 131 + 7);
    for (let i = 0; i < img.data.length; i += 4) {
      const d = (random() - 0.5) * variance;
      img.data[i] += d;
      img.data[i + 1] += d;
      img.data[i + 2] += d;
    }
    g.putImageData(img, 0, 0);
    if (grid) {
      g.strokeStyle = grid.color;
      g.lineWidth = grid.width ?? 2;
      for (let p = 0; p <= w; p += grid.step) {
        g.beginPath(); g.moveTo(p, 0); g.lineTo(p, h); g.stroke();
        g.beginPath(); g.moveTo(0, p); g.lineTo(w, p); g.stroke();
      }
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  return tex;
}

/** Rocket skin: panel seams, rivets and the mission name, wrapped around the body. */
export const rocketBodyTexture = (withText = true) =>
  canvasTexture(withText ? "rocket-body" : "rocket-body-plain", 512, 512, (g, w, h) => {
    g.fillStyle = "#f4f6fa";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(90,100,120,0.55)";
    g.lineWidth = 2;
    for (let y = 0; y <= h; y += 128) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
      for (let x = 8; x < w; x += 24) {
        g.fillStyle = "rgba(90,100,120,0.5)";
        g.beginPath(); g.arc(x, y + 6, 1.6, 0, Math.PI * 2); g.fill();
      }
    }
    for (let x = 0; x <= w; x += 170) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke();
    }
    // soot toward the bottom, vertical streaks and slightly uneven panels
    const soot = g.createLinearGradient(0, 0, 0, h);
    soot.addColorStop(0, "rgba(40,36,30,0)");
    soot.addColorStop(0.55, "rgba(40,36,30,0.04)");
    soot.addColorStop(1, "rgba(40,34,26,0.5)");
    g.fillStyle = soot;
    g.fillRect(0, 0, w, h);
    const random = seededRandom(31);
    for (let i = 0; i < 90; i++) {
      g.fillStyle = `rgba(30,26,20,${0.03 + random() * 0.05})`;
      g.fillRect(random() * w, random() * h * 0.4, 1 + random() * 3, 40 + random() * 160);
    }
    for (let y = 0; y < h; y += 128) {
      for (let x = 0; x < w; x += 170) {
        g.fillStyle = `rgba(${random() < 0.5 ? "255,255,255" : "60,70,90"},${random() * 0.06})`;
        g.fillRect(x + 2, y + 2, 166, 124);
      }
    }
    // green and white bands, like the national colours
    g.fillStyle = "#01411c";
    g.fillRect(0, 36, w, 14);
    // mission name, read upward, centred on the front (u = 0 wraps around the edge)
    g.fillStyle = "#14264f";
    g.font = "bold 64px Segoe UI, Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (const x of withText ? [0, w] : []) {
      g.save();
      g.translate(x, h / 2);
      g.rotate(-Math.PI / 2);
      g.fillText("MISSION MOON", 0, 0);
      g.restore();
    }
  });

/** A soft round dot for stars. */
export const starSprite = () =>
  canvasTexture("star-sprite", 32, 32, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.7)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });

/** Hot plume gradient: white-hot at the nozzle (top) fading to nothing at the tip (bottom). */
export const flameTexture = () =>
  canvasTexture("flame", 64, 256, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.18, "rgba(255,255,255,0.95)");
    grad.addColorStop(0.55, "rgba(255,255,255,0.55)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });

/** A soft round glow (additive sprite). */
export const glowTexture = () =>
  canvasTexture("glow", 128, 128, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.25, "rgba(255,255,255,0.55)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });

/** Dark burn mark on the pad under the engines. */
export const scorchTexture = () =>
  canvasTexture("scorch", 256, 256, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    grad.addColorStop(0, "rgba(18,14,10,0.9)");
    grad.addColorStop(0.5, "rgba(24,20,16,0.55)");
    grad.addColorStop(1, "rgba(30,26,20,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });

/** A building front: plaster wall, rows of windows with frames, sills and a faint reflection. */
export const facadeTexture = (key: string, wall: string, cols: number, rows: number) =>
  canvasTexture(`facade-${key}`, 1024, 256, (g, w, h) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, w, h);
    const random = seededRandom(key.length * 17 + cols);
    for (let i = 0; i < 2500; i++) {
      g.fillStyle = `rgba(0,0,0,${random() * 0.05})`;
      g.fillRect(random() * w, random() * h, 2 + random() * 6, 2 + random() * 6);
    }
    const dirt = g.createLinearGradient(0, h * 0.6, 0, h);
    dirt.addColorStop(0, "rgba(60,50,40,0)");
    dirt.addColorStop(1, "rgba(60,50,40,0.28)");
    g.fillStyle = dirt;
    g.fillRect(0, 0, w, h);
    const cw = w / cols, ch = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cw + cw * 0.2, y = r * ch + ch * 0.18, ww = cw * 0.6, hh = ch * 0.56;
        g.fillStyle = "#3b3f46";
        g.fillRect(x - 5, y - 5, ww + 10, hh + 10);
        const glass = g.createLinearGradient(x, y, x + ww, y + hh);
        glass.addColorStop(0, "#7fa6c8");
        glass.addColorStop(0.5, "#34506b");
        glass.addColorStop(1, "#1d2c3d");
        g.fillStyle = glass;
        g.fillRect(x, y, ww, hh);
        g.fillStyle = "rgba(255,255,255,0.22)";
        g.beginPath();
        g.moveTo(x, y + hh * 0.5);
        g.lineTo(x + ww * 0.45, y);
        g.lineTo(x + ww * 0.65, y);
        g.lineTo(x, y + hh * 0.8);
        g.fill();
        g.fillStyle = "#3b3f46";
        g.fillRect(x + ww / 2 - 2, y, 4, hh);
        g.fillStyle = "#c9c4b8";
        g.fillRect(x - 8, y + hh + 5, ww + 16, 7);
      }
    }
  });
