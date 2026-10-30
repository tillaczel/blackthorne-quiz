// The jump scares, one per question, in order. Loaded after script.js.

const swarm = (count, html, style) => Array.from({ length: count }, () => `<i style="${style()}">${html}</i>`).join('');

const PHEW_YET = { en: 'Yet.', de: 'Noch nicht.' };

SCARES.push(
  {
    name: 'duck',
    ms: 1300,
    html: () => DUCK,
    sound: (output) => [0, 0.2, 0.42].forEach((seconds) => tone(output, {
      type: 'triangle', path: [[0, 800], [0.14, 1900]], length: 0.18, volume: 0.7, at: audio.context.currentTime + seconds,
    })),
  },
  {
    name: 'phew',
    ms: 2900,
    html: (text) => `<div class="phew-pull"><b class="phew-note"><span class="phew-was">${text.phew}</span><span class="phew-now">${PHEW_YET[language]}</span>
      <svg class="phew-hand" viewBox="0 0 400 1000" aria-hidden="true">
        <path d="M168 -20H232L226 340L224 600L282 660L292 750H110L120 660L176 600z" fill="#d9d4c4" stroke="#0b0907" stroke-width="7" stroke-linejoin="round"/>
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
          <g stroke="#0b0907" stroke-width="42"><path d="M150 740L128 830L116 920L142 992"/><path d="M185 750L172 850L168 950L192 1000"/><path d="M222 750L228 850L236 950L214 1000"/><path d="M258 735L282 830L296 920L272 988"/><path d="M290 690L340 750L356 830L330 850"/></g>
          <g stroke="#d9d4c4" stroke-width="30"><path d="M150 740L128 830L116 920L142 992"/><path d="M185 750L172 850L168 950L192 1000"/><path d="M222 750L228 850L236 950L214 1000"/><path d="M258 735L282 830L296 920L272 988"/><path d="M290 690L340 750L356 830L330 850"/></g>
          <g stroke="#8d8672" stroke-width="5"><path d="M200 -20V560M150 668Q200 690 250 668"/></g>
        </g>
        <g fill="#d9d4c4" stroke="#0b0907" stroke-width="5"><circle cx="128" cy="830" r="13"/><circle cx="172" cy="850" r="13"/><circle cx="228" cy="850" r="13"/><circle cx="282" cy="830" r="13"/></g>
        <g fill="#0b0907"><path d="M130 960L116 920L148 975L142 996zM178 970L168 940L200 985L192 1004zM224 972L236 940L206 988L214 1004zM270 962L296 920L280 984z"/></g>
      </svg></b></div>`,
    sound: (output) => {
      const start = audio.context.currentTime;
      burst(output, 0.5, 0.05, start + 1.0);
      tone(output, { type: 'sine', path: [[0, 310], [0.4, 250]], length: 0.5, volume: 0.08, at: start + 1.05, wobble: [6, 30] });
      burst(output, 0.2, 0.3, start + 1.8);
      tone(output, { type: 'sawtooth', path: [[0, 90], [0.3, 40]], length: 0.35, volume: 0.35, at: start + 1.85 });
      hit(output, start + 2.0);
      burst(output, 0.16, 0.9, start + 2.0);
      tone(output, { type: 'square', path: [[0, 900], [0.25, 120]], length: 0.3, volume: 0.15, at: start + 2.0 });
    },
  },
  {
    name: 'blood',
    ms: 3200,
    html: (text) => `<div class="blood"><b>${text.endTitle}</b><svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0h200v4c-4 0-5 12-9 12s-4-9-8-9-5 13-10 13-4-14-9-14-5 7-9 7-5-8-9-8-5 12-10 12-4-11-9-11-5 5-9 5-5-6-9-6-5 13-10 13-4-13-9-13-5 8-9 8-5-9-9-9-5 11-10 11-4-12-9-12-5 6-9 6-5-7-9-7z" fill="#6e0805"/></svg></div>`,
    sound: (output) => {
      hit(output);
      tone(output, { type: 'sawtooth', path: [[0, 92], [2.6, 34]], length: 2.8, volume: 0.6, wobble: [5, 40] });
    },
  },
);

// Group a: the staff are coming. matron, file, wheelchair, flatline, door.
{
  const say = (both) => both[language];
  const now = () => audio.context.currentTime;

  /** A flat-level voice with a quick attack and release, for beeps, rings and squeaks. */
  const voice = (output, { type = 'sine', freq, to, at = now(), length, volume }) => {
    const { context } = audio;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, at);
    if (to) oscillator.frequency.exponentialRampToValueAtTime(to, at + length);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.004);
    gain.gain.setValueAtTime(volume, at + Math.max(0.005, length - 0.012));
    gain.gain.linearRampToValueAtTime(0, at + length);
    oscillator.connect(gain).connect(output);
    oscillator.start(at);
    oscillator.stop(at + length + 0.02);
  };

  /** A struck piece of metal: inharmonic partials that ring and die. */
  const clang = (output, at, volume, base = 260) => {
    [[1, 1, 1.8], [2.76, 0.7, 1.4], [5.4, 0.5, 1], [8.93, 0.3, 0.7], [13.3, 0.15, 0.5]].forEach(([ratio, level, length]) => {
      tone(output, { path: [[0, base * ratio]], length, volume: volume * level, at });
    });
    burst(output, 0.05, volume * 0.8, at);
  };

  // ---- file: typed case file and a red stamp

  const FILE = {
    head: { en: 'Blackthorne Institute / admission record', de: 'Blackthorne Institut / Aufnahmeprotokoll' },
    lines: [
      { en: 'PATIENT: YOU', de: 'PATIENT: SIE' },
      { en: 'DIAGNOSIS: INCURABLE', de: 'DIAGNOSE: UNHEILBAR' },
      { en: 'DISCHARGE: NEVER', de: 'ENTLASSUNG: NIE' },
    ],
    stamp: { en: 'ADMITTED', de: 'AUFGENOMMEN' },
  };
  const KEY_GAP = 0.03;
  const LINE_GAP = 0.17;
  const FILE_START = 0.3;

  /** When each line starts and ends typing, shared by the markup and the sound. */
  const typingPlan = () => {
    let at = FILE_START;
    return FILE.lines.map((line) => {
      const text = say(line);
      const plan = { text, at, end: at + text.length * KEY_GAP };
      at = plan.end + LINE_GAP;
      return plan;
    });
  };

  SCARES.push({
    name: 'file',
    ms: 3300,
    html: () => {
      const typed = typingPlan().map(({ text, at }) => `<p>${[...text].map((letter, i) => `<s style="animation-delay:${(at + i * KEY_GAP).toFixed(3)}s">${letter}</s>`).join('')}</p>`).join('');
      return `<div class="file-folder"><span class="file-tab">No. 13</span>
        <div class="file-page"><small>${say(FILE.head)}</small>${typed}</div>
        <div class="file-stamp">${say(FILE.stamp)}</div></div>`;
    },
    sound: (output) => {
      const start = now();
      hit(output, start);
      burst(output, 0.12, 0.7, start);
      typingPlan().forEach(({ text, at, end }) => {
        [...text].forEach((letter, i) => {
          if (letter === ' ') return;
          const when = start + at + i * KEY_GAP;
          burst(output, 0.014, 0.3, when);
          tone(output, { path: [[0, 1400], [0.025, 600]], length: 0.03, volume: 0.1, type: 'square', at: when });
        });
        burst(output, 0.16, 0.14, start + end + 0.02);
        voice(output, { freq: 2637, length: 0.9, volume: 0.17, at: start + end + 0.1 });
        voice(output, { freq: 5300, length: 0.5, volume: 0.05, at: start + end + 0.1 });
      });
      hit(output, start + 2.2);
      burst(output, 0.1, 0.7, start + 2.2);
    },
  });

  // ---- wheelchair: rolls in, stops, snaps round

  const WHEEL_COLOUR = '#aab1a8';
  const spokes = Array.from({ length: 12 }, (_, i) => `<line x1="105" y1="200" x2="${105 + 66 * Math.cos((i * Math.PI) / 6)}" y2="${200 + 66 * Math.sin((i * Math.PI) / 6)}"/>`).join('');
  const CHAIR_SIDE = `<svg class="wheelchair-side" viewBox="0 0 300 300" aria-hidden="true">
    <g fill="none" stroke="${WHEEL_COLOUR}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <g class="wheelchair-wheel"><circle cx="105" cy="200" r="75" stroke-width="8"/><circle cx="105" cy="200" r="63" stroke-width="3"/><g stroke-width="2.5">${spokes}</g><circle cx="105" cy="200" r="9" fill="#0b0c0b"/></g>
      <path d="M40 62L66 68L84 168"/>
      <path d="M92 124H186M182 124L184 168"/>
      <rect class="wheelchair-cushion" x="76" y="146" width="112" height="18" rx="6" fill="#3b3f3a" stroke-width="3"/>
      <path d="M72 168H192" stroke-width="12"/>
      <path d="M192 170L242 226"/><path d="M232 226H268"/><path d="M236 226L240 254"/>
      <circle cx="240" cy="256" r="20" stroke-width="5" fill="#0b0c0b"/>
      <path d="M66 68L82 70L98 166L84 168z" fill="#0b0c0b" stroke-width="3"/>
    </g></svg>`;
  const CHAIR_FRONT = `<svg class="wheelchair-front" viewBox="0 0 300 300" aria-hidden="true">
    <g fill="none" stroke="${WHEEL_COLOUR}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="42" cy="200" rx="15" ry="75" stroke-width="8"/><ellipse cx="258" cy="200" rx="15" ry="75" stroke-width="8"/>
      <path d="M56 60H74M226 60H244"/>
      <path d="M72 64V168M228 64V168"/>
      <rect x="76" y="62" width="148" height="106" fill="#000" stroke-width="4"/>
      <path d="M62 124H92M208 124H238"/>
      <path d="M72 172H228" stroke-width="12"/>
      <path d="M110 180L100 252M190 180L200 252"/>
      <path d="M86 256H116M184 256H214"/>
    </g>
<defs><linearGradient id="wheelchairWrist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4e0d2" stop-opacity="0"/><stop offset="1" stop-color="#e4e0d2"/></linearGradient></defs>
    <rect class="wheelchair-cushion-front" x="76" y="152" width="148" height="12" rx="5" fill="#3b3f3a" stroke="#aab1a8" stroke-width="3"/>
    <g class="wheelchair-hands"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M77 70V108" stroke="url(#wheelchairWrist)" stroke-width="16"/>
        <g stroke="#050505" stroke-width="12"><path d="M65 118L65 150"/><path d="M73 118L73 153"/><path d="M81 118L81 150"/><path d="M89 118L89 153"/><path d="M77 112V118" stroke-width="30"/></g>
        <g stroke="#e4e0d2" stroke-width="8"><path d="M65 118L65 150"/><path d="M73 118L73 153"/><path d="M81 118L81 150"/><path d="M89 118L89 153"/><path d="M77 112V118" stroke-width="26"/></g>
        <g stroke="#6f6a5a" stroke-width="1.5"><path d="M68 134H86M68 140H86"/></g></g><g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M223 70V108" stroke="url(#wheelchairWrist)" stroke-width="16"/>
        <g stroke="#050505" stroke-width="12"><path d="M235 118L235 150"/><path d="M227 118L227 153"/><path d="M219 118L219 150"/><path d="M211 118L211 153"/><path d="M223 112V118" stroke-width="30"/></g>
        <g stroke="#e4e0d2" stroke-width="8"><path d="M235 118L235 150"/><path d="M227 118L227 153"/><path d="M219 118L219 150"/><path d="M211 118L211 153"/><path d="M223 112V118" stroke-width="26"/></g>
        <g stroke="#6f6a5a" stroke-width="1.5"><path d="M214 134H232M214 140H232"/></g></g></g>
  </svg>`;

  SCARES.push({
    name: 'wheelchair',
    ms: 3400,
    html: () => `<div class="wheelchair-stage">${CHAIR_SIDE}${CHAIR_FRONT}</div>`,
    sound: (output) => {
      const start = now();
      voice(output, { type: 'sawtooth', freq: 46, length: 1.6, volume: 0.18, at: start });
      for (let i = 0; i < 4; i += 1) {
        voice(output, { freq: 1500 + i * 70, to: 2300 + i * 90, length: 0.24, volume: 0.17, at: start + 0.12 + i * 0.42 });
        voice(output, { type: 'triangle', freq: 3000, to: 4600, length: 0.2, volume: 0.04, at: start + 0.14 + i * 0.42 });
      }
      // someone invisible sits: the cushion creaks down, springs groaning
      voice(output, { type: 'sawtooth', freq: 190, to: 95, length: 0.7, volume: 0.1, at: start + 1.95 });
      voice(output, { type: 'square', freq: 520, to: 340, length: 0.5, volume: 0.04, at: start + 2.05 });
      voice(output, { type: 'sawtooth', freq: 130, to: 210, length: 0.35, volume: 0.07, at: start + 2.3 });
      burst(output, 0.5, 0.05, start + 2.0);
      hit(output, start + 2.74);
      burst(output, 0.18, 0.5, start + 2.74);
      tone(output, { type: 'sawtooth', path: [[0, 70], [0.8, 38]], length: 0.9, volume: 0.45, at: start + 2.74 });
    },
  });

  // ---- flatline: the monitor, then the words

  const SWEEP = 1.7;
  const BEATS = [[100, 140, 1], [270, 150, 1], [400, 150, 0.8], [500, 155, 0.6], [580, 150, 0.5], [645, 145, 0.4], [700, 140, 0.35], [745, 90, 0.3], [785, 40, 0.3]];
  const trace = (() => {
    const offsets = [[-40, 0], [-30, -8], [-20, 0], [-8, 6], [0, null], [10, 26], [18, 0], [45, 0], [60, -12], [75, 0]];
    const path = BEATS.map(([x, height, width]) => offsets.map(([dx, dy]) => `L${(x + dx * width).toFixed(1)} ${200 + (dy === null ? -height : dy)}`).join(' ')).join(' ');
    return `M0 200 ${path} L1000 200`;
  })();
  const FLAT_WORDS = { en: 'HE IS AWAKE', de: 'ER IST WACH' };
  const WORD_AT = 1.85;
  const WORD_GAP = 0.07;
  const crackLines = `<path d="M1000 400L1116 381L1239 396L1480 445L1603 438" pathLength="1" style="--i:0"/><path d="M1000 400L1171 429L1286 487L1486 531L1646 644" pathLength="1" style="--i:1"/><path d="M1000 400L1184 553L1299 616L1453 641L1577 700" pathLength="1" style="--i:2"/><path d="M1000 400L1013 524L997 718L961 899L912 1120L865 1364L855 1511" pathLength="1" style="--i:3"/><path d="M1000 400L968 552L935 710L903 909L945 1091" pathLength="1" style="--i:4"/><path d="M1000 400L864 523L777 714L657 869L525 954L341 1031" pathLength="1" style="--i:5"/><path d="M1000 400L876 409L670 468L498 604L366 750L229 861" pathLength="1" style="--i:6"/><path d="M1000 400L826 219L669 93L557 4L361 -98L132 -191L7 -241" pathLength="1" style="--i:7"/><path d="M1000 400L1038 170L1109 36L1175 -114L1350 -297L1409 -421" pathLength="1" style="--i:8"/><path d="M1000 400L972 167L913 27L787 -116L695 -244" pathLength="1" style="--i:9"/><path d="M1000 400L1198 335L1376 318L1621 376L1800 451L1962 502L2125 550" pathLength="1" style="--i:10"/>`;

  SCARES.push({
    name: 'flatline',
    ms: 3400,
    html: () => `<div class="flatline-stage"><div class="flatline-line"><svg viewBox="0 0 1000 400" aria-hidden="true"><path d="${trace}" fill="none" stroke="#4dff7e" stroke-width="5" stroke-linejoin="round"/></svg></div>
      <i class="flatline-flat"></i><p class="flatline-words">${[...say(FLAT_WORDS)].map((letter, i) => `<s style="--at:${(WORD_AT + i * WORD_GAP).toFixed(2)}s;--tilt:${randomRange(-5, 5).toFixed(1)}deg;--lift:${randomRange(-1.5, 1.5).toFixed(1)}vh">${letter === ' ' ? '&nbsp;' : letter}</s>`).join('')}</p>
      <svg class="flatline-crack" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${crackLines}</g></svg></div>`,
    sound: (output) => {
      const start = now();
      BEATS.forEach(([x]) => voice(output, { freq: 1000, length: 0.07, volume: 0.3, at: start + (x / 1000) * SWEEP }));
      voice(output, { freq: 1000, length: 1.4, volume: 0.3, at: start + 1.42 });
      // the line writes: a thin dry scratch for every letter
      [...say(FLAT_WORDS)].forEach((letter, i) => {
        if (letter !== ' ') burst(output, 0.05, 0.14, start + WORD_AT + i * WORD_GAP);
      });
      hit(output, start + 2.8);
      burst(output, 0.2, 0.55, start + 2.8);
      clang(output, start + 2.8, 0.18, 520);
      for (let i = 0; i < 6; i += 1) burst(output, 0.015, 0.4, start + 2.82 + i * 0.035);
    },
  });

  // ---- door: slams shut, the hatch opens, eyes

  const DOOR_EYES = `<svg viewBox="0 0 200 70" aria-hidden="true">
    <g class="door-eye"><ellipse cx="55" cy="36" rx="31" ry="27" fill="#dedbaa"/><path d="M27 40Q40 30 50 31M84 42Q74 32 64 32" stroke="#a02a22" stroke-width="2" fill="none"/><circle class="door-pupil" cx="55" cy="36" r="6" fill="#000"/></g>
    <g class="door-eye"><ellipse cx="145" cy="36" rx="31" ry="27" fill="#dedbaa"/><path d="M173 40Q160 30 150 31M116 42Q126 32 136 32" stroke="#a02a22" stroke-width="2" fill="none"/><circle class="door-pupil" cx="145" cy="36" r="6" fill="#000"/></g>
    <path d="M22 8L86 24M178 8L114 24" stroke="#000" stroke-width="6" stroke-linecap="round"/></svg>`;

  SCARES.push({
    name: 'door',
    ms: 2900,
    html: () => `<div class="door-stage"><div class="door-half door-left"></div><div class="door-half door-right"></div>
      <div class="door-hatch">${DOOR_EYES}<b class="door-flap"></b></div></div>`,
    sound: (output) => {
      const start = now();
      burst(output, 0.3, 0.22, start);
      voice(output, { type: 'sawtooth', freq: 70, to: 40, length: 0.34, volume: 0.3, at: start });
      hit(output, start + 0.34);
      clang(output, start + 0.34, 0.3);
      clang(output, start + 1.42, 0.09, 520);
      voice(output, { type: 'sawtooth', freq: 90, to: 140, length: 0.4, volume: 0.1, at: start + 1.4 });
      clang(output, start + 2.4, 0.2, 380);
    },
  });
}

