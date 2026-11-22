# The red proofs of fix read 17, the core read and the full review (D2235, D2237) — chat 124, 20 Nov 26

Each file is a vitest proof that asserts what the rulings require, so it FAILS while the fault stands. Kept here as
text so the checks do not run them while red. To run one: copy it back without `.txt` into
`raptor-port/src/zz-repro-<letter>/` (the letter is the file's prefix), with its folder's harness file (`a-_harness.ts`,
`b-_harness.ts`, `c-harness.ts`), and `npx vitest run <file>` from `raptor-port/`. Each fix takes its proof into the real
test file of its area, red first. Every file here was run red by the host in `Raptor-msq` at `7dbc13fd0`'s app code
(`a`: area A, `b`: area B, `c`: area C of the full review; `r`: fix read 17 (`r1`–`r6`) and the core read (`k1`–`k4`)).
The table of what each proves: the evidence sheet `docs/handpass/2026-11-18-multi-sqn-b1.md` §Fix read 17.
