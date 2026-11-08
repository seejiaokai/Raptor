# The review of 8 Nov 26's merged work — one brief, two blind readers (D1933)

**Who reads:** Fable 5.1 (chat 37, the host) and Astra (Codex), each blind to the other — neither opens the other's
report. Read-only: change no file, commit nothing. Astra's whole report is its final message; the host saves it as
`raptor-port/docs/superpowers/briefs/2026-11-08-review-8nov-jobs-astra.md`. Fable's goes to `…-fable.md`.

## Why

On 8 Nov 26 (the owner's day, 7 Nov 16:00 UTC to 8 Nov 16:00 UTC) Opus 5.5 ran many chats on this project at once and
merged about forty pull requests into `main`: app changes and "rules diet" steps that rewrote the rulings files into
pages. That evening the owner found the rewritten pages had come out about twice their old size and said: "I now have
low confidence on what opus 5.5 did to my code base." His ruling (D1933): Fable and Astra review the day's merged pull
requests, blind to each other, for faults and for whether the work fell short of what was asked; the host reproduces
every finding before it counts (D790); nothing is changed on a reviewer's word — each finding goes to him with its
consequence and its fix, and he decides. A separate chat is already fixing the pages' SIZE: do not review size.

## What to read

The repo is the checkout you are started in; `main` is checked out (`git log -1` to confirm). Every pull request below
is merged into it. For each, the diff is `git diff <base> <head> -- raptor-port/src raptor-port/e2e raptor-port/scripts .github`
(skip the picture folders and `raptor-port/docs/handpass/`); the description is `gh pr view <n> --json title,body`
(if `gh` is not available to you, the merge commit message and the `HANDOFF.md` block at `<head>` say what was asked:
`git show <head>:HANDOFF.md`).

### App pull requests (code)

| PR | What it says it did | base | head |
|---|---|---|---|
| 664 | The board and windows by the keys: two narrow-screen menus, the week glide | 4dfabb63d | 1264dc677 |
| 667 | React Doctor on the shell, the state and the windows: 106 → 13, "nothing seen changes" | b67d658fa | 68f0f221a |
| 669 | Insights' two edges pinned, one shared wording body | bc3c43bce | 6879bfe3a |
| 670 | A time limit on every GitHub test job | 3a44fdb5f | b6c098d43 |
| 676 | Inputs — + Input at the right, the list making room, the calendar's drawn marks (D1787, D1792 b) | e865e8ad3 | d0334d539 |
| 678 | Where a day with nothing entered starts (D1786) — the rules engine | 4e517e948 | a6356b2b9 |
| 679 | OIL Earn on the board: the day switch, the tap that says why, the phone bar's marks (D1782, D1783, D1793) | cd8a5dd67 | 984c28588 |
| 680 | Leave War: the day window's grey foot (D1788) and the pinned dates row in the same frame (D1789) | 4d5b3828a | d87d40766 |
| 687 | Tracker: the marking window slides its event up, Find's ✕ on a phone, Restore's arrow (D1790, D1791, D1792 c) | dec261e0b | a4d23f2fa |
| 689 | The board's layout: sideways phone, 821–1099 wide, keyboard rings (D1780, D1781, D1771) | bf09f369b | 861f3e6c3 |
| 691 | The schedule's marks and words: the waiting mark on Unavailable, the unreadable week's words, the drawn eye and arrow (D1784, D1785, D1792 a, d) — touches `src/engine/publish.ts`, `quarantine.ts` | 99ecc114d | 015000f0b |
| 696 | Tracker small batch: typed marks out of two messages (D1860); kept copies of the app's icons and colours merged | 0abda89d5 | f7ef9af9d |
| 698 | The script guard hook, React Doctor's skips, the design checker's settings, the "checks passed" job (now the required check on `main`) | e7fb20aad | a3bb57b3e |
| 702 | React Doctor's last findings in People & accounts (parts 1 and 2) — the save layer's wiring | b6f2e7caf | 7dd5dd730 |
| 706 | The Not kept band (D1901) and the Tracker's magnifier (D1900) — storage boot | ee8323438 | ed6282e0b |
| 707 | Inputs and Medical small fixes — the Medical room for a dragged window, the room's one size, React Doctor's 8 | aee0de3f2 | 5d2de831b |

### Rules-diet pull requests (rulings rewritten into pages — MEANING only, never size)

| PR | Page | base | merge |
|---|---|---|---|
| 663 | `.claude/rules/decisions/how-we-work.md` (the general rulings, every chat) | 9b42a96b6 | 7744e66db |
| 665 | the five always-loaded rule files as checklists: `.claude/rules/{bug-check,doc-structure,plain-language,record-decisions,shipping}.md`; old text moved to `raptor-port/docs/archive/rule-files-2026-11-08.md` | 7744e66db | 4fbf85a49 |
| 684 | `.claude/rules/decisions/oil.md` (OIL — earned leave, time off banked, never money) | 0bbb1c686 | db0c6640b |
| 690 | `.claude/rules/decisions/it-flow-guide.md` | 47adcc39f | f9267b2fe |
| 700 | `.claude/rules/decisions/people-accounts.md` (sign-in, permissions, who sees what) | 0568264be | dd2b7c234 |
| 708 | `.claude/rules/decisions/design.md` (the screen-design rulings) | 8d2804fcd | 535fdc94f |
| 714 | `.claude/rules/decisions/tracker.md` | 4db6473e8 | 6d572292c |

The OLD text of a page: `git show <base>:<path>`; the NEW: `git show <merge>:<path>`. The ground truth of any ruling is
its full row: `grep -h '^| D<n> |' .claude/decisions-full/*.md` (long rows). Retired rulings: `DECISIONS-ARCHIVE.md`.

## The questions

For each APP pull request:
1. What was asked (its description, the ruling's full row, the backlog item) against what was built — DELIVERED /
   PARTLY / NOT AS ASKED, and anything claimed as built or tested that is not in the diff.
2. Faults a user would meet: wrong behaviour, a regression in a neighbouring path, state never cleared, a handler that
   fires twice, a boundary off by one, a CSS rule leaking to another screen, a phone-width break, a stale closure, an
   undo that no longer matches, any effect on a published record or on OIL.
3. A rule of the area bent — compare the build with the ruling's full row, not with the pull request's summary.
4. Tests weakened or made to pass: an assertion removed or loosened, `skip`/`only` added, an expected value changed to
   match new output with no ruling asking for it, a timeout widened, a test deleted, a new test that cannot fail.
5. A document trimmed by a code change (D29): a `.md` file with net deletions inside a pull request that changes
   `raptor-port/src` (`git diff --numstat <base> <head> -- '*.md'`); a move-whole with a pointer is fine, a cut is not.
6. The rules engine (`raptor-port/src/engine/`) is a verbatim port of the original under `reference/` (read-only): a
   change there must be only the behaviour the ruling asked for (D1537).

For each RULES-DIET pull request: sample at least ten rulings per page (more where the page is large), spread across
its sections, preferring rulings with conditions, exceptions, numbers, "never" or "only". For each, the OLD line, the
NEW statement, the FULL ROW, and a verdict: SAME / NARROWED / WIDENED / CONDITION DROPPED / BENT (says what the row
does not) / NOT STATED. Also: every D-number cited in the OLD file and absent from the NEW must be in
`DECISIONS-ARCHIVE.md` as replaced or restated in full by the ruling the archive names (a ruling a later one only
narrows stays live — D971); any other absence is a dropped rule. For 665, inventory the old text's rules and mark each
PRESENT / WEAKENED / DROPPED in the new checklist.

## What is NOT a finding

- A problem that lives only in data already stored, when the code is correct going forward: the whole store is demo
  data and is cleared before the database step (D56 — both parts must hold; "pre-existing" alone is not this).
- A scheduler who is not an admin: every scheduler is an admin, nothing is built or tested for one who is not (D785).
  A member, a guest and a person with no sign-in stay in scope as people who are not schedulers.
- Size of a document or page (another chat's job). Style.
- A claim is a finding only with a concrete failure, its cause and its exact fix (D489).

## Your report

Markdown, in your final message. Per pull request: the verdict line, then findings numbered A1…, each with the pull
request, the file and line, the concrete failure (inputs → wrong result, or old words → new words → row's words), its
consequence for the owner in plain words, its cause, its exact fix, a grade HIGH (wrong record, wrong OIL, lost data,
wrong permission, a crash, a visible fault on a main screen, a rule a chat would act on wrongly) / MEDIUM / LOW, and how
you verified it. Then "Checked and found sound:" — what you specifically checked that held. Then your honest answer to
his question: did the day's work damage the project, yes or no, and why. The repo is public: never write a student's
name, mark or date. Where you could not check something, say so rather than guess.
