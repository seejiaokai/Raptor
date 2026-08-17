# Skill Observation Log

Observations captured during task-oriented work.

**Status key:** OPEN = not yet actioned | ACTIONED (YYYY-MM-DD) = skill
updated/created | DECLINED (YYYY-MM-DD) = user decided not to pursue —
resolved statuses always carry their resolution date

---

## 2026-08-17

### Observation 1: Session-start checkpoint — no observations pending

**Status:** OPEN
**Date:** 2026-08-17
**Session context:** Building Leave War sync wire 4 (weekend/PH duty earns OIL) in the Raptor repo.
**Skill:** task-observer
**Type:** open-source
**Phase/Area:** 3rd-task-completion checkpoint

**Issue:** Checkpoint marker: the log did not exist in this repo yet (ephemeral web container, first committed-log session); created it at the first mandatory checkpoint rather than at session start — the Session Start Protocol step was deferred while exploration ran.

**Suggested improvement:** None needed yet; noting so the next session knows the log's committed-into-repo location (.claude/skill-observations/log.md) is deliberate, per the repo's activation note.

**Principle:** In storage-less environments the log must live in the repo to survive; create it the moment the first write is due, not later.

### Observation 2: New walkers over shared structures — diff the skip-conditions

**Status:** OPEN
**Date:** 2026-08-17
**Session context:** Wire 4 build (published duty → OIL credit); the medium code-review pass caught that the new `dayOilCredits` walker ignored `cx` cancellation markers and `more[]` extras that every sibling consumer of the same day structures honours.
**Skill:** code-review
**Type:** open-source
**Phase/Area:** review checklist / correctness angle

**Issue:** A brand-new function iterating structures that several existing functions already iterate (day waves / duty rows) silently disagreed with all of them about which entries count: it skipped no cancelled rows and missed the overflow-crew list. Unit tests written by the author alone shared the author's blind spot; the reviewer found it by comparing the new walker's skip-conditions against the existing walkers' line by line.

**Suggested improvement:** When reviewing (or writing) a NEW consumer of a structure that existing code already consumes, explicitly diff its filter/skip conditions against each sibling consumer's — every marker a sibling honours (cancellation flags, overflow lists, sentinel entries) is either honoured or its omission argued in a comment.

**Principle:** A shared structure's existing walkers encode the structure's real semantics; a new walker is wrong wherever it silently diverges from them, and the cheapest complete review of it is a skip-condition diff against its siblings.
