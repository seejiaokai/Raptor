# Design practices — the one guide for interface work

**What this is (owner, D812, 13 Oct 26 — "Can u combine all of the good practices together"):** the good interface
practices taken from three outside design skills, written in our own words and bounded by his rulings, in ONE place.
No outside skill is installed whole (D486, D491, D623). It is used **automatically**: `.claude/rules/ui-design.md`
loads by itself whenever an interface file is opened and points here; and the design skill (`/impeccable`) reads the
product record `PRODUCT.md`, which names this guide. It is written FIRST and the interface jobs after it are judged
against it — the calendar's design included (D813).

**Open it before** designing, restyling, wording or reviewing anything a person sees — a screen, a window, a note, a
button's label — and before a look-and-feel review. It does not replace `ui-contracts.md` (how each surface behaves and
its measured sizes) or `performance.md` (what may never be slowed): it is the judgement that sits on top of them.

## 0. What wins when two rules meet

1. **His rulings** — always. The ones that bound almost every design choice:
   - **the buttons keep their size** (D487) — nothing here makes a control bigger or smaller without his word;
   - **the Raptor look stays** (D765) — dark, dense, its colours each carrying a meaning (§4);
   - **a working screen stays dense** (D688, D696, D653) — "sleek" here is fewer words and fewer boxes, never more
     empty space;
   - **the screens are not wordy** (D726), and a note the screen already says may simply go (D808);
   - **never at a cost of speed** (D765; `performance.md` Part 1) — an effect that costs a frame on his phone is not taken;
   - **a visual change is a picture to him first** (D541), on the real app at his phone's size and a desktop's.
2. **The measured contracts** — `ui-contracts.md` and the stylesheets ("measured contracts, not preferences").
3. **This guide.**
4. The design skill's own defaults.

A practice below that meets one of his rulings carries the ruling beside it. A finding against a look he approved from
a picture is put to him, never "fixed".

## 1. Words on screen

*From the writing guide of `jakubkrehel/skills`; his D726, D806, D808.*

- **Every word earns its place or goes.** Delete what the screen already shows (a hint that repeats its own label, a
  count the list makes obvious). Three ends for any note, shown to him before and after: **shortened**, **removed**,
  or **moved under one short "How it works" fold** for that page — as the two calendars have (D628, D646).
- **A passing note has one of three shapes:** "Saving…" → "Saved" → "Not saved — <what to do>". What happened, then the
  ONE thing he must know. The day or the person is named once. Never "successfully", never "please", no exclamation.
- **No warning is dropped to save words.** A note that carries a consequence (a published day will earn nobody OIL;
  unpublishing takes its OIL off the Leave War) keeps the consequence, said shorter.
- **An error says how to put it right, beside where it went wrong** — "Enter a time as 08:00", not "Invalid time". A
  refused press is never silent, and says why in the app's own words.
