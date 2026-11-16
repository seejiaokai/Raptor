/* wwf w1 scenario 6, third variant — a weekend day (Sat 1 Aug), ALL AVAIL then ALL directly on the blank-END desk; counts; OIL Earn. */
export async function run({ X, H, w, page, S, SZ, step, blocks, strip }) {
  const { say, sleep, row, pic } = X
  const SAT = 5
  await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
  const v3 = await H.makeDesk(X, w, SAT, { tpl: 'sc', str: '20:00', end: '', people: ['allavail', 'all'] })
  say('V3 blocks', await blocks(SAT))
  await pic(w, '05-v3-board')
  const chipSel = `#schedBoard [data-fill="d:${SAT}.0.0.+"] .oilcount`
  const winText = async n => page.evaluate(n => [...document.querySelectorAll('.availwin')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, n)).join(' ;; '), 1800)
  const closeWin = async () => { const x = page.locator('.availwin button:visible').first(); if (await x.count()) { await x.click(); await sleep(500) } return page.locator('.availwin:visible').count() }
  await step('count window', async () => {
    await page.locator(chipSel).first().click(); await sleep(900)
    await pic(w, '06-v3-allavail-window')
    say('window text (OIL Earn off)', await winText())
    say('window still open after its own close button?', await closeWin())
  })
  say('board warnings V3', JSON.stringify(await X.boardWarn(w)))
  await step('oil earn', async () => {
    await X.press(w, '#sbOil'); await sleep(900)
    await pic(w, '07-v3-oil-earn')
    say('OIL items', await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilitem], #schedBoard [data-oilp]')].filter(e => e.offsetWidth).map(e => [...e.attributes].filter(a => /^data-|title/.test(a.name)).map(a => a.name + '=' + a.value).join(' ') + '|' + e.innerText.replace(/\s+/g, ' ').slice(0, 80)).join(' ;; ')))
    const oc = '#schedBoard [data-oilsent]'
    say('oil chips', await page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.offsetWidth).map(e => e.title + ' | ' + e.className).join(' ;; '), oc))
    await page.locator(oc).first().click(); await sleep(900)
    await pic(w, '08-v3-window-in-oil-earn')
    say('window text in OIL Earn (first chip ALL AVAIL)', await winText())
    await closeWin()
    await page.locator(oc).nth(1).click(); await sleep(900)
    await pic(w, '09-v3-window-second-chip')
    say('window text second chip (ALL)', await winText())
    await closeWin()
    await X.press(w, '#sbOil'); await sleep(500)
  })
  await X.closeBoard(w)
}
