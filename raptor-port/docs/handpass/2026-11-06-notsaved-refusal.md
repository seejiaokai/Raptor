# Evidence — a refusal of one change is the grey "Blocked" note (his D1667, D1668; [NOTSAVED-REFUSAL-LOOK])

`claude/notsaved-refusal-look`, pull request 639, 6 Nov 26. Built at `2fa83931d` (on `main` brought in at `7f042a80b`).
The drawing of record: `docs/mock/2026-11-05-notsaved-refusal/img/*-r2grey-*.png` (round 2, his "B").

## What was built
- **The passing note** (`ui/toast.ts`, a new kind `'blocked'`; its look `ui/scheduler/28-blocked.css`): the app's plain grey
  note; a drawn red "no entry" sign; the words up to the first colon bold white, the rest quieter; read from the left
  (on a phone too, where other notes centre); held as long as an amber note. Words built as elements, never markup.
- **Its four users:** the schedule's two catch-alls — "Blocked: nothing was kept", "Blocked: that change is not yours to
  make" (`ui/inputedit.tsx NOT_SAVED`, `NOT_YOURS`); the document too big to store, its own words with a colon
  (`boot.ts`); a Leave War figure box leaving the screen refused — "Blocked: <box>. <why>." (`BalancesPage.tsx`).
- **The Leave War's tag** (`balances.css .bp-blocked`, `BalancesPage.tsx ErrWords`): the store's own refusal under a figure
  box, a Grades name or days box and a new grade reads "Blocked" in the grey tag with the red sign, hung from the box's
  left edge; every other refusal of those boxes keeps the red tag (the cost he was told, D1668).
