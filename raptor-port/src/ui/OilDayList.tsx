/* THE ONE LIST — every input of a day that needs an OIL answer, answered in one place ([OIL-ASK-NOTIFY]).

   Owner, D782 (12 Oct 26): "can the admin answering all the inputs for oil that day have a consolidated list that's
   easy to select oil yes or no for them? And a yes to all or no to all kinda button for easy selection". D783 ("Yes to
   all" — the pictures of record docs/mock/2026-10-12-oil-notify/*-hol-2-notice.png, *-hol-3-list.png,
   *-hol-4-list-yes-to-all.png): one line an input, on the input's own card; "Yes · FO" or "Yes · HO", and "No" (a
   chosen No in quiet grey); "Yes to all" and "No to all" on the count's line; "Later" and "Save"; "What is left goes
   to the schedulers' bells"; no "OIL?" tag inside the list; on a phone as tall as what is in it. It opens by itself
   the moment a holiday is saved — "<its name> is now a public holiday." above it — and from the schedulers' bell line
   (ui/topbits.tsx), without that line.

   A WINDOW ON THE SHELL (D641): it drags, and the page behind it works. Scheduler only — the window is the gate: asked
   for by anyone else it draws nothing and is not left asked for (the settings windows' own rule). Mounted once
   (ui/App.tsx), opened by ui/pops.ts OILLIST.

   WHAT IT LISTS IS READ LIVE (leavewar/sync.ts oilOpenOn), on every draw: an input answered in its own window while
   the list is up leaves it, a new one filed on the day joins it, and the count is of what stands NOW. What is PICKED is
   this window's own, until Save; Later, ✕ and Escape throw the picks away and write nothing — what is left stays on the
   schedulers' bells. Save writes the picks as one command (ui/oilday.ts) and closes. */
import { useEffect, useState } from 'react'
import { INPUTS } from '../engine/inputs'
import { canEditSched } from '../state/auth'
import { noticeRun } from '../state/notices'
import { notify, setPage } from '../state/store'
import { oilOpenOn, useWarFacts } from '../leavewar/sync'
import { FloatWin } from './FloatWindow'
import { InputCard } from './InputCard'
import { cardOf, cardWhen } from './inputcard-model'
import { monthItems } from './inputscal-model'
import { saveOilDay, type OilPick } from './oilday'
import { OILLIST, setInpEdit, setOilList } from './pops'
import { useVersion } from './useStore'

export function OilDayList() {
  useVersion()
  const o = OILLIST
  const refused = !!o && !canEditSched()
  useEffect(() => { if (refused) setOilList(null) }, [refused])
  if (!o || refused) return null
  /* a list opened for another run of dates is another list: its picks start empty */
  return <Body key={`${o.from}|${o.to}`} from={o.from} to={o.to} name={o.name} fresh={!!o.fresh} />
}

function Body({ from, to, name, fresh }: { from: string; to: string; name: string; fresh: boolean }) {
  useWarFacts()                                        // a holiday taken away, a period changed: the list is read again
  const [picks, setPicks] = useState<Record<string, OilPick | undefined>>({})
  const open = oilOpenOn(from, to)
  /* IN THE DAY'S OWN ORDER — the order the opened day lists the same inputs in (ui/inputscal-model.ts monthItems:
     absences first, all-day before timed, then by start), so the list and the day behind it read alike, as drawn */
  const found = open.map(o => ({ o, r: INPUTS.find((x: any) => String(x.iid) === o.iid) as any })).filter(x => x.r)
  const order = monthItems(found.map(x => x.r), { fPerson: 'all', fType: 'all', fSearch: '' } as any).map(it => it.rows[0])
  const rows = found.slice().sort((x, y) => order.indexOf(x.r) - order.indexOf(y.r))
  const done = rows.filter(x => picks[x.o.iid]).length
  const close = () => { setOilList(null); notify() }
  const pick = (iid: string, v: OilPick) => setPicks(p => ({ ...p, [iid]: p[iid] === v ? undefined : v }))
  const all = (v: OilPick) => setPicks(Object.fromEntries(rows.map(x => [x.o.iid, v])))
  const save = () => { if (saveOilDay(from, to, picks) >= 0) close() }
  /* the input's own window, where everything else about it is (the day's cards open it the same way) */
  const openInput = (r: any) => { setInpEdit(r); setPage('inputs'); notify() }
  return (
    <FloatWin id="oilday" title={`OIL — ${noticeRun(from, to)}`} sub={name ? `Public holiday · ${name}` : 'Public holiday'}
      testid="win-oilday" className="oildaywin" onClose={close}>
      {fresh && <p className="odl-lead" data-testid="odl-lead">{name || 'This day'} is now a public holiday.</p>}
      {rows.length === 0
        ? <p className="sd-empty" data-testid="odl-empty">Nothing left to answer.</p>
        : <>
          <div className="odl-count">
            <h3 className="sd-gh" data-testid="odl-count">{done ? `${done} of ${rows.length} answered` : `${rows.length} to answer`}</h3>
            <button type="button" className="abtn sm" data-testid="odl-yesall" onClick={() => all('y')}>Yes to all</button>
            <button type="button" className="abtn sm" data-testid="odl-noall" onClick={() => all('n')}>No to all</button>
          </div>
          {rows.map(({ o, r }) => {
            const when = cardWhen(r, o.last, o.days[0]!)
            const p = picks[o.iid]
            return (
              <InputCard key={o.iid} id={o.iid} tid="odl" facts={cardOf([r], undefined, when)} when={when} late="" onOpen={() => openInput(r)}
                action={<>
                  <button type="button" className={'upconf-seg' + (p === 'y' ? ' on-keep' : '')} aria-pressed={p === 'y'}
                    data-testid={`odl-yes-${o.iid}`} onClick={() => pick(o.iid, 'y')}>Yes · {o.amt === 1 ? 'FO' : 'HO'}</button>
                  <button type="button" className={'upconf-seg' + (p === 'n' ? ' odl-no' : '')} aria-pressed={p === 'n'}
                    data-testid={`odl-no-${o.iid}`} onClick={() => pick(o.iid, 'n')}>No</button>
                </>} />
            )
          })}
        </>}
      <div className="odl-foot">
        <span className="upconf-need" data-testid="odl-left">{rows.length && done < rows.length ? 'What is left goes to the schedulers’ bells' : ''}</span>
        {rows.length === 0
          ? <button type="button" className="abtn primary" data-testid="odl-close" onClick={close}>Close</button>
          : <>
            <button type="button" className="abtn ghost" data-testid="odl-later" onClick={close}>Later</button>
            <button type="button" className="abtn primary" data-testid="odl-save" disabled={!done} onClick={save}>Save</button>
          </>}
      </div>
    </FloatWin>
  )
}
