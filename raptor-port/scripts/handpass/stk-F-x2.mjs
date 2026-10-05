/* Walker F — X-03, X-05 (a published role answer; a failed save of it), X-06 (phone menu + Insights cross under the
   band), X-07 (Logic's sticky search), X-08 (the phone's Desktop-layout Board and Insights). */
import * as F from './stk-F-lib.mjs'
import * as X from './stk-F-fx.mjs'
const { row, judge, sleep, pic } = F
const ERRS = []
const errTxt = e => String(e.stack).split('\n').slice(0, 3).join(' <- ')
const DI = 4
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const rowOf = (ins, name) => { for (const s of ins.secs) if (/FLYING LOAD/i.test(s.h)) { const r = s.rows.find(r => r.nm === name); if (r) return r } return null }

/* the shared fixture: a published conditional formation (cue unresolved), with a red Rally warning and (for X-03) a
   pending timing correction on the working copy */
async function publishedCond(p, { rallyRed = true } = {}) {
  await X.condDay(p, DI, {})
  await X.ensureLines(p, 'week', DI, 2)
  await X.setLine(p, 'week', DI, 0, '08:00 IN TIME')
  await X.setLine(p, 'week', DI, 1, rallyRed ? '10:00 RALLY' : '09:00 RALLY')
  await X.board(p, DI)
  const pub = await X.publish(p, DI)
  return pub
}

