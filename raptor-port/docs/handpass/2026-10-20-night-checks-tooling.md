# Check — the night of 20 Oct 26: the Tracker smoke in two, the lock's free port, the lazy pages loaded up front

Branch `claude/checks-tooling-night`, pull request 548. His selection on /overnight ("Go 1-3"); merged on his advance word
once done and green (D1092). Checks and tooling only.

## 1. The tier
Nothing a person sees changes: the changed files are the Tracker's browser-check script, the checks file, the check lock's
script and three test files — no file the app is built from. The bug-check order's eight questions are all NO, so the tier
is **NONE** for the app; the work is checked by what it is — the checks themselves, counted.

## 2. What proves it
- **The Tracker smoke in two:** on a served build of this branch, part 1 alone 312 passed (310 + the two catch-all checks it
  now makes itself), part 2 alone 143, the whole run 453 — the 453 check names of the whole run are exactly part 1's 310
  and part 2's 143 (a sorted diff, empty). GitHub's run of the pull request: every leg green, `tracker (smoke 1/2)` and
  `(2/2)` among them.
- **The lock's port:** `src/testing/gatelock-port.test.ts` (5) — an unset port chosen free, a set free one kept, a set busy
  one refused, no free port said, a real listener seen busy. By hand: a set port already answering is refused after the
  lock is taken, the lock released, exit 1; a command that serves nothing is untouched.
- **The lazy pages loaded up front:** `trk-nocourse`, `availwin`, `lwkeepalive` 68 green with the four files run together;
  `boot-walk` left (its first-boot test turns red when the pages load first — 2 red, reverted).

## 3. The code read
One fresh, blind Opus reader (D790; no Fable — D903), read only. Its findings, each with its disposition:
- **M1 (medium)** — split, part 1's page errors and failed requests were never checked: the suite's two catch-all checks sit
  in part 2. **Fixed:** part 1 run alone makes them itself (312 checks).
- **L1 (low)** — twenty legs plus the Docs guard make 21 jobs against the free plan's 20 side by side: one leg waits a
  minute or two. **Fixed in the words** (the checks file's header, `gates-and-deploy.md`); nothing fails.
- **L2 (low)** — the lock chose the port before waiting for the lock. **Fixed:** chosen once the lock is held; a refusal
  still releases it.
Sound, by the reader: the whole run's order unchanged, no name leaking between the parts, the state part 2 inherits, the
exit paths, the checks file, the port test on Windows, the three test files.

## 4. Walk
No walk: nothing a person sees changed; the checks' own counts and runs carry it (§2).

Walk: none — tooling only; the Tracker smoke counted (312 + 143 = 453 by name), GitHub's run green.
