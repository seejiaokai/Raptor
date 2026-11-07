# Brief — the blind read of the rules diet's step 3, reading by section (7 Nov 26)

**You are one of two readers, each blind to the other (his D1739).** Do not open, search for or read any file named
`*step3-read-opus*` or `*step3-read-astra*`. Read only; change no file; commit nothing.

**What changed.** Three documents are no longer read whole; each is now read by section, and a short list says which
section to open when (his D1735 — the plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` §4 and §6;
its full row: `grep -h '^| D1735 |' .claude/decisions-full/*.md`, with the shell — a search tool may hide a long row).
D1735 narrows D68 ("never skip or shrink a read") and D1554 for these three reads only, on one condition the plan states:
**every section that applies stays a required read, read whole**. D138 stands: a summary must never change what the
original meant. D941 and D1417 stand: his design lessons (the design guide's §9) are read whole for every design job.
The whole change: `git diff 32ac5bd59 HEAD -- .claude/rules raptor-port/CLAUDE.md raptor-port/docs/bug-check-order.md
raptor-port/docs/bug-check-checklist.md raptor-port/docs/design-practices.md raptor-port/docs/feature-impact.md
raptor-port/docs/guide-full.md` (the scripts in that diff are read by another reader; leave them).

**The question, for each part: would an agent following the new reading path skip, weaken or bend anything the source
requires — or does a reworded line say more or less than its source?** Ask what is MISSING, not only whether what is
there is right.

1. **The checklist** (`raptor-port/docs/bug-check-checklist.md`, new) against the order it leads into
   (`raptor-port/docs/bug-check-order.md`, which stays whole and stays the authority). For each tier (NONE, LOOK, WALK,
   FULL): is every section of the order that applies to that tier named by some step, so that an agent opens it? Is
   anything in the sections it calls "background" (§1, §2, §3, §9a, §10, §13) — or §0, §0a, §4, §4a, "With the Claudex
   loop", §7.11 — a thing a check must actually DO, that no step sends the agent to? Is each step's one line faithful to
   its section (no requirement dropped, narrowed, widened, or a condition changed — "WALK with a shared drawer", "FULL
   also", "any job that needs a code read")? The 23 one-line lessons against §7.11's lessons (and the second "23", after
   §8): does any line check less than its lesson asks? Say whether the framing at the checklist's head ("Open every
   section a step names, whole, when that step applies … its one line here is a reminder, never the rule") is enough to
   keep D68's narrowing inside D1735's condition. Known and filed, not a finding: §7.11 has two lessons numbered 23 and
   lesson 8 stands before 7.
2. **The design guide's section list** (`.claude/rules/ui-design.md` §Which part of the guide to open, and the new lines
   at the head of `raptor-port/docs/design-practices.md`) against the guide's sections: does any section hold a rule
   that applies to a kind of design job the list would not send there? (For example: a rule in §4 or §6 that binds every
   change a person sees; §8 when a look is reported to him; "Where each piece came from" at the end.) Is "his lessons,
   whole, for every design job" kept?
3. **The ripple map's note** (`raptor-port/docs/feature-impact.md`, "How to read it — by section", under its title)
   against the map and its standing order (`raptor-port/docs/guide-full.md` §Weigh the whole ecosystem; the one-liner in
   `raptor-port/CLAUDE.md`): would an agent following the note miss a surface, a flow, a drift-seam or a dated section
   the change touches? Does the search it gives (`grep -o '^| \*\*[^*]*\*\*' docs/feature-impact.md`) list every surface
   of §1 — run it — and does it print rows from other tables that would mislead?
4. **Each changed pointer** — `.claude/rules/bug-check.md` (its head and step 1), the order's §0a step 1,
   `raptor-port/CLAUDE.md` (the bug-check one-liner; the map rows for the design guide, the bug-check order and the ripple
   map), `raptor-port/docs/guide-full.md` (§Weigh the whole ecosystem; §The bug-check standing order): does any change
   what the rule required, or point somewhere wrong? Note: the ripple map's one-liner in `raptor-port/CLAUDE.md` was left
   unchanged on purpose (its 350-character limit); say whether that leaves an agent reading the whole map, or misled.

**Not a finding:** a problem that lives only in data already stored, when the rules going forward are correct (D56);
wording you would merely prefer; the sizes (the plan's estimates were too low and he will be told); faults of the order,
the design guide or the ripple map that were there before this change, unless the new reading path makes them worse.
**A finding is a claim with a concrete failure** (what an agent would then do wrong, in which kind of job), **its cause
and its fix** — exact replacement words where you can (D489).

**Report:** for each of the four parts, "no meaning change" or the findings, each ranked high / medium / low, with file,
line and the fix. Then, for part 1, list the sections of the order you checked against the checklist, and for each the
step that names it (or "none"); and the lessons of §7.11 you compared closely, by number. Say what you checked and found
nothing in, too. Plain prose, no preamble.
