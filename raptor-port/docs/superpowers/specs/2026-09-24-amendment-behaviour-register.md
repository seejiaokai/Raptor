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
| AM1 | **The DAY is the unit.** Each day is published, amended and numbered on its own: Monday goes Original → AL1 → AL2 on its own track, Tuesday on its own. A change touching two days is two separate amendments, one per day. There is no week-wide AL and no one AL covering several days. *"I am for sure having each day as an isolated amendment. Never the week. So this is going to be fixed."* | 11 Sep 26 · memory `amendment-per-day-isolated`; decisions §1 | LIVE — do not reopen |
| AM2 | **A day is a stack:** its issued versions (Original, AL1, AL2 …) frozen underneath, one live working copy on top. The AL number is how many times THAT day has been published since the Original. | 11–12 Sep 26 · decisions §1; brief §2 | LIVE |
| AM3 | **Each issued version keeps its own identity, tied to its date and year** — Monday's AL1 and Tuesday's AL1 are different records; "AL1" is only the label. | 12 Sep 26 · brief §5 AM-01 | LIVE |
| AM4 | **An issued version is never edited in place and never erased.** What went out stays exactly as it went out. Every issuance is kept as its own snapshot, forever — including one later pulled back by Unpublish (AM32). | 11 Sep 26, kept by 18 Sep 26 · decisions §1; memory `undo-of-publish-semantics` | LIVE |
| AM5 | **Viewers see the current issued version; the working copy is the scheduler's until he publishes.** A viewer can choose to look at the working copy, but it is labelled so it can never be taken for the issued schedule ("Working draft — not issued"). | 15 Aug 26 (the view page's two entries); 12 Sep 26 (crew may see the draft, badged, the issued version stays the authority) · `ui/html.ts` `viewVerSelHTML`; brief §2 | LIVE |
| AM6 | **To go back to an older version's content, load it onto the working copy and publish it as the NEXT amendment.** Viewers keep seeing the current issued version until that amendment goes out. *"the view only schedule should still see AL1, it shouldn't go to Original without me publishing the working copy."* "Load onto working copy" discards unpublished edits only after a second confirming tap. | 16 Aug 26; 11 Sep 26 §10; the two-tap confirm 15 Sep 26 (A1) · engine-rules §Version snapshots; ui-contracts §Version preview | LIVE |
| AM7 | **No "publish all days"; no two-person approval; no rule versioning.** | 7 Aug 26 · `raptor-port/CLAUDE.md` §Product invariants | LIVE |

## B. Publishing and signing

