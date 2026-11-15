# Part 5's read — the log (chat 79, 15 Nov 26)

Brief: `2026-11-15-rules-check-batch2-part5-read.md`. One round each (D70), blind to each other. Astra: `codex exec -m gpt-6-astra`, reasoning high, read-only. The fresh Opus reader: a helper started for it, the brief alone.

## Reader 1 — Astra (word for word)

Three wording findings, most serious first.

1. **The pending-change wording is too broad.** “A changed OIL value reading pending at once” and “a change of one reading pending and dropping the four sign-offs” imply that every change triggers this. D592 and D2044 preserve the existing test: someone’s earned leave **or its recorded working times** must change. For example, changing the default rally does nothing to a day containing only a timed duty desk. The code and existing tests expressly preserve that case.

   Replace the guide’s phrase with: “a changed OIL setting reads pending at once only if it would change someone’s earned leave or its recorded working times”.

   Replace the scheduler page’s phrase with: “a change reads pending and drops the four sign-offs only if it would change someone’s earned leave or its recorded working times; the published OIL stays until the day is published again”.

2. **“A changed setting reaches it from its next amendment” needs a narrower subject.** It is true of the published version’s checks and OIL, but not every use of a setting. Under D2013, once anything waits on the day, its working copy uses today’s settings before publication. Insights’ work hours also change immediately under D482. A future reader could wrongly freeze both.

   Replace that clause with: “new settings apply to the published version’s checks and OIL when it is published again; once anything waits on the day, its working copy is checked by today’s settings (D2013). Insights’ work hours still follow today’s settings (D482)”.

   The saved settings correctly cover the day’s checks and all three OIL values; unrelated settings are not universally frozen.

3. **The D186 line still presents built protection as future work.** “A published day’s crew rest is to be measured to that printed brief … — [RULES-CHECK-FIXES]” suggests unfinished implementation. Although D1991’s historical row says “Not built”, the current code implements it, and the existing tests cover the published version and working copy separately.

   Replace that ending with: “a published day’s crew rest is measured to that printed brief, and its other checks use the settings it was published under, as built.”

For the brief’s remaining questions: **no safeguard was lost by removing “no rule versioning”**; D2005 supersedes that restriction and D2024 authorises its correction. The other product safeguards remain. **No separate contradiction found in the changed publishing comment** when read with the following clarification that only the printed brief setting is compared there. **No unnecessary bulk found**: the ruling references and explicit retirement of the old restriction prevent a future reader restoring it.

Read-only review completed. I read the rulings, code and relevant tests; I did not run tests or walk the app. Nothing changed.

Rulings: none this session.


tokens used
138,264
Three wording findings, most serious first.

1. **The pending-change wording is too broad.** “A changed OIL value reading pending at once” and “a change of one reading pending and dropping the four sign-offs” imply that every change triggers this. D592 and D2044 preserve the existing test: someone’s earned leave **or its recorded working times** must change. For example, changing the default rally does nothing to a day containing only a timed duty desk. The code and existing tests expressly preserve that case.


## Reader 2 — a fresh, blind Opus reader

Five findings (its report in short, its replacement words as given):
1. "a changed OIL value reading pending at once" (and the scheduler page's §Publishing line) says too much: the day reads pending only on an earning day and only where the new value would write someone's OIL record differently, the amount or the worked times (D592 (8); `oilev.ts` `oilRuleShift`); put back, it clears (D98).
2. In the guide line the OIL clause reads as the only exception: a changed brief lead reads pending at once on a published day that prints a blank B (D186). Suggested: "a changed setting reaches it from its next amendment — reading pending at once only where it would change the brief the day printed (D186) or that day's OIL (D592, D2044)".
3. The scheduler page's D186 "Keep it:" line still says the published crew rest "is to be measured … — [RULES-CHECK-FIXES]": built with D2005 (live 14 Nov 26, `events.ts`); its D2014, D2044 citations say nothing of OIL. Suggested: "a published day's crew rest is measured to that printed brief, its other checks by the settings it was published under, as built [D186, D1991, D2005, D2024]".
4. "set aside (D2024)" credits the wrong ruling: D2005 set it aside, D2024 ordered the text corrected.
5. `scripts/rulecheck.mjs` still labels AM7 "… no rule versioning".
Answers: Q1 "from its next amendment" true for every setting the checks read (`KEPT_RULE_KEYS`, the SC MAIN clash table), matching D2013; the three OIL values right; Q2 no safeguard dropped, one live rule hidden (finding 2); Q4 little bulk.

## What was done with them (the host, chat 79)

Each claim checked in the code: `oilRuleShift` compares each man's record by amount AND worked spans (`recKey`), so "OIL or its worked times" is the true condition; the D186 brief-lead pending is `publish.ts`'s blank-brief comparison. All taken:
- the guide line (both readers' 1, Opus's 2 and 4, Astra's 2): "a changed setting reaches it from its next amendment, reading pending at once only where it would change the brief the day printed or that day's OIL or its worked times; once anything waits on the day, its working copy is checked by today's settings (D2013), and Insights' work hours follow today's (D482); the old "no rule versioning" is set aside (D2005; this line corrected by D2024)";
- the scheduler page's §Publishing line (both 1): "…and where a change of one would change that day's OIL or its worked times, the day reads pending and drops the four sign-offs, the OIL moving only when the day is published again, as built";
- the scheduler page's D186 line (Astra 3, Opus 3, 4): "…set aside (D2005; the guide corrected by D2024); a published day's crew rest is measured to that printed brief, its other checks by the settings it was published under, as built [D186, D1991, D2005, D2024]";
- `rulecheck.mjs` AM7 (Opus 5) and the `publish.ts` comment (Opus 4).
No second round (D70: one round each). The Logic page's note says "would change that OIL": the worked times are part of the OIL record a day keeps, so it stands; his to change on his look (D2015).
