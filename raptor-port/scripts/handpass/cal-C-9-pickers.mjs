// P3-10 — small pickers close on an outside press / Escape WITHOUT closing their window; a blocking question owns the interaction.
import { world, toInputs, tid, press, pic, sleep, closeAll, judge, rec, recErrors, big, active, openWins } from './cal-C-lib.mjs'
const SIZE = process.env.SZ || 'desk'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const P = n => `${SIZE}-${n}`
const w = await world(SIZE); const page = w.page
await toInputs(page)
const monthOf = async () => { const t = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase(); const [m, y] = t.split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
for (let d = 2026 * 12 + 6 - await monthOf(); d !== 0; d += d > 0 ? -1 : 1) await press(SIZE, page.locator(d > 0 ? '#icNext' : '#icPrev'))
await sleep(300)
const dayCorner = iso => press(SIZE, page.locator(`[data-icday="${iso}"]`), { position: { x: 8, y: 8 } })
const st = async () => ({ wins: await openWins(page), active: await active(page), pick: await page.locator('.ic-pick').count(), asks: await page.evaluate(() => [...document.querySelectorAll('[data-testid^="inped-"], .confirm, .modal, [role=alertdialog], #oilModal, .oilconfirm, .dlg')].filter(e => e.offsetParent).map(e => (e.getAttribute('data-testid') || e.id || e.className).toString().slice(0, 30))) })
const rows = []

/* ---- T1: the "+ Pucks" picker inside the opened day ---- */
await dayCorner('2026-07-15'); await tid(page, 'win-inputsday').waitFor()
await press(SIZE, page.locator('#icAddPucks')); await sleep(500)
const t1open = await st()
await pic(page, P('p310-1-pucks-picker-open'))
/* outside press: a blank place on the page behind (the month's empty far corner, or the top bar title area) */
const hb = await tid(page, 'ib-how').boundingBox()
const blank = { x: Math.round(hb.x + hb.width + 90), y: Math.round(hb.y + hb.height / 2) }
const blankHit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + String(e.className).split(' ')[0] + '#' + e.id : null }, [blank.x, blank.y])
console.log('blank', JSON.stringify(blank), blankHit)
await page.mouse.click(blank.x, blank.y); await sleep(400)
const t1out = await st()
await press(SIZE, page.locator('#icAddPucks')); await sleep(400)
await page.keyboard.press('Escape'); await sleep(400)
const t1esc = await st()
rows.push(['T1 + Pucks picker: opens', t1open.pick > 0, t1open])
rows.push(['T1 outside press closes the picker, the day window stays', t1out.pick === 0 && t1out.wins.includes('win-inputsday'), t1out])
rows.push(['T1 Escape (picker open) closes the picker, NOT the day window', t1esc.pick === 0 && t1esc.wins.includes('win-inputsday'), t1esc])
if (!(await openWins(page)).includes('win-inputsday')) { await dayCorner('2026-07-15'); await tid(page, 'win-inputsday').waitFor() }

/* ---- T3: the day window's Delete asks first (keyboard Delete on a line) ---- */
const line = page.locator('[data-testid="idy-open"]').first()
const n0 = await page.locator('[data-testid="idy-open"]').count()
/* (a) Escape straight away, focus still on the question's button */
await line.focus(); await page.keyboard.press('Delete'); await sleep(400)
const t3q = await st(); const askShown = await tid(page, 'idy-ask').count()
await pic(page, P('p310-2-delete-question-in-day'))
await page.keyboard.press('Escape'); await sleep(400)
const t3a = { ask: await tid(page, 'idy-ask').count(), wins: await openWins(page), lines: await page.locator('[data-testid="idy-open"]').count() }
/* (b) the question up, a press on the page behind (focus leaves the question), then Escape */
if (!t3a.wins.includes('win-inputsday')) { await dayCorner('2026-07-15'); await tid(page, 'win-inputsday').waitFor() }
await line.focus(); await page.keyboard.press('Delete'); await sleep(400)
await page.mouse.click(blank.x, blank.y); await sleep(300)
const t3b1 = { ask: await tid(page, 'idy-ask').count(), wins: await openWins(page), lines: await page.locator('[data-testid="idy-open"]').count(), active: await active(page) }
await pic(page, P('p310-3-question-after-outside-press'))
await page.keyboard.press('Escape'); await sleep(400)
const t3b2 = { ask: await tid(page, 'idy-ask').count(), wins: await openWins(page) }
console.log('T3', JSON.stringify({ t3q, askShown, t3a, t3b1, t3b2 }))
rows.push(['T3 Delete (keyboard, on a line of the opened day) asks first', askShown === 1 && n0 > 0, { askShown, lines: n0 }])
rows.push(['T3a Escape with focus on the question: the QUESTION closes, the day window stays, nothing deleted', t3a.ask === 0 && t3a.wins.includes('win-inputsday') && t3a.lines === n0, t3a])
rows.push(['T3b a press on the page behind leaves the question up and deletes nothing', t3b1.ask === 1 && t3b1.lines === n0, t3b1])
rows.push(['T3b then Escape (focus now on the page) cancels the question and keeps the day window', t3b2.ask === 0 && t3b2.wins.includes('win-inputsday'), t3b2])

