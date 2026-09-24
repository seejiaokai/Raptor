# Plans-selector follow-ups — working plan & design (15 Sep 26)

Branch `claude/amendment-engine-core` (PR #405). Test-first, Opus high. Source of
truth for the asks: `docs/plans-selector-followups.md`. This file is the DESIGN +
progress + e2e blueprint for the seven items and the owner's two live refinements.
Delete (or fold into session-state) once merged.

## Owner decisions captured (15 Sep 26, this session)
- **Item 1 → option (a): each plan OWNS its sign-offs.** Sign state travels with
  the plan through switch / duplicate / undo. Both plans can hold their own greens.
- **Refinement R1 (within a plan): a CHANGE clears the sign-offs.** Whenever a day
  has any valid (green) sign-off and its content then changes, the displayed
  sign-offs reset to empty — a change needs re-signing. (This is the owner's core
  complaint: after an edit the greens used to stay lit while the day was actually
  unsigned, so no publish button appeared and he had to re-tick already-green boxes.)
- **Item 7 → keep the publish button hidden when nothing to publish;** just make
  the status line honest.
- **Refinement R2 (new, folds into Item 7): a "nothing to publish" bubble.** When
  the user completes all four sign-offs on an already-published day with NO pending
  changes, pop a transient toast: "All signed — no changes to publish right now."
  General principle to apply throughout the e2e: wherever correct behaviour could
  read as a bug because it is silent, add a note; drive the app as a confused human
  would and look for those gaps.

## The unifying insight (Items 1 + R1)
Signature VALIDITY is already correct everywhere: `signMissing`/`daySigned` check the
content BINDING (`signBind`, AM-06), so publish is already locked correctly after an
edit or a plan switch. The ONLY bug is the DISPLAY: `signoffHTML` renders the stored
name green even when the binding no longer matches. Two changes fix everything:

1. **Display follows validity (R1 + half of Item 1).** `signoffHTML` shows a role's
   name only while its content binding still holds; a binding broken by an edit
   renders EMPTY. Scoped to BINDING breakage only — an unappointed-but-signed name
   still shows (preserves the existing "never silently blanks on appointment change"
   behaviour). Reverting the content back restores the name (AM-06 F-09 unchanged).
2. **Per-plan sign storage (Item 1a).** `draftDup`/`draftSelect` stow/load
   `SCHED.sign[di]` + `SCHED.signBind[di]` in the plan blob, so each plan keeps its
   own greens. (`schedFields` already serializes `sg`+`sb`, so undo/stash already
   carry them — no history change needed.)

Without (2), per-day storage means signing plan A wipes plan B's stored greens; with
(2) each plan round-trips its own. Without (1), a within-plan edit leaves stale green.
Both needed.

## Per-item plan

### 1. Signatures per plan (HEAVY — rules-engine robustness bar)
- `engine/publish.ts`: add `signRoleOk(di,role,cur?)` (the ONE per-role predicate:
  signed + appointed-where-required + binding-holds), refactor `signMissing` to use
  it (no drift), add `signShown(di)` returning per-role display id ('' when binding
  broken only). Keep `currentBind` computed at most once (gate on "some role bound").
- `ui/html.ts signoffHTML`: read `signShown(di)` for the displayed value + `selected`
  option + `.on` class + `any` (Clear button). `signMissing` still drives `.so-state`.
- `engine/drafts.ts`: in `draftDup` (both first-dup blobs AND later dup) and
  `draftSelect` (stow + load), carry `sign`/`signBind` on the blob. First dup: both
  Plan A and Plan B copy the live day's current sign state (identical copies).
  `draftDelete` down-to-one: nothing extra (live SCHED.sign[di] already IS the
  surviving plan's).
- `ui/board.ts` ~1376: drop the `· signatures reset` toast clause (with per-plan
  storage the plan's own sign-offs come back — nothing is "reset"). Reconcile
  `draftsui.test.tsx` C3 assertion.
- Pins: `engine/drafts.test.ts` (sign travels with plan; A and B independent),
  `engine/signbind.test.ts` or new (signShown blanks on edit, restores on revert),
  `ui/draftsui.test.tsx` (driven: sign B, switch A empty, back to B green).

### 2. Remove amber AL-roll banner entirely
- `ui/Shell.tsx banner()` (or wherever `sb-als`/`schedbanner` renders on `#eBanner`
  and `#vBanner`) → render nothing. Check `app.test.tsx`/`editweek.test.tsx` don't
  assert the roll.

### 3. Colour version tag by AL number
- `ui/html.ts verTagHTML` pub branch → `<span class="verchip" data-alc="${verSeq(cv)}"
  ...>${verLabel(cv)}</span>` (drop flat `.pub`); ORIG grey, DRAFT dashed unchanged.
- `ui/scheduler.css`: replace `.verchip.pub{...#57C97A}` with
  `.verchip[data-alc]{color:#08131b;background:var(--alc,#57C97A)}`; broaden the base
  selector to `.day-head .verchip,.sb-pub .verchip` (tag moves out of .dhtpl, item 4);
  add `:not(.verchip)` to the generic `[data-alc]` underline + ::after rules (~1650)
  so the chip doesn't get a double "ALn" badge/underline.
- Tests: `planselector.test.tsx`/`pubsweep.test.tsx` tag-colour assertions → data-alc.

### 4. Move version tag LEFT of the "4 X 4" badge
- `ui/html.ts dayHTML` day head: remove `verTagHTML(di)` from `.dhtpl`; render
  `<span class="dhver">${verTagHTML(di)}</span>` immediately before `<span class="badge">`.
- Byte-parity: `.dhver` is new and rendered on the compared seed → add a `noVerTag`
  excision (balanced span walk, like `noDhTpl`) to BOTH the edit `E` (html.test.ts
  ~345) and view `V` (~208) excision chains.
- Board: `boardSignHTML` already renders `verTagHTML(di)` in `.sb-pub` — leave; if a
  count sits there, place left of it (check SchedBoard). Board isn't byte-compared.

### 5. Version tag on the VIEW-only schedule
- Falls out of item 4: `.dhver` renders unconditionally in `dayHTML` (not gated on
  ed||vsel), so the view week + the frozen issued face (dayIssuedHTML→dayHTML w/
  PV,PVQ) both get it. Published view day → issued ALn (data-alc coloured);
  unpublished view day → DRAFT. `noVerTag` (item 4) keeps the seed view compare green.

### 6. Warnings on the VIEW-only schedule
- Live view faces (unpublished day, working-copy VWORK view) already pass PV=false, so
  `if(!PV)h+=dayWarnHTML(di)` (html.ts ~1122) ALREADY renders warnings there. The
  frozen issued face runs with PV=true and stays clean (standing rule: never validate
  a snapshot). **Verify empirically in the live app**; if live view genuinely shows
  warnings, item 6 is already satisfied — report that. If the owner also wants
  warnings on the frozen PUBLISHED face, that conflicts with the standing rule → flag
  it as his call, do NOT silently validate the snapshot.

### 7. Board publish status line honest + "nothing to publish" bubble
- `ui/html.ts signoffHTML` `.so-state` else-branch (all signed): make publish-aware
  via `dayApproved`/`dayHasChanges`/`verLabel(dayCurVer)`/`nextSeq`:
  - not approved (first publish) → keep "Signed — this day can be published"
  - approved + changes → "Published at <verLabel> · N change(s) to publish — Publish AL<next>"
  - approved + no changes → "Published at <verLabel> — no changes to publish"
  Use `dayDelta(di)` ONCE for both count and hasChanges (the one authority).
- `ui/Shell.tsx` sign-off onChange: after `setSign`, if
  `daySigned(di) && dayApproved(di) && !dayHasChanges(di)` → toast
  "All signed — no changes to publish right now" (R2).
- Pins: `pubsweep.test.tsx`/`signbind` for the status wording; a driven test for the
  bubble (sign the 4th on a published, no-change day → toast fires, no Publish AL btn).

## e2e blueprint (scoped by judgement — the whole-blast-radius walk)
Surfaces the change reaches: edit week, view-only schedule, scheduler board (three
render the same state — a drift seam). Sign-offs/publish are core; plans touch the
persisted amendment state; verTag/warnings touch all three schedule surfaces. Shared
data touched: signatures/publish state only (NOT people/roles/leave), so Leave War /
Tracker are NOT in this blast radius — state the scoping and skip them.
Journeys (vary order, one representative per equivalent set, undo/redo at junctures):
- J1 Item1a: sign all 4 on Plan B; switch to Plan A → empty; back to B → still green.
  Sign A too; ping-pong → both independently green. Undo across a switch.
- J2 R1: sign a day green; edit a cell → greens clear; undo → greens return; redo →
  clear again; re-sign → green; revert the value by hand → green returns.
- J3 R2/Item7: publish a day (spends sig); sign all 4 again with 0 pending → bubble
  fires, NO publish button, status reads "no changes to publish". Then edit → status
  flips to "N change(s) — Publish AL<next>", greens cleared (R1), publish appears once
  re-signed.
- J4 Items3/4/5: check the tag sits left of the 4X4 on edit, view, board; AL1 cyan /
  AL2 amber / AL3 green (one representative); ORIG grey; DRAFT dashed on unpublished
  view.
- J5 Item2: amber AL-roll banner gone on both #eBanner and #vBanner.
- J6 Item6: view-only shows warnings on a live/unpublished day; issued face clean.
Human-confusion lens throughout: any correct-but-silent state that reads as a bug →
note it.

## Cross-provider bug-check round (Codex/Astra + Fable, 15 Sep 26)
Both reviewed the committed diff; strong convergence. Fixes applied:
- **PSF-002 / Fable #1 (MEDIUM, both):** `rev` in the binding wiped valid greens on
  dup / delete-to-one (a content-preserving plan op only changes plan-rev). FIXED —
  `restampRev` re-points a binding's rev source→dest only when it matched the source
  (dg/iso/base still checked, never revives a moved-out signature). Pinned in
  drafts.test.ts (sign-then-dup, delete-to-one, later-dup, edit-still-invalidates).
- **PSF-003 / Fable #2 (MEDIUM, both):** tag not truly "immediately left of the 4X4"
  (mobile sorted it before the day name; desktop left an auto-margin gap). FIXED —
  moved `margin-left:auto` from `.badge` to `.dhver`, added `.dhver{order:3}` on
  mobile. Verified LIVE at 375px and desktop (tag adjacent-left of badge, after the
  day name, same row).
- **PSF-004 (LOW, Codex):** R2 toast re-fired on re-picking a signer. FIXED — fires
  only on the transition INTO fully-signed (wasSigned guard).
- **Fable #3 (LOW):** status line could read "Published at ALNaN" when a snapshot
  doesn't resolve. FIXED — `cv==null` → "Signed". Pinned in pubsweep.test.tsx.
- **Fable #5 (LOW):** kept types/docs in step — schema.ts DayDraft (+sign/signBind),
  drafts.ts header, data-schema.md, ui-contracts.md (dropped stale "signatures reset").
- **Fable #4 (LOW, by-design):** legacy UNBOUND signatures still appointment-only
  across plans — pre-existing, dev-phase (reset demo data), left as-is by design.

### Codex PSF-001 (HIGH) — FIXED (owner said "close it now", 15 Sep 26)
Added `filingKey(di)` (stable string of `dayFilingFingerprint`, empty acc == absent);
`currentBind` now carries `fil`, and `signBoundOk` compares it — so a filing change (a
leave/Other input accepted onto the day's date) invalidates the signatures exactly like
a content change: `daySigned` goes false, publish is blocked, `signShown` clears the
greens. A pre-existing binding with no `fil` re-signs (dev-phase, session-scoped sign
state). `SignBinding` type gains `fil`. Pinned in signbind.test.ts (filing change
invalidates; revert restores). Original write-up below.

### (original surface note) Codex PSF-001 (HIGH, pre-existing)
A filing-only change (an Other input filed under Unavailable, a leave accepted onto
the day's date) is counted by `dayDelta` but NOT by `currentBind` (digest is DAYS
content only), so on a published signed day such a change keeps `daySigned` true and
can publish an AL on stale signatures; `signShown` won't clear either. It is
PRE-EXISTING (Codex's own limitations note the filing/availability binding is
"explicitly deferred in the core build plan"), Fable did not cover this axis, and
whether a leave-filing SHOULD invalidate the flying sign-offs is a judgement/product
call. Recommend fixing (add a filing fingerprint — `dayFilingFingerprint` already
exists — to currentBind/signBoundOk so filing invalidates like content does), but it
expands into the Phase-3 signature core, so it is the owner's call to include now or
defer. NOT done in this batch.

## Progress
- [x] 1  signatures per plan + display-follows-validity (signRoleOk/signShown; drafts stow/load sign+signBind; board toast clause dropped) — pinned drafts.test.ts, draftsui.test.tsx
- [x] 2  remove AL-roll banner (banner() gone; #eBanner/#vBanner kept only as RULES MODIFIED host; dead CSS removed; --al style removed) — pinned app/editweek tests
- [x] 3  colour tag by AL (data-alc, .verchip excluded from generic ::after) — pinned
- [x] 4  move tag left of badge (.dhver span) — pinned
- [x] 5  tag on view (.dhver unconditional; noVerTag parity excision on E+V) — pinned
- [x] 6  warnings on view — VERIFIED LIVE: the view-only page shows the day warnings panel ("N issues · N warning · tap to review") on live/unpublished days, matching edit. No code change needed — the `if(!PV)` gate was already open for live view faces; the frozen issued (published) face stays clean per the standing rule (never validate a snapshot). If the owner wants warnings on the published issued face too, that's a deliberate change to the standing rule — his call, flag it.

## Live-app verification (Opus browser drive, production bundle, 15 Sep 26)
- Item 2: no amber AL-roll banner anywhere; the "AMENDMENTS" card is the separate ALPanel (not in scope). ✓
- Item 3: published Monday to AL1 via probe bridge → tag renders CYAN (AL1 palette), reads "AL1" once (no double badge). ✓
- Item 4: the tag sits immediately LEFT of the "4 X 4" badge on edit AND view. ✓
- Item 5: tag shows on the view-only day head (DRAFT on unpublished, AL/ORIG on published). ✓
- Item 6: warnings panel shows on the view-only page's live days. ✓
- Item 7: sign a published no-change day → status reads "Published at AL1 — no changes to publish", NO publish button. ✓ (R2 bubble + R1 clear proven via the passing draftsui.test.tsx driven through the real Shell handler; the JS-shortcut used the unbound legacy path which is appointment-only by design.)
- No console errors on the driven pages.
- [x] 7  status line honest + R2 bubble (signoffHTML publish-aware; Shell R2 toast) — pinned draftsui.test.tsx
- [ ] gates (npm test, tfin, build, test:e2e, smoke:tracker)
- [ ] e2e live playthrough
- [ ] bug-check Codex + Fable
- [ ] hold for "merge live"
- [ ] SECOND TASK housekeeping (after merge)
