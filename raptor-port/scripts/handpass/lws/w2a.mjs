// W2 walk, Item 6 — scenarios 21, 22 (a)(c)(h), 23, 25. VERSION 1
// The phone must draw a man's row in the month he is in even when his dates changed while the Leave War page was away.
// Run: node w2a.mjs phone|desktop. Writes out/w2a-<size>.json (rows per month per scenario) and prints a result line each.
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openWorld, tools } from './w2lib.mjs'
console.log('w2a.mjs VERSION 1')
const WHICH = process.argv[2] || 'phone'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'out'); mkdirSync(OUT, { recursive: true })
const data = {}
const allResults = []
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null

async function pickDate(w, t, iso) {
  const { page } = w
  const want = iso.slice(0, 7)
  for (let i = 0; i < 14; i++) {
    if (await page.locator(`[data-testid="dcal-day-${iso}"]`).count()) break
    const cur = await page.locator('[data-testid="dcal"]').first().getAttribute('data-month')
    await t.press(cur < want ? '[data-testid="dcal-next"]' : '[data-testid="dcal-prev"]')
  }
  await t.press(`[data-testid="dcal-day-${iso}"]`)
}
async function addMan(w, t, cs, ini, cat, postIn) {
  const { page } = w
  await t.adminUsers()
  await page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
  await page.fill('#accAddCs', cs); await page.fill('#accAddIni', ini)
  await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', cat)
  if (postIn) { await t.press('#accAddPostIn'); await pickDate(w, t, postIn) }
  const before = await page.evaluate(() => Object.keys(window.PEOPLE).length)
  await t.press('#accAdd'); await page.waitForTimeout(600)
  const after = await page.evaluate(() => Object.keys(window.PEOPLE).length)
  if (after !== before + 1) throw new Error(`add ${cs}: people ${before} -> ${after}`)
}
async function archiveMan(w, t, cs) {
  const { page } = w
  await t.adminUsers()
  await page.fill('#accFind', cs); await page.waitForTimeout(300)
  await t.press(`#accList .acc-main:has-text("${cs}")`); await t.press('#accEdArchive'); await page.waitForTimeout(500)
  await page.fill('#accFind', '')
}
async function restoreMan(w, t, cs, postIn) {
  const { page } = w
  await t.adminUsers()
  if ((await page.locator('#accArchToggle').getAttribute('aria-expanded')) !== 'true') await t.press('#accArchToggle')
  await t.press(`#accArchList .acc-main:has-text("${cs}")`)
  if (postIn) { await t.press('#accArPostIn'); await pickDate(w, t, postIn) }
  await t.press('#accArRestore'); await page.waitForTimeout(700)
}
// layout checks on what is drawn now (scenario 25)
const layout = page => page.evaluate(() => {
  const probs = []
  const trs = [...document.querySelectorAll('.mx tbody tr')].filter(tr => /^(row-|group-|subcat-)/.test(tr.getAttribute('data-testid') || ''))
  let grp = null; const groups = []; let prev = null
  for (const tr of trs) {
    const t = tr.getAttribute('data-testid')
    const rt = tr.getBoundingClientRect()
    if (prev && rt.height > 0 && Math.abs(rt.top - prev.bottom) > 1.5) probs.push(`gap/overlap of ${Math.round(rt.top - prev.bottom)}px before ${t}`)
    if (rt.height > 0) prev = rt
    if (t.startsWith('subcat-')) continue
    if (t.startsWith('group-')) { if (grp) groups.push(grp); const m = /·\s*(\d+)/.exec(tr.innerText); grp = { head: tr.innerText.replace(/\s+/g, ' ').trim(), count: m ? +m[1] : null, rows: 0 }; continue }
    const id = t.slice(4)
    const cs = (tr.querySelector('span.cs')?.textContent || '').trim()
    if (!cs) probs.push('row without a name: ' + id)
    const who = tr.querySelector('td.who'), cell = tr.querySelector('[data-testid^="cell-"]')
    if (cell && !cell.getAttribute('data-testid').startsWith('cell-' + id + '-')) probs.push(`row ${id} draws a cell of ${cell.getAttribute('data-testid')}`)
    if (who && cell) { const a = who.getBoundingClientRect(), b = cell.getBoundingClientRect(); if (Math.abs(a.top - b.top) > 1.5 || Math.abs(a.bottom - b.bottom) > 1.5) probs.push(`name of ${id} not level with its days (${Math.round(a.top)}-${Math.round(a.bottom)} vs ${Math.round(b.top)}-${Math.round(b.bottom)})`) }
    if (!who) probs.push('row without a name cell: ' + id)
    if (grp) grp.rows++
  }
  if (grp) groups.push(grp)
  for (const g of groups) if (g.count !== null && g.count !== g.rows) probs.push(`heading "${g.head}" says ${g.count}, rows drawn ${g.rows}`)
  return { probs, groups: groups.map(g => `${g.head} -> ${g.rows}`) }
})

