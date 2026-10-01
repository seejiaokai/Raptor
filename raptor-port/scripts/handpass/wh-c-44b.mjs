/* walker C — scenario 44, its "no Leave War period" half: a weekend that no period covers (Saturday 27 Dec 2025 — the
   two demo periods are 2026 and 2027). Reached through the calendar button; a duty block and a man through the board's
   own controls. Hide / flag again the OIL reminder that names nobody; the Leave War, its saved rows and the OIL tracker
   must read the same throughout. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const SAT = 5
const { browser, p, errors } = await H.world({ who: 'a' })
const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(16) + ':' + s.length }
async function toDec25() {
  if ((await p.evaluate(() => window.CURWEEK)) === '22/12/2025') return '22/12/2025'
  await p.locator('[aria-label="Jump to a date"]:visible').first().click(); await L.sleep(500)
  for (let i = 0; i < 12; i++) { if (await p.locator('button[aria-label="27 Dec 2025"]:visible').count()) break; await p.locator('button[aria-label="Previous month"]:visible').first().click(); await L.sleep(120) }
  await p.locator('button[aria-label="27 Dec 2025"]:visible').first().click(); await L.sleep(1500)
  return p.evaluate(() => window.CURWEEK)
}
async function leavewar() {
  await L.go(p, 'leavewar'); await L.sleep(1800)
  const grid = await p.evaluate(() => document.querySelector('#page-leavewar').innerText.replace(/\s+/g, ' '))
  await p.locator('#page-leavewar button').filter({ hasText: /OIL/ }).first().click(); await L.sleep(1200)
  const oil = await p.evaluate(() => { const t = document.querySelector('.oil-tools'); let s = t; while (s && s.parentElement && !/OIL TRACKER/i.test(s.innerText || '')) s = s.parentElement; return s ? s.innerText.replace(/\s+/g, ' ') : '' })
  const rows = await p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('raptor:leavewar')) o[k] = localStorage.getItem(k) } return JSON.stringify(Object.keys(o).sort().map(k => [k, o[k]])) })
  const pic = await H.pic(p, '44b-oil-tracker')
  await p.keyboard.press('Escape'); await L.sleep(300)
  if (await p.locator('.oil-tools:visible').count()) { await p.locator('button').filter({ hasText: /^[✕×]$/ }).last().click().catch(() => {}); await L.sleep(300) }
  return { grid, oil, rows, pic }
}
const satList = async () => { await L.go(p, 'editsched'); await toDec25(); await W.showDay(p, SAT); await H.openList(p, '#eWeek', SAT); return H.readList(p, '#eWeek', SAT) }
try {
  await L.go(p, 'editsched')
  const wk = await toDec25()
  /* the board on Saturday: + Block → Standard; a man on its first row */
  await W.boardOn(p, SAT); await L.sleep(400)
  await p.locator(`#schedBoard [data-dwadd="${SAT}"]`).first().click(); await L.sleep(500)
  await p.locator('button:visible, [role=menuitem]:visible, li:visible, div:visible').filter({ hasText: /^Standard\s*3 roles$/ }).first().click(); await L.sleep(700)
  const row0 = p.locator(`#schedBoard [data-move="mv:d.${SAT}.0.0"]`).first()
  await row0.locator('.ppl').first().click(); await L.sleep(300)
  const pk = p.locator('#sbRoster .rpuck[data-person="spaceman"]:visible').first()
  await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await pk.click(); await L.sleep(500); await p.keyboard.press('Escape')
  await W.boardText(p, `dr:${SAT}.0.0.str`, '0800'); await W.boardText(p, `dr:${SAT}.0.0.end`, '1800')
  const rowNow = await p.evaluate(d => { const r = document.querySelector(`#schedBoard [data-move="mv:d.${d}.0.0"]`); return r ? { role: r.querySelector('[data-bfld$=".role"]').value, str: r.querySelector('[data-bfld$=".str"]').value, end: r.querySelector('[data-bfld$=".end"]').value, who: [...r.querySelectorAll('[data-person]')].map(e => e.dataset.person) } : null }, SAT)
  await L.settle(p); await W.boardOff(p)
  let l0 = await satList()
  console.log('WEEK', wk, 'ROW', JSON.stringify(rowNow), '\nSAT (draft)', l0.bar, JSON.stringify(l0.lines.map(x => x.text)))
  /* publish Saturday (only a published day earns) */
  await W.showDay(p, SAT); const signs = await W.signDay(p, SAT); const pub = await W.publishDay(p, SAT); await L.settle(p)
  const l1 = await satList(); const h1 = await H.head(p, SAT)
  console.log('SAT (published)', l1.bar, JSON.stringify(l1.lines.map(x => x.text)), JSON.stringify(h1))
  const noPeriod = l1.lines.find(x => /period/i.test(x.text)) || l0.lines.find(x => /period/i.test(x.text))
  const pic1 = await H.pic(p, '44b-1-saturday-no-period')
  H.judge('44b.0', 'calendar button → 27 Dec 2025; the board on Saturday: "+ Block" → Standard, Dash onto its first row; four sign-offs, Publish day', [
    ['the week of 22 Dec 2025 is up', wk === '22/12/2025', wk], ['the duty row holds Dash with times', !!rowNow && rowNow.who.includes('spaceman') && !!rowNow.str && !!rowNow.end, JSON.stringify(rowNow)],
    ['Saturday is published', pub.pressed && /ORIG/.test(h1.tag), JSON.stringify({ pub, tag: h1.tag })],
    ['Saturday\'s list carries an OIL reminder about there being no Leave War period', !!noPeriod, JSON.stringify(l1.lines.map(x => x.text.slice(0, 90)))]], [pic1])
  if (!noPeriod) throw new Error('no "no period" line reached — recorded above')
  const A = await leavewar()
  const cur = await satList(); const ix = cur.lines.find(x => /period/i.test(x.text)).ix
  await H.tapLine(p, '#eWeek', SAT, ix); await L.settle(p)
  const l2 = await satList(); const h2 = await H.head(p, SAT); const ln2 = l2.lines.find(x => x.ix === ix)
  const pic2 = await H.pic(p, '44b-2-no-period-hidden')
  const B = await leavewar()
  H.judge('44b.1', '✕ on Saturday\'s "no Leave War period" reminder (it names nobody); then the Leave War page and the OIL tracker', [
    ['the line is struck, with ↺', !!ln2 && ln2.struck && ln2.btn === '↺', l2.bar], ['it is no longer counted', /No issues|\b\d+ issue/.test(l2.bar) && l2.bar !== l1.bar, l1.bar + ' → ' + l2.bar],
    ['on this published day the hide waits as ONE pending change', /^1 pending/.test(h2.pending), JSON.stringify({ chip: h2.pending, alpub: h2.alpub })],
    ['the Leave War page reads the same', A.grid === B.grid, hash(B.grid)], ['the OIL tracker reads the same', A.oil === B.oil, hash(B.oil)], ['the Leave War\'s saved rows are the same', A.rows === B.rows, hash(B.rows)]], [pic2, B.pic])
  await satList(); await H.tapLine(p, '#eWeek', SAT, ix); await L.settle(p)
  const l3 = await satList(); const h3 = await H.head(p, SAT)
  const D = await leavewar()
  H.judge('44b.2', '↺ on it; the Leave War page and the OIL tracker again', [['the line is plain again, nothing pending', !l3.lines.find(x => x.ix === ix).struck && !/pending/.test(h3.pending), l3.bar + ' · ' + h3.pending], ['the Leave War page, the OIL tracker and the saved rows are all the same', A.grid === D.grid && A.oil === D.oil && A.rows === D.rows, hash(D.oil)]], [D.pic])
} catch (e) { H.row('44b.X', 'the script', String(e && e.stack || e).slice(0, 700), /no "no period" line/.test(String(e)) ? 'NOT WALKED (the reminder was not raised — see 44b.0)' : 'FAIL', [await H.pic(p, '44b-X-error')]) }
C.done('44b', errors)
await browser.close()
