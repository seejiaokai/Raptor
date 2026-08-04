/* The scheduler board's HTML assembly (renderScheduler's board loop) and its
   delegated handlers — the reference's bodies, verbatim, with repaint via the
   store's notify(). The CX-with-a-reason dialog state lives here too. */
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { isStandalone, makeStandalone, SAWAVE } from '../engine/waves'
import { waveInTime } from '../engine/events'
import { WARN, validate, WCODE, wlbl } from '../engine/validate'
import { hhmm } from '../engine/time'
import { slotVal, txtGet, txtSet, acRef, rollCx } from '../engine/slots'
import { markEdit, alAttr } from '../engine/publish'
import { shiftAircraft, shiftFormation, shiftWave, shiftKeys } from '../engine/keys'
import { signoffHTML, cxText } from './html'
import { HOOKS } from '../engine/hooks'
import { canEditSched } from '../state/auth'
import * as view from '../state/view'
import { esc } from '../state/view'
import { notify } from '../state/store'
import { sbNotesPanel, sbProgPanel, sbSimPanel, sbSlot, labelToTitle, titleToLabel } from './board-html'

const toast = (...a: any[]) => HOOKS.toast(...a)
const afterSchedMutate = () => view.afterSchedMutate()

/* renderScheduler's board string, verbatim */
export function boardHTML(di: number) {
  const d = DAYS[di]
  let b = `<div class="signoff board-sign" id="sbSignBar">${signoffHTML(di, true)}</div>`
    + sbNotesPanel(d, di) + sbProgPanel(d, di)
  let fly = ''
  ;(d.waves || []).forEach((w: any, gi: number) => {
    const asd = w.formations.reduce((n: number, f: any) => n + f.aircraft.length, 0)
    const opts = ['1st wave', '2nd wave', '3rd wave', '4th wave', '5th wave', 'Night wave']
    const cur = labelToTitle(w); if (!opts.includes(cur)) opts.unshift(cur)
    const inT = waveInTime(w)
    fly += `<div class="sb-go"><div class="sb-go-h"><span>Go ${gi + 1}</span>`
      + `<select class="sb-wtitle" aria-label="Wave" data-wsel="${di}.${gi}">${opts.map(o => `<option ${o === cur ? 'selected' : ''}>${o}</option>`).join('')}</select>`
      + `${w.night ? '<span class="night">· night</span>' : ''}`
      + `<span class="asd">in-time ${inT != null ? hhmm(inT) : '—'} · ${asd} ac</span>`
      + `<span class="gctl"><button class="mbtn add" data-gline="${di}.${gi}" title="Add a line to this wave">+ Line</button>`
      + `<button class="mbtn del" data-gdel="${di}.${gi}" title="Remove this whole wave">✕ Wave</button></span></div>`
    fly += `<div class="sb-lcols"><span>CS</span><span>MSN</span><span>TO</span><span>LD</span><span>FCP</span><span>RCP</span><span>Notes</span><span></span></div>`
    if (!w.formations.length) fly += `<div class="sb-empty" style="padding:6px 11px">Empty wave — add a line, or remove the wave.</div>`
    w.formations.forEach((f: any, li: number) => f.aircraft.forEach((a: any, ai: number) => {
      const key = `${di}.${gi}.${li}.${ai}`, fp = `ff:${di}.${gi}.${li}`
      const cxOn = !!(a.cx || f.cx)
      fly += `<div class="sb-line${cxOn ? ' cx' : ''}${a.flag ? ' redbox' : ''}">
        <input class="lin" data-bfld="${fp}.cs"${alAttr(`${fp}.cs`)} value="${esc(f.cs)}">
        <input class="msn" data-bfld="${fp}.msn"${alAttr(`${fp}.msn`)} value="${esc(f.msn)}">
        <input class="tm" data-bfld="${fp}.to"${alAttr(`${fp}.to`)} value="${esc(f.to)}">
        <input class="tm" data-bfld="${fp}.ld"${alAttr(`${fp}.ld`)} value="${esc(f.ld)}">
        ${sbSlot(di, key + '.p', 'p', a.p)}
        ${sbSlot(di, key + '.w', 'w', a.w)}
        <input class="nts" data-bfld="fr:${key}"${alAttr(`fr:${key}`)} value="${esc(a.rmks || '')}">
        <span class="lctl">
          <button class="mbtn${cxOn ? ' on' : ''}" data-lcx="${key}" title="${cxOn ? 'Restore this line' : 'Cancel this line (CX)'}">CX</button>
          <button class="mbtn red${a.flag ? ' on' : ''}" data-lflag="${key}" title="${a.flag ? 'Clear the red box' : 'Red box — flag this for the next scheduler'}">■</button>
          <button class="mbtn add" data-lac="${di}.${gi}.${li}" title="Add another aircraft to this formation">+</button>
          <button class="mbtn del" data-ldel="${key}" title="Remove this line">✕</button>
        </span>
      </div>`
    }))
    fly += `</div>`
  })
  b += fly || `<div class="sb-empty" style="padding:14px 11px">No flying waves yet — use “+ Wave”.</div>`
  b += sbSimPanel(d, di)
  return b
}

