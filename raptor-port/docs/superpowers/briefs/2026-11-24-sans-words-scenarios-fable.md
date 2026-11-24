# Scenarios — the new SANS words and their rules (D2388, D2390, D2391, D2394, D2420, D2421)

Designer: a fresh reader (Fable), working alone from the copy of the code before the build, the rulings' full rows, the
drawing page of 24 Nov 26, and the host's five readings and the "one run" wording given with the task. Nothing was run.

## Common set-up (unless a scenario says otherwise)

- Clock set to **Mon 13 Jul 26**, the demo week loaded, demo data fresh.
- **Saber** = admin `ad`. **Ranger** = member `us`. **Hex** = a second man, given a sign-in by Saber where his bell is looked at.
- "Post Ranger out as SANS from Fri 17 Jul" = Saber, Leave War, Ranger's sheet, ⋯ → Post out, outcome SANS, last day
  Thu 16 Jul, Post out. "Move the date" / "another outcome" / "Undo post out (PO)" are on that same Post out sheet.
- "Plan Ranger on a day" = Saber puts Ranger on a line of that day's programme on Edit Schedule.
- "Files" = the SANS calendar's "+ Commitment", Fly ticked, Save.
- "Reads the reminder" = opens the bell and marks the line read (tap it, or "Mark all read"), so it draws faded.
- Every scenario is looked at on **desktop 1536 and iPhone 402**: the words whole, wrapped not cut, nothing spilling out of
  the bell's panel or a toast; a picture of each bell state named.
- "The reminder" = "You're SANS from Fri 17 Jul." over "You're planned on … with nothing filed. Tap to file for availability."
- In every scenario also check: **Saber's own bell gains no SANS line** for what he pressed, and no other admin's does.

---

## S1 — Moved twice before he reads, then moved back (one line, latest title, only days hidden now)

State: Ranger posted SANS from Fri 17. Ranger files Fri 17 and Sat 18 (two one-day filings). Ranger has not opened his bell.
Presses: Saber moves the date to Sat 18. Then to Mon 20. Ranger looks (do not mark read). Then Saber moves it back to Fri 17. Ranger looks again.
Expected:
- After the first move: one unread line, "Your SANS date moved to Sat 18 Jul. · Saber" / "You're active until then, so the
  SANS availability you filed for Fri 17 Jul is hidden. It comes back if you're SANS that day again."
- After the second: still **one** line, not two: "Your SANS date moved to Mon 20 Jul. · Saber" / "…you filed for Fri 17,
  Sat 18 Jul is hidden. It comes back if you're SANS those days again." (plural: "those days").
- After the move back to Fri 17: both filings show again on the SANS calendar and count; the "hidden" sentence is gone;
  as no reminder stood read, **no line is left at all** and the bell is not lit. No leftover "Your SANS date moved to
  Mon 20 Jul." title, no struck "taken back" line.
- SANS calendar and the crew list's "free" count for Fri 17 and Sat 18 follow each step (hidden = not counted).

## S2 — The read reminder relights only for a newly planned DATE (dates, not counts), across a reload and a sign-out

State: Ranger posted SANS from Fri 17, planned Sat 18 and Mon 20, nothing filed. Ranger reads the reminder.
Presses, Ranger checking his bell after each:
1. Saber takes Ranger off Mon 20 and plans him on Tue 21 (the count stays two).
2. Ranger reads it again. Saber takes Ranger off Tue 21.
3. Saber plans Ranger on Tue 21 again.
4. Ranger reads. Ranger reloads the page; then signs out and in; then signs in on the other size.
Expected: 1 — bell lit, the one reminder unread, naming "Sat 18, Tue 21 Jul". 2 — the line shrinks to Sat 18, stays
read, bell not lit. 3 — lit again (a day dropped and planned again relights). 4 — stays read through reload, sign-out and
on the other device; never two reminder lines; no age printed on the line before the date.

## S3 — Read reminder, date moved later with nothing filed: the reminder must not relight by itself

