/* [ARCH-STACK] step 4 — the owner's absence rules, driven as SCENARIOS in the
   real built bundle (scenario tester, 20 Sep 26).

   Each test sets a real situation up the way a person would — the Inputs page
   form, the war grid, the bid / decision sheets, the tap list, the Undo / Redo
   buttons, the Publish-day button — and checks the outcome lands on the RIGHT
   person and the RIGHT day, then that undo and redo round-trip. The localhost
   probe hooks (`fileInput`, `lwSetCell`, `lwSetPostOut`, `signOf`) only plant
   BACKGROUND data the test is not about.

   The rules come from docs/superpowers/specs/2026-09-20-arch-stack-4-clash-check.md
   (B1–B9, H1–H6, owner answers A–D), the clash catalogue's OWNER RULE / OWNER
   ANSWERS / main-code ladder, and design §25–§26.

   Three tests at the bottom are marked BUG — they fail on the build they were
   written against, and pass once the fix they name lands.

   The file name ends in `leavewar.spec.ts` so the lw-desktop / lw-phone
   projects in playwright.config.ts pick it up. */
import { expect, test, type Page } from '@playwright/test'
import { go, login, lwRole, lwView } from './app'

const isPhone = () => test.info().project.name === 'lw-phone'
const desktopOnly = () => test.skip(isPhone(), 'mouse drag-select / desktop-only path')
/* The rule itself is not form-factor specific, and the phone's rolling month
   window (plus the View-as picker living in the drawer there) makes the long
   multi-month set-ups slow and brittle — so these run on the desktop project;
   the phone project keeps the tap-list, bid-replacement, move, publish and
   layout scenarios. */
const rulesOnDesktop = () => test.skip(isPhone(), 'rule check — covered on lw-desktop')

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* ---- getting around ------------------------------------------------------ */

async function putDrawerAway(page: Page) {
  const bar = page.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') await bar.click()
}

/** Log in and open the Leave War (admin by default). */
async function openWar(page: Page, who: 'a' | 'user' = 'a') {
  await login(page, who)
  await go(page, 'leavewar')
  await page.waitForSelector('[data-testid="row-slipway"]')
  await putDrawerAway(page)
}

/** Back to the Leave War from another page, the way a person comes back. */
async function backToWar(page: Page) {
  await go(page, 'leavewar')
  await page.waitForSelector('[data-testid="row-slipway"]')
  await putDrawerAway(page)
}

/** Bring a month on screen through the month strip and wait for the grid. */
async function showMonth(page: Page, iso: string) {
  await page.locator(`[data-testid="month-${MON[+iso.slice(5, 7) - 1]!.toUpperCase()}"]`).click()
  await page.waitForTimeout(700)
}

const cell = (page: Page, p: string, d: string) => page.locator(`[data-testid="cell-${p}-${d}"]`)
const chip = (page: Page, p: string, d: string) => cell(page, p, d).locator('.c')
const mark = (page: Page, p: string, d: string) => page.locator(`[data-testid="mark-${p}-${d}"]`)

/** Tap a cell (scrolling it into view first). */
async function tap(page: Page, p: string, d: string) {
  await cell(page, p, d).scrollIntoViewIfNeeded()
  await cell(page, p, d).click()
  await page.waitForTimeout(250)
}

/** The tap list's lines, as text. */
async function listLines(page: Page): Promise<string[]> {
  await expect(page.locator('[data-testid="daylist-sheet"]')).toBeVisible()
  return page.locator('[data-testid="daylist"] li .dl-main').allTextContents()
}
/** Close whatever sheet is up (after "OK, seen" clears a day's last mark the
 *  open sheet can turn into the plain cell sheet, so close by Escape too). */
async function closeList(page: Page) {
  if (await page.locator('[data-testid="daylist-close"]').count()) await page.locator('[data-testid="daylist-close"]').click()
  for (let i = 0; i < 3 && (await page.locator('[data-testid="sheet-scrim"]').count()); i++) {
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(150)
}

/** One figure for one person, read from the callsign's "every figure" sheet
 *  (it computes afresh when it opens, so it reads the truth even where the
 *  balance COLUMN is stale — see the BUG test for that). */
async function figure(page: Page, p: string, fig: 'lve' | 'oil' | 'medtot'): Promise<number> {
  await page.locator(`[data-testid="person-${p}"]`).scrollIntoViewIfNeeded()
  await page.locator(`[data-testid="person-${p}"]`).click()
  const v = await page.locator(`[data-testid="pfig-${fig}"] .fb`).textContent()
  await page.locator('[data-testid="pfig-close"]').click()
  await page.waitForTimeout(100)
  return Number(v)
}

async function undo(page: Page) { await page.locator('[data-testid="lw-undo"]').click(); await page.waitForTimeout(350) }
async function redo(page: Page) { await page.locator('[data-testid="lw-redo"]').click(); await page.waitForTimeout(350) }

async function clearToast(page: Page) {
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.textContent = '' })
}
const toast = (page: Page) => page.locator('#toastEl')

