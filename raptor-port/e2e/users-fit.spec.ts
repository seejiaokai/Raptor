/* [ROLE-BOX-CUT-IPHONE] (his D2305, 22 Nov 26 — "Ends [ROLE-BOX-CUT-IPHONE]'s cut words; its fit test still owed"; batch 1's
   second half §4 item 9): on his iPhone's width (402), a person's opened row on Admin → Users — every Role choice
   ("Member", "Admin", "Master admin") fits its box, and every squadron line ("142 Home squadron", "149 None · View ·
   Plan", "Full access", the grey line under it) fits the row: no text wider than its box, each line's buttons on one row.
   Measured in a real browser — jsdom has no layout. Eight squadrons (D2321 — a line per squadron; picture f5b-p), made
   through the real door by the bridge's raptorAddUnit, as Saber; the roles fold opened, its grid within the row too. */
import { expect, test, type Page } from '@playwright/test'
import { login } from './app'

async function users(page: Page) {
  await page.evaluate(() => (window as any).go('admin'))
  await page.waitForFunction(() => (window as any).CURPAGE === 'admin')
  const cat = page.locator('#page-admin .adm-cat', { hasText: 'Users' }).first()
  if (await cat.isVisible()) await cat.click()
  await page.waitForSelector('#accList')
}
/* every text in the opened row that is wider than its own box, and every squadron line whose buttons wrap */
const misfits = (page: Page) => page.evaluate(() => {
  const ed = document.querySelector<HTMLElement>('#page-admin .acc-edit')!
  const er = ed.getBoundingClientRect()
  const bad: string[] = []
  const ctx = document.createElement('canvas').getContext('2d')!
  /* the Role box: each choice's words against the box's room for them (its width less its padding and its arrow) */
  const role = ed.querySelector<HTMLSelectElement>('#accEdRole, #accGiveRole')!
  const cs = getComputedStyle(role)
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  const room = role.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
  for (const o of role.options) {
    const w = ctx.measureText(o.textContent || '').width
    if (w > room + 0.5) bad.push(`Role "${o.textContent}" ${w.toFixed(1)} > ${room.toFixed(1)}`)
  }
  if (role.getBoundingClientRect().right > er.right + 0.5) bad.push('the Role box runs past the row')
  /* the squadron lines: the number, "Home squadron" / "Full access", each button, the grey line under */
  const sq = ed.querySelector<HTMLElement>('[data-testid="acc-sq"]')!
  for (const el of sq.querySelectorAll<HTMLElement>('.acc-sq-n, .acc-sq-home, .abtn, .acc-sq-note')) {
    if (el.scrollWidth > el.clientWidth + 1) bad.push(`"${el.textContent}" ${el.scrollWidth} > ${el.clientWidth}`)
    if (el.getBoundingClientRect().right > er.right + 0.5) bad.push(`"${el.textContent}" runs past the row`)
  }
  for (const g of sq.querySelectorAll<HTMLElement>('.acc-acts')) {
    const tops = new Set([...g.children].map(b => Math.round(b.getBoundingClientRect().top)))
    if (tops.size !== 1) bad.push(`${g.getAttribute('aria-label')}: its buttons on ${tops.size} rows`)
  }
  return { bad, lines: sq.querySelectorAll('.acc-sq-n').length, editor: Math.round(er.height) }
})

