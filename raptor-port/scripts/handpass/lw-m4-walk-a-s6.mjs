// Walker A, route 3: scenarios 6 (stale), 7 (the dates tap, slim bar, Back, X), 8 (the paperclip viewer), 14 (+N pending in the next period). Desktop, admin.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/s6'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, bidBatch, pressLoc, lineLoc, lineInfo, approveBtn, refuseBtn, datesBtn, shotLine } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-walk-a-s6 v1]')
L.clearOut()
const pdf = L.pdfPath('m4-a-form.pdf')
const w = await L.newCtx('desk')
const P = w.page
const size = 'desk'
const allBtn = P.locator(T('appr-approve-all'))
const allState = async () => ({ text: (await allBtn.innerText()).trim(), armed: ((await allBtn.getAttribute('class')) || '').includes('armed') })
const ringOn = () => P.evaluate(() => !!document.querySelector('td.lw-ring'))
const tabLit = () => P.evaluate(() => { const e = document.querySelector('[data-testid="lw-tab-approvals"]'); return { cls: e.className, sel: e.getAttribute('aria-selected') || e.getAttribute('aria-pressed') } })
const snapshotList = () => P.evaluate(() => ({
  lines: [...document.querySelectorAll('.appr-line')].map(e => `${e.querySelector('.appr-dlink')?.innerText}|${(e.className.match(/lit-(\w+)/) || [])[1] || 'pending'}|dot:${e.querySelector('.appr-dot')?.className.replace('appr-dot', '').trim() || '-'}`),
  filters: [...document.querySelectorAll('.appr-f')].filter(e => e.getAttribute('aria-pressed') === 'true').map(e => e.innerText.trim()),
  sub: document.querySelector('[data-testid="appr-sub"]')?.innerText, all: document.querySelector('[data-testid="appr-approve-all"]')?.innerText, y: Math.round(scrollY)
}))
try {
  await L.signIn(w, 'member')
  await bidBatch(w, 'bane', [{ iso: '2026-01-12', pdf }, { iso: '2026-01-14' }, { iso: '2026-01-20' }, { iso: '2026-02-16' }])
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  const sub0 = await txt(P, T('appr-sub'))
  console.log('start', sub0, 'tab', await L.tabCount(P))
  /* ===== 7: the dates tap ===== */
  /* a state to come back to: Jan chip, one line lit, dots on the rest */
  await pressLoc(w, P.locator(T('appr-m-2026-01'))); await P.waitForTimeout(300)
  await pressLoc(w, approveBtn(P, 'Wed 14 Jan')); await P.waitForTimeout(400)
  const left = await snapshotList()
  console.log('left as', JSON.stringify(left))
  const hdrBefore = (await txt(P, T('appr-sub')))
  await shot(w, 'a-s6-7-before-dates-tap')
  await pressLoc(w, datesBtn(P, 'Mon 12 Jan'))
  const t0 = Date.now()
  await P.waitForTimeout(350)
  await shot(w, 'a-s6-7-grid-ring-350ms')
  const slim = await txt(P, T('appr-slim'))
  const ringInfo = await P.evaluate(() => {
    const r = document.querySelector('td.lw-ring'); if (!r) return null
    const b = r.getBoundingClientRect(); const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const top = document.elementFromPoint(cx, cy)
    const slimB = document.querySelector('[data-testid="appr-slim"]').getBoundingClientRect()
    return { id: r.dataset.testid, x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), onTop: top === r || r.contains(top) || (top && top.closest && top.closest('td') === r), slimTop: Math.round(slimB.top), vh: innerHeight, vw: innerWidth }
  })
  const gridUp = await vis(P, T('lw-tab-grid')) && !(await vis(P, T('approvals-page')))
  console.log('slim', slim, 'ring', JSON.stringify(ringInfo), 'grid up', gridUp)
  /* the ring's length: poll until gone */
  let gone = null
  for (let i = 0; i < 60; i++) { if (!(await ringOn())) { gone = Date.now() - t0; break }; await P.waitForTimeout(200) }
  console.log('ring gone after ms', gone)
  await shot(w, 'a-s6-7-grid-ring-gone')
  const nSlim = (slim || '').match(/(\d+) pending/)
  const nHdr = (hdrBefore || '').match(/(\d+) pending/)
  rec('7a dates tap: the grid at that day, the cell ringed, the slim bar up', size, gridUp && ringInfo && ringInfo.id === 'cell-bane-2026-01-12' && ringInfo.onTop && /Approvals/.test(slim || '') && ringInfo.y + ringInfo.h < ringInfo.slimTop ? 'PASS' : 'FAIL', `grid up ${gridUp}; ring ${JSON.stringify(ringInfo)}; slim "${slim}"`, ['a-s6-7-grid-ring-350ms'])
  rec('7b the ring lasts about six seconds', size, gone && gone > 4500 && gone < 8500 ? 'PASS' : 'FAIL', `the ring was gone ${gone} ms after the tap (polled every 200 ms)`, ['a-s6-7-grid-ring-350ms', 'a-s6-7-grid-ring-gone'])
  rec('7c slim bar count equals the page header count', size, nSlim && nHdr && nSlim[1] === nHdr[1] ? 'PASS' : 'FAIL', `slim "${slim}" against the header just before "${hdrBefore}" (after one line approved)`, ['a-s6-7-before-dates-tap', 'a-s6-7-grid-ring-350ms'])
  await press(w, T('appr-back')); await P.waitForTimeout(700)
  const back = await snapshotList()
  console.log('came back as', JSON.stringify(back))
  await shot(w, 'a-s6-7-after-back')
  rec('7d Back opens the list exactly as left', size, JSON.stringify({ ...left, y: 0 }) === JSON.stringify({ ...back, y: 0 }) ? 'PASS' : 'FAIL', `left: ${JSON.stringify(left)}; back: ${JSON.stringify(back)}`, ['a-s6-7-before-dates-tap', 'a-s6-7-after-back'])
  /* the X */
  await pressLoc(w, datesBtn(P, 'Wed 14 Jan')); await P.waitForTimeout(500)
  await shot(w, 'a-s6-7-slim-bar')
  await press(w, T('appr-slim-x')); await P.waitForTimeout(600)
  const tl = await tabLit()
  const slimGone = !(await vis(P, T('appr-slim')))
  const apprGone = !(await vis(P, T('approvals-page')))
  await shot(w, 'a-s6-7-after-x')
  rec('7e X leaves Approvals (the tab no longer lit, no slim bar)', size, slimGone && apprGone && !/\b(on|active|sel)\b/.test(tl.cls) && tl.sel !== 'true' ? 'PASS' : 'FAIL', `slim gone ${slimGone}, Approvals page gone ${apprGone}, tab ${JSON.stringify(tl)}`, ['a-s6-7-after-x'])
  /* ===== 6: stale ===== */
  await L.openApprovals(w); await P.waitForTimeout(500)
  await pressLoc(w, P.locator(T('appr-all'))); await P.waitForTimeout(300)
  await pressLoc(w, allBtn); await P.waitForTimeout(400)
  const armed = await allState()
  console.log('armed', JSON.stringify(armed), 'lines', (await snapshotList()).lines.length)
  await pressLoc(w, datesBtn(P, 'Mon 12 Jan')); await P.waitForTimeout(500)
  await L.openCell(w, 'bane', '2026-01-12')
  await shot(w, 'a-s6-6-bidwin-for-delete')
  await press(w, T('bid-clear')); await P.waitForTimeout(700)
  /* a delete may ask "sure?" */
  if (await vis(P, T('bid-picker'))) { await press(w, T('bid-clear')); await P.waitForTimeout(700) }
  const winOpen = await vis(P, T('bid-picker'))
  await shot(w, 'a-s6-6-after-delete-on-grid')
  await press(w, T('appr-back')); await P.waitForTimeout(700)
  const afterDel = await allState()
  const staleLine = await lineInfo(P, 'Mon 12 Jan').catch(() => null)
  const staleText = await P.evaluate(() => { const l = [...document.querySelectorAll('.appr-line')].find(e => e.classList.contains('stale') || /No longer there/.test(e.innerText)); return l ? l.innerText.replace(/\s+/g, ' ') : null })
  const staleBtns = await P.evaluate(() => { const l = [...document.querySelectorAll('.appr-line')].find(e => /No longer there/.test(e.innerText)); return l ? [...l.querySelectorAll('.appr-ok, .appr-no')].map(b => `${b.innerText}:${b.disabled}`) : null })
  await shot(w, 'a-s6-6-after-back-deleted')
  await shotLine(w, 'a-s6-13-stale-gone', 'Mon 12 Jan').catch(() => {})
  rec('6a bid deleted on the grid: Back -> Approve all disarmed and recounted, the line says "No longer there", buttons off', size, !afterDel.armed && /No longer there/.test(staleText || '') && staleBtns && staleBtns.every(b => /true$/.test(b)) ? 'PASS' : 'FAIL', `before: ${JSON.stringify(armed)}; after Back: ${JSON.stringify(afterDel)}; line "${staleText}"; buttons ${JSON.stringify(staleBtns)}; delete window still open: ${winOpen}`, ['a-s6-6-after-delete-on-grid', 'a-s6-6-after-back-deleted', 'a-s6-13-stale-gone'])
  /* the same with Refuse on the grid */
  await pressLoc(w, datesBtn(P, 'Tue 20 Jan')); await P.waitForTimeout(500)
  await L.openCell(w, 'bane', '2026-01-20')
  await press(w, T('decide-refuse')); await P.waitForTimeout(700)
  await shot(w, 'a-s6-6-after-refuse-on-grid')
  if (await vis(P, T('bid-picker'))) await L.closeWin(w)
  await press(w, T('appr-back')); await P.waitForTimeout(700)
  const staleText2 = await P.evaluate(() => { const l = [...document.querySelectorAll('.appr-line')].find(e => /Already refused/.test(e.innerText)); return l ? l.innerText.replace(/\s+/g, ' ') : null })
  const staleBtns2 = await P.evaluate(() => { const l = [...document.querySelectorAll('.appr-line')].find(e => /Already refused/.test(e.innerText)); return l ? [...l.querySelectorAll('.appr-ok, .appr-no')].map(b => `${b.innerText}:${b.disabled}`) : null })
  await shot(w, 'a-s6-6-after-back-refused')
  await shotLine(w, 'a-s6-13-stale-refused', 'Tue 20 Jan').catch(() => {})
  rec('6b refused on the grid: Back -> "Already refused by Saber", buttons off', size, /Already refused by Saber/.test(staleText2 || '') && staleBtns2 && staleBtns2.every(b => /true$/.test(b)) ? 'PASS' : 'FAIL', `line "${staleText2}"; buttons ${JSON.stringify(staleBtns2)}`, ['a-s6-6-after-refuse-on-grid', 'a-s6-6-after-back-refused', 'a-s6-13-stale-refused'])
  await press(w, T('appr-slim-x')).catch(() => {})
  await P.waitForTimeout(300)
  /* ===== 8: the paperclip viewer: Ranger 12 Jan was deleted, so place a fresh one with a document ===== */
  if (await vis(P, T('approvals-page')) === false) await L.openApprovals(w)
} catch (e) {
  rec('ERROR', size, 'FAIL', String(e).slice(0, 500))
  await shot(w, 'a-s6-error').catch(() => {})
}
console.log('errs', JSON.stringify(w.errs))
L.writeResults('s6')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
