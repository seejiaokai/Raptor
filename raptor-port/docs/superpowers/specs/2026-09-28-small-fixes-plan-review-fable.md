# Fable — red team of the small-fixes batch plan (28 Sep 26), round 1

*Kept whole as delivered in the planning session (a subagent on Fable 5.1, read-only, blind to Astra's report). The plan it
read: `docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`; what was done with each finding: the plan's §9.*

Read: the brief, the plan, `scheduler.md` (rows D27–D346), `oil.md`, `leave-war.md`, `how-we-work.md`, the nine backlog items, bug-check-order §4–§6, and the code behind every part (floatwin/AvailWindow/ChangesWindow/SchedBoard, drag.ts + scheduler.css ring rules, oil.ts/oilev.ts/oilmode.ts/AvailWindow, toast.ts + publish.ts + sync.ts publishFlagsBids + unpublishDay, publish.ts currentBindNow/signBoundOk, canonical.ts, order.ts, reorder.ts, restore.ts, slots.ts accept/reconcile/unaccept, drafts.ts draftSelect/load, weekstash.ts, inputedit.tsx, html.ts accCtl + banner, interactions.ts handlers, board.ts switchDraft, pendlist.ts, the Leave War store's move doors, Chrome.tsx, chrome.css, the sheets' date prints, lift-css.test.ts). Nothing edited, nothing run that writes.

Severity scale: **High** = the plan as written would build a defect or a regression; **Medium** = a gap that leaves a promise unmet or a surface unwired; **Low** = wording/precision.

---

## Job 1 — findings, most severe first

### F1 · HIGH · Part E (3): the plan's re-file of a "taken off" request re-opens the round-trip D98's own comment warns about
**Evidence:** `slots.ts:637–656` (`reconcileDayFiling` — both directions: a `'g'` whose row went is `delete inp.acc` → `''`; a row that came back re-files `'g'` only from a falsy acc); `drafts.ts:605–609` (the D98 comment: *"done there [in the general reconcile], a plan switched away and back turned a deliberate removal into a fresh request that flags"*); `publish.ts:439–441` (`filingSame`: frozen `'r'` vs live `''`-present is a **delta**; only frozen-`'r'`-vs-absent is "same"); `engine/world.ts:54–60` (the published face reads an absent filing as `'r'`).
**Scenario:** Monday published. Request landed (`'g'`), plan "B" parked with the row. On the live copy the scheduler ✕'s the row → `'r'` (dormant, flags nothing — the 26 Aug rule). He switches to plan B → the plan's row comes back; the plan re-files `'r'→'g'` (fine so far). He switches back to the live copy (no row) → today's drop branch runs: `delete inp.acc` → `''`. Result: (a) the request FLAGS again on Monday's warning list and offers Accept though the scheduler deliberately took it off; (b) on the published Monday the frozen filing is `'r'`, the live one `''` → **1 pending ("taken off → not on the programme") from a plan round-trip that changed nothing**, and the four sign-offs fall (D103). Today's behaviour (`'r'` untouched both ways) has neither fault. So (3) trades a dead row for a phantom pending plus a silenced-then-reawakened request.
**Fix, step by step:**
1. Do NOT add a general `'r'→'g'` re-file to `reconcileDayFiling`.
2. Give a parked plan its own filing record, exactly as an issued version has `snap.fil`: in `drafts.ts draftSelect` (line 286, where the outgoing plan's `d`, `sign`, `signBind` are stowed) also stow `cur.fil = dayFilingFingerprint(di)` (the request filings covering that day); on switch-in, after `reconcileDayFiling(di)` (line 298), apply `filingRestorePlan(di, t.fil)` the way `loadVersionToWorkingCopy` does at 610–611 — only when `t.fil` exists (an older plan record without one keeps today's behaviour). "A plan is what you leave it as" (D175's reading) then covers its filings too, like its per-plan sign-offs (15 Sep 26).
3. The round trip becomes `'r'` → plan B (`'g'`, row) → live (`'r'`, no row): no phantom, still dormant. A plan carrying a row whose request was taken off since reads `'g'` while that plan is live — the card's Undo works, the row goes with a delete.
4. Tests: the round trip on a published day (frozen `'r'`) asserting 0 pending and the four still signed after switching back; the same on an unpublished day asserting the request stays dormant (`inputFlags` false); a plan record with no `fil` behaves as today. Add `fil` to `data-schema.md`'s draft record.
5. Keep the safe half of the item regardless: `dropInputRow` (`inputedit.tsx:1460–1466`) removes any ground row carrying the deleted id on the loaded week whatever the filing, so a delete never leaves a dead row.

### F2 · HIGH · Part C: the ALL AVAIL window's "no usable times" branch would contradict the new chip
**Evidence:** `AvailWindow.tsx:213–219` — `lost` fires when `lbl.s == null || lbl.e == null || lbl.e <= lbl.s` and REPLACES the puck list with "This row has no usable start and end times, so nobody can be worked out for it."; `:169–170` `crowdClashes(di, id, lbl.s, lbl.e, …)` reads the same `lbl.e`; `:311–316` the OIL-tab hint "Tap a puck to stop a man earning from this event."
**Scenario (if he says build):** ALL AVAIL on "DINNER WITH CMD 18:30" (no end). The chip now reads `9`; tap it → the window shows the "no usable times… nobody can be worked out" sentence and no pucks. Chip and window disagree — the exact disagreement Fable correction 2 exists to stop. On a weekend the OIL tab would read "Who earns OIL 0 of 9" with a hint inviting a tap to "stop a man earning" though nobody can earn.
**Fix:** (1) In `oilItemLabel`/the label read, when `s != null && e == null` return the assumed end (`win(s, null)` from `time.ts:25`) as `e`, with `when` = "18:30–19:30 · no end time, an hour assumed" and a flag `assumed:true`; (2) `lost`'s time clause tests the row's OWN `end` only when no start either; (3) `crowdClashes` receives the assumed `e`; (4) on the OIL tab, when `assumed`, the hint reads "No end time, so nobody can earn from this row — give it an end time to credit it" and rows draw inert (they already will — no figure); (5) a unit test: chip count === window list length for an open-ended row, both tabs.

### F3 · MEDIUM · Part C: the assumed length is not one number — sims have their own, and the plan must not mint a third reader
**Evidence:** `engine/rules.ts:27` `openEnd:60`; `ui/logic-html.ts:141` — a sim row with no end assumes `VCONF.simLen`, "its own number, not the general openEnd"; `time.ts:25–27` `win(st,en,openEnd?)`; `oil.ts:164–168` `w2` (null for any missing end, every kind).
**Fix:** record the crowd over the SAME window the validator and crew picker use — `win(st, null)` for ground/duty/Common Programme, and the sim reader's `simLen` for sim rows (follow `avail.ts:184`'s branch) — never a literal `start + openEnd`. State this in the plan and in the look card, and pin one test per row kind (ground, duty desk, sim seat, Common Programme).

### F4 · MEDIUM · Part C: where the crowd is recorded, and the "?" chip has no drawer and a taken meaning
**Evidence:** `oil.ts:278–283` a ground row with `gw == null` never reaches `putWho`/`expandAll` (nor `reach`); `oilev.ts:515` is the only `expandAll` writer of `sent[item]`; `oilmode.ts:971–972` (`'unrecorded'` → `{unrecorded:true}`, `'none'` → null → no chip); `html.ts:641` — `'?'` is ALREADY the chip text for `unrecorded` (an issued document written before membership was kept).
**Fix:** (1) Record the display crowd in `oilev.ts` by a second small pass over rows with a start and no end (same item keys: `groundItemKey`/`rowItemKey`), writing `sent[item]` only — leave `oil.ts dayOilWork` untouched so no money path changes and `reach` is never called for such a row (D31: no switch). (2) The "?" for a row with NO start: `oilSentinelSummary` must return a distinct state (`nostart:true`), and `html.ts:641`'s text/title must distinguish "issued before the count was kept" from "no start time — give it a time to count who can attend"; consider a different glyph for one of them. (3) Roll-call for the new chip: the edit week (`html.ts` puck chip), the board (`board-html.ts` → same builder? confirm), View-only Sched's issued face (a `'none'` entry on an issued snapshot — decide whether "?" shows on the issued face; recommend yes, it reads what the record says, and say so on the look card), the print (no chip — confirm). (4) Name to him: a later change to the Logic tab's assumed length moves the crowd behind every such row on every published day → reads pending (D48/D179 consistent, but new).

### F5 · MEDIUM · Part D1: "a zero-delay timer marks the turn" is the wrong trigger — under fake timers every toast in a test joins
**Evidence:** `toast.ts:21` (one element, `textContent` replaced); ~60 test files call `vi.useFakeTimers()` (grep); Vitest's fake timers fake `setTimeout` but NOT `queueMicrotask`/`Promise` microtasks by default; `pops.test.ts` reads `#toastEl`.
**Scenario:** any jsdom test with fake timers that raises two toasts in sequence (different turns in reality) sees them joined, because the marker timer never fires; conversely a real-browser toast raised from a `setTimeout(…,0)`-scheduled handler would be judged "same breath" wrongly.
**Fix:** mark the end of the breath with a microtask (`queueMicrotask` or `Promise.resolve().then(() => breath = null)`): every toast raised in the same synchronous run (the publish command body at `publish.ts:1101` and the gate's `publishFlagsBids` at `sync.ts:1200/1213`, the `tellOnce` PO lines at `sync.ts:1454`, an epilogue `toastFail` after an accept's "added" toast) joins; anything from a later event replaces. `clearToast()` (session reset) also drops the pending join buffer. Test both with real and fake timers.
**Sites this joins (each checked):** publish success + OIL gate (helps — the item); `tellOnce` postings (helps — one amber line instead of the last); accept "added" + a refused epilogue commit "Couldn't save that" (helps — both facts, contradictory but true); `switchDraft` already folds its tail into one string (unchanged). Found no site that relies on a same-breath REPLACE.

### F6 · MEDIUM · Part D1: the planned Unpublish sentence describes something the app does not do
**Evidence:** `publish.ts:1161–1199` `unpublishDay`: only the MOST RECENT version comes off; retracting ALn re-opens its marks as pending on the working copy and makes AL(n−1) the issued version (1181–1194); retracting the Original makes the day a plain draft (1177–1180). The button's own titles differ by state (`html.ts:1466–1467`): "Unpublish — pull ALn back to a working copy to correct it; republishing reissues the same version" and the armed "Withdraw — confirm … its OIL credits are bid against on the Leave War".
**Fix:** build the sentence from the withdrawn `verLabel(id)` and the new current: "Saturday: AL2 withdrawn — its changes are back on your working copy as pending; AL1 is the issued schedule; publishing again reissues AL2." / for the Original: "Saturday unpublished — it is a draft again; publishing reissues the Original." Raise it in the `data-unpub` handler (`interactions.ts:912`) after `isOk(commitUnpublish(di))`, not inside the command; when the armed Withdraw path ran, add "· its OIL credits are withdrawn from the Leave War until it is republished". Drop the plan's "the Original is back on the working copy" wording.

### F7 · MEDIUM · Part E (1a): two readers of "is this request's row on another week" would now exist
**Evidence:** `oilev.ts:341–398` `stashStanding` already scans stashed weeks for a claim row by `src`, with its own answers (`'unlanded'` / `'elsewhere'` incl. unreadable blobs); the plan's `srcOnStashedWeek` is a second body for the same question — the drift seam CLAUDE.md names.
**Fix:** make `srcOnStashedWeek(id)` THE body (in `engine/weekstash.ts` or `inputs.ts`, engine-side), returning `{ week, iso } | 'unreadable' | null`, and have `stashStanding` call it. Skip the loaded week's own stale entry in both (1b). **Fail closed on an unreadable stash:** `acceptInput`'s guard REFUSES with "can't tell whether this request already has a row on the week of … — load that week first" (never a second row when the answer is unknown — `weekstash.ts:170–174 stashWeekState`); the plan is silent on this.

### F8 · MEDIUM · Part G3 (1): "change the leave on the Inputs page" is only right for one of three holders
**Evidence:** `Chrome.tsx:545–549` — the `duty` clash line says the day "holds {bidCode}"; the holder can be a war BID (the sheet CAN decide it), war-approved leave (the sheet can send it back / delete it), or Inputs-filed leave (only the Inputs page).
**Fix:** branch the way out on the holder's provenance (the record's `lw` / kind, the same test `absenceMovable` uses at `store.ts:4156–4161`): bid → "— decide the bid on the sheet"; war-approved leave → "— send it back or delete it on the sheet"; Inputs-filed → "— change the leave on the Inputs page". Pin one test per holder.

