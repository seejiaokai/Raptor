# The Leave War overhaul — the build plan (for his approval)

Written the night of 21–22 Oct 26 (D1204: "plan it well before we build"), after the whole design was red-teamed (the
design note `../specs/2026-10-21-leave-war-overhaul.md` §10). Inputs: the code map
(`2026-10-22-leave-war-overhaul-code-map.md` — every ruling to its files), the red team's two reports
(`../briefs/2026-10-22-lw-overhaul-red-team-A.md`, `…-B.md`), the design note §5, §6, §9, §10. **Nothing is built from
this plan until he approves it** — and until he has answered the questions each batch waits on (§2).

## 1. The shape

Eleven batches in the order the code needs them, carried as **five merges** (D1087: two to four related jobs of one
area share one branch, one check, one "merge live"; D485: one bug check sized by the riskiest change). Each merge is its
own branch cut from `main` once the merge before it is live, its pull request opened as soon as it is built so GitHub's
run goes while the app is walked (D1086), its bug check in full (`../../bug-check-order.md`), nothing merged without his
"merge live".

| Merge | Batches | What he will see | Tier · walk | Code reads | Rough time |
|---|---|---|---|---|---|
| **M1 — open dates** | 1 | the stage chip and its menu gone; "Open 1 Jan – 31 Mar" / "Bidding closed"; the "Open for bidding" window with month buttons; closed days dimmed, each open stretch outlined; the closed note; the page opens on the first open date | FULL · wide (member and admin, phone and desktop, every place the stage was read) | two (D790: fresh, blind Opus; a ChatGPT reader on `[NO-ASTRA-LIST]`) | a long day |
| **M2 — how it looks** | 2, 3, 4 | look F's colours; halves and two entries in a cell; Ack gone; the Legend; "Balances" a button; the Required / Available rows' names, amber and red points, faint tints; the top rows (View, no "Viewing as", My leave) | FULL (the OIL award's half) · wide; the grid's speed measured before and after | two | a long day |
| **M3 — placing leave** | 5, 6, 7 | the bid windows (the day line, balances on the buttons, Document above "Which leave", filled / hollow buttons, "Approve what I enter" in the title bar, the "Also" row); the day panel; documents on every entry and on the Inputs page | FULL (a new admin command; documents saved and carried) · wide | two | a day |
| **M4 — deciding** | 8, 9 | Approvals (docked on a desktop, two-line on a phone, "Approve all — tap again"); the bell's Leave War lines | FULL (saved fields, one-command Approve all, the bell, permissions) · wide | two | a day |
| **M5 — the rest** | 10, 11, and the approved person window, "since your last visit", Settings | events and holidays by file; Management first; one person window with every balance and the lock; "● new"; the new Settings | FULL (members writing their own balances — a permission) · wide | two | a day |

**Why this order.** Nearly every later screen reads the stage (the code map §3, risk 1: about 150 places in 17 files) —
building any of them first would be rebuilt when the stages go. The cell (M2) comes next because the bid windows,
Approvals and the day panel all draw its boxes. Documents (M3) land before Approvals (M4) so its document icon has data.
The bell (M4) comes after the decisions it reports, and never shares a merge with M1 (both are high risk).

## 2. What each batch waits on — his twelve questions (the design note §10.3)

| Question (recommended answer) | Batch it governs | Without his answer |
|---|---|---|
| Q1 "since your last visit": A (count on My leave and Approvals) | M5 | that piece waits; the rest of M5 goes on |
| Q2 one balance lock for everyone, in Settings | M5 | the lock waits; balances stay admin-set as today |
| Q3 the balance box takes his official figure | M5 | member editing waits |
| Q4 no member-typed OIL | M5 | OIL stays read only (today's behaviour) |
| Q5 a member deletes his own waiting bid on a closed day | M1 | built as today's rule (refused) until answered — **asked before M1 starts** |
| Q6 no member bid before today | M1 | **asked before M1 starts** |
| Q7 Available P / W at amber or red count as under-manned | M2 / M3 | the chip and the bid line name Manning rows only, as today |
| Q8 members' bell told of bidding opening and closing | M4 | not sent |
| Q9 a member's phone: Manning folded and remembered, My leave in line 1 | M2 | today's layout with My leave as a third line (D1141) |
| Q10 "+ SANS" in place of the Show SANS switch | M5 | the switch stays |
| Q11 the bell keeps "approval taken back" after an Undo | M4 | the line is taken back silently, as D148 has it |
| Q12 the phone's zoom pair become magnifiers | M2 | the "−" / "+" stay |

## 3. The batches

Each batch lists its rulings, the red team's fixes it carries (§10.2 of the design note), what it stores and who may
do it, and what it must not break. Files: the code map §1 and §2.

**1. Open dates replace the stages** (D1177, D1176, D1168, D1169, D1172, D1166 pinned, D827's words, D352, D333, D418,
D413 as narrowed). Fixes: **B2** — no open dates means closed (a new period takes no member bid; one rule answers "is
this day open" for the cell, the dim, the outline and the landing day); **B3** — ask the period holding each date, never
the one on screen; **B8** — the open-days check joins the war's permission, and a decision taken from a state since
changed is refused; **A7b** — a month drag runs in calendar order; **B12** — one command per drag (one Undo, one
repaint), "No leave period yet" without "draft". Stores: the period's open stretches and its last-closed note; the stage
and the bidding dates dropped (demo data cleared — D56). Permission: the open-dates writer replaces the stage's
(`state/perms.ts` and `docs/data-model.md` §11 together — D200). The five behaviours that hung on the stage each get
their written rule first (the design note §9.3's Q5 table). Must not break: the Inputs page is never stopped by the
open dates (D1166); undo and redo leave the grid where it is (D672); the grid's speed (§E).

**2. The cell and the Legend** (D1158, D1175, D1160, D1145, D1164, D1146, D1167, D1185). Stores: the OIL award's half
(D1164 — the OIL rulings D79–D82, D260 checked). Must not break: the grid's speed (one memo per month, its node band),
the clash corner, the moved and Inputs-page marks.

**3. The Required and Available rows** (D1190, D1191, D1202, D1193, D1194, D1154). Stores: the two Available rows'
amber and red points (a number plus or minus the day's Required), the Required rows' names. Must not break: the SANS
calendar and the Calendar window read the Available rows (`sync.ts` — the SANS day keeps "Available", D626); the four
rows repaint only when their month's answer changes, so the points must be part of it.

**4. The top rows** (D1173, D1174, D1141, D678, D679, D1196, D1188 as ruled; Q9 if answered). Re-measured at 390, 431–700
and his iPhone's wider letters.

**5. The bid windows** (D1144, D1183, D1147, D1186, D1187, D1182, D1153 pinned, D1159). Fixes: **A2** Document above
"Which leave"; **A8** filled / hollow buttons by the tick; **A9** two even rows, "Also"; **A5** on a phone the tapped cell
scrolled above the window. Permission: place-and-approve is a new admin command.

**6. The day panel** (D1143, D1198). Fix **A12**: pucks. Drawn outside the grid (§E untouched).

**7. Documents** (D1150, D1159, D1179, D1151's register line). Fix **B9**: a put-back carries its documents; deleting one
day never deletes a document another day names. Stores: the request's document list, carried to the Input on approval
and back on put-back. Permission: adding a document on a closed day.

**8. Approvals** (D1152, D1197, D1184, D1189, D1192, D1180, D1181, D1178, D1196, D1188). Fixes: **A4** "tap again",
plain line buttons; **A5** docked on a desktop; **A11** two lines on a phone; **B12** a posted-out man's line tagged, a man
with no row opens his person window. Stores: who placed a request and when (the list is oldest first). Must not break:
Approve all is one command and one Undo; a line the clash rules refuse is reported, never a whole-list failure.

**9. The bell** (D1142). Fix **B1**: while the war's own door writes, the Inputs door's notice skips war-placed leave and
the war writes its one line; Inputs-page changes keep telling him (test R36). Stores: a new kind of notice. Permission: a
third notice writer (a refusal changes no input).

**10. Events and holidays** (D1155). Export / Import on the Holidays list (one record, D638); the events list in the new
Settings (after M5's Settings is approved).

**11. Management** (D1200, D1149). Fix **B10**: Management stands first on the page and in "Who wins".

**Waiting on his look (M5):** the person window (D1201, D1203 — fixes A1, A3/B7, A10, B6: a member writes only his own
balances while unlocked, a history line, halves only), "since your last visit" (D1199), the Settings window (D1205 —
fix A12's Rearrange button, "Add a group").

## 4. The checks, the same for every merge

The bug-check order in full: the roll-call of every place the change is drawn first; the walk sized at the build
(§7.0, the walk ledger) and walked by Sonnet 5.5 helpers with pictures (D787), never replaced by a test that changes the
data directly (D608); GitHub's run of the pull request as the full check while the repo is public (D1086), the tests of
what changed on his PC; two fresh, blind Opus reads of the finished code (D790 — Fable only on his word, D903); every
read without a ChatGPT reader written on `[NO-ASTRA-LIST]` (D761); the evidence sheet with its `Walk:` line; pictures
for his look; "merge live" his.

## 5. The risks, and how each is held

1. **The stages' reach** — the five behaviours written as rules before the build; every test that builds a stage moved
   to open dates in the same change; the walk covers every place the roll-call names.
2. **The bell telling twice** — B1's fix, with a test that a put-back rings one line.
3. **New saved fields** (open stretches, the award's half, who placed and when, documents) — each with its reader, its
   row mapping, `docs/data-schema.md` and `docs/data-model.md` in the same change (D473).
4. **The grid's speed** — measured on the built bundle before and after M2 (§E); the day panel and the Available points
   kept out of the grid's repaint.
5. **Permissions moving together** — every new writer has its `perms.ts` row and its §11 row in one change (D200); the
   parity test catches a missing row, a reader checks the sentence.

## 6. Tonight (D1207)

His permission for tonight covers pieces that need no answer or look from him and can be fully checked. **None of the
merges above qualifies whole** — each carries either a question of §2 or a look he has not seen in its final form (the
final set, §10.4 of the design note, is drawn tonight for that look). So tonight builds nothing of the overhaul itself;
what the night may build is named in its handoff block, with its reason.
