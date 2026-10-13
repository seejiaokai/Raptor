/* scenarios 7-14, one size: node g1b.mjs desktop|phone */
import * as L from './ibl.mjs'
const size = process.argv[2] || 'desktop'
const only = process.argv[3] ? process.argv[3].split(',') : null
const want = id => !only || only.includes(id)
const b = await L.launch()
const jf = x => JSON.stringify(x)
const barState = async page => ({ text: await L.txt(page, '[data-testid="oilbar-text"]'), pos: await L.onTopAndInside(page, '[data-testid="oilbar"]') })
const notes = page => page.evaluate(() => {
  const R = /put back|ground programme|added|changed|not put back/i, out = []
  for (const e of document.querySelectorAll('body *')) {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height || e.children.length > 3) continue
    const t = (e.innerText || '').trim()
    if (t && t.length < 120 && R.test(t) && !out.includes(t)) out.push(t)
  }
  return out
})
async function undoPress(s) {
  const info = await L.findUndoBtn(s.page)
  if (!info || !info.vis) return { info, pressed: false }
  await s.page.locator('#undoBtn').first().evaluate(e => e.click())
  await s.page.waitForTimeout(400)
  return { info, pressed: true }
}
const premise = async (s, r) => !(await L.rowsOf(s.page, L.FRI_DI)).length
const guard = async (id, fn) => { try { await fn() } catch (e) { L.record(id, size, 'NOT WALKED', 'script error: ' + e.message.split('\n')[0]); console.log(e.stack) } }

if (want('7')) await guard('7', async () => {
  const s = await L.session(b, size), { page } = s
  const r = await L.route(s, { holidayAnswer: 'yes' })
  const oil0 = await L.oilOf(page, r.iid)
  if ((await L.rowsOf(page, L.FRI_DI)).length || jf(oil0) !== jf({ [L.FRI]: 0.5 })) { L.record('7', size, 'NOT WALKED', `set-up: rows=${jf(await L.rowsOf(page, L.FRI_DI))} answer before=${jf(oil0)}`) }
  else {
    await L.pressAccept(s, L.FRI_DI, r.iid)
    await page.waitForTimeout(400)
    const conf = await page.locator('[data-testid="oilconf"]').count(), bar = await page.locator('[data-testid="oilbar"]').count()
    const rows = await L.rowsOf(page, L.FRI_DI), oil = await L.oilOf(page, r.iid)
    const pic = await L.shot(s, `7-${size}-accept-answered`)
    L.record('7', size, !conf && !bar && rows.length === 1 ? 'PASS' : 'FAIL', `answer before taking off=${jf(oil0)}; after Accept: sheet=${conf}, bar=${bar}, rows=${jf(rows)}, answer=${jf(oil)}`, pic)
  }
  if (s.errs.length) L.record('errs-7', size, 'RECORD', jf(s.errs))
  await s.ctx.close()
})

