# Job 2's walk, walker W2 — refusals across squadrons, the last admin, a new 149 man (desktop, 19 Nov 26)

You are a walker (Sonnet). You drive the running app in a real browser and report what the screen shows, with pictures.
You never read the app's code for bugs, never change anything under `raptor-port/src`, never commit or push. Write only
your own walk scripts (`raptor-port/scripts/handpass/msq/msq-j2-w2-*.mjs`) and their pictures. Send your report ONCE, after
stopping every script and browser you started; write it to
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/5b60f044-be66-416c-b9bc-c289e42f5770/scratchpad/job2/walk/w2-report.md`
and hand back a short summary.

**Read first, whole:** `raptor-port/docs/walk-scripts.md`. Then the passing routes you start from — copy their helpers
and prove each against the present screen once: `raptor-port/scripts/handpass/msq/msq-j2-w1-b.mjs` (Admin → Users:
`openArchivedRow`, the Archived fold, `#accArCs` the archived man's name box, `#accArPostIn` his post-in date,
`#accArRestore`, "Save name", Delete's "Tap again to delete …"; the war grid's rows), `msq-j2-w1-d.mjs` (Add a person,
the post-in calendar, the posting sheet and the person window and how each closes), and `msq-w3-fixread.mjs`
(`postOutSheet`, `controls`).

## The tooling and the machine's traps

- Library: `scripts/handpass/msq/msq-lib.mjs` (`open({phone,user})`, `login`, `signOut`, `pic`, `row`, `fin`, `say`),
  `msq-w1-util.mjs` (`pidOf`, `bodyText`). Run every script from `raptor-port/`.
- Settings for every run (in the shell line): `MSQ_DIST=C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/5b60f044-be66-416c-b9bc-c289e42f5770/scratchpad/job2/dist-2b792ebc5`
  `MSQ_BUNDLE=index-DDdDg3hG.js` `MSQ_IMGDIR=2026-11-19-multi-sqn-b1-job2` `MSQ_WHO=w2` and `MSQ_RUN=<a short new name each run>`.
  The library serves the frozen build from inside the test browser — never start a server, never use `?fresh=1`. Each
  `open()` is a fresh world (its own storage).
- Write each script with the file tool (UTF-8) and run it as a file — never inline. Never send a script's rewrite and its
  run in one step. Each script prints a version line first. Stop after 3 failed attempts at one gesture: OWED, with its
  picture.
- Sign-ins: `ad`/`a` Saber (142, the master admin) · `ad2`/`a2` Prowler (142's plain admin) · `us`/`us` Ranger (142
  member) · `ad9`/`a9` Kestrel (149's only admin) · `us9`/`us9` Osprey (149 member). 149's people: Kestrel, Osprey,
  Merlin, Harrier, Condor, Falcon, Heron, Raven, Shrike, Gannet. Today on screen is Thu 19 Nov 26 — T. An account an
  admin adds takes any password.
- The bridge (`window.PEOPLE`, `window.ACCOUNTS` if present, `localStorage`) is for READING only — never to make or
  change anything. For "did anything change", read before and after: the person's row on Admin → Users (its words and its
  two dots), and `window.PEOPLE[pid]` (callsign, archived, deleted).
- Each assertion gets one `row(...)`: what you did, EXPECTED, what the screen said word for word, PASS / FAIL / RECORD
  and the picture's name. A picture right after every press that should show something; read the screen AFTER it.

## The orders (desktop 1536, Chromium) — one fresh world for W2-A … W2-E, in this order

**W2-A — 142's plain admin on 149's people, every door of Admin → Users.** Sign in as `ad2`. Admin → Users.
1. Osprey (149, active): change his sign-in box to "osp9x" → Save; set his role to Admin → Save; Suspend; Archive;
   Delete (press twice as it asks). EXPECTED after each press, exactly one of these words, and nothing about him changed
   (his sign-in still us9, Member, both dots as before): for his account (sign-in, role, Suspend, Delete) "He is 149's.
   Only an admin of 149 can change his account."; for the person (Archive) "He is 149's. Only an admin of 149 can change
   him." (source: the evidence sheet's job-1 table, D2205's refusal words). Never "That did not save", never words with
   brackets or ids.
2. Merlin (149, no sign-in): if he offers "Give sign-in" or a sign-in box, give "mer9x" → its button. EXPECTED: refused
   in the account words, no account made.
3. Sign out; sign in as `ad` (the master); Admin → Users → Heron → Archive (so an archived 149 man exists). Sign out;
   sign in as `ad2` → Archived fold → Heron: press Restore; then type "HeronB" in his name box → "Restore as HeronB";
   then "Save name". EXPECTED: each refused, "He is 149's. Only an admin of 149 can change him."; Heron still archived,
   still named Heron.
4. Then Prowler's own normal work still works: Admin → Users → a 142 man (Ace) → change his role to Admin → Save, then
   back to Member → Save (both work; RECORD the words).

