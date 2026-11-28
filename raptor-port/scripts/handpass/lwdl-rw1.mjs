// lwdl-rw1.mjs — walks the decided look again after fix round 1: the keyboard ring, narrow phones, Approvals' 100 width. From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// Re-walk after fix round 1 (commit 6c602adc7): the keyboard ring, the narrow phones, Approvals' 100 width, the narrow
// PC's pinned headings, the phone line's May date. Pictures prefixed rw1-.   ENV: PORT TAG ONLY SIZES
import { run, signIn, press, openCell, isOpen, closeWin, place, cellState, readDecide, pic, ringPixels, isCyan, T, sleep, closeBrowsers, BASE, gotoMonth } from './lwdl-lib.mjs'
const P = 'slipway', D = '2026-02-17'
const tabTo = async (page, pred, key = 'Tab', max = 80) => {
  for (let i = 0; i < max; i++) { if (await page.evaluate(pred)) return i; await page.keyboard.press(key); await sleep(page, 35) }
  return -1
}
const ring = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return { outline: c.outlineStyle === 'none' ? 'none' : `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} off ${c.outlineOffset}`, fv: e.matches(':focus-visible'), focus: document.activeElement === e, cls: e.className } }, sel)
const verdictKeys = (S, lit, litKey, greyKey, where) => {
  S.note(`${where}: lit without keys ${lit.outline} | lit with keys ${litKey.outline} | grey with keys ${greyKey.outline}`)
  S.check(/3px/.test(litKey.outline) && /59, 198, 232/.test(litKey.outline) && litKey.outline !== lit.outline, `${where}: keys on the lit one → one ring, 3px cyan, thicker than without`, [lit.outline, litKey.outline])
  S.check(/59, 198, 232/.test(greyKey.outline) && /off -1px/.test(greyKey.outline), `${where}: keys on the grey one → the app cyan drawn on its own edge (offset -1)`, greyKey.outline)
  S.check(greyKey.outline !== lit.outline, `${where}: the keyed grey one never wears the decided ring`, [greyKey.outline, lit.outline])
}

