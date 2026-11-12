/* rcsb-w2-n6b v1 — W2 N6 control: the crew list's reason for Vandal (Monday's man) on Tuesday's armed empty front seat,
   Monday's landing blank vs typed, Tuesday take-off 01:00 / 03:00 / 04:00.
   usage: node scripts/handpass/rcsb/w2/rcsb-w2-n6b.mjs <pc|phone> <blank|l1300> */
const KIND = process.argv[2] || 'pc'
const CASE = process.argv[3] || 'blank'
const C = await import('./rcsb-w2-common.mjs')
C.setShots(`N6b-${CASE}-${KIND}`)
console.log('rcsb-w2-n6b v1', KIND, CASE, process.env.HP_SHOTS)
const Q = await C.load()
const { R, X, L, sleep } = Q
const j = C.j
const w = await R.world(KIND)
const { page } = w
const P = KIND === 'phone' ? 'p-' : 'd-'
const id = w.ID('Vandal'), MON = 0, TUE = 1
const out = { kind: KIND, case: CASE }
await L.board(page, MON)
const gm = await X.addWave(w, MON, '')
await X.typeIn(w, `[data-bfld="ff:${MON}.${gm}.0.to"]`, '12:00')
if (CASE.startsWith('l1300')) await X.typeIn(w, `[data-bfld="ff:${MON}.${gm}.0.ld"]`, '13:00')
if (CASE.endsWith('cs')) { await X.typeIn(w, `[data-bfld="ff:${MON}.${gm}.0.cs"]`, 'VL'); await X.typeIn(w, `[data-bfld="ff:${MON}.${gm}.0.msn"]`, 'BFM') }
await X.seatPhoneAware(w, `[data-slot="${MON}.${gm}.0.0.p"]`, id)
await L.closeBoard(page)
await L.board(page, TUE)
const gt = await X.addWave(w, TUE, '')
for (const to of ['01:00', '03:00', '04:00']) {
  await X.typeIn(w, `[data-bfld="ff:${TUE}.${gt}.0.to"]`, to)
  await X.ensureRoster(w)
  await X.press(w, `[data-slot="${TUE}.${gt}.0.0.p"]`); await sleep(500)
  const r = await page.evaluate(i => {
    const e = document.querySelector(`#sbRoster .rpuck[data-person="${i}"]`)
    const crew = [...document.querySelectorAll('#sbRoster .rpuck[data-why]')].filter(x => x.offsetWidth).map(x => (x.querySelector('.nm') || {}).innerText + ': ' + x.dataset.why).slice(0, 6)
    return { vandal: e ? { cls: e.className.replace(/\s+/g, ' '), why: e.dataset.why || '', title: e.title, text: e.innerText.replace(/\s+/g, ' ') } : null, others: crew }
  }, id)
  out['to' + to] = r
  console.log(CASE, 'Tuesday take-off', to, j(r))
  await R.shot(page, P + `01-roster-${to.replace(':', '')}`)
  const rp = page.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
  if (await rp.count()) { await rp.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250); await X.pic(page, P + `01-roster-${to.replace(':', '')}-vandal`, `#sbRoster .rpuck[data-person="${id}"]`, { pad: 120 }) }
  await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click()); await sleep(300)
  await X.closeRoster(w)
}
out.errors = w.errors
console.log('errors', j(w.errors))
const { writeFileSync } = await import('node:fs')
writeFileSync(process.env.HP_SHOTS + '/out.json', JSON.stringify(out, null, 1))
await w.browser.close()
