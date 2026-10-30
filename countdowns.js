// The last seconds of each question, in order. Loaded after script.js.
// A countdown gets a gain bus, the seconds until the sound must end, and the audio clock's start time.

COUNTDOWNS.push(
  {
    name: 'strings',
    sound: (output, seconds, now) => {
      const { context, hiss } = audio;
      const end = now + seconds;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.008, now);
      gain.gain.exponentialRampToValueAtTime(0.09, end);
      gain.connect(output);
      const noise = hissSource(context, hiss);
      const filter = context.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(5000, end);
      noise.connect(filter).connect(gain);
      noise.start(now);
      noise.stop(end);
      for (const ratio of [1, 1.06, 1.5, 1.59]) {
        tone(gain, { type: 'sawtooth', path: [[0, 110 * ratio], [seconds, 620 * ratio]], length: seconds, volume: 1, at: now });
      }
    },
  },
  {
    name: 'heartbeat',
    sound: (output, seconds, now) => {
      for (let at = 0; at < seconds; at += 1) {
        tone(output, { path: [[0, 52], [0.2, 50]], length: 0.22, volume: 0.5, at: now + at });
        tone(output, { path: [[0, 52], [0.2, 50]], length: 0.22, volume: 0.34, at: now + at + 0.2 });
      }
    },
  },
);

