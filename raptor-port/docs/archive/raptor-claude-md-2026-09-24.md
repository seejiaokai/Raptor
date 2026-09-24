# `raptor-port/CLAUDE.md` — passages moved out on 24 Sep 26

**Archive (tier 4): searched, never loaded.** Moved WHOLE, byte for byte, in the spring clean (D138, D140,
D141). Each passage below was superseded or absorbed by a newer ruling or document, which is named in its
heading; the rule that is live today is in `raptor-port/CLAUDE.md` or the document named. Read one only to
learn why a rule is the way it is.

## From §Build & verify — the deployed-site check, the container-only recipe, Pages publishing, the two deploy channels (7 Aug – 17 Sep 26)

**The deployed site is reachable now, and checking work against it is a
standing instruction (owner, 7 Aug 26).** The proxy used to answer 403 for
`github.io`; the owner opened it, and both the page and `githubstatus.com`
were driven end to end from the container on 7 Aug. **After every change that
ships, load the real page and look at it** — do not report a change as live
on the strength of a green workflow.

The two checks answer different questions and neither replaces the other: the
`vite preview` above is the bundle BEFORE it ships, and it is what you iterate
against; the deployed page is what the squadron actually gets, and it is the
only thing that can show a fault introduced between the build and the browser
— a stale CDN cache, a base path wrong as served, an asset that 404s only
under the `/Raptor/` sub-path. Sequence is: preview while building, gates,
merge, then the live page once Pages has rolled over.

**The next two blocks (reachability + the Chromium launch recipe) are
CONTAINER-ONLY legacy** — on the Windows desktop there is no agent proxy, and
Playwright uses its own browser via the `existsSync` fallback above. Kept for
the measured failure signatures, which are worth recognising on sight.

Reachability, and the reason if it ever closes again:

```
curl -sS -o /dev/null -w '%{http_code}\n' https://seejiaokai.github.io/Raptor/
curl -sS "$HTTPS_PROXY/__agentproxy/status"      # logs each rejected host
```

`000` means blocked again — report the blocked host, never route around it,
and fall back to the preview plus the workflow's job conclusions.

**Driving it needs three launch settings Chromium does not take from the
environment** (7 Aug 26 — a bare `chromium.launch()` fails with
`ERR_CONNECTION_RESET`, which reads like the site is down and is not):

```js
chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  chromiumSandbox: false,                              // sandbox + proxy = instant exit
  proxy: { server: process.env.HTTPS_PROXY,            // NOT inherited from the env var
           bypass: 'localhost,127.0.0.1' },            // see note below — local drives only
  args: ['--ssl-version-max=tls1.2'],                  // TLS 1.3 handshakes get reset
})
```

**When you drive the LOCAL `vite preview` (localhost:4173), add the
`bypass: 'localhost,127.0.0.1'` shown above** (2 Sep 26). Without it Chromium
routes the plain-HTTP localhost request through the agent proxy, which only
accepts HTTPS CONNECT tunnels, so the page loads the relay's "this proxy only
accepts HTTPS CONNECT" body (a 405) instead of the app — `#luser` never appears
and the drive times out looking like the app is broken. The proxy itself is
still needed for the DEPLOYED github.io page (external host); the bypass just
keeps localhost direct. Simplest alternative for a local-only drive: omit the
`proxy` key entirely.

