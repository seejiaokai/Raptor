# Red team round 2 — the day lock after the fold-in (`[DB-SYNC-MODEL]`) — 29 Sep 26

**You reviewed round 1** (`docs/superpowers/briefs/2026-09-29-day-lock-redteam.md`; both reports and the author's
disposition of every finding: `docs/superpowers/briefs/2026-09-29-day-lock-redteam-reviews.md`, its last section).
Opus 5.5 has folded the findings into `raptor-port/docs/data-model.md`. **Read only; change no file.** This is the last
design round (the owner caps design reviews), so be decisive.

**New rulings since round 1** (full rows: `grep -h '^| D45[0-3] |' .claude/decisions-full/*.md`): D450 the lock is FIRM
— the database refuses a save from a non-holder (preferred route: Dataverse row ownership, no custom code); D451 a change
on a free day takes it; D452 Fast sync switches itself off after 20 minutes; D453 the order (this design, then the
table-shaping half of the preparation before the tables settle, the tuning half after connection).

**Read:** `git diff 17579150 -- raptor-port/docs/data-model.md` (everything since your round), and in full: §3
ScheduleWeek, "ScheduleDay at stage 1 — the day, and its lock", PlanningPuck / DayRemark, Amendment, Sign-offs; §5's
lead-in and its week / plan / amendment rows; §6 stage 1; §7 the ownership and import rows; §9 the contract paragraph,
the conflict table, "The day lock" rules 1–13 and "The change log"; §11's note on the day lock; §12 questions 8 and 9.
The mock-up page's changed words: `raptor-port/docs/mock/day-lock.html`.

**Answer three things:**
1. **Your own round-1 findings:** for each, CLOSED or NOT CLOSED (one line; if not, what is still missing). Say so if you
   disagree with a disposition — Fable 14's decline, the placement kept inside the day snapshot instead of a table,
   the lock as columns rather than a table, the change log's "less two minutes" overlap instead of a server sequence.
2. **Anything the fold-in broke or introduced** — in particular: is the ownership route real on Dataverse (team-owned
   free rows, Write at User depth with Assign at Business-unit depth, an Assign sent with `If-Match` — and does any
   OTHER write a scheduler must make to a day now fail for lack of ownership)? Does "worked out on read" leave any
   write that still has to reach a held day? Does one changeset per command fit Dataverse's batch limits for the
   biggest command (a template onto seven days, Sort all)?
3. **Anything still missing that would make IT build a table wrong.** Only that — screens and wording are later.

Out of scope, as before: D56 (a problem only in data already stored — all demo data, wiped); style; D62.
**Format:** numbered, most severe first, BLOCKER / MAJOR / MINOR, evidence, scenario, exact fix. Then one line:
APPROVE, APPROVE WITH FIXES, or REVISE. No preamble.
