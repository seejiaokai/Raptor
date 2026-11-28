// lwdl-walk-appr.mjs — walks Approvals' decide buttons: sizes, rings, keys, counts, Approve all, Undo, stale lines, 1100 wide, 125%. From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// lw-decide-look walk — Approvals: sizes across states, rings, neighbours, the pinned heading and foot fade, the full
// transition chain, the keyboard ring, counts and Approve all, Undo/Redo, stale lines, leaving and returning, the phone
// date line, 1100 wide, 125%.
// Scenarios: Fable 1, 4, 5d, 6, 7, 9, 13, 14, 15, 22, 23 · Astra 1, 2, 4, 5, 13, 14, 15, 19.  ENV: PORT TAG ONLY SIZES
import { run, signIn, press, readDecide, pic, ringPixels, isCyan, T, sleep, cellState, closeBrowsers, isOpen, closeWin } from './lwdl-lib.mjs'
const PG = T('approvals-page')
const toAppr = async S => { await press(S, T('lw-tab-approvals')); await S.page.waitForSelector(PG + ':not([hidden])'); await sleep(S.page, 700) }
const tagLines = page => page.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]; ls.forEach((l, i) => l.setAttribute('data-lwdl', String(i))); return ls.length })
const L = i => `[data-lwdl="${i}"]`
const lineInfo = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')].map((l, i) => {
  const r0 = l.getBoundingClientRect(); const lt = (l.parentElement.getBoundingClientRect().top); const r = { top: r0.top - lt, height: r0.height }; const d = l.querySelector('[data-testid="appr-dates"]')
  const dr = d?.getBoundingClientRect(); const lh = d ? parseFloat(getComputedStyle(d).lineHeight) || 18 : 0
  return { i, pid: l.dataset.testid.slice(10), y: Math.round(r.top), h: Math.round(r.height), text: l.innerText.replace(/\s+/g, ' ').slice(0, 90), cls: l.className, dates: d ? d.innerText.replace(/\s+/g, ' ') : '', datesH: dr ? Math.round(dr.height) : 0, datesLines: dr ? Math.round(dr.height / lh) : 0 }
}))
const counts = page => page.evaluate(() => ({
  sub: document.querySelector('[data-testid="appr-sub"]')?.innerText.replace(/\s+/g, ' '),
  all: document.querySelector('[data-testid="appr-approve-all"]')?.innerText.replace(/\s+/g, ' '),
  tab: document.querySelector('[data-testid="lw-tab-approvals"]')?.innerText.replace(/\s+/g, ' '),
}))
const btnsOf = async (page, i) => { await tagLines(page); return readDecide(page, L(i)) }
const sh = b => `${b.tid}:"${b.words}" ${b.cls} ${b.w}x${b.h}@${b.x},${b.y} ring=${b.outline} col=${b.color} edge=${b.edge} op=${b.opacity} dis=${b.disabled} mark=${b.mark ? b.mark.w + 'px' : 'none'} padL=${b.padL} padR=${b.padR} clip=${b.clipped} cut=${b.ringCut.join(';') || '-'}`
async function pressLine(S, i, which) {
  await tagLines(S.page)
  const loc = S.page.locator(`${L(i)} [data-testid="appr-${which}"]`)
  await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(S.page, 200)
  if (S.touch) { const bb = await loc.boundingBox(); await S.page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2) } else await loc.click()
  await sleep(S.page, 500)
}
const stateOf = bs => { const a = bs.find(b => b.tid === 'appr-approve'), r = bs.find(b => b.tid === 'appr-refuse'); return a && r ? (/lit/.test(a.cls) ? 'approved' : /lit/.test(r.cls) ? 'refused' : (/dec-off/.test(a.cls) || /dec-off/.test(r.cls)) ? 'odd' : 'waiting') : 'missing' }

