import { expect, test, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE SMALL OIL JOB, IN THE BUILT APP ([OIL-UNCANCEL-UNASKED] — owner D816; [OIL-LOAD-VERSION-UNASKED] — owner D818).
   What only a real browser can say: that the "not answered" bar holds its longest words and both its buttons on ONE
   line at a phone's width and at 320 wide; that the day's one list, opened by a load made from the full-screen
   Scheduler Board, stands ABOVE the board with its buttons reachable; and that the whole road — the board's cancel
   sheet, the question, the bar, the answer — is wired through the app's own controls. The rules themselves are unit
   tests: ui/oilwait.test.tsx (its blocks ON10 and ON11), leavewar/holnotice.test.tsx (the list's heading).

     D816  the cancel taken off an input with no OIL answer on a non-working day: the question first, in the un-cancel's
           own words; left unanswered it stays cancelled and the bar says so; answered, it is brought back with its
           answer and says "Restored"
     D818  a published version loaded back: the note ends with how many inputs it put back need an OIL answer, and that
           day's one list opens — headed as the public holiday it is — above the board

   The demo week is 13–19 Jul 2026 (day 2 = Wed 15, 4 = Fri 17, 5 = Sat 18). */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
async function month(p: Page, sel: { mon: string; prev: string; next: string }, y: number, m: number) {
  for (let i = 0; i < 240; i++) {
    const [name, year] = (await p.locator(sel.mon).innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name.slice(0, 3))))
    if (!d) return
    await p.locator(d > 0 ? sel.next : sel.prev).click()
  }
  throw new Error('the calendar never reached the month asked for')
}
const INCAL = { mon: '#inpCal .ic-mon', prev: '#icPrev', next: '#icNext' }
const HOLCAL = { mon: '[data-testid="holcal-month"]', prev: '[data-testid="holcal-prev-month"]', next: '[data-testid="holcal-next-month"]' }
const tid = (p: Page, t: string) => p.locator(`[data-testid="${t}"]`)
const noteNow = (p: Page) => p.evaluate(() => { const t = document.getElementById('toastEl'); return t && +getComputedStyle(t).opacity > 0.5 ? (t.textContent || '') : '' })
const rec = (p: Page, id: string) => p.evaluate(id => { const r = (window as any).INPUTS.find((x: any) => String(x.iid) === id); return r ? { cx: !!r.cx, oil: r.oil || null, date: r.date, acc: r.acc } : null }, id)
/* a day opened on the Inputs calendar — by the keyboard: on a phone the day's middle is under its inputs' bars */
async function openDay(p: Page, iso: string) {
  await p.locator(`#inpCal [data-icday="${iso}"]`).focus()
  await p.keyboard.press('Enter')
  await tid(p, 'win-inputsday').waitFor()
}
/* a one-man Training input filed on a date of July 2026 through the Inputs calendar; returns its id */
async function file(p: Page, iso: string, title: string) {
  await go(p, 'inputs')
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await p.locator('#inCalBtn').click()
  await month(p, INCAL, 2026, 7)
  await openDay(p, iso)
  await p.locator('#icPopAdd').click()
  await p.locator('#inpEditPop #inpEditType').selectOption('Training')
  await p.locator('#inpEditPop #inpEditPerson').selectOption('bane')
  const ad = p.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.click()
  await p.locator('#inpEditPop #inpEditStart').fill('09:00'); await p.locator('#inpEditPop #inpEditEnd').fill('10:00')
  await p.locator('#inpEditPop #inpEditOwnTitle').fill(title)
  const before = await p.evaluate(() => (window as any).INPUTS.length)
  await p.locator('#inpEditSave').click()
  await p.waitForFunction(n => (window as any).INPUTS.length === n + 1, before)
  const id = await p.evaluate(() => String((window as any).INPUTS[0].iid))
  await tid(p, 'win-inputsday-x').click()
  return id
}
async function board(p: Page, di: number) {
  await go(p, 'editsched')
  await p.locator(`#eWeek [data-sbday="${di}"]`).first().evaluate((e: HTMLElement) => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await p.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' })
}
/* one of the board row's own buttons for an input (the row's place is read from the day, never assumed) */
async function rowBtn(p: Page, di: number, id: string, attr: 'grcx' | 'grdel') {
  await p.waitForFunction(([di, id]) => (window as any).DAYS[di as number].ground.some((g: any) => String(g.src) === id), [di, id] as const)
  const ri = await p.evaluate(([di, id]) => (window as any).DAYS[di as number].ground.findIndex((g: any) => String(g.src) === id), [di, id] as const)
  const b = p.locator(`#schedBoard [data-${attr}="${di}.${ri}"]`).first()
  await b.scrollIntoViewIfNeeded(); await b.click()
}
/* the bar, measured: its words on one line, nothing cut, both buttons on that line and inside the screen */
const bar = (p: Page) => p.evaluate(() => {
  const b = document.querySelector('[data-testid="oilbar"]'); if (!b) return null
  const txt = b.querySelector('[data-testid="oilbar-text"]') as HTMLElement, tr = txt.getBoundingClientRect()
  const lh = parseFloat(getComputedStyle(txt).lineHeight) || 16
  const btns = [...b.querySelectorAll('button')].map(x => x.getBoundingClientRect())
  return { text: (txt.textContent || '').trim(), lines: Math.round(tr.height / lh), cut: txt.scrollWidth > txt.clientWidth + 1, buttons: btns.length,
    inside: btns.every(q => q.right <= innerWidth + 0.5 && q.left >= 0), oneRow: btns.every(q => Math.abs(q.top - btns[0].top) < 3) }
})

test('D816 — the cancel taken off on a Saturday: the question first; left, the bar on one line at a phone’s width and at 320; answered, "Restored" with its answer', async ({ browser, baseURL }) => {
  test.setTimeout(120_000)   // one long road through six screens, by the app's own controls
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  page.setDefaultTimeout(15_000)   // a step that cannot act says which one, long before the test's own limit
  try {
    await login(page)
    /* filed on a working day, cancelled on the board, its date moved to Saturday while cancelled — no question (D814) */
    const id = await file(page, '2026-07-15', 'Range brief')
    await board(page, 2)
    await rowBtn(page, 2, id, 'grcx')
    await page.locator('#cxReason').fill('WX')
    await page.locator('#cxSave').click()
    await page.waitForFunction(id => (window as any).INPUTS.find((x: any) => String(x.iid) === id).cx === true, id)
    await page.locator('#sbDone').click()
    await go(page, 'inputs')
    await openDay(page, '2026-07-15')
    await page.locator(`[data-testid="idy-row-${id}"] [data-testid="idy-open"]`).click()
    await page.locator('#inpEdCal [data-cal="2026-07-18"]').click()
    await page.locator('#inpEditSave').click()
    await page.waitForFunction(id => (window as any).INPUTS.find((x: any) => String(x.iid) === id).date === 'Jul 18', id)
    await expect(tid(page, 'oilconf'), 'a cancelled input is asked nothing at its move').toHaveCount(0)
    expect(await rec(page, id)).toEqual({ cx: true, oil: null, date: 'Jul 18', acc: 'g' })
    if (await tid(page, 'win-inputsday-x').count()) await tid(page, 'win-inputsday-x').click()

    /* the cancel taken off on Saturday's board: the question, and nothing changed behind it */
    await board(page, 5)
    await rowBtn(page, 5, id, 'grcx')
    await page.locator('#cxUn').click()
    await expect(tid(page, 'oilconf-lead')).toHaveText('Un-cancelling Ranger\'s Range brief')
    await expect(tid(page, 'oilconf-cancel')).toHaveText('Don’t un-cancel')
    await expect(tid(page, 'oilconf-save')).toHaveText('Un-cancel')
    await expect(tid(page, 'oilconf-save'), 'it waits for a Yes or a No').toBeDisabled()
    expect((await rec(page, id))!.cx, 'still cancelled behind the question').toBe(true)

    /* left: the bar, on one line — here and at 320 wide */
    await tid(page, 'oilconf-cancel').click()
    await expect(tid(page, 'oilbar-text')).toHaveText('Not un-cancelled — OIL not answered')
    const one = { text: 'Not un-cancelled — OIL not answered', lines: 1, cut: false, buttons: 2, inside: true, oneRow: true }
    expect(await bar(page), 'at 390 wide').toEqual(one)
    await page.setViewportSize({ width: 320, height: 700 })
    await expect.poll(() => bar(page), { message: 'at 320 wide' }).toEqual(one)
    await page.setViewportSize({ width: 390, height: 844 })
    expect(await rec(page, id), 'nothing was written').toEqual({ cx: true, oil: null, date: 'Jul 18', acc: 'g' })

    /* answered from the bar: brought back with its answer, in one step */
    await tid(page, 'oilbar-answer').click()
    await tid(page, 'oil-yes').click()
    await tid(page, 'oilconf-save').click()
    await expect.poll(() => noteNow(page)).toBe('Restored')
    expect(await rec(page, id)).toEqual({ cx: false, oil: { '2026-07-18': 0.5 }, date: 'Jul 18', acc: 'g' })
    await expect(tid(page, 'oilbar')).toHaveCount(0)
  } finally { await context.close() }
})

test('D818 — a published version loaded back from the Scheduler Board: the note counts the input it put back that needs an OIL answer, and the day’s one list stands above the board', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page)
  const id = await file(page, '2026-07-17', 'Range brief')
  /* Friday published with the input on its programme */
  await board(page, 4)
  const sels = page.locator('#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible')
  for (let i = 0, n = await sels.count(); i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => (o as HTMLOptionElement).value).filter(v => v && v !== '—'))
    await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
  }
  const beak = page.locator('#schedBoard [data-beak="4"]:visible')
  await expect(beak.first(), 'all four are signed: the day can be published').toBeEnabled()
  await beak.first().click()
  await expect(beak, 'published: the first-publication button has gone').toHaveCount(0)
  await page.locator('#sbDone').click()
  /* Friday made a public holiday: the one list opens — left for later */
  await go(page, 'inputs')
  await page.locator('#inGear').click()
  await tid(page, 'iset-days').click()
  if (await tid(page, 'days-tab-holidays').count()) await tid(page, 'days-tab-holidays').click()
  await tid(page, 'hol-add').click()
  await tid(page, 'hol-kind-ph').click()
  await tid(page, 'hol-name').fill('Walk holiday')
  await month(page, HOLCAL, 2026, 7)
  await tid(page, 'holcal-day-2026-07-17').click()
  await tid(page, 'hol-save').click()
  await expect(tid(page, `odl-yes-${id}`), 'the holiday\'s own list carries the input').toBeVisible()
  await tid(page, 'odl-later').click()
  /* the Calendar window stands in front of the settings window: closed first */
  for (const x of ['win-days-x', 'win-inputsset-x']) if (await tid(page, x).count()) await tid(page, x).click()
  /* taken off the programme, then the Original loaded back — from the board */
  await board(page, 4)
  await rowBtn(page, 4, id, 'grdel')
  await page.waitForFunction(id => (window as any).INPUTS.find((x: any) => String(x.iid) === id).acc !== 'g', id)
  await page.locator('#schedBoard [data-planmenu="4"]').first().click()
  const pv = page.locator('[data-planpv]').first()
  const ver = await pv.getAttribute('data-planpv')
  await pv.click()
  const load = page.locator(`#schedBoard button[data-restore="4"][data-rver="${ver}"]`)
  await load.first().click()                                   // arms the confirm: there is an unpublished edit to discard
  await load.first().click()
  await expect.poll(() => noteNow(page)).toMatch(/^Friday: Original loaded onto the working copy .* · 1 input needs an OIL answer$/)
  expect((await rec(page, id))!.acc, 'the load put it back on the programme').toBe('g')
  /* the day's one list: open, headed as the holiday, with this input — and above the full-screen board */
  const win = tid(page, 'win-oilday')
  await expect(win).toBeVisible()
  await expect(win.locator('.win-bar')).toContainText('Public holiday · Walk holiday')
  const yes = tid(page, `odl-yes-${id}`)
  await expect(yes).toBeVisible()
  expect(await yes.evaluate((y: HTMLElement) => { const r = y.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!top && (top === y || y.contains(top)) }), 'its Yes is the top thing at its own place — not behind the board').toBe(true)
  /* answered there: written, and the list closes */
  await yes.click()
  await tid(page, 'odl-save').click()
  await expect.poll(async () => (await rec(page, id))!.oil).toEqual({ '2026-07-17': 0.5 })
})
