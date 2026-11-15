/* rcb2-w1 S01 + S05 — day details follows the document on screen; published names, current and older eyes, as Ranger.
   Friday (4): Ranger on LL + BRIEFING, Reaper on ATT C + BRIEFING; Saturday flight 12:00 (landing blank) and Sunday flight 04:30-05:30
   for Hunter (a crew-rest breach). All three days published (ORIG); Friday amended (Reaper's row removed) and published as AL1;
   then a further working change (Ranger off the BRIEFING row), unpublished.
   usage: node scripts/handpass/rcb2/rcb2-w1-s01.mjs [desktop|phone] */
const KIND = process.argv[2] || 'desktop'
process.env.RCB2_RUN = 's01-' + KIND + (process.env.RCB2_TAG || '')
const X = await import('./rcb2-w1-lib.mjs')
const { L, say, check, nrm, sleep, FRI, SAT } = X
const SUN = 6
const P = KIND === 'phone' ? 'p' : 'd'
const w = await X.world(KIND, 'a')
const page = w.page
const OLD = /(leave|downchit) \+ flying/i
const RANGER = 'bane', DOWN = 'dice', HUNT = 'prowler'
const step = async (id, fn) => { try { return await fn() } catch (e) { check(id, 'NOT WALKED', 'script stopped: ' + String(e.message).split('\n')[0].slice(0, 200)); await X.pic(w, `${id}-stopped-${P}`).catch(() => {}); return null } }
const CLOSE = ['Close', 'x', 'Escape', 'outside']; let closeN = 0
const closeDD = async (tag) => { const how = CLOSE[closeN++ % 4]; const r = await X.closeDayDetails(w, how); say(`day details (${tag}) closed by ${how}: ${r}`); return [how, r] }
const closes = []

/* ---------- fixture ---------- */
await step('S01.0 fixture', async () => {
  await X.fileInput(w, { iso: '2026-07-17', type: 'LL', person: RANGER, remarks: 'rcb2 w1 s01 leave' })
  await X.fileInput(w, { iso: '2026-07-17', type: 'ATT C', person: DOWN, remarks: 'rcb2 w1 s01 downchit' })
  await X.board(w, FRI)
  await X.ground(w, FRI, { prog: 'BRIEFING', str: '09:00', end: '10:00', who: RANGER })
  await X.ground(w, FRI, { prog: 'BRIEFING', str: '09:00', end: '10:00', who: DOWN })
  const sp = await X.signAndPublish(w, FRI)
  say('Friday ORIG publish', JSON.stringify(sp))
  await X.board(w, SAT)
  const a = await X.sortie(w, SAT, { to: '12:00', ld: '', who: HUNT })
  const sa = await X.signAndPublish(w, SAT)
  await X.board(w, SUN)
  const b = await X.sortie(w, SUN, { to: '04:30', ld: '05:30', who: HUNT })
  const wl = await X.boardWarn(w)
  say('Sunday board lines:', JSON.stringify(wl.lines.map(l => l.text)))
  const sb = await X.signAndPublish(w, SUN)
  say('Sat/Sun publish', JSON.stringify(sa.pressed), JSON.stringify(sb.pressed), JSON.stringify(a), JSON.stringify(b))
  // the amendment: Reaper's BRIEFING row removed, AL1 published
  await X.board(w, FRI)
  const gi = await page.evaluate(() => window.DAYS[4].ground.map((g, i) => [i, g.prog, JSON.stringify(g.who)]).filter(x => x[1] === 'BRIEFING' && /dice/.test(x[2])).map(x => x[0])[0])
  await X.press(w, `[data-grdel="${FRI}.${gi}"]`)
  const al = await X.signAndPublish(w, FRI)
  say('Friday AL1 publish', JSON.stringify(al), JSON.stringify(await X.head(w, FRI)))
  // a further working change: Ranger off the BRIEFING row (unpublished)
  const gj = await page.evaluate(() => window.DAYS[4].ground.map((g, i) => [i, g.prog, JSON.stringify(g.who)]).filter(x => x[1] === 'BRIEFING' && /bane/.test(x[2])).map(x => x[0])[0])
  await X.press(w, `[data-grdel="${FRI}.${gj}"]`)
  say('Friday working change made; head', JSON.stringify(await X.head(w, FRI)))
  await X.pic(w, `s01-0-fixture-board-${P}`)
  check('S01.0 fixture built: Friday ORIG + AL1 published, a working change pending; Sat/Sun published', sp.pressed && sa.pressed && sb.pressed && al.pressed, `${sp.pressed} ${sa.pressed} ${sb.pressed} ${al.pressed}`)
  await X.closeBoard(w)
})

