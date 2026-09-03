# Leave types, half-days and the type legend — design

Owner ask, 10 Aug 26. Brainstormed and agreed the same day. This is build ONE
of two; editing an input from the week or the board is build two and gets its
own spec.

## The problem behind the ask

The squadron books far more kinds of absence than the app understands.
`INPUT_TYPES` held eleven entries and the engine reasoned about them with five
hand-written regexes. The only distinction it drew between one absence and
another was `isLocalLeave` (LL + OIL), used in exactly two places to decide
whether a man may still stand an SC SPARE.

Everything else was one flat axis: away, or not away. That is wrong in three
ways the squadron actually cares about.

- **Grounded is not the same as absent.** A man on `ATT B` may not fly but is
  at his desk and can stand a duty, sit a sim or take a ground slot. The old
  engine closed every slot equally, so it could not express him at all.
- **Local is not the same as available to stand by.** The owner's rule is
  local-yes / overseas-no for a spare, but four local medical codes must also
  be barred: on the island, not fit to walk.
- **A day is not the smallest unit.** Half the absences a squadron books are
  mornings and afternoons, and the app only had all-day or a hand-typed time
  range that the availability layer ignored anyway.

## The shape of the answer

**One table, `INPUT_META`, replaces `LEAVE_TYPES`, `INPUT_TYPES` and the five
regexes as the source of truth.** Every predicate becomes a lookup; the type
list is derived from the table's keys; the legend popup is generated from the
same table. That last point is the argument for the shape: a legend built from
the rules cannot drift from the rules, and this app has already been bitten by
two copies of one regex drifting apart (`inputs.ts:39-46`, the comment on the
Unavailable / Personal split).

Fields: `name`, `grp` (`leave | med | duty | act`), `work`, `local`, `ground`,
`half`.

Spare eligibility is **derived, not stored**: `canSpare = local && grp!=='med'`.
That is the owner's rule stated once, in the words he used, with medical as its
single carve-out — rather than a twenty-row column somebody has to keep true.

### The type table

Order below OIL follows the owner's own list. `Meeting` and `Fly` were not in
it and keep their place among the activity types.

| Type | Reads as | Group | Can work | Can spare | Local | → Ground | AM/PM |
|---|---|---|---|---|---|---|---|
| LL | Local leave | leave | no | yes | yes | no | yes |
| OL | Overseas leave | leave | no | no | **no** | no | yes |
| OIL | Off in lieu | leave | no | yes | yes | no | yes |
| OFF | Off — no leave counter | leave | no | yes | yes | no | yes |
| CCL | Childcare leave | leave | no | yes | yes | no | yes |
| PL | Paternity leave | leave | no | yes | yes | no | yes |
| FCL | Family care leave | leave | no | yes | yes | no | yes |
| EL | Embarkation leave | leave | no | yes | yes | no | yes |
| CL | Compassionate leave (3 Sep 26) | leave | no | yes | yes | no | yes |
| HL | Hospitalisation leave | med | no | **no** | yes | no | yes |
| OML | Ordinary medical leave | med | no | **no** | yes | no | yes |
| ATT C | Medically down — cannot report to work | med | no | **no** | yes | no | yes |
| ATT B | Medically down — no flying, can work | med | **YES** | **no** | yes | no | yes |
| Training | Training | act | no | yes | yes | yes | no |
| CSE | Course | act | no | yes | yes | yes | no |
| Meeting | Meeting | act | no | yes | yes | yes | no |
| Fly | Flying with another squadron | act | no | yes | yes | yes | no |
| Personal | Personal | act | no | yes | yes | yes | no |
| Appointment | Appointment | act | no | yes | yes | yes | no |
| OD | Overseas duty | duty | no | **no** | **no** | no | no |
| Other | Other | act | no | yes | yes | yes | no |

- **Can work** — within the input's hours, may he take a non-flying tasking?
  Only `ATT B`. Nobody may fly within their hours.
- **Can spare** — derived, as above. The owner confirmed the activity types may
  spare (10 Aug 26); `Other` follows its siblings.
- **Local** — the wording of the warning, and the flag the AVALON rule will
  read when the owner specifies it.
- **→ Ground** — may a scheduler promote it onto the day's Ground Programme.

`Downchit` and `Detachment` are **removed** (owner, 10 Aug 26). OML / ATT B /
ATT C carry the medical meaning; OD carries the overseas one.

## Decisions taken with the owner, 10 Aug 26

| Question | Answer |
|---|---|
| Do the activity types still wait for a scheduler before blocking? | **No** — every type blocks the moment it is entered |
| Does `→ Ground` survive? | **Yes**, for the activity types, on top of blocking |
| Keep the plain `Downchit` type? | **No** |
| Is `OFF` admin-only to enter? | **No** — anyone may pick it |
| Which types get AM / PM? | **Leave and medical only** |
| May the activity types stand a spare? | **Yes** |

