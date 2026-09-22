# HANDOFF — the OIL walk is done and the branch is **MERGED** (22 Sep 26)

> **CLOSED OUT 22 Sep 26.** He gave **"merge live"** and **WAIVED his five-minute look** (D34).
> `[OIL-AUTO-REMOVE]` is on `main` as squash commit `a2d0853`, every check green on the merged head.
> **Nobody eyeballed the walked Saturday** — the evidence is the walk and the gates.
> He then ruled on the open question and three more: **D31–D35**, all in `DECISIONS.md`.
> **The next job's plan is written:**
> `raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md` — read that, not §2 below,
> which is now the background rather than the instruction. Everything else here still holds,
> especially §5's driver traps.

**Read this file first, then nothing else until you reach "What to read next".**

Branch **`claude/oil-auto-remove-design`**, PR **#424**, **63 commits ahead of `main`, mergeable,
no conflicts, every CI check green**. Working tree clean, everything pushed.

**MERGED 22 Sep 26** on his "merge live", with his five-minute look waived (D34). The paragraph that
stood here said it was deliberately unmerged and must not be merged without that phrase; the phrase
was given. Kept, corrected rather than deleted, so the record shows what the condition WAS.

Preview (his surface, not yours — it sits behind Vercel SSO):
`https://raptor-git-claude-oil-auto-remove-design-kai-e2f5.vercel.app`

---

## 1. WHAT IS ON THE BRANCH AND READY TO GO LIVE

The OIL work was built and reviewed over 21–22 Sep. This session did the WALK the standing order
demands, and the walk found four defects that the gates, two independent code reads and ~5,400 tests
were all blind to. Every one is fixed with a test that failed first, and every one was re-driven in
the real app afterwards.

| Found by the walk | What was wrong |
|---|---|
| **Undo's boundary was unreachable** | Fix 5's guard was wired only to the PAGE's Undo, which the board covers whenever it is open — and the board is the only place the OIL mode exists. So the third press silently undid a SCHEDULE change from inside the screen that forbids it. The board's own Undo now carries the same two steps. |
| **A claim row contradicted itself about money** | Four rows read "Nothing on this row can earn OIL" beside a puck reading "Talisman earns half a day". A live claim now says the decision is per person; cancelled / ⓘ / withdrawn claims KEEP the old wording, asserted so a fix that merely deleted the sentence would fail. |
| **D18's second man was paid and drawn inert** | A man the day credited HO was drawn plain, titled "nothing measurable to earn from here", with no switch. Two bodies answered one question; `oilEligible` now asks the same one the money does. |
| **D19's way out was missing on the board** | The "create the missing leave war period" action existed only on the week — so the surface that tells a scheduler the credit can never land was the one with no way out. |

Wording batch: **8** ("✓ OIL done", measured at 390px before changing), **9** (the viewer's own puck
draws its stripe again), **11** (the board shows the ALL AVAIL count), **13** (the contradiction
above) — fixed. **10 and 17 were never defects**; the message box fades rather than being removed, so
the earlier pass mis-measured them. **12 is ruled "leave it"** (D26).

Also fixed: a real TEST defect hiding behind a "flaky under load" label — `stsaved.test.tsx` asserted
on a 1400ms wall-clock window and its own tests ran longer than that. Reproduced by stalling 1500ms,
fixed by freezing the clock, and the fix survives a 2500ms stall.

**Gates, all run on this branch:** unit **5449 / 0** (336 files, run ALONE), build green, reference
parity **728 / 0**, rulecheck OK, docsize OK, tracker smoke **425 / 0**, browser geometry
**447 / 0** — a fully clean geometry run, better than either 21 Sep run. CI on PR #424: build, both
unit suites, all three geometry suites and the Tracker smoke all SUCCESS.

**Do NOT run the unit gate beside the browser gates.** Under three concurrent gates the suite sheds
~37 tests to timeouts (35 test, 3 hook). That is starvation, not a defect, and it is what made the
stsaved fault look like ordinary flakiness.

---

## 2. THE NEXT JOB — `[OIL-SEATS-CAN-EARN]`

**This is what he wants worked on.** It is ONE change carrying three of his rulings, and he arrived at
the governing principle himself:

> *"If everywhere in the schedule can earn oil, then the all avail or all puck should also be able to
> earn oil"*

**D28 — the principle: every seat can earn, the DEFAULT decides whether it does, and the admin can
always override.** Nothing earns by default that does not earn today. This supersedes his own earlier
lean (that ALL AVAIL should not be on duty) AND the agent's recommendation, which was a per-seat
allow-list — his rule is simpler and removes the class of defect instead of enumerating around it.

**Three halves:**

1. **D24 — the exempt kinds.** SC SPARE, AVALON lines and desks, BB lines must OFFER the switch,
   defaulting to OFF. Today they are wholly inert: no switch, no door. **Not a flag flip** — all
   three are skipped BEFORE anyone enters the calculation (`engine/oil.ts`: `saExemptKind` for
   AVALON/BB, `f.spare`/`ac.spare` for the spare), so no item key and no person window exist for a
   credit to attach to. Supersedes D15 and D20 on the DOOR only; D20's second half carries forward
   (a duty block MADE from an AVALON template gets the same treatment).

