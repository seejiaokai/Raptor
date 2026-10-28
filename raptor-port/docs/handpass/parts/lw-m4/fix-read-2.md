# M4 fixes, round 2 — the fresh, blind Opus read (28 Oct 26)

Read at 8f69f7c73 in the read-only copy `C:/m4g` (`git diff 0e2063848 8f69f7c73 -- raptor-port/src raptor-port/e2e`, the
four round-2 commits), against the first fix read (`fix-read.md`, findings 1–5 and its question), the builder's "Round 2"
section of `fixes-night.md`, and D1436's full row with the host's reading (refuse only days after the posting-out date,
whether or not the posting has run; a request with no such day approves as ever; SANS still approves). Nothing built, no
browser run. **No unit test was run: the read-only copy has no `node_modules`.** Every finding is traced through the code
named.

## Findings

### 1. MEDIUM — R2-2 reopens M4 for a tap on the empty card beside or under the calendar (touch: iPhone, iPad, a touch laptop)

**Steps.** Approvals, "Pick dates…" open, a list of several lines below it.
- Desktop layout touched by a finger (an iPad, a touch-screen laptop): the calendar is at most 360px wide at the left of a card
  up to 1240px wide. Tap the empty card to the RIGHT of the calendar — the usual "tap outside to close" — at a height where,
  once the calendar has gone, a line's Approve or Refuse will stand.
- Phone: tap the 10px band just under the calendar (its `margin: 10px 0`), or, on a 430/440-wide iPhone, the ~30–40px strip at
  the right of the calendar (card content ≈390–400px, calendar ≤360px) — exactly where line 1's Approve / Refuse sit.

**What he meets.** The calendar closes on the press, the list jumps up under the finger, and at the lift the line now under
the finger is approved or refused — a decision he never made (D1421), the M4 fault again. Round 1 ate this click (it ate
every first click); round 2 lets it through.

**Cause.** `ui/ApprovalsPage.tsx`, the picker's outside-press handler, `eat`: a click is let through when
`t0.contains(c.target)` and `!moved()`. Pressed on the empty card, `t0` is `.appr-card` — an ANCESTOR of every line, standing
above the calendar, so it never moves. The touch click is hit-tested at the lift point (the M4 mechanism), lands on a line's
button, which the card contains — so it acts. (With a mouse the click goes to the common ancestor of the down and up targets,
the card, which does nothing — so a desktop mouse is safe and the browser tests on `lw-desktop` cannot see it.)

**Fix.** Compare the nearest PRESSABLE thing, not containment:
```ts
const PRESS = 'button, a[href], input, select, textarea, label, summary, [role="button"], [role="tab"], [role="link"], [role="option"], [tabindex]:not([tabindex="-1"])'
const a0 = t0?.closest(PRESS) ?? null            // what the press was on, as a control (null: nothing pressable)
const box = a0 ?? t0, r0 = box ? box.getBoundingClientRect() : null
const moved = () => { if (!box || !r0 || !box.isConnected) return true; const r = box.getBoundingClientRect(); return Math.abs(r.top - r0.top) >= 1 || Math.abs(r.left - r0.left) >= 1 }
const eat = (c: Event) => {
  const a1 = c.target instanceof Element ? c.target.closest(PRESS) : null
  if (a1 !== a0 || moved()) { c.preventDefault(); c.stopPropagation() }
  done()
}
```
A press on nothing pressable whose click lands on a control (the card → a line's Approve) is taken; a click on the same
control that did not move acts. Test (`m4page.test.tsx`, beside "R2-2"): with the calendar open,
`fireEvent.pointerDown(page.querySelector('.appr-card'))`, `pointerUp`, then `fireEvent.click` on a line's Approve — no line
lit, the request still pending (red today: jsdom's zero boxes make `moved()` false and the card contains the button).
Browser twin on `lw-phone`: a CDP touch at the band just under the calendar's box, at the x of the first line's Approve.

### 2. LOW — R2-2 still swallows a press on a control that did not move, when the finger or mouse starts on its icon and ends on its edge

**Steps.** Approvals, "Pick dates…" open. Press the top bar's bell (or Undo, drawn as an arrow at ≤1599 wide — D1126) on its
icon, and lift a couple of pixels off the icon but still on the button.
**What he meets.** The calendar closes and nothing else happens — the second press finding 2 of the first read was about.
**Cause.** `t0` is the icon (an inner element); the click's target is the button (on a desktop the common ancestor of the down
and up targets; on a touch the hit at the lift), and the icon does not contain its own button, so `eat` takes it.
**Fix.** Finding 1's fix covers it: both resolve to the same button through `closest(PRESS)`. Test: `pointerDown` on a child
`<span>` of an outside button, `pointerUp`, `click` on the button itself — the button's handler runs once.
(Not a finding, a note: a press that closes the calendar on a short page can take the page's scrollbar away on a Windows
desktop, shifting right-aligned top-bar controls sideways by its width; `moved()` then eats that click. That errs on the safe
side — a second press — and needs no change.)

### 3. LOW — the drag window's new count says "not approved" for a Refuse or a "back to pending" the rules stopped

**Steps.** Admin drags over three of Ranger's APPROVED leave days, one of them on a locked week (or holding another bid on that
time), and presses Refuse.
**What he meets.** "2 decided. 1 not approved: Mon 9 Feb is on a locked week — not changed." — he did not ask for an approval.
(Round 1 said "1 skipped: …", which was true.)
**Cause.** `ui/SelectSheet.tsx decide`: `ruled = \`${refused} not approved: …\`` for every `bid`; `setBidStates`' `refused`
also counts `doorDecideApproved`'s reasons (`decideApprovedWhy`), which only arise on a Refuse or a put-back.
**Fix.** `const verb = bid === 'approved' ? 'not approved' : 'not changed'` and `${refused} ${verb}: ${…}`; a test beside
"R2-5 the drag window counts…" with a Refuse over an approved day on a locked week.