/* ---- the Inputs page form ------------------------------------------------ */

interface Filing {
  person?: string                // admin only — a member files for themself
  type: string
  from: string                   // ISO
  to?: string                    // ISO
  span?: 'all' | 'am' | 'pm' | 'custom'
  start?: string                 // '08:00'
  end?: string
}

/** File one input through the REAL Inputs page form, the way a person does. */
async function fileOnInputsPage(page: Page, f: Filing) {
  await go(page, 'inputs')
  await page.waitForSelector('#inAdd')
  if (f.person) await page.selectOption('#inPerson', f.person)
  await page.selectOption('#inType', f.type)
  const walkTo = async (iso: string) => {
    for (let i = 0; i < 36 && !(await page.locator(`#inCal [data-cal="${iso}"]`).count()); i++) {
      const [m, y] = (await page.locator('#inCal .rc-mon').textContent())!.split(' ')
      const at = `${y}-${String(MON.indexOf(m!) + 1).padStart(2, '0')}`
      await page.locator(`#inCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click()
    }
    await page.locator(`#inCal [data-cal="${iso}"]`).click()
  }
  // a fresh range every time: a finished range is restarted by the next tap
  await walkTo(f.from)
  if ((await page.locator('#inDates').textContent())!.includes('→')) await walkTo(f.from)
  if (f.to && f.to !== f.from) await walkTo(f.to)
  const span = f.span ?? 'all'
  if (await page.locator('#inSpan').count()) await page.locator(`#inSpan [data-span="${span}"]`).click()
  if (span === 'custom') {
    await page.locator('#inStartT').fill(f.start!)
    await page.locator('#inEndT').fill(f.end!)
  }
  await clearToast(page)
  await page.locator('#inAdd').click()
  // a medical with no certificate asks first — file it with none
  const nodoc = page.locator('[data-testid="docconf-nodoc"]')
  if (await nodoc.isVisible().catch(() => false)) await nodoc.click()
  else {
    await page.waitForTimeout(150)
    if (await nodoc.isVisible().catch(() => false)) await nodoc.click()
  }
  await page.waitForTimeout(250)
}

/** Plant a background filing through the real inputs door (localhost hook). */
async function plant(page: Page, row: Record<string, unknown>) {
  return page.evaluate(r => (window as any).fileInput({ yr: 2026, ...r }), row)
}
const inputsOf = (page: Page, p: string) =>
  page.evaluate(p => (window as any).INPUTS.filter((r: any) => r.person === p)
    .map((r: any) => `${r.type} ${r.date}${r.endDate ? '–' + r.endDate : ''}${r.allday ? '' : ` ${r.half ?? ''}${r.s}-${r.e}`}`).sort(), p)

/* ---- the war's own gestures ---------------------------------------------- */

/* A drag fired while the grid is still re-rendering after a war change is lost
   (the known flake leavewar.spec.ts's dragSelectStable works around) — so retry
   until the selection sheet is up. Retrying is side-effect free. */
async function dragSelect(page: Page, p: string, from: string, to: string) {
  const sheet = page.locator('[data-testid="select-sheet"]')
  for (let i = 0; i < 5; i++) {
    await cell(page, p, from).scrollIntoViewIfNeeded()
    const a = (await cell(page, p, from).boundingBox())!
    const b = (await cell(page, p, to).boundingBox())!
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
    await page.mouse.down()
    await page.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2)
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 })
    await page.mouse.up()
    try { await sheet.waitFor({ state: 'visible', timeout: 1500 }); return } catch {
      if (await page.locator('[data-testid="sheet-scrim"]').count()) await page.keyboard.press('Escape')
      await page.waitForTimeout(400)
    }
  }
  await expect(sheet).toBeVisible()
}

async function closeBidding(page: Page) {
  await page.locator('[data-testid="stage-advance"]').click()
  await expect(page.locator('[data-testid="stage-now"]')).toHaveText('BIDDING CLOSED')
}

/* ====================================================================== */
/*  Scenarios that should hold — the owner's agreed rules                  */
/* ====================================================================== */

