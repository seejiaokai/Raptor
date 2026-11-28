# Section 2, step U0 — the pins: the builder's report (chat 199's Opus helper, 26 Nov 26)

Brief: `2026-11-26-msq-s2-u0-brief.md`. Tests only. No app file changed. Nothing committed or pushed.

## What was written

**File 1 — `raptor-port/src/ui/msq-s2-asis.test.tsx`** (jsdom, `withThird()`). It has 24 pins, every one seen passing on
today's code. Admin → Users is drawn on its own and redrawn on the store's version, the way `msq-users-row.test.tsx` does
it.

1. **A man's whole row on his own squadron's page**
   - *Hunter on 142's page.* Ranger's opened row has a live sign-in box (holding his sign-in), a live Role box, and
     Save, Cancel, Suspend, Archive and Delete, all pressable, in today's words. There is no grey squadron number by his
     name. His lines read: 142 "Home squadron"; 149 `None View* Plan(off)`, "Plan is for admins only."; 150 greyed whole,
     "Only an admin of 150 can give access to 150."
   - *Saber on 142's page.* The same whole row. 149 and 150 are both his to change, and each Plan is greyed "Plan is for
     admins only."
   - *Kestrel.* He is not offered 142: the squadrons he can read and the Schedules menu both hold 149 alone.
2. **View given and ended (D2336, D2306)**
   - *Kestrel, from Ranger's row found by search.* He ends Ranger's View of 149 and then gives it again. Each is one Undo
     step.
   - *Hunter (a Plan holder of 149), from Ranger's row on his own 142 page.* The same, and each is again one Undo step.
   - *Mako, 150's admin with nothing in 149.* The 149 line is greyed with "Only an admin of 149 can give access to 149.",
     and the door refuses in the same words.
   - *A member's Plan.* It is greyed "Plan is for admins only." for Kestrel and for Saber, and the door refuses in the
     same words.
3. **The last-admin refusals (D2246, D2247)**
   - Hunter makes Kestrel a member: refused with "Kestrel is 149's last admin. Make another admin of 149 first." A Plan
     holder does not count while 149 has an admin of its own.
   - "+ New squadron" 151 is made with Hunter as its first admin. Saber then makes Hunter a member: refused with "Hunter
     is 151's last admin. Make another admin of 151 first." With no admin of its own, the Plan holder counts.
   - Kestrel is made 151's only admin, and Osprey is made a second admin of 149 so that 149's lock does not answer first.
     Hunter, who has nothing in 151, then makes Kestrel a member: refused with "Kestrel is 151's last admin. Only a master
     admin or an admin of 151 can make another."
4. **His own account's bell lines (D2319, D2251).** Saber ends Hunter's Plan of 149 and then gives it again. Hunter's
   bell reads "Plan of 149 ended · Saber" and "Given Plan of 149: full access to 149 · Saber". Both lines go to Hunter
   alone, and neither wears a squadron mark.
5. **The page as it must stay**
   - The list is A to Z by callsign, and saving Ranger as an admin leaves the same rows in the same order (D322).
   - "Waiting for access" stands, with "Nobody is waiting for access." when nobody is waiting.
   - With Ranger archived, the fold reads "▸ Archived · 1", then "▾ Archived · 1" when opened. His row is there, with
     "Archived 15 Jul 26 by Saber".
   - Filter's Pilots tick leaves only pilots, in the list's own order.
   - On Kestrel's 149 page the filter offers "Plans 149", and it finds Hunter alone (D2400).
   - Hunter's own row does not open. Its press is greyed, titled "Your own account — another admin can change it", and
     no editor opens.
6. **Plan's standing rules**
   - *Plan needs an admin's account.* Saber giving Ranger Plan of 149 is refused with "Plan is for admins only."
   - *Made a member (D2250).*
     - Saber makes Hunter a member, and his Plan of 149 ends in the same command.
     - Saber's Undo makes Hunter an admin of 142 again and puts the Plan back, because Saber is one who may give it.
     - The Redo makes him a member again and drops the Plan again.
   - *A move ends Plan (D2203).* Hunter moved to 150 still holds Plan of 149 today; on the move day he has none.
   - *"+ New squadron" (D2308).* It gives its first admin, Kestrel, Plan of 151.
   - *Only a master admin makes squadrons and master admins.*
     - Hunter making a squadron is refused with "This change could not be saved." (the words this door uses today).
     - Hunter making a master admin is refused with "Only a master admin can do that", by the mark's own door and by the
       row's Save.