| id | the rule | when · where | status |
|---|---|---|---|
| AM8 | **First publish is "Publish day"** — the day goes out AS IT STANDS as its Original; everything typed while it was a draft is the build, not an amendment, so the Original carries no amendment marks. | Aug 26; kept through Phase 2 · engine-rules §Publishing | LIVE |
| AM9 | **After that, a change goes out as "Publish AL<n>" for that day only**, offered only when the day really differs from its issued version, never for a day with nothing to publish. | Aug 26; 12 Sep 26 (per-day) · engine-rules §Publishing; `html.ts` `dayStatHTML` | LIVE |
| AM10 | **All four sign-offs (CUR CK, SKED CK, PLANNED BY, APPROVED BY) sign every publish — the Original and every amendment**, bound to the content they signed. The sign-off look is unchanged. | 12 Sep 26 (#3) · decisions §4; brief §2 AM-06 | LIVE |
| AM11 | **A content change wipes the sign-offs back to empty; putting the content back restores them.** *"a change needs to be signed off … the sign offs will be removed and back to default cleared."* | 15 Sep 26 (R1) · `engine/publish.ts` `signShown` | LIVE |
| AM12 | **Each plan carries its own sign-offs.** Signing Plan B then switching to Plan A shows Plan A unsigned. | 15 Sep 26 (follow-up 1, taken the per-plan way) · `plans-selector-followups.md` item 1 | LIVE |
| AM13 | **A change in who was available never invalidates a signature.** He signs the published schedule; a later availability change shows as pending and nothing more; every day behaves the same. | 22 Sep 26 · **D45** | LIVE |
| AM14 | **A filing-only change (an input accepted onto the day, or filed under Unavailable) must be signed for too** — it clears the sign-offs like a content change and cannot publish on signatures given before it; putting it back restores them. His answer to Codex PSF-001: *"close it now"*. | 15 Sep 26 · `plans-selector-followups-plan.md` (PSF-001); `engine/publish.ts` `filingKey` | LIVE (the `[AMEND]` line calling it open was stale — corrected here) · see §Q3 for its overlap with D45 |
| AM15 | **The sign-off line says what publishing will do:** on a draft day "Signed — this day can be published"; on a published day it names the issued version and whether there are changes to publish ("no changes to publish" when there are none). **The publish button stays HIDDEN when there is nothing to publish.** | 15 Sep 26 (follow-up 7) · `plans-selector-followups.md` item 7; `plans-selector-followups-plan.md` | LIVE |
| AM15b | **Finishing the four sign-offs on a published day with nothing to publish pops a short note: "All signed — no changes to publish right now."** The principle that came with it: wherever correct behaviour could read as a bug because it is silent, the app says so. | 15 Sep 26 (R2) · `plans-selector-followups-plan.md` | LIVE |
| AM16 | **Only an appointed scheduler can sign SKED CK, PLANNED BY and APPROVED BY**; a name already signed stays offered even if the appointment is later withdrawn, so a signature never blanks itself on an appointment change. | Aug 26 · `engine/publish.ts` `SIGN_ROLES`, `signPeople` | LIVE |
| AM17 | **Only the scheduler (admin) publishes, signs, unpublishes, loads a version or switches plans; a member reads.** A member files his own inputs, but accepting one into the issued programme is the scheduler's. | 5 Aug 26 table; 18 Sep 26 (unpublish: scheduler/admin only) · engine-rules §Auth / roles | LIVE |

## C. What the day shows — marks, counts, tags

| id | the rule | when · where | status |
|---|---|---|---|
| AM18 | **Amendment marks are a published-day thing — a draft day shows none.** *"if I have not published the schedule yet, don't show all the orange dotted lines … only once published does an AL-coloured mark make sense."* The edit is still counted. | 25 Aug 26 · ui-contracts §Amendment marks; scheduler.md §Settled (Board behaviour) | LIVE |
| AM19 | **On the edit surfaces a pending change is DOTTED in the colour of the AL it will go out as; an issued change is SOLID in its AL's colour.** The view page keeps a neutral dashed hint for a published day's pending edit. | Aug 26 · ui-contracts §Amendment marks | LIVE |
| AM20 | **A pending mark means "differs from what was issued", not "was touched".** Change a time and change it back, or swap two pucks and swap them back — the mark clears, in every spelling (08:00 = 0800). *"swap the pucks and swap it back… it shouldn't register."* | 16 Aug 26 · ui-contracts §The day-head version chip | LIVE |
| AM21 | **A removal and a reorder on a published day are real amendment items**, listed as removals / reorders; a row added and removed again before the next AL is no change at all. | 12 Aug 26; 31 Aug 26 (reorders) · engine-rules §Publishing | LIVE |
| AM22 | **The version tag beside the day:** grey ORIG, AL<n> coloured by its number (AL1 cyan, AL2 amber, AL3 green, AL4 white, AL5 purple, AL6 pink, AL7 orange), a dashed DRAFT before first publish; it sits just left of the "4 X 4" count and shows on the view page too. The old "✓ Published · ALn" stamp and the week's amber AL roll are gone. | 15 Sep 26 (follow-ups 2–5) · `plans-selector-followups.md`; `html.ts` `verTagHTML` | LIVE |
| AM23 | **"N pending" counts real differences from the issued version**, and it agrees with the "Discard N edits" count and the Amendments panel. | 15 Sep 26 (A3 note) · `html.ts` `dayStatHTML` | LIVE |
| AM24 | **"Not yet signed" shows on the working copy of a published day that has unpublished changes — never on the issued face.** The published schedule stays TRUE until the next publish. | 16 Sep 26 · memory `published-day-input-is-pending-amendment`; `html.ts` | LIVE |
| AM25 | **The Amendments panel** lists each published day with changes to publish, what kind (changes, removals, reorders, input filings, "what this day earns changed") and its own Publish AL<n> button — locked until signed and while previewing an old version; below it, every issued amendment with its day and who approved it. | Phase 2 (12 Sep 26); OIL wording 22 Sep 26 · `ui/ALPanel.tsx` | LIVE |

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
| AM37 | **Unpublishing a day whose OIL credits are already bid against on the Leave War warns first** ("Withdraw — confirm", a second tap); unpublishing withdraws those credits until the day is republished (which is D142 at work: an unpublished day has no published version to earn from). The two-tap warning is the design's call, not his. | 18 Sep 26 (global-undo design §6.6) · `ui/interactions.ts`, `html.ts` | LIVE |
| AM37b | **Correcting an issued day is unpublish-and-republish under the SAME label (or, later, the end-of-day version) — neither costs an amendment number.** | 21 Sep 26 · engine-rules §Weekend/PH work earns OIL | LIVE (the end-of-day half is DEFERRED with EOD) |
| AM37c | **What Unpublish does to the day:** unpublishing an AL puts that AL's changes back to pending on the working copy, and the version under it becomes current again; unpublishing the Original makes the day a plain draft. The button shows only on a published day, to the scheduler, for the latest version, and not while an older version is being looked at. | 18 Sep 26 (the design's reading of AM32–AM34) · global-undo design §6.5; `engine/publish.ts` `unpublishDay` | LIVE |

