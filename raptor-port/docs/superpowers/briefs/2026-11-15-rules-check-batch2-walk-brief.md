# The rules check's small batch — the walkers' brief (chat 81, 15 Nov 26)

Two Sonnet 5.5 walkers, W1 and W2, each in its own world on ONE frozen build (`docs/bug-check-order.md` §4, D16, D588).
The scenarios are Astra's (`docs/superpowers/briefs/2026-11-15-rules-check-batch2-scenarios.md` §2–§3 — read your share
there, whole: the setups, actions, EXPECTED and disproof lines below are its, each with its source). Evidence sheet:
`docs/handpass/2026-11-14-rules-check-batch2.md` (read §1–§5 only).

## What changed (what you are checking)
1. Two checks renamed: "On leave + flying" → **"On leave + planned"**, "Downchit + flying" → **"Downchit + planned"** (D2009) —
   wherever a surface prints the check's NAME. A warning's own message ("On leave but tasked — BRIEFING") is unchanged; the
   Scheduler Board prints the warning's own message first, so that sentence there is RIGHT.
2. The crew-rest warning, where the previous day's last flight had no landing typed (blank or "TBD"): **"Mon took off
   12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00"**, never "landed 12:00"; a
   typed landing still says "landed" (D2010, D1990). A shift or duty as the last commitment says "ended" (unchanged).
3. The Logic page's note under the changed-settings strip: **"A published day keeps the settings it was published under,
   and the OIL they gave it, until it is published again. If a changed OIL setting would change that OIL, the day reads
   pending."** (D2015) — with "1 setting … it" / "2 settings … them", and for a member "Only an admin can change them."
4. Nothing of OIL was built; the OIL Saturday is walked as built (D2044): after publishing, changing "Full day of OIL"
   reads "1 pending", the four sign-offs fall, and the OIL already credited stays until the day is published again.

