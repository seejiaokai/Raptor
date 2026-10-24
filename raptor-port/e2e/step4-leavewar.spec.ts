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
import { closeBidding, go, gridAtRest, login, lwRole, lwView, moveOneTo, answerNoDocument, untickApprove } from './app'

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

/* EVERY WAIT BELOW WAITS ON A CONDITION, NOT A CLOCK (owner, D87, 23 Sep 26 —
   [LW-MONTHJUMP-PHONE]). These helpers used to pause a fixed 100–700ms after
   each step: too short on a slow GitHub runner, pure dead time on a fast one,
   and it added up — the long scenarios below sat near the 30s limit and timed
   out there. `E2E_CPU_THROTTLE=3` (e2e/app.ts) reproduces that runner on a
   desktop. */

const sheetScrim = (page: Page) => page.locator('[data-testid="sheet-scrim"]')

/** Bring a month on screen through the month strip and wait until it is drawn
 *  and the grid has come to rest over it. */
async function showMonth(page: Page, iso: string) {
  const first = `${iso.slice(0, 8)}01`
  await page.locator(`[data-testid="month-${MON[+iso.slice(5, 7) - 1]!.toUpperCase()}"]`).click()
  await page.locator(`[data-testid="head-${first}"]`).waitFor({ state: 'attached' })
  await gridAtRest(page, first) // e2e/app.ts — waits for the landed header to hold still
}

const cell = (page: Page, p: string, d: string) => page.locator(`[data-testid="cell-${p}-${d}"]`)
const chip = (page: Page, p: string, d: string) => cell(page, p, d).locator('.c')
/* LOOK F (D1175, D1160, D1146, D1167): a day with exactly two entries draws TWO boxes, so `chip` matches both there —
   such a day's box is found by its kind (`k-ll`, `k-oil`, `k-med`, `k-cse` …). The fill says where it stands, where the
   old classes said appr / tbc / ref: filled `s-a` approved, hollow and dashed `s-w` pending, struck `s-r` refused. */
const box = (page: Page, p: string, d: string, kind: string) => cell(page, p, d).locator(`.c.k-${kind}`)
const FILLED = /(^|\s)s-a(\s|$)/
const PENDING = /(^|\s)s-w(\s|$)/
const REFUSED = /(^|\s)s-r(\s|$)/
const place = (where: 'whole' | 'top' | 'bot' | 'left' | 'right' | 'right-am' | 'right-pm') => new RegExp(`(^|\\s)${where}(\\s|$)`)
const mark = (page: Page, p: string, d: string) => page.locator(`[data-testid="mark-${p}-${d}"]`)

/** Tap a cell (scrolling it into view first) and wait for the sheet it opens —
 *  every Leave War sheet is built on the one Sheet wrapper, which draws the
 *  scrim, so a scrim on screen is "the tap landed". */
async function tap(page: Page, p: string, d: string) {
  await cell(page, p, d).scrollIntoViewIfNeeded()
  await cell(page, p, d).click()
  await expect(sheetScrim(page)).toBeVisible()
}

/** The tap list's lines, as text. */
async function listLines(page: Page): Promise<string[]> {
  await expect(page.locator('[data-testid="daylist-sheet"]')).toBeVisible()
  return page.locator('[data-testid="daylist"] li .dl-main').allTextContents()
}
/** Close whatever sheet is up, and wait until none is (after "OK, seen" clears
 *  a day's last mark the open sheet can turn into the plain cell sheet, so
 *  close by Escape too — pressed again only while a sheet is still up). */
async function closeList(page: Page) {
  if (await page.locator('[data-testid="daylist-close"]').count()) await page.locator('[data-testid="daylist-close"]').click()
  await expect(async () => {
    if (await sheetScrim(page).count()) await page.keyboard.press('Escape')
    await expect(sheetScrim(page)).toHaveCount(0, { timeout: 1000 })
  }).toPass()
}

type Fig = 'lve' | 'oil' | 'medtot'
/** A person's figures, read from the callsign's "every figure" sheet in ONE
 *  opening (it computes afresh when it opens, so it reads the truth even where
 *  the balance COLUMN is stale — see the BUG test for that). Each opening and
 *  closing repaints the grid, which is the slow part on a slow machine, so a
 *  caller that needs three figures asks for all three at once. */
