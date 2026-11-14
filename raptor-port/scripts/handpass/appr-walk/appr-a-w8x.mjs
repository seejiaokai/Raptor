import * as C from './appr-a-common.mjs'
console.log('[appr-a-w8x v1]')
const TAG = process.env.W8X_TAG || 'after'
C.initLog(`appr-a-w8x-${TAG}-log.txt`)
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const vis = sel => P.evaluate(s => [...document.querySelectorAll(s)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).map(e => (e.dataset.testid || e.className.toString().slice(0, 30) || e.tagName) + '|' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)), sel)
// puck variants
for (const sel of ['.appr-puck', '.appr-puck .puck', '.appr-puck .nm', '.appr-who']) {
  await C.nthLine(P, 2).locator(sel).first().click().catch(e => C.note('click ' + sel + ' failed ' + String(e).slice(0, 80))); await C.sleep(900)
  const d = await vis('[role=dialog], [data-testid*="person"], [data-testid*="pw-"], [data-testid*="win"]')
  C.note(`click ${sel}: dialogs ${JSON.stringify(d.slice(0, 6))}`)
  await C.shot(P, `w8x-${TAG}-puck-${sel.replace(/[^a-z]/g, '')}`)
  await P.keyboard.press('Escape'); await C.sleep(300)
}
await P.locator(T('my-leave')).click(); await C.sleep(1200)
await C.shot(P, `w8x-${TAG}-myleave`)
C.note('my leave: ' + JSON.stringify((await vis('[data-testid]')).filter(x => !/^appr-|^lw-tab|^row-|^cell-/.test(x)).slice(0, 60)))
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
