// r4wf second walk — a probe (no verdicts): the phone's Board top bar — each visible button's id, label and place.
// Run: WR4_OUT=<dir> WR4_NEW=<build> node scripts/handpass/r4wf-w2-probe4.mjs
import * as L from './wr4-lib.mjs'
const { newPage, signIn, go, sleep, log, finish } = L
const w = await newPage('phone', undefined, L.NEW_DIR, 'webkit'); await signIn(w, 'ad')
const p = w.page
await go(p, 'editsched'); await p.evaluate(() => window.openScheduler(5)); await sleep(800)
log('p', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.top < 120 }).map(b => `${b.id}|${b.getAttribute('aria-label') || b.title}|${b.textContent.trim().slice(0, 6)}|${Math.round(b.getBoundingClientRect().left)},${Math.round(b.getBoundingClientRect().top)}|${[...b.attributes].map(a => a.name).filter(n => n.startsWith('data-')).join(',')}`))))
await finish()
