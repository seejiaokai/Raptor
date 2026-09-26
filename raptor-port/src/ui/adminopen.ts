/* [ACCOUNTS-NEW-PERSON] — go to Admin → Users from anywhere: the bell's access alert
   (D216) and Quals' "+ Add person" (D217, `newPerson` — the add form opens on New person).
   The intent is state/view.ts ADMINOPEN; the Admin page is its one consumer. */
import { requestAdminUsers } from '../state/view'
import { notify, setPage } from '../state/store'

export function openAdminUsers(opts: { newPerson?: boolean } = {}): void {
  requestAdminUsers(!!opts.newPerson)
  setPage('admin')
  notify()
}
