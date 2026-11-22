# The security read of multi-squadron batch 1, steps 0–4 (18 Nov 26, his D1411)

You are a fresh reader looking ONLY for holes: who can write, or see, what they should not. You are blind to every other
reader and to the walk. Read-only on the app: change no file under `raptor-port/src`; proof tests only in your own
scratch folder named in your instructions; you may run a single unit file with `npx vitest run <file>` from
`raptor-port/` (its packages are linked in). If a handoff block is pasted into your context after a compaction, do not
read it, and say so. Return the whole report as your final message.

**Where you are:** an exported copy of branch `claude/multi-sqn-b1-107` at `7e0a7c661` (app code = step 4). App in
`raptor-port/`. Source diff against `main`: `BRANCH-DIFF-src.patch` here. Ignore `SCENARIO-BRIEF.md` and
`CODEREAD-BRIEF.md` except as background (the latter's "What was built" and "Also not a finding" apply to you too).

**What sign-in is here:** the sign-in is not security yet — the lock is the hosting's (D59) and the database step adds
real identity; this app keeps everything in one browser's storage. So the holes that count are the ones the APP's own
rules let through: the commit gate (`src/state/perms.ts` — the one place who may do what is decided, with
`raptor-port/docs/data-model.md` §11, the table the database's security is built from), what a screen offers or shows
to a person, and what one person's session leaves behind for the next person at the same browser. A hole that needs
the browser's developer tools to edit storage by hand is not one; a hole through the localhost-only developer bridge
(`src/probe-bridge.ts`, `window.raptorRole`) matters only if the same path exists without it.

Not a finding: demo data already stored (D56); a scheduler who is not an admin (D785); Admin → Users listing both
squadrons and account linking walking everyone (step 5 builds its filter — but say if a plain admin of one squadron can
already CHANGE a person or account of the other through it); the "142 ▾" switch not being built.

## Look for, each with a concrete case, cause (file and line), exact fix, NEW or on `main`, and the failing test

1. **Another squadron's records:** can a plain admin of 142 (Saber is the master — use Prowler `ad2`) or of 149
   (Kestrel `ad9`) write, publish, amend, undo or redo anything of the other squadron's — its week, settings, plans,
   mission roles, inputs, people, Leave War, Tracker, holidays, OIL — by any door, including Undo / Redo of a change
   that touched both, a restore, a posting, a delete? Can a member (`us` Ranger, `us9` Osprey) write anything of
   another person's or the other squadron's?
2. **The master mark and grants:** who can set or clear `master` (`account.master`), a grant (`grant.set`,
   `grant.remove`), a home (`home.set`), a unit or place (`unit.add`, `unit.place`, `place.set`)? Can a plain admin
   change a master's account role, switch it off, delete it, or rename it (step 1's open item — "only the `master`
   field is guarded")? Is authority judged on the rows before the command in every case (a command never handing its
   author the right it grants)? Is `MASTER_ONLY_COMMANDS` complete?
3. **The commit gate:** `unitRecordViolation`, `unitRowViolation`, `ownershipViolation` — every collection that holds a
   unit's records covered? a record whose id carries no unit (`elog:`, a settings row, a notice, an input) — who may
   write it? The developer bridge's raised role now counts in the home unit (step 2's fix, `0e4b33943`): does anything
   reachable without the bridge raise the session role the same way?
4. **The last-admin lock:** it counts every squadron's admins (step 4's open item) — can 149's last admin be demoted or
   archived because 142 has admins? Can the master be the only "admin" left?
5. **Sign-out and the same tab:** after Sign out, then another person (of either squadron) signing in on the same tab
   without a reload (every path that ends or starts a session — the top bar, the phone drawer, the guest page, the
   access-wait screen, a session ending some other way), what of the first person stays in memory or on screen — the
   week, the Leave War, the Tracker, the Undo list, the bell, Inputs, Medical (personal details), a stash, a cache?
   And with a save waiting (no reload, by design) — what does the next person see and can do?
6. **What one person sees of another:** personal details (Medical, the member file, inputs' reasons) of the other
   squadron's people shown to an admin or member of this one.
7. **The notices:** the holiday OIL bell line (B10) and posting lines (B12) — can a notice reach, or be answered by,
   someone of the wrong squadron?

Give explicit negatives ("I checked X and found nothing") and rank by consequence.