/* 1. keyboard: bid window, day's list, Approvals */
await run('rw1-KEY', (process.env.KSZ || 'desk,p402,c402').split(','), async S => {
  const page = S.page
  await signIn(S)
  await place(page, P, [D], 'LL')
  // bid window
  await openCell(S, P, D); await press(S, T('decide-approve')); await sleep(page, 700)
  if (!(await isOpen(page))) await openCell(S, P, D)
  const lit = await ring(page, T('decide-approve'))
  const n = await tabTo(page, () => document.activeElement?.dataset?.testid === 'decide-approve')
  S.note('bid window: Tab presses to reach the lit Approved: ' + n)
  if (n < 0) { S.note('NOT WALKED here: Tab never reached the decide buttons in this browser'); await pic(S, '0-tab-never-reached', [T('bid-picker')]); return }
  const litKey = await ring(page, T('decide-approve'))
  await pic(S, 'W1-keys-on-lit', [T('bid-actions')], { pad: 10 })
  await page.keyboard.press('Tab'); await sleep(page, 150)
  const greyKey = await ring(page, T('decide-refuse'))
  S.check(greyKey.focus, 'Tab moved to the grey Refuse', greyKey)
  await pic(S, 'W2-keys-on-grey', [T('bid-actions')], { pad: 10 })
  verdictKeys(S, lit, litKey, greyKey, 'bid window')
  const rp = await ringPixels(S, T('decide-refuse')); S.note('grey keyed pixels: ' + JSON.stringify({ edgeTop: rp.edgeTop, edgeLeft: rp.edgeLeft, ringTop: rp.ringTop, ringLeft: rp.ringLeft }))
  await closeWin(S)
  // day's list: Ace 19 Jan, a refused OL bid
  await openCell(S, 'dj', '2026-01-19', 'daylist')
  const ids = await page.evaluate(() => { const a = document.querySelector('[data-testid^="dl-approve-"]'), r = document.querySelector('[data-testid^="dl-refuse-"]'); return [a?.dataset.testid, r?.dataset.testid] })
  const litL = await ring(page, T(ids[1]))
  let k = -1; for (let i = 0; i < 80; i++) { if (await page.evaluate(id => document.activeElement?.dataset?.testid === id, ids[1])) { k = i; break } await page.keyboard.press('Tab'); await sleep(page, 35) }
  S.note('day list: Tab presses to the lit Refused: ' + k)
  if (k >= 0) {
    const litLKey = await ring(page, T(ids[1]))
    await pic(S, 'L1-keys-on-lit', [`[data-testid="daylist"] .dl-acts`], { pad: 10 })
    await page.keyboard.press('Shift+Tab'); await sleep(page, 150)
    const greyL = await ring(page, T(ids[0]))
    S.check(greyL.focus, 'Shift+Tab moved to the grey Approve', greyL)
    await pic(S, 'L2-keys-on-grey', [`[data-testid="daylist"] .dl-acts`], { pad: 10 })
    verdictKeys(S, litL, litLKey, greyL, "day's list")
  }
  await closeWin(S)
  // Approvals
  await press(S, T('lw-tab-approvals')); await sleep(page, 900)
  await page.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]; ls.forEach((l, i) => l.setAttribute('data-lwdl', String(i))) })
  await page.locator('[data-lwdl="1"] [data-testid="appr-refuse"]').focus()
  let j = -1; for (let i = 0; i < 6; i++) { await page.keyboard.press('Tab'); await sleep(page, 80); if (await page.evaluate(() => document.activeElement?.dataset?.testid === 'appr-approve' && document.activeElement.closest('[data-lwdl]')?.dataset.lwdl === '2')) { j = i; break } }
  S.check(j >= 0, 'Tab reaches line 3 Approve', j)
  await page.keyboard.press('Enter'); await sleep(page, 500)
  const A = '[data-lwdl="2"] [data-testid="appr-approve"]', R = '[data-lwdl="2"] [data-testid="appr-refuse"]'
  const litAK = await ring(page, A)
  await pic(S, 'A1-keys-on-lit', ['[data-lwdl="2"] .appr-btns'], { pad: 10 })
  await page.keyboard.press('Tab'); await sleep(page, 150)
  const greyAK = await ring(page, R), litA = await ring(page, A)
  await pic(S, 'A2-keys-on-grey', ['[data-lwdl="2"] .appr-btns'], { pad: 10 })
  verdictKeys(S, litA, litAK, greyAK, 'Approvals')
  await page.keyboard.press('Shift+Tab'); await sleep(page, 150)
  await pic(S, 'A3-keys-back-on-lit', ['[data-lwdl="2"] .appr-btns'], { pad: 10 })
})

