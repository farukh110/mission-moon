// Graphics quality for weak computers (no graphics card, old laptops).
let low = false;

/** True when the game should use light graphics. Read by anything that builds textures or geometry. */
export const isLowQuality = () => low;
export const setLowQuality = (value: boolean) => {
  low = value;
};

/** Guesses whether this computer is weak: software rendering, little memory or few CPU cores. */
export function detectWeakComputer(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return true;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (/swiftshader|llvmpipe|software|basic render|microsoft basic/i.test(renderer)) return true;
  } catch {
    return true;
  }
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 2 || memory <= 2;
}
