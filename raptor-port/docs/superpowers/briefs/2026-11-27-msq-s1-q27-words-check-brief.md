# Question 27, step 1: check the draft words' examples against the app (chat 204, S1)

**Who:** one fresh Opus helper. **Read only.** Change no file under `raptor-port/src` and no test. Write one file:
`raptor-port/docs/superpowers/briefs/2026-11-27-msq-s1-q27-words-check-report.md`. Do not commit.
Working copy: `C:/Users/User/projects/Raptor/.claude/worktrees/lw-balances-hover-275293`, branch `claude/msq-s1-guard-6ae5e1`.

## What this is for

The guard rail refuses a press that would leave the squadron in view while work is open. It shows one short note:
`Blocked: <lead>, then <ending>` (`src/ui/guard.ts`: `GUARD_LEADS`, `GUARD_ENDINGS`, `GUARD_UNDO_LEADS`,
`guardUndoLead`, `guardWords`). Some notes are silent today, and some use a stand-in lead, because their words were
never shown to the owner. Question 27 will show him these words. A fresh Fable reviews **the words alone** next
(his D2819, D2441), so first an Opus must check that each sentence is **true in the app**: the situation can really
happen, the control it names is on screen, and doing what it says really lets the press go through.

## Read first

- `raptor-port/docs/superpowers/briefs/2026-11-27-msq-s1-k8-report.md` §"Every one listed …" (items 1–6) and
  §"Where the brief and the code differed" item 1.
- `raptor-port/docs/superpowers/briefs/2026-11-27-msq-s1-k6-report.md` difference 1 (the silent card and page doors).
- `src/ui/guard.ts` lines about 360–580; `src/state/undo-wire.ts squadronRefusal`; `src/state/store.ts setPage` /
  `stepPage`; `src/ui/OilDayList.tsx` (or wherever `openInputOnPage(…, {door: 'card'…})` is called — grep).
- The plan's §4.6: grep `docs/superpowers/plans/` for `2026-11-2*-msq*` and the heading `4.6`.

## The draft words to check (each: the whole note as it would appear)

1. **The OIL list's card** (door `card`): "Blocked: <the row's lead>, then try again." — e.g. a 142 change not saved,
   then he presses a day card on the OIL list that would open an input on another squadron's page. Say exactly what he
   pressed, what "again" would press, and whether pressing it again after the lead's step really opens it.
2. **A press naming no door** (door `page`): the same ending "try again." List every press that reaches this door
   today (grep `setPage(` callers with no door / `pressDoor(undefined`), and say whether "try again" is true for each.
3. **Redo** (door `redo`): "Blocked: <lead>, then press Redo again." K8 says no press reaches a Redo refusal today.
   Confirm or refute that by reading the code. If none is reachable, say so plainly: the card may not need it.
4. **The Undo leads with no Cancel half he has seen.** Today each takes a stand-in (K8 item 4). For each, give the
   draft, check that a Cancel (or Clear) button exists in that state with that name on screen, and that pressing it adds
   no Undo step (so "then press Undo again" stays true):
   - "cancel the open row on Users", "cancel the new person on Users", "cancel giving access on Users",
     "cancel the open row on Squadrons", "cancel the new squadron on Squadrons" (the section-named forms, D2814 —
     shown only while that section is not the one showing);
   - "cancel the changed holiday"; "cancel “Every Monday”"; "cancel the sheet’s holidays";
     "cancel Inputs calendar settings" and "close the Calendar, cancel Inputs calendar settings";
     "cancel SANS calendar settings" and "close the Calendar, cancel SANS calendar settings";
   - a window on a page out of sight: "close the open window on the Leave War" / "…on the Tracker" with the Undo
     ending (does Undo ever leave that page's window behind? say when);
   - the new qualification: "clear the new qualification" (is there a Clear control? what is it called on screen?).
5. **"cancel the new holiday, or create its leave period" → "cancel the new holiday"** with the Undo ending: confirm.

## For each item, write

- **When it happens in real life** (his D2439): who is doing what, at what point in their work, how often. Use the
  app's own names (Saber, a scheduler and admin on 142; Hunter; 149, 150; the Calendar; Admin → Users; the OIL list).
- **The whole note**, exactly as it would read.
- **True?** yes / no / partly, with the reason from the code (file and function are fine here — this report is for
  the orchestrator, not the owner).
- **Reachable by a real press?** yes (the presses, in order) / no (why).
- **A problem or a better wording**, if you see one. Don't rewrite the words for style — Fable does that next.
- Last, a short **"for Fable"** block: each item's situation in two plain lines and its draft note, with no code names,
  ready to hand over as it is.

Read the source with the Read tool, grep and sed as you like. Run no full suite. If a question can only be settled by
pressing in a real browser, say so and say what to press; don't start a browser.