export function boardWarnHTML(di: number) {
  const d = DAYS[di]
  const dw = (WARN.byDay[di] && WARN.byDay[di].warns) || []
  let wh = `<div class="wh">Live checks · ${dw.length} for ${esc(d.dow)}</div>`
  if (dw.length) {
    dw.slice().sort((a: any, b: any) => (a.sev === 'hard' ? 0 : 1) - (b.sev === 'hard' ? 0 : 1)).forEach((w: any) => {
      const names = (w.who || []).map((id: any) => PEOPLE[id] ? PEOPLE[id].cs : id).join(', ')
      wh += `<div class="wln ${w.sev}">${esc(names)}${names ? ' — ' : ''}${esc(wlbl(w.msg || WCODE[w.code] || w.code || ''))}</div>`
    })
  } else wh += `<div class="wln ok">No conflicts flagged for this day ✓</div>`
  return wh
}

export function dayTabsHTML(di: number) {
  return DAYS.map((x: any, i: number) => `<span class="sbday ${i === di ? 'on' : ''}" data-sbtab="${i}">${esc(x.dow.slice(0, 3))} ${esc(x.dt.replace('Jul ', ''))}</span>`).join('')
}

/* ---- CX-with-a-reason dialog state ---- */
export const CX_QUICK = ['WX', 'U/S AIRCRAFT', 'CREW SICK', 'NO AIRSPACE', 'TASKING', 'ENGINEERING', 'SLIPPED']
export let CXT: any = null
export function setCxt(v: any) { CXT = v }
export function askCx(o: any, key: any, label: any, after?: any) {
  if (!o) return
  CXT = { o, key, after: after || null, label: label || 'this line' }
  notify()
}
export function cxCommit(cancel: boolean, reason: string) {
  if (!CXT) return
  const { o, key, after } = CXT
  if (cancel) { o.cx = true; o.cxr = String(reason).trim() }
  else { o.cx = false; delete o.cxr }
  CXT = null
  if (key) markEdit(key)
  if (after) after()
  afterSchedMutate()
  toast(cancel ? cxText(o) : 'Restored')
}

