// Chat 190, 26 Nov 26: the combined-row job drawn on the REAL app for his look (the drawing brief,
// docs/superpowers/briefs/2026-11-26-combined-input-rows-drawing-brief.md; his D2772, D2773, D2776-D2779).
// Every record is staged through the app's own controls (Inputs page, List, "+ Input", "Several people", the
// window's calendar, Save) and asserted on screen before anything is drawn. Each frame is pictured as it reads
// TODAY, then ONE transform is applied that only clones, moves or hides what the app drew:
//   1, 2  the other rows of a shared input are hidden and their pucks cloned into the first row; the empty
//         "+ add" place is a clone of the same day's Ground Programme row's own one; the carried look is the
//         page's own drag-in-progress state (the class the app sets on the page while a puck is carried)
//   3, 4  a real drop is made; the refusal note is the app's own note raised through its own note function
//         (the one the test bridge exposes on this PC), with the drafted words and its grey "Blocked:" face
//   5, 6  the war's boxes read "3 · LL" (the Inputs calendar's shared bar text); the war window's held line
//         gets a clone of the window's own button; the input's own window is a clone of the real one, opened
//         on the Inputs page, put over the war
// Marks: an outline on the element (takes no room) and a numbered tag laid on the still screen from its box.
// Nothing under raptor-port/src changes. window.* is read, except window.toast (the app's own note).
// Run from raptor-port/, one size a process, against an already-served build:
//   node docs/mock/2026-11-26-combined-row/draw-combined-row.mjs --size d --url http://localhost:4190/ --img docs/mock/2026-11-26-combined-row/img
//   node docs/mock/2026-11-26-combined-row/draw-combined-row.mjs --size p --url http://localhost:4173/ --img docs/mock/2026-11-26-combined-row/img [--only 1,2]
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import http from 'node:http'
const VERSION = 'draw-combined-row v1.0 (26 Nov 26)'
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d }
const SIZE = arg('size', 'd'), URL0 = arg('url', 'http://localhost:4190/'), IMG = path.resolve(arg('img', 'docs/mock/2026-11-26-combined-row/img'))
const ONLY = arg('only', '5,6,1,2,3,4').split(',')
const PHONE = SIZE === 'p'
console.log(VERSION, '| size', PHONE ? 'phone 402x874 WebKit 3x' : 'desktop 1536x864 Chromium 1x', '| build', URL0, '| pictures', IMG, '| frames', ONLY.join(','))
mkdirSync(IMG, { recursive: true })
const PW = createRequire(process.cwd() + '/package.json')('playwright')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const facts = []
const fact = (f, what, v) => { facts.push({ f, what, v }); console.log(`[${f}] ${what}:`, typeof v === 'string' ? v : JSON.stringify(v)) }

/* WebKit on this PC never reaches a build served on [::1] alone, as port 4190 is (its loopback requests go to 127.0.0.1
   and cannot be routed): give the phone run a build WebKit reaches (port 4173 here), or pass --relay for a pass-through
   inside this script only, closed at the end. Desktop Chromium goes straight to the build. */
let relay = null, URL = URL0
if (PHONE && process.argv.includes('--relay')) {
  const u = new globalThis.URL(URL0)
  const upHost = u.hostname === 'localhost' ? '::1' : u.hostname.replace(/^\[|\]$/g, '')
  relay = http.createServer((req, res) => {
    const up = http.request({ host: upHost, port: +u.port || 80, path: req.url, method: req.method, headers: req.headers }, r => { res.writeHead(r.statusCode, r.headers); r.pipe(res) })
    up.on('error', e => { res.writeHead(502); res.end(String(e)) }); req.pipe(up)
  })
  await new Promise(r => relay.listen(0, '127.0.0.1', r))
  URL = `http://127.0.0.1:${relay.address().port}/`
}

/* ---------------- the people (the PEOPLE keys, as the window's picker carries them) ---------------- */
/* (no SANS man and nobody posted out: a SANS man has no row on the war — Bolt and Otter were tried first — and Torch is
   posted out of the demo world on 14 Jul) */
const CS = { bane: 'Ranger', rocky: 'Hex', slipway: 'Drifter', pump: 'Piston', psy: 'Cutter', riddler: 'Ghost', spaceman: 'Dash', salsa: 'Saint', pain: 'Rune', shrek: 'Wisp', wolf: 'Static', shaft: 'Anvil' }
const SPECS = {
  od: { type: 'OD', people: ['bane', 'rocky', 'slipway'], from: '2026-07-15', to: '2026-07-17' },
  attc: { type: 'ATT C', people: ['pump'], from: '2026-07-15', to: '2026-07-15' },
  ll: { type: 'LL', people: ['psy', 'riddler', 'spaceman'], from: '2026-07-15', to: '2026-07-17' },
  pa: { type: 'Personal', people: ['salsa', 'pain'], from: '2026-07-15', to: '2026-07-15', title: 'Ops brief prep' },
  pb: { type: 'Personal', people: ['shrek', 'wolf'], from: '2026-07-15', to: '2026-07-15', title: 'Sim brief' },
}
/* the drafted words (for the fresh Fable's adjustment, D2441) */
const W = {
  med: "Blocked: a medical is always one person's.",
  piGround: "Blocked: drop him on this input's row on the Ground Programme.",
  piWait: 'Blocked: put this input on the programme first.',
  all3: 'Change for all 3',
  addz: '+ add',
}

