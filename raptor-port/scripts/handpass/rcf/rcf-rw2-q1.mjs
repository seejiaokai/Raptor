console.log('rcf-rw2-q1 v1 — Q1: two clashes worded the same are two lines (D2001), desktop')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 'q1a'
process.env.HP_URL ||= 'http://localhost:4293'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/rewalk2/' + RUN)
const { mkdirSync } = await import('node:fs')
mkdirSync(process.env.HP_SHOTS, { recursive: true })
const R = await import('./rcf-rw-lib.mjs')
const { W, L, sleep, check, PASSIF, shot, sortie, ground, read, notPub, warnCrop } = R
const DI = 4
const browser = await W.launch()
const clash = o => o.lines.filter(l => /clash/.test(l.text) && notPub(l))
const redRings = o => o.boardRings.filter(x => /RED/.test(x))
const show = o => JSON.stringify(clash(o).map(l => [l.sev, l.state, l.struck, l.text])) + ' | ' + o.head + ' | board ' + o.boardRings + ' | week ' + o.weekRings

const { page } = await W.world(browser)
console.log('BUNDLE', await R.bundle(page))
const bane = await W.pid(page, 'Ranger')
await W.openBoard(page, DI)
const s1 = await sortie(page, DI, { who: bane, to: '1200', ld: '1300' })
const g1 = await ground(page, DI, { prog: 'BRIEFING', str: '1200', end: '1230', who: bane })
await W.openWarnFold(page)
let o = await read(page, DI, bane, 'step1')
let c = clash(o)
PASSIF('Q1.1 one red line "VL BFM & BRIEFING clash"', c.length === 1 && c[0].sev === 'RED' && c[0].state === 'live' && /VL BFM & BRIEFING clash/.test(c[0].text) && redRings(o).length >= 2, show(o), await warnCrop(page, 'q1-1-one-line'))
await W.hideIx(page, DI, c[0].ix)
o = await read(page, DI, bane, 'step2'); c = clash(o)
PASSIF('Q1.2 hidden: struck, pucks plain', c.length === 1 && c[0].state === 'HID' && c[0].struck && redRings(o).length === 0, show(o), await warnCrop(page, 'q1-2-hidden'))

/* step 3: second BRIEFING row 12:30-13:00, Ranger by the crew list, with the passing message watched */
const ri = await W.addGround(page, DI)
await W.setF(page, `gr:${DI}.${ri}.prog`, 'BRIEFING')
await W.setF(page, `gr:${DI}.${ri}.end`, '1300')
await W.setF(page, `gr:${DI}.${ri}.str`, '1230')
await page.evaluate(() => {
  window.__notes = []
  const seen = new Set()
  const grab = () => {
    for (const e of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(e)
      if (cs.position !== 'fixed' && cs.position !== 'absolute') continue
      if (e.offsetWidth === 0 || e.closest('#schedBoard .sb-warn')) continue
      const t = (e.innerText || '').replace(/\s+/g, ' ').trim()
      if (!t || t.length > 300 || !/clash|already|Blocked|Ranger/i.test(t)) continue
      const k = t + '|' + e.className
      if (seen.has(k)) continue
      seen.add(k)
      window.__notes.push({ t, cls: String(e.className).slice(0, 80), color: cs.color, bg: cs.backgroundColor, at: Math.round(performance.now()) })
    }
  }
  window.__noteObs = new MutationObserver(grab)
  window.__noteObs.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true })
})
await L.tap(page, `[data-fill="g:${DI}.${ri}.+"]`); await sleep(220)
const pk = page.locator(`#sbRoster .rpuck[data-person="${bane}"]:visible`).first()
await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
await pk.click()
const t0 = Date.now()
await page.screenshot({ path: process.env.HP_SHOTS + '/q1-3-right-after-press.png' })
const notes = await page.evaluate(() => window.__notes)
console.log('NOTES', JSON.stringify(notes), 'screenshot ms after click ~', Date.now() - t0)
await sleep(1200)
await W.openWarnFold(page)
o = await read(page, DI, bane, 'step3'); c = clash(o)
const hid = c.filter(l => l.state === 'HID'), live = c.filter(l => l.state === 'live')
PASSIF('Q1.3a two lines worded the same: first struck, second live and red', c.length === 2 && hid.length === 1 && live.length === 1 && live[0].sev === 'RED', show(o), await warnCrop(page, 'q1-3-two-lines'))
PASSIF('Q1.3b Ranger pucks red', redRings(o).length >= 2, 'board ' + o.boardRings + ' | week ' + o.weekRings, 'q1-3-board.png')
await shot(page, 'q1-3-board')
const redNote = notes.filter(n => /clash/i.test(n.t))
PASSIF('Q1.3c a RED passing message at the drop naming the clash (not only the amber "already on")', redNote.length > 0, JSON.stringify(notes), 'q1-3-right-after-press.png')