State: Ranger posted SANS from Fri 17, planned Sat 18 and Mon 20, nothing filed, reminder read.
Presses: Saber moves the date to Sat 18. Ranger opens his bell. Then Saber moves it to Sun 19.
Expected:
- After the first move: the reminder stays (same two days), now titled "You're SANS from Sat 18 Jul.", **still read**
  (no new date was planned); one new unread line, the title alone, "Your SANS date moved to Sat 18 Jul. · Saber" (no
  "hidden" sentence: nothing was filed). No struck "taken back" line.
- After the second: Sat 18 leaves the reminder (a day dropping off never relights); still one take-back line, its title
  now "Your SANS date moved to Sun 19 Jul. · Saber"; the reminder still read.
- Tapping the reminder opens the SANS calendar on its first day; note what tapping the title-alone line opens (see Missing 6).

## S4 — A man both posted and ticked: Undo post out while the Quals tick stands

State: Hex is ticked SANS on Quals (SANS today). Saber also posts him SANS from Fri 17. Hex planned Tue 14 and Sat 18;
Hex files Sat 18 only; Hex reads his reminder (which names Tue 14).
Presses: Saber presses Undo post out (PO). Hex looks. Then Saber unticks Hex on Quals. Hex looks.
Expected:
- After Undo post out: Hex is still SANS by his tick, so **nothing is hidden**: Sat 18's filing still shows and counts.
  No line may say "You're active again" or "is hidden". His reminder stands, titled "Your SANS availability is needed."
  (no date ahead now), still read. At most the title alone "You're no longer posted out as SANS. · Saber" (the reminder
  stood and was read). Record exactly what shows (Missing 1).
- After the untick: the reminder goes (not struck); one line "You're no longer SANS. · Saber" / "You're active again, so
  the SANS availability you filed for Sat 18 Jul is hidden. It comes back if you're SANS that day again." One line in
  all, not one for each change.

## S5 — A run that starts too early, every way of picking it

State: Ranger posted SANS from Fri 17, signed in as Ranger.
Presses, each from a clean state (delete the filing between):
a. Desktop: drag Thu 16 → Sat 18, Save.
b. iPhone: finger-drag (held press) Thu 16 → Sat 18, Save.
c. Desktop keys: Shift+arrows from Thu 16 to Sat 18, Enter, Save.
d. Open Fri 17, "+ Commitment", then in the window set the first date back to Thu 16, Save.
e. Drag backwards, Sat 18 → Thu 16.
Expected, each: one filing Fri 17 – Sat 18 is saved; the note reads "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out
because you're SANS from Fri 17 Jul."; Thu 16 shows nothing for him; the note is readable whole on the phone and stays
long enough to read; the window closes. For d, if the build refuses instead of trimming, record its words (Missing 3).
Then: top-bar Undo ("Undo — Ranger's SANS availability") removes the Fri–Sat filing; Redo brings back Fri–Sat only, never Thu 16.

## S6 — Several days left out are said as one run; an admin filing; one day saved

