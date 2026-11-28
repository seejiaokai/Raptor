# Section 2's three questions — prep report (an Opus helper for chat 199, 26 Nov 26)

Nothing was built, run, committed, staged or pushed; nothing under `raptor-port/src` was changed (read only). The
cards to paste: `2026-11-26-msq-s2-questions-cards-13-15.md`. The words used are the fresh Fable review's final column
(`2026-11-26-msq-s2-questions-words-review.md`), word for word.

## 1. Renumbering — 10, 11, 12 → 13, 14, 15

| Script | What changed |
|---|---|
| `scripts/handpass/n199/words-s2q.mjs` | Header says questions 13–15; sections headed 13 / 14 / 15. (No loop bounds or numbers in it.) |
| `n199/draw-s2q-a.mjs` | Question 13. Pictures `s2q-a-{d,p}-rec` → `q13-{d,p}-rec`; `s2q-a-{d,p}-other` → `q13-{d,p}-other`; run keys `a-…` → `q13-…`. The `s2q-a-p-rec-alt` picture is gone (the review dropped the alternative wording). New picture `q13-{d,p}-lastadmin` (below). |
| `n199/draw-s2q-b.mjs` | Question 14. Picture `s2q-b-{d,p}-refused` → `q14-{d,p}-refused`; run key `b-…` → `q14-…`. |
| `n199/draw-s2q-c.mjs` | Question 15. Pictures `s2q-c-{d,p}-ended` / `-master` → `q15-{d,p}-ended` / `q15-{d,p}-master`; run keys `c-…` → `q15-…`. |
| `n199/s2q-lib.mjs` | Only its header comment: pictures now `drawn/q13-*`, `q14-*`, `q15-*`. No numbers in its code; its loops are size loops (`d`, `p`), not question numbers. |

Each script also writes a `-crop.png` beside each picture (the lib's `shot`). No file of that name existed in
`drawn/` before (checked: nothing there starts `q1` or `s2q`).

**The page's loop top is not in any script under `scripts/handpass/`.** It is in the questions page itself — the one
questions page artifact (its link is in `HANDOFF.md`, chat 199's block), in the script at the page's foot:
`for (var i = 1; i <= 12; i++) {` inside `build()`, the loop that reads each question's radios into the reply line. It is
a plain loop bound: raise `12` to `15` in the same publish that adds cards 13–15. **Not changed here** — the page lives
only in the artifact store, and publishing it is the host's job (read it first; the tool hands back a newer page if
another chat published meanwhile). The page's own comment already says "last used: 12; Admin → Users' three take
13–15", and its step 3 says to raise that loop top. The page's reply values take the shape `A (…)` (the loop writes
"13 " before the value), so the cards file gives the values in that shape, not the review's `10: …` form.

## 2. The final words — what each script now draws

`words-s2q.mjs` keys, against the review's §1:

| Key | Words | From the review |
|---|---|---|
| `roleReason` | Only 149's own admins or a master admin can make an admin of 149. | row 1, kept |
| `roleReasonAlt` | removed | row 2, dropped |
| `roleRefused` | the same bare sentence as `roleReason` | row 3, "if the builder keeps the page's own look, the words are the bare sentence" — fact (a) below says the page's look is the amber note |
| `roleRefusedBlocked` | Blocked: only 149's own admins or a master admin can make an admin of 149. | row 3's "Blocked:" form, kept as a key only; **not drawn** |
| `lastAdmin` | Kestrel is 149's last admin. Only 149's own admins or a master admin can make another. | the last row (owed; Q8 makes the built line untrue) — new key, drawn on question 13 |
| `undoRefusedPlan` | Only 149's own admins or a master admin can make an admin of 149, so this can’t be undone. | row "B, the honest sentence" — new key, **drawn** on question 14 in place of today's |
| `undoToday` | Something else changed this after your action — it can’t be undone now. | today's words (was `undoRefused`); kept only for the card to quote; **no script draws it now** |
| `planEndArchived` | Plan of 149 ended: archived | kept |
| `planEndOverseas` | Plan of 149 ended: posted out overseas | was "posted overseas" |
| `planEndDeleted` | Plan of 149 ended: deleted | kept |
| `planEndMaster` | Plan of 149 ended: made a master admin | was "master admin covers every squadron" |
| `planEndMasterAlt` | Plan of 149 ended: master admin covers every squadron | the other wording, named on card 15; not drawn |

The two the review found:
- **Question 14 (old 11), today's Undo words untrue:** `draw-s2q-b.mjs` now draws `undoRefusedPlan` (the new sentence),
  not today's; it also records how many lines the note takes (`q14-{d,p}-refused.noteLines`). Card 14 quotes today's
  words only to say why they are not used.
- **The last-admin line (rides with old 10, now 13):** a new key, a new picture (`q13-{d,p}-lastadmin`) and a quoted
  line on card 13 ("Either way, one sentence you approved changes…"), the review's §3 point 11, first way. It is
  **drawn, not real**: Hunter opens Kestrel's row on 149's page and picks Member (not saved); in the test world Osprey
  is a second 149 admin, so the real app would let that through — the amber note is laid on in the place and look the
  app gives a refused Save. Kestrel's person key is read off the page by his callsign (the lib does not fix it).
- `draw-s2q-a.mjs` also drops the alternative wording's measuring and picture.

## 3. The two open builder facts — read in the code