/* step 4: hide the second line too */
await W.hideIx(page, DI, live[0].ix)
o = await read(page, DI, bane, 'step4'); c = clash(o)
PASSIF('Q1.4 both struck, pucks plain', c.length === 2 && c.every(l => l.state === 'HID' && l.struck) && redRings(o).length === 0, show(o), await warnCrop(page, 'q1-4-both-hidden'))

/* step 5: move the second row to 15:00-15:30 */
await W.setF(page, `gr:${DI}.${ri}.end`, '1530'); await W.setF(page, `gr:${DI}.${ri}.str`, '1500'); await sleep(300)
o = await read(page, DI, bane, 'step5'); c = clash(o)
PASSIF('Q1.5 moved to 15:00-15:30: one line left, struck; pucks plain', c.length === 1 && c[0].state === 'HID' && c[0].struck && redRings(o).length === 0, show(o), await warnCrop(page, 'q1-5-moved-away'))

/* step 6: move back */
await W.setF(page, `gr:${DI}.${ri}.str`, '1230'); await W.setF(page, `gr:${DI}.${ri}.end`, '1300'); await sleep(300)
o = await read(page, DI, bane, 'step6'); c = clash(o)
PASSIF('Q1.6 moved back to 12:30-13:00: two lines, both struck', c.length === 2 && c.every(l => l.state === 'HID' && l.struck) && redRings(o).length === 0, show(o), await warnCrop(page, 'q1-6-moved-back'))

/* step 7: delete second row */
const nG0 = await page.evaluate(d => window.DAYS[d].ground.length, DI)
await L.tap(page, `[data-grdel="${DI}.${ri}"]`); await sleep(500)
const nG = await page.evaluate(d => window.DAYS[d].ground.length, DI)
o = await read(page, DI, bane, 'step7'); c = clash(o)
PASSIF('Q1.7 second row deleted: one line, struck', nG === nG0 - 1 && c.length === 1 && c[0].state === 'HID' && c[0].struck && redRings(o).length === 0, `rows ${nG0}->${nG} | ` + show(o), await warnCrop(page, 'q1-7-deleted'))

/* step 8: reset */
await W.hideIx(page, DI, c[0].ix)
o = await read(page, DI, bane, 'step8'); c = clash(o)
PASSIF('Q1.8 Reset arrow: live and red', c.length === 1 && c[0].state === 'live' && c[0].sev === 'RED' && redRings(o).length >= 2, show(o), await warnCrop(page, 'q1-8-reset'))

/* step 9: undo then redo */
await page.locator('#sbUndo').click(); await sleep(700)
o = await read(page, DI, bane, 'step9 undo'); c = clash(o)
const afterUndo = show(o)
const undoStruck = c.length >= 1 && c.every(l => l.state === 'HID')
await warnCrop(page, 'q1-9-undo')
await page.locator('#sbRedo').click(); await sleep(700)
o = await read(page, DI, bane, 'step9 redo'); c = clash(o)
const redoLive = c.length === 1 && c[0].state === 'live' && c[0].sev === 'RED'
PASSIF('Q1.9 Undo: struck; Redo: live and red', undoStruck && redoLive, 'UNDO: ' + afterUndo + ' || REDO: ' + show(o), await warnCrop(page, 'q1-9-redo'))
await shot(page, 'q1-9-board')
await page.close()
R.finish()
await browser.close()
