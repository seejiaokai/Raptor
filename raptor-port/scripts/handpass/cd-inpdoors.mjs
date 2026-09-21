/* Door check: the Personal Inputs panel on the board, and the Inputs page —
   every control that edits, removes or restores a member's request. */
import { open, board, shot, tap, go } from './lib.mjs'
import { PUB_STATE } from './cd-lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
await tap(page, `[data-pitog="${di}"]`)
await page.waitForTimeout(600)

const panel = await page.evaluate(() => {
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  const secs = [...document.querySelectorAll('#schedBoard .sb-sec')].filter(vis)
    .filter(e => /PERSONAL INPUTS|UNAVAILABLE/i.test(e.innerText || ''))
  return secs.map(s => ({
    head: (s.innerText || '').replace(/\s+/g, ' ').slice(0, 300),
    ctrls: [...s.querySelectorAll('button,[role=button],[data-inpedit],[data-inpacc],[data-iu],[class*=btn]')].filter(vis)
      .map(e => ({ t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 24), cls: e.className.slice(0, 34), d: Object.entries(e.dataset || {}).map(([k, v]) => k + '=' + v).join(' ') })),
    attrs: [...new Set([...s.querySelectorAll('*')].filter(vis).flatMap(e => [...e.attributes].map(a => a.name).filter(n => n.startsWith('data-'))))],
  }))
})
console.log('== BOARD INPUT PANELS ==')
panel.forEach(p => {
  console.log('  HEAD: ' + p.head)
  console.log('  ATTRS: ' + p.attrs.join(' '))
  p.ctrls.forEach(c => console.log(`    "${c.t}" .${c.cls} [${c.d}]`))
})
await shot(page, 'CD-inputs-panel')

await go(page, 'inputs')
await page.waitForTimeout(700)
const ip = await page.evaluate(() => {
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  const rows = [...document.querySelectorAll('tr,.inprow')].filter(vis).filter(e => /Training|Duty|Meeting/i.test(e.innerText || ''))
  return {
    text: (document.querySelector('#page-inputs, main, body') || {}).innerText?.replace(/\s+/g, ' ').slice(0, 900),
    rows: rows.slice(0, 8).map(r => ({
      t: (r.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 130),
      ctrls: [...r.querySelectorAll('button,select,[role=button]')].filter(vis).map(e => ((e.innerText || e.value || '').replace(/\s+/g, ' ').trim().slice(0, 18)) + '[' + Object.entries(e.dataset || {}).map(([k, v]) => k + '=' + v).join(' ') + ']'),
    })),
  }
})
console.log('\n== INPUTS PAGE ==\n' + ip.text)
ip.rows.forEach(r => console.log('  ROW ' + r.t + '\n      ' + r.ctrls.join(' ')))
await shot(page, 'CD-inputs-page')
console.log('errors:', errors.slice(0, 4))
await browser.close()
