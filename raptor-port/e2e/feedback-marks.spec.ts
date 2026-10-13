import { expect, test, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE LEFTOVERS OF 14 OCT 26, IN THE BUILT APP ([BATCH-14OCT-LEFTOVERS] — owner D849, D851, D854; the design guide's §1,
   D850). What only a real browser can say: that a mark is PAINTED and in view, that no note is drawn, where a tag stands
   in a title bar, that a row of answers wears no patch. The rules themselves are unit tests — ui/seen.test.ts (when the
   note is left unsaid), ui/inputsvet.test.tsx (who wears the mark), ui/inputcx.test.tsx, ui/upconfirm.test.tsx,
   ui/medclash.test.tsx, ui/reqdoor.test.tsx, ui/board.test.tsx.

     D851  a new input seen arriving — the opened day's card, the List's row or card — wears the board's just-added mark
           (the blue box of about six seconds) and "Input added" is not said; a screen reader is told it; the keyboard
           is back on the button that opened the window
     D854  an input changed wears it the same way and "Input updated" is not said; the month's bar wears it
     D850  the mark still shows for a reader who asked for less motion — steady, on EVERY cell of a desktop row — and goes
     …and the note is still said where no mark is drawn: a save made from the Scheduler Board
     D849 (2)  a cancelled input's window: the red CX tag and its reason follow the title, not the ✕
     D849 (3)  the upchit and the medical-clash questions: their answers flat — no patch, no line under them */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
async function month(p: Page, y: number, m: number) {
  for (let i = 0; i < 240; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))   // a phone prints three letters
    if (!d) return
    await p.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  throw new Error('the calendar never reached the month asked for')
}
const BLUE = '30, 134, 255'
/* what the passing note says while it is showing; '' while none is */
const noteNow = (p: Page) => p.evaluate(() => { const t = document.getElementById('toastEl'); return t && +getComputedStyle(t).opacity > 0.5 ? (t.textContent || '') : '' })
/* everything a note said for `ms` — an absence is only proved by watching for it */
async function notesFor(p: Page, ms = 1300) {
  const seen: string[] = [], end = Date.now() + ms
  while (Date.now() < end) { const n = await noteNow(p); if (n && !seen.includes(n)) seen.push(n); await p.waitForTimeout(60) }
  return seen
}
/* the mark on what `sel` finds: worn, PAINTED (a table row's box is drawn on its cells — every one), and in view at its
   head, middle and foot (owner D672's "in view": wholly on screen, nothing over it) */
const markOf = (p: Page, sel: string) => p.evaluate(([sel, BLUE]) => {
  const el = document.querySelector(sel)
  if (!el) return null
  const cells = el.tagName === 'TR' ? [...el.querySelectorAll(':scope > td')] : [el]
  const b = el.getBoundingClientRect(), x = b.left + b.width / 2, in1 = Math.min(3, b.height / 4)
  const at = [b.top + in1, b.top + b.height / 2, b.bottom - in1].map(y => { const h = document.elementFromPoint(x, y); return !!h && (h === el || el.contains(h)) })
  return { innew: el.classList.contains('innew'), fresh: el.getAttribute('data-fresh'), painted: cells.every(c => getComputedStyle(c).boxShadow.includes(BLUE)),
    anim: getComputedStyle(cells[0]).animationName, inView: at.every(Boolean) }
}, [sel, BLUE] as const)
const newest = (p: Page) => p.evaluate(() => String((window as any).INPUTS[0].iid))
const crew = (p: Page, n: number) => p.evaluate(n => { const P = (window as any).PEOPLE; return Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)[n] }, n)
async function phone(browser: any, baseURL: string | undefined) {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page: Page = await context.newPage()
  await login(page); await go(page, 'inputs')
  return { context, page }
}