**(a) Which note question 13's other choice would use.** A refused Save on a whole Admin → Users row goes through one
helper, `done` in `raptor-port/src/ui/UsersPanel.tsx` (line 82): `if (bad) HOOKS.toast(bad, 'warn')` — the amber
passing note at the foot, the refusal's sentence bare, no "Blocked:". `PersonEditor`'s `save` (same file, ~line 441)
calls `saveAccess` and hands its refusal to `done`; the last-admin refusal arrives the same way (`state/accounts.ts`
`lockProblemFor` → `lockWords`). So a Save refused for making an admin, built through that same Save, would show the
amber note with the bare sentence. **Words changed:** card 13's other choice now quotes the bare sentence ("Only 149's
own admins or a master admin can make an admin of 149.") and names "the amber note at the foot of the screen, as it
does for every Save refused on this page today"; `words-s2q.mjs roleRefused` is the bare sentence; `draw-s2q-a.mjs`
draws it with `note(…, 'warn')` (was `'blocked'`). The grey "Blocked:" form is the guard rail's look for a refused pick;
using it here would make this one Save refusal look unlike the others on the same button.

**(b) What a Plan holder sees today on a row whose man is already an admin.** `PersonEditor` (`ui/UsersPanel.tsx`)
opens the Role box on the role his account gives today (`roleNow` → `rolePickOf`, `ui/useraccess-model.ts` line 16), so
on Osprey's row it reads "Admin". Whether the box is locked is `rowLocks` (same file, ~line 377): `rest =
adminOfUnit(home)`, and `adminOfUnit` (`state/perms.ts` line 426) answers yes for a Plan holder of that squadron (its
comment: "its own admins, a Plan holder of it, a master admin"); `roleLocked` is only `!rest` or "he is a master admin
and you are not". `RoleBox` (`ui/UserAccess.tsx` line 20) greys only "Master admin" (`masterOff` — not a master admin
himself). So today Hunter sees Osprey's Role box on **Admin**, with **Member and Admin both pickable and "Master admin"
greyed**, no line under it; he may pick Member and Save (his D2250). **Words changed:** none of the app's words. One
sentence is **added to card 13's text** (Opus's, not the review's): "On the row of a man who is already an admin of 149,
such as Osprey, "Admin" is not greyed: it is what he already is, so leaving it picked makes nobody an admin." — the
honest build the review's §3 point 4 named (grey "Admin" only where picking it would make someone an admin; else
Hunter, having picked Member, could not pick Admin back before saving). Not drawn; the builder draws it in U2b if it
shows.

Also seen: "+ Add a person" and "Give access" use a different box (`RoleSelect`, `ui/UsersPanel.tsx` line 74: Member and
Admin only, no "Master admin"). Card 13 says the same greyed "Admin" shows there too; that stays true, the box is
only a different one. "Give sign-in" uses `RoleBox`.

## 4. Drawing the pictures, once a build exists

They need the built app served on port 4745 (`s2q-lib.mjs`; `S2Q_URL` overrides) and, under the shipping rules, the
checks lock for the build — none was taken here.

```
node raptor-port/scripts/gatelock.mjs take "claude/msq-s2-users-685735 — n199 s2q drawings"
cd "C:/Users/User/projects/Raptor/.claude/worktrees/fable-read-faults-4104f0/raptor-port" && npm run build && npx vite preview --port 4745
# in a second shell, from the working copy's root:
node raptor-port/scripts/handpass/n199/draw-s2q-a.mjs > .tmp-s2q-a.log      # ONLY=rec,other,lastadmin SZ=d,p to narrow
node raptor-port/scripts/handpass/n199/draw-s2q-b.mjs > .tmp-s2q-b.log
node raptor-port/scripts/handpass/n199/draw-s2q-c.mjs > .tmp-s2q-c.log      # ONLY=ended,master
node raptor-port/scripts/gatelock.mjs release
```

(Send each run to a file and read its exit code and its `FACT … .error` lines; a failed run leaves a screenshot in
`raptor-port/.tmp/n199-s2q/<key>-error.png`.) The first run builds the test world once (`.tmp/n199-s2q/state-world.json`);
`FRESH=1` rebuilds it. Stop the preview by its port afterwards. Pictures land in
`raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/` — the 20 names listed under each card (10 whole screens, 10
crops). This working copy may be lean (it leaves out old walk pictures): check `node raptor-port/scripts/lean-copy.mjs status`
before writing into that mock folder.

## 5. Unclear, or owed

1. **Two passages on card 13 are Opus's words, not the review's** — the Osprey sentence (fact b) and the "Either way…"
   paragraph introducing the last-admin line. They are words put to him: a fresh Fable read of those two before
   publishing is advised (D2393's practice), and the review's owed cold read (§1a test 9) of the three reason-carrying
   wordings still stands.
2. **"On a phone it should take two lines"** (card 13) is unmeasured; the card marks it for the host — keep it only if
   `q13-p-rec.reasonLines` reads 2.
3. **Card 13's other choice** — I took the page's own look (amber, bare sentence) from the code. If the coordinator
   prefers the guard rail's grey "Blocked:" note, switch `draw-s2q-a.mjs`'s `other` to `note(s, WQ.roleRefusedBlocked('149'),
   'blocked')` and card 13 back to the review's quoted "Blocked: only …" line.
4. **The last-admin picture is drawn on a case the test world does not hold** (Osprey is a second admin); its card line
   says nothing of that, the picture's FACT does. If a real refusal is wanted, the world must lose Osprey's admin role
   first (not done here).
5. **The review's knock-ons** (its §3 points 12–14: a man made a member who also held Plan of a third squadron; a tap
   on the four bell lines; the roles table's note) are not on the cards, as the review left them; still to be read
   before U2b.
6. The page itself was read (not changed): its newest card is 12; its comment already reserves 13–15 for this section.