### F9 · MEDIUM · Part D9: `gord` must not stay positional, and the "binds exactly as before" claim is not true
**Evidence:** `publish.ts:1244` `gord = groundOrder(...).map(x => x.ri)` (positions); `:1281` compared as a string; `reorder.ts:428–436` `sortGround` permutes the array → positions change → `gord` changes even when the shown order is identical. `canonical.ts:97–102 digest` keys by position (`restore.ts dayKeys` `g:di.ri`).
**Fix:** (1) digest a copy of the day whose `ground` is in `groundOrder(d.ground, d.gman)` order (as planned) — this alone binds content AND shown order (a row moving in the shown order moves its content to another key); (2) retire `gord` to `''` (a positional or rid list adds nothing and a rid list falls when an id-less row is minted — the comment at 1242–1243 warns of exactly that); (3) reword the plan: stored bindings (demo data) re-sign once — D56, not a finding, but say it; (4) tests as planned plus: a `gman` day already in time order → Sort (clears `gman`, marks row 0 — `reorder.ts:432`) → four hold, 0 pending; two rows with the same start → Sort → hold (`keySort` and `groundOrder` both break ties by index — consistent).

### F10 · MEDIUM · Part A: the next-animation-frame re-place paints one wrong frame and is not the exact trigger
**Evidence:** `SchedBoard.tsx:197–284` writes the bar in a PASSIVE effect; `floatwin.ts:72` places in a LAYOUT effect; `App.tsx:50` mounts `<SchedBoard />` BEFORE `<AvailWindow /><ChangesWindow />`.
**Why it matters:** with rAF the window is painted over the bar, then jumps — a flicker on every preview start; and a rect read on every render while open.
**Fix:** add a passive `useEffect(place)` (same deps) to `useFloatWin` beside the layout one — React runs siblings' passive effects in tree order, so it runs after the board has written the bar, before paint; pin the ordering with a comment at `App.tsx:50` and a jsdom test (mount order changed → test red). Keep the layout effect for the no-flicker first paint. Drop the rAF (or keep it only as a belt with a picture proving no flicker).