/* A. sizes across states, rings, neighbours, line positions, counts */
await run('AP-A', ['desk', 'p402', 'p390'], async S => {
  const page = S.page
  await signIn(S); await toAppr(S)
  const n = await tagLines(page)
  S.check(n >= 10, 'Approvals holds the demo pending lines', n)
  const li0 = await lineInfo(page)
  const rest = []
  for (let i = 0; i < n; i++) rest.push(await btnsOf(page, i))
  S.data.rest = rest.map(bs => bs.map(b => ({ tid: b.tid, w: b.w, h: b.h, x: b.x, padL: b.padL, padR: b.padR })))
  S.data.lines0 = li0
  console.log('     rest line 0: ' + rest[0].map(sh).join(' || '))
  S.check(rest.every(bs => bs.length === 2 && bs.every(b => b.mark && b.markBeforeWords)), 'every line: tick and cross before their words', rest.map(bs => bs.map(b => !!b.mark && b.markBeforeWords)))
  S.check(rest.every(bs => bs.every(b => b.padL >= 2 && b.padR >= 2 && !b.clipped)), 'every resting button: mark and word ≥2px inside the edge, nothing clipped', rest.map(bs => bs.map(b => [b.padL, b.padR])))
  S.note('dates lines at rest: ' + li0.map(l => `${l.dates}=${l.datesLines}`).join(' | '))
  const c0 = await counts(page); S.note('counts at rest ' + JSON.stringify(c0))
  await pic(S, 'A1-rest', [PG], { full: S.size === 'desk' ? false : true })
  /* decide: approve 0, refuse last, approve 3 and 4 */
  await pressLine(S, 0, 'approve'); await pressLine(S, n - 1, 'refuse'); await pressLine(S, 3, 'approve'); await pressLine(S, 4, 'approve')
  const li1 = await lineInfo(page)
  S.check(li1.length === n && li1.every((l, i) => l.y === li0[i].y && l.pid === li0[i].pid), 'no line moved or went after deciding', li1.map((l, i) => [l.pid, li0[i].y, l.y]))
  const c1 = await counts(page); S.note('counts after 3 approved, 1 refused ' + JSON.stringify(c1))
  const pend0 = +(c0.sub.match(/\d+/) || [0])[0], pend1 = +(c1.sub.match(/\d+/) || [0])[0]
  S.check(pend1 === pend0 - 4, 'the pending count drops by the four decided', [pend0, pend1])
  S.check(+(c1.all.match(/\d+/) || [0])[0] === pend0 - 4, 'Approve all counts only the waiting', c1.all)
  const dec = {}
  for (const i of [0, 3, 4, n - 1]) dec[i] = await btnsOf(page, i)
  for (const [i, bs] of Object.entries(dec)) {
    console.log(`     line ${i}: ` + bs.map(sh).join(' || '))
    const st = stateOf(bs)
    S.check(st === (+i === n - 1 ? 'refused' : 'approved'), `line ${i} reads ${+i === n - 1 ? 'refused' : 'approved'}`, st)
    for (const b of bs) {
      const was = rest[i].find(r => r.tid === b.tid)
      S.check(Math.abs(b.w - was.w) < 0.6 && Math.abs(b.h - was.h) < 0.6 && Math.abs(b.x - was.x) < 0.6, `line ${i} ${b.tid}: same box as waiting`, { was: [was.w, was.h, was.x], now: [b.w, b.h, b.x] })
      S.check(b.padL >= 2 && b.padR >= 2 && !b.clipped, `line ${i} ${b.tid}: mark and word inside the edge`, [b.padL, b.padR, b.clipped])
      if (/lit/.test(b.cls)) {
        S.check(/dec-ring/.test(b.cls) && b.outline.includes('2px'), `line ${i} lit one ringed`, b.outline)
        S.check(b.ringCut.length === 0, `line ${i} ring not cut by a container`, b.ringCut)
        const other = bs.find(o => o !== b)
        const gap = b.tid === 'appr-approve' ? other.x - (b.x + b.w + 4) : b.x - 4 - (other.x + other.w)
        S.check(gap > 0, `line ${i}: clear gap between the ring and the grey neighbour`, Math.round(gap * 10) / 10)
        S.data['gap' + i] = gap
      } else S.check(/dec-off/.test(b.cls) && b.outline === 'none' && b.mark.color === b.color, `line ${i} the other grey, its mark grey with it`, [b.cls, b.outline, b.mark.color, b.color])
    }
  }
  // the rings of the two adjacent approved lines (3 and 4) never touch
  const a3 = dec[3].find(b => b.tid === 'appr-approve'), a4 = dec[4].find(b => b.tid === 'appr-approve')
  S.check(a4.y - 4 - (a3.y + a3.h + 4) > 0, 'adjacent lines: their rings do not touch', Math.round((a4.y - 4 - (a3.y + a3.h + 4)) * 10) / 10)
  for (const i of [0, 3, n - 1]) {
    const lit = dec[i].find(b => /lit/.test(b.cls))
    await tagLines(page)
    const rp = await ringPixels(S, `${L(i)} [data-testid="${lit.tid}"]`)
    S.check(['ringTop', 'ringBottom', 'ringLeft', 'ringRight'].every(k => isCyan(rp[k])), `line ${i}: ring painted cyan all four sides`, rp)
    await pic(S, `A2-line${i}-zoom`, [`${L(i)} .appr-btns`], { pad: 10 })
  }
  await page.evaluate(() => { const s = document.querySelector('.appr-scroll'); if (s) s.scrollTop = 0 })
  await sleep(page, 200)
  await pic(S, 'A2-decided', [PG], { full: S.size === 'desk' ? false : true })
  /* scroll: line 3 right under the pinned heading, then the last line above the foot fade */
  const sc = await page.evaluate(() => { const s = document.querySelector('.appr-scroll'); return s ? { st: s.scrollTop, sh: s.scrollHeight, ch: s.clientHeight } : null })
  S.note('scroller ' + JSON.stringify(sc))
  const scrolled = await page.evaluate(() => {
    const s = document.querySelector('.appr-scroll'); const l = document.querySelector('[data-lwdl="3"]'); const cols = document.querySelector('.appr-scroll > .appr-cols')
    const scroller = s && s.scrollHeight > s.clientHeight + 2 ? s : document.scrollingElement
    const before = scroller.scrollTop
    const colsB = cols ? cols.getBoundingClientRect().bottom : (s ? s.getBoundingClientRect().top : 0)
    scroller.scrollTop += l.getBoundingClientRect().top - colsB - 2
    return { which: scroller === s ? 'appr-scroll' : 'page', before, after: scroller.scrollTop }
  })
  await sleep(page, 300)
  S.note('scroll for line 3 under the heading: ' + JSON.stringify(scrolled))
  const under = await page.evaluate(() => {
    const cols = document.querySelector('.appr-scroll > .appr-cols'), l = document.querySelector('[data-lwdl="3"] [data-testid="appr-approve"]')
    if (!cols || !l) return null
    const c = cols.getBoundingClientRect(), b = l.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top - 3
    const top = document.elementFromPoint(x, Math.max(c.bottom - 2, 0))
    return { colsBottom: Math.round(c.bottom), ringTop: Math.round(b.top - 4), atRing: document.elementFromPoint(x, y)?.className?.toString().slice(0, 40), colsZ: getComputedStyle(cols).zIndex, colsBg: getComputedStyle(cols).backgroundColor }
  })
  S.note('line 3 under the pinned heading: ' + JSON.stringify(under))
  await pic(S, 'A3-line3-under-heading', ['.appr-scroll > .appr-cols', L(3), L(4)], { pad: 6 })
  await page.evaluate(() => { const s = document.querySelector('.appr-scroll'); const sc = s && s.scrollHeight > s.clientHeight + 2 ? s : document.scrollingElement; sc.scrollTop = sc.scrollHeight })
  await sleep(page, 300)
  await tagLines(page)
  const lastB = (await readDecide(page, L(n - 1))).find(b => /lit/.test(b.cls))
  S.note('last line lit button at the foot: ' + JSON.stringify({ y: lastB?.y, h: lastB?.h, cut: lastB?.ringCut, vh: await page.evaluate(() => innerHeight) }))
  await pic(S, 'A4-last-line-at-foot', [L(n - 2), L(n - 1)], { pad: 30 })
})

