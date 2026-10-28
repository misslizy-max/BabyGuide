let sharedContext: AudioContext | null = null;

async function context() {
  if (!sharedContext || sharedContext.state === "closed") sharedContext = new AudioContext();
  if (sharedContext.state === "suspended") await sharedContext.resume();
  return sharedContext;
}

function envelope(gain: GainNode, start: number, duration: number, peak = 0.16) {
  gain.gain.cancelScheduledValues(start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.018, peak * 0.18), start + Math.min(0.32, duration * 0.3));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
}

export async function playPianoNote(frequency: number, duration = 1.25) {
  const ctx = await context();
  const now = ctx.currentTime;
  const master = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(7200, 2400 + frequency * 5), now);
  filter.Q.value = 0.45;
  filter.connect(master);
  master.connect(ctx.destination);
  envelope(master, now, duration, frequency < 400 ? 0.22 : 0.18);

  const partials = [
    [1, 1, 0],
    [2, 0.24, 0.5],
    [3, 0.11, -0.7],
    [4, 0.055, 1.2],
  ] as const;
  for (const [ratio, volume, cents] of partials) {
    const osc = ctx.createOscillator();
    const partialGain = ctx.createGain();
    osc.type = ratio === 1 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(frequency * ratio, now);
    osc.detune.setValueAtTime(cents, now);
    partialGain.gain.value = volume;
    osc.connect(partialGain);
    partialGain.connect(filter);
    osc.start(now);
    osc.stop(now + duration + 0.04);
  }

  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.025), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const hammer = ctx.createBufferSource();
  const hammerGain = ctx.createGain();
  const hammerFilter = ctx.createBiquadFilter();
  hammer.buffer = buffer;
  hammerFilter.type = "bandpass";
  hammerFilter.frequency.value = Math.min(5000, 1200 + frequency * 4);
  hammerFilter.Q.value = 1.1;
  hammerGain.gain.setValueAtTime(0.07, now);
  hammerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
  hammer.connect(hammerFilter);
  hammerFilter.connect(hammerGain);
  hammerGain.connect(ctx.destination);
  hammer.start(now);
}

export async function playPop(size = 1) {
  const ctx = await context();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const click = ctx.createBufferSource();
  const clickGain = ctx.createGain();
  osc.type = "sine";
  const high = 820 + size * 150;
  osc.frequency.setValueAtTime(high, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
  envelope(gain, now, 0.15, 0.24);
  osc.connect(gain);
  gain.connect(ctx.destination);
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.035), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  click.buffer = buffer;
  clickGain.gain.setValueAtTime(0.13, now);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
  click.connect(clickGain);
  clickGain.connect(ctx.destination);
  osc.start(now);
  click.start(now);
  osc.stop(now + 0.16);
}

export async function playReveal(open: boolean) {
  const notes = open ? [392, 523, 659] : [659, 523, 392];
  const ctx = await context();
  notes.forEach((note, i) => {
    const start = ctx.currentTime + i * 0.08;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = note;
    envelope(gain, start, 0.22, 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.24);
  });
}

export async function playSuccess() {
  await playPianoNote(523.25, 0.4);
  setTimeout(() => void playPianoNote(659.25, 0.42), 120);
  setTimeout(() => void playPianoNote(783.99, 0.65), 240);
}
