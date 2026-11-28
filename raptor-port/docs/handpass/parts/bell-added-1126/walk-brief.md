# Walker's brief — bell190: a person added to an input by someone else is told on his bell (26 Nov 26)

You are one of three Opus walkers (A, B or C — your prompt says which). You drive the REAL app in a real browser and
report what a person sees. You do not change any file under `raptor-port/src`, and you do not judge code. Read
`raptor-port/docs/walk-scripts.md` §2–§5 before you write a script. The sheet: `../../2026-11-26-bell-added.md`.

## Your world
- The built app is served at `http://localhost:4190/` (bundle `index-B9okpSpf.js` — check the page serves it). Never
  build, never start a server. Each browser context you open is its own world (its own saved data); keep one context
  per scenario group so your runs never mix.
- Scripts: write each with the Write tool to `C:/Users/User/AppData/Local/Temp/claude/a0a73751ce6bb0b4/a7bfbc5c-70a8-46a1-9ccd-a4391c31b9f1/scratchpad/bell190-<you>/`, name it `bell190-<you>-*.mjs`, and run it from
  `C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port` with
  `node <script> <args>`. Load the browser library with
  `createRequire(process.cwd() + '/package.json')('playwright')`. Never pass a script inline to the shell (backslashes
  and apostrophes are lost). Never `sed -i`. Print a version line at the top of every run. A rewrite and its run are two
  separate steps. Save files as UTF-8.
- Pictures: `C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port/docs/img/handpass/2026-11-26-bell-added/<you>/`,
  named `<you>-<scenario>-<step>.png`. Desktop 1536×864, Chromium. Phone: his iPhone's 402×874, WebKit
  (`playwright.webkit`), `isMobile: true, hasTouch: true, deviceScaleFactor: 3`; on a phone never TYPE into a box before
  a picture (it zooms) — set values through the box's own change event, or tap.

## The route, proved by the host (`scratchpad/bell190-host.mjs`, passed)
- Sign in: `page.goto(URL)`, wait `#luser`, fill `#luser` / `#lpass`, click `#loginForm button[type=submit]`, wait
  `#notifyBell`. Admin `ad` / `a` = **Saber**. Member `us` / `us` = **Ranger**.
- Sign out: click `#logout`, wait `#luser`. The saved data stays in the browser context, so Saber's change is waiting
  for Ranger when he signs in in the SAME context.
