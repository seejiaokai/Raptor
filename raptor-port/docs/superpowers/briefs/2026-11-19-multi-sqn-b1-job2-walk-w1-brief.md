# Job 2's walk, walker W1 — the master acting on another squadron's man, and whose history it lands in (desktop, 19 Nov 26)

You are a walker (Sonnet). You drive the running app in a real browser and report what the screen shows, with pictures.
You never read the app's code for bugs, never change anything under `raptor-port/src`, never commit or push. Write only
your own walk scripts (`raptor-port/scripts/handpass/msq/msq-j2-w1-*.mjs`) and their pictures. Send your report ONCE, after
stopping every script and browser you started; write it to
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/5b60f044-be66-416c-b9bc-c289e42f5770/scratchpad/job2/walk/w1-report.md`
and hand back a short summary.

**Read first, whole:** `raptor-port/docs/walk-scripts.md` (how a walk script is written and the traps it names). Then
read the host's passing route `raptor-port/scripts/handpass/msq/msq-j2-host-probe.mjs` and the older W3 script
`raptor-port/scripts/handpass/msq/msq-w3-fixread.mjs` (its `openUsers`, `postOutSheet`, `controls` helpers are proven
routes: copy them, prove each against the present screen once before relying on it).

## The tooling and the machine's traps

- Library: `scripts/handpass/msq/msq-lib.mjs` (`open({phone,user})`, `login`, `signOut`, `pic`, `row`, `fin`, `say`),
  `msq-w1-util.mjs` (`pidOf`, `bodyText`), `../www/www-lib.mjs`. Run every script from `raptor-port/`.
- Settings for every run (put them in the shell line): `MSQ_DIST=C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/5b60f044-be66-416c-b9bc-c289e42f5770/scratchpad/job2/dist-2b792ebc5`
  `MSQ_BUNDLE=index-DDdDg3hG.js` `MSQ_IMGDIR=2026-11-19-multi-sqn-b1-job2` `MSQ_WHO=w1` and `MSQ_RUN=<a short run name>`
  (a new name each run, so pictures never overwrite an earlier run). The library serves the frozen build from inside the
  test browser — never start a server, never use `?fresh=1`. Each `open()` is a fresh world (its own storage).
- Write each script with the file tool (UTF-8) and run it as a file — never pass a script inline to the shell (escapes are
  lost; an apostrophe breaks a heredoc). Never send a script's rewrite and its run in one step. Each script prints a
  version line first. Stop after 3 failed attempts at one gesture and report it as OWED with its picture.
- Sign-ins: `ad`/`a` Saber (142, the master admin) · `ad2`/`a2` Prowler (142's plain admin) · `us`/`us` Ranger (142 member)
  · `ad9`/`a9` Kestrel (149's only admin) · `us9`/`us9` Osprey (149 member). 149's people: Kestrel, Osprey, Merlin,
  Harrier, Condor, Falcon, Heron, Raven, Shrike, Gannet. Today on screen is Thu 19 Nov 26 (the real clock) — call it T.
- The bridge (`window.PEOPLE`, `window.raptorRole`, …) is for READING only — never to make or change anything.
- Each assertion gets one `row(...)`: what you did, EXPECTED, what the screen said word for word, PASS / FAIL / RECORD and
  the picture's name. A picture right after every press that should show something; read the screen AFTER the picture.
- The change history (the clock button `#histBtn` on Edit Schedule's top bar) opens on "New to you"; press "All changes"
  to see every line, your own included.

## The oracle for this walk

