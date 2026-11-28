# Batch 1's second half of the multi-squadron build — the FULL bug check's walk (night of 22–23 Nov 26)

Walked on commit `74f0d8138` (branch `claude/msq-b1-screens-135`; the build of every step A–G, the menu, Admin → Users by
squadron, Request access, Admin → Squadrons, the bell's buttons, and the night's fixes `6fcb8ea99`). The production build
(`npm run build`) served by `vite preview` on 4477, started and stopped inside each script, under the checks lock; at
1536×864 (Chromium) and 402×874 (WebKit, iPhone, ×2). Walker: a fresh Opus helper of the night's chat that built none of
it (D2256); it changes no app code and files nothing — its findings go back to the host. Scripts:
`scripts/handpass/n149/walk/` (`lib.mjs`, `w0`–`w12`, `crop.ps1`). Every step presses the app's own controls; the bridge
is read for facts only (w10 reads the stored request rows to show what was left — it writes nothing). Raw runs (JSON
facts per step) and all 250 pictures: the run's scratch folder; the 19 deciding pictures, cropped, beside this sheet
(`2026-11-23-msq-b1-second-half/`). The drawing check is done and not redone here
(`2026-11-23-msq-b1-drawing-check.md`).

## 1. The eight answers and the tier

1. Money — YES: an input's OIL amount and cut-off must read the input's own squadron, not the pick (§16 D4′); a pick must
   move no OIL credit.
2. The published record — YES: who may edit or publish another squadron's schedule changes (step A), and the print and
   CSV of the schedule name the squadron picked (§3 item 9).
3. Saved data — YES: new records (`account.access`, a request's squadron, `bellsqn`, the own-account and posting-failed
   lines, "+ New squadron" with a place).
