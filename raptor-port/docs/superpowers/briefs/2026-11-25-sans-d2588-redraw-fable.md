# Brief — Fable rewords the D2588 drawing page after his D2589 / D2590 (chat 186, 25 Nov 26)

You are a fresh, blind Fable reader-writer. You did not write this page. His rule (D2441): the words people read in the
app are drafted, then a fresh Fable reviews and adjusts them before they reach him; and (D2393) Fable writes the words
put to him. Chat 185 sent this page to him with lines Fable never read; he then ruled:

- **D2589** — "Cut back sounds weird": the schedulers' bell line never says "cut back".
- **D2590** — "Changed sounds good": for every change that is not a delete, the line reads
  **"Ranger changed his SANS availability for Sat 18 Jul."**, the quieter line saying what he now offers and what he is
  planned on (e.g. "He now offers Fly 08:00–10:00. He's planned on VL BFM (T/O 13:00)."). A delete keeps
  "Ranger deleted his SANS availability for Sat 18 Jul.".

Read his full rows first: `grep -h '^| D2588 |\|^| D2589 |\|^| D2590 |\|^| D2581 |\|^| D2582 |\|^| D2584 |' .claude/decisions-full/*.md`
(from the repo root, the shell). Background on the page: `raptor-port/docs/superpowers/briefs/2026-11-25-sans-d2588-draw-brief.md`;
Fable's earlier words: `raptor-port/docs/superpowers/briefs/2026-11-25-sans-d2587-d2588-words-fable.md`.

## What to do

1. **The bell lines.** In `raptor-port/docs/mock/2026-11-25-sans-d2588/draw.mjs`, the object `W` (lines ~41–60) holds
   every line drawn into the app's bell and crew list. Write your adjusted set to `D:/raptor-work/c186-draw/words.json`
   as `{ "<key>": ["title", "quieter line"], ... }` for every bell key (a, b, c, d, q1b, q2, q3, q4sat, q4sun, q5,
   q5both) and `"<key>": "text"` for the three crew-list keys (flyOnly, oftOnly, flyOft). "Cut back" goes everywhere
   it appears; every non-delete change says "changed". **Read every other line too** — the helper filled some in
   itself and Fable never read them: q2, q3 ("Saber deleted Ranger's SANS availability…" — a scheduler deleting it),
   q4sun ("He's planned on OFT (10:00)."), q5both, and the crew-list words. Keep each line true to the case the page
   draws for it (the case is in the comment above each scene in `draw.mjs` and in the page's own text). Do not edit
   `draw.mjs` yourself.
2. **The page's own words.** Edit `D:/raptor-work/c186-draw/index.tpl.html` (a copy; the page is built from it). Every
   "cut back" / "cuts back" / "cut-back" in the page's prose, questions, captions and alt texts goes, in his words. Read
   every line of the page's text and fix what is unclear, untrue to the pictures, or wordy. Then:
   - Question 3 ("He moves his hours instead of cutting them") offered "changed" vs "cut back" vs no line; the word is
     now his ("changed"), so what is left to ask is only **a line or no line** — rewrite it so; drop the word choice.
   - Question 2 (still covered) and the other questions: keep their recommendations unless a word change makes one
     untrue; say so in your report if it does.
   - At the very top, one short line saying what is new since he last looked: the line now says "changed", as he
     asked. Only what is new since the last round is highlighted (D2159); earlier rounds' marks take the normal colour.
   - Plain words, an example each, no review codes, ruling numbers or record words on the page (D2164); never write an
     action as if a person (D2185); every question first says when it happens in real life — who is doing what (D2439).
   - **Do not touch** the `{{fig n|tag|file|alt|caption|real}}` tokens' `n` and `file` fields, the HTML structure,
     classes, ids or styles. You may change a token's tag, alt, caption and real fields (no `|` or `}` inside them).
3. **Report** to `D:/raptor-work/c186-draw/fable-report.md`: each line you changed, old → new, with one reason; each
   line you read and left, marked "read, kept"; anything you think is untrue to the case drawn or should go to him as a
   question. Your report is the record — write it to the file, then return a three-line summary.

Your scope is words only. Do not run the app, build, commit or push.
