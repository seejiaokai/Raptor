/* [REST-BLANK-LINE] walker D — shared helpers (6 Oct 26). On top of stk-B-lib.mjs. Every gesture is the app's own control;
   window.* is read only to GET somewhere and to READ what the app holds. What a step asserts is what is PAINTED. */
import * as K from './stk-B-lib.mjs'
export * from './stk-B-lib.mjs'
const { B, L, W } = K
export const sleep = K.sleep
export const X = process.env.RBL_X || 'split'
export const MON = 0, TUE = 1, WED = 2, SUN = 6
export const PHONE = B.PHONE
export const SEAT = process.env.RBL_SEAT || 'p'   // Vandal is a pilot: the front seat; Cutter (a WSO) the back seat 'w'

/* ---------- what the app holds, in full words ---------- */
export async function held(p, di, id = X) {
  return p.evaluate(([i, who]) => ((window.WARN.byDay[i] || {}).warns || []).filter(w => (w.who || []).includes(who)).map(w => ({ sev: w.sev, code: w.code, off: !!w.off, msg: String(w.msg || '') })), [di, id])
}
/* every line of a day's list on the Edit Schedule week, in full, as painted (needs the list open) */
export async function listFull(p, di) {
  await B.openList(p, '#eWeek', di)
  return p.evaluate(i => {
    const day = document.querySelector(`#eWeek .day[data-day="${i}"]`); if (!day) return null
    const box = day.querySelector(`[data-dwbox="${i}"]`); if (!box) return { bar: '(no bar)', lines: [], other: [] }
    const bar = box.querySelector('.daywarn')
    const t = e => e.innerText.replace(/\s+/g, ' ').trim()
    return { bar: bar ? t(bar) : '(no bar)',
      lines: [...box.querySelectorAll('.witem[data-wix]')].map(e => { const w = e.querySelector('.wtx') || e.children[1]; return { ix: +e.dataset.wix, sev: ['hard', 'adv', 'note'].find(c => e.classList.contains(c)), hid: e.classList.contains('hid'), struck: getComputedStyle(w).textDecorationLine.includes('line-through'), text: t(e) } }),
      other: [...box.querySelectorAll('.dwlist > :not(.witem)')].map(t) }
  }, di)
}
/* every visible puck of a man in a scope, with the ring as painted (computed style) */
export async function paint(p, scope, id = X) {
  /* a newly raised flag PULSES for a moment (the .flagnew animation redraws the ring): read the resting ring, not the pulse */
  await p.waitForFunction(() => !document.querySelector('.puck.flagnew') || [...document.querySelectorAll('.puck.flagnew')].every(e => getComputedStyle(e).animationName === 'none'), null, { timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  return p.evaluate(([s, who]) => {
    const where = e => e.closest('.availwin') ? 'ALL AVAIL' : e.closest('#crewPal, .crewpal, .palette, .sb-side .ros, .sb-ros, .roster, #sbRoster') ? 'crew list' : e.closest('.avgrid, .avail, [data-avail]') ? 'Available' : e.closest('.sanscards, .sans') ? 'SANS' : e.closest('.unav, .unavail') ? 'Unavailable' : e.closest('.go, .sb-wave, .sb-line, .sb-go') ? 'flying' : e.closest('.duty, .sb-panel.duty, .dutyblk') ? 'duty' : e.closest('.sims, .sb-panel.sim') ? 'sim' : e.closest('.ground, .sb-panel.grnd') ? 'ground' : e.closest('.common, .sb-panel.prog') ? 'programme' : 'other'
    return [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)].filter(e => e.offsetParent !== null).map(e => {
      const c = getComputedStyle(e)
      return { where: where(e), warn: e.classList.contains('warn'), sev: ['hard', 'adv', 'note'].find(k => e.classList.contains(k)) || '',
        chip: ((e.querySelector('.lchip') || {}).innerText || '').trim(),
        solid: /\b2px\b/.test(c.boxShadow) && c.boxShadow !== 'none', dashed: c.outlineStyle === 'dashed', dotted: c.outlineStyle === 'dotted',
        ring: c.outlineStyle + ' ' + c.outlineWidth + ' | ' + c.boxShadow.slice(0, 60), cls: e.className }
    })
  }, [scope, id])
}
export const pk = ps => ps.length ? ps.map(x => `${x.where}:${x.solid ? 'SOLID-red' : x.dashed ? 'DASHED-red' : x.dotted ? 'DOTTED-red' : x.warn ? 'ring(' + x.sev + ')' : 'plain'}${x.solid && x.dotted ? '+DOTTED' : ''}${x.chip ? ' chip ' + x.chip : ''}`).join(', ') : '(none drawn)'

/* ---------- one look at the man's day, on the week: Tuesday's list + his pucks, Monday's pucks + its "Breaks" line ---------- */
/* an OPEN day list lights the crew of its warnings (.wfoc, drawn over the dotted / dashed rings): read the RESTING rings with the
   list shut, then open it for the words. */
export async function closeList(p, di, surf = '#eWeek') {
  const open = await p.evaluate(([s, i]) => { const b = document.querySelector(`${s} .day[data-day="${i}"] [data-dwbox="${i}"]`); return b ? b.classList.contains('open') : false }, [surf, di])
  if (open) { const bar = p.locator(`${surf} .day[data-day="${di}"] [data-daywarn="${di}"]`).first(); await bar.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await bar.click(); await sleep(350) }
  return open
}
export async function see(p, tag, { tue = TUE, mon = MON, who = X, pics = true, monPic = false } = {}) {
  await W.boardOff(p).catch(() => {})
  await B.toEdit(p)
  const h = await held(p, tue, who)
  const cs = await B.csOf(p, who)
  const shots = []
  /* yesterday first: resting pucks, then the list for its "Breaks" line */
  let monPk = [], monOther = [], monLines = []
  if (mon != null) {
    await closeList(p, mon); await W.showDay(p, mon)
    monPk = await paint(p, `#eWeek .day[data-day="${mon}"]`, who)
    if (pics && monPic) shots.push(await B.puckPic(p, '#eWeek', mon, who, tag + '-mon-puck'))
    const ml = await listFull(p, mon)
    monOther = ml.other; monLines = ml.lines.filter(x => /Breaks|Crew rest/i.test(x.text)).map(x => x.text)
    await closeList(p, mon)
  }
  await closeList(p, tue); await W.showDay(p, tue)
  const tuePk = await paint(p, `#eWeek .day[data-day="${tue}"]`, who)
  const puckShot = (pics === true && tuePk.find(x => x.where === 'flying')) ? await B.puckPic(p, '#eWeek', tue, who, tag + '-tue-puck') : null
  await W.showDay(p, tue)
  const list = await listFull(p, tue)
  const mine = list.lines.filter(x => x.text.includes(cs) && /Crew rest|Tight turn/i.test(x.text))
  if (pics) shots.push(await K.picEl(p, `#eWeek .day[data-day="${tue}"] [data-dwbox="${tue}"]`, tag + '-tue-list', { pad: 8, maxH: 520 }))
  if (puckShot) shots.push(puckShot)
  return {
    held: h.map(x => `${x.sev}/${x.code}${x.off ? '/HIDDEN' : ''}: ${x.msg}`),
    breach: h.some(x => x.code === 'CREW_REST' && !x.off), tight: h.some(x => x.code === 'TURN' && !x.off),
    listBar: list.bar, listMine: mine.map(x => (x.struck ? '[STRUCK] ' : '') + x.text),
    listAll: list.lines.map(x => x.text.slice(0, 160)),
    tuePk, monPk, monOther, monLines,
    ringTue: tuePk.some(x => x.where === 'flying' && x.solid), dashTue: tuePk.some(x => x.where === 'flying' && x.dashed),
    dotMon: monPk.some(x => x.dotted), shots,
  }
}
/* the specific rest sentence, if any */
export const restText = s => (s.held.find(x => /CREW_REST/.test(x)) || '').replace(/^[a-z]+\/CREW_REST[^:]*: /, '') || null
/* did the whole picture hold: the breach in the list, the solid ring on Tuesday, the dotted ring on Monday */
export const whole = s => s.breach && s.ringTue && s.dotMon && s.listMine.some(t => /Crew rest breach/i.test(t))
export const brief = s => `breach ${s.breach ? 'YES' : 'no'} · solid ring Tue ${s.ringTue ? 'yes' : 'no'} · dotted Mon ${s.dotMon ? 'yes' : 'no'} · Tue list line ${s.listMine.some(t => /Crew rest breach/i.test(t)) ? 'yes' : 'NO'} · text "${(restText(s) || '').slice(0, 200)}"${s.held.some(t => /NaN|Infinity|undefined/.test(t) && !/CREW_REST/.test(t)) ? ' · OTHER WARNING WITH A BROKEN NUMBER: ' + s.held.filter(t => /NaN|Infinity|undefined/.test(t) && !/CREW_REST/.test(t)).map(t => t.slice(0, 160)).join(' | ') : ''}`

/* ---------- fixtures ---------- */
export async function wave(p, di, cs, msn, to, ld, who = X, br = null) {
  const m = await K.addFlyWave(p, di)
  if (cs) await K.ff(p, di, m.gi, 0, 'cs', cs)
  if (msn) await K.ff(p, di, m.gi, 0, 'msn', msn)
  if (br) await K.ff(p, di, m.gi, 0, 'br', br)
  if (to) await K.ff(p, di, m.gi, 0, 'to', to)
  if (ld) await K.ff(p, di, m.gi, 0, 'ld', ld)
  let took = null
  if (who) { const s = await K.seat(p, di, m.gi, 0, 0, SEAT, who); took = s.took }
  return { ...m, took }
}
/* the Baseline B of the scenario file: Monday ordinary flight 20:00-22:30, Tuesday 07:00-08:00 with a typed Brief 05:00 */
export async function baseB(p, { tueBr = '05:00', tueTo = '07:00', tueLd = '08:00', seatTue = true, seatMon = true, monTo = '20:00', monLd = '22:30' } = {}) {
  const m = await wave(p, MON, 'ZM', 'BFM', monTo, monLd, seatMon ? X : null)
  const t = await wave(p, TUE, 'ZT', 'BFM', tueTo, tueLd, seatTue ? X : null, tueBr)
  return { m, t }
}
export const nLines = (p, di, gi) => p.evaluate(([i, g]) => window.DAYS[i].waves[g].formations.length, [di, gi])
export const nWaves = K.nWaves
export const lineOf = (p, di, gi, fi) => p.evaluate(([i, g, f]) => { const x = window.DAYS[i].waves[g].formations[f]; const a = (x.aircraft || [])[0] || {}; return `cs "${x.cs || ''}" msn "${x.msn || ''}" br "${x.br || ''}" to "${x.to || ''}" ld "${x.ld || ''}" seats p "${a.p || ''}" w "${a.w || ''}"` }, [di, gi, fi])
export const seatOf = (p, di, gi, fi, s = SEAT) => p.evaluate(([i, g, f, ss]) => ((window.DAYS[i].waves[g].formations[f].aircraft || [])[0] || {})[ss] || '', [di, gi, fi, s])
/* order of the day's waves as the app holds them */
export const orderOf = (p, di) => p.evaluate(i => window.DAYS[i].waves.map((w, g) => `${g}:${w.label}[${w.formations.map(f => (f.cs || '(blank)') + (f.to ? '@' + f.to : '')).join('/')}]`).join('  '), di)

/* the top bar's Undo / Redo (the week page's own bar) */
export async function undo(p) { await W.boardOff(p).catch(() => {}); await B.toEdit(p); return W.door(p, 'top', 'undo') }
export async function redo(p) { await W.boardOff(p).catch(() => {}); await B.toEdit(p); return W.door(p, 'top', 'redo') }
export async function reload(p) { await B.reloadAs(p, 'a'); await B.toEdit(p) }

/* a wave's grip dragged onto another wave's grip (a real pointer drag) */
export async function dragWave(p, di, fromGi, toGi) {
  await K.boardTo(p, di)
  const src = p.locator(`#schedBoard [data-move="mv:w.${di}.${fromGi}"] .wvgrip`).first()
  const dst = p.locator(`#schedBoard [data-move="mv:w.${di}.${toGi}"] .wvgrip`).first()
  try { await W.drag(p, src, dst) } catch (e) { await dragFar(p, src, dst) }
}
/* take a man off a seat: drag the seated puck off into empty space (the board's own way) */
export const takeOff = (p, di, gi, fi, ai = 0, s = SEAT) => K.takeOff(p, di, `${di}.${gi}.${fi}.${ai}.${s}`)
export const rowsOut = (rows, ...c) => rows
export function say(msg) { console.log('>> ' + msg) }

/* ---------- a step that looks and writes its row ---------- */
export const clean = s => !/NaN|Infinity|undefined|null/.test((restText(s) || '') + ' ' + s.listMine.filter(t => /Crew rest|Tight turn/i.test(t)).join(' '))
/* any OTHER warning of his that prints a broken number */
export const nanOthers = s => s.held.filter(t => /NaN|Infinity|undefined/.test(t) && !/CREW_REST/.test(t))
export const txt = s => restText(s) || ''
/* look, judge with `expect`, write the row. `verdict` forces RECORDED etc. */
export async function chk(p, id, did, expect = whole, opts = {}) {
  const s = await see(p, id.replace(/[^\w.-]/g, '_'), opts)
  const ok = expect(s)
  K.R(id, did, brief(s) + (opts.extra ? ' · ' + opts.extra : ''), opts.verdict || (ok ? 'PASS' : 'FAIL'), s.shots)
  return s
}
/* the sentence the app printed for him on that day, however it is kept */
export const sentence = s => s.listMine.find(t => /Crew rest|Tight turn/i.test(t)) || ''
/* write a row and finish a script */
export async function wrap(name, browser, errors, id) {
  K.R(`${id}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
  B.savePart(name)
  for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${r.saw}`)
}

/* ---------- the Ground Programme's "+ Row": its boxes (name, start, end) and a man put in its people ---------- */
export async function groundRow(p, di, name, str, end, who = X) {
  await K.boardTo(p, di)
  const sel = `#schedBoard [data-bfld^="gr:${di}."][data-bfld$=".prog"]`
  const n0 = await p.locator(sel).count()
  const b = p.locator(`#schedBoard [data-gradd="${di}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(700)
  const ri = (await p.locator(sel).count()) - 1
  if (ri < n0) throw new Error('+ Row added nothing')
  if (name != null) await W.boardText(p, `gr:${di}.${ri}.prog`, name)
  if (str != null) await W.boardText(p, `gr:${di}.${ri}.str`, str)
  if (end != null) await W.boardText(p, `gr:${di}.${ri}.end`, end)
  let r = { took: null, msg: null }
  if (who) r = await K.handPut(p, `g:${di}.${ri}.+`, who)
  return { ri, took: r.took, msg: r.msg }
}
export const groundOf = (p, di, ri) => p.evaluate(([i, r]) => { const x = (window.DAYS[i].ground || window.DAYS[i].gr || [])[r] || {}; return `"${x.prog || ''}" ${x.str || ''}–${x.end || ''} who "${x.who || ''}"` }, [di, ri])
export async function groundDel(p, di, ri) {
  await K.boardTo(p, di)
  const x = p.locator(`#schedBoard [data-grdel="${di}.${ri}"]`).first()
  await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await sleep(700)
}

/* ---------- ordering: a line's grip, a wave's own Auto sort, the day's Sort all ---------- */
export async function dragLine(p, di, fromKey, toKey) {
  await K.boardTo(p, di)
  const src = p.locator(`#schedBoard [data-move="mv:ac.${fromKey}"] .sb-grip`).first()
  const dst = p.locator(`#schedBoard [data-move="mv:ac.${toKey}"] .sb-grip`).first()
  try { await W.drag(p, src, dst) } catch (e) { await dragFar(p, src, dst) }
}
export async function sortWave(p, di, gi) {
  await K.boardTo(p, di)
  const b = p.locator(`#schedBoard [data-sortsec="w.${di}.${gi}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(700)
}
/* the lines of one wave in displayed order: callsign@take-off (blank where empty) */
export const waveOrder = (p, di, gi) => p.evaluate(([i, g]) => window.DAYS[i].waves[g].formations.map((f, n) => `${n}:${f.cs || '(blank)'}${f.to ? '@' + f.to : ''}${((f.aircraft || [])[0] || {}).w ? '[' + ((f.aircraft || [])[0] || {}).w + ']' : ''}`).join(' '), [di, gi])

/* ---------- a timed row of a non-flying section, by its own "+ Row", boxes and crew list ---------- */
const ROWS = {
  ground: { add: di => `[data-gradd="${di}"]`, count: di => `[data-bfld^="gr:${di}."][data-bfld$=".prog"]`, box: (di, ri, f) => `gr:${di}.${ri}.${f === 'name' ? 'prog' : f}`, seat: (di, ri) => `g:${di}.${ri}.+`, del: (di, ri) => `[data-grdel="${di}.${ri}"]`, label: 'Ground Programme row' },
  prog: { add: di => `[data-padd="${di}"]`, count: di => `[data-bfld^="ap:${di}."][data-bfld$=".prog"]`, box: (di, ri, f) => `ap:${di}.${ri}.${f === 'name' ? 'prog' : f}`, seat: (di, ri) => `a:${di}.${ri}.+`, del: (di, ri) => `[data-pdel="${di}.${ri}"]`, label: 'Common Programme item' },
  duty: { add: di => `[data-dradd="${di}.0"]`, count: di => `[data-bfld^="dr:${di}.0."][data-bfld$=".role"]`, box: (di, ri, f) => `dr:${di}.0.${ri}.${f === 'name' ? 'role' : f}`, seat: (di, ri) => `d:${di}.0.${ri}.+`, del: (di, ri) => `[data-drdel="${di}.0.${ri}"]`, label: 'duty desk row' },
  sim: { add: di => `[data-sradd="${di}.amt"]`, count: di => `[data-bfld^="sr:${di}.amt."][data-bfld$=".label"]`, box: (di, ri, f) => `sr:${di}.amt.${ri}.${f === 'name' ? 'label' : f}`, seat: (di, ri) => `s:${di}.amt.${ri}.+`, del: (di, ri) => `[data-srdel="${di}.amt.${ri}"]`, label: 'sim row' },
}
export async function addRow(p, kind, di, name, str, end, who = X) {
  const R_ = ROWS[kind]
  await K.boardTo(p, di)
  const n0 = await p.locator(`#schedBoard ${R_.count(di)}`).count()
  const b = p.locator(`#schedBoard ${R_.add(di)}`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(700)
  const ri = (await p.locator(`#schedBoard ${R_.count(di)}`).count()) - 1
  if (ri < n0) throw new Error(kind + ': + Row added nothing')
  if (name != null) await W.boardText(p, R_.box(di, ri, 'name'), name)
  if (str != null) await W.boardText(p, R_.box(di, ri, 'str'), str)
  if (end != null) await W.boardText(p, R_.box(di, ri, 'end'), end)
  let r = { took: null, msg: null }
  if (who) r = await K.handPut(p, R_.seat(di, ri), who)
  return { ri, took: r.took, msg: r.msg, label: R_.label }
}
export async function setRow(p, kind, di, ri, field, val) { await K.boardTo(p, di); await W.boardText(p, ROWS[kind].box(di, ri, field), val) }
export async function delRow(p, kind, di, ri) {
  await K.boardTo(p, di)
  const x = p.locator(`#schedBoard ${ROWS[kind].del(di, ri)}`).first()
  await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await sleep(700)
}

/* two grips too far apart for W.drag's single scroll: centre the pair in the window with the wheel, then a real pointer drag */
export async function dragFar(p, src, dst, { steps = 18 } = {}) {
  const vp = p.viewportSize()
  await src.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(250)
  let a = await src.boundingBox(), b = await dst.boundingBox()
  /* the board's own bars cover the top ~125px: put the UPPER grip at y 135 and require the lower one to fit above the bottom edge */
  const upper = Math.min(a.y, b.y)
  const shift = 135 - upper
  if (Math.abs(shift) > 4) { await p.mouse.move(Math.round(vp.width / 2), Math.round(vp.height / 2)); await p.mouse.wheel(0, -shift); await sleep(450) }
  a = await src.boundingBox(); b = await dst.boundingBox()
  const inV = r => r && r.y >= 125 && r.y + r.height <= vp.height - 8
  if (!inV(a) || !inV(b)) throw new Error(`dragFar: grips not both on screen (src y ${a && a.y}, dst y ${b && b.y})`)
  const hit = async loc => loc.evaluate(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!x && (x === e || e.contains(x) || x.contains(e)) })
  if (!(await hit(src)) || !(await hit(dst))) throw new Error('dragFar: something lies over a grip')
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down()
  await p.mouse.move(a.x + a.width / 2 + 6, a.y + a.height / 2 + 6, { steps: 3 })
  await p.mouse.move(b.x + Math.min(b.width / 2, 30), b.y + b.height / 2, { steps }); await sleep(150)
  await p.mouse.up(); await sleep(800)
}
