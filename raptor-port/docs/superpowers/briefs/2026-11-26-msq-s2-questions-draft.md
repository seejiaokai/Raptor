# Section 2's three questions for him — the words drafted, the pictures drawn (chat 199's Opus helper, 26 Nov 26)

Brief: `2026-11-26-msq-s2-questions-brief.md`. Every drafted sentence is held once in
`raptor-port/scripts/handpass/n199/words-s2q.mjs`; the drawing scripts are beside it (`s2q-lib.mjs`, `draw-s2q-a.mjs`,
`draw-s2q-b.mjs`, `draw-s2q-c.mjs`). The words are Opus drafts for a fresh Fable's read before he sees them (D2441),
except B's, which are the app's words today. Pictures: see "The pictures" at the end — their state is written there.

---

## A — What a planner from another squadron sees where he can no longer make someone an admin

**When it happens.** Hunter is 142's admin and also plans 149. He has 149 picked, is on Admin → Users and opens one of
149's own men, Merlin, to change his sign-in or role. It happens whenever a planner of another squadron opens a 149 man's
row — not often, a few times a month at most.

**What happens now.** The Role box offers Member, Admin and Master admin. "Master admin" is already greyed for him, so
he cannot pick it. "Admin" is not: he can pick it and Save, and Merlin becomes an admin of 149. You have ruled that only
149's own admins or a master admin may do that, so this has to change.

**Recommended.** "Admin" is greyed in the Role box the same way "Master admin" already is, and one grey line under the
box says why:

> Only 149's own admins or a master admin can make an admin of 149.

It is worded like the Plan line you approved ("Only 149's own admins or a master admin can give or end Plan of 149."),
so the two read as one family. He sees before he presses that it is not his to do, and nothing he types is lost.

An alternative wording, a little more personal:

> Only 149's own admins or a master admin can make him an admin.

Not yet measured on the phone (see "The pictures"): each is about as long as the approved Plan line (65 and 62
letters against its 68), which takes two lines on a phone, so each is expected to take two lines there too.

**The other choice.** "Admin" stays pickable, and the press of Save is refused in the app's grey "Blocked:" note at the
foot of the screen:

> Blocked: only 149's own admins or a master admin can make an admin of 149.

It costs him a wasted press and he learns the rule only after trying. Nothing is saved.

**The same Role choice is asked in three other places.** Read in the code, not drawn:
- **"+ Add a person"** at the top of Admin → Users: once a sign-in is typed, a Role box with Member and Admin appears,
  and the person is added to the squadron in view. So Hunter with 149 picked could add a new admin of 149. The same greyed
  "Admin" and the same line fit there as drawn (the box then has only Member to pick).
- **"Give access"** on a request waiting for access: its Role box (Member, Admin) gives the role in the request's own
  squadron. The same greyed choice and line fit there too.
- **"Give sign-in"** on the row of a man with no sign-in yet: it uses the same Role box as an opened row. Same answer.

---

## B — A planner's Undo of his own "made a member"

