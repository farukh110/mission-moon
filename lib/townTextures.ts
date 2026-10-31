import * as THREE from "three";
import { canvasTexture, flagTexture } from "./canvasTextures";
import { seededRandom } from "./random";

// Painted textures for the school, the street and the SUPARCO gate (all drawn in code, no image files).

/** Smooth painted plaster with faint stains, used for walls. */
export const plasterTexture = (key: string, color: string) =>
  canvasTexture(`plaster-${key}`, 256, 256, (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    const random = seededRandom(key.length * 7 + 3);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(0,0,0,${random() * 0.04})`;
      g.fillRect(random() * w, random() * h, 3 + random() * 12, 2 + random() * 8);
    }
    const stain = g.createLinearGradient(0, h * 0.55, 0, h);
    stain.addColorStop(0, "rgba(40,36,28,0)");
    stain.addColorStop(1, "rgba(40,36,28,0.22)");
    g.fillStyle = stain;
    g.fillRect(0, 0, w, h);
  });

/** The school name board: blue border, light green panel, blue lettering and a round emblem at each end. */
export const schoolBoardTexture = () =>
  canvasTexture("school-board", 1536, 256, (g, w, h) => {
    g.fillStyle = "#2f7fd0";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#c4ec7a";
    g.fillRect(14, 14, w - 28, h - 28);
    const emblem = (cx: number) => {
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.arc(cx, h / 2, 74, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#2f7fd0";
      g.lineWidth = 8;
      g.stroke();
      g.fillStyle = "#2f7fd0";
      g.fillRect(cx - 34, h / 2 - 8, 68, 40); // an open book
      g.fillStyle = "#ffffff";
      g.fillRect(cx - 3, h / 2 - 8, 6, 40);
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 === 0 ? 20 : 8;
        g.lineTo(cx + Math.cos(a) * r, h / 2 - 34 + Math.sin(a) * r);
      }
      g.fill();
    };
    emblem(130);
    emblem(w - 130);
    g.fillStyle = "#1d5fb4";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "bold 92px Segoe UI, Arial, sans-serif";
    g.fillText("GBLSS", w / 2, 74);
    g.font = "bold 70px Segoe UI, Arial, sans-serif";
    g.fillText("GHULAM MUHAMMAD", w / 2, 150);
    g.font = "bold 56px Segoe UI, Arial, sans-serif";
    g.fillText("VILLAGE MALIR", w / 2, 212);
  });

/** Black window panes with white bars inside a blue frame, like the school's windows. */
export const barWindowTexture = () =>
  canvasTexture("bar-window", 256, 256, (g, w, h) => {
    g.fillStyle = "#2d6fc0";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#0e0f12";
    g.fillRect(10, 10, w - 20, h - 20);
    g.strokeStyle = "#eef1f5";
    g.lineWidth = 7;
    for (let i = 1; i < 4; i++) {
      g.beginPath(); g.moveTo(10 + (i * (w - 20)) / 4, 10); g.lineTo(10 + (i * (w - 20)) / 4, h - 10); g.stroke();
    }
    g.beginPath(); g.moveTo(10, h / 2); g.lineTo(w - 10, h / 2); g.stroke();
    g.fillStyle = "rgba(120,160,200,0.15)";
    g.beginPath(); g.moveTo(10, 10); g.lineTo(120, 10); g.lineTo(10, 120); g.fill();
  });

/** A wall painting: the national flag, two children, clouds and a tree. */
export const schoolMuralTexture = () =>
  canvasTexture("school-mural", 768, 384, (g, w, h) => {
    g.fillStyle = "#94d64d";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#3d86d8";
    for (const [x, y] of [[90, 60], [560, 40], [660, 90]]) {
      g.beginPath();
      g.ellipse(x, y, 52, 14, 0, 0, Math.PI * 2);
      g.fill();
    }
    // flag on a pole held by two children
    const flag = flagTexture().image as HTMLCanvasElement;
    g.fillStyle = "#c9ced6";
    g.fillRect(300, 70, 8, 280);
    g.drawImage(flag, 308, 74, 150, 100);
    const kid = (x: number, color: string) => {
      g.fillStyle = "#c68a5a";
      g.beginPath(); g.arc(x, 220, 20, 0, Math.PI * 2); g.fill();
      g.fillStyle = color;
      g.fillRect(x - 22, 244, 44, 90);
      g.fillStyle = "#1f2a44";
      g.fillRect(x - 20, 334, 16, 40);
      g.fillRect(x + 4, 334, 16, 40);
    };
    kid(260, "#ffffff");
    kid(350, "#ffffff");
    // a round tree
    g.fillStyle = "#6b4a2b";
    g.fillRect(612, 220, 22, 150);
    g.fillStyle = "#2f8a3b";
    g.beginPath(); g.arc(623, 170, 86, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3da44a";
    g.beginPath(); g.arc(600, 150, 50, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#2d6fc0";
    g.lineWidth = 14;
    g.strokeRect(7, 7, w - 14, h - 14);
  });

/** Road surface for 24 m of road, 12 m wide: worn asphalt, edge lines and a dashed centre line. */
const paintRoad = (lanes: number) => (g: CanvasRenderingContext2D, w: number, h: number) => {
    // a busy city road: sun-bleached asphalt, patched repairs, cracks, oil, potholes and drifted dust
    g.fillStyle = "#4a4b4d";
    g.fillRect(0, 0, w, h);
    const random = seededRandom(17);
    for (let i = 0; i < 22000; i++) {
      const v = 62 + random() * 62;
      g.fillStyle = `rgba(${v},${v - 2},${v - 6},0.4)`;
      g.fillRect(random() * w, random() * h, 1 + random() * 2, 1 + random() * 2);
    }
    // big uneven tonal patches
    for (let i = 0; i < 26; i++) {
      const x = random() * w, y = random() * h, r = 40 + random() * 120;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, random() < 0.5 ? "rgba(30,30,32,0.28)" : "rgba(150,140,120,0.16)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // darker wheel tracks in each lane, with oil in the middle of them
    for (const y of Array.from({ length: lanes }, (_, i) => (h * (i + 0.5)) / lanes)) {
      g.fillStyle = "rgba(15,15,17,0.22)";
      g.fillRect(0, y - 40, w, 22);
      g.fillRect(0, y + 18, w, 22);
      for (let i = 0; i < 7; i++) {
        g.fillStyle = "rgba(10,10,12,0.3)";
        g.beginPath();
        g.ellipse(random() * w, y + (random() - 0.5) * 20, 14 + random() * 30, 5 + random() * 5, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
    // patched repairs: darker, sharper-edged rectangles
    for (let i = 0; i < 9; i++) {
      const px = random() * w, py = 40 + random() * (h - 120), pw = 50 + random() * 110, ph = 24 + random() * 50;
      g.fillStyle = random() < 0.6 ? "rgba(28,28,30,0.7)" : "rgba(70,70,72,0.7)";
      g.fillRect(px, py, pw, ph);
      g.strokeStyle = "rgba(15,15,15,0.7)";
      g.lineWidth = 2;
      g.strokeRect(px, py, pw, ph);
    }
    // cracks
    g.lineCap = "round";
    for (let i = 0; i < 34; i++) {
      let x = random() * w, y = random() * h, ang = random() * Math.PI * 2;
      g.strokeStyle = "rgba(12,12,12,0.75)";
      g.lineWidth = 1 + random() * 1.4;
      g.beginPath();
      g.moveTo(x, y);
      for (let k = 0; k < 7; k++) {
        ang += (random() - 0.5) * 1.3;
        x += Math.cos(ang) * (8 + random() * 22);
        y += Math.sin(ang) * (8 + random() * 22);
        g.lineTo(x, y);
      }
      g.stroke();
    }
    // potholes: a dark pit with a pale broken rim
    for (let i = 0; i < 6; i++) {
      const x = random() * w, y = 60 + random() * (h - 120), rx = 12 + random() * 16, ry = rx * (0.6 + random() * 0.3);
      g.fillStyle = "rgba(190,180,160,0.4)";
      g.beginPath(); g.ellipse(x, y, rx + 5, ry + 4, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(14,13,12,0.92)";
      g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    }
    // lane lines: worn and broken, never fresh
    const worn = (x: number, y: number, lw: number, lh: number) => {
      g.fillStyle = "#d9d5c4";
      g.fillRect(x, y, lw, lh);
      for (let k = 0; k < lw * lh * 0.04; k++) {
        g.fillStyle = `rgba(74,75,77,${0.4 + random() * 0.5})`;
        g.fillRect(x + random() * lw, y + random() * lh, 2 + random() * 3, 2 + random() * 3);
      }
    };
    worn(0, 16, w, 8);
    worn(0, h - 24, w, 8);
    for (let d = 1; d < lanes; d++) for (let x = 0; x < w; x += 256) worn(x + 20, (h * d) / lanes - 4, 150, 8);
    // dust drifted to both road edges, thicker toward the kerb
    for (const [y0, y1] of [[0, 1], [h, -1]] as const) {
      const grad = g.createLinearGradient(0, y0, 0, y0 + y1 * 60);
      grad.addColorStop(0, "rgba(176,152,112,0.7)");
      grad.addColorStop(1, "rgba(176,152,112,0)");
      g.fillStyle = grad;
      g.fillRect(0, Math.min(y0, y0 + y1 * 60), w, 60);
    }
  };

/** Two-lane street, 24 m x 12 m. */
export const roadTexture = () => canvasTexture("road", 1024, 512, paintRoad(2));

/** One carriageway of a wide road: three lanes, 24 m x 10.5 m. */
export const carriagewayTexture = () => canvasTexture("carriageway", 1024, 448, paintRoad(3));

/** The big beam over the SUPARCO gate. */
export const suparcoSignTexture = () =>
  canvasTexture("suparco-sign", 1536, 256, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#2f8798");
    grad.addColorStop(1, "#1d6275");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#e9f6f9";
    g.fillRect(0, 0, w, 10);
    g.fillRect(0, h - 10, w, 10);
    // round logo with an orbit ring
    g.strokeStyle = "#ffffff";
    g.lineWidth = 8;
    g.beginPath(); g.arc(160, h / 2, 70, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.ellipse(160, h / 2, 96, 30, -0.5, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#ffffff";
    g.beginPath(); g.arc(160, h / 2, 26, 0, Math.PI * 2); g.fill();
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "bold 150px Segoe UI, Arial, sans-serif";
    g.fillText("SUPARCO", w / 2 + 60, h / 2 - 14);
    g.font = "bold 34px Segoe UI, Arial, sans-serif";
    g.fillStyle = "#d6eef3";
    g.fillText("SPACE AND UPPER ATMOSPHERE RESEARCH COMMISSION", w / 2 + 60, h - 40);
  });

/** A house or shop front with windows, balcony rails and a door, sized in metres so windows keep their shape. */
export const houseFrontTexture = (key: string, wall: string, widthM: number, heightM: number, floors: number, shop?: string) => {
  const cols = Math.max(2, Math.round(widthM / 3));
  const pxW = Math.round(widthM * 48), pxH = Math.round(heightM * 48);
  return canvasTexture(`house-${key}-${widthM}x${heightM}-${floors}${shop ?? ""}`, pxW, pxH, (g, w, h) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, w, h);
    const random = seededRandom(key.length * 13 + floors);
    for (let i = 0; i < 700; i++) {
      g.fillStyle = `rgba(0,0,0,${random() * 0.05})`;
      g.fillRect(random() * w, random() * h, 3 + random() * 8, 3 + random() * 8);
    }
    const dirt = g.createLinearGradient(0, h * 0.5, 0, h);
    dirt.addColorStop(0, "rgba(60,50,40,0)");
    dirt.addColorStop(1, "rgba(60,50,40,0.25)");
    g.fillStyle = dirt;
    g.fillRect(0, 0, w, h);
    const floorH = h / floors;
    for (let f = 0; f < floors; f++) {
      const y0 = h - (f + 1) * floorH;
      g.fillStyle = "rgba(255,255,255,0.35)";
      g.fillRect(0, y0, w, 6);
      for (let c = 0; c < cols; c++) {
        const cw = w / cols;
        const x = c * cw + cw * 0.22, y = y0 + floorH * 0.2, ww = cw * 0.56, hh = floorH * 0.52;
        if (f === 0 && c === Math.floor(cols / 2)) {
          if (shop) {
            g.fillStyle = "#26323f"; // shop front shutter and sign
            g.fillRect(x - 8, y0 + floorH * 0.28, ww + 16, floorH * 0.72);
            g.fillStyle = "#e8e2d2";
            g.fillRect(x - 8, y0 + floorH * 0.06, ww + 16, floorH * 0.2);
            g.fillStyle = "#1c3d6e";
            g.font = `bold ${Math.round(floorH * 0.14)}px Segoe UI, Arial, sans-serif`;
            g.textAlign = "center";
            g.fillText(shop, x + ww / 2, y0 + floorH * 0.19);
          } else {
            g.fillStyle = "#5a3d28";
            g.fillRect(x, y0 + floorH * 0.28, ww, floorH * 0.72);
          }
          continue;
        }
        g.fillStyle = "#2c2f35";
        g.fillRect(x - 4, y - 4, ww + 8, hh + 8);
        const glass = g.createLinearGradient(x, y, x + ww, y + hh);
        glass.addColorStop(0, "#9bbdd8");
        glass.addColorStop(1, "#2c4358");
        g.fillStyle = glass;
        g.fillRect(x, y, ww, hh);
        g.fillStyle = "#d9d4c6";
        g.fillRect(x - 6, y + hh + 4, ww + 12, 6);
        if (f > 0) {
          g.strokeStyle = "#3b3f47";
          g.lineWidth = 3;
          for (let b = 0; b <= 6; b++) {
            g.beginPath(); g.moveTo(x - 6 + (b * (ww + 12)) / 6, y + hh + 10); g.lineTo(x - 6 + (b * (ww + 12)) / 6, y + hh + 40); g.stroke();
          }
        }
      }
    }
  });
};

/** A car number plate. */
export const plateTexture = (text: string) =>
  canvasTexture(`plate-${text}`, 128, 48, (g, w, h) => {
    g.fillStyle = "#f4f1e0";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#222";
    g.lineWidth = 3;
    g.strokeRect(2, 2, w - 4, h - 4);
    g.fillStyle = "#111";
    g.font = "bold 26px Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, w / 2, h / 2 + 2);
  });

export const grassTexture = (repeat: [number, number]) => {
  const tex = canvasTexture("town-grass", 256, 256, (g, w, h) => {
    g.fillStyle = "#6f9a45";
    g.fillRect(0, 0, w, h);
    const random = seededRandom(5);
    for (let i = 0; i < 6000; i++) {
      const v = random();
      g.fillStyle = v < 0.5 ? `rgba(40,80,20,${0.1 + random() * 0.2})` : `rgba(150,180,80,${0.1 + random() * 0.2})`;
      g.fillRect(random() * w, random() * h, 1 + random() * 2, 3 + random() * 5);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  return tex;
};
