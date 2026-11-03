/* THE FLOATING WINDOWS' OWN STATE — where each was left, and the order they were brought forward in (moved whole out of
   ui/FloatWindow.tsx on 3 Nov 26, the Inputs batch's React Doctor ride [DOCTOR-INPUTS-RIDE]: a file that draws a component
   exports only components, so the doors that open a window — the input's own window, the Inputs and SANS settings, the
   SANS day — and the tests that forget every window's place import these from here). Module state, never component
   state, as it always was. */
import { notify } from '../state/store'
import { frontWin, raiseWin, type FloatBox } from './floatwin'

/* where he left each window, by its id — module state, never component state: the page behind re-renders on every
   keystroke, and component state would throw a window back to its corner mid-drag (floatwin.ts) */
const BOXES = new Map<string, FloatBox | null>()
export const winBox = (id: string): FloatBox | null => BOXES.get(id) ?? null
export function setWinBox(id: string, b: FloatBox | null): void { BOXES.set(id, b) }
/** test-only: forget every window's place and which was in front */
export function _resetFloatWins(): void { BOXES.clear(); UP.length = 0; raiseWin('') }

/* THE WINDOWS THAT ARE UP, in the order they were last brought forward - so that when the front one closes, the one
   left is in front. "In front" (ui/floatwin.ts) is one remembered name; a closing window used to leave it behind, so
   NO window on screen was in front: none wore the mark, and Escape did nothing until one was pressed (the calendar
   job's bug check, 8 Oct 26). The input editor asks the same question before it takes an Escape (ui/inputedit.tsx). */
const UP: string[] = []
export function forward(id: string): boolean {
  const i = UP.indexOf(id)
  if (i >= 0) UP.splice(i, 1)
  UP.push(id)
  return raiseWin(id)
}
/** A DOOR THAT OPENS A WINDOW BRINGS IT FORWARD WHEN IT IS ALREADY UP. Opening sets a flag; a window that is up does
 *  not mount again, so nothing raised it: "Calendar..." pressed in a settings window left the Calendar window BEHIND
 *  the settings window that asked for it (the calendar job's bug check, 8 Oct 26 - walker G). A window that is not up
 *  is never named in front. */
export function bringForward(id: string): void {
  if (UP.includes(id) && forward(id)) notify()
}
export function gone(id: string): boolean {
  const i = UP.indexOf(id)
  if (i >= 0) UP.splice(i, 1)
  return frontWin() === id && raiseWin(UP[UP.length - 1] || '')
}

/* A WINDOW OPENED BESIDE ANOTHER (F9 of the 3 Nov 26 re-check — the Inputs batch): "Calendar…" in a SANS day opened the
   Calendar window at its own corner, which on a desktop lies right over the day — the day's ✕ under it. A door that
   knows which window asked for it says so here; a window with no place of his yet then opens to the left of that one,
   where it fits on the screen (FloatWindow.tsx), and otherwise at its own corner as before. A phone's windows are the
   stylesheet's panels, and are not moved. Asked once: the window takes it as it opens. */
const BESIDE = new Map<string, string>()
export function openBeside(id: string, besideId: string): void { if (!BOXES.get(id)) BESIDE.set(id, besideId) }
export function takeBeside(id: string): string | null { const v = BESIDE.get(id) ?? null; BESIDE.delete(id); return v }
