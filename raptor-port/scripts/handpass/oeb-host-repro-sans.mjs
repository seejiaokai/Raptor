// Chat 5, 8 Nov 26 — reproduce Astra's and Sol's finding 1: in OIL Earn a tap on a SANS Avail card's puck.
// DIST=<build folder> SIZE=phone|pc node repro-sans.mjs
import { chromium, webkit, LAUNCH, serveDist } from 'file:///C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/scripts/drawcheck/lib.mjs'
import { fileSansOnBoard } from './oeb-host-sans-file.mjs'
import { fileInput, openBoard, oilOn, selCount, toast, sleep, tag, standAt, fingerprint } from 'file:///C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/scripts/handpass/oeb-w2-lib.mjs'
const DIST = process.env.DIST, size = process.env.SIZE || 'pc', OUT = process.env.OUT || ''
const phone = size === 'phone'
const SIZES = {
  phone: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  pc: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 },
}
const STATE = 'C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/docs/handpass/state-sat.json'
const browser = await (phone ? webkit : chromium).launch(phone ? {} : { headless: true, ...LAUNCH })
const ctx = await browser.newContext({ ...SIZES[size], storageState: STATE })
const origin = 'http://localhost:4173'
await serveDist(ctx, origin, DIST)
await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
await page.goto(origin + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' }).catch(() => {})
await page.waitForSelector('#luser')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(500)
const w = { browser, ctx, page, phone, size, origin, errors, world: 'sat' }
try {
  await openBoard(w)
  const f = await fileSansOnBoard(w, sleep)
  console.log('filed', JSON.stringify(f))
  for (const blanket of [false, true]) {
    await oilOn(w, true)
    if (blanket) {
      const sw = page.locator('#schedBoard [data-oilblank]').filter({ visible: true }).first()
      if (!(await sw.isChecked())) { if (phone) await sw.tap(); else await sw.click(); await sleep(700) }
    }
    await page.evaluate(() => { for (const p of document.querySelectorAll('#schedBoard .puck.sel')) p.classList.remove('sel') })
    const t = await tag(page, { root: '#sbBoard .sansav' })
    console.log('blanket', blanket, 'tag', JSON.stringify(t))
    if (t.puckTitle === undefined) { console.log('no SANS puck drawn'); continue }
    console.log('stand', await standAt(page, '[data-w2="1"]', 420)); await sleep(300)
    const before = { sel: await selCount(page), fp: await fingerprint(page) }
    await page.evaluate(() => { const x = document.querySelector('#toastEl'); if (x) x.textContent = '' })
    const loc = page.locator('[data-w2="1"]')
    if (phone) await loc.tap(); else await loc.click()
    await sleep(250)
    const note = await toast(page)
    const after = { sel: await selCount(page), fp: await fingerprint(page) }
    const selWho = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck.sel')].map(p => p.textContent.trim()).slice(0, 4))
    console.log(JSON.stringify({ blanket, before, after, selWho, note: note && note.text, noteOp: note && note.op }))
    if (OUT) {
      const r = await page.locator('#sbBoard .sansav').first().boundingBox()
      await page.screenshot({ path: `${OUT}-${size}-${blanket ? 'switch-on' : 'switch-off'}.png`, ...(r ? { clip: { x: 0, y: Math.max(0, r.y - 40), width: SIZES[size].viewport.width, height: Math.min(SIZES[size].viewport.height - Math.max(0, r.y - 40), r.height + 140) } } : {}) })
    }
  }
} catch (e) { console.log('ERR', e.message.slice(0, 400)) }
console.log('errors', JSON.stringify(errors))
await browser.close()
