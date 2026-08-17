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

### Observation 3: Checkpoint — no observations pending (medical-sync build, tasks 1–3)

**Status:** OPEN
**Date:** 2026-08-17
**Session context:** Leave War medical markers build — codes/counters/picker done, sync next
**Skill:** task-observer
**Type:** internal
**Phase/Area:** 3rd-completion checkpoint

**Issue:** Checkpoint marker only; observation 2 (diff the skip-conditions of new walkers over shared structures) is being actively applied to the sync-wire extension.

**Suggested improvement:** None.

**Principle:** None — acknowledgement marker.

### Observation 4: Widening a vocabulary means auditing every pruning filter over its parallel state

**Status:** OPEN
**Date:** 2026-08-17
**Session context:** Leave War medical sync (wire 5) — medical codes joined the set of cell codes that carry an ownership record
**Skill:** New skill candidate: none — extends Observation 2
**Type:** open-source
**Phase/Area:** derived-state reconcilers / load-time sanitisers

**Issue:** A load-time sanitiser (reconcile) dropped any state record on a non-biddable cell. When medical cells started carrying raptor-ownership records, that filter would have silently stripped ownership at every reload — making synced cells editable and re-mintable (a sync loop) with no error anywhere. Found only by grepping every isBiddable call site after widening the ingest gate.

**Suggested improvement:** When a new code/vocabulary starts carrying records in a parallel map, grep every consumer of the old membership predicate (not just the write paths) — especially load-time sanitisers and reverse sweeps, which DELETE based on the predicate.

**Principle:** A membership predicate used to PRUNE shared state is a hidden dependency of every new member; widening what may hold state without auditing the pruners produces silent deletion at the next load, far from the change that caused it.
