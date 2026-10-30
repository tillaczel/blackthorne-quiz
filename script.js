// A slideshow: title, the questions with a timer, an end page, then the answers.
// The address holds the slide number (#12), so a reload stays on the same slide.

const QUESTION_SECONDS = 60;
const LANGUAGE_KEY = 'blackthorne-quiz-language';

const TEXT = {
  en: {
    case: 'Patient assessment · Case 7713-A',
    summons: 'Pens ready. Estimate boldly: the closest answer wins.',
    tagline: 'Side effects may include screaming.',
    questionOf: (n, total) => `Question ${n} of ${total}`,
    answerOf: (n, total) => `Answer ${n} of ${total}`,
    timeUp: "Time's up",
    endCode: 'End of assessment',
    endTitle: 'Pens down',
    endText: 'Nobody leaves until the answers have been read.',
    boo: 'Boo!',
    phew: 'Relax. Nothing happened.',
    oops: 'Sorry. That was the doctor.',
    behindYou: 'Look behind you',
    doneCode: 'Assessment complete',
    start: 'Begin',
    next: 'Next',
    back: 'Back',
  },
  de: {
    case: 'Patientenbeurteilung · Akte 7713-A',
    summons: 'Stifte bereit. Schätzen Sie mutig: Die nächste Antwort gewinnt.',
    tagline: 'Zu den Nebenwirkungen zählt Schreien.',
    questionOf: (n, total) => `Frage ${n} von ${total}`,
    answerOf: (n, total) => `Antwort ${n} von ${total}`,
    timeUp: 'Zeit abgelaufen',
    endCode: 'Ende der Beurteilung',
    endTitle: 'Stifte weg',
    endText: 'Niemand geht, bevor die Antworten verlesen sind.',
    boo: 'Buh!',
    phew: 'Entspannen Sie sich. Nichts passiert.',
    oops: 'Verzeihung. Das war der Doktor.',
    behindYou: 'Schauen Sie hinter sich',
    doneCode: 'Beurteilung abgeschlossen',
    start: 'Beginnen',
    next: 'Weiter',
    back: 'Zurück',
  },
};

const LOW_SECONDS = 10;
// Sound and lights die this long before zero, so the scream lands out of silence.
const HUSH_MS = 650;

