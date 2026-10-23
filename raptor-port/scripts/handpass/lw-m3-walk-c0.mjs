import * as L from './lw-m3-walk-c-lib.mjs'
console.log('lw-m3-walk-c0 v2')
const w = await L.newCtx('desk')
await L.signIn(w, 'admin')
await w.page.waitForTimeout(3000)
const info = await w.page.evaluate(() => {
  const out = {}
  for (const td of document.querySelectorAll('td[data-testid^="cell-"]')) {
    const t = td.innerText.replace(/\s+/g, ' ').trim()
    if (t) (out[td.dataset.testid.split('-').slice(0, 2).join('-')] ||= []).push(td.dataset.testid.slice(-10) + ':' + t)
  }
  return { out, ncells: document.querySelectorAll('td[data-testid^="cell-"]').length, rows: [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid).join(',') }
})
console.log(JSON.stringify(info, null, 0).slice(0, 5000))
console.log(w.errs)
await L.closeBrowser()