/* ---------------- driving ---------------- */
async function press(p, loc) {
  const l = typeof loc === 'string' ? p.locator(loc).first() : loc
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (PHONE) await l.tap(); else await l.click()
}
async function signIn(p, first) {
  if (first) await p.goto(URL, { timeout: 60000, waitUntil: 'commit' })
  await p.waitForSelector('#luser, #vWeek .day', { timeout: 60000 })
  if (await p.locator('#luser:visible').count()) {
    await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  }
  await p.waitForSelector('#vWeek .day', { timeout: 60000 }); await sleep(600)
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' + MARKCSS })
}
/* a fresh page between frames, so no injected node survives into the next (the data stays: a built site keeps it) */
async function reset(p) { await p.reload({ waitUntil: 'commit', timeout: 60000 }); await signIn(p, false) }
async function toPage(p, name) {
  const re = new RegExp('^\\s*' + name + '\\s*$')
  const vis = p.locator('button:visible, a:visible').filter({ hasText: re })
  if (await vis.count()) { await press(p, vis.first()); await sleep(900); return }
  await press(p, p.locator('[aria-label="Menu"]:visible').first()); await sleep(500)
  await press(p, p.locator('button:visible, a:visible').filter({ hasText: re }).first()); await sleep(900)
}
async function fileInput(p, { type, people, from, to, title }) {
  if (!(await p.locator('#inListBtn:visible').count())) await toPage(p, 'Inputs')
  if (await p.locator('#inMemberMode:visible').count()) await press(p, '#inMemberMode')
  await press(p, '#inListBtn'); await sleep(500)
  const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  await press(p, '#inNew')
  await p.waitForSelector('#inpEditPop', { timeout: 8000 }); await sleep(300)
  await p.selectOption('#inpEditType', type); await sleep(300)
  if (people.length > 1) {
    await press(p, '[data-testid="pp-several"]'); await sleep(300)
    for (let i = 0; i < 3; i++) {
      const on = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop .pp-puck.on')].map(e => e.dataset.pp))
      const flip = [...on.filter(x => !people.includes(x)), ...people.filter(x => !on.includes(x))]
      if (!flip.length) break
      for (const id of flip) await press(p, `#inpEditPop .pp-puck[data-pp="${id}"]`)
      await sleep(200)
    }
  } else { await p.selectOption('#inpEditPerson', people[0]); await sleep(200) }
  /* a title through the box's own change event — never typed on a phone (the zoom trap) */
  if (title) await p.evaluate(t => { const e = document.getElementById('inpEditOwnTitle'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(e, t); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) }, title)
  await press(p, `[data-testid="inpEdCal-day-${from}"]`); await sleep(200)
  if (to !== from) { await press(p, `[data-testid="inpEdCal-day-${to}"]`); await sleep(200) }
  await press(p, '#inpEditSave'); await sleep(900)
  const asked = []
  for (let i = 0; i < 4; i++) {
    const nd = p.locator('button:visible').filter({ hasText: /^(No document|Don't add)$/ })
    if (await nd.count()) { asked.push(await nd.first().innerText()); await press(p, nd.first()); await sleep(600) } else break
  }
  if (await p.locator('#inpEditPop:visible').count()) throw new Error('window still open after Save')
  const after = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  const iid = after.filter(x => !before.includes(x))[0]
  if (!iid) throw new Error('nothing saved for ' + type)
  const rec = await p.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return { type: r.type, people: (r.people || []).map(x => x.p), date: r.date, endDate: r.endDate, acc: r.acc, allday: r.allday, s: r.s, e: r.e, title: r.title } }, iid)
  return { iid, rec, asked }
}

/* ---------------- marks and pictures ---------------- */
const MARKCSS = `.dcr-mk{outline:2px solid #FFC83D !important;outline-offset:1px}
.dcr-tag{position:fixed;z-index:2147483647;background:#FFC83D;color:#15171c;font:800 11px/17px system-ui,sans-serif;padding:0 6px;border-radius:9px;pointer-events:none;box-shadow:0 0 0 1px #15171c}`
/* tags laid on the still screen from each marked element's box, just before the picture (the window's own
   pseudo-elements are the app's on the war's boxes and the grids' rows, so none is borrowed) */
async function tags(p, list) {
  await p.evaluate(list => {
    document.querySelectorAll('.dcr-tag').forEach(t => t.remove())
    for (const [sel, text, side] of list) {
      const e = typeof sel === 'string' ? [...document.querySelectorAll(sel)].filter(x => x.getBoundingClientRect().width > 0).pop() : null
      if (!e) continue
      const r = e.getBoundingClientRect(), t = document.createElement('span')
      t.className = 'dcr-tag'; t.textContent = text; document.body.appendChild(t)
      const tw = t.getBoundingClientRect().width
      /* 'r' right of the element, 'a' above it (centred), otherwise left of it */
      const x = side === 'r' ? r.right + 4 : side === 'a' ? r.left + r.width / 2 - tw / 2 : Math.max(2, r.left - tw - 4)
      t.style.left = x + 'px'; t.style.top = (side === 'a' ? Math.max(2, r.top - 19) : Math.max(2, r.top + Math.min(r.height, 30) / 2 - 8.5)) + 'px'
    }
  }, list)
}
async function unmark(p) { await p.evaluate(() => { document.querySelectorAll('.dcr-mk').forEach(e => e.classList.remove('dcr-mk')); document.querySelectorAll('.dcr-tag').forEach(t => t.remove()); document.querySelectorAll('[data-dcr-pic]').forEach(e => e.removeAttribute('data-dcr-pic')) }) }
/* the picture is the union of the elements flagged data-dcr-pic, and every tag, clamped to the screen */
async function shot(p, name, pad = 12) {
  await sleep(250)
  const box = await p.evaluate(pad => {
    const rs = [...document.querySelectorAll('[data-dcr-pic], .dcr-tag')].map(e => e.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0)
    if (!rs.length) return null
    const x = Math.max(0, Math.min(...rs.map(r => r.left)) - pad), y = Math.max(0, Math.min(...rs.map(r => r.top)) - pad)
    const x2 = Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + pad), y2 = Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)) + pad)
    return { x, y, width: x2 - x, height: y2 - y }
  }, pad)
  if (!box) throw new Error('nothing to picture: ' + name)
  const f = `${name}-${PHONE ? 'phone' : 'desktop'}.png`
  await p.screenshot({ path: path.join(IMG, f), clip: box })
  console.log('  picture', f, Math.round(box.width) + 'x' + Math.round(box.height))
  return f
}
/* tap a neutral heading so no control stays hovered or focused in a touch picture */
async function neutral(p) { if (PHONE) await p.mouse.click(2, 120).catch(() => {}) }

