// Chat 192, 27 Nov 26 — his brainstorm (F5): "what about inputting new inputs like LL OL CSE etc? Are there buttons for
// it?", then "use impeccable to draw". Drawn on the REAL app: the Inputs page's own "+ Input" window, opened by a
// member (Hex, signed in as himself), its Type dropdown replaced, in the page, by the proposal built from the window's
// own parts — the Duration picker's buttons (`.spanbtn`), its field label (`.inped-k`), the type legend's group heading
// look (`.tylegend-gt`). The groups and codes are read from the real dropdown's own <optgroup>s, so nothing is invented.
// Frames (each a fresh reload; nothing under raptor-port/src changes, nothing is saved):
//   a1 today — the window as it opens, the Type dropdown
//   a2 proposed — empty: every type on view in its group, the rest of the form waiting, Add not yet live
//   a3 proposed — Hex picked CSE for himself, Ghost and Dash (staged through the real dropdown and "Several people", so
//      the form below is the app's own for a course); the types fold to one line with "Change"
//   a4 proposed — "Change" pressed with three people on: Leave and Medical shut, with the reason, by the Inputs rule
//      that a member files only duties and commitments for others
// Run from raptor-port/, one size a process, against an already-served build:
//   node docs/mock/2026-11-27-add-window/draw-add-window.mjs --size d --url http://127.0.0.1:4181/
//   node docs/mock/2026-11-27-add-window/draw-add-window.mjs --size p --url http://127.0.0.1:4181/
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
const VERSION = 'draw-add-window v1.0 (27 Nov 26, chat 192)'
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d }
const SIZE = arg('size', 'd'), URL = arg('url', 'http://127.0.0.1:4181/')
const IMG = path.resolve(arg('img', 'docs/mock/2026-11-27-add-window/img'))
const ONLY = arg('only', '1,2,3,4').split(',')
const PHONE = SIZE === 'p'
const PWROOT = arg('pw', process.cwd() + '/package.json')
console.log(VERSION, '| size', PHONE ? 'phone 402x874 WebKit 3x' : 'desktop 1536x864 Chromium 2x', '| build', URL)
mkdirSync(IMG, { recursive: true })
const PW = createRequire(PWROOT)('playwright')
const sleep = ms => new Promise(r => setTimeout(r, ms))

/* the drafted words — the only new words on screen; a fresh Fable reads them before any build (D2441) */
const W = {
  othersOnly: 'For other people, only duties and commitments.',
  change: 'Change',
}

