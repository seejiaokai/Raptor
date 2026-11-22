/* msq-j2-r-g v1 — R-G: the phone, by touch (iPhone 402 x 874 WebKit, fresh world) */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'rg1'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const W3 = await (await import('./msq-j2-w3-h.mjs')).mk()
const { X, U, say, sleep, row } = H
say('msq-j2-r-g v1')
const w = await X.open({ phone: true, user: 'us9' })
const p = w.page
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, 'iPhone', 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
const shot2 = async name => { await sleep(100); await X.pic(w, name + '-tap'); await sleep(800); await X.pic(w, name) }
const vis = loc => loc.first().isVisible().catch(() => false)
const box = async loc => { const b = await loc.boundingBox().catch(() => null); return b ? [Math.round(b.x), Math.round(b.y), Math.round(b.x + b.width), Math.round(b.y + b.height)] : null }
const inside = b => !!b && b[0] >= 0 && b[1] >= 0 && b[2] <= 402 && b[3] <= 874
const blankPoint = sel => p.evaluate(s => {
  const keep = document.querySelector(s)
  for (let y = 860; y > 60; y -= 20) for (let x = 20; x < 390; x += 30) {
    const e = document.elementFromPoint(x, y)
    if (!e || (keep && keep.contains(e))) continue
    if (e.closest('button,input,select,textarea,a,label,[role=button],[role=menuitem],td,[data-testid^="dcal"]')) continue
    return [x, y]
  }
  return null
}, sel)
await safe('RG-bell', async () => {
  await X.pic(w, 'g00-us9-home')
  const bell = p.locator('#notifyBell:visible').first()
  const list = p.locator('[data-testid="bell-list"]')
  say('bell class', await bell.getAttribute('class'))
  await bell.tap(); await shot2('g01-bell-open')
  const lb = await box(list)
  row('R-G', 'iPhone', 'us9 taps the bell', 'its list opens, inside the screen', `open: ${await vis(list)}; box ${JSON.stringify(lb)} inside: ${inside(lb)}; words: ${(await list.innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 150)}`, (await vis(list)) && inside(lb) ? 'PASS' : 'FAIL', 'g01-bell-open.png')
  await bell.tap(); await shot2('g02-bell-bell')
  const s1 = await vis(list)
  row('R-G', 'iPhone', 'taps the bell again', 'the list closes', `list still shown: ${s1}`, !s1 ? 'PASS' : 'FAIL', 'g02-bell-bell.png')
  if (s1) { await p.keyboard.press('Escape'); await sleep(500) }
  await bell.tap(); await sleep(800)
  const pt = await blankPoint('[data-testid="bell-list"]')
  if (pt) await p.touchscreen.tap(pt[0], pt[1])
  await shot2('g03-bell-outside')
  const s2 = await vis(list)
  row('R-G', 'iPhone', `opens the bell, taps outside it at ${JSON.stringify(pt)}`, 'the list closes', `list still shown: ${s2}`, pt && !s2 ? 'PASS' : 'FAIL', 'g03-bell-outside.png')
})
await safe('RG-oil', async () => {
  await W3.swap(w, 'ad9')
  await X.L.go(p, 'leavewar'); await sleep(2600)
  const cell = p.locator('td[data-testid="cell-osp9-2026-11-24"]')
  await cell.scrollIntoViewIfNeeded().catch(() => {}); await sleep(500)
  say('cell box', JSON.stringify(await box(cell)))
  await cell.tap(); await shot2('g04-day-window')
  const x = p.locator('[data-testid="bid-cancel"]')
  const wb = await box(x.locator('xpath=ancestor::*[contains(@class,"bidsheet")][1]'))
  row('R-G', 'iPhone', "ad9 taps Osprey's Tue 24 Nov", 'the day window opens, inside the screen', `open: ${await vis(x)}; window box ${JSON.stringify(wb)} inside: ${inside(wb)}`, (await vis(x)) && inside(wb) ? 'PASS' : 'FAIL', 'g04-day-window.png')
  await p.locator('[data-testid="bid-oil"]').tap(); await shot2('g05-grant-open')
  await p.locator('input[placeholder^="why"]').fill('r phone walk'); await sleep(300)
  await X.pic(w, 'g06-reason')
  await p.getByRole('button', { name: /^Give (FO|HO)/ }).first().tap(); await shot2('g07-given')
  if (await vis(x)) { await x.tap().catch(() => {}); await sleep(700) }
  await X.pic(w, 'g08-grid')
  const c = async () => (await cell.innerText().catch(() => '(no cell)')).replace(/\s+/g, ' ').trim()
  const t1 = await c()
  row('R-G', 'iPhone', "ad9: Grant OIL -> Give FO on Osprey's Tue 24 Nov", 'FO on the grid', `cell "${t1}"`, /FO/.test(t1) ? 'PASS' : 'FAIL', 'g08-grid.png')
  const und = p.locator('#undoBtn:visible, button[aria-label="Undo"]:visible').first()
  say('undo count', await und.count(), await und.evaluate(e => e.id + ' ' + e.className + ' disabled=' + e.disabled).catch(() => ''))
  await und.tap(); await shot2('g09-undo')
  const t2 = await c()
  row('R-G', 'iPhone', 'ad9: top bar Undo', 'the FO is gone', `cell "${t2}"`, !/FO/.test(t2) ? 'PASS' : 'FAIL', 'g09-undo.png')
  const red = p.locator('#redoBtn:visible, button[aria-label="Redo"]:visible').first()
  await red.tap(); await shot2('g10-redo')
  const t3 = await c()
  row('R-G', 'iPhone', 'ad9: top bar Redo', 'the FO is back', `cell "${t3}"`, /FO/.test(t3) ? 'PASS' : 'FAIL', 'g10-redo.png')
})
await safe('RG-input', async () => {
  await W3.swap(w, 'us')
  await W3.openNew(w)
  await X.pic(w, 'g11-new-input')
  await p.selectOption('#inpEditType', { label: 'Training' }); await sleep(600)
  await W3.pickDay(w, 'Mon 23 Nov 2026', 'g12')
  await p.locator('#inpEditSave').tap(); await sleep(1500)
  await X.pic(w, 'g13-after-add')
  const nd = p.locator('button:visible', { hasText: /^(No document|Later|OK)$/ }).last()
  if (await nd.count()) { say('question button', await nd.textContent()); await nd.tap(); await sleep(1200); await X.pic(w, 'g14-after-question') }
  const gone = (await p.locator('.inped-win:visible').count()) === 0
  const rows = await p.evaluate(() => [...document.querySelectorAll('#page-inputs tr')].map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 6))
  const cards = await p.evaluate(() => (document.querySelector('#page-inputs')?.innerText || '').replace(/\s+/g, ' ').slice(0, 600))
  row('R-G', 'iPhone', 'us: Inputs -> + Input -> Training for himself, Mon 23 Nov -> Add', 'it shows', `window gone ${gone}; rows ${JSON.stringify(rows)}; page ${cards}`, gone && /Training/i.test(rows.join(' ') + cards.slice(cards.indexOf('Input'))) ? 'RECORD' : 'FAIL', 'g13-after-add.png')
})
await X.fin(w)
