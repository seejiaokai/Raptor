/* The amendment-level panel on the edit page — renderALPanel's strings kept,
   with React owning the controls. Pick an AL, publish, discard, unpublish. */
import { useState } from 'react'
import { SCHED, pendCount, deleteCount, inputActionCount, alUsed, nextAL, canPublishAL, publishableKeys, alUnsignedDays, daysLabel, dowShort, dayApproved, dayPendCount, pendDays, alDays, alCount, publishAL, unpublishAL, discardPending } from '../engine/publish'
import { SIGN_ROLES } from '../engine/publish'
import { esc } from '../state/view'
import { notify } from '../state/store'
import { useVersion } from './useStore'

export function ALPanel() {
  useVersion()
  const [pick, setPick] = useState<number | null>(null)
  const np = pendCount(), nr = deleteCount(Object.keys(SCHED.pending)), ni = inputActionCount(Object.keys(SCHED.pending)), used = alUsed()
  const opts: number[] = []
  for (let n = 1; n <= Math.max(7, (used.length ? Math.max(...used) : 0) + 2); n++) if (!used.includes(n)) opts.push(n)
  const dflt = nextAL()
  const canPub = publishableKeys().length
  const value = pick && opts.includes(pick) ? pick : dflt

  const brk = pendDays().map((di: number) =>
    `<span class="al-d ${dayApproved(di) ? 'ok' : 'held'}" title="${dayApproved(di) ? 'published — will go out' : 'not published — held back'}">${dowShort(di)} ${dayPendCount(di)}</span>`).join('')

  return (
    <div className="alpanel" id="alPanel">
      <div className="al-h">Amendments</div>
      <div className="al-row">
        <span className={'al-pend' + (np ? ' on' : '')}>{np ? `${np} pending change${np > 1 ? 's' : ''}${nr ? ` · ${nr} removal${nr > 1 ? 's' : ''}` : ''}${ni ? ` · ${ni} input filing change${ni > 1 ? 's' : ''}` : ''}` : 'No pending changes'}</span>
        {brk ? <span className="al-brk" dangerouslySetInnerHTML={{ __html: brk }} /> : null}
        <span className="al-note">publish as</span>
        <select id="alPick" aria-label="Amendment level to publish" value={value} onChange={e => setPick(+e.target.value)}>
          {opts.map(n => <option key={n} value={n}>AL{n}</option>)}
        </select>
        <button className="abtn primary" id="alPub" disabled={!canPublishAL()}
          title={!canPub ? 'Publish a day before publishing its changes' : (canPublishAL() ? `Publish ${canPub} change${canPub > 1 ? 's' : ''} on published days` : 'Sign off ' + daysLabel(alUnsignedDays()) + ' before publishing')}
          onClick={() => { publishAL(value); notify() }}>Publish</button>
        <button className="abtn ghost" id="alDrop" disabled={!np} onClick={() => { discardPending(); notify() }}>Discard marks</button>
      </div>
      {SCHED.als.length
        ? <div className="al-list" dangerouslySetInnerHTML={{
          __html: SCHED.als.slice().sort((a: any, b: any) => a.n - b.n).map((a: any) =>
            `<span class="al-tag" data-alc="${a.n}" title="${a.sign ? alDays(a).map((di: number) => dowShort(di) + ': ' + SIGN_ROLES.map((r: any) => r[1] + ' ' + (((a.sign[di] || {})[r[0]]) || '—')).join(' · ')).join(' | ') : 'signed before sign-off was introduced'}"><b>AL${a.n}</b> <i class="al-days">${daysLabel(alDays(a))}</i> · ${alCount(a)} item${alCount(a) > 1 ? 's' : ''}${deleteCount(a.keys) ? ` · ${deleteCount(a.keys)} removal${deleteCount(a.keys) > 1 ? 's' : ''}` : ''}${inputActionCount(a.keys) ? ` · ${inputActionCount(a.keys)} input filing${inputActionCount(a.keys) > 1 ? 's' : ''}` : ''}${(() => { const s0 = a.sign && a.sign[alDays(a)[0]]; return s0 && s0.appr ? ` · <i class="al-days">appr ${esc(s0.appr)}</i>` : '' })()}<button class="al-un" data-alun="${a.n}" title="Unpublish AL${a.n}">✕</button></span>`).join('')
        }} onClick={e => {
          const b = (e.target as HTMLElement).closest('[data-alun]') as HTMLElement | null
          if (b) { unpublishAL(+b.dataset.alun!); notify() }
        }} />
        : <div className="al-list"><span className="al-none">No amendments published yet — publish a day, edit it, then publish an AL.</span></div>}
    </div>
  )
}
