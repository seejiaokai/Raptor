/* The amendment-level panel on the edit page — React owns the controls.
   Phase 2 (§4, P2-08): publish is PER-DAY, never publish-all. Each published
   day that has real changes vs its issued version (dayHasChanges — the
   canonical delta, F-02) gets its OWN "Publish AL#" button; one click issues
   exactly that day (publishALDay). The issued-AL list below is READ-ONLY
   history (no unpublish ✕ — take-backs are gone), its counts from the frozen
   diff. The week-wide AL-number dropdown is gone. */
import { SCHED, pendCount, pendingPublishDays, nextSeq, daySigned, signMissing, dowShort, diffCounts, dayDelta, verLabel, alCount, SIGN_ROLES } from '../engine/publish'
import { esc, DPREV } from '../state/view'
import { notify, commitPublishALDay, commitDiscardPending } from '../state/store'
import { useVersion } from './useStore'

export function ALPanel() {
  useVersion()
  const np = pendCount()
  const pubDays = pendingPublishDays()   // published days with a real delta to issue

  return (
    <div className="alpanel" id="alPanel">
      <div className="al-h">Amendments</div>
      <div className="al-row">
        <span className={'al-pend' + (pubDays.length ? ' on' : '')}>
          {pubDays.length
            ? `${pubDays.length} day${pubDays.length > 1 ? 's' : ''} with changes to publish`
            : (np ? 'Changes are on unpublished days — publish the day first' : 'No pending changes')}
        </span>
        <button className="abtn ghost" id="alDrop" disabled={!np} onClick={() => { commitDiscardPending(); notify() }}>Discard marks</button>
      </div>
      {pubDays.length
        ? <div className="al-pubdays">
            {pubDays.map((di: number) => {
              const c = diffCounts(dayDelta(di)), seq = nextSeq(di), signed = daySigned(di)
              /* PREVIEW GUARD (owner, 15 Sep 26 — A3, Codex PS-001): while the
                 day is showing a frozen version, "Publish AL" would publish the
                 LIVE working copy, not the thing on screen. Hiding the day-head /
                 board buttons is not enough — THIS panel's button reaches
                 publishALDay too, so lock it (and re-check in the handler). */
              const previewing = DPREV.has(di)
              const bits = [`${c.total} change${c.total === 1 ? '' : 's'}`]
              if (c.del) bits.push(`${c.del} removal${c.del > 1 ? 's' : ''}`)
              if (c.mov) bits.push(`${c.mov} reorder${c.mov > 1 ? 's' : ''}`)
              if (c.inp) bits.push(`${c.inp} input filing${c.inp > 1 ? 's' : ''}`)
              return (
                <div className="al-pubday" key={di}>
                  <span className="al-pd-lbl"><b>{dowShort(di)}</b> · {bits.join(' · ')}</span>
                  <button className={'abtn primary' + (signed && !previewing ? '' : ' locked')} disabled={!signed || previewing}
                    title={previewing ? `Return to the live copy of ${dowShort(di)} before publishing — you're viewing a past version` : signed ? `Publish AL${seq} — ${c.total} change${c.total === 1 ? '' : 's'} on ${dowShort(di)} only` : `Sign off ${signMissing(di).join(', ')} before publishing AL${seq}`}
                    onClick={() => { if (DPREV.has(di)) return; commitPublishALDay(di); notify() }}>Publish AL{seq}</button>
                </div>
              )
            })}
          </div>
        : null}
      {SCHED.als.length
        ? <div className="al-list" dangerouslySetInnerHTML={{
          __html: SCHED.als.slice().sort((a: any, b: any) => a.iso === b.iso ? +a.seq - +b.seq : (a.iso < b.iso ? -1 : 1)).map((a: any) => {
            const c = diffCounts(a.diff), s = (a.sign && a.sign[a.di]) || null
            const sigTitle = s ? SIGN_ROLES.map((r: any) => r[1] + ' ' + (s[r[0]] || '—')).join(' · ') : 'signed before sign-off was introduced'
            return `<span class="al-tag" data-alc="${a.seq}" title="${esc(dowShort(a.di) + ': ' + sigTitle)}"><b>${verLabel(a.id)}</b> <i class="al-days">${dowShort(a.di)}</i> · ${alCount(a)} item${alCount(a) === 1 ? '' : 's'}${c.del ? ` · ${c.del} removal${c.del > 1 ? 's' : ''}` : ''}${c.mov ? ` · ${c.mov} reorder${c.mov > 1 ? 's' : ''}` : ''}${c.inp ? ` · ${c.inp} input filing${c.inp > 1 ? 's' : ''}` : ''}${s && s.appr ? ` · <i class="al-days">appr ${esc(s.appr)}</i>` : ''}</span>`
          }).join('')
        }} />
        : <div className="al-list"><span className="al-none">No amendments published yet — publish a day, edit it, then publish an AL.</span></div>}
    </div>
  )
}
