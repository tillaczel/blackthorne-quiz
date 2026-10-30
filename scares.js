// The jump scares, one per question, in order. Loaded after script.js.

const swarm = (count, html, style) => Array.from({ length: count }, () => `<i style="${style()}">${html}</i>`).join('');

SCARES.push(
  { name: 'face', ms: 1300, html: () => SCREAMER, sound: scream },
  {
    name: 'hands',
    ms: 2400,
    html: () => [[8, 12, -14], [66, 8, 12], [20, 50, 8], [70, 50, -10], [42, 22, 3]]
      .map(([left, top, turn], i) => `<i style="left:${left}%;top:${top}%;rotate:${turn}deg;animation-delay:${i * 0.3}s">${HAND}</i>`).join(''),
    sound: (output) => [0, 0.3, 0.6, 0.9, 1.2].forEach((seconds) => {
      const at = audio.context.currentTime + seconds;
      hit(output, at);
      burst(output, 0.09, 0.5, at);
    }),
  },
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
    ms: 3000,
    html: (text) => `<b>${text.phew}</b><div class="late-face">${SCREAMER}</div>`,
    sound: (output) => later(1700, () => scream(output)),
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

  // ---- matron: three hard cuts down a corridor

  const corridor = (() => {
    const edge = (x, wall) => (wall === 'top' ? (x * 330) / 700 : 900 - (x * 340) / 700);
    const door = (from, to, mirror) => {
      const x = (value) => (mirror ? 1600 - value : value);
      const [topA, topB, bottomA, bottomB] = [edge(from, 'top'), edge(to, 'top'), edge(from, 'bottom'), edge(to, 'bottom')];
      const rise = 0.7;
      return `<polygon points="${x(from)},${bottomA - (bottomA - topA) * rise} ${x(to)},${bottomB - (bottomB - topB) * rise} ${x(to)},${bottomB} ${x(from)},${bottomA}" fill="#060908" stroke="#2c3d35" stroke-width="5"/>`;
    };
    const lines = Array.from({ length: 7 }, (_, i) => `<line x1="${700 + i * 33.3}" y1="560" x2="${i * 266}" y2="900"/>`).join('');
    return `<svg class="matron-hall" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><radialGradient id="matronGlow" cx="800" cy="450" r="330" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f1ffd8"/><stop offset=".3" stop-color="#a9cfa0"/><stop offset="1" stop-color="#1a2a22" stop-opacity="0"/></radialGradient></defs>
      <rect width="1600" height="900" fill="#070a08"/>
      <polygon points="0,0 1600,0 900,330 700,330" fill="#0f1814"/>
      <polygon points="0,0 700,330 700,560 0,900" fill="#16221d"/>
      <polygon points="1600,0 900,330 900,560 1600,900" fill="#16221d"/>
      <polygon points="0,900 700,560 900,560 1600,900" fill="#1f2d26"/>
      <g stroke="#34493f" stroke-width="3" fill="none">${lines}</g>
      ${door(80, 250, false)}${door(330, 450, false)}${door(80, 250, true)}${door(330, 450, true)}
      <rect x="700" y="330" width="200" height="230" fill="#c8e8bd"/>
      <circle cx="800" cy="450" r="330" fill="url(#matronGlow)"/>
    </svg>`;
  })();

  const NURSE = `<svg class="matron-nurse" viewBox="0 0 200 400" aria-hidden="true">
    <g fill="#000" stroke="#2b4036" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke">
      <path d="M88 130C44 136 6 150 2 200L4 290H26L36 262L40 300L8 392H192L160 300L164 262L174 290H196L198 200C194 150 156 136 112 130z"/>
      <ellipse cx="70" cy="396" rx="24" ry="5"/><ellipse cx="130" cy="396" rx="24" ry="5"/>
      <rect x="88" y="112" width="24" height="26"/>
      <ellipse cx="100" cy="84" rx="32" ry="38"/>
      <path d="M56 54L64 18Q100 2 136 18L144 54Q100 40 56 54z"/>
    </g>
    <path d="M96 18h8v18h-8zM89 25h22v6h-22z" fill="#6a100c"/>
    <g class="matron-eyes" fill="#eaffb4"><path d="M76 77L98 85L97 92L79 90z"/><path d="M124 77L102 85L103 92L121 90z"/></g>
    <path class="matron-mouth" d="M78 108L83 113L87 106L92 114L97 106L101 115L105 106L110 114L114 106L119 113L123 108" fill="none" stroke="#eaffb4" stroke-width="3" stroke-linejoin="miter"/>
  </svg>`;

  SCARES.push({
    name: 'matron',
    ms: 2900,
    html: () => `<div class="matron-stage">${corridor}<i class="matron-dark"></i>${NURSE}<i class="matron-vignette"></i></div>`,
    sound: (output) => {
      const start = now();
      voice(output, { type: 'sawtooth', freq: 52, length: 2.9, volume: 0.22 });
      [[0.8, 0.55], [1.4, 0.8], [2.0, 1]].forEach(([seconds, volume]) => {
        hit(output, start + seconds);
        burst(output, 0.07, volume * 0.3, start + seconds);
      });
      [1, 1.5, 1.26].forEach((ratio) => tone(output, {
        type: 'sawtooth',
        path: [[0, 1500 * ratio], [0.12, 2500 * ratio], [0.8, 1000 * ratio]],
        length: 0.85,
        volume: 0.22,
        wobble: [38, 150],
        at: start + 2.0,
      }));
      burst(output, 0.7, 0.22, start + 2.0);
    },
  });

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
    <g class="wheelchair-eyes" fill="#ff2a14" transform="translate(150 106) scale(1.35) translate(-150 -106)"><path d="M107 92L136 102L134 114L110 108z"/><path d="M193 92L164 102L166 114L190 108z"/></g></svg>`;

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
      hit(output, start + 2.3);
      burst(output, 0.18, 0.4, start + 2.3);
      [1, 1.5].forEach((ratio) => tone(output, {
        type: 'sawtooth', path: [[0, 2600 * ratio], [0.4, 500 * ratio]], length: 0.5, volume: 0.22, wobble: [28, 120], at: start + 2.3,
      }));
      tone(output, { type: 'sawtooth', path: [[0, 70], [0.8, 38]], length: 0.9, volume: 0.45, at: start + 2.3 });
    },
  });

  // ---- flatline: the monitor, then the spike with teeth

  const SWEEP = 1.7;
  const BEATS = [[100, 140, 1], [270, 150, 1], [400, 150, 0.8], [500, 155, 0.6], [580, 150, 0.5], [645, 145, 0.4], [700, 140, 0.35], [745, 90, 0.3], [785, 40, 0.3]];
  const trace = (() => {
    const offsets = [[-40, 0], [-30, -8], [-20, 0], [-8, 6], [0, null], [10, 26], [18, 0], [45, 0], [60, -12], [75, 0]];
    const path = BEATS.map(([x, height, width]) => offsets.map(([dx, dy]) => `L${(x + dx * width).toFixed(1)} ${200 + (dy === null ? -height : dy)}`).join(' ')).join(' ');
    return `M0 200 ${path} L1000 200`;
  })();
  /** A jagged jaw edge: tooth tips of uneven depth, shifted by half a tooth so the two jaws interlock. */
  const teeth = (depths, shift) => {
    const step = 10;
    const points = ['-10,-40', '110,-40'];
    for (let i = 0; i < 12; i += 1) {
      const right = 110 - shift - i * step;
      points.push(`${right},22`, `${right - step / 2},${22 + depths[i % depths.length]}`);
    }
    return points.join(' ');
  };
  const jaw = (name, depths, shift) => `<svg class="flatline-jaw ${name}" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true"><polygon points="${teeth(depths, shift)}" fill="#08331a" stroke="#58ff86" stroke-width="5" stroke-linejoin="miter" vector-effect="non-scaling-stroke"/></svg>`;

  SCARES.push({
    name: 'flatline',
    ms: 3400,
    html: () => `<div class="flatline-stage"><div class="flatline-line"><svg viewBox="0 0 1000 400" aria-hidden="true"><path d="${trace}" fill="none" stroke="#4dff7e" stroke-width="5" stroke-linejoin="round"/></svg></div>
      <i class="flatline-spike"></i>${jaw('up', [20, 28, 18, 26, 22, 28, 16], 0)}${jaw('down', [26, 18, 28, 20, 24, 16, 28], 5)}</div>`,
    sound: (output) => {
      const start = now();
      BEATS.forEach(([x]) => voice(output, { freq: 1000, length: 0.07, volume: 0.3, at: start + (x / 1000) * SWEEP }));
      voice(output, { freq: 1000, length: 1.4, volume: 0.3, at: start + 1.42 });
      voice(output, { type: 'sawtooth', freq: 180, to: 1700, length: 0.3, volume: 0.28, at: start + 2.0 });
      hit(output, start + 2.8);
      burst(output, 0.2, 0.4, start + 2.8);
      clang(output, start + 2.8, 0.12, 140);
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

  // ---- bedpan

  const BEDPAN_SORRY = { en: 'sorry', de: 'Verzeihung' };
  const BEDPAN_CLANG = { en: 'CLANG!', de: 'KLONG!' };
  const BEDPAN = `<svg viewBox="0 0 280 170" aria-hidden="true">
    <defs><linearGradient id="bedpan-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef3f4"/><stop offset=".45" stop-color="#9aa8ad"/><stop offset="1" stop-color="#55626a"/></linearGradient></defs>
    <path d="M226 66 256 52Q274 48 274 64V86Q274 100 256 96L228 88Z" fill="url(#bedpan-steel)" stroke="#2f383d" stroke-width="4"/>
    <ellipse cx="257" cy="74" rx="7" ry="11" fill="#1b2023"/>
    <path d="M14 74C14 142 62 164 128 164S242 142 242 74Z" fill="url(#bedpan-steel)" stroke="#2f383d" stroke-width="4"/>
    <ellipse cx="128" cy="74" rx="114" ry="31" fill="#d3dcde" stroke="#2f383d" stroke-width="4"/>
    <ellipse cx="128" cy="79" rx="92" ry="21" fill="#323a3f"/>
    <path d="M40 100C48 132 78 150 112 154" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="7" stroke-linecap="round"/>
    <path d="M44 62Q80 46 130 44" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="5" stroke-linecap="round"/>
  </svg>`;

  SCARES.push({
    name: 'bedpan',
    ms: 3400,
    html: () => `<div class="bedpan-drop"><div class="bedpan-pan">${BEDPAN}</div></div>
      <b class="bedpan-clang">${say(BEDPAN_CLANG)}</b><small class="bedpan-sorry">${say(BEDPAN_SORRY)}</small>`,
    sound: (output) => {
      const start = now();
      const land = start + 0.32;
      // the clang and a smaller second one off the bounce
      ring(output, 470, 0.5, land, 1.1);
      voice(output, { pitch: [[0, 190], [0.2, 60]], level: [[0, 0.8], [0.22, 0]], at: land });
      rush(output, { at: land, level: [[0, 0.5], [0.05, 0]], sweep: ['highpass', 1, [[0, 2000]]] });
      ring(output, 520, 0.22, land + 0.27, 0.5);
      // the spin: clinks that come closer and closer, under a rising whirr
      const spin = land + 0.3;
      let gap = 0.35;
      let at = spin;
      for (let k = 0; gap > 0.014; k += 1) {
        const fade = Math.max(0.25, 1 - k * 0.05);
        voice(output, { type: 'triangle', pitch: [[0, randomRange(1500, 2400)], [0.05, randomRange(1100, 1500)]], level: [[0, 0.3 * fade], [0.05, 0]], at });
        rush(output, { at, level: [[0, 0.22 * fade], [0.02, 0]], sweep: ['bandpass', 3, [[0, 3000]]] });
        at += gap;
        gap *= 0.8;
      }
      voice(output, { type: 'sawtooth', pitch: [[0, 140], [at - spin, 1500]], level: [[0, 0], [at - spin - 0.1, 0.1], [at - spin + 0.1, 0]], at: spin, filter: ['bandpass', 4, 900] });
      rush(output, { at: at - 0.1, level: [[0, 0], [0.1, 0.18], [0.35, 0]], sweep: ['bandpass', 2, [[0, 5000], [0.35, 1500]]] });
    },
  });

  // ---- clown

  const CLOWN_HONK = { en: 'HONK!', de: 'TÜÜT!' };
  const CLOWN = `<svg class="clown-svg" viewBox="0 0 300 432" aria-hidden="true">
    <path d="M30 412V372Q30 306 108 292H192Q270 306 270 372V412Z" fill="#eef0ea" stroke="#9aa09a" stroke-width="4"/>
    <ellipse cx="150" cy="418" rx="112" ry="13" fill="#7c868c" stroke="#3f484d" stroke-width="4"/>
    <path d="M112 292 150 362 188 292" fill="#d9ddd4" stroke="#9aa09a" stroke-width="3"/>
    <rect x="198" y="352" width="46" height="40" rx="4" fill="none" stroke="#b9beb5" stroke-width="3"/><path d="M210 352v-22M224 352v-16M236 352v-20" stroke="#1d6fd6" stroke-width="5" stroke-linecap="round"/>
    <path d="M100 290C84 380 112 410 150 410S216 380 200 290" fill="none" stroke="#1d2126" stroke-width="8" stroke-linecap="round"/>
    <circle cx="150" cy="412" r="16" fill="#cfd5d9" stroke="#1d2126" stroke-width="5"/>
    <path d="M150 300 112 282V318ZM150 300 188 282V318Z" fill="#d8231c" stroke="#7a0f0c" stroke-width="3"/><circle cx="150" cy="300" r="9" fill="#a8140f"/>
    <rect x="124" y="250" width="52" height="50" fill="#e9e5d6"/>
    <g fill="#e8431f" stroke="#8d230e" stroke-width="3"><circle cx="60" cy="112" r="30"/><circle cx="42" cy="152" r="32"/><circle cx="58" cy="196" r="28"/><circle cx="240" cy="112" r="30"/><circle cx="258" cy="152" r="32"/><circle cx="242" cy="196" r="28"/><circle cx="86" cy="70" r="24"/><circle cx="214" cy="70" r="24"/></g>
    <ellipse cx="150" cy="168" rx="92" ry="108" fill="#f5f2e8" stroke="#aaa493" stroke-width="4"/>
    <path d="M64 120Q150 52 236 120" fill="none" stroke="#2a2d31" stroke-width="10"/>
    <circle cx="150" cy="86" r="30" fill="#d7dde0" stroke="#2a2d31" stroke-width="6"/><circle cx="150" cy="86" r="8" fill="#15181b"/><path d="M130 72Q138 64 150 62" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    <g fill="#1d6fd6" stroke="#0b3f86" stroke-width="3"><path d="M106 124l11 18-11 18-11-18Z"/><path d="M194 124l-11 18 11 18 11-18Z"/></g>
    <g fill="#fff" stroke="#15181b" stroke-width="5"><ellipse cx="108" cy="162" rx="19" ry="23"/><ellipse cx="192" cy="162" rx="19" ry="23"/></g>
    <circle cx="112" cy="166" r="7.5" fill="#15181b"/><circle cx="188" cy="166" r="7.5" fill="#15181b"/>
    <path d="M82 122Q106 100 130 120M170 120Q194 100 218 122" fill="none" stroke="#15181b" stroke-width="8" stroke-linecap="round"/>
    <circle cx="86" cy="214" r="17" fill="#f0a2a0" opacity=".7"/><circle cx="214" cy="214" r="17" fill="#f0a2a0" opacity=".7"/>
    <circle class="clown-nose" cx="150" cy="206" r="26" fill="#e2171c" stroke="#8b0b10" stroke-width="3"/><ellipse cx="142" cy="197" rx="8" ry="5" fill="#fff" opacity=".7"/>
    <path class="clown-smile" d="M116 250Q150 272 184 250" fill="none" stroke="#c4151b" stroke-width="9" stroke-linecap="round"/>
    <g class="clown-grin">
      <defs><clipPath id="clown-lips"><path d="M34 236Q150 280 266 236Q150 372 34 236Z"/></clipPath></defs>
      <path d="M34 236Q150 280 266 236Q150 372 34 236Z" fill="#1b0508"/>
      <g clip-path="url(#clown-lips)"><path d="M34 240Q150 284 266 240" fill="none" stroke="#fff" stroke-width="30"/><path d="M34 252Q150 296 266 252" fill="none" stroke="#fff" stroke-width="18"/><path d="M70 236v36M100 244v36M130 248v38M150 249v38M170 248v38M200 244v36M230 236v36" stroke="#2a1014" stroke-width="3"/><ellipse cx="150" cy="318" rx="60" ry="30" fill="#a8242c"/></g>
      <path d="M34 236Q150 280 266 236Q150 372 34 236Z" fill="none" stroke="#c4151b" stroke-width="9" stroke-linejoin="round"/>
    </g>
  </svg>`;
  const SPRING = `<svg class="clown-spring" viewBox="0 0 100 200" preserveAspectRatio="none" aria-hidden="true">
    <path d="M18 0H82L18 26H82L18 52H82L18 78H82L18 104H82L18 130H82L18 156H82L18 182H82L50 200" fill="none" stroke="#5e686e" stroke-width="12" stroke-linejoin="round"/>
    <path d="M18 0H82L18 26H82L18 52H82L18 78H82L18 104H82L18 130H82L18 156H82L18 182H82L50 200" fill="none" stroke="#b8c2c7" stroke-width="5" stroke-linejoin="round"/>
  </svg>`;

  SCARES.push({
    name: 'clown',
    ms: 2800,
    html: () => `<div class="clown-pop"><div class="clown-body">${CLOWN}</div>${SPRING}</div>
      <b class="clown-honk clown-honk-one">${say(CLOWN_HONK)}</b><b class="clown-honk clown-honk-two">${say(CLOWN_HONK)}</b>`,
    sound: (output) => {
      const start = now();
      // boing: a sine that sweeps up and then wobbles itself down
      voice(output, { pitch: [[0, 120], [0.07, 700], [0.9, 150]], level: [[0, 1.2], [0.3, 0.9], [0.9, 0]], at: start, vibrato: [13, 520] });
      rush(output, { at: start, level: [[0, 0.3], [0.06, 0]], sweep: ['lowpass', 1, [[0, 900]]] });
      // two nose honks
      [[0.7, 330, 0.2], [1.12, 395, 0.3]].forEach(([seconds, hertz, length]) => {
        voice(output, { type: 'sawtooth', pitch: [[0, hertz], [length, hertz * 1.06]], level: [[0, 0], [0.012, 1], [length - 0.03, 0.9], [length, 0]], at: start + seconds, filter: ['bandpass', 2.2, hertz * 2.6] });
        voice(output, { type: 'square', pitch: [[0, hertz / 2], [length, hertz / 2]], level: [[0, 0], [0.012, 0.5], [length, 0]], at: start + seconds });
      });
      // the grin stretches
      voice(output, { type: 'triangle', pitch: [[0, 260], [0.32, 1900]], level: [[0, 0.22], [0.3, 0.12], [0.34, 0]], at: start + 1.55 });
      voice(output, { type: 'sawtooth', pitch: [[0, 160], [0.8, 75]], level: [[0, 0], [0.1, 0.3], [0.8, 0]], at: start + 1.6, filter: ['lowpass', 1, 500] });
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
  const crashEye = (flip) => `<svg viewBox="0 0 100 60" aria-hidden="true"${flip ? ' style="scale:-1 1"' : ''}><clipPath id="crash-clip"><path d="M3 30Q50-12 97 30Q50 72 3 30Z"/></clipPath><path d="M3 30Q50-12 97 30Q50 72 3 30Z" fill="#f2efe2"/><g clip-path="url(#crash-clip)"><circle cx="50" cy="30" r="17" fill="#e8d36a"/><ellipse cx="50" cy="30" rx="4" ry="15" fill="#070806"/><path d="M0 0H100V38L0 12Z" fill="#030c3c"/></g><path d="M3 30Q50-12 97 30Q50 72 3 30Z" fill="none" stroke="#02103d" stroke-width="3"/></svg>`;
  const crashLetters = (line) => line.split(' ').map((word) => `<span class="crash-word">${[...word]
    .map((letter) => `<i style="--dx:${randomRange(-9, 9).toFixed(1)}vw;--r:${randomRange(-90, 90).toFixed(0)}deg;--d:${randomRange(0, 0.55).toFixed(2)}s">${escapeHtml(letter)}</i>`).join('')}</span>`).join(' ');

  SCARES.push({
    name: 'crash',
    ms: 3400,
    html: () => {
      const text = say(CRASH);
      return `<div class="crash-screen">
        <div class="crash-face">${crashLetters(':(')}</div>
        <p class="crash-title">${crashLetters(text.title)}</p>
        <p class="crash-sub">${crashLetters(text.sub)}</p>
        <div class="crash-row"><div class="crash-bar crash-drop" style="--dx:-3vw;--r:-5deg"><u></u></div><div class="crash-pct" style="--dx:4vw;--r:12deg"></div></div>
        <p class="crash-code">${crashLetters(text.code)}</p>
      </div>
      <div class="crash-eyes">${crashEye(false)}${crashEye(true)}</div>`;
    },
    sound: (output) => {
      // Error ding-dong, the bar ticking up, a stuck buzz when it freezes, then the hum.
      beep(output, { at: soon(0), freq: [880], length: 0.13, volume: 0.1 });
      beep(output, { at: soon(0.14), freq: [660], length: 0.2, volume: 0.1 });
      for (let i = 0; i < 9; i += 1) burst(output, 0.02, 0.12, soon(0.08 + i * 0.1));
      beep(output, { at: soon(0.95), freq: [330], length: 0.55, volume: 0.06 });
      tone(output, { path: [[0, 46], [1.8, 38]], length: 1.9, volume: 0.9, at: soon(1.5) });
      tone(output, { type: 'sawtooth', path: [[0, 69], [1.8, 57]], length: 1.9, volume: 0.22, wobble: [3, 25], at: soon(1.5) });
      for (let i = 0; i < 16; i += 1) burst(output, 0.02, 0.07, soon(1.7 + i * 0.045 + randomRange(0, 0.04)));
      tone(output, { path: [[0, 110], [0.5, 42]], length: 0.6, volume: 0.55, at: soon(2.15) });
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

  // ---- letters: the question falls off the sheet, then something breathes and it all comes back

  let lettersPlan = [];

  SCARES.push({
    name: 'letters',
    ms: 3400,
    html: () => {
      lettersPlan = [];
      const sheet = document.querySelector('.sheet');
      const question = sheet?.querySelector('.question');
      const node = question?.firstChild;
      if (!node || node.nodeType !== Node.TEXT_NODE) return '';
      const css = getComputedStyle(question);
      const area = question.getBoundingClientRect();
      const floor = sheet.getBoundingClientRect().bottom - window.innerHeight * 0.025;
      const range = document.createRange();
      const glyphs = [];
      [...node.data].forEach((char, index) => {
        if (!char.trim()) return;
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const box = range.getBoundingClientRect();
        if (box.width) glyphs.push({ char, box });
      });
      const spans = glyphs.map(({ char, box }, index) => {
        const delay = 0.1 + 0.85 * (index / glyphs.length) ** 1.15 + randomRange(0, 0.03);
        const drop = Math.max(20, floor - box.height - randomRange(0, box.height * 0.7) - box.top);
        const duration = 0.3 + 0.5 * Math.sqrt(drop / 900);
        const back = 2.75 + randomRange(0, 0.18);
        lettersPlan.push(delay + duration * 0.76);
        return `<i style="left:${box.left}px;top:${box.top}px;height:${box.height}px;line-height:${box.height}px;--dx:${randomRange(-0.8, 0.8) * box.height}px;--dy:${drop}px;--rot:${randomRange(-110, 110)}deg;--fall:${duration}s;--d1:${delay}s;--d2:${back}s">${escapeHtml(char)}</i>`;
      }).join('');
      const font = `font-family:${css.fontFamily.replace(/"/g, "'")};font-size:${css.fontSize};font-weight:${css.fontWeight};font-style:${css.fontStyle};color:${css.color}`;
      return `<div class="letters-ink" style="${font}">${spans}</div>
        <div class="letters-mist" style="left:${area.left}px;top:${area.top}px;width:${area.width}px;height:${Math.max(area.height, 120)}px"></div>`;
    },
    sound: (output) => {
      hit(output);
      burst(output, 0.07, 0.4);
      // Letters clattering down like dropped wooden tiles.
      lettersPlan.forEach((seconds) => {
        const at = soon(seconds);
        burst(output, 0.02, randomRange(0.15, 0.4), at);
        if (Math.random() < 0.45) {
          tone(output, { path: [[0, randomRange(500, 1300)], [0.05, randomRange(300, 700)]], length: 0.06, volume: 0.18, at });
        }
      });
      // A breath in, a whisper out.
      rush(output, { freq: [[0, 1700], [1.0, 1100]], q: 0.9, level: [[0, 0], [0.32, 0.7], [0.45, 0.1], [0.6, 0.9], [1.0, 0]], at: soon(1.8) });
      rush(output, { freq: [[0, 3400], [1.0, 2600]], q: 1.4, level: [[0, 0], [0.32, 0.3], [0.45, 0.05], [0.6, 0.4], [1.0, 0]], at: soon(1.8) });
      tone(output, { path: [[0, 96], [0.9, 78]], length: 1.0, volume: 0.4, wobble: [5, 30], at: soon(1.9) });
      // And back they fly.
      rush(output, { freq: [[0, 600], [0.5, 3200]], q: 0.8, level: [[0, 0], [0.15, 0.5], [0.5, 0]], at: soon(2.72) });
      for (let i = 0; i < 28; i += 1) burst(output, 0.015, randomRange(0.15, 0.3), soon(2.95 + i * 0.012 + randomRange(0, 0.012)));
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
  const thud = (output, start = 0, volume = 1) => note(output, { path: [[0, 140], [0.5, 36]], length: 0.6, volume }, start);

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

  // ---- gurney: a corridor in one-point perspective and a sprite that grows toward us.
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

  const gurneySprite = () => {
    const L = '#3c4240';
    const stain = (x, y, r, fill = '#4a1410', o = 0.9) => `<path d="${blobPath(x, y, r, 0.1, true)}" fill="${fill}" opacity="${o}"/>`;
    const folds = [[-150, 590, -120, 530], [-60, 600, -50, 520], [30, 596, 40, 522], [110, 596, 125, 530], [165, 600, 150, 548]]
      .map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1}Q${(x1 + x2) / 2 + rand(-12, 12)} ${(y1 + y2) / 2} ${x2} ${y2}" stroke="#6e7064" stroke-width="5" fill="none" opacity=".8"/>`).join('');
    return `<defs>${GHOUL_DEFS}
        <linearGradient id="gurneySheet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9b8a9"/><stop offset=".6" stop-color="#85867a"/><stop offset="1" stop-color="#3f4139"/></linearGradient>
        <linearGradient id="gurneySkin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe2d3"/><stop offset="1" stop-color="#8f9486"/></linearGradient>
      </defs>
      <g transform="translate(800 0)">
      <!-- frame and wheels -->
      <path d="M-165 600V805M165 600V805M-165 700H165M-165 760H165" stroke="${L}" stroke-width="14" fill="none"/>
      <path d="M-165 600V805M165 600V805" stroke="#6c7471" stroke-width="3" fill="none" transform="translate(-4 0)"/>
      <circle cx="-165" cy="808" r="22" fill="#0d0f0e"/><circle cx="165" cy="808" r="22" fill="#0d0f0e"/>
      <circle cx="-165" cy="808" r="8" fill="#555c59"/><circle cx="165" cy="808" r="8" fill="#555c59"/>
      <rect x="-190" y="602" width="380" height="14" fill="#262a29"/>
      <!-- mattress -->
      <path d="M-182 566L-72 474H72L182 566V604H-182z" fill="#585646"/>
      <path d="M-182 566L-72 474H72L182 566z" fill="#6d6b57"/>
      <!-- the sheeted body: far hump, near feet, hanging hem -->
      <path d="M-98 520Q-100 462 -62 452Q0 440 62 452Q100 462 98 520z" fill="#a9aa9c"/>
      <g class="gurney-figure"><g class="gurney-lunge">
        <path d="M-64 540Q-72 440 -66 412Q-40 392 0 392Q40 392 66 412Q72 440 64 540z" fill="#6f7b77"/>
        <path d="M-40 430Q-30 480 -44 530M30 440Q40 490 28 530" stroke="#444e4b" stroke-width="5" fill="none"/>
        <path d="M-60 418Q-90 470 -82 546M60 418Q90 470 82 546" stroke="#b9bdae" stroke-width="17" stroke-linecap="round" fill="none"/>
        <path d="M-82 548l-8 30M-82 548l-1 34M-82 548l7 30M82 548l8 30M82 548l1 34M82 548l-7 30" stroke="#b9bdae" stroke-width="5" stroke-linecap="round"/>
        <rect x="-13" y="370" width="26" height="34" fill="#7f8577"/>
        ${ghoulFace()}
      </g></g>
      <path d="M-182 614L-176 562Q-150 510 -104 508Q-60 508 -12 530Q40 506 104 508Q152 510 176 562L182 614Q166 606 150 622Q130 610 110 620Q88 606 66 622Q48 610 30 626Q12 608 -10 622Q-30 608 -52 624Q-74 608 -92 624Q-116 610 -136 622Q-162 610 -182 614z" fill="url(#gurneySheet)"/>
      ${folds}
      ${stain(-70, 560, 34)}${stain(60, 540, 26, '#4c140f')}${stain(-115, 590, 16, '#6a2a1c', 0.7)}${stain(125, 585, 20, '#5b1a14', 0.7)}
      <path d="M-42 566v54M70 584v36" stroke="#4a130f" stroke-width="6" stroke-linecap="round" opacity=".8"/>
      </g>
      <path d="M-150 566Q-80 510 0 520Q80 510 150 566L160 604L-160 604z" fill="url(#gurneySheet)" opacity=".0"/>
      </g>`;
  };

  SCARES.push({
    name: 'gurney',
    ms: 2500,
    html: () => `<svg class="gurney-hall" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${corridor()}</svg>
      <svg class="gurney-cart" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${gurneySprite()}</svg>
      <div class="gurney-dark"></div>`,
    sound: (output) => {
      note(output, { type: 'sawtooth', path: [[0, 38], [1.95, 70]], length: 2, volume: 0.25, wobble: [7, 60] });
      rush(output, { type: 'lowpass', path: [[0, 160], [1.9, 700]], length: 2, volume: 0.4, attack: 0.05, hold: 0.9 });
      for (let i = 0; i < 90; i += 1) {
        const t = 1.95 * (i / 90) ** 0.75;
        burst(output, 0.035, 0.08 + 0.35 * (t / 1.95), audio.context.currentTime + t + rand(0, 0.015));
      }
      [0.05, 0.55, 1.1, 1.5].forEach((s, i) => note(output, { type: 'sine', path: [[0, 2100 + i * 120], [0.22, 2650], [0.45, 2250]], length: 0.46, volume: 0.07 + i * 0.03, wobble: [9, 40] }, s));
      rush(output, { type: 'bandpass', path: [[0, 500], [0.22, 3800]], q: 0.9, length: 0.3, volume: 0.9, start: 1.52, attack: 0.02, hold: 0.7 });
      note(output, { type: 'sawtooth', path: [[0, 140], [0.28, 520]], length: 0.3, volume: 0.35, wobble: [40, 120] }, 1.52);
      thud(output, 1.98, 1);
      burst(output, 0.35, 0.9, audio.context.currentTime + 1.98);
    },
  });

  // ---- bedsheet: an iron bed, a sheet, a breath.
  const sheetFigure = () => {
    const folds = [[-95, -520, -110, -40], [-50, -560, -62, -10], [10, -600, 8, -20], [58, -540, 70, -30], [100, -480, 118, -50]]
      .map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1}Q${(x1 + x2) / 2 + rand(-14, 14)} ${(y1 + y2) / 2} ${x2} ${y2}" fill="none" stroke="rgba(8,14,18,.3)" stroke-width="${f1(rand(2, 5))}" stroke-linecap="round"/>`).join('');
    return `<path d="M-150 0C-140 -180 -120 -330 -118 -470C-116 -540 -64 -566 -60 -600C-96 -640 -84 -722 0 -724C84 -722 96 -640 60 -600C64 -566 116 -540 118 -470C120 -330 140 -180 152 0L120 -14L98 4L66 -12L30 6L-4 -10L-40 6L-76 -12L-106 4z" fill="url(#bedsheetCloth)"/>
      <path d="M-150 0C-140 -180 -120 -330 -118 -470C-116 -540 -64 -566 -60 -600C-96 -640 -84 -722 0 -724" fill="none" stroke="rgba(190,215,230,.35)" stroke-width="3"/>
      ${folds}
      <path d="M-70 -300C-50 -270 -40 -240 -48 -200M40 -340C60 -300 62 -260 52 -230" fill="none" stroke="rgba(8,14,18,.3)" stroke-width="12" stroke-linecap="round"/>
      <path d="${blobPath(-70, -150, 30, 0.1, true)}" fill="#3a1411" opacity=".6"/>`;
  };

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

  SCARES.push({
    name: 'bedsheet',
    ms: 3300,
    html: () => {
      const face = `<g class="bedsheet-face">
        <ellipse cx="-27" cy="-670" rx="24" ry="38" fill="url(#bedsheetHole)" transform="rotate(14 -27 -670)"/><ellipse cx="27" cy="-670" rx="24" ry="38" fill="url(#bedsheetHole)" transform="rotate(-14 27 -670)"/>
        <ellipse cx="0" cy="-585" rx="32" ry="82" fill="url(#bedsheetHole)"/>
        <path d="M-62 -690Q-30 -700 -8 -660M62 -690Q30 -700 8 -660M-34 -640Q0 -520 34 -640" fill="none" stroke="rgba(190,215,230,.25)" stroke-width="3"/></g>`;
      return `<svg class="bedsheet-room" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${wardRoom()}
        <g transform="translate(1190 790)"><g class="bedsheet-lunge"><g class="bedsheet-pose"><g class="bedsheet-breath">${sheetFigure()}</g>${face}</g></g></g>
      </svg><div class="bedsheet-dark"></div>`;
    },
    sound: (output) => {
      note(output, { path: [[0, 52], [3, 48]], length: 3, volume: 0.22 }, 0);
      [0, 1.35].forEach((s) => {
        rush(output, { type: 'bandpass', path: [[0, 380], [0.6, 900]], q: 0.7, length: 0.65, volume: 0.28, start: s, attack: 0.3, hold: 0.7 });
        rush(output, { type: 'bandpass', path: [[0, 800], [0.7, 300]], q: 0.7, length: 0.75, volume: 0.22, start: s + 0.62, attack: 0.1, hold: 0.3 });
      });
      note(output, { type: 'sawtooth', path: [[0, 150], [0.5, 210], [0.9, 130]], length: 0.9, volume: 0.17, wobble: [11, 70] }, 1.55);
      for (let i = 0; i < 14; i += 1) burst(output, 0.03, 0.18, audio.context.currentTime + 1.55 + i * 0.06 + rand(0, 0.04));
      rush(output, { type: 'highpass', path: [[0, 2000], [0.2, 5000]], length: 0.3, volume: 0.5, start: 2.66, attack: 0.1 });
      for (const ratio of [1, 1.5, 2.1]) {
        note(output, { type: 'sawtooth', path: [[0, 880 * ratio], [0.25, 1500 * ratio], [0.9, 1100 * ratio]], length: 0.95, volume: 0.2, wobble: [47, 110] }, 2.7);
      }
      thud(output, 2.7, 0.8);
      rush(output, { type: 'highpass', path: [[0, 1500], [0.9, 3500]], length: 0.9, volume: 0.4, start: 2.7, attack: 0.01 });
    },
  });

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
}

// One scare per question, mixing the frightening with the silly. Pouring blood closes the assessment.
const SCARE_ORDER = [
  'gurney', 'invoice', 'hands', 'syringe', 'duck',
  'cctv', 'eye', 'bedpan', 'matron', 'rip',
  'file', 'surgeon', 'teeth', 'phew', 'crash',
  'door', 'clown', 'bedsheet', 'letters', 'flatline',
  'face', 'lockdown', 'wheelchair', 'scratches', 'blood',
];
SCARES.splice(0, SCARES.length, ...SCARE_ORDER.map((name) => SCARES.find((scare) => scare.name === name)));
