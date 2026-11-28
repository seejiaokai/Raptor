# Red team — readings-lapse fix plan and rulings-audit plan (fresh, blind Opus, 24 Nov 26)

## Plan 1 — the fix to the method

**Must-fix**

M1. **The new gate would not have caught this lapse.** C7 fails only "on a `READING D<n>` tag whose row carries no mark". The 22 Nov builder wrote "(his to change)", not a tag; under C7 that comment still passes, and `npm run readings` still lists nothing. The plan's own claim that this is "a reading living only in code — this lapse exactly" is wrong. C2 only helps if the builder follows it. *Fix:* on lines a branch changes under `src`, the check also fails on the free-text phrases ("his to change", "agent's/our/builder's reading", "until he rules") with no tag. Changed lines only, so the 40 old hits do not block anything; the audit clears those.

M2. **Words and drawings for the future fall between the two plans.** Layer 2 of the diagnosis is his approval of reworded rulings (D2390, D2394) that reused the word. His D2567 names "the words u … are going to create". C8 passes it on: "Whether the words' reviewer (a fresh Fable) should be given the same list is for the audit's plan to say". The audit plan then says it "does not touch the working guides". No rule covers it. *Fix:* in plan 1, add one clause in C1, or in the D2140 check-before-he-sees-it: any wording, drawing or question put to him that rests on a word with an open reading states that reading in the question, and Fable's words review (D2441) gets the `npm run readings` list.

**Should-fix**

S1. **C2 and C6 contradict each other.** C2 says the reading goes to him "before the code is read". C6 says "in his look at the latest". A builder can follow C6 and skip C2's earlier catch point, which plan 1 ranks as the cheapest (§B1). *Fix:* C6 should read "each already put to him under the builder's rule".

S2. **A reading the builder never noticed is caught only by C4,** and only where another surface answers the same question. C3 gives readers only the *listed* readings. *Fix:* C3, bullet 1, also asks each reader: for each ruled word in the promise that could cover more or less than one thing, what does the code make it cover? That is the audit plan's own step 3.3.

S3. **C3 extends the list to "a walker's" brief,** while §A layer 5 says "No change proposed here". Walkers do not judge readings. *Fix:* drop walkers, or say why they need the list.

**Minor:** C2's new paragraph is about 80 words (D1987); "Build the reading the app already uses" says nothing about what to build when the app answers two ways, which was the SANS case. The checklist's line 32 restates C3, bullet 2, but that is the checklist's normal shape.

## Plan 2 — the audit

**Must-fix**

M3. **"NO RULING" is defined so wide that the review will flood.** "It decides something a person sees" holds for every one of the 600–900 strings. Fable's expected 60–150 findings, and 4–8 rounds of 3–5 questions (about 40 at most), cannot both hold. *Fix:* NO RULING only for an item that states or enforces a rule: who may act, what counts, what earns, who is told, when. Plain labels are out. The host first settles findings an existing ruling already answers, and the number of rounds is sized from the real findings.

**Should-fix**

S4. **The "told" test is too loose.** A mention in a closing report or an evidence sheet counts as told, and then counts as MATCH. Layer 2 shows that his approving wording "as recommended" did not settle what the word meant. *Fix:* "told" means the reading was put to him as a question or statement he answered, or the row records it as told. A mention he never answered is UNASKED, lower in the harm order.

S5. **No link back to plan 1.** UNASKED findings are not given C1's `READING, NOT ASKED` mark, so `npm run readings` never lists them until he answers. *Fix:* the host marks each REAL UNASKED reading in its row when filing it.

S6. **List 1 is noisy.** It includes `src/engine`: 188 lines, mostly "assumed" in ported text. *Fix:* Step A keeps only the comments the port added in `src/engine`, which §5 already treats as the only part in scope.

**Counts spot-checked:** "his to change" is 40 lines in 27 files, not 38; plan 1 has 40. "agent's reading" in the full rows: 1,008, which matches. Full rows counted with `^| D`: 1,689, not "about 1,780". The differences are small. The SANS case would have been caught: step B, "is he planned that day", in slice 5. The scope is otherwise right, and §8's list of what to drop first is sensible.
