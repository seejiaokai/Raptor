# Independent second-reader report — D606

**No blocking defect found in the changed calculation.** The MAIN-only interpretation fits the standing SC rules better than giving an activated SPARE the B time.

This is a read-only source and evidence review of `0dbb6e1b..4dd2ce76751e4cb40d343f256086e91765c304a1`. I changed nothing, ran no tests, started no server and did not open the other reader’s report. Recorded test and walk results below were read, not independently reproduced. This report is evidence, not owner approval.

## 1. Is the rule right?

The implementation matches the earlier-start interpretation and retains the existing requirement for a measurable written shift. (`src/engine/oil.ts:242`, `src/engine/oil.ts:271`)

| Input | Result by reading |
|---|---|
| SC MAIN, 07:00–13:00; B blank or unparseable | 07:00–13:00; HO, 0.5 |
| Same shift; B 06:00 | 06:00–13:00; FO, 1 |
| Same shift; B 07:00, 08:00 or 13:30 | Written six hours; HO, 0.5 |
| SC MAIN, 19:00–07:00; B 18:00 | 18:00–31:00; FO on the shift’s own date |
| SC MAIN, 01:00–07:00; B 23:00; lead 180 minutes | Raw span −60–420, eight hours; FO. Stored times 00:00–07:00 |
| Written start equals end, or either end unreadable | No OIL span, including with an earlier B |
| SPARE, aircraft flag or formation-wide flag | Written window; off by default; written hours when switched on |
| Cancelled formation or aircraft row | No work from the cancelled structure |

The midnight rule compares **resolved minutes**, not merely the displayed clocks. When the written start is strictly inside the nominal lead of midnight, any B clock later than that start rolls back one day. At the exact lead boundary it does not. This preserves the previous SC interpretation. (`src/engine/reporting.ts:10`)

The six builder readings are supported: earlier start; existing evening-before treatment; MAIN only; AVALON/BB unchanged; work hours already connected; subsequent B changes waiting for publication. D606 withdraws D592’s reading (10), not the standing SPARE exemption. (`.claude/decisions-full/oil.md:11`, `.claude/rules/decisions/scheduler.md:270`)

## 2. One reader

**Checked, no changed-reader disagreement found.**

The replacement in `seatIntime` is behaviourally equivalent: same `parseHM`, same default report lead, same strict midnight comparison, same SC guard and same fallback for every other wave kind. (`src/engine/events.ts:228`, `src/engine/reporting.ts:10`)

Crew rest takes the earlier of the SC in-time and shift start. Work hours and the long-day note use the same earlier-start rule; Insights calls that work-hours calculation. SANS uses `seatIntime` too. The crew-list pre-drop check clones the SC sibling’s existing report into the validator’s own rest calculation. (`src/engine/validate.ts:153`, `:530`, `:1091`, `:2020`; `src/engine/insights.ts:53`; `src/engine/avail.ts:264`)

Two preserved distinctions matter:

- SC’s wave-header reporting note is deliberately absent; it is not another SC B reader. (`.claude/rules/decisions/scheduler.md:270`, `src/ui/html.ts:1193`)
- A zero-length written shift can still contribute B-to-end time to `workSpan`, while OIL rejects the written zero-length window. This is the retained OIL validity gate, expressly documented and tested; D606 did not remove it. (`src/engine/validate.ts:168`, `src/engine/oil.ts:242`, `docs/engine-rules.md:1995`)

## 3. A published day

**Checked, none.**

The kept report lead reaches `scIntime` through `opts.rv`. Published work, amounts and the Logic-change comparison all use the published evidence block. (`src/engine/oil.ts:149`, `:243`; `src/engine/oilev.ts:628`, `:683`, `:746`)

The credit pass resolves each date’s latest published snapshot, including off-screen weeks. Board figures, eligibility, item capability and the ALL AVAIL figures use that same evidence and work calculation. I found no published OIL reader taking the B with today’s lead. (`src/leavewar/sync.ts:980`, `:1073`, `:1103`; `src/ui/oilmode.ts:123`, `:146`, `:523`, `:711`, `:1015`)

A later Logic change holds the published credit and raises one Logic pending item where the amount or stored worked times would differ. (`src/engine/publish.ts:503`)

## 4. A B typed after publication

**Checked, none.**

B is already included under `ff:<di>.<gi>.<li>.br` in the ordinary day comparison and signature digest. A change therefore reads pending and invalidates bound sign-offs; published OIL continues reading the old snapshot until amendment. (`src/engine/restore.ts:77`, `src/engine/canonical.ts:97`, `src/engine/publish.ts:1334`, `:1382`)

A B-only edit does **not** require an additional `oil:` evidence item. That key describes OIL decisions, claims and membership; the ordinary B entry already names the act. I found no B-only path that moves published OIL without pending. (`src/engine/oilev.ts:855`, `src/engine/publish.ts:481`)

## 5. Downstream of the span

**Checked, none.**

The stored times are clipped to the owning date and merged. Negative starts become 00:00; overnight ends become 23:59. OIL amount is calculated from the full span before clipping. (`src/engine/oilev.ts:628`, `:637`)

The clash checks, Inputs note and publish toast consume those stored/date-clipped windows without requiring the original shift start. The tracker prints every stored period. (`src/leavewar/engine/dayview.ts:148`, `src/leavewar/inputgate.ts:245`, `src/leavewar/sync.ts:1231`, `src/leavewar/ui/OilTracker.tsx:486`)