// Group b, the funny ones: invoice, teeth, bedpan, clown.

{
  const say = (both) => both[language];
  const now = () => audio.context.currentTime;

  /** One oscillator with its own pitch and loudness curves, both [[seconds, value], ...]. */
  function voice(output, { type = 'sine', pitch, level, at = now(), filter, vibrato }) {
    const { context } = audio;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    pitch.forEach(([seconds, hertz], index) => {
      if (index === 0) oscillator.frequency.setValueAtTime(hertz, at + seconds);
      else oscillator.frequency.exponentialRampToValueAtTime(hertz, at + seconds);
    });
    level.forEach(([seconds, volume], index) => {
      if (index === 0) gain.gain.setValueAtTime(volume, at + seconds);
      else gain.gain.linearRampToValueAtTime(volume, at + seconds);
    });
    const end = at + level[level.length - 1][0] + 0.02;
    let chain = oscillator;
    if (filter) {
      const biquad = context.createBiquadFilter();
      [biquad.type, biquad.frequency.value, biquad.Q.value] = filter;
      chain = chain.connect(biquad);
    }
    chain.connect(gain).connect(output);
    oscillator.start(at);
    oscillator.stop(end);
    if (vibrato) {
      const shaker = context.createOscillator();
      const depth = context.createGain();
      shaker.frequency.value = vibrato[0];
      depth.gain.value = vibrato[1];
      shaker.connect(depth).connect(oscillator.detune);
      shaker.start(at);
      shaker.stop(end);
    }
  }

  /** Filtered noise: *level* is [[seconds, volume], ...], *sweep* is [type, Q, [[seconds, Hz], ...]]. */
  function rush(output, { at = now(), level, sweep }) {
    const { context, hiss } = audio;
    const source = hissSource(context, hiss);
    const gain = context.createGain();
    level.forEach(([seconds, volume], index) => {
      if (index === 0) gain.gain.setValueAtTime(volume, at + seconds);
      else gain.gain.linearRampToValueAtTime(volume, at + seconds);
    });
    let chain = source;
    if (sweep) {
      const biquad = context.createBiquadFilter();
      biquad.type = sweep[0];
      biquad.Q.value = sweep[1];
      sweep[2].forEach(([seconds, hertz], index) => {
        if (index === 0) biquad.frequency.setValueAtTime(hertz, at + seconds);
        else biquad.frequency.exponentialRampToValueAtTime(hertz, at + seconds);
      });
      chain = chain.connect(biquad);
    }
    chain.connect(gain).connect(output);
    const end = at + level[level.length - 1][0] + 0.02;
    source.start(at, Math.random());
    source.stop(end);
  }

  /** A struck-metal ring: inharmonic partials that each die away at their own speed. */
  function ring(output, base, volume, at, decay = 1) {
    [[1, 1], [2.76, 0.6], [5.4, 0.4], [8.93, 0.25]].forEach(([ratio, share], index) => {
      const life = decay / (1 + index * 0.8);
      voice(output, { pitch: [[0, base * ratio], [life, base * ratio * 0.995]], level: [[0, volume * share], [life, 0]], at });
    });
  }

  // ---- invoice

  const INVOICE = {
    title: { en: 'Invoice', de: 'Rechnung' },
    office: { en: 'Billing office, Zürich', de: 'Rechnungsstelle, Zürich' },
    patient: { en: 'Patient: you', de: 'Patient: Sie' },
    first: { en: 'Fright treatment', de: 'Schreckbehandlung' },
    second: { en: 'Screaming surcharge', de: 'Schreizuschlag' },
    total: { en: 'Total', de: 'Total' },
    note: { en: 'Not covered by your insurance.', de: 'Von Ihrer Versicherung nicht gedeckt.' },
    stamp: { en: ['PAID?', 'NO.'], de: ['BEZAHLT?', 'NEIN.'] },
  };

  SCARES.push({
    name: 'invoice',
    ms: 2800,
    html: () => {
      const [ask, answer] = say(INVOICE.stamp);
      return `<div class="invoice-fly"><div class="invoice-paper">
        <div class="invoice-head"><span class="invoice-cross"></span><div><h3>${say(INVOICE.title)}</h3><p>Blackthorne Institute</p><p>${say(INVOICE.office)}</p></div><em>Nr. 0666</em></div>
        <p class="invoice-patient">${say(INVOICE.patient)}</p>
        <p class="invoice-row"><span>${say(INVOICE.first)}</span><span>CHF 450.--</span></p>
        <p class="invoice-row"><span>${say(INVOICE.second)}</span><span>CHF 80.--</span></p>
        <p class="invoice-row invoice-total"><span>${say(INVOICE.total)}</span><span>CHF 530.--</span></p>
        <p class="invoice-note">${say(INVOICE.note)}</p>
        <div class="invoice-foot"><span class="invoice-qr"></span></div>
        <div class="invoice-stamp"><span>${ask}</span><span>${answer}</span></div>
      </div></div>`;
    },
    sound: (output) => {
      const start = now();
      // paper whoosh, then the till: drawer thunk, bell, coins
      rush(output, { at: start, level: [[0, 0], [0.12, 0.25], [0.4, 0]], sweep: ['bandpass', 1, [[0, 500], [0.35, 3200]]] });
      voice(output, { pitch: [[0, 220], [0.12, 70]], level: [[0, 0.8], [0.14, 0]], at: start + 0.02 });
      rush(output, { at: start + 0.02, level: [[0, 0.5], [0.07, 0]], sweep: ['highpass', 1, [[0, 2500]]] });
      ring(output, 2349, 0.34, start + 0.16, 1.2);
      voice(output, { pitch: [[0, 3520], [1, 3500]], level: [[0, 0.3], [1, 0]], at: start + 0.16 });
      for (let i = 0; i < 7; i += 1) {
        voice(output, { type: 'triangle', pitch: [[0, randomRange(3200, 5200)], [0.05, randomRange(2600, 4000)]], level: [[0, 0.12], [0.06, 0]], at: start + 0.42 + i * 0.06 + randomRange(0, 0.03) });
      }
      // the stamp
      voice(output, { pitch: [[0, 190], [0.25, 45]], level: [[0, 1], [0.28, 0]], at: start + 1.17 });
      rush(output, { at: start + 1.17, level: [[0, 0.7], [0.1, 0]], sweep: ['lowpass', 1, [[0, 1800]]] });
    },
  });

  // ---- teeth

  const TEETH = (() => {
    const row = (y, height) => Array.from({ length: 8 }, (_, i) => {
      const lift = i === 3 || i === 4 ? 6 : 0;
      return `<rect x="${40 + i * 22.5}" y="${y - (y < 100 ? 0 : lift)}" width="22" height="${height + lift}" rx="9" fill="#f8f4e4" stroke="#b9b196" stroke-width="2.5"/>`;
    }).join('');
    return `<svg class="teeth-svg" viewBox="0 0 280 240" aria-hidden="true">
      <g class="teeth-key"><path d="M226 112h22" stroke="#7d848a" stroke-width="8"/><ellipse cx="256" cy="94" rx="14" ry="19" fill="#d5dade" stroke="#5f666c" stroke-width="3.5"/><ellipse cx="256" cy="130" rx="14" ry="19" fill="#d5dade" stroke="#5f666c" stroke-width="3.5"/></g>
      <path d="M32 70h196v110H32z" fill="#3b0b0e"/>
      <ellipse cx="130" cy="156" rx="58" ry="18" fill="#c85a5a"/>
      <path d="M80 196v18M180 196v18" stroke="#444" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="76" cy="224" rx="34" ry="13" fill="#ef7d12" stroke="#7a3d08" stroke-width="3.5"/>
      <ellipse cx="184" cy="224" rx="34" ry="13" fill="#ef7d12" stroke="#7a3d08" stroke-width="3.5"/>
      <g class="teeth-bottom">${row(122, 38)}<path d="M28 158H232V178Q232 198 130 198T28 178Z" fill="#e58a86" stroke="#b25c5a" stroke-width="3.5"/></g>
      <g class="teeth-top">${row(78, 44)}<path d="M28 86V64Q28 8 130 8T232 64V86Z" fill="#e58a86" stroke="#b25c5a" stroke-width="3.5"/></g>
    </svg>`;
  })();

  SCARES.push({
    name: 'teeth',
    ms: 3200,
    html: () => `<div class="teeth-run"><div class="teeth-hop"><div class="teeth-grow">${TEETH}</div></div></div>`,
    sound: (output) => {
      const start = now();
      // winding up: a ratchet whose clicks get slower as the spring tightens
      for (let i = 0; i < 12; i += 1) {
        voice(output, { type: 'square', pitch: [[0, 1500], [0.02, 800]], level: [[0, 0.22], [0.025, 0]], at: start + i * 0.044 + i * i * 0.0009 });
      }
      // chattering and hopping
      for (let i = 0; i < 10; i += 1) {
        const at = start + 0.55 + i * 0.13;
        rush(output, { at, level: [[0, 0.55], [0.03, 0]], sweep: ['highpass', 1, [[0, 1800]]] });
        voice(output, { type: 'square', pitch: [[0, 1100], [0.03, 600]], level: [[0, 0.12], [0.035, 0]], at });
      }
      for (let i = 1; i <= 5; i += 1) {
        voice(output, { pitch: [[0, 210], [0.1, 90]], level: [[0, 0.5], [0.1, 0]], at: start + 0.55 + i * 0.26 - 0.04 });
      }
      // swelling, then the one big chomp
      voice(output, { type: 'triangle', pitch: [[0, 120], [0.5, 420]], level: [[0, 0], [0.45, 0.35], [0.5, 0]], at: start + 2.0 });
      voice(output, { pitch: [[0, 150], [0.4, 30]], level: [[0, 0.75], [0.45, 0]], at: start + 2.5 });
      rush(output, { at: start + 2.5, level: [[0, 0.7], [0.12, 0]], sweep: ['highpass', 1, [[0, 1200]]] });
      voice(output, { type: 'square', pitch: [[0, 1000], [0.12, 300]], level: [[0, 0.3], [0.12, 0]], at: start + 2.5 });
    },
  });
}