/* 2. the narrow phones: the window and the day's list at 360, 375, 390, 402 */
await run('rw1-NARROW', (process.env.NSZ || 'p360,p375,p390,p402').split(','), async S => {
  const page = S.page
  await signIn(S)
  await place(page, P, [D], 'LL')
  const read = async (scope, rowSel, label) => {
    const d = await readDecide(page, scope)
    const row = await page.evaluate(s => [...document.querySelector(s).querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => { const r = b.getBoundingClientRect(); return [b.innerText.replace(/\s+/g, ' ').trim(), Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10, Math.round(r.top)] }), rowSel)
    S.note(`${label}: row ${JSON.stringify(row)}`)
    for (const b of d) S.note(`   ${b.words}: w${b.w} h${b.h} mark ${b.mark?.w}px padL ${b.padL} padR ${b.padR} clipped ${b.clipped} fs ${b.fontSize}`)
    return { d, row }
  }
  const results = []
  // window: approved, refused
  for (const [btn, st] of [['decide-approve', 'approved'], ['decide-refuse', 'refused']]) {
    await openCell(S, P, D); await press(S, T(btn)); await sleep(page, 700)
    if (!(await isOpen(page))) await openCell(S, P, D)
    const r = await read(T('bid-picker'), `${T('bid-picker')} [data-testid="bid-actions"]`, 'window ' + st)
    results.push(['window ' + st, r])
    await pic(S, `W-${st}`, [T('bid-actions')], { pad: 10 })
    await closeWin(S)
  }
  // day's list: Ace 19 Jan refused, then approved by the grey Approve
  await openCell(S, 'dj', '2026-01-19', 'daylist')
  let r = await read('[data-testid="daylist"] li:has([data-testid^="dl-approve-"])', '[data-testid="daylist"] li:has([data-testid^="dl-approve-"]) .dl-acts', "list refused")
  results.push(['list refused', r]); await pic(S, 'L-refused', ['[data-testid="daylist"] li:has([data-testid^="dl-approve-"]) .dl-acts'], { pad: 10 })
  await press(S, '[data-testid^="dl-approve-"]'); await sleep(page, 700)
  if (!(await isOpen(page, 'daylist'))) await openCell(S, 'dj', '2026-01-19', 'daylist')
  r = await read('[data-testid="daylist"] li:has([data-testid^="dl-approve-"])', '[data-testid="daylist"] li:has([data-testid^="dl-approve-"]) .dl-acts', "list approved")
  results.push(['list approved', r]); await pic(S, 'L-approved', ['[data-testid="daylist"] li:has([data-testid^="dl-approve-"]) .dl-acts'], { pad: 10 })
  for (const [label, { d, row }] of results) {
    const lit = d.find(b => /\blit\b/.test(b.cls))
    S.check(lit && lit.padL >= 1.5 && lit.padR >= 1.5 && !lit.clipped, `${label}: "${lit?.words}" and its mark ≥1.5px inside the edge`, lit && [lit.padL, lit.padR, lit.clipped])
    S.check(d.every(b => b.padL >= 1.5 && b.padR >= 1.5 && !b.clipped), `${label}: both decide buttons' marks and words inside`, d.map(b => [b.words, b.padL, b.padR]))
    const ws = row.map(x => x[1]), hs = row.map(x => x[2]), tops = new Set(row.map(x => x[3]))
    S.check(row.length === 4 ? Math.max(...ws) - Math.min(...ws) <= 0.6 : true, `${label}: four even columns`, ws)
    S.check(tops.size === 1 && Math.max(...hs) - Math.min(...hs) <= 0.6, `${label}: one row, one height`, { hs, tops: [...tops] })
    const mk = d[0].mark?.w
    S.check(+S.size.slice(1) < 380 ? mk === 11 : mk === 12, `${label}: mark ${mk}px (11 below 380, 12 at 390/402)`, mk)
  }
  S.data.results = results.map(([l, r]) => [l, r.d.map(b => ({ t: b.words, w: b.w, h: b.h, padL: b.padL, padR: b.padR, mark: b.mark?.w })), r.row])
})

