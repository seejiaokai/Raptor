/* Probe: where is the chart's scroll box relative to the bar above it, with
   arrange mode off and on, at both widths? (The round-trip walk's clicks landed
   on the header: is part of the chart hidden under the bar?) */
import { open, shot, DESK, PHONE } from './trk-lib.mjs'
const sleep = ms => new Promise(r => setTimeout(r, ms))
async function measure(page) {
  return page.evaluate(() => {
    const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height), left: Math.round(b.left), w: Math.round(b.width) } }
    const hdr = document.querySelector('#page-tracker header')
    const board = document.getElementById('board')
    const arr = document.getElementById('arrTools')
    const layout = document.querySelector('#page-tracker .layout')
    // what is actually on top at the board's own top-centre, and 40px lower
    const bb = board.getBoundingClientRect()
    const atTop = document.elementFromPoint(bb.left + bb.width / 2, bb.top + 2)
    const at40 = document.elementFromPoint(bb.left + bb.width / 2, bb.top + 40)
    const name = el => el ? (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').join('.') : '')) : null
    return { header: r(hdr), board: r(board), arr: r(arr), layout: r(layout), onTop: name(atTop), on40: name(at40), boardInHeader: atTop && hdr && hdr.contains(atTop) }
  })
}
for (const [label, size] of [['desk', DESK], ['phone', PHONE]]) {
  const { browser, page } = await open({ size, who: 'a', touch: size === PHONE })
  console.log(label, 'arrange OFF', JSON.stringify(await measure(page)))
  await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(500)
  console.log(label, 'arrange ON ', JSON.stringify(await measure(page)))
  await shot(page, `02-${label}-arrange-on`)
  await browser.close()
}
