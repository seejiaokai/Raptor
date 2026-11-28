/* THE DECIDED ONE READS PLAINLY AS PICKED, IN A REAL BROWSER (his D2881, 28 Nov 26 — "A, solid + cyan ring"; drawing of
   record docs/mock/2026-11-27-decide-buttons/img/trio-E3-*.png; [LW-DECIDE-LOOK]). The unit tests pin the classes; only a
   browser draws the look, so here: the decided Approve or Refuse wears the window's cyan ring (2px, offset 2px), and with
   the keyboard on it ONE ring a little thicker (3px) — never two rings (his D842), never a ring the keys leave unchanged;
   the other one is grey (rgb(125,135,148)), and with the keyboard on it the app's cyan focus ring sits on its own edge, so
   it never wears the decided one's ring (D1646, D1771); every decide button's mark and word stand inside its edge (his
   D1387) — in the one-day window and the day's list at 360 and 402 wide, and in Approvals at 1536, whose desktop buttons
   keep their 100 width (D1427, D2881 "size unchanged"). Runs once, in the desktop project, setting each width itself. */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { lwRole, openLeaveWar } from './app'

const P = 'slipway'
const T = (id: string) => `[data-testid="${id}"]`
const ACCENT = 'rgb(59, 198, 232)'
const GREY = 'rgb(125, 135, 148)'
/* Arial's widths on every machine (as wholeleave-leavewar.spec.ts): close to Apple's on his iPhone, and the same here and on
   GitHub's Linux machines (Liberation Sans), so "inside the edge" is asserted outright wherever it runs */
const ARIAL = '#page-leavewar, #page-leavewar * { font-family: Arial, "Liberation Sans", sans-serif !important }'

test.beforeEach(async ({ page }) => {
  test.skip(test.info().project.name !== 'lw-desktop', 'sets each width itself — once is enough')
  await openLeaveWar(page, 'a')
  await lwRole(page, 'admin')
  await page.addStyleTag({ content: ARIAL })
})

const place = (page: Page, d: string, code: string, who = P) =>
  page.evaluate(({ p, d, code }) => { if (!(window as any).lwSetCell(p, d, code)) throw new Error('not placed ' + d) }, { p: who, d, code })
async function openDay(page: Page, d: string, sheet = 'bid-picker') {
  await page.locator(T('month-FEB')).click()
  const c = page.locator(T(`cell-${P}-${d}`))
  await c.waitFor({ state: 'attached' })
  await c.scrollIntoViewIfNeeded()
  await c.click()
  await expect(page.locator(T(sheet))).toBeVisible()
}
async function close(page: Page) {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
}

/** the outline as drawn, and how far the mark's left and the word's right stand inside the button's edge */
const look = (b: Locator) => b.evaluate(el => {
  const cs = getComputedStyle(el), r = el.getBoundingClientRect()
  const inL = r.left + parseFloat(cs.borderLeftWidth), inR = r.right - parseFloat(cs.borderRightWidth)
  const mark = el.querySelector('svg.dec-ic')!.getBoundingClientRect()
  /* the words' own box: every text node the button shows (Approvals' hidden longer word is a ::after, never a text node) */
  let right = -Infinity
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.textContent?.trim()) continue
    const range = document.createRange(); range.selectNodeContents(n)
    right = Math.max(right, range.getBoundingClientRect().right)
  }
  return {
    outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, offset: cs.outlineOffset,
    color: cs.color, width: r.width, markIn: mark.left - inL, wordIn: inR - right,
  }
})
async function inside(b: Locator, what: string) {
  const l = await look(b)
  expect(l.markIn, `${what}: the mark inside the edge`).toBeGreaterThanOrEqual(1)
  expect(l.wordIn, `${what}: the word inside the edge`).toBeGreaterThanOrEqual(1)
}
/** the decided pair: the lit one ringed (and 3px with the keys on it), the other grey (its focus ring on its own edge) */
async function pair(page: Page, lit: Locator, other: Locator, where: string) {
  const a = await look(lit)
  expect(a.outline, `${where}: the decided one wears the window's ring`).toBe(`solid 2px ${ACCENT}`)
  expect(a.offset).toBe('2px')
  expect((await look(other)).color, `${where}: the other one grey`).toBe(GREY)
  await inside(lit, `${where} lit`); await inside(other, `${where} grey`)
  /* THE KEYBOARD (D842, D1771): real keys between the pair (Approve stands first), so the browser treats the focus as
     the keyboard's */
  const litFirst = await lit.evaluate((a, b) => !!(a.compareDocumentPosition(b as Node) & Node.DOCUMENT_POSITION_FOLLOWING), await other.elementHandle())
  const [first, second] = litFirst ? [lit, other] : [other, lit]
  await first.focus()
  await page.keyboard.press('Tab')
  await expect(second).toBeFocused()
  await check(second === lit)
  await page.keyboard.press('Shift+Tab')
  await expect(first).toBeFocused()
  await check(first === lit)
  async function check(onLit: boolean) {
    if (onLit) {
      const k = await look(lit)
      expect(k.outline, `${where}: the keys on the decided one — one ring, a little thicker`).toBe(`solid 3px ${ACCENT}`)
      expect(k.offset).toBe('2px')
    } else {
      const g = await look(other)
      expect(g.outline, `${where}: the keys on the grey one — the app's cyan, never the browser's`).toMatch(new RegExp(`^solid \\d+(\\.\\d+)?px ${ACCENT.replace(/[()]/g, '\\$&')}$`))
      expect(g.offset, `${where}: on its own edge, never the decided one's ring`).not.toBe('2px')
    }
  }
}