### 4. LOW — the windows' reasons run together, and over several men "He" names nobody

**Steps.** (a) Admin drags over Blade's and Ranger's rows across both their posting-out dates and presses Approve (or places
LL with "Approve what I enter" on). (b) One man, a drag across a locked week and his posting-out date.
**What he meets.** (a) "1 not approved: He posts out on 11 Feb: refuse or delete it He posts out on 20 Feb: refuse or delete it."
— two reasons with no break between them, and which man is "he"? (b) "2 days kept pending — Mon 9 Feb is on a locked week — not
approved He posts out on 11 Feb: refuse or delete it."
**Cause.** `SelectSheet.tsx` (both the `decide` note and the `placeApproved` branch) and `BidPicker.tsx` (the `placeApproved`
branch) print `why.join(' ')`; the door's words were written for an Approvals line, which already names the man.
**Fix.** Join with `'. '` (each reason is a sentence without its full stop). For the drag window over more than one man, have
`setBidStates` / `placeApproved` also return the reasons per man (`whyBy: Array<{ personId: string; why: string }>`, de-duplicated
on both) and print `${people(personId)}: ${why}` when `sel.people.length > 1`. Test: a two-man drag across both posting dates
names both callsigns, one reason each.

### 5. LOW (words only) — the narrowed rule's old wording survives in a comment and the build spec

**Where.** `state/store.ts`, the `decideWhy` comment ("a man whose posting has run is refused by that one body too, as every
door is") and the long comment over Approvals' one writer ("…the locked week, a man whose posting has run…"); the build spec
`docs/superpowers/plans/2026-10-27-lw-m4-build-spec.md` §8.2 ("once … a transfer has run … his Approve is refused on the line
('Posted out — refuse or delete it')") and its scenario 10 ("A posted-out man's pending request: … Approve refused on the
line"). Each now says the reverse of the code for a day before his posting-out date.
**Consequence.** The next chat building or walking §8.2 will test, or "fix" back, the blanket rule.
**Fix.** In the same change that records the host's reading (D201): reword the two comments to the one date rule, and in §8.2
and scenario 10 replace the run rule with "Approve is refused for his leave on days from his posting-out date, past tense once
the posting has run ('He posted out on 14 Oct: refuse or delete it'); a day before it approves; a SANS posting approves."

## A question for the host, not a finding

The old B12 rule also refused a DELETED man's requests (`postedOutBy` → 'gone'). Round 2 dropped the `w.gone` test from
`postingOutWhy` along with the run rule, so a deleted man's pending requests left from before his cutoff (the delete removes
those on or after it) now approve, writing an Input in his name, as his kept past months already hold (D299). That follows
"one date rule" literally; D1436 speaks only of posting out. Whether a deleted man's leftover pending bids should be
approvable is his reading to confirm.

## Each round-2 fix

- **M5 narrowed (D1436, the host's reading)** — right: `approveWhy` now carries one date rule, `postingOutWhy`, asked by every
  door that approves — Approvals' line and Approve all (`decideRequests` → `decideWhy` → `DOOR.approveWhy`, whole line refused
  when any of its days is after the date), the drag window and the one-day window's decide (`setBidStates` → `doorApprove`),
  the day's list (`decideRequestById` → `doorApprove`), "Approve what I enter" (`placeApproved` → `doorApprove`); no other
  posting check remains on any approve path. The day named is the first day posted out (`to + 1`) and that day is refused, as
  the row's reading says; "He posts out on" before, "He posted out on" once `postedOutBy` holds (the same test the line's
  "posted out" tag uses); SANS returns null. Missing only the words of finding 5, and the question above.
- **R2-4** — right and complete for the reason itself (the door's `why` reaches both windows, the old words only where it is
  empty); the joining of several reasons is finding 4.
- **R2-5** — right in the count (`refused` is the reasons pushed before de-duplication, one per skipped request, and the
  rest are told "(no bid, or Raptor-owned)"); not complete: finding 3's word for a Refuse, finding 4's run-on.
- **R2-3** — right and complete. Every decision is kept, newest first; an older one lights only where `lineStale` finds its
  exact records in its state (an approved part by its Input id, a refused one by its request id and state). Traced every order
  of up to three decisions — A·R·A, R·A·R, A·pending·R, A·pending·A, A·Undo·A — through each Undo and Redo: the light always
  names what the record holds, a pending state always takes the pending branch first, and two forms can never stand at once
  (one command replaces the records the other names).
- **R2-1** — right and complete: the taker is armed at THIS press's own `pointerup` (another finger's lift ignored), ends on
  `pointercancel` (a scroll that begins on a line arms nothing), on the next press (a second press soon after acts as itself),
  or 500 ms after the lift; a held press of any length is covered. Keyboard untouched (no pointer; Escape unchanged); a press
  inside the calendar or on "Pick dates…" arms nothing.
- **R2-2** — not right as built: finding 1 (a tap on the empty card beside or under the calendar decides a line by touch — a
  regression against round 1) and finding 2 (an icon pressed, its button's edge lifted). One fix covers both.
