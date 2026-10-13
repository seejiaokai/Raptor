# Design practices — the one guide for interface work

**What this is (owner, D812, 13 Oct 26 — "Can u combine all of the good practices together"):** the good interface
practices taken from three outside design skills, written in our own words and bounded by his rulings, in ONE place.
No outside skill is installed whole (D486, D491, D623). It is written FIRST and the interface jobs after it are judged
against it — the calendar's design included (D813).

**How it is used automatically.** `.claude/rules/ui-design.md` loads by itself whenever a file under `raptor-port/src/`
or a mock-up is opened, and points here. And the design skill has its own record of this app — `PRODUCT.md`, beside this
file, written from his answers (D820; `[SKILL-FUSION-JAKUB]`) — which every `/impeccable` pointed at one of the app's files
prints first, and which names this guide. (The app is declared a project of its own in `.impeccable/config.json`, so the
skill asks for a target inside `raptor-port/` rather than reporting that no record exists. The skill's OTHER record, of the
look itself — `DESIGN.md` — is not written: `OUTSTANDING.md` `[UI-SLEEK-PASS]` step 1.)

**The design skill itself is used without being asked for** (owner D819, 13 Oct 26 — and the guide approved as drafted): for a design job — a new screen or
control, a restyle, a look over something built, a pass over a page's words, a mock-up — the agent invokes `impeccable`
with the command that fits (`shape`, `critique`, `audit`, `clarify`, `distill`, `polish`), on top of this guide. Not for a
small code change that merely sits in an interface file: the skill's detector already runs after every interface edit.

**Open it before** designing, restyling, wording or reviewing anything a person sees — a screen, a window, a note, a
button's label — and before a look-and-feel review. It does not replace `ui-contracts.md` (how each surface behaves and
its measured sizes) or `performance.md` (what may never be slowed): it is the judgement that sits on top of them.

*(D805–D809, D812 and D813 were recorded on the Inputs batch's branch, pull request 497; their rows reach this branch
when that one is live.)*

## 0. What wins when two rules meet

1. **His rulings** — always. The ones that bound almost every design choice:
   - **the buttons keep their size** (D487) — nothing here makes a control bigger or smaller without his word;
   - **the Raptor look stays** (D765) — dark, dense, its colours each carrying a meaning (§4);
   - **cleaner, in the way Apple's interfaces are, and intuitive enough to need few instructions** (D821 — "placement of
     buttons and everything just makes sense"): Apple's CLEANLINESS — fewer boxes and lines, a clear order of
     importance, the same thing in the same place on every screen — never its light colours, its one accent or its
     empty space;
   - **a scheduler's screen is designed for the desktop first** and must still serve a small correction on a phone; **a
     member's screen for the phone first**; and a scheduler's screen is judged by efficiency — fewer steps (D820);
   - **a working screen stays dense** (D812; first said of the Inputs pages — D688, D696, D653) — "sleek" here is fewer
     words and fewer boxes, never more empty space;
   - **the screens are not wordy** (D726), and a note the screen already says may go (D808) — **but nothing already on
     screen is reworded or removed on this guide's word alone: each change is put to him before and after** (D726, D808);
   - **never at a cost of speed** (D765; `performance.md` Part 1) — an effect that costs a frame on his phone is not taken;
   - **a visual change is a picture to him first** (D541), on the real app at his phone's size and a desktop's.
2. **The measured contracts** — `ui-contracts.md`, the stylesheets ("measured contracts, not preferences") and the
   product invariants of `raptor-port/CLAUDE.md` (pucks never wrap; sim notes stay one line; the login page stays simple).
3. **This guide.**
4. The design skill's own defaults.

A practice below that meets one of his rulings carries the ruling beside it. A finding against a look he approved from
a picture is put to him, never "fixed".

## 1. Words on screen

*From the writing guide of `jakubkrehel/skills` and the Apple design skill (a note for what is done, a question only for
a choice; an empty place says one thing); his D726, D806, D808.*

**§1, §1a and §1b together are THE WRITING GUIDE (owner D833, 13 Oct 26):** what each kind of text says (here), how
text already on screen is shortened (§1a), and how the app speaks (§1b). It is used every time text in the app is
written or changed.

