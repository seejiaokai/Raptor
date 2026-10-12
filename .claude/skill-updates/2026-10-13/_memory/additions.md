# Memory additions (machine-local, outside the repo) — installed only after he approves

Folder: `C:\Users\User\.claude\projects\C--Users-User-projects-Raptor\memory\`. These are lessons about how to work
with HIM, and two traps of this PC's tools — the kind the reviews of 23 and 24 Sep 26 put in memory, because they must
be in force in every chat and are not rules of the app. Five new notes (each with its line in `MEMORY.md`) and two
additions to notes that exist.

## New note `answer-mid-run-questions-first.md` (observations 318, 261) — type: feedback

A question he sends while work is running is answered in the very next message, in full and plainly, BEFORE another
tool call: what happens next, in order, what he will find afterwards, and — late at night or before an unattended
run — that he can go. A one-line "still working" between tool calls is not the answer. Anything he must COPY or ACT
on (a prompt for another chat, a command, a decision) is sent as a file or closes the turn — text written between
tool calls did not reach him.

**Why:** 28 Sep 26 — he asked "what's next" twice, then "Reply me now", "I want to sleep", while the agent went on
reading. 26 Sep 26 — "I dont see the prompt": it had been written between tool calls.

**How to apply:** on any mid-run message from him that is a question, stop, answer, then resume. Index line:
`- [Answer a mid-run question first](answer-mid-run-questions-first.md) — the next message answers him in full before any tool call; what he must copy goes as a file or ends the turn (28 Sep 26).`

## New note `record-answers-quietly-during-a-round.md` (observation 236) — type: feedback

While he is answering a list of questions over several messages, each answer is recorded in ONE quick step — its
ruling row and its smallest home — and the reply is one line ("recorded — next?"). The wider work an answer implies
(a new branch, the handoff, the backlog's order) waits for the end of the round, and the agent says so.

**Why:** 24 Sep 26 — after "1-4 yes" the agent cut a branch and rewrote the handoff before replying; he wrote "we
havent answered all the questions, what are u doing".

**How to apply:** recording a ruling the moment he makes it (D13) stays; only its downstream work waits. Index line:
`- [Record answers quietly during a round](record-answers-quietly-during-a-round.md) — while he answers a list: one quick record each, a one-line reply; the wider set-up after the round (24 Sep 26).`

## New note `owner-questions-need-a-worked-example.md` (observations 330, 510) — type: feedback

Every product question put to him opens with ONE worked example in the app's own words — a date, a name, what he
would press, what he would then see — before the options, and asks what the screen should SHOW in that case, not
which rule applies. One decision a question: never a question whose meaning depends on another answer in the same
round (ask it in the next round), and never "if you chose the first, pick…". A tap on the recommended option that
is followed by "explain again" is no answer — record nothing until the re-asked question is answered.

**Why:** 28 Sep 26 — of six questions, the two worded as rules came back ("4 explain clearly", "5 what do u mean");
re-put with an example each was answered at once. 10 Oct 26 — a conditional second question got a tap he took back.

**How to apply:** check before sending: could he answer it without building the scenario in his head? Index line:
`- [Questions need a worked example](owner-questions-need-a-worked-example.md) — one named case and what the screen should show; one decision a question, none that depends on another answer (28 Sep, 10 Oct 26).`

## New note `lists-he-forwards-are-copyable-files.md` (observation 385) — type: feedback

A list he will pass to someone else (questions for the IT side, a brief for another team) is made, the FIRST time,
as a plain-text file sent to him: each item spaced out with its "Question:" and its "Context:" (why it is asked,
what waits on it), the urgent ones first, what is already agreed at the foot, worded for the reader, and naming no
individual unless he names one. In chat he gets a short plain summary of what the list asks and which items are
urgent.

**Why:** 30 Sep 26 — one list of IT questions took three round trips: "explain in layman", then "make it in text
format that I can copy and provide the context for each question", then "change the name … to IT".

**How to apply:** two readers — the recipient needs each item's context, he needs to understand what he is sending.
Index line: `- [Lists he forwards are copyable files](lists-he-forwards-are-copyable-files.md) — a list for a third party: a plain-text file, question and context each, no names; a short summary for him (30 Sep 26).`

## New note `research-open-the-disconfirming-source.md` (observation 428) — type: feedback

When research feeds advice the agent has already leaned towards, the pass is not finished until at least one source
arguing the OTHER way has been opened and reported with the same weight; a vendor's own figures are labelled as the
vendor's; and the reply says which claims came from a search summary and which from the page itself.

**Why:** 5 Oct 26 — "the evidence supports it" was told to him from the sources that agreed; a result whose title
signalled the opposite was listed and not opened. He asked "is it really better?", and the advice had to be
qualified after he had been told it was supported.

**How to apply:** look for the disconfirming source first. Index line:
`- [Open the source that cuts against the advice](research-open-the-disconfirming-source.md) — before reporting research behind a recommendation: one opposing source opened, vendor figures labelled, summaries said to be summaries (5 Oct 26).`

## Append to `python-edits-crlf-trap.md` (observations 311, 402)

**Two more for any scripted edit (13 Oct 26 review).** Before a script replaces everything between two anchors,
list what the span holds (`grep -n "^export function\|^function\|^const\|^export type"` over it) and assert in the
script that each is in the new text or deliberately retired — a span edit also replaces what you did not mean to
touch (27 Sep 26: a function with callers sat inside the span; only older tests caught the loss). And make a script
safe to run twice: assert the NEW text is absent before replacing — "the anchor matches exactly once" still holds
after a half-finished run whose replacement kept its anchor, and the second run then inserts the block again
(1 Oct 26). Repair a script FILE with the editor tool, never with another inline script; after any failed edit
script read `git diff --stat` before running anything again.

## Append to `guides-fewer-words-more-pictures.md` (observations 350, 351)

**Building a deck on this PC (13 Oct 26 review; from the IT flow guide, 29 Sep 26).** No LibreOffice here, but
PowerPoint is installed: drive it over COM (open with no window, save as PDF — format 32 — and export each slide as a
picture) for the PDF and for the pictures used to check the slides; it is the engine his audience opens the file in.
A tool needed only to make the deck (`pptxgenjs`) is installed in a scratch folder and loaded from there, never
added to the app's own packages. Marks laid over a screenshot from computed positions: refuse a mark whose centre
falls outside its picture and clip every ring to the picture's edges — an off-picture mark passes the build and
shows only when rendered. Pictures are stored once per use: shrink each to the largest size it is shown at (about
1100px wide for a third of a slide) before adding it.