for (const width of [360, 402]) {
  test(`${width} wide: the one-day window and the day's list — the decided one ringed, the other grey, all inside the edge`, async ({ page }) => {
    await page.setViewportSize({ width, height: 860 })
    /* the one-day window: a bid approved, then opened again */
    await place(page, '2026-02-10', 'LL')
    await openDay(page, '2026-02-10')
    await inside(page.locator(T('decide-approve')), 'waiting Approve'); await inside(page.locator(T('decide-refuse')), 'waiting Refuse')
    await page.locator(T('decide-approve')).click()
    if (await page.locator(T('bid-picker')).isVisible()) await close(page)
    await openDay(page, '2026-02-10')
    await expect(page.locator(T('decide-approve'))).toHaveText('Approved')
    await pair(page, page.locator(T('decide-approve')), page.locator(T('decide-refuse')), 'the window, approved')
    await close(page)
    /* …and refused: the longer "Refused" lit */
    await place(page, '2026-02-12', 'LL')
    await openDay(page, '2026-02-12')
    await page.locator(T('decide-refuse')).click()
    if (await page.locator(T('bid-picker')).isVisible()) await close(page)
    await openDay(page, '2026-02-12')
    await expect(page.locator(T('decide-refuse'))).toHaveText('Refused')
    await pair(page, page.locator(T('decide-refuse')), page.locator(T('decide-approve')), 'the window, refused')
    await close(page)
    /* the day's list: an approved morning and a refused afternoon on one day */
    await place(page, '2026-02-17', '*LL')
    await openDay(page, '2026-02-17')
    await page.locator(T('decide-approve')).click()
    if (await page.locator(T('bid-picker')).isVisible()) await close(page)
    await place(page, '2026-02-17', 'OL*')
    await openDay(page, '2026-02-17', 'daylist-sheet')
    const list = page.locator(T('daylist-sheet'))
    const refuseBid = list.locator('[data-testid^="dl-refuse-"]:not(.dec-off)').last()
    await refuseBid.click()
    if (!(await list.isVisible())) await openDay(page, '2026-02-17', 'daylist-sheet')
    const lit = list.locator('.dchip.dec.dec-ring'), off = list.locator('.dchip.dec.dec-off')
    await expect(lit).toHaveCount(2); await expect(off).toHaveCount(2)
    await expect(lit.nth(0)).toHaveText('Approved'); await expect(lit.nth(1)).toHaveText('Refused')
    await pair(page, lit.nth(0), off.nth(0), "the day's list, approved")
    await pair(page, lit.nth(1), off.nth(1), "the day's list, refused")
  })
}

test('1536 wide: Approvals — the decided one ringed, the other grey, both 100 wide, all inside the edge', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 864 })
  for (const d of ['2026-02-10', '2026-02-12', '2026-02-16']) await place(page, d, 'LL')
  await page.getByTestId('lw-tab-approvals').click()
  await expect(page.getByTestId('approvals-page')).toBeVisible()
  const lines = page.locator(`${T('approvals-page')} ${T(`appr-line-${P}`)}`)
  const one = lines.filter({ hasText: /10 Feb/ }), two = lines.filter({ hasText: /12 Feb/ })
  await expect(one).toHaveCount(1); await expect(two).toHaveCount(1)
  const widths = async (why: string) => {
    for (const b of await page.locator(`${T('approvals-page')} .appr-ok, ${T('approvals-page')} .appr-no`).all()) {
      expect(Math.round((await look(b)).width), why).toBe(100)
    }
  }
  await widths('the built width, 100 (D1427)')
  await inside(one.getByTestId('appr-approve'), 'waiting Approve')
  await one.getByTestId('appr-approve').click()
  await two.getByTestId('appr-refuse').click()
  await expect(one.getByTestId('appr-approve')).toHaveText('Approved')
  await expect(two.getByTestId('appr-refuse')).toHaveText('Refused')
  await widths('still 100 when lit or grey')
  await pair(page, one.getByTestId('appr-approve'), one.getByTestId('appr-refuse'), 'Approvals, approved')
  await pair(page, two.getByTestId('appr-refuse'), two.getByTestId('appr-approve'), 'Approvals, refused')
})
