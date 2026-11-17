# Astra’s red-team report

**The design needs the four HIGH findings resolved before it is ready to build.** They affect OIL, published records and changes of place.

This was a read-only design review. I read the brief, design, rulings, relevant app contracts and backlog, and inspected representative pictures from all five rounds. The round-one pictures were available, but its named pictures page was absent. I changed no files and ran no build or application tests.

## Across the app

| Area | How it should behave across schedules |
|---|---|
| Flying times, briefs, turns and debriefs | Judge the actual formation once, using the settings of the schedule containing it, D2109. Showing that formation elsewhere must not create another flight, brief or clash. |
| Qualifications, currencies, CAT pairing, IRT and AAR | Read the person’s one qualification record. Judge the actual crew pairing and instructor placement on the formation. Borrowing someone does not give the borrowing scheduler permission to alter his qualifications. |
| Rest, long days and consecutive working days | Read the person’s work across schedules and week boundaries. D2123 settles which crew-rest limit applies. The different-place exclusion needs narrowing: finding 5. |
| Sims, ground events, duties and special waves | Combine relevant commitments across schedules. Preserve the existing distinctions between ordinary flying, standby, SC MAIN/SPARE, AVALON/BB and their desks; sharing a schedule must not remove their exceptions. |
| Resources and availability | Cross-check shared areas and sims at the same place; keep aircraft pools with their owning squadron, D2108. Read leave, medical restrictions and SANS offers wherever the person is planned. Findings 3 and 6 cover location and overseas duty. |
| ALL AVAIL | Keep D2097’s proposed absence of a clash between two ALL AVAIL events. Named commitments still affect availability. The proposed primary-squadron crowd does not cover detachments: finding 7. |
| Late inputs, counts and Logic | Keep the original filing history and the existing distinction between an input-window edit and a scheduler’s row edit. Counts remain separate by line-owning squadron, D2096. A shared line uses its host schedule’s Logic; issued checks retain their published settings. The late-input deadline owner remains unanswered below. |
| Publishing and OIL | The host signs and publishes the shared wave; its amendments belong to the host’s day. A borrowed person’s changed away-time can make his home day pending. Findings 1 and 4 address combined earnings and issued versions. |
| Insights | The proposed split is sound: personal hours follow the person; squadron totals follow the owning lines. Count a shared formation once, regardless of how many schedules show it. Preserve the existing distinction between Insights’ live settings and published OIL. |
| Leave War | Detachment overseas duty counts away at home. A borrowed person retains one leave and OIL record. Whether the generated Attach row reduces manning is already explicitly open; the recommendation remains **no** for work at home. Transfer details follow below. |
| Tracker | Keep one student record and the existing course progress. A sortie on 149 may support the same student’s record, but being scheduled or published must not silently become a completed or passed syllabus item. |
| Undo, bell and administration | Undo remains the author’s own change and must refuse to overwrite later work, including the other squadron’s. Posting retains its separate Undo. Notices must identify the affected schedule and open it with the recipient’s actual rights. Cross-squadron administration needs the access decision below. |
| Print, export and database | Printed badges must survive without the lighter background. Historical output must reproduce its issued contents. The shared-wave editing mark is already covered by the proposal; the outstanding platform trial must also prove safe changes involving both a person’s location and schedule assignments. |

## Findings

### 1. Work on two schedules needs one combined OIL calculation

**Weight: HIGH**

**Concrete failure:** On Saturday 28 November, Saber works for 142 from 08:00–10:00 and for 149 from 11:00–13:00. Both publish. Crediting each schedule separately gives two half-days, although his five-hour day earns only half a day.

Taking only the larger credit also fails: 08:00–09:00 with 142 and 16:00–17:00 with 149 makes a nine-hour day, worth a full day.

**Cause:** Round three’s OIL explanation says the other squadron’s publication earns credit on the person’s own OIL. It does not define how contributions combine. D592 requires first start to last end, including gaps; D142 requires the latest published truth; D1579 requires one earned record per person and date.

**Fix:**

