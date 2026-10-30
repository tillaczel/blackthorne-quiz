// A slideshow: title, the questions with a timer, an end page, then the answers.
// The address holds the slide number (#12), so a reload stays on the same slide.

const QUESTION_SECONDS = 60;
const LANGUAGE_KEY = 'blackthorne-quiz-language';

const TEXT = {
  en: {
    case: 'Patient assessment · Case 7713-A',
    summons: 'Pens ready. Write your answers on your form.',
    questionOf: (n, total) => `Question ${n} of ${total}`,
    answerOf: (n, total) => `Answer ${n} of ${total}`,
    timeUp: "Time's up",
    endCode: 'End of assessment',
    endTitle: 'Pens down',
    endText: 'Time to review your answers.',
    doneCode: 'Assessment complete',
    start: 'Begin',
    next: 'Next',
    back: 'Back',
  },
  de: {
    case: 'Patientenbeurteilung · Akte 7713-A',
    summons: 'Stifte bereit. Schreiben Sie Ihre Antworten auf Ihr Formular.',
    questionOf: (n, total) => `Frage ${n} von ${total}`,
    answerOf: (n, total) => `Antwort ${n} von ${total}`,
    timeUp: 'Zeit abgelaufen',
    endCode: 'Ende der Beurteilung',
    endTitle: 'Stifte weg',
    endText: 'Zeit, Ihre Antworten zu prüfen.',
    doneCode: 'Beurteilung abgeschlossen',
    start: 'Beginnen',
    next: 'Weiter',
    back: 'Zurück',
  },
};

const root = document.documentElement;
const slideNode = document.querySelector('#slide');
const backButton = document.querySelector('#back');
const nextButton = document.querySelector('#next');
const progressNode = document.querySelector('#progress');
const languageToggle = document.querySelector('#languageToggle');
const soundToggle = document.querySelector('#soundToggle');
const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* private window */ } },
};

let questions = [];
let language = store.get(LANGUAGE_KEY) === 'de' ? 'de' : 'en';
let current = 0;
let countdown = null;
let timeLeft = 0;

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

function titleSlide(text) {
  const section = element('section', 'title-slide');
  section.append(
    element('p', 'case-number', text.case),
    element('h1', '', 'Blackthorne Institute'),
    element('p', 'summons', text.summons),
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

function questionSlide(text, number) {
  const sheet = element('section', 'sheet');
  const clock = element('div', 'clock');
  clock.id = 'clock';
  const bar = element('div', 'timer');
  bar.append(element('div', 'timer-fill'));
  bar.firstChild.id = 'timerFill';
  sheet.append(
    element('p', 'form-code', text.questionOf(number, questions.length)),
    element('h2', '', localized(number).question),
    clock,
    bar,
  );
  return sheet;
}

function answerSlide(text, number) {
  const sheet = element('section', 'sheet');
  sheet.append(
    element('p', 'form-code', text.answerOf(number, questions.length)),
    element('p', 'asked', localized(number).question),
    element('h2', 'answer', localized(number).answer),
  );
  return sheet;
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
  slideNode.replaceChildren(builders[slide.type]());

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
  clock.classList.toggle('low', seconds <= 10);
  document.querySelector('#timerFill').style.transform = `scaleX(${left / (QUESTION_SECONDS * 1000)})`;
}

/** Counts down and stops at zero. It never moves to the next slide. */
function startCountdown() {
  const endsAt = Date.now() + QUESTION_SECONDS * 1000;
  const tick = () => {
    const left = Math.max(0, endsAt - Date.now());
    showTime(left);
    if (left === 0) stopCountdown();
  };
  tick();
  countdown = setInterval(tick, 100);
}

// ---- Moving around

function goTo(index) {
  current = Math.max(0, Math.min(lastSlide(), index));
  history.replaceState(null, '', `#${current}`);
  stopCountdown();
  render();
  if (slideAt(current).type === 'question') startCountdown();
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
  }
  goTo(Number(location.hash.slice(1)) || 0);
}

start();
