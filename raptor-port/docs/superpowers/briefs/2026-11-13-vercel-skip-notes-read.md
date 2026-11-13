# Read brief — Vercel's skip-the-build check ([VERCEL-SKIP-NOTES], his D2032), 13 Nov 26 (chat 71)

**You are one of two readers, blind to each other. Read-only: change no file.**

## What was built
Branch `claude/vercel-skip-notes`. Files: `vercel.json` (the new `ignoreCommand`), `raptor-port/scripts/vercel-ignore.mjs`,
`raptor-port/scripts/vercel-ignore.test.mjs`, the Docs guard step in `.github/workflows/docs-guard.yml`.

His ruling (D2032): Vercel is to skip the build when a push changes only notes; a push that changes the app still builds
its preview, and a merge its live app. "Only notes" follows the shipping rule's list (`.claude/rules/shipping.md`
§"Push" and "merge live", the "Only notes" bullet) as far as file names can tell it.

Vercel's own documented behaviour (read 13 Nov 26): the command runs from the project's root directory before the
build; exit 1 builds, exit 0 cancels the deployment. `VERCEL_GIT_PREVIOUS_SHA` = "the git SHA of the last successful
deployment for the project and branch", empty on a branch's first deployment, exposed only when an Ignored Build Step is
set. Vercel clones with `--depth=10`. Production deployments come from `main`.

## What to look for — what is MISSING, not style
The one harm that matters: **a push that changes what the built app contains is skipped**, so a preview or the LIVE app
stays on an old version. Second: a notes-only push that builds anyway (costs money, harmless otherwise). Look for:
- any input the build reads (`npm ci` + `vite build` in `raptor-port`) that the list counts as a note;
- any way the changed-file list comes out incomplete or empty-but-treated-as-notes (shallow clone, renames, merges,
  force-pushes, odd file names, a base that is not an ancestor, a production merge to `main`, a PR from a fork);
- any path where an error exits 0;
- whether `VERCEL_GIT_PREVIOUS_SHA` as documented can point somewhere that makes the diff miss an app change;
- gaps in the tests.

**Not a finding:** wording, style, naming; anything only about data already stored. A claim counts only with a
concrete failure (the push, the files, what Vercel would do), its cause and its fix — give exact fix steps.
