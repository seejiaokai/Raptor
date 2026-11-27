// Chat 194, 27 Nov 26 — his ask "can u redesign the approve and reject button?" (the Leave War window's Approve · Refuse,
// as on the questions page's F6 pictures). Drawn on the REAL app (the main folder's build, served on 127.0.0.1:4181),
// starting from the window today's app opens on Cutter's empty 31 Dec, its entry laid in as the day's list's own card
// (the F6 standard, draw-standard.mjs), then the decide pair redrawn three ways, each waiting and decided:
//   today — the pair as built (D1361, D1427): grey at rest, words in their colours; the decided one solid, dark words;
//   A     — one switch: Approve and Refuse joined in one two-part control, a drawn tick and cross, the decided half solid;
//   B     — two buttons, a drawn tick and cross, an edge in their own colour at rest, the decided one solid.
// Button height, row and Move / Delete unchanged (D487, D1427). Colours read off the app's own buttons at run time.
// Nothing under raptor-port/src changes. Run from raptor-port/ (the main folder's, for playwright), one size a process:
//   node <this file> --size d|p --img <this folder>/img
process.env.RC_LIB = '1'
const R = await import('../2026-11-27-war-window-states/rollcall-today.mjs')
const { PW, PHONE, IMG, sleep, signIn, toWar, reach, tap, CUT } = R
const path = await import('node:path')
const VERSION = 'draw-decide v1.0 (27 Nov 26, chat 194)'
console.log(VERSION)

const TICK = '<svg class="dk-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const CROSS = '<svg class="dk-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
const MOVE = '<button class="dchip move"><span class="mvarr" aria-hidden="true">⇄</span>Move</button>'
const DEL = '<button class="dchip del">Delete</button>'

/* each look, in its two states: the markup of the card's action row */
const LOOKS = {
  today: {
    pending: '<button class="dchip dec approve">Approve</button><button class="dchip dec refuse">Refuse</button>' + MOVE + DEL,
    approved: '<button class="dchip dec approve lit">Approved</button><button class="dchip dec refuse">Refuse</button>' + MOVE + DEL },
  A: {
    pending: `<span class="dk-seg"><button class="dchip dk-a">${TICK}Approve</button><button class="dchip dk-r">${CROSS}Refuse</button></span>` + MOVE + DEL,
    approved: `<span class="dk-seg"><button class="dchip dk-a on">${TICK}Approved</button><button class="dchip dk-r">${CROSS}Refuse</button></span>` + MOVE + DEL },
  B: {
    pending: `<button class="dchip dk-b dk-a">${TICK}Approve</button><button class="dchip dk-b dk-r">${CROSS}Refuse</button>` + MOVE + DEL,
    approved: `<button class="dchip dk-b dk-a on">${TICK}Approved</button><button class="dchip dk-b dk-r">${CROSS}Refuse</button>` + MOVE + DEL },
}
const STATE_WORDS = { pending: 'Pending · Whole day', approved: 'Approved · Whole day' }

async function setup(p) {
  /* the app's own colours, read off the real card's buttons in the window: the resting words and fill, and the lit fill */
  const r = await p.evaluate(transform, { state: 'pending', words: 'x',
    acts: '<button class="dchip dec approve">a</button><button class="dchip dec refuse">r</button><button class="dchip dec approve lit">a</button><button class="dchip dec refuse lit">r</button>' })
  if (r !== 'ok') throw new Error(r)
  return p.evaluate(() => {
    const [a, r, al, rl] = document.querySelectorAll('.dk-list .dl-acts button'), cs = e => getComputedStyle(e)
    return { ag: cs(a).color, rg: cs(r).color, abg: cs(al).backgroundColor, rbg: cs(rl).backgroundColor, lw: cs(al).color, rest: cs(a).backgroundColor, edge: cs(a).borderColor }
  })
}
const css = c => `
.dk-ic{width:14px;height:14px;flex:none;margin-right:5px}
.dl-acts .dk-a,.dl-acts .dk-r{padding-left:6px !important;padding-right:6px !important;white-space:nowrap}
@media (max-width:600px){.dk-ic{width:12px;height:12px;margin-right:4px} .dl-acts .dk-a,.dl-acts .dk-r{font-size:.9em !important}}
.dl-acts .dk-seg{grid-column:span 2;display:flex;min-width:0;border:1px solid ${c.edge};border-radius:10px;overflow:hidden;background:${c.rest}}
.dl-acts .dk-seg .dchip{flex:1 1 0;min-width:0;width:auto;border:none !important;border-radius:0 !important;margin:0;display:inline-flex;align-items:center;justify-content:center;background:transparent !important}
.dl-acts .dk-seg .dchip + .dchip{border-left:1px solid ${c.edge} !important}
.dk-a{color:${c.ag} !important} .dk-r{color:${c.rg} !important}
.dl-acts .dk-seg .dk-a.on{background:${c.abg} !important;color:${c.lw} !important}
.dl-acts .dk-seg .dk-r.on{background:${c.rbg} !important;color:${c.lw} !important}
.dl-acts .dk-b{display:inline-flex;align-items:center;justify-content:center}
.dl-acts .dk-b.dk-a{border-color:color-mix(in srgb, ${c.ag} 45%, transparent) !important}
.dl-acts .dk-b.dk-r{border-color:color-mix(in srgb, ${c.rg} 45%, transparent) !important}
.dl-acts .dk-b.dk-a.on{background:${c.abg} !important;border-color:${c.abg} !important;color:${c.lw} !important}
.dk-chev{margin-left:auto;align-self:center;font:400 26px/1 system-ui,sans-serif;color:#8b95a7;padding:0 2px 0 8px}
.daylist.dk-list{margin:0;padding:0}`

