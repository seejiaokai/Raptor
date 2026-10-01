/* W3 part G — the scenario designer's no. 9: the Leave War's configuration, desktop 1440×900, one fresh demo world, the
   admin. Every save and reset is its own L.step (only its settings-like key `leavewar/<key>` may change, in ONE batch)
   and a reload (what the screen lists afterwards is exact; the reload writes nothing). At the end: no `personedits`
   key (D460/D461) and no retired whole-list key anywhere.
     G1–G4  event types: add, rename + retag, delete, Reset to standard            → `eventdefs`
     G5     + Event row, − Event row                                              → `eventrows`
     G6     figures (Rearrange → the column's figure list): ▼ move, 👁 hide, Reset   → `figorder` / `fighidden`
     G7     manning rows (Rearrange): archive a row, bring it back, drag a row      → `manninghidden` / `manningorder`
     G8     a manning row's thresholds: Save, Reset to default                    → `manningdefs`
     G9     groups: add, drag to reorder, remove                                  → `groupdefs` (+ colours / who-wins)
   Run from scripts/handpass:  node dbrA-W3-g.mjs */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-g.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, sheetNow, closeSheets, lwReload, pic, row, rowsSummary } = W
const SET = k => /^leavewar\/[a-z]+$/.test(k)
const OLD = ['wars', 'openings', 'ledger', 'postouts', 'perslabels', 'personedits'].map(k => 'leavewar/' + k)

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const page = await W.newPage(ctx, errors, 'A')
const passNow = (from) => L.results.slice(from).every(r => r.ok)
async function run(name, fn) {
  try { await fn() } catch (e) {
    L.check(`${name} — the step ran`, false, 'THREW ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 400))
    await pic(page, `G-THREW-${name}`).catch(() => {})
    row({ step: name, width: 'desktop', did: 'THREW', screen: String(e && e.message || e).slice(0, 200), rows: '', ok: false })
    await closeSheets(page).catch(() => {})
    if (await page.locator('[data-testid="roster-arrange"][aria-pressed="true"]:visible').count()) await page.locator('[data-testid="roster-arrange"]:visible').click().catch(() => {})
  }
}
const only = (a, keys) => a.put.every(k => keys.includes(k)) && a.del.every(k => keys.includes(k)) && (a.put.length + a.del.length) >= 1 && a.batches.length === 1
const noOld = async (name) => { const r = await L.rows(page); const bad = OLD.filter(k => k in r); return L.check(`${name} — no personedits key and no retired whole-list key in storage`, !bad.length, bad) }
const arrange = async (on) => { const b = page.locator('[data-testid="roster-arrange"]:visible').first(); const is = (await b.getAttribute('aria-pressed')) === 'true'; if (is !== on) { await b.click(); await L.sleep(600) } }
/** one configuration gesture: its rows (only `keys`, one batch), a reload, and what the screen lists before/after */
async function cfg(name, did, keys, fn, read) {
  const k0 = L.results.length
  const a = await L.step(page, name, fn)
  L.check(`${name} — only ${keys.join(' / ')} changed, in ONE batch`, only(a, keys), { put: a.put, del: a.del, batches: a.batches })
  const before = read ? await read() : null
  await lwReload(page, name, 'a', [])
  await lwOpen(page, '2026-01-05')
  const after = read ? await read() : null
  if (read) L.check(`${name} — after the reload the screen lists exactly the same`, JSON.stringify(before) === JSON.stringify(after), { before, after })
  await noOld(name)
  return { a, before, after, k0, did }
}
const shotRow = async (n, r) => { await pic(page, n); row({ step: r.name, width: 'desktop', did: r.did, screen: JSON.stringify(r.after).slice(0, 400), rows: rowsSummary(r.a), ok: passNow(r.k0) }) }

await L.signIn(page, 'a')
await L.settle(page)
{
  const r0 = await L.rows(page)
  const b = Object.keys(r0).filter(k => k.startsWith('changes/')).map(k => JSON.parse(r0[k]))
  const ok = L.check('G0 first boot — ONE change-log batch, of type boot', b.length === 1 && b[0].type === 'boot', b.map(x => ({ type: x.type, n: (x.items || []).length })))
  row({ step: 'G0 first boot', width: 'desktop', did: 'fresh world, Saber', screen: '—', rows: `batches ${b.map(x => x.type + '/' + (x.items || []).length).join(' ')}`, ok, pics: [] })
  await noOld('G0')
}
await lwOpen(page, '2026-01-05')

/* ---- event types, reached the way a person does: tap an EVENT box, "Edit types" ---- */
async function openTypes() {
  await lwOpen(page, '2026-01-06')
  const c = page.locator('[data-testid="event-0-2026-01-06"]').first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(250)
  await c.click(); await L.sleep(500)
  await page.locator('[data-testid="event-edit-types"]').click(); await L.sleep(400)
}
async function closeTypes() {
  const d = page.locator('[data-testid="types-done"]:visible'); if (await d.count()) { await d.click(); await L.sleep(300) }
  const x = page.locator('[data-testid="event-cancel"]:visible'); if (await x.count()) { await x.click(); await L.sleep(300) }
  await closeSheets(page)
}
async function readTypes() {
  await openTypes()
  const t = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="evtype-name-"]')].map((e, i) => {
    const row = e.closest('.evtype'); const on = row ? row.querySelector('.evkind.on') : null
    return `${e.value}:${on ? [...on.classList].find(c => ['off', 'free', 'nolv', 'work'].includes(c)) : '?'}`
  }))
  await closeTypes()
  return t
}
const idxOf = async (name) => page.evaluate(n => [...document.querySelectorAll('[data-testid^="evtype-name-"]')].findIndex(e => e.value === n), name)