const ddRead = async (tag, opts) => { const d = await X.dayDetails(w, FRI, opts); if (!d.error) closes.push(await closeDD(tag)); return d }
const names = d => (d.items || []).map(t => t)
const crUnder = (txt) => /took off 12:00 with no landing typed/.test(txt)

/* ---------- Edit Schedule: the working copy ---------- */
await step('S01.1', async () => {
  await L.go(page, 'editsched'); await sleep(500)
  const ew = await X.weekWarn(w, '#eWeek', FRI)
  say('EDIT week Friday strip:', ew.head, JSON.stringify(ew.items.map(i => i.text)))
  await X.crop(w, '#eWeek [data-dwbox="4"]', `s01-1a-edit-strip-${P}`).catch(() => {})
  const d = await ddRead('edit', { root: '#eWeek', name: `s01-1b-daydetails-edit-${P}` })
  say('DD edit:', JSON.stringify(d).slice(0, 600))
  check("S01.1 Edit Schedule (working copy: Ranger off the row, Reaper gone): strip says one row goes away once signed; day details reads clean - RECORDED, names carry no old word", !d.error && !OLD.test(d.text) ? "RECORDED" : false, `strip ${JSON.stringify(ew.items.map(i => i.text.slice(0, 55)))} | dd ${(d.text || d.error).slice(-150)}`)
})
/* ---------- View-only: the current published eye ---------- */
let vOptions = []
await step('S01.2', async () => {
  await L.go(page, 'viewsched'); await sleep(600)
  vOptions = await page.evaluate(() => [...document.querySelectorAll('#vWeek select[data-dver="4"] option, #vWeek select[data-vwork="4"] option')].map(o => o.value + '=' + o.text))
  say('View-only Friday version picker:', JSON.stringify(vOptions))
  const vw = await X.weekWarn(w, '#vWeek', FRI)
  say('VIEW-ONLY Friday strip (current published AL1):', vw.head, JSON.stringify(vw.items.map(i => i.text)))
  await X.crop(w, '#vWeek .day[data-day="4"]', `s01-2a-view-current-${P}`).catch(() => {})
  const d = await ddRead('view current', { root: '#vWeek', name: `s01-2b-daydetails-view-current-${P}` })
  say('DD view current:', JSON.stringify(d).slice(0, 700))
  const ranger = vw.items.some(i => i.text.includes('Ranger') && /On leave \+ planned/.test(i.text))
  const reaper = vw.items.some(i => i.text.includes('Reaper'))
  check('S01.2a View-only, current published version (AL1): shows Ranger\'s "On leave + planned", not Reaper', ranger && !reaper && !OLD.test(vw.head + vw.items.map(i => i.text).join('')), JSON.stringify(vw.items.map(i => i.text.slice(0, 50))))
  check('S01.2b day details beside the published face matches it (Ranger yes, Reaper no, names "planned")', !d.error && d.text.includes('Ranger') && !d.text.includes('Reaper') && /On leave \+ planned/.test(d.text) && !OLD.test(d.text), (d.text || d.error).slice(0, 350))
})
/* ---------- the working-draft eye on View-only (admin), then the older eye (ORIG) from Edit Schedule's plans menu ---------- */
await step('S01.3', async () => {
  const sel = page.locator('#vWeek select[data-dver="4"]:visible, #vWeek select[data-vwork="4"]:visible').first()
  await sel.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await sel.selectOption('working'); await sleep(700)
  await X.pic(w, `s01-3a-view-working-eye-${P}`)
  const vw = await X.weekWarn(w, '#vWeek', FRI)
  const d = await ddRead('view working eye', { root: '#vWeek', name: `s01-3b-daydetails-view-working-${P}` })
  say('VIEW-ONLY working eye strip:', vw.head, JSON.stringify(vw.items.map(i => i.text)), '| dd:', (d.text || d.error || '').slice(0, 300))
  check('S01.3a View-only "Working draft" eye (admin): strip and day details RECORDED (strip lists the "goes away once signed" row; day details lists only live warnings)', 'RECORDED', `strip ${JSON.stringify(vw.items.map(i => i.text.slice(0, 50)))} | dd ${(d.text || d.error || '').slice(-120)}`)
  await sel.selectOption('issued'); await sleep(500)
  // the older eye from Edit Schedule's plans menu
  await L.go(page, 'editsched'); await sleep(500)
  const am = await import('../am/am-lib.mjs')
  const rows = await am.planMenuItems(page, FRI)
  say('Edit Schedule plans menu rows:', JSON.stringify(rows))
  const look = page.locator('.wavemenu .wm[data-planpv]:visible').filter({ hasText: /Original/ }).first()
  if (!(await look.count())) { check('S01.3b older eye (Original) on Edit Schedule', 'NOT WALKED', 'no Original row: ' + JSON.stringify(rows)); return }
  if (w.phone) await look.tap(); else await look.click(); await sleep(800)
  await X.pic(w, `s01-3c-edit-older-eye-${P}`)
  const ew = await X.weekWarn(w, '#eWeek', FRI)
  say('EDIT week at the older eye (ORIG) strip:', ew.head, JSON.stringify(ew.items.map(i => i.text)))
  await X.crop(w, '#eWeek .day[data-day="4"]', `s01-3d-edit-older-strip-${P}`).catch(() => {})
  const d2 = await ddRead('edit older eye', { root: '#eWeek', name: `s01-3e-daydetails-edit-older-${P}` })
  say('DD at the older eye:', JSON.stringify(d2).slice(0, 700))
  check('S01.3b older eye (Original) on Edit Schedule: both warnings, names "planned"', ew.items.some(i => i.text.includes('Ranger') && /On leave \+ planned/.test(i.text)) && ew.items.some(i => i.text.includes('Reaper') && /Downchit \+ planned/.test(i.text)) && !OLD.test(ew.items.map(i => i.text).join('')), JSON.stringify(ew.items.map(i => i.text.slice(0, 55))))
  if (d2.error) check('S01.3c day details at the older eye', 'RECORDED', 'no day-details door while looking at an issued version on the edit week: ' + d2.error.slice(0, 120))
  else check('S01.3c day details at the older eye (Original): shows both men (the recorded document), not the amendment', d2.text.includes('Ranger') && d2.text.includes('Reaper') && !OLD.test(d2.text), d2.text.slice(0, 300))
  const back = page.locator('#eWeek [data-golive="4"]:visible').first()
  if (await back.count()) { if (w.phone) await back.tap(); else await back.click(); await sleep(600) }
})
/* ---------- the crew-rest line on a published day ---------- */
await step('S01.4', async () => {
  await L.go(page, 'viewsched'); await sleep(600)
  const vw = await X.weekWarn(w, '#vWeek', SUN)
  say('VIEW-ONLY Sunday strip:', vw.head, JSON.stringify(vw.items.map(i => i.text)))
  await X.crop(w, '#vWeek .day[data-day="6"]', `s01-4a-view-sunday-${P}`).catch(() => {})
  const cr = vw.items.find(i => /rest/i.test(i.text))
  const d = await X.dayDetails(w, SUN, { root: '#vWeek', name: `s01-4b-daydetails-sunday-view-${P}` }); closes.push(await closeDD('sunday view'))
  say('DD Sunday:', JSON.stringify(d).slice(0, 700))
  check('S01.4a View-only Sunday (published): the crew-rest line reads "took off 12:00 with no landing typed", never "landed"', !!cr && crUnder(cr.text) && !/landed 12:00/.test(cr.text), cr ? cr.text : JSON.stringify(vw.items.map(i => i.text)))
  check('S01.4b day details for Sunday carries the same line', !d.error && crUnder(d.text) && !/landed 12:00/.test(d.text), (d.text || d.error).slice(0, 400))
})
/* ---------- the board's ? and the board's own eye ---------- */
await step('S01.5', async () => {
  await X.board(w, FRI)
  const bl = await X.boardWarn(w)
  say('BOARD Friday lines (working copy):', JSON.stringify(bl.lines.map(l => l.text)))
  const d = await ddRead('board', { name: `s01-5a-daydetails-board-${P}` })
  say('DD board:', JSON.stringify(d).slice(0, 500))
  check('S01.5 board (working copy): day details agrees with the board\'s list (RECORDED both)', !d.error && !OLD.test(d.text), `board ${JSON.stringify(bl.lines.map(l => l.text.slice(0, 40)))} | dd ${(d.text || d.error).slice(0, 220)}`)
  // the board's eye: the plans menu, look at ORIG
  const items = await step('S01.5b', async () => { return await (await import('../am/am-lib.mjs')).planMenuItems(page, FRI) })
  say('board plans menu rows:', JSON.stringify(items))
  if (items) {
    const look = page.locator('.wavemenu .wm[data-planpv]:visible').filter({ hasText: /Original|ORIG/ }).first()
    if (await look.count()) {
      if (w.phone) await look.tap(); else await look.click(); await sleep(800)
      await X.pic(w, `s01-5b-board-older-eye-${P}`)
      const bl2 = await X.boardWarn(w)
      say('BOARD older eye lines:', JSON.stringify(bl2.lines.map(l => l.text)))
      const d2 = await ddRead('board older eye', { name: `s01-5c-daydetails-board-older-${P}` })
      say('DD board older eye:', JSON.stringify(d2).slice(0, 500))
      check("S01.5b board at the older eye (Original): list shows both warnings with their own messages; day details door " + (d2.error ? "absent (RECORDED)" : "present"), bl2.lines.some(l => l.text.includes("Reaper")) && bl2.lines.some(l => l.text.includes("Ranger")) && (d2.error ? "RECORDED" : (d2.text.includes("Reaper") && !OLD.test(d2.text))), `board ${JSON.stringify(bl2.lines.map(l => l.text.slice(0, 40)))} | dd ${(d2.text || d2.error || "").slice(0, 200)}`)
      const back = page.locator('#schedBoard [data-golive]:visible').first()
      if (await back.count()) { if (w.phone) await back.tap(); else await back.click(); await sleep(600) }
    } else check('S01.5b board older eye', 'NOT WALKED', 'no issued-version row in the board\'s plans menu: ' + JSON.stringify(items))
  }
  await X.closeBoard(w)
})
/* ---------- as Ranger ---------- */
await step('S05.R', async () => {
  await X.relogin(w, 'us')
  await L.go(page, 'viewsched'); await sleep(700)
  const vw = await X.weekWarn(w, '#vWeek', FRI)
  say('AS RANGER View-only Friday strip:', vw.head, JSON.stringify(vw.items.map(i => i.text)))
  await X.crop(w, '#vWeek .day[data-day="4"]', `s05-r1-ranger-view-friday-${P}`).catch(() => {})
  const d = await ddRead('ranger friday', { root: '#vWeek', name: `s05-r2-ranger-daydetails-friday-${P}` })
  const vs = await X.weekWarn(w, '#vWeek', SUN)
  const ds = await ddRead2(SUN, 'ranger sunday')
  say('AS RANGER Sunday strip:', JSON.stringify(vs.items.map(i => i.text)), '| dd', (ds.text || ds.error || '').slice(0, 300))
  check('S05.R Ranger sees the same published Friday and Sunday as the admin (names "planned", crew-rest sentence)', vw.items.some(i => /On leave \+ planned/.test(i.text) && i.text.includes('Ranger')) && !vw.items.some(i => i.text.includes('Reaper')) && !d.error && !OLD.test(d.text) && vs.items.some(i => crUnder(i.text)), JSON.stringify(vw.items.map(i => i.text.slice(0, 40))) + ' | sun ' + JSON.stringify(vs.items.map(i => i.text.slice(0, 60))))
  await X.relogin(w, 'a')
})
async function ddRead2(di, tag) { const d = await X.dayDetails(w, di, { root: '#vWeek', name: `s05-r3-${tag.replace(/ /g, '-')}-${P}` }); closes.push(await closeDD(tag)); return d }

