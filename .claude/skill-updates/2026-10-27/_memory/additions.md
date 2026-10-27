# Memory notes this review proposes (this PC's memory, outside the repo)

The memory folder is `C:\Users\User\.claude\projects\C--Users-User-projects-Raptor\memory\`; its index `MEMORY.md` gets one
line per new note. Applied at install, on his approval — the notes below are the exact text.

## NEW — `research-sources-unread-only-after-retry.md` (observation 581)

```markdown
---
name: research-sources-unread-only-after-retry
description: A source is recorded "would not open" only after its redirect is followed hop by hop and an empty page is tried in a real browser
metadata:
  type: feedback
---

The fetch tool stops at a redirect to another host (it returns the new address) and returns only a title for a page drawn
by script. On 13 Oct 26 three sources — the three most relevant, one holding the only published rule on dashes — were
recorded "NOT read" for exactly those reasons; a second read fetched each redirect's address (two hops for one) and opened
the scripted page in a real browser, and read all three in an hour.

**Why:** a source set that silently lost its best members biases the conclusion as surely as a bad source.

**How to apply:** before writing "would not open", fetch every address a redirect names, hop by hop, and open a page that
came back empty in a browser. The record says, per source, how it was read (word for word, or a tool's account — the fetch
tool answers through a small model) and, for one not read, what was tried. See also [[research-open-the-disconfirming-source]].
```
Index line: `- [Unread only after retry](research-sources-unread-only-after-retry.md) — follow redirects hop by hop and try a real browser before "would not open" (13 Oct 26).`

## NEW — `worktree-never-cd-up-before-git.md` (observation 716)

```markdown
---
name: worktree-never-cd-up-before-git
description: In a worktree chat never `cd ..` before a git command — the folder above is not a repository and git acts on the main checkout
metadata:
  type: feedback
---

On 21 Oct 26 the shell had been reset to the worktree's root; `cd .. && git switch …` landed in `.claude/worktrees/`,
which is not a repository, so git walked up to the main checkout (`C:\Users\User\projects\Raptor`) and switched IT to a
night branch. Caught by the next command ("already used by worktree at …"), put back at once, nothing lost.

**Why:** the main checkout's branch decides which settings, hooks and skills every chat loads (gates-and-deploy.md).

**How to apply:** name the repository on every state-changing git command — `git -C "<worktree path>" …` — and never
`cd ..` from a worktree's root first. See also [[one-checkout-per-session]].
```
Index line: `- [Never cd up before git](worktree-never-cd-up-before-git.md) — from a worktree's root `cd ..` reaches the main checkout; use `git -C <worktree>` (21 Oct 26).`

## ADD to `one-checkout-per-session.md` (observation 648) — one paragraph at the end

```markdown
**Two jobs in one checkout, one after another:** untracked files follow a branch switch, so `git add -A` / `git add .`
commits the other job's files into this one (20 Oct 26: the second job's before-pictures landed on the first job's
branch). Stage by named paths, and read `git show --stat HEAD` after any commit made right after a switch.
```

## ADD to `python-edits-crlf-trap.md` (observations 668, 688, 694) — one paragraph at the end

```markdown
**The shell's own counter hides a carriage return, and the Edit tool evens out a MIXED file (24 Oct 26).** In
`src/leavewar/state/store.ts` (CRLF but for a few LF lines) one Edit rewrote the LF lines as CRLF — a 16-line change
showed 117 / 101; `grep -c $'\r'` in Git Bash said 0 for both versions. After any edit of a file on Windows — the Edit
tool, a script or `sed -i` — compare `git diff --numstat` with `git diff --numstat --ignore-space-at-eol`; where they
differ, put the original bytes back and re-insert the change in the file's own endings. Count CR per line with node,
never grep; and an exact-match edit script tries its anchor with the spot's own endings (a "\n" anchor misses in a CRLF
region and reports "not found").
```
