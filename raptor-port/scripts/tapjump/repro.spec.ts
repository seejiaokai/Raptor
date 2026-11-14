/* TEMPORARY — [TAP-JUMP-SWEEP] chat 70: each finding of chat 69's look-over pressed again, one at a time, the place
   photographed before and after with the tap marked (red ring) and where the control went (blue dashed box). Not
   committed as a test. */
import { test, type Locator, type Page } from '@playwright/test'
import { appendFileSync, mkdirSync } from 'node:fs'
import { go, login, lwRole, openLeaveWar, openTracker } from '../../e2e/app'

const OUT = process.env.PICS_OUT || 'C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/fbe444b7-1f71-48c9-8891-082a0831ca04/scratchpad/repro'
mkdirSync(OUT, { recursive: true })

async function mark(page: Page, x: number, y: number, box: { x: number; y: number; width: number; height: number } | null) {
  await page.evaluate(({ x, y, box }) => {
    const d = document.createElement('div')
    d.className = '__tjmark'
    d.style.cssText = `position:fixed;left:${x - 20}px;top:${y - 20}px;width:40px;height:40px;border:3px solid #e0102a;border-radius:50%;z-index:2147483647;pointer-events:none;box-shadow:0 0 0 2px #fff`
    document.body.appendChild(d)
    if (box) {
      const b = document.createElement('div')
      b.className = '__tjmark'
      b.style.cssText = `position:fixed;left:${box.x - 3}px;top:${box.y - 3}px;width:${box.width + 6}px;height:${box.height + 6}px;border:3px dashed #1060ff;z-index:2147483646;pointer-events:none`
      document.body.appendChild(b)
    }
  }, { x, y, box })
}
const unmark = (page: Page) => page.evaluate(() => document.querySelectorAll('.__tjmark').forEach(e => e.remove()))

/* press the control the way a person does, where it is, and see what is under the same spot afterwards */
async function tap(page: Page, loc: Locator, name: string, opts: { wait?: number; noScroll?: boolean } = {}) {
  const proj = test.info().project.name
  const touch = proj === 'phone'
  const el = await loc.first().elementHandle()
  if (!el) throw new Error(`${name}: not found`)
  if (!opts.noScroll) await el.evaluate(e => { const r = e.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 10 || r.left < 0 || r.right > innerWidth) e.scrollIntoView({ block: 'center', inline: 'nearest' }) })
  await page.waitForTimeout(500)
  const b0 = (await el.boundingBox())!
  const x = b0.x + b0.width / 2, y = b0.y + b0.height / 2
  const txt0 = ((await el.textContent()) || '').trim().replace(/\s+/g, ' ').slice(0, 40)
  const sc0 = await page.evaluate(() => [scrollX, scrollY])
  await mark(page, x, y, null)
  await page.screenshot({ path: `${OUT}/${proj}-${name}-a.png` })
  await unmark(page)
  if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y)
  await page.waitForTimeout(opts.wait ?? 900)
  const live = await el.evaluate(e => e.isConnected && e.getClientRects().length > 0).catch(() => false)
  const b1 = live ? await el.boundingBox() : null
  const txt1 = live ? ((await el.textContent()) || '').trim().replace(/\s+/g, ' ').slice(0, 40) : '(gone)'
  const under = await page.evaluate(p => {
    const at = document.elementFromPoint(p.x, p.y)
    if (!at) return ''
    const c = at.closest('button, [role=button], a, td, [data-testid], .puck, g') || at
    return `${c.tagName.toLowerCase()}${c.getAttribute('data-testid') ? '#' + c.getAttribute('data-testid') : ''}: "${(c.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)}"`
  }, { x, y })
  const same = live ? await el.evaluate((e, p) => { const at = document.elementFromPoint(p.x, p.y); return !!at && (e.contains(at) || at.contains(e)) }, { x, y }) : false
  const sc1 = await page.evaluate(() => [scrollX, scrollY])
  await mark(page, x, y, b1)
  await page.screenshot({ path: `${OUT}/${proj}-${name}-b.png` })
  await unmark(page)
  const dpr = await page.evaluate(() => devicePixelRatio)
  const res = { proj, name, dpr, vw: page.viewportSize(), at: [Math.round(x), Math.round(y)], txt0, txt1,
    dx: b1 ? Math.round((b1.x - b0.x) * 10) / 10 : null, dy: b1 ? Math.round((b1.y - b0.y) * 10) / 10 : null,
    dw: b1 ? Math.round((b1.width - b0.width) * 10) / 10 : null, stillUnderFinger: same, under,
    pageScrolled: [sc1[0]! - sc0[0]!, sc1[1]! - sc0[1]!] }
  appendFileSync(`${OUT}/results.jsonl`, JSON.stringify(res) + '\n')
  console.log('RESULT', JSON.stringify(res))
  return res
}

