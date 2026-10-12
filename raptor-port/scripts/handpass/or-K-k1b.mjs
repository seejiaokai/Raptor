// K7 (View-only Sched as Saber and Ranger, on 13-19 Jul) then K1's cancelled peek. One non-fresh world.
import * as K from './or-K-lib.mjs'
const { fileInput, goWeek, goView, goBoard, shot, shotEl, readRows, inputsOf, reload, saveRes, errs } = K
const out = {}
const { ctx, page: p } = await K.openWorld({ fresh: false })
await K.hideToast(p)
const filed = await fileInput(p, { type: 'Meeting', people: ['Ranger', 'Tally', 'Hex'], ph: ['allavail'], from: K.ISO, to: K.ISO, timed: ['14:00', '15:00'], title: K.TITLE, rmk: 'Bring ID' })
console.log('filed', JSON.stringify(filed))
const iid = filed[0].iid
const viewWed = async (name, who) => {
  await goView(p)
  const chip = p.locator('button[data-wk]:visible', { hasText: 'Jul 13' }).first()
  const nchip = await p.locator('button[data-wk]:visible').count()
  if (await chip.count() && (await p.evaluate(() => window.CURWEEK)) !== '13/07/2026') { await chip.click(); await p.waitForTimeout(1000) }
  console.log(name, 'chips visible', nchip, 'CURWEEK', await p.evaluate(() => window.CURWEEK))
  await K.openFold(p, 'view', K.DI, '#vWeek')
  const v = await readRows(p)
  const ctl = await p.evaluate(() => [...document.querySelectorAll('#vWeek .day:not(.peek) .pl-row')].filter(r => /range brief/i.test(r.querySelector('.nm')?.textContent || '')).map(r => ({ editable: r.querySelectorAll('[contenteditable=true], input, textarea, select, button').length, slotsInRow: r.querySelectorAll('[data-slot],[data-fill]').length, text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) })))
  await p.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day:not(.peek)')][2]; if (d) { d.scrollIntoView({ inline: 'start', block: 'nearest' }); const sec = d.querySelector('.sec-grnd'); if (sec) window.scrollTo(0, Math.max(0, sec.getBoundingClientRect().top + window.scrollY - 96)) } })
  await p.waitForTimeout(300); await K.hideToast(p)
  await K.shotEl(p.locator('#vWeek .day:not(.peek)').nth(2).locator('.sec-grnd').first(), name + '-ground')
  const sec = p.locator('#vWeek .day:not(.peek)').nth(2).locator('.sec-inp').first()
  if (await sec.count()) await K.shotEl(sec, name + '-personal')
  await shot(p, name + '-page')
  out[name] = { ground: v.viewGround, inputs: v.viewInputs, controls: ctl }
  console.log(name, 'GROUND', JSON.stringify(v.viewGround), 'LINE', JSON.stringify(v.viewInputs), 'CTL', JSON.stringify(ctl))
}
await viewWed('k7-saber')
await reload(p, 'us', 'us')
await viewWed('k7-ranger')
// back to Saber
await reload(p, 'ad', 'a')
await goWeek(p)
if ((await p.evaluate(() => window.CURWEEK)) !== '13/07/2026') { await p.locator('button[data-wk]:visible', { hasText: 'Jul 13' }).first().click(); await p.waitForTimeout(1000) }
// cancel on the board: CX with reason WX
const ri = await p.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [K.DI, iid])
console.log('ground row index', ri)
await goBoard(p)
const cx = p.locator(`#schedBoard [data-grcx="${K.DI}.${ri}"]`).first()
await cx.scrollIntoViewIfNeeded(); await cx.click()
await p.waitForSelector('#cxSave', { timeout: 4000 })
const q = p.locator('#cxQuick [data-cxq="WX"]').first()
if (await q.count()) await q.click(); else await p.locator('#cxReason').fill('WX')
await p.waitForTimeout(200)
await p.locator('#cxSave').click(); await p.waitForTimeout(600)
out.afterCx = await inputsOf(p)
console.log('after CX', JSON.stringify(out.afterCx))
await goWeek(p)
// the peek: step to 06 Jul so 13-19 Jul is the peek
await p.locator('button[data-wk]:visible', { hasText: 'Jul 06' }).first().click(); await p.waitForTimeout(1200)
await p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day.peek')][2]; d.scrollIntoView({ inline: 'center', block: 'nearest' }); const sec = d.querySelector('.sec-grnd'); window.scrollTo(0, Math.max(0, sec.getBoundingClientRect().top + window.scrollY - 96)) })
await p.waitForTimeout(500); await K.hideToast(p)
out.peekCx = await p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day.peek')][2]; return [...d.querySelectorAll('.pl-row')].filter(r => /range brief/i.test(r.querySelector('.nm')?.textContent || '')).map(r => ({ text: r.innerText.replace(/\s+/g, ' ').trim(), cls: r.className, nameHtml: r.querySelector('.nm')?.outerHTML.slice(0, 400), struck: getComputedStyle(r.querySelector('.ntx') || r.querySelector('.nm')).textDecorationLine, controls: r.querySelectorAll('[contenteditable=true], [data-slot], [data-fill], button, input, textarea').length })) })
console.log('PEEK CANCELLED', JSON.stringify(out.peekCx))
await K.shotEl(p.locator('#eWeek .day.peek').nth(2).locator('.sec-grnd').first(), 'k1-2-peek-cancelled-ground')
await shot(p, 'k1-2b-peek-cancelled-page')
// the peek's Personal Inputs part if drawn
const pinp = p.locator('#eWeek .day.peek').nth(2).locator('.sec-inp').first()
if (await pinp.count()) { out.peekInp = (await pinp.innerText()).replace(/\s+/g, ' ').trim(); await K.shotEl(pinp, 'k1-3-peek-cancelled-personal') ; console.log('PEEK LINE', out.peekInp) }
// the edit week for comparison
await p.locator('button[data-wk]:visible', { hasText: 'Jul 13' }).first().click(); await p.waitForTimeout(1000)
await K.openFold(p, 'week')
out.editCx = (await readRows(p)).weekGround.concat((await readRows(p)).weekInputs)
await K.scrollToSec(p, 'ground'); await p.waitForTimeout(300); await K.hideToast(p)
await K.shotEl(p.locator('#eWeek .day:not(.peek) [data-secmove="2.ground"]').first(), 'k1-4-edit-cancelled-ground')
console.log('EDIT cancelled', JSON.stringify(out.editCx))
out.errs = errs.slice()
saveRes('k1b_k7', out)
console.log('ERRS', JSON.stringify(errs))
await ctx.close(); await K.browser.close()
