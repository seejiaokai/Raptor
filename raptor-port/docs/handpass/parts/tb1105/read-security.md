# Security read — "Undo post out" takes back the posting's bell lines; the SANS purple line (branch `claude/postout-bell-look`, src at 3a181dbd8)

A fresh, blind security read (Opus 5.5), 5 Nov 26. Read only: no source file changed. Scope: the diff
`git diff 248a13bf5^ 3a181dbd8 -- raptor-port/src`, read against `state/perms.ts` (the command gate, the
ownership invariant, the posting pass's check), `command/permissions.ts`, `leavewar/sync.ts` (undoPostOut, takeBack,
restoreBody, postingLinesOf, retractPostingLines, postedLines), `state/notices.ts` (noticePostingBack, noticeLive,
postOf, noticeWords), `leavewar/ui/Matrix.tsx` (the posting sheet's door), `ui/topbits.tsx`, and `docs/data-model.md`
§11's Notice row. Checked that the working tree's `src/` is byte-identical to 3a181dbd8. Ran
`npx vitest run src/state/perms.test.ts src/state/perms-scan.test.ts src/leavewar/postout-takeback.test.ts` — 3 files,
105 tests, all pass. The D56 exclusion applied: nothing below lives only in stored demo data.

## Findings

### S1 — LOW (new in this change): a "taken back" line can be created for a man who is no longer an admin

- **The hole.** `retractPostingLines` (`leavewar/sync.ts` 2711–2722) makes a `poback` line for whoever the stored
  posting line was addressed to (`n.to`), if he had read it and did not press the Undo. It never asks whether that man
  is STILL an admin. `noticePostingBack` (`state/notices.ts` 405–406) checks only that he is on the roster (`here`:
  not archived, deleted or special) and is not the presser.
- **The order that reaches it.** The posting pass writes Ranger's posting line to every admin who can sign in, Hex
  among them (the pass's own gate insists on that: `postingPassViolation`, `admins.has(String(n.to))`). Hex reads it.
  An admin then makes Hex a member on Admin → Users (`account.update`). Saber presses Undo post out on Ranger's posting
  → Hex's posting line is deleted and a NEW `poback` row is stored, addressed to Hex, a member:
  "Ranger · Mon 16 Nov / ~~Posted out · archived, account suspended~~ · taken back · Saber".
- **What it costs.** On screen nothing: `noticeLive` hides `po` / `poback` from anyone who cannot edit the schedule, so
  Hex's bell neither lists nor counts it. But it is a new stored row addressed to a member, and at the database step
  §11 gives a member "R own" on Notice — the row is his to read. It also breaks the rule §11 itself states for this
  writer ("creates (C) a 'taken back' line (`poback`) for each admin who had read his") and the rule the posting pass
  is held to (posting lines go only to an admin who can sign in). The facts in it (a man's posting, its outcome, who
  undid it) are the same his old posting line held, so the harm is small — hence LOW — but it is new data, written by
  code that is wrong going forward, so it is not D56's exclusion. The derived "off the manpower" line is not affected:
  it is worked out only for current admins (`postedLines` → `schedulerIds()`).
- **Older or new.** New: `retractPostingLines` and `noticePostingBack` do not exist at 248a13bf5^.
- **Fix, step by step.**
  1. In `leavewar/sync.ts retractPostingLines`, compute `const admins = schedulerIds()` once before the loop, and change
     the skip to `if (n.to === by || !admins.includes(String(n.to)) || !hasRead(n.to, n)) continue` — the line is still
     removed (the splice above it stays), only the "taken back" line is not made. (Whether an admin whose account is
     switched off should be told is the same question the pass answers with `a.on`; `schedulerIds()` already reads
     `isAdminAccount(a) && a.on && a.pid`, matching the pass.)
  2. Test, red first, in `src/leavewar/postout-takeback.test.ts` (it already imports `updateAccount`): post Ranger out,
     run the pass, have Hex (made admin for the test) read his line, then `updateAccount` Hex back to a member, sign in
     as Saber and `undoPostOut` → expect `NOTICES.filter(n => n.to === hexPid && n.what[0].k === 'poback')` to be empty
     AND Hex's `po` line to be gone. A control case in the same test: an admin who read his line still gets one.
  3. Optionally (defence in depth, the same shape as the pass's check): in `state/perms.ts`, for an `lw.postout`
     envelope, refuse a `notices` put whose part is `poback` unless `admins.has(String(n.to))` (the same `admins` set
     `postingPassViolation` builds). Not required for S1 — the admin actor is otherwise trusted (see N2) — but it would
     pin the §11 sentence at the gate.

No other finding.

## Explicit negatives, question by question

### N1 — Can anyone but an admin run `lw.postout` / reach `undoPostOut` or `restoreBody`'s undo mode? No; the three checks agree.
- **The page:** the posting sheet (and its Undo post out) is drawn only for `role === 'admin'` (`Matrix.tsx` 4269); the
  war's role is the session's EFFECTIVE role, so an admin in his member view (D292) does not see it either.
- **The write path:** `undoPostOut` itself has no role check on its `takeBack` branch (older code, unchanged here), and
  its Restore branch goes through `restoreArchivedPerson`, which refuses `!mayManageRoster()`.
- **The command gate:** `cmdAuthorize('lw.postout', …)` (`perms.ts` 596–606) needs Profile U outright, plus Person U,
  User U, Notice C and Notice D outright (`more` ops use `'never'`). A member's Profile cell is `R` only, his Notice D
  is own-only (refused under `'never'`), his Person U and User R are own-only — so a member (and an admin in member
  view, whose actor role is then `member`) is refused at the gate, whatever door calls it. Guest, pending and an
  account switched off hold none of these: refused. The system actor passes the gate, but the only system command
  that writes notices is `lw.postoutRun`, whose content check refuses any notice delete and any `poback` (it is in
  `WAR_LINE_KINDS`, which the pass's non-`po` branch refuses). So a forged `lw.postout` envelope by a non-admin fails
  at `cmdAuthorize`, before apply.
- **Undo replay:** `lw.postout` is in `NOT_UNDONE_TYPES` (`undo/timeline.ts` 453), so the top bar's Undo never replays
  or inverts it (D350) — no second door to the notice deletes.

### N2 — With Notice D granted to `lw.postout`, can it delete notices it did not make / create arbitrary `poback` lines? Through the gate, for an ADMIN, yes — but that is no new power, and no other role can.
- The gate reads a command's TYPE against the role's letters; it does not read WHICH rows an admin's command changes.
  `ownershipViolation` returns `null` for an admin actor (`perms.ts` 1155), and only the system actor's
  `lw.postoutRun` gets a content check. So an admin-authored envelope typed `lw.postout` that deletes another admin's
  input line, a member's line or a war line, or creates a `poback` to a member, by someone else, about another man, or
  many of them, PASSES the gate. Constructed against the real code: `cmdAuthorize('lw.postout', {role:'admin',…})` →
  all ops allowed (admin holds Profile, Person, User C R U D and Notice C R D outright — §11's admin cell "C R D" on
  Notice predates this change) → no invariant asks an admin's notices.
- That is exactly what any admin command could already do before this change (`lw.notice`, `lw.postout`'s existing
  Notice C, or any other admin type: the invariant never limited an admin's notice rows). Adding `[T.notice, 'D']`
  brings the command's declaration into line with what its body now writes (and keeps §11 and the drift tests honest);
  it grants an admin nothing he did not hold. Under the model (D785: a scheduler is an admin; admins are trusted; the
  sign-in is not security), this is not a hole. S1's step 3 is the one place a content check would be cheap and match
  §11's own words, if wanted.
- For a member: refused at the gate (N1). A member's own commands keep their notice rule unchanged: a put only of a
  line riding his own input change, by him, to someone else, carrying no war kind; a delete only in his own Undo of a
  line he made riding an input it changes. A `poback` row has `by` = an admin and `iid` = '' — no member command can
  ever "ride" it to delete it.

### N3 — Can a member's command write a `poback` line, or read one? No.
- Write: `poback` is in `WAR_LINE_KINDS` (`perms.ts` 795); the member notices case refuses any put whose `what` has
  any part of a war kind (`some`, not only the first part). Also refused for the posting pass (non-`po` branch).
- Read on screen: `noticeLive` returns `mayEditSched()` for `po` / `poback` — false for a member, for an admin in his
  member view, and for a guest. `noticesFor` and the unread count both go through `noticeLive`, so the bell neither
  lists nor lights. The tap (`postOf` → Admin → Users at the man) is reachable only from a listed line, and the
  Admin page gates itself.
- A member cannot steer the admins' derived line ids either: `postedLines` now counts `poback` rows to that admin
  (`po:<id>:<date>:<n>`), and a member can neither create nor delete those rows.

### N4 — Does a `poback` line leak anything about a person to someone who should not see it? Only S1's case.
- Its content is the posting line's own (the man by his callsign of today, the date, the outcome, `acct` only for an
  Overseas Sqn) plus who pressed Undo. It is addressed only to holders of the posting line (admins when it was
  written) who had read it; never to the man himself (the pass never addressed him; `retractPostingLines` adds no
  recipient); never to the presser. A deleted man's posting cannot be undone (`undoPostOut` refuses `body.deleted`),
  so no line is made about him. The single leak is S1 — a line made for a former admin.
- `hasRead(n.to, n)` reads another admin's read record — an admin already reads every person's (§11 NoticeSeen admin
  "R", D1216).

### N5 — Any change in what a guest or a member sees? None of substance.
- The SANS purple line (`NamePuck.tsx`) replaces the "SANS" tag for a man posted out as SANS, on the same condition
  (`p.to !== null && outcomeOf(p) === 'sans'`) and in the same places, with no role gate before or after — a member
  saw the tag, he now sees the line: the same fact. A man already SANS (`p.san`) is drawn in the SANS group, whose
  heading already says so. No new fact reaches a member or guest.
- The bell's struck words (`topbits.tsx`, `noticeWords`' `struck`) render text through React (escaped); the `lwback`
  lines a member does see now show what was taken back struck through — the same words the line it replaces showed
  him, built from the line's own part, adding the move's target dates (`to`/`tb`) only on a member's own war line.

## What was not looked at
The posting pass's own security (read on 5 Nov 26 before this change, `postingPassViolation`) beyond confirming it now
refuses `poback`; the SANS line's drawing; the scheduler store's baseline resync before enlisting (a correctness
question — it can only leave memory changes out of this command's changeset, never put another person's change into
an admin's).
