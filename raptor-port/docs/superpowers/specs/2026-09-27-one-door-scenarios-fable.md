# [ONE-DOOR] — walk design (Fable 5.1, read-only, 27 Sep 26)

Brief: `raptor-port/docs/superpowers/briefs/2026-09-27-one-door-scenarios.md`. Fable 5.1's report, verbatim, saved by
the builder (its run's own output file came back empty). What the builder did with each item is in the evidence sheet,
`raptor-port/docs/handpass/2026-09-27-one-door.md` §3–§4.

Read: the brief, the plan (§1, §C, §9), the review log, ui-contracts §Admin → Users — one door, the mock-up, D280–D324 (how-we-work), leave-war.md "Also read", and the full branch diff (`git diff origin/main...claude/one-door`) for UsersPanel, WelcomeBack, App, Shell, QualsPage, accounts, roster-add, perms, view, people-settings-commit, hooks, sync, store, people, Matrix, BidPicker, the e2e and the mock script; plus the untouched readers of a person's state (people.ts, publish.ts, faceattrs.ts, insights.ts, palette-html.ts, html.ts, inputedit.tsx, InputsCal.tsx, tracker/peoplewire.ts, OilTracker.tsx, availability.ts, sync.ts `availableFor`). Nothing edited, nothing run.

The THING being checked: **a person's sign-in state × roster state × time in the squadron (his stints)**, and who draws or changes each.

---

## 1. ROLL-CALL — every place the app draws or changes the thing

Legend: **has it** = the code path exists on the branch (where I checked); **must not, because…** = correctly absent; **MISSING** = should exist, does not; **OBSERVE** = exists but the walk must look at it (a judgement or a first-time surface).

| # | Surface (width) | Draws / changes what | Verdict |
|---|---|---|---|
| R1 | Admin → Users, People list (desktop) | one row per roster man A–Z; Sign-in dot (green/red/grey), Roster dot (green); role pill; seat·CAT; posting-out tag; held note; "you" | **has it** (`UsersPanel.tsx PersonRow`, `Dots`, `postingPendingTag`) |
| R2 | Admin → Users, People list (phone, drilled in) | same, role word inline, pill hidden, boxes inside the pane | **has it** (postout.css @820; e2e geometry pins fit) — OBSERVE the date box on iOS |
| R3 | Admin → Users, opened row — active | Sign-in, Role, Save · Suspend · Archive · Delete · Cancel | **has it** |
| R4 | opened row — suspended | Save · **Enable** · Archive · Delete | **has it**; Enable arms the admin's Quals prompt (D307) |
| R5 | opened row — no sign-in | Sign-in (empty), Role → **Give sign-in** · Archive · Delete | **has it** (`addAccount`) |
| R6 | opened row — your own | cannot open | **must not, because** D166 — another admin changes it (`disabled`) |
| R7 | ▸ Archived · N (folded; hidden at 0; opens while search matches) | archived men, red Roster dot, red/grey Sign-in dot | **has it** — OBSERVE: while a search matches an archived man the ▾ button cannot fold the group (state flips but the OR keeps it open) — a small dead control |
| R8 | archived row opened | Callsign box (next free "<cs> 2" when taken + the taken line), Post in (today), the "counts him from" line, Restore / Restore as, Save name (only when renamed), Delete (two taps), Cancel, `#accArErr` | **has it** |
| R9 | archived row — Enable / Suspend / Save role | absent | **must not, because** D322 "no Enable on an archived row"; write path refuses too (`updateAccount`) |
| R10 | Waiting for access | Give access / Refuse; New person asks Post in; On the roster does not | **has it** |
| R11 | Add a person (foot) | New person only, Sign-in blank allowed, Post in (today), Role once a sign-in is typed, "Add person" / "Add person and sign-in" | **has it**; "On the roster" half gone — **must not** (a roster man gets Give sign-in on his row) |
| R12 | Admin → Users: a man whose **post-in is still to come** (restored with a later date, or added with a future date) | a sign on his row that the war does not count him yet | **MISSING** — `postingPendingTag` reads only `to` (posting OUT). Roster dot green is right (D308: access at once), but nothing says "post in 19 Oct". Same for a man whose posting has RUN with outcome none (D303 "off the manpower, nothing else"): no sign at all. A question for him, not a ruling breach — see §4 |
| R13 | Admin page category rail (phone list / desktop rail) | "Users · Who can sign in" | OBSERVE — the sub-line still says who can *sign in*; the pane is now every person's whole state (`AdminPage.tsx:40`) — an on-screen word the door left behind (F6's kind) |
| R14 | Quals — every seat view, edit mode | no ✕ column, no Archived drawer, help line "Archive, restore and delete are on Admin → Users."; the admin's "X is back — Check his quals" prompt (skips a man archived again) | **has it**; archived man off the table (`qualsIds`) — **must not** show him |
| R15 | Quals — "+ Add person" | opens Admin → Users on the add form, callsign box ready | **has it** (ADMINOPEN) |
| R16 | Quals CSV / print | archived man absent | **has it** (same `qualsIds`) |
| R17 | The man's welcome note (every page, under the top bar; desktop + phone) | "Welcome back, <cs> — check your quals and CAT." Check my quals / Later; only while `back` set; only for him; not for a guest/pending/suspended/archived/deleted | **has it** (`WelcomeBack.tsx`, `#shell > .welcome-back`) — OBSERVE on the Leave War and Tracker pages too (it is meant to be on every page; check it does not collide with the war's frozen date bar on a phone) |
| R18 | Quals after "Check my quals" | his own row outlined, his seat view chosen, once | **has it** (`QUALSFOCUS`) |
| R19 | Sign-in screen — suspended account (Archive, hand Suspend, posting) | "Your access is suspended — Ask an admin to enable it when you're back." | **has it** (`signIn` → 'off'). OBSERVE: for an ARCHIVED man the admin cannot "enable" — he must Restore; the sentence is fine for the man, but note it |
| R20 | A lapsed session (account suspended / person archived or deleted while signed in) | next repaint → suspended screen, writes refused | **has it** (`App.tsx` effect, `sessionLapsed`) — only reachable in one browser via the posting pass crossing its date (scenario S12) |
| R21 | Leave War grid — his row | rows for every stint; gap day = PO + hatch; before FIRST stint = blank; PO corner on each stint's last day; no row in a period he was away for the whole of (unless a record of his stretches it) | **has it** (`rowInWindow`, `beforeFirstStint`, `lastDayIn`) — OBSERVE the "records stretch the row" rule: an approved leave dated in a later month shows his row there hatched (pre-existing behaviour, now meets D323's "a leave period wholly after today does not show him") |
| R22 | Leave War — manning counts, availability, the counts rows | not counted on a gap/PO day, counted from the post-in | **has it** through `inSquadron` (`availability.ts`) |
| R23 | Leave War — OIL tracker (per person), figures drawer, balance | an archived (kept) man still listed with his balance; a deleted man out | **has it** by design (`OilTracker.tsx:240 !p.gone`) — OBSERVE it is what D323 "past kept" wants |
| R24 | Leave War — the Post out sheet of an **Admin-archived** man | read-only: reason line, date disabled, no chips, no Undo | **has it** (`lockedWhy`) |
| R25 | Leave War — the Post out sheet of a **posting-archived** man (`archivedBy:'po'`) | as before: chips, date, Undo post out (= UNDO mode, same stint) | **has it** (not locked — by design, F7) |
| R26 | Leave War — the **Post in sheet** of an Admin-archived man (a tap on a day before his `from`) | — | **MISSING lock**: `postInOr` → `setPostIn` is not refused for `archivedBy:'admin'`; the sheet offers "Undo post in", which lays "here from always" over his closed stint while he is archived. Not a way back (his `to` stays), but the "one way back / read-only while archived" promise (F1) covers only the Post OUT sheet. Low, see §4 |
| R27 | Leave War — the Post in sheet of a man back from a posting | "Back from a posting on <date> — on the manpower from <date>…", no Undo | **has it** (`backFrom`) |
| R28 | Leave War — bid sheet PO / drag-selection PO on an Admin-archived man | the block sentence shown; the write refused | **has it** (`postingBlocked` → `adminArchived`; `postOutOr` → `postOutProblem`). OBSERVE whether the confirm button is merely warned or actually inert |
| R29 | Leave War — a tap on a day INSIDE an earlier stint | ordinary bid sheet (admin can add leave/OIL there); no posting sheet | **has it** (`postingSheetFor`) |
| R30 | Leave War — posting dates aimed at a past stint | refused with the "was posted out on … came back on …" sentence | **has it** (`postingProblem`) |
| R31 | Leave War — Undo post out (top of Post out sheet) | Admin-archived: refused/absent; po-archived: works, same stint | **has it** |
| R32 | Leave War — Show SANS on/off | a hidden SANS man archived keeps his row only when he has a past there | **has it** (F3) — OBSERVE: with Show SANS OFF his row then APPEARS (kept in `state.people` with `to` set) although SANS men are hidden — the review said only what Show SANS ON shows |
| R33 | Scheduler crew palette / pickers / "+ add" lists | archived man absent; man with a future post-in PRESENT | **has it** (`palette-html.ts !archived`) — the future-post-in man being placeable by hand is consistent with D308 "access at once" |
| R34 | ALL AVAIL crowd (working copy) | archived man out on every date; a man out of his stint on that date out | **has it** (`sync.ts availableFor`: `p.archived` → skip; `inSquadron(lw, iso)`) — OBSERVE the consequence in S8 |
| R35 | A published day he is on — "N pending", the four sign-offs | Archive → 1 pending, sign-offs fall (D321 (7), D103); Restore to the same state → 0, sign-offs back (Astra 8) | **has it** (`publish.ts` roster comparison excludes archived) |
| R36 | Published day — the issued face (View-only Sched, CSV, print) | unchanged by Archive (his puck stays, as issued) | **has it** (D45 freeze) |
| R37 | Inputs page — admin's person filter | "Posted out / archived" optgroup lists him (an admin may still file past leave on him) | **has it** (`archivedOptions`) |
| R38 | Inputs calendar "+ Pucks" picker | archived man absent | **has it** |
| R39 | Insights (idle list) | archived man absent; his past pucks still counted | **has it** |
| R40 | Tracker — Students picker | archived man not offered; an enrolment already on a running course stays | **has it** (`peoplewire.ts`) — by design (only DELETE takes a running course, D299) |
| R41 | Admin tab badge, the bell | unchanged | **has it** |
| R42 | Undo / Redo (top bar) | Archive, Restore, a posting are NOT undo steps | **has it** (F14 pinned) — walk once |
| R43 | The member role (sign in as `us`) | no Admin tab; Quals no ✕/no archive; no posting doors on the war; no one else's welcome note; his own note after a Restore | **has it** |
| R44 | The admin's member view (D292; the badge / drawer switch) | Admin tab gone, his own welcome note only, switch back | **has it** |
| R45 | Reload after every act | PEOPLE (archived/back), accounts, the war's record (`past`) all persist in one command | **has it** (one command over three stores; `readPast` tolerant) |
| R46 | Guest view | untouched | **must not** change |

