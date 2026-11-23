// Re-walker r1 — the re-walk of three fixes on the build of commit bde8ef0a0 (23 Nov 26, chat 152):
//   W8-1 (Astra's S4): Ranger's run of days over 16–18 on the SANS calendar now says why it does nothing;
//   W8-2 (S19): the SANS calendar's Highlight list offers men posted out as SANS before their date;
//   W10-1 (S12x): a shared offer whose second man is hidden no longer says "for 2 people".
// Recipes: sah-w8*.mjs (W8-1, W8-2) and sah-w10*.mjs (W10-1), their own helpers re-used. window.* is only READ (and
// window.go, the recipes' page switch). Run from raptor-port/ (the build on 4401):
//   R1_RUN=run1 ONLY=w81-d,w81-c,w81-p,w82-d,w82-p,w101-d,w101-p node scripts/handpass/sah-r1.mjs
import './sah-r1-env.mjs'
import path from 'node:path'
import { writeFileSync } from 'node:fs'
const X = await import('./sah-w8-lib.mjs')
const T = await import('./sah-w10-lib.mjs')
const { L, sleep, J, RANGER, HEX } = X
const VERSION = 'sah-r1 v1'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
console.log(VERSION, L.URL_, L.OUT, ONLY.join(','))
const WORDS = 'Ranger is SANS from Fri 17 Jul: file SANS availability for days from then'
const D16 = '2026-07-16', D17 = '2026-07-17', D18 = '2026-07-18', D20 = '2026-07-20', D21 = '2026-07-21'
const SANS_TODAY = ['BoltC', 'JesterB', 'KrakenD', 'MarlinA', 'OtterD', 'PixelD', 'RebelB', 'ScribeD', 'TallyO', 'ZenithC', 'ZuluO']