test('[ROLE-BOX-CUT-IPHONE] at 402: every Role choice and every squadron line fits — two squadrons, then eight', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 })
  await login(page)
  await users(page)
  /* Saber opens Hunter (142's admin): Member · Admin · Master admin; 142 Home squadron; 149 None · View · Plan */
  await page.locator('#accList [data-person="prowler"] .acc-tap').click()
  await page.waitForSelector('#page-admin .acc-edit [data-testid="acc-sq"]')
  let m = await misfits(page)
  expect(m.lines).toBe(2)
  expect(m.bad).toEqual([])
  /* Plan picked: its line under the buttons wraps inside the row, never past it */
  await page.locator('[data-testid="acc-sq"] .acc-acts[aria-label="Access to 149"] [data-line="plan"]').click()
  expect((await misfits(page)).bad).toEqual([])
  /* Master admin picked: every other squadron reads "Full access" */
  await page.selectOption('#accEdRole', 'master')
  expect((await misfits(page)).bad).toEqual([])
  /* the roles fold opened: its grid within the row (picture k2) */
  await page.selectOption('#accEdRole', 'admin')
  await page.locator('[data-testid="acc-roles"] summary').click()
  const t = await page.evaluate(() => {
    const d = document.querySelector<HTMLElement>('[data-testid="acc-roles"]')!, tb = d.querySelector<HTMLElement>('table')!
    return { table: tb.scrollWidth, room: d.clientWidth, right: tb.getBoundingClientRect().right, edge: document.querySelector('#page-admin .acc-edit')!.getBoundingClientRect().right }
  })
  expect(t.table).toBeLessThanOrEqual(t.room + 1)
  expect(t.right).toBeLessThanOrEqual(t.edge + 0.5)
  await page.click('#accEdCancel')

  /* eight squadrons (D2321): 150 to 155 made through the real door, Hunter their first admin (Plan of each) */
  for (let n = 150; n <= 155; n++) {
    const r = await page.evaluate(x => (window as any).raptorAddUnit(String(x), 'acad2'), n)
    expect(r, `${n} made`).toMatchObject({ ok: true })
  }
  await page.locator('#accList [data-person="prowler"] .acc-tap').click()
  await page.waitForSelector('#page-admin .acc-edit [data-testid="acc-sq"]')
  m = await misfits(page)
  expect(m.lines).toBe(8)
  expect(m.bad).toEqual([])
  /* and Ranger, a member: Plan greyed with its line, "Plan is for admins only." (D2306) — within the row */
  await page.click('#accEdCancel')
  await page.locator('#accList [data-person="bane"] .acc-tap').click()
  await page.waitForSelector('#page-admin .acc-edit [data-testid="acc-sq"]')
  expect((await misfits(page)).bad).toEqual([])
})

/* THE FOLD SITS WHERE IT WAS DRAWN (the drawing check of 23 Nov 26, its line 4 — k1, k3, k4, k5, rB1–rB4: the build left
   6px more than the drawing): draw-roles.mjs gives the squadron lines `margin: 12px 0 4px`, the grey line under a squadron
   line `margin: -2px 0 2px`, and the fold `margin: 4px 0 12px` — so from the last grey line's foot to "▸ What each role
   allows" is 2 + 4 = 6px (the lines' foot and the fold's top meet in one 4px), and from the Role box's foot to the first
   line 12px, as before. Ranger, a member, opened by Saber: his 149 line ends in "Plan is for admins only." (D2306). */
/* HIS D2401 (24 Nov 26 — the drawing docs/mock/2026-11-24-msq-new-words/filter-look/): a filter that is on looks switched
   on, in the app's own recipe (.fchip.on, the Logic page's filter): pale blue, blue words and funnel, blue border; on
   Admin → Users as tall as the search box beside it, on or off. No glow. Red first: 30 high, solid blue when on. */
