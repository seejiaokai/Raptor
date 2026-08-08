/* The scheduler board's HTML assembly (renderScheduler's board loop) and its
   delegated handlers — the reference's bodies, verbatim, with repaint via the
   store's notify(). The CX-with-a-reason dialog state lives here too. */
import { DAYS } from '../engine/data'
import { INPUTS, inputCoversDate } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { isStandalone, makeStandalone, SAWAVE } from '../engine/waves'
import { waveInTime } from '../engine/events'
import { WARN, validate, WCODE, wlbl } from '../engine/validate'
import { hhmm, minus, parseHM } from '../engine/time'
import { VCONF } from '../engine/rules'
import { slotVal, txtGet, txtSet, acRef, rollCx } from '../engine/slots'
import { markEdit, alAttr } from '../engine/publish'
import { shiftAircraft, shiftFormation, shiftWave, shiftKeys } from '../engine/keys'
import { signoffHTML, cxText, storesView } from './html'
import { STORE_CFG } from '../engine'
import { HOOKS } from '../engine/hooks'
import { canEditSched } from '../state/auth'
import * as view from '../state/view'
import { esc } from '../state/view'
import { notify } from '../state/store'
import { sbNotesPanel, sbProgPanel, sbSlot, sbDutyPanel, sbSimRowsPanel, sbGroundPanel, sbInputsGroupPanel, sbUnavailPanel, labelToTitle, titleToLabel } from './board-html'

const toast = (...a: any[]) => HOOKS.toast(...a)
const afterSchedMutate = () => view.afterSchedMutate()

/* renderScheduler's board string, verbatim. pv = published-version preview:
   read-only markup throughout, and no sign-off bar — the frozen record's
   signatures live on the AL record; live sign selects against an old day
   would invite edits against the wrong document. */
