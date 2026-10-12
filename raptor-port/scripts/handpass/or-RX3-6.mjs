// RX3-6: a row and its input always agree. Training for Ranger Wed 15; save the day as a plan; the board's row x; switch the saved plan in; Tally dragged onto the row; Accept on the Personal Inputs line.
import * as L from './or-RX3-lib.mjs'
const { j } = L
const out = {}
const { ctx, page: p } = await L.open('ad', 'a')
const tr = (await L.fileInput(p, { type: 'Training', person: 'Ranger', from: L.ISO, to: L.ISO, timed: ['14:00', '15:00'], title: 'Range drill' }))[0]
const iid = tr.iid
console.log('filed', j(tr))
const read = tag => p.evaluate(([iid, di, tag]) => {
  const ri = (window.DAYS[di].ground || []).findIndex(g => g.src === iid)
  const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
  const names = r => [...r.querySelectorAll('.ppl .puck')].map(n => (n.querySelector('.nm')?.textContent || n.textContent).trim())
  const ground = [...d.querySelectorAll('.sec-grnd .pl-row')].filter(r => /range drill/i.test(r.querySelector('.nm .ntx')?.textContent || '')).map(r => ({ who: names(r), text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) }))
  const line = [...d.querySelectorAll('.sec-inp .pl-row')].filter(r => /range drill/i.test(r.innerText)).map(r => ({ who: names(r), text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) }))
  const inp = window.INPUTS.find(x => x.iid === iid)
  return { tag, rowInDays: ri, groundRows: ground, personalLine: line, input: (inp.people || []).map(e => window.PEOPLE[e.p]?.cs), foldRows: d.querySelectorAll('.sec-inp .pl-row').length }
}, [iid, L.DI, tag])
const step = async (tag, shotName) => {
  await L.toWeek(p); await L.openFold(p, 'week'); await L.scrollToSec(p, 'ground')
  const r = await read(tag); console.log(tag, j(r)); out[tag] = r
  await L.shot(p, shotName)
  await L.scrollToSec(p, 'inputs').catch(() => {})
  return r
}
await step('s0_filed', 'rx3-6-0-filed')
// save the day as a plan
const planMenu = async () => {
  const b = p.locator(`#eWeek [data-planmenu="${L.DI}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await p.waitForTimeout(500)
  return p.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu')].pop(); return m ? { text: m.innerText.replace(/\s+/g, ' ').trim(), btns: [...m.querySelectorAll('button, .wm')].map(b => [...b.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(',') + '|' + b.textContent.trim().slice(0, 40)) } : null })
}
await L.toWeek(p)
out.menu1 = await planMenu(); console.log('PLAN MENU 1', j(out.menu1))
await L.shot(p, 'rx3-6-1-plan-menu')
await p.locator('.wavemenu .wm[data-plandup]:visible').first().click(); await p.waitForTimeout(900)
const plans = () => p.evaluate(i => ({ list: (window.SCHED.drafts[i] || []).map(x => x.name + ':' + x.id), live: window.SCHED.curDraft ? window.SCHED.curDraft[i] : null }), L.DI)
out.plansSaved = await plans(); console.log('PLANS after save', j(out.plansSaved), '| toast:', await L.toast(p))
// the row's x on the board
await L.toBoard(p, L.DI)
const ri = await L.rowIdx(p, L.DI, iid)
const del = p.locator(`#schedBoard [data-grdel="${L.DI}.${ri}"]`).first(); await del.scrollIntoViewIfNeeded()
await L.shot(p, 'rx3-6-2-board-before-x')
let m = await L.toastMark(p); await del.click(); await p.waitForTimeout(800)
out.xToast = await L.toastsSince(p, m); console.log('x pressed, toast:', out.xToast, '| row in DAYS:', await L.rowIdx(p, L.DI, iid))
await L.shot(p, 'rx3-6-3-board-after-x')
await L.closeBoard?.(p)
await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
await step('s1_afterX', 'rx3-6-3b-week-after-x')
// switch the saved plan in
out.menu2 = await planMenu(); console.log('PLAN MENU 2', j(out.menu2))
await L.shot(p, 'rx3-6-4-plan-menu-2')
const sel = p.locator('.wavemenu .wm[data-plansel]:visible').first()
console.log('plansel count', await p.locator('.wavemenu .wm[data-plansel]:visible').count(), 'text', await sel.innerText().catch(() => ''))
m = await L.toastMark(p)
await sel.click(); await p.waitForTimeout(1000)
out.switchToast = await L.toastsSince(p, m); console.log('SWITCH toast:', out.switchToast, '| now:', await L.toast(p))
out.plansSwitched = await plans(); console.log('PLANS after switch', j(out.plansSwitched))
await step('s2_afterSwitch', 'rx3-6-5-week-after-switch')
// Tally onto the row
const row = await (async () => { const idx = await L.rowIdx(p, L.DI, iid); return idx })()
out.dropToast = await L.addOntoRow(p, 'Tally', iid); console.log('DROP toast:', out.dropToast, '| row idx', row)
await step('s3_afterTally', 'rx3-6-6-week-after-tally')
// Accept on the line under Personal Inputs
await L.toWeek(p); await L.openFold(p, 'week')
const accept = await p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('.sec-inp button')].map(b => b.className + '|' + (b.textContent || '').trim() + '|' + [...b.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(',')) }, L.DI)
console.log('buttons in Personal Inputs:', j(accept)); out.buttons = accept
const accBtn = L.day(p).locator('.sec-inp button', { hasText: /accept/i }).first()
if (await accBtn.count()) {
  await accBtn.scrollIntoViewIfNeeded(); await L.shot(p, 'rx3-6-7-before-accept')
  m = await L.toastMark(p); await accBtn.click(); await p.waitForTimeout(900)
  out.acceptToast = await L.toastsSince(p, m); console.log('ACCEPT toast:', out.acceptToast)
} else { out.acceptToast = 'NO ACCEPT BUTTON'; console.log('no Accept button to press') }
await step('s4_afterAccept', 'rx3-6-8-week-after-accept')
// open the input: its people
await L.openFromList(p, iid)
out.windowPeople = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => window.PEOPLE[b.getAttribute('data-pp')]?.cs), L.WIN)
out.windowText = await p.evaluate(sel => (document.querySelector(sel)?.innerText || '').replace(/\s+/g, ' ').slice(0, 300), L.WIN)
console.log('INPUT WINDOW people:', j(out.windowPeople), '| text:', out.windowText)
await L.shot(p, 'rx3-6-9-input-window')
await p.locator('#inpEditCancel').click().catch(() => {}); await p.waitForTimeout(300)
// the board's row too
await L.toBoard(p, L.DI)
out.boardRow = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].filter(r => r.offsetParent && /range drill/i.test(r.querySelector('textarea.ain, input.ain')?.value || '')).map(r => [...r.querySelectorAll('.ppl .puck .nm')].map(n => n.textContent.trim())))
console.log('BOARD row people:', j(out.boardRow))
await L.shot(p, 'rx3-6-10-board')
console.log('INPUTS end', j(await L.inputOf(p, iid)))
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('6', out)
await ctx.close(); await L.browser.close()
