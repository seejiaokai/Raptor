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
import { me, pageUnit } from '../state/perms'
import { NOTICES, noticeRun, noticeSpan, noticeLive, holidayLineAny } from '../state/notices'
import { notify, setPage } from '../state/store'
import { todayIso } from '../state/units'
import { oilOpenOn, useWarFacts } from '../leavewar/sync'
import { FloatWin } from './FloatWindow'
import { InputCard } from './InputCard'
import { cardOf, cardWhen } from './inputcard-model'
import { monthItems } from './inputscal-model'
import { adminOfList, saveOilDay, type OilPick } from './oilday'
import { holdCanSign, holdIsLast, holdLater, holdSave, holdSaid, holdStands, type SignHold } from './oilsign'
import { OILLIST, setInpEdit, setOilList } from './pops'
import { useVersion } from './useStore'

/* THE SQUADRON THE LIST IS FOR (the Plan audit's PB4, the blind read's R3 — the reshape plan §19, §19b): as it was opened
   (a holiday just saved names its own squadron — leavewar/sync.ts tellHoliday); else the reader's own live holiday line for
   exactly these dates, whose squadron it carries (the bell's tap — ui/topstate.ts openNotice hands over only the dates);
   else the page's own squadron, as before (a published version loaded back, a put-back) */
function listUnit(o: { from: string; to: string; unit?: string }): string {
  if (o.unit) return o.unit
  const m = me()
  for (const n of NOTICES) {
    const s = m != null && n.to === m ? noticeSpan(n) : null
    if (s && s.u && s.a === o.from && s.b === o.to && noticeLive(n)) return s.u
  }
  return pageUnit('own', todayIso())
}

export function OilDayList() {
  useVersion()
  const o = OILLIST
  const unit = o ? listUnit(o) : ''
  /* (the window is the gate: an admin of the squadron it lists — at home, by Plan, or a master admin — PB4) */
  const refused = !!o && !adminOfList(unit)
  useEffect(() => { if (refused) setOilList(null) }, [refused])
  if (!o || refused) return null
  /* a list opened for another run of dates, or another squadron, is another list: its picks start empty */
  /* (…and one opened by another sign-off box holds another name: its picks start empty too) */
  return <Body key={`${unit}|${o.from}|${o.to}|${o.hold ? `${o.hold.di}.${o.hold.role}.${o.hold.who}` : ''}`} from={o.from} to={o.to} unit={unit} name={o.name} fresh={!!o.fresh} plain={!!o.plain} hold={o.hold} />
}

/* the held sign-off, drawn (out of Body so that function stays readable — the code check's own rule) */
function HeldSign({ held }: { held: { label: string; sch: boolean; cs: string } }) {
  return (
    <div className="odl-held" data-testid="odl-held">
      <span className={'sgn' + (held.sch ? ' sch' : '')}><span className="k">{held.label}</span><span className="v">{held.cs}</span></span>
      <span className="upconf-need">waiting for your answer</span>
    </div>
  )
}
/* the lead of a list a holiday's own save opened: named by its own name, else by its day or days */
const leadSaid = (name: string, from: string, to: string): string =>
  name ? `${name} is now a public holiday.` : from === to ? `${noticeRun(from, to)} is now a public holiday.` : `${noticeRun(from, to)} are now public holidays.`
/* the foot's buttons: Close where nothing is left to answer, else Later and Save */
function FootButtons({ empty, done, onClose, onLater, onSave }: { empty: boolean; done: number; onClose: () => void; onLater: () => void; onSave: () => void }) {
  if (empty) return <button type="button" className="abtn primary" data-testid="odl-close" onClick={onClose}>Close</button>
  return (
    <>
      <button type="button" className="abtn ghost" data-testid="odl-later" onClick={onLater}>Later</button>
      <button type="button" className="abtn primary" data-testid="odl-save" disabled={!done} onClick={onSave}>Save</button>
    </>
  )
}
/* THE FOOT'S QUIET WORDS while a sign-off is held (his D2859 — Opus drafted, a fresh Fable adjusted, approved 27 Nov 26):
   nothing picked, what Later does; some picked, what Save leaves; every row picked, nothing to say. On the LAST of the four
   boxes no box is left to ask after it (`last`): Later's own line says the question stays open; with some picked there is
   no line (the agent's reading, put to him — "the next sign-off asks the rest" would be untrue there). No sign-off held:
   the bells' line, where it is true. */
function footSaid(held: { cs: string; last: boolean } | null, rows: number, done: number, belled: boolean): string {
  if (!rows) return ''
  if (!held) return belled ? 'What is left goes to the schedulers’ bells' : ''
  if (!done) return held.last ? `Later: ${held.cs} signs, and OIL stays unanswered for now` : `Later: ${held.cs} signs, and the next sign-off asks again`
  return done < rows && !held.last ? 'Save: the next sign-off asks the rest' : ''
}

