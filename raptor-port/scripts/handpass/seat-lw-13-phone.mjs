/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 11: the phone, and the
   periods. The standing order wants both widths on every walked surface. It
   also warns that the war grid draws only the SELECTED period's days, so a
   read of one period can produce a false "the war stops here" — both periods
   are opened and the credited Saturday looked for in each. */
import { open, go, shot } from './lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const { browser, page, errors } = await open({ state: OUT + '/state-lw-published.json', width: 390, height: 844 })

await go(page, 'leavewar')
await page.waitForTimeout(2500)
console.log('PHONE — the war as it opens:', await page.evaluate(() => ({
  period: (document.querySelector('[data-testid="war-picker"]') || {}).value,
  topRow: ((document.querySelector('.lw-top, .mx-top, [data-testid="oil-tracker"]')||{}).parentElement||{}).innerText?.replace(/\s+/g,' ').slice(0,120),
  oilBtn: (() => { const b = document.querySelector('[data-testid="oil-tracker"]')
    if (!b) return 'MISSING'; const r = b.getBoundingClientRect()
    return { label: (b.innerText || '').trim(), w: Math.round(r.width), h: Math.round(r.height), onScreen: r.width > 0 && r.right <= 400 } })(),
})))
await shot(page, 'LW-30-phone-war')

const satCell = await page.evaluate(() => {
  const c = document.querySelector('[data-testid="cell-nact-2026-07-18"]')
  if (!c) return 'NOT DRAWN — the phone window has not reached July'
  c.scrollIntoView({ block: 'center', inline: 'center' })
  const r = c.getBoundingClientRect()
  return { txt: (c.innerText || '').replace(/\s+/g, ' ').trim(), w: Math.round(r.width), h: Math.round(r.height) }
})
console.log('PHONE — Warden\'s credited Saturday cell:', JSON.stringify(satCell))
if (satCell === 'NOT DRAWN — the phone window has not reached July') {
  const jul = page.locator('[data-testid="month-JUL"]').first()
  if (await jul.count()) { await jul.click(); await page.waitForTimeout(1800) }
  console.log('PHONE — after jumping to JUL:', JSON.stringify(await page.evaluate(() => {
    const c = document.querySelector('[data-testid="cell-nact-2026-07-18"]')
    return c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : 'STILL NOT DRAWN' })))
}
await shot(page, 'LW-31-phone-saturday-cell')

await page.click('[data-testid="oil-tracker"]')
await page.waitForTimeout(1600)
console.log('PHONE — the OIL tracker:', JSON.stringify(await page.evaluate(() => {
  const s = document.querySelector('[data-testid="oil-sheet"]')
  if (!s) return 'DID NOT OPEN'
  const r = s.getBoundingClientRect()
  const w = document.querySelector('[data-testid="oil-bal-nact"]')
  return { w: Math.round(r.width), h: Math.round(r.height), overflowsRight: r.right > 400,
    wardenFigure: w ? w.textContent.trim() : 'NO ROW',
    rows: document.querySelectorAll('[data-testid^="oil-row-"]').length,
    window: (document.querySelector('[data-testid="oil-window"]') || {}).innerText || '' } })))
await shot(page, 'LW-32-phone-oil-tracker')
await page.keyboard.press('Escape'); await page.waitForTimeout(600)

/* THE PERIOD TRAP — the grid draws only the selected period. */
await page.selectOption('[data-testid="war-picker"]', 'y2027')
await page.waitForTimeout(2200)
console.log('\nafter switching to the 2027 period:', JSON.stringify(await page.evaluate(() => ({
  period: (document.querySelector('[data-testid="war-picker"]') || {}).value,
  julyCell: document.querySelector('[data-testid="cell-nact-2026-07-18"]') ? 'still drawn' : 'gone — 2026 days are not in this period',
  anyCells: document.querySelectorAll('[data-testid^="cell-nact-"]').length }))))
await page.click('[data-testid="oil-tracker"]')
await page.waitForTimeout(1600)
console.log('the OIL tracker on the 2027 period still shows the 18 Jul 26 credit?', JSON.stringify(await page.evaluate(() => {
  const r = document.querySelector('[data-oilrow="nact"]')
  if (!r) return 'NO ROW'
  const b = r.querySelector('[data-testid="oil-bal-nact"]')
  return { bal: b ? b.textContent.trim() : null,
    ents: [...r.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) } })))
await shot(page, 'LW-33-phone-2027-period')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
