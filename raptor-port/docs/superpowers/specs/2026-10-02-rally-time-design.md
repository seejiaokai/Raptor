# Rally time — D497–D498 design discussion, 2 Oct 26

Status: planning and interactive mock-up only. No app build, final design approval or replacement of existing timing rules. Planning branch: `claude/planning-filing-3-oct`. The completed Discard marks build is unchanged.

## Owner's direction

**D497:** support rally only; in-time with rally immediately after and no separate clock; and separate in-time/rally clocks. Where those stages exist, the intended order is in-time, rally, brief, take-off, landing. Rally supplies reporting start when there is no in-time. Allow notes such as WX/NOTAMs and Rally (Reaper + Saber) in a neat box. Map the affected calculations and show a mock-up first. The suggested hard block is a proposal, not approved enforcement.

**D498:** assess the simpler approach: keep the existing box, tentatively rename it **In-time / Rally**, and use the earliest applicable reporting instruction there as the flying wave's reporting start. A person's earlier qualifying scheduled event may start their day sooner. This does not mean choosing every arbitrary number in prose, moving an entire wave to one person's meeting, or comparing midnight clock numbers without dates. It does not withdraw D497's sequence requirement.

**D495:** WORKSPAN-NEGATIVE remains the next batch. Assess this related proposal alongside it; do not silently replace the fix or make it wait for an unresolved large feature. The former fallback/advisory questions are superseded as QUESTIONS by this discussion, not answered or approved. Production flying events currently supply `report = intime ?? step`; substituting the configured normal report lead is not preservation of that current fallback.

## Proposed smallest UI

Keep the compact existing lines and add button; rename their heading/button to In-time / Rally. Show the selected reporting time and the affected formation(s), so interpretation is visible. One operative clock per line; an activity label supports chronology. Remarks follow `|` in the mock-up and do not supply another reporting clock or attendance selection. An editor can provide this separator automatically rather than require manual punctuation; that choice is unapproved.

Examples: `08:00 RALLY | WX + NOTAMs`; `08:00 IN TIME | WX + NOTAMs` with `RALLY AFTER IN | Reaper + Saber`; or separate `08:00 IN TIME` and `08:15 RALLY` lines. Preserve accepted 24-hour spellings and old saved text; do not rewrite existing schedules or reinterpret ambiguous remarks silently. A bare reporting line cannot invent a labelled rally stage. Notes support is required; final grammar and scope are not yet approved.

Calculation proposal: first resolve which reporting instructions apply to each formation/crew, then compare actual instants and take the earliest applicable instruction. Include an earlier qualifying event only for the person attending it and only in the calculations whose standing definitions already include that kind of event. An invalid entered time is not an absent time and must not silently become a fallback or zero-hour day. Keep earlier-event participation distinct from flying-wave reporting.

## Impact map — readers to inspect and verify, not a list of files that must change

| Surface or calculation | Current source seam and design concern |
|---|---|
| Clock reading and scope | `src/engine/events.ts` `intimeTime`, `intimeMap`, `seatIntime`: first valid clock per line; earliest unscoped line; last matching formation-specific line; specific overrides whole-wave fallback. Earliest-applicable changes these semantics. Remarks can currently match callsigns. Resolve scope before minimum; resolve day before comparison. |
| Flying events and chronology | `events.ts` `collectEvents`: typed/suggested brief, step/report, dekit/debrief, formation/seat applicability and midnight interpretation. No universal strict increase: D49 allows equal take-off/landing with its existing warning. Missing stages, SC B-as-in-time, spare/AVALON/BB and late-show rules retain existing meanings pending explicit choices. |
| Hours, long days and Insights | `src/engine/validate.ts` `workSpan`, long-day validation; `src/engine/insights.ts`: shared hours measure, earliest qualifying scheduled event per person. Personal Inputs are not silently added to workSpan. D478 latest-issued-copy selection stands; a pending timing edit does not leak into issued Insights. D482 Logic changes and D186 frozen issued brief remain distinct. |
| Crew rest and cross-week checks | `validate.ts` nominal/instructed and late-show checks; `src/engine/weekctx.ts`: earlier qualifying timed Inputs matter here under existing definitions; Sunday/Monday and previous-evening checks use the same resolved reporting instant. |
| Availability and wave windows | `src/engine/avail.ts`, `events.ts` `waveInTime`, `waveWindows`: SANS/report-to-land-plus-dekit, wave bands, available crews and conflict windows must not choose a different reporting clock. Ordinary busy/absence windows remain distinct. |
| Earned leave | `src/engine/oil.ts`: uses the nominal reporting lead, not the current in-time reader. Preserve OIL; changing it would be a separate explicit product choice. |
| Editing and views | `src/ui/html.ts`, `board.ts`, `interactions.ts`, `textedit.ts`: compact heading, add/edit/delete, wave header, phone and issued/read-only renderers; displayed report interpretation must match engine readers. |
| Publication and retained copies | `src/engine/publish.ts`, `restore.ts`: real first-publication/amendment/signing commands, pending comparisons and issued copies. Enforcement must exist in the command path, not only a disabled button. Keeping string storage avoids adding a schema solely for rally. Old text meaning still requires care. |
| Save, copy, Undo and history | `drafts.ts`, `src/engine/editlog.ts`, `src/undo/describe.ts`, `src/ui/histbubble.ts`: saved-plan/load/copy/templates, undo/redo, existing history cell targets and formation renames/removal. Structured-target metadata was an earlier proposal; it is not required or approved by the simpler direction. |
| Exports and print | `src/ui/export.ts`, `src/ui/printpdf.ts`: current flattened schedule rows omit existing in-time lines. Decide/fix inclusion if this design should print/export reporting instructions; do not assume renaming alone adds them. |

