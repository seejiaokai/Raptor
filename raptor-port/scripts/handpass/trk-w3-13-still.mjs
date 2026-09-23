/* w3 item 13 — controls a person taps repeatedly must not move under them
   (R115, owner 2 Sep 26 app-wide): the lull calendar's ‹ › arrows across
   twelve months, ↶ ↷ as they grey and ungrey, the chart and panel zoom − / +
   as the % changes from 100% to 10% and up to 300%, and the Save slot as ✓ Save
   changes comes and goes — desktop, and the phone's save corner. */
import { open, shot, save, log, DESK, PHONE } from './trk-lib.mjs'
import { sleep, tapBall, menuItem, dlg, box } from './trk-w3-lib.mjs'

const L = log()
const pos = async (page, sels) => { const o = {}; for (const s of sels) { const b = await box(page, s); o[s] = b ? `${b.x},${b.y},${b.w}x${b.h}` : 'gone' } return o }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/* ---------------- desktop ---------------- */
{
  const { browser, page, errors } = await open({ size: DESK, who: 'a' })
  /* the lull calendar: twelve presses of ›, then twelve of ‹ */
  await page.click('#setLullBtn'); await page.waitForSelector('#lullCal', { state: 'visible' }); await sleep(250)
  const a0 = await pos(page, ['#lullPrev', '#lullNext', '#lullCal'])
  const moves = []; const months = []
  for (let i = 0; i < 12; i++) {
    await page.click('#lullNext'); await sleep(120)
    const a = await pos(page, ['#lullPrev', '#lullNext', '#lullCal'])
    months.push(await page.locator('#lullCal .hd b').innerText())
    if (!same(a, a0)) moves.push(`${months[months.length - 1]}: ${JSON.stringify(a)}`)
  }
  for (let i = 0; i < 12; i++) { await page.click('#lullPrev'); await sleep(100); const a = await pos(page, ['#lullPrev', '#lullNext', '#lullCal']); if (!same(a, a0)) moves.push('back ' + i + ': ' + JSON.stringify(a)) }
  L.ok('lull calendar: ‹ and › hold still across 24 month changes', !moves.length, moves.length ? moves.slice(0, 4).join(' | ') : `${JSON.stringify(a0)} · months ${months[0]} … ${months[11]}`)
  await shot(page, 'w3-13-lull-calendar', { el: '#lullCal' })
  await page.keyboard.press('Escape'); await sleep(200)
  L.ok('…and Escape closed it without saving a half period', !(await page.locator('#lullCal').count()) && (await page.locator('#lullChips').innerText()).includes('none'), await page.locator('#lullChips').innerText())
  /* ↶ ↷ as they grey / ungrey */
  const u0 = await pos(page, ['#trUndoBtn', '#trRedoBtn', '#showAllBtn'])
  await tapBall(page, 'ST-01'); await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(400)
  const u1 = await pos(page, ['#trUndoBtn', '#trRedoBtn', '#showAllBtn'])
  await page.click('#trUndoBtn'); await sleep(300)
  const u2 = await pos(page, ['#trUndoBtn', '#trRedoBtn', '#showAllBtn'])
  await page.click('#trRedoBtn'); await sleep(300)
  const u3 = await pos(page, ['#trUndoBtn', '#trRedoBtn', '#showAllBtn'])
  L.ok('↶ ↷ hold still: nothing to undo → a mark → undo → redo', same(u0, u1) && same(u1, u2) && same(u2, u3), JSON.stringify([u0, u1, u2, u3].map(x => x['#trUndoBtn'] + ' / ' + x['#trRedoBtn'])))
  /* the chart zoom: 100% → 10% → 300% */
  const zs = ['#fzOut', '#fzIn', '#fzReset', '#fzPct']
  const z0 = await pos(page, zs); const zm = []
  for (let i = 0; i < 10; i++) { await page.click('#fzOut'); await sleep(90); const z = await pos(page, zs); const pct = await page.locator('#fzPct').innerText(); if (!same({ a: z['#fzOut'], b: z['#fzIn'], c: z['#fzReset'] }, { a: z0['#fzOut'], b: z0['#fzIn'], c: z0['#fzReset'] })) zm.push(`${pct}: − ${z['#fzOut']} + ${z['#fzIn']} reset ${z['#fzReset']}`) }
  L.note('chart zoom after 10 × −', await page.locator('#fzPct').innerText())
  for (let i = 0; i < 29; i++) { await page.click('#fzIn'); await sleep(60); const z = await pos(page, zs); const pct = await page.locator('#fzPct').innerText(); if (!same({ a: z['#fzOut'], b: z['#fzIn'], c: z['#fzReset'] }, { a: z0['#fzOut'], b: z0['#fzIn'], c: z0['#fzReset'] })) zm.push(`${pct}: − ${z['#fzOut']} + ${z['#fzIn']} reset ${z['#fzReset']}`) }
  L.ok('chart zoom − / + / reset hold still from 10% to 300%', !zm.length, zm.length ? `${zm.length} moves, e.g. ${zm.slice(0, 3).join(' | ')} (at 100%: − ${z0['#fzOut']} + ${z0['#fzIn']})` : JSON.stringify(z0))
  await shot(page, 'w3-13-chart-zoom', { el: '#flowZoomCtl' })
  await page.click('#fzReset'); await sleep(300)
  /* the panel zoom: 100% → 10% → 160% */
  const ps = ['#szOut', '#szIn', '#szReset']
  const p0 = await pos(page, ps); const pm = []
  for (let i = 0; i < 9; i++) { await page.click('#szOut'); await sleep(80); const p = await pos(page, ps); if (!same(p, p0)) pm.push(`${await page.locator('#szPct').innerText()}: ${JSON.stringify(p)}`) }
  for (let i = 0; i < 15; i++) { await page.click('#szIn'); await sleep(60); const p = await pos(page, ps); if (!same(p, p0)) pm.push(`${await page.locator('#szPct').innerText()}: ${JSON.stringify(p)}`) }
  L.ok('panel zoom − / + / reset hold still from 10% to 160%', !pm.length, pm.length ? `${pm.length} moves, e.g. ${pm.slice(0, 3).join(' | ')} (at 100%: ${JSON.stringify(p0)})` : JSON.stringify(p0))
  await page.click('#szReset'); await sleep(200)
  /* the Save slot */
  const bar = ['#activeSel', '#courseSel', '#sylSel', '#detailsBtn', '#trUndoBtn', '#showAllBtn', '#hSearch', '#barHideBtn', '.saveslot']
  const s0 = await pos(page, bar)
  await menuItem(page, 'syl', 'arrangeBtn')
  await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(250); await dlg(page, { value: 'STILL-1' }); await sleep(300)
  await menuItem(page, 'syl', 'arrangeBtn')
  const s1 = await pos(page, bar)
  const moved = bar.filter(k => s0[k] !== s1[k])
  L.ok('Save slot: ✓ Save changes appears and nothing on the bar moves (the slot keeps its place)', !moved.length || (moved.length === 1 && moved[0] === '.saveslot' && s0['.saveslot'].split(',')[0] === s1['.saveslot'].split(',')[0]), moved.length ? moved.map(k => `${k}: ${s0[k]} → ${s1[k]}`).join(' | ') : 'nothing moved')
  await page.click('#saveChanges'); await sleep(400)
  const s2 = await pos(page, bar)
  L.ok('…and it goes again with nothing moving', bar.every(k => k === '.saveslot' || s2[k] === s0[k]), bar.filter(k => s2[k] !== s0[k]).map(k => `${k}: ${s0[k]} → ${s2[k]}`).join(' | ') || 'nothing moved')
  L.note('desk errors', errors.join(' | ') || 'none')
  await browser.close()
}

