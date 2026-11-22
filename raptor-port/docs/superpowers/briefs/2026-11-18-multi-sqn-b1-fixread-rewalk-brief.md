# The re-walk of the fix read's fixes — walker W3's brief (multi-squadron batch 1, 18 Nov 26)

You are a walker (Sonnet). You drive the running app in a real browser and report what the screen shows, with pictures.
You never read the app's code for bugs, never change anything under `raptor-port/src`, never commit or push. Write only
your own walk script and its pictures.

**Read first, whole:** `raptor-port/docs/walk-scripts.md` (how a walk script is written, and the traps it names).

## The tooling

- Library: `raptor-port/scripts/handpass/msq/msq-lib.mjs` (`open({phone,user})`, `login`, `signOut`, `pic`, `row`, `fin`,
  `say`), with `msq-w1-util.mjs` and `../www/www-lib.mjs` (board, press, typeIn, seat). Copy the shape of
  `msq-host-rewalk.mjs` (read it first). Your script: `raptor-port/scripts/handpass/msq/msq-w3-fixread.mjs`.
- The frozen build: set `MSQ_DIST` and `MSQ_BUNDLE` to the values the host gives you in the message that sends this brief.
  The library serves the build from inside the test browser; never start a server and never use `?fresh=1`.
- Pictures: `MSQ_WHO=w3`, `MSQ_RUN=fx-d` (desktop 1536) and `MSQ_RUN=fx-p` (iPhone 402, by touch — `open({phone:true})`).
- Sign-ins: `ad`/`a` Saber, the master admin (142) · `ad2`/`a2` Hunter, 142's plain admin · `us`/`us` Ranger, 142's member
  · `ad9`/`a9` Kestrel, 149's only admin · `us9`/`us9` Osprey, 149's member.
- Each order gets one `row(...)` with what you did, what is expected, what the screen said word for word, PASS/FAIL/RECORD
  and the picture's name. A picture is taken right after every press that should show something. Read the screen AFTER
  the picture (a headless page repaints when a frame is drawn).

## The orders

**F1 — Admin → Users, a plain 142 admin on a 149 man (desktop AND iPhone).** Sign in as `ad2`. Admin → Users. Find Osprey
(search for him if he is not listed). Open his row. For every button his row offers — Suspend, Archive, Delete, the
callsign box and its save, anything else — press it and picture what it says. Expected for each: either the button is
not offered at all, or the refusal reads exactly one of:
- "He is 149's. Only an admin of 149 can change his account." (his sign-in: Suspend, Delete, role)
- "He is 149's. Only an admin of 149 can change him." (the person: Archive, the name, Restore)
Never words like "member-writes-own", "You can only edit your own row", "That did not save", or anything with brackets
or ids. Check Osprey is unchanged afterwards (his dots, his callsign).

**F2 — the last-admin words (desktop).** Sign in as `ad`. Admin → Users. Open Kestrel's row. Press Archive. Expected:
"Kestrel is 149's last admin. Make another admin of 149 first." Set his role to Member: the same words. Then the Leave
War: switch to 149 if the schedules menu ("142 ▾" at the top left) offers it, find Kestrel's row, open Post out, pick
Overseas Sqn with today's date. Expected: the sheet says "Kestrel is 149's last admin. The posting waits until 149 has
another admin." (it may still let you save the posting — then picture his row: it says the posting waits). Never "the
last admin who can sign in".

**F3 — the master is never deleted (desktop).** Sign in as `ad2`. Leave War (142). Saber's row: Post out, pick the Delete
chip. Expected words: "Saber is a master admin, so he can't be deleted" — before any confirm, nothing saved. Then the
same sheet for Rocky (a 142 member): Delete with today's date, confirm twice as the sheet asks. Expected: Rocky's posting
runs (his row shows posted out / he leaves the roster), and the page does not freeze or go blank. Note any console error
(the library collects them — `fin` prints them).

**F4 — the changes window across both squadrons (desktop AND iPhone).**
1. Sign in as `ad9`; Edit Schedule; open the Scheduler Board on Wed 15 Jul and add a ground row "F4 149 LINE", seat
   Kestrel (copy `addGround` from `msq-host-rewalk.mjs`). Sign out.
2. Sign in as `ad2`; the same on 142's Wed: "F4 142 LINE", seat Hunter. Sign out.
3. Sign in as `ad` (the master, 142 in view). Picture the clock button in the top bar (its count of what is new). Open
   the changes window (the clock); picture it; press "Mark all as seen". Expected: the 142 line is listed, then nothing
   new; the clock's count drops.
4. Switch to 149 with the "142 ▾" schedules menu. Picture the week and open the changes window. Expected: "F4 149 LINE"
   is still NEW to him (it was never marked in 149), counted in the clock. Mark it seen there.
5. Switch back to 142: nothing new comes back. Reload the page, sign in as `ad` again: still nothing new in either.

## Report

Return: each order's rows (PASS/FAIL/RECORD, the words seen exactly), the picture names that decide each, every console or
page error, and anything else odd you saw on the way (a plain-user eye: a control that moved, a window that covered what
it is about, a word cut off). Do not explain causes; say what you saw.