/* B. the transition chain on one line in the middle (Astra 5), with counts; second tap (Fable 6) */
await run('AP-B', ['desk', 'p402', 'p390'], async S => {
  const page = S.page
  await signIn(S); await toAppr(S)
  const n = await tagLines(page)
  const t = 5
  const li0 = await lineInfo(page); const c0 = await counts(page)
  const rest = await btnsOf(page, t)
  await pic(S, 'B0-waiting', [L(t - 1), L(t), L(t + 1)], { pad: 8 })
  const chain = [['approve', 'approved'], ['refuse', 'refused'], ['approve', 'approved'], ['approve', 'waiting'], ['refuse', 'refused'], ['refuse', 'waiting']]
  let k = 1
  for (const [btn, want] of chain) {
    await pressLine(S, t, btn)
    const bs = await btnsOf(page, t); const st = stateOf(bs)
    const li = await lineInfo(page); const c = await counts(page)
    S.check(st === want, `press ${btn} → ${want}`, st)
    S.check(li.length === n && li[t].pid === li0[t].pid && li.every((l, i) => l.y === li0[i].y), 'every line in its place', li.map(l => l.y))
    S.check(bs.every(b => { const w = rest.find(r => r.tid === b.tid); return Math.abs(b.w - w.w) < 0.6 && Math.abs(b.x - w.x) < 0.6 }), 'the two buttons keep their boxes', bs.map(b => [b.tid, b.w, b.x]))
    const pend = +(c.sub.match(/\d+/) || [0])[0], p0 = +(c0.sub.match(/\d+/) || [0])[0]
    S.check(pend === (want === 'waiting' ? p0 : p0 - 1), 'pending count follows', [c.sub, c.all, c.tab])
    if (want === 'waiting') S.check(JSON.stringify(bs.map(b => [b.cls, b.words, b.color, b.edge, b.outline])) === JSON.stringify(rest.map(b => [b.cls, b.words, b.color, b.edge, b.outline])), 'back to the exact waiting look', bs.map(b => [b.cls, b.words, b.edge]))
    await pic(S, `B${k++}-${btn}-${want}`, [L(t)], { pad: 8 })
  }
})