test('D851, D854 — a day opened on the calendar: the new input’s card wears the mark and no note is drawn; changed, the same', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs')
  await month(page, 2026, 10)
  await page.locator('#inpCal [data-icday="2026-10-22"]').click()
  await page.locator('#icPopAdd').click()
  await page.locator('#inpEditRmk').fill('weekly sync')
  await page.locator('#inpEditSave').click()
  const id = await newest(page), card = `[data-testid="win-inputsday"] [data-testid="idy-row-${id}"]`
  await expect(page.locator(card)).toHaveClass(/\binnew\b/)
  const m = await markOf(page, card)
  expect(m, 'the card: marked for this input, the box painted, in view').toEqual({ innew: true, fresh: id, painted: true, anim: 'inflash', inView: true })
  expect(await notesFor(page), 'no passing note — the card is the sign').toEqual([])
  await expect(page.locator('#srSay'), 'a screen reader is told what the mark says').toHaveText('Input added')
  expect(await page.evaluate(() => (document.activeElement as HTMLElement | null)?.id), 'the keyboard is back on the button that opened the window, not on the new card').toBe('icPopAdd')
  expect(await page.locator(`.ib-bar.innew[data-iid="${id}"]`).count(), 'the bar behind the open day does not light too').toBe(0)
  /* changed FOUR SECONDS IN: its card lights again for six seconds from THIS save, the box started again, and "Input
     updated" is not said. (The fresh read's F1, 14 Oct 26: the six seconds were one timer from the first light, and a
     box already running does not start over — the step passed on the first save's mark, and two seconds after a
     second save there was neither box nor note.) */
  await page.waitForTimeout(2600)
  await page.locator(`${card} [data-testid="idy-open"]`).click()
  await page.locator('#inpEditRmk').fill('weekly sync, room 2')
  await page.locator('#inpEditSave').click()
  await expect.poll(() => page.evaluate(id => (window as any).INPUTS.find((r: any) => String(r.iid) === id).remarks, id)).toBe('weekly sync, room 2')
  await expect(page.locator(card)).toHaveClass(/\binnew\b/)
  expect((await markOf(page, card))!.painted).toBe(true)
  expect(await notesFor(page)).toEqual([])
  await expect(page.locator('#srSay')).toHaveText('Input updated')
  /* 2.8 s after the second save — past the first save's six seconds — the box is still up, at full strength */
  await page.waitForTimeout(1500)
  const later = await markOf(page, card)
  expect([later!.innew, later!.painted], 'the mark runs from the second save').toEqual([true, true])
  expect(await page.evaluate(sel => getComputedStyle(document.querySelector(sel)!).boxShadow, card), 'not in its fade').toContain('rgb(30, 134, 255) 0px 0px 0px 2px inset')
})

test('D851 — the desktop List, a second input added four seconds after the first: each row keeps its own box', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs')
  await page.locator('#inListBtn').click()
  /* every date shown, so the first input stays in the List when the second arrives ("+ Input" lets go of the row it
     was holding at the head): the two rows then change places, which is where a row keyed by its place took the
     other's box. With the first one gone from the list the second row was a new one anyway, and this stayed green on
     a build broken that way (the browser break test of 14 Oct 26). */
  await page.locator('#inRangeBtn').click(); await page.locator('#inRangeAll').click()
  const add = async (nth: number) => { await page.locator('#inNew').click(); await page.locator('#inpEdCal [data-cal]').nth(nth).click(); await page.locator('#inpEditSave').click(); return newest(page) }
  const a = await add(14)
  await expect(page.locator(`#inBody tr[data-iid="${a}"]`)).toHaveClass(/\binnew\b/)
  await page.waitForTimeout(4000)
  const b = await add(15)
  expect(b).not.toBe(a)
  await page.waitForTimeout(2500)                // 6.5 s after the first, 2.5 s after the second
  const rowB = await markOf(page, `#inBody tr[data-iid="${b}"]`), rowA = await markOf(page, `#inBody tr[data-iid="${a}"]`)
  expect([rowB!.innew, rowB!.painted], 'the second row: its own six seconds, not what was left of the first row\'s').toEqual([true, true])
  expect(rowA, 'the first input is still listed').not.toBeNull()
  expect(rowA!.innew, 'the first row\'s six seconds have ended').toBe(false)
})

test('D854 — the month with no day open: a changed input’s bar wears the mark, no note, and no day opens over the month', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs')
  await month(page, 2026, 10)
  const who = await crew(page, 2)
  await page.evaluate(who => (window as any).fileInput({ iid: 'fm-bar', person: who, type: 'Meeting', date: 'Oct 21', yr: 2026, allday: false, s: 600, e: 660 }), who)
  await page.locator('[data-testid="ib-bar-fm-bar"]').first().click()
  await page.locator('#inpEditRmk').fill('moved to room 2')
  await page.locator('#inpEditSave').click()
  const bar = '.ib-bar.innew[data-iid="fm-bar"]'
  await expect(page.locator(bar).first()).toBeVisible()
  const m = await markOf(page, bar)
  expect([m!.fresh, m!.painted, m!.inView]).toEqual(['fm-bar', true, true])
  expect(await notesFor(page)).toEqual([])
  await expect(page.locator('.ib-day.is-open')).toHaveCount(0)
})

