import * as C from './appr-a-common.mjs'
console.log('[appr-a-explore2 v1]')
C.initLog('appr-a-explore2-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page
await P.locator(C.T('appr-pick')).click(); await C.sleep(600)
await C.shot(P, 'explore2-picker')
const info = await P.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  // elements that popped in: any fixed/absolute with role dialog or testid containing pick/cal/range
  const cands = [...document.querySelectorAll('[role=dialog],[data-testid*="pick"],[data-testid*="cal"],[class*="rangepicker"],[class*="RangePicker"],[class*="range"]')].filter(vis)
  return cands.map(e => { const r = e.getBoundingClientRect(); return `${e.tagName} testid=${e.dataset.testid} cls=${String(e.className).slice(0, 60)} box ${r.left.toFixed(0)},${r.top.toFixed(0)} ${r.width.toFixed(0)}x${r.height.toFixed(0)}` })
})
C.note(info.join('\n'))
const html = await P.evaluate(() => { const pk = document.querySelector('[data-testid="appr-pick"]'); const par = pk.parentElement; return par.outerHTML.slice(0, 4000) })
C.note(html)
C.note(JSON.stringify(await C.geo(P)))
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