7. **Callsigns**
   - With Ranger archived, a new person named Ranger is added to 142 (D286).
   - A second live "Ranger" is refused with "Ranger is already taken — callsigns must be unique", and nobody is added
     (D288).

**File 2 — `raptor-port/src/state/msq-s2-plan.test.ts`** (`withThird()`). It has one describe, "as built today — changes at
U2 (D2730 Q8)": a premise test and the three "as built:" cases. Each case's comment says what U2 turns it into.

## Counts seen

| Run, from `raptor-port/` | Result |
|---|---|
| `npx vitest run src/ui/msq-s2-asis.test.tsx src/state/msq-s2-plan.test.ts` | 2 files, 28 passed: 24 pins, the premise and the three "as built" cases |
| `npx vitest run src/ui/msq-guard-rollcall.test.ts` (R9) | 3 passed; both new files call `withThird()` |
| `npm run lint:changed` | NOT RUN in effect. It exited 2 because the code check could not read the `main` side to compare against, so it compared nothing |
| `npm run build` | see the last section |

## What the three "as built" cases really do (Hunter: 142's admin, Plan of 149)

Each of the three ways goes through today. None is refused by today's code.

- **(i) The role tick.**
  - Hunter moves Ranger to 149. The door says ok.
  - On the move day Ranger is a member of 149 and Hunter still holds Plan of 149.
  - Hunter's Save with Admin picked goes through, and Ranger is 149's own admin.
  - **But the second half of NQ1's road is shut today.** Ranger, now an admin, cannot give or end Plan of 149: he is told
    "Only a master admin gives Plan or makes a master admin." (`state/accounts.ts` l.885, `state/units.ts` l.170). Plan
    is still a master admin's alone. The two-step hand-on that NQ1 fears opens only when U2 builds D2626's "by its own
    admins", which is why Q8 has to land with U2.
- **(ii) A re-link.**
  - The world has only one 149 admin, so "another 149 admin's sign-in" is Kestrel's own.
  - Hunter's re-link of Kestrel's sign-in to a 149 man with no sign-in is saved. That man is now 149's admin today, and
    Kestrel is left with no sign-in.
  - The door lets it through because Kestrel's sign-in holds no View or Plan row, so the re-link check finds nothing to
    refuse (`state/accounts.ts` l.563–576). Hunter also counts as an admin of 149 for the other-squadron check (l.547–555).
- **(iii) An Undo.**
  - Hunter's Undo of his own make-member is let through, and the man is 149's admin again.
  - **As the brief wrote it, it cannot start.** With Kestrel as 149's only own admin, Hunter's make-member is refused
    first: "Kestrel is 149's last admin. Make another admin of 149 first." (D2247).
  - So the test first has Kestrel make Osprey an admin of 149. Hunter then signs in, which empties the Undo list, makes
    Osprey a member, and presses Undo. The Undo goes through and Osprey is 149's admin again.

## Where today's code or the plan differs from the brief

- **File 2 runs in jsdom, not node.** Undo announces itself through the app's passing note, which needs a page
  (`ui/toast.ts` l.4). The other account-Undo tests do the same (`state/msq-fix4-undo-plan-master.test.ts`). The reason
  is in a comment at the top of the file.
- **(iii) needs a set-up the brief did not name:** a second own admin of 149, as above.
- **(ii) "another 149 admin":** the world has one, Kestrel, so his own sign-in is re-linked.
- **(i) "the made admin then giving Plan of 149"** (§19.2's V5 sentence): refused today, as above. It is asserted as
  refused, not bent.
- **The file's name.** §19.10's "Pinned before the changed half" names `src/ui/msq-views-asis.test.tsx`. The brief and
  §21's ranges table name `msq-s2-asis.test.tsx`, which is the name used.
- **Not separately pinned from §19.10's list:** "a one-squadron bell with no numbers", "the sign-off boxes' people" and
  "Help's form". The brief's group list leaves them out, and they belong to the bell section (S3). Nothing in the brief
  was left unwritten.
- **Group 1, Hunter's own row:** "the row of the signed-in admin does not open" is pinned in group 5. On Ranger's row
  Hunter's 150 line is greyed, because he has View of 150 only. That is today's behaviour and it is pinned as it is.
- No test needed a man the world lacks. `test-support/msq-world.ts` was not edited. Squadron 151 is made in three tests
  through "+ New squadron"'s own door (place `p1`, as `withThird()` makes 150).

## Pins I could not write

None.

## The build

`npm run build` is under the checks lock. When this report was written, the lock was held by another chat's fanned-out
bell walk, and this helper was waiting in line for it. The result is given in the helper's reply.
