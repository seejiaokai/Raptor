/* [ARCH-STACK] step 4 — the absence rules' seat inside the Raptor inputs door.

   Every Input write (the Inputs page, the calendar, reassign, the medical
   cascade, the Leave War's approve / move / remove) runs through ONE reducer
   body, `runInputWrite` (store.ts), and every undo / redo of Inputs through
   ONE restore body, `schedWriteRecords` (sched-commit.ts). The Leave War's
   absence rules (clash check B7, H1, H2, §25, §26) are installed here at boot
   by the Leave War wiring, so the scheduler core never imports the Leave War.
   No gate installed (a scheduler-only test) = no absence rules, exactly the
   pre-step-4 behaviour. */

export interface InputGate {
  /** before the caller's mutation: whatever `apply` needs to tell what changed */
  snapshot(): unknown
  /** after the mutation, inside the same command: enforce, cut, replace. Throws
   *  a refusal (after telling the user why) to roll the whole command back. */
  apply(before: unknown): void
  /** after an undo / redo restored Inputs: refuse (throw) a result that breaks
   *  the invariant, naming the blocking record (B7). `iids` = the Inputs the
   *  restore wrote or deleted. */
  vetRestore(iids: ReadonlySet<string>, persons: ReadonlySet<string>): void
}

let GATE: InputGate | null = null
export function setInputGate(g: InputGate | null): void { GATE = g }
export function inputGate(): InputGate | null { return GATE }

/* WHAT THE ABSENCE RULES CUT, HEARD BY A SHEET BEFORE ANYTHING CHANGES (owner D1023, 18 Oct 26 — "Ok as recommended": the
   upchit sheet lists each leave and bid a give-back will cut, one line each). The gate says each cut here, in the same
   words its warning uses, as it makes it; a door that wants them tries its own save and throws it away (ui/inputedit.tsx
   giveBackCuts), listening. Nobody listening = nothing kept; the gate's warning is said as it always was. */
let HEARD: string[] | null = null
export function gateCuts(lines: readonly string[]): void { if (HEARD) HEARD.push(...lines) }
export function hearGateCuts(fn: () => void): string[] {
  const outer = HEARD
  const mine: string[] = []
  HEARD = mine
  try { fn() } finally { HEARD = outer }
  return mine
}

/* WHICH DAYS OF AN INPUT ASK THE OIL QUESTION, and what its hours price on each — the Leave War's to say (a weekend,
   or a holiday in the period holding the date: leavewar/sync.ts oilAskPlan), handed over here by the same wiring so
   the permission module never imports the Leave War. The check on what a member's command changed reads it (state/
   perms.ts — a filer answers for another man only as the record's days and hours give, D660). No reader installed (a
   scheduler-only test) = no day asks. */
export type OilPlan = (row: any) => { iso: string; amt: number }[]
let OIL_PLAN: OilPlan | null = null
export function setOilPlan(fn: OilPlan | null): void { OIL_PLAN = fn }
export function oilPlanOf(row: any): { iso: string; amt: number }[] { return OIL_PLAN && row ? OIL_PLAN(row) : [] }

/* The publish door (clash check B5, owner answer A): publishing a weekend or
   public-holiday day replaces the clashing part of an undecided leave bid, in
   the SAME command as the publish, so undoing the publish brings the bid back.
   `di` = the loaded week's day just published. */
let PUBLISH_GATE: ((di: number) => void) | null = null
export function setPublishGate(g: ((di: number) => void) | null): void { PUBLISH_GATE = g }
export function publishGate(): ((di: number) => void) | null { return PUBLISH_GATE }