4. A shared drawer — YES: the top bar (the menu, the tabs, the phone's menu) and the bell are drawn on every page.
5. A new gesture or mode — YES: the Schedules menu, the access row's buttons, the filter, the bell's Show buttons.
6. A new surface — YES: the menu, Admin → Squadrons, the roles table, the filter panel, the Tracker's bands.
7. Roles — YES: the whole change is who may see and change which squadron.
8. The warning list — YES: new refusal words (the last admin, "He asked to join 149…", the time-zone sentence).

**Tier: FULL** (YES to 1, 2, 3, 7, 8 — as the plan's §12 says).

## 2. The rulings that apply, swept against the running build

One mark per surface where the ruling is about something shown. PASS = seen on screen at both sizes unless named.

| Ruling (the app's words) | Where checked | Result |
|---|---|---|
| D2252 — View of another squadron reaches only its View-only Sched and Logic, read only | Hunter with View of 149, 149 picked: the top bar's tabs, Logic, Squadron config, Inputs, Quals, Leave War, Tracker, Admin → Users, Admin → Data, the phone's ☰ menu | PASS on the desktop bar, Logic (only Search and Filter live), Squadron config ("· 149", greyed), Inputs / Quals / Leave War / Tracker / Users (142's own); **FAIL on the phone's ☰ menu (F1) and Admin → Data (F2)** |
| D2253 — in the member view a Plan holder is a member of his own squadron with View of what he could edit | Hunter with Plan, member view: menu, tabs, page | PASS — menu "149 View only", no Edit Schedule, no Admin, lands on View-only Sched |
| D2197, D2201 — a master admin's (and a Plan holder's) every page follows the pick | Saber, 149 picked: Edit Schedule, View-only, Inputs, Quals, Logic, Leave War, Admin → Users, Squadron config, Data; Hunter with Plan: Edit Schedule, Users | PASS — each shows 149's people and data; Users "People · 10" |
| D2318 — the Tracker keeps its squadron till sign-out, read only or hidden after a pick | Saber opened it on 142, picked 149; opened on 149, member view | PASS — "This is 142's Tracker. Pick 142 to change it. To open 149's, sign out and in." every control inert (a press is refused by the browser); member view "This is 149's Tracker. Leave the member view to open it." |
| D2323 — a window open at a pick is greyed and says so | Hunter (Plan) with a new input's window open, picks 142 (desktop) | PASS — "This is 149's. You picked 142 — close this to go on." On the phone the window covers the top bar, so no pick can be made with it open (§13) |
| D2301, D2304, D2132 — the menu's tick and grey labels; one squadron, no ▾ | the five sign-ins; eight squadrons | PASS — "Your squadron", "View only", "Full access"; Hunter alone, Ranger, Kestrel, Osprey: no menu; eight rows on the phone fit |
| D2303, D2306, D2320 — the opened row: Role, "142 Home squadron", "149 None · View · Plan", a member's Plan greyed "Plan is for admins only.", no sign-in "Give him a sign-in first to give access." | Saber on Hunter, Ranger, Kestrel; Hunter on Ace | PASS |
| D2191, D2336 — another squadron's man found by search, only the 149 line his to change | Kestrel finds Hunter | PASS — name, role, suspend, archive, delete locked; View given; Plan greyed "Only a master admin gives Plan." |
| §4 item 5 — one Save, one command, one Undo step; the first refusal saves nothing | Saber: Kestrel to Member plus 142 View in one Save; Hunter to Master admin and Undo; Ranger to Admin plus Plan in one Save | PASS — "Kestrel is 149's last admin. Make another admin of 149 first.", nothing kept; Master admin drops the rows ("Full access"), one Undo puts Plan back; Member→Admin with Plan saves |
| D2250, §16 D1′ — a non-master's Undo of "made a member" brings back the role, not the Plan | Hunter makes Ranger (admin, Plan of 149) a member, Undo | PASS — admin again, 149 None; Ranger's bell keeps "Plan of 149 ended · Hunter" |
| D2311 — archived, View and Plan end; restored, they stay ended | Saber archives Ranger holding View of 149, restores him | PASS — 149 None after Restore |
| D2319 — his own account's lines, as drawn, no squadron mark | Hunter's and Ranger's bells after each change | PASS — "Given View of 149 · Saber", "View of 149 ended · Saber", "Given Plan of 149: full access to 149 · Saber", "Plan of 149 ended · Saber", "Made an admin of 142 · Saber" |
| D2326 — the Undo of an access change says "Undid: Plan of 149 given · Hunter", its hover "Undo — …" | Saber's Undo of View / Plan given; Ranger's View | PASS — "Undid: View of 149 given · Hunter", hover "Undo — View of 149 given · Ranger". The master mark reads "Undid: the master admin mark" (no name — Q3) |
| D2094, D2111, D2324 — Request access asks the squadron; only its admins answer | Viper asks 149: Hunter (142 only), Osprey, Saber (149 switched off) see nothing; Kestrel gives access; Hunter typing a waiting 149 name onto a 142 man | PASS — "He asked to join 149 — only an admin of 149 can answer it."; Viper signs in a 149 member |
| D2325 — a bell tap moves him to the request's squadron, "1 waiting for access to 149" | Hunter with Plan, 142 picked; Saber after switching 149 on | PASS — 149's Admin → Users opened, the toast; the second tap opens the bell |
| D2198, D2202 — a master admin's bell: home on, the rest off; a Plan holder's Plan squadrons on | Saber, Hunter with Plan | PASS — Saber "Show 142 149" 149 off, nothing lit; on, the bell lights; Hunter 149 on from the start |
| D2308, D2298, D2306 — "+ New squadron": number, place (a new one in the same form), first admin given Plan | Saber makes 150 with a new place; Undo, Redo; eight squadrons | PASS — "Name the squadron's first admin." with none picked, "Squadron 149 is already set up", "Saved together: 150 and its new place, Northern base. Hunter gets Plan of 150…"; Undo removes the squadron and its place together. **The Undo and the Redo leave Admin → Squadrons for Admin → Users (F3)** |
| D2336, §15 D13 — a shared place's time zone needs an admin of every squadron there | Hunter on Home base (142 and 149; then seven squadrons) | PASS — "Only an admin of both 142 and 149 can change the time zone: both squadrons are here."; with seven: "Only an admin of 142, 149, 151, 152, 153, 154 and 155 … all seven squadrons are here."; his own 142's place "Saved at once. The new place applies from tomorrow." |
| D2317 — Squadron config follows the squadron in view | Hunter View: "Squadron config · 149", nothing live; Hunter Plan: 28 controls live | PASS |
| D2321 — many squadrons on a phone: the bell's Show buttons one sliding row | eight squadrons, iPhone | PASS — one row, 434 wide in a 362 box, slides |
| D2322, D2205 — a shared computer's sign-in waits for the last save | — | carried by a test (§10); not reachable by presses without a held save |
| D785 — a scheduler is always an admin; D56 — demo data is not a finding | the briefs and every expected line | applied |

## 3. The scenarios — designed by Astra

Astra (GPT-6 Astra, Codex CLI, read-only, an exported copy of `74f0d8138` with the builders' notes, reports and the
drawing sheet taken out) on the brief `docs/superpowers/briefs/2026-11-23-msq-b1-second-half-scenario-brief.md`; its report
saved as it arrived: `…/2026-11-23-msq-b1-second-half-scenarios-astra.md` — **40 scenarios**, a roll-call of 36 surfaces,
nine explicit negatives, no code defect claimed. Each scenario's disposition:

| # | Scenario (short) | How |
|---|---|---|
| 1 | unsaved Tracker work and a pick | walked (w12, both sizes): a new test event made in the chart's layout editor; the pick asks "You have unsaved chart edits on “2026”. Save them before switching to 149?" — Stay: no pick, the event kept; Discard them: 149 picked, the event gone; Save them (asked from View-only Sched): saved to 142's Tracker, 149 picked, the page stays View-only Sched. Through the bell: test `tracker/msq-trk-pick-ask.test.tsx` |
| 2 | every Tracker cover | walked (a), member view, (c) — w3, w8; (b) "can't open any more" needs a right lost while the page is open (another device) — test `state/msq-trk-cover.test.tsx` |
| 3 | Input / Leave War windows held across a pick | Input window walked (desktop, w3); Leave War window: test `leavewar/msq-warfix-held-window-words.test.tsx`, `ui/msq-pick-windows.test.tsx` |
| 4 | settings windows keep their squadron | walked (w6): Saber's Inputs settings open on 142, 149 picked — the window closes; nothing moves to 149 (recorded) |
| 5 | another squadron's Logic never changes an own input's OIL | tests `state/vconf-own-readers.test.ts`, `leavewar/msq-ended-lines.test.ts` (D4′); not walked — needs two different thresholds set and a priced input |
| 6 | Squadron config and its template doors | walked (w1, w6): View — heading "· 149", nothing live; Plan — 28 live |
| 7 | the less-used edit doors under View | walked: Admin → Data (**F2**); saved plans, changes window, planning calendar, ALL AVAIL's switch — the inventory's test `state/edit-rights-readers.test.ts` and `ui/msq-fix2-allavail-door.test.ts`; not each pressed |
| 8 | rights lost during active schedule work | not reachable on one device (another person's change reaches an open page only through the database step — §13); test `state/edit-rights-pick.test.ts` (the landing) |
| 9 | every page reads the right squadron after picks | walked (w1, w2, w3, w5): View holder, Plan holder, master, 142 ↔ 149 ↔ 155 |
| 10 | a pick does not consume or redirect Undo | walked (w9): Ranger's View given on 142, 149 picked, Undo — "Undid: View of 149 given · Ranger", the row back to None, the pick kept |
| 11 | an open menu reacting to changed rights | not reachable on one device (§13) |
| 12 | the one-Save matrix | walked: Member→Admin+Plan, Admin→Master (rows dropped), its Undo, Admin→Member with Plan (w6, w11); Master→Member — test `state/msq-undo-rights.test.ts` |
| 13 | another squadron's man: his line only | walked (w6) |
| 14 | a refusal in the second change saves nothing | walked (w6) |
| 15 | last-admin and master locks | walked: 149's last admin (w6); the first admin's hold — test `state/msq-fix2-undo-firstadmin-jam.test.ts` |
| 16 | an access form gone stale before Save | not reachable on one device (§13) |
| 17 | filter, labels, roles table, no sign-in rows | walked (w5, w6): filter by squadron, eight squadrons' tick group, "Give him a sign-in first…"; the roles table — drawing check and `ui/rolestable.test.tsx`. **Q1** (the heading's count) |
| 18 | a person added carries his home everywhere | walked (w6): Saber on 142's page adds Talon to 149 — on 149's Quals and war, not 142's |
| 19 | Request access's audience | walked (w4) |
| 20 | badges, seen marks, bell tap agree | walked (w4, w9); Approvals' "New" per squadron — test `state/multi-sqn-job2-bell.test.ts` |
| 21 | a waiting request not answered by another door | walked (w6): Hunter giving the waiting name to a 142 man — refused in its words |
| 22 | every bell producer's squadron and audience | tests `state/msq-*`, `leavewar/msq-acct-lines.test.ts`, `ui/msq-bell-show.test.tsx`; the demo holds no 149 admin lines, so only own-account lines and requests were walked |
| 23 | the bell switch with count and seen | walked (w9): 149 off — not lit; on — lit, the tap's toast |
| 24 | Undo of a take-away vs a fresh grant (stored lines) | tests (§16 D1′: `state/msq-undo-plan-store.test.ts`, `msq-fix2-undo-reach.test.tsx`); needs 149 admin lines, none in the demo |
| 25 | a non-master's Undo of "made a member" | walked (w11) |
| 26 | promotion keeps Plan's lines and his switch | promotion and Undo walked (w6); the lines and switch — test (§16 D1′a, `ui/msq-bell-show.test.tsx`) |
| 27 | own-account lines through Undo / Redo | walked in part (w3, w11: the lines after give, lower, take, Undo, Redo); "read then Undo" — test `leavewar/msq-acct-lines.test.ts` |
| 28 | personal vs admin lines on a move | test (§16 D1′b); a move is the Leave War's posting, not walked here |
| 29 | midnight | tests `state/msq-fix2-midnight-history.test.tsx`, `leavewar/msq-acct-lines.test.ts`; not walked (the clock) |
| 30 | archive, overseas, suspend | archive walked (w6); overseas and suspend — tests (§4 item 8) |
| 31 | a failed posting rings once | test `leavewar/msq-posting-failed.test.ts`; not walked (no way to make a posting fail by presses) |
| 32 | a posting take-back over hidden lines | test (§16 D1′c); needs 149 posting lines |
| 33 | new squadron, new place, one change | walked (w5): no first admin, a number in use, the new place, Undo, Redo |
| 34 | a waiting request blocks Undo of its squadron | walked with two tabs (w9, w10): the Undo goes through — the known two-tab limit (§15, K1), not this change; test `state/request-squadron.test.ts` holds the rule on one store |
| 35 | a place's move and shared places | walked (w5): the move's words, the shared-place words; crossing midnight — tests |
| 36 | eight squadrons on the phone | walked (w5 phone): menu, bell row, row lines, filter group |
| 37 | the shared computer's sign-in wait | test `ui/signin-hold.test.tsx`; not walked (no way to hold a save by presses) |
| 38 | reload and sign-out / in | walked throughout (every person change is a sign-out and sign-in on one page) |
| 39 | five everyday rounds | walked (§9) |
| 40 | the drawn states | the drawing check (`2026-11-23-msq-b1-drawing-check.md`) |

## 4. The roll-call

The thing: a squadron's number, a person's access, a bell line, the Edit Schedule tab, an edit control a View holder could
reach. Step A's inventory (`docs/data-schema.md` §Edit rights by squadron) was the start. SHOW = drawn right; USABLE = the
gesture works (or is rightly refused); PAINTED = what else sits on the same pixels.

| Surface | SHOW | USABLE | PAINTED |
|---|---|---|---|
| Top bar "142 ▾" and the menu (desktop) | YES — number, tick, three labels | YES — pick, Escape | the bar; nothing over it |
| The menu as a sheet (phone) | YES — eight rows fit | YES | the page under it, dimmed |
| Desktop tabs: Edit Schedule hidden for View | YES | YES | — |
| **Phone ☰ menu: Edit Schedule entry** | **MISSING — offered to a View holder (F1)** | tap lands on View-only Sched | the drawer over the bar |
| Board / View-only Sched with 149 | YES — 149's days | read only for View | the grey number (drawing check) |
| Logic with View | YES | NO-because read only (Search, Filter only) | — |
| Admin → Squadron config | YES — "· 149" | View: greyed; Plan: live | — |
| **Admin → Data's two clears** | YES | **MISSING — offered to a View holder, a press does nothing (F2)** | — |
| Inputs, Quals, Leave War with View | YES — his own 142 | YES (his own) | — |
| Inputs settings window across a pick | closes at the pick | NO-because closed | — |
| Input window at a pick | YES — the band | Close works | — |
| Tracker after a pick (a), member view | YES — the band | NO-because inert | — |
| Admin → Users: list by squadron, heading | YES — own count | YES | Plan holder "· also plans 149" |
| Admin → Users: opened row | YES | YES — one Save, refusals | the roles fold under it |
| Admin → Users: filter | YES | YES | Q1 — the heading with a Squadron tick |
| Admin → Users: Add a person, Home squadron | YES | YES — goes to 149 | — |
| Admin → Users: Waiting list | YES — the page's squadron's | YES | — |
| Admin tile and tab badges | YES — the page's squadron's | — | — |
| Request access card | YES — Squadron first | YES | — |
| Admin → Squadrons: list, + New squadron, places | YES | YES — **Undo / Redo leave the panel (F3)** | — |
| Place editor, shared time zone | YES — the words | NO-because greyed (rightly) | — |
| Bell: own lines, Show buttons, grey mark | YES | YES — switch kept | eight: one sliding row |
| Bell tap to another squadron | YES — toast | YES | — |
| Undo bubble and hover for access | YES | YES | — |
| Member view switch | YES | YES — both ways (desktop) | — |
| Schedule CSV, LoX file name | YES — "149-schedule.csv", "149-LoX-FCP.csv" | YES | — |
| Print | NO-because not walked (§13) | — | — |
| Sign-in wait card | NO-because not reachable (§13; test) | — | — |
| Posting-failed amber line | NO-because not reachable (§13; test) | — | — |

## 5. The door check

Every action the data allows, and its control, in each state walked: give / lower / take View and Plan (the row's three
buttons, one Save), role and master mark (Role box), Undo / Redo (top bar), pick (menu), switch a squadron's bell lines
(Show buttons), answer a request (Give access / Refuse), add a person to another squadron (Home squadron), make a squadron
(+ New squadron), a place for a squadron (its Place list), a place's time zone (place editor), leave and enter the member
view (role chip / ☰). Each has its control and was pressed. A door offered with no action behind it: **F2** (Clear old
clutter… for a View holder). A door offered that should not be: **F1** (the phone menu's Edit Schedule).

## 6. The five sizing lines (§7.0, the ledger)

1. **Type:** H (who may do or see), B (new surfaces), C (new controls), D (the squadron's number and access drawn in many
   places), G (saved records, Undo, sign-out and in).
2. **What only a walk could find:** a surface that offers an edit control the rules take away (the role questions are now
   per squadron, drawn in many places — the drawer, the tabs, each page); where Undo lands; the phone's menu and sheets;
   the request's audience across five people; eight squadrons on a phone. The tests carry the doors' rules, midnight, the
   posting runner and the gate.
3. **What the ledger says:** H walks of this branch (the Plan audit 20 Nov, the reshape 21 Nov) found 0 and many faults
   respectively; the H+D walks found their faults in surfaces drawn by their own code (the reshape's W5).
4. **The walk chosen:** the host alone (an Opus helper, D2256), 13 scripted steps (w0–w12), both sizes, the five
   sign-ins, Astra's 40 scenarios (§3: 30 walked whole or in part, 10 carried by named tests or not reachable, each with
   its reason), eight squadrons made through "+ New squadron" on screen (w5), and the plain-user round (§9). No size
   beyond the required two (no layout change to a page that scrolls inside itself beyond what the drawing check measured).
5. **After the walk (the ledger's row, for the host to add — this walker edits only this sheet):** `2026-11-23 | Batch 1's
   second half of the multi-squadron build (claude/msq-b1-screens-135, the night of 22–23 Nov 26) | H, B, C, D, G | FULL;
   one Opus walker (the night's helper), 13 scripts, 1536 and 402, Astra's 40 scenarios (30 walked), eight squadrons on
   screen; 250 pictures | not measured | 3 (F1 the phone menu's Edit Schedule for View; F2 Admin → Data's clears offered
   to View; F3 Undo of "+ New squadron" leaves the panel) | 0 | 1 (two tabs, known) | Astra's scenario design | this sheet`.

## 7. The §7.11 lessons against the scenarios

1 (states × readings): the menu and row walked in each of View, Plan, member view, master, none. 2 (gesture speed): no
drag in this change — cannot apply. 3 (feedback after a press): every Save's toast and every Undo's bubble recorded; **F2
and F3 are this lesson's kind**. 4 (a press behind a window): the menu pressed with an Input window open (w3). 5 (a box
moved into sight): the menu sheet and eight rows pictured at rest (w5 phone). 6, 7 (the phone's own scrolling): the bell's
sliding row — his iPhone look named (§13). 8 (the drawing): the drawing check. 9 (lists measured): eight squadrons' rows
"fit" measured (no text wider than its box). 10 (a page hidden and shown): not walked — named in §13. 11 (how much fits):
cannot apply (no reading depends on the width). 12 (every page a window opens from): the menu from each page walked (w1,
w3). 13 (pinch): cannot apply. 14 (keyboard boxes): the request form and Add a person filled by keys on both sizes. 15 (bars
over a scroll): the top bar with the menu open, pictured. 16 (after a refusal): the refused Save reopened — nothing kept.
17 (show / hide): the filter panel open and Clear; the member view both ways. 18 (print / download): CSV and LoX names
read; print not walked (§13). 19 (a window over another closed each way): Escape and Cancel on the row; ✕ on the phone's
input window not pressed. 20, 21, 26 (gestures traced): cannot apply. 22 (what is drawn): pictures opened for every
finding. 23 (what a tap opens, by the rulings): the bell tap against D2325. 23b (side-by-side boxes): the drawing check.
24 (against the top bar): the menu sheet at the phone's top. 25 (made through the app's controls everywhere it can go):
squadrons, a person to 149 from 142, a request — all on screen. 27 (neighbours move): not measured. 28 (what a press
opens, on the phone, before pressing in it): the menu and the ☰ menu pictured before a row is pressed. 29 (midnight): tests
(§10). 30 (the 100 ms picture): not taken. 31 (125% window): cannot apply (no page fitted to the screen changed).

## 8. The orders walked, and what the screen said

| Order | Desktop | Phone |
|---|---|---|
| View given → Undo → Redo → Hunter signs in → pick 149 → every tab → pick 142 | as §2 | as §2; the ☰ menu still lists Edit Schedule (F1) |
| Plan given → Saber picks 149 (every page) → back → Hunter: bell, menu, pick, Users, Edit Schedule → member view → back → input window, pick 142 → Plan → View → Undo → Redo → None → Hunter's bell | as §2 | as §2 (the member view's way back and the window step not reached by the script on the phone — §13) |
| Request to 149 → Hunter, Osprey, Saber see nothing → Plan to Hunter → his tap → Kestrel gives access → Viper signs in | as §2 | as §2 |
| "+ New squadron" with no admin → a number in use → 150 with a new place → Undo → Redo → 151–155 → menu, bell, row, filter → pick 155 → Hunter's places | as §2, F3 | as §2, F3 |
| Kestrel gives Hunter View by search → Hunter tries a waiting name on a 142 man → Saber's refused two-change Save → Saber adds a 149 man from 142 → Ranger View, archive, restore → Hunter Plan → Master → Undo → settings window across a pick → Hunter's Squadron config 149 | as §2 | as §2 (the add's picture clipped off-screen; its facts on desktop) |
| Exports with 149 → bell switch with a request → Undo across a pick → two tabs: 150, a request in tab B, Undo in tab A | as §2 | as §2 |
| Ranger made admin + Plan → Hunter makes him a member → Undo → Ranger's bell | as §2 | as §2 |
| A chart edit → pick → Stay → pick → Discard → back; a chart edit → View-only Sched → pick → Save → back | as §3 row 1 | as §3 row 1 |

## 9. The plain-user round (§7.0a)

Each of the five sign-ins, on its own page, at both sizes: arrival, the menu (or its absence), every tab opened in turn
(the Tracker waited for), the bell opened and closed, the ☰ menu opened and closed on the phone, sign-out — Saber and
Hunter through w1–w11; Ranger (desktop) and Osprey (phone) through w7: no menu, seven tabs each their own squadron's, an
empty bell, sign-out back to the sign-in card. Every window opened in the change's own flows was closed by its own
control (Cancel on the row, Escape on the menu and bell, Close on the input window). Nothing found beyond F1–F3.

## 10. The cases carried by a test

Each names the test and what it proves; each calls the app's own doors in jsdom unless said.

- The sign-in that waits for the last save, its card and the reload — `ui/signin-hold.test.tsx`.
- The posting that could not run: its line once, its gate — `leavewar/msq-posting-failed.test.ts`.
- The own-account lines written at midnight / at a move's day, and after Undo of a read line — `leavewar/msq-acct-lines.test.ts`.
- The Tracker's question before a pick with unsaved chart work — `tracker/msq-trk-pick-ask.test.tsx`; its covers —
  `state/msq-trk-cover.test.tsx`.
- An input's OIL threshold from its own squadron (D4′) — `state/vconf-own-readers.test.ts`; the war's ended lines — `leavewar/msq-ended-lines.test.ts`.
- A request blocking the Undo of its squadron on one store — `state/request-squadron.test.ts` ("the Undo of "+ New squadron" is refused while a request names 150").
- Lines shown only while the right holds, Undo of a take-away, the master's kept lines (§16 D1′, D1′a) — `state/msq-undo-plan-store.test.ts`, `state/msq-fix2-undo-reach.test.tsx`, `ui/msq-bell-show.test.tsx`.
- Every caller of the edit questions sorted by kind — `state/edit-rights-readers.test.ts` (it lists the drawer as "role" — the reason F1 slipped).

## 11. The pictures

The deciding ones, cropped, in `2026-11-23-msq-b1-second-half/`: `f1-phone-menu-offers-edit-schedule.png`,
`f1-phone-tap-lands-view-only.png`, `f1-desktop-bar-no-edit-schedule.png`; `f2-desktop-clear-offered-press-silent.png`,
`f2-phone-clear-offered.png`; `f3-squadrons-150-made.png`, `f3-after-undo-lands-on-users.png`;
`q1-filter-149-heading-10.png`; `ok-tracker-band-a.png`, `ok-tracker-member-view.png`, `ok-input-window-at-pick.png`,
`ok-bell-tap-149-request.png`, `ok-timezone-words.png`, `ok-menu-view-only.png`, `ok-kestrel-gives-view-rest-locked.png`,
`ok-squadron-config-149-view.png`, `ok-phone-menu-eight.png`, `ok-phone-bell-eight.png`,
`known-two-tabs-request-left-waiting.png`. Every deciding picture was opened by the walker.

## 12. Errors seen

No page error, console error or failed request in any step at either size. In WebKit only, the app's own toast
"Couldn't save that document: your browser storage may be full…" showed on the Request access card (w4) and on the
Tracker (w8, w12) — the known test-browser fact (`docs/walk-scripts.md` §Three of a walk's own making (a): WebKit on Windows
keeps no file in its own database; his iPhone keeps them, checked 7 Nov 26). Not the app.

## 13. What was NOT walked, and why

- Anything that needs a second person's change to reach a page already open (Astra 8, 11, 16; the bell "with the bell
  open" for another person's change; the Tracker's case (b)): this browser's open pages hold their own copy until their
  next sign-in — tried with two tabs (w7): Hunter's open bell, menu and Edit Schedule tab kept Plan of 149 after Saber,
  in the second tab, took it. The known two-tab limit (K1); carried by tests.
- The sign-in wait, the posting-failed line, midnight, a move: no way to make them by presses — tests (§10).
- The phone: a pick with a window open (the window covers the top bar); the member view's way back and the input-window
  step of w3 (the script's own ☰ path); Add a person's picture (clipped). The desktop walked each.
- Print (the browser's print dialog); his iPhone's own feel of the bell's sliding row and the menu sheet — for his look.
- A page hidden and shown again (lesson 10); the 100 ms picture after a tap (lesson 30).

## 14. The gate counts

Not run by this walker (the walk only; GitHub's run on the branch is the gates while the repo is public). Built once for
the walk: `npm run build` passed on `74f0d8138`.

## 15. What the walk found, and each disposition

- **F1 — the phone's ☰ menu offers "Edit Schedule" to a View holder with 149 picked.** Hunter (142's admin) given View
  of 149 by Saber; Hunter picks 149; the desktop's bar hides Edit Schedule, but the phone's ☰ menu (and the desktop's,
  whenever the page names fold into ☰) still lists it; a tap lands on View-only Sched, so nothing can be edited — a dead
  entry that tells him he can edit 149. Reproduced twice (w1 phone, w7 runs 1 and 2). Pictures
  `f1-phone-menu-offers-edit-schedule.png`, `f1-phone-tap-lands-view-only.png`. Suspected place: `src/ui/Drawer.tsx`
  l.27 lists Edit Schedule by `isAdmin()`; the top bar asks `canEditSched()` (`src/ui/Shell.tsx` l.290, l.373); the
  inventory files the drawer as "role" (`src/state/edit-rights-readers.test.ts` l.93). A unit test can hold it (the drawer
  rendered for Hunter with View of 149, 149 picked: no `[data-page="editsched"]`). Severity: low (misleading, no wrong
  write). **Disposition: OPEN — to the host for a red-first fix.**
- **F2 — Admin → Data's "Clear old clutter…" and "Clear edit history…" are offered to a View holder with 149 picked, and
  a press does nothing.** Hunter with View of 149, 149 picked, Admin → Data: pick a date — the button lights; press — no
  word, nothing cleared (with 142 picked the same press says "No old clutter in that period"). Reproduced three times
  (w2 desktop, w7 phone runs 1 and 2). Pictures `f2-desktop-clear-offered-press-silent.png`, `f2-phone-clear-offered.png`.
  Suspected place: `src/ui/AdminPage.tsx` ClearForm — the button is `disabled={!ready}` only (l.133–134) while its press
  returns silently on `!canEditSched()` (l.87); the panel has no "This is 149's…" line as Squadron config has. A unit test
  can hold it (`ui/msq-clear.test.tsx` has no View-holder case). Severity: low (nothing is cleared; a dead control). How it
  should look (greyed with a line, or the panel hidden) is new to see — a drawing first (D1625). **Disposition: OPEN — to
  the host.**
- **F3 — an Undo (or Redo) of "+ New squadron" moves Admin from Squadrons to Users.** Saber makes 150 on Admin →
  Squadrons; Undo — the bubble "Undid: adding a squadron", and the page shows Admin → Users, so the squadron's going is
  out of sight; Redo the same. Reproduced three times (w5 desktop twice, w5 phone). Pictures
  `f3-squadrons-150-made.png`, `f3-after-undo-lands-on-users.png`. Suspected place: the Admin page's panel is local state
  that starts at Users (`src/ui/AdminPage.tsx` l.243 `useState('users')`), so whatever re-draws the page on an Undo
  starts it again at Users. A test can hold it (Undo of `unit.add` on the Squadrons panel keeps the Squadrons panel).
  Severity: low (lesson 3's kind). **Disposition: OPEN — to the host.**
- **K1 (known, not this change) — two tabs:** a newcomer's request sent from a second tab while "+ New squadron" is
  undone in the first leaves the request naming a removed squadron: no Waiting list shows it, he waits for ever
  (w9 desktop and phone, w10). Each open tab keeps its own copy of the store; the gate's check (`state/perms.ts`
  `requestsNaming`, l.3662) reads that copy. The backlog's two-tab item (`OUTSTANDING.md`, the Leave War night's (b),
  place: the database step) covers it; a new instance for it. Picture `known-two-tabs-request-left-waiting.png`.
- **Questions parked for the host (not findings):**
  - **Q1** — Saber on 142's Admin → Users ticks the filter's Squadron "149": the heading reads "People · 10" and "Showing
    10 of 10" (plan §4 item 1: "the heading counts its own people only"; the drawing 7a: "Showing 1 of 61"); the tick also
    stays when he picks another squadron (155's Users then shows 149's group). Picture `q1-filter-149-heading-10.png`.
  - **Q2** — an Inputs settings window open on 142 closes when Saber picks 149 (plan §2: "a later pick never moves it");
    the record says it was closed, not moved — whether closing is the intended reading.
  - **Q3** — the Undo bubble for the master mark reads "Undid: the master admin mark" with no name, where D2326's shape
    ends "· Hunter".

## 16. Walk line

`Walk: docs/handpass/2026-11-23-msq-b1-second-half.md · 250 pictures · 26 surfaces · 8 orders · MISSING: 3 open (F1, F2, F3 — to the host), 0 fixed, 0 ruled`

`Docs: OUTSTANDING 191 items (+1 −0) · DECISIONS D1–D2380 (new: D2298, D2300–D2311, D2317–D2326, D2334–D2336, D2380) · homes OK`
`docsize: OVER by 79, deferred (D29)` (the branch's own backlog; this sheet trims nothing)
