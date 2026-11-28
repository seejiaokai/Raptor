// r-probe (chat 151, the re-walk) — the routes the new scenarios a–e start from, read once on the built app before the
// scripts are written (walk-scripts.md §2: a control comes from a passing run, never from the source). Desktop 1536.
// Reads only: which windows open from a Leave War name and a Leave War day, what boxes they hold, what lies over the
// badge and the Schedules button while each is open; the Inputs list's rows and their window; the bell's lines.
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
console.log('r-probe v1')
picsFor('r-probe')
const T = id => `[data-testid="${id}"]`
const over = (s, sel) => s.page.evaluate(sel => { const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!b) return 'none'; const r = b.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t ? (b.contains(t) ? 'self' : `${t.tagName}.${String(t.className).slice(0, 40)}|${t.dataset?.testid || ''}`) : 'nothing' }, sel)
const wins = s => s.page.evaluate(() => [...document.querySelectorAll('.bidsheet, .floatwin, [role=dialog]')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ tid: e.dataset.testid || '', cls: String(e.className).slice(0, 60), label: e.getAttribute('aria-label'), boxes: [...e.querySelectorAll('textarea, input')].filter(i => i.getBoundingClientRect().width > 0).map(i => `${i.tagName}#${i.id}|${i.type}|${i.getAttribute('aria-label') || ''}|${i.dataset.testid || ''}`), btns: [...e.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => `${b.dataset.testid || b.id || ''}:${b.textContent.trim().slice(0, 20)}`).slice(0, 14), text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 140) })))
await serve()
try {
  const s = await newPage('d')
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grants', async () => { await grant(s, 'prowler', '149', 'plan'); await grant(s, 'bane', '149', 'view'); await go(s, 'viewsched') })
  await as(s, 'ad2', 'a2')
  await step('hunter on 149 leave war', async () => {
    await barPick(s, '149'); await go(s, 'leavewar'); await page.waitForTimeout(1500)
    facts.people149 = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="person-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid + ':' + e.textContent.trim().slice(0, 20)).slice(0, 12))
    facts.cells149 = await page.evaluate(() => [...document.querySelectorAll('td[data-testid^="cell-"]')].slice(0, 3).map(e => e.dataset.testid))
    facts.badge149 = await state(s)
    note(JSON.stringify({ people: facts.people149, cells: facts.cells149, badge: facts.badge149.badge, mark: facts.badge149.barMark }))
    await pic(s, 'h-01-149-war')
    const nm = page.locator('[data-testid^="person-"]').filter({ visible: true }).first()
    await nm.click(); await page.waitForTimeout(800)
    facts.hPersonWin = await wins(s); facts.hPersonOver = { badge: await over(s, '#roleBadge'), bar: await over(s, '#sqnMenuBtn') }
    note('person window:', JSON.stringify(facts.hPersonWin), JSON.stringify(facts.hPersonOver))
    await pic(s, 'h-02-person-window')
    await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    const pid = (facts.people149[0] || '').split(':')[0].replace('person-', '')
    const cell = page.locator(`td[data-testid="cell-${pid}-2026-12-09"]`).first()
    if (await cell.count()) {
      await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
      const b = await cell.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(800)
      facts.hCellWin = await wins(s); facts.hCellOver = { badge: await over(s, '#roleBadge'), bar: await over(s, '#sqnMenuBtn') }
      note('cell window:', JSON.stringify(facts.hCellWin), JSON.stringify(facts.hCellOver))
      await pic(s, 'h-03-cell-window')
      await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    } else note('no cell', pid)
  })
  await step('hunter on 149 inputs', async () => {
    await go(s, 'inputs'); await page.waitForTimeout(800)
    await press(s, '#inListBtn'); await page.waitForTimeout(500)
    facts.hInRows = await page.evaluate(() => [...document.querySelectorAll('[data-testid="in-open"]')].filter(e => e.getBoundingClientRect().width > 0).length)
    const o = page.locator(T('in-open')).filter({ visible: true }).first()
    if (await o.count()) {
      await o.click(); await page.waitForTimeout(700)
      facts.hInWin = await wins(s); facts.hInOver = { badge: await over(s, '#roleBadge'), bar: await over(s, '#sqnMenuBtn'), undo: await over(s, '#undoBtn') }
      note('hunter input window:', facts.hInRows, JSON.stringify(facts.hInWin), JSON.stringify(facts.hInOver))
      await pic(s, 'h-04-input-window')
      await press(s, '#inpEditCancel')
    }
  })
  await step('hunter bell', async () => {
    await go(s, 'viewsched'); await barPick(s, '142')
    facts.hBellLit = await page.evaluate(() => { const b = document.querySelector('#notifyBell'); return b ? b.className + '|' + b.textContent.trim() : null })
    await press(s, '#notifyBell'); await page.waitForTimeout(400)
    facts.hBellAfter = { toast: await page.evaluate(() => document.querySelector('#toastEl')?.textContent.trim()), st: (await state(s)).page, lines: await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.textContent.replace(/\s+/g, ' ').trim().slice(0, 100))) }
    note('hunter bell:', facts.hBellLit, JSON.stringify(facts.hBellAfter))
    await pic(s, 'h-05-bell')
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  })
  await as(s, 'us', 'us')
  await step('ranger inputs and war', async () => {
    await go(s, 'inputs'); await page.waitForTimeout(800)
    await press(s, '#inListBtn'); await page.waitForTimeout(500)
    facts.rInRows = await page.evaluate(() => [...document.querySelectorAll('[data-testid="in-open"]')].filter(e => e.getBoundingClientRect().width > 0).map(b => b.closest('tr, li, .inl-row, [data-rid]')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)))
    note('ranger rows:', JSON.stringify(facts.rInRows))
    const o = page.locator(T('in-open')).filter({ visible: true }).first()
    if (await o.count()) {
      await o.click(); await page.waitForTimeout(700)
      facts.rInWin = await wins(s); facts.rInOver = { bar: await over(s, '#sqnMenuBtn') }
      note('ranger input window:', JSON.stringify(facts.rInWin), JSON.stringify(facts.rInOver))
      await pic(s, 'r-01-input-window')
      await press(s, '#inpEditCancel')
    }
    await go(s, 'leavewar'); await page.waitForTimeout(1500)
    const me = page.locator(T('person-bane')).filter({ visible: true }).first()
    if (await me.count()) {
      await me.click(); await page.waitForTimeout(800)
      facts.rPersonWin = await wins(s); facts.rPersonOver = { bar: await over(s, '#sqnMenuBtn') }
      note('ranger own window:', JSON.stringify(facts.rPersonWin), JSON.stringify(facts.rPersonOver))
      await pic(s, 'r-02-own-person-window')
      await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    } else note('no person-bane')
    await go(s, 'viewsched'); await barPick(s, '149')
    await press(s, '#notifyBell'); await page.waitForTimeout(400)
    facts.rBell = await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.textContent.replace(/\s+/g, ' ').trim().slice(0, 100)))
    note('ranger bell:', JSON.stringify(facts.rBell))
    await pic(s, 'r-03-bell')
  })
  await s.ctx.close()
} finally { finish('r-probe'); await stop() }
