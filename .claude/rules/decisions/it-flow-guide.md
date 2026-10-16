---
paths:
  - raptor-port/docs/it-flow-guide/**
  - raptor-port/scripts/itflow/**
  - raptor-port/docs/**/*it-flow*
  - raptor-port/docs/**/*itflow*
---

# Rulings — The IT flow guide

**Loads by itself** whenever a session reads a file of the IT flow guide — the deck's folder
(`raptor-port/docs/it-flow-guide/`), the scripts that shoot and build it (`raptor-port/scripts/itflow/`), its plans and
briefs (the `paths:` at the top of this file) — **and open it yourself before PLANNING any work on the guide**, before
one of those files is open (`.claude/rules/doc-structure.md`). Its rulings moved here from How we work on 2 Oct 26
(`[DOCS-SIZE-PASS]`): they say what the deck shows and when it is rebuilt, which only a chat working on the guide needs
(D137, D141). The general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every session; the map of
every ruling and how to add or retire one: `DECISIONS.md`.

**One line per ruling — its number, its date, the rule as it stands** (D390). **Its full row** — his words, the
readings he was told, where it lives — is in `.claude/decisions-full/it-flow-guide.md`, never loaded by itself:
**open it before acting on a ruling's detail or asking him about it** — `grep -h '^| D410 |' .claude/decisions-full/*.md`
(the shell; the Grep tool hides a long row). A "— changed by" tail names the later rulings that changed it. Newest first.

| # | Date | The rule |
|---|---|---|
| D403 | 29 Sep 26 | The IT flow guide is re-shot and rebuilt only when he says so — not after each app change, and not on a schedule. |
| D417 | 29 Sep 26 | The IT flow guide shows how the Leave War's manning is set up and customised — where the manning rows come from, how an admin adds, changes or removes one, and what the grid shows after — as screens, not the count's arithmetic. |
| D416 | 29 Sep 26 | The IT flow guide shows the schedule's two editing modes and When to use each: the Scheduler Board — one day, with the more functions dedicated to a day — and Edit Schedule's week — the big picture, for smaller edits. |
| D415 | 29 Sep 26 | The IT flow guide shows What happens by itself: for one action (one input filed, and the other actions that spread the same way), every place in the app that changes without anyone touching it, and what it shows there. |
| D414 | 29 Sep 26 | The IT flow guide covers the Tracker in full: how a flow chart is made (each tool and what it does, joining events, editing an event's details), how a member updates it and what he sees, every other way to update, what it refuses (an NA cannot have fails), making students and courses, export and import — and what else the agent finds. |
| D413 | 29 Sep 26 | The IT flow guide shows the Leave War's own work flow, in his order: the admin creates the period → opens it for bidding → members bid → it is closed for the admin's decisions → published → members edit their remarks; later changes mainly by the member through Inputs; the admin may still edit on the War directly. |
| D412 | 29 Sep 26 | The IT flow guide goes step by step through how a schedule is made, and wherever the app offers more than one way to do a thing (a puck brought onto a seat, and every other such case the agent finds — his examples are not the limit) it shows each way. |
| D411 | 29 Sep 26 | The IT flow guide's sample is approved as drawn (four pictures a slide, the style kept); the deck also covers the alternate-plan flow (saved plans: making one, switching, bringing one out) and shows the work flow — how the journeys follow one another, from Inputs filed to a day published and amended. |
| D410 | 29 Sep 26 | The IT flow guide is a PowerPoint deck plus a PDF of it: a map slide of every journey, then one slide per journey — real screenshots, numbered click marks, arrows, a short caption per step, and A "What to test" box naming the checks and the automated test; no rules-engine detail; a two-slide sample to him first. |
