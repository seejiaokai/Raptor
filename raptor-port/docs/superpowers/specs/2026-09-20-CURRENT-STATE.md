# [S4-BUGHUNT] — THE CURRENT STATE. Read this first. (20 Sep 26)

**This file wins over every other document dated 20 Sep 26.** The decisions below changed several
times in one session, and the other files record the journey rather than the destination. Where any
of them disagrees with this one, this one is right and the other is history.

Branch `claude/s4-bughunt`, off `main` at `e904d44`. Nothing merged.

## The one rule everything comes from

> **Two different facts fighting → let both in, and flag the day.
> The same fact twice → refuse it, and say what is in the way.**

Owner's own words for it, 20 Sep 26. Every decision below is that sentence applied.

---

## 1. BUILT and green on this branch

| # | What it does now | Commit |
|---|---|---|
| 1 | A medical's **real hours** decide every clash and every bid replacement. Its six-hour half still drives the box, manning and the medical total. | `28e230f` |
| 2 | A cut leaves the leave **the hours the medical does not cover** — a 09:00–14:00 medical leaves leave from 14:00. | `c47d3cf` |
| 3 | A medical past midnight **counts on the next day** too, for clashes only. | `aa10858` |
| 4 | Leave starting at exactly **12:00 is the afternoon** — half a day, half a man. | `9e5cf94` |
| 5 | An OIL credit **always lands**, even over leave. The day goes amber; it is banked until resolved. A credit can no longer outlive the hours that earned it. | `ee22b89` |
| 6 | Leave over recorded work is **filed and flagged**, not refused, on the Inputs page. | `ee22b89` |
| 7 | Recorded work **never bars a write anywhere** — bid, approve, move, all four doors. One predicate, `barsWrite`. | `fe378f0` |
| 8 | A refused bid **says why**, at every door it can be refused at. | `9644471` |
| 9 | A **hand-typed credit is never destroyed** — taken over in place, and handed back EXACTLY as the admin typed it (code, hours and reason) when the schedule stops backing it. | `a6e1c64`, `e63d462` |
| 10 | **One** warning list, derived from the day; the work is always the "earns" side. | `ee22b89` |
| 11 | **A man on leave no longer mans a duty weekend.** A credit on a leave day was counting him fully present and on duty. | `ca6b4ff` |
| 12 | **A POST IN date**, set by hand like the post out. The app had no joining date at all before — it existed underneath but nothing could write it, so everyone read as having always been here. Both ends now refuse a window that closes before it opens. | `45d43bd` |
| 13 | **A person's row stretches to reach their records.** A man posted out in January with clearing leave in September was charged for it and could not be seen. Display span only — his official dates never move, so manning still reads zero for him out there. | `45d43bd` |
| 14 | **Days outside a person's time in the squadron are tappable at BOTH ends.** An admin's tap manages the posting; the person's own tap places leave. | `45d43bd` |
| 15 | **Publishing KEEPS an undecided bid and flags the day.** It used to throw it away, while a bid placed after publishing was kept — the same two facts, opposite answers. | `c7bd329` |
| 16 | **A hand-typed OIL credit can be given its hours.** Without them every one meant the whole day, so a two-hour call-out beside afternoon leave turned the day amber for nothing. | `—` |
| 17 | **The free half beside Inputs-filed leave is biddable**, on the free half only, with the locked half named on the sheet. | `—` |
| 18 | **A member is told what a clash means for his OWN leave** — his bid named, and "still live". | `—` |
| 19 | **An admin can RECORD that someone worked** — FO/HO with a reason, who said so, and the hours, from the day sheet. On ANY day. Nothing in the app could create one before; the three editors that existed could only reach credits nobody could type. | `—` |
| 20 | **Leave or OIL can be placed on a day outside someone's posting dates**, by an admin, from the grid. One button on the posting sheet. | `—` |

| 21 | **An OIL AWARD owes a man a day; it does not say he was at work.** A hand-typed credit no longer flags a leave day and no longer counts him on duty — with an empty day he is available to work. A credit the published schedule earned still does both. (N13) | `54c2709` |
| 22 | **A worked day that earns nobody anything says so** — on the day's own warning strip while it is being built, and again at the publish moment. Weekends and public holidays only, and it names the desk. (N14) | `54c2709` |
| 23 | **OIL says why it is there, who gave it and how many days**, on one click, in all three sheets a credit can open in — and automatic OIL answers the same three from the schedule it was earned off ("Weekend/PH", or "Duty input"). It also fixed a sheet that told an earned credit it had been "filed on the Inputs page". | `3eb46ec` |
| 24 | **One window for an input, in every stage** — Ack, Approve, Refuse and Move on one row at the top of the day window, the separate decision sheet retired, and "Pending" renamed to **Ack** everywhere the word showed. (N15) | `4277ad1` |

Process, also built: the **behaviour register**, `npm run rulecheck` (fails when a ruling has no
test naming it), and the **rules-first red team** as a standing third review.