/* C. keyboard on a decided line (desktop) — Fable 1, Astra 4 */
await run('AP-C', ['desk'], async S => {
  const page = S.page
  await signIn(S); await toAppr(S); await tagLines(page)
  await page.locator(`${L(1)} [data-testid="appr-refuse"]`).focus()
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); await sleep(page, 120); if (await page.evaluate(() => document.activeElement?.dataset?.testid === 'appr-approve')) break }
  const a =await page.evaluate(() => document.activeElement?.closest('[data-lwdl]')?.dataset.lwdl + ':' + document.activeElement?.dataset?.testid)
  S.check(a === '2:appr-approve', 'Tab lands on line 2 Approve', a)
  await page.keyboard.press('Enter'); await sleep(page, 500)
  let bs = await btnsOf(page, 2)
  S.note('Enter → line 2 ' + stateOf(bs) + '; focus ' + await page.evaluate(() => document.activeElement?.dataset?.testid))
  const litKey = bs.find(b => b.tid === 'appr-approve')
  await pic(S, 'C1-enter-key-on-lit', [L(2)], { pad: 8 })
  await page.keyboard.press('Tab'); await sleep(page, 150)
  bs = await btnsOf(page, 2)
  const litNo = bs.find(b => b.tid === 'appr-approve'), greyKey = bs.find(b => b.tid === 'appr-refuse')
  await pic(S, 'C2-key-on-grey', [L(2)], { pad: 8 })
  await pic(S, 'C2-key-on-grey-zoom', [`${L(2)} .appr-btns`], { pad: 8 })
  await page.keyboard.press('Shift+Tab'); await sleep(page, 150)
  await pic(S, 'C3-key-back-on-lit', [L(2)], { pad: 8 })
  S.note(`lit with key: ${litKey.outline} fv=${litKey.focusVisible} | lit without key: ${litNo.outline} | grey with key: ${greyKey.outline} fv=${greyKey.focusVisible}`)
  S.check(litKey.outline !== litNo.outline, 'keyboard on the lit Approved changes what is drawn', [litKey.outline, litNo.outline])
  S.check(greyKey.outline !== litNo.outline, 'keyboard on the grey Refuse does not wear the very ring that means decided', [greyKey.outline, litNo.outline])
  /* Space on the grey one decides the other way */
  await page.keyboard.press('Tab'); await page.keyboard.press('Space'); await sleep(page, 400)
  S.check(stateOf(await btnsOf(page, 2)) === 'refused', 'Space on the grey Refuse refuses', stateOf(await btnsOf(page, 2)))
  await pic(S, 'C4-after-space', [L(2)], { pad: 8 })
})

