Model: Fable 5.2 (claude-fable-5-2). No repo file changed. Read only the writer's brief and the writer's report.

## Verdict

Two of the four lines change; two stay, and both titles stay. I would not keep the writer's words unchanged:
shown line 2 gives the wrong advice in the everyday case, and fold line 1 can be read two ways.

## The final words

Always shown:
1. Type the official leave app's balance. (38) — unchanged
2. Differs once leave is in the official app? Type it again. (57, two phone lines) — changed

Fold "What comes off" — name unchanged:
1. Leave TALON approves after typing comes off. (44, may wrap by one word) — changed
2. Not pending bids or leave before post-in. (41, may wrap by one word) — unchanged

Balances page: title "Typing a leave balance" (22), unchanged, then the same four lines.

```json
{"pw":["Type the official leave app's balance.","Differs once leave is in the official app? Type it again."],"pwFoldTitle":"What comes off","pwFold":["Leave TALON approves after typing comes off.","Not pending bids or leave before post-in."],"balTitle":"Typing a leave balance","bal":["Type the official leave app's balance.","Differs once leave is in the official app? Type it again.","Leave TALON approves after typing comes off.","Not pending bids or leave before post-in."]}
```

Total 180 characters (the writer's 149, the coordinator's 200). No line passes two phone lines.

## The reason for each change

- Shown line 2: "No longer matches?" fires in the everyday case, when the gap is correct, so it sends a person to type too early; the new line says when to retype.
- Fold line 1: "approves later comes off" can be read as "comes off later", and "later" names no starting point; "after typing" names it.

## The five checks

**1. Truth.** Shown line 1 and fold line 2 are true as written. Fold line 1 is true but ambiguous (see check 3).
Shown line 2 is true only as a cure, and misleads on timing (check 2). One sentence in the writer's report is not
true: "no wrong figure lasts". In the everyday case below, a wrong figure lasts for the whole wait.

**2. The everyday case. Yes, the writer's line sends him to type too early.**
- Leave is approved on the Leave War first, and goes into the official app only afterwards. In between, TALON reads
  one day lower, correctly.
- "No longer matches? Type it again." is true at that moment, so he types the official figure, one day too high.
- That leave was approved before the typing, so it never comes off. TALON stays a day high until the official app
  catches up and he types a second time.
- This happens on every approval, not only on a slip: two typings per leave, with a figure a day high in between,
  which could let a person bid a day they do not have.

The new line gives the moment: retype only once the leave is in the official app. Checked against each case:
- Everyday case: the two differ, but the leave is not yet in the official app, so he waits; then they match. No typing.
- Slip (a), official app already took it off, TALON approves after typing, comes off twice: the leave is in the
  official app and the two differ, so type again. Covered.
- Slip (b), member types while his own bid is pending: the same once the admin approves. Covered.
- Slip (c), approved on TALON before typing, official app not yet: they match at typing; once the official app
  takes it off they differ, so type again. Covered.
- Leave the official app holds that never went through TALON: it is in the official app and the two differ, so
  type again. Covered. This is why the line says "in the official app" rather than "in both": "in both" would
  never come true for that leave.

A shorter form, if wanted: "Differs once leave is in that app? Type it again." (49). It is also two phone lines,
so it saves nothing on screen, and "that app" could be taken for TALON; I prefer the full one.

**3. Plain reading.**
- "post-in": squadron wording and the owner's own word; clear to a member and to the admin. Kept.
- "later": the weak word. Later than what is not said, and the line garden-paths. Replaced by "after typing".
- "leave TALON approves": reads well enough for both readers and is short. Kept. (Strictly a person approves it on
  TALON; "Leave approved on TALON after typing comes off." at 47 is the stricter form if he prefers it.)
- Fold line 2 leans on the line above for its verb. It sits directly under it in both places, so it holds.

**4. The fold's name.** "What comes off" is right: it is the question the fold answers, in the lines' own words. Kept.

**5. Limits.** Two lines shown, two in the fold. Line 1 fits one phone line. Shown line 2 takes two phone lines
(the writer's took one): that is the price of the timing, and it is within the limit. The two fold lines may each
wrap by one word.

## Not checked

I did not open the repo, so I have not confirmed how the app itself names the official leave app or the post-in
date on screen; the words follow the two briefs.
