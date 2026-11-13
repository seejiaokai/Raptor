/* d-02-d123 v1 — D1, D7, D2, D3 in ONE world (his case). usage (from raptor-port/): node scripts/handpass/d2028/d-02-d123.mjs pc|phone */
const KIND = process.argv[2] || 'pc'
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/d123-' + KIND
console.log('d-02-d123 v1', KIND, process.env.HP_SHOTS)
const D = await import('./d-lib.mjs')
const C = await import('../rcsb/w1/rcsb-w1-common.mjs')
const { X, L, sleep, j, row, SAT } = D
const w = await D.world(KIND)
const { page } = w
const P = KIND === 'phone' ? 'P' : 'D'
console.log('bundle', await D.bundle(page))
const ranger = w.ID('Ranger')
const cnt = o => { const m = /\d+/.exec(o.chip || ''); return m ? +m[0] : null }

async function readOne(surf, tag, di = SAT) {
  await D.toSurface(w, surf, di)
  const c = await D.chips(w, surf, di)
  let idx = c.findIndex(x => /Briefing/.test(x.row))
  if (idx < 0 && c.length >= 1) idx = 0
  if (idx < 0) return { surf, why: 'NO CHIP: ' + j(c) }
  const o = await D.readAA(w, surf, di, idx, `${tag}-${surf}`)
  const ns = await D.names(w, o.text)
  return { surf, chip: o.chip, title: o.title, count: ns.length, ranger: ns.includes('Ranger'), n: ns.length, chips: c.length, ok: o.ok }
}
async function face(tag) {
  const f = await D.dayFace(w, SAT)
  await X.pic(page, tag + '-edit-head', `#eWeek .day[data-day="${SAT}"] .day-head`)
  await X.pic(page, tag + '-edit-signoff', `#eWeek .day[data-day="${SAT}"] .signoff`)
  return { tag: f.head.tag, pending: f.head.pending, nys: f.head.nys, signs: f.head.signs, beak: f.head.beak && f.head.beak.text, alpub: f.head.alpub && f.head.alpub.text, soState: f.card.sostate, nysText: f.card.nys, signedln: f.card.signedln }
}
async function readAll(tag, surfs = ['view', 'edit', 'board']) {
  const out = { tag }
  for (const s of surfs) out[s] = await readOne(s, tag)
  out.face = await face(tag)
  console.log('READ', tag, j(out))
  return out
}

// ---- fixture: Saturday, Briefing 09:00 no end + ALL AVAIL, Ranger's ground row 10:15-10:45; publish; sign four again
console.log('sat rows before', await page.evaluate(i => JSON.stringify({ ah: window.DAYS[i].allhands.map(a => [a.prog, a.str, a.end, a.who]), g: window.DAYS[i].ground.map(a => [a.prog, a.str, a.end, a.who]) }), SAT))
const a = await D.addCommon(w, SAT, 'Briefing', '09:00')
console.log('briefing', j(a), await D.drop(w, `a:${SAT}.${a.ri}.+`, 'allavail'))
const g = await D.addGround(w, SAT, 'Ground Programme', '10:15', '10:45', ranger)
console.log('ground', j(g))
const p = await D.pub(w, SAT)
console.log('published', j(p.pressed), j(p.head))
const s4 = await D.signFour(w, SAT)
console.log('signed four on working copy', j(s4.sg), j(s4.head && s4.head.signs))
await L.closeBoard(page)
const r0 = await readAll('d1-0-before')
const ok0 = r0.view.title === '09:00–10:00 · no end time, an hour assumed' && r0.view.ranger
row(`D1-${P} baseline (published, signed again)`, ok0 ? 'OK' : 'CHECK', j(r0))

// ---- the Logic change
const lg = await D.setLogic(w, 'openEnd', '2h', 'd1-1-logic-2h')
console.log('logic', j(lg))
row(`D1-${P} logic`, 'RECORD', j(lg), 'd1-1-logic-2h.png')

