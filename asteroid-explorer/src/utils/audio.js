// Procedural Audio Synthesizer utilizing Web Audio API
// Generates deep friction rumble matching the dive, and a massive sub-bass explosion flash.

export const playImpactSequence = () => {
  // Guard for server-side rendering or unsupported browsers
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const t = ctx.currentTime;

  // Master Gain to limit clipping distortion
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = 0.5;

  // =======================================================
  // PHASE 1: Atmospheric Super-Heated Re-entry Rumble
  // =======================================================
  const rumbleDuration = 2.0; // Seconds to match framer-motion sequence
  const rumbleBufferSize = ctx.sampleRate * rumbleDuration;
  const rumbleBuffer = ctx.createBuffer(1, rumbleBufferSize, ctx.sampleRate);
  const data = rumbleBuffer.getChannelData(0);
  
  // Generate basic Brown Noise (heavy on low frequencies)
  let lastOut = 0;
  for (let i = 0; i < rumbleBufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5; 
  }

  const rumbleSource = ctx.createBufferSource();
  rumbleSource.buffer = rumbleBuffer;

  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = 'lowpass';
  
  // Sweep frequency to simulate rushing through thickening atmosphere
  rumbleFilter.frequency.setValueAtTime(150, t);
  rumbleFilter.frequency.exponentialRampToValueAtTime(800, t + rumbleDuration);

  // Ramp up volume aggressively into the final microsecond
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.setValueAtTime(0.01, t);
  rumbleGain.gain.exponentialRampToValueAtTime(1.5, t + rumbleDuration);
  rumbleGain.gain.setTargetAtTime(0, t + rumbleDuration + 0.1, 0.05); // Cut off hard at impact

  rumbleSource.connect(rumbleFilter);
  rumbleFilter.connect(rumbleGain);
  rumbleGain.connect(masterGain);
  
  rumbleSource.start(t);

  // =======================================================
  // PHASE 2: Megaton Thermo-Kinetic Detonation BOOM
  // =======================================================
  const boomTime = t + rumbleDuration;
  const boomDuration = 4.0;
  const boomBufferSize = ctx.sampleRate * boomDuration; 
  const boomBuffer = ctx.createBuffer(1, boomBufferSize, ctx.sampleRate);
  const boomData = boomBuffer.getChannelData(0);
  
  // Pure blinding white noise for the initial acoustic shockwave
  for (let i = 0; i < boomBufferSize; i++) {
    boomData[i] = Math.random() * 2 - 1;
  }

  const boomSource = ctx.createBufferSource();
  boomSource.buffer = boomBuffer;

  const boomFilter = ctx.createBiquadFilter();
  boomFilter.type = 'lowpass';
  // Snap massively high then immediately decay into deep subterranean bass
  boomFilter.frequency.setValueAtTime(4000, boomTime);
  boomFilter.frequency.exponentialRampToValueAtTime(40, boomTime + 0.5);

  const boomSecondaryFilter = ctx.createBiquadFilter();
  boomSecondaryFilter.type = 'highpass';
  boomSecondaryFilter.frequency.value = 25; // Protect actual subwoofer coils from DC tearing

  const boomGain = ctx.createGain();
  boomGain.gain.setValueAtTime(0, boomTime - 0.01);
  boomGain.gain.setValueAtTime(2.0, boomTime); // Instant harsh peak
  boomGain.gain.exponentialRampToValueAtTime(0.01, boomTime + 3.0); // 3 second echo ring-out

  boomSource.connect(boomFilter);
  boomFilter.connect(boomSecondaryFilter);
  boomSecondaryFilter.connect(boomGain);
  boomGain.connect(masterGain);
  
  boomSource.start(boomTime);
};
