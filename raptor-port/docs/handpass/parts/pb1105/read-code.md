# Fresh, blind code read — [POSTOUT-RUN-NOTICE] (branch claude/postout-bell-look, `git diff 890964ac7..HEAD -- raptor-port/src`)

**Count: 3 findings (1 medium, 1 low-medium, 1 low) · 5 small notes.** No high-severity fault found. The bell line's words, who is told, the held-posting silence, the member-view hiding, the deleted man's dead tap, the Archived fold and the ring's six seconds all read correctly against D1546, D1547, D1690 and D1691.

Read: the whole diff; `state/sched-commit.ts` (decompose, schedWriteRecords, applyEnd, tellBegin/tellPass, APP_ACTS, afterCommandPass, commitInputsWith); `state/noticeseen.ts`; `state/notices.ts` (noticeLive, allNoticesFor, noticesFor, noticeWords); `ui/topbits.tsx` BellList; `ui/topstate.ts` openNotice; `state/perms.ts` (cmdAuthorize, postingPassViolation, the member notices case); `state/history.ts` histSnap/histRestore; `state/persist.ts` notices mapper; `undo/timeline.ts` (NOT_STEPS, moduleOfColl, NOT_UNDONE_TYPES, deferred collections); `leavewar/state/store.ts` (setPostOut, markPostingDone, openStint, closeStintOnArchive, windowRecord); `leavewar/sync.ts` (schedulerIds, endedLines, postedLines, poDueNow, poHeldReason, runPoOutcomes, warNoticesReversed); `ui/Shell.tsx` (AdminPage mounting); `main.tsx` (StrictMode); the records docs (`data-model.md` §11 and the posting-pass paragraph, `data-schema.md` notices, `notifications-register.md` P14).

---

## Findings

### 1. (Medium) For Overseas Sqn and SANS, the posting pass now enlists the schedule without first bringing its saved-state marker up to date, so any schedule or request change still outstanding outside a command rides into the pass as the app's own act, past a gate that does not look at it

**What changed.** Before this branch, an Overseas Sqn or SANS pass never touched the scheduler store. Now it always enlists it, and calls `schedApplyEnd()`. But the resync that every other non-scheduler writer runs before enlisting is still guarded by `needsDays`, so it only happens for a Delete. `leavewar/sync.ts` ~2341: `if (needsDays) resyncSchedBaseline()`, then ~2345: `txn.enlist(schedStore)`. The scheduler store's before-image is the *lagging* baseline (`sched-commit.ts` `capture: () => { tellBegin(); return baseline() }`). The house convention for a command that is not itself the in-place schedule edit is to resync first. `commitInputsWith` (sched-commit.ts ~629–637) does this, and says why: so that "any out-of-band (bare) INPUTS write that reached the model before this command" is not swept in, and a rollback does not restore "a stale baseline that drops the bare row". The Delete branch of this same pass already follows it.