State: Ranger posted SANS from Fri 17. Signed in as Saber.
Presses: a. On the SANS calendar drag Mon 13 → Sat 18, choose Ranger in the window, Save. b. Drag Mon 13 → Fri 17, Ranger, Save.
c. As Ranger: drag Wed 15 → Fri 17, Save.
Expected: a — "Saved Fri 17 – Sat 18 Jul. Mon 13 – Thu 16 Jul were left out because Ranger is SANS from Fri 17 Jul."
(one run, "were", the admin's "Ranger is"). b — one day saved: "Saved Fri 17 Jul. Mon 13 – Thu 16 Jul were left out
because Ranger is SANS from Fri 17 Jul." c — "Saved Fri 17 Jul. Wed 15 – Thu 16 Jul were left out because you're SANS from
Fri 17 Jul." Each saved filing shows "By Saber" only where Saber placed it. Note: in a the window may open on another SANS
man first (the first on the roster); the trim must follow the man chosen at Save, not the man the window opened on.

## S7 — A new shared offer is refused, never trimmed; the one-man words stay

State: Ranger posted SANS from Fri 17; Hex ticked SANS (SANS today). Saber signed in.
Presses: a. Drag Thu 16 → Sat 18, switch to several people, pick Ranger and Hex, Save. b. Take Ranger out, Save.
c. New: drag Mon 13 → Wed 15, one man, Ranger, Save.
Expected: a — nothing saves, the window stays open with "Ranger is SANS from Fri 17 Jul. Take him out of this offer to
add earlier days." (no "Saved … left out" note, no half-saved offer for Hex). b — saves for Hex alone, Thu 16 – Sat 18.
c — a run with no SANS day of his is refused as built: "Ranger is SANS from Fri 17 Jul: file SANS availability for days
from then".

## S8 — An existing shared offer stretched earlier (the drawing's own case)

State: Ranger and Hex share one offer on Sat 25 Jul (both SANS that day: Ranger posted from Fri 17, Hex posted from Fri 24).
Presses: Saber opens the offer and moves its first day back to Thu 23; Save. Then back to Thu 16; Save. Then takes Hex out and saves with Thu 23.
Expected: both saves refused, "Hex is SANS from Fri 24 Jul. Take him out of this offer to add earlier days." (Hex is
named first while Thu 23 is fine for Ranger; at Thu 16 either man may be named, but the words are the shared form). With
Hex out: saves Thu 23 – Sat 25 for Ranger. Ranger, as a member in the offer, sees the same words if he tries the same stretch.

## S9 — 2b: a man ticked SANS on Quals with no date ahead gets the reminder; four days counted

State: Hex not SANS, planned Thu 16, Sat 18, Mon 20, Tue 21. Hex has a sign-in.
Presses: Saber ticks Hex SANS on Quals. Hex opens his bell. Hex files Thu 16. Hex reads. Saber plans Hex on Wed 22.
Expected: an unread line "Your SANS availability is needed." over "You're planned on Thu 16, Sat 18, Mon 20 Jul and 1
more with nothing filed. Tap to file for availability."; after filing, "Sat 18, Mon 20, Tue 21 Jul" (no "and 0 more");
after Wed 22 is planned the bell lights again. Tap opens the SANS calendar on the first unfiled day. Then: Hex ticks
himself off SANS on Quals (D149 allows it): his reminder goes and he gets **no** line (he did it himself).

## S10 — C: Quals untick by an admin, one filed day and several, read and unread

State: Hex ticked SANS, planned Sat 18 and Mon 20.
Presses, each from a clean state: a. Hex files Sat 18; reminder unread; Saber unticks. b. Hex files Fri 17 and Sat 18; reads
the reminder; Saber unticks. c. Nothing filed, reminder unread; Saber unticks. d. Nothing filed, reminder read; Saber unticks.
Expected: a — "You're no longer SANS. · Saber" / "You're active again, so the SANS availability you filed for Sat 18 Jul
is hidden. It comes back if you're SANS that day again." b — same title, "…for Fri 17, Sat 18 Jul is hidden. It comes
back if you're SANS those days again."; the read reminder simply gone, no strike. c — nothing at all, bell not lit.
d — the title alone "You're no longer SANS. · Saber". Then in b Saber ticks Hex again: the filings show again, the
"hidden" sentence goes and the line with it; record whether the returning reminder is unread (Missing 2).

## S11 — B then the posting made again: partial return, the sentence shrinking

State: Ranger posted SANS from Fri 17; files Fri 17 and Sat 18; reminder not involved.
Presses: Saber presses Undo post out (PO). Ranger reads the line. Saber posts Ranger out as SANS again, from **Sat 18**. Ranger looks. Then Saber moves it to Fri 17.
Expected: after Undo: "You're no longer posted out as SANS. · Saber" / "You're active again, so the SANS availability you
filed for Fri 17, Sat 18 Jul is hidden. It comes back if you're SANS those days again." After posting from Sat 18: Sat 18
shows again; the line names only Fri 17 and turns singular ("that day"); it must not relight for shrinking; record its
title, which can no longer truthfully say "no longer posted out as SANS" (Missing 4). After the move to Fri 17: the whole
line gone (read or not), both filings showing and counting.

## S12 — D: date moved EARLIER, the reminder read and unread

State: Ranger posted SANS from Fri 17, planned Thu 16, Sat 18, Mon 20, nothing filed.
Presses: a. Ranger reads the reminder (Sat 18, Mon 20); Saber moves the date to Thu 16. b. Clean state, reminder unread; same move.
Expected: a — the reminder stays and is brought up to date: "You're SANS from Thu 16 Jul." / "You're planned on Thu 16,
Sat 18, Mon 20 Jul …", **unread** (Thu 16 is a newly named date); beside it the title alone "Your SANS date moved to
Thu 16 Jul. · Saber". No strike, no "hidden". b — only the reminder, updated, unread; no take-back line. Both: Ranger's
greyed "+ Commitment" on Thu 16 is now live; on Wed 15 it reads "You're SANS from Thu 16 Jul."

## S13 — E: another outcome, then back to SANS

State: Ranger posted SANS from Fri 17; files Fri 17 and Sat 18; reads his reminder for Mon 20 (planned, unfiled).
Presses: Saber changes the posting's outcome to Overseas (same date). Ranger looks. Saber changes it back to SANS.
Expected: the reminder gone, no strike; one line "You're no longer posted out as SANS. · Saber" / "The SANS availability
you filed for Fri 17, Sat 18 Jul is hidden while you're not SANS those days." (no "active", no "It comes back"). With one
filed day it reads "that day". Back to SANS: filings show, the line goes, the reminder for Mon 20 returns (Missing 2 for
read or unread). The admins' own "Posted out" lines elsewhere still use the struck "taken back · Saber" look as before.

## S14 — Q4: the greyed "+ Commitment" words, three people

State: Ranger posted SANS from Fri 17. A member who is not SANS (any) has a sign-in.
Presses: Ranger opens Thu 16, then Fri 17, on the SANS calendar. The non-SANS member opens Thu 16. Saber opens Thu 16.
Then Saber moves Ranger's date to Mon 20 and Ranger opens Fri 17 again without reloading.
Expected: Ranger, Thu 16: grey button, "You're SANS from Fri 17 Jul."; Fri 17: live button. Non-SANS member: "SANS
aircrew add their availability here." Saber: never grey, no hint. After the move: Ranger's Fri 17 is grey, "You're SANS
from Mon 20 Jul.", and his days before Mon 20 fade. Phone: the hint fits the opened day's sheet at both heights.

## S15 — The date arrives (reading 5): the title changes and nothing relights

State: Ranger posted SANS from Fri 17, planned Sat 18 and Mon 20, reminder read on Mon 13.
Presses: set the clock to Fri 17 Jul, reload, sign in as Ranger. Then clock Sun 19, reload.
Expected: Fri 17 — title "Your SANS availability is needed." over the same body, still **read**, bell not lit by the
title change. Sun 19 — Sat 18 has gone by and leaves the line (no relight); "Mon 20 Jul" only. Then Saber (clock Sun 19)
moves the run posting later to Tue 21: A's title "Your SANS date moved to Tue 21 Jul. · Saber" (the reminder was read);
Mon 20 leaves the reminder; the reminder's title is "You're SANS from Tue 21 Jul." again.

## S16 — Deleting a filing never relights; filing everything then a new day does

State: Ranger posted SANS from Fri 17, planned Sat 18 and Mon 20. Ranger files Sat 18, reads the reminder (Mon 20).
Presses: 1. Ranger deletes his Sat 18 filing. 2. Saber deletes it instead (clean repeat). 3. Ranger files both days (line gone); Saber plans him on Thu 23.
Expected: 1 and 2 — Sat 18 returns to the line, the line stays read, bell not lit. 3 — the reminder comes back unread
naming Thu 23 only. Top-bar Undo of the delete: the line shrinks again, no relight either way.

## S17 — Two men, two bells, one admin's evening

State: Ranger posted SANS from Fri 17 and Hex posted SANS from Fri 24, each with one filed day (Fri 17; Fri 24), each planned once more, unfiled.
Presses: Saber moves Ranger's date to Sat 18, presses Undo post out (PO) on Hex. Each man signs in on the same browser in turn (sign out between), then on the phone.
Expected: Ranger sees only his A line; Hex only his B line ("…for Fri 24 Jul is hidden. It comes back if you're SANS
that day again."); neither sees the other's; Saber sees neither. Reading on one device is read on the other.
A third admin's bell: none of these lines.

## S18 — The top bar's Undo and a posting; the member's own view after

State: as S1's first step (date moved Fri 17 → Sat 18, Ranger's Fri 17 filing hidden, his line unread).
Presses: Saber looks at the top-bar Undo. Ranger files Sat 18 – Sun 19, then presses Undo, then Redo.
Expected: Saber's Undo does not take back the move (greyed, saying why, as built); Ranger's bell unchanged by it.
Ranger's own Undo and Redo of his filing change only his reminder's days; his take-back line stays as it was, unread
until he reads it; no second take-back line.

## S19 — Unread everything: a take-back with nothing filed says nothing

State: Ranger posted SANS from Fri 17, planned Sat 18, nothing filed, bell never opened.
Presses: Saber moves the date later (Mon 20); then earlier (Thu 16); then another outcome; then back to SANS; then Undo post out.
Expected: after each step no take-back line at all; the reminder present only while he is SANS-posted and planned
unfiled, unread; at the end an empty SANS section and a bell not lit. No struck line anywhere.

## S20 — A cut run next to a no-fly day, and a month's end

State: Ranger posted SANS from Fri 17; Saber sets Fri 17 as No fly. A second case: a man posted SANS from Sat 1 Aug.
Presses: a. Ranger drags Thu 16 → Fri 17, Save. b. The second man (or Saber for him) drags Thu 30 Jul → Sun 2 Aug, Save.
Expected: a — the saved single day behaves as a one-day filing on a no-fly day does (Fly not offered or refused there,
OFT/AMT allowed); never a Fly offer saved on a no-fly day; the note "Saved Fri 17 Jul. Thu 16 Jul was left out…".
b — "Saved Sat 1 – Sun 2 Aug. Thu 30 – Fri 31 Jul were left out because … is SANS from Sat 1 Aug." (each month named
once, correctly).

## S21 — A run with a not-SANS day in its middle is refused as built

State: Hex was SANS until Wed 15 (his SANS days kept), then posted SANS again from Sat 18.
Presses: Hex (or Saber for him) drags Tue 14 → Sun 19, Save. Then Thu 16 → Sun 19.
Expected: first — refused whole in today's words, no trim, no split into two filings. Second — starts before his
(second) SANS date with SANS days after: saved Sat 18 – Sun 19, "Thu 16 – Fri 17 Jul were left out because … SANS from
Sat 18 Jul." (if this state cannot be made by pressing, a unit test's case).

## S22 — Many hidden days on a phone; days going by

State: Ranger posted SANS from Fri 17; files Fri 17, Sat 18, Mon 20, Tue 21 and Fri 31 Jul – Sat 1 Aug.
Presses: Saber presses Undo post out (PO). Ranger opens the bell at 402 wide. Then clock Sun 19, reload.
Expected: the body names the first three days and counts the rest ("Fri 17, Sat 18, Mon 20 Jul and 3 more"), wraps
inside the panel, the title and "· Saber" on one readable line. On Sun 19 record whether the days gone by leave the
sentence (Missing 5); it must never name a past day as "comes back".

## S23 — The line after "Mark all read", and what its tap opens

State: S10 b's line (C, two hidden days) and a second line of another kind in Hex's bell.
Presses: "Mark all read"; reload; tap the line.
Expected: reads and stays read; a tap opens the SANS calendar on the first hidden day (Fri 17), where nothing of his
shows; no error, no window opening on a day he cannot file for.

## S24 — The crew list gains nothing (D2420), and the counts follow the hiding

State: Ranger posted SANS from Fri 17, planned Sat 18, nothing filed; then files Sat 18; then Saber moves the date to Mon 20.
Presses: Saber opens Edit Schedule's crew list on Sat 18 at each step, desktop and phone, with and without a seat picked.
Expected: nothing filed — Ranger struck in SANS Avail, "0 free", **no new reason line** in the list; filed — counted
free; after the move — Sat 18 is no SANS day of his: he reads as an ordinary man that day and the hidden filing counts
nowhere (SANS calendar's F count, the crew list, the SANS day's list).

---

## What is MISSING or contradicts

1. **Posted and ticked together.** "B: You're no longer posted out as SANS / You're active again" and "C: You're no
   longer SANS / You're active again" each assume the other source of SANS is absent. Undo post out on a ticked man
   leaves him SANS (nothing hidden, "active again" false); an untick on a man posted from a date ahead leaves him "SANS
   from Fri 17" (C's title false, only his days before the date hidden). The owner's to decide the words; until then the
   safe build says only what is true (title alone or nothing). S4.
2. **A reminder that went and came back** (tick off then on; another outcome then SANS again; Undo post out then posted
   again on the same date): reading 1 says only a newly planned date relights, and also that a day dropped and planned
   again does. The days were never unplanned, only the man stopped being SANS. Read or unread on its return is not
   settled; before this build it came back unread. The owner's to decide.
3. **An existing one-man filing stretched earlier in its window** ("every way of picking days" against "the final save's
   check is unchanged" and "a one-man filing keeps today's words"): trimmed with the note, or refused in today's words?
   Likewise a new one-day "+ Commitment" whose first date is set back inside the window. Not the owner's unless the two
   doors differ on screen; the builder must pick one and both doors must agree. S5 d.
4. **A line whose title has gone stale while part of its body is still true** (S11: undone, then posted again from a
   later date; S1 mid-way if he had read). Q6 removes the sentence or the line, but says nothing of a title that is no
   longer true. Reading 3 gives "the latest title" only for a take-back; a posting made again is not one. Owner's.
5. **A hidden day that goes by.** "It comes back if you're SANS that day again" cannot come true for a day in the past;
   Q6 drops a sentence "once no longer true (the man is SANS those days again)" only. Whether a day gone by leaves the
   sentence is unstated. The agent's call; clock-only, a unit test reaches it best.
6. **What a title-alone line opens on a tap** (D, or A/B/C with nothing filed): it names no day. D1699 says a tap opens
   what the line opened. Likely the SANS calendar on the new date; the agent's call.
7. **Reading 2 against the brief's "or the reminder had been read".** After Undo post out, an untick or another outcome
   no reminder "stands" any more, yet a read reminder is exactly the case the brief says earns a line. Taken here as
   "stood and was read when the change was made" (S10 d). If the build reads "stands after the change", B, C and E with
   nothing filed would never show, and a read reminder would vanish in silence.
8. **A man who changes his own status** (ticks himself off on Quals): no line to himself, by the old rule "he changed it
   himself". Not restated for C; S9's last step holds it.
9. **Singular and plural in every body** ("that day" / "those days"; "was left out" / "were left out"), and each when a
   line shrinks from several days to one (S11). A builder often words only the first writing.
10. **The trim when the admin's window opens on a different man** than the one saved for (S6 a), and a trim that would
    leave a filing lying wholly on days already covered by his own earlier filing (as built for a duplicate, the note
    must not claim "Saved" if nothing new was saved). Unit test for the second.
11. **Other squadrons and saved weeks.** The reminder counts days in saved weeks as well as the loaded one, and only for
    his home squadron in view; the "newly planned date" memory must not relight when an admin merely loads another week
    or another squadron comes into view and back. A walker can press the week change; the squadron case is a unit test.
12. **The take-back written by the Quals page is a new door** (C): the permissions check that today allows this line
    only from a posting's change must allow it from an untick, and still refuse a made-up one. Unit test and the
    security reader, not a walker.
