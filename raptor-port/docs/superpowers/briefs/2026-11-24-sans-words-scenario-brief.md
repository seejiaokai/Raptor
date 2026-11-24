# Scenario-design brief — the new SANS words and their rules (D2388, D2390, D2391, D2394, D2420, D2421)

**This is an exported copy of the branch at the commit BEFORE the build: the code here does NOT yet do what is below.**
`HANDOFF.md` here is one line on purpose; do not look for a builder's account.

**For:** Astra (the standing reviewer). **Job:** design the scenarios for a walk of the RUNNING app once this is built,
and hunt for what is MISSING: the states a builder is likely to forget. You are not building it. Read only; change no
file. State each scenario in your output the moment it is settled, so a stopped run keeps it. You cannot run anything.
**Written:** 24 Nov 26, chat 156.

## What will change (the exact words are his; do not improve them)
Full rows: `grep -h '^| D2394 |' .claude/decisions-full/*.md` (also D2388, D2390, D2391, D2420, D2421, D2340, D2341, D2338,
D1693, D1699, D1710). Pages: `.claude/rules/decisions/inputs.md`, `.claude/rules/decisions/scheduler.md` §Crew and pucks.
The drawings' words: `raptor-port/docs/mock/2026-11-24-sans-words/index.html`.

1. **A run of days starting too early.** A run of SANS availability days that starts before his SANS date saves the days
   from his date on, and says: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." /
   "…because Ranger is SANS from Fri 17 Jul." For every way of picking days. A run with no SANS day is refused as built; a
   non-SANS day in the run's MIDDLE is refused as built; the final save's check is unchanged.
2. **The reminder.** "You're SANS from Fri 17 Jul." over "You're planned on Sat 18, Mon 20, Thu 23 Jul with nothing filed.
   Tap to file for availability."
3. **2a:** a newly planned day after he read the reminder lights his bell again; a day dropping off never does.
4. **2b:** every SANS man planned with nothing filed gets the reminder, a man with no SANS date ahead titled "Your SANS
   availability is needed." over the same body.
5. **The take-back lines (D2391), each only when something filed was hidden or the reminder had been read:**
   A date moved later, something filed: "Your SANS date moved to Sat 18 Jul. · Saber" / "You're active until then, so the
   SANS availability you filed for Fri 17 Jul is hidden. It comes back if you're SANS that day again."
   B posting undone, something filed: "You're no longer posted out as SANS. · Saber" / "You're active again, so the SANS
   availability you filed for Fri 17, Sat 18 Jul is hidden. It comes back if you're SANS those days again."
   C Quals SANS unticked (a NEW line): "You're no longer SANS. · Saber" / B's body.
   D date moved EARLIER: the title alone "Your SANS date moved to Thu 16 Jul. · Saber", the live reminder staying.
   E another outcome: "You're no longer posted out as SANS. · Saber" / "The SANS availability you filed for Fri 17, Sat 18
   Jul is hidden while you're not SANS those days."
   The read reminder is no longer struck through "taken back"; it simply goes (narrows D1699 for this line).
6. **Q4:** on his own days before the date the greyed "+ Commitment" says "You're SANS from Fri 17 Jul."; a member who is
   not SANS keeps "SANS aircrew add their availability here."; no admin version (an admin's button is never grey).
7. **Q6:** a line's "hidden" sentence goes once it is no longer true (the man is SANS those days again), the whole line
   if nothing is left.
8. **Q10 (a shared offer only; a one-man filing keeps today's words):** "Hex is SANS from Fri 24 Jul. Take him out of this
   offer to add earlier days."
9. **D2420:** the crew list gets NO new reason line.

Code, for orientation: `raptor-port/src/state/notices.ts`, `src/leavewar/sansunfiled.ts`, `src/leavewar/sync.ts`,
`src/ui/inputedit.tsx` (`sansRefusal`), `src/ui/sansadd.ts`, `src/ui/SansCal.tsx`, `src/ui/SansDay.tsx`, `src/ui/topbits.tsx`,
`src/state/perms.ts`.

## Exclusions — not findings (D56, D785)
A problem living only in data already stored is not a finding unless new data would be hurt too. A scheduler is always
an admin: no case of a scheduler who is not one. Do not raise the wording itself: it is his.

## What to give back
1. **Scenarios**, numbered S1…, each: the state (named people from the demo; the demo week is Mon 13 Jul 26; "today" is set
   by the browser's clock; who signs in: admin `ad` (Saber), member `us` (Ranger), or a member an admin adds), the presses
   in the app's own words, and the EXPECTED result on screen at both sizes (desktop 1536, iPhone 402). At most 24, ordered
   by how likely each is to find a fault. Cover especially: sequences (date moved later then back; undone then redone by
   Undo; moved twice before he reads; read then moved; several postings); each line with one filed day and several; a man
   who files, reads and is moved; a person who is both posted and ticked; what the person pressing sees versus what the
   person affected sees; two people's bells; the line after a reload and after a sign-out.
2. **What is MISSING:** states these rules cover that a builder is likely to forget, and any place two of the rules above
   contradict (each: the rule's words, the case, the owner's to decide or not).
3. Keep it to what a walker can press; mark any case only a unit test can reach.