await run('G1 add type', async () => {
  const r = await cfg('G1 event types: add "W3 TYPE" (work)', 'EVENT 1 box → Edit types → name W3 TYPE, Work, ＋', ['leavewar/eventdefs'], async () => {
    await openTypes()
    await page.fill('[data-testid="evtype-add-name"]', 'W3 TYPE')
    await page.locator('[data-testid="evtype-add-kind-work"]').click(); await L.sleep(150)
    await page.locator('[data-testid="evtype-add-btn"]').click(); await L.sleep(500)
    await pic(page, 'G1-types-added')
    await closeTypes()
  }, readTypes)
  L.check('G1 — W3 TYPE (work) is listed after the reload', r.after.includes('W3 TYPE:work'), r.after)
  await shotRow('G1-after-reload', { ...r, name: 'G1 event type added' })
})
await run('G2 edit type', async () => {
  const r = await cfg('G2a event types: rename W3 TYPE to "W3 TYPE2"', 'Edit types → rename W3 TYPE → W3 TYPE2 (Enter)', ['leavewar/eventdefs'], async () => {
    await openTypes()
    const i = await idxOf('W3 TYPE')
    const f = page.locator(`[data-testid="evtype-name-${i}"]`)
    await f.fill('W3 TYPE2'); await f.press('Enter'); await L.sleep(400)
    await closeTypes()
  }, readTypes)
  L.check('G2a — W3 TYPE2 listed, W3 TYPE gone, after the reload', r.after.includes('W3 TYPE2:work') && !r.after.some(x => x.startsWith('W3 TYPE:')), r.after)
  await shotRow('G2a-after-reload', { ...r, name: 'G2a event type renamed' })
  const t = await cfg('G2b event types: retag W3 TYPE2 as Free', 'Edit types → tap Free on W3 TYPE2', ['leavewar/eventdefs'], async () => {
    await openTypes()
    const j = await idxOf('W3 TYPE2')
    await page.locator(`[data-testid="evtype-kind-${j}-free"]`).click(); await L.sleep(400)
    await closeTypes()
  }, readTypes)
  L.check('G2b — W3 TYPE2 reads Free after the reload', t.after.includes('W3 TYPE2:free'), t.after)
  await shotRow('G2b-after-reload', { ...t, name: 'G2b event type retagged' })
})
await run('G3 delete type', async () => {
  const r = await cfg('G3 event types: delete W3 TYPE2', 'Edit types → ✕ on W3 TYPE2', ['leavewar/eventdefs'], async () => {
    await openTypes()
    const i = await idxOf('W3 TYPE2')
    await page.locator(`[data-testid="evtype-del-${i}"]`).click(); await L.sleep(400)
    await closeTypes()
  }, readTypes)
  L.check('G3 — W3 TYPE2 gone after the reload', !r.after.some(x => x.startsWith('W3 TYPE2')), r.after)
  await shotRow('G3-after-reload', { ...r, name: 'G3 event type deleted' })
})
let stdTypes = null
await run('G4 reset types', async () => {
  stdTypes = await readTypes()
  /* change one first so Reset has something to put back */
  await openTypes(); await page.locator('[data-testid="evtype-kind-0-work"]').click().catch(() => {}); await L.sleep(300); await closeTypes(); await L.settle(page)
  const r = await cfg('G4 event types: Reset to standard', 'Edit types → retag the first type, then Reset to standard', ['leavewar/eventdefs'], async () => {
    await openTypes(); await page.locator('[data-testid="types-reset"]').click(); await L.sleep(400); await closeTypes()
  }, readTypes)
  L.check('G4 — after Reset and a reload the list is the standard list again', JSON.stringify(r.after) === JSON.stringify(stdTypes), { std: stdTypes, after: r.after })
  await shotRow('G4-after-reload', { ...r, name: 'G4 event types reset' })
})