async function scenario(id, fn) {
  if (ONLY && !ONLY.includes(id)) return
  console.log(`\n== ${id} (${WHICH})`)
  const w = await openWorld(WHICH); const t = tools(w, 'w2-s' + id.replace(/[^0-9a-z]/gi, ''))
  const rec = (sc, verdict, seen, pic = '') => { t.rec(sc, WHICH, verdict, seen, pic); allResults.push({ id: sc, size: WHICH, verdict, seen, pic }) }
  try { await fn(w, t, rec) } catch (e) { console.log('  STEP-ERROR ' + String(e).split('\n')[0].slice(0, 300)); allResults.push({ id, size: WHICH, verdict: 'NOT WALKED', seen: String(e).split('\n')[0].slice(0, 300) }) }
  console.log('  errors', JSON.stringify(w.errors))
  if (w.errors.length) allResults.push({ id: id + '-errors', size: WHICH, verdict: 'ERRORS', seen: JSON.stringify(w.errors) })
  await w.browser.close()
}
const has = (rows, cs) => rows.filter(r => r.cs === cs)
const lwMonth = async (w, t, m) => { await t.lw(m); const rows = await t.rowsDrawn(); return rows }

// ---------------- 21 the original fault
await scenario('21', async (w, t, rec) => {
  const { page } = w
  await t.lw('OCT')
  const octBefore = await t.rowsDrawn()
  await addMan(w, t, 'Probey', 'PB', 'C', '2026-10-01')
  await archiveMan(w, t, 'Probey')
  await restoreMan(w, t, 'Probey', '2026-11-01')
  const person = await t.personId('Probey')
  console.log('  Probey id', person, 'dates', JSON.stringify(await page.evaluate(i => ({ from: window.PEOPLE[i]?.from, to: window.PEOPLE[i]?.to }), person)))
  await t.lw('NOV')
  const nov = await t.rowsDrawn(); const l1 = await layout(page); await t.shotRow('nov', 'tr[data-testid="row-'+person+'"]')
  await t.press('[data-testid="month-OCT"]'); await page.waitForTimeout(900)
  const oct = await t.rowsDrawn(); const l2 = await layout(page); await t.shotRow('oct', 'tr[data-testid="row-'+person+'"]')
  data['21'] = { OCT: oct.map(r => r.id + '|' + r.group), NOV: nov.map(r => r.id + '|' + r.group), octBeforeN: octBefore.length }
  const inNov = has(nov, 'Probey')
  rec('21-NOV', inNov.length === 1 && /OPS P/.test(inNov[0].group) ? 'PASS' : 'FAIL', `Nov: ${nov.length} rows; Probey rows ${JSON.stringify(inNov)}`, 'w2-s21-' + WHICH + '-nov.png')
  const inOct = has(oct, 'Probey')
  rec('21-OCT', 'INFO', `Oct: ${oct.length} rows; Probey rows ${JSON.stringify(inOct)} (compare with desktop)`, 'w2-s21-' + WHICH + '-oct.png')
  rec('21-layout', l1.probs.length + l2.probs.length === 0 ? 'PASS' : 'FAIL', `Nov problems ${JSON.stringify(l1.probs)}; Oct problems ${JSON.stringify(l2.probs)}; Nov groups ${JSON.stringify(l1.groups)}`)
})