test('approve a 5-day bid, delete its middle day, undo, redo', async ({ page }) => {
  desktopOnly()
  await openWar(page)
  const P = 'slipway', days = ['2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13']
  await showMonth(page, days[0]!)
  await dragSelect(page, P, days[0]!, days[4]!)
  await page.locator('[data-testid="sel-LL"]').click()
  await closeBidding(page)
  await dragSelect(page, P, days[0]!, days[4]!)
  await page.locator('[data-testid="sel-approve"]').click()
  for (const d of days) await expect(chip(page, P, d)).toHaveClass(/appr/)
  expect(await inputsOf(page, P)).toContain('LL Feb 9–Feb 13')

  // delete only Wednesday
  await dragSelect(page, P, days[2]!, days[2]!)
  await page.locator('[data-testid="sel-delete"]').click()
  await page.locator('[data-testid="sel-delete"]').click()      // "Delete — sure?"
  await expect(chip(page, P, days[2]!)).toHaveCount(0)
  for (const d of [days[0], days[1], days[3], days[4]]) await expect(chip(page, P, d!)).toHaveClass(/appr/)
  let rows = await inputsOf(page, P)
  expect(rows).toContain('LL Feb 9–Feb 10')
  expect(rows).toContain('LL Feb 12–Feb 13')

  await undo(page)
  for (const d of days) await expect(chip(page, P, d)).toHaveClass(/appr/)
  rows = await inputsOf(page, P)
  expect(rows).toContain('LL Feb 9–Feb 13')
  expect(rows.filter(r => r.startsWith('LL Feb'))).toHaveLength(1)

  await redo(page)
  await expect(chip(page, P, days[2]!)).toHaveCount(0)
  rows = await inputsOf(page, P)
  expect(rows).toContain('LL Feb 9–Feb 10')
  expect(rows).toContain('LL Feb 12–Feb 13')
})

test('an admin files leave on the Inputs page over a pending bid: bid gone, amber !, OK seen clears it', async ({ page }) => {
  await openWar(page)
  const P = 'ammo', D = '2026-02-11'
  await showMonth(page, D)
  await tap(page, P, D)
  await page.locator('[data-testid="bid-LL"]').click()
  await expect(chip(page, P, D)).toHaveText('LL')
  await expect(chip(page, P, D)).not.toHaveClass(/appr/)

  await fileOnInputsPage(page, { person: P, type: 'LL', from: D })
  await expect(toast(page)).toContainText('replaces')
  await expect(toast(page)).toContainText('LL bid on 11 Feb')
  await backToWar(page)
  await showMonth(page, D)
  await expect(chip(page, P, D)).toHaveClass(/appr/)                // the filed leave
  await expect(mark(page, P, D)).toHaveText('!')                      // the amber notice
  await expect(mark(page, P, D)).toHaveClass(/warn/)

  await tap(page, P, D)
  const lines = await listLines(page)
  expect(lines.some(l => /filed on the Inputs page/.test(l))).toBe(true)
  expect(lines.some(l => /LL bid was replaced by LL/.test(l))).toBe(true)
  expect(lines.some(l => /bid, not decided yet/.test(l))).toBe(false)   // the bid is gone
  await page.locator('[data-testid^="dl-seen-"]').click()
  await expect(mark(page, P, D)).toHaveCount(0)
  await closeList(page)

  // undo "OK, seen" brings the notice back; undo the filing brings the bid back
  await undo(page)
  await expect(mark(page, P, D)).toHaveText('!')
  await undo(page)
  await expect(mark(page, P, D)).toHaveCount(0)
  await expect(chip(page, P, D)).toHaveText('LL')
  await expect(chip(page, P, D)).not.toHaveClass(/appr/)
  expect((await inputsOf(page, P)).filter(r => r.startsWith('LL Feb 11'))).toHaveLength(0)
  await redo(page)
  await expect(chip(page, P, D)).toHaveClass(/appr/)
  await expect(mark(page, P, D)).toHaveText('!')
  await redo(page)
  await expect(mark(page, P, D)).toHaveCount(0)
})

test('the member files leave over their own bid: bid gone, a message, no notice left on the war', async ({ page }) => {
  rulesOnDesktop()
  await openWar(page, 'user')
  const P = 'ammo', D = '2026-02-11'
  await page.selectOption('#viewAs', P)          // the member IS ammo
  await lwView(page, P)
  await showMonth(page, D)
  await tap(page, P, D)
  await page.locator('[data-testid="bid-LL"]').click()
  await expect(chip(page, P, D)).toHaveText('LL')

  await fileOnInputsPage(page, { type: 'LL', from: D })
  await expect(toast(page)).toContainText('your LL bid on 11 Feb')
  await backToWar(page)
  await lwView(page, P)
  await showMonth(page, D)
  await expect(chip(page, P, D)).toHaveClass(/appr/)
  await expect(mark(page, P, D)).toHaveCount(0)
})