/* ---- event rows ---- */
const eventRows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-row-"]')].map(e => e.getAttribute('data-testid')))
await run('G5 event rows', async () => {
  const add = await cfg('G5 ⚙ → ＋ Event row', '⚙ → ＋ Event row', ['leavewar/eventrows'], async () => {
    await page.locator('[data-testid="settings-open"]:visible').first().click(); await L.sleep(500)
    await page.locator('[data-testid="event-add"]:visible').click(); await L.sleep(400); await closeSheets(page)
  }, eventRows)
  L.check('G5 — three event rows after the reload', add.after.length === 3, add.after)
  await shotRow('G5-row-added-after-reload', { ...add, name: 'G5 + Event row' })
  const rem = await cfg('G5 ⚙ → － Event row', '⚙ → － Event row', ['leavewar/eventrows'], async () => {
    await page.locator('[data-testid="settings-open"]:visible').first().click(); await L.sleep(500)
    await page.locator('[data-testid="event-remove"]:visible').click(); await L.sleep(400); await closeSheets(page)
  }, eventRows)
  L.check('G5 — back to two event rows after the reload', rem.after.length === 2, rem.after)
  await shotRow('G5-row-removed-after-reload', { ...rem, name: 'G5 − Event row' })
})

/* ---- figures (the balance column's figure list, in Rearrange) ---- */
async function readFigures() {
  await page.locator('[data-testid="counter-pick"]:visible').first().click(); await L.sleep(500)
  const f = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="figrow-"]')].map(e => `${e.getAttribute('data-testid').slice(7)}${e.classList.contains('hidden') ? '(hidden)' : ''}`))
  await closeSheets(page)
  return f
}
await run('G6 figures', async () => {
  const f0 = await readFigures()
  const first = f0[0].replace('(hidden)', '')
  const mv = await cfg(`G6 figures: ▼ move "${first}" down`, 'Rearrange → the column head → ▼ on the first figure', ['leavewar/figorder'], async () => {
    await arrange(true)
    await page.locator('[data-testid="counter-pick"]:visible').first().click(); await L.sleep(500)
    await page.locator(`[data-testid="figdown-${first}"]`).click(); await L.sleep(400)
    await pic(page, 'G6-figures-arranging')
    await closeSheets(page); await arrange(false)
  }, readFigures)
  L.check('G6 — the first figure is second after the reload', mv.after[1] && mv.after[1].startsWith(first), { before: f0, after: mv.after })
  await shotRow('G6-moved-after-reload', { ...mv, name: 'G6 figure moved' })
  const hideId = f0[f0.length - 1].replace('(hidden)', '')
  const hd = await cfg(`G6 figures: 👁 hide "${hideId}"`, 'Rearrange → the column head → 👁 on the last figure', ['leavewar/fighidden'], async () => {
    await arrange(true)
    await page.locator('[data-testid="counter-pick"]:visible').first().click(); await L.sleep(500)
    await page.locator(`[data-testid="figeye-${hideId}"]`).click(); await L.sleep(400)
    await closeSheets(page); await arrange(false)
  }, async () => { await arrange(true); const f = await readFigures(); await arrange(false); return f })
  L.check('G6 — that figure reads hidden after the reload', hd.after.some(x => x === `${hideId}(hidden)`), hd.after)
  await shotRow('G6-hidden-after-reload', { ...hd, name: 'G6 figure hidden' })
  const rs = await cfg('G6 figures: Reset', 'Rearrange → the column head → Reset', ['leavewar/figorder', 'leavewar/fighidden'], async () => {
    await arrange(true)
    await page.locator('[data-testid="counter-pick"]:visible').first().click(); await L.sleep(500)
    await page.locator('[data-testid="counter-reset"]').click(); await L.sleep(400)
    await closeSheets(page); await arrange(false)
  }, async () => { await arrange(true); const f = await readFigures(); await arrange(false); return f })
  L.check('G6 — after Reset and a reload the order is the original', rs.after.map(x => x.replace('(hidden)', '')).join() === f0.map(x => x.replace('(hidden)', '')).join(), { f0, after: rs.after })
  await shotRow('G6-reset-after-reload', { ...rs, name: 'G6 figures reset' })
})

