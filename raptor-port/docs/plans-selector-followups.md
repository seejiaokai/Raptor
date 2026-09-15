# Plans selector redesign — owner follow-ups (batch, 15 Sep 26)

After testing the redesign on the Vercel preview of PR #405 (branch
`claude/amendment-engine-core`), the owner asked for seven changes. **Do these in a
fresh chat, on the SAME branch (PR #405 accumulates), test-first.** Until they are
done, **PR #405 must NOT be merged** — item 1 is a real bug.

Companion: `docs/superpowers/specs/2026-09-15-plans-selector-redteam.md` (the locked
spec) and `docs/session-state.md`. The redesign itself is built + bug-checked (commits
`43edb04`, `6337b02`).

**Owner's screenshots (in the repo — no need to re-paste):**
`docs/img/plans-selector-followups/01-amber-bar-and-signoff-bug.jpg` (items 1 + 2),
`.../02-tag-colour-and-position.jpg` (items 3 + 4), `.../03-board-no-publish-button.png`
(item 7). Read them to see exactly what the owner circled.

## Model / approach
Opus high, test-first. Item 1 is HEAVY (it touches the Phase-3 signature machinery /
persisted amendment state) — treat it with the rules-engine robustness bar. Items 2–4
are light UI. Items 5–6 are medium but **byte-parity-sensitive on the view week** —
watch `html.test.ts`. Bug-check the diff across BOTH Codex and Fable before merge, as
before.

## The seven items

### 1. BUG — signatures leak across plans (day-level, not per-plan)
**What the owner saw:** on a day with plans, sign all four sign-offs green while **Plan
B** is live, then switch to **Plan A** (which was never signed). Plan A shows the four
sign-offs filled/green — it should show them EMPTY.
**Root cause:** signatures are stored per-DAY (`SCHED.sign[di]` via `signOf`/`setSign` in
`engine/publish.ts`), NOT per-plan. `draftSelect`/`draftDup` (`engine/drafts.ts`) stow and
load the day CONTENT blob but do not carry signatures, so `SCHED.sign[di]` persists across
a plan switch. Phase 3's `signBind` recomputes VALIDITY (so "N to sign" and the Publish-AL
lock are right — that is why the switch toast already says "signatures reset", C3), but the
rendered sign-off `<select>`s still show the stored names (green).
**Design decision (owner's call — ASK):** either
  (a) make signatures **per-plan** — carry the sign state in the plan blob so each plan
      shows its own sign-offs (stow/load them in `draftDup`/`draftSelect`, add to
      `state/history.ts:schedFields` so undo/stash carry them); OR
  (b) **clear the displayed signatures on a plan switch** when they invalidate (reset the
      `signOf` names so the selects go empty), matching the "signatures reset" toast.
  Recommend (a) — a plan is an alternate version and should own its sign-offs — but it is
  the bigger change; confirm with the owner. Reconcile the C3 toast wording either way.
**Files:** `engine/publish.ts` (SCHED.sign, signOf, setSign, signMissing, daySigned,
signBind), `engine/drafts.ts` (draftDup, draftSelect, the stow/load), `state/history.ts`
(schedFields — what undo/stash serialize). Pin with a test in `engine/drafts.test.ts` and
a driven one in `draftsui.test.tsx`.

### 2. Remove the amber AL-roll banner ENTIRELY
The thin amber bar showing "AL1 Mon · AL2 Mon" chips (the `sb-als` roll) — remove it. This
finishes the banner removal: the WHOLE week-status banner goes (the status text was already
removed; the owner now confirms the AL roll goes too).
**File:** `ui/Shell.tsx` `banner()` — return nothing / drop the `schedbanner` render on both
`#eBanner` and `#vBanner`. Check `app.test.tsx` / `editweek.test.tsx` don't assert the roll.

### 3. Colour the version tag by AL number
The green title tag (`verTagHTML`, `.verchip`) is currently flat green for any published
version. The owner wants it coloured BY the AL number: **AL1 cyan, AL2 amber, AL3 green,**
and so on — the existing `alColor(seq)` / `data-alc` palette (the old `.dal` chip used it).
ORIG stays grey.
**Files:** `ui/html.ts` `verTagHTML` (emit `data-alc="${verSeq(cv)}"` and drop the flat
`.verchip.pub` green; keep `.verchip.orig` grey, `.verchip.draft` dashed); `ui/scheduler.css`
(style `.verchip[data-alc]` off the AL palette like `.dal` did). Update
`planselector.test.tsx` / `pubsweep.test.tsx` tag-colour assertions.

### 4. Move the version tag to the LEFT of the "4 X 4" wave-count badge
The tag currently sits by the day name (inside `.dhtpl`). Move it to sit immediately to the
LEFT of the `.badge` (the `dayCount` "4 X 4" chip on the right of the day head).
**File:** `ui/html.ts` `dayHTML` day-head — render `verTagHTML(di)` just before the
`<span class="badge">` instead of inside `.dhtpl`. **Byte-parity:** the `.badge` region is
byte-compared, and the seed week is unpublished, so a `DRAFT`/verchip there would break
parity — gate/excise accordingly (see item 5; the two are linked). On the board, place it
left of its own count if applicable.

### 5. Show the version tag on the VIEW-only schedule too
Currently `verTagHTML` is edit-surface only (rides `.dhtpl` / `.sb-pub`). Show it on the
view week's day head as well (next to the 4X4 per item 4).
**Watch byte-parity:** the view seed week is byte-compared in `html.test.ts`; every seed day
is unpublished, so a `DRAFT` tag rendered in a compared region breaks parity. Options: add a
`noVerTag`-style excision to the parity test (sanctioned idiom, like `noDhTpl`), OR render the
tag in a wrapper that the existing excisions already cover. Decide and pin.

### 6. Show warnings on the VIEW-only schedule (like edit schedule)
The view page currently omits the day warnings panel ("N issues · N warning · tap to
review", the `dwbox`/`daywarn`). The owner wants it shown on view-only too.
**Care:** the standing rule is a snapshot/issued frozen face is never validated (no WARN
reads under a preview). So scope this to the view page's LIVE render (the unpublished day /
the working-copy view), NOT the frozen issued face. Confirm which faces show warnings.
**Files:** `ui/html.ts` (the `dwbox`/`daywarn` render is currently gated — find the gate and
open it for the view live render), and ensure `validate()` has run for the view week (it may
already, since ViewWeek renders live days). Pins in `html.test.ts` / a view test.

### 7. Board publish control — no button after first publish; misleading "can be published"
**What the owner saw (screenshot 03):** on the scheduler board, a published+signed day (AL3)
shows "Signed — this day can be published" but NO publish button; he only ever saw a publish
button at the FIRST publish.
**What's actually happening (verified):** the board DOES show "Publish AL" when a published
day has pending CHANGES (`pubsweep.test.tsx` proves `boardStrip` renders it, and the day-head
does too). His day had 0 pending changes since AL3, so there is correctly nothing to publish
→ no button. The confusion is the **sign-off status line**, which is NOT publish-aware:
`signoffHTML` (`ui/html.ts:1600-1602`) always prints "Signed — this day can be published" when
all four are signed, even on an already-published day with nothing to publish.
**Do:** make that status line publish-aware — e.g. on a published day read "Published at
`<verLabel>` · N change(s) to publish — Publish AL`<next>`" when there are pending changes,
and "Published at `<verLabel>` — no changes to publish" when there are none; keep "Signed —
this day can be published" only for the FIRST publish (unpublished day). **ASK the owner:**
does he also want the publish control ALWAYS visible on the board (greyed/disabled when there
is nothing to publish) rather than hidden? That is a product preference, not a bug.
**Files:** `ui/html.ts` `signoffHTML` (make the status line branch on `dayApproved(di)` /
`nextSeq` / the pending count); confirm the board (`boardSignHTML`) and week read the same.
Note this interacts with item 1 (a leaked signature could wrongly satisfy `daySigned`).

## When done
Run all gates (npm test, tfin, build, test:e2e, smoke:tracker), note that test:e2e's only
real failures are the 2 pre-existing ones (geometry board flying-line at phone width;
Leave War tab). **Drive the real built app end-to-end like a human — scoped by JUDGEMENT to what the change
affects** (owner, 15 Sep 26). The shallow smoke test missed item 1; a real playthrough would
have caught it. The method is NOT a fixed checklist:
- First REASON about the whole blast radius — everything this change could affect across the
  app, not just the file you edited (use `docs/feature-impact.md` and the CLAUDE.md "weigh the
  whole ecosystem" standing order: which surfaces read the same data/rule, what's downstream,
  which drift-seams open). The owner's examples (undo/redo, switch-away-and-back, publish-then-
  edit) are ILLUSTRATIONS of the kind of thing to think of, not the list itself.
