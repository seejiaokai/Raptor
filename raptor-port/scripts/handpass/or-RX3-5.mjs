// RX3-5: a man's own part still reads as ONE.
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
// ---------- RX3-5 ----------
{
  const { ctx, p, iid, pub } = await publishedLeave('RX3-5')
  out.pub5 = pub
  await L.toWeek(p)
  const hid = await L.csId(p, 'Hex')
  const row = L.day(p).locator('.sec-unav .pl-row').filter({ has: p.locator('.puck', { hasText: 'Hex' }) }).first()
  await row.scrollIntoViewIfNeeded(); await p.waitForTimeout(300)
  out.rowBefore = (await row.innerText()).replace(/\s+/g, ' ')
  console.log('Hex row before:', out.rowBefore, )
  await L.shot(p, 'rx3-5-1-row-before')
  // the start box: the first data-txt that is a start time
  const box = row.locator('.t-s').first()
  await box.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('10:00'); await box.evaluate(x => x.blur()); await p.waitForTimeout(800)
  console.log('toast:', await L.toast(p))
  out.afterType = (await L.allInputs(p)).filter(r => r.type === 'LL')
  console.log('LL inputs after typing 10:00:', j(out.afterType))
  out.c1 = await L.counts(p, { keepWin: true, noBoard: true }); console.log('COUNTS own start typed', L.fmt(out.c1))
  await L.shot(p, 'rx3-5-2-togoout')
  await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
  await L.toWeek(p)
  out.unav = await p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('.sec-unav .pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()) }, L.DI)
  console.log('Wed unavailable rows:', j(out.unav))
  await ctx.close()
}
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('5', out)
await L.browser.close()