const isPhone = () => test.info().project.name === 'phone'

/* 1 — Inputs → Calendar: pressing a day */
test('01 inputs calendar day', async ({ page }) => {
  await login(page, 'user'); await go(page, 'inputs')
  await tap(page, page.locator('.ib-day.is-today'), '01-inputs-today')
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  await tap(page, page.locator('.ib-day:not(.is-we):not(.is-today)').nth(3), '01-inputs-weekday')
})

/* 2 — Leave War one-day window: "Pick a range" */
test('02 lw pick a range', async ({ page }) => {
  await login(page, 'user'); await go(page, 'leavewar')
  await page.waitForSelector('[data-testid="row-slipway"]')
  const cell = page.locator('td.act[data-testid^="cell-bane-"]:not(.locked)').nth(4)
  await cell.scrollIntoViewIfNeeded(); await page.waitForTimeout(300)
  if (isPhone()) await page.touchscreen.tap(...(await cell.boundingBox().then(b => [b!.x + b!.width / 2, b!.y + b!.height / 2] as [number, number])))
  else await cell.click()
  await page.waitForSelector('[data-testid="span-range"]', { timeout: 5000 })
  await page.waitForTimeout(500)
  await tap(page, page.getByTestId('span-range'), '02-pick-range', { noScroll: true })
})

/* 3 — the week buttons on the schedule */
test('03 schedule week button', async ({ page }) => {
  test.skip(isPhone())
  await login(page, 'user'); await go(page, 'viewsched')
  const wk = page.locator('button.wk')
  const n = await wk.count()
  const cur = await wk.evaluateAll(bs => bs.findIndex(b => /\b(on|cur|sel|active)\b/.test(b.className)))
  console.log('WEEKS', n, 'current', cur, JSON.stringify(await wk.allTextContents()))
  await tap(page, wk.nth(Math.max(0, cur - 1)), '03-week-before')
  await tap(page, wk.nth(Math.min(n - 1, cur + 2)), '03-week-after')
})

/* 4 — pressing a person on the schedule */
test('04 schedule person', async ({ page }) => {
  await login(page, 'user'); await go(page, 'viewsched')
  const pucks = page.locator('#vWeek .puck')
  const n = await pucks.count()
  console.log('PUCKS', n)
  await tap(page, pucks.nth(Math.floor(n / 3)), '04-person-a')
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  await tap(page, pucks.nth(Math.floor(n * 2 / 3)), '04-person-b')
})

/* 5 — the highlight tabs */
test('05 highlight tabs', async ({ page }) => {
  await login(page, 'user'); await go(page, 'viewsched')
  if (isPhone()) { const t = page.locator('.hl-tog').first(); if (await t.isVisible().catch(() => false)) { await t.click(); await page.waitForTimeout(500) } }
  await tap(page, page.locator('button.hl-gtab', { hasText: 'CAT' }), '05-hl-cat')
  await tap(page, page.locator('button.hl-gtab', { hasText: 'Type' }), '05-hl-type')
})

/* 6 — Leave War, phone: pressing a day low on the screen */
test('06 lw day low on screen', async ({ page }) => {
  await login(page, 'a'); await go(page, 'leavewar')
  await page.waitForSelector('[data-testid="row-slipway"]')
  const cell = page.locator('td.act[data-testid^="cell-slash-"]').nth(3)
  await tap(page, cell, '06-lw-day-low', { wait: 1200 })
})