## Independent planning and Sol challenge

Astra's revised complete response and independent mock review are in `docs/superpowers/plans/2026-10-02-rally-time-review.md`. Its earlier structured-editor proposal remains unapproved and is preserved verbatim in `docs/superpowers/plans/2026-10-02-rally-time-astra-original-draft.md`; the source map above is a separately labelled host summary. Final Astra source read confirmed the spelling fix and found three incorrect module locations in this note; the host corrected them after verifying the paths exist.

Sol's independent challenge: (1) the safest minimum is over applicable instructions on resolved dates, not all clocks/numbers; (2) changing specific-line override behaviour needs the owner’s example answered; (3) the earlier personal event must not move every crew member's report, alter which personal Inputs count as work, or silently change OIL; (4) a text-based minimum cannot enforce labelled stage order without recognising stages; (5) command publication, frozen copies and negative-hours handling are still real-app work; the prototype cannot prove them; (6) no new schema, target-ID implementation or bulk migration is justified merely by the rename; (7) equality and missing-time behaviour retain standing rules until settled.

## Mock-up and proportional check

Interactive conversation source: `C:/Users/User/.codex/visualizations/2026/10/02/01a0fab0-9850-7130-8da0-de797da4a3ba/rally-reporting.html`. It is a contained proposal for one whole wave, not an app screenshot or an approved visual design. The earlier `rally-time.html` compares an elaborate editor and labelled text; D498's simpler mock is the current recommendation.

Retained pictures/results: `docs/img/rally-time-proposal/{rally-reporting-desktop.png,rally-reporting-phone.png,rally-reporting-dark.png,rally-reporting-checks.json}`. One lightweight Chromium run checked the three arrangements, row-order independence, ignored note clocks, person-specific earlier event, invalid clocks and reversed sequence, explicit previous-day comparison, collapse/reopen, desktop/phone/320px overflow and dark appearance. Zero JavaScript errors. Host opened all three final pictures.

Astra found `INTIME` was accepted but not normalised to the in-time activity in the prototype; Sol fixed all accepted spellings and tested each. An initial verification used the renderer's old snapshot; the renderer was restarted and the same assertions passed against the final source. No assertion was weakened. Astra's follow-up source read is recorded with its limits.

Prototype assumptions only: publish-block demonstration, same-minute preflight acceptance, one whole-wave group, explicit previous/next day keywords, unavailable reporting display for an invalid mock draft. The real app permits schedules without an entered report time today; the mock's empty-input rejection does not approve making a report mandatory. It does not test actual crew rest, SANS, saved data, actual published copies, formation overrides, flight exceptions or all cross-day configurations. No live app source, data or tests were changed and no full app gates were rerun. A real timing-rule build needs the FULL check under standing rules, sized for its affected surfaces.

## First question round — awaiting answers

1. One reporting clock per line, with an activity label and remarks kept separate? **Recommend yes.** This keeps clocks mentioned in notes from changing reporting.
2. Whole-wave in-time 08:00 plus Reaper rally 09:00: if both apply to Reaper, does reporting remain 08:00? **Recommend yes.** An earlier applicable instruction remains required; specific later text must not silently overwrite it.
3. Invalid timing order: allow editing and saving the draft, but stop publication with the exact incorrect pair explained? **Recommend yes.** Publication scope must cover real commands after approval.
4. Overnight time explicitly says previous/next day where needed, with the interpreted sequence shown? **Recommend yes.** Never guess a date just to make a bad daytime sequence pass.

Next round, after those answers: omitted labelled stages, no-report fallback and negative-hours behaviour, equal preflight timestamps under existing minimum brief rules, scope/attendance presentation and SC/late-show exceptions. Do not ask equal take-off/landing again: D49 already governs it.

OWED: Claude's independent plan read after Monday 5 Oct 26, 19:00. Owner design choices and visual approval remain pending. No app build or merge authorized by this design discussion.