/* ---------------- X-03 ---------------- */
async function x03() {
  const c = await F.open('desk'); const { p } = c
  const id = 'X-03 (board, desk)'
  const pcs = []
  try {
    const checks = []
    const pub = await publishedCond(p)
    checks.push(['Friday published (all four signed): ' + JSON.stringify({ label: pub.label, ver: pub.ver }), pub.pressed && !!pub.ver, JSON.stringify(pub.signed)])
    const warnPub = (await X.warns(p, DI)).filter(w => /rally|suggested brief/i.test(w.msg))
    checks.push(['the published day carries a red Rally/brief warning', warnPub.some(w => w.sev === 'hard'), JSON.stringify(warnPub.map(w => w.sev + ' ' + w.msg))])
    /* a pending time correction on the working copy: Rally 10:00 → 09:30 */
    await X.setLine(p, 'board', DI, 1, '09:30 RALLY')
    const h0 = await X.head(p, DI)
    const s0 = await X.snap(p)
    const pend0 = await p.evaluate(d => window.pendCount(d), DI)
    const ins0 = await X.insights(p, { door: 'board' }); await X.insightsClose(p)
    const r0 = { echo: rowOf(ins0, 'Echo'), ranger: rowOf(ins0, 'Ranger') }
    pcs.push(await pic(p, 'x03-before'))
    checks.push(['a timing correction is pending on the working copy (' + pend0 + ' pending)', pend0 >= 1, JSON.stringify(h0)])
    /* answer on the latest published view */
    await X.previewLatest(p, pub.ver)
    const qtext = await X.answerPublished(p, 'red')
    const s1 = await X.snap(p)
    const pend1 = await p.evaluate(d => window.pendCount(d), DI)
    const ins1 = await X.insights(p, { door: 'board' }); await X.insightsClose(p)
    await X.backToLive(p, DI); const h1 = await X.head(p, DI)
    const r1 = { echo: rowOf(ins1, 'Echo'), ranger: rowOf(ins1, 'Ranger') }
    pcs.push(await pic(p, 'x03-after-answer'))
    checks.push(['the question named the published context: "' + qtext.replace(/\s+/g, ' ').slice(0, 80) + '"', /Published/.test(qtext), qtext.slice(0, 120)])
    checks.push(['programme bytes and the book of versions / sign-offs / pending are unchanged by the answer', s1.days === s0.days && s1.book === s0.book, 'days same ' + (s1.days === s0.days) + ', book same ' + (s1.book === s0.book)])
    console.log('X03 h0', JSON.stringify(h0)); console.log('X03 h1', JSON.stringify(h1))
    checks.push(['the timing correction is STILL pending (count ' + pend0 + ' → ' + pend1 + ') and the four sign-offs are untouched', pend1 === pend0 && same(h1.signs, h0.signs) && h1.tag === h0.tag, JSON.stringify({ before: h0, after: h1 })])
    const rr = r1.ranger || r1.echo
    checks.push(['Insights changed at once: the formation’s crew went from a total-only bar to a Blue/Red split', !!(r0.ranger && r0.ranger.red == null) && !!(r1.ranger && r1.ranger.red != null), JSON.stringify({ before: r0.ranger && r0.ranger.txt, after: r1.ranger && r1.ranger.txt, echoBefore: r0.echo && r0.echo.txt, echoAfter: r1.echo && r1.echo.txt })])
    checks.push(['no amendment was made: one extra command only, a role-answer line', s1.seq === s0.seq + 1 || s1.seq === s0.seq + 2, `seq ${s0.seq} → ${s1.seq}; role lines ${s0.roleLines} → ${s1.roleLines}`])
    const w1 = await p.evaluate(d => window.DAYS[d].waves[0].intimes.slice(), DI)
    checks.push(['the working copy’s Rally is still 09:30 (not published by the answer)', /09:30/.test(w1[1] || ''), JSON.stringify(w1)])
    judge(id, 'Friday published with a red Rally warning; Rally corrected on the working copy (pending); on the latest-published view answered Red; pending, sign-offs and Insights read before/after', checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, 'x03-err') }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- X-05 ---------------- */
async function x05() {
  const c = await F.open('desk'); const { p } = c
  const id = 'X-05 (board, desk)'
  const pcs = []
  try {
    const checks = []
    await X.condDay(p, DI, {})
    await X.board(p, DI)
    const pub = await X.publish(p, DI)
    checks.push(['Friday published with four sign-offs', pub.pressed && !!pub.ver, JSON.stringify(pub.signed)])
    const h0 = await X.head(p, DI)
    const pc0 = await p.evaluate(d => window.pendCount(d), DI)
    const s0 = await X.snap(p)
    await X.previewLatest(p, pub.ver)
    await F.breakStorage(p)
    const qtext = await X.answerPublished(p, 'red')
    const up = await p.waitForSelector('.topbar > .savestat.failed, #schedBoard .saveband', { timeout: 15000 }).then(() => true, () => false)
    await sleep(400)
    pcs.push(await pic(p, 'x05-failed'))
    const s1 = await X.snap(p)
    checks.push(['answered Red on the published view while storage refuses: the board shows the warning band', up && (await p.locator('#schedBoard .saveband').count()) > 0, 'question: ' + qtext.replace(/\s+/g, ' ').slice(0, 60)])
    checks.push(['the programme / book are unchanged and one role-history line exists after the answer', s1.days === s0.days && s1.book === s0.book && s1.roleLines === s0.roleLines + 1, `role lines ${s0.roleLines} → ${s1.roleLines}`])
    /* Retry while failing, twice */
    await F.pressRetry(c, '#schedBoard .saveband button'); await sleep(1200)
    await F.pressRetry(c, '#schedBoard .saveband button'); await sleep(1200)
    const s2 = await X.snap(p)
    checks.push(['Retry while still failing: the warning stays, nothing duplicated (role lines ' + s2.roleLines + ', commands ' + s1.seq + ' → ' + s2.seq + ')', (await p.locator('#schedBoard .saveband').count()) === 1 && s2.roleLines === s1.roleLines && s2.seq === s1.seq, ''])
    await F.fixOnRetryPress(p)
    await F.pressRetry(c, '#schedBoard .saveband button')
    const gone = await p.waitForFunction(() => !document.querySelector('.saveband') && !document.querySelector('.topbar > .savestat'), null, { timeout: 9000 }).then(() => true, () => false)
    await sleep(800)
    const s3 = await X.snap(p)
    await X.backToLive(p, DI); const h3 = await X.head(p, DI)
    pcs.push(await pic(p, 'x05-saved'))
    checks.push(['Retry with storage restored saved: the warning went', gone])
    console.log('X05 h0', JSON.stringify(h0)); console.log('X05 h3', JSON.stringify(h3))
    const pc3 = await p.evaluate(d => window.pendCount(d), DI)
    checks.push(['after the successful Retry: programme, book and sign-offs as before; the amendment count (N pending) unchanged (' + pc0 + ' → ' + pc3 + '); exactly one role-history line (the day’s changes chip reads "' + h0.pending + '" → "' + h3.pending + '": the answer’s own history line)', s3.days === s0.days && s3.book === s0.book && same(h3.signs, h0.signs) && pc3 === pc0 && s3.roleLines === s0.roleLines + 1, JSON.stringify({ roleLines: [s0.roleLines, s3.roleLines], signed: h3.signed })])
    await X.insights(p, { door: 'board' }).then(async i => { checks.push(['Insights shows the answer before the reload', !!rowOf(i, 'Ranger') && rowOf(i, 'Ranger').red != null, JSON.stringify(rowOf(i, 'Ranger') && rowOf(i, 'Ranger').txt)]); await X.insightsClose(p) })
    /* reload */
    await sleep(600)
    await X.relog(p)
    await F.go(p, 'editsched'); await X.board(p, DI)
    const ver = await p.evaluate(d => window.dayCurVer(d), DI)
    await X.previewLatest(p, ver)
    const f = p.locator('#schedBoard [data-role-remarks]').first(); await f.click(); await sleep(250)
    const label = await p.locator('[data-role-choose]').first().innerText().catch(() => 'none')
    const ins = await X.insights(p, { door: 'board' }); await X.insightsClose(p)
    const s4 = await X.snap(p)
    pcs.push(await pic(p, 'x05-reloaded'))
    checks.push(['after a reload and sign-in the answer is still there: the button reads "' + label + '" (not "Choose")', /Change/i.test(label), label])
    checks.push(['Insights after the reload still shows the Red answer', !!rowOf(ins, 'Ranger') && rowOf(ins, 'Ranger').red != null, JSON.stringify(rowOf(ins, 'Ranger') && rowOf(ins, 'Ranger').txt)])
    checks.push(['exactly one role-history line after the reload', s4.roleLines === 1, 'lines ' + s4.roleLines])
    judge(id, 'published conditional formation; answered Red on the latest-published view with storage refusing; Retry failing twice; then restored + Retry; reload', checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, 'x05-err') }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- X-06 ---------------- */
async function x06(sizeKey) {
  const c = await F.open(sizeKey); const { p } = c
  const id = `X-06 (${sizeKey})`
  const pcs = []
  try {
    const checks = []
    checks.push(['warning up through an ordinary edit', await F.failNow(p)])
    for (const [pg, ids] of [['viewsched', 'viewSched'], ['editsched', 'editSched']]) {
      await F.go(p, pg); await p.evaluate(() => window.scrollTo(0, 0)); await sleep(500)
      const tp = async (sel, label) => { const bb = await p.locator(sel).first().boundingBox({ timeout: 4000 }).catch(() => null); if (!bb) return { label, found: false }; const r = await F.realPress(c, { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }); return { label, found: true, ...r } }
      const o1 = await tp(`#${ids}More`, 'More')
      const menuOwn = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return 'absent'; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h && (h === e || e.contains(h)) ? 'own' : 'COVERED by ' + (h && (h.id || h.className)) }, `#${ids}MoreInsights`)
      pcs.push(await pic(p, `x06-${pg}-menu-${sizeKey}`, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 320) }))
      const o2 = await tp(`#${ids}MoreInsights`, 'Insights')
      await p.waitForSelector('#insightClose', { timeout: 5000 }).catch(() => {})
      const all = p.locator('[data-insights-all]'); let o3 = { label: 'Show all', found: false }
      if (await all.count()) { const bb = await all.first().boundingBox(); await all.first().evaluate(e => e.scrollIntoView({ block: 'center' })); const bb2 = await all.first().boundingBox(); o3 = { label: 'Show all', found: true, ...(await F.realPress(c, { x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height / 2 })) } }
      /* scroll the window to its bottom */
      const bx = await p.locator('#insightModal .modal-box').first().boundingBox()
      await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.wheel(0, 4000); await sleep(400)
      const cross = await p.evaluate(() => { const e = document.querySelector('#insightClose'); const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { own: !!h && (h === e || e.contains(h)), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth } })
      pcs.push(await pic(p, `x06-${pg}-insights-bottom-${sizeKey}`))
      const o4 = await tp('#insightClose', 'close cross')
      await sleep(400)
      const closed = (await p.locator('#insightModal:visible').count()) === 0
      const back = await F.look(p, '.topbar > .savestat')
      checks.push([`${pg}: More button took its press [${o1.clickAt}]; menu item Insights is ${menuOwn}; Insights took its press [${o2.clickAt}]`, o1.found && /More/i.test(String(o1.clickAt)) && menuOwn === 'own' && o2.found && o2.clickAt && o2.clickAt !== 'RETRY', JSON.stringify({ o1, menuOwn, o2 })])
      checks.push([`${pg}: Show all ${o3.found ? 'took its press [' + o3.clickAt + ']' : 'not offered (fewer than 12 flyers)'}; scrolled to the bottom the cross is on screen and its own target`, (!o3.found || (o3.clickAt && o3.clickAt !== 'RETRY')) && cross.own && cross.inView, JSON.stringify({ o3, cross })])
      checks.push([`${pg}: the cross took its press [${o4.clickAt}] and closed the window; the failed-save warning is still seen on the bar`, o4.clickAt && o4.clickAt !== 'RETRY' && closed && back.seen, JSON.stringify({ closed, back: back.box })])
    }
    judge(id, 'warning up; on View-only Sched and Edit Schedule: ⋯ More → Insights → Show all → scrolled to the bottom → ✕', checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, `x06-err-${sizeKey}`) }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- X-07 ---------------- */
