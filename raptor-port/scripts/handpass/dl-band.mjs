/* THE BAR THAT STAYS, DRAWN IN ITS NEW PLACE — the band under the top bar ([LOOK-13OCT-SMALL-FIXES], owner D831, 13 Oct 26:
   "the bar that stays … takes the band under the top bar, where the 'Not saved' warning sits (D587) … a picture is put
   to him before it is built"). Pictures for him at his iPhone's size and a desktop's, BEFORE that piece is built.

   WHAT IS REAL AND WHAT IS DRAWN IN. The "today" pictures are the built app untouched: a real drag of one puck onto
   another on Saturday 18 Jul 26, the OIL question left unanswered, the bar the app then shows at the foot. In the
   "drawn" pictures that bar is hidden and its OWN words and its OWN two buttons (cloned from it — nothing restyled) are
   set into a band built from the app's own failed-save band (`.saveband`, 17-save-status.css): the same height, the
   same amber, the same place — the last line of the Scheduler Board's own bar (the board covers the top bar), or the
   line along the bottom of the top bar on Edit Schedule. The only rules the app does not already have are the block
   marked NEW. Nothing behind the drawn band works.
   The set-up is dl-oil.mjs's own (a Training filed on the Saturday through the Inputs calendar, a plain row beside it).
   Run against a served build of the app as it stood BEFORE this job's changes:
     DL_BASE=http://localhost:4191 node scripts/handpass/dl-band.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
const size = process.argv[2] || 'phone'
const SHOTS = resolve(L.ROOT, 'docs/mock/2026-10-14-oil-band')
mkdirSync(SHOTS, { recursive: true })
const w = await L.world(size)
const p = w.page
const K = size
const SAT = '2026-07-18', SAT_DI = 5
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const pic = async (name, clip) => { await p.screenshot({ path: resolve(SHOTS, `${name}.png`), ...(clip ? { clip } : {}) }); console.log('   pic', name) }

/* ---- the set-up: dl-oil.mjs's, to the bar ---- */
await L.go(w, 'inputs')
if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await w.press('#inCalBtn')
await p.waitForSelector('#inpCal')
for (let i = 0; i < 36 && !(await p.locator(`[data-icday="${SAT}"]`).count()); i++) {
  const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
  const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)), want = +SAT.slice(0, 4) * 12 + (+SAT.slice(5, 7) - 1)
  await w.press(at < want ? '#icNext' : '#icPrev')
}
await p.locator(`[data-icday="${SAT}"]`).focus()
await p.keyboard.press('Enter')
await p.waitForSelector('[data-testid="win-inputsday"]')
await w.press('#icPopAdd')
await p.waitForSelector('#inpEditPop #inpEditType')
await p.selectOption('#inpEditPop #inpEditType', 'Training')
await p.selectOption('#inpEditPop #inpEditPerson', 'bane')
const ad = p.locator('#inpEditPop #inpEditAllday')
if (await ad.count() && await ad.isChecked()) await ad.click()
await p.fill('#inpEditPop #inpEditStart', '09:00'); await p.fill('#inpEditPop #inpEditEnd', '12:00')
await p.fill('#inpEditPop #inpEditOwnTitle', 'Range brief')
await w.press('#inpEditSave')
await p.waitForSelector('[data-testid="oilconf"]'); await L.sleep(300)
await w.press('[data-testid="oil-yes"]'); await w.press('[data-testid="oilconf-save"]')
await p.waitForSelector('#inpEditPop', { state: 'hidden' })
await p.locator('[data-testid="win-inputsday-x"]').click()

