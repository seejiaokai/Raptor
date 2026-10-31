# The scorecard and the secrets scan — [REVIEW-LAYERS] steps 1 and 4 (31 Oct 26)

The night of 31 Oct 26, job 3. Branch `claude/secrets-scan-scorecard`, cut from `main` after pull request 594. **Nothing
in the app changed** (no file under `raptor-port/src`). His rulings D1409 (the scorecard) and D1408 (the secrets scan).
`Walk: not needed — no change a person can see in the app; the proofs are the runs below.`

## The tier (the bug-check order §5)

| Question | Answer, and why |
|---|---|
| 1 Money (OIL included) | No — no app code. |
| 2 The published record | No — no app code. |
| 3 Saved data | No — nothing the app stores; the scorecard writes nothing, the scan reads only git. |
| 4 A shared drawer | No — nothing drawn. |
| 5 A new gesture or mode | No — nothing on screen. |
| 6 A new surface | No — the scorecard is a document page, not a screen of the app. |
| 7 Roles | No — the workflow asks only to read the code; no repository setting was changed. |
| 8 The warning list | No. |

**Tier: NONE for the app.** What a wrong build costs here is in the checks themselves (a scan that misses a key, or prints
one into a public log), so each carries its own proof below, run red as well as green.

## (1) The scorecard (D1409)

- `node raptor-port/scripts/scorecard.mjs --end 2026-10-31 --list` on `origin/main` at 36827f127 — the numbers on
  `raptor-port/docs/superpowers/plans/2026-10-31-scorecard-1.md`: 18–31 Oct **17** finds (3 more on a preview), **1**
  redone, **61** merges; 4–17 Oct 5, 0, 50; 20 Sep–3 Oct 0 (unrecorded), 0, 59.
- **Merges checked against GitHub's own list** (`gh pr list --state merged --base main`, dated in +08:00): 62 / 50 / 60
  there against 61 / 50 / 59 here — the two apart are #568 (merged into #569's branch) and #427 (its commit reached main
  another way). The first version read only "Merge pull request" commits and gave 43 for late September; the merges made
  on his PC ("Merge PR #N:") and the squashes ("(#N)") were added after this check.