async function press(p, loc) {
  const l = typeof loc === 'string' ? p.locator(loc).first() : loc
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (PHONE) await l.tap(); else await l.click()
}
const MARKCSS = `.dcr-mk{outline:2px solid #FFC83D !important;outline-offset:2px}
.dcr-tag{position:fixed;z-index:2147483647;background:#FFC83D;color:#15171c;font:800 11px/17px system-ui,sans-serif;padding:0 6px;border-radius:9px;pointer-events:none;box-shadow:0 0 0 1px #15171c}
/* the proposal, in the window's own measures: the Duration picker's 36px buttons, its colours and small capitals */
.dk-kinds{display:flex;flex-direction:column;gap:9px;min-width:0}
.dk-g{display:flex;flex-direction:column;gap:5px;min-width:0}
.dk-gl{font-size:9.5px;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);font-weight:700}
.dk-row{display:flex;flex-wrap:wrap;gap:5px}
.dk-row .spanbtn.dk-chip{flex:0 0 auto;min-width:46px;height:36px;padding:0 11px;border-radius:8px;border-right-width:1px}
.dk-row .spanbtn.dk-chip+.spanbtn{border-left-color:var(--edge)}
.dk-g.shut .dk-row{opacity:.32;pointer-events:none}
.dk-why{font-size:12px;color:var(--ink-3);line-height:1.35}
.dk-fold{display:flex;align-items:center;gap:10px;min-height:36px}
.dk-fold .spanbtn.dk-chip{flex:0 0 auto;min-width:56px;height:36px;padding:0 12px;border-radius:8px;border-right-width:1px}
.dk-name{color:var(--ink);font-size:14px;font-weight:600;flex:1;min-width:0}
.dk-change{background:none;border:0;color:var(--accent);font:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:6px 2px}
.dk-wait{opacity:.32;pointer-events:none;filter:saturate(.6)}
.dk-off{opacity:.4;pointer-events:none}
#inpEditPop.dk-on #inpEditType{display:none !important}`
async function signIn(p) {
  await p.goto(URL, { timeout: 60000, waitUntil: 'commit' })
  await p.waitForSelector('#luser', { timeout: 60000 })
  await p.fill('#luser', 'hex'); await p.fill('#lpass', 'x'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#notifyBell', { timeout: 60000 }); await sleep(800)
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' + MARKCSS })
}
async function toInputs(p) {
  const re = /^\s*Inputs\s*$/
  const vis = p.locator('button:visible, a:visible').filter({ hasText: re })
  if (await vis.count()) await press(p, vis.first())
  else { await press(p, p.locator('[aria-label="Menu"]:visible').first()); await sleep(500); await press(p, p.locator('button:visible, a:visible').filter({ hasText: re }).first()) }
  await sleep(1000)
  if (await p.locator('#inListBtn:visible').count()) { await press(p, '#inListBtn'); await sleep(400) }
}
async function openNew(p) {
  await toInputs(p)
  await press(p, '#inNew')
  await p.waitForSelector('#inpEditPop', { timeout: 8000 }); await sleep(500)
}
async function tags(p, list) {
  await p.evaluate(list => {
    document.querySelectorAll('.dcr-tag').forEach(t => t.remove())
    for (const [sel, text, side] of list) {
      const e = [...document.querySelectorAll(sel)].filter(x => x.getBoundingClientRect().width > 0)[0]
      if (!e) continue
      const r = e.getBoundingClientRect(), t = document.createElement('span')
      t.className = 'dcr-tag'; t.textContent = text; document.body.appendChild(t)
      const tw = t.getBoundingClientRect().width
      t.style.left = (side === 'r' ? Math.min(innerWidth - tw - 2, r.right + 4) : Math.max(2, r.left - tw - 6)) + 'px'
      t.style.top = Math.max(2, r.top + 1) + 'px'
    }
  }, list)
}
/* the picture: the window itself (on a phone it is the screen), and its tags */
async function shot(p, name) {
  await sleep(300)
  /* the drawing must still stand after the form settled: the app may have redrawn the row */
  const ok = await p.evaluate(() => !!document.querySelector('#inpEditPop .dk-host') && getComputedStyle(document.getElementById('inpEditType')).display === 'none')
  if (!ok && !name.includes('today')) throw new Error('the drawn part did not survive the app redrawing the window: ' + name)
  if (PHONE) await p.mouse.click(2, 2).catch(() => {})
  const box = await p.evaluate(() => {
    const rs = [document.getElementById('inpEditPop'), ...document.querySelectorAll('.dcr-tag')].filter(Boolean).map(e => e.getBoundingClientRect())
    const x = Math.max(0, Math.min(...rs.map(r => r.left)) - 14), y = Math.max(0, Math.min(...rs.map(r => r.top)) - 10)
    const x2 = Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + 10), y2 = Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)) + 10)
    return { x, y, width: x2 - x, height: y2 - y }
  })
  const f = `${name}-${PHONE ? 'phone' : 'desktop'}.png`
  await p.screenshot({ path: path.join(IMG, f), clip: box })
  console.log('  picture', f, Math.round(box.width) + 'x' + Math.round(box.height))
}
/* builds the proposal in place of the Type dropdown. mode: 'empty' | 'fold' | 'shut' */
async function propose(p, mode, W) {
  return p.evaluate(({ mode, W }) => {
    const win = document.getElementById('inpEditPop')
    const sel = document.getElementById('inpEditType')
    const row = sel.closest('.inped-f')
    const groups = [...sel.querySelectorAll('optgroup')].map(g => ({ label: g.label, codes: [...g.querySelectorAll('option')].map(o => ({ v: o.value, t: o.textContent.trim() })) }))
    const cur = sel.value
    /* hidden by a class on the window, not on the dropdown: the app redraws the dropdown as the form settles */
    win.classList.add('dk-on')
    win.querySelectorAll('*').forEach(e => { if (e.scrollTop) e.scrollTop = 0 })
    win.scrollTop = 0
    const host = document.createElement('div'); host.className = 'dk-host'
    if (mode === 'fold') {
      /* the kind's own name, as the type legend gives it (engine/inputs.ts INPUT_META), first letter raised */
      const NAMES = { LL: 'local leave', OL: 'overseas leave', OIL: 'off in lieu', CCL: 'childcare leave', PL: 'paternity leave', FCL: 'family care leave', EL: 'embarkation leave', CL: 'compassionate leave', HL: 'hospitalisation leave', OML: 'ordinary medical leave', Training: 'training', CSE: 'course', Meeting: 'meeting', Personal: 'personal', Appointment: 'appointment', Duty: 'duty', Event: 'event', OD: 'overseas duty', Other: 'other' }
      const n0 = NAMES[cur] || ''
      const name = n0 && n0.toLowerCase() !== cur.toLowerCase() ? n0[0].toUpperCase() + n0.slice(1) : ''
      host.innerHTML = `<div class="dk-fold"><button type="button" class="spanbtn dk-chip on">${cur}</button><span class="dk-name"></span><button type="button" class="dk-change">${W.change}</button></div>`
      host.querySelector('.dk-name').textContent = name
    } else {
      /* shut: the reason stands right under the two groups it closes, before the one still open */
      host.innerHTML = '<div class="dk-kinds">' + groups.map((g, i) => `<div class="dk-g${mode === 'shut' && i < 2 ? ' shut' : ''}"><span class="dk-gl">${g.label}</span><div class="dk-row">` +
        g.codes.map(c => `<button type="button" class="spanbtn dk-chip${mode === 'shut' && c.v === cur ? ' on' : ''}">${c.v}</button>`).join('') + '</div></div>' +
        (mode === 'shut' && i === 1 ? `<div class="dk-why">${W.othersOnly}</div>` : '')).join('') + '</div>'
    }
    sel.after(host)
    host.dataset.mk = '1'
    if (mode === 'empty') {
      /* everything after the Type row waits for a type; Add is not live yet */
      let n = row.nextElementSibling
      while (n) { if (n.classList.contains('inped-f') || n.matches('div,label')) n.classList.add('dk-wait'); n = n.nextElementSibling }
      document.getElementById('inpEditSave')?.classList.add('dk-off')
    }
    return { groups: groups.map(g => g.label + ':' + g.codes.length), cur, opt: sel.selectedOptions[0]?.textContent }
  }, { mode, W })
}
/* the window keeps its picked dates in view, so after staging the drawn row is scrolled back into view: the people
   list above it (a member choosing several people sees the whole roster) shows in part, the form below it whole */
