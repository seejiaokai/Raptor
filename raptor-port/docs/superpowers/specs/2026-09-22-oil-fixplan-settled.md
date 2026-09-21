# THE FIX PLAN, SETTLED — after both red teams (22 Sep 26)

Branch `claude/oil-auto-remove-design`. Reviews:
`…-oil-fixplan-redteam-fable.md` and `…-oil-fixplan-redteam-codex.md`, written blind to each other.

The brief said: **where they disagree, settle it with evidence, never by confidence or majority.**
Every ruling below names the code that decided it, read by the host in this session — not taken on
either reviewer's word.

---

## 0. THE GOVERNING QUESTION — who owns an OIL decision?

**Both reviewers independently answered the same way, and the code agrees: the PAIR — a man on an
item — which is what is already built.** The fix plan's premise ("a request handed to a different
man CARRIES the first man's refusal") is wrong.

Checked: a decision is stored as `people["<personId>|<itemKey>"]` (`engine/oilev.ts:63-66`), written
only by `toggleOilPerson`, read only by `personDecision`/`oilPersonOn`. Talisman's refusal is
`talisman|i:<iid>`. When the request becomes Ace's, the lookup is `ace|i:<iid>` — **undefined**.
Nothing carries across. Fable proved this by reading; Codex says the same in its own negatives
("`personDecision()` already uses `person|item`").

**So what actually took Ace's money?** Three things in a row, all confirmed in the code:

1. `oilGate` prices the NEW draft against the OLD man's answers (`ui/inputedit.tsx:660` —
   `const prev = (prevRow && prevRow.oil) || {}`). Talisman answered Saturday 0.5; Ace's plan wants
   Saturday 0.5; nothing is stale; the gate returns `none`. **Ace is never asked.**
2. The commit then deletes the answers because the person changed (`inputedit.tsx:1034`) — its own
   comment says *"the new person must be asked again"*, which step 1 has already decided not to do.
3. `ans` is now null, and BOTH readers treat null as No — and the mode draws it with the words of a
   refusal: *"Ace earns nothing from this event"* (`ui/oilmode.ts:371`).

**The clearing rule, and why the cheap one is sufficient.** The hand-back resurrection (Codex's
scenario 7) is real: nothing clears the old man's key when he leaves the row. Codex wanted a new
persisted "assignment generation" frozen into evidence, the schema, the signature binding and Undo.
That is not needed, and the code says why:

- **There is exactly ONE write path for a person change.** Only two lines in the whole app assign
  `input.person`: `inputedit.tsx:989` (inside `commitInputEdit`) and `inputedit.tsx:1159` (inside
  `reassignInput`, which then calls `commitInputEdit`). A clearing rule at that one site therefore
  catches the dialog, the calendar drag and the drag-reassign.
- **A stashed week cannot be reached at the write site** — Codex's M1, and it is a real hole. It is
  closed at READ instead, and safely: `oilEvidence()` is only ever called on the LIVE day
  (`oilev.ts:222`, `oilev.ts:325`, `publish.ts:257/306/812`). An issued day's evidence is the frozen
  copy stored at `publish.ts:257` and is never recomputed. So pruning a dead `<person>|i:<iid>` key
  out of the live projection can never disturb an issued record, which is precisely what Codex
  warned against.

**RULING: pair + clear at the one write site + prune at read + RE-ASK + new words for
"unanswered".** No new addressing concept, no schema change, no signature change.

**On a published day** the whole rule applies to the working copy only; R-1 keeps the issued block
paying the old arrangement until the day is published again. The re-ask happens before the save, so
the amendment goes out carrying the new man's answer.

---

## 1. WHERE THEY DISAGREED, AND WHO WAS RIGHT

