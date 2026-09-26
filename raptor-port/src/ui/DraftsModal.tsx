/* The plans manage modal (owner, 15 Aug 26; "Plan" rename 15 Sep 26) — opened
   from the plans menu's pencils (board.ts's planMenu), and SCOPED TO ONE DAY:
   drafts are per-day alternate blobs, so unlike DayTplModal's global library
   this modal manages exactly the day whose menu opened it. Same shape
   otherwise: pops.ts flag, hidden shell when closed, App.tsx mount, tabs
   across the entries, and no content editor — a draft's content is edited by
   selecting it and using the board / edit week themselves, which is the whole
   design (the live day IS the selected draft).
   The name commits on blur/Enter rather than per keystroke: draftRename
   REFUSES empty and duplicate names, and refusing mid-keystroke would make
   the box fight the typist — so the draft keeps its old name until a valid
   one is committed, and a refusal says why in a toast. */
import { useEffect, useState } from 'react'
import { notify } from '../state/store'
import { schedWriteValue, SCHED_TYPES } from '../state/sched-commit'
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { dayApproved } from '../engine/publish'
import { dayDrafts, curDraftId, draftRename, draftDelete, MAX_DRAFT_NAME } from '../engine/drafts'
import { switchDraft } from './board'
import { DRAFTSEDIT, setDraftsEdit } from './pops'
import { useVersion } from './useStore'
import { SESSION } from '../state/auth'
import { isAdmin } from '../state/perms'
import { CURPAGE } from '../state/view'