test('LL 14–18 Jul, then ATT C 16–17 Jul on the Inputs page: the leave is cut, +2 back, undo restores', async ({ page }) => {
  rulesOnDesktop()
  await openWar(page)
  const P = 'slipway'
  const lve0 = await figure(page, P, 'lve')
  await fileOnInputsPage(page, { person: P, type: 'LL', from: '2026-07-14', to: '2026-07-18' })
  await backToWar(page)
  const lve1 = await figure(page, P, 'lve')
  expect(lve1).toBe(lve0 - 4)                    // Tue–Fri; Saturday is free

  await fileOnInputsPage(page, { person: P, type: 'ATT C', from: '2026-07-16', to: '2026-07-17' })
  await expect(toast(page)).toContainText('is cut for the ATT C')
  expect(await inputsOf(page, P)).toEqual(expect.arrayContaining(['ATT C Jul 16–Jul 17', 'LL Jul 14–Jul 15', 'LL Jul 18']))
  await backToWar(page)
  await showMonth(page, '2026-07-14')
  await expect(chip(page, P, '2026-07-14')).toHaveText('LL')
  await expect(chip(page, P, '2026-07-16')).toHaveText('C')
  await expect(chip(page, P, '2026-07-17')).toHaveText('C')
  await expect(chip(page, P, '2026-07-18')).toHaveText('LL')
  expect(await figure(page, P, 'lve')).toBe(lve1 + 2)
  expect(await figure(page, P, 'medtot')).toBe(2)

  await undo(page)
  const back = await inputsOf(page, P)
  expect(back).toContain('LL Jul 14–Jul 18')
  expect(back.some(r => r.startsWith('ATT C Jul'))).toBe(false)
  await expect(chip(page, P, '2026-07-16')).toHaveText('LL')
  expect(await figure(page, P, 'lve')).toBe(lve1)
  await redo(page)
  await expect(chip(page, P, '2026-07-16')).toHaveText('C')
  expect(await figure(page, P, 'lve')).toBe(lve1 + 2)
})

test('a morning ATT C over a full-day LL leaves the afternoon as LL', async ({ page }) => {
  rulesOnDesktop()
  await openWar(page)
  const P = 'ammo', D = '2026-07-20'
  await plant(page, { person: P, type: 'LL', date: 'Jul 20', allday: true })
  const lve1 = await figure(page, P, 'lve')
  await fileOnInputsPage(page, { person: P, type: 'ATT C', from: D, span: 'am' })
  await expect(toast(page)).toContainText('is cut for the ATT C')
  const rows = await inputsOf(page, P)
  expect(rows).toContain('ATT C Jul 20 am0-720')
  expect(rows).toContain('LL Jul 20 pm721-1439')
  await backToWar(page)
  await showMonth(page, D)
  await expect(chip(page, P, D)).toHaveText('LL*')             // leave shows over sick; afternoon
  await expect(mark(page, P, D)).toHaveText('+1')
  expect(await figure(page, P, 'lve')).toBe(lve1 + 0.5)
  expect(await figure(page, P, 'medtot')).toBe(0.5)
})

test('two leaves on the same time are refused with a message naming the first', async ({ page }) => {
  rulesOnDesktop()
  await openWar(page)
  const P = 'dj'
  await fileOnInputsPage(page, { person: P, type: 'LL', from: '2026-07-21', span: 'am' })
  await fileOnInputsPage(page, { person: P, type: 'OL', from: '2026-07-21', span: 'custom', start: '09:00', end: '10:00' })
  await expect(toast(page)).toContainText('already has LL on 21 Jul')
  await expect(toast(page)).toContainText("OL can't overlap it")
  const rows = await inputsOf(page, P)
  expect(rows.filter(r => r.includes('Jul 21'))).toEqual(['LL Jul 21 am0-720'])
})

