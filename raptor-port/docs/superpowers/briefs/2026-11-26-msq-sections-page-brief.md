# Brief — one mock-up page per section (chat 191, 26 Nov 26; his D2656, D2657)

One page per section, his last look before that section is built. He is not technical and reads on his iPhone. He
answers each page with "Section N: go, as recommended", or taps Differently on an item and adds his words.

## Your section — the host's message names it (1 the guard rail, 2 Admin → Users across squadrons, 3 the bell,
colours and Display, 4 the Leave War posting sheet)

Write ONE file: `raptor-port/scripts/handpass/n191/page/body-s<N>.html` — the page body only, starting `<main>` and
ending `</main>` (the frame `head.html` / `tail.html` and the reply bar are shared; read them first to use their classes:
`.top`, `section`, `.short`, `.when`, `.pair`, `figure`, `.cut`, `.rd`, `.nav`, `button.diff`, `.r6` (teal here), `.tag6`,
`.r6key`). Build and check it: `node raptor-port/scripts/handpass/n191/page/build.mjs <N>` (it writes
`raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/section-<N>.html` and fails on a missing picture or a dead link).
Pictures are referenced as `drawn/<file>.png` (and `today/…` where an earlier round did). Do not touch any other file.

## What the page holds, in this order

1. **The top (`.top`) — what to look at now (D1237, D2439):** one line on how to answer; the cast in one line (Saber
   master admin, home 142 · Hunter 142's admin, Plan of 149, View of 150 · Kestrel 149's admin · Mako 150's admin ·
   Ranger a 142 member); then **every open question of this section, one row each**: what it is, the recommendation in
   green, a link to its item. Then one row per group of screens below.
2. **Each open question** as a `section` with `id="q1"`, `q2`, …: the recommendation in short; **when it happens in
   real life** (who is doing what, at what point of their work, how often — D2439); today, with its picture where
   today shows something; the recommendation pictured; the other choice pictured where drawn; a `button.diff` with
   `data-q="Q1"` (and named other choices with `data-say`). One decision a question.
3. **What this section builds — every screen, grouped** (by where it is in the app): each screen state its picture(s).
   A picture he already approved: caption "You approved this in round 5" / "round 6" (plain, no colour). A picture
   drawn new for this page: the item wears `.r6` and `<i class="tag6">new drawing</i>`; its teal dashed rings mark
   what is new in the app (say so once at the top with `.r6key`). A redrawn approved picture (moved to a later
   answer): "Redrawn to your later answer: <what changed>".
4. **Not drawn, and why** — one short list (e.g. the phone's own list, which his own picture shows).

## Sources

- The drawings ledger `raptor-port/docs/superpowers/briefs/2026-11-26-msq-sections-drawings-ledger.md` (your section:
  every state, approved file or owed) and your section's draw report `…/briefs/2026-11-26-msq-s<N>-draw-report.md`
  (the new pictures, its questions, "drawn, never shown" rows, any "After …" section — the latest wins).
- The words review `…/briefs/2026-11-26-msq-sections-words-review.md`: **the final words.** Where it changed a word
  that a picture shows, do not hide it in a caption — list it at the end of your reply as "redraw owed: <file> —
  <old> → <new>"; the host gets it redrawn before the page goes to him.
- The plan's open questions for your section: Build 1's plan §8.5, §21 (your section's "waits on" holds) and §24
  (`raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md`, read by section). Every hold that waits
  on his answer and has a drawing or can be put in words is a question on your page. Two from the red team are the
  host's to place: home squadron first in every squadron list or Admin → Users only (section 2's page) and bug
  reports — each admin's own look or one look for all (section 3's page).
- Round 6's page for how earlier items were worded and cut: `raptor-port/scripts/handpass/n188/page/body-n*.html`.
- His rulings (full rows: `grep -h '^| D2652 |' .claude/decisions-full/*.md`) — never state a reading as his rule.

## Rules for the words on the page (his rulings)

- Plain words: what a person sees and what happens, an example each; **no ruling numbers, review codes, file names
  or record words** in the text (D2164). An action is never written as if a person (D2185).
- Pictures: a question about a phone shows the phone, about a desktop the desktop (D1951); each cut to what it is about
  (`[[cut src|W|H|x0|y0|w|h|alt]]` — W/H the picture's pixel size, read with a tool, never guessed) (D1222); never "see
  picture 3" — each picture beside its words.
- Short. A screen that only repeats what the picture shows needs one line, not a paragraph.

## Your reply

Short: the page's sections, the open questions with their recommendations, any "redraw owed" line, and the build
script's printed check line.
