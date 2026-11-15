/* rcb2-w1 S09 part 1 — "planned" on the BRIEFING row: Ranger's whole-day leave filed as the member, then the admin puts him on a
   09:00–10:00 BRIEFING row; an ATT C downchit for another man on a BRIEFING row. Friday (index 4) is the scenario's clean day.
   usage: node scripts/handpass/rcb2/rcb2-w1-s09.mjs [desktop|phone]  */
const KIND = process.argv[2] || 'desktop'
process.env.RCB2_RUN = 's09-' + KIND + (process.env.RCB2_TAG || '')
const X = await import('./rcb2-w1-lib.mjs')
const { L, say, check, nrm, sleep, FRI } = X
const P = KIND === 'phone' ? 'p' : 'd'
const w = await X.world(KIND, 'us')
const page = w.page
const RANGER = 'bane', DOWN = 'dice'
const ISO = '2026-07-17'
const OLD = /(leave|downchit) \+ flying/i
say('rcb2-w1-s09', KIND, SHOTS_NOTE())
function SHOTS_NOTE() { return X.SHOTS }

/* --- the member files whole-day leave */
const f1 = await X.fileInput(w, { iso: ISO, type: 'LL', remarks: 'rcb2 w1 leave', picAfter: `s09-1c-after-add-${P}`, pic: `s09-1-member-form-${P}` })
const mine = f1.rec ? 1 : 0
check('S09.1 Ranger (member) files whole-day LL on Fri 17 Jul', mine >= 1 ? true : 'NOT WALKED', `added ${f1.added}, asked ${JSON.stringify(f1.asked)}, matching inputs ${mine}`)
await X.pic(w, `s09-1b-member-filed-${P}`)
await X.relogin(w, 'a')
const f2 = await X.fileInput(w, { iso: ISO, type: 'ATT C', person: DOWN, remarks: 'rcb2 w1 downchit', pic: `s09-2-admin-downchit-form-${P}` })
const dn = f2.rec ? 1 : 0
check('S09.2 admin files an ATT C downchit for Reaper (Fri 17 Jul)', dn >= 1 ? true : 'NOT WALKED', `added ${f2.added} matching ${dn}`)

/* --- the BRIEFING row with both men */
await X.board(w, FRI)
const g = await X.ground(w, FRI, { prog: 'BRIEFING', str: '09:00', end: '10:00', who: RANGER })
const g2 = await X.ground(w, FRI, { prog: 'BRIEFING', str: '09:00', end: '10:00', who: DOWN })
say('ground rows', JSON.stringify(g), JSON.stringify(g2))
const wl = await X.boardWarn(w)
say('BOARD lines:\n  ' + wl.lines.map(l => `[${l.cls}] ${l.text}`).join('\n  '))
await X.pic(w, `s09-3-board-${P}`)
await X.crop(w, '#schedBoard .sb-warn', `s09-3-board-list-${P}`)
const leaveLine = wl.lines.find(l => /Ranger|Bane/i.test(l.text) && /leave/i.test(l.text)) || wl.lines.find(l => /On leave but tasked/.test(l.text))
const dnLine = wl.lines.find(l => /Downchit but tasked/.test(l.text))
check('S09.3 board: Ranger on BRIEFING — "On leave but tasked — BRIEFING" (the board prints the message first)', !!leaveLine && /On leave but tasked — BRIEFING/.test(leaveLine.text), leaveLine ? leaveLine.text : 'none: ' + wl.lines.map(l => l.text).join(' / '))
check('S09.3b board: Reaper on BRIEFING — "Downchit but tasked — BRIEFING"', !!dnLine && /Downchit but tasked — BRIEFING/.test(dnLine.text), dnLine ? dnLine.text : 'none')
check('S09.3c board: no line names a check "+ flying"', !wl.lines.some(l => OLD.test(l.text)), wl.lines.map(l => l.text).join(' / ').slice(0, 300))
const planNames = wl.lines.filter(l => /\+ planned/.test(l.text))
say('board lines that print a check name:', JSON.stringify(planNames.map(l => l.text)))

/* --- the day's details from the board */
const dd = await X.dayDetails(w, FRI, { name: `s09-4-daydetails-board-${P}` })
say('DAY DETAILS (board door):', JSON.stringify(dd).slice(0, 900))
check('S09.4 day details (from the board): names "planned", not "flying"', !dd.error && /\+ planned/.test(dd.text) && !OLD.test(dd.text), dd.error || dd.text.slice(0, 400))
say('close day details Close:', await X.closeDayDetails(w, 'Close'))
await X.closeBoard(w)

