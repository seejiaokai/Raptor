console.log('rcf-rw3-t1 v1 — T1: a second clash worded the same, announced at the drop (HIDE=0: first line showing; HIDE=1: first line hidden), desktop')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const HIDE = process.env.HIDE === '1'
const RUN = process.env.RUN || (HIDE ? 't1-hidden' : 't1-showing')
process.env.HP_URL ||= 'http://localhost:4294'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/rewalk3/' + RUN)
const { mkdirSync } = await import('node:fs')
mkdirSync(process.env.HP_SHOTS, { recursive: true })
const R = await import('./rcf-rw-lib.mjs')
const { W, L, sleep, PASSIF, shot, sortie, ground, read, notPub, warnCrop } = R
const DI = 4
const browser = await W.launch()
const clash = o => o.lines.filter(l => /clash/.test(l.text) && notPub(l))
const redRings = o => o.boardRings.filter(x => /RED/.test(x))
const show = o => JSON.stringify(clash(o).map(l => [l.sev, l.state, l.struck, l.text])) + ' | ' + o.head + ' | board ' + o.boardRings + ' | week ' + o.weekRings

const { page } = await W.world(browser)
console.log('BUNDLE', await R.bundle(page))
const bane = await W.pid(page, 'Ranger')
await W.openBoard(page, DI)
await sortie(page, DI, { who: bane, to: '1200', ld: '1300' })
await ground(page, DI, { prog: 'BRIEFING', str: '1200', end: '1230', who: bane })
await W.openWarnFold(page)
let o = await read(page, DI, bane, 'step1')
let c = clash(o)
PASSIF('T1.1 one red line "VL BFM & BRIEFING clash"', c.length === 1 && c[0].sev === 'RED' && c[0].state === 'live' && /VL BFM & BRIEFING clash/.test(c[0].text) && redRings(o).length >= 2, show(o), await warnCrop(page, 't1-1-one-line'))
if (HIDE) {
  await W.hideIx(page, DI, c[0].ix)
  o = await read(page, DI, bane, 'step2 hidden'); c = clash(o)
  PASSIF('T1.2 first clash hidden: struck, pucks plain', c.length === 1 && c[0].state === 'HID' && c[0].struck && redRings(o).length === 0, show(o), await warnCrop(page, 't1-2-hidden'))
}

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
await page.screenshot({ path: process.env.HP_SHOTS + '/t1-3-right-after-press.png' })
const notes = await page.evaluate(() => window.__notes)
console.log('NOTES', JSON.stringify(notes), 'screenshot ms after click ~', Date.now() - t0)
await sleep(300)
await page.screenshot({ path: process.env.HP_SHOTS + '/t1-3-after-300ms.png' })
const notes2 = await page.evaluate(() => window.__notes)
console.log('NOTES2', JSON.stringify(notes2))
await sleep(1000)
await W.openWarnFold(page)
o = await read(page, DI, bane, 'step3'); c = clash(o)
const hid = c.filter(l => l.state === 'HID'), live = c.filter(l => l.state === 'live')
if (HIDE) {
  PASSIF('T1.3a two lines worded the same: first struck, second live and red', c.length === 2 && hid.length === 1 && live.length === 1 && live[0].sev === 'RED', show(o), await warnCrop(page, 't1-3-two-lines'))
} else {
  PASSIF('T1.3a two red lines worded the same, both live', c.length === 2 && live.length === 2 && live.every(l => l.sev === 'RED'), show(o), await warnCrop(page, 't1-3-two-lines'))
}
PASSIF('T1.3b Ranger pucks red', redRings(o).length >= 2, 'board ' + o.boardRings + ' | week ' + o.weekRings, 't1-3-board.png')
await shot(page, 't1-3-board')
const redNote = notes2.filter(n => /clash/i.test(n.t))
PASSIF('T1.3c a RED passing message naming the clash right after the press', redNote.length > 0, JSON.stringify(notes2), 't1-3-right-after-press.png')
await page.close()
R.finish()
await browser.close()
