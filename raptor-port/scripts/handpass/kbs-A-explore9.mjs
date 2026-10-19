import { open, go, version, shot, tapBox } from './kbs-A-lib.mjs'
version('explore9')
const { browser, page } = await open()
await go(page, 'admin')
await page.evaluate(() => document.getElementById('admDutyTpl').click())
await page.waitForTimeout(900)
await shot(page, 'explore9-duty')
console.log(await page.evaluate(() => {
  const out = []
  document.querySelectorAll('input,textarea,select').forEach(e => { const r = e.getBoundingClientRect(); if (r.width > 0 && r.top > 0 && e.id !== 'searchE') out.push(`${e.tagName}#${e.id}.${String(e.className).slice(0,22)} ${e.type} ph=${e.placeholder} top=${Math.round(r.top)} bot=${Math.round(r.bottom)}`) })
  const c = document.getElementById('tplClose'); let w = c; while (w && w.parentElement && !/fixed|absolute/.test(getComputedStyle(w).position)) w = w.parentElement
  out.push('window ' + (w && (w.id + '.' + w.className)) + ' ' + JSON.stringify(w && w.getBoundingClientRect()))
  return out
}))
await browser.close()