/* D. Approve all with decided lines kept, Undo, Redo — Fable 15, Astra 14, 19 */
await run('AP-D', ['desk', 'p402'], async S => {
  const page = S.page
  await signIn(S); await toAppr(S)
  const n = await tagLines(page)
  await pressLine(S, 1, 'approve'); await pressLine(S, 2, 'refuse')
  const c1 = await counts(page); S.note('after 1 approved, 1 refused: ' + JSON.stringify(c1))
  await press(S, T('appr-approve-all')); await sleep(page, 500)
  const armed = await counts(page); S.note('armed: ' + JSON.stringify(armed))
  await pic(S, 'D1-armed', [T('appr-approve-all'), L(0), L(1), L(2)], { pad: 8 })
  const allRing = await page.evaluate(() => { const e = document.querySelector('[data-testid="appr-approve-all"]'); const c = getComputedStyle(e); return { cls: e.className, outline: c.outlineStyle + ' ' + c.outlineColor } })
  await press(S, T('appr-approve-all')); await sleep(page, 900)
  await tagLines(page)
  const st = []; for (let i = 0; i < n; i++) st.push(stateOf(await btnsOf(page, i)))
  S.note('after Approve all: ' + st.join(','))
  S.check(st[2] === 'refused', 'the refused line is not changed by Approve all', st[2])
  S.check(st.filter((s, i) => i !== 2).every(s => s === 'approved'), 'every other line approved, lit and ringed', st)
  const allAfter = await page.evaluate(() => { const e = document.querySelector('[data-testid="appr-approve-all"]'); if (!e) return 'gone'; const c = getComputedStyle(e); return { cls: e.className, outline: c.outlineStyle, txt: e.innerText } })
  S.check(allAfter === 'gone' || !/dec-ring/.test(allAfter.cls), 'Approve all itself wears no decided ring', allAfter)
  S.note('approve all before: ' + JSON.stringify(allRing) + ' after: ' + JSON.stringify(allAfter))
  await page.evaluate(() => { const s = document.querySelector('.appr-scroll'); if (s) s.scrollTop = 0; scrollTo(0, 0) })
  await pic(S, 'D2-all-approved', [PG], { full: true })
  // every ring separate from the neighbour line's
  const ys = []; for (let i = 0; i < n; i++) { const b = (await btnsOf(page, i)).find(x => /lit/.test(x.cls)); if (b) ys.push([b.y, b.h]) }
  const touch = ys.slice(1).map((y, i) => Math.round((y[0] - 4 - (ys[i][0] + ys[i][1] + 4)) * 10) / 10)
  S.check(touch.every(g => g > 0), 'each ring separate from the next line ring', touch)
  await page.locator('#undoBtn').click({ timeout: 4000 }).catch(e => S.note('undo: ' + e.message.split('\n')[0])); await sleep(page, 800)
  await tagLines(page)
  const st2 = []; for (let i = 0; i < (await tagLines(page)); i++) st2.push(stateOf(await btnsOf(page, i)))
  S.note('after Undo: ' + st2.join(','))
  S.check(st2[1] === 'approved' && st2[2] === 'refused' && st2.filter((s, i) => i > 2 || i === 0).every(s => s === 'waiting'), 'Undo takes back Approve all only; the two decided by hand stay', st2)
  await pic(S, 'D3-after-undo', [PG], { full: true })
  await page.locator('#redoBtn').click({ timeout: 4000 }).catch(e => S.note('redo: ' + e.message.split('\n')[0])); await sleep(page, 800)
  const st3 = []; for (let i = 0; i < (await tagLines(page)); i++) st3.push(stateOf(await btnsOf(page, i)))
  S.note('after Redo: ' + st3.join(','))
  S.check(st3.filter((s, i) => i !== 2).every(s => s === 'approved'), 'Redo: all approved again', st3)
  await pic(S, 'D4-after-redo', [PG], { full: true })
  /* a line returned to waiting counts again */
  await pressLine(S, 0, 'approve'); const c4 = await counts(page)
  S.check(stateOf(await btnsOf(page, 0)) === 'waiting', 'a lit line tapped again is waiting', stateOf(await btnsOf(page, 0)))
  S.note('counts with one line back to waiting: ' + JSON.stringify(c4))
  S.check(/1/.test(c4.sub), 'the count counts it again', c4)
})

