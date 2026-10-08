// P5-09 — the opened day puts planning first and inputs afterward; LATE explains itself; Delete asks and removes only the selected entry.
import { launch, world, toInputs, toMonth, cell, bar, shot, press, saveRows, seedFile, makeInput, recOf } from './cal-E-lib.mjs'
const size = process.argv[2] || 'desk'
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const res = {}
const w = await world(b, size); const p = w.page
const N = n => `p509-${size}-${n}`
await toInputs(p)
// two inputs through the app's own door (both will be LATE: filed today for the week of 19 Oct, cut-off 5 Oct) + one seeded earlier-filed (not late)
const [a] = await makeInput(p, size, '2026-10-20', { type: 'Duty', remarks: 'late duty' })
const [c] = await makeInput(p, size, '2026-10-20', { type: 'Meeting', remarks: 'late meeting', person: 'Ranger' })
const [s] = await seedFile(p, [{ who: 9, type: 'Appointment', from: 'Oct 20', timed: [900, 960], remarks: 'on-time appt', more: { mod: '2026-09-10', by: 'riddler', modBy: 'riddler', at: new Date(2026, 8, 10, 9, 0).getTime(), modAt: new Date(2026, 8, 10, 9, 0).getTime() } }])
await p.waitForTimeout(400)
L('inputs', a, c, s)
// open the day at its corner
if (await p.locator('[data-testid="win-inputsday"]').count() === 0) await press(p, size, cell(p, '2026-10-20'), { position: { x: 8, y: 8 } })
await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(300)
// PLANNING: a day title, a note, pucks — through the day window's own controls
const title = p.locator('[data-testid="win-inputsday"] input').first()
await title.click(); await title.fill('Wing exercise day'); await p.keyboard.press('Enter'); await p.waitForTimeout(200)
await press(p, size, p.locator('[data-testid="win-inputsday"] button', { hasText: '+ Note' })); await p.waitForTimeout(300)
L('after + Note, inputs in the window:', await p.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] input, [data-testid="win-inputsday"] textarea')].map(e => e.id + ':' + (e.placeholder || e.getAttribute('aria-label') || ''))))
await shot(p, N('0-after-note-click'))
const note = p.locator('[data-testid="win-inputsday"] input[placeholder*="brief the new guy"]').first()
await note.fill('Brief at 0800 in the squadron room'); await p.keyboard.press('Enter'); await p.waitForTimeout(300)
await press(p, size, p.locator('[data-testid="win-inputsday"] button', { hasText: '+ Pucks' })); await p.waitForTimeout(400)
await shot(p, N('0b-after-pucks-click'))
L('pucks picker buttons:', await p.evaluate(() => [...document.querySelectorAll('.ic-pick button, [class*="pick"] button')].slice(0, 8).map(e => e.textContent.trim())))
// tick one category and add
const cat = p.locator('.ic-pick button', { hasText: /^Saber/ }).first()
if (await cat.count()) { await press(p, size, cat); await press(p, size, p.locator('.ic-pick button', { hasText: /^Ranger/ }).first()); await p.waitForTimeout(200); await press(p, size, p.locator('button', { hasText: '✓ Add' }).last()); await p.waitForTimeout(400) }
await shot(p, N('1-opened-day'))
// ORDER: read the window's children top to bottom
const order = await p.evaluate(() => {
  const win = document.querySelector('[data-testid="win-inputsday"]')
  const body = win.querySelector('.win-body') || win
  const items = []
  const walk = el => { for (const ch of el.children) { const tid = ch.dataset.testid || ''; const cls = ch.className && ch.className.toString ? ch.className.toString() : ''; const r = ch.getBoundingClientRect(); items.push({ tid, cls: cls.slice(0, 40), top: Math.round(r.top), text: (ch.innerText || '').slice(0, 40).replace(/\n/g, ' ') }); if (ch.children.length && items.length < 60 && !tid.startsWith('idy-row')) walk(ch) } }
  walk(body)
  return items
})
L('window children, top to bottom:', JSON.stringify(order.map(o => o.top + ':' + (o.tid || o.cls) + ':' + o.text)))
res.order = order
const txt = await p.locator('[data-testid="win-inputsday"]').innerText()
L('window text:', JSON.stringify(txt.replace(/\n/g, ' | ')))
const posNote = txt.indexOf('Brief at 0800'), posTitle = 0, posInputs = txt.indexOf('INPUTS'), posPucks = txt.search(/Pucks|Ace|Anvil/)
L('index of note', posNote, 'of "INPUTS" heading', posInputs)
res.planningBeforeInputs = posNote >= 0 && posNote < posInputs
// the three input lines: placed-by line of each refers to its own input
const lines = await p.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] [data-testid^="idy-row-"]')].map(e => ({ id: e.dataset.popiid, who: e.querySelector('.idy-who')?.textContent, kind: e.querySelector('.idy-kind')?.textContent, rmk: e.querySelector('.sd-rmk')?.textContent, placed: e.querySelector('[data-testid="idy-placed"]')?.textContent, late: !!e.querySelector('[data-testid="idy-late"]') })))
L('lines', JSON.stringify(lines)); res.lines = lines
const recs = await p.evaluate(ids => ids.map(id => { const r = window.INPUTS.find(x => x.iid === id); return r && { id, by: window.PEOPLE[r.by]?.cs, person: window.PEOPLE[r.person]?.cs } }), [a, c, s])
L('records', JSON.stringify(recs)); res.recs = recs
// LATE: press it on the late duty
const lateBtn = p.locator(`[data-testid="idy-row-${a}"] [data-testid="idy-late"]`)
await press(p, size, lateBtn); await p.waitForTimeout(300)
const lateTxt = await p.evaluate(a => document.querySelector(`[data-testid="idy-row-${a}"]`)?.parentElement?.innerText.slice(0, 600).replace(/\n/g, ' | '), a)
L('after LATE pressed:', lateTxt)
res.lateExplain = await p.locator('[data-testid="win-inputsday"] [data-testid*="late"]').allInnerTexts()
await shot(p, N('2-late-explained'))
L('LATE explanation texts', JSON.stringify(res.lateExplain))
// Delete: cancel first (Keep), then confirm on the MIDDLE one (the meeting), check only that one goes
const before = await p.evaluate(() => window.INPUTS.map(x => x.iid).sort())
await p.locator(`[data-testid="idy-row-${c}"] [data-testid="idy-open"]`).focus(); await p.keyboard.press('Delete'); await p.waitForTimeout(300)
L('ask shown:', await p.locator('[data-testid="idy-del-yes"]').count(), 'inside the row of', await p.evaluate(() => document.querySelector('[data-testid="idy-del-yes"]')?.closest('[data-testid^="idy-row-"]')?.dataset.testid))
await shot(p, N('3-delete-asks'))
await press(p, size, p.locator('[data-testid="idy-del-no"]')); await p.waitForTimeout(300)
L('after Keep: records unchanged?', JSON.stringify(before) === JSON.stringify(await p.evaluate(() => window.INPUTS.map(x => x.iid).sort())))
res.keepOk = JSON.stringify(before) === JSON.stringify(await p.evaluate(() => window.INPUTS.map(x => x.iid).sort()))
await p.locator(`[data-testid="idy-row-${c}"] [data-testid="idy-open"]`).focus(); await p.keyboard.press('Delete'); await p.waitForTimeout(300)
await press(p, size, p.locator('[data-testid="idy-del-yes"]')); await p.waitForTimeout(500)
const after = await p.evaluate(() => window.INPUTS.map(x => x.iid).sort())
const gone = before.filter(x => !after.includes(x)), added = after.filter(x => !before.includes(x))
L('after confirm: removed', JSON.stringify(gone), 'expected', c, '| any added', JSON.stringify(added))
res.deleteOnly = gone.length === 1 && gone[0] === c
await shot(p, N('4-after-delete'))
L('day still lists planning + remaining inputs:', JSON.stringify((await p.locator('[data-testid="win-inputsday"]').innerText()).replace(/\n/g, ' | ').slice(0, 300)))
L('errors', JSON.stringify(w.errors))
saveRows('p509-' + size, [{ log, res, errors: w.errors }])
await b.close()
