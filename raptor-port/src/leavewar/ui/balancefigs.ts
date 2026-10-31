/* THE BALANCES PAGE'S ONE SAVE OF A TYPED FIGURE, and the figure's words — moved out of BalancesPage.tsx (whose head
   comment has the page and its rulings) so that file exports only its components (React's quick reload keeps a
   component's state only in a file of components). The person window (PersonWindow.tsx) saves through the same door. */
import type { BalKind } from '../engine/leaveyear'
import { balanceProblem, leaveFiguresOf, setTypedBalance } from '../state/store'

/** a figure as the page writes it — the app's one helper (figwords.ts) */
export { figWords } from './figwords'

/** A TYPED FIGURE SAVED — the page's boxes and the person window's (PersonWindow.tsx), one door: the refusal's words, or
 *  null when it saved. A save of either LVE box WRITES THE WHOLE ROW AFRESH (the spec §1.1, narrow read 2): the App bal box
 *  as it then shows and the carried-forward box as it then shows, clamped to 0 … the figure; "from" is the running figure
 *  shown before (the history line's "18 → 20"). */
export function saveTypedFigure(pid: string, kind: BalKind, n: number, part?: 'cf'): string | null {
  const k = leaveFiguresOf(pid).kinds[kind]
  if (kind === 'LVE') {
    const amount = part === 'cf' ? k.app : n
    /* the carried-forward box typed past its bounds is CLAMPED to 0 … the figure (the spec §1.1), never refused — walker D's
       FAIL 7, 29 Oct 26: "25" beside an App bal of 20 was refused "Carried forward is from 0 to 20"; it saves 20, and the
       box shows it. A figure that is no number, or no half, still meets the store's refusal (a NaN stays a NaN here). A
       clamp that lands on the figure already shown saves nothing, as a figure typed equal to it does (FigBox) */
    /* only a half is clamped (the fresh read of the fixes, finding 4): clamped first, "25.3" became 20 and saved, nothing said */
    const half = Number.isFinite(n) && Number.isInteger(n * 2)
    const cf = part === 'cf' ? (half ? Math.max(0, Math.min(n, Math.max(amount, 0))) : n) : Math.max(0, Math.min(k.cf, Math.max(n, 0)))
    if (part === 'cf' && cf === k.cf) return null
    const why = balanceProblem(pid, 'LVE', amount, cf)
    if (why) return why
    return setTypedBalance(pid, 'LVE', amount, cf, { amount: k.app, cf: k.cf }) ? null : 'Not saved'
  }
  const why = balanceProblem(pid, kind, n)
  if (why) return why
  return setTypedBalance(pid, kind, n, undefined, { amount: k.app }) ? null : 'Not saved'
}
