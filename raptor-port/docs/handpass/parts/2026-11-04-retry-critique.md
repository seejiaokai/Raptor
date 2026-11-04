# Critique — the failed-download card and Retry (4 Nov 26, `claude/leave-war-small-fixes`)

Method: dual-agent (A: design review · B: detector + browser evidence), each blind to the other. Target:
`raptor-port/src/ui/pageload.tsx` (with `pagedownload.ts`, `pageclaw.ts`, `.pgfail` in `02-shell.css`), on the build served
at :4173 after commit 5315f75b1. Saved here, not in `.impeccable/critique/`, by the project's filing rule (observation 357).

## Score — 23/32 (heuristics 7 and 10 n/a): good, at the bottom of the band

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | System status | 3 | the claw speaks; a failed retry brings back an identical card |
| 2 | Real-world match | 3 | "Check your signal" names one of two causes (an update has a fine signal) |
| 3 | User control | 2 | Retry signs him out and empties Undo, unsaid |
| 4 | Consistency | 4 | the Tracker's own card, the app's claw, the save band's word |
| 5 | Error prevention | 3 | the blank app is gone; Undo is not protected |
| 6 | Recognition vs recall | 2 | after signing in again he lands on View-only Sched, not the page |
| 7 | Flexibility | n/a | one action, no expert path |
| 8 | Minimalist | 4 | two lines, one button |
| 9 | Error recovery | 2 | recovery works but costs a sign-in and finding the page again |
| 10 | Help | n/a | the line is the help |

## Detector (B)
CLI `detect.mjs` on the three files: 0 findings. In the page (the browser bundle injected): 0 findings on the card at 402 and
1440; two "text-occlusion" hits were the detector's own labels (false positives). Contrast: heading 15.0, line 5.5, button text
10.9, button edge 8.2 — all pass. Retry 59×40 (the app's button size, D487 — not a finding). Focus ring on Retry is the
browser's default, not the app's 2px cyan ring with 2px offset (`.abtn`, `.bellbtn`). After a failed Retry focus drops to the page.

## Priority issues
1. **[P1] Retry signs him out without a word and does not bring him back** — fix (a) no new look: remember the page being opened
   for this tab and reopen it right after sign-in; (b) new words (mock-up first, D1625): say that Retry reloads and asks to sign in.
2. **[P2] A failed retry looks like nothing happened; the keyboard's place is lost** — put focus back on Retry when the card
   returns; give Retry the app's own focus ring; a "Still didn't download…" line is new words (mock-up first).
3. **[P2] The claw's 0.7 s hold shows only one and a half claws** — hold one full round, about 1.3 s.
4. **[P2] The line names only the signal** — a cause-neutral line ("It didn't download. Retry to load it again.") is his D1631
   wording to change, or not.
5. **[P3] The eye jumps** — the card near the top, the claw centred (his D1610 overlay); a variant only on his word.

## Strengths
The whole app never goes blank (top bar and every other page stay); everything reused (card, claw, "Retry"); read out to a
screen reader (the card as an alert, the claw "Loading Leave War", "Still loading…" after 8 s).

## Personas
Member on a phone, weak signal: types his password, then the menu and the page again. Scheduler at a desktop: Undo gone, lands
on View-only Sched, 9 Tabs to Retry. Keyboard / screen reader: focus lost after a failed retry; the sign-in says nothing of why.

## Not checked
iPhone Safari's "Leave site?" box on a reload (it may not show there); whether the reload takes the main files from the cache;
the iPhone keychain filling the password. Evidence: `scratchpad/critA/`, `scratchpad/critB/` (not kept), the re-walk pictures
`docs/img/handpass/2026-11-04-lw-small-fixes-rewalk-2/`.
