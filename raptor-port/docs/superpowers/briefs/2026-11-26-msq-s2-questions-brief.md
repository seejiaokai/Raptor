# Section 2 (Admin → Users) — three questions for him: the words drafted and the pictures drawn (chat 199, 26 Nov 26)

**What this is.** Three small points his approved page never drew. Each goes to him on the one questions page with
cropped, marked pictures of the real app (his D2739, D1625, D853). You draft the words and draw the pictures; a fresh
reader then checks the words; the host publishes. **You change no app file** — everything here is a drawing laid on the
running app, as `raptor-port/scripts/handpass/n191/draw-s2-*.mjs` did for the section page.

**Read first:** `.claude/skills/brainstorming/mockups-on-the-real-app.md`; `raptor-port/docs/walk-scripts.md` (how a
script signs in and what each trap has cost); `raptor-port/scripts/handpass/n191/draw-s2-lib.mjs`, `draw-s2-page.mjs`
and `draw-s2-bell.mjs` (reuse their way of making the three-squadron world, the teal dashed ring for what is new, 2x
pictures, the crops); the handoff note that the older world scripts no longer work and
`raptor-port/scripts/handpass/n194/k0p-world.mjs` makes the world through the app's own controls;
`raptor-port/docs/design-practices.md` §1, §1a, §1b (the writing guide) and §9 (his design lessons); the plan
`raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md` §21.2's block "Step 0 — this part read
against his answers", its three "Still held" items, and §19.2 for the Plan lines. The cast, as on his page: Saber master
admin, home 142 · Hunter 142's admin, Plan of 149 · Kestrel 149's admin · Osprey a second 149 admin · Mako 150's admin.

## The three questions

**A — what a Plan holder sees where he can no longer make an admin.** He ruled (D2730 Q8): only a squadron's own
admins or a master admin make a man its admin; a Plan holder no longer. Hunter, 149 picked, opens a 149 member's row on
149's Admin → Users (the row is whole there — it is 149's own man on 149's page). Today its Role box lets him pick
"Admin". Draw, desktop (1440 wide) and phone (402 wide, an iPhone's letters as the n191 scripts set them):
- **recommended:** the Role box's "Admin" choice greyed for him, and one line of reason under the Role box, in the look
  the greyed Plan button's reason already has on his page (`drawn/s2-18-d-plan-greyed-crop.png`). Draft the sentence
  on the pattern he approved for Plan — "Only 149's own admins or a master admin can give or end Plan of 149." — for
  example "Only 149's own admins or a master admin can make an admin of 149."; give your best wording and one
  alternative, each measured to fit the phone;
- **the other choice:** the choice stays pressable and Save is refused with the same sentence as the page's grey
  "Blocked:" note.
Say in the report where else the Role is asked (Add a person, Give access) and whether the same greyed choice and line
fit there as drawn — read the code, do not draw them.

**B — a Plan holder's Undo of his own "made a member".** Hunter makes Osprey, a 149 admin, a member (still allowed,
D2250), then presses Undo. By Q8 the Undo would make an admin, so it is refused. Read `raptor-port/src/undo/timeline.ts
outOfBandWords` and `state/undo-wire.ts masterRightRefusal` for the exact sentence the app shows today when an Undo is
refused for a lost right, and capture or draw that note where it really shows (desktop and phone), under the Undo
button. No new words: this picture shows today's words. The choice for him: refused in those words (recommended — one
rule, and one of 149's own admins or a master admin makes Osprey an admin again), or his own step's Undo let through.

**C — the bell line when Plan ends by an archive or an overseas posting.** He approved "Plan of 149 ended · Kestrel",
"Plan of 149 ended: he moved to 150" (unsigned) and "Plan of 149 ended: made a member · Hunter"
(`drawn/s2-33-d-ended-crop.png`). A man's Plan also ends when he is archived or posted overseas (D2311). First **read
the code** and report: which acts drop a man's Plan row today (archive by hand; an overseas posting running on its
date; a delete; being made a master admin; any other), which run by a person's press and which by the app on a date.
Then draft a line for each that needs one, in the approved shape — for example "Plan of 149 ended: archived · Ranger"
(signed by the admin who archived him) and "Plan of 149 ended: posted overseas" (unsigned, the app's own) — and draw
them in the bell, desktop and phone, in the squadron colours as `s2-33` has them. If being made a master admin drops
the row, say so and recommend whether a line is right at all (he then has full access, so "ended" may mislead).

## What you hand back

- Pictures, 2x, each cropped to what the question is about with the new part in the teal dashed ring:
  `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/s2q-a-d-…png`, `s2q-a-p-…png`, `s2q-b-…`, `s2q-c-…`
  (a `-crop.png` beside each full one). Open every picture you save and look at it before you name it done.
- Scripts: `raptor-port/scripts/handpass/n199/` (new folder) — the drawing scripts and `words-s2q.mjs` holding every
  drafted sentence once.
- Report: `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s2-questions-draft.md` — for each question, in his
  page's shape and in plain words (no file names, function names or ruling numbers in these parts): **When it
  happens** (who is doing what, at what point, how often), **What happens now**, **Recommended**, **The other choice**,
  the pictures by file name with a one-line caption each; then, apart, the code facts for C and anything a drawing
  could not show.

## Rules

- Test port **4745** (this section's). The drawing run needs a build: take the checks lock first, from the repo root —
  `node raptor-port/scripts/gatelock.mjs take "claude/msq-s2-users-685735 — S2 question drawings"` — hold it for the
  build and the whole drawing run, and `node raptor-port/scripts/gatelock.mjs release` the moment it ends, pass or
  fail. If it is held, wait and try again; never build alongside. Stop your preview server by its port when done.
- A backgrounded command starts in the wrong folder: `cd` into `raptor-port/` by its full path inside the command.
- No app source file, no test, no document other than your report is edited. Do not commit, do not push.
- Squadrons are written as bare numbers; nothing else names the unit.

End your reply with the report's path and a five-line summary.
