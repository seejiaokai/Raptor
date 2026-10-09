# Plan — an input filed for "ALL AVAIL" or "ALL" (`[INPUT-ALL-AVAIL]`; owner D700, D702 — 9 Oct 26)

**Status: READ BY ASTRA AND BY SOL, EACH BLIND, THE NIGHT OF 9 OCT 26 — BOTH: NOT CLEAN. NOT BUILT (D708: built that night only
if both read it clean). Their reports: `docs/superpowers/briefs/2026-10-09-reads/all-avail-plan-astra.md`, `…-sol.md`. What they
found is folded into §9 below; §3 is the plan AS FIRST WRITTEN and is wrong where §9 says so. Four choices are the owner's
(§7, rewritten): until he answers, the parts that hang on them are not designed further and nothing is built.**
Written by Opus 5.5 the night of 9 Oct 26 from a read of the seams (file and line references below were read that
night on `claude/day-window-compact`; verify each before building — a line number is a hint, a function name is the claim).

## 1. What he asked for, in his words

- D700: "Can the inputs have an all avail and all selection too? Only allowed for duty and other commitments".
- D702, his four answers: "Yes whoever is free at filing but it's flexible when there's changes it will change the pax
  that's available realtime. Members can choose too. Only on the day and the schedule. Yes as with shared inputs."

