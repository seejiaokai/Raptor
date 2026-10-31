# Job 2 (31 Oct 26, the night) — the security reader's narrow read of fix round 2 (5a2e552f5)

Read-only. Saved as it arrived.

**The opening reported in `read-fix1.md` is closed; no new bypass meeting D489.** Checked: a field added beside the
seeded ones — refused by the field list; an id colliding with the seed — must then carry the seed's name, role and owner,
so it is the seed row; a posted man's row at another role — refused; another seeded man's row changed on the way —
refused; no legitimate first-store pass refused (Overseas on a first write — the commit's test; SANS writes no account
row; Delete leaves his seed row out; a man with no account or one already off makes no write — the six-field claim rests
on the commit's tests, not on a check of the seed list); §11 now true to the code and rightly says the allowance does
not carry over to the database.

**1. Low, this build only; no path in the app produces such a changeset.** The rule checks each first-write row it is
given but never that the whole seeded list is there. (a) A pass changeset carrying only bane's suspended seed row
passes; the loader then reads stored rows, so every other seeded account is gone, admins included. (b) With some rows
stored and seeded account C deleted by an admin, a changeset putting only C back passes the "first write" test (every
row in it has no before-image) — C comes back at its seeded role. Cause: "first write" still judged from the rows
present. Fix: when `firstStore` is true, require a put for every row of `seedAccounts()` except a Delete's posted man.

Verdict: closed for the database step; gap 1 is optional hardening of this build's gate, not a block on his look.
**Host's decision (the cap of about three fix rounds, the bug-check order §5):** filed as
`[POSTPASS-FIRSTWRITE-WHOLE-SEED]`, not built tonight — unreachable from the app, the reader's exact fix in the item.
