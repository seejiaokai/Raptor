/* [WARN-HIDE-KEPT] — the builder's first look at the BUILT app (not the walk): hide Static's long work day on Tuesday
   through the list's own ✕ on Edit Schedule; read the bar, the lines as PAINTED (computed style), his puck; the board;
   a reload and a fresh sign-in; the member's View-only Sched. HP_URL (default http://localhost:4173), HP_PHONE=1. */
import * as L from './dbrA-lib.mjs'
import * as W from './dbrA-W1-lib.mjs'
import { mkdirSync } from 'node:fs'
const phone = !!process.env.HP_PHONE, T = phone ? 'ph' : 'dk'
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-01-warn-hide/look1'
mkdirSync(OUT, { recursive: true })
const browser = await L.launch()
const ctx = await L.context(browser, { phone })
const errors = []
const p = await L.page(ctx, errors)
await L.signIn(p, 'a')
await L.go(p, 'editsched')
const TUE = 1
const read = async (surf = '#eWeek') => p.evaluate(([s, di]) => {
  const day = document.querySelector(`${s} .day[data-day="${di}"]`); if (!day) return { none: true }
  const box = day.querySelector(`[data-dwbox="${di}"]`)
  const st = e => { const c = getComputedStyle(e.querySelector('.wtx') || e.children[1] || e); return c.textDecorationLine }
  const pk = [...day.querySelectorAll('.puck[data-person="wolf"]')].map(e => e.className + '|' + (e.querySelector('.lchip') ? 'chip' : 'nochip'))
  return { bar: box ? box.querySelector('.daywarn').innerText.replace(/\s+/g, ' ').trim() : '(no bar)', barCls: box ? box.querySelector('.daywarn').className : '',
    lines: box ? [...box.querySelectorAll('.witem')].map(e => ({ cls: e.className, struck: st(e), btn: (e.querySelector('button') || {}).innerText || '', txt: e.innerText.replace(/\s+/g, ' ').slice(0, 50) })) : [], wolf: pk }
}, [surf, TUE])
const open = async (surf = '#eWeek') => { await W.showDay(p, TUE, surf); const o = await p.evaluate(([s, di]) => { const b = document.querySelector(`${s} .day[data-day="${di}"] [data-dwbox="${di}"]`); return b ? b.classList.contains('open') : null }, [surf, TUE]); if (o === false) { await p.locator(`${surf} .day[data-day="${TUE}"] [data-daywarn="${TUE}"]`).first().click(); await L.sleep(350) } }
await open()
console.log('BEFORE', JSON.stringify(await read()))
await p.locator(`#eWeek .day[data-day="${TUE}"] [data-woff="${TUE}.3"]`).first().click(); await L.sleep(600)
console.log('HIDDEN', JSON.stringify(await read()))
await p.screenshot({ path: `${OUT}/${T}-1-week-hidden.png` })
/* the board */
await W.boardOn(p, TUE); await L.sleep(600)
if (phone) { const o = await p.evaluate(() => document.querySelector('#schedBoard .sbwrap').classList.contains('open')); if (!o) { await p.locator('#schedBoard [data-sbwtog]').first().click(); await L.sleep(300) } }
console.log('BOARD', JSON.stringify(await p.evaluate(() => { const w = document.querySelector('#schedBoard .sb-warn'); return { head: w.querySelector('.wh').innerText.replace(/\s+/g, ' ').trim(), lines: [...w.querySelectorAll('.wln')].map(e => ({ cls: e.className, struck: getComputedStyle(e.querySelector('.wln-t') || e).textDecorationLine, btn: (e.querySelector('button') || {}).innerText || '' })), wolf: [...document.querySelectorAll('#schedBoard .puck[data-person="wolf"]')].map(e => e.className) } })))
await p.screenshot({ path: `${OUT}/${T}-2-board-hidden.png` })
await W.boardOff(p)
await L.settle(p)
/* a reload, a fresh sign-in */
await p.reload(); await L.signIn(p, 'a', { goto: false }); await L.go(p, 'editsched'); await open()
console.log('AFTER RELOAD', JSON.stringify(await read()))
await p.screenshot({ path: `${OUT}/${T}-3-week-after-reload.png` })
/* the member, View-only Sched */
await p.reload(); await L.signIn(p, 'm', { goto: false }); await L.sleep(500); await open('#vWeek')
console.log('MEMBER', JSON.stringify(await read('#vWeek')))
await p.screenshot({ path: `${OUT}/${T}-4-member-view.png` })
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
