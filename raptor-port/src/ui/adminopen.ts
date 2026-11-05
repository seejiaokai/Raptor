/* [ACCOUNTS-NEW-PERSON] — go to Admin → Users from anywhere: the bell's access alert
   (D216) and Quals' "+ Add person" (D217, `newPerson` — the add form opens on New person);
   and a bell's posting line ([POSTOUT-RUN-NOTICE], D1547 — `person`: his row brought into
   view and ringed). The intent is state/view.ts ADMINOPEN; the Admin page is its one consumer. */
import { requestAdminUsers } from '../state/view'
import { notify, setPage } from '../state/store'

export function openAdminUsers(opts: { newPerson?: boolean; person?: string } = {}): void {
  requestAdminUsers(!!opts.newPerson, opts.person)
  setPage('admin')
  notify()
}
