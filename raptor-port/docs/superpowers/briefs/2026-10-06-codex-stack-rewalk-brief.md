# The RE-WALK brief — the Codex stack (D589), after the fix round — 6 Oct 26

**Read first, whole: `raptor-port/docs/superpowers/briefs/2026-10-05-codex-stack-walk-brief.md`.** Everything in it
holds here — what the app should do, the hard rules, the drivers, what to return. This page only adds what is
different about a re-walk. Your letter, your server, your share and the scripts you may start from are in the message
that gave you this brief.

## What is different

1. **The build is a NEW frozen build** (`raptor-port/dist-fix`, served for you; never rebuild, never start or stop a
   server). You are not told what changed in it, or whether anything is wrong with it. Report what the screen did.
2. **You may start from scripts written for these same scenarios on an earlier build** — the files named in your
   message (another letter's `stk-<X>-*.mjs`, read-only: COPY what you use into your own `stk2-<L>-*.mjs` and run your
   copy). They are a recipe for the selectors and the fixture, **not a verdict**: the app may rightly behave
   differently now. Never copy a result from one; never open that letter's report, table or pictures
   (`docs/handpass/parts/stk-<X>.md`, `.json`, `docs/img/handpass/2026-10-05-codex-stack/`).
3. **Your own files:** scripts `raptor-port/scripts/handpass/stk2-<L>-*.mjs`; pictures
   `raptor-port/docs/img/handpass/2026-10-06-codex-stack-fix/<L>/`; results
   `raptor-port/docs/handpass/parts/stk2-<L>.json`; your report `raptor-port/docs/handpass/parts/stk2-<L>.md`.
4. **The scenarios** are the same lists as before — `…-codex-stack-scenarios-astra.md` (`P…`, `X-…`),
   `…-scenarios-host.md` (`H-…`), `…-scenarios-leads.md` (`L-…`) — plus the additions in
   `2026-10-06-codex-stack-rewalk-additions.md` (`R-…`). Walk exactly your share, cite each by its number.

## Four rules of this re-walk (each from something that went wrong on an earlier walk)

1. **Every scenario with an EXPECTED line is judged PASS or FAIL** against that line — by what the screen showed.
   "RECORDED" is allowed only for the scenarios your message marks RECORD. A step you could only half do is PARTIAL
   with what was left; one you could not do is NOT WALKED with why. Never soften a FAIL into RECORDED.
2. **Open the picture behind every FAIL, and behind every step about OIL, a published day (its version, its
   "N pending", its sign-offs), who may do what, or anything stored across a reload — before that row counts.** Say in
   your last line how many pictures you saved and how many you opened, honestly; an unopened picture is not evidence.
3. **Report what happened, never why.** A cause you did not see on the screen is not a finding: write the exact steps,
   what was expected, what the screen showed, the picture. (One earlier walker concluded "settings are lost on reload"
   from a script that had pressed Reset first.) Before reporting a FAIL, re-run its steps once from a fresh world.
4. **Send your report ONCE** — after every script has finished and every browser is closed. Your final message is the
   same text as your `stk2-<L>.md`. Do not send it again.
