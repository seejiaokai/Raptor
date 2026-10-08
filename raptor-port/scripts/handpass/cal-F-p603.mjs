import * as L from './cal-F-lib3.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE })
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const P = L.press(p, PHONE)
const [ace, anvil, basher, cinder, saber] = await L.ids(p, ['Ace', 'Anvil', 'Basher', 'Cinder', 'Saber'])
const pic = n => L.pic(p, `${TAG}-p603-${n}`)
const snap = () => p.evaluate(ids => window.INPUTS.filter(r => ids.includes(r.person) && r.type === 'Duty' && r.date === 'Jul 18').map(r => ({ cs: window.PEOPLE[r.person].cs, oil: r.oil, mod: r.mod, modAt: r.modAt, modBy: r.modBy, at: r.at, by: r.by, grp: r.grp, grpBy: r.grpBy, remarks: r.remarks })), [ace, anvil, basher, cinder])
const closeDay = async () => { if (await p.locator('[data-testid="win-inputsday-x"]').count()) { await P(p.locator('[data-testid="win-inputsday-x"]')); await L.sleep(250) } }
const entryBar = () => p.locator('#inpCal .ib-bar').filter({ hasText: /\+[0-9]/ }).first()

/* SETUP: the shared duty, OIL Yes */
await L.openNew(p, '2026-07-18', { phone: PHONE })
await p.selectOption('#inpEditType', 'Duty')
await L.pickSeveral(p, [ace, anvil, basher], { phone: PHONE })
await L.setWhen(p, { allday: true, remarks: 'p603 group' })
await P(p.locator('#inpEditSave'))
await L.answerOil(p, 'yes', { phone: PHONE })
await L.sleep(1500)   // let the minute-stamp pass is not needed; stamps are by day/minute
const s0 = await snap()

/* Ace changes HIS OWN answer to "No OIL" (as himself, through the editor's "Change…") */
await L.be(p, ace, 'member')
await closeDay(); await P(entryBar()); await L.sleep(700)
const aceLine0 = await p.evaluate(() => { const e = document.getElementById('inpEditPop'); const m = e && e.innerText.match(/Your OIL:[^\n]*/); return m ? m[0] : 'no line' })
await pic('ace-editor')
await P(p.locator('[data-testid="oil-revise-own"]')); await L.sleep(600)
const sheetAce = await p.evaluate(() => { const e = document.querySelector('[data-testid="oilconf"]'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 300) : 'no sheet' })
await pic('ace-oil-sheet')
const aceAns = await L.answerOil(p, 'no', { phone: PHONE })
await L.sleep(700)
const toastAce = (await L.toasts(p)).join(' | ')
await P(p.locator('#inpEditCancel')).catch(() => {}); await P(p.locator('#inpEditClose')).catch(() => {}); await L.sleep(300)
const s1 = await snap()
console.log('after Ace changed:', JSON.stringify(s1.map(r => [r.cs, r.oil, r.mod, r.modAt])), 'toast', toastAce, 'line before', aceLine0)

/* Saber (admin, the filer) adds Cinder; dates and hours untouched */
await L.be(p, saber, 'admin')
await closeDay(); await P(entryBar()); await L.sleep(700)
await P(p.locator('#inpEditPop [data-testid="pp-several"]')).catch(() => {})
await L.sleep(200)
const before = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(e => window.PEOPLE[e.dataset.pp].cs))
await L.pickSeveral(p, [ace, anvil, basher, cinder], { phone: PHONE })
await pic('saber-adding-cinder')
const had = await L.iidSet(p)
await P(p.locator('#inpEditSave')); await L.sleep(600)
const sheet = await p.evaluate(() => { const e = document.querySelector('[data-testid="oilconf"]'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 600) : null })
const pSheet = await pic('add-sheet')
console.log('sheet on adding:', sheet)
const sheetBtns = await p.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"] button')].map(b => (b.innerText || '').trim() + (b.classList.contains('on') ? ' [ON]' : '') + (b.getAttribute('aria-pressed') ? ' pressed=' + b.getAttribute('aria-pressed') : '')))
console.log('sheet buttons', JSON.stringify(sheetBtns))
const ans = await L.answerOil(p, 'yes', { phone: PHONE })
await L.sleep(700)
const s2 = await snap()
const pAfter = await pic('after-add')
console.log('after adding:', JSON.stringify(s2.map(r => [r.cs, r.oil, r.mod, r.modAt])))
const by = n => s => s.find(r => r.cs === n)
L.judge('P6-03', 'Shared duty (Ace, Anvil, Basher; OIL Yes); Ace changes his own answer to No; then Saber adds Cinder with dates and hours untouched and answers the newcomer', [
  ['Ace’s own answer was changed (no OIL)', JSON.stringify(by('Ace')(s1).oil) !== JSON.stringify(by('Ace')(s0).oil), [by('Ace')(s0).oil, by('Ace')(s1).oil]],
  ['adding Cinder brought a question back', !!sheet, sheet],
  ['Ace’s answer is as he left it after the add', JSON.stringify(by('Ace')(s2).oil) === JSON.stringify(by('Ace')(s1).oil), [by('Ace')(s1).oil, by('Ace')(s2).oil]],
  ['Anvil and Basher: OIL answer and every stamp unchanged', ['Anvil', 'Basher'].every(n => JSON.stringify(by(n)(s2)) === JSON.stringify(by(n)(s1))), ['Anvil', 'Basher'].map(n => [by(n)(s1), by(n)(s2)])],
  ['Ace’s late/changed stamps unchanged by the add (mod, modAt, modBy)', ['mod', 'modAt', 'modBy', 'at'].every(k => by('Ace')(s2)[k] === by('Ace')(s1)[k]), [by('Ace')(s1), by('Ace')(s2)]],
  ['Cinder now has a record of his own with the answer given', !!by('Cinder')(s2) && !!by('Cinder')(s2).oil, by('Cinder')(s2)],
], [pSheet, pAfter])
console.log('errors', JSON.stringify(L.errors))
L.savePart('p603-' + TAG)
await b.close()
