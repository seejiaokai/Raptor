// RX3-6b (careful single drops after the plan switch): a row and its input always agree. Training for Ranger Wed 15; save the day as a plan; the board's row x; switch the saved plan in; Tally dragged onto the row; Accept on the Personal Inputs line.
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
  await L.shot(p, 'rx3-6b-attempt' + n)
  return r
}
out.a1 = await attempt(1)
if (out.a1.groundRows[0]?.who.join() === 'Ranger') out.a2 = await attempt(2)
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('6b', out)
await ctx.close(); await L.browser.close()
