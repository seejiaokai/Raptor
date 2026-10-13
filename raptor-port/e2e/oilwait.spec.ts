import { expect, test, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE OIL QUESTION BEFORE A SWAP, THE BAR THAT STAYS, AND THE ONE LIST — IN THE BUILT APP (`[OIL-ASK-NOTIFY]`; owner D783,
   12 Oct 26 — the pictures of record docs/mock/2026-10-12-oil-notify/; the plan
   docs/superpowers/plans/2026-10-12-oil-ask-notify-plan.md §3.1–§3.3).
   What only a real browser can say — jsdom has no layout and no pointer: that a REAL DRAG of one puck onto an input's
   only puck puts the question and moves nothing; that the bar which follows "Don't swap" is inside the screen and ON
   TOP of the full-screen Scheduler Board (a bar stacked under the board would be there in the page and seen by nobody);
   that the one list opens by itself when a holiday is saved, inside the screen, at a desktop's size and a phone's; and
   that the bell's line opens it. The rules are unit tests: ui/oilwait.test.tsx, leavewar/holnotice.test.tsx.
   Behaviour register: ON1, ON6, ON12, ON16. */
const SAT = '2026-07-18', SAT_DI = 5, FRI = '2026-07-17'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const noErrors = (p: Page) => { const errs: string[] = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); return errs }
const SIZES = [
  { name: 'desktop', use: { viewport: { width: 1440, height: 900 } }, tap: false, short: false },
  { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, tap: true, short: false },
  /* A PHONE ON ITS SIDE (the check's walk, B4 — 13 Oct 26): 390 tall. The question's card is taller than that, and the
     list scrolls inside its window — so the buttons that END each of them must stay in sight: the card cut its two
     buttons at its bottom edge, and the list's Later / Save were below the window until it was scrolled to its end. */
  { name: 'phone on its side', use: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }, tap: true, short: true },
] as const
/* is every one of these wholly inside `boxSel`'s box and inside the screen — nothing of it cut by the box's edge? */
const whollyIn = (p: Page, boxSel: string, sels: string[]) => p.evaluate(([boxSel, sels]) => {
  const box = document.querySelector(boxSel as string)!.getBoundingClientRect()
  return (sels as string[]).every(q => { const r = document.querySelector(q)!.getBoundingClientRect(); return r.height > 0 && r.top >= box.top - 0.5 && r.bottom <= box.bottom + 0.5 && r.left >= box.left - 0.5 && r.right <= box.right + 0.5 && r.bottom <= window.innerHeight + 0.5 })
}, [boxSel, sels] as const)

