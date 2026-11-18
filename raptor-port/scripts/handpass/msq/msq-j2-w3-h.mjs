/* msq-j2-w3-h v1 — W3's shared helpers for job 2's phone walk (19 Nov 26) */
export const mk = async () => {
  const X = await import('./msq-lib.mjs')
  const U = await import('./msq-w1-util.mjs')
  const { say, sleep, row } = X
  const vis = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel)].filter(b => { const r = b.getBoundingClientRect(); return r.width > 2 && r.height > 2 }).map(b => { const r = b.getBoundingClientRect(); return `${b.tagName}#${b.id || ''}.${String(b.className).slice(0, 30)}[${(b.getAttribute('aria-label') || b.textContent || b.placeholder || '').replace(/\s+/g, ' ').trim().slice(0, 40)}]@${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}x${Math.round(r.height)}` }).join('\n'), sel)
  const inside = async (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return 'missing'; const r = e.getBoundingClientRect(); return (r.left >= 0 && r.top >= 0 && r.right <= 402 && r.bottom <= 874) ? 'inside' : `OUTSIDE ${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}` }, sel)
  const swap = async (w, user) => { await closeAny(w); await X.signOut(w); await X.login(w.page, user); say('signed in as', user) }
  const closeAny = async w => {
    const x = w.page.locator('.inped-win .win-x, .floatwin .win-x').locator('visible=true').first()
    if (await x.count()) { await x.tap().catch(() => {}); await sleep(500) }
    const c = w.page.locator('#inpEditCancel:visible').first()
    if (await c.count()) { await c.tap().catch(() => {}); await sleep(500) }
  }
  const tap2 = async (w, name) => { await sleep(100); await X.pic(w, name + '-tap'); await sleep(900); await X.pic(w, name) }
  const openNew = async w => {
    const page = w.page
    await X.L.go(page, 'inputs'); await sleep(1200)
    if (!(await page.locator('#inNew:visible').count())) { await page.locator('#inListBtn').tap(); await sleep(800) }
    await page.locator('#inNew').tap(); await sleep(1500)
    return page.locator('.inped-win').count()
  }
  const selOpts = page => page.evaluate(() => { const s = document.querySelector('#inpEditPerson'); return s ? { disabled: s.disabled, val: s.options[s.selectedIndex]?.text, opts: [...s.options].map(o => o.text) } : null })
  const pucks = page => page.evaluate(() => [...document.querySelectorAll('.inped-win .pp-puck')].filter(b => b.getBoundingClientRect().width > 2).map(b => b.textContent.replace(/\s+/g, ' ').trim() + (b.classList.contains('on') ? '*' : '')))
  const monthTitle = page => page.evaluate(() => (document.querySelector('.inped-win .dcal-title')?.textContent || '').replace(/\s+/g, ' ').trim())
  /* file an input in the open new-input window: type (option text regex), pid pick done by caller; day label like 'Mon 23 Nov 2026' */
  const pickDay = async (w, label, picName) => {
    const page = w.page
    for (let i = 0; i < 8; i++) {
      const t = await monthTitle(page)
      if (/November 2026/.test(t)) break
      await page.locator('.inped-win .dcal-nav[aria-label="Next month"]').first().tap(); await sleep(500)
    }
    say('calendar on:', await monthTitle(page))
    const d = page.locator(`.inped-win .dcal-d[aria-label^="${label}"]`).first()
    await d.evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await sleep(400)
    await X.pic(w, picName + '-before-day')
    const where = await inside(page, `.inped-win .dcal-d[aria-label^="${label}"]`)
    say('day button', label, where)
    await d.tap(); await sleep(600)
    await X.pic(w, picName + '-after-day')
    return where
  }
  const bodyOf = (page, sel) => page.evaluate(sel => (document.querySelector(sel)?.innerText || '').replace(/\s+/g, ' ').trim(), sel)
  return { X, U, say, sleep, row, vis, inside, swap, closeAny, tap2, openNew, selOpts, pucks, monthTitle, pickDay, bodyOf }
}
