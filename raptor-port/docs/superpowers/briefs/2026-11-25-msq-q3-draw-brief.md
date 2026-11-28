# [MSQ-PICK-GUARD] the third round — drawing his answers' new looks with three squadrons (chat 176, 25 Nov 26)

You are a fresh Opus helper drawing mock-up pictures of the REAL app for the owner (not technical; he reads on an
iPhone), so he can look at each new thing he ruled before anything is built (D1625). Change no file under
`raptor-port/src` or `raptor-port/tracker`; commit nothing; push nothing; do not start, stop or rebuild the app — the
built app is served at `http://localhost:4700/` (it is this branch's build). Work in `C:\Users\User\projects\Raptor-msq`
(branch `claude/msq-b1-screens-135`) by full path — your shell may start in another folder, which you must not write
to. A pressing helper works at the same time (`raptor-port/scripts/handpass/n176/k*.mjs`,
`raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/today/`) — leave its files alone; each of you drives its own
browsers, so your worlds do not meet.

## Read first
- The full rows (the shell: `grep -h '^| D2598 |' .claude/decisions-full/*.md`) of D2598, D2599, D2620, D2624, D2625,
  D2626, D2628, D2629, D2630, D2631, D2632, D2633, D2635 — each says what is to be drawn — and D1625, D1496, D1222, D487.
- `raptor-port/docs/superpowers/briefs/2026-11-25-msq-c6-words-fable-report.md` (the callsign note's words and cases).
- The last drawer's brief and scripts — `…/briefs/2026-11-25-msq-pick-guard-q2-draw-brief.md` (its "How to draw" is
  yours too), `raptor-port/scripts/handpass/n175/draw-lib.mjs`, `lib.mjs`, `p6-lib.mjs` (set-up presses: `give`,
  `archive`, `usersTab`, the sign-in helpers) — reuse them by import; copy and change only what you must, into
  `raptor-port/scripts/handpass/n176/`.
- The design rules: `.claude/rules/ui-design.md`; `.claude/rules/decisions/design.md` (whole); in
  `raptor-port/docs/design-practices.md` the sections its checklist names for a mock-up and for a new control.
- **Every word you put on screen comes from `raptor-port/scripts/handpass/n176/words.mjs`** (import `W`). It is drafts,
  under review by a fresh Fable now; the host will change that file and re-run your scripts. Never type a word of
  your own on a drawing; a word you need that is not there — report it.

## How to draw
The REAL app driven by a script to the case's state, the new thing then added in the app's own look by cloning the
app's own parts with `page.evaluate` — a folded heading cloned from Admin → Users' own "▸ Archived" heading, a button
from the page's own Filter button, a bell line from a real bell line, a greyed button's reason as the app already shows
one (`title` on a desktop; say what a phone shows), a note by `window.toast(text, 'blocked')` placed as
`n175/draw-lib.mjs` places it. Never a hand-styled box; nothing else on screen changes. deviceScaleFactor 2; desktop
1536×864 (`d`); phone 402×874 touch, WebKit (`p`), as n175 does. Each picture saved whole and as a crop (`-crop`) cut to
what it is about. **Open every picture before you call it done**; one showing the wrong screen, cut-off words or a
covered control is redrawn or reported. Scripts `raptor-port/scripts/handpass/n176/draw-<name>.mjs`, each re-runnable
by itself from the repo root, each printing `FACT` lines of the words actually on screen in each picture. Pictures:
`raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/<id>-<size>-<what>.png`.

## Three squadrons, and people with rights in several (his D2630 — never only a pair)
The demo seeds 142 and 149. Make the world first, by the app's own controls, in one set-up script whose saved data the
others copy (as `p6-lib` does): Saber (master admin, primary 142) adds squadron **150** with "+ New squadron", then adds
three people whose home is 150 (pilots/WSOs, callsigns not already used); Hunter — 142's admin, already given Plan of
149 in `n175/p5-setup.mjs` / `p6-lib` (check) — is also given **View of 150**; archive one 142 man and one 150 man who
share a callsign (rename one by its row first if no two share one — say which) for e6. Print the world's people per
squadron as FACT lines.

## The drawings
- **e1 — "+ Add a person" at the top (D2599, D2628 C11, D2598).** Admin → Users on 142 as Saber: `e1a` the button
  beside Filter on the People row (`d`), full width under the search (`p`); `e1b` the form opened in place under that
  row, "Add person" and "Cancel" at its foot, a name typed (`d`, `p`); `e1c` after Cancel — the form folded shut, empty
  (`d`); `e1d` with the form typed in, 149 pressed in the squadron list — the note `W.addPersonNote('149')` under the
  control pressed (`d`), at the foot (`p`, the pick made in ☰, the menu drawn closed after it). Today the form sits at
  the page's foot: one picture of today (`e1t-d`) for comparison.
- **e2 — the squadron number's two fades (D2620, D2628 C10).** A short film of the real app: Saber on 142 picks 150;
  once 150's page has drawn, the number at the top left dims to about a third and back, twice, about one second in all
  (a CSS animation injected on the number alone — no ring, glow, size or colour change). Record with Playwright's
  video, cut with ffmpeg (on his PC) to mp4 (H.264, plays on an iPhone), about 4 s from just before the press, at `d`
  (cropped to the top bar's left half) and `p`. And `e2-rm` with less motion on (`reducedMotion: 'reduce'`): no fade,
  the number bright white about a second, then grey. Plus three stills of the `d` film (before, mid-dim, after).
  Files `drawn/e2-<size>[-rm].mp4`.
- **e3 — the bell with three squadrons (D2624, D2628 C1).** Hunter (142's admin, Plan of 149, View of 150), his bell
  showing lines of 142, 149 and 150 (raise real lines by the app's own presses where you can; a line cloned from a
  real one where you cannot — say which): the grey squadron number moved to the very start of every line, the numbers
  in one column, no colour; a line about his own account ("Given Plan of 149: full access to 149") keeping that place
  empty. `d`, `p`. And `e3b` — Kestrel's (149's admin) bell with the two new lines of D2626: `W.planGivenLine`,
  `W.planEndedLine` (the line's shape: who, date, words, signer — as a real line draws it).
- **e4 — another squadron's people on Admin → Users (D2625, D2629, D2635, D2626).** On 149's page: `e4a` as Kestrel
  (149's own admin) — 149's people as today; under them `W.folded('142', n)` and `W.folded('150', n)`, closed (`d`, `p`);
  `e4b` the 142 heading opened — its people grouped under it, each row showing only callsign, the grey "142", seat,
  CAT and the access line for 149 (None · View · Plan) — no sign-in mail, role, Save, Suspend, Archive or Delete
  (`d`, `p`); `e4c` the same as Hunter (Plan holder of 149): the Plan choice greyed, its reason `W.planGreyed('149')`
  shown as the app shows a greyed reason (`d`; at `p` say what shows). Today's row as Hunter sees it (P6: mail, role and
  Delete live) as `e4t-d` for comparison.
- **e5 — a master admin's primary open (D2631).** Saber in "All squadrons": 142 (his primary) standing open, 149 and
  150 folded under their closed headings (`d`).
- **e6 — another squadron's archived callsign (D2632, D2633).** On 149's Admin → Users, Kestrel types that callsign in
  "+ Add a person": `e6a` the note `W.archivedNote(...)` with its real details, the button `W.someoneNew` and the words
  `W.askAdmin('142')` (`d`, `p`); `e6b` archived men of that callsign on two squadrons — `W.archivedMany(...)`, each
  listed with its details, one `W.someoneNew` under them (`d`); `e6c` after "Someone new: add him" — 142's admin's bell
  line `W.someoneNewLine('149', callsign)` in a real line's shape (`d`); `e6d` a LIVE man's callsign typed —
  `W.taken(callsign, '142')` where today's "… is already taken — callsigns must be unique" shows (`d`).
- **e7 — bug reports (D2628 C5).** Help's bug reports as an admin: one list, newest first, reports from 142, 149 and 150,
  each wearing its squadron's grey number on its title line, no headings (`d`). Raise real reports by the app's own
  Report a bug where you can.
- **e8 — the badge where he can only look (D2628 C7).** Hunter with 150 picked (View only): the badge
  `W.badgeViewOnly('Hunter')` (`d`); the phone's "Signed in as …" line in ☰ the same (`p`); with 149 picked (Plan) the
  badge stays "Admin" (`d`, one picture). Press the badge on 150 first and report what it does today.
- **e9 — "+ Commitment" on a squadron with no SANS aircrew (D2628 C3).** 150's SANS calendar: the button greyed, its
  reason `W.noSansAircrew('150')` (`d`; at `p` say what shows).
- **e10 — "+ Input" on another squadron (D2628 C2).** Hunter with 149 picked, Inputs, "+ Input": the Person box empty,
  its list offering only 149's men (`d`).
- **e11 — the sign-off boxes (D2628 C8).** 149's schedule, PLANNED BY's list open: Hunter's name wearing the grey "142"
  (and Saber's, if listed), 149's own names plain (`d`).

## Your hand-back
Write it to `C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\6f8c588f-5c4c-4428-8bce-0293bb12cfb9\scratchpad\n176\drawer.md`
AND give the same text as your final message. Under 900 words: the world you made (FACT lines, short); one line per
picture or film (name · what it shows · the words on screen from FACT); what you cloned and from where; what would not
draw and why; what the owner should know (a control covered, words wrapping to three lines, a phone that cannot show a
greyed reason, anything in today's app that surprised you). No wording changes of your own.