1. Collect the person’s work from each contributing schedule’s latest issued version.
2. Count each actual event once. Reference lines and generated Attach rows contribute nothing extra.
3. Calculate one first-start-to-last-end span and one automatic credit.
4. When 149 amends Saber off its work, recalculate using whatever published work remains on 142. Do not erase the whole credit.
5. Keep manual awards separate and additive, D82, and retain the overnight earning-day rule, D42.

There is also a product choice where full-day thresholds differ. **Recommend the person’s primary squadron on the earning date supplies the threshold**, kept with the published calculation. The alternative is one common threshold for the community. The amount must never depend on which squadron publishes last.

### 2. Closing a detachment can trap an incorrect published record

**Weight: HIGH**

**Concrete failure:** On Friday 27 November, 249 already has Saturday’s programme published, with Saber earning OIL. Its admin presses **Close detachment** early. Everyone returns home, but Saturday’s programme becomes read-only. The planned work cannot be amended away, so its issued record and OIL remain wrong.

The same restriction prevents correcting an error discovered in an earlier issued day.

**Cause:** D2103 makes the detachment’s schedules read-only on closure. D2135 ends the people’s overseas duty. Neither provides a route to reconcile future published work or correct an issued record afterward. That conflicts with D142’s latest-published-record rule.

**Fix:**

1. Before closing, list affected future working plans and published days.
2. Require future published work to be cancelled or corrected through its ordinary publication process; preserve every previous issue.
3. Close the detachment to new planning.
4. Give an authorised admin a correction-only route for its retained days, with ordinary amendments and history.

The alternative is to refuse closure until every affected day is settled, but that still needs a later correction route. **Recommend closure stops new planning, rather than permanently stopping corrections.**

Also resolve the closing-day boundary: “back from today” and an overseas duty ending inclusively “today” must not both govern availability.

### 3. A location change can invalidate assignments that were legal when made

**Weight: HIGH**

**Concrete failure:** 142 has published Saber on Monday 23 November at home. He then files overseas duty naming 249 for that day. His detachment membership takes effect immediately, but his existing home seat was added before the wrong-place refusal could apply.

A similar failure occurs when the master admin moves all of 149 to another place while its programme still includes borrowed 142 personnel.

**Cause:** D2092 refuses **planning** a person at the wrong place. D2101 and D2119 change where people are. The design does not say what happens to assignments already present, including saved plans and assignments in another scheduler’s open day.

Checking only the record being saved is insufficient: one person can save the overseas duty while another saves a seat, each having read the previous location.

**Fix:**

1. Apply the location check to membership changes, cancellations, group inputs, place moves, transfers, Undo and restored plans—not only to picking a person.
2. Show all assignments the proposed move makes invalid.
3. Choose between refusing the move until those assignments are cleared, or applying the move and removing incompatible assignments from working plans together. **Recommend the latter for future work**, with clear notice of what is removed.
4. Keep issued versions unchanged; their affected working days become pending for their owning publishers.
5. Refuse overlapping assignments to different detachments.
6. Prove that simultaneous location and planning changes cannot both succeed using incompatible information.

For a day already worked at the old place, the owner must choose between retaining the one-place-per-day rule and allowing a timed handover. **Recommend retaining the whole-day rule initially and refusing a contradictory same-day move.** Keep dated location history automatically; changing today’s place must not relabel yesterday.

### 4. One shared working line is not enough to identify what was published

**Weight: HIGH**

**Concrete failure:** 149 publishes Monday’s shared wave as ORIG. Then 142 publishes its own Monday, showing that wave. Later, 149 changes RU and publishes AL1.

If 142’s historical ORIG resolves the shared line to its current contents, opening or exporting that old issue now shows AL1’s RU. The historical record has changed without a new 142 issue.

A related case occurs before AL1: the shared working line has changed, but D2124’s three-state rule still says **“Published by 149.”**

**Cause:** The design correctly requires one shared working record and, under D2106, no home-day pending change for the foreign wave. It does not distinguish that live relationship from the app’s frozen issued versions. D2124 distinguishes published from unpublished hosts, but not an issued host with further changes waiting.

**Fix:**

