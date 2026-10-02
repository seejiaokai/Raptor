# D488 — remove Discard marks

Branch: `codex/discard-marks-remove`, based on `claude/planning-filing-3-oct`.
Status: built; runtime and gates passed. Fresh final Astra inspection PASS; Claude's further read owed. NOT merged.

## Tier and applicable behaviour

| Question | Answer and reason |
|---|---|
| Money / earned leave | NO — no earning or entitlement calculation changes. |
| Published record | YES — removing a command beside publication requires proof that first publish and AL issuance still work. |
| Saved data | YES — the removed command wrote the saved pending book. The stored shape is unchanged. |
| Shared drawer | NO — the only removed renderer is ALPanel; the existing week and board drawers are unchanged. |
| New gesture or mode | NO — one door removed; no replacement gesture or mode. |
| New surface | NO — no panel or row added. |
| Roles | YES — obsolete sched.discard permission registration removed with its command. Existing grants unchanged; §11 table unchanged. |
| Warning list | NO — warnings and validation unchanged. |

**FULL.** D496 supplies the temporary independent Codex reads: Astra scenarios and a fresh final Astra inspector
for Sol's code. The further Claude reads remain owed after the reset under D494, before main.
This change needs no separate product plan: D488 already specifies it. No cross-provider approval is claimed.

Behaviour register: D488 — no clearing door or command, no new marks-cleared history line, draft marks kept until
first publication; published pending work still issued normally. D487 — remaining buttons keep their sizes.
D148 — Undo/Redo still reverses the signed-in person's edits. D494/D496 — no self-approval, PR or merge; Claude reads later.

## Roll-call and doors

| Place/state | Visible result | Working door | Same pixels / downstream result |
|---|---|---|---|
| Desktop Amendments, draft-only | Has draft guidance; must not have Discard marks (D488). | First Publish day remains on each signed day. | Removes one button; does not resize remaining buttons. |
| Desktop Amendments, published pending | Has per-day Publish AL; must not have Discard marks. | Four sign-offs then Publish AL, or existing Load onto working copy. | Issued copy and pending count unchanged. |
| Phone Amendments | Must not show: existing panel hidden under 820px. | The day's board still signs and publishes; no clearing door is required (D488). | Phone layout unchanged. |
| Edit week / scheduler board | Has ordinary edit and Undo/Redo; must not have a substitute clearing door. | Type note → Undo → Redo; sign → publish → edit → sign → AL. | Marking/history still travel through the same command layer. |
| Change history | Has real edit lines; must not gain a Draft marks cleared line. | Existing changes clock / day chip. | Earlier history is retained; no migration or history deletion. |
| Saved day / reload | Has draft marks before publication; published note and AL survive reload. | Reload after a real UI write. | Same saved row schema and table list; no new table or field. |
| View-only schedule | Has the Original note before AL and the amended note only after AL. | Existing View-only Sched navigation. | Issued copy stays frozen until publication, observed at all three widths. |
| Member / view-only | Must not gain edit or clearing controls. | Existing read-only day/history routes. | Grants unchanged; perms and scan tests included. |

## Evidence and checks

Red/break proof: three D488 panel tests failed on the original button before removal (published-only, mixed and draft-only).
This is the removed surface's wire-break check: restoring its old button breaks those named tests. Existing publication,
storage and history tests were replaced only where they pinned the intentionally removed command; no check was relaxed.

Focused checks: nine files, 189 passed and one new test initially failed because it addressed a stable-row mark by an old
position key. Corrected that test to drive writeSlot and read pendDays, the production route / day-level question; its
17-test file then passed. The remaining eight focused files passed. Production build PASS.

Runtime: original runs passed their assertions but picture review found the shared historical Close helper left the
board covering the panel; the original reload step also required signing in again, and phone sign-out uses its drawer.
These were harness defects, not app defects. Original and rewalk results/pictures are retained, not counted as final
panel proof. The strengthened run uses today's Done control, checks actual panel visibility, ALL marks by keyDay,
mixed-day isolation, publication Undo/Redo, all four sign-offs, panel publishing and visible issued-copy reads.
Pictures: `../img/handpass/2026-10-02-discard-marks-remove/`. Final strengthened run: desktop 18/18, phone 17/17, short 18/18, zero failures and zero browser errors. Visible Changes-window addition: three checks per width (absence, real edit retained, no browser errors), all passed. There are 44 final runtime pictures: 38 under `final/`, six under `history/`; all opened by the host (contact sheets plus full-resolution panel/history targets). Original/rewalk failure pictures remain separate and are not counted as final proof.
Gates, watched under the PC lock (CI browser mode: three workers, one configured retry; port 4227):

