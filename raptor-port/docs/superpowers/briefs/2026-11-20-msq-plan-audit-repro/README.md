# The Plan audit's red proofs ([MSQ-PLAN-AUDIT], his D2242) — chat 126, 20 Nov 26

`p-plan-audit.test.ts.txt` asserts what the rulings require (D2199, D2211: Plan given and taken by a master admin only;
D2201 with D785: Plan is an admin's), so each case FAILS while its fault stands. Kept as text so the checks do not run it
while red. To run it: copy it back without `.txt` into `raptor-port/src/zz-repro-p/` and `npx vitest run
src/zz-repro-p/p-plan-audit.test.ts` from `raptor-port/`. Run red by the host in `Raptor-msq` on `2e5468aaa`'s app code:
8 failed, 1 passed (the control) — `p-plan-audit.red-run.txt`.

| Proof | Fault | Goes to |
|---|---|---|
| PA1 (a)–(e) | a plain admin of a squadron, or a Plan holder of it, gives, takes away, lowers or passes on Plan — door and gate | the reshape's Piece B (core, phase 2) |
| PA2 (a) | Plan given to a member's account | Piece B |
| PA2 (b) | an admin given Plan, then made a member, is still a full admin of the other squadron | Piece B (the reading rule) |
| PA3 (a) | a sign-in holding Plan, re-linked by a non-master admin (Kestrel, with Plan of 142), carries the Plan to another man | Piece B (guardrail 1's who-rule) |

The build copies each into its area's real test file (`state/units.test.ts`, `state/units-sqn-guard.test.ts`,
`state/accounts.test.ts` or a Piece B file), red first, then green with its fix (plan §9.1).