// (a) straight back
const ra = await readAll('d1-a-back')
// (d) Undo then Redo of the Logic change, from the top bar (before the reload, which empties the Undo list)
await L.go(page, 'logic'); await sleep(600)
const un = await X.undoBtn(w, 'undo'); await D.shot(page, 'd1-d-after-undo-logic')
const v1 = await page.evaluate(() => window.VCONF.openEnd)
console.log('undo', j(un), 'openEnd now', v1)
const rd1 = un.ok ? await readAll('d1-d1-undone') : null
await L.go(page, 'logic'); await sleep(500)
const re = await X.undoBtn(w, 'redo'); await D.shot(page, 'd1-d-after-redo-logic')
const v2 = await page.evaluate(() => window.VCONF.openEnd)
console.log('redo', j(re), 'openEnd now', v2)
const rd2 = re.ok ? await readAll('d1-d2-redone') : null
// (c) change the week and come back
let rc = null, weekNote = ''
try {
  await L.go(page, 'editsched'); await sleep(500)
  const tabs = page.locator('button.wk[data-wk]:visible')
  const nt = await tabs.count()
  const cur = await page.evaluate(() => (document.querySelector('button.wk.on') || {}).dataset?.wk)
  weekNote = `week buttons visible ${nt}, current ${cur}`
  if (w.phone) {
    // the phone's way: the calendar button "Jump to a date"
    const jb = page.locator('button.wknav-mbtn:visible').first()
    await D.hit(w, jb); await sleep(700); await D.shot(page, 'd1-c-jump-open')
    const dump = await page.evaluate(() => [...document.querySelectorAll('button, [data-icday], [data-jd], td')].filter(e => e.offsetWidth && e.getBoundingClientRect().top > 100).slice(0, 80).map(e => (e.dataset.icday || e.dataset.jd || e.id || '') + ':' + (e.innerText || '').trim().slice(0, 8)).join(' '))
    console.log('jump popup', dump)
    weekNote += ' - phone: Jump popup opened (see log/picture)'
    await page.keyboard.press('Escape'); await sleep(400)
  } else if (nt > 1) {
    const other = page.locator('button.wk[data-wk]:visible:not(.on)').first()
    const ov = await other.getAttribute('data-wk')
    await D.hit(w, other); await sleep(900)
    await D.shot(page, 'd1-c-other-week')
    await D.hit(w, page.locator(`button.wk[data-wk="${cur}"]:visible`).first()); await sleep(900)
    weekNote += `; went to ${ov} and back`
    rc = await readAll('d1-c-weekaway')
  } else weekNote += ' - NOT DONE (no week buttons visible)'
} catch (e) { weekNote += ' ERROR ' + e.message.split('\n')[0] }
console.log('weeknote', weekNote)
// (b) a real reload
await page.reload(); await sleep(1200)
if (await page.locator('#luser').count()) await L.login(page, 'a')
await L.installToasts(page)
const rb = await readAll('d1-b-reload')
row(`D1-${P} reads`, 'RECORD', j({ ra, rb, rc, weekNote, un, v1, rd1, re, v2, rd2 }))

// ---- D7: Ranger, view-only, the same count
try {
  await W_relog('us')
  await L.go(page, 'viewsched'); await sleep(600)
  const c = await D.chips(w, 'view', SAT)
  const idx = Math.max(0, c.findIndex(x => /Briefing/.test(x.row)))
  const o = await D.openAA(w, 'view', SAT, idx, 'd7-member-view')
  const ns = await D.names(w, o.text)
  const ctl = await page.evaluate(() => [...document.querySelectorAll('[data-oilitem],[data-oilp],#sbOil,.oil-earn')].filter(e => e.offsetWidth).length)
  const inputs = await page.evaluate(() => [...document.querySelectorAll('.win-one input, .win-one select, .win-one textarea, .win-one [data-oilp]')].filter(e => e.offsetWidth).length)
  console.log('D7', j({ chip: o.chip, title: o.title, n: ns.length, ranger: ns.includes('Ranger'), oilControlsOnPage: ctl, controlsInWindow: inputs, chips: c.length }))
  row(`D7-${P}`, 'RECORD', j({ chip: o.chip, title: o.title, n: ns.length, ranger: ns.includes('Ranger'), oilControlsOnPage: ctl, controlsInWindow: inputs }), 'd7-member-view.png')
  await D.closeAA(w)
  await W_relog('a')
} catch (e) { row(`D7-${P}`, 'NOT DONE', e.message.split('\n')[0]); try { await W_relog('a') } catch {} }
async function W_relog(who) {
  const loBtn = page.locator('#logout:visible').first()
  if (await loBtn.count()) await D.hit(w, loBtn)
  else {
    const b = page.locator('#burger:visible').first()
    if (await b.count()) { await D.hit(w, b); await sleep(500) }
    const lo2 = page.locator('#drawerLogout:visible, #logout:visible').first()
    await D.hit(w, lo2)
  }
  await sleep(600)
  const conf = page.getByRole('button', { name: /^(Logout|Sign out|Yes|Confirm|OK)/ })
  if (!(await page.locator('#luser').isVisible().catch(() => false)) && await conf.count()) { await conf.first().click(); await sleep(500) }
  await L.login(page, who)
  await L.installToasts(page)
}

