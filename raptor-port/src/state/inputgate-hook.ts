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

/* The publish door (clash check B5, owner answer A): publishing a weekend or
   public-holiday day replaces the clashing part of an undecided leave bid, in
   the SAME command as the publish, so undoing the publish brings the bid back.
   `di` = the loaded week's day just published. */
let PUBLISH_GATE: ((di: number) => void) | null = null
export function setPublishGate(g: ((di: number) => void) | null): void { PUBLISH_GATE = g }
export function publishGate(): ((di: number) => void) | null { return PUBLISH_GATE }