test('two leaves in one morning at times that do not overlap: allowed, half a day charged once, off the longer one', async ({ page }) => {
  rulesOnDesktop()
  await openWar(page)
  const P = 'dj', D = '2026-07-22'
  const lve0 = await figure(page, P, 'lve'), oil0 = await figure(page, P, 'oil')
  await fileOnInputsPage(page, { person: P, type: 'LL', from: D, span: 'custom', start: '08:00', end: '10:00' })
  await fileOnInputsPage(page, { person: P, type: 'OIL', from: D, span: 'custom', start: '10:30', end: '11:30' })
  expect((await inputsOf(page, P)).filter(r => r.includes('Jul 22'))).toHaveLength(2)
  await backToWar(page)
  await showMonth(page, D)
  await expect(chip(page, P, D)).toHaveText('*LL')
  await expect(mark(page, P, D)).toHaveText('+1')
  // owner answer D: the half comes off the leave covering more time (LL, 2h) — once
  expect(await figure(page, P, 'lve')).toBe(lve0 - 0.5)
  expect(await figure(page, P, 'oil')).toBe(oil0)
  await tap(page, P, D)
  const lines = await listLines(page)
  expect(lines.some(l => l.includes('08:00–10:00'))).toBe(true)
  expect(lines.some(l => l.includes('10:30–11:30'))).toBe(true)
})

test('leave during a course: the leave shows with +1 and is deducted', async ({ page }) => {
  rulesOnDesktop()
  await openWar(page)
  const P = 'bruise'
  await plant(page, { person: P, type: 'CSE', date: 'Jul 6', endDate: 'Jul 10', allday: true })
  const lve0 = await figure(page, P, 'lve')
  await fileOnInputsPage(page, { person: P, type: 'LL', from: '2026-07-08' })
  await backToWar(page)
  await showMonth(page, '2026-07-08')
  await expect(chip(page, P, '2026-07-07')).toHaveText('CSE')
  await expect(chip(page, P, '2026-07-08')).toHaveText('LL')
  await expect(mark(page, P, '2026-07-08')).toHaveText('+1')
  expect(await figure(page, P, 'lve')).toBe(lve0 - 1)
})

test('clearing leave after a posting-out: LL with the PO tag, charged, never counted in manning', async ({ page }) => {
  rulesOnDesktop()
  await openWar(page)
  const P = 'casper', D = '2026-07-13'
  await page.evaluate(p => (window as any).lwSetPostOut(p, '2026-07-10'), P)
  await showMonth(page, D)
  const counts = () => page.evaluate(d => [...document.querySelectorAll(`[data-testid^="count-"][data-testid$="-${d}"]`)].map(e => e.textContent).join(' '), D)
  const manning0 = await counts()
  const lve0 = await figure(page, P, 'lve')
  // H5: an admin can still pick a posted-out person on the Inputs form
  await fileOnInputsPage(page, { person: P, type: 'LL', from: D, to: '2026-07-14' })
  await backToWar(page)
  await showMonth(page, D)
  await expect(chip(page, P, D)).toHaveText('LL')
  await expect(page.locator(`[data-testid="potag-${P}-${D}"]`)).toBeVisible()
  expect(await figure(page, P, 'lve')).toBe(lve0 - 2)
  expect(await counts()).toBe(manning0)            // already out of manning; the leave changes nothing
})

test('move an approved leave after bidding closes: dotted moved mark, undo, redo', async ({ page }) => {
  await openWar(page)
  const P = 'slipway', from = '2026-02-11', to = '2026-02-18'
  await showMonth(page, from)
  await tap(page, P, from)
  await page.locator('[data-testid="bid-LL"]').click()
  await closeBidding(page)
  await tap(page, P, from)
  await page.locator('[data-testid="decide-approve"]').click()
  await expect(chip(page, P, from)).toHaveClass(/appr/)

  await tap(page, P, from)
  await page.locator('[data-testid="shift-date"]').fill(to)
  await page.locator('[data-testid="decide-shift"]').click()
  await expect(chip(page, P, from)).toHaveCount(0)
  await expect(chip(page, P, to)).toHaveClass(/appr/)
  await expect(chip(page, P, to)).toHaveClass(/moved/)
  expect(await inputsOf(page, P)).toContain('LL Feb 18')

  await undo(page)
  await expect(chip(page, P, to)).toHaveCount(0)
  await expect(chip(page, P, from)).toHaveClass(/appr/)
  await expect(chip(page, P, from)).not.toHaveClass(/moved/)
  await redo(page)
  await expect(chip(page, P, to)).toHaveClass(/moved/)
  await tap(page, P, to)
  await expect(page.locator('[data-testid="bid-picker"]')).toContainText('moved from 2026-02-11')
})

/** Sign Saturday 18 Jul (the demo week is 13–19 Jul 26) so its Publish button is live. */
async function signSaturday(page: Page) {
  await page.evaluate(() => {
    const g = (window as any).signOf(5); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    ;(window as any).renderEditWeek()
  })
}

