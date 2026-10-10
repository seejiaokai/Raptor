import { launch, open, openDay, press, shot, cardFacts, toList, overflow, judge, saveRows, geom2, saveWin, csId, DAYWIN, WIN, rec, recAll, errs } from './icard-A-lib.mjs'
const browser = await launch()
const TITLE = 'Wing standardisation brief', RMK = 'All aircrew attend; bring logbooks and the signed currency forms. END OF REMARK'

async function fileFourteen(page, touch) {
  await openDay(page, '2026-07-21', touch)
  await press(touch, page.locator('#icPopAdd')); await page.locator(WIN).waitFor()
  await page.selectOption('#inpEditType', 'Meeting')
  await press(touch, page.locator(`${WIN} [data-testid="pp-several"]`))
  const picker = await page.locator(`${WIN} [data-testid="pp"]`).evaluate(el => el.innerHTML.slice(0, 500))
  console.log('picker', picker)
  const all = await page.locator(`${WIN} [data-pp]`).evaluateAll(els => els.map(e => ({ id: e.getAttribute('data-pp'), t: e.textContent.trim(), dis: e.disabled || e.getAttribute('aria-disabled') === 'true' })))
  const csOf = id => page.evaluate(id => window.PEOPLE[id].cs, id)
  for (const a of all) a.cs = await csOf(a.id)
  const usable = all.filter(a => !a.dis && a.cs !== 'Saber')
  const step = Math.floor(usable.length / 13)
  const chosen = []
  for (let i = 0; i < 13; i++) chosen.push(usable[i * step])
  for (const c of chosen) { const b = page.locator(`${WIN} [data-pp="${c.id}"]`); await b.scrollIntoViewIfNeeded().catch(() => {}); await press(touch, b) }
  const selected = await page.locator(`${WIN} [data-pp][aria-pressed="true"]`).count()
  await page.fill('#inpEditStart', '10:00').catch(() => {}); await page.fill('#inpEditEnd', '11:00').catch(() => {})
  await page.fill('#inpEditOwnTitle', TITLE); await page.fill('#inpEditRmk', RMK)
  await saveWin(page, touch, 'no')
  return { chosen: [...chosen.map(c => c.cs), 'Saber'].sort((a, b) => a.localeCompare(b)), selected, groupsSeen: usable.length }
}
async function judgeSize(page, touch, label, expectNames, wantList) {
  const probs = []; const pics = []
  const out = {}
  const where = [['day', async () => { await openDay(page, '2026-07-21', touch); await page.waitForTimeout(400); return [DAYWIN, 'idy'] }]]
  if (wantList) where.push(['list', async () => { await toList(page, touch); return ['#inList', 'inl'] }])
  for (const [nm, go] of where) {
    const [root, tid] = await go()
    const all = await cardFacts(page, root, tid)
    const mine = all.filter(c => c.title === TITLE)
    if (mine.length !== 1) { probs.push(`${nm}: ${mine.length} cards titled ${TITLE}`); continue }
    const card = mine[0]
    const sel = `${root} [data-testid="${tid}-row-${card.iid}"]`
    await page.locator(sel).scrollIntoViewIfNeeded()
    const g = await geom2(page, sel)
    pics.push(await shot(page, `8-${label}-${nm}`))
    const names = (card.who || '').split(',').map(s => s.trim()).filter(Boolean)
    if (names.length !== 14) probs.push(`${nm}: ${names.length} names "${card.who}"`)
    if (new Set(names).size !== names.length) probs.push(`${nm}: a name twice`)
    if (/\+\d/.test(card.who)) probs.push(`${nm}: +N in "${card.who}"`)
    if (JSON.stringify(names) !== JSON.stringify(expectNames)) probs.push(`${nm}: names not the chosen ones A-Z: ${names.join('/')} vs ${expectNames.join('/')}`)
    if (card.pucks) probs.push(`${nm}: ${card.pucks} pucks`)
    if (card.by !== 'By Saber') probs.push(`${nm}: by "${card.by}"`)
    if (card.rmk == null || !card.rmk.includes('END OF REMARK')) probs.push(`${nm}: remark cut "${card.rmk}"`)
    probs.push(...g.probs.map(x => `${nm}: ${x}`)); if (g.cut.length) probs.push(`${nm}: clipped ${g.cut.join(',')}`)
    const ov = await overflow(page); if (ov.wide) probs.push(`${nm}: page wider ${ov.sw}>${ov.iw}`)
    if (nm === 'day') { const cnt = await page.locator(`${DAYWIN}`).evaluate(w => (w.innerText.match(/(\d+)\s+INPUTS?/i) || [])[0] || w.innerText.slice(0, 200)); out.dayCount = cnt; if (!/^1\s+input$/i.test(cnt)) probs.push('day count says ' + cnt) }
    if (nm === 'list') { const head = await page.evaluate(() => { const h = [...document.querySelectorAll('#inList [data-testid="inl-day"]')].find(x => /21 Jul/i.test(x.textContent)); return h ? h.textContent.replace(/\s+/g, ' ') : null }); out.listHead = head; if (!/1 input$/i.test(head || '')) probs.push('list heading says ' + head) }
    out[nm] = { h: g.h, lines: g.whoLines }
  }
  return { probs, pics, out }
}
for (const [label, vp, touch] of [['390', { width: 390, height: 844 }, true], ['desk', { width: 1440, height: 900 }, false]]) {
  const { ctx, page } = await open(browser, vp, 'ad', 'a', touch)
  const f = await fileFourteen(page, touch)
  console.log(label, 'selected', f.selected, 'usable', f.groupsSeen, f.chosen.join(','))
  const r = await judgeSize(page, touch, label, f.chosen, touch)
  const probs = r.probs
  if (f.selected !== 14) probs.push('picker shows ' + f.selected + ' selected')
  await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(250)
  await press(touch, page.locator('#undoBtn')); await page.waitForTimeout(400)
  const un = await recAll(page, { title: TITLE })
  await press(touch, page.locator('#redoBtn')); await page.waitForTimeout(400)
  const rd = await recAll(page, { title: TITLE })
  if (un.length) probs.push(`Undo left ${un.length} records`); if (rd.length !== 14) probs.push(`Redo restored ${rd.length} records (wanted 14)`)
  judge(8, label === '390' ? 'phone 390' : 'desktop 1440', 'admin', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || `one card, 14 names A-Z each once, By Saber, ${JSON.stringify(r.out)}; Undo removed all, Redo restored 14`, r.pics)
  if (label === '390') {
    await page.setViewportSize({ width: 320, height: 640 }); await page.waitForTimeout(400)
    const r2 = await judgeSize(page, true, '320', f.chosen, true)
    judge(8, 'phone 320', 'admin', r2.probs.length ? 'FAIL' : 'PASS', r2.probs.join(' | ') || `intact at 320 ${JSON.stringify(r2.out)}`, r2.pics)
  }
  await ctx.close()
}
await browser.close()
saveRows('s8')
console.log('ERRS', JSON.stringify(errs))
