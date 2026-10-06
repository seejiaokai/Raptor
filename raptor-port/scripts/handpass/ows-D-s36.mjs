/* S36 — every uncommon seat and extra-person renderer; exempt kinds default off, opt in, amend */
import * as D from './ows-D-lib.mjs'
import * as K from './stk-B-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, dayState, pend, SAT, ISO } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const log = (...a) => console.log('>>', ...a)

/* ---------- build the Saturday through the app's own controls ---------- */
const WHO = {}
/* OFT row: seat + extra */
await K.boardTo(p, SAT)
{
  const b = p.locator(`#schedBoard [data-sradd="${SAT}.oft"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(700)
  const ri = (await p.evaluate(i => window.DAYS[i].sims.oft.length, SAT)) - 1
  await W.boardText(p, `sr:${SAT}.oft.${ri}.label`, 'SIM-A'); await W.boardText(p, `sr:${SAT}.oft.${ri}.str`, '09:00'); await W.boardText(p, `sr:${SAT}.oft.${ri}.end`, '15:00')
  WHO.oftSeat = (await K.handPut(p, `s:${SAT}.oft.${ri}.p`, 'snap')).took
  WHO.oftExtra = (await K.handPut(p, `s:${SAT}.oft.${ri}.+`, 'shaft')).took
}
/* AMT block (+ Block: BRIEF, BOX, DEBRIEF) → passenger */
{
  const b = p.locator(`#schedBoard [data-sblkadd="${SAT}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(800)
  const amt = await p.evaluate(i => window.DAYS[i].sims.amt.map((r, ix) => ({ ix, label: r.label, str: r.str, end: r.end, pax: r.pax })), SAT)
  log('amt after + Block', JSON.stringify(amt))
  const box = amt.find(r => Array.isArray(r.pax) && !/BRIEF|DEBRIEF/i.test(r.label || ''))
  if (box) {
    await W.boardText(p, `sr:${SAT}.amt.${box.ix}.str`, '09:00'); await W.boardText(p, `sr:${SAT}.amt.${box.ix}.end`, '15:00')
    const r = await K.handPut(p, `s:${SAT}.amt.${box.ix}.+`, 'dice'); WHO.amtPax = r.took; log('amt pax', JSON.stringify(r))
  }
  log('amt now', JSON.stringify(await p.evaluate(i => window.DAYS[i].sims.amt, SAT)))
}
/* duty row: main + extra */
{ const d1 = await R.addRow(p, 'duty', SAT, 'DESK-A', '09:00', '15:00', 'pump'); WHO.dutyMain = d1.took
  WHO.dutyExtra = (await K.handPut(p, `d:${SAT}.0.${d1.ri}.+`, 'nact')).took }
/* ground row: main + extra */
{ const g1 = await R.addRow(p, 'ground', SAT, 'GRD-A', '09:00', '15:00', 'mamba'); WHO.gndMain = g1.took
  WHO.gndExtra = (await K.handPut(p, `g:${SAT}.${g1.ri}.+`, 'slipway')).took }
/* Common Programme item */
{ const c1 = await R.addRow(p, 'prog', SAT, 'CP-A', '09:00', '15:00', 'razer'); WHO.cp = c1.took }
/* SC wave: MAIN (jet 1) and SPARE (jet 4) */
const sc = await R.addStandby(p, SAT, 'sc')
WHO.scMain = (await K.handPut(p, `${SAT}.${sc.gi}.0.0.p`, 'bane')).took
WHO.scSpare = (await K.handPut(p, `${SAT}.${sc.gi}.0.3.p`, 'stiff')).took
/* AVALON line + BB line (BB has no times: type 09:00–15:00) */
const av = await R.addStandby(p, SAT, 'avalon')
WHO.avLine = (await K.handPut(p, `${SAT}.${av.gi}.0.0.p`, 'split')).took
const bb = await R.addStandby(p, SAT, 'bb')
await K.ff(p, SAT, bb.gi, 0, 'to', '09:00'); await K.ff(p, SAT, bb.gi, 0, 'ld', '15:00')
WHO.bbLine = (await K.handPut(p, `${SAT}.${bb.gi}.0.0.p`, 'freak')).took
/* AVALON-template duty block (+ Block → the AVALON desk template), one man on its first row */
{
  const b = p.locator(`#schedBoard [data-dwadd="${SAT}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500)
  const tpls = await p.evaluate(() => [...document.querySelectorAll('[data-blktpl]')].filter(e => e.offsetParent !== null).map(e => ({ id: e.dataset.blktpl, t: e.innerText.replace(/\n/g, ' · ') })))
  log('+ Block offers', JSON.stringify(tpls))
  const tp = tpls.find(t => /AVALON/i.test(t.t))
  if (tp) { await p.locator(`[data-blktpl="${tp.id}"]:visible`).first().click(); await sleep(800) } else await p.keyboard.press('Escape')
  const blks = await p.evaluate(i => window.DAYS[i].dutywaves.map((b, bi) => ({ bi, label: b.label, sa: b.sa, rows: b.rows.map(r => `${r.role}|${r.str}-${r.end}|${r.id || ''}`) })), SAT)
  log('duty blocks', JSON.stringify(blks))
  const nb = blks[blks.length - 1]
  WHO.avBlock = nb
  const r = await K.handPut(p, `d:${SAT}.${nb.bi}.0.+`, 'glass'); WHO.avDesk = r.took; log('av desk', JSON.stringify(r))
  WHO.avDeskRow = (await p.evaluate(([i, bi]) => { const x = window.DAYS[i].dutywaves[bi].rows[0]; return `${x.role} ${x.str}-${x.end} ${x.id}` }, [SAT, nb.bi]))
}
log('WHO', JSON.stringify(WHO))
const dump = await p.evaluate(i => { const d = window.DAYS[i]; return JSON.stringify({ waves: d.waves.map(w => [w.label, w.kind, w.formations.map(f => `${f.cs}|${f.to}-${f.ld}|${f.aircraft.map(a => (a.p || '-') + (a.role ? ':' + a.role : '')).join(',')}`)]) }) }, SAT)
log(dump)

const MEN = { snap: 'OFT seat', shaft: 'OFT extra', dice: 'AMT pax', pump: 'duty main', nact: 'duty extra', mamba: 'ground main', slipway: 'ground extra', razer: 'Common Programme', bane: 'SC MAIN', stiff: 'SC SPARE', split: 'AVALON line', glass: 'AVALON desk', freak: 'BB line' }
const EXEMPT = ['stiff', 'split', 'glass', 'freak']
const IDS = Object.keys(MEN)

/* what the OIL Earn mode shows for each man, on the working copy (not yet published) */
const figs = async () => p.evaluate(ids => { const o = {}
  for (const id of ids) o[id] = [...document.querySelectorAll(`#schedBoard .puck[data-person="${id}"]`)].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim() + ' {' + String(e.className).replace(/\s+/g, ' ').slice(0, 70) + '}')
  return o }, IDS)
await D.oilMode(p, true)
const f0 = await figs()
const sw0 = await D.switches(p)
const pic0 = await P(p, 'S36-oilmode-unpub')
log('figs unpublished', JSON.stringify(f0))
log('switches', JSON.stringify(sw0.map(s => `${s.txt}:${s.cls.includes(' on') ? 'ON' : s.cls.includes('off') ? 'OFF' : s.cls}`)))
await D.oilMode(p, false)

/* ---------- publish, then read each man's cell and tracker row ---------- */
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
log('published', pub.head && pub.head.tag, JSON.stringify(pub.head && pub.head.signs))

async function readAll(name) {
  await A.lwOpenMonth(p, 'JUL')
  const cells = {}
  for (const id of IDS) cells[id] = await A.lwCellOf(p, id, ISO[SAT])
  await p.evaluate(([i, d]) => { const c = document.querySelector(`[data-testid="cell-${i}-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, ['bane', ISO[SAT]]); await sleep(300)
  const pc = await P(p, name + '-grid')
  await L.go(p, 'leavewar'); await sleep(900)
  const b = p.locator('[data-testid="oil-tracker"]:visible').first(); await b.click(); await sleep(1200)
  const rows = {}
  for (const id of IDS) rows[id] = await p.evaluate(i => { const e = document.querySelector(`[data-testid="oil-row-${i}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : 'NO ROW' }, id)
  const pt = await P(p, name + '-tracker')
  await A.closeOil(p)
  return { cells, rows, pics: [pc, pt] }
}
const L1 = await readAll('S36-pub')
for (const id of IDS) log(id, MEN[id], '|', D.letters(L1.cells[id]), '|', (L1.rows[id] || '').slice(0, 140))

const ENABLED = IDS.filter(i => !EXEMPT.includes(i))
const rowsA = ENABLED.map(id => {
  const ok = D.letters(L1.cells[id]) === (id === 'bane' ? 'HO' : 'HO') && (id === 'bane' ? /07:00.13:00/ : /09:00.15:00/).test(L1.rows[id])
  return [`${MEN[id]} (${id}): HO, worked ${id === 'bane' ? '07:00–13:00' : '09:00–15:00'}`, ok, `${L1.cells[id].text} | ${L1.rows[id].slice(0, 120)}`]
})
judge('S36.enabled', 'published: the enabled seat kinds — OFT seat and extra, AMT passenger, duty main and extra, ground main and extra, Common Programme name, SC MAIN', [
  ['all fixture seats were taken through the crew list', Object.entries(WHO).filter(([k, v]) => typeof v === 'boolean').every(([, v]) => v), WHO],
  ...rowsA,
], L1.pics)
const rowsB = EXEMPT.map(id => [`${MEN[id]} (${id}): no OIL while default off`, D.letters(L1.cells[id]) !== 'HO' && D.letters(L1.cells[id]) !== 'FO', `${L1.cells[id].text} | ${L1.rows[id].slice(0, 100)}`])
judge('S36.exempt-default', 'published: SC SPARE, AVALON line, AVALON desk, BB line left on their default', rowsB, L1.pics)

/* ---------- opt in the exempt kinds (OIL Earn on the working copy), then amend ---------- */
await A.toBoard(p, SAT)
await D.oilMode(p, true)
const swPre = await D.switches(p)
log('switches (published, working copy)', JSON.stringify(swPre.map(s => `${s.txt}|${s.item}|${s.cls.includes(' on') ? 'ON' : 'OFF'}|${s.title.slice(0, 50)}`)))
const optLog = []
for (const s of swPre) {
  if (/^(SC|AV|BB|NIGHT|SHIFT)/i.test(s.txt) || /avalon|bb|spare|sc/i.test(s.txt) || !s.cls.includes(' on')) {
    if (!s.cls.includes(' on')) { await p.locator(`#schedBoard [data-oilitem="${s.item}"]:visible`).first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await p.locator(`#schedBoard [data-oilitem="${s.item}"]:visible`).first().click().catch(() => {}); await sleep(500); optLog.push(`turned on ${s.txt} (${s.item}) → ${await D.toast(p) || ''}`) }
  }
}
log('optLog', JSON.stringify(optLog))
const f1 = await figs()
log('figs after opt-in', JSON.stringify(f1))
const pic1 = await P(p, 'S36-oilmode-optin')
await D.oilMode(p, false)
const am = await A.publishAm(p, SAT); await A.closeBoard(p)
log('amended', am.head && am.head.tag)
const L2 = await readAll('S36-al')
for (const id of IDS) log(id, MEN[id], '|', D.letters(L2.cells[id]), '|', (L2.rows[id] || '').slice(0, 140))
judge('S36.exempt-optin', 'OIL Earn: switched each exempt item on (SC SPARE, AVALON line, AVALON desk, BB line); four sign again; Publish AL', [
  ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
  ['SC SPARE (stiff): HO 07:00–13:00', D.letters(L2.cells.stiff) === 'HO' && /07:00.13:00/.test(L2.rows.stiff), `${L2.cells.stiff.text} | ${L2.rows.stiff.slice(0, 120)}`],
  ['AVALON line (split): FO, worked 19:00–23:59', D.letters(L2.cells.split) === 'FO' && /19:00.23:59/.test(L2.rows.split), `${L2.cells.split.text} | ${L2.rows.split.slice(0, 120)}`],
  ['AVALON desk (glass): credited', /HO|FO/.test(D.letters(L2.cells.glass)), `${L2.cells.glass.text} | ${L2.rows.glass.slice(0, 120)} | ${WHO.avDeskRow}`],
  ['BB line (freak): HO 09:00–15:00', D.letters(L2.cells.freak) === 'HO' && /09:00.15:00/.test(L2.rows.freak), `${L2.cells.freak.text} | ${L2.rows.freak.slice(0, 120)}`],
  ['the enabled men held', ENABLED.every(id => D.letters(L2.cells[id]) === 'HO'), ENABLED.map(i => i + ':' + D.letters(L2.cells[i])).join(' ')],
], L2.pics)

/* ---------- the week and the Logic page text for F3 ---------- */
await A.toWeek(p); await W.showDay(p, SAT)
const picWeek = await P(p, 'S36-week')
await L.go(p, 'logic'); await sleep(500)
const lg = await D.pageText(p, 'body')
const idx = lg.search(/OIL/)
const oilTxt = (lg.match(/[^.]*(SC SPARE|AVALON)[^.]*\./g) || []).join(' | ').slice(0, 800)
log('Logic OIL text about SC SPARE / AVALON:', oilTxt)
const picLg = await P(p, 'S36-logic')
console.log('ERRORS', JSON.stringify(D.cleanErr(errors)))
D.savePart('ows-D-s36', { errors: D.cleanErr(errors), who: WHO, logicText: oilTxt, pics: D.pics.saved })
await browser.close()