/* PUBLISHING KEEPS THE BID AND FLAGS THE DAY (owner, 20 Sep 26). This test
   used to assert the opposite — that publishing REPLACED the bid and left a
   "your bid was replaced" notice — and it moved with the ruling, because those
   expectations were the rule. It is worth keeping in the browser suite rather
   than only in the unit tests: it is the one place the whole chain runs for
   real, from signing the day on the scheduler through to what the box shows on
   the war. */
test('publishing a weekend day KEEPS a pending bid for someone working it and flags the day', async ({ page }) => {
  await openWar(page)
  const W = 'plasma', D = '2026-07-18'        // plasma is on the Saturday duty in the demo week
  await page.evaluate(([w, d]) => (window as any).lwSetCell(w, d, 'LL'), [W, D])
  await signSaturday(page)
  await go(page, 'editsched')
  await clearToast(page)
  await page.locator('button[data-beak="5"]').click()
  // The admin is told at the moment he publishes — and told the bid is LIVE.
  await expect(toast(page)).toContainText('still live')
  await backToWar(page)
  await showMonth(page, D)
  await expect(chip(page, W, D)).toHaveText('FO')                   // the earned OIL
  await expect(mark(page, W, D)).toHaveText('!')                    // …and the flag
  await tap(page, W, D)
  const lines = await listLines(page)
  expect(lines.some(l => /bid, not decided yet/.test(l))).toBe(true)
  expect(lines.some(l => /bid was replaced/.test(l))).toBe(false)   // nothing was taken
  await closeList(page)

  // Undoing the publish takes the CREDIT back and leaves the bid exactly where
  // it always was. B5's "undo brings the bid back" has nothing left to do.
  await undo(page)
  await expect(chip(page, W, D)).toHaveText('LL')
  await expect(mark(page, W, D)).toHaveCount(0)
  expect(await page.evaluate(() => (window as any).dayApproved(5))).toBe(false)
  await redo(page)
  await expect(chip(page, W, D)).toHaveText('FO')
  await expect(mark(page, W, D)).toHaveText('!')
  await tap(page, W, D)
  expect((await listLines(page)).some(l => /bid, not decided yet/.test(l))).toBe(true)
})

test('the tap list: approve one half, refuse the other, un-approve back to a bid — each undoable', async ({ page }) => {
  await openWar(page)
  const P = 'slipway', D = '2026-02-11'
  await page.evaluate(([p, d]) => { (window as any).lwSetCell(p, d, '*LL'); (window as any).lwSetCell(p, d, 'OIL*') }, [P, D])
  await showMonth(page, D)
  await closeBidding(page)
  await expect(chip(page, P, D)).toHaveText('*LL')
  await expect(mark(page, P, D)).toHaveText('+1')

  await tap(page, P, D)
  await page.locator('[data-testid^="dl-approve-"]').first().click()
  expect(await listLines(page)).toEqual([
    '*LL — local leave, morning · approved',
    'OIL* — off in lieu, afternoon · bid, not decided yet',
  ])
  expect(await inputsOf(page, P)).toContain('LL Feb 11 am0-720')
  await page.locator('[data-testid^="dl-refuse-"]').last().click()
  expect((await listLines(page))[1]).toBe('OIL* — off in lieu, afternoon · bid refused')
  await closeList(page)

  await undo(page)                                  // the refusal
  await tap(page, P, D)
  expect((await listLines(page))[1]).toBe('OIL* — off in lieu, afternoon · bid, not decided yet')
  await closeList(page)
  await redo(page)

  await tap(page, P, D)
  await page.locator('[data-testid^="dl-unapprove-"]').click()
  expect((await listLines(page))[0]).toBe('*LL — local leave, morning · bid, not decided yet')
  expect((await inputsOf(page, P)).filter(r => r.startsWith('LL Feb 11'))).toHaveLength(0)
  await closeList(page)
  await undo(page)
  await expect(chip(page, P, D)).toHaveClass(/appr/)
  expect(await inputsOf(page, P)).toContain('LL Feb 11 am0-720')
  await redo(page)
  await expect(chip(page, P, D)).not.toHaveClass(/appr/)
})