2. **The defect THE OWNER FOUND, which the walk missed.** On his phone: Sunday 19 Jul, a duty desk he
   added himself 08:00–18:00, Dash and ALL AVAIL on it, mode on, no count. The counter is fine at
   390px (20 × 15px, pressable, the tap lists all 27). **What is underneath is not — on that seat ALL
   AVAIL credits NOBODY.** Measured: the day pays 2 men, the two named people, and writes no key for
   the sentinel at all, so it is a silent drop, not a mis-keyed credit.

   **Cause:** `engine/oil.ts` has two helpers. `putWho` expands a sentinel into real people via
   `expandAll`; `put` resolves one id and drops whatever is not a person.

   | Row type | credited by | sentinel expands? |
   |---|---|---|
   | Flying line | `put` | **NO** |
   | Sim, incl. passengers | `put` | **NO** |
   | Duty desk | `put` | **NO** |
   | Ground row (primary who) | `putWho` | YES |
   | Common Programme (primary who) | `putWho` | YES |
   | **the extras array of EVERY row type** | `put` — `putWho` hands `more` straight to it | **NO** |

   **PRE-EXISTING on `main`** — checked by diff, not assumed; this branch only added item/`via`
   tagging and a `reach(item)` call. But it is the dangerous category the order names: old code a new
   feature has just made reachable and consequential.

   **Why the walk missed it — anti-pattern 2, testing where it works.** Every ALL AVAIL row walked
   was one the demo seed already had, which happened to be one of the two places it is honoured. He
   put one somewhere new within minutes. The method gained a line: **the roll-call must cover where a
   thing can be PUT, not only where the fixture already has it.**

3. **D27 — the display half.** ALL AVAIL / ALL are a SCHEDULING feature: dropped anywhere in the
   schedule they work out who would be available to attend and **SHOW THE COUNT**, by default, with
   OIL Earn switched OFF. Extends `[ALL-AVAIL-REDEF]` (which settled WHO counts as available: no
   ground crew, a SANS man only when planned with us, ATT B in, a time clash out) by settling WHERE
   the answer shows. **Not small** — the counter currently lives inside the OIL mode's own decoration,
   so this means drawing it on all six seat types outside the mode. Same roll-call, but for a READ.

**ONE QUESTION IS STILL HIS AND MUST BE PUT TO HIM BEFORE BUILDING:** whether a seat the rules
genuinely cannot MEASURE — no times, zero length, cancelled, ⓘ — is switchable too, or stays refused
with its reason on screen. The agent's view, for him to accept or reject: those stay refused, because
there is no window to measure and a credit would be invented rather than earned.

**The cost analysis he asked for, and it still governs the shape** (walk sheet §11a): display is a
READ and costs almost nothing in risk; **earning is money, and every earning seat is a money surface
FOREVER**, re-checked on every future change near it. "Available" is a live answer but money must come
from the issued document — the freeze exists (the evidence block stores the participants at
publication) but is only exercised by the two paths that honour the puck today.

**Tier: FULL.** Own roll-call rows on every seat type, both providers reading the code, own walk.
Also fold in `[OIL-UNDO-WORDS]` (one string) if convenient.

---

## 3. EVERYTHING ELSE OUTSTANDING FROM THIS SESSION

All are filed as items in `OUTSTANDING.md` — this is the index, not the content.

| Item | What | Tier |
|---|---|---|
| **`[OIL-SEATS-CAN-EARN]`** | §2 above. **The next job.** | FULL |
| **`[DOCS-GUARD]`** | Fable's findings in full — **nothing in the repo detects a destroyed record**, and a docs-only PR runs ZERO checks. **Scope and order are SETTLED by D30: do all of it, in Fable's order** (F1+F3, then F2+F6, then F4/F5, then the mover). ~2–2½ h, four sittings, no `src`. See §4. | docs/scripts only |
| `[OIL-UNDO-WORDS]` | Inside the mode, Undo says "Undid: a change to the schedule" when it took back an OIL decision. One string. | NONE |
| `[OIL-WORDS]` | Code comments call OIL "money"; it is banked leave (D25). Nothing on screen is wrong. | NONE |
| `[OIL-PHONE-TARGETS]` | **CLOSED, ruled "leave it" (D26).** Do not re-open or re-file; the 15px measurement is kept so it cannot be rediscovered and "fixed". | — |
| `[POSTOUT-LOST]` | A posted-out man walks back into the squadron on a reload. Not an OIL defect — reaches the crew picker, ALL AVAIL and the manning counts. | filed |
| `[OIL-RELINK-XWEEK]` | Fable F8, pre-existing: a request landed in a stashed week keeps the OLD man on its row, and the same request can land twice across weeks. | filed |
| `[LW-SCRUBBER-FLAKY]` | The Leave War e2e timing family. Did not fire this session. | filed |

