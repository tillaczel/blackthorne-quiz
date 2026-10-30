// A slideshow: title, the questions with a timer, an end page, then the answers.
// The address holds the slide number (#12), so a reload stays on the same slide.

const QUESTION_SECONDS = 60;
const LANGUAGE_KEY = 'blackthorne-quiz-language';

const TEXT = {
  en: {
    case: 'Patient assessment · Case 7713-A',
    summons: 'Pens ready. Write your answers on your form.',
    tagline: 'Side effects may include screaming.',
    questionOf: (n, total) => `Question ${n} of ${total}`,
    answerOf: (n, total) => `Answer ${n} of ${total}`,
    timeUp: "Time's up",
    endCode: 'End of assessment',
    endTitle: 'Pens down',
    endText: 'Nobody leaves until the answers have been read.',
    boo: 'Boo!',
    doneCode: 'Assessment complete',
    start: 'Begin',
    next: 'Next',
    back: 'Back',
  },
  de: {
    case: 'Patientenbeurteilung · Akte 7713-A',
    summons: 'Stifte bereit. Schreiben Sie Ihre Antworten auf Ihr Formular.',
    tagline: 'Zu den Nebenwirkungen zählt Schreien.',
    questionOf: (n, total) => `Frage ${n} von ${total}`,
    answerOf: (n, total) => `Antwort ${n} von ${total}`,
    timeUp: 'Zeit abgelaufen',
    endCode: 'Ende der Beurteilung',
    endTitle: 'Stifte weg',
    endText: 'Niemand geht, bevor die Antworten verlesen sind.',
    boo: 'Buh!',
    doneCode: 'Beurteilung abgeschlossen',
    start: 'Beginnen',
    next: 'Weiter',
    back: 'Zurück',
  },
};

// The doctor's remark on each question and the stamp on each answer, in turn.
const NOTES = {
  en: ['Do not look behind you.', 'The nurse says hello.', 'Patient seems nervous.', 'Pulse: questionable.',
    'Someone is breathing. Not you.', 'Please scream more quietly.', 'The walls are listening.',
    'Lights out at midnight. Forever.', 'Visiting hours are over.', 'Dr. Seward is watching.',
    'Your pen was not there before.', 'Ward C is unusually quiet.'],
  de: ['Schauen Sie nicht hinter sich.', 'Die Schwester lässt grüssen.', 'Patient wirkt nervös.', 'Puls: fragwürdig.',
    'Jemand atmet. Nicht Sie.', 'Bitte leiser schreien.', 'Die Wände hören mit.',
    'Licht aus um Mitternacht. Für immer.', 'Die Besuchszeit ist vorbei.', 'Dr. Seward sieht zu.',
    'Ihr Stift lag vorher nicht dort.', 'Station C ist ungewöhnlich still.'],
};
const STAMPS = {
  en: ['Confirmed', 'Case closed', 'Buried', 'Exorcised', 'Beyond doubt', 'No refunds'],
  de: ['Bestätigt', 'Akte zu', 'Begraben', 'Exorziert', 'Zweifelsfrei', 'Kein Umtausch'],
};
// Scratched faintly into the paper of each sheet.
const SCRAWLS = {
  en: ['Let me out', 'Help', 'Run', 'They are watching', 'He is not a doctor', 'Not again'],
  de: ['Lasst mich raus', 'Hilfe', 'Lauf', 'Sie sehen zu', 'Er ist kein Arzt', 'Nicht schon wieder'],
};
const LOW_SECONDS = 10;

const GHOST = '<svg viewBox="0 0 100 120" aria-hidden="true"><path d="M10 112V50a40 40 0 0 1 80 0v62l-13-12-13 12-14-12-14 12-13-12z" fill="#e8ece3"/><ellipse cx="36" cy="46" rx="7" ry="10" fill="#11140f"/><ellipse cx="64" cy="46" rx="7" ry="10" fill="#11140f"/><ellipse cx="50" cy="74" rx="9" ry="12" fill="#11140f"/></svg>';
const BAT = '<svg viewBox="0 0 100 50" aria-hidden="true"><path d="M50 16c-3-5-3-8-3-11l3 3 3-3c0 3 0 6-3 11 4 3 8 9 12 9 4-8 16-14 36-12-8 6-11 14-11 24-6-5-12-6-17-2-3-5-8-6-11 0-2 6-7 6-9 0-3-6-8-5-11 0-5-4-11-3-17 2 0-10-3-18-11-24 20-2 32 4 36 12 4 0 8-6 12-9z" fill="#050705"/></svg>';
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
const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* private window */ } },
};

