# Section 1 (the guard rail) — the code check's two findings in `ui/UsersPanel.tsx` (chat 204, 26 Nov 26)

**A small step of its own, before K4. No behaviour changes.** GitHub's code check (React Doctor, `npm run
lint:changed`) is red on the batch's pull request with three findings in `raptor-port/src/ui/UsersPanel.tsx`. One is
the Admin → Users section's (chat 205 — `PersonEditor`); **two are this section's and are this step:**

1. **`UsersPanel` (about l.563), "React function has high control-flow complexity".** This section's share: the
   `useGuardWork('addperson', …)` line (about l.620) carries a four-part "differs" test inside the component. Move the
   test into a plain function above the component (beside `useUsersFilter`, with the comment that explains it moved
   with it — the comment says WHY the post-in date is compared with `postIn0`), and call it from the line. Nothing
   else of the component is restructured: chat 205 added to this function too and fixes its own share when its work
   merges, so **this finding may stay reported after your change — say whether it does.**
2. **The `openNew` effect (about l.603), `react-doctor/no-adjust-state-on-prop-change` — "State adjusted after a prop
   changes".** `useEffect(() => { if (p.openNew) { wantFocus.current = p.openNew; setAdding(true) } }, [p.openNew])`.
   Give it React's approved shape: the form is set open **while drawing** when `p.openNew` is a non-zero value not yet
   seen (a small "last seen" state compared during the render), and the focus request stays in an effect (a ref is not
   written during a render). The behaviour must be exactly today's: a non-zero, changing `openNew` opens the form and
   asks for the callsign box's focus after the render that drew it (never on a phone); a form folded by Cancel does not
   reopen until `openNew` changes again; a first draw with `openNew` already non-zero opens it. The opener button's own
   press (`wantFocus.current = -1; setAdding(true)`) is untouched.

## Hard limits

- **Touch only these lines of `UsersPanel.tsx`:** the `openNew` effect, the `addperson` line and its comment, and the
  new plain function. **Do NOT edit** `PersonEditor`, `ArchivedEditor`, `PersonRow`, the `'userrow'` or `'archrow'`
  lines, `useRingLanding`, or anything that reads or sets `editing` — chat 205 is rebuilding those in the same file. If
  the `openNew` change cannot be made without touching `editing`, STOP and report; do not make it.
- A finding is fixed, or kept with its reason in a disable comment on the line above it — never by changing
  `doctor.config.json`. Prefer the fix.
- No other file under `raptor-port/src` changes, except a test if one must be added (see below). Never weaken a test.
- Do not commit, push, or edit `HANDOFF.md`. Do not open source files you do not need: opening a file under
  `raptor-port/src` with the Read tool loads large rule pages — read by shell `sed -n` / `grep` where you can.

## Checks — in this order

1. **Before any change:** from `raptor-port/`, `npm run lint:changed > .tmp/lintfix-before.txt 2>&1; echo $?` (write
   to the file, keep the exit code, read the file). Say its count and whether it names the two findings. If it says it
   could not compare (exit 2), say so exactly and carry on — GitHub's run is then the judge.
2. **G5 pins the `openNew` behaviour** (`src/ui/msq-guard-g.test.tsx`, "G5 — Quals' "+ Add person" lands on Admin →
   Users with the form open"). Read it. If it does not pin "a form folded by Cancel does not reopen until `openNew`
   changes again" or "the callsign box has the focus after it opens", add that case there first and see it PASS on
   today's code (it pins behaviour that must not change), then keep it passing.
3. Make the two changes.
4. **After:** `npx vitest run src/ui/msq-guard-g.test.tsx src/ui/msq-users-row.test.tsx src/ui/msq-users-filter.test.tsx
   src/ui/onedoor-users.test.tsx src/ui/admin.test.tsx src/ui/msq-guard-rollcall.test.ts > .tmp/lintfix-tests.txt 2>&1`
   and, for the form's report, `npx vitest run src/ui/msq-guard-open.test.tsx -t "Add a person" > .tmp/lintfix-open.txt
   2>&1` (the whole file takes about 14 minutes — the filter keeps it short; say how many ran). Named vitest files
   need no checks lock.
5. `npm run lint:changed > .tmp/lintfix-after.txt 2>&1` again: say the count and which findings are left.
6. `npm run build` needs the checks lock: `node scripts/gatelock.mjs status`; free → `take "claude/msq-s1-guard-6ae5e1
   — code-check fix build"`, build, release at once; held → report NOT RUN, never wait in a loop, never build alongside.

## Report → `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-lintfix-report.md`

The lines changed (as a short diff summary), each check's result with its numbers, the code check's count before and
after and which findings remain, anything you could not do and why. End your reply with the report's path and one
line: are the two findings gone.
