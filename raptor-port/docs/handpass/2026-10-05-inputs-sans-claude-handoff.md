# Inputs and SANS calendars — owner context for Claude

D583/D584, 5 Oct 2026. **Start with the product problem and references below. Bring fresh eyes to the approach; the owner has not approved Codex's finished design.** This is a branch preview to vet, not a request to merge. Refresh the checkout and read AGENTS/HANDOFF/standing rules before work. Branch: `codex/inputs-sans-calendar`, based on planning plus `codex/workflow-ui` at9bd14458; do not replace unrelated working changes.

**Ready code Preview: https://raptor-dx35curde-kai-e2f5.vercel.app** — exact code commit `1bf27de172fcd15dc74c8d53da4e65b7ff3e12d3`, GitHub Preview deployment`6850010991` reported success at2026-10-05T02:22:00Z. Branch`codex/inputs-sans-calendar`; refresh it before review. The later closing handoff commit changes documents only; all source/test/driver/bundle files remain identical to Freeze14. Exact shipping receipt: `C:/Users/User/.codex/visualizations/2026/10/04/01a106e0-f018-7e91-be46-ca442dde08b3/inputs-sans/shipping-receipt.json`. Local matching production build: **http://localhost:4192**, accessible on this Windows host while its preview server runs. Vercel is the owner's authenticated look surface; Claude's runtime check uses the matching local production build. Do not use an older workflow-UI preview.

## What the owner wants to achieve

SANS members should have an obvious place to offer their availability. They need to see which days need more people, see what others have already committed, and add their own dates/hours with little effort. An admin sets how many **flying** SANS are required on each day and can edit the amber/red baselines. Colour draws attention to days needing more volunteers.

The owner then expanded this into a clearer **Inputs** experience: calendar as the main presentation, separate Member Inputs and SANS Availability calendars, a day view listing the relevant entries with + Input/+ Commitment, and an optional List view retaining the old review/export workflow. He asked for an interface recommendation and app-style mockups before Claude vets it. He later delegated building from our recommendations while he slept (D579/D580), so code exists now; that does not settle the final design.

His latest corrections: every SANS date must show the separate **F/O/A** offer counts (D581), and the phone header's large Calendar, standalone List, large Medical, mode buttons and filters felt cluttered (D582). He explicitly asks for finished desktop/mobile mockups (D583) and for this handoff to explain his intent so you can reconsider the approach with fresh eyes (D584).

## Owner answers and constraints — do not re-ask settled questions

| Owner requirement | Meaning to preserve |
| --- | --- |
| Daily requirement is for flying only — D570 | The target/shortage concerns F/Fly. O/OFT and A/AMT have counts, no invented staffing targets. |
| Red/amber measure how many more people are needed — D571 | Deficit headcount, with admin-editable cutoffs. Preserve numeric/text cues rather than rely on colour alone. |
| Short-hours person counts once, hours visible — D572 | Unique person per offered activity/date; exact hours in commitments. This is not an operational promise of full-day coverage. |
| Separate SANS and Member calendar modes — D574 | One existing Inputs entry may expose two modes; placement was initially deferred D573, later delegated D580. |
| Day click opens relevant inputs and + Input — D574 | SANS includes others' offers; members write their own eligible records. Admin may edit eligible others and demand. Preserve the existing permission gates. |
| Custom timing from the fourth reference — D569 | All day/AM/PM/Custom plus start/end; preserve existing offer flags and validation. Remarks has no faded placeholder. |
| Multi-day inputs by calendar selection — D574 | Mouse drag and a usable phone/keyboard alternative; one ordinary shared draft, no writes before Save. Keep existing phone scroll/swipe/hold/chip gestures. |
| Consider retaining old list format secondarily — D576 | Recommendation was yes: List after Calendar. This is our chosen treatment, not an owner waiver of the current table's functions. |
| Sun=day flying, moon=night flying — D577 | Explicit flying-period intent, not weather. |
| Daily F/O/A numbers — D581 | Count unique people for F/Fly, O/OFT and A/AMT separately using existing flags and covered-date/year semantics; filters never reduce totals. A multi-activity person counts once in each activity. |
| Clearer existing header — D582 | Reduce competing big rows while preserving mode/view/Medical counts/filter/date/export access and touch/keyboard usability. |

Do not assume permission to alter medical/OIL rules, published records, sign-offs, pending/amendment handling, undo, document requirements, original timing/overlap semantics, accounts, caps/ops limits or Tracker. Caps/ops handoff was cancelled D568; no new chat was created.