**Gates: see §8.** One known flake, twice confirmed: `src/ui/inputscal.test.tsx` fails under
parallel load and passes alone, with and without this branch.
**Not yet done: the hand-testing pass in the running app.** Everything above is proved by tests and
by reading, not by watching it on screen. That is owed before this merges.

---

## 2. TO BUILD — ALL FIVE ARE BUILT (20 Sep 26). What is left is the HAND TEST.

Items A–E are done and green; they are rows 12–18 of §1 above, plus the new item F (the post-in
button) the owner asked for in the same breath. The three constraints the reviewers put on item B
were all held: display span only, computed once per merge and cached with the grid, month
granularity.

**What is still owed on them, and it is the only thing:** the HAND-TESTING PASS in the running app.
Everything here is proved by tests and by reading. Nobody has watched any of it on screen. That is
what the standing order asks for and it is the one gate not yet run — see §8.

**The one limit worth knowing about item B.** A person who is archived in Raptor AND has neither a
joining nor a posting-out date set by hand is dropped by the roster projection altogether, so no
row can span anything for them. Nothing regressed — that is true of every person today — and with
the post-in button it is now avoidable, because setting either date keeps them. It is recorded here
rather than fixed because resurrecting a person who has no window at all is a different piece of
work.

**Known consequence of B, accepted:** the row appears *because* a record is out there, so the very
first pre-join or post-out leave must be filed on the Inputs page. In practice an admin files it
anyway.

---

## 3. PARKED — decided, deliberately not built

- **A duty cancelling your own clashing bid.** Decided as: an **answered** Duty or "Fly with" entry
  takes the clashing part of the bid, **whichever way the OIL question was answered** — being at
  work and being paid for it are different things. Parked because an admin always decides a bid
  before the day arrives and the day is already amber when they do, so it saves a decision rather
  than preventing a mistake; and because item A above solves the real problem (the member not being
  able to tell) far more cheaply and far more safely.
- **The Leave War cannot see ordinary weekday work at all.** Work only reaches that grid as an OIL
  credit, and credits only happen on weekends and public holidays. A man flying every Tuesday has
  nothing on his row to show it. Real limitation, bigger than everything else on this page put
  together, its own piece of work.
- **`[LW-LOCKMARK]`** (already in OUTSTANDING): the grid locks by DAY rather than by RECORD. Item D
  is the first real consequence of it; D works around it rather than fixing it.

## 4. CLOSED — looked at, not a defect

- **OIL may go negative.** Owner, 20 Sep 26: "it's ok to go negative OIL, because OIL can be earned
  back in the future." So a resolution that withdraws a credit someone has already spent needs no
  guard. The existing notice on the Unpublish button stays as information.

---

## 5. RULES SET ASIDE TODAY — do not re-apply these

This is the most important section for whoever works on this next. Each of these reads as live in an
older document and is **dead**. The standing order is that the newest ruling wins and that the stale
text gets fixed in the same change; these are the ones that changed.

| Rule as written | What replaced it |
|---|---|
| **B4** — "Overlap → no credit" | The credit **lands**, the day is flagged, it stays until resolved. B4's TIME test itself stands and is what raises the flag. |
| **B5**, first half — "a bid made after the publish that overlaps published work is refused at the bid door" | Nothing is refused for recorded work, on any screen. |
| **B5**, second half — "publishing is the door that replaces an undecided bid, so undo of the publish brings it back" | Publishing KEEPS the bid and flags the day (owner, later the same day). Nothing is removed, so there is nothing for an undo to bring back. |
| **Aug 18 / answer C** — "a pre-joining day is blank so there is nothing there to act on" | A pre-joining day is tappable at both ends now. It could not be before: no person had a joining date at all until the post-in button. |
| **"The 15-day rule needs leave COVERING the whole day"** (the plain-language wording only) | "TOUCHES both halves" — the app was right and the words were wrong (owner, Q1). |
| **§26.3** — leave over recorded work is refused | Filed and flagged. |
| **Q5 / §26.3** — approving a bid on a day later credited as worked **skips** that day | It is granted, and the day is flagged. |
| **H2** used to decide *whether* a medical and leave clash | H2 sets the **step** of a cut only. Real hours decide whether they meet, and where the surviving piece starts. |
| **H3** original — two leaves in one half refused even at different times | Overruled by the owner before this session: judged on real times. |
| **Aug 19** — "once I hit the next month the row disappears" | NARROWED, not reversed: the row follows the person's records as well as their dates, so a row with nothing out there still disappears exactly as it did. |
| **Aug 18** — a pre-join day is blank so nothing there to act on | Answer C: leave there may be filed **or bid** (item C). |

## 6. The three owner questions — ALL THREE ANSWERED (20 Sep 26)

This section has now said three different things in one day. Its history in one line: it said
"nothing is unsettled", that was retracted as wrong, three questions were put to the owner, and
these are his answers. Nothing here is open.

