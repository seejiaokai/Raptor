// Scenario 43 - The scheduler's row name is separate. usage: node it-B-s43.mjs desk
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const DI = 2, ISO = '2026-07-15'
const FOC = 'sports day|scheduler wording|board wording|games afternoon|^event$'
const W = await L.mk(size)
const p = W.page
L.setWeek(null)
const ranger = await L.csId(p, 'Ranger')
const tag = `s43-${size}`
await L.fileInput(W, { iso: ISO, type: 'Event', person: ranger, s: '09:00', e: '10:00', title: 'Sports day', rmk: 'titled one' })
const r = await L.recBy(p, { person: ranger, type: 'Event' })
const inputTitleInWindow = async () => { await L.openSaved(W, r.iid, ISO); const v = await p.inputValue('#inpEditTitle'); await L.shot(p, tag + '-window-' + (Date.now() % 100000)); await L.closeWins(p); return v }
const rowOf = async () => { const f = await L.face(p, DI); return f.rows.map(x => x.name + (x.kind ? '[' + x.kind + ']' : '')).join('|') }
// 1. rename the landed row on Edit Schedule, in place
await L.editWeek(p); await L.showDay(p, DI)
const name = p.locator(`#eWeek .day[data-day="${DI}"] .pl-row.gr-frominput > .nm .ntx`).first()
await name.evaluate(e => e.scrollIntoView({ block: 'center' }))
await (W.mobile ? name.tap() : name.click()); await p.keyboard.press('Control+A'); await p.keyboard.type('Scheduler wording', { delay: 8 }); await p.keyboard.press('Enter'); await L.sleep(500)
const w1 = await rowOf(); await L.focusName(p, '#eWeek', DI, FOC); await L.shot(p, tag + '-1week-renamed')
const t1 = await inputTitleInWindow(); const rec1 = await L.rec(p, r.iid)
const ok1 = /^scheduler wording\[EVENT\]/i.test(w1) && t1 === 'Sports day' && rec1.title === 'Sports day'
L.row('43', size, 'admin', ok1 ? 'PASS' : 'FAIL', `row renamed on Edit Schedule: week row "${w1}"; reopened input's Title box "${t1}"; saved title "${rec1.title}"`, [tag + '-1week-renamed.png'])
// 2. rename on the board
await L.openBoard(W, DI)
const f = p.locator('#schedBoard .sb-arow.c6r [data-bfld$=".prog"]').filter({ hasNot: p.locator('nothing') })
let fld = null
for (const el of await p.locator('#schedBoard .sb-arow.c6r').all()) { const q = el.locator('[data-bfld$=".prog"]').first(); if (await q.count() && /scheduler wording/i.test(await q.inputValue().catch(() => ''))) { fld = q; break } }
if (fld) { await fld.evaluate(e => e.scrollIntoView({ block: 'center' })); await fld.click(); await fld.fill(''); await fld.type('Board wording', { delay: 8 }); await fld.evaluate(e => e.blur()); await L.sleep(500) }
const bk = await p.evaluate(() => { const r = [...document.querySelectorAll('#schedBoard .sb-arow.c6r')].find(r => /board wording/i.test((r.querySelector('[data-bfld$=".prog"]') || {}).value || '')); return r ? { name: r.querySelector('[data-bfld$=".prog"]').value, kind: (r.querySelector('.nm-kind') || {}).textContent || '' } : null })
await L.boardFocus(p, 'board wording'); await L.shot(p, tag + '-2board-renamed')
await L.closeBoard(p)
const w2 = await rowOf(); const t2 = await inputTitleInWindow(); const rec2 = await L.rec(p, r.iid)
const ok2 = !!fld && !!bk && bk.kind.toUpperCase() === 'EVENT' && /^board wording\[EVENT\]/i.test(w2) && t2 === 'Sports day' && rec2.title === 'Sports day'
L.row('43', size, 'admin', ok2 ? 'PASS' : 'FAIL', `row renamed on the Board: board row ${JSON.stringify(bk)}; week row "${w2}"; reopened input's Title box "${t2}"; saved title "${rec2.title}"`, [tag + '-2board-renamed.png'])
// 3. publish, then retitle the input
await L.pubDay(W, DI)
const base = await L.snap(W, DI, { focus: FOC, pic: tag + '-3published' })
await L.retitle(W, r.iid, ISO, 'Games afternoon')
const rd = async t => { const S = await L.snap(W, DI, { focus: FOC, pic: t }); const rec = await L.rec(p, r.iid); return { s: { S, rec }, text: L.brief(S) + ` | saved title ${JSON.stringify(rec && rec.title)}`, pics: [t + '-edit.png', t + '-togo.png', t + '-view.png'] } }
const chg = await rd(tag + '-4retitled')
const applied = ({ S, rec }) => rec.title === 'Games afternoon' && S.f.pend.length === 1 && /not yet signed/i.test(S.f.nys) && S.f.rows[0]?.name === 'GAMES AFTERNOON' && S.f.rows[0]?.kind === 'EVENT' && /^board wording$/i.test(S.v.rows[0]?.name) && S.v.rows[0]?.kind === 'EVENT' && /Sports day/.test(S.togo || '') && /Games afternoon/.test(S.togo || '')
const reverted = ({ S, rec }) => rec.title === 'Sports day' && !S.f.pend.length && !S.f.nys && /^board wording$/i.test(S.f.rows[0]?.name) && /^board wording$/i.test(S.v.rows[0]?.name)
L.row('43', size, 'admin', reverted({ S: base, rec: { title: 'Sports day' } }) && applied(chg.s) ? 'PASS' : 'FAIL', `published with the hand-named row: ${L.brief(base)} || input then retitled "Games afternoon": ${chg.text}`, [tag + '-3published-edit.png', ...chg.pics])
console.log('applied', applied(chg.s))
await L.checkpoint(W, 'A', { n: '43', tag, read: rd, applied, reverted })
await W.browser.close()
L.saveRows('s43-' + size)
console.log('ERRORS', L.ERRS)
