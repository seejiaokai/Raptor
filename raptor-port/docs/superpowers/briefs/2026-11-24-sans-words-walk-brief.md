# Walk brief — the new SANS words and rules (D2388, D2390, D2391, D2394, D2420, D2421) — 24 Nov 26, chat 156

You are a WALKER: you drive the running app as a person would, in a real browser, and say what you saw. You fix nothing,
change no file under `src/`, run no git command, and never run `npm run build`, `npm test`, `npm run test:e2e` or any
Playwright TEST runner (each rebuilds `dist`). The build is already made: `raptor-port/dist`, from the commit the host names
in your start message. Another chat works on this PC: never touch ports 4700–4719, and never take or release the checks lock.

**Folder:** `C:\Users\User\projects\Raptor\.claude\worktrees\chat-156-handoff-a6d8d7\raptor-port` — work only here. You write
ONLY: your scripts `scripts/handpass/swd-<you>*.mjs`, your deciding pictures (at most about 40) under
`docs/img/handpass/2026-11-24-sans-words/<you>/`, and your step table `docs/handpass/parts/swd/<you>-walk.md`. Nothing else,
anywhere. Never pass a script inline to the shell: write it with the file tool and run the file. A rewrite and its run are
never sent in one step; print a version line at the top of every run. Raw dumps and the bulk of the pictures go to
`D:\raptor-work\c156-walk\<you>\`.

## Before you write a line
1. Read `docs/walk-scripts.md` §3 to §8 whole.
2. Read `docs/bug-check-order.md` §7.2 to §7.10 (`grep -n '^\*\*7\.' docs/bug-check-order.md`) and the checklist's lessons
   (`docs/bug-check-checklist.md`, "The lessons of §7.11"); for each lesson say in your table the step that covers it or why
   it cannot apply.
3. Your recipes, passing scripts driven on this app; copy their helpers, never guess a control from the source:
   `scripts/handpass/sah-w8-lib.mjs`, `sah-w10-lib.mjs`, `sah-w10-env.mjs`, `sud-w6-lib.mjs`, `sud-w6.mjs` (giving Hex a sign-in on
   Admin → Users, signing in as him, the bell, its tap onto the SANS tab), `sud-w5-lib.mjs` (the crew list, an armed seat, the
   board), `asp-w4.mjs`, `asp-w2-lib.mjs` (the clock, a SANS posting through the Leave War cell's ⋯ → Post out → SANS → Post out,
   "Undo post out"), `sfd-w1-lib.mjs` (the Quals tick: `#qViewW`/`#qViewA`, `#qEdit`, `td[data-q="<id>|san"]`), `frf-w1.mjs` (sign-offs,
   Publish), and the night's drawing script `docs/mock/2026-11-24-sans-words/draw.mjs`, which stages these very states.
   **Trap met before (17 false FAILs):** Hex and Ranger have demo flights of their own; read each man's day first and put your
   events at hours clear of them.
4. The rulings, whole: `grep -h '^| D2388 \|^| D2390 \|^| D2391 \|^| D2394 \|^| D2420 \|^| D2421 ' ../.claude/decisions-full/*.md`.
5. The scenarios: `docs/superpowers/briefs/2026-11-24-sans-words-scenarios-astra.md`. Read each of YOURS whole. The EXPECTED lines
   below replace Astra's where they differ.

## Your world
- Serve the build on your port as a background command that first moves into the folder by its full path:
  `cd "C:/Users/User/projects/Raptor/.claude/worktrees/chat-156-handoff-a6d8d7/raptor-port" && npx vite preview --port <PORT> --strictPort`.
  Check the port is free first. Stop it by its PORT at the end (PowerShell: `Get-NetTCPConnection -LocalPort <PORT>` →
  `Stop-Process`), never by a command-line pattern.
- A plain node script with `@playwright/test`'s `chromium` and `webkit` (the recipes' browser fallback). Each scenario starts in a
  FRESH browser context (a fresh store).
- **The clock:** install it BEFORE the app loads and leave it running:
  `await ctx.clock.install({ time: new Date('2026-07-15T09:00:00') })`, Wed 15 Jul 26. Log the app's own today before any step
  that relies on it.
- **Two sizes, every scenario:** desktop Chromium 1536×864; his iPhone, WebKit 402×874, `isMobile`, `hasTouch`,
  `deviceScaleFactor: 3`, real taps, a picture within about 100 ms of each tap as well as the settled one.
- Sign in as `ad`/`a` (Saber, admin) or `us`/`us` (Ranger, member). Hex is `rocky`, a WSO; give him a sign-in on Admin → Users.
- Everything made through the app's own controls. `window.*` may be READ to check a result (say so), never written.
- Watch console errors, page errors and 4xx the whole way; list them.