async function figures<F extends Fig>(page: Page, p: string, want: readonly F[]): Promise<Record<F, number>> {
  await page.locator(`[data-testid="person-${p}"]`).scrollIntoViewIfNeeded()
  await page.locator(`[data-testid="person-${p}"]`).click()
  const got = {} as Record<F, number>
  for (const f of want) got[f] = Number(await page.locator(`[data-testid="pfig-${f}"] .fb`).textContent())
  await page.locator('[data-testid="pfig-close"]').click()
  await expect(sheetScrim(page)).toHaveCount(0)
  return got
}
/** One figure for one person — `figures` with a single ask. */
async function figure(page: Page, p: string, fig: Fig): Promise<number> {
  return (await figures(page, p, [fig]))[fig]
}

/* Undo and redo do their work inside the click (Chrome.tsx calls the one
   timeline directly), so there is nothing to sit out; each waits only for the
   pair to show the move, and every caller then waits on what it checks. */
async function undo(page: Page) {
  await page.locator('#undoBtn').click()
  await expect(page.locator('#redoBtn')).toBeEnabled()
}
async function redo(page: Page) {
  await page.locator('#redoBtn').click()
  await expect(page.locator('#undoBtn')).toBeEnabled()
}

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

/** File one input through the REAL Inputs page, the way a person does.
 *  SINCE 10 OCT 26 (owner D729 — the design vet's V1) the List has no form of its own: its "+ Input" opens the input's
 *  window, the one the calendar opens — so that is the door driven here. The window opens fresh each time, with no
 *  date picked; one left open by a refused filing is put away before the next. */
async function fileOnInputsPage(page: Page, f: Filing) {
  await go(page, 'inputs')
  // D580: the List is the Inputs tab's secondary view.
  await page.locator('#inListBtn').click()
  if (await page.locator('[data-testid="win-inputedit"]').count()) await page.locator('#inpEditCancel').click()
  await page.locator('#inNew').click()
  await page.waitForSelector('#inpEditSave')
  await page.selectOption('#inpEditType', f.type)
  if (f.person) await page.selectOption('#inpEditPerson', f.person)
  const walkTo = async (iso: string) => {
    for (let i = 0; i < 36 && !(await page.locator(`#inpEdCal [data-iso="${iso}"]`).count()); i++) {
      /* the month shown, "yyyy-mm" (the app's one date calendar since step two (D901)) */
      const at = (await page.locator('[data-testid="inpEdCal"]').getAttribute('data-month'))!
      await page.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click()
    }
    await page.locator(`#inpEdCal [data-iso="${iso}"]`).click()
  }
  await walkTo(f.from)
  if (f.to && f.to !== f.from) await walkTo(f.to)
  const span = f.span ?? 'all'
  if (await page.locator('#inpEditSpan').count()) await page.locator(`#inpEditSpan [data-span="${span}"]`).click()
  if (span === 'custom') {
    await page.locator('#inpEditStart').fill(f.start!)
    await page.locator('#inpEditEnd').fill(f.end!)
  }
  await clearToast(page)
  const before = await page.evaluate(() => (window as any).INPUTS.length as number)
  await page.locator('#inpEditSave').click()
  await answerNoDocument(page)
  /* The add decides inside the click, one of three ways: a medical with no
     certificate ASKS first, or it files, or it is refused on the toast. Wait
     for whichever it was. (A fixed 150ms look for the question used to sit
     here: on a slow machine the question came later, was missed, and the
     filing never happened.) Filing always adds at least one row — a cut
     leave comes back as its pieces — so a count that moved means filed. */
  const outcome = (withAsk: boolean) => page.waitForFunction(([n, ask]) =>
    (ask && !!document.querySelector('[data-testid="docconf"]'))
    || (window as any).INPUTS.length !== n
    || !!document.getElementById('toastEl')?.textContent, [before, withAsk] as const)
  await outcome(true)
  const nodoc = page.locator('[data-testid="docconf-nodoc"]')
  if (await nodoc.count()) {
    await nodoc.click()                                   // file it with none
    await outcome(false)
  }
}