export function boardHTML(di: number, pv?: boolean) {
  const d = DAYS[di]
  /* the stores chips/C follow HOOKS.editMode(), not just pv: the board is a
     modal that stays open across a nav click (SchedBoard's `hidden` only
     tracks SBDAY, never CURPAGE), so a duty crew on View-only Sched who
     still has a board open from earlier must see the same read-only chips
     the week shows them there. editMode() — not a bare CURPAGE test — so
     the render gate is EXACTLY the click gate interactions.ts already uses
     for data-store/data-stcfg (canEditSched() && CURPAGE==='editsched' &&
     EDITON): a CURPAGE-only test would still render the clickable chips
     and the contenteditable bombs field with EDITON off, and routeFocusOut
     (textedit.ts) checks only canEditSched() — so a blur on that field
     would commit and markEdit in a state the week would never have
     rendered the field in at all. */
  const stoRO = pv || !HOOKS.editMode()
  let b = (pv ? '' : `<div class="signoff board-sign" id="sbSignBar">${signoffHTML(di, true)}</div>`)
    + sbNotesPanel(d, di, pv) + sbProgPanel(d, di, pv)
  let fly = ''
  ;(d.waves || []).forEach((w: any, gi: number) => {
    /* SC / AVALON / BB carry no store config on the week (html.ts's `sa`
       gate — a standalone line isn't a real jet loadout, it's a duty
       roster row wearing the flying-line template) — mirror that here so
       a store set from the board on a standalone line can't reach the AL
       and the CSV while staying permanently invisible/unremovable on the
       week, which the design spec requires to render identically on both
       surfaces. */
    const sa = isStandalone(w)
    const asd = w.formations.reduce((n: number, f: any) => n + f.aircraft.length, 0)
    const opts = ['1st wave', '2nd wave', '3rd wave', '4th wave', '5th wave', 'Night wave']
    const cur = labelToTitle(w); if (!opts.includes(cur)) opts.unshift(cur)
    const inT = waveInTime(w)
    fly += `<div class="sb-go"><div class="sb-go-h"><span>Go ${gi + 1}</span>`
      + `<select class="sb-wtitle" aria-label="Wave" data-wsel="${di}.${gi}"${pv ? ' disabled' : ''}>${opts.map(o => `<option ${o === cur ? 'selected' : ''}>${o}</option>`).join('')}</select>`
      + `${w.night ? '<span class="night">· night</span>' : ''}`
      + `<span class="asd">in-time ${inT != null ? hhmm(inT) : '—'} · ${asd} ac</span>`
      + (pv ? '' : `<span class="gctl"><button class="mbtn add" data-gline="${di}.${gi}" title="Add a line to this wave">+ Line</button>`
      + `<button class="mbtn del" data-gdel="${di}.${gi}" title="Remove this whole wave">✕ Wave</button></span>`) + `</div>`
    fly += `<div class="sb-lcols"><span>CS</span><span>MSN</span><span>B</span><span>TO</span><span>LD</span><span>FCP</span><span>RCP</span><span>Notes</span><span></span></div>`
    if (!w.formations.length) fly += `<div class="sb-empty" style="padding:6px 11px">Empty wave — add a line, or remove the wave.</div>`
    w.formations.forEach((f: any, li: number) => f.aircraft.forEach((a: any, ai: number) => {
      const key = `${di}.${gi}.${li}.${ai}`, fp = `ff:${di}.${gi}.${li}`
      const cxOn = !!(a.cx || f.cx)
      const dis = pv ? ' disabled' : ''
      /* B (owner, 6 Aug 26), same funnel key and suggestion idiom as the
         week (ui/html.ts): data-bfld already flows through boardChange's
         generic txtSet path below, no new wiring needed. Wrapped so the
         optional ghost never changes this row's grid-item count — see the
         mobile column notes in scheduler.css. */
      const brief = minus(f.to, VCONF.briefLead)
      const brSug = (!pv && parseHM(f.br) == null)
        ? `<span class="bsug" data-bacc="${fp}.br" data-bval="${brief}" title="Click to accept the suggested brief time">${brief}</span>`
        : ''
      fly += `<div class="sb-line${cxOn ? ' cx' : ''}${a.flag ? ' redbox' : ''}">
        <input class="lin" data-bfld="${fp}.cs"${alAttr(`${fp}.cs`)}${dis} value="${esc(f.cs)}">
        <input class="msn" data-bfld="${fp}.msn"${alAttr(`${fp}.msn`)}${dis} value="${esc(f.msn)}">
        <div class="sb-bcell">${brSug}<input class="tm" data-bfld="${fp}.br"${alAttr(`${fp}.br`)}${dis} placeholder="B" value="${esc(f.br || '')}"></div>
        <input class="tm" data-bfld="${fp}.to"${alAttr(`${fp}.to`)}${dis} value="${esc(f.to)}">
        <input class="tm" data-bfld="${fp}.ld"${alAttr(`${fp}.ld`)}${dis} value="${esc(f.ld)}">
        ${sbSlot(di, key + '.p', 'p', a.p, pv)}
        ${sbSlot(di, key + '.w', 'w', a.w, pv)}
        <div class="sb-rcell"${alAttr(`st:${key}`)}>
          <input class="nts" data-bfld="fr:${key}"${alAttr(`fr:${key}`)}${dis} value="${esc(a.rmks || '')}">
          ${sa ? '' : (stoRO
            ? storesView(a.opts)
            : `<span class="stores">`
              /* labels are user-renamable text (stores-edit.test.tsx's escape
                 regression) — esc() here, same as html.ts's identical on-chip,
                 or a renamed store types markup on the board same as the week
                 used to before that fix. */
              + STORE_CFG.filter(([k]: any) => (a.opts || {})[k]).map(([k, lab]: any) =>
                  `<span class="stchip on" data-store="${key}.${k}" title="Remove ${esc(lab)}">${esc(lab)}</span>`).join('')
              + `<button class="stcfg" data-stcfg="${key}" title="Stores configuration">C</button>`
              + `<span class="bombs" contenteditable="true" data-bombs="${key}">${esc((a.opts || {}).bombs || '')}</span></span>`)}
        </div>
        ${pv ? '' : `<span class="lctl">
          <button class="mbtn${cxOn ? ' on' : ''}" data-lcx="${key}" title="${cxOn ? 'Restore this line' : 'Cancel this line (CX)'}">CX</button>
          <button class="mbtn red${a.flag ? ' on' : ''}" data-lflag="${key}" title="${a.flag ? 'Clear the red box' : 'Red box — flag this for the next scheduler'}">■</button>
          <button class="mbtn add" data-lac="${di}.${gi}.${li}" title="Add another aircraft to this formation">+</button>
          <button class="mbtn del" data-ldel="${key}" title="Remove this line">✕</button>
        </span>`}
      </div>`
    }))
    fly += `</div>`
  })
  b += fly || `<div class="sb-empty" style="padding:14px 11px">No flying waves yet — use “+ Wave”.</div>`
  /* the four sections the board was missing (owner request, Aug 26): same
     order as the week day, with the sim planning notes staying last */
  /* the sim note used to be a panel of its own at the very bottom; it now sits
     inside the Sims panel, so the board reads the same way the week does. */
  b += sbDutyPanel(d, di, pv) + sbSimRowsPanel(d, di, pv) + sbGroundPanel(d, di, pv)
  /* one pass over INPUTS for both blocks — the board rebuilds on every edit */
  const dayInp = INPUTS.filter((i: any) => inputCoversDate(i, d.dt))
  b += sbInputsGroupPanel(d, di, pv, dayInp) + sbUnavailPanel(d, di, dayInp)
  return b
}