/* the board's delegated .mbtn click handler, verbatim bodies */
export function boardMbtn(e: MouseEvent) {
  const t = (e.target as HTMLElement).closest('.mbtn') as HTMLElement | null; if (!t) return
  const ds = t.dataset
  if (ds.lcx != null) { const r = acRef(ds.lcx); if (!r || !r.a) return; return askCx(r.a, `fr:${ds.lcx}`, 'this line', () => rollCx(r.f)) }
  if (ds.lflag != null) {
    const r = acRef(ds.lflag); if (!r || !r.a) return
    r.a.flag = !r.a.flag; markEdit(`fr:${ds.lflag}`); afterSchedMutate(); notify()
    return toast(r.a.flag ? 'Red box — flagged for the next scheduler' : 'Red box cleared')
  }
  if (ds.ldel != null) {
    const r = acRef(ds.ldel); if (!r || !r.a) return
    const [dI, gI] = String(ds.ldel).split('.').map(Number)
    r.f.aircraft.splice(r.ai, 1)
    shiftAircraft(dI, gI, r.li, r.ai)
    if (!r.f.aircraft.length) { r.w.formations.splice(r.li, 1); shiftFormation(dI, gI, r.li) } else rollCx(r.f)
    markEdit(); afterSchedMutate(); notify(); return toast('Line removed')
  }
  if (ds.lac != null) {
    const [di, gi, li] = ds.lac.split('.').map(Number)
    const f = DAYS[di].waves[gi].formations[li]
    f.aircraft.push({ p: '', w: '', area: '', rmks: '', opts: {} }); rollCx(f)
    markEdit(`fr:${di}.${gi}.${li}.${f.aircraft.length - 1}`); afterSchedMutate(); notify(); return toast('Aircraft added')
  }
  if (ds.gline != null) {
    const [di, gi] = ds.gline.split('.').map(Number)
    const w = DAYS[di].waves[gi], last = w.formations[w.formations.length - 1] || { cs: 'NEW', msn: '-', to: '12:00', ld: '13:00' }
    w.formations.push({ cs: last.cs, msn: last.msn, to: last.to, ld: last.ld, aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] })
    markEdit(`ff:${di}.${gi}.${w.formations.length - 1}.cs`); afterSchedMutate(); notify(); return toast('Line added')
  }
  if (ds.gdel != null) {
    const [di, gi] = ds.gdel.split('.').map(Number)
    const gw = DAYS[di].waves[gi]
    DAYS[di].waves.splice(gi, 1); shiftWave(di, gi)
    if (gw && isStandalone(gw) && Array.isArray(DAYS[di].dutywaves)) {
      const j = DAYS[di].dutywaves.findIndex((x: any) => x && x.label === gw.label)
      if (j >= 0) { DAYS[di].dutywaves.splice(j, 1);[`d:${di}.`, `dr:${di}.`, `dl:${di}.`].forEach(h => shiftKeys(h, 0, j)) }
    }
    markEdit(); afterSchedMutate(); notify(); return toast('Wave removed')
  }
  if (ds.nadd != null) {
    const d = DAYS[+ds.nadd]; d.notes = d.notes || []; d.notes.push('')
    markEdit(`dn:${+ds.nadd}.${d.notes.length - 1}`); afterSchedMutate(); notify(); return
  }
  if (ds.ndel != null) {
    const [di, ni] = ds.ndel.split('.').map(Number)
    DAYS[di].notes.splice(ni, 1); shiftKeys(`dn:${di}.`, 0, ni)
    markEdit(); afterSchedMutate(); notify(); return toast('Note removed')
  }
  if (ds.padd != null) {
    const d = DAYS[+ds.padd]; d.allhands = d.allhands || []
    d.allhands.push({ prog: '', sub: '', str: '', end: '', who: [] })
    markEdit(`ap:${+ds.padd}.${d.allhands.length - 1}.prog`); afterSchedMutate(); notify(); return
  }
  if (ds.pdel != null) {
    const [di, ri] = ds.pdel.split('.').map(Number)
    DAYS[di].allhands.splice(ri, 1)
    ;[`ap:${di}.`, `a:${di}.`].forEach(h => shiftKeys(h, 0, ri))
    markEdit(); afterSchedMutate(); notify(); return toast('Item removed')
  }
  if (ds.pcx != null) { const [di, ri] = ds.pcx.split('.').map(Number); return askCx(DAYS[di].allhands[ri], `ap:${di}.${ri}.prog`, 'this item') }
  if (ds.pflag != null) {
    const [di, ri] = ds.pflag.split('.').map(Number); const x = DAYS[di].allhands[ri]
    x.flag = !x.flag; markEdit(`ap:${di}.${ri}.prog`); afterSchedMutate(); notify()
    return toast(x.flag ? 'Red box — flagged for the next scheduler' : 'Red box cleared')
  }
}

/* the board field-change handler (through the text funnel) */
export function boardChange(e: Event) {
  /* the wave-title select: night flag + label, verbatim */
  const s = (e.target as HTMLElement).closest('[data-wsel]') as HTMLSelectElement | null
  if (s) {
    const [di, gi] = s.dataset.wsel!.split('.'); const w = DAYS[+di!].waves[+gi!]
    w.night = /night/i.test(s.value); w.label = titleToLabel(s.value); afterSchedMutate(); notify(); return
  }
  const f = (e.target as HTMLElement).closest('[data-bfld]') as HTMLInputElement | null; if (!f) return
  const p = f.dataset.bfld!
  if (txtSet(p, f.value)) { markEdit(); afterSchedMutate(); notify() }
  else f.value = txtGet(p)
}

/* the board's slot-arm click handler */
export function boardArmClick(e: MouseEvent) {
  if (!canEditSched()) return
  const t = e.target as HTMLElement
  if (t.closest('.puck[data-person]')) return
  const empty = t.closest('.sb-slot.empty[data-slot]') as HTMLElement | null
  if (empty) { view.armSlot(empty.dataset.slot, empty); notify(); e.stopPropagation(); return }
  const seat = t.closest('.seat[data-slot]') as HTMLElement | null
  if (seat && !slotVal(seat.dataset.slot!)) { view.armSlot(seat.dataset.slot, seat); notify(); e.stopPropagation(); return }
  const cell = t.closest('[data-fill]') as HTMLElement | null
  if (cell && !seat) { view.armSlot(cell.dataset.fill, cell); notify(); e.stopPropagation() }
}

/* + Line, verbatim — a new formation on the day's LAST wave, seeded from the
   wave's last line so times carry over */
