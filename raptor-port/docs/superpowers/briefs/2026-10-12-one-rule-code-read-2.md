# The brief — Fable's SECOND read: the fixes of the one-rule job's check (`[ALL-AVAIL-AS-MEMBER]`) — 12 Oct 26

**Why:** your first read (`2026-10-12-reads/one-rule-code-fable.md`) ran beside the walk, so you have not read the
finished code. This read closes that: the fixes made since. Opus 5.5 wrote them; you did not. **Read-only: change no
file but the one report named at the end; run no build, no test, no browser** (the PC's full check set is running as
you read — a test or a build started now would break it).

## What to read
1. **The check's sheet:** `raptor-port/docs/handpass/2026-10-12-one-rule.md` §8 (what the walk found and each
   disposition), §9 (the fixes), §10 (what was done with your four findings), §10a (the break tests), §11 (the
   question for the owner and the new readings R38–R42). You are no longer blind to the walk: the walkers' own
   reports are `raptor-port/docs/handpass/parts/or-A.md` … `or-L.md` — open the rows the sheet names where you doubt
   a disposition.
2. **The fix diff:** `git diff 41752a24 HEAD -- raptor-port/src` (leave the thirteen new `*.wire.test.*` files for
   last — they are the break tests' new cases — and every file the diff touches read whole where the change sits).
   The commits: `git log --oneline 41752a24..HEAD`.

## What is asked
1. **Each of your four findings — is it really fixed, and fixed right?** Finding 3 was fixed in the WORDS only
   (`ui/pendlist.ts`: the piece is found as the live record of that one person, same kind, covering the day, carrying
   the shared input's own `by` and `at`); your design of carrying the piece through the count was not taken. Attack
   that heuristic: when does it name a record that is not a piece, or miss one that is?
2. **The fixes the walk forced — attack each as you would new code:**
   - `engine/editlog.ts logAction` now STORES the mark that a history line is about one person (`one`). It was handed
     in and dropped before, so **every reader of `.one` is live for the first time**: find every one (`grep -rn
     "\.one\b\|one: 1\|\bone\b" raptor-port/src --include=*.ts --include=*.tsx`, tests apart) and say what each now
     does differently in the running app — `ui/changesmodel.ts ownWords`, `ui/histbubble.ts storyOf` and
     `refreshHistDots` (with the new `oneMansRow`), `ui/ChangesWindow.tsx jumpOf`, and any other. Is anything now
     hidden, doubled or mis-filed that was shown before? Is the saved line's new field read safely where a line saved
     BEFORE today has none (new data only matters — D56 — but a throw would not be data-only)?
   - `ui/ChangesWindow.tsx jumpOf`: the man is read off the line's first ROW; his own puck (`g:di.ri.xN`) and his own
     Unavailable row come first. A line made of SEVERAL rows; a man who is the row's name box; a man no longer in it.
   - `ui/reqdoor.ts rowPut`: a man dropped on the one person's puck of a PERSONAL input is refused. Every other door
     that could replace the only person of a Personal input — the armed tap (`state/view.ts placeArmed`), a typed or
     scripted write (`state/store.ts writeSlot` / `writeFill`), the Unavailable row's swap (`reassignInput`, where a
     Personal input is filed under Unavailable), the input's own window (a hand-over by an admin) — which of them
     still hands a Personal input to another person, and is that right by D755 (4) and D757?
   - `ui/inputedit.tsx setLeaveRemarks(row, remarks, person)` and the war's sheet: the member's own save through the
     commit gate (`perms.ts inputBreach`, `ownPart`, the notices made in the same command — who is told, and is the
     man himself told of his own act?); a leave the WAR approved (one person, `lw` set) is untouched by the change?
   - `engine/overlay.ts stripPersonFromDay`: the name box of a `src` row is blanked where the row is `kept` or its
     input no longer holds him. Can that blank a name it must keep — a published day's own copy, a day BEFORE his
     cutoff, a row of an input that holds him still?
   - `ui/drag.ts`: the refused swap's sentence. `ui/reqdoor.ts leave`: the last-person sentence.
   - **D773** — the Inputs List's export removed (`ui/InputsPage.tsx`, `ui/export.ts`): anything left that still
     reaches for it (a keyboard shortcut, a menu, a document the app shows, a test helper)?
3. **The dispositions the host called "the host's EXPECTED wrong" or "as told"** (§8) — read each against the ruling
   it cites and say plainly where you disagree: the OIL question nobody is asked (A8, H4, H7 — D762 reading 3); a
   member in the member view who filed the input (H12); the filer who made his own input shared (H6); an archived
   man staying in a shared leave (J6); the others told when a man's own medical cuts him out (L5 — against your own
   scenario 6).
4. **The three items FILED, not fixed** (`OUTSTANDING.md` `[HIST-DOT-INPUT-ROW]`, `[DISCARD-FILING-NOOP]`,
   `[SCHED-INPUT-WINDOW-PHONE]`): is any of them a fault that should stop the merge rather than wait? For
   `[DISCARD-FILING-NOOP]`, read `engine/publish.ts dayDiscardCount` and `engine/drafts.ts` at the base
   (`MSYS_NO_PATHCONV=1 git show 7c1fcdc0:raptor-port/src/engine/publish.ts`) and at HEAD and say whether the live
   app does the same.
5. **The re-walk's list.** The fixed build is walked again only where the fixes touched. Name the scenarios — as a
   person would do each, with what must be seen — that the re-walk must drive for the nine fixes, including the one
   route per fix most likely to have been broken BY the fix.

## Not findings
Harm that lives only in stored demo data (D56). The behaviour register's ids not yet wired into the rule check. The
thirteen `*.wire.test` files' style.

## How to report
As before: a claim is a finding only with a concrete failure, its cause, whether it is silent, whether it is new
against `41752a24` (the walked build) or against the base, and step-by-step fix instructions precise enough to build
from; explicit negatives for what you traced and found sound. End with a verdict — **CLEAN / CLEAN WITH THESE EXACT
CHANGES / NOT CLEAN** — on the branch as it stands, and what, if anything, must be fixed before the owner's "merge
live". **Save the whole report yourself**, with the Write tool, to
`C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/briefs/2026-10-12-reads/one-rule-code-fable-2.md` (that
one file only), and hand back the same text.