// ---------------- 22a a post-in set later, made while away
await scenario('22a', async (w, t, rec) => {
  const { page } = w
  await t.lw('OCT')
  await addMan(w, t, 'Aprobe', 'AP', 'C', '2026-12-01')
  await t.lw('DEC')
  const dec = await t.rowsDrawn(); const l = await layout(page); await t.shotRow('dec', 'tr[data-testid="row-'+(has(dec,'Aprobe')[0]||{}).id+'"]', 'tr[data-testid="row-dj"]')
  await t.press('[data-testid="month-OCT"]'); await page.waitForTimeout(900)
  const oct = await t.rowsDrawn()
  data['22a'] = { DEC: dec.map(r => r.id + '|' + r.group), OCT: oct.map(r => r.id + '|' + r.group) }
  rec('22a-DEC', has(dec, 'Aprobe').length === 1 && /OPS P/.test(has(dec, 'Aprobe')[0].group) ? 'PASS' : 'FAIL', `Dec: ${dec.length} rows; Aprobe ${JSON.stringify(has(dec, 'Aprobe'))}`, 'w2-s22a-' + WHICH + '-dec.png')
  rec('22a-OCT', has(oct, 'Aprobe').length === 0 ? 'PASS' : 'FAIL', `Oct: ${oct.length} rows; Aprobe ${JSON.stringify(has(oct, 'Aprobe'))} (post-in 1 Dec, so no row in Oct)`)
  rec('22a-layout', l.probs.length === 0 ? 'PASS' : 'FAIL', JSON.stringify(l.probs))
})

// ---------------- 22c PO from 1 Nov made while away (bridge), and the app's own archive (PO from today)
await scenario('22c', async (w, t, rec) => {
  const { page } = w
  await t.lw('OCT')
  const before = await t.rowsDrawn()
  await t.adminUsers()
  await page.evaluate(() => window.lwSetPostOut('freak', '2026-11-01'))   // Echo: set-up by the bridge (the page is away)
  await t.lw('NOV')
  const nov = await t.rowsDrawn(); const l = await layout(page); await t.shotRow('nov', 'tr[data-testid="row-slipway"]')
  await t.press('[data-testid="month-OCT"]'); await page.waitForTimeout(900)
  const oct = await t.rowsDrawn(); await t.shotRow('oct', 'tr[data-testid="row-freak"]')
  data['22c'] = { NOV: nov.map(r => r.id + '|' + r.group), OCT: oct.map(r => r.id + '|' + r.group) }
  rec('22c-NOV', before.some(r => r.id === 'freak') && !nov.some(r => r.id === 'freak') ? 'PASS' : 'FAIL', `Oct before: Echo drawn ${before.some(r => r.id === 'freak')}; Nov after PO 1 Nov: Echo drawn ${nov.some(r => r.id === 'freak')}, rows ${before.length} -> ${nov.length}`, 'w2-s22c-' + WHICH + '-nov.png')
  rec('22c-OCT', oct.some(r => r.id === 'freak') ? 'PASS' : 'FAIL', `Oct: Echo drawn ${oct.some(r => r.id === 'freak')}; rows ${oct.length}`, 'w2-s22c-' + WHICH + '-oct.png')
  rec('22c-layout', l.probs.length === 0 ? 'PASS' : 'FAIL', JSON.stringify(l.probs))
})
await scenario('22c-archive', async (w, t, rec) => {
  const { page } = w
  await t.lw('OCT')
  const before = await t.rowsDrawn()
  await archiveMan(w, t, 'Basher')   // the app's own control: archive = posted out from today
  await t.lw('NOV')
  const nov = await t.rowsDrawn(); await t.shotRow('nov', 'tr[data-testid="row-slipway"]')
  await t.press('[data-testid="month-OCT"]'); await page.waitForTimeout(900)
  const oct = await t.rowsDrawn()
  rec('22c-archive-NOV', before.some(r => r.cs === 'Basher') && !nov.some(r => r.cs === 'Basher') ? 'PASS' : 'FAIL', `Basher drawn in Oct before ${before.some(r => r.cs === 'Basher')}; Nov after archive ${nov.some(r => r.cs === 'Basher')}; rows ${before.length}->${nov.length}`, 'w2-s22carchive-' + WHICH + '-nov.png')
  rec('22c-archive-OCT', oct.some(r => r.cs === 'Basher') ? 'PASS' : 'FAIL', `Oct: Basher drawn ${oct.some(r => r.cs === 'Basher')} (his past kept)`)
})

