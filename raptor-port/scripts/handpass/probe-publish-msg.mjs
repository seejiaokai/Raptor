/* Does publishing SAY anything? Watches everything the page adds for five
   seconds either side of the press, so a message that flashes is still caught.
   Run twice: once with the day blanket on (nobody earns), once without. */
import { open, board, publish, oilMode, shot, STATE } from './lib.mjs'

async function run(withBlanket) {
  const di = 5
  const { browser, page, errors } = await open({ state: STATE })
  await board(page, di)
  if (withBlanket) {
    await oilMode(page, true)
    await page.locator('#schedBoard [data-oilblank]:visible').first().click()
    await page.waitForTimeout(700)
    await oilMode(page, false); await page.waitForTimeout(500)
  }
  await page.evaluate(() => {
    window.__said = []
    const seen = new Set()
    new MutationObserver(ms => {
      for (const m of ms) for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue
        const t = (n.innerText || n.textContent || '').replace(/\s+/g, ' ').trim()
        if (t && t.length < 300 && !seen.has(t)) { seen.add(t); window.__said.push(t) }
      }
    }).observe(document.body, { childList: true, subtree: true })
  })
  const pub = await publish(page, di)
  await page.waitForTimeout(5000)
  const said = await page.evaluate(() => window.__said.filter(t => /OIL|earn|nobody|publish|amend|credit|day/i.test(t)).slice(0, 14))
  await shot(page, withBlanket ? 'A10-publish-message-blanket' : 'A10-publish-message-normal')
  await browser.close()
  return { withBlanket, pub, said, errors: errors.slice(0, 4) }
}
console.log(JSON.stringify(await run(true), null, 1))
console.log(JSON.stringify(await run(false), null, 1))
