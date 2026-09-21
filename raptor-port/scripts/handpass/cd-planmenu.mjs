/* Door check for the day's white selector at the head of the board — the one
   that holds the working copy, the saved plans and the issued versions. */
import { open, board, shot, tap } from './lib.mjs'
import { PUB_STATE } from './cd-lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)

await tap(page, `[data-planmenu="${di}"]`)
await page.waitForTimeout(800)
const dump = await page.evaluate(() => {
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  // find every element that looks like an open menu: has plandup or planpick-ish data
  const hits = [...document.querySelectorAll('*')].filter(e => vis(e) && [...e.attributes].some(a => /^data-plan|^data-ver|^data-al/.test(a.name)))
  const byAttr = {}
  hits.forEach(e => {
    [...e.attributes].filter(a => /^data-/.test(a.name)).forEach(a => {
      byAttr[a.name] = byAttr[a.name] || []
      if (byAttr[a.name].length < 8) byAttr[a.name].push({ v: a.value, t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40), tag: e.tagName })
    })
  })
  // the popup container: the closest common ancestor with 'menu'/'pop' in class
  const pops = [...document.querySelectorAll('[class*=menu],[class*=pop],[class*=plan],[class*=sheet]')].filter(vis)
    .map(e => ({ cls: e.className.slice(0, 50), text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 400) }))
    .filter(e => e.text)
  return { byAttr, pops: pops.slice(0, 12) }
})
console.log('== PLAN MENU ATTRS ==')
Object.entries(dump.byAttr).forEach(([k, v]) => console.log('  ' + k + ' -> ' + v.map(x => `${x.v}("${x.t}")`).join(' , ')))
console.log('\n== POPUP-ISH CONTAINERS ==')
dump.pops.forEach(p => console.log(`  .${p.cls}\n     ${p.text}`))
await shot(page, 'CD-planmenu-open')
console.log('errors:', errors.slice(0, 4))
await browser.close()
