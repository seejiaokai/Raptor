# Fix read 5's fixes — the re-walk (desktop 1536 and iPhone 402, 19 Nov 26, chat 114)

You are a walker (Sonnet). You drive the running app in a real browser and report what the screen shows, with pictures.
You never read the app's code for bugs, never change anything under `raptor-port/src`, never commit or push. Write only
your own walk scripts (`raptor-port/scripts/handpass/msq/msq-fr6-*.mjs`) and their pictures. Send your report ONCE, after
stopping every script and browser you started; write it to
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/1cb2a578-19ca-4f89-93d4-0128b33b66e0/scratchpad/fr6-walk-report.md`
and hand back a short summary.

**What changed since the last walk:** (1) an admin's Undo / Redo of his own step on the Leave War may now remove or put
back a bell line about a man who has since moved, and its "taken back" line; (2) who is told when an input changes is
now one rule — the people named in it, and its filer while he is still in a named man's squadron; (3) a posting
take-back and the war's reversal no longer touch a line that has already left a man's bell. No screen saves a move of
squadron yet, so the moved-man halves are not walkable (tests hold them). This walk checks that ordinary bells, own
leave and the posting take-back still work on screen for people who never moved.

**Read first, whole:** `raptor-port/docs/walk-scripts.md`. Then the head of
`raptor-port/docs/superpowers/briefs/2026-11-19-multi-sqn-b1-job2-rewalk-brief.md` (§"The tooling and the machine's
traps" and its sign-ins) — every rule there holds for you, with these settings: `MSQ_DIST=C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/1cb2a578-19ca-4f89-93d4-0128b33b66e0/scratchpad/fr6-dist`
`MSQ_BUNDLE=<the index-*.js named in that folder's assets>` `MSQ_IMGDIR=2026-11-19-multi-sqn-b1-fixread6`
`MSQ_WHO=r` and a new `MSQ_RUN` each run. Start from the last walk's scripts, which passed against this screen:
`scripts/handpass/msq/msq-fr5-f2.mjs`, `msq-fr5-f3b.mjs`, `msq-fr5-f4.mjs` — copy each to an `msq-fr6-*` name and keep
its helpers. Use a port no other chat holds (check it is free first).

**THE SAME-TAB RULE (the last walk's F4 "fail" was this):** a tab loads the read records only when it starts. A bell
read in one tab is never seen by another tab already open. So every step that signs in as someone else does it IN THE
SAME TAB — sign out, sign in as the next person — or, where a script keeps two tabs, it RELOADS the other tab before
looking at its bell. Never judge a bell in a tab that was open while another person read it.

## The orders — each at desktop 1536 AND iPhone 402 (by touch), a picture after every press

**F2 — own leave.** As Hunter (`ad2`, 142's plain admin): add his own leave on a 142 day next week on the Inputs page →
EXPECTED saved, shown on his row; Undo in the top bar → gone; Redo → back. The same as Ranger (`us`, member) and as
Kestrel (`ad9`, on a 149 day).

**F3 — a bell line written, taken back, put back (nobody moved).** As Kestrel (`ad9`) on the Leave War: open December
(or the year) for bidding → sign out, sign in as Osprey (`us9`) → EXPECTED his bell shows the bidding-open line, unread.
Sign out, back as Kestrel: Undo in the top bar → sign out, Osprey: EXPECTED the line gone. Back as Kestrel: Redo →
Osprey: EXPECTED it back. Then once more with Osprey READING the line before Kestrel's Undo → EXPECTED a struck line
"taken back". RECORD every line's words.

**F4 — the posting take-back, read and unread, by the same-tab rule.** (a) Unread: as Saber (`ad`) post Ranger out on
the Leave War posting sheet for today → sign out, Hunter (`ad2`): EXPECTED his bell shows the posting line, unread; do
NOT open it — sign out, Saber: the sheet's "Undo post out (PO)" → sign out, Hunter: EXPECTED the line gone. (b) Read:
the same, but Hunter opens his bell and reads the line first → sign out, Saber: Undo post out → sign out, Hunter:
EXPECTED one struck line, "taken back · Saber", unread, the bell lit. RECORD the words. Also Saber's own bell after his
Undo: EXPECTED nothing about it (the person who pressed Undo gets nothing).

**F5 — plain-user round:** after F3 and F4, every other place that shows the result looked at once — the Leave War's own
list for that month, Ranger's row on Admin → Users, the posting sheet reopened.

Each assertion one `row(...)`: what you did, EXPECTED, what the screen said word for word, PASS / FAIL / RECORD / OWED,
the picture's name. A FAIL is a finding only with its picture and the steps to repeat it — and the note of which tab
each step ran in.
