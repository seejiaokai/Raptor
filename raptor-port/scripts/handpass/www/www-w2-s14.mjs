/* www W2 extras 2: (d) Sunday "Breaks Monday" trace by tapping the Sunday puck; (b) day details from a look at a published version.
   usage (from raptor-port/): [PHONE=1] node scripts/handpass/www/www-w2-s14.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's14-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w2-lib2.mjs')
const { X, say, sleep, L } = H
const P = PHONE ? 'p' : 'd', size = PHONE ? '402' : '1536'
const R = (did, exp, saw, v, pic) => X.row('extras d,b', size, did, exp, saw, v, pic)
say('www-w2-s14 v1', size)
const w = await X.open({ phone: PHONE })
const { page } = w
const FRI = X.FRI, SUN = X.SUN, MON = X.MON
async function gotoWeek(v, iso) {
  if (await page.evaluate(() => !!document.querySelector('#schedBoard'))) await X.closeBoard(w)
  await L.go(page, 'editsched'); await sleep(300)
  if (!PHONE) await X.press(w, `[data-wk="${v}"]`)
  else { await X.press(w, '.filt-cal'); await page.waitForSelector('#weekCal:not([hidden]) .airpop-box', { timeout: 5000 }); await X.press(w, `#weekCal [data-iso="${iso}"]`) }
  await page.waitForFunction(x => window.CURWEEK === x, v, { timeout: 5000 }); await sleep(500)
}
const CUR = ['13/07/2026', '2026-07-13'], NXT = ['20/07/2026', '2026-07-20']
const havoc = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Havoc'))
// (d)
await X.board(w, SUN)
await H.frFlight(w, SUN, '23:30', '', havoc, 'LATE FLT')
await X.closeBoard(w)
await gotoWeek(...NXT)
await X.board(w, MON)
await H.frFlight(w, MON, '16:00', '', havoc, 'HAV MON')
const mon = await H.bwf(w, /Havoc/)
await X.pic(w, `14-d1-monday-${P}`)
R('(d) next week Monday: flight T/O 16:00 for Havoc after the Sunday 23:30 flight (landing blank)', 'a crew-rest line saying landing assumed 00:30 ... needs 12h', JSON.stringify(mon), mon.some(l => /assumed 00:30/.test(l)) ? 'PASS' : 'RECORDED', `14-d1-monday-${P}.png`)
await X.closeBoard(w)
await gotoWeek(...CUR)
const tr = await X.trace(w, '#eWeek', SUN, havoc)
await X.pic(w, `14-d2-sunday-trace-${P}`)
R('(d) back on the current week: tapped Havoc\'s Sunday puck', 'the forward "Breaks Monday" trace row (RECORD whole)', JSON.stringify(tr), tr.items.some(l => /Breaks Monday|Crew rest/.test(l)) ? 'PASS' : 'RECORDED', `14-d2-sunday-trace-${P}.png`)
const sw = await X.weekWarn(w, '#eWeek', SUN)
await X.pic(w, `14-d3-sunday-strip-${P}`)
R('(d) Sunday week strip', 'RECORD the "Breaks Monday" row', JSON.stringify(sw.items.filter(l => /Havoc/.test(l))) + ' | head ' + sw.head, sw.items.some(l => /Breaks Monday/.test(l)) ? 'PASS' : 'RECORDED', `14-d3-sunday-strip-${P}.png`)
// (b) Friday flight+briefing conflict, publish, then the look back
await X.board(w, FRI)
await H.frFlight(w, FRI, '12:00', '', 'bane', 'VL BFM')
await H.gRow(w, FRI, 'BRIEFING', '13:10', '13:20', 'bane')
const pub = await H.signAndPublish(w, FRI)
say('PUBLISH', JSON.stringify(pub))
await X.closeBoard(w)
await sleep(500)
const sel = page.locator('#eWeek .day[data-day="4"] .planselbtn:visible').first()
say('planselbtn', await sel.count())
if (await sel.count()) {
  await sel.evaluate(e => e.scrollIntoView({ block: 'center' })); if (PHONE) await sel.tap(); else await sel.click(); await sleep(600)
  const menu = await page.evaluate(() => [...document.querySelectorAll('button, [role=menuitem], [role=button], a')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (/👁/.test(e.innerText) || /ook|version|plan|issued|AL\d|ORIG/i.test((e.title || '') + ' ' + (e.innerText || '') + ' ' + e.className)) }).map(e => e.tagName + '|' + String(e.className).slice(0, 30) + '|' + Object.keys(e.dataset).join(',') + '=' + Object.values(e.dataset).join(',').slice(0, 30) + '|' + (e.innerText || e.title || '').replace(/\s+/g, ' ').slice(0, 50)).slice(0, 25))
  say('MENU', JSON.stringify(menu))
  await X.pic(w, `14-b1-plan-menu-${P}`)
  R('(b) published Friday: the version selector opened', 'RECORD its rows', JSON.stringify(menu), 'RECORDED', `14-b1-plan-menu-${P}.png`)
  const eye = page.locator('[data-planpv]:visible').first(); const _unused = page.locator('.planmenu [class*=eye], .planmenu button:has-text("👁"), [class*=planmenu] [class*=eye], [class*=planmenu] button[title*="ook" i]').first()
  say('eye', await eye.count())
  if (await eye.count()) {
    if (PHONE) await eye.tap(); else await eye.click(); await sleep(800)
    await X.pic(w, `14-b2-look-${P}`)
    const dd = await X.dayDetails(w, '#eWeek', FRI)
    await X.pic(w, `14-b3-look-daydetails-${P}`)
    R('(b) the 👁 look at the published version, day details opened from it', 'day details lines of the PUBLISHED version incl. the Conflict line, version named', JSON.stringify((dd.items || []).filter(l => /Ranger/.test(l))) + ' ' + (dd.why || ''), (dd.items || []).some(l => /Conflict:/.test(l)) ? 'PASS' : 'RECORDED', `14-b3-look-daydetails-${P}.png`)
    await X.closeDayPop(w, 'done')
  } else R('(b) the 👁 control in the selector', 'found', 'not found', 'NOT WALKED', `14-b1-plan-menu-${P}.png`)
}
await X.fin(w)
