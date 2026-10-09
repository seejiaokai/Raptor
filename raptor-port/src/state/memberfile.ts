/* THE MEMBERS' SWITCH — its one writer (owner D654, D655 reading 6; the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13).

   "Members may file duties and commitments for other people." One squadron setting, `memberfile`: absent = ON (his
   "for now" is the starting state), `false` = OFF. An admin flips it — behind the Inputs calendar's gear, and from the
   Logic page's row (both come with the Inputs calendar; two doors, one setting, as the late cut-offs have).

   Switched OFF, nothing already filed is removed or altered: a member simply files for himself only, and his right
   over what he had filed for others goes with it (the man and an admin still change those) — the rule is read live by
   state/perms.ts membersFileOn at every question, so there is nothing here to sweep.

   Admin only: `settings.memberfile` in state/perms.ts COMMAND_OPS, mirrored by docs/data-model.md §11 (D200). A raw
   write of the key is refused (state/people-settings-commit.ts), so the value is only ever a switch. */
import { store } from '../engine/hooks'
import type { CommitResult } from '../command'
import { commitSettingsIntent } from './people-settings-commit'
import { membersFileOn } from './perms'

export type SwitchSave = { ok: boolean; message?: string; pending?: Promise<SwitchSave> }

function result(r: CommitResult): SwitchSave {
  if ('queued' in r) return { ok: false, pending: r.done.then(result) }
  return { ok: r.ok, ...(!r.ok ? { message: r.message || 'This change could not be saved.' } : {}) }
}

/** Turn the members' switch on or off. Setting it to what it already is makes no command and no Undo step. */
export function setMembersFile(on: boolean): SwitchSave {
  const want = !!on
  if (membersFileOn() === want) return { ok: true }
  return result(commitSettingsIntent('settings.memberfile', null, () => {
    store.set('memberfile', want ? null : false)
    /* read back inside the command, as the flying plan's saves do: a switch is never reported flipped unless it is */
    if (membersFileOn() !== want) throw new Error('The setting could not be saved. Try again.')
  }))
}