---

## 2. DOOR CHECK — every action → its on-screen control, in every state

| Action | Where the control is | Present in which states | Missing / note |
|---|---|---|---|
| Suspend | opened People row `#accEdOnOff` | active with account | — |
| Enable | same button | suspended, on roster | not on archived rows (design); refused at write path |
| Give sign-in | opened row `#accGive` | roster man with no account | — |
| Save (sign-in name / role) | `#accEdSave` | roster man with account | not offered for an archived man (must Restore first) — design, an explicit negative |
| Archive | `#accEdArchive` | every roster man except you | one tap, no confirm (D322 call) |
| Delete | `#accEdDel` / `#accArDel` | every roster row and every archived row | two taps + the line |
| Restore | `#accArRestore` (Archived group, opened) | every archived man | Post in date box `#accArPostIn` beside it; refusals in `#accArErr` |
| Restore as | same button, re-labelled when the box differs | archived man whose callsign is taken (box pre-filled "<cs> 2") | — |
| Save name (rename alone) | `#accArSave` | archived man, only when the box differs | — |
| Give access / Refuse | Waiting list | a request | New person asks Post in `#apvPostIn` |
| Add person / Add person and sign-in | foot form `#accAdd` | always (admin) | Post in `#accAddPostIn` |
| Post in date | the three boxes above | Restore, New person (foot), Give access → New person | **no door to CHANGE a man's post-in on Admin → Users later** — that is the Leave War's Post in sheet (a tap on a day before his `from`). Say so in the walk (not a defect; D308 built as "asked where a man arrives") |
| Check my quals / Later | `#welcomeCheck` / `#welcomeLater` | the restored man himself, signed in | — |
| Undo post out | Leave War Post out sheet | posting-archived man only | absent for Admin-archived (design) |
| Post in / Post out (war) | bid sheet, Post in/out sheets, drag selection | admin; refused on Admin-archived (Post out) and on past stints | Post IN sheet not locked for an Admin-archived man (R26) |
| Sign in as the archived man | login form | → "Your access is suspended" | — |