The master (Saber) acting on a 149 man from Admin → Users must leave 149's Leave War looking exactly as it does when 149's
own admin (Kestrel) does the same act to another 149 man. So every act is done twice — once by Saber on one man, once
by Kestrel on his twin — and the two men's rows on 149's Leave War are compared, picture beside picture. Any difference
is a FAIL (source: the evidence sheet's Astra 3 row — "the master's Archive, Restore, Restore as and Delete of another
squadron's man write that squadron's stored war").

## The orders (desktop 1536, Chromium)

**W1-A — Archive before 149's war is ever opened (one fresh world).** Sign in as `ad`. Do NOT open the Leave War. Admin →
Users → find Osprey → open his row → Archive. Picture the Users list and the Archived fold with Osprey in it. Sign out.
Sign in as `ad9`; open the Leave War for the first time in this world; find Osprey's row on the grid around T. Picture.
EXPECTED: his months before T are kept (his row is there with what it had before), and from T he is shown gone the way
an archived man is (RECORD the exact look and any words in his row and his person window). Reload the page, sign in as
`ad9` again, same picture: the same. Then sign in as `ad`, open 142's Leave War: it opens normally (RECORD). Sign in as
`us9` (Osprey): RECORD exactly what the sign-in says (an archived man's account).
Then in a SECOND fresh world, do the twin: sign in as `ad9`, open the Leave War first (so 149's war is opened before), then
Admin → Users → Merlin → Archive (Kestrel archiving his own man). Picture Merlin's row on 149's war. EXPECTED: Merlin's row
looks like Osprey's did in the first world (the same shape at T).

**W1-B — Archive, Delete and Restore by the master vs by 149's admin (one fresh world, in this order).**
1. Sign in as `ad9`. Leave War → open the current period's grid. For Harrier, Heron, Raven and Shrike: give each an OIL
   award by hand on T−1 (a past day) and on T+7 (a future day), through the app's own control for a hand award (a day
   cell → its menu → "Grant OIL", or the OIL tab's credit entry — find the control on screen; RECORD which you used).
   Picture each man's row with the two awards (FO or HO boxes). Note each man's OIL figure in his person window.
2. Sign out; sign in as `ad`. Admin → Users → Harrier → Archive. Sign out; sign in as `ad9`. Admin → Users → Heron →
   Archive. Open 149's Leave War: picture Harrier's and Heron's rows side by side around T−1 … T+7, and each one's person
   window (OIL figure). EXPECTED: the two rows look the same; the T−1 award kept on both (RECORD what the T+7 award does —
   it must be the SAME for both).
3. Sign in as `ad`. Admin → Users → Raven → Delete: read the words the first press shows, picture, press Cancel (or press
   the row to close it); reopen the row and check Delete is no longer armed (picture). Then Delete, confirm ("Tap again to
   delete …" or as the screen asks). Sign in as `ad9`; Shrike → Delete, confirm. Open 149's Leave War: picture Raven's
   and Shrike's rows. EXPECTED: the same for both — the months before T kept, the T−1 award kept, the T+7 award gone
   (source: D299, D325 and the evidence sheet's Astra 3 row: "Delete with its awards … OIL awards from the cut").
   Press the top bar's Undo once after each Delete and RECORD what it does (EXPECTED: it does not bring the man back — D350).
4. Sign in as `ad`. Admin → Users → open the Archived fold → Harrier → pick a post-in date T+2 in his calendar → Restore.
   Sign in as `ad9` → Heron → the same, T+2 → Restore. 149's Leave War: picture both rows T … T+7. EXPECTED: the same for
   both — away from T to T+1, counted again from T+2. First try for Harrier a date before T (T−3): EXPECTED refused, nothing
   changes (RECORD the words).
5. Sign in as `ad`. Archive Gannet. Then in the Archived fold, Gannet's row: type a new name "GannetX" in his name box —
   the button should read "Restore as GannetX" — pick T+2, press it. Sign in as `ad9`: Gannet's war row now under
   GannetX, counted from T+2 (picture); Users shows GannetX active.
6. Sign in as `ad`. Archive Condor. Archived fold → Condor's name box → "CondorZ" → "Save name" (not Restore). EXPECTED:
   CondorZ stays in the Archived fold, his sign-in dot unchanged, his war row still away (picture both, as `ad9` too).

**W1-C — the history line of the master's rename stays with 149 (same world as W1-B, go straight on).** Sign in as `ad`.
Archived fold → Falcon (archive him first) → "Save name" "FalconQ". Press the top bar's Undo, then Redo (do not sign out
between). Then open Edit Schedule → the clock → "All changes": picture. EXPECTED: no line about Falcon / FalconQ (nor
its Undo / Redo) in 142's history. Sign out; sign in as `ad9` → Edit Schedule → the clock → "All changes": picture.
EXPECTED: the rename, its Undo and its Redo lines are there, in 149's history (source: the evidence sheet's Astra 5 and
security H5 rows). RECORD what each line says.

**W1-D — the plain-user round for the master (desktop).** Still as `ad`: Admin → Users: search a callsign, open a row,
type in the sign-in box, press Cancel, reopen (the typing is gone — RECORD), open another row, close it by pressing its
name again. Add a person: "J2Saber", initials, Pilot, CAT, Post in via the calendar (open the calendar, close it by a
press outside, reopen, pick T+1) → Add person. Then Quals: J2Saber listed (RECORD whose squadron's Quals). Leave War
(142): a day cell → the day's window → its ⋯ → Post out → the sheet: press Close; reopen; press Escape; reopen and press
outside it — each time picture: is the sheet gone and the page under it as it was. Open a man's person window from his
name, close it by its ✕ and by Escape.

## Report

Return each order's rows (PASS / FAIL / RECORD, the words seen exactly), the picture names that decide each, every
console or page error (`fin` prints them), and anything odd you saw with a plain user's eye (a control that moved, a
window that covered what it is about, words cut off, two side-by-side boxes of different heights). Do not explain
causes; say what you saw. Mark anything you could not do as OWED with the reason and its picture.