// ---------------- 22h clearing leave for a posted-out man in a month after his PO (display span)
await scenario('22h', async (w, t, rec) => {
  const { page } = w
  await t.lw('OCT')
  await t.adminUsers()
  await page.evaluate(() => {
    window.lwSetPostOut('freak', '2026-11-01')
    window.fileInput({ iid: 'w2-h', person: 'freak', type: 'LL', date: 'Dec 8', endDate: 'Dec 10', yr: 2026, allday: true })
  })
  console.log('  Echo dates', JSON.stringify(await page.evaluate(() => ({ from: window.PEOPLE.freak.from, to: window.PEOPLE.freak.to, inputs: window.INPUTS.filter(i => i.person === 'freak').length }))))
  await t.lw('DEC')
  const dec = await t.rowsDrawn(); const l = await layout(page); await t.shotRow('dec', 'tr[data-testid="row-freak"]')
  data['22h'] = { DEC: dec.map(r => r.id + '|' + r.group) }
  const cell = await page.evaluate(() => { const c = document.querySelector('[data-testid="cell-freak-2026-12-08"]'); return c ? (c.innerText || '').trim() + ' / ' + c.className.slice(0, 60) : 'NO CELL' })
  rec('22h-DEC', dec.some(r => r.id === 'freak') ? 'PASS' : 'FAIL', `Dec: Echo drawn ${dec.some(r => r.id === 'freak')}; his 8 Dec cell: ${cell}; rows ${dec.length}`, 'w2-s22h-' + WHICH + '-dec.png')
  rec('22h-layout', l.probs.length === 0 ? 'PASS' : 'FAIL', JSON.stringify(l.probs))
})

// ---------------- 23 a swap with the same count
await scenario('23', async (w, t, rec) => {
  const { page } = w
  // B: added and archived BEFORE the Leave War is first drawn, so he has no row; A: on the roster with a Nov post-in
  await addMan(w, t, 'Bswap', 'BS', 'C', '2026-11-01')
  await archiveMan(w, t, 'Bswap')
  await addMan(w, t, 'Aswap', 'AS', 'C', '2026-11-01')
  await t.lw('NOV')
  const before = await t.rowsDrawn(); await t.shotRow('before', 'tr[data-testid="row-dj"]')
  const A0 = has(before, 'Aswap').length, B0 = has(before, 'Bswap').length
  // away: archive A and restore B (post-in 1 Nov again)
  await archiveMan(w, t, 'Aswap')
  await restoreMan(w, t, 'Bswap', '2026-11-01')
  console.log('  A', JSON.stringify(await page.evaluate(() => { const e = Object.values(window.PEOPLE).find(v => v.cs === 'Aswap'); return e ? { from: e.from, to: e.to } : null })), 'B', JSON.stringify(await page.evaluate(() => { const e = Object.values(window.PEOPLE).find(v => v.cs === 'Bswap'); return e ? { from: e.from, to: e.to } : null })))
  await t.lw()  // back on the same month: no month button pressed
  await page.waitForTimeout(900)
  const sameMonth = await t.rowsDrawn(); const l = await layout(page); await t.shotRow('after-return', 'tr[data-testid="row-dj"]')
  await t.press('[data-testid="month-NOV"]'); await page.waitForTimeout(900)
  const pressed = await t.rowsDrawn(); await t.shotRow('after-press', 'tr[data-testid="row-dj"]')
  data['23'] = { before: before.map(r => r.id), sameMonth: sameMonth.map(r => r.id), pressed: pressed.map(r => r.id) }
  rec('23-setup', A0 === 1 && B0 === 0 ? 'OK' : 'NOT WALKED', `before: Aswap drawn ${A0}, Bswap drawn ${B0}; rows ${before.length}`)
  rec('23-return', !has(sameMonth, 'Aswap').length && has(sameMonth, 'Bswap').length === 1 ? 'PASS' : 'FAIL', `on return (no month pressed): Aswap ${has(sameMonth, 'Aswap').length}, Bswap ${has(sameMonth, 'Bswap').length}; rows ${before.length} -> ${sameMonth.length}`, 'w2-s23-' + WHICH + '-after-return.png')
  rec('23-pressed', !has(pressed, 'Aswap').length && has(pressed, 'Bswap').length === 1 ? 'PASS' : 'FAIL', `after pressing Nov: Aswap ${has(pressed, 'Aswap').length}, Bswap ${has(pressed, 'Bswap').length}; rows ${pressed.length}`)
  rec('23-layout', l.probs.length === 0 ? 'PASS' : 'FAIL', JSON.stringify(l.probs) + ' groups ' + JSON.stringify(l.groups))
})

writeFileSync(join(OUT, `w2a-${WHICH}.json`), JSON.stringify({ data, allResults }, null, 1))
console.log('\nDONE')
