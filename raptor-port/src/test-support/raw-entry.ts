/* TEST WORLDS ONLY — never imported by the app (test-support/no-app-import.test.ts holds that).

   THE RAW ENTRY AND THE RAW ROLE CHANGE, MADE ON PURPOSE (the guard rail's plan §3.4 — step K7). Each tells the test
   set-ups' entry checker (src/testing/entry-checker.ts), for the turn it runs in, that what it does is raw on purpose —
   as the raw switch (state/store.ts switchRoleViewRaw) tells it — so the checker lets it through with something open.
   - rawEnter: a squadron entered as his own press enters it (`byPick`), asking nothing and closing nothing — the pick
     exactly as it was before the guard rail. Since D2403 no press reaches a squadron change with a window open; a test
     that needs that state (a window held by a pick, the band over it — removed with the band in Build 2; a squadron he
     only views with a window left set behind it) makes it with this.
   - rawRole: the role in force moved with nothing asked — the stand-in for a change he did not make (state/store.ts
     refreshAccess, his account's role changed while he is signed in), which no door asks and the checker cannot see;
     never the view switch's press, which is state/store.ts switchRoleView. */
import { enterSquadron, type Entered } from '../state/store'
import { holdNow } from '../state/typing-hold'
import { rawOnPurpose } from '../state/guard'
import { switchRoleInForce } from '../state/perms'

export function rawEnter(u: string, holdWar: boolean = holdNow() === 'war'): Entered {
  rawOnPurpose()
  return enterSquadron(u, holdWar, true)
}
export function rawRole(next: 'main' | 'admin'): boolean {
  rawOnPurpose()
  return switchRoleInForce(next)
}
