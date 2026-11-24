# Brief — draw the bell's "every change" line on the real app (the night of 25 Nov 26, job 1)

You are a helper of chat 170, on an unattended night. The owner is asleep: never message him, never ask him anything,
never merge, never open a pull request, never touch `main`. Your final reply is your report to the host (chat 170).

## Where you work

- Only in `C:\Users\User\projects\Raptor-words`, branch `claude/night-1125-bell-pages-170` (already checked out, pushed).
  Never read-write, switch or build in `C:\Users\User\projects\Raptor` — another chat's work is there.
- Scratch outside the checkout: `D:/rw4/` (make `D:/rw4/night1/` for dumps and notes). Raw captures and logs stay there.
- Do not edit `HANDOFF.md`, any rulings file, `OUTSTANDING.md` or any file under `raptor-port/src` in the checkout.

## What this is

His ruling D2600 (24 Nov 26): the bell's line for a changed input is to say EVERY change of one save in words, never
"and 1 more change". It is NOT built and you do not build it. His standing rule: anything new a person will see is
drawn and shown before it is built. Your job is the drawing — real pictures of the real app — and a draft of the page
that puts it to him, with its questions. Read first, whole:

- `HANDOFF.md`, the block `<!-- now:claude/night-1125-bell-pages-170 -->`.
- The full rows: `grep -h -E '^\| D(2600|2601|2521) \|' .claude/decisions-full/*.md` (the shell's grep).
- `.claude/rules/plain-language.md` — the page is read by a man who is not technical.
- `.claude/rules/decisions/how-we-work.md` §Showing him, asking him — the rules of a questions page: what he should
  look at now at the very top, each open question in one line with its recommendation and a link to its pictures;
  every question first says when it happens in real life (who is doing what, how often); a picture shows only what the
  question is about, the place marked, the change named on it in plain words; plain words only — no ruling numbers, no
  review codes, no file or function names in the page's text.
- `raptor-port/docs/design-practices.md` §1b (the writing guide), by section.
- `raptor-port/src/state/notices.ts` — `common`, `partWords`, `firstTwo`, `noticeWords`: what parts one save can make,
  in what order, and how they are joined today. Report the order as built.
- The round-4 walk's tooling, which you reuse: `raptor-port/scripts/handpass/wr4-lib.mjs` (a frozen build served inside
  the test browser — no port; `newPage('phone'|'desk')`, `signIn`, `go`, `press`, `handOver`), and the walkers' scripts
  `raptor-port/scripts/handpass/wr4-a-*.mjs` for how an input is changed as one person and the bell read as another.
  The evidence sheet `raptor-port/docs/handpass/2026-11-24-words-r4-build.md` §4–§5 has the scenarios' steps.
- The earlier questions page for the same line (round 4): find its source under `raptor-port/docs/mock/` (search for
  "words" and "round 4") and follow its shape, so this page looks like the one he already answered.

## The drawing device — a scratch copy, never the checkout