const GHOST = '<svg viewBox="0 0 100 120" aria-hidden="true"><path d="M10 112V50a40 40 0 0 1 80 0v62l-13-12-13 12-14-12-14 12-13-12z" fill="#e8ece3"/><ellipse cx="36" cy="46" rx="7" ry="10" fill="#11140f"/><ellipse cx="64" cy="46" rx="7" ry="10" fill="#11140f"/><ellipse cx="50" cy="74" rx="9" ry="12" fill="#11140f"/></svg>';
const BAT = '<svg viewBox="0 0 100 50" aria-hidden="true"><path d="M50 16c-3-5-3-8-3-11l3 3 3-3c0 3 0 6-3 11 4 3 8 9 12 9 4-8 16-14 36-12-8 6-11 14-11 24-6-5-12-6-17-2-3-5-8-6-11 0-2 6-7 6-9 0-3-6-8-5-11 0-5-4-11-3-17 2 0-10-3-18-11-24 20-2 32 4 36 12 4 0 8-6 12-9z" fill="#050705"/></svg>';
const SCREAMER = '<svg viewBox="0 0 200 250" aria-hidden="true"><path d="M100 4C46 4 22 48 26 104c3 42 17 74 36 104 10 17 24 38 38 38s28-21 38-38c19-30 33-62 36-104 4-56-20-100-74-100z" fill="#d9dccb"/><path d="M38 74C50 22 150 22 162 74c-22-26-102-26-124 0zM58 150c-6 28 2 58 16 80M142 150c6 28-2 58-16 80" fill="none" stroke="#8d927c" stroke-width="4"/><path d="M34 106c6-30 52-38 64-8 4 26-14 46-36 44-18-2-30-16-28-36zM166 106c-6-30-52-38-64-8-4 26 14 46 36 44 18 2 30-16 28-36z" fill="#070806"/><circle cx="66" cy="110" r="7" fill="#ff2a1c"/><circle cx="134" cy="110" r="7" fill="#ff2a1c"/><path d="M92 136l8-14 8 14z" fill="#070806"/><path d="M62 170c8-20 68-20 76 0 8 26-14 72-38 72s-46-46-38-72z" fill="#070806"/><path d="M63 168l10 15 9-17 10 17 8-18 8 18 10-17 9 17 10-15c-14-14-60-14-74 0zM70 214l10-12 8 14 12-13 12 13 8-14 10 12c-8 14-20 24-30 24s-22-10-30-24z" fill="#d9dccb"/></svg>';
const HAND = '<svg viewBox="0 0 120 150" aria-hidden="true"><g fill="none" stroke="#8c0f0a" stroke-width="17" stroke-linecap="round"><path d="M24 92 12 56M42 76 34 18M62 74V10M80 78 90 22M94 100l20-26"/></g><path d="M20 88c8-16 66-18 78 2 8 22-6 52-38 54-30-2-48-30-40-56z" fill="#8c0f0a"/><path d="M40 146l-3 4M70 142l4 8" stroke="#8c0f0a" stroke-width="6"/></svg>';
const DUCK = '<svg viewBox="0 0 200 180" aria-hidden="true"><path d="M30 104c30 14 58 4 62-8 10 4 50 2 78-22 12 36 0 92-74 96-52 2-76-30-66-66z" fill="#f5c518"/><circle cx="72" cy="64" r="42" fill="#f5c518"/><path d="M34 58 2 66c4 14 22 18 38 8z" fill="#ef7d12"/><circle cx="62" cy="52" r="8" fill="#11140f"/><path d="M44 28 50 2h46l6 26z" fill="#f4f1e6"/><path d="M73 7v17M64 15h18" stroke="#b3201a" stroke-width="6"/></svg>';
const SPIDER = '<svg viewBox="0 0 100 80" aria-hidden="true"><g fill="none" stroke="#050705" stroke-width="4" stroke-linecap="round"><path d="M38 34 18 18 6 28M36 42H14L4 54M38 50 20 62l-4 14M42 54 32 70M62 34l20-16 12 10M64 42h22l10 12M62 50l18 12 4 14M58 54l10 16"/></g><ellipse cx="50" cy="44" rx="19" ry="17" fill="#050705"/><circle cx="43" cy="42" r="7" fill="#fff"/><circle cx="58" cy="42" r="7" fill="#fff"/><circle cx="45" cy="44" r="3" fill="#050705"/><circle cx="56" cy="40" r="3" fill="#050705"/></svg>';

const root = document.documentElement;
const slideNode = document.querySelector('#slide');
const backButton = document.querySelector('#back');
const nextButton = document.querySelector('#next');
const progressNode = document.querySelector('#progress');
const languageToggle = document.querySelector('#languageToggle');
const soundToggle = document.querySelector('#soundToggle');
const haunt = document.querySelector('#haunt');
const blackout = document.querySelector('#blackout');
const jumpScareNode = document.querySelector('#jumpScare');
const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* private window */ } },
};

let questions = [];
let flavour = {};
let language = store.get(LANGUAGE_KEY) === 'de' ? 'de' : 'en';
let current = 0;
let countdown = null;
let endsAt = 0;
let timeLeft = 0;
let lastSecond = null;
let reviewing = false;

// ---- Slides

/** What slide *index* is: 0 title, then the questions, the end page and the answers. */
function slideAt(index) {
  const count = questions.length;
  if (index === 0) return { type: 'title' };
  if (index <= count) return { type: 'question', number: index };
  if (index === count + 1) return { type: 'end' };
  return { type: 'answer', number: index - count - 1 };
}

const lastSlide = () => questions.length * 2 + 1;