/* E. stale lines: decided elsewhere, and a deleted bid — Fable 13, Astra 13 */
await run('AP-E', ['desk', 'p402'], async S => {
  const page = S.page
  await signIn(S); await toAppr(S)
  await tagLines(page)
  const li = await lineInfo(page)
  const t = li.findIndex(l => l.pid === 'bruise' && /23 Jan/.test(l.dates))
  S.check(t >= 0, 'Gambit 23 Jan AM line found', li.map(l => l.pid + ' ' + l.dates))
  await press(S, `${L(t)} [data-testid="appr-dates"]`); await sleep(page, 1200)
  S.check(await page.locator(T('appr-slim')).isVisible().catch(() => false), 'slim bar up on the grid', null)
  await press(S, T('cell-bruise-2026-01-23')); await sleep(page, 800)
  const which = await isOpen(page, 'bid-picker') ? 'bid-picker' : await isOpen(page, 'daylist') ? 'daylist' : 'none'
  S.note('window on 23 Jan: ' + which)
  if (which === 'bid-picker') await press(S, T('decide-approve')); else if (which === 'daylist') await press(S, '[data-testid^="dl-approve-"]')
  await sleep(page, 700)
  S.check(/:a/.test(await cellState(page, 'bruise', '2026-01-23')), 'approved in the grid window', await cellState(page, 'bruise', '2026-01-23'))
  await closeWin(S)
  await press(S, `${T('appr-slim')} .appr-back`).catch(async () => press(S, T('appr-back'))); await sleep(page, 900)
  await tagLines(page)
  const li2 = await lineInfo(page)
  const t2 = li2.findIndex(l => l.pid === 'bruise' && /23 Jan/.test(l.dates))
  S.note('line after Back: ' + JSON.stringify(li2[t2]))
  if (t2 >= 0) {
    const bs = await btnsOf(page, t2)
    console.log('     stale: ' + bs.map(sh).join(' || '))
    S.data.staleApproved = bs
    S.check(bs.every(b => b.disabled), 'both buttons of the stale line not pressable', bs.map(b => b.disabled))
    S.note('stale line looks: ' + bs.map(b => `${b.tid} ${b.cls} op=${b.opacity} col=${b.color} ring=${b.outline}`).join(' | '))
    await pic(S, 'E1-stale-approved-elsewhere', [L(t2)], { pad: 8 })
  } else S.note('the line is gone after Back (not kept as stale)')
  /* decide here, then delete the bid on the grid, come back */
  const t3 = li2.findIndex(l => l.pid === 'wolf')
  await pressLine(S, t3, 'approve')
  await press(S, `${L(t3)} [data-testid="appr-dates"]`); await sleep(page, 1200)
  await press(S, T('cell-wolf-2026-01-08')); await sleep(page, 800)
  if (await isOpen(page, 'bid-picker')) { await press(S, T('bid-clear')); await sleep(page, 400); if (await isOpen(page, 'bid-picker')) { await press(S, T('bid-clear')); await sleep(page, 600) } }
  S.note('wolf 8 Jan after delete: ' + await cellState(page, 'wolf', '2026-01-08'))
  await closeWin(S)
  await press(S, `${T('appr-slim')} .appr-back`).catch(async () => press(S, T('appr-back'))); await sleep(page, 900)
  await tagLines(page)
  const li3 = await lineInfo(page)
  const t4 = li3.findIndex(l => l.pid === 'wolf')
  S.note('wolf line after Back: ' + JSON.stringify(li3[t4]))
  if (t4 >= 0) {
    const bs = await btnsOf(page, t4)
    console.log('     gone: ' + bs.map(sh).join(' || '))
    S.data.staleGone = bs
    S.check(bs.every(b => b.disabled), 'both buttons of the "no longer there" line not pressable', bs.map(b => b.disabled))
    await pic(S, 'E2-stale-deleted', [L(t4)], { pad: 8 })
  }
})

