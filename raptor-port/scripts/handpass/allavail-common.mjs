// D953 (17 Oct 26) — his direction: an input filed for ALL AVAIL or ALL (a duty or other commitment, never OD) shows on
// the COMMON PROGRAMME by default, not the Ground Programme. Drawn on the BUILT app before anything is designed (D853,
// D921): a real ALL AVAIL Meeting filed through the new-input window, where it lands today (real), then the same row
// moved into the Common Programme block of the same day (drawn — the page's own row node moved, nothing restyled).
// Filing steps copied from aa-B-lib.mjs (the ALL AVAIL check of 9 Oct 26), which is not imported: it makes folders in
// another checkout when loaded.
//
//   node scripts/handpass/allavail-common.mjs [out dir]        (LOOK_URL=http://localhost:4191/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('allavail-common v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-17-allavail-common')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4191/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const sleep = ms => new Promise(r => setTimeout(r, ms))
const errs = [], facts = {}
const RMK = 'Squadron brief'

async function go(page, to) { await page.evaluate(p => window.go(p), to); await page.waitForFunction(p => window.CURPAGE === p, to); await sleep(450) }
/* the month is turned with the calendar's own arrows until the day's cell is drawn (the calendar was redrawn since the
   9 Oct walk, and its month heading changed) */
