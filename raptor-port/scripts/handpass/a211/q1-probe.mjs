// probe (throwaway; chat A211 K10 Q1 drawing): on the drawing's saved world, Fri 17 Jul 09:00 -
//  (a) Hunter switches to the member view by the top bar's role chip and opens Ranger's leave from 142's list;
//  (b) us9 (a 149 member) opens it from 149's list.  Each: the window's read-only line, buttons, and a picture.
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url)); const ROOT = resolve(HERE, '../../..')
const { chromium } = createRequire(resolve(ROOT, 'package.json'))('playwright')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const TMP = resolve(ROOT, '.tmp/a211-k10-q1'); mkdirSync(TMP, { recursive: true })
const b = await chromium.launch(LAUNCH)
async function one(tag, u, p, before) {
  const ctx = await b.newContext({ viewport: { width: 1536, height: 864 }, timezoneId: 'Asia/Singapore', storageState: resolve(TMP, 'world.json') })
  await ctx.clock.install({ time: new Date('2026-07-17T09:00:00+08:00') })
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log('PAGEERROR', String(e).slice(0, 200)))
  await page.goto('http://localhost:4743/'); await page.waitForSelector('#luser')
  await page.fill('#luser', u); await page.fill('#lpass', p); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 }); await page.waitForTimeout(800)
  if (before) await before(page)
  console.log(tag, 'bar', await page.evaluate(() => [...document.querySelectorAll('.topbar .mark, .topbar .rolechip, .topbar [class*=role]')].map(e => e.className + ':' + e.textContent.trim()).join(' | ')))
  await page.locator('#topnav a[data-page="inputs"]').filter({ visible: true }).first().click(); await page.waitForTimeout(800)
  await page.locator('#inListBtn').click(); await page.waitForTimeout(600)
  const fp = page.locator('#inFPerson').filter({ visible: true })
  if (await fp.count()) {
    console.log(tag, 'person options', await fp.evaluate(e => [...e.options].map(o => o.value + '=' + o.text).join('|').slice(0, 300)))
    await fp.selectOption('bane').catch(e => console.log(tag, 'no bane option', String(e).slice(0, 100))); await page.waitForTimeout(600)
  }
  const rows = await page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ iid: e.dataset.iid, w: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90) })))
  console.log(tag, 'rows', JSON.stringify(rows))
  const r = rows.find(x => /Ranger/.test(x.w) && /\bLL\b/.test(x.w))
  if (!r) { await page.screenshot({ path: `${TMP}/probe-${tag}.png` }); await ctx.close(); return }
  await page.locator(`#inBody tr[data-iid="${r.iid}"] td`).nth(2).click(); await page.waitForTimeout(1000)
  console.log(tag, 'window', JSON.stringify(await page.evaluate(() => {
    const w = document.querySelector('[data-testid="win-inputedit"]')
    return { ro: document.querySelector('[data-testid="inped-ro"]')?.textContent, inert: !!w?.querySelector('.inped-body[inert]'), btns: [...(w?.querySelectorAll('button') || [])].filter(e => e.getBoundingClientRect().width > 0).map(e => e.id || e.textContent.trim()).slice(0, 20), words: w?.innerText.replace(/\s+/g, ' ').slice(0, 400) }
  })))
  await page.screenshot({ path: `${TMP}/probe-${tag}.png` })
  await ctx.close()
}
await one('hunterMember', 'ad2', 'a2', async page => {
  const chip = page.locator('[data-testid="rolechip"], .rolechip').filter({ visible: true }).first()
  console.log('chip count', await chip.count(), await chip.textContent().catch(() => null))
  if (await chip.count()) { await chip.click(); await page.waitForTimeout(800) }
  const dlg = await page.evaluate(() => [...document.querySelectorAll('.airpop, [role="dialog"], .sheet')].filter(e => !e.hidden && e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 200)))
  console.log('after chip', JSON.stringify(dlg))
})
await one('us9', 'us9', 'us9')
await b.close()
