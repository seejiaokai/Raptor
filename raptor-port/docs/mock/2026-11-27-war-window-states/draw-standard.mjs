// Chat 193, 27 Nov 26 — the redesign's ONE standard window for every state of the Leave War's window, drawn on the REAL app
// beside today's (rollcall-today.mjs, which this imports for the same world). Nothing under raptor-port/src changes.
// THE STANDARD (the clean sheet's rules 1–2: what you may do follows who you are and the entry, never the page):
//   one window every time — the title, the manning line, then ONE LINE FOR EACH ENTRY ON THE DAY (the day's list's own
//   card: its box, its state, who placed it, and the buttons this person may use on it — the same buttons for the same
//   entry wherever it was filed; a › opens the entry's own window), then THE ADD PART (Remarks · Document, Duration, the
//   eight leave buttons where leave may still go — lit on the day's own leave, absent over a medical — and
//   CSE · OD · Grant OIL · ⋯). A man's row that is not yours: the lines only, read only, no add part.
// THE ONE TRANSFORM: the window today's app opens on an EMPTY day of the same man (31 Dec — every part of the add part
// there), re-dated to the state's day, its day's entries laid in as the day's list's own cards (`ul.daylist` /
// `li.dl-line.dl-card`, `.dl-acts` with the app's own `dchip` buttons), the grid's cyan mark moved to the state's day.
// The posted-out frame starts from the posting sheet's own "Place leave or OIL here instead…" (the window on that day);
// the member's look at another man's day from the read-only note today's tap opens. New parts outlined dashed yellow
// (D1222). Words on the cards are the agent's drafts, for a fresh Fable before any build (D2441).
// Run from raptor-port/ (the main folder's), one size a process, against the served build:
//   RC_LIB=1 node <this file> --size d|p
process.env.RC_LIB = '1'
const R = await import('./rollcall-today.mjs')
const { PW, PHONE, IMG, sleep, press, signIn, toWar, reach, tap, closeAll, CUT, RAN, DIESEL } = R
const path = await import('node:path')
const VERSION = 'draw-standard v1.2 (27 Nov 26, chat 193)'
console.log(VERSION)

const BASE = '2026-12-31'
const ACT = { approve: ['Approve', 'dchip dec approve'], approved: ['Approved', 'dchip dec approve lit'], refuse: ['Refuse', 'dchip dec refuse'],
  move: ['<span class="mvarr" aria-hidden="true">⇄</span>Move', 'dchip move'], del: ['Delete', 'dchip del'], edit: ['Edit…', 'dchip'] }
const PLACED = (who, more = '') => `<span class="bp-placedline">Placed <b>${who}</b> · Fri 27 Nov, 12:46${more}</span>`

/* each frame: which window it starts from, the day it stands for, its cards and what the add part shows */
const FRAMES = [
  { id: 's00-pending', today: 'a03-pending', role: 'ad', who: CUT, iso: '2026-12-02', date: 'Wed 2 Dec', lit: 'LL',
    cards: [{ box: 'c k-ll s-w whole', t: 'LL', main: 'Pending · Whole day', sub: PLACED('Saber'), acts: ['approve', 'refuse', 'move', 'del'] }] },
  { id: 's01-inputs-ll', today: 'a06-inputs-ll', role: 'ad', who: CUT, iso: '2026-12-09', date: 'Wed 9 Dec', lit: 'LL',
    cards: [{ box: 'c k-ll s-a whole', t: 'LL', main: 'Approved · Whole day', sub: PLACED('Cutter'), acts: ['approved', 'refuse', 'move', 'del'] }] },
  { id: 's02-medical', today: 'a07-medical', role: 'ad', who: CUT, iso: '2026-12-10', date: 'Thu 10 Dec', leave: false,
    cards: [{ box: 'c k-med s-a whole', fromCell: true, t: 'OML', main: 'Whole day', sub: PLACED('Cutter'), acts: [] }] },
  { id: 's03-od', today: 'a08-od', role: 'ad', who: CUT, iso: '2026-12-11', date: 'Fri 11 Dec',
    cards: [{ box: 'c k-od s-a whole', fromCell: true, t: 'OD', main: 'Whole day', sub: PLACED('Cutter'), acts: ['move', 'del'] }] },
  { id: 's04-postedout', today: 'a15-postedout', role: 'ad', who: DIESEL, iso: '2026-12-14', date: 'Mon 14 Dec', base: 'postout',
    cards: [{ box: 'c k-oth s-a whole', t: 'PO', main: 'Posted out from Thu 10 Dec', sub: '<span class="bp-placedline">Overseas Sqn · archived on the day</span>', acts: [] }] },
  { id: 's05-two', today: 'a13-two', role: 'ad', who: CUT, iso: '2026-12-18', date: 'Fri 18 Dec', lit: 'LL',
    cards: [{ box: 'c k-oil s-a whole', t: 'FO', main: 'OIL award · a day', sub: '<span class="bp-placedline">Weekend det · given by Saber</span>', acts: ['edit', 'del'] },
      { box: 'c k-ll s-w whole', t: 'LL', main: 'Pending · Whole day', sub: PLACED('Saber'), acts: ['approve', 'refuse', 'move', 'del'] }] },
  { id: 's06-oil', today: 'a12-oil', role: 'ad', who: CUT, iso: '2026-12-17', date: 'Thu 17 Dec',
    cards: [{ box: 'c k-oil s-a whole', t: 'FO', main: 'OIL award · a day', sub: '<span class="bp-placedline">Weekend det · given by Saber</span>', acts: ['edit', 'del'] }] },
  { id: 's07-group', today: 'a14-group', role: 'ad', who: CUT, iso: '2026-12-21', date: 'Mon 21 Dec', lit: 'LL',
    cards: [{ box: 'c k-ll s-a whole', t: 'LL', main: 'Approved · Whole day · Cutter, Ghost, Dash', sub: '<span class="bp-placedline">“Family trip” · placed <b>Saber</b></span>', acts: ['approved', 'refuse'], change: ['3 pax', 'Cutter'] }] },
  { id: 's08-member-closed', today: 'm02-closed', role: 'us', who: RAN, iso: '2026-11-30', date: 'Mon 30 Nov', closedNote: true, cards: [] },
  { id: 's09-member-own-approved', today: 'm05-approved', role: 'us', who: RAN, iso: '2026-12-03', date: 'Thu 3 Dec', lit: 'LL',
    cards: [{ box: 'c k-ll s-a whole', t: 'LL', main: 'Approved · Whole day', sub: PLACED('Saber'), acts: [] }] },
  { id: 's10-member-other', today: 'm08-other-leave', role: 'us', who: CUT, iso: '2026-12-03', date: 'Thu 3 Dec', base: 'readonly',
    cards: [{ box: 'c k-ll s-a whole', t: 'LL', main: 'Approved · Whole day', sub: PLACED('Saber'), acts: [] }] },
]

