# The amendment behaviour register — every rule the amendment system must obey (24 Sep 26)

**Why this exists.** The first job of `[HUMAN-RETEST]` for the amendment system (D85/D86, D147): gather
every amendment rule he has settled — in the rulings files, the memory notes, the design records and the
backlog — into ONE list, so the walk tests against it and nothing already settled is put to him again
(his words, 24 Sep 26: *"I don't want to repeat myself"*). It is the bug-check order's rules sweep
(`raptor-port/docs/bug-check-order.md` §3, §5) for this feature, in the shape of the OIL register
(`2026-09-21-oil-behaviour-register.md`).

**How clashes are settled — D90 (24 Sep 26, re-confirming his 17 Sep 26 rule).** Where two of his rules
conflict, the LATER one wins. Every clash is named below (§Z): the rule followed, the rule set aside, both
dates. Where the later rule does not clearly cover the case, it is a gap, listed in §Q as a question for him
— not guessed.

**How to read a line.** `id` · the rule in plain words · when he said it and where it is written · its
status: **LIVE** (in force and built) · **LIVE — NOT BUILT** (in force, no code yet) · **PARTLY BUILT** ·
**DEFERRED** (designed, parked, not built) · **SET ASIDE by …** (a later ruling replaced it — kept so nobody
re-derives it). Wording a person sees on screen is quoted as the app shows it.

**Sources swept** (all read in full on 24 Sep 26): `.claude/rules/decisions/` (scheduler.md, oil.md,
how-we-work.md), `DECISIONS-ARCHIVE.md` (no amendment rows); the memory notes `amendment-per-day-isolated`,
`published-day-input-is-pending-amendment`, `amendment-plan-activation-is-plain-edit`,
`plans-selector-redesign-locked`, `undo-of-publish-semantics`, `future-undo-semantics-multiuser`,
`oil-truth-latest-published-version`, `newest-instruction-wins`; the design records
`2026-09-11-amendment-model-decisions.md`, `2026-09-12-amendment-core-build-brief.md` (Rev 5),
`2026-09-12-amendment-core-build-plan.md`, `2026-09-15-plans-selector-redteam.md` (its binding owner
decisions), `plans-selector-followups.md`; `raptor-port/docs/engine-rules.md` §Publishing / amendments,
§Version snapshots, §Drafts, §Auth / roles, §History, §The edit log; `raptor-port/docs/ui-contracts.md`
§Amendment marks on screen, §Version preview, §The day-head version chip; `raptor-port/docs/undo-contract.md`
§4; `OUTSTANDING.md` `[AMEND]`, `[EOD]`, `[HUMAN-RETEST]`, `[CRP-FLAG]`, `[FLAG-EXPORT]`, `[PUB-UNAVAIL]`,
`[GLOBAL-UNDO]`. Three read-only sweeps of the older records (the other amendment specs, the undo designs,
the archives) are folded in below where they added a rule — each line names its own source.

---

## A. The model — what a published day is

| id | the rule | when · where | status |
|---|---|---|---|
| AM1 | **The DAY is the unit.** Each day is published, amended and numbered on its own: Monday goes Original → AL1 → AL2 on its own track, Tuesday on its own. A change touching two days is two separate amendments, one per day. There is no week-wide AL and no one AL covering several days. *"I am for sure having each day as an isolated amendment. Never the week. So this is going to be fixed."* | 11 Sep 26 · memory `amendment-per-day-isolated`; decisions §1 | LIVE — do not reopen · **and (D175, 25 Sep 26)** a load or a plan switch of one day never puts a request on a second day's programme: it leaves that row out and says so (`publish.ts rowsLeftOut`; `src/ui/reqonerow.test.tsx`) |
| AM2 | **A day is a stack:** its issued versions (Original, AL1, AL2 …) frozen underneath, one live working copy on top. The AL number is how many times THAT day has been published since the Original. | 11–12 Sep 26 · decisions §1; brief §2 | LIVE |
| AM3 | **Each issued version keeps its own identity, tied to its date and year** — Monday's AL1 and Tuesday's AL1 are different records; "AL1" is only the label. | 12 Sep 26 · brief §5 AM-01 | LIVE |
| AM4 | **An issued version is never edited in place and never erased.** What went out stays exactly as it went out. Every issuance is kept as its own snapshot, forever — including one later pulled back by Unpublish (AM32). | 11 Sep 26, kept by 18 Sep 26 · decisions §1; memory `undo-of-publish-semantics` | LIVE |
| AM5 | **Viewers see the current issued version; the working copy is the scheduler's until he publishes.** A viewer can choose to look at the working copy, but it is labelled so it can never be taken for the issued schedule ("Working draft — not issued"). *"the user can choose to see the published version, which doesn't change if there's edit from the scheduler … but it needs to state clearly what they are viewing."* | 15 Aug 26 (the view page's two entries); 12 Sep 26 (crew may see the draft, badged, the issued version stays the authority) · `ui/html.ts` `viewVerSelHTML`; ui-contracts §Day templates and Drafts; brief §2 | LIVE |
| AM6 | **To go back to an older version's content, load it onto the working copy and publish it as the NEXT amendment.** Viewers keep seeing the current issued version until that amendment goes out. *"the view only schedule should still see AL1, it shouldn't go to Original without me publishing the working copy."* "Load onto working copy" discards unpublished edits only after a second confirming tap. | 16 Aug 26; 11 Sep 26 §10; the two-tap confirm 15 Sep 26 (A1) · engine-rules §Version snapshots; ui-contracts §Version preview | LIVE · **CHANGED 25 Sep 26 (D98):** the load also puts back what that version had FILED (a request taken off since goes back on), so the day reads exactly as the version — never moving another day (a request covering another published day, or with its row on another day, is left as filed and the load says so). Built: `publish.ts filingRestorePlan`, `drafts.ts loadVersionToWorkingCopy` |
| AM7 | **No "publish all days"; no two-person approval; no rule versioning.** | 7 Aug 26 · `raptor-port/CLAUDE.md` §Product invariants | LIVE |

