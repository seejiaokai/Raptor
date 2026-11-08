# The security read (D1411) — React Doctor's last findings, pull request 702, 8 Nov 26 (chat 32)

A fresh, blind Opus reader, looking only for holes, on a clean copy of the branch (no walk reports, sheet, scenarios or
handoff), brief `docs/superpowers/briefs/2026-11-08-rd-last-findings-read.md` with the security-only scope.

**Findings: none.** Each of the four areas behaves exactly as on `main`.

1. **Who may do what, the boot routes:** the declared command types are the same set as on `main`, each still `anyone`
   (perms.ts decides through the resolver); perms.ts, the gate and data-model §11 untouched; memberfile and roster-add
   never declared here on either build. wireStore's order unchanged (sched layer → people layer → mission roles → the
   resolver → the member-writes-own check). The gate refuses an unregistered type for a person and lets the system actor
   through, as before. Registration only in wireStore, on both — the production start, `?fresh=1`, a second tab and the
   probe bridge import store.ts; the Leave War and Tracker boots never registered the people layer. None of the six
   modules imports store.ts, so the wire file reads their lists only after they have loaded.
2. **Sign-in and the access screen:** only a comment added; `autoFocus` was already there.
3. **Admin → Users:** reached only from Admin, its gating untouched; own row never opened (`!own`, button disabled);
   rows keyed as before, so each editor mounts afresh on open; starting values taken at the same moment; every handler
   uses the row's own person and his fresh account; no new leak of a sign-in name or role.
4. **Rollback and undo loaders:** the same 15 loaders in the same order; the four module loaders set in the same one-time
   registration that enlists the stores, so no rollback can run with them empty; restore, write, rebuild otherwise
   byte for byte. Only a direct call to the core with empty loaders before the wire file could keep them empty —
   nothing does.

Rulings: none
