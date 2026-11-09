# Brief for Astra — the first draft of the app's word list ([WORD-LIST], his D491)

You are drafting, read-only, in the repository at `C:\Users\User\projects\Raptor` (the app lives in `raptor-port/`).
Change no file. Your whole answer is the draft itself, in Markdown, printed as your final message — the coordinator
saves it word for word.

## What it is for

The owner is not technical. Agents writing to him keep using the code's names for things ("the working copy store",
"schedFields", "the remarks registry") instead of the names he sees on screen; and briefs for reviewers need the
opposite translation. The word list is ONE page: for each thing a person meets in the app — the name it has on screen,
what it means in one plain sentence, and the name (or names) it has in the code. The code name is kept on purpose: the
translation is the point. It is a reference doc, searched when writing to him or briefing a reviewer, never loaded in
every chat (spec: `raptor-port/docs/superpowers/specs/2026-10-02-workflow-skills-fusion.md` §8 item 1; his approval D491;
the backlog item `[WORD-LIST]` in `OUTSTANDING.md`).

## How to build it

- **Source the screen name from the screen**, never from a document's paraphrase: the labels, headings, button texts,
  menu items and tab names in `raptor-port/src/ui/` (and the Tracker's own files), as a person would read them. Where
  two screens call one thing by two names, list both and mark it "two names on screen" — that is a finding, not
  something to settle.
- **The meaning** in one sentence of everyday words, checked against the reference docs where they say how it behaves:
  `raptor-port/docs/ui-contracts.md`, `engine-rules.md`, `data-model.md`, `remarks-vocabulary.md`, `feature-impact.md`.
- **The code name(s)**: the main type, store, module or function a reader would grep for, each in backticks; at most
  three per row.
- **Group by area**, in this order: the Scheduler Board and Edit Schedule (the week, a day, a formation, a puck, a line,
  the day bar, publishing, an amendment, the working copy, a saved plan, the changes window, Undo / Redo, the warning
  list, crew rest, reporting times); Inputs (requests, unavailability, the SANS calendar); OIL; the Leave War; the
  Tracker; People & accounts (Admin → Users, Quals, sign-in, posting in and out, archive / restore / delete); Insights;
  Admin and settings; anything app-wide (the top bar, the gear, the bell, the save band).
- Leave out what no person ever sees (internal helpers, test-only names). Keep each row short.
- **Privacy:** the bare squadron number only, never a squadron or service abbreviation; "a fighter squadron"; the bare
  "F-15". No real person's name — the demo data's made-up names may not appear either.
- Where you are unsure what a thing means, say "unsure" in the row rather than guessing.

## The shape

```
# The app's words — what a person sees, what it means, what the code calls it

(one-paragraph preface: what this page is for, that it is searched, never loaded; a term settled in a planning round is
added the moment it is settled — the spec's §8 item 1)

## <Area>
| On screen | What it means | In the code |
|---|---|---|
| ... | ... | `...` |

## Two names on screen
(every case found, each: the two names, where each appears)

## Unsure
(every row marked unsure, and what would settle it)
```

Aim for completeness over polish: about 120–200 rows is expected. The coordinator checks the draft against the running
app before it goes to the owner.