## F. Undo generally, as it touches the amendment system

| id | the rule | when · where | status |
|---|---|---|---|
| AM38 | **Undo reverses only the signed-in person's OWN changes, and the list clears when they sign out.** It never greys out because someone else changed something since; if someone else has since changed the very same thing, Undo refuses and says who. | 24 Sep 26 · **D148**; undo-contract §4 | LIVE — NOT BUILT (`[GLOBAL-UNDO]` `[GU-MAYREV]`: "build it with the amendment or change-recording work") — see §Q2 |
| AM39 | **Publishing is its own undo step**; an undo that lands before a publish runs Unpublish (AM32). Undo is refused while typing in a field. | 18 Sep 26; engine-rules §History | LIVE |
| AM39b | **One Undo for the whole app that takes you to where the change was; every Undo / Redo says in a short bubble what it did** (one shared describer, never a per-feature string); **an undo that clashes with a later change is refused whole, with a plain message.** | 13 Sep 26 (snap-to-page); 17–18 Sep 26 · global-undo design; undo-contract | LIVE |
| AM39c | **Undo cannot reach behind a publish on that day:** it says "A day on this week was published after that change — unpublish it, or edit the working copy." A redo of an undone publish lands published, with the sign-offs cleared. | 18 Sep 26 (the design's calls, A16/A22 of the sweep) · global-undo design §6; phase-2 cutover plan | LIVE |
| AM39d | **Roster and settings edits are undoable — ordinary changes, never amendments.** | 16 Sep 26 · command-layer design | LIVE |

## G. Inputs, availability and the issued day

| id | the rule | when · where | status |
|---|---|---|---|
| AM40 | **Nothing on a published schedule may change without the scheduler acknowledging it.** The freeze and the pending mark together are the mechanism. *"Things shouldn't change silently without the scheduler acknowledging it."* | 22 Sep 26 · **D45** (the principle) | LIVE — the standing test |
| AM41 | **A request a person files on an already-published day lands on the WORKING copy as a pending amendment** (the count rises; the scheduler removes it if unwanted); the issued face stays frozen. Only the interactive filing path — a week load never churns a published day. | 16 Sep 26 · memory `published-day-input-is-pending-amendment` | LIVE |
| AM42 | **Who stood behind an ALL / ALL AVAIL puck is frozen at publication, on every day.** The working copy shows today's answer; a difference raises the ordinary pending mark; the scheduler amends or publishes the end-of-day version. | 22 Sep 26 · **D44** | LIVE |
| AM43 | **A new absence must not silently change a published day's Unavailable list.** | 19 Sep 26 · `OUTSTANDING.md` `[PUB-UNAVAIL]` | LIVE — NOT BUILT (queued in his after-the-hunt order; walked here, not built here) |
| AM44 | **An issued day keeps what it went out with when a rule changes under it**, until somebody corrects and republishes it. | 22 Sep 26 · **D48** (a principle; nothing to build now) | LIVE |
| AM45 | **An issued weekend carrying a placeholder may read "1 pending" after the OIL change — leave it; the demo data is wiped before the database.** | 23 Sep 26 · **D54** | LIVE (not a finding) |

## H. What a published day earns (OIL)

| id | the rule | when · where | status |
|---|---|---|---|
| AM46 | **A day's OIL comes from its LATEST PUBLISHED version** — the latest amendment, or the end-of-day version if that is the latest — however long ago the day was. No lock, no clock. A later version that takes a man off a past day takes that day's OIL away from him. | 20 Sep 26 · **D142** | LIVE |
| AM47 | **Only the issued schedule earns, in both directions:** a working-copy change moves nothing until it is published; a holiday declared after publication waits for a republication and the day says so. | 21 Sep 26 · **D2** | LIVE |
| AM48 | **Each day's OIL is worked out from that day alone** — a change to one day never moves another day's OIL; a saved week that cannot be read never wipes credits. | 12 Sep 26 · brief §6-CORE | LIVE |
| AM48b | **ALL OIL waits for publication** — the schedule's and a duty-and-commitments claim's alike. *"we make it a point to publish everyday so that silently earn nothing wont happen"* · *"ok u can set it as a reminder to all schedulers"* — the reminder is the warning on any weekend or holiday with OIL waiting to be published. Once a weekend is published, a member deleting or re-timing his own input no longer moves his credit until the day is republished. | 21 Sep 26 · engine-rules §Weekend/PH work earns OIL | LIVE |

## I. History, the changes list, export

| id | the rule | when · where | status |
|---|---|---|---|
| AM49 | **The changes list (History) records who changed which detail, when, and what it was before**; for this session only, and an undo does not rewrite it. | 11 Aug 26 · engine-rules §The edit log | LIVE |
| AM50 | **Export is a scheduler-only snapshot of the PUBLISHED schedule, of the CURRENT DAY only**, and not a publication boundary. | 17 Sep 26 · `OUTSTANDING.md` `[FLAG-EXPORT]` | PARTLY BUILT — it prints the published version; still the whole week (filed, not this re-test) |

## J. Flags on the published schedule

| id | the rule | when · where | status |
|---|---|---|---|
| AM51 | **A published day shows its warnings again** — crew rest (across days and past midnight), the 7-day run, timing clashes. Each screen flags the version it shows; a day is checked against each neighbouring day's published version if it has one, else its working copy; the issued content stays frozen. | 15–16 Sep 26 · `OUTSTANDING.md` `[CRP-FLAG]` | PARTLY BUILT (its first two parts merged 16 Sep 26; the rest is backlog, not this re-test) |
| AM51b | **The view-only page shows the day's warnings too** — on a draft day and on the working-draft peek (its live faces); the issued face shows the flags of its issued version (AM51). | 15 Sep 26 (follow-up 6); 16 Sep 26 · `plans-selector-followups.md` item 6; `html.ts` `dayIssuedHTML` | LIVE |

## K. The end-of-day version (EOD)

| id | the rule | when · where | status |
|---|---|---|---|
| AM52 | **An EOD records what actually happened**, published on the day's own stack only when reality differed, labelled EOD, with no four-role sign-off ("recorded by …"), correctable by a later EOD. | 12 Sep 26 · brief §3b; `OUTSTANDING.md` `[EOD]` | DEFERRED — not built, not walked |

---

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

**Stale text found while sweeping — fixed in this change, per D90:** `raptor-port/docs/engine-rules.md`
§Publishing / amendments said *"There is no `unpublishAL` — an issued AL is never withdrawn and never
returns its changes to pending"*; since 18 Sep 26 the Unpublish button withdraws the latest version and its
changes go back to pending. The `[AMEND]` item's summary line ("published = immutable … supersede-never-retract,
undo cannot cross a publish") is marked the same way.

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
  answers.** Filed in `OUTSTANDING.md`.
- **Not a question — the history line for a correction nobody else had seen.** The 18 Sep summary says "a quiet
  line in the history records the correction"; his 17 Sep words decide the case it does not spell out: *"as long
  as if I publish and undo and it didn't hit the database there isn't a need to put it in the records history"*.
  So a correction of a version no database registered is fully silent (AM35) — as built.
- **Not a question — OIL on an unpublished day.** The design said it "flagged to the owner" that Unpublish
  withdraws the day's OIL; his D142 (20 Sep 26) settles it — a day earns from its latest PUBLISHED version, and an
  unpublished day has none. The two-tap warning (AM37) is the design's safety, not a ruling.
</content>
</invoke>