- **Every word earns its place or goes.** What the screen already shows is a candidate to go (a hint that repeats its
  own label, a count the list makes obvious). Three ends for any note, each put to him before and after: **shortened**,
  **removed**, or **moved under one short "How this works" fold** for that page — as the two calendars have (D628, D646).
- **A passing note says one of three things:** it is happening ("Saving…"), it is done ("Saved"), or it failed and what
  to do ("Not saved — keep this page open"). What happened, then the ONE thing he must know. The day or the person is
  named once. Never "successfully", never "please", no exclamation. That is for a NEW note; one already on screen
  keeps every fact it carries (§1a, D825).
- **No warning is dropped to save words.** A note that carries a consequence (a published day will earn nobody OIL;
  unpublishing takes its OIL off the Leave War) keeps the consequence, said shorter.
- **An error says how to put it right, beside where it went wrong** — the form that WILL work, not only the one that did
  not: "Enter a time as 08:00", not "Invalid time". A
  refused press is never silent, and says why in the app's own words.
- **A button starts with its verb and names its object where two could be confused:** "Put back", "Don't file",
  "Delete counter" — never a bare "OK" / "Yes" / "No" under a question that does not itself say what will happen.
  **Ruled and staying:** the OIL question's "Yes · FO / HO", "No", "Yes to all", "No to all" (D782), and the bare "OK" on
  a bar that only closes.