/* ---- manning rows (Rearrange) ---- */
const manning = () => page.evaluate(() => [...document.querySelectorAll('tr[data-testid^="count-"]')].map(e => `${e.getAttribute('data-testid').slice(6)}${e.classList.contains('mrow-hidden') ? '(archived)' : ''}`))
await run('G7 manning rows', async () => {
  const m0 = await manning()
  const hid = 'wmp'
  const h = await cfg(`G7 manning: archive the "${hid}" row`, 'Rearrange → 👁 on WM P', ['leavewar/manninghidden'], async () => {
    await arrange(true); await page.locator(`[data-testid="manning-hide-${hid}"]`).click(); await L.sleep(400); await arrange(false)
  }, manning)
  L.check('G7 — WM P gone from the manning rows after the reload', !h.after.includes(hid), h.after)
  await shotRow('G7-archived-after-reload', { ...h, name: 'G7 manning row archived' })
  const r = await cfg(`G7 manning: bring "${hid}" back`, 'Rearrange → ↺ on the archived WM P', ['leavewar/manninghidden'], async () => {
    await arrange(true)
    const bar = page.locator('[data-testid="manning-archive"]:visible').first()
    if (!(await page.locator(`[data-testid="manning-restore-${hid}"]:visible`).count()) && await bar.count()) { await bar.click().catch(() => {}); await L.sleep(300) }
    await page.locator(`[data-testid="manning-restore-${hid}"]`).first().click(); await L.sleep(400); await arrange(false)
  }, manning)
  L.check('G7 — WM P back in its old place after the reload', JSON.stringify(r.after) === JSON.stringify(m0), { m0, after: r.after })
  await shotRow('G7-restored-after-reload', { ...r, name: 'G7 manning row restored' })
  const d = await cfg('G7 manning: drag the SC N row above the IP row', 'Rearrange → drag SC N\'s ⠿ onto IP', ['leavewar/manningorder'], async () => {
    await arrange(true)
    const g = page.locator('[data-testid="manning-drag-scn"]:visible').first()
    await g.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
    const gb = await g.boundingBox(), tb = await page.locator('tr[data-testid="count-ip"]').first().boundingBox()
    await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2); await page.mouse.down()
    await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2 - 6, { steps: 3 })
    await page.mouse.move(gb.x + gb.width / 2, tb.y + tb.height * 0.25, { steps: 16 }); await L.sleep(200)
    await page.mouse.up(); await L.sleep(600)
    await arrange(false)
  }, manning)
  L.check('G7 — SC N sits above IP after the reload', d.after.indexOf('scn') > -1 && d.after.indexOf('scn') < d.after.indexOf('ip'), d.after)
  await shotRow('G7-dragged-after-reload', { ...d, name: 'G7 manning row dragged' })
})

