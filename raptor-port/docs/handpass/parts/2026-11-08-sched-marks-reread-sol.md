# The narrow re-read of the fixes — Sol 6.1's report (chat 13, 8 Nov 26)

Brief: `raptor-port/docs/superpowers/briefs/2026-11-08-sched-marks-fix-reread.md`, on `9d330d50c`; blind to the other reader. Saved verbatim; the host's dispositions are in the evidence sheet's §13.

---

**One P2 finding remains. No newly introduced regression found.** Claim 2 does not fully hold; claims 1, 3 and 4 hold in the paths traced.

Reviewed `19551d882 → 9d330d50c` directly through Git. All references below are to `9d330d50c`. I stayed blind to the excluded material and changed no files.

| Claim | Verdict | Deciding lines |
|---|---|---|
| **1. One place** | **Holds.** Destination selection follows wording, covers filing lines, preserves existing destinations and puts a split person’s new record first. | `pendlist.ts:617–625`; split destination at `:254–258`. |
| **2. Only drawn rows; removals stay still** | **Does not hold.** The page, type, existence and date restrictions hold. A person removed from a shared input can still receive a destination belonging to someone who remains. | `pendlist.ts:217–223`, particularly `:223`, with `inputRowKeys` at `:202–204`. |
| **3. The fold** | **Holds.** Only listed Personal Inputs open it; accepted inputs do so only when their programme row does not stand on that day. | `interactions.ts:167–170`. |
| **4. The damaged week** | **Holds for the initial button press and a later OIL answer.** The first guard precedes the question/dry run; the second precedes the saved answer and filing. Both return immediately on refusal. | `interactions.ts:1046`, `:1068`, `:1198`; wording and grey kind come from `inputedit.tsx:859–867`. |

**P2 — A removed person’s line lands on somebody else’s Unavailable row**

**Host reproduction**

1. File one new LL input for three people on Wednesday.
2. Publish Wednesday.
3. Edit that input’s people, removing one person without giving them a separate record.
4. Open Wednesday’s **To go out** list through **N pending**.
5. Press the removed person’s **taken out** line. Repeat on the board, at phone and desktop widths.

**Expected:** the line stays still, as claim 2 promises; the removed person has no remaining row.

**Code produces instead:** a button addressed to the surviving input. The jump finds and flashes the first remaining person’s Unavailable row. On the board it can also pin that row’s History bubble.

**Cause:** the people comparison retains the surviving input as `it.now` (`publish.ts:300–332`). `inputWords` correctly says **taken out** (`pendlist.ts:259`), but the new fallback does not exclude a plain person removal. `inputRowKeys` returns the bare input address when that person is no longer held. `findInputCell` then accepts any row belonging to that input (`histbubble.ts:162–166`).

**Baseline:** `19551d882` does the same through its old `inputWords` fallback at lines 218–219. This is a newly identified failure of the stated exclusion, **not a regression introduced by these fixes**.

**Exact fix instructions**

1. In `pendListHTML`, within the fallback block at lines 620–623, identify a plain removal: `it.pp?.role === 'off'` with no non-empty `w.lead`.
2. Skip the new input-row fallback for that case.
3. Preserve existing programme destinations. Preserve the fallback when `lead` identifies a genuine split record.
4. Add a production-writer regression using the three-person LL setup above. Assert that the removed person’s line is a still element and `pendKeysFor` returns `null`.
5. Retain positive assertions for an added person and a split person, including the split record appearing first.
6. Drive the numbered reproduction on both surfaces. The removal line must remain still; the positive controls must reach the correct person.

**Explicit negatives:** I checked course filing, Reject followed by **→ Unavail**, retained programme destinations, SANS/upchit exclusion, View-only Personal Inputs exclusion, deleted/moved-off inputs, split-record ordering, Tuesday’s folded Personal Inputs, and leaving version looks before jumping. I found no additional fault. I also traced immediate and delayed-answer protection refusals and found no doubled note or newly refused valid filing.

**Tidiness, filed only:** the comment at `pendlist.ts:216` promises that removed-person lines stay still; the finding disproves it. No newly unused declaration or unnecessary duplication found in the changed production lines.

**Checks:** the permitted unit file could not start because the read-only environment blocked its temporary folder. No tests ran. No build or app walk performed; host reproduction remains required.

**Rulings:** none this session.