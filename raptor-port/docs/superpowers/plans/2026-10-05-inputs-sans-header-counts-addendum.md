# Inputs/SANS header and activity counts — addendum, 5 Oct 2026

Planning artifact by Astra under D496; Sol independently challenges it and its private pictures before source work. This supplements the immutable original plan and R1/R2 reports, without changing their findings or claiming approval. Scope stays on `codex/inputs-sans-calendar`. Rulings: D581 and D582, filed by the host; no new ruling here.

## Authority and isolated layout assessment

D581 requires daily F/Fly, O/OFT and A/AMT unique-person counts. D582 rejects the cluttered phone Inputs header and requests Impeccable refinement. D580 delegates the precise arrangement. The hierarchy below is an agent recommendation, not owner approval of an unseen picture. Independently compared the generated short D581/D582 lines with their full Scheduler rows and the spec/UI-contract homes: meaning PASS under D138.

Read Impeccable `SKILL.md` and `reference/layout.md`; ran its context loader once. This is **Operate**, a scoped refinement using existing implementation as visual authority, not a new product/design-world exercise. Missing PRODUCT/DESIGN files do not block it. Do not modify the protected skill or perform its unrelated update advisory.

Evidence: the supplied phone header, current `InputsPage` title/mode/filter structure, incumbent foundation/shell CSS, and already inspected Freeze9/10 actual phone/desktop pictures. This assessment preceded the host's separate mechanical scan.

| Layout question | Rendered/source evidence and decision |
| --- | --- |
| Reading order | The supplied phone image gives Calendar and Medical large full-width accent surfaces, while List sits alone. The two actual content modes arrive after those competing actions. Lead with Inputs identity, then content mode, then view and utilities. |
| Grouping | Calendar/List choose one presentation; Medical is a separate contextual destination. Group the first pair, demote Medical to one shortcut with its existing counts, and separate both from Member/SANS tabs. |
| Rhythm | Nearly every control currently has its own heavy row/container. Use existing 4/8/12/16 spacing steps, tight gaps within a group, one larger gap before the month. No new card around each toolbar. |
| Structure | One existing Inputs route already contains the modes/views. Retain it; nested mode then view controls express the task without adding global navigation or a full-width Medical CTA. |
| Density | Permanent person/search controls and oversized view actions consume the phone's first viewport before dates appear. Fold phone filters behind one labelled control; keep applied-filter evidence visible. Desktop keeps filters directly available. |
| Adaptation | Preserve DOM reading order: title, mode, view/utilities, active-filter summary/expanded controls, date toolbar, legend, calendar/List. Allow wrapping at intermediate widths and zoom; never reorder visually against keyboard order. |
| Extremes | Three activity counts plus a target will not reliably fit one narrow date-cell line. Stack three short labelled lines on phones; wrap large values without clipping. Keep 44px action targets, safe-area/short-height scrolling, full accessible date/count labels and reachable popup actions. |

## Recommended arrangement and preserved behavior

1. Keep the incumbent Raptor topbar, wing mark, colours, fonts, Undo/Redo and current sync status. A simple **Inputs** title anchors the page; any existing Saving/Sync indication stays secondary. Do not invent or persist new sync/account state.
2. Primary row: **Member Inputs / SANS Availability** tabs, equal width on phones. Preserve existing IDs and mode handlers, independent filter memories, saved-row reveal and eligibility rules.
3. Secondary row: compact **Calendar / List** segmented buttons, a quiet **Medical** shortcut with its current down/pending counts, and **Filters** on phones. Calendar stays the default. Smaller visual emphasis does not mean smaller touch targets. Medical returns to the prior view/mode/context; its counts and permissions are unchanged.
4. Phone Filters is an inline disclosure, not another modal. Use a real button with `aria-expanded`/`aria-controls`; hidden controls leave the tab order. Keep labelled native person/type/search controls and their existing IDs/writers. Search/filter edits apply as today and deliberately release a saved-row pin. Opening/closing the disclosure alone neither changes filters nor releases the pin.
5. When person/type/search filters are applied, show their number, a concise visible summary and **Clear** outside the fold. Clear affects those filters in the current mode only; it does not reset the other mode, calendar month, List date window or stored records. Long summaries may wrap, with complete accessible text. Keep the List date-window control, its own reset/presets, sort and Export reachable and explicitly visible in List; do not silently reinterpret a date filter as a data edit.
6. Desktop presents the same groups in compact aligned rows with filters expanded. Reuse existing selectors and handlers rather than duplicate mobile/desktop controls. Do not create duplicate IDs or two simultaneous stateful forms. Member Calendar retains its ordinary chips/planning controls; List retains add/edit/medical/OIL/date/export machinery.

## Activity-count contract

Use the existing `sans.f`, `sans.o`, `sans.a` mapping: **F = Fly, O = OFT, A = AMT**. Count unique person IDs separately for each activity on each real covered date. A multi-activity person contributes once to every chosen activity; duplicate rows do not double-count. Derive all three counts from the same unfiltered eligible-date input set, using existing authored-date/year/partial/overnight semantics. Do not change engine/reference bodies or operational slot coverage to implement display counts.

