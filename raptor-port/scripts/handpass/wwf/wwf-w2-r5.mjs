/* wwf w2 R5 — the plain-user round. usage: [PHONE=1] node scripts/handpass/wwf/wwf-w2-r5.mjs  (the phone runs the first three tasks only) */
import * as H from './wwf-w2-lib.mjs'
const PHONE = process.env.PHONE === '1'
const RUN = PHONE ? 'r5-p' : 'r5-d'
const X = await H.init(RUN, PHONE)
const { say, sleep, row, pic } = X
const w = await X.open({ phone: PHONE })
const { page } = w
const SZ = PHONE ? 'phone' : 'desktop'
const P = n => `w2/${RUN}/${n}.png`
const D = 0
const step = async (n, f) => { try { return await f() } catch (e) { say('STEP ERROR', n, String(e.message).split('\n')[0]); await pic(w, 'err-' + n.replace(/\W+/g, '_')).catch(() => {}); return null } }
const puckState = () => page.evaluate(() => [...document.querySelectorAll('.puck')].filter(e => e.offsetWidth).map(e => e.dataset.person + ':' + e.className.replace(/\s+/g, ' ')).join('|'))
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
// 1. put a man on a flight (a WSO in front for a warning to tap)
await X.board(w, D)
const wi = await H.flight2(X, w, D, { to: '10:00', ld: '11:00', br: '08:00', front: 'bane', rear: 'freak' })
const wi2 = await H.flight2(X, w, D, { to: '12:00', ld: '13:00', br: '11:00', front: 'rocky', rear: null })
await pic(w, '01-flights-built')
const placed = await page.evaluate(([d, a, b]) => [window.DAYS[d].waves[a].formations[0].aircraft[0], window.DAYS[d].waves[b].formations[0].aircraft[0]].map(x => window.PEOPLE[x.p]?.cs + '/' + (window.PEOPLE[x.w]?.cs || '-')).join(' ; '), [D, wi, wi2])
row('R5 flight', SZ, 'put Ranger+Echo on one flight, Hex front seat of a second, from the board', 'the men appear on their seats', placed, placed.includes('Ranger/Echo') && placed.includes('Hex') ? 'PASS' : 'FAIL', P('01-flights-built'))
// 2. the board's issues list: tap a line
const lines = await X.boardWarn(w)
say('board lines', JSON.stringify(lines)); await pic(w, '02-board-list')
const before = await puckState()
const ln = page.locator('#schedBoard #sbWarn .wln:visible', { hasText: 'Illegal seat' }).first()
if (await ln.count()) {
  await ln.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  const box = await ln.boundingBox()
  // aim at the line's own words, left part, away from the hide cross
  if (PHONE) await page.touchscreen.tap(box.x + 20, box.y + box.height / 2); else await page.mouse.click(box.x + 20, box.y + box.height / 2)
  await sleep(60); await page.screenshot({ path: `${X.SHOTS}/03a-line-tap-fast.png` })
  await sleep(700); await pic(w, '03-board-line-tapped')
}
const after = await puckState()
const lit = after.split('|').filter((s, i) => s !== before.split('|')[i])
say('lit after tapping the board line', JSON.stringify(lit))
row('R5 issues list', SZ, 'tap the "Illegal seat" line on the board', 'the crew of that line light in warning colours (never selection blue)', `changed pucks: ${JSON.stringify(lit)}`, lit.length && !lit.some(s => /\bsel\b|selected/.test(s)) ? 'PASS' : 'FAIL', P('03-board-line-tapped'))
await X.closeBoard(w)
// the week's own list and the day-details window
const ww = await X.weekWarn(w, '#eWeek', D); await pic(w, '04-week-list')
const witem = page.locator(`#eWeek [data-dwbox="${D}"] .witem:visible`).first()
let weekLit = 'no line'
if (await witem.count()) {
  const b0 = await puckState()
  const bx = await witem.boundingBox()
  if (PHONE) await page.touchscreen.tap(bx.x + 20, bx.y + bx.height / 2); else await page.mouse.click(bx.x + 20, bx.y + bx.height / 2)
  await sleep(60); await page.screenshot({ path: `${X.SHOTS}/05a-week-line-fast.png` }); await sleep(700)
  weekLit = JSON.stringify((await puckState()).split('|').filter((s, i) => s !== b0.split('|')[i]))
  await pic(w, '05-week-line-tapped')
}
row('R5 week list', SZ, 'open the day strip, tap a line', 'RECORD what lights', `strip ${ww.head} | lines ${JSON.stringify(ww.items)} | changed pucks ${weekLit}`, 'RECORDED', P('05-week-line-tapped'))
const dd = await X.dayDetails(w, '#eWeek', D); await pic(w, '06-day-details-open')
const closed = await X.closeDayPop(w, 'done'); await pic(w, '07-day-details-closed')
const dd2 = await X.dayDetails(w, '#eWeek', D); const closed2 = await X.closeDayPop(w, 'x'); const dd3 = await X.dayDetails(w, '#eWeek', D); const closed3 = await X.closeDayPop(w, 'esc')
row('R5 day details', SZ, 'open day-details; close by Done; again by its X; again by Escape', 'opens and closes each time', `open ${dd.ok}, lines ${JSON.stringify(dd.items)}; Done -> ${closed}; X -> ${closed2} (opened ${dd2.ok}); Esc -> ${closed3} (opened ${dd3.ok})`, dd.ok && closed === 'closed' ? 'PASS' : 'FAIL', P('06-day-details-open'))
await step('legend', async () => {
  const sm = page.locator('#eLegendBox > summary:visible').first()
  await sm.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  const o0 = await page.evaluate(() => document.querySelector('#eLegendBox').open)
  if (PHONE) await sm.tap(); else await sm.click(); await sleep(500)
  const o1 = await page.evaluate(() => document.querySelector('#eLegendBox').open)
  const txt = await page.evaluate(() => document.querySelector('#eLegendBox').innerText.replace(/\s+/g, ' ').slice(0, 1200))
  await pic(w, '08-legend-open')
  say('legend', txt)
  if (PHONE) await sm.tap(); else await sm.click(); await sleep(500)
  const o2 = await page.evaluate(() => document.querySelector('#eLegendBox').open)
  await pic(w, '09-legend-folded')
  row('R5 legend', SZ, 'open and fold the Legend', 'opens, shows Q = "Qual / illegal seat", folds again', `open before ${o0}, after tap ${o1}, after second tap ${o2}; mentions Qual / illegal seat: ${/qual \/ illegal seat/i.test(txt)}; text ${txt.slice(0, 300)}`, !o0 && o1 && !o2 && /qual \/ illegal seat/i.test(txt) ? 'PASS' : 'FAIL', P('08-legend-open'))
})
if (!PHONE) {
  // publish
  await X.board(w, D)
  const pub = await X.L.publish(page, D); say('publish', JSON.stringify(pub)); await pic(w, '10-published')
  await X.closeBoard(w)
  const ww2 = await X.weekWarn(w, '#eWeek', D); await pic(w, '11-edit-after-publish')
  row('R5 publish', SZ, 'sign all four off and publish Mon 27 Jul', 'published, version chip shown, issues still listed on the issued face', `${JSON.stringify(pub)} | strip ${ww2.head} | ${JSON.stringify(ww2.items)}`, pub.published ? 'PASS' : 'FAIL', P('10-published'))
  const viewAs = async (tag, who) => {
    await X.L.go(page, 'viewsched'); await H.gotoWeek(X, w, H.MONDAY_WK, null); await sleep(600)
    const day = await page.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="0"]'); return d ? d.innerText.replace(/\s+/g, ' ').slice(0, 400) : 'no day' })
    const v = await X.weekWarn(w, '#vWeek', D); await pic(w, `${tag}-viewonly-strip`)
    const vd = await X.dayDetails(w, '#vWeek', D); await pic(w, `${tag}-viewonly-details`); await X.closeDayPop(w, 'done')
    const vq = await page.evaluate(() => [...document.querySelectorAll('#vWeek .puck')].filter(e => e.offsetWidth && e.querySelector('.lchip')).map(e => e.dataset.person + ':' + e.querySelector('.lchip').title).join(','))
    row('R5 view-only', SZ + ' ' + who, 'View-only Sched, Mon 27 Jul after publish', 'RECORD (published face, issues, Q chips)', `day ${day.slice(0, 200)} | strip ${v.head} ${JSON.stringify(v.items)} | details ${JSON.stringify(vd.items)} | Q chips ${vq}`, 'RECORDED', P(`${tag}-viewonly-strip`))
    return { v, vd, vq }
  }
  const a = await viewAs('12-admin', 'admin')
  row('R5 view-only words', SZ + ' admin', 'read the issue line and Q chip words on the published face', 'Hex line says "Illegal seat: …"; Q chip says "Qual / illegal seat"; no "Wrong seat"', `${JSON.stringify(a.v.items.filter(l => /seat/i.test(l)))} | ${a.vq}`, a.v.items.some(l => /Hex — Illegal seat/.test(l)) && /rocky:Qual \/ illegal seat/.test(a.vq) && !a.v.items.some(l => /Wrong seat/i.test(l)) ? 'PASS' : 'FAIL', P('12-admin-viewonly-strip'))
  await page.locator('#logout').click(); await sleep(800)
  await X.L.login(page, 'u'); await sleep(600)
  await pic(w, '13-member-signed-in')
  const m = await viewAs('14-member', 'member')
  row('R5 view-only words', SZ + ' member', 'same read as the member', 'same words as the admin', `${JSON.stringify(m.v.items.filter(l => /seat/i.test(l)))} | ${m.vq}`, m.v.items.some(l => /Hex — Illegal seat/.test(l)) && /rocky:Qual \/ illegal seat/.test(m.vq) && !m.v.items.some(l => /Wrong seat/i.test(l)) ? 'PASS' : 'FAIL', P('14-member-viewonly-strip'))
}
await X.fin(w)