## B. Publishing and signing

| id | the rule | when · where | status |
|---|---|---|---|
| AM8 | **First publish is "Publish day"** — the day goes out AS IT STANDS as its Original; everything typed while it was a draft is the build, not an amendment, so the Original carries no amendment marks. | Aug 26; kept through Phase 2 · engine-rules §Publishing | LIVE |
| AM9 | **After that, a change goes out as "Publish AL<n>" for that day only**, offered only when the day really differs from its issued version, never for a day with nothing to publish. | Aug 26; 12 Sep 26 (per-day) · engine-rules §Publishing; `html.ts` `dayStatHTML` | LIVE |
| AM10 | **All four sign-offs (CUR CK, SKED CK, PLANNED BY, APPROVED BY) sign every publish — the Original and every amendment**, bound to the content they signed. The sign-off look is unchanged. | 12 Sep 26 (#3) · decisions §4; brief §2 AM-06 | LIVE |
| AM11 | **A content change wipes the sign-offs back to empty; putting the content back restores them.** *"a change needs to be signed off … the sign offs will be removed and back to default cleared."* | 15 Sep 26 (R1) · `engine/publish.ts` `signShown` | LIVE |
| AM12 | **Each plan carries its own sign-offs.** Signing Plan B then switching to Plan A shows Plan A unsigned. | 15 Sep 26 (follow-up 1, taken the per-plan way) · `plans-selector-followups.md` item 1 | LIVE |
| AM13 | **A change in who was available never invalidates a signature.** He signs the published schedule; a later availability change shows as pending and nothing more; every day behaves the same. | 22 Sep 26 · **D45** | LIVE · **SET ASIDE 25 Sep 26 by D103** ("any change on a published day wipes the sign-offs"): anything that shows as pending on a published day — a change in who is behind ALL / ALL AVAIL included — takes the four down; putting it back restores them (AM11). D45's freeze half (AM42) stands. Built: `publish.ts currentBind` (the `pd` axis) |
| AM14 | **A filing-only change (an input accepted onto the day, or filed under Unavailable) must be signed for too** — it clears the sign-offs like a content change and cannot publish on signatures given before it; putting it back restores them. His answer to Codex PSF-001: *"close it now"*. | 15 Sep 26 · `plans-selector-followups-plan.md` (PSF-001); `engine/publish.ts` `filingKey` | LIVE (the `[AMEND]` line calling it open was stale — corrected here) · see §Q3 for its overlap with D45 |
| AM15 | **The sign-off line says what publishing will do:** on a draft day "Signed — this day can be published"; on a published day it names the issued version and whether there are changes to publish ("no changes to publish" when there are none). **The publish button stays HIDDEN when there is nothing to publish.** | 15 Sep 26 (follow-up 7) · `plans-selector-followups.md` item 7; `plans-selector-followups-plan.md` | LIVE |
| AM15b | **Finishing the four sign-offs on a published day with nothing to publish pops a short note: "All signed — no changes to publish right now."** The principle that came with it: wherever correct behaviour could read as a bug because it is silent, the app says so. | 15 Sep 26 (R2) · `plans-selector-followups-plan.md` | LIVE |
| AM16 | **Only an appointed scheduler can sign SKED CK, PLANNED BY and APPROVED BY**; a name already signed stays offered even if the appointment is later withdrawn, so a signature never blanks itself on an appointment change. | Aug 26 · `engine/publish.ts` `SIGN_ROLES`, `signPeople` | LIVE |
| AM17 | **Only the scheduler (admin) publishes, signs, unpublishes, loads a version or switches plans; a member reads.** A member files his own inputs, but accepting one into the issued programme is the scheduler's. | 5 Aug 26 table; 18 Sep 26 (unpublish: scheduler/admin only) · engine-rules §Auth / roles | LIVE |

## C. What the day shows — marks, counts, tags

| id | the rule | when · where | status |
|---|---|---|---|
| AM18 | **Amendment marks are a published-day thing — a draft day shows none.** *"if I have not published the schedule yet, don't show all the orange dotted lines … only once published does an AL-coloured mark make sense."* The edit is still counted. | 25 Aug 26 · ui-contracts §Amendment marks; scheduler.md §Settled (Board behaviour) | LIVE |
| AM19 | **On the edit surfaces a pending change is DOTTED in the colour of the AL it will go out as; an issued change is SOLID in its AL's colour.** The view page keeps a neutral dashed hint for a published day's pending edit. **By ruling, a man taken off a seat carries no mark on the row (D91, 24 Sep 26)** — counted and listed, not drawn. | Aug 26 · ui-contracts §Amendment marks; D91 | LIVE · **CHANGED 24–25 Sep 26 (D92, D93) for PUCKS:** a changed puck gets a TAG, never a ring — a solid ALn tag once out, a HOLLOW dotted ALn tag while waiting, on the edit week, the board AND View-only Sched's working-draft face (the neutral dashed seat hint is gone); a puck's edge carries only its warnings. Times, areas, remarks and other text keep the marks above. Built 25 Sep 26 (`scheduler.css`) |
| AM20 | **A pending mark means "differs from what was issued", not "was touched".** Change a time and change it back, or swap two pucks and swap them back — the mark clears, in every spelling (08:00 = 0800). *"swap the pucks and swap it back… it shouldn't register."* | 16 Aug 26 · ui-contracts §The day-head version chip | LIVE · **APPLIED 25 Sep 26 (D174):** a request filed since the day was published and then taken off is no difference — the day reads 0 and the four sign-offs hold (`publish.ts filingSame`; `src/ui/reqonerow.test.tsx`); **and (D176)** one taken off when the day was published and since deleted or re-dated off the day, the same |
| AM21 | **A removal and a reorder on a published day are real amendment items**, listed as removals / reorders; a row added and removed again before the next AL is no change at all. *"fix it" … "a move always counts"* | 12 Aug 26; 31 Aug 26 (reorders) · engine-rules §Publishing | LIVE |
| AM21b | **What rides an amendment and what does not:** dragging a WAVE is an amendment; dragging a SECTION or rearranging the crew panels only changes the display. Flipping a line's MAIN / SPARE badge marks it pending and rides the next AL. An accepted input's new ground row is pending and reaches the next AL. The admin's default wave order applies only when a wave is added to a day not yet signed off — it never reorders an existing or published day. | 24 Aug, 29–31 Aug 26; 15 Aug 26 (inputs) · scheduler.md §Settled; engine-rules §Accepting a personal input | LIVE |
| AM22 | **The version tag beside the day:** grey ORIG, AL<n> coloured by its number (AL1 cyan, AL2 amber, AL3 green, AL4 white, AL5 purple, AL6 pink, AL7 orange), a dashed DRAFT before first publish; it sits just left of the "4 X 4" count and shows on the view page too. The old "✓ Published · ALn" stamp and the week's amber AL roll are gone. | 15 Sep 26 (follow-ups 2–5) · `plans-selector-followups.md`; `html.ts` `verTagHTML` | LIVE · **CHANGED 25 Sep 26 (D108 → D110 → D111):** ORIG is the SEAL, "A1" — a faint white wash, a thin light outline and a drawn tick in a white disc; no colour. Built (`html.ts verChipHTML`, `.verchip.orig`) |
| AM23 | **"N pending" counts real differences from the issued version**, and it agrees with the "Discard N edits" count and the Amendments panel. | 15 Sep 26 (A3 note) · `html.ts` `dayStatHTML` | LIVE · **REFINED 25 Sep 26 (D109):** the unit a difference is counted in — a man (or a placeholder) moved from one place to another of the same day is ONE, a swap two, a man only taken off or only added one, a crowd re-ordered one, a man taken off WHILE the rest are re-ordered two (Astra's code read, 25 Sep 26 — it read one); every count reads one body (`publish.ts dayPendingItems`, `canonical.ts canonicalUnits`), the stored AL diff unchanged. **SETTLED by him (D113):** a replacement in one seat (A → B, neither moved elsewhere) counts one; **and (D114)** a request's row and its filing are one change (✕ on its row, or Accept onto a published day) |
| AM24 | **"Not yet signed" shows on the working copy of a published day that has unpublished changes — never on the issued face.** The published schedule stays TRUE until the next publish. | 16 Sep 26 · memory `published-day-input-is-pending-amendment`; `html.ts` | LIVE · **WORDING CHANGED 25 Sep 26 (D97):** two states — "Not yet signed" while any of the four is missing or no longer valid, "Not yet published" once all four are valid. Built (`html.ts nysMarkHTML`) |
| AM25 | **The Amendments panel** lists each published day with changes to publish, what kind (changes, removals, reorders, input filings, "what this day earns changed") and its own Publish AL<n> button — locked until signed and while previewing an old version; below it, every issued amendment with its day and who approved it. | Phase 2 (12 Sep 26); OIL wording 22 Sep 26 · `ui/ALPanel.tsx` | LIVE |

## C2. The amendment batch — new lines (25 Sep 26, built overnight under D112)

| id | the rule | when · where | status |
|---|---|---|---|
| AM53 | **"N pending ▾" opens the list of what will go out as the day's next AL** — where, before → after, who and when; the NET difference (a change put back is not on it); a long list scrolls inside the window; a tap on a change takes the view to it and marks it for a moment; when the crowds behind several placeholders changed, the one change lists each row on its own line, each its own tap (Astra's code read, 25 Sep 26). On the edit week and the board of a published day's working copy, never the view page, a preview or a draft day. | 25 Sep 26 · **D99, D100** · `ui/pendlist.ts` | LIVE |
| AM54 | **Who made a change is the shared account ("Admin" / the member account) until the database brings personal accounts**; a change the page's edit record does not hold reads "earlier"; a change with no single cell (a removal, a reorder, a filing, what the day earns) names nobody. | 25 Sep 26 · **D104** · `ui/pendlist.ts` | LIVE |
| AM55 | **The change bubble stays — hover on a desktop, tap on a phone — and a long one scrolls inside itself.** | 25 Sep 26 · **D105** · `ui/histbubble.ts` | LIVE |
| AM56 | **One "take me to this change" for Edit history and the pending list, landing on the page you are on:** on the board, the board's jump with the bubble pinned; on Edit Schedule, the change on the week, marked — it never opens the board; a change a surface does not draw says so. | 25 Sep 26 · **D107** · `ui/interactions.ts jumpToChange` | LIVE |
| AM57 | **The "Signed ALn" line names who signed the version on screen** — the Original included (its four are now kept) — under the day head on View-only Sched and the edit week, heading the board's sign strip; roles on a desktop, names only on a phone; never the live sign-off boxes. | 25 Sep 26 · **D95, D102** · `ui/html.ts signedLineHTML`, `engine/publish.ts verSigners` | LIVE |
| AM58 | **A day template is refused on a published day**, with the reason at every door (the picker draws them disabled); a draft day takes one as before. | 25 Sep 26 · **D96** · `engine/daytpl.ts`, `ui/board.ts dayTplMenu` | LIVE |
| AM59 | **The board draws the dashed (a sanctioned late show) and dotted (the day that causes tomorrow's crew-rest breach) rings, with their captions, as the edit week does.** | 25 Sep 26 · **D94** · `ui/html.ts puckMarks` | LIVE |

## D. Plans — saved alternatives for a day

| id | the rule | when · where | status |
|---|---|---|---|
| AM26 | **A day can hold alternative plans, before AND after it is published** — the squadron keeps ready-made contingencies. *"change to draft 1 to publish as AL1 but make some edits prior."* | 15 Aug 26; 12 Sep 26 (#1: plans survive publishing) · engine-rules §Drafts; decisions §4 | LIVE |
| AM27 | **Bringing out a saved plan is plain editing:** the changed items show as ordinary amendment marks; sign; publish as the next AL; the old version stays frozen. **No keep/revert review screen, no three-way comparison, no stale-plan confirm.** | 14–15 Sep 26 · memory `amendment-plan-activation-is-plain-edit` | LIVE — do not rebuild the review screen |
| AM28 | **The plans selector (LOCKED):** one white button per day whose label is what you are looking at — "Live working copy", the plan's name, or amber "👁 AL2" while looking at an issued version; its menu lists the editable plans (a tap switches instantly), then "Issued · read-only" versions (a tap only looks), then "+ Alt Plan" at the bottom. "← Back to live copy" lives in the read-only bar on both the week and the board. Publish AL is hidden while looking at an issued version. | 15 Sep 26 · memory `plans-selector-redesign-locked`; redteam spec owner decisions A1–A6 | LIVE — do not reopen the design |
| AM29 | **Plans are lettered A, B, C … and can be renamed** (a free label, no duplicates within the day); **deleting down to one plan clears the day's plans back to "Live working copy".** | 12 Sep 26 (names); 15 Sep 26 (C1 lettering, B1 option a) · redteam spec; `engine/drafts.ts` | LIVE |
| AM30 | **A stored plan being looked at never wears the issued schedule's clothes** — no published stamp, no AL tag on it. *"when I toggle to draft 1, it shouldn't say published."* | 15 Aug 26 · ui-contracts §Version preview | LIVE |
| AM31 | **The view page:** on an UNPUBLISHED day a viewer can look at the day's plans (read-only, never switch); once the day is published the viewer gets only "<version> — as issued" (the default) and "Working draft — not issued". | 15 Aug 26; 15 Sep 26 (A4: viewers look, never switch) · `html.ts` `viewDraftSelHTML` / `viewVerSelHTML` | LIVE |

## E. Unpublish, a quiet correction, and undo of a publish

| id | the rule | when · where | status |
|---|---|---|---|
| AM32 | **Undo of a published day = UNPUBLISH it** — it drops back to an editable working copy. A first-class **Unpublish** button at the top of the day (beside sign-off and publish, only where it applies); a standing action, not session-scoped like undo, so it works after a logout. Undo of a just-published day runs the same unpublish. | 18 Sep 26 (newest) · memory `undo-of-publish-semantics`; undo-contract §4 | LIVE |
| AM33 | **Unpublish = correct quietly:** unpublish, edit, republish under the SAME label (Original stays Original, AL1 stays AL1), not shown as an amendment. **A real amendment is a separate act:** leave the day published, edit the working copy, publish the next AL. The choice is made by the action, not at republish. | 18 Sep 26 · same | LIVE |
| AM34 | **Unpublish guardrails:** scheduler/admin only; it clears that day's sign-offs (re-sign to republish); only the most recent version comes off (an AL on top comes off before the one under it). | 18 Sep 26 · same | LIVE |
| AM35 | **The label is reused, but nothing is erased:** every issuance stays as its own snapshot; a correction of a version that had reached the shared database writes a history line ("corrected on <date> by <who>"); one that had not is fully silent. **No shared database yet, so today every correction is silent.** | 17–18 Sep 26 · same | LIVE (the logged path waits for the database) |
| AM36 | **The only boundary is the shared database registering a publish.** An export, a print, a CSV or the session ending is NOT a boundary and does not constrain undo. | 17 Sep 26 · same; `src/state/disclosure.ts` | LIVE |
| AM37 | **Unpublishing a day whose OIL credits are already spent warns first** — when withdrawing the day's credit would leave a man's OIL balance below zero because a bid already draws on it ("Withdraw — confirm", a second tap); unpublishing withdraws those credits until the day is republished (which is D142 at work: an unpublished day has no published version to earn from). The two-tap warning, and its "would go below zero" test, are the design's calls (reviewers Fable #5 / Codex GU-P2-009), not his. | 18 Sep 26 (global-undo design §6.6) · `ui/interactions.ts`, `html.ts`, `leavewar/sync.ts` `oilCreditBidAgainst` | LIVE |
| AM37b | **Correcting an issued day is unpublish-and-republish under the SAME label (or, later, the end-of-day version) — neither costs an amendment number.** | 21 Sep 26 · engine-rules §Weekend/PH work earns OIL | LIVE (the end-of-day half is DEFERRED with EOD) |
| AM37c | **What Unpublish does to the day:** unpublishing an AL puts that AL's changes back to pending on the working copy, and the version under it becomes current again; unpublishing the Original makes the day a plain draft. The button shows only on a published day, to the scheduler, for the latest version, and not while an older version is being looked at. | 18 Sep 26 (the design's reading of AM32–AM34) · global-undo design §6.5; `engine/publish.ts` `unpublishDay` | LIVE |

## F. Undo generally, as it touches the amendment system

| id | the rule | when · where | status |
|---|---|---|---|
| AM38 | **Undo reverses only the signed-in person's OWN changes, and the list clears when they sign out.** It never greys out because someone else changed something since; if someone else has since changed the very same thing, Undo refuses and says who. | 24 Sep 26 · **D148**; undo-contract §4 | LIVE — NOT BUILT (`[GLOBAL-UNDO]` `[GU-MAYREV]`: "build it with the amendment or change-recording work") — see §Q2 |
| AM39 | **Publishing is its own undo step**; an undo that lands before a publish runs Unpublish (AM32). Undo is refused while typing in a field. | 18 Sep 26; engine-rules §History | LIVE — the "refused while typing" half has nothing to do today: the app has no undo keyboard shortcut, and pressing an Undo button takes the focus out of the field, committing it first (the half comes from the original app's shortcut) |
| AM39b | **One Undo for the whole app that takes you to where the change was; every Undo / Redo says in a short bubble what it did** (one shared describer, never a per-feature string); **an undo that clashes with a later change is refused whole, with a plain message.** | 13 Sep 26 (snap-to-page); 17–18 Sep 26 · global-undo design; undo-contract | LIVE |
| AM39c | **Undo cannot reach behind a publish on that day:** it says "A day on this week was published after that change — tap Unpublish on that day first, or edit its working copy." A redo of an undone publish lands published, with the sign-offs cleared. | 18 Sep 26 (the design's calls, A16/A22 of the sweep) · global-undo design §6; phase-2 cutover plan; `src/undo/timeline.ts` | LIVE — the message said "take the published day back first", a control no screen names; now it names the Unpublish button (re-test, 24 Sep 26) |
| AM39d | **Roster and settings edits are undoable — ordinary changes, never amendments.** | 16 Sep 26 · command-layer design | PARTLY BUILT — they are never amendments; but the one Undo covers only the schedule, the Leave War, inputs and plans (`src/state/undo-wire.ts` `setCutoverModules`), not the roster or the settings → `OUTSTANDING.md` `[UNDO-ROSTER-SETTINGS]`, for the change-recording re-test (D147) |

## G. Inputs, availability and the issued day

| id | the rule | when · where | status |
|---|---|---|---|
| AM40 | **Nothing on a published schedule may change without the scheduler acknowledging it.** The freeze and the pending mark together are the mechanism. *"Things shouldn't change silently without the scheduler acknowledging it."* | 22 Sep 26 · **D45** (the principle) | LIVE — the standing test |
| AM41 | **A request a person files on an already-published day lands on the WORKING copy as a pending amendment** (the count rises; the scheduler removes it if unwanted); the issued face stays frozen. Only the interactive filing path — a week load never churns a published day. | 16 Sep 26 · memory `published-day-input-is-pending-amendment` | LIVE |
| AM42 | **Who stood behind an ALL / ALL AVAIL puck is frozen at publication, on every day.** The working copy shows today's answer; a difference raises the ordinary pending mark; the scheduler amends or publishes the end-of-day version. | 22 Sep 26 · **D44** | LIVE |
| AM43 | **A new absence must not silently change a published day's Unavailable list.** | 19 Sep 26 · `OUTSTANDING.md` `[PUB-UNAVAIL]` | LIVE — NOT BUILT (queued in his after-the-hunt order; walked here, not built here) |
| AM43b | **An input that has not landed on the day still counts for its warnings** (for example one filed onto a published day and not yet published), and a removed input stays parked until it is accepted again. | 26 Aug 26 · `HANDOFF-ARCHIVE.md` | LIVE |
| AM44 | **An issued day keeps what it went out with when a rule changes under it**, until somebody corrects and republishes it. | 22 Sep 26 · **D48** (a principle; nothing to build now) | LIVE |
| AM45 | **An issued weekend carrying a placeholder may read "1 pending" after the OIL change — leave it; the demo data is wiped before the database.** | 23 Sep 26 · **D54** | LIVE (not a finding) |

## H. What a published day earns (OIL)

| id | the rule | when · where | status |
|---|---|---|---|
| AM46 | **A day's OIL comes from its LATEST PUBLISHED version** — the latest amendment, or the end-of-day version if that is the latest — however long ago the day was. No lock, no clock. A later version that takes a man off a past day takes that day's OIL away from him. | 20 Sep 26 · **D142** | LIVE |
| AM47 | **Only the issued schedule earns, in both directions:** a working-copy change moves nothing until it is published; a holiday declared after publication waits for a republication and the day says so. | 21 Sep 26 · **D2** | LIVE |
| AM48 | **Each day's OIL is worked out from that day alone** — a change to one day never moves another day's OIL; a saved week that cannot be read never wipes credits. | 12 Sep 26 · brief §6-CORE | LIVE |
| AM48a | **Who earned on a published day is decided at publication and frozen** — a later roster change does not reopen it; a placeholder on a published day keeps earning for the people it was issued with, the day reads pending, and republishing sweeps what no published work still earns (D46); crediting an exempt seat on a published day goes through an ordinary amendment (D24). | 21–22 Sep 26 · **D3, D46, D24** | LIVE |
| AM48c | **Publishing a weekend or holiday keeps a clashing, undecided Leave War bid and flags the day** — it no longer throws the bid away; the admin is told. *"Keep the bid and flag the day, both ways."* | 20–21 Sep 26 (the S4 hunt's Q3) · `raptor-port/docs/archive/HANDOFF-S4-BUGHUNT.md` | LIVE — the Leave War architecture text still says the publish REPLACES the bid; the walk checks which the code does |
| AM48d | **A worked weekend that earns nobody says so, on the day and at publish (D81); a weekend no Leave War period covers says so, and the warning is repeated in the strip shown when he publishes (D19).** | 20–22 Sep 26 · **D81, D19** | LIVE |
| AM48b | **ALL OIL waits for publication** — the schedule's and a duty-and-commitments claim's alike. *"we make it a point to publish everyday so that silently earn nothing wont happen"* · *"ok u can set it as a reminder to all schedulers"* — the reminder is the warning on any weekend or holiday with OIL waiting to be published. Once a weekend is published, a member deleting or re-timing his own input no longer moves his credit until the day is republished. | 21 Sep 26 · engine-rules §Weekend/PH work earns OIL | LIVE |

## I. History, the changes list, export

| id | the rule | when · where | status |
|---|---|---|---|
| AM49 | **The changes list (History) records who changed which detail, when, and what it was before**; for this session only, and an undo does not rewrite it. On the board, History mode shows a detail's story on a tap, and the full list opens from a line under the checks panel; the surface is called "Edit history". | 11 Aug 26; 23 Aug 26 (the name) · engine-rules §The edit log; ui-contracts §History on the board | LIVE |
| AM49b | **The board's sign-off strip reads like the edit week's (names two-up), and on a phone the board runs: sign-off, then the live checks, then the panels.** *"put it right below sign off section"* · *"make the board sign-off similar to the one in edit schedule"* | 14 Aug, 22 Aug 26 · ui-contracts | LIVE |
| AM49c | **"Clear old clutter" deletes no saved weeks** — deleting one could lose a day's amendment history. | 19 Sep 26 · `OUTSTANDING-ARCHIVE.md` | LIVE |
| AM50 | **Export is a scheduler-only snapshot of the PUBLISHED schedule, of the CURRENT DAY only**, and not a publication boundary. | 17 Sep 26 · `OUTSTANDING.md` `[FLAG-EXPORT]` | PARTLY BUILT — it prints the published version; still the whole week (filed, not this re-test) |

## J. Flags on the published schedule

| id | the rule | when · where | status |
|---|---|---|---|
| AM51 | **A published day shows its warnings again** — crew rest (across days and past midnight), the 7-day run, timing clashes. Each screen flags the version it shows; a day is checked against each neighbouring day's published version if it has one, else its working copy; the issued content stays frozen. | 15–16 Sep 26 · `OUTSTANDING.md` `[CRP-FLAG]` | PARTLY BUILT (its first two parts merged 16 Sep 26; the rest is backlog, not this re-test) |
| AM51b | **The view-only page shows the day's warnings too** — on a draft day and on the working-draft peek (its live faces); the issued face shows the flags of its issued version (AM51). | 15 Sep 26 (follow-up 6); 16 Sep 26 · `plans-selector-followups.md` item 6; `html.ts` `dayIssuedHTML` | LIVE |
| AM51c | **A published day shows everything a draft day shows** (its warnings); **a preview of an OLD version or a parked plan shows no flags** — a past version is read, not checked. | 15 Sep 26 · `2026-09-15-crewrest-flagging-plan-v2.md` | LIVE |
| AM51d | **A fresh draft day that breaks a published neighbour (crew rest across the two) shows the flag on both views.** | 15 Sep 26 ("owner's case") · crewrest plan v1/v2 test 4 | LIVE |
| AM51e | **The issued face looks the same to an admin and a member** — nothing on it depends on role; **the per-day "view the working copy" choice is open to any viewer**, stamped "Working draft", showing the working copy's own flags. | 15 Sep 26 (D1, D2 of that plan — local labels, not D-numbers) · crewrest plan v2 | LIVE |
| AM51f | **Anything that marks a day's divergence is anchored on the calendar DATE, never the weekday name** (so a Monday in one week is never confused with a Monday in another); **no wall-clock cutoff, and no coupling to EOD.** | 15 Sep 26 · crewrest plan v1 | LIVE — the build keys its in-list marks on the day's place in the week; the walk checks a week boundary |
| AM51g | **No number or tally on the publish button, and no end-of-session "publish or discard" reminder.** | 15 Sep 26 ("owner + Fable") · crewrest plan v2 | LIVE |

## K. The end-of-day version (EOD)

| id | the rule | when · where | status |
|---|---|---|---|
| AM52 | **An EOD records what actually happened**, published on the day's own stack only when reality differed, labelled EOD, with no four-role sign-off ("recorded by …"), correctable by a later EOD. | 12 Sep 26 · brief §3b; `OUTSTANDING.md` `[EOD]` | DEFERRED — not built, not walked |

---

## Coverage — which rules a test pins (the rule-coverage gate, 24 Sep 26)

Every LIVE / PARTLY BUILT line above is now a rule of `raptor-port/scripts/rulecheck.mjs` (AM38, AM43 and AM52 wait
until they are built). A read-only mapping of the existing tests found **37 pinned whole** — each of those tests
now carries its id in its title, e.g. "… (AM16)" — **30 pinned only in part, and 2 by nothing (AM7, AM44)**; those
32 are the gate's baseline, named there so they stay visible, and the list shrinks as each gains a whole-rule test.
What the partial ones miss, in one line each (from the mapping): AM8 the Original's lack of AL colour · AM15 the
draft-day line · AM17 a member TRYING to publish, sign, unpublish, load or switch (only the page gate is tested) ·
AM19 dotted vs solid (styling) and the view page's neutral hint · AM25 the removals / reorders / filings wording ·
AM26 plans made before the first publish surviving it · AM27 the absence of a review screen · AM28 the menu order
and the board's Back · AM30 today's version tag on a plan preview · AM34 the admin-only refusal and the sign-off
clearing of Unpublish · AM36 an export or a logout · AM37 the two taps driven · AM39 the typing half (moot, above) ·
AM39b the jump and the bubble on screen · AM39c the redo half · AM39d the roster / settings undo (not built) · AM45
D54's exact case · AM47 the late-holiday warning · AM48 one day never moving another day's OIL · AM48a D24 and
D46's removal · AM49 the reload · AM49b the names two-up · AM50 scheduler-only and "not a boundary" · AM51 crew
rest past midnight and timing clashes · AM51b–AM51g the drawn pages, the roles, the plan preview, the week
boundary, the end-of-session reminder. The walk (the evidence sheet) covers many of these by hand; a test is the
guard that keeps them.

**Later the same day (`767799ae`), five came off the baseline** — the walkers' fixes named them in tests that failed
first: **AM28** (the board keeps the plans selector and tag under a preview), **AM34** (Unpublish, and Undo of a
publish, clear every plan's sign-offs, parked ones included), **AM39b** (Redo never stuck behind a step a new change
replaced), **AM39c** (an Undo past an undone publish never hands its spent sign-offs back, and the redo lands published
with them cleared), **AM47** (a holiday declared on the Leave War after publishing raises the day's advisory at once).
What each still misses of its line above is unchanged where not named here (AM28's menu order, AM34's admin-only
refusal, AM39b's jump and bubble on screen).

## Z. The clashes — which rule wins (D90: the newer one)

| # | the older rule, set aside | the newer rule, followed |
|---|---|---|
| Z1 | 11–12 Sep 26: *"Published = immutable … no retract / unpublish … no in-place correction, even a typo … undo cannot cross a publish."* | **18 Sep 26 (AM32–AM35):** undo of a publish = Unpublish; a quiet correction republishes under the same label. What survives of the older rule: an issuance is never ERASED (AM4) — kept as its own snapshot. |
| Z2 | 16 Sep 26: undo of a publish = a correcting amendment the squadron receives. · 17 Sep 26: a history line only. | **18 Sep 26:** Unpublish (Z1). |
| Z3 | 12 Sep 26 (brief §4): bringing out a saved plan runs a three-way comparison and an itemised keep/revert screen. | **14–15 Sep 26 (AM27):** plain editing — no review screen. |
| Z4 | 11 Sep 26: lock earned OIL on an already-worked day; 12 Sep 26: protect it structurally through the day-close. | **20 Sep 26, D142 (AM46):** latest published version, no lock, no clock. |
| Z5 | 12 Sep 26 (brief AM-06): an availability change invalidates a signature with no cell touched. | **22 Sep 26, D45 (AM13):** it never does; the pending mark is the mechanism. |
| Z6 | 26 Aug 26: leave a published day alone when an input is filed on it. | **16 Sep 26 (AM41):** a live filing lands on the working copy as a pending amendment (the interactive path only). |
| Z7 | 15 Aug 26: re-publishing a reopened day re-issues the current version in place (the old "reopen"). · 12 Sep 26: the reopen control is removed. | **18 Sep 26:** Unpublish is the one way back, for the latest version only (AM34), and each issuance is kept (AM4). |
| Z8 | 16 Aug 26: the "✓ Published · ALn" stamp carries the version. | **15 Sep 26 (AM22):** the stamp is retired; the coloured version tag carries it. |
| Z9 | 15 Sep 26 (the [CRP-FLAG] plan): a "Not Yet Signed" marker shown to everyone. | **16 Sep 26 (AM24):** working copy only, never on the issued face. |
| Z10 | 12 Sep 26 (brief §2): "undo cannot cross a publish; a plan switch is a hard undo boundary". · 13 Sep 26 (Astra SEQ-002): global undo cannot cross a signed publish. | **17–18 Sep 26 (AM39–AM39c):** an undo that lands on a publish runs Unpublish. |
| Z11 | 12 Sep 26 (EOD design): a correction after an EOD is a fresh publish of either kind · the agent's REV5-03: corrections are EOD-kind only. | **Not settled — EOD is deferred** (AM52); not walked, not asked now. |

**Considered and found NOT to clash:** the live warnings on the issued face (15 Sep 26, AM51) against D45's test
(22 Sep 26 — "if a reader could see a different answer tomorrow with nobody having acknowledged it, the design is
wrong"): a warning is a live overlay on the frozen document, drawn so the scheduler SEES a new clash; D45 is about
the schedule's content and its signature changing silently. The content stays frozen (AM4).
**Recorded but not an amendment question:** his 11 Sep 26 *"I don't really agree with how scheduling should be
done"* (the amendment design brief) was the start of the redesign that AM1–AM6 then settled with him.

**Stale text found while sweeping — each marked in place with its newer rule, per D90, in a docs-only commit of
this branch:**
- `raptor-port/docs/engine-rules.md` §Publishing / amendments — *"There is no `unpublishAL` — an issued AL is never
  withdrawn and never returns its changes to pending"* (since 18 Sep 26 Unpublish withdraws the latest version and
  its changes return to pending); §Version snapshots — *"An issued version is frozen forever, with no exception"* and
  *"no chip on a published day no AL ever touched"*; §Availability — an input landing on a published day is *"a silent
  no-op"* (16 Sep 26: a pending amendment on the working copy).
- `raptor-port/docs/ui-contracts.md` — §The day-head version chip's heading ("now INSIDE the published stamp",
  retired 15 Sep 26); §Version preview's "the week-status banner … keeps only the AL roll" (the roll went too,
  15 Sep 26); §Day templates and Drafts' "Reopen the day first" refusal (a template on a published day is a
  working-copy edit since Phase 2); §Accepting a personal input's published-day no-op (16 Sep 26).
- `OUTSTANDING.md` `[AMEND]` — its "published = immutable … supersede-never-retract, undo cannot cross a publish"
  summary and its PSF-001 line (done in the first commit).
- `raptor-port/docs/undo-contract.md` — its head still calls the one global undo "designed, not yet built" (built
  and live 18 Sep 26).
- The memory index line for `undo-of-publish-semantics` ("never erase/reuse an issued version id") and the memory
  `plans-selector-redesign-locked` (PSF-001 "open").
- Left as they are, on purpose: the frozen archives (`HANDOFF-ARCHIVE.md`, `raptor-port/docs/archive/`) — history,
  never edited.

## Q. Real gaps or clashes — questions for him (filed in `OUTSTANDING.md`, not asked mid-run)

*(Filled as the sweep and the walk find them.)*

- **Q1 — settled, not a question.** `OUTSTANDING.md` `[AMEND]` listed PSF-001 (a filing-only change publishing on
  stale signatures) as "his call"; he answered it on 15 Sep 26 (*"close it now"*, `plans-selector-followups-plan.md`)
  and it is built (AM14). The backlog line and the memory note that still called it open are corrected in this
  change.
- **Q2 — D148 is decided but not built.** Whether it is built in this re-test or in the change-recording re-test
  next in his order (D147) is a sequencing call, not a product one: see the evidence sheet §2.
- **Q3 — a real overlap between two of his rulings: does D45 cover a leave landing on a published day?** D45
  (22 Sep 26): *"a change in who was available never invalidates a signature — the pending mark is the whole
  mechanism."* PSF-001 (15 Sep 26, AM14): an input accepted onto the day, or filed under Unavailable, DOES clear
  the sign-offs. D45 is the newer, but it was given about the crowd behind an ALL / ALL AVAIL puck, and nothing in
  its record says whether it also reaches a person's own leave or other input landing on the day. So the newer
  ruling does not clearly cover the case (D90's limit): **kept as built (a filing clears the sign-offs) until he
  answers.** Filed in `OUTSTANDING.md`. **SETTLED 25 Sep 26 by D103** (any pending change wipes the sign-offs — a filing included).
- **Q4 — two of his rulings read against each other on screen: "Not yet signed" beside four VALID sign-offs.**
  AM24 (16 Sep 26) shows the marker whenever a published day has unpublished changes; D45 (22 Sep 26) keeps the
  sign-offs valid when only who-is-available changed. Both hold, and together the day reads "Not yet signed" beside
  four green names and an open "Publish AL1" (walker W4). A wording question, not a defect: **kept as built until he
  answers.** Filed `[AMEND-NYS-WORDING]`. **SETTLED 25 Sep 26 by D97** (two wordings) and D103.
- **Q5 — a day template applied to a published day.** No ruling covers it. By identity every template row is new, so
  applying the day's own template back reads "31 changes · 15 removals" for identical content (AM20, AM23 say a mark
  means a real difference), and the day's accepted inputs leave the programme (walker W2). Refuse, keep what matches,
  or leave it — his call. Filed `[AMEND-TEMPLATE-PUBLISHED]`. **SETTLED 25 Sep 26 by D96** (refused).
- **Not a question — the history line for a correction nobody else had seen.** The 18 Sep summary says "a quiet
  line in the history records the correction"; his 17 Sep words decide the case it does not spell out: *"as long
  as if I publish and undo and it didn't hit the database there isn't a need to put it in the records history"*.
  So a correction of a version no database registered is fully silent (AM35) — as built.
- **Not a question — OIL on an unpublished day.** The design said it "flagged to the owner" that Unpublish
  withdraws the day's OIL; his D142 (20 Sep 26) settles it — a day earns from its latest PUBLISHED version, and an
  unpublished day has none. The two-tap warning (AM37) is the design's safety, not a ruling.
</content>
</invoke>
