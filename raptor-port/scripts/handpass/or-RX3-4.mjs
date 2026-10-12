// RX3-4: a NEW leave for a man who left a shared one, on a published day. RX3-5: a man's own part still reads as ONE.
import * as L from './or-RX3-lib.mjs'
const { j } = L
const out = {}
async function publishedLeave(tag) {
  const { ctx, page: p } = await L.open('ad', 'a')
  const ll = (await L.fileInput(p, { type: 'LL', people: ['Drifter', 'Hex', 'Hunter'], from: L.ISO, to: L.ISO }))[0]
  console.log(tag, 'filed', j(ll))
  const pub = await L.signAndPublish(p, L.DI); console.log(tag, 'PUBLISH', j(pub))
  return { ctx, p, iid: ll.iid, pub }
}
// ---------- RX3-4 ----------
{
  const { ctx, p, iid, pub } = await publishedLeave('RX3-4')
  out.pub4 = pub
  out.c0 = await L.counts(p, { noBoard: true }); console.log('COUNTS 0', L.fmt(out.c0))
  await L.openFromList(p, iid)
  await L.shot(p, 'rx3-4-1-leave-window')
  const hid = await L.csId(p, 'Hex')
  const pressedBefore = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => window.PEOPLE[b.getAttribute('data-pp')]?.cs), L.WIN)
  console.log('window pucks pressed:', j(pressedBefore))
  await p.locator(`${L.WIN} [data-pp="${hid}"]`).click(); await p.waitForTimeout(200)
  const pressedAfter = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => window.PEOPLE[b.getAttribute('data-pp')]?.cs), L.WIN)
  console.log('after un-pressing Hex:', j(pressedAfter))
  await L.shot(p, 'rx3-4-2-hex-unpicked')
  const m = await L.toastMark(p)
  await p.locator('#inpEditSave').click(); await p.waitForTimeout(700)
  console.log('save toasts:', await L.toastsSince(p, m), '| sheets:', await p.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.offsetParent && /conf|sheet|doc/.test(e.dataset.testid)).map(e => e.dataset.testid)))
  await p.waitForTimeout(500)
  out.afterTakeOut = (await L.allInputs(p)).filter(r => r.type === 'LL' && r.date === 'Jul 15')
  console.log('LL inputs after take-out:', j(out.afterTakeOut))
  out.c1 = await L.counts(p, { keepWin: true, noBoard: true }); console.log('COUNTS taken out', L.fmt(out.c1))
  await L.shot(p, 'rx3-4-3-togoout-taken-out')
  await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
  // now a NEW LL for Hex on Wed 15 08:00-12:00
  const nl = (await L.fileInput(p, { type: 'LL', person: 'Hex', from: L.ISO, to: L.ISO, timed: ['08:00', '12:00'] }))
  console.log('new LL filed:', j(nl))
  out.newLL = nl
  out.c2 = await L.counts(p, { keepWin: true, noBoard: true }); console.log('COUNTS new LL for Hex', L.fmt(out.c2))
  await L.shot(p, 'rx3-4-4-togoout-new-leave')
  out.winAll = await L.winRead(p)
  await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
  out.inputsEnd = (await L.allInputs(p)).filter(r => r.type === 'LL')
  console.log('LL inputs end:', j(out.inputsEnd))
  // the week's Unavailable list of Wed
  await L.toWeek(p)
  out.unav = await p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('.sec-unav .pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()) }, L.DI)
  console.log('Wed unavailable rows:', j(out.unav))
  await ctx.close()
}
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('4', out)
await L.browser.close()