export function addLine(di: number) {
  const d = DAYS[di]; if (!d.waves || !d.waves.length) return toast('Add a wave first')
  const w = d.waves[d.waves.length - 1], last = w.formations[w.formations.length - 1] || { cs: 'NEW', msn: '-', to: '12:00', ld: '13:00' }
  w.formations.push({ cs: last.cs, msn: last.msn, to: last.to, ld: last.ld, aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] })
  markEdit(`ff:${di}.${d.waves.length - 1}.${w.formations.length - 1}.cs`)
  afterSchedMutate(); notify(); toast('Line added')
}

/* + Wave, verbatim */
export function addWave(di: number, kind: any) {
  const d = DAYS[di]; if (!d) return
  d.waves = d.waves || []
  if (!kind) {
    d.waves.push({ label: 'WAVE ' + (d.waves.filter((w: any) => !isStandalone(w)).length + 1), night: false, intimes: [], traffic: [], formations: [{ cs: 'NEW', msn: '-', to: '12:00', ld: '13:00', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] }] })
    markEdit(`wl:${di}.${d.waves.length - 1}`); afterSchedMutate(); notify(); return toast('Wave added')
  }
  const w = makeStandalone(kind); if (!w) return
  d.waves.push(w)
  const S = SAWAVE[kind]
  if (S.duties) {
    d.dutywaves = d.dutywaves || []
    d.dutywaves.push({ label: S.label, noconf: true, rows: S.duties.map((r: any) => ({ role: r, id: '', str: S.dutyTime[0], end: S.dutyTime[1] })) })
  }
  markEdit(`wl:${di}.${d.waves.length - 1}`); afterSchedMutate(); notify()
  toast(S.label + ' added — standalone, ' + (S.all ? 'nothing on it is cross-checked' : 'SPARE is not cross-checked'))
}

/* the Add-a-wave chooser, verbatim (a body-level popup, just as the reference
   builds it — it lives outside the React tree and removes itself on any
   outside click) */
export function waveMenu(anchor: HTMLElement, di: any) {
  document.querySelectorAll('.wavemenu').forEach(x => x.remove())
  const box = document.createElement('div')
  box.className = 'wavemenu'
  const dayBtns = (di == null)
    ? `<h5>Day</h5><div class="wm-row" id="wmDays">`
      + DAYS.map((x: any, i: number) => `<button class="wm ${i === 0 ? 'on' : ''}" data-wmday="${i}" style="padding:6px 9px;font-size:11.5px">${esc(x.dow.slice(0, 3))}</button>`).join('')
      + `</div>` : ''
  box.innerHTML = dayBtns
    + `<h5>Add</h5><div class="wm-row">`
    + `<button class="wm" data-wmkind="">Flying wave</button>`
    + Object.keys(SAWAVE).map(k => `<button class="wm sa" data-wmkind="${k}">${SAWAVE[k].label}</button>`).join('')
    + `</div><div class="wm-note">SC · AVALON · BB sit outside the day's flying count — two waves of four plus an SC reads <b>4 X 4 / 2</b>.</div>`
  document.body.appendChild(box)
  const r = anchor.getBoundingClientRect()
  box.style.left = Math.max(8, Math.min(window.innerWidth - box.offsetWidth - 8, Math.round(r.left))) + 'px'
  box.style.top = Math.min(window.innerHeight - box.offsetHeight - 8, Math.round(r.bottom + 6)) + 'px'
  let day = (di == null) ? 0 : di
  box.addEventListener('click', (e: any) => {
    const dbtn = e.target.closest('[data-wmday]')
    if (dbtn) {
      day = +dbtn.dataset.wmday
      box.querySelectorAll('[data-wmday]').forEach(x => x.classList.toggle('on', x === dbtn))
      box.querySelectorAll('[data-wmday]').forEach((x: any) => x.style.borderColor = x === dbtn ? 'var(--accent)' : 'var(--edge)')
      e.stopPropagation(); return
    }
    const kbtn = e.target.closest('[data-wmkind]')
    if (kbtn) { addWave(day, kbtn.dataset.wmkind || null); box.remove(); e.stopPropagation() }
  })
  setTimeout(() => document.addEventListener('click', function off() { box.remove(); document.removeEventListener('click', off) }, { once: true }), 0)
}

/* the board layout choice survives closing and reopening it within a session */
export let SBWIDE = false
export function toggleWide() {
  SBWIDE = !SBWIDE
  toast(SBWIDE ? 'Desktop layout — pan sideways to read the whole day' : 'Phone layout')
}

/* day tab switch — setBoardDay carries the reference's cross-day disarm */
export function boardTab(n: number) { view.setBoardDay(n); validate(); notify() }

export function openScheduler(di: number) { view.setBoardDay(di); validate(); notify() }
export function closeScheduler() { view.setBoardDay(null); notify() }