**His rulings this session: D24, D25, D26, D27, D28, D29** — all in `DECISIONS.md`, each naming the
file that carries it. D24/D27/D28 are folded into `[OIL-SEATS-CAN-EARN]`.

---

## 4. TWO THINGS ABOUT HOW TO WORK, PAID FOR IN THIS SESSION

**The backlog now has an archive, and a rule about rulings (D29).** `OUTSTANDING.md` is read at the
start of every session, so finished work moves to `OUTSTANDING-ARCHIVE.md` — but **only if every fact
a later session needs has a pointer somewhere that gets read. Write the pointer, THEN move.** A
finished item that warns somebody off re-doing something STAYS live. And **a ruling never lives only
in the backlog** — every one gets a home in `DECISIONS.md`.

**Why, said plainly, because it cost real damage.** A trim script made to satisfy the size gate
located each item by its own header and the NEXT header and replaced the span between them — but the
items had been inserted in REVERSE order, so two passes duplicated text and the third deleted
everything between two headers, destroying two filed items, one of them a ruling's only recorded
home. It was committed. It was found by luck. **Never let a programmatic edit span two records without
counting the records before and after.** And `OUTSTANDING.md` has duplicate ids (`[GLOBAL-UNDO]`,
`[S4-BUGHUNT]` each appear twice) and a `## Done` heading inside the item stream, so an id-keyed
span-move finds the wrong block.

**Fable attacked that fix and found the fix vouched for itself** — full report:
`raptor-port/docs/superpowers/specs/2026-09-22-backlog-process-attack.md`. It is worth reading before
touching any of these files. Its headline: **nothing detects a recurrence**, seven of eight gated
files sit at ZERO headroom, and "never trim inside a fix" is prose with no enforcement — which by this
repo's own standard is worth nothing. `[DOCS-GUARD]` carries the work, and **D30 settles its scope and order — do all of it, in Fable's order, and do not re-decide that.**

---

## 5. WHAT TO READ NEXT

1. `OUTSTANDING.md` → `[OIL-SEATS-CAN-EARN]` (the job) and `[DOCS-GUARD]`.
2. `DECISIONS.md` → **D24, D26, D27, D28, D29** (D25 is vocabulary).
3. `raptor-port/docs/handpass/2026-09-22-oil-walk.md` — the walk's evidence sheet: the tier, the
   re-marked roll-call, the four defects with their causes, **§11 and §11a for the ALL AVAIL finding
   and the display-versus-earning cost**, §7 for what was NOT walked, and §10 for what each find cost
   the method.
4. `raptor-port/docs/bug-check-order.md` — the standing order. Read it before any bug check; it
   decides the tier and it fires itself.
5. `raptor-port/docs/handpass/README.md` — how to re-run any scenario in seconds, and the traps.

**The driver traps, so they are not paid for twice:**

- **`openInputs(page, di)`** — the board's PERSONAL INPUTS panel ships FOLDED and renders no rows, so
  a claim's edit button is ABSENT, not hidden. Call it before reaching for any request row. The
  toggle attribute rides the header in BOTH states, so read the ROWS, not the attribute.
- **The saved world is tied to its PORT** (`http://localhost:4173`). Loading it elsewhere restores
  NOTHING and the app draws a valid EMPTY day — a false pass. `lib.mjs` refuses it.
- **The Leave War's PERIOD SELECTOR, not its grid.** The grid draws only the selected period's cells
  (353, all 2026), which reads exactly like "the war stops at 2026". It carries TWO periods, so the
  first uncovered year is **2028**. Reading the grid nearly produced a false defect report.
- **"Publish day" is drawn five times** (board twins plus the week), so a bare `:visible`+`.first()`
  presses a copy nobody can see. Use `tap()`. And a publish is REFUSED while a day carries hard
  conflicts — Mon–Thu all do in the demo, so **Friday is the only clean weekday** for a publish
  fixture.
- **The message box (`#toastEl`) FADES rather than being removed**, and is reused. Read it by id,
  immediately, and capture its opacity — two findings were wrongly filed as defects because a probe
  looked for it late or by the wrong selector.
- **For a cause-and-effect check, pick a subject the day pays NOTHING.** On the everything-Saturday
  most men already earn, so an "after" reading proves nothing without a "before".

---

## 6. MODELS, AND WHAT TO DO FIRST

`[OIL-SEATS-CAN-EARN]` is money, so: **red-team the plan across BOTH providers before building**
(Claudex), build on **Opus, high**, then **WALK the app**, then **both Fable and Codex read the
finished code** independently and blind to each other. The walk goes BEFORE the reads — reading for
absence works when there is a roll-call in hand.

**First message of the new chat should do three things:**

1. Put the open question to him (unmeasurable seats: switchable, or refused with a reason?).
2. Ask whether he wants `[OIL-AUTO-REMOVE]` merged first — it is green, walked and waiting on his
   "merge live" and his five-minute look, which he has not yet given.
3. Then plan `[OIL-SEATS-CAN-EARN]`.
