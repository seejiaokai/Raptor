/* JOB 8 / D18 — a SECOND man the scheduler puts on a landed request row earns
   from it, with his own switch, and taking one off never touches the other.
   The requester stays on his own answer (the input half), so his No can never
   be overridden and he is never paid twice.

   Talisman's Training claim landed on ground row g:5.2. Outside the mode the
   row's programme name lives in an editable box, so innerText does not carry
   it — address the row by its seat, not by its words. */
import { open, board, openInputs, tap, shot, SHOTS } from './lib.mjs'
const { browser, page, errors } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
const L = []; const S = (k, v) => { L.push({ [k]: v }); return v }
const ROW = 'g:5.2'
const rowOf = `(() => [...document.querySelectorAll('#schedBoard .grnd .sb-arow')].find(e => e.querySelector('[data-slot^="${ROW}"]')))`

await board(page, 5); await openInputs(page, 5)

/* ---- add the second man, by DRAGGING him onto the row's own drop zone --
   "+ ADD" is a `span.addz` drop target, not a button, and the board uses real
   HTML5 drag & drop — so this is the app's own door, driven the way a mouse
   drives it. There is no keyboard or button equivalent, which the 21 Sep sheet
   already noted for the reverse direction (taking a man OFF a row). */
/* A MAN WHO EARNS NOTHING YET — Ace was already on HO from elsewhere on this
   busy Saturday, so using him proves nothing either way. Pick someone the day
   pays nothing, and the row becomes the only thing that could pay him. */
const WHO = await page.evaluate(() => {
  const f = window.oilDayFigures(window.SBDAY)
  const p = [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
    .map(e => e.getAttribute('data-person'))
    .find(id => id && !/^all/.test(id) && !f[id] && (window.PEOPLE || {})[id])
  return p || null
})
S('a man the day pays nothing', { who: WHO, name: await page.evaluate(w => ((window.PEOPLE || {})[w] || {}).cs, WHO) })
const src = `#sbRoster .rpuck[data-person="${WHO}"]`
const dst = await page.evaluate(sel => {
  const r = [...document.querySelectorAll('#schedBoard .grnd .sb-arow')].find(e => e.querySelector(`[data-slot^="${sel}"]`))
  /* the drop TARGET is the `.ppl` wrapper carrying data-fill ("g:5.2.+" — the
     row's next free seat); `.addz` is only the label inside it, and aiming at
     the label lands on the wrapper anyway */
  const z = r && r.querySelector('[data-fill]')
  if (z) z.setAttribute('data-hp-drop', '1')
  return z && z.getAttribute('data-fill')
}, ROW)
S('the row offers a drop zone', dst)
S('BEFORE the drag, what the second man earns', await page.evaluate((W) => {
  const f = window.oilDayFigures(window.SBDAY); return { secondMan: f[W] || 'NOTHING', talisman: f['haowen'] || 'NOTHING' }
}, WHO))
await page.locator(src).scrollIntoViewIfNeeded()
await page.dragAndDrop(src, '[data-hp-drop="1"]')
await page.waitForTimeout(1000)
S('who is on the row now', await page.evaluate(sel => {
  const r = [...document.querySelectorAll('#schedBoard .grnd .sb-arow')].find(e => e.querySelector(`[data-slot^="${sel}"]`))
  return [...r.querySelectorAll('[data-slot]')].map(e => ({ slot: e.getAttribute('data-slot'), who: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 16) }))
}, ROW))
await shot(page, 'j8-01-second-man-added')

/* ---- now the mode: does the SECOND man earn, with his own switch? ------- */
await tap(page, '#sbOil'); await page.waitForTimeout(900)
S('THE ROW IN THE MODE', await page.evaluate(sel => {
  const r = [...document.querySelectorAll('#schedBoard .grnd .sb-arow')].find(e => e.querySelector('.oilpk'))
    && [...document.querySelectorAll('#schedBoard .grnd .sb-arow')].filter(e => /Talisman/i.test(e.textContent || ''))[0]
  if (!r) return 'ROW NOT FOUND IN THE MODE'
  return {
    row: (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50),
    nameCellSays: (r.querySelector('.oilitem')?.title || '').slice(0, 76),
    pucks: [...r.querySelectorAll('.oilpk')].map(p => ({
      who: p.getAttribute('data-oilp'), item: p.getAttribute('data-oilitem'),
      inert: p.className.includes('inert'), says: (p.title || '').replace(/\s+/g, ' ').slice(0, 76),
    })),
  }
}, ROW))
await shot(page, 'j8-02-mode-two-men')

/* ---- THE MONEY, not the screen ---------------------------------------- */
S('what the day pays', await page.evaluate((W) => {
  const figs = window.oilDayFigures(window.SBDAY)
  const ev = window.oilEvidenceOf(window.SBDAY)
  return {
    talisman: figs['haowen'] || 'NOTHING',
    theSecondMan: figs[W] || 'NOTHING',
  }
}, WHO))

/* ---- D18's other half: taking ONE off must not touch the other -------- */
const figs = () => page.evaluate(W => {
  const f = window.oilDayFigures(window.SBDAY)
  return { requester: f['haowen'] || 'NOTHING', second: f[W] || 'NOTHING' }
}, WHO)
await tap(page, `[data-oilp="${WHO}"]`); await page.waitForTimeout(700)
S('after taking the SECOND man off', await figs())
await shot(page, 'j8-03-second-man-off')
await tap(page, `[data-oilp="${WHO}"]`); await page.waitForTimeout(600)
await tap(page, '[data-oilp="haowen"]'); await page.waitForTimeout(700)
S('after taking the REQUESTER off instead', await figs())
await shot(page, 'j8-04-requester-off')
console.log(JSON.stringify(L, null, 1)); console.log('errors:', errors.slice(0, 4))
console.log('shots in ' + SHOTS)
await browser.close()
