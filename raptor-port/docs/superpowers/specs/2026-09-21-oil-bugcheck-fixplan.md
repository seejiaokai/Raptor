# The OIL bug check — triage and the ordered fix plan (21 Sep 26)

Two independent reviews of `claude/oil-auto-remove-design`, neither by the model that built it:
**Fable 5.1 (high)** → `2026-09-21-oil-bugcheck-fable.md`, **Astra/Codex (high)** →
`2026-09-21-oil-bugcheck-codex.md`. This file is the triage: what is real, what is new, what the
owner ruled, and the order to fix in. Where a reviewer's fix is quoted it is because it was checked
against the code and found correct — several were not, and those are marked.

## What the two reviews were worth

They were **complementary, not duplicative**, and each found something the other had explicitly
declared clean:

- Codex answered P6 with "I found no second money resolver". Fable found one — `publishFlagsBids`
  still expands a sentinel through the live `availableFor`.
- Fable classed `creditable`'s live-roster read as pre-existing and out of scope. Codex classed it
  HIGH and in scope. Provenance checked against `main`: pre-existing, but the branch rewrote that
  exact guard, so it is pre-existing-and-newly-in-hand.
- Both found the masked-puck write, from different ends.
- Both found the live/frozen calendar seam — **from opposite directions, proposing opposite fixes.**
  That is the signature of an undecided question, not a coding error. It went to the owner. See R-1.

## THE OWNER'S TWO RULINGS (21 Sep 26), which this plan is built on

**R-1 — ONLY THE ISSUED SCHEDULE PAYS, BOTH DIRECTIONS.** A public holiday declared *after* a day
went out does not pay until the day is published again, and the app must SAY SO on the day. The
reverse follows the same rule: taking a holiday off a published day no longer removes anybody's day
in lieu silently — that also waits for a republication. One rule, both directions. This confirms the
standing ruling that a day's OIL comes from its latest published version, and it settles the
Codex/Fable conflict in Codex's direction plus Fable's on-screen prompt.

**R-2 — THE TWO PRE-EXISTING MONEY BUGS ARE FIXED HERE**, not filed. Both are the same root cause as
R-1 (money decided by what is live now instead of by what went out), so they are one coherent change
rather than three patches.

**Carried from earlier the same day — O-1 (see `OUTSTANDING.md`):** the green bar is drawn only on
the events that COUNTED towards the man's day. Built in this same pass; it supersedes §2.10 / OIL21.

---

## THE ROOT CAUSE, named once

Four of the eight defects are one thing: **the freeze boundary has more doors than `creditFrom`.**
The build made `creditFrom` the single door for money on a published day and then left three live
reads upstream of it — the war's calendar, the live roster, and the landed row's own state. Each
one can move money a published document already promised. Fix the boundary, not the four symptoms:
**everything the money depends on comes from the frozen block, and `creditable` rejects only things
that are not people.**

---

## THE FIX LIST, in build order

Root cause first, then the things that sit on it, then display, then the latent ones.

### 1. [FREEZE] The war's calendar must not gate a published day's money — R-1
*Codex F1 (HIGH) + Fable F2 (MEDIUM), same seam from both ends.*

`desiredOilCells` skips a day on the live `warHolding(...) && isNonWorkingISO(...)` before it ever
reads the issued block, in both the loaded-week and the stashed-week loops. So revoking a holiday
sweeps a landed credit with no amendment, and a block-less legacy snapshot never reaches its
protection. The grant direction is already frozen (`oilEarnedWork` returns nothing unless the frozen
`ev.earns`), which is the asymmetry.

1. In both loops replace the gate with `if (!iso) continue` — only an unreadable date skips before
   the snapshot is resolved. The frozen `ev.earns` then decides, in both directions.
2. In `creditFrom`, change `if (!ev) return false` to `if (!ev || ev.iso !== iso) return false`, so
   the documented date binding is real and a misfiled block protects instead of paying.
3. **Leave** the forward write's own `warHolding` check in `runOilPass` alone. It decides whether a
   NEW cell has a destination; it must not decide whether an issued credit is swept.