/* F. leave and return — Fable 14, Astra 15 */
await run('AP-F', ['desk', 'p402'], async S => {
  const page = S.page
  await signIn(S); await toAppr(S)
  const n = await tagLines(page)
  await pressLine(S, 2, 'approve'); await pressLine(S, 4, 'refuse')
  const base = await lineInfo(page)
  const check = async (label) => {
    await tagLines(page)
    const li = await lineInfo(page); const s2 = stateOf(await btnsOf(page, 2)), s4 = stateOf(await btnsOf(page, 4))
    S.check(s2 === 'approved' && s4 === 'refused', `${label}: lines 2 and 4 still decided, lit and ringed`, [s2, s4])
    S.check(li.length === base.length && li.every((l, i) => l.pid === base[i].pid), `${label}: the same lines in the same order`, li.map(l => l.pid))
    const c = await counts(page); S.note(label + ' counts ' + JSON.stringify(c))
  }
  await press(S, `${L(5)} [data-testid="appr-dates"]`); await sleep(page, 1100)
  await press(S, `${T('appr-slim')} .appr-back`).catch(async () => press(S, T('appr-back'))); await sleep(page, 900)
  await check('after a request\'s dates and Back'); await pic(S, 'F1-after-dates-back', [PG], { full: true })
  const oil = page.locator('[data-testid="oil-tracker"]')
  if (await oil.count()) { await press(S, oil); await sleep(page, 900); await press(S, T('oil-close')).catch(() => page.keyboard.press('Escape')); await sleep(page, 900)
    if (!(await page.locator(PG + ':not([hidden])').count())) S.note('after OIL ✕ the page is: ' + await page.evaluate(() => document.querySelector('[data-testid="approvals-page"]:not([hidden])') ? 'approvals' : 'grid'))
    if (await page.locator(PG + ':not([hidden])').count()) { await check('after OIL tab open and ✕'); await pic(S, 'F2-after-oil', [PG], { full: true }) }
  } else S.note('no OIL tab button found')
  await sleep(page, 3000)
  if (await page.locator(PG + ':not([hidden])').count()) await check('after 3 s idle')
  await press(S, T('lw-tab-grid')); await sleep(page, 800); await toAppr(S)
  await tagLines(page)
  const li = await lineInfo(page)
  S.check(li.length === n - 2, 'left for the grid and back: the two decided lines are gone', [n, li.length])
  const any = await page.evaluate(() => document.querySelectorAll('[data-testid="approvals-page"] .dec-ring, [data-testid="approvals-page"] .dec-off').length)
  S.check(any === 0, 'nothing ringed or grey after returning', any)
  await pic(S, 'F3-after-leaving', [PG], { full: true })
})

/* G. the phone line: half-day dates and fit, every state, 402 / 390 / 360 — Fable 9, Astra 2 */
await run('AP-G', ['p402', 'p390', 'p360'], async S => {
  const page = S.page
  await signIn(S); await toAppr(S)
  const n = await tagLines(page)
  const out = {}
  for (const phase of ['waiting', 'approved', 'refused']) {
    if (phase === 'approved') for (let i = 0; i < n; i++) await pressLine(S, i, 'approve')
    if (phase === 'refused') for (let i = 0; i < n; i++) await pressLine(S, i, 'refuse')
    await tagLines(page)
    const li = await lineInfo(page)
    const rows = []
    for (let i = 0; i < n; i++) {
      const bs = await btnsOf(page, i)
      const l1 = await page.evaluate(i => { const e = document.querySelector(`[data-lwdl="${i}"] .appr-l1`); const b = document.querySelector(`[data-lwdl="${i}"] .appr-btns`); return e ? { h: Math.round(e.getBoundingClientRect().height), bh: b ? Math.round(b.getBoundingClientRect().height) : 0 } : null }, i)
      rows.push({ dates: li[i].dates, lines: li[i].datesLines, l1, st: stateOf(bs), b: bs.map(b => ({ t: b.tid.slice(5), w: b.w, padL: b.padL, padR: b.padR, clip: b.clipped, mark: b.mark?.w })) })
    }
    out[phase] = rows
    S.note(phase + ': ' + rows.map(r => `${r.dates}[${r.lines}L row${r.l1?.h}/btn${r.l1?.bh}] ${r.b.map(b => b.t + ' ' + b.w + ' (' + b.padL + '/' + b.padR + ')').join(' ')}`).join(' | '))
    S.check(rows.every(r => r.b.every(b => b.padL >= 2 && b.padR >= 2 && !b.clip)), `${phase}: every mark and word ≥2px inside its edge, nothing clipped`, rows.map(r => r.b.map(b => [b.padL, b.padR])))
    S.check(rows.every(r => !r.l1 || r.l1.h <= r.l1.bh + 1), `${phase}: no line taller than its buttons`, rows.map(r => r.l1))
    if (S.size === 'p402') S.check(rows.filter(r => /AM|PM/.test(r.dates)).every(r => r.lines === 1), `${phase} at 402: every half-day date on one line`, rows.filter(r => /AM|PM/.test(r.dates)).map(r => [r.dates, r.lines]))
    await page.evaluate(() => { scrollTo(0, 0); const s = document.querySelector('.appr-scroll'); if (s) s.scrollTop = 0 })
    await pic(S, `G-${phase}`, [PG], { full: true })
  }
  const wid = ph => out[ph].map(r => r.b.map(b => b.w).join('/'))
  S.check(JSON.stringify(wid('waiting')) === JSON.stringify(wid('approved')) && JSON.stringify(wid('waiting')) === JSON.stringify(wid('refused')), 'the buttons keep one width waiting, approved and refused', { w: wid('waiting'), a: wid('approved'), r: wid('refused') })
  S.data.phone = out
})