## How to walk — read first
- **Read `docs/walk-scripts.md` §3 to §7, whole, before writing any script.** Its traps are why this brief is written so.
- **The driver:** `scripts/handpass/rcb2/rcb2-lib.mjs` — `openWorld({ phone, who })` gives a NEW browser and context with
  real storage, the frozen build of app commit `cc2eefa50` served from inside the browser at `http://localhost:4291` (no
  server to start; never run `npm run build` or any browser test — that rebuilds), signed in (`who`: `'a'` the admin
  Saber, `'us'` the member Ranger — check `L.login` in `scripts/handpass/lib.mjs` for the exact keys). Desktop: Chromium
  1536×864. Phone: WebKit 402×874, touch, scale 3 (his iPhone's size). The host's proven route:
  `scripts/handpass/rcb2/rcb2-host.mjs` (board of a day, a new flying wave, take-off and landing typed, a man seated with
  `L.put`, the board's warning list `#sbSide`, Insights by `#insightBtn` on a desktop — on a phone it is the ⋯ menu
  `#editSchedMore` / `#viewSchedMore` → `…MoreInsights` — and the Logic page by `a[data-page="logic"]`). The Logic page's
  setting boxes are NOT inside `#lgBody`. In the demo world the person key for Ranger is `bane`.
- **Older recipes, to COPY from (never import — they point at other folders):** `scripts/handpass/rcf/rcf-w1-lib.mjs`
  (sign and publish a day, the published face, OIL Earn, the Leave War's OIL cell and credits, Undo), `rcf-w3-lib.mjs`
  and `rcf-w3-s23.mjs` / `rcf-w3-s23b-tbd.mjs` (crew rest across two days, TBD typed), `rcf-w3-inp.mjs` (an input filed),
  `rcf-w1-s09.mjs` (a Logic setting changed and put back). Prove each copied helper's first step on this build before
  building a fixture on it.
- **Your own files only:** scripts `scripts/handpass/rcb2/rcb2-<you>-*.mjs`; set `process.env.RCB2_WHO = '<you>'` and a
  `RCB2_RUN` per run BEFORE importing the lib (each run its own picture folder under
  `docs/img/handpass/2026-11-14-rules-check-batch2/<you>/`); write nothing else anywhere (no app source, no other doc).
  Write scripts with the file tool, UTF-8, and run them from `raptor-port/`; never a script inline in the shell.
- **Days:** the demo week's Monday to Thursday carry demo warnings; for a clean case use Friday (index 4) as the
  scenario's "Monday" and Saturday (5) as its "Tuesday", or the next week, as `rcf-w3-s23.mjs` does — and say which.
  Fresh people for each case, away from other commitments, unless the scenario adds one.
- **Every step:** a picture after it (`W.pic`), the words read from the element that DRAWS them (walk-scripts §4 — a box
  wider than zero inside the surface being checked; never `innerText` of a container for a word match). On the phone, a
  picture within about 100ms of each tap's lift, beside the settled one (D1281). Each assertion prints what it read.
- **Judging:** a scenario with an EXPECTED line is PASS or FAIL — "RECORDED" only where the brief says "RECORD exactly what
  it says". A step whose own set-up could not act is NOT WALKED, never FAIL. A FAIL first gets walk-scripts §7's questions
  (the script's world, the route, what was pressed) and a picture at the failing step. Errors on the console or page are
  findings: list them.
- **Not a finding:** a problem that lives only in data already stored (the demo world) when the app is right for new data
  (D56); anything about a scheduler who is not an admin (D785); taking a man off a seat leaving no mark (D91); an older
  filed item — the changes window's Escape — is recorded under its backlog item if met, not as new.
- **Stop:** after 3 failed attempts at one gesture, picture it, record NOT WALKED with why, and move on. Stop every browser
  you started. Send your report ONCE: write it to `docs/handpass/parts/2026-11-15-rcb2-<you>.md` — one table row per
  scenario step (scenario, size, what was done, EXPECTED, what the screen said, PASS / FAIL / RECORDED / NOT WALKED, the
  picture's path), then errors seen, then each window opened and how each of its ways to close behaved, then the final
  run's folder and picture count. Your message back to the host is a ten-line summary naming every FAIL.
- **Sizes:** each scenario at the desktop AND the phone, except where your share says "desktop, one phone look".

## The lessons the walk must cover (`docs/bug-check-checklist.md`'s list; §7.11 of the order)
Applied in your share: **1** a table of state × reading (working day, published day, working amendment, the current and
older published eye, View-only, member) for the names and the crew-rest line; **3** after every press, what tells the
person it happened — pictured; **4** the ALL AVAIL window leaves the page working: press the page behind it and check what
lights; **9** Insights' count by type — the heading against its figures, phone and desktop; **11** the longer word in
narrow lists — read at 402 and 1536; **12** day details opened from every page that offers it (Edit Schedule, View-only,
the board, each eye); **17** the Logic strip shown, hidden by Reset to standard, shown again — the page measured after
each; **19** every window opened closed by each of its own ways (Close / Done, ×, Escape, a tap outside), phone and
desktop, the page under it as it was; **22** words judged by what is drawn; **23** what a tap opens is the window the
rulings give (the day's `?` → its day details); **23b** side-by-side boxes on any pictured screen one height (the Logic
strip's row); **25** the leave-and-planned warning made through the controls on every kind of row (flying seat, SC MAIN /
SPARE, ground / BRIEFING row, sim seat, Common Programme people, an accepted duty input) and the crew-rest source of every
kind (flight, flying SC, duty input); **28** on the phone, a window a press opens shown on screen before anything in it is
pressed; **30** each phone tap pictured within about 100ms of the lift.
Not applied (no gesture, drag, scroll hand-off, drawing, print, hidden page, clock or fitted figure changed): 2, 5, 6, 7,
8, 10, 13, 14, 15, 16, 18, 20, 21, 24, 26, 27, 29, 31.

## W1's share — the names, hides, document states, Logic and Insights
Astra's scenarios **9, 10, 1, 5, 13, 14**, in that order (9 builds the warnings the rest read):
- **9** "planned" true on every qualifying row — Ranger files whole-day leave on the Inputs page as the member; the admin
  puts him on a 09:00–10:00 BRIEFING row; then each kind of row in the brief's list; an applicable downchit for another
  man. Read the week, day details, board, Insights and Logic. Both sizes for the BRIEFING case; the other row kinds
  desktop, one phone look.
- **10** hidden warnings and "goes away once signed" — both sizes; its published order desktop, one phone look.
- **1** day details follows the document on screen — both sizes.
- **5** published names, current and older eyes, and as Ranger — both sizes. Its "nothing pending from this batch"
  check: a fresh day you publish, compared before and after with no edit.
- **13** Logic: one setting changed, two, Reset (once with the box still focused), search "planned", the fired and
  severity filters, then as Ranger — both sizes; at 402 the strip and its note read whole, nothing cut.
- **14** Insights, its doors (desktop button, phone ⋯ menu, the board's), names and counts — desktop, one phone look;
  the CSV and print doors only looked at, not required to carry warnings (RECORD what they export).
- **Plain-user round** (Astra §3), steps 1, 2, 3 and 6, both sizes; every window you open closed every way it offers.

## W2's share — crew rest and OIL
Astra's scenarios **7, 3, 4, 8, 2, 11, 12, 6**, in that order:
- **7** blank → typed 12:30 → TBD in one week, read on the week, board, day details and the day before's explanation;
  after leaving the day and after a reload; again with a typed B on the first day — both sizes.
- **3** the amber "Tight turning — crew rest" (Tuesday 04:30–05:30 after Monday 12:00 blank) — both sizes.
- **4** Sunday to Monday across the week's edge, both entry orders, reload, then published Edit vs View-only — both
  sizes (the next-week preview is the desktop's; on the phone, ordinary week navigation).
- **8** the latest commitment wins (a flying SC line, then a duty input, as the last commitment; then a flight ending
  earlier; remove the duty, Undo) — both sizes.
- **2** ALL / ALL AVAIL window's per-person reason — both sizes; press the page behind the open window (lesson 4).
- **11** published rules held vs the next amendment — desktop, one phone look.
- **12** OIL settings: A no effect, B worked times change with FO → FO (**this picture goes on his look card: the
  pending list and the Logic note side by side**), C set before first publish — desktop, one phone look.
- **6** the published OIL Saturday end to end (Bane, 12:00–13:00, rally 09:00, debrief to 15:00, "Full day of OIL" 6h01 →
  HO; changed to 5h → "1 pending", sign-offs gone, OIL credited still HO in View-only, the eye, the puck, the Leave War;
  put back → pending clears; changed again and republished → FO once) — desktop, one phone look at the pending list.
  **RECORD exactly** what the pending list's line says. These pictures go on his look card (D853).
- **Plain-user round** (Astra §3), steps 4, 5, 7 and 8, both sizes; every window you open closed every way it offers.
