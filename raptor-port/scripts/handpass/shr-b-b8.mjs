// Walker b — B8 (Astra S18, F-S13 OIL): a shared WEEKEND overseas duty (Ranger + Hex, Sat 18 Jul, 08:00–17:00) filed on
// the Inputs page with its OIL question answered Yes; then Ranger's row on the week: start 0900 Tab, end 1600 Tab.
// EXPECTED: no OIL question opens on his row's changes (D739 reading 4); Hex's figure unchanged. RECORD the figures.
console.log('shr-b-b8 v1')
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', cfg = `${SZ} ${ENG}`
const B = await (await import('./shr-b-lib.mjs')).setup(`b8-${SZ}-${ENG}`)
const { start, fileInput, go, sleep, log, weekRows, weekCell, typeIn, pic, J, judge, showDay, caret, store } = B
const c = 'B8', P = `b8-${SZ}-${ENG}`
const SAT = '2026-07-18'
let w
const out = {}
const oilOpen = () => w.page.evaluate(() => { const e = document.querySelector('[data-testid="oilconf"]'); return !!(e && e.getBoundingClientRect().width > 1) })
/* the OIL figures: the Leave War row heads of the two men (whatever the row's first cell shows), and each input's OIL answer */
async function figures(tag) {
  const r = {}
  r.answers = await w.page.evaluate(() => window.INPUTS.filter(x => x.date === 'Jul 18' && (x.people || []).some(p => p.p === 'bane' || p.p === 'rocky')).map(x => ({ iid: x.iid, people: (x.people || []).map(p => p.p + (p.oil != null ? ':oil=' + JSON.stringify(p.oil) : '')).join('+'), oil: x.oil, oilAns: x.oilAns, earn: x.earn, s: x.s, e: x.e })).map(o => JSON.stringify(o)))
  await go(w.page, 'leavewar'); await sleep(1200)
  const mon = w.page.locator('[data-testid="month-Jul"]').first(); if (await mon.count()) { await mon.click(); await sleep(1200) }
  r.lw = await w.page.evaluate(() => Object.fromEntries(['bane', 'rocky'].map(p => { const td = document.querySelector(`[data-testid="cell-${p}-2026-07-18"]`); const tr = td && td.closest('tr'); const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : null; return [p === 'bane' ? 'Ranger' : 'Hex', { cell: t(td), rowHead: tr ? t(tr.children[0]) : null, rowHead2: tr ? t(tr.children[1]) : null }] })))
  await w.page.evaluate(() => document.querySelector('[data-testid="cell-bane-2026-07-18"]')?.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  r.pic = await pic(w, c, `${P}-${tag}-leavewar`, ['[data-testid="cell-bane-2026-07-18"]', '[data-testid="cell-rocky-2026-07-18"]'], r.lw, { noScroll: true })
  log(c, `${tag} figures ${J(r)}`)
  return r
}
const J2 = JSON.stringify
try {
  w = await start(SZ, ENG)
  const iid = await fileInput(w, c, SAT, { type: 'OD', people: [B.RANGER, B.HEX], from: '08:00', to: '17:00' })
  if (!iid) throw new Error('OD not filed')
  out.filed = await store(w.page, 'Jul 18')
  out.before = await figures('1-before')
  await go(w.page, 'editsched'); await sleep(600)
  const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 18')); await showDay(w.page, di)
  out.rows0 = (await weekRows(w.page, di)).filter(r => /^(Ranger|Hex) /.test(r))
  if (out.rows0.length !== 2) throw new Error('the shared OD is not one row a man on Saturday: ' + J(out.rows0))
  out.steps = []
  for (const [f, v] of [['str', '0900'], ['end', '1600']]) {
    await typeIn(w, await weekCell(w.page, di, 'bane', f), v); await w.page.keyboard.press('Tab'); await sleep(900)
    const s = { step: `${f} ${v} Tab`, oilQuestionOpen: await oilOpen(), store: await store(w.page, 'Jul 18'), screen: (await weekRows(w.page, di)).filter(r => /^(Ranger|Hex) /.test(r)), caret: await caret(w.page) }
    out.steps.push(s); log(c, J(s))
    out[`pic${f}`] = await pic(w, c, `${P}-2-${f}`, s.oilQuestionOpen ? ['[data-testid="oilconf"]'] : [`#eWeek .day[data-day="${di}"] .sec-unav`], s, { noScroll: true })
    if (s.oilQuestionOpen) { await w.page.locator('[data-testid="oilconf-cancel"]').click().catch(() => {}); await sleep(400) }
  }
  await w.page.mouse.click(3, 120); await sleep(700)
  out.left = await store(w.page, 'Jul 18')
  out.after = await figures('3-after')
  const noQ = out.steps.every(s => !s.oilQuestionOpen)
  const hexSame = J(out.before.lw.Hex) === J(out.after.lw.Hex)
  const ranger = out.left.filter(x => /^OD Ranger 09:00-16:00/.test(x)).length === 1 && out.left.filter(x => /^OD Hex 08:00-17:00/.test(x)).length === 1
  judge(c, cfg, noQ && hexSame && ranger ? 'PASS' : 'FAIL', { noOilQuestion: noQ, hexFigureSame: hexSame, store: out.left, hexBefore: out.before.lw.Hex, hexAfter: out.after.lw.Hex }, [out.picstr, out.picend, out.before.pic, out.after.pic].join(', '))
  judge(c + ' figures', cfg, 'RECORD', { filed: out.filed, before: out.before, after: out.after, steps: out.steps.map(s => ({ step: s.step, q: s.oilQuestionOpen, store: s.store })) }, [out.before.pic, out.after.pic].join(', '))
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 400) + ' :: ' + J2(out).slice(0, 600)) }
try { await w?.ctx.close() } catch {}
await B.done()