// ---- D2: something else waits: a remark on the SDO desk
const sdoKey = await page.evaluate(i => { const b = window.DAYS[i].dutywaves[0]; return b ? b.rows.map((r, k) => `dr:${i}.0.${k}|${r.role}`).join(' ; ') : 'no duty block' }, SAT)
console.log('duty rows', sdoKey)
await L.board(page, SAT)
let openRead = null
if (KIND === 'pc') {
  // the window left OPEN while the remark is typed behind it
  const ch = await D.chips(w, 'board', SAT)
  const idx = Math.max(0, ch.findIndex(x => /Briefing/.test(x.row)))
  const o = await D.openAA(w, 'board', SAT, idx, 'd2-0-window-open-before')
  console.log('window open before', o.title, o.chip)
  await X.typeIn(w, '[data-bfld="dr:5.0.0.rmks"], [data-bfld="dr:5.0.0.rmk"]', 'D2 remark').catch(async e => console.log('typeIn behind window failed', e.message.split('\n')[0]))
  await sleep(800)
  const live = await page.evaluate(() => { const e = document.querySelector('.win-one'); const b = document.querySelector('.win-body'); return { title: e ? e.innerText.replace(/[\s\u00a0]+/g, ' ').trim() : 'NO WINDOW', body: b ? b.innerText.replace(/[\s\u00a0]+/g, ' ').trim().slice(0, 40) : '', n: (document.querySelector('.win-body') || {}).innerText ? ((document.querySelector('.win-body').innerText.match(/Who’s available\s*(\d+)/) || [])[1]) : null } })
  const chipNow = await D.chips(w, 'board', SAT)
  const ns = await D.names(w, await page.evaluate(() => (document.querySelector('.win-body') || {}).innerText || ''))
  await D.shot(page, 'd2-1-window-open-after-remark')
  openRead = { live, chipNow: chipNow.map(x => x.chip), n: ns.length, ranger: ns.includes('Ranger') }
  console.log('OPEN WINDOW after remark', j(openRead))
  row('D2-D window left open while remark typed', 'RECORD', j(openRead), 'd2-1-window-open-after-remark.png')
  await D.closeAA(w)
} else {
  await X.typeIn(w, '[data-bfld="dr:5.0.0.rmks"], [data-bfld="dr:5.0.0.rmk"]', 'D2 remark')
  await sleep(600)
}
console.log('remark typed', await page.evaluate(i => JSON.stringify(window.DAYS[i].dutywaves[0].rows[0]), SAT))
await L.closeBoard(page)
const rr = await readAll('d2-1-remark')
const pl = await C.pendingList(w, SAT, 'd2-2-pendinglist')
console.log('PENDING', j(pl))
row(`D2-${P} remark typed`, 'RECORD', j({ rr, pl }))
// delete the remark exactly
await L.board(page, SAT)
const rk = await page.evaluate(i => window.DAYS[i].dutywaves[0].rows[0].rmks, SAT)
await X.typeIn(w, '[data-bfld="dr:5.0.0.rmks"], [data-bfld="dr:5.0.0.rmk"]', '')
await sleep(600)
console.log('remark deleted; now', await page.evaluate(i => JSON.stringify(window.DAYS[i].dutywaves[0].rows[0].rmks), SAT))
await L.closeBoard(page)
const rdel = await readAll('d2-3-remark-deleted')
row(`D2-${P} remark deleted`, 'RECORD', j(rdel))

// ---- D3: the remark again, sign, publish the amendment
await L.board(page, SAT)
await X.typeIn(w, '[data-bfld="dr:5.0.0.rmks"], [data-bfld="dr:5.0.0.rmk"]', 'D2 remark')
await sleep(600)
const pa = await D.pub(w, SAT)
console.log('AL published', j(pa.pressed), j(pa.head))
const r3 = await readAll('d3-1-amended', ['view', 'edit', 'board'])
// look at the ORIGINAL on Edit Schedule
await L.go(page, 'editsched'); await sleep(500)
const looked = await L.lookAt(page, SAT, /Original/); await sleep(700)
const ro = looked ? await readOne('edit', 'd3-2-look-original') : { why: 'look at Original not possible' }
console.log('ORIGINAL', j(ro))
await L.planMenuItems(page, SAT)
const back = await L.menuLive(page); await sleep(600)
const rl = await readOne('edit', 'd3-3-back-on-current')
console.log('BACK', back, j(rl))
row(`D3-${P}`, 'RECORD', j({ pa: pa.pressed, r3, looked, ro, back, rl }))
D.finish(w, 'd123-' + KIND)
await w.browser.close()