/* 7 — Leave War, PC: a locked day (member) and an event's band (scheduler) */
test('07 lw locked day and band', async ({ page }) => {
  await login(page, 'user'); await go(page, 'leavewar')
  await page.waitForSelector('[data-testid="row-slipway"]')
  const locked = page.locator('td.act.locked[data-testid^="cell-bane-"]')
  console.log('LOCKED', await locked.count())
  if (await locked.count()) await tap(page, locked.first(), '07-lw-locked')
})
test('07b lw event band', async ({ page }) => {
  await login(page, 'a'); await go(page, 'leavewar')
  await page.waitForSelector('[data-testid="row-slipway"]')
  await tap(page, page.locator('[data-testid^="event-blocked-"]').first(), '07-lw-band')
})

/* 8 — Approvals: Approve all */
test('08 approvals approve all', async ({ page }) => {
  await login(page, 'a'); await go(page, 'leavewar')
  await page.waitForSelector('[data-testid="row-slipway"]')
  await page.getByTestId('lw-tab-approvals').click(); await page.waitForTimeout(700)
  await tap(page, page.getByTestId('appr-approve-all'), '08-approve-all')
})

/* 9 — Tracker: pressing an event box */
test('09 tracker event box', async ({ page }) => {
  await login(page, 'user'); await go(page, 'tracker'); await page.waitForSelector('#flowSvg'); await page.waitForTimeout(800)
  const ids = await page.locator('#flowSvg g[id]').evaluateAll(gs => gs.map(g => g.id).slice(0, 30))
  console.log('GIDS', JSON.stringify(ids))
  await tap(page, page.locator('#flowSvg g[id="T-01"]'), '09-tracker-T01', { wait: 1200 })
  await page.keyboard.press('Escape'); await page.waitForTimeout(500)
  await tap(page, page.locator('#flowSvg g[id="AVI-01"]'), '09-tracker-AVI01', { wait: 1200 })
})

/* 10 — Edit Schedule: the AIRCREW tab of the day's side list */
test('10 edit schedule aircrew tab', async ({ page }) => {
  test.skip(!isPhone())
  await login(page, 'a'); await go(page, 'editsched')
  const tabs = page.locator('.ros-tab')
  console.log('ROSTABS', await tabs.count(), JSON.stringify(await tabs.allTextContents()))
  if (await tabs.count()) await tap(page, page.locator('.ros-tab', { hasText: 'AIRCREW' }), '10-aircrew-tab')
})

/* 11 — the top bar: the role chip and Sync */
test('11 top bar', async ({ page }) => {
  test.skip(isPhone())
  await login(page, 'a'); await go(page, 'viewsched')
  await tap(page, page.locator('#roleBadge'), '11-role-chip')
  await tap(page, page.locator('#fastSync'), '11-sync')
})

/* 12 — Quals: Edit quals */
test('12 quals edit', async ({ page }) => {
  await login(page, 'a'); await go(page, 'quals')
  const e = page.locator('#qEdit')
  if (await e.isVisible().catch(() => false)) { await e.click(); await page.waitForTimeout(500) }
  await tap(page, page.locator('#qEditQuals'), '12-edit-quals')
})

/* 13 — Edit Schedule: the side list's people and inputs (in the raw list, not in chat 69's twelve) */
test('13 edit schedule side list', async ({ page }) => {
  await login(page, 'a'); await go(page, 'editsched')
  const cards = page.locator('button.sanscard')
  console.log('SANSCARDS', await cards.count(), JSON.stringify((await cards.allTextContents()).slice(0, 12)))
  if (await cards.count()) await tap(page, cards.filter({ hasText: 'Rebel' }).first(), '13-side-person')
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  const inp = page.locator('button.inpedit')
  console.log('INPEDIT', await inp.count(), JSON.stringify((await inp.allTextContents()).slice(0, 12)))
  if (await inp.count()) await tap(page, inp.filter({ hasText: /^LL$/ }).first(), '13-side-input')
})

