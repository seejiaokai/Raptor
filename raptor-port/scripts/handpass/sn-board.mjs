/* [SAVE-NOTE-COVERS] (D586) — can the failed-save warning be SEEN on the full-screen scheduler board?
   Same forced failure as sn-cover.mjs; then the board is opened the way a person opens it and the note's own middle
   is asked "what is on top here?".   HP_URL=… HP_SHOTS=<dir> node scripts/handpass/sn-board.mjs */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { login, go, board, BASE, SHOTS } from './lib.mjs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
mkdirSync(SHOTS, { recursive: true })
let fails = 0
for (const size of [{ name: 'phone-390', width: 390, height: 844, touch: true }, { name: 'desk-1366', width: 1366, height: 800 }]) {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const page = await (await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 2, hasTouch: !!size.touch })).newPage()
  await page.goto(BASE + '/'); await login(page, 'a'); await go(page, 'editsched')
  await page.evaluate(() => {
    window.__lsSetWas = Storage.prototype.setItem
    Storage.prototype.setItem = function () { throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError') }
    const w = window
    w.fillSlot('1.0.0.0.p', w.DAYS[1].waves[0].formations[0].aircraft[0].p === 'casper' ? 'bane' : 'casper'); w.afterSchedMutate()
  })
  await page.waitForSelector('.topbar > .savestat.failed', { timeout: 8000 })
  await board(page, 1)
  const r = await page.evaluate(() => {
    const open = !!document.querySelector('#schedBoard')
    const words = [...document.querySelectorAll('.savestat.failed')].map(n => {
      const b = n.getBoundingClientRect(), pe = n.style.pointerEvents; n.style.pointerEvents = 'auto'
      const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); n.style.pointerEvents = pe
      return { where: n.closest('#schedBoard') ? 'board' : 'top bar', seen: !!top && n.contains(top), onTop: top ? (top.id || top.className || top.tagName).toString().slice(0, 40) : null }
    })
    return { open, words }
  })
  await page.screenshot({ path: `${SHOTS}/${size.name}-board.png`, clip: { x: 0, y: 0, width: size.width, height: 220 } })
  const ok = r.open && r.words.some(w => w.seen)
  if (!ok) fails++
  console.log((ok ? 'PASS ' : 'FAIL ') + `${size.name}: with the board open, the failed-save warning can be seen  ` + JSON.stringify(r))
  await browser.close()
}
process.exit(fails ? 1 : 0)