// Group c: the screen itself goes wrong. crash, rip, eye, letters, lockdown.
{
  const say = (both) => both[language];
  const escapeHtml = (text) => text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  const soon = (seconds) => audio.context.currentTime + seconds;

  // ---- Sound helpers of this group

  let noiseCache;
  const noiseSource = () => {
    const { context } = audio;
    if (noiseCache?.context !== context) {
      const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
      noiseCache = { context, buffer };
    }
    const source = context.createBufferSource();
    source.buffer = noiseCache.buffer;
    source.loop = true;
    return source;
  };

  /** Filtered noise. *freq* is [[seconds, Hz], ...], *level* is [[seconds, gain], ...] and ends the sound. */
  const rush = (output, { at = soon(0), type = 'bandpass', freq, q = 1, level }) => {
    const { context } = audio;
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const source = noiseSource();
    filter.type = type;
    filter.Q.value = q;
    freq.forEach(([seconds, hz], index) => {
      if (index === 0) filter.frequency.setValueAtTime(hz, at);
      else filter.frequency.exponentialRampToValueAtTime(hz, at + seconds);
    });
    gain.gain.setValueAtTime(0, at);
    level.forEach(([seconds, value]) => gain.gain.linearRampToValueAtTime(value, at + seconds));
    const end = at + level[level.length - 1][0];
    source.connect(filter).connect(gain).connect(output);
    source.start(at, Math.random());
    source.stop(end + 0.05);
  };

  /** A steady note with no decay, for sirens and hums. */
  const beep = (output, { at = soon(0), type = 'square', freq, length, volume }) => {
    const { context } = audio;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq[0], at);
    if (freq[1]) oscillator.frequency.linearRampToValueAtTime(freq[1], at + length);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.012);
    gain.gain.setValueAtTime(volume, at + length - 0.02);
    gain.gain.linearRampToValueAtTime(0, at + length);
    oscillator.connect(gain).connect(output);
    oscillator.start(at);
    oscillator.stop(at + length + 0.02);
  };

  // ---- crash: a fake blue screen, then something looks out of it

  const CRASH = {
    en: { title: 'PATIENT.EXE has stopped responding.', sub: 'Your soul is being uploaded...', code: 'Stop code: NO_EXIT_FOUND' },
    de: { title: 'PATIENT.EXE reagiert nicht mehr.', sub: 'Ihre Seele wird hochgeladen...', code: 'Stoppcode: KEIN_AUSGANG_GEFUNDEN' },
  };
  const CRASH_HELLO = { en: 'HELLO. I CAN SEE YOU.', de: 'HALLO. ICH SEHE SIE.' };
  const HELLO_AT = 2.05;
  const HELLO_GAP = 0.045;
  const crashLetters = (line) => line.split(' ').map((word) => `<span class="crash-word">${[...word]
    .map((letter) => `<i style="--dx:${randomRange(-9, 9).toFixed(1)}vw;--r:${randomRange(-90, 90).toFixed(0)}deg;--d:${randomRange(0, 0.55).toFixed(2)}s">${escapeHtml(letter)}</i>`).join('')}</span>`).join(' ');

  SCARES.push({
    name: 'crash',
    ms: 3300,
    html: () => {
      const text = say(CRASH);
      return `<div class="crash-screen">
        <div class="crash-face">${crashLetters(':(')}</div>
        <p class="crash-title">${crashLetters(text.title)}</p>
        <p class="crash-sub">${crashLetters(text.sub)}</p>
        <div class="crash-row"><div class="crash-bar crash-drop" style="--dx:-3vw;--r:-5deg"><u></u></div><div class="crash-pct" style="--dx:4vw;--r:12deg"></div></div>
        <p class="crash-code">${crashLetters(text.code)}</p>
      </div>
      <div class="crash-term"><p class="crash-boot">C:\\PATIENT&gt; reboot</p><p class="crash-hello">${[...say(CRASH_HELLO)].map((letter, i) => `<s style="--at:${(HELLO_AT + i * HELLO_GAP).toFixed(3)}s">${letter === ' ' ? '&nbsp;' : letter}</s>`).join('')}<u></u></p></div>`;
    },
    sound: (output) => {
      // Error ding-dong, the bar ticking up, a stuck buzz when it freezes, then a reboot and a cold keyboard.
      beep(output, { at: soon(0), freq: [880], length: 0.13, volume: 0.1 });
      beep(output, { at: soon(0.14), freq: [660], length: 0.2, volume: 0.1 });
      for (let i = 0; i < 9; i += 1) burst(output, 0.02, 0.12, soon(0.08 + i * 0.1));
      beep(output, { at: soon(0.95), freq: [330], length: 0.55, volume: 0.06 });
      rush(output, { at: soon(1.9), freq: [[0, 6000], [0.15, 800]], q: 1, level: [[0, 0.3], [0.15, 0]] });
      tone(output, { path: [[0, 52], [1.2, 50]], length: 1.25, volume: 0.25, at: soon(1.95) });
      [...say(CRASH_HELLO)].forEach((letter, i) => {
        if (letter === ' ') return;
        const at = soon(HELLO_AT + i * HELLO_GAP);
        burst(output, 0.012, 0.22, at);
        beep(output, { at, type: 'square', freq: [1700, 900], length: 0.03, volume: 0.04 });
      });
      tone(output, { path: [[0, 120], [0.5, 40]], length: 0.6, volume: 0.95, at: soon(3.1) });
      tone(output, { type: 'sawtooth', path: [[0, 900], [0.3, 80]], length: 0.3, volume: 0.25, at: soon(3.1) });
      burst(output, 0.25, 0.9, soon(3.1));
    },
  });

  // ---- rip: the question sheet tears down a jagged line

  const ripFigure = '<svg viewBox="0 0 60 100" aria-hidden="true"><g fill="#000"><ellipse cx="30" cy="17" rx="6.4" ry="9" transform="rotate(-5 30 17)"/><path d="M22 24Q30 31 38 24L43 30Q53 34 54 54L57 100H3L6 54Q7 34 17 30Z"/><path d="M8 46Q1 66 3 88L1 98 6 92 8 99 11 90Q12 66 15 50Z"/><path d="M52 46Q59 66 57 88L59 98 54 92 52 99 49 90Q48 66 45 50Z"/></g><g class="rip-eyes" fill="#fff"><ellipse cx="27.2" cy="16.2" rx="2.4" ry="1.3" transform="rotate(14 27.2 16.2)"/><ellipse cx="33" cy="16.2" rx="2.4" ry="1.3" transform="rotate(-14 33 16.2)"/></g></svg>';

  SCARES.push({
    name: 'rip',
    ms: 2800,
    html: () => {
      const sheet = document.querySelector('.sheet');
      if (!sheet) return '';
      const box = sheet.getBoundingClientRect();
      const place = `left:${box.left}px;top:${box.top}px;width:${box.width}px;height:${box.height}px`;
      const copy = sheet.outerHTML.replace(/ id="[^"]*"/g, '');
      const edge = Array.from({ length: 27 }, (_, i) => {
        const y = (i / 26) * 100;
        const wander = Math.sin(i * 0.7) * 3;
        return [50 + wander + (i % 2 ? -1 : 1) * randomRange(1, 3.6), y];
      });
      const left = `polygon(0 0,${edge.map(([x, y]) => `${(x + 0.4).toFixed(1)}% ${y.toFixed(1)}%`).join(',')},0 100%)`;
      const right = `polygon(${edge.map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(',')},100% 100%,100% 0)`;
      return `<div class="rip-void" style="${place}"><div class="rip-figure">${ripFigure}</div></div>
        <div class="rip-piece rip-left" style="${place}"><div class="rip-clip" style="clip-path:${left}">${copy}</div></div>
        <div class="rip-piece rip-right" style="${place}"><div class="rip-clip" style="clip-path:${right}">${copy}</div></div>`;
    },
    sound: (output) => {
      // Real paper tearing: crackling noise made of many tiny bursts.
      const crackle = (length, peak) => {
        const level = [[0, 0]];
        for (let t = 0.01; t < length; t += randomRange(0.006, 0.02)) {
          const shape = Math.min(1, t / 0.08) * Math.min(1, (length - t) / 0.15);
          level.push([t, peak * shape * randomRange(0.25, 1)]);
        }
        level.push([length, 0]);
        return level;
      };
      rush(output, { freq: [[0, 1500], [0.6, 3600]], q: 0.6, level: crackle(0.62, 0.7), at: soon(0.02) });
      rush(output, { freq: [[0, 320], [0.6, 700]], q: 0.5, level: crackle(0.62, 0.45), at: soon(0.02) });
      rush(output, { type: 'highpass', freq: [[0, 5000], [0.6, 7000]], q: 0.5, level: crackle(0.62, 0.25), at: soon(0.02) });
      // It stands there: a thud, a low drone, then the halves slam back.
      hit(output, soon(0.5));
      tone(output, { type: 'sawtooth', path: [[0, 62], [1.4, 50]], length: 1.5, volume: 0.22, wobble: [4, 30], at: soon(0.55) });
      tone(output, { path: [[0, 34], [1.4, 30]], length: 1.5, volume: 0.5, at: soon(0.55) });
      rush(output, { freq: [[0, 2500], [0.2, 1200]], q: 0.7, level: [[0, 0], [0.01, 0.7], [0.12, 0.4], [0.22, 0]], at: soon(2.0) });
      hit(output, soon(2.2));
    },
  });

  // ---- eye: one enormous bloodshot eye

  const EYE_CLOSED = 'M10 150C90 150 310 150 390 150C310 150 90 150 10 150Z';
  const EYE_OPEN = 'M10 150C90-10 310-10 390 150C310 310 90 310 10 150Z';
  const eyeVeins = [
    'M12 150C50 142 80 160 120 146M52 148C70 120 78 112 96 96M70 152C88 176 98 190 112 214M104 150C112 134 128 130 134 116',
    'M388 150C350 140 320 162 282 146M346 148C330 122 322 112 304 96M326 152C310 178 300 192 288 214M296 150C288 132 272 128 266 114',
    'M120 60C140 80 150 96 162 110M280 56C262 78 252 96 240 110M150 246C158 220 166 204 172 196M250 244C244 218 236 204 230 196',
    'M40 120C60 100 70 104 84 90M360 120C340 100 330 104 316 90M44 182C62 196 74 192 90 206M356 182C338 196 326 192 310 206',
  ];

  SCARES.push({
    name: 'eye',
    ms: 3200,
    html: () => `<svg class="eye-svg" viewBox="0 0 400 300" aria-hidden="true">
      <defs>
        <clipPath id="eye-clip"><path class="eye-lid" d="${EYE_CLOSED}"/></clipPath>
        <radialGradient id="eye-white" cx=".5" cy=".5" r=".62"><stop offset=".5" stop-color="#efe3d6"/><stop offset=".8" stop-color="#d98d80"/><stop offset="1" stop-color="#6e140f"/></radialGradient>
        <radialGradient id="eye-iris" cx=".5" cy=".5" r=".5"><stop offset=".3" stop-color="#d6c13a"/><stop offset=".65" stop-color="#8d7d1b"/><stop offset=".92" stop-color="#3d3208"/><stop offset="1" stop-color="#150f02"/></radialGradient>
        <linearGradient id="eye-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>
      </defs>
      <g clip-path="url(#eye-clip)">
        <rect width="400" height="300" fill="url(#eye-white)"/>
        <g fill="none" stroke="#b3140f" stroke-linecap="round" stroke-width="2.6" opacity=".85">${eyeVeins.map((d) => `<path d="${d}"/>`).join('')}</g>
        <g class="eye-look">
          <circle cx="200" cy="150" r="88" fill="url(#eye-iris)"/>
          <g stroke="#2c2405" stroke-width="1.5" opacity=".6">${Array.from({ length: 24 }, (_, i) => `<path d="M200 150L${(200 + 88 * Math.cos(i * 0.2618)).toFixed(1)} ${(150 + 88 * Math.sin(i * 0.2618)).toFixed(1)}"/>`).join('')}</g>
          <circle cx="200" cy="150" r="88" fill="none" stroke="#120d01" stroke-width="7"/>
          <circle class="eye-pupil" cx="200" cy="150" r="44" fill="#030303"/>
        </g>
        <ellipse cx="168" cy="108" rx="20" ry="12" fill="#fff" opacity=".85" transform="rotate(-25 168 108)"/>
        <rect width="400" height="300" fill="url(#eye-shade)"/>
      </g>
      <path class="eye-lid" d="${EYE_CLOSED}" fill="none" stroke="#150a08" stroke-width="9" stroke-linejoin="round"/>
    </svg>`,
    sound: (output) => {
      // The lid peels open wetly, the pupil snaps, the eye ticks about, then a deep rumble.
      tone(output, { path: [[0, 90], [0.3, 48]], length: 0.35, volume: 0.8 });
      rush(output, { freq: [[0, 500], [0.25, 2600]], q: 1.4, level: [[0, 0], [0.04, 0.5], [0.25, 0.1], [0.3, 0]] });
      hit(output, soon(0.46));
      [0.8, 1.0, 1.2, 1.45, 1.7].forEach((seconds) => burst(output, 0.015, 0.4, soon(seconds)));
      tone(output, { path: [[0, 70], [0.2, 44]], length: 0.25, volume: 0.6, at: soon(1.88) });
      rush(output, { freq: [[0, 900], [0.2, 400]], q: 2, level: [[0, 0], [0.03, 0.3], [0.2, 0]], at: soon(1.9) });
      tone(output, { type: 'sawtooth', path: [[0, 41], [1.7, 31]], length: 1.8, volume: 0.55, wobble: [6, 50], at: soon(1.15) });
      tone(output, { path: [[0, 33], [1.7, 28]], length: 1.8, volume: 0.8, at: soon(1.15) });
    },
  });

  // ---- lockdown: red beacons, a siren and steel shutters coming down

  const LOCKDOWN = {
    en: { top: 'PATIENT ESCAPED', main: 'LOCKDOWN' },
    de: { top: 'PATIENT ENTWICHEN', main: 'ABRIEGELUNG' },
  };

  SCARES.push({
    name: 'lockdown',
    ms: 3400,
    html: () => {
      const text = say(LOCKDOWN);
      const slats = Array.from({ length: 10 }, (_, i) => `<span style="--i:${i}"></span>`).join('');
      return `<div class="lockdown-slats">${slats}</div>
        <div class="lockdown-beacon lockdown-left"><s></s></div>
        <div class="lockdown-beacon lockdown-right"><s></s></div>
        <div class="lockdown-banner" style="--len:${text.main.length}"><span>${text.top}</span><strong>${text.main}</strong></div>`;
    },
    sound: (output) => {
      tone(output, { path: [[0, 120], [0.3, 50]], length: 0.35, volume: 0.6 });
      // Two-tone siren.
      for (let i = 0; i < 7; i += 1) {
        const at = soon(i * 0.48);
        const high = i % 2 === 0;
        beep(output, { at, type: 'sawtooth', freq: high ? [740] : [555], length: 0.46, volume: 0.17 });
        beep(output, { at, type: 'square', freq: high ? [742] : [557.5], length: 0.46, volume: 0.05 });
      }
      // Each slat clangs as it lands.
      for (let i = 0; i < 10; i += 1) {
        const at = soon(1.04 + i * 0.17);
        burst(output, 0.03, 0.45, at);
        tone(output, { path: [[0, 90], [0.12, 55]], length: 0.14, volume: 0.45, at });
        tone(output, { type: 'triangle', path: [[0, 1180], [0.35, 1150]], length: 0.38, volume: 0.07, at });
        tone(output, { type: 'triangle', path: [[0, 2090], [0.3, 2060]], length: 0.3, volume: 0.04, at });
      }
    },
  });
}