test('tap-list permissions: a member gets no decisions, clears only their own bid, and "OK, seen" only on their own notice', async ({ page }) => {
  await openWar(page)
  const P = 'ammo', O = 'dj', D = '2026-02-16'
  // background: two-half days for ammo and dj, and an admin-filed leave that
  // replaced ammo's other bid (a notice) on the 17th
  await page.evaluate(([p, o, d]) => {
    const w = window as any
    w.lwSetCell(p, d, '*LL'); w.lwSetCell(p, d, 'OIL*')
    w.lwSetCell(o, d, '*LL'); w.lwSetCell(o, d, 'OIL*')
    w.lwSetCell(p, '2026-02-17', 'LL')
    w.fileInput({ person: p, type: 'LL', date: 'Feb 17', yr: 2026, allday: true })
  }, [P, O, D])
  await lwRole(page, 'member')
  await lwView(page, P)
  await showMonth(page, D)

  await tap(page, P, D)                                   // own day, bidding open
  await expect(page.locator('[data-testid^="dl-clear-"]')).toHaveCount(2)
  await expect(page.locator('[data-testid^="dl-approve-"], [data-testid^="dl-refuse-"], [data-testid^="dl-ack-"]')).toHaveCount(0)
  await closeList(page)

  await tap(page, O, D)                                   // someone else's day: read only
  await expect(page.locator('[data-testid="daylist-sheet"]')).toBeVisible()
  await expect(page.locator('[data-testid="daylist"] button')).toHaveCount(0)
  await closeList(page)

  await tap(page, P, '2026-02-17')                        // own notice: OK, seen offered
  expect((await listLines(page)).some(l => l.startsWith('Your LL bid was replaced'))).toBe(true)
  await expect(page.locator('[data-testid^="dl-seen-"]')).toHaveCount(1)
  await closeList(page)

  await lwView(page, O)                                   // as dj, ammo's notice is not theirs
  await tap(page, P, '2026-02-17')
  await expect(page.locator('[data-testid^="dl-seen-"]')).toHaveCount(0)
  await closeList(page)

  await lwRole(page, 'admin')                             // an admin may clear it for them
  await tap(page, P, '2026-02-17')
  await expect(page.locator('[data-testid^="dl-seen-"]')).toHaveCount(1)
})

test('a reload (not ?fresh) keeps every filed leave, cut, notice and post-out — nothing lost or doubled', async ({ page }) => {
  rulesOnDesktop()
  await openWar(page)
  await page.evaluate(() => {
    const w = window as any
    w.lwSetCell('ammo', '2026-02-11', 'LL')
    w.fileInput({ person: 'ammo', type: 'LL', date: 'Feb 11', yr: 2026, allday: true })
    w.fileInput({ person: 'slipway', type: 'LL', date: 'Jul 14', endDate: 'Jul 18', yr: 2026, allday: true })
    w.fileInput({ person: 'slipway', type: 'ATT C', date: 'Jul 16', endDate: 'Jul 17', yr: 2026, allday: true })
    w.fileInput({ person: 'dj', type: 'LL', date: 'Jul 22', yr: 2026, allday: false, s: 480, e: 600 })
    w.fileInput({ person: 'dj', type: 'OIL', date: 'Jul 22', yr: 2026, allday: false, s: 630, e: 690 })
    w.lwSetCell('bruise', '2026-02-12', '*LL'); w.lwSetCell('bruise', '2026-02-12', 'OIL*')
    w.lwSetPostOut('casper', '2026-07-10')
    w.fileInput({ person: 'casper', type: 'LL', date: 'Jul 13', endDate: 'Jul 14', yr: 2026, allday: true })
  })
  await go(page, 'inputs')
  await backToWar(page)
  const snapshot = async () => {
    const who = ['ammo', 'slipway', 'dj', 'bruise', 'casper']
    const figs: string[] = []
    for (const p of who) figs.push(`${p}:${await figure(page, p, 'lve')}/${await figure(page, p, 'oil')}/${await figure(page, p, 'medtot')}`)
    return page.evaluate(([who, figs]) => {
      const pick = [['ammo', '2026-02-11'], ['slipway', '2026-07-14'], ['slipway', '2026-07-16'], ['dj', '2026-07-22'], ['bruise', '2026-02-12'], ['casper', '2026-07-13']]
      return {
        cells: pick.map(([p, d]) => { const td = document.querySelector(`[data-testid="cell-${p}-${d}"]`); return `${p}@${d}=${td?.textContent}` }),
        inputs: (window as any).INPUTS.filter((r: any) => (who as string[]).includes(r.person)).map((r: any) => `${r.person}:${r.type}:${r.date}:${r.endDate ?? ''}:${r.s}-${r.e}`).sort(),
        total: (window as any).INPUTS.length,
        figs,
      }
    }, [who, figs] as const)
  }
  await showMonth(page, '2026-07-14'); await showMonth(page, '2026-02-11')
  const before = await snapshot()
  expect(before.cells).toContain('ammo@2026-02-11=LL!')
  expect(before.cells).toContain('casper@2026-07-13=LLPO')

  await page.reload()
  await openWar(page)
  await showMonth(page, '2026-07-14'); await showMonth(page, '2026-02-11')
  expect(await snapshot()).toEqual(before)
  await tap(page, 'ammo', '2026-02-11')
  expect((await listLines(page)).some(l => /LL bid was replaced/.test(l))).toBe(true)
})

