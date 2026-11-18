// The real phases of a load, in the order the preloader lists them.
export const phases = ["fonts", "code", "context", "shaders", "frame"] as const;

export type Phase = (typeof phases)[number];

const done = new Set<Phase>();
const listeners = new Set<() => void>();
let sceneSkipped = false;

function emit() {
  listeners.forEach((listener) => listener());
}

export const loadClock = {
  mark(phase: Phase) {
    if (done.has(phase)) return;
    done.add(phase);
    emit();
  },
  /** No WebGL: only the fonts are left to wait for. */
  skipScene() {
    if (sceneSkipped) return;
    sceneSkipped = true;
    emit();
  },
  has(phase: Phase) {
    return done.has(phase);
  },
  get settled() {
    return phases.every((phase) => done.has(phase) || (sceneSkipped && phase !== "fonts"));
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
