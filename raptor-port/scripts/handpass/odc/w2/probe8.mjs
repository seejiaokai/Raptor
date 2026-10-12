import { openWorld, tools } from './lib.mjs'
console.log('probe8 VERSION 1')
const w = await openWorld(process.argv[2] || 'desktop')
const { page } = w
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(900)
console.log(await page.evaluate(() => {
  const els = [...document.querySelectorAll('#vWeek [data-k], #vWeek [data-key], #vWeek [data-tk]')]
  const m = {}
  for (const e of els) { const k = e.getAttribute('data-k') || e.getAttribute('data-key') || e.getAttribute('data-tk'); const p = (k || '').split(':')[0]; if (!m[p]) m[p] = e.tagName + '.' + e.className + ' ' + k + ' ce=' + e.getAttribute('contenteditable') }
  return JSON.stringify(m, null, 1)
}))
console.log(await page.evaluate(() => [...document.querySelectorAll('#vWeek .rmk, #vWeek td.rmks, #vWeek [class*=rmk]')].slice(0, 5).map(e => e.tagName + '.' + e.className + ' ' + [...e.attributes].map(a => a.name + '=' + a.value.slice(0, 25)).join(' ')).join('\n')))
await w.browser.close()
