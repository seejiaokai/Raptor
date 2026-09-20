# The clash doctrine — what it was, what it is now (20 Sep 26)

> **Read `specs/2026-09-20-CURRENT-STATE.md` first.** Decisions in this session changed several
> times; that file is the destination and this one is part of the journey. Where they disagree, that
> one is right.


Written for the owner and for the cross-provider review of the change. Every section answers one of
his questions: what the plan was before, what it is now, what the workflow becomes, what each person
sees, what could go wrong, and what is actually built.

---

## 1. What the plan WAS

Three separate rules, each written at a different time, each reasonable on its own:

| Situation | Old behaviour | Where it came from |
|---|---|---|
| Work and an absence cover the same hours | **No credit at all.** The OIL pass refused to place it and reported a clash to the admin's warning list. | Clash check **B4**: "Overlap → no credit, amber `!`" |
| Leave filed onto a day the person is recorded working | **Refused outright.** Nothing saved, an orange message naming the hours. | Design §26.3, the invariant at the inputs door |
| An out-of-date credit whose hours had changed | Nothing removed it, so it stood claiming hours nobody worked. | An accident of the two rules above meeting |

They did not fit together. The refusal to *place* a credit meant the pass wrote nothing; the tidy-up
pass then skipped that day because the day still wanted a credit; so a credit already there survived
with stale hours. And the two directions disagreed: **work landing on leave was allowed and flagged,
while leave landing on work was refused** — the same two facts accepted or forbidden purely by which
was entered first.

## 2. What it IS now

**One rule, in one sentence:**

> If the hours really clash, record both and flag the day. If they do not, allow it silently. Never
> delete anything without saying so.

The owner's reasoning, 20 Sep 26:

> "Does making a hard refusal be a bit contradicting to what I'm allowing for the schedule?
> Currently on the schedule if there's a clash I still allow planning but there is just flagging."

It was contradicting. The validation engine's entire doctrine is *record it, flag it, let a human
resolve* — a double booking is two facts that cannot both be true, and the schedule flags it rather
than stopping the scheduler. Leave now behaves the same way.

| Situation | New behaviour |
|---|---|
| Work and an absence cover the same hours | The **credit is banked**, the day goes **amber**, the warning list names it. It stands until someone removes one side. |
| Leave filed onto a day the person is recorded working | **Filed**, the day goes amber, and the filer is told in the same breath. |
| Hours that do not actually overlap | Allowed, no flag, nothing said. Unchanged. |
| Resolving | Remove the work → the credit goes. Remove the leave → the credit stays. |

**Rulings this sets aside**, per the standing newest-wins rule:
- **B4's "Overlap → no credit"** half. B4's *time test* stands and is exactly what raises the flag.
- **§26.3's refusal** of leave over recorded work.
- The 20 Sep morning fix that deleted a stale credit on a clash — no longer needed, because the pass
  now overwrites.

## 3. How the workflow changes

**Before.** A man is on the published schedule Saturday 08:00–12:00 and is granted urgent leave.
Nobody can record the leave. It must wait for the published day to be amended and re-signed. Until
then the leave exists nowhere in the app. If the person gives up, nothing is recorded and nobody
knows there was ever a problem.

**Now.** The leave is filed immediately. The day carries an amber mark, the warning list names the
conflict, and the OIL credit stays banked. The amendment still has to happen — a man cannot be on
leave and on the flying programme — but the leave is *on record* while it does, and the conflict is
visible to everyone instead of living in one person's head.

**What has NOT changed:** nothing is silently overwritten. An approved leave is never deleted by a
publish; the OIL pass never removes a request; a hand-typed credit is never touched by the pass.

## 4. What each person sees

| Who | Where | What |
|---|---|---|
| Whoever files it | The moment they save | The record saves. A message: *"Swift is recorded as working 08:00–12:00 on 14 Feb — this LL is filed anyway and flagged for someone to resolve."* |
| Everyone, on the war | The day's box | An **amber `!`** instead of the grey count. |
| Everyone | Tapping the day | Both records on their own lines — the leave, and the credit with its hours. |
| Admin | The strip at the top | *"Plasma: weekend/PH work earns FO but 18 Jul holds LL — resolve on the sheet."* |
| Member | — | **Only the amber mark. The words are admin-only.** The owner has ruled (20 Sep) that members should see it too; **not yet built.** |