let questions = [];
let language = store.get(LANGUAGE_KEY) === 'de' ? 'de' : 'en';
let current = 0;
let countdown = null;
let timeLeft = 0;
let lastSecond = null;

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
function sheet(code, corner, questionText, bottom) {
  const node = element('section', 'sheet');
  const head = element('div', 'sheet-head');
  head.append(element('p', 'form-code', code), corner);
  node.append(head, element('h2', 'question', questionText), bottom);
  const scrawls = SCRAWLS[language];
  node.append(element('span', 'scrawl', scrawls[current % scrawls.length]));
  return node;
}

function questionSlide(text, number) {
  const bottom = element('div', 'sheet-bottom');
  const clock = element('div', 'clock');
  clock.id = 'clock';
  const bar = element('div', 'timer');
  const fill = element('div', 'timer-fill');
  fill.id = 'timerFill';
  bar.append(fill);
  bottom.append(clock, bar);

  const notes = NOTES[language];
  const note = element('p', 'doctor-note', notes[(number - 1) % notes.length]);
  const fragment = document.createDocumentFragment();
  fragment.append(
    sheet(text.questionOf(number, questions.length), note, localized(number).question, bottom),
    bubbleGhost(text),
  );
  return fragment;
}

function answerSlide(text, number) {
  const bottom = element('div', 'sheet-bottom');
  bottom.append(element('p', 'answer', localized(number).answer));
  const stamps = STAMPS[language];
  const stamp = element('span', 'stamp', stamps[(number - 1) % stamps.length]);
  return sheet(text.answerOf(number, questions.length), stamp, localized(number).question, bottom);
}

/** The ghost behind the sheet that jumps out when time runs out. */
function bubbleGhost(text) {
  const ghost = element('div', 'boo');
  ghost.innerHTML = GHOST;
  ghost.append(element('span', 'boo-bubble', text.boo));
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
  document.body.classList.toggle('time-up', seconds === 0);
  if (low && seconds !== lastSecond) heartbeat();
  lastSecond = seconds;
  document.querySelector('#timerFill').style.transform = `scaleX(${left / (QUESTION_SECONDS * 1000)})`;
}

/** Counts down and stops at zero. It never moves to the next slide. */
function startCountdown() {
  const endsAt = Date.now() + QUESTION_SECONDS * 1000;
  const tick = () => {
    const left = Math.max(0, endsAt - Date.now());
    showTime(left);
    if (left === 0) {
      stopCountdown();
      stinger();
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
  document.body.classList.remove('low-time', 'time-up');
  lastSecond = null;
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

backButton.addEventListener('click', () => goTo(current - 1));
nextButton.addEventListener('click', () => goTo(current + 1));
languageToggle.addEventListener('click', () => setLanguage(language === 'en' ? 'de' : 'en'));

document.addEventListener('keydown', (event) => {
  // Space, arrows and PageUp/PageDown, which is what presentation clickers send.
  if (event.target.closest('button') && event.key === ' ') event.target.blur();
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    goTo(current + 1);
  } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    goTo(current - 1);
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
  return { context, master };
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

/** A sour stab when the time is up. */
function stinger() {
  if (!soundReady()) return;
  const { context } = audio;
  const now = context.currentTime;
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2400, now);
  filter.frequency.exponentialRampToValueAtTime(180, now + 1);
  gain.gain.setValueAtTime(0.16, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
  filter.connect(gain).connect(context.destination);
  for (const frequency of [196, 207.65, 293.66]) {
    const oscillator = context.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = frequency;
    oscillator.connect(filter);
    oscillator.start(now);
    oscillator.stop(now + 1.1);
  }
}

function unlockSound(event) {
  if (soundWanted && !event.target.closest?.('#soundToggle')) playSound();
}

soundToggle.addEventListener('click', () => {
  soundWanted = !soundWanted;
  document.body.classList.toggle('sound-on', soundWanted);
  if (soundWanted) playSound();
  else audio?.context.suspend();
});
['pointerdown', 'keydown'].forEach((type) => document.addEventListener(type, unlockSound, true));

// ---- Start

async function start() {
  questions = await (await fetch('data/questions.json')).json();
  if (!window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    flicker();
    lightning();
    haunting();
  }
  goTo(Number(location.hash.slice(1)) || 0);
}

start();
