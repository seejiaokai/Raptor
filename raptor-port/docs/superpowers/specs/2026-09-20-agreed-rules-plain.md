# The agreed rules, in plain words — by screen and by type (20 Sep 26)

Everything settled for the one-absence model, written the way the owner asked: **which screen**, **what
kind of entry**, and **what happens**. The register
(`2026-09-20-one-absence-behaviour-register.md`) remains the formal record with rule ids; this file
is the readable one.

---

## The two screens

**The Inputs page** — the form. Pick a person, pick a type, pick dates and times, tap Add. This is
where an absence is **filed**. Whatever is filed here counts as already granted.

**The Leave War** — the grid: people down the side, days across. Tapping a day opens a box; dragging
across days selects a block. Four things happen here:
- **Bid** — a member asks for leave.
- **Decide** — an admin approves or refuses a bid.
- **Move** — an admin shifts leave to another date.
- **OIL** — an admin types an FO or HO credit by hand.

---

## The kinds of entry

| Kind | Examples | Shows on the war? | Costs leave? | Takes them off manning? |
|---|---|---|---|---|
| **Leave** | LL, OL, OIL, CCL… | Yes | Yes | Yes |
| **Medical** | ATT C, HL, OML | Yes | No | Yes |
| **ATT B** | ATT B | Yes | No | **No** — can work, just not fly |
| **Course / overseas duty** | CSE, OD | Yes | No | Yes |
| **Work** | the published schedule; an acknowledged duty; a hand-typed FO/HO | As an OIL credit | No | **No** — at work, off the flying programme |
| **Upchit** | upchit | No | No | No |
| **SANS offer** | SANS availability | No | No | No |

---

## THE ONE RULE

> **Two different facts fighting → let both in, and flag the day.
> The same fact twice → refuse it, and say what is in the way.**

Everything below is that sentence applied.

---

## What clashes, and what happens

### Refused — the same fact twice

Refused on **both screens**, with a message naming what is already there and on which day.

- **Leave over leave**, where the hours really overlap.
- **Leave over a medical.** Refused whole, naming the medical.

There is nothing to resolve in either case: one of the two is simply wrong.

### Allowed and flagged — two different facts

Allowed on **both screens**. The day gets an amber `!`, the warning list names it, and it stands
until someone removes one side.

- **Leave and work on the same hours.** He is on the flying programme and he also has leave.
  Both might be true; somebody has to decide which gives way.
  - Remove the work → the OIL credit goes.
  - Remove the leave → the credit stays.

This holds however the two arrive and in whichever order: filed on the form, bid on the grid,
approved on the grid, moved onto the day on the grid, or published over the top by the schedule.

- **A medical and work on the same day.** Same treatment.

### Allowed, no flag at all

- **Leave beside leave at times that do not overlap.** LL 08:00–10:00 and OL 10:30–11:30 both go in.
  The half is charged **once**, to whichever covers more of it; a tie goes to the earlier one.
- **Back to back.** A leave ending 10:00 and another starting 10:00 do not overlap.
- **Leave during a course or overseas duty.** The leave shows as the code and is charged; the course
  sits behind the grey count.
- **ATT B beside work.**
- **Leave and work at times that miss each other.** Work 08:00–10:00, leave 13:00–15:00.

---

## Medicals

- A medical **cuts** the leave it overlaps, and the cut leave goes back to the balance.
- The cut keeps **the hours the medical does not cover**. A medical 09:00–14:00 leaves the man with
  leave **from 14:00** — not from noon, and not nothing at all.
- A medical recorded with times counts as **half a day at six hours or less**, a full day past that.
  Which half: the side of noon it sits on.
- Its **real hours** decide every clash. A 2-hour appointment does not own the whole morning.
- A medical running **past midnight** counts on the next day too, for clashes only — it is not shown
  or charged there.
- **A second medical of the same type** over the same days is refused: edit the first one and attach
  the new document to it.
- Medical is **filed by the member on the Inputs page only** — it cannot be typed on the war.

---

## Bids on the Leave War

- An **undecided bid loses to any clashing input**, in the same action, and the filer is told which
  bid went. One undo brings it back.
- Only the **clashing half or dates** go. The rest keeps its state.
- An **approved** leave is never touched this way. A **refused** bid never blocks anything — it
  stays as history.
- **Publishing is a door**: the bid replacement happens inside the publish, so undoing the publish
  brings the bid back. Published work replaces a bid **only on weekends and public holidays**.
- When **someone else's** action replaces a bid, a notice sits on that day with an amber mark until
  the person or an admin taps **"OK, seen"**. Your own action leaves no notice, just a message.
- A member may **bid each half separately**, and may bid the free half beside filed leave.
- **A duty answered "yes, this earns OIL" takes the clashing part of your own bid off that day** —
  the same as publishing would. *(Ruled; not yet built.)*

---

## Times

- The morning is **00:00–12:00**; the afternoon is **12:01–23:59**.
- **Leave starting at exactly 12:00 is the afternoon** — half a day, half a man off manning.
- A window **ending** at 12:00 is still a morning.
- Everything is judged on **real times**, never on which half a thing is drawn in.

---

