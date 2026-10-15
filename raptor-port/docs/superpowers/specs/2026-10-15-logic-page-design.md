# The Logic page — designed for the person who reads it (D809, D925)

**Status: BUILT and LIVE 16 Oct 26 (pull request 519; D928–D933, D936) — the check `raptor-port/docs/handpass/2026-10-15-logic-medical.md`.** *(Was: a mock-up to be drawn, then put to him; nothing built before his word, D853.)* Backlog: `[LOGIC-PAGE-LAYOUT]`, now in `OUTSTANDING-ARCHIVE.md`.

## What he wants (D925, 15 Oct 26 — read with D809)
The page is for the user — the scheduler or the admin — to understand, NOT a description of how the app works inside. It is
arranged so it is intuitive: everything that can be edited together at the top (D809), and for each setting the key point a
person needs — **if you change this number, what changes**: for example the brief time, which moves the automatic B (the
suggested brief) on every flying line. The very detailed workings of the app are left out; some rules still need a short
"how it works" — how the crew-rest warning is worked out is his example — kept where it helps. There is too much clutter now.
He asked for the design skill (`impeccable`) and the design guide to be used, a mock-up drafted on the real app, and the
agent's best suggestion.

## What the mock-up must settle
1. The inventory: every item the page holds today (`raptor-port/src/ui/logic-html.ts`, `raptor-port/src/ui/LogicPage.tsx`),
   marked "can be edited" or "explains only", and for each editable one, what it changes — in the app's words.
2. The editable settings at the top, grouped by what a person is doing (the agent's groups, named on the picture).
3. Under each setting, ONE line of consequence ("Moves the suggested brief (B) on every flying line"), never a description
   of the code; the longer "how it works" only where a person must understand a warning to act on it (crew rest), folded.
4. What is cut: text that only says what the screen shows (D846), detail a scheduler never needs.
5. Phone and desktop; the search and the controls that stay in sight keep working (D561).
6. No rule's value or meaning changes — it is where things sit and what is said about them.