Those three are the whole recipe — `ignoreHTTPSErrors` is NOT needed despite
the proxy re-signing TLS (measured both ways, 7 Aug 26: the CA is already in
Chromium's NSS store). Do not add it reflexively; it would mask a genuine
certificate fault later.
The reset is worth recognising on sight: it is silent at the proxy (only
Chromium's own telemetry shows up in the failure log), it hits every host and
not just this one, and it is TLS, not policy — a 403 is policy, a reset is
this. Login is `#luser` / `#lpass` / `#loginForm button[type=submit]`, same
as `e2e/app.ts`, and `#vWeek .day` is the "week is up" signal. Watch console
errors, page errors and 4xx responses on the way through; screenshot the
element in question and LOOK at it.

Push to `main` → `.github/workflows/deploy.yml` reruns the gates and
publishes to **https://seejiaokai.github.io/Raptor/**. Nothing deploys red.
Since 3 Sep 26 the gates run as PARALLEL jobs (build+parity, unit ×2 by
vitest project, geometry ×3 by Playwright project, tracker smoke) and `deploy` waits on all
of them, so merge-to-live is bounded by the slowest leg (Leave War units,
~5 min), not the sum (~17 min). Numbers and the why: HANDOFF §Deploy.

**Two deploy channels, different jobs** (owner, 15 Aug 26 — the GitHub round
trip felt like ~20 min per change and was unsustainable):

- **Vercel is the FAST per-branch preview** — `vercel.json` at the repo root
  builds `raptor-port` and every push to any branch/PR gets its own live URL
  in ~1 min, no test gate in the way. This is the channel the owner taps on
  his phone/laptop to review a change mid-session. **You cannot drive it
  yourself** — it sits behind Vercel SSO (24 Aug 26, above; this supersedes the
  older "point a browser drive at it" clause). Your drive surface is the local
  `vite preview`, which is the same bundle. It is NOT gated, so a red preview
  is still just a preview; correctness still rides the five gates below.
- **SUPERSEDED 23 Sep 26 (D59): the repo is PRIVATE, Pages is GONE, the publish job is OFF — Vercel is the only viewer (D88 said public again; D89 reversed it the same day: it stays PRIVATE and GitHub's checks run on his own PC, a self-hosted runner — `[CI-TWO-CORES]`); `[DEPLOY-DOCS]` owns rewriting the Pages-era text in this file.** Was: **GitHub Pages stays the OFFICIAL site** — the gated `deploy.yml`, published
  only on merge to `main`. Slower (the gates, then a Pages rollout that has
  ranged from 5 s to 10 min and is outside our control), so it is paid ONCE
  per session at the end, not per change — and since 2 Sep 26 only on the
  owner's explicit "merge live". The "done means live" chain still ends here.

So the loop is: iterate against the local `vite preview` (instant, what you
drive), let the owner eyeball the Vercel preview when he wants to tap it
himself, and ship to Pages once at the end. The CI gate was sped up on 15 Aug 26
and again 3 Sep 26 (now parallel jobs, ~5–6 min end to end) — the numbers, the
worker counts and the flake that set them are in HANDOFF §Deploy.
**Docs-only changes skip the gates entirely** (`paths-ignore` in deploy.yml:
`**.md` + `.claude/**` — verified nothing there reaches the bundle), so a
handoff PR has NO CHECKS to wait for. **That is an exemption from the GATES,
never from his approval: a docs-only change still merges ONLY on his explicit
"merge live"** (corrected 17 Sep 26 — the old wording said "push, merge at once,
done", which handed docs an approval exception he never granted). Push it and
tell him it is ready; merging is still his call. A PR mixing
code and docs still runs everything.

## From §How to work here — the shipping bullets (10 Aug – 2 Sep 26; their live form is `.claude/rules/shipping.md`)

- **Tell him when you are DONE, with `PushNotification`** (owner, 10 Aug 26 —
  "give me a notification so that I know when to reply"). He steps away while
  a task runs, so send one when the work is genuinely finished — gates run,
  PR merged, nothing left in flight — and when you are BLOCKED and waiting on
  his answer. One line, plainly, what happened. Do NOT notify for progress
  updates, for a quick reply he is clearly sitting there watching, or twice
  for the same piece of work.
  **"Done" MEANS LIVE, and the notification is the one at the END of that
  chain** (owner, 12 Aug 26 — "ok let me know when it's live always and do
  these steps automatically next time till it's live"). A green gate is not
  done, a merged PR is not done, and neither is worth a notification of its
  own. **Once he has said "merge live"** (the 2 Sep 26 rule below — never
  before), carry it the whole way without checking in at
  each step: gates → PR → merge when green → wait for Pages → **load the real
  page and look at the thing you changed** (the 7 Aug standing instruction,
  §Build & verify) → then ONE notification saying it is live. The only reasons
  to come back sooner are a red gate you cannot fix, a genuine question, or a
  merge he has told you to hold. Waiting is not a reason: schedule a check-in
  (`send_later`) and let it fire, rather than reporting "still building".
- **Ship ONCE PER SESSION, at the end — not once per idea** (owner, 10 Aug
  26, after a session that shipped three times). Build and verify everything
  locally as you go, then make ONE PR carrying the lot. **Since 2 Sep 26 the
  merge itself waits for his "merge live"** (§Vercel rule below): push each
  change to the branch and hand him the preview link, but never merge to main
  unprompted — the one PR stays open and accumulates until he says so.
  **Shipping is not how you test.** `npm run build && npx vite preview` is the
  same bundle that deploys, base path and all, so every check — including
  driving it in a browser and looking at it — happens before the PR. The
  deployed page only adds a DELIVERY check (a stale cache, a path wrong as
  served), which is real but rare.
  MEASURED, which is why this rule changed: each shipment costs ~3 min of CI
  plus the Pages rollout (HANDOFF §Deploy for the range and the ten-minute
  ceiling) plus the live check — about 10 minutes of
  pure waiting, three times over in one session. Batching is worth more
  again on the build side: fifteen changes in one pass ran ~6 min each, where
  a single change shipped alone took an hour and a half.
- **SUPERSEDED 2 Sep 26 — NO AUTO-MERGE. Stack changes on the branch, hand
  him the Vercel link after EACH one, and merge to main ONLY when he says
  "merge live"** (owner: "dont automatically push to live next time. Intent to
  work with multiple changes with vercel links then i will manually say merge
  live then it will go to github with all the changes made"). So the loop is
  now: change → gates green locally → commit + push to the session branch (one
  open PR accumulates the lot) → reply with the Vercel preview link the moment
  it is Ready (~1 min after the push — do NOT go quiet waiting on CI) → take the
  next change. The PR's checks finish ~6 min after each push: READ their
  conclusions on your next turn and fix a red one then — never discover it at
  "merge live" (7 Sep 26: six red runs sat unread while the branch was being
  tested on the preview, and the merge waited on a CI-only fix). The "Done MEANS LIVE" chain (merge on green → Pages → live-verify
  → one notification) runs ONLY on his explicit "merge live"; a green PR
  sitting open is the intended resting state, not a thing to finish. The 24 Aug
  rule below is kept for its mechanics (where the link is, SSO, no PR-watching);
  its "auto-merge is the default" clause no longer applies.

- **Always hand him the Vercel preview link; auto-merge WAS the default until
  2 Sep 26 (see above)** (owner, 24 Aug 26 — "always let me know once vercel
  is ready to be tested so i can test it" → "u can auto merge unless u feel
  like it is very critical and needs me to test it before merging" → "always
  give me the preview link in vercel so that i can give u immediate feedback
  and u can use it too. since its way faster than github. then in the meantime
  i can still hand u more work"). So on EVERY change, once the branch's Vercel
  preview is Ready (the `vercel[bot]` PR comment carries the `…vercel.app`
  Preview URL — it is stable per branch), send him that link. It is his fast
  feedback surface — Vercel is up in ~1–2 min where the gates plus a Pages
  rollout run 12–15 min end to end (HANDOFF §Deploy for the rollout range and
  the ten-minute ceiling).
  **SUPERSEDED 2 Sep 26 — the link never gates the merge, because NOTHING merges
  without his explicit "merge live"** (the no-auto-merge rule above). The clause
  that stood here told you to run the "Done MEANS LIVE" chain unprompted for an
  ordinary change and to stop only for a risky one. That applies to NO change
  now. It was still being followed on 9 Sep 26 and got a fix merged live without
  him (HANDOFF §Gate status) — which is why it is quoted dead rather than left
  readable. Hand him the link, then WAIT.
  While a preview or deploy cooks he will hand you more work — take it; do not
  idle waiting on a rollout. Note the preview sits behind Vercel SSO, so HE can
  open it but your headless browser cannot (it 302s to `vercel.com/sso-api`) —
  your own fast surface stays `npm run build && vite preview` driven locally,
  the same bundle Vercel serves — **so Vercel is HIS surface, never your drive
  target** (this beats the older "point a browser drive at Vercel" line below;
  newest wins). "Do NOT watch PRs" still holds (§Stable decisions has the
  mechanism and the dated reason): unsubscribe
  after opening; reading the preview URL off the PR once is not watching.

## From §Coding conventions — the HANDOFF bullet (superseded by D29 rule 3 — never trim inside a change — and by D140; its live form is the bullet that replaced it)

- **Keep `../HANDOFF.md` true in the same PR — and SHORT.** A change that
  resolves a known issue REMOVES it from the open list (its contract goes to
  the structured doc, its story to the commit message — never a "RESOLVED"
  narrative left in the file); a change that creates one adds a 1–3 line
  entry; a change that adds, removes or renames a file edits its file map.
  `HANDOFF.md` was cut from 3,882 to ~550 lines on 4 Sep 26 and is MEANT to
  stay near that (it had drifted back to 868 by 17 Sep 26 — trim it when you
  touch it) because it is
  read at the start of most sessions and every line costs every session; the
  history is frozen in `../HANDOFF-ARCHIVE.md` (search it, never append to
  it). Stale is worse than absent — the next session trusts it.
