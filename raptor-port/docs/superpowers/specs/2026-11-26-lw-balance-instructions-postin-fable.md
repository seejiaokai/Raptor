Model: Fable 5.2 (claude-fable-5-2). No repo file changed. Read only the two briefs.
Second version: after the owner's "What does comes off mean", the words "comes off" are used nowhere — "deducted" instead.

# The words

Always shown (two lines):
1. `Type the official leave app's balance.` — 38
2. `Only leave after post-in is deducted.` — 37

Fold, titled `What is deducted` (16):
1. `Leave approved after typing, not bids.` — 38
2. `Differs once leave is in the official app? Type it again.` — 57 (two phone lines)

Balances page, under `Typing a leave balance` (22): the same four lines, in that order.

```json
{"pw":["Type the official leave app's balance.","Only leave after post-in is deducted."],
 "pwFoldTitle":"What is deducted",
 "pwFold":["Leave approved after typing, not bids.","Differs once leave is in the official app? Type it again."],
 "balTitle":"Typing a leave balance",
 "bal":["Type the official leave app's balance.","Only leave after post-in is deducted.","Leave approved after typing, not bids.","Differs once leave is in the official app? Type it again."]}
```

Counts: 38 / 37 / 38 / 57. Three lines fit one phone line; the retype line takes two.

# Why these words

- Shown line 2 is his sentence, "it only counts leave after post in", with his own plain word "deducted". It is the
  post-in rule and nothing else, so it cannot be missed or left to the fold. Line 1 names the balance just above it,
  so "from your balance" need not be repeated; the fuller form is given below if he wants it.
- The retype line moved into the fold to make room. It is kept whole, with its "once leave is in the official app",
  because a bare "doesn't match? type again" sends a man to type too early and leaves him a day high.
- Fold line 1 answers its title ("What is deducted: leave approved after typing, not bids") and, on the Balances page,
  reads on from the line above it ("...is deducted. / Leave approved after typing, not bids.").
- "TALON" is no longer needed in any line; "bids" stands for pending bids (an approved bid is leave).

# Each case, and the line that handles it

- Post-in rule (leave before the post-in date is never deducted): shown line 2, plainly.
- Pending bids are never deducted: fold line 1, "not bids".
- Slip (a) — a leave the official app already deducted is approved on TALON after typing, so it is deducted twice:
  fold line 2. The leave is in the official app and the two figures differ, so he types again.
- Slip (b) — a member types while his own bid is pending and the official app already deducted it: fold line 1 tells
  him the bid is not deducted yet; once it is approved the figures differ and fold line 2 cures it.
- Slip (c) — a leave approved before typing that the official app has not yet deducted: fold line 1 says only leave
  approved AFTER typing is deducted; once the official app has it the figures differ, and fold line 2 cures it.

# Three things for the coordinator to judge (none measured on the real screen)

1. If he wants "from your balance" said outright: `Only leave after post-in is deducted from your balance.` (55, two
   phone lines). I kept the one-line form because line 1 already names the balance.
2. Leave ON the post-in date itself is deducted (only days before it are not). "After post-in" is his own phrase and
   reads as "once posted in", so I kept it. The exact alternative: `Only leave from post-in date is deducted.` (41,
   may wrap).
3. "post-in" without "date": if the screen's own label is "post-in date", the fuller line is
   `Only leave after post-in date is deducted.` (42, may wrap).

If the retype line must fit one phone line, the only way I found drops its "when" (`Still differs later? Type it
again.`, 35) — not recommended, for the reason in the brief.