| Check | Observed result |
|---|---|
| Unit | 7560 passed, 474 files |
| Production build | PASS |
| Original comparison (tfin) | 728 passed, 0 failed |
| Browser | 517 passed + 1 passed on retry, 49 skipped, 0 final failures |
| Tracker smoke | 445 passed, 0 failed |
| Rule coverage | OK; existing AM39d baseline note remains, not changed for acceptance |
| Documents | OK; copied inventory lines below |
| Performance | 4 passed, 0 failed; week DOM 5134 <= 5450, board DOM 1024 <= 1150 |

The browser retry is the already-filed LW-WINDOW-PRUNE-FLAKE-2: December remained drawn during the five-second idle-prune poll at leavewar.spec.ts:4581. It passed the configured retry; no Leave War implementation/test/CSS changed here. This is disclosed, not called a clean first pass or a newly introduced defect. Raw gate logs are in C:/Users/User/AppData/Local/Temp/codex-discard-marks-gates/.

| Order | Observation |
|---|---|
| Draft edit -> Undo -> Redo -> reload | Note, marks and ordinary history survive; no clearing door |
| First publish -> Undo -> Redo | Draft note and marks restore, issuance restores, adjacent days stay pending |
| Draft A/B and published C changed -> publish A -> reload | All A marks clear; B and C retain theirs |
| Leave week -> return (desktop/short) | Mixed-day marks remain; phone uses reload instead |
| Published C edit -> four new signatures -> AL1 | Edit clears all four; unsigned button disabled; all four required |
| Visible panel Publish AL (desktop/short), board Publish AL (phone) | Surviving real door issues C only, B remains draft |
| View Original before AL -> issued amendment after AL -> reload | Visible issued content changes only on issue, then survives reload |
| Draft edit -> visible All changes; admin -> member | Ordinary history remains without new marks-cleared line; member gets no edit/AL panel |

Fixture: fresh isolated browser worlds from the existing seeded week; Monday is published/amended, Tuesday first-published, Wednesday remains edited/draft. No new row kind, storage shape or demo seed change is introduced. This targeted removal walk does not re-run the unrelated earnings/input-filing/Leave War business scenarios or the second Sonnet trial (which remains owed to Claude). It checks the changed command's draft/publication/history consumers and role/layout surfaces; broad regression coverage comes from the full gates. The phone week switch is not operated (its desktop chips are hidden); its saved-data route is reload/sign-in. Owner look and Claude's Monday further reads remain pending.

Before-picture reference (historical, not a fresh base run): ../img/handpass/2026-09-24-amendment/rollcall/desktop/r10-alpanel.png, opened, shows the former button. Current matching panel pictures are final/desktop/desktop-draft-panel.png and desktop-amendment-panel.png.

PHONE-DISCARD-MARKS is moot under D488: no desktop clearing door remains to mirror onto the phone. Its historical backlog item was moved unchanged by the archive script in a separate docs-only filing commit.

Not changed: old handpass scripts/pictures are historical evidence and retain their original Discard marks steps.
No IT guide reference to this button was found in its text; its pictures were not re-shot (D403).
No storage schema/table change: removal stops one writer but does not change how pending marks or history are stored.

Independent scenario read: Astra (`gpt-6-astra`, requested and dispatched through collaboration), 2 Oct 26, read-only.
Missing checks it named: mixed-day isolation through reload/week switch, operate the panel's surviving AL door,
issued-copy visibility and four-signature reset, Undo/Redo across publication. All are added to the strengthened walker.
Its early note about stable identities was corrected by its own key tracing: dn: note keys are intentionally positional;
keyDay is used to strengthen all-day coverage, not presented as an app fix. No app defect was found in that read.

D496 working-guide read: Astra, one initial round plus focused verification; fresh-inspector wording corrected and D70's
one-round-per-reviewer cap retained in the short line and workflow. No code approval from that planning agent is claimed. Its complete returned archival recap (explicitly not a verbatim original transcript) is retained in the review record.

**OWED: Claude's read after the reset** — `codex/discard-marks-remove`, the further independent code/scenario reads and
working-guide changes before main. Fresh final Astra code read: PASS, after the final runtime evidence and gates. Complete response/disposition: `2026-10-02-discard-marks-remove-review.md`. The host checked all 14 source/harness SHA-256 values unchanged after the read. No app defect or blocking evidence gap found; saved gate totals match the raw logs, including the disclosed retry.
Owner look: pending; this sheet is evidence for later review, never permission to merge.
Walk: 44 final pictures · 5 surfaces · 8 order groups · MISSING: harness/coverage gaps fixed; phone week-switch limitation stated; Claude reads and owner look owed.
Rulings: D496 — temporary Codex planning/building/review roles; implementing D488 in D495 order.

Docs: OUTSTANDING 99 items (+4 −1, −1 all in ARCHIVE) · DECISIONS D1–D496 (new: D491, D492, D493, D494, D495, D496) · homes OK
docsize: OK
