# DONE — BUILT 21 Sep 26. Kept as the record of the two rulings and how they were read.

**Both rulings are built and green on `claude/s4-bughunt` (`54c2709`), plus the `duty` half the
owner ruled on the same night, which this file said to ask him about. See CURRENT-STATE items
21–24 and behaviour-register entries N13–N15.**

Three things this file got wrong, recorded because the next reader will otherwise trust them:

1. **The demo-data fork's recommendation was wrong.** Marking the historic demo credits `auto`
   does not survive: the OIL pass's reverse sweep DELETES an `auto` credit no published schedule
   backs, on every wake, so the tracker would have emptied on first run. The demo file's own
   comment says as much. **The owner chose to leave the demo data alone**, and nothing about it
   changed.
2. **"They lose their star" was false.** The star IS the `auto` mark; those credits were already
   hand-typed, so they never had one.
3. **The nine tests were nine, but eight more moved with the `duty` half** — not the six this
   file measured. The three extra are the under-manned list, which loses 3 January: RAMP's
   hand-typed FO had been reddening the day by standing the only SXO down.

Original text follows.

---

**Branch `claude/s4-bughunt`, clean at `0f457e3`, pushed, PR #422 open. Nothing merged.**
Read `2026-09-20-CURRENT-STATE.md` first; this file is the one piece of work queued after it.

Both rulings came out of the hand-testing pass and are recorded here because they exist NOWHERE
else — they were given in chat and the chat is gone.

---

## RULING 1 — an OIL AWARD stops flagging a leave day

> "i want an award of an OIL to stop flagging a leave day. That makes sense."
> — owner, 20 Sep 26

### What an "award" is, precisely

There are two kinds of OIL credit and they now behave differently:

| | What it is | Stored | On screen |
|---|---|---|---|
| **The app's** | Earned off the PUBLISHED SCHEDULE for a weekend or public holiday actually worked. It knows the hours. | `oil: 'auto'` | `FO*` — the star means the app put it there |
| **An award** | A person granted it, for any reason, on any day. No hours behind it. | `oil: 'manual'` | `FO` |

An award says a man is OWED a day. It does not say where he was. So it cannot contradict a day off,
and the day must not go amber for it. **The app's own credit still flags**, because that one does say
he was at work.

### Where the change goes

`engine/dayview.ts`, `forbiddenPair` — exempt a credit that is not `auto`, before the pair table:

```ts
if ((a.kind === 'credit' && !a.auto) || (b.kind === 'credit' && !b.auto)) return false
```

That exact line was written and then REVERTED during the session that produced this file, because at
the time it was the assistant's own inference rather than the owner's ruling. It is now his ruling.
The revert is why it is spelled out here rather than left to be rediscovered.

### HE DID NOT RULE ON `duty` — DO NOT CHANGE IT

The same reasoning would say an award should not count a man as ON DUTY for the manning figures
either. **He has not said that, so leave `duty` exactly as it is** (`shown.some(c => c.kind ===
'credit')`), and put the question to him separately.

This is not a nicety. It was MEASURED during that session:

- exempting the amber alone turned **9 tests red** — all of them tests whose subject is a clash;
- also changing `duty` turned **6 more red** (`availability`, `counterrules`, `evaluate`, `counts`)
  — manning figures, across the whole seeded world.

Six red manning tests is the signal that `duty` is a bigger, separate change touching numbers the
squadron plans against. It needs its own ruling.

### The tests that will go red, and which way they move

All nine are tests whose subject is "a hand-typed credit clashes with leave". They move WITH the
rule; none of them is weakened:

- `scenarios-bughunt.test.ts` — "a bid the war refuses…", "a hand-typed credit on a day that already
  holds leave", "is not counted on duty when the leave takes his whole day"
- `engine/dayview.test.ts` — the two amber cases that use the credit helper
- `ui/memberclash.test.tsx` — all four; its `beforeEach` builds the clash with `setCell(P, SAT,
  'FO')`, which is now an award