Read as (the rulings' own readings): ONE input that carries the placeholder; who stands behind it is worked out live,
as on the schedule, and frozen when the day is published (D44, D45, D178); members may choose it; it is shown on the
opened day and on the schedule — not in each man's own inputs, not on his bell; on a weekend or holiday the filer
answers the OIL question once, for everyone behind it (D660).

## 2. What exists already (so the plan is small where it can be)

1. **The placeholders are people-shaped records**: `PEOPLE.allavail` ("ALL AVAIL") and `PEOPLE.all` ("ALL"),
   `special:true, archived:true` (`src/engine/people.ts` ~130).
2. **A request's row already takes a placeholder in its name box** (D46). A landed request row is made on read by
   `engine/overlay.ts landRequests` → `requestRowFields` (`who: inp.person`), on the input's START day, and by
   `engine/slots.ts acceptInput`. Only flying seats refuse a placeholder (`slots.ts sentinelSeatOK`). An input whose
   `person` is `allavail` would land today with the ALL AVAIL puck in the name box — nothing refuses it, nothing was
   designed for it.
3. **The crowd** behind a placeholder on a request row is resolved by `leavewar/sync.ts availableFor(iso, win, day)`
   (installed as `HOOKS.oilSentinel`), written per item into the day's evidence `ev.sent` by `engine/oilev.ts
   oilEvidence` when `landedHasSentinel(day, iid)`; shown by the count chip and the ALL AVAIL window; frozen at
   publication in `engine/publish.ts daySnap` (`d.oilev`), a later change reading pending through `oilEvidenceKey`.
4. **OIL**: an input's answer is `row.oil = { <iso>: 0 | 0.5 | 1 }`, asked at save by `ui/inputedit.tsx oilGate`
   (plan from `sync.ts oilAskPlan`). `oilev.ts oilEarnedWork` credits the input's HOLDER on `inp.ans`, and every man
   on the row — typed beside him or in the crowd — as ordinary work, default YES (`landedExtras`, D18, D46).
5. **Permissions**: `state/perms.ts memberFilesForOthers(type)` (the "duty or other commitment" kinds, not SANS),
   `mayFileInputFor`, `mayFileGroup`, `mayEditInput` / `mayDeleteInput` (an admin, or whoever filed it).
6. **The picker**: `ui/PeoplePick.tsx` — one person from an A-to-Z `<select>`, or "Several people" in groups;
   its roster drops `special` people twice over (`pickRoster`, `rosterOptions`).

## 3. The design

### 3.1 The record — no new shape
An input for a placeholder is an ordinary single input (no `grp`): `person: 'allavail' | 'all'`, `by` the filer.
Nothing is copied: there are no names in it. `docs/data-schema.md` and `docs/data-model.md` say so; the permissions
table (`data-model.md` §11) gains the row "file an input for ALL / ALL AVAIL".

### 3.2 Which kinds, and how many days
- **Allowed kinds — those that land a row on the schedule and are not shown per person on the Leave War:** Training,
  Meeting, Fly with, Appointment, Duty, Other, Personal. **Not offered: OD and CSE** (each is a per-person fact — away,
  and on the Leave War, `leavewar/absences.ts warVisible`), and of course leave, medical, upchit, SANS availability.
  *A product edge, parked for him with this recommendation (§7 Q1); the build offers only the allowed list.*
- **One day at a time.** A request lands its row on its START day only, and the crowd, the count, the freeze and the
  credit exist only there. A placeholder input over several days would show on the first day's schedule alone. So the
  editor refuses a range while a placeholder is chosen, in words: "ALL AVAIL is filed one day at a time."
  *Parked for him (§7 Q2): whether several days should make one input a day.*
- **Never mixed**: a placeholder is the input's only "person" — not with named people in a shared input, and not ALL
  with ALL AVAIL.

### 3.3 Choosing it (the editor)
In `PeoplePick`, while the chosen KIND is an allowed one and the editor is filing a NEW input or editing a placeholder
input: the one-person list gains two entries above the callsigns — "ALL AVAIL — whoever is free" and "ALL — everyone".
"Several people" does not offer them. Changing the kind to one that is not allowed while a placeholder is chosen is
refused by `pickProblem` with its reason, and the same test stands at every write door (`commitNewInput`,
`commitInputEdit`, `inputBreach` in `perms.ts`): **a placeholder input of a refused kind, of more than one day, or
filed by someone who may not, is never written.** `reassignInput` keeps refusing specials (a filed input for a named
man is not turned into a placeholder, or back, by the schedule's reassign — the editor is the one door).

### 3.4 Who may
One function, in `state/perms.ts`, pinned to `data-model.md` §11 by `perms.test.ts`: an admin always; a member when
the members' switch ("members filing for other people", D655, D656) is on and the kind is an allowed one. Changing or
deleting it: an admin, or whoever filed it (`filedForOther` already says this). A guest never.

### 3.5 Where it shows (D702: "only on the day and the schedule")
- **The Inputs calendar**: its bar and its opened-day card read "ALL AVAIL · Meeting" — the card shows the
  placeholder's own puck where a man's name stands, and its small print "Saber for ALL AVAIL · 12 Jul, 14:42".
- **The Inputs List** (everyone's inputs, an admin's view): one row, the same words. It is nobody's "mine".
- **The schedule**: the landed request row with the ALL AVAIL puck in its name box, its count and the ALL AVAIL
  window — all as built for D46. Nothing new is drawn there.
- **Not** on any man's bell or own list (`sync.ts oilPendingFor` matches `row.person`), and never on the Leave War.
- **Not in v1: a live count on the Inputs calendar's card.** The count needs the day's schedule in memory; the card
  says who by pointing at the schedule ("who is free: see the day on the schedule"). *Told to him as a limit (§7 Q3).*

### 3.6 Live, then frozen
No new mechanism: the crowd is resolved on read for a working day and written into the day's evidence at publication.
An input filed, changed or deleted on a PUBLISHED day is a pending change for the scheduler as any input is (D178).

### 3.7 OIL — the one change to who earns (the FULL-tier part)
- **Asked**: `oilGate` asks the filer at the save, as for any input he files for others (D660), when the day is a
  non-working day and the kind asks (`restsInput`; Personal never asks).
- **Credited** (`oilev.ts oilEarnedWork`, the input half): for an input whose `person` is a placeholder —
  (a) NO credit to the placeholder itself (today it is put and later dropped by `sync.ts creditable`; it is not put);
  (b) each man of the CROWD (`ev.sent[item]`) earns by default exactly when the filer's answer for that day is more
      than 0 — where today the crowd defaults to yes whatever was answered (the contradiction with D702 found in the
      read);
  (c) a man the SCHEDULER typed onto the row keeps today's default yes (D18, D470);
  (d) the admin's per-man switch in OIL Earn mode stays over the top for every one of them (D28, D43).
  A named man's input with a placeholder among its extras is untouched (D46's default yes).
- **The answer's size**: `ans` is 0, 0.5 or 1. The plan reads `> 0` as "earns" for the crowd, each man's amount
  following from the claim's window as it does for a typed man today. *Reviewers: confirm how a holder's 0.5 limits
  his credit and whether the crowd needs the same limit; if it does, this section is wrong and the build stops.*
- **Unanswered**: `oilPendingFor` asks the FILER (`by`) for a placeholder input, since no `person` can be asked.
- **OIL Earn mode** (`ui/oilmode.ts`, `ui/board-html.ts`): the placeholder is not offered a switch as "the claim's
  person"; the crowd's men are, as today.

### 3.8 What must NOT change
A named man's input in every respect; a placeholder dropped on a row by the scheduler (D27, D33, D43, D46, D47);
the crowd's membership rule (D36, D327); what a published day keeps (D44, D45, D48); `validate()` (a placeholder
raises no conflict — `events.ts` skips specials); the Leave War; `reference/` parity (tfin 728/0).

## 4. The roll-call the build must fill (every place an input's `person` is read)
Inputs List (sort, search, name, the person filter — whose "Everyone" value is the string `'all'`, the same string as
the placeholder's id: the filter's value is renamed or compared safely, with a test); the calendar's bar, tip and card;
`isMe`; the schedule's strips (`html.ts`, `board-html.ts`); `dayAway` and `availableFor` (a placeholder input makes
nobody away or busy); `events.ts` / `weekctx.ts`; the Leave War's readers (`sync.ts`, `inputgate.ts`); the bell;
person delete / archive / post-out (specials are refused there already); the placed line; the changes window and the
Undo label (`changelines.ts`, `undo/describe.ts`, `pendlist.ts`); the published snapshot's attributes
(`publish.ts`); export and print (`ui/export.ts`, `printpdf.ts`); the guest view. Each gets YES / NO-because / MISSING
in the evidence sheet, and a test where it is YES.

## 5. Tests first (each written to fail before its change)
1. `perms.test.ts` + `data-model.md` §11: who may file / change / delete a placeholder input; the refused kinds.
2. Engine (`oilev`): a weekend Duty for ALL AVAIL — filer answers No → nobody in the crowd earns by default; Yes →
   each earns; a man typed onto the row earns either way; an admin's switch overrides one man; the placeholder itself
   is never credited; a named man's input with ALL AVAIL in its extras is byte-for-byte as before.
3. The freeze: published, then a man files leave — the crowd on the issued day is as it went out, the working copy
   reads pending; the filer changes his OIL answer after publication — pending, not silent.
4. The editor: the two entries appear only for an allowed kind; a refused kind, a range and "Several people" are
   refused in words; a member with the switch off is refused; nothing is written by a refused save.
5. The screens: the bar, the card, the List row, the schedule row with its count; nobody's bell; the Leave War
   untouched; Undo and Redo.
6. e2e: file it on a phone and a desktop, see it on the schedule with its count, reload.

## 6. The check
FULL (earned leave, the published record, roles, saved data): the rules sweep (D27–D52 placeholders, D43, D44, D46,
D654–D660, D178, D700, D702), Astra's scenario design, the roll-call above, a walk sized by `docs/walk-ledger.md`,
the gates, Astra's and Sol's code reads with the evidence sheet, fixes, re-walk, his look.

## 7. Parked for him — his to choose; the work that waits on each is NOT done meanwhile (D596)
**ALL ANSWERED 9 Oct 26 (D711, D712): Q1 — the filer’s answer and the scheduler’s switches; Q2 — no OD, no CSE; Q3 — one day at a time; Q4 — the filer’s bell only. AND the kinds are narrowed: no "Fly with", no "Personal" (D712) — Training, Meeting, Appointment, Duty, Other. The plan is to be rewritten with these before it is read again.**
- **Q1. Each man’s own OIL answer.** In a shared input each man may still change HIS OWN answer after the filer’s (D660,
  D682). An ALL AVAIL input names nobody, so as planned only the filer answers, and the scheduler’s switches sit over
  it — a man behind it could not change his own. *Is that what he wants for ALL AVAIL (recommended: yes — the filer
  answers once, the scheduler can switch any one man in OIL Earn; simple, and nobody is asked about a duty he was not
  named on), or must each man be able to answer for himself from the day (a bigger build: a place to keep each man’s
  answer, and a way to reach it)?* **Waits on it: all of §3.7.**
- **Q2. ALL / ALL AVAIL for an overseas duty (OD) or a course (CSE)?** *Recommended: no — each is a fact about one man
  (he is away; it shows on his Leave War row), which a placeholder cannot carry.* **Waits on it: the list of kinds.**
- **Q3. More than one day in one filing?** *Recommended: one day at a time for now — the schedule shows a request on its
  first day only, so a three-day ALL AVAIL would show on one.* **Waits on it: the date rule in the editor.**
- **Q4. An OIL question nobody answered** (a holiday declared after it was filed): whose bell? "Only on the day and the
  schedule" says nobody’s; an unanswered question needs someone. *Recommended: the FILER’s bell, and only his — the one
  exception; if he may no longer answer, the scheduler sees "no OIL answer" on the day.* **Waits on it: §3.5’s "not on
  any bell" and §3.7’s "Unanswered".**
- *A limit, not a question:* the Inputs calendar’s card will not show how many are free in the first build; the
  schedule’s puck and its ALL AVAIL window do.

## 8. What the reviewers are asked (see the brief)
Is anything in §3 wrong against the code or against a ruling; what does §4's roll-call miss; is §3.7 safe — can any
man be credited or lose credit silently, on a working day or an issued one, because of this change; can a refused
input be written by any door; what would you test that §5 does not.

## 9. What the two reads found (9 Oct 26) — corrections to §3 and §4, to be folded into the build plan once §7 is answered

Both readers, independently: **NOT CLEAN.** Points both made are marked (both).

1. **(both) The OIL switches must share the credit's default.** Changing `oilEarnedWork` alone breaks OIL Earn mode for a
   placeholder input answered No: the crowd earns nothing, but each man's switch still reads "on by default", so a tap
   writes a refusal and a second tap removes it — neither grants (against D28: the admin can always override). ONE
   default calculation for the credit, each man's switch, the whole-row switch and the words that explain it: a man
   the scheduler typed defaults Yes; a man only in the crowd follows the filer's answer; day, item and per-man overrides
   stay over the top. Typed men are read from the day's own row and the crowd from the day's saved evidence — both are
   in an issued snapshot; a man who is both counts once, as typed.
2. **(both) An answer of 0.5 is not a cap.** A positive answer admits the work; the day's qualifying hours decide the
   amount. §3.7's open question is closed: no new cap.
3. **(both) Each man's right to change his own answer (D660, D682) is removed by §3.1 without saying so** — now §7 Q1.
4. **(both) The save checks in §3.3 miss doors.** The List's own single-person Add form writes its record without the
   editor's checks (an admin could save a several-day placeholder there); the shared save checks each person and adds
   the group mark after (a placeholder could be mixed with names — and switching from one person to "Several people"
   keeps the selection); `inputBreach` skips admins, and replayed changes skip part of it. The placeholder's
   STRUCTURAL rules — an allowed kind, one date, no shared group — go at the common save boundary, before any role
   exemption or replay shortcut; permission is checked separately; a refused save leaves no record and no history; a
   whole group is checked before any member is written.
5. **(both) `reassignInput` refuses a placeholder as the destination but accepts one as the SOURCE** — a placeholder
   input moved under Unavailable could be reassigned to one man. Refuse both directions (the scheduler replacing a
   landed row's name box stays allowed, D470).
6. **(both) An all-day "Fly with" for a placeholder counts the placeholder as ONE absent person** (`avail.ts dayAway`;
   the day panel's "Leave / downchit" total rises by one). §4 called this harmless; it is not: placeholders are kept
   out of both the all-day and the timed absence sets, with a test beside a real man's absence.
7. **(both) Wording and the filter.** "ALL — everyone" is false: both placeholders stand for whoever is free (and neither
   takes ground crew) — say "whoever is free" for both. The "Everyone" value of the person filter is the same string as
   the ALL placeholder's id in THREE places (the List, the month's bars, the opened day): give "Everyone" its own value
   in all three together, with a test for Everyone, ALL and ALL AVAIL.
8. **(both) The bell contradicts itself** (§3.5 "nobody's bell" against §3.7 "ask the filer") — now §7 Q4; and a member
   filer loses the right to answer if the members' switch is turned off afterwards: never show a task its reader
   cannot do; §3.4 must say his change and delete rights hang on the switch staying on.
9. **(Astra) Parked recommendations were written as if approved** (the old §7 said "the build follows meanwhile"). D596:
   only that piece is left undone. §7 is rewritten so.
10. **More tests than §5 lists (Sol):** real taps on the switches after a No and after no answer; the whole-row switch
    forced on; a fresh filer answer after a change; the List's Add and the shared save; both reassign directions; a
    permission changed while a confirmation is open; both placeholder ids; a typed man beside a placeholder; the name
    box replaced; the row cancelled or made information-only; a holiday declared late; an issued and reloaded version
    after an answer or the crowd changes — pending keeps the issued credit, clears the sign-offs, and goes on reversal
    or republication.