/* ---------------- in-page finders (each sent function declares what it uses) ---------------- */
const WED = `(() => [...document.querySelectorAll('section.day')].find(s => s.getBoundingClientRect().width > 0 && /Jul 15/.test(s.querySelector('.dt')?.textContent || '')))()`
async function wedRows(p, sec) {
  return p.evaluate(([WEDs, sec]) => { const d = eval(WEDs); return [...d.querySelectorAll(sec + ' .pl-row')].map(r => ({ seat: [...r.querySelectorAll('[data-inpseat]')].map(s => s.dataset.inpseat), who: [...r.querySelectorAll('.puck .nm')].map(n => n.textContent.trim()), name: r.querySelector('.nm')?.textContent.trim(), h: Math.round(r.getBoundingClientRect().height) })) }, [WED, sec])
}

/* THE ONE TRANSFORM OF FRAMES 1 AND 2: in the rows under `scope`, every input shared by several people (its rows'
   seats read "<iid>~<person>") keeps its first row; the others' pucks are CLONED into that row's people cell and the
   others HIDDEN; the people cell gets a clone of `addSel` (the same day's Ground Programme row's own "+ add" place)
   and the app's drop-place attribute, so the app's own rule draws it while a puck is carried */
async function combine(p, scopeJs, rowSel, addSel, gshared) {
  return p.evaluate(([scopeJs, rowSel, addSel, gshared]) => {
    const scope = eval(scopeJs)
    const src = [...document.querySelectorAll(addSel)].find(e => scope.closest('section, #schedBoard, body').contains(e))
    if (!src) return { err: 'no + add place to clone: ' + addSel }
    const groups = new Map()
    for (const r of scope.querySelectorAll(rowSel)) {
      const s = r.querySelector('[data-inpseat]'); if (!s || !s.dataset.inpseat.includes('~')) continue
      const iid = s.dataset.inpseat.split('~')[0]; if (!groups.has(iid)) groups.set(iid, []); groups.get(iid).push(r)
    }
    const out = []
    for (const [iid, rows] of groups) {
      if (rows.length < 2) continue
      const before = rows.reduce((h, r) => h + r.getBoundingClientRect().height, 0)
      const first = rows[0], ppl = first.querySelector('.ppl')
      for (const o of rows.slice(1)) { for (const s of o.querySelectorAll('.ppl .seat')) ppl.appendChild(s.cloneNode(true)); o.style.display = 'none'; o.classList.add('dcr-hidden') }
      if (gshared) first.classList.add('gshared')
      ppl.classList.remove('one')
      const add = src.cloneNode(true); add.classList.add('dcr-new'); ppl.appendChild(add)
      if (!ppl.hasAttribute('data-fill')) ppl.setAttribute('data-fill', 'dcr:' + iid)
      first.classList.add('dcr-comb'); first.dataset.dcrIid = iid
      out.push({ iid, rows: rows.length, pucks: ppl.querySelectorAll('.puck').length, hBefore: Math.round(before), hAfter: Math.round(first.getBoundingClientRect().height), reject: first.querySelectorAll('.accb').length })
    }
    return { src: src.parentElement.getAttribute('data-fill'), out }
  }, [scopeJs, rowSel, addSel, gshared])
}

