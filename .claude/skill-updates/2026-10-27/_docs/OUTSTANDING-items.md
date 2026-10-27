# Backlog changes this review proposes (`OUTSTANDING.md`)

Each is an addition to an item that already exists — no new item. Applied at install, on his approval. The notes named
are in `.claude/skill-observations/log.md` (or its archive, once installed).

## [SHELL-SCRIPT-GUARD] — add after "**Place:**"'s paragraph

```markdown
**Met again since it was filed (13–26 Oct 26 — observations 601, 609, 668):** about forty more times by the three notes'
own count, five of them hangs of two to five minutes on overnight runs; every time the Write or Edit tool put it
right.
**Two more refusals for the guard:** a command that begins `cat >` (or `cat >>`) with no here-document or file of its own —
it waits on input for ever and the tool moves it to the background after two minutes (609); and every script run from
the shell gets `< /dev/null`, so anything that reads input ends at once. **Conditions from the two notes about writing a
command-refusing hook (598, 626):** read the shell's real grammar before the rule — quotes and escapes per shell,
here-document and here-string bodies, comments, `$( … )`, `bash -c` / `eval`, redirects, launcher words (`timeout`,
`env`) — and judge only the word in command position (`grep vitest` is not vitest); write the everyday commands as tests
first (a commit with a here-document message, a pull request body, a grep for the tool's own name); list every situation
in which the platform fires the hook's event and refuse only in the one the rule is for, never twice on unchanged state.
The cheaper helper's find-and-replace pairs match each spot's own line endings (694).
```

## [CHECK-TOOLS-HARDEN] — add these lines to its list

```markdown
- **A reused server is proved before it is used (586, 590, 616, 630, 634, 644 — six meetings; the guide lines already
  exist and kept being missed).** The browser tests (`playwright.config.ts`, which reuses any server on its port outside
  CI) and the walk drivers' `open()` (`lib.mjs`, `trk-lib.mjs`) check that the server they reach serves THIS checkout's
  build — the hashed bundle name in the served `index.html` equals the local `dist`'s — and stop with that sentence if
  not; a walk refuses to run with no address given, and a runner passes its address on (634).
- **The walk helpers' pictures.** `pic(…, { around })` scrolls its subject into view, or refuses when the box is off the
  screen (603); a crop helper given several selectors boxes all of them (666); the Leave War walk helpers that set their
  folder with `=` take it with `||=` (705).
- **The check lock.** `gatelock.mjs` ends its child processes and releases the lock when it is itself stopped (607); and,
  while this checkout holds the lock for a run, an edit under `raptor-port/src` (or a document the document check reads)
  is refused — or the run works from a copy of the last commit — so the tree it checks cannot move under it (595, met
  twice). A gate script's `--logs` default is under the checkout or carries the session's id, never a fixed name in
  `$TEMP` (624).
- **The backlog script.** `backlog-archive.mjs <ID>` removes the item's line from the priority list with its section (or
  refuses and names it), and the document check fails on a priority-list line whose item is archived (657); its
  `--dry-run` runs the same last inventory as the real run (569).
- **The push guard.** A push from a worktree was judged by the main folder's branch on 21 Oct 26 ("this checkout is on
  main") — reproduce and fix (717); and a push of a commit that touches `raptor-port/src` warns when the last build is
  older than the last source edit, since GitHub's build then refuses what the PC never built (570, met again 25 Oct 26).
```

## [CSS-FONT-INHERIT] — add after its "**Place:**" sentence

```markdown
**A guard with it (691, 704):** a structural test over the stylesheets — no rule after a scoping wrapper's close in a
file that wraps itself (`#page-leavewar { … }`; a block appended after it lost silently, twice, 24 and 25 Oct 26), and no
`font:` shorthand naming `inherit`. A rule that only a comment states is broken again.
```
