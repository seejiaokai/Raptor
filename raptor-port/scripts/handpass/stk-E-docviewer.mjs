/* Walker E — P4a-04 extra: the document viewer on a medical entry that HAS documents (Zenith, 2 documents), both sizes. */
import * as E from './stk-E-lib.mjs'
const out = []
for (const phone of [false, true]) {
  const SZ = phone ? 'phone' : 'desktop'
  const { browser, page, errors } = await E.world({ size: phone ? E.PHONE : E.DESK, phone })
  await E.nav(page, 'inputs'); await page.locator('#inMedBtn').click(); await page.waitForSelector('#medView', { state: 'visible' }); await E.sleep(500)
  const card = page.locator('#medView button[title="Tap to view 2 documents"]').first()
  const found = await card.count()
  if (found) { await card.scrollIntoViewIfNeeded(); await card.click(); await E.sleep(900) }
  const v = await page.evaluate(() => { const e = document.getElementById('docViewPop'); if (!e) return null; const r = e.getBoundingClientRect(); const box = e.children[0].getBoundingClientRect(); const btns = [...e.querySelectorAll('button')].map(b => b.innerText.trim().slice(0, 12) || b.getAttribute('aria-label')).filter(Boolean); const img = e.querySelector('img, canvas, embed, iframe'); return { open: r.width > 0, box: [box.left, box.top, box.width, box.height].map(Math.round), btns, media: img ? img.tagName + ' ' + Math.round(img.getBoundingClientRect().width) + 'x' + Math.round(img.getBoundingClientRect().height) : 'none', text: e.innerText.replace(/\s+/g, ' ').slice(0, 140) } })
  const f = await E.pic(page, `docviewer-${SZ}-zenith-2-documents`)
  // next / previous page control, if any
  const next = page.locator('#docViewNext').first(); let paged = 'no pager'
  if (await next.count() && !(await next.isEnabled())) paged = 'Next document button present but disabled (this entry opens one document)'
  else if (await next.count()) { await next.click(); await E.sleep(500); paged = (await page.locator('#docViewPop').innerText()).replace(/\s+/g, ' ').slice(0, 80); await E.pic(page, `docviewer-${SZ}-zenith-next-page`) }
  console.log(SZ, 'found card:', found, JSON.stringify(v), 'pager:', paged, 'errors:', JSON.stringify(errors), f)
  await browser.close()
}
