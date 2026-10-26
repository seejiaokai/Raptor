// THE RENAME WINDOW OF A REQUIRED ROW (the Leave War overhaul, batch 3 — owner D1193, 21 Oct 26: "Take note the required
// P and W should also be allowed to be edited" … "The name of it"; drawn r7-27). It narrows D668, which had kept their
// names fixed.
//
// The name only: a Required row's figures stay typed in its cells (FlyEdit.tsx), so this window holds one box, Save and
// Cancel — opened by an admin's tap on the row's name, as an Available row's name opens its counter form. A blank name,
// or the original typed back, puts the original back (engine/fixedrows.ts reqNameToKeep), and a phone then shows its
// short form ("Req P") again. One command (`lw.reqname`, state/store.ts setReqName), undone by the app's Undo.

import { useState } from 'react'
import { REQ_NAME_MAX } from '../engine'
import { setReqName } from '../state/store'
import { reqRowNames } from '../sync'
import { Sheet } from './Sheet'
import './bidpicker.css'

export function ReqNameForm({ seat, onClose }: { seat: 'p' | 'w'; onClose: () => void }) {
  const now = reqRowNames()[seat]
  const [name, setName] = useState(now)
  const save = () => { if (setReqName(seat, name)) onClose() }
  return (
    <Sheet testid="req-name-form" label={`Rename ${now}`} onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{now}</span>
        <button className="x" data-testid="reqname-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="bidsheet-row cf-row">
        <span className="lab">Name</span>
        <input
          className="namein"
          data-testid="reqname-name"
          maxLength={REQ_NAME_MAX}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save() }}
        />
      </div>
      <div className="cfoot mth-foot">
        <button className="creset pri" data-testid="reqname-save" onClick={save}>Save</button>
        <button className="creset" data-testid="reqname-cancel" onClick={onClose}>Cancel</button>
      </div>
    </Sheet>
  )
}
