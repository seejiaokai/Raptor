# Job 2's walk, walker W3 — the iPhone: the people picker, the bell, the Tracker, the master's Archive by touch (19 Nov 26)

You are a walker (Sonnet). You drive the running app in a real browser and report what the screen shows, with pictures.
You never read the app's code for bugs, never change anything under `raptor-port/src`, never commit or push. Write only
your own walk scripts (`raptor-port/scripts/handpass/msq/msq-j2-w3-*.mjs`) and their pictures. Send your report ONCE, after
stopping every script and browser you started; write it to
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/5b60f044-be66-416c-b9bc-c289e42f5770/scratchpad/job2/walk/w3-report.md`
and hand back a short summary.

**Read first, whole:** `raptor-port/docs/walk-scripts.md`. Then the passing routes you start from — copy their helpers
and prove each against the present screen once: `raptor-port/scripts/handpass/msq/msq-j2-w1-a.mjs` (Admin → Users,
Archive, the war grid's rows), `msq-w2-c.mjs` (the phone: the menu, the Leave War, MY LEAVE, a name's window, the bell, the
Tracker, Inputs and its calendar, each opened and closed by its own control — walked on the iPhone on 18 Nov), and
`msq-w3-fixread.mjs` (`openUsers` on the phone).

## The tooling and the machine's traps

- Library: `scripts/handpass/msq/msq-lib.mjs` — `open({ phone: true, user })` gives an iPhone 402 × 874, WebKit, by
  touch (press with `.tap()`, never `.click()`); `login`, `signOut` (it opens the phone's menu first), `pic`, `row`, `fin`,
  `say`; `msq-w1-util.mjs` (`pidOf`, `bodyText`). Run every script from `raptor-port/`.
- Settings for every run (in the shell line): `MSQ_DIST=C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/5b60f044-be66-416c-b9bc-c289e42f5770/scratchpad/job2/dist-2b792ebc5`
  `MSQ_BUNDLE=index-DDdDg3hG.js` `MSQ_IMGDIR=2026-11-19-multi-sqn-b1-job2` `MSQ_WHO=w3` and `MSQ_RUN=<a short new name each run>`.
  Never start a server, never use `?fresh=1`. Each `open()` is a fresh world.
- Write each script with the file tool (UTF-8), run it as a file, never inline; never a rewrite and its run in one step;
  a version line first. Stop after 3 failed attempts at one gesture: OWED, with its picture.
- **On the phone, what a press opens is proved ON SCREEN before anything in it is pressed** — do not let a script scroll
  a target into view before pressing it; picture the opened thing first, check its box is inside the 402 × 874 screen,
  then press inside it. Take a picture within about 100 ms of each tap as well as the settled one where a press changes
  what is shown.
- Sign-ins: `ad`/`a` Saber (142, the master admin) · `ad2`/`a2` Hunter (142's plain admin) · `us`/`us` Ranger (142
  member) · `ad9`/`a9` Kestrel (149's only admin) · `us9`/`us9` Osprey (149 member). 142's people include Ace, Ranger,
  Hunter, Saber…; 149's: Kestrel, Osprey, Merlin, Harrier, Condor, Falcon, Heron, Raven, Shrike, Gannet. Today: Thu 19 Nov 26.
- The bridge (`window.PEOPLE`) and `localStorage` are for READING only.
- Each assertion gets one `row(...)`: did, EXPECTED, saw (word for word), PASS / FAIL / RECORD, picture.

## The orders (iPhone 402 × 874, WebKit, by touch)

**W3-A — the input window's people picker, by hand, for each face (one fresh world).** For `ad9`, `ad2`, `ad`, `us`, `us9`
in turn (sign out and in on the same tab): Inputs → the button that starts a new input → in its window, the people box /
"Who" picker: tap it open (picture it open, before anything inside is pressed), scroll its list by touch to the end, and
read every name it offers. EXPECTED: `ad9` and `us9` are offered 149's people only; `ad2`, `ad` and `us` 142's only
(source: D2087, D2132 — "Inputs … stay on his own squadron"); a member may be offered only himself (RECORD what a member
sees). Then as `ad9`: type "Os" in it, pick Osprey, pick also Merlin, take Merlin off again, then file a leave input (LL)
for Osprey on Mon 23 Nov → Save. Close the window by each of its ways on a second new input (its ✕, a tap outside it,
and the browser's back if it offers none) — each time: is it gone and the Inputs page under it as it was. Picture each.

**W3-B — the bell, each face its own (same world, go straight on).**
1. As `us9` (Osprey, member): Inputs → new input for himself, a Course on Tue 24 Nov → Save. As `us` (Ranger): the same,
   a Course on Tue 24 Nov → Save.
2. Open the bell as `ad9`, then `ad2`, then `ad`: picture each list open, read every line. EXPECTED: Kestrel's bell has
   the line(s) about Osprey's input and none about Ranger's; Hunter's has Ranger's and none about Osprey's (source: D2194,
   the evidence sheet's "still open 2" row — "an admin's bell lines are his own squadron's people's"); Saber (142, the
   master): RECORD exactly which lines he has.
3. As `ad9`: tap the line about Osprey's input → RECORD what it opens; close it. Then the bell's "Mark all read" (or
   however it marks read — RECORD the control) → the badge goes. Sign in as `ad2`: his bell's badge and lines are as they
   were before Kestrel read his (EXPECTED: unchanged — reading one person's bell never reads another's). Reload, sign in
   as `ad9`: still read.

**W3-C — each squadron's own Tracker (same world).** As `ad9`: the Tracker → a course → put one mark on one student
(any event box), picture it. Sign out on the same tab; sign in as `ad2`: the Tracker → is the course list 142's, and is
149's mark nowhere (EXPECTED: 142's own Tracker, no 149 mark — D2167); put one mark on a 142 student. Sign in as `us9`
(149 member): the Tracker shows 149's course with Kestrel's mark, not Hunter's (RECORD whether a member may mark —
D121 says everyone has the same access). Reload as `us9`: the same. Picture each.

**W3-D — the master archives a 149 man by touch, before 149's war is opened (a SECOND fresh world).** Sign in as `ad`.
Do NOT open the Leave War. Admin → Users (from the phone's menu) → search Condor → open his row → Archive. Picture the
Archived fold with him. Sign out; sign in as `ad9`; the Leave War → find Condor's row around Thu 19 Nov (scroll the grid by
touch). EXPECTED: his months before Thu 19 Nov kept; from Thu 19 Nov shown posted out (hatched "PO", as an archived man
is — the desktop walk saw exactly this). Then as `ad9`, Admin → Users → Heron → Archive (his own man); the war: Heron's
row looks the same as Condor's at Thu 19 Nov.

**W3-E — 142's plain admin refused on a 149 man, by touch (same world).** Sign in as `ad2`. Admin → Users → Osprey →
Suspend, then Archive. EXPECTED: "He is 149's. Only an admin of 149 can change his account." for Suspend, "He is 149's.
Only an admin of 149 can change him." for Archive; the words fully inside the screen and readable (picture), Osprey
unchanged.

**W3-F — the plain-user round for 149's admin on the phone (same world).** As `ad9`: Admin → Users: find a man, open
his row, type in his sign-in box, Cancel; reopen (typing gone); Add a person's post-in calendar: open it (picture: inside
the screen), tap outside to close, reopen, pick a day. The Leave War: MY LEAVE (open, close), a name's window (open by
tapping his name; close by its ✕), a day cell → its window → its ⋯ list → close it; flick the grid to the page's very foot
and back (picture at the foot: does the top bar stay). The bell open and close. Look at every picture for two
side-by-side boxes of different heights or a label broken onto two lines, and name any.

## Report

Each order's rows (PASS / FAIL / RECORD / OWED, the words seen exactly), the deciding pictures, every console or page
error (`fin` prints them), and anything odd with a plain user's eye. Do not explain causes; say what you saw.
