# The checks job (pull request 698) — the fresh, blind Opus read (8 Nov 26, chat 27)

A fresh Opus 5.5 reader that wrote none of it and saw no other report; brief: `2026-11-08-chat19-checks-read-brief.md`;
the read of commit `52f5823f5`. Its findings as returned (the "checked and found sound" list shortened to its heads; the
full text is in chat 27's transcript).

---

1. **MEDIUM — commit / pull-request messages from a here-document refused** (the header says always let through).
   (A) `git commit --author="Jo Bloggs <jo@example.com>" -F - <<'EOF' … EOF` and `gh pr create --title="a <b> c"
   --body-file - <<'EOF'` refused as "a here-document AND a `<` redirect". Cause: `tokens()` splits any word that did not
   BEGIN quoted on `<`/`>`, so the `<` inside `--author="…<…>"` reads as a redirect; the two-inputs rule runs for every
   command. Fix: the two-inputs rule only for cat, tee, the interpreters and the shells; a `<`/`>` an operator only when
   unquoted. (B) `git commit -q -m "$(cat <<'EOF' … \d … EOF )" 2>&1 | tee commit.log` (and the `gh pr create --body`
   form `| tee pr-url.txt`) refused as "a script … writes a file and holds a backslash". Cause: piped bodies are taken by
   matching markers over the whole earlier text, so a here-document inside an earlier step's `$( … )` counts as piped into
   `tee`. Fix: piped bodies only from the earlier steps' own top-level here-documents.
2. **MEDIUM-LOW — "checks passed" fails open when the first job succeeds without writing its answer.**
   `verdict({changes:{result:'success', outputs:{}}, …gates skipped})` → ok, "notes only". Cause: anything but `'true'`
   is read as notes only. Fix: notes only only on `code === 'false'`; anything else → not ok, "the first job gave no
   answer"; a test.
3. **LOW-MEDIUM — the test that keeps the notes-only list equal to the push trigger's list never runs on GitHub.**
   `scripts/ci/checks-passed.test.mjs` is outside the unit suite's folders and no workflow runs `node --test`. Fix: a
   step `node --test raptor-port/scripts/ci/` in the Docs guard.
4. **LOW — a logged slip after `then`, `do`, `else` or `!` gets through.** `if …; then python - <<'PY' … PY fi`,
   `for f in *.md; do cat > "$f.bak"; done`, `! cat > f.txt`, `while true; do node; done` all allowed. Cause: the reader
   steps over variable settings and launcher words only. Fix: step over `then|do|else|elif|!` (and `{`).
5. **LOW — `sed -i` on a tracked file gets through when git cannot answer for the whole list.** `sed -i 's/a/b/'
   OUTSTANDING.md C:/…/Temp/x.txt` allowed (git exits 128 "outside repository", read as untracked); an absolute repo
   path from a folder outside the repo, or from an unknown folder, allowed. Fix: ask git per file, in that file's own
   folder (`git -C <dir> ls-files -- <name>`).
6. **LOW — a single-quoted inline script holding `$` or a backtick refused.** `python -c 'open("x","w").write("$y")'`.
   Cause: every inline script is marked as expanding. Fix: mark it so only when double-quoted or unquoted.
7. **LOW, UNPROVEN — the board test no longer checks how long the board's click-eating window lasts:** with
   `setTimeout` faked and never moved on, 350 ms → 1 ms still passes. Fix: `vi.advanceTimersByTime(349)` before the
   click.
8. **LOW (words) — `shipping.md` §The checks now sends "the list above" to the wrong list** (deploy.yml's, which holds
   hooks and settings, against the "only notes" list of §"Push" and "merge live"). Fix: name that list.

**Checked and found sound (heads):** both test files pass (20/20, 8/8), the board test 41/41, rulecheck and docsize OK;
the wiring passes a refusal's exit 2 through and lets bad input by; M1 and M4 re-measured; a long list of everyday
commands allowed (git, gh, npm, plain commands with Windows paths, node/python running a file); no crash, hang or
refuse-everything shape; refusal 3 holds whether the input is an open pipe or `/dev/null`; "what changed" fails closed
(errors, an empty list, quoted paths, renames, deletions); "checks passed" fails a failed, cancelled or wrongly skipped
gate and shows red on a cancelled run; nothing else in the workflow changed; the two settings copies equal and the globs
match from both folders; React Doctor's skips hide no app code; the board test still fails if the swallowing is removed.

**Tidiness (filed, not fixed):** `nativePath` copied from push-guard rather than imported; the `<`/`>` pattern written
twice in `tokens()`; a comment in `tokens()` about a digit before `>` not matching the code; docsize's comment says the
gates skip `.impeccable/**`, untrue for the `raptor-port/` copy; `python -VV` refused (trivial); once the repo is private
the two new jobs bill about 2 minutes a run — worth a line in the private-repo notes.