async function run(name, szKey, fn) {
  const sz = szKey === 'c' ? X.PC : L.SIZES[szKey], W = L.mk(name, sz)
  if (szKey === 'c') { W.isPhone = true; W.touchCdp = true }
  const { b, ctx, p } = await L.world(sz, W, '2026-07-15T09:00:00')
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('today', "the app's today (page clock), Saber signed in", null, await L.today(p))
    await fn(p, W, ctx)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
  writeFileSync(path.join(L.OUT, `results-${name}-${sz.name}.json`), JSON.stringify(L.results.filter(r => r.scn === name && r.size === sz.name), null, 1))
}
async function post(p, W, id, iso, tag) {
  const po = await L.postOut(p, W, id, iso, tag)
  const ok = new RegExp(`${+iso.slice(8, 10)} Jul: becomes SANS`).test(po.line)
  W.rec(tag, `Saber: Leave War, ${id === RANGER ? 'Ranger' : 'Hex'}'s ${iso.slice(8)} Jul cell → ⋯ → Post out → SANS → Post out (read back)`, ok, `sheet line "${po.line}" · record ${J(po.after)}`, po.pic)
  return ok
}
/* every window closed, the input window first (w10's clean-up pressed the SANS day's ✕ under it) */
async function shut(p, W) {
  const ix = p.locator('[data-testid="win-inputedit-x"]:visible').first(); if (await ix.count()) { await W.press(p, ix, 'inpedit-x'); await sleep(300) }
  const go = p.locator('[data-testid="inped-escask-go"]:visible').first(); if (await go.count()) { await W.press(p, go, 'discard'); await sleep(300) }
  await X.closeInp(p, W)
  await T.closeAll(p, W)
}
const sansIn = (p, id) => p.evaluate(id => (window.INPUTS || []).filter(r => r.type === 'SANS Availability' && JSON.stringify(r).includes('"' + id + '"')).map(r => r.date + (r.end ? '–' + r.end : '') + (r.endDate ? '–' + r.endDate : '')).sort(), id)
const toastNow = p => p.evaluate(() => {
  const t = document.getElementById('toastEl'); if (!t) return { text: '', op: 'none' }
  const cs = getComputedStyle(t)
  return { text: (t.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim(), op: cs.opacity, inlineOp: t.style.opacity, bg: cs.backgroundColor, color: cs.color, border: cs.borderColor, cls: t.className }
})
/* wait until no passing note shows (so the next one read is the next gesture's own) */
async function toastGone(p) { for (let i = 0; i < 60; i++) { const t = await toastNow(p); if (t.op === 'none' || +t.op === 0 || !t.text) return i * 200; await sleep(200) } return 'still showing after 12 s' }
/* right after the release: the note read and the screen pictured at once (the ms counted), then polled until it shows */
async function afterRelease(p, W, t0, tag) {
  const quick = await toastNow(p)
  const f = path.join(L.OUT, 'taps', `${W.scn}-${tag}-released-${W.sz.name}.png`)
  await p.screenshot({ path: f })
  const picMs = Date.now() - t0
  let shown = quick, shownMs = Date.now() - t0
  for (let i = 0; i < 15 && !(shown.text && +shown.op > 0); i++) { await sleep(100); shown = await toastNow(p); shownMs = Date.now() - t0 }
  return { quick, picMs, shown, shownMs, quickPic: 'taps/' + path.basename(f) }
}
/* a run over the month's dates — the w8 recipe (sah-w8-lib dragDays / keysRun) with the release pictured at once */
async function gesture(p, W, how, tag) {
  if (W.isPhone) await X.sansX(p, W)
  const a = how[1]
  await X.sansGoto(p, W, a)
  let held, t0, rel
  if (how[0] === 'drag') {
    const b = how[2]
    const box = async iso => { const l = p.locator(`[data-testid="sc-day-${iso}"]`).first(); await l.scrollIntoViewIfNeeded(); return l.boundingBox() }
    const A = await box(a), B = await box(b)
    const ax = A.x + A.width / 2, ay = A.y + A.height / 2, bx = B.x + B.width / 2, by = B.y + B.height / 2
    if (W.touchCdp) {
      const cdp = await p.context().newCDPSession(p)
      const tp = (x, y) => [{ x, y, id: 1, radiusX: 4, radiusY: 4, force: 1 }]
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(ax, ay) })
      await sleep(600)
      for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(ax + (bx - ax) * i / 8, ay + (by - ay) * i / 8) }); await sleep(40) }
      await sleep(120)
      held = await p.evaluate(() => [...document.querySelectorAll('.sc-day.is-picked')].map(e => e.dataset.icday.slice(8)))
      await p.screenshot({ path: path.join(L.OUT, 'taps', `${W.scn}-${tag}-held-${W.sz.name}.png`) })
      t0 = Date.now()
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    } else {
      await p.mouse.move(ax, ay); await p.mouse.down(); await sleep(80)
      for (let i = 1; i <= 8; i++) { await p.mouse.move(ax + (bx - ax) * i / 8, ay + (by - ay) * i / 8); await sleep(30) }
      await sleep(80)
      held = await p.evaluate(() => [...document.querySelectorAll('.sc-day.is-picked')].map(e => e.dataset.icday.slice(8)))
      await p.screenshot({ path: path.join(L.OUT, 'taps', `${W.scn}-${tag}-held-${W.sz.name}.png`) })
      t0 = Date.now()
      await p.mouse.up()
    }
  } else {
    await p.locator(`[data-testid="sc-day-${a}"]`).first().focus(); await sleep(150)
    for (let i = 0; i < Math.abs(how[2]); i++) { await p.keyboard.press(how[2] > 0 ? 'Shift+ArrowRight' : 'Shift+ArrowLeft'); await sleep(120) }
    held = await p.evaluate(() => [...document.querySelectorAll('.sc-day.is-picked')].map(e => e.dataset.icday.slice(8)))
    t0 = Date.now()
    await p.keyboard.press('Enter')
  }
  rel = await afterRelease(p, W, t0, tag)
  await sleep(900)
  const settledToast = await toastNow(p)
  const opened = !!(await X.inpOpen(p))
  const settledPic = await W.pic(p, tag + '-settled')
  return { held, ...rel, settledToast, opened, settledPic, r: opened ? await X.inpRead(p) : null }
}