/* 4. the narrow PC's pinned headings, the e2e test's own steps by hand (1000 x 733, member signed in, war role admin) */
await run('rw1-NARROWPC', ['d1000'], async S => {
  const page = S.page
  for (const fonts of ['app', 'verdana']) {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(BASE + '?fresh=1'); await page.waitForSelector('#luser')
    if (fonts === 'verdana') await page.addStyleTag({ content: '*, *::before, *::after { font-family: Verdana, "DejaVu Sans", sans-serif !important }' })
    await page.fill('#luser', 'us'); await page.fill('#lpass', 'us'); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached' })
    if (fonts === 'verdana') await page.addStyleTag({ content: '*, *::before, *::after { font-family: Verdana, "DejaVu Sans", sans-serif !important }' })
    await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-slipway"]', { state: 'attached' })
    await page.evaluate(() => window.lwSetViewer(null))
    await page.evaluate(() => { window.raptorRole('admin'); window.lwSetRole('admin') }); await sleep(page, 200)
    await page.setViewportSize({ width: 1000, height: 733 })
    await page.click('[data-testid="lw-tab-approvals"]'); await page.waitForSelector('[data-testid="approvals-page"]'); await sleep(page, 300)
    const geo = await page.evaluate(() => { const sc = document.querySelector('[data-testid="appr-scroll"]'); const c = document.querySelector('[data-testid="approvals-page"] .appr-cols'); const l = document.querySelector('[data-testid="approvals-page"] [data-testid^="appr-line-"]'); return { scW: sc.scrollWidth, scCW: sc.clientWidth, colsW: Math.round(c.getBoundingClientRect().width), lineW: Math.round(l.getBoundingClientRect().width), lineScrollW: l.scrollWidth, btns: [...l.querySelectorAll('button')].map(b => Math.round(b.getBoundingClientRect().width)) } })
    S.note(`${fonts} letters: geometry ${JSON.stringify(geo)}`)
    for (const [y, x] of [[60, 0], [120, 0], [200, 0], [120, 200]]) {
      await page.evaluate(([y, x]) => { const e = document.querySelector('[data-testid="appr-scroll"]'); e.scrollTop = y; e.scrollLeft = x }, [y, x])
      await sleep(page, 150)
      const leak = await page.evaluate(() => {
        const sc = document.querySelector('[data-testid="appr-scroll"]')
        const s = sc.getBoundingClientRect(), c = document.querySelector('[data-testid="approvals-page"] .appr-cols').getBoundingClientRect()
        const out = []
        for (const b of document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"] button')) {
          const r = b.getBoundingClientRect()
          const inStrip = r.bottom > c.top && r.top < c.bottom
          const seen = Math.max(r.left, s.left) < Math.min(r.right, s.left + sc.clientWidth)
          if (inStrip && seen && (r.right > c.right + 0.5 || r.left < c.left - 0.5)) out.push(`${b.textContent} ${Math.round(r.left)}–${Math.round(r.right)}, the headings to ${Math.round(c.right)}`)
        }
        return { out, scrollLeft: sc.scrollLeft, scrollTop: sc.scrollTop, colsRight: Math.round(c.right), colsLeft: Math.round(c.left) }
      })
      S.note(`${fonts} letters, list at ${y}, sideways ${x}: actual scroll ${leak.scrollTop}/${leak.scrollLeft}, headings ${leak.colsLeft}–${leak.colsRight}, leaks ${JSON.stringify(leak.out)}`)
      S.check(leak.out.length === 0, `${fonts} letters, list at ${y}, sideways ${x}: nothing shows past the headings`, leak.out)
      await pic(S, `${fonts}-y${y}-x${x}`, ['.appr-card'], { pad: 4 })
    }
  }
})

/* 5. Approvals' phone line at 402: a May half-day date */
await run('rw1-MAY', ['p402'], async S => {
  const page = S.page
  await signIn(S)
  const DD = '2026-05-28'
  await gotoMonth(S, DD)
  await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), T(`cell-${P}-${DD}`)); await sleep(page, 300)
  await press(S, T(`cell-${P}-${DD}`)); await sleep(page, 900)
  if (!(await isOpen(page))) throw new Error('no bid window on 28 May')
  await press(S, T('portion-pm')); await sleep(page, 300)
  await press(S, T('bid-LL')); await sleep(page, 800)
  if (await isOpen(page)) { await press(S, T('bid-LL')).catch(() => {}); await sleep(page, 700) }
  S.note('28 May: ' + await cellState(page, P, DD))
  if (/:a/.test(await cellState(page, P, DD))) { await press(S, T(`cell-${P}-${DD}`)); await sleep(page, 900); await press(S, T('decide-approve')); await sleep(page, 700); await closeWin(S) }
  S.note('28 May now: ' + await cellState(page, P, DD))
  await press(S, T('lw-tab-approvals')); await sleep(page, 900)
  const line = await page.evaluate(() => { const l = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')].find(x => /28 May/.test(x.innerText)); if (!l) return null; l.setAttribute('data-lwdl', 'may'); const d = l.querySelector('[data-testid="appr-dates"]'); const r = d.getBoundingClientRect(); return { text: d.innerText, h: Math.round(r.height), lh: parseFloat(getComputedStyle(d).lineHeight), btns: [...l.querySelectorAll('.appr-btns button')].map(b => Math.round(b.getBoundingClientRect().width)), rowH: Math.round(l.querySelector('.appr-l1')?.getBoundingClientRect().height || 0) } })
  S.note('the 28 May line: ' + JSON.stringify(line))
  if (!line) { S.note('NOT WALKED: no 28 May line in Approvals'); await pic(S, 'no-line', [], { full: true }); return }
  S.data.may = line
  await page.evaluate(() => document.querySelector('[data-lwdl="may"]').scrollIntoView({ block: 'center' })); await sleep(page, 300)
  await pic(S, 'may-line', ['[data-lwdl="may"]'], { pad: 12 })
  S.note('28 May PM date lines: ' + Math.round(line.h / (line.lh || 15)))
})
await closeBrowsers()
