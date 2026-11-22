/* D2338 — the look-ahead SANS note fits a phone (the walk's fit-02 / fit-03, 23 Nov 26). A man whose SANS posting is
   saved but has not run yet is struck under SANS Avail on his look-ahead days, and with a seat armed his reason is
   PRINTED under his name: "SANS from Fri 17 Jul: no availability filed. It can be filed from that day on the Inputs
   page's SANS tab." On his iPhone (402 wide) that line ran on as one line 377px wide, past the screen and the crew
   drawer, on the board and on Edit Schedule's crew drawer alike — "…from that day on th" and the rest cut off. jsdom has
   no layout, so the fit lives here: posted out through the Leave War's own sheet on Wed 15, the board's Friday and
   Edit Schedule's Friday card each with the EXT SQN OFT row armed, at 402, 375 and 320 wide, the printed reason's right
   edge at or inside the screen and its drawer, and the drawer never wider inside than it is. */
import { expect, test, type Page } from '@playwright/test'
import { go } from './app'

const HEX = 'rocky'
const FRI = 4
const KEY = `s:${FRI}.oft.0.+`
const NOTE = "SANS from Fri 17 Jul: no availability filed. It can be filed from that day on the Inputs page's SANS tab."
const WIDTHS = [402, 375, 320]
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

/* signed in as the admin, the app's clock at Wed 15 Jul 26 09:00 — the walk's world; the Leave War's own today is NOT
   pinned back (as app.ts's login does), so the posting is dated from the app's today, as he would see it */
