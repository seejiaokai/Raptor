# Fable code read — `[ACCOUNTS-NEW-PERSON]` (branch `claude/accounts-new-person`, build `09cc00e3`), 26 Sep 26

*(Saved from Fable 5.1's report, read-only, blind to Astra's. Verdict: FIX FIRST — finding 1 only. Condensed by the
builder for context; every finding, place, scenario and fix step is kept as Fable gave it.)*

Ran read-only: the 8 changed/added unit files (216 passed), `rulecheck` (OK — NP1–NP8 each named), `docsize --moves`
(exit 0). Not run: build, e2e, tfin, smoke, perf (the builder's).

## Findings, most serious first

**1. Approving: the "On the roster" note tells the admin to pick a person the picker does not offer (someone who already
has an account).** NEW in this change.
- **Where:** `raptor-port/src/ui/UsersPanel.tsx:116-124` (`rosterMatch`) checks `special` and `archived` but never whether
  the matched person already has an account; `linkablePeople` (`accounts.ts:160-165`) leaves anyone with an account out of
  `#apvPid`. Pinned WRONGLY by `ui/accounts-newperson.test.tsx:132-143` (both cases use Ranger, whose person `bane` holds
  the seeded `us` account) and by the walk's S8 steps (`np-walk.mjs` ~269-287, pictures 26/27).
- **Scenario:** someone signs up as "Ranger" (or "bane"). Approve → "On the roster" with the note "He typed Ranger — Ranger
  is on the roster. Pick them if this is them." The picker has no Ranger (he is `us`'s account). New person → "Ranger is
  already taken". Nothing wrong saved, but an instruction that cannot be followed — on the look card's own path; in the
  demo Ranger, Saber, Casper and Rocky all have accounts.
- **Fix:** (1) import `accountOfPid` in `UsersPanel.tsx`; (2) in `rosterMatch`, after the archived line:
  `const acct = accountOfPid(hit); if (acct) return { pid: hit, note: \`He typed ${r.cs} — ${p.cs} already has an account
  (${acct.name}), so this is someone else. Choose New person and give them another callsign or name.\` }` (mode stays
  roster); (3) the NP5 test: "on the roster" and "bare id" cases with a person with NO account (read `PEOPLE.<id>.cs`), plus
  a "Ranger" request asserting the new note AND that `#apvPid` does not offer Ranger; (4) `np-walk.mjs` S8: the new
  wording, re-walk pictures 26/27, note it in the sheet §5; (5) `ui-contracts.md` §Admin → Users: after "(an archived one:
  restore on Quals first)" add "; one who already has an account: says so — pick nobody, New person with another name".

**2. Evidence sheet — three roll-call items narrowed without a line in §8** (record gap; the code is fine).
(a) row 18: the board's Available crew was not walked (only the edit-week palette); `availHTML` → `availByWave` reads
`PEOPLE` live, so it should hold. (b) row 25: "his Inputs, the Leave War lights his row" (S4 reverse) — only his Quals row
walked. (c) row 26 / S14: a person AND account as the FIRST write on a fresh world, then a reload (the §7.7 trap) — the
walk's first write was the sign-up; the unit proxy `txn-wiring.test.ts` exists. **Fix:** add three `np-walk.mjs` steps
(board → Available crew lists Vyper; sign in as Vyper → Inputs shows the admin's input as his, the Leave War highlights his
row; a fresh profile whose first write is "Add person and account", reload, both present) and re-walk — or list each in §8
with its no-because. Not a "merge live" blocker if recorded.

**3. The plan says the three Quals "Add person" passages in `ui-contracts.md` were MOVED to the archive by script (§8;
§Round 1 F7); they were kept verbatim in place** in "(Was … — replaced by D217: …)" parentheticals. D138 is satisfied (the
old words unchanged, the ruling named). **Fix:** move them by `backlog-archive.mjs --move`, or correct the plan's §8 and
§Round 1 F7 to "kept verbatim in place with the pointer". Docs-only, its own commit.

**4. Nit — `scripts/handpass/am/mk-new-person.mjs:103` still fills `#accFull`** (the mock-up generator; matters only if
re-run). **Fix:** fill `#accIni` / select `#accSeat` / `#accCat`, or a header note that it drew the mock before the build.

## Explicit negatives (checked and sound)
Atomicity (both stores enlisted before `fn`; phase 6 restores both, the index and the baseline; the whiteboard savepoint;
the id minted inside; `CmdRefused` → `saidOf`; the member's own-row hand-made call refused by the ownership check; one
storage group; no notify on a refusal). Permissions (every command's actual writes match its `COMMAND_OPS` row incl. the
three corrected; `cmdAuthorize` checks every `more` op, no early success; §11 matches; every gate asks `perms.ts`;
`currentAdminAccountId` reads identity, not authority). The one add (the only new-`PEOPLE` writer is `roster-add.ts:93`;
PID-01 verbatim; personnel kept; picks fail closed). The bell (`shown` only while the Admin page is mounted; the 820px
breakpoint agrees; the effect cannot loop; `ADMINOPEN` one consumer, keyed on `seq`, cleared at sign-in/out; `seenBy` on
the request). Undo (people/settings not cut over — never offered). The words (the two constants where they belong; no
"(FCP)"/"(RCP)"; no `maxLength` on the callsign/name boxes). Saved shapes and docs carry the change. Every round-1 finding
of Fable's and Astra's checked in the code: landed (F7 — see finding 3).

**Verdict: FIX FIRST** — finding 1 (sits on the look card's approve path); 2 and 3 are record corrections; 4 a nit.