- Then JUDGE what's worth driving by hand: walk those journeys end to end in the real app,
  re-entering states after transitions, checking what's on SCREEN, and exercising the
  cross-cutting ops (undo/redo etc.) at the junctures the change reaches.
- Test a COMBINATION of sequences, not one happy path — vary the ORDER of operations
  (sign→switch→publish vs switch→sign→publish, edit-then-undo-then-switch, etc.), because
  robustness bugs live in the orderings, not the single linear run.
- But recognise EQUIVALENCE: repeated instances of the same mechanism are one test, not N.
  Many ALs (AL1, AL2, AL3…) are the same code path — test one representative, don't re-prove
  every version. Same for "day 2 vs day 3", "Plan C vs Plan D": test the mechanism once.
- Check EVERY SURFACE/AREA the change reaches, not just the one you edited (owner, 15 Sep 26).
  Start with the three schedule surfaces — **edit week, view-only schedule, scheduler board** —
  which render the same state (a drift-seam; `docs/feature-impact.md`). But do NOT stop there:
  if the change touches shared data or rules, follow it into the **vendored sub-apps too** —
  **Leave War** and **Tracker** are separate apps wired to Raptor through seams (roster/PEOPLE
  projection, role sync, OIL credit, the people bridge — see CLAUDE.md's Leave War / Tracker
  sections). E.g. a change to people, roles, published schedule, or availability can surface in
  Leave War; a change to people can surface in Tracker. Drive and eyeball each area the change
  can reach; confirm each reflects what it should. Skip an area only when the change genuinely
  can't reach it — judgement, as always.
