/* lk-walk part C: the Inputs card W15 ([INP-OIL-CHIP-PHONE]) — the walker's script, 21 Oct 26 */
process.env.HP_URL ||= 'http://localhost:4295'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/.claude/worktrees/overnight-backlog-review-92da33/raptor-port/docs/img/handpass/2026-10-21-look-keys/walk'
console.log('lk-walk-c v6')
const { go } = await import('./lib.mjs')
const W = await import('./lk-walk-lib.mjs')
const rec = W.recorder('c')
const pause = (page, ms = 350) => page.waitForTimeout(ms)
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/* the card's three marks, their boxes and whether they share pixels or lie outside the card (element boxes, as painted) */
const CARDMARKS = (arg) => {
  const card = [...document.querySelectorAll('.icard')].find(c => c.offsetWidth && (typeof arg === 'string' ? c.dataset.iid === arg : c.innerText.includes(arg.text)))
  if (!card) return null
  const q = (s) => [...card.querySelectorAll(s)].find(e => e.offsetWidth)
  const els = { LATE: q('.sd-late'), 'OIL?': q('.oiltag'), hours: q('.icard-hrs') }
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } }
  const cb = R(card)
  const rects = Object.fromEntries(Object.entries(els).map(([k, e]) => [k, R(e)]))
  const inter = (a, b) => !a || !b ? null : { w: Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), h: Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) }
  const pairs = [['LATE', 'OIL?'], ['LATE', 'hours'], ['OIL?', 'hours']].map(([a, b]) => { const i = inter(rects[a], rects[b]); return { pair: a + '/' + b, shares: !!i && i.w > 0.5 && i.h > 0.5, w: i && Math.round(i.w * 10) / 10, h: i && Math.round(i.h * 10) / 10 } })
  const inside = Object.fromEntries(Object.entries(rects).map(([k, r]) => [k, !!r && r.x >= cb.x - 0.5 && r.x + r.w <= cb.x + cb.w + 0.5 && r.y >= cb.y - 0.5 && r.y + r.h <= cb.y + cb.h + 0.5]))
  return { card: cb, rects, pairs, inside, text: card.innerText.replace(/\s+/g, ' ').slice(0, 120), hrsText: els.hours ? els.hours.textContent.trim() : null }
}
const fmtR = (r) => r ? `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.w)}x${Math.round(r.h)}` : 'absent'
const fmtM = (m) => !m ? 'card not visible' : `card ${fmtR(m.card)} · LATE ${fmtR(m.rects.LATE)} · OIL? ${fmtR(m.rects['OIL?'])} · hours ${fmtR(m.rects.hours)} ("${m.hrsText}") · overlaps ${m.pairs.map(p => p.pair + ' ' + (p.shares ? `SHARE ${p.w}x${p.h}` : 'none')).join('; ')} · inside card ${Object.entries(m.inside).map(([k, v]) => k + ':' + v).join(' ')}`
const okM = (m) => !!m && Object.values(m.rects).every(Boolean) && m.pairs.every(p => !p.shares) && Object.values(m.inside).every(Boolean)

async function fileInput(page, { person, type, iso, s, e, answer = 'No OIL' }) {
  const [Y, M, D] = iso.split('-').map(Number)
  await page.locator('#inListBtn:visible').tap(); await pause(page, 300)
  await page.locator('#inNew').tap(); await page.waitForSelector('.inpedwin:not([hidden])'); await pause(page, 500)
  await page.selectOption('#inpEditType', { label: type }); await pause(page, 300)
  await page.selectOption('#inpEditPerson', { label: person })
  await page.locator('#inpEditAllday').uncheck()
  await page.fill('#inpEditStart', s); await page.fill('#inpEditEnd', e)
  for (let i = 0; i < 14; i++) {
    const t = await page.locator('[data-testid="inpEdCal-title"]').innerText()
    if (t.includes(MONTHS[M - 1]) && t.includes(String(Y))) break
    const cur = MONTHS.findIndex(m => t.includes(m)); const curY = parseInt((t.match(/\d{4}/) || [0])[0])
    await page.locator(`[data-testid="inpEdCal-${(curY * 12 + cur) < (Y * 12 + M - 1) ? 'next' : 'prev'}"]`).tap(); await pause(page, 250)
  }
  await page.locator(`[data-testid="inpEdCal-day-${iso}"]`).tap(); await pause(page, 300)
  const before = await page.evaluate(() => (window.INPUTS ? Object.keys(window.INPUTS) : null))
  await page.locator('#inpEditSave').tap(); await pause(page, 900)
  /* the OIL question: the sheet's Add stays dimmed until an answer is given (probe), so it is answered here with `answer` */
  const asked = await page.evaluate(() => /Does it deserve/.test(document.body.innerText))
  if (asked) {
    await page.locator('.oilconf-pop .upconf-seg', { hasText: answer }).first().tap(); await pause(page, 400)
    await page.locator('.oilconf-pop .abtn.primary').first().tap(); await pause(page, 900)
  }
  const open = await page.evaluate(() => { const w = document.querySelector('.inpedwin'); return !!w && !w.hidden && !!w.offsetWidth })
  const after = await page.evaluate(() => (window.INPUTS ? Object.keys(window.INPUTS) : null))
  const made = before && after ? after.filter(k => !before.includes(k)) : null
  return { asked, windowStillOpen: open, made }
}
const allIids = (page) => page.evaluate(() => [...document.querySelectorAll('.icard')].filter(c => c.offsetWidth).map(c => c.dataset.iid))
const listAll = async (page) => { await page.locator('#inListBtn:visible').tap().catch(() => {}); await pause(page, 300); await page.locator('#inRangeBtn:visible').tap(); await pause(page, 300); await page.locator('#inRangeAll').tap(); await pause(page, 500) }