function Body({ from, to, unit, name, fresh, plain, hold }: { from: string; to: string; unit: string; name: string; fresh: boolean; plain: boolean; hold?: SignHold }) {
  useWarFacts()                                        // a holiday taken away, a period changed: the list is read again
  const [picks, setPicks] = useState<Record<string, OilPick | undefined>>({})
  /* the squadron it lists' inputs only (D2195 — each squadron answers for its own; PB4: the line's squadron, never the
     reader's home) */
  const open = oilOpenOn(from, to, unit)
  /* IN THE DAY'S OWN ORDER — the order the opened day lists the same inputs in (ui/inputscal-model.ts monthItems:
     absences first, all-day before timed, then by start), so the list and the day behind it read alike, as drawn */
  const found = open.map(o => ({ o, r: INPUTS.find((x: any) => String(x.iid) === o.iid) as any })).filter(x => x.r)
  const order = monthItems(found.map(x => x.r), { fPerson: 'all', fType: 'all', fSearch: '' } as any).map(it => it.rows[0])
  const rows = found.slice().sort((x, y) => order.indexOf(x.r) - order.indexOf(y.r))
  const done = rows.filter(x => picks[x.o.iid]).length
  /* "WHAT IS LEFT GOES TO THE SCHEDULERS' BELLS" IS SAID ONLY WHERE IT IS TRUE (the fresh read of the finished code, F3 —
     14 Oct 26). A scheduler's bell carries an OIL line only for a day that was MADE a holiday while something on it
     could earn (a stored notice — leavewar/sync.ts tellHoliday). The list is also opened by a published version loaded
     back (owner D818), on a plain weekend or on a holiday made while the input was off the programme: no bell has a
     line for those, and what is left stays on the input's "OIL?" sign and its own answerer's bell — so nothing is
     promised. Asked of the rows still UNPICKED (what is left), and of any scheduler's line, not only the reader's own
     (the narrow read of the fix, L1 and L2): with the told holiday's input picked and only a plain Saturday's left,
     nothing is promised; and a scheduler with no line of his own still reads what is true of the others' bells. */
  /* (the list's own squadron's lines only — PB5: another squadron's line on the same day goes to no bell of this list's) */
  const belled = rows.some(x => !picks[x.o.iid] && x.o.days.some(d => holidayLineAny(d, unit)))
  const close = () => { setOilList(null); notify() }
  const pick = (iid: string, v: OilPick) => setPicks(p => ({ ...p, [iid]: p[iid] === v ? undefined : v }))
  const all = (v: OilPick) => setPicks(Object.fromEntries(rows.map(x => [x.o.iid, v])))
  /* OPENED BY A SIGN-OFF BOX (his D2294, D2299, D2800 — ui/oilsign.ts): the name picked there is held, not written. Save
     writes the answers and then the name; Later writes the name with no answer, and the next press asks again; ✕ and
     Escape close the list as ever, and the hold goes with it — nothing is signed, and the next press asks again. */
  const save = () => { if (hold ? holdSave(hold, from, unit, picks) : saveOilDay(from, to, picks, unit) >= 0) close() }
  const later = () => { if (hold) holdLater(hold, from, unit); close() }
  /* SHOWN ONLY WHILE IT WOULD BE WRITTEN (walker w3's finding 1, 22 Nov 26): the list stays up while the page behind it
     works, and a week, a squadron or a saved plan changed under it leaves a hold that Save and Later no longer write
     (ui/oilsign.ts holdStands) — the list then promised "Later: Ace signs" and signed nothing. Read on every draw: back
     on its own day and plan, the box is shown again. */
  const held = hold && rows.length && holdStands(hold, from, unit) ? holdSaid(hold) : null
  /* the input's own window, where everything else about it is (the day's cards open it the same way) */
  const openInput = (r: any) => { setInpEdit(r); setPage('inputs'); notify() }
  return (
    <FloatWin id="oilday" title={`OIL — ${noticeRun(from, to)}`} sub={plain ? undefined : name ? `Public holiday · ${name}` : 'Public holiday'}
      testid="win-oilday" className="oildaywin" onClose={close}>
      {/* a holiday with no name of its own is named by its day — never by the preset's word ("PH is now…": the walk, E1) */}
      {fresh && <p className="odl-lead" data-testid="odl-lead">{leadSaid(name, from, to)}</p>}
      {rows.length === 0
        ? <p className="sd-empty" data-testid="odl-empty">Nothing left to answer.</p>
        : <>
          {/* THE PRESSED BOX ITSELF, THE NAME HELD IN IT (look A, his D2297; round 6 as drawn, D2299): the board's own
              sign-off box — its markup, its class — with a dotted edge, the app's mark for "waiting to go in", and no ▾:
              it opens nothing. Beside it the foot's quiet words. No paragraph above the list. */}
          {held && <HeldSign held={held} />}
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
                  <button type="button" className={'upconf-seg' + (p === 'y' ? ' on-pick' : '')} aria-pressed={p === 'y'}
                    data-testid={`odl-yes-${o.iid}`} onClick={() => pick(o.iid, 'y')}>Yes · {o.amt === 1 ? 'FO' : 'HO'}</button>
                  <button type="button" className={'upconf-seg' + (p === 'n' ? ' on-pick' : '')} aria-pressed={p === 'n'}
                    data-testid={`odl-no-${o.iid}`} onClick={() => pick(o.iid, 'n')}>No</button>
                </>} />
            )
          })}
        </>}
      <div className="odl-foot">
        {/* with a sign-off held the foot says what Later, or Save, leaves (his D2859 — footSaid above) */}
        {/* (a name that would be refused for a missing time is promised by no line — Astra's red-team read, 2) */}
        <span className="upconf-need" data-testid="odl-left">{held && !holdCanSign(hold!) ? '' : footSaid(held ? { cs: held.cs, last: holdIsLast(hold!) } : null, rows.length, done, belled && done < rows.length)}</span>
        <FootButtons empty={rows.length === 0} done={done} onClose={close} onLater={later} onSave={save} />
      </div>
    </FloatWin>
  )
}
