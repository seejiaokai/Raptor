# The project guide's "no rule versioning" line — a correction DRAFTED for his approval (D2024), not applied

**What this is (chat 67, the night of 13 Nov 26).** His D2024 (13 Nov 26): "The project guide's statement that the app
keeps no copy of old Logic settings is to be corrected, the change read first by Astra and a fresh, blind Opus reader."
A working-guide change is made while he is awake, so tonight the wording is only drafted and read; `raptor-port/CLAUDE.md`
is NOT edited. On his word the line below replaces the old one, in a change of its own that merges on his "merge live".

## The line as it stands (`raptor-port/CLAUDE.md` §Stable decisions → Pipeline & repo invariants → Product invariants)

> no rule versioning (narrowed 26 Sep 26 by D186: a published day keeps the brief lead it printed, with it — one
> printed value, not a versioned rulebook)

## The line proposed

> no rule versioning — the rulebook itself keeps no history (narrowed 26 Sep 26 by D186 and 12–13 Nov 26 by D2005,
> D2014: a published day keeps the Logic settings it was published under — its printed B, its checks, and its OIL's
> report lead, debrief and "Full day of OIL", D592 — until its next amendment is published; one kept copy per
> published day, not a versioned rulebook)

Nothing else in the bullet changes (the items after the first "·" stay word for word).

## Why
- **D186 (26 Sep 26)** narrowed the 7 Aug 26 invariant for ONE printed value: a published day keeps the brief lead it printed.
- **D2005 (12 Nov 26)**: "A published day is checked by all the Logic settings it was published under, not only the
  brief it printed; a changed setting applies to that day from its next amendment and to every unpublished day at
  once." Built the night of 12 Nov 26 (pull request 762): each published day keeps a copy of the Logic settings.
- **D2014 (13 Nov 26)**: a published day's OIL follows the "Full day of OIL" setting it was published under. The build
  of 13 Nov 26 found this was already so since [OIL-WORK-START] (D592 (4), 5 Oct 26: the report lead, the debrief and
  the full-day line are kept in the published record); it is now pinned by tests and walked.
- So the guide's "one printed value" is no longer true, and a chat that reads it would wrongly treat every other
  setting as read live on a published day.
- What stays true, and is why "no rule versioning" is kept as the invariant's name: there is no rulebook of numbered
  versions, no history of the Logic settings, and nothing to pick an old version from — only the copy each published
  day carries until it is published again.
- Known limits of D2005, deliberately not in the line (they are in `docs/engine-rules.md` §Publishing and the backlog
  item [RULES-CHECK-FIXES]): the titles on a puck's chip, the same-time note and the R box still read today's settings;
  the open-ended row's assumed hour on a published day is a question waiting for him (13 Nov 26).

## Where the same statement stands elsewhere (already corrected, or not a guide)
- `docs/engine-rules.md` §Publishing — rewritten with the builds of 12 and 13 Nov 26.
- `docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md` row AM7 — corrected 13 Nov 26 (names D592, D2005, D2014).
- `.claude/rules/decisions/scheduler.md` — the rulings page states D2005 and D2014 themselves.
- Older specs and briefs that quote the 7 Aug 26 invariant are records of their day and are left.

## The read asked of each reader (a working-guide change — narrow brief, D70, D1761)
Read the old line, the proposed line, and the full rows of D186, D2005, D2014, D592 and D2024
(`grep -h '^| D2005 |' .claude/decisions-full/*.md .claude/rules/decisions/*.md`), and `docs/engine-rules.md` §Publishing
on this branch. Answer only: (1) does the proposed line say what those rulings mean — nothing more, nothing less;
(2) does it contradict any guide or ruling; (3) does it drop a safeguard the old line gave, or add bulk the guide does
not need; (4) any wording a fresh model would misread. A finding names the words and the ruling it is measured
against, and proposes the corrected words.

## The reads
To be saved below as they arrive: Astra's, and a fresh Opus reader's, each blind to the other.
