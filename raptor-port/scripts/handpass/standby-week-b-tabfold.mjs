/* [STANDBY-WEEK-B] probe — on Edit Schedule's week, a time typed into a box and left by Tab: is it saved, and does the box
   then read hh:mm or the digits as typed? Run on a flying line's B and take-off (boxes that exist on main too) and on an
   SC line's new B, so a fault of the new box is told from an older one of every week box.
   Run: HP_URL=http://localhost:4183 node scripts/handpass/standby-week-b-tabfold.mjs */
import { existsSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.HP_URL || 'http://localhost:4183'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
try {
  const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
  await p.goto(BASE + '/?fresh=1')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(500)
  const sc = await p.evaluate(() => { window.addWave(0, 'sc'); return window.DAYS[0].waves.findIndex(w => w.kind === 'sc') })
  await p.waitForTimeout(400)
  for (const [name, key, typed] of [['flying B', 'ff:0.0.0.br', '0610'], ['flying take-off', 'ff:0.0.0.to', '0930'], ['SC B (new)', `ff:0.${sc}.0.br`, '0545']]) {
    const box = p.locator(`#eWeek [data-txt="${key}"]`)
    await box.scrollIntoViewIfNeeded(); await box.click()
    await p.keyboard.press('Control+A'); await p.keyboard.type(typed); await p.keyboard.press('Tab')
    await p.waitForTimeout(1200)
    const [, di, gi, li, f] = /^ff:(\d+)\.(\d+)\.(\d+)\.(\w+)$/.exec(key)
    const saved = await p.evaluate(([di, gi, li, f]) => window.DAYS[+di].waves[+gi].formations[+li][f], [di, gi, li, f])
    const shown = await p.locator(`#eWeek [data-txt="${key}"]`).textContent()
    console.log(`${name}: typed ${typed}, Tab → saved ${saved}, the box reads "${shown}" after 1.2s`)
    await p.mouse.click(5, 5); await p.waitForTimeout(500)
    console.log(`  after a press elsewhere it reads "${await p.locator(`#eWeek [data-txt="${key}"]`).textContent()}"`)
  }
} finally { await browser.close() }
