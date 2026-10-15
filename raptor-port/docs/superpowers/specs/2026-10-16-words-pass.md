# The whole-app words pass — rounds, and his answers (D808)

The words half of `[UI-SLEEK-PASS]` (OUTSTANDING.md): every page's notes, hints, labels and small print gone over for
clear, concise wording and less clutter (D808). Each text ends one of three ways — shortened, deleted, or moved into a
fold — and is put to him as marked pictures of the real app, before and after, at most four questions a round; nothing
in the app changes until he answers. The method is the design guide's §1, §1a, §1b and §8 (`../../design-practices.md`).

## The survey (16 Oct 26)

`raptor-port/scripts/handpass/words-survey.mjs` visits every page as admin and member, at a desktop and a phone, and
records every visible sentence of four words or more (`raptor-port/docs/img/handpass/2026-10-16-words-pass/survey/`,
`survey.json`). Edit Schedule repeats the most: its day panels print the same instructions on all seven days. Known gaps
of the survey: the Tracker stays mounted, so its text is counted on other pages too; the board, the SANS tab and the
Leave War grid were not reached by it.

## Round 1 — the day panels of Edit Schedule and the Scheduler Board (16 Oct 26)

Put to him as a page of pictures (claude.ai artifact `THbwC3DG5dtrMtxV4NPiAh`); drawn by
`raptor-port/scripts/handpass/words-r1.mjs`, pictures in `…/2026-10-16-words-pass/r1/`.

| Q | Proposed | His answer |
|---|---|---|
| 1 | Delete the nine grey lines after the board's panel names (B2–B10); a folded Personal Inputs keeps its count, "show" goes | **yes (D940)** |
| 2 | Delete "tap to review", "press a card to edit" and the fold words; move the editing line into Edit Schedule's Legend | **the editing line: deleted, not moved (D938)**; the rest **yes (D940)** |
| 3 | The removed-input note: the dash a full stop, every word kept | **yes (D940)** |
| 4 | The Amendments box: "No amendments published yet." alone | **yes (D940)** |

**D938 (16 Oct 26):** the editing hint ("times and remarks type in place · clear a time for all day · press the type to
change it") goes from both pages' Personal Inputs and Unavailable panels and nothing takes its place — a scheduler learns
it once, and a legend holds keys, not plain words. It sets aside, for these lines, the guide's "never delete an
instruction for a gesture nothing on screen suggests"; the guide carries it as lesson 1 of its §9 (D941).

**D939 (16 Oct 26):** his direction that the design guide learns from his design suggestions automatically. How — with
or without his word on each lesson, and who reads it — is put to him before anything changes.

**D940 (16 Oct 26 — "1-5 as recommended"):** questions 1 to 4 approved as drawn; built from the exact strings of `words-r1.mjs`'s "after" pictures, with D938.

**D941 (16 Oct 26 — the same answer, question 5, option A):** his design corrections are written into the design guide by themselves, the same day, as a line of its §9 (his design lessons); one fresh reader checks each line; he is not asked first and may strike any from the closing report. Lesson 1 is D938's.

**Built 16 Oct 26** on the same branch: as drawn, with one step past the drawing — the board's open Personal Inputs keeps a ⌃ as the week's heading does (the drawing showed none; without it nothing says the heading folds). Check: `../../handpass/2026-10-16-words-pass-r1.md`.

## Round 2 — next

View-only Sched and the schedule's remaining lines: the next-week peek's "click a day to load it", "No notes yet.", the doubled "accepted" on each Personal Inputs row, the crew panel's "Placeholders · drag in" (named under D852 with round 1, picture `…/r1/desk-crew-dragin.png`).

## Round 1b — his notes on the preview (16 Oct 26)

**D942:** "Disregard this lesson" — lesson 1 struck from the guide's §9; D938's removal of the editing hint stands, for those lines only. **D943:** a short line beside the Ground Programme's name saying how to take an input off (Undo on its Personal Inputs row) — drawn first. **D944:** on a phone the board's Personal Inputs and Unavailable take one line less — drawn first. **D945** (asked while round 1b was drawn): the button on an accepted input's row reads "Reject", not "Undo" — board and week, phone and desktop; "Reject · Tue" where its row is on another day; hover text to match; what it does unchanged. Round 1b put to him as a page of pictures (claude.ai artifact `LyEcfYVzbqXnsgwscLRVvM`, four questions), drawn by `raptor-port/scripts/handpass/words-r1b.mjs`. **D946** (sent the same evening, with a picture of a new input's window): the Remarks box holds only what a person types; "till <date>" shows by default from the dates already picked, always after the remark — this brings forward the filed job of the same name (the app stops writing "till" into remarks; D728 step 2), its questions drawn and put to him first. **D947 — round 1b's answers:** (1) the board's wave header loses "In-time / Rally HH:MM · N ac"; (2) the Ground Programme's line, B: "To take an input off, press Reject on it in Personal Inputs below."; (3) on a phone an input's button sits on its puck's line, board and week; (4) no — Unavailable keeps its heading line. **D948 — the till date, answered** (page `E5EGxqoxCyCzhe3uzjYZjA`, drawn by `raptor-port/scripts/handpass/till-dates.mjs`): (1) Remarks holds only typed words, "till <date>" a grey tag after the box from the dates, in every input window; (2) B — a one-day input still says "till <that day>"; (3) every screen prints remark then date, as today. And his question (not a ruling): why the board's wave header carries "In-time / Rally 16:20 · 4 ac" — it is the wave's earliest report time and its aircraft count (`ui/html.ts waveHeadBoard`); the time is also the Available crew band's edge ("1ST WAVE AM–16:20") and the lines below show it.
