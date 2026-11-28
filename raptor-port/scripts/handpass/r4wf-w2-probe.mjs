// r4wf second walk — a probe (no verdicts): Monday 13 Jul on the Board, with Blue/Red tracking switched on — its
// sections, its flying lines and who is on them, its ground rows, and the Blue/Red question raised by a cue typed in a
// formation's Remarks. Run: WR4_OUT=<dir> WR4_NEW=<build> node scripts/handpass/r4wf-w2-probe.mjs
import * as L from './wr4-lib.mjs'
const { newPage, signIn, go, sleep, bundleOf, log, finish } = L
const J = JSON.stringify
const w = await newPage(process.env.SZ || 'desk', undefined, L.NEW_DIR, process.env.ENG || 'chromium'); await signIn(w, 'ad')
const p = w.page
log('p', 'bundle ' + await bundleOf(p))
await go(p, 'logic'); const e = p.locator('#lgEdit:visible'); if (await e.count()) { await e.click(); await sleep(300) }
const sw = p.locator('#lgMissionMix'); if (!(await sw.isChecked())) { await sw.setChecked(true); await sleep(400) }
log('p', 'tracking ' + await sw.isChecked())
await go(p, 'editsched'); await p.evaluate(() => window.openScheduler(0)); await sleep(800)
log('p', 'sections ' + J(await p.evaluate(() => [...document.querySelectorAll('#sbBoard > *')].map(e => e.getAttribute('data-secmove') || e.className))))
log('p', 'day ' + J(await p.evaluate(() => { const d = window.DAYS[0]; return { dt: d.dt, waves: (d.waves || []).map(w => (w.formations || []).map(f => ({ rid: f.rid, msn: f.msn, ac: (f.aircraft || []).map(a => J2(a)) }))), ground: (d.ground || []).map(r => J2(r)) }; function J2(x) { return JSON.stringify(x).slice(0, 160) } })))
log('p', 'fr keys ' + J(await p.evaluate(() => [...document.querySelectorAll('#sbBoard [data-bfld^="fr:0."], #sbBoard [data-bfld^="ff:0."]')].map(e => e.getAttribute('data-bfld')).slice(0, 30))))
log('p', 'ground keys ' + J(await p.evaluate(() => [...document.querySelectorAll('#sbBoard [data-bfld^="gr:"]')].map(e => e.getAttribute('data-bfld')).slice(0, 30))))
log('p', 'gline / lac / ldel ' + J(await p.evaluate(() => [...document.querySelectorAll('#sbBoard [data-gline], #sbBoard [data-lac], #sbBoard [data-ldel]')].map(e => e.outerHTML.slice(0, 120)).slice(0, 12))))
// raise the question
const set = async (k, v) => { const b = p.locator(`#schedBoard [data-bfld="${k}"]:visible`).first(); await b.scrollIntoViewIfNeeded(); await b.click(); await b.fill(v); await b.press('Tab'); await sleep(400) }
await set('ff:0.0.0.msn', 'ACM'); await set('fr:0.0.0.0', 'DS FOR RU')
log('p', 'question ' + J(await p.evaluate(() => { const q = document.querySelector('.mission-role-question'); return q ? { text: q.innerText.replace(/\s+/g, ' ').slice(0, 120), h: Math.round(q.getBoundingClientRect().height), sec: q.closest('#sbBoard > *')?.getAttribute('data-secmove') } : null })))
log('p', 'focus ' + J(await p.evaluate(() => document.activeElement?.getAttribute('data-bfld') || document.activeElement?.tagName)))
await p.screenshot({ path: `${process.env.WR4_OUT}/probe-question.png` })
await finish()
