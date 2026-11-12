/* rcsb-w2-n5e v1 — W2 N5 last case: Sunday 19 Jul take-off 18:00, landing blank; the same man early on Monday 20 Jul (next week).
   usage: node scripts/handpass/rcsb/w2/rcsb-w2-n5e.mjs [pc|phone] */
const KIND = process.argv[2] || 'pc'
const C = await import('./rcsb-w2-common.mjs')
C.setShots(`N5e-${KIND}`)
console.log('rcsb-w2-n5e v1', KIND, process.env.HP_SHOTS)
const Q = await C.load()
const { R, X, L, sleep } = Q
const j = C.j
const w = await R.world(KIND)
const { page } = w
const P = KIND === 'phone' ? 'p-' : 'd-'
const id = w.ID('Vandal'), SUN = 6
const out = { kind: KIND }
await L.board(page, SUN)
const g = await X.addWave(w, SUN, '')
await X.typeIn(w, `[data-bfld="ff:${SUN}.${g}.0.to"]`, '18:00')
out.seat = await X.seatPhoneAware(w, `[data-slot="${SUN}.${g}.0.0.p"]`, id)
out.sunFormation = await page.evaluate(([d, gi]) => { const f = window.DAYS[d].waves[gi].formations[0]; return { to: f.to, ld: f.ld, p: f.aircraft[0].p } }, [SUN, g])
console.log('Sunday line', j(out.sunFormation), out.seat)
await R.shot(page, P + '01-sunday-board')
await L.closeBoard(page)
// load the next week by the week buttons
await L.go(page, 'editsched'); await sleep(600)
const btns = await page.evaluate(() => [...document.querySelectorAll('button, [role=button], a')].filter(e => e.offsetWidth && /^Jul \d\d$/.test((e.innerText || '').trim())).map(e => ({ t: e.innerText.trim(), id: e.id, cls: String(e.className).slice(0, 40), dw: e.dataset.week || e.dataset.wk || '' })))
console.log('week buttons', j(btns))
await R.shot(page, P + '02-week-buttons')
const nx = page.locator('button:visible, [role=button]:visible').filter({ hasText: /^Jul 20$/ }).first()
if (!(await nx.count())) { out.noNextWeek = true; console.log('NO Jul 20 button'); }
else {
  await C.hit(w, nx); await sleep(1200)
  out.week = await page.evaluate(() => ({ dt0: window.DAYS[0].dt, dow: window.DAYS[0].dow, waves: window.DAYS.map(d => d.waves.length) }))
  console.log('next week', j(out.week))
  await R.shot(page, P + '03-next-week')
  await L.board(page, 0)
  const g2 = await X.addWave(w, 0, '')
  await X.typeIn(w, `[data-bfld="ff:0.${g2}.0.to"]`, '04:00')
  out.seat2 = await X.seatPhoneAware(w, `[data-slot="0.${g2}.0.0.p"]`, id)
  const bw = await X.boardWarn(page, w)
  out.board = bw.items.filter(t => t.includes('Vandal'))
  console.log('next Monday board', j(out.board), out.seat2)
  await R.shot(page, P + '04-next-monday-board')
  const sel = KIND === 'phone' ? '#schedBoard #sbWarn' : '#schedBoard .sb-warn'
  if (await page.locator(sel + ':visible').count()) await X.pic(page, P + '04-next-monday-board-issues', sel, { pad: 6 })
  await L.closeBoard(page)
  await L.go(page, 'editsched'); await sleep(700)
  const s = await X.stripItems(page, '#eWeek', 0)
  out.edit = s.items.filter(t => t.includes('Vandal'))
  console.log('next Monday edit strip', j(out.edit))
  await X.pic(page, P + '05-next-monday-edit-strip', '#eWeek [data-dwbox="0"]', { pad: 8 })
  // also at 05:00 in case 04:00 shows nothing
  if (!out.edit.some(t => /rest/i.test(t))) {
    await L.board(page, 0)
    await X.typeIn(w, `[data-bfld="ff:0.${g2}.0.to"]`, '02:00')
    out.board02 = (await X.boardWarn(page, w)).items.filter(t => t.includes('Vandal'))
    console.log('next Monday at 02:00', j(out.board02))
    await R.shot(page, P + '06-next-monday-0200-board')
    await L.closeBoard(page)
  }
}
out.errors = w.errors
console.log('errors', j(w.errors))
const { writeFileSync } = await import('node:fs')
writeFileSync(process.env.HP_SHOTS + '/out.json', JSON.stringify(out, null, 1))
await w.browser.close()