/* ---------- W8-1: Ranger's run over 16–18 (desktop mouse + keys; phone finger in Chromium at the phone's size) ---------- */
async function w81(p, W) {
  if (!(await post(p, W, RANGER, D17, 'w81-00'))) return
  W.rec('w81-who', 'signed in as', null, await X.as(p, W, 'us', 'us'))
  await X.openSans(p, W); await X.sansGoto(p, W, D16)
  if (W.sz.name === 'phone') {   // WebKit gives the page no finger drag (walk-scripts §4): the plain-user round only
    W.rec('w81-webkit', 'WebKit phone: the drags are walked in Chromium at the phone\'s size (w81 at size c); here the plain-user round only', 'NW', '')
    return pu(p, W, 'Ranger')
  }
  const tries = [['w81-01', ['drag', D16, D18]], ['w81-02', ['drag', D18, D16]]]
  if (!W.isPhone) tries.push(['w81-03', ['keys', D16, 2]], ['w81-04', ['keys', D18, -2]])
  else W.rec('w81-keys', 'the keys (Shift+arrows, Enter) on the phone', 'NW', 'a phone has no Shift + arrows — walked on the desktop')
  for (const [tag, how] of tries) {
    const gone = await toastGone(p)
    const before = await sansIn(p, RANGER)
    const g = await gesture(p, W, how, tag)
    const after = await sansIn(p, RANGER)
    const say = how[0] === 'drag' ? `${W.touchCdp ? 'a finger held, then dragged (Chromium at the phone\'s size, real touch)' : 'a mouse drag'} ${how[1].slice(8)}→${how[2].slice(8)}` : `the keys from ${how[1].slice(8)}: Shift+${how[2] > 0 ? '→' : '←'} ×2, Enter`
    const amber = g.shown.bg + ' / ' + g.shown.color + ' / border ' + g.shown.border
    const ok = !g.opened && J(before) === J(after) && g.shown.text === WORDS
    W.rec(tag, `Ranger: ${say} → no window, nothing saved, the amber passing note "${WORDS}"`, ok,
      `days lit while held ${J(g.held)} · at release+${g.picMs} ms the note read "${g.quick.text}" (opacity ${g.quick.op}) · shown by +${g.shownMs} ms: "${g.shown.text}" (opacity ${g.shown.op}; colours ${amber}; class "${g.shown.cls}") · settled: window ${g.opened ? 'OPENED ' + J(g.r && { person: g.r.person, dates: g.r.dates }) : 'none'}, note "${g.settledToast.text}" · his SANS availability before ${J(before)} after ${J(after)} · note gone before the gesture after ${gone} ms`,
      `${g.quickPic}, ${g.settledPic}`)
    if (g.opened) await X.closeInp(p, W)
  }
  /* unchanged: his run 17 → 20 opens the window with him in it and saves one filing */
  await toastGone(p)
  const before = await sansIn(p, RANGER)
  const g = await gesture(p, W, ['drag', D17, D20], 'w81-05')
  let made = [], said = '', form = null, fpic = ''
  if (g.opened) {
    await X.setKinds(p, W, ['f'])
    form = await X.inpRead(p); fpic = await W.pic(p, 'w81-05-form')
    const s = await X.saveInp(p, W, 'w81-05'); made = s.made; said = s.said
    if (s.stayed) await X.closeInp(p, W)
  }
  const after = await sansIn(p, RANGER)
  W.rec('w81-05', `Ranger: ${W.touchCdp ? 'a finger held, then dragged (Chromium, phone size)' : 'a mouse drag'} 17→20 → the window opens with him in it; Fly, All day → Add: one filing 17–20`, g.opened && /Ranger/.test(form && form.person || '') && made.length === 1,
    `days lit ${J(g.held)} · window ${g.opened ? J(form && { person: form.person, dates: form.dates, ticks: form.ticks }) : 'did NOT open'} · said "${said}" · made ${J(made)} · his SANS availability before ${J(before)} after ${J(after)}`, [g.settledPic, fpic].filter(Boolean).join(', '))
  await X.sansX(p, W)
  await pu(p, W, 'Ranger')
}