/* an input filed through the Inputs calendar's own day window and "+ Input"; the OIL question answered Yes where asked */
async function fileIt(p: Page, tap: boolean, iso: string, spec: { type: string; people: string[]; from?: string; to?: string; title: string }) {
  const press = (sel: string) => (tap ? p.locator(sel).tap() : p.locator(sel).click())
  await go(p, 'inputs')
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press('#inCalBtn')
  await expect(p.locator('#inpCal')).toBeVisible()
  for (let i = 0; i < 36 && !(await p.locator(`[data-icday="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y! * 12 + MONTHS.findIndex(x => x.startsWith(m!)), want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
    await press(at < want ? '#icNext' : '#icPrev')
  }
  await p.locator(`[data-icday="${iso}"]`).focus()
  await p.keyboard.press('Enter')
  await expect(p.locator('[data-testid="win-inputsday"]')).toBeVisible()
  await press('#icPopAdd')
  await expect(p.locator('#inpEditPop #inpEditType')).toBeVisible()
  await p.selectOption('#inpEditPop #inpEditType', spec.type)
  if (spec.people.length > 1) {
    await press('#inpEditPop [data-testid="pp-several"]')
    for (const id of spec.people) if ((await p.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await press(`#inpEditPop [data-pp="${id}"]`)
    const lit: string[] = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')!))
    for (const id of lit) if (!spec.people.includes(id)) await press(`#inpEditPop [data-pp="${id}"]`)
  } else await p.selectOption('#inpEditPop #inpEditPerson', spec.people[0]!)
  const ad = p.locator('#inpEditPop #inpEditAllday')
  if (spec.from) {
    if (await ad.count() && await ad.isChecked()) await ad.click()
    await p.fill('#inpEditPop #inpEditStart', spec.from); await p.fill('#inpEditPop #inpEditEnd', spec.to!)
  } else if (await ad.count() && !(await ad.isChecked())) await ad.click()
  await p.fill('#inpEditPop #inpEditOwnTitle', spec.title)
  await press('#inpEditSave')
  if (await p.locator('[data-testid="oilconf"]').count()) { await press('[data-testid="oil-yes"]'); await press('[data-testid="oilconf-save"]') }
  await expect(p.locator('#inpEditPop')).toBeHidden()
  await p.locator('[data-testid="win-inputsday-x"]').click()
  return p.evaluate(t => String((window as any).INPUTS.find((r: any) => r.title === t).iid), spec.title)
}
const ground = (p: Page) => p.evaluate(di => ((window as any).DAYS[di].ground || []).map((r: any) => `${r.prog}:${r.who}${(r.more || []).map((m: any) => '+' + m).join('')}`), SAT_DI)
/* is this element the one on top at its own centre, and inside the screen? (the roll-call's rule for a floating surface) */
const onTopAndInside = (p: Page, sel: string) => p.evaluate(sel => {
  const b = document.querySelector(sel)
  if (!b) return { there: false, top: false, inside: false }
  const r = b.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return { there: true, top: hit === b || b.contains(hit), inside: r.left >= -0.5 && r.top >= -0.5 && r.right <= window.innerWidth + 0.5 && r.bottom <= window.innerHeight + 0.5 }
}, sel)

/* THE BAR IS A BAND UNDER THE BAR IN FRONT, ONE LINE ALWAYS ([LOOK-13OCT-SMALL-FIXES] — owner D831, D840, D841;
   ui/OilWaitSheet.tsx, 17-save-status.css). What only a real screen can say: it is the last line of the bar it sits
   under, edge to edge, the failed-save warning's own height; its words and both buttons share ONE line and none of
   them is cut; and the line under it is amber. `wider` asks again in letters about a seventh wider — a stand-in for
   his iPhone's — where the bar must STILL be one line: its letters step down, nothing wraps, nothing is cut. */
const bandFacts = (p: Page, wider = false) => p.evaluate(async wider => {
  const b = document.querySelector('[data-testid="oilbar"]') as HTMLElement
  if (wider) { b.style.letterSpacing = '.075em'; window.dispatchEvent(new Event('resize')); await new Promise(r => requestAnimationFrame(() => r(null))) }
  const r = b.getBoundingClientRect(), under = (b.closest('.sb-top') || b.closest('.topbar')) as HTMLElement
  const kids = [...b.children].map(k => { const q = k.getBoundingClientRect(); return { mid: Math.round(q.top + q.height / 2), left: q.left, right: q.right, h: Math.round(q.height), cut: (k as HTMLElement).scrollWidth > (k as HTMLElement).clientWidth + 0.5 } })
  const msg = b.querySelector('[data-testid="oilbar-text"]') as HTMLElement, lh = parseFloat(getComputedStyle(msg).lineHeight) || msg.getBoundingClientRect().height
  const out = {
    cls: b.className.replace(/ is-tight/, ''), height: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth,
    lastLineOfItsBar: !!under && Math.abs(under.getBoundingClientRect().bottom - r.bottom) <= 1.5,
    oneLine: new Set(kids.map(k => k.mid)).size === 1 && msg.getBoundingClientRect().height <= lh * 1.4,
    nothingCut: kids.every(k => !k.cut) && b.scrollWidth <= b.clientWidth + 0.5 && kids.every(k => k.left >= r.left - 0.5 && k.right <= r.right + 0.5),
    buttons: kids.slice(1).map(k => k.h), fit: b.style.getPropertyValue('--oil-fit') || '1',
    edgeUnder: under ? getComputedStyle(under).borderBottomColor : '', only: document.querySelectorAll('[data-testid="oilbar"]').length,
  }
  if (wider) { b.style.letterSpacing = ''; window.dispatchEvent(new Event('resize')) }
  return out
}, wider)
const AMBER_EDGE = 'rgba(229, 194, 74, 0.5)'

for (const size of SIZES) {
  test.describe(`${size.name} — the swap that waits (ON1, ON6)`, () => {
    test.use(size.use as any)
    test('a real drag onto the only man\'s puck puts the question and moves nothing; "Don\'t swap" leaves the bar, on top of the board and inside the screen; "Answer OIL" then "Swap" makes it', async ({ page }) => {
      const errs = noErrors(page)
      await login(page)
      const press = (sel: string) => (size.tap ? page.locator(sel).tap() : page.locator(sel).click())
      const iid = await fileIt(page, size.tap, SAT, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
      await go(page, 'editsched')
      await page.locator(`#eWeek [data-sbday="${SAT_DI}"]`).first().evaluate((e: HTMLElement) => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
      await expect(page.locator('#sbBoard .sb-sec').first()).toBeAttached()
      /* a plain programme row beside it, with Tally on it (set up through the developer's bridge — not what is tested) */
      await page.evaluate(di => { const w = window as any; w.DAYS[di].ground.push({ prog: 'Hangar open day', str: '13:00', end: '15:00', who: '', rmks: '' }); w.afterSchedMutate(); w.fillSlot(`g:${di}.${w.DAYS[di].ground.length - 1}.+`, 'nick'); w.afterSchedMutate() }, SAT_DI)
      const before = await ground(page)
      const from = `#sbBoard [data-slot="g:${SAT_DI}.1"] .puck`, to = `#sbBoard [data-slot="g:${SAT_DI}.0"] .puck`
      /* (the phone on its side: the DRAG is made with the screen held upright-size — on a 390-tall screen the board's own bars
         take half of it and a drag held near the foot scrolls the board under the pointer; the real touch drag at that size
         was walked by hand, docs/handpass/2026-10-13-oil-ask-notify.md §11.4 — and the screen is turned once the question
         is up: what is measured here is how the question, and then the bar, FIT the short screen) */
      if (size.short) await page.setViewportSize({ width: 1024, height: 768 })
      await page.locator(to).evaluate((e: HTMLElement) => e.scrollIntoView({ block: 'center' }))
      const fb = (await page.locator(from).boundingBox())!, tb = (await page.locator(to).boundingBox())!
      await page.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2); await page.mouse.down()
      await page.mouse.move(fb.x + fb.width / 2 + 6, fb.y + fb.height / 2 + 6, { steps: 3 })
      await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 14 })
      await page.mouse.move(tb.x + tb.width / 2 + 1, tb.y + tb.height / 2 + 1)
      await page.mouse.up()
      /* the question, and nothing moved */
      await expect(page.locator('[data-testid="oilconf-lead"]')).toHaveText('Swapping Tally and Ranger')
      if (size.short) await page.setViewportSize({ width: 844, height: 390 })
      await expect(page.locator('[data-testid="oilconf-cancel"]')).toHaveText('Don’t swap')
      await expect(page.locator('[data-testid="oilconf-save"]')).toHaveText('Swap')
      await expect(page.locator('[data-testid="oilconf-save"]')).toBeDisabled()
      expect(await ground(page), 'nothing moved').toEqual(before)
      expect(await whollyIn(page, '[data-testid="oilconf"] .airpop-box', ['[data-testid="oilconf-cancel"]', '[data-testid="oilconf-save"]']), 'both buttons are wholly inside the question’s card, at any height').toBe(true)
      /* not answered: the bar, on top of the board, inside the screen */
      await press('[data-testid="oilconf-cancel"]')
      await expect(page.locator('[data-testid="oilbar-text"]')).toHaveText('Not swapped — OIL not answered')
      expect(await onTopAndInside(page, '[data-testid="oilbar"]')).toEqual({ there: true, top: true, inside: true })
      /* …as a band: the last line of the board's own bar, edge to edge, one line, the line under it amber (D831, D840, D841) */
      const band = await bandFacts(page)
      expect(band, 'the band under the board\'s bar').toMatchObject({ cls: 'oilband', height: 36, left: 0, right: band.vw, lastLineOfItsBar: true, oneLine: true, nothingCut: true, edgeUnder: AMBER_EDGE, only: 1 })
      expect(new Set(band.buttons).size, 'its two buttons are one height').toBe(1)
      const wide = await bandFacts(page, true)
      expect(wide, 'in wider letters it is STILL one line, nothing cut').toMatchObject({ height: 36, oneLine: true, nothingCut: true })
      expect(await ground(page)).toEqual(before)
      /* answered: the swap, with its answer */
      await press('[data-testid="oilbar-answer"]')
      await press('[data-testid="oil-yes"]')
      await press('[data-testid="oilconf-save"]')
      await expect(page.locator('[data-testid="oilconf"]')).toHaveCount(0)
      await expect(page.locator('[data-testid="oilbar"]')).toHaveCount(0)
      expect(await ground(page), 'swapped').toEqual([before[0]!.replace('bane', 'nick'), before[1]!.replace('nick', 'bane')])
      expect(await page.evaluate(i => (window as any).INPUTS.find((r: any) => r.iid === i).oil, iid)).toEqual({ [SAT]: 0.5 })
      expect(errs).toEqual([])
    })
  })

  test.describe(`${size.name} — a day made a holiday: the one list and the bell's line (ON12, ON16)`, () => {
    test.use(size.use as any)
    test('the list opens by itself when the holiday is saved, on top and inside the screen; left for later, the bell\'s line opens it again', async ({ page }) => {
      const errs = noErrors(page)
      await login(page)
      const press = (sel: string) => (size.tap ? page.locator(sel).tap() : page.locator(sel).click())
      await fileIt(page, size.tap, FRI, { type: 'Training', people: ['bane', 'nick'], from: '09:00', to: '12:00', title: 'Range brief' })
      /* on the short screen: enough inputs that the list must scroll inside its window */
      if (size.short) {
        await fileIt(page, size.tap, FRI, { type: 'Duty', people: ['harpoon'], title: 'Gate duty' })
        await fileIt(page, size.tap, FRI, { type: 'Meeting', people: ['mamba'], from: '14:00', to: '15:00', title: 'Safety board' })
        await fileIt(page, size.tap, FRI, { type: 'Meeting', people: ['nick'], from: '15:30', to: '16:30', title: 'Tally meet' })
      }
      await go(page, 'inputs')
      await press('#inGear')
      await press('[data-testid="iset-days"]')
      if (await page.locator('[data-testid="days-tab-holidays"]').count()) await press('[data-testid="days-tab-holidays"]')
      await press('[data-testid="hol-add"]')
      await press('[data-testid="hol-kind-ph"]')
      await page.fill('[data-testid="hol-name"]', 'National Day')
      /* to July 2026, from whatever month the real clock opens the picker on: back a year at most, then forward */
      for (let i = 0; i < 14 && !(await page.locator(`[data-testid="holcal-day-${FRI}"]`).count()); i++) await press('[data-testid="holcal-prev-month"]')
      for (let i = 0; i < 40 && !(await page.locator(`[data-testid="holcal-day-${FRI}"]`).count()); i++) await press('[data-testid="holcal-next-month"]')
      await press(`[data-testid="holcal-day-${FRI}"]`)
      await expect(page.locator('[data-testid="win-oilday"]')).toHaveCount(0)
      await press('[data-testid="hol-save"]')
      /* the list, by itself */
      await expect(page.locator('[data-testid="odl-lead"]')).toHaveText('National Day is now a public holiday.')
      await page.locator('[data-testid="win-inputsset-x"]').evaluate((e: HTMLElement) => e.click()).catch(() => {})
      await page.locator('[data-testid="win-oilday"]').click({ position: { x: 60, y: 14 } })        // brought to the front, as a press on a window does
      expect(await onTopAndInside(page, '[data-testid="win-oilday"]')).toEqual({ there: true, top: true, inside: true })
      await expect(page.locator('[data-testid="odl-save"]')).toBeDisabled()
      const n = await page.locator('[data-testid="win-oilday"] .icard').count()
      expect(n).toBeGreaterThanOrEqual(1)
      /* every card keeps its two answer buttons inside the card and inside the window */
      const fits = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-oilday"] .icard')].every(c => {
        const cr = c.getBoundingClientRect()
        return [...c.querySelectorAll('.icard-act button')].length === 2 && [...c.querySelectorAll('.icard-act button')].every(b => { const r = b.getBoundingClientRect(); return r.left >= cr.left - 0.5 && r.right <= cr.right + 0.5 && r.top >= cr.top - 0.5 && r.bottom <= cr.bottom + 0.5 })
      }))
      expect(fits, 'the answer buttons sit inside their cards').toBe(true)
      /* Later and Save are in sight in the window WITHOUT scrolling the list, however many cards it holds */
      expect(await whollyIn(page, '[data-testid="win-oilday"]', ['[data-testid="odl-later"]', '[data-testid="odl-save"]']), 'Later and Save are in the window, not below it').toBe(true)
      expect(await onTopAndInside(page, '[data-testid="odl-save"]')).toEqual({ there: true, top: true, inside: true })
      await press('[data-testid="odl-later"]')
      await expect(page.locator('[data-testid="win-oilday"]')).toHaveCount(0)
      /* the bell — Saber made the holiday and left it for later: his own bell carries the line */
      await page.locator('[data-testid="win-days"] .win-x').evaluate((e: HTMLElement) => e.click()).catch(() => {})
      await page.locator('.bellbtn:visible').first().click()
      const line = page.locator('[data-testid="bell-list"] .bl-line').first()
      await expect(line).toContainText('National Day')
      await expect(line).toContainText(n === 1 ? '1 input needs an OIL answer' : `${n} inputs need an OIL answer`)
      await line.click()
      await expect(page.locator('[data-testid="win-oilday"]')).toBeVisible()
      await expect(page.locator('[data-testid="odl-lead"]')).toHaveCount(0)
      await press('[data-testid="odl-yesall"]')
      await press('[data-testid="odl-save"]')
      await expect(page.locator('[data-testid="win-oilday"]')).toHaveCount(0)
      expect(await page.evaluate(d => (window as any).INPUTS.filter((r: any) => r.title === 'Range brief').map((r: any) => r.oil && r.oil[d]), FRI)).toEqual([0.5])
      expect(errs).toEqual([])
    })
  })

  /* AN INPUT PUT BACK ON THE PROGRAMME WAITS ON ITS OIL QUESTION (owner D793, 13 Oct 26 — "Yes it should wait on it").
     The whole route a scheduler takes, by the app's own controls: an input filed on a working Friday (nothing is asked);
     the Friday made a public holiday, its list left for later (so the input has no answer); the input taken off the
     programme on the Scheduler Board; then "Accept" on its card. The question comes first and nothing is put back.
     AND THE SAME ROUTE TO "→ UNAVAIL" (owner D804, 13 Oct 26 — "For others just ask the OIL question"): an input of kind
     Other offers that button beside "→ Ground"; it files the input under Unavailable, and waits on the question too. */
  const DOORS = [
    { dest: 'g', type: 'Training', name: 'Accept puts the question and puts nothing back; "Don\'t put back" leaves the bar; "Answer OIL" then "Put back" makes it, with its answer',
      lead: "Putting Ranger's Range brief back on the programme", no: 'Don’t put back', yes: 'Put back', bar: 'Not put back — OIL not answered' },
    { dest: 'u', type: 'Other', name: '(D804) "→ Unavail" puts the question and files nothing; "Don\'t file" leaves the bar; "Answer OIL" then "File" files it under Unavailable, with its answer',
      lead: "Filing Ranger's Range brief under Unavailable", no: 'Don’t file', yes: 'File', bar: 'Not filed — OIL not answered' },
  ] as const
  test.describe(`${size.name} — an input put back on the programme waits on its OIL question (D793, ON9)`, () => {
    test.use(size.use as any)
    for (const door of DOORS) test(door.name, async ({ page }) => {
      const errs = noErrors(page)
      await login(page)
      const press = (sel: string) => (size.tap ? page.locator(sel).tap() : page.locator(sel).click())
      const FRI_DI = 4
      const iid = await fileIt(page, size.tap, FRI, { type: door.type, people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
      /* Friday becomes a public holiday; its list is left for later */
      await go(page, 'inputs')
      await press('#inGear')
      await press('[data-testid="iset-days"]')
      if (await page.locator('[data-testid="days-tab-holidays"]').count()) await press('[data-testid="days-tab-holidays"]')
      await press('[data-testid="hol-add"]')
      await press('[data-testid="hol-kind-ph"]')
      await page.fill('[data-testid="hol-name"]', 'National Day')
      for (let i = 0; i < 14 && !(await page.locator(`[data-testid="holcal-day-${FRI}"]`).count()); i++) await press('[data-testid="holcal-prev-month"]')
      for (let i = 0; i < 40 && !(await page.locator(`[data-testid="holcal-day-${FRI}"]`).count()); i++) await press('[data-testid="holcal-next-month"]')
      await press(`[data-testid="holcal-day-${FRI}"]`)
      await press('[data-testid="hol-save"]')
      await expect(page.locator('[data-testid="odl-lead"]')).toHaveText('National Day is now a public holiday.')
      await page.locator('[data-testid="win-inputsset-x"]').evaluate((e: HTMLElement) => e.click()).catch(() => {})
      await page.locator('[data-testid="odl-later"]').evaluate((e: HTMLElement) => e.click())
      await expect(page.locator('[data-testid="win-oilday"]')).toHaveCount(0)
      await page.locator('[data-testid="win-days"] .win-x').evaluate((e: HTMLElement) => e.click()).catch(() => {})
      expect(await page.evaluate(i => (window as any).INPUTS.find((r: any) => r.iid === i).oil || {}, iid), 'the premise: no answer').toEqual({})
      /* the Scheduler Board, Friday: the input is on the programme; a scheduler takes it off */
      await go(page, 'editsched')
      await page.locator(`#eWeek [data-sbday="${FRI_DI}"]`).first().evaluate((e: HTMLElement) => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
      await expect(page.locator('#sbBoard .sb-sec').first()).toBeAttached()
      const rows = () => page.evaluate(di => ((window as any).DAYS[di].ground || []).filter((r: any) => r && r.src).map((r: any) => `${String(r.prog).toLowerCase()}:${r.who}`), FRI_DI)
      expect(await rows(), 'the premise: on the programme').toEqual(['range brief:bane'])
      /* (on the board a landed input is taken off by the ✕ at the end of its own row of the Ground Programme) */
      const ri = await page.evaluate(([di, i]) => ((window as any).DAYS[di as number].ground || []).findIndex((r: any) => r && r.src === i), [FRI_DI, iid] as const)
      const off = page.locator(`#sbBoard [data-grdel="${FRI_DI}.${ri}"]`).first()
      await off.evaluate((e: HTMLElement) => e.scrollIntoView({ block: 'center' }))
      if (size.tap) await off.tap(); else await off.click()
      await expect.poll(rows, { message: 'taken off the programme' }).toEqual([])
      /* "Accept" on its card: the question, and nothing put back */
      /* its card is under Personal Inputs, a panel of the board that opens folded */
      if (!(await page.locator(`#schedBoard [data-acc="${door.dest}"][data-acck="${iid}"]:visible`).count())) await page.locator(`#schedBoard [data-pitog="${FRI_DI}"]`).first().evaluate((e: HTMLElement) => { e.scrollIntoView({ block: 'center' }); e.click() })
      const acc = page.locator(`#schedBoard [data-acc="${door.dest}"][data-acck="${iid}"]:visible`).first()
      const filed = () => page.evaluate(i => String((window as any).INPUTS.find((r: any) => r.iid === i).acc || ''), iid)
      await acc.evaluate((e: HTMLElement) => e.scrollIntoView({ block: 'center' }))
      if (size.tap) await acc.tap(); else await acc.click()
      await expect(page.locator('[data-testid="oilconf-lead"]')).toHaveText(door.lead)
      await expect(page.locator('[data-testid="oilconf-cancel"]')).toHaveText(door.no)
      await expect(page.locator('[data-testid="oilconf-save"]')).toHaveText(door.yes)
      await expect(page.locator('[data-testid="oilconf-save"]')).toBeDisabled()
      expect(await rows(), 'nothing put back').toEqual([])
      expect(await filed(), 'and nothing filed: it still reads taken off').toBe('r')
      expect(await whollyIn(page, '[data-testid="oilconf"] .airpop-box', ['[data-testid="oilconf-cancel"]', '[data-testid="oilconf-save"]']), 'both buttons are wholly inside the question’s card, at any height').toBe(true)
      /* not answered: the bar, on top and inside the screen */
      await press('[data-testid="oilconf-cancel"]')
      await expect(page.locator('[data-testid="oilbar-text"]')).toHaveText(door.bar)
      expect(await onTopAndInside(page, '[data-testid="oilbar"]')).toEqual({ there: true, top: true, inside: true })
      expect(await rows()).toEqual([])
      expect(await filed()).toBe('r')
      /* answered: put back, with its answer */
      await press('[data-testid="oilbar-answer"]')
      await press('[data-testid="oil-yes"]')
      await press('[data-testid="oilconf-save"]')
      await expect(page.locator('[data-testid="oilconf"]')).toHaveCount(0)
      await expect(page.locator('[data-testid="oilbar"]')).toHaveCount(0)
      if (door.dest === 'g') expect(await rows(), 'on the programme again').toEqual(['range brief:bane'])
      else expect(await rows(), 'filed under Unavailable: not on the programme').toEqual([])
      expect(await filed()).toBe(door.dest)
      expect(await page.evaluate(i => (window as any).INPUTS.find((r: any) => r.iid === i).oil, iid)).toEqual({ [FRI]: 0.5 })
      expect(errs).toEqual([])
    })
  })
}
