/**
 * Sound effects — Web Audio API, ported 1:1 from src/quiz.js lines 1–125.
 * All functions are no-ops when sound is 'off' or Web Audio is unavailable.
 */

let _audioCtx: AudioContext | null = null;

function _getAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!_audioCtx || _audioCtx.state === 'closed') {
      _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return _audioCtx;
  } catch {
    return null;
  }
}

function _guard(sound: string | undefined): AudioContext | null {
  if (sound === 'off') return null;
  return _getAudio();
}

/** Descending swoosh — backwards navigation. */
export function playSwooshBack(sound?: string): void {
  const ctx = _guard(sound);
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(440, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.18);
  g.gain.setValueAtTime(0.18, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.22);
}

/** Ascending swoosh — forward navigation. */
export function playSwooshForward(sound?: string): void {
  const ctx = _guard(sound);
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(330, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.15);
  g.gain.setValueAtTime(0.14, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.20);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.20);
}

/** Quick tap click — 880 Hz. */
export function playTap(sound?: string): void {
  const ctx = _guard(sound);
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.value = 880;
  g.gain.setValueAtTime(0.12, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.08);
}

/** Happy two-tone ding — correct answer (C5 → E5). */
export function playCorrect(sound?: string): void {
  const ctx = _guard(sound);
  if (!ctx) return;
  [[523, 0], [659, 0.12]].forEach(([freq, delay]) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.value = freq;
    const t = ctx.currentTime + delay;
    g.gain.setValueAtTime(0.20, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.start(t);
    o.stop(t + 0.22);
  });
}

/** Low descending buzz — wrong answer (sawtooth). */
export function playWrong(sound?: string): void {
  const ctx = _guard(sound);
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(220, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.28);
  g.gain.setValueAtTime(0.16, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.32);
}

/** Celebratory fanfare — quiz pass (C5 E5 G5 C6 arpeggio). */
export function playPassQuiz(sound?: string): void {
  const ctx = _guard(sound);
  if (!ctx) return;
  [[523, 0], [659, 0.13], [784, 0.26], [1047, 0.39]].forEach(([freq, delay]) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.value = freq;
    const t = ctx.currentTime + delay;
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    o.start(t);
    o.stop(t + 0.28);
  });
}

/** White noise burst — confetti sound (1800 Hz bandpass). */
export function playConfettiBurst(sound?: string): void {
  const ctx = _guard(sound);
  if (!ctx) return;
  try {
    const bufSize = ctx.sampleRate * 0.12;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.8;
    const g = ctx.createGain();
    src.connect(filter); filter.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    src.start(ctx.currentTime);
    src.stop(ctx.currentTime + 0.14);
  } catch {
    // ignore
  }
}