/* --- Edit Schedule's week */
await L.go(page, 'editsched'); await sleep(500)
const ew = await X.weekWarn(w, '#eWeek', FRI)
say('EDIT WEEK strip:', ew.head, '\n  ' + ew.items.map(i => `[${i.cls}] ${i.text}`).join('\n  '))
await X.crop(w, '#eWeek [data-dwbox="4"]', `s09-5-week-strip-${P}`)
check('S09.5 Edit Schedule warning list names both checks "planned"', ew.items.some(i => /On leave \+ planned/.test(i.text)) && ew.items.some(i => /Downchit \+ planned/.test(i.text)) && !ew.items.some(i => OLD.test(i.text)), ew.items.map(i => i.text).join(' / ').slice(0, 500))
const dd2 = await X.dayDetails(w, FRI, { root: '#eWeek', name: `s09-6-daydetails-editweek-${P}` })
check('S09.6 day details from Edit Schedule', !dd2.error && /\+ planned/.test(dd2.text) && !OLD.test(dd2.text), dd2.error || dd2.text.slice(0, 400))
say('close day details x:', await X.closeDayDetails(w, 'x'))

/* --- View-only */
await L.go(page, 'viewsched'); await sleep(600)
const vw = await X.weekWarn(w, '#vWeek', FRI)
say('VIEW-ONLY strip:', vw.head, '\n  ' + vw.items.map(i => `[${i.cls}] ${i.text}`).join('\n  '))
await X.crop(w, '#vWeek [data-dwbox="4"]', `s09-7-viewonly-strip-${P}`).catch(e => say('no view strip pic', e.message))
check('S09.7 View-only warning list (unpublished day: working copy)', vw.items.length > 0 ? (vw.items.some(i => /\+ planned/.test(i.text)) && !vw.items.some(i => OLD.test(i.text))) : 'NOT WALKED', vw.items.map(i => i.text).join(' / ').slice(0, 400) || vw.head)

/* --- Insights */
await L.go(page, 'editsched'); await sleep(400)
if (KIND === 'phone') { await X.press(w, '#editSchedMore', { scope: 'page', after: `s09-8-insights-door-tap-${P}` }); await X.press(w, '#editSchedMoreInsights', { scope: 'page', after: `s09-8-insights-item-tap-${P}` }) }
else await X.press(w, '#insightBtn', { scope: 'page' })
await page.waitForSelector('#insightBody'); await sleep(600)
const ins = nrm(await page.evaluate(() => document.querySelector('#insightBody').innerText))
const insLines = ins.match(/[^.]*(planned|flying)[^.]*/gi) || []
say('INSIGHTS segments:', JSON.stringify(insLines.slice(0, 8)))
await X.pic(w, `s09-8-insights-${P}`)
check('S09.8 Insights count by type names "On leave + planned" and "Downchit + planned"', /On leave \+ planned/.test(ins) && /Downchit \+ planned/.test(ins) && !OLD.test(ins), insLines.slice(0, 6).join(' / ') || ins.slice(0, 300))
await X.press(w, '#insightClose', { scope: 'page' })

/* --- Logic */
await L.go(page, 'logic'); await sleep(500)
await page.fill('#lgSearch', 'planned'); await sleep(500)
const lgNames = () => page.evaluate(() => [...document.querySelectorAll('#lgBody .lgnm')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()).filter(t => /\+ (planned|flying)$/.test(t)))
const lg = await lgNames()
say('LOGIC search "planned":', JSON.stringify(lg))
await X.pic(w, `s09-9-logic-planned-${P}`)
check('S09.9 Logic search "planned" finds both checks', lg.some(t => /On leave \+ planned/.test(t)) && lg.some(t => /Downchit \+ planned/.test(t)), lg.join(' / ').slice(0, 300))
await page.fill('#lgSearch', 'flying'); await sleep(500)
const lg2 = await lgNames()
await X.pic(w, `s09-9b-logic-flying-${P}`)
check('S09.9b Logic search "flying" finds no check named "+ flying"', !lg2.some(t => OLD.test(t)), 'names drawn: ' + JSON.stringify(lg2))
await page.fill('#lgSearch', '')
say('errors', JSON.stringify(w.errors))
check('S09 no console / page errors', w.errors.length === 0, w.errors.slice(0, 3).join(' | '))
await X.finishWorld(w)
W_SUMMARY()
function W_SUMMARY() { X.W.summary() }
