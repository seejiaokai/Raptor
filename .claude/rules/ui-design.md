---
paths:
  - raptor-port/src/ui/**
  - raptor-port/src/leavewar/ui/**
  - raptor-port/src/tracker/**
  - raptor-port/src/**/*.css
  - raptor-port/docs/mock/**
  - raptor-port/docs/ui-contracts.md
  - raptor-port/docs/design-practices.md
---

# Interface work — the design guide loads itself (D812, 13 Oct 26)

**Loads by itself** whenever an interface file is opened. Before designing, restyling, wording or reviewing anything a
person sees, **open `raptor-port/docs/design-practices.md`** — the ONE guide (his rulings, then three outside design
skills' good practices in our own words; nothing installed whole). It is written first and interface jobs are judged
against it — the calendar's design included (D813). `/impeccable` is used on top of it, never instead of it.

## The short form — in force the moment this loads

1. **His rulings win:** buttons keep their size (D487) · the Raptor look and what its colours mean stay (D765) · a
   working screen stays dense (D688, D696) · never at a cost of speed (`raptor-port/docs/performance.md` Part 1) · a
   visual change is a picture to him first, at his iPhone's size and a desktop's (D541).
2. **Words:** every word earns its place or goes (D726); a note is shortened, removed where the screen says it already,
   or moved under one short "How it works" fold (D808); what happened, then the one thing he must know; no warning
   dropped to save words; an error says how to put it right; a button starts with its verb.
3. **Keyboard:** anything new can be opened, used and closed without a mouse; Escape closes what opened last; the
   keyboard returns to the button that opened a thing; focus is always visible and never hidden under a bar that
   stays. Its keyboard set is written beside its picture.
4. **Layout:** group with space and surface before another box; what can be changed first, what explains after; one
   main button a view, in the same place; nothing sits over what it is about; on a phone a thing takes the full width
   or a sensible fraction, never what is left over.
5. **Colour:** "press me" or a status, never decoration; emphasis by weight or surface before a new colour.
6. **Motion:** quiet, quick, only movement and fading, never on the dense grid, never the only signal.
7. **A look changes nothing:** it reports what was and was not looked at, each finding with its place, the rule, what
   the person meets and the exact change — and goes to him in rounds of at most four.