4. Add the prompt R-1 requires, in `validate.ts` beside `OIL_UNPUBLISHED`: on an approved day whose
   live candidate would earn but whose frozen block says it does not, advise *"This day started
   earning OIL after it was published — publish it again so the OIL lands"*. It must NOT fire on an
   unapproved day (`OIL_UNPUBLISHED` already covers that one).
5. Rewrite the existing test that pins the old behaviour (`oilsync.test.ts`, the PH-revoked test).
   It does not merely miss the bug — it asserts the wrong answer.

### 2. [FREEZE] `creditable` must not consult the live roster — R-2
*Codex F2 (HIGH). Provenance: pre-existing on `main`, where the guard was stricter still; the branch
rewrote it for hidden SANS and left the live read in.*

An archived body fails the guard, so the reverse sweep deletes a credit the issued document already
promised. Drop the live-roster set entirely and reject only non-people:

```ts
const creditable = (id: string) => {
  const p: any = (PEOPLE as any)[id]
  return !!(p && !p.special)
}
```

Deliberate consequences, all correct under the doctrine: an archived man keeps what he earned; a
hidden SANS keeps his (already ruled 21 Sep); a **named** ground-crew body keeps his (O-2, ruled
"leave it"); a sentinel is still not a person and still earns nothing. The credit lives on the
person and the date, so it lands and waits for the row — the same reasoning the hidden-SANS fix
already used. Rewrite the guard's comment: it now rejects sentinels, not bodies the roster hides.

### 3. [FREEZE] A cancelled or info-only landed row must earn nothing — R-2
*Codex F3 (called HIGH/new) + Fable F10 (called LOW/pre-existing). Provenance: pre-existing — `main`
never checked the row either — but the new `allow` mark is a NEW route into it, and §3.3 already
rules that anything cancelled earns nothing. Fable was right about the age, Codex right that it must
be fixed.*

The schedule half skips every `src` row so the claim owns it; the input half then accepts the claim
from `acc`/`win`/`ans` alone and never looks at whether the row it landed on was cancelled or turned
info-only. Add one helper and route both readers through it:

```ts
export function oilInputEligible(day: any, inp: OilInputEv): boolean {
  if (!inp.asks || inp.acc === 'r' || !inp.win) return false
  if (inp.acc !== 'g') return true
  const row = (day.ground || []).find((g: any) => g && String(g.src || '') === inp.iid)
  return !!row && !row.cx && !row.info
}
```

Use it in `oilEarnedWork` in place of the inline test, and in `oilEligible` in place of its copy.
**Include `info`, not just `cx`** — an ⓘ row gives the man nothing, which is the same judgement O-1
makes about the green bar, and the two must agree.

### 4. [MASK] A tap under a mask must not rewrite what it hides
*Codex F4 + Fable F1, both HIGH, both certain. Confirmed by reading the two click branches: the item
branch guards on the blanket, the person branch guards on nothing.*

`oilPersonOn` returns false whenever the item is masked, and `toggleOilPerson` reads that masked
false as the man's own decision — so a tap deletes a stored `deny` or writes an `allow`, invisibly,
under a puck that stays dim. §9.1 says a mask hides decisions and never deletes them.

1. In `toggleOilPerson`, **before `decOf(di)`** so a masked tap does not even mint an empty record:
   `if (!oilItemOn(di, item)) return false`.
2. Harden the item writer the same way: `if (!item || oilBlanketOn(di)) return false`.
3. In the board's person-puck branch, refuse with an honest toast naming which mask is on.
4. Draw a masked puck **inert** — no tap target — and change its title, which currently invites the
   very tap that breaks it ("tap to put him back on it"). Keep the day figure on it.

### 5. [DISPLAY] The publish warning must read the decisions
*Fable F4 (MEDIUM). The one caller left that resolves a sentinel its own way — the answer to P6 that
Codex missed.*

