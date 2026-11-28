# Brief — the Leave War, the Inputs pages and the schedule: one design for a person's absence (26 Nov 26, chat 191)

The same brief goes to two readers, Fable and Astra (GPT-6 Astra), each **blind to the other** in round 1. In round 2
each reads the other's proposal and the two agree one, saying where and why each moved. Read-only: change no file in
the repo; write your proposal only to the path your call names.

## What he asked (D2782 — his words, the full row: `grep -h '^| D2782 |' .claude/decisions-full/scheduler.md`)

He stepped back from the combined-row work and asked whether we are moving in the right direction. As a user he feels
very confused about what he can do where. His examples, paraphrased:
- A group leave on the Leave War: he must pick the group's box, then pick one man if only one man changes, and instead
  of moving it as he moves the war's own leave, he is sent to the input's own window.
- The war's own leave can be dragged and takes only AM, PM or a whole day; an input takes custom times.
- On the Inputs page, and on the schedule, he can file one input for several people at once instead of one by one —
  he likes that. On the schedule he can drag and drop, which he also likes.
- War items that came from inputs say "change it on the Inputs page".
- Some war items cannot be deleted, moved or added to; others can.

How his squadron uses the three (his words, the ruling): **the Leave War mostly for leave bidding; the Inputs pages for
members' day-to-day and last-minute inputs; the schedule for the scheduler's last-minute planning.** "It feels like all
over the place … we need to think of a better interface and design."

## What to read

- **The fact map of today** (from the code, not walked): `raptor-port/docs/superpowers/briefs/2026-11-26-absence-three-pages-map.md`.
  Check any cell your proposal leans on against the code it cites; a fact you could not check is marked so.
- **His rulings** — the pages, whole sections named: `.claude/rules/decisions/leave-war.md` (its Inputs, postings and
  the schedule section, and how bidding works), `.claude/rules/decisions/inputs.md`, `.claude/rules/decisions/scheduler.md`
  §Inputs on the schedule, `.claude/rules/decisions/design.md`. Open a full row (`.claude/decisions-full/`) before leaning
  on a ruling's detail.
- **The product and the design guide:** `raptor-port/docs/PRODUCT.md`; `raptor-port/docs/design-practices.md` §0 and §9
  (his design lessons), whole.
- **The work in flight he is stepping back from:** the combined-row plan
  `raptor-port/docs/superpowers/specs/2026-11-26-combined-input-rows.md` (its head and its leave section), and the
  questions page's subjects: one row a group input under Unavailable; a group leave on the war changes as one (D2778);
  a "Change for Cutter only" button he asked for (not ruled).

## The rules of the job

- **Recommend the right design, not the easy one or the nearest to today (D754):** intuitive, fits the workflow, the
  same everywhere, fewer places for a bug. An earlier ruling is not by itself a reason to keep a worse design — name
  each ruling your design would change, and why.
- **His standing aims:** the Raptor look, cleaner the way Apple's are, intuitive enough to need few instructions
  (D821); schedulers at a desk wanting speed, members on phones (D820); a working screen stays dense; fewer words.
- **Fixed points you may not move without saying so loudly:** a published schedule changes only by a signed amendment;
  OIL is earned leave, never pay; one record per input with its list of people (D756); the database comes last and
  the app moves to Power Apps on Dataverse — flag anything that platform cannot do (D1551).
- Not a code review: no bugs, no line numbers needed except to prove a fact.

## What to deliver (under about 250 lines, plain words — he is not technical, the host will translate)

1. **Diagnosis:** the two to four root causes of the confusion — causes, not the symptoms above.
2. **The model, in one paragraph a scheduler could read:** what each page is for, and the few rules that say what you
   can do with any item anywhere, so a person can predict it without trying.
3. **A table:** each kind of item (the war's own leave, a bid, a one-man input, a group input, medical, OD/course,
   duties and commitments, ALL / ALL AVAIL) × each page → what you can do there and how (drag, tap, which window).
4. **The group input:** how a change to one man of it works on each page — and whether "Change for Cutter only"
   belongs, everywhere or nowhere.
5. **Time:** AM / PM / whole day on the war against custom times in an input — one model, or why two.
6. **What it changes** from today and from his rulings (each named), and what of the combined-row job it keeps, changes
   or drops.
7. **Cost, risk and an order to build it in** — the smallest first step that removes the most confusion.
8. **What to draw for him** — the three to six screens that would show the design, each in a line.
9. **Questions only he can answer** — each with when it happens in real life, your recommendation, and why.
