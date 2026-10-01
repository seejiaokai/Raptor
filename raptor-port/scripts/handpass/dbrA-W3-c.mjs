/* W3 part C — the Leave War's ⚙ Settings, Rearrange and + New war, desktop 1440×900, one fresh demo world, the admin.
     7a  ⚙ → + Counter (a named counter, saved)                 → the manning rules' row (`leavewar/manningdefs` …)
     7b  ⚙ → a group added (Add a group) and coloured            → `leavewar/groupdefs` …, then `leavewar/groupcolors`
     7c  ⚙ → Show SANS                                           → `leavewar/showsans`
     7d  ⇅ Rearrange → a person row dragged under another        → `leavewar/rosterorder`
     7e  ⚙ → ↺ Reset order (asks once)                           → `leavewar/rosterorder`
     8   + New war (a name, a month, Create)                     → ONE `leavewar/war:` row; reload; the picker lists it
   Each: L.step (the rows it wrote, all named by its batch; the settings-like keys stay `leavewar/<key>`) + a reload
   (the app's state, what the grid shows, "the reload wrote nothing"). Run from scripts/handpass:  node dbrA-W3-c.mjs */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-c.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, sheetNow, closeSheets, lwReload, warPick, pic, row, rowsSummary } = W
const SET = k => /^leavewar\/[a-z]+$/.test(k)       // a settings-like key: `leavewar/<key>`, no id

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const page = await W.newPage(ctx, errors, 'A')
const passNow = (from) => L.results.slice(from).every(r => r.ok)
async function run(name, fn) {
  try { await fn() } catch (e) {
    L.check(`${name} — the step ran`, false, 'THREW ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 400))
    await pic(page, `C-THREW-${name}`).catch(() => {})
    row({ step: name, width: 'desktop', did: 'THREW', screen: String(e && e.message || e).slice(0, 200), rows: '', ok: false })
    await closeSheets(page).catch(() => {})
  }
}
const openSettings = async () => { await page.locator('[data-testid="settings-open"]:visible').first().click(); await L.sleep(600) }
const rosterOrder = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.getAttribute('data-testid').slice(4)).filter(x => !/^(sets|event)/.test(x)))
const manningRows = () => page.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid^="count-"]')].map(e => e.getAttribute('data-testid').replace(/^count-/, '').replace(/-\d{4}-\d{2}-\d{2}$/, '')))])
const groupHeads = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="group-"]')].map(e => `${e.getAttribute('data-testid')}:${(e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30)}`).filter(x => !/group-(chosen|offer|members|priority|reset)/.test(x)))
const onlySettings = a => a.put.every(SET) && a.del.every(SET)

await L.signIn(page, 'a')
await L.settle(page)
{
  const r0 = await L.rows(page)
  const b = Object.keys(r0).filter(k => k.startsWith('changes/')).map(k => JSON.parse(r0[k]))
  const ok = L.check('C0 first boot — ONE change-log batch, of type boot', b.length === 1 && b[0].type === 'boot', b.map(x => ({ type: x.type, n: (x.items || []).length })))
  row({ step: 'C0 first boot', width: 'desktop', did: 'fresh world, Saber', screen: '—', rows: `batches ${b.map(x => x.type + '/' + (x.items || []).length).join(' ')}`, ok, pics: [] })
}
await lwOpen(page, '2026-01-05')