The ALL AVAIL tab, publish toast and clash strip were not walked specifically with an SC B. Their connections are established by source reading, not fresh runtime proof. (`docs/handpass/2026-10-06-oil-work-start.md:487`)

## 6. AVALON, BB and other rows

**Checked, none.**

The B extension requires a standalone written window and `wv.kind==='sc'`. AVALON/BB retain their written windows and defaults. Ordinary flights, sims, desks, Ground and Common Programme calculations remain unchanged. (`src/engine/oil.ts:225`, `:243`, `:276`)

## 7. Tests

The fourteen new engine cases, three published cases and browser case make meaningful exact assertions for their main claims. The browser case performs the actual B edit and amendment, then checks HO becoming FO. The older pin legitimately drops only the superseded typed-B clause and keeps the reporting-line exclusion. (`src/engine/oilscintime.test.ts:36`, `src/leavewar/oilworkstart-published.test.ts:306`, `e2e/oilworkstart.spec.ts:164`, `src/engine/oilworkstart.test.ts:164`)

Two test limits remain:

1. **Formation-wide SPARE hours are not separately protected.** The new test covers `ac.spare`; the older formation-wide test checks the default, not the B-adjusted window. Removing only `f.spare` from the new `seatWin` condition could escape these assertions. Add a formation-wide SPARE fixture with B 06:00 and assert `[420,780,false]`, then switch it on and assert HO. (`src/engine/oil.ts:271`, `src/engine/oilscintime.test.ts:85`, `src/engine/oilexempt.test.ts:79`)
2. **The `25:90` assertion does not prove rejection or unreadability.** `parseHM` deliberately parses it; this fixture passes because the resulting clock is later than the shift start. Keep malformed-clock rejection at the write door, or move that value into a separately labelled case. Genuine unparseable values in the same test still exercise the fallback. (`src/engine/oilscintime.test.ts:49`, `src/engine/time.ts:47`, `src/engine/slots.ts:333`)

The recorded B24–B30 results show every combined cut red. B27 removes the whole SPARE guard, so it does not close the first limit above. These are coverage limits, not demonstrated application failures. (`docs/handpass/parts/ows-break.json:266`)

## 8. Words

**D606 short line against full row: PASS.** It preserves the full row’s operative statement; the six interpretations remain identified as builder readings. (`.claude/rules/decisions/oil.md:56`, `.claude/decisions-full/oil.md:11`)

The two changed Logic sentences and detailed rules correctly describe earlier B, MAIN-only treatment, written-hours SPARE credit and unchanged AVALON/BB. (`src/ui/logic-html.ts:210`, `:275`, `docs/engine-rules.md:1985`)

The test title “the two Logic times do not move it” is broader than its daytime fixture: the report lead can affect midnight interpretation, as its neighbouring test proves. Narrowing that title would improve accuracy. (`src/engine/oilscintime.test.ts:66`, `:90`)

## 9. Absences

**Checked, no missing D606 connection found against the roll-call.**

SC B remains board-only by the standing owner decision. Its absence from the desktop week and published face is recorded, not an omitted new connection. CSV/print carry no OIL column. The “brief” wording in the changes list and the confusing day switch are already filed. (`docs/handpass/2026-10-06-oil-work-start.md:422`, `.claude/rules/decisions/scheduler.md:279`, `OUTSTANDING.md:1951`, `:1960`)

## Ranked cases for the host

Use an otherwise empty earning Saturday, threshold 361 minutes and report lead 180 minutes unless stated.

| Rank | Setup and action | Expected result; what disproves it |
|---|---|---|
| 1 | SC 07:00–13:00, B 06:00; `f.spare=true`, aircraft flag false. Publish, switch the man on, publish AL | Initially no credit; then **HO, 0.5, 07:00–13:00**. FO or 06:00 start disproves it |
| 2 | Publish MAIN 01:00–07:00, B 23:00; sign again. Change lead to 30 minutes | **FO, 1, 00:00–07:00 holds; one Logic pending item; sign-offs fall**. Restore 180: pending clears and signatures return |
| 3 | Publish MAIN 07:00–13:00 blank B; sign again; type 06:00; publish AL | Before AL: **HO, 0.5**, B pending, signatures invalid. After: **FO, 1, 06:00–13:00**, no pending |
| 4 | Publish MAIN 01:00–07:00, B 23:00. File leave 00:00–00:30 | **FO stays**, note names **00:00–07:00**, leave files and clash is amber. Missing clash or previous-day credit disproves it |
| 5 | Publish MAIN 19:00–07:00, B 18:00 | **FO, 1**, stored **18:00–23:59** on that date; following date gets zero from this shift |
| 6 | Read MAIN 03:00–09:00, B 23:00 with lead 180, then 181 | At 180: **six hours, HO**. At 181: raw **−60–540, ten hours, FO**. This checks the strict boundary |
| 7 | Read MAIN 01:00–07:00, B 23:00 with explicit lead zero while today’s lead is 180; also call `seatIntime` without a supplied lead | OIL: **01:00–07:00, HO**. `seatIntime`: **−60**. Ignoring zero or losing the default midnight fold disproves it |
| 8 | SC 07:00–13:00, B 06:00; cancel the formation, then separately cancel only one of two occupied MAIN rows | Cancelled formation: **zero**. Cancelled row: **zero for that man**, other MAIN **FO, 1** |

**Walk:** none performed in this read; walker E’s report was reviewed.  
**Rulings:** none this session.  
**Required changes:** none; test limits above are explicitly retained.

**Verdict: PASS**