/* ---------- W8-2: Highlight offers men posted out as SANS before their dates ---------- */
async function hlOpen(p, W) {
  await W.press(p, p.locator('[data-testid="sc-hl"]:visible').first(), 'hl'); await sleep(400)
  return p.evaluate(() => [...document.querySelectorAll('.sc-hl-item')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ id: (e.dataset.testid || '').replace('sc-hl-', ''), text: (e.textContent || '').replace(/\s+/g, '').trim() })))
}
async function hlPick(p, W, id, tag) {
  const items = await hlOpen(p, W)
  const pic0 = await W.pic(p, tag + '-list')
  const it = p.locator(`[data-testid="sc-hl-${id}"]:visible`).first()
  if (!(await it.count())) { await p.keyboard.press('Escape'); await sleep(300); return { items, offered: false, rings: [], pic: pic0 } }
  await W.press(p, it, 'hl-' + id); await sleep(500)
  const rings = await p.evaluate(() => [...document.querySelectorAll('.sc-day.is-hi')].map(e => e.dataset.icday))
  return { items, offered: true, rings, pic: pic0 + ', ' + await W.pic(p, tag + '-rings') }
}
const listWords = items => items.map(i => i.text).join(',')
async function w82(p, W) {
  if (!(await post(p, W, RANGER, D17, 'w82-00a')) || !(await post(p, W, HEX, D20, 'w82-00b'))) return
  await X.openSans(p, W); await X.sansGoto(p, W, D17)
  const items = await hlOpen(p, W)
  const ids = items.map(i => i.id), dup = ids.filter((v, i) => ids.indexOf(v) !== i)
  const missing = SANS_TODAY.filter(s => !items.some(i => i.text === s))
  W.rec('w82-01', 'Saber, Wed 15: the Highlight list offers Ranger (SANS from Fri 17) and Hex (SANS from Mon 20); the men SANS today still listed; none twice', ids.includes(RANGER) && ids.includes(HEX) && !dup.length && !missing.length,
    `list "${listWords(items)}" · ids ${J(ids)} · twice ${J(dup)} · SANS-today men missing ${J(missing)}`, await W.pic(p, 'w82-01-list'))
  await p.keyboard.press('Escape'); await sleep(400)
  if (await p.locator('.sc-hl-item:visible').count()) { await W.press(p, p.locator('[data-testid="sc-hl"]:visible').first(), 'hl-shut'); await sleep(300) }
  /* filed through the app: Ranger on Sat 18 (Fly) and Mon 20 (Fly + OFT), Hex on Tue 21 (Fly), by Saber's "+ Commitment" */
  const fs = []
  for (const [iso, who, kinds] of [[D18, RANGER, ['f']], [D20, RANGER, ['f', 'o']], [D21, HEX, ['f']]]) {
    const f = await X.fileOn(p, W, iso, { who, kinds, tag: 'w82-02-' + iso.slice(8) })
    fs.push(f)
    W.rec('w82-02-' + iso.slice(8), `Saber: ${iso.slice(8)} Jul → "+ Commitment" → Person ${who === RANGER ? 'Ranger' : 'Hex'}, ${kinds.join('+')}, All day → Add: saved`, f.ok && f.made.length === 1, `${f.whoSet} · said "${f.said}" · made ${J(f.made)}`, f.pic)
  }
  await X.sansX(p, W)
  const r = await hlPick(p, W, RANGER, 'w82-03')
  W.rec('w82-03', 'Highlight → Ranger: every day he has committed to rings (18, 20) and no other', r.offered && J(r.rings) === J([D18, D20]), `offered ${r.offered} · ringed ${J(r.rings)} · list "${listWords(r.items)}"`, r.pic)
  const h = await hlPick(p, W, HEX, 'w82-04')
  W.rec('w82-04', 'Highlight → Hex (SANS from Mon 20): his one day (21) rings', h.offered && J(h.rings) === J([D21]), `offered ${h.offered} · ringed ${J(h.rings)}`, h.pic)
  const ids2 = h.items.map(i => i.id), dup2 = ids2.filter((v, i) => ids2.indexOf(v) !== i)
  const zid = (h.items.find(i => i.text === 'ZuluO') || {}).id
  const z2 = zid ? await hlPick(p, W, zid, 'w82-05') : { offered: false, rings: [], pic: '' }
  W.rec('w82-05', 'the list again after the filings: none twice; a man SANS today (Zulu) still picks', !dup2.length && z2.offered, `ids ${J(ids2)} · twice ${J(dup2)} · Zulu (${zid}) offered ${z2.offered}, ringed ${J(z2.rings)}`, z2.pic)
  const n = await hlPick(p, W, 'none', 'w82-06')
  W.rec('w82-06', 'No highlight: the rings go', n.offered && n.rings.length === 0, `ringed ${J(n.rings)}`, n.pic)
  await pu(p, W, 'Saber')
}

