import { open, board, tap, shot, STATE } from './lib.mjs'
const di = 5
const { browser, page } = await open({ state: STATE })
await board(page, di)
const dump = async (label) => {
  const t = await page.evaluate(() => {
    const m = [...document.querySelectorAll('.menu, .popmenu, .sb-menu, [class*=menu]')].filter(e=>e.offsetParent!==null)
    return m.map(e => ({ cls: e.className.slice(0,50), txt: (e.innerText||'').replace(/\n/g,' | ').slice(0,400),
      btns: [...e.querySelectorAll('button,[role=button],li,a')].map(b=>({t:(b.innerText||'').trim().slice(0,40), d:JSON.stringify(b.dataset)})).slice(0,25) }))
  })
  console.log('===', label, '===' ); console.log(JSON.stringify(t, null, 1).slice(0, 2600))
}
await tap(page, `[data-wvadd="${di}"]`); await dump('+ Wave menu'); await shot(page,'RULE-probe-wavemenu')
await page.keyboard.press('Escape'); await page.waitForTimeout(400)
await tap(page, `[data-dwadd="${di}"]`); await dump('+ Block menu'); await shot(page,'RULE-probe-blockmenu')
await page.keyboard.press('Escape')
await browser.close()