/* ---------------- the frames ---------------- */
async function f1(p) {
  await toPage(p, 'Edit Schedule'); await sleep(600)
  await p.evaluate(WEDs => { const d = eval(WEDs); d.scrollIntoView({ block: 'nearest', inline: 'center' }); d.querySelector('.sec-unav').scrollIntoView({ block: 'center', inline: 'nearest' }) }, WED); await sleep(500)
  const rows = await wedRows(p, '.sec-unav'); fact(1, 'today Unavailable rows', rows.map(r => r.name + ':' + r.who.join('+') + ' h' + r.h))
  const od = rows.filter(r => r.seat[0] && r.seat[0].startsWith(IIDS.od)), ll = rows.filter(r => r.seat[0] && r.seat[0].startsWith(IIDS.ll)), med = rows.filter(r => r.seat[0] === IIDS.attc)
  if (od.length !== 3 || ll.length !== 3 || med.length !== 1) throw new Error('premise: OD rows ' + od.length + ', LL rows ' + ll.length + ', ATT C ' + med.length)
  const mk = (iids, n) => p.evaluate(([WEDs, iids]) => { const d = eval(WEDs); d.querySelector('.sec-unav').setAttribute('data-dcr-pic', ''); for (const r of d.querySelectorAll('.sec-unav .pl-row')) { const s = r.querySelector('[data-inpseat]'); if (s && iids.some(i => s.dataset.inpseat.startsWith(i)) && r.style.display !== 'none') r.classList.add('dcr-mk') } }, [WED, iids])
  await mk([IIDS.od, IIDS.ll])
  await tags(p, [[`section.day .sec-unav .pl-row.dcr-mk`, '1']])
  await p.evaluate(() => { const rs = [...document.querySelectorAll('.sec-unav .pl-row.dcr-mk')].filter(e => e.getBoundingClientRect().width > 0); const t = document.querySelector('.dcr-tag'); if (rs[0] && t) { const r = rs[0].getBoundingClientRect(); t.style.top = (r.top + 4) + 'px' } })
  await neutral(p); await shot(p, 'f1-week-unavailable-today')
  await unmark(p)
  const c = await combine(p, WED + ".querySelector('.sec-unav')", '.pl-row', `[data-fill^="g:2."] .addz`, true)
  fact(1, 'combined', c); if (c.err || c.out.length !== 2) throw new Error('combine: ' + JSON.stringify(c))
  await mk([IIDS.od, IIDS.ll])
  await tags(p, [[`section.day .sec-unav .pl-row.dcr-comb`, '1']])
  await neutral(p); await shot(p, 'f1-week-unavailable-proposed')
  /* while a puck is carried: the app's own drag-in-progress state on the page, so its rule draws every "+ add" place */
  await p.evaluate(() => document.body.classList.add('dnd'))
  const addBox = await p.evaluate(() => [...document.querySelectorAll('.dcr-new')].filter(e => e.getBoundingClientRect().width > 0).map(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { w: Math.round(r.width), h: Math.round(r.height), border: cs.borderTopColor + ' ' + cs.borderTopStyle, text: cs.color } }))
  fact(1, 'the extra empty place while a puck is carried', addBox)
  await tags(p, [[`section.day .sec-unav .pl-row.dcr-comb`, '1'], [`section.day .sec-unav .dcr-new`, 'New', 'r']])
  await shot(p, 'f1-week-unavailable-proposed-carrying')
  await p.evaluate(() => document.body.classList.remove('dnd'))
}

async function f2(p) {
  await toPage(p, 'Edit Schedule'); await sleep(500)
  await press(p, p.locator('.dt.sb-open[data-sbday="2"]:visible').first()); await p.waitForSelector('#schedBoard', { timeout: 10000 }); await sleep(1200)
  const PANEL = `(() => [...document.querySelectorAll('#schedBoard .sb-panel.unav')].find(e => e.getBoundingClientRect().width > 0))()`
  /* the panel's heading in view under the board's own bar (asked of the page at the heading, not trusted to the scroll) */
  await p.evaluate(P => eval(P).scrollIntoView({ block: 'start' }), PANEL); await sleep(300)
  for (let i = 0; i < 10; i++) {
    const seen = await p.evaluate(P => { const h = eval(P).querySelector('.sb-ph'); const r = h.getBoundingClientRect(); const e = document.elementFromPoint(r.left + 20, r.top + r.height / 2); return !!e && h.contains(e) }, PANEL)
    if (seen) break
    await p.evaluate(P => { let n = eval(P).parentElement; while (n && n !== document.body) { const oy = getComputedStyle(n).overflowY; if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 1) { n.scrollTop -= 30; return } n = n.parentElement } window.scrollBy(0, -30) }, PANEL)
    await sleep(150)
  }
  const rows = await p.evaluate(P => [...eval(P).querySelectorAll('.sb-arow.inprow')].map(r => ({ seat: [...r.querySelectorAll('[data-inpseat]')].map(s => s.dataset.inpseat), who: [...r.querySelectorAll('.puck .nm')].map(n => n.textContent.trim()), h: Math.round(r.getBoundingClientRect().height) })), PANEL)
  fact(2, 'today board Unavailable rows', rows.map(r => r.who.join('+') + ' h' + r.h))
  const od = rows.filter(r => r.seat[0] && r.seat[0].startsWith(IIDS.od)), ll = rows.filter(r => r.seat[0] && r.seat[0].startsWith(IIDS.ll))
  if (od.length !== 3 || ll.length !== 3) throw new Error('premise: board OD rows ' + od.length + ', LL ' + ll.length)
  const mk = () => p.evaluate(([P, iids]) => { const pn = eval(P); pn.setAttribute('data-dcr-pic', ''); for (const r of pn.querySelectorAll('.sb-arow.inprow')) { const s = r.querySelector('[data-inpseat]'); if (s && iids.some(i => s.dataset.inpseat.startsWith(i)) && r.style.display !== 'none') r.classList.add('dcr-mk') } }, [PANEL, [IIDS.od, IIDS.ll]])
  await mk(); await tags(p, [['#schedBoard .sb-panel.unav .sb-arow.dcr-mk', '2']])
  await p.evaluate(() => { const rs = [...document.querySelectorAll('#schedBoard .sb-arow.dcr-mk')].filter(e => e.getBoundingClientRect().width > 0); const t = document.querySelector('.dcr-tag'); if (rs[0] && t) t.style.top = (rs[0].getBoundingClientRect().top + 4) + 'px' })
  await neutral(p); await shot(p, 'f2-board-unavailable-today')
  await unmark(p)
  const c = await combine(p, PANEL, '.sb-arow.inprow', `#schedBoard [data-fill^="g:2."] .addz`, false)
  fact(2, 'combined', c); if (c.err || c.out.length !== 2) throw new Error('combine: ' + JSON.stringify(c))
  await mk(); await tags(p, [['#schedBoard .sb-panel.unav .sb-arow.dcr-comb', '2']])
  await p.evaluate(() => { const rs = [...document.querySelectorAll('#schedBoard .sb-arow.dcr-comb')].filter(e => e.getBoundingClientRect().width > 0); const t = document.querySelector('.dcr-tag'); if (rs[0] && t) t.style.top = (rs[0].getBoundingClientRect().top + 4) + 'px' })
  await neutral(p); await shot(p, 'f2-board-unavailable-proposed')
  await p.evaluate(() => document.body.classList.add('dnd'))
  fact(2, 'the extra empty place while a puck is carried', await p.evaluate(() => [...document.querySelectorAll('#schedBoard .dcr-new')].filter(e => e.getBoundingClientRect().width > 0).map(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { w: Math.round(r.width), h: Math.round(r.height), border: cs.borderTopColor + ' ' + cs.borderTopStyle } })))
  await tags(p, [['#schedBoard .sb-panel.unav .sb-arow.dcr-comb', '2'], ['#schedBoard .dcr-new', 'New', 'a']])
  await shot(p, 'f2-board-unavailable-proposed-carrying')
  await p.evaluate(() => document.body.classList.remove('dnd'))
  await press(p, '#sbDone').catch(() => {}); await sleep(600)
}