export function DraftsModal() {
  useVersion()
  const [sel, setSel] = useState<string | null>(null)
  /* the typed-but-uncommitted name; null = mirror the model. Reset whenever
     the selection or the open-target changes, so a half-typed rename never
     bleeds onto another draft's box. */
  const [nm, setNm] = useState<string | null>(null)
  const open = DRAFTSEDIT
  useEffect(() => {
    if (open && open.id) setSel(open.id)
    setNm(null)
  }, [open && open.di, open && open.id])
  /* self-hide for a non-admin, not just at the admin-gated opener (bug hunt,
     31 Aug 26 — point-2 authority sweep): DRAFTSEDIT survives toggleRole's
     admin→member peek, so without this an admin who opened the drafts manager
     and flipped to member view kept live rename/delete controls (draftRename/
     draftDelete) that carry no write-path gate. The test is `SESSION && role !==
     'admin'`, so a sessionless test/boot is not mistaken for a member. */
  /* …and it belongs to EDIT SCHEDULE, the only page that opens it: the admin's View-as-member
     round trip lands on View-only Sched, where the editor used to come back with a Select that
     could not act (switchDraft needs the edit page) and said nothing ([HUMAN-RETEST] walk W2-F8,
     24 Sep 26). Hidden there, it returns with its context when he goes back to Edit Schedule. */
  if (!open || (SESSION && !isAdmin()) || CURPAGE !== 'editsched') return <div className="modal" id="draftsModal" hidden />

  const di = open.di
  const d: any = DAYS[di]
  const list = dayDrafts(di)
  const selId = curDraftId(di)
  const t = list.find((x: any) => x.id === sel) || list[0] || null
  const isLive = !!t && t.id === selId

  const close = () => { setDraftsEdit(null); notify() }
  const commitName = () => {
    if (!t || nm == null) return
    if (nm.trim() === t.name) { setNm(null); return }
    /* [ARCH-STACK] follow-up #1 (row F): route the rename through a
       sched.draft.rename command (was HOOKS.histPush direct). schedWriteValue
       carries back the success bool the toast branch reads (R2-11); the rename +
       histPush run inside so the command captures the draft-blob change. */
    if (schedWriteValue(SCHED_TYPES.draftRename, () => {
      const ok = draftRename(di, t.id, nm)
      /* renaming is schedule bookkeeping the undo stack should carry — the
         blobs ride histSnap, so one push makes it one ordinary undo step */
      if (ok) HOOKS.histPush()
      return ok
    })) {
      /* renamed — nothing more */
    } else {
      HOOKS.toast(nm.trim() ? 'Another plan on this day already has that name' : 'A plan needs a name', 'warn')
    }
    setNm(null); notify()
  }

  return (
    <div className="modal" id="draftsModal" onClick={e => { if ((e.target as HTMLElement).id === 'draftsModal') close() }}>
      <div className="modal-box" style={{ width: 460 }}>
        <div className="modal-head"><b>Plans — {d ? d.dow : ''}</b><button className="x" id="draftsClose" onClick={close}>✕</button></div>
        <div className="modal-body">
          {list.length
            ? <>
                <div className="tpl-tabs">
                  {list.map((x: any) => (
                    <button key={x.id} className={'tpl-tab' + (t && x.id === t.id ? ' on' : '')}
                      onClick={() => { commitName(); setSel(x.id); setNm(null) }}>{x.name}{x.id === selId ? ' ●' : ''}</button>
                  ))}
                </div>
                <input className="tpl-name" value={nm ?? (t ? t.name : '')} maxLength={MAX_DRAFT_NAME}
                  aria-label="Plan name"
                  onChange={e => setNm(e.target.value)}
                  onBlur={commitName}
                  onKeyDown={e => { if (e.key === 'Enter') commitName() }} />
                <div className="wm-note" style={{ padding: '6px 0' }}>
                  {/* the note changes register once the day is published (owner,
                      15 Aug 26): the live draft is no longer "what publishes" —
                      the day already went out — it is what the next AL's
                      differences are measured from */}
                  {dayApproved(di)
                    ? (isLive
                      ? `"${t!.name}" is the live ${d ? d.dow : 'day'} — its differences from the issued schedule go out as the next AL.`
                      : `A stored alternative — Select makes it the live ${d ? d.dow : 'day'}; its differences from the issued schedule become pending.`)
                    : (isLive
                      ? `"${t!.name}" is the live ${d ? d.dow : 'day'} — publishing the day publishes it.`
                      : `A stored alternative — Select makes it the live ${d ? d.dow : 'day'}. The selected plan is what publishes.`)}
                </div>
              </>
            : <div className="sb-empty" style={{ padding: '14px 0' }}>
                No plans on this day yet — choose "+ Alt Plan" in the plans
                menu to plan an alternative over a copy.
              </div>}
        </div>
        <div className="modal-foot">
          <button className="abtn danger" style={{ marginRight: 'auto' }} disabled={!t || isLive}
            title={isLive ? 'This plan is the live day — switch to another plan first' : 'Delete this plan'}
            onClick={() => {
              if (!t) return
              /* [ARCH-STACK] follow-up #1 (row F): route the delete through a
                 sched.draft.delete command (was HOOKS.histPush direct). The delete
                 + histPush run inside; the UI updates below stay outside. */
              const tid = t.id
              if (!schedWriteValue(SCHED_TYPES.draftDelete, () => {
                const ok = draftDelete(di, tid)
                /* deletion rides the undo stack like the rename above; any frozen
                   preview of the deleted plan falls out through prunePreviews'
                   daySnapOf test on the next paint. Deleting down to one clears the
                   day's plans (engine B1), so dayDrafts may now be empty — setSel
                   falls back to null and the modal shows its empty state. */
                if (ok) HOOKS.histPush()
                return ok
              })) return
              const name = t.name
              setSel(dayDrafts(di)[0] ? dayDrafts(di)[0].id : null)
              setNm(null)
              notify()
              /* the menu's own create/select actions already toast (board.ts's
                 draftDup/switchDraft) — deleting was the one silent one left */
              HOOKS.toast(`"${name}" plan deleted`, 'ok')
            }}>Delete plan</button>
          <button className="abtn" disabled={!t || isLive}
            title={isLive ? 'Already the live day' : 'Make this plan the live day'}
            onClick={() => { if (t && switchDraft(di, t.id)) notify() }}>Select</button>
          <button className="abtn primary" onClick={close}>Done</button>
        </div>
      </div>
    </div>
  )
}
