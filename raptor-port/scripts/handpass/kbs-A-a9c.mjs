import { open, go, version, shot, tapBox, keysUp, keysDown, bringLow } from './kbs-A-lib.mjs'
version('a9c')
const { browser, page } = await open()
await go(page, 'admin')
await page.evaluate(() => document.getElementById('admDutyTpl').click()); await page.waitForSelector('#tplModal'); await page.waitForTimeout(800)
await tapBox(page, page.locator('#tplModal button', { hasText: /^AVALON$/i }).first()); await page.waitForTimeout(600)
for (let i = 0; i < 20; i++) { if ((await page.locator('#tplModal input.tm').count()) / 2 >= 14) break; const add = page.locator('#tplModal button', { hasText: /ADD ROLE/i }).first(); await bringLow(add, 500).catch(()=>{}); await tapBox(page, add); await page.waitForTimeout(300) }
const probe = (tag) => page.evaluate((tag) => {
  const e = [...document.querySelectorAll('#tplModal input.tm')].pop(); const chain = []
  for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); const r = n.getBoundingClientRect(); if (/(auto|scroll|hidden)/.test(cs.overflowY) || n.style.translate || n.style.maxHeight) chain.push(`${n.id || String(n.className).slice(0, 25)} oy=${cs.overflowY} st=${n.scrollTop} max=${n.scrollHeight - n.clientHeight} rect=${Math.round(r.top)}-${Math.round(r.bottom)} tr=${n.style.translate} mh=${n.style.maxHeight || cs.maxHeight}`) }
  const t = [...document.querySelectorAll('#tplModal *')].find(x => x.children.length === 0 && /Duty templates/.test(x.textContent)); const tr = t && t.getBoundingClientRect()
  const x = document.getElementById('tplClose'); const xr = x.getBoundingClientRect()
  return tag + ' | title ' + (tr ? Math.round(tr.top) + '-' + Math.round(tr.bottom) : 'none') + ' closeX ' + Math.round(xr.top) + '-' + Math.round(xr.bottom) + ' | ' + chain.join(' || ')
}, tag)
console.log(await probe('start'))
const last = page.locator('#tplModal input.tm').last()
await bringLow(last, 800)
console.log(await probe('scrolled'))
await tapBox(page, last); await keysUp(page); await page.waitForTimeout(600)
console.log(await probe('keys up'))
await keysDown(page)
console.log(await probe('keys down'))
await browser.close()