- The bell: click `#notifyBell`; its list is `.bell-list` (read `innerText`, and picture it). With nothing in it a tap
  says "Nothing new". The store is also readable as `window.NOTICES` (each line's `to`, words, `at`) — use it to read
  the bells of men who have no sign-in, and say in the report which bells you read on screen and which in the store.
- A third man with a sign-in: Saber adds a person on Admin → Users (an admin-added account takes any password; a
  callsign already on the roster is refused) — use the app's own form. Name him in your report.
- The demo week is Wed 15 Jul. Every other control you use, find on the running page and prove before you build on it.

## What a line should say (the rulings — full rows: `grep -h '^| D769 |' .claude/decisions-full/*.md`, Git Bash)
- **The man put in an input, or one filed for him:** the input's name and first day, *You were added*, who did it
  (D769; `raptor-port/docs/notifications-register.md` B2). **Its other people and its filer** (if not the one who acted):
  *Ranger added* / *… taken off* (B8). **A man taken off:** *You were taken off* (B3). **The one who acted:** nothing.
  **Exactly one line per act.** A tap on it opens the input.
- **Leave entered on the Leave War with Auto-approve on:** *Your leave · <day> · LL added and approved · Saber* — a tap
  opens the Leave War at that day (D1422; register P2). An existing bid approved: *LL approved* (R1).
- **An input filed on the Inputs page over his pending leave bid:** one line, *You were added · replaces your LL bid*
  (D1142; P11) — never a second line from the Leave War.
- **ALL AVAIL / ALL:** the men behind it are not told (D702); the named people of the input are told it was added (B8 —
  the host's reading).
- **Anything else** — a pending bid an admin places for him, a note's pucks, a published day, Undo after he read the
  line, a man on leave by a drop: **RECORD exactly what each bell says, and what a tap opens.** No ruling settles these;
  never call them PASS or FAIL.
- **Not a finding (D56):** a problem that lives only in data already stored before your run. Create every input you
  test through the app's own controls in your run.

## Each scenario
PASS / FAIL against the line above, or RECORD. For each: (a) the added man's bell lit, the line's words, day and who,
on screen (desktop; and the phone where marked); (b) the others' bells; (c) the actor has none; (d) exactly one line;
(e) what a tap on the line opens, pictured. One picture per assertion that matters; on a phone a picture right after the
tap that opens the bell. The numbers in brackets are the designers' (F = Fable, A = Astra) — their lists whole are in
this folder (`scenarios-fable.md`, `scenarios-astra.md`): read your cases there for their full start and steps.

## Walker A — the schedule (Edit Schedule and the Scheduler Board)
1. Drop on an input's Ground Programme row: empty place; a shared input's puck (today it JOINS); the only man's puck
   (REPLACES) — Edit Schedule desktop, then the Board desktop, then the Board on the phone by tap-to-arm [F1–3, F7, A1–4].
2. A man dragged from a seat onto an input (extra place; the only puck) — what his seat does, recorded [F5, A5].
3. A man moved from one input's row to another's [F6, A6].
4. An Unavailable row's puck replaced: an Other "→ Unavailable"; a leave filed on the Inputs page; a leave the Leave
   War approved (RECORD — the riskiest); a medical (RECORD what it asks); one man's row of a shared Other [F13–15, F17,
   F18, A7–9].
5. A several-day input: a man added on its middle day — one line, not one a day; the other days looked at [A10].
6. The input's own window opened from the schedule, a person added [F19, A11]; the Board's "+ Inputs" filing for him
   [A12].
7. An add waiting on the OIL question (a weekend input): nothing before the answer; one line after; none after a
   cancel [F8, A37]. A refused drop tells nobody [F10, A36].
8. A published day: an add waiting as an amendment — RECORD when the line comes; then publish — no second line [F44,
   A35].
9. Undo of an add before Ranger reads it (the line goes) and after he read it (RECORD) [F45, F46, A38, A39].

## Walker B — the Inputs page
1. "+ Input" by Saber for Ranger alone; for Ranger, a third man and Saber — from the List and from a day opened on the
   calendar; desktop and phone [F21, F22, A13, A14].
2. An existing input's window: Ranger added — from the List, a calendar bar, a day's card [F23, A15]; one save that
   takes one man off and adds two [A16]; a filer not in it told [F24, A21].
3. Ranger (member) files a Meeting for Saber and the third man; a member filer adds later; a member who is only IN a
   shared input tries to add — RECORD what the app allows [F25, F27, A18–20].
4. Personal for Ranger, then a second man added [F28, A17]; ALL AVAIL alone, and Ranger added by name beside it [F29,
   A33, A34].
5. Leave and a medical filed by Saber for Ranger on the Inputs page — one line, none from the war; one over his
   pending LL bid (Ranger files the bid on the Leave War first) [F30, F31, F16, A22, A23].
6. SANS calendar "+ Commitment" for a SANS man (make him SANS through the app if none is) — RECORD [F32, A31].
7. A note's pucks on a day opened on the calendar — RECORD [F33, A43]; an input moved to another day is not an "add"
   [F34].
8. Undo of an add made on the Inputs page, before Ranger reads it [A38].

## Walker C — the Leave War
1. Saber enters LL on Ranger's row, Auto-approve ON: one day; a run of three days; a half day; desktop and phone [F35,
   A24].
2. Auto-approve OFF: a pending bid placed for Ranger — RECORD [F36, A25]; then Saber approves it (day window, then
   Approvals) — *LL approved* [A28]; Auto-approve on over Ranger's own pending bid, same kind and another kind [F37].
3. Several people at once (Ranger and the third man), Auto-approve on — one line each, neither told of the other;
   a mix where one is refused [F38, A26, A27].
4. OD and a course filed from the war for Ranger; an Other and an Attach — the input's *You were added*, a tap opening
   the input [F40, F41, A29, A30].
5. A leave moved across rows, if the war allows it at all — RECORD [F43].
6. Undo of leave entered with Auto-approve on, before and after Ranger reads it — RECORD [F46, A38].
7. A tap on each line: the Leave War line opens the war at that day; an input line opens the input [A45].

## Stopping and the report
Stop after three failed attempts at one gesture and report it as BLOCKED, with its picture. When done, stop every
browser and script you started, then write ONE report with the Write tool to
`C:/Users/User/AppData/Local/Temp/claude/a0a73751ce6bb0b4/a7bfbc5c-70a8-46a1-9ccd-a4391c31b9f1/scratchpad/bell190-<you>-report.md`:
a table — scenario, door, size, PASS / FAIL / RECORD / BLOCKED, what each bell said word for word, what a tap opened,
the picture files. Then every FAIL in full: the steps to make it again, what was expected and its source, what
happened. Hand back one short line: the report's path and the counts.
