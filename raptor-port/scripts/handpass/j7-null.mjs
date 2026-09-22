import { open, board, openInputs, tap } from './lib.mjs'
const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
await board(page, 5); await openInputs(page, 5)
await tap(page, '#sbOil'); await page.waitForTimeout(900)
console.log(JSON.stringify(await page.evaluate(() => {
  const all = [...document.querySelectorAll('#schedBoard .oilitem')].filter(e => e.offsetParent)
  const nulls = all.filter(e => !e.getAttribute('data-oilitem'))
  return {
    withAttr: all.length - nulls.length,
    without: nulls.length,
    sample: nulls.slice(0, 5).map(e => ({
      tag: e.tagName, cls: (e.className || '').toString(),
      txt: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      attrs: [...e.attributes].map(a => a.name + '=' + String(a.value).slice(0, 26)).join(' '),
      parentCls: (e.parentElement?.className || '').toString().slice(0, 34),
      title: (e.title || '').slice(0, 70),
    })),
  }
}), null, 1))
await browser.close()
