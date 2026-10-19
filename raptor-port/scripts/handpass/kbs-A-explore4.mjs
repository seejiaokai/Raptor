import { open, go, version, shot, bringLow, tapBox } from './kbs-A-lib.mjs'
version('explore4d')
const { browser, page } = await open()
await go(page, 'editsched')
await page.evaluate(() => window.openScheduler(0))
await page.waitForSelector('#schedBoard'); await page.waitForTimeout(800)
const sec = page.locator('#schedBoard [data-secmove="0.inputs"]')
await bringLow(sec, 300)
await tapBox(page, sec.locator('.pinp').first())
await page.waitForTimeout(600)
const b = page.locator('#schedBoard button.inpedit').first()
await bringLow(b, 500)
await tapBox(page, b)
await page.waitForTimeout(800)
await shot(page, 'explore4-window')
console.log(await page.evaluate(() => {
  const out = []
  document.querySelectorAll('input,textarea,select').forEach(e => { const r = e.getBoundingClientRect(); if (r.width > 0 && !e.closest('#schedBoard')) out.push(`${e.tagName}.${String(e.className).slice(0,25)}#${e.id} type=${e.type} ph=${e.placeholder} top=${Math.round(r.top)} bot=${Math.round(r.bottom)} win=${(e.closest('[role=dialog],.modal,.win,.sheet')||{}).className}`) })
  const dl = document.querySelector('[role=dialog]'); out.push('dialog: ' + (dl ? dl.id + '.' + dl.className + ' ' + JSON.stringify(dl.getBoundingClientRect()) : 'none'))
  return out
}))
await browser.close()
