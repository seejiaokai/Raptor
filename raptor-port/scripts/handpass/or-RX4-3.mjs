// RX4-3 (RECORDED): a posting that deletes by itself. node or-RX4-3.mjs <wed|sat>
import * as L from './or-RX4-lib.mjs'
const { j } = L
const WHICH = process.argv[2] || 'wed'
const SAT = WHICH === 'sat'
const ISO = SAT ? '2026-07-18' : L.ISO
const out = {}
const { ctx, page: p } = await L.open('us', 'us')
const spec = SAT
  ? { type: 'Training', people: ['Hex', 'Hunter'], from: ISO, to: ISO, timed: ['09:00', '12:00'], title: 'RX4 brief', oil: 'yes' }
  : { type: 'Training', people: ['Hex', 'Hunter'], from: ISO, to: ISO, timed: ['10:00', '11:00'], title: 'RX4 brief' }
out.filed = await L.fileInput(p, spec); console.log('filed', j(out.filed))
const iid = out.filed[0]?.iid
const by = () => p.evaluate(() => window.INPUTS.filter(r => r.title === 'RX4 brief').map(r => ({ iid: r.iid.slice(-5), by: window.PEOPLE[r.by]?.cs || ('gone:' + r.by), modBy: window.PEOPLE[r.modBy]?.cs || r.modBy || null, people: (r.people || []).map(e => (window.PEOPLE[e.p]?.cs || 'gone:' + e.p) + (e.oil != null ? `(oil=${e.oil})` : '')), oil: r.oil ?? null })))
out.inputs0 = await by(); console.log('inputs0', j(out.inputs0))
await L.toMonth(p, ISO); await L.openDay(p, ISO)
out.card0 = (await L.dayCardText(p)).filter(t => /RX4 brief/.test(t)); console.log('card0', j(out.card0))
await L.shot(p, `rx4-3${SAT ? 's' : ''}-1-card-before`); await L.closeDay(p)
await L.signOut(p); await L.signIn(p, 'ad', 'a')
// Leave War: Ranger's 29 Jun cell, Post out, Delete
const rid = await L.csId(p, 'Ranger')
await p.evaluate(() => window.go('leavewar')); await p.waitForTimeout(1500)
await p.locator('[data-testid="month-JUN"]').click(); await p.waitForTimeout(900)
const cell = p.locator(`[data-testid="cell-${rid}-2026-06-29"]`).first()
await cell.scrollIntoViewIfNeeded(); await cell.click(); await p.waitForTimeout(600)
await p.locator('[data-testid="bid-postout"]').click(); await p.waitForTimeout(700)
await p.locator('[data-testid="po-delete"]').click(); await p.waitForTimeout(400)
out.poDate = await p.locator('[data-testid="po-date"]').inputValue()
out.poLine = await p.locator('[data-testid="po-line"]').innerText().catch(() => null)
console.log('po date', out.poDate, '| line:', out.poLine)
await L.shot(p, `rx4-3${SAT ? 's' : ''}-2-postout-sheet`)
await p.locator('[data-testid="po-confirm"]').click(); await p.waitForTimeout(700)
const again = p.locator('button', { hasText: /tap again|delete ranger/i }).first()
if (await again.count()) { await L.shot(p, `rx4-3${SAT ? 's' : ''}-2b-armed`); await again.click(); await p.waitForTimeout(1000) }
out.toastPost = await L.toast(p); console.log('toast after post out:', out.toastPost)
out.rangerThere0 = await p.evaluate(id => { const x = window.PEOPLE[id]; return x ? ('present' + (x.deleted ? ' DELETED-mark' : '') + (x.archived ? ' archived' : '') + ' flags:' + Object.keys(x).filter(k => /del|arch|po|gone|off|susp/i.test(k)).map(k => k + '=' + JSON.stringify(x[k])).join(',')) : 'absent' }, rid); console.log('Ranger on roster after posting (clock 22 Jun):', out.rangerThere0)
await L.shot(p, `rx4-3${SAT ? 's' : ''}-3-after-posting`)
// move the clock past the date and reload so the posting runs
await p.clock.setFixedTime(new Date('2026-07-01T09:00:00'))
const signed = await L.reload(p, 'ad', 'a'); out.signedAgain = signed
await p.waitForTimeout(1500)
out.rangerThere1 = await p.evaluate(id => { const x = window.PEOPLE[id]; return x ? ('present' + (x.deleted ? ' DELETED-mark' : '') + (x.archived ? ' archived' : '') + ' flags:' + Object.keys(x).filter(k => /del|arch|po|gone|off|susp/i.test(k)).map(k => k + '=' + JSON.stringify(x[k])).join(',')) : 'absent' }, rid); console.log('Ranger on roster after clock moved + reload:', out.rangerThere1, '| signed in again:', signed)
await p.evaluate(() => window.go('admin')); await p.waitForTimeout(800)
{ const tab = p.locator('[data-admtab="users"], button:has-text("Users"), a:has-text("Users")').first(); if (await tab.count() && await tab.isVisible().catch(() => false)) { await tab.click(); await p.waitForTimeout(500) } }
out.adminUsersRanger = await p.evaluate(id => { const r = document.querySelector('#accList .acc-row[data-person="' + id + '"]'); return r ? r.innerText.replace(/s+/g, ' ').trim() : 'NO ROW for Ranger on Admin > Users' }, rid); console.log('Admin Users row for Ranger:', out.adminUsersRanger)
out.adminUsersAll = await p.evaluate(() => [...document.querySelectorAll('#accList .acc-row')].length)
await L.shot(p, 'rx4-3-3b-admin-users')
out.nowInBrowser = await p.evaluate(() => new Date().toISOString())
out.inputs1 = await by(); console.log('inputs1', j(out.inputs1))
await L.toMonth(p, ISO); await L.openDay(p, ISO)
out.card1 = (await L.dayCardText(p)).filter(t => /RX4 brief/.test(t)); console.log('card1 (Saber)', j(out.card1))
await L.shot(p, `rx4-3${SAT ? 's' : ''}-4-card-saber-after`)
// Saber opens it
const open = async who => {
  const card = p.locator(`[data-testid="win-inputsday"] .icard`, { hasText: 'RX4 brief' }).first()
  if (!(await card.count())) return { opened: false, why: 'no card' }
  await card.click(); await p.waitForTimeout(600)
  const w = p.locator('#inpEditPop, [data-testid="win-inputedit"]').first()
  if (!(await w.count())) return { opened: false, why: 'window did not open' }
  const info = await p.evaluate(() => {
    const w = document.querySelector('#inpEditPop') || document.querySelector('[data-testid="win-inputedit"]')
    return {
      text: w.innerText.replace(/\s+/g, ' ').trim().slice(0, 900),
      buttons: [...w.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.textContent.trim().slice(0, 30) + (b.disabled ? ' [disabled]' : '')),
      fields: [...w.querySelectorAll('input,select,textarea')].filter(e => e.offsetParent).map(e => (e.id || e.name || e.type) + (e.disabled ? ' [disabled]' : '') + (e.readOnly ? ' [readonly]' : '')),
      pucks: [...w.querySelectorAll('[data-pp]')].map(b => (window.PEOPLE[b.getAttribute('data-pp')]?.cs || b.getAttribute('data-pp')) + (b.getAttribute('aria-pressed') === 'true' ? '*' : '') + (b.disabled ? '[d]' : '')),
      saveEnabled: !!document.querySelector('#inpEditSave') && !document.querySelector('#inpEditSave').disabled,
    }
  })
  await L.shot(p, `rx4-3${SAT ? 's' : ''}-5-window-${who}`)
  return { opened: true, ...info }
}
out.winSaber = await open('saber'); console.log('Saber window', j(out.winSaber))
await p.keyboard.press('Escape'); await p.waitForTimeout(200)
const cancel = p.locator('#inpEditCancel'); if (await cancel.count()) { await cancel.click().catch(() => {}); await p.waitForTimeout(200) }
await L.closeDay(p)
// try a change as Saber: add Drifter? Keep it light - press nothing; just record Save is offered.
for (const cs of ['Hex', 'Hunter']) {
  await L.become(p, cs, 'member')
  await L.toMonth(p, ISO); await L.openDay(p, ISO)
  out['card_' + cs] = (await L.dayCardText(p)).filter(t => /RX4 brief/.test(t)); console.log('card as', cs, j(out['card_' + cs]))
  out['win' + cs] = await open(cs.toLowerCase()); console.log(cs, 'window', j(out['win' + cs]))
  const cancel2 = p.locator('#inpEditCancel'); if (await cancel2.count()) { await cancel2.click().catch(() => {}); await p.waitForTimeout(200) }
  await L.closeDay(p)
  // the bell
  const sel = await L.bellSel(p)
  await p.locator(sel).click(); await p.waitForTimeout(500)
  out['bell_' + cs] = await L.bellList(p); console.log('bell', cs, j(out['bell_' + cs]))
  await L.shot(p, `rx4-3${SAT ? 's' : ''}-6-bell-${cs}`)
  await p.locator(sel).click().catch(() => {}); await p.waitForTimeout(300)
}
// back to admin: the admin's card + bell (Saber)
await L.become(p, 'Saber', 'admin').catch(() => {})
console.log('ERRORS', L.errs.join(' | ') || 'none')
out.errs = L.errs.slice()
L.saveRes('3' + (SAT ? 's' : ''), out)
await ctx.close(); await L.browser.close()
