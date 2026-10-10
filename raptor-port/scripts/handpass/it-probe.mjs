// A PROBE for the host's walk of [INPUT-OWN-TITLE] (it-host-walk.mjs): it answers the walk script's own questions about
// where things are — nothing here asserts the app. node scripts/handpass/it-probe.mjs
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const seed = async page => {
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  /* a titled Meeting and an untitled Training for Ranger on Wed 15 Jul, through the test bridge (a probe, not a walk) */
  return page.evaluate(() => {
    const r = Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === 'Ranger')
    return { pages: Object.keys(window).filter(k => /^go$|PAGE|CURPAGE/.test(k)), has: typeof window.fileInput }
  })
}
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  console.log('bridge', JSON.stringify(await seed(page)))
  console.log('nav tabs', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-page],[data-go],nav button,nav a')].map(b => (b.getAttribute('data-page') || b.getAttribute('data-go') || '') + ':' + b.textContent.trim().slice(0, 18)).slice(0, 14))))
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(400)
  const d = await page.evaluate(() => {
    const nm = document.querySelector('#eWeek .pl-row.gr-frominput > .nm .ntx')
    if (!nm) return 'no request row in the seed week'
    nm.scrollIntoView({ block: 'center', inline: 'center' })
    const q = nm.getBoundingClientRect(), hit = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2)
    return { text: nm.textContent, rect: [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)], hit: hit && (hit.className + ' ' + hit.tagName), same: hit === nm, vw: innerWidth }
  })
  console.log('week name cell', JSON.stringify(d))
  await page.locator(`#eWeek [data-sbday="2"]:visible`).first().click(); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(500)
  console.log('board', JSON.stringify(await page.evaluate(() => ({
    pitog: [...document.querySelectorAll('#schedBoard [data-pitog]')].map(b => b.textContent.trim().slice(0, 40) + '|' + b.getAttribute('data-pitog') + '|' + b.getAttribute('aria-expanded')),
    inprow: document.querySelectorAll('#schedBoard .inprow').length, sbi: document.querySelectorAll('#schedBoard .sbi-row').length, sbOil: !!document.querySelector('#sbOil'),
  }))))
  await ctx.close()
}
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage(); await seed(page)
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500)
  console.log('phone week', JSON.stringify(await page.evaluate(() => {
    const wk = document.querySelector('#eWeek'), day = document.querySelectorAll('#eWeek .day')
    const sc = [wk, wk.parentElement, wk.firstElementChild].map(e => e && ({ cls: e.className, sw: e.scrollWidth, cw: e.clientWidth, sl: e.scrollLeft, ox: getComputedStyle(e).overflowX }))
    return { days: day.length, sc, sat: Math.round(day[5].getBoundingClientRect().left) }
  })))
  await ctx.close()
}
await browser.close()
