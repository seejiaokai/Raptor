// rc-09b - the squadron list over the other windows at 1536: an Input window with typed words, the Leave War's windows, Admin's forms.
// Each: list opened, rows above (elementFromPoint), Escape, a press outside, a pick. What each does is recorded and pictured.
import { signIn, mk, closeAll, finish, step, pic, picsFor, press, go, state, note, check, admCat, openRow } from './rlib.mjs'
const RUN = process.env.RUN || '1'
const tag = `rc09b-d-${RUN}`
console.log('rc-09b v1', RUN, process.env.MQ_PORT)
picsFor(tag)
const wait = (s, ms) => s.page.waitForTimeout(ms)
const q = t => `[data-testid="${t}"]`
const rowLoc = (s, n) => s.page.locator('#sqnMenu .sqm-row', { has: s.page.locator('.sqm-num', { hasText: new RegExp(`^${n}$`) }) }).first()
const wins = s => s.page.evaluate(() => [...document.querySelectorAll('.floatwin, .airpop, .modal, .bidsheet, [data-testid="open-dates"]')].filter(e => { const b = e.getBoundingClientRect(), c = getComputedStyle(e); return b.width > 40 && c.display !== 'none' && c.visibility !== 'hidden' }).map(e => e.dataset.testid || e.id || e.className.split(' ')[0]))
const rowsTop = s => s.page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].map(e => { const b = e.getBoundingClientRect(), t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return { row: e.querySelector('.sqm-num')?.textContent.trim(), over: t ? (e.contains(t) ? 'self' : `${t.tagName}.${String(t.className).slice(0, 26)}`) : null } }))
const listOpen = s => s.page.evaluate(() => { const m = document.querySelector('#sqnMenu'); return !!m && m.getBoundingClientRect().width > 0 })
const openList = async s => { await s.page.locator('#sqnMenuBtn').filter({ visible: true }).first().click({ timeout: 4000 }); await wait(s, 320) }
const rmk = s => s.page.evaluate(() => { const r = [...document.querySelectorAll('#inpEditRmk')].find(e => e.getBoundingClientRect().width > 0); return r ? r.value : null })
const dlg = s => s.page.evaluate(() => { const shown = e => e && e.getBoundingClientRect().width > 0; const qs = [...document.querySelectorAll('#dlgMsg, .inped-ask, .inped-xask, [role=alertdialog]')].filter(shown).map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 90)); return qs })

