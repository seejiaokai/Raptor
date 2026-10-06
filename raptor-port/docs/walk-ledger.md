# The walk ledger — what kind of walk a change needs, and what past walks found

**Owner, D607 (7 Oct 26):** *"before u execute walks I want u to make sense of the type of change we did and ask opus
to think what kind of walk is needed. And also take note of historical data of the walks we had where there are
statistics of which type of change a walk is useful."*

A walk — an agent driving the running app and opening its pictures — is the dearest part of a bug check: five walkers
on one job (`[OIL-WORK-START]`, 6–7 Oct 26) used about 2.24 million tokens and found no fault in the rule. It is also
the only check that finds a screen nobody wired up (`docs/bug-check-order.md` §1). So its SIZE is decided for each
change, from what the change is and from this record — never by habit. This file is that record, and the step that
uses it. It sizes the walk; it removes no other part of the bug check (the roll-call, the tests, the gates, the code
reads, his look), and it never replaces driving the app where a change needs it (D5).

## Before any walk — the sizing step (D607)

Opus — the planning model: the host when the host is Opus, an Opus helper otherwise — writes these five lines into the
bug check's evidence sheet BEFORE a walker is started, and says the fourth to him in the tier block (`bug-check.md`,
step 3). A walk started without them is a walk nobody sized.

1. **The type of change** — from the list below, with the reason; a change can be several.
2. **What only a walk could find here** — the surfaces that DRAW the thing separately, the new controls or modes, the
   sizes, the orders of action — and what the tests and the reads already cover.
3. **What this ledger says** about walks of that type: how many, what they cost, what they found.
4. **The walk chosen** — the host's own scripted before-and-after run only / one walker / several — with the number of
   scenarios, the sizes (desktop, phone), and what is deliberately left to the tests.
5. **After the walk:** its row is added to the record below, with what it found — before the closing report.

## The types of change

| Type | What it is | Where a walk has something to find |
|---|---|---|
| A | A rule inside ONE shared calculation — no new screen, control or mark | little: every screen reads the one answer; the host's scripted run and a browser test through the real controls show the wire |
| B | A new screen, window, panel or kind of row | the surface itself, at each size, with its empty, error and read-only states |
| C | A new control, gesture or mode | both orders, every state the data allows, the phone |
| D | A mark or figure DRAWN in several places, each by its own code | each place — the classic "never wired up" |
| E | Layout or look — a stylesheet change | every screen at phone and desktop size; pictures opened |
| F | Words only | none beyond reading the words where they show |
| G | Saved data, the publish path, undo, a reload | orders around publish, undo, redo and a reload |
| H | Who may do or see something | each role's own face |

*(The list and the right-hand column are the agent's first draft, 7 Oct 26 — corrected as the record grows.)*

## The record — one row per walk

Compiled 7 Oct 26 from the evidence sheets in `docs/handpass/`; each later walk adds its row at its close. "Faults"
are faults in the app that the WALK found and that were then fixed or filed as real; "words" are wording or cosmetic
finds; "not faults" are finds that proved false, already known, or as ruled. Tokens only where measured.

<!-- ledger:rows -->
| Date | Job | Type | The walk | Tokens | Faults the walk found | Words | Not faults | What else found faults | Sheet |
|---|---|---|---|---|---|---|---|---|---|
| 6 Oct 26 | `[OIL-WORK-START]` (D591, D592) — a flying line's OIL from its entered in-time; a published day keeps its OIL | A, G | 4 Sonnet walkers, 47 scenarios + 120 ordered pairs, desktop + part phone; 1,917 pictures | about 1.88 million (393k, 394k, 540k, 551k) | 0 | 1 (the pending line's wording — fixed) | 8 (1 false, 3 as ruled or as built, 2 already filed, 1 left, 1 cosmetic and older) | the host's 7-step scripted run reproduced the fault before the fix; the plan challenges changed the comparison; the reads found a vacuous browser assertion; the browser test found an older redraw fault on the Logic page | `handpass/2026-10-06-oil-work-start.md` |
| 7 Oct 26 | D606 — an SC shift's typed in-time counts for OIL | A | 1 Sonnet walker, 16 scenarios, desktop + 1 phone; 98 pictures | 360k | 0 | 2 (both older; filed) | 0 | tests written first; the reads found three test limits | the same sheet, §D606 |
<!-- /ledger:rows -->

## The figures

*(Written once the past walks are compiled — below.)*
