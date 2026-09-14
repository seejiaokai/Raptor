# Plans selector — design red-team (Fable, 15 Sep 26)

Design under review: mockup v13 (https://claude.ai/artifact/KKwNPvFbPDeVcFx7xywU3K).
One white selector button per day (label = what you are viewing: "Live working copy" /
"Plan B" / amber "👁 AL2"); its menu = editable copies on top (switch instantly) →
"Issued · read-only" (preview) → "+ Alt Plan" at the bottom. Green title tag = issued
version. Removed: PART-PUBLISHED banner, "✓ Published · ALn" pill, green "Live copy"
pill, the "Drafts" button and the old `<select data-dver>`. "Draft" → "Plan", lettered.

Verdict: the design holds. Six things will be bugs if built naively; one product
decision; the rest is fine. Fix specs are exact so the Opus build can apply them.

## A. Must-fix in the build

### A1. "Load onto working copy" keeps its two-tap confirm
- Where: `ui/interactions.ts:857-863` (restArmed), `ui/html.ts:1091-1093` (confirm UI).
- Risk: mockup shows a single tap. With unpublished divergence (`dayDiscardCount>0`)
  a single tap silently discards edits.
- Fix: keep the existing arm → "Discard N edits & load — confirm" / "Keep editing"
  states verbatim. No engine change.

### A2. Week page loses its only "Back to live" when the green pill goes
- Where: `ui/html.ts:152` (`.livebtn back`, `data-golive`) is the ONLY back control on
  the week page's issued-preview bar (`html.ts:1090-1093` has Load/Confirm/Keep, no
  back). The board's bar already has one (`ui/SchedBoard.tsx:220`, `dprev-back`).
- Fix: add `<button class="dbeak dprev-back" data-golive="${di}">← Back to live</button>`
  to the issued branch of `pvBar` in `html.ts` (same markup as SchedBoard). routeClick
  at `interactions.ts:784` already handles `data-golive`. Then retire `.livebtn`.

### A3. "Publish ALn" must not be reachable while previewing
- Where: `ui/html.ts:1028` `alpub = ed && ok && nd` — no `!PV` guard.
- Risk: viewing AL2, tap "Publish AL5" thinking "publish this" → publishes the LIVE
  working copy. Check `pendChip` (`html.ts:1008`) uses the same `nd` source as the bar
  (`html.ts:1080` switches to `PVND` under preview) — make both agree.
