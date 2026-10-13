/* THE DESIGN LOOK — the keyboard on a puck, and on the Tracker's chart (desktop only): can a puck be picked up and put
   down by keys; can an event of the chart be opened by keys.
   node scripts/handpass/dl-keys.mjs */
import * as L from './dl-lib.mjs'
const w = await L.world('desk')
const p = w.page

/* the Scheduler Board, Monday */
await L.go(w, 'editsched')
await p.locator('#eWeek [data-sbday="0"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
await p.waitForSelector('#sbBoard .sb-sec', { state: 'attached' }); await L.sleep(500)
const armed = () => p.evaluate(() => ({ arm: !!document.querySelector('.armed, .is-armed, [data-armed]'), body: document.body.className, sel: document.querySelectorAll('.puck.sel, .puck.selected, .puck.hl').length }))
const puck = p.locator('#sbBoard .sb-line .puck, #sbBoard [data-slot] .puck').first()
await puck.evaluate(e => e.scrollIntoView({ block: 'center' }))
await puck.focus()
const who = await L.focusOf(w)
const a0 = await armed()
await p.keyboard.press('Enter'); await L.sleep(250)
const a1 = await armed()
await p.keyboard.press('Space'); await L.sleep(250)
const a2 = await armed()
await L.pic(w, 'keys-desk-1-puck-focused', { around: '#sbBoard .sb-line .puck, #sbBoard [data-slot] .puck', pad: 120 })
L.row('A puck on the Scheduler Board', 'Enter, then Space, on a puck the keyboard is on', 'it is picked up (armed) as a tap does on a phone — then arrows or Tab to a seat and Enter to put it down', `on ${who.split(' · ')[0]} (${who.split(' · ')[1]}) — before ${JSON.stringify(a0)} · after Enter ${JSON.stringify(a1)} · after Space ${JSON.stringify(a2)}`, JSON.stringify(a0) === JSON.stringify(a1) && JSON.stringify(a1) === JSON.stringify(a2) ? 'GAP — nothing happens: the keyboard can stand on a puck but cannot pick it up' : 'look')
await p.keyboard.press('Delete'); await L.sleep(250)
const stillThere = await p.evaluate(() => !!document.activeElement?.closest?.('.puck'))
L.row('A puck on the Scheduler Board', 'Delete on a puck', 'takes the man off the seat (as dragging him off does), with Undo', stillThere ? 'nothing happened' : 'the puck is gone or the keyboard moved', stillThere ? 'GAP — nothing happens' : 'look')

/* the crew list's pucks */
const crew = await p.evaluate(() => { const c = [...document.querySelectorAll('.puck')].filter(e => e.closest('[class*="pal"], [class*="crew"], [id*="pal"], [id*="Pal"]') && e.getBoundingClientRect().width > 0); return { n: c.length, tabbable: c.filter(e => e.tabIndex >= 0).length } })
L.row('The crew list', 'Tab stops among its pucks', 'each name can be reached and picked up by keys', `${crew.n} names on screen, ${crew.tabbable} a Tab stop`, crew.n && !crew.tabbable ? 'GAP — the crew list cannot be reached by keyboard' : 'look')

/* Edit Schedule's week: the same puck question */
await p.keyboard.press('Escape')
await L.go(w, 'editsched')
const wk = await p.evaluate(() => { const c = [...document.querySelectorAll('#eWeek .puck')].filter(e => e.getBoundingClientRect().width > 0); return { n: c.length, tabbable: c.filter(e => e.tabIndex >= 0).length } })
L.row("Edit Schedule's week", 'Tab stops among its pucks', 'each puck can be reached', `${wk.n} pucks on screen, ${wk.tabbable} a Tab stop`, 'look')

/* the Tracker's chart */
await L.go(w, 'tracker')
await p.waitForSelector('#flowSvg .ball', { state: 'attached', timeout: 20000 })
const balls = await p.evaluate(() => { const b = [...document.querySelectorAll('#flowSvg .ball')]; return { n: b.length, tabbable: b.filter(e => e.tabIndex >= 0 || e.getAttribute('tabindex') === '0').length, role: b[0]?.getAttribute('role') || 'none' } })
L.row("Tracker's chart", 'Tab stops among its events', 'an event can be reached and its marking pop-up opened with Enter', `${balls.n} events drawn, ${balls.tabbable} a Tab stop (role ${balls.role})`, balls.tabbable ? 'look' : 'GAP — an event cannot be opened or marked without a mouse or a finger')
await L.close(w)