function localized(number) {
  const question = questions[number - 1];
  return language === 'de' ? question.de : question;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** The clinic's name with a dying letter and a loose one, like an old sign. */
function clinicName() {
  const heading = element('h1');
  heading.setAttribute('aria-label', 'Blackthorne Institute');
  const loose = { 'BLACKTHORNE': { 7: 'dying-letter' }, 'INSTITUTE': { 8: 'loose-letter' } };
  for (const word of Object.keys(loose)) {
    const wordNode = element('span', 'word');
    [...word].forEach((letter, index) => {
      wordNode.append(element('span', loose[word][index] ?? '', letter));
    });
    heading.append(wordNode, ' ');
  }
  return heading;
}

function titleSlide(text) {
  const section = element('section', 'title-slide');
  section.append(
    element('p', 'case-number', text.case),
    clinicName(),
    element('p', 'summons', text.summons),
    element('p', 'tagline', text.tagline),
  );
  return section;
}

function endSlide(text) {
  const section = element('section', 'title-slide');
  section.append(
    element('p', 'case-number', text.endCode),
    element('h1', '', text.endTitle),
    element('p', 'summons', text.endText),
  );
  return section;
}

/** Every question and answer is this same sheet, so nothing moves between slides. */
function sheet(code, corner, questionText, bottom, scrawl) {
  const node = element('section', 'sheet');
  const head = element('div', 'sheet-head');
  head.append(element('p', 'form-code', code), corner);
  node.append(head, element('h2', 'question', questionText), bottom);
  node.append(element('span', 'scrawl', scrawl));
  return node;
}

const formCode = (label, number) => `${localized(number).category} · ${label(number, questions.length)}`;

function questionSlide(text, number) {
  const bottom = element('div', 'sheet-bottom');
  const clock = element('div', 'clock');
  clock.id = 'clock';
  const bar = element('div', 'timer');
  const fill = element('div', 'timer-fill');
  fill.id = 'timerFill';
  bar.append(fill);
  bottom.append(clock, bar);

  const { notes, scrawls } = flavour[language];
  const note = element('p', 'doctor-note', notes[number - 1]);
  const fragment = document.createDocumentFragment();
  fragment.append(
    sheet(formCode(text.questionOf, number), note, localized(number).question, bottom, scrawls[number - 1]),
    bubbleGhost(text),
  );
  return fragment;
}

function answerSlide(text, number) {
  const bottom = element('div', 'sheet-bottom');
  bottom.append(element('p', 'answer', localized(number).answer));
  const { stamps, scrawls } = flavour[language];
  const stamp = element('span', 'stamp', stamps[number - 1]);
  const scrawl = scrawls[questions.length + number - 1];
  return sheet(formCode(text.answerOf, number), stamp, localized(number).question, bottom, scrawl);
}

/** The ghost behind the sheet that jumps out when time runs out. */
function bubbleGhost(text) {
  const ghost = element('div', 'boo');
  ghost.innerHTML = GHOST;
  ghost.append(element('span', 'boo-bubble', text.boo), element('p', 'boo-time', text.timeUp));
  return ghost;
}

function render() {
  const text = TEXT[language];
  const slide = slideAt(current);
  const builders = {
    title: () => titleSlide(text),
    question: () => questionSlide(text, slide.number),
    end: () => endSlide(text),
    answer: () => answerSlide(text, slide.number),
  };
  const stage = element('div', 'stage');
  stage.append(builders[slide.type]());
  slideNode.replaceChildren(stage);

  backButton.textContent = text.back;
  backButton.hidden = current === 0;
  nextButton.textContent = current === 0 ? text.start : text.next;
  nextButton.hidden = current === lastSlide();
  progressNode.textContent = current === lastSlide() ? text.doneCode : '';
  languageToggle.textContent = language === 'en' ? 'DE' : 'EN';
  root.lang = language;
}

// ---- Timer

function stopCountdown() {
  clearInterval(countdown);
  countdown = null;
}

function showTime(left) {
  timeLeft = left;
  const seconds = Math.ceil(left / 1000);
  const clock = document.querySelector('#clock');
  clock.textContent = seconds > 0 ? String(seconds) : TEXT[language].timeUp;
  const low = seconds > 0 && seconds <= LOW_SECONDS;
  document.body.classList.toggle('low-time', low);
  document.body.classList.toggle('hush', left > 0 && left <= HUSH_MS);
  document.body.classList.toggle('time-up', seconds === 0 && !reviewing);
  if (low) startDread(left);
  if (low && seconds !== lastSecond) heartbeat();
  lastSecond = seconds;
  document.querySelector('#timerFill').style.transform = `scaleX(${left / (QUESTION_SECONDS * 1000)})`;
}

/** Counts down and stops at zero. It never moves to the next slide. */
function startCountdown() {
  endsAt = Date.now() + QUESTION_SECONDS * 1000;
  const tick = () => {
    const left = Math.max(0, endsAt - Date.now());
    showTime(left);
    if (left === 0) {
      stopCountdown();
      jumpScare();
    }
  };
  tick();
  countdown = setInterval(tick, 100);
}

// ---- Moving around

function goTo(index) {
  current = Math.max(0, Math.min(lastSlide(), index));
  history.replaceState(null, '', `#${current}`);
  stopCountdown();
  stopDread();
  endScare();
  document.body.classList.remove('low-time', 'hush', 'time-up');
  lastSecond = null;
  reviewing = false;
  lightsOut();
  render();
  if (slideAt(current).type === 'question') startCountdown();
}

/** The lights cut out for a moment as the slide changes. */
function lightsOut() {
  blackout.classList.remove('flash');
  void blackout.offsetWidth; // restarts the animation
  blackout.classList.add('flash');
}

function setLanguage(next) {
  language = next;
  store.set(LANGUAGE_KEY, next);
  render();
  if (slideAt(current).type === 'question') showTime(timeLeft);
}

/** After time is up the first step back returns to the question; the next one leaves it. */
function goBack() {
  if (!document.body.classList.contains('time-up')) return goTo(current - 1);
  reviewing = true;
  endScare();
  document.body.classList.remove('time-up');
}

/** Next never skips a running clock: it cuts to the last seconds, so the scare still plays. */
function goNext() {
  if (!countdown) return goTo(current + 1);
  endsAt = Math.min(endsAt, Date.now() + LOW_SECONDS * 1000);
}

backButton.addEventListener('click', goBack);
nextButton.addEventListener('click', goNext);
languageToggle.addEventListener('click', () => setLanguage(language === 'en' ? 'de' : 'en'));

document.addEventListener('keydown', (event) => {
  // Space, arrows and PageUp/PageDown, which is what presentation clickers send.
  if (event.target.closest('button') && event.key === ' ') event.target.blur();
  if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(event.key)) {
    event.preventDefault();
    goNext();
  } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    goBack();
  }
});

