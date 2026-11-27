# Section 2, step U1 — the report (Opus builder helper, chat 199, 26 Nov 26)

Brief: `2026-11-26-msq-s2-u1-brief.md`. Branch `claude/msq-s2-users-685735`. **Nothing committed, nothing pushed.**

Status: READY FOR INDEPENDENT REVIEW (the security reader's read is owed — this is a permissions step).

## What changed, file by file

- **`src/ui/UsersPanel.tsx`**
  - `foreignHere(pid)` — one predicate, `otherSqnOf(pid) !== null` (his home today is not the page's squadron).
  - `ShortSub` — the short row's second line: seat and CAT, then the role in words ("admin" / "master admin, full
    access"; a member and a man with no sign-in add nothing), then what he holds of the page's squadron ("also plans
    149" — the same `plans-<pid>` span as built; "also views 149" in a `views-<pid>` span), then "you" on the signed-in
    admin's own row. No sign-in name, no posting tag, no held note.
  - `ForeignEditor` — the short row opened: `SquadronLines` with `only={unit}` (the one line), Save (`#accEdSave`) and
    Cancel (`#accEdCancel`), nothing else — no sign-in box, Role box, roles table, Suspend, Archive, Delete or Give
    sign-in. A man with no sign-in: the words (`#accEdNoSignIn`) and Cancel alone. Its own save (below). Marks its
    change not saved on the row: `data-unsaved="true"` on its `.acc-edit` while the line picked differs from the line
    as it stood when the row opened.
  - `PersonRow` — closed: short when `foreignHere`, whole otherwise; the short row drops the two dots, the role badge
    and the held note. Opened: whether it is short is **decided at the press that opens it and held by the page**
    (`UsersPanel`'s new `editOn` state, set in `toggle` with the page's squadron at that moment) — held in the page,
    not in the row, because a pick redraws the row in another group (a remount), which lost a row-held value in the
    first try (the "150 picked" test caught it). So a move or a pick under an open short row never swaps it for the
    whole row.
  - `UsersPanel` — `editOn` beside `editing`; `toggle` sets both; `row()` passes `openOn`.
  - Unchanged: the whole row (`PersonEditor`, `accessWant`, `rowLocks`), the doors, Hunter's own "· also plans 149".
- **`src/ui/UserAccess.tsx`** — `SquadronLines` takes `only?: string`, the one squadron to draw; each line's state is
  still `lineState`'s, unchanged.
- **`src/ui/useraccess-model.ts`** — `shortRoleOf(a)`, `holdsHereOf(a, unit)`, `noSignInWords(homeNum)`,
  `changedWhileOpenWords(callsign)`; imports `isAdminAccount`.
- **`src/ui/msq-s2-row.test.tsx`** — new (below).
- **`src/ui/msq-s2-asis.test.tsx`**, **`src/ui/msq-users-row.test.tsx`** — re-pointed (below).
- `postout.css`, `userslist-model.ts`: not changed (the short row needed no style of its own: `.acc-main` already fills
  the row once the dots and badge are gone).

## The exact arguments the short row's Save passes

From `ForeignEditor.save` in `src/ui/UsersPanel.tsx`:

```ts
if (done(saveAccess(a.id, { grants: { [p.unit]: line } }), 'Saved')) p.onClose()
```

`p.unit` is the page's squadron held from the press that opened the row; `line` the one line picked. Before it, at
Save, the row is judged again:

```ts
if (!foreignHere(p.pid) || pageUnit('own') !== p.unit) {
  HOOKS.toast(changedWhileOpenWords(p.callsign), 'warn'); p.onClose(); return
}
if (!unsaved) return p.onClose()
```

— nothing sent, the row closed, "<Callsign>’s row changed while it was open, so nothing was saved. Open it again." in
the app's amber passing note (`'warn'`, as the drawing s2-36 shows). A man with no sign-in has no Save at all.

## Tests — seen failing first, then green

`src/ui/msq-s2-row.test.tsx` (jsdom, `withThird()`; a passthrough `vi.mock` of `state/accounts` records every
`saveAccess` call). 14 tests.

- **On today's code: 13 failed, 1 passed.** The one that passed is a pin and is named "pin:" — V4's "Kestrel gives
  Ranger View of 149 from his row … one Undo step" (the whole row saved the line too).
- **After the build: 14 passed.**
- V1 (4): Hunter on 149 — Ranger short and one line, Plan greyed "Plan is for admins only."; a 142 man with no sign-in
  — words and Cancel only, no `#accGive`/`#accGiveName`/`#accGiveRole`; his own row "· admin · also plans 149", "you",
  not openable; Saber "· master admin, full access", opened "149 Full access".
- V2 (3): Kestrel (Hunter as a Plan holder, Ranger by search), Saber with 149 picked, Mako on 150 ("· also views 150",
  one line, 150).
- V3: not repeated — U0's pins hold it: `msq-s2-asis.test.tsx` §1 "pin: Hunter (142's admin) on 142's page — …",
  "pin: Saber (master admin) on 142's page — …", "pin: Kestrel (149's admin, no right in 142) is not offered 142 at all".
- V4 (2): the pin above; and `data-unsaved` on a change, gone when put back, Cancel and Escape drop the choice, nothing
  saved, it reopens on what is saved.
- V4b (5): Saber and Hunter — rename on 142, pick 149, open the short row, Undo (the rename taken back, the row still
  open), change the 149 line, Save: the spy sees exactly `[[ACCT.ranger, { grants: { u149: 'none' } }]]`; name as the
  Undo left it, role "main", no master mark, 150's line still View. His move lands under the open row (moveMan, clock
  to the 16th, a redraw): the row stays short, Save sends nothing, the row closes, the Q13 note. The page's squadron
  changes under the open row (150 picked): Save sends nothing, the row closes, the Q13 note.
  - **"…or an Undo of one" could not be built as written.** The app's own Undo refuses to take back a move once it has
    landed ("Something else changed this after your action — it can't be undone now." — seen in a probe with no page
    drawn at all, then deleted), and before it lands his home today does not change. So that test holds what an Undo
    of one can do: refused, he stays 142's, the row stays short, and its Save sends his line alone
    (`[[osprey's account, { grants: { u149: 'view' } }]]`). Told here for the orchestrator to judge.