async function x07(sizeKey) {
  const c = await F.open(sizeKey); const { p } = c
  const id = `X-07 (${sizeKey})`
  const pcs = []
  try {
    const checks = []
    checks.push(['warning up through an ordinary edit', await F.failNow(p)])
    await F.go(p, 'logic'); await sleep(500)
    const geo = () => p.evaluate(() => { const bar = document.querySelector('.topbar').getBoundingClientRect(); const lb = document.querySelector('.lgbar').getBoundingClientRect(); const s = document.querySelector('#lgSearch'); const sr = s.getBoundingClientRect(); const h = document.elementFromPoint(sr.left + sr.width / 2, sr.top + sr.height / 2); return { barBottom: Math.round(bar.bottom), lgTop: Math.round(lb.top), gap: Math.round(lb.top - bar.bottom), scrollY: Math.round(window.scrollY), searchOwn: !!h && (h === s || s.contains(h)), failed: !!document.querySelector('.topbar > .savestat.failed'), barH: Math.round(bar.height) } })
    const scroll = async dy => { const b = await p.locator('#lgBody').boundingBox(); await p.mouse.move(b.x + b.width / 2, Math.min(c.size.height - 60, b.y + 200)); await p.mouse.wheel(0, dy); await sleep(350) }
    await scroll(900)
    const g1 = await geo()
    pcs.push(await pic(p, `x07-scrolled-failed-${sizeKey}`, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 330) }))
    checks.push(['scrolled with the band up: the page really scrolled and the search bar sits right under the bar (gap ' + g1.gap + 'px)', g1.scrollY > 0 && Math.abs(g1.gap) <= 2 && g1.searchOwn && g1.failed, JSON.stringify(g1)])
    /* search 'reporting', filters */
    const cnt = async () => (await p.locator('#lgCount').innerText().catch(() => '')).replace(/\s+/g, ' ')
    const s = p.locator('#lgSearch'); await s.click(); await s.fill(''); await p.keyboard.type('report', { delay: 30 }); await sleep(500)
    const c1 = await cnt(); const body1 = (await p.locator('#lgBody').innerText()).slice(0, 200)
    const filt = []
    for (const f of ['hard', 'adv', 'note', 'fired', 'all']) { await p.locator(`[data-lgf="${f}"]`).first().click(); await sleep(250); const g = await geo(); filt.push(f + ':' + g.gap + (g.searchOwn ? '' : '(COVERED)')) }
    const g2 = await geo()
    checks.push(['typed "report": rows narrowed (count: ' + c1 + '); filter buttons pressed (' + filt.join(' ') + '); search stays the thing a finger lands on', /\d/.test(c1) && g2.searchOwn && filt.every(x => !/COVERED/.test(x)), JSON.stringify({ c1, body1: body1.slice(0, 80) })])
    /* the search narrows the page, so the list is cleared and the page scrolled down again before the Retry */
    await s.click(); await s.fill(''); await p.locator('[data-lgf="all"]').first().click(); await sleep(400)
    await scroll(900)
    const g2b = await geo()
    checks.push(['search cleared and the page scrolled down again with the band still up (gap ' + g2b.gap + 'px, scrollY ' + g2b.scrollY + ')', g2b.scrollY > 0 && Math.abs(g2b.gap) <= 2 && g2b.failed, JSON.stringify(g2b)])
    /* Retry success */
    await F.fixOnRetryPress(p)
    await F.pressRetry(c)
    const gone = await p.waitForFunction(() => !document.querySelector('.topbar > .savestat'), null, { timeout: 9000 }).then(() => true, () => false)
    await sleep(600)
    const g3 = await geo()
    pcs.push(await pic(p, `x07-after-retry-${sizeKey}`, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 330) }))
    checks.push(['Retry succeeded: the band is gone (bar ' + g2b.barH + ' → ' + g3.barH + 'px); the search bar follows the SHORTER bar without a return to the top (gap ' + g3.gap + 'px, scrollY ' + g3.scrollY + ')', gone && g3.barH < g2b.barH && Math.abs(g3.gap) <= 2 && g3.scrollY > 0 && g3.searchOwn, JSON.stringify(g3)])
    /* keep searching */
    await scroll(300)
    await s.click(); await s.fill(''); await p.keyboard.type('rest', { delay: 30 }); await sleep(500)
    const c2 = await cnt(); const g4 = await geo()
    const act = await p.evaluate(() => document.activeElement && document.activeElement.id)
    checks.push(['searched "rest" afterwards without scrolling back up: results ' + c2 + ', focus stayed in the search box (' + act + '), bar gap ' + g4.gap + 'px', act === 'lgSearch' && Math.abs(g4.gap) <= 2 && /\d/.test(c2) && c2 !== c1, JSON.stringify(g4)])
    judge(id, 'warning up; Logic scrolled; searched "report", filters pressed; Retry succeeded; scrolled and searched "rest"', checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, `x07-err-${sizeKey}`) }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- X-08 ---------------- */