/* ---------- W10-1: the shared offer, one man's share hidden — its small print ---------- */
async function placedOf(p) {
  return p.evaluate(() => {
    const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0)
    if (!w) return []
    const P = window.PEOPLE
    return [...w.querySelectorAll('.sd-row')].map(r => { const pk = r.querySelector('[data-person]'); const id = pk ? pk.getAttribute('data-person') : '?'; return { who: (P[id] || {}).cs || id, placed: ((r.querySelector('[data-testid="sd-placed"]') || {}).textContent || '').replace(/\s+/g, ' ').trim(), line: (r.textContent || '').replace(/\s+/g, ' ').trim() } })
  })
}
async function w101(p, W) {
  if (!(await post(p, W, RANGER, D17, 'w101-01')) || !(await post(p, W, HEX, D17, 'w101-02'))) return
  const f = await T.file(p, W, D17, [RANGER, HEX], ['fly', 'oft', 'amt'], 'all', 'w101-03')
  W.rec('w101-03', 'Saber: one shared offer for Ranger + Hex on Fri 17 (read back)', !!f.made, J(f.made) + ' ' + f.refused, f.pic)
  if (!f.made) return
  await shut(p, W)
  let s = await T.sansRead(p, W, D17, 'w101-04')
  let pl = await placedOf(p)
  W.rec('w101-04', 'before the move: Fri 17 lists both; the shared line\'s small print (RECORD)', s.has('Ranger') && s.has('Hex') && s.n === 2, `${T.rowsLine(s.day)} · lines ${J(pl)}`, s.pic)
  await shut(p, W)
  const m = await T.movePo(p, W, RANGER, D17, D18, 'w101-05')
  W.rec('w101-05', "Saber: Ranger's posting moved to Sat 18 on his sheet's date box (Hex's stays 17)", m.ok && /18 Jul/.test(m.line), `"${m.before}" → "${m.line}" ${m.err ? 'err "' + m.err + '"' : ''} · record ${J(m.rec)}`, m.pic)
  await shut(p, W)
  s = await T.sansRead(p, W, D17, 'w101-06')
  pl = await placedOf(p)
  const hexLine = pl.find(x => x.who === 'Hex') || {}
  const clip = await T.W5.clip(p, W, '[data-testid="win-sansday"] .sd-row', 'w101-06')
  W.rec('w101-06', 'Fri 17 opened after the move: Ranger not listed; Hex\'s line no longer says "for 2 people" (RECORD its exact words)', s.n === 1 && s.has('Hex') && !s.has('Ranger') && !/2 people|Ranger/.test(hexLine.placed || '') && !/2 people/.test(hexLine.line || ''),
    `${T.rowsLine(s.day)} · Hex's line "${hexLine.line}" · its small print "${hexLine.placed}" · month cell ${T.cellLine(s.cell)}`, [clip, s.pic].filter(Boolean).join(', '))
  W.rec('w101-06r', 'RECORD: the exact words of Hex\'s line on Fri 17 while Ranger\'s share is hidden', 'REC', `"${hexLine.line}" — small print "${hexLine.placed}"`)
  const row = p.locator(`[data-testid="win-sansday"] [data-popiid="${f.iid}"] [data-testid="sd-open"]`).first()
  if (await row.count()) {
    await W.press(p, row, 'sd-open')
    await p.waitForSelector('[data-testid="win-inputedit"]', { timeout: 6000 }).catch(() => {})
    await sleep(500)
    const w = await p.evaluate(() => { const e = [...document.querySelectorAll('[data-testid="win-inputedit"]')].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const P = window.PEOPLE; const ids = [...e.querySelectorAll('[data-person], [data-pp]')].filter(x => x.getBoundingClientRect().width > 0 && (!x.dataset.pp || x.classList.contains('on'))).map(x => x.getAttribute('data-person') || x.dataset.pp); return { title: ((e.querySelector('.win-ttl, .fw-title, h2, header') || {}).textContent || '').replace(/\s+/g, ' ').trim(), picked: [...new Set(ids)].map(i => (P[i] || {}).cs || i), count: ((e.querySelector('[data-testid="pp-count"]') || {}).textContent || '').trim(), dates: [...e.querySelectorAll('[data-testid^="inpEdCal-day-"].is-on, [data-testid^="inpEdCal-day-"].is-start, [data-testid^="inpEdCal-day-"][aria-pressed="true"]')].map(x => x.dataset.iso), ro: ((e.querySelector('[data-testid="inped-ro"]') || {}).textContent || '').trim(), save: !!e.querySelector('#inpEditSave'), del: !!e.querySelector('#inpEditDel') } })
    W.rec('w101-07', 'a tap on Hex\'s line opens the shared input\'s own window — RECORD what it shows (the whole record\'s window; naming both is the host\'s accepted reading)', 'REC', J(w), await W.pic(p, 'w101-07'))
  } else W.rec('w101-07', 'a tap on Hex\'s line', false, 'no open control on the line for the shared input ' + f.iid, await W.pic(p, 'w101-07'))
  await shut(p, W)
  const m2 = await T.movePo(p, W, RANGER, D18, D17, 'w101-08')
  W.rec('w101-08', "Saber: Ranger's posting moved back to Fri 17", m2.ok && /17 Jul/.test(m2.line), `"${m2.before}" → "${m2.line}" ${m2.err ? 'err "' + m2.err + '"' : ''} · record ${J(m2.rec)}`, m2.pic)
  await shut(p, W)
  s = await T.sansRead(p, W, D17, 'w101-09')
  pl = await placedOf(p)
  W.rec('w101-09', 'Fri 17 after the move back: both listed again; the shared line says "for 2 people" again', s.n === 2 && s.has('Ranger') && s.has('Hex') && pl.some(x => /for 2 people/.test(x.placed)),
    `${T.rowsLine(s.day)} · lines ${J(pl)} · month cell ${T.cellLine(s.cell)}`, s.pic)
  await shut(p, W)
  await pu(p, W, 'Saber')
}

