// r4wf second walk — a probe (no verdicts): the input window's types and people, the Board's day-bar controls and its
// Undo / Redo, the warning list's place. Run: WR4_OUT=<dir> WR4_NEW=<build> node scripts/handpass/r4wf-w2-probe2.mjs
import * as L from './wr4-lib.mjs'
const { newPage, signIn, go, sleep, log, finish } = L
const J = JSON.stringify
const w = await newPage('desk', undefined, L.NEW_DIR, 'chromium'); await signIn(w, 'ad')
const p = w.page
await L.openDay(w, '2026-07-13'); await L.press(w, '#icPopAdd'); await p.locator('#inpEditPop #inpEditType').waitFor()
log('p', 'types ' + J(await p.evaluate(() => [...document.querySelectorAll('#inpEditType option')].map(o => o.value + '=' + o.textContent))))
log('p', 'people ' + J(await p.evaluate(() => [...document.querySelectorAll('#inpEditPerson option')].slice(0, 8).map(o => o.value + '=' + o.textContent))))
log('p', 'pp ' + J(await p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp]')].slice(0, 6).map(o => o.getAttribute('data-pp')))))
log('p', 'groups ' + J(await p.evaluate(() => [...document.querySelectorAll('#inpEditPop button, #inpEditPop [data-testid]')].map(o => (o.getAttribute('data-testid') || '') + ':' + o.textContent.trim().slice(0, 20)).slice(0, 40))))
await p.keyboard.press('Escape'); await sleep(300); const d = p.getByRole('button', { name: /Discard|Close it/ }).first(); if (await d.count()) await d.click().catch(() => {})
await p.keyboard.press('Escape'); await sleep(300)
await go(p, 'editsched'); await p.evaluate(() => window.openScheduler(0)); await sleep(800)
log('p', 'daybar ' + J(await p.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => b.getBoundingClientRect().width > 0).slice(0, 40).map(b => (b.id || '') + ':' + (b.getAttribute('aria-label') || b.title || b.textContent.trim()).slice(0, 30)))))
log('p', 'warn ' + J(await p.evaluate(() => [...document.querySelectorAll('#schedBoard [class*=warn], #schedBoard [id*=warn i]')].slice(0, 6).map(e => (e.id || e.className).slice(0, 40)))))
log('p', 'secs grip ' + J(await p.evaluate(() => [...document.querySelectorAll('#sbBoard [data-secmove] [draggable], #sbBoard [data-secgrip], #sbBoard .sb-grip')].slice(0, 4).map(e => e.outerHTML.slice(0, 160)))))
await finish()