// ---- The invitation's corridor: lamp flicker and lightning

const randomRange = (min, max) => min + Math.random() * (max - min);

function setLamps(white, red, brightness) {
  root.style.setProperty('--lamp-white', white.toFixed(2));
  root.style.setProperty('--lamp-red', red.toFixed(2));
  root.style.setProperty('--reflection-white', (white * 0.52).toFixed(2));
  root.style.setProperty('--reflection-red', (red * 0.58).toFixed(2));
  root.style.setProperty('--scene-brightness', brightness.toFixed(2));
}

function flicker() {
  const roll = Math.random();
  let delay = randomRange(180, 620);
  if (roll < 0.1) {
    setLamps(randomRange(0.1, 0.28), randomRange(0.14, 0.34), randomRange(0.65, 0.73));
    delay = randomRange(45, 120);
  } else if (roll < 0.22) {
    setLamps(randomRange(0.68, 0.84), randomRange(0.66, 0.82), randomRange(0.84, 0.9));
    delay = randomRange(60, 150);
  } else if (roll > 0.94) {
    setLamps(0.03, randomRange(0.04, 0.14), 0.58);
    delay = randomRange(80, 180);
  } else {
    setLamps(randomRange(0.44, 0.64), randomRange(0.46, 0.67), randomRange(0.77, 0.84));
  }
  setTimeout(flicker, delay);
}

function lightning() {
  setTimeout(() => {
    const flash = (on) => document.body.classList.toggle('lightning', on);
    flash(true);
    setTimeout(() => flash(false), 85);
    setTimeout(() => flash(true), 190);
    setTimeout(() => { flash(false); lightning(); }, 285);
  }, randomRange(9000, 24000));
}

// ---- Things in the dark. They live behind the sheet, so they never cover a question.

function spawn(parent, className, html, ms, styles = {}) {
  const creature = element('div', className);
  creature.innerHTML = html;
  Object.assign(creature.style, styles);
  parent.append(creature);
  setTimeout(() => creature.remove(), ms);
  return creature;
}

function driftingGhost() {
  const backwards = Math.random() < 0.5;
  spawn(haunt, `drifter${backwards ? ' backwards' : ''}`, GHOST, 11000, { top: `${randomRange(14, 62)}vh` });
}

function batFlock() {
  const top = randomRange(6, 30);
  for (let i = 0; i < 4; i += 1) {
    spawn(haunt, 'bat', BAT, 9000, {
      top: `${top + randomRange(-4, 8)}vh`,
      animationDelay: `${i * 0.28}s`,
    });
  }
}