**W2-B — a master's account (D2205).** Still `ad2`. Admin → Users → Saber: change his sign-in → Save; role → Member →
Save; Suspend; Archive; Delete (twice). EXPECTED: "Only a master admin can do that" for the account and the person doors,
and for Delete "Saber is a master admin, so he can't be deleted" (source: the job-1 table, D2205). Nothing about Saber
changes. Then Quals (142): Saber's callsign → type "SaberX" and leave the box: EXPECTED refused (RECORD the words);
Saber's CAT or remarks: change one → it saves (EXPECTED allowed — the job-1 table: G1 keeps the Quals row any admin's,
D218), then the top bar's Undo puts it back. Then the Leave War (142): Saber's row → a day cell → ⋯ → Post out → the
Delete chip: EXPECTED "Saber is a master admin, so he can't be deleted" on the sheet, nothing saved; press the sheet's
Close. Then sign out; sign in as `ad9`: Admin → Users → Saber → Suspend: RECORD the words (he is 142's AND a master).

**W2-C — Clear edit history stays in its squadron.** Sign in as `ad9`: on Edit Schedule add one small change (the
board's ground row on Wed — copy `addGround` from `msq-host-rewalk.mjs` — "W2 149 LINE", seat Kestrel). Sign out; sign in
as `ad2`: the same on 142's Wed, "W2 142 LINE", seat Prowler. Read and note, before the sweep, the saved history lines
(reading only: `Object.keys(localStorage).filter(k => k.includes('elog:'))`, each row's `u` and `lbl`). As `ad2`, Admin →
Data → "Clear edit history…" — clear everything it offers (RECORD the words of each step). Read the saved lines again.
EXPECTED: 142's lines (`u` u142 or none) gone; every `u149` line still there (source: the job-1 table, security H5 —
"a squadron's change history is written and swept only by its own people"). Sign in as `ad9`: the clock → All changes
on Wed 15 Jul: "W2 149 LINE" still listed (picture).

**W2-D — a new 149 man keeps his post-in date.** Sign in as `ad9`. Admin → Users → Add a person: "J2New", initials JN,
Pilot, a CAT, post in T+3 (by the calendar), sign-in "j2new" → "Add person and sign-in". Then add "J2Bare" the same
without a sign-in → "Add person"; then open J2Bare's row → give him a sign-in "j2bare" (the row's own control). Picture
each. Then: Quals (149) lists both; the Leave War (149): each one's row starts at T+3 — nothing before (picture). Reload,
sign in as `ad9`: the same. Sign out, sign in as `j2new` (any password): RECORD what he sees (his squadron's pages — 149's
names on the Leave War, not 142's). Then a duplicate: as `ad9`, Add a person "J2Dup" with sign-in "US9" (the same as
Osprey's but capitals): EXPECTED refused with words, and no J2Dup person left behind (Users search "J2Dup": none).
Sign out and sign in once each as ad, ad2, us, ad9, us9: each works (RECORD).

**W2-E — 149's last admin is kept, and the posting waits (do this LAST in the world).** Sign in as `ad`. Admin → Users →
Kestrel: Suspend; role → Member → Save; Archive; Delete (twice). EXPECTED each: "Kestrel is 149's last admin. Make
another admin of 149 first." (RECORD exactly, for Delete and Suspend too); Kestrel unchanged. Sign out; sign in as
`ad9`: the Leave War (149) → Kestrel's row → a day cell at T → ⋯ → Post out → Overseas Sqn → date T → the sheet's words:
EXPECTED "Kestrel is 149's last admin. The posting waits until 149 has another admin." (RECORD whether it still lets you
press Post out; if it does, press it and picture his row and his Users row: he must stay active, not archived). Then as
`ad9`, Admin → Users → J2New (from W2-D) → role Admin → Save (now 149 has a second admin who can sign in). Reload the
page; sign in as `ad9` (if Kestrel can still sign in) or as `j2new`: RECORD what Kestrel's posting did now (his Users
row: archived? suspended?; his war row). Then sign in as `ad2`: Admin → Users → Kestrel: RECORD what 142's admin sees.

**W2-F — the plain-user round, 142's admin and 149's admin (a SECOND fresh world).** For `ad2`, then `ad9`: Admin → Users:
find a man, open his row, type in the sign-in box, Cancel, reopen (typing gone), open another row, close it by pressing
his name again; Add a person with the post-in calendar opened, closed by a press outside, reopened, picked. The Leave War
(own squadron): open the current period; a day cell → the day window → its ⋯ list (picture it open) → Grant OIL on one
man (one day) → check his row shows it and his person window's OIL figure rose; open Approvals and come back; open a
man's person window from his name, its year selector, close it by ✕ and by Escape; Post out sheet → Close, Escape, a
press outside — each time is the sheet gone and the page under it as it was. Settings (the gear) → open and close.
Picture each step. Also look at every picture you take for two side-by-side boxes of different heights or a label
broken onto two lines, and name any.

## Report

Each order's rows (PASS / FAIL / RECORD / OWED, the words seen exactly), the deciding pictures, every console or page
error (`fin` prints them), and anything odd with a plain user's eye. Do not explain causes; say what you saw.
