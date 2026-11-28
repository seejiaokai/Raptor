// d1 — desktop (Chromium 1536 × 864): Astra's scenarios 1, 5 (desktop), 22 (desktop), the question cases "picking from a
// page that disappears", "a Leave War window already open", "own-page shortcuts" (bell) as Ranger with View of 149;
// 2, the OIL list and Undo as Hunter with View of 149; 24 (desktop) as Saber; then Hunter given Plan of 149: 7 and 9.
// World: fresh demo data; every right given by Saber on Admin → Users, presses only.
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, barPick, go, grant, admCat, openRow, finish, note, facts, state } from './vlib.mjs'
console.log('d1-desktop v1')
picsFor('d1')
const T = id => `[data-testid="${id}"]`
const rolesRead = s => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-roles"] tr[data-page]')].filter(r => r.getBoundingClientRect().height > 0).map(r => `${r.querySelector('th').textContent.trim()}: ${[...r.querySelectorAll('td[data-role]')].map(td => `${td.dataset.role}=${td.textContent.trim()}`).join(' ')}`))
const over = (s, sel) => s.page.evaluate(sel => { const b = document.querySelector(sel); if (!b) return 'none'; const r = b.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t ? (b.contains(t) ? 'self' : `${t.tagName}.${String(t.className).slice(0, 40)}`) : 'nothing' }, sel)
async function tabWalk(s, n) {
  const seen = []
  await s.page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0) })
  await s.page.locator('body').click({ position: { x: 760, y: 2 } }).catch(() => {})
  for (let i = 0; i < n; i++) {
    await s.page.keyboard.press('Tab'); await s.page.waitForTimeout(40)
    seen.push(await s.page.evaluate(() => { const a = document.activeElement; if (!a) return null; const b = a.getBoundingClientRect(); return `${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}${a.dataset.page ? '[' + a.dataset.page + ']' : ''}@${Math.round(b.top)}` }))
  }
  return seen
}
await serve()
try {
  const s = await newPage('d')
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('S24 desktop roles table', async () => {
    await admCat(s, 'Users'); await openRow(s, 'bane')
    await press(s, '[data-testid="acc-roles"] summary')
    facts['s24d-a-roles'] = await rolesRead(s); note(JSON.stringify(facts['s24d-a-roles']))
    await page.locator('[data-testid="acc-roles"] table').first().scrollIntoViewIfNeeded()
    await pic(s, 's24d-01-roles-open', ['[data-testid="acc-roles"]'])
    await press(s, '[data-testid="acc-roles"] summary'); facts['s24d-b-open-after-close'] = await page.evaluate(() => document.querySelector('[data-testid="acc-roles"]').open)
    await press(s, '[data-testid="acc-roles"] summary'); facts['s24d-c-roles-again'] = await rolesRead(s)
    await pic(s, 's24d-02-roles-reopened', ['[data-testid="acc-roles"]'])
    await page.locator('#accEdCancel').click().catch(() => {})
  })
  await step('grants: Ranger and Hunter View of 149', async () => { await grant(s, 'bane', '149', 'view'); await grant(s, 'prowler', '149', 'view') })
  await step('Saber opens December in 142 for the Leave War window case', async () => {
    await go(s, 'leavewar'); await page.waitForTimeout(1200)
    await press(s, T('open-chip')); await press(s, T('od-month-2026-12')); if (await page.locator(T('od-apply')).filter({ visible: true }).count()) await press(s, T('od-apply'))
    if (await page.locator(T('open-dates-close')).filter({ visible: true }).count()) await press(s, T('open-dates-close'))
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    await go(s, 'viewsched')
  })
  await as(s, 'us', 'us')
  await step('S1 Ranger picks 149', async () => {
    await go(s, 'viewsched'); await rec(s, 's1-a-142'); await pic(s, 's1-01-142-topbar', ['.topbar'])
    await barPick(s, '149'); await rec(s, 's1-b-149'); await pic(s, 's1-02-149-topbar', ['.topbar']); await pic(s, 's1-03-149-whole')
  })
  await step('S5 desktop two pages', async () => {
    await go(s, 'help'); await rec(s, 's5d-a-help'); await pic(s, 's5d-01-help', ['.topbar'])
    await go(s, 'viewsched'); await rec(s, 's5d-b-viewsched')
    await go(s, 'help'); await rec(s, 's5d-c-help-again'); await pic(s, 's5d-03-help-again', ['.topbar'])
    await go(s, 'viewsched')
  })
  await step('S22 desktop keyboard route', async () => {
    facts['s22d-a-tabs-149'] = await tabWalk(s, 22); note(JSON.stringify(facts['s22d-a-tabs-149']))
    // the offered pages activated by Enter
    await page.locator('#topnav a[data-page="help"]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
    await rec(s, 's22d-b-enter-help')
    await page.locator('#topnav a[data-page="viewsched"]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
    await rec(s, 's22d-c-enter-viewsched')
    await barPick(s, '142')
    facts['s22d-d-tabs-142'] = await tabWalk(s, 22); note(JSON.stringify(facts['s22d-d-tabs-142']))
    await page.locator('#topnav a[data-page="inputs"]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(600)
    await rec(s, 's22d-e-enter-inputs'); await go(s, 'viewsched')
  })
  await step('Q1 pick from a page 149 does not offer (Ranger)', async () => {
    for (const p of ['inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help']) {
      await go(s, p); await page.waitForTimeout(p === 'tracker' || p === 'leavewar' ? 1500 : 400)
      await barPick(s, '149'); await page.waitForTimeout(500)
      const v = await rec(s, `q1-${p}`)
      await pic(s, `q1-${p}-after-pick-149`)
      await barPick(s, '142'); await page.waitForTimeout(400)
      facts[`q1-${p}-back-page`] = (await state(s)).page
    }
    await go(s, 'viewsched')
  })
  await step('Q4 a Leave War window with typed words, then 149', async () => {
    await go(s, 'leavewar'); await page.waitForTimeout(1500)
    const c = page.locator(T('cell-bane-2026-12-09')).first()
    if (!(await c.count())) { facts['q4'] = 'NOT WALKED: no cell for Ranger on 9 Dec'; return }
    await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
    await c.click(); await page.waitForTimeout(800)
    const box = page.locator('.bidsheet textarea, .bidsheet input[type=text], [role=dialog] textarea').filter({ visible: true }).first()
    facts['q4-a-window'] = await page.evaluate(() => [...document.querySelectorAll('.bidsheet, [role=dialog]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.getAttribute('aria-label') || '') + '|' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)))
    note(JSON.stringify(facts['q4-a-window']))
    if (!(await box.count())) { await pic(s, 'q4-01-window-no-box'); facts['q4'] = 'NOT WALKED: the window has no box to type in'; return }
    await box.click(); await box.type('walk typed words', { delay: 15 })
    await pic(s, 'q4-01-typed')
    facts['q4-b-btn-over'] = await over(s, '#sqnMenuBtn'); note('q4 bar button:', facts['q4-b-btn-over'])
    if (facts['q4-b-btn-over'] !== 'self') { facts['q4'] = `NOT WALKED: the Schedules button is covered (${facts['q4-b-btn-over']})`; await page.keyboard.press('Escape'); return }
    await barPick(s, '149'); await page.waitForTimeout(700)
    await rec(s, 'q4-c-after-pick')
    facts['q4-c-window'] = await page.evaluate(() => [...document.querySelectorAll('.bidsheet, [role=dialog]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 140)))
    facts['q4-c-typed'] = await page.evaluate(() => [...document.querySelectorAll('textarea, input[type=text]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.value).filter(Boolean))
    note(JSON.stringify(facts['q4-c-window']), JSON.stringify(facts['q4-c-typed']))
    await pic(s, 'q4-02-after-pick-149')
    await barPick(s, '142'); await page.waitForTimeout(800)
    await rec(s, 'q4-d-back-142')
    facts['q4-d-typed'] = await page.evaluate(() => [...document.querySelectorAll('textarea, input[type=text]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.value).filter(Boolean))
    await go(s, 'leavewar'); await page.waitForTimeout(1200)
    facts['q4-e-typed-on-war'] = await page.evaluate(() => [...document.querySelectorAll('textarea, input[type=text]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.value).filter(Boolean))
    note('q4 typed after return:', JSON.stringify(facts['q4-d-typed']), JSON.stringify(facts['q4-e-typed-on-war']))
    await pic(s, 'q4-03-back-142-leavewar')
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    await go(s, 'viewsched')
  })
  await step('Q2 a bell line while 149 is picked (Ranger)', async () => {
    await barPick(s, '149')
    await press(s, '#notifyBell')
    facts['q2r-a-lines'] = await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.textContent.replace(/\s+/g, ' ').trim().slice(0, 90)))
    note(JSON.stringify(facts['q2r-a-lines']))
    await pic(s, 'q2r-01-bell-on-149')
    const ln = page.locator('[data-testid="bell-list"] .bl-line').filter({ visible: true }).first()
    if (await ln.count()) { await ln.click(); await page.waitForTimeout(900); await rec(s, 'q2r-b-after-line'); await pic(s, 'q2r-02-after-line') }
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    await go(s, 'viewsched'); if ((await state(s)).barMark?.startsWith('149')) await barPick(s, '142')
  })
  await as(s, 'ad2', 'a2')
  await step('S2 Hunter View of 149', async () => {
    await go(s, 'viewsched'); await rec(s, 's2-a-142'); await pic(s, 's2-01-142-topbar', ['.topbar'])
    await barPick(s, '149'); await rec(s, 's2-b-149'); await pic(s, 's2-02-149-topbar', ['.topbar'])
    await barPick(s, '142'); await rec(s, 's2-c-142-again'); await pic(s, 's2-03-142-again-topbar', ['.topbar'])
  })
  await step('Q1 Hunter on Edit Schedule and Admin, pick 149', async () => {
    for (const p of ['editsched', 'admin']) {
      await go(s, p); await page.waitForTimeout(500)
      await barPick(s, '149'); await rec(s, `q1h-${p}`); await pic(s, `q1h-${p}-after-pick-149`, ['.topbar'])
      await barPick(s, '142')
    }
    await go(s, 'viewsched')
  })
  await step('Q3 OIL list open, then 149, then a card', async () => {
    await go(s, 'leavewar'); await page.waitForTimeout(1200)
    if (!(await page.locator(T('oil-tracker')).filter({ visible: true }).count())) { facts.q3 = 'NOT WALKED: no OIL tab'; return }
    await press(s, T('oil-tracker')); await page.waitForTimeout(900)
    await pic(s, 'q3-01-oil-142')
    await barPick(s, '149'); await page.waitForTimeout(600)
    await rec(s, 'q3-a-after-pick'); await pic(s, 'q3-02-after-pick-149')
    facts['q3-b-oil-still'] = await page.evaluate(() => document.querySelectorAll('[data-testid^="oil-row-"]').length)
    await barPick(s, '142'); await go(s, 'viewsched')
  })
  await step('Q7 Undo after a change on 142, 149 picked', async () => {
    // a change on 142 that Undo takes back: Edit Schedule's search box is not one; use the Logic page? Read what Undo offers.
    await go(s, 'quals'); await page.waitForTimeout(500)
    facts['q7-a-undo-before'] = await page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { shown: b.getBoundingClientRect().width > 0, disabled: b.disabled, title: b.title || b.getAttribute('aria-label') } : null })
    note('q7 undo before:', JSON.stringify(facts['q7-a-undo-before']))
  })
  await as(s, 'ad', 'a')
  await step('grant Hunter Plan of 149', () => grant(s, 'prowler', '149', 'plan'))
  await as(s, 'ad2', 'a2')
  await step('S7 Hunter Plan of 149', async () => {
    await go(s, 'viewsched'); await barPick(s, '149')
    await press(s, '#sqnMenuBtn'); await rec(s, 's7-a-149-list'); await pic(s, 's7-01-149-list', ['.topbar', '#sqnMenu'])
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    for (const p of ['editsched', 'inputs', 'logic', 'admin']) {
      const ok = await go(s, p); await page.waitForTimeout(700)
      const v = await rec(s, `s7-b-${p}`)
      facts[`s7-b-${p}-heads`] = await page.evaluate(id => { const e = document.getElementById(id); return e ? e.innerText.replace(/\s+/g, ' ').trim().slice(0, 160) : null }, v.page)
      note(`s7 ${p}:`, ok, facts[`s7-b-${p}-heads`])
      await pic(s, `s7-02-${p}-149`)
    }
    await go(s, 'viewsched'); await barPick(s, '142')
    await press(s, '#sqnMenuBtn'); await rec(s, 's7-c-142-list'); await pic(s, 's7-03-142-list', ['.topbar', '#sqnMenu'])
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  })
  await step('S9 Hunter Plan of 149, member view by the badge', async () => {
    await barPick(s, '149'); await go(s, 'viewsched'); await rec(s, 's9-a-149-admin')
    await press(s, '#roleBadge'); await page.waitForTimeout(500)
    await rec(s, 's9-b-member-view'); await pic(s, 's9-01-member-view-topbar', ['.topbar'])
    await press(s, '#sqnMenuBtn'); await rec(s, 's9-c-list'); await pic(s, 's9-02-member-view-list', ['.topbar', '#sqnMenu'])
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    await press(s, '#roleBadge'); await page.waitForTimeout(500)
    await rec(s, 's9-d-admin-again'); await pic(s, 's9-03-admin-again-topbar', ['.topbar'])
    await barPick(s, '142')
  })
  await s.ctx.close()
} finally { finish('d1'); await stop() }
