# Job 3 (31 Oct 26, the night) — the fresh, blind Opus read of pull request 598

Read-only. Saved as it arrived.

1. **HIGH — both scan steps of `.github/workflows/secrets-scan.yml`** ("Scan the change", "Scan the whole history"). On
   the pull request's own run (41152791405 / 41152791510, head f3590034c) the history scan found 10 leaks and the step
   went red with exit 1, never printing its "### Secrets scan: …" summary or its planned warning — so the pull request
   is red against its design (a history finding on a pull request warns only), and nobody has the fingerprints to sort
   the 10 or fill `.gitleaksignore`; a real finding in the change scan turns it red, rightly, but its summary is lost.
   Cause: GitHub runs `run:` steps as `bash -e {0}`; `set -uo pipefail` does not switch `-e` off, so gitleaks' non-zero
   exit ends the step before `status=$?`. Fix: `set +e` after `set -uo pipefail` in both steps, or
   `status=0; "$RUNNER_TEMP/gitleaks/gitleaks" … || status=$?`; re-run and read the summary.
2. **MEDIUM — the self-test does not use the real scan's settings** (`secrets-scan-selftest.mjs`): no `--log-opts`, no
   range, no binary exclusions, and it never runs the step's summary/exit code — so it passed while finding 1 was live,
   and would pass if the range or exclusions made the real scan read zero commits. Fix: scan a two-commit throwaway repo
   with the workflow's exact `--log-opts` and require a finding; fail the workflow on "0 commits scanned" over a
   non-empty range; drive the summary/exit through a script the self-test also runs, or have `--self-check` assert both
   steps carry `set +e` or `|| status=$?`.
3. **LOW — merge commits not scanned:** `git log -p` shows no change for a merge without `-m`/`--cc`, so lines added only
   in a conflict resolution are never scanned (5193 commits read, 4598 scanned, 571 of the gap merges). Fix: `--cc` or
   `-m --first-parent` in both `--log-opts`, checked that gitleaks parses it.
4. **LOW — `concurrency` shares one group across events:** a manual whole-history run on main and a push to main share
   `secrets-scan-refs/heads/main` with `cancel-in-progress: true`. Fix: add `github.event_name` to the group, or
   `cancel-in-progress: ${{ github.event_name == 'pull_request' }}`.

**Checked and sound:** `actions/checkout@11d5960a…` is v4.4.0; the gitleaks sha256 `551f6fc8…` matches the release's
checksums file and GitHub's asset digest (release 21 Mar 26); read-only permissions, no artifact; `--redact` on all three
calls, no verbose/debug; the summary prints only rule, file, line, commit and fingerprint; event values go in through
`env:`; `pull_request` only, no `pull_request_target`; no path filter; the sparse blobless checkout keeps change scans
small and the full fetch (about 50 s) runs only when the scan's own files change; no interference with `deploy.yml`;
`.gitleaksignore` comments only; `main` unprotected — documented, the ruleset his to approve.

**The run:** self-test passed (both fakes found, neither printed, clean repo passed); change scan 2 commits, nothing
found; history scan 5193 read, 4598 scanned, 196 MB in 14 s, **10 leaks found** — no list because of finding 1, no value
in the log. **Scorecard:** methods honest and stated; (c) spot-checked 62/50/60 against the script's 61/50/59, the
differences exactly #568 and #427 as the page says; the page plain.

Verdict: not ready — fix finding 1, strengthen the self-test, re-run, then sort the 10.