async function showDay(page, iso) {
  await go(page, 'inputs')
  if (await page.locator('#inCalBtn').count()) { await page.locator('#inCalBtn').click(); await sleep(300) }
  const back = iso < new Date().toISOString().slice(0, 10)
  for (let i = 0; i < 24 && !(await page.locator(`#page-inputs [data-icday="${iso}"]`).count()); i++) { await page.locator(back ? '#icPrev' : '#icNext').click(); await sleep(150) }
}
async function fileAllAvail(page, iso) {
  await showDay(page, iso)
  await page.locator(`#page-inputs [data-icday="${iso}"]`).first().click({ position: { x: 8, y: 8 } })
  await sleep(300)
  await page.locator('#icPopAdd').click()
  await page.waitForSelector('[data-testid="win-inputedit"]'); await sleep(200)
  await page.selectOption('#inpEditType', 'Meeting')
  await page.selectOption('#inpEditPerson', 'allavail')
  await page.fill('#inpEditRmk', RMK)
  const ad = page.locator('#inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.uncheck()
  for (const [sel, v] of [['#inpEditStart', '13:00'], ['#inpEditEnd', '14:00']]) { const l = page.locator(sel).first(); if (await l.count()) { await l.fill(v); await l.blur() } }
  await page.locator('#inpEditSave').click(); await sleep(400)
  if (await page.locator('[data-testid="oilconf"]').count()) { await page.locator('[data-testid="oil-no"]').click(); await page.locator('[data-testid="oilconf-save"]').click(); await sleep(350) }
  return page.evaluate(r => { const x = window.INPUTS.find(i => i.remarks === r); return x ? { type: x.type, acc: x.acc || '', who: JSON.stringify(x.people || x.person) } : null }, RMK)
}

const MARK = (page, sel, label, color) => page.evaluate(([sel, label, color]) => {
  const e = document.querySelector(sel); if (!e) return 'MISSING ' + sel
  const r = e.getBoundingClientRect(), l = document.createElement('div'); l.className = 'wp-float'; l.textContent = label
  l.style.cssText = `position:fixed;z-index:99999;top:${r.top - 22}px;left:${Math.max(2, r.left)}px;background:${color};color:${color === '#34c759' ? '#05210f' : '#fff'};font:700 12px/16px system-ui;padding:0 6px;border-radius:3px;white-space:nowrap`
  const box = document.createElement('div'); box.className = 'wp-float'
  box.style.cssText = `position:fixed;z-index:99998;top:${r.top - 3}px;left:${r.left - 3}px;width:${r.width + 6}px;height:${r.height + 6}px;border:2px solid ${color};border-radius:4px;pointer-events:none`
  document.body.append(box, l); return 'ok'
}, [sel, label, color])
const UNMARK = page => page.evaluate(() => document.querySelectorAll('.wp-float').forEach(e => e.remove()))

for (const size of [{ tag: 'phone', viewport: { width: 390, height: 844 }, dsf: 3, touch: true }, { tag: 'desk', viewport: { width: 1440, height: 1000 }, dsf: 2 }]) {
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.dsf, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage(); const T = size.tag
  page.on('pageerror', e => errs.push(`${T} pageerror: ` + String(e).slice(0, 200)))
  await page.goto(URL + '?fresh=1')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(500)
  facts[T + ' filed'] = await fileAllAvail(page, '2026-07-13')
  await go(page, 'viewsched')

  /* the day's two blocks and the row: the row is found by its remark; its block and the Common Programme block by their
     headings, inside the same day */
  const geo = await page.evaluate(rmk => {
    const n = [...document.querySelectorAll('#vWeek .ntx')].find(e => e.textContent.includes(rmk)); if (!n) return { err: 'no row' }
    const row = n.closest('.pl-row') || n.parentElement; row.id = 'wp-row'
    const day = row.closest('.day'); day.id = day.id || 'wp-day'
    const heads = [...day.querySelectorAll('*')].filter(e => e.children.length === 0 && /^(common programme|ground programme)$/i.test(e.textContent.trim()))
    const ch = heads.find(h => /common/i.test(h.textContent)), gh = heads.find(h => /ground/i.test(h.textContent))
    const blk = h => { let b = h; while (b.parentElement && b.parentElement !== day && !b.parentElement.querySelector(':scope > .pl-row')) b = b.parentElement; return b.parentElement && b.parentElement !== day ? b.parentElement : b }
    const cb = ch && blk(ch), gb = gh && blk(gh)
    if (cb) cb.id = 'wp-common'; if (gb) gb.id = 'wp-ground'
    const cRows = cb ? [...cb.querySelectorAll('.pl-row')] : []
    return { heads: heads.map(h => h.textContent.trim()), commonRows: cRows.length, rowIn: gb && gb.contains(row) ? 'ground' : cb && cb.contains(row) ? 'common' : 'other', rowText: row.innerText.replace(/\s+/g, ' ').slice(0, 80) }
  }, RMK)
  facts[T + ' geometry'] = geo
  /* framed on the row: its day column's width, the rows above it (its own block's heading on the "today" frame, the
     Common Programme's last rows on the drawn one) and a little below */
  const clip = async () => page.evaluate(() => {
    const r0 = document.getElementById('wp-row'); r0.scrollIntoView({ block: 'center' })
    const day = document.getElementById('wp-day').getBoundingClientRect(), r = r0.getBoundingClientRect()
    const top = Math.max(0, r.top - Math.min(330, innerHeight * 0.4)), bottom = Math.min(innerHeight, r.bottom + 70)
    const left = Math.max(0, day.left - 2), right = Math.min(innerWidth, day.right + 2)
    return { x: left, y: top, width: right - left, height: bottom - top }
  })
  if (geo.err) { errs.push(T + ' ' + geo.err); await ctx.close(); continue }
  let c = await clip()
  await MARK(page, '#wp-row', 'Today: lands on the Ground Programme', '#ff2d55')
  await page.screenshot({ path: join(OUT, `${T}-1-today.png`), clip: c }); await UNMARK(page)

  /* DRAWN: the same row node moved to the end of the Common Programme's rows */
  /* the Common Programme is the day's `.allhands` block; its rows (`.ah-row`) have the Ground Programme row's own cells,
     so the real row is moved across with its class swapped, placed in time order as the block reads */
  facts[T + ' moved'] = await page.evaluate(() => {
    const row = document.getElementById('wp-row'), day = document.getElementById('wp-day')
    const cb = day.querySelector('.allhands'); if (!cb) return 'NO COMMON BLOCK'
    row.classList.remove('pl-row'); row.classList.add('ah-row')
    const t = r => { const x = r.querySelector('.t'); return x ? x.textContent.trim() : '99:99' }
    const after = [...cb.querySelectorAll('.ah-row')].find(r => r !== row && t(r) > '13:00')
    if (after) after.before(row); else cb.append(row)
    return 'moved, before ' + (after ? after.querySelector('.ntx').textContent.trim() : 'the end')
  })
  c = await clip()
  await MARK(page, '#wp-row', 'Proposed: on the Common Programme', '#34c759')
  await page.screenshot({ path: join(OUT, `${T}-2-proposed.png`), clip: c }); await UNMARK(page)
  await ctx.close()
}
writeFileSync(join(OUT, 'facts.json'), JSON.stringify(facts, null, 1))
console.log(JSON.stringify(facts, null, 1))
console.log('errors:', errs.length); for (const e of errs.slice(0, 20)) console.log('  ' + e)
await browser.close()