const FILTER_ON = { bg: 'rgba(59, 198, 232, 0.16)', border: 'rgba(59, 198, 232, 0.6)' }
const lookOf = (page: Page, sel: string) => page.evaluate(s => {
  const e = document.querySelector<HTMLElement>(s)!
  const c = getComputedStyle(e)
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
  const probe = document.createElement('i'); probe.style.color = accent; document.body.appendChild(probe)
  const blue = getComputedStyle(probe).color; probe.remove()
  return { h: Math.round(e.getBoundingClientRect().height), bg: c.backgroundColor, border: c.borderTopColor, color: c.color, blue, shadow: c.boxShadow,
    icon: getComputedStyle(e.querySelector('svg')!).stroke, text: (e.textContent || '').trim() }
}, sel)
for (const [w, h, tag] of [[1536, 864, 'desktop'], [402, 874, 'phone']] as const) {
  test(`D2401: Admin → Users' Filter is as tall as the search box, on or off, and lit in the chips' look (${tag})`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h })
    await login(page)
    await users(page)
    const search = () => page.evaluate(() => Math.round(document.querySelector<HTMLElement>('#page-admin .od-find')!.getBoundingClientRect().height))
    expect(await search()).toBe(36)
    expect((await lookOf(page, '#accFilter')).h, 'off').toBe(36)
    await page.locator('#accFilter').click()
    await page.locator('#accFilterPanel [data-ftick="seat:Pilots"]').click()
    await page.keyboard.press('Escape')
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await page.mouse.move(0, 0)
    const on = await lookOf(page, '#accFilter')
    expect(on.text).toBe('Filter · 1')
    expect(on.h, 'on').toBe(36)
    expect(on.bg).toBe(FILTER_ON.bg)
    expect(on.border).toBe(FILTER_ON.border)
    expect(on.color, 'blue words').toBe(on.blue)
    expect(on.icon, 'a blue funnel').toBe(on.blue)
    expect(on.shadow, 'nothing glows').toBe('none')
  })
}
test('D2401: the Inputs filter button on a phone is lit the same while a filter is set, its small number kept', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 })
  await login(page)
  await page.evaluate(() => (window as any).go('inputs'))
  await page.waitForSelector('#inFiltersBtn')
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await page.locator('#inListBtn').click()
  const off = await lookOf(page, '#inFiltersBtn')
  expect(off.bg).not.toBe(FILTER_ON.bg)
  await page.locator('#inFiltersBtn').click()
  await page.locator('#inFSearch').fill('a')
  await page.locator('#inFiltersBtn').click()
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.mouse.move(0, 0)
  const on = await lookOf(page, '#inFiltersBtn')
  expect(on.bg).toBe(FILTER_ON.bg)
  expect(on.border).toBe(FILTER_ON.border)
  expect(on.color).toBe(on.blue)
  expect(on.icon).toBe(on.blue)
  expect(on.shadow).toBe('none')
  expect(on.h, 'its height does not change').toBe(off.h)
  expect(await page.locator('#inFiltersBtn .inputs-filter-count').textContent()).toBe('1')
})

for (const [w, h, tag] of [[1536, 864, 'desktop'], [402, 874, 'phone']] as const) {
  test(`the roles fold sits 6px under the last squadron line's grey line, as drawn (${tag})`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h })
    await login(page)
    await users(page)
    await page.locator('#accList [data-person="bane"] .acc-tap').click()
    await page.waitForSelector('#page-admin .acc-edit [data-testid="acc-roles"]')
    const g = await page.evaluate(() => {
      const ed = document.querySelector<HTMLElement>('#page-admin .acc-edit')!
      const notes = [...ed.querySelectorAll<HTMLElement>('[data-testid="acc-sq"] .acc-sq-note')]
      const last = notes[notes.length - 1]
      const sum = ed.querySelector<HTMLElement>('[data-testid="acc-roles"] summary')!
      const sq = ed.querySelector<HTMLElement>('[data-testid="acc-sq"]')!
      const two = ed.querySelector<HTMLElement>('.adm-2col')!
      return {
        note: last ? last.textContent : null,
        gap: last ? Math.round(sum.getBoundingClientRect().top - last.getBoundingClientRect().bottom) : null,
        above: Math.round(sq.getBoundingClientRect().top - two.getBoundingClientRect().bottom),
      }
    })
    expect(g.note).toBe('Plan is for admins only.')
    expect(g.gap, 'the grey line\'s foot to the fold').toBe(6)
    expect(g.above, 'the Role box\'s foot to the first squadron line, unchanged').toBe(12)
  })
}
