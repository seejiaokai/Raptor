---
paths:
  - raptor-port/src/**
  - raptor-port/docs/mock/**
  - raptor-port/docs/ui-contracts.md
  - raptor-port/docs/design-practices.md
  - .claude/skills/impeccable/**
  - .claude/skills/brainstorming/mockups-on-the-real-app.md
---

# Interface work — the design guide loads itself (D812, 13 Oct 26)

**Loads by itself** whenever a file under `raptor-port/src/` or a mock-up is opened (words a person reads are written
in the engine and the state files too, not only in the screens). Before designing, restyling, wording or reviewing
anything a person sees, **open `raptor-port/docs/design-practices.md`** — the ONE guide (his rulings, then three outside
design skills' good practices in our own words; nothing installed whole). It is written first and interface jobs are
judged against it — the calendar's design included (D813). A change that touches nothing a person sees needs none of this.

**The design skill is used WITHOUT being asked for (owner D819, 13 Oct 26 — "impeccable is being called automatically too
when designing UI?").** For a design job — a new screen, window or control, a restyle, a look over something built, a
pass over a page's words, a mock-up — invoke the `impeccable` skill yourself, with the command that fits: `shape`
before building something new, `critique` or `audit` for a look, `clarify` for words, `distill` for clutter, `polish`
before it is shown to him. It works ON TOP of the guide, never instead of it: where the skill's default meets this
guide or one of his rulings, the ruling wins. NOT for a small code change that merely sits in an interface file (a
fix to behaviour, a test, a comment) — the skill's detector already runs after every interface edit.

## The short form — in force the moment this loads

1. **His rulings win:** buttons keep their size (D487) · the Raptor look and what its colours mean stay (D765) · a
   working screen stays dense (D812) · never at a cost of speed (`raptor-port/docs/performance.md` Part 1) · a visual
   change is a picture to him first, at his iPhone's size and a desktop's (D541) · pucks never wrap.
2. **Words:** every word earns its place or goes (D726); a note is shortened, removed where the screen says it already,
   or moved under one short "How this works" fold (D808) — each put to him before and after, nothing built reworded
   unasked; what happened, then the one thing he must know; no warning dropped to save words; an error says how to put
   it right; a button starts with its verb. **Shortening is not summarising (D825, D832):** only padding, a thing said
   twice, an announcement and a hedge may be cut; the note stays a sentence; each change shows the exact words cut and is
   read cold; a note that cannot lose a word is left whole — the guide's §1a.
3. **Keyboard:** anything new can be opened, used and closed without a mouse; Escape closes what opened last; the
   keyboard returns to the button that opened a thing; focus is always visible and never hidden under a bar that
   stays. Its keyboard set is written beside its picture.
4. **Layout:** group with the space already there and a change of surface before another box — never added height; one
   main button a view, in the same place; nothing sits over what it is about; on a phone a thing takes the full width
   or a sensible fraction, never what is left over. (On the Logic page: what can be changed first, what explains
   after — D809.)
5. **Colour:** "press me" or a status, never decoration; emphasis by weight or surface before a new colour; a colour
   the app already uses is not free — the guide's table, then the stylesheets.
6. **Motion — new motion only** (what he asked for stays as measured): quiet, quick, only movement and fading, nothing
   new on the dense grid, never the only signal, off for a reader who asked for less.
7. **A look changes nothing:** it reports what was and was not looked at, each finding with its place in the app's own
   words, the rule, what the person meets and the exact change — and goes to him in rounds of at most four.
