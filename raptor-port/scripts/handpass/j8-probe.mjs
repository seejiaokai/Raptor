import { open, board, openInputs } from './lib.mjs'
const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
await board(page, 5); await openInputs(page, 5)
console.log(JSON.stringify(await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#schedBoard .grnd .sb-arow')].filter(e => e.offsetParent)
  return rows.slice(0, 4).map(r => ({
    txt: (r.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 46),
    controls: [...r.querySelectorAll('button,[data-slot],[data-gadd],[class*=add]')]
      .map(e => ({ t: (e.innerText || '').trim().slice(0, 10),
                   a: [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(' ') }))
      .filter(c => c.a || c.t),
  }))
}), null, 1))
await browser.close()
