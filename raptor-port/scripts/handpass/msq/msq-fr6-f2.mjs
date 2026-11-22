/* msq-fr6-f2 v1 — F2: own leave (LL) on Mon 23 Nov for ad2 Hunter, us Ranger, ad9 Kestrel: add, Undo, Redo (FR5_PHONE=1 for the iPhone) */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'f2'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep, row } = H
say('msq-fr6-f2 v2')
const phone = process.env.FR5_PHONE === '1'
const size = phone ? 'iPhone' : 'desktop'
const who = { ad2: 'Hunter', us: 'Ranger', ad9: 'Kestrel' }
const tapIt = async loc => { if (phone) await loc.tap(); else await loc.click() }
for (const u of Object.keys(who)) {
  const nm = who[u]
  let w = null
  try {
    w = await X.open({ phone, user: u })
    const p = w.page
    const listText = () => p.evaluate(() => (document.querySelector('#page-inputs table, #page-inputs')?.innerText || '').replace(/\s+/g, ' ').trim())
    const countLL = async () => { const t = await listText(); return (t.match(/LL\b/g) || []).length }
    await X.L.go(p, 'inputs'); await sleep(1200)
    if (!(await p.locator('#inNew:visible').count())) { await tapIt(p.locator('#inListBtn')); await sleep(800) }
    const before = await countLL()
    await X.pic(w, `f2-${u}-01-list-before`)
    await tapIt(p.locator('#inNew')); await sleep(1400)
    await p.selectOption('#inpEditType', { label: 'LL' }); await sleep(600)
    const who0 = await p.evaluate(() => { const s = document.querySelector('#inpEditPerson'); return s ? s.options[s.selectedIndex]?.text + ' disabled=' + s.disabled : 'none' })
    for (let i = 0; i < 8; i++) {
      const t = await p.evaluate(() => (document.querySelector('.inped-win .dcal-title')?.textContent || '').replace(/\s+/g, ' ').trim())
      if (/November 2026/.test(t)) break
      await tapIt(p.locator('.inped-win .dcal-nav[aria-label="Next month"]').first()); await sleep(500)
    }
    const d = p.locator('.inped-win .dcal-d[aria-label^="Mon 23 Nov 2026"]').first()
    await d.evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await sleep(400)
    await tapIt(d); await sleep(600)
    await X.pic(w, `f2-${u}-02-filled`)
    await tapIt(p.locator('#inpEditSave')); await sleep(1600)
    await X.pic(w, `f2-${u}-03-after-add`)
    const nd = p.locator('button:visible', { hasText: /^(No document|Later|OK)$/ }).last()
    if (await nd.count()) { say('question', await nd.textContent()); await tapIt(nd); await sleep(1200); await X.pic(w, `f2-${u}-04-after-question`) }
    const t1 = await listText(); const c1 = await countLL()
    row('F2', size, `${u} ${nm}: Inputs + Input, LL for ${who0}, Mon 23 Nov, Add`, 'saved; shown on his row', `LL count ${before} -> ${c1}; window open ${await p.locator('.inped-win:visible').count()}; list ${t1.slice(0, 250)}`, c1 === before + 1 ? 'PASS' : 'FAIL', `f2-${u}-03-after-add.png`)
    const und = p.locator('#undoBtn:visible').first()
    await tapIt(und); await sleep(1300)
    await X.pic(w, `f2-${u}-05-undo`)
    const c2 = await countLL()
    row('F2', size, `${u}: top bar Undo`, 'the leave is gone', `LL count ${c2}`, c2 === before ? 'PASS' : 'FAIL', `f2-${u}-05-undo.png`)
    const red = p.locator('#redoBtn:visible').first()
    await tapIt(red); await sleep(1300)
    await X.pic(w, `f2-${u}-06-redo`)
    const c3 = await countLL()
    row('F2', size, `${u}: top bar Redo`, 'the leave is back', `LL count ${c3}`, c3 === before + 1 ? 'PASS' : 'FAIL', `f2-${u}-06-redo.png`)
    say('errors', u, JSON.stringify(w.errors))
  } catch (e) { say('ERR', u, e.message.split('\n')[0]); if (w) await X.pic(w, 'err-' + u).catch(() => {}); row('F2', size, u + ' script', 'completes', e.message.split('\n')[0], 'OWED', 'err-' + u + '.png') }
  if (w) await w.browser.close().catch(() => {})
}
X.saveRows(); say('DONE')