test('phone and desktop: the tap list fits, the page never scrolls sideways, no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await openWar(page)
  await page.evaluate(() => {
    const w = window as any
    w.lwSetCell('slipway', '2026-02-16', 'LL')
    w.fileInput({ person: 'slipway', type: 'LL', date: 'Feb 16', yr: 2026, allday: false, s: 480, e: 600 })
    w.fileInput({ person: 'slipway', type: 'OIL', date: 'Feb 16', yr: 2026, allday: false, s: 630, e: 690 })
    w.fileInput({ person: 'slipway', type: 'CSE', date: 'Feb 16', yr: 2026, allday: true })
  })
  await go(page, 'inputs'); await backToWar(page)
  await showMonth(page, '2026-02-16')
  await tap(page, 'slipway', '2026-02-16')
  expect(await listLines(page)).toHaveLength(5)                     // 3 filed + afternoon bid + notice
  const box = (await page.locator('[data-testid="daylist-sheet"]').boundingBox())!
  const vw = page.viewportSize()!.width
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(vw)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vw)
  expect(errors).toEqual([])
})

/* ====================================================================== */
/*  BUGS found by this pass — each fails until its fix lands               */
/* ====================================================================== */

// BUG 1 (HIGH). Leave filed on the Inputs page never reaches the Leave War's
// balance column: the cell shows the new LL, but the number beside the name
// stays at the old balance until some OTHER change on the war repaints it.
// Root cause: the inputs door (inputgate.ts `apply`) refreshes the absence
// index itself, so the Raptor→war wire's own `if (refreshAbsences())
// absencesChanged()` (sync.ts) finds nothing new and never repaints; the
// Matrix's figure context is memoised on the war store version alone.
test('BUG: the balance column drops as soon as leave is filed on the Inputs page', async ({ page }) => {
  await openWar(page)
  const P = 'slipway', D = '2026-02-11'
  const colBefore = Number(await page.locator(`[data-testid="bal-${P}"] .fb`).textContent())
  await fileOnInputsPage(page, { person: P, type: 'LL', from: D })
  await backToWar(page)
  await showMonth(page, D)
  await expect(chip(page, P, D)).toHaveText('LL')                    // the cell is right…
  expect(await figure(page, P, 'lve')).toBe(colBefore - 1)           // …the truth is one day less…
  await expect(page.locator(`[data-testid="bal-${P}"] .fb`)).toHaveText(String(colBefore - 1))   // …the column must say so
})

// BUG 2 (MEDIUM). A medical is REFUSED when an overnight leave's tail runs
// into its morning, instead of cutting the leave (H2 / §26.1 "sick during
// leave — ALLOWED; the medical cuts the leave", H6 "overnight records count on
// the second date"). sickCutsLeave (inputgate.ts) walks only the leave's OWN
// dates and skips its spill tail, so nothing is cut and the invariant (vet)
// then refuses the medical over the tail.
test('BUG: an overnight leave does not block a medical the next morning — the medical cuts the tail', async ({ page }) => {
  rulesOnDesktop()
  await openWar(page)
  const P = 'ammo'
  expect(await plant(page, { person: P, type: 'LL', date: 'Aug 5', allday: false, s: 1320, e: 120 })).toBe(true) // 22:00–02:00
  await fileOnInputsPage(page, { person: P, type: 'ATT C', from: '2026-08-06', span: 'am' })
  await expect(toast(page)).not.toContainText("can't overlap")
  const rows = await inputsOf(page, P)
  expect(rows.some(r => r.startsWith('ATT C Aug 6'))).toBe(true)     // the medical is on file
  // the leave keeps its own evening and loses only the part after midnight
  expect(rows.some(r => r.startsWith('LL Aug 5'))).toBe(true)
})

/* BUG 3 (LOW) is GONE, not fixed — the defect stopped being reachable.
   It was: the notice a publish left read "replaced by published schedule (the
   published schedule)", naming the replacer twice, because the publish door
   passed it as both the type and the actor. Since the owner's 20 Sep 26
   ruling a publish leaves NO notice, because it replaces nothing. The test is
   removed rather than rewritten; the case it covered has no behaviour left
   behind it, and the publish door's own test above covers what happens now.
   The same double-naming would return the moment anything else is given both
   fields, so it is recorded here rather than silently deleted. */
