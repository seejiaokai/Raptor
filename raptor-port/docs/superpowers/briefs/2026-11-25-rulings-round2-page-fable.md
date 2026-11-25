# Round 2 questions page — report

## READ FIRST: the shared checkout changed branch under me

While I worked, the main folder `C:/Users/User/projects/Raptor` was switched by someone else from the detached
commit de21d08d1 (chat 173's branch, `origin/claude/readings-lapse-fix-fdbb3c`) to `claude/sans-leftovers-179`
(3c3789384). I did not switch anything. Consequences:

- Round 1's page, the two briefs and `docs/img/handpass/2026-11-25-audit-round1/` are NOT on the branch now checked
  out. I read them before the switch, and afterwards took the seven pictures and round 1's styles straight out of
  commit de21d08d1 with `git cat-file blob` (no checkout).
- The new folder is UNTRACKED in the working tree, so it survives the switch and sits on whatever branch is checked
  out. It must be added on chat 173's branch, not on `claude/sans-leftovers-179`. Nothing was committed or pushed.

## Files written

- `raptor-port/docs/mock/2026-11-25-rulings-round2/index.html`
- `raptor-port/docs/mock/2026-11-25-rulings-round2/img/` — seven pictures (below)

Scratch only (not in the project): `body.html`, `head.html`, `tail.html`, `r1.html`, `build.mjs`, `shot.mjs`,
`r2-*.png` in this scratchpad.

## Pictures copied (source in `raptor-port/docs/img/handpass/2026-11-25-audit-round1/` at de21d08d1 → name on the page)

| Source | On the page |
|---|---|
| q2-01-first-signoff-one-of-three-answered.png | img/signoff-01-oil-list-one-of-three-answered.png |
| q2-02-second-signoff-asks-nothing.png | img/signoff-02-sked-ck-signed-no-list.png |
| q2-03-publish-note.png | img/signoff-03-publish-note.png |
| q5-01-published-tue-ranger-ll-not-late.png | img/cutoff-01-published-tue-ranger-ll-not-late.png |
| q5-02-inputs-cutoff-raised-to-21-days.png | img/cutoff-02-inputs-cutoff-raised-to-21-days.png |
| q5-03-published-tue-ranger-ll-now-late.png | img/cutoff-03-published-tue-ranger-ll-now-late.png |
| q5-04-published-tue-nothing-pending-signatures-kept.png | img/cutoff-04-nothing-pending-signatures-kept.png |

Renamed so no file name carries a review code. Each was opened and its caption written from what it shows.

## Checked

Opened in Chromium at 390 wide, light and dark: no sideways scroll (page width 390 = screen 390), 0 broken
pictures, no page errors, the lightbox opens on a tap. Looked at the top in light and question 1 in dark. No review
codes or ruling numbers in the text (searched). Not checked on a real iPhone, and not published anywhere.

## [CHECK] left in the page

None.

## Things the host should verify — stated on the page from the review, not seen in the walk

1. **Question 1's reason for the recommendation:** "an answer given [at the next box] changes what the day earns
   after the first name has signed, and that would clear the name just signed." This is the review's claim (its Q2
   recommendation). The walk did not show it. If it is wrong, the recommendation's reason falls.
2. **Question 1, "about weekly"** and **question 2, "a few times a year"**: the review's frequencies, not his.
3. **Question 1, his words "Later asks no more that day."** — quoted as the review gives them; I did not open the
   full ruling row to confirm the exact words.
4. **Question 2, his words** — "changes nobody's day" and the Logic page's line "A changed late cut-off moves the
   LATE marks at once, on published days too" (since 14 Nov, "you have seen that line") are as the review gives
   them; not checked against the full rows or the live Logic page.
5. **Question 2, the second choice's cost** ("every published day holding an input whose mark would change reads
   pending, and its four names clear") is my working-through of his standing rule that anything pending wipes the
   four sign-offs. It is on the page as the cost of that choice, not as his words.
6. **Question 2's first picture caption** says "The Unavailable list on the published Tuesday" without naming the
   page (the walk does not say whether it is the board or the edit week). The walk did not look at View-only Sched;
   the page says so in one line.
7. **Question 1 uses the reproduction's case**, not the review's: Fri 17 Jul made a public holiday, three inputs
   (Ranger's Range brief, Hunter's Gate duty, Nomad's OD), first box CUR CK (Ace), second SKED CK (Anvil). The page
   leaves out that Saber pressed Later once on the list when the day was first made a holiday, before the sign-off.
8. **The "Drawings coming" line for the guard rail** says "and what Publish says while one is missing" — from his
   rule's "Publish saying how many" on the scheduler page. Drop the clause if the drawing will not cover it.

## Choices of mine to confirm

- **Numbering clash.** The small points are 1–19 and the questions are 1 and 2, as briefed. Since "all as
  recommended" was misread once already, the page tells him to reply "small points, all as recommended" and
  "question 1 as recommended". Consider calling the questions A and B.
- **Highlighting.** New: the two questions (a "New" tag and a gold card edge). I also highlighted the changed
  clauses in small points 1, 5, 9 and 12, with a line above the list saying so — they are new since round 1. The
  brief named only the questions as new; remove the four `<mark>`s and that line if unwanted.
- **The small points are shown open in a card**, not folded as in round 1, because they are now the first thing to
  answer.
- **Question 1 offers a third choice** ("keep it as built, with no new line") beside the two in the brief.
- **Top list order** follows the brief (list, question 1, question 2), not newest first.
- The foot keeps round 1's note about the two questions on the bell job's page; "the four places" became "the
  places", since the review lists three.
- I added the missing dark-theme values for two border colours that round 1's forced-dark block lacked.

## Small points — wording changed beyond the four adjustments

- Point 5 only: sentence order changed so the new clause reads naturally. Round 1: "The SANS reminder goes to the
  man only. The admin sees the struck name in the crew list and gets no bell line." Now: "The SANS reminder goes to
  the man only. The admin gets no bell line. He sees the struck name in the crew list, and by this morning's answer
  he will also see the new amber line on the warning list." Same facts.
- Points 2–4, 6–8, 10, 11, 13–19: word for word as round 1.
- The four adjustments as briefed: point 1 (only while drafting), point 5 (the amber line), point 9 ("after
  question 2" dropped; "This morning you answered 'count him in' for ALL AVAIL" added), point 12 (only while
  drafting).
- The list's lead-in: "Nineteen low-harm points" became "Each is low harm", and it now says they are carried from
  round 1 and still waiting.

## Not done

- The guide's §1b (how the app speaks) and §9 (his design lessons) were not read whole; I kept to round 1's voice
  and layout. No Fable review of the words was run by me.