// Countdowns, group a: drip, tick, musicbox, footsteps, trolley, pager, knocking, lullaby, tube, whisper, swing, phone.
// Everything is scheduled up front on the audio clock. The `times`-style lists are also what the keyframes in
// countdowns-a.css were generated from, so a pulse lands on its sound.
{
  const REF = 9.35;
  const rnd = randomRange;
  const lerp = (a, b, x) => a + (b - a) * x;

  const trim = (output, level) => {
    const gain = audio.context.createGain();
    gain.gain.value = level;
    gain.connect(output);
    return gain;
  };

  const panned = (output, pan) => {
    if (pan === undefined) return output;
    const panner = audio.context.createStereoPanner();
    panner.pan.value = pan;
    panner.connect(output);
    return panner;
  };

  /** A lowpassed (and optionally panned) bus, so one filter colours a whole event. */
  const shaped = (output, cutoff, pan) => {
    const filter = audio.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    filter.connect(panned(output, pan));
    return filter;
  };

  /** One oscillator note: soft attack, optional hold, exponential decay. Clamped to end before `end`. */
  const note = (output, end, { type = 'sine', freq, to, at, length, volume, attack = 0.008, hold = 0, pan, filter, wobble, detune = 0 }) => {
    const { context } = audio;
    const span = Math.min(length, end - at - 0.01);
    if (span < attack + 0.02) return;
    const holdFor = Math.max(0, Math.min(hold, span - attack - 0.01));
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, at);
    if (to) oscillator.frequency.exponentialRampToValueAtTime(to, at + span);
    oscillator.detune.value = detune;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(volume, at + attack);
    if (holdFor) gain.gain.setValueAtTime(volume, at + attack + holdFor);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + span);
    let tail = oscillator.connect(gain);
    if (filter) {
      const biquad = context.createBiquadFilter();
      biquad.type = filter[0];
      biquad.frequency.value = filter[1];
      if (filter[2]) biquad.Q.value = filter[2];
      tail = tail.connect(biquad);
    }
    tail.connect(panned(output, pan));
    oscillator.start(at);
    oscillator.stop(at + span);
    if (wobble) {
      const shaker = context.createOscillator();
      const depth = context.createGain();
      shaker.frequency.value = wobble[0];
      depth.gain.value = wobble[1];
      shaker.connect(depth).connect(oscillator.detune);
      shaker.start(at);
      shaker.stop(at + span);
    }
  };

  /** A short filtered puff of noise: clicks, scuffs, breaths. */
  const puff = (output, end, { at, freq, q = 1, type = 'bandpass', length, volume, pan }) => {
    const { context } = audio;
    const span = Math.min(length, end - at - 0.01);
    if (span < 0.012) return;
    const noise = hissSource(context, audio.hiss);
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + span);
    noise.connect(filter).connect(gain).connect(panned(output, pan));
    noise.start(at, rnd(0, 1.5));
    noise.stop(at + span);
  };

  /** Times from a start, a first gap and a factor, until `last`. */
  const series = (start, gap, factor, last, minGap = 0) => {
    const out = [];
    for (let at = start, g = gap; at < last; at += g, g = Math.max(minGap, g * factor)) out.push(+at.toFixed(3));
    return out;
  };

  // ---- drip ----
  const dripTimes = series(0.45, 1.3, 0.87, REF - 0.7, 0.42);

  // ---- tick ----
  const tickTimes = series(0.3, 0.92, 0.955, REF - 0.45);

  // ---- footsteps ----
  const stepTimes = series(0.5, 0.9, 1, REF - 0.35);

  // ---- pager: groups of three beeps ----
  const pagerGroups = series(0.35, 1.85, 0.93, REF - 0.6, 0.9);
  const pagerTimes = pagerGroups.flatMap((at) => [at, at + 0.17, at + 0.34]);

  // ---- knocking: three knocks, a pause, each set closer ----
  const knockSets = [0.4, 3.1, 5.4, 7.3];
  const knockTimes = knockSets.flatMap((at, set) => [0, 0.55, 1.1].map((offset) => ({ at: +(at + offset).toFixed(3), set })));

  // ---- tube: [start, length] of each dropout, never closer than 0.4 s ----
  const tubeDips = [[0.9, 0.11], [2.4, 0.09], [2.85, 0.12], [4.2, 0.1], [4.65, 0.1], [5.1, 0.14], [6, 0.1], [6.45, 0.1], [6.9, 0.1], [7.4, 0.12], [7.9, 0.1], [8.4, 0.1], [8.85, 0.12]];

  // ---- swing: each creak is a half swing, and they get longer ----
  const swingSpans = (() => {
    const out = [];
    let at = 0.3;
    for (let h = 0.7; at + h < REF; h *= 1.13) {
      out.push([+at.toFixed(3), +h.toFixed(3)]);
      at += h;
    }
    return out;
  })();

  // ---- phone ----
  const phoneRings = [0.3, 2.8, 5.3, 7.7];
  const RING = 1.15;

  COUNTDOWNS.push(
    {
      name: 'drip',
      times: dripTimes,
      sound: (output, seconds, now) => {
        const end = now + seconds;
        const out = trim(output, 0.55);
        dripTimes.forEach((time, i) => {
          const grow = lerp(0.55, 1, i / (dripTimes.length - 1));
          const freq = rnd(560, 760) * (i % 5 === 3 ? 1.35 : 1);
          [[0, 1, 2600], [0.3, 0.42, 1500], [0.62, 0.2, 1000], [0.95, 0.09, 800]].forEach(([delay, level, cutoff], k) => {
            const at = now + time + delay;
            note(out, end, { freq, to: freq * 1.8, at, length: 0.22, volume: 0.9 * grow * level, filter: ['lowpass', cutoff], pan: k === 0 ? 0 : (k % 2 ? 0.45 : -0.45) });
            note(out, end, { freq: freq * 0.3, to: freq * 0.18, at, length: 0.14, volume: 0.35 * grow * level, attack: 0.004 });
          });
          puff(out, end, { at: now + time, freq: 2300, q: 2, length: 0.025, volume: 0.1 * grow });
        });
      },
    },
    {
      name: 'tick',
      times: tickTimes,
      sound: (output, seconds, now) => {
        const end = now + seconds;
        const out = trim(output, 0.31);
        tickTimes.forEach((time, i) => {
          const at = now + time;
          const tock = i % 2 === 1;
          const grow = lerp(0.6, 1, i / (tickTimes.length - 1));
          const body = shaped(out, 2600);
          note(body, end, { freq: tock ? 190 : 270, to: tock ? 112 : 160, at, length: 0.24, volume: 1.0 * grow, attack: 0.002 });
          note(body, end, { freq: tock ? 95 : 120, to: 70, at, length: 0.32, volume: 0.9 * grow, attack: 0.003 });
          note(body, end, { freq: tock ? 520 : 660, at, length: 0.38, volume: 0.07 * grow, attack: 0.002 });
          puff(body, end, { at, freq: tock ? 1100 : 1600, q: 1.4, length: 0.035, volume: 0.55 * grow });
          puff(body, end, { at: at - 0.035, freq: 2200, q: 2, length: 0.012, volume: 0.15 * grow });
        });
      },
    },
    {
      name: 'musicbox',
      sound: (output, seconds, now) => {
        const end = now + seconds;
        const out = trim(output, 0.33);
        const tune = [0, 3, 7, 5, 3, 2, 0, 2, 3, 5, 7, 10, 8, 7, 5, 3, 2, 3, 0, 0];
        let time = 0.3;
        for (let i = 0; time < seconds - 0.3; i += 1) {
          const progress = time / REF;
          const cents = -150 * progress ** 2 + rnd(-1, 1) * 60 * progress ** 1.4;
          const freq = 880 * 2 ** (tune[i % tune.length] / 12);
          const at = now + time;
          const volume = lerp(0.8, 0.55, progress);
          note(out, end, { freq, at, length: 1.5, volume, attack: 0.003, detune: cents });
          note(out, end, { freq: freq * 4, at, length: 0.45, volume: volume * 0.16, attack: 0.002, detune: cents });
          note(out, end, { freq: freq * 5.4, at, length: 0.1, volume: volume * 0.09, attack: 0.002, detune: cents });
          puff(out, end, { at, freq: 3500, q: 2, length: 0.015, volume: 0.04 });
          time += 0.27 + 0.62 * progress ** 1.6;
        }
      },
    },
    {
      name: 'footsteps',
      times: stepTimes,
      sound: (output, seconds, now) => {
        const end = now + seconds;
        const out = trim(output, 0.74);
        stepTimes.forEach((time, i) => {
          const near = i / (stepTimes.length - 1);
          const volume = 0.05 * (1 / 0.05) ** near;
          const cutoff = 260 + 2600 * near ** 1.5;
          const pan = (i % 2 ? 1 : -1) * lerp(0.1, 0.25, near);
          [[0, 1], [0.21, 0.25]].forEach(([delay, level]) => {
            const at = now + time + delay;
            const bus = shaped(out, cutoff * (level < 1 ? 0.6 : 1), pan);
            note(bus, end, { freq: 105, to: 50, at, length: 0.24, volume: volume * level, attack: 0.004 });
            puff(bus, end, { at, freq: 900 + 900 * near, q: 1.2, length: 0.05, volume: 0.6 * volume * level });
            puff(bus, end, { at: at + 0.07, freq: 500, q: 0.7, length: 0.14, volume: 0.35 * volume * level });
          });
        });
      },
    },
    {
      name: 'trolley',
      sound: (output, seconds, now) => {
        const { context, hiss } = audio;
        const end = now + seconds;
        const pan = context.createStereoPanner();
        pan.pan.setValueAtTime(-1, now);
        pan.pan.linearRampToValueAtTime(1, end - 0.1);
        const env = context.createGain();
        env.gain.setValueAtTime(0.06, now);
        env.gain.exponentialRampToValueAtTime(1, now + seconds * 0.62);
        env.gain.exponentialRampToValueAtTime(0.3, end - 0.05);
        env.connect(pan).connect(trim(output, 1));

        // Rubber wheels on tile: a low lumpy rumble and a light rattle.
        const rumble = hissSource(context, hiss);
        const low = context.createBiquadFilter();
        low.type = 'bandpass';
        low.frequency.value = 190;
        low.Q.value = 0.9;
        const lumpy = context.createGain();
        lumpy.gain.value = 0.6;
        const wheel = context.createOscillator();
        wheel.frequency.value = 4.6;
        const wheelDepth = context.createGain();
        wheelDepth.gain.value = 0.45;
        wheel.connect(wheelDepth).connect(lumpy.gain);
        const rumbleLevel = context.createGain();
        rumbleLevel.gain.value = 2.2;
        rumble.connect(low).connect(lumpy).connect(rumbleLevel).connect(env);
        rumble.start(now);
        rumble.stop(end);
        wheel.start(now);
        wheel.stop(end);

        const tiles = hissSource(context, hiss);
        const high = context.createBiquadFilter();
        high.type = 'bandpass';
        high.frequency.value = 900;
        high.Q.value = 0.8;
        const tilesLevel = context.createGain();
        tilesLevel.gain.value = 0.35;
        tiles.connect(high).connect(tilesLevel).connect(env);
        tiles.start(now, 0.7);
        tiles.stop(end);

        // The squeaky wheel, now and then in pairs, and a few tin clinks.
        for (let time = 0.5, i = 0; time < seconds - 0.4; i += 1, time += rnd(0.5, 0.75)) {
          const freq = rnd(950, 1200);
          note(env, end, { freq, to: freq * 1.17, at: now + time, length: 0.2, volume: 0.17, attack: 0.03, filter: ['lowpass', 2300], wobble: [9, 25] });
          if (i % 3 === 1) {
            note(env, end, { freq: freq * 1.12, to: freq * 1.25, at: now + time + 0.13, length: 0.18, volume: 0.1, attack: 0.03, filter: ['lowpass', 2300], wobble: [8, 30] });
          }
        }
        [1.3, 2.7, 3.2, 5.1, 6.6, 7.4].forEach((time) => {
          note(env, end, { freq: rnd(1700, 2300), at: now + time, length: 0.1, volume: 0.05, attack: 0.002 });
        });
      },
    },
    {
      name: 'pager',
      times: pagerTimes,
      sound: (output, seconds, now) => {
        const end = now + seconds;
        const out = trim(output, 0.225);
        pagerGroups.forEach((group, g) => {
          const freq = 988 * 1.02 ** g;
          const volume = lerp(0.5, 1, g / (pagerGroups.length - 1));
          [0, 0.17, 0.34].forEach((offset) => {
            const at = now + group + offset;
            note(out, end, { freq, at, length: 0.1, volume, attack: 0.008, hold: 0.07, filter: ['lowpass', 2600] });
            note(out, end, { freq: freq * 3, at, length: 0.09, volume: volume * 0.06, attack: 0.008, hold: 0.06 });
          });
        });
      },
    },
    {
      name: 'knocking',
      times: knockTimes,
      sound: (output, seconds, now) => {
        const end = now + seconds;
        const out = trim(output, 0.48);
        const levels = [0.35, 0.55, 0.8, 1];
        const cutoffs = [450, 800, 1300, 2200];
        knockTimes.forEach(({ at: time, set }) => {
          const at = now + time;
          const bus = shaped(out, cutoffs[set]);
          const level = levels[set];
          note(bus, end, { freq: 150, to: 82, at, length: 0.35, volume: 0.7 * level, attack: 0.002 });
          note(bus, end, { freq: 265, to: 170, at, length: 0.12, volume: 0.3 * level, attack: 0.002 });
          note(bus, end, { freq: 98, to: 62, at, length: 0.5, volume: 0.3 * level, attack: 0.004 });
          puff(bus, end, { at, freq: 700, q: 1.2, length: 0.07, volume: 0.35 * level });
        });
      },
    },
    {
      name: 'lullaby',
      sound: (output, seconds, now) => {
        const { context } = audio;
        const end = now + seconds;
        const scale = 0.84;
        const names = { D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3 };
        const melody = [['E4', 0.5], ['E4', 0.5], ['G4', 2], ['E4', 0.5], ['E4', 0.5], ['G4', 2], ['E4', 0.5], ['G4', 0.5], ['C5', 1.5], ['B4', 0.5], ['A4', 0.5], ['A4', 0.5], ['G4', 2],
          ['D4', 0.5], ['E4', 0.5], ['F4', 2], ['D4', 0.5], ['E4', 0.5], ['F4', 2], ['D4', 0.5], ['F4', 0.5], ['B4', 1.5], ['A4', 0.5], ['G4', 0.5], ['A4', 0.5], ['C5', 3]];
        const beat = 0.52;

        // A far-off hum: a buzzy source through two soft vowel-ish resonances, then a long way down a hall.
        const voice = context.createOscillator();
        voice.type = 'sawtooth';
        const vibrato = context.createOscillator();
        vibrato.frequency.value = 5.2;
        const vibratoDepth = context.createGain();
        vibratoDepth.gain.value = 16;
        vibrato.connect(vibratoDepth).connect(voice.detune);
        const first = context.createBiquadFilter();
        first.type = 'bandpass';
        first.frequency.value = 330;
        first.Q.value = 4;
        const second = context.createBiquadFilter();
        second.type = 'bandpass';
        second.frequency.value = 1100;
        second.Q.value = 5;
        const secondLevel = context.createGain();
        secondLevel.gain.value = 0.3;
        const hum = context.createGain();
        hum.gain.value = 0.0001;
        voice.connect(first).connect(hum);
        voice.connect(second).connect(secondLevel).connect(hum);

        const far = context.createGain();
        far.gain.setValueAtTime(0.25, now);
        far.gain.linearRampToValueAtTime(1, end - 0.5);
        far.gain.linearRampToValueAtTime(0.0001, end - 0.37);
        const dull = context.createBiquadFilter();
        dull.type = 'lowpass';
        dull.frequency.value = 1500;
        const echo = context.createDelay(1);
        echo.delayTime.value = 0.33;
        const echoLevel = context.createGain();
        echoLevel.gain.value = 0.38;
        hum.connect(far).connect(dull);
        const lullabyOut = trim(output, 0.42);
        dull.connect(lullabyOut);
        dull.connect(echo).connect(echoLevel).connect(lullabyOut);

        let time = 0.5;
        for (const [name, beats] of melody) {
          const length = beats * beat;
          if (time + length > seconds - 0.5) break;
          const at = now + time;
          voice.frequency.setTargetAtTime(names[name] * scale, at, 0.04);
          hum.gain.setTargetAtTime(0.9, at, 0.05);
          hum.gain.setTargetAtTime(0.0001, at + length - 0.09, 0.03);
          time += length;
        }
        voice.frequency.setValueAtTime(names.E4 * scale, now);
        voice.start(now);
        vibrato.start(now);
        voice.stop(end - 0.36);
        vibrato.stop(end - 0.36);
      },
    },
    {
      name: 'tube',
      dips: tubeDips,
      sound: (output, seconds, now) => {
        const { context } = audio;
        const end = now + seconds;
        const gate = context.createGain();
        gate.gain.setValueAtTime(1, now);
        const level = context.createGain();
        level.gain.setValueAtTime(0.0001, now);
        level.gain.exponentialRampToValueAtTime(0.5, now + 0.25);
        level.gain.linearRampToValueAtTime(1, end - 0.05);
        const tone1 = context.createBiquadFilter();
        tone1.type = 'lowpass';
        tone1.frequency.value = 850;
        tone1.Q.value = 1.5;
        const out = trim(output, 0.52);
        gate.connect(level).connect(out);
        [100, 100.7].forEach((freq) => {
          const saw = context.createOscillator();
          saw.type = 'sawtooth';
          saw.frequency.value = freq;
          const sawLevel = context.createGain();
          sawLevel.gain.value = 0.16;
          saw.connect(tone1).connect(sawLevel).connect(gate);
          saw.start(now);
          saw.stop(end);
        });
        const octave = context.createOscillator();
        octave.frequency.value = 200;
        const octaveLevel = context.createGain();
        octaveLevel.gain.value = 0.1;
        octave.connect(octaveLevel).connect(gate);
        octave.start(now);
        octave.stop(end);
        const sizzle = hissSource(context, audio.hiss);
        const sizzleFilter = context.createBiquadFilter();
        sizzleFilter.type = 'bandpass';
        sizzleFilter.frequency.value = 2400;
        sizzleFilter.Q.value = 0.8;
        const sizzleLevel = context.createGain();
        sizzleLevel.gain.value = 0.025;
        sizzle.connect(sizzleFilter).connect(sizzleLevel).connect(gate);
        sizzle.start(now);
        sizzle.stop(end);

        tubeDips.forEach(([time, length]) => {
          const at = now + time;
          if (at + length > end - 0.05) return;
          const g = gate.gain;
          g.setValueAtTime(1, at);
          g.linearRampToValueAtTime(0.04, at + 0.01);
          g.setValueAtTime(0.04, at + length * 0.45);
          g.linearRampToValueAtTime(0.8, at + length * 0.45 + 0.01);
          g.setValueAtTime(0.8, at + length * 0.65);
          g.linearRampToValueAtTime(0.04, at + length * 0.65 + 0.01);
          g.setValueAtTime(0.04, at + length);
          g.linearRampToValueAtTime(1, at + length + 0.015);
          puff(out, end, { at: at + length, freq: 1800, q: 1.5, length: 0.04, volume: 0.05 });
          note(out, end, { freq: 75, to: 55, at: at + length, length: 0.12, volume: 0.25, attack: 0.003 });
        });
      },
    },
    {
      name: 'whisper',
      sound: (output, seconds, now) => {
        const { context } = audio;
        const end = now + seconds;
        const out = trim(output, 3.5);
        const vowels = { ah: [730, 1090], ee: [300, 2300], oo: [320, 900], eh: [540, 1800], oh: [500, 900], ih: [400, 2000] };
        const SYLLABLE = 0.3;

        const whisper = (time, syllables, from, to, volume) => {
          const at = now + time;
          const length = syllables.length * SYLLABLE + 0.2;
          if (at + length > end - 0.02) return;
          const noise = hissSource(context, audio.hiss);
          const f1 = context.createBiquadFilter();
          const f2 = context.createBiquadFilter();
          f1.type = 'bandpass';
          f2.type = 'bandpass';
          f1.Q.value = 6;
          f2.Q.value = 7;
          const g1 = context.createGain();
          const g2 = context.createGain();
          g1.gain.value = 1;
          g2.gain.value = 0.6;
          const envelope = context.createGain();
          const panner = context.createStereoPanner();
          panner.pan.setValueAtTime(from, at);
          panner.pan.linearRampToValueAtTime(to, at + length);
          noise.connect(f1).connect(g1).connect(envelope);
          noise.connect(f2).connect(g2).connect(envelope);
          envelope.connect(panner).connect(out);
          envelope.gain.setValueAtTime(0.0001, at);
          syllables.forEach((vowel, i) => {
            const start = at + 0.12 + i * SYLLABLE;
            const [a, b] = vowels[vowel];
            f1.frequency.setTargetAtTime(a, start, 0.05);
            f2.frequency.setTargetAtTime(b, start, 0.05);
            envelope.gain.linearRampToValueAtTime(volume, start + 0.1);
            envelope.gain.linearRampToValueAtTime(volume * 0.4, start + SYLLABLE - 0.02);
          });
          envelope.gain.linearRampToValueAtTime(0.0001, at + length);
          f1.frequency.setValueAtTime(vowels[syllables[0]][0], at);
          f2.frequency.setValueAtTime(vowels[syllables[0]][1], at);
          noise.start(at, rnd(0, 1.5));
          noise.stop(at + length);
          puff(panner, end, { at, freq: 2800, q: 0.7, length: 0.14, volume: volume * 0.06 });
        };

        const words = [
          [0.5, ['ih', 'oo'], -0.9, -0.3, 0.5],
          [2, ['ee', 'ah', 'oo'], 0.9, 0.2, 0.6],
          [3.5, ['oh', 'ee'], -0.8, 0.8, 0.7],
          [4.6, ['ah', 'oo', 'ih', 'ah'], 0.8, -0.8, 0.75],
          [6, ['ee', 'oh', 'ee'], -0.6, 0.9, 0.85],
          [7, ['ah', 'ee', 'oo'], 0.9, -0.9, 0.95],
          [8.05, ['ih', 'ee'], -0.9, 0.9, 1],
        ];
        words.forEach(([time, syllables, from, to, volume], i) => {
          whisper(time, syllables, from, to, volume * 0.75);
          if (i >= 3) whisper(time + 0.4, syllables.slice().reverse(), -from, -to, volume * 0.4);
        });
      },
    },
    {
      name: 'swing',
      swings: swingSpans,
      sound: (output, seconds, now) => {
        const { context } = audio;
        const end = now + seconds;
        const out = trim(output, 0.5);
        swingSpans.forEach(([time, span], i) => {
          const length = span * 0.9;
          const at = now + time;
          if (at + length > end - 0.02) return;
          const base = (i % 2 ? 330 : 400) * lerp(1, 0.92, i / swingSpans.length);
          const chain = context.createGain();
          chain.gain.setValueAtTime(0.0001, at);
          chain.gain.linearRampToValueAtTime(lerp(0.7, 1, i / swingSpans.length), at + length * 0.4);
          chain.gain.linearRampToValueAtTime(0.0001, at + length);
          const body = context.createBiquadFilter();
          body.type = 'bandpass';
          body.frequency.value = 820;
          body.Q.value = 2.2;
          const soft = context.createBiquadFilter();
          soft.type = 'lowpass';
          soft.frequency.value = 1700;
          const stick = context.createGain();
          stick.gain.value = 0.5;
          const slip = context.createOscillator();
          slip.type = 'sawtooth';
          slip.frequency.value = rnd(26, 38);
          const slipDepth = context.createGain();
          slipDepth.gain.value = 0.5;
          slip.connect(slipDepth).connect(stick.gain);
          [1, 1.012].forEach((detune) => {
            const saw = context.createOscillator();
            saw.type = 'sawtooth';
            saw.frequency.setValueAtTime(base * detune, at);
            saw.frequency.exponentialRampToValueAtTime(base * 1.55 * detune, at + length / 2);
            saw.frequency.exponentialRampToValueAtTime(base * 1.05 * detune, at + length);
            saw.connect(body);
            saw.start(at);
            saw.stop(at + length);
          });
          body.connect(soft).connect(stick).connect(chain).connect(out);
          slip.start(at);
          slip.stop(at + length);
        });
      },
    },
    {
      name: 'phone',
      rings: phoneRings.map((at) => [at, RING]),
      sound: (output, seconds, now) => {
        const { context } = audio;
        const end = now + seconds;
        const out = trim(output, 0.15);
        phoneRings.forEach((time, i) => {
          const at = now + time;
          const stop = Math.min(at + RING, end - 0.42);
          if (stop - at < 0.2) return;
          const level = [0.3, 0.5, 0.75, 1][i];
          const env = context.createGain();
          env.gain.setValueAtTime(0.0001, at);
          env.gain.linearRampToValueAtTime(level, at + 0.03);
          env.gain.setValueAtTime(level, stop - 0.05);
          env.gain.linearRampToValueAtTime(0.0001, stop);
          const hall = context.createBiquadFilter();
          hall.type = 'lowpass';
          hall.frequency.value = 2300;
          env.connect(hall).connect(out);
          [[0.19, 0.32], [0.37, 0.14]].forEach(([delay, amount]) => {
            const echo = context.createDelay(1);
            echo.delayTime.value = delay;
            const echoLevel = context.createGain();
            echoLevel.gain.value = amount;
            hall.connect(echo).connect(echoLevel).connect(out);
          });
          const lfo = context.createOscillator();
          lfo.frequency.value = 17;
          lfo.start(at);
          lfo.stop(stop);
          [[1180, 1, 1], [1490, -1, 1], [2650, 1, 0.12]].forEach(([freq, sign, amount]) => {
            const oscillator = context.createOscillator();
            oscillator.frequency.value = freq;
            const wave = context.createGain();
            wave.gain.value = 0.5 * amount;
            const depth = context.createGain();
            depth.gain.value = 0.5 * sign * amount;
            lfo.connect(depth).connect(wave.gain);
            oscillator.connect(wave).connect(env);
            oscillator.start(at);
            oscillator.stop(stop);
          });
        });
      },
    },
  );
}

