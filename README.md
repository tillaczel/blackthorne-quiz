# Blackthorne Institute Quiz

Halloween quiz slideshow for the Blackthorne Institute party. Show it on the TV; guests write their answers on paper. It is a static site with no backend.

**Slides:** title page, 25 questions, end page, then the same 25 questions with their answers.

Each question has a 60-second timer. When it runs out the slide stays put: only the host moves on.

## Running the quiz

- **Next:** Next button, right arrow, Space or Page Down (a presentation clicker works).
- **Back:** Back button, left arrow or Page Up. Going back to a question restarts its timer.
- **Language:** the DE/EN button switches at any time, without touching the timer.
- **Sound:** clinic ambience starts on the first tap or key press. The bars button mutes it.
- Press F11 for full screen. Reloading stays on the same slide; the address ends in the slide number (`#12`).

## Spooky extras

- The lights cut out for a moment between slides.
- Eyes blink in the dark, and ghosts, bats and a spider appear every 7–15 seconds. They stay behind the sheet, so they never cover a question.
- In the last 10 seconds the room pulses red, the eyes turn red and a heartbeat plays. At zero a ghost jumps out and shouts Boo.
- Each sheet has a doctor's note or a stamp, and a faint scrawl. These lists are at the top of `script.js`.

All slides use the same sheet, so the question always starts in the same place.

## Included files

- `index.html` — page structure
- `styles.css` — scene, fog, lamp flicker and slide design
- `script.js` — slides, timer, language, sound and animations
- `data/questions.json` — the questions and answers, in English and German
- `assets/blackthorn-corridor.jpg` — background, compressed from the invitation's image
- `tests/questions.test.mjs` — checks the question file: `node --test`

## Editing questions

Edit `data/questions.json`, keeping this shape:

```json
{ "question": "Who wrote Frankenstein?", "answer": "Mary Shelley",
  "de": { "question": "Wer schrieb «Frankenstein»?", "answer": "Mary Shelley" } }
```

The slides follow the number of questions in the file. To change the timer, set `QUESTION_SECONDS` at the top of `script.js`.

The questions and answers are public in this repository and on the site.

## Hosting

GitHub Pages, set up like `tillaczel/blackthorne`: **Settings → Pages → Deploy from a branch**, branch `main`, folder `/ (root)`.

The site is at `https://tillaczel.github.io/blackthorne-quiz/`.

### Custom domain (once)

For `quiz.blackthorne.tillaczel.net`, in this order:

1. Cloudflare → `tillaczel.net` → **DNS → Add record**: type `CNAME`, name `quiz.blackthorne`, target `tillaczel.github.io`, proxy **DNS only** (grey cloud). Keep it grey: GitHub issues the HTTPS certificate itself and that fails behind the Cloudflare proxy.
2. Add a file called `CNAME` to this repository containing `quiz.blackthorne.tillaczel.net`, then commit and push. Do this after step 1, because GitHub then redirects the `github.io` address to the domain.
3. Wait until the Pages settings show the DNS check as successful (minutes, sometimes up to an hour), then tick **Enforce HTTPS**.

## Updating

Commit and push. GitHub Pages republishes within a minute or two; browsers may keep the old version for up to 10 minutes.

## Open locally

`fetch` doesn't work on a page opened directly from a file, so serve the folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
