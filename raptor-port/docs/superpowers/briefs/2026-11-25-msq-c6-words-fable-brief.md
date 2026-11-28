# C6's words — a fresh Fable's review (chat 175, 25 Nov 26)

The owner asked: *"ask fable to review the text as well"* — the words for his ruling D2632. You are that fresh Fable. You
did not write these words; review them cold. Per his D2441: Opus drafted them, you review and adjust before he sees them.

## Read first (in `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135`, read-only)
- `.claude/rules/plain-language.md` — he is not technical; plain words, the app's own names.
- `raptor-port/docs/design-practices.md` — search its writing guide (§1b) and its list of his design lessons; never read whole.
- `.claude/rules/decisions/design.md` — screens not wordy; one mark, one look.
- The rulings' full rows: `grep -h '^| D2632 \|^| D286 \|^| D288 \|^| D2336 \|^| D2240 \|^| D2630 |' .claude/decisions-full/*.md`.
- How bell lines read today: `raptor-port/docs/notifications-register.md` (search "Posted out", "taken back", "Given Plan").
  The approved shape is a bold first line (the man, the date), then a second line saying what happened, then " · " and who
  did it — e.g. "**Ranger** · Mon 16 Nov / Posted out · archived, account suspended".
- Today's note on the request (what is being replaced), in the app's words: "An archived man is already Ace — this makes a
  new person. If it is him, restore him first (▸ Archived), then give him his sign-in on his row."

## The case (more than two squadrons, his D2630)
Squadrons 142, 149, 150, 151 fly F-15s; callsigns are unique among them for live men (D288), but an archived man's
callsign may go to a new person (D286). Ace was a 142 pilot, archived on 3 Mar 26. Someone asks 149 for access as "Ace"
(or Kestrel, 149's admin, types "Ace" in "+ Add a person"). Kestrel sees a note with two choices. "It's him" sends 142's
admins a bell line asking them to bring him back and move him to 149, and his request waits in 149's "Waiting for access".
"Someone new" adds the new Ace at once and sends 142's admins a bell line suggesting they delete the archived Ace if he
has left. The move itself waits for a later build (the Leave War's "Transfer to Sqn").

## The draft words
1. The note, one archived Ace on 142: "Ace is the callsign of an archived man of 142 · Pilot · CAT B · archived 3 Mar 26.
   Is this him?"
2. Its two buttons: "It's him — ask 142 to bring him back" · "Someone new — add him"
3. The request, waiting after "It's him": "Waiting for 142 to bring Ace back and move him to 149."
4. Bell line to 142's admins, "it's him": "**Ace** · Wed 25 Nov / 149 asks: bring him back and move him to 149 · Kestrel"
5. Bell line to 142's admins, "someone new": "**Ace** · Wed 25 Nov / 149 added a new Ace. If your archived Ace has left,
   delete him · Kestrel"
6. Bell line back to Kestrel once 142 has brought him back: "**Ace** · Thu 26 Nov / Brought back by 142, to move to 149 ·
   Saber"
7. Archived Aces on two squadrons (142 and 150): "Ace is the callsign of archived men of two squadrons. Is it one of
   them?" — then one line each ("142 · Pilot · CAT B · archived 3 Mar 26", "150 · WSO · CAT A · archived 9 Jul 25"),
   each with "It's him", and one "Someone new — add him" under both.
8. Kestrel is also an admin of 142 (by Plan, or a master admin): "Ace is the callsign of an archived man of 142 · Pilot ·
   CAT B · archived 3 Mar 26. You're an admin of 142: bring him back there, or add someone new." — buttons "Open 142's
   Ace" · "Someone new — add him"
9. A live callsign refused (today "Ranger is already taken"): "Ranger is already taken on 142."
10. Same squadron, today's note above — keep, or adjust to match the rest?

## Your job
For each: keep, or your better wording, with one line why. Check: plain words a pilot uses; the app's own names
("bring back" vs the app's "Restore"; "archived"); the same shape as today's bell lines; short enough for an iPhone
(a button at most about 30 characters); nothing that says what the screen already shows; "master admin" never "master";
no word on no screen. Say if any case is missing (e.g. what Ace himself sees while he waits; what 142's admin sees when he
opens the line). Read-only: change no file, commit nothing, publish nothing.

## Report
Return the whole report as your final reply: a table — number, draft, your words, why — then anything missing.