test('D850, D851 — the desktop List with less motion asked for: every cell of the new row wears the box, steady, and it goes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await login(page); await go(page, 'inputs')
  await page.locator('#inListBtn').click()
  await page.locator('#inNew').click()
  await page.locator('#inpEdCal [data-cal]').nth(14).click()
  await page.locator('#inpEditSave').click()
  const id = await newest(page), row = `#inBody tr[data-iid="${id}"]`
  await expect(page.locator(row)).toHaveClass(/\binnew\b/)
  await page.waitForTimeout(700)                 // the page comes to the row
  const m = await markOf(page, row)
  expect(m, 'steady — no animation — and painted on every cell, the first with its coloured edge included').toEqual({ innew: true, fresh: id, painted: true, anim: 'none', inView: true })
  expect(await notesFor(page)).toEqual([])
  /* gone when its six seconds are up — the class and the box */
  await expect(page.locator(row)).not.toHaveClass(/\binnew\b/, { timeout: 8000 })
  expect((await markOf(page, row))!.painted).toBe(false)
})

test('D851 — a phone: the List’s new card wears the mark and no note is drawn', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    await page.locator('#inListBtn').tap()
    await page.locator('#inNew').tap()
    await page.locator('#inpEdCal [data-cal]').nth(14).tap()
    await page.locator('#inpEditSave').tap()
    const id = await newest(page), card = `#inList [data-iid="${id}"]`
    await expect(page.locator(card)).toHaveClass(/\binnew\b/)
    await page.waitForTimeout(700)
    const m = await markOf(page, card)
    expect([m!.fresh, m!.painted, m!.inView]).toEqual([id, true, true])
    expect(await notesFor(page)).toEqual([])
  } finally { await context.close() }
})

test('the note is still said where no mark is drawn: an input added from the Scheduler Board', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'editsched')
  await page.locator('#eWeek [data-sbday="1"]').first().click()
  await page.locator('#schedBoard [data-inpadd="1.g"]').first().click()
  await page.selectOption('#inpEditPop #inpEditType', 'Meeting')
  await page.locator('#inpEditSave').click()
  await expect(page.locator('#toastEl')).toHaveText('Input added to the Ground Programme')
  /* …and the board's ✓ Done says nothing (D854 — it read "Schedule updated") */
  await expect.poll(() => noteNow(page), { timeout: 12000 }).toBe('')
  await page.locator('#sbDone').click()
  await expect(page.locator('#schedBoard')).toBeHidden()
  expect(await notesFor(page)).toEqual([])
})

for (const size of ['a desktop', 'a phone'] as const) {
  test(`D849 (2) — a cancelled input’s window, ${size}: the CX tag and its reason follow the title; the ✕ keeps the corner`, async ({ browser, baseURL, page }) => {
    let p = page, ctx: any = null
    if (size === 'a phone') { const ph = await phone(browser, baseURL); p = ph.page; ctx = ph.context } else { await p.setViewportSize({ width: 1440, height: 900 }); await login(p); await go(p, 'inputs') }
    try {
      await month(p, 2026, 10)
      const who = await crew(p, 3)
      for (const [iid, cxr] of [['fm-cx1', 'Range closed'], ['fm-cx2', 'Range closed for the whole week by the range safety officer after the storm']]) {
        await p.evaluate(([iid, who, cxr]) => (window as any).fileInput({ iid, person: who, type: 'Training', title: 'Range brief', date: 'Oct 20', yr: 2026, allday: false, s: 540, e: 600, cx: true, cxr }), [iid, who, cxr])
        await p.locator('#inpCal [data-icday="2026-10-20"]').click()
        await p.locator(`[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`).click()
        await expect(p.locator('[data-testid="win-inputedit"] [data-testid="inped-cx"]')).toBeVisible()
        const h = await p.evaluate(() => {
          const bar = document.querySelector('[data-testid="win-inputedit"] .win-bar')!
          const ttl = bar.querySelector('.win-ttl') as HTMLElement, x = bar.querySelector('.win-x')!, tag = bar.querySelector('.icx')!, why = bar.querySelector('.icx-why') as HTMLElement, mark = bar.querySelector('[data-testid="inped-cx"]')!
          const g = document.createRange(); g.selectNodeContents(ttl)
          const words = g.getBoundingClientRect(), xr = x.getBoundingClientRect(), br = bar.getBoundingClientRect()
          return { gap: tag.getBoundingClientRect().left - words.right, markEnd: mark.getBoundingClientRect().right, xLeft: xr.left, xToEdge: br.right - xr.right,
            titleCut: ttl.scrollWidth > ttl.clientWidth + 1, whyCut: why.scrollWidth > why.clientWidth + 1, inTools: !!mark.closest('.win-tools') }
        })
        expect(h.inTools, 'not one of the window’s tools').toBe(false)
        expect(h.gap, 'the tag stands straight after the title’s words').toBeGreaterThanOrEqual(0)
        expect(h.gap).toBeLessThanOrEqual(18)
        expect(h.markEnd, 'and never runs under the ✕').toBeLessThanOrEqual(h.xLeft + 0.5)
        expect(h.xToEdge, 'the ✕ keeps the corner').toBeLessThanOrEqual(20)
        expect(h.titleCut, 'the title is never what is cut').toBe(false)
        expect(h.whyCut, cxr.length > 20 ? 'a long reason is what gives way' : 'a short reason is whole').toBe(cxr.length > 20)
        await p.locator('[data-testid="win-inputedit-x"]').click()
        await p.locator('[data-testid="win-inputsday-x"]').click()
      }
    } finally { if (ctx) await ctx.close() }
  })
}

