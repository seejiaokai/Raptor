# The every-chat rules' tightening (D2460) — the measure, the two blind reads and what was done with each finding

Chat 158, 24 Nov 26, branch `claude/rules-tighten-158`. The brief: `2026-11-24-rules-tighten-read-brief.md`; the
reports: `…-read-astra.md` (GPT-6 Astra, an exported copy of `c3b956832`) and `…-read-opus.md` (a fresh Opus reader,
the same copy), each blind to the other.

## The measure (`node raptor-port/scripts/docsize.mjs --reads`, ±10%)

| | Before (`main`, 24 Nov 26) | After |
|---|---|---|
| What every chat loads at its start | 36,977 tokens | 31,686 tokens (−14%) |
| `.claude/rules/shipping.md` | 17,402 bytes | 9,464 |
| `.claude/rules/decisions/how-we-work.md` | 41,231 bytes | about 36,200 |
| `.claude/rules/bug-check.md` | 6,007 bytes (6,463 after pull request 830) | about 4,900 |
| `HANDOFF.md` (read at a chat's start, not loaded by itself) | 40,393 bytes | 12,237 before this chat's own block |

## What moved whole, and what was written

- Moved byte for byte: the shipping rules' whole body → `raptor-port/docs/shipping-steps.md`; 29 lines of the general
  page → `raptor-port/docs/how-we-work-when-needed.md` (10 the rules diet, 11 the platform and the database, 5
  overnight runs, 3 compaction — the React Doctor line went back to the page on Astra's finding 2).
  `docsize.mjs --moves` lists none of them as lost.
- Written, and so read for meaning: the shipping short form; seven statements on the general page; the two merged
  readers' lines; the bug-check rule's and the where-things-go rule's pointers; one clause of `DECISIONS.md`.

## The findings — every one reproduced against the full wording before it was taken

| Finding | Reader | Done |
|---|---|---|
| The "done" chain lost "a Production deployment whose commit holds the merge" and named no moment to open the steps | Astra 1 (high) | Fixed: the line names the deployment and says to open the steps |
| A notes-only merge starts no Vercel build, yet the chain waited for READY | Opus M4, Astra 6 | Fixed in the short form and in the steps: confirm the skip, report the notes merged |
| "A notes-only push builds nothing" is too absolute — a first deployment or an uncertain comparison builds | Astra 6 | Fixed in all three places (checked against `vercel-ignore.mjs`) |
| The checks lock asked for on any build | Opus M1, Astra 5 | Fixed: taken for the four heavy runs; anything else that builds waits until it is free |
| "Answer the same when asked" and "repeat what you promised in your handoff block" lost | Opus M2, Astra 3 | Fixed: both back, with the pointer to the steps |
| "Never a rule file" shut the rulings files out of notes; the moment named was only the merge | Opus M3, Astra 4 | Fixed: "before deciding a job ships as notes only, and before merging one"; the rulings files can qualify; the full list of what cannot |
| React Doctor's running rule sat behind the database trigger | Astra 2 | Fixed: the line moved back to the page whole |
| A future ruling of a moved section could load only as a number | Opus M5 | Fixed: the `DECISIONS.md` clause says to reword the page's line where the rule binds ordinary work |
| The reads-owed line lost "where two are required" | Opus L1 | Fixed |
| The compaction line lost "his word" and named no moment | Opus L2, L3 | Fixed |
| D1762 cited as live though D2460 takes its step | Opus L4 | Taken: D1762 marked replaced by D2460 and archived — the reader's check of the pair (D971) |
| The bug-check pointer repeated the roster | Astra 7 | Fixed: one line; the line on Fable never reading in place of Astra's and the Opus read kept |
| Skills pointing at the moved text | Opus L5 | Fixed in the overnight and session-handoff guides; the comment in `vercel-ignore.mjs` left as it is — it lands on the short form, which names the steps, and changing a script would send a notes change through every gate |

## The fix read

The fixes above were read once more by a fresh Opus reader (`…-fixread-opus.md`), as the order has it for a fix round: no high finding, one medium, four low — what Vercel counts as notes is wider than the notes-only list (the short form, the steps and `gates-and-deploy.md` now say so, with what to do if it builds after all); the short "only notes" line names both sides as the full list does; the when-needed document's header carries the `DECISIONS.md` clause. All five taken. That round's fixes were not read again: each is the reader's own rewording, checked against `vercel-ignore.mjs` and the full list.