**Reserved by the owner, do NOT infer: the AVALON spare rule.** He said it
follows "the same modality" as the SC spare and will specify it separately.
The rule is therefore written against "a standalone spare", with SC the only
kind enforced today, so his answer drops in without re-cutting anything.

## The two Inputs blocks stay presentational

`html.ts:767` draws a `Personal Inputs` block (edit mode only) and `:770` an
`Unavailable` block; `board-html.ts:318`/`:328` mirror them. `isUnavail` /
`isPersonal` keep exactly that job and keep partitioning the type list.

What changes is the **validator gate**, `inputFlags`. It used to be
`isUnavail(type) || acc==='u' || (isFly && acc==='g' && allday)`, which is why
an un-actioned Training blocked nothing. It becomes *every input counts*, with
the one existing carve-out kept: an input promoted to a Ground row carrying
real times defers to that row, so a clash is not printed twice.

That is the whole of "they all go in automatically", and it leaves the screen
layout untouched. Considered and rejected: collapsing the two blocks into one.
It would have deleted the `→ Ground` promotion the owner explicitly kept.

## Half-days

AM = 04:00–12:00, PM = 12:01–23:59, default All Day. Stored as the `s`/`e`
minutes the record already had, plus a `half:'am'|'pm'` marker so the editor
round-trips and a row can read `Local leave (AM)`. **The engine reads only
`s`/`e`** — `half` is a label, never a rule.

The validator was already time-aware (`events.ts:166` carries the window into
`day.input`; `validate.ts` overlaps it). The **availability layer was not**:
`dayOff` dropped a man for the whole day and the slot bar matched on date
alone. Without fixing that, a half-day would flag correctly and still empty the
man out of the crew palette — the feature would look broken while being right.

Three changes, detailed in the plan:

1. `awayAllDay(inp)` — true when `allday` is set **or** either of `s`/`e` is
   missing. Thin records fail closed; a `{person, type}` row with no times is
   real and must not read as a zero-length absence.
2. `slotRules` gains `slotStart`/`slotEnd` for every key kind, read off the
   same rows and padded the same way `collectEvents` does, so the picker and
   the warning list cannot disagree. **`null` means UNKNOWN, never FREE.**
3. `dayOff` narrows to whole-day absences; timed ones join the per-wave
   overlap `availByWave` already runs for tasking.

### Two consequences, named deliberately

- **A morning leave does not free a lunchtime take-off.** The flying window is
  padded to the step time, because that is what the validator judges against.
  Monday's first wave takes off 12:40 and steps at 11:40, so a man on AM leave
  to 12:00 stays barred — correctly; he cannot be walking to the jet at 11:40.
  If that is ever unwanted, the lever is the AM boundary or the step padding,
  not a picker rule that disagrees with the warning list.
- **The day-info "off" count no longer includes a half-day absentee.**
  Defensible — he is not off for the day — but it is a number on screen.

### Deferred deliberately

An AVALON shift runs 19:00–07:00 and its tail belongs to tomorrow, so
tomorrow's leave should bar it. `slotBar` already rolls back a day for the SC
check and mirroring it is four lines — but the validator does not do this
either, so adding it here alone would make the picker stricter than the
warning list. Left out, logged in `HANDOFF.md`.

## The legend

A button beside the Type field opens an anchored popover, reusing the pattern
already on this page (`#inRangeBtn` / `.inrange-pop`): local state,
mousedown-outside close, `aria-expanded`, phone fallback. Content generated
from `INPUT_META`, grouped Leave / Medical / Other, each row the code, the full
name and its one-line rule.

`legendHTML()` in `html.ts` is **not** touched — it is in the byte-compare
parity set. This is a new builder that happens to share a word.

The twenty-entry type dropdown gets `<optgroup>`s on the same three groups, in
all three places it is rendered.

## Reference parity

`refwin.ts` pushes the port's seed inputs into the reference, which does not
know the new type words. One patch in the existing house idiom, with a count
assertion, teaches the reference that `OML`/`ATT C` read as its `Downchit` and
`OD` as its `Detachment`. Those three are fully-closed types on both sides, so
it is a pure rename and nothing diverges.

Every away-typed seed input is `allday:true`, so on today's data the
availability changes collapse to current behaviour exactly. That is the
argument they cannot move the suite — verified, not assumed.

## Process

HEAVY, per `CLAUDE.md`: this changes the validation engine and the availability
layer, where a defect is silent rather than obvious.