- **The redo rule was tried three ways and narrowed twice, each on the item list:** naming an earlier pull request
  anywhere in the pull request's commits counted 8 / 11 / 14 — nearly all records commits ("pull request 585 recorded as
  live"); naming it by its backlog id counted phase 7 of a long item as a redo of phase 6; a bare "#409" was a skill
  observation's number. The rule kept: one commit that changes the app, says it fixes, and names the earlier pull
  request by "pull request N" / "PR N". The one it counts (#552 → #547) was read by hand: a real fault, live since #547.
- **The revert rule** finds none in the six weeks; run over 21 Aug – 14 Sep 26 it read the two reverts of 1 Sep 26 and
  rightly left both out (each undid a commit of its own pull request, never live).
- **The finds rule**, read by hand on its list: a heading where the WALK found a fault while fixing his
  ([LW-APPR-PERIOD-LANDING]) was being counted as his — now left out; a heading's later story ("waiting for his look")
  was marking finds as previews — now only the clause that names the find is read; two lessons with no date of their own
  ("the same look") were dropped — now they take the lesson before's.

## (4) The secrets scan (D1408)

- **The scanner:** gitleaks 8.30.1 (released 21 Mar 26), MIT licence — free for a personal public repository; the program
  is downloaded on GitHub's machine from its release and checked against the release's published checksum
  (`551f6fc8…f2470eb`, read 31 Oct 26 from both GitHub's record of the file and the release's checksums file). The checkout
  action is pinned by commit (`actions/checkout` v4.4.0, 11d5960a…). Nothing was downloaded to his PC.
- **The self-test on his PC** — `cd raptor-port && node scripts/secrets-scan-selftest.mjs --self-check`: PASS, four of four
  — the workflow keeps its promises; a well-behaved stand-in scanner is accepted; one that prints the fake secret and keeps
  it in its report is caught (both fakes, both places); one that never fails is caught.
- **The self-check catches a broken workflow:** `--redact` taken off the change scan → FAIL, naming that run; a path
  filter added → FAIL. Both put back (the file compared byte for byte after).
- **The fakes meet gitleaks' real rules:** its v8.30.1 default rules (read from its source) applied in Node to the planted
  file find the password line by `generic-api-key` (entropy 4.58 against 3.5, none of its 1,453 stopwords) and the key
  block by `private-key`; the same two rules find nothing in any file this branch adds. This is a stand-in for gitleaks,
  not gitleaks — the real proof is the self-test's first run on GitHub (owed, below).
- **git takes the picture-skipping read:** five commits of `main` read with the workflow's list of left-out types — 270
  files read, 0 pictures (453 pictures without it).
- **The one download of the whole history** (`git fetch --refetch --filter=blob:limit=1g`) tried on a small blobless
  clone: 6 missing files before, 0 after. `blob:limit=4g` is refused by git — 1g is used.
- **A forecast of the history scan**, gitleaks' generic rule applied in Node to today's files: nine possible findings,
  all the app's own random record ids or picture names in walk logs — not secrets. The history will hold more of the same.
  So a history finding met on a pull request is a warning, not a red check (the workflow's head says why); a finding in
  the change is red.
- **Read only, nothing changed:** `gh api repos/seejiaokai/Raptor` — public; secret scanning, push protection, their two
  extras and Dependabot's security updates all disabled. `…/branches/main` — not protected; `…/rulesets` — none. The two
  settings steps are his to approve: `OUTSTANDING.md` `[REVIEW-LAYERS]`.

## Fix round 1 — the fresh read (`parts/secrets1031/read-opus.md`) and the first GitHub run (pull request 598)

The first run: self-test PASS with the real gitleaks; change scan 2 commits, nothing found; history 5,193 commits read,
4,598 scanned, **10 found** — and the step went red with no summary, so nobody has their fingerprints.

1. **HIGH — fixed.** GitHub runs a `run:` step as `bash -e`; gitleaks' exit 1 ended it before `status=$?`, the summary
   and the warning. Now every scan is one command, `raptor-port/scripts/secrets-scan.mjs change|history`, which runs
   gitleaks (no shell), prints the summary and decides red or green itself; no shell step runs gitleaks any more, and
   `--self-check` fails if one does. Shown on his PC: the runner started from `bash -e -c` with a scanner that fails
   still printed its summary, then exited 1.
2. **MEDIUM — fixed.** The self-test now imports and runs that same `scan()`: the same arguments, the same `--log-opts`
   (a range, the binary files left out, the landed pass), the same summary and decision, over throwaway repositories with
   two and three commits and a merge. A scan is red by itself on "read nothing" — 0 commits scanned where git shows
   added lines in the same read (`--self-check`: a stand-in that reads nothing is caught, and turns a clean range red).
3. **LOW — fixed.** Merges: `--cc` is out, because gitleaks' diff reader (go-gitdiff 0.9.1, read at its source) reads
   only `diff --git` headers and a combined diff has `diff --cc`; so a second pass, `-m --first-parent --merges`, reads
   each merge against its first parent (go-gitdiff takes the commit id up to the first space, so `commit X (from Y)`
   parses). On a pull request it reads the merge GitHub tests (base..GITHUB_SHA — the pull request's net change); on a
   push, main's pushed line; in the history, main's merges. A history finding the second pass repeats is listed again,
   marked "as landed". The self-test's merge case: a fake only a conflict resolution adds is missed by the commits pass
   and found by the landed pass (real git, stand-in scanner on his PC; the real gitleaks on GitHub).
4. **LOW — fixed.** The concurrency group carries the event, so a manual run and a push to main cannot cancel each other.

**Local proof, after the fixes:** `node scripts/secrets-scan-selftest.mjs --self-check` — 6 of 6 PASS (the workflow's
promises; good accepted; leaky, lax and blind caught; read-nothing red by itself). `npm run docsize` OK.

**The 10 history findings will be sorted after the next run**, once its summary lists them (rule, file, line, commit,
fingerprint): each judged on his PC, never in a log, as `raptor-port/docs/gates-and-deploy.md` §Now (D1408) says.

## The history's findings, sorted (the run on 97263675a, 31 Oct 26)

That run was green: the self-test found both fakes, the change scan was clean, and the history listed **20 findings —
10 lines, each found twice** (as committed, and again as landed on main by its merge; 4,601 commits scanned, and 439
merges). Each line was opened on his PC (`git show <commit>:<file>`), read with every long run of letters masked to its
shape, and judged. No value is written here or anywhere else.

| File | Rule | What it is | Verdict |
|---|---|---|---|
| `docs/img/handpass/2026-10-25-lw-night/w1/w1-a-desk.json` line 58 | generic-api-key | a picture's file name (its "…arrowkey" read as a key name) | not a secret |
| `docs/handpass/parts/lw-night/w1.md` line 26 | generic-api-key | a walk table row naming two pictures | not a secret |
| `docs/handpass/parts/b2-host-walk.txt` line 29 | generic-api-key | a walk log's `"key"`: the app's own input record id | not a secret |
| `docs/handpass/parts/dbrA-W4-oldread.json` line 1 | generic-api-key | a walk's stored state: the app's own input record ids | not a secret |
| `docs/handpass/parts/dbrA-W4-newkeys.json` line 1 | generic-api-key | a walk's list of the app's own new record ids | not a secret |
| `docs/handpass/2026-10-04-schedule-tab-evidence-r2-index.json` line 3441 | square-access-token | an evidence index's `"sha256"` field — 64 capital hex characters, one of its 913 file checksums | not a secret |
| `docs/img/handpass/2026-10-04-phone-desktop-board/adapted.log` line 88 | generic-api-key | a gate log's traffic line: `tr:` text key and the app's own row id | not a secret |
| `docs/handpass/css-split/gates/gate-adapted.log` line 88 | generic-api-key | the same kind of gate log line | not a secret |
| `docs/handpass/insights-gates/baseline-audit.log` line 29 | generic-api-key | the same kind of gate log line | not a secret |
| `docs/handpass/insights-gates/adapted-freeze-1.log` line 61 | generic-api-key | the same kind of gate log line | not a secret |

**Real credentials found: none.** All 20 fingerprints (each line's commit and merge) went into `.gitleaksignore`, grouped
by kind, marked "judged by the agent, 31 Oct 26 — he may check any". Commit-bound fingerprints were chosen, not
file-and-line ones, so a key later written on the same line of the same file is still caught. Changing that file makes
the next run scan the whole history again; it should list nothing.

## Owed

- **The next GitHub run** of the check: the self-test with the real gitleaks (it must print "found, as it should" twice
  and PASS — now including the merge case), the change scan green, the history summary listing its findings, and the
  sort of each. Its time is to be written into the workflow's timeout comment.
- **A narrow read of fix round 1** (the bug-check order §5, "a fix is new code").
