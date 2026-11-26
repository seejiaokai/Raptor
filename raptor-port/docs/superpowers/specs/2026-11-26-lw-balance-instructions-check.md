Model: Fable 5.2 (claude-fable-5-2). Fresh reviewer; I read the two briefs and the writer's report only. No repo file changed.

# Check of the instructions at the leave-balance box

## Verdict

The writer's words are short and mostly true, but three things are wrong enough to change:

1. **The trap line asks for too much and is not true as written.** "Leave it has already taken off must be approved
   on TALON first, or it counts twice" covers every leave the official app has ever taken off. A member who took ten
   days earlier in the year, none of them on TALON, is told all ten must be approved on TALON before he may type. That
   is false (leave that never goes on TALON never counts twice) and it would send people to back-fill old leave.
   A leave counts twice only when TALON approves it AFTER the figure is typed and the official app had already taken
   it off. The rule has to be tied to that leave, not to all leave.
2. **A member cannot do what it says.** Only the admin approves. A member with a pending bid reads "must be approved
   on TALON first" and has no move. The writer's way through ("if it ever looks wrong, type it again") is three lines
   later, behind the fold, and "looks wrong" does not say wrong against what.
3. **"After that, TALON takes off approved leave"** reads as all approved leave, including leave approved before the
   figure was typed, which never comes off.

Smaller: "it" in line 2 leans on line 1; "first" has no stated anchor; "Not counted: pending bids" sits beside a War
bal that does count them.

## The words I recommend

The order is turned round: say what TALON does after the figure is typed, then the one case where that goes wrong and
the cure. The rule is then true for everyone and needs no "must".

### Person window (phone, 45 characters a line at most)

Always shown, four lines:

| # | Line | Characters |
|---|---|---|
| 1 | Type what the official leave app shows now. | 43 |
| 2 | Then TALON takes off each leave it approves. | 44 |
| 3 | If the official app already took that leave | 43 |
| 4 | off, it counts twice. Type the figure again. | 44 |

Behind a small fold, "What counts" (11), five lines:

| # | Line | Characters |
|---|---|---|
| 5 | Safest: approve leave on TALON, then type. | 42 |
| 6 | Not taken off: pending bids, and leave on | 41 |
| 7 | days before the post-in date. | 29 |
| 8 | Leave TALON approved before typing is taken | 43 |
| 9 | as already in the figure. | 25 |

Desktop: the same sentences, unwrapped.

### Balances page (once, above the rows, always shown)

Title: **What to type** (12)

| Line | Characters |
|---|---|
| Type what the official leave app shows now. | 43 |
| Then TALON takes off each leave it approves. | 44 |
| If the official app already took that leave off, it counts twice. Type the figure again. | 88 |
| Safest: approve leave on TALON, then type. | 42 |
| Not taken off: pending bids, and leave on days before the post-in date. | 71 |
| Leave TALON approved before typing is taken as already in the figure. | 69 |

### JSON

```json
{
  "pw": [
    "Type what the official leave app shows now.",
    "Then TALON takes off each leave it approves.",
    "If the official app already took that leave",
    "off, it counts twice. Type the figure again."
  ],
  "pwFoldTitle": "What counts",
  "pwFold": [
    "Safest: approve leave on TALON, then type.",
    "Not taken off: pending bids, and leave on",
    "days before the post-in date.",
    "Leave TALON approved before typing is taken",
    "as already in the figure."
  ],
  "balTitle": "What to type",
  "bal": [
    "Type what the official leave app shows now.",
    "Then TALON takes off each leave it approves.",
    "If the official app already took that leave off, it counts twice. Type the figure again.",
    "Safest: approve leave on TALON, then type.",
    "Not taken off: pending bids, and leave on days before the post-in date.",
    "Leave TALON approved before typing is taken as already in the figure."
  ],
  "dateLine": "from official leave app on 26 Nov"
}
```

All person-window lines are 45 characters or fewer (longest 44). Counts were run by a script, not by eye.

The words say "leave", never "LVE", and every kind comes off by itself when approved, so the same words stand under
every kind's box.

## The five checks

**1. True to how the balance counts?**
- Line 1: true.
- Line 2: true going forward. One small looseness: leave on a day before the post-in date is approved but not taken
  off; line 6 says so. I judged a qualifier in line 2 not worth the length.
