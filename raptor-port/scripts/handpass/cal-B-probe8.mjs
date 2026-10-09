import * as B from './cal-B-lib.mjs'
const w = await B.world('side')
const p = w.page
const dl = () => p.evaluate(() => [...document.querySelectorAll('[role=dialog]')].map(e => e.getAttribute('data-testid')))
const third = async id => { await p.evaluate(t => { const e = document.querySelector(`[data-testid="${t}"]`); window.scrollBy(0, e.getBoundingClientRect().top - Math.max(innerHeight / 3, 230)) }, id); await B.sleep(300) }
await B.press(w, B.tid(w, 'month-FEB')); await B.sleep(600)
console.log('after FEB press: FEB class', await p.evaluate(() => document.querySelector('[data-testid="month-FEB"]').className), 'scrollY', await p.evaluate(() => scrollY))
await B.reveal(w, '2026-02-24', 'event-0'); await third('event-0-2026-02-24')
const b = await B.tid(w, 'event-0-2026-02-24').boundingBox()
console.log('event cell', JSON.stringify(b), 'hit', await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className + ' ' + (e.getAttribute('data-testid') || '') : null }, [b.x + b.width / 2, b.y + b.height / 2]), 'scrollY', await p.evaluate(() => scrollY))
await B.pic(p, 'probe-side-1')
await B.press(w, B.tid(w, 'event-0-2026-02-24')); await B.sleep(500)
console.log('dialogs', JSON.stringify(await dl()))
await B.pic(p, 'probe-side-2')
await B.close(w)
