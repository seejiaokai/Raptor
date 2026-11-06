# The rules diet — brief (D1718, 6 Nov 26; started 7 Nov 26 — D1732)

**Started 7 Nov 26 (D1732, replacing D1718):** his words: "u can start now u can also ask astra to review it as well and see what is
better". Opus with high thinking, in a fresh chat; the plan and the sizes before and after are put to him first, and nothing
changes until he approves; the plan is read by Astra and by a fresh Opus reader, each blind, to see which is better
(confirm with him first that his ChatGPT subscription is back — D1594). Backlog item: [RULES-DIET].

_Before 7 Nov 26:_ **Waiting on:** Anthropic releasing Fable 5.5. **Not started before then** — his words: "3 we do it next time when anthropic
comes up with fable 5.5" (D1718). Backlog item: [RULES-DIET].

## Why (his question, 6 Nov 26)

He asked what to do: chats fill up, hand off often, and hallucination is evident; the app feels too complex. The agent's
finding: the code is big but ordinary; what overloads a chat is the rules and records it must read and reconcile before
it touches code.

## Measured 6 Nov 26 (bytes; roughly 4 bytes a token)

- A fresh chat in this project: about 150,000 tokens before he types (the app's own count: tools of the app's connectors
  ~68,000 — mostly built into the app, not switchable; rules and memory notes ~37,000; the rest the app's own prompt).
- Read by a typical job before any code: `HANDOFF.md` 51 KB, the area's rulings (Leave War 131 KB, scheduler 117 KB,
  inputs 47 KB), `raptor-port/docs/bug-check-order.md` 106 KB, `raptor-port/CLAUDE.md` 40 KB, how we work 55 KB
  (loaded in every chat). `OUTSTANDING.md` 369 KB.
- 1,302 live ruling lines; 1,506 Markdown documents under `raptor-port/docs/`; 17 hooks; 24 skills.
- The code: about 325,000 lines; the largest files the Tracker's core (7,454 lines) and the Leave War's store (6,299).

## The proposal put to him (point 3 of 5)

1. Each area's rulings rewritten as a short "how it works now" page — the current rule, not the history of decisions;
   the old rows archived whole and still searched.
2. How we work and the bug-check order cut to one-page checklists, the detail on demand.
3. Rules turned into automatic checks (tests, hooks) where a check can carry them.
4. Every move read by a fresh reader for meaning (D138).

**It needs his ruling before it starts:** it sets aside D136 (no live ruling leaves the list) and D141 (no size targets).
Plan first, before-and-after sizes shown to him, nothing changed until he approves.

## The other points of 6 Nov 26

- Point 1 — hand off by about 40% full, one job per chat: put to him, not yet answered.
- Point 2 — switch off the connectors the project never uses (Google Drive, Claude Docs): he does it from the message
  box's + menu; the agent cannot. The saving is a few thousand tokens a chat, not the 68,000 first said.
- Point 5 — split the largest code files as each area is next worked on (already the tidy-ups' path, D490, D775).

Sources read: Anthropic, "How Claude Code works in large codebases"; Anthropic, "How and when to use subagents in Claude
Code" (both claude.com/blog, read 6 Nov 26 through a search summary).
