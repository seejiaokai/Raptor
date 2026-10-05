CHANGES REQUIRED

## 1. Findings

**F1 — Medium: final Tab loses the caret when the redraw replaces the whole day.**

**Concrete case:** On Edit Schedule’s week, arrange Flying last. Use a warning-free day whose last wave is SC, with one remaining MAIN aircraft row and a qualified crew member who is not an IR examiner. Its Remarks box is the day’s last text box, with no control after it. Type `IRT` there and press Tab.

**Result, traced through the code:** The edit saves and creates the first warning. The synchronous redraw adds the warning block, which changes the day’s structure and replaces its whole element. The subsequent focus check rejects the disconnected original day, so the caret remains on the page instead of returning to Remarks. Removing the last warning can take the same path.

**Expected:** D597 requires the caret to remain in the last box, including its replacement after a redraw.

**Cause:** [schedule-tab.ts:132](C:/Users/User/projects/Raptor/raptor-port/src/ui/schedule-tab.ts:132) calls `sameScope()` after the new synchronous redraw. That check requires the original day element to remain connected. However, [dayswap.ts:106](C:/Users/User/projects/Raptor/raptor-port/src/ui/dayswap.ts:106) deliberately replaces that element when the warning block appears or disappears. The replacement-box fallback is therefore never reached.

**Fix:** After the redraw, first verify the unchanged navigation, day, permissions, mode and window state. If only the week’s day element was replaced, reacquire that same day under the original week container and use it for the replacement-box lookup. Preserve the existing protection against taking focus from another control or window.

**Regression test:** Exercise the real mounted week with the fixture above. Assert that the first warning appears, the replacement Remarks box receives focus at its end, and only one edit is recorded. Repeat by removing the last warning; also retain the navigation and window-focus rejection cases.

This finding is established by source tracing; I did not execute it, as instructed.

## 2. Checked and sound

- **Original stale-display failure:** The redraw now precedes refocusing. This addresses the phone Board’s held panel and the week’s held Flying section when their containing scope survives.
- **Save behaviour:** The added notification introduces no direct save, history entry or validation call. Native blur remains the save path. The handler is attached to a native keyboard event, outside React rendering.
- **Focus protections:** Window, navigation, permissions, published-preview and OIL-mode checks remain. Replacement-field searches exclude hidden and noneditable boxes and stay within the selected day.
- **Blank callsigns:** “Line” is display wording only. Answers, Undo and History retain their separate identities. Two unnamed formations can share that wording, but their records and change groups are not combined.
- **Returning role button:** The new helper retains tracking, permission, context and Remarks checks. An open question suppresses its own formation’s button; only one temporary button is retained. Latest-published Remarks access remains permitted by the existing contract; older versions and member access remain rejected.
- **Changed MIX6 expectations:** They now require no question, exactly one correctly worded button, and retain the save-count, answer-context, focus and selection assertions.
- **Changed W9 ending:** It still checks each formation’s answer independently and now requires the button for the Remarks box holding the caret.
- **Dotted-ring expectations:** Both retain exact dotted style, red colour and the original fallback width. The surrounding ring-priority and no-glow assertions remain intact.

## 3. Older, not this change

None identified requiring a separate report.

## 4. What I did not check

No builds, tests, servers or browser interactions were run. I read the existing 50-step walk table and relevant script; those results are recorded evidence, not runs I witnessed. Physical keyboard behaviour, scroll preservation and React runtime errors remain unverified by this review.

Reviewed the nine-file change from `c0eff959` through `d5732266`. No other reviewer’s report was opened. I changed nothing.

Rulings: none this session.

