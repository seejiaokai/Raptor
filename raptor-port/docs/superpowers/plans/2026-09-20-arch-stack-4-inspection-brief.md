# ARCH-STACK step 4 — code inspection brief (one absence record)

Branch `claude/db-step4-one-absence`, base commit `d92303b9` (where the branch left `main`).
Builder: Claude (Opus). Inspectors: Codex and Fable, independently, read-only.

## What was built — the requirements to check the code against

The design is FINAL and not under review. Read, in this order (later overrides earlier):

1. `docs/superpowers/specs/2026-09-19-arch-stack-4-one-absence-design.md` (§1–§14, then §18–§26
   override earlier sections).
2. `docs/superpowers/specs/2026-09-19-arch-stack-4-clash-catalogue.md` (owner answers + the agreed
   main-code ladder at the bottom override the design).
3. `docs/superpowers/specs/2026-09-20-arch-stack-4-clash-check.md` — the build rules B1–B9, H1–H6 and
   the owner's answers A–D (20 Sep 26). **This file wins wherever it differs from the two above.**
4. `docs/superpowers/plans/2026-09-19-arch-stack-4-build-log.md` — what is built where.

In one paragraph: an absence (leave, medical, course, overseas duty) is ONE record — the Raptor Input.
The Leave War stores only its own records as a LIST per person/date (requests, OIL credits, replaced-bid
notices); everything the war shows about approved or filed leave is DERIVED on read (the day view:
main code by the agreed ladder, grey `+n` / amber `!`, charges by halves with a shared half charged
once). The old two-way copy (runInbound / runOutbound / retract) is deleted. Approving on the war
writes the Input inside the same command. All saves are all-or-nothing groups (phase 0).

## Where to look (non-test source)

- Phase 0 storage: `src/storage/{whiteboard,postman,backend,memory,browser,boot,reset}.ts`,
  `src/command/commit.ts`, `src/state/persist.ts`.
- The day view and the records: `src/leavewar/engine/{dayview,warrecs,charge,counters,availability,
  oiltracker,evaluate,seed,wars}.ts`, `src/leavewar/absences.ts`, `src/leavewar/state/merge.ts`.
- The war store (records, gestures, the absence door hook, per-record actions):
  `src/leavewar/state/store.ts`.
- The wiring: `src/leavewar/sync.ts` (absence index refresh, the absence door — approve /
  decideApproved / removeApproved / moveApproved — the clash strip, the OIL pass, the publish door).
- The rules at the inputs door (sick cuts leave, the no-overlap invariant incl. undo/redo, bid
  replacement + notices): `src/leavewar/inputgate.ts`, hooks `src/state/inputgate-hook.ts`, called from
  `src/state/store.ts` (`runInputWrite`) and `src/state/sched-commit.ts` (`schedWriteRecords` restore,
  `commitPublish`).
- UI: `src/leavewar/ui/{Matrix,DayList,Chrome,BidPicker}.tsx` + css; `src/ui/{InputsPage,inputedit}.tsx`.
- Landing: `src/engine/{slots,events,schema}.ts` (`srcType`).

## Please look hardest at

1. **Correctness of the derived view** vs the ladder and the owner's answers (C: leave outside the
   squadron window shows and is charged but never counts for manning; D: a shared half is paid by the
   leave covering more minutes, tie → earlier; H3-overruled: same-half leaves at non-overlapping times
   are allowed and the half is charged once; H4: the 15-day LL/OL run).
2. **Undo / redo** across both stores (global timeline): approve / un-approve / move / remove on the
   war; filing, sick-cut, bid replacement and notices on the Inputs door; publish replacing a bid.
   Every one must round-trip exactly, and a redo that would now break the no-overlap rule must be
   refused (B7).
3. **All-or-nothing saves**: can any command leave the war and the Inputs disagreeing after a refusal,
   a throw, or a crash mid-save? (phase 0 + the gestures + `runInputWrite` refusals.)
4. **Doors that bypass the rules**: every path that writes an Input or a war record — is there one
   that skips the gate (a raw `INPUTS.push` in a production path, a writer outside `gesture`, a
   restore path)? Is the gate's "changed records" test sound (it re-judges only records whose
   person/type/dates/times changed)?
5. **Permissions**: member vs admin on every new action (tap-list actions, OK-seen, posted-out
   filing, notices only when someone else replaced the bid).
6. **Performance**: the merged read (`getState()`), the per-person absence index signature, the
   Matrix corner-mark read — any O(people × days × inputs) path on a store change?
7. **Anything left behind**: dead references to the deleted copy (`source:'raptor'` semantics,
   `leaveInputAt`, `ingest*`), stale comments that now lie, UI text that says "syncs back".

## Output

For each finding: severity, file + line, the concrete scenario (inputs → wrong result), and an exact
step-by-step fix (the owner's standing rule: reviewers give detailed fix specs). Say plainly what you
did NOT inspect.
