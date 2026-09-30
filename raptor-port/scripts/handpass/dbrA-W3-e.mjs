/* W3 part E — the Leave War on a PHONE (390×844, isMobile, hasTouch — a finger, not a mouse), one fresh demo world, the
   admin: one bid by finger through the day's own sheet → its record row; reload → the same box. Then the same for the
   member (Ranger) on his own row.
   Run from scripts/handpass:  node dbrA-W3-e.mjs */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-e.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, tapCell, sheetNow, closeSheets, bidOn, lwReload, pic, row, rowsSummary } = W
const REC = /^leavewar\/rec:y2026:/

const browser = await L.launch()
const ctx = await L.context(browser, { phone: true })
const errors = []
const page = await W.newPage(ctx, errors, 'P')
const passNow = (from) => L.results.slice(from).every(r => r.ok)
async function run(name, fn) {
  try { await fn() } catch (e) {
    L.check(`${name} — the step ran`, false, 'THREW ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 400))
    await pic(page, `E-THREW-${name}`).catch(() => {})
    row({ step: name, width: 'phone', did: 'THREW', screen: String(e && e.message || e).slice(0, 200), rows: '', ok: false })
    await closeSheets(page).catch(() => {})
  }
}
const focusCell = async (pid, iso) => { await lwOpen(page, iso); const c = page.locator(`[data-testid="cell-${pid}-${iso}"]`).first(); if (await c.count()) { await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(400) } }
const sideScroll = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)

await L.signIn(page, 'a')
await L.settle(page)
{
  const r0 = await L.rows(page)
  const b = Object.keys(r0).filter(k => k.startsWith('changes/')).map(k => JSON.parse(r0[k]))
  const ok = L.check('E0 first boot (phone) — ONE change-log batch, of type boot', b.length === 1 && b[0].type === 'boot', b.map(x => ({ type: x.type, n: (x.items || []).length })))
  row({ step: 'E0 first boot', width: 'phone', did: 'fresh world on a phone, Saber', screen: '—', rows: `batches ${b.map(x => x.type + '/' + (x.items || []).length).join(' ')}`, ok, pics: [] })
}

const X = 'snap', D = '2026-01-14'   // Cinch, Wed 14 Jan
await run('11 phone bid', async () => {
  const k0 = L.results.length
  const o = await L.step(page, '11 (phone) opening the Leave War and its month writes nothing', async () => lwOpen(page, D), { none: true })
  const a = await L.step(page, '11 (phone) a finger taps Cinch\'s 14 Jan, then LL', async () => {
    const t = await tapCell(page, X, D, { finger: true })
    await pic(page, 'E-11-sheet')
    if (t.open !== 'bid-picker') { await closeSheets(page); return { firstTap: t.open, placed: false } }
    await W.sheetPress(page, 'bid-LL', { finger: true })
    let s = await sheetNow(page), asked = null
    if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text)) { asked = s.text; await W.sheetPress(page, 'bid-LL', { finger: true }); s = await sheetNow(page) }
    const placed = s.open === 'nothing'
    if (!placed) await closeSheets(page)
    return { firstTap: t.open, placed, asked }
  }, { put: [REC], only: true })
  L.check('11 — ONE record row (the bid), ONE batch', a.put.filter(k => REC.test(k)).length === 1 && !a.del.length && a.batches.length === 1, { put: a.put, batches: a.batches, ret: a.ret })
  await focusCell(X, D); await pic(page, 'E-11-bid-placed')
  const rr = await lwReload(page, '11 phone bid', 'a', [[X, D]])
  await focusCell(X, D); await pic(page, 'E-11-after-reload')
  L.check('11 — after the reload the box reads LL', /LL/.test((rr.after[`${X}@${D}`] || {}).text || ''), rr.after)
  L.check('11 — the phone page does not scroll sideways', (await sideScroll()) <= 0, await sideScroll())
  row({ step: '11 phone bid (admin)', width: 'phone', did: 'finger: tapped Cinch 14 Jan, LL', screen: JSON.stringify(rr.after), rows: rowsSummary(a), ok: passNow(k0) })
})

const ME = 'bane', DM = '2026-01-15'   // Ranger, Thu 15 Jan
await run('11b phone member bid', async () => {
  const k0 = L.results.length
  await page.reload(); await L.signIn(page, 'm', { goto: false })
  await lwOpen(page, DM)
  const a = await L.step(page, '11b (phone) Ranger\'s finger on his own 15 Jan, then LL', async () => bidOn(page, ME, DM, 'LL', { finger: true }), { put: [REC], only: true })
  L.check('11b — ONE record row, ONE batch', a.put.filter(k => REC.test(k)).length === 1 && !a.del.length && a.batches.length === 1, { put: a.put, batches: a.batches, ret: a.ret })
  const rr = await lwReload(page, '11b phone member bid', 'm', [[ME, DM], [X, D]])
  await focusCell(ME, DM); await pic(page, 'E-11b-after-reload')
  row({ step: '11b phone bid (member)', width: 'phone', did: 'Ranger signed in; finger: his 15 Jan, LL', screen: JSON.stringify(rr.after), rows: rowsSummary(a), ok: passNow(k0) })
})

L.check('part E — no console errors, page errors, failed requests or native dialogs', !errors.length, errors.slice(0, 20))
L.save({ table: W.TABLE, errors })
await browser.close()
