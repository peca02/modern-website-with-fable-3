import { store } from "@/lib/store";

// Paper is filtered noise: a room tone per chapter, a rustle that follows scroll speed and folding, and a
// short band-passed burst for a crease. Nothing exists until the first click on the sound toggle.

type Layer = { filter: BiquadFilterNode; gain: GainNode };
type Engine = { context: AudioContext; noise: AudioBuffer; master: GainNode; room: Layer; rustle: Layer };

/** Low-pass corner of the room tone in each chapter, Hz. */
const roomTones = [190, 260, 340, 220, 420] as const;

/** Fold driver change per second above which a fold counts as a step. */
const stepRate = 0.9;

let engine: Engine | null = null;
let on = false;
let lastCrease = 0;
let lastBurst = 0;
let folding = false;

function build(): Engine {
  const context = new AudioContext();
  const noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const samples = noise.getChannelData(0);
  for (let index = 0; index < samples.length; index += 1) samples[index] = Math.random() * 2 - 1;

  const master = context.createGain();
  master.gain.value = 0.7;
  master.connect(context.destination);

  const layer = (type: BiquadFilterType, frequency: number, q: number): Layer => {
    const source = context.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const gain = context.createGain();
    gain.gain.value = 0;
    source.connect(filter).connect(gain).connect(master);
    source.start();
    return { filter, gain };
  };

  return { context, noise, master, room: layer("lowpass", roomTones[0], 0.7), rustle: layer("bandpass", 3200, 0.8) };
}

async function settle() {
  if (!engine) return;
  if (on && !document.hidden) await engine.context.resume();
  else await engine.context.suspend();
}

export const audio = {
  get on() {
    return on;
  },

  /** Must be called from a click: browsers only start an audio context on a user gesture. */
  async toggle() {
    on = !on;
    if (on) engine ??= build();
    await settle();
    return on;
  },

  /** Call when the tab is hidden or shown again. */
  visibility() {
    void settle();
  },

  /** One crease: a short burst of band-passed noise. */
  crease(strength = 1) {
    if (!on || !engine) return;
    const { context, noise, master } = engine;
    const now = context.currentTime;
    if (now - lastBurst < 0.09) return;
    lastBurst = now;
    const source = context.createBufferSource();
    source.buffer = noise;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800 + Math.random() * 2400;
    filter.Q.value = 2.5;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3 * strength, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    source.connect(filter).connect(gain).connect(master);
    source.start(now, Math.random() * 1.5, 0.1);
  },

  /** Once per frame while sound is on: the ambient layers follow the chapter, the scroll and the folding. */
  frame(seconds: number) {
    if (!on || !engine) return;
    const { context, room, rustle } = engine;
    const now = context.currentTime;
    const chapter = Math.min(roomTones.length - 1, Math.max(0, Math.floor(store.story)));
    room.filter.frequency.setTargetAtTime(roomTones[chapter] ?? roomTones[0], now, 0.4);
    room.gain.gain.setTargetAtTime(0.05, now, 0.4);

    const rate = Math.abs(store.sheet.crease - lastCrease) / Math.max(0.001, seconds);
    lastCrease = store.sheet.crease;
    const level = Math.min(0.14, Math.abs(store.velocity) * 0.05 + Math.min(1, rate) * 0.08);
    rustle.gain.gain.setTargetAtTime(level, now, 0.08);
    rustle.filter.frequency.setTargetAtTime(2600 + Math.min(1, rate) * 2200, now, 0.1);

    // A fold step is the moment the fold starts moving fast, not every frame of it.
    const fast = rate > stepRate;
    if (fast && !folding) audio.crease(0.8);
    folding = fast;
  },
};