1. Keep one shared working line.
2. Each host publication keeps the exact shared contents and settings it issued.
3. A historical home issue records exactly which host issue it displayed—or that the foreign lines were still unpublished.
4. Current View-only Sched may show each host’s latest issued work; a historical view or export must reproduce the selected historical issue.
5. On working views, distinguish the last issued contents from changes waiting for the host’s next amendment. A newly added line must not appear covered by the host’s earlier publication.
6. Keep amendment numbering and signatures with the host’s day. Do not introduce an extra home amendment merely to acknowledge the host’s publication.

### 5. “Different places are never checked” drops rest and working-day history

**Weight: MEDIUM**

**Concrete failure:** Saber finishes work with 149 at home at 23:00 on Monday 23 November. He joins 249 at another place on Tuesday and is planned at 07:00. With a twelve-hour requirement, there must be a rest warning. Filtering out the home schedule because its place differs loses the previous night’s work.

Moving after six consecutive working days can similarly reset the apparent run.

**Cause:** D2092 excludes checks between different places. The design’s “checks follow the man” explanation still limits the reading to schedules **at his place**. D2123 chooses the later line’s crew-rest setting but does not repair the missing history.

**Fix:**

1. Limit shared-resource comparisons by place.
2. Read rest, long-day and consecutive-working-day history by person across place changes.
3. Apply the later line’s crew-rest setting, D2123, retaining the existing rules for which activities count.
4. Compare actual elapsed time across time zones, including overnight work and week boundaries.
5. Show the warning on the later task and the existing backward/forward trace on the relevant earlier work.

This narrows D2092 for personal history; it does not introduce resource clashes between separate bases.

### 6. The input that puts someone on a detachment also marks him unavailable there

**Weight: MEDIUM**

**Concrete failure:** Saber files overseas duty for 249 from 23–27 November. On Tuesday, 249’s scheduler selects him for a flight. If the proposed “inputs follow the person” rule uses overseas duty unchanged, the flight receives an overseas-duty clash and he disappears from available crew or ALL AVAIL at the very detachment he joined.

Likewise, feeding a generated **Attach · 149** row back into the combined checks can make Saber’s 149 flight clash with its own home-facing absence.

**Cause:** D2101 gives overseas duty a new role as detachment membership. The existing availability rules treat it as absence. D2098 adds a derived Attach display, but the design does not define its distinction from a separately filed commitment.

**Fix:**

1. At home, the named-detachment overseas duty remains an absence.
2. At the named detachment, that same input establishes presence; it is not an absence from its own programme.
3. Overseas duty with **None** remains an ordinary absence.
4. Other leave, medical restrictions and commitments still apply at the destination.
5. The generated Attach row displays the source assignment and opens it. It must not become a second commitment, an editable independent input or another OIL source.

### 7. Primary-squadron-only ALL AVAIL leaves a detachment without its own crowd

**Weight: MEDIUM**

**Concrete failure:** Six members of 149 join 249 for 23–27 November. On Tuesday, 249’s scheduler adds an ALL AVAIL ground event. Their primary squadron remains 149. A literal implementation of the proposed primary-squadron-only count therefore gives 249 no people, although all six are present and free.

**Cause:** D2097’s proposed crowd is explicitly based on primary squadron. D2087 retains that primary during a detachment, while D2088 gives the detachment its own manpower and schedule. The proposal does not join those rules.

**Fix:**

1. For a home schedule, start with its primary members who are present there on that date.
2. For a detachment, start with its assigned members on that date.
3. Apply the existing exclusions for overlapping named work, absence, Personnel and SANS eligibility.
4. Read commitments on the other schedules too.
5. Preserve the proposed absence of a clash between two unnamed ALL AVAIL events. Do not present the count as confirmed attendance.
6. Freeze the crowd used for an issued earning event, and use finding 1’s single personal-day OIL calculation.

This corrects the proposed crowd definition; it does not reopen the owner’s lean about overlapping ALL AVAIL events.

## Questions the design never answers