## Money and manning

- **Every figure reads the records, never the code shown in the box.**
- A half shared by two leaves is **charged once**.
- Two half-day leaves of different types both come off **their own balances**.
- **The 15-day rule** — pilots only, LL and OL only. Once a run reaches 15 days, the weekends and
  public holidays inside it are charged too. A day covered morning-LL and afternoon-OL is a full day
  and continues the run; anything else breaks it.
- **Leave before someone joins and after they leave** is allowed, filed or bid. It shows, it is
  charged, and it is **never** counted for manning. After posting out the box carries the PO mark.
  *(Two halves of this are still broken — see below.)*
- One running balance per person. Per-year balances are deliberately not built.

---

## OIL

- Working a **weekend or public holiday** earns OIL. Six hours or less is a half day (HO), more is a
  full day (FO).
- A duty landing on a weekend or public holiday is **never credited silently** — the person is asked
  first, and the answer is part of the same action, so one undo takes both.
- A credit sits **beside** an absence, flagged, and is banked until someone resolves it.
- A credit **never outlives the hours that earned it** — re-time the duty and the credit follows.
- A **hand-typed** credit is the admin's own: the app never deletes it. If the schedule later earns
  the same credit it is taken over in place, the admin's own reason is kept, and when the schedule
  stops backing it, it is **handed back** rather than removed.
- A hand-typed credit with **no times means the whole day**. *(A box to type its hours is ruled but
  not yet built — until then this blocks more than it should.)*
- A **SANS offer is never work**: it never earns OIL and never counts as worked.
- An **upchit is not work** either. It never earns OIL, never blocks leave, and only ends a covering
  medical early.

---

## What the box shows when a day holds several things

Top of this list wins the box; the rest sit behind a grey `+n`, and tapping lists them all:

1. Leave · 2. Off sick · 3. OIL earned · 4. Away on duty or a course · 5. ATT B ·
6. An undecided bid · 7. A refused bid

A full day beats a half; between two halves the earlier one shows. An **amber `!`** replaces the
grey count whenever the day needs someone to look.

---

## Still to build (ruled, not done)

1. **A duty answered "yes" taking your bid off that day.**
2. **A box to type the hours on a hand-typed OIL credit.**
3. **Members seeing the warning words**, not just the amber mark — the explanation is admin-only today.

## Still broken (found, not yet fixed)

4. A **posted-out man's whole row disappears** from the grid once the months scroll past his posting
   window, while his clearing leave is still charged.
5. A day **before someone joins cannot be tapped**, so leave can be filed there but not bid.
6. **Cannot bid the free half** beside leave filed on the Inputs page — the tap opens a read-only panel.
7. A **SANS offer over leave warns nobody.**
8. Someone's **OIL balance can go below zero silently** when an admin resolves a clash.

---

## Rulings on the outstanding list (owner, 20 Sep 26)

**A person's row spans their RECORDS, not just their posting window.** A man posted out on 31 January
with clearing leave in September must still be visible in September. The row is drawn from the
earliest of (posting-in, first record) to the latest of (posting-out, last record) — "if there's
leave it will use the end or start of leave to show". This replaces the August rule that dropped the
row the month after posting out, which was written before clearing leave existed.

*Consequence to watch:* the row appears BECAUSE a record is out there, so the very first pre-join or
post-out leave has to be filed on the Inputs page form. Once it exists the row shows, and the days
around it can be bid on the grid. In practice pre-join leave is filed by an admin anyway, so this is
the normal path rather than a workaround — but it is worth knowing.

**Bidding the free half beside Inputs-filed leave is allowed.** The read-only panel is right about
the leave that came from the form, but it must not lock the whole day: the free half stays biddable.

**OIL may go negative.** "It's ok to go negative OIL, because OIL can be earned back in the future."
So a resolution that withdraws a credit someone has already spent is not an error and needs no
guard. The existing notice on the Unpublish button stays as INFORMATION — it tells an admin what
they are about to do — but nothing anywhere blocks or must warn on account of a negative balance.

**A duty clearing your bid: decided, deliberately not built.** A Duty or "Fly with" entry that has
been ANSWERED takes the clashing part of your own bid off that day, whichever way the OIL question
was answered — being at work and being paid for it are different things. Parked because an admin
always decides a bid before the day arrives, and the day is already flagged amber when they do, so
this saves a decision rather than preventing a mistake.

**Parked, bigger than the rest:** the Leave War can only see work that earned an OIL credit, which
only happens on weekends and public holidays. Ordinary weekday work is invisible to it entirely.

**The member sees the WORDS, not just the mark — and that replaces the auto-cancel.** The real
problem with a bid left standing was never the admin's extra click: it was that the member's own row
shows the OIL credit in the box with the bid hidden behind the amber mark, so his leave request
looks like it has been thrown out when it is still waiting for a decision. The fix is to TELL him,
not to cancel it. The sentence explaining a clash is admin-only today; it becomes visible to the
person it is about, for their own row. Owner, 20 Sep 26: "park the auto-cancel, do the words
instead." Same problem solved, and it shows an existing message to one more group of people rather
than widening the inputs gate — the file four of today's defects lived in.