/* a real drop of Anvil on `target` (a locator): the desktop drags his puck from the aircrew panel. On the phone a drop is
   a held touch drag, which this browser cannot drive (a tap on his puck in Wednesday's Available crew armed nothing and
   opened the crew drawer over the day — the first phone run), so the phone's "today" is the row before any drop and the
   drop itself is the desktop's. Returns what the page shows after. */
async function dropAnvil(p, target) {
  await p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.style.opacity = '0'; t.textContent = '' } })
  if (PHONE) return { armed: false, why: 'a held touch drag cannot be driven in this browser; the drop was made on the desktop' }
  const src = p.locator('.puck[data-person="shaft"]:visible').and(p.locator(':not(section.day *)')).first()
  await target.scrollIntoViewIfNeeded(); await src.dragTo(target)
  await sleep(500)
  return p.evaluate(() => { const t = document.getElementById('toastEl'); return { note: t && getComputedStyle(t).opacity !== '0' ? t.textContent : '', face: t?.dataset.face || '' } })
}
/* the app's own note, raised through its own function, with the drafted words and its "Blocked:" face */
async function blockedNote(p, words) {
  const r = await p.evaluate(w => { window.toast(w, 'blocked'); const t = document.getElementById('toastEl'); return { face: t.dataset.face, text: t.textContent, lead: t.querySelector('.bk-words b')?.textContent, sign: !!t.querySelector('.bk-sign') } }, words)
  if (r.face !== 'blocked' || !r.sign) throw new Error('the note did not take its Blocked face: ' + JSON.stringify(r))
  return r
}
/* bring a section's foot to just above the note, so the row and the note share one picture */
async function aboveNote(p, js) {
  await p.evaluate(js => { const e = eval(js); e.closest('section.day').scrollIntoView({ block: 'nearest', inline: 'center' }); e.scrollIntoView({ block: 'end', inline: 'nearest' }); window.scrollBy(0, 120) }, js); await sleep(400)
}

async function f3(p) {
  await toPage(p, 'Edit Schedule'); await sleep(500)
  const SEC = WED + ".querySelector('.sec-unav')"
  await aboveNote(p, SEC)
  const piston = p.locator(`section.day:visible:has(.dt:text("Jul 15")) .sec-unav [data-inpseat="${IIDS.attc}"]`).first()
  const today = await dropAnvil(p, piston)
  const now = await wedRows(p, '.sec-unav'); const medRow = now.find(r => r.seat[0] === IIDS.attc)
  fact(3, 'today: Anvil dropped on Piston\'s ATT C row', { ...today, row: medRow && medRow.who })
  const mkRow = () => p.evaluate(([WEDs, iid]) => { const d = eval(WEDs); const s = d.querySelector(`.sec-unav [data-inpseat="${iid}"]`); const r = s.closest('.pl-row'); r.classList.add('dcr-mk'); r.setAttribute('data-dcr-pic', ''); d.querySelector('.sec-unav').setAttribute('data-dcr-pic', ''); const t = document.getElementById('toastEl'); if (t && getComputedStyle(t).opacity !== '0' && t.textContent) { t.setAttribute('data-dcr-pic', ''); t.classList.add('dcr-mk') } }, [WED, IIDS.attc])
  if (today.armed !== false) {
    await mkRow(); await tags(p, [['.sec-unav .pl-row.dcr-mk', '3']]); await shot(p, 'f3-medical-drop-today')
    await unmark(p)
    await press(p, '#undoBtn'); await sleep(700)
    const back = (await wedRows(p, '.sec-unav')).find(r => r.seat[0] === IIDS.attc)
    fact(3, 'after the top bar\'s Undo', back && back.who)
    if (!back || back.who[0] !== 'Piston') throw new Error('Undo did not bring Piston back')
  } else {
    fact(3, 'today: the drop could not be made on this device by a tap; the row pictured untouched', today)
    await mkRow(); await tags(p, [['.sec-unav .pl-row.dcr-mk', '3']]); await shot(p, 'f3-medical-row-today'); await unmark(p)
  }
  await aboveNote(p, SEC)
  const n = await blockedNote(p, W.med); fact(3, 'proposed note', n)
  await mkRow(); await tags(p, [['.sec-unav .pl-row.dcr-mk', '3'], ['#toastEl', 'New', 'a']])
  await shot(p, 'f3-medical-drop-proposed')
  await unmark(p)
}