function spiderDrop() {
  const left = Math.random() < 0.5 ? randomRange(2, 6) : randomRange(92, 96);
  spawn(haunt, 'spider', SPIDER, 10000, { left: `${left}vw` });
}

function peekingGhost() {
  const stage = document.querySelector('.stage');
  if (!stage || !document.querySelector('.sheet')) return driftingGhost();
  const side = Math.random() < 0.5 ? 'left' : 'right';
  spawn(stage, `peeker peek-${side}`, GHOST, 6000, { top: `${randomRange(12, 56)}%` });
}

function haunting() {
  setTimeout(() => {
    const creatures = [driftingGhost, batFlock, spiderDrop, peekingGhost];
    creatures[Math.floor(Math.random() * creatures.length)]();
    haunting();
  }, randomRange(7000, 15000));
}

// ---- The invitation's ambience. Browsers only allow sound after the first tap or key press.

let audio = null;
let dread = null;
let soundWanted = true;

function createNoise(context) {
  const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
  const data = buffer.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < data.length; i += 1) {
    brown = (brown + 0.025 * (Math.random() * 2 - 1)) / 1.025;
    data[i] = brown * 3;
  }
  return buffer;
}

function createHiss(context) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function hissSource(context, buffer) {
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

function buildAudio() {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  const drone = context.createOscillator();
  const droneFilter = context.createBiquadFilter();
  const droneGain = context.createGain();
  drone.type = 'sawtooth';
  drone.frequency.value = 43;
  droneFilter.type = 'lowpass';
  droneFilter.frequency.value = 145;
  droneGain.gain.value = 0.2;
  drone.connect(droneFilter).connect(droneGain).connect(master);
  drone.start();

  const noise = context.createBufferSource();
  const noiseFilter = context.createBiquadFilter();
  const noiseGain = context.createGain();
  noise.buffer = createNoise(context);
  noise.loop = true;
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 470;
  noiseFilter.Q.value = 0.55;
  noiseGain.gain.value = 0.075;
  noise.connect(noiseFilter).connect(noiseGain).connect(master);
  noise.start();
  return { context, master, hiss: createHiss(context) };
}

function playSound() {
  audio ??= buildAudio();
  const { context, master } = audio;
  context.resume().then(() => {
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setValueAtTime(master.gain.value, context.currentTime);
    master.gain.linearRampToValueAtTime(0.13, context.currentTime + 2.5);
  });
}

function soundReady() {
  return soundWanted && audio?.context.state === 'running';
}

function thump(at, volume) {
  const { context } = audio;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = 52;
  gain.gain.setValueAtTime(volume, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.22);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(at);
  oscillator.stop(at + 0.24);
}

function heartbeat() {
  if (!soundReady()) return;
  const now = audio.context.currentTime;
  thump(now, 0.5);
  thump(now + 0.2, 0.34);
}

/** Rising strings and hiss for the last seconds, then dead silence just before zero. */
function startDread(left) {
  if (dread || !soundReady() || left <= HUSH_MS) return;
  const { context, master, hiss } = audio;
  const now = context.currentTime;
  const hushAt = now + (left - HUSH_MS) / 1000;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.008, now);
  gain.gain.exponentialRampToValueAtTime(0.09, hushAt);
  gain.gain.setValueAtTime(0, hushAt);
  gain.connect(context.destination);
  master.gain.setValueAtTime(0, hushAt);

  const noise = hissSource(context, hiss);
  const noiseFilter = context.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.setValueAtTime(300, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(5000, hushAt);
  noise.connect(noiseFilter).connect(gain);
  noise.start(now);

  const voices = [1, 1.06, 1.5, 1.59].map((ratio) => {
    const voice = context.createOscillator();
    voice.type = 'sawtooth';
    voice.frequency.setValueAtTime(110 * ratio, now);
    voice.frequency.exponentialRampToValueAtTime(620 * ratio, hushAt);
    voice.connect(gain);
    voice.start(now);
    return voice;
  });
  dread = { gain, sources: [noise, ...voices] };
}

function stopDread() {
  if (!dread) return;
  dread.sources.forEach((source) => source.stop());
  dread.gain.disconnect();
  dread = null;
  if (soundWanted) playSound();
}

/** The scares all play through this, so they stay loud without clipping. */
function scareOutput() {
  const limiter = audio.context.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  const trim = audio.context.createGain();
  trim.gain.value = 0.55; // the limiter adds its own make-up gain
  limiter.connect(trim).connect(audio.context.destination);
  return limiter;
}

/** One voice: *path* is [[seconds, Hz], ...] and *wobble* is [rate in Hz, cents]. */
function tone(output, { type = 'sine', path, length, volume, wobble, at = audio.context.currentTime }) {
  const { context } = audio;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  path.forEach(([seconds, frequency], index) => {
    if (index === 0) oscillator.frequency.setValueAtTime(frequency, at);
    else oscillator.frequency.exponentialRampToValueAtTime(frequency, at + seconds);
  });
  gain.gain.setValueAtTime(volume, at);
  gain.gain.setValueAtTime(volume, at + length * 0.4);
  gain.gain.exponentialRampToValueAtTime(0.001, at + length);
  oscillator.connect(gain).connect(output);
  oscillator.start(at);
  oscillator.stop(at + length);
  if (wobble) {
    const shaker = context.createOscillator();
    const depth = context.createGain();
    shaker.frequency.value = wobble[0];
    depth.gain.value = wobble[1];
    shaker.connect(depth).connect(oscillator.detune);
    shaker.start(at);
    shaker.stop(at + length);
  }
}

function burst(output, length, volume, at = audio.context.currentTime) {
  const { context, hiss } = audio;
  const noise = hissSource(context, hiss);
  const gain = context.createGain();
  gain.gain.setValueAtTime(volume, at);
  gain.gain.setValueAtTime(volume, at + length * 0.6);
  gain.gain.exponentialRampToValueAtTime(0.001, at + length);
  noise.connect(gain).connect(output);
  noise.start(at, Math.random());
  noise.stop(at + length);
}

const hit = (output, at) => tone(output, { path: [[0, 140], [0.5, 36]], length: 0.6, volume: 1, at });

function scream(output) {
  const pitch = randomRange(0.85, 1.2);
  hit(output);
  burst(output, 0.8, 0.5);
  for (const ratio of [1, 1.07, 1.5]) {
    tone(output, {
      type: 'sawtooth',
      path: [[0, 760 * ratio * pitch], [0.22, 1300 * ratio * pitch], [1.3, 380 * ratio * pitch]],
      length: 1.3,
      volume: 0.4,
      wobble: [31, 90],
    });
  }
}

/** Dry little ticks, for legs and wings. */
function patter(output, count, gap, volume) {
  const now = audio.context.currentTime;
  for (let i = 0; i < count; i += 1) {
    burst(output, 0.025, volume, now + i * gap + randomRange(0, gap));
  }
}

function unlockSound(event) {
  if (soundWanted && !event.target.closest?.('#soundToggle')) playSound();
}

soundToggle.addEventListener('click', () => {
  soundWanted = !soundWanted;
  document.body.classList.toggle('sound-on', soundWanted);
  stopDread();
  if (soundWanted) playSound();
  else audio?.context.suspend();
});
['pointerdown', 'keydown'].forEach((type) => document.addEventListener(type, unlockSound, true));

// ---- Jump scares: scares.js fills SCARES, one per question.

const SCARES = [];
let scareTimers = [];

function later(ms, action) {
  scareTimers.push(setTimeout(action, ms));
}

function jumpScare() {
  stopDread();
  const scare = SCARES[(slideAt(current).number - 1) % SCARES.length];
  jumpScareNode.className = `jump-scare scare-${scare.name}`;
  jumpScareNode.innerHTML = scare.html(TEXT[language]);
  if (soundReady()) scare.sound(scareOutput());
  document.body.classList.add('scare');
  later(scare.ms, endScare);
}

function endScare() {
  scareTimers.forEach(clearTimeout);
  scareTimers = [];
  document.body.classList.remove('scare');
}

// ---- Start

async function start() {
  [questions, flavour] = await Promise.all(
    ['data/questions.json', 'data/flavour.json'].map(async (path) => (await fetch(path)).json()),
  );
  if (!window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    flicker();
    lightning();
    haunting();
  }
  goTo(Number(location.hash.slice(1)) || 0);
}

start();
