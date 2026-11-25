// Walker b — B5 (F-S1, F-S2 on the week): the leave's name (LL) and Reject pressed on Ranger's HELD row of the week
// (after a typed start and a Tab, the caret in his end box), each also as a control on a row NOT held (click away first).
// (a) the window must be RANGER's leave, his name alone, 09:00–10:00; its Delete removes his, Hex keeps 08:00–10:00.
// (b) a shared overseas duty: Reject on Ranger's row — Ranger's duty back to Personal Inputs, Hex's stays under Unavailable.
//   SZ=desk ENG=chromium ONLY=a-click,a-noblur,a-ctl,b-click,b-noblur,b-ctl
console.log('shr-b-b5 v1')
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', cfg = `${SZ} ${ENG}`
const ONLY = (process.env.ONLY || 'a-click,a-noblur,a-ctl,b-click,b-noblur,b-ctl').split(',')
const B = await (await import('./shr-b-lib.mjs')).setup(`b5-${SZ}-${ENG}`)
const { start, fileInput, go, sleep, log, state, weekCell, typeIn, pic, J, judge, showDay, caret, shownToast, catchToast, releaseToast } = B
const UNAV = di => [`#eWeek .day[data-day="${di}"] .sec-unav`]
/* every input of the two on the day, with its filing (acc) */
const st = page => page.evaluate(() => {
  const nm = id => ({ bane: 'Ranger', rocky: 'Hex' })[id] || id
  const hm = m => m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
  return window.INPUTS.filter(r => r.date === 'Jul 15' && (r.people || []).some(x => x.p === 'bane' || x.p === 'rocky')).map(r => `${r.type} ${(r.people || []).map(x => nm(x.p)).join('+')} ${r.allday ? 'allday' : hm(r.s) + '-' + hm(r.e)} "${r.remarks || ''}" acc:${r.acc || '-'} [${r.iid}]`)
})
/* where each man's row of the input is drawn on the day: the section it sits in */
const where = (page, di) => page.evaluate(di => {
  const out = []
  for (const p of document.querySelectorAll(`#eWeek .day[data-day="${di}"] .puck[data-person="bane"], #eWeek .day[data-day="${di}"] .puck[data-person="rocky"]`)) {
    if (p.getBoundingClientRect().width < 1) continue
    const row = p.closest('.pl-row'); if (!row) continue
    const lbl = row.querySelector('[data-inpedit]'); if (!lbl) continue
    const sec = p.closest('.dsec')?.getAttribute('data-secmove') || '?'
    out.push(`${p.getAttribute('data-person') === 'bane' ? 'Ranger' : 'Hex'} ${(lbl.textContent || '').trim()} in ${sec} [${row.getAttribute('data-inprow') || ''}]`)
  }
  return out
}, di)
/* the button `kind` (label | reject) on Ranger's row under Unavailable on day di */
const rangerBtn = (page, di, kind) => page.evaluate(([di, kind]) => {
  const p = [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] .sec-unav .puck[data-person="bane"]`)].find(x => x.getBoundingClientRect().width > 1)
  const row = p && p.closest('.pl-row'); if (!row) return null
  const b = row.querySelector(kind === 'label' ? '[data-inpedit]' : '[data-acc="x"]') || row.parentElement.querySelector(`[data-acc="x"][data-iuw="bane"]`)
  if (!b) return null
  b.setAttribute('data-shrb', kind)
  return { html: b.outerHTML.slice(0, 260) }
}, [di, kind])
async function fixture(c, spec) {
  const w = await start(SZ, ENG)
  const iid = await fileInput(w, c, B.WED, { people: [B.RANGER, B.HEX], from: '08:00', to: '10:00', ...spec })
  if (!iid) throw new Error('fixture not filed')
  await go(w.page, 'editsched'); await sleep(600)
  const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15'))
  await showDay(w.page, di); await sleep(300)
  const s0 = await st(w.page); const wh = await where(w.page, di)
  log(c, 'filed: ' + J(s0) + ' drawn: ' + J(wh))
  if (s0.length !== 1) throw new Error('fixture not one input: ' + J(s0))
  return { w, iid, di }
}
/* start 0900 Tab on Ranger's row: the caret held in his end box */
async function hold(w, c, di) {
  await typeIn(w, await weekCell(w.page, di, 'bane', 'str'), '0900'); await w.page.keyboard.press('Tab'); await sleep(600)
  const s = await state(w, c, 'start 0900 Tab', di)
  return s
}
async function pressBtn(w, c, di, kind, how) {
  const info = await rangerBtn(w.page, di, kind)
  if (!info) return { pressed: false }
  const before = await caret(w.page)
  const loc = w.page.locator(`[data-shrb="${kind}"]`).first()
  if (how === 'noblur') await loc.evaluate(e => e.click())
  else { if (w.tap) await loc.tap(); else await loc.click() }
  await sleep(700)
  const after = await caret(w.page)
  log(c, `pressed ${kind} by ${how}: ${info.html} :: caret before ${before} after ${after}`)
  return { pressed: true, info, caretBefore: before, caretAfter: after }
}
const readWin = page => page.evaluate(() => {
  const win = document.getElementById('inpEditPop'); if (!win || win.getBoundingClientRect().width < 2) return null
  const v = s => { const e = win.querySelector(s); return e ? (e.value ?? (e.textContent || '').trim()) : null }
  return {
    title: (win.querySelector('#inpEditTitle')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
    people: [...win.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')),
    personFixed: v('#inpEditPersonFixed'), person: v('#inpEditPerson'), type: v('#inpEditType') || v('#inpEditTypeFixed'),
    start: v('#inpEditStart'), end: v('#inpEditEnd'), rmk: v('#inpEditRmk'), allday: win.querySelector('#inpEditAllday')?.checked ?? null,
    text: (win.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 300),
  }
})
async function deleteInWin(w, c) {
  const del = w.page.locator('#inpEditDel:visible').first()
  if (!(await del.count())) return 'no Delete in the window'
  if (w.tap) await del.tap(); else await del.click(); await sleep(500)
  const conf = await w.page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 1 && /^(Delete|Yes|Confirm)/i.test((b.textContent || '').trim()) && b.id !== 'inpEditDel').map(b => (b.textContent || '').trim()))
  let pressed = null
  if (conf.length) { const b = w.page.getByRole('button', { name: new RegExp('^' + conf[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).filter({ visible: true }).last(); await b.click(); pressed = conf[0]; await sleep(600) }
  const note = await shownToast(w.page)
  return { confirmOffered: conf, pressed, note }
}

/* (a) the leave's name */
for (const v of ['a-click', 'a-noblur', 'a-ctl']) { if (!ONLY.includes(v)) continue; const c = `B5-${v}`; try {
  const { w, di } = await fixture(c, { type: 'LL' }); const P = `b5-${v}-${SZ}-${ENG}`
  await hold(w, c, di)
  if (v === 'a-ctl') { await w.page.mouse.click(3, 120); await sleep(800); await state(w, c, 'clicked away (row repainted)', di) }
  const pr = await pressBtn(w, c, di, 'label', v === 'a-noblur' ? 'noblur' : 'click')
  if (!pr.pressed) { judge(c, cfg, 'NOT WALKED', 'no LL label on Ranger\'s row'); await w.ctx.close(); continue }
  const opened = await w.page.locator('#inpEditPop #inpEditStart').waitFor({ timeout: 4000 }).then(() => true).catch(() => false)
  await sleep(300)
  const win = opened ? await readWin(w.page) : null
  const p1 = await pic(w, c, `${P}-1-window`, opened ? ['#inpEditPop'] : UNAV(di), win || 'no window opened', { noScroll: true })
  const before = await st(w.page)
  log(c, 'window: ' + J(win) + ' store: ' + J(before))
  let del = null, after = before, p2 = ''
  if (win) { del = await deleteInWin(w, c); await sleep(400); after = await st(w.page); p2 = await pic(w, c, `${P}-2-after-delete`, UNAV(di), { del, after }) }
  const winRanger = win && (J(win.people) === J(['bane']) || /Ranger/.test(win.personFixed || win.title || '')) && !(win.people || []).includes('rocky') && !/Hex/.test(win.title || '') && win.start === '09:00' && win.end === '10:00'
  const afterOk = after.length === 1 && /^LL Hex 08:00-10:00/.test(after[0])
  judge(c, cfg, winRanger && afterOk ? 'PASS' : 'FAIL', { press: pr, window: win, storeBeforeDelete: before, deleted: del, storeAfterDelete: after }, [p1, p2].filter(Boolean).join(', '))
  await w.ctx.close()
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)) } }

/* (b) Reject on a shared overseas duty */
for (const v of ['b-click', 'b-noblur', 'b-ctl']) { if (!ONLY.includes(v)) continue; const c = `B5-${v}`; try {
  const { w, di } = await fixture(c, { type: 'OD' }); const P = `b5-${v}-${SZ}-${ENG}`
  const w0 = await where(w.page, di)
  if (!w0.some(x => /^Ranger .* in \d+\.unav/.test(x)) || !w0.some(x => /^Hex .* in \d+\.unav/.test(x))) { judge(c, cfg, 'NOT WALKED', { why: 'the shared OD is not drawn as one row a man under Unavailable', drawn: w0 }); await w.ctx.close(); continue }
  const p0 = await pic(w, c, `${P}-0-filed`, UNAV(di), w0)
  await hold(w, c, di)
  if (v === 'b-ctl') { await w.page.mouse.click(3, 120); await sleep(800); await state(w, c, 'clicked away (row repainted)', di) }
  const before = await st(w.page)
  const pr = await pressBtn(w, c, di, 'reject', v === 'b-noblur' ? 'noblur' : 'click')
  if (!pr.pressed) { judge(c, cfg, 'NOT WALKED', { why: 'no Reject on Ranger\'s row', drawn: await where(w.page, di) }, p0); await w.ctx.close(); continue }
  const note = await catchToast(w.page, /./, 2500); if (note) await releaseToast(w.page)
  if (pr.caretAfter && pr.caretAfter !== 'BODY') { await w.page.mouse.click(3, 120); await sleep(800) }
  const after = await st(w.page); const drawn = await where(w.page, di)
  const p1 = await pic(w, c, `${P}-1-after-reject`, [`#eWeek .day[data-day="${di}"] .day-body`], { after, drawn, note })
  const rU = drawn.filter(x => /^Ranger .* in \d+\.unav/.test(x)), hU = drawn.filter(x => /^Hex .* in \d+\.unav/.test(x))
  const rStore = after.filter(x => / Ranger /.test(x) || /^OD Ranger /.test(x)), hStore = after.filter(x => /^OD Hex /.test(x) || / Hex /.test(x))
  const ok = rU.length === 0 && hU.length === 1 && after.some(x => /^OD Hex 08:00-10:00/.test(x)) && !after.some(x => /^OD Hex .*acc:x/.test(x))
  judge(c, cfg, ok ? 'PASS' : 'FAIL', { press: pr, storeBefore: before, storeAfter: after, drawnAfter: drawn, note }, `${p0}, ${p1}`)
  judge(c + ' note', cfg, 'RECORD', note || '(no note)', p1)
  await w.ctx.close()
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)) } }
await B.done()