- **Left as built, on purpose:** the schedule's refusal that carries its own reason ("<reason> — nothing was saved…") —
  not in his drawing (D1665's list), so it stays amber: put to him as Q1 below (D1625: nothing new he will see unasked).

## The tier (bug-check order §5)
1 Money — NO: words and look only; no save, figure or OIL changes. 2 Published record — NO. 3 Saved data — NO: nothing
stored changes. **4 A shared drawer — YES:** the passing note is drawn for the whole app, the tag by three Leave War
windows. 5 Gesture — NO. 6 New surface — NO: the same note and tag elements, a new face. 7 Roles — NO: who may change
what is untouched (only the words of a refusal). 8 The warning list — NO. **Tier: WALK.**

## The rules sweep
D1663, D1665 (one look of their own, apart from the band), D1667 ("Blocked:", never "Not saved" or "Refused"; the document
keeps its words), D1668 (the grey note, only the sign red, "Blocked:" bold white; the other Balances refusals stay red),
D1655 (the band's strip untouched), D1666 (`?savefail`), D850 (a refusal out of sight is told in a note), D828 (a note's
phone width), D731 (1) (a note over a phone window stands at the top), D887 (no glow), D1495 (the drawing check).
Each is checked by the walk below or a named test; none contradicts another.

## The roll-call — every place a "not saved" refusal is drawn
| Place | Shows the grey "Blocked" face? | Reached by a control? | Proof |
|---|---|---|---|
| Schedule: a window's save refused, nothing said by it (`saveBatchX`) | has it | NO, because it is a safety net no window reaches today | `toastblocked.test.ts`; walk S6a (look) |
| Schedule: a group input's save refused with no reason heard | has it | NO, the same | `toastblocked.test.ts`; walk S6b (look) |
| Schedule: a group input's save refused WITH a reason | must not yet, because it is not in D1665's list — Q1 to him | yes | unchanged; `groupwrite.test.ts`, `batch2.test.tsx` |
| A document too big to store | has it, its own words | yes (the input window's Document button) | walk S1 |
| A figure box leaving the screen refused (Balances, the person window) | has it | yes (a role changed from another device — the bridge's lwSetRole) | walk S2; `balances.test.tsx`, `personwindow.test.tsx` |
| The store's refusal under a figure box | has it | yes (the same route) | walk S3; `balances.test.tsx` "the store said no" |
| The store's refusal in the Grades window (name, days, new grade) | has it (the same `ErrWords`) | NO, because no tab reaches it today ([LW-NIGHT1025-OLDER]) | `balances.test.tsx`; the shared component |
| Every other refusal at a Leave War box ("Type a whole number…", "Give the grade a name") | must not, because D1668 keeps them red | yes | walk S4, S5 |
| The failed-save band | must not, because "Not saved" is its alone (D1665) | yes (`?savefail`) | walk S7 |

## Sizing the walk (walk-ledger §Before any walk)
1. **Type:** E (a look on a shared element) and D (the face drawn by two pieces of code — the note and the tag), with F (words).
2. **Only a walk finds:** how the face really draws — wrapping, the sign against its first line, the phone's centring
   overridden, the note at the top over a phone window — and whether every other note and the band are untouched.
3. **The ledger:** E/D walks of the passing note and the band (save-band, member-guest) found their faults at the phone's
   width and over windows; they were host-sized and short.
4. **The walk:** the host alone, `scripts/handpass/nsr1106-walk.mjs`, 14 checks a size at his PC's 1536 (Chromium) and
   his iPhone's 402 × 874 (WebKit, by touch): S1–S7 and the break tests B1 (the next plain note), B2 (a long one). The
   repeated cases (each refusal's words, the face clearing, the reader's copy, markup typed into a name) are carried by
   `toastblocked.test.ts`. Lessons (§7.11): 1 — the note alone, after another, over a window (S1, B1); 3 — what tells him
   (the note itself); 5 — the tag against what stands over it (S3 pictures); 6 / 21 — what only his iPhone draws: its
   letters (Apple's font) wrap the note differently — his look; 8 — the drawing compared, below; 9 — the sign measured
   against its first line (S1d, B2); 22 — the sign's red pixels counted (S1c); 2, 4, 7, 10–20, 23 — no gesture, window,
   pinch, keyboard, print or tap target is changed.
5. **The row** is added to the ledger.

## The walk — 27 PASS, 0 FAIL, no page or console errors
Pictures: `docs/img/handpass/2026-11-06-notsaved-refusal/walk/` (`walk-log.txt` beside them).
| | Desktop 1536 | iPhone 402 |
|---|---|---|
| S1 a document refused: grey, its lead bold, the rest quieter; the sign drawn (270 / 263 red pixels) and level with the first line (0 / 1px); on the phone at the top over the window, 12px a side | PASS | PASS |
| B1 the next plain note: no sign, no grey face, its own centring | PASS | PASS |
| S4 a figure the box cannot take: the red tag, its words | PASS | PASS |
| S3 the store's own refusal: "Blocked" in the grey tag, red sign | PASS | PASS |
| S2 a box leaving refused: "Blocked: Reaper LVE App bal. You can change only your own figures." | PASS | PASS |
| S5 an emptied grade name: the red tag | PASS | PASS |
| S6a, S6b the schedule's two catch-alls (look only) | PASS | PASS |
| B2 a long refusal: wraps under its words, inside the screen | PASS | PASS |
| S7 the band: "Not saved", amber, its own sign | PASS | PASS |

**Found by the walk, older than this change (filed, not fixed here):** in the phone test browser (WebKit) a member's
sign-in raises "Couldn't save that document…" at once — the demo's documents cannot be stored by that test browser. The
build before this change does the same in its amber words (`scripts/handpass/nsr1106-docnote-probe.mjs` on both builds).
If his iPhone ever did it, it would now show as the grey note at sign-in: put on his look card. Filed [WEBKIT-DOCNOTE-SIGNIN].

## The drawing check (D1495) — 1 difference, put to him
`scripts/drawcheck/specs/notsaved-refusal.mjs`; the drawing's record `docs/mock/2026-11-05-notsaved-refusal/drawcheck/`
(the replay identical to the approved pictures, all eight); the report `docs/img/handpass/2026-11-06-notsaved-refusal/drawcheck/report.md`.
31 of 32 parts match. **The one difference:** on the phone the drawing's "Blocked" tag starts 53px right of its box, the
build's at the box's left edge (`figbox-phone--tag.png`). The cause, measured (`nsr1106-tagplace-probe.mjs`): the
drawing laid its grey face over the red tag after the app had nudged that red tag 53px to keep it on screen; the build
draws the grey tag fresh, which needs no nudge. The desktop drawing has it at the box's left edge, as built.
**Recommended: keep the build** (the tag under its own box, alike on phone and desktop). The check stays red until he rules.

## His answers, 7 Nov 26 — built the same day
- **Q1 yes (D1669):** the reason refusal is grey too — "Blocked: <reason>. Nothing was saved[ for anyone: take that person off the list, or change it]." (`ui/inputedit.tsx reasonRefusal`). Its words and kind pinned by `toastblocked.test.ts`; the related suites (71 files, 1,930 tests) green; its look is the same note as S1–S6, pictured in `question/Q1-reason-grey-*.png` with these words.
- **Q2 yes (D1670):** the build's tag place is kept; the drawing check's difference is kept with his ruling — the check re-run: **GREEN, 0 unexplained, 1 kept**.

## His look (on his iPhone)
1. Leave War → Balances: nothing to do but look — the grey tag needs a refusal no button reaches; the pictures show it.
2. Inputs → + Input → Document: if his iPhone's storage is fine, nothing shows (good).
3. After signing in on his iPhone: does a "Couldn't save that document" note ever appear? (It should not.)

## Reads
WALK tier: no code read is required (§5). The short line of D1668 was read against its full row by one fresh reader: PASS.

Walk: host, 27 PASS / 0 FAIL at 1536 + 402 (WebKit), pictures in `docs/img/handpass/2026-11-06-notsaved-refusal/walk/`; drawing check green (31/32, the one difference kept on his D1670); Q1's change carried by its tests and the same note's walk.
