# [S4-BUGHUNT] batch 2 — the applicable rulings, before a line is written

> **Read `specs/2026-09-20-CURRENT-STATE.md` first.** Decisions in this session changed several
> times; that file is the destination and this one is part of the journey. Where they disagree, that
> one is right.


First run of the standing order (CLAUDE.md §How to work here, owner 20 Sep 26): search the record
for every ruling that applies, list them, then hand-test the build against this list in the running
app, ruling by ruling, and report pass/fail per ruling.

Eight items. For each: what is being built, **every ruling that bears on it** (not just the one that
prompted it), and the check that proves it in the app.

---

## 1. Work and an absence on the same hours — the credit LANDS (N2)

**Rulings that apply**

| Ruling | What it demands here |
|---|---|
| **N2** (owner, 20 Sep, newest) | The credit is created, the day is flagged, it stays banked until resolved. Remove the work → no credit. Remove the leave → credit stays. |
| **B4** — *superseded in part* | Its "Overlap → no credit" half is **set aside by N2**. Its TIME test stands: the credit only clashes when the hours really meet, and a credit beside a non-overlapping absence still lands. |
| **Mark** | An amber `!` replaces the grey count whenever the day needs an admin. A clash is such a day. |
| **B5** | The OIL pass never deletes a request. Whatever I build must not make the pass start deleting things. |
| **Q6** | A medical on a worked day keeps both and goes amber — N2 now makes this TRUE where it was not. Check it. |
| **Figures read the records** | With the credit present, the OIL earned figure counts it and the leave still charges its own half. |
| **away / duty** | A credit removes nobody from manning (at work, off the flying programme). The leave still does. The count must not double. |
| **§18 OA3-003** | A hand-typed credit is never removed by the pass. Unchanged. |

**Hand-test:** a Saturday with approved leave 10:00–14:00 and published work 08:00–12:00. Expect: the
credit present with its hours, amber on the box, the warning list naming it, OIL earned up, leave
still charged its half, the person counted away once. Then unpublish → credit gone. Re-publish, then
delete the leave → credit stays. **Both entry orders must give the same picture** — that was the
defect.

---

## 2. An acknowledged duty replaces the person's own undecided bid (N3)

**Rulings that apply**

| Ruling | What it demands here |
|---|---|
| **N3** (owner, 20 Sep, newest) | Answering "yes, this earns OIL" removes the clashing part of their own undecided bid, in the same action, and tells them. |
| **H1** | Settles what "recorded work at the same time" means. An *unacknowledged* duty or fly request is still NOT recorded work — only the answered one replaces. |
| **Owner rule (19 Sep)** | Replacement happens in the SAME command, one undo brings the bid back, the filer is told plainly which bid went. |
| **Owner answer B** | Only the clashing half/dates go. A full-day bid against 08:00–12:00 work keeps its afternoon. |
| **Owner answer A** | Only weekends and public holidays. The OIL ask only fires there, so this is satisfied by construction — but assert it. |
| **B6** | Their OWN action → a message, no notice. Someone ELSE filing it for them → a notice with the amber mark until "OK, seen", actor frozen, undone with the replacer. Decided by the LOGIN, not "View as". |
| **B5** | Must sit in the door that writes the input — **not** in the OIL pass, which never deletes a request. |
| **Refused bids** | A refused bid never blocks and is never replaced; it stays as history. |

**Hand-test:** member bids LL on a Saturday; the same member files a duty 08:00–12:00 that day and
answers yes. Expect: morning half of the bid gone, afternoon still pending, a message to them, no
notice, credit landed, one undo restores the bid AND removes the credit. Repeat with an admin filing
it for them: expect a notice, amber, "OK, seen" clears it.

---

## 3. Leave onto a worked day, allowed when the hours miss (N4)

**Rulings that apply**

| Ruling | What it demands here |
|---|---|
| **N4** — **STALE, see CURRENT-STATE §5** | Written as "refused when the hours overlap". The owner reversed it the same day: nothing is refused for recorded work, on any screen. |
| **H3 as overruled** | Overlap on real times — the same test as leave vs leave. |
| **B8 / Q7** | A credit with no times means the whole day, so it still blocks. Only item 4 makes N4 reachable. |
| **N2 — the deliberate asymmetry** | Work onto leave is allowed and flagged; leave onto overlapping work is refused. **This is the owner's choice, confirmed 20 Sep. Do not "fix" it.** |

**Already true in code** — the refusal has always compared real hours. Nothing to build; assert it,
and prove it becomes usable once item 4 lands.

---

## 4. A box for the hours on a hand-typed credit (N5)

**Rulings that apply**

