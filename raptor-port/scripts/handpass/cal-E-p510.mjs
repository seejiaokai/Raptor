// P5-10 — Calendar/List filters agree without damaging single-person List behaviour.
import { launch, world, toInputs, toMonth, cell, bar, shot, press, saveRows, makeInput, closeDay, recOf } from './cal-E-lib.mjs'
const size = process.argv[2] || 'desk'
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const res = {}
const w = await world(b, size); const p = w.page
const N = n => `p510-${size}-${n}`
await toInputs(p)
// the solo (Saber, LL) and the shared (Piston first, Blade, Trident — Meeting) through the app's own editor, on Wed 14 Oct
const [solo] = await makeInput(p, size, '2026-10-14', { type: 'LL', remarks: 'solo row' })
// shared: open "+ Input" again, switch Several people, pick three, Meeting, remarks
const isOpen = await p.locator('#icPopAdd').count()
await press(p, size, p.locator('#icPopAdd')); await p.waitForSelector('#inpEditPop')
await press(p, size, p.locator('#inpEditPop [data-testid="pp-several"]'))
for (const id of ['pump', 'slash', 'harpoon']) { const e = p.locator(`#inpEditPop [data-pp="${id}"]`); await e.scrollIntoViewIfNeeded(); await press(p, size, e) }
await p.selectOption('#inpEditType', { label: 'Meeting' })
await p.fill('#inpEditRmk', 'shared meeting')
await shot(p, N('0-shared-editor'))
await press(p, size, p.locator('#inpEditSave')); await p.waitForTimeout(600)
const sh = await p.evaluate(() => window.INPUTS.filter(x => x.grp && x.date === 'Oct 14').map(x => x.iid))
L('solo', solo, 'shared records', JSON.stringify(sh), 'persons', JSON.stringify(await p.evaluate(ids => ids.map(i => window.PEOPLE[window.INPUTS.find(x => x.iid === i).person].cs), sh)))
await closeDay(p)
const sharedLabel = async () => p.evaluate(() => [...document.querySelectorAll('.ib-bar')].filter(e => /\+2/.test(e.textContent)).map(e => e.textContent))
// filters are on the Inputs tab; on a phone they fold behind one button
const openFilters = async () => { if (!size.startsWith('desk') && !size.startsWith('wide')) { if (!(await p.locator('#inFSearch').isVisible())) { await p.locator('#inFiltersBtn').tap(); await p.waitForTimeout(200) } } }
const barsNow = () => p.evaluate(() => [...document.querySelectorAll('.ib-bar')].map(e => e.textContent))
L('unfiltered bars on the month:', JSON.stringify(await barsNow()).slice(0, 300))
await shot(p, N('1-month-unfiltered'))
// --- person filter: a man who is in the shared entry ONLY (Trident)
await openFilters()
await p.selectOption('#inFPerson', { label: 'Trident' }); await p.waitForTimeout(500)
const tBars = await barsNow(); L('Calendar, person = Trident:', JSON.stringify(tBars)); res.calTrident = tBars
await shot(p, N('2-month-trident'))
await press(p, size, p.locator('#inListBtn')); await p.waitForTimeout(500)
const rows = () => p.evaluate(() => [...document.querySelectorAll('#inBody tr')].map(r => ({ iid: r.dataset.iid, cells: [...r.children].map(c => c.innerText.replace(/\n/g, ' ').slice(0, 60)), edit: r.querySelectorAll('[data-edit]').length, del: r.querySelectorAll('.rmx').length, title: r.children[0]?.title || '' })))
const lt = await rows(); L('List, person = Trident:', JSON.stringify(lt)); res.listTrident = lt
await shot(p, N('3-list-trident'))
// --- type filters
await openFilters()
await p.selectOption('#inFPerson', { label: 'Everyone' })
await p.selectOption('#inFType', { index: 1 }).catch(() => {})
L('type options:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#inFType option')].map(o => o.textContent))))
await p.selectOption('#inFType', { label: 'Meeting' }); await p.waitForTimeout(400)
const lm = await rows(); L('List, type = Meeting:', JSON.stringify(lm.map(r => r.cells.slice(0, 4).join('/')))); res.listMeeting = lm.map(r => r.cells.slice(0, 4).join('/'))
await shot(p, N('4-list-meeting'))
await p.selectOption('#inFType', { label: 'LL' }); await p.waitForTimeout(400)
const ll = await rows(); L('List, type = LL:', JSON.stringify(ll.map(r => r.cells.slice(0, 4).join('/')))); res.listLL = ll.map(r => r.cells.slice(0, 4).join('/'))
// person AND type that cannot both match: Trident + LL -> nothing
await p.selectOption('#inFPerson', { label: 'Trident' }); await p.waitForTimeout(300)
const none = await rows(); L('List, Trident + LL:', JSON.stringify(none.length)); res.noneBoth = none.length
// search text of the shared remark
await p.selectOption('#inFPerson', { label: 'Everyone' }); await p.selectOption('#inFType', { index: 0 })
await p.fill('#inFSearch', 'blade'); await p.waitForTimeout(400)
const ls = await rows(); L('List, search "blade" (a man only in the shared one):', JSON.stringify(ls.map(r => r.cells.slice(0, 2).join('/')))); res.search = ls.map(r => r.cells.slice(0, 2).join('/'))
await p.fill('#inFSearch', '')
await p.waitForTimeout(300)
// --- back to the Calendar with person = Trident: still one bar
await p.selectOption('#inFPerson', { label: 'Trident' })
await press(p, size, p.locator('#inCalBtn')); await p.waitForTimeout(500)
const tb2 = await barsNow(); L('Calendar again, person = Trident:', JSON.stringify(tb2)); res.calTrident2 = tb2
await p.selectOption('#inFPerson', { label: 'Everyone' }); await p.waitForTimeout(300)
// --- solo List editing still as before: inline edit, sort, add, delete
await press(p, size, p.locator('#inListBtn')); await p.waitForTimeout(500)
const soloRow = `#inBody tr[data-iid="${solo}"]`
const sr = await p.evaluate(sel => { const r = document.querySelector(sel); return r ? { edit: r.querySelectorAll('[data-edit]').length, del: r.querySelectorAll('.rmx').length } : null }, soloRow)
L('solo row actions', JSON.stringify(sr)); res.soloActions = sr
await press(p, size, p.locator(`${soloRow} [data-edit]`)); await p.waitForTimeout(300)
const rmk = p.locator(`${soloRow} td[data-fld="Remarks"] input`).first()
await rmk.fill('solo row edited inline')
await shot(p, N('5-solo-inline'))
await press(p, size, p.locator(`${soloRow} .inact span`).first()); await p.waitForTimeout(500)
L('after inline save: record remarks', (await recOf(p, solo)).remarks, '| editor windows', await p.locator('[data-testid="win-inputedit"]').count())
res.inline = (await recOf(p, solo)).remarks
// shared row: one pencil only, and it opens the editor window
L('rows now', JSON.stringify((await rows()).map(r => r.cells.slice(0, 3).join('/'))), 'filters', JSON.stringify(await p.evaluate(() => [document.getElementById('inFPerson').value, document.getElementById('inFType').value, document.getElementById('inFSearch').value]))); await shot(p, N('5b-before-shared'))
const sharedRow = await p.evaluate(() => { const r = [...document.querySelectorAll('#inBody tr')].find(x => /\+3/.test(x.innerText)); return r ? { iid: r.dataset.iid, edit: r.querySelectorAll('[data-edit]').length, del: r.querySelectorAll('.rmx').length, chip: r.querySelectorAll('[class*="oil"]').length, text: r.innerText.replace(/\n/g, ' ').slice(0, 120) } : null })
L('shared row', JSON.stringify(sharedRow)); res.sharedRow = sharedRow
await press(p, size, p.locator(`#inBody tr[data-iid="${sharedRow.iid}"] [data-edit]`)); await p.waitForTimeout(500)
L('shared pencil opens: window', await p.locator('[data-testid="win-inputedit"] .win-ttl').innerText().catch(() => 'none'))
await shot(p, N('6-shared-pencil'))
await press(p, size, p.locator('[data-testid="win-inputedit-x"]')); await p.waitForTimeout(300)
// sort: click the Name header twice
const names = () => p.evaluate(() => [...document.querySelectorAll('#inBody tr')].map(r => r.children[0].innerText.replace(/\n/g, ' ')))
const n0 = await names()
if (size === 'desk') await press(p, size, p.locator('#intbl th', { hasText: /name/i }).first()); await p.waitForTimeout(300)
const n1 = await names()
if (size === 'desk') await press(p, size, p.locator('#intbl th', { hasText: /name/i }).first()); await p.waitForTimeout(300)
const n2 = await names()
L('sort by Name:', JSON.stringify(n0), '->', JSON.stringify(n1), '->', JSON.stringify(n2)); res.sort = [n0, n1, n2]
// delete the solo row with ✕
const before = await p.evaluate(() => window.INPUTS.length)
await press(p, size, p.locator(`${soloRow} .rmx`)); await p.waitForTimeout(500)
const askTxt = await p.evaluate(() => document.body.innerText.match(/Delete[^\n]{0,80}\?/)?.[0] || '')
L('after ✕ on the solo row: records', before, '->', await p.evaluate(() => window.INPUTS.length), '| ask:', askTxt)
await shot(p, N('7-solo-delete'))
// answer if asked
const yes = p.locator('button', { hasText: /^(Delete|Yes|Remove|Confirm)/ }).first()
if (await p.evaluate(() => window.INPUTS.length) === before && await yes.count()) { await press(p, size, yes); await p.waitForTimeout(400); L('after confirm: records', await p.evaluate(() => window.INPUTS.length)) }
res.soloGone = !(await p.evaluate(i => !!window.INPUTS.find(x => x.iid === i), solo))
// add: the List's Add form (solo)
const addBefore = await p.evaluate(() => window.INPUTS.length)
// the form needs a start date first ("pick a start date"): go to Oct, pick the 16th in the form's own calendar, then Add
await p.evaluate(() => scrollTo(0, 0))
await shot(p, N('8-add-form'))
for (let i = 0; i < 4; i++) { const lab = await p.locator('#inCal').innerText(); if (/OCT/i.test(lab)) break; await press(p, size, p.locator('#inCal button[aria-label="Next month"]').first()) }
await press(p, size, p.locator('#inCal button[aria-label="16 Oct 2026"]').first()); await p.waitForTimeout(200)
await p.fill('#inRemarks', 'added from the List form')
await press(p, size, p.locator('#inAdd')); await p.waitForTimeout(500)
L('List Add form adds a solo: records', addBefore, '->', await p.evaluate(() => window.INPUTS.length))
res.addWorks = (await p.evaluate(() => window.INPUTS.length)) === addBefore + 1
L('errors', JSON.stringify(w.errors))
saveRows('p510-' + size, [{ log, res, errors: w.errors }])
await b.close()
