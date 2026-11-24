**Round 5 Astra review: 0 new findings. All three round 4 findings are closed on the supplied copy.**

I reviewed the changes, the claimed fixes and the three previous reports. I did not read the handoff or either other round 5 reader’s work. I changed no application code or documents.

| Previous finding | Verdict | Evidence |
|---|---|---|
| SEC-R4-1 — writing another person’s reminder-read record | **Closed** | The ownership check now runs before administrator permissions can allow the write. Checks cover user, restore and projection paths. A projection is also refused when targeting the signed-in person’s record. |
| R4-O1 — next-week preview stays stale after a home-unit move | **Closed** | The preview now includes home-unit changes in its refresh check. The tested move removes Hex’s Tuesday 21 July Meeting from 142; Undo restores it. An ordinary repaint retains the same preview. |
| Astra R4 F1 — changing weeks reparses saved weeks | **Closed** | Previously read weeks are retained across navigation. Relevant edits still refresh the reminder. Tests cover newly worked weeks, Undo/Redo, unit changes, posting dates and year boundaries. |

**Activity scope**

The reminder now counts live flying seats and OFT/AMT seats, including passengers and additional occupants. It excludes cancelled activities, cancelled aircraft, unactivated spare seats, ground activities, duties and all-hands rows. Independent checks cover SC, AVALON and BB spare activation through briefing, rally and aircraft activation.

“One definition” is not literally one shared function for all three consumers. The reminder has a new collector that reuses the existing spare-seat exemption rule. Tests compare its results with activity collection and the armed-seat check. That is a reasonable implementation within the restrictions on changing the engine, with these qualifications:

- The warning list retains its older behavior: it is silent when someone has filed no availability at all. Its warnings concern availability that was filed but does not cover the activity.
- Blank-time simulator entries appear in a separate collection that the warning list does not consume.
- Cancelled activities leave the reminder, while the prospective armed-seat check can still strike a person when examining a cancelled place.

These are differences between what the screens show; the tests do not establish identical visible output everywhere.

**Permissions and saved data**

The reported cross-person write is fixed. One older distinction remains: an administrator can write their **own** reminder-read record through the account-update command. The later member permission check requires the dedicated reminder-read command. I reproduced the administrator behavior through the actual command path; it predates this change and does not reopen SEC-R4-1.

Remote and seed exemptions remain intentional. The permission checks here do not constitute a production, multi-device synchronization test.

The changes introduce no new persistent record type or migration. Reminder collection reads existing data, and marking a reminder read uses the existing write path. I found no removal of stored user data or history.

**R1 and R2 judgments**

- **R1 — blank times:** Reasonable interpretation of D2564, not an additional owner ruling. A person can occupy a flying or simulator seat before its times are entered. For example, on Wednesday 15 July, placing Hex on Saturday 18 July’s OFT with blank times makes Saturday appear in his reminder before the timed availability check can operate. If confirmation is sought, the concrete question is whether that early reminder is intended. I do not treat it as a defect.
- **R2 — cancellation:** Reasonable interpretation, not an additional owner ruling. If Hex’s only Saturday flight or simulator activity is cancelled, Saturday leaves his reminder. Arming the cancelled place can still strike him for having no filing, under the existing prospective picker behavior. This is an explicit distinction, not a new finding.

**Checks and limits**

All **296 focused checks passed**: 264 existing checks across ten files, plus 32 independent checks added only under `raptor-port/src/r5-astra/`. No unresolved failing reproduction remains.

The independent checks cover spare activation, blank-time simulators, passenger cancellation, Undo/Redo, newly worked weeks, posting boundaries, unit switching, saved-week reuse and reminder-read permissions.

With 40 saved weeks already read, the measured reminder query after changing weeks retained all 40 expected days, performed **zero saved-week parses**, and took approximately **0.70 ms**. This measures the reminder query, not the complete page turn or browser rendering.

I found no weakened protection in the adjusted existing tests. The removed Meeting reminders reflect the new activity scope; the corresponding busy-row checks remain.

This was a code and focused automated-test review. I did not perform a browser walk, inspect screenshots, run the full unit suite, build for production or run the full shipping checks. This report does not replace those checks or authorize merging.

**Tidiness, for the host to file**

The cache explanation still recounts several superseded approaches before stating the current rule. A preview comment still says the reminder uses the broader preview-change signature, and a test reference points to the wrong regression file. Shortening the history and correcting those references would make the current behavior easier to maintain. I left them unchanged; none is a behavioral finding.

Rulings: none this session.

**0 new findings. No corrective fix is requested by this review.**