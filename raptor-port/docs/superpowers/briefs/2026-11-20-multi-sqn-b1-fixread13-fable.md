# Fix read 13 — Fable (blind; no handoff block pasted) (20 Nov 26, chat 118; copy at `f4830e7b3`, code = `3d9743036`)

Read the brief, AGENTS.md, FIXES.patch, FIXES-LOG.txt and the changed code (perms.ts, persist.ts, accounts.ts,
undo/timeline.ts, undo/types.ts, undo-wire.ts, boot.ts, rowmap.ts); not fix read 12's reports or briefs. Proofs
`fr13-fable/raptor-port/src/zz-fable13/`, each run alone. **One finding, in D (low to medium); A, B, C and E held.**

## F13-1 — D closes the EDIT of a made-up record, not its DELETE (older; left open by D)
- A member pushes into memory his own leave "filed by" an admin of his squadron, type and title his choice, then deletes
  it through the app's door: passes; the "filer" gets a saved, shown bell line about a record that never existed.
  Ranger "filed by Hunter": line `to: prowler, by: bane, "LL"`, kind `del`. Ranger "filed by Saber", a Training titled
  "SEE ME AT ONCE - CO": on the master's bell with that title. The same record edited is refused (D's own case).
- Cause: `storedRowViolation`'s `raw == null` branch returns untouched on `c.op !== 'put'`; judged as a delete of the
  made-up image; the member's rules let him delete "his own" request; `toldBy` reads the made-up filer.
- Proof `f13-1-delete-door.test.ts`: :118 RED (expected `{ok:false, lines:[]}`, got ok and a line to prowler); :124 RED
  (to stiff, "SEE ME AT ONCE - CO"); control green — the edit refused; control green — Ranger deleting a REAL request
  Hunter filed is allowed and Hunter told (the fix must keep it).
- Fix: (1) inside `if (raw == null)`, before the early return, refuse where STORED_WHOLE, origin not restore, id not in
  REMOTE_ONLY, `c.before != null` and the change a delete (op delete, or put with after null): "a record never saved,
  taken away as if it were (<coll>/<id>)"; (2) keep D's exemptions; (3) narrower form if too wide: refuse only where the
  same command puts a bell line whose iid is that id; (4) the two red cases and the real-request control as tests. No
  honest delete of an unsaved record on a whole store found (`boot-probe.test.ts`: on a booted app every request and line
  in memory has a saved row, fresh and restarted). Fix not run.
- Checked, nothing: a made-up request "filed by Kestrel" (149) deleted by Ranger — no line crosses; one naming a second
  man deleted by a member — refused; an admin's made-up request edited or deleted — no more than filing a new one (a new
  request with a forged filer passes for an admin today — older, not checked whether filed).

## The builder's choices
(1) A supported — `abc-negatives.test.ts`, 9 green: Overseas Sqn run then changed to Delete (accounts saved / never
saved) — he, sign-in and 149 right go; a Delete taken back before its date — nothing goes; Overseas run then Undo post
out — back, right intact; two Deletes in one pass on the first write — both go; a Delete and an Overseas — only the
Delete's right goes; a master's Delete refused as set; Kestrel posting out her own man with View of 142 — runs; the
master deleting Osprey with Plan of 142 — allowed. (2) B supported by reading (a different man, archive without delete,
delete and re-add all fail); `personDeletedHere` passes where no home is known, as section 8 does — noted, not a finding.
(3) D's whole mark supported — `boot-probe.test.ts` 2 green through `bootApp` (fresh and restarted; member and master
work, Undo / Redo, war leave, a holiday, a posting and its take-back — all saved, no refusal). `remote` raised by nothing;
`restore` only by the timeline. Not findings: a second live tab's edit of a request another tab deleted now refused (the
two-tab question); a fresh boot does not clear bell lines from memory (one boot a page). (4) E supported —
`e-negatives.test.ts` 4 green: Redo / Undo three times — 13 Jul each time; an old step with no stamps — today (fails
closed); Plan off, Undo, Redo, a move, Undo — today; another admin's later touch — refused (D148).
Five questions: complete for A, B, C, E; D no (F13-1); no departure from D2218 / D2223 / D2225 / D2222 / D2203; nothing
undone or broken found. Not run: browser tests, the full suite, a walk.
