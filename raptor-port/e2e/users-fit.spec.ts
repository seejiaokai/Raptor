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