/* 7a + Counter */
await run('7a counter', async () => {
  const k0 = L.results.length
  const m0 = await manningRows()
  const a = await L.step(page, '7a ⚙ → + Counter "W3 CTR", Save', async () => {
    await openSettings()
    await page.locator('[data-testid="counter-add"]:visible').click(); await L.sleep(600)
    await page.fill('[data-testid="cform-name"]', 'W3 CTR')
    await pic(page, 'C-7a-counter-form')
    const save = page.locator('[data-testid="cform-save"]:visible')
    const dis = await save.isDisabled()
    if (!dis) { await save.click(); await L.sleep(700) }
    await closeSheets(page)
    return { saveDisabled: dis }
  })
  const m1 = await manningRows()
  L.check('7a — only settings-like keys `leavewar/<key>` written (the manning rules)', a.put.length >= 1 && onlySettings(a) && a.put.some(k => /manningdefs/.test(k)), { put: a.put, del: a.del })
  L.check('7a — the new counter is a manning row on the grid', m1.length === m0.length + 1, { before: m0, after: m1 })
  await pic(page, 'C-7a-counter-row')
  const rr = await lwReload(page, '7a counter', 'a', [])
  await lwOpen(page, '2026-01-05')
  const m2 = await manningRows()
  L.check('7a — after the reload the counter is still a manning row, in the same place', JSON.stringify(m2) === JSON.stringify(m1), { before: m1, after: m2 })
  await pic(page, 'C-7a-after-reload')
  row({ step: '7a + Counter', width: 'desktop', did: '⚙ → + Counter, named W3 CTR, Save', screen: `manning rows after reload: ${m2.join(', ')}`, rows: rowsSummary(a), ok: passNow(k0) })
})

/* 7b a group added and coloured */
let gid = null
await run('7b group', async () => {
  const k0 = L.results.length
  const h0 = await groupHeads()
  const a = await L.step(page, '7b ⚙ → Add a group (the first qualification offered)', async () => {
    await openSettings()
    const offers = await page.locator('[data-testid^="gadd-"]:visible').evaluateAll(es => es.map(e => ({ id: e.getAttribute('data-testid').slice(5), t: e.innerText.trim() })))
    gid = offers[0] && offers[0].id
    await page.locator(`[data-testid="gadd-${gid}"]`).click(); await L.sleep(600)
    await pic(page, 'C-7b-group-added-palette')
    return { offers, gid }
  })
  L.check('7b — adding a group writes only settings-like keys (the group list)', a.put.length >= 1 && onlySettings(a) && a.put.some(k => /groupdefs/.test(k)), { put: a.put, del: a.del, ret: a.ret })
  const c = await L.step(page, '7b … and a colour picked from its palette', async () => {
    const pal = page.locator(`[data-testid="gpalette-${gid}"]:visible`)
    if (!(await pal.count())) { await page.locator(`[data-testid="gcolor-${gid}"]:visible`).click(); await L.sleep(400) }
    const dots = await page.locator(`[data-testid^="gdot-${gid}-"]:visible`).evaluateAll(es => es.map(e => e.getAttribute('data-testid')))
    const pick = dots[3] || dots[0]
    await page.locator(`[data-testid="${pick}"]`).click(); await L.sleep(600)
    await closeSheets(page)
    return { dots: dots.length, pick }
  }, { put: [/^leavewar\/groupcolors$/], only: true })
  const h1 = await groupHeads()
  await lwOpen(page, '2026-01-05'); await pic(page, 'C-7b-group-on-grid')
  const rr = await lwReload(page, '7b group', 'a', [])
  await lwOpen(page, '2026-01-05')
  const h2 = await groupHeads()
  L.check('7b — after the reload the group headings (with the new group) read the same', JSON.stringify(h2) === JSON.stringify(h1), { before: h1, after: h2, was: h0 })
  const col = await page.evaluate(g => { const e = document.querySelector(`[data-testid="group-${g}"]`); return e ? getComputedStyle(e.querySelector('.gdot, .swatch, [class*=sw]') || e).backgroundColor : 'no heading' }, gid)
  await pic(page, 'C-7b-after-reload')
  row({ step: '7b group added + coloured', width: 'desktop', did: `⚙ → + ${gid}, then a colour dot`, screen: `headings ${h2.join(' | ')}; colour ${col}`, rows: rowsSummary(a) + ' || ' + rowsSummary(c), ok: passNow(k0) })
})

