/* IS THIS WINDOW DRAWN? — one function per window whose state is a module's own, which its component itself calls for
   its early return or its `hidden`, and which the guard's table reads (the guard rail's plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §3.1 "The rule, for every row", §3.2 (b), (c), (e)).

   Why one function and not the flag: in six places the red team found, the flag says "open" while nothing of the window
   is on screen — a template dialog is drawn only while he may edit the schedule, so a Plan lowered to View under it hides
   it and leaves the flag set; Changes is drawn only for a member. A guard that read the flag would refuse a press with
   nothing in sight to close. Read from the very predicate the component draws from, the two can never differ.

   A plain module, never the component's own file: a file that draws a component exports only components (React
   Doctor's only-export-components, D1534 — ui/winorder.ts and ui/topstate.ts were split out for the same rule). Each
   predicate is built from module state alone. Moved here whole in K1a, not edited: what each window draws is unchanged. */
import { SESSION, canEditSched } from '../state/auth'
import { CURPAGE, AVAILWIN, CHGWIN, OILWAIT } from '../state/view'
import { isMember } from '../state/perms'
import { INPEDIT, INSIGHTS, TPLEDIT, WAVEEDIT, DAYTPLEDIT, DRAFTSEDIT, MEDMOVE } from './pops'
import { CXT, SORTALL } from './board'

/* (b) the two older movable windows. Each keeps a mounted, hidden placeholder, so its flag is not its drawing. */
/** ALL AVAIL ("Who's available") — ui/AvailWindow.tsx */
export const availDrawn = (): boolean => !!AVAILWIN
/** the Changes window, opened out or folded to its bar on a phone — drawn for a signed-in member or admin only
    (ui/ChangesWindow.tsx) */
export const chgDrawn = (): boolean => !!CHGWIN && isMember()

/* (c) the schedule's veiled dialogs */
/** the Input dialog opened from the week or the board — the Input window's second shape, off the Inputs page
    (ui/InputWindow.tsx; on the Inputs page it is the movable window `inputedit`, read from the order of windows up) */
export const inputDlgDrawn = (): boolean => !!INPEDIT && CURPAGE !== 'inputs'
/** Insights — ui/Modals.tsx InsightsModal */
export const insightsDrawn = (): boolean => INSIGHTS
/* the four template / Plans dialogs hide themselves for anyone who may not edit the schedule in view (the 31 Aug 26
   authority sweep: the flag survives the switch to the member view) — `SESSION && …` so a sessionless test or boot is
   not taken for a member */
/** Duty templates — ui/DutyTplModal.tsx */
export const dutyTplDrawn = (): boolean => TPLEDIT && !(SESSION && !canEditSched())
/** Flying waves — ui/WaveTplModal.tsx */
export const waveTplDrawn = (): boolean => WAVEEDIT && !(SESSION && !canEditSched())
/** Day templates — ui/DayTplModal.tsx */
export const dayTplDrawn = (): boolean => !!DAYTPLEDIT && !(SESSION && !canEditSched())
/** Plans (the drafts manager) — and only on Edit Schedule, the one page that opens it (ui/DraftsModal.tsx) */
export const draftsDrawn = (): boolean => !!DRAFTSEDIT && !(SESSION && !canEditSched()) && CURPAGE === 'editsched'
/* the board's two dialogs: always mounted, shown by dropping `hidden` — read from their own state, never from the page
   (ui/pops.ts windowOverSchedule asks the page, which a hidden board could still match) */
/** the board's cancel-reason box — ui/SchedBoard.tsx CxDialog */
export const cxDrawn = (): boolean => CXT != null
/** Sort all's question — ui/SchedBoard.tsx SortAllDialog */
export const sortAllDrawn = (): boolean => SORTALL != null

/* (e) the question sheets that are windows of their own */
/** the medical moved by a drag or a reassign, waiting on its question — ui/MedMoveConfirm.tsx */
export const medMoveDrawn = (): boolean => !!MEDMOVE
/** the OIL question put before a change — ui/OilWaitSheet.tsx OilWait */
export const oilWaitDrawn = (): boolean => !!OILWAIT