`publishFlagsBids` walks the raw schedule and expands sentinels through the live `availableFor`,
knowing nothing about the blanket, the item marks or the person decisions. It can name a man's leave
bid as clashing with published work when he was denied and no credit will land. It runs after the
snapshot, so the block is there. Replace the live expansion with `oilEarnedWork(snap.d, ev)`, and
return early on a block-less snapshot (protected, never warned on). The blind-line earner count then
becomes true as well.

### 6. [HISTORY] An OIL decision must leave a trace
*Fable F3 (MEDIUM). The design's §9.2 claims the edit log holds the before and after; it does not.*

The three writers call only `afterSchedMutate()`, which marks an edit with no key, so nothing is
logged. A man asks why his balance is short and there is no record of who decided it. Add a
`logAction` to each of the three (blanket, item, person), carrying the callsign and the item's
display name — the writers take the name as an optional argument, passed from the board where the
text is already in hand. Name the item in the amendment panel too, so "1 change" stops being
unexplained. Then correct §9.2's claim in the design doc.

### 7. [MODE] Stepping weeks must leave the mode
*Fable F5 (LOW, but it strands the board).*

The mode belongs to one day of one week; a week step carries it to the same index of the new week.
If that day cannot earn, neither exit button is drawn but the board is still read-only — no way out
but closing it. Clear the OIL day in `boardWeekStep`, and again in `loadWeek` as the backstop.

### 8. [O-1] The green bar shows only where the row counted
*The owner's own ruling from earlier the same day — see `OUTSTANDING.md`.*

`oilBarOf` takes the item key as well and returns null unless that man has a surviving span on THAT
item; `oilEarnedWork` already computes it per person with `w.item`. Correct OIL21's wording in the
behaviour register, in `docs/ui-contracts.md` §OIL and in `docs/engine-rules.md`.
**Re-examine O-3 in the same pass:** the ALL AVAIL count chip counts each man's DAY, which the owner
ruled "leave it" only because the bar meant the same thing. Under O-1 they can agree again.

### 9. [LATENT] The cheap hardening, all from Fable
- **F6** — the phone bar draws the OIL button for a viewer who cannot use it; gate it on editability.
- **F7** — row ids are minted inside `daySnap`, after the key was computed and signed. No reachable
  case found through the UI, but move the mint to the entry of both publish paths so every read in
  the turn sees the same ids.
- **F8** — `oilDecisionsKey` tests presence, not emptiness, so `{items:{}}` would read as a change
  forever. `tidy()` prevents it today; make the key itself safe.
- **F9** — `acc` rides both the filing axis and the OIL key, so filing an OIL-asking input on a
  published day counts twice. Drop `acc` from the OIL key (keep it in the projection); a fresh input
  is still caught by its new id.
- Make `oilSentinelPeople` return a copy. It hands back the frozen array by reference; nothing
  writes to it today, and one in-place `sort()` would rewrite an issued document.

---

## THE TESTS — the real finding, and the standing rule

Both reviewers, independently, said the suite is built so the next bug of the Saturday shape would
also slip through. **Neither found a second aliasing bug** — every hand-back of the evidence, the
snapshot, the binding, the draft clone and the Leave War projection was traced by hand and only
reads. But:

- Days are signed by writing the signature record directly instead of going through `setSign`, so
  the whole new "an OIL change invalidates the signature" rule is proved by **no test at all**.
- Money is asserted through a helper that calls `oilEarnedWork` directly, bypassing `creditable`,
  the protected dates and the reverse sweep — which is why fix 2 was invisible.
- Nine fixtures REPLACE the decisions record where the board MUTATES it — the exact blindness that
  hid the Saturday bug.
- The publish helpers call `setDayApproved` directly, never the committed path, so the publish-time
  warning (fix 5) is exercised by nothing.

**Every test written for this plan goes through the production route**: `setSign` to sign, real
clicks or the exported writers to make a mark, `runOilPass` and the real Leave War cell to assert
money. Existing tests that claim a production path and do not take one are renamed to say what they
actually prove (algebra) or rewritten. The owner's standing rule also requires each fix to be set up
as a real scenario in the running app and eyeballed, not only unit-tested.
