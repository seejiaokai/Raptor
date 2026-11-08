# The fresh, blind Opus read — React Doctor's last findings, pull request 702, 8 Nov 26 (chat 32)

On a clean copy of the branch (no walk reports, sheet, scenarios or handoff), the brief
`docs/superpowers/briefs/2026-11-08-rd-last-findings-read.md`, unchanged.

**No high or medium findings.**

**Low 1 — a comment overstates a safeguard.** `state/people-settings-commit.ts`, the note above `ModuleLoaders`, says
no command of the four files can run before registration because the registry refuses an unregistered type. The gate
(`command/permissions.ts` authorize) lets the app's own headless actor through before it looks the type up, so such a
command could run before registration, and a throw would then roll back with the empty loaders (`main` used the real
ones from the start). Not reachable in the app: every entry imports `state/store.ts`, whose load runs `wireStore()`
before any command. Fix: reword the comment (the reader's text); optionally make the placeholder loader throw under
tests. Proving test: a fresh module context that never registers, a system-actor commit that throws, the accounts list
not reloaded.

**Negatives:** the boot entries; every writer's declared type (the same set; only lwseen and apprseen swap places,
which a `Map.set` does not care about); the 15 loaders in the same order, looked up each run; module load order; the
split editors (rows keyed as before, so every piece of typed state starts and ends at the same moments; every handler,
id, class and ruling-bearing line carried over word for word); the widened CSS rule (only "Dates" and "Person" use the
new span); the label ids unique across both clearing forms, the list's spoken name unchanged; the access screen;
permissions untouched; the old cycles outside the job neither added to nor worsened.

**Tidiness (filed, not fixed):** the cycle story told three times at length (the commit file, the wire file, the wire
test) — one telling and pointers would do; the commit file's note names roster-add and memberfile among files it does not
import, which `main` never imported either; the wire test checks roster-add but not memberfile, quals-write or
person-delete.

Rulings: none