{
  const say = (both) => both[language];
  const rand = randomRange;
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const f1 = (n) => +n.toFixed(1);

  /** Filtered noise: *path* is [[seconds, Hz], ...] for the filter; *start* is seconds from now. */
  const rush = (output, { type = 'bandpass', path, q = 1, length, volume, start = 0, attack = 0.01, hold = 0.5 }) => {
    const { context, hiss } = audio;
    const when = context.currentTime + start;
    const noise = hissSource(context, hiss);
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    path.forEach(([seconds, hertz], index) => {
      if (index === 0) filter.frequency.setValueAtTime(hertz, when);
      else filter.frequency.exponentialRampToValueAtTime(hertz, when + seconds);
    });
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(volume, when + attack);
    gain.gain.setValueAtTime(volume, when + length * hold);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + length);
    noise.connect(filter).connect(gain).connect(output);
    noise.start(when, Math.random());
    noise.stop(when + length);
  };
  const note = (output, options, start = 0) => tone(output, { ...options, at: audio.context.currentTime + start });
  const thud = (output, start = 0, volume = 1) => {
    note(output, { path: [[0, 140], [0.5, 36]], length: 0.6, volume }, start);
    subDrop(output, audio.context.currentTime + start, volume * 0.9);
  };

  const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  /** A gaunt dead face centred on (0, 326), about 84 wide and 116 tall. Needs the #ghoulSkin gradient. */
  const GHOUL_DEFS = '<radialGradient id="ghoulSkin" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#d6d9c9"/><stop offset=".55" stop-color="#a9ad9d"/><stop offset="1" stop-color="#3f433a"/></radialGradient>';
  const ghoulFace = () => {
    const teeth = Array.from({ length: 9 }, (_, i) => `<rect x="${-18 + i * 4.3}" y="365" width="3.4" height="${7 + (i % 3) * 2}" fill="#d4d7c4"/>`).join('')
      + Array.from({ length: 5 }, (_, i) => `<rect x="${-10 + i * 4.6}" y="${400 - (i % 2) * 2}" width="3.2" height="9" fill="#a9ac9b"/>`).join('');
    return `<ellipse cx="0" cy="326" rx="42" ry="58" fill="url(#ghoulSkin)"/>
      <path d="M-46 322C-54 240 54 240 46 322C42 284 28 270 0 270C-28 270 -42 284 -46 322z" fill="#050607"/>
      <path d="M-30 300Q-8 290 -2 306" stroke="rgba(0,0,0,.35)" stroke-width="3" fill="none"/>
      <path d="M-35 316Q-19 300 -3 318Q-5 346 -20 351Q-38 343 -35 316z" fill="#010101"/>
      <path d="M35 316Q19 300 3 318Q5 346 20 351Q38 343 35 316z" fill="#010101"/>
      <circle cx="-16" cy="332" r="1.9" fill="#d9dccb"/><circle cx="17" cy="332" r="1.9" fill="#d9dccb"/>
      <path d="M-33 354Q-27 376 -10 386M33 354Q27 376 10 386" stroke="rgba(0,0,0,.5)" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M-5 346L-3 363M5 346L3 363" stroke="#14160f" stroke-width="3" stroke-linecap="round"/>
      <path d="M-25 367Q0 357 25 367Q30 394 11 413Q0 419 -11 413Q-30 394 -25 367z" fill="#010101"/>${teeth}
      <path d="M-46 322Q-62 380 -52 440M-37 330Q-48 392 -36 452M46 322Q60 376 52 436M37 330Q50 396 36 456M-18 280Q-30 330 -24 372" fill="none" stroke="#050607" stroke-width="6" stroke-linecap="round"/>`;
  };

  // ---- syringe: a small 3D renderer draws the thing in perspective, as SVG quads.
  const syringeScene = () => {
    const F = 1300;
    const tip = [0.06, 0.04, 0.62];
    const u = norm([-0.2, -0.12, 1]);
    const e1 = norm(cross(u, [0, 1, 0]));
    const e2 = cross(u, e1);
    const light = norm([-0.5, -0.85, -0.45]);
    const point = (s, x = 0, y = 0) => [0, 1, 2].map((k) => tip[k] + s * u[k] + x * e1[k] + y * e2[k]);
    const screen = (p) => [800 + (F * p[0]) / p[2], 450 + (F * p[1]) / p[2]];
    const xy = (p) => screen(p).map(f1).join(',');
    const radius = (r, th) => (Array.isArray(r) ? [r[0] * Math.cos(th), r[1] * Math.sin(th)] : [r * Math.cos(th), r * Math.sin(th)]);
    const ring = (s, r, count, cut = 0, phase = 0) => Array.from({ length: count }, (_, i) => {
      const th = (i / count) * Math.PI * 2;
      const [x, y] = radius(r, th);
      return { th, p: point(s + cut * (1 + Math.cos(th - phase)) / 2, x, y) };
    });
    const colour = (base, n, p, spec, alpha = 1) => {
      const v = norm(p.map((x) => -x));
      const diff = Math.max(0, dot(n, light));
      const h = norm(light.map((x, k) => x + v[k]));
      const glint = Math.pow(Math.max(0, dot(n, h)), 28) * spec * 255;
      const c = base.map((b) => Math.min(255, Math.round(b * (0.14 + 0.95 * diff) + glint)));
      return alpha < 1 ? `rgba(${c},${alpha})` : `rgb(${c})`;
    };
    const COUNT = 44;
    /** The skin of a tube between s0 and s1. side: 'front', 'back' or 'both'. */
    const tube = ({ s0, s1, r0, r1 = r0, base, spec = 0.4, alpha = 1, side = 'front', cut = 0, phase = 0 }) => {
      const a = ring(s0, r0, COUNT, cut, phase);
      const b = ring(s1, r1, COUNT);
      const quads = [];
      for (let i = 0; i < COUNT; i += 1) {
        const j = (i + 1) % COUNT;
        const th = (a[i].th + a[j].th) / 2 + (j === 0 ? Math.PI / COUNT : 0);
        const slope = typeof r0 === 'number' ? r1 - r0 : 0;
        const n = norm(e1.map((x, k) => (Math.cos(th) * x + Math.sin(th) * e2[k]) * (s1 - s0) - u[k] * slope));
        const mid = a[i].p.map((x, k) => (x + b[i].p[k]) / 2);
        const front = dot(n, mid.map((x) => -x)) > 0;
        if ((side === 'front' && !front) || (side === 'back' && front)) continue;
        const shade = front ? n : n.map((x) => -x);
        const fill = colour(base, shade, mid, spec, alpha);
        const edge = alpha < 1 ? '' : ` stroke="${fill}" stroke-width=".8"`;
        quads.push(`<path d="M${xy(a[i].p)}L${xy(a[j].p)}L${xy(b[j].p)}L${xy(b[i].p)}z" fill="${fill}"${edge}/>`);
      }
      return quads.join('');
    };
    /** A flat cap at s, facing along *dir* (+1 away from the needle, -1 toward it). */
    const cap = ({ s, r, base, dir, spec = 0.3, alpha = 1, cut = 0, phase = 0, n: normal }) => {
      const pts = ring(s, r, COUNT, cut, phase).map((q) => `${xy(q.p)}`).join('L');
      const n = normal ?? u.map((x) => x * -dir);
      return `<path d="M${pts}z" fill="${colour(base, n, point(s), spec, alpha)}"/>`;
    };

    const HUB = 1.55;
    const BARREL = 1.8;
    const FLANGE = 5.1;
    const STOP = 4.3;
    const PUSHED = 2.15;
    const bevel = 0.3;
    const phase = 0.9;
    const bevelNormal = norm(u.map((x, k) => -x + ((bevel / (2 * 0.032)) * (Math.cos(phase) * e1[k] + Math.sin(phase) * e2[k]))));
    const steel = [196, 206, 212];

    const lumen = (() => {
      const pts = Array.from({ length: 16 }, (_, i) => {
        const th = (i / 16) * Math.PI * 2;
        return xy(point(bevel * (1 + 0.45 * Math.cos(th - phase)) / 2 - 0.004, 0.45 * 0.032 * Math.cos(th), 0.45 * 0.032 * Math.sin(th)));
      });
      return `<path d="M${pts.join('L')}z" fill="#07090a"/>`;
    })();
    const slices = 14;
    const fluid = Array.from({ length: slices }, (_, i) => {
      const s0 = BARREL + 0.03 + ((STOP - BARREL - 0.03) * i) / slices;
      const s1 = BARREL + 0.03 + ((STOP - BARREL - 0.03) * (i + 1)) / slices;
      const pts = [...ring(s0, 0.37, 22), ...ring(s1, 0.37, 22)].map((q) => screen(q.p));
      const hull = convexHull(pts);
      const gone = (0.62 * (STOP - s1)) / (STOP - PUSHED);
      return `<path class="syringe-fluid" style="--gone:${gone.toFixed(3)}s" d="M${hull.map((q) => q.map(f1).join(',')).join('L')}z" fill="#4d0608"/>`;
    }).join('');

    const dx = screen(point(7.7))[0] - screen(point(7.7 - (STOP - PUSHED)))[0];
    const dy = screen(point(7.7))[1] - screen(point(7.7 - (STOP - PUSHED)))[1];
    const plungerBack = tube({ s0: 4.4, s1: 7.7, r0: 0.11, base: [190, 196, 190], spec: 0.2 })
      + cap({ s: 7.75, r: 0.62, base: [200, 205, 198], dir: -1, spec: 0.5 })
      + tube({ s0: 7.7, s1: 7.82, r0: 0.62, base: [170, 176, 170], spec: 0.3 });
    const stopper = tube({ s0: STOP, s1: STOP + 0.4, r0: 0.385, base: [26, 26, 28], spec: 0.5 })
      + cap({ s: STOP, r: 0.385, base: [30, 30, 32], dir: -1, spec: 0.6 });
    const ticks = [2.4, 3.0, 3.6, 4.2, 4.8].map((s) => `<path d="M${ring(s, 0.43, 30).slice(8, 15).map((q) => xy(q.p)).join('L')}" fill="none" stroke="rgba(10,14,14,.6)" stroke-width="2"/>`).join('');

    const body = `
      <g class="syringe-plunger" style="--dx:${f1(dx)}px;--dy:${f1(dy)}px">${plungerBack}</g>
      ${tube({ s0: BARREL, s1: FLANGE, r0: 0.43, base: [120, 150, 150], spec: 0.5, alpha: 0.28, side: 'back' })}
      ${tube({ s0: FLANGE - 0.12, s1: FLANGE, r0: [0.95, 0.3], base: [172, 190, 188], spec: 0.4, side: 'both' })}
      ${cap({ s: FLANGE - 0.12, r: [0.95, 0.3], base: [180, 196, 194], dir: -1, spec: 0.5 })}
      ${fluid}
      <g class="syringe-plunger" style="--dx:${f1(dx)}px;--dy:${f1(dy)}px">${stopper}</g>
      ${tube({ s0: BARREL, s1: FLANGE - 0.12, r0: 0.43, base: [210, 236, 234], spec: 0.9, alpha: 0.45 })}
      ${ticks}
      ${cap({ s: BARREL, r: 0.43, base: [210, 230, 228], dir: -1, spec: 0.4, alpha: 0.35 })}
      <path d="M${ring(BARREL, 0.43, 44).map((q) => xy(q.p)).join('L')}z" fill="none" stroke="rgba(225,245,245,.55)" stroke-width="3"/>
      ${tube({ s0: HUB, s1: BARREL, r0: 0.045, r1: 0.2, base: [150, 190, 210], spec: 0.7 })}
      ${tube({ s0: BARREL - 0.1, s1: BARREL, r0: 0.23, base: [140, 170, 190], spec: 0.5 })}
      ${tube({ s0: 0, s1: HUB, r0: 0.032, base: steel, spec: 1, cut: bevel, phase })}
      ${cap({ s: 0, r: 0.032, base: [150, 160, 168], dir: -1, spec: 0.6, cut: bevel, phase, n: bevelNormal })}
      ${lumen}`;
    const [tx, ty] = screen(tip);
    return { body, tx, ty };
  };

  /** Convex hull (monotone chain) of [x, y] points. */
  function convexHull(points) {
    const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const turn = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = (list) => {
      const out = [];
      list.forEach((q) => {
        while (out.length > 1 && turn(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop();
        out.push(q);
      });
      out.pop();
      return out;
    };
    return [...half(pts), ...half([...pts].reverse())];
  }

  /** A wet, irregular blob as a smooth closed path. */
  const blobPath = (x, y, r, spiky = 0.3, round = false) => {
    const count = 11 + Math.floor(rand(0, 4));
    const pts = Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + rand(-0.12, 0.12);
      const d = round ? r * rand(0.78, 1.18) : r * (i % 2 ? rand(0.55, 0.95) : rand(0.95, 1.3 + spiky));
      return [x + Math.cos(a) * d, y + Math.sin(a) * d];
    });
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let d = `M${mid(pts[count - 1], pts[0]).map(f1)}`;
    pts.forEach((p, i) => { d += `Q${p.map(f1)} ${mid(p, pts[(i + 1) % count]).map(f1)}`; });
    return `${d}z`;
  };

  const syringeSplats = (tx, ty) => {
    const blobs = [];
    const blob = (x, y, r, delay, drip = true) => {
      const w = r * rand(0.1, 0.18);
      const len = rand(160, 460);
      const dx = x + rand(-r, r) * 0.45;
      const drop = drip && r > 38
        ? `<path class="syringe-drip" style="--d:${(delay + 0.12).toFixed(2)}s" d="M${f1(dx - w)} ${f1(y)}h${f1(2 * w)}v${f1(len)}a${f1(w * 1.5)} ${f1(w * 1.5)} 0 1 1 ${f1(-2 * w)} 0z" fill="#4a0609"/>`
        : '';
      blobs.push(`<g class="syringe-splat" style="--d:${delay.toFixed(2)}s"><path d="${blobPath(x, y, r)}" fill="#560709"/><path d="${blobPath(x - r * 0.22, y - r * 0.25, r * 0.3, 0)}" fill="#b02a2c" opacity=".5"/></g>${drop}`);
    };
    blob(800, 450, 280, 0);
    blob(520, 350, 190, 0.02);
    blob(1090, 560, 210, 0.03);
    blob(930, 200, 170, 0.04);
    blob(430, 680, 170, 0.05);
    blob(1380, 250, 150, 0.06);
    for (let i = 0; i < 26; i += 1) blob(rand(0, 1600), rand(0, 900), rand(14, 80), rand(0.03, 0.2));
    const spray = Array.from({ length: 70 }, () => {
      const a = rand(0, Math.PI * 2);
      const d = rand(60, 1500);
      const rx = 6 + d * rand(0.02, 0.06);
      return `<ellipse cx="${f1(tx + Math.cos(a) * d)}" cy="${f1(ty + Math.sin(a) * d)}" rx="${f1(rx * 2.2)}" ry="${f1(rx * 0.7)}" transform="rotate(${f1((a * 180) / Math.PI)} ${f1(tx + Math.cos(a) * d)} ${f1(ty + Math.sin(a) * d)})" fill="#6a0a0e"/>`;
    }).join('');
    return { blobs: blobs.join(''), streaks: spray };
  };

  SCARES.push({
    name: 'syringe',
    ms: 2500,
    html: () => {
      const { body, tx, ty } = syringeScene();
      const { blobs, streaks } = syringeSplats(tx, ty);
      return `<div class="syringe-world" style="--ox:${f1(tx / 16)}%;--oy:${f1(ty / 9)}%">
        <svg class="syringe-body" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${body}</svg>
        <div class="syringe-wash"></div><svg class="syringe-fx" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g class="syringe-streaks">${streaks}</g>${blobs}</svg>
      </div>`;
    },
    sound: (output) => {
      rush(output, { path: [[0, 300], [0.2, 3200]], q: 0.8, length: 0.26, volume: 0.9, attack: 0.02, hold: 0.8 });
      thud(output, 0.19, 1);
      note(output, { type: 'triangle', path: [[0, 5200], [0.3, 4400]], length: 0.35, volume: 0.22 }, 0.19);
      rush(output, { type: 'highpass', path: [[0, 2500], [0.6, 6500]], length: 0.62, volume: 0.55, start: 0.85, attack: 0.04, hold: 0.7 });
      note(output, { type: 'sawtooth', path: [[0, 70], [0.6, 120]], length: 0.62, volume: 0.25 }, 0.85);
      thud(output, 1.45, 0.85);
      rush(output, { type: 'bandpass', path: [[0, 1400], [0.35, 280]], q: 0.7, length: 0.45, volume: 1, start: 1.45, attack: 0.005, hold: 0.4 });
      rush(output, { type: 'lowpass', path: [[0, 900], [0.9, 200]], length: 0.9, volume: 0.35, start: 1.5, attack: 0.1, hold: 0.2 });
    },
  });

  // ---- corridor drawing, shared with cctv
  const corridor = (LAMP = 5.5, gain = 1) => {
    const VX = 800;
    const VY = 430;
    const K = 260;
    const FLOOR = 1.5;
    const CEIL = -1.3;
    const HALF = 1.4;
    const px = (x, y, z) => `${f1(VX + (x * K) / z)},${f1(VY + (y * K) / z)}`;
    const light = (z) => gain * (0.035 + 0.85 * Math.exp(-(((z - LAMP) / (3.6 * Math.max(1, LAMP / 5.5))) ** 2)) + 0.05 / (1 + z));
    const tint = ([r, g, b], z, k = 1) => `rgb(${[r, g, b].map((c) => Math.min(255, Math.round(c * light(z) * k))).join(',')})`;
    const zs = [];
    for (let z = 0.4; z < 90; z *= 1.16) zs.push(z);
    let out = '';
    for (let i = zs.length - 2; i >= 0; i -= 1) {
      const a = zs[i];
      const b = zs[i + 1];
      const mid = (a + b) / 2;
      const quad = (pts, fill) => `<path d="M${pts.join('L')}z" fill="${fill}" stroke="${fill}" stroke-width="1"/>`;
      out += quad([px(-HALF, FLOOR, a), px(-HALF, CEIL, a), px(-HALF, CEIL, b), px(-HALF, FLOOR, b)], tint([118, 136, 124], mid));
      out += quad([px(HALF, FLOOR, a), px(HALF, CEIL, a), px(HALF, CEIL, b), px(HALF, FLOOR, b)], tint([108, 126, 116], mid));
      out += quad([px(-HALF, FLOOR, a), px(HALF, FLOOR, a), px(HALF, FLOOR, b), px(-HALF, FLOOR, b)], tint([92, 100, 92], mid));
      out += quad([px(-HALF, CEIL, a), px(HALF, CEIL, a), px(HALF, CEIL, b), px(-HALF, CEIL, b)], tint([70, 78, 74], mid));
    }
    const wall = (side, z0, z1, top, bottom, fill, extra = '') => {
      const x = side * HALF;
      return `<path d="M${px(x, bottom, z0)}L${px(x, top, z0)}L${px(x, top, z1)}L${px(x, bottom, z1)}z" fill="${fill}" ${extra}/>`;
    };
    // doors, a wainscot stripe and a dead strip light, far to near
    for (let z = 36; z > 1.6; z /= 1.45) {
      const side = Math.round(Math.log(z) * 3) % 2 ? 1 : -1;
      const z1 = z * 0.9;
      out += wall(side, z1, z, -0.55, FLOOR, tint([34, 40, 36], z), `stroke="${tint([150, 160, 148], z, 0.7)}" stroke-width="2"`);
      out += wall(side, z1 * 1.02, z * 0.98, -0.2, 0.0, tint([140, 160, 150], z, 0.6));
    }
    for (let z = 60; z > 2; z /= 1.5) {
      out += `<path d="M${px(-1.1, CEIL, z * 0.9)}L${px(1.1, CEIL, z * 0.9)}L${px(1.1, CEIL, z)}L${px(-1.1, CEIL, z)}z" fill="${tint([26, 28, 28], z, 0.8)}"/>`;
    }
    out += wall(-1, 0.4, 90, 0.7, 0.78, 'rgba(30,36,32,.55)');
    out += wall(1, 0.4, 90, 0.7, 0.78, 'rgba(30,36,32,.55)');
    const lampPoint = px(0, CEIL, LAMP).split(',').map(Number);
    const flick = `<g class="gurney-lamp">
      <ellipse cx="${VX}" cy="${f1(VY + (FLOOR * K) / LAMP)}" rx="170" ry="26" fill="url(#gurneyPool)"/>
      <circle cx="${lampPoint[0]}" cy="${lampPoint[1]}" r="300" fill="url(#gurneyGlow)"/>
      <path d="M${px(-0.5, CEIL, LAMP - 0.4)}L${px(0.5, CEIL, LAMP - 0.4)}L${px(0.5, CEIL, LAMP + 0.4)}L${px(-0.5, CEIL, LAMP + 0.4)}z" fill="#f4f1d8"/></g>`;
    return `<defs>
        <radialGradient id="gurneyGlow"><stop offset="0" stop-color="#dfe9c6" stop-opacity=".55"/><stop offset=".35" stop-color="#9fb59a" stop-opacity=".18"/><stop offset="1" stop-color="#9fb59a" stop-opacity="0"/></radialGradient>
        <radialGradient id="gurneyPool"><stop offset="0" stop-color="#eef0d0" stop-opacity=".45"/><stop offset="1" stop-color="#eef0d0" stop-opacity="0"/></radialGradient>
      </defs>${out}${flick}`;
  };

  // ---- bedsheet: an iron bed, a sheet, a breath.
  const wardRoom = () => {
    const bars = (x0, x1, y0, y1, n) => Array.from({ length: n }, (_, i) => `<path d="M${f1(x0 + ((x1 - x0) * i) / (n - 1))} ${y0}V${y1}" stroke="#1b2022" stroke-width="7"/>`).join('');
    return `<defs>
      <linearGradient id="bedsheetWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0e10"/><stop offset=".85" stop-color="#17201f"/><stop offset="1" stop-color="#0a0d0c"/></linearGradient>
      <linearGradient id="bedsheetBeam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9ec0d6" stop-opacity=".34"/><stop offset="1" stop-color="#9ec0d6" stop-opacity=".02"/></linearGradient>
      <linearGradient id="bedsheetCloth" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b4c0c5"/><stop offset=".45" stop-color="#77858b"/><stop offset="1" stop-color="#252d32"/></linearGradient>
      <radialGradient id="bedsheetHole"><stop offset="0" stop-color="#000"/><stop offset=".6" stop-color="#05080a" stop-opacity=".9"/><stop offset="1" stop-color="#05080a" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#bedsheetWall)"/>
    <path d="M0 800H1600V900H0z" fill="#070909"/>
    <path d="M0 800H1600" stroke="#2a3330" stroke-width="3"/>
    <rect x="70" y="120" width="270" height="430" fill="#7fa3b8"/>
    <path d="M205 120V550M70 335H340" stroke="#0b0f11" stroke-width="12"/>
    <rect x="70" y="120" width="270" height="430" fill="none" stroke="#0b0f11" stroke-width="14"/>
    <path d="M340 120L760 380L1180 800L340 550z" fill="url(#bedsheetBeam)"/>
    <path d="M205 120L700 400L1020 800H760zM70 335L420 540L560 800H420z" fill="rgba(0,0,0,.2)"/>
    <!-- iv stand -->
    <path d="M1500 240V800M1440 800H1560M1500 240h-50" stroke="#2c3436" stroke-width="7" fill="none"/>
    <path d="M1420 250q-18 40 0 90q22 4 34-10q8-40-10-80z" fill="#8a9ea0" opacity=".28"/>
    <!-- iron bed -->
    <path d="M425 790V720M1375 790V720" stroke="#14181a" stroke-width="12"/>
    <path d="M410 660H1390V690H410z" fill="#171c1d"/>
    <path d="M410 690H1390" stroke="#2a3233" stroke-width="3"/>
    <path d="M1390 560L1420 570V700H1390z" fill="#14181a"/>
    ${bars(1340, 1404, 580, 690, 4)}
    <path d="M1330 568H1414" stroke="#232a2c" stroke-width="10"/>
    <circle cx="1332" cy="560" r="9" fill="#2b3335"/><circle cx="1412" cy="562" r="9" fill="#2b3335"/>
    <path d="M350 430L418 450V700H350z" fill="#101415"/>
    ${bars(356, 414, 460, 690, 6)}
    <path d="M350 430L418 450" stroke="#232a2c" stroke-width="12"/>
    <path d="M350 500H414M350 600H414" stroke="#232a2c" stroke-width="8"/>
    <circle cx="352" cy="420" r="13" fill="#2b3335"/><circle cx="416" cy="442" r="13" fill="#2b3335"/>
    <path d="M410 610Q900 650 1390 610V664H410z" fill="#242a27"/>
    <path d="M430 610Q900 640 1380 610" stroke="#3a423e" stroke-width="4" fill="none"/>
    <path d="M430 580Q500 548 640 560Q690 590 660 618L440 624z" fill="#5c6a70"/>
    <path d="M440 600Q540 588 650 604" stroke="#8da0a8" stroke-width="3" fill="none" opacity=".5"/>
    <ellipse cx="900" cy="620" rx="270" ry="14" fill="#0c0f0e" opacity=".8"/>`;
  };

  globalThis.wardRoomArt = wardRoom;

  // ---- surgeon
  const surgeonLamp = () => {
    const leds = [...Array.from({ length: 12 }, (_, i) => [Math.cos((i / 12) * 6.283) * 220, Math.sin((i / 12) * 6.283) * 190]), ...Array.from({ length: 7 }, (_, i) => [Math.cos((i / 7) * 6.283) * 110, Math.sin((i / 7) * 6.283) * 95]), [0, 0]]
      .map(([x, y]) => `<ellipse cx="${f1(800 + x)}" cy="${f1(70 + y * 0.8)}" rx="34" ry="28" fill="#fff"/>`).join('');
    return `<ellipse cx="800" cy="70" rx="330" ry="270" fill="#1b2023"/>
      <ellipse cx="800" cy="70" rx="300" ry="245" fill="#323a3e"/>
      <ellipse cx="800" cy="70" rx="270" ry="222" fill="#cfe4ea"/>
      ${leds}
      <ellipse cx="800" cy="70" rx="330" ry="270" fill="none" stroke="#5a666b" stroke-width="5"/>`;
  };

  const surgeonHand = () => `
    <g stroke-linecap="round" fill="none">
      <path d="M300 760Q250 640 200 560" stroke="#a8996f" stroke-width="86"/>
      <path d="M300 760Q250 640 200 560" stroke="#d9cba3" stroke-width="64"/>
      <path d="M360 700Q330 560 310 430" stroke="#a8996f" stroke-width="82"/><path d="M360 700Q330 560 310 430" stroke="#dacca4" stroke-width="60"/>
      <path d="M440 690Q440 540 450 380" stroke="#a8996f" stroke-width="86"/><path d="M440 690Q440 540 450 380" stroke="#e0d3ab" stroke-width="64"/>
      <path d="M520 700Q550 570 590 430" stroke="#a8996f" stroke-width="78"/><path d="M520 700Q550 570 590 430" stroke="#dacca4" stroke-width="56"/>
      <path d="M590 740Q650 650 700 590" stroke="#a8996f" stroke-width="66"/><path d="M590 740Q650 650 700 590" stroke="#d6c89f" stroke-width="46"/>
    </g>
    <path d="M250 820Q250 690 400 680Q560 670 640 760Q680 900 560 960L300 960Q240 900 250 820z" fill="#d6c89f"/>
    <path d="M300 740Q420 700 600 760" stroke="rgba(255,250,225,.5)" stroke-width="10" fill="none" stroke-linecap="round"/>
    <g stroke="rgba(70,55,30,.5)" stroke-width="3" fill="none"><path d="M330 560l40 4M345 500l40 4M300 640l40 4M450 520l-36 6M452 450l-36 6M455 600l-36 4M560 520l34 6M570 470l30 6"/></g>
    <path d="M440 400Q452 360 466 392Q464 424 446 420zM316 450Q324 420 342 452Q336 478 318 470zM592 440Q604 410 618 446Q612 466 596 462z" fill="#4e130f" opacity=".85"/>
    <path d="M410 640Q420 700 400 780" stroke="#4e130f" stroke-width="12" fill="none" stroke-linecap="round" opacity=".75"/>`;

  const surgeonSaw = () => `
    <g transform="rotate(-22 1180 760)">
      <path d="M1150 700H1420Q1470 700 1470 760V800Q1470 850 1420 850H1150z" fill="#2a2f31"/>
      <path d="M1150 706H1420" stroke="#69757a" stroke-width="5"/>
      <path d="M1340 840L1390 960H1470L1440 840z" fill="#181b1c"/>
      <path d="M1190 740H1300" stroke="#8a979c" stroke-width="3" opacity=".5"/>
      <g class="surgeon-blade">
        <path d="M1150 735L740 700Q720 730 740 760L1150 815z" fill="#b6c0c4"/>
        <path d="M1150 735L740 700L736 712L1150 745z" fill="#f2f6f6"/>
        <path d="M740 700l-14 6 16 10-14 8 16 10-14 8 18 10-14 8 16 6" fill="none" stroke="#cdd6d8" stroke-width="5" stroke-linejoin="miter"/>
        <path d="M900 720l60 6M1010 730l60 6" stroke="#4e130f" stroke-width="9" stroke-linecap="round" opacity=".8"/>
      </g>
      <path d="M700 660l-70-30M690 780l-80 30M700 720l-90-4" stroke="rgba(230,240,240,.5)" stroke-width="3" stroke-linecap="round" class="surgeon-blur"/>
    </g>`;

  const surgeonFace = () => `
    <defs>
      <linearGradient id="surgeonSkin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8d3bf"/><stop offset=".5" stop-color="#a5a392"/><stop offset="1" stop-color="#5d5d52"/></linearGradient>
      <linearGradient id="surgeonMask" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fc4cc"/><stop offset="1" stop-color="#4f7580"/></linearGradient>
      <linearGradient id="surgeonGown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d6256"/><stop offset="1" stop-color="#12241f"/></linearGradient>
      <radialGradient id="surgeonMirror" cx=".4" cy=".35"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#b3c0c4"/><stop offset="1" stop-color="#4a5559"/></radialGradient>
    </defs>
    <path d="M230 900Q290 720 540 680L1060 680Q1310 720 1370 900z" fill="url(#surgeonGown)"/>
    <path d="M700 640H900V720H700z" fill="#7d7c6e"/>
    <ellipse cx="582" cy="400" rx="26" ry="52" fill="#9b998a"/><ellipse cx="1018" cy="400" rx="26" ry="52" fill="#9b998a"/>
    <path d="M588 330Q566 130 800 98Q1034 130 1012 330Q1004 520 934 640Q870 706 800 706Q730 706 666 640Q596 520 588 330z" fill="url(#surgeonSkin)"/>
    <path d="M574 340Q548 96 800 58Q1052 96 1026 340Q1004 206 800 184Q596 206 574 340z" fill="#527568"/>
    <path d="M640 150Q700 110 720 80M800 70V170M960 150Q900 110 880 80" stroke="rgba(10,30,24,.45)" stroke-width="5" fill="none"/>
    <path d="M580 316Q800 150 1020 316" stroke="#1d2a26" stroke-width="12" fill="none"/>
    <circle cx="800" cy="226" r="70" fill="#1d2326"/>
    <circle cx="800" cy="226" r="62" fill="url(#surgeonMirror)"/>
    <circle cx="800" cy="226" r="13" fill="#0a0c0d"/>
    <ellipse cx="715" cy="342" rx="76" ry="38" fill="rgba(18,16,12,.6)"/><ellipse cx="885" cy="342" rx="76" ry="38" fill="rgba(18,16,12,.6)"/>
    <path d="M636 300Q714 262 780 306M964 300Q886 262 820 306" stroke="#151410" stroke-width="20" fill="none" stroke-linecap="round"/>
    <path d="M668 346Q716 318 764 346Q716 372 668 346zM836 346Q884 318 932 346Q884 372 836 346z" fill="#c4c6b6"/>
    <circle cx="718" cy="350" r="16" fill="#aab2a8"/><circle cx="882" cy="350" r="16" fill="#aab2a8"/>
    <circle cx="718" cy="351" r="3.5" fill="#050605"/><circle cx="882" cy="351" r="3.5" fill="#050605"/>
    <path d="M660 347Q716 306 772 347z" fill="#8b897a" stroke="#14130e" stroke-width="4"/><path d="M828 347Q884 306 940 347z" fill="#8b897a" stroke="#14130e" stroke-width="4"/>
    <path d="M660 354Q716 376 770 354M830 354Q884 376 940 354" stroke="rgba(30,24,20,.5)" stroke-width="8" fill="none"/>
    <path d="M638 380Q800 336 962 380Q996 520 934 652Q800 722 666 652Q604 520 638 380z" fill="url(#surgeonMask)"/>
    <path d="M652 400Q800 360 948 400" stroke="#d6eef0" stroke-width="6" fill="none" opacity=".7"/>
    <path d="M630 470Q800 440 970 470M622 540Q800 516 978 540M630 610Q800 592 970 610" stroke="rgba(20,50,60,.4)" stroke-width="5" fill="none"/>
    <path d="M638 392Q600 420 590 470M962 392Q1000 420 1010 470" stroke="#cfe0e2" stroke-width="3" fill="none" opacity=".7"/>
    <path d="M700 560l8 14l-10 2zM860 500l10 18l-12 2zM790 600l12 12l-14 6z" fill="#4e130f" opacity=".85"/>
    <path d="M590 340L640 392M1010 340L960 392" stroke="rgba(0,0,0,.25)" stroke-width="10"/>
    <path d="M600 330Q580 520 670 650L640 640Q580 500 590 330z" fill="rgba(0,0,0,.4)"/><path d="M1000 330Q1020 520 930 650L960 640Q1020 500 1010 330z" fill="rgba(0,0,0,.4)"/>
    <path d="M870 420Q930 450 920 560Q900 640 850 660Q860 560 840 480z" fill="#5c1812" opacity=".6"/>`;

  SCARES.push({
    name: 'surgeon',
    ms: 3000,
    html: () => `<svg class="surgeon-scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g>${surgeonLamp()}</g>
        <g class="surgeon-drop"><g class="surgeon-creep">${surgeonFace()}</g></g>
        <g class="surgeon-sawgroup">${surgeonSaw()}</g>
        <g class="surgeon-hand">${surgeonHand()}</g>
      </svg><div class="surgeon-shade"></div><div class="surgeon-flash"></div>`,
    sound: (output) => {
      const { context } = audio;
      thud(output, 0, 0.8);
      rush(output, { type: 'highpass', path: [[0, 3000], [0.1, 6000]], length: 0.12, volume: 0.9, attack: 0.002, hold: 0.3 });
      note(output, { type: 'square', path: [[0, 100], [1.8, 100]], length: 2, volume: 0.07, wobble: [3, 20] }, 0.02);
      rush(output, { type: 'bandpass', path: [[0, 500], [0.5, 800]], q: 1.2, length: 0.7, volume: 0.35, start: 0.5, attack: 0.25, hold: 0.7 });
      rush(output, { type: 'bandpass', path: [[0, 800], [0.6, 450]], q: 1.2, length: 0.7, volume: 0.3, start: 1.25, attack: 0.1, hold: 0.3 });
      const when = context.currentTime + 0.55;
      [1, 1.014, 0.5].forEach((ratio, index) => {
        const voice = context.createOscillator();
        const gain = context.createGain();
        const shake = context.createOscillator();
        const depth = context.createGain();
        voice.type = 'sawtooth';
        voice.frequency.setValueAtTime(160 * ratio, when);
        voice.frequency.exponentialRampToValueAtTime(900 * ratio, when + 0.8);
        voice.frequency.exponentialRampToValueAtTime(2900 * ratio, when + 2.2);
        gain.gain.setValueAtTime(0.0001, when);
        gain.gain.exponentialRampToValueAtTime(index === 2 ? 0.22 : 0.3, when + 2.2);
        gain.gain.setValueAtTime(0.0001, when + 2.3);
        shake.frequency.value = 55;
        depth.gain.value = 40;
        shake.connect(depth).connect(voice.detune);
        voice.connect(gain).connect(output);
        voice.start(when);
        shake.start(when);
        voice.stop(when + 2.4);
        shake.stop(when + 2.4);
      });
      rush(output, { type: 'highpass', path: [[0, 3500], [2, 7000]], length: 2.2, volume: 0.28, start: 0.6, attack: 1.8, hold: 0.99 });
      thud(output, 2.55, 0.9);
    },
  });

  // ---- cctv
  /** The pale one, feet at (0,0), about 170 high. */
  const cctvFigure = () => `<g>
    <path d="M-5 -48V-2M5 -48V-2" stroke="#c9c8bd" stroke-width="7" stroke-linecap="round"/>
    <path d="M-26 -140Q-30 -100 -35 -48L-26 -42L-18 -50L-9 -41L0 -50L9 -41L18 -50L26 -42L36 -48Q31 -100 26 -140Q0 -148 -26 -140z" fill="#dedcd0"/>
    <path d="M-24 -136Q-34 -100 -33 -56M24 -136Q36 -100 34 -56" stroke="#d3d2c6" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M-30 -62l-3 22M-27 -60l0 24M30 -62l3 22M27 -60l0 24" stroke="#bdbcb0" stroke-width="3" stroke-linecap="round"/>
    <g transform="rotate(11 0 -140)">
      <rect x="-4" y="-150" width="8" height="12" fill="#c9c8bd"/>
      <ellipse cx="0" cy="-160" rx="10" ry="14" fill="#ecebe0"/>
      <path d="M-11 -160C-14 -180 14 -180 11 -160C9 -170 4 -174 0 -174C-5 -174 -9 -170 -11 -160zM-11 -160Q-15 -140 -12 -128M11 -160Q15 -142 12 -126" stroke="#050505" stroke-width="2.4" fill="#050505" stroke-linecap="round"/>
      <ellipse cx="-4" cy="-160" rx="3" ry="4.2" fill="#000"/><ellipse cx="4" cy="-160" rx="3" ry="4.2" fill="#000"/>
      <ellipse cx="0" cy="-151" rx="2.2" ry="3.4" fill="#000"/>
    </g></g>`;

  const cctvFace = () => `<defs>${GHOUL_DEFS}
      <radialGradient id="cctvFog" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="#060606"/>
    <g transform="translate(800 345) rotate(-5) scale(8 7.2) translate(0 -326)">${ghoulFace()}</g>
    <ellipse cx="800" cy="760" rx="480" ry="230" fill="url(#cctvFog)"/>
    <g fill="#cfcfc6" stroke="#55554f" stroke-width="5"><rect x="40" y="260" width="62" height="270" rx="31" transform="rotate(-8 70 400)"/><rect x="118" y="230" width="62" height="300" rx="31" transform="rotate(-3 150 400)"/><rect x="1440" y="250" width="62" height="280" rx="31" transform="rotate(5 1470 400)"/><rect x="1516" y="290" width="62" height="250" rx="31" transform="rotate(10 1540 400)"/></g>`;

  SCARES.push({
    name: 'cctv',
    ms: 3300,
    html: () => {
      const VX = 800;
      const VY = 430;
      const K = 260;
      const stage = (z, n) => `<g class="cctv-step cctv-step-${n}" transform="translate(${VX} ${f1(VY + (1.5 * K) / z)}) scale(${f1((K / z) * 100) / 10000})">${cctvFigure()}</g>`;
      const places = { en: 'WARD 3 EAST', de: 'STATION 3 OST' };
      return `<div class="cctv-feed">
          <svg class="cctv-hall" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${corridor(13, 1.9)}
            ${stage(16, 0)}${stage(8, 1)}${stage(3.8, 2)}${stage(1.7, 3)}</svg>
          <svg class="cctv-face" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${cctvFace()}</svg>
        </div>
        <div class="cctv-noise"></div><div class="cctv-lines"></div><div class="cctv-roll"></div><div class="cctv-vignette"></div>
        <p class="cctv-tag cctv-cam">CAM 07</p>
        <p class="cctv-tag cctv-time">02:13:<b class="cctv-secs"><span style="--i:0">07</span><span style="--i:1">08</span><span style="--i:2">09</span><span style="--i:3">10</span></b></p>
        <p class="cctv-tag cctv-rec">&#9679; REC</p>
        <p class="cctv-tag cctv-place">${say(places)}</p>
        <div class="cctv-static"></div>`;
    },
    sound: (output) => {
      note(output, { path: [[0, 50], [3.2, 50]], length: 3.3, volume: 0.22 });
      note(output, { path: [[0, 100], [3.2, 100]], length: 3.3, volume: 0.08 });
      note(output, { path: [[0, 8200], [3.2, 8200]], length: 3.3, volume: 0.025 });
      rush(output, { type: 'bandpass', path: [[0, 3500], [3, 3500]], q: 0.4, length: 3, volume: 0.05, attack: 0.05, hold: 0.99 });
      [[0.75, 0.35], [1.45, 0.45], [2.1, 0.6]].forEach(([s, v]) => {
        thud(output, s, v);
        burst(output, 0.05, 0.5, audio.context.currentTime + s);
        rush(output, { type: 'highpass', path: [[0, 4000], [0.08, 6000]], length: 0.1, volume: 0.45, start: s - 0.02 });
      });
      thud(output, 2.65, 0.75);
      burst(output, 0.3, 0.6, audio.context.currentTime + 2.65);
      [1, 1.5].forEach((ratio) => note(output, { type: 'sawtooth', path: [[0, 1700 * ratio], [0.3, 2500 * ratio]], length: 0.3, volume: 0.2, wobble: [70, 160] }, 2.65));
      rush(output, { type: 'highpass', path: [[0, 1200], [0.3, 1200]], length: 0.4, volume: 0.6, start: 2.95, attack: 0.005, hold: 0.9 });
    },
  });

  // ---- scratches
  const SCRATCH_FONT = {
    S: [[[2, 0.4], [1.6, 0], [0.4, 0], [0, 0.4], [0, 1.1], [0.4, 1.5], [1.6, 1.5], [2, 1.9], [2, 2.6], [1.6, 3], [0.4, 3], [0, 2.6]]],
    T: [[[0, 0], [2, 0]], [[1, 0], [1, 3]]],
    I: [[[0.3, 0], [0.3, 3]]],
    L: [[[0, 0], [0, 3], [2, 3]]],
    H: [[[0, 0], [0, 3]], [[2, 0], [2, 3]], [[0, 1.5], [2, 1.5]]],
    E: [[[2, 0], [0, 0], [0, 3], [2, 3]], [[0, 1.5], [1.6, 1.5]]],
    R: [[[0, 3], [0, 0], [1.5, 0], [2, 0.5], [2, 1], [1.5, 1.5], [0, 1.5]], [[1, 1.5], [2, 3]]],
    M: [[[0, 3], [0, 0], [1, 1.7], [2, 0], [2, 3]]],
    N: [[[0, 3], [0, 0], [2, 3], [2, 0]]],
    O: [[[0.5, 0], [1.5, 0], [2, 0.5], [2, 2.5], [1.5, 3], [0.5, 3], [0, 2.5], [0, 0.5], [0.5, 0]]],
    C: [[[2, 0.4], [1.6, 0], [0.5, 0], [0, 0.5], [0, 2.5], [0.5, 3], [1.6, 3], [2, 2.6]]],
    D: [[[0, 0], [0, 3], [1.2, 3], [2, 2.3], [2, 0.7], [1.2, 0], [0, 0]]],
    A: [[[0, 3], [1, 0], [2, 3]], [[0.4, 2], [1.6, 2]]],
  };
  const SCRATCH_WORDS = { en: ['STILL', 'HERE'], de: ['IMMER', 'NOCH', 'DA'] };
  const letterWidth = (c) => (c === 'I' ? 0.6 : 2);

  const scratchWords = (lines) => {
    const GAP = 0.9;
    const widths = lines.map((w) => [...w].reduce((sum, c, i) => sum + letterWidth(c) + (i ? GAP : 0), 0));
    const unit = Math.min(118, 1380 / Math.max(...widths), 780 / (3 * lines.length + 0.6 * (lines.length - 1)));
    const total = lines.length * 3 * unit + (lines.length - 1) * 0.6 * unit;
    const strokes = [];
    lines.forEach((word, row) => {
      let x = 800 - (widths[row] * unit) / 2;
      const y = 450 - total / 2 + row * 3.6 * unit;
      [...word].forEach((c) => {
        SCRATCH_FONT[c].forEach((poly) => strokes.push(poly.map(([px, py]) => [x + px * unit, y + py * unit])));
        x += (letterWidth(c) + GAP) * unit;
      });
    });
    return { strokes, unit };
  };

  const wobble = (pts, amount) => {
    const out = [];
    pts.forEach((p, i) => {
      if (i) {
        const q = pts[i - 1];
        out.push([(p[0] + q[0]) / 2 + rand(-amount, amount), (p[1] + q[1]) / 2 + rand(-amount, amount)]);
      }
      out.push([p[0] + rand(-amount, amount), p[1] + rand(-amount, amount)]);
    });
    const over = (a, b) => [a[0] + (a[0] - b[0]) * rand(0.03, 0.1), a[1] + (a[1] - b[1]) * rand(0.03, 0.1)];
    out[0] = over(out[0], out[1]);
    out[out.length - 1] = over(out[out.length - 1], out[out.length - 2]);
    return `M${out.map((p) => p.map(f1).join(' ')).join('L')}`;
  };

  /** One scratch stroke: the pale gouge, and a dark shadow under it. */
  const scratchLine = (d, delay, time, width, cls = '', broken = 0.04) => {
    const parts = [];
    let used = 0;
    while (used < 0.95) {
      const dash = rand(0.12, 0.5);
      const gap = Math.random() < 0.7 ? rand(0.004, broken) : rand(broken, broken * 3);
      parts.push(dash, gap);
      used += dash + gap;
    }
    parts.pop();
    const sum = parts.reduce((x, y) => x + y, 0);
    const pattern = `${parts.map((x) => ((x / sum) * 0.999).toFixed(4)).join(' ')} 3`;
    return `<path class="scratches-stroke ${cls}" pathLength="1" style="--d:${delay.toFixed(3)}s;--t:${time.toFixed(3)}s;stroke-dasharray:${pattern}" d="${d}" stroke-width="${f1(width)}"/>`;
  };

  const scratchScene = (lines) => {
    const timings = [];
    let out = '';
    // 1. three raking claw marks, four nails each
    [[-60, 140, 1500, 640, 90], [1680, 80, 120, 780, -110], [200, -40, 1380, 940, 140]].forEach(([sx, sy, ex, ey, bend], swipe) => {
      const len = Math.hypot(ex - sx, ey - sy);
      const nx = -(ey - sy) / len;
      const ny = (ex - sx) / len;
      for (let nail = 0; nail < 4; nail += 1) {
        const off = (nail - 1.5) * 44 + rand(-5, 5);
        const cx = (sx + ex) / 2 + nx * (bend + off * 0.4);
        const cy = (sy + ey) / 2 + ny * (bend + off * 0.4);
        const d = `M${f1(sx + nx * off)} ${f1(sy + ny * off)}Q${f1(cx + nx * off)} ${f1(cy + ny * off)} ${f1(ex + nx * off + rand(-20, 20))} ${f1(ey + ny * off + rand(-20, 20))}`;
        out += scratchLine(d, swipe * 0.3 + nail * 0.012, 0.3, 6, 'scratches-claw', 0.08);
      }
      timings.push(swipe * 0.3);
    });
    // 2. tally marks creeping in from every edge
    const groups = 22;
    for (let g = 0; g < groups; g += 1) {
      const edge = g % 4;
      const inset = rand(40, 60) + Math.floor(g / 4) * rand(70, 120);
      const along = rand(0.08, 0.92);
      const cx = edge === 0 ? inset : edge === 1 ? 1600 - inset : along * 1600;
      const cy = edge === 2 ? inset : edge === 3 ? 900 - inset : along * 900;
      const size = rand(90, 140);
      const turn = (rand(-12, 12) * Math.PI) / 180 + (edge < 2 ? 0 : 0);
      const at = (x, y) => [cx + (x - 2) * (size / 5) * Math.cos(turn) - (y - 0.5) * size * Math.sin(turn), cy + (x - 2) * (size / 5) * Math.sin(turn) + (y - 0.5) * size * Math.cos(turn)];
      const base = 0.5 + g * 0.058;
      [0, 1, 2, 3].forEach((i) => out += scratchLine(wobble([at(i, 0), at(i + rand(-0.1, 0.1), 1)], 2.5), base + i * 0.022, 0.07, 5, 'scratches-tally'));
      out += scratchLine(wobble([at(-0.8, 0.85), at(3.9, 0.15)], 2.5), base + 0.1, 0.09, 5, 'scratches-tally');
    }
    // 3. the words
    const { strokes, unit } = scratchWords(lines);
    const start = 1.6;
    const per = Math.min(0.09, 1.0 / strokes.length);
    let blood = '';
    strokes.forEach((pts, i) => {
      const d1 = wobble(pts, unit * 0.02);
      const d2 = wobble(pts, unit * 0.03);
      out += scratchLine(d1, start + i * per, per * 1.1, unit * 0.085, 'scratches-word', 0.02);
      out += scratchLine(d2, start + i * per + 0.01, per * 1.1, unit * 0.035, 'scratches-word', 0.03);
      blood += `<path d="${d1}" stroke-width="${f1(unit * 0.2)}"/>`;
    });
    return { markup: out, blood, strokes: strokes.length, per, start };
  };

  SCARES.push({
    name: 'scratches',
    ms: 3300,
    html: () => {
      const scene = scratchScene(say(SCRATCH_WORDS));
      const times = [];
      return `<svg class="scratches-wall" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g class="scratches-blood">${scene.blood}</g>${scene.markup}</svg>
        <div class="scratches-vignette"></div><div class="scratches-cut"></div>`;
    },
    sound: (output) => {
      const { context } = audio;
      const rasp = (start, length, volume, from = 2400, to = 5200) => {
        rush(output, { type: 'bandpass', path: [[0, from], [length, to]], q: 2.2, length, volume, start, attack: 0.012 });
        rush(output, { type: 'highpass', path: [[0, 4200], [length, 4200]], length: length * 0.8, volume: volume * 0.45, start, attack: 0.01 });
      };
      [0, 0.3, 0.6].forEach((s) => {
        rasp(s, 0.3, 0.75);
        note(output, { type: 'sawtooth', path: [[0, 700 + s * 300], [0.3, 1250 + s * 300]], length: 0.3, volume: 0.07, wobble: [90, 220] }, s);
      });
      for (let g = 0; g < 22; g += 1) {
        const base = 0.5 + g * 0.058;
        [0, 1, 2, 3, 4].forEach((i) => rasp(base + i * 0.022, 0.07, 0.4, 3000, 4800));
      }
      for (let i = 0; i < 14; i += 1) rasp(1.6 + i * 0.07, 0.08, 0.6, 1800, 3800);
      thud(output, 2.7, 0.9);
      burst(output, 0.35, 0.6, context.currentTime + 2.7);
      note(output, { type: 'sawtooth', path: [[0, 90], [0.35, 45]], length: 0.4, volume: 0.6, wobble: [30, 200] }, 2.7);
    },
  });
  // ---- lights: the ward goes dark one lamp at a time, coming towards us
  const LIGHT_DEPTHS = [0.08, 0.14, 0.24, 0.42, 0.72, 1.3];
  const wardPoint = (x, y, depth) => `${f1(800 + x * depth)} ${f1(400 + y * depth)}`;
  const wardQuad = (near, far, x1, y1, x2, y2, fill) => `<polygon fill="${fill}" points="${wardPoint(x1, y1, near)} ${wardPoint(x2, y2, near)} ${wardPoint(x2, y2, far)} ${wardPoint(x1, y1, far)}"/>`;
  const wardSegment = (index) => {
    const far = LIGHT_DEPTHS[index];
    const near = LIGHT_DEPTHS[index + 1];
    const mid = (far + near) / 2;
    const door = (side) => wardQuad(mid * 1.16, mid * 0.86, side, 480, side, -190, '#1c241f');
    return `<g class="lights-segment" style="animation-delay:${f1(0.35 * (index + 1))}s">
      ${wardQuad(near, far, -900, 480, 900, 480, '#5f6e60')}
      ${wardQuad(near, far, -900, -420, 900, -420, '#a6b3a0')}
      ${wardQuad(near, far, -900, -420, -900, 480, '#7d8c7b')}
      ${wardQuad(near, far, 900, -420, 900, 480, '#7d8c7b')}
      ${door(-900)}${door(900)}
      <ellipse cx="800" cy="${f1(400 - 410 * mid)}" rx="${f1(170 * mid)}" ry="${f1(30 * mid)}" fill="#f6f7dc"/>
      <ellipse cx="800" cy="${f1(400 + 470 * mid)}" rx="${f1(420 * mid)}" ry="${f1(70 * mid)}" fill="#c9d3bb" opacity=".45"/>
    </g>`;
  };

  /** A jittered grid of small eye pairs, each opening at its own moment in 2.2-3.0 s. */
  const lightsEyes = () => {
    const cols = 22;
    const rows = 13;
    let out = '';
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const size = randomRange(1.3, 3.2);
        const left = ((col + randomRange(0.05, 0.85)) / cols) * 100;
        const top = ((row + randomRange(0.1, 0.85)) / rows) * 100;
        out += `<i style="left:${f1(left)}%;top:${f1(top)}%;--w:${f1(size)}vw;--d:${(2.2 + randomRange(0, 0.8)).toFixed(2)}s"></i>`;
      }
    }
    return out;
  };

  SCARES.push({
    name: 'lights',
    ms: 3500,
    html: () => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1600" height="900" fill="#000"/>
      ${[0, 1, 2, 3, 4].map(wardSegment).join('')}
    </svg><div class="lights-eyes">${lightsEyes()}</div>`,
    sound: (output) => {
      note(output, { type: 'sawtooth', path: [[0, 100], [1.75, 96]], length: 1.8, volume: 0.05 });
      [0.35, 0.7, 1.05, 1.4, 1.75].forEach((start, index) => {
        thud(output, start, 0.3 + index * 0.1);
        burst(output, 0.03, 0.3, audio.context.currentTime + start);
      });
      // hundreds of eyes opening in the dark: dry little ticks, then every one blinks and the shriek hits
      for (let i = 0; i < 40; i += 1) burst(output, 0.012, 0.05 + 0.1 * (i / 40), audio.context.currentTime + 2.2 + (i / 40) * 0.9);
      later(3100, () => scream(output));
    },
  });

}

// One scare per question, mixing the frightening with the silly. Pouring blood closes the assessment.
const SCARE_ORDER = [
  'crawler', 'invoice', 'lights', 'syringe', 'duck',
  'cctv', 'eye', 'xray', 'mirror', 'rip',
  'file', 'surgeon', 'teeth', 'phew', 'crash',
  'door', 'cat', 'belly', 'elevator', 'flatline',
  'morgue', 'lockdown', 'wheelchair', 'scratches', 'blood',
];
// xray.js loads last and applies this order once its two scares exist.

// Later jump scares: xray, mirror, elevator, morgue, cat, belly. Loaded last, so it also puts SCARES in SCARE_ORDER.
{
  const say = (both) => both[language];
  const now = () => audio.context.currentTime;
  const rand = randomRange;
  const f1 = (n) => +n.toFixed(1);

  /** A flat-level voice with a quick attack and release. */
  const voice = (output, { type = 'sine', freq, to, at = now(), length, volume }) => {
    const { context } = audio;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, at);
    if (to) oscillator.frequency.exponentialRampToValueAtTime(to, at + length);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.006);
    gain.gain.setValueAtTime(volume, at + Math.max(0.007, length - 0.02));
    gain.gain.linearRampToValueAtTime(0, at + length);
    oscillator.connect(gain).connect(output);
    oscillator.start(at);
    oscillator.stop(at + length + 0.02);
  };

  /** Filtered noise with a soft envelope: a rub, a hiss, a rumble. */
  const rub = (output, { at = now(), length, volume, type = 'bandpass', freq = 1000, to, q = 1, attack = 0.01 }) => {
    const { context } = audio;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * length) + 1, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(freq, at);
    if (to) filter.frequency.exponentialRampToValueAtTime(to, at + length);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + attack);
    gain.gain.linearRampToValueAtTime(0, at + length);
    source.connect(filter).connect(gain).connect(output);
    source.start(at);
  };

  /** A struck piece of metal: inharmonic partials that ring and die. */
  const clang = (output, at, volume, base = 260, decay = 1) => {
    [[1, 1, 1.8], [2.76, 0.7, 1.4], [5.4, 0.5, 1], [8.93, 0.3, 0.7], [13.3, 0.15, 0.5]].forEach(([ratio, level, length]) => {
      tone(output, { path: [[0, base * ratio]], length: length * decay, volume: volume * level, at });
    });
    burst(output, 0.05, volume * 0.8, at);
  };

  /** A shriek: stacked saws sliding up, shaking fast. */
  const shriek = (output, at, volume = 0.2, length = 0.8) => {
    [1, 1.5, 2.1].forEach((ratio) => tone(output, {
      type: 'sawtooth', path: [[0, 900 * ratio], [0.15, 1900 * ratio], [length, 1200 * ratio]], length, volume, wobble: [42, 130], at,
    }));
  };

  // ---- xray: a lightbox stutters on, a chest film, a skull that turns round

  const BONE = '#d6ebff';
  const ribs = Array.from({ length: 9 }, (_, i) => {
    const y = 238 + i * 27;
    const out = 112 - i * 4.5 + (i > 6 ? 6 : 0);
    return `<path d="M196 ${y}Q${196 - out * 0.8} ${y - 18} ${196 - out - 10} ${y + 40}" /><path d="M204 ${y}Q${204 + out * 0.8} ${y - 18} ${204 + out + 10} ${y + 40}" />`;
  }).join('');
  const vertebrae = Array.from({ length: 13 }, (_, i) => `<rect x="${188 - (i > 8 ? 2 : 0)}" y="${196 + i * 23}" width="${24 + (i > 8 ? 4 : 0)}" height="15" rx="5"/>`).join('');
  const XRAY_SVG = `<svg class="xray-film" viewBox="0 0 400 520" aria-hidden="true">
    <defs>
      <radialGradient id="xrayPlate" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#0d2038"/><stop offset="1" stop-color="#030811"/></radialGradient>
      <radialGradient id="xrayLung" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#6aa6dd" stop-opacity=".3"/><stop offset="1" stop-color="#6aa6dd" stop-opacity="0"/></radialGradient>
      <filter id="xrayGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="400" height="520" fill="url(#xrayPlate)"/>
    <ellipse cx="128" cy="360" rx="78" ry="125" fill="url(#xrayLung)"/><ellipse cx="272" cy="360" rx="78" ry="125" fill="url(#xrayLung)"/>
    <ellipse cx="222" cy="370" rx="46" ry="56" fill="#b9dcff" opacity=".16"/>
    <g filter="url(#xrayGlow)" fill="none" stroke="${BONE}" stroke-linecap="round" stroke-linejoin="round">
      <g stroke-width="8" opacity=".55">${ribs}</g>
      <g stroke-width="9" opacity=".85"><path d="M198 205Q150 178 92 190M202 205Q250 178 308 190"/></g>
      <g stroke-width="15" opacity=".4"><path d="M62 215L38 440M338 215L362 440"/></g>
      <g fill="${BONE}" stroke="none"><circle cx="72" cy="202" r="21" opacity=".55"/><circle cx="328" cy="202" r="21" opacity=".55"/>
        <g opacity=".7">${vertebrae}</g><rect x="193" y="228" width="14" height="130" rx="6" opacity=".4"/></g>
      <g class="xray-profile" fill="${BONE}" stroke="none">
        <path d="M150 96C150 40 196 22 232 40C268 56 270 98 258 122L262 140L246 146L248 160L226 160L216 180L196 178L190 150C160 146 150 124 150 96Z" opacity=".5"/>
        <path d="M168 94C170 56 200 40 228 52C250 62 252 96 244 112" fill="none" stroke="${BONE}" stroke-width="5" opacity=".8"/>
        <ellipse cx="228" cy="96" rx="13" ry="15" fill="#030a14"/><path d="M262 124L246 128L252 144z" fill="#030a14"/>
        <path d="M222 150H252M224 160H250" stroke="#030a14" stroke-width="3"/><rect x="226" y="148" width="26" height="8" rx="2" opacity=".95"/>
        <path d="M198 178L190 214M216 180L214 214" stroke="${BONE}" stroke-width="10" opacity=".6"/>
      </g>
      <g class="xray-front" fill="${BONE}" stroke="none">
        <ellipse cx="200" cy="88" rx="60" ry="68" opacity=".78"/>
        <ellipse cx="200" cy="82" rx="44" ry="52" opacity=".2"/>
        <path d="M150 112Q160 150 176 154M250 112Q240 150 224 154" fill="none" stroke="${BONE}" stroke-width="9" opacity=".7"/>
        <ellipse cx="174" cy="100" rx="17" ry="14" fill="#030a14"/><ellipse cx="226" cy="100" rx="17" ry="14" fill="#030a14"/>
        <path d="M200 116L190 142H210z" fill="#030a14"/>
        <path d="M200 28V54" stroke="#030a14" stroke-width="2" opacity=".6"/>
        <rect x="170" y="150" width="60" height="14" rx="3" opacity=".95"/><path d="M180 150v14M190 150v14M200 150v14M210 150v14M220 150v14" stroke="#030a14" stroke-width="2"/>
        <g class="xray-jaw"><path d="M152 138Q154 188 184 196H216Q246 188 248 138L236 150Q236 178 214 182H186Q164 178 164 150z" opacity=".85"/>
          <rect x="172" y="168" width="56" height="12" rx="3" opacity=".95"/><path d="M182 168v12M192 168v12M200 168v12M208 168v12M218 168v12" stroke="#030a14" stroke-width="2"/></g>
      </g>
      <g stroke="${BONE}" stroke-width="16" opacity=".6"><path d="M198 164V206"/></g>
    </g></svg>`;

  SCARES.push({
    name: 'xray',
    ms: 3400,
    html: () => `<div class="xray-box"><i class="xray-panel"></i>${XRAY_SVG}</div><i class="xray-flash"></i>`,
    sound: (output) => {
      const start = now();
      // fluorescent tube: stuttering ticks, then a steady buzz
      [0.18, 0.38, 0.72, 0.96].forEach((s) => { burst(output, 0.03, 0.22, start + s); voice(output, { type: 'square', freq: 100, length: 0.05, volume: 0.09, at: start + s }); });
      voice(output, { type: 'sawtooth', freq: 100, length: 3.0, volume: 0.05, at: start + 0.9 });
      voice(output, { type: 'sawtooth', freq: 200, length: 3.0, volume: 0.025, at: start + 0.9 });
      // the skull turns: a dry grind of bone
      rub(output, { at: start + 1.7, length: 0.65, volume: 0.17, freq: 700, to: 1700, q: 3, attack: 0.2 });
      voice(output, { type: 'triangle', freq: 410, to: 560, length: 0.6, volume: 0.04, at: start + 1.75 });
      // jaw
      burst(output, 0.05, 0.35, start + 2.4);
      voice(output, { type: 'square', freq: 260, to: 90, length: 0.12, volume: 0.1, at: start + 2.4 });
      // lunge
      hit(output, start + 2.55);
      burst(output, 0.25, 0.8, start + 2.55);
      shriek(output, start + 2.55, 0.14, 0.6);
    },
  });

  // ---- mirror: a finger writes in the steam

  const GLYPHS = {
    T: [[[0, 0], [10, 0]], [[5, 0], [5, 14]]],
    U: [[[0, 0], [0, 10], [2, 13], [8, 13], [10, 10], [10, 0]]],
    R: [[[0, 14], [0, 0], [7, 0], [10, 2], [10, 5], [7, 7], [0, 7]], [[5, 7], [10, 14]]],
    N: [[[0, 14], [0, 0], [10, 14], [10, 0]]],
    A: [[[0, 14], [5, 0], [10, 14]], [[2, 9], [8, 9]]],
    O: [[[5, 0], [1, 2], [0, 7], [1, 12], [5, 14], [9, 12], [10, 7], [9, 2], [5, 0]]],
    D: [[[0, 0], [0, 14], [6, 14], [10, 10], [10, 4], [6, 0], [0, 0]]],
    H: [[[0, 0], [0, 14]], [[10, 0], [10, 14]], [[0, 7], [10, 7]]],
    I: [[[5, 0], [5, 14]]],
    E: [[[10, 0], [0, 0], [0, 14], [10, 14]], [[0, 7], [7, 7]]],
  };
  const MIRROR_WORDS = { en: 'TURN AROUND', de: 'HINTER IHNEN' };
  const WRITE_AT = 0.85;
  const WRITE_SPAN = 1.15;

  /** The strokes of the sentence in order, each with its start time. */
  const writing = () => {
    const strokes = [];
    let x = 0;
    [...say(MIRROR_WORDS)].forEach((letter) => {
      if (letter === ' ') { x += 9; return; }
      GLYPHS[letter].forEach((points) => strokes.push(points.map(([px, py]) => [px + x, py])));
      x += 14;
    });
    const gap = WRITE_SPAN / strokes.length;
    return { strokes, width: x - 4, times: strokes.map((_, i) => WRITE_AT + i * gap), gap };
  };

  const TILES = (() => {
    let out = '';
    for (let row = 0; row < 12; row += 1) {
      for (let col = 0; col < 20; col += 1) out += `<rect x="${col * 80}" y="${row * 80}" width="78" height="78" fill="${(row + col) % 5 === 0 ? '#c6d3cc' : '#d7e1dc'}"/>`;
    }
    return out;
  })();

  const FIGURE = '<svg class="mirror-figure" viewBox="0 0 200 520" aria-hidden="true"><path d="M100 4C130 4 138 34 130 62C126 76 120 82 118 90C150 98 186 108 190 160L196 330L172 336L168 220L162 520H40L36 220L28 336L4 330L10 160C14 108 50 98 82 90C80 82 74 76 70 62C62 34 70 4 100 4Z" fill="#020304"/></svg>';

  const crackPaths = (() => {
    const cx = 960;
    const cy = 330;
    let out = '';
    for (let i = 0; i < 12; i += 1) {
      let angle = (i * Math.PI * 2) / 12 + rand(-0.2, 0.2);
      let x = cx;
      let y = cy;
      let d = `M${x} ${y}`;
      for (let k = 0; k < rand(4, 7); k += 1) {
        angle += rand(-0.5, 0.5);
        const step = rand(100, 240);
        x += Math.cos(angle) * step;
        y += Math.sin(angle) * step;
        d += `L${Math.round(x)} ${Math.round(y)}`;
      }
      out += `<path d="${d}" pathLength="1" style="--i:${i}"/>`;
    }
    return out;
  })();

  SCARES.push({
    name: 'mirror',
    ms: 3500,
    html: () => {
      const { strokes, width, times, gap } = writing();
      const paths = strokes.map((points, i) => `<path d="M${points.map(([px, py]) => `${px} ${py}`).join('L')}" pathLength="1" style="animation-delay:${times[i].toFixed(2)}s;animation-duration:${(gap * 0.9).toFixed(2)}s"/>`).join('');
      return `<svg class="mirror-tiles" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${TILES}<path d="M0 0H1600V900H0z" fill="none" stroke="#7f8d86" stroke-width="3"/></svg>
        <div class="mirror-glass"><div class="mirror-reflection"><i class="mirror-light"></i></div>
          <i class="mirror-fog"></i>${FIGURE}
          <svg class="mirror-words" viewBox="-2 -2 ${width + 4} 18" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>
          <svg class="mirror-crack" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${crackPaths}</g></svg>
        </div>
        <svg class="mirror-tap" viewBox="0 0 160 220" aria-hidden="true"><path d="M10 40H70Q110 40 110 80V100H80V86Q80 70 66 70H10z" fill="#aab4b8" stroke="#323b3f" stroke-width="4"/><rect x="0" y="30" width="22" height="50" fill="#8f9a9e" stroke="#323b3f" stroke-width="4"/><circle class="mirror-drop" cx="95" cy="110" r="8" fill="#cfe8f2"/></svg>
        <i class="mirror-flash"></i>`;
    },
    sound: (output) => {
      const start = now();
      const { times, gap } = writing();
      voice(output, { type: 'sawtooth', freq: 55, length: 3.4, volume: 0.05, at: start });
      for (let i = 0; i < 6; i += 1) voice(output, { freq: 1500, to: 820, length: 0.1, volume: 0.07, at: start + 0.2 + i * 0.52 });
      rub(output, { at: start + 0.1, length: 0.9, volume: 0.04, type: 'highpass', freq: 3000, attack: 0.5 });
      times.forEach((time) => {
        const at = start + time;
        rub(output, { at, length: gap * 0.9, volume: 0.15, freq: 2600, to: 3600, q: 4 });
        voice(output, { type: 'triangle', freq: rand(2200, 2800), to: rand(3000, 3700), length: gap * 0.85, volume: 0.035, at });
      });
      // the figure
      hit(output, start + 2.5);
      burst(output, 0.1, 0.4, start + 2.5);
      // the smash
      burst(output, 0.5, 0.9, start + 2.85);
      for (let i = 0; i < 18; i += 1) voice(output, { freq: rand(2500, 6500), length: 0.05, volume: 0.07, at: start + 2.85 + rand(0, 0.35) });
      clang(output, start + 2.85, 0.2, 680, 0.6);
      hit(output, start + 2.85);
    },
  });

  // ---- elevator: down past the basements, doors open on a crowd

  const FLOORS = ['1', 'B1', 'B2', 'B3', 'B4', 'B5', 'B13'];
  const floorTime = (i) => (i === 0 ? 0 : 0.1 + (i - 1) * 0.27);
  const WARD_ROWS = [[34, 250, 0.4, '#34434b'], [30, 308, 0.5, '#3f4f58'], [26, 376, 0.62, '#506169'], [22, 456, 0.76, '#69798184'.slice(0, 7)], [18, 552, 0.92, '#8696a0'], [14, 668, 1.12, '#a9b9c1']];
  const ward = (() => {
    let out = '';
    WARD_ROWS.forEach(([count, y, size, fill]) => {
      for (let i = 0; i < count; i += 1) {
        const x = ((i + rand(0.1, 0.9)) / count) * 800;
        const tilt = rand(18, 28);
        out += `<g transform="translate(${f1(x)} ${y}) scale(${f1(size)})" fill="${fill}"><path d="M-54 700L-54 110C-54 60 -30 36 0 36C30 36 54 60 54 110L54 700z"/><rect x="-9" y="-4" width="18" height="44"/><g class="elevator-head" style="--tilt:${f1(tilt)}deg"><ellipse cx="0" cy="-12" rx="20" ry="30"/><g fill="#080c0e"><ellipse cx="-8" cy="-14" rx="3.6" ry="7"/><ellipse cx="8" cy="-14" rx="3.6" ry="7"/></g></g></g>`;
      }
    });
    return out;
  })();

  SCARES.push({
    name: 'elevator',
    ms: 3500,
    html: () => `<div class="elevator-car">
      <div class="elevator-plate">${FLOORS.map((label, i) => `<b class="elevator-floor${i === FLOORS.length - 1 ? ' elevator-last' : ''}" style="animation-delay:${floorTime(i).toFixed(2)}s;animation-duration:${i === FLOORS.length - 1 ? 0.01 : (i === 0 ? 0.1 : 0.27)}s">${label}</b>`).join('')}</div>
      <div class="elevator-shaft"><svg viewBox="0 0 800 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><radialGradient id="elevatorWard" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#26343a"/><stop offset="1" stop-color="#030506"/></radialGradient></defs>
        <rect width="800" height="700" fill="url(#elevatorWard)"/>${ward}</svg>
        <i class="elevator-door elevator-left"></i><i class="elevator-door elevator-right"></i></div></div>`,
    sound: (output) => {
      const start = now();
      voice(output, { type: 'sawtooth', freq: 62, length: 1.7, volume: 0.1, at: start });
      voice(output, { type: 'sine', freq: 31, length: 3.4, volume: 0.25, at: start });
      FLOORS.forEach((_, i) => {
        if (i === 0) return;
        const at = start + floorTime(i);
        tone(output, { path: [[0, 95], [0.15, 48]], length: 0.2, volume: 0.45, at });
        burst(output, 0.03, 0.18, at);
      });
      voice(output, { freq: 1568, length: 0.9, volume: 0.1, at: start + 1.55 });
      voice(output, { freq: 3136, length: 0.5, volume: 0.03, at: start + 1.55 });
      rub(output, { at: start + 1.65, length: 0.5, volume: 0.2, type: 'lowpass', freq: 400, attack: 0.1 });
      voice(output, { type: 'square', freq: 220, to: 180, length: 0.5, volume: 0.03, at: start + 1.65 });
      // the heads
      hit(output, start + 2.9);
      burst(output, 0.12, 0.35, start + 2.9);
      [1, 1.5, 1.26].forEach((ratio) => tone(output, { type: 'sawtooth', path: [[0, 330 * ratio], [0.5, 350 * ratio]], length: 0.5, volume: 0.1, wobble: [5, 30], at: start + 2.9 }));
      // the doors
      clang(output, start + 3.17, 0.4, 150);
      hit(output, start + 3.17);
    },
  });

  // ---- morgue: a wall of drawers

  const MORGUE_COLS = 5;
  const MORGUE_ROWS = 3;
  const FIRST_DRAWER = 7;

  SCARES.push({
    name: 'morgue',
    ms: 3300,
    html: () => `<div class="morgue-wall">${Array.from({ length: MORGUE_COLS * MORGUE_ROWS }, (_, i) => `<div class="morgue-cell${i === FIRST_DRAWER ? ' morgue-first' : ''}" style="--d:${rand(0, 0.07).toFixed(3)}s;--tilt:${f1(rand(-1.2, 1.2))}deg">
      <i class="morgue-bay"></i><i class="morgue-tray"></i><b class="morgue-door"><u class="morgue-handle"></u><s class="morgue-tag"></s></b></div>`).join('')}</div><i class="morgue-flash"></i>`,
    sound: (output) => {
      const start = now();
      voice(output, { type: 'sine', freq: 50, length: 3.2, volume: 0.1, at: start });
      rub(output, { at: start, length: 3, volume: 0.025, type: 'highpass', freq: 5000, attack: 0.4 });
      // rollers squeaking, slow
      for (let i = 0; i < 7; i += 1) {
        const at = start + 0.7 + i * 0.19;
        voice(output, { type: 'triangle', freq: rand(1700, 2300), to: rand(2600, 3200), length: 0.15, volume: 0.045, at });
        rub(output, { at, length: 0.15, volume: 0.07, freq: 3000, q: 3 });
      }
      rub(output, { at: start + 0.7, length: 1.4, volume: 0.07, type: 'lowpass', freq: 260, attack: 0.5 });
      clang(output, start + 2.1, 0.06, 420, 0.5);
      // every drawer at once
      const crash = start + 2.55;
      hit(output, crash);
      burst(output, 0.6, 0.85, crash);
      for (let i = 0; i < 16; i += 1) clang(output, crash + rand(0, 0.09), 0.1, rand(110, 520), 0.55);
      rub(output, { at: crash, length: 0.9, volume: 0.3, type: 'bandpass', freq: 1800, to: 500, q: 0.6, attack: 0.02 });
    },
  });

  // ---- cat: the shadow on the wall, then the real thing

  const MONSTER_SHADOW = `<svg class="cat-shadow" viewBox="0 0 400 700" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><g fill="#000">
    <path d="M200 20L226 96Q262 104 276 150L292 250L326 170L346 80L360 170L372 230L388 150L396 190L380 292L318 330L300 420L280 560L294 700H106L120 560L100 420L82 330L20 292L4 190L12 150L28 230L40 170L54 80L74 170L108 250L124 150Q138 104 174 96z"/>
    <path d="M178 98L150 -10L212 66zM222 98L250 -10L188 66z"/>
    <path d="M8 290L-30 320L0 304L-6 340L22 300zM392 290L430 320L400 304L406 340L378 300z"/></g>
    <g fill="#6a5a38"><ellipse cx="178" cy="124" rx="9" ry="5"/><ellipse cx="224" cy="124" rx="9" ry="5"/></g></svg>`;

  const CAT_LEAP = `<svg class="cat-leap" viewBox="0 0 800 600" aria-hidden="true">
    <g fill="#050505" stroke="#050505" stroke-linejoin="round">
      <path d="M130 520C70 420 90 260 190 190C250 150 330 130 400 130C470 130 550 150 610 190C710 260 730 420 670 520z"/>
      <path d="M180 200L150 120L240 168zM620 200L650 120L560 168z" stroke-width="10"/>
      <path d="M200 170L165 70L275 140zM600 170L635 70L525 140z"/>
      <path d="M120 300L60 150Q40 90 90 60Q130 50 140 100z" stroke-width="14"/>
      <path d="M150 430Q120 520 100 580L170 590L200 520zM650 430Q680 520 700 580L630 590L600 520z"/>
      <path d="M135 260L100 230L128 280zM665 260L700 230L672 280zM170 195L130 150L180 215zM630 195L670 150L620 215z"/>
    </g>
    <path d="M205 160L180 100L250 148zM595 160L620 100L550 148z" fill="#5a2a30"/>
    <g class="cat-eyes" fill="#76ff3a" stroke="#d6ff9a" stroke-width="3"><path d="M215 250Q270 200 340 250Q290 300 215 250z"/><path d="M585 250Q530 200 460 250Q510 300 585 250z"/></g>
    <g fill="#000"><ellipse cx="278" cy="250" rx="9" ry="34"/><ellipse cx="522" cy="250" rx="9" ry="34"/></g>
    <path d="M370 320L430 320L400 360z" fill="#c8607a"/>
    <path d="M250 380Q400 330 550 380Q560 520 400 580Q240 520 250 380z" fill="#7d101c" stroke="#000" stroke-width="8"/>
    <g fill="#fffdf0" stroke="#000" stroke-width="3"><path d="M270 392L300 480L330 396zM530 392L500 480L470 396zM340 396L360 440L380 392zM460 396L440 440L420 392z"/><path d="M300 540L322 490L344 548zM500 540L478 490L456 548z"/></g>
    <path d="M330 520Q400 600 470 520Q400 560 330 520z" fill="#d6405a"/>
    <g stroke="#e8e8e0" stroke-width="5" fill="none" stroke-linecap="round"><path d="M330 330L170 300M330 345L150 350M330 360L180 400M470 330L630 300M470 345L650 350M470 360L620 400"/></g></svg>`;

  const CAT_SIT = `<svg class="cat-sit" viewBox="0 0 220 300" aria-hidden="true">
    <g fill="#050505" stroke="#050505" stroke-linejoin="round">
      <path d="M60 300C40 220 56 150 90 126C70 100 76 70 100 62C118 56 140 62 148 84C156 104 150 120 140 132C176 150 188 220 176 300z"/>
      <path d="M86 70L82 28L112 58zM142 74L156 34L122 60z"/>
      <path d="M176 280Q250 280 244 200Q240 150 214 160" fill="none" stroke-width="16" stroke-linecap="round"/>
    </g>
    <g class="cat-paw" style="transform-origin:112px 190px"><path d="M104 200Q92 160 112 112" fill="none" stroke="#050505" stroke-width="22" stroke-linecap="round"/></g>
    <g fill="#76ff3a"><path d="M100 90Q108 82 118 90Q108 98 100 90z"/><path d="M128 90Q136 82 146 90Q136 98 128 90z"/></g>
    <path class="cat-tongue" d="M116 112Q122 130 128 114z" fill="#e0607a"/></svg>`;

  SCARES.push({
    name: 'cat',
    ms: 3500,
    html: () => `<div class="cat-room"><i class="cat-wall"></i><i class="cat-floor"></i>
      <div class="cat-door"><i class="cat-glow"></i>${CAT_SIT}</div>
      ${MONSTER_SHADOW}${CAT_LEAP}<i class="cat-dim"></i></div>`,
    sound: (output) => {
      const start = now();
      // the low growl under the rising shadow
      tone(output, { type: 'sawtooth', path: [[0, 58], [1.4, 74]], length: 1.5, volume: 0.28, wobble: [24, 50], at: start + 0.05 });
      rub(output, { at: start + 0.1, length: 1.4, volume: 0.1, freq: 260, to: 520, q: 2, attack: 0.5 });
      // the leap and the yowl
      hit(output, start + 1.55);
      burst(output, 0.2, 0.55, start + 1.55);
      [1, 1.01].forEach((ratio) => tone(output, { type: 'sawtooth', path: [[0, 700 * ratio], [0.12, 1400 * ratio], [0.55, 950 * ratio], [0.8, 1250 * ratio]], length: 0.85, volume: 0.28, wobble: [18, 90], at: start + 1.56 }));
      rub(output, { at: start + 1.56, length: 0.8, volume: 0.4, freq: 2500, to: 1500, q: 1.2, attack: 0.02 });
      // the mew
      voice(output, { type: 'triangle', freq: 640, to: 920, length: 0.11, volume: 0.07, at: start + 2.75 });
      voice(output, { type: 'triangle', freq: 920, to: 600, length: 0.25, volume: 0.07, at: start + 2.86 });
    },
  });

  // ---- belly: a cartoon chest-burster gag in the moonlit ward

  const BELLY_GHOST = `<svg class="belly-monster" viewBox="0 0 300 400" aria-hidden="true">
    <g stroke="#14081c" stroke-width="7" stroke-linejoin="round">
      <path d="M150 20C70 20 40 100 50 190C54 250 20 300 30 380L70 340L100 390L140 340L180 392L220 340L262 380C270 300 246 250 250 190C260 100 230 20 150 20Z" fill="#eef3ee"/>
      <path d="M52 200L-10 150L-16 90L10 130L16 70L40 120L56 130zM248 200L310 150L316 90L290 130L284 70L260 120L244 130z" fill="#e0e8e2"/>
    </g>
    <g fill="#14081c"><ellipse cx="108" cy="120" rx="26" ry="34" transform="rotate(8 108 120)"/><ellipse cx="192" cy="120" rx="26" ry="34" transform="rotate(-8 192 120)"/></g>
    <g fill="#fff"><circle cx="112" cy="108" r="8"/><circle cx="196" cy="108" r="8"/></g>
    <path d="M70 200Q150 180 230 200Q250 290 150 330Q50 290 70 200z" fill="#14081c"/>
    <g fill="#fff"><path d="M84 204L100 250L116 200zM216 204L200 250L184 200zM124 198L138 232L152 196zM176 198L162 232L148 196z"/><path d="M110 300L126 262L142 316zM190 300L174 262L158 316z"/></g>
    <g fill="#14081c"><path d="M-16 90L-4 40L8 92zM316 90L304 40L292 92zM-10 150L-34 118L-2 134z"/></g></svg>`;

  const BELLY_GOO = `<svg class="belly-goo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="#1a0e24" stroke="#07030b" stroke-width="6">
    ${Array.from({ length: 16 }, () => `<ellipse cx="${f1(rand(40, 1560))}" cy="${f1(rand(30, 700))}" rx="${f1(rand(30, 110))}" ry="${f1(rand(22, 80))}" transform="rotate(${f1(rand(-40, 40))} 800 400)"/>`).join('')}
    <path d="M0 0H1600V90Q1500 130 1450 70Q1350 160 1280 70Q1180 120 1100 70Q980 200 900 70Q800 140 700 70Q600 160 520 70Q420 120 340 70Q240 190 160 70Q80 120 0 90z"/>
    ${Array.from({ length: 10 }, () => `<path class="belly-drip" style="--d:${f1(rand(0.1, 0.5))}s" d="M${f1(rand(60, 1540))} 80v${f1(rand(160, 520))}q0 28 -22 28t-22 -28v-${f1(rand(160, 520))}z"/>`).join('')}</g>
    <g fill="#5d3b78" opacity=".6"><ellipse cx="300" cy="120" rx="40" ry="12"/><ellipse cx="1100" cy="70" rx="50" ry="12"/></g></svg>`;

  SCARES.push({
    name: 'belly',
    ms: 3500,
    html: () => `<div class="belly-room"><svg class="belly-bed" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${globalThis.wardRoomArt()}
      <g transform="translate(0 0)">
        <path d="M440 610C430 560 450 524 500 520C560 516 600 540 640 580L660 612z" fill="#030405"/>
        <path d="M620 590C700 560 780 560 860 566L1330 560C1360 560 1380 580 1380 612H640z" fill="#030405"/>
        <path d="M640 612C700 570 780 566 860 572C880 574 900 576 920 600L1340 606L1380 618H640z" fill="#aab6bb" opacity=".92"/>
        <path d="M700 612Q740 590 800 598M1100 616Q1160 590 1220 604M1260 612Q1300 596 1330 606" fill="none" stroke="#6d7b82" stroke-width="5" stroke-linecap="round"/>
        <g class="belly-swell"><path d="M860 574C900 450 1040 440 1100 520C1130 556 1140 590 1150 612L860 612z" fill="#030405"/>
          <path d="M870 590C910 470 1030 460 1088 528C1116 560 1126 594 1134 612L870 612z" fill="#c1ccd0"/>
          <path d="M890 560C930 500 1020 490 1060 530" fill="none" stroke="#e9f1f3" stroke-width="5" stroke-linecap="round" opacity=".7"/>
          <g class="belly-bump belly-bump-a"><ellipse cx="960" cy="520" rx="30" ry="26" fill="#d2dcdf" stroke="#7e8d94" stroke-width="3"/></g>
          <g class="belly-bump belly-bump-b"><ellipse cx="1040" cy="510" rx="34" ry="30" fill="#d2dcdf" stroke="#7e8d94" stroke-width="3"/></g>
          <path class="belly-tear" d="M960 470L992 520L1020 466L1050 530L1080 480L1010 612L930 560z" fill="#030405"/></g>
      </g></svg>
      <div class="belly-pop">${BELLY_GHOST}</div>${BELLY_GOO}<i class="belly-flash"></i></div>`,
    sound: (output) => {
      const start = now();
      voice(output, { type: 'sine', freq: 48, length: 3.4, volume: 0.22, at: start });
      voice(output, { type: 'sawtooth', freq: 55, to: 80, length: 2.2, volume: 0.04, at: start });
      // slow heartbeat
      [0.25, 1.15, 1.9].forEach((s) => {
        tone(output, { path: [[0, 70], [0.12, 45]], length: 0.16, volume: 0.5, at: start + s });
        tone(output, { path: [[0, 62], [0.12, 42]], length: 0.14, volume: 0.35, at: start + s + 0.22 });
      });
      // the wet thumps
      [1.25, 1.75].forEach((s) => {
        tone(output, { path: [[0, 150], [0.2, 50]], length: 0.25, volume: 0.6, at: start + s });
        rub(output, { at: start + s, length: 0.25, volume: 0.28, type: 'lowpass', freq: 700, to: 150, q: 2 });
      });
      rub(output, { at: start + 0.4, length: 1.8, volume: 0.06, type: 'bandpass', freq: 500, to: 220, q: 3, attack: 1 });
      // burst
      hit(output, start + 2.35);
      burst(output, 0.3, 0.8, start + 2.35);
      rub(output, { at: start + 2.35, length: 0.5, volume: 0.45, type: 'lowpass', freq: 1800, to: 200, q: 1, attack: 0.01 });
      shriek(output, start + 2.38, 0.2, 0.9);
    },
  });

  // ---- crawler: a long-limbed black thing scuttles across the sheet, stops dead in the middle and looks round.
  {
    const poseSeed = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    const jit = (a) => (poseSeed() * 2 - 1) * a;
    const P = (x, y) => `${f1(x)},${f1(y)}`;
    /** A tapering angular bar from a to b. */
    const bar = (a, b, w1, w2) => {
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      return `<polygon points="${P(a[0] + nx * w1, a[1] + ny * w1)} ${P(b[0] + nx * w2, b[1] + ny * w2)} ${P(b[0] - nx * w2, b[1] - ny * w2)} ${P(a[0] - nx * w1, a[1] - ny * w1)}"/>`;
    };
    /** A limb root to tip with one zigzag joint per offset (signed, perpendicular to the chord; up when `up`). Knobby elbows, long nails. */
    const limb = (root, tip, offsets, width, up, hand = 1) => {
      const dx = tip[0] - root[0];
      const dy = tip[1] - root[1];
      const len = Math.hypot(dx, dy) || 1;
      let nx = dy / len;
      let ny = -dx / len;
      if (up && ny > 0) { nx = -nx; ny = -ny; }
      const count = offsets.length + 1;
      const pts = [root];
      offsets.forEach((o, i) => {
        const f = (i + 1) / count + jit(0.03);
        pts.push([root[0] + dx * f + nx * o, root[1] + dy * f + ny * o]);
      });
      pts.push(tip);
      let out = '';
      pts.forEach((p, i) => {
        if (i === 0) return;
        const w1 = width * (1 - (i - 1) / pts.length * 0.7);
        const w2 = width * (1 - i / pts.length * 0.7);
        out += bar(pts[i - 1], p, w1, w2);
        if (i < pts.length - 1) out += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${f1(width * 1.05)}"/>`;
      });
      const base = Math.atan2(dy, dx);
      for (let n = -1; n <= 1; n += 1) {
        const ang = base + n * 0.55 + jit(0.15);
        const flen = width * 7 * hand;
        out += bar(tip, [tip[0] + Math.cos(ang) * flen, tip[1] + Math.sin(ang) * flen], width * 0.45, 0.4);
      }
      return out;
    };
    const SKIN = '#d6d1c0';
    /** Long limp hair, in world space so it hangs straight down whatever the head does. */
    const hair = (hx, hy, s, side) => {
      let out = '';
      const n = side ? 7 : 12;
      for (let i = 0; i < n; i += 1) {
        let f = i / (n - 1) - 0.5;
        if (!side) f = f < 0 ? f - 0.34 : f + 0.34; // keep the face clear
        const sx = hx + f * (side ? 34 : 56) * s + jit(3) * s;
        const len = (60 + poseSeed() * 120) * s;
        const ex = sx + (jit(10) + f * 22) * s;
        const ey = hy + len;
        out += bar([sx, hy - 8 * s], [ex, ey], 2.8 * s, 0.3);
      }
      return out;
    };
    /** Pale head at (hx,hy) scaled by s and tilted. side: a featureless pale oval turned away; front: the face, the whole point. */
    const head = (hx, hy, s, tilt, mode) => {
      const cap = 'M-25 4C-29 -34 -10 -46 3 -44C22 -46 31 -28 26 6C21 -16 8 -25 -3 -23C-14 -20 -21 -10 -25 4Z';
      const face = mode === 'front'
        ? `<ellipse cx="0" cy="9" rx="20" ry="32" fill="${SKIN}"/><path d="${cap}"/>
          <ellipse cx="-8.5" cy="1" rx="5.5" ry="8.5" fill="#000" transform="rotate(-16 -8.5 1)"/><ellipse cx="9" cy="1" rx="5.5" ry="8.5" fill="#000" transform="rotate(16 9 1)"/>
          <path d="M-9 17Q0 12 9 17L12 30Q8 46 0 47Q-8 46 -12 30Z" fill="#000"/>
          <path d="M-7 17L-5 23L-2 17.5L1 23.5L4 17.5L6 22" fill="none" stroke="${SKIN}" stroke-width="1.8"/>`
        : `<ellipse cx="6" cy="6" rx="12" ry="25" fill="${SKIN}"/><path d="${cap}" transform="translate(-5 2) scale(.85 1)"/>`;
      return `${hair(hx, hy, s, mode !== 'front')}<g transform="translate(${f1(hx)} ${f1(hy)}) rotate(${tilt}) scale(${s})">${face}</g>`;
    };
    /** One whole creature: body centre (x,y), size s. `tips` are absolute foot/hand targets (arms front, legs back). */
    const creature = (x, y, s, tips, mode, tilt, reach, wide) => {
      const sh = [x + 52 * s, y - 8 * s];
      const hp = [x - 62 * s, y + 6 * s];
      const torso = [[-92, 14], [-70, -2], [-40, -4], [-14, -22], [34, -30], [66, -14], [62, 2], [30, 6], [-8, 12], [-36, 12], [-60, 20]]
        .map(([a, b]) => P(x + a * s, y + b * s)).join(' ');
      let thorns = '';
      for (let i = 0; i < 7; i += 1) {
        const px = -60 + i * 17;
        const py = i < 2 ? -5 - i * 3 : -4 - Math.sin((i - 1) / 5 * 1.6) * 24;
        thorns += `<polygon points="${P(x + (px - 4) * s, y + (py + 2) * s)} ${P(x + (px + 8) * s, y + (py - 12 - (i % 2) * 5) * s)} ${P(x + (px + 5) * s, y + (py + 4) * s)}"/>`;
      }
      const w = 4.4 * s;
      const neck = [x + 78 * s, y - 20 * s];
      const skull = [x + 128 * s, y - 38 * s];
      const o = (a) => a.map((v) => v * reach);
      return `<g>${limb(hp, tips[2], o([150, 15, 130, 10]), w, !wide, 1.1)}
        ${limb(hp, tips[3], o([90, 130, 10]), w, !wide, 1.1)}
        ${limb(sh, tips[0], o([150, 20, 160, 20, 90]), w, !wide)}
        ${limb(sh, tips[1], o([110, 150, 15, 120]), w, !wide)}
        <polygon points="${torso}"/>${thorns}
        ${bar([x + 56 * s, y - 20 * s], neck, 8 * s, 4 * s)}${bar(neck, [skull[0] - 8 * s, skull[1] + 6 * s], 3.4 * s, 3 * s)}
        ${head(skull[0], skull[1], s, tilt, mode)}</g>`;
    };

    const GROUND = 150;
    const STAND_X = 800;
    const STAND_Y = 430;
    // [start-hold in ms per pose], one array per burst; gaps are the dead-still pauses after each burst
    const BURSTS = [[70, 60, 80], [60, 70, 60, 75], [65, 55, 70], [70, 60, 60], [55, 65, 60, 70]];
    const GAPS = [120, 170, 110, 220, 850];
    const poseCount = BURSTS.reduce((n, b) => n + b.length, 0);
    const START_X = -190;
    const SNAP_AT = BURSTS.reduce((t, b, i) => t + b.reduce((a, c) => a + c, 0) + GAPS[i], 0);
    const SNAP_MS = 190;
    const MID_MS = 60;
    const FINAL_MS = 600;
    const END_MS = SNAP_AT + SNAP_MS + MID_MS + FINAL_MS;
    /** What the sound needs: when each pose lands, and when a burst of movement starts. */
    const poseTimes = [];

    const buildCrawler = () => {
      poseTimes.length = 0;
      let out = '';
      let t = 0;
      let x = START_X;
      let index = 0;
      let planted = null;
      const step = (STAND_X - START_X) / poseCount;
      const emit = (start, hold, body) => {
        out += `<g class="crawler-pose" style="--t:${start}ms;--d:${hold}ms">${body}</g>`;
      };
      BURSTS.forEach((burst, b) => {
        burst.forEach((hold, k) => {
          x += step * (0.7 + poseSeed() * 0.6);
          index += 1;
          const last = k === burst.length - 1;
          const bx = index === poseCount ? STAND_X : x;
          const by = index === poseCount ? STAND_Y : STAND_Y + jit(14) + (index % 2) * 8;
          const gy = by + GROUND;
          // alternate which feet move: planted ones stay on the sheet
          const fresh = [
            [bx + 190 + jit(60), gy + jit(8)], [bx + 270 + jit(60), gy + jit(8)],
            [bx - 200 + jit(60), gy + jit(8)], [bx - 120 + jit(50), gy + jit(8)],
          ];
          const tips = fresh.map((tip, i) => (planted && (i + index) % 2 === 0 && Math.abs(planted[i][0] - bx) < 330 && index !== poseCount ? planted[i] : tip));
          planted = tips;
          const dur = hold + (last ? GAPS[b] : 0);
          poseTimes.push({ at: t, burstStart: k === 0, last });
          emit(t, dur, creature(bx, by, 1, tips, 'side', 62 + jit(10), 1, false));
          t += dur;
        });
      });
      const rest = planted;
      // head snaps round: same crouch, the face is suddenly there, cocked
      emit(t, SNAP_MS, creature(STAND_X, STAND_Y, 1, rest, 'front', -14, 1, false));
      t += SNAP_MS;
      // the spring: halfway
      emit(t, MID_MS, creature(STAND_X - 150, STAND_Y - 30, 2.0, [[1130, 30], [1500, 150], [180, 80], [260, 840]], 'front', -8, 1.3, true));
      t += MID_MS;
      // limbs flung wide across the whole screen
      out += `<g class="crawler-wide" style="--t:${t}ms;--d:${FINAL_MS}ms"><g class="crawler-shake" style="--t:${t}ms">${creature(
        400, STAND_Y - 20, 3.1,
        [[1750, -60], [1800, 960], [-150, -40], [-100, 980]], 'front', -6, 2.2, true,
      )}</g></g><i class="crawler-flash" style="--t:${t}ms"></i>`;
      poseTimes.push({ at: SNAP_AT });
      return out;
    };

    SCARES.push({
      name: 'crawler',
      ms: END_MS + 60,
      html: () => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="#000">${buildCrawler()}</svg>`,
      sound: (output) => {
        const start = now();
        const at = (ms) => start + ms / 1000;
        // joint clicks and scrabbling nails on every pose, in bursts
        poseTimes.slice(0, poseCount).forEach(({ at: ms }) => {
          const when = at(ms);
          tone(output, { type: 'square', path: [[0, rand(2200, 3400)], [0.025, rand(900, 1500)]], length: 0.03, volume: 0.12, at: when });
          tone(output, { type: 'square', path: [[0, rand(1400, 2000)], [0.02, 700]], length: 0.025, volume: 0.1, at: when + rand(0.012, 0.03) });
          for (let i = 0; i < 6; i += 1) burst(output, 0.012, rand(0.05, 0.14), when + rand(0, 0.06));
          rub(output, { at: when, length: 0.07, volume: 0.1, type: 'highpass', freq: 3500, q: 1, attack: 0.004 });
        });
        // dead silence for the beat, then the neck: one dry snap
        const snap = at(SNAP_AT);
        tone(output, { type: 'square', path: [[0, 1700], [0.03, 300]], length: 0.05, volume: 0.35, at: snap });
        burst(output, 0.035, 0.7, snap);
        tone(output, { path: [[0, 110], [0.1, 60]], length: 0.12, volume: 0.3, at: snap });
        // the spring and the shriek
        const spring = at(SNAP_AT + SNAP_MS + MID_MS);
        hit(output, spring);
        burst(output, 0.3, 0.75, spring);
        shriek(output, spring, 0.2, 1);
        tone(output, { type: 'sawtooth', path: [[0, 2600], [0.5, 3400]], length: 0.6, volume: 0.07, wobble: [55, 160], at: spring });
      },
    });
  }

  // Now that all scares exist, put them in the order of the questions. Pouring blood closes the assessment.
  SCARES.splice(0, SCARES.length, ...SCARE_ORDER.map((name) => SCARES.find((scare) => scare.name === name)));
}

// These open on a scene, so they rise out of the dark. The others strike at once.
const SCARE_FADE_IN = ['crawler', 'lights', 'cctv', 'xray', 'mirror', 'cat', 'belly', 'elevator', 'flatline', 'morgue', 'wheelchair', 'phew'];
SCARES.forEach((scare) => { scare.fadeIn = SCARE_FADE_IN.includes(scare.name); });

// Measured trims, so every scare hits equally hard.
Object.assign(SCARE_LEVELS, {
  crawler: 0.6, invoice: 1.12, lights: 0.55, syringe: 0.84, duck: 2.23,
  cctv: 0.7, eye: 0.75, xray: 0.62, mirror: 0.52, rip: 0.74,
  file: 0.69, surgeon: 0.8, teeth: 0.99, phew: 0.64, crash: 0.64,
  door: 0.67, cat: 0.66, belly: 0.63, elevator: 0.56, flatline: 0.68,
  morgue: 0.48, lockdown: 1.56, wheelchair: 0.69, scratches: 0.69, blood: 1.15,
});