/* the window open now becomes the pending bid's (the F6 standard's first frame), its action row the look's */
function transform(f) {
  const vis = e => e && e.getBoundingClientRect().width > 0
  const sheet = ['bid-picker', 'raptor-sheet'].map(t => document.querySelector(`[data-testid="${t}"]`)).find(vis)
  if (!sheet) return 'no window'
  sheet.querySelector('.bidsheet-hd .when, .bidsheet-hd .dt').textContent = 'Wed 2 Dec'
  const till = sheet.querySelector('[data-testid="bid-tilldate"]'); if (till) till.textContent = 'till 2 Dec'
  sheet.querySelectorAll('[data-testid="bid-placed"], [data-testid="bid-actions"]').forEach(e => e.remove())
  sheet.querySelector('.dk-list')?.remove()
  const ul = document.createElement('ul'); ul.className = 'daylist flat dk-list'
  const box = f.state === 'approved' ? 'c k-ll s-a whole' : 'c k-ll s-w whole'
  ul.innerHTML = `<li class="dl-line dl-card"><div class="dl-head"><span class="leg-box dl-box" aria-hidden="true"><span class="${box}">LL</span></span><div class="dl-text"><span class="dl-main">${f.words}</span><span class="dl-sub bp-placed"><span class="bp-placedline">Placed <b>Saber</b> · Fri 27 Nov, 12:46</span></span></div><span class="dk-chev" aria-hidden="true">›</span></div><div class="dl-acts bp-acts">${f.acts}</div></li>`
  ;(sheet.querySelector('[data-testid="bid-dayline"]') || sheet.querySelector('.bidsheet-hd')).after(ul)
  sheet.querySelectorAll('[data-testid^="bid-"].lv.lit').forEach(b => b.classList.remove('lit'))
  sheet.querySelector('[data-testid="bid-LL"]')?.classList.add('lit')
  return 'ok'
}
/* the picture: the window's title down to the card's foot — what the question is about (D1222) */
async function shot(p, name) {
  await sleep(300)
  const box = await p.evaluate(() => {
    const sheet = ['bid-picker', 'raptor-sheet'].map(t => document.querySelector(`[data-testid="${t}"]`)).find(e => e && e.getBoundingClientRect().width > 0)
    const s = sheet.getBoundingClientRect(), c = document.querySelector('.dk-list').getBoundingClientRect(), pad = 10
    return { x: Math.max(0, s.left - pad), y: Math.max(0, s.top - pad), width: s.width + 2 * pad, height: c.bottom - s.top + 2 * pad }
  })
  const file = `${name}-${PHONE ? 'phone' : 'desktop'}.png`
  await p.screenshot({ path: path.join(IMG, file), clip: box })
  console.log('  picture', file, Math.round(box.width) + 'x' + Math.round(box.height))
}

const browser = await PW.chromium.launch()
const ctx = await browser.newContext(PHONE
  ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
  : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
const errs = []
try {
  const p = await ctx.newPage(); p.setDefaultTimeout(10000)
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 160)) })
  await signIn(p, 'ad', 'a'); await toWar(p)
  await tap(p, CUT, '2026-12-31')
  await reach(p, CUT, '2026-12-02')
  const c = await setup(p); console.log('app colours', JSON.stringify(c))
  await p.addStyleTag({ content: css(c) })
  for (const [look, states] of Object.entries(LOOKS)) for (const state of ['pending', 'approved']) {
    const r = await p.evaluate(transform, { state, words: STATE_WORDS[state], acts: states[state] })
    if (r !== 'ok') throw new Error(r)
    await shot(p, `${look}-${state}`)
  }
  console.log('DONE', VERSION)
} catch (e) { console.log('FAILED', e.message.split('\n')[0]) }
finally { console.log('errors:', errs.length, errs.slice(0, 5)); await browser.close() }
