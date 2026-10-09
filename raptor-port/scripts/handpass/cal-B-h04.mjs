/* H-04 — a fresh Leave War has no counters, and the buttons read as ruled (D669, D673, D676, D677). */
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await B.world(size)
const p = w.page, S = w.key
const pics = [], log = [], checks = []
const note = (k, v) => { log.push(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`); console.log('  >', k, typeof v === 'string' ? v : JSON.stringify(v)) }
const chk = (name, ok, detail = '') => { checks.push([name, !!ok, detail]); console.log(ok ? '  ok' : '  XX', name, detail) }
const paint = id => B.tid(w, id).evaluate(el => { const c = getComputedStyle(el); return { bg: c.backgroundColor, ink: c.color, edge: c.borderTopColor, w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) } })
const rgb = c => (c.match(/[\d.]+/g) || []).map(Number)
const isRed = c => { const [r, g, b] = rgb(c); return r > 180 && g < 200 && b < 200 && r - g > 40 }
/* 1. fresh */
const order0 = await B.blockOrder(w)
const names0 = await p.evaluate(() => [...document.querySelectorAll('.mx tbody.counts > tr')].map(e => e.querySelector('.who')?.innerText.trim()))
const counters0 = await p.evaluate(() => document.querySelectorAll('.mx tbody.counts > tr[data-testid^="count-"]').length)
note('1 Manning block of a fresh world', `${order0.join(' > ')} | names: ${names0.join(' / ')} | counter rows: ${counters0}`)
pics.push(await B.pic(p, `H-04-${S}-1-fresh`))
chk('four fixed rows, no counter', counters0 === 0 && order0.length === 4, `${order0.join(',')}`)
/* 2. + Counter */
await B.makeCounter(w, 'Test counter', { seat: 'pilot', amber: 20, red: 10 })
const order1 = await B.blockOrder(w)
note('2 after + Counter', order1.join(' > '))
chk('one counter now stands above the four', order1.length === 5 && order1[0] === 'count-test-counter', order1.join(','))
/* 3. open its window */
await B.press(w, B.tid(w, 'manning-info-test-counter')); await B.sleep(300)
await B.press(w, B.tid(w, 'counter-edit-open')); await B.sleep(400)
const S1 = await paint('cform-save'), C1 = await paint('cform-cancel'), D1 = await paint('cform-delete')
note('3 window buttons (as painted)', JSON.stringify({ save: S1, cancel: C1, delete: D1 }))
pics.push(await B.pic(p, `H-04-${S}-2-counter-window`))
const saveWord = await B.txt(B.tid(w, 'cform-save')), delWord = await B.txt(B.tid(w, 'cform-delete'))
chk('button words: "Save counter" and "Delete counter"', /Save counter/i.test(saveWord) && /Delete counter/i.test(delWord), `${saveWord} / ${delWord}`)
chk('"Delete counter" is red (ink and edge)', isRed(D1.ink) && isRed(D1.edge), JSON.stringify(D1))
chk('"Save counter" is the filled accent button', S1.bg === 'rgb(59, 198, 232)', JSON.stringify(S1))
chk('Cancel is neither filled nor red', C1.bg !== S1.bg && !isRed(C1.ink) && !isRed(C1.edge), JSON.stringify(C1))
chk('the three buttons do not look alike (all three bg/ink/edge sets differ)', new Set([S1, C1, D1].map(x => x.bg + x.ink + x.edge)).size === 3, '')
/* the app's own filled save button: an Event sheet's Save */
await B.press(w, B.tid(w, 'cform-cancel')); await B.sleep(300)
await B.reveal(w, '2026-02-03', 'event-0'); await p.evaluate(() => window.scrollTo(0, 0)); await B.sleep(200)
await B.press(w, B.tid(w, 'event-0-2026-02-03')); await B.sleep(350)
const E1 = await paint('event-apply')
note('the Event sheet Save (the app\'s filled save) paint', JSON.stringify(E1))
chk('"Save counter" wears the same fill as the app\'s other Save button', E1.bg === S1.bg, `${E1.bg} vs ${S1.bg}`)
await B.press(w, B.tid(w, 'event-cancel')); await B.sleep(300)
/* 4. Rearrange */
await B.press(w, B.tid(w, 'roster-arrange')); await B.sleep(600)
const X = await paint('manning-delete-test-counter')
const grips = await p.evaluate(() => ({ fixedGrip: document.querySelectorAll('.mx tbody.counts tr.flyrow .drag').length, fixedCross: document.querySelectorAll('.mx tbody.counts tr.flyrow .mrow-btn').length, counterGrip: document.querySelectorAll('.mx tbody.counts tr[data-testid^="count-"] .drag').length, counterCross: document.querySelectorAll('.mx tbody.counts tr[data-testid^="count-"] .mrow-btn.del').length, eye: document.querySelectorAll('.mx tbody.counts .mrow-btn:not(.del)').length }))
note('4 Rearrange: cross paint / grips', JSON.stringify({ cross: X, grips }))
pics.push(await B.pic(p, `H-04-${S}-3-rearrange`))
chk('the counter\'s cross is red', isRed(X.ink) || isRed(X.edge), JSON.stringify(X))
chk('the counter has its grip and cross; no hide-eye anywhere', grips.counterGrip === 1 && grips.counterCross === 1 && grips.eye === 0, JSON.stringify(grips))
chk('the four fixed rows carry no grip and no cross', grips.fixedGrip === 0 && grips.fixedCross === 0, JSON.stringify(grips))
const bad = checks.filter(c => !c[1])
B.row('H-04', S, 'Fresh world: read the Manning block; ⚙ + Counter (made one); opened its window and read the three buttons as painted; compared with the Event sheet Save; Rearrange',
  checks.map(c => `${c[1] ? 'ok' : 'XX'} ${c[0]} [${c[2]}]`).join(' | '), bad.length ? 'FAIL' : 'PASS', pics)
B.noteErrors('h04-' + S, w.errors)
await B.close(w)