**When it happens.** Hunter (142's admin, planning 149) opens Osprey, a second admin of 149, sets his Role to Member and
saves — he may still do that. Then he presses Undo, perhaps straight away because he picked the wrong man. Rare: only
when a planner from another squadron makes one of its admins a member and then changes his mind.

**What happens now.** The Undo goes through and Osprey is an admin again. Under your rule that only 149's own admins or
a master admin make an admin of 149, this Undo would be making an admin, so it would be refused.

**Recommended.** Refused, in the words the app already shows when an Undo can never go through (the amber passing note
at the foot of the screen):

> Something else changed this after your action — it can’t be undone now.

One rule everywhere, with no gap through Undo. Osprey is made an admin again by one of 149's own admins (Kestrel) or a
master admin. There is always one: a planner cannot make 149's last own admin a member.

**The other choice.** His own step's Undo is let through: the man who made the mistake puts it right himself, at once.
It means an Undo can do what his Save cannot.

**Worth his eye — the words today do not fit this case well.** They say "Something else changed this", but here nothing
else changed: the Undo is refused because of who he is. You ruled these words should stay (Undo's words today, naming
nobody), so they are drawn unchanged; a fresh Fable may want to put a clearer sentence beside them for you to choose,
for example one that says only 149's own admins or a master admin can make him an admin again. If he has older steps in
his Undo list, the note also ends "Press Undo again for: …" naming the next step.

---

## C — The bell line when someone's Plan of 149 ends by an archive, an overseas posting, a delete or the master mark

**When it happens.** A 142 man who plans 149 leaves in one of four ways: a 142 admin archives him; his overseas posting
runs; he is deleted; or a master admin makes him a master admin. 149's own admins should know their list of planners
changed. Rare: a few times a year.

**What happens now.** His Plan of 149 ends, but 149's admins are told nothing. Only three endings have words, approved
on the section page: "Plan of 149 ended · Kestrel", "Plan of 149 ended: he moved to 150" (the app's, no name) and
"Plan of 149 ended: made a member · Hunter". His own bell already says "Plan of 149 ended: archived" (for an archive
and an overseas posting alike) and "Plan of 149 ended: master admin covers every squadron · Saber".

**Recommended.** One line each, to 149's admins, in the approved shape — what ended, then why, then who pressed, with no
name where the app did it on its date:

| How it ended | The line | Signed? |
|---|---|---|
| Archived by an admin | "Plan of 149 ended: archived · Hunter" | yes, by whoever archived him |
| Overseas posting | "Plan of 149 ended: posted overseas" | no name when the app ran it on its date; "· Hunter" when the Post out ran it at once (a date of today or earlier) |
| Deleted | "Plan of 149 ended: deleted · Hunter" | yes when an admin deleted him; no name when a posting's Delete ran on its date |
| Made a master admin | "Plan of 149 ended: master admin covers every squadron · Saber" | yes, by the master admin who made him one |

The master admin line: he now has full access to 149, so a bare "ended" would mislead. The words you approved for his own
bell already explain it ("master admin covers every squadron"), so the same words are recommended for 149's admins; the
other choice there is no line at all, since he lost nothing.

One difference to weigh: for an overseas posting his own bell says "archived", while the recommended line to 149's admins
says "posted overseas", which tells them more. A fresh Fable may prefer the two to match.

**The other choice.** No line for these endings, as today: 149's admins find out only by looking at their page.

---

## The code facts for C — what drops a man's Plan row today, and who does it

Read in the code (state/accounts.ts, state/units.ts, state/perms.ts, leavewar/sync.ts, state/person-delete.ts,
state/acctlines.ts):

| What happens | Drops his Plan row? | By a person's press, or by the app on a date |
|---|---|---|
| **Archive** on Admin → Users | Yes — every View and Plan he holds today, in the archive's own step (`endRightsOfArchived`); Restore does not bring them back | A person's press (an admin of his own squadron, or a master admin) |
| **Overseas Sqn posting** runs | Yes — it archives him and drops every View and Plan (`endRightsOfArchived` in the posting run) | Either: at once inside the Post out press when dated today or earlier (a person), or by the app's posting pass on its date (`runLoadedPostings`, and `runForeignPosting` for another squadron's war) |
| **Delete** (Admin → Users' Delete, or a posting whose outcome is Delete) | Yes — every right of his sign-in, held or ended, with his account (`dropAccountOfPid` → `dropGrantsOfAccount`) | A person's press on Admin → Users or a posting run at once; the app's pass when a Delete posting runs on its date |
| **Made a master admin** (Role "Master admin" and Save, or the master mark's own door) | Yes — every View and Plan he holds today (`rightsDropped`); his own bell says "Plan of 149 ended: master admin covers every squadron · Saber" | A person's press (a master admin only) |
| **Made a member** | Yes — his Plan rows (his View kept) | A person's press — approved line exists |
| **Plan taken or lowered on his row** | Yes | A person's press — approved line "Plan of 149 ended · Kestrel" |
| **A sign-in re-linked to another man** | Yes — every right | Door only: no control links a sign-in today |
| **A move to another squadron** | No row is dropped; the right is read as ended from the start of his move day | The app, on the date — approved line "he moved to 150" |
| A hand Suspend, a SANS posting, a posting with no outcome | No | — |

---

## Anything a drawing could not show

- **The Role box's open list.** On his iPhone the list is the phone's own and no screen picture holds it (his lesson 104:
  a list the phone draws itself is shown as it really shows, never in a look of the app's). The phone pictures show the box
  closed and ringed, with the reason line; on the phone "Admin" would show greyed in the phone's own list, as "Master
  admin" already does. On the desktop the browser's own list of the same three choices is shown open under the box,
  drawn by the browser itself.
- **Where B's note stands.** The brief asked for it under the Undo button. Today a refused Undo raises the ordinary amber
  passing note at the foot of the screen (centred on a desktop, the full width less a small margin on a phone); the
  guard rail's plan puts only its own refusals under the control pressed. The pictures show today's place, with the Undo
  button ringed too.
- **Who receives C's lines.** Drawn in Saber's bell (three squadrons shown, in the squadron colours as the approved
  picture has them) and, for the master admin line, in Kestrel's bell (149's admin) — Saber made that change himself and
  would not be told of his own act. That Cobra, Blade, Basher and Hunter hold Plan of 149 is drawn, not in the world.

## The pictures

**NOT DRAWN YET.** The checks lock was held the whole time by another chat's fanned-out bell walk (claude/leave-points-
notifications-7a2f04, chat 190, its heartbeat live throughout). This helper waited about 35 minutes (17:03–17:38 on
26 Nov 26), past the 30 the brief allowed, then stopped waiting without building, serving or taking the lock. No
picture exists for A, B or C; no app was built or served on 4745.

The scripts are written and ready, not yet run (so not yet proven). To draw, once the lock is free, from the repo root:

1. `node raptor-port/scripts/gatelock.mjs take "claude/msq-s2-users-685735 — S2 question drawings"`
2. `cd raptor-port && npm run build && npx vite preview --port 4745` (backgrounded, from `raptor-port/` by its full path)
3. `node raptor-port/scripts/handpass/n199/draw-s2q-a.mjs`, then `…-b.mjs`, then `…-c.mjs` (the first run makes the
   world, about two minutes, kept in `raptor-port/.tmp/n199-s2q/state-world.json`; `ONLY=` and `SZ=d,p` narrow a run)
4. stop the server by its port (4745), `node raptor-port/scripts/gatelock.mjs release`; open every picture.

They write, into `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/`, each with a `-crop.png`:

| Picture | Caption |
|---|---|
| `s2q-a-d-rec`, `s2q-a-p-rec` | Recommended: Hunter on 149 opens Merlin; "Admin" greyed in the Role box (desktop: the browser's own list open under it; phone: the box closed), the reason line under it — both ringed |
| `s2q-a-p-rec-alt` | The same on the phone with the alternative wording |
| `s2q-a-d-other`, `s2q-a-p-other` | The other choice: "Admin" picked as today, Save refused in the grey "Blocked:" note — the box and the note ringed |
| `s2q-b-d-refused`, `s2q-b-p-refused` | After Hunter made Osprey a member (a real Save): the Undo button and today's refused-Undo note, ringed |
| `s2q-c-d-ended`, `s2q-c-p-ended` | Saber's bell, three squadrons shown in their colours: "archived · Hunter", "posted overseas", "deleted · Hunter", ringed |
| `s2q-c-d-master`, `s2q-c-p-master` | Kestrel's bell: "Plan of 149 ended: master admin covers every squadron · Saber", ringed |

Two things the first run must check, as the scripts cannot know them ahead: whether a tap on Saber's or Kestrel's bell
opens the list (a waiting OIL question or access request opens that instead, D769), and that Kestrel's bell has at least
one line to copy; the run reports both, and the phone's line count for each reason wording (A's FACT lines).