async function signIn(page: Page) {
  await page.clock.install({ time: new Date('2026-07-15T09:00:00') })
  await page.goto('/')
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
}
async function tap(page: Page, sel: string) {
  const l = page.locator(sel).first()
  await l.waitFor({ state: 'visible', timeout: 8000 })
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
  if (await page.evaluate(() => matchMedia('(pointer: coarse)').matches)) await l.tap(); else await l.click()
  await sleep(350)
}
/* Hex's Leave War cell for Fri 17 → ⋯ → Post out → SANS → Post out (the walk's own steps) */
async function postOutSans(page: Page) {
  await go(page, 'leavewar'); await sleep(800)
  if (await page.locator('[data-testid="month-JUL"]:visible').count()) { await tap(page, '[data-testid="month-JUL"]:visible'); await sleep(800) }
  await tap(page, `[data-testid="cell-${HEX}-2026-07-17"]`)
  await tap(page, '[data-testid="bid-more"]:visible')
  await tap(page, '[data-testid="bid-postout"]:visible')
  await tap(page, '[data-testid="po-sans"]:visible')
  await expect(page.locator('[data-testid="po-line"]').first()).toContainText('17 Jul: becomes SANS')
  await tap(page, '[data-testid="po-confirm"]:visible'); await sleep(800)
  expect(await page.evaluate(id => !!(window as any).PEOPLE[id].san, HEX)).toBe(false)   // not run yet: a look-ahead
}
const armed = (page: Page) => page.evaluate(() => (window as any).ARM && (window as any).ARM.key)
/* the board, Fri 17, the EXT SQN OFT row's people box armed */
async function armBoard(page: Page) {
  await go(page, 'editsched')
  await tap(page, `#eWeek [data-sbday="${FRI}"]`)
  await page.waitForSelector('#schedBoard'); await sleep(700)
  await tap(page, `#schedBoard [data-fill="${KEY}"]:visible`); await sleep(500)
  expect(await armed(page)).toBe(KEY)
}
async function leaveBoard(page: Page) {
  await page.keyboard.press('Escape'); await sleep(300)
  if (await page.locator('#sbDone:visible').count()) await tap(page, '#sbDone:visible')
  else await page.keyboard.press('Escape')
  await sleep(500)
}
/* the phone's crew drawer out (a desktop's panel is always out) */
const drawerOpen = (page: Page) => page.evaluate(() => { const e = document.querySelector('.ros-body'); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
/* Edit Schedule: the crew drawer closed, the same row pressed on Friday's card, the drawer opened by its tab */
async function armWeek(page: Page) {
  await go(page, 'editsched')
  const phone = await page.locator('#rosTab:visible').count() > 0
  if (phone && await drawerOpen(page)) await tap(page, '#rosTab')
  await tap(page, `#eWeek [data-fill="${KEY}"]`); await sleep(500)
  if (phone && !(await drawerOpen(page))) await tap(page, '#rosTab')
  await sleep(400)
  expect(await armed(page)).toBe(KEY)
}
/* the printed reason under Hex's name, against the screen (the width set, not innerWidth: a phone's layout viewport
   widens to what the page holds) and against the drawer that holds it */
const measure = (page: Page, root: string, drawer: string) => page.evaluate(([root, drawer, id]) => {
  const pk = [...document.querySelectorAll(`${root} .rsans-row .rpuck[data-person="${id}"]`)].find(e => e.getBoundingClientRect().width > 1)
  const w = pk && pk.querySelector('.rwhy')
  if (!w) return null
  const r = w.getBoundingClientRect(), d = (pk!.closest(drawer) as HTMLElement).getBoundingClientRect()
  const dr = pk!.closest(drawer) as HTMLElement
  const lh = parseFloat(getComputedStyle(w).lineHeight)
  return { text: w.textContent, right: Math.round(r.right), drawerRight: Math.round(d.right), lines: Math.round(r.height / lh),
    scrollW: dr.scrollWidth, clientW: dr.clientWidth }
}, [root, drawer, HEX] as const)

/* Every printed reason in the list, and the list's own width — read with the stylesheet as it is, then with the old
   rule laid back on top (the SANS row's entry never shrinking, the desktop board's own shrink as it was), so the test
   says which notes the fix moved: on a phone only Hex's, on a desktop none. */
const OLD = '.rall .rsans-row>.rpuck{flex:0 0 auto!important;min-width:auto!important}'
  + '@media (min-width:821px){#sbRoster .rsans-row>.rpuck{flex:0 1 auto!important;min-width:var(--puck-w)!important}}'
const notes = (page: Page, root: string, drawer: string) => page.evaluate(([root, drawer]) => {
  const R = document.querySelector(root)!, D = R.querySelector(drawer) as HTMLElement | null
  /* across: its left edge, width and height (how it wraps) — not its top, which a taller row above it moves */
  const box = (e: Element) => { const r = e.getBoundingClientRect(); return [r.left, r.width, r.height].map(Math.round).join(',') }
  /* the list: its left edge and width (it grows taller by the lines Hex's reason now wraps onto) */
  const across = (e: Element) => { const r = e.getBoundingClientRect(); return [r.left, r.width].map(Math.round).join(',') }
  return { drawer: D ? across(D) : '', notes: [...R.querySelectorAll('.rwhy')].filter(e => e.getBoundingClientRect().width > 1)
    .map(e => `${(e.closest('[data-person]') as HTMLElement | null)?.dataset.person || 'col'} ${box(e)}`) }
}, [root, drawer] as const)
async function oldAndNew(page: Page, root: string, drawer: string) {
  const now = await notes(page, root, drawer)
  await page.evaluate(css => { const s = document.createElement('style'); s.id = 'oldrule'; s.textContent = css; document.head.appendChild(s) }, OLD)
  await sleep(150)
  const old = await notes(page, root, drawer)
  await page.evaluate(() => document.getElementById('oldrule')!.remove()); await sleep(150)
  return { now, old }
}
const notHex = (l: string[]) => l.filter(x => !x.startsWith(HEX + ' '))

test.describe('the look-ahead SANS note on a phone (D2338, the walk\'s fit-02 / fit-03)', () => {
  test.use({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true })
  test('it wraps inside the screen and the crew drawer, on the board and on Edit Schedule, at 402, 375 and 320', async ({ page }) => {
    test.setTimeout(120_000)
    const errs: string[] = []; page.on('pageerror', e => errs.push(String(e)))
    await signIn(page)
    await postOutSans(page)
    for (const W of WIDTHS) {
      await page.setViewportSize({ width: W, height: 874 }); await sleep(300)
      await armBoard(page)
      const b = await measure(page, '#schedBoard', '.sb-roster')
      expect(b, `${W}: the board prints Hex's reason`).not.toBeNull()
      expect(b!.text).toBe(NOTE)
      expect(b!.right, `${W}: the board — the reason's right edge inside the screen ${JSON.stringify(b)}`).toBeLessThanOrEqual(W)
      expect(b!.right, `${W}: the board — inside its drawer ${JSON.stringify(b)}`).toBeLessThanOrEqual(b!.drawerRight + 1)
      expect(b!.scrollW, `${W}: the board's drawer never wider inside than it is`).toBeLessThanOrEqual(b!.clientW + 1)
      expect(b!.lines, `${W}: the board — it wraps`).toBeGreaterThanOrEqual(2)
      const bc = await oldAndNew(page, '#schedBoard', '.sb-roster')
      expect(notHex(bc.now.notes), `${W}: the board — every other reason where it was`).toEqual(notHex(bc.old.notes))
      expect(bc.now.drawer, `${W}: the board — the list as wide as it was`).toBe(bc.old.drawer)
      await leaveBoard(page)
      await armWeek(page)
      const e = await measure(page, '.eroster', '.ros-body')
      expect(e, `${W}: Edit Schedule prints Hex's reason`).not.toBeNull()
      expect(e!.text).toBe(NOTE)
      expect(e!.right, `${W}: Edit Schedule — the reason's right edge inside the screen ${JSON.stringify(e)}`).toBeLessThanOrEqual(W)
      expect(e!.right, `${W}: Edit Schedule — inside its drawer ${JSON.stringify(e)}`).toBeLessThanOrEqual(e!.drawerRight + 1)
      expect(e!.scrollW, `${W}: Edit Schedule's drawer never wider inside than it is ${JSON.stringify(e)}`).toBeLessThanOrEqual(e!.clientW + 1)
      expect(e!.lines, `${W}: Edit Schedule — it wraps`).toBeGreaterThanOrEqual(2)
      const ec = await oldAndNew(page, '.eroster', '.ros-body')
      expect(notHex(ec.now.notes), `${W}: Edit Schedule — every other reason where it was`).toEqual(notHex(ec.old.notes))
      expect(ec.now.drawer, `${W}: Edit Schedule — the drawer as wide as it was`).toBe(ec.old.drawer)
      await page.keyboard.press('Escape'); await sleep(300)
      if (await drawerOpen(page)) await tap(page, '#rosTab')
    }
    expect(errs).toEqual([])
  })
})

/* the desktop's look is not changed: every reason, Hex's own included, stands exactly where the old rule put it, and the
   lists keep their width — the board's (its SANS row already shrank there, D1118) and Edit Schedule's crew panel (as
   wide as what it holds, so the line still fits it on one line) */
test.describe('the look-ahead SANS note on a desktop: unchanged (D2338)', () => {
  test.use({ viewport: { width: 1536, height: 864 } })
  test('the board and Edit Schedule draw every reason as before', async ({ page }) => {
    test.setTimeout(90_000)
    const errs: string[] = []; page.on('pageerror', e => errs.push(String(e)))
    await signIn(page)
    await postOutSans(page)
    await armBoard(page)
    const b = await measure(page, '#schedBoard', '.sb-roster')
    expect(b && b.text).toBe(NOTE)
    expect(b!.right, `the board — inside its list ${JSON.stringify(b)}`).toBeLessThanOrEqual(b!.drawerRight + 1)
    const bc = await oldAndNew(page, '#schedBoard', '.sb-roster')
    expect(bc.now, 'the board — every reason and the list as before').toEqual(bc.old)
    await leaveBoard(page)
    await armWeek(page)
    const e = await measure(page, '.eroster', '.ros-body')
    expect(e && e.text).toBe(NOTE)
    expect(e!.right, `Edit Schedule — inside its panel ${JSON.stringify(e)}`).toBeLessThanOrEqual(e!.drawerRight + 1)
    const ec = await oldAndNew(page, '.eroster', '.ros-body')
    expect(ec.now, 'Edit Schedule — every reason and the panel as before').toEqual(ec.old)
    expect(errs).toEqual([])
  })
})