/* ---- a manning row's thresholds ---- */
const thresholds = async () => {
  await page.locator('[data-testid="manning-info-ip"]:visible').first().click(); await L.sleep(500)
  const t = { amber: await page.locator('[data-testid="thresh-amber"]').inputValue(), red: await page.locator('[data-testid="thresh-red"]').inputValue(), when: (await page.locator('[data-testid="manning-when"]').innerText().catch(() => '')).replace(/\s+/g, ' ').trim() }
  await closeSheets(page)
  return t
}
await run('G8 thresholds', async () => {
  const t0 = await thresholds()
  const s = await cfg('G8 IP row: amber below 14, red below 12, Save', 'tap the IP row name → Amber 14, Red 12 → Save', ['leavewar/manningdefs'], async () => {
    await page.locator('[data-testid="manning-info-ip"]:visible').first().click(); await L.sleep(500)
    await page.fill('[data-testid="thresh-amber"]', '14'); await page.fill('[data-testid="thresh-red"]', '12')
    await page.locator('[data-testid="thresh-save"]').click(); await L.sleep(500)
    await pic(page, 'G8-thresholds-saved')
    await closeSheets(page)
  }, thresholds)
  L.check('G8 — 14 / 12 after the reload', s.after.amber === '14' && s.after.red === '12', { t0, after: s.after })
  await shotRow('G8-saved-after-reload', { ...s, name: 'G8 thresholds saved' })
  const rs = await cfg('G8 IP row: Reset to default', 'tap the IP row name → Reset to default', ['leavewar/manningdefs'], async () => {
    await page.locator('[data-testid="manning-info-ip"]:visible').first().click(); await L.sleep(500)
    await page.locator('[data-testid="thresh-reset"]').click(); await L.sleep(500); await closeSheets(page)
  }, thresholds)
  L.check('G8 — back to the default after the reload', rs.after.amber === t0.amber && rs.after.red === t0.red, { t0, after: rs.after })
  await shotRow('G8-reset-after-reload', { ...rs, name: 'G8 thresholds reset' })
})

/* ---- groups ---- */
/* the groups CHOSEN, top to bottom, as the ⚙ sheet lists them (a group nobody holds — TF in the demo — is chosen but
   draws no heading on the grid, so the grid's headings are not the list to read) */
const groups = async () => {
  await page.locator('[data-testid="settings-open"]:visible').first().click(); await L.sleep(500)
  const g = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="grow-"]')].map(e => e.getAttribute('data-testid').slice(5)))
  await closeSheets(page)
  return g
}
await run('G9 groups', async () => {
  const gid = 'q:tf'
  const ad = await cfg('G9 ⚙ → Add a group: TF', '⚙ → + TF (its palette opens) → closed', ['leavewar/groupdefs'], async () => {
    await page.locator('[data-testid="settings-open"]:visible').first().click(); await L.sleep(500)
    await page.locator(`[data-testid="gadd-${gid}"]`).click(); await L.sleep(400); await closeSheets(page)
  }, groups)
  L.check('G9 — TF is a chosen group after the reload', ad.after.includes(gid), ad.after)
  await shotRow('G9-added-after-reload', { ...ad, name: 'G9 group added' })
  const dr = await cfg('G9 ⚙ → drag TF\'s ⠿ above IP', '⚙ → drag TF\'s ⠿ onto the IP row', ['leavewar/groupdefs', 'leavewar/grouppriority'], async () => {
    await page.locator('[data-testid="settings-open"]:visible').first().click(); await L.sleep(500)
    const g = page.locator(`[data-testid="gsdrag-${gid}"]`).first()
    await g.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
    const gb = await g.boundingBox(), tb = await page.locator('[data-testid="grow-IP"]').first().boundingBox()
    await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2); await page.mouse.down()
    await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2 - 6, { steps: 3 })
    await page.mouse.move(gb.x + gb.width / 2, tb.y + tb.height * 0.25, { steps: 16 }); await L.sleep(200)
    await pic(page, 'G9-group-dragging')
    await page.mouse.up(); await L.sleep(600); await closeSheets(page)
  }, groups)
  L.check('G9 — TF above IP after the reload', dr.after.indexOf(gid) > -1 && dr.after.indexOf(gid) < dr.after.indexOf('IP'), dr.after)
  await shotRow('G9-dragged-after-reload', { ...dr, name: 'G9 group dragged' })
  const rm = await cfg('G9 ⚙ → remove TF', '⚙ → ✕ on the TF row', ['leavewar/groupdefs', 'leavewar/groupcolors', 'leavewar/grouppriority'], async () => {
    await page.locator('[data-testid="settings-open"]:visible').first().click(); await L.sleep(500)
    await page.locator(`[data-testid="gdrop-${gid}"]`).click(); await L.sleep(400); await closeSheets(page)
  }, groups)
  L.check('G9 — TF gone after the reload', !rm.after.includes(gid), rm.after)
  await shotRow('G9-removed-after-reload', { ...rm, name: 'G9 group removed' })
})

await noOld('G-end')
L.check('part G — no console errors, page errors, failed requests or native dialogs', !errors.length, errors.slice(0, 20))
L.save({ table: W.TABLE, errors })
await browser.close()