- "Today" is `D:/rw4/build-new3` — a frozen build whose app code equals `main` now (round 4 is live).
- "Every change" is a build you make OUTSIDE the checkout: export `origin/main`'s `raptor-port` into `D:/rw4/draw/`
  (as `D:/rw4/main` was made: an export, with `node_modules` a junction to the checkout's — `cmd //c mklink /J`), and in
  that copy ONLY change `firstTwo` (and nothing else of the words) so the line says every part: the same order, the
  same comma joins, the same small-letter rule for each part after the first, a replaced Leave War bid still said
  last. Build it to `D:/rw4/build-every`.
- **Take the checks lock before any build and release it the moment the build ends**, pass or fail:
  `node raptor-port/scripts/gatelock.mjs take "claude/night-1125-bell-pages-170 — the drawing build"` (it waits while
  another chat holds it — let it wait; never build alongside), then `… gatelock.mjs release`.
- That source change is a drawing device: it is never committed and never copied into the checkout. Say in the page's
  notes file (not on the page) exactly what it was, as a diff, for whoever builds it later.
- If the bell's line is cut by the screen (a row clamp, an ellipsis, a fixed height), that is the most important thing
  you can find: show what the app does with a long line as built, say which rule cuts it, and draw the uncut variant
  too (a second scratch change, described the same way). Do not decide between them — it is a question for him.

## What to draw

Phone first: his iPhone's size, 402×874 with touch (the lib's phone page), pictures he will see taken sharp (device
scale 2; check how the lib sets it). The worst case also on a desktop 1440×900 and the phone case in WebKit as well as
Chromium (the lib's round-4 walk did both for the long line). For each case: today's line beside the "every change"
line, cropped to the bell's row with a little around it, the exact text read from the page and written down, and the
number of rows it takes on the phone.

1. Two changes in one save (the common case) — to show nothing changes.
2. Three: the day moved, renamed, its remark changed (today: "Now Thu 16 Jul, renamed — was Training, and 1 more change").
3. Four or five: add a change of time or a half day, a change of kind.
4. The worst the app can make in ONE save — work it out from `common`: as many parts as can combine, with a long old
   title (about 40 letters) and the person himself added. Say how many parts it is and why no save can make more.
5. One with a replaced Leave War bid, which is said last and was never counted.
6. The wordings round 4 left unruled, on TODAY's build, each a picture of its own (their steps: the evidence sheet
   §5 and §12, and `OUTSTANDING.md` `[UI-SLEEK-PASS]`, the paragraph "Round 4's walk, left for a later round", (2)):
   "Now OL (AM), LL changed to OL"; "Now 00:00–12:00, LL changed to Training"; a moved half-day leave that says no
   "(AM)"; and the three cases that still read "Renamed — was …" (a title given to an input that had none, a title
   taken away, an Attach's "To" changed).

## The page (a draft — the host has its words read by a fresh reader, then publishes it)

- One self-contained HTML file, `raptor-port/docs/mock/bell-every-change.html`, pictures embedded so it opens alone,
  sharp, each picture tappable to see it larger; readable on a phone (he reads on his iPhone) in light and dark.
- The top: what he should look at now — each question in one line, with the recommendation and a link down to its
  pictures.
- Question A — the "every change" line as drawn: is this how it should read? Show cases 1–5, today beside it, the
  rows counted. If a long line is cut or runs to a third row, that is part of the question, with a recommendation.
- Question B — an undone change: he said a change that is undone should get a notification of its own. The host's
  reading, NOT checked with him: in the bell this is already the rule (a line he had read gets a new line saying what
  is true now); on a phone alert, where a message cannot be taken back, an Undo sends a second message. Put it as a
  question with this worked example and no picture of a phone alert (none exists — say so): Saber moves Training to
  Thu 16 Jul and Ranger's phone says so; Saber presses Undo; Ranger's phone gets a second message that Training is
  back on Wed 15 Jul. Ask: is that what he meant?
- Questions C… — one for each unruled wording of point 6, each opening with when it happens in real life, the picture
  of today's line, one or two candidate wordings in the app's own style, and a recommendation marked as one.
- **His rule of this week:** never word or decide anything on your own reading of what one of his words covers — where
  a wording rests on a reading, the page asks. A recommendation is allowed and wanted; it is marked as a
  recommendation, and the question stays his.
- Names on the page are the app's: the bell, the Inputs page, the schedule, Undo. Callsigns as the demo world has them.

## Finishing

- New files: pictures under `raptor-port/docs/img/handpass/2026-11-25-bell-every-change/`; scripts
  `raptor-port/scripts/handpass/bec-*.mjs`; the page; a notes file beside this brief,
  `raptor-port/docs/superpowers/briefs/2026-11-25-bell-every-change-notes.md` (the scratch diff, the order of the
  parts as built, each case's exact text and rows, what cuts a long line, what you could not draw and why). Name each
  new file in `raptor-port/docs/file-map.md` in the same change.
- `cd raptor-port && npm run docsize` must pass before you commit. Commit on this branch (end the message with the
  line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`); read `git show --stat` before the first push — no
  dump, log or build output in it; push alone in its own command: `git push origin HEAD:refs/heads/claude/night-1125-bell-pages-170`.
- Windows traps: a script with an apostrophe is written to a file and run, never a heredoc; in a JS edit script use
  `s.replace(a, () => b)`; no `jq` (use `gh -q`); from Git Bash set `MSYS_NO_PATHCONV=1` before `git show ref:path`.
- Also save your report as a file OUTSIDE the checkout, `D:/rw4/night1/notes-for-the-host.md`, before your final
  reply, and make the final reply the same text: what you drew (each case's exact words and rows), what cuts or wraps,
  the questions on the page with your recommendations, what you could not do, the commit you pushed.
- About 1.5 hours. If something blocks you, do the rest and say what was blocked — do not stop early.