async function f4(p) {
  await toPage(p, 'Edit Schedule'); await sleep(500)
  const SEC = WED + ".querySelector('.sec-inp')"
  const fold = p.locator('section.day:visible:has(.dt:text("Jul 15")) .sec-inp .pl-fold').first()
  if (await fold.count() && !(await p.locator('section.day:visible:has(.dt:text("Jul 15")) .sec-inp .pl-row').count())) { await press(p, fold); await sleep(600) }
  const lines = async () => p.evaluate(WEDs => [...eval(WEDs).querySelectorAll('.sec-inp .pl-row')].map(r => ({ text: r.querySelector('.nm')?.textContent.trim(), who: [...r.querySelectorAll('.puck .nm')].map(n => n.textContent.trim()), acc: r.classList.contains('accd') })), WED)
  const l0 = await lines(); fact(4, 'today Personal Inputs lines', l0)
  if (l0.length !== 2) throw new Error('premise: two Personal Inputs lines, got ' + l0.length)
  const lineOf = title => p.locator('section.day:visible:has(.dt:text("Jul 15")) .sec-inp .pl-row').filter({ hasText: title }).first()
  const mkLine = title => p.evaluate(([WEDs, title]) => { const d = eval(WEDs); d.querySelector('.sec-inp').setAttribute('data-dcr-pic', ''); const r = [...d.querySelectorAll('.sec-inp .pl-row')].find(x => x.textContent.includes(title)); r.classList.add('dcr-mk'); r.setAttribute('data-dcr-is', '1'); const t = document.getElementById('toastEl'); if (t && getComputedStyle(t).opacity !== '0' && t.textContent) { t.setAttribute('data-dcr-pic', ''); t.classList.add('dcr-mk') } }, [WED, title])
  /* (a) the line whose input is on the Ground Programme */
  await aboveNote(p, SEC)
  const a = await dropAnvil(p, lineOf('Ops brief prep').locator('.puck').first())
  const l1 = await lines(); fact(4, 'today: Anvil dropped on the "Ops brief prep" line', { ...a, lines: l1 })
  if (JSON.stringify(l1) !== JSON.stringify(l0)) throw new Error('premise: the drop changed the line')
  await mkLine('Ops brief prep'); await tags(p, [['[data-dcr-is]', '4']]); await shot(p, PHONE ? 'f4a-personal-on-programme-today' : 'f4a-personal-on-programme-drop-today'); await unmark(p)
  await p.evaluate(() => document.querySelectorAll('[data-dcr-is]').forEach(e => e.removeAttribute('data-dcr-is')))
  await aboveNote(p, SEC)
  fact(4, 'proposed note (on the programme)', await blockedNote(p, W.piGround))
  await mkLine('Ops brief prep'); await tags(p, [['[data-dcr-is]', '4'], ['#toastEl', 'New', 'a']]); await shot(p, 'f4a-personal-on-programme-drop-proposed'); await unmark(p)
  await p.evaluate(() => document.querySelectorAll('[data-dcr-is]').forEach(e => e.removeAttribute('data-dcr-is')))
  /* (b) "Sim brief" taken off the programme by its own Reject: it waits */
  await press(p, lineOf('Sim brief').locator('.accb').filter({ hasText: 'Reject' }).first()); await sleep(800)
  const rec = await p.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return { acc: r.acc ?? null } }, IIDS.pb)
  const gp = await p.evaluate(WEDs => [...eval(WEDs).querySelectorAll('.sec-grnd .pl-row')].map(r => r.querySelector('.nm')?.textContent.trim()), WED)
  fact(4, 'after Reject on "Sim brief"', { rec, groundRows: gp })
  if (rec.acc === 'g' || gp.some(t => /SIM BRIEF/i.test(t || ''))) throw new Error('premise: Sim brief still on the programme')
  if (!(await p.locator('section.day:visible:has(.dt:text("Jul 15")) .sec-inp .pl-row').count())) { await press(p, fold); await sleep(600) }
  await aboveNote(p, SEC)
  const l2 = await lines()
  const b = await dropAnvil(p, lineOf('Sim brief').locator('.puck').first())
  const l3 = await lines(); fact(4, 'today: Anvil dropped on the waiting "Sim brief" line', { ...b, lines: l3 })
  if (JSON.stringify(l3) !== JSON.stringify(l2)) throw new Error('premise: the drop changed the waiting line')
  await mkLine('Sim brief'); await tags(p, [['[data-dcr-is]', '4']]); await shot(p, PHONE ? 'f4b-personal-waiting-today' : 'f4b-personal-waiting-drop-today'); await unmark(p)
  await p.evaluate(() => document.querySelectorAll('[data-dcr-is]').forEach(e => e.removeAttribute('data-dcr-is')))
  await aboveNote(p, SEC)
  fact(4, 'proposed note (waiting)', await blockedNote(p, W.piWait))
  await mkLine('Sim brief'); await tags(p, [['[data-dcr-is]', '4'], ['#toastEl', 'New', 'a']]); await shot(p, 'f4b-personal-waiting-drop-proposed'); await unmark(p)
}