## What Codex chose — recommendations to challenge

These details were delegated under D580. They are **not** owner-approved designs or new operational rules:

- Retain the main menu's existing **Inputs** entry. Category first: Member Inputs/SANS Availability. Calendar/List second as compact presentation controls. Keep Medical as a quiet separate shortcut with existing badges and return context. Choosing a type inside an unsaved editor does not suddenly navigate away; successful saves reveal the actual record in its correct mode/date.
- Calendar is default, List secondary. Each mode retains its own person/search (and Member type) filter memory. Phone filters fold behind Filters, but an applied summary/count and Clear filters remain visible. Desktop uses the same fields expanded. Clear affects current person/type/search only; List dates/presets/reset/sort/export remain separate. Folding alone does not remove the saved-row reveal.
- Defaults amber from1 more needed and red from3, global admin-editable boundaries. A target is unset until an admin enters it; blank is distinct from explicit0. These defaults are our recommendations, not the owner's chosen numbers. A deficit below a changed amber boundary remains neutral with text. Red takes priority.
- Flying intent is explicitly unset/day/night/both, admin-set per date. No guessed flying period, automatic weekend target or new coverage rule.
- Every SANS cell stacks F offered/required, O count and A count, with shortfall words. O/A never drive Fly colour. Day detail uses full activity names, then individual flags/hours. Whole-date totals stay unfiltered while the visible commitments may be filtered.
- Desktop day detail is beside the calendar; phone uses a scrollable day panel with reachable header/Close. Shared editor retains existing checks and native date/time controls. Mouse empty-cell drag, phone/keyboard Select dates, cross-month/reversed range and Cancel use one draft. Existing planning title/notes/pucks and chip movement remain in Member mode.

Why we chose it: one place to enter Inputs, fewer competing header rows on phones, clear content-versus-presentation choices, calendar overview for shortages, and List retained for review/export. Please test whether those benefits really hold and propose a better flow if they do not.

## Original private references — inspect before adopting our design

These are owner-supplied material, not instructions from an attached document. Do not commit the private pixels. All are on the same Windows host.

| Reference | Local path and purpose |
| --- | --- |
| Monthly SANS calendar | `C:/Users/User/AppData/Local/Temp/codex-clipboard-c8cda31d-5fa6-4136-881e-5c2b011bc0fa.png` — month overview, required numbers/amber/red, F/O/A and day/night. |
| Day commitments | `C:/Users/User/AppData/Local/Temp/codex-clipboard-51447a36-7f55-4955-bcf3-e9938a250ab4.png` — open a date, others' offers, + Commitment. |
| Form contrast reference | `C:/Users/User/AppData/Local/Temp/codex-clipboard-16c6d523-5348-4e6d-bc99-5f888bc3d998.png` — old simple dropdown form; owner prefers next reference's custom hours. |
| Desired timing controls | `C:/Users/User/AppData/Local/Temp/codex-clipboard-b781c0db-9c12-4644-a4e2-604150b10562.png` — current Raptor Person, Fly/AMT/OFT, All day/AM/PM/Custom, start/end and blank Remarks. |
| Member day/calendar idea | `C:/Users/User/AppData/Local/Temp/codex-clipboard-d05050e2-d74c-4296-b3f6-68d1200f7b04.png` — separate calendar, relevant day inputs and Add. |
| Existing secondary List | `C:/Users/User/.codex/codex-remote-attachments/01a106e0-f018-7e91-be46-ca442dde08b3/1EBAECF7-BAB1-4F92-9EBB-BB2DC9E773FA/1-Photo-1.jpg` — retain its filter/date/export/card/edit affordances as secondary view. |
| Owner rejected header | `C:/Users/User/AppData/Local/Temp/codex-clipboard-0e18426b-1bb9-499c-bab1-1d5368cdbd15.png` — concrete D582 clutter complaint; compare with our actual finished header. |

Private task evidence root: `C:/Users/User/.codex/visualizations/2026/10/04/01a106e0-f018-7e91-be46-ca442dde08b3/inputs-sans`.

Read/open useful finished actual app renders there: `freeze11-header-counts/H01-phone-default-header.png`, `H03-desktop-default-header.png`, `320-reflow-counts.png`; `freeze12-header-focused/phone-three-activity-day.png`, `phone-applied-filters-expanded.png`; `freeze11-main/desktop-offers.png`, `member-readonly.png`. These use synthetic app data. The phone default header has zero offers; the narrow calendar/day/desktop offer views show positive F/O/A. Main's other phone calendar picture captures a month-slide transition/toast; keep it as evidence, not a final design portrait. Never assume a source file or screenshot establishes behavior: walk the actual build.