Also run, all green after the build (19 files, 222 tests): `msq-s2-asis`, `msq-guard-g`, `msq-guard-rollcall`,
`accounts-newperson`, `accounts-ui`, `msq-fix2-users-moved-admin`, `msq-fix3-users-one-save`, `msq-squadrons-panel`,
`msq-users-filter`, `msq-users-row`, `onedoor-users`, `rolestable`, `adminclear`, `msq-admin-config`, `msq-clear`,
`msq-fix3-admin-panel-undo`, `postout-landing`, `reshape-b2-no-guest-switch` (baseline before the change: 18 files, 208
tests, all green).

## Existing tests re-pointed (none weakened, none deleted)

1. **`msq-users-row.test.tsx` "R2, R3 — Kestrel finds Ranger…"** — expected the sign-in box, Role, Suspend, Archive and
   Delete drawn greyed, and two lines (142 Home, 149). Now: those five not drawn, Save live, the one 149 line in the same
   state, and the View save as before. Why: D2625 / D2655 D5 — not greyed, not drawn. Title changed "greyed" → "not
   drawn".
2. **`msq-users-row.test.tsx` "R5 — a plain admin of 149 opening a 142 admin"** — read `lines()[1]`; now `lines()` is
   exactly the 149 line, same state and words. Why: the 142 line is no longer drawn on 149's page.
3. **`msq-s2-asis.test.tsx` §2 "pin: one who may not — Mako…"** — a U0 pin that held, as built, a greyed 149 line on
   Mako's 150 page. U1's rule removes that line (only 150's is drawn there), so the pin is re-pointed to the new rule:
   one line, 150's; the door's refusal "Only an admin of 149 can give access to 149." kept word for word. The greyed
   line in those words is still drawn and held where a 149 line is drawn for one who may not give it — `msq-users-row`
   R5's first test (Hunter in the two-squadron world, on his own page). **This is a U0 pin changed by the very rule U1
   builds — named for the orchestrator, not bent to pass.**

## Where the build departs from a drawing, and why

- **Lines' notes kept as `lineState` gives them.** s2-16 (Blade, a 142 admin, opened for a plain 149 admin) and s2-14
  (Hunter) draw the 149 line with Plan live and no note; the build shows today's state — for Kestrel, Plan greyed "Only
  a master admin gives Plan." — because who may give Plan is U2's, not this step's (brief item 3).
- **Grey number inside a folded group, the block, Incoming, the folds** — not this step's (no such groups yet); the row
  is built where today's page draws such a man (a Plan holder among the people, or a search).
- **The row keeps today's `.acc-row` look** — the drawings' opened card (`od-row-on`) is the existing one.
- Nothing else knowingly differs; no drawing check was run (it needs the browser and the lock).

## What a browser is needed to check

- The short row's spacing with no dots or badge (desktop and phone), and the second line wrapping on a 375 px phone
  ("Pilot · CAT IP · master admin, full access").
- The opened row's one line with Save and Cancel against s2-14/s2-16 (`-d` and `-p`), the no-sign-in words against
  s2-17, and the amber note's place at the foot against s2-36 — by the drawing check, at his iPhone's size and a
  desktop's.
- Escape and the keys going back to the row on a real browser.

## Found, not changed (for the orchestrator)

- **The whole row has no "changed and not saved" report** on this branch (no `useGuardWork`, no `ui/guard.ts` — the
  core's K1 has not landed here). The short row now marks its own on the row (`data-unsaved`); the whole row's is the
  core's to add.
- **The twin on the whole row:** a whole row opened on his own squadron's page whose man moves away while it is open
  still saves through `accessWant` with what it captured (role, name, every line). The doors judge the rights, but the
  row is not judged again. Outside this step's brief (item 7 keeps the whole row as today).
- **The search still finds another squadron's man by his sign-in name** (his D2730 Q9 says by callsign only) — U3/U4's.

## Checks

- `npx vitest run src/ui/msq-s2-row.test.tsx` — from `raptor-port/` — red first (13 failed / 1 pin passed), then PASS 14/14.
- `npx vitest run` the brief's four files and the re-pointed files and every Admin → Users file above — PASS, 19 files,
  222 tests.
- `npx tsc -p tsconfig.app.json --noEmit` — exit 0, no errors (supporting only; the build is the real type check).
- `npm run lint:changed` — NOT RUN in effect: it could not read `origin/main`'s side, so it compared nothing and its
  pass/fail switched itself off.
- `npm run build` — **NOT RUN — lock held by `claude/msq-s4-posting-3ba6fa` (chat 201: S4 builds, fanned-out walk with
  4 walkers, three browser tests)** for the whole 20 minutes it was polled, about every two minutes (17:52 to about
  18:12). Never built alongside it; the lock was never taken. Owed before this step is called done.