/* H. desktop 1100 wide and 1536: no sideways scroll, right edges in one column — Fable 23 */
await run('AP-H', ['desk', 'd1100'], async S => {
  const page = S.page
  await signIn(S); await toAppr(S)
  const n = await tagLines(page)
  const m = await page.evaluate(() => { const s = document.querySelector('.appr-scroll'); return { page: document.scrollingElement.scrollWidth > document.scrollingElement.clientWidth, list: s ? s.scrollWidth > s.clientWidth + 1 : null, sw: s?.scrollWidth, cw: s?.clientWidth } })
  S.note('sideways scroll: ' + JSON.stringify(m)); S.data.hscroll = m
  const rights = []; for (let i = 0; i < n; i++) { const bs = await btnsOf(page, i); rights.push(bs.map(b => Math.round(b.x + b.w)).join('/') + ' w' + bs.map(b => b.w).join('/')) }
  S.note('right edges per line: ' + rights.join(' | ')); S.data.rights = rights
  S.check(new Set(rights).size === 1, 'Approve and Refuse in one column down the list, one width', rights)
  const wraps = await lineInfo(page); S.check(wraps.every(l => l.datesLines <= 1), 'no date wraps', wraps.map(l => [l.dates, l.datesLines]))
  S.data.lines = wraps.map(l => [l.dates, l.h])
  await pic(S, 'H-list', [PG], { full: true })
})

/* I. his PC at 125%: the faint edge on all four sides, ring even — Fable 22 */
await run('AP-I', ['pc125'], async S => {
  const page = S.page
  await signIn(S); await toAppr(S)
  await tagLines(page)
  const rp = await ringPixels(S, `${L(0)} [data-testid="appr-approve"]`)
  S.note('resting Approve at 125%: ' + JSON.stringify(rp))
  const bg = rp.glowTop
  S.check(['edgeTop', 'edgeBottom', 'edgeLeft', 'edgeRight'].every(k => rp[k] !== bg), 'faint edge differs from the surroundings on all four sides', rp)
  await pic(S, 'I1-rest-125', [`${L(0)} .appr-btns`], { pad: 8 })
  await pressLine(S, 0, 'approve')
  const rp2 = await ringPixels(S, `${L(0)} [data-testid="appr-approve"]`)
  S.check(['ringTop', 'ringBottom', 'ringLeft', 'ringRight'].every(k => isCyan(rp2[k])), 'ring cyan all four sides at 125%', rp2)
  await pic(S, 'I2-approved-125', [`${L(0)} .appr-btns`], { pad: 8 })
  const n = await tagLines(page)
  const rights = []; for (let i = 0; i < n; i++) { const bs = await btnsOf(page, i); rights.push(bs.map(b => b.x + '+' + b.w).join('/')) }
  S.note('boxes at 125%: ' + rights.join(' | '))
  await pic(S, 'I3-list-125', [PG], { full: true })
})
await closeBrowsers()
