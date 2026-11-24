# Code read of round 4 of the words pass (D2521) — Astra, 24 Nov 26

(Saved by the host, chat 170, unchanged below the line. **Who:** Astra — `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only -C D:/rw4/read-copy` (the command: `raptor-port/.tmp/wr4-astra.sh`, kept only on his PC; its log `D:/rw4/reads/astra.log`). **What it read:** an exported copy of commit
`68ab6d1db` at `D:/rw4/read-copy` (`git archive`, no pictures), from which the round's evidence sheet, the two scenario
lists, the scenario and walk briefs, the walkers' reports and scripts and the branch's handoff block were taken out; the
brief `2026-11-24-words-r4-read-brief.md` as `BRIEF.md`, the change as `FIX-DIFF.patch`. **Blind to:** the walk, the
scenario lists and the other two readers — all three started together at 18:45 and wrote outside the checkout. **Its
report file was last written at 19:04.** Each claim's disposition: the evidence sheet
`raptor-port/docs/handpass/2026-11-24-words-r4-build.md` §13.)

---

Five confirmed findings: two introduced here and three already present on main. No file changed.

The first four tests below fit inside the existing round-four describe block in src/ui/bellnotices.test.tsx.

1. A real rename disappears — NEW.

State: change Training titled “Training · briefing” into Meeting titled “Meeting · briefing”.
Actual: only “Training changed to Meeting”. Expected: that plus “renamed — was Training · briefing”.
Cause: src/state/notices.ts, ownName/common. Both titles lose their kind prefix before comparison, leaving identical suffixes.
Fix: compare normalized title words and Attach “To” values directly; never strip a kind prefix from a typed title. Retain the explicit rule for a title swallowed by its new kind.

    it('reports a real rename alongside its kind change', async () => {
      await boot(); file([RANGER], WED, { title: 'Training · briefing' }); clear();
      const r = rec('Training · briefing');
      expect(commitInput(r, { ...draftOf(r), type: 'Meeting', title: 'Meeting · briefing' }, [RANGER])).toBe(true);
      expect(noticesFor(RANGER)[0]!.what.map(p => p.k)).toEqual(['kind', 'title']);
    });

2. Old saved lines acquire new wording — NEW.

State: read an old saved line containing when, title and rmk parts.
Before: “Now Thu 16 Jul, Renamed — was Training”.
After: “Now Thu 16 Jul, renamed — was Training, and 1 more change”.
Cause: src/state/notices.ts, noticeWords/firstTwo. Every ordinary line receives the new renderer, with no distinction between old and new records.
Fix: add an optional wording-version field to Notice and NoticeRec; stamp newly written ordinary lines; use the old rendering for unmarked records. Preserve that field through storage and replay without rewriting old records. Mark new-wording test fixtures explicitly.

    it('preserves an old three-part line', () => {
      const n = line([{ k: 'when', a: '2026-07-16' }, { k: 'title', was: 'Training' }, { k: 'rmk' }], { wording: undefined });
      expect(noticeWords(n).what).toBe('Now Thu 16 Jul, Renamed — was Training');
    });

3. Changing kind invents a time change — ALREADY ON MAIN; still affects new saves.

Steps: file AM LL, then change only its kind to Training.
Actual: “Now 00:00–12:00, LL changed to Training”, although its hours remain identical.
The reverse transition likewise invents “Now LL (AM)”. These phantom parts also consume a displayed position and inflate the new change count.
Cause: src/state/notices.ts, hours/common. The time comparison includes the half label, which the editor adds or removes according to kind.
Fix: compare effective all-day/start/end values independently of presentation labels; create a when part only for a real date/time change; then choose its half-day wording.

    it('does not report unchanged hours as changed', async () => {
      await boot();
      expect(commitInput(null, LEAVE({ allday: false, half: 'am', sTime: '00:00', eTime: '12:00' }), [RANGER])).toBe(true); clear();
      expect(commitInput(leave(), { ...draftOf(leave()), type: 'Training', half: '' }, [RANGER])).toBe(true);
      expect(noticeWords(noticesFor(RANGER)[0]!).what).toBe('LL changed to Training');
    });

4. Moving an existing half day omits AM/PM — ALREADY ON MAIN; the new promise remains incomplete.

Steps: file AM LL on Wednesday, then move it to Thursday without changing its hours.
Actual: “Now Thu 16 Jul”. Expected: “Now Thu 16 Jul (AM)”. PM and multi-day halves have the same omission.
Cause: src/state/notices.ts, common. It saves h only when time changes, even when dates change.
Fix: after deciding that a when part is needed, derive h from the resulting input whenever it is a half day, including date-only moves. Keep all-day handling unchanged.

    it('keeps the half when only its date moves', async () => {
      await boot();
      expect(commitInput(null, LEAVE({ allday: false, half: 'am', sTime: '00:00', eTime: '12:00' }), [RANGER])).toBe(true); clear();
      expect(commitInput(leave(), { ...draftOf(leave()), start: '2026-07-16', end: '2026-07-16' }, [RANGER])).toBe(true);
      expect(noticeWords(noticesFor(RANGER)[0]!).what).toBe('Now Thu 16 Jul (AM)');
    });

5. The crew-list route misses the same-seat message — ALREADY ON MAIN; missed by this change.

Steps: drag a person from the crew list onto the duty seat they already occupy.
Actual: applyDrop returns true, nothing moves, and no same-seat message appears. Dragging the seated puck back onto that identical seat correctly names the person.
Cause: src/ui/drag.ts, applyDrop. The new message is confined to the matching source-slot branch; the roster branch reaches the successful-drop ending.
Fix: after resolving and validating the target, detect an existing occupant matching the dragged person before rowPut or setSlotVal. Finish through the same named no-op refusal, without running the successful-write ending.
Paste into src/ui/drag.test.tsx:

    it('names a crew-list puck dropped onto its own seat', async () => {
      const seat = $$('#eWeek .seat[data-slot^="d:"][data-drag]').find(s => !!slotVal(s.dataset.slot!))!;
      const id = slotVal(seat.dataset.slot!); toasts = [];
      await act(async () => { setDrag({ kind: 'roster', id }); applyDrop(seat, 0, 0); });
      expect(toasts).toEqual([`${PEOPLE[id].cs} — already in that seat`]);
    });

Explicit negatives:
- Actual saves accepted the new kind parts. Storage, reload, Undo and Redo preserved the tested records.
- I found no additional field-loss issue in shared-input split filtering, Leave War remark-only filtering, read marks, bell navigation, or the special Leave War/posting renderers.
- Fresh-line counts, “You”, callsigns, kind capitals and the replaced-bid tail behaved correctly in the cases checked. Single-part legacy title/time records still read correctly.
- All 104 allowed look-ahead settings produced the expected wording.
- The publish-message joins checked retained the missing-period warning without doubled full stops. The changed refusal and hover text did not change permission conditions.
- I withdraw the earlier “oops” window-screen claim: native time fields discard that text. The direct normalization branch was confirmed, but that user-facing failure was not.

Tidiness, reported only: the missing-period sentence remains duplicated between publishing and validation; no newly dead helper was found; ownName and hours misleadingly mix stored meaning with display wording. Older drag-walk assertions also retain the previous capitalized message.

Evidence: reproductions used the real modules in memory, including save, storage, replay and drop paths. Main comparisons used the supplied patch reversed in memory. No full test suite or browser walk was run; the snippets above are proposed regression tests.

Rulings: none this session.