async function x08() {
  const c = await F.open('phone'); const { p } = c
  const id = 'X-08 (phone 390x844)'
  const pcs = []
  try {
    const checks = []
    await F.go(p, 'editsched'); await sleep(500)
    const dayBtn = p.locator('#eWeek [data-sbday="2"]:visible').first(); await dayBtn.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
    const bb = await dayBtn.boundingBox(); await c.press(bb.x + bb.width / 2, bb.y + bb.height / 2)
    await p.waitForSelector('#schedBoard:not([hidden])', { timeout: 8000 }); await sleep(600)
    const tap = async sel => { const b = await p.locator(sel).first().boundingBox(); await c.press(b.x + b.width / 2, b.y + b.height / 2) }
    await tap('#sbMore'); await sleep(300); await tap('#sbMoreWide'); await sleep(900)
    const wide = await p.evaluate(() => ({ cls: document.querySelector('#schedBoard').className, day: window.SBDAY, sections: [...document.querySelectorAll('#schedBoard .sb-go-h, #schedBoard .sb-ph, #schedBoard .ap-h')].filter(e => e.getBoundingClientRect().width > 0).length }))
    checks.push(['Desktop layout on (class ' + wide.cls.replace(/\s+/g, ' ').slice(0, 40) + '), the day is Wednesday (SBDAY ' + wide.day + ') and sections are drawn (' + wide.sections + ')', /sb-wide/.test(wide.cls) && wide.day === 2 && wide.sections > 3, JSON.stringify(wide)])
    /* scroll sideways to the Remarks column: a wheel/pan that starts over the board's top bar (the only place a sideways pan takes; the same gesture over the schedule's body does not move the board — recorded below) */
    const left = () => p.evaluate(() => document.querySelector('#schedBoard').scrollLeft)
    const moreBox = () => p.locator('#sbMore').first().boundingBox()
    await p.mouse.move(200, 400); await p.mouse.wheel(500, 0); await sleep(400)
    const overBody = await left()
    await p.mouse.move(200, 20); await p.mouse.wheel(1000, 0); await sleep(500)
    const sx = { left: await left(), max: await p.evaluate(() => { const b = document.querySelector('#schedBoard'); return b.scrollWidth - b.clientWidth }) }
    const moreFar = await moreBox()
    pcs.push(await pic(p, 'x08-wide-scrolled-far'))
    checks.push(['scrolled sideways to the far right by a pan over the top bar (' + JSON.stringify(sx) + '); the same pan over the schedule body moved the board ' + overBody + 'px (RECORDED)', sx.left > 0 && sx.left >= sx.max - 4, 'More button at x=' + (moreFar && Math.round(moreFar.x)) + ' (screen is 390 wide) with the board at its far right'])
    /* first pan back just far enough for More to appear at the right edge: its menu must still fit the screen */
    await p.mouse.move(200, 20); await p.mouse.wheel(-500, 0); await sleep(500)
    const edgeLeft = await left(); const edgeBox = await moreBox()
    if (edgeBox) { await c.press(edgeBox.x + edgeBox.width / 2, edgeBox.y + edgeBox.height / 2); await sleep(400) }
    const edgeMenu = await p.evaluate(() => { const m = document.querySelector('#sbMoreMenu'); if (!m) return null; const r = m.getBoundingClientRect(); const it = document.querySelector('#sbMoreInsights'); const q = it.getBoundingClientRect(); const h = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return { box: [r.left, r.top, r.width, r.height].map(Math.round), insightsCentreOwn: !!h && (h === it || it.contains(h)), right: Math.round(r.right), vw: innerWidth } })
    pcs.push(await pic(p, 'x08-more-menu-at-right-edge'))
    checks.push(['More at the right edge (board panned to ' + edgeLeft + ', More at x=' + (edgeBox && Math.round(edgeBox.x)) + '): its menu stays inside the screen and the Insights item can be pressed in its middle', !!edgeMenu && edgeMenu.right <= edgeMenu.vw && edgeMenu.insightsCentreOwn, JSON.stringify(edgeMenu)])
    if (edgeMenu) { await c.press(edgeBox.x + edgeBox.width / 2, edgeBox.y + edgeBox.height / 2); await sleep(400) }   // More again closes the menu
    await p.mouse.move(200, 20); await p.mouse.wheel(-(edgeLeft - 500), 0); await sleep(500)
    const sx2 = await left(); const moreNear = await moreBox()
    checks.push(['panned back until the More button is on screen (left ' + sx2 + ', More at x=' + (moreNear && Math.round(moreNear.x)) + ')', !!moreNear && moreNear.x >= 0 && moreNear.x + moreNear.width <= 390, JSON.stringify(moreNear)])
    const sel = '#schedBoard'
    /* Insights from More */
    await tap('#sbMore'); await sleep(300); await tap('#sbMoreInsights'); await p.waitForSelector('#insightModal', { state: 'visible', timeout: 6000 }); await sleep(500)
    const above = await p.evaluate(() => { const m = document.querySelector('#insightModal'); const mb = m.querySelector('.modal-box') || m; const r = mb.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 200)); const cl = document.querySelector('#insightClose').getBoundingClientRect(); const ch = document.elementFromPoint(cl.left + cl.width / 2, cl.top + cl.height / 2); return { inModal: !!h && m.contains(h), closeOwn: !!ch && (ch.id === 'insightClose' || ch.closest('#insightClose')), z: getComputedStyle(m).zIndex, boardZ: getComputedStyle(document.querySelector('#schedBoard')).zIndex } })
    pcs.push(await pic(p, 'x08-insights-over-board'))
    const bx = await p.locator('#insightModal .modal-box').first().boundingBox()
    await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.wheel(0, 3000); await sleep(400)
    checks.push(['Insights opened ABOVE the Board (a press in the middle lands in the window; its cross is the topmost thing there; z ' + above.z + ' vs board ' + above.boardZ + ')', above.inModal && !!above.closeOwn, JSON.stringify(above)])
    await tap('#insightClose'); await sleep(500)
    const after = await p.evaluate(s => { const e = document.querySelector(s); return { day: window.SBDAY, cls: document.querySelector('#schedBoard').className, left: e ? Math.round(e.scrollLeft) : null, sections: [...document.querySelectorAll('#schedBoard .sb-go-h, #schedBoard .sb-ph, #schedBoard .ap-h')].filter(e => e.getBoundingClientRect().width > 0).length, modal: !!document.querySelector('#insightModal:not([hidden])') && document.querySelector('#insightModal').offsetParent !== null } }, sel)
    pcs.push(await pic(p, 'x08-after-close'))
    checks.push(['closed: still Wednesday, still the Desktop layout, scroll position kept (' + sx2 + ' → ' + after.left + '), sections drawn (' + after.sections + ')', after.day === 2 && /sb-wide/.test(after.cls) && Math.abs(after.left - sx2) <= 4 && after.sections > 3 && !after.modal, JSON.stringify(after)])
    /* back to Phone layout */
    await tap('#sbMore'); await sleep(300)
    const lbl = await p.locator('#sbMoreWide').first().innerText().catch(() => '')
    await tap('#sbMoreWide'); await sleep(900)
    const ph = await p.evaluate(() => ({ cls: document.querySelector('#schedBoard').className, day: window.SBDAY, sections: [...document.querySelectorAll('#schedBoard .sb-go-h, #schedBoard .sb-ph, #schedBoard .ap-h')].filter(e => e.getBoundingClientRect().width > 0).length, blank: !document.querySelector('#schedBoard').innerText.trim() }))
    pcs.push(await pic(p, 'x08-phone-layout-back'))
    checks.push(['back to Phone layout (menu said "' + lbl.trim() + '"): the day and its sections are drawn, not blank (' + ph.sections + ' headings)', !/sb-wide/.test(ph.cls) && ph.day === 2 && ph.sections > 3 && !ph.blank, JSON.stringify(ph)])
    judge(id, 'phone Board on Wednesday → More → Desktop layout; scrolled sideways; More → Insights; scrolled, ✕; More → back to Phone layout', checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, 'x08-err') }
  ERRS.push(...c.errors); await c.browser.close()
}

const only = (process.env.F_ONLY || '').split(',').filter(Boolean)
const want = k => !only.length || only.includes(k)
if (want('3')) await x03()
if (want('5')) await x05()
if (want('6')) { await x06('phone'); await x06('p320') }
if (want('7')) { await x07('desk'); await x07('phone') }
if (want('8')) await x08()
console.log('ERRORS', ERRS.length ? ERRS.join(' | ') : 'none')
F.savePart('x2-' + (process.env.F_RUN || 'x'), { errors: ERRS, pics: F.pics })