- Fix: `alpub` renders only when `!DPREV.has(di)`; under preview render nothing (the
  bar's Load/Back are the actions). Same guard on the board's publish control.

### A4. Retire 'd:' plan-PREVIEW from the EDIT surfaces only — keep it for the view page
- Where: `ui/Shell.tsx:149-157` routes `select[data-dver]` values; `'d:<id>'` →
  `setDayPreview` (preview a plan) + "Switch to this plan" bar (`html.ts:1088-1089`,
  `interactions.ts:802-821`). The view page's `viewDraftSelHTML` (`html.ts:200-209`)
  ALSO uses `'d:'` preview — viewers can only look, never switch — and must keep it.
- Fix: the new edit-side menu calls `switchDraft` (board.ts:1358) for plan rows —
  instant switch, one undo step, rebase on published days, preview cleared. Stop
  emitting `'d:'` from the edit picker. Do NOT delete the `'d:'` machinery
  (`daySnapOf`, `isDraftVer`, `draftVerLabel`) — the view page needs it.
  Tests to rewrite: `ui/draftsui.test.tsx:218,311` (assert 'Viewing plan Draft 1').

### A5. One selector builder for BOTH surfaces
- Where: `ui/html.ts:170-190` `dverSelectHTML` feeds the week page (`verSelHTML`) AND
  the board's sign-off strip (`verSelBoardHTML`, `sb-dver`, `SchedBoard.tsx:382`).
  `draftsMenu` (board.ts:1390) serves the board's Drafts button AND the week's
  `data-draftsopen`.
- Risk: build the new menu on the week page only → the board still shows the old
  `<select>` with "Draft 1" — two UIs for one state.
- Fix: one `planSelectorHTML(di)` (button) + one `planMenu(anchor, di)` (popMenu),
  used by both; `draftsMenu` and `dverSelectHTML` retired together. The code already
  states this doctrine (`html.ts:160-165` "ONE body so … can never drift").

### A6. Byte-parity tests: the selector must always render
- Where: `html.ts:145-146, 1041` — picker and draftChip are EMPTY on the seed week
  "which is what keeps the byte-parity day head untouched"; `html.test.ts` compares
  the day head to `reference/tfin.js` verbatim with the `noDhTpl` excision
  (`html.ts:1112`).
- Risk: the new selector renders even with no plans and no versions (it is the
  "+ Alt Plan" entry point) → parity tests go red.
- Fix: render the selector INSIDE the already-excised `.dhtpl` span (it replaces the
  "Drafts" button that lives there), so the existing excision covers it. Add ONE
  matrix test: selector label/menu in the five states (draft/no plans, draft/plans,
  issued/no plans, issued/plans, previewing).

### A7. popMenu needs a scroll ceiling
- Where: `ui/board.ts:1243-1245` clamps `top` but has no max-height. A day at AL9 →
  ~14 rows ≈ 560px; on a phone the clamp goes negative, rows fall off-screen, no
  scroll.
- Fix: `.wavemenu{max-height:calc(100dvh - 24px);overflow-y:auto}` in scheduler.css.

### A8. Long plan names vs the bar
- Where: `MAX_DRAFT_NAME = 24` (`engine/drafts.ts:35`). A 24-char name in the 12px
  bold selector beside Templates/pending/ⓘ/Publish wraps the bar to three lines.
- Fix: selector label `max-width:150px;overflow:hidden;text-overflow:ellipsis`, full
  name in `title`. Don't change the engine limit.

## B. Product decision (owner)

### B1. Deleting down to one plan
- Where: `engine/drafts.ts:424-438` — "a list holding one entry is legal: deleting the
  others just leaves the selected plan as the only named one."
- Effect: once a day has ever had plans, the selector reads "Plan A" forever; the
  "no plans → Live working copy" state in the matrix never returns.
- Options: (a) when the list drops to one, clear `SCHED.drafts[di]` + `curDraft[di]`
  → back to "Live working copy" (matches the matrix; histApply round-trips fine);
  (b) accept "Plan A" as the permanent label. Recommend (a).

## C. Small, recommended

- C1. Lettering: mint `Plan ${String.fromCharCode(65+n)}` for n<26, else `Plan ${n+1}`;
  `nextNum` regex → `/^Plan ([A-Z])$/`. Renaming a plan then minting reuses the
  freed letter — fine, no collision (rename refuses duplicates).
- C2. Quarantined week (`protectedWeek()`): hide "+ Alt Plan", render plan rows inert.
  Today the engine refuses with a misleading "no longer available" toast.
- C3. Switch toast: append "· signatures reset" — Phase 3 invalidates all four on a
  plan switch, so "4 to sign" jumps and Publish AL locks; say why.
- C4. View page label `Working draft — not issued` (`html.ts:229`) → `Working copy`.
- C5. DraftsModal + toasts: "Draft" → "Plan"; tests `drafts.test.ts`, `draftsui.test.tsx`.

## Owner decisions (15 Sep 26) — BINDING for the build
- A1 keep the two-tap confirm: YES.
- A2 Back button: the green pill goes; "← Back to live" lives in the read-only bar on
  BOTH surfaces (week page gains it; board already has it).
- A3 hide Publish ALn under preview: YES.
- A4 switching semantics: EDIT side switches instantly (stow = auto-save, both plans
  are working copies, one is live). VIEW page shows the live plan and lets viewers
  preview the other — keep the 'd:' preview there. Confirmed by owner.
- A5 one builder for week page + board: YES.  A6 parity excision: YES.
- B1 delete-down-to-one: OPTION (a) — when one plan remains, clear the day's plans
  and return to "Live working copy".

## D. Confirmed fine — don't over-engineer
- Plan switch on a published day: `draftSelect` → `rebaseDayPending` (rid-based diff),
  one undo step, preview cleared (board.ts:1366-1368). Unchanged.
- "+ Alt Plan" on a day with pending edits: both plans carry the same marks
  (drafts.ts:92-95) — correct; toast says "a copy of the day as it stands".
- Tapping the current issued row → preview; Load with nd===0 → "already at AL4"
  (interactions.ts:852-856). Fine.
- "4 X 4" is the `dayCount` badge (html.ts:1102) — untouched.
- Phase 3 signBind, keep-ids, the view page's `data-vwork` picker — untouched.
