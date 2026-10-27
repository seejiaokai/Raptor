// Re-walk walker B, B6: the bell on a phone. Ranger bids on 13 separate days; the admin approves each one by one, opens Apr and Jun
// and closes Jun for bidding; Ranger's bell: capitals on "Bidding", the list scrolls inside, "Mark all read" at its foot, "↓ N more".
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk2'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-rw2-f7 v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
const days = ['2026-01-06', '2026-01-08', '2026-01-12', '2026-01-14', '2026-01-16', '2026-01-20', '2026-01-22', '2026-01-26', '2026-01-28', '2026-01-30', '2026-02-03', '2026-02-05', '2026-02-09']
const MORE = /↓\s*\d+\s*more/
try {
  await B.signIn(w, 'member')
  let placedN = 0
  for (const d of days) { await L.openCell(w, 'bane', d); if (await L.placeLeave(w, 'LL')) placedN++; await B.sleep(w, 200) }
  rec('F7 fixture: Ranger placed 13 bids', 'phone', placedN === 13 ? 'PASS' : 'NOT WALKED', `${placedN} placed`, [])
  await B.switchTo(w, 'admin')
  await B.openApprovals(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 250)
  const n = await P.evaluate(() => [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid="appr-line-bane"]')].length)
  console.log('Ranger lines in Approvals:', n)
  for (let i = 0; i < n; i++) {
    await P.evaluate(i => { const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid="appr-line-bane"]')]; ls.forEach(l => l.removeAttribute('data-walk')); ls[i].setAttribute('data-walk', 'r') }, i)
    await B.press(w, '[data-walk="r"] [data-testid="appr-approve"]', null); await B.sleep(w, 350)
  }
  const lit = await P.evaluate(() => [...document.querySelectorAll('[data-testid="appr-line-bane"]')].filter(l => /lit-approved/.test(l.className)).length)
  rec('F7 fixture: the admin approved each of Ranger\'s lines one by one', 'phone', lit === n && n >= 12 ? 'PASS' : 'NOT WALKED', `${lit} of ${n} lit approved`, [])
  await B.openGrid(w)
  /* open Apr and Jun, close Jun */
  const openDates = async () => { await B.press(w, T('open-chip')); await P.waitForSelector(T('open-dates'), { state: 'visible' }); await B.sleep(w, 500) }
  const closeDates = async () => { await B.press(w, T('open-dates-close')); await B.sleep(w, 400) }
  await openDates(); await B.press(w, T('od-month-2026-04')); await B.sleep(w, 500); await B.press(w, T('od-month-2026-06')); await B.sleep(w, 500)
  await shot(w, 'f7-open-dates-both')
  await B.press(w, T('od-month-2026-06')); await B.sleep(w, 500)
  await shot(w, 'f7-open-dates-jun-closed')
  await closeDates()
  await B.switchTo(w, 'member')
  await B.press(w, '#notifyBell', 'f7-bell-q'); await B.sleep(w, 700)
  await shot(w, 'f7-bell-open')
  const bl = await B.bellLines(P)
  console.log('bell lines:', bl.length); bl.forEach(l => console.log('   ', l.unread ? '*' : ' ', l.text))
  const bidding = bl.filter(l => /bidding/i.test(l.text))
  rec('F7 the bell\'s bidding lines start "Bidding" with a capital', 'phone', bidding.length >= 2 && bidding.every(l => /\bBidding (open|closed)/.test(l.text) && !/\bbidding (open|closed)/.test(l.text)) ? 'PASS' : (bidding.length ? 'FAIL' : 'NOT WALKED'), `${bidding.length} bidding lines: ${bidding.map(l => l.text).join(' | ')}`, ['f7-bell-open'])
  const g = await P.evaluate(re => {
    const rx = new RegExp(re)
    const list = document.querySelector('[data-testid="bell-list"]')
    const btns = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().height > 0 && /mark all read/i.test(b.innerText))
    const more = [...document.querySelectorAll('*')].filter(b => b.children.length === 0 && b.getBoundingClientRect().height > 0 && rx.test(b.textContent))
    const box = el => { const r = el.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right) } }
    const inner = [...list.querySelectorAll('*')].map(e => ({ e, c: getComputedStyle(e) })).filter(x => ['auto', 'scroll'].includes(x.c.overflowY)).map(x => ({ tag: x.e.tagName + '.' + String(x.e.className).slice(0, 30), ov: x.c.overflowY, sh: x.e.scrollHeight, ch: x.e.clientHeight }))[0]
    return { inner, mark: btns.map(box), markTxt: btns.map(b => b.innerText), more: more.map(m => ({ txt: m.textContent.trim(), ...box(m) })), vh: innerHeight, scrollY: scrollY }
  }, MORE.source)
  console.log('bell geometry:', JSON.stringify(g))
  const sc = g.inner
  rec('F7 the list scrolls inside the bell (it overflows and has its own scroll)', 'phone', sc && sc.sh > sc.ch + 4 ? 'PASS' : 'FAIL', `inner scroller ${JSON.stringify(sc)}`, ['f7-bell-open'])
  rec('F7 "Mark all read" stands at the foot and is on screen', 'phone', g.mark.length === 1 && g.mark[0].b <= g.vh && g.mark[0].t > 0 ? 'PASS' : 'FAIL', `button ${JSON.stringify(g.mark)} screen height ${g.vh}`, ['f7-bell-open'])
  rec('F7 "↓ N more" shows while lines are below', 'phone', g.more[0] ? 'PASS' : 'FAIL', `cue ${JSON.stringify(g.more)}`, ['f7-bell-open'])
  const swipe = async (x, y0, y1) => {
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] })
    for (let i = 1; i <= 6; i++) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + (y1 - y0) * i / 6 }] }); await P.waitForTimeout(10) }
    await P.waitForTimeout(90); await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  const scr = () => P.evaluate(re => { const rx = new RegExp(re); const list = document.querySelector('[data-testid="bell-list"]'); const e = [...list.querySelectorAll('*')].find(x => ['auto', 'scroll'].includes(getComputedStyle(x).overflowY)); return { st: e ? Math.round(e.scrollTop) : null, max: e ? e.scrollHeight - e.clientHeight : null, page: Math.round(scrollY), more: [...document.querySelectorAll('*')].some(b => b.children.length === 0 && b.getBoundingClientRect().height > 0 && rx.test(b.textContent)) } }, MORE.source)
  /* a finger that begins on the bell's FOOT (the "N more" strip) and drags up */
  const foot = await P.evaluate(re => { const rx = new RegExp(re); const m = [...document.querySelectorAll('*')].find(b => b.children.length === 0 && b.getBoundingClientRect().height > 0 && rx.test(b.textContent)); const r = m.getBoundingClientRect(); return { x: 200, y: Math.round((r.top + r.bottom) / 2) } }, MORE.source)
  const pageMax = await P.evaluate(() => Math.round(document.scrollingElement.scrollHeight - innerHeight)); console.log('page scrollable range behind the bell:', pageMax)
  const sf0 = await scr()
  await swipe(foot.x, foot.y, foot.y - 300); await B.sleep(w, 700)
  const sf1 = await scr(); await shot(w, 'f7-bell-foot-swipe')
  const foot2 = await P.evaluate(re => { const rx = new RegExp(re); const m = [...document.querySelectorAll('*')].find(b => b.children.length === 0 && b.getBoundingClientRect().height > 0 && rx.test(b.textContent)); if (!m) return null; const r = m.getBoundingClientRect(); return { x: 200, y: Math.round((r.top + r.bottom) / 2) } }, MORE.source)
  let sf2 = null; if (foot2) { await swipe(foot2.x, foot2.y, foot2.y + 200); await B.sleep(w, 700); sf2 = await scr() }
  console.log('foot swipe up:', JSON.stringify(sf0), '->', JSON.stringify(sf1), '; then down from the strip:', JSON.stringify(sf2))
  rec('F7 (D686) a finger that begins on the bell\'s foot does not scroll the page behind it', 'phone', sf1.page === sf0.page && (!sf2 || sf2.page === sf0.page) ? 'PASS' : 'FAIL', `page scrollable range ${pageMax}; swipe began at y=${foot.y} (the "N more" strip), dragged up 300 then down 200; page scrollY ${sf0.page} -> ${sf1.page} -> ${sf2 && sf2.page}; list scrollTop ${sf0.st} -> ${sf1.st}`, ['f7-bell-foot-swipe'])
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 400)
  const s0 = await scr()
  await swipe(200, 430, 110); await B.sleep(w, 700)
  const s1 = await scr(); await shot(w, 'f7-bell-scrolled-once')
  rec('F7 a finger scroll inside the bell moves its list, not the page', 'phone', s1.st > s0.st && s1.page === s0.page ? 'PASS' : 'FAIL', `list scrollTop ${s0.st} -> ${s1.st} (max ${s0.max}); page scrollY ${s0.page} -> ${s1.page}`, ['f7-bell-scrolled-once'])
  for (let i = 0; i < 6; i++) { await swipe(200, 430, 110); await B.sleep(w, 500) }
  const s2 = await scr(); await shot(w, 'f7-bell-end')
  const markEnd = await P.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.getBoundingClientRect().height > 0 && /mark all read/i.test(b.innerText)); const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { t: Math.round(r.top), b: Math.round(r.bottom), onTop: b === h || b.contains(h) } })
  rec('F7 at the end of the list "↓ N more" is gone and Mark all read is still reachable', 'phone', s2.st >= s2.max - 2 && !s2.more && markEnd.onTop ? 'PASS' : 'FAIL', `scrollTop ${s2.st}/${s2.max}; cue present ${s2.more}; Mark all read ${JSON.stringify(markEnd)}`, ['f7-bell-end'])
  await B.press(w, 'button:has-text("Mark all read")', 'f7-markall-q'); await B.sleep(w, 600); await shot(w, 'f7-markall')
  const after = await B.bellLines(P)
  rec('F7 Mark all read marks every line read', 'phone', after.length > 0 && after.every(l => !l.unread) ? 'PASS' : 'FAIL', `${after.filter(l => l.unread).length} of ${after.length} still unread`, ['f7-markall-q', 'f7-markall'])
} catch (e) { rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 'f7-error').catch(() => {}) }
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('f7')
await B.closeAll()
console.log('DONE')
