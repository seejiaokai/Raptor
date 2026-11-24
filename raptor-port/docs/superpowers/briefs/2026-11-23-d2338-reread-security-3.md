# SEC-READ-147-3 — the security reader's last narrow read (of f292ab846), saved by the host

SEC2-1 (made-up struck days) SHUT: the struck days must equal what his live line named when the command began (a snapshot
taken only for a person's own command, tied to it; commands never nest; a reload keeps none, so no struck line is owed).
SEC2-2 (a) SHUT for one command: the read check reads his record as saved, or as it stood before the command where the
command changes it; a bare read-record write outside a command is refused (it breaks no legitimate path: the only writer is
his own "notices.seen"). STILL OPEN, low, through the filed (u)(3): across TWO commands an admin of his own squadron can
first write the man's read record in a command of another type, then make a real take-back, leaving one struck line on a
man who never read the original (test `sec147-read3.test.ts` in `D:\raptor-work\c147-read-s2`). Its fix is (u)(3)'s:
`adminOwnerViolation` refuses a change to a `noticeseen:` / `seen:` / `apprseen:` / `reqseen:` row unless the command is
the record's own and the actor is its person. The crowd fix in `availableFor` has no security effect. Six files pass
there: 52 tests plus 1 expected fail.
