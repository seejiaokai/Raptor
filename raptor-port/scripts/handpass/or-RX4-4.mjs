// RX4-4 (RECORDED): the sign on a cancelled input. Unanswered Sat Training of two; CX on the board; look; List OIL? button; Yes; OIL Earn.
import * as L from './or-RX4-lib.mjs'
import * as F from './or-RX4-fix.mjs'
const { j } = L
const out = {}
const ISO = '2026-07-18', DI = 5
const { ctx, page: p } = await L.open('ad', 'a')
const fx = await F.makeUnanswered(p); out.fixture = fx.log; const iid = fx.iid
console.log('fixture:', j(fx.log))
console.log('state0', j(await F.brief(p, iid)))
const signs = async (tag) => {
  const o = {}
  await L.toMonth(p, ISO); await L.openDay(p, ISO)
  o.card = await p.evaluate(iid => { const c = document.querySelector(`[data-testid="win-inputsday"] .icard[data-popiid="${iid}"]`); return c ? { tagOilQ: /OIL\?/.test(c.innerText), cx: !!c.querySelector('.icx'), text: c.innerText.replace(/\s+/g, ' ') } : 'NO CARD' }, iid)
  await L.shot(p, `rx4-4-${tag}-card`)
  { const c = p.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${iid}"]`).first(); if (await c.count()) { const b = await c.boundingBox(); await L.shot(p, `rx4-4-${tag}-card-crop`, { x: Math.max(0, b.x - 10), y: Math.max(0, b.y - 10), width: Math.min(1440 - Math.max(0, b.x - 10), b.width + 20), height: b.height + 20 }) } }
  await L.closeDay(p)
  await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(300)
  await p.locator('#inListBtn').click(); await p.waitForTimeout(400)
  if (!(await p.locator('#inRangeAll').count())) await p.locator('#inRangeBtn').click()
  await p.locator('#inRangeAll').click(); await p.waitForTimeout(500)
  const row = p.locator(`tr[data-iid="${iid}"]`)
  await row.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(300)
  o.row = await p.evaluate(iid => { const tr = document.querySelector(`tr[data-iid="${iid}"]`); if (!tr) return 'NO ROW'; return { text: tr.innerText.replace(/\s+/g, ' '), buttons: [...tr.querySelectorAll('td.inact button')].map(b => b.textContent.trim()), strike: !!tr.querySelector('.icx, .cxtag') } }, iid)
  await L.shot(p, `rx4-4-${tag}-list-row`)
  { const b = await row.boundingBox(); await L.shot(p, `rx4-4-${tag}-list-row-crop`, { x: 0, y: Math.max(0, b.y - 3), width: 1440, height: b.height + 6 }) }
  console.log(tag, j(o))
  return o
}
out.before = await signs('1-before-cx')
// CX on the board
await L.toBoard(p, DI)
const ri = await L.rowIdx(p, DI, iid)
{
  const b = p.locator(`#schedBoard [data-grcx="${DI}.${ri}"]`).first(); await b.scrollIntoViewIfNeeded()
  const m = await L.toastMark(p)
  await L.shot(p, 'rx4-4-2-board-before-cx')
  await b.click(); await p.waitForTimeout(500)
  out.dialog = await p.evaluate(() => { const s = document.querySelector('#cxSave'); if (!s) return null; const w = s.closest('.airpop, .win, [role=dialog], div'); return { text: (w ? w.innerText : '').replace(/\s+/g, ' ').slice(0, 200) } })
  console.log('CX dialog:', j(out.dialog))
  await p.locator('#cxReason').fill('WX'); await L.shot(p, 'rx4-4-3-cx-dialog')
  await p.locator('#cxSave').click(); await p.waitForTimeout(700)
  out.cxToast = await L.toastsSince(p, m); console.log('after CX toast:', out.cxToast)
  await L.shot(p, 'rx4-4-4-board-after-cx')
}
console.log('state after CX', j(await F.brief(p, iid)))
out.afterCx = await signs('5-after-cx')
// press the List's OIL? button, answer Yes
const row = p.locator(`tr[data-iid="${iid}"]`)
const btn = row.locator('td.inact button', { hasText: 'OIL?' }).first()
out.btnCount = await btn.count()
console.log('OIL? button on the cancelled row:', out.btnCount)
if (out.btnCount) {
  await btn.click(); await p.waitForTimeout(700)
  out.q = await F.oilSheet(p); console.log('question:', out.q)
  await L.shot(p, 'rx4-4-6-question')
  if (out.q) { await F.answerYes(p); await p.waitForTimeout(500); out.toastYes = await L.toast(p) }
  console.log('state after Yes', j(await F.brief(p, iid)))
}
out.afterYes = await signs('7-after-yes')
// OIL Earn on the board: what the row's pucks read - unpublished Saturday, then published Saturday
const oilLook = async (tag) => {
  await L.toBoard(p, DI)
  await p.locator('#sbOil:visible').first().click(); await p.waitForTimeout(900)
  await L.openFold(p, 'board', DI).catch(() => {})
  const row = await p.evaluate(iid => {
    const b = document.querySelector('#schedBoard'); if (!b) return 'NO BOARD'
    const rows = [...b.querySelectorAll('.sb-panel.grnd .sb-arow')].filter(r => r.offsetParent)
    const mine = rows.filter(r => /OIL ask/i.test((r.querySelector('textarea.ain, input.ain')?.value || '') + r.innerText))
    return mine.map(r => ({ text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 250), cls: r.className, pucks: [...r.querySelectorAll('.puck')].map(pk => ({ who: (pk.querySelector('.nm')?.textContent || '').trim(), cls: pk.className.toString().replace(/\s+/g, ' ').slice(0, 100), title: pk.getAttribute('title') || '', oilp: pk.dataset.oilp || '', style: pk.getAttribute('style') || '' })) }))
  }, iid)
  const earn = await p.evaluate(() => ({ items: [...document.querySelectorAll('#schedBoard [data-oilitem]')].filter(e => e.offsetParent).map(e => e.getAttribute('data-oilitem') + ' :: ' + e.className.toString().slice(0, 40) + ' :: ' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 80)), banner: (document.querySelector('.oil-banner, #schedBoard .oilbar, #schedBoard [class*=oil]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 200) }))
  console.log(tag, 'OIL Earn row:', j(row), '| items:', j(earn))
  const r = p.locator('#schedBoard .sb-panel.grnd .sb-arow:visible', { hasText: 'OIL ask' }).first()
  if (await r.count()) { await r.scrollIntoViewIfNeeded(); await p.waitForTimeout(400) }
  await L.shot(p, 'rx4-4-' + tag + '-oil-earn-row')
  const pk = r.locator('.puck').first()
  let hover = null
  if (await pk.count()) { await pk.hover(); await p.waitForTimeout(700); hover = await pk.getAttribute('title'); await L.shot(p, 'rx4-4-' + tag + '-oil-earn-hover') }
  // a tap on a puck: does anything change?
  const before = await F.brief(p, iid)
  if (await pk.count()) { await pk.click(); await p.waitForTimeout(600) }
  const after = await F.brief(p, iid)
  const toastTap = await L.toast(p)
  await L.shot(p, 'rx4-4-' + tag + '-oil-earn-after-tap')
  await p.locator('#sbOil:visible').first().click().catch(() => {}); await p.waitForTimeout(500)
  return { row, earn, hover, tapChanged: j(before) !== j(after), toastTap }
}
out.oilUnpublished = await oilLook('8')
await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
await L.signAndPublish(p, DI)
out.pubSat = 'published Saturday'
out.oilPublished = await oilLook('9')
out.inputsEnd = await F.brief(p, iid)
console.log('end state', j(out.inputsEnd))
console.log('ERRORS', L.errs.join(' | ') || 'none'); out.errs = L.errs.slice()
L.saveRes('4', out)
await ctx.close(); await L.browser.close()
