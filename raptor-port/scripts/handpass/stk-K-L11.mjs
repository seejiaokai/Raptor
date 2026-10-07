import * as K from './stk-K-lib.mjs'
import * as P6 from './p6-lib.mjs'
const { L, W, H } = K
const TYPING = '[data-txt],[data-bfld],[data-inp],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]'
const stateOf = p => p.evaluate(() => ({ elog: window.ELOG.rows.length, cmds: window.commandStreamLen() }))
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await W.toastSpy(p)
const REM = 'Dental review.  Back by 1400'
// file a personal request through the Inputs page: Ace, Appointment, Tue 14 Jul, 10:00-11:00
const o = await K.fileOpen(p, { person: 'Ace', type: 'Appointment', iso: '2026-07-14', from: '10:00', to: '11:00', remarks: REM })
await K.answerAsks(p)
const iid = await K.newIid(p, o.before)
const stored = await p.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x ? { remarks: x.remarks, json: JSON.stringify(x.remarks), type: x.type, date: x.date, str: x.str, end: x.end } : null }, iid)
console.log('filed', iid, JSON.stringify(stored))
const pc0 = await K.pic(p, 'L11-filed')
// accept to Ground on its day (the Personal Inputs card's Accept button on the open board)
const acc = await P6.accBtn(L, p, 1, iid, 'g')
console.log('accept:', acc)
const gr = await p.evaluate(i => { const d = window.DAYS[1]; const r = (d.ground || []).find(g => g.src === i); return r ? { rmks: r.rmks, json: JSON.stringify(r.rmks) } : null }, iid)
console.log('ground row', JSON.stringify(gr))
const signs = await W.signDay(p, 1)
const pub = await W.publishDay(p, 1)
await L.sleep(800)
console.log('signed', JSON.stringify(signs), 'published', JSON.stringify(pub))
await W.boardOff(p)
await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="1"]'); await L.sleep(600)
const h0 = await W.head(p, 1)
const s0 = await stateOf(p)
console.log('head before tabbing', JSON.stringify(h0))
// click into the day's first text box with a real click, then Tab through the whole day typing nothing
const firstSel = await p.evaluate(TY => {
  const d = document.querySelector('#eWeek .day[data-day="1"]')
  const f = [...d.querySelectorAll(TY)].find(e => e.offsetParent !== null && ((e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) ? !e.disabled : e.getAttribute('contenteditable') === 'true'))
  if (!f) return null
  f.setAttribute('data-k11first', '1'); return f.dataset.txt || f.dataset.inp || f.tagName
}, TYPING)
console.log('first box', firstSel)
const first = p.locator('[data-k11first="1"]').first()
await first.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await K.sleep(250)
const fb = await first.boundingBox()
await p.mouse.click(fb.x + fb.width / 2, fb.y + fb.height / 2); await K.sleep(300)
const stops = []
const act = () => p.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return { k: 'BODY', in: false }; const d = a.closest('.day'); return { k: a.dataset.txt || a.dataset.inp || a.dataset.ifld || a.dataset.atime || a.dataset.area || a.dataset.bombs || a.dataset.itline || a.tagName, in: !!d && d.dataset.day === '1', day: d ? d.dataset.day : null } })
stops.push(await act())
let firstChange = null
for (let i = 0; i < 300; i++) {
  await p.keyboard.press('Tab'); await K.sleep(25); const eN = await p.evaluate(() => window.ELOG.rows.length); if (eN !== s0.elog && !firstChange) firstChange = { at: i + 1, nowFocus: (await act()).k, prevFocus: stops[stops.length - 1].k }
  const a = await act(); stops.push(a)
  if (!a.in && i > 3) break
}
await K.sleep(900)
const pcT = await K.pic(p, 'L11-after-tab')
const h1 = await W.head(p, 1)
const s1 = await stateOf(p)
const grAfter = await p.evaluate(i => { const r = (window.DAYS[1].ground || []).find(g => g.src === i); const x = window.INPUTS.find(r => r.iid === i); return { gr: r && JSON.stringify(r.rmks), inp: x && JSON.stringify(x.remarks) } }, iid)
const dp = p.locator('#eWeek .day[data-day="1"] .dpend').first()
await dp.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await dp.click(); await K.sleep(700)
const pcOpen = await K.pic(p, 'L11-changes-window-open')
await p.locator('.chgwin:not([hidden]) .win-x').first().click().catch(() => {}); await K.sleep(400)
const chg = await P6.changesList(L, p, 1)
const pcC = await K.pic(p, 'L11-changes')
const newRows = await p.evaluate(n => window.ELOG.rows.slice(-Math.max(n, 0)).map(r => JSON.stringify(r).slice(0, 220)), s1.elog - s0.elog)
const stopKeys = stops.map(s => s.k)
const ok = /^0 pending$|^$/.test(h1.pending) || !/pending/.test(h1.pending)
K.note('L-11', 'tab-day', `Inputs: filed Ace Appointment Tue 14 Jul 10:00-11:00, remark typed with two spaces; accepted to Ground on the board; signed four names; published Tue; then Edit Schedule, real click into the day's first box (${firstSel}) and ${stops.length - 1} Tabs, nothing typed`,
  `stored request remark ${stored && stored.json}; ground row ${gr && gr.json}; after publish head: pending "${h0.pending}", tag "${h0.tag}", sign line "${h0.signed}"; after Tab run: pending "${h1.pending}", tag "${h1.tag}", sign line "${h1.signed}", Publish-AL button "${h1.alpub}"; stored remark now ${grAfter.inp}, ground ${grAfter.gr}; edit-history rows ${s0.elog}->${s1.elog}${newRows.length ? ' new: ' + newRows.join(' || ') : ''}; changes window: ${JSON.stringify(chg && chg.lines)}; the history row first appeared at Tab number ${firstChange && firstChange.at} (focus then on ${firstChange && firstChange.nowFocus}, having just left ${firstChange && firstChange.prevFocus}); stops (${stopKeys.length}): ${stopKeys.slice(0, 14).join(' > ')} ... ${stopKeys.slice(-4).join(' > ')}`,
  (/^0 pending/.test(h1.pending) || h1.pending === '') && s1.elog === s0.elog ? 'PASS' : 'FAIL', [pc0, pcT, pcOpen, pcC])
console.log('errors', K.errList(errors))
K.flush()
await browser.close()
