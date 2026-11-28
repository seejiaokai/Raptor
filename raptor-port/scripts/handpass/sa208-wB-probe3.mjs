// sa208-wB-probe3 — walker B's look at the doors before the walk (read and pictured, nothing judged): the SC wave's
// shape, the board's SANS "+ Add" and Unavailable "+ Add", a SANS card's edit, the Inputs list, the Logic page's flag row,
// the Legend. Run from raptor-port/:  SZ=d|p SA208B_RUN=probe node scripts/handpass/sa208-wB-probe3.mjs
import './sa208-wB-env.mjs'
const B = await import('./scc-w1B-lib.mjs')
const { Z, T, L, W5, J, sleep, OUT, clean } = B
const SZ = process.env.SZ || 'd'
console.log('VERSION sa208-wB-probe3 1 · size', SZ)
const formRead = p => p.evaluate(() => {
  const t = x => (x ? x.textContent || '' : '').replace(/\s+/g, ' ').trim()
  const s = document.querySelector('#inpEditSans')
  const w = document.querySelector('[data-testid="win-inputedit"]') || document.querySelector('#inpEditPop')
  return { labels: s ? [...s.querySelectorAll('label')].map(e => t(e) + (e.querySelector('input').checked ? '☑' : '☐')) : 'NO SANS BOXES', type: (document.querySelector('#inpEditType') || {}).value, person: (document.querySelector('#inpEditPerson') || {}).value, title: w ? t(w.querySelector('h3, .wtitle, .win-title, header')) : 'NO WINDOW' }
})
async function closeForm(p, W) {
  const x = p.locator('[data-testid="win-inputedit-x"]:visible, #inpEditCancel:visible').first(); if (await x.count()) await W.press(p, x, 'x')
  const g = p.locator('[data-testid="inped-escask-go"]:visible').first(); if (await g.count()) await W.press(p, g, 'discard')
  await sleep(300)
}
await T.run('probe3', SZ, Z.scene(async (p, W) => {
  /* the SC wave */
  await L.openBoard(p, W, 4)
  await W.press(p, L.B('[data-wvadd="4"]'), 'wvadd')
  const menu = await p.evaluate(() => [...document.querySelectorAll('.wm[data-wmkind]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.wmkind + ':' + e.textContent.trim()))
  W.rec('menu', '+ Wave menu', 'REC', J(menu))
  const sc = p.locator('.wm.sa[data-wmkind="sc"]:visible').first()
  if (await sc.count()) { await W.press(p, sc, 'sc'); await sleep(700) }
  const wv = await p.evaluate(() => { const w = window.DAYS[4].waves; const x = w[w.length - 1]; return { n: w.length, kind: x.kind, sa: x.sa, json: JSON.stringify(x).slice(0, 700) } })
  W.rec('sc', 'the SC wave made', 'REC', J(wv), await W.pic(p, 'sc-wave'))
  const flds = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="ff:4."], #schedBoard [data-bfld^="sa:4."]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.bfld + '=' + e.value).slice(0, 30))
  W.rec('scf', 'its boxes', 'REC', J(flds))
  const slots = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot^="4."]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.slot))
  W.rec('scs', 'its seats', 'REC', J(slots))
  /* the board's SANS "+ Add" */
  const sa = p.locator(L.B('[data-inpadd="4.s"]')).first()
  W.rec('sadd', 'board SANS + Add drawn', 'REC', String(await sa.count()))
  if (await sa.count()) { await W.press(p, sa, 'sans-add'); await sleep(700); W.rec('sform', 'its form', 'REC', J(await formRead(p)), await W.pic(p, 'sans-add-form')); await closeForm(p, W) }
  const ua = p.locator(L.B('[data-inpadd="4.u"]')).first()
  if (await ua.count()) { await W.press(p, ua, 'unav-add'); await sleep(700); const tps = await p.locator('#inpEditType option').evaluateAll(os => os.map(o => o.value)).catch(() => []); W.rec('uform', 'Unavailable + Add form', 'REC', J(await formRead(p)) + ' types ' + J(tps), await W.pic(p, 'unav-add-form')); await closeForm(p, W) }
  /* SANS cards on the board of Wed (Scribe, Zenith, Kraken filed) */
  await L.openBoard(p, W, 2)
  const cards = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sanscard')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.inpedit || '-') + ':' + e.textContent.replace(/\s+/g, ' ').trim()))
  W.rec('bcards', "the board's SANS cards on Wed", 'REC', J(cards), await W.pic(p, 'board-wed'))
  const c1 = p.locator('#schedBoard .sanscard[data-inpedit]:visible').first()
  if (await c1.count()) { await W.press(p, c1, 'sanscard'); await sleep(700); W.rec('cform', 'a SANS card pressed on the board', 'REC', J(await formRead(p)), await W.pic(p, 'board-card-form')); await closeForm(p, W) }
  await L.closeBoard(p, W)
  await L.go(p, 'editsched')
  const wc = p.locator('#eWeek .day[data-day="2"] .sanscard[data-inpedit]:visible').first()
  W.rec('wcards', 'week SANS cards on Wed', 'REC', String(await p.locator('#eWeek .day[data-day="2"] .sanscard').count()))
  if (await wc.count()) { await wc.scrollIntoViewIfNeeded(); await W.press(p, wc, 'wsanscard'); await sleep(700); W.rec('wform', 'a SANS card pressed on the week', 'REC', J(await formRead(p)), await W.pic(p, 'week-card-form')); await closeForm(p, W) }
  /* the Inputs page's list */
  await L.go(p, 'inputs')
  const tabs = await p.evaluate(() => [...document.querySelectorAll('#page-inputs button, #page-inputs [role="tab"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.testid || e.id || '') + ':' + e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 40))
  W.rec('itabs', 'Inputs page controls', 'REC', J(tabs), await W.pic(p, 'inputs'))
  /* the Logic page */
  await L.go(p, 'logic')
  const lg = await p.evaluate(() => [...document.querySelectorAll('.lgc')].map(e => ({ t: e.textContent.replace(/\s+/g, ' ').trim(), w: e.getBoundingClientRect().width })).filter(x => /^A/.test(x.t)))
  W.rec('logic', 'the Logic page flag row (A)', 'REC', J(lg), await W.pic(p, 'logic'))
  /* the Legend */
  await L.go(p, 'editsched')
  const lgn = await p.evaluate(() => [...document.querySelectorAll('summary.legend-sum')].map(e => e.getBoundingClientRect().width + ':' + e.textContent.trim()))
  W.rec('legend', 'legend summaries', 'REC', J(lgn))
}))
console.log('DONE')
process.exit(0)
