# Fix read 4's fixes — the walk (desktop 1536 and iPhone 402, 19 Nov 26, chat 111)

You are a walker (Sonnet). You drive the running app in a real browser and report what the screen shows, with pictures.
You never read the app's code for bugs, never change anything under `raptor-port/src`, never commit or push. Write only
your own walk scripts (`raptor-port/scripts/handpass/msq/msq-fr5-*.mjs`) and their pictures. Send your report ONCE, after
stopping every script and browser you started; write it to
`C:/Users/User/AppData/Local/Temp/claude/a64a38883e9f868e/063f7df9-6937-443e-902e-a7f2109db270/scratchpad/fr5-walk-report.md`
and hand back a short summary.

**What changed:** (1) an admin's own leave on days of a squadron he is not an admin of now follows a member's rules there;
(2) a new rule decides which stored bell lines show on a person's bell — every bell, its count, "mark all read" and a tap
on a line now go through it; a line leaves a man's bell on the day he moves squadron (no screen saves a move yet, so that
half is not walkable); (3) Undo / Redo of a step that wrote bell lines now leaves out a line that has left its holder's
bell. This walk checks that ordinary bells and ordinary own leave still work on screen for every sign-in — nothing that
should show has been hidden, nothing allowed has been shut out.

**Read first, whole:** `raptor-port/docs/walk-scripts.md`. Then the head of
`raptor-port/docs/superpowers/briefs/2026-11-19-multi-sqn-b1-job2-rewalk-brief.md` (§"The tooling and the machine's
traps" and its sign-ins) — every rule there holds for you, with these settings: `MSQ_DIST=C:/Users/User/AppData/Local/Temp/claude/a64a38883e9f868e/063f7df9-6937-443e-902e-a7f2109db270/scratchpad/fr5-dist`
`MSQ_BUNDLE=index-V_B3c44g.js` `MSQ_IMGDIR=2026-11-19-multi-sqn-b1-fixread5` `MSQ_WHO=f` and a new `MSQ_RUN` each run.
Start from the passing routes named there (`msq-j2-w1-b.mjs`, `msq-j2-w1-d.mjs`, `msq-j2-host-f.mjs`, the `msq-j2-r-*`
scripts) — copy their helpers and prove each against the present screen once.

## The orders — each at desktop 1536 AND iPhone 402 (by touch), a picture after every press

**F1 — every bell.** For each sign-in in turn (`ad` Saber, `ad2` Hunter, `us` Ranger, `ad9` Kestrel, `us9` Osprey), in a
fresh world: picture the top bar; open the bell → EXPECTED it opens, lists lines (or its empty state), and the number on
the bell equals the unread lines listed; tap one line → EXPECTED it opens the place it names; back, reopen → that line no
longer marked new and the number one less; "mark all read" if the bell has it → number gone; close the bell each of its
ways (outside tap, its own control). RECORD each bell's lines word for word.

**F2 — own leave.** As Hunter (`ad2`, 142's plain admin): add his own leave on a 142 day next week on the Inputs page →
EXPECTED saved, shown on his row; Undo in the top bar → gone; Redo → back. The same as Ranger (`us`, member) and as
Kestrel (`ad9`, on a 149 day). Then as Hunter, look at a 149 day's schedule → EXPECTED View only, no way to add his
leave there from it.

**F3 — a bell line written, taken back, put back (nobody moved).** As Kestrel (`ad9`) on the Leave War: open the year
for bidding (if the control is there) → sign in as Osprey (`us9`) → EXPECTED his bell shows the bidding-open line. Back as
Kestrel: Undo in the top bar → Osprey's bell no longer shows it (unread) — Redo → it shows again. If opening for bidding
is not on screen, find another Leave War step of Kestrel's that rings Osprey's bell (a decision on Osprey's leave) and do
the same; say which.

**F4 — the posting take-back.** As Saber (`ad`): post a 142 man out on Admin → Users (the posting sheet) for today → sign
in as Hunter (`ad2`) → EXPECTED his bell shows the posting line. Back as Saber: undo the posting (the sheet's own undo or
the top bar's) → Hunter's bell: EXPECTED the line gone if he had not read it; repeat with Hunter reading it first →
EXPECTED a "taken back" line. RECORD the words.

**F5 — plain-user round of the bell:** any other place that shows a bell line's result (the Leave War's own list, the
person's row) looked at once after F3 and F4.

Each assertion one `row(...)`: what you did, EXPECTED, what the screen said word for word, PASS / FAIL / RECORD / OWED,
the picture's name. A FAIL is a finding only with its picture and the steps to repeat it.