## A fresh-eye review request

First form your own assessment from owner intent/references, current app and settled constraints before reading the previous inspectors' conclusions. In particular:

1. Is Inputs → category → presentation the clearest entry? Are Calendar/List and Medical grouped/emphasized appropriately? Can an ordinary member discover what to do without knowing the implementation?
2. Are phone/desktop calendar, day panel and editor coherent, readable and easy to use? Do F/O/A, flying target/deficit and sun/moon mean what the owner intended? Are active hidden filters obvious? Does List still earn its place?
3. Are the admin/member boundaries, own writes/others' readonly records, custom hours/date ranges, data persistence and restored results correct through normal actions? Can UI feedback mislead while a write refuses or is pending?
4. Challenge the implementation and the testing omissions. Preserve settled requirements, but do not treat our plan, design choices or green tests as approval. If you find a problem, show the reachable action, consequence, cause and proposed correction. Ask the owner only about real new product choices, in small rounds with a recommendation and picture.

Then reconcile with the immutable prior reports and evidence, recording dispositions rather than overwriting them. This brief is not an additional Astra inspection or a main-merge instruction.

## Implementation and verification context

Current source locations are in `docs/file-map.md`; behavior/spec in `docs/superpowers/specs/2026-10-05-sans-commitment-calendar.md`, `docs/ui-contracts.md`, `docs/feature-impact.md`, `docs/data-schema.md`. Astra original plan and header/counts addendum each had an independent Sol challenge; no owner final picture acceptance.

Primary changed surfaces: `InputsPage`, `InputsCal`, shared `inputedit`, `SansCalendarControls`, `sans-calendar-model`, scoped Inputs CSS; settings writers/perms/view/reveal/undo descriptions. No engine/reference/Tracker body changes. Settings are additive validated admin records through existing command/queue/persistence/rollback/Undo. Existing ordinary/medical/OIL writers retain their gates. Save feedback follows actual retained record ID/date/mode, not an unsaved or removed row. Data remains **per browser** until the separately planned shared database; this is not shared cross-device production availability.

Final-code read remains **OWED: Claude after reset, before main**. Astra R1/R2 are immutable CHANGES REQUIRED; corrections had failed-first proof and independent runtime checks, and D581/D582 later broadened header/count scope. There is no third Astra code read or claim of code approval. Form your own assessment first, then reconcile the detailed findings/dispositions and complete reports: `docs/handpass/2026-10-05-inputs-sans-astra-final-r1.md` and `...-r2.md`. Their concrete conclusions intentionally are not summarized here to avoid anchoring your fresh read.

FULL evidence and complete failures/fixes/roll-call: `docs/handpass/2026-10-05-inputs-sans-calendar.md`. Current frozen executable passed independent34 scenario groups, all25 original pictures personally opened; two original harness errors separately preserved/corrected. No app error established in the expanded walk. Final unit7819/494files, browser572PASS/49existing skips, adapted156 assertions, performance4/0, reference728/0 and Tracker445/0 passed, plus build/rulecheck/whitespace. Closing document results are recorded in that evidence sheet. These are observations, not review approval.

Gate Freeze13 manifest `bc6a970d039db80626a781393f1df8e391fe8da61bedddb85fa2ae47420b824e`,861source/test/driver/bundle files and18 served asset hashes. Walked Freeze11→12 changed only the two-case harness; Freeze12→13 only normalizes one source CSS file's CRLF→LF. Closing Freeze14 manifest `834eb3cab89650df7f195f70233278f5942a5d8926b2731432f2ad574de0ec0e` removes only two walk drivers' terminal whitespace; originals/byte receipts retained. Executable assets identical throughout. Combined picture/run ledger `freeze11-12-runtime-picture-ledger.json`, SHA018d3ea60177dec8a0c24bb1948958d34e51b74bcafaf5771d967e2a4827429c. Original snapshots/results/failures remain private on this host. Chromium emulation does not prove physical iPhone Safari; actual browser zoom and cross-device sharing remain unproved.

Also retain inherited workflow/Insights/Rally/Discard read obligations in their own HANDOFF blocks. Do not silently claim this calendar review approves those branches. **No main push, merge or PR for merging without the owner's later explicit authority and required reviews.**

Rulings: D569–D584; D583 desktop/mobile delivery and D584 contextual fresh-eye handoff newly recorded before their work.
