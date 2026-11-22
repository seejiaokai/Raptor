# Scenario-design brief — D2338: the crew-list note on a look-ahead SANS day, and the man's bell line on his SANS posting's date

**For:** Astra (the standing reviewer). **Job:** design the scenarios for a walk of the RUNNING app — hunt for what is
MISSING. You did not build this and the build is not in this copy (it is being built now; you are reading the app as it
stands just before it). Read only; change no file. State each scenario in your output the moment it is settled, so a
stopped run keeps it. You cannot run anything: where a case needs running, name the exact input and the host will run it.
**Written:** 22–23 Nov 26, chat 147. The branch's handoff block and the builder's brief are taken out of this copy on
purpose — do not look for them.

## The promise — the owner's rulings (full rows: `grep -h '^| D2338 ' .claude/decisions-full/*.md` and the same for each)
- **D2338 (22 Nov 26, his "Yes"):** "A man whose SANS posting has not run yet, seen on a day after its date, shows in that
  day's crew list with a note that no availability is filed and that it can be filed from the posting's date, naming where
  (Inputs, SANS); on that date his bell tells him the planned days with nothing filed, a tap opening the SANS calendar.
  … From the posting's date the crew list's note is the usual one for a SANS man with nothing filed, gone once filed. The
  agent's readings, told to him: the bell line goes to the man himself only, not before the posting's date (he cannot
  file before it, D2327), one line naming the days; a line in the notifications register (D1151)." His own example: "in
  15 Jul when the admin see the 18 Jul schedule. Should it say no availability filed, await for 17 Jul for SANs
  availability to be filed".
- **D2339:** built without a drawing first; he looks at it built.
- **D2329:** a SANS posting set ahead is read by the day looked at — an ordinary man before its date; SANS from it, counted
  by ALL AVAIL only on a day a scheduler has put him on our programme, his times clear.
- **D2327 / D2313** (`people-accounts.md`): SANS counts from its date on every screen; who may be FILED for SANS
  availability goes by who is SANS today.
- **D1151:** the notifications register lists every bell line. **D1693, D1699, D1710:** every bell line is taken back by the
  undo of what made it; a read line keeps its words struck "taken back". **D1696:** the "off the manpower" line is worked
  out from the posting as it stands. **D2194:** no bell line about one squadron's business reaches another's people.
- What is built today, for orientation: `raptor-port/src/ui/palette-html.ts` (the crew list's struck "SANS — no
  availability filed for today"), `src/engine/avail.ts sansGate` (a seat armed greys him with the same words),
  `src/ui/html.ts` (the Available panel), `src/engine/people.ts setSansAhead`, `src/leavewar/sync.ts sansAheadOf`,
  `availableFor`, the derived bell lines (`setDerivedNotices`, the "off the manpower" line), `src/state/notices.ts`,
  `raptor-port/docs/notifications-register.md`, the SANS calendar (`src/ui/SansCal.tsx`, `SansDay.tsx`).

## Exclusions — not findings (D56, D785)
- A problem living only in data already stored (the store is demo data, cleared before the database step) is not a
  finding, unless new data would be hurt too. A scheduler is always an admin: no case of a scheduler who is not one.

## What to give back
1. **Scenarios**, numbered, each: the state (named people from the demo — Hex is `rocky`, a WSO; the demo week is Mon
   13 Jul 26; "today" is set by the app's test clock), the presses in the app's own words, and the EXPECTED result on
   screen at both sizes (desktop 1536, iPhone 402) — what words show where, what the bell shows, what a tap opens. Cover:
   the note's three states (before the date looking ahead; from the date with nothing filed; filed); every screen that
   prints the struck note (crew list on Edit Schedule and the Scheduler Board, an armed seat, the Available panel); the
   bell line's life (before the date: none; on the date: one line, his only — never an admin's, never another squadron's;
   which days it names; a day filed → that day leaves the line or the line goes; a day he is taken off; the posting moved
   later or earlier, given another outcome, taken back by "Undo post out" — before and after he read it; an archive or
   delete; a reload; the clock moving past midnight with the page open); what the tap opens on a desktop and a phone and
   whether he may file there that day; ALL AVAIL's count unchanged by all of this.
2. **What is MISSING** — states the promise covers that a builder is likely to forget; readings of D2338 you think
   wrong (each: supported / contradicted / the owner's to decide).
3. Keep it to what a walker can press; mark any case only a unit test can reach.