## 5. What could go wrong — the bugs to look for

Written as the review's starting point, not as a claim that these exist.

1. **A day that never gets resolved.** Nothing forces anyone to clear an amber day. The old refusal
   made the problem impossible; the flag makes it possible-but-visible. If nobody looks at the
   strip, a person can sit on leave and on the programme indefinitely, with the OIL banked.
2. **Both figures move at once.** While unresolved, the person is charged the leave *and* holds the
   OIL credit. That is the owner's intent ("until that thing is resolved"), but it means balances
   and manning are momentarily describing two different worlds.
3. **Resolution is implicit.** Removing either side clears it, but nothing in the app says so. A
   person looking at an amber day is not told what action ends it.
4. **Order independence.** The whole point of the change is that both entry orders give the same
   picture. That needs proving in the app, both ways, not just at the store.
5. **Undo across a flagged day.** Undoing the filing, or the publish, must return the day to exactly
   its previous state — credit and flag together, in one step.
6. **The warning list's wording** now depends on which record it meets first; the pair is ordered so
   the work is always the "earns" side. Worth checking on a day with several records.
7. **A hand-typed credit still means the whole day**, because there is nowhere to type its hours.
   Until that box exists, this rule fires far more often than it should — every hand-typed credit
   conflicts with every leave that day, whatever the real hours were.

## 6. Is it built?

| Piece | State |
|---|---|
| The credit lands instead of being refused | **BUILT**, `ee22b89` |
| Leave over recorded work is flagged, not refused | **BUILT**, `ee22b89` |
| The day goes amber, the warning list names it | **BUILT** (falls out of the existing machinery) |
| The filer is told in the same breath | **BUILT** |
| One warning list instead of two; the work is always the "earns" side | **BUILT** |
| Six tests rewritten to pin the new rule | **BUILT** — full suite green, 321 files / 5121 tests |
| **Members seeing the words, not just the mark** | **NOT built** — owner ruled it 20 Sep |
| **A box for the hours on a hand-typed credit** | **NOT built** — owner ruled it 20 Sep; this rule needs it to behave sensibly |
| **Hand-tested in the running app** | **NOT done** — unit tests only so far |

---

# Section 2 — bugs found and being fixed

Separate from the rule change above. Found by the scenario plan, the rules-first sweep, and by
walking the workflow screen by screen.

## Fixed and committed

| # | What was wrong | Why it mattered |
|---|---|---|
| 1 | A medical recorded 08:00–10:00 owned the whole morning | Leave at 10:30 was refused, or **silently deleted** if filed first |
| 2 | A cut left leave the app would then refuse | A five-hour medical cut a full day down to an afternoon it then rejected |
| 3 | A medical past midnight put nothing on the next day | Next morning's leave went straight over hours the person was off sick |
| 4 | Leave starting at exactly 12:00 was read as a whole day | Cost a whole day of balance and a whole person off manning |
| 5 | A credit outlived the hours that earned it | Showed a morning nobody worked, with the OIL still counted |
| 6 | The leave a medical cut lost the whole day | Now keeps the hours the medical does not cover — "leave from 2pm" |
| 7 | The warning list could read "earns FO but the day holds FO" | Nonsense entry from a second, cruder list; that list is gone |

## Found, not yet fixed

| # | What is wrong | Source |
|---|---|---|
| 8 | **A member bidding leave on a day they are recorded working gets nothing at all** — the box closes, no leave, no message | Found by walking the workflow screen by screen |
| 9 | A posted-out person's **whole row disappears** once the months scroll past their posting window, while their clearing leave is still charged | Codex rules sweep |
| 10 | A day **before someone joins cannot be tapped**, so leave can be filed there but not bid | Both providers |
| 11 | **Cannot bid the free half** beside leave filed on the Inputs page — the tap opens a read-only panel | Fable rules sweep |
| 12 | A **SANS offer over leave warns nobody** | Both providers |
| 13 | A **publish replacement freezes no actor** in its notice | Codex rules sweep |

Items 8–12 are the next build. 13 is low and parked.

## Still open, unreviewed

The scenario hunt's original ground is largely untouched: the Inputs-page calendar (the one door
with no test at all), the medical dialog's cascade, bulk gestures driven by a real drag, switching
wars with a sheet open, storage faults, phone touch, and the figures on multi-record days.
