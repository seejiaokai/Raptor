import * as L from './icard-C-lib.mjs'
const { sleep } = L
const SIZES = [
  { tag: 'phone-390x568', size: 'phone', viewport: { width: 390, height: 568 } },
  { tag: 'phone-844x390', size: 'phone', viewport: { width: 844, height: 390 } },
  { tag: 'desk-1440x700', size: 'desk', viewport: { width: 1440, height: 700 } },
]
const ONLY = process.argv[2]
const FOURTEEN = ['Ace', 'Anvil', 'Blade', 'Cinch', 'Cobra', 'Comet', 'Diesel', 'Drifter', 'Forge', 'Gambit', 'Havoc', 'Hunter', 'Nomad', 'Ranger']
const errs = []
async function openViaDay(w, iso, text) {
  const p = w.page
  await L.openDay(w, iso)
  const c = p.locator('[data-testid^="idy-row-"]').filter({ hasText: text }).first()
  await c.scrollIntoViewIfNeeded()
  await L.press(w, c.locator('[data-testid="idy-open"]'))
  await L.win(p).waitFor(); await sleep(300)
}
/* is a control inside the screen, with nothing over it, once the window is scrolled to it */
async function reach(w, sel) {
  const p = w.page
  const loc = p.locator(`${L.WIN} ${sel}`).first()
  if (!(await loc.count())) return null
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  await sleep(150)
  return loc.evaluate(e => { const r = e.getBoundingClientRect(); const vw = innerWidth, vh = innerHeight; const x = document.elementFromPoint(Math.min(vw - 1, Math.max(0, r.left + r.width / 2)), Math.min(vh - 1, Math.max(0, r.top + r.height / 2))); return { inside: r.top >= 0 && r.bottom <= vh && r.left >= 0 && r.right <= vw, hit: !!x && (x === e || e.contains(x) || x.contains(e)), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] } })
}
async function swipeInWindow(w, dy) {
  const p = w.page
  const box = await p.locator(L.WIN).boundingBox()
  const vh = p.viewportSize().height
  const x = box.x + box.width / 2, y0 = Math.min(box.y + box.height - 40, vh - 40)
  if (w.touch) {
    const cdp = await p.context().newCDPSession(p)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] })
    for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - (dy * i) / 8 }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await cdp.detach()
  } else { await p.mouse.move(x, box.y + box.height / 2); await p.mouse.wheel(0, dy) }
  await sleep(400)
}
async function check(w, tag, entry, ctrls) {
  const p = w.page
  const out = []
  const geo = await p.locator(L.WIN).evaluate(e => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), vh: innerHeight } })
  out.push(`window box top ${geo.top} bottom ${geo.bottom} (${geo.h} tall) on a ${geo.vh}-tall screen`)
  const pageY = () => p.evaluate(() => ({ y: window.scrollY, ds: (document.scrollingElement || {}).scrollTop }))
  const y0 = await pageY()
  await swipeInWindow(w, 300)
  const y1 = await pageY()
  const chained = y0.y !== y1.y || y0.ds !== y1.ds
  out.push(`scrolling the window moved the page behind: ${chained}`)
  const bad = []
  for (const [name, sel] of ctrls) {
    const r = await reach(w, sel)
    if (r === null) { out.push(`${name}: not present`); continue }
    out.push(`${name}: inside screen ${r.inside}, nothing over it ${r.hit}, box ${r.box}`)
    if (!r.inside || !r.hit) bad.push(name)
  }
  const pic = await L.pic(w, `79-${tag}-${entry}`)
  return { out, bad, chained, pic }
}
async function oneSize(S) {
  const pics = []
  let verdict = 'PASS'
  const w = await L.world(S.size, 'ad', { viewport: S.viewport })
  const p = w.page
  const say = []
  try {
    await L.fileNew(w, { iso: '2026-07-21', type: 'Meeting', title: 'Fourteen people', several: FOURTEEN, s: '10:00', e: '11:00', rmk: 'a long remark so that the window has a body worth scrolling through' })
    await L.openNew(w, '2026-07-22')
    await p.selectOption('#inpEditType', 'ATT C')
    await L.attachDoc(w, L.SAMPLE); await L.attachDoc(w, L.SAMPLE)
    await L.saveWin(w); await L.closeWins(p)
    await L.fileNew(w, { iso: '2026-07-24', type: 'Duty', s: '09:00', e: '12:00' })
    await L.declareHoliday(w, '2026-07-24', 'Test holiday', 'TH'); await L.closeWins(p)
    const att = await p.evaluate(() => window.INPUTS.find(r => r.type === 'ATT C' && r.date === 'Jul 22'))
    say.push(`setup: 14-person meeting (${await p.evaluate(() => window.INPUTS.filter(r => r.title === 'Fourteen people').length)} records); ATT C with ${att ? JSON.stringify(att.docIds || att.docId || null).slice(0, 80) : 'none'}; a Duty on a holiday awaiting its OIL answer`)
    const cases = [
      ['fourteen', '21', 'Fourteen people', [['Save', '#inpEditSave'], ['Cancel', '#inpEditCancel'], ['Delete', '#inpEditDel']]],
      ['medical', '22', 'ATT C', [['Save', '#inpEditSave'], ['Cancel', '#inpEditCancel'], ['Delete', '#inpEditDel'], ['paperclip', '[data-testid="inped-docview"]'], ['Add document', '.docbtn']]],
      ['oil', '24', 'Duty', [['Answer...', '[data-testid="oil-answer"]'], ['Save', '#inpEditSave'], ['Cancel', '#inpEditCancel'], ['Delete', '#inpEditDel']]],
    ]
    for (const [entry, d, txt, ctrls] of cases) {
      await L.closeWins(p)
      await openViaDay(w, `2026-07-${d}`, txt)
      const r = await check(w, S.tag, entry, ctrls)
      say.push(`${entry} (admin): ${r.out.join('; ')}`)
      pics.push(r.pic)
      if (r.bad.length) { verdict = 'FAIL'; say.push('FAIL: not reachable: ' + r.bad.join(', ')) }
      if (r.chained) { verdict = 'FAIL'; say.push('FAIL: scrolling the window scrolled the page behind it') }
      if (entry === 'oil') {
        const a = p.locator('[data-testid="oil-answer"]')
        if (await a.count()) {
          await a.scrollIntoViewIfNeeded()
          await L.press(w, a); await sleep(500)
          const q = await L.oilText(p)
          const f = await p.locator('[data-testid="oilconf-save"]').evaluate(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { in: r.top >= 0 && r.bottom <= innerHeight, hit: x === e || e.contains(x) } }).catch(() => null)
          const fy = await p.locator('[data-testid="oilconf"]').evaluate(e => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight } }).catch(() => null)
          say.push(`the OIL question: ${q ? 'open' : 'did not open'}; its box ${JSON.stringify(fy)}; its Save button ${JSON.stringify(f)}`)
          pics.push(await L.pic(w, `79-${S.tag}-oil-question`))
          if (f && (!f.in || !f.hit)) { verdict = 'FAIL'; say.push('FAIL: the OIL question Save is not reachable') }
          await p.keyboard.press('Escape'); await sleep(300)
        }
      }
      await L.closeWins(p)
    }
    await L.switchUser(w, 'us')
    await openViaDay(w, '2026-07-21', 'Fourteen people')
    const rr = await check(w, S.tag, 'ranger-fourteen', [['Close', '#inpEditCancel'], ['Take me out', '[data-testid="inped-takeout"]'], ['own Change...', '[data-testid="oil-revise-own"]']])
    say.push(`ranger on the 14-person entry: ${rr.out.join('; ')}`)
    pics.push(rr.pic)
    if (rr.bad.length) { verdict = 'FAIL'; say.push('FAIL (Ranger): not reachable: ' + rr.bad.join(', ')) }
    if (rr.chained) { verdict = 'FAIL'; say.push('FAIL (Ranger): window scroll moved the page') }
    await L.closeWins(p)
    await openViaDay(w, '2026-07-22', 'ATT C')
    const rm = await check(w, S.tag, 'ranger-medical', [['Close', '#inpEditCancel'], ['paperclip', '[data-testid="inped-docview"]']])
    say.push(`ranger on the medical entry: ${rm.out.join('; ')}`)
    pics.push(rm.pic)
    if (rm.bad.length) { verdict = 'FAIL'; say.push('FAIL (Ranger): not reachable: ' + rm.bad.join(', ')) }
  } catch (e) { verdict = 'NOT RUN'; say.push('script stopped: ' + String(e).slice(0, 300)); try { pics.push(await L.pic(w, `79-${S.tag}-err`)) } catch (x) {} }
  errs.push(...w.errors)
  L.row(79, S.tag.replace('desk-', 'desktop ').replace('phone-', 'phone '), 'Admin (Saber) and Member (Ranger)', verdict, say.join(' || '), pics)
  await w.browser.close()
}
for (const S of SIZES) { if (ONLY && !S.tag.includes(ONLY)) continue; try { await oneSize(S) } catch (e) { console.log('SIZE ERR', S.tag, e) } }
L.saveRows(errs)