**The failure, step by step.** A schedule or request change is sitting in memory outside any command. That covers an escape site, an out-of-band INPUTS write, or (the threat D1510's security read named for this very pass) a change typed into the browser console. Then a man's Overseas Sqn or SANS posting falls due: the first notify after midnight, or boot.
- (a) The pass's change-set now holds that day, request or notice change, saved under `lw.postoutRun` as the system actor. `postingPassViolation` (perms.ts 1023–1108) checks only `lw.postouts`, `people`, `settings` and `notices`. It lets any `days/*`, `sched.*`, `inputs/*` or `plan/*` change through, and `ownershipViolation` returns null for the system actor after it. This re-opens, for the schedule, exactly the hole [SYSTEM-PASS-SAVES-ROSTER] closed for the roster. The rule is written "read off the envelope alone, so the database step can hold the same rule on the changeset", and on that reading the pass's changeset may now carry any schedule change.
- (b) `tellPass` takes its before-image from the same lagging baseline. People in an input the stray change touched are told "with no name", as if the app had done it (APP_ACTS, `app: true`).
- (c) If the pass is refused for any reason, the scheduler store's rollback is `histRestore(lagging baseline)`. That throws away the outstanding change and every notice since, which is the commitInputsWith comment's warning.

Before this branch none of (a)–(c) could happen on a non-delete posting. How often it bites depends on how often the baseline is dirty when a posting falls due: rarely in normal use, but it is a weakened security property, not just a cosmetic one.

**Fix.** In `runPoOutcomes`'s apply, resync whenever the scheduler store is enlisted, not only for a Delete:
```ts
resyncSchedBaseline()            // was: if (needsDays) resyncSchedBaseline()
txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(lwStore)
txn.enlist(schedStore)
```
This is safe when the pass joins a parent command: the Delete path already resyncs while joined, and the parent's before-image was taken at its own enlist. Belt and braces, also tighten `postingPassViolation`: when no posted outcome is `delete`, refuse any change whose collection is `days`, `sched.*`, `inputs` or `plan`. Add a red-first test: an Overseas Sqn pass with a bare in-memory INPUTS change outstanding must not carry an `inputs/*` change in its `lw.postoutRun` envelope. Note the change in `data-model.md`'s posting-pass paragraph (D200).

### 2. (Low-medium; records, D200 and "keep the table list true in the same PR") The permissions table, the stored-record docs and the notifications register were not updated for the new line or the new writer

The branch changes `perms.ts`: `lw.postout` and `lw.postoutRun` now create a Notice, `po` joins WAR_LINE_KINDS, and the pass gate gains a notices rule. It also adds a new stored notice kind `{ k: 'po', who, o, acct? }` and a derived line id `po:<id>:<date>`. None of the record homes say so:
- `docs/data-model.md` §11, the `Notice` row (~line 1560). It lists three writers (an input change, the holiday line, the war's lines). The posting pass, and the admin's own Post out for a posting dated today, are missing as a fourth writer, as is "a member's command never carries a posting line".
- `docs/data-model.md`, the posting-pass paragraph (~line 1588). It says the pass may change only the posting record, the Person, the User and the access rows. It should now also say it may create Notice rows: only new ones, nobody named, each about a man that pass posts out.
- `docs/data-schema.md`, the notices paragraph (~line 447–449). It lists every `what` kind except `po`, and the derived `lwend:` id but not `po:<id>:<date>`.
- `docs/notifications-register.md` P14 (line 59) still reads "not built yet". It should give the 14-day window for the derived "off the manpower" line and the reading that a line stays after "Undo post out".

**The failure.** The IT side's table format is written from these documents (D473), so the Notice table would be specified without the pass as a writer and without the `po` kind. The next agent reading §11 would also take a `po` line in a change-set as a breach. **Fix:** update the four places above in this branch (D200 requires perms.ts and §11 to change together). If the closing records commit is planned to carry them, name them in the handoff.

### 3. (Low) Tapping a posting line while on Admin → Users wipes a half-typed "Add a person" form, or an open row's typed edits, without a word

**The failure.** An admin is on Admin → Users. He has typed a new person's callsign, sign-in and post-in date in "Add a person", or opened a row and typed a new callsign or a Restore date. He opens the bell and taps a "Posted out" line. The page stays on Users and the man's row rings, but everything he had typed is gone.

**Cause.** `ui/AdminPage.tsx` line 264: `<UsersPanel key={ring ? ring.seq : 0} …>`. A new key remounts the whole panel, which resets `name`, `np`, `role`, `postIn` and `editing` (UsersPanel.tsx 415–424). The remount is there to clear the search and close an editor (the comment at 445–449), but it takes the add form with it. A later intent with no person also flips the key from `seq` back to `0` and remounts again (setRing(null) at AdminPage.tsx 215).

**Fix.** Drop the `key`. Inside UsersPanel, reset only what hides him, on each new tap:
```ts
useEffect(() => { if (!p.ring) return; setFind(''); setEditing(null); setArchOpen(P(p.ring.pid)?.archived ? true : null) }, [p.ring?.seq])
```
Pass `seq` in `ring`, and keep the scroll effect on `ringPid`. The add form keeps its words. Add a test that typed add-form text survives a posting-line tap.

---

## Small notes (not findings)

1. **An admin made SANS, or posted with no outcome, is told about himself.** The comment at sync.ts ~2381 says "a posted-out admin is told nothing about himself", but that only holds because Overseas Sqn and Delete take him out of `schedulerIds()`/`here()`. With SANS he stays an admin, and `noticePosting` sends him "Hex · Posted out · now SANS". `postedLines` likewise gives a "none" admin his own line. Not against D1547's "every admin", but the comment overclaims. Either reword it, or skip `t === who` in `noticePosting` and `pid === id` in `postedLines` if he should not be told.
2. **The derived "off the manpower" line can vanish before its 14 days.** If the man is later archived on Admin → Users, `closeStintOnArchive` rewrites the outcome to `overseas` (store.ts 2239–2241). If he is deleted, `postedLines` skips `body.deleted` and `rec.gone`. Either way the line, read or unread, leaves the bell. A stored line for the other outcomes stays forever as "the record" (D1691), so the two behave differently. The 14-day cut is itself the builder's reading (borrowed from the ended-stretch line) and should be named to him at his look.
3. **The pass gate's notices rule is loose** (perms.ts 1090–1096). A `po` part is checked only when it is `what[0]`. `to` is not checked to be an admin who can sign in. `o`, `acct` and `day` are not checked against the posting that ran. A forged pass line could tell a member, or say "deleted" for a man made SANS. For the database step, check every part with `k === 'po'`, require `to` ∈ the admins and `o` = that posting's outcome.
4. **Dev server only:** under React StrictMode (main.tsx line 63), entering Admin from another page via a posting line leaves the ring on for good. The mount's double effect runs the unmount cleanup (AdminPage.tsx 222), which clears the timer the intent effect just set, and the re-run finds ADMINOPEN already cleared. This is the walk's B4 again, but only on `vite` dev; the built app is unaffected. Moving the timer into its own effect keyed on `ring?.seq`, with its own cleanup, fixes both this and unmount.
5. **Stale comments contradict the built behaviour and the test.** `state/notices.ts` ~383–384 ("a posting's own Undo … takes the line with it") and `leavewar/sync.ts` ~2380–2381 ("goes with its Undo") are both wrong. The top bar's Undo refuses a posting (D350, `NOT_UNDONE_TYPES` has `lw.postout`), and "Undo post out" keeps the line, as pinned in postout-notice.test.ts. Fix the wording so the next agent does not "repair" it. Also: `#page-admin .acc-row[data-person="${ringPid}"]` (UsersPanel.tsx 453) puts an id into a selector unescaped. `CSS.escape(ringPid)` would be safer if ids are ever minted with other characters.
