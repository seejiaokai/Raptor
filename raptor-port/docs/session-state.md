# Session handoff — crew-rest trace, ring fixes, favicon, a live-app bug sweep, and two owner rules

Supersedes every earlier version from this session. Everything is merged; the
ONLY thing outstanding is that none of it has reached the live site, because
GitHub failed six deploy attempts in a row on four distinct faults. Detail at
the end of this file — read it BEFORE retrying, because one of the four makes
a re-run permanently useless.

## Where it started

Owner asked for two things on the warning-jump path: stop the week snapping
sideways when the clicked warning is already on screen, and mark the puck on
the PREVIOUS day whose day-end breaks the next day's crew rest. He then sent a
phone screenshot showing the sanctioned-late-show ring drawn solid instead of
dashed. A GitHub outage ate an hour in the middle. He then asked for a favicon,
for two standing rules to be remembered across sessions, and — while the outage
blocked deploys — for a sweep of the running app for bugs.

## Shipped and deployed

- **Lateral hold + the standing previous-day trace** — PR #90. `WARN.trace`
  with `traceOf`/`traceLeads`/`traceIx`/`tracesOn`; dotted ring, `CR` chip,
  `.dwtrace` cross-day row, all addressed to the NEXT day's `(di, ix)`.
- **The dashed ring was never dashed** — PR #90. `.boxdash` never cleared
  `.puck.warn.hard`'s solid shadow, so the dashes were filled in from behind.
- **The ten-minute Pages ceiling recorded** — PR #91 (a dead `timeout:` input,
  the action clamps it) then PR #92, which removed it and wrote down the
  finding. See `HANDOFF.md` §Deploy.

## Shipped, waiting only on a deploy

- **Favicon** — PR #93, merged. The talon from `Login.tsx`/`Shell.tsx` on a
  tile, killing the `/favicon.ico` 404. Never published — see the end.

## Also merged

- **PR #94 — MERGED.** Contained two owner rules in `CLAUDE.md` (live view every session; plain
  language, spelled out) plus **three bugs found by the sweep**, each with a
  browser test verified to fail against the old code:
  1. **Touching AREA / AREA TIME committed it.** Those two cells are the only
     ones whose displayed value is derived, so the model field is null while
     the cell shows text; the focusout compared against the model and called
     every blur a change. It froze the value, so the airspace window then
     stopped following the take-off. Now compared against
     `areaText()`/`atimeText()` — the functions the builder renders with.
  2. **A long callsign was clipped mid-word.** `text-overflow` does nothing on
     a flex container, so "Wrangler" read as "Wrangl". Now `display:block`
     with a fade mask, which keeps more characters than an ellipsis would.
  3. **The board's phone layout was out-specified.** `.sb-arow.c6r` (two
     classes) beat the phone override (one class) — a media query adds no
     specificity — so the ITEM column collapsed to 14px at 390px.

## Swept and found clean

View week, edit week, board and the three secondary pages, desktop and phone:
text overflow, elements escaping their panel, sideways page scroll, console and
network errors. Rules: every warning names a real person with a puck that day,
every anchor key resolves, no unsubstituted `{placeholders}`, no negative
clocks, every chip opens something, every chip letter is in the legend.
Editing: edits reach the model, are marked pending, undo restores both, and
validation re-runs.

Two known false positives, so the next sweep does not re-chase them: the phone
**topbar** legitimately scrolls sideways (`overflow-x:auto`, 861px of content
in a 390px bar) while the page does not, and the **puck name** is deliberately
clipped-and-faded.

## Open questions

- **`DT` and same-day `TT` chip a puck without ringing it**, while the
  crew-rest `TT` rings. Both are byte-identical to the reference, so this is
  inherited behaviour and NOT a port defect — deliberately left alone. It is
  still an inconsistency a reader would notice: the same `TT` glyph means
  "ringed problem" in one place and "unringed note" in another. Changing it
  means patching `refwin.ts` so parity still holds, plus an owner decision on
  whether DT should ring at all (he has already called double turning routine
  and planned, which argues for the chip-without-ring being correct for DT and
  wrong only for TT). Not started.
- **Network policy.** The owner asked for `github.io` and `githubstatus.com`
  to be allowed through the agent proxy. Both were still `connect_rejected` at
  session end; egress policy is fixed at session start, so a change only ever
  reaches a LATER session. Re-test once per session — the command is in
  `CLAUDE.md` §Build & verify.

## Branch state

- Designated branch: `claude/read-handoff-docs-3r97fl`.
  **NOT the branch named in the session instructions**
  (`claude/read-handoff-docs-o6qvqn`) — the owner's first message explicitly
  created and asked for `-3r97fl`, and every PR this session used it.
- #90, #91, #92, #93 and #94 are ALL merged. The branch was reset onto `main`
  afterwards and carries only this file's correction.
- Reset again before new work or commits stack on merged history:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-3r97fl origin/main`

## Gates

All six run first-hand from `raptor-port/` on the last code commit:

- `npm test` **616 / 38 files** · `npm run build` **clean** ·
  `node reference/tfin.js` **728 / 0** · `npm run test:e2e` **22 / 22**
- `npm run probes:adapted` **6 / 6** · `npm run perf` **9 / 0** (neither in CI)
- A fresh container needs `npm ci`; the adapted probes and perf need
  `npx vite preview --port 4173` already serving.

## The ONLY thing outstanding: the live site is behind

Everything above is merged into `main` and verified in a browser on the merged
build. **None of it has reached GitHub Pages.** The live site still serves the
build from around 15:05, which is complete and working — it is missing the
favicon and the three sweep fixes, nothing more. Nothing is half-applied.

Six consecutive deploy attempts failed on 6 Aug 26, on FOUR distinct GitHub
faults, none of them ours. Recorded so the next session recognises them rather
than re-diagnosing:

1. **Pages queue over ten minutes** — `Timeout reached, aborting!`, cancelling
   a deployment still reporting progress. The ten-minute ceiling cannot be
   raised; see `HANDOFF.md` §Deploy.
2. **`Failed to resolve action download info`** — `Service Unavailable` /
   `Bad Gateway`. The runner could not download the action definitions.
3. **`Invalid actions OIDC token ... No keys from key endpoint match`** — this
   one is a TRAP: it appears when you RE-RUN an old failed job, because the
   run's original identity token has since rotated. Re-running a stale run can
   never work. Trigger a FRESH run instead (`workflow_dispatch` on
   `deploy.yml`, ref `main`), which mints a new token.
4. **No runner assigned at all** — job cancelled after ~15 minutes with an
   empty `runner_name` and zero steps recorded. Pure capacity; nothing to fix.

Retrying was stopped deliberately after the sixth. It costs nothing to try
again and nothing is at risk either way.

## Pick up here

Merge this PR. That single action does both jobs: it corrects this file, and
the push to `main` is itself the deploy attempt that would publish the favicon
and the three fixes. Confirm from the workflow run's conclusion — the Pages
URL is not reachable from the container.

If it fails again, check which of the four faults above it is before doing
anything: a re-run is right for (1) and (4), and WRONG for (3). Once the live
site is current, nothing is outstanding and this file should be DELETED —
`CLAUDE.md` promises the next session that an absent `session-state.md` means
nothing was pending.