**Q1 — The 15-day rule: "touches both halves" or "covered all day"? → LEAVE IT AS IT IS.**
A day where leave touches the morning and more leave touches the afternoon is a full annual day,
even with hours uncovered in between. The owner's reason, in effect: the app counts leave in
HALVES, so two hours in the morning costs half a day and two in the afternoon costs another half —
half plus half is a day. The current reading is that model applied consistently. **No code changed.**
The plain-language rule, which said "covered", was corrected to say "touches" — the words were
wrong, not the behaviour.

**Q2 — Which records extend a row? → THE OWNER REPLACED THE MECHANISM.**
> "We need a post in button just like post out." … "Allow these inputs to be placed outside of the
> post in and post out dates. Because those dates are official dates. But they can be for e.g still
> taking leave after or before they post in or out."

So: the admin sets BOTH ends of a person's time in the squadron by hand (item F, new), those dates
are OFFICIAL — they decide manning and the grey hatch and nothing else — and a record dated outside
them is allowed, shown and charged, with the row stretching to reach it. The five sub-questions fall
out of one rule: **the row reaches anything the war SHOWS.** That excludes only the hidden tail of a
record running past midnight, which is never shown or charged on the second date. Built as rows
12–14 of §1.

**Q3 — Publishing vs a bid → KEEP THE BID AND FLAG THE DAY, BOTH WAYS.**
Publishing no longer removes an undecided bid; it tells the admin and flags the day, which is
already what happened to a bid placed afterwards. Sets aside the second half of B5. Built as row 15.

**Q4 and Q5, raised by the hand test and answered the same day.**
- **"Should we have an option for admin to put FO HO with the ability to input reason, given by?"**
  → **Yes**, and: *"the admin can also credit OIL on the leave sheet for convenience. We should
  enable that even on ANY day."* So the weekend / public-holiday restriction belongs to the
  AUTOMATIC pass alone — it reads the published schedule. A credit an admin types is the squadron
  recording that a man worked with no schedule behind it, which is why it carries a reason and a
  name, and why it moves his OIL balance on a Tuesday like any other day. Built as row 19.
- **"Should we allow filing leave after he posted out?"** → Already the rule (Q2), and already true
  on the Inputs page, on the man's own tap, and on a day out there that already holds leave. Only a
  blank one, tapped by an admin, was taken by the posting sheet. Built as row 20.

---

## 7. The other documents, and what each is now good for

| File | Status |
|---|---|
| `2026-09-20-agreed-rules-plain.md` | The readable statement of the rules themselves, by screen and by type. Still good; **this file overrides its status lists.** |
| `2026-09-20-one-absence-behaviour-register.md` | The formal register with rule ids. §10 holds the session's rulings. **Its N4 entry describes the war's doors as unchanged — they were changed afterwards; see §5 above.** |
| `2026-09-20-clash-doctrine-change.md` | Written for the review. Its "is it built" list is **superseded by §1 here**. |
| `plans/2026-09-20-s4-bughunt-plan.md` | The merged Fable+Codex scenario plan. **Still live** — most of its ground is untouched. |
| `plans/2026-09-20-s4-rules-redteam-findings.md` | The rules sweep's findings. Status column **superseded by §1–§4 here**. |
| `plans/2026-09-20-s4-batch2-rule-sheet.md` | The per-item rule list written before building. **Its N4 row is stale** (§5 above). Otherwise a good model of the standing order. |
| `briefs/rules-first-red-team.md` | Reusable. Unchanged. |
| `specs/2026-09-20-arch-stack-4-clash-check.md` | The original rules of record. **B4, B5 and §26.3 in it are partly dead — see §5.** |

---

## 8. THE ONE THING STILL OWED — the hand test

*(24 Sep 26: the branch merged as PR #422 on 21 Sep 26, and its one uncertified test pair — the Leave War month
window — turned out to be an app bug, fixed and merged in PR #428 (`[LW-MONTHJUMP-PHONE]`, archived). Backlog
item `[S4-BUGHUNT-MERGED]`, which pointed here, is archived; what this branch SET ASIDE stays in §5 above.)*

Every gate below is green and nothing is in flight. What has NOT happened is anybody LOOKING at
this on screen.

| Gate | Result |
|---|---|
| `npm test` | **326 files / 5164 green** |
| `node reference/tfin.js` | **728 / 0** |
| `npm run build` | clean |
| `npm run rulecheck` | **OK** — 21 of 26 rulings named by a test, 5 in the recorded baseline |
| `npm run test:e2e` · `perf` · `smoke:tracker` | **NOT RUN** |
| **Hand test in the running app** | **NOT DONE** |

The standing order (CLAUDE.md §How to work here, 20 Sep 26) is search the rulings, list them,
hand-test against the list ruling by ruling, flag any clash. Steps 1, 2 and 4 have been done and are
what §§1–6 above record. Step 3 has not.

Walk §1 and §6 in the running app, at phone and desktop widths, and report pass or fail per ruling.
The new ground, which no human has seen at all: the Post in sheet and its undo, a row that appears
in a month the person had already left, a pre-joining day being tapped by an admin and by the person
himself, the bid sheet opening on one half with the other named, the hours box on a hand-typed
credit, and what a member reads on a clashed day.