The walk is doable through the app's own controls **except**: (a) making a session lapse (R20) needs the posting pass to cross its date — the Playwright clock (`page.clock`) as the e2e uses it; (b) a second admin must be MADE first (Give sign-in with role Admin on any roster man) — the demo seeds one admin only (`ad`/Saber).

---

## 3. RANKED SCENARIOS (least-shared / most specialised first)

Setup baseline for all: the production bundle at 4173, `?fresh=1`, signed in as `ad`/`a` (Saber). Clock fixed at 27 Sep 26 09:00 (the e2e's `TODAY`) so "today" = 27 Sep and yesterday = 26 Sep. People: Hex = `rocky` (account `hex`), Outlaw = `casper` (`outlaw`), Ranger = `bane` (`us`), Vector = `divot` (no account). Widths: **D** = 1440×900, **P** = 390×844. Reload after each step marked ↻.

**S1 — Show SANS off, archive a hidden SANS man who has a past (F3 / R32). D.**
Setup: Quals → tick SANS on Drifter (no account); Leave War → Show SANS off (he vanishes); before that, give him an approved leave in May via the war (Show SANS on, place LL 4–6 May, then off). Action: Admin → Users → Drifter → Archive. Expected: toast; he moves to Archived; on the war with Show SANS OFF — *either* no row (SANS hidden) *or* a kept row in the SANS group hatched from today; with Show SANS ON his May leave is there, PO from 27 Sep. Disproof: with Show SANS on his May row is gone (past lost), OR with Show SANS off his row appears in a non-SANS group. ↻ both switch states.

**S2 — Archive over a pending posting; then Restore (D323 (3), F13). D + P.**
Setup: Leave War → tap Vector on 14 Oct → PO → Overseas Sqn from 14 Oct. Admin → Users shows "posting out 14 Oct · Overseas Sqn" on Vector's row. Action: open Vector → Archive. Expected: toast "Vector archived — his sign-in is suspended; his posting out on 14 Oct (Overseas Sqn) is replaced" (no account → check the wording still says "sign-in is suspended" — OBSERVE: he has none; the sentence is unconditional in `archivePerson`); war: PO from 27 Sep, Oct hatched, poDone set so no held note. Restore with post-in 1 Nov. Expected: the 14 Oct posting is GONE (not revived), Oct reads PO (gap), Nov counted; his row shows no tag. Disproof: the pending posting survives in any form, or a held note appears, or the message names a date. ↻.

**S3 — A SANS man whose posting has RUN, Show SANS on; then Archive. D.**
Setup: post out Ranger as SANS from 20 Sep (past) → the pass ticks SANS; Show SANS on → his whole row in the SANS group, tracked (D321 (6)). Action: Archive Ranger. Expected: SANS tick taken back (Quals), his row leaves the SANS group, hatched from 20 Sep (the run posting's date KEPT — D323 (1)), outcome now reads overseas; the message does NOT name a replaced posting (date passed). Disproof: the hatch starts 27 Sep instead of 20 Sep (the date moved), or he stays in the SANS group. Then Restore post-in 1 Oct → the stint Aug–19 Sep in `past`, Oct on. ↻.

**S4 — Post-in still to come, then Archive, then Restore (F4). D.**
Setup: Add a person "Nova", pilot, CAT C, no sign-in, Post in 15 Oct. Expected: People row green/grey; war: no row in Sep (not arrived), blank days before 15 Oct in the Oct period; ALL AVAIL crowd on a Sep day excludes him; crew palette includes him (R33 — record it). **R12 check:** his Admin → Users row shows NOTHING about 15 Oct. Action: Archive Nova today. Expected: he goes to Archived; war: no row anywhere ("never here"); no backwards stint (his stored record must be `{from: 15 Oct, to: null}` or gone — read it via the Leave War, never a red hatch in Sep). Restore, post-in today. Expected: counted from 27 Sep, no PO corner anywhere. Disproof: a Sep row hatched, or Restore refused. ↻ each.

**S5 — Suspend by hand → Archive → Restore (D322). D.**
Setup: Hex → Suspend (red dot). Archive Hex (dot stays red; Archived group). Restore, post-in today. Expected: Hex's Sign-in dot GREEN (both back), admin Quals prompt "Hex is back", Hex row on Quals. Sign out, sign in `hex`/anything → welcome note. Disproof: still suspended after Restore. Then the mirror: Archive Hex, then on the archived row there must be NO Enable; sign in as `hex` → "Your access is suspended". ↻ between.

**S6 — Restore same day vs later (F5 / D320), both stints on the grid, then Archive again (F4), then Delete. D + P.**
Action A: Archive Outlaw; Restore post-in 27 Sep (today). Expected: no PO corner on 26 Sep, Sep reads as normal, `polast` absent. Action B: Archive again; Restore post-in 19 Oct. Expected (the e2e's shape): 26 Sep wears the PO corner (title "…last day of an earlier stint" when a later stint exists — check which title), 27 Sep–18 Oct PO+hatch, 19 Oct on counted; manning count on 5 Oct lower by one; a tap on 10 Oct opens the CURRENT Post in sheet with "Back from a posting on 27 Sep — on the manpower from 19 Oct", NO Undo; a tap on 20 Sep (inside the old stint) opens the ordinary bid sheet; Post in sheet date moved to 26 Sep → refused with the "was posted out on 27 Sep and came back on 19 Oct" sentence. Action C: Archive again TODAY. Expected: the future stint dropped, back to one closed stint (to 26 Sep), no empty stint, hatch from 27 Sep. Action D: Restore 19 Oct, then Delete from the People row (two taps). Expected: gone from every list; the war keeps Sep as it was up to 26 Sep and shows nothing from 27 Sep (cutoff = real today). Disproof: any red hatch between the two stints missing, a corner on the wrong day, a stint that opens after it closes stored (a row that reads PO on every day). ↻ after each.

**S7 — Restore as (D286/D295) and Save name. D.**
Setup: Archive Dash; Add a person "Dash" (new man, pilot). Open archived Dash. Expected: box pre-filled "Dash 2", the taken line, button "Restore as Dash 2", Save name shown. Action 1: Save name → toast "Renamed Dash 2"; the row now reads Dash 2; OBSERVE published/past days he flew now read "Dash 2" (a rename is a label change — D186; record it). Action 2: Restore as → he is back as Dash 2, sign-in on if he had one. Disproof: Restore goes through under the taken callsign, or a refusal without a sentence in `#accArErr`. Also: type 15 letters → refused, never cut (D226).

**S8 — The published record (Astra 8, D321 (7), D45/D103). D + P.**
Setup: publish Monday with Hex in a cockpit seat; publish Tuesday with an ALL AVAIL puck on a duty desk whose crowd includes Hex (Hex on no named seat that day); sign all four on both. Action: Archive Hex. Expected: Monday "1 pending", four sign-offs fall, the issued face unchanged; Tuesday — per D321 (7) as built, ALSO "1 pending" (his crowd membership flips because `availableFor` skips an archived man on EVERY date, unlike a delete which is read by date). Record this as the consequence of D323 "past kept" meeting D321 (7) — not a defect, but he should see it. Restore post-in today → both days 0 pending, sign-offs back (Astra 8). Restore post-in 19 Oct instead → Monday (this week, before 19 Oct) still 0? — `availableFor` on a September date: `inSquadron(lw, iso)` for a gap day is FALSE → Tuesday's crowd still excludes him → Tuesday stays "1 pending" until 19 Oct. Disproof: the issued face changes, or the count/sign-offs disagree with each other. ↻.

**S9 — The two doors for a posting-archived man (F7). D.**
Setup: post out Hex Overseas from 20 Sep (past) → the pass archives him (`po`), suspends `hex`. Door 1: Leave War → his PO day → Post out sheet — NOT locked; Undo post out → same stint continues (no PO corner), sign-in on (posting's suspension only), admin prompt, NO welcome note on his sign-in. Reset. Door 2: Admin → Users → Archived → Restore post-in 1 Oct → new stint, welcome note on his sign-in, sign-in on. Disproof: either door shows the other's result (a welcome note after Undo; a gap after Undo).

**S10 — Give access → New person with a post-in; a request under an archived man's callsign. D + P.**
Setup: sign out; sign in `ace@mail` → Request access as "Hex", initials, pilot, CAT C (Hex is archived from S9/S5 → free callsign). Admin: bell lights; Waiting shows Give access/Refuse; Give access opens on New person with the archived note; Post in default today; set 5 Oct; Add person and give access. Expected: new Hex on the roster, account `ace@mail` on; war row counted from 5 Oct; archived old Hex row reads "taken" → Restore as. Disproof: the request approves without a post-in, or the new man is counted from always.

**S11 — Give sign-in, then a lapsed-by-posting session (R20), the sign-in screens. D.**
Setup: Give sign-in to Drifter (`drifter@mail`, Member). Sign out; sign in as `drifter@mail`/x → the app; no welcome note (never restored). As admin (clock 27 Sep 23:50): post out Drifter Overseas from 28 Sep. Sign in as Drifter; advance the clock to 28 Sep 00:10 and tap anything on the Leave War (a repaint). Expected: the pass archives + suspends him; the NEXT repaint lands him on "Your access is suspended"; his prior writes stand, later ones refused. Disproof: he keeps working. Also: the posting pass on the LAST admin → held note on Saber's own row (D306; pre-existing, one look).

**S12 — Restore sets `back` with no account, then Give sign-in (F12). D.**
Archive Vector (no account) → Restore post-in today → Give sign-in `vector@mail` → sign in as him → welcome note; Later clears; sign out/in → no note. Check my quals path once on P: lands on Quals, his row outlined, note gone. Disproof: no note, or the note shows to Saber.

**S13 — Roles: member and the admin's member view. P + D.**
Sign in `us`: no Admin tab; Quals has no ✕/Archived; the war shows Hex's stints but no posting sheets on a tap (bid picker instead); no welcome note. As `ad`: switch to member view via the badge (D) / drawer (P) after a Restore of Saber by another admin (make Outlaw admin first; as Outlaw archive+restore Saber) → Saber sees HIS note in member view; switch back. Disproof: Admin tab visible in member view; another man's note shown.

**S14 — Search × Archived group, phone fit. P.**
Type "hex" → People filters; the Archived group opens while it holds a match; tap ▾ → OBSERVE it cannot fold (R7); clear the box → group state. Open a row, open an archived row, the Add form — nothing past the pane edge; the date box opens the OS picker. Disproof: horizontal scroll, a clipped button.

**S15 — Undo button after Archive/Restore (F14). D.**
On Edit Schedule make one edit, Archive Hex on Admin → Users, return, press Undo. Expected: only the schedule edit reverts; Hex stays archived; Redo likewise. Disproof: Hex un-archives.

**S16 — Reload sweep. D.** After S2, S4, S6B: reload; Admin → Users lists, dots, the Archived group, the war's stints and the PO corner all as before; the admin's Quals prompt is gone (session-only — expected, say so).

---

## 4. Suspected missing lines — exact file and why

1. **`raptor-port/src/ui/UsersPanel.tsx` — `postingPendingTag` / `PersonRow`**: no sign for a post-IN still to come (a restored man with a later date; a new person with a future date), nor for a posting that has run as "none". The brief names the first as a state to cover; on screen his row is indistinguishable from an ordinary roster man while the war and ALL AVAIL do not count him. `postingPendingTag` (`src/leavewar/sync.ts`) reads only `w.to`. Missing SIGN; whether it is wanted is his call (D308/D310 name only the posting-OUT tag).
2. **`raptor-port/src/leavewar/ui/Matrix.tsx` (`openNotYetArrived` → `PostInSheet` `onUndo`/`onChange`) and `store.ts setPostIn`**: an Admin-archived man's Post IN sheet is not read-only and its "Undo post in" is offered — round 1's F1 locked the Post OUT sheet only. `setPostIn` has no `adminArchived` refusal (the block lookup is not consulted there). Consequence: while archived his stint's start can be moved or cleared from the war; he stays archived, so not a way back — but the "restore him there" rule reads only half the sheets.
3. **`raptor-port/src/leavewar/state/store.ts setPostOut`**: the plan's F1 disposition says `setPostOut` refuses an Admin-archived man; it does not — the refusal sits in `sync.ts postOut()` (`postOutProblem`) and `undoPostOut`. Every UI door goes through `postOutOr` → `postOut`, so users are covered; only the probe bridge (`lwSetPostOut`) bypasses it. Low.
4. **`raptor-port/src/leavewar/sync.ts archivePerson` → `closeStintOnArchive(id, today, keepHidden)`**: for a man the war does NOT show (a hand-ticked SANS man with Show SANS off) who has a past there, the identity comes from `projectPeople(true)` (`from: null, to: null`), never from `state.postOuts[id]`. If he had a stored `from` (every new person now has one — D308), `windowRecord` overwrites it with `{from: null, to: yesterday}`: his post-in date is lost and his months before it read "here" once Show SANS is on. Narrow but reachable with new data (new person → SANS tick → Show SANS off → Archive). `store.ts closeStintOnArchive` could read `state.postOuts[id]` before falling back to `identity`.
5. **`raptor-port/src/leavewar/state/store.ts forgetPersonFrom` (`cut`)**: a man with a FUTURE `from` and no `past`, deleted, is stored as `{from: future, to: yesterday}` — a backwards stint, against the F4 invariant "never stored". `readPast` checks only the past list, so it loads. On screen nothing shows (`inSquadron` false everywhere, `rowInWindow` hides the row) — harmless today, but the invariant is the new readers' contract (Flow J's drift seam). Low.
6. **`raptor-port/src/ui/AdminPage.tsx:40`** — the Users category's sub-line "Who can sign in" is now half the truth (an F6-kind leftover word).
7. **`raptor-port/src/leavewar/sync.ts archivePerson` message**: "…his sign-in is suspended" is said even when he has no sign-in (`suspendForArchive` → 'none'); the posting sheets already word the account conditionally (`hasAccount`). Small, plain-words matter (D300).
8. **`raptor-port/src/leavewar/sync.ts postInNewPerson`**: `openStint` returns false when the war's role is not admin (the admin's member view writes the war's role) and the add then throws "Pick the post-in date" — a misleading sentence for a role refusal. Only reachable if an add door exists in member view; the Admin tab is gone there, so likely unreachable — check Quals' "+ Add person" is absent in member view.

Explicit negatives (checked, correct as absent): no Enable/Save on archived rows; no "On the roster" half on the foot form; no ✕ or Archived drawer on Quals; no Undo on a man-back Post in sheet; no posting doors for a member; Archive/Restore not Undo steps; deleted men on no list; a guest untouched.

Not findings (D56): any half-state already stored in demo data (an archived man whose seeded account is still `on`, a pre-branch one-window record) — the code refuses each anew, and `sessionLapsed` even turns such a legacy sign-in off on first repaint.
