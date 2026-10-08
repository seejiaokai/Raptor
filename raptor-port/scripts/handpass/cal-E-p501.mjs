// P5-01 — changing only the people triggers the unsaved-change question. Door behind the window: another input's BAR (a real click/tap).
import { launch, world, toInputs, toMonth, cell, bar, shot, press, saveRows, row, big } from './cal-E-lib.mjs'
const size = process.argv[2] || 'desk'
const b = await launch()
const w = await world(b, size); const p = w.page
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
await toInputs(p); await toMonth(p, 2026, 7)
const sharedBar = p.locator('.ib-bar', { hasText: '+3' }).first()
// another input's bar, of a man who is NOT in the shared entry and is not the man added: Tally LL on 24 Jul
const otherIid = await p.evaluate(() => { const r = window.INPUTS.find(x => x.date === 'Jul 24' && !x.grp); return r && r.iid })
const otherWho = await p.evaluate(iid => window.PEOPLE[window.INPUTS.find(x => x.iid === iid).person].cs, otherIid)
L('other input', otherIid, otherWho)
const lit = () => p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp]')].filter(e => e.getAttribute('aria-pressed') === 'true').map(e => e.dataset.pp).join(','))
const ttl = () => p.locator('[data-testid="win-inputedit"] .win-ttl').innerText().catch(() => 'NO WINDOW')
const ask = () => p.locator('[data-testid="inped-swap"]').innerText().then(t => t.replace(/\n/g, ' | ')).catch(() => 'NO QUESTION')
const openShared = async () => { await press(p, size, sharedBar); await p.waitForSelector('[data-testid="win-inputedit"]'); await p.waitForTimeout(300); L('   (toast about people changed, right after opening the shared entry:', await p.locator('text=/Changed while this window was open/').count(), ')') }
const reach = () => p.evaluate(iid => { const e = document.querySelector(`.ib-bar[data-iid="${iid}"]`); if (!e) return 'nobar'; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === e || e.contains(h) ? 'reachable' : 'covered by ' + (h && h.className) }, otherIid)
const pp = async id => { const el = p.locator(`#inpEditPop [data-pp="${id}"]`); await el.scrollIntoViewIfNeeded(); await press(p, size, el); await p.waitForTimeout(200) }
const N = n => `p501-${size}-${n}`

L('== RUN A: add Gambit only')
await openShared(); L('title', await ttl(), '| lit', await lit())
await shot(p, N('a1-editor'))
await pp('bruise'); L('after add: lit', await lit()); await shot(p, N('a2-added'))
L('other bar', await reach())
await press(p, size, bar(p, otherIid)); await p.waitForTimeout(500)
L('question:', await ask(), '| window title now:', await ttl())
await shot(p, N('a3-after-click'))
const aAsked = (await ask()) !== 'NO QUESTION'
if (aAsked) { await press(p, size, p.locator('[data-testid="inped-swap-stay"]')); await p.waitForTimeout(300); L('after Keep editing: lit', await lit(), '| title', await ttl()); await shot(p, N('a4-kept')) }
// leave without saving
await press(p, size, p.locator('#inpEditCancel')).catch(() => {}); await p.waitForTimeout(300)
L('shared entry people stored after cancel:', await p.evaluate(() => window.INPUTS.filter(x => x.grp === 'g-demo-brief').map(x => x.person).join(',')))

L('== RUN B: remove Echo only')
await openShared(); L('title', await ttl(), '| lit', await lit())
await pp('freak'); L('after remove: lit', await lit()); await shot(p, N('b2-removed'))
await press(p, size, bar(p, otherIid)); await p.waitForTimeout(500)
L('question:', await ask(), '| window title now:', await ttl())
await shot(p, N('b3-after-click'))
const bAsked = (await ask()) !== 'NO QUESTION'
if (bAsked) { await press(p, size, p.locator('[data-testid="inped-swap-stay"]')); await p.waitForTimeout(300); L('after Keep editing: lit', await lit(), '| title', await ttl()); await shot(p, N('b4-kept')) }
await press(p, size, p.locator('#inpEditCancel')).catch(() => {}); await p.waitForTimeout(300)

L('== RUN C (control): change the REMARKS only, then click the other bar')
await openShared()
await p.fill('#inpEditRmk', 'Flight safety brief — control')
await press(p, size, bar(p, otherIid)); await p.waitForTimeout(500)
L('question:', await ask(), '| window title now:', await ttl())
await shot(p, N('c1-control'))
if ((await ask()) !== 'NO QUESTION') { await press(p, size, p.locator('[data-testid="inped-swap-stay"]')); await p.waitForTimeout(300) }
await press(p, size, p.locator('#inpEditCancel')).catch(() => {}); await p.waitForTimeout(300)
L('errors', JSON.stringify(w.errors))
saveRows('p501-' + size, [{ log, errors: w.errors, aAsked, bAsked }])
await b.close()
