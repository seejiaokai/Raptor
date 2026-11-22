# The reshape plan's red team, round 3 (the last, narrow) — Astra's report (blind; copy at `de5de891d`)

Reader: GPT-6 Astra (D1770, D2210), run by chat 125 as `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only --skip-git-repo-check` on its own exported copy holding no reader's report, brief `2026-11-20-multi-sqn-b1-reshape-read3-brief.md`; blind to Fable and the fresh Opus reader; started 19:02:01, ended 19:06:28, exit 0 — **finished whole, not stopped**. Its last message as returned:

---

**REVISE — two HIGH findings and one MEDIUM.** The revised rights rule still breaks two honest Undo sequences. The shared posting audience also excludes an admin the plan expressly allows.

Read-only review of the supplied copy, starting at §17 and following its references into the plan and current code. No separate reviewer reports read; no files changed. These are traced plan failures, not executed proofs.

1. **HIGH — Repeated Undo can silently discard a legitimately restored right.**

   **Where:** §4.3, “An ended right never comes back”; §17’s first row.

   **Sequence:** Saber removes Ranger’s View of 150 on 12 July. Ranger moves squadron on 16 July. On 18 July, Saber undoes the removal: the plan explicitly allows the right back dated 18 July. Saber then presses Redo, removing that restored right, followed by Undo again.

   **Failure:** The new omission rule reads the row’s original recorded start date. Against Ranger’s move history, that original row appears to have ended on 16 July, so the second Undo omits it. Undo succeeds without restoring the View that its preceding Redo actually removed.

   **Cause:** The current restore machinery already retains the actual row removed by the preceding restore, including its revised start date. But omission happens before that saved image is consulted. The plan gives the new omission hook the other changes, but does not give it this actual prior image; it expressly specifies the row’s recorded date.

   **Exact plan fix:** Decide whether the removed right held using the actual row and account at its latest removal, including dates assigned by previous restores. Pass that evidence into the omission check before filtering. Preserve the existing rule that an Undo after Redo uses the Redo’s time. Add removal → move → Undo → Redo → Undo tests, repeated both immediately and on later days. Truly ended rows must still stay omitted.

2. **HIGH — Undo of a re-link is still refused when a retained right ends before Undo.**

   **Where:** §4.3’s re-link, gate and restore rules; §17’s first row.

   **Sequence:** Ranger’s account holds View of 150. Saber mistakenly re-links it to Viper on 12 July. Because the right still holds, the plan keeps it. Viper moves squadron on 16 July, ending that right. Ranger has not moved. On 18 July, Saber presses Undo to return the sign-in to Ranger.

   **Failure:** Restoring the account’s original person and link date makes the retained right hold for Ranger again. The new before/after gate correctly detects an ended right becoming active and refuses the entire Undo. The sign-in remains linked to Viper.

   **Cause:** The original re-link changed only the account; it did not change this still-active grant row. Therefore its inverse contains no grant change for the omission hook to filter. Omitting restored grant rows closes the already-ended-at-re-link case, but cannot close this ended-since-re-link case.

   **Exact plan fix:** Every account-link restore must also examine rights currently attached to that account. If the restore would revive an ended right, remove that ended row atomically while restoring the account, with narrowly verified authority and corresponding Redo handling. Do not exempt the whole restore from the gate. Add tests where a right is active at the original re-link and ends before Undo or before a later Redo, varying which person moves.

3. **MEDIUM — A squadron with only a Plan admin receives no posting notification.**

   **Where:** §6.2 step 6 and §5.2; §17’s Opus M6 row.

   **Sequence:** The master creates 150 with an admin who remains at home in 142 and holds Plan of 150. Section 5.2 expressly accepts this arrangement. A 150 member’s posting subsequently runs, either while 150 is loaded or through the foreign pass.

   **Failure:** The proposed audience requires an admin to be **at home** in 150. It therefore returns nobody. The posting happens without telling the person administering that squadron. Giving both passes the same empty audience establishes consistency but does not satisfy D2202’s requirement that Plan holders receive that squadron’s admin lines.

   **Exact plan fix:** Define the shared audience from effective administrative rights and the applicable bell-entitlement rules: include eligible Plan holders, exclude View-only holders, and preserve the master’s separate notification default. Use the same rule in both passes and their gate check. Add a Plan-only squadron test, alongside home-admin, View-only and unrelated-admin controls. This does not require building notification preferences now.

**Explicit negatives and disposition of the remaining revisions**

- **Undo identity:** No further concrete defect found in the proposed squadron-qualified revisions, conflict checks, barriers, folds and eligibility. The foreign posting record’s shared identity closes the named alias gap. Globally owned inputs remain eligible after a move.
- **Planning calendar:** Keeping one record identity and routing its reads and writes closes the named split-identity problem. The plan explicitly covers loaded-screen refresh, cache invalidation and whole-command rollback.
- **Foreign posting execution:** Both Delete halves, an atomic completion mark, independent commands and retries after relevant committed changes are now specified. No additional concrete failure established in those changes. Runtime proof of bounded retries remains required.
- **C6 and A7:** The shared whole-draft permission check addresses picker/save disagreement. Comparing surviving cell contents permits removal from a multi-entry cell while refusing additions outside its squadron.
- **Other §17 corrections:** No further concrete blocker found in the required account link date, baseline-home handling, lowering/replay exceptions, ended-right references during squadron removal, last-admin dates, or required-day contract.
- **Build split:** No remaining simultaneous file-ownership clash found. The planning writer, rights restore hook and midnight trigger now have explicit prerequisites.
- **Visible changes:** No additional drawing omission found beyond those already listed in §11. Owner questions and held items were not reopened.

The plan needs these three corrections before build; this read does not establish implementation readiness or a passing app check.

**Walk:** Not run — narrow, read-only plan review.  
**Rulings:** None this session.

