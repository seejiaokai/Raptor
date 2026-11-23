// The host's short re-look (chat 154, 23 Nov 26): after the reads' fixes, a shared SANS offer whose second man is hidden that
// day is drawn on Edit Schedule's and the Scheduler Board's SANS Avail panels with only the man SANS that day (the fresh Opus
// read's F1 = Astra's #1 — D2341). World made through the app's own controls as Saber (the r1 recipe, sah-r1.mjs w101):
// Ranger and Hex posted out as SANS from Fri 17 Jul; one shared offer for both on Fri 17; Ranger's posting moved to Sat 18.
// Then Fri 17's crew list on the week and on the board read for both men; Ranger's posting moved back, both read again.
// window.* is only READ (and window.go, the recipes' page switch). Run from raptor-port/ against the build served on 4402:
//   ONLY=h-d,h-p node scripts/handpass/sah-h154.mjs
process.env.W2_URL ||= 'http://localhost:4402/'
process.env.W2_OUT ||= 'D:/raptor-work/c154-look/run1'
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
import path from 'node:path'
import { writeFileSync } from 'node:fs'
const X = await import('./sah-w8-lib.mjs')
const T = await import('./sah-w10-lib.mjs')
const { L, J, RANGER, HEX } = X
console.log('sah-h154 v1', L.URL_, L.OUT)
const ONLY = (process.env.ONLY || 'h-d,h-p').split(',').filter(Boolean)
const D17 = '2026-07-17', D18 = '2026-07-18', FRI = 4

async function run(name, szKey, fn) {
  const sz = L.SIZES[szKey], W = L.mk(name, sz)
  const { b, p } = await L.world(sz, W, '2026-07-15T09:00:00')
  try { await L.signIn(p, 'ad', 'a'); await fn(p, W) } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
}
async function post(p, W, id, iso, tag) {
  const po = await L.postOut(p, W, id, iso, tag)
  W.rec(tag, `Saber: ${id === RANGER ? 'Ranger' : 'Hex'} posted out as SANS from ${iso.slice(8)} Jul (read back)`, /becomes SANS/.test(po.line), po.line, po.pic)
}
/* THE PANELS THE FIX IS ABOUT (not the crew list): the week day's "SANS Avail" section (`ui/html.ts sansSectionHTML`,
   `section.day[data-day="4"] .sec-sans`) and the board's SANS Avail panel (`ui/board-html.ts sbSansPanel`, `.sb-panel.sansav`)
   — who is drawn there, by the cards' data-person; each pictured cut to the panel */
const panelWho = (p, sel) => p.evaluate(sel => {
  const el = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0)
  if (!el) return null
  const P = window.PEOPLE
  return [...new Set([...el.querySelectorAll('[data-person]')].filter(x => x.getBoundingClientRect().width > 0).map(x => (P[x.getAttribute('data-person')] || {}).cs || x.getAttribute('data-person')))]
}, sel)
async function panels(p, W, tag, rangerIn) {
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  const wsel = 'section.day[data-day="4"] .sec-sans'
  const wl = p.locator(wsel).first()
  if (await wl.count()) await wl.scrollIntoViewIfNeeded().catch(() => {})
  const wk = await panelWho(p, wsel)
  const wpic = await T.W5.clip(p, W, wl, `${tag}-weekpanel`).catch(() => '')
  W.rec(`${tag}-weekpanel`, `Edit Schedule, Fri 17's SANS Avail section: Hex drawn; Ranger ${rangerIn ? 'drawn' : 'NOT drawn'}`, !!wk && wk.includes('Hex') && wk.includes('Ranger') === rangerIn, J(wk), [wpic, await W.pic(p, `${tag}-weekpanel`)].filter(Boolean).join(', '))
  await L.openBoard(p, W, FRI)
  const bsel = '#schedBoard .sb-panel.sansav'
  const bl = p.locator(bsel).first()
  if (await bl.count()) await bl.scrollIntoViewIfNeeded().catch(() => {})
  const bd = await panelWho(p, bsel)
  const bpic = await T.W5.clip(p, W, bl, `${tag}-boardpanel`).catch(() => '')
  W.rec(`${tag}-boardpanel`, `the Scheduler Board, Fri 17's SANS Avail panel: Hex drawn; Ranger ${rangerIn ? 'drawn' : 'NOT drawn'}`, !!bd && bd.includes('Hex') && bd.includes('Ranger') === rangerIn, J(bd), [bpic, await W.pic(p, `${tag}-boardpanel`)].filter(Boolean).join(', '))
  await L.closeBoard(p, W)
}
async function both(p, W, tag, rangerIn) {
  await panels(p, W, tag, rangerIn)
  for (const [nm, id, want] of [['Ranger', RANGER, rangerIn], ['Hex', HEX, true]]) {
    const wk = await T.weekCrewOf(p, W, 'fri', id, `${tag}-week-${nm}`)
    W.rec(`${tag}-week-${nm}`, `Edit Schedule, Fri 17's crew list: ${nm} ${want ? 'IN' : 'NOT in'} SANS Avail`, T.inSansAvail(wk.c) === want, T.crewWhere(wk.c), wk.pic)
    const bd = await T.boardCrewOf(p, W, FRI, id, `${tag}-board-${nm}`)
    W.rec(`${tag}-board-${nm}`, `the Scheduler Board, Fri 17's crew list: ${nm} ${want ? 'IN' : 'NOT in'} SANS Avail`, T.inSansAvail(bd.c) === want, T.crewWhere(bd.c), bd.pic)
  }
}
async function h(p, W) {
  await post(p, W, RANGER, D17, 'h-01'); await T.closeAll(p, W)
  await post(p, W, HEX, D17, 'h-02'); await T.closeAll(p, W)
  const f = await T.file(p, W, D17, [RANGER, HEX], ['fly', 'oft', 'amt'], 'all', 'h-03')
  W.rec('h-03', 'Saber: one shared offer for Ranger + Hex on Fri 17 (read back)', !!f.made, J(f.made) + ' ' + f.refused, f.pic)
  await T.closeAll(p, W)
  await both(p, W, 'h-04', true)
  const m = await T.movePo(p, W, RANGER, D17, D18, 'h-05')
  W.rec('h-05', "Saber: Ranger's posting moved to Sat 18 (Hex's stays 17)", m.ok && /18 Jul/.test(m.line), `"${m.before}" → "${m.line}"`, m.pic)
  await T.closeAll(p, W)
  await both(p, W, 'h-06', false)
  const m2 = await T.movePo(p, W, RANGER, D18, D17, 'h-07')
  W.rec('h-07', "Saber: Ranger's posting moved back to Fri 17", m2.ok && /17 Jul/.test(m2.line), `"${m2.before}" → "${m2.line}"`, m2.pic)
  await T.closeAll(p, W)
  await both(p, W, 'h-08', true)
}
for (const k of ONLY) { const i = k.lastIndexOf('-'); await run(k.slice(0, i), k.slice(i + 1), h) }
writeFileSync(path.join(L.OUT, 'results-h154.json'), JSON.stringify(L.results, null, 1))
for (const r of L.results) console.log(`${r.size} ${r.id} ${r.ok === true ? 'PASS' : r.ok === false ? 'FAIL' : r.ok} — ${String(r.note || '').slice(0, 160)}`)
console.log('done')