- **A button starts with its verb and names its object where two could be confused:** "Put back", "Don't file",
  "Delete counter" — never "OK" / "Yes" / "No" on a choice. (The app's bare "OK" on a bar that only closes is fine.)
- **A question names what will happen**, not "Are you sure?" — and **Undo beats a question** where the thing can be
  undone (D677, D792: delete at once, Undo brings it back). Ask only where it cannot be undone, touches other people,
  or removes many things at once.
- **One name for one thing, everywhere.** If the button says "Unpublish", the note does not say "withdrawn". Name
  things as the screen already does (the app's own words: the schedule, the working copy, an amendment, an input).
- **A switch is labelled for what ON does.** A link or a fold says where it leads ("How this works"), never "Click here".
- **An empty place says one short thing and offers one button** — what this is, and how to fill it.
- **Sentence case; one capitalisation rule for each kind of element.** The app's small-capitals headings and its
  capitals on puck-row buttons are part of the Raptor look and stay.

## 2. Keyboard and focus

*From the accessibility guide of `jakubkrehel/skills` (the ARIA practices' table); his D544–D555, D597, D732.*

**The test for anything new: can it be opened, used and closed without a mouse, and can the person always see where
they are?** A design is not finished until its keyboard set is written down beside its picture.

| The thing | What the keys must do |
|---|---|
| A window, sheet or question | Tab and Shift+Tab go round INSIDE it; Escape closes it; when it closes, the keyboard goes back to the button that opened it (or the nearest sensible place if that is gone) |
| Anything opened over something else | **Escape closes what opened last** — the calendar before the window behind it (as the date calendar does) |
| A set of tabs, a toolbar, a row of choices | ONE Tab stop for the set; arrow keys move within it; Home and End jump to the ends |
| A menu button | Enter, Space or ↓ opens it on its first item; arrows move; Escape closes and returns to the button |
| A fold ("How this works", a section) | its heading is a real button; Enter and Space open and close it; it says whether it is open |
| A list to pick from | arrows move the choice; Enter picks; one Tab stop |
| A date calendar | arrows by day and week; Page Up / Down by month; Home / End to the week's ends; Enter or Space picks; a way to today; a way to clear where a date may be empty |
| A text box | Enter and Escape keep the meanings the schedule gives them (D544, D732); Tab follows the ruled route on the schedule (D554, D555) |
| A dangerous question | the keyboard starts on the SAFE answer |

- **Focus is always visible** — never remove the outline without drawing a clear one in its place, and check it against
  every colour it crosses.
- **Nothing that takes the keyboard may be hidden** under a bar that stays (the top bar, a save band, the bar that waits
  on an OIL answer).
- **Something a mouse can do by hovering or dragging has a keyboard way too**, or is said plainly not to (a drag of a
  puck is the worked exception: the tap-to-arm route is its keyboard and touch way).
- **A control drawn from a picture or a glyph has a spoken name that says what it DOES** — "Take this date off", never
  "cross".

## 3. Layout and grouping

*From the layout guide of `jakubkrehel/skills` and the Apple design skill of 11 Oct 26; his D726, D765, D809.*

- **Group with space and a change of surface before another box.** Most of what reads as clutter is borders: a box
  inside a box inside a window. Let a slightly different background, a heading or a gap carry the grouping; keep a
  line only where it separates two things that could be confused. (Hair-thin lines, never heavy ones.)
- **What can be changed comes first; what only explains comes after** (D809 — the Logic page). Within each, group by
  kind, under a heading a person would use.
- **One main button a view, in the same place every time; the dangerous one apart from it.** A control tapped again
  and again never moves under the finger (D687, the standing rule on repeated taps).
- **Show that more is hidden** — a fold says what is in it; a list that scrolls shows a cut row, not a clean edge.
- **Fold what is rarely needed; never fold what is needed to act.**
- **Order by what matters to the person doing the job**, not by how the code is arranged.
- **Nothing sits over what it is about.** A note, a bar or a floating button never covers the control it describes or
  the buttons that answer it (the phone-on-its-side check of the OIL question; the Leave War's clash note, D805).
- **On a phone, a thing takes the full width or a sensible fraction — never "whatever is left over".**

## 4. Colour and emphasis

*From the Apple design skill; his D765 and the rulings named in the table.*

- **A colour means either "you can press this" or a status — never decoration.** The app's cyan is "press me" (and
  "picked"). Red, amber and green appear only where they mean stop, look, fine.
- **Emphasis by weight or surface before another colour or another box.** If something needs to stand out, make it
  bolder or lift its background a step; a new hue is almost always wrong.
- **What each colour already means in this app — do not spend it on anything else.** The app's own Legend is the full
  list; this is the rulings' short form:

| Colour or mark | It means | Where ruled |
|---|---|---|
| Cyan | a main button; the picked date or tab | the look of record |
| Selection blue | the puck he clicked — nothing else; a clicked warning lights its crew in the WARNING's colours | the product invariants |
| Red ring or box | a clash or a hard breach | the Legend |
| Amber | an advisory; a late input | the Legend; the late-input mark |
| Grey | a long work day — never amber | D751 |
| Dotted | it breaks tomorrow's crew rest | D183 |
| Green edge or ring on a puck | OIL earned that day | D1, D272 |
| Purple fill and ring | "this is you" | D270 |
| Purple right edge | a SANS person | D651 |
| Gold dot | this has a change history (History is on) | D339, D345 |
| The CAT chip's colour | his level — the chip only, never the whole puck | the Legend |
| Olive / green name bars | pilot / WSO | the Leave War's roster rules |
| ORIG's white seal; an AL tag's own colour | a published day; which amendment | D111, D362 |
| Yellow, amber, red wash on the SANS calendar | how many more are needed to fly | D618, D630 |
| Green on a date | a public holiday; on the Leave War, bidding open | D627 |

- **Text must be readable on what it sits on** — check the pair, not the colour alone; a dimmed thing still has to be
  readable if a person needs to read it.

## 5. Motion

*From the Apple design skill and `make-interfaces-feel-better`; his D765 ("never at a cost of speed"), D489.*

- **Quiet and quick:** about 150–240 thousandths of a second, easing out, no bounce.
- **Only movement and fading** — never an effect that lays the page out again. **Never on the week or the board's
  dense grid.** Never on something done many times a minute (moving a puck).
- **Never animate "everything"** — name the properties (the app has no `transition: all`: keep it so).
- **Motion is never the only signal** — the thing that flashed must also read differently afterwards.
- **Off for a reader who asked for less motion.**
- A pressed button may give a little; a sheet slides up; a window grows in; a passing note fades. Each is offered to
  him as a picture or a short clip first, and measured on a phone before it is kept.

## 6. Small polish — check for these

*From `make-interfaces-feel-better`, as narrowed by the review of 2 Oct 26 (D489).*

- **Figures that change or sit in a column keep an equal width** (times, counts, OIL balances), so nothing shifts.
- **A nested rounded corner = the inner corner plus the gap** around it; one scale of corner sizes.
- **Three weights of letter**, used the same way everywhere.
- **Wrap, don't cut** — a title or a name that does not fit goes to a second line and the box grows downward (D367,
  D719, D722); a list never hides who is in it behind "+1" (D721).
- **A touch target a finger can hit — WITHOUT the button looking bigger** (D487): where a control is hard to hit, offer
  a larger invisible area around a button that looks the same. **A control under 44 high is not a finding by
  measurement alone** — the phone's top bar is 30 high on purpose. Only a demonstrated missed tap or an overlap is
  reported.
- **An icon's line is as heavy as the text beside it**; one drawing recoloured for each state, not a drawing per state.
- **His phone is an iPhone, and his PC shows at 125%** — a fit measured only on this PC is not proved for him.

## 7. A technique: every state of one thing on one page

*From the "break" and "state-machine" guides of `jakubkrehel/skills`.*

Before a look at one component — a date calendar, a passing note, a bar, a card — draw it in **every state it can be
in**, side by side, on one throwaway page: empty, filled, the longest name, ten people, an error, disabled, read-only,
a phone's width, a phone on its side, the keyboard on it. Look once; list what broke; stop. The page is made with the
app's own stylesheet (`../../.claude/skills/brainstorming/mockups-on-the-real-app.md`) and thrown away. It finds the
state nobody drew.

## 8. How a look is reported

*From both collections' review formats; the roll-call's "no blank cells" (`bug-check-order.md` §6).*

- **A table of what WAS and what was NOT looked at** — the surfaces, the sizes, the states. No blank cells.
- **Each finding:** the place (the screen, and the file and line where there is one) · the rule broken, by its section
  here · what the person meets · the exact change proposed. With its picture.
- **Three weights:** it misleads, hides how to recover, or cannot be used by keyboard · it is inconsistent or cluttered
  · it is polish.
- A short **"considered and left"** list — and why.
- **Nothing is changed by a look.** Findings go to him, in rounds of at most four with a recommended answer each (D541).

## Where each piece came from

| Source | Licence | What was taken |
|---|---|---|
| `jakubkrehel/skills` (read at the source 13 Oct 26) — the writing, accessibility, layout, "break" and "state-machine" guides | MIT, © Jakub Krehel | §1, §2's table, §3, §7, §8's format — rewritten in our words |
| `jakubkrehel/make-interfaces-feel-better` (read 2 Oct 26 and 13 Oct 26) | MIT, © Jakub Krehel | §5's "never animate everything", §6 — as narrowed by D489 |
| `rukkiecodes/claude-apple-design-system` (read 12 Oct 26 and 13 Oct 26) | MIT | §4's two rules and its one-table idea, §3's "surface before a box", §5's timings, "one main button", "an empty place says one thing" — its light, airy, one-accent look was NOT taken |

**Not taken from any of them:** converting the app's colours, a choice of fonts (the app loads none), animation recipes
for another toolkit, translation rules, phone-app parts, and any program a skill tells an agent to download and run.

**Changing this guide:** it is a working guide — a change is read by a reviewer who did not write it before he approves
it (D70).
