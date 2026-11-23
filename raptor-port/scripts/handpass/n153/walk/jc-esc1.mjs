// jc-esc1 - S41 (Escape closes an opened Users row as Cancel does) and S42 (the control on top takes Escape first).
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, openRow } from './jlib.mjs'
import { toUsers, who, editRow, tips, doUndo, rowText, roleOpts } from './jc-lib.mjs'
import { openF, tap, tick } from './jc-flib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-esc1 v1', SZ)
picsFor('jc-esc1-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const esc = async s => { await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(260) }
const edOpen = s => s.page.locator('#accEdCancel').count().then(n => n > 0)
const focusOn = s => s.page.evaluate(() => { const a = document.activeElement; if (!a) return null; const r = a.closest && a.closest('[data-person]'); return { tag: a.tagName, id: a.id, cls: (a.className && a.className.baseVal === undefined) ? a.className : '', person: r ? r.dataset.person : null, onTap: !!(a.classList && a.classList.contains('acc-tap')) } })
const undoLine = async s => (await tips(s)).undo?.title
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a'); await toUsers(s)
  await step('S41 Escape from a typed field', async () => {
    const b = await who(s, 'prowler', ['149']); const u0 = await undoLine(s)
    await editRow(s, 'prowler', [{ name: 'esc1' }, { role: 'main' }]); await page.focus('#accEdName'); await pic(s, 's41-1-draft')
    await esc(s)
    check('S41 row closed by Escape', !(await edOpen(s)), await edOpen(s)); await pic(s, 's41-2-after-escape')
    const f = await focusOn(s); rec('S41 focus after Escape', f); check('S41 focus returned to his row', f.person === 'prowler' && f.onTap, f)
    check('S41 no question raised', !(await page.locator('#dlgMsg:visible').count()), 'no dialog')
    check('S41 no Undo line written', (await undoLine(s)) === u0, await undoLine(s))
    const a = await who(s, 'prowler', ['149']); check('S41 nothing saved', a.role === b.role && a.name === b.name, a)
  })
  await step('S41 Escape from elsewhere, an access line changed', async () => {
    await editRow(s, 'prowler', [{ line: ['149', 'plan'] }]); await page.evaluate(() => document.activeElement?.blur?.()); await page.waitForTimeout(100)
    await esc(s); check('S41b closed', !(await edOpen(s)), 'closed')
    const a = await who(s, 'prowler', ['149']); check('S41b Plan not saved', a.lines['149'] === 'none', a.lines)
  })
  await step('S41 an armed Delete', async () => {
    await openRow(s, 'prowler'); const del = page.locator('#accEdDel'); const w0 = await del.textContent()
    await tap(s, del); await page.waitForTimeout(250); const w1 = await page.evaluate(() => document.querySelector('#accEdDel')?.textContent?.trim() ?? null)
    const dlg = await page.locator('#dlgMsg:visible').count(); rec('S41 Delete armed', { before: w0, after: w1, dialog: dlg }); await pic(s, 's41-3-armed')
    if (dlg) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); rec('S41 Escape took the delete question first; row open', await edOpen(s)) }
    await esc(s); check('S41c closed', !(await edOpen(s)), 'closed')
    check('S41c person still there', !!(await rowText(s, 'prowler')), await rowText(s, 'prowler'))
    await openRow(s, 'prowler'); const w2 = await page.evaluate(() => document.querySelector('#accEdDel')?.textContent?.trim()); check('S41c Delete not left armed', w2 === w0, w2)
    await page.locator('#accEdCancel').click(); await page.waitForTimeout(200)
  })
  await step('S41 against Cancel and pressing the row again', async () => {
    await editRow(s, 'prowler', [{ name: 'esc2' }]); await tap(s, page.locator('#accEdCancel')); await page.waitForTimeout(220)
    const c = await who(s, 'prowler'); check('S41d Cancel discards', c.name === 'ad2', c.name)
    await editRow(s, 'prowler', [{ name: 'esc3' }]); const tapr = page.locator('[data-person="prowler"] .acc-tap').first(); await tap(s, tapr); await page.waitForTimeout(260)
    const st = await edOpen(s); rec('S41 pressing his row again with a draft: row open', st)
    if (st) { const v = await page.inputValue('#accEdName'); rec('S41 draft in box', v); await page.locator('#accEdCancel').click(); await page.waitForTimeout(200) }
    const a = await who(s, 'prowler'); check('S41d pressing the row saves nothing', a.name === 'ad2', a.name)
  })
  await step('S41 an accountless person', async () => {
    const t = page.locator('[data-person="dj"] .acc-tap').first(); await t.scrollIntoViewIfNeeded(); await tap(s, t); await page.waitForTimeout(300)
    rec('S41e row controls', await page.evaluate(() => { const e = document.querySelector('#page-admin [data-person="dj"]'); return e ? [...e.querySelectorAll('button,input,select')].filter(x => x.getBoundingClientRect().width > 0).map(x => `${x.tagName}#${x.id} "${(x.value || x.textContent || '').trim().slice(0, 14)}"`) : null }))
    const nm = page.locator('#page-admin [data-person="dj"] input').first(); if (await nm.count()) await nm.fill('ace@mail'); await pic(s, 's41-4-accountless')
    await esc(s); check('S41e closed', !(await edOpen(s)) && !(await page.locator('#page-admin [data-person="dj"] input').count()), 'closed')
    const row = await rowText(s, 'dj'); check('S41e no sign-in saved', /no sign-in/.test(row || ''), row); rec('S41e focus', await focusOn(s))
  })
  await step('S41 an archived person', async () => {
    const t = page.locator('[data-person="dj"] .acc-tap').first(); await tap(s, t); await page.waitForTimeout(250)
    const ar = page.locator('#accEdArchive'); if (!(await ar.count())) { note('no Archive on this row'); return }
    await tap(s, ar); await page.waitForTimeout(300); const dl = await page.locator('#dlgMsg:visible').count(); if (dl) { rec('S41f archive question', await page.locator('#dlgMsg').textContent()); await tap(s, page.locator('#dlgOk')); await page.waitForTimeout(350) }
    const gr = page.locator('#page-admin button, #page-admin summary', { hasText: /Archived/ }).filter({ visible: true }); rec('S41f archived groups', await gr.allTextContents())
    if (await gr.count()) { await tap(s, gr.first()); await page.waitForTimeout(300) }
    const row = page.locator('#page-admin [data-person="dj"] .acc-tap').first(); if (!(await row.count())) { note('archived row not drawn'); return }
    await row.scrollIntoViewIfNeeded(); await tap(s, row); await page.waitForTimeout(300); await pic(s, 's41-5-archived-row')
    const opened = await page.evaluate(() => { const e = document.querySelector('#page-admin [data-person="dj"]'); return [...e.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0).map(x => (x.id || '') + ':' + x.textContent.trim().slice(0, 12)) }); rec('S41f archived row controls', opened)
    await esc(s); const afterBtns = await page.evaluate(() => { const e = document.querySelector('#page-admin [data-person="dj"]'); return e ? [...e.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0).length : -1 })
    rec('S41f after Escape, buttons left in the row', afterBtns); check('S41f archived row closes on Escape', afterBtns < opened.length, { before: opened.length, after: afterBtns })
    rec('S41f focus', await focusOn(s))
  })
  await s.ctx.close()

  const t = await newPage(SZ); const p2 = t.page
  await signIn(t, 'ad', 'a'); await toUsers(t)
  await step('S42 Filter over a row with a draft', async () => {
    await editRow(t, 'prowler', [{ name: 'draft42' }]); await openF(t); await pic(t, 's42-1-filter-over')
    await esc(t); check('S42 first Escape closes the Filter', !(await p2.locator('#accFilterPanel').count()), 'panel gone')
    check('S42 row still open', await edOpen(t), await edOpen(t)); check('S42 draft kept', (await p2.inputValue('#accEdName')) === 'draft42', await p2.inputValue('#accEdName'))
    rec('S42 focus after first Escape', await focusOn(t))
    await esc(t); check('S42 second Escape closes the row', !(await edOpen(t)), 'closed')
    const a = await who(t, 'prowler'); check('S42 draft dropped', a.name === 'ad2', a.name)
  })
  await step('S42 the other order: Filter first, row second', async () => {
    await openF(t); await p2.waitForTimeout(150)
    const r = p2.locator('[data-person="prowler"] .acc-tap').first(); await r.scrollIntoViewIfNeeded(); await tap(t, r); await p2.waitForTimeout(300)
    const both = { panel: await p2.locator('#accFilterPanel').count(), row: await edOpen(t) }; rec('S42 after opening a row with the Filter open', both)
    if (both.row) { await p2.fill('#accEdName', 'draft43'); await esc(t); rec('S42b after one Escape', { panel: await p2.locator('#accFilterPanel').count(), row: await edOpen(t) }) }
    if (await p2.locator('#accFilterPanel').count()) await esc(t)
    if (await edOpen(t)) { await esc(t) }
    check('S42b all closed, nothing saved', !(await edOpen(t)) && (await who(t, 'prowler')).name === 'ad2', 'closed')
  })
  await step('S42 What each role allows', async () => {
    await editRow(t, 'prowler', [{ name: 'draft44' }])
    const help = p2.locator('[data-person="prowler"] summary, [data-person="prowler"] button', { hasText: 'What each role allows' }).first()
    if (!(await help.count())) { note('no What each role allows control'); return }
    await tap(t, help); await p2.waitForTimeout(250); await pic(t, 's42-2-role-help-open')
    const shape = await p2.evaluate(() => { const b = [...document.querySelectorAll('#page-admin summary, #page-admin button')].find(e => /What each role allows/.test(e.textContent)); const d = b.closest('details'); return { tag: b.tagName, inDetails: !!d, open: d ? d.open : null, expanded: b.getAttribute('aria-expanded') } }); rec('S42 role help', shape)
    await esc(t); const row = await edOpen(t); rec('S42 role help: after one Escape the row is', row ? 'open' : 'closed')
    if (row) { const s2 = await p2.evaluate(() => { const d = [...document.querySelectorAll('#page-admin summary')].find(e => /What each role allows/.test(e.textContent))?.closest('details'); return d ? d.open : null }); rec('S42 role help: still open', s2); await esc(t) }
    check('S42c row closed in the end, nothing saved', !(await edOpen(t)) && (await who(t, 'prowler')).name === 'ad2', 'closed')
  })
  if (SZ === 'd') await step('S42 a native select opened by the keyboard', async () => {
    await editRow(t, 'prowler', [{ name: 'draft45' }]); await p2.focus('#accEdRole'); await p2.keyboard.press('Alt+ArrowDown'); await p2.waitForTimeout(200)
    await esc(t); const after = await edOpen(t); rec('S42 native select: after the first Escape the row is', after ? 'open' : 'closed')
    if (after) { await p2.waitForTimeout(100); await esc(t) }
    check('S42d row closed, draft dropped', !(await edOpen(t)) && (await who(t, 'prowler')).name === 'ad2', 'closed')
  })
  await t.ctx.close()
} finally { finish('jc-esc1-' + SZ); await closeAll() }
