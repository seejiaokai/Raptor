# The break-test brief — the one-rule job (`[ALL-AVAIL-AS-MEMBER]`) — 12 Oct 26

**What a break test is** (the checking guide, `raptor-port/docs/bug-check-order.md` §8.4): for every surface the
roll-call marks as wired, BREAK THAT WIRE ONCE ON PURPOSE and watch a NAMED test go red. If nothing goes red, that
surface has no test, by proof — and a test is written before continuing. You do this for your group of wires. You are
not reviewing the code for bugs and you fix nothing in the app.

**Where you work:** ONLY in your own git worktree (the folder you were started in — check `git rev-parse
--show-toplevel`; it must NOT be `C:/Users/User/projects/Raptor`). Other agents are reading the main checkout's source
and driving a served build right now: **never edit, build or run anything in `C:/Users/User/projects/Raptor` itself**
(the two output paths below are the only things you write there).

**Set up once:** your worktree has no installed packages. Link the main checkout's:
`cmd //c "mklink /J <your worktree, backslashes>\raptor-port\node_modules C:\Users\User\projects\Raptor\raptor-port\node_modules"`
then prove the tools run from `<your worktree>/raptor-port`: `npx vitest run src/engine/keys.test.ts` (any small file)
must pass. If the link cannot be made, stop and say so.

**The plan that says what each wire is for:** `raptor-port/docs/superpowers/plans/2026-10-11-one-rule-plan.md` §4 (the
design) and §10 (what each step built). The roll-call: `raptor-port/docs/handpass/2026-10-12-one-rule.md` §3.

## For EACH wire on your list
1. Find the line that does the thing (the list names the file and function; read it and its callers).
2. Make ONE small break that a person would notice in the app: return early, drop the branch, invert the test, read
   the old field, skip the call. Not a syntax error, not a type error (`npx tsc -b` need not pass, but the test files
   must still load) — a WRONG BEHAVIOUR.
3. Run the tests most likely to catch it — find them by grepping `src/**/*.test.ts*` for the function's name and the
   feature's words — ONE vitest command at a time, at most about eight files in it:
   `cd "<your worktree>/raptor-port" && npx vitest run <files> > <a log file> 2>&1` and read the log. Never the whole
   suite, never Playwright, never a build.
4. **Red:** record the FIRST failing test's file and full name, and how many failed. **Nothing red:** widen once (every
   test file that imports the module, up to about fifteen files). Still nothing: the wire has NO TEST — write one, in a
   NEW file beside the module (`<module>.wire.test.ts` or `.tsx`), in the style of the neighbouring tests (their boot
   helpers, the real commands and doors — never a test that only calls the function you broke with a hand-made
   object if a real door exists), that is RED with your break and GREEN without it. Copy that new file to
   `C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/1fb32070-5ddc-4f68-a0ca-107059b0daf5/scratchpad/wires-<your group>/`
   (keeping its path under `src/`), and say so in your table.
5. **Restore:** `git checkout -- <the file you broke>`; `git status --short` must show nothing but your new test
   files. Never carry a break into the next wire.

## Your report
`C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/or-wires-<your group>.md` — one row a wire:
`# | the surface / wire | the break (file, function, what you changed in a few words) | the test that went red (file › full name) | how many failed | or NO TEST — the new test file`.
Under it: anything a break showed you that looks like a real fault in the app (a break that changed nothing on any
test AND seems to change nothing at all — dead code; a test that was ALREADY red before your break) — say it, do not
chase it. Your final message: the count red / no-test, the list of new test files, and those notes.
