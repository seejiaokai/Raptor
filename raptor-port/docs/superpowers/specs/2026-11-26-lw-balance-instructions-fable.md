Model: Fable 5.2 (claude-fable-5-2). Fresh writer; I read the brief only, not the plan or the spec. No repo file changed.

# Instructions at the leave-balance box

## 1. The words

One set of five sentences, used in both places. No "you" or "your", so they read right for a member typing his own
figure and for an admin typing someone else's.

### Person window, App bal box (phone, wrapped to 45 characters a line)

| # | Line | Characters |
|---|---|---|
| 1 | Type what the official leave app shows now. | 43 |
| 2 | Leave it has already taken off must be | 38 |
| 3 | approved on TALON first, or it counts twice. | 44 |
| 4 | After that, TALON takes off approved leave. | 43 |
| 5 | Not counted: pending bids, and leave on days | 44 |
| 6 | before the post-in date. | 24 |
| 7 | If it ever looks wrong, type it again. | 38 |

Desktop: the same five sentences, unwrapped (the tile is wider; nothing else changes).

### Balances page (once for the page, above the rows)

Title: **What to type in the balance boxes** (33)

| Line | Characters |
|---|---|
| Type what the official leave app shows now. | 43 |
| Leave it has already taken off must be approved on TALON first, or it counts twice. | 83 |
| After that, TALON takes off approved leave. | 43 |
| Not counted: pending bids, and leave on days before the post-in date. | 69 |
| If it ever looks wrong, type it again. | 38 |

On a phone these wrap by themselves to about 8 lines under the title; on a desktop each is one line.

### JSON

```json
{
  "pw": [
    "Type what the official leave app shows now.",
    "Leave it has already taken off must be",
    "approved on TALON first, or it counts twice.",
    "After that, TALON takes off approved leave.",
    "Not counted: pending bids, and leave on days",
    "before the post-in date.",
    "If it ever looks wrong, type it again."
  ],
  "balTitle": "What to type in the balance boxes",
  "bal": [
    "Type what the official leave app shows now.",
    "Leave it has already taken off must be approved on TALON first, or it counts twice.",
    "After that, TALON takes off approved leave.",
    "Not counted: pending bids, and leave on days before the post-in date.",
    "If it ever looks wrong, type it again."
  ]
}
```

### The other kinds (CCL, FCL, PL, EL, CL)

The words never say "LVE" — only "leave" and "the official leave app" — so they can stand for every kind typed the
same way. That holds only if TALON takes approved leave of those kinds off their balance the same way it does for LVE.
I did not check that in the app. If only LVE comes off by itself, sentences 2 to 4 are true for LVE only and should sit
under the LVE box alone, with the other kinds keeping just sentence 1. The coordinator should check this before drawing.

## 2. Always shown, or folded

- **Balances page: always shown, all five, once at the top.** There is room, it is one block for the whole page, and
  this is where an admin types many figures in a row — the place a slip costs most.
- **Person window: lines 1 to 3 always shown; lines 4 to 7 behind a small "What counts" fold** that opens on a tap.
  Lines 1 to 3 are the instruction itself and the one trap that makes a day count twice — the thing he asked for, "so
  they know what to key in". They must not need a tap. Lines 4 to 7 explain and reassure; a person who never opens them
  still types the right figure. Three small grey lines fit the tile; seven crowd it.
- Not a "?" that shows on hover: a phone has no hover, and a "?" hides the very line that prevents the slip.
- If he would rather have no fold at all, all seven lines shown is the fallback — nothing is reworded for it.

## 3. Against the baseline

- **Slip (b) is covered, by one word.** The baseline says "put on TALON" — a pending bid IS on TALON, so a person with
  a pending bid thinks he is done, types the official figure, and loses the day again when the bid is approved. Mine
  says "approved on TALON first". That one rule covers both slips: leave not yet on TALON, and leave on TALON but still
  pending.
- **It says the consequence** ("or it counts twice"), so the rule reads as a reason and not as a chore.
- **It names what does not count in one place**, in his own framing ("what counts or what doesn't"): pending bids and
  leave on days before the post-in date. The baseline leaves pending bids out.
- **It gives the cure for every slip** in the last line: type it again. The baseline has none, so a person who slipped
  has no way back from the words on screen.
- **Works for the admin too** — the baseline's "your post-in date" is wrong when an admin types another person's figure.
- The worked example passes: 25 days, 2 Dec approved officially (shows 24). The words say get the 2 Dec leave approved
  on TALON first, then type 24 → 24 stays. Typed the other way round it shows 23, and "if it ever looks wrong, type it
  again" brings it back to 24.

Left out on purpose:
- "after your post-in date" from the trap line. Leave on a day before the post-in date never comes off, so putting it
  on first does no harm; the shorter rule is still right and is easier to follow.
- That leave already approved on TALON when the figure is typed never comes off again. It follows from "after that" in
  line 4, and saying it separately adds a line without changing what anyone types.
- War bal and how it is worked out — that belongs to the War bal figure, not to the box where App bal is typed.
- A limit, stated plainly: a member cannot approve his own bid. For him "must be approved on TALON first" may mean
  waiting for the admin; the last line is his way through — type now, and type again once it is approved.

## 4. The line "from official leave app on <date>"

Keep it, shortened to **"Typed 26 Nov"** (12). One reason: the date is the line between leave that has been counted
and leave that will come off by itself — it is what "after that" in the instructions points to, and it shows at a
glance how old the figure is. The words "from official leave app" can go: the instruction beside it now says so.
