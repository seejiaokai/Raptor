// Chat 5, 8 Nov 26 — the host's re-walk of what the code reads' fixes touched, on the new build. DIST=<build> SIZE=phone|pc
import { chromium, webkit, LAUNCH, serveDist } from 'file:///C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/scripts/drawcheck/lib.mjs'
import { openBoard, oilOn, selCount, toast, sleep, tag, standAt, fingerprint } from 'file:///C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/scripts/handpass/oeb-w2-lib.mjs'
import { fileSansOnBoard } from './oeb-host-sans-file.mjs'
import { mkdirSync } from 'node:fs'
const DIST = process.env.DIST, size = process.env.SIZE || 'pc', phone = size === 'phone'
const OUT = 'C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/docs/img/handpass/2026-11-08-oil-earn-board/host'
mkdirSync(OUT, { recursive: true })
const SIZES = {
  phone: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  pc: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 },
}
const STATE = 'C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/docs/handpass/state-sat.json'
const rows = []
const row = (id, ok, said) => { rows.push({ id, size, ok, said }); console.log(JSON.stringify({ id, size, ok, said })) }
const browser = await (phone ? webkit : chromium).launch(phone ? {} : { headless: true, ...LAUNCH })
const ctx = await browser.newContext({ ...SIZES[size], storageState: STATE })
await serveDist(ctx, 'http://localhost:4173', DIST)
await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
await page.goto('http://localhost:4173/')
await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' }).catch(() => {})
await page.waitForSelector('#luser')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(500)
const w = { browser, ctx, page, phone, size }
const press = async loc => { if (phone) await loc.tap(); else await loc.click() }
const clearNote = () => page.evaluate(() => { const x = document.querySelector('#toastEl'); if (x) x.textContent = '' })
const shot = (n, sel) => page.screenshot({ path: `${OUT}/${n}-${size}.png` })
try {
  await openBoard(w)
  const filed = await fileSansOnBoard(w, sleep)
  // R1 — the SANS tap, switch off then on: picks nobody, says the kind's reason
  for (const on of [false, true]) {
    await oilOn(w, true)
    const sw = page.locator('#schedBoard [data-oilblank]').filter({ visible: true }).first()
    if ((await sw.isChecked()) !== on) { await press(sw); await sleep(700) }
    const t = await tag(page, { root: '#sbBoard .sansav' })
    await standAt(page, '[data-w2="1"]', 420); await sleep(300)
    const fp = await fingerprint(page); await clearNote()
    await press(page.locator('[data-w2="1"]')); await sleep(250)
    const said = (await toast(page))?.text
    await shot(`R1-sans-tap-switch-${on ? 'on' : 'off'}`)
    row(`R1 SANS tap, switch ${on ? 'on' : 'off'}`, (await selCount(page)) === 0 && /^Nothing changed for .+\. A SANS availability request earns no OIL\.$/.test(said || '') && fp === await fingerprint(page), said)
  }
  // back to switch off, mode off
  { const sw = page.locator('#schedBoard [data-oilblank]').filter({ visible: true }).first(); if (await sw.isChecked()) { await press(sw); await sleep(700) } }
  await oilOn(w, false)
  // R2 — the switch's words keep a pick: pick a man outside the mode, enter it, press the words
  // pick a man from the crew list (a SANS card would open its editor outside the mode)
  const rp = page.locator('#sbRoster .puck[data-person], #sbRoster .rpuck, #sbBoard .sb-panel.grnd .puck[data-person]').filter({ visible: true }).first()
  if (await rp.count()) { await rp.scrollIntoViewIfNeeded().catch(() => {}); await press(rp); await sleep(400) }
  const before = await selCount(page)
  await oilOn(w, true)
  const lab = page.locator('#schedBoard label.lgmix.daysw').filter({ visible: true }).first()
  const box = await lab.boundingBox()
  if (phone) await page.touchscreen.tap(box.x + box.width - 12, box.y + box.height / 2); else await page.mouse.click(box.x + box.width - 12, box.y + box.height / 2)
  await sleep(700)
  const on2 = await page.locator('#schedBoard [data-oilblank]').filter({ visible: true }).first().isChecked()
  const after = await selCount(page)
  await shot('R2-words-keep-pick')
  row('R2 press on the words keeps the pick', before > 0 && after === before && on2, `picked before ${before}, after ${after}, switch ${on2 ? 'on' : 'off'}`)
  // switch back off by its words
  if (phone) await page.touchscreen.tap(box.x + box.width - 12, box.y + box.height / 2); else await page.mouse.click(box.x + box.width - 12, box.y + box.height / 2)
  await sleep(700)
  // R3 — a placeholder under an event switched off says the event's refusal
  const ph = page.locator('#sbBoard .puck.allavail').filter({ visible: true }).first()
  if (await ph.count()) {
    const row3 = ph.locator('xpath=ancestor::*[.//*[@data-oilitem]][1]')
    const ev = row3.locator('[data-oilitem]').first()
    await ev.scrollIntoViewIfNeeded(); await press(ev); await sleep(600)
    await clearNote(); await ph.scrollIntoViewIfNeeded(); await press(ph); await sleep(250)
    const said = (await toast(page))?.text
    await shot('R3-placeholder-event-off')
    row('R3 placeholder under an event switched off', said === 'This event earns nobody any OIL. Turn the event back on first.' && (await selCount(page)) === 0, said)
    await press(ev); await sleep(600)   // the event back on
  } else row('R3 placeholder under an event switched off', false, 'no ALL AVAIL on the board')
  // R4 — the switch's keyboard ring (PC only): keys onto the switch
  if (!phone) {
    const sw = page.locator('#schedBoard [data-oilblank]').filter({ visible: true }).first()
    await page.locator('#sbOil, #schedBoard [data-oilmode]').filter({ visible: true }).first().focus()
    let hit = false
    for (let i = 0; i < 25 && !hit; i++) { await page.keyboard.press('Tab'); hit = await sw.evaluate(e => document.activeElement === e) }
    const ring = await sw.evaluate(e => { const c = getComputedStyle(e); return { fv: e.matches(':focus-visible'), outline: c.outlineStyle + ' ' + c.outlineWidth + ' ' + c.outlineColor, off: c.outlineOffset } })
    const r = await sw.locator('xpath=..').boundingBox()
    await page.screenshot({ path: `${OUT}/R4-switch-ring-pc.png`, clip: { x: Math.max(0, r.x - 60), y: Math.max(0, r.y - 30), width: r.width + 120, height: r.height + 60 } })
    row('R4 the switch under the keys wears the cyan ring', hit && ring.fv && /solid 2px/.test(ring.outline) && ring.off === '2px', JSON.stringify(ring))
  }
} catch (e) { console.log('ERR', e.message.slice(0, 400)) }
console.log('errors', JSON.stringify(errors))
await browser.close()