const cardInfo = (page) => page.evaluate(() => [...document.querySelectorAll('.icard')].filter(c => c.offsetWidth).map(c => ({ iid: c.dataset.iid, late: !!c.querySelector('.sd-late'), oil: !!c.querySelector('.oiltag'), hrs: c.querySelector('.icard-hrs')?.textContent.trim() || '', t: c.innerText.replace(/\s+/g, ' ').slice(0, 90) })))

const { browser, page, errors } = await W.openD({ width: 390, height: 844, touch: true, clock: '2026-10-21T09:00:00' })
try {
  await go(page, 'inputs')
  console.log('app today', await page.evaluate(() => new Date().toString()))
  /* (1) through the controls: a Duty on Sat 24 Oct 09:00-12:00, the OIL question answered "No OIL" (its Add stays dimmed until answered) */
  await listAll(page)
  const before = (await cardInfo(page)).map(c => c.iid)
  const r1 = await fileInput(page, { person: 'Anvil', type: 'Duty', iso: '2026-10-24', s: '09:00', e: '12:00', answer: 'No OIL' })
  console.log('filed by the controls:', JSON.stringify(r1))
  if (r1.windowStillOpen) { await W.snap(page, 'w15-debug-window-open'); await page.locator('.inpedwin .win-x').tap().catch(() => {}); await pause(page, 400) }
  await listAll(page)
  const after1 = await cardInfo(page)
  const newCards = after1.filter(c => !before.includes(c.iid))
  console.log('new cards after the controls filing:', JSON.stringify(newCards))
  const c1 = newCards[0]
  if (c1) {
    await page.locator(`.icard[data-iid="${c1.iid}"]`).first().scrollIntoViewIfNeeded(); await pause(page, 300)
    const m = await page.evaluate(CARDMARKS, c1.iid)
    const full = await W.snap(page, 'w15-controls-filed-390')
    rec('W15-pre', '390x844 touch', 'filed Duty Sat 24 Oct 09:00-12:00 by "+ Input" with the OIL question answered "No OIL" (the sheet cannot save unanswered: its Add is disabled until an answer)', `new card: late=${c1.late} oil?=${c1.oil} hours="${c1.hrs}" · ${fmtM(m)}`, 'RECORD', [full])
  } else rec('W15-pre', '390x844 touch', 'filed by controls', 'no new card found: ' + JSON.stringify(r1), 'RECORD')

  /* (2) an input with the OIL question UNANSWERED cannot be filed through "+ Input"; it is filed through the app's own filing body (window.fileInput), as the host's own reproductions do */
  const ids = await page.evaluate(() => {
    const w = window, P = w.PEOPLE
    const crew = Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)
    const mk = (i, who, more) => { const iid = 'lkw-' + i; w.fileInput({ iid, person: crew[who % crew.length], type: 'Duty', date: 'Oct 24', yr: 2026, allday: false, s: 540, e: 720, ...more }); return iid }
    return [mk(1, 6, {}), mk(2, 7, { mod: '2026-10-21' })]
  })
  await pause(page, 500)
  await listAll(page)
  const info = await cardInfo(page)
  console.log('programmatic cards:', JSON.stringify(info.filter(c => ids.includes(c.iid))))
  const pick = info.filter(c => ids.includes(c.iid)).find(c => c.late && c.oil) || info.filter(c => ids.includes(c.iid)).find(c => c.oil) || info.find(c => ids.includes(c.iid))
  if (!pick) rec('W15', '390x844 touch', 'filed an unanswered Duty by the app\'s filing body', 'no card drawn for ' + ids.join(','), 'NOT WALKED')
  else {
    const sel = `.icard[data-iid="${pick.iid}"]`
    await page.locator(sel).first().scrollIntoViewIfNeeded(); await pause(page, 300)
    const mk = async (m, name, vw, vh) => {
      await W.mark(page, [m.rects.LATE, m.rects['OIL?'], m.rects.hours, m.card].filter(Boolean))
      const full = await W.snap(page, name)
      const y0 = Math.max(0, m.card.y - 10)
      const crop = await W.snap(page, name + '-zoom', { x: 0, y: y0, width: vw, height: Math.min(vh - y0, m.card.h + 20) })
      await W.unmark(page); return [full, crop]
    }
    const m1 = await page.evaluate(CARDMARKS, pick.iid)
    const wears = `the card wears LATE:${!!m1.rects.LATE} OIL?:${!!m1.rects['OIL?']}`
    const p1 = await mk(m1, 'w15-card-390', 390, 844)
    rec('W15a', '390x844 touch', `Duty Sat 24 Oct 09:00-12:00 filed with the OIL question unanswered (by the app's filing body; ${wears}); List, All dates`, fmtM(m1), (m1.rects.LATE && m1.rects['OIL?']) ? (okM(m1) ? 'PASS' : 'FAIL') : 'RECORD', p1)
    await page.setViewportSize({ width: 320, height: 568 }); await pause(page, 800)
    await page.locator(sel).first().scrollIntoViewIfNeeded(); await pause(page, 300)
    const m2 = await page.evaluate(CARDMARKS, pick.iid)
    if (!m2) rec('W15b', '320x568 touch', 'viewport to 320x568', 'card not visible', 'NOT WALKED')
    else { const p2 = await mk(m2, 'w15-card-320', 320, 568); rec('W15b', '320x568 touch', 'same card after setting the viewport to 320x568', fmtM(m2), (m2.rects.LATE && m2.rects['OIL?']) ? (okM(m2) ? 'PASS' : 'FAIL') : 'RECORD', p2) }
    await page.setViewportSize({ width: 390, height: 844 }); await pause(page, 600)
    /* the Inputs Calendar */
    await page.locator('#inCalBtn:visible').tap(); await pause(page, 700)
    await W.snap(page, 'w15-cal-open')
    const calInfo = await page.evaluate(() => ({ btns: [...document.querySelectorAll('#page-inputs button, #page-inputs [data-testid]')].filter(b => b.offsetWidth).map(b => (b.getAttribute('data-testid') || b.id || '') + ' ' + (b.textContent || '').trim().slice(0, 14)).filter(s => s.trim()).slice(0, 80) }))
    console.log('calendar controls:', JSON.stringify(calInfo.btns))
    console.log('pick', JSON.stringify(pick))
    /* tap the date 24 */
    const day = page.locator('[data-testid="ib-week-3"]').locator('xpath=.//*[normalize-space(text())="24"]').first()
    console.log('day 24 element count', await day.count())
    const bb = await day.boundingBox(); console.log('day 24 box', JSON.stringify(bb), 'parent', await day.evaluate(e => e.parentElement.className + ' ' + e.parentElement.tagName + ' pe=' + getComputedStyle(e).pointerEvents))
    await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pause(page, 800)
    await W.snap(page, 'w15-cal-day-opened-debug')
    const cards = await cardInfo(page)
    console.log('cards after the date tap:', JSON.stringify(cards))
    const who = pick.t.match(/OIL? dd:dd.dd:dd (w+?)DUTY/)?.[1] || 'Blade'
    const mc = cards.length ? await page.evaluate(CARDMARKS, { text: who }) : null
    console.log('opened-day card looked up by name:', who, !!mc)
    if (mc) {
      await page.evaluate((t) => { const c = [...document.querySelectorAll('.icard')].find(x => x.offsetWidth && x.innerText.includes(t)); c && c.scrollIntoView({ block: 'center' }) }, who); await pause(page, 500)
      const m3 = await page.evaluate(CARDMARKS, { text: who })
      const p3 = await mk(m3, 'w15-cal-card-390', 390, 844)
      rec('W15c', '390x844 touch', 'Inputs Calendar, tapped the date 24 Oct; measured the opened day card of the same input', fmtM(m3), (m3.rects.LATE && m3.rects['OIL?']) ? (okM(m3) ? 'PASS' : 'FAIL') : 'RECORD', p3)
    } else rec('W15c', '390x844 touch', 'Inputs Calendar, tapped the date 24 Oct', 'no card of the input visible after the tap; cards: ' + JSON.stringify(cards), 'NOT WALKED', ['w15-cal-day-opened-debug.png'])
  }
} catch (e) { rec('W15', '390 touch', 'x', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED'); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
console.log('CONSOLE', W.consoleBlock(errors))
await browser.close()
console.log('DONE c (stage 1)')
