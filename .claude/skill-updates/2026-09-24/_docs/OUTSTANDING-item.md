# For `OUTSTANDING.md` (observation #42) — install = append the item at the end, and the list line

**The priority list**, "Placed by their own lines — not his rulings", the docs-and-checks sentence becomes:
`The docs and the checks — [DEPLOY-DOCS] (its operational half), [DOC-POINTERS-CODE] and [RULINGS-LF-PIN] (with the next code change), [DOC-SUBHEADS] (any time, docs only), [BG-CWD-GUARD] (ask him first: it adds a hook).`

**The item** (appended after `[DOC-SUBHEADS]`):

```markdown
### [BG-CWD-GUARD] A backgrounded npm command that starts at the repo root dies at once — guard it, don't re-warn (filed 24 Sep 26)
From the skills notebook, observation #42 (1 Sep 26), which the 23 Sep and 24 Sep reviews both judged a code or
config change, not a guide change. A `run_in_background` shell starts at the REPO ROOT, where there is no
`package.json`, so a bare `npm run …` fails instantly — and the wrapper's exit code can read 0. The bold warning in
`raptor-port/CLAUDE.md` §Build & verify is text, and it has been broken three times. **The fix is structural:** a
`PreToolUse` hook (under `.claude/`, so no full check run) that refuses a backgrounded `npm` command without
`cd raptor-port`, or a root `package.json` whose scripts `cd raptor-port && npm run …` (it would start the full
checks and could change what Vercel detects). **Place:** any time, none blocking — but ask him first: a hook runs in
every chat, and it is standing configuration.
```