await L.go(w, 'editsched')
await p.locator(`#eWeek [data-sbday="${SAT_DI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
await p.waitForSelector('#sbBoard .sb-sec', { state: 'attached' })
await p.evaluate(di => { const W = window; W.DAYS[di].ground.push({ prog: 'Hangar open day', str: '13:00', end: '15:00', who: '', rmks: '' }); W.afterSchedMutate(); W.fillSlot(`g:${di}.${W.DAYS[di].ground.length - 1}.+`, 'nick'); W.afterSchedMutate() }, SAT_DI)
await L.sleep(400)
const from = `#sbBoard [data-slot="g:${SAT_DI}.1"] .puck`, to = `#sbBoard [data-slot="g:${SAT_DI}.0"] .puck`
await p.locator(to).evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
const fb = await p.locator(from).boundingBox(), tb = await p.locator(to).boundingBox()
await p.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2); await p.mouse.down()
await p.mouse.move(fb.x + fb.width / 2 + 6, fb.y + fb.height / 2 + 6, { steps: 3 })
await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 14 })
await p.mouse.move(tb.x + tb.width / 2 + 1, tb.y + tb.height / 2 + 1)
await p.mouse.up()
await p.waitForSelector('[data-testid="oilconf-lead"]'); await L.sleep(300)
await w.press('[data-testid="oilconf-cancel"]')
await p.waitForSelector('[data-testid="oilbar"]'); await L.sleep(900)     // the two pucks' flash has ended
await p.addStyleTag({ content: '#toastEl{display:none !important}' })
const today = await p.evaluate(() => { const r = document.querySelector('[data-testid="oilbar"]').getBoundingClientRect(); const t = document.querySelector('#schedBoard .sb-top').getBoundingClientRect(); return { bar: `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)}`, boardBar: Math.round(t.height) } })
console.log('TODAY', JSON.stringify(today))
await pic(`band-${K}-0-today-board`)

/* ---- the drawing ---- */
const CSS = `
/* NEW — the only rules the app does not already have. The band's box, height and amber are the failed-save band's own
   (.saveband); the two buttons are the bar's own, cloned. */
.dlb-hide{display:none !important}
.dlb-band{justify-content:flex-end}
.dlb-band .dlb-msg{min-width:0;font-weight:700;color:#FFF0D6}
.dlb-band .secdef-btn{flex:0 0 auto;padding:4px 12px;white-space:nowrap}
/* on a phone: the words at the left, the two buttons at the right, as the failed-save band has its words and Retry */
@media (max-width:820px){ .dlb-band{justify-content:flex-start;gap:8px} .dlb-band .dlb-msg{flex:1 1 auto} }
/* IF THE LETTERS ARE WIDER THAN THE LINE HOLDS (his iPhone's): the words keep one unbroken line and the two buttons go
   under them, at the right — the band is then two lines tall; no word is cut */
.dlb-band.dlb-two{height:auto;flex-wrap:wrap;padding-top:6px;padding-bottom:7px;row-gap:5px}
.dlb-band.dlb-two .dlb-msg{flex:1 0 100%;white-space:nowrap}
.dlb-band.dlb-two .secdef-btn:first-of-type{margin-left:auto}
/* on the top bar the band is fixed along the bar's bottom line, as the failed-save band is */
.dlb-fixed{position:fixed;left:0;right:0;z-index:61}
.dlb-wide .dlb-band, .dlb-wide.dlb-band{font-size:14.3px}
.dlb-wide .secdef-btn{font-size:13.7px}
`
await p.addStyleTag({ content: CSS })