- Be token-smart: if an area is robust and this change doesn't touch it, DON'T re-test it.
  Make the scoping visible ("testing X/Y because the change reaches them; not Z, unaffected").
Bug-check across Codex + Fable. Then hold for the owner's "merge live".

## SECOND TASK (housekeeping) — owner ask, 15 Sep 26, AFTER the fixes merge
Do this only once the seven fixes above are merged; it is not part of the feature.
1. **Delete the handoff screenshots** — `raptor-port/docs/img/plans-selector-followups/`
   (three images) exist only for THIS handoff; remove the folder once the fixes are done.
   Also drop their reference lines from this doc (or delete this doc if fully consumed).
2. **Repo-wide space / redundancy sweep.** Find genuinely dead or redundant material that
   can be safely removed to save space: orphaned files, unreferenced assets/images, dead
   CSS, unused exports/functions, stale docs, duplicated content, build cruft.
   **CAUTION — this repo deliberately KEEPS some dead-looking code** (CLAUDE.md §Stable
   decisions): e.g. `WEEKS`, `restoreDayVersion`, `openWarns`, `autoSortRoster`,
   `saDutyIx`/`waveDutyBlock`, `localBackend`, the `probe-bridge` API — kept for
   reference/tests/probes. Do NOT remove those. For each candidate: grep the whole repo
   (code, tests, probes, docs, reference) for references, and confirm it isn't a
   deliberately-retained item, before removing. Land it as its own gated PR, in batches,
   with gates green — never bundled with the feature fixes. Report what was removed and the
   space saved; ask the owner before removing anything load-bearing or ambiguous.
