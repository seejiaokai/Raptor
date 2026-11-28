Read-only review of the exported copy of **`cdb605dff`**, covering the three changes and the test correction named in the brief. I did not open HANDOFF.md, handpass sheets or another reader’s report. No files were written, and no app or tests were run.

**Result: one medium-severity finding, confirmed-by-reading.** The standby exemptions and shortened reason appear correctly connected. An untimed sim still misses the existing warning for a filed offer that excludes that sim.

**1. A sim with no start time silently loses its SANS mismatch warning — confirmed-by-reading**

**Failure:** A SANS man files **Fly only**. An admin adds an OFT row without times and puts him in a seat or an extra place.

- Before placement, the crew list correctly strikes him with “SANS — not offering OFT”.
- Placement can show that reason in its passing note.
- Afterwards, the warning list contains no SANS mismatch warning, and this placement produces no SANS amber mark.
- Typing the start time makes the warning appear. Clearing the start time removes it again, although his offer still excludes OFT.

This also affects AMT and a row with an end time but no start time. It affects front and rear seats, passengers and extras.

The broken contract is the shared SANS checking described by **D2564** and the existing rule that planning against a filed offer raises an advisory. **D2585** now correctly exposes the mismatch before placement. This finding concerns **a wrong event in an existing filing**, not the deferred nothing-filed warning under D2579 or the deferred replacement wording.

**Cause:**

- [events.ts:447](/D:/raptor-work/c182-r1/raptor-port/src/engine/events.ts:447) collects a sim’s people into `day.blank` when its start time is missing. This includes passengers and extras.
- [validate.ts:1537](/D:/raptor-work/c182-r1/raptor-port/src/engine/validate.ts:1537) builds SANS checks from flights and timed sim events only. It never includes those blank sim entries.
- [avail.ts:668](/D:/raptor-work/c182-r1/raptor-port/src/engine/avail.ts:668) correctly checks the untimed seat, creating the disagreement.
- The agreement test at [sans-planned-r5.test.ts:111](/D:/raptor-work/c182-r1/raptor-port/src/leavewar/sans-planned-r5.test.ts:111) includes `b.blank` in a hand-built set described as what the warning list reads. The actual warning check does not read it, so this assertion cannot catch the omission.

**Exact fix:**

1. Add a failing test that files an incompatible offer, places the person on an untimed sim, and checks the actual result of `validate()`.
2. In the SANS check collection, also visit `day.blank`. Include only entries whose keys match the existing OFT/AMT expression.
3. Pass their person, domain, label and key through the existing SANS check. Represent their unknown window with `NaN` values, consistent with the existing `noWin` guard. Do not use `null` without adjusting that guard: global `isFinite(null)` is true.
4. Preserve the current outcomes: `not-offered` warns; `none` remains silent; an offered event with unknown hours produces no window warning. Cancelled rows and standby rows remain excluded.
5. Add actual warning-result assertions alongside the collection-agreement tests. Do not treat a test-created union of collections as proof that the validator consumes them.
6. Run the case through both schedule screens: place the man, type a start time, clear it, change the offer to include the sim, then undo. Check the warning line and its amber mark after each action.

The following case can be added to the existing `sans-standby-sim.test.ts` fixture, using its imports and helpers. **It was not run here.** Reading predicts that the final length assertion receives zero.

```ts
it('an untimed OFT extra warns when his filing offers Fly only', () => {
  const rows = DAYS[0].sims.oft
  const ri = rows.length
  rows.push({
    label: 'CHECK',
    str: '',
    end: '',
    p: '',
    w: '',
    more: [ID],
  })
  fileSans({ f: true })

  const result = validate()
  const rowKey = `s:0.oft.${ri}`

  expect(slotBar(ID, `${rowKey}.x0`))
    .toBe('SANS — not offering OFT')

  const hits = result.all.filter((w: any) =>
    w.code === 'SANS_AVAIL' &&
    (w.who || []).includes(ID) &&
    w.key === rowKey
  )

  expect(hits).toHaveLength(1)
  expect(hits[0].sev).toBe('adv')
  expect(hits[0].msg).toContain('not offering OFT')
})
```

Repeat with AMT; front, rear and passenger places; and `end: '13:00'` with the start still blank. Controls should cover no filing, the correct sim offered with limited hours, a cancelled row and a non-SANS person.

**Coverage and explicit negatives**

These are findings from reading, not claims that the screens were exercised.