/* the war, July, a man's 13-19 Jul boxes in view */
const MEN = ['bane', 'rocky', 'slipway', 'psy', 'riddler', 'spaceman']
async function warJuly(p) {
  await toPage(p, 'Leave War'); await sleep(2500)
  await press(p, p.locator('button:visible').filter({ hasText: /^JUL$/ }).first()); await sleep(1200)
}
async function warCells(p, id) {
  await p.evaluate(id => document.querySelector(`[data-testid="cell-${id}-2026-07-15"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), id); await sleep(500)
  return p.evaluate(id => ['15', '16', '17'].map(d => { const c = document.querySelector(`[data-testid="cell-${id}-2026-07-${d}"]`); if (!c) return null; const s = c.querySelector('.c'); const rr = c.closest('tr').getBoundingClientRect(); return { d, text: s ? s.textContent : '', cls: s ? s.className : '', rowH: Math.round(rr.height * 10) / 10, boxW: s ? Math.round(s.getBoundingClientRect().width) : 0 } }), id)
}
/* the shared mark: each box of a shared entry reads as the Inputs calendar's shared bar does, its count first. The
   bar's "3 · LL" does not fit a box (the first run's "3 · OD" was cut to "· O"), so the box carries "3·LL" in the war's
   own size step for a four-letter code (its `wide w4` classes, as a four-letter kind's box wears them) */
async function warMark(p, ids, count) {
  return p.evaluate(([ids, count]) => {
    const out = []
    for (const id of ids) for (const d of ['15', '16', '17']) {
      const c = document.querySelector(`[data-testid="cell-${id}-2026-07-${d}"]`); const s = c && c.querySelector('.c'); if (!s) continue
      const h0 = c.closest('tr').getBoundingClientRect().height
      if (!s.dataset.dcrWas) s.dataset.dcrWas = s.textContent
      s.textContent = `${count}·${s.dataset.dcrWas}`; s.classList.add('wide', 'w4')
      out.push({ id, d, rowH0: Math.round(h0 * 10) / 10, rowH1: Math.round(c.closest('tr').getBoundingClientRect().height * 10) / 10, font: getComputedStyle(s).fontSize, overflow: s.scrollWidth > s.clientWidth + 1 })
    }
    return out
  }, [ids, count])
}
async function warPicRow(p, id) {
  await p.evaluate(id => {
    const c = document.querySelector(`[data-testid="cell-${id}-2026-07-15"]`); const tr = c.closest('tr')
    tr.querySelector('td.who').setAttribute('data-dcr-pic', '')
    for (const d of ['13', '19']) document.querySelector(`[data-testid="cell-${id}-2026-07-${d}"]`)?.setAttribute('data-dcr-pic', '')
    for (const d of ['15', '16', '17']) document.querySelector(`[data-testid="cell-${id}-2026-07-${d}"]`)?.classList.add('dcr-mk')
    const prev = tr.previousElementSibling, next = tr.nextElementSibling
    if (prev) prev.querySelector('td.who')?.setAttribute('data-dcr-pic', ''); if (next) next.querySelector('td.who')?.setAttribute('data-dcr-pic', '')
  }, id)
}

async function f5(p) {
  await warJuly(p)
  for (const id of MEN) {
    const cells = await warCells(p, id); fact(5, `today ${CS[id]}'s boxes 15-17 Jul`, cells)
    if (!cells.every(c => c && /^(OD|LL)$/.test(c.text))) throw new Error('premise: ' + CS[id] + ' has no shared entry boxes')
  }
  for (const id of ['bane', 'psy']) {
    await warCells(p, id)
    await warPicRow(p, id); await tags(p, [[`[data-testid="cell-${id}-2026-07-15"]`, '5']]); await shot(p, `f5-war-${CS[id].toLowerCase()}-today`); await unmark(p)
  }
  for (const id of MEN) { await warCells(p, id); fact(5, `marked ${CS[id]}`, await warMark(p, [id], 3)) }
  for (const id of ['bane', 'psy']) {
    await warCells(p, id); await warMark(p, [id], 3)
    await warPicRow(p, id); await tags(p, [[`[data-testid="cell-${id}-2026-07-15"]`, '5']]); await shot(p, `f5-war-${CS[id].toLowerCase()}-proposed`); await unmark(p)
  }
}

async function f6(p) {
  /* the group leave's own window, opened for real on the Inputs page, to be put over the war */
  await toPage(p, 'Inputs'); await sleep(500)
  if (await p.locator('#inMemberMode:visible').count()) await press(p, '#inMemberMode')
  /* the calendar, stepped back to July (after a reload the list holds the next two weeks of today's real date) */
  await press(p, '#inCalBtn'); await sleep(600)
  for (let i = 0; i < 8 && !/JUL\w* 2026/i.test(await p.locator('[data-testid="ic-mon"]:visible').first().innerText()); i++) { await press(p, '#icPrev'); await sleep(350) }
  await press(p, `[data-testid="ib-bar-${IIDS.ll}"]:visible`); await sleep(900)
  if (!(await p.locator('[data-testid="win-inputedit"]:visible').count())) {
    /* the bar opened its day: the group leave's card there opens its own window */
    await press(p, p.locator(':is(button,[role=button],div):visible').filter({ hasText: /^Cutter, Dash, Ghost/ }).last()); await sleep(900)
  }
  const win = await p.evaluate(() => { const w = [...document.querySelectorAll('[data-testid="win-inputedit"]')].find(e => e.getBoundingClientRect().width > 0); if (!w) return null; const r = w.getBoundingClientRect(); return { html: w.outerHTML, left: r.left, top: r.top, width: r.width, height: r.height, title: w.querySelector('.airpop-h, header, [class*="hd"]')?.textContent.trim().slice(0, 80) } })
  fact(6, 'the group leave\'s own window (Inputs page)', win && { title: win.title, box: [win.left, win.top, win.width, win.height].map(Math.round) })
  if (!win) throw new Error('the input\'s own window did not open')
  await p.keyboard.press('Escape'); await sleep(500)
  if (await p.locator('[data-testid="win-inputedit"]:visible').count()) await press(p, '#inpEditClose').catch(() => {})
  await warJuly(p)
  await warCells(p, 'psy')
  await press(p, '[data-testid="cell-psy-2026-07-15"]'); await sleep(1000)
  const held = await p.evaluate(() => { const l = document.querySelector('.bidsheet [data-testid="bid-heldday"]'); return l ? l.textContent : null })
  fact(6, 'today: the war window\'s line for the group leave', held)
  if (!held || !/change it on the Inputs page/.test(held)) throw new Error('premise: no held line')
  const mkWin = () => p.evaluate(() => { const w = document.querySelector('.bidsheet'); w.setAttribute('data-dcr-pic', ''); document.querySelector('[data-testid="cell-psy-2026-07-15"]').closest('tr').querySelector('td.who').setAttribute('data-dcr-pic', ''); document.querySelector('[data-testid="bid-heldday"]').classList.add('dcr-mk') })
  /* (no neutral tap here: on a phone a tap outside the war's window closes it) */
  await mkWin(); await tags(p, [['[data-testid="bid-heldday"]', '6']]); await shot(p, 'f6-war-window-today'); await unmark(p)
  /* proposed: the boxes wear the shared mark; the line's words give way to a clone of the window's own button */
  fact(6, 'marked the shared entries', await warMark(p, MEN, 3))
  const btn = await p.evaluate(words => {
    const line = document.querySelector('[data-testid="bid-heldday"]'); const spans = [...line.children]
    const tail = spans.find(s => /change it on the Inputs page/.test(s.textContent)); tail.style.display = 'none'
    const src = document.querySelector('.bidsheet .abtn.docbtn'); const b = src.cloneNode(true)
    b.querySelectorAll('svg').forEach(s => s.style.display = 'none'); b.querySelector('span').textContent = words; b.removeAttribute('title'); b.classList.add('dcr-newbtn')
    line.appendChild(b)
    const r = b.getBoundingClientRect(), lr = line.getBoundingClientRect(), dr = src.getBoundingClientRect()
    return { btnH: Math.round(r.height), docH: Math.round(dr.height), lineH: Math.round(lr.height), fitsLine: r.right <= lr.right + 0.5 }
  }, W.all3)
  fact(6, 'the new button', btn)
  await mkWin(); await tags(p, [['[data-testid="bid-heldday"]', '6'], ['.dcr-newbtn', 'New', 'r']]); await shot(p, 'f6-war-window-proposed'); await unmark(p)
  /* …pressed: the input's own window over the war, the grid behind it (a clone of the real one, in the app's root) */
  const put = await p.evaluate(win => {
    const host = document.createElement('div'); host.innerHTML = win.html; const w = host.firstElementChild; w.classList.add('dcr-clonewin')
    document.getElementById('root').appendChild(w)
    const r = w.getBoundingClientRect(); const cs = getComputedStyle(w)
    return { box: [r.left, r.top, r.width, r.height].map(Math.round), bg: cs.backgroundColor, pos: cs.position }
  }, win)
  fact(6, 'the input\'s own window put over the war', put)
  await p.evaluate(() => { document.querySelector('.dcr-clonewin').setAttribute('data-dcr-pic', ''); document.querySelector('.bidsheet').setAttribute('data-dcr-pic', ''); document.querySelector('[data-testid="cell-psy-2026-07-15"]').closest('tr').querySelector('td.who').setAttribute('data-dcr-pic', '') })
  await tags(p, [['.dcr-clonewin', '6']])
  await shot(p, 'f6-war-input-window-proposed', 0)
  await unmark(p)
}

/* ---------------- run ---------------- */
let IIDS = {}
const engine = PHONE ? PW.webkit : PW.chromium
const browser = await engine.launch()
const ctx = await browser.newContext(PHONE
  ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
  : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 })