const MARKCSS = `.dk-new{outline:2px dashed #FFD23F !important;outline-offset:2px}
.dk-tag{position:fixed;z-index:2147483647;background:#FFD23F;color:#15171c;font:800 11px/17px system-ui,sans-serif;padding:0 6px;border-radius:9px;pointer-events:none;box-shadow:0 0 0 1px #15171c;white-space:nowrap}
.dk-chev{margin-left:auto;align-self:center;font:400 26px/1 system-ui,sans-serif;color:#8b95a7;padding:0 2px 0 8px}
.daylist.dk-list{margin:0;padding:0}`

/* the transform, in the page: the window open now becomes the frame's */
function transform(f) {
  const vis = e => e && e.getBoundingClientRect().width > 0
  const sheet = ['bid-picker', 'raptor-sheet'].map(t => document.querySelector(`[data-testid="${t}"]`)).find(vis)
  if (!sheet) return 'no window'
  sheet.querySelector('.bidsheet-hd .when, .bidsheet-hd .dt').textContent = f.date
  if (f.whoName) sheet.querySelector('.bidsheet-hd .who').textContent = f.whoName
  const till = sheet.querySelector('[data-testid="bid-tilldate"]'); if (till) till.textContent = 'till ' + f.date.split(' ').slice(1).join(' ')
  /* today's lines about what the day holds go: held lines, the bid's own placed line and actions, the OIL detail rows,
     the read-only note's lines */
  sheet.querySelectorAll('[data-testid="bid-heldday"], [data-testid="bid-heldhalf"]').forEach(e => e.closest('.bidsheet-row')?.remove())
  sheet.querySelectorAll('[data-testid="bid-placed"], [data-testid="bid-actions"], [data-testid="oil-detail"], .bidsheet-row.postout').forEach(e => e.remove())
  if (f.base === 'readonly') { [...sheet.children].forEach(c => { if (!c.classList.contains('bidsheet-hd')) c.remove() }); sheet.querySelector('.bidsheet-hd .cur')?.remove() }
  /* the cards: the day's list's own markup */
  if (f.cards.length) {
    const ul = document.createElement('ul'); ul.className = 'daylist flat dk-list dk-new'
    for (const c of f.cards) {
      let box = c.box
      if (c.fromCell) { const g = document.querySelector(`[data-testid="cell-${f.who}-${f.iso}"] .c`); if (g) box = [...g.classList].filter(k => /^(c|k-|s-)/.test(k)).join(' ') + ' whole' }
      const acts = c.acts.map(a => `<button class="${f.ACT[a][1]}">${f.ACT[a][0]}</button>`).join('')
      const change = c.change ? `<div class="dl-acts bp-acts"><span class="note" style="align-self:center;padding-right:4px">Change</span><button class="pchip">${c.change[0]}</button><button class="pchip">${c.change[1]}</button></div>` : ''
      ul.insertAdjacentHTML('beforeend', `<li class="dl-line dl-card"><div class="dl-head"><span class="leg-box dl-box" aria-hidden="true"><span class="${box}">${c.t}</span></span><div class="dl-text"><span class="dl-main">${c.main}</span><span class="dl-sub bp-placed">${c.sub}</span></div><span class="dk-chev" aria-hidden="true">›</span></div>${acts ? `<div class="dl-acts bp-acts">${acts}</div>` : ''}${change}</li>`)
    }
    const after = sheet.querySelector('[data-testid="bid-dayline"]') || sheet.querySelector('.bidsheet-hd')
    after.after(ul)
  }
  /* the add part */
  const leaveRow = sheet.querySelector('[aria-label="Which leave"]')
  if (leaveRow) {
    if (f.leave === false) leaveRow.remove()
    sheet.querySelectorAll('[data-testid^="bid-"].lv.lit').forEach(b => b.classList.remove('lit'))
    if (f.lit) sheet.querySelector(`[data-testid="bid-${f.lit}"]`)?.classList.add('lit')
    /* on a date not open for bidding a member's leave is recorded approved (question F2): the buttons take the filled look
       an admin's Auto-approve gives them, never a bid's dashed one */
    if (f.closedNote) { leaveRow.classList.add('dk-new'); leaveRow.querySelectorAll('.lv.s-w').forEach(b => { b.classList.remove('s-w'); b.classList.add('s-a') }) }
  }
  const grant = sheet.querySelector('[data-testid="bid-oil"] .lv-code'); if (grant) grant.textContent = 'Grant OIL'
  /* the grid's cyan mark on the state's day, never the base day's */
  document.querySelectorAll('td.selcell').forEach(td => td.classList.remove('selcell'))
  document.querySelector(`[data-testid="cell-${f.who}-${f.iso}"]`)?.classList.add('selcell')
  return 'ok'
}
async function tags(p, list) {
  await p.evaluate(list => {
    document.querySelectorAll('.dk-tag').forEach(t => t.remove())
    for (const [sel, text] of list) {
      const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (!e) continue
      const r = e.getBoundingClientRect(), t = document.createElement('span')
      t.className = 'dk-tag'; t.textContent = text; document.body.appendChild(t)
      /* on the box's right end, where it covers no words */
      t.style.left = Math.max(2, r.right - t.getBoundingClientRect().width + 4) + 'px'; t.style.top = Math.max(2, r.top - 9) + 'px'
    }
  }, list)
}
async function shot(p, name, f) {
  await sleep(350)
  const box = await p.evaluate(f => {
    const els = [...document.querySelectorAll('[data-testid="bid-picker"], [data-testid="raptor-sheet"], .dk-tag'), document.querySelector(`[data-testid="cell-${f.who}-${f.iso}"]`)]
      .filter(e => e && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().bottom > 0 && e.getBoundingClientRect().top < innerHeight)
    const rs = els.map(e => e.getBoundingClientRect()), pad = 12
    const x = Math.max(0, Math.min(...rs.map(r => r.left)) - pad), y = Math.max(0, Math.min(...rs.map(r => r.top)) - pad)
    return { x, y, width: Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + pad) - x, height: Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)) + pad) - y }
  }, f)
  const file = `${name}-${PHONE ? 'phone' : 'desktop'}.png`
  await p.screenshot({ path: path.join(IMG, file), clip: box })
  console.log('  picture', file, Math.round(box.width) + 'x' + Math.round(box.height))
}

