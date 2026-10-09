import * as L from './ivet-B-lib.mjs'
const { WIN, sleep } = L
const browser = await L.launch()
const T = true
const { ctx, page } = await L.open(browser, L.PHONE, { who: 'us', pass: 'us', touch: true })
L.scn(31, 'phone 390x844 (touch)', 'member Ranger', '+ Input pressed while a window holds unsaved changes')
const form = p => p.evaluate(() => ({ read: document.querySelector('#inpEditPop .rc-read')?.textContent, rmk: document.querySelector('#inpEditRmk')?.value, title: document.querySelector('#inpEditOwnTitle')?.value || '', type: document.querySelector('#inpEditType')?.value, ticked: [...document.querySelectorAll('[data-testid="win-inputedit"] [data-pp][aria-pressed="true"]')].map(b => b.textContent.trim().replace(/[A-Z]{1,3}$/, '')) }))
/* can a finger land on the list's "+ Input" while the window is up? */
const reach = p => p.evaluate(() => { const b = document.querySelector('#inNew').getBoundingClientRect(); const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return { top: Math.round(b.top), w: Math.round(b.width), hit: hit ? (hit.id || hit.className || hit.tagName) : null, onNew: !!hit?.closest('#inNew') } })
const cli = await L.cdp(page)
async function pressNew(p) {
  let r = await reach(p)
  if (!r.onNew) {
    // a finger drags the window down by its title so the list's "+ Input" comes out from under it
    const t = await p.evaluate(() => { const e = document.querySelector('[data-testid="win-inputedit"] .win-ttl'); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } })
    await L.touchSeq(cli, [{ x: t.x, y: t.y }, { x: t.x, y: t.y + 420 }], { holdMs: 150 }); await sleep(300)
    r = await reach(p)
    L.info('window dragged down by its title with a finger; "+ Input" reachable now', JSON.stringify(r))
  }
  if (!r.onNew) return false
  await p.locator('#inNew').tap(); await sleep(350); return true
}
async function plusUp(p) {
  await L.plus(p, T)
  const top = await p.evaluate(() => Math.round(document.querySelector('[data-testid="win-inputedit"]').getBoundingClientRect().top))
  if (top > 90) {
    const t = await p.evaluate(() => { const e = document.querySelector('[data-testid="win-inputedit"] .win-ttl'); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } })
    await L.touchSeq(cli, [{ x: t.x, y: t.y }, { x: t.x, y: t.y - (top - 61) }], { holdMs: 150 }); await sleep(300)
    L.info('the window had kept its dragged-down place; a finger drags it back up', `top was ${top}`)
  }
}
async function closeWin(p) {
  if (!(await p.locator(WIN).count())) return
  const cb = await p.evaluate(() => { const b = document.querySelector('#inpEditCancel')?.getBoundingClientRect(); return b && b.bottom <= innerHeight && b.top >= 0 })
  if (cb) await p.locator('#inpEditCancel').tap(); else await p.locator('[data-testid="win-inputedit-x"]').tap()
  await sleep(300)
  if (await p.locator('[data-testid="inped-swap"]').count()) { await p.locator('[data-testid="inped-swap-go"]').tap(); await sleep(300) }
}
await L.guard(async () => {
  await L.toList(page, T)
  const n0 = await L.count(page)
  /* 1 · a NEW draft */
  await plusUp(page)
  await page.selectOption('#inpEditType', 'Meeting')
  await L.press(T, page.locator(`${WIN} [data-testid="pp-several"]`))
  await L.press(T, page.locator(`${WIN} [data-pp="${await L.csId(page, 'Echo')}"]`))
  await L.pick(page, '2026-07-27', T); await L.pick(page, '2026-07-28', T)
  await page.fill('#inpEditOwnTitle', 'S31 title'); await page.fill('#inpEditRmk', 'S31 remark typed')
  const f0 = await form(page)
  const landed = await pressNew(page)
  if (!landed) {
    L.chk('"+ Input" can be pressed with a finger while the window holds a draft (the scenario presses it)', false, 'covered by the window on a phone — see the picture')
    await L.shot(page, 's31-new-covered')
  } else {
    const asked = await page.locator('[data-testid="inped-swap"]').count()
    const words = asked ? (await page.locator('[data-testid="inped-swap"]').innerText()).replace(/\s+/g, ' ') : ''
    await L.shot(page, 's31-1-question')
    L.chk('an unsaved-changes question appears (new draft)', asked === 1, words)
    await L.press(T, page.locator('[data-testid="inped-swap-stay"]')); await sleep(250)
    const f1 = await form(page)
    L.chk('Keep editing preserves every change (type, people, dates, title, remark)', JSON.stringify(f0) === JSON.stringify(f1), JSON.stringify({ f0, f1 }))
    await pressNew(page)
    await L.press(T, page.locator('[data-testid="inped-swap-go"]')); await sleep(350)
    const f2 = await form(page), n1 = await L.count(page), wins = await page.locator(WIN).count()
    await L.shot(page, 's31-2-discarded')
    L.chk('Discard and open: ONE fresh undated window, nothing saved', wins === 1 && f2.read === 'pick a start date' && f2.rmk === '' && n1 === n0 && f2.ticked.length <= 1, JSON.stringify({ f2, n0, n1, wins }))
    await closeWin(page)
  }
  /* 2 · from a changed SAVED input */
  await L.toList(page, T, false)
  const had = await L.ids(page)
  await plusUp(page); await page.selectOption('#inpEditType', 'Meeting'); await L.pick(page, '2026-07-30', T); await page.fill('#inpEditRmk', 'S31 saved'); await page.fill('#inpEditOwnTitle', 'S31 saved title')
  await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden' }); await sleep(400)
  const saved = (await L.newest(page, had))[0]
  await page.locator(`[data-testid="inl-row-${saved.iid}"] [data-testid="inl-open"]`).tap(); await page.locator(WIN).waitFor()
  await page.fill('#inpEditRmk', 'S31 saved EDITED')
  const g0 = await form(page)
  if (await pressNew(page)) {
    const asked = await page.locator('[data-testid="inped-swap"]').count()
    await L.shot(page, 's31-3-saved-question')
    L.chk('from a changed saved input an unsaved-changes question appears', asked === 1)
    await L.press(T, page.locator('[data-testid="inped-swap-stay"]')); await sleep(250)
    const g1 = await form(page)
    L.chk('Keep editing keeps the edit', JSON.stringify(g0) === JSON.stringify(g1), JSON.stringify(g1))
    await pressNew(page); await L.press(T, page.locator('[data-testid="inped-swap-go"]')); await sleep(350)
    const g2 = await form(page)
    const rec = await page.evaluate(i => window.INPUTS.find(r => r.iid === i)?.remarks, saved.iid)
    L.chk('Discard and open: a fresh undated window and the saved record is unchanged', g2.read === 'pick a start date' && rec === 'S31 saved', JSON.stringify({ g2, rec }))
    await closeWin(page)
  } else L.chk('saved-input case: "+ Input" reachable by finger', false)
  /* 3 · only the people changed on a saved SHARED input */
  await L.toList(page, T, false)
  const had2 = await L.ids(page)
  await plusUp(page); await page.selectOption('#inpEditType', 'Meeting')
  await L.press(T, page.locator(`${WIN} [data-testid="pp-several"]`)); await L.press(T, page.locator(`${WIN} [data-pp="${await L.csId(page, 'Echo')}"]`))
  await L.pick(page, '2026-07-31', T); await page.fill('#inpEditRmk', 'S31 shared')
  await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden' }); await sleep(400)
  const sh = await L.newest(page, had2)
  L.info('shared input filed', JSON.stringify(sh.map(r => r.cs)))
  await page.locator(`[data-testid="inl-row-${sh[0].iid}"] [data-testid="inl-open"], [data-testid="inl-row-${sh[1]?.iid}"] [data-testid="inl-open"]`).first().tap(); await page.locator(WIN).waitFor()
  await page.locator(`${WIN} [data-pp="${await L.csId(page, 'Ace')}"]`).tap()
  const h0 = await form(page)
  if (await pressNew(page)) {
    const asked = await page.locator('[data-testid="inped-swap"]').count()
    await L.shot(page, 's31-4-people-only-question')
    L.chk('with ONLY the people changed (Ace ticked) the question appears', asked === 1)
    await L.press(T, page.locator('[data-testid="inped-swap-stay"]')); await sleep(250)
    const h1 = await form(page)
    L.chk('Keep editing keeps the ticked people', JSON.stringify(h0.ticked) === JSON.stringify(h1.ticked) && h1.ticked.some(x => /Ace/.test(x)), JSON.stringify(h1.ticked))
    await pressNew(page); await L.press(T, page.locator('[data-testid="inped-swap-go"]')); await sleep(350)
    const grpNow = await page.evaluate(g => window.INPUTS.filter(r => r.grp === g).map(r => window.PEOPLE[r.person].cs).sort(), sh[0].grp)
    const g2 = await form(page)
    L.chk('Discard and open: fresh window; the saved group is unchanged (no Ace)', g2.read === 'pick a start date' && JSON.stringify(grpNow) === JSON.stringify(['Echo', 'Ranger']), JSON.stringify({ grpNow, read: g2.read }))
    await closeWin(page)
  } else L.chk('shared case: "+ Input" reachable by finger', false)
})
await ctx.close()
await browser.close()
L.save('s31')