/* 7c Show SANS */
await run('7c sans', async () => {
  const k0 = L.results.length
  const a = await L.step(page, '7c ⚙ → Show SANS', async () => {
    await openSettings()
    const b = page.locator('[data-testid="sans-toggle"]:visible')
    const was = await b.getAttribute('aria-pressed')
    await b.click(); await L.sleep(600)
    const now = await b.getAttribute('aria-pressed')
    await closeSheets(page)
    return { was, now }
  }, { put: [/^leavewar\/showsans$/], also: [/^leavewar\/(groupdefs|grouppriority|rosterorder)$/], only: true })
  const h1 = await groupHeads()
  const o1 = await rosterOrder()
  await lwOpen(page, '2026-01-05'); await pic(page, 'C-7c-sans')
  const rr = await lwReload(page, '7c sans', 'a', [])
  await lwOpen(page, '2026-01-05')
  const h2 = await groupHeads(), o2 = await rosterOrder()
  L.check('7c — after the reload SANS still shown: the same headings and the same rows in the same order', JSON.stringify(h2) === JSON.stringify(h1) && JSON.stringify(o2) === JSON.stringify(o1) && /SANS/i.test(h2.join(' ')), { h1, h2, n1: o1.length, n2: o2.length })
  await page.locator('[data-testid^="group-"]').filter({ hasText: /SANS/ }).first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {})
  await pic(page, 'C-7c-after-reload')
  row({ step: '7c Show SANS', width: 'desktop', did: '⚙ → Show SANS', screen: `headings ${h2.join(' | ')}; ${o2.length} rows`, rows: rowsSummary(a), ok: passNow(k0) })
})

/* 7d Rearrange: drag a person row under another */
await run('7d rearrange', async () => {
  const k0 = L.results.length
  const o0 = await rosterOrder()
  const a = await L.step(page, '7d ⇅ Rearrange → drag Reaper\'s row under Piston\'s', async () => {
    await page.locator('[data-testid="roster-arrange"]:visible').click(); await L.sleep(600)
    const g = page.locator('[data-testid="drag-dice"]:visible').first()
    await g.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
    const gb = await g.boundingBox()
    const tb = await page.locator('[data-testid="row-pump"]').first().boundingBox()
    await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2); await page.mouse.down()
    await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2 + 6, { steps: 3 })
    await page.mouse.move(gb.x + gb.width / 2, tb.y + tb.height * 0.8, { steps: 16 }); await L.sleep(200)
    await pic(page, 'C-7d-dragging')
    await page.mouse.up(); await L.sleep(700)
    await page.locator('[data-testid="roster-arrange"]:visible').click(); await L.sleep(600)
  }, { put: [/^leavewar\/rosterorder$/], only: true })
  const o1 = await rosterOrder()
  L.check('7d — Reaper now drawn under Piston', o1.indexOf('dice') === o1.indexOf('pump') + 1, { before: o0.slice(0, 8), after: o1.slice(0, 8) })
  await pic(page, 'C-7d-rearranged')
  const rr = await lwReload(page, '7d rearrange', 'a', [])
  await lwOpen(page, '2026-01-05')
  const o2 = await rosterOrder()
  L.check('7d — after the reload the rows keep the arranged order', JSON.stringify(o2) === JSON.stringify(o1), { after: o2.slice(0, 10), before: o1.slice(0, 10) })
  await pic(page, 'C-7d-after-reload')
  row({ step: '7d rearrange drag', width: 'desktop', did: '⇅ Rearrange, dragged Reaper\'s ⠿ under Piston, ⇅ again', screen: `rows after reload: ${o2.slice(0, 8).join(', ')}…`, rows: rowsSummary(a), ok: passNow(k0) })
})

