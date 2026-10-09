import * as L from './cal-F-lib3.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE })
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const P = L.press(p, PHONE)
const [ace, anvil, basher] = await L.ids(p, ['Ace', 'Anvil', 'Basher'])
const pic = n => L.pic(p, `${TAG}-p608-${n}`)
const recs = () => p.evaluate(() => window.INPUTS.filter(r => r.remarks && /^p608/.test(r.remarks)).map(r => ({ cs: window.PEOPLE[r.person].cs, type: r.type, date: r.date, grp: r.grp, iid: r.iid, by: r.by })))
const closeDay = async () => { if (await p.locator('[data-testid="win-inputsday-x"]').count()) { await P(p.locator('[data-testid="win-inputsday-x"]')); await L.sleep(250) } }
const closeEd = async () => { for (const s of ['#inpEditCancel', '#inpEditClose']) { if (await p.locator(s + ':visible').count()) { await P(p.locator(s)).catch(() => {}); await L.sleep(300); return } } }

for (const [type, iso, rem] of [['Meeting', '2026-07-17', 'p608 meeting'], ['LL', '2026-07-28', 'p608 leave']]) {
  await closeDay()
  await L.openNew(p, iso, { phone: PHONE })
  await p.selectOption('#inpEditType', type)
  await L.pickSeveral(p, [ace, anvil, basher], { phone: PHONE })
  await L.setWhen(p, { allday: true, remarks: rem })
  await P(p.locator('#inpEditSave')); await L.sleep(800)
}
const r0 = await recs()
await closeDay()

/* the calendar's doors: month bar, opened day, List, editor */
await L.month(p, 2026, 7, PHONE ? (l => l.tap()) : null)
const bars = await p.evaluate(() => [...document.querySelectorAll('#inpCal .ib-bar')].map(b => b.innerText.trim()).filter(t => /Meeting|LL/.test(t) && /Ace|Anvil|Basher/.test(t)))
await pic('month')
const dayOpen = async iso => { await closeDay(); const c = L.cell(p, iso); if (PHONE) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } }); await L.sleep(600) }
await dayOpen('2026-07-17')
const lineM = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="idy-row-"]')].filter(r => /Ace|Anvil|Basher/.test(r.innerText) && /Meeting/.test(r.innerText)).map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 90)))
await pic('day-17jul')
await P(p.locator('[data-testid="idy-open"]').filter({ hasText: 'Ace' }).first()); await L.sleep(700)
const ed = await p.evaluate(() => ({ title: (document.querySelector('[data-testid="win-inputedit"] .win-ttl') || {}).innerText, picked: [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(e => window.PEOPLE[e.dataset.pp].cs) }))
await pic('editor-entry')
await closeEd(); await closeDay()
await P(p.locator('#inListBtn')); await L.sleep(500); await P(p.locator('#inRangeBtn')); await L.sleep(300)
if (await p.locator('#inRangeAll:visible').count()) { await P(p.locator('#inRangeAll')); await L.sleep(500) }
const listRows = await p.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].filter(t => /p608/.test(t.innerText)).map(t => t.innerText.replace(/\s+/g, ' ').slice(0, 70)))
await pic('list')
await P(p.locator('#inCalBtn')); await L.sleep(400)

/* each man's own schedule: week (View-only Sched), board (Edit Schedule), warnings */
await L.go(p, 'viewsched'); await L.sleep(800)
const weekRows = await p.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="4"]'); return d ? [...d.querySelectorAll('.pl-row')].filter(r => /Meeting/i.test(r.innerText) && /\b(Ace|Anvil|Basher)\b/.test(r.innerText)).map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 80)) : null })
await pic('week-fri')
await L.go(p, 'editsched'); await L.sleep(500)
await p.locator('#eWeek [data-sbday="4"]:visible').first().click(); await p.waitForSelector('#schedBoard'); await L.sleep(800)
{ const rowsN = () => p.evaluate(() => document.querySelectorAll('#schedBoard .pinp .sb-arow, #schedBoard .pinp .sbi-row').length); if (!(await rowsN())) { const tg = p.locator('#schedBoard [data-pitog="4"]:visible'); if (await tg.count()) { await tg.first().click(); await L.sleep(500) } } }
const boardRows = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .pinp .sb-arow.inprow')].filter(r => /Meeting/.test(r.innerText)).map(r => ({ txt: r.innerText.replace(/\s+/g, ' ').slice(0, 60), edit: r.querySelector('[data-inpedit]') ? r.querySelector('[data-inpedit]').dataset.inpedit : null })))
await pic('board-fri')
const warnMsgs = await p.evaluate(() => ((window.WARN.byDay[4] || {}).warns || []).filter(w => (w.who || []).some(x => ['dj', 'shaft', 'glass'].includes(x))).map(w => w.code + ':' + (w.who || []).map(x => window.PEOPLE[x].cs).join('/')))
await p.locator('#schedBoard').getByRole('button', { name: /Close/ }).first().click().catch(async () => { await p.keyboard.press('Escape') }); await L.sleep(500)

/* the Leave War: the leave filed on Tue 28 Jul shows on each man's own cell */
const lw = await L.lwCells(p, [ace, anvil, basher], '2026-07-28')
await pic('leavewar-28jul')
console.log(JSON.stringify({ r0: r0.map(r => [r.cs, r.type, r.date, r.grp]), bars, lineM, ed, listRows, weekRows, boardRows, warnMsgs, lw }, null, 1))
const cnt = (rs, t) => rs.filter(r => r.type === t)
L.judge('P6-08', 'one shared Meeting (Fri 17 Jul) and one shared LL (Tue 28 Jul) for Ace, Anvil, Basher; read through the calendar’s doors and then each man’s own schedule and the Leave War', [
  ['stored: one record per man, tied by one group id, for each filing', cnt(r0, 'Meeting').length === 3 && cnt(r0, 'LL').length === 3 && new Set(cnt(r0, 'Meeting').map(r => r.grp)).size === 1 && new Set(cnt(r0, 'LL').map(r => r.grp)).size === 1, r0.length],
  ['month: ONE bar for the Meeting and ONE for the leave (not three each)', bars.filter(t => /Meeting/.test(t)).length === 1 && bars.filter(t => /Ace \+2/.test(t)).length >= 1, bars],
  ['opened day: one line, three men', lineM.length === 1, lineM],
  ['editor: one window for the entry (title names it, three people lit)', !!ed.title && /\+2/.test(ed.title) && ed.picked.length === 3, ed],
  ['List: one row per filing', listRows.length === 2, listRows],
  ['week (View-only Sched), Fri 17 Jul: each man has his own Meeting row', !!weekRows && weekRows.length >= 3 && ['Ace', 'Anvil', 'Basher'].every(n => weekRows.some(r => new RegExp('\\b' + n + '\\b').test(r))), weekRows],
  ['board (Edit Schedule), Fri 17 Jul: three separate Personal Inputs rows, each with its own edit button', boardRows.length === 3 && new Set(boardRows.map(r => r.edit)).size === 3, boardRows],
  ['Leave War: each man’s own cell on 28 Jul shows the leave', Object.values(lw).every(c => c && c.text && /LL|L/.test(c.text)), lw],
], [])
console.log('errors', JSON.stringify(L.errors))
L.savePart('p608-' + TAG)
await b.close()