| Object or surface | Required sign and working action | Read result |
|---|---|---|
| Sim extras and passengers | Selecting `.xN`, `.pax.N` or `.+` applies the same SANS event check as its seats; tap and drag reach the actual destination | I checked these paths and found no missing crew-list check. The warning omission is finding 1. |
| Standby duty desks and their extras | No SANS availability strike, warning or reminder; ordinary duty restrictions still apply | I checked `d:` routing and found nothing. These keys have no SANS domain, and the reminder does not collect desks. |
| Saved standby templates | SC, AVALON and BB retain their exemptions when newly created from a template | I checked the template writer and found nothing. It writes the same kind, standalone and exemption markers as the built-in writer. |
| SC MAIN/SPARE, AVALON and BB cockpit seats | No SANS strike or warning and no reminder contribution, with or without times, typed B/R or a row’s Flies tick | I checked the three classifications and found nothing. Newly created supported standby rows are covered by all three. |
| Aircraft overflow | An additional person must have a supported place and gesture before it can be assessed | Aircraft rows support two cockpit seats; their writer expressly excludes extra bodies. I found no reachable aircraft `.xN` door requiring another SANS exemption. Desk and sim extras are covered separately. |
| Ordinary flights | Continue checking Fly, including no filing and wrong-event offers before times | I checked the ordinary-flight path and found nothing. It does not acquire the standby exemption. |
| Edit Schedule and Scheduler Board crew lists | Strike, reason and “N free” agree when a place is selected | I checked both callers and found nothing. Both use the shared palette; its SANS count and displayed reason use the same eligibility answer. |
| Crew list with nothing selected | Nothing-filed strike remains, with no printed reason line; hover wording uses the shortened sentence | I checked this separate path and found nothing. D2420’s hidden reason line is preserved. |
| Drag hover | Explain the target’s restriction before release, accounting for the place being left | I checked the caller and found nothing. It supplies the destination and source place to the shared check. |
| Drop and tap-to-plan | Place the person, then report newly raised warnings or the shared reason | I checked both paths and found nothing beyond finding 1. Append actions query the place actually filled. |
| Green eligibility rings | No green ring on a barred place; standby eligibility remains subject to other rules | I checked the reader and cache invalidation and found nothing. The armed place keeps its own ring. Actual paint remains unverified. |
| Member’s reminder | Count uncancelled ordinary flight/sim participation, including extras; omit standby, desks, ground and all hands | I checked the collector and reminder reader and found nothing. Mixed qualifying participation still counts the day once. |
| Reminder wording and tap | Keep “Tap to file for availability”; open the SANS calendar at the first relevant day | I checked both and found nothing. The scheduler’s shortened sentence is separate from the member’s instruction. |
| Future SANS posting | Ordinary before the date; SANS checks from that date; shortened ahead-of-date reason | I checked the dated-status readers and found nothing. |
| Week and year changes | Slot day, filing date and reminder date refer to the same day | I checked the loaded-week date construction and saved-week reminder labels and found nothing. Saved-week reminder labels explicitly include their year. |

**Other rules and action orders checked**

- **Earlier checks remain effective.** I checked qualifications, duplicate placement, SC restrictions and leave/medical precedence and found nothing removed by the new SANS branches.
- **Later checks remain reachable.** Where the SANS check finds no reason, it falls through to the existing activity, overlap and cross-day checks. Returning a SANS reason first follows the timed path’s existing precedence.
- **One time typed:** I checked both directions and found no new picker inconsistency. Start-only sims use the configured assumed duration; end-only sims have no usable window. Finding 1 concerns the latter’s missing warning collection.
- **Cancellation:** I checked formation, aircraft and sim cancellation and found nothing wrong in reminder exclusion. A selected cancelled seat can still strike the person, expressly accepted by D2568.
- **Roles and people:** The reviewed planning doors require an admin scheduler. Non-SANS people bypass the SANS gate; placeholders retain their separate rules; pilot/WSO/ground-crew restrictions still precede SANS availability.
- **Other displays:** The SANS availability cards show filings, while day workload counts and ALL AVAIL answer different questions. I found no requirement in this change to replace those readers with the narrower reminder collector.
- **Read-only views and overlays:** I checked the relevant rendering gates and found no new planning door introduced by these changes. Phone wrapping, warning-ring visibility and interaction through overlays require a running-app check.

**Ranked host checks still needed — needs-a-run**

| Priority | Setup and action | Expected result | Observation that disproves correctness |
|---|---|---|---|
| 1 | Fly-only filing; untimed OFT/AMT extra or passenger; place the man, add then clear START | Wrong-event strike and persistent mismatch warning throughout | Warning missing before START or disappearing when START is cleared — finding 1 |
| 2 | Newly saved templates for all three standby kinds; MAIN and SPARE; blank and timed; activate by B, R and one Flies tick | No SANS reason, warning or reminder contribution | Any SANS result caused solely by standby participation |
| 3 | OFT and AMT: front, rear, passenger, extra and append targets; no filing, wrong event, correct event with 08:00–10:00 offered | No filing/wrong event strikes immediately; correct event stays SANS-clear while untimed | Any place differs from its sibling seats |
| 4 | Correct sim offered 08:00–10:00; try no times, END-only 13:00, START-only 13:00, then complete times | No hour comparison without START; start-only uses assumed duration | Picker and warning compare different usable windows |
| 5 | Select a man, select a seat, drag, drop and tap-to-plan on both screens; then change/delete his filing and undo | Reasons, free count and green rings refresh together | A stale count/ring or different reason for the same destination |
| 6 | Nothing filed; add ordinary flight and sim participation beside standby; cancel/remove qualifying rows one at a time | Reminder keeps the day until its last qualifying row goes | Standby alone keeps the day, or removing one row hides another qualifying row |
| 7 | Future SANS date at a week boundary, then across 31 December/1 January; leave and reopen the saved week | Correct day/status and shortened scheduler sentence; member’s filing instruction retained | Wrong year/day, early SANS treatment, stale reminder or old instruction |
| 8 | Long callsign and ahead-of-date reason, warning chip, armed ring and open crew drawer on phone and desktop | Reason remains readable; target remains reachable; marks remain distinguishable | Clipping, covered controls or an eligibility ring masking the armed/warning state |

The existing tests were inspected, not executed. The principal coverage weakness is the collection-agreement assertion described in finding 1; it can pass without the warning check reading the same collection.

**Walk:** NOT DONE — the brief prohibits running the app.  
**Changes:** None. No commits or pushes.  
**Rulings:** none this session.

The host’s next step is to run the reproduction case, fix the missing warning input if reproduced, and check the affected placement paths on both schedule screens.