async function walk(s, name, opener, read = async () => null) {
  await step(`list over ${name}`, async () => {
    const ok = await opener(); if (ok === false) { note(`NOT WALKED: ${name} could not be opened`); return }
    const w0 = await wins(s), r0 = await read(); note(name, 'open', JSON.stringify({ w0, r0 })); await pic(s, `${name}-0-window`)
    await openList(s); const r = await rowsTop(s); await pic(s, `${name}-1-list-open`)
    check(`${name}: every row stands above the window`, r.length >= 2 && r.every(x => x.over === 'self'), r)
    await s.page.keyboard.press('Escape'); await wait(s, 420)
    const a = { list: await listOpen(s), wins: await wins(s), read: await read(), asked: await dlg(s) }; note(name, 'after one Escape', JSON.stringify(a)); await pic(s, `${name}-2-after-escape`)
    check(`${name}: one Escape closes the list`, !a.list, a)
    check(`${name}: one Escape leaves the window as it was`, JSON.stringify(a.wins) === JSON.stringify(w0) && JSON.stringify(a.read) === JSON.stringify(r0) && a.asked.length === 0, a)
    if (a.asked.length) { await s.page.keyboard.press('Escape'); await wait(s, 350); note(name, 'second Escape', JSON.stringify({ list: await listOpen(s), asked: await dlg(s), read: await read(), wins: await wins(s) })); await pic(s, `${name}-2b-second-escape`) }
    if (await listOpen(s)) { await s.page.mouse.click(950, 28); await wait(s, 350) }
    if (JSON.stringify(await wins(s)) !== JSON.stringify(w0)) { note(name, 'window gone: opened again'); const again = await opener(); if (again === false) return }
    const barZ = () => s.page.evaluate(() => getComputedStyle(document.querySelector('.topbar')).zIndex)
    await openList(s); const zOpen = await barZ(); await s.page.mouse.click(950, 28); await wait(s, 380); const zShut = await barZ()
    check(`${name}: the top bar is lifted only while the list is open`, zOpen === '490' && zShut !== '490', { zOpen, zShut })
    const b = { list: await listOpen(s), wins: await wins(s), read: await read() }; await pic(s, `${name}-3-after-outside`)
    check(`${name}: a press outside closes the list, the window kept`, !b.list && JSON.stringify(b.wins) === JSON.stringify(w0) && JSON.stringify(b.read) === JSON.stringify(r0), b)
    await openList(s); const box = await rowLoc(s, '149').boundingBox()
    const at = await s.page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('.sqm-row')?.querySelector('.sqm-num')?.textContent.trim(), [box.x + box.width / 2, box.y + box.height / 2])
    check(`${name}: the point of the 149 row is that row`, at === '149', at)
    await s.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await wait(s, 800)
    const c = { bar: (await state(s)).barMark, wins: await wins(s), read: await read(), asked: await dlg(s) }; note(name, 'after pick of 149', JSON.stringify(c)); await pic(s, `${name}-4-after-pick`)
    check(`${name}: the press on 149 picks 149 or asks first`, (c.bar || '').startsWith('149') || c.asked.length > 0, c)
    const cl = s.page.locator('.moveband button').filter({ visible: true }).first(); if (await cl.count()) { await cl.click(); await wait(s, 350) }
    if ((await state(s)).barMark?.startsWith('149')) { await openList(s); const b2 = await rowLoc(s, '142').boundingBox(); await s.page.mouse.click(b2.x + b2.width / 2, b2.y + b2.height / 2); await wait(s, 800) }
    note(name, 'at the end', JSON.stringify({ bar: (await state(s)).barMark, wins: await wins(s) }))
  })
}
try {
  const s = await mk('d'); const { page } = s
  await signIn(s, 'ad', 'a')
  const inputWin = async () => {
    await go(s, 'inputs'); await wait(s, 700)
    if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
    if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
    if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
    await wait(s, 300)
    const row = page.locator('#inBody tr[data-iid]').filter({ visible: true }).first()
    if (!(await row.count())) return false
    await press(s, row.locator('[data-testid="in-open"]').first()); await wait(s, 600)
    if (!(await page.locator('#inpEditRmk').filter({ visible: true }).count())) return false
    await page.locator('#inpEditRmk').filter({ visible: true }).first().fill('RC typed over list'); await wait(s, 150)
    return true
  }
  await walk(s, 'input-typed', inputWin, () => rmk(s))
  for (let i = 0; i < 3 && (await wins(s)).length; i++) { await page.keyboard.press('Escape'); await wait(s, 300); const ok = page.locator('#dlgOk, .inped-xask-at button').filter({ visible: true }).first(); if (await ok.count()) { await ok.click().catch(() => {}); await wait(s, 300) } }
  note('after input-typed tidy', JSON.stringify(await wins(s)))

  const toDec = async () => {
    await go(s, 'leavewar'); await page.waitForSelector(q('month-strip'), { timeout: 15000 }); await wait(s, 500)
    const w = page.locator(q('war-picker')).filter({ visible: true }); if (await w.count()) { if ((await w.first().inputValue()) !== 'y2026') { await page.selectOption(q('war-picker'), 'y2026'); await wait(s, 500) } }
    await page.locator(q('month-DEC')).filter({ visible: true }).first().click(); await wait(s, 600)
  }
  await walk(s, 'lw-open-bidding', async () => { await toDec(); await page.locator(q('open-chip')).filter({ visible: true }).first().click(); await wait(s, 450); return (await page.locator(q('open-dates')).filter({ visible: true }).count()) > 0 })
  for (let i = 0; i < 2 && (await wins(s)).length; i++) { await page.keyboard.press('Escape'); await wait(s, 300) }
  await walk(s, 'lw-day', async () => { await toDec(); const c = page.locator('[data-testid="cell-bane-2026-12-15"]').first(); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 250); await c.click(); await wait(s, 600); return (await wins(s)).length > 0 })
  for (let i = 0; i < 2 && (await wins(s)).length; i++) { await page.keyboard.press('Escape'); await wait(s, 300) }

  await walk(s, 'admin-new-squadron', async () => { await admCat(s, 'Squadrons'); await wait(s, 300); if (!(await page.locator('#sqNewNum').filter({ visible: true }).count())) await page.locator('#sqNew').filter({ visible: true }).first().click(); await wait(s, 300); await page.fill('#sqNewNum', '777'); return true }, async () => page.evaluate(() => { const e = document.querySelector('#sqNewNum'); return e && e.getBoundingClientRect().width > 0 ? e.value : null }))
  await walk(s, 'admin-user-row', async () => { await admCat(s, 'Users'); await wait(s, 300); await openRow(s, 'prowler'); await wait(s, 400); return (await page.locator('#accEdSave').filter({ visible: true }).count()) > 0 }, async () => page.evaluate(() => !!document.querySelector('#accEdSave')?.getBoundingClientRect().width))
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