Every real SANS date, including zero-offer dates, displays F/O/A. Recommended phone text is three short lines: `F 3 / 5`, `O 2`, `A 1`, followed by existing Fly shortfall words. The slash is only Fly offered/required. Unset target shows `F 3` plus **No target**; zero target shows `F 3 / 0` plus **None required**. Desktop may use the same aligned three lines for consistency. Retain explicit Sun/day and Moon/night icons and their accessible names.

Expand the legend to explain F/Fly, O/OFT, A/AMT and Fly offered/required. Expose full names/counts in each date's accessible description. Only Fly controls the required number, shortage text and amber/red day tone; O/A have no targets, deficits, new settings records or operational availability promises. Day details also show the three totals, then existing individual flags/hours and filter explanation. Counts must update after successful save/edit/delete, Undo/Redo and reload; refused/stale-actor writes cannot change them.

## R2 popup correction carried forward

R2 F1 remains a real P2: Colour settings ignores outside presses and Escape exits Calendar. Its first Escape must dismiss only that popup, discard the draft and focus the opener, retaining SANS/Calendar/month. The parent document-capture handler must coordinate with the child; bubbling cancellation alone cannot protect it. Actual outside **pointerdown** closes without saving and still permits the intended calendar action. A text drag starting inside and released outside must not dismiss on the resulting click. Toggle, Cancel, valid Save, invalid refusal and role withdrawal retain their existing write/permission meanings.

Test both actual capture-registration orders: ordinary opening, then a legitimate notify/repaint while still open. If keyboard traversal can legitimately open InputEditor while Colour settings remains open, the higher editor owns Escape first, then colour popup, day/selection and Calendar layers. Do not manufacture overlap by direct state writes. Member controls are absent; withdrawn admin rights must remove stale listeners/focus capture.

## Break-test and runtime roll-call

| Boundary | Falsifiable scenario and required outcome |
| --- | --- |
| Count arithmetic | Same person F/O/A on one date, duplicate fixture rows, second O-only and third A-only: distinct sets per flag; no count influenced by filters. Zero rows still show all three zero counts. |
| Date/time | Multi-day range, partial10–11, overnight22–02, December/January and leap/non-leap February use existing authored coverage and real years. Never count a same month/day from a different year or spill an overnight offer by a new rule. |
| Fly target | Unset, zero and positive targets with amber/red boundaries; changing O/A only never changes Fly deficit/tone. Admin can edit only existing targets/cutoffs; member reads all counts. |
| Lifecycle/roles | Eligible member own F→O-only→A-only/multi-activity edit, admin any offer, other-person readonly, delete, Undo/Redo and reload. Stale actor and duplicate refusal keep all totals/data atomic. |
| Mode/view/filter | Member/SANS independent filters across Calendar/List; collapsed/expanded disclosure preserves values and focus order. Applied count/summary/Clear stays accurate and Clear affects only the current filters. Hidden filter never silently hides its active state. |
| Existing doors | Medical entry/counts/return, List date window/sort/export, shared date editor, ordinary/confirmed medical/OIL saves, saved-row reveal and directional Undo remain reachable and accurate. |
| Interaction/layout | 390x844,390x568,1440x900 plus intermediate/zoom/long labels: readable header, seven columns, no horizontal loss,44px targets, scrollable short overlays. Real mouse range, touch hold/chip drag, keyboard Select dates and genuine next tap remain working. |
| Popup layers | Outside-down, inside-origin drag-out, toggle, invalid2/2, valid2/4, Cancel, two capture orders, Escape focus/layer order, normal outside calendar action, role withdrawal and member absence. No draft write on dismissal. |
| Downstream | Working schedule/Board use unchanged availability logic; issued snapshots/sign-offs/pending, planning notes/pucks, historical valid one-day till text, persisted cutoffs and exports do not acquire display-derived data. |

Retain FULL tier for this continuing build. Add focused failing-first model/integration/browser cases for the corrected contracts; then run the affected runtime walk on a new frozen bundle and required final gates under the shared-PC lock. Root Sol combines its mechanical findings with this isolated assessment before implementation. Prior gate counts and pictures remain historical evidence, not proof of the expanded code.

## Pre-source artifact and approval boundary

Private synthetic native HTML/CSS lives under the task evidence root `inputs-sans/header-counts-proposal/`, with phone collapsed/expanded, short-phone and desktop captures. It uses incumbent tokens/wing and clearly marks synthetic design examples; no production assets, tests, bundle or live state are edited. Astra authors and renders but does **not** inspect/approve its own plan or pictures; Sol personally opens/challenges them before building. No owner picture acceptance is inferred.

After Sol's scoped implementation, independently walk and inspect actual app pictures, retaining genuine and harness failures separately. R1/R2 remain immutable; there is no third Astra code inspection. **OWED: Claude's final independent code read after reset on `codex/inputs-sans-calendar`, before main.** No main merge or merging PR is authorized.
