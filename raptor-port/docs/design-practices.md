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
   - **no mark glows** (D880–D882, D887) — a mark is a line, edge or fill in its colour; a dark shadow that lifts a thing is depth, not a glow (§4);
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
   - **a visual change is a picture to him first** (D541), on the real app at his phone's size and a desktop's — **and
     whatever is put to him about a design or interface change, a question, a suggestion, a finding or a recommendation
     to delete, comes with a picture or mock-up in which the area talked about is marked, never words alone** (D853,
     14 Oct 26 — "Always show me a picture or mock up highlighting the area u are talking about"): the area outlined and
     enlarged where it is small; before beside after where a change is proposed. **And when only explaining** what a backlog
     item or a leftover is and where it sits — pictures the first time it is raised (D921, 15 Oct 26 — "Always show me pictures").
2. **The measured contracts** — `ui-contracts.md`, the stylesheets ("measured contracts, not preferences") and the
   product invariants of `raptor-port/CLAUDE.md` (pucks never wrap; sim notes stay one line; the login page stays simple).
3. **This guide.**
4. The design skill's own defaults.

A practice below that meets one of his rulings carries the ruling beside it. A finding against a look he approved from
a picture is put to him, never "fixed".

**When he corrects a design, three things follow without his asking, in any chat, whatever the job in hand (owner D852,
14 Oct 26 — "I want u to automatically note how I’m trying to redesign the app to make it like what I intend it to be,
clean. Intuitive. Ask me if I want the skills design to be updated and also u can suggest somewhere else … that can be
improved that is similar to this new design implementation").** A correction is his saying that something a person sees
— built, drawn or proposed — should look, read or behave differently. A plain yes or no to a picture put to him is not
one, and neither is an instruction about the work itself.

1. **The correction is noted with the point behind it.** It is recorded as a ruling at once
   (`../../.claude/rules/record-decisions.md`); its row says the particular fix and, in one line, the point behind it:
   what it says about the app he intends — clean, intuitive (D821).
2. **The lesson is written into this guide by itself, the same day — a line in §9, his design lessons (owner D941,
   16 Oct 26 — "1-5 as recommended": "the design guide learns from my suggestions", D939).** One line: the lesson in
   terms of the app he intends, its date and its ruling. One fresh reader — never the chat that wrote it — checks that the
   line says what he meant; he is not asked first. The closing report names every lesson added, and he may strike or
   change any. Where the correction only brings a screen back to what he had already ruled, it teaches nothing new: no line
   is written, and the closing report names the correction so he can ask for one. A lesson that narrows a rule already in this guide says so
   in its line, and that rule gets a short pointer to it, checked by the same fresh reader as part of the lesson. (Until 16 Oct 26 he was asked each time and the line was read and
   approved as any change to this guide is — D852, D70; the rest of the guide, apart from a lesson's line and its pointer, still changes that way.)
3. **Other places the same improvement would apply are named** — at most four, from what the chat already knows, each
   with what would change; if it knows of none it says so and does not go looking. They are suggestions: nothing is
   changed unasked, and one he takes up is drawn for him before it is built (D541). The list is filed with the
   whole-app pass (`OUTSTANDING.md` `[UI-SLEEK-PASS]`), where the fuller one belongs (D808, D765).

(The three things are his words. How each is done — at once, at most four, a picture first — and that the suggesting is
a duty where he wrote "u can", began as the agent's reading; he approved the paragraph as written, D855, 14 Oct 26 —
"Approve both". The second step's way of being done is his D941, 16 Oct 26.)

## 1. Words on screen

*From the writing guide of `jakubkrehel/skills` and the Apple design skill (a note, never a window, for what is done —
narrowed by his D850; a question only for a choice; an empty place says one thing); his D726, D806, D808, D846, D850.*

**§1, §1a and §1b together are THE WRITING GUIDE (owner D833, 13 Oct 26):** what each kind of text says (here), how
text already on screen is shortened (§1a), and how the app speaks (§1b). It is used every time text in the app is
written or changed. **Its wider use (owner D835, 13 Oct 26 — "Perhaps after we have developed a great skill to use. We could
adopt it for how we communicate too? And write"):** a direction he raised, not yet a change. The agent's reading, his
to correct: once he has approved the guide, the part that fits prose is drafted into
`../../.claude/rules/plain-language.md` for how the agent writes to him and for what it writes for him to read, read
by the guide's readers and put to him — adopted only on his word. Until then that rule governs every message to him
as it stands.

- **Every word earns its place or goes.** What the screen already shows is a candidate to go (a hint that repeats its
  own label, a count the list makes obvious). Three ends for any note, each put to him before and after: **shortened**,
  **removed**, or **moved under one short "How this works" fold** for that page — as the two calendars have (D628, D646).
- **Text that only explains what the screen already makes plain is recommended for deletion (owner D846, 14 Oct 26 —
  "these are the examples of things u can delete and they are self explanatory").** His two examples, both on the OIL
  question: the small print under its answers ("The credit lands on the Leave War as an HO cell and moves the OIL
  balance. Hours count start to finish for the day, so published work the same day can raise the credit.") and the hint
  beside its waiting button ("Choose an option above"). **The three tests began as the agent's reading of
  those two examples; he approved the rule as written here (D847, 14 Oct 26 — "approve").** A text that meets any one of
  them is a delete candidate:
  1. **It says what the screen beside it already says or shows** — a hint to choose an answer beside a button that
     already waits, greyed, under the answers; a line under a heading that repeats the heading; a count the list makes
     obvious.
  2. **It explains how the app works, and he can act rightly without it** — where a credit lands, how hours are
     counted, on a question whose answers already say what each one does. Whoever needs it meets it where the result
     shows.
  3. **It is a hint or small print that reads the same every time, on something he opens many times a day** — read
     once, then only in the way. A label, a heading, a question's own sentence, an empty place's one line and a state
     the screen reports are not hints.
  **Never a delete candidate:** a warning of what a press will cost ("No warning is dropped to save words", below),
  above all a consequence he cannot see on the screen and cannot take back; why a press was refused, and the way to
  put an error right; an instruction for a gesture nothing on screen suggests (whole again since D942); the word that tells two like controls
  apart; what a colour or a mark means (the Legend); and text he opens in order to read how the app works (a "How this
  works" fold, the Logic page). **Every look names its delete candidates (§8), and a deletion is still put to him
  first, never made by the look:** the text, its picture with and without it, every fact (if any) that would leave the
  screen with it, and the ruling where he ruled that wording. Where a fact that would leave matters and shows nowhere
  else, the recommendation is to move it (the fold, or the place the result shows), not to delete it. New text that
  would meet one of the tests is not written (the agent's reading).
- **Feedback is designed into the screen first; a passing note is only for what the screen does not make plain (owner
  D850, 14 Oct 26 — "When there is a feedback, design it and also don’t need to have a note for very single thing. Only
  important ones that are not intuitive or complicated.").** **Everything below began as the agent's reading of those
  words; he approved it as written here (D855, 14 Oct 26 — "Approve both").** When a press succeeds and the screen itself shows that it happened, that is the feedback, and no
  note says it again:
  - a thing added to a list — a row, a card, a line — appears where it belongs, in view, wearing the app's one
    just-added mark (§4: the plain selection-blue ring for about six seconds, the same look everywhere), as a row just
    added on the Scheduler Board does;
  - a changed value shows changed;
  - a removed thing is gone, and Undo brings it back.

  **"In view" is D672's:** wholly on screen, clear of the top bar and of any window or sheet over it. A note is raised
  only where:
  1. **the screen does not show that it happened** — the result, or part of it, is on another day or page, off the
     screen, behind a filter or a window; it left the app (a file, the printer, a report sent); it takes effect
     later; or the screen looks the same after the press as before — a Save on a form that stays open, a press that
     changed nothing ("Already in order", "Nothing to undo");
  2. **the press did more, or less, than he would expect of it** — something he did not touch changed or went with
     it, in view or not ("The 07:30 brief was after the new take-off, so it was removed"); an OIL credit moved; other
     people are issued something (a day published or unpublished); part of what he asked was left out; Undo cannot
     take it back (D350); or a warning goes with it ("No warning is dropped", below). What the press plainly does to
     the people he picked is not this: an input filed for three people is one input he can see;
  3. **it failed or was refused** — never silent: a failure says how to put it right, a refusal says why (the two
     points below), beside where it went wrong where there is such a place.

  This point leaves the signs of saving as they are: the passing "Saving…" and the "Not saved — keep this page open"
  band (D587).
  **The mark is feedback, not decoration.** It is the app's own mark, never a new one; §5's limits hold — none added on
  the week or the board's dense grid, none on something done many times a minute: there the changed thing is the
  feedback. For a reader who asked for less motion it still shows, steady, and goes without its fade. A screen reader
  is told the same thing in words, whether or not a note is on screen. The keyboard stays where §2 puts it — back on
  the button that opened the window — and is not moved to the new thing.
  **For a new action, its feedback is designed with it and drawn in its picture (D541):** what changes, where the eye
  lands, the mark, what a screen reader is told and where the keyboard is left. Only then is a note weighed against
  the three cases. **A note already built that none of the three cases covers is a delete candidate** (the point
  above; listed in every look, §8) — put to him with the picture of what shows the result once the note is gone, never
  deleted on this guide's word alone.
- **Where a passing note is raised at all (the point on feedback above, D850), it says one of three things:** it is happening ("Saving…"), it is done ("Saved"), or it failed and what
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
- **A done thing never gets a window, and it gets a passing note only where the point on feedback above calls for one
  (D850). A window asks only where he must CHOOSE** (the OIL question). A
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
question. Its aim, in his words: "intuitive clean simple smooth less verbose more human text with less -" — the long
dash (confirmed by D834). The wordings he approved on 13 Oct 26 (D827, D829, D830) are rechecked against the finished
guide and put to him again before any of them is built.

**Shorter is never thinner.** Shortening takes out words; summarising takes out facts. Before a word is touched, name
what the note must still say afterwards — **the protected list: what happened · why · what it costs · where to put it
right · every name and every number.** This is the method for the first of §1's three ends — a note that stays and gets
shorter. Removing a note or folding it is §1's own decision, put to him as such.

1. **Measure the box before the words.** A note that "runs long" is first measured where it sits, at the smallest size
   the app ships: the box's width against the screen's, and how many lines it takes. The box and the words are reported
   as two separate findings — the box is often the cheaper fix (13 Oct 26: every passing note was half a phone's width).
   A wording pass that never measured the box says so in its report.
2. **A word is cut only if the note states the same facts without it (D825).** Four kinds nearly always pass: a padding
   phrase with a shorter equal ("in order to" → "to") · a thing said twice in the same note — the day named once
   (D806), keeping the fuller mention: a date the dropped one carried moves to the one kept ("Monday 13 Jul
   published"), so no number is lost · an announcement or a courtesy ("Heads up", "Note that", "please") · an
   intensifier or a hedge ("very", "just", "quite", "actually"). A fifth passes only by proof — a helper word beside a
   verb that stays ("has been cleared" → "was cleared"; "now"; an "again" the verb already says) — when the cold read
   (9) gives the same answers. A clause's own subject and verb are never the helper: "it is a draft again" keeps "it
   is" (4). **Two things are never filler: a phrase that carries a clause's verb ("has no usable times", "will not earn"), and
   the word that links two facts (and, so, because, but, until, then)** — the link IS the why or the cost, and it is
   never traded for a dash or a colon (§1b test 2). Anything else is content and stays.
3. **Swap before you delete.** The first move is a shorter phrase that means the same; taking a word out is the second.
   A swap keeps every name, number and qualifier of the phrase it replaces — "usable" in "no usable times",
   "unpublished" in "unpublished edits", "credits" in "OIL credits". A word that goes inside a swap is a cut: it takes
   a kind (8) and is shown as cut. A clause may become a phrase only as a swap shown as one, when the cold read (9)
   gives the same answers ("anything added later is covered too" → "including anything added later").
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
   the word or mark that replaced it, each word ADDED with how it is known to be true (§1b's "no fact is added"). A
   cut that fits no kind is not made.
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

### 1b. How the app speaks (D833, D834)

*His D833 (13 Oct 26 — "intuitive clean simple smooth less verbose more human text with less -"; and "U can use skill or
guides online to help you design and shape this … And reviews on what's good"), his D834 on the dash, and the outside
guides read that day — Google's, Apple's and Atlassian's word for word in a browser; GOV.UK's, Microsoft's, Mailchimp's,
the US plain-language guide and Nielsen Norman's two pieces through a fetch tool's account of each page
(`superpowers/briefs/2026-10-13-ux-writing-guides-research.md` marks which, and what cuts against each). For NEW text,
and for any text being changed. Written as tests, like §1a.*

**The voice, in one line:** the app speaks as a capable colleague on the scheduling desk would — it tells you what
happened, what it means for you and what to do, in a sentence a person would say. Calm, exact, brief. Not a form
("Operation completed"), not a telegram ("Published — no times — no OIL"), not a mate ("All done!").

**When the aims pull apart, this order (approved by him — D836, 14 Oct 26, "All approved as recommended"; it narrows
D806's "fewest words" and D726 by a word or two where speech reads better):** every fact first (§1a's
protected list); then a sentence a person would say; then as short as those two allow. A sentence that reads like
speech may be a word or two LONGER than the clipped one it replaces. It is taken when the cold reader (test 11) gets
every fact in one reading; the change shows the words added as well as the words cut (§1a test 8); and a wording that
ends longer than the one on screen today is marked "longer", with both word counts, where it is put to him — a longer
one is his to take, never built as a shortening. **No fact is added either:** a rewording claims nothing today's
wording does not — a link word, an actor ("you"), a second half to match its pair — unless what the app does was
checked and the claim is shown under "added".

1. **Say it aloud.** Read the wording out as if to the person it is for, across the desk. Three checks, each written
   down: every sentence has its subject and verb, or is one done thing (test 4); it still reads aloud with every dash,
   semicolon, middle dot, slash and bracket left out — where it breaks, test 2 chooses the join; and no word a person
   would not say across a desk ("per", "via", "prior to", "utilise", "is displayed", a string of three nouns that is
   not one of the app's own names). One that passes and still reads stiff goes to the cold reader
   with "would you say this?" (test 11).
2. **A dash is not how the app joins two thoughts** (his D833 "less -"; D834, 13 Oct 26 — "dash feels very AI. Humans
   don't usually write like that. Maybe : might be used … if u want to use - for some cases u can too if it makes
   sense").
   **Two shapes take no link word.** (a) A note that opens on one done thing in a word or two — something happened:
   published, hidden, added, removed, left (test 4): a full stop where what follows is a sentence ("Monday unpublished.
   It is a draft again."; "LATE mark hidden. The Inputs page still shows it."), a colon where it is not ("Warning
   hidden: no flag, not counted"); two done things make one lead with "and" ("Monday 13 Jul published and approved").
   (b) What to do after a fact (test 3): the instruction is its own sentence ("Nothing on this day earns. Turn that
   off first.").
   **Otherwise, take the first of these that is TRUE of the two parts:**
   - **a link** — so, because, but, until, then, and: write that word. The link is a fact (§1a test 2), and the writer
     does not guess it: it is read from where the app raises the note (what was pressed, what the app then did), and
     the change shows the word with how it is known. Where it cannot be told, the two parts become two sentences in
     the same order, and the cold reader writes down which link they supplied. A second part that only says what the
     first MEANS is not a "so". "And" is a link only where the second part adds a second fact about the same thing,
     said in one breath ("It is a draft again, and publishing reissues the Original"); it is never the default join.
   - **the second part is a name or a noun phrase for the thing named just before it** ("HO, half a day of OIL"; "Sat
     18 Jul, a non-working day"): a comma.
   - **the first part is only a name** — a mode, a layout, a switch, a box: it says nothing happened ("Desktop layout:
     …", "Red box: …"); **or the second part is not a sentence of its own and only spells the first one out** ("Line is
     SPARE now: standing by, checked for availability and currency only"): a colon. Never a colon where "so" or
     "because" is meant — it hides the link as the dash did.
   - **a new thought** — each part could stand as a sentence and no link word is true: a full stop.
   - **a dash, where none of those reads as well** — a choice, named in the change (§1a test 8), never a habit; no more
     than one in a note.

   The semicolon, and the middle dot where either part is a sentence with its subject and verb, go through the same
   order. **A mark stays where it joins no thoughts:** the middle dot between facts none of which is a sentence, in a
   note as in a row ("Published AL2 · 3 items on Monday only · approved by Saber", "ALL AVAIL · 27"); a slash where
   the screen or the squadron writes the pair as one name ("weekend/PH", "F/O/A", "Yes · FO / HO") — any other slash in
   running words becomes "or" or "and"; brackets that say what the word before them covers ("a non-working day
   (weekend/PH)") — an afterthought goes into the sentence; a hyphen inside a word; a range as the app prints it. **A
   wording he has ruled with a dash in it may stay** ("Not saved — keep this page open", D587; "Not swapped — OIL not
   answered", D783): it is listed for him with this guide's wording beside it, his to take or leave (D754), never
   changed unasked (§0). The wordings approved on 13 Oct 26 (D827, D829, D830) are not these — D833 and D834 send them
   back through this test before they are built.
3. **What happened comes first** — then what it means for the person, then what to do — in a new note; a note already
   on screen keeps its order unless the new order is put to him as a change of its own. A sentence holds one thought,
   or two joined by their link word (test 2). One past about 25 words usually holds more: a sign to look, never a
   limit (§1a test 11).
4. **A sentence has its verb; one done thing may be two words.** "Saved", "Monday published", "Note hidden" are how a
   person says a single done thing — and they stay that way at the head of a longer note; test 2 says what follows the
   head (a full stop before a sentence, a colon before a phrase). A fact that follows as its own sentence — a reason,
   a cost, an instruction — has its subject and its verb (§1a test 4); one that follows a colon may be a phrase. A
   note may open on its bare subject as a log line does ("Line is SPARE now", "Note is scheduler-only again"); inside
   the sentence the small words stay. **A note of one sentence takes no full stop, as most of the app's notes do
   today; a note of two or more ends each with one, the last included** — a two-word head counts as a sentence, a part
   after a colon or a comma does not, a question keeps its question mark, and a button or a link after a sentence
   takes none. Where the app joins two notes as it shows them (the publish note and the day's OIL warning), the join
   adds the full stops, so each note shown alone still has none. Text read as prose — the Logic page, a "How this
   works" fold, a window's paragraph — ends every sentence with one.
5. **The squadron's words and the app's own names stay; everyday words for the rest.** OIL, AL, CX, SANS, FO, HO, LL,
   PH, crew rest, brief, take-off, currency, and the names the screens already print (the Original, the working copy,
   pending, issued, MAIN, SPARE, ALL AVAIL — §1's one name for one thing) are examples, not the whole list: a word the
   app's screens or the squadron's own papers already use stays, and in doubt it stays and is listed for him. They are
   never swapped for a plainer word and not explained in a passing note; a question whose answer turns on one may say
   it once, as the OIL question does ("HO, half a day of OIL" — D830), and an explanation already on screen is content
   and stays unless its removal is put to him (§1a). Everything else takes the short common word — "needs", not
   "requires"; "before", not "prior to"; "shows", not "is displayed" — and a verb rather than a noun made from one
   ("publishing reissues the Original", not "publication results in a reissue"). The present tense for what is true
   now. Never a builder's word (the product bar: the words read as a finished product).
6. **Say what is, and what will work — with the reason, never in its place** (§1: a refused press says why). "Monday
   is still a draft. Publish the day first, then its changes.", not "Changes can't be published on an unpublished
   day". Never a double negative — two negatives on one verb ("can't not", "not unanswered"); two plain negatives side
   by side are fine ("no flag, not counted"). Contractions as people say them ("can't", "don't", "isn't") — but where
   "not" is the whole point of a warning it is written out and stands beside its verb: "will not earn OIL".
7. **The person is "you"; the app is nobody.** "You" and "your" where the person acts or owns the thing. Never "we",
   "I", "our" or "the system". When another person did it, name them ("Saber took over Tuesday"). When the app did it,
   say what happened to the thing ("The 07:30 brief was cleared") — a passive is right there, and better than an
   invented actor. No "please", "sorry" or "oops" (§1), and no blame: "Enter a time as 08:00", never "You entered an
   invalid time".
8. **One steady voice, plainer as the stakes rise.** A success and a refusal are said in the same calm way. A cost is
   stated as a fact, in the plainest sentence of the note, neither dressed up nor softened: "Nobody on it earns OIL."
   No capitals to stress a word inside a note ("WARNING: …", "NO OIL"), no exclamation mark, no alarm word ("Warning!",
   "Heads up") — the app's colours already say stop, look, fine (§4). A name the screen itself prints in capitals
   (MAIN, SPARE, ALL AVAIL, LATE, ORIG) keeps them in a note: that is its name, not stress. A state said as an ordinary word of its sentence is not a name:
   "Monday published and approved", though the day's panel prints APPROVED. Exact before friendly: no
   cheer, no joke (§1). (The small capitals of headings and puck-row buttons are the Raptor look, not stress — §1.)
9. **A pair speaks as a pair; a family speaks alike.** The on-note and the off-note of one switch are the same sentence
   turned round ("Line is SPARE …" / "Line is MAIN …") — the same words with the state changed; it never gives one
   side a claim today's wording does not make, and where one side carries more (a cost the other lacks) the difference
   is put to him, not evened out. Every refusal of one kind starts the same way ("Only a scheduler can …"). Before
   writing a note, find its nearest relatives in the app and match their shape — or change them together, put to him
   as one. Where the relatives are wordings he has ruled, the new one takes their shape, marks included, and a change
   to the family's marks is put to him as one change.
10. **A name that needs no hint.** A button is named for what it will do, and the note after it, the bell and the
    change history use that same word (§1). A thing is named by what the person sees or does, never by how it is
    built. Before a new name is coined, look for one the app already uses (the screens; the word list when
    `[WORD-LIST]` is written). A label that needs a hint to be understood is rewritten before the hint is (§3's test).
11. **Checked by someone else.** A new wording that carries a reason, a cost or an instruction gets §1a test 9's cold
    read: the writer first lists the facts it must carry; a fresh reader, given the wording alone, answers the same
    questions; the two are compared. A label, or a note of one done thing, needs only test 1.
12. **None of the habits that mark machine-written text** (the `blader/humanizer` skill he sent on 13 Oct 26, read in
    full; itself drawn from Wikipedia's "Signs of AI writing"). They matter most in longer text — the Logic page's
    explanations (D809), a "How this works" fold — and each is a default nobody chose. **Rewritten on one sighting:**
    the dash as the all-purpose join (test 2) · an opener that announces instead of saying ("Heads up", "Quick note",
    "Note that" — test 8, §1a test 2) · a "not X, but Y" frame where nobody thought X, also split over two sentences
    ("This is not X. It is Y.") or left as a clipped tail ("…, no guessing") · a closing line that only repeats the
    point just made · an objection answered that nobody raised ("To be clear", "This is not to say"). **One alone can
    be a person's choice; two in one text is a rewrite:** things listed in threes for the sound of it · a longer verb
    where "is" or "has" will do ("serves as", "features", "offers") · an "-ing" tail bolted onto a fact to make it
    sound deeper ("…, ensuring everyone sees the same day") · the stock words (crucial, pivotal, robust, seamless,
    enhance, additionally, simply, "key" as an adjective) · a bold label and a colon on every line of a list · a line
    about how the text or the app was made instead of what it is for. **These rules of the tool are NOT applied to the
    app's text, because this guide rules the other way:** against the passive and the missing subject (test 7 keeps
    "The 07:30 brief was cleared" and never invents "the system"; test 4 keeps "Saved", "Note hidden") · against
    sentences that open alike, and "vary the sentence length" (test 9: a pair and a family are worded alike on
    purpose) · against a row of fragments or a bare negative (a phrase after a colon, and "no flag, not counted", are
    test 2's and test 6's) · on hyphens after a noun (the app's names keep theirs: "scheduler-only", "view-only") · on
    capitals where the capitals are a name (test 8) · against bold, arrows, ticks and symbols where they are a ruled
    look or carry a meaning (§4) · against curly quotation marks (the app prints them on purpose) · its ban on every
    dash (D834 allows one, named) · and its rules for essays and replies — hedges, citations, sales language, chat
    leftovers, knowledge cut-offs. A short sentence that states a cost ("Nobody on it earns OIL.") is a fact, not a
    closer. And its check on any rewrite is this guide's own: nothing added, nothing dropped (§1a tests 8 and 9).

**Three of the app's notes, as this guide would say them** — to show the tests at work; the wordings of record are the
ones he approves:

| On screen on 13 Oct 26 | As the guide would say it | What changed |
|---|---|---|
| That input was removed while its window was open — the window has closed | That input was removed while its window was open, so the window has closed | the dash → "so", a link the words themselves give; one word longer than today |
| Desktop layout — pan sideways to read the whole day | Desktop layout: pan sideways to read the whole day | the dash → a colon ("Desktop layout" is only a name); no word cut |
| This week is locked — it was published by an older version and can't be edited | This week is locked. It was published by an older version of the app, so it can't be edited. | the dash → a full stop; "and" → "so", a link ADDED and checked in the app (the week is locked because an older version of the app published it); "of the app" ADDED ("an older version" read as an older version of the schedule); four words longer than today |

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
| A date calendar | arrows by day and week; Page Up / Down by month; Enter or Space picks; a way to today; Home / End to the week's ends (built 14 Oct 26 with Shift + Page for a year — the sweep's K1, K2: D830); a way to clear ON THE BOX where a date may be empty (the calendar itself has none — D796) |
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
- **A page's controls are one row (owner D907, D910, D911; the wording approved D926 — 15 Oct 26).** The page's row is the first row under the
  app's top bar and under the tabs that switch between pages (Inputs · SANS · Medical) — those two are not the page's
  row. The buttons that belong to the page in view — what it adds, the dates or filter it is read by, its settings —
  stand in that one row, at its button height (where the row holds only the page's own buttons, the height of the app's
  other rows of controls: 36 — D698, D912), even when the row holds one button. One or two buttons never take a second
  row of their own. Taking the row's height is this rule's one change of a button's size; any other change of size still
  needs his word (D487). A heading that only repeats the name of the tab already picked above it is a delete candidate
  (§1, D846), put to him with its picture; if it goes, what stood beside it joins the row. **When the row runs out of
  room on the narrowest phone,** a button keeps its size and its place, and its words take a shorter form (the Inputs
  list's dates button, D910) — drawn for him first; if shorter words still do not fit, the layout is drawn and put to
  him — this guide does not choose it. Not the page's own, and not in its row: a window's or a sheet's own buttons
  (they keep their bar — "One main button" below), the controls of one item in a list (its row carries them), and a bar
  the app shows for a while (the "Not saved" warning, the bar that waits for an OIL answer — D587, D840). A fold is not
  a button: where one stands alone on a row, it is put to him (the Edit Schedule's "Legend" stays, D926). The rule holds
  on a phone and a desktop alike; where a desktop page already keeps its buttons in one row, nothing changes there.
- **On the Logic page, what can be changed comes first and what only explains comes after**, each grouped by kind under a
  heading a person would use (D809). Elsewhere that arrangement is offered as a picture, not assumed.
- **One main button a view, in the same place every time; the dangerous one apart from it.** A control tapped again
  and again never moves under the finger (D687, the standing rule on repeated taps) — nor do arrows around words that
  change: the words get their longest value's room (§9, lesson 16 — D1122).
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
| Cyan (the app's one accent) | a main button (a solid fill); the picked date or tab; today's date; the focus outline; the picked-up look of a drag; and, as a pale fill with cyan words and edge, a picked filter chip and the Rearrange button and Show SANS switch while on | the stylesheets; D882 |
| Selection blue | the puck he clicked (a fill, never a ring) — a clicked warning lights its crew in the WARNING's colours, never this blue; and the ring round a thing just added, for about six seconds, with no glow (below) | the product invariants; owner, 14 Aug 26; D860 |
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

- **One mark, one look (owner D860, D861, D854, 15 Oct 26; carried here by D866 — `[GUIDE-ONE-MARK]` — approved D876).** The just-added mark
  looks the same wherever the app wears it: a thing just added, and on the Inputs pages an input just changed or put
  back by Undo (D854). Today that is the Scheduler Board, the Inputs calendar's month and its opened day, and the Inputs
  List. The mark is the plain selection-blue ring, 2px, with no glow, for about six seconds, its last half second a fade
  (steady and without the fade for a reader who asked for less motion, §5). It sits on the edge of the thing added, its
  own box, and leaves outside the controls its row carries for it (a grip, a number, a ✕): a note's own box, not the row
  it sits in; a table's row as one box round the whole row, never one per cell; a line, a row or a wave that IS the
  thing added, round itself; a new block, round its heading and each of its rows. A puck dropped in a seat wears none:
  the puck is the sign (D854). A thing wearing the mark shows no other flash of its own over it; a flash on something
  inside it, such as a puck dropped into a new line or its new flag, belongs to that thing. A new kind of mark is his to
  rule, never a variant of this one. (His words: the board's plain ring with no glow, on the Inputs pages too, and a
  note ringed on its own box, D860; the List's one box and the month's bar with no landing flash, D861; a changed input
  in view wears the mark, and a puck in a seat none, D854. That the ring leaves a row's controls outside, that a line,
  a row or a wave is ringed round itself, that any table's row is one box, that no thing wearing the mark shows another
  flash over it, and that a new kind of mark is his to rule, began as the agent's reading; he approved them as written
  here, D876.)
- **No mark in this app glows (owner D164, D860, D877, D879, D880, D881, D882, D887 — 24 Sep and 15 Oct 26).** A mark the
  app draws to say something about a thing — a ring round a thing picked, highlighted, just added or just landed, the crew
  a tapped warning lights, a puck that earns OIL, his own puck or row, a seat a man can take, an event he can fly next or
  the one a search found, the stripe that says SANS, the box round the days open for bidding, the line where a dragged row
  will land, today's day card, a panel that pops up, a status dot — is a line, edge or fill drawn as it is, its colours
  and a stripe's shading included, with no soft light spreading out from it or into it. Its colour, its width and whether
  it is solid, dashed or dotted carry the meaning; a glow adds none and blurs the edge it marks. A shadow in the mark's own
  colour is a glow, and so is a pale, see-through band of its colour round it, blurred or not (a halo); a solid ring drawn
  as a shadow is a line. The Rearrange button and the Show SANS switch show that they are on by the filter chip's "on"
  look — a pale cyan fill, cyan words and a cyan edge — never by a glow or a halo (D882); a new on/off control takes the
  same look unless he rules otherwise, and the app's other "on" looks (Fast sync, the week buttons, OIL Earn, the bell)
  stay as they are. A dark shadow that lifts a thing off the page — a window, a menu, a thing being dragged — is depth,
  not a glow, and stays. The app's own sign is not a mark: the claw logo on the sign-in page keeps its light, and so does
  the faint wash at the top of a page (D887). A new glow on a mark is his to rule, never added without his word. (His
  ruling: "a ring in this app never glows" — his yes, D880. The places that lost theirs: a flagged puck, D164; the
  just-added mark, D860; the board's other marks, D877; the picked person's chip, D879; the take ring, the bidding box,
  his own row's ring and the Tracker's rings, D881; today's card, the SANS stripe's light, the landing line's light, and
  Rearrange's "on" as the chip's fill, D882; the balance bar's and move banner's band, the Fast sync dot's and Admin →
  Users' dots' bands, D887. That a stripe, a box, a line, a panel, a dot and a button come under the rule with the rings;
  that a shadow in the mark's own colour and a halo count as a glow; that a dark shadow under a window or a menu is depth
  too; that a new on/off control takes the chip's look; and that a new glow is his to rule, began as the agent's
  reading; he approved them as written here, D887.)
- **Text must be readable on what it sits on** — check the pair, not the colour alone; a dimmed thing still has to be
  readable if a person needs to read it. A contrast finding on a look he chose (the SANS calendar's soft washes, D630)
  goes to him with the small step first — never strengthened quietly.

## 5. Motion

*From the Apple design skill and `make-interfaces-feel-better`; his D765 ("never at a cost of speed"), D489.*

**These rules are for NEW motion.** The motion already in the app that he asked for stays as measured — the ring round a
new thing and its fade (with no glow, §4), the picked-up look and landing flash of a drag (a month's bar wearing the ring
shows no landing flash, §4), a new flag's flash, the board sliding up; a look does not report them.

- **Smooth — as smooth as the phone's own (his D991, 18 Oct 26: "The key for UI to feel good is also speed. Which is FPS in this case. Smooth scroll"):** for motion, its frame rate: a scroll, and what a finger moves with it, runs as smoothly as the phone and the browser allow (the phone's own scrolling reaches 120 frames on his iPhone, a page's own motion about 60 there); a new design is judged by that as well as by how it looks, and the frame rate is measured, never assumed. *(Checked by a fresh reader, 18 Oct 26: the first wording widened his "smooth scroll" to every finger motion at the screen's full rate.)*
- **Quiet and quick:** about 150–240 thousandths of a second, easing out, no bounce. **One exception, his (D987):** the Tracker's finger glide
  bounces at an end, like the iPhone's lists (since D992 the phone's own scrolling, which bounces by itself); and the glide, like the edge scroll, stays on for a reader who asked for less
  motion — it is the scroll itself (D989).
- **Only movement and fading** — never an effect that lays the page out again. **Nothing new on the week or the board's
  dense grid.** Never on something done many times a minute (typing, tapping a puck).
- **Never animate "everything"** — name the properties (the app has no `transition: all`: keep it so).
- **Motion is never the only signal** — the thing that flashed must also read differently afterwards.
- **Off for a reader who asked for less motion** — the movement and the fade. A mark that is a press's feedback (§1,
  D850) still shows, steady, and then goes.
- A pressed button may give a little; a sheet slides up; a window grows in; a passing note fades. Each is offered to
  him as a picture or a short clip first, and measured on a phone before it is kept.

## 5a. Dragging

*His finds of 15 Oct 26 on the Leave War's Rearrange — D890–D893; the wording approved D895 (read by one fresh reader); the backlog item was `[GUIDE-DRAG-RULES]`.*

- **One drop, one landing line.** Anything dragged into a new place in a list — a row, a heading, a note — shows where it
  will land with ONE line, in ONE place. The lower half of one row and the upper half of the row under it are the same
  drop, so they draw the same line, on the top edge of the row under; only under the last row of a list, or above a
  heading the row cannot land on, is the line drawn on a row's bottom edge. Two lines a few pixels apart for one drop
  make him ask which is which. A thing dropped ONTO a place — a puck onto a seat, a chip onto a day, a Quals heading onto
  the column whose place it takes — marks that one place, once. A look drags slowly across every gap to check it.
- **Carried to the edge, the view follows.** Anything carried by a drag scrolls what it sits in when it is held near
  that box's edge — the page, a window's list, a table that runs sideways — in the direction the thing can move (a row
  up and down, a column sideways), at an edge distance and speed the app already uses, never new numbers, so it can be
  carried to a place out of view (`src/ui/edgescroll.ts` holds the Leave War's). It stays on for a reader who asked for
  less motion: it is the drag itself, not an effect. A look carries one thing to a place off the screen, on a phone and
  on a desktop.
- A drag already built that does otherwise is named to him, not changed (D852).

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
- **The delete candidates, as a list of their own (D846):** every text on the surfaces looked at that meets one of
  §1's three tests — the text, where it stands, which test, each fact (if any) that would leave the screen with it,
  the ruling where he ruled that wording, and its picture with and without it; and every passing note raised on them
  that none of §1's three cases covers (D850), with what shows the result once it is gone. A look that found none
  says so. The list goes to him as the findings do (the last point): nothing on it is deleted by the look.
- A short **"considered and left"** list — and why.
- **What a machine recorded reaches the report by count, not by recollection:** every gap a key-by-key or measured
  record holds is on the page by its number, or under "considered and left" with its reason; the report states both
  counts — the record's gaps and the page's — and a script compares them, never the eye (13 Oct 26: a gap in the key
  record was reasoned away and left off the page; a second reader found it).
- **Nothing is changed by a look.** Findings go to him, in rounds of at most four with a recommended answer each (D541).

## 9. His design lessons (D941)

*What his design corrections teach, written in the same day he makes one (§0, step 2), each checked by one fresh reader;
he may strike or change any. Newest first. Where a lesson meets a general rule above, the lesson wins, and that rule
points here.*

**Lesson 30 (21 Oct 26, D1194 — "colour code the row faintly so that people know which row is for which row for required and available").** Rows that belong together as a pair carry the same faint tint, so people can tell at a glance which row goes with which. Said of the Leave War's Required and Available rows. *(That the tint is a colour the app already gives the thing — the seat colours for pilots and WSOs — and never one that means a status, is the agent's reading, not his words.)* *Other places, named under D852 and not changed:* the SANS calendar's pilots / WSOs figures in a date cell; the Insights week's pilots and WSOs.

**Lesson 29 (21 Oct 26, D1189 — "I think the data should align horizontally seems like the middle is very cluttered").** In a list of records, each kind of figure has its own column, so the values line up from one line to the next and the eye runs down a column; never a run of figures joined into one sentence in the middle of the line. *(That this holds for every list of records in the app, and that on a phone it becomes a small labelled grid per record, is the agent's reading, not his words; it is lesson 20's columns carried from a note to a list.)* *Other places, named under D852 and not changed:* a person's leave by year (D1148) and "My leave"'s list (D1141), as drawn; the bell's lines (one line a notice, not a list of figures — probably not).

**Lesson 28 (21 Oct 26, D1188 — "standardise the location of where the buttons are for phone vs desktop. shouldnt be too far away like approve on the left of the desktop then mobile on the right").** A button stands in the same place on a phone as on a desktop; never on the left of one and the right of the other. *(That "the same place" means the same side and the same neighbours, so a person who uses both finds it where his hand expects, that it holds for every button in the app, and that it is not the same distance in pixels, is the agent's reading, not his words.)* *Other places, named under D852 and not changed:* the Leave War's "My leave" — the right end of the second row on a desktop, a line of its own on a phone (D1141); the Legend (the right end on both, as it stands); lesson 17's look across the app (D1124) is where any other is found.

**Lesson 27 (21 Oct 26, D1185 — "Make balances more obvious to click on").** Something that opens when clicked looks clickable: a heading that opens a drawer or a list looks clickable, not like faint small capitals that read as a label. *(That it holds for every fold in the app, and that the look is the grid card's "Manning" button — a border, its ▸ / ▾ — is the agent's reading, not his words.)* *Other places, named under D852 and not changed:* the Leave War's "Legend" and the clash note's slim line; the Inputs and SANS calendars' "How this works" fold; the Logic page's "How it works" folds.

**Lesson 26 (21 Oct 26, D1182 — "The approve what i enter is in a very odd place. could u find space to put it nicely with good alignment").** In a window built of rows — a label at the left, its choices beside it — every control stands in line with those columns, never somewhere odd. *(That this means never alone on a row with an empty label, that it holds for every window built of label rows, and that a control with no natural label gets one that reads with it, is the agent's reading, not his words.)* *His answer to where (D1187): the title bar, at its right end before ✕ — "looks better". (That a switch governing the whole window may sit there, out of the rows, is the agent's reading.)* *Other places, named under D852 and not changed:* the drag-selection sheet shares the bid window's format (D264) and gets the same; the input window's tick boxes ("all day", the till date) are not yet looked at for this.

**Lesson 25 (21 Oct 26, D1180 — "use the coloured pucks we designed just now to indicate e.g LL. Also indicate the puck of the user. so that we know its what cat, wso or pilot or sans").** Wherever a person or a kind of leave is listed, it is drawn the way the app draws it everywhere else — the person as his own puck (seat colour, CAT chip, SANS edge), the leave as its coloured box — never as plain words, so it is read at a glance the same way on every screen. *(That this reaches beyond the Approvals list is the agent's reading, not his words.)* *Other places, named under D852 and not changed:* the Leave War's day panel's "who is away" (D1143); "My leave" and a person's leave by year (D1141, D1148), which list kinds of leave; the Inputs list's type column, whose kind pill is grey. *(Applied the same day to the bid windows' leave buttons — his D1183.)*

**Lesson 24 (21 Oct 26, D1168 — "majority of the time its usually opened from the start till the end of the month. only the rare times they can use the edit icon to select specific days").** Where a choice is nearly always the same shape, that shape is one tap: in the Leave War's "Open for bidding" window a whole month is opened by tapping it, and exact days, the rare case, stay behind the pencil. *(That a second tap closes the month, and that it holds for other pickers whose usual answer is a whole unit — a whole week, a whole day — is the agent's reading, not his words.)* *Other places, named under D852 and not changed:* the Calendar window's holidays and the Leave War's events, where a whole day is the usual case, are not yet looked at for this.

**Lesson 23 (21 Oct 26, D1161 — "I feel like all green feels abit boring and mundane to see", with his picture of the colleague's leave app, Gryphon, where each kind of leave has its own colour).** A grid that is all one colour reads as boring and mundane to him: on the Leave War, every approved leave in the same green. *(That colour may then tell the kinds of leave apart, where it stands being shown another way, and that this holds for other grids read at a glance — the Inputs and SANS calendars — is the agent's reading, not his words; the answer is his question 2.)* *Other places, named under D852 and not changed:* the Inputs calendar's month and the SANS calendar, not yet looked at for this.

**Lesson 22 (21 Oct 26, D1159 — "maybe use this instead for document to standardise it", with his picture of the input window's Document button).** Adding a document is done with the app's one Document button (the upload arrow and "Document", then "Add"), drawn the same wherever it appears — not a new button drawn for a new screen. Said of the Leave War bid window's drawn "Add a photo or PDF". *(That this is a general rule — one action, one control, the same everywhere, so a date box, a person picker, Save and Cancel too — is the agent's reading, not his words.)* *Other places, named under D852 and not changed:* the overhaul's drawn person window marks a leave's document with a paper clip ("1 document") where the input window shows a file chip; the Leave War's remarks editor, if it gains a document, would take the same button.

**Lesson 21 (21 Oct 26, D1160 — "I cant really tell if its a half day or not, the size of the half day and full day is very similar"; "make the pucks fill the grid when its full day and for half day the pucks also fill the half of the grid despite the words being smaller").** On the Leave War a whole day's box fills its whole cell and a half day's box fills its half, its letters smaller even so, so a half is told from a whole day at a glance — never two boxes of nearly the same size. *(That the general point — how much a mark stands for is shown by how much room it fills — holds here and for other part-marks, such as a part-day input on the Inputs calendar or part of a wave, is the agent's reading, not his words.)* *Other places, named under D852 and not changed:* today's Leave War itself, where a half is "<LL" or "LL>" with a light half-fill (replaced by the overhaul); whether the Inputs and SANS calendars draw a part of a day by its size is not yet looked at.

**Lesson 20 (21 Oct 26, D1144 — "can u place it neatly with each counter flushed to the left if there are multiple counters affected").** Where a note names several counters a change affects, each stands on its own line, flush left, one under another — not run together in a sentence that wraps. Said of the Leave War bid window's line naming the manning rows a bid would turn amber or red. *(The reason — a list is read at a glance; that the names form one column and their figures a second; that a single item takes its own line too; and that it holds for other notes naming several things — people, days — are the agent's readings, not his words.)* *Other places, named under D852:* the Leave War's day panel (D1143), not yet built, drawn with its figures run together in one row of chips ("Avail P 25 · Avail W 17 · Required P –"); that its manning rows stack the same way is the agent's reading, to be put to him with its picture.
**Lesson 19 (21 Oct 26, D1134 — "can u make sure u use the same icon designs i like this pencil better", with a picture of the typed ✎ as his PC draws it).** One thing has one icon everywhere: every pencil in the app is the same pencil, the one he chose — solid, eraser at the top left, tip at the bottom right — not two designs side by side. Said in answer to the proposal to draw every pencil as the line pencil (already on the Tracker and in the input window's title box), against the solid ✎ he sees elsewhere. *(That the pencil is drawn by the app, so it looks the same on his iPhone as on his PC, and that the app's other icons stay line icons, are the agent's readings, not his words.)* *Where else it applies (D852, named, not changed):* the Tracker's ⇪ before File and the Import item, and any other icon the app draws in two places, are checked to be the one drawing; the Scheduler Board's and the Leave War's typed marks are round 4 of the consistency look (finding 17).

**Lesson 18 (21 Oct 26, D1133 — "it seems like the edit pencils are slanted bottom right why we changed to bottom left?").** Every pencil in the app points one way, its tip at the bottom right, as the typed ✎ always has. Said of the Tracker's new drawn pencils and the input window's title-box pencil, both mirrored to match. *(That any icon drawn in place of one the app already shows keeps that one's direction and meaning is the agent's reading, not his words.)* *Where else it applies (D852, named, not changed):* Quals' and Logic's "✎ Edit", the Scheduler Board's plans and templates ✎ and the stores list's ✎ are still typed, and the Inputs calendar's ✏ shows as an emoji on his iPhone, its direction not yet checked. All are for round 3 of the consistency look (finding 16). *(That a later icon swap is checked against the old icon's direction before it is built is the agent's suggestion, not his words.)* *(Checked by one fresh reader, D941; its two marks taken.)*

**Lesson 17 (21 Oct 26, D1123–D1124 — "why the format of inputs and sans are different. can we standardise this too?"; "can u check elsewhere on the app that have these inconsistensies … Desktop and phone").** Pages or windows that carry the same kind of row — tabs, a month's ‹ name › and Today — draw it alike: the same places, the same size, the same style, on a desktop as on a phone. A difference stays only where one page lacks the thing (the SANS calendar has no list, so no Calendar / List switch) or a ruling made it on purpose, and is then named as such. *(The other kinds of row, a gear or a title bar, and the two exceptions are the agent's reading, not his words.)* When one page is matched to another, the other places where the same kind of row is drawn are looked at too. Each mismatch found is put to him with its picture marked and a recommended way to match, before anything changes. *(His first answers, all as recommended: one Inputs / SANS top row, D1125; the top bar on one line, D1126; one search box, D1127; one pair of edit buttons, D1128.)*

**Lesson 16 (21 Oct 26, D1122 — "Can u make the right arrow the same place? If not i keep having to chase the arrow when the words change").** Arrows on either side of words that change — a day, a month, a count — never move as the words change: the words get the room their longest value needs, so the second arrow, pressed again and again, stays under the finger. Said of Edit Schedule's crew panel "‹ SATURDAY ›", and by his word of every such place in the app ("see anything else in the app does it too and fix it"). *(That the room is the longest value's, never a cut word, is the agent's reading, not his words.)* *Narrows §3's "a control tapped again and again never moves under the finger" (his standing rule of 2 Sep 26, said again as D687) for arrows around changing words; the places found and fixed are listed under [ARROWS-STAY-PUT].*

**Lesson 15 (21 Oct 26, D1121 — "we shouldnt have the reason explained twice").** A reason says each fact once: where the meaning of a man's kind of input and his own remark repeat a fact ("medically down — cannot report to work (ATT C) — Medically down till 17 Jul"), the screen says it once, keeping any fact only one of them gives. Said of a crossed-out man's reason in the crew list. *(That it holds wherever the same sentence is said — the note a tap on him raises, the ALL AVAIL window's reason — is the agent's reading, not his words; the rewording is a later job — on its own or with the words pass (D808), his to place — [CREW-REASON-TWICE], put to him with its words read cold first, §1a.)* *Other places, named under D852 and not changed:* the day's issues list ("Vector — Downchit but planned to fly RU BFM — reason: Medical leave 13 Jul" names the downchit, then its remark).

**Lesson 14 (21 Oct 26, D1120 — "they should not be faded as they are available to be planned").** A man only standing by (an SC SPARE, AVALON or BB line) is shown ready to plan, never faded as if tasked: he is available to be planned, and fading says he is already busy. Said of the crew list on the Scheduler Board — and so Edit Schedule's own crew panel and the phone's crew drawer, the same list. *(That it holds for any list of who can be planned, that a standby row that flies counts as a task, and that a man also tasked elsewhere stays faded, are the agent's readings, not his words.)* *Other places, named under D852 and not changed:* the ALL AVAIL window's count of who is available, and the day's own figures.

**Lesson 13 (20 Oct 26, D1095 — "Make it 27 instead of 2027?").** Where a date must carry its year to tell it from this year's, the year is two digits — "till 15 Feb 27" — as the Inputs list's Changed column already prints "1 Jan 26". *(The reason, fewer characters for the same fact, is the agent's reading, not his words.)* Said of an input's "till <date>" on every screen and in its window. *(That it holds for other dates that carry a year is the agent's reading, not his words.)* *Widened the same day by his D1096 ("All 27 instead"): every date printed with its year carries it in two digits — the three places named then (the desktop Inputs list's date column, the phone list's day heading, the LATE mark's note) and any other found printing a four-digit year after a date.*

**Lesson 12 (19 Oct 26, D1081 — "when I close my keyboard there is 1 frame of some other out of position screen then back … It makes it look like a stutter").** When the keyboard opens or closes, nothing on screen jumps out of place, even for one frame: whatever follows the visible screen moves with it every frame, never a frame behind it. A screen that stutters reads as broken, however briefly. *Other places, named under D852 — the same check applies to each: the Leave War's sheets and its balance bar, the Inputs and SANS calendars' day panels, the History bubble, a window raised above the keys ([KEYBOARD-SCROLL]).*

**Lesson 11 (19 Oct 26, D1066 — "Seems like there's no space to put like main/flies or spare/flies together. Maybe stack it vertically and make it smaller?").** Where two marks do not fit side by side in a narrow column, the second one stacks under the first and is drawn smaller; a mark's word is never broken inside it. Said of the Flies chip under the MAIN / SPARE badge on Edit Schedule's week at his iPhone's width; he chose this over shortening the word to "✓F". *(That it holds for other pairs of marks is the agent's reading, not his words.)* *Other places, named under D852 and not changed:* the CX tag and the red-box flag before a row's remarks on the phone week; the stores chips beside a flying row's remarks; the LATE mark beside an input's remarks.

**Lesson 10 (19 Oct 26, D1064 — "Less clutter for something that rarely happens and can only be seen in scheduler board"; "Unless it's ticked then all 3 screens can be seen").** The control for something that rarely happens stands only on the screen where the scheduler does it; the other screens show only its result, and only where it has happened. Said of the Flies tick on standby rows: the dashed chip that ticks a row is on the Scheduler Board only; the lit chip shows on the board, Edit Schedule and View-only Sched. *(That it holds for other rare controls is the agent's reading, not his words.)* *Other places, named under D852 and not changed:* the MAIN / SPARE badge is a button on Edit Schedule's week as well as the board; the stores' "C" button and the empty stores box show on every flying row of Edit Schedule's week; the CX, red-box and add / remove buttons under each row on the board.

**Lesson 9 (19 Oct 26, D1047 — "It did not delete the existing timing and continue to type to add it").** A box that holds a short value typed whole — a time — takes a fresh value from the first key after it is tapped into: one tap then typing replaces it, one tap then Backspace clears it; a second tap (or moving the caret) edits it digit by digit. A scheduler retypes a time far more often than he edits one digit of it. *The same, by his D1080 (19 Oct 26), for every box that holds one short value typed whole: the templates' times, the Leave War's numbers, the SANS and late cut-off numbers, the Logic page's settings.*

**Lesson 8 (19 Oct 26, D1038 — "make it shorter so it looks like it's accepted. Like a short flash").** When a suggested value is taken, the screen says so at once: the value takes the ordinary colour of a typed one, and its box wears the plain blue ring only as a short flash, about a second, so it reads as accepted rather than as something just added. A faint suggestion and a taken one never share a colour. *Narrows "One mark, one look" (§4, D876) for a taken suggestion only.*

**Lesson 7 (19 Oct 26, D1028 — "the formatting is screw up to have like misaligned rows and more vertical space used. Is there a way to show the suggested timing on the same row box area?").** A suggested value sits in its own box's row area, never on a line of its own above the box: the row's boxes stay level and the row grows no taller for it. *(How, his D1030 the same day — "Whatever time that was auto placed in will disappear" once something is typed: inside the empty box, faint, where the value will go; one tap places it highlighted, so whatever is typed next replaces it.)* *(Said of the suggested brief and the default rally on Edit Schedule's week and the Scheduler Board; that it holds for any suggested value is the agent's reading, not his words.)* *Other places, named under D852 and not changed: none this chat knows of beyond the suggested brief, which the rally job changes with the rally box.*

**Lesson 6 (18 Oct 26, D995 — "Can we make those windows that u put at the bottom of the screen to be at the middle of the screen instead?").** On a phone the schedule's own input window, opened from Edit Schedule or the Scheduler Board, stands in the middle of the screen, not hanging from its foot. *(Its height stays as the batch made it, as tall as what it holds; one taller than the screen still fills it — the agent's reading, not his words. Why: a short window over the schedule reads better in the middle than hanging from its foot — the agent's reading; he gave no reason.)* *Until D996–D997 later that day this narrowed D537's "a short window stays … at the bottom" for that window only, and named the same input's window on the Inputs page, a day opened on the Inputs or SANS calendar and the bottom-sheet windows such as Insights as places not changed; see the widening below.* *(Checked by a fresh reader, 18 Oct 26: the height and the reason were marked as the agent's reading, and D537's short line named the window's doors.)* *Widened the same day (D996, D997 — "Yes standardise to middle", "All in the middle"): every window that pops up for a task stands in the middle on a phone; the day panels pulled up and down by their bar (the Inputs and SANS calendars' day) and the ALL AVAIL and changes windows stay at the foot (the Leave War's own sheets are not read into it — the agent's reading). (Its fresh read, 18 Oct 26, night: the earlier sentences marked as overtaken.)*

**Lesson 5 (17 Oct 26, D977 — "why is there no symmetry for the pending upchit? … pushed to the left with space on the right"; then "make them Evenly width so that it's nice even on the desktop. Wrap text as required").** On the Medical tab every card is one width, in all three sections and on a desktop too, so the cards stand in columns that line up from one section to the next; words longer than the card wrap inside it. Cards each as wide as their own words had no symmetry from one section to the next and sat pushed to the left, with space on the right. *Replaces, for the Medical tab, how his 28 Aug 26 request ("doesn't look compact enough") was met, with each card hugging its own words; his point then, no dead air inside a card, stands — so the width is chosen from what the cards hold (the agent's reading, not his words).* *Other places, named under D852 and not changed: none this chat has seen draw cards as a grid; a look at the app's other card sets (the Inputs calendar's opened day, the SANS day, Help's bug reports) would say whether any does.* *(Checked by a fresh reader, 17 Oct 26: the first wording read as a rule for every card grid and put the agent's words in his mouth; narrowed to his.)*

**Lesson 4 (17 Oct 26, D960 — "No need for the time/ date or who it's filed from").** On a Medical card, the card says when the status runs — the period it covers ("15–17 Jul") — not who filed it or when: the filer is usually the person on the card, and the date and time it was filed are not needed. They leave the card, and nothing is put in their place. (Who filed it and when stay in the input's window — D960's ruling, not his words.) *Narrows D629 (who placed an input, and when) for the Medical card only; the other places that print "Placed by…" are suggestions under D852, not changed.* *(Checked by a fresh reader, 17 Oct 26: the first wording read as a rule for every card, and was narrowed to his.)*

**Lesson 3 (17 Oct 26, D951 — "seems weird for 1 day duty and other commitments to have a till date").** On a one-day duty or other commitment a "till <date>" only repeats the day it stands on, so it carries none by default; one that runs more than a day keeps it. *Answered by D952 (17 Oct 26 — "I want to have a toggle"):* one-day leave and medical inputs keep "till <that day>" by default; every input gets a switch for it, whose default follows the dates by itself, and the person can still turn it either way. *(Checked by a fresh reader, 17 Oct 26: the first wording read as a rule for every kind, and was narrowed to his.)*

**Lesson 2 (16 Oct 26, D945 — an input row's "Undo" became "Reject").** A button is named for what it does — never with
another control's name (the row's "Undo" was also the top bar's) and never with a word that reads as Delete (he asked
whether "Remove" would). *Named under
D852, not changed:* two places still call a rejected input "removed" — the Personal Inputs note "A removed input flags
nothing until accepted again" and a rejected row's hover text "Removed from the day — flags nothing until accepted again".
Both wait for his answer (the night of 16–17 Oct 26, question 2).

*Lesson 1 (16 Oct 26, D938 — "a scheduler's working screen carries no hint on how a row is edited…") was struck by him the same day: "Disregard this lesson" (D942).*

## Where each piece came from

| Source | Licence | What was taken |
|---|---|---|
| `jakubkrehel/skills` (read at the source 13 Oct 26) — the writing, accessibility, layout, "break" and "state-machine" guides | MIT, © Jakub Krehel | §1, §2's table (itself the W3C ARIA practices' patterns), §3, §7, §8's format — rewritten in our words |
| `jakubkrehel/make-interfaces-feel-better` (read 2 Oct 26 and 13 Oct 26) | MIT, © Jakub Krehel | §5's "never animate everything", §6's figures, corners and touch target — as narrowed by D489; its rules on icons were NOT taken |
| `rukkiecodes/claude-apple-design-system` (read 12 Oct 26 and 13 Oct 26) | MIT, © 2026 rukkiecodes | §4's two rules and its one-table idea; §3's "surface before a box", "one main button", hair-thin lines; §1's "a note for what is done, a question only for a choice" and "an empty place says one thing"; §5's timings; §6's three weights and one corner scale; §8's "place, rule, fix" — its light, airy, one-accent look was NOT taken |
| The outside writing guides read 13 Oct 26 — Microsoft's and Apple's writing guides, Nielsen Norman Group (error messages; the tone study; expert readers), GOV.UK's writing guidelines, Google's Material content guide, Atlassian's and Mailchimp's voice pages, the US plain-language guide, one UX-writing checklist, Anthropic's document skill | each publisher's own — Google's, Apple's and Atlassian's read word for word, the rest through a fetch tool's account of the page; nothing copied | §1a's tests and §1b, in our words; §1's lines on the form that will work, no joke in a note seen often, and a word that is both a thing and an action. What was read, what reviewers say of each, what cuts against and what was NOT taken: `superpowers/briefs/2026-10-13-writing-skills-research.md` and `…-ux-writing-guides-research.md` |
| `blader/humanizer` (he sent it 13 Oct 26; read in full the same hour) — a skill that removes the marks of machine-written prose, drawn from Wikipedia's "Signs of AI writing" | MIT | §1b test 12's list of habits, in our words, and its reason for the dash (a dash lets the writer skip choosing how two parts relate) beside test 2. NOT installed (D486, D812); most of it is for essays and replies, not on-screen notes |

**Not taken from any of them:** converting the app's colours, a choice of fonts (the app loads none), icon rules,
animation recipes for another toolkit, translation rules, phone-app parts, and any program a skill tells an agent to
download and run.

**Changing this guide:** it is a working guide — a change is read before he approves it, one round each and never by
its writer: by Astra and Sol 6.1 (D70, D590). This first draft: one fresh, blind Opus reader while the ChatGPT readers
are out (D812; D810's precedent), written on the list of jobs that went without a ChatGPT reader (D761) — its report:
`superpowers/briefs/2026-10-13-design-guide-read.md`. **The writing guide (§1's additions, §1a, §1b — D832, D833,
D834):** read three times, each time by a fresh Opus reader and by Fable on his word, each blind to the other — the first
draft's reads `superpowers/briefs/2026-10-13-writing-guide-reads.md`, the second draft's and what was taken from each
`superpowers/briefs/2026-10-13-writing-guide-reads-2.md`, which also holds the third draft's read, done with the tool he
sent beside it (D835). **He approved it on 14 Oct 26 (D836)**; it goes live with its branch on his "merge live".
