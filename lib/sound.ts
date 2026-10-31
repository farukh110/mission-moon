// Synthesized sound effects (no audio files), so they work fully offline.
let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
const active = new Set<AudioScheduledSourceNode>();

export type SoundName =
  | "correct" | "wrong" | "equip"
  | "beep" | "liftoff" | "descent" | "touchdown"
  | "engine" | "horn" | "step" | "moonstep" | "hatch"
  | "arrive" | "chime";

function audio(): AudioContext {
  const a = (ctx ??= new AudioContext());
  if (a.state === "suspended") void a.resume();
  return a;
}

function noise(a: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    noiseBuffer = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function track(node: AudioScheduledSourceNode, stopAt: number) {
  active.add(node);
  node.onended = () => active.delete(node);
  node.stop(stopAt);
}

interface ToneOptions {
  freq: number;
  to?: number;
  type?: OscillatorType;
  at?: number;
  dur: number;
  vol: number;
  attack?: number;
}

function tone(a: AudioContext, o: ToneOptions) {
  const t = a.currentTime + (o.at ?? 0);
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t);
  if (o.to) osc.frequency.linearRampToValueAtTime(o.to, t + o.dur);
  const attack = o.attack ?? 0.01;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(o.vol, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  track(osc, t + o.dur + 0.05);
}

interface NoiseOptions {
  at?: number;
  dur: number;
  vol: number;
  /** Low-pass cutoff at the start and end (Hz). */
  from: number;
  to?: number;
  attack?: number;
  /** Fade out only at the end instead of decaying straight away. */
  sustain?: boolean;
}

function noiseBurst(a: AudioContext, o: NoiseOptions) {
  const t = a.currentTime + (o.at ?? 0);
  const src = a.createBufferSource();
  src.buffer = noise(a);
  src.loop = true;
  const filter = a.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(o.from, t);
  if (o.to) filter.frequency.linearRampToValueAtTime(o.to, t + o.dur);
  const gain = a.createGain();
  const attack = o.attack ?? 0.01;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(o.vol, t + attack);
  if (o.sustain) {
    gain.gain.setValueAtTime(o.vol, t + o.dur - 0.8);
    gain.gain.linearRampToValueAtTime(0.0001, t + o.dur);
  } else gain.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  src.connect(filter).connect(gain).connect(a.destination);
  src.start(t);
  track(src, t + o.dur + 0.05);
}

// ---- engine roar that loops while the player holds thrust ----
let thrustLoop: { gain: GainNode; nodes: AudioScheduledSourceNode[] } | null = null;

export function setThrustSound(on: boolean, volume: number) {
  try {
    if (!on && !thrustLoop) return;
    const a = audio();
    if (on && volume > 0) {
      if (!thrustLoop) {
        const gain = a.createGain();
        gain.gain.value = 0.0001;
        const src = a.createBufferSource();
        src.buffer = noise(a);
        src.loop = true;
        const filter = a.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1100;
        const osc = a.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = 72;
        const oscGain = a.createGain();
        oscGain.gain.value = 0.25;
        src.connect(filter).connect(gain);
        osc.connect(oscGain).connect(gain);
        gain.connect(a.destination);
        src.start();
        osc.start();
        thrustLoop = { gain, nodes: [src, osc] };
      }
      thrustLoop.gain.gain.cancelScheduledValues(a.currentTime);
      thrustLoop.gain.gain.linearRampToValueAtTime(volume * 0.6, a.currentTime + 0.25);
    } else if (thrustLoop) {
      const old = thrustLoop;
      thrustLoop = null;
      old.gain.gain.cancelScheduledValues(a.currentTime);
      old.gain.gain.linearRampToValueAtTime(0.0001, a.currentTime + 0.3);
      old.nodes.forEach((n) => n.stop(a.currentTime + 0.4));
    }
  } catch {
    // Audio is optional.
  }
}

// ---- taxi engine: a low hum that follows the taxi's speed (level 0 to 1) ----
let engineLoop: { gain: GainNode; osc: OscillatorNode; nodes: AudioScheduledSourceNode[] } | null = null;

export function setEngineLevel(level: number, volume: number) {
  try {
    if (level <= 0.02 || volume <= 0) {
      if (!engineLoop) return;
      const old = engineLoop;
      engineLoop = null;
      const a = audio();
      old.gain.gain.cancelScheduledValues(a.currentTime);
      old.gain.gain.linearRampToValueAtTime(0.0001, a.currentTime + 0.3);
      old.nodes.forEach((n) => n.stop(a.currentTime + 0.4));
      return;
    }
    const a = audio();
    if (!engineLoop) {
      const gain = a.createGain();
      gain.gain.value = 0.0001;
      const osc = a.createOscillator();
      osc.type = "sawtooth";
      const filter = a.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 420;
      osc.connect(filter).connect(gain);
      gain.connect(a.destination);
      osc.start();
      engineLoop = { gain, osc, nodes: [osc] };
    }
    engineLoop.osc.frequency.setTargetAtTime(48 + level * 70, a.currentTime, 0.15);
    engineLoop.gain.gain.setTargetAtTime(volume * (0.08 + level * 0.16), a.currentTime, 0.15);
  } catch {
    // Audio is optional.
  }
}

// ---- city traffic: a steady low roar with far-away horns now and then ----
let trafficLoop: { gain: GainNode; node: AudioScheduledSourceNode; timer: number } | null = null;

export function setTrafficSound(on: boolean, volume: number) {
  try {
    if (!on || volume <= 0) {
      if (!trafficLoop) return;
      const old = trafficLoop;
      trafficLoop = null;
      window.clearTimeout(old.timer);
      const a = audio();
      old.gain.gain.cancelScheduledValues(a.currentTime);
      old.gain.gain.linearRampToValueAtTime(0.0001, a.currentTime + 0.3);
      old.node.stop(a.currentTime + 0.4);
      return;
    }
    if (trafficLoop) return;
    const a = audio();
    const src = a.createBufferSource();
    src.buffer = noise(a);
    src.loop = true;
    const filter = a.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 380;
    const gain = a.createGain();
    gain.gain.value = volume * 0.12;
    src.connect(filter).connect(gain).connect(a.destination);
    src.start();
    const honk = () => {
      if (!trafficLoop) return;
      try {
        const now = a.currentTime;
        const g = a.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(volume * 0.05, now + 0.03);
        g.gain.linearRampToValueAtTime(0.0001, now + 0.28);
        g.connect(a.destination);
        for (const f of [380 + Math.random() * 120, 470 + Math.random() * 120]) {
          const o = a.createOscillator();
          o.type = "square";
          o.frequency.value = f;
          o.connect(g);
          o.start(now);
          o.stop(now + 0.3);
        }
      } catch {
        // Audio is optional.
      }
      if (trafficLoop) trafficLoop.timer = window.setTimeout(honk, 2500 + Math.random() * 6000);
    };
    trafficLoop = { gain, node: src, timer: window.setTimeout(honk, 1500) };
  } catch {
    // Audio is optional.
  }
}

/** Stops every sound that is still playing (used when an animation is skipped). */
export function stopAllSounds() {
  setTrafficSound(false, 0);
  setThrustSound(false, 0);
  setEngineLevel(0, 0);
  active.forEach((n) => {
    try {
      n.stop();
    } catch {
      // already stopped
    }
  });
  active.clear();
}

export function playSound(name: SoundName, volume: number) {
  if (volume <= 0 || typeof window === "undefined") return;
  try {
    const a = audio();
    const v = volume;
    switch (name) {
      case "correct":
        [523, 659, 784].forEach((f, i) => tone(a, { freq: f, at: i * 0.09, dur: 0.22, vol: v * 0.2 }));
        break;
      case "wrong":
        tone(a, { freq: 220, to: 160, type: "triangle", dur: 0.25, vol: v * 0.25 });
        break;
      case "equip":
        noiseBurst(a, { dur: 0.08, vol: v * 0.3, from: 2500 });
        tone(a, { freq: 320, to: 200, type: "square", dur: 0.1, vol: v * 0.1 });
        break;
      case "beep":
        tone(a, { freq: 880, dur: 0.22, vol: v * 0.3 });
        break;
      case "liftoff":
        // Roaring engine: filtered noise that opens up, plus a deep rumble.
        noiseBurst(a, { dur: 12, vol: v * 0.7, from: 250, to: 2200, attack: 1.2, sustain: true });
        tone(a, { freq: 55, to: 95, type: "sawtooth", dur: 12, vol: v * 0.2, attack: 1 });
        break;
      case "descent":
        noiseBurst(a, { dur: 10, vol: v * 0.45, from: 1200, to: 350, attack: 0.5, sustain: true });
        tone(a, { freq: 110, to: 60, type: "sawtooth", dur: 10, vol: v * 0.15, attack: 0.5 });
        break;
      case "touchdown":
        tone(a, { freq: 90, to: 38, dur: 0.5, vol: v * 0.5 });
        noiseBurst(a, { dur: 0.6, vol: v * 0.4, from: 900, to: 150 });
        break;
      case "engine":
        tone(a, { freq: 65, to: 105, type: "sawtooth", dur: 10, vol: v * 0.1, attack: 0.4 });
        tone(a, { freq: 70, to: 52, type: "sawtooth", at: 5, dur: 5, vol: v * 0.08 });
        break;
      case "horn":
        tone(a, { freq: 420, type: "square", dur: 0.22, vol: v * 0.12 });
        tone(a, { freq: 530, type: "square", dur: 0.22, vol: v * 0.12 });
        tone(a, { freq: 420, type: "square", at: 0.3, dur: 0.3, vol: v * 0.12 });
        tone(a, { freq: 530, type: "square", at: 0.3, dur: 0.3, vol: v * 0.12 });
        break;
      case "step":
        noiseBurst(a, { dur: 0.09, vol: v * 0.25, from: 500 });
        tone(a, { freq: 90, to: 60, dur: 0.1, vol: v * 0.2 });
        break;
      case "moonstep":
        noiseBurst(a, { dur: 0.14, vol: v * 0.18, from: 260 });
        break;
      case "hatch":
        tone(a, { freq: 160, to: 90, type: "square", dur: 0.2, vol: v * 0.15 });
        noiseBurst(a, { at: 0.05, dur: 0.25, vol: v * 0.25, from: 1200, to: 300 });
        break;
      case "arrive":
        [660, 880, 1320].forEach((f, i) => tone(a, { freq: f, at: i * 0.14, dur: 0.6, vol: v * 0.18 }));
        break;
      case "chime":
        tone(a, { freq: 988, dur: 0.5, vol: v * 0.15 });
        break;
    }
  } catch {
    // Audio is optional.
  }
}