- **A done thing gets a passing note, never a window; a window asks only where he must CHOOSE** (the OIL question). A
  "sure?" question names what will happen, not "Are you sure?" — and **Undo beats it** where the thing can be undone
  (D792; the counter's cross in Rearrange, D677). Ask "sure?" only where it cannot be undone, touches other people, or
  removes many things at once. **Left as ruled, never a finding:** "Delete counter" in the counter's own window still
  asks "Really delete?" (D677).
- **One name for one thing, everywhere.** If the button says "Unpublish", the note does not say "withdrawn". Name
  things as the screen already does (the app's own words: the schedule, the working copy, an amendment, an input).
- **A word that is both a thing and an action** (input, file, post, mark, record, report, amend) **keeps the small
  word that settles which is meant** — in a new label as in a shortened note ("File the input", "an input was filed").
- **A switch is labelled for what ON does.** A link or a fold says where it leads ("How this works"), never "Click here".
- **An empty place says one short thing and offers one button** — what this is, and how to fill it.
- **No joke and no chatty word in a note people see often** — it wears out by the third time.
- **Sentence case; one capitalisation rule for each kind of element.** The app's small-capitals headings and its
  capitals on puck-row buttons are part of the Raptor look and stay.

### 1a. Shortening words already on screen — the method (D832)

*His D825 (13 Oct 26 — "some of them I feel like the key words are gone. Too summarised"), that day's own lessons, and the
outside guides read then — Microsoft's and Apple's writing guides, Nielsen Norman on error messages, one UX-writing
checklist, Anthropic's document skill (`superpowers/briefs/2026-10-13-writing-skills-research.md`). Written as TESTS:
"be concise" names no test, and an instruction with no test is how facts get cut.*

**ITS STANDING USE (owner D833, 13 Oct 26):** the writing guide — §1 above, this method and §1b on how the app speaks — is
a companion to this design guide and to the design skill, used EVERY time text in the app is written or changed, new
text as well as old: the Logic page's wording (D809), the whole-app words pass (D808), every note, label, hint and
question. Its aim, in his words: "intuitive clean simple smooth less verbose more human text with less -" — fewer
dashes among them (the agent's reading of "less -"). The wordings he approved on 13 Oct 26 (D827, D829, D830) are
rechecked against the finished guide and put to him again before any of them is built.

**Shorter is never thinner.** Shortening takes out words; summarising takes out facts. Before a word is touched, name
what the note must still say afterwards — **the protected list: what happened · why · what it costs · where to put it
right · every name and every number.** This is the method for the first of §1's three ends — a note that stays and gets
shorter. Removing a note or folding it is §1's own decision, put to him as such.

1. **Measure the box before the words.** A note that "runs long" is first measured where it sits, at the smallest size
   the app ships: the box's width against the screen's, and how many lines it takes. The box and the words are reported
   as two separate findings — the box is often the cheaper fix (13 Oct 26: every passing note was half a phone's width).
   A wording pass that never measured the box says so in its report.
2. **A word is cut only if the note states the same facts without it (D825).** Four kinds nearly always pass: a padding
   phrase with a shorter equal ("in order to" → "to") · a thing said twice in the same note (the day named once, D806 —
   and if the mention dropped carried more than the one kept, a date, "show the cut" says so) · an announcement or a
   courtesy ("Heads up", "Note that", "please") · an intensifier or a hedge ("very", "just", "quite", "actually"). A
   fifth passes only by proof — a helper word round a fact ("it is", "it has been", "now") — when the cold read (9)
   gives the same answers. **Two things are never filler: a phrase that carries a clause's verb ("is covered", "will not
   earn"), and the word that links two facts (so, because, but, until)** — the link IS the why or the cost, and it is
   never traded for a dash or a colon (§1b test 2). Anything else is content and stays.
3. **Swap before you delete.** The first move is a shorter phrase that means the same; taking a word out is the second.
4. **The fact keeps its subject and its verb.** Never telegram style: "no times — no OIL from it" lost WHAT had no times
   and WHO earns nothing. A helper word after the fact may be trimmed ("so it has been cleared" → "so it was cleared");
   the thing the note is about, what it did, and the small words that make it a sentence (the, a, that, who, to, from,
   is) may not go.
5. **A named thing is never traded for "it", "this" or a vaguer word.** A note is read alone, later, with nothing beside it.
6. **A word that is both a thing and an action keeps its small word** — the rule is §1's, for new labels too.
7. **"Your" goes only where it carries nothing** — "your row", set against someone else's, is a fact. ("We" is never
   the app's word: §1b test 7.)
8. **Show the change.** Each one is put to him as three things: today's wording · the new one · the exact words cut,
   added or swapped — each cut with its kind (one of the four, or the fifth with its proof), each mark replaced with
   the word that replaced it. A cut that fits no kind is not made.
9. **Read it cold — by someone else.** Each new wording is given ALONE to a fresh reader — a helper started for it,
   never the chat that wrote it (13 Oct 26: the writer, knowing what was meant, could not see that "anything added later
   too" could be read as the opposite of what it replaced). The reader writes down: what happened, why, what does it
   cost, where do I put it right, and can any part be read two ways? — then restates every claim of the note in their
   own words, each named thing and number included. The writer sets those answers beside the original's, claim by
   claim; one that differs, or a second reading, is a lost fact and the wording goes back.
10. **"Left whole" is a proper result.** A note that cannot lose a word without losing a fact is left as it is (D825) —
    and, where it is still hard to read, the same words split into two sentences or a headline with its detail under
    it, no word lost, is offered to him as a change of its own, with its picture (D541). Never done unasked.
11. **A word count is never a target.** A length is only a sanity check — a warning of fifteen words is not wordy.

### 1b. How the app speaks (D833)

*His D833 (13 Oct 26 — "intuitive clean simple smooth less verbose more human text with less -"; and "U can use skill or
guides online to help you design and shape this … And reviews on what's good"), and the outside guides read at their
source that day — GOV.UK's writing guidelines, Google's Material content guide, Apple's writing page, Microsoft's and
Atlassian's voice pages, the US plain-language guide, Nielsen Norman's tone study and its piece on expert readers
(`superpowers/briefs/2026-10-13-ux-writing-guides-research.md`, with what cuts against each). For NEW text, and for any
text being changed. Written as tests, like §1a.*

**The voice, in one line:** the app speaks as a capable colleague on the scheduling desk would — it tells you what
happened, what it means for you and what to do, in a sentence a person would say. Calm, exact, brief. Not a form
("Operation completed"), not a telegram ("Published — no times — no OIL"), not a mate ("All done!").

**When the aims pull apart, this order (the agent's reading of D833 beside D825 — his to correct):** every fact first
(§1a's protected list); then a sentence a person would say; then as short as those two allow. A sentence that reads
like speech may be a word or two LONGER than the clipped one it replaces. It is taken when it reads faster, and the
change shows the words added as well as the words cut (§1a test 8).

1. **Say it aloud.** Read the wording out as if to the person it is for, across the desk. A wording nobody would say
   that way is rewritten until somebody would.
2. **Two thoughts are joined by a word or a full stop — not by a mark** (his "less -"). Where two thoughts meet, name
   what the mark stands for — and, so, because, but, until, then — and write that word, or end the sentence. The link
   is a fact (§1a test 2): a dash leaves the reader to guess it. This is the long dash first, and its cousins doing the
   same job: the semicolon (often misread), the middle dot between clauses, the slash for "and" or "or", brackets round
   an afterthought, a colon doing a dash's work. **A mark stays where it joins no thoughts:** a hyphen inside a word; a
   range as the app prints it; the dot or slash between the ITEMS of a label, a chip or a row ("ALL AVAIL · 27",
   "Yes · FO / HO"); a colon after a label that names what follows. **A wording he has ruled keeps its marks until he
   says** ("Not saved — keep this page open", D587; "Not swapped — OIL not answered", D783): §0 — nothing on screen is
   reworded on this guide's word alone.
3. **One thought a sentence, and what happened comes first** — then what it means for the person, then what to do. A
   sentence past about 25 words usually holds two thoughts: a sign to look, never a limit (§1a test 11).
4. **A sentence has its verb; one done thing may be two words.** "Saved", "Monday published", "Note hidden" are how a
   person says a single done thing. The moment a note carries a second fact — a reason, a cost, an instruction — it is
   written as sentences, each with its subject and its verb (§1a test 4).
5. **The squadron's words stay; everyday words for the rest.** OIL, AL, CX, SANS, FO, HO, crew rest, brief, take-off
   are the reader's own trade: never explained, never swapped for a plainer word. Everything else takes the short
   common word — "needs", not "requires"; "before", not "prior to"; "shows", not "is displayed" — and a verb rather than
   a noun made from one ("publishing reissues the Original", not "publication results in a reissue"). The present
   tense for what is true now. Never a builder's word (the product bar: the words read as a finished product).
6. **Say what is, and what will work.** "Publish the day first", not "Changes can't be published on an unpublished
   day". Never two negatives in one sentence. Contractions as people say them ("can't", "don't", "isn't") — but where
   "not" is the whole point of a warning it is written out and stands beside its verb: "will not earn OIL".
7. **The person is "you"; the app is nobody.** "You" and "your" where the person acts or owns the thing. Never "we",
   "I", "our" or "the system". When another person did it, name them ("Saber took over Tuesday"). When the app did it,
   say what happened to the thing ("The 07:30 brief was cleared") — a passive is right there, and better than an
   invented actor. No "please", "sorry" or "oops" (§1), and no blame: "Enter a time as 08:00", never "You entered an
   invalid time".
8. **One steady voice, plainer as the stakes rise.** A success and a refusal are said in the same calm way. A cost is
   stated as a fact, in the plainest sentence of the note, neither dressed up nor softened: "Nobody on it earns OIL."
   No capitals to stress a word inside a note ("APPROVED"), no exclamation mark, no alarm word ("Warning!", "Heads up")
   — the app's colours already say stop, look, fine (§4). Exact before friendly: no cheer, no joke (§1). (The small
   capitals of headings and puck-row buttons are the Raptor look, not stress — §1.)
9. **A pair speaks as a pair; a family speaks alike.** The on-note and the off-note of one switch are the same sentence
   turned round ("Line is SPARE …" / "Line is MAIN …"). Every refusal of one kind starts the same way ("Only a
   scheduler can …"). Before writing a note, find its nearest relatives in the app and match their shape — or change
   them together, put to him as one.
10. **A name that needs no hint.** A button is named for what it will do, and the note after it, the bell and the
    change history use that same word (§1). A thing is named by what the person sees or does, never by how it is
    built. Before a new name is coined, look for one the app already uses (the screens; the word list when
    `[WORD-LIST]` is written). A label that needs a hint to be understood is rewritten before the hint is (§3's test).
11. **Checked by someone else.** A new wording that carries a reason, a cost or an instruction gets §1a test 9's cold
    read: the writer first lists the facts it must carry; a fresh reader, given the wording alone, answers the same
    questions; the two are compared. A label, or a note of one done thing, needs only test 1.

**Three of the app's notes, as this guide would say them** — to show the tests at work; the wordings of record are the
ones he approves:

| On screen on 13 Oct 26 | As the guide would say it | What changed |
|---|---|---|
| The 07:30 brief was after the new take-off, so it has been cleared | The 07:30 brief was after the new take-off, so it was cleared. | "has been" → "was"; the link "so" stays |
| Nothing on this day earns OIL — anything added later is covered too | Nothing on this day earns OIL, and nothing added to it later will. | the dash → "and"; the second thought keeps a verb of its own |
| This week is locked — it was published by an older version and can't be edited | This week is locked. It was published by an older version, so it can't be edited. | the dash → a full stop; "and" → "so", the link the note meant |

## 2. Keyboard and focus

*From the accessibility guide of `jakubkrehel/skills`, which sets out the W3C ARIA practices' keyboard patterns (the
date-calendar row is that practice's date-picker pattern); his D544, D545, D550–D555, D597, D732, D807.*

**The test for anything new: can it be opened, used and closed without a mouse, and can the person always see where
they are?** A design is not finished until its keyboard set is written down beside its picture. **The table says what
NEW work must do; where something already built does less, that is a gap for the keyboard sweep to list (D807) and is
built on his word — it is not a statement that the app does it today.**

| The thing | What the keys must do |
|---|---|
| A window, sheet or question | Tab and Shift+Tab go round INSIDE it; Escape closes it; when it closes, the keyboard goes back to the button that opened it (or the nearest sensible place if that is gone) |
| Anything opened over something else | **Escape closes what opened last** — the calendar before the window behind it (as the date calendar does) |
| A set of tabs, a toolbar, a row of choices | ONE Tab stop for the set; arrow keys move within it; Home and End jump to the ends |
| A menu button | Enter, Space or ↓ opens it on its first item; arrows move; Escape closes and returns to the button |
| A fold ("How this works", a section) | its heading is a real button; Enter and Space open and close it; it says whether it is open |
| A list to pick from | arrows move the choice; Enter picks; one Tab stop |
| A date calendar | arrows by day and week; Page Up / Down by month; Enter or Space picks; a way to today; Home / End to the week's ends (**not built in today's calendar — a gap for the sweep**); a way to clear ON THE BOX where a date may be empty (the calendar itself has none — D796) |
| A text box | Enter and Escape keep the meanings the schedule gives them (D544, D732); Tab follows the ruled route on the schedule (D554, D555) |
| A dangerous question | the keyboard starts on the SAFE answer |

- **Focus is always visible** — never remove the outline without drawing a clear one in its place, and check it against
  every colour it crosses.
- **Nothing that takes the keyboard may be hidden** under a bar that stays (the top bar, a save band, the bar that waits
  on an OIL answer).
- **Something a mouse can do by hovering or dragging has a keyboard way too**, or is said plainly not to. (A drag of a
  puck: tap-to-arm is its touch way; whether a keyboard can arm one is for the keyboard sweep to say — D807.)
- **A control drawn from a picture or a glyph has a spoken name that says what it DOES** — "Take this date off", never
  "cross".

## 3. Layout and grouping

*From the layout guide of `jakubkrehel/skills` and the Apple design skill of 11 Oct 26 (emphasis before another box; one
main button; hair-thin lines); his D726, D765, D809.*

**The test for any screen (D821): could someone use it without reading its hint?** A screen that needs an instruction is
a design not yet clear. Put the design right first — where the control sits, what it is called, what it sits beside —
and only then shorten, remove or fold the instruction (§1), each change shown to him before and after.

- **Group with the space already there and a change of surface before another box — never added height on a working
  screen** (§0: D688, D696). Most of what reads as clutter is borders: a box inside a box inside a window. Let a
  slightly different background or a heading carry the grouping; keep a line only where it separates two things that
  could be confused. (Hair-thin lines, never heavy ones.)
- **On the Logic page, what can be changed comes first and what only explains comes after**, each grouped by kind under a
  heading a person would use (D809). Elsewhere that arrangement is offered as a picture, not assumed.
- **One main button a view, in the same place every time; the dangerous one apart from it.** A control tapped again
  and again never moves under the finger (D687, the standing rule on repeated taps).
- **Show that more is hidden** — a fold says what is in it; a list that scrolls shows a cut row, not a clean edge.
- **Fold what is rarely needed; never fold what is needed to act.**
- **Order by what matters to the person doing the job**, not by how the code is arranged.
- **Nothing sits over what it is about.** A note, a bar or a floating button never covers the control it describes or
  the buttons that answer it (the phone-on-its-side check of the OIL question; the Leave War's clash note, D805).
- **On a phone, a thing takes the full width or a sensible fraction — never "whatever is left over"** (D805).

## 4. Colour and emphasis

*From the Apple design skill (a colour is "press me" or a status; emphasis by surface or weight; one table of what the
status colours mean); his D765 and the rulings named in the table.*

**For new work.** The app today spends more hues than this section would; bringing that down is `[UI-SLEEK-PASS]`'s, as
pictures to him — a look does not report each instance, and nothing is recoloured as a side effect.

- **A colour means either "you can press this" or a status — never decoration.** The app's cyan is "press me" (and
  "picked"). **On a ring, a box, a flag or a note, red, amber and green mean stop, look, fine.** The other things that
  wear those hues are in the table below and keep them.
- **Emphasis by weight or surface before another colour or another box.** If something needs to stand out, make it
  bolder or lift its background a step; a new hue is almost always wrong.
- **What each colour already means in this app — do not spend it on anything else.** The app's Legend names the pucks'
  fills, the CAT chips and the flags; the rest are ruled where this table says. **Neither is the whole list — a colour
  not found here is not free: search the stylesheets' named colours before spending one.**

| Colour or mark | It means | Where from |
|---|---|---|
| Cyan (the app's one accent) | a main button; the picked date or tab; today's date; the focus outline; the picked-up look of a drag | the stylesheets |
| Selection blue | the puck he clicked (a fill, never a ring) — a clicked warning lights its crew in the WARNING's colours, never this blue; and the box round a thing just added, for about six seconds | the product invariants; owner, 14 Aug 26 |
| Olive / dark green / white fill of a puck (and the Leave War's name bars) | pilot / WSO / ground crew | the Legend |
| The CAT chip's colour (among them an amber B, a red A, a cyan C) | his level — the chip only, never the whole puck | the Legend |
| Red ring or box | a clash or a hard breach | the Legend |
| Amber ring, flag or word | an advisory; a late input; on the Leave War, the note of clashes with the schedule | the Legend; the late-input mark |
| Grey ring or flag | a note-level item — the long work day; never amber | D751 |
| Dotted | it breaks tomorrow's crew rest | D183 |
| Green edge or ring on a puck | OIL earned that day | D1, D272 |
| Purple fill and ring | "this is you" | D270 |
| Purple right edge | a SANS person | D651 |
| Gold dot | this has a change history (History is on) | D339, D345 |
| ORIG's white seal | a published day | D110, D111 |
| An AL tag's colour | which amendment — AL8 and later share AL7's orange and the number tells them apart | D362 |
| Green on the picked week button; the Leave War's live period | the week or period in hand | the stylesheets |
| Yellow, amber, red wash on the SANS calendar | how many more are needed to fly | D618, D630 |
| Green on a date | a public holiday (an Off day is light grey) | D627 |
| A green outline round the Leave War's dates | bidding is open | owner, 1 Sep 26 |
| Orange on a Leave War day | no leave that day | the Leave War's event types |

- **Text must be readable on what it sits on** — check the pair, not the colour alone; a dimmed thing still has to be
  readable if a person needs to read it. A contrast finding on a look he chose (the SANS calendar's soft washes, D630)
  goes to him with the small step first — never strengthened quietly.

## 5. Motion

*From the Apple design skill and `make-interfaces-feel-better`; his D765 ("never at a cost of speed"), D489.*

**These rules are for NEW motion.** The motion already in the app that he asked for stays as measured — the box round a
new thing and its fade, the picked-up look and landing flash of a drag, a new flag's flash, the board sliding up; a look
does not report them.

- **Quiet and quick:** about 150–240 thousandths of a second, easing out, no bounce.
- **Only movement and fading** — never an effect that lays the page out again. **Nothing new on the week or the board's
  dense grid.** Never on something done many times a minute (typing, tapping a puck).
- **Never animate "everything"** — name the properties (the app has no `transition: all`: keep it so).
- **Motion is never the only signal** — the thing that flashed must also read differently afterwards.
- **Off for a reader who asked for less motion.**
- A pressed button may give a little; a sheet slides up; a window grows in; a passing note fades. Each is offered to
  him as a picture or a short clip first, and measured on a phone before it is kept.

## 6. Small polish — check for these

*From `make-interfaces-feel-better`, as narrowed by the review of 2 Oct 26 (D489); the Apple design skill (three weights,
one scale of corner); his rulings on wrapping.*

**For new work.** The app today uses more letter weights and corner sizes than this; bringing them down is
`[UI-SLEEK-PASS]`'s, as pictures to him — a look does not report each instance and nothing is re-weighted as a side effect.

- **Figures that change or sit in a column keep an equal width** (times, counts, OIL balances), so nothing shifts.
- **A nested rounded corner = the inner corner plus the gap** around it; one scale of corner sizes.
- **Three weights of letter**, used the same way everywhere.
- **Wrap, don't cut** — a title or a name that does not fit goes to a second line and the box grows downward, on a
  callsign cell, an input's card and a list (D367, D719); a list never hides who is in it behind "+1" (D721). **Never a
  puck and never a sim note: pucks never wrap and sim notes stay one line (the product invariants).**
- **A touch target a finger can hit — WITHOUT the button looking bigger** (D487): where a control is hard to hit, offer
  a larger invisible area around a button that looks the same — never one that overlaps its neighbour (the top bar's
  would). **A control under 44 high is not a finding by measurement alone** — the phone's top bar is 30 high on
  purpose. Only a demonstrated missed tap or an overlap is reported.
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
- **Each finding:** the place — the screen, in the app's own words (the file and line go in the evidence sheet for the
  next agent, never in what he reads) · the rule broken, by its section here · what the person meets · the exact change
  proposed. With its picture.
- **Three weights:** it misleads, hides how to recover, or cannot be used by keyboard · it is inconsistent or cluttered
  · it is polish.
- A short **"considered and left"** list — and why.
- **What a machine recorded reaches the report by count, not by recollection:** every gap a key-by-key or measured
  record holds is on the page by its number, or under "considered and left" with its reason; the report states both
  counts — the record's gaps and the page's — and a script compares them, never the eye (13 Oct 26: a gap in the key
  record was reasoned away and left off the page; a second reader found it).
- **Nothing is changed by a look.** Findings go to him, in rounds of at most four with a recommended answer each (D541).

## Where each piece came from

| Source | Licence | What was taken |
|---|---|---|
| `jakubkrehel/skills` (read at the source 13 Oct 26) — the writing, accessibility, layout, "break" and "state-machine" guides | MIT, © Jakub Krehel | §1, §2's table (itself the W3C ARIA practices' patterns), §3, §7, §8's format — rewritten in our words |
| `jakubkrehel/make-interfaces-feel-better` (read 2 Oct 26 and 13 Oct 26) | MIT, © Jakub Krehel | §5's "never animate everything", §6's figures, corners and touch target — as narrowed by D489; its rules on icons were NOT taken |
| `rukkiecodes/claude-apple-design-system` (read 12 Oct 26 and 13 Oct 26) | MIT, © 2026 rukkiecodes | §4's two rules and its one-table idea; §3's "surface before a box", "one main button", hair-thin lines; §1's "a note for what is done, a question only for a choice" and "an empty place says one thing"; §5's timings; §6's three weights and one corner scale; §8's "place, rule, fix" — its light, airy, one-accent look was NOT taken |
| The outside writing guides read 13 Oct 26 — Microsoft's and Apple's writing guides, Nielsen Norman Group (error messages; the tone study; expert readers), GOV.UK's writing guidelines, Google's Material content guide, Atlassian's and Mailchimp's voice pages, the US plain-language guide, one UX-writing checklist, Anthropic's document skill | each publisher's own — read, nothing copied | §1a's tests and §1b, in our words. What was read, what reviewers say of each, what cuts against and what was NOT taken: `superpowers/briefs/2026-10-13-writing-skills-research.md` and `…-ux-writing-guides-research.md` |

**Not taken from any of them:** converting the app's colours, a choice of fonts (the app loads none), icon rules,
animation recipes for another toolkit, translation rules, phone-app parts, and any program a skill tells an agent to
download and run.

**Changing this guide:** it is a working guide — a change is read before he approves it, one round each and never by
its writer: by Astra and Sol 6.1 (D70, D590). This first draft: one fresh, blind Opus reader while the ChatGPT readers
are out (D812; D810's precedent), written on the list of jobs that went without a ChatGPT reader (D761) — its report:
`superpowers/briefs/2026-10-13-design-guide-read.md`.
