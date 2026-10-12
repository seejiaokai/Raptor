// RX2-1, RX2-2, RX2-5(part): the unanswered input of TWO — phone as Saber (day card, month bar, List card, tag tap), then desktop List row + button.
import { open, shot, errs, browser, saveRes, toMonth, openDay, closeDay, dayCardText, barText, sleep, press, toast, toastMark, toastsSince, reload } from './or-RX2-lib.mjs'
import { makeUnanswered, brief, oilSheet, answerYes } from './or-RX2-fix.mjs'
import { writeFileSync } from 'node:fs'

const R = {}
const ISO = '2026-07-18'
const PHONE = { width: 390, height: 844 }
/* the unanswered input of two, built on a desktop world and carried to the next world (storage) */
const d0 = await open('ad', 'a', { fresh: false, dsf: 2 })
const fx = await makeUnanswered(d0.page)
R.fixture = fx.log; const iid = fx.iid
R.inputs0 = await brief(d0.page, iid)
let state = await d0.ctx.storageState({ indexedDB: true })
await d0.ctx.close()

/* ---------------- RX2-1 phone ---------------- */
const ph = await open('ad', 'a', { fresh: false, viewport: PHONE, touch: true, dsf: 2, state })
const p = ph.page
R.rx1 = {}
await toMonth(p, ISO)
R.rx1.barText = await barText(p, ISO)
R.rx1.barTagCount = await p.evaluate(() => [...document.querySelectorAll('.ib-bar')].filter(b => /OIL\?/.test(b.textContent)).length)
R.rx1.cellOilQ = await p.evaluate(iso => { const c = document.querySelector(`[data-icday="${iso}"]`); return /OIL\?/.test(c ? c.innerText : '') }, ISO)
await shot(p, 'rx2-1-1-month')
await p.locator(`[data-icday="${ISO}"]`).tap({ position: { x: 8, y: 8 } }).catch(async () => { await p.locator(`[data-icday="${ISO}"]`).focus(); await p.keyboard.press('Enter') })
await p.waitForSelector('[data-testid="win-inputsday"]'); await sleep(450)
R.rx1.dayCards = await dayCardText(p)
await shot(p, 'rx2-1-2-dayopen')
const measure = (p, sel) => p.evaluate(sel => {
  const c = document.querySelector(sel); if (!c) return { missing: sel }
  const bx = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1) } }
  const all = [...c.querySelectorAll('*')].filter(e => e.children.length === 0 && (e.textContent || '').trim() === 'OIL?')
  const tagEl = all[0] || null
  const corner = c.querySelector('.icard-corner'), hrs = c.querySelector('.icard-hrs'), who = c.querySelector('.icard-who'), late = c.querySelector('.sd-late')
  const cs = tagEl ? getComputedStyle(tagEl) : null
  const L = late ? getComputedStyle(late) : null
  const tb = tagEl && tagEl.getBoundingClientRect(), hb = hrs && hrs.getBoundingClientRect(), cb = c.getBoundingClientRect(), wb = who && who.getBoundingClientRect()
  return { card: bx(c), tag: bx(tagEl), tagTag: tagEl ? tagEl.tagName + '.' + tagEl.className : null, tagCount: all.length, hours: bx(hrs), hoursText: hrs ? hrs.textContent : null, who: bx(who), whoLines: who ? who.getClientRects().length : null, corner: bx(corner), late: bx(late),
    tagInsideCard: !!tb && tb.left >= cb.left - .5 && tb.right <= cb.right + .5 && tb.top >= cb.top - .5 && tb.bottom <= cb.bottom + .5,
    tagLeftOfHours: !!tb && !!hb && tb.right <= hb.left + .5, tagOnFirstLine: !!tb && !!hb && Math.abs((tb.top + tb.height / 2) - (hb.top + hb.height / 2)) < 8,
    tagStyle: cs && { color: cs.color, bg: cs.backgroundColor, border: cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor, fontSize: cs.fontSize, fontWeight: cs.fontWeight, radius: cs.borderTopLeftRadius, text: tagEl.textContent, tag: tagEl.tagName, isButton: tagEl.tagName === 'BUTTON' },
    lateStyle: L && { fontSize: L.fontSize, fontWeight: L.fontWeight, radius: L.borderTopLeftRadius, bg: L.backgroundColor }, text: c.innerText.replace(/\s+/g, ' ') }
}, sel)
const dayCard = `[data-testid="win-inputsday"] .icard[data-popiid="${iid}"]`
R.rx1.dayMeasure = await measure(p, dayCard)
// picture of the card alone, same crop idea as the mock (pad 30,10,10,10)
{
  const b = await p.locator(dayCard).boundingBox()
  const clip = { x: Math.max(0, Math.floor(b.x - 10)), y: Math.max(0, Math.floor(b.y - 30)), width: Math.min(PHONE.width, Math.ceil(b.x + b.width + 10)) - Math.max(0, Math.floor(b.x - 10)), height: Math.ceil(b.height + 40) }
  await shot(p, 'rx2-1-3-daycard-crop', clip)
}
// the List (phone)
await closeDay(p)
await p.locator('#inListBtn').tap(); await sleep(450)
if (!(await p.locator('#inRangeAll').count())) await p.locator('#inRangeBtn').tap()
await p.locator('#inRangeAll').tap(); await sleep(500)
const listCard = `.icard[data-iid="${iid}"]`
await p.locator(listCard).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
R.rx1.listMeasure = await measure(p, listCard)
await shot(p, 'rx2-1-4-list')
{
  const b = await p.locator(listCard).first().boundingBox()
  const clip = { x: Math.max(0, Math.floor(b.x - 10)), y: Math.max(0, Math.floor(b.y - 34)), width: Math.min(PHONE.width, Math.ceil(b.x + b.width + 10)) - Math.max(0, Math.floor(b.x - 10)), height: Math.ceil(b.height + 46) }
  await shot(p, 'rx2-1-5-listcard-crop', clip)
}
// tap on the tag (list card)
const tag = p.locator(`${listCard} >> text="OIL?"`).first()
R.rx1.tagTapCount = await tag.count()
if (R.rx1.tagTapCount) {
  const tb = await tag.boundingBox()
  R.rx1.tagElementFromPoint = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className + ' "' + (e.textContent || '').trim().slice(0, 20) + '"' : null }, [tb.x + tb.width / 2, tb.y + tb.height / 2])
  await tag.tap(); await sleep(700)
  R.rx1.afterTap = await p.evaluate(() => ({ editWin: !!document.querySelector('#inpEditPop, [data-testid="win-inputedit"]'), oilconf: !!document.querySelector('[data-testid="oilconf"]'), text: (document.querySelector('#inpEditPop, [data-testid="win-inputedit"]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 900) }))
  R.rx1.oilLine = await p.evaluate(() => { const w = document.querySelector('#inpEditPop, [data-testid="win-inputedit"]'); if (!w) return null; const m = w.innerText.replace(/\s+/g, ' ').match(/OIL.{0,120}/g); return m })
  R.rx1.answerBtn = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop button, [data-testid="win-inputedit"] button')].filter(b => /Answer/i.test(b.textContent)).map(b => b.textContent.trim()))
  await shot(p, 'rx2-1-6-tag-tap-window')
}
R.rx1.errs = errs.slice()
await ph.ctx.close()

/* ---------------- RX2-2 desktop ---------------- */
const dk = await open('ad', 'a', { fresh: false, dsf: 2, state })
const d = dk.page
R.rx2 = {}
await d.evaluate(() => window.go('inputs')); await sleep(500)
await d.locator('#inListBtn').click().catch(() => {}); await sleep(400)
if (!(await d.locator('#inRangeAll').count())) await d.locator('#inRangeBtn').click()
await d.locator('#inRangeAll').click(); await sleep(500)
const row = d.locator(`tr[data-iid="${iid}"]`)
await row.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
R.rx2.rowText = await row.innerText().then(t => t.replace(/\s+/g, ' '))
R.rx2.btn = await d.evaluate(iid => { const tr = document.querySelector(`tr[data-iid="${iid}"]`); const cell = tr.querySelector('td.inact'); const bs = cell ? [...cell.querySelectorAll('button')].map(b => { const c = getComputedStyle(b), r = b.getBoundingClientRect(); return { text: b.textContent.trim(), cls: b.className, color: c.color, border: c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderTopColor, bg: c.backgroundColor, x: +r.x.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), right: +r.right.toFixed(1) } }) : null; const rr = tr.getBoundingClientRect(); return { buttons: bs, row: { x: rr.x, w: rr.width, h: rr.height, right: rr.right } } }, iid)
await shot(d, 'rx2-2-1-list-row')
{ const b = await row.boundingBox(); await shot(d, 'rx2-2-1b-list-row-crop', { x: 0, y: Math.max(0, b.y - 3), width: 1440, height: b.height + 6 }); await shot(d, 'rx2-2-1c-list-row-end', { x: 1440 - 620, y: Math.max(0, b.y - 3), width: 620, height: b.height + 6 }) }
// press it
const ob = row.locator('td.inact button', { hasText: 'OIL?' }).first()
R.rx2.btnCount = await ob.count()
if (R.rx2.btnCount) {
  await ob.click(); await sleep(700)
  R.rx2.afterPress = await d.evaluate(() => ({ oilconf: !!document.querySelector('[data-testid="oilconf"]'), editWin: !!document.querySelector('#inpEditPop, [data-testid="win-inputedit"]'), text: (document.querySelector('[data-testid="oilconf"]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 400) }))
  await shot(d, 'rx2-2-2-question')
  if (R.rx2.afterPress.oilconf) {
    await answerYes(d); await sleep(600)
    R.rx2.toastAfter = await toast(d)
  }
  R.rx2.inputsAfter = await brief(d, iid)
  R.rx2.rowAfter = await row.innerText().then(t => t.replace(/\s+/g, ' ')).catch(() => 'NO ROW')
  R.rx2.btnAfter = await row.locator('td.inact button').allInnerTexts().catch(() => null)
  await row.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  await shot(d, 'rx2-2-3-row-after')
  // the opened day's card on desktop
  await toMonth(d, ISO); await openDay(d, ISO)
  R.rx2.dayCardsAfter = await dayCardText(d)
  R.rx2.dayCardTagAfter = await d.evaluate(iid => { const c = document.querySelector(`[data-testid="win-inputsday"] .icard[data-popiid="${iid}"]`); return c ? /OIL\?/.test(c.innerText) : 'NO CARD' }, iid)
  await shot(d, 'rx2-2-4-daycard-after')
  await closeDay(d)
  // reload
  await reload(d)
  R.rx2.inputsReload = await brief(d, iid)
  await d.evaluate(() => window.go('inputs')); await sleep(500)
  if (await d.locator('#inListBtn[aria-pressed="false"]').count()) await d.locator('#inListBtn').click()
  await sleep(400)
  if (!(await d.locator('#inRangeAll').count())) await d.locator('#inRangeBtn').click()
  await d.locator('#inRangeAll').click(); await sleep(500)
  const row2 = d.locator(`tr[data-iid="${iid}"]`)
  await row2.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  R.rx2.rowReload = await row2.innerText().then(t => t.replace(/\s+/g, ' ')).catch(() => 'NO ROW')
  R.rx2.btnReload = await row2.locator('td.inact button').allInnerTexts().catch(() => null)
  await shot(d, 'rx2-2-5-row-after-reload')
  await toMonth(d, ISO); await openDay(d, ISO)
  R.rx2.dayCardTagReload = await d.evaluate(iid => { const c = document.querySelector(`[data-testid="win-inputsday"] .icard[data-popiid="${iid}"]`); return c ? /OIL\?/.test(c.innerText) : 'NO CARD' }, iid)
  await closeDay(d)
}
state = await dk.ctx.storageState({ indexedDB: true })
R.rx2.errs = errs.slice()
await dk.ctx.close()

/* phone again: the answered input's card */
const ph2 = await open('ad', 'a', { fresh: false, viewport: PHONE, touch: true, dsf: 2, state })
const q = ph2.page
await toMonth(q, ISO)
await q.locator(`[data-icday="${ISO}"]`).focus(); await q.keyboard.press('Enter'); await q.waitForSelector('[data-testid="win-inputsday"]'); await sleep(450)
R.rx2.phoneDayAfter = await q.evaluate(iid => { const c = document.querySelector(`[data-testid="win-inputsday"] .icard[data-popiid="${iid}"]`); return c ? { tag: /OIL\?/.test(c.innerText), text: c.innerText.replace(/\s+/g, ' ') } : 'NO CARD' }, iid)
await shot(q, 'rx2-2-6-phone-day-after')
await closeDay(q)
await q.locator('#inListBtn').tap(); await sleep(450)
if (!(await q.locator('#inRangeAll').count())) await q.locator('#inRangeBtn').tap()
await q.locator('#inRangeAll').tap(); await sleep(500)
await q.locator(listCard).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
R.rx2.phoneListAfter = await q.evaluate(iid => { const c = document.querySelector(`.icard[data-iid="${iid}"]`); return c ? { tag: /OIL\?/.test(c.innerText), text: c.innerText.replace(/\s+/g, ' ') } : 'NO CARD' }, iid)
await shot(q, 'rx2-2-7-phone-list-after')
await ph2.ctx.close()

R.errs = errs.slice()
saveRes('RX2-1_2', R)
console.log(JSON.stringify(R, null, 1))
await browser.close()
