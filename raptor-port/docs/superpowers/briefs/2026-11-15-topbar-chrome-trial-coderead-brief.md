You are a blind code reader for one finished job in the TALON app's repo (the app is in raptor-port/). Read-only: change no file. Another reader reads the same code; you have not seen their read and they have not seen yours.

The job: branch `claude/topbar-chrome-trial`, the diff `git diff origin/main...HEAD` (commit 7673d6374 holds the code). It adds a TRIAL switch, `?barprobe` on the app's address: in a tab opened with it, a small readings panel (bottom right, no presses) shows every frame, while anything moves, numbers about the top bar's place against the visible screen — so the owner can try it in Chrome on his iPhone, where the top bar comes loose for a few frames on short pages that spring at their foot. His ruling D2025: a trial first, nothing in the app changing; no cure is built. Without the switch nothing must be drawn, no listener added, no frame asked for.

Read: `raptor-port/src/ui/barprobe.ts`, `raptor-port/src/ui/barprobe.test.ts`, the change in `raptor-port/src/main.tsx`, and for comparison how `?savefail` (`raptor-port/src/storage/boot.ts`), `?swdebug` (`raptor-port/src/ui/swdebug.ts`) and `?kbdebug` (`raptor-port/src/ui/kbscroll.ts`) are read. The cause report it serves: `raptor-port/docs/superpowers/specs/2026-11-15-topbar-chrome-trial.md`.

Ask what is MISSING or WRONG, each with a concrete failure, its cause and the exact fix (a claim without all three is not a finding):
1. Can anything reach a person, or cost anything, WITHOUT the switch (a listener, a frame, a style, an element, a different boot order)?
2. With the switch: does each reading measure what its label says, on an iPhone in Chrome and Safari — above all `bar` (the top bar's top against the visible top), `past` (sprung past an end; does a spring show as a negative scroll or a scroll past the foot in WebKit?), `vis @top`, `row`? Would any reading read 0 while the bar is visibly loose, or non-zero while it is in place — so the trial would mislead? Is the selector for the top bar and the pinned row right on every page named in the report?
3. Does the panel cover or take a press from anything he needs, on a phone at 402×874?
4. Does it stop asking for frames when nothing moves; is the worst value cleared and kept as the report says?
5. Are the tests real (would they fail if the code broke)?
Not findings: anything in data already stored (D56); style preferences; a cure for the top bar itself (not this job).

End with a list of findings, most severe first, or "No findings", and a three-question tidiness note on the changed lines (is anything unneeded, duplicated, or hard to read) — filed, not fixed.
