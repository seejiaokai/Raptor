/* THE PEOPLE-AND-SETTINGS SAVE LAYER'S REGISTRATION — the one place that knows both the layer and the files that save
   through it ([RD-LEFT-1108], 8 Nov 26). state/people-settings-commit.ts used to import accounts, changes, noticeseen,
   apprseen, lwseen and flyplan for their loaders and command types while each of them imports its commit helpers from
   it — 13 import cycles (React Doctor). Now the layer imports none of them, and this file, which nothing below it
   imports, hands it what it needs: the four loaders a rollback or an undo re-runs, and every command type those files
   declare. Called once at start-up (state/store.ts wireStore), exactly where the layer's own registration was. */
import { registerPeopleSettingsCore } from './people-settings-commit'
import { accountsLoad, ACCOUNT_TYPES } from './accounts'
import { changesLoad, CHANGES_TYPES } from './changes'
import { noticeSeenLoad, NOTICE_TYPES } from './noticeseen'
import { LWSEEN_TYPES } from './lwseen'
import { APPRSEEN_TYPES } from './apprseen'
import { flyplanLoad } from './flyplan'

export function registerPeopleSettingsCommandLayer(): void {
  registerPeopleSettingsCore(
    { accounts: accountsLoad, changes: changesLoad, noticeSeen: noticeSeenLoad, flyplan: flyplanLoad },
    [...ACCOUNT_TYPES, ...CHANGES_TYPES, ...NOTICE_TYPES, ...LWSEEN_TYPES, ...APPRSEEN_TYPES],
  )
}
