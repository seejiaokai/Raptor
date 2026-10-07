/* walker A — shared helpers for [BLANK-TIMES-ABSENCE] (D605) walk, on top of rbl-C-lib. Every fixture goes through the app's
   own controls: the Inputs page form, + Wave / + Line / + Block / + Row / + Item, the text boxes, the crew list. */
import './bta-env.mjs'
import * as C from './rbl-C-lib.mjs'
export * from './rbl-C-lib.mjs'
const { K, B, L, W, TUE, MON, ID, CSN, sleep } = C
export const WED = 2

/* ---------- filing X's absence for Tuesday through the Inputs page ---------- */
export async function fileType(p, type, { remarks = null } = {}) {
  const rm = remarks == null ? 'x-' + type : remarks
  if (type === 'Upchit') {
    /* an Upchit needs a downchit to lift: ATT C Mon–Wed, then the Upchit effective Tuesday */
    await fileRange(p, 'ATT C', MON, WED, 'ATT C Mon-Wed')
    const f = await C.fileInput(p, { type: 'Upchit', di: TUE, allday: true, remarks: rm })
    /* an Upchit asks its own question first: "Saving this upchit will …" — take its plan (Remove any leftovers), press "Save upchit" */
    let sheet = null
    const up = p.locator('[data-testid="upconf"]:visible')
    if (await up.count()) {
      sheet = (await up.innerText()).replace(/\s+/g, ' ').slice(0, 300)
      for (const b of await p.locator('[data-testid^="upconf-left-"] button:has-text("Remove")').all()) await b.click().catch(() => {})
      await sleep(200)
      await p.locator('[data-testid="upconf-save"]').click(); await sleep(800)
    }
    const after = await p.evaluate(who => window.INPUTS.filter(x => JSON.stringify(x).includes(who)).map(x => JSON.stringify(x).replace(/"(iid|who|pid|by|at|doc)[^,]*,?/g, '').slice(0, 140)).join(' | '), ID)
    return { iid: f.iid, asked: f.asked, note: `ATT C Mon–Wed filed first, then Upchit effective Tue; its sheet said "${sheet}"; his inputs after: ${after}` }
  }
  if (type === 'SANS Availability') {
    const f = await C.fileInput(p, { type, di: TUE, allday: true, sans: [0, 1, 2], remarks: rm })
    return { iid: f.iid, asked: f.asked, note: 'FLY, AMT and OFT ticked' }
  }
  const f = await C.fileInput(p, { type, di: TUE, allday: true, remarks: rm })
  return { iid: f.iid, asked: f.asked, clash: f.clash }
}
/* a range of days: first click the start day, then the end day, on the Inputs page's own calendar */
export async function fileRange(p, type, d0, d1, remarks = '') {
  await B.toEdit(p)
  if (await p.locator('#schedBoard:visible').count()) await W.boardOff(p)
  if ((await p.evaluate(() => window.CURPAGE)) !== 'inputs') await L.go(p, 'inputs')
  await p.waitForSelector('#inRangeBtn', { timeout: 8000 })
  const before = await p.evaluate(() => window.INPUTS.map(x => x.iid))
  await p.selectOption('#inPerson', ID)
  await p.selectOption('#inType', type)
  const iso = d => `2026-07-${String(13 + d).padStart(2, '0')}`
  await p.locator(`#inCal [data-cal="${iso(d0)}"]`).first().click(); await sleep(140)
  await p.locator(`#inCal [data-cal="${iso(d1)}"]`).first().click(); await sleep(140)
  if (await p.locator('#inAllday').count() && !(await p.locator('#inAllday').isChecked())) await p.locator('#inAllday').click()
  await p.locator('#inRemarks').fill(remarks)
  await p.locator('#inAdd').click(); await sleep(700)
  for (let i = 0; i < 3; i++) {
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible')
    if (await nodoc.count()) { await nodoc.click(); await sleep(500); continue }
    break
  }
  return p.evaluate(ids => { const s = new Set(ids); return window.INPUTS.filter(x => !s.has(x.iid)).map(x => x.iid)[0] || null }, before)
}
export const inputsOfX = p => p.evaluate(who => window.INPUTS.filter(x => x.who === who || x.pid === who || x.person === who || x.id === who).map(x => `${x.type} ${x.allday ? 'allday' : x.s + '-' + x.e} d${x.d ?? x.day ?? '?'}${x.status ? ' ' + x.status : ''}`), ID)

/* ---------- the seat families ---------- */
const clearBox = async (p, key) => { await W.boardText(p, key, '') }
async function rowAdd(p, spec, di) {
  await K.boardTo(p, di)
  const n0 = await p.locator(`#schedBoard ${spec.count}`).count()
  const b = p.locator(`#schedBoard ${spec.add}`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(700)
  const ri = (await p.locator(`#schedBoard ${spec.count}`).count()) - 1
  if (ri < n0) throw new Error('+ Row added nothing for ' + spec.add)
  return ri
}
const rowSpec = {
  duty: di => ({ add: `[data-dradd="${di}.0"]`, count: `[data-bfld^="dr:${di}.0."][data-bfld$=".role"]`, box: (ri, f) => `dr:${di}.0.${ri}.${f}`, seat: ri => `d:${di}.0.${ri}.+`, name: 'role', label: 'duty row' }),
  oft: di => ({ add: `[data-sradd="${di}.oft"]`, count: `[data-bfld^="sr:${di}.oft."][data-bfld$=".label"]`, box: (ri, f) => `sr:${di}.oft.${ri}.${f}`, seat: ri => `s:${di}.oft.${ri}.${C.SEAT}`, name: 'label', label: 'sim (OFT) row' }),
  amt: di => ({ add: `[data-sradd="${di}.amt"]`, count: `[data-bfld^="sr:${di}.amt."][data-bfld$=".label"]`, box: (ri, f) => `sr:${di}.amt.${ri}.${f}`, seat: ri => `s:${di}.amt.${ri}.+`, name: 'label', label: 'sim (AMT) row' }),
  ground: di => ({ add: `[data-gradd="${di}"]`, count: `[data-bfld^="gr:${di}."][data-bfld$=".prog"]`, box: (ri, f) => `gr:${di}.${ri}.${f === 'role' || f === 'label' ? 'prog' : f}`, seat: ri => `g:${di}.${ri}.+`, name: 'prog', label: 'Ground Programme row' }),
  prog: di => ({ add: `[data-padd="${di}"]`, count: `[data-bfld^="ap:${di}."][data-bfld$=".prog"]`, box: (ri, f) => `ap:${di}.${ri}.${f === 'role' || f === 'label' ? 'prog' : f}`, seat: ri => `a:${di}.${ri}.+`, name: 'prog', label: 'Common Programme row' }),
}
/* the box key for the name field of each kind */
const nameKey = (kind, spec, ri) => spec.box(ri, spec.name)

/* a duty block made from a template whose "For wave" is BB (the ✎ in the "+ Block" picker → + New → For wave BB) */
export async function makeBBTemplate(p, di = TUE, title = 'BB DESK') {
  await K.boardTo(p, di)
  const b = p.locator(`#schedBoard [data-dwadd="${di}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(450)
  await p.locator('[data-blkedit]').first().click(); await sleep(600)
  await p.locator('#tplModal .tpl-tab.new').click(); await sleep(300)
  await p.locator('#tplModal .tpl-name').fill(title); await sleep(200)
  await p.locator('#tplModal .tpl-wave select').selectOption('bb'); await sleep(300)
  const note = await p.locator('#tplModal .tpl-wave-note').innerText()
  const shot = await C.pic(p, 'tpl-editor-bb')
  await p.locator('#tplClose').click(); await sleep(500)
  return { note, shot }
}
async function addBBDeskBlock(p, di, title = 'BB DESK') {
  await K.boardTo(p, di)
  const n0 = await p.evaluate(i => window.DAYS[i].dutywaves.length, di)
  const b = p.locator(`#schedBoard [data-dwadd="${di}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(450)
  const t = p.locator('[data-blktpl]').filter({ hasText: title }).first()
  if (!(await t.count())) throw new Error('no template "' + title + '" in the + Block picker')
  await t.click(); await sleep(800)
  const n1 = await p.evaluate(i => window.DAYS[i].dutywaves.length, di)
  if (n1 <= n0) throw new Error('+ Block added no block')
  return n1 - 1
}

/* build a family's seat (no times, no name where the control makes it so). Returns an object with the seat key and how to type / clear times. */
export async function build(p, fam, di = TUE, { bbTitle = 'BB DESK' } = {}) {
  const hold = {}
  if (fam === 'fly') {
    const m = await K.addFlyWave(p, di)
    const key = `${di}.${m.gi}.0.0.${C.SEAT}`
    Object.assign(hold, { key, label: 'a new flying line (+ Wave → Flying wave)', gi: m.gi,
      type: async () => { await K.ff(p, di, m.gi, 0, 'to', '10:00'); await K.ff(p, di, m.gi, 0, 'ld', '11:00') },
      clear: async () => { await K.ff(p, di, m.gi, 0, 'to', ''); await K.ff(p, di, m.gi, 0, 'ld', '') },
      state: () => p.evaluate(([i, g]) => { const x = window.DAYS[i].waves[g].formations[0]; return `cs "${x.cs}" take-off "${x.to}" landing "${x.ld}"` }, [di, m.gi]) })
    return hold
  }
  if (fam === 'scMain' || fam === 'scSpare' || fam === 'bbMain' || fam === 'bbSpare' || fam === 'avMain' || fam === 'avSpare') {
    const kind = fam.slice(0, 2) === 'sc' ? 'sc' : fam.slice(0, 2) === 'bb' ? 'bb' : 'avalon'
    const m = await K.addStandby(p, di, kind)
    const ai = /Spare/.test(fam) ? 2 : 0
    const key = `${di}.${m.gi}.0.${ai}.${C.SEAT}`
    if (kind !== 'bb') { await K.ff(p, di, m.gi, 0, 'to', ''); await K.ff(p, di, m.gi, 0, 'ld', '') }   /* SC / AVALON arrive with shift times: clear them; BB comes up blank */
    Object.assign(hold, { key, label: `${kind.toUpperCase()} ${/Spare/.test(fam) ? 'SPARE' : 'MAIN'} seat (+ Wave → ${kind.toUpperCase()}, shift start and end ${kind === 'bb' ? 'as it comes up' : 'cleared'})`, gi: m.gi,
      type: async () => { await K.ff(p, di, m.gi, 0, 'to', '08:00'); await K.ff(p, di, m.gi, 0, 'ld', '12:00') },
      clear: async () => { await K.ff(p, di, m.gi, 0, 'to', ''); await K.ff(p, di, m.gi, 0, 'ld', '') },
      state: () => p.evaluate(([i, g]) => { const x = window.DAYS[i].waves[g].formations[0]; return `shift start "${x.to}" end "${x.ld}" B "${x.br || ''}"` }, [di, m.gi]) })
    return hold
  }
  if (fam === 'bbDesk') {
    const blk = await addBBDeskBlock(p, di, bbTitle)
    const ri = 0
    Object.assign(hold, { key: `d:${di}.${blk}.${ri}.+`, label: 'a BB desk (+ Block from a template whose "For wave" is BB; its one row has no role, no times)',
      type: async () => { await K.boardTo(p, di); await W.boardText(p, `dr:${di}.${blk}.${ri}.str`, '08:00'); await W.boardText(p, `dr:${di}.${blk}.${ri}.end`, '12:00') },
      clear: async () => { await K.boardTo(p, di); await W.boardText(p, `dr:${di}.${blk}.${ri}.str`, ''); await W.boardText(p, `dr:${di}.${blk}.${ri}.end`, '') },
      setName: async v => { await K.boardTo(p, di); await W.boardText(p, `dr:${di}.${blk}.${ri}.role`, v) },
      state: () => p.evaluate(([i, b, r]) => { const w = window.DAYS[i].dutywaves[b]; const x = w.rows[r]; return `block "${w.label}" row role "${x.role}" start "${x.str}" end "${x.end}"` }, [di, blk, ri]) })
    return hold
  }
  const kind = { duty: 'duty', sim: 'oft', oft: 'oft', amt: 'amt', ground: 'ground', prog: 'prog' }[fam]
  const spec = rowSpec[kind](di)
  const ri = await rowAdd(p, spec, di)
  const get = async () => {
    if (kind === 'duty') return p.evaluate(([i, r]) => { const x = window.DAYS[i].dutywaves[0].rows[r]; return x ? `role "${x.role || ''}" start "${x.str || ''}" end "${x.end || ''}" who "${x.id || ''}"` : 'no row' }, [di, ri])
    if (kind === 'oft' || kind === 'amt') return p.evaluate(([i, k, r]) => { const x = window.DAYS[i].sims[k][r]; return x ? `label "${x.label || ''}" start "${x.str || ''}" end "${x.end || ''}" p "${x.p || ''}" w "${x.w || ''}" who "${x.who || ''}"` : 'no row' }, [di, kind, ri])
    if (kind === 'ground') return p.evaluate(([i, r]) => { const x = window.DAYS[i].ground[r]; return x ? `name "${x.prog || ''}" start "${x.str || ''}" end "${x.end || ''}" who "${x.who || ''}"` : 'no row' }, [di, ri])
    return p.evaluate(([i, r]) => { const x = window.DAYS[i].allhands[r]; return x ? `name "${x.prog || ''}" start "${x.str || ''}" end "${x.end || ''}" who "${x.who || ''}" crowd ${JSON.stringify(x.crowd || x.ids || null)}` : 'no row' }, [di, ri])
  }
  Object.assign(hold, { key: spec.seat(ri), label: `a new ${spec.label} ("+ ${kind === 'ground' || kind === 'prog' ? 'Item' : 'Row'}")`, ri, kind, spec,
    type: async () => { await K.boardTo(p, di); await W.boardText(p, spec.box(ri, 'str'), '08:00'); await W.boardText(p, spec.box(ri, 'end'), '12:00') },
    clear: async () => { await K.boardTo(p, di); await W.boardText(p, spec.box(ri, 'str'), ''); await W.boardText(p, spec.box(ri, 'end'), '') },
    setName: async v => { await K.boardTo(p, di); await W.boardText(p, nameKey(kind, spec, ri), v) },
    state: get })
  return hold
}
/* if a fresh row comes up with times in it, clear them first, say so */
export async function blankIt(p, h) {
  const st = await h.state()
  if (/start "[^"]+"|end "[^"]+"/.test(st)) { await h.clear(); return { cleared: true, was: st } }
  return { cleared: false, was: st }
}

/* put X on the seat: arm it, press his name. Returns { took, msg, strike } */
export async function putX(p, h, di = TUE) {
  await K.boardTo(p, di)
  const armed = await C.armSeat(p, h.key)
  const r = await C.rosterX(p)
  const row = await C.crewListRow(p)
  const toast = await C.pressName(p)
  const holds = await p.evaluate(k => { const b = document.querySelector('#schedBoard'); const host = b.querySelector(`[data-slot="${k}"]`) || b.querySelector(`[data-fill="${k}"]`); return host ? [...host.querySelectorAll('[data-person]')].map(e => e.dataset.person) : [] }, h.key)
  return { armed, r, row, toast, took: holds.includes(ID), holds }
}

/* ---------- what a person sees ---------- */
const ABS_RE = /leave|Downchit|but tasked|but planned|but on BB|clashes with|standing SC SPARE|also down for|medically|overseas/i
/* pics: true = the day's list AND his puck; 'list' = the day's list only; false = none */
export async function read(p, tag, { pics = true, di = TUE } = {}) {
  const s = await C.seeWeek(p, di, tag, { prev: -1, noPics: pics !== true })
  if (pics === 'list') s.pics = [await K.picEl(p, `#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`, tag + '-list', { pad: 8, maxH: 700 })]
  const lines = (s.list.full || []).filter(x => x.text.includes(CSN)).map(x => ({ sev: x.sev, hid: x.hid, text: x.text.replace(/ ✕| ↺/g, '') }))
  const abs = s.held.filter(w => !w.off && ABS_RE.test(w.msg))
  /* the ring on the seat he was put on — his own copy on the Unavailable row also rings and is read apart */
  const seat = s.pk.filter(x => x.where !== 'Unavailable row')
  return { held: s.held, abs, lines, absLines: lines.filter(l => ABS_RE.test(l.text)), pk: s.pk, bar: s.list.bar, pics: s.pics, ring: seat.some(x => x.solid), ringAny: s.pk.some(x => x.solid), chip: seat.map(x => x.chip).filter(Boolean).join(','), amber: seat.some(x => /\badv\b|amber/.test(x.cls)) }
}
export const heldSay = s => s.held.length ? s.held.map(w => `${w.sev}/${w.code}${w.off ? '/HIDDEN' : ''}: ${w.msg}`).join(' || ') : 'no warning naming him'
export const say = s => `warnings naming him: ${s.abs.length ? s.abs.map(w => `[${w.sev}/${w.code}] "${w.msg}"`).join(' || ') : (s.held.length ? 'none absence-type (other: ' + s.held.map(w => w.code).join(',') + ')' : 'none')} · his pucks [${C.pk2(s.pk)}]${s.pk.length ? ' cls ' + s.pk.map(x => x.cls.split(' ').filter(c => /warn|hard|adv|note|box/.test(c)).join('.')).join(' ; ') : ''} · day's bar "${s.bar}"`

/* ---------- the oracle ---------- */
const OTHER = ['duty', 'sim', 'oft', 'amt', 'ground', 'prog']
const COCKPIT_BB = ['bbMain', 'bbSpare', 'avMain', 'avSpare']
export function famGroup(fam) { return fam === 'fly' ? 'fly' : fam === 'scMain' ? 'scMain' : fam === 'scSpare' ? 'scSpare' : COCKPIT_BB.includes(fam) ? 'bbCock' : fam === 'bbDesk' ? 'bbDesk' : 'other' }
const T_LEAVE = ['LL', 'OIL', 'CCL', 'PL', 'FCL', 'EL', 'CL'], T_MED = ['HL', 'OML', 'ATT C'], T_ACT = ['Training', 'CSE', 'Fly with', 'Personal', 'Appointment', 'Duty', 'Other']
/* the oracle table cell: 'silent' | 'red' | 'amber' */
export function oracle(type, fam) {
  const g = famGroup(fam)
  if (type === 'SANS Availability' || type === 'Upchit') return 'silent'
  if (T_LEAVE.includes(type)) return g === 'fly' || g === 'scMain' || g === 'other' ? 'red' : 'silent'
  if (type === 'OL') return 'red'
  if (T_MED.includes(type)) return 'red'
  if (type === 'ATT B') return g === 'other' || g === 'bbDesk' ? 'silent' : 'red'
  if (type === 'OD') return 'red'
  if (T_ACT.includes(type)) return g === 'fly' || g === 'scMain' || g === 'other' ? 'red' : 'silent'
  if (type === 'Meeting') return g === 'fly' || g === 'other' ? 'red' : g === 'scMain' ? 'amber' : 'silent'
  return 'silent'
}
/* the sentence the oracle says, per family group and kind of input */
export function sentenceRe(type, fam) {
  const g = famGroup(fam)
  /* the screen's words per input: "OL but on BB SHIFT — overseas — reason: …" / "… — medically down …" */
  if (g === 'bbCock') return /but on (BB|AVALON) .* — (overseas|medically down)/
  if (g === 'bbDesk') return /but on .* — (overseas|medically down)/
  if (g === 'scSpare') return /but standing SC SPARE/
  if (g === 'scMain' && type === 'Meeting') return /is on SC .* and also down for Meeting/
  const leave = T_LEAVE.includes(type) || type === 'OL'
  const med = T_MED.includes(type) || type === 'ATT B'
  if (g === 'fly') return leave ? /On leave but planned to fly/ : med ? /Downchit but planned to fly/ : /clashes with/
  return leave ? /On leave but tasked — / : med ? /Downchit but tasked — / : /but tasked — /
}
/* a verdict for one read: PASS / FAIL, and why */
export function judge(type, fam, s) {
  const exp = oracle(type, fam)
  const bad = /NaN|undefined|Infinity/.test(JSON.stringify(s.abs) + JSON.stringify(s.absLines))
  if (exp === 'silent') {
    const ok = s.abs.length === 0 && !bad   /* a ring from another cause (e.g. a SANS man seated with no IP) is not an absence ring */
    return { ok, exp, why: ok ? '' : `expected silence but ${s.abs.length} absence-type warning(s)` }
  }
  const re = sentenceRe(type, fam)
  const hit = s.abs.filter(w => re.test(w.msg))
  const inList = s.absLines.some(l => re.test(l.text))
  const redOk = exp === 'red' ? (hit.some(w => w.sev === 'hard') && s.ring) : (hit.some(w => w.sev !== 'hard') )
  const ok = hit.length >= 1 && inList && redOk && !bad && s.abs.length === hit.length
  return { ok, exp, why: ok ? '' : `expected ${exp} "${re.source}": got ${hit.length} matching, list ${inList ? 'has' : 'LACKS'} it, ring ${s.ring ? 'solid' : 'none'}, other abs ${s.abs.length - hit.length}${bad ? ', broken text' : ''}` }
}

/* the top bar's Undo / Redo (the week page's own bar) */
export async function undo(p) { await W.boardOff(p).catch(() => {}); await B.toEdit(p); return W.door(p, 'top', 'undo') }
export async function redo(p) { await W.boardOff(p).catch(() => {}); await B.toEdit(p); return W.door(p, 'top', 'redo') }
/* his own pucks on SEATS of the open board (not the crew list, not the Unavailable copy) */
export const seatsOfX = p => p.evaluate(who => [...document.querySelectorAll('#schedBoard [data-slot] .puck[data-person="' + who + '"]')].filter(e => e.offsetParent !== null).map(e => e.closest('[data-slot]').dataset.slot), ID)
