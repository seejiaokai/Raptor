# Round 6 — Admin → Users across squadrons, drawn on the real app (a fresh Fable, latest, high; chat 188, 26 Nov 26)

You are a fresh Fable. You design and draw; you build nothing in the app. The owner is not technical and reads on his
iPhone. His ask today: update the round-5 mock-up with every change so far, Fable's help where it applies, and **what is
new shown in a different colour**.

## Where and how (read first)
- Folder `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135` (use `git -C`; do not switch, commit
  or push). Another drawer (Opus) works in the same folders at the same time on D2, D8 and D12 — touch only files you
  create, names starting `u6-` (pictures) and `draw-r6-users*.mjs` / `words-r6-users.mjs` (scripts).
- The served app: `http://localhost:4700/`. First check it serves THIS folder's `raptor-port/dist` (compare a script
  file name in the page's HTML with `raptor-port/dist/assets/`). If it does not, serve it yourself on a free port
  4701–4719 (`npx vite preview --port N --strictPort`, run from `raptor-port/` by its full path, in the background);
  never rebuild, never stop another chat's server. Say which you used.
- How the drawings are made: `raptor-port/scripts/handpass/n176/` — `world.mjs`, `draw-lib.mjs`, `draw-r5b-lib.mjs`,
  `draw-r5b-users.mjs` (the e8j "Edit on 142 →" drawings) and `words.mjs`; the world (Saber master admin home 142;
  Hunter 142's admin with Plan of 149 and View of 150; Kestrel 149's admin; Mako 150's admin; Ace and Jester archived):
  `raptor-port/docs/superpowers/briefs/2026-11-25-msq-q3-draw-report.md`. A drawing adds only the new thing on top of
  the real app, in the app's own parts and sizes (D1496) — measured from the app, never guessed: a button is the app's
  own button, a pair of buttons the app's own pair, same height, one line (his D1 correction, 26 Nov: "the cancel
  button is different in size and doesnt seemed to be aligned").
- Output `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/`: each whole picture plus its `-crop` cut to what
  the picture is about, desktop 1536 wide, phone 402×874, deviceScaleFactor 2. Put every new word in
  `words-r6-users.mjs` so a words change is a re-run.
- **Mark what is new since round 5** on every picture: a violet dashed ring, 2px, colour `#8B5CF6`, 4px clear of the
  part, round each new part — nothing else violet. (Pink rings in older pictures mean "look here"; do not reuse pink.)
- Load the design skill first (Skill tool, `impeccable`, target `raptor-port`).

## Read
- Your own earlier proposal, which he has partly ruled on: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/users-design.html`
  (its HTML mock-ups are what you now draw on the real app).
- His rulings, full rows (the shell: `grep -h '^| D2641 |' .claude/decisions-full/*.md`): D2641, D2643 (Incoming and
  Outgoing, not "Moving"), D2634, D2633, D2632, D2625, D2626, D2629, D2631, D2635, D2622, D2191; the People & accounts
  page `.claude/rules/decisions/people-accounts.md` §Many squadrons.
- The round-5 page's E8, D4, D5, D7 (`…/q3/page.html`) and the drawings e4a, e4b-r, e4b2, e4b3, e5-d-primary-top-r,
  e8j, e8j2.

## Draw — every open question taken as recommended (the owner said "assuming everything is as recommended")
1. `u6-d-users` (+`-p`): Kestrel, 149's admin, opens Admin → Users. At the top the **"From other squadrons"** block:
   Plan holders named (Hunter 142 · plans 149; Mako 150 if your proposal keeps him), Saber 142 "master admin, full
   access", "▸ View only · N people" folded. Then **Incoming** and **Outgoing** as two groups (D2643) — e.g. Incoming:
   Cinch 142 joins 149 on 14 Dec; Outgoing: Raven leaves for 150 on 4 Jan, with its "Undo post out". Then 149's own
   people, then the other squadrons folded, **his home squadron first, then the rest by number**.
2. **The role on another squadron's short row, in words** (recommended answer to his "personnel should also show the
   role it holds"): "Pilot · CAT IP · admin" for an admin; a member's short row says nothing more; a man with no
   sign-in has no role. Shown on rows of 1 and on the folded group opened in 3.
3. `u6-d-folded` (+`-p` if it reads): Kestrel opens "▸ 142 · 60 people": **no grey "142" chip on the rows inside a folded
   group** — the heading already says whose they are (recommended); the chip stays on a man of another squadron shown
   anywhere else (the block at the top, a search result).
4. E8 as recommended: the "All squadrons" tick gone, and an opened row of another squadron's man offering **"Edit on
   142 →"** to whoever is 142's admin (Saber here). Redraw e8j/e8j2 as `u6-d-edit`, `u6-p-edit`, `u6-d-edit-after`
   only if they no longer match pictures 1–3; otherwise say e8j stands.
5. `u6-d-postout`: on 142's page Hunter opens Cinch's row: "Post out…" beside Suspend, Archive and Delete; pressed, the
   Leave War's own posting sheet (draw it from the app's real Leave War sheet, Transfer to Sqn → 149, from 14 Dec 26).
6. `u6-d-askpost` (+ the bell line `u6-d-askpost-bell`): on 149's page Kestrel opens 142's Cinch: "Ask 142 to post him
   here"; the line 142's admins get on the bell. This one is new and needs his word — say so in the report.
7. `u6-d-both-pages`: Cinch in transit on 142's page (Outgoing, with the date on his row) and on 149's (Incoming).
Six to nine pictures in all; cut each so a phone reads it. If any part of your earlier proposal now looks wrong to you,
draw the better way and say why — never quietly.

## Report
Write the whole report to `raptor-port/docs/superpowers/briefs/2026-11-26-msq-r6-users-draw-report.md` (create it),
then reply with a short summary. In it: each picture's file names, what is on it, what is new (the violet rings), any
departure from your proposal or his rulings and why; every new word in one list (it goes to a second fresh Fable before
he sees it — D2441); a `FACT` line per picture of what the screen said; anything you could not draw. Open each picture
you made before reporting it.
