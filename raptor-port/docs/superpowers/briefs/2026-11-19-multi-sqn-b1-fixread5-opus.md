# Fix read 5 — the fresh, blind Opus read (19 Nov 26)

On its own exported copy of `claude/multi-sqn-b1-107` at `5d0e3f2f3` (brief `…-fixread5-brief.md`), blind to Astra, the
security reader and the walk. Condensed by the host (chat 111): every finding, cause, fix, proof and negative kept. Proof
tests left in chat 111's scratch copy `fr5-opus/raptor-port/src/leavewar/zz-fr5-own-line.test.ts` (control green, cases 2
and 3 red) and `…/src/state/zz-fr5-filer.test.ts` (move-day checks green, filer check red). NOT yet reproduced by a host.

## 1. Medium, introduced by 5b8357f92 — the Redo of a decision on a moved man's own leave is refused whole (D148)
15 Jul: Kestrel (149) places LL approved on Osprey's row for 15 Jul → Osprey gets "Your leave · LL added and approved"
(`lw`). Same day Osprey's move to 142 from 16 Jul is saved. 16 Jul: Kestrel's Undo goes through; Redo refused ("That
couldn't be completed just now"). Cause: the `lw` line is about Osprey himself, so `noticeLeftBell` is false and
`leaveOut` keeps it; the gate's 7e verified-replay pass is now delete-only, so the put is judged a write to another
squadron's man ("a bell line of another squadron's man") and the whole restore refused — though the action itself is
allowed today and tells him nothing (`tellWar` skips him, `atWarHome`). Fix (if finding 2 goes "silence"): export
`atWarHome` from `leavewar/sync.ts`; in `undo-wire.ts`'s `leaveOut` also leave out a put of a war line whose addressee is
not at home in the war's squadron today; case 2 green, the bells test's Undo → Redo → Undo and the no-move control kept.
If finding 2 goes "his own lines follow him": instead a narrow gate pass for a verified replay, by the line's maker, of a
line about its addressee.

## 2. Medium, a QUESTION FOR HIM — a read line about his own leave vanishes silently when his old squadron undoes it
As 1, but Osprey read the "approved" line first. After the move it stays on his bell (D2218: lines about himself stay);
Kestrel's Undo deletes it and `warNoticesReversed` writes no "taken back" line (it skips anyone not at home) — his leave
is no longer approved and nobody tells him (the harm D1693 / D1699 exist to stop). D2218's "whoever would be told of it
today" argues silence; its "lines about himself stay with him" argues the take-back is owed. **Reader's
recommendation:** a line about himself follows him — its take-back told, its Redo puts it back (the gate allowing the
"taken back" / "again" follow-up only for the addressee of a line the verified restore just removed or put back).

## 3. Low–medium, a QUESTION FOR HIM — lines about another man's input he filed keep reaching a moved admin
15 Jul Hunter (142's admin) files LL for Ranger on 25 Jul; moved to 149 from 16 Jul; 17 Jul Saber changes the remark →
the input pass tells the filer, so Hunter (now 149's) gets a 142 line about a 142 man; the gate's `toldBy` exception lets
it through and `noticeAboutHim` counts every input line as about him, so it never leaves. **Recommendation:** an input
line is about him only where he is named in the input (or the parts are `in` / `out` / `rbid`); the input pass stops
telling a filer who is now neither the man's admin nor in the input; `toldBy` narrowed to match; the master stays an
admin everywhere.

## Negatives
Claim 1 complete for the marks (`lw`, `lwMoved`, cancel and reason, red box, information-only, the late drop, who put an
input) — the placer stamp it judged harmless (the security read found otherwise: FR5-SEC-1, fixed `eeff03fc0`); own
squadron, master, Plan holder still pass; Undo of his own step allowed; a leave across both squadrons held to member
rules. Every bell reader through `noticeLive`; nothing that must not hide goes through it. The read rule matches D2218 on
the move day (visible on the save day, hidden from the move day), read and unread alike, a man who moves back or moves
twice; a line written on the move day by the new squadron stays. `leaveOut` acts only on notice puts that left the bell;
client-side only. A2's removal closes fix read 4's Astra §1; 142's Undo post out passes for 142's own. Claim 5's last
commit: the note retaken after the jump writes; a trackpad's real sideways move still ends the landing; the one-dot edge
test narrow.

## Watch items (not findings)
(1) D2215: once Transfer to Sqn is built, `postingLinesOf`'s at-home filter would leave 149's admins untold of a 142→149
transfer taken back — revisit in that build. (2) `noticeAboutHim` returns false for unknown kinds — future lines about
the man himself (D2220's "Plan given") must be added. (3) Back-dated worked-out lines (bidding closed, off the manpower)
hidden from a man who just moved IN — harmless. (4) Walk Sep → Mar → Dec → Sep at 125% and 80% zoom: near December the
browser's clamp of the sideways scroll may count as the person's scroll and end the landing.
