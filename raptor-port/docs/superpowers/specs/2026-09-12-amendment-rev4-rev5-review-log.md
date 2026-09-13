# Amendment Rev 4 — cross-provider review log

Host: Claude (Opus 4.8, coordinator). Reviewer: Codex / GPT-6 Astra (high).
Plan (frozen): amendment-rev4-review.md  sha256 e0cc2983885fd29499f169596b77664a58e6d8e3dd1868fd23fa22ecb122e14b
Repo HEAD at review: d9fbb81. Scope: the 3 Rev 4 deltas only (Rev 3 already converged).

## Round 1 — verdict REVISE (runner wrapper rejected on a trailing empty-string in
## `limitations`; the review itself is complete and valid — NOT an approval regardless).

### REV4-01 (high) EOD current/past-day guard insufficient; future work inside "today" can publish unsigned; no clock authority.
VERIFIED: weeknav.ts TODAY is a fixed literal '13/07/2026' ("no clock by design"); time.ts rolls overnight ends into next day. CONFIRMED.
DISPOSITION: ACCEPT (design fix, Rev 5). EOD skips ONLY the 4 signatures — it keeps every other publish check (digest, base/revision, backup review, durable commit). A genuine future-plan change still needs a signed AL. "Which day is done" is anchored on the deliberate "Close day — record actuals" action, not wall-clock. Aligned with owner's stated guard intent.

### REV4-02 (high) "latest published record = sole truth" collides with acknowledged (non-publish-gated) INPUTS OIL claims (row.oil).
VERIFIED: oil.ts skips ground rows carrying `src` (accepted input, handled by ask-flow); CLAUDE.md confirms OIL = published schedule + acknowledged row.oil claims (not publish-gated). CONFIRMED.
DISPOSITION: ACCEPT (design fix, Rev 5). Brief must define how acknowledged weekend-work claims relate to the sole-truth record (count accepted-input work once; freeze dated evidence into the issued record; EOD correction authoritative; drop live-INPUTS dependence only after preserving evidence; keep insufficient-evidence protection).

### REV4-03 (medium) Reader rule "EOD if present else latest AL/Original" breaks on Original -> EOD -> signed-AL correction (OIL reads stale).
VERIFIED plausible against dayCurVerIn (publish.ts) + sync.ts OIL reads. CONFIRMED by design trace.
DISPOSITION: ACCEPT (design fix, Rev 5). ONE "latest committed version by per-day sequence, regardless of kind" selector for OIL + current-issued rendering + history. Decide whether a normal AL may follow an EOD.

### REV4-04 (medium) Rev 4 §6 contradicts the retained [OIL] milestone (lock earned OIL on an already-worked day).
STATUS: OWNER DECISION. Rev 4 (12 Sep) "latest record wins, no cutoff" vs [OIL] (11 Sep) "lock earned OIL on a worked day, except an explicit 'didn't work' correction." They agree for future days, clash for a past worked day.
RECOMMENDED RECONCILIATION: worked day governed by its EOD/actuals; OIL follows it; only a correction (the 11 Sep "didn't work" exception) moves it; future days follow the latest plan. Makes both decisions true. AWAITING OWNER.

### REV4-05 (medium) EOD can't record a real breach because AM-06 hard-blocks validation at every publish entry point.
VERIFIED: validate.ts:398 emits CREW_REST as 'hard'. CONFIRMED.
DISPOSITION: ACCEPT (design fix, Rev 5). Split factual-record validation from prospective-plan approval: EOD keeps structural/date/provenance/concurrency blocks, but persists operational violations (e.g. crew rest) with a recorded acknowledgement instead of blocking.

### Plan names (§3 of charge): CLEAN. Astra found no injection/rename-data-movement defect — labels stay outside Day content, HTML paths escape, React renders text, toast uses textContent. No action.

## Next: owner settles REV4-04 -> revise brief to Rev 5 (fold 01/02/03/05 + the OIL decision) -> re-freeze -> one more Astra pass to confirm -> build.

## Round 2 — Rev 5 confirming pass — verdict REVISE (status: completed; sha f78b9e2...; 2 capacity-failed attempts first, then clean at 305s).
ALL five findings are in the Rev 4 EOD/OIL additions; the Rev 3 core is untouched/clean.
REV4-05 resolution CONFIRMED coherent by Astra (factual-vs-prospective split OK). REV4-03 selector coherent but exposes REV5-03.

- REV5-01 (high): the "CLOSED" marker is scheduler-asserted with NO eligibility rule, so a future day can be closed+EOD'd to publish a plan change unsigned. No clock (weeknav TODAY fixed) => can't auto-distinguish future from past. VERIFIED. ROOT ISSUE.
- REV5-02 (high): a late OIL acknowledgement (reviseOil -> row.oil via writeInputsBatch, NO publication gate; includes unaccepted claims, not only ground src) has no defined transition into an immutable issue / closed day. VERIFIED (InputsPage.tsx:625). DESIGN-PINNABLE (mine).
- REV5-03 (medium): §3b's "signed-AL correction after EOD" contradicts §6/§12's "closed day changes only via EOD". Pick ONE. DESIGN-PINNABLE (mine): corrections are EOD-kind, no-sign, actuals semantics; drop the signed-AL-after-EOD path; fix §12.9 fixture.
- REV5-04 (medium): "worked" != "marked CLOSED". A worked-as-planned day gets no EOD (no change), stays unclosed, and a later ordinary AL can strip its OIL (sync.ts:811/897). Legacy worked days have no close evidence. [OIL] protects worked days, not just closed. VERIFIED. OWNER-RELEVANT (narrows the lock) + converges with REV5-01.
- REV5-05 (medium): closing a day doesn't freeze HOLIDAY eligibility; setDayEvent removing a PH -> runOilPass live isNonWorkingISO omits work -> clearRaptorCellImpl deletes the credit (NO closed-day guard). VERIFIED (store.ts:1901, 2833). DESIGN-PINNABLE (mine): freeze the non-working basis in the committed record.

ROOT: EOD (an unsigned publish path) in a clock-free app => no reliable "this day is done" boundary, which REV5-01 (future-day abuse) and REV5-04 (unclosed worked-day protection) both rest on.
PLAN: surface to owner a fork — (A) build the twice-reviewed CORE now, design EOD as a focused follow-up; or (B) settle the "how the app knows a day is done" workflow decision now + pin 02/03/05 + round 3. Awaiting owner.
