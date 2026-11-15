/* rcb2-w1 S14 — Insights: names and counts by type vs by day, every door, every way to close; CSV and print doors looked at.
   usage: node scripts/handpass/rcb2/rcb2-w1-s14.mjs [desktop|phone] */
const KIND = process.argv[2] || 'desktop'
process.env.RCB2_RUN = 's14-' + KIND + (process.env.RCB2_TAG || '')
const X = await import('./rcb2-w1-lib.mjs')
const { L, say, check, nrm, sleep, FRI } = X
const P = KIND === 'phone' ? 'p' : 'd'
const w = await X.world(KIND, 'a')
const page = w.page
const OLD = /(leave|downchit) \+ flying/i
const closes = []
const insText = () => page.evaluate(() => { const e = document.querySelector('#insightBody'); if (!e || e.getBoundingClientRect().width === 0) return null; return (e.innerText || '').replace(/\s+/g, ' ').trim() })
const isOpen = async () => (await page.locator('#insightBody:visible').count()) > 0
const closeWay = async (way, label) => {
  if (!(await isOpen())) return 'was not open'
  if (way === 'x') await X.press(w, '#insightClose', { scope: 'page' })
  else if (way === 'Escape') { await page.keyboard.press('Escape'); await sleep(400) }
  else if (way === 'outside') { await page.mouse.click(4, 4); await sleep(400) }
  const r = (await isOpen()) ? 'STILL OPEN' : 'closed'
  closes.push([label, way, r]); return r
}
const openVia = async (steps, name) => {
  for (const s of steps) await X.press(w, s, { scope: 'page' })
  await sleep(600)
  const t = await insText()
  if (t) await X.pic(w, name)
  return t
}

// a published day plus a working amendment: file Reaper downchit + Ranger leave, BRIEFING rows, publish Friday, then hide one in the working copy
await X.fileInput(w, { iso: '2026-07-17', type: 'LL', person: 'bane', remarks: 'rcb2 w1 s14 leave' })
await X.fileInput(w, { iso: '2026-07-17', type: 'ATT C', person: 'dice', remarks: 'rcb2 w1 s14 downchit' })
await X.board(w, FRI)
for (const [a, b] of [['09:00', '10:00'], ['09:00', '10:00']]) await X.ground(w, FRI, { prog: 'BRIEFING', str: a, end: b, who: null }).catch(() => {})
const bw0 = await X.boardWarn(w)
say('board lines:', JSON.stringify(bw0.lines.map(l => l.text.slice(0, 70))))
await X.closeBoard(w)

const doors = KIND === 'phone'
  ? [['edit-more', ['#editSchedMore', '#editSchedMoreInsights'], 'editsched'], ['view-more', ['#viewSchedMore', '#viewSchedMoreInsights'], 'viewsched']]
  : [['edit-btn', ['#insightBtn'], 'editsched'], ['view-btn', ['#insightBtn'], 'viewsched']]
let firstText = null
for (const [name, steps, pg] of doors) {
  await L.go(page, pg); await sleep(500)
  const exists = await page.locator(steps[0] + ':visible').count()
  if (!exists) { check(`S14 door ${name}`, 'NOT WALKED', 'door ' + steps[0] + ' not visible on ' + pg); continue }
  const t = await openVia(steps, `s14-${name}-${P}`)
  say(`Insights via ${name}:`, (t || 'NOT OPEN').slice(0, 600))
  check(`S14 door ${name} opens Insights`, !!t, (t || '').slice(0, 80))
  if (!t) continue
  if (!firstText) firstText = t
  check(`S14 ${name}: names use "planned", never "flying"`, !OLD.test(t), (t.match(/(on leave|downchit)[^.]{0,30}/gi) || []).join(' | '))
  for (const way of ['x', 'Escape', 'outside']) {
    const r = await closeWay(way, name)
    check(`S14 ${name}: closed by ${way}`, r === 'closed', r)
    if (way !== 'outside') await openVia(steps, `s14-${name}-reopen-${way}-${P}`)
  }
}
// by-type vs by-day figures (lesson 9): read the headline number, the card caption and the by-type rows
await L.go(page, 'editsched'); await sleep(500)
const open = await openVia(KIND === 'phone' ? ['#editSchedMore', '#editSchedMoreInsights'] : ['#insightBtn'], `s14-figures-${P}`)
if (open) {
  const parts = await page.evaluate(() => { const b = document.querySelector('#insightBody'); return [...b.querySelectorAll('*')].filter(e => e.children.length === 0 && e.getBoundingClientRect().width > 0).map(e => (e.textContent || '').trim()).filter(Boolean).slice(0, 140) })
  say('Insights drawn words and figures:', JSON.stringify(parts))
  const lines = parts.filter(t => /planned|^\d+$/.test(t))
  check('S14 figures: RECORDED the drawn words and figures (by type vs by day)', 'RECORDED', JSON.stringify(parts.slice(0, 80)))
  // CSV and print doors
  const exp = await page.evaluate(() => [...document.querySelectorAll('#insightBody button, #insightBody a, .win-bar button')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.textContent || e.getAttribute('aria-label') || '').trim()))
  say('Insights buttons:', JSON.stringify(exp))
  const dl = []
  page.on('download', d => dl.push(d))
  const csvBtn = page.locator('#insightBody button, .win-bar button').filter({ hasText: /csv|export|download/i }).first()
  if (await csvBtn.count()) {
    await Promise.race([csvBtn.click(), sleep(2000)]).catch(() => {}); await sleep(900)
    let recd = 'download event: ' + dl.length
    if (dl[0]) { const p = await dl[0].path().catch(() => null); if (p) { const fs = await import('node:fs'); const s = fs.readFileSync(p, 'utf8'); recd += ' ' + dl[0].suggestedFilename() + ' ' + s.length + ' chars; mentions warning words: ' + /warning|planned|leave/i.test(s) + '; head: ' + s.slice(0, 200).replace(/\s+/g, ' ') } }
    check('S14 CSV door: RECORDED what it exports', 'RECORDED', recd)
  } else check('S14 CSV door', 'NOT WALKED', 'no CSV/export button in Insights; buttons ' + JSON.stringify(exp))
  const prBtn = page.locator('#insightBody button, .win-bar button').filter({ hasText: /print/i }).first()
  check('S14 print door: RECORDED whether Insights offers one', 'RECORDED', (await prBtn.count()) ? 'a Print button is offered (looked at, not pressed)' : 'no Print button inside Insights')
  for (const way of ['Escape']) { const r = await closeWay(way, 'figures'); check('S14 figures window closed by Escape', r === 'closed', r) }
}
say('window closes:', JSON.stringify(closes))
say('errors', JSON.stringify(w.errors))
check('S14 no console/page errors', w.errors.length === 0, w.errors.slice(0, 3).join(' | '))
await X.finishWorld(w)
X.W.summary()
