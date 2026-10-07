import * as K from './stk2-S-lib.mjs'
const { L, W, H } = K
const focusD = p => p.evaluate(() => {
  const a = document.activeElement
  if (!a || a === document.body) return { txt: 'BODY (nothing focused)', inside: false }
  const w = a.closest('[data-testid="oilconf"]')
  return { txt: `${a.tagName.toLowerCase()} ${a.dataset.inp || a.dataset.txt || a.id || ''} "${(a.innerText || a.value || '').toString().replace(/\s+/g, ' ').trim().slice(0, 30)}"`, inside: !!w }
})
const snapAll = p => p.evaluate(() => ({ d: JSON.stringify(window.DAYS), i: JSON.stringify(window.INPUTS), elog: window.ELOG.rows.length }))
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await W.toastSpy(p)
const o = await K.fileOpen(p, { person: 'Ranger', type: 'Duty', iso: '2026-07-18', from: '08:00', to: '16:00', remarks: 'S1 duty' })
const asked0 = await K.answerAsks(p)
const iid = await K.newIid(p, o.before)
const inp = await p.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x && JSON.stringify({ person: x.who || x.person, type: x.type, date: x.date, str: x.str, end: x.end, acc: x.acc, oil: x.oil }) }, iid)
console.log('filed', iid, 'asks answered:', asked0, inp)
await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="5"]'); await L.sleep(700)
const hd = p.locator('#eWeek .day[data-day="5"] [data-pitog="5"]').first()
await hd.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
if (!(await p.locator(`#eWeek [data-inp="${iid}.str"]`).count())) { await hd.click(); await K.sleep(500) }
const STR = `#eWeek [data-inp="${iid}.str"]`
const strBefore = await p.evaluate(s => document.querySelector(s) && document.querySelector(s).innerText, STR)
await K.pic(p, 'S1-0-before')
await K.clickBox(p, STR)
await p.keyboard.press('Control+A'); await p.keyboard.type('1300', { delay: 20 })
await p.keyboard.press('Tab')
await K.sleep(900)
const open = await K.winOpen(p, 'oilconf')
const winText = await p.evaluate(() => { const w = document.querySelector('[data-testid="oilconf"]'); return w && w.getBoundingClientRect().width > 0 ? w.innerText.replace(/\s+/g, ' ').slice(0, 260) : null })
const f0 = await focusD(p)
const pc1 = await K.pic(p, 'S1-1-question-open')
const s1 = await snapAll(p)
const trail = []
for (let i = 1; i <= 8; i++) { await p.keyboard.press('Shift+Tab'); await K.sleep(200); const f = await focusD(p); trail.push({ k: 'Shift+Tab #' + i, ...f }) }
const pc2 = await K.pic(p, 'S1-2-after-shift-tabs')
for (let i = 1; i <= 8; i++) { await p.keyboard.press('Tab'); await K.sleep(200); const f = await focusD(p); trail.push({ k: 'Tab #' + i, ...f }) }
const pc3 = await K.pic(p, 'S1-3-after-tabs')
const s2 = await snapAll(p)
await p.keyboard.type('XYZ', { delay: 30 }); await K.sleep(300)
const fx = await focusD(p)
const s3 = await snapAll(p)
const stillOpen = await K.winOpen(p, 'oilconf')
const pc4 = await K.pic(p, 'S1-4-after-XYZ')
await p.keyboard.press('Escape'); await K.sleep(600)
const closed = !(await K.winOpen(p, 'oilconf'))
const fe = await focusD(p)
const pc5 = await K.pic(p, 'S1-5-after-escape')
const strNow = await p.evaluate(s => document.querySelector(s) && document.querySelector(s).innerText, STR)
const reqNow = await p.evaluate(i => JSON.stringify(window.INPUTS.find(r => r.iid === i)), iid)
const strayXYZ = await p.evaluate(() => [...document.querySelectorAll('[data-txt],[data-inp],[data-bfld],input,textarea')].filter(e => /XYZ|XY|Z$/.test((e.innerText || e.value || '').trim())).map(e => (e.dataset.txt || e.dataset.inp || e.dataset.bfld || e.id) + '=' + (e.innerText || e.value).trim()).slice(0, 6))
const outside = trail.filter(t => !t.inside)
console.log(trail.map(t => `${t.k}: ${t.inside ? 'IN ' : 'OUT'} ${t.txt}`).join('\n'))
const verdict = !open ? 'NOT WALKED (question did not open)' : (outside.length === 0 && s1.d === s3.d && s1.i === s3.i && stillOpen && closed ? 'PASS' : 'FAIL')
K.note('S-1', 'run', `Duty (Ranger, Sat 18 Jul, 08:00–16:00, was ${inp}) filed via Inputs, OIL asked Yes; Edit Schedule Sat Personal Inputs: START box (was ${strBefore}) clicked, typed 1300, Tab; 8× Shift+Tab, 8× Tab, typed XYZ, Escape`,
  `question ${open ? 'OPEN: ' + winText : 'did not open'}; focus right after first Tab: ${f0.txt} (${f0.inside ? 'inside' : 'OUTSIDE'}); presses landing outside the window: ${outside.length ? outside.map(t => t.k + ' -> ' + t.txt).join('; ') : 'none (16 of 16 inside)'}; trail: ${trail.map(t => t.k.replace(' #', '') + ':' + (t.inside ? 'in ' : 'OUT ') + t.txt.slice(0, 22)).join(' | ')}; after XYZ focus ${fx.txt} (${fx.inside ? 'inside' : 'OUTSIDE'}), window still open ${stillOpen}, schedule days changed ${s1.d !== s3.d}, requests changed ${s1.i !== s3.i}, edit-history rows ${s1.elog}->${s3.elog}; after Escape window closed ${closed}, focus ${fe.txt}; start box now "${strNow}"; request ${reqNow}; stray XYZ boxes ${JSON.stringify(strayXYZ)}`,
  verdict, [pc1, pc2, pc3, pc4, pc5])
console.log('errors', K.errList(errors))
K.flush()
await browser.close()
