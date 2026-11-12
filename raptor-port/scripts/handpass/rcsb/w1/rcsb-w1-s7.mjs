/* rcsb-w1-s7 v1 — S7 (Astra's side question, RECORD): an open-ended ALL AVAIL row on Saturday's Common Programme, "Any other row" 1h -> 2h.
   usage (from raptor-port/): node scripts/handpass/rcsb/w1/rcsb-w1-s7.mjs */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { rmSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/s7')
rmSync(process.env.HP_SHOTS, { recursive: true, force: true })
console.log('rcsb-w1-s7 v1', process.env.HP_SHOTS)
const C = await import('./rcsb-w1-common.mjs')
const { R, X, L, sleep, row, j, W4 } = C
const w = await R.world('pc')
const { page } = w
const SAT = 5, ISO = X.ISO[SAT]
const men = [w.ID('Cinch'), w.ID('Piston')]
console.log('men', j(men.map(m => w.CS[m])))
await L.board(page, SAT)
await page.locator(`#schedBoard [data-padd="${SAT}"]:visible`).first().click(); await sleep(700)
await X.typeIn(w, '[data-bfld="ap:5.0.prog"]', 'Briefing')
await X.typeIn(w, '[data-bfld="ap:5.0.str"]', '09:00')
console.log('seat', await X.seatPhoneAware(w, '[data-fill="a:5.0.+"]', 'allavail'))
const rowTxt = () => page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-arow'); return r ? r.innerText.replace(/\s+/g, ' ').trim() : '(no row)' })
console.log('row', await rowTxt())
const fields = await page.evaluate(() => ['prog', 'str', 'end'].map(k => { const e = document.querySelector(`#schedBoard [data-bfld="ap:5.0.${k}"]`); return k + '=' + (e ? e.value : '?') }))
console.log('fields', j(fields))
// the ALL AVAIL window
const windowOf = async tag => {
  await L.board(page, SAT)
  const pk = page.locator('#schedBoard .sb-arow .oilcount:visible').first()
  const found = await pk.count()
  if (!found) return { found: 0, row: await rowTxt() }
  await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  const rowT = await rowTxt()
  await X.pic(page, tag + '-board-row', '#schedBoard .sb-arow')
  await pk.click(); await sleep(900)
  const wins = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.offsetWidth && getComputedStyle(e).position === 'fixed' && !/topbar/.test(String(e.className)) && e.innerText && e.innerText.length > 15 && e.innerText.length < 1500).map(e => String(e.className).slice(0, 30) + ' :: ' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 900)))
  await page.screenshot({ path: `${R.SHOTS}/${tag}-allavail-window.png` })
  await page.keyboard.press('Escape'); await sleep(500)
  return { found, row: rowT, wins: wins.slice(0, 4) }
}
const w0 = await windowOf('s7-pre')   // working copy, before publishing (to learn the window's form)
console.log('window pre-publish', j(w0))
const pub = await C.publish(w, SAT)
console.log('published', j({ p: pub.pressed, tag: pub.head && pub.head.tag, pending: pub.head && pub.head.pending, warn: null }))
const readAll = async tag => {
  await L.go(page, 'editsched'); await sleep(500)
  const head = await L.head(page, SAT); const card = await C.dayCard(page, SAT)
  await X.pic(page, tag + '-edit-head', `#eWeek .day[data-day="${SAT}"] .day-head`)
  const pend = await C.pendingList(w, SAT, tag + '-edit-pendinglist')
  const win = await windowOf(tag)
  await L.closeBoard(page)
  const g1 = await C.lwGrid(w, men[0], ISO, tag + '-m1')
  const g2 = await C.lwGrid(w, men[1], ISO, tag + '-m2')
  const p1 = await X.lwOil(w, men[0], ISO, tag + '-m1-person')
  const p2 = await X.lwOil(w, men[1], ISO, tag + '-m2-person')
  const r = { head: { tag: head.tag, pending: head.pending, nys: head.nys }, card, pending: pend, win, m1: { who: w.CS[men[0]], box: g1.box, oil: p1.oil, win: g1.win.slice(-230) }, m2: { who: w.CS[men[1]], box: g2.box, oil: p2.oil, win: g2.win.slice(-230) } }
  console.log(tag, j(r)); return r
}
const a = await readAll('s7a')
// find the Logic key of "Any other row"
await L.go(page, 'logic'); await sleep(600)
if (!(await page.locator('#lgBody input[data-lgset]:visible').count())) { await X.press(w, '#lgEdit', { scope: 'page' }); await sleep(500) }
const key = await page.evaluate(() => { const ins = [...document.querySelectorAll('#lgBody input[data-lgset]')]; const labelOf = i => { let e = i.parentElement; for (let k = 0; k < 6 && e; k++) { if (e.querySelectorAll('input[data-lgset]').length === 1 && (e.innerText || '').trim().length > 3) return (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160); e = e.parentElement } return '?' }; const hit = ins.find(i => /Any other row/i.test(labelOf(i))); return { key: hit ? hit.getAttribute('data-lgset') : null, value: hit ? hit.value : null, label: hit ? labelOf(hit) : null, labels: ins.map(i => i.getAttribute('data-lgset') + ' :: ' + labelOf(i)).slice(0, 30) } })
console.log('logic key', j(key))
await page.screenshot({ path: process.env.HP_SHOTS + '/s7-logic-before.png' })
let lg = null
if (key.key) { lg = await R.setLogic(w, key.key, '2h', 's7b-logic-2h'); console.log('logic', j(lg)) }
const b = await readAll('s7b')
await L.go(page, 'editsched'); await sleep(500)
const hb = await L.head(page, SAT)
console.log('head before AL1', j({ alpub: hb.alpub, pending: hb.pending, nys: hb.nys }))
let pAl = { pressed: { pressed: false, why: 'AL1 button: ' + j(hb.alpub) }, head: hb }
if (hb.alpub) { await L.board(page, SAT); pAl = await C.publish(w, SAT) }
console.log('AL1', j({ p: pAl.pressed, tag: pAl.head && pAl.head.tag, pending: pAl.head && pAl.head.pending }))
const c = await readAll('s7c')
row('S7 a', 'RECORD', `published row: ${a.win.row}; window: ${j(a.win.wins)}; head ${a.head.tag}/${a.head.pending}/nys ${a.head.nys}; ${a.m1.who} ${a.m1.box} oil ${a.m1.oil}; ${a.m2.who} ${a.m2.box} oil ${a.m2.oil}`, 's7a-*')
row('S7 b', 'RECORD', `after Any other row 1h->2h (box ${lg && lg.after}, app ${lg && lg.vconf}): head ${b.head.tag}/${b.head.pending}/nys ${b.head.nys}; pending list: ${b.pending.text}; row: ${b.win.row}; window: ${j(b.win.wins)}; ${b.m1.who} ${b.m1.box} oil ${b.m1.oil}; ${b.m2.who} ${b.m2.box} oil ${b.m2.oil}`, 's7b-*')
row('S7 c', 'RECORD', `after AL1: head ${c.head.tag}/${c.head.pending}/nys ${c.head.nys}; row: ${c.win.row}; window: ${j(c.win.wins)}; ${c.m1.who} ${c.m1.box} oil ${c.m1.oil}; ${c.m2.who} ${c.m2.box} oil ${c.m2.oil}`, 's7c-*')
R.finish(w, 's7')
await w.browser.close()
