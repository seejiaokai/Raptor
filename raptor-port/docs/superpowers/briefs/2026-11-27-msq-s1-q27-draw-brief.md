# Section 1 (the guard rail) — the drawings for question 27 (chat 204, 27 Nov 26)

**A drawing job: pictures of the real app for one question put to the owner. No file under `raptor-port/src`
changes.** Use the shape of questions 24 and 25. Read `2026-11-27-msq-s1-q24-25-draw-brief.md` whole first, and the
q19–20 brief it names. Where this brief is silent, their rules hold:
- your own worktree, with `node_modules` linked by a junction and the junction removed at the end;
- the checks lock for the build, and the port;
- 2× crops with the teal ring;
- look at every picture you make.

Reuse `scripts/handpass/n204/q-lib.mjs` and `q2425-lib.mjs`. Your worktree should be at commit `9904a943f` or later;
check it. Write your scripts to `raptor-port/scripts/handpass/n204/draw-q27.mjs`, your pictures to
`raptor-port/docs/mock/2026-11-26-msq-questions/q27/`, and your report to
`raptor-port/docs/superpowers/briefs/2026-11-27-msq-s1-q27-draw-report.md`, all **inside your own copy**. Leave them
uncommitted, and give the full path of your copy in your reply.

## What question 27 is about

When he presses Undo and it would take the squadron in view away while something is open, the app refuses. It shows
a note under the Undo button: "Blocked: <what to put away first>, then press Undo again." (approved, D2729 group 5).

Only one road reaches this:
1. Saber (`ad` / `a`, master admin) goes to Admin → Squadrons, presses "+ New squadron", types 151, gives a first
   admin, and presses Save.
2. He picks 151 in the squadron menu.
3. He starts something.
4. He presses Undo, which would take 151 away again.

Some of the notes in this state use stand-in words today. The question shows him the words a reviewer has proposed.
Read the words-check report (`2026-11-27-msq-s1-q27-words-check-report.md`, "The one road" and item 4) for how each
state is reached.

## The pictures, at 1536×864, the note under the Undo button

1. **27-5, two squadrons being made at once.** On 151, on Admin, with the Squadrons section showing:
   1. Press "+ New squadron" again and type 152. Do not save.
   2. Switch to the Users section.
   3. Press Undo.

   Today the note reads "Blocked: cancel the new squadron, then press Undo again." Picture it as it is.

   Then make two pictures of the proposed words, by replacing the note's text in the page. Use exactly the place and
   look the app gives that note; change nothing else:
   - (A) "Blocked: cancel the squadron you are adding on Squadrons, then press Undo again."
   - (B) "Blocked: cancel the new squadron on Squadrons, then press Undo again."

   For each, take a crop with the Undo button and the note in sight. If a crop can show the Users section and the
   squadron number 151 in the top bar, include them.
2. **27-14, the holiday kept waiting.** On 151, in the Calendar's Holidays:
   1. Add a holiday.
   2. Press Save. Because 151 has no leave period, it is kept waiting: "It is kept here, and saved by itself as soon as
      a leave period covers it.", with its Cancel and "Create the … leave period".
   3. Press Undo.

   The note reads "Blocked: cancel the new holiday, then press Undo again." It is real today, not a mock-up. Take a
   picture with the waiting line, its Cancel and the note in sight.
3. **27-1, one example of the "on Users" family.** On 151, on Admin, Users showing:
   1. Open a person's row and change something. Saber's own row is fine; do not save.
   2. Switch to the Squadrons section.
   3. Press Undo.

   Today the note reads "Blocked: cancel the open row, then press Undo again." Picture it, then picture the proposed
   "Blocked: cancel the open row on Users, then press Undo again." the same way as in 27-5.

If a step cannot be done as written, picture what you found instead and say so. Never force a state through the
developer's bridge without saying so in the caption. Do not draw anything else.

## The report

For each picture, give:
- its file;
- one plain caption: what he is doing, what he pressed, and what the note says;
- whether it is the real app or the note's text replaced.

Then reply in under 120 words.
