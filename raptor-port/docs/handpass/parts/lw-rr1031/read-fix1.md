# Job 2 (31 Oct 26, the night) — the security reader's narrow read of fix round 1 (63e1660d6)

Read-only; the two touched test files pass on that commit (72 pass, 1 expected fail). Saved as it arrived.

1. **Medium (for the database step; no path in the app reaches it today) — the first-write allowance lets a pass create
   any account, at any role** (`src/state/perms.ts postingPassViolation`). Exploit: a real SANS pass for rocky (SANS
   writes no account row), plus `settings/account:zz8`, before null, after `{name:'evil', role:'admin', pid:'rocky',
   on:true}` — the rule returns null. Cause: `firstStore` is worked out from the changeset alone
   (`acctRows.every(c => c.before == null)`): every new row has no before-image, so "no account row was stored before"
   means "this changeset changes no existing account row" — in the database, "the pass may create any new accounts".
   Second gap, same cause: under `firstStore` the posted man's own row with no before-image skips the pid, role and name
   check (`f && b && …`). The existing test covers only a new row beside one already stored. Fix: allow the first-write
   branch only when each row's id, name, role and pid equal the seeded list (accounts.ts's seed), the posted man's row
   differing only by `on:false`, `offBy:'po'`; §11 to say that at the database step the accounts are seeded at set-up,
   so the pass never makes a first write and the allowance does not carry over.
2. **The new rule refuses no real pass found:** Overseas Sqn with the account suspended (only `on`, `offBy`); SANS (only
   `quals.san`); Delete run late keeps `to`; a man who never arrived matched by the before-image branch; several men one
   day; a pass joined to a person's command lands under that command's type; one local date for rule and pass; the
   before-image is the person's saved copy after the put-back.
3. **§11 true to the code except finding 1** — "a store that has never saved the accounts saves the whole list on its
   first write" is the intent, not the check.

The put-back's `all`/`allavail` skip and the cutoff-spanning input refusal are correct. Verdict: the reported exploit is
closed; the first-write branch must be tied to the seeded list before §11 is translated for the database.