/* 7e Reset order */
await run('7e reset order', async () => {
  const k0 = L.results.length
  const o0 = await rosterOrder()
  const a = await L.step(page, '7e ⚙ → ↺ Reset order, and again to confirm', async () => {
    await openSettings()
    const b = page.locator('[data-testid="roster-reset-order"]:visible')
    const dis = await b.isDisabled()
    await b.click(); await L.sleep(300)
    const armed = (await b.innerText()).trim()
    await pic(page, 'C-7e-reset-asks')
    await b.click(); await L.sleep(700)
    await closeSheets(page)
    return { dis, armed }
  }, { also: [/^leavewar\/rosterorder$/], only: true })
  L.check('7e — the saved order row changed (re-put or removed), and nothing else', [...a.put, ...a.del].includes('leavewar/rosterorder'), { put: a.put, del: a.del })
  const o1 = await rosterOrder()
  L.check('7e — the default order is back (Reaper above Piston again)', o1.indexOf('dice') < o1.indexOf('pump'), { before: o0.slice(0, 8), after: o1.slice(0, 8), ret: a.ret })
  const rr = await lwReload(page, '7e reset order', 'a', [])
  await lwOpen(page, '2026-01-05')
  const o2 = await rosterOrder()
  L.check('7e — after the reload the default order holds', JSON.stringify(o2) === JSON.stringify(o1), { after: o2.slice(0, 10) })
  await pic(page, 'C-7e-after-reload')
  row({ step: '7e Reset order', width: 'desktop', did: '⚙ → ↺ Reset order → Really reset?', screen: `rows after reload: ${o2.slice(0, 8).join(', ')}…`, rows: rowsSummary(a), ok: passNow(k0) })
})

/* 8 + New war */
await run('8 new war', async () => {
  const k0 = L.results.length
  const a = await L.step(page, '8 + New war "W3 JAN 28", 1–31 Jan 2028, Create', async () => {
    await page.locator('[data-testid="war-new"]:visible').first().click(); await L.sleep(500)
    await page.fill('[data-testid="war-name"]', 'W3 JAN 28')
    const day = async (iso) => {
      for (let i = 0; i < 30 && !(await page.locator(`[data-testid="war-day-${iso}"]`).count()); i++) { await page.locator('[data-testid="war-next-month"]').click(); await L.sleep(80) }
      await page.locator(`[data-testid="war-day-${iso}"]`).first().click(); await L.sleep(150)
    }
    await day('2028-01-01'); await day('2028-01-31')
    await pic(page, 'C-8-new-war-sheet')
    await page.locator('[data-testid="war-create"]').click(); await L.sleep(1500)
    return { problem: await page.locator('[data-testid="war-problem"]').allInnerTexts() }
  }, { put: [/^leavewar\/war:/], also: [/^leavewar\/current$/], only: true })
  const wars = a.put.filter(k => k.startsWith('leavewar/war:'))
  L.check('8 — ONE new war row, and no existing war row touched', wars.length === 1 && !['leavewar/war:y2026', 'leavewar/war:y2027'].includes(wars[0]) && !a.del.length, { put: a.put, batches: a.batches })
  const p1 = await warPick(page)
  await pic(page, 'C-8-created')
  const rr = await lwReload(page, '8 new war', 'a', [])
  L.check('8 — after the reload the app opens on the war being bid on (y2026), not the draft just made (the stage rule)', rr.bootWar === 'y2026', rr.bootWar)
  const p2 = await warPick(page)
  L.check('8 — after the reload the picker lists it (the war on screen by the stage rule: the open one)', p2.opts.some(o => o.t === 'W3 JAN 28'), { before: p1, after: p2 })
  await page.locator('[data-testid="war-picker"]:visible').first().evaluate(e => e.scrollIntoView({ block: 'center' }))
  await pic(page, 'C-8-after-reload')
  const w = await warPick(page, 'W3 JAN 28')
  await pic(page, 'C-8-picked-after-reload')
  row({ step: '8 + New war', width: 'desktop', did: '+ New, "W3 JAN 28", 1–31 Jan 28, Create', screen: `picker after reload: ${p2.opts.map(o => o.t).join(' / ')} (on screen ${p2.value}); picked → ${w.to}`, rows: rowsSummary(a), ok: passNow(k0) })
})

L.check('part C — no console errors, page errors, failed requests or native dialogs', !errors.length, errors.slice(0, 20))
L.save({ table: W.TABLE, errors })
await browser.close()
