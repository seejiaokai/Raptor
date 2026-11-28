# Round 6's page — a fresh Fable reviews and adjusts the new words and the page (chat 188, 26 Nov 26)

You are a fresh Fable (latest, high). You did not write or draw any of this. The owner is not technical and reads on
his iPhone. His ask: "update the mock up with fable's help on the applicable areas and highlight in a different colour
that its new". The rule you serve: the words people read in the app are drafted, then a different fresh Fable reviews
and adjusts them before they reach him (D2441); and every reading of his words is put to him as its own question with a
worked example, never built or worded on silently (D2611).

## Where
- Folder `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135` (`git -C`; never switch, commit or push).
- The page: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/page-r6.html`, built from
  `raptor-port/scripts/handpass/n188/page/` by `build.py` (run: `python raptor-port/scripts/handpass/n188/page/build.py
  raptor-port/scripts/handpass/n188/page <round-5 page> raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/page-r6.html`,
  the round-5 page being `git show c5727aa57:raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/page.html` saved to a
  scratch file outside the repo). New this round: `body-n.html` (group N, N1–N11), the group N list and the violet key in
  `top.html`, the violet "Updated in round 6" lines in `body-e.html` / `body-d.html`.
- The drawers' reports, each with its list of new words: `raptor-port/docs/superpowers/briefs/2026-11-26-msq-r6-users-draw-report.md`
  and `…-r6-misc-draw-report.md`. The words live in `raptor-port/scripts/handpass/n176/words-r6-users.mjs` and
  `words-r6-misc.mjs`; the pictures are re-made by `draw-r6-users.mjs` and `draw-r6-misc-*.mjs` (see each report for
  how to re-run; the app is served on `http://localhost:4700/`, do not rebuild or stop it).
- His rulings: full rows by the shell, `grep -h '^| D2641 |' .claude/decisions-full/*.md` — D2638–D2645, D2632–D2634,
  D2625, D2626, D2628, D2384, D2611, D2441, D1625; the People & accounts page `.claude/rules/decisions/people-accounts.md`
  §Many squadrons; plain words: `.claude/rules/plain-language.md`.
- Load the design skill first (Skill tool, `impeccable`, target `raptor-port`): critique and clarify lenses, for a phone.

## Do
1. **The new in-app words (D2441):** every word in both reports' lists. For each: keep, or adjust (say why in a few
   words). Apply your adjustments to the two words files and re-run the drawing scripts for the pictures they change;
   open each re-made picture. Watch for: the app's own names for things, one wording per fact across pictures, words
   that promise what the app will not do, a phone's width.
2. **The page's own text for group N and the violet lines:** plain words, the app's names, every claim with its
   consequence, each recommendation true to his rulings. Any place the page states a reading of his words as settled
   instead of putting it as its own question with an example (D2611) — split it out as its own short question.
   Fix in `body-n.html` / `top.html` / `body-e.html` / `body-d.html` directly and rebuild the page.
3. **The page for his iPhone:** at 390px wide — no sideways scroll, each picture cut to what it is about, the violet
   marks clearly distinct from the green recommendations and the old (now plain) marks, the list at the top readable.
   Fix what you can in the sources; name what you cannot.
4. Do not redesign what he has ruled. If you think a drawing is wrong against a ruling, say so; redraw only words.

## Report
Write the whole report to `raptor-port/docs/superpowers/briefs/2026-11-26-msq-r6-fable-review-report.md`: each word
kept or changed (old → new, why); each page fix; anything you found but did not fix, and why; the pictures re-made.
Reply with a short summary (under 250 words).