/* ---------- the plain-user round on the SANS calendar: open, the day window closed by ✕ and by Escape, the bell ---------- */
async function pu(p, W, who) {
  await shut(p, W)
  await X.openSans(p, W); await X.sansGoto(p, W, D18)
  const m = await X.sansPage(p)
  W.rec('PU-01', `${who}: the SANS tab opens on its month`, m.cal && /jul/i.test(m.month), `page ${m.page} · month "${m.month}"`, await W.pic(p, 'pu-01'))
  let d = await X.sansDay(p, W, D18)
  const opened = d.win
  let r = await X.sansX(p, W, 'x')
  W.rec('PU-02', `${who}: Sat 18 opened (on screen, on top), closed by its ✕`, !!opened && opened.inScreen && opened.topIsWin && r === 'closed', `opened ${J(opened && { ttl: opened.ttl, box: opened.box })} · ${r}`, await W.pic(p, 'pu-02'))
  d = await X.sansDay(p, W, D18)
  r = await X.sansX(p, W, 'esc')
  W.rec('PU-03', `${who}: Sat 18 reopened, closed by Escape`, !!d.win && r === 'closed', r, await W.pic(p, 'pu-03'))
  for (const how of ['escape', 'bell']) {
    const b = await X.bellRead(p, W, 'pu-bell-' + how)
    const said = await X.bellShut(p, how, W)
    W.rec('PU-bell-' + how, `${who}: the bell opened (its lines read), closed by ${how === 'bell' ? 'the bell again' : 'Escape'}`, b.lines !== null && said === 'closed', `${said} · ${X.bellWords(b)}`, b.pic)
  }
}

const FN = { w81, w82, w101 }
for (const k of ONLY) {
  const i = k.lastIndexOf('-'), name = k.slice(0, i), sz = k.slice(i + 1)
  if (!FN[name]) { console.log('unknown', k); continue }
  await run(name, sz, FN[name])
}
writeFileSync(path.join(L.OUT, `results-${process.env.R1_RUN || 'run1'}-${ONLY.join('_').slice(0, 80)}.json`), JSON.stringify(L.results, null, 1))
console.log('done')