| # | The disagreement | Settled | The evidence that settled it |
|---|---|---|---|
| a | Fix 1's mechanism: a carried refusal (plan) vs a missing re-ask (both reviewers) | **Both reviewers.** The plan is wrong | `oilev.ts:63-66` keys by person; `inputedit.tsx:660` never compares the person |
| b | Fix 1's clearing: persisted generation (Codex) vs clear-at-write + prune-at-read (Fable) | **Fable**, with Codex's cross-week hole closed by Fable's own read-side prune | one write path (`inputedit.tsx:989`, `1159`); `oilEvidence` never runs on an issued day |
| c | Fix 2's shape: land a row on every day (plan) vs fix eligibility (both reviewers) | **Both reviewers.** Do NOT touch landing | `acceptInput` refuses a second landing for one id (`slots.ts:376-377`); one row is assumed by unaccept, relink, restore and the board's ✕ |
| d | Fix 2's repair: Fable's one line vs Codex's frozen standing | **CODEX.** Fable's one-liner has a hole | `oilInputEligible` looks for the row in **the day being paid**. `if (!row) return true` means a Friday anchor that is CANCELLED still pays Saturday — cancelling only sets `cx`, it does not make the input dormant, so the `acc==='r'` guard two lines above does not catch it |
| e | Fix 3's cause: a volatile `acc` cache in the key (Codex, reasoned) vs a lost post-out (Fable, probed) | **FABLE — and it is already REPRODUCED and settled**, in §9 of the evidence sheet: the family day had 27 members before the reload and 28 after, the demo's posted-out man having walked back in. Nobody dropped out; one man rejoined | `scripts/handpass/settle-d4.mjs`, run by the walking session. Codex's `acc` hypothesis is refuted by Fable's probe 1 (`acc` is `'g'` before and after) |

**Both reviewers agree on the dangerous direction for fix 3, and they are right:** do NOT suppress
the pending mark, re-freeze at boot, or special-case an OIL-only pending. The mark is how a real
roster change after a publish reaches the money.

---

## 2. THE REVISED ORDER

1. **Fix 1** — re-ask on a person change; clear the old pair decision at the write site; prune dead
   keys at read; close the `reassignInput` door; and give "nobody has answered yet" its own words,
   distinct from a member's No and a scheduler's deny. Covers Fable's M1 (in-place re-timing),
   M2 (drag-reassign), M3 (three states, one sentence) and M4 (hand-back).
2. **Fix 2** — freeze the ONE anchor row's standing into the projected claim and let it govern every
   day the request covers. Do not clone rows.
3. **Fix 3** — settled in §9 of the evidence sheet; do NOT suppress the mark. The real defect is
   that a posted-out man's posting is not persisted, which reaches the crew picker, ALL AVAIL and
   every availability read — **not an OIL defect at all**. It is raised on its own, outside this
   branch's fix list. What stays here is the WORDING: the pending item must say what actually
   moved, not "the OIL decisions on this day changed" when no scheduler decided anything.
4. **Fix 8 (D18)** — split owner/extra inside the source row; the owner stays in the input half so
   his own No is never overridden; extras are schedule work. Watch the all-day mirror (Fable M6).
5. **Fix 6** — the uncovered weekend, including the unreachable warning call site (Codex M8) and the
   OIL question that can never land (Fable M7).
6. **Fix 5** — close the doors that move money; leave Sign and Publish open (both reviewers agree);
   close the mode on Undo and the plans selector (Fable M11).
7. **Fix 4** — the mirror advisory.
8. **Fix 7** — deduplicate the switch on the GENERIC formation renderer, not as an SC special case
   (Codex M2).
9. **Fix 9** — the wording batch, one red test at a time.

**Carried to the owner, not decided here:** "Off day". Both reviewers say the app is consistent that
a day given off is not a public holiday and should not earn, and that the contradiction is a stale
sentence in a written contract. Changing it would change leave charging too. His call.

**Still open from Codex, filed not dropped:** M3 (the Leave War's generic Clear on an auto-credit
day), M4 (posting out hides the credit on the worked day), M5 (a credit with no roster row is
undiscoverable), M6 (two Done buttons), M7 (the pending mark on a sentinel group).