// Group b countdowns: radio, wind, rats, typewriter, breath, siren, organ, choir, ball, bell, thunder, crickets.
{
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /** A sine/triangle/saw voice with a soft attack and release, optional glide and pan. All times absolute. */
  const voice = (output, { type = 'sine', freq, to, at, length, volume, attack = 0.01, release, pan, detune }) => {
    const { context } = audio;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const rel = release ?? Math.min(0.08, length * 0.5);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, at);
    if (to) oscillator.frequency.linearRampToValueAtTime(to, at + length);
    if (detune) oscillator.detune.value = detune;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + attack);
    gain.gain.setValueAtTime(volume, at + Math.max(attack, length - rel));
    gain.gain.linearRampToValueAtTime(0, at + length);
    let tail = gain;
    oscillator.connect(gain);
    if (pan !== undefined) {
      const panner = context.createStereoPanner();
      panner.pan.value = pan;
      gain.connect(panner);
      tail = panner;
    }
    tail.connect(output);
    oscillator.start(at);
    oscillator.stop(at + length + 0.02);
  };

  /** Filtered noise with a shaped envelope. Returns nothing; stops itself at at + length. */
  const puff = (output, { at, length, volume, type = 'bandpass', freq, to, q = 1, attack = 0.01, pan }) => {
    const { context, hiss } = audio;
    const source = hissSource(context, hiss);
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(freq, at);
    if (to) filter.frequency.linearRampToValueAtTime(to, at + length);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + Math.min(attack, length / 2));
    gain.gain.linearRampToValueAtTime(0, at + length);
    source.connect(filter).connect(gain);
    if (pan !== undefined) {
      const panner = context.createStereoPanner();
      panner.pan.value = pan;
      gain.connect(panner).connect(output);
    } else gain.connect(output);
    source.start(at, Math.random());
    source.stop(at + length + 0.02);
  };

  const midi = (note) => 440 * 2 ** ((note - 69) / 12);

  /** A constant noise bed that fades in over the window. */
  const bed = (output, now, seconds, { type, freq, q, from, to }) => {
    const { context, hiss } = audio;
    const end = now + seconds;
    const source = hissSource(context, hiss);
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    gain.gain.setValueAtTime(from, now);
    gain.gain.linearRampToValueAtTime(to, end - 0.05);
    gain.gain.linearRampToValueAtTime(0, end);
    source.connect(filter).connect(gain).connect(output);
    source.start(now);
    source.stop(end);
  };

  COUNTDOWNS.push(
    {
      // An old radio tuning between stations: static, whistles, and fragments of a waltz that get clearer.
      name: 'radio',
      level: 2,
      sound: (output, seconds, now) => {
        const { context } = audio;
        const high = context.createBiquadFilter();
        const low = context.createBiquadFilter();
        const set = context.createGain();
        high.type = 'highpass';
        high.frequency.value = 320;
        low.type = 'lowpass';
        low.frequency.value = 2600;
        set.gain.value = 1;
        high.connect(low).connect(set).connect(output);
        bed(high, now, seconds, { type: 'bandpass', freq: 1500, q: 0.7, from: 0.05, to: 0.025 });
        // Fragments of a waltz in A minor: oom-pah-pah, with a melody on top.
        const melody = [76, 0, 72, 74, 76, 0, 81, 0, 80, 0, 76, 0, 77, 76, 74, 72, 71, 0, 69, 0, 0, 0];
        const bass = [45, 45, 40, 40, 45, 45, 52, 52];
        const beat = 0.34;
        const windows = [[0.12, 0.3], [0.38, 0.62], [0.7, 0.99]];
        windows.forEach(([a, b], w) => {
          const from = now + a * seconds;
          const to = now + b * seconds;
          const level = 0.5 + w * 0.25;
          const gate = context.createGain();
          gate.gain.setValueAtTime(0, from - 0.001);
          gate.gain.linearRampToValueAtTime(level, from + 0.35);
          gate.gain.setValueAtTime(level, to - 0.4);
          gate.gain.linearRampToValueAtTime(0, to);
          gate.connect(high);
          const startBeat = w * 5;
          for (let k = 0, at = from; at < to - 0.05; k += 1, at += beat) {
            const index = startBeat + k;
            const pos = index % 3;
            if (pos === 0) voice(gate, { type: 'triangle', freq: midi(bass[Math.floor(index / 3) % bass.length]), at, length: beat * 0.9, volume: 0.1 });
            else [57, 60, 64].forEach((note) => voice(gate, { type: 'triangle', freq: midi(note + 12), at, length: beat * 0.55, volume: 0.035 }));
            const note = melody[index % melody.length];
            if (note) voice(gate, { type: 'square', freq: midi(note), at, length: beat * 0.85, volume: 0.03, attack: 0.02 });
          }
          // A tuning whistle sliding between stations.
          const slide = Math.min(0.9, (b - a) * seconds * 0.4);
          voice(set, { freq: 700 + w * 120, to: 1500 - w * 300, at: to - 0.02, length: slide, volume: 0.012, attack: 0.15, release: 0.3 });
        });
      },
    },
    {
      // Wind howling through a broken window, gusting and slowly strengthening.
      name: 'wind',
      level: 4,
      sound: (output, seconds, now) => {
        const { context, hiss } = audio;
        const end = now + seconds;
        const howls = [[2.2, 5.5, 0.9], [3.1, 7, 0.6]];
        howls.forEach(([ratio, q, level], index) => {
          const source = hissSource(context, hiss);
          const filter = context.createBiquadFilter();
          const gain = context.createGain();
          filter.type = 'bandpass';
          filter.Q.value = q;
          filter.frequency.setValueAtTime(240 * ratio, now);
          gain.gain.setValueAtTime(0.0001, now);
          const gusts = Math.round(seconds / 1.5);
          for (let g = 1; g <= gusts; g += 1) {
            const t = now + (seconds * g) / gusts;
            const swell = 0.3 + 0.7 * (g / gusts);
            const high = g % 2 === (index ? 0 : 1);
            gain.gain.linearRampToValueAtTime(level * 0.2 * swell * (high ? 1 : 0.35), t - 0.05);
            filter.frequency.linearRampToValueAtTime(240 * ratio * (high ? 1.35 : 0.8) * (1 + 0.1 * g / gusts), t - 0.05);
          }
          gain.gain.linearRampToValueAtTime(0, end);
          source.connect(filter).connect(gain).connect(output);
          source.start(now, Math.random());
          source.stop(end);
        });
        bed(output, now, seconds, { type: 'lowpass', freq: 260, q: 0.5, from: 0.05, to: 0.22 });
        // A faint whistle through the cracked glass.
        voice(output, { freq: 520, to: 700, at: now + seconds * 0.4, length: seconds * 0.3, volume: 0.008, attack: 0.8, release: 0.8, pan: 0.3 });
      },
    },
    {
      // Tiny scratching in the walls, moving about. Quickens as it goes.
      name: 'rats',
      level: 6,
      sound: (output, seconds, now) => {
        bed(output, now, seconds, { type: 'bandpass', freq: 700, q: 0.8, from: 0.01, to: 0.045 });
        let pan = randomRange(-0.8, 0.8);
        let t = 0.3;
        while (t < seconds - 0.35) {
          const progress = t / seconds;
          pan = clamp(pan + randomRange(-0.7, 0.7), -0.9, 0.9);
          const scratches = 3 + Math.floor(Math.random() * 5);
          let at = t;
          const base = randomRange(1800, 3000);
          for (let s = 0; s < scratches && at < seconds - 0.1; s += 1) {
            const length = randomRange(0.02, 0.05);
            puff(output, { at: now + at, length, volume: (0.1 + 0.2 * progress) * randomRange(0.6, 1), freq: base * randomRange(0.8, 1.2), q: 2.5, pan, attack: 0.004 });
            puff(output, { at: now + at, length: length * 2, volume: 0.05 + 0.08 * progress, type: 'lowpass', freq: 900, q: 0.5, pan, attack: 0.006 });
            at += randomRange(0.035, 0.07);
          }
          t = at + randomRange(0.3, 1.1) * (1.15 - 0.6 * progress);
        }
      },
    },
    {
      // A typewriter clattering by itself in another room, with a bell at the end of each line.
      name: 'typewriter',
      level: 1,
      sound: (output, seconds, now) => {
        const { context } = audio;
        const room = context.createBiquadFilter();
        room.type = 'lowpass';
        room.frequency.value = 2400;
        room.connect(output);
        const echo = context.createDelay(0.5);
        const echoGain = context.createGain();
        echo.delayTime.value = 0.13;
        echoGain.gain.value = 0.25;
        room.connect(echo).connect(echoGain).connect(output);
        const lines = seconds > 6 ? 3 : 2;
        const lineLength = seconds / lines;
        for (let line = 0; line < lines; line += 1) {
          const start = line * lineLength;
          const typingEnd = start + lineLength - 0.9;
          let t = start + 0.25;
          const volume = 0.5 + 0.5 * ((line + 1) / lines);
          while (t < typingEnd) {
            const at = now + t;
            puff(room, { at, length: 0.03, volume: 0.28 * volume * randomRange(0.7, 1), freq: randomRange(1400, 2200), q: 1.2, attack: 0.002 });
            voice(room, { freq: randomRange(150, 190), to: 90, at, length: 0.06, volume: 0.22 * volume, attack: 0.002 });
            t += Math.random() < 0.14 ? randomRange(0.3, 0.55) : randomRange(0.07, 0.14);
          }
          const dingAt = now + Math.min(typingEnd + 0.1, seconds - 0.8);
          [[1, 0.12], [2.76, 0.05], [5.4, 0.02]].forEach(([ratio, level]) => {
            voice(output, { freq: 1568 * ratio * 0.5, at: dingAt, length: 0.7, volume: level * volume, attack: 0.002, release: 0.65 });
          });
          // Carriage return: a ratchety slide.
          const slideAt = dingAt + 0.15;
          for (let k = 0; k < 7 && slideAt + k * 0.045 < now + seconds - 0.05; k += 1) {
            puff(room, { at: slideAt + k * 0.045, length: 0.02, volume: 0.1 * volume, freq: 1000, q: 2 });
          }
        }
      },
    },
    {
      // Slow heavy breathing, right behind you, getting a little quicker.
      name: 'breath',
      level: 1.8,
      sound: (output, seconds, now) => {
        const { context } = audio;
        const room = context.createGain();
        const warm = context.createBiquadFilter();
        warm.type = 'lowpass';
        warm.frequency.value = 1500;
        room.connect(warm).connect(output);
        let t = 0.25;
        let cycle = 3;
        let phase = 0;
        while (t < seconds - 0.6) {
          const progress = t / seconds;
          const inhale = cycle * 0.4;
          const exhale = cycle * 0.5;
          const strength = 0.22 + 0.3 * progress;
          const inhaleLength = Math.min(inhale, seconds - t - 0.05);
          if (inhaleLength > 0.2) {
            puff(room, { at: now + t, length: inhaleLength, volume: strength * 0.8, freq: 520, to: 1000, q: 1.1, attack: inhaleLength * 0.75 });
            puff(room, { at: now + t, length: inhaleLength, volume: strength * 0.5, type: 'lowpass', freq: 400, q: 0.5, attack: inhaleLength * 0.7 });
          }
          const exhaleAt = t + inhale + 0.15;
          const exhaleLength = Math.min(exhale, seconds - exhaleAt - 0.05);
          if (exhaleLength > 0.2) {
            puff(room, { at: now + exhaleAt, length: exhaleLength, volume: strength, freq: 800, to: 380, q: 0.9, attack: exhaleLength * 0.25 });
            puff(room, { at: now + exhaleAt, length: exhaleLength, volume: strength * 0.6, type: 'lowpass', freq: 320, q: 0.5, attack: exhaleLength * 0.3 });
            voice(room, { type: 'sawtooth', freq: 95 - phase * 5, to: 80, at: now + exhaleAt + 0.05, length: exhaleLength * 0.7, volume: 0.012, attack: exhaleLength * 0.25 });
          }
          phase = 1 - phase;
          t += cycle;
          cycle *= 0.93;
        }
      },
    },
    {
      // A far-off wailing siren, soft and echoing across the grounds.
      name: 'siren',
      level: 0.3,
      sound: (output, seconds, now) => {
        const { context } = audio;
        const end = now + seconds;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const dull = context.createBiquadFilter();
        const bus = context.createGain();
        oscillator.type = 'triangle';
        dull.type = 'lowpass';
        dull.frequency.value = 900;
        const wail = clamp(seconds / 2.4, 1, 2.2);
        const half = seconds / (Math.round(wail) * 2);
        oscillator.frequency.setValueAtTime(380, now);
        for (let t = half, up = true; t < seconds + half - 0.001; t += half, up = !up) {
          oscillator.frequency.linearRampToValueAtTime(up ? 620 : 380, now + Math.min(t, seconds));
        }
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 1);
        gain.gain.linearRampToValueAtTime(0.35, end - 0.4);
        gain.gain.linearRampToValueAtTime(0, end);
        oscillator.connect(dull).connect(gain).connect(bus);
        bus.connect(output);
        const echo = context.createDelay(1);
        const feedback = context.createGain();
        const echoTone = context.createBiquadFilter();
        echo.delayTime.value = 0.55;
        feedback.gain.value = 0.45;
        echoTone.type = 'lowpass';
        echoTone.frequency.value = 600;
        bus.connect(echo).connect(echoTone).connect(feedback).connect(echo);
        echoTone.connect(output);
        oscillator.start(now);
        oscillator.stop(end);
        // The echo must be gone too: its own gain closes at the end.
        feedback.gain.setValueAtTime(0.45, end - 0.02);
        feedback.gain.linearRampToValueAtTime(0, end);
        bed(output, now, seconds, { type: 'lowpass', freq: 300, q: 0.5, from: 0.01, to: 0.05 });
      },
    },
    {
      // A low church organ chord swelling slowly, with a sour note creeping in.
      name: 'organ',
      level: 1.5,
      sound: (output, seconds, now) => {
        const { context } = audio;
        const end = now + seconds;
        const swell = context.createGain();
        const lowpass = context.createBiquadFilter();
        const tremolo = context.createGain();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(350, now);
        lowpass.frequency.linearRampToValueAtTime(1500, end - 0.4);
        swell.gain.setValueAtTime(0.0001, now);
        swell.gain.exponentialRampToValueAtTime(0.55, end - 0.35);
        swell.gain.linearRampToValueAtTime(0, end);
        tremolo.gain.value = 0.85;
        const lfo = context.createOscillator();
        const depth = context.createGain();
        lfo.frequency.value = 5.2;
        depth.gain.value = 0.1;
        lfo.connect(depth).connect(tremolo.gain);
        lfo.start(now);
        lfo.stop(end);
        swell.connect(lowpass).connect(tremolo).connect(output);
        // D minor, with the drawbars of a pipe organ: octaves and a fifth above each root.
        [[36, 1], [43, 0.8], [48, 0.8], [53, 0.6], [57, 0.5]].forEach(([note, level]) => {
          [[1, 1], [2, 0.5], [3, 0.22], [4, 0.14]].forEach(([harmonic, draw], index) => {
            voice(swell, {
              freq: midi(note) * harmonic, at: now, length: seconds, volume: 0.1 * level * draw,
              attack: 0.05, release: 0.05, detune: index % 2 ? 3 : -3,
            });
          });
        });
        // A flat ninth drifts in late: tension.
        voice(swell, { freq: midi(49), at: now + seconds * 0.55, length: seconds * 0.45, volume: 0.05, attack: seconds * 0.3, release: 0.05 });
      },
    },
    {
      // A soft ghostly choir singing "aah", rising by small steps.
      name: 'choir',
      level: 4,
      sound: (output, seconds, now) => {
        const { context } = audio;
        const end = now + seconds;
        const hall = context.createGain();
        const echo = context.createDelay(1);
        const feedback = context.createGain();
        hall.connect(output);
        echo.delayTime.value = 0.35;
        feedback.gain.value = 0.35;
        hall.connect(echo).connect(feedback).connect(echo);
        echo.connect(output);
        feedback.gain.setValueAtTime(0.35, end - 0.05);
        feedback.gain.linearRampToValueAtTime(0, end);
        const scale = [57, 59, 60, 62, 64, 65, 67, 69];
        const steps = clamp(Math.round(seconds / 1.3), 3, 8);
        const step = seconds / steps;
        for (let k = 0; k < steps; k += 1) {
          const at = now + k * step;
          const length = Math.min(step * 1.3, end - at);
          const volume = 0.5 + 0.5 * (k / steps);
          const note = scale[Math.round((k * (scale.length - 1)) / (steps - 1))];
          const sung = context.createGain();
          const lfo = context.createOscillator();
          const lfoDepth = context.createGain();
          sung.gain.setValueAtTime(0, at);
          sung.gain.linearRampToValueAtTime(volume, at + Math.min(0.7, length * 0.4));
          sung.gain.setValueAtTime(volume, at + length * 0.6);
          sung.gain.linearRampToValueAtTime(0, at + length);
          lfo.frequency.value = 5 + Math.random();
          lfoDepth.gain.value = 18;
          lfo.connect(lfoDepth);
          // Vowel "ah": three formants.
          [[800, 1, 8], [1150, 0.45, 10], [2800, 0.12, 12]].forEach(([freq, level, q]) => {
            const formant = context.createBiquadFilter();
            const out = context.createGain();
            formant.type = 'bandpass';
            formant.frequency.value = freq;
            formant.Q.value = q;
            out.gain.value = level;
            sung.connect(formant).connect(out).connect(hall);
          });
          const source = context.createGain();
          source.gain.value = 0.05;
          source.connect(sung);
          [[note, -9], [note, 8], [note - 12, 0], [note + 0.04, 0]].forEach(([n, detune]) => {
            const oscillator = context.createOscillator();
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = midi(n);
            oscillator.detune.value = detune;
            lfoDepth.connect(oscillator.detune);
            oscillator.connect(source);
            oscillator.start(at);
            oscillator.stop(at + length + 0.02);
          });
          lfo.start(at);
          lfo.stop(at + length + 0.02);
        }
      },
    },
    {
      // A child's ball bouncing slowly down the stairs, each bounce nearer.
      name: 'ball',
      level: 0.4,
      sound: (output, seconds, now) => {
        const { context } = audio;
        const end = now + seconds;
        const hall = context.createDelay(1);
        const feedback = context.createGain();
        const wet = context.createGain();
        const dull = context.createBiquadFilter();
        hall.delayTime.value = 0.21;
        feedback.gain.value = 0.4;
        wet.gain.setValueAtTime(0.7, now);
        wet.gain.linearRampToValueAtTime(0.15, end);
        dull.type = 'lowpass';
        dull.frequency.value = 900;
        hall.connect(dull).connect(feedback).connect(hall);
        dull.connect(wet).connect(output);
        feedback.gain.setValueAtTime(0.4, end - 0.05);
        feedback.gain.linearRampToValueAtTime(0, end);
        const bounces = clamp(Math.round(seconds / 1.05), 3, 10);
        let t = 0.3;
        for (let k = 0; k < bounces && t < seconds - 0.15; k += 1) {
          const progress = k / (bounces - 1);
          const volume = 0.25 + 0.75 * progress;
          const at = now + t;
          const knock = context.createGain();
          knock.connect(output);
          knock.connect(hall);
          const pitch = 170 - (k % 3) * 18;
          voice(knock, { freq: pitch * 1.4, to: pitch * 0.7, at, length: 0.16, volume: volume * 0.8, attack: 0.002, release: 0.14 });
          puff(knock, { at, length: 0.05, volume: volume * 0.4, freq: 900 + progress * 800, q: 1.5, attack: 0.002 });
          // A small hard rebound on the same step.
          voice(knock, { freq: pitch * 1.6, to: pitch, at: at + 0.24, length: 0.09, volume: volume * 0.2, attack: 0.002, release: 0.08 });
          t += 1.25 - 0.45 * progress;
        }
      },
    },
    {
      // A deep ward bell tolling slowly.
      name: 'bell',
      level: 0.3,
      sound: (output, seconds, now) => {
        const end = now + seconds;
        const strikes = clamp(Math.floor(seconds / 2.3), 2, 5);
        const gap = (seconds - 0.4) / strikes;
        for (let k = 0; k < strikes; k += 1) {
          const at = now + 0.1 + k * gap;
          const volume = 0.55 + 0.45 * (k / strikes);
          const length = Math.min(4, end - at);
          [[0.5, 0.55, 1], [1, 1, 1], [1.19, 0.5, 0.8], [1.5, 0.4, 0.7], [2, 0.6, 0.6], [2.5, 0.2, 0.4], [3.0, 0.12, 0.3]].forEach(([ratio, level, decay]) => {
            const partialLength = Math.min(length * decay, end - at);
            tone(output, { path: [[0, 92 * ratio], [partialLength, 92 * ratio * 0.998]], length: partialLength, volume: 0.28 * level * volume, at });
            tone(output, { path: [[0, 92 * ratio * 1.004]], length: partialLength, volume: 0.1 * level * volume, at });
          });
          puff(output, { at, length: 0.05, volume: 0.15 * volume, freq: 600, q: 1 });
        }
      },
    },
    {
      // Distant rolling thunder and soft rain.
      name: 'thunder',
      level: 1.2,
      sound: (output, seconds, now) => {
        const { context, hiss } = audio;
        const end = now + seconds;
        // Rain: a soft, band-limited patter that thickens.
        const rain = hissSource(context, hiss);
        const rainHigh = context.createBiquadFilter();
        const rainLow = context.createBiquadFilter();
        const rainGain = context.createGain();
        rainHigh.type = 'highpass';
        rainHigh.frequency.value = 900;
        rainLow.type = 'lowpass';
        rainLow.frequency.value = 4500;
        rainGain.gain.setValueAtTime(0.02, now);
        rainGain.gain.linearRampToValueAtTime(0.09, end - 0.2);
        rainGain.gain.linearRampToValueAtTime(0, end);
        rain.connect(rainHigh).connect(rainLow).connect(rainGain).connect(output);
        rain.start(now);
        rain.stop(end);
        // Thunder: low rumble with a rolling, uneven envelope.
        [[0.12, 0.45, 3.2], [0.55, 1, 4.2]].forEach(([when, level, rollLength]) => {
          const at = now + when * seconds;
          const length = Math.min(rollLength, end - at - 0.05);
          if (length < 0.5) return;
          const source = hissSource(context, hiss);
          const low = context.createBiquadFilter();
          const gain = context.createGain();
          low.type = 'lowpass';
          low.frequency.setValueAtTime(220, at);
          low.frequency.linearRampToValueAtTime(70, at + length);
          low.Q.value = 1.2;
          gain.gain.setValueAtTime(0, at);
          gain.gain.linearRampToValueAtTime(level * 0.9, at + 0.4);
          for (let t = 0.8; t < length - 0.2; t += randomRange(0.3, 0.6)) {
            const decay = 1 - t / length;
            gain.gain.linearRampToValueAtTime(level * decay * randomRange(0.4, 1.3) * 0.9, at + t);
          }
          gain.gain.linearRampToValueAtTime(0, at + length);
          source.connect(low).connect(gain).connect(output);
          source.start(at, Math.random());
          source.stop(at + length + 0.02);
          // The deep boom underneath.
          voice(output, { freq: 55, to: 38, at, length: length * 0.8, volume: 0.1 * level, attack: 0.5, release: length * 0.5 });
        });
      },
    },
    {
      // Night crickets that stop, one by one, until a single one is left.
      name: 'crickets',
      level: 8,
      sound: (output, seconds, now) => {
        const { context } = audio;
        const end = now + seconds;
        const pitches = [3300, 3600, 3900, 4200];
        pitches.forEach((pitch, index) => {
          // Cricket 3 sings to the end; the others stop at a quarter, a half and three quarters.
          const stop = index === 3 ? seconds : seconds * (0.22 + 0.25 * index);
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const panner = context.createStereoPanner();
          oscillator.frequency.value = pitch;
          panner.pan.value = [-0.7, 0.6, -0.2, 0.3][index];
          gain.gain.setValueAtTime(0, now);
          const period = 0.42 + index * 0.07;
          let t = 0.1 + index * 0.13;
          const volume = index === 3 ? 0.045 : 0.032;
          while (t + 0.3 < stop) {
            for (let p = 0; p < 3; p += 1) {
              const at = now + t + p * 0.07;
              gain.gain.setValueAtTime(0, at);
              gain.gain.linearRampToValueAtTime(volume, at + 0.012);
              gain.gain.linearRampToValueAtTime(0, at + 0.04);
            }
            t += period;
          }
          oscillator.connect(gain).connect(panner).connect(output);
          oscillator.start(now);
          oscillator.stop(now + stop);
        });
        // The night air under them.
        bed(output, now, seconds, { type: 'lowpass', freq: 400, q: 0.5, from: 0.02, to: 0.03 });
      },
    },
  );
}


