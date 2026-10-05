CHANGES REQUIRED

Reviewed `c0eff959 → d5732266`. Later uncommitted edits are excluded.

## 1. Findings

**F1 — MEDIUM: final Tab loses the caret when the redraw replaces the whole day.**

- **Steps:** In mounted Edit Schedule, focus Monday’s last editable box, with no eligible control after it. Have its blur remove a wave and notify, without navigating or opening a window; then press forward Tab. This gives a concrete regression fixture for the whole-day replacement path.
- **Result:** The redraw replaces Monday’s day element. The caret remains on the page because the following check returns before finding the replacement box. Another Tab can reach another day.
- **Required:** D597 keeps the caret in the last box, or its replacement on the same day.
- **Cause:** [schedule-tab.ts:132](/C:/Users/User/projects/Raptor/raptor-port/src/ui/schedule-tab.ts:132) calls `sameScope`, which requires the **original** day element to remain connected. [dayswap.ts:106](/C:/Users/User/projects/Raptor/raptor-port/src/ui/dayswap.ts:106) deliberately replaces that element when the day’s structure changes. The replacement-box fallback therefore never runs.
- **Fix:** Preserve the navigation, permission, preview, OIL and window checks, but resolve the current element for the **same day** after the redraw. Search that element for the original box’s twin, otherwise its last eligible text box. Preserve any focus another handler established.
- **Test:** Force whole-day replacement during final Tab; require that replacement actually occurred, then assert same-day caret restoration and correct subsequent typing. Keep the existing navigation and dialog-focus tests.

This finding follows from source tracing; I did not execute the reproduction.

## 2. Checked and sound

- **Original stale-display finding:** Redrawing before refocusing addresses the phone Board and the week’s held Flying section. The added tests check the updated area time, retained caret and unchanged history count. Whole-day replacement remains F1.
- **Save and focus guards:** The added notification requests rendering; it introduces no schedule write or validation call. Window, navigation and newly established focus checks remain.
- **“Line” naming:** Questions, Undo metadata and History use the readable fallback. Identity still uses the formation’s hidden identifier; two unnamed lines remain separate records.
- **Button restoration:** The restored button uses the existing conditional-role and access guards. It does not duplicate an open question, offer an automatic-red override, or operate with tracking Off or member access. Latest-published Remarks access remains permitted.
- **Changed role-test expectations:** Both the dirty-Remarks family and W9 require the question to disappear and the correct temporary button to return. Save counts, answer identity and caret assertions remain. This matches D527/D529.
- **Changed ring expectations:** Both retain the exact dotted-red styling and ring-precedence checks while accepting the dynamic width with its original fallback. Separate width tests cover the calculation.
- **Walk evidence:** I read the script and its recorded 50-step result table. Those recorded passes do not exercise F1.

## 3. Older, not this change

None identified within this review.

## 4. What I did not check

No build, test, server or live browser run. I did not independently verify scrolling, physical iPhone behavior, React runtime errors or the recorded walk’s pictures. I opened no other reviewer’s report.

The checkout changed during the review; this verdict applies only to the committed version named above.

Rulings: none this session.