async function draw(p, f) {
  try {
    if (f.base === 'postout') {
      await tap(p, f.who, f.iso)
      await press(p, p.locator('button:visible').filter({ hasText: /Place leave or OIL here instead/ }).first()); await sleep(900)
    } else if (f.base === 'readonly') {
      await tap(p, f.who, '2026-12-11')   // the member's tap on another man's OD opens today's read-only note
    } else await tap(p, f.who, BASE)
    await reach(p, f.who, f.iso)   // the state's day in view, the window staying where it stands
    const r = await p.evaluate(transform, { ...f, ACT })
    if (r !== 'ok') throw new Error(r)
    const t = [['.dk-list', '1']]
    if (f.closedNote) t.push(['[aria-label="Which leave"].dk-new', '1'])
    await tags(p, t)
    await shot(p, f.id, f)
  } catch (e) { console.log('  FAILED', f.id, e.message.split('\n')[0]) }
  await p.evaluate(() => document.querySelectorAll('.dk-tag').forEach(t => t.remove()))
  await closeAll(p)
}

const browser = await PW.chromium.launch()
const ctx = await browser.newContext(PHONE
  ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
  : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
const errs = []
const watch = p => { p.setDefaultTimeout(10000); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 160)) }) }
try {
  const p1 = await ctx.newPage(); watch(p1)
  await R.setupWorld(p1); await p1.addStyleTag({ content: MARKCSS })
  for (const f of FRAMES.filter(f => f.role === 'ad')) { console.log(f.id); await draw(p1, f) }
  await sleep(1500); await p1.close()
  const p2 = await ctx.newPage(); watch(p2)
  await signIn(p2, 'us', 'us'); await toWar(p2); await p2.addStyleTag({ content: MARKCSS })
  for (const f of FRAMES.filter(f => f.role === 'us')) { console.log(f.id); await draw(p2, f) }
  console.log('DONE', VERSION)
} catch (e) { console.log('FAILED', e.message.split('\n')[0]) }
finally { console.log('errors:', errs.length, errs.slice(0, 5)); await browser.close() }
