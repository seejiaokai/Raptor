/* RE-WALK W4 (26 Sep 26) — WHY the one-day hold still loses its sheet on the rebuilt app (W4-1 re-walk FAIL).
   Records only; nothing here writes the app's state. On a phone (a COARSE pointer), an open Leave War sheet puts a
   document-level capture "shield" in place (Sheet.tsx useGridPan): a click aimed under the sheet closes it. The drag's
   click swallow (select.ts swallowNextClick) is ALSO a document capture listener, added first, and it calls
   stopPropagation — which does not stop another listener on the same node. So the finger's trailing click reaches the
   shield anyway, and the shield closes the sheet the hold just opened.
   The probe: (1) is the pointer coarse here? (2) a document capture click listener added the moment the sheet mounts
   (i.e. AFTER the swallow and the shield) — does the trailing click still reach it, already default-prevented by the
   swallow? If it does, same-node listeners are not stopped, and the shield ran too. (3) is the sheet gone right after?
   Usage (from raptor-port/): node scripts/handpass/ab/rw-w4-11-hold-diag.mjs */
process.env.AB_WHO = 'rewalk/w4'
const L = await import('./w4-lib.mjs')
const R = L.resultBook('W4-1-diag', `${L.ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w4-hold-diag.txt`)
const { browser, page, errors } = await L.openW4({ phone: true, who: 'a' })
const cdp = await page.context().newCDPSession(page)
const id = 'glass', d = '2026-08-13'
await L.lwOpen(page, d)
const sel = `[data-testid="cell-${id}-${d}"]`
await page.locator(sel).first().evaluate(x => x.scrollIntoView({ block: 'center', inline: 'center' }))
await page.waitForTimeout(400)
const media = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, fine: matchMedia('(pointer: fine)').matches, hoverNone: matchMedia('(hover: none)').matches, maxTouchPoints: navigator.maxTouchPoints }))
R.note('pointer-media', media)
await page.evaluate(() => {
  window.__d = []; const t0 = performance.now()
  const lg = s => window.__d.push(`${Math.round(performance.now() - t0)}ms ${s}`)
  document.addEventListener('click', e => lg(`click (first listener, before the swallow) target=${e.target.getAttribute && e.target.getAttribute('data-testid')} defaultPrevented=${e.defaultPrevented}`), true)
  let on = false
  new MutationObserver(() => {
    const s = document.querySelector('[data-testid="select-sheet"]')
    if (!!s === on) return
    on = !!s
    lg(on ? 'SELECT SHEET MOUNTED' : 'SELECT SHEET GONE')
    if (on) document.addEventListener('click', e => {
      lg(`click reached a document listener added AFTER the sheet mounted: defaultPrevented=${e.defaultPrevented} (the swallow ran) — sheet still in the page: ${!!document.querySelector('[data-testid="select-sheet"]')}`)
      setTimeout(() => lg(`0 ms after that click, sheet in the page: ${!!document.querySelector('[data-testid="select-sheet"]')}`), 0)
    }, { capture: true, once: true })
  }).observe(document.body, { childList: true, subtree: true })
})
const c = await page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } }, sel)
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 9 }] })
await page.waitForTimeout(350)
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await page.waitForTimeout(900)
const log = await page.evaluate(() => window.__d)
const open = await L.sheetNow(page)
await L.shot(page, 'w4-holddiag-after-lift')
const reached = log.some(l => /reached a document listener added AFTER/.test(l))
R.ck('diag-trailing-click-not-stopped-at-document', !reached && open.open === 'select-sheet', 'the finger\'s trailing click must stop at the swallow and the sheet stay; OBSERVED instead (if FAIL): the click reached a document listener added after the swallow — stopPropagation does not stop same-node listeners, so the sheet\'s tap shield (also on document) closed it', { media, open: open.open, log })
R.note('errors', errors.slice(0, 5))
R.save()
await browser.close()
