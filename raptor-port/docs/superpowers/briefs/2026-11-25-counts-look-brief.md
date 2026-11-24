# Brief — the look for other counts (his D2603; the night of 25 Nov 26, job 2)

You are a helper of chat 170, on an unattended night. The owner is asleep: never message him, never ask him anything,
never merge, never open a pull request, never touch `main`. Your final reply is your report to the host (chat 170).

## Where you work

- Only in `C:\Users\User\projects\Raptor-words`, branch `claude/night-1125-bell-pages-170` (checked out, pushed).
  Never read-write, switch or build in `C:\Users\User\projects\Raptor` — another chat's work is there. Start every
  shell command with `cd "C:/Users/User/projects/Raptor-words"`.
- Scratch outside the checkout: `D:/rw4/night2/` — raw captures, dumps and logs stay there.
- Change nothing under `raptor-port/src`, no rulings file, not `HANDOFF.md`, not `OUTSTANDING.md`. This job changes
  nothing in the app: it is a look, pictures and a page.
- No build is needed: `D:/rw4/build-new3` is a frozen build whose app code equals `main` today. Do not take the checks
  lock and do not build; if you find you need a build, say so in the report instead.

## What this is

His words (24 Nov 26), after ruling that the bell's line for a changed input says every change, never "and 1 more
change": *"See what else in the app also has this existing numerical change and perhaps its better to say everything
instead."* Recorded as D2603 — read its full row, and D2600's: `grep -h -E '^\| D(2600|2603) \|' .claude/decisions-full/*.md`.

So: find every place the app gives a person a COUNT where it could SAY THE THINGS THEMSELVES, and put each to him with
a picture of the real app and a recommendation. Nothing is changed by the look; each is his call.

Read first, whole: `HANDOFF.md`'s block `<!-- now:claude/night-1125-bell-pages-170 -->`; `.claude/rules/plain-language.md`;
`.claude/rules/decisions/how-we-work.md` §Showing him, asking him; `raptor-port/docs/design-practices.md` §1b (by
section); and job 1's page and its tools, which you copy the shape of: `raptor-port/docs/mock/bell-every-change.html`,
`raptor-port/scripts/handpass/bec-page.mjs`, `bec-draw.mjs`, `wr4-lib.mjs` (a frozen build served inside the test
browser, a phone page 402×874 with touch, a desktop 1440×900).

## Step 1 — the list (read the code, then check each on the running build)

Sweep everything a person reads: the bell's lines (`state/notices.ts`), the passing notes (the notes shown after an
action — search the callers of the note function, and `leavewar/sync.ts`), Undo's and Redo's words (`undo/describe.ts`
and wherever "Undid:" is made), the change history's lines, the warning list and its heading, refusals and
confirmation questions, counts on buttons, chips and headings, the Leave War, OIL, the Tracker, Admin. Search for the
shapes a count takes: "and N more", "N more", "N people", "N items", "N inputs", "N changes", "N others", "N days",
plural helpers, `.length` inside a sentence. For each place write: where it is on screen and who sees it; when it
happens in real life (who is doing what; how often — say "a guess" where nobody measured); today's exact words with a
worked example; what decides the count (from what number up it counts — "three or more names become a count").

Then sort each into one of three:
- **A — a count standing in for things it could name** (the bell's "and 1 more change" was this). These are the
  candidates.
- **B — a count that is itself the fact, or that opens the list it counts** (an OIL balance; a button reading
  "3 pending" that opens the three). Listed, with "keep" and one line of why.
- **C — unsure**. Put as a question.

Already found by the readings review (chat 173) and handed to this look — take them, re-check each on `main`, do not
find them again: `D:/rw4/night2/handover-from-173.md` (four counts: "3 people added" in the bell; the SANS reminder's
"and N more"; the SANS posting line's "hidden" sentence; the publish note's "4 inputs have no OIL answer"). The first
is already asked on job 1's page (its question about names) — on your page point to it in one line, do not ask twice.
The SANS lines are being reworded by another chat on its own branch (pull request 825): draw them as `main` has them
today and say on the page that their wording is in another job's hands.

## Step 2 — the pictures

For every A and C: a picture of the real app showing today's words, at his iPhone's size (402×874, sharp — device
scale 2), cropped to the thing with a little around it, the place marked. Where "saying the things" would make a line
long, show it: put the fuller words into the app's own element on the screen (as job 1's draw script did, so the
letters and wrapping are the app's), count the rows on the phone, and draw the worst case the app can really make.
For B: one picture for each kind of place is enough.
A place you cannot reach on the running build in reasonable time: say so, give its words from the code and its test,
and mark it "no picture".

## Step 3 — the page (a draft; the host has its words read by a fresh reader, then publishes it)

One self-contained HTML file, `raptor-port/docs/mock/counts-look.html`, made by a script
`raptor-port/scripts/handpass/cnt-page.mjs` (pictures embedded, light and dark, tap to enlarge, readable on a phone),
in the same shape as job 1's page. At the very top: what he should look at now — each question in one line with its
recommendation and a link to its pictures. Each question: when it happens in real life; today's words (picture); what
it would read saying the things (picture where it gets long); the cost (rows on a phone; anything it pushes off
screen); a recommendation marked as a recommendation. Then the B list, short: "kept as they are unless you say
otherwise — each is the fact itself", one line each.

**His rule of this week:** never word or decide anything on your own reading of his words. "Perhaps its better to say
everything" is a lean, not an order to change each: every place is a question, and "keep the count" is a fair
recommendation where naming the things would bury the line. Group questions that one answer truly settles (the same
count made by the same rule in two places); otherwise one decision a question. Plain words only: no ruling numbers,
no file or function names, no review codes in the page's text.

## Finishing

- New files: pictures under `raptor-port/docs/img/handpass/2026-11-25-counts-look/`; scripts
  `raptor-port/scripts/handpass/cnt-*.mjs`; the page; this brief (copy it from `D:/rw4/night2/` to
  `raptor-port/docs/superpowers/briefs/2026-11-25-counts-look-brief.md`); the handover file beside it
  (`…-counts-look-handover-from-173.md`); a notes file `…-counts-look-notes.md` with the whole list (every place, its
  file and line, its sort A / B / C, its exact words, what decides the count, picture or "no picture" and why). Name
  each new file in `raptor-port/docs/file-map.md` in the same change.
- `cd raptor-port && npm run docsize` must pass before you commit. Commit on this branch (end the message with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`); read `git show --stat` before the push — no dump, log or
  build output in it; push alone in its own command: `git push origin HEAD:refs/heads/claude/night-1125-bell-pages-170`.
- Windows traps: a script with an apostrophe is written to a file and run, never a heredoc; in a JS edit script use
  `s.replace(a, () => b)`; no `jq` (use `gh -q`); from Git Bash set `MSYS_NO_PATHCONV=1` before `git show ref:path`.
- If you start anything in the background (a waiting loop, a server), stop it before your final reply and say you did.
- Save your report OUTSIDE the checkout as `D:/rw4/night2/notes-for-the-host.md` before your final reply, and make the
  final reply the same text: how many places you found in A, B and C; each A and C in one line (where, today's words,
  your recommendation); what you could not picture; the commit you pushed. About 2.5 hours. If something blocks you,
  do the rest and say what was blocked — do not stop early.