// One per question, so that no two neighbours sound alike.
const COUNTDOWN_ORDER = [
  'drip', 'radio', 'footsteps', 'wind', 'tick',
  'strings', 'musicbox', 'rats', 'pager', 'thunder',
  'knocking', 'choir', 'tube', 'swing', 'breath',
  'phone', 'organ', 'whisper', 'ball', 'lullaby',
  'typewriter', 'heartbeat', 'bell', 'trolley', 'crickets',
];
COUNTDOWNS.splice(0, COUNTDOWNS.length, ...COUNTDOWN_ORDER.map((name) => COUNTDOWNS.find((countdown) => countdown.name === name)));

// Measured trims, so every countdown sits at the same loudness.
const COUNTDOWN_TRIMS = {
  drip: 1.3, radio: 1.09, footsteps: 1.12, wind: 1.41, tick: 1.23,
  strings: 1.3, musicbox: 0.78, rats: 1.04, pager: 0.75, thunder: 1.32,
  knocking: 1.08, choir: 0.99, tube: 0.75, swing: 1.11, breath: 1.03,
  phone: 0.66, organ: 0.96, whisper: 0.86, ball: 0.91, lullaby: 0.79,
  typewriter: 0.79, heartbeat: 1.16, bell: 1.01, trolley: 1.03, crickets: 0.78,
};
COUNTDOWNS.forEach((countdown) => { countdown.level = (countdown.level ?? 1) * COUNTDOWN_TRIMS[countdown.name]; });