/* 14 — the schedule's date, phone ("Jul 14") */
test('14 schedule date', async ({ page }) => {
  await login(page, 'a'); await go(page, 'viewsched')
  const d = page.locator('.di-open')
  console.log('DIOPEN', await d.count())
  if (await d.count()) await tap(page, d.first(), '14-day-date')
})

/* 15 — the Tracker opened the way the scheduler does */
/* round 2 */
async function tagNode(page: Page, label: string) {
  await page.evaluate(l => { const g = [...document.querySelectorAll('#nodeLayer g')].find(x => (x.textContent || '').trim().startsWith(l)); g?.setAttribute('data-tj', l) }, label)
  return page.locator(`[data-tj="${label}"]`)
}
test('09r tracker event box', async ({ page }) => {
  await login(page, 'user'); await go(page, 'tracker'); await page.waitForSelector('#nodeLayer'); await page.waitForTimeout(1000)
  await tap(page, await tagNode(page, isPhone() ? 'ACG-01' : 'T-01'), '09-tracker-box', { wait: 1400, noScroll: true })
})
test('04r schedule person in view', async ({ page }) => {
  await login(page, 'a'); await go(page, 'viewsched'); await page.waitForTimeout(800)
  const idx = await page.locator('#vWeek .puck').evaluateAll(ps => ps.map((p, i) => { const r = p.getBoundingClientRect(); return { i, ok: r.left > 40 && r.right < innerWidth - 60 && r.top > 160 && r.bottom < innerHeight - 60 && r.width > 0 } }).filter(x => x.ok).map(x => x.i))
  console.log('VISIBLE PUCKS', idx.length)
  for (const [k, j] of [[0, 0], [1, Math.floor(idx.length / 2)], [2, idx.length - 1]] as const) {
    await tap(page, page.locator('#vWeek .puck').nth(idx[j]!), `04r-person-${k}`, { noScroll: true, wait: 1000 })
    await page.mouse.click(5, 300); await page.waitForTimeout(500)
  }
})
test('16 lw one-day delete', async ({ page }) => {
  await openLeaveWar(page, 'a'); await lwRole(page, 'admin')
  const cell = (await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"][data-testid$="-2026-02-11"]')].map(e => e.getAttribute('data-testid')!)))[3]!
  const press = async () => { const b = (await page.getByTestId(cell).boundingBox())!; if (isPhone()) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(600) }
  await page.getByTestId(cell).scrollIntoViewIfNeeded(); await press()
  await page.getByTestId('bid-LL').click(); await page.waitForTimeout(500)
  if (await page.getByTestId('span-note').isVisible().catch(() => false)) { await page.getByTestId('bid-LL').click(); await page.waitForTimeout(500) }
  if (!await page.getByTestId('bid-picker').isVisible().catch(() => false)) await press()
  console.log('BUTTONS', JSON.stringify(await page.locator('[data-testid="bid-picker"] button').evaluateAll(bs => bs.map(b => b.getAttribute('data-testid') || b.textContent))))
  await tap(page, page.getByTestId('bid-clear'), '16-lw-delete', { noScroll: true })
})
test('17 lw events list delete', async ({ page }) => {
  await openLeaveWar(page, 'a'); await lwRole(page, 'admin')
  await page.getByTestId('settings-open').click(); await page.waitForTimeout(400)
  await page.getByTestId('settings-events').click(); await page.waitForTimeout(700)
  await tap(page, page.locator('[data-testid^="evdel-"]').first(), '17-events-delete', { noScroll: true })
})
/* round 3 */
test('09s tracker box in view', async ({ page }) => {
  await login(page, 'user'); await go(page, 'tracker'); await page.waitForSelector('#nodeLayer'); await page.waitForTimeout(1200)
  const lbl = await page.evaluate(() => { const gs = [...document.querySelectorAll('#nodeLayer > g')]; const ok = gs.map(g => ({ t: (g.textContent || '').trim().split(/\s+/)[0]!, r: g.getBoundingClientRect() })).filter(o => o.r.width > 0 && o.r.top > 200 && o.r.bottom < innerHeight - 40 && o.r.left > 20 && o.r.right < innerWidth - 20); return ok.length ? ok[Math.floor(ok.length / 2)]!.t : '' })
  console.log('TRK NODE', lbl)
  await tap(page, await tagNode(page, lbl), '09s-tracker-box', { wait: 1400, noScroll: true })
})
test('06r lw cell low on a phone', async ({ page }) => {
  test.skip(!isPhone())
  await login(page, 'a'); await go(page, 'leavewar'); await page.waitForSelector('[data-testid="row-slipway"]'); await page.waitForTimeout(600)
  const id = await page.evaluate(() => { const cs = [...document.querySelectorAll('td.act[data-testid^="cell-"]')]; const c = cs.find(c => { const r = c.getBoundingClientRect(); return r.top > 640 && r.bottom < 800 && r.left > 200 && r.right < 380 }); return c?.getAttribute('data-testid') || '' })
  console.log('LOW CELL', id)
  await tap(page, page.getByTestId(id), '06r-lw-cell-low', { wait: 1200, noScroll: true })
})
test('19 lw member presses a duty cell', async ({ page }) => {
  await login(page, 'user'); await go(page, 'leavewar'); await page.waitForSelector('[data-testid="row-slipway"]'); await page.waitForTimeout(600)
  const c = page.locator('td.act.duty[data-testid^="cell-spaceman-"]', { hasText: 'FO' }).first()
  await tap(page, c, '19-lw-duty-cell', { wait: 1200 })
})
/* round 4 — a decision in the one-day window, and the drag window's Delete */
test('20 lw one-day refuse', async ({ page }) => {
  await openLeaveWar(page, 'a'); await lwRole(page, 'admin')
  const cell = (await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"][data-testid$="-2026-02-12"]')].map(e => e.getAttribute('data-testid')!)))[4]!
  const press = async () => { const b = (await page.getByTestId(cell).boundingBox())!; if (isPhone()) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(600) }
  await page.getByTestId(cell).scrollIntoViewIfNeeded(); await press()
  await page.getByTestId('bid-LL').click(); await page.waitForTimeout(500)
  if (await page.getByTestId('span-note').isVisible().catch(() => false)) { await page.getByTestId('bid-LL').click(); await page.waitForTimeout(500) }
  if (!await page.getByTestId('bid-picker').isVisible().catch(() => false)) await press()
  await tap(page, page.getByTestId('decide-refuse'), '20-lw-refuse', { noScroll: true })
})
test('21 lw drag window delete', async ({ page }) => {
  test.skip(isPhone())
  await openLeaveWar(page, 'a'); await lwRole(page, 'admin')
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"][data-testid$="-2026-01-06"]')].map(e => e.getAttribute('data-testid')!))
  const from = ids[0]!, to = ids[2]!.replace('2026-01-06', '2026-01-08')
  const drag = async () => {
    const a = (await page.getByTestId(from).boundingBox())!, b = (await page.getByTestId(to).boundingBox())!
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
    await page.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 }); await page.mouse.up()
    await page.waitForTimeout(600)
  }
  await drag()
  await page.getByTestId('sel-LL').click(); await page.waitForTimeout(500)
  if (await page.getByTestId('sel-note').isVisible().catch(() => false)) { await page.getByTestId('sel-LL').click(); await page.waitForTimeout(500) }
  if (!await page.getByTestId('select-sheet').isVisible().catch(() => false)) await drag()
  await tap(page, page.getByTestId('sel-delete'), '21-lw-drag-delete', { noScroll: true })
})
test('18 users delete', async ({ page }) => {
  test.skip(isPhone())
  await login(page, 'a'); await page.evaluate(() => (window as any).go('admin')); await page.waitForTimeout(800)
  const rows = page.locator('#page-admin .acc-row[data-person] .acc-main')
  console.log('ACCROWS', await rows.count())
  await rows.nth(5).click(); await page.waitForTimeout(600)
  await tap(page, page.locator('#accEdDel'), '18-users-delete')
})
