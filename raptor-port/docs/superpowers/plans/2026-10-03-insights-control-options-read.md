# Insights control options — independent Astra response, 3 Oct 26

Read-only continuation by the existing independent Astra planning delegate under D496. Owner asked to settle the
plan here and build in a fresh chat, then requested pictures of the proposed control and clarified standby eligibility.
The complete response below is retained without rewriting. It is not approval of the delegate's earlier plan or code.

## Complete response

**D515–D516 independent meaning comparison: PASS.**

D515’s short line and full ruling agree: settle this Insights plan and pictures here; build in a fresh chat after agreement. Its spec home preserves that sequence and correctly treats the requested control picture as exploration, not approval. D516’s short line, full ruling, spec constraint and Insights contract agree: SC/AVALON/BB do not contribute flying load; SC main contributes work hours. Neither record invents decisions about other duties’ hours, earned leave or a new category control.

**Confirmed from current source**

- Insights excludes every standalone wave before counting formations, aircraft or each person’s sorties. Apply blue/red classification only after that exclusion.
- Work hours use the separate event calculation. Uncancelled SC main produces a shift event; its shift hours, including an applicable earlier report, feed the person’s daily span. SC spare is excluded from that event stream. This is source confirmation, not a runtime test.
- **Mission belongs to the whole formation.** Edit Schedule displays it once beside the formation callsign. The Board repeats the Mission editor on each aircraft row, but every repeated editor changes the same formation value.
- **Remarks belong to each aircraft.** Accordingly, the example “DS for …” on one aircraft does not prove its formation-mates have the same role.
- The existing mission-coloured dot has a different meaning, based on mission type. Do not silently reuse it for blue/red or recolour existing warning/red-box controls.

**Two compact alternatives to picture**

| Proposal | What the scheduler sees | Tradeoff |
|---|---|---|
| **A. Quiet category beside Mission** | Existing Mission text remains editable; a compact **Blue ▾** or **Red ▾** value sits alongside or immediately below it, inside the same area. Tapping that value opens the choice. | Always discoverable and easy to check, but adds a visible control to each relevant formation. |
| **B. Choice appears only while editing Mission — recommended for his concern** | Normal schedule keeps its familiar Mission text. While that Mission is being edited, a small anchored panel offers the proposed category choice. An explicit exception retains a small plain-text indicator such as **Red** after editing. | Less constant clutter; the choice needs to be discovered inside Mission editing. Its opening must preserve direct typing and ordinary Tab movement, not introduce an extra confirmation step. |

Keep both pictures clearly marked **proposed**. Show the normal state and the open choice, so he can judge the everyday screen as well as the extra control. Prefer the same presentation on Edit Schedule and Board, desktop and phone. Do not put this setting inside Stores configuration: that existing control concerns aircraft equipment.

**Scope must be settled before choosing the final placement**

Both Mission-based pictures naturally imply a **whole-formation choice**. Label the illustrative panel “For this formation” so that implication is visible, without presenting it as approved. If different aircraft in one formation can be blue and red, a Mission-only control would miscount people; the choice would need to sit beside each aircraft’s own details, with a different picture. The user must decide that operational question.

After the pictures, at most these three questions are useful:

1. **“Can aircraft within the same formation be on different sides, or is the whole formation always blue or red?”** Recommend one formation-wide choice only if their operations follow that rule; otherwise individual-aircraft choice.
2. **“Which screen feels better: a small Blue/Red value always visible, or the choice appearing only when you edit Mission?”** Recommend the second to protect the current workflow. Include “keep only Red/DS mission names” as the no-extra-control alternative.
3. **Only if he chooses an explicit control:** **“Should the app normally follow the Mission name, with a manual choice only when needed?”** Recommend automatic Red/DS versus other missions, with an explicit exception and a clear way to return to automatic. Show the resulting category so “automatic” is understandable.

Do not repeat the unanswered bare yes/no before these pictures. Do not settle override precedence, saved representation, migration or amendment handling from this recommendation. If he approves a saved choice, the final implementation plan becomes FULL tier and must cover those boundaries.

Rulings: none added by this delegate; D515–D516 independently compared. No edits, implementation or gates run.

## Sol's independent challenge and disposition

- Accept the two pictures as proposals only. The owner has not approved a saved choice, a matching policy, formation
  scope, automatic/manual precedence, or complete layout. The earlier bare yes/no is replaced by the requested visual
  exploration and operational scope question; do not repeat it without the pictures.
- Mission text must remain directly editable; a focused panel must neither force an extra confirmation nor interfere
  with Tab, blur, save, scroll, undo or the phone keyboard. Current design overlays prove none of those app behaviours.
- A whole-formation example must show the same category on its repeated Board Mission boxes. The pictures do so;
  aircraft-level semantics would require a different drawing before binding the plan.
- Existing mission-type dots, scheduler red flags and warning colours have different meanings and retain them.
- D516 agrees with source: standalone exclusions happen before sortie counts; SC-main events feed separate hours.
  Pin that boundary in the build's failing-first tests. No existing-data cleanup or extra category-control approval.
- If a saved category is chosen, FULL risk boundaries and schema/model/issued/undo contracts must be covered in the
  firm implementation plan. No app build here; no partial Rally fixes copied into this planning baseline.

## Design checks and limits

`docs/img/insights-proposal/mission-choice.cjs` creates the nine design pictures and result JSON. Quiet and open states
use temporary overlays without changing Mission text, the Mission box width or row height. The always-visible option
adds 10px to this phone example's row and 7px on desktop. Phone390×844, desktop1440×1000 and narrow320×568 popups stay
inside the viewport; prototype Blue/Red buttons toggle DOM-only labels; zero page errors. All nine final pictures opened.
The existing bundle's 320px Mission box is only14px wide and already cramped before the overlay; neither narrow
candidate establishes readable scheduling there. This layout limit remains to settle on the actual build. The virtual
keyboard, persisted category, issuing, Edit Schedule presentation and live Insights split are not tested by this mock.
No source or saved data changed; no application gate PASS claimed. OWED: Claude's further plan/code read after reset.
