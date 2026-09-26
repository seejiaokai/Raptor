# Evidence — `[ACCOUNTS-NEW-PERSON]`: one door for a new person, the sign-up asking the same, the admins' bell (D214, D216, D217, D219, D220, D222, D224–D227) — 26 Sep 26

Branch `claude/accounts-new-person`. Plan `docs/superpowers/plans/2026-09-26-accounts-new-person-plan.md` (red-teamed by
Fable 5.1 and Astra; their reports `docs/superpowers/specs/2026-09-26-accounts-new-person-redteam-r1-{fable,astra}.md`).
Register `docs/superpowers/specs/2026-09-26-accounts-behaviour-register.md` (NP1–NP8). Built by Opus 5.5. Scenarios
designed by Fable 5.1 (its report's Part 2, S1–S17). The approved design: `docs/mock/new-person-account.html` (D224).
Walk script `scripts/handpass/np-walk.mjs`; pictures `docs/img/handpass/2026-09-26-accounts-new-person/walk1/` (the first
walk — the defect's evidence) and `…/walk2/` (the re-walk).

## 1. The eight questions and the tier
1 Money — NO: no OIL, no leave; a new person earns nothing until he is scheduled, as a Quals add did. 2 The published
record — NO: no publish, sign-off or amendment path changes (a new person on the roster changes no issued day). 3 Saved
data — YES: a new stored shape for the access request (initials, seat, CAT, who has seen it); a person and an account
written together. 4 A shared drawer — YES: a new person appears on every surface that draws the roster (Quals, the crew
lists, Inputs, the Leave War, the Tracker). 5 A new gesture or mode — YES: New person on add and approve; the bell's new
trigger; Quals' button to Admin → Users. 6 A new surface — YES: the new-person fields, the sign-up's four fields. 7 Roles —
YES: who may create a person (admin only, at the one door) and who may mark requests seen. 8 The warning list — NO.
**Tier: FULL.** The server question (D202, carried by a test): `perms.ts` and data-model §11 changed together — §11 rows
`Person` (note), `User` (note), `AccessRequest` (Admin R U D; note) — `perms.test.ts` green (§9).

## 2. The rulings swept
The plan's §The rules sweep: D214, D216, D217, D219, D220, D222, D224, D225, D226, D227; D204, D221, D166, D223, D200,
D202, D149, D218, D201, D138; 12 Aug + 14 Sep 26 (one callsign rule, PID-01); 26 Aug 26 (personnel hold no CAT); 25 Aug 26
(production words); 7 Aug 26 (a missing pick fails closed; a refused value never left looking saved); 16 Sep 26 (the one
command layer); D56. **One clash found and settled by the newer ruling (D90):** the 26 Aug 26 Quals head split
(Callsign/Name under Personnel only, "the aircrew views keep the plain word") → D219 (every view) — its code comment and
the ui-contracts passage carry the old words verbatim with the pointer (D138).

## 3. The roll-call — every place the change reaches (the plan's 29 rows)

Walk pictures are in `walk2/` unless marked `walk1` or `walk3`. "d-" desktop 1440×900, "p-" phone 390×844, "s-" a 1440×700 window, "f-" a fresh world. **The final build's pictures are `walk3/`** — the same steps and more, numbered differently (the step ids are the same; `walk3/walk.json` maps each to its picture).

| # | Place | After the build | Walked (picture) | Unit / e2e |
|---|---|---|---|---|
| 1 | Sign-up card | four labelled fields, D222 label, no Name box, selects as the boxes, refusals, D226's line | YES — `01`, `02`, `03`; phone `39`; short window `47` | `accounts-newperson` NP4; e2e "two selects" (both widths) |
| 2 | Waiting screen | "You asked for access as Viper (JKB · WSO · CAT C)."; no bell | YES — `04`, `05`; phone `40` | `accounts-newperson` NP4 |
| 3 | Switched-off screen, guest view | no bell mounted — no-because: not signed in to the app | NO — unchanged by this build; `[ACCOUNTS]` walked both (its sheet §3 rows 29–31); the guest's tree mounts no bell (`accounts-ui` AC12) | AC12 |
| 4 | Admin tab badge, drawer badge, the Users row's "N waiting" | unchanged counts | YES — `06`, `07` (badge 1 after seen); phone rail `41` ("1 waiting for access") | `accounts-newperson` NP6 |
| 5 | The bell | lit for an unseen request (his own); tap → Users from any page; out once the list was on screen; the phone's category list does not count | YES — `06`–`08`, `33`, `34`, `36`; phone `41`, `42` | `accounts-newperson` NP6 (both widths, the page already up), `accounts.test` NP6 |
| 6 | Waiting: the request line | "asked as Viper · JKB · WSO · CAT C · when"; personnel "· Personnel ·" | YES — `07`, `09`, `34` | NP5 |
| 7 | Approve — New person | four fields filled; "Add person and give access" | YES — `09`, `10`; phone `43`, `44` | NP5 |
| 8 | Approve — On the roster | the picker never pre-picked; the note naming the matched callsign — and, for someone who already has an account, saying so (Fable read #1) | YES — `26`, `27`, `28` (these show the list after Cancel, not the note); **`walk3/31`–`34`** with the form open | NP5 (both notes) |
| 9 | Add — On the roster | unchanged but the words | YES — `22` (gecko@mail linked later) | AC13 |
| 10 | Add — New person with a sign-in | person + account, one step | YES — `24`, `25` | NP3 (one command; one storage group, `txn-wiring`) |
| 11 | Add — New person, blank sign-in | roster-only person; no Role; "Add person" | YES — `19`, `20` | NP1 |
| 12 | The account editor | the words only | NO — label only; checked in source and by `accounts-ui` AC13 (the editor opens) | AC13 |
| 13 | The accounts list sort | a name among callsigns sorts by its letters — no-because: same sort | YES — `26` (Blaze, Gecko, Hex … Zephyr in order) | — |
| 14 | Quals "+ Add person" | → Users on New person, the box focused, every press; absent for a member | YES — **walk1 `30` FAIL (no focus)** → fixed → walk2 `30`; phone `45`; member `35` | e2e "leaves the cursor" (red first); `accounts-newperson` NP1; `quals.test` NP1 |
| 15 | Quals head + its frozen mirror | "Callsign/Name" in every view | YES — `31` (four views); the mirror is the same body (`qualsHead`) — not scrolled to | `quals.test` NP7 |
| 16 | Quals CSV export | first head "Callsign/Name" | YES — `32` (the downloaded file read) | `quals.test` NP7 |
| 17 | Quals table | the new person in his seat view, CAT chip, flight "-" | YES — `11`, `21`, `24` | NP1 |
| 18 | Crew lists (edit week palette, the board's Available crew) | the new aircrew person offered | YES — `12`; the board's Available crew **`walk3/13`** (Fable read #2a) | — (a projection of PEOPLE) |
| 19 | Inputs (admin files for anyone) | the new person offered | YES — `13`, `37` (personnel too) | — |
| 20 | Search | the new person found | YES — `14` | — |
| 21 | Leave War roster | the new person (aircrew by CAT; personnel in Personnel) | YES — `15`, `21`, `37` | — |
| 22 | Tracker "+ Add" | a new pilot/WSO listed; a new PERSONNEL person NOT — no-because: aircrew only by design | YES — `16`, `21` (listed), `37` (Zephyr, personnel, not listed) | — |
| 23 | Tracker "Or type a callsign" | makes a Tracker student, not a person — no-because (D191) | NO — unchanged; not a door to the roster | — |
| 24 | Admin's "On the roster" picker | a roster-only person linkable later | YES — `22` | — |
| 25 | The new person signs in | lands as himself; his Quals row editable, callsign read-only (D218); his Inputs; the Leave War lights his row | YES — `18`, `22`; his Inputs **`walk3/20`**, his Leave War row **`walk3/21`** (Fable read #2b) | NP3 |
| 26 | A reload after each | person, account, request, "seen" kept; a person + account as a fresh world's FIRST write, then a reload (§7.7) | YES — `04`, `08`, `17`; the fresh world **`walk3/55`** (Fable read #2c) | `accounts.test` NP6 (reload), `txn-wiring` NP3 |
| 27 | Undo, Edit history | the add is not undoable, writes no history row; an earlier schedule undo still works | YES — `38` (a cleared seat, then a person added, Undo brings the seat back, the person stays) | — |
| 28 | Member / guest / pending / switched off | no new door; the gate refuses a hand-made call | YES — member `35`; pending `05` | NP8 (`perms.test`, `accounts.test`, `roster-add.test`) |
| 29 | Help page, Logic page | nothing describes the old form — searched: no "Add person" there | NO — searched in source, not walked | — |

**Every row has a mark; every NO has its reason.**

## 4. The door check — every action and its control
| Action | Its control | State | Walked |
|---|---|---|---|
| add a roster-only person | Add an account → New person → "Add person" (sign-in blank) | admin | `20` |
| add a person with an account | → "Add person and account" | admin | `24`, `25` |
| approve with a new person | Approve → New person → "Add person and give access" | admin, request waiting | `10`, `44` |
| approve linking someone on Quals | Approve → On the roster → "Give access" | admin | `accounts-ui` AC13 (unit) |
| reach the add form from Quals | Quals "+ Add person" | admin, any page | `30`, `45` |
| reach the waiting list from the bell | the bell | admin, any page incl. Admin → Squadron config | `36`, `42` |
| ask for access | "Request access" | pending | `04`, `40` |
| cancel and reopen an approve | Cancel → Approve | admin | `29` |
| switch On the roster ↔ New person | the pair | admin | `29` |
| leave the archived refusal | Quals → Archived → Restore → back | admin | NO — the refusal and its words are unit-pinned (`roster-add` NP2); the Restore door is `[ACCOUNTS]`-walked |

## 5. The walk — what it found

**Walk 1 (`walk1/`, 47 steps): 42 PASS, 0 browser errors.** The five FAILs, each dispositioned:

| # | What the walk saw | Disposition |
|---|---|---|
| W1 | Quals' "+ Add person" opened Admin → Users on New person, but the Callsign/Name box did NOT have the cursor (`walk1/30`) — the plan's §5.3a promise. The focus ran on a timer beside the mode change, before a real browser had drawn the box (jsdom draws at once — the unit test passed) | **Fixed** (`UsersPanel.tsx`: the ask is remembered and the focus runs after the render that drew the box), red first in a real browser (e2e "leaves the cursor", `Received: ""`), green after; re-walk `30` PASS |
| W2, W3 | "Nomad is already taken" where the script expected to make Nomad | **Not a defect** — "Nomad" is a demo callsign (pike). The script, and three test files' clean-up that DELETED that seed person, moved to "Zephyr" |
| W4 | the Tracker listed "Nomad" where a personnel person must not be | **Not a defect** — the same demo Nomad (a pilot); with Zephyr (personnel) the Tracker does not list him (`37`) |
| W5 | Undo step: the chosen seat vanished when emptied | **Not a defect** — the script picked a crowd row (its name takes its box with it); moved to a flying seat, PASS (`38`) |

**From looking at the pictures** (the walk passed them; the eye did not):

| # | What | Disposition |
|---|---|---|
| P1 | The sign-up card kept "Pick pilot, WSO or personnel" after he had picked Personnel (`walk2/03`) | **Fixed** — a refusal goes once a field changes; red first (`accounts-newperson` NP4), green after |
| P2 | The New person note sat tight above Role / the button, tighter than the mock-up drew it (`walk2/09`, `19`) | **Fixed** — the mock-up's spacing (`.adm-note.acc-note`) |

**Re-walk (`walk2/`, the same 47 asserted steps, the build with W1 fixed): 47/47 PASS, 0 browser errors.** It is NOT
the final build: P1 and P2 landed after it (Astra's read #3 — corrected here), and so did the reads' fixes (§6).

**Re-walk 3 (`walk3/`, commit `67832f4c` — the reads' fixes, P1 and P2 all in): 55/55 PASS, 0 browser errors**, desktop
1440×900, phone 390×844, a 1440×700 window and a fresh world. The 47 steps of walk2, reworded where a fix changed what
is right, plus eight:

| Step | Why it was added | Picture |
|---|---|---|
| `d-S8-ranger` (reworded) | Fable read #1: Ranger already has an account (`us`) — the note says so, the picker does not offer him | `31` |
| `d-S8-ranger-new` (split out) | the same request on New person, refused as taken — its own picture | `32` |
| `d-S8-bane` (reworded) | the hidden-id form of the same | `33` |
| `d-S8-free` (new) | a person on Quals with NO account — the "Pick them" note, and the picker offers him | `34` |
| `d-S4-board-avail` (new) | Fable read #2(a): roll-call row 18 names the board's Available crew — Vyper is under "Available all day" | `13` |
| `d-S4-inputs` (widened) | the admin files a Training for Vyper through the Inputs form | `14` |
| `d-S4-his-inputs` (new) | Fable read #2(b): signed in as Vyper, the Training reads as his, with its ✎ and ✕ | `20` |
| `d-S4-his-leavewar` (new) | Fable read #2(b): signed in as Vyper, the Leave War lights his row | `21` |
| `d-A1-form-clears` (new) | Astra read #1, in the running app, both directions | `26` |
| `d-A2-cat-personnel` (new) | Astra read #2 on the admin's form; the sign-up's is inside `d-S9-seatcat` | `27`, `03` |
| `f-S14-first-write-reload` (new world) | Fable read #2(c), roll-call row 26 and bug-check order §7.7: "Add person and account" as a fresh world's FIRST write, a reload, both kept, he signs in as himself | `55` |

**The S8 pictures of walk1 and walk2 did not show the note they asserted** (the step pressed Cancel before its picture
was taken — they show the plain waiting list). Walk3's steps leave the approve form open for the picture. P1 is seen
fixed in `03` (no refusal left once a field changed) and P2 in `09`, `22` and phone `50` (the note's room above Role, as
the mock-up draws it).

**The two older `[ACCOUNTS]` walks (Astra read #4), moved to "On the roster" after Approve and re-run from a fresh
world on the same build: `acc-walk.mjs` 38/38, `acc-walk2.mjs` 42/42, 0 errors** — the counts they had at the
`[ACCOUNTS]` merge. Results and the approve pictures: `acc-rewalk/` (the other pictures were looked at and not kept —
they repeat the `[ACCOUNTS]` evidence, 35 MB).

## 6. The two code reads (Fable 5.1 and Astra, blind to each other, with this sheet in hand)
Both reports exist: `2026-09-26-accounts-new-person-fable-read.md` (FIX FIRST — 1 finding + 3 record items) and
`2026-09-26-accounts-new-person-astra-read.md` (FIX FIRST — 4 findings). Each is dispositioned here when fixed (next chat).

## 7. Break tests
*(filled after the reads — each wired surface broken once on purpose, a named test must go red)*

## 8. What was NOT walked, and why
- The guest view and the switched-off screen (roll-call 3): unchanged by this build; walked by `[ACCOUNTS]`.
- The account editor's label (12): words only; its door is `[ACCOUNTS]`-walked.
- The Quals frozen header mirror scrolled into view (15): the same `qualsHead` body as the head walked.
- The archived-refusal door out (door check): the refusal is unit-pinned; Restore is `[ACCOUNTS]`-walked.
- A real iPhone: the phone widths ran in Chromium; nothing here depends on touch timing (no drag, no held finger).
- The approve note's new "already has an account" wording at phone width: the same `#apvNote` paragraph whose wrap at
  390px is walked in phone `50` (the "Filled from…" note) and checked for sideways overflow there; words only.
- Fable read #2's three rows are now walked (walk3 `13`, `20`, `21`, `55`) — no longer on this list.

## 9. The gates
On the build `09cc00e3` (before the reads' fixes), one run: unit 6248 / 6248 (381 files) · build clean · tfin 728 / 0 · e2e 476
passed, 48 skipped · smoke 443 / 0 · rulecheck OK · docsize OK. **To re-run on the final code.** probes / perf: not run.

## 10. His look — the look card

**Look here (five minutes, on the preview; sign in `ad` / `a`):**
1. Sign out, sign in as a new name (say `me@mail`): the card asks **Displayed callsign/name, Initials, Pilot / WSO /
   personnel, CAT** — try Personnel (the CAT goes), and a 15-letter name (it says so, never cuts it).
2. Send it, sign in as `ad`: **the bell** is lit; tap it — Admin → Users, the request line says what you typed.
3. **Approve**: it opens on **New person**, filled from the request — change something, "Add person and give access".
   Then look on Quals, the Leave War and the Inputs picker: the new person is there.
4. Admin → Users → **Add an account** → **New person** with the sign-in left blank: "Add person" makes a roster-only
   person (someone who won't use the app).
5. Quals → **+ Add person**: it takes you to that form, New person chosen, the box ready to type in.

**The calls I made — yours to correct** (from the plan, plus one from the fixes):
1. The bell's tap goes to the waiting list before a bug report or an OIL question.
2. Seat and CAT start at "Pick…" on both forms — never a silent default (the old Quals form defaulted to Pilot / OCU).
3. With a blank sign-in the Role box hides (no account, no role).
4. Approving: a typed callsign that is someone's opens "On the roster" with a note, never pre-picked. **New, from
   Fable's read:** when that person already has an account, the note says so and names the account ("Ranger already has
   an account (us), so they can't be picked here…"). If the asker really is Ranger on a new sign-in, the way is to
   change Ranger's account's sign-in in its editor and decline the request — the note does not guess which it is.
5. The "Add an account" heading stays over a roster-only add (the mock-up as approved).
6. The words kept: "no callsign" / "archived callsign" tags, "tied to their callsign", "Sort by callsign".
7. Tapping through a pre-filled New person for someone already on Quals under another callsign makes a second person —
   the way back is Archive on Quals (there is no delete of a person).
8. A person's seat cannot be changed after he is added (pre-existing: Quals has no seat box) — get it right at Approve.
