// Walker C, C5 (CX) and C6 (red box, information only) - desktop 1440x900. One world.
import * as L from './or-C-lib.mjs'
import * as L2 from './or-C-lib2.mjs'
const { browser, page: p, errs } = await L.openWorld()
const DI = 2, ISO = '2026-07-15'
const j = o => JSON.stringify(o)
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Ranger', 'Hex'], from: ISO, to: ISO, timed: ['09:00', '10:00'], title: 'Range brief', rmk: 'Bring ID' }))[0]
console.log('filed', j(mt))
const iid = mt.iid

/* ---------- readers ---------- */
const state = async () => { const r = await L.rec(p, iid); return `INPUTS cx=${r.cx} reason="${r.cxr}" info=${r.info} box=${r.box} people=${j(r.people)} | row ${j(await L.rowData(p, DI, iid))}` }
async function readAll(tag, pics) {
  const out = {}
  await L.goEdit(p)
  const ri = await L.rowIdx(p, DI, iid)
  const day = p.locator('#eWeek .day:not(.peek)').nth(DI)
  out.weekRow = ri < 0 ? '(no row)' : await p.evaluate(([di, ri]) => {
    const z = document.querySelectorAll('#eWeek .day:not(.peek)')[di]; const f = z.querySelector(`[data-fill="g:${di}.${ri}.+"]`) || z.querySelector(`[data-slot="g:${di}.${ri}"]`); const r = f && f.closest('.pl-row'); if (!r) return '(not drawn)'
    return `class="${r.className}" text="${(r.innerText || '').replace(/\s+/g, ' ').trim()}" cxtag=${r.querySelector('.cxtag') ? r.querySelector('.cxtag').textContent.trim() : null} nameStrike=${getComputedStyle(r.querySelector('.nm .ntx')).textDecorationLine}`
  }, [DI, ri])
  const fold = day.locator('.sec-inp .pl-fold').first()
  if (!(await day.locator('.sec-inp .pl-row').count()) && await fold.count()) { await fold.scrollIntoViewIfNeeded().catch(() => {}); await fold.click(); await p.waitForTimeout(300) }
  out.weekLine = await p.evaluate(di => [...document.querySelectorAll('#eWeek .day:not(.peek)')[di].querySelectorAll('.sec-inp .pl-row')].map(r => { const nm = r.querySelector('.inp-cx') || r.querySelector('.nm .ntx'); return `text="${(r.innerText || '').replace(/\s+/g, ' ').trim()}" cxtag=${r.querySelector('.cxtag') ? r.querySelector('.cxtag').textContent.trim() + ' bg ' + getComputedStyle(r.querySelector('.cxtag')).backgroundColor : null} nameStrike=${nm ? getComputedStyle(nm).textDecorationLine : null} class="${r.className}"` }).join(' || '), DI)
  if (pics) { const r = day.locator('.sec-grnd .pl-row').first(); await r.scrollIntoViewIfNeeded().catch(() => {}); await p.evaluate(() => window.scrollBy(0, 150)); await L.shot(p, `${pics}-week`) }
  await L.openBoard(p, DI)
  const has = await p.evaluate(() => document.querySelectorAll('#schedBoard .pinp .sb-arow').length)
  if (!has) { const f = p.locator(`#schedBoard [data-pitog="${DI}"]:visible`).first(); if (await f.count()) { await f.scrollIntoViewIfNeeded().catch(() => {}); await f.click(); await p.waitForTimeout(300) } }
  out.boardRow = await p.evaluate(([di, ri]) => { const rows = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].filter(e => e.offsetParent); const r = rows.find(x => x.querySelector(`[data-fill="g:${di}.${ri}.+"], [data-slot="g:${di}.${ri}"]`)); if (!r) return '(not drawn)'; return `class="${r.className}" inputs=${JSON.stringify([...r.querySelectorAll('input.ain,textarea.ain')].map(x => x.value))} names=${JSON.stringify([...r.querySelectorAll('.ppl .puck .nm')].map(x => x.textContent))} cxtag=${r.querySelector('.cxtag') ? r.querySelector('.cxtag').textContent.trim() : null} buttons=${JSON.stringify([...r.querySelectorAll('button')].map(b => (b.getAttribute('title') || b.textContent || '').trim().slice(0, 24) + (b.disabled ? '(dis)' : '')))}` }, [DI, ri])
  out.boardLine = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .pinp .sb-arow.inprow')].filter(e => e.offsetParent).map(r => { const nm = r.querySelector('.inp-cx') || r.querySelector('.inpedit'); return `text="${(r.innerText || '').replace(/\s+/g, ' ').trim()}" cxtag=${r.querySelector('.cxtag') ? r.querySelector('.cxtag').textContent.trim() : null} nameStrike=${nm ? getComputedStyle(nm).textDecorationLine : null}` }).join(' || '))
  if (pics) { const r = p.locator('#schedBoard .sb-panel.grnd .sb-arow').first(); await r.scrollIntoViewIfNeeded().catch(() => {}); await L.shot(p, `${pics}-board`) }
  await L.closeBoard(p)
  await p.evaluate(() => window.go('inputs')); await p.locator('#inCalBtn').waitFor(); if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await p.locator('#inCalBtn').click(); await p.locator('#inpCal').waitFor()
  for (let i = 0; i < 12; i++) { const [m, y] = (await p.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); const at = +y * 12 + L.MONTHS.findIndex(x => x.startsWith(m)); if (at === 2026 * 12 + 6) break; await p.locator(at < 2026 * 12 + 6 ? '#icNext' : '#icPrev').click() }
  await p.waitForSelector(`[data-icday="${ISO}"]`)
  out.bar = await p.evaluate(iid => [...document.querySelectorAll(`.ib-bar[data-iid="${iid}"]`)].map(e => `text="${(e.textContent || '').replace(/\s+/g, ' ').trim()}" before="${getComputedStyle(e, '::before').content}" strike=${getComputedStyle(e).textDecorationLine} opacity=${getComputedStyle(e).opacity} tip="${(e.getAttribute('title') || '').replace(/\n/g, ' / ')}"`).slice(0, 1).join(''), iid)
  if (pics) { const cell = await p.locator(`[data-icday="${ISO}"]`).boundingBox(); const mon = await p.evaluate(() => { const c = document.querySelector('[data-icday="2026-07-13"]').getBoundingClientRect(), s = document.querySelector('[data-icday="2026-07-19"]').getBoundingClientRect(); return { x: c.x, right: s.right } }); await p.locator(`[data-icday="${ISO}"]`).scrollIntoViewIfNeeded(); const b2 = await p.locator(`[data-icday="${ISO}"]`).boundingBox(); await L.shot(p, `${pics}-bar`, { x: mon.x, y: b2.y, width: mon.right - mon.x, height: b2.height }) }
  await p.locator(`[data-icday="${ISO}"]`).focus(); await p.keyboard.press('Enter'); await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(350)
  const cardSel = `[data-testid="win-inputsday"] .icard[data-popiid="${iid}"]`
  const facts = sel => p.evaluate(s => [...document.querySelectorAll(s)].map(e => { const q = c => e.querySelector(c), cs = x => x ? getComputedStyle(x) : null; const t = q('.icard-title, .intitle'), k = q('.icard-kind, .intag'), w = q('.icx-why'), g = q('.icx'); return `text="${e.innerText.replace(/\s+/g, ' ')}" tag=${g ? g.textContent + ' bg ' + cs(g).backgroundColor : null} titleStrike=${t ? cs(t).textDecorationLine : null} kindStrike=${k ? cs(k).textDecorationLine : null} why=${w ? w.textContent + ' color ' + cs(w).color : null} h=${Math.round(e.getBoundingClientRect().height)}` }).join(' || '), sel)
  out.card = await facts(cardSel)
  if (pics) await L.shot(p, `${pics}-card`)
  // the window
  await p.locator(cardSel).first().click(); await p.waitForSelector('#inpEditPop', { timeout: 5000 }); await p.waitForTimeout(400)
  out.window = await p.evaluate(() => { const m = document.querySelector('[data-testid="inped-cx"]'); const w = document.querySelector('[data-testid="win-inputedit"]'); const bar = w.querySelector('.win-bar'); return { cxMark: m ? `text="${m.textContent}" tag=${m.querySelector('.icx') ? getComputedStyle(m.querySelector('.icx')).backgroundColor : null} why=${m.querySelector('.icx-why') ? getComputedStyle(m.querySelector('.icx-why')).color : null} controlsInMark=${m.querySelectorAll('button,input').length}` : null, bar: (bar ? bar.innerText : '').replace(/\s+/g, ' ').trim(), cxButtons: [...w.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(t => /cancel|cx|un-?cancel/i.test(t)) } })
  if (pics) { const bar = await p.locator('[data-testid="win-inputedit"] .win-bar').first().boundingBox(); await L.shot(p, `${pics}-window`, { x: Math.max(0, bar.x - 10), y: Math.max(0, bar.y - 10), width: Math.min(1440 - bar.x, bar.width + 20), height: 120 }) }
  const c = p.locator('#inpEditCancel:visible, #inpEditClose:visible').first(); if (await c.count()) await c.click(); await p.waitForTimeout(250)
  const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await x.click(); await p.waitForTimeout(250) }
  // the list
  await p.locator('#inListBtn').click(); await p.waitForTimeout(400)
  if (!(await p.locator('#inRangeAll').count())) await p.locator('#inRangeBtn').click()
  await p.locator('#inRangeAll').click().catch(() => {}); await p.waitForTimeout(400)
  out.list = await facts(`tr[data-iid="${iid}"]`)
  if (pics) { const r = p.locator(`tr[data-iid="${iid}"]`).first(); await r.scrollIntoViewIfNeeded(); const b = await r.boundingBox(); await L.shot(p, `${pics}-list`, { x: 0, y: Math.max(0, b.y - 60), width: 1440, height: Math.min(200, 900 - Math.max(0, b.y - 60)) }) }
  await p.locator('#inCalBtn').click(); await p.waitForTimeout(200)
  console.log(`--- ${tag}`); for (const [k, v] of Object.entries(out)) console.log(`  ${k}: ${typeof v === 'string' ? v : j(v)}`)
  return out
}
async function boardCx(why, un = false) {
  await L.goEdit(p)
  const ri = await L.rowIdx(p, DI, iid)
  await L.openBoard(p, DI)
  const b = p.locator(`#schedBoard [data-grcx="${DI}.${ri}"]`).first(); await b.scrollIntoViewIfNeeded()
  const m = await L.toastMark(p)
  const before = await p.evaluate(() => (document.querySelector('#cxSave') ? 'dialog already open' : 'no dialog'))
  await b.click(); await p.waitForTimeout(500)
  const dlg = await p.evaluate(() => { const s = document.querySelector('#cxSave'); if (!s) return null; const w = s.closest('.airpop, .win, [role=dialog], div'); return { text: (w ? w.innerText : '').replace(/\s+/g, ' ').slice(0, 200), un: !!document.querySelector('#cxUn') } })
  console.log('  press CX:', j(dlg), '| toast:', await L.toastsSince(p, m))
  if (dlg) {
    if (un && dlg.un) await p.locator('#cxUn').click()
    else { if (why) { const q = p.locator(`#cxQuick [data-cxq="${why}"]`).first(); if (await q.count()) await q.click(); else await p.locator('#cxReason').fill(why) } ; await p.locator('#cxSave').click() }
    await p.waitForTimeout(500)
  }
  console.log('  after:', await L.toastsSince(p, m), '|', await state())
}

// ---- C5 ----
console.log('=== BEFORE'); await readAll('before', null)
console.log('=== CX with reason WX')
await boardCx('WX')
console.log(await state())
const cx1 = await readAll('cancelled WX', 'c5-cx')
console.log('=== UNDO'); await L.goEdit(p); const u = await L.undoRedo(p, 'undo'); console.log(' used', u.used, '| toast', await L.toastNow(p), '|', await state())
console.log('=== REDO'); const r = await L.undoRedo(p, 'redo'); console.log(' used', r.used, '|', await state())
console.log('=== CX again (un-cancel)')
await boardCx(null, true)
const un1 = await readAll('un-cancelled', 'c5-uncx')
console.log('=== cancel with NO reason')
await boardCx('')
const cx2 = await readAll('cancelled, no reason', 'c5-cxnone')
console.log('=== un-cancel again to leave it plain'); await boardCx(null, true)
console.log('ERRORS', errs.join(' | ') || 'none')
await browser.close()