- **Which clock defines “today”, the transfer date and closing day?** Recommend one declared community date boundary, with overseas task times interpreted in their stated local time zones.
- **Does extending a detachment extend its members’ overseas duty?** Recommend showing whose duty ends earlier and offering an explicit group extension, preserving individual early returns.
- **Which squadron’s cut-off judges a shared input’s LATE mark?** Recommend its filing squadron’s cut-off, retained with its filing history; borrowing and transfer must not restamp it.
- **Whose limit judges a combined long day or consecutive-day run when settings differ?** Recommend each affected schedule checks the complete personal history against its own applicable settings.
- **How does an admin authorised for both squadrons reach the other’s Quals, Inputs, Leave War and Tracker under D2132?** Recommend a separate, explicit administration context on those pages; members retain their primary-squadron view.
- **What access follows a detachment assignment or an Attach link?** Recommend assigned members can read their detachment programme; an Attach link grants only the necessary source-event view unless wider access was separately given.
- **Does D2114 permit editing an entire shared input?** Recommend checking permission over everyone and every day the edit changes, because D739/D740 make a row edit change the original input.
- **Who can undo or correct a closed detachment?** Recommend its authorised parent admins, preserving later changes and issuing notices for any return or closure taken back.
- **What does a borrowed sortie “counting on the Tracker” mean?** Recommend availability as supporting evidence for the existing student record, with completion and grading still entered through the Tracker.

## D2136 — Transfer to another squadron

**Recommend transferring the existing person, not creating a second person or copying his records.** The destination is an existing squadron in the same community, excluding his present squadron and detachments.

For Saber transferring from 142 to 149 on **Tuesday 24 November**, the proposed rule should say plainly: **142 through Monday; 149 from Tuesday**, with no missing day and no day counted in both manpower totals.

| Subject | Recommended treatment |
|---|---|
| Identity and callsign | Keep the same person and account. Enforce the community-wide callsign rule, D288. A duplicate must be resolved explicitly, never silently renamed or merged. |
| Inputs and medical records | Carry open and future inputs, original authorship, filing times, decisions and medical history. Do not create duplicate inputs. Moving one person must not move everyone in a group input. |
| Future seats | Keep existing assignments where location still permits them. Becoming a member of 149 does not turn a 142-owned flight into a 149 flight. Recheck incompatible locations through finding 3. |
| Qualifications and currencies | Carry the same records and dates. Destination admins maintain them from the transfer date. Previously issued checks retain what they went out with. |
| Tracker course | Carry enrolment, progress, grades, attempts and supporting records. Keep the existing syllabus relationship; any move to a different course is an explicit mapped change, never an automatic reset or pass. |
| Leave and balances | Carry the person’s balances, awards, earned OIL and leave records once. Preserve future approved leave and its original approval: D1541 allows advance approval and allows the receiving squadron to refuse it afterward. |
| Pending bids | Retain their dates, status and filing history. Route outstanding decisions to the receiving squadron for its dates; do not silently approve, refuse or discard them because its bidding stage differs. |
| Months and manning | Keep past months attributed to the membership then in force. Count the destination from the transfer date. Different Leave War periods must not duplicate balances or leave earned OIL without a home, D1579. |
| SANS | Carry the person’s actual SANS status and dated availability unless an explicit change accompanies the transfer. A normal squadron transfer must not itself make him SANS. |
| Account and roles | Keep sign-in continuity. Recommend destination member access by default, with destination scheduling/admin rights granted explicitly. Source administrative rights do not travel automatically; retained source access is a separate choice. |
| Published history and Insights | Keep original line ownership, signatures, issued versions and historical squadron attribution. Personal hours follow Saber; historical squadron totals do not move with him. |

**Refuse or ask before saving** if the destination is invalid, the transfer overlaps another posting, an active detachment leaves his destination place unclear, or the move would leave a squadron without an administrator. Show affected future work and leave; do not treat the transfer as permission to discard either.

**Run the dated transfer once.** Every device must agree on membership for the date even if the scheduled flow runs late. Repeated app opens or flow retries must not duplicate stints, credits or bell notices.

**Undo belongs in the posting sheet, D350.** Before the date, it cancels the planned transfer. After the transfer, it reverses the membership change without replacing the person’s whole record. If 149 has since changed his leave, qualifications or course, those changes remain; a conflicting reversal must explain what needs resolving. Tell both squadrons’ admins, and mark the original notice taken back in the existing manner.

**Rulings:** None recorded. This was a read-only review; the proposed choices above remain recommendations.