const p = await ctx.newPage()
p.setDefaultTimeout(10000)
p.on('pageerror', e => console.log('PAGEERROR', e.message))
p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)) })
const failed = []
try {
  await signIn(p, true)
  for (const [k, spec] of Object.entries(SPECS)) {
    const r = await fileInput(p, spec); IIDS[k] = r.iid
    fact('stage', k, { ...r.rec, asked: r.asked })
    if (JSON.stringify([...r.rec.people].sort()) !== JSON.stringify([...spec.people].sort()) || r.rec.type !== spec.type) throw new Error('staged wrong: ' + k)
  }
  const FR = { 1: f1, 2: f2, 3: f3, 4: f4, 5: f5, 6: f6 }
  for (const n of ONLY) {
    try { await reset(p); console.log('--- frame', n); await FR[n](p) } catch (e) { failed.push(n + ': ' + e.message.split('\n')[0]); console.log('FRAME FAILED', n, e.message.split('\n')[0]); await p.screenshot({ path: path.join(IMG, `fail-${n}-${PHONE ? 'phone' : 'desktop'}.png`) }).catch(() => {}) }
  }
} finally {
  await browser.close(); if (relay) relay.close()
}
console.log('DONE', VERSION, 'failed:', failed.length ? failed.join(' | ') : 'none')
