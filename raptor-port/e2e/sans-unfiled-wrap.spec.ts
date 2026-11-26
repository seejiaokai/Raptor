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
/* (his D2587, 25 Nov 26: the note never tells the scheduler to file — the second sentence went, D2340's words narrowed) */
const NOTE = 'SANS from Fri 17 Jul: no availability filed'
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
      /* (D2587 shortened the words: at 402 they now fit one line, so the fit above is the test — the two-line check went
         with the long sentence it was written for) */
      expect(b!.lines, `${W}: the board — drawn`).toBeGreaterThanOrEqual(1)
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
      expect(e!.lines, `${W}: Edit Schedule — drawn`).toBeGreaterThanOrEqual(1)
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

/* HIS D2581 / D2582 (25 Nov 26) and D2750 / D2751 (26 Nov 26) — the crew list's SANS section, as drawn
   (docs/mock/2026-11-25-sans-d2588/, scene `col`; pictures col-new-*, col-nopick-*, col-wrap-*): the F / O / A letters of
   what each SANS man offered stand in ONE column, straight after the widest reason; with a place picked his offered hours
   stand on a line of their own under his letter, never cut; with none picked the badge reads "O · 08:00–10:00" whole.
   jsdom has no layout, so the drawing's own measurements live here, on the Scheduler Board's crew list with Friday's
   EXT SQN OFT row armed, at a desktop's 1536 and his iPhone's 402: every badge's left edge within 0.5px of the others,
   every badge right of every puck-and-reason (the column stands after the widest reason), nothing cut, the hours'
   left edge on the letter's, the list never running sideways. The reasons read his D2584 Q2 words. The five filings
   are put straight into the app's inputs (this file proves the layout, not the filing; the walk files through the
   Inputs page). */
const COL_FRI = 4
const COL_KEY = `s:${COL_FRI}.oft.0.+`
/* Friday's filings: Bolt Fly only, Rebel AMT only, Kraken Fly and AMT, Jester OFT 08:00–10:00 (D2750's own case: his
   hours), Zenith OFT all day */
async function fileFriday(page: Page) {
  await page.evaluate(() => {
    const w = window as any
    const add = (person: string, sans: any, s?: number, e?: number) => w.INPUTS.unshift({ person, date: 'Jul 17', allday: s == null,
      ...(s == null ? {} : { s, e }), type: 'SANS Availability', sans, iid: 'e2e-col-' + person, mod: '2026-06-20' })
    add('yeti', { f: true }); add('romeo', { a: true }); add('krait', { f: true, a: true })
    add('ipman', { o: true }, 480, 600); add('vinci', { o: true })
    w.afterSchedMutate(); w.renderEditWeek()
  })
}
async function openBoard(page: Page) {
  await go(page, 'editsched')
  await tap(page, `#eWeek [data-sbday="${COL_FRI}"]`)
  await page.waitForSelector('#schedBoard'); await sleep(700)
}
/* the SANS section as drawn: each row's letters (text, left edge, cut), its puck-and-reason's right edge, its reason */
const read = (page: Page) => page.evaluate(() => {
  const sec = [...document.querySelectorAll('#schedBoard .rall.rsans')].find(x => x.getBoundingClientRect().width > 0) as HTMLElement
  if (!sec) return null
  const cut = (e: Element) => [e, ...e.querySelectorAll('*')].some(x => (x as HTMLElement).scrollWidth > (x as HTMLElement).clientWidth + 0.5)
  const rows = [...sec.querySelectorAll('.rsans-row')].map(r => {
    const pk = r.querySelector('.rpuck') as HTMLElement, b = r.querySelector('.rsans-b') as HTMLElement | null, w = r.querySelector('.rwhy')
    const l = b && b.querySelector('.rsans-l'), h = b && b.querySelector('.rsans-h')
    const txt = (e: Element | null) => e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    const rng = (e: Element | null) => { if (!e || !e.firstChild) return null; const x = document.createRange(); x.selectNodeContents(e); return [...x.getClientRects()][0] || null }
    return { id: pk.dataset.person, why: w && w.getBoundingClientRect().width > 0 ? txt(w) : '', letters: txt(b),
      l: txt(l), h: txt(h), lLeft: rng(l)?.left ?? null, hLeft: rng(h)?.left ?? null, hTop: rng(h)?.top ?? null, lBottom: rng(l)?.bottom ?? null,
      bLeft: b ? b.getBoundingClientRect().left : null, pkRight: pk.getBoundingClientRect().right, cut: b ? cut(b) : false }
  })
  return { rows, spill: sec.scrollWidth - sec.clientWidth }
})

for (const [name, vp] of [['desktop', { width: 1536, height: 1000 }], ['phone', { width: 402, height: 874 }]] as const) {
  test.describe(`the SANS section's letters and hours — ${name}`, () => {
    test.use({ viewport: vp, ...(name === 'phone' ? { hasTouch: true, isMobile: true } : {}) })

    test('no place picked: Jester\'s badge whole on one line, "O · 08:00–10:00"', async ({ page }) => {
      await signIn(page); await fileFriday(page); await openBoard(page)
      const s = await read(page)
      const j = s!.rows.find(r => r.id === 'ipman')!
      expect(j.letters).toBe('O · 08:00–10:00')
      expect(j.h, 'not split with nothing picked').toBe('')
      expect(j.cut, 'not cut').toBe(false)
    })

    test('a place picked: the letters in one column after the widest reason, Jester\'s hours under his letter, nothing cut', async ({ page }) => {
      await signIn(page); await fileFriday(page); await openBoard(page)
      await tap(page, `#schedBoard [data-fill="${COL_KEY}"]:visible`); await sleep(500)
      expect(await page.evaluate(() => (window as any).ARM && (window as any).ARM.key)).toBe(COL_KEY)
      const s = await read(page)
      expect(s, 'the SANS section is drawn').not.toBeNull()
      const by = (id: string) => s!.rows.find(r => r.id === id)!
      /* his D2584 Q2 words */
      expect(by('yeti').why).toBe('SANS — offered Fly only, not OFT')
      expect(by('romeo').why).toBe('SANS — offered AMT only, not OFT')
      expect(by('krait').why).toBe('SANS — offered Fly and AMT only, not OFT')
      /* D2581 / D2582: one column, straight after the widest reason */
      const withB = s!.rows.filter(r => r.bLeft != null)
      expect(withB.length, 'five men wear letters').toBeGreaterThanOrEqual(5)
      const lefts = withB.map(r => r.bLeft!)
      expect(Math.max(...lefts) - Math.min(...lefts), `the letters' left edges ${JSON.stringify(lefts)}`).toBeLessThanOrEqual(0.5)
      const widest = Math.max(...s!.rows.map(r => r.pkRight))
      expect(Math.min(...lefts), 'the column stands after every puck and its reason').toBeGreaterThanOrEqual(widest - 0.5)
      /* D2750 / D2751: Jester's hours on a second line under his letter, whole */
      const j = by('ipman')
      expect([j.l, j.h]).toEqual(['O', '08:00–10:00'])
      expect(Math.abs(j.hLeft! - j.lLeft!), 'the hours start under the letter').toBeLessThanOrEqual(0.5)
      expect(j.hTop!, 'on the next line').toBeGreaterThanOrEqual(j.lBottom! - 0.5)
      expect(s!.rows.filter(r => r.cut).map(r => r.id), 'no badge cut').toEqual([])
      expect(s!.spill, 'the list never runs sideways').toBeLessThanOrEqual(1)
    })
  })
}
