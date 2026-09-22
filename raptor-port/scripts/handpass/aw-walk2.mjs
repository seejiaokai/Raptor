/* [ALL-AVAIL-WINDOW] — the walk's second pass, 23 Sep 26: the three orders the
   first pass could not reach. (1) The board PREVIEWING the issued version through
   the plans menu, with OIL Earn on — the one place a version's chip meets the
   earn mode — where the earn half must be read-only. (2) The PHONE with the mode
   on through its own day-bar button, a masked row, and the refusal toast: is it
   seen over the bottom panel? Then a drag of the panel. (3) A MEMBER reading the
   issued face's window. Same fixture, same pictures folder as aw-walk.mjs. */
import { open, go, board, tap, type, put, shot, publish } from './lib.mjs'
import { buildSaturday } from './fixture.mjs'

const DI = 5
const R = {}
const step = async (name, fn) => {
  try { R[name] = await fn() } catch (e) { R[name] = { THREW: String(e && e.message || e).slice(0, 300) } }
}
const { browser, page, errors } = await open({ width: 1440, height: 900 })
const win = () => page.evaluate(() => {
  const w = document.querySelector('.availwin:not([hidden])')
  if (!w) return { open: false }
  const r = w.getBoundingClientRect()
  return { open: true, tabs: [...w.querySelectorAll('.win-tab')].map(t => (t.textContent || '').trim() + (t.classList.contains('on') ? ' [on]' : '')),
    one: (w.querySelector('.win-one')?.textContent || '').trim(), n: w.querySelectorAll('.rpuck').length,
    flagged: [...w.querySelectorAll('.rpuck.flagged, .rpuck.clash')].map(x => (window.PEOPLE[x.dataset.awp] || {}).cs),
    from: (w.querySelector('.win-from')?.textContent || '').trim(), foot: (w.querySelector('.win-foot')?.textContent || '').trim(),
    rect: { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } }
})
const openChip = async (item, where) => {
  const c = page.locator(`${where} [data-oilsent="${item}"]:visible`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
  await c.click({ timeout: 4000 }); await page.waitForTimeout(350)
  return win()
}
const tapFirstMan = async () => {
  const p = page.locator('.availwin .rpuck .puck').first()
  const id = await page.locator('.availwin .rpuck').first().getAttribute('data-awp')
  await p.click({ timeout: 4000 }); await page.waitForTimeout(300)
  return id
}
const closeWin = async () => { if (await page.locator('.availwin:not([hidden]) .win-x').count()) { await page.click('.availwin .win-x'); await page.waitForTimeout(250) } }

let OPS = null
await step('0-build', async () => {
  const log = await buildSaturday(page, DI)
  await tap(page, `[data-gradd="${DI}"]`)
  const gi = await page.evaluate(() => window.DAYS[5].ground.length - 1)
  await type(page, `[data-bfld="gr:${DI}.${gi}.prog"]`, 'OPS BRIEF')
  await type(page, `[data-bfld="gr:${DI}.${gi}.str"]`, '16:00')
  await type(page, `[data-bfld="gr:${DI}.${gi}.end"]`, '17:00')
  log.push('OPS BRIEF ' + await put(page, `[data-fill="g:${DI}.${gi}.+"]`, ['allavail']))
  OPS = await page.evaluate(() => { const r = window.DAYS[5].ground.find(x => x.prog === 'OPS BRIEF'); return r && r.rid ? `r:${r.rid}` : null })
  return log.filter(l => /FAILED/.test(l)).length ? log : 'all placed'
})

/* (1) the board previewing the ISSUED version, with the mode on */
await step('1-publish', async () => publish(page, DI))
await step('2-preview-issued-earn-readonly', async () => {
  /* THE OTHER ORDER: the mode ON first, then the issued preview — the first
     pass found the mode's button DISABLED while a preview is up */
  await page.locator('#sbOil').click(); await page.waitForTimeout(600)
  const modeOn = await page.evaluate(() => window.OILDAY)
  await tap(page, `[data-planmenu="${DI}"]`).catch(() => {})
  const pv = page.locator('[data-planpv]:visible').first()
  const menuOffered = await pv.count()
  if (menuOffered) { await pv.click(); await page.waitForTimeout(600) }
  const state = await page.evaluate(() => ({ oilday: window.OILDAY, previewing: [...(window.DPREV || new Map()).keys()] }))
  if (!menuOffered) { await page.keyboard.press('Escape'); await page.locator('#sbOil').click().catch(() => {}); return { modeOn, menuOffered: 0, state, note: 'the plans menu does not open while the mode is on' } }
  const w0 = await openChip(OPS, '#schedBoard')
  let earn = null
  if (w0.tabs.length === 2) { await page.locator('.availwin .win-tab').nth(1).click(); await page.waitForTimeout(300); earn = await win() }
  const before = await page.evaluate(() => JSON.stringify(window.DAYS[5].oild || {}))
  await tapFirstMan()
  const after = await page.evaluate(() => JSON.stringify(window.DAYS[5].oild || {}))
  const w = await win()
  await shot(page, '21-desk-issued-preview-earn-readonly')
  await closeWin()
  await page.locator('#sbOil').click().catch(() => {}); await page.waitForTimeout(400)
  await tap(page, `[data-planmenu="${DI}"]`)
  await page.locator('[data-plangolive]:visible').first().click().catch(() => {}); await page.waitForTimeout(500)
  return { modeOn, state, opened: { tabs: w0.tabs, from: w0.from }, earnTab: earn && earn.tabs, foot: w.foot, wroteToWorkingCopy: before !== after }
})

/* (2) the phone: the mode through its own button, a masked row, the toast */
await step('3-phone-mode-masked-toast', async () => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(500)
  await board(page, DI)
  await tap(page, `[data-oilmode="${DI}"]`)
  await tap(page, `[data-oilitem="${OPS}"]`)
  const w = await openChip(OPS, '#schedBoard')
  await tapFirstMan()
  await page.waitForTimeout(150)
  const toast = await page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return null
    const b = t.getBoundingClientRect(), wr = document.querySelector('.availwin').getBoundingClientRect()
    return { text: t.textContent, shown: t.style.opacity !== '0', z: getComputedStyle(t).zIndex,
      overlapsWindow: b.top < wr.bottom && b.bottom > wr.top } })
  await shot(page, '22-phone-masked-refusal-toast-over-panel')
  await closeWin()
  await tap(page, `[data-oilitem="${OPS}"]`)
  await tap(page, `[data-oilmode="${DI}"]`)
  return { tabs: w.tabs, toast }
})
await step('4-phone-drag-panel-down', async () => {
  await openChip(OPS, '#schedBoard')
  const b = await page.locator('.availwin .win-ttl').boundingBox()
  await page.mouse.move(b.x + 20, b.y + 8); await page.mouse.down()
  await page.mouse.move(b.x + 20, b.y + 308, { steps: 8 }); await page.mouse.up()
  const w = await win()
  await shot(page, '23-phone-panel-dragged-down')
  await closeWin()
  return { rect: w.rect }
})

/* (3) a MEMBER reads the issued face's window */
await step('5-member-reads-issued-window', async () => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(400)
  await page.evaluate(() => document.getElementById('logout')?.click()); await page.waitForTimeout(500)
  await page.fill('#luser', 'us'); await page.fill('#lpass', 'us')
  await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(900)
  await go(page, 'viewsched')
  const w = await openChip(OPS, `#vWeek .day[data-day="${DI}"]`)
  await tapFirstMan()
  const after = await win()
  await shot(page, '24-member-issued-window')
  return { tabs: w.tabs, one: w.one, from: w.from, flagged: w.flagged, footAfterTap: after.foot }
})

R.errors = errors.slice(0, 20)
console.log(JSON.stringify(R, null, 1))
await browser.close()
