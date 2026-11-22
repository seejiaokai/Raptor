# The core read (D2237) — Astra's read (copy at `7dbc13fd0`): STOPPED by its service, one finding stated before the stop

Reader: GPT-6 Astra (D1770, D2210), run by chat 124 as `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s
read-only --skip-git-repo-check` on its own exported copy of `7dbc13fd0`, brief `2026-11-20-multi-sqn-b1-core-read-brief.md`;
started 15:47:31, ended 15:53:47, exit 1 — its service stopped it ("flagged for possible cybersecurity risk"), no `-o`
report written. Under his D2232 the stop is accepted and the read goes on the reads-owed list as partial
(`[NO-ASTRA-LIST]`). Its read-only sandbox blocked the test runner, so it ran its proof in memory. What it stated before
the stop, as written:

---

> Confirmed: the commit gate accepts a squadron move that leaves the person's old View rights intact. The normal move
> command clears them, but the gate does not require that clearing. My in-memory test saved the move and showed that
> the old access would survive it, contrary to the ruling.

Its proof (signed in as `ad`): a new squadron `u777` added; `acus` given View of 149 for `bane`… then one `home.set`
command writing `bane`'s home rows directly — 142 from today, `u777` from tomorrow. Result, as it printed:
`{"ok":true,"homeTomorrow":"u777","rights":[{"account":"acus","unit":"u149","level":"view","from":"2026-11-20"}],"level149Tomorrow":"view"}`
— the command saved, and the account still holds View of 149 the day after the move (D2203: a move ends every View and
Plan). Not yet reproduced by the host.