test('D849 (2), D771 — a phone, a title that fills the bar (a long callsign, three people, four days): the CX tag is still whole', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    await month(page, 2026, 10)
    const who = [await crew(page, 3), await crew(page, 4), await crew(page, 6)]
    /* a callsign long enough that the title alone is wider than the bar — the layout's worst case, not a real name */
    await page.evaluate(ids => { ids.forEach((id: string, i: number) => { (window as any).PEOPLE[id].cs = 'Thunderstruck-Longbow-Wanderer-' + i }) }, who)
    await page.evaluate(who => (window as any).fileInput({ iid: 'fm-cx3', people: who.map((p: string) => ({ p })), type: 'Training', title: 'Range brief', date: 'Oct 20', endDate: 'Oct 23', yr: 2026, allday: false, s: 540, e: 600, cx: true, cxr: 'Range closed' }), who)
    await page.locator('#inpCal [data-icday="2026-10-20"]').click()
    await page.locator('[data-testid="idy-row-fm-cx3"] [data-testid="idy-open"]').click()
    await expect(page.locator('[data-testid="win-inputedit"] [data-testid="inped-cx"]')).toBeVisible()
    const h = await page.evaluate(() => {
      const bar = document.querySelector('[data-testid="win-inputedit"] .win-bar')!
      const ttl = bar.querySelector('.win-ttl') as HTMLElement, tag = bar.querySelector('.icx')!, mark = bar.querySelector('.win-mark')!, x = bar.querySelector('.win-x')!
      const t = tag.getBoundingClientRect(), m = mark.getBoundingClientRect(), hit = document.elementFromPoint(t.left + t.width / 2, t.top + t.height / 2)
      return { title: ttl.textContent, titleCut: ttl.scrollWidth > ttl.clientWidth + 1, tagW: t.width, tagInMark: t.left >= m.left - 0.5 && t.right <= m.right + 0.5, tagSeen: hit === tag, clearOfX: m.right <= x.getBoundingClientRect().left + 0.5 }
    })
    expect(h.titleCut, `the title is what gives way here ("${h.title}")`).toBe(true)
    expect(h.tagW, 'the tag has its width').toBeGreaterThan(18)
    expect([h.tagInMark, h.tagSeen, h.clearOfX], 'whole, on screen, clear of the ✕').toEqual([true, true, true])
  } finally { await context.close() }
})