async function bring(p) {
  await p.evaluate(() => {
    const h = document.querySelector('#inpEditPop .dk-host'), row = h.closest('.inped-f')
    const pp = document.querySelector('#inpEditPop .inped-f.pp')
    let s = row.parentElement
    while (s && !(s.scrollHeight > s.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement
    if (!s) return
    const top = row.getBoundingClientRect().top - s.getBoundingClientRect().top + s.scrollTop
    s.scrollTop = Math.max(0, top - (pp ? 150 : 20))
  })
  await sleep(250)
}
async function mark(p, sel) { await p.evaluate(s => document.querySelectorAll(s).forEach(e => e.classList.add('dcr-mk')), sel) }

async function stageCourse(p) {
  await p.selectOption('#inpEditType', 'CSE'); await sleep(400)
  const sev = p.locator('[data-testid="pp-several"]:visible')
  const several = await sev.count()
  if (several) {
    await press(p, sev.first()); await sleep(400)
    const ids = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop .pp-puck')].map(e => [e.dataset.pp, e.textContent.trim(), e.classList.contains('on')]))
    for (const cs of ['Ghost', 'Dash']) {
      /* a puck's text is the callsign then its CAT letters ("DrifterA") */
      const hit = ids.find(x => x[1].startsWith(cs))
      if (hit && !hit[2]) { await press(p, `#inpEditPop .pp-puck[data-pp="${hit[0]}"]`); await sleep(200) }
    }
  }
  for (const d of ['2026-07-22', '2026-07-24']) { const c = p.locator(`[data-testid="inpEdCal-day-${d}"]`); if (await c.count()) { await press(p, c); await sleep(200) } }
  await p.evaluate(() => {
    const e = document.getElementById('inpEditRmk'); if (!e) return
    const set = Object.getOwnPropertyDescriptor(e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set
    set.call(e, 'Air law, Bldg 4'); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await sleep(300)
  const on = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop .pp-puck.on')].map(e => e.textContent.trim()))
  console.log('  staged CSE; several people offered to a member:', !!several, '| on:', on.join(', ') || '(one person)')
  return on
}

async function a1(p) { await openNew(p); await mark(p, '#inpEditType'); await tags(p, [['#inpEditType', '1']]); await shot(p, 'a1-today') }
async function a2(p) {
  await openNew(p)
  console.log('  ', JSON.stringify(await propose(p, 'empty', W)))
  await mark(p, '.dk-kinds'); await tags(p, [['.dk-kinds', '1'], ['.dk-wait', '2']]); await shot(p, 'a2-empty')
}
async function a3(p) {
  await openNew(p); await stageCourse(p)
  console.log('  ', JSON.stringify(await propose(p, 'fold', W)))
  await bring(p); await mark(p, '.dk-fold'); await tags(p, [['.dk-fold', '3']]); await shot(p, 'a3-picked')
}
async function a4(p) {
  await openNew(p); await stageCourse(p)
  console.log('  ', JSON.stringify(await propose(p, 'shut', W)))
  await bring(p); await mark(p, '.dk-g.shut'); await tags(p, [['.dk-g.shut', '4']]); await shot(p, 'a4-change-others')
}

const engine = PHONE ? PW.webkit : PW.chromium
const browser = await engine.launch()
const ctx = await browser.newContext(PHONE
  ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
  : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
p.setDefaultTimeout(10000)
p.on('pageerror', e => console.log('PAGEERROR', e.message))
p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)) })
const FR = { 1: a1, 2: a2, 3: a3, 4: a4 }, failed = []
try {
  for (const n of ONLY) {
    try { await signIn(p); console.log('--- frame', n); await FR[n](p) }
    catch (e) { failed.push(n + ': ' + e.message.split('\n')[0]); console.log('FRAME FAILED', n, e.message.split('\n')[0]); await p.screenshot({ path: path.join(IMG, `fail-${n}-${PHONE ? 'phone' : 'desktop'}.png`) }).catch(() => {}) }
  }
} finally { await browser.close() }
console.log('DONE', VERSION, 'failed:', failed.length ? failed.join(' | ') : 'none')