/** Plant a background filing through the real inputs door (localhost hook). */
async function plant(page: Page, row: Record<string, unknown>) {
  return page.evaluate(r => (window as any).fileInput({ yr: 2026, ...r }), row)
}
const inputsOf = (page: Page, p: string) =>
  page.evaluate(p => (window as any).INPUTS.filter((r: any) => (r.people ? r.people.some((e: any) => e.p === p) : r.person === p))
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

/* closing bidding is e2e/app.ts closeBidding: every open month shut in the "Open for bidding" window, the chip then
   reading "Bidding closed" (D1177 — the stage's forward move until the stages went) */

/* ====================================================================== */
/*  Scenarios that should hold — the owner's agreed rules                  */
/* ====================================================================== */

test('approve a 5-day bid, delete its middle day, undo, redo', async ({ page }) => {
  desktopOnly()
  await openWar(page)
  const P = 'slipway', days = ['2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13']
  await showMonth(page, days[0]!)
  await dragSelect(page, P, days[0]!, days[4]!)
  await untickApprove(page, 'sel')             // placed pending, then approved below (D1186: the tick starts on)
  await page.locator('[data-testid="sel-LL"]').click()
  await closeBidding(page)
  await dragSelect(page, P, days[0]!, days[4]!)
  await page.locator('[data-testid="sel-approve"]').click()
  for (const d of days) await expect(chip(page, P, d)).toHaveClass(FILLED)
  expect(await inputsOf(page, P)).toContain('LL Feb 9–Feb 13')

  // delete only Wednesday
  await dragSelect(page, P, days[2]!, days[2]!)
  await page.locator('[data-testid="sel-delete"]').click()
  await page.locator('[data-testid="sel-delete"]').click()      // "Delete — sure?"
  await expect(chip(page, P, days[2]!)).toHaveCount(0)
  for (const d of [days[0], days[1], days[3], days[4]]) await expect(chip(page, P, d!)).toHaveClass(FILLED)
  let rows = await inputsOf(page, P)
  expect(rows).toContain('LL Feb 9–Feb 10')
  expect(rows).toContain('LL Feb 12–Feb 13')

  await undo(page)
  for (const d of days) await expect(chip(page, P, d)).toHaveClass(FILLED)
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
  await untickApprove(page, 'bid')             // a pending bid (D1186: the admin's tick starts on)
  await page.locator('[data-testid="bid-LL"]').click()
  await expect(chip(page, P, D)).toHaveText('LL')
  await expect(chip(page, P, D)).toHaveClass(PENDING)   // a bid lands pending — hollow, dashed (look F, D1175)

  await fileOnInputsPage(page, { person: P, type: 'LL', from: D })
  await expect(toast(page)).toContainText('replaces')
  await expect(toast(page)).toContainText('LL bid on 11 Feb')
  await backToWar(page)
  await showMonth(page, D)
  await expect(chip(page, P, D)).toHaveClass(FILLED)                // the filed leave
  await expect(mark(page, P, D)).toHaveText('!')                      // the amber notice
  await expect(mark(page, P, D)).toHaveClass(/warn/)

  await tap(page, P, D)
  const lines = await listLines(page)
  /* round 3 (D1328): beside each entry's box only its half and state — "change it on the Inputs page" for one filed there */
  expect(lines.some(l => /change it on the Inputs page/i.test(l))).toBe(true)   // a whole day's line starts with it: "Change it…"
  expect(lines.some(l => /LL bid was replaced by LL/.test(l))).toBe(true)
  expect(lines.some(l => /pending/i.test(l))).toBe(false)   // the bid is gone ("pending" — D1158, D1217; the words short since D1328)
  await page.locator('[data-testid^="dl-seen-"]').click()
  await expect(mark(page, P, D)).toHaveCount(0)
  await closeList(page)

  /* "OK, seen" is never an Undo step (the change-recording re-test, plan §10 — the builder's call, on his look card: it
     records that a person READ the notice, like the other seen marks). So Undo goes past it to the filing — which
     brings the bid back — and the notice, once seen, stays seen. Was: "undo OK seen brings the notice back". */
  await undo(page)
  await expect(mark(page, P, D)).toHaveCount(0)
  await expect(chip(page, P, D)).toHaveText('LL')
  await expect(chip(page, P, D)).toHaveClass(PENDING)
  expect((await inputsOf(page, P)).filter(r => r.startsWith('LL Feb 11'))).toHaveLength(0)
  await redo(page)
  await expect(chip(page, P, D)).toHaveClass(FILLED)
  await expect(mark(page, P, D)).toHaveCount(0)                       // Redo brings the filing, never the seen notice (Astra F1)
})

test('the member files leave over their own bid: bid gone, a message, no notice left on the war', async ({ page }) => {
  rulesOnDesktop()
  await openWar(page, 'user')
  const P = 'ammo', D = '2026-02-11'
  await page.evaluate(id => (window as any).raptorMe(id), P)   // the member IS ammo (the signed-in person — [ACCOUNTS]; "View as" is gone)
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
  await expect(chip(page, P, D)).toHaveClass(FILLED)
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
  const cut = await figures(page, P, ['lve', 'medtot'])
  expect(cut.lve).toBe(lve1 + 2)
  expect(cut.medtot).toBe(2)

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
  /* look F (D1146, D1160): the day's two halves both show — the leave in the bottom half (the afternoon), the ATT C in
     the top, each its bare code — where it read "LL>" with a +1 */
  await expect(chip(page, P, D)).toHaveCount(2)
  await expect(box(page, P, D, 'll')).toHaveText('LL')
  await expect(box(page, P, D, 'll')).toHaveClass(place('bot'))
  await expect(box(page, P, D, 'med')).toHaveText('C')
  await expect(box(page, P, D, 'med')).toHaveClass(place('top'))
  await expect(mark(page, P, D)).toHaveCount(0)
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
  /* both in the same half, so the two cannot both be drawn (D1146): one box, in the top half, its bare code — where it
     read "<LL" (D1160) — and the +1 stays */
  await expect(chip(page, P, D)).toHaveText('LL')
  await expect(chip(page, P, D)).toHaveClass(place('top'))
  await expect(mark(page, P, D)).toHaveText('+1')
  // owner answer D: the half comes off the leave covering more time (LL, 2h) — once
  expect(await figure(page, P, 'lve')).toBe(lve0 - 0.5)
  expect(await figure(page, P, 'oil')).toBe(oil0)
  await tap(page, P, D)
  const lines = await listLines(page)
  expect(lines.some(l => l.includes('08:00–10:00'))).toBe(true)
  expect(lines.some(l => l.includes('10:30–11:30'))).toBe(true)
})

/* WAS "the leave shows with +1": since D1167 two whole-day entries are drawn side by side, each the full height — the
   leave on the left (the day's main record, as it was), the course on the right — and the +1 has nothing more to say */
test('leave during a course: the leave and the course both show, side by side, and the leave is deducted', async ({ page }) => {
  rulesOnDesktop()
  await openWar(page)
  const P = 'bruise'
  await plant(page, { person: P, type: 'CSE', date: 'Jul 6', endDate: 'Jul 10', allday: true })
  const lve0 = await figure(page, P, 'lve')
  await fileOnInputsPage(page, { person: P, type: 'LL', from: '2026-07-08' })
  await backToWar(page)
  await showMonth(page, '2026-07-08')
  await expect(chip(page, P, '2026-07-07')).toHaveText('CSE')
  await expect(chip(page, P, '2026-07-08')).toHaveCount(2)
  await expect(box(page, P, '2026-07-08', 'll')).toHaveText('LL')
  await expect(box(page, P, '2026-07-08', 'll')).toHaveClass(place('left'))
  await expect(box(page, P, '2026-07-08', 'cse')).toHaveText('CSE')
  await expect(box(page, P, '2026-07-08', 'cse')).toHaveClass(place('right'))
  await expect(mark(page, P, '2026-07-08')).toHaveCount(0)
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

/* THE MOVED MARK IS AN APPROVED LEAVE'S, AT ANY TIME (D1177 — it was "after bidding closes" while there were stages):
   the dates stay open here, and the move still wears the dotted mark */
test('move an approved leave while its dates are open: dotted moved mark, undo, redo', async ({ page }) => {
  await openWar(page)
  const P = 'slipway', from = '2026-02-11', to = '2026-02-18'
  await showMonth(page, from)
  await tap(page, P, from)
  await page.locator('[data-testid="bid-LL"]').click()
  await expect(page.locator('[data-testid="open-chip"]'), 'nothing closed first').toContainText('1 Jan – 31 Mar')
  /* the admin's switch starts on (D1186), so the leave is approved as it is placed — a tap on its Approve, now lit, would
     send it back to waiting (his D1330, round 3), so the old "approve it" step is gone */
  await expect(chip(page, P, from)).toHaveClass(FILLED)

  await tap(page, P, from)
  await moveOneTo(page, `cell-${P}-${to}`)                   // D262: Move picks the chip up; a click lands it
  await expect(chip(page, P, from)).toHaveCount(0)
  await expect(chip(page, P, to)).toHaveClass(FILLED)
  await expect(chip(page, P, to)).toHaveClass(/moved/)
  expect(await inputsOf(page, P)).toContain('LL Feb 18')

  await undo(page)
  await expect(chip(page, P, to)).toHaveCount(0)
  await expect(chip(page, P, from)).toHaveClass(FILLED)
  await expect(chip(page, P, from)).not.toHaveClass(/moved/)
  await redo(page)
  await expect(chip(page, P, to)).toHaveClass(/moved/)
  await tap(page, P, to)
  await expect(page.locator('[data-testid="bid-picker"]')).toContainText('moved from 11 Feb 26')
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
  /* `FO*` — the star is the owner's 20 Sep 26 mark for "the APP put this
     here", and this is the one place in the whole suite that proves it: a
     credit earned off the PUBLISHED SCHEDULE rather than granted by a person.
     A bare `FO` here would mean the publish had somehow written a grant.
     Look F (D1167, D1175): the day's two whole entries are drawn side by side — the earned OIL on the left, the live
     bid on the right, hollow and dashed (pending) — where the one box read `FO*`; the amber "!" stays. */
  const both = async () => {
    await expect(chip(page, W, D)).toHaveCount(2)
    await expect(box(page, W, D, 'oil')).toHaveText('FO*')            // the earned OIL
    await expect(box(page, W, D, 'oil')).toHaveClass(place('left'))
    await expect(box(page, W, D, 'll')).toHaveText('LL')              // the bid, still live
    await expect(box(page, W, D, 'll')).toHaveClass(PENDING)
    await expect(box(page, W, D, 'll')).toHaveClass(place('right'))
    await expect(mark(page, W, D)).toHaveText('!')                    // …and the flag
  }
  await both()
  await tap(page, W, D)
  const lines = await listLines(page)
  expect(lines.some(l => /pending/i.test(l))).toBe(true)
  expect(lines.some(l => /bid was replaced/.test(l))).toBe(false)   // nothing was taken
  await closeList(page)

  // Undoing the publish takes the CREDIT back and leaves the bid exactly where
  // it always was. B5's "undo brings the bid back" has nothing left to do.
  // Pressed on the war, the Undo takes you to Edit Schedule: publishing is the
  // schedule's act, the credit only rides it (Astra's final read, F2 — the page
  // an undo lands on is the act's, never a folded consequence).
  await undo(page)
  expect(await page.evaluate(() => (window as any).CURPAGE)).toBe('editsched')
  expect(await page.evaluate(() => (window as any).dayApproved(5))).toBe(false)
  await backToWar(page)
  await showMonth(page, D)
  await expect(chip(page, W, D)).toHaveText('LL')
  await expect(mark(page, W, D)).toHaveCount(0)
  await redo(page)
  expect(await page.evaluate(() => (window as any).CURPAGE)).toBe('editsched')
  await backToWar(page)
  await showMonth(page, D)
  await both()
  await tap(page, W, D)
  expect((await listLines(page)).some(l => /pending/i.test(l))).toBe(true)
})

/* round 3 (D1328, D1330): each line says only its half and state beside its box; the approved leave's Approve is lit and a
   second tap on it sends it back to a bid — "Back to bid" went */
test('the tap list: approve one half, refuse the other, un-approve back to a bid — each undoable', async ({ page }) => {
  await openWar(page)
  const P = 'slipway', D = '2026-02-11'
  await page.evaluate(([p, d]) => { (window as any).lwSetCell(p, d, '*LL'); (window as any).lwSetCell(p, d, 'OIL*') }, [P, D])
  await showMonth(page, D)
  await closeBidding(page)
  /* look F (D1146, D1160): the two halves both show — the morning LL on top, the afternoon OIL below, each hollow and
     dashed (pending), each its bare code — where the one box read "<LL" with a +1 */
  await expect(chip(page, P, D)).toHaveCount(2)
  await expect(box(page, P, D, 'll')).toHaveText('LL')
  await expect(box(page, P, D, 'll')).toHaveClass(place('top'))
  await expect(box(page, P, D, 'll')).toHaveClass(PENDING)
  await expect(box(page, P, D, 'oil')).toHaveText('OIL')
  await expect(box(page, P, D, 'oil')).toHaveClass(place('bot'))
  await expect(box(page, P, D, 'oil')).toHaveClass(PENDING)
  await expect(mark(page, P, D)).toHaveCount(0)

  await tap(page, P, D)
  await page.locator('[data-testid^="dl-approve-"]').first().click()
  expect(await listLines(page)).toEqual([
    'Morning · approved',
    'Afternoon · pending',
  ])
  expect(await inputsOf(page, P)).toContain('LL Feb 11 am0-720')
  await page.locator('[data-testid^="dl-refuse-"]').last().click()
  expect((await listLines(page))[1]).toBe('Afternoon · refused')
  await closeList(page)

  await undo(page)                                  // the refusal
  await tap(page, P, D)
  expect((await listLines(page))[1]).toBe('Afternoon · pending')
  await closeList(page)
  await redo(page)

  await tap(page, P, D)
  await page.locator('[data-testid="daylist"] .dl-acts .dchip.approve.lit').click()
  expect((await listLines(page))[0]).toBe('Morning · pending')
  expect((await inputsOf(page, P)).filter(r => r.startsWith('LL Feb 11'))).toHaveLength(0)
  await closeList(page)
  await undo(page)
  // the morning LL approved again — filled; the afternoon OIL stays refused — struck (look F, D1175: `s-a` / `s-r`
  // where the one box was `appr`)
  await expect(box(page, P, D, 'll')).toHaveClass(FILLED)
  await expect(box(page, P, D, 'oil')).toHaveClass(REFUSED)
  expect(await inputsOf(page, P)).toContain('LL Feb 11 am0-720')
  await redo(page)
  await expect(box(page, P, D, 'll')).toHaveClass(PENDING)
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
  await expect(page.locator('[data-testid^="dl-approve-"], [data-testid^="dl-refuse-"]')).toHaveCount(0)   // (its dl-ack- went with Ack, D1158)
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
  const pick = [['ammo', '2026-02-11'], ['slipway', '2026-07-14'], ['slipway', '2026-07-16'], ['dj', '2026-07-22'], ['bruise', '2026-02-12'], ['casper', '2026-07-13']] as const
  const snapshot = async () => {
    const who = ['ammo', 'slipway', 'dj', 'bruise', 'casper']
    const figs: string[] = []
    for (const p of who) {
      const f = await figures(page, p, ['lve', 'oil', 'medtot'])
      figs.push(`${p}:${f.lve}/${f.oil}/${f.medtot}`)
    }
    // Every compared cell must be DRAWN before it is read. After a jump the
    // grid draws the rest of the year in the background, and a cell not drawn
    // yet reads as undefined — on both sides alike, so the comparison would
    // pass without having compared anything.
    for (const [p, d] of pick) await cell(page, p, d).waitFor({ state: 'attached' })
    return page.evaluate(([who, figs, pick]) => {
      return {
        cells: pick.map(([p, d]) => { const td = document.querySelector(`[data-testid="cell-${p}-${d}"]`); return `${p}@${d}=${td?.textContent}` }),
        inputs: (window as any).INPUTS.map((r: any) => ({ ...r, person: r.people ? r.people[0]?.p : r.person })).filter((r: any) => (who as string[]).includes(r.person)).map((r: any) => `${r.person}:${r.type}:${r.date}:${r.endDate ?? ''}:${r.s}-${r.e}`).sort(),
        total: (window as any).INPUTS.length,
        figs,
      }
    }, [who, figs, pick] as const)
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
