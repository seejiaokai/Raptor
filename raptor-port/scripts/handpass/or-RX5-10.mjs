// RX4-10 (careful single drops after the plan switch): a row and its input always agree. Training for Ranger Wed 15; save the day as a plan; the board's row x; switch the saved plan in; Tally dragged onto the row; Accept on the Personal Inputs line.
import * as L from './or-RX5-lib.mjs'
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
await step('s0_filed', 'rx4-10-0-filed')
// save the day as a plan
const planMenu = async () => {
  const b = p.locator(`#eWeek [data-planmenu="${L.DI}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await p.waitForTimeout(500)
  return p.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu')].pop(); return m ? { text: m.innerText.replace(/\s+/g, ' ').trim(), btns: [...m.querySelectorAll('button, .wm')].map(b => [...b.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(',') + '|' + b.textContent.trim().slice(0, 40)) } : null })
}
await L.toWeek(p)
out.menu1 = await planMenu(); console.log('PLAN MENU 1', j(out.menu1))
await L.shot(p, 'rx4-10-1-plan-menu')
await p.locator('.wavemenu .wm[data-plandup]:visible').first().click(); await p.waitForTimeout(900)
const plans = () => p.evaluate(i => ({ list: (window.SCHED.drafts[i] || []).map(x => x.name + ':' + x.id), live: window.SCHED.curDraft ? window.SCHED.curDraft[i] : null }), L.DI)
out.plansSaved = await plans(); console.log('PLANS after save', j(out.plansSaved), '| toast:', await L.toast(p))
// the row's x on the board
await L.toBoard(p, L.DI)
const ri = await L.rowIdx(p, L.DI, iid)
const del = p.locator(`#schedBoard [data-grdel="${L.DI}.${ri}"]`).first(); await del.scrollIntoViewIfNeeded()
await L.shot(p, 'rx4-10-2-board-before-x')
let m = await L.toastMark(p); await del.click(); await p.waitForTimeout(800)
out.xToast = await L.toastsSince(p, m); console.log('x pressed, toast:', out.xToast, '| row in DAYS:', await L.rowIdx(p, L.DI, iid))
await L.shot(p, 'rx4-10-3-board-after-x')
await L.closeBoard?.(p)
await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
await step('s1_afterX', 'rx4-10-3b-week-after-x')
// switch the saved plan in
out.menu2 = await planMenu(); console.log('PLAN MENU 2', j(out.menu2))
await L.shot(p, 'rx4-10-4-plan-menu-2')
const sel = p.locator('.wavemenu .wm[data-plansel]:visible').first()
console.log('plansel count', await p.locator('.wavemenu .wm[data-plansel]:visible').count(), 'text', await sel.innerText().catch(() => ''))
m = await L.toastMark(p)
await sel.click(); await p.waitForTimeout(1000)
out.switchToast = await L.toastsSince(p, m); console.log('SWITCH toast:', out.switchToast, '| now:', await L.toast(p))
out.plansSwitched = await plans(); console.log('PLANS after switch', j(out.plansSwitched))
await step('s2_afterSwitch', 'rx4-10-5-week-after-switch')
// one drag, no retry, everything logged
const attempt = async n => {
  await L.toWeek(p)
  const ri2 = await L.rowIdx(p, L.DI, iid)
  const d = L.day(p)
  await d.locator(`[data-fill="g:${L.DI}.${ri2}.+"]`).first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 120)); await p.waitForTimeout(300)
  const mk = await L.toastMark(p)
  const src = await L.rosterPuck(p, 'Tally')
  const tgt = d.locator(`[data-fill="g:${L.DI}.${ri2}.+"] .addz`).first()
  console.log(' attempt', n, 'src box', j(await src.boundingBox()), 'tgt box', j(await tgt.boundingBox()))
  await L.drag(p, src, tgt)
  const raw = await p.evaluate(mk => (window.__toasts || []).slice(mk).map(x => x.text), mk)
  const r = await read('attempt' + n)
  console.log(' attempt', n, 'toasts(raw):', j(raw), '| toast now:', await L.toast(p), '| row:', j(r.groundRows.map(x => x.who)), '| line:', j(r.personalLine.map(x => x.who)), '| INPUTS:', j(r.input))
  await L.shot(p, 'rx4-10b-attempt' + n)
  return r
}
out.a1 = await attempt(1)
if (out.a1.groundRows[0]?.who.join() === 'Ranger') out.a1 = await attempt(1.5)
// Accept on the line under Personal Inputs
await L.toWeek(p); await L.openFold(p, 'week')
out.buttons = await p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('.sec-inp button')].map(b => (b.textContent || '').trim()) }, L.DI)
console.log('buttons in Personal Inputs:', j(out.buttons))
const accBtn = L.day(p).locator('.sec-inp button', { hasText: /accept/i }).first()
await accBtn.scrollIntoViewIfNeeded(); await L.shot(p, 'rx4-10-7-before-accept')
m = await L.toastMark(p); await accBtn.click(); await p.waitForTimeout(250)
out.acceptNoteEarly = await L.toast(p)
await L.shot(p, 'rx4-10-8-accept-note')
await p.waitForTimeout(700)
out.acceptRaw = await p.evaluate(mk => (window.__toasts || []).slice(mk).map(x => x.text), m)
out.acceptNote = out.acceptRaw.slice().sort((a, b) => b.length - a.length)[0]
console.log('ACCEPT note (raw list):', j(out.acceptRaw), '| early read:', j(out.acceptNoteEarly))
const r5 = await step('s5_afterAccept', 'rx4-10-9-week-after-accept')
// open the input: its people
await L.openFromList(p, iid)
out.windowPeople = await L.winPeople(p)
console.log('INPUT WINDOW after Accept:', j(out.windowPeople))
await L.shot(p, 'rx4-10-10-input-window-after-accept')
await p.locator('#inpEditCancel').click().catch(() => {}); await p.waitForTimeout(300)
// drop Tally again
await L.toWeek(p)
const ri3 = await L.rowIdx(p, L.DI, iid)
const d3 = L.day(p)
await d3.locator(`[data-fill="g:${L.DI}.${ri3}.+"]`).first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 120)); await p.waitForTimeout(300)
const mk3 = await L.toastMark(p)
await L.drag(p, await L.rosterPuck(p, 'Tally'), d3.locator(`[data-fill="g:${L.DI}.${ri3}.+"] .addz`).first())
out.drop2Raw = await p.evaluate(mk => (window.__toasts || []).slice(mk).map(x => x.text), mk3)
console.log('SECOND DROP notes:', j(out.drop2Raw), '| toast now:', await L.toast(p))
out.s6 = await read('s6_secondDrop'); console.log('s6', j(out.s6))
await L.shot(p, 'rx4-10-11-week-second-drop')
// the input's card on the Inputs calendar (opened day) and its window
await L.toMonth(p, '2026-07-15'); await L.openDay(p, '2026-07-15')
out.dayCards = await L.dayCardText(p)
console.log('DAY CARDS:', j(out.dayCards))
await L.shot(p, 'rx4-10-12-day-card')
await L.closeDay(p)
await L.openFromList(p, iid)
out.windowPeople2 = await L.winPeople(p)
console.log('INPUT WINDOW after second drop:', j(out.windowPeople2))
await L.shot(p, 'rx4-10-13-input-window-second')
await p.locator('#inpEditCancel').click().catch(() => {}); await p.waitForTimeout(300)
out.inputsEnd = await L.inputOf(p, iid); console.log('INPUTS end', j(out.inputsEnd))
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('10', out)
await ctx.close(); await L.browser.close()
