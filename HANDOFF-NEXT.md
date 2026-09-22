# HANDOFF — 23 Sep 26. `[OIL-SEATS-CAN-EARN]` is LIVE. Next is `[ALL-AVAIL-WINDOW]`.

**Pick the branch `main` in the new-chat picker.** Not `claude/oil-seats-can-earn` — that is merged
and finished. `main` is at `aae10982` and everything below is in it.

## Nothing is in flight

| | |
|---|---|
| `[OIL-SEATS-CAN-EARN]` | **MERGED (PR #425) and LIVE.** Deployed page loaded and checked after the merge — clean, no errors, and the weekend warning the owner asked about shows on arrival |
| The README credentials | **MERGED (PR #426)** — stale and contradicting a decision already made; removed. Not a security change and not recorded as one |
| Open PRs | none |
| Working tree | clean |

## Read these first, in this order

1. **`DECISIONS.md` — the WHOLE file.** D53 exists because a session grepped for two named entries
   and stopped. **D54, D55 and D56 are new on 23 Sep** and D56 changes how you bug-check.
2. **`OUTSTANDING.md`** — the priority order at the top. Read it before you tell him anything is
   undecided or missing (D53).
3. **`raptor-port/docs/bug-check-order.md`** — the standing order. **§2b is NEW (D56)** and will save
   you time on the very first review you commission.

## THE NEXT TASK — `[ALL-AVAIL-WINDOW]`

Its item in `OUTSTANDING.md` is the brief. The short version:

Tapping a count chip opens **one movable, resizable window of real pucks** that does **not** block
the schedule behind it — he scrolls and EDITS while it is open. It replaces both the name bubble and
the in-row crowd, and the **same window serves both counters**: who is AVAILABLE behind a placeholder,
and who is CREDITED OIL (where he switches individual pucks off).

**THE DESIGN IS SETTLED. DO NOT RE-OPEN IT.**

- **D41 — the mock-up is APPROVED and is the design of record**: `raptor-port/docs/mock/allavail-window.html`.
  Changing it now needs his word.
- **D39** — one puck per row at every width; the counter chip drops the word "free".
- **D40** — opens **SKINNY at 212px** (186px is the floor, below which a puck clips); the drag handle
  is the app's own six-dot `⠿` grip. **Build to those numbers rather than re-deriving them.**
- **D38** — pilots left column, WSOs right; real warning flags on the pucks, clickable.
- **The mode rule** — tapping the counter always shows WHO IS AVAILABLE, any day. The "who earns OIL"
  half exists **only while OIL Earn is on**; with the mode off there are no tabs at all.
- **A puck is a MEASURED 74×15** (`--puck-w`/`--puck-h`, pinned `!important`, watched by the browser
  geometry gate). **Do not stretch pucks to fill the columns** — the mock gives each man a full ROW
  instead, which is what makes the list scannable.

**Two things that will bite if you do not read them:**

1. **This is a THIRD kind of transient surface and the app's first.** Not a `Sheet` (scrim, blocks
   everything) and not an inline popup (dismisses on an outside click — the 4 Sep 26 standing rule).
   **It needs its own contract in `docs/ui-contracts.md`, and the outside-click rule must be written
   down as NOT applying to it**, or a later session will "fix" it.
2. **D36 is the reason the flags matter.** A man whose ops brief sits inside his standard debrief must
   APPEAR, flagged, so the scheduler sees the overlap and judges it. **Do not let this drift into
   filtering him out** — that is the change D36 refuses.

**Tier: at least WALK** (a new surface, a new gesture, a shared drawer). Answer §5's eight questions
yourself and say the tier out loud before building — the order fires itself, he never picks it.

## What `[OIL-SEATS-CAN-EARN]` left behind, none of it blocking

`[OIL-READ-LEFTOVERS]` (four findings the final reads raised and the branch deliberately left, one of
them a question for him), `[STORE-READER-SWEEP]`, `[OIL-REQ-NAMEBOX]`, `[POSTOUT-LOST]`'s remaining
half, `[OIL-WORDS]`. All filed with their reasoning.

`[REPO-PRIVATE]` is **parked by him** — he raised making the repo private and sharing it with
developers, then said "nvm disregard this first". Everything established about it is filed so it is
not re-derived, including a **measured 37 billed Actions minutes per push**.

## What this session learned that is worth not re-learning

- **A handoff's SYMPTOM is evidence; its CAUSE is a hypothesis.** Two of the five defects had a named
  cause that was wrong, and one accused a function that already made the check — with a passing test.
- **Several "independent" defects can share one root.** Two of the five were one bug.
- **A test proves its assertion, not its title.** Three defects hid behind tests that asserted an
  ingredient: that a warning *carries* an address (nothing resolved it), that a signature *survives*
  (true either way on that fixture), a global count as a proxy for a local fact.
- **Run the roll-call AFTER the fix as well as before**, filling each cell by looking. That is what
  found the fourth surface.
- **Verify a reviewer's FIX as carefully as their FINDING.** One came with a confident one-liner that
  did nothing, because the mechanism it named gates on a different flag.
- **Run the WHOLE suite after the last change.** A subset let a missing Logic-page row reach CI.
- **Three unit failures this session were load flakes** — a different file each time, each passing
  alone. Never run the unit gate beside the browser gates or a code read.

## The gates, as they stood at the merge

`npm test` 5707/5707 across 354 files · `npm run build` OK · `node reference/tfin.js` 728/0 ·
`npm run rulecheck` OK · `npm run test:e2e` 449 passed/45 skipped/1 known flake passing alone ·
`npm run smoke:tracker` 425/0 · `npm run perf` **4/0, green for the first time**.
`npm run docsize` fails on three files — two never touched, the third over its ceiling before this
branch. D29 forbids trimming docs inside a fix; it needs its own pass (`[DOC-TRIM]`).
