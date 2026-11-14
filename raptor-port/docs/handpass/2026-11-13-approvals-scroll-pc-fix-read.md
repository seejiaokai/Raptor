# The narrow fresh read of the read fixes — Approvals scrolling inside itself on a PC (13 Nov 26)

A fresh, blind reader of the three fixes made after the two code reads (one wrapper at both widths, a new list from its
first request, the headings as wide as the lines) — uncommitted at the time, after 0a1802567. Saved as it arrived; what
was done with each finding: §12 of `2026-11-13-approvals-scroll-pc.md`.

I changed no files. I ran one unit file, `src/leavewar/ui/apprscroll.test.tsx`, on its own with no lock: 17 of 17 passed.

**What I checked that holds:**
- **Back to Approvals and the OIL tracker.** Neither path calls `setFilter`, and the period effect does not re-run on `shown`. The `[fits]` layout effect still hands back `listY`.
- **First mount.** `ApprovalsPage` mounts only when `mode !== 'off'`, which is always a fresh visit with `listY` at 0, so the reset on mount wipes nothing.
- **"Decide it in Approvals" from a clash note.** `goClash` calls `selectWar` + `askApprRing` + `setApprMode` in one batch. The period effect (line 176) is declared before the ring effect (line 364), so `listTop` runs first and the ring's `scrollIntoView` comes after. The ring's own switch to All uses `setFilterRaw`, so the place is not reset under it.
- **Approve all and the decide buttons** go through `apply`, which does not reset. The month chip, New, All, the second day of a range and another period all reset. The first day keeps the place: `DateCal` sends `onRun(iso, iso)` on a first tap and on a tap that starts the run over.
- **`display: contents` on a phone.** Nothing selects through the card as a direct parent apart from `.appr-card > * {max-width:1240px}`, which does not matter at 700 or under. No CSS uses sibling or `:first-child` selectors across the wrapper. The phone card is a block, not flex, so margins and gaps are unchanged. The wrapper is a plain div with no role, so nothing is lost for screen readers. The handpass scripts and e2e only query descendants. `scrollRef` on the wrapper is safe because every use is guarded by `fits`, and the pointerdown `t === sc` test can never hit a box that is not drawn.
- **`min-width: max-content`.** The tracks add up to 818px fixed, plus the 214px floor of the last track, plus 96px of gaps: 1128px. The buttons cell needs about 208px, under 214, so the lines' max-content equals the headings'. The "also" lines' spanning cells either sit on fixed tracks or are short. 1128 is under the 1240 cap, so a wide PC is unchanged. `.appr-pickpop` is not targeted and keeps 360px.
- **Would the tests pass with the fix broken?** No. jsdom keeps the `scrollTop` it is given, so dropping `listTop` leaves 300 and fails, and dropping `keepPlace` gives 0 and fails. The width-crossing test fails if the calendar is made anew.

**Findings**

1. **Narrow PC: "Pick dates…" opens the calendar out of sight (PLAUSIBLE).**
   - This comes from the earlier W3 commit, not this diff, but it is the sideways-scroll case change (3) is about.
   - Steps: at about 760 wide the box shows roughly 680px of the 1128px lines, so he scrolls right to reach Approve/Refuse. He presses "Pick dates…".
   - The layout effect at line 211 resets only `scrollTop`. The calendar sits at x 0–360 and the box is still scrolled about 440px right, so nothing seems to open.
   - The same applies to `listTop` after new dates: the new list starts at its first request but is still shifted sideways.
   - Fix: also set `scrollLeft = 0` in the line-211 effect, and probably in `listTop`.

2. **Pressing the chip that is already lit throws the place away (minor).** All while on All, or New while on New, now jumps the list to the top. The dates did not change, and D1421's "changes the dates" suggests the place should stay. The lit lines going on a re-press was already so before this diff. Fix: return early in `setFilter` when the new filter equals the current one.

3. **One frame at the old place on a period change (minor).** `listTop` runs in a `useEffect`, so the browser can draw the new period's list once at the old place before it jumps. Fix: do the box reset in a `useLayoutEffect` keyed on `periodId`.

4. **Not pinned by any test.**
   - The reset on a period change (the "+N pending in <period>" link, or a period chosen in View) has no unit test. One more case in the new test would hold it: scroll, call `selectWar`, expect 0.
   - The `min-width` rule can only be proved in a real browser. It needs a walk or e2e check at about 900 wide, with the box scrolled sideways, measuring that the headings' right edge is at or beyond the lines' right edge.

**Tidiness:** `listTop` is a hoisted inner function called from an effect with its dependencies suppressed. That is correct today but fragile if someone later turns it into a const arrow above the effect. The period effect's comment could also say that the mount run is harmless because a mount is always a fresh visit.