/* ---------- nothing pending from this batch ---------- */
await step('S05.N', async () => {
  const DAY = 0
  await X.board(w, DAY)
  const before = await X.head(w, DAY)
  const sp = await X.signAndPublish(w, DAY)
  const h1 = await X.head(w, DAY)
  say('Monday publish', JSON.stringify(sp), JSON.stringify(h1))
  await X.pic(w, `s05-n1-monday-published-${P}`)
  await X.closeBoard(w)
  await L.go(page, 'viewsched'); await sleep(500); await L.go(page, 'logic'); await sleep(400)
  await page.reload(); await page.waitForSelector('#vWeek .day', { state: 'attached' }).catch(() => {}); await sleep(900)
  if (await page.locator('#luser').count()) await L.login(page, 'a')
  await L.go(page, 'editsched'); await sleep(500)
  const h2 = await page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="0"]'); return d ? { pending: ((d.querySelector('.dpend') || {}).innerText || '').trim(), tag: ((d.querySelector('.verchip') || {}).innerText || '').trim(), alpub: !!d.querySelector('[data-alpub]') } : null })
  await X.crop(w, '#eWeek .day[data-day="0"] .day-head', `s05-n2-monday-after-reload-${P}`).catch(() => {})
  say('Monday after surfaces + reload', JSON.stringify(h2))
  check('S05.N a fresh published day (Monday): nothing pending after publish, a reload and visits to View-only and Logic — no edit', sp.pressed && !/pending/.test(h1.pending || '') && h2 && !/pending/.test(h2.pending) && !h2.alpub, `after publish ${JSON.stringify({ pending: h1.pending, tag: h1.tag })}; after reload ${JSON.stringify(h2)}`)
})
say('window closes:', JSON.stringify(closes))
check('S01/S05 every day-details opening was closed (Close, x, Escape, outside tap each used)', closes.length >= 4 && closes.every(c => c[1] === 'closed'), JSON.stringify(closes))
say('errors', JSON.stringify(w.errors))
check('S01/S05 no console/page errors', w.errors.length === 0, w.errors.slice(0, 3).join(' | '))
await X.finishWorld(w)
X.W.summary()
