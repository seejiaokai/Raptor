# `[ALL-AVAIL-AS-MEMBER]` — the design note: his idea and his answers (11 Oct 26)

**What this is:** the short note the plan is written from (`.claude/rules/doc-structure.md` — a tier-3 document, linked
from its backlog item, `OUTSTANDING.md` `[ALL-AVAIL-AS-MEMBER]`). It holds what he asked for, what he has answered and
what is still his to say. Nothing is built; the plan comes next, on `claude/all-avail-as-member`.

## 1. The idea, and why

On a shared input's row an ALL AVAIL (or ALL) puck is kept, underneath, with the first man filed, and comes off with
him when he leaves the input (D745). He saw it step by step (the pictures:
`raptor-port/docs/img/handpass/2026-10-11-group-input-one-row/aa-story/`) and asked why it must be tied to a man at
all. His idea: *"What if the several people allows all avail/all pucks to be selected. Will it solve the problem to
become 1 behaviour."* — ALL AVAIL becomes one of the input's OWN people, with a record of its own, tied to no man:

- a puck dropped on the one row adds it to the input, a puck taken off takes it out — as for a named man (D734), from
  the schedule and from the input's window alike;
- nobody's leaving touches it; its OIL record and the scheduler's switch-offs are filed with it, so nothing has to be
  carried from one man to another (his second question, *"what if u keep the existing different OIL choice selection
  to be the same?"*, is answered by the idea itself).

**His ruling — D750:** *"leave it for now, plan idea 1 after the merge"*. The shared-row job merged on 11 Oct 26 (pull
request #490); until this is built the puck behaves as D745 says.

## 2. His answers — D753 (*"1. Yes. 2. Yes single day only 3 as recommended."*)

| The choice | His answer |
|---|---|
| OIL for the men behind the puck | They follow the OIL answer given for the input — Yes for everyone or No for everyone — and the scheduler may still switch any one man in OIL Earn. |
| An input that runs several days | ALL AVAIL / ALL is offered in "Several people" only where the input is a single day; on a longer one the picker says why. |
| ALL and ALL AVAIL together | No — an input takes one or the other. |

**The agent's readings of them, told to him:** "the answer given for the input" is the one whoever filed it gave for
everyone (D660, D682), never one man's own changed answer (D744); where nobody has answered, nobody behind the puck
earns and the question goes to the filer's bell (D711 (4)). The kinds stay the six an ALL AVAIL input takes today
(D712, D713).

## 3. Still his — put to him, not ruled

**A ONE-person request's row.** He asked: *"If a scheduler drops an all avail on a single input. Does it work the same
as an input that had all avail selected in the first place?"* Today it does not:

| | An input filed FOR ALL AVAIL | ALL AVAIL dropped by the scheduler on one man's request row |
|---|---|---|
| Whose it is | the input's own — nobody is named | the scheduler's addition on the schedule; the input is still the one man's |
| Where it shows | the Inputs calendar and the schedule | the schedule only |
| OIL for the men behind it | follows the filer's answer (D711 (1)) | earns by default (D43, D46) |
| When it goes | when the input is deleted or taken off | with the row, when the man's request goes |

A second NAMED man the scheduler puts on a one-person request's row is the scheduler's addition in the same way (D18,
D470) — only on a SHARED input's row are the pucks the input's people (D734). So leaving the one-person row alone is
consistent with how named men behave there; making the dropped puck part of the input would, by the same reasoning,
ask the same of a dropped man, which changes D18 and D470. **Recommended to him: leave the one-person row as it is in
this job.**

**Asked of Fable on his word, 11 Oct 26** — *"Ask fable. Should we make it consistent like anything the scheduler changes
on the scheduler after that input is filed will reflect the schedule and input the same thing?"* Fable's answer, whole:
`raptor-port/docs/superpowers/briefs/2026-10-11-reads/all-avail-member-consistency-fable.md`. **Its advice: leave the
one-person row as it is in this job.** What the scheduler TYPES on any request's row already changes the input (D740,
D742), and everyone on a SHARED row is the input's (D734); making a puck dropped on a ONE-person request join it would
turn the member's own request into a shared input he filed — the man or the crowd added would then earn only on the
member's own OIL answer (today they earn by default: D18, D43, D46, D470), the member could lose the power to change
his own request while "members file for others" is off, a name could no longer be swapped in the row's name box
(D470), and a man added to a several-day request would be on every day of it. A cheap middle it offers: the input's
card SAYS who the scheduler put beside it ("on the programme with: …") — a display only, its own small job. **Put to
him with the host's own view (the same); NOT ruled yet.**

**His reply — D754 (11 Oct 26):** *"I don't care how it is currently. Don't take the easy way out. I want it to be
intuitive and it make sense for workflow and less bugs and also similar behaviour so with that what do y think should be
the way"* — the advice above weighed the wrong thing (how little changes). The question is re-answered for him on those
four tests; what he then rules is §5.

## 4. What the plan must settle (the builder's, not his)

- The rule "a placeholder is filed on its own — never a group member" (`raptor-port/src/engine/inputs.ts
  placeholderProblem`, rule (c); the save boundary's `placeholder-input-shape` check) is lifted for a single-day shared
  input, and every reader of an input's people learns that one of them may be nobody: the bells, the clash checks and
  who counts as busy, the names and the count on the Inputs calendar and list, each man's own OIL answer, the person
  filter, the late mark, who may change the input.
- A man named in the input is never also counted behind its puck (he would earn twice).
- Which record is the one row's first when the puck was picked first.
- What happens to an ALL AVAIL already standing on a shared row under D745 when this ships — demo data only (D56), so
  no conversion; say so.
- It is OIL and the published day: an important plan (two readers — D590; ChatGPT is back on 14 Oct 26) and a FULL check.

## 5. The direction put to him after D754 — ONE RULE (11 Oct 26; NOT ruled yet)

**Recommended by the agent on his four tests (intuitive, the workflow, fewer bugs, the same behaviour):** a row that came
from an input IS the input, and whoever is on the row is in the input — whoever put them there, a named person or ALL
AVAIL / ALL, an input that began with one person or with several. Candidate B of Fable's report, with what must come
with it so nothing happens silently:

1. OIL is one answer per input; everyone on the row follows it and the scheduler may switch any one person. Adding
   someone where the question is unanswered asks the scheduler on the spot; where the answer is No, the note says they
   are not counted.
2. A swap stays: a man dropped on the only man's puck replaces him, and the input becomes the new man's.
3. The member is told by his bell when the scheduler adds people to his request, swaps him out or changes it
   (`OUTSTANDING.md` `[INPUT-CHANGED-TELL]` rides with this job). He may always withdraw himself; changing it for
   everyone, once the scheduler has added others, is the scheduler's.
4. Where it cannot apply the drop is refused with the reason: ALL AVAIL on an input longer than a day or of another
   kind (D753); other people on a Personal input.

**Told to him as its cost:** it changes earlier rulings — a person or ALL AVAIL the scheduler adds under a request
earns by default today (D18, D43, D46, D470) and would follow the input's answer; a person added to a several-day
input is on every day of it; it is one bigger job (a plan, two readers, a FULL check), built as ONE job and not as
"shared inputs first, the rest later".

**A test the plan must carry — his question, 11 Oct 26:** *"will an input that has all avail vs an inital input that
has just a person and an all avail was put on it and the inital person removed show the same in schedule and input?"*
**Under the one rule: yes, and the plan pins it** — two routes to the same people give the same row, the same card on
the Inputs calendar and the same OIL rule. What may differ is history only: the change history's lines, when it was
first filed (the late mark's stamp) and the OIL answer already given. Who is named as having placed it once the
original person is out is the builder's to settle so that the two behave alike (recommended: it passes to the
scheduler who made the change, so its bell and its OIL question go to someone still involved).