test('D849 (3) — the medical-clash and the upchit questions: their answers sit flat, no patch and no line under them', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs')
  await month(page, 2026, 10)
  const who = await crew(page, 5)
  const flat = (scope: string, rowSel: string) => page.evaluate(([scope, rowSel]) => {
    const root = document.querySelector(scope)!, row = root.querySelector(rowSel)!, a = row.querySelector('.upconf-ans')!
    const st = getComputedStyle(a), words = row.querySelector('span:not(.upconf-ans)')!.getBoundingClientRect(), btns = [...a.querySelectorAll('button')].map(b => b.getBoundingClientRect())
    return { seg: !!root.querySelector('.seg'), bg: st.backgroundColor, line: st.borderBottomWidth, pad: st.padding, under: a.getBoundingClientRect().top >= words.bottom,
      endsAtRight: Math.abs(btns[btns.length - 1].right - (row.getBoundingClientRect().right - parseFloat(getComputedStyle(row).paddingRight))) <= 2, n: btns.length, oneLine: btns.every(b => Math.abs(b.top - btns[0].top) < 1) }
  }, [scope, rowSel] as const)
  const newMed = async (type: string, from: string, to?: string) => {
    await page.locator(`#inpCal [data-icday="${from}"]`).click()
    await page.locator('#icPopAdd').click()
    await page.selectOption('#inpEditPop #inpEditType', type)
    await page.selectOption('#inpEditPop #inpEditPerson', who)
    if (to) await page.locator(`#inpEdCal [data-cal="${to}"]`).click()
    await page.locator('#inpEditSave').click()
    const doc = page.locator('[data-testid="docconf-nodoc"]')
    await expect(doc.or(page.locator('[data-testid="medclash"], [data-testid="upconf"]')).first()).toBeVisible()
    if (await doc.count()) await doc.click()
  }
  /* the medical clash: ATT C stands on 13–15 Oct */
  await page.evaluate(who => (window as any).fileInput({ iid: 'fm-c', person: who, type: 'ATT C', date: 'Oct 13', endDate: 'Oct 15', yr: 2026, allday: true }), who)
  /* …FIRST WITH ONE ANSWER: ATT B on the 14th alone lies wholly inside it, so there is no "Keep" to offer. One short
     button would fit beside the sentence — it still takes a line of its own, at the right, as drawn (with two long
     answers the pair wraps under the sentence whatever the rule says: the browser break test of 14 Oct 26) */
  await newMed('ATT B', '2026-10-14')
  await expect(page.locator('[data-testid="medclash"]')).toBeVisible()
  expect(await flat('[data-testid="medclash"]', '[data-testid="medclash-0"]'), 'one answer: still under the sentence, at the right').toEqual(
    { seg: false, bg: 'rgba(0, 0, 0, 0)', line: '0px', pad: '0px', under: true, endsAtRight: true, n: 1, oneLine: true })
  await page.locator('[data-testid="medclash"] .airpop-foot .abtn.ghost').click()
  await page.locator('[data-testid="win-inputedit-x"]').click()
  { const lose = page.locator('[data-testid="inped-swap-go"], [data-testid="inped-leave-go"]'); if (await lose.count()) await lose.first().click() }
  await page.locator('[data-testid="win-inputsday-x"]').click()
  /* …then with two: ATT B is filed over 14–16 */
  await newMed('ATT B', '2026-10-14', '2026-10-16')
  await expect(page.locator('[data-testid="medclash"]')).toBeVisible()
  expect(await flat('[data-testid="medclash"]', '[data-testid="medclash-0"]'), 'flat, on a line of their own under the sentence, ending at the right').toEqual(
    { seg: false, bg: 'rgba(0, 0, 0, 0)', line: '0px', pad: '0px', under: true, endsAtRight: true, n: 2, oneLine: true })
  await page.locator('[data-testid="medclash"] .airpop-foot .abtn.ghost').click()
  await page.locator('[data-testid="win-inputedit-x"]').click()
  const lose = page.locator('[data-testid="inped-swap-go"], [data-testid="inped-leave-go"]'); if (await lose.count()) await lose.first().click()
  await page.locator('[data-testid="win-inputsday-x"]').click()
  /* the upchit: a later entry still on file after it */
  await page.evaluate(who => (window as any).fileInput({ iid: 'fm-b', person: who, type: 'ATT B', date: 'Oct 17', endDate: 'Oct 18', yr: 2026, allday: true }), who)
  await newMed('Upchit', '2026-10-14')
  await expect(page.locator('[data-testid="upconf"]')).toBeVisible()
  expect(await flat('[data-testid="upconf"]', '[data-testid="upconf-left-0"]'), 'flat, at the right of the entry’s own box').toEqual(
    { seg: false, bg: 'rgba(0, 0, 0, 0)', line: '0px', pad: '0px', under: false, endsAtRight: true, n: 2, oneLine: true })
})
