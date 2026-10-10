# Fable's answer — an ALL AVAIL on the one row: must it stand on one man's place? (11 Oct 26)

Asked on the owner's word ("4. Is there a better way to do it? Ask fable on this." / "Why must the all avail puck be
tied to someone") of the plan `docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md`, version 3 (§4.5, R10).
Read-only; one question; the report as returned.

## 1. Recommendation

Keep A (the placeholder leaves with its carrier, said in words) — it is the only candidate that never moves OIL without
the scheduler seeing it AND writes no day from an input command (D450). Add three small things to it: the notice names
the refusals that went with it, the published-day line folds the crowd change into the removal (the plan's "1 change"
claim is wrong against the code today), and the crowd line stops saying "no longer free" for a puck that is simply gone.

## 2. Candidates

**A — sound.** The chain holds as the code stands: `reconcileRequestRows` rule 1 drops the row from the VIEW only
(overlay.ts:269); the holder base keeps the stored row, `more` and `oild` intact until the holder next saves that day
(holderbase.ts:126-131, 192), so Undo of the removal brings the puck and every `<X>|i:A` refusal back exactly
(reversible, deterministic on reload). On a published day the issued `oilev.sent['i:A']` keeps paying the frozen crowd
(D44; oilEarnedWork oilev.ts:1238), the live key loses `i:A` (oilEvidenceKey :859-880, membership on every day) → pending
→ D45 satisfied. Orphan `<C>|i:A` stays stored, inert, filtered from the key (keyedDecisions :899-911) — no phantom
amendment. Three real defects to fix inside A:
- **The count is 2, not 1.** Plan §4.8 says "a man who carried an ALL AVAIL taken off — 1". `oilMovedInputsOnly`
  (:920-939) returns `people = [X,Y,Z]` and the fold at publish.ts:252 requires those men to be among the changed inputs'
  persons — they are not → a separate "What this day earns" item, on a Tuesday too (the `!earns` key is pure membership,
  :877). Same today for ✕ on a one-man row carrying a placeholder. Teach the fold: crowd men who left an item `i:<id>`
  with `id` in `moved.iids` and no live `sent` for it fold into that request's own line.
- **Wrong words.** `crowdChange` (pendlist.ts:395-408) names a gone `i:A` "A placeholder" (`rowByItem` :415-419 returns
  null) and says "→ no longer free" — false; read the issued day's row by `src` and say "ALL AVAIL on Range safety brief
  went with Ranger".
- **The notice goes to the wrong person.** `rederive({live})` toasts whoever ran the command (holderbase.ts:196-222); a
  member removing himself reads "drop it on the row again", which he cannot do; a scheduler on another device gets no
  toast at all (a load is not live). On an unpublished day nothing else marks it. Put the fact in the input command's own
  history line (`inputLines`), read-only off the day: "ALL AVAIL came off his row · refusals for Bane, Comet went with
  it" — reading `oild.people` for `*|i:A` is a read, allowed under D450. That names the refusals the scheduler must redo,
  which is the one thing A loses.

**B — sound-but-costly; I would not.** Determinable: the crowd's keys are every `<X>|i:A` with X ≠ carrier (under §4.5 a
shared row's `more` holds only placeholders, plus the §4.2 legacy occupant); `pa` must be rewritten to `B.hand`
(toggleOilPerson oilmode.ts:468-472; prune :474-475 compares it with `B.leftAt[X]`), an existing `<X>|i:B` must win, and
the view would be editing `oild` on a day the holder owns (same shape as the plan's row-25 carry, but wider). On a
published day it reads as TWO crowd changes ("i:A → nobody", "i:B → X,Y,Z") plus a decisions change — visible, but reads
as the crowd moving when nothing moved. Touches oilev.ts (a new view pass beside prune), overlay.ts, publish.ts fold,
pendlist words; the whole value is for a rare event.

**C — unsound at this cost.** `srcg` re-hashes on every shared-field change (plan §4.1), so an item keyed by it orphans
decisions and frozen `sent` at every re-time; `grp` alone clashes for two entries of one group. A per-placeholder id
changes the value shape in `more`, which every `isSpecial(whoId(v))` reader must learn: dayOilWork :236-250,
landedHasSentinel/landedExtras :1108-1148, oilItemLabel :941-970, oilItemOfKey :827-849, sentinelSeatOK/fillSlot
slots.ts:144-226, AvailWindow, dayPeopleAttrs publish.ts:595-608. A miss there is silent OIL — exactly the bet §3
refuses.

**D — sound-but-costly, and it changes where the crowd earns.** A src-less companion row gathers its crowd over its OWN
written times (oil.ts:339-343), so an all-day input needs 00:00–23:59 typed on screen, and the crowd moves from the
request half to the schedule half (claimDefault no longer applies). The view would have to re-time, regroup and remove a
row that is not a request's — a fourth row kind in overlay.ts, groundGroups, daytpl, foldEntries. Bigger than the
problem.

**E — (i) choosing the carrier only lowers frequency; the filer may not be in the input (D724) and may leave. (ii) Hand
on only at a schedule-side removal is sound** — that door already writes the day inside the input command (§4.5), so the
re-key could be explicit and undone in one step — but it gives two behaviours for one event, and it helps the case where
the scheduler is already standing there and can re-drop in two seconds, not the window/other-device case where he
cannot. Not worth its risk.

## 3. Additions to the plan (A stays)

- publish.ts `dayPendingItemsIn` fold (line 252): fold crowd departures whose item's request is in `moved.iids` and has
  no live `sent`. Test first: published Saturday, four-man input, ALL AVAIL on the lead's row, Bane refused; lead
  removed in the window → exactly ONE item, its words naming the puck and Bane; the issued face still credits X,Y,Z
  minus Bane until republished; republish credits nobody from it.
- pendlist.ts `crowdChange`: a gone `i:` item is named from the issued day's row by `src`; "went with <man>" not "no
  longer free". Test: the words.
- changelines `inputLines`: the removal line names the puck and each `<X>|i:A` refusal on that day. Test: the line; and
  that no day record is written by the command.
- Keep R10's toast for the schedule-side doors (the actor is the scheduler).

## 4. For him

1. **Keep it as planned (recommended):** when the man whose row carries ALL AVAIL leaves the meeting, the puck comes
   off. The app tells you so, says who you had switched off on it, and on a published day it is one line in the changes
   list. You drop the puck again and redo any switches — a few seconds, and it is rare. Nothing about OIL ever moves
   without you seeing it.
2. **Hand the puck to the next man automatically:** looks seamless, but the app would also have to carry your switches
   across underneath, and on a published day it would show you two crowd changes for a puck that did not visibly move.
   More code in the part of the app that works out OIL — the part where a mistake is silent.
3. **Give the puck its own row or its own name:** the cleanest idea on paper, but it means teaching every place that
   reads a puck a new kind, or inventing a new kind of row that the app must keep in step with the meeting by itself.
   The largest change for the smallest gain.