## The words to expect, exact
- **Cut run, himself:** `Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul.`
  **An admin for him:** `…because Ranger is SANS from Fri 17 Jul.` **Two or more left out, one run:**
  `Saved Fri 17 – Sat 18 Jul. Mon 13 – Thu 16 Jul were left out because you're SANS from Fri 17 Jul.`
- **Reminder:** `You're SANS from Fri 17 Jul.` over `You're planned on Sat 18, Mon 20, Thu 23 Jul with nothing filed. Tap to file for availability.`
  Past three days: `… and 1 more`. **No date ahead, or his date has arrived:** title `Your SANS availability is needed.`, same body.
- **A:** `Your SANS date moved to Sat 18 Jul. · Saber` / `You're active until then, so the SANS availability you filed for Fri 17 Jul is hidden. It comes back if you're SANS that day again.`
- **B:** `You're no longer posted out as SANS. · Saber` / `You're active again, so the SANS availability you filed for Fri 17, Sat 18 Jul is hidden. It comes back if you're SANS those days again.`
- **C (Quals untick):** `You're no longer SANS. · Saber` / B's body.
- **D:** the title alone, `Your SANS date moved to Thu 16 Jul. · Saber`, the live reminder staying.
- **E:** `You're no longer posted out as SANS. · Saber` / `The SANS availability you filed for Fri 17, Sat 18 Jul is hidden while you're not SANS those days.`
- **Greyed "+ Commitment":** `You're SANS from Fri 17 Jul.` on his own earlier days; `SANS aircrew add their availability here.` for a member not SANS; an admin's is never grey.
- **Shared offer:** `Hex is SANS from Fri 24 Jul. Take him out of this offer to add earlier days.`
  **A one-man filing keeps today's words:** `Hex is SANS from Fri 24 Jul: file SANS availability for days from then`.

## The scenarios, Astra's numbers, each at both sizes
| Walker | Scenarios | Port |
|---|---|---|
| **w11**, the change lines | S1, S3, S4, S5, S9, S10, S11, S12, S13 | 4801 |
| **w12**, the reminder | S2, S7, S14, S15, S16, S17, S22, S23 | 4802 |
| **w13**, the calendar's doors, the crew list, the plain-user round | S6, S8, S18, S19, S20, S21, S24, and the round below | 4803 |

**The host's EXPECTED lines, where Astra's leave it open (these win; each is a reading put to the owner, so also RECORD what you see):**
- **S3 (moved twice before he reads):** ONE change line, the latest title, unread, its body naming only the days hidden now.
- **S5 (ticked and posted):** taking off the tick while the posting stands ahead, with nothing hidden: NO line, the reminder stays.
  If the tick alone covered a day he filed: `You're no longer SANS. · Saber` with a body naming only that day (RECORD: an open question).
- **S4, S23:** an Undo of a change line he read shows it struck, `taken back · Saber`; an unread one simply goes. Every other bell
  line keeps its struck "taken back" exactly as before.
- **S14:** a day dropped and planned again relights a read reminder; a second engagement on a listed day does not.
- **S16:** deleting a filing after he read the reminder does NOT relight it (the day was not newly planned). RECORD.
- **Earlier reminder gone** (all filed, then a posting change): no title for a reminder that no longer stands.
- **S15, the date arriving:** the clock moved past Fri 17: the title becomes `Your SANS availability is needed.`, and the bell does NOT light for that alone.
- **S8, a NEW shared offer** whose first picked day is before one man's date: refused whole with the shared words, never trimmed.
- **S20, S21:** never trimmed past a gap; validation still refuses.
- Astra's "unit-test-only" extensions are the host's: skip them.

**The plain-user round (§7.0a), w13, both sizes:** as Ranger: the bell (open, tap the line, close it each way), the SANS tab's day
window the tap opens (close by ✕, Escape, a tap outside; on the phone its pull-up bar), "+ Commitment" → the commitment window
(Cancel, ✕, Escape, save), opening a saved commitment and deleting it; as Saber: the Leave War's Post out sheet (open, ✕, Escape, tap
outside, post out, Undo post out); then every other place that should show the result: the SANS month, Edit Schedule's crew list,
the Scheduler Board, View-only Sched, the changes window.

## What you give back
`docs/handpass/parts/swd/<you>-walk.md`: a table, one row per scenario step and size: what you did, what the screen said (exact
words and numbers), PASS / FAIL against EXPECTED (RECORDED only where it says RECORD), the picture's file name. Then: every FAIL with
its steps and pictures; errors seen; the lessons list; what you could NOT walk and why.
Your final message: the table's path, the counts (steps, PASS, FAIL, RECORDED, pictures), each FAIL in one line.
