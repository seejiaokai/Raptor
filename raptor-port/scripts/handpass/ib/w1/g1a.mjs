/* scenarios 1-6 (the put-back route), one size: node g1a.mjs desktop|phone */
import * as L from './ibl.mjs'
const size = process.argv[2] || 'desktop'
const b = await L.launch()
const NOTE_RX = /put back|ground programme|added|not put back/i
const notes = page => page.evaluate(rx => {
  const R = new RegExp(rx, 'i'), out = []
  for (const e of document.querySelectorAll('body *')) {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue
    if (e.children.length > 3) continue
    const t = (e.innerText || '').trim()
    if (t && t.length < 120 && R.test(t) && !out.includes(t)) out.push(t)
  }
  return out
}, NOTE_RX.source)
const barState = async page => ({ text: await L.txt(page, '[data-testid="oilbar-text"]'), pos: await L.onTopAndInside(page, '[data-testid="oilbar"]') })
const jf = x => JSON.stringify(x)
async function undoPress(s) {
  const info = await L.findUndoBtn(s.page)
  const sel = '#undoBtn'
  if (!info || !info.vis) return { info, pressed: false }
  const loc = s.page.locator(sel).first()
  await loc.evaluate(e => e.click())
  await s.page.waitForTimeout(400)
  return { info, pressed: true }
}
async function newRoute(label, opts) {
  const s = await L.session(b, size)
  const r = await L.route(s, opts)
  return { s, r }
}
try {
  /* ---- A: 1, 2, 3 ---- */
  {
    const { s, r } = await newRoute('A')
    const { page } = s
    const premiseOk = jf(r.pre) === jf([`range brief:bane@${r.iid}`]) && !(await L.rowsOf(page, L.FRI_DI)).length && jf(await L.oilOf(page, r.iid)) === '{}'
    if (!premiseOk) { L.record('1', size, 'NOT WALKED', 'set-up did not reach the premise: pre=' + jf(r.pre) + ' rows=' + jf(await L.rowsOf(page, L.FRI_DI)) + ' oil=' + jf(await L.oilOf(page, r.iid))) }
    else {
      const takeoffUsed = `row ✕ found=${r.found.grdel}, card Undo found=${r.found.undoCard}`
      const acc = await L.pressAccept(s, L.FRI_DI, r.iid)
      await page.locator('[data-testid="oilconf"]').waitFor({ state: 'visible', timeout: 4000 }).catch(() => {})
      const lead = await L.txt(page, '[data-testid="oilconf-lead"]')
      const cancel = await L.txt(page, '[data-testid="oilconf-cancel"]'), save = await L.txt(page, '[data-testid="oilconf-save"]')
      const dis = await page.locator('[data-testid="oilconf-save"]').isDisabled().catch(() => 'n/a')
      const rows = await L.rowsOf(page, L.FRI_DI)
      const box = await L.onTopAndInside(page, '[data-testid="oilconf"] .airpop-box')
      const fit = await L.whollyIn(page, '[data-testid="oilconf"] .airpop-box', ['[data-testid="oilconf-cancel"]', '[data-testid="oilconf-save"]'])
      const pic = await L.shot(s, `1-${size}-question`)
      const ok = lead === "Putting Ranger's Range brief back on the programme" && cancel === 'Don’t put back' && save === 'Put back' && dis === true && rows.length === 0 && box.top && box.inside && fit.every(x => x === 'in')
      L.record('1', size, ok ? 'PASS' : 'FAIL', `take-off control: ${takeoffUsed}; accept button text "${acc}"; lead="${lead}"; buttons="${cancel}"/"${save}", Put back disabled=${dis}; ground rows from the input=${jf(rows)}; sheet box ${jf(box)}, buttons ${jf(fit)}`, pic)
      /* 2 */
      await s.press('[data-testid="oil-yes"]')
      const dis2 = await page.locator('[data-testid="oilconf-save"]').isDisabled()
      await s.press('[data-testid="oilconf-save"]')
      await page.waitForTimeout(500)
      const rows2 = await L.rowsOf(page, L.FRI_DI), oil2 = await L.oilOf(page, r.iid)
      const conf = await page.locator('[data-testid="oilconf"]').count(), bar = await page.locator('[data-testid="oilbar"]').count()
      const nt = await notes(page)
      const pic2 = await L.shot(s, `2-${size}-after-put-back`)
      const ok2 = conf === 0 && bar === 0 && rows2.length === 1 && jf(oil2) === jf({ [L.FRI]: 0.5 }) && nt.some(t => /ground programme/i.test(t))
      L.record('2', size, ok2 ? 'PASS' : 'FAIL', `after Yes (Put back enabled after Yes: ${!dis2}) + Put back: sheet=${conf}, bar=${bar}, rows=${jf(rows2)}, answer=${jf(oil2)}, notes seen=${jf(nt)}`, pic2)
      /* 3 */
      const before = await L.findUndoBtn(page)
      const u = await undoPress(s)
      const rows3 = await L.rowsOf(page, L.FRI_DI), oil3 = await L.oilOf(page, r.iid)
      const pic3 = await L.shot(s, `3-${size}-after-undo`)
      const ok3 = u.pressed && rows3.length === 0 && jf(oil3) === '{}'
      L.record('3', size, u.pressed ? (ok3 ? 'PASS' : 'FAIL') : 'NOT WALKED', `Undo button words before pressing: ${jf(before)}; pressed=${u.pressed}; after ONE Undo rows=${jf(rows3)}, answer=${jf(oil3)}`, pic3)
    }
    if (s.errs.length) L.record('errs-A', size, 'RECORD', jf(s.errs))
    await s.ctx.close()
  }
  /* ---- B: 4, 5 ---- */
  {
    const { s, r } = await newRoute('B')
    const { page } = s
    const rows0 = await L.rowsOf(page, L.FRI_DI)
    if (rows0.length) { L.record('4', size, 'NOT WALKED', 'set-up: input still on programme ' + jf(rows0)); await s.ctx.close() }
    else {
      await L.pressAccept(s, L.FRI_DI, r.iid)
      await page.locator('[data-testid="oilconf"]').waitFor({ state: 'visible', timeout: 4000 }).catch(() => {})
      /* the card's flash: read straight after the press */
      const cardSel = `#schedBoard [data-acc="g"][data-acck="${r.iid}"]`
      await page.evaluate(sel => { const c = document.querySelector(sel)?.closest('.sb-arow, .sbi-row, tr, .icard, .pinp > *') || document.querySelector(sel); window.__flash = []; window.__card = c; new MutationObserver(m => m.forEach(x => window.__flash.push(x.type + ':' + (x.attributeName || '') + ':' + (x.target.className || '')))).observe(document.querySelector('#schedBoard'), { subtree: true, attributes: true, attributeFilter: ['class', 'style'] }) }, cardSel)
      await s.press('[data-testid="oilconf-cancel"]')
      const flashNow = await page.evaluate(() => ({ anims: document.getAnimations().map(a => (a.animationName || a.constructor.name) + ':' + (a.effect?.target?.className || '')), mut: (window.__flash || []).slice(0, 12) }))
      const picFlash = await L.shot(s, `4-${size}-right-after-dont-put-back`)
      await page.waitForTimeout(600)
      const bs = await barState(page), rows = await L.rowsOf(page, L.FRI_DI)
      const pic = await L.shot(s, `4-${size}-bar`)
      const ok = rows.length === 0 && bs.text === 'Not put back — OIL not answered' && bs.pos.top && bs.pos.inside
      L.record('4', size, ok ? 'PASS' : 'FAIL', `after "Don't put back": rows=${jf(rows)}, bar text="${bs.text}", bar ${jf(bs.pos)}; FLASH record: animations right after = ${jf(flashNow.anims)}, class/style changes = ${jf(flashNow.mut)} (picture ${picFlash})`, pic)
      /* 5 */
      const okLabel = await L.txt(page, '[data-testid="oilbar-ok"]'), ansLabel = await L.txt(page, '[data-testid="oilbar-answer"]')
      await s.press('[data-testid="oilbar-ok"]')
      const afterOk = { bar: await page.locator('[data-testid="oilbar"]').count(), conf: await page.locator('[data-testid="oilconf"]').count(), rows: await L.rowsOf(page, L.FRI_DI), oil: await L.oilOf(page, r.iid) }
      const picOk = await L.shot(s, `5-${size}-after-ok`)
      await L.pressAccept(s, L.FRI_DI, r.iid)
      await page.locator('[data-testid="oilconf"]').waitFor({ state: 'visible', timeout: 4000 }).catch(() => {})
      const sheetAgain = await page.locator('[data-testid="oilconf"]').count()
      let how
      if (size === 'desktop') { await page.keyboard.press('Escape'); how = 'Escape' }
      else { const bx = await page.locator('[data-testid="oilconf"] .airpop-box').boundingBox(); await page.touchscreen.tap(8, Math.max(8, bx.y - 20 > 8 ? 8 : bx.y + bx.height + 20)); how = 'tap outside the sheet at (8,8)' }
      await page.waitForTimeout(600)
      const bs2 = await barState(page), rows2 = await L.rowsOf(page, L.FRI_DI), confN = await page.locator('[data-testid="oilconf"]').count()
      const pic2 = await L.shot(s, `5-${size}-bar-again`)
      const ok5 = afterOk.bar === 0 && afterOk.conf === 0 && afterOk.rows.length === 0 && jf(afterOk.oil) === '{}' && sheetAgain === 1 && bs2.text === 'Not put back — OIL not answered' && rows2.length === 0 && confN === 0
      L.record('5', size, ok5 ? 'PASS' : 'FAIL', `OK ("${okLabel}"; neighbour "${ansLabel}"): bar=${afterOk.bar}, sheet=${afterOk.conf}, rows=${jf(afterOk.rows)}, answer=${jf(afterOk.oil)}; Accept again: sheet up=${sheetAgain}; closed by ${how}: sheet=${confN}, bar text="${bs2.text}" ${jf(bs2.pos)}, rows=${jf(rows2)}`, pic2)
    }
    if (s.errs.length) L.record('errs-B', size, 'RECORD', jf(s.errs))
    await s.ctx.close()
  }
  /* ---- C: 6 ---- */
  {
    const { s, r } = await newRoute('C')
    const { page } = s
    if ((await L.rowsOf(page, L.FRI_DI)).length) L.record('6', size, 'NOT WALKED', 'set-up: input still on programme')
    else {
      await L.pressAccept(s, L.FRI_DI, r.iid)
      await page.locator('[data-testid="oilconf"]').waitFor({ state: 'visible', timeout: 4000 }).catch(() => {})
      await s.press('[data-testid="oilconf-cancel"]')
      await page.locator('[data-testid="oilbar"]').waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
      await s.press('[data-testid="oilbar-answer"]')
      const q = await page.locator('[data-testid="oilconf"]').count()
      await s.press('[data-testid="oil-no"]')
      await s.press('[data-testid="oilconf-save"]')
      await page.waitForTimeout(500)
      const rows = await L.rowsOf(page, L.FRI_DI), oil = await L.oilOf(page, r.iid)
      const pic = await L.shot(s, `6-${size}-after-no-put-back`)
      L.record('6', size, rows.length === 1 && jf(oil) === jf({ [L.FRI]: 0 }) ? 'PASS' : 'FAIL', `question came back from "Answer OIL": ${q === 1}; after No + Put back: rows=${jf(rows)}, answer=${jf(oil)}, bar=${await page.locator('[data-testid="oilbar"]').count()}`, pic)
    }
    if (s.errs.length) L.record('errs-C', size, 'RECORD', jf(s.errs))
    await s.ctx.close()
  }
} catch (e) {
  L.record('g1a', size, 'NOT WALKED', 'script error: ' + e.message.split('\n')[0])
  console.log(e.stack)
}
await b.close()
