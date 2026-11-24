// rc-09 - re-walk of item 9: the squadron list opens above the Calendar window and the other windows on a desktop; at 402 the ☰ list.
import { signIn, mk, closeAll, finish, step, pic, picsFor, press, go, shut, state, note, check } from './rlib.mjs'
const SZ = process.env.SZ || 'd'
const RUN = process.env.RUN || '1'
const tag = `rc09-${SZ}-${RUN}`
console.log('rc-09 v1', SZ, RUN, process.env.MQ_PORT)
picsFor(tag)
const wait = (s, ms) => s.page.waitForTimeout(ms)
const rowLoc = (s, n) => s.page.locator('#sqnMenu .sqm-row', { has: s.page.locator('.sqm-num', { hasText: new RegExp(`^${n}$`) }) }).first()
const wins = s => s.page.evaluate(() => [...document.querySelectorAll('.floatwin, .airpop, .modal')].filter(e => { const b = e.getBoundingClientRect(), c = getComputedStyle(e); return b.width > 40 && c.display !== 'none' && c.visibility !== 'hidden' }).map(e => { const r = e.getBoundingClientRect(); return `${e.dataset.testid || e.id || e.className.split(' ')[0]}@${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}x${Math.round(r.height)} z${getComputedStyle(e).zIndex}` }))
const rowsTop = s => s.page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].map(e => { const b = e.getBoundingClientRect(), t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return { row: e.querySelector('.sqm-num')?.textContent.trim(), over: t ? (e.contains(t) ? 'self' : `${t.tagName}.${String(t.className).slice(0, 26)} in ${t.closest('.floatwin,.airpop,.modal')?.dataset?.testid || t.closest('.floatwin,.airpop,.modal')?.id || ''}`) : null } }))
const barAbove = s => s.page.evaluate(() => { const b = document.querySelector('#sqnMenuBtn'); if (!b) return null; const r = b.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); const tb = document.querySelector('.topbar'); return { onButton: t === b || b.contains(t), top: t ? `${t.tagName}.${String(t.className).slice(0, 24)}` : null, barZ: tb ? getComputedStyle(tb).zIndex : null, list: !!document.querySelector('#sqnMenu') } })
const listOpen = s => s.page.evaluate(() => { const m = document.querySelector('#sqnMenu'); return !!m && m.getBoundingClientRect().width > 0 })
/* a window opened, the list opened over it, each way of closing it, then a pick */
async function overWindow(s, name, opener, opts = {}) {
  const { page } = s
  await step(`list over ${name}`, async () => {
    const ok = await opener(); if (ok === false) { note(`NOT WALKED: ${name} could not be opened`); return }
    const w0 = await wins(s); note(name, 'windows', JSON.stringify(w0)); await pic(s, `${name}-0-window`)
    await page.locator('#sqnMenuBtn').filter({ visible: true }).first().click({ timeout: 4000 }); await wait(s, 350)
    const r = await rowsTop(s); note(name, 'rows', JSON.stringify(r)); await pic(s, `${name}-1-list-open`)
    check(`${name}: every row of the list stands above the window`, r.length >= 2 && r.every(x => x.over === 'self'), r)
    await page.keyboard.press('Escape'); await wait(s, 350)
    check(`${name}: Escape closes the list`, !(await listOpen(s)), await listOpen(s))
    const w1 = await wins(s); check(`${name}: the window stays after Escape`, JSON.stringify(w1) === JSON.stringify(w0), { w0, w1 })
    const a1 = await barAbove(s); note(name, 'bar after Escape', JSON.stringify(a1)); await pic(s, `${name}-2-after-escape`)
    await page.locator('#sqnMenuBtn').filter({ visible: true }).first().click({ timeout: 4000 }).catch(e => note(name, 'bar not pressable after Escape', String(e).split('\n')[0])); await wait(s, 300)
    if (await listOpen(s)) {
      await page.mouse.click(620, 760); await wait(s, 350)
      check(`${name}: a press outside closes the list`, !(await listOpen(s)), await listOpen(s))
      const w2 = await wins(s); note(name, 'windows after a press outside', JSON.stringify(w2)); await pic(s, `${name}-3-after-outside`)
    }
    if (opts.pick) {
      if (!(await wins(s)).length) await opener()
      await page.locator('#sqnMenuBtn').filter({ visible: true }).first().click({ timeout: 4000 }); await wait(s, 300)
      const b = await rowLoc(s, opts.pick).boundingBox()
      const at = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('.sqm-row')?.querySelector('.sqm-num')?.textContent.trim(), [b.x + b.width / 2, b.y + b.height / 2])
      check(`${name}: the point of the ${opts.pick} row is that row`, at === opts.pick, at)
      await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 900)
      const st = await state(s); await pic(s, `${name}-4-after-pick`)
      check(`${name}: the press picks ${opts.pick}`, (st.barMark || '').startsWith(opts.pick), st.barMark)
      note(name, 'windows after the pick', JSON.stringify(await wins(s)), 'bar', JSON.stringify(await barAbove(s)))
    }
  })
}
try {
  const s = await mk(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  if (s.desk) {
    await go(s, 'inputs'); await wait(s, 900)
    const calendar = async () => { await go(s, 'inputs'); await wait(s, 500); if (await page.locator('[data-testid="iset-days"]').filter({ visible: true }).count() === 0) await press(s, '#inGear'); await wait(s, 300); await press(s, '[data-testid="iset-days"]'); await wait(s, 600) }
    await overWindow(s, 'calendar', calendar, { pick: '149' })
    await overWindow(s, 'calendar-back', calendar, { pick: '142' })
    const inputWin = async () => {
      await go(s, 'inputs'); await wait(s, 700)
      if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
      if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
      if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
      await wait(s, 300)
      const row = page.locator('#inBody tr[data-iid]').filter({ visible: true }).first()
      if (!(await row.count())) return false
      await press(s, row.locator('[data-testid="in-open"]').first()); await wait(s, 600)
      return (await page.locator('#inpEditSave').filter({ visible: true }).count()) > 0
    }
    await overWindow(s, 'input-window', inputWin)
    await page.keyboard.press('Escape'); await wait(s, 400)
    if (await page.locator('#inpEditCancel').filter({ visible: true }).count()) await press(s, '#inpEditCancel')
    const lw = async () => {
      await go(s, 'leavewar'); await wait(s, 1600)
      const c = page.locator('.lw-cell, [data-testid^="lw-cell"], td[data-day]').filter({ visible: true }).first()
      if (!(await c.count())) return false
      await c.click({ timeout: 3000 }).catch(() => {}); await wait(s, 600)
      return (await wins(s)).length > 0
    }
    await overWindow(s, 'leavewar-window', lw)
    await page.keyboard.press('Escape'); await wait(s, 400)
    const admin = async () => { await go(s, 'admin'); await wait(s, 700); const c = page.locator('#page-admin button.adm-cat', { has: page.locator('.adm-cat-l', { hasText: /^Users/ }) }); if (await c.count()) { await c.first().click(); await wait(s, 600) } const rowb = page.locator('#page-admin [data-pid], #page-admin .acc-row').filter({ visible: true }).first(); if (await rowb.count()) { await rowb.click({ timeout: 3000 }).catch(() => {}); await wait(s, 500) } return (await wins(s)).length > 0 }
    await overWindow(s, 'admin-window', admin)
  } else {
    await step('the ☰ list at 402', async () => {
      await go(s, 'inputs'); await shut(s); await wait(s, 700)
      await press(s, '#burger', 'p1-burger'); await wait(s, 300); await pic(s, 'p-01-menu')
      await press(s, '#drawerSqnBtn', 'p2-mark'); await wait(s, 350); await pic(s, 'p-02-list')
      const st = await state(s)
      check('the ☰ list is open and on screen', Array.isArray(st.dList) && st.dList.length >= 2 && st.dListAt?.inView, { list: st.dList, at: st.dListAt })
      const row = page.locator('#drawerSqnList .sqm-row', { has: page.locator('.sqm-num', { hasText: /^149$/ }) }).first()
      const b = await row.boundingBox(); const at = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('.sqm-row')?.querySelector('.sqm-num')?.textContent.trim(), [b.x + b.width / 2, b.y + b.height / 2])
      check('the point of the 149 row is that row', at === '149', at)
      await press(s, row, 'p3-row'); await wait(s, 800); await shut(s); await wait(s, 300)
      const st2 = await state(s); await pic(s, 'p-03-after-pick')
      check('a tap on the row picks 149', /149/.test(`${st2.barMark} ${st2.dMark}`), { bar: st2.barMark, drawer: st2.dMark })
    })
  }
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