/* ---------------- phone: the save corner ---------------- */
{
  const { browser, page, errors } = await open({ size: PHONE, who: 'a', touch: true })
  const tapSel = async sel => { const b = await page.locator(sel).first().boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(400) }
  const bar = ['#activeSel', '#sylSel', '#detailsBtn', '#trUndoBtn', '#trRedoBtn', '#fileMenuBtn', '#hSearchBtn', '#barHideBtn', '.saveslot', '#page-tracker header']
  const s0 = await pos(page, bar)
  await tapSel('#sylMenuBtn'); await tapSel('#arrangeBtn')
  const addT = page.locator('#arrTools button', { hasText: '+ Test' }); const tb = await addT.boundingBox()
  await page.touchscreen.tap(tb.x + tb.width / 2, tb.y + tb.height / 2); await sleep(300); await dlg(page, { value: 'STILL-2' }); await sleep(300)
  await tapSel('#sylMenuBtn'); await tapSel('#arrangeBtn')
  const s1 = await pos(page, bar)
  const sv = await box(page, '#saveChanges'), hdr = await box(page, '#page-tracker header')
  L.ok('phone: ✓ Save changes sits at the far right of its row', sv && hdr && hdr.r - sv.r < 70, `Save ${JSON.stringify(sv)}; bar right ${hdr && hdr.r}; status "${await page.locator('#saveStat').innerText()}"`)
  L.ok('phone: the bar is the same height with it (R97) and nothing else moved', s0['#page-tracker header'] === s1['#page-tracker header'] && bar.filter(k => !['.saveslot', '#page-tracker header'].includes(k)).every(k => s0[k] === s1[k]), bar.filter(k => s0[k] !== s1[k]).map(k => `${k}: ${s0[k]} → ${s1[k]}`).join(' | ') || 'nothing moved')
  await shot(page, 'w3-13-phone-save-corner', { el: '#page-tracker header' })
  L.note('phone errors', errors.join(' | ') || 'none')
  await browser.close()
}
save('w3-13-still', { rows: L.rows })
