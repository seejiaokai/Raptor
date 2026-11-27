# [OIL-LATER-PASSES-ON] — scenarios by a fresh, blind Fable (28 Nov 26)

Brief: `2026-11-28-oil-later-scenarios-brief.md`. Blind to Astra's list, the red-team reports, the plan's tests and the
handoff. Its hand-back is condensed here by the host (each scenario's setup, steps and EXPECTED kept; wording shortened).
Common setup: a Saturday not yet published, Ranger's Training on it with OIL unanswered, all times filled, the admin
signed in. "Later ×3" = CUR CK, SKED CK, PLANNED BY each signed by pressing the box, picking a name, pressing Later.

1. WALK — his own case, desktop board: Later ×3, each foot "Later: <name> signs, and the next sign-off asks again"; APPROVED BY: "…, and OIL stays unanswered for now"; Yes · FO: no line; Save → four stand, publishable; after publish Ranger's OIL shows (D2800, D2859, D2867).
2. WALK — D2869: Saber's Training answered No before signing, four signed (no list); Saber (member) changes No to Yes → four cleared; back to No → RECORD (AM11).
3. WALK — Later ×3, APPROVED BY Yes + Save; the input window changes Yes to No → (host reading b) APPROVED BY falls, three stay — RECORD with a picture; back to Yes → RECORD.
4. WALK — published day, D2868: Later ×4, publish (note names the Training); answer Yes from the bell line → four stand, one change waiting, marker "Not yet published"; publish the amendment → "Signed AL1" names the four; OIL credited only now.
5. WALK — from 4, change a take-off time → four fall, two waiting (D103); put it back → names return, one waiting.
6. WALK — after AL1 with Yes, change to No at the Inputs page's decision → RECORD whether the names fall (contradiction 1).
7. WALK — reading (a): Later ×4, answer Yes at the input window, then No, then Yes · HO → names stay — RECORD each.
8. WALK — four signed over Yes · FO, changed to Yes · HO → four clear (D2869); back to FO → RECORD.
9. WALK — the same answer saved again → names stay, nothing waiting — RECORD.
10. WALK — Sat–Sun Training, Saturday signed ×4 over "Yes, both days"; Sunday switched off only → Saturday's stay; Saturday switched off → Saturday's clear — RECORD.
11. WALK — Sat–Sun unanswered; Saturday Later ×4; Sunday CUR CK answers Yes + Save → Saturday's four stay, its next press asks nothing; change the answer from Sunday → Sunday's CUR CK falls, Saturday's stay — RECORD, Saturday seen from Edit Schedule's week.
12. WALK — two Trainings; CUR CK picks one: "Save: the next sign-off asks the rest"; Save; SKED CK lists only the other; Later; PLANNED BY Later; APPROVED BY none picked: "…OIL stays unanswered for now"; CUR CK's name survives.
13. WALK — last box, two rows: one picked "Save: the rest stays unanswered for now"; both: no line; un-pick: line back; "Yes to all": no line (D2867).
14. WALK — Later after picks: name signed, nothing answered, next press unpicked, "OIL?" tag still there; ✕ and Escape: nothing signed or answered, next press asks (D2299).
15. WALK — three Later names made stale by a remark edit; the fourth's foot must not read as the last box — RECORD; all four valid, CUR CK re-picked: RECORD its foot.
16. WALK — clearing a name with a question open: RECORD whether a list opens; no line may name an empty signer.
17. WALK — a missing time refuses first, no list; time emptied behind the open list: no promise; Later and Save sign nothing — RECORD whether Save wrote the answers.
18. WALK — phone board, a long callsign, two rows: all four foot lines fit beside Later / Save; a picture after each tap (D1281).
19. WALK — Edit Schedule's week: Later ×2 there, answer from the board → the names agree on board, week and phone; list open from the week, week changed → nothing signed (D2316).
20. WALK — plans: plan A Later ×4; plan B asks again, Yes + Save; back to A, its four stand; change to No → RECORD A's names (stay) and B's signer (falls); Save after a plan switch behind the list signs nothing.
21. WALK — a published version loaded back with the input unanswered: the note counts it, the list opens with no held box; Later signs nothing; the next press asks — RECORD boxes and the count.
22. WALK — Undo / Redo through Save: Undo → name gone, answer stays; Undo → answer gone, three Later names stand; Redo ×2 → all back; on a published day the count returns to 0 — RECORD.
23. WALK — names signed over an answer, the answer taken away → names clear (D2869 "changed" includes removed) — RECORD.
24. WALK — each door after Later ×4: input window, Inputs page decision, bell line, the member's own, the holiday list → names stay (D2801); each door CHANGING an answer signed over → names clear (D2869).
25. WALK — the same input answered at its window behind the open list → row leaves the list; RECORD Save / Later with no rows; the name signed once.
26. WALK — a holiday declared after a weekday was signed and published, answered in the list → RECORD names and count (contradiction 2).
27. WALK — four over Yes; cancel → fall; un-cancel → return — RECORD; signed while cancelled, un-cancel asks, Yes → RECORD.
28. WALK — Logic value: Later ×4, change "Full day of OIL" → names stay; answer Yes → still stay; signed over Yes, value moves his OIL → clear; put back → return (D592 (4)).
29. TEST + WALK — reload: after 3's state, reload and sign in → all four valid; change the answer → only the Save signer falls; the kept answers survive saving and loading, export and import, an Undo snapshot.
30. TEST — the binding: (a) input moved off the day and back with another answer; (b) a second input filed after signing, then answered; (c) No is an answer, not open; (d) a person added to the shared input after signing; (e) a day that earned nothing at signing, first Yes later; (f) another squadron's admin answering for a moved man's day — (c) No→Yes clears; others RECORD.

## Contradictions it named
1. After publication, Later names were never "signed over" an answer: could an answer be published, flipped and published again unsigned? — **Host: no.** Publishing re-bases the day; the next amendment is signed afresh over the answer as it stands (test "after the amendment carrying the answer goes out…", `src/ui/oilsign.test.tsx`).
2. A question that did not exist at signing (holiday declared later, un-cancelled, moved onto a weekend) is unruled.
3. With only the answer waiting and four names standing, an amendment can go out with no fresh signature — consistent with D2868; worth showing him.
4. Reading (b): the outcome depends on whether the last signer answered in the list before signing or at the input window after.
5. "stays unanswered for now" on the last box may read softer than the publish note ("nobody on it earns OIL").
6. Later after picks, ✕ after picks, and Save: three near-identical exits; the foot explains one.
7. An answer removed (Undo) is not named by D2869; the build treats it as changed.