### F11 · MEDIUM · Part A: two surfaces are missing from the roll-call — View-only Sched and both windows together
**Evidence:** `scheduler.css:600` — the View-only `.week` is full width (no palette); the ALL AVAIL window opens for anyone from the chip (`AvailWindow.tsx:101–105`) and the changes window from the day count on View-only (`ChangesWindow.tsx:155–158`); `html.ts:1541–1542` the "Viewing Working draft" bar and the day head's picker sit at the top of every day. Both windows share `right:16px; top:96px` (`scheduler.css:6304, 6409`) so with both open they stack exactly.
**Fix:** (1) walk View-only at 1440: the window covers the right ~212px (avail) / ~380px (changes) of any day scrolled to the right edge — its day-head picker and the working-draft bar's tail. Pre-existing, not this item — record it and put "dock the windows clear of the week head on View-only, or leave" on the look card. (2) Two windows: say in the plan that the clearance moves both to the same top (DP-10 raise-to-front still applies) — no change, but the roll-call row must exist.

### F12 · LOW · Part B: two ring states are missing from the test list, the caption gets a second shadow, and the perf reasoning is wrong (the measurement is right)
**Evidence:** `scheduler.css:1391` `.puck.hl` (the highlight strip's ring + glow — a highlighted puck is draggable); `:1198–1202` `.puck.san::after` (own glow, a pseudo the veil already out-ranks at z 5); `:1292–1295` `.dwhy` is a CHILD of the ghost — a `filter: drop-shadow` on the ghost shadows the caption too, on top of its own `0 2px 8px`; `performance.md:224` bans `filter` on the palette's many pucks. A composited `filter` is applied by the compositor each frame it draws the layer, not "painted once" — for one 74×15 element that is cheap, but the plan's sentence is wrong.
**Fix:** add `hl` (and `san` as a non-ring control) to the `lift-css.test.ts` matrix; take a picture of a dragged puck with its hover reason showing and accept or scope the shadow; correct the perf sentence and keep the before/after drag timing probe as the gate; update `lift-css.test.ts:324`'s GHOSTS table (`.ic-ghost` keeps the box-shadow depth — say why the calendar ghost is left, or move it too).

### F13 · LOW · Part F1: calling `switchDraft` from the banner brings back the misleading "no longer available" on a locked week
**Evidence:** `interactions.ts:965` returns early on `protectedWeek()` precisely to keep that toast off a frozen button (P2-REV2-02); `board.ts:1513–1522` `switchDraft` returns `false` for a gone plan AND a protected week alike.
**Fix:** keep the `protectedWeek()` early return and the `canEditSched()`/page gate in the banner handler before `switchDraft`; only then map `false` to "That plan is no longer available".

### F14 · LOW · Part G1: two raw dates the mapping missed, and toasts are outside the planned roll-call test
**Evidence:** `sync.ts:329` "… is on a locked week — not approved" and `:334` "already holds leave or a medical at that time — not approved" print `${it.date}` (the approve door); the planned test renders SHEETS and asserts no `\d{4}-\d{2}-\d{2}`, which never sees a `why` line or a toast.
**Fix:** add both lines; add a unit test that drives each door's refusal (`doorApprove`, `doorDecideApproved`, `doorRemoveApproved`) and asserts the `why` strings carry no ISO date.

### F15 · LOW · Part E (1a/E5): the "left out" sentence has no shape for another week
**Evidence:** `drafts.ts:83–103` `ROWSLEFT.days` are loaded-week day names; `rowsLeftSaid` says "it is on Tuesday's programme".
**Fix:** carry `{ dow, iso, week }` per left-out row and word a cross-week one "it is on Sun 19 Jul's programme (week of 13 Jul)"; the same shape feeds the accept refusal at `interactions.ts:618` ("already on the programme — on the week of 13 Jul") and the card (F2).

### F16 · LOW · Part D4: the phone AL-tag override must miss the area strip and clear the digits
**Evidence:** `scheduler.css:1763` makes the tag static ONLY inside `.form-area` because those halves are one line tall; `:1758–1760` the absolute badge sits at `top:0; right:1px` INSIDE the cell — on a 36px time cell it overlays the last digit.
**Fix:** scope the phone override to the flying line's `.timecell` (not `.areacell`), and place it like the seat badge (`top:-5px; right:-3px`, outside the box) so no digit is covered; measure at 390 and 360; the tag's box inside the screen (`scrollWidth ≤ clientWidth`).

### F17 · LOW · Part E: the published-day consequence must be named on the look card
Once the reconcile reads the stash, a request's filing is one stable value across weeks (a fix for the P2-REV2-05 phantom); a day published while the loaded-week derivation said `''` now reads `'g'` → 1 pending ONCE (D56: stored data, the code right going forward). Say so beside the D174/D176/D98 tests rather than letting the walker "find" it.

---

## Job 2 — walk scenarios (the running app; set up through the app's own controls; both orders; phone + desktop; after publishing)

**★ = walk first.** Fixture: the everything-week; a second week (wk2) visited once so it has a stash.

### A — the floating windows
1. ★ Board, Saturday (published) → plans menu → Original → tap the ALL AVAIL count. Expect: the window's top sits below the preview bar; "← Back to live copy" and "Load onto working copy" both hit-reachable. Wrong if either button is under the window. Then: tap "Load onto working copy" (armed, taller bar with "Keep editing") → the window re-sits below the taller bar. Then "Keep editing" → window back to just under the short bar. Then "← Back to live copy" → window at its stylesheet place (top 96). Repeat with the History (changes) window instead, and with BOTH open.
2. Reverse order: open the window first on the live board, then start the preview → window moves clear the same frame (no flicker on the picture).
3. Drag the window elsewhere, then start a preview → it does NOT move. Tap (not drag) its bar → it re-sits below the bar. Resize it by its corner while cleared → the box is remembered at the cleared spot; a later preview end does not move it.
4. 1440×700: with the bar shown, the window's bottom is on screen (no cut ✕ / footer). Browser narrowed then widened: still clear.
5. Phone (390): the bottom panel; the bar at the top of the board — untouched.
6. View-only Sched at 1440 (member and admin): open the ALL AVAIL window from a chip, scroll the third day to the right edge — record what is covered (day-head picker, working-draft bar). Not this item; the look card.
7. Edit week at 1440 and 1280: preview a day → the window over the palette column only (pictures).

### B — the dragged puck
8. Drag one puck of each state: plain, amber advisory, thin red, grey note, solid red box, dashed (a sanctioned late show), dotted (tomorrow's cause), a highlighted (`hl`) puck, your own purple puck (unflagged) and your own flagged puck, a SANS puck, a puck lit by a clicked warning. Expect on every ghost: its own ring intact, the cyan veil, AND the dark lifted shadow. Wrong if any ghost reads flat.
9. Mouse (desktop) and finger (phone) ghosts alike; hold over a busy cell so the hover reason shows — picture the caption's shadow.
10. Drag inside OIL Earn mode → refused with the reason (unchanged).

### C — the open-ended row (only on his yes)
11. Put ALL AVAIL on DINNER WITH CMD (18:30, no end) on a weekday → chip shows a count; tap → the window lists the men with "18:30–19:30 · no end time, an hour assumed". Wrong if the window says "no usable start and end times".
12. Same on the published Saturday: weekend → OIL tab "0 of N earn", each man inert with the reason; the day's warning list and the publish toast still say the row has no usable times (D81). Publish → the crowd frozen; take one man on leave for 18:30 → the day reads 1 pending; put the leave back → 0.
13. A row with NO start → "?" chip → tap → the existing sentence. A sim row with no end → the sim's own assumed length in the header.
14. Change the Logic tab's assumed length → every published day carrying such a row reads pending (name it, expected).

### D1 — the toast
15. ★ Publish the Saturday that raises the OIL warning (no war period, or a bid on published work). Expect ONE amber toast: "Published AL1 · N items on Sat only · there is no leave war period…". Wrong if only one half shows. Then two separate actions a second apart → the second replaces.
16. Unpublish AL1 → the sentence names AL1 withdrawn and what is issued now; Unpublish the Original → "draft again". The armed Withdraw path → the OIL-credits line too.

### D9 — the signature
17. ★ Published Monday; hand-drag two ground rows (sets hand order), then Sort (clears it) so the rows are STORED out of time order but SHOWN in time order — sign all four — press Sort. Expect: four still signed, "no changes to publish", 0 pending. Wrong if any sign-off blanks.
18. Then drag a row (a real reorder) → four fall, "1 reorder" pending; drag it back → four return, 0 pending. Change a row's start time so it re-sorts → four fall.
19. Both orders: Sort first then sign; sign first then Sort. Desktop board and edit week.

### E — requests across a week boundary
20. ★ On the Inputs page file a Meeting for Ranger Sun 19 Jul – Mon 20 Jul (wk1/wk2). On wk1 accept it on Sunday. Load wk2 → Monday's card must NOT offer Accept (or Accept is refused: "already on the programme — on the week of 13 Jul") and NO second row appears. Card reads its row is on the other week; Undo there refused with "load that week". Publish Monday → 0 pending for that request; reload the browser → still 0.
21. Reverse order: on wk2 accept on Monday first, then wk1 Sunday refuses.
22. Delete the request from the Inputs page while wk2 is loaded → refused: "Load the week of Sun 19 Jul to delete…". Load wk1 → delete → the row goes.
23. Stale scan: land a request on wk1, leave to wk2, come back, ✕ its row (taken off), delete it on the Inputs page → allowed (no "load the week of THIS week").
24. Plan round trip (F1): published Monday, request landed, park plan B with the row, ✕ the row on live (`'r'`), switch to B → row back, card offers Undo, 1 pending; switch back to live → 0 pending, four signed, request dormant (flags nothing). Then delete the request while B is live → its row goes.
25. Load an older version whose row a request now standing on another WEEK held → row left out, the sentence names that week.

### F — words on the doors
26. Draft preview banner "Switch to this plan" on the board and the edit week → ONE sentence with the pending tail; on a locked week the button is inert (no "no longer available").
27. A two-day request accepted on Tuesday: Monday's card reads "Undo · Tue" with the day in its title; press it → the toast names Tuesday.
28. Published day: file "Other" → Unavail, publish, delete it on the Inputs page → the pending line reads "Ranger · Meeting · under Unavailable → deleted" on the board, the edit week and the changes window's To go out.

### G — the Leave War and the absence leftovers
29. Open every listed sheet (bid sheet header and its "moved from", OIL credited / Leave from Raptor, Your OIL award, Posted out, Posted in + notes, one-day selection header, the move refusal banner, the PO tag hover, the remarks editor, the absence door's refusals via approve/decide/remove) — no `2026-07-17` anywhere; one-day headers "Fri 17 Jul"; in-sentence dates "17 Jul 26"; the input window title "Tally · 24 Jul".
30. After G2: a chain of two moves at CLOSED keeps the ORIGINAL origin in the dotted mark; a move onto a locked week refused, nothing moved; a bid beneath an award moves alone.
31. Clash strip at 390 and desktop: a bid clash → "resolve on the sheet" and the sheet has the control; an Inputs-filed leave against earned OIL → "change the leave on the Inputs page"; war-approved leave → its own way out. "VIEWING AS RANGER" at 390 and 360 fully readable (name may shorten, the words never cut).
32. A member opens another man's input → fields read locked (muted, no focus box); Close only.
33. Phone, member, two rows: the leave over the frozen balance column (repeat the probe; record).

---

## Explicit negatives — checked and found sound
- **Part B's premise:** the lift compound at `scheduler.css:4249` carries the depth shadow in `box-shadow`; `.boxred`/`.boxdash`/`.me` are `!important`, `.warn.hard/.note` (0,3,0) out-specify it, and the veil (`:4291`) already owns the accent ring — the diagnosis is right. A `filter` output is not clipped by the element's own `overflow:hidden` — right. OIL mode refuses a drag (`drag.ts:203`) — right. The palette's `.rpuck.busy .puck` inset shadows never reach a detached clone — no ring missed there.
- **Part D9's premise:** only the ground programme is rendered in a different order from storage (`html.ts:1862`, `board-html.ts:586`, `peek.ts:206` via `groundOrder`); duty blocks and the Common Programme render in stored order, so their Sort is a real change and the sign-offs falling there is right. `keySort` and `groundOrder` break ties identically. `canonical.ts:243` already compares the ground order as shown, so count and signature will agree once the digest does.
- **Part D1's premise:** `publish.ts:1101` and `sync.ts:1200/1213` speak in one synchronous command; the toast is one element whose text is replaced (`toast.ts:21`). The join helps every same-breath site I could find.
- **Part E (1a) does not silence the request on the loaded week:** `events.ts:54–59, 69–71` — a timed `'g'` request with no row on any loaded day still speaks on the days it covers (`acceptedDay` < 0 → shown), on the official run too. `person-delete.ts:253, 277` sweeps stashed rows itself. `inputDormant`/the war's day view read no filing that changes here.
- **Part E (1b):** the loaded week's stash entry IS stale (written only on the way out — `weekstash.ts:1–13`); skipping it is right.
- **Part G2:** `shiftBid` and `moveAbsenceById` have no production caller (only `shiftBid → moveCells` inside `store.ts`); `moveRecords` keeps the ORIGINAL origin (`store.ts:4297`, same expression as `shiftBid:4067`), so the chain test will pass on today's door.
- **Part A's ResizeObserver "his box" test** (`floatwin.ts:86`) is unaffected by an inline `top`/`max-height` — only width/height count — right; the browser's own corner resize writes inline width/height, so a resize while cleared is correctly remembered as his.
- **Part F3:** `snap.inp` exists on published days since `[LEAVE-LATE-PUBLISHED]` and `inputWords` (`pendlist.ts:165`) already names from it; extending `requestWords` (`:104–109`) is the right seam.
- **The tier:** FULL is right (money via C, the published record via D9/E/D1, saved data via E).
- **D56:** every stored-data consequence I found (old bindings re-signing once, an old published day reading 1 pending once after the stash-aware reconcile, a pre-membership snapshot's "?") is data already stored with the code right going forward — listed above only so the walker does not file them.
