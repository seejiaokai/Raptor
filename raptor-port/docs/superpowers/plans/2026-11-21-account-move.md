# Moving the project to his work Claude account, on the same PC (chat 130, 21 Nov 26)

His plan on the current Claude account stops on 9 Dec 26; he moves to a work account on this same PC, signed in as the
same Windows user. His notes stay private (his D2254); nothing personal is in this file.

## Already safe — nothing to do
- The project on GitHub: the code, the rulings, the backlog, `HANDOFF.md`, and `.claude/` (skills, hooks, agents, the
  project's settings, the skill-notes log). A new account opens the same folder and reads them.
- On this PC, outside the project, and kept when only the Claude sign-in changes: the agent's working notes and his
  instructions file (in his own Claude folder), the add-ons installed there, the Codex (Astra) sign-in, the GitHub
  command-line sign-in, the project folders and their copies (`Raptor-msq` and the others), the checks' and merges'
  lock folders, Vercel (his own account, not Claude's).
- A private backup of the notes, his instructions file and the add-on list: `C:\Users\User\Documents\Claude-move-backup-2026-11-21.zip`
  (outside the project — restore only if those folders are ever lost).
- The SWiFT build-and-deploy kit: a work document on his Desktop, kept out of the project (D1530, D2254). It does not move.

## Before 9 Dec, on the current account (a job of its own)
1. **The published pages** (about 60+ mock-up and question pages on claude.ai) belong to the current account and go when
   the plan stops. For each: find its source in the project (`raptor-port/docs/mock/…`); save any whose source is not
   there; list the ones still open for his answers, to publish again on the new account. One helper, read only, then a
   short notes commit.
2. Everything pushed: no branch with work only on this PC (`git status` and `git log @{u}..` in each project folder).

## On the new account (he does these, with the agent guiding step by step)
1. Sign in to the Claude desktop app with the work account; in the Code tab open `C:\Users\User\projects\Raptor`.
2. The agent's first chat there checks that it reads the notes and his instructions (it says so in its first reply).
3. The app's Code settings, set again: auto-archive off when a pull request merges; Remote Control on (D1195); keep
   awake while working; notifications on for his phone.
4. The add-ons: the Codex bridge (`claudex-loop`) and `hyperframes` — check they are on; if not, add them again from
   their marketplaces (listed in the backup's `known_marketplaces.json`).
5. GitHub on claude.ai (Settings → Connectors), only if cloud work is wanted.
6. What the work account allows — checked before relying on it: the models (Opus 5.5 builds, his D2244; Fable for the
   reads he calls), Remote Control from his phone, published pages, a public GitHub project. A limit there is told to
   him at once (D1551).
7. Skills that came with the current account (the staff-writing one) — added again only if he wants them.
8. The pages from step 1 above that are still open for his answers, published again; their new links put in the
   project where the old ones are named.
