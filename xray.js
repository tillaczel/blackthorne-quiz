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
  // Not in SCARE_ORDER: it waits in window.SPARE_SCARES (the order step below keeps SCARES at exactly the 25 ordered ones).
  window.SPARE_SCARES = window.SPARE_SCARES || [];
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

    SPARE_SCARES.push({
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