**The move is the same in every case:** where the test means RECORDED WORK, build the credit with
`ingestDutyCredit(person, date, 'FO', 'FLT')` (the app's own, `auto`) instead of `setCell(…, 'FO')`.
Where it means an award, assert `amber` is now `false` and say why in the comment.

### THE DEMO-DATA QUESTION — decide before building

**Every credit in the seed and the demo overlay is `oil: 'manual'`** (`engine/seed.ts` `credit()`,
`state/demoworld.ts` `earned()`). They represent OIL earned by working real weekends — so under this
ruling they all become AWARDS, stop flagging, and lose their star on screen.

Two ways, and this is the fork:

1. **Mark the historic demo credits `auto`.** The demo then reads truthfully — those days WERE
   worked, the star shows, and the clash tests keep their subject. More faithful; touches seed data.
2. **Leave them.** The demo shows no stars and no flags until a day is actually published.

**Recommended: (1).** The standing rule is that this is a dev-phase app on demo data — clear and
re-seed rather than migrate (`dev-phase-reset-demo-data-not-migrate`). Faithful demo data is worth
more than a smaller diff, and it keeps nine tests meaning what they say.

---

## RULING 2 — warn when a worked weekend earns nobody anything

> "Yes i want a warning." … "I would also like u to give the warning On the day itself, while you're
> building it and At the moment you publish."
> — owner, 20 Sep 26

### The defect it closes, in his own scenario

He put DASH on the SDO desk for **Sunday 16 Aug**, published the day, and no OIL appeared. He asked
whether that was because it was demo data. It was not.

**The duty row had no START and no END time.** `engine/oil.ts:dayOilWork` reads a duty row as
`w2(parseHM(r.str), parseHM(r.end))` and returns null when either is missing — so the row measures
nothing and mints nothing. The whole FO-or-HO decision is "more than six hours, or six and under",
and with no times there is nothing to measure. The 19 Jul demo week credits because its SDO desk is
filled in as 08:00–18:00.

So today: he publishes, nothing happens, and the app never says why. **A silent failure on a man's
leave balance.**

### Both placements, and what each is for

**A. On the day itself, while he is building it** — a line in the day's existing orange warning
strip (the "N issues · N warning · tap to review" one). THIS IS THE VALUABLE ONE: he sees it before
he signs the day off, when fixing it is free. After publishing, fixing it costs an amendment.

Words: **"SDO has no times — nobody earns OIL for this day."**
Name the desk: a day can carry three desks and only one be blank.

**B. At the moment he publishes** — a short message at the bottom of the screen, as a backstop for
anyone who skipped the strip.

Words: **"Sunday 16 Aug earned nobody any OIL — the SDO desk has no start and end times."**

### Scope

**Weekends and public holidays only.** They are the only days that earn OIL at all, so a blank duty
desk on a Tuesday is ordinary and must say nothing.

### Where each goes, and the risk

- **B is cheap and carries no risk.** `sync.ts` already speaks at the publish moment
  (`publishFlagsBids` toasts there) and that seam is Leave War's own.
- **A touches the SCHEDULE's checking engine** (`validate.ts`), which is what the byte-for-byte
  reference gate (`node reference/tfin.js`, 728/0) sits on top of. `reference/tfin.js` does assert
  against day warning strips — loosely (presence and counts), and its own demo Saturday has a timed
  desk, so a correctly-scoped rule should not fire there. **Check parity early, not at the end.**
  The rules-engine robustness doctrine in `CLAUDE.md` applies in full.

Estimate given to the owner: about an hour and a half for both.

---

## Order, and the gates

1. Ruling 1 (including the demo-data fork above), with its nine tests moved.
2. Ruling 2B (the publish message) — quick, proves the wording.
3. Ruling 2A (the day's warning strip) — the careful one. Run `node reference/tfin.js` as soon as
   the rule exists, not at the end.
4. All seven gates: `npm test`, `npm run build`, `node reference/tfin.js`, `npm run rulecheck`,
   `npm run test:e2e`, `npm run perf`, `npm run smoke:tracker`.
5. Hand-test in the running app at desktop and phone widths, per the standing order.
6. Update CURRENT-STATE §1 and the behaviour register (N13, N14), and this file's status.

## Traps this branch has already paid for — do not re-learn them

- **`npx tsc --noEmit -p tsconfig.json` is NOT the project's typecheck.** It passed a missing import
  and two other real errors that `npm run build` rejects. **Use `npm run build`.**
- **A new CSS rule in a Leave War stylesheet needs the `#page-leavewar` prefix**, or it silently
  loses to its own neighbours however far down the file it sits.
- **Python edit scripts:** detect the file's own line ending (`store.ts` is CRLF, most of
  `leavewar/` is LF), and **write after every replacement** — a script that writes only at the end
  and throws halfway leaves earlier edits unapplied while looking like it ran.
- **Grep before adding a constant.** A second `MAX_GIVEN_BY` was written at a different number
  beside one that already existed.
- **When tests go red, ask whether the RULE moved or the code broke.** Nine red tests here mean the
  rule moved and they should follow it. Six red manning tests meant the opposite — that a change
  nobody had ruled on was being made.
