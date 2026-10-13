/* THE DESIGN LOOK — the keyboard on a puck, and on the Tracker's chart (desktop only): can a puck be picked up and put
   down by keys; can an event of the chart be opened by keys.
   NOTHING THIS SCRIPT LOOKS AT WAS BUILT IN THE SMALL FIXES OF 14 OCT 26 ([LOOK-13OCT-SMALL-FIXES], owner D830): the keys
   on a puck (K11 — [KBD-PUCK]) and the chart's events by keyboard (K5 — [TRK-KBD-CHART]) are jobs of their own, his to
   place. So on the re-walk its lines are not "works / FAIL": where a thing is still as the look found it the line says
   `OPEN — <which job>, not in this batch: <what was seen>`; where it is NOT as the look found it, it says `CHANGED — …`
   with what was seen, for a person to read — the script does not judge behaviour nobody has designed yet.
   (The keys that WERE built are checked by dl-cal.mjs — K1 to K4 — and dl-trk.mjs — K12, with the proof that the
   Tracker's own Delete does nothing to the chart from a date box.)
   node scripts/handpass/dl-keys.mjs */
import * as L from './dl-lib.mjs'
console.log(`dl-keys.mjs — the open keyboard jobs, read again (written 14 Oct 26) · desk · pictures and keyboard.json → ${L.SHOTS}`)
const w = await L.world('desk')
const p = w.page
const PUCK = 'OPEN — K11 ([KBD-PUCK]), not in this batch: ', CHART = 'OPEN — K5 ([TRK-KBD-CHART]), not in this batch: '
const changed = saw => `CHANGED — not as the look found it; nobody has designed this yet, so it is not judged: ${String(saw).slice(0, 300)}`

try {
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
  const sawArm = `on ${who.split(' · ')[0]} (${who.split(' · ')[1]}) — before ${JSON.stringify(a0)} · after Enter ${JSON.stringify(a1)} · after Space ${JSON.stringify(a2)}`
  const still = JSON.stringify(a0) === JSON.stringify(a1) && JSON.stringify(a1) === JSON.stringify(a2)
  L.row('A puck on the Scheduler Board', 'Enter, then Space, on a puck the keyboard is on', 'it is picked up (armed) as a tap does on a phone — then arrows or Tab to a seat and Enter to put it down', sawArm, still ? PUCK + 'nothing happens — the keyboard can stand on a puck but cannot pick it up' : changed(sawArm))
  await p.keyboard.press('Delete'); await L.sleep(250)
  const stillThere = await p.evaluate(() => !!document.activeElement?.closest?.('.puck'))
  const sawDel = stillThere ? 'the keyboard is still on the puck: nothing happened' : `the keyboard is now on ${await L.focusOf(w)}`
  L.row('A puck on the Scheduler Board', 'Delete on a puck', 'takes the man off the seat (as dragging him off does), with Undo', sawDel, stillThere ? PUCK + 'nothing happens' : changed(sawDel))

  /* the crew list's pucks */
  const crew = await p.evaluate(() => { const c = [...document.querySelectorAll('.puck')].filter(e => e.closest('[class*="pal"], [class*="crew"], [id*="pal"], [id*="Pal"]') && e.getBoundingClientRect().width > 0); return { n: c.length, tabbable: c.filter(e => e.tabIndex >= 0).length } })
  const sawCrew = `${crew.n} names on screen, ${crew.tabbable} a Tab stop`
  L.row('The crew list', 'Tab stops among its pucks', 'each name can be reached and picked up by keys', sawCrew, crew.n && !crew.tabbable ? PUCK + 'the crew list cannot be reached by keyboard' : PUCK + `recorded only — ${sawCrew}`)

  /* Edit Schedule's week: the same puck question */
  await p.keyboard.press('Escape')
  await L.go(w, 'editsched')
  const wk = await p.evaluate(() => { const c = [...document.querySelectorAll('#eWeek .puck')].filter(e => e.getBoundingClientRect().width > 0); return { n: c.length, tabbable: c.filter(e => e.tabIndex >= 0).length } })
  const sawWk = `${wk.n} pucks on screen, ${wk.tabbable} a Tab stop`
  L.row("Edit Schedule's week", 'Tab stops among its pucks', 'each puck can be reached', sawWk, PUCK + `recorded only — ${sawWk}`)

  /* the Tracker's chart */
  await L.go(w, 'tracker')
  await p.waitForSelector('#flowSvg .ball', { state: 'attached', timeout: 20000 })
  const balls = await p.evaluate(() => { const b = [...document.querySelectorAll('#flowSvg .ball')]; return { n: b.length, tabbable: b.filter(e => e.tabIndex >= 0 || e.getAttribute('tabindex') === '0').length, role: b[0]?.getAttribute('role') || 'none' } })
  const sawBalls = `${balls.n} events drawn, ${balls.tabbable} a Tab stop (role ${balls.role})`
  L.row("Tracker's chart", 'Tab stops among its events', 'an event can be reached and its marking pop-up opened with Enter', sawBalls, balls.tabbable ? changed(sawBalls) : CHART + 'an event cannot be opened or marked without a mouse or a finger')
} finally { await L.close(w) }