- Lines 3-4: true. Typing the figure again resets it, and the leave already approved then never comes off again.
- Line 5: true for the double count: approved first, then typed, the leave is inside the figure and stays out of the sum.
- Lines 6-7: true. "Not taken off" rather than "Not counted", because War bal does count pending bids; the words sit
  at the App bal box and now say only what happens to that figure.
- Lines 8-9: true, and they carry a slip neither brief names (see "A third slip" below).
- Nothing is promised that the app won't do.

**2. Does a member on his phone know what to key in?**
- Worked example (25 days, 2 Dec approved officially, official app shows 24, posted in 27 Nov). Admin's path: line 5,
  approve the 2 Dec leave on TALON, then type 24. Stays 24. Slip path: type 24, then the leave is approved, shows 23;
  lines 3-4 name exactly this and say type the figure again: 24.
- Member with his bid still pending: line 1 tells him to type 24. Line 2 tells him his bid will come off when
  approved. Lines 3-4 tell him that because the official app already took it off, it will count twice, and to type 24
  again then. He is never told to do something only an admin can do. The writer's version left him stuck at "must".
- A limit the words cannot cure: between typing and the approval, his War bal reads one day low (24 less the pending
  1 = 23), and after approval App bal reads 23 until he types again. The only figure that is right throughout would
  be 25 (the official figure with the pending day added back). I did not write that: it asks a member to do a sum,
  the figure stops matching the official app, and the date line under it stops being true. If the owner cares about
  that gap, it is a change to how the app counts, not to the words.

**3. Words cut, and anchors fixed.** See the change list.

**4. Sizes.** Longest person-window line 44. Four lines always shown (the writer had three); the fold holds five.

**5. JSON** above.

## A third slip, not in either brief

Leave approved on TALON before the figure is typed never comes off. So if TALON approved a leave and the official app
has NOT yet taken it off (the usual order when a bid is approved here before the leave is applied for officially),
typing the official figure leaves that leave out for good: the balance reads one day high until the figure is typed
again. Lines 8-9 say this plainly ("taken as already in the figure"), so a reader can see when the figure is not yet
right. They do not spell out the cure. The coordinator should confirm this is how the app will count; if it is, it
deserves a look in the walk, and one more fold line could be added: "If not yet, type again once it is." (35).

## Each change, and why

1. Trap line rewritten from "Leave it has already taken off must be approved on TALON first" to "If the official app
   already took that leave off, it counts twice": the old line covered all past leave, which is false and would send
   people to back-fill.
2. Trap line now follows the "TALON takes off" line and says "that leave": ties the double count to the one leave
   that causes it.
3. "must be approved first" replaced by "Type the figure again", always shown: a member cannot approve, and the cure
   is the same for both slips.
4. "After that, TALON takes off approved leave" became "Then TALON takes off each leave it approves": the old words
   read as all approved leave, old and new.
5. "it" (the official app) and "first" removed from the trap line: the app is named, and "already" plus "then type"
   carry the order.
6. The admin's better order kept as one optional line, "Safest: approve leave on TALON, then type": it is the right
   way in the worked example, but it must not read as a rule a member has to meet.
7. "Not counted:" became "Not taken off:": War bal counts pending bids, so "not counted" would contradict the figure
   beside it.
8. New line, "Leave TALON approved before typing is taken as already in the figure": the writer left this out as
   implied; it is the cause of the third slip and one of the two things that never come off, so it earns its place.
9. "If it ever looks wrong, type it again" dropped: "looks wrong" has no measure, both "it"s are loose, and its job
   is now done by line 4, in view without a tap.
10. Page title "What to type in the balance boxes" cut to "What to type": it sits on the Balances page above the
    boxes.
11. Fold title "What counts" kept. Four lines shown instead of three: the fourth is the cure, which must not need a tap.

## The date line under App bal

Keep it, in the words he already called clear: **"from official leave app on 26 Nov"** (33). Do not go back to
"Typed 26 Nov"; he asked what that meant. One reason, which is also the answer to "what's the point after keying in":
that date is the line the instructions turn on. Leave TALON approved before it is inside the figure, leave approved
after it comes off, so it is the only thing on screen that lets a person check a figure that looks off, and it shows
how old the figure is.