if (want('8')) await guard('8', async () => {
  const s = await L.session(b, size), { page } = s
  const iid = await L.fileIt(s, L.WED, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
  await L.openBoard(s, L.WED_DI)
  const pre = await L.rowsOf(page, L.WED_DI)
  if (pre.length !== 1) { L.record('8', size, 'NOT WALKED', 'set-up: Wednesday programme rows=' + jf(pre)) }
  else {
    const f = await L.takeOff(s, L.WED_DI, iid)
    const mid = await L.rowsOf(page, L.WED_DI)
    await L.pressAccept(s, L.WED_DI, iid)
    await page.waitForTimeout(400)
    const conf = await page.locator('[data-testid="oilconf"]').count(), bar = await page.locator('[data-testid="oilbar"]').count()
    const rows = await L.rowsOf(page, L.WED_DI), oil = await L.oilOf(page, iid)
    const pic = await L.shot(s, `8-${size}-accept-working-day`)
    L.record('8', size, mid.length === 0 && !conf && !bar && rows.length === 1 ? 'PASS' : 'FAIL', `rows before=${jf(pre)}, after take-off=${jf(mid)} (controls ${jf(f)}); after Accept: sheet=${conf}, bar=${bar}, rows=${jf(rows)}, answer=${jf(oil)}`, pic)
  }
  if (s.errs.length) L.record('errs-8', size, 'RECORD', jf(s.errs))
  await s.ctx.close()
})

if (want('9')) await guard('9', async () => {
  const s = await L.session(b, size), { page } = s
  const r = await L.route(s)
  if ((await L.rowsOf(page, L.FRI_DI)).length) { L.record('9', size, 'NOT WALKED', 'set-up: still on programme') }
  else {
    const u = await undoPress(s)
    const rows = await L.rowsOf(page, L.FRI_DI)
    const conf = await page.locator('[data-testid="oilconf"]').count(), bar = await page.locator('[data-testid="oilbar"]').count()
    await L.openPI(s, L.FRI_DI)
    const card = await page.evaluate(() => { const p = document.querySelector('#schedBoard .pinp'); return p ? p.innerText.replace(/\s+/g, ' ').slice(0, 400) : null })
    const oilTag = /OIL\?/.test(card || '')
    const pic = await L.shot(s, `9-${size}-after-app-undo`)
    L.record('9', size, u.pressed ? (rows.length === 1 && !conf && !bar ? 'PASS' : 'FAIL') : 'NOT WALKED', `Undo "${u.info && u.info.title}" pressed=${u.pressed}; rows=${jf(rows)}, sheet=${conf}, bar=${bar}; RECORD card under Personal Inputs reads: "${card}" ("OIL?" in it: ${oilTag})`, pic)
  }
  if (s.errs.length) L.record('errs-9', size, 'RECORD', jf(s.errs))
  await s.ctx.close()
})

if (want('10')) await guard('10', async () => {
  const s = await L.session(b, size), { page } = s
  const r = await L.route(s)
  if ((await L.rowsOf(page, L.FRI_DI)).length) { L.record('10', size, 'NOT WALKED', 'set-up: still on programme') }
  else {
    await L.pressAccept(s, L.FRI_DI, r.iid)
    await page.locator('[data-testid="oilconf"]').waitFor({ state: 'visible', timeout: 4000 }).catch(() => {})
    await s.press('[data-testid="oilconf-cancel"]')
    await page.locator('[data-testid="oilbar"]').waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
    const bar0 = await page.locator('[data-testid="oilbar"]').count()
    let presses = 0, rows = []
    for (; presses < 5; presses++) { const u = await undoPress(s); if (!u.pressed) break; rows = await L.rowsOf(page, L.FRI_DI); if (rows.length) { presses++; break } }
    const barAfterUndo = await page.locator('[data-testid="oilbar"]').count()
    const oilBefore = await L.oilOf(page, r.iid)
    const pic0 = await L.shot(s, `10-${size}-after-undo-bar-state`)
    if (!rows.length || !barAfterUndo) {
      L.record('10', size, 'NOT WALKED', `set-up: bar before undo=${bar0}, Undo presses=${presses}, rows after=${jf(rows)}, bar after undo=${barAfterUndo}`, pic0)
    } else {
      await s.press('[data-testid="oilbar-answer"]')
      await page.waitForTimeout(500)
      const conf = await page.locator('[data-testid="oilconf"]').count()
      const nt = await notes(page), rows2 = await L.rowsOf(page, L.FRI_DI), oil2 = await L.oilOf(page, r.iid)
      const bar2 = await page.locator('[data-testid="oilbar"]').count()
      const pic = await L.shot(s, `10-${size}-answer-oil-after-undo`)
      L.record('10', size, !conf ? 'PASS' : 'FAIL', `Undo presses=${presses}; bar still up after the take-off was undone=${barAfterUndo}, answer before=${jf(oilBefore)}; after "Answer OIL": question sheet=${conf}, notes seen=${jf(nt)}, rows=${jf(rows2)}, answer=${jf(oil2)}, bar=${bar2}`, pic)
    }
  }
  if (s.errs.length) L.record('errs-10', size, 'RECORD', jf(s.errs))
  await s.ctx.close()
})

if (want('11') && size === 'desktop') await guard('11', async () => {
  const s = await L.session(b, size), { page } = s
  const iid = await L.fileIt(s, L.FRI, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
  await L.makeHoliday(s, 'later')
  await L.go(page, 'editsched')
  const wk = sel => page.locator(`#eWeek ${sel}`)
  let undoN = await wk(`[data-acc="x"][data-acck="${iid}"]:visible`).count()
  const tog = await wk(`[data-pitog="${L.FRI_DI}"]`).count()
  if (!undoN && tog) { await wk(`[data-pitog="${L.FRI_DI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() }); await page.waitForTimeout(400); undoN = await wk(`[data-acc="x"][data-acck="${iid}"]:visible`).count() }
  if (!undoN) { L.record('11', size, 'NOT WALKED', `no Undo on the week's card (Personal Inputs toggles found=${tog}); any [data-acc] in week=${await page.locator('#eWeek [data-acc]').count()}`, await L.shot(s, `11-${size}-no-card`)) }
  else {
    const undoB = wk(`[data-acc="x"][data-acck="${iid}"]:visible`).first()
    await undoB.evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }) })
    await undoB.click()
    await page.waitForTimeout(500)
    const mid = await L.rowsOf(page, L.FRI_DI)
    let accN = await wk(`[data-acc="g"][data-acck="${iid}"]:visible`).count()
    if (!accN && tog) { await wk(`[data-pitog="${L.FRI_DI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() }); await page.waitForTimeout(400); accN = await wk(`[data-acc="g"][data-acck="${iid}"]:visible`).count() }
    if (!accN) { L.record('11', size, 'NOT WALKED', `after Undo (rows=${jf(mid)}) no Accept on the week's card`, await L.shot(s, `11-${size}-no-accept`)) }
    else {
      const accB = wk(`[data-acc="g"][data-acck="${iid}"]:visible`).first()
      await accB.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
      await accB.click(); await page.waitForTimeout(500)
      const lead = await L.txt(page, '[data-testid="oilconf-lead"]')
      const fit = lead ? await L.whollyIn(page, '[data-testid="oilconf"] .airpop-box', ['[data-testid="oilconf-cancel"]', '[data-testid="oilconf-save"]']) : null
      const box = lead ? await L.onTopAndInside(page, '[data-testid="oilconf"] .airpop-box') : null
      const pic1 = await L.shot(s, `11-${size}-week-question`)
      let rows = null, oil = null
      if (lead) { await s.press('[data-testid="oil-yes"]'); await s.press('[data-testid="oilconf-save"]'); await page.waitForTimeout(500); rows = await L.rowsOf(page, L.FRI_DI); oil = await L.oilOf(page, iid) }
      const pic = await L.shot(s, `11-${size}-week-after-put-back`)
      L.record('11', size, lead && rows.length === 1 ? 'PASS' : 'FAIL', `on the week: rows after Undo=${jf(mid)}; question lead="${lead}", sheet ${jf(box)}, buttons ${jf(fit)}; after Yes + Put back rows=${jf(rows)}, answer=${jf(oil)}`, pic)
      void pic1
    }
  }
  if (s.errs.length) L.record('errs-11', size, 'RECORD', jf(s.errs))
  await s.ctx.close()
})

if (want('12')) await guard('12', async () => {
  const s = await L.session(b, size), { page } = s
  const r = await L.route(s, { people: ['bane', 'nick'] })
  const pre = r.pre
  if ((await L.rowsOf(page, L.FRI_DI)).length) { L.record('12', size, 'NOT WALKED', 'set-up: still on programme ' + jf(await L.rowsOf(page, L.FRI_DI))) }
  else {
    await L.pressAccept(s, L.FRI_DI, r.iid)
    await page.locator('[data-testid="oilconf"]').waitFor({ state: 'visible', timeout: 4000 }).catch(() => {})
    const lead = await L.txt(page, '[data-testid="oilconf-lead"]')
    const pic1 = await L.shot(s, `12-${size}-shared-question`)
    await s.press('[data-testid="oil-yes"]'); await s.press('[data-testid="oilconf-save"]'); await page.waitForTimeout(500)
    const rows = await L.rowsOf(page, L.FRI_DI), oil = await L.oilOf(page, r.iid)
    const n = await page.evaluate(() => window.INPUTS.filter(r => r.title === 'Range brief').length)
    const pic = await L.shot(s, `12-${size}-shared-after-put-back`)
    const oneRow = rows.length === 1 && /bane/.test(rows[0]) && /nick/.test(rows[0])
    L.record('12', size, /2 people/.test(lead || '') && oneRow && jf(oil) === jf({ [L.FRI]: 0.5 }) ? 'PASS' : 'FAIL', `RECORD first line: "${lead}"; before take-off rows=${jf(pre)}; after Yes + Put back rows=${jf(rows)} (one row with both men: ${oneRow}), the input's answer=${jf(oil)}, input records titled Range brief=${n}`, pic)
    void pic1
  }
  if (s.errs.length) L.record('errs-12', size, 'RECORD', jf(s.errs))
  await s.ctx.close()
})

if (want('13')) await guard('13', async () => {
  const s = await L.session(b, size), { page } = s
  const r = await L.route(s)
  await page.reload()
  await page.waitForSelector('#luser', { state: 'visible', timeout: 8000 })
  await page.fill('#luser', 'us'); await page.fill('#lpass', 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
  const still = await page.evaluate(i => { const x = window.INPUTS.find(r => String(r.iid) === String(i)); return x ? { who: x.who || x.people, title: x.title } : 'GONE' }, r.iid)
  const rows0 = await L.rowsOf(page, L.FRI_DI)
  const seen = {}
  for (const pg of ['viewsched', 'editsched', 'inputs']) {
    await page.evaluate(p => window.go(p), pg); await page.waitForTimeout(800)
    seen[`${pg}:CURPAGE`] = await page.evaluate(() => window.CURPAGE)
    for (const sel of ['[data-sbday]', '[data-acc="g"]', '[data-acc="x"]', '[data-acc]', '[data-grdel]', '[data-pitog]', '.pinp']) seen[`${pg}:${sel}`] = await page.locator(sel).count()
    seen[`${pg}:page text has Accept/Undo`] = await page.evaluate(() => /(ACCEPT|UNDO)/i.test(document.body.innerText))
    seen[`${pg}:Range brief shown`] = await page.evaluate(() => /Range brief/i.test(document.body.innerText))
    await L.shot(s, `13-${size}-member-${pg}`)
  }
  const bad = Object.entries(seen).filter(([k, v]) => (/data-acc|grdel|Accept\/Undo/.test(k)) && (v === true || (typeof v === 'number' && v > 0)))
  L.record('13', size, 'RECORD', `signed in as Ranger (us). Input still stored: ${jf(still)}; programme rows for the input=${jf(rows0)}. Counts/pages seen: ${jf(seen)}. Any Accept/Undo/✕ buttons: ${bad.length ? jf(bad) : 'none'}`, `docs/img/handpass/2026-10-13-inputs-batch/w1/13-${size}-member-*.png`)
  if (s.errs.length) L.record('errs-13', size, 'RECORD', jf(s.errs))
  await s.ctx.close()
})

if (want('14') && size === 'side') await guard('14', async () => {
  const s = await L.session(b, 'side'), { page } = s
  const r = await L.route(s)
  if ((await L.rowsOf(page, L.FRI_DI)).length) { L.record('14', 'phone on its side', 'NOT WALKED', 'set-up: still on programme') }
  else {
    await L.pressAccept(s, L.FRI_DI, r.iid)
    await page.locator('[data-testid="oilconf"]').waitFor({ state: 'visible', timeout: 4000 }).catch(() => {})
    await page.waitForTimeout(500)
    const lead = await L.txt(page, '[data-testid="oilconf-lead"]')
    const fit = await L.whollyIn(page, '[data-testid="oilconf"] .airpop-box', ['[data-testid="oilconf-cancel"]', '[data-testid="oilconf-save"]'])
    const box = await L.onTopAndInside(page, '[data-testid="oilconf"] .airpop-box')
    const vp = await page.evaluate(() => [innerWidth, innerHeight])
    const pic1 = await L.shot(s, `14-side-question`)
    const cancelCentre = await page.evaluate(() => { const e = document.querySelector('[data-testid="oilconf-cancel"]'); const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === e || e.contains(h) })
    await s.press('[data-testid="oilconf-cancel"]')
    await page.waitForTimeout(600)
    const bs = await barState(page)
    const pic2 = await L.shot(s, `14-side-bar`)
    const ok = fit.every(x => x === 'in') && bs.pos.top && bs.pos.inside
    L.record('14', 'phone on its side', ok ? 'PASS' : 'FAIL', `(session opened at 844 x 390) viewport=${jf(vp)}; lead="${lead}"; sheet ${jf(box)}; both buttons inside sheet and screen: ${jf(fit)}; Don't put back is the topmost thing at its centre: ${cancelCentre}; bar text="${bs.text}" ${jf(bs.pos)} (question picture ${pic1})`, pic2)
  }
  if (s.errs.length) L.record('errs-14', 'phone on its side', 'RECORD', jf(s.errs))
  await s.ctx.close()
})
await b.close()