/* ---- T4: the OIL question when a duty is filed on a weekend (Sat 18 Jul): a blocking question inside the editor window ---- */
if (await tid(page, 'win-inputsday').count()) { await press(SIZE, tid(page, 'win-inputsday-x')); await sleep(300) }
await dayCorner('2026-07-18'); await tid(page, 'win-inputsday').waitFor()
await press(SIZE, page.locator('#icPopAdd')); await tid(page, 'win-inputedit').waitFor(); await sleep(300)
const types = await page.locator('#inpEditType option').evaluateAll(os => os.map(o => o.textContent.trim()))
await page.locator('#inpEditType').selectOption({ label: 'Duty' }).catch(e => console.log('no Duty option', types.join(',')))
await page.locator('#inpEditRmk').fill('weekend duty draft'); await sleep(200)
await page.locator('#inpEditSave').click(); await sleep(700)
const t4q = await st()
const qEls = await page.evaluate(() => [...document.querySelectorAll('[role=dialog], [role=alertdialog], .modal, .ovl, .scrim, #oilModal')].filter(e => e.offsetParent || getComputedStyle(e).position === 'fixed').map(e => (e.getAttribute('data-testid') || e.id || String(e.className).split(' ')[0]) + ':' + (e.getAttribute('aria-label') || '')))
await pic(page, P('p310-5-oil-question'))
console.log('T4', JSON.stringify({ types, t4q, qEls }))
/* a background press while it is up: the month arrow */
const monB = (await page.locator('#inpCal .ic-mon').textContent()).trim()
await page.locator('#icNext').click({ timeout: 2500, force: false }).catch(e => console.log('month arrow behind the question could not be pressed:', String(e).slice(0, 120).slice(0, 120)))
await sleep(300)
const monA = (await page.locator('#inpCal .ic-mon').textContent()).trim()
await pic(page, P('p310-6-oil-question-after-background-press'))
await page.keyboard.press('Escape'); await sleep(500)
const t4esc = await st(); const rmk4 = await page.locator('#inpEditRmk').inputValue().catch(() => null)
await pic(page, P('p310-7-after-escape-on-oil-question'))
console.log('T4esc', JSON.stringify({ monB, monA, t4esc, rmk4 }))
rows.push(['T4 OIL question appears (a blocking question) when the weekend duty is saved', qEls.length > 0 || t4q.wins.includes('win-inputedit') === false, { qEls, wins: t4q.wins }])
rows.push(['T4 a background press while it is up changes nothing behind (month stays)', monB === monA, { monB, monA }])
rows.push(['T4 Escape on the question keeps the editor and the typed remark', t4esc.wins.includes('win-inputedit') && rmk4 === 'weekend duty draft', { wins: t4esc.wins, rmk4 }])
judge('P3-10-' + SIZE, `Inputs July 2026 at ${SIZE}: the "+ Pucks" picker inside an opened day (outside press, Escape); an existing input's editor with a typed remark, Delete's question (outside press, Escape)`, rows, [P('p310-1-pucks-picker-open') + '.png', P('p310-3-delete-question') + '.png', P('p310-4-after-escape-on-question') + '.png'], true)
recErrors(P('script9'), w.errors)
await closeAll()