export function boardWarnHTML(di: number) {
  const d = DAYS[di]
  const dw = (WARN.byDay[di] && WARN.byDay[di].warns) || []
  let wh = `<div class="wh">Live checks · ${dw.length} for ${esc(d.dow)}</div>`
  if (dw.length) {
    /* Iterate WARN's own array, unsorted: validate() has already ordered it by
       SORD (hard, adv, note), so the local hard-first sort this used to do was a
       second copy of ordering the engine owns — and re-ordering would break the
       index these rows now carry. Same order as the week's .dwlist, which also
       iterates as stored; the two lists could previously disagree. */
    dw.forEach((w: any, ix: number) => {
      const names = (w.who || []).map((id: any) => PEOPLE[id] ? PEOPLE[id].cs : id).join(', ')
      /* the selected state goes in the STRING, not on a class painted later:
         SchedBoard diffs this html against the last one to decide whether to
         re-hang the panel, so a class added afterwards is lost on the next
         unrelated repaint */
      const on = view.WFOCUS && view.WFOCUS.di === di && view.WFOCUS.ix === ix ? ' on' : ''
      wh += `<div class="wln ${w.sev}${on}" data-wdi="${di}" data-wix="${ix}" title="Jump to the puck that caused this">${esc(names)}${names ? ' — ' : ''}${esc(wlbl(w.msg || WCODE[w.code] || w.code || ''))}</div>`
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
  /* previewing a published version: the panels render no controls, but a stale
     element from the pre-preview markup must not mutate the live day */
  if (view.DPREV.has(view.SBDAY as any)) return
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
  /* ---- duty / sim / ground rows (the panels added Aug 26) ---------------
     Same shapes as the p* programme branches: adds mark the new row's name
     key, deletes renumber the surviving keys and mark NOTHING (the delete
     rule), CX goes through the reason dialog. */
  if (ds.dwadd != null) {
    const d = DAYS[+ds.dwadd]; d.dutywaves = d.dutywaves || []
    d.dutywaves.push({ label: 'DUTY', rows: [{ role: '', id: '', str: '', end: '' }] })
    markEdit(`dl:${+ds.dwadd}.${d.dutywaves.length - 1}`); afterSchedMutate(); notify(); return
  }
  if (ds.dwdel != null) {
    const [di, wi] = ds.dwdel.split('.').map(Number)
    DAYS[di].dutywaves.splice(wi, 1)
    ;[`d:${di}.`, `dr:${di}.`, `dl:${di}.`].forEach(h => shiftKeys(h, 0, wi))
    markEdit(); afterSchedMutate(); notify(); return toast('Duty block removed')
  }
  if (ds.dradd != null) {
    const [di, wi] = ds.dradd.split('.').map(Number)
    const rows = DAYS[di].dutywaves[wi].rows
    rows.push({ role: '', id: '', str: '', end: '' })
    markEdit(`dr:${di}.${wi}.${rows.length - 1}.role`); afterSchedMutate(); notify(); return
  }
  if (ds.drdel != null) {
    const [di, wi, ri] = ds.drdel.split('.').map(Number)
    DAYS[di].dutywaves[wi].rows.splice(ri, 1)
    ;[`d:${di}.${wi}.`, `dr:${di}.${wi}.`].forEach(h => shiftKeys(h, 0, ri))
    markEdit(); afterSchedMutate(); notify(); return toast('Duty row removed')
  }
  if (ds.drcx != null) { const [di, wi, ri] = ds.drcx.split('.').map(Number); return askCx(DAYS[di].dutywaves[wi].rows[ri], `dr:${di}.${wi}.${ri}.role`, 'this duty') }
  if (ds.drflag != null) {
    const [di, wi, ri] = ds.drflag.split('.').map(Number); const x = DAYS[di].dutywaves[wi].rows[ri]
    x.flag = !x.flag; markEdit(`dr:${di}.${wi}.${ri}.role`); afterSchedMutate(); notify()
    return toast(x.flag ? 'Red box — flagged for the next scheduler' : 'Red box cleared')
  }
  if (ds.sradd != null) {
    const [di, kind] = ds.sradd.split('.')
    const d = DAYS[+di]; d.sims = d.sims || {}
    const rows = (d.sims[kind] = d.sims[kind] || [])
    rows.push({ label: '', str: '', end: '' })
    markEdit(`sr:${+di}.${kind}.${rows.length - 1}.label`); afterSchedMutate(); notify(); return
  }
  if (ds.srdel != null) {
    const [di, kind, ri] = ds.srdel.split('.')
    DAYS[+di].sims[kind].splice(+ri, 1)
    ;[`s:${di}.${kind}.`, `sr:${di}.${kind}.`].forEach(h => shiftKeys(h, 0, +ri))
    markEdit(); afterSchedMutate(); notify(); return toast('Sim row removed')
  }
  if (ds.srcx != null) { const [di, kind, ri] = ds.srcx.split('.'); return askCx(DAYS[+di].sims[kind][+ri], `sr:${di}.${kind}.${ri}.label`, 'this sim') }
  if (ds.srflag != null) {
    const [di, kind, ri] = ds.srflag.split('.'); const x = DAYS[+di].sims[kind][+ri]
    x.flag = !x.flag; markEdit(`sr:${di}.${kind}.${ri}.label`); afterSchedMutate(); notify()
    return toast(x.flag ? 'Red box — flagged for the next scheduler' : 'Red box cleared')
  }
  if (ds.gradd != null) {
    const d = DAYS[+ds.gradd]; d.ground = d.ground || []
    d.ground.push({ prog: '', str: '', end: '', who: '' })
    markEdit(`gr:${+ds.gradd}.${d.ground.length - 1}.prog`); afterSchedMutate(); notify(); return
  }
  if (ds.grdel != null) {
    const [di, ri] = ds.grdel.split('.').map(Number)
    DAYS[di].ground.splice(ri, 1)
    ;[`g:${di}.`, `gr:${di}.`].forEach(h => shiftKeys(h, 0, ri))
    markEdit(); afterSchedMutate(); notify(); return toast('Ground item removed')
  }
  if (ds.grcx != null) { const [di, ri] = ds.grcx.split('.').map(Number); return askCx(DAYS[di].ground[ri], `gr:${di}.${ri}.prog`, 'this item') }
  if (ds.grflag != null) {
    const [di, ri] = ds.grflag.split('.').map(Number); const x = DAYS[di].ground[ri]
    x.flag = !x.flag; markEdit(`gr:${di}.${ri}.prog`); afterSchedMutate(); notify()
    return toast(x.flag ? 'Red box — flagged for the next scheduler' : 'Red box cleared')
  }
}

/* the board field-change handler (through the text funnel) */
export function boardChange(e: Event) {
  if (view.DPREV.has(view.SBDAY as any)) return   // same stale-markup guard as boardMbtn
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
  if (view.DPREV.has(view.SBDAY as any)) return   // same stale-markup guard as boardMbtn
  const t = e.target as HTMLElement
  if (t.closest('.puck[data-person]')) return
  const empty = t.closest('.sb-slot.empty[data-slot]') as HTMLElement | null
  if (empty) { view.armSlot(empty.dataset.slot, empty); notify(); e.stopPropagation(); return }
  const seat = t.closest('.seat[data-slot]') as HTMLElement | null
  /* same armed-element escape as routeClick: a seat armed while empty, then
     filled by drag, must still answer the put-me-down tap */
  if (seat && (view.armedKey() === seat.dataset.slot || !slotVal(seat.dataset.slot!))) { view.armSlot(seat.dataset.slot, seat); notify(); e.stopPropagation(); return }
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
  /* The stores popup (interactions.ts's openStoresMenu) shares this class
     for its look, and it keeps a NOT-{once:true} click listener attached
     to document that only it knows how to unhook (_offClick) — its
     outside-click handler declines clicks inside its box and the one click
     a press that began inside dispatches outside, so pulling its box out
     from under it here, the same way it pulls out any of ITS OWN stale
     popups, would leave that listener attached to document with no box to
     ever remove it through. */
  document.querySelectorAll('.wavemenu').forEach(x => {
    const off = (x as any)._offClick
    if (off) document.removeEventListener('click', off)
    x.remove()
  })
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
/* Done/Close also parks the aircrew drawer: ros-open is a body class shared
   with the edit week's own drawer, and leaving it set would surprise-open
   the week's palette the moment the board lifts (owner's one-window phone
   board, 8 Aug 26). The week's tab is right there to reopen it. */
export function closeScheduler() { view.setBoardDay(null); document.body.classList.remove('ros-open'); notify() }