/** stage one picture: `where` = 'board' | 'week'; `both` = the failed-save warning up as well; `wide` = letters a seventh wider */
const stage = (where, { both = false, wide = false } = {}) => p.evaluate(([where, both, wide]) => {
  document.querySelectorAll('.dlb-new').forEach(n => n.remove())
  const bar = document.querySelector('[data-testid="oilbar"]')
  if (!bar) return { err: 'the bar is gone' }
  bar.classList.add('dlb-hide')
  const mk = (cls) => {
    const b = document.createElement('div'); b.className = `saveband dlb-band dlb-new ${cls || ''}`; b.setAttribute('role', 'status')
    const msg = document.createElement('span'); msg.className = 'dlb-msg'; msg.textContent = bar.querySelector('.secdef-msg').textContent
    b.append(msg, ...[...bar.querySelectorAll('button')].map(x => x.cloneNode(true)))
    return b
  }
  const saveWarn = (cls) => {
    const s = document.createElement('div'); s.className = `saveband dlb-new ${cls || ''}`; s.setAttribute('role', 'status')
    s.innerHTML = '<span class="sv-msg"><span class="sv-ico" aria-hidden="true">⚠</span>Not saved — keep this page open</span><button type="button">Retry</button>'
    return s
  }
  let band
  if (where === 'board') {
    const top = document.querySelector('#schedBoard .sb-top') || document.querySelector('.sb-top')
    if (both) top.append(saveWarn())
    band = mk(); top.append(band)
  } else {
    const tb = document.querySelector('#shell .topbar')
    const base = parseFloat(getComputedStyle(tb).paddingBottom)
    tb.dataset.dlbPad = tb.dataset.dlbPad || String(base)
    const pad0 = +tb.dataset.dlbPad
    const place = (el, fromBottom) => { el.classList.add('dlb-fixed'); document.body.append(el); return el }
    const sw = both ? place(saveWarn()) : null
    band = place(mk())
    if (wide) band.classList.add('dlb-wide')
    /* two lines where one does not hold the words and both buttons */
    const fits = () => band.scrollWidth <= band.clientWidth + 0.5 && band.querySelector('.dlb-msg').scrollWidth <= band.querySelector('.dlb-msg').clientWidth + 0.5
    if (!fits()) band.classList.add('dlb-two')
    const h = band.offsetHeight + (sw ? sw.offsetHeight : 0)
    tb.style.paddingBottom = (pad0 + h) + 'px'
    const bottom = tb.getBoundingClientRect().bottom - (parseFloat(getComputedStyle(tb).borderBottomWidth) || 0)
    band.style.top = (bottom - band.offsetHeight) + 'px'
    if (sw) sw.style.top = (bottom - h) + 'px'
  }
  if (where === 'board') {
    if (wide) band.classList.add('dlb-wide')
    const m = band.querySelector('.dlb-msg')
    if (band.scrollWidth > band.clientWidth + 0.5 || m.scrollWidth > m.clientWidth + 0.5) band.classList.add('dlb-two')
  }
  const r = band.getBoundingClientRect(), m = band.querySelector('.dlb-msg').getBoundingClientRect()
  const btns = [...band.querySelectorAll('button')].map(b => { const q = b.getBoundingClientRect(); return `${b.textContent.trim()}:${Math.round(q.width)}×${Math.round(q.height)}@${Math.round(q.left)}` })
  return { where, both, wide, band: `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)}`, twoLines: band.classList.contains('dlb-two'), words: `${Math.round(m.width)} wide, ${Math.round(m.height)} tall`, btns, overflow: document.documentElement.scrollWidth > innerWidth }
}, [where, both, wide])
const shoot = async (name, where, o) => {
  const m = await stage(where, o)
  if (!m || m.err) throw new Error('not drawn: ' + name + ' ' + (m && m.err))
  await L.sleep(250)
  /* the premise, asserted before the picture: the drawn band is on the page and the built bar is hidden */
  const ok = await p.evaluate(() => !!document.querySelector('.dlb-band') && getComputedStyle(document.querySelector('[data-testid="oilbar"]')).display === 'none')
  if (!ok) throw new Error('the drawing was wiped before the picture: ' + name)
  console.log('DRAWN', name, JSON.stringify(m))
  await pic(name)
  if (!w.phone) { const r = await p.locator('.dlb-band').first().boundingBox(); await pic(name + '-close-up', { x: Math.max(0, r.x + r.width - 760), y: Math.max(0, r.y - 70), width: 760, height: 150 }) }
}

await shoot(`band-${K}-1-drawn-board`, 'board')
if (w.phone) await shoot(`band-${K}-2-drawn-board-wider-letters`, 'board', { wide: true })
await shoot(`band-${K}-3-drawn-board-both-warnings`, 'board', { both: true })

/* Edit Schedule's week: the board closed (the bar stays — nothing was swapped), the band along the bottom of the top bar */
await p.evaluate(() => document.querySelectorAll('.dlb-new').forEach(n => n.remove()))
await p.evaluate(() => document.querySelector('[data-testid="oilbar"]').classList.remove('dlb-hide'))
await p.evaluate(() => { const b = document.querySelector('#sbClose') || document.querySelector('#sbDone'); b.click() })
await L.sleep(700)
await p.evaluate(() => window.clearToast && window.clearToast())
if (!(await p.locator('[data-testid="oilbar"]').count())) console.log('NOTE: closing the board took the bar away — the week pictures are drawn from a remembered copy')
else {
  await pic(`band-${K}-4-today-week`)
  await shoot(`band-${K}-5-drawn-week`, 'week')
  if (w.phone) await shoot(`band-${K}-6-drawn-week-wider-letters`, 'week', { wide: true })
  await shoot(`band-${K}-7-drawn-week-both-warnings`, 'week', { both: true })
}
await L.close(w)
