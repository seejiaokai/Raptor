// Scenario 9 — a title-only unsaved draft (Ranger): the Unsaved changes question, Keep editing, Discard and open.
import { launch, open, table, errs, people, shot, sleep, press, allRecs, openNew, saveWin, win, tapAt, closeAnyWin } from './it-A-lib.mjs'
import { recOf } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s9')
const front = (p, sel) => p.locator(sel).first().evaluate(e => { const r = e.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)) }).catch(() => false)
const clickBehind = async (p, sel) => {
  const el = p.locator(sel).first()
  if (!(await el.count())) return false
  await el.scrollIntoViewIfNeeded().catch(() => {})
  const pt = await el.evaluate(e => {
    const r = e.getBoundingClientRect()
    for (const [fx, fy] of [[.5, .5], [.2, .5], [.8, .5], [.5, .2], [.5, .8]]) {
      const x = r.left + r.width * fx, y = r.top + r.height * fy, h = document.elementFromPoint(x, y)
      if (h && (e === h || e.contains(h))) return { x, y }
    }
    return null
  })
  if (!pt) return false
  if (p.touch) await p.touchscreen.tap(pt.x, pt.y); else await p.mouse.click(pt.x, pt.y)
  return true
}
for (const size of (process.argv[2] || 'desk,phone').split(',')) {
  const { ctx, page } = await open(browser, size, 'us', 'us')
  const say = []; let ok = true; const pics = []
  const need = (c, m) => { if (!c) ok = false; say.push((c ? '' : 'MISSED: ') + m) }
  try {
    const P = await people(page)
    await openNew(page, '2026-07-22'); await page.selectOption('#inpEditType', 'Event'); await page.fill('#inpEditStart', '14:00'); await page.fill('#inpEditEnd', '15:00'); await saveWin(page)
    await openNew(page, '2026-07-22'); await page.selectOption('#inpEditType', 'Training'); await page.fill('#inpEditStart', '16:00'); await page.fill('#inpEditEnd', '17:00'); await saveWin(page)
    const recs = await allRecs(page)
    const ev = recs.find(r => r.type === 'Event' && r.person === P.Ranger), tr = recs.find(r => r.type === 'Training' && r.person === P.Ranger)
    const dayCard = id => `[data-testid="idy-row-${id}"] [data-testid="idy-open"]`
    const openFirstWithDraft = async () => {
      await closeAnyWin(page)
      await tapAt(page, page.locator('#inpCal [data-icday="2026-07-22"]'), { x: 8, y: 8 })
      await press(page, page.locator(dayCard(ev.iid))); await win(page).waitFor(); await sleep(page, 200)
      await page.fill('#inpEditTitle', 'Unsaved title')
    }
    /* the other input, asked for from behind the window; returns how the question showed */
    const askOther = async () => {
      const hit = await clickBehind(page, `#inpCal .ib-bar[data-iid="${tr.iid}"]`) || await clickBehind(page, dayCard(tr.iid))
      await sleep(page, 450)
      const inDom = await page.locator('[data-testid="inped-swap"]').count() > 0
      const seen = await front(page, '[data-testid="inped-swap-stay"]')
      return { hit, inDom, seen }
    }
    await openFirstWithDraft()
    pics.push(await shot(page, `s9-${size}-1-draft`))
    let a = await askOther()
    need(a.hit && a.inDom, 'another input was reached behind the window and the "Unsaved changes" question was raised')
    const qt = (await page.locator('[data-testid="inped-swap"]').innerText().catch(() => '')).replace(/\s+/g, ' ')
    say.push(`question text "${qt}"`)
    pics.push(await shot(page, `s9-${size}-2-question`))
    let hidden = false
    if (!a.seen) {
      hidden = true
      need(false, 'the question is in the DOM but NOT on screen: the tap raised the day window in front of the edit window, hiding the question and both its buttons until the day window is closed')
      await press(page, page.locator('[data-testid="win-inputsday-x"]')); await sleep(page, 350)
      pics.push(await shot(page, `s9-${size}-2b-question-after-closing-day-window`))
    }
    await press(page, page.locator('[data-testid="inped-swap-stay"]')); await sleep(page, 250)
    need((await page.inputValue('#inpEditTitle')) === 'Unsaved title' && !(await page.locator('[data-testid="inped-swap"]').isVisible().catch(() => false)), `Keep editing: the draft title is "${await page.inputValue('#inpEditTitle')}" and the question has gone`)
    pics.push(await shot(page, `s9-${size}-2c-after-keep`))
    /* the Discard path: on a phone the month and the day window are gone from sight after the first round, so the draft is thrown away
       with Cancel and made again */
    if (hidden || !(await page.locator(dayCard(tr.iid)).count())) { await press(page, page.locator('#inpEditCancel')); await sleep(page, 300); await openFirstWithDraft() }
    a = await askOther()
    if (!a.seen) { await press(page, page.locator('[data-testid="win-inputsday-x"]')); await sleep(page, 350) }
    await press(page, page.locator('[data-testid="inped-swap-go"]')); await sleep(page, 400)
    const t2 = await page.inputValue('#inpEditTitle'), ty = await page.inputValue('#inpEditType')
    need(t2 === 'Training' && ty === 'Training', `Discard and open: the window now shows the other input - Type ${ty}, Title "${t2}" (the draft title was not lent to it)`)
    pics.push(await shot(page, `s9-${size}-3-other-opened`))
    const x = await recOf(page, tr.iid); need(!x.has, `the other input stored no title (${JSON.stringify(x.title)})`)
    await closeAnyWin(page)
    const y = await recOf(page, ev.iid); need(!y.has, `the first input's saved title is unchanged (${JSON.stringify(y.title)})`)
    await tapAt(page, page.locator('#inpCal [data-icday="2026-07-22"]'), { x: 8, y: 8 })
    await press(page, page.locator(dayCard(ev.iid))); await win(page).waitFor(); await sleep(page, 200)
    need((await page.inputValue('#inpEditTitle')) === 'Event', `reopened: the first input's Title box reads "${await page.inputValue('#inpEditTitle')}"`)
    pics.push(await shot(page, `s9-${size}-4-reopened`))
  } catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 4).join(' | ')); await shot(page, `s9-${size}-err`).catch(() => {}) }
  T.add({ n: 9, size: page.sizeName, role: 'member (Ranger)', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics })
  T.save()
  await ctx.close()
}
await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
