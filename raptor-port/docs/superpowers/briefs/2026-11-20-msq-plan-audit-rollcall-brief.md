# [MSQ-PLAN-AUDIT] — the roll-call's brief (chat 126, 20 Nov 26)

His D2242 (20 Nov 26): *"I think u should also have a dedicated run to check if u did missed out the development of
admin plan so far. It's concerning. I want u to make sure u check the work and the bugs u might have missed out."*
After the agent wrote "only a master admin" where an admin with Plan of a squadron may act too (D2241), every place in
the many-squadron work that decides who may act for a squadron is listed and checked. This brief is the roll-call's —
written by the host, its code parts gathered by Opus helpers, each row checked by the host against the code. A blind
read for places the roll-call missed follows, with its own brief.

## The model (read the code to confirm; never guess)

- `src/state/units-model.ts`: a right is a `Grant` row `{ id, account, unit, level: 'admin' | 'view', from? }`.
  **"Plan" of a squadron is a grant of level `admin` there** (D2211, D2201); **"View" is level `view`**. A master admin
  is an account with `master: true`. A person's squadron on a day is his `home` rows (`homeUnitOn`).
- `levelFrom(acct, unit, iso, rows)` is the one level answer: `'admin'` for a master admin, for a home admin (home on
  `iso` is `unit` and the account role is `admin`) and for a Plan holder; `'member'` for a member at home; `'view'` for a
  View holder; else `null`. `levelOfAccount`, `levelIn` (`accounts.ts`), `levelBefore` (`units.ts`) wrap it; the gate
  (`perms.ts`) has `levelInForce` and readers over the rows before a command.
- So: a check reading one of those as `=== 'admin'` already lets a Plan holder in. A check reading `.master` alone, or
  "home is the squadron and role is admin" alone, leaves him out. A check reading the role alone with no squadron
  (`isAdmin()`, `roleOf() === 'admin'`, `mayManageAccounts()`, `isAdminAccount`) lets in an admin of ANY squadron.
- Seeded sign-ins (`state/accounts.ts` SEED): **Saber** (`acad`, person `stiff`) the master admin, home 142; **Hunter**
  (`acad2`, person `prowler`) 142's admin; **Ranger** (`acus`, person `bane`) 142's member; **Kestrel** (`acad9`, person
  `kes9`) 149's admin; **Osprey** (`acus9`, person `osp9`) 149's member. In scenarios: Hunter holds Plan of 149.
- Today no screen picks another squadron (the Schedules menu is a later step), no screen gives View or Plan, and the
  session's squadron is the signed-in person's home (`state/store.ts` l.459 `switchUnit(sessionUnit(...))`). Say so where
  it decides whether a place is reachable today, but judge the code as written: a place unreachable today is still a row.

## The rulings that decide each row (People & accounts page, `.claude/rules/decisions/people-accounts.md` §Roles and permissions, §Many squadrons; full rows: `grep -h '^| D2201 |' .claude/decisions-full/*.md`)

- **D2201, D2211:** Plan is full access to that squadron, as its own admins have — its people and sign-ins included.
- **D2241:** wherever a master admin may act for a squadron, an admin holding Plan of it may too — in what the app
  allows, in its on-screen words and in what is written for him — both named, never the master admin alone.
- **D2240:** the role is always "master admin" on screen, never "master" alone.
- **Plan holders kept OUT on purpose (a row here is MUST NOT, naming the ruling):** giving or taking Plan (D2199, D2211 — a
  master admin's alone); making a squadron (D2191); making or unmaking a master admin (D2191); changing a master admin's
  account (D2205); the last-admin count where the squadron has admins at home (the agent's reading — reshape plan §5.2;
  D2242 names it: a Plan holder counts only where the squadron has no admin at home).
- **D2192:** a squadron's admins make admins of their own squadron only — a Plan holder of 149 is a full admin of 149
  (D2201), so making a 149 man an admin, suspending, archiving or deleting him is open to him.
- **D2191, D2094:** a View holder sees the other squadron's schedule pages and Logic read only, never its bell, never
  acts; Admin → Users lists the admin's own squadron, a man of another found by search.
- **D2202:** while an admin holds Plan of a squadron, his bell carries that squadron's admin lines, on by default.
  **D2198:** a master admin's bell carries his own squadron's lines by default, every other squadron's off.
- **D2197:** a master admin's pick in the Schedules menu moves every page to that squadron (by D2241, a Plan holder's
  pick too — the reshape plan's `pageUnit`).
- **D2203:** a move ends every View and Plan he held of other squadrons (the plan reads it as: at the start of his move
  day, D2243 Q4).
- **D785:** a scheduler is always an admin — a finding that needs a scheduler who is not an admin is not a finding.
- **D56:** harm that lives only in demo data already stored, with the code correct going forward, is not a finding.

## What to produce

A markdown table, one row per place that decides who may act for, see, or be told about a squadron, in your scope:

| # | file:line | function or door | what it decides | who it lets in today (master admin / home admin / Plan holder / View holder / any admin / member) | verdict | scenario and fix (MISSING, WRONG, WORDS only) |

Verdict, one of:
- **HAS IT** — a Plan holder is treated as the rulings require;
- **MUST NOT, because <ruling>** — the code keeps a Plan holder out, and a ruling says so;
- **MISSING** — a Plan holder of that squadron is left out where a master admin or its home admin is let in;
- **WRONG** — it lets in someone it must not (an admin of another squadron with no Plan, a View holder acting, a Plan
  holder doing a must-not, a Plan holder of 150 acting for 149);
- **WORDS** — on-screen words name only the master admin where a Plan holder may act too, or say "master" alone.

No blank cells. Cite exact lines; read the code for each row. For each MISSING, WRONG or WORDS row: one concrete
scenario with the seeded people (e.g. "Hunter, 142's admin with Plan of 149, opens Kestrel's row on Admin → Users and
taps Suspend: refused 'He is 149's…'") and the fix in one line. After the table: what you were unsure of, and anything in
your scope you did not read. **Edit no file but your report.**
