let sharedContext: AudioContext | null = null;

async function context() {
  if (!sharedContext || sharedContext.state === "closed") {
    sharedContext = new AudioContext();
  }
  if (sharedContext.state === "suspended") await sharedContext.resume();
  return sharedContext;
}

function gainEnvelope(
  gain: GainNode,
  start: number,
  duration: number,
  peak = 0.16,
) {
  gain.gain.cancelScheduledValues(start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
}

export async function playPianoNote(frequency: number, duration = 0.7) {
  const ctx = await context();
  const now = ctx.currentTime;
  const output = ctx.createGain();
  output.connect(ctx.destination);
  gainEnvelope(output, now, duration, 0.15);

  const partials = [
    [1, 1],
    [2, 0.22],
    [3, 0.08],
  ] as const;
  partials.forEach(([ratio, volume]) => {
    const osc = ctx.createOscillator();
    const partialGain = ctx.createGain();
    osc.type = ratio === 1 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(frequency * ratio, now);
    partialGain.gain.value = volume;
    osc.connect(partialGain);
    partialGain.connect(output);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  });
}

export async function playPop(size = 1) {
  const ctx = await context();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  const high = 720 + size * 120;
  osc.frequency.setValueAtTime(high, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.11);
  gainEnvelope(gain, now, 0.13, 0.22);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

export async function playReveal(open: boolean) {
  const notes = open ? [392, 523, 659] : [659, 523, 392];
  for (let i = 0; i < notes.length; i += 1) {
    const ctx = await context();
    const start = ctx.currentTime + i * 0.07;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = notes[i];
    gainEnvelope(gain, start, 0.18, 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.2);
  }
}

export async function playSuccess() {
  await playPianoNote(523, 0.24);
  setTimeout(() => void playPianoNote(659, 0.24), 100);
  setTimeout(() => void playPianoNote(784, 0.4), 200);
}