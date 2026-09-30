/* W3 part H — the scenario designer's no. 11: a war's lifecycle, desktop 1440×900, one fresh demo world, the admin.
   On a NEW period (so no record of the demo can be caught up in it): + New war → Open bidding → set the bidding window →
   clear it → a one-day event → a range band → Close bidding → Publish → Reopen (← Bidding closed). Each is its own
   L.step: it must change ONLY that war's own row (`leavewar/war:<id>`) — every bid, ledger, opening and profile row
   byte-identical — and a reload (the stage, the window, the events and bands read back; the reload writes nothing).
   (+ / − Event row are part G: they live in the settings key `eventrows`, not the war row.)
   Run from scripts/handpass:  node dbrA-W3-h.mjs */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-h.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, sheetNow, closeSheets, lwReload, stageNow, stageGo, warPick, pic, row, rowsSummary } = W

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const page = await W.newPage(ctx, errors, 'A')
const passNow = (from) => L.results.slice(from).every(r => r.ok)
async function run(name, fn) {
  try { await fn() } catch (e) {
    L.check(`${name} — the step ran`, false, 'THREW ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 400))
    await pic(page, `H-THREW-${name}`).catch(() => {})
    row({ step: name, width: 'desktop', did: 'THREW', screen: String(e && e.message || e).slice(0, 200), rows: '', ok: false })
    await closeSheets(page).catch(() => {})
  }
}
let WK = null        // the new war's row key
const NAME = 'H MAR 28'
const D0 = '2028-03-01'
/** what the war on screen reads: its stage, its bidding chip, the events and bands on the days we touch */
const read = () => page.evaluate(() => {
  const t = s => { const e = document.querySelector(`[data-testid="${s}"]`); return e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : '—' }
  const band = [...document.querySelectorAll('[data-testid^="event-band-"]')].map(e => `${e.getAttribute('data-testid')}:${(e.innerText || '').trim()}`)
  return { stage: t('stage-now'), window: t('bid-window'), ev06: t('event-0-2028-03-06'), bands: band }
})
async function stepWar(name, did, fn, check) {
  const k0 = L.results.length
  const a = await L.step(page, name, fn, { put: [new RegExp('^' + WK.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$')], only: true })
  L.check(`${name} — ONLY the war's own row changed, in ONE batch`, a.put.length === 1 && a.put[0] === WK && !a.del.length && a.batches.length === 1, { put: a.put, del: a.del, batches: a.batches })
  const before = await read()
  const rr = await lwReload(page, name, 'a', [])
  await lwOpen(page, D0)
  const after = await read()
  L.check(`${name} — after the reload the war reads the same`, JSON.stringify(before) === JSON.stringify(after), { before, after })
  if (check) check(after)
  await pic(page, `H-${name.split(' ')[0]}-after-reload`)
  row({ step: name, width: 'desktop', did, screen: JSON.stringify(after), rows: rowsSummary(a), ok: passNow(k0) })
}

await L.signIn(page, 'a')
await L.settle(page)
{
  const r0 = await L.rows(page)
  const b = Object.keys(r0).filter(k => k.startsWith('changes/')).map(k => JSON.parse(r0[k]))
  const ok = L.check('H0 first boot — ONE change-log batch, of type boot', b.length === 1 && b[0].type === 'boot', b.map(x => ({ type: x.type, n: (x.items || []).length })))
  row({ step: 'H0 first boot', width: 'desktop', did: 'fresh world, Saber', screen: '—', rows: `batches ${b.map(x => x.type + '/' + (x.items || []).length).join(' ')}`, ok, pics: [] })
}
await lwOpen(page, '2026-01-05')

await run('H1 create', async () => {
  const k0 = L.results.length
  const a = await L.step(page, `H1 + New war "${NAME}" (1–31 Mar 2028)`, async () => {
    await page.locator('[data-testid="war-new"]:visible').first().click(); await L.sleep(500)
    await page.fill('[data-testid="war-name"]', NAME)
    const day = async (iso) => { for (let i = 0; i < 40 && !(await page.locator(`[data-testid="war-day-${iso}"]`).count()); i++) { await page.locator('[data-testid="war-next-month"]').click(); await L.sleep(80) } await page.locator(`[data-testid="war-day-${iso}"]`).first().click(); await L.sleep(150) }
    await day('2028-03-01'); await day('2028-03-31')
    await page.locator('[data-testid="war-create"]').click(); await L.sleep(1500)
  }, { put: [/^leavewar\/war:/], also: [/^leavewar\/current$/], only: true })
  WK = a.put.find(k => k.startsWith('leavewar/war:'))
  L.check('H1 — ONE new war row (a separate small batch records which war is on screen)', !!WK && a.put.filter(k => k.startsWith('leavewar/war:')).length === 1, { put: a.put, batches: a.batches })
  const rr = await lwReload(page, 'H1 create', 'a', [])
  L.check('H1 — after the reload the picker lists it; the app opened on the war being bid on', (await warPick(page)).opts.some(o => o.t === NAME) && rr.bootWar === 'y2026', { boot: rr.bootWar })
  await lwOpen(page, D0)
  await pic(page, 'H1-after-reload')
  row({ step: 'H1 create a period', width: 'desktop', did: `+ New, "${NAME}", 1–31 Mar 28, Create`, screen: JSON.stringify(await read()), rows: rowsSummary(a), ok: passNow(k0) })
})
await run('H2 open', () => stepWar('H2 stage DRAFT → OPEN FOR BIDDING', '→ OPEN FOR BIDDING', async () => stageGo(page, 'advance'), a => L.check('H2 — reads OPEN FOR BIDDING', /OPEN/i.test(a.stage), a)))
await run('H3 window', () => stepWar('H3 bidding window: 2–15 Mar 28', 'the BIDDING ON chip → 2 Mar, 15 Mar → Open these dates', async () => {
  await page.locator('[data-testid="bid-window"]:visible').first().click(); await L.sleep(500)
  const day = async (iso) => { for (let i = 0; i < 40 && !(await page.locator(`[data-testid="window-day-${iso}"]`).count()); i++) { await page.locator('[data-testid="window-next-month"]').click(); await L.sleep(80) } await page.locator(`[data-testid="window-day-${iso}"]`).first().click(); await L.sleep(150) }
  const clr = page.locator('[data-testid="window-clear"]:visible'); if (await clr.count()) { await clr.click(); await L.sleep(150) }
  await day('2028-03-02'); await day('2028-03-15')
  await pic(page, 'H3-window-sheet')
  await page.locator('[data-testid="window-apply"]').click(); await L.sleep(600)
  const s = await sheetNow(page); if (s.open !== 'nothing') await closeSheets(page)
}, a => L.check('H3 — the chip reads 2 Mar – 15 Mar', /2 Mar.*15 Mar/.test(a.window), a)))
await run('H4 clear window', () => stepWar('H4 bidding window cleared (the whole period)', 'the chip → Clear → Open the whole year', async () => {
  await page.locator('[data-testid="bid-window"]:visible').first().click(); await L.sleep(500)
  await page.locator('[data-testid="window-clear"]:visible').click(); await L.sleep(200)
  await page.locator('[data-testid="window-apply"]').click(); await L.sleep(600)
  const s = await sheetNow(page); if (s.open !== 'nothing') await closeSheets(page)
}, a => L.check('H4 — the chip reads THE WHOLE YEAR', /WHOLE YEAR/i.test(a.window), a)))
await run('H5 day event', () => stepWar('H5 a one-day event: EVENT 1, Mon 6 Mar 28 "H-DAY"', 'tap EVENT 1 on 6 Mar, type H-DAY, Save', async () => {
  const c = page.locator('[data-testid="event-0-2028-03-06"]').first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(250); await c.click(); await L.sleep(500)
  await page.fill('[data-testid="event-text"]', 'H-DAY')
  await page.locator('[data-testid="event-apply"]').click(); await L.sleep(600)
  const s = await sheetNow(page); if (s.open !== 'nothing') await closeSheets(page)
}, a => L.check('H5 — 6 Mar reads H-DAY', /H-DAY/.test(a.ev06), a)))
await run('H6 band', () => stepWar('H6 a range band: EVENT 2, 9–13 Mar 28 "H-BAND"', 'tap EVENT 2 on 9 Mar, H-BAND, A range, 9 → 13 Mar, Save', async () => {
  const c = page.locator('[data-testid="event-1-2028-03-09"]').first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(250); await c.click(); await L.sleep(500)
  await page.fill('[data-testid="event-text"]', 'H-BAND')
  await page.locator('[data-testid="event-scope-range"]').click(); await L.sleep(300)
  const merge = page.locator('[data-testid="event-mode-merge"]'); if (await merge.count()) { await merge.click(); await L.sleep(150) }
  const clr = page.locator('[data-testid="event-clear"]:visible'); if (await clr.count()) { await clr.click(); await L.sleep(150) }
  for (const iso of ['2028-03-09', '2028-03-13']) { await page.locator(`[data-testid="event-day-${iso}"]`).first().click(); await L.sleep(150) }
  await pic(page, 'H6-band-sheet')
  await page.locator('[data-testid="event-apply"]').click(); await L.sleep(600)
  const s = await sheetNow(page); if (s.open !== 'nothing') await closeSheets(page)
}, a => L.check('H6 — a band on EVENT 2 from 9 Mar reading H-BAND', a.bands.some(b => /event-band-1-2028-03-09:H-BAND/.test(b)), a)))
await run('H7 close', () => stepWar('H7 stage OPEN → BIDDING CLOSED', '→ BIDDING CLOSED', async () => stageGo(page, 'advance'), a => L.check('H7 — reads BIDDING CLOSED', /CLOSED/i.test(a.stage), a)))
await run('H8 publish', () => stepWar('H8 stage CLOSED → PUBLISHED', '→ PUBLISHED', async () => stageGo(page, 'advance'), a => L.check('H8 — reads PUBLISHED', /PUBLISHED/i.test(a.stage), a)))
await run('H9 reopen', () => stepWar('H9 reopen: PUBLISHED → ← BIDDING CLOSED', '← BIDDING CLOSED', async () => stageGo(page, 'back'), a => L.check('H9 — reads BIDDING CLOSED, the events and band kept', /CLOSED/i.test(a.stage) && /H-DAY/.test(a.ev06) && a.bands.some(b => /H-BAND/.test(b)), a)))

{
  const r = await L.rows(page)
  L.check('part H — exactly three war rows now (the two demo wars and the new one)', Object.keys(r).filter(k => k.startsWith('leavewar/war:')).length === 3, Object.keys(r).filter(k => k.startsWith('leavewar/war:')))
}
L.check('part H — no console errors, page errors, failed requests or native dialogs', !errors.length, errors.slice(0, 20))
L.save({ table: W.TABLE, errors })
await browser.close()