| Ruling | What it demands here |
|---|---|
| **N5** (owner, 20 Sep) | Build it. |
| **B8** | "A manual credit MAY carry work times." |
| **Q7** | No times = the whole day. The box must be optional and default to that. |
| **§18 OA3-003** | A manual credit is the admin's; the pass never removes it. Adding times must not turn it into an `auto` one. |
| **Admin only** | Only an admin edits OIL (the existing rule on the credit's reason). |
| **B4 time test** | Once it has hours, leave outside them is allowed. |
| **UI quality axis** (owner, 12 Aug, standing) | Phone and desktop; reachable; real empty/error states; production wording, no prototype caveats. |
| **hh:mm everywhere** (owner, 30 Aug) | The box reads `08:00`, accepts `800`/`0800`/`8:00`, shows `08:00` after commit. |

**Hand-test:** admin types HO on a Saturday, sets 08:00–10:00. Expect the tap list to read "worked
08:00–10:00"; leave 13:00–15:00 that day is then accepted; leave 09:00–11:00 is refused naming the
hours. Clearing the times returns it to whole-day. Check at 390px.

---

## 5. A posted-out person's row must not vanish while their leave is charged (R4a)

**Rulings that apply**

| Ruling | What it demands here |
|---|---|
| **Owner answer C** (20 Sep, newest) | Leave after posting-out shows as the leave code with the PO mark, is charged, never counted for manning. |
| **Owner 19 Aug** — *superseded in part* | "Once I hit the next month the row disappears." Still true for a person with NOTHING out there; it cannot hold where answer C says the leave shows. |
| **H5** | A leave-date eligibility check, never a loosened "in squadron". |
| **Figures read the records** | The box and the money must not disagree — that is the actual defect. |
| **Leave War window engine** (`docs/performance.md`, standing) | The row test runs per person per render. Must not measure per day or repaint the grid. |

**Hand-test:** post someone out in January, file clearing leave in September, scroll to September.
Expect the row present, the leave shown with the PO mark, charged, manning unchanged. Then remove
that leave and scroll again: the row goes, as before.

---

## 6. A day before someone joins can be bid, not just filed (R4b)

| Ruling | What it demands here |
|---|---|
| **Owner answer C** (20 Sep, newest) | "filed **or bid**", before posting-in and after posting-out. |
| **Owner 18 Aug** — *narrowed* | An admin taps a struck day to undo a post-out. A pre-join day is not a post-out — true, but that is no longer a reason to make it inert. |
| **H5 / leave-date eligibility** | The war must hold the day. |
| **Manning** | Never counted, before or after. |

**Hand-test:** person posts in 1 Mar; tap 25 Feb as that person and as an admin. Expect the bid box.
Place it, check it shows in the otherwise-blank box, is charged, and manning is unchanged.

---

## 7. Bidding the free half beside Inputs-filed leave (R7)

| Ruling | What it demands here |
|---|---|
| **Q2** | "A member may bid each half separately, and may bid the free half beside filed leave." |
| **Q14** | Inputs-page leave counts as already approved — which is exactly why the cell reads as locked today. |
| **B1 / B3** | Several records per day; different halves sit side by side. |
| **The "approved elsewhere" mark** | Must still tell the user that the LEAVE was filed on the Inputs page and nothing here changes it — the lock is about that record, not about the free half. |
| **`[LW-LOCKMARK]`** (OUTSTANDING) | The lock marker is still synthesised per box rather than per record. This item is the first real consequence of that; note it, do not fix it here. |

**Hand-test:** morning leave filed on the Inputs page; tap that day as the member. Expect a way to
bid the afternoon, the morning still marked as filed elsewhere, both charged once each.

---

## 8. A SANS offer over leave warns (R5)

| Ruling | What it demands here |
|---|---|
| **Q15** | "A warning only" — never refused, never work, never earns OIL, never on the war. |
| **Production copy** (owner, 25 Aug) | Real wording, no prototype caveats. |

**Hand-test:** file leave, then a SANS offer on the same day. Expect it saved, with a warning naming
the leave.

---

## Clashes found while writing this list

Reported under the standing order's step 4.

1. **N2 vs B4** — already put to the owner and ruled; B4's "no credit" half is set aside, its time
   test stands. Recorded in the register §10.
2. **N3 vs B5** — no true clash, but B5 CONSTRAINS N3: the pass must never delete a request, so the
   replacement has to sit in the door that writes the input. Noted so the build does not drift into
   the pass.
3. **Owner answer C vs the 19 Aug disappearing-row rule and the 18 Aug struck-day rule** — both
   August rules still run and both contradict answer C. Answer C is newer and wins; the August rules
   survive only for a person with no leave outside their window.
4. **N4 vs N2** — deliberately asymmetric, confirmed by the owner. Written down in the register so a
   later reader does not file it as a bug.
