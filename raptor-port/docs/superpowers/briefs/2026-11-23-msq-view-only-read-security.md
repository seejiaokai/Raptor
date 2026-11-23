# The security read — a squadron he only views, and the ☰ menu's squadron drop-down (23 Nov 26, HEAD cd94a4e8e)

A fresh Opus helper, blind to the walk and the other readers. Brief: `2026-11-23-msq-view-only-read-brief.md` plus the
security question (is hiding the only guard?).

**Result: no findings.**

- Hiding the tabs and menu entries, and the landing, are presentation only. His own pages read `pageUnit('own')` (his
  home for a View holder and in the member view); their edits `mayEditOwnPage` → `adminOfPage('own')`; the schedule
  pages' edits `maySchedEditPage`; every save `cmdAuthorize` and the unit checks (`unitRecordViolation`,
  `inputUnitViolation`, `warUnitViolation`, `trkUnitViolation`, `schedDayNamesViolation`) — none reads `pageOffered`.
- `landOnOfferedPage` only sets View-only Sched or enters his home (`!ENTERING`, never inside a save — `deferEffect`;
  `holdWar` kept). A misjudged "page moved" against "squadron moved" can only drop a tap, never widen access.
- Routes checked: every `setPage` caller (tabs, ☰, bell lines, the access request, OIL lines, Leave War lines, the OIL
  list, "Check my quals", the Tracker's Logout question, the Undo landing, sign-in, the Leave War sync's jumps); no URL
  routing exists.
- The ☰ list's rows come from `menuSquadrons()` → `readableUnits()`, the top bar's source; labels match the page rules;
  it redraws on every notify.

**Notes, not findings:**
1. `viewOnlyPick()` is false when the pick is not readable at all; safety then rests on maybeReenter sending him home
   first (it does, before the landing). Hardening: treat an unreadable pick as offering View-only Sched and Help only.
2. (Answered 23 Nov 26 by his D2387: keep it.) On 149's View-only Sched a View holder sees 149's people's medical inputs in full detail — `mayReadMedicalOf`, by
   role (D211), unchanged by this diff, D2191's "View follows the pick on the schedule pages". A product question for
   him if he wants it otherwise.
