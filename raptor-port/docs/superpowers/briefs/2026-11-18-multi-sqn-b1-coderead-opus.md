# The fresh, blind Opus code read — multi-squadron batch 1, steps 0–4 (18 Nov 26)

Head (from the brief, the run and the reader's own clock): a fresh Opus agent (Agent tool, not the check lead), brief
`CODEREAD-BRIEF.md` (saved beside this report as `2026-11-18-multi-sqn-b1-coderead-brief.md`), working only in an
exported copy of `7e0a7c661` (app code = step 4 `a646aa024`), blind to the walk (not started), to Astra's code read
(started 04:12, after this one ended) and to the security read (run alongside in its own copy). Started 03:59:37,
finished 04:10:46. Its proof tests stayed in its copy (`src/__proof_opus__/`), never in the app. Saved as it came.

---

Opus blind code read, copy of 7e0a7c661, started Wed 18 Nov 26 03:59:37, finished 04:10:46 (copy clock, MPST).

No handoff block was pasted into my context, so there was nothing to set aside. I read only inside copy-opus/. Four proof tests are in copy-opus/raptor-port/src/__proof_opus__/. I ran each one on its own and each fails on this code.

## Findings, most serious first

### F1 (HIGH, permissions, new on this branch). A 149 admin can move any 142 man into 149
- **What goes wrong.** Sign in as ad9 (149's plain admin). Call `setHome('prowler','u149')`, the `home.set` command. It is accepted. Prowler is a 142 admin.
  - Prowler's home becomes 149. The move takes effect today, not tomorrow, because the seeded 142 people have no stored home row, so `setHome` treats it as his first row.
  - His account role is his level in his home unit. So the same command makes him an admin of 149 and removes him as an admin of 142.
  - His inputs, his OIL (worked out on his home unit) and his Leave War row move with him.
  - Run the other way, a 149 admin could take 142's only plain admin out of 142.
- **Rulings it breaks.** D2160 / D2184 (only a squadron's own admins, or a master, decide its admins) and D2087 (one home squadron).
- **Proof.** `__proof_opus__/home-cross.test.ts` fails. It gets `{ok:true, homeTomorrow:'u149'}` where it expects a refusal.
- **Cause.** `state/perms.ts unitRowViolation`, the WHO block (`for (const img of [b, n]) if (img && !adminOf(String(img.unit)))`). For a home row it checks only the unit the row names, before and after. A move writes a new row (new id, `b` null), so only the destination unit is ever checked, never the unit he is leaving. `state/units.ts setHome` makes the same single check.
- **Fix.**
  1. In `unitRowViolation`, for each `HOME_PFX` change with `n != null`, first ask whether the person is new in this command: `made = env.changes.some(x => x.collection==='people' && String(x.id)===String(n.pid) && x.before==null)`.
  2. If he is not new, work out the unit he leaves: `leaving = homeBefore(String(n.pid), String(n.from), before)`.
  3. If `leaving && leaving !== n.unit && !adminOf(leaving) && !master`, refuse with "not an admin of the squadron he leaves". The "made" test keeps a 149 admin's own `person.add` working; it would otherwise trip over the demo's fallback home of 142.
  4. For a deleted home row (`n == null`), apply the same check to the unit the person falls back to.
  5. Optionally, mirror the check in `setHome` so the refusal message is clear.
  6. Add the proof test to `state/units.test.ts`.
- **Who can reach it today.** Only a forged command or the developer bridge; no screen offers it yet. The gate's own comment claims to cover "every actor and every door — a typed command, a forged one, an Undo or a Redo".

### F2 (HIGH, permissions, new in effect). A 149 admin can make a 142 member an admin of 142, and change or switch off any 142 account
- **What goes wrong.** Sign in as ad9 and call `updateAccount('acus', { role: 'admin' })`. It is accepted: `levelIn('acus','u142')` becomes 'admin'.
  - This is reachable on screen today, because Admin → Users still lists both squadrons.
  - The same gap lets him switch off or delete a 142 account, or change a 142 person's record.
  - The last-admin lock (`accounts.ts:629`) counts every squadron's admins together, so it does not stop a squadron losing its own plain admins.
- **Proof.** `__proof_opus__/account-cross.test.ts` fails. It gets `{refused:false, role:'admin', level142:'admin'}`.
- **Cause.** Accounts and people are community records, so their change ids carry no unit, and `unitRecordViolation` returns early with no unit to check. No other check asks whether the actor is an admin of the target person's home unit. The builder already flagged this for the security read: "only the `master` field is guarded".
- **Fix.**
  1. In `ownershipViolation`, add a check for each `account:` change (role, on, offBy, delete) and each `people` change by an admin in force.
  2. Take the target's home unit on today's date: `homeBefore(pid, today, rowsBefore)`, where pid comes from the after-image or else the before-image.
  3. Require `levelBefore(actor, thatUnit) === 'admin'` (a master passes everywhere).
  4. Make the last-admin lock count admins per squadron: the target's home unit's admins, plus its admin grants, plus masters.
- **Is this step 5's job?** If step 5's plan already contains this gate check, it drops to MEDIUM. If not, note that step 5's list filter alone would not close it: a forged command, or an Undo or Redo, still gets through.

### F3 (MEDIUM, saved data and lifetime, new). Sign-out does not always reload, and then the next person keeps the first person's Tracker
- **What goes wrong.**
  1. The 142 admin opens the Tracker. A save fails and "Not saved" is showing.
  2. He signs out. `ui/logout.ts` deliberately skips the reload while a save is waiting.
  3. Kestrel (149) signs in on the same tab. His schedule and Leave War swap to 149 correctly, but `storageUnit()` stays 'u142'.
  4. Every Tracker edit Kestrel makes (deleting a ball, importing a chart, a flex setting) lands in 142's Tracker.
- **Proof.** `__proof_opus__/tracker-after-signout.test.ts` fails: it expects 'u149' and gets 'u142'.
- **Cause.** `tracker/storage.js bindStorageUnit` refuses any rebind once the Tracker has loaded (`if (loaded && boundUnit != null) return false`), and `logout.ts` skips the reload when `saveWaiting()` is true.
- **Which of the two builder statements is true.** Every sign-out door goes through `logOut()`: the top bar (`Shell.tsx`), the phone drawer (`Drawer.tsx`), the guest screen (`GuestApp.tsx`) and the access screen (`AccessScreen.tsx`). `logOut()` does reload, except while a save is waiting. So step 2's report is right in general. Step 4's "sign-out does not reload" is true only in this failed-save case. The plan's "refined as built, step 4" note says the sign-out reload is "not built in step 4"; that wording is out of date, because step 2 built it.
- **Fix.** In `resetSession`, after the session swap: if the Tracker has loaded (`storageUnit() != null`) and that unit differs from the new person's own squadron, do not show the old Tracker. Either reload once `saveWaiting()` clears (keep the band up meanwhile), or have the Tracker page show "Reload to open your squadron's Tracker" in place of the Tracker. Add the proof test to `tracker/trk-per-unit.test.ts`.

### F4 (MEDIUM, wrong unit read, a known open item whose effect reaches further than the change history)
- **What goes wrong.** Each change-history line has a date but no squadron. Every reader that pulls lines by date therefore mixes the two squadrons:
  - A 149 admin's edits to 149's Wed 15 Jul are counted in 142's day badges for 15 Jul ("new" counts: `ui/changesmodel.ts` `dayCounts` / `chgDayCounts` / `weekNew`).
  - 142's changes window for that day lists 149's lines, including 149 men's callsigns, leave and medical-type absence lines, to every 142 member. That goes against D2094 / D2160 Q5: another squadron is View only, and only by a grant.
  - The pending list's "who hid it" (`ui/pendlist.ts:431-433`) matches on weekday index and words only, so it can name a 149 admin for a 142 warning.
- **Cause.**
  - `engine/editlog.ts ELogRow` has no unit field, and the lines are stored as unqualified `elog:` rows.
  - `ui/changesmodel.ts linesFor` filters on `rowTouches(r, date)` only.
  - `storage/keyowner.ts` lists `elog:` as a unit's record, but it is written as one shared stream.
- **Fix.**
  1. Stamp `unit: UNIT` on each line in `logEdit` / `logAction`. Optionally also store the line as `<unit>@elog:<id>`.
  2. In `linesFor`, `dayCounts` / `chgDayCounts`, `weekNew`, `elogKeySet` / `elogAllFor` and pendlist's lookup, keep only lines whose unit is the unit in view, or that have no unit (lines about a person's own records).
  3. A test: a 149 admin's edit on 15 Jul is not counted in 142's `chgDayCounts`.
- **Proof.** None run; the missing unit is plain from the line's type.

### F5 (LOW, a cache that survives the unit change, new). Next week's seed is cached without its squadron
- **What goes wrong.** `engine/weekctx.ts bundle()` caches the seed week under `v+'@'+baseYear()`, where `v` is the bare week. `weekBundle` now depends on the unit in view.
  - The boot validates 142's week while 142 is in view, which caches 142's authored 20 Jul week.
  - A 149 person then signs in on the same page; there is no reload between the boot and the sign-in.
  - From then on 149's next-Monday reads (`nextMondayWorked`, `nextMondayDay`, `nextMondaySeed` — the run-length trace, "Breaks Monday", Sunday's max-run limit) get 142's Monday instead of 149's blank one.
- **Proof.** `__proof_opus__/bundle-cache.test.ts` fails: it gets 142's Jul 20 Monday where 149's blank Monday is expected.
- **How much it matters.** Small today: 142's men are not 149's, so person checks find nobody. It only happens when 142's 20 Jul week has not been saved yet (a fresh demo store). It will matter once step 5 lets people switch squadrons.
- **Fix.** Key the cache on the qualified week: `const ck = (unitOf(String(v)) ? String(v) : qualify(UNIT, String(v))) + '@' + baseYear()`.

### Smaller notes (not ranked as findings)
- **(a) `setHome` on a seeded 142 person takes effect today, not tomorrow.** He has no stored home row, so the code treats the move as his first row. D2119 says a change counts from tomorrow. This only affects demo people with no home row; a shared store writes a row for everyone. Step 6 may still seed 142's people without rows.
- **(b) `guestview` is stored per squadron, but a guest always sees the boot squadron.** A 149 admin's guest switch has no effect. This is step 5's Request access work.
- **(c) The gate does not check inputs by squadron either.** A 142 admin could edit or delete a 149 member's input through a forged command. No screen offers this today (the Inputs pages, the board, the bell and OilDayList are all filtered by squadron). If F2's fix is built, add inputs to the same check.

## What I checked and found nothing
- **OIL pass:**
  - `desiredOilCells(unit)` reads the loaded week live only when it is that unit's, and its other weeks from the stash by qualified key.
  - `earns()` and the reverse sweep skip a man whose home that day is another squadron.
  - `swapWarWorld` runs after `switchUnit` in `resetSession`, so 149's pass reads its own live week.
  - Switching back and forth cannot move credits: the stash holds every squadron's stored weeks from the boot.
- **Holidays:**
  - `nonWorkingFor` / `placeHolidaysFor` drop their caches on a world swap (`STORED`, `PLACE_CACHE`), and `getState`'s cache is keyed on `PLACE_VER`.
  - Laid-on holidays are read-only; writers use `rawState`.
- **R32:**
  - `holidayOutOfDate` covers only public holidays.
  - Other squadrons are counted only on dates they share the place.
  - `oilOpenOn(unit)`, `holidayLeft(…, pid)`, OilDayList and `saveOilDay` each take his own squadron.
  - The list opens only on runs where his squadron has inputs to answer.
- **Postings:** the bell lines go only to `ownSchedulerIds`.
- **Identity:**
  - Every date reader I traced splits the unit off first: `verid dayIso`, `derive isoOfDay`, `persist weekKey/weekId`, `weekBundle`, `weekstash wkOf`, `boardland`, `schedPostRestore`, `resolvePublishDay`, `undo-wire` `loadContext` / `flyDateOf` / `landingOf`.
  - No `newId` prefix produces an id that `split()` misreads; 'up…' only ever appears after `unitplace:`.
- **Saved data:**
  - Leave War and Tracker doors: `unitDoor` lists only its own unit's keys.
  - `hydrate` skips week rows with no unit.
  - `hydratePlan` and `hydrateRolesFor` read only their squadron's rows.
  - `seedDemo149` adds nothing already there, and only on a fresh store.
  - The boot seeds each other squadron's war only on a fresh demo store.
- **Permissions:**
  - `unitRecordViolation` handles the master, a plain 142 admin, a 149 admin, a member, a View right (refused) and an admin viewing as a member.
  - The developer bridge's raised role is installed on localhost only (`main.tsx isLocalHost()`).
  - `MASTER_ONLY_COMMANDS` gates `unit.add` and `account.master`.
  - The master-mark checks in `unitRowViolation` look right.
- **Undo:**
  - `inUnitView` filters steps by their record ids.
  - `endUndoSession` runs after the world swap, so the swap's own passes are no step of his.
- **Sign-out doors:** all four go through `logOut()` (top bar, phone drawer, guest screen, access screen). `App.tsx`'s session remake keeps the same person and squadron.

## Not reached in the time
The SANS need figures per squadron in depth. Holiday remove or change on a line laid on from the other squadron (the builder already flagged this as open). Saved plans (`drafts.ts`). The Tracker's boot conversion under unit keys.

## Proof tests (all four fail on this code)
copy-opus/raptor-port/src/__proof_opus__/home-cross.test.ts (F1), account-cross.test.ts (F2), tracker-after-signout.test.ts (F3), bundle-cache.test.ts (F5).
