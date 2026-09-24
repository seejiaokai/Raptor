/* w1 — READ-ONLY probe: how many copies of the board's publish strip exist at each width, and which
   one is visible (so the walk reads the copy a person sees). No writes. */
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-09-24-amendment-week.json'
const L = await import('./am-lib.mjs')
const { open, editWeek, board } = L
for (const [w, vp] of Object.entries({ desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } })) {
  const { browser, page, errors } = await open({ ...vp, state: STATE })
  await editWeek(page)
  await board(page, 0)
  const r = await page.evaluate(() => {
    const vis = e => !!(e.offsetWidth || e.offsetHeight)
    const count = s => { const a = [...document.querySelectorAll(s)]; return `${a.length} (${a.filter(vis).length} visible)` }
    return {
      schedBoard: count('#schedBoard'), sbSignBar: count('#sbSignBar'), sbpub: count('#schedBoard .sb-pub'),
      verchip: count('#schedBoard .verchip'), dpend: count('#schedBoard .dpend'), nys: count('#schedBoard .nysmark'),
      alpub: count('#schedBoard [data-alpub]'), unpub: count('#schedBoard [data-unpub]'), info: count('#schedBoard [data-dayinfo]'),
      signsel: count('#schedBoard select[data-sign]'), oilmode: count('#schedBoard [data-oilmode]'), sbOil: count('#sbOil'),
      ldel: count('#schedBoard [data-ldel]'), wvgrip: count('#schedBoard .wvgrip'), sbgrip: count('#schedBoard .sb-grip'),
      acc: count('#schedBoard [data-acc]'), pitog: count('#schedBoard [data-pitog]'),
      pubText: [...document.querySelectorAll('#schedBoard .sb-pub')].filter(vis).map(e => e.innerText.replace(/\s+/g, ' ')),
      signState: [...document.querySelectorAll('#schedBoard .so-state')].filter(vis).map(e => e.innerText),
    }
  })
  console.log(w, JSON.stringify(r, null, 1))
  console.log('errors', errors)
  await browser.close()
}
