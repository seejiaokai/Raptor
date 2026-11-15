/* www w2 probe 3: wave kinds in the + Wave menu, SC row field keys, Logic setting keys, the input window's door on the board. */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 'p3-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w2-lib2.mjs')
const { X, say, sleep, L } = H
say('www-w2-p3 v1')
const w = await X.open({ phone: PHONE })
const { page } = w
const FRI = X.FRI
await X.board(w, FRI)
await X.press(w, `[data-wvadd="${FRI}"]`, { scope: 'board' }); await sleep(500)
say('KINDS', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.wavemenu [data-wmkind]')].map(e => e.dataset.wmkind + '=' + e.innerText.replace(/\s+/g, ' ').trim()))))
await page.keyboard.press('Escape'); await sleep(300)
const kinds = ['sc']
await X.fin({ ...w, browser: { close: async () => {} } }).catch(() => {})
// SC wave
const sc = kinds.find(k => /sc/i.test(k))
if (sc) {
  const n0 = await page.evaluate(i => window.DAYS[i].waves.length, FRI)
  await X.press(w, `[data-wvadd="${FRI}"]`, { scope: 'board' }); await sleep(300)
  await X.press(w, `.wavemenu [data-wmkind="${sc}"]`); await sleep(800)
  say('SC bfld keys', JSON.stringify(await page.evaluate(i => [...document.querySelectorAll('#schedBoard [data-bfld^="ff:' + i + '.' + (window.DAYS[i].waves.length - 1) + '"], #schedBoard [data-bfld^="sc:"]')].map(e => e.dataset.bfld), FRI)))
  say('SC wave', JSON.stringify(await page.evaluate(i => { const g = window.DAYS[i].waves[window.DAYS[i].waves.length - 1]; return { kind: g.kind, keys: Object.keys(g), f: g.formations[0] && Object.keys(g.formations[0]) } }, FRI)))
  await X.pic(w, `p3-sc-${w.P}`)
}
await X.closeBoard(w)
await L.go(page, 'logic'); await sleep(500)
if (await page.locator('#lgEdit:visible').count()) { await X.press(w, '#lgEdit'); await sleep(300) }
say('LGSET', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-lgset]')].map(e => e.dataset.lgset + '=' + e.value))))
await X.pic(w, `p3-logic-${w.P}`)
await w.browser.close()
