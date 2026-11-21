/* msq-j2-r-b v1 — R-B: a member's own input and his bell (desktop 1536, fresh world) */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'rb1'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, U, say, sleep, row } = H
say('msq-j2-r-b v1')
const w = await X.open({ user: 'us9' })
const p = w.page
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, 'desktop', 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
const winBtns = () => p.evaluate(() => [...document.querySelectorAll('.inped-win button, .floatwin button')].filter(b => b.getBoundingClientRect().width > 2).map(b => (b.id || '') + '[' + (b.getAttribute('aria-label') || b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30) + ']').join(' '))
const winText = () => p.evaluate(() => [...document.querySelectorAll('.inped-win,.floatwin')].filter(e => e.getBoundingClientRect().width > 2).map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' ## ').slice(0, 700))
const listText = () => p.evaluate(() => (document.querySelector('#page-inputs table, #page-inputs')?.innerText || '').replace(/\s+/g, ' ').trim())
const goList = async () => { await X.L.go(p, 'inputs'); await sleep(1200); if (!(await p.locator('#inNew:visible').count())) { await p.locator('#inListBtn').click(); await sleep(800) } }
const pickDay = async label => {
  for (let i = 0; i < 8; i++) {
    const t = await p.evaluate(() => (document.querySelector('.inped-win .dcal-title')?.textContent || '').replace(/\s+/g, ' ').trim())
    if (/November 2026/.test(t)) break
    await p.locator('.inped-win .dcal-nav[aria-label="Next month"]').first().click(); await sleep(500)
  }
  await p.locator(`.inped-win .dcal-d[aria-label^="${label}"]`).first().click(); await sleep(600)
}
await safe('RB-file', async () => {
  await goList()
  await p.locator('#inNew').click(); await sleep(1300)
  await p.selectOption('#inpEditType', { label: 'Training' }); await sleep(500)
  say('buttons after type', await winBtns())
  await pickDay('Mon 23 Nov 2026')
  await X.pic(w, 'b01-before-add')
  say('win', await winText())
  await p.locator('#inpEditSave').click(); await sleep(1500)
  await X.pic(w, 'b02-after-add')
  say('after add win open', await p.locator('.inped-win:visible').count(), await winBtns())
  const q = await winText()
  // if a question stands (document etc.), record it
  const nd = p.locator('button:visible', { hasText: /^(No document|Later|OK)$/ }).last()
  if (await nd.count()) { say('question buttons present', await nd.textContent()); await nd.click(); await sleep(1200); await X.pic(w, 'b03-after-question') }
  const lt = await listText()
  const ok = /Training/.test(lt) && /Osprey/.test(lt)
  row('R-B', 'desktop', 'us9: Inputs -> + Input -> Training for himself, Mon 23 Nov -> Add', 'it shows on the list', `list: ${lt.slice(0, 350)}`, ok ? 'PASS' : 'FAIL', 'b02-after-add.png')
})
await safe('RB-remark', async () => {
  const r = p.locator('#page-inputs tr, #page-inputs .in-row, #page-inputs [data-input]').filter({ hasText: /Training/ }).first()
  say('row count', await r.count())
  await r.click(); await sleep(1200)
  await X.pic(w, 'b04-opened')
  say('opened buttons', await winBtns()); say('opened win', await winText())
  await p.locator('#inpEditRmk').fill('r walk remark'); await sleep(300)
  await p.locator('#inpEditSave').click(); await sleep(1500)
  await X.pic(w, 'b05-remark-saved')
  const nd = p.locator('button:visible', { hasText: /^(No document|Later|OK)$/ }).last()
  if (await nd.count()) { await nd.click(); await sleep(1000) }
  const lt = await listText()
  row('R-B', 'desktop', 'us9: open the Training, change its remark to "r walk remark", Save', 'saved; remark on the list', `list: ${lt.slice(0, 350)}`, /r walk remark/.test(lt) ? 'PASS' : 'FAIL', 'b05-remark-saved.png')
})
await safe('RB-admin', async () => {
  await H.swap(w, 'ad9')
  await goList()
  const r = p.locator('#page-inputs tr, #page-inputs .in-row, #page-inputs [data-input]').filter({ hasText: /Training/ }).first()
  say('ad9 row count', await r.count())
  await X.pic(w, 'b06-ad9-list')
  await r.click(); await sleep(1200)
  await X.pic(w, 'b07-ad9-opened')
  say('ad9 opened buttons', await winBtns()); say('ad9 opened win', await winText())
  await p.locator('.inped-win .pp-sw').first().click().catch(() => {}); await sleep(800)
  await X.pic(w, 'b08-ad9-picker')
  say('pucks', await p.evaluate(() => [...document.querySelectorAll('.inped-win .pp-puck')].map(b => b.textContent.trim() + (b.classList.contains('on') ? '*' : '')).join(',')))
  await p.locator('.inped-win .pp-puck', { hasText: /^Merlin/ }).first().click(); await sleep(600)
  await X.pic(w, 'b09-ad9-merlin-picked')
  say('pucks', await p.evaluate(() => [...document.querySelectorAll('.inped-win .pp-puck')].map(b => b.textContent.trim() + (b.classList.contains('on') ? '*' : '')).join(','))), say('buttons', await winBtns())
  await p.locator('#inpEditSave').click(); await sleep(1500)
  await X.pic(w, 'b10-ad9-saved')
  const nd = p.locator('button:visible', { hasText: /^(No document|Later|OK)$/ }).last()
  if (await nd.count()) { say('q', await nd.textContent()); await nd.click(); await sleep(1000); await X.pic(w, 'b11-q') }
  const lt = await listText()
  row('R-B', 'desktop', 'ad9: open Osprey\'s Training, add Merlin (people picker), Save', 'saved; Merlin on it', `list: ${lt.slice(0, 400)}`, /Merlin/.test(lt) ? 'PASS' : 'FAIL', 'b10-ad9-saved.png')
})
await safe('RB-bell', async () => {
  await H.swap(w, 'us9')
  const b = await H.bellOpen(w, 'b12-us9-bell')
  row('R-B', 'desktop', 'us9: bell after Merlin was added', 'RECORD a line about Merlin being added', `cls "${b.cls}" lines ${JSON.stringify(b.lines)}`, b.lines && b.lines.some(l => /Merlin/.test(l)) ? 'RECORD' : 'FAIL', 'b12-us9-bell.png')
  await H.bellClose(w)
})
await safe('RB-undo', async () => {
  await goList()
  const r = p.locator('#page-inputs tr, #page-inputs .in-row, #page-inputs [data-input]').filter({ hasText: /Training/ }).first()
  await r.click(); await sleep(1200)
  await X.pic(w, 'b13-us9-opened')
  say('us9 opened buttons', await winBtns()); say('us9 opened win', await winText())
  const out = p.locator('.inped-win button', { hasText: /^take me out$/i }).first()
  say('out ctrl count', await out.count())
  if (await out.count()) {
    await out.click(); await sleep(900); await X.pic(w, 'b14-out-question')
    say('question win', await winText())
    const yes = p.locator('button:visible', { hasText: /^(Take (me|yourself) out|Yes|Remove|Take out)/ }).first()
    say('buttons now', await winBtns(), '| all visible buttons', await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 2 && !/^\[?(Mon|Tue|Wed|Thu|Fri|Sat|Sun) /.test(b.getAttribute('aria-label') || '')).map(b => (b.textContent || '').trim().slice(0, 20)).filter(Boolean).slice(-14).join(' / ')))
    if (await yes.count()) { say('confirm', await yes.textContent()); await yes.click(); await sleep(1300) }
    await X.pic(w, 'b15-out-done')
    const lt = await listText(); const before = lt
    say('after out list', lt.slice(0, 400))
    await p.locator('#undoBtn').first().click(); await sleep(1200)
    await X.pic(w, 'b16-after-undo')
    const lu = await listText()
    row('R-B', 'desktop', 'us9: take himself out, top bar Undo', 'he is back in it', `before undo: ${before.slice(0, 250)} || after undo: ${lu.slice(0, 250)}`, /Osprey/.test(lu) ? 'PASS' : 'FAIL', 'b16-after-undo.png')
    await p.locator('#redoBtn').first().click(); await sleep(1200)
    await X.pic(w, 'b17-after-redo')
    const lr = await listText()
    row('R-B', 'desktop', 'us9: top bar Redo', 'out again', `list: ${lr.slice(0, 300)}`, 'RECORD', 'b17-after-redo.png')
  } else row('R-B', 'desktop', 'us9: take himself out', 'a control for it', 'no such control found; window buttons: ' + await winBtns(), 'OWED', 'b13-us9-opened.png')
})
await X.fin(w)
