// Chat 179, 25 Nov 26: the SANS leftovers (23)–(25) drawn on the real app before anything is built (D1625).
// D2570–D2572 (his bell when what he filed misses what he is planned on), D2575 (the crew list's words for it), D2579
// (one amber warning line for nothing filed), D2580 (the "S" letter and its Legend line), D2576–D2578 (SC MAIN, SC SPARE,
// BB, AVALON need no filing), the host's question on a sim with no times, and D2573 (built: a flying line with no times).
// Each case is staged through the app's own controls on the frozen build, its premise asserted ON SCREEN, pictured as it
// reads TODAY; only then are the words or marks of the part the app drew changed (a new part cloned from its real
// neighbour and marked "New"), and it is pictured again. window.* is only READ. Words: Fable's final words
// (D:/raptor-work/c179-words/fable-words.md), used exactly.
// Run from raptor-port/ against the frozen build served on port 4880, one size a process:
//   SZ=d ONLY=a1,a2 node docs/mock/2026-11-25-sans-leftovers/draw.mjs
import path from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
const SZ = process.env.SZ || 'd'
process.env.W2_URL = process.env.DRAW_URL || 'http://localhost:4880/'
process.env.W2_OUT = process.env.DRAW_OUT || `D:/raptor-work/c179-draw/runs/run-${SZ}`
process.env.W1_URL = process.env.W2_URL
process.env.W1_OUT = process.env.W2_OUT
mkdirSync(path.join(process.env.W2_OUT, 'taps'), { recursive: true })
const HERE = path.dirname(fileURLToPath(import.meta.url))
const A = await import(pathToFileURL(path.resolve(HERE, '../../../scripts/handpass/swd-w14a-lib.mjs')).href)
const { T, L, RANGER } = A
const IMG = path.join(HERE, 'img')
mkdirSync(IMG, { recursive: true })
T.L.SIZES.d.opts.deviceScaleFactor = 2
const ONLY = (process.env.ONLY || 'a1,a2,a3,a5,a6,nf,sb').split(',')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const size = SZ === 'd' ? 'desktop' : 'phone'
const facts = []
const fact = (scene, what, v) => { facts.push({ scene, size, what, v }); console.log(`[${scene}] ${what}:`, typeof v === 'string' ? v : JSON.stringify(v)) }
const must = (scene, what, ok, v) => { fact(scene, (ok ? 'ASSERTED ' : 'PREMISE FAILED ') + what, v); if (!ok) throw new Error('premise failed: ' + what + ' :: ' + JSON.stringify(v)) }

/* ---------------- the words (Fable's final words, exact) ---------------- */
const W = {
  A1: ["You're planned on the OFT sim on Sun 19 Jul,", 'but you offered Fly only. Tap to change your availability.'],
  A2: ["You're planned to fly on Sat 18 Jul,", 'but you offered OFT only. Tap to change your availability.'],
  A3: ["You're planned on the AMT sim on Sun 19 Jul,", 'but you offered OFT only. Tap to change your availability.'],
  A5: ["You're planned to fly on Sat 18 Jul, 12:00–15:30,", 'but you offered Fly 08:00–12:00 only. Tap to change your availability.'],
  A1b: ["Your SANS availability doesn't match.", "You're planned on the OFT sim on Sun 19 Jul, but you offered Fly only. Tap to change your availability."],
  B1: 'SANS — offered Fly only, not OFT',
  B2: 'SANS — offered OFT only, not AMT',
  C2: 'SANS: no availability filed for today.',
  Q4: 'SANS: offered Fly only today.',
  C3: 'A SANS man planned outside the event or the hours he filed, or with nothing filed.',
  C3name: 'SANS availability — not filed, or planned outside it',
  Da: 'SANS availability',
  Db: 'SANS availability — nothing filed, or planned outside it',
  E1: 'SANS — told on his bell',
}

/* ---------------- marks and pictures ---------------- */
const PINK = '#FF3EA5'
const prep = p => p.evaluate(PINK => {
  if (!document.getElementById('sw-style')) {
    const s = document.createElement('style'); s.id = 'sw-style'
    s.textContent = `.sw-mark{outline:2px solid ${PINK} !important;outline-offset:2px !important}
      .sw-mark.sw-in{outline-offset:-2px !important}
      .sw-tag{position:fixed;z-index:2147483647;background:${PINK};color:#fff;font:700 10px/1 system-ui,-apple-system,sans-serif;padding:3px 6px;border-radius:6px;letter-spacing:.04em;pointer-events:none}`
    document.head.appendChild(s)
  }
  document.querySelectorAll('.sw-mark').forEach(e => e.classList.remove('sw-mark', 'sw-in'))
  document.querySelectorAll('.sw-tag').forEach(e => e.remove())
  const t = document.getElementById('toastEl'); if (t) { t.style.transition = 'none'; t.style.opacity = '0' }
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur()
}, PINK)
/* outline the element(s) carrying data-sw=<key>; tags "New" on those listed as new (a fixed tag placed from the element's
   box just before the picture, the screen being still: the outline stays on the element) */
async function mark(p, keys, newKeys = [], inKeys = []) {
  await prep(p)
  return p.evaluate(([keys, newKeys, inKeys]) => {
    const out = {}
    for (const k of keys) {
      const e = [...document.querySelectorAll(`[data-sw="${k}"]`)].filter(x => x.getBoundingClientRect().width > 0).pop()
      if (!e) { out[k] = 'MISSING'; continue }
      const b0 = e.getBoundingClientRect()
      e.classList.add('sw-mark'); if (inKeys.includes(k)) e.classList.add('sw-in')
      const b1 = e.getBoundingClientRect()
      out[k] = Math.abs(b0.width - b1.width) + Math.abs(b0.height - b1.height) + Math.abs(b0.left - b1.left) + Math.abs(b0.top - b1.top) < 0.5 ? 'box unchanged' : 'BOX MOVED'
      /* a "New" tag stands clear of the words: above the outline's right end by default, or below it ("key:below") */
      const nk = newKeys.find(x => x.split(':')[0] === k)
      if (nk) {
        const where = nk.split(':')[1] || 'above'
        const t = document.createElement('div'); t.className = 'sw-tag'; t.textContent = 'New'; document.body.appendChild(t)
        const tb = t.getBoundingClientRect()
        if (where === 'right') { t.style.left = (b1.right + 6) + 'px'; t.style.top = (b1.top + (b1.height - tb.height) / 2) + 'px' }
        else {
          t.style.left = Math.max(2, b1.right - tb.width - 6) + 'px'
          t.style.top = (where === 'below' ? b1.bottom + 3 : Math.max(2, b1.top - tb.height - 3)) + 'px'
        }
      }
    }
    return out
  }, [keys, newKeys, inKeys])
}
/* the picture: the union of the marked parts and any extra boxes, padded, clamped to the screen */
async function shot(p, name, keys, o = {}) {
  const box = await p.evaluate(([keys, o]) => {
    const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 }
    const rs = []
    for (const k of keys) { const e = [...document.querySelectorAll(`[data-sw="${k}"]`)].filter(vis).pop(); if (e) rs.push(e.getBoundingClientRect()) }
    for (const q of (o.also || [])) { const e = [...document.querySelectorAll(q)].filter(vis).pop(); if (e) rs.push(e.getBoundingClientRect()) }
    document.querySelectorAll('.sw-tag').forEach(t => rs.push(t.getBoundingClientRect()))
    if (!rs.length) return null
    const px = o.padX ?? o.pad ?? 14, py = o.padY ?? o.pad ?? 14
    let x = Math.min(...rs.map(r => r.left)) - px, y = Math.min(...rs.map(r => r.top)) - py
    let x2 = Math.max(...rs.map(r => r.right)) + px, y2 = Math.max(...rs.map(r => r.bottom)) + py
    if (o.fullWidth) { x = 0; x2 = innerWidth }
    x = Math.max(0, x); y = Math.max(0, y); x2 = Math.min(innerWidth, x2); y2 = Math.min(innerHeight, y2)
    return { x, y, width: x2 - x, height: y2 - y }
  }, [keys, o])
  if (!box || box.width < 4 || box.height < 4) throw new Error('nothing to picture: ' + name + ' ' + keys)
  const f = `${name}-${size}.png`
  await p.screenshot({ path: path.join(IMG, f), clip: box })
  fact(name, 'picture', `${f} ${Math.round(box.width)}x${Math.round(box.height)}`)
  return f
}
const reveal = (p, key) => p.evaluate(k => { const e = [...document.querySelectorAll(`[data-sw="${k}"]`)].filter(x => x.getBoundingClientRect().width > 0).pop(); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }); return !!e }, key).then(r => sleep(350).then(() => r))

/* ---------------- the bell ---------------- */
async function bellOpen(p, W) {
  await T.closeAll(p, W)
  await W.press(p, '.bellbtn:visible', 'bell')
  await p.waitForSelector('[data-testid="bell-list"]', { timeout: 6000 })
  await sleep(400)
  return p.evaluate(() => {
    const list = [...document.querySelectorAll('[data-testid="bell-list"]')].find(e => e.getBoundingClientRect().width > 0)
    const t = e => e ? (e.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() : ''
    list.dataset.sw = 'bell'
    const b = [...document.querySelectorAll('.bellbtn')].find(e => e.getBoundingClientRect().width > 0); if (b) b.dataset.sw = 'bellbtn'
    const empty = list.querySelector('.bl-empty'); if (empty) empty.dataset.sw = 'empty'
    const lines = [...list.querySelectorAll('.bl-line')].map(e => ({ id: e.dataset.testid, unread: e.classList.contains('unread'), text: t(e.querySelector('.bl-main')) }))
    const due = list.querySelector('.bl-line[data-testid^="bell-line-sansdue"]')
    if (due) due.querySelector('.bl-main').dataset.sw = 'due'
    return { lines, empty: t(empty), lit: b ? b.classList.contains('on') : null, cap: due ? { line: due.outerHTML, foot: (list.querySelector('.bl-foot') || {}).outerHTML || '' } : null }
  })
}
/* lines drawn in on the bell, each a copy of the real reminder line captured from this bell earlier, its words changed */
const bellDraw = (p, cap, lines) => p.evaluate(([cap, lines]) => {
  const list = [...document.querySelectorAll('[data-testid="bell-list"]')].find(e => e.getBoundingClientRect().width > 0)
  const scroll = list.querySelector('.bl-scroll')
  const empty = list.querySelector('.bl-empty'); if (empty) empty.style.display = 'none'
  lines.slice().reverse().forEach((w, ri) => {
    const i = lines.length - 1 - ri
    const tmp = document.createElement('div'); tmp.innerHTML = cap.line
    const el = tmp.firstElementChild
    el.dataset.testid = 'bell-line-drawn-' + i; el.querySelector('.bl-main').dataset.sw = 'new' + i; el.classList.add('unread')
    el.querySelector('.bl-name').textContent = w[0]
    el.querySelectorAll('.bl-day').forEach(x => x.remove())
    el.querySelector('.bl-what').textContent = w[1]
    scroll.prepend(el)
  })
  /* the bell's own foot, as it stands under any line (captured from this bell while the real line was there) */
  if (!list.querySelector('.bl-foot') && cap.foot) { const t = document.createElement('div'); t.innerHTML = cap.foot; const f = t.firstElementChild; f.dataset.sw = 'foot'; list.appendChild(f) }
  /* an unread line lights the bell, as the real reminder did */
  const b = [...document.querySelectorAll('.bellbtn')].find(e => e.getBoundingClientRect().width > 0); if (b) b.classList.add('on')
  return [...list.querySelectorAll('.bl-line')].map(e => (e.textContent || '').replace(/\s+/g, ' ').trim())
}, [cap, lines])
const bellRedraw = (p, i, w) => p.evaluate(([i, w]) => { const el = document.querySelector(`[data-sw="new${i}"]`).closest('.bl-line'); el.querySelector('.bl-name').textContent = w[0]; el.querySelector('.bl-what').textContent = w[1] }, [i, w])

/* ---------------- the board: arm a place, read Ranger's crew-list puck ---------------- */
async function arm(p, W, sel) {
  const zone = p.locator(L.B(sel)).first()
  if (!(await zone.count())) throw new Error('no zone ' + sel)
  await zone.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  const addz = zone.locator('.addz').first()
  const ab = (await addz.count()) ? await addz.boundingBox() : null, zb = await zone.boundingBox()
  const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
  if (W.isPhone) await zone.tap({ position: pos }); else await zone.click({ position: pos })
  await sleep(500)
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  await T.W5.boardDrawer(p, W, true)
  return armed
}
async function disarm(p, W) {
  for (let i = 0; i < 2; i++) if (await p.evaluate(() => !!(window.ARM && window.ARM.key))) { await p.keyboard.press('Escape'); await sleep(300) }
  await T.W5.boardDrawer(p, W, false)
}
/* Ranger's crew-list puck on the open board: tagged data-sw="crew", its rows around tagged for the crop */
const crew = p => p.evaluate(() => {
  document.querySelectorAll('[data-sw^="crew"]').forEach(e => e.removeAttribute('data-sw'))
  const t = e => e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : ''
  const e = [...document.querySelectorAll('#schedBoard .rpuck[data-person="bane"]')].filter(x => !x.closest('.availwin')).find(x => x.getBoundingClientRect().width > 0)
  if (!e) return null
  e.dataset.sw = 'crew'
  const row = e.closest('.rsans-row') || e
  const sec = e.closest('.rsans')
  /* two rows above and below him, and the section's own width, for the crop */
  let a = row, b = row
  for (let i = 0; i < 2; i++) { if (a.previousElementSibling) a = a.previousElementSibling; if (b.nextElementSibling) b = b.nextElementSibling }
  a.dataset.sw = 'crewA'; b.dataset.sw = 'crewB'; if (sec) sec.dataset.sw = 'crewS'
  const rw = e.querySelector('.rwhy')
  return { cls: e.className, why: e.dataset.why || '', title: e.title, printed: rw && rw.getBoundingClientRect().width > 0 ? t(rw) : '', struck: /(^|\s)no(\s|$)/.test(e.className), where: sec ? t(sec.querySelector('.rh2')) : '?' }
})
/* the crop for a crew picture: his row with two above and below, across the section's width */
async function shotCrew(p, name, newKeys = []) {
  await reveal(p, 'crew')
  await mark(p, ['crew'], newKeys)
  const box = await p.evaluate(() => {
    const vis = e => e && e.getBoundingClientRect().width > 0
    const g = k => [...document.querySelectorAll(`[data-sw="${k}"]`)].filter(vis).pop()
    const a = g('crewA'), b = g('crewB'), s = g('crewS') || g('crew'), c = g('crew')
    const ra = (a || c).getBoundingClientRect(), rb = (b || c).getBoundingClientRect(), rs = s.getBoundingClientRect()
    /* the right edge from the rows' own pucks, words and SANS badge (his offered letters, "F"), not the section's */
    let right = c.getBoundingClientRect().right
    for (let r = a || c; r; r = r.nextElementSibling) { for (const q of r.querySelectorAll('.rpuck, .rwhy, .rsans-b, .rsans-r')) { const bb = q.getBoundingClientRect(); if (bb.width > 0) right = Math.max(right, bb.right) } if (r === b) break }
    /* the section's full width, so today and proposed are cut alike */
    let x = rs.left - 8, x2 = Math.max(rs.right + 8, right + 12), y = Math.min(ra.top, c.getBoundingClientRect().top) - 8, y2 = Math.max(rb.bottom, c.getBoundingClientRect().bottom) + 8
    document.querySelectorAll('.sw-tag').forEach(t => { const r = t.getBoundingClientRect(); y = Math.min(y, r.top - 2); x2 = Math.max(x2, r.right + 2) })
    x = Math.max(0, x); y = Math.max(0, y); x2 = Math.min(innerWidth, x2); y2 = Math.min(innerHeight, y2)
    return { x, y, width: x2 - x, height: y2 - y }
  })
  const f = `${name}-${size}.png`
  await p.screenshot({ path: path.join(IMG, f), clip: box })
  fact(name, 'picture', `${f} ${Math.round(box.width)}x${Math.round(box.height)}`)
}
/* his crew-list puck given new words (struck or not) — the app's own classes and its reason line */
const crewWords = (p, o) => p.evaluate(o => {
  const e = document.querySelector('[data-sw="crew"]')
  e.classList.toggle('no', !!o.struck)
  /* the crew list's own copy of his puck wears the same flag chip: "A" becomes "S" in a proposed frame (D2580) */
  if (o.chipS) { const ch = e.querySelector('.lchip.l-a'); if (ch) { ch.textContent = 'S'; ch.title = 'SANS availability — nothing filed, or planned outside it' } }
  if (o.why) {
    e.classList.add('haswhy'); e.dataset.why = o.why; e.title = 'Ranger — ' + o.why
    let rw = e.querySelector('.rwhy')
    if (!rw) { rw = o.cloneFrom ? (() => { const t = document.createElement('div'); t.innerHTML = o.cloneFrom; return t.firstElementChild })() : document.createElement('span'); rw.className = 'rwhy'; e.appendChild(rw) }
    rw.style.display = ''; rw.textContent = o.why
  } else {
    e.classList.remove('haswhy'); delete e.dataset.why; e.title = 'Ranger'
    const rw = e.querySelector('.rwhy'); if (rw) rw.style.display = 'none'
  }
  return { cls: e.className, title: e.title }
}, o)

/* every SANS man in the open board's SANS Avail section, read (person → class, reason, title, reason line) — the rule
   being drawn changes every SANS man with nothing filed, not Ranger alone (the method's step 5) */
const sansAll = p => p.evaluate(() => {
  const sec = [...document.querySelectorAll('#schedBoard .rsans')].find(x => x.getBoundingClientRect().width > 0)
  const out = { head: (sec.querySelector('.rh2') || {}).textContent || '', men: {} }
  for (const e of sec.querySelectorAll('.rpuck[data-person]')) { const rw = e.querySelector('.rwhy'); out.men[e.dataset.person] = { cls: e.className.replace(/\s*sw-mark|\s*sw-in/g, ''), why: e.dataset.why || '', title: e.title, rwhy: rw ? rw.outerHTML : '' } }
  return out
})
/* lay a read state onto the section as it stands now, for the men `pick` chooses; the heading's count recomputed */
const sansLay = (p, src, mode) => p.evaluate(([src, mode]) => {
  const sec = [...document.querySelectorAll('#schedBoard .rsans')].find(x => x.getBoundingClientRect().width > 0)
  const nothing = w => /^SANS — no availability filed|^SANS from .*: no availability filed/.test(w || '')
  const changed = []
  for (const e of sec.querySelectorAll('.rpuck[data-person]')) {
    const id = e.dataset.person, s = src.men[id], mark = e.classList.contains('sw-mark')
    if (mode === 'strike' && s && nothing(s.why)) {
      e.className = s.cls + (mark ? ' sw-mark' : ''); e.dataset.why = s.why; e.title = s.title
      e.querySelectorAll('.rwhy').forEach(x => x.style.display = 'none')
      if (s.rwhy) { const t = document.createElement('div'); t.innerHTML = s.rwhy; e.appendChild(t.firstElementChild) }
      changed.push(id)
    }
    if (mode === 'plain' && nothing(e.dataset.why)) {
      e.classList.remove('no', 'haswhy'); delete e.dataset.why; e.title = e.title.split(' — ')[0]
      e.querySelectorAll('.rwhy').forEach(x => x.style.display = 'none')
      changed.push(id)
    }
  }
  const all = [...sec.querySelectorAll('.rpuck[data-person]')], free = all.filter(e => !e.classList.contains('no')).length
  const h = sec.querySelector('.rh2'); const before = h.textContent; h.textContent = before.replace(/\d+ free/, free + ' free')
  return { changed, head: before + ' → ' + h.textContent }
}, [src, mode])

/* ---------------- the warning list of the open board's day ---------------- */
async function warnRead(p, W, di) {
  const w = await A.warns(p, W, di, '')
  /* on the phone the board's side runs a row past its own clipped edge, so the outline goes round the row's words there */
  const r = await p.evaluate(phone => {
    const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim()
    const box = document.querySelector('#sbWarn'); box.dataset.sw = 'warn'
    const rows = [...box.querySelectorAll('.wln')]
    const rg = rows.find(e => /Ranger/.test(t(e))); if (rg) (phone ? rg.querySelector('.wln-t') : rg).dataset.sw = 'wranger'
    return { head: t(box.querySelector('.wh')), rows: rows.map(t) }
  }, !!W.isPhone)
  return r
}

/* ---------------- Ranger's puck on a line or sim row of the open board (not the crew list) ---------------- */
const seatPuck = p => p.evaluate(() => {
  const e = [...document.querySelectorAll('#schedBoard .puck[data-person="bane"]')].find(x => x.getBoundingClientRect().width > 0 && !x.closest('.sb-ros, .ros-body, .rpuck, .availwin'))
  if (!e) return null
  e.dataset.sw = 'seat'
  const chip = e.querySelector('.lchip')
  return { cls: e.className, chip: chip ? { cls: chip.className, text: chip.textContent, title: chip.title, html: chip.outerHTML } : null }
})

/* ---------------- staging ---------------- */
const post = (p, W) => A.post(p, W, RANGER, '2026-07-17', 'post')
async function flight(p, W, di, o = { cs: 'VL BFM', to: '13:00', ld: '15:00' }) {
  await T.gotoWeek(p, W, '2026-07-13')
  const l = await A.addLine(p, W, di, o)
  if (l.wi < 0) throw new Error('no line added')
  return l
}
async function seatRanger(p, W, di, wi, sc) {
  const a = await A.armSeat(p, W, `${di}.${wi}.0.0.p`, sc + '-seat', true)
  must(sc, `Ranger seated on the line (day ${di}, wave ${wi}) — read back from the day`, a.placed === true, { armed: a.armed, placed: a.placed })
  return a
}
async function fileAs(p, W, iso, kinds, span, sc) {
  const f = await T.file(p, W, iso, null, kinds, span, sc + '-file')
  must(sc, `Ranger files ${kinds.join('+')}${span ? ' ' + span.join('–') : ''} for ${iso} on the SANS tab (read back)`, !!f.iid, f.made || f.refused)
  await T.closeAll(p, W)
  return f
}
/* on the phone a typed box can leave the page zoomed (the method's trap): a reload clears it before the pictures */
async function settle(p, W, who) {
  if (!W.isPhone) return
  await T.reload(p, who === 'R' ? 'us' : 'ad', who === 'R' ? 'us' : 'a')
  const z = await p.evaluate(() => window.visualViewport ? window.visualViewport.scale : 1)
  fact('settle', 'phone zoom after reload', z)
}

/* a bell case: plan (Saber) → his reminder captured → he files → his bell today → the line drawn in */
async function bellCase(p, W, sc, plan, filings, drawn, extra) {
  await post(p, W)
  await plan()
  await A.asR(p, W); await settle(p, W, 'R')
  const b0 = await bellOpen(p, W)
  must(sc, 'his bell before he files: the reminder names the day(s) he is planned with nothing filed', !!b0.cap, b0.lines)
  if (extra && extra.before) { await reveal(p, 'due'); await mark(p, ['due']); await shot(p, sc + '-bell-before', ['bell', 'bellbtn']) }
  for (const f of filings) await fileAs(p, W, f.iso, f.kinds, f.span, sc)
  await settle(p, W, 'R')
  const b1 = await bellOpen(p, W)
  must(sc, 'his bell after filing: no line about the day (today)', !b1.lines.some(l => /SANS|planned/.test(l.text)), b1)
  await mark(p, ['empty'], [], ['empty']); await shot(p, sc + '-bell-today', ['bell', 'bellbtn'])
  const drawnTexts = await bellDraw(p, b0.cap, drawn)
  fact(sc, 'bell lines drawn in', drawnTexts)
  const keys = drawn.map((_, i) => 'new' + i)
  await mark(p, keys, keys); await shot(p, sc + '-bell-new', ['bell', 'bellbtn'])
  if (extra && extra.b) { await bellRedraw(p, 0, extra.b); await mark(p, keys, keys); await shot(p, sc + '-bell-newb', ['bell', 'bellbtn']) }
  await T.closeAll(p, W)
  return { b0, b1 }
}

const SCENES = {
  /* A1 (with Q3's two shapes), B1, the warning list's line today and Q4, the puck's "A" today and "S" proposed */
  async a1(p, W) {
    const sc = 'a1'
    await bellCase(p, W, sc, () => A.planSim(p, W, 19, 'oft', sc, { a: '09:00', b: '11:00', label: 'OFT' }),
      [{ iso: '2026-07-19', kinds: ['fly'] }], [W_.A1], { before: true, b: W_.A1b })
    await A.asS(p, W); await settle(p, W, 'S'); await T.gotoWeek(p, W, '2026-07-13')
    /* the warning list's SANS line today, and Q4's words for it */
    const w = await warnRead(p, W, 6)
    fact(sc, 'warning list today', w)
    const line = w.rows.find(r => /Ranger — SANS: not offering OFT today\. Planned on/.test(r))
    must(sc, 'the day\'s warning list shows Ranger\'s SANS line (not offering OFT)', !!line, w.rows)
    await reveal(p, 'warn'); await mark(p, ['wranger'], [], ['wranger']); await shot(p, sc + '-warn-today', ['warn'])
    const planned = /Planned on (.*?)(✕)?$/.exec(line)[1].trim(); fact(sc, 'the planned part, as the app wrote it', planned)
    await p.evaluate(([w, planned]) => { const m = document.querySelector('[data-sw="wranger"]'); const e = m.classList.contains('wln-t') ? m : m.querySelector('.wln-t'); e.textContent = `Ranger — ${w} Planned on ${planned}` }, [W_.Q4, planned])
    await mark(p, ['wranger'], [], ['wranger']); await shot(p, sc + '-warn-q4', ['warn'])
    /* his puck in the OFT box: today's amber ring and "A" */
    const sp = await seatPuck(p); fact(sc, 'his puck in the OFT box', sp)
    must(sc, 'his puck in the OFT box wears the amber ring (warn) and the "A" chip', !!sp && /\bwarn\b/.test(sp.cls) && sp.chip && sp.chip.text === 'A', sp)
    await reveal(p, 'seat'); await mark(p, ['seat']); await shot(p, sc + '-puck-today', ['seat'], { padX: 90, padY: 16 })
    await p.evaluate(() => { const c = document.querySelector('[data-sw="seat"] .lchip'); c.textContent = 'S'; c.title = 'SANS availability — nothing filed, or planned outside it' })
    await mark(p, ['seat']); await shot(p, sc + '-puck-s', ['seat'], { padX: 90, padY: 16 })
    /* the crew list for a second OFT box the same day, its seat armed */
    const s2 = await T.W5.addSim(p, W, 6, 'oft', 'OFT', '13:00', '14:00'); fact(sc, 'second OFT box', s2)
    const armed = await arm(p, W, `[data-fill="s:6.oft.${s2.ri}.+"]`); fact(sc, 'armed', armed)
    const c = await crew(p); fact(sc, 'crew today', c)
    must(sc, 'crew list: Ranger struck with "SANS — not offering OFT"', !!c && c.struck && c.printed === 'SANS — not offering OFT', c)
    await shotCrew(p, sc + '-crew-today')
    fact(sc, 'crew drawn', await crewWords(p, { struck: true, why: W_.B1, chipS: true }))
    await shotCrew(p, sc + '-crew-b1')
    await disarm(p, W)
  },
  /* A2: planned to fly on Sat 18, offered OFT only */
  async a2(p, W) {
    const sc = 'a2'
    await bellCase(p, W, sc, async () => { const l = await flight(p, W, 5); await seatRanger(p, W, 5, l.wi, sc); await L.closeBoard(p, W) },
      [{ iso: '2026-07-18', kinds: ['oft'] }], [W_.A2])
    await A.asS(p, W); await T.gotoWeek(p, W, '2026-07-13')
    const w = await warnRead(p, W, 5); fact(sc, 'warning list (for the caption)', w)
    must(sc, 'warning list: not offering Fly', w.rows.some(r => /Ranger — SANS: not offering Fly today/.test(r)), w.rows)
  },
  /* A3 and B2: planned on the AMT sim, offered OFT only */
  async a3(p, W) {
    const sc = 'a3'
    await bellCase(p, W, sc, () => A.planSim(p, W, 19, 'amt', sc, { a: '09:00', b: '11:00', label: 'AMT' }),
      [{ iso: '2026-07-19', kinds: ['oft'] }], [W_.A3])
    await A.asS(p, W); await settle(p, W, 'S'); await T.gotoWeek(p, W, '2026-07-13')
    const w = await warnRead(p, W, 6); fact(sc, 'warning list (for the caption)', w)
    must(sc, 'warning list: not offering AMT', w.rows.some(r => /Ranger — SANS: not offering AMT today/.test(r)), w.rows)
    const s2 = await T.W5.addSim(p, W, 6, 'amt', 'AMT', '13:00', '14:00'); fact(sc, 'second AMT box', s2)
    const armed = await arm(p, W, `[data-fill="s:6.amt.${s2.ri}.+"]`); fact(sc, 'armed', armed)
    const c = await crew(p); fact(sc, 'crew today', c)
    must(sc, 'crew list: Ranger struck with "SANS — not offering AMT"', !!c && c.struck && c.printed === 'SANS — not offering AMT', c)
    await shotCrew(p, sc + '-crew-today')
    await crewWords(p, { struck: true, why: W_.B2, chipS: true })
    await shotCrew(p, sc + '-crew-b2')
    await disarm(p, W)
  },
  /* A5: the right event at the wrong hours (Q1, Q2) */
  async a5(p, W) {
    const sc = 'a5'
    await bellCase(p, W, sc, async () => { const l = await flight(p, W, 5); await seatRanger(p, W, 5, l.wi, sc); await L.closeBoard(p, W) },
      [{ iso: '2026-07-18', kinds: ['fly'], span: ['08:00', '12:00'] }], [W_.A5])
    await A.asS(p, W); await settle(p, W, 'S'); await T.gotoWeek(p, W, '2026-07-13')
    const w = await warnRead(p, W, 5); fact(sc, 'warning list today', w)
    must(sc, 'warning list: available 08:00–12:00 only, planned on VL BFM (T/O 13:00)', w.rows.some(r => /Ranger — SANS: available 08:00–12:00 only\. Planned on VL BFM \(T\/O 13:00\)/.test(r)), w.rows)
    await reveal(p, 'warn'); await mark(p, ['wranger'], [], ['wranger']); await shot(p, sc + '-warn-today', ['warn'])
    /* the span the check holds his offer against: step (T/O less the step setting) to de-kit (landing plus the de-kit setting) */
    fact(sc, 'Logic settings read from the page (step, dekit)', await p.evaluate(() => { try { const v = window.VCONF; return v ? { step: v.step, dekit: v.dekit } : 'VCONF not on window' } catch (e) { return String(e) } }))
    const l2 = await A.addLine(p, W, 5, { cs: 'VL TWO', to: '13:00', ld: '15:00' })
    await arm(p, W, `[data-slot="5.${l2.wi}.0.0.p"]`)
    const c = await crew(p); fact(sc, 'crew, a second seat on the same times armed', c)
    await disarm(p, W)
  },
  /* A6: two days missed at once, one line a day */
  async a6(p, W) {
    const sc = 'a6'
    await bellCase(p, W, sc, async () => {
      const l = await flight(p, W, 5); await seatRanger(p, W, 5, l.wi, sc); await L.closeBoard(p, W)
      await A.planSim(p, W, 19, 'oft', sc, { a: '09:00', b: '11:00', label: 'OFT' })
    }, [{ iso: '2026-07-18', kinds: ['oft'] }, { iso: '2026-07-19', kinds: ['fly'] }], [W_.A2, W_.A1])
  },
  /* nothing filed: the crew list today, the warning list's new amber line, his puck's ring and "S", the Logic page, the Legend */
  async nf(p, W) {
    const sc = 'nf'
    await post(p, W)
    const l = await flight(p, W, 5); await seatRanger(p, W, 5, l.wi, sc)
    const l2 = await A.addLine(p, W, 5, { cs: 'VL TWO', to: '13:30', ld: '15:00' })
    await settle(p, W, 'S'); await T.gotoWeek(p, W, '2026-07-13'); await L.openBoard(p, W, 5)
    await arm(p, W, `[data-slot="5.${l2.wi}.0.0.p"]`)
    const c = await crew(p); fact(sc, 'crew today', c)
    must(sc, 'crew list: Ranger struck for nothing filed', !!c && c.struck && /no availability filed/.test(c.why), c)
    await shotCrew(p, sc + '-crew-today')
    await disarm(p, W)
    const w = await warnRead(p, W, 5); fact(sc, 'warning list today', w)
    must(sc, 'warning list: no SANS line, and a real amber line to copy', !w.rows.some(r => /SANS/.test(r)) && w.rows.some(r => /Not published yet/.test(r)), w.rows)
    await reveal(p, 'warn'); await mark(p, ['warn'], [], ['warn']); await shot(p, sc + '-warn-today', ['warn'])
    /* the new amber line, a copy of the list's own amber line ("Not published yet…"), placed where the engine orders a
       SANS line: before it (it came first when a real SANS line stood beside it — the probe of this build) */
    const drew = await p.evaluate(([words, phone]) => {
      const box = document.querySelector('#sbWarn')
      const src = [...box.querySelectorAll('.wln.adv')].find(e => /Not published yet/.test(e.textContent))
      const n = src.cloneNode(true)
      n.querySelector('.wln-t').textContent = words
      n.removeAttribute('data-wix'); (phone ? n.querySelector('.wln-t') : n).dataset.sw = 'wnew'
      const mute = n.querySelector('.wln-mute'); if (mute) mute.removeAttribute('data-woff')
      src.before(n)
      /* the heading's count (step 5: the transform had to touch it) */
      const b = box.querySelector('.wh b'); const before = b.textContent
      const m = /(\d+) issues?/.exec(before); const k = m ? +m[1] + 1 : 0
      if (m) b.textContent = before.replace(/\d+ issues?/, `${k} issue${k > 1 ? 's' : ''}`)
      return { head: before + ' → ' + b.textContent, cls: n.className }
    }, [`Ranger — ${W_.C2} Planned on VL BFM (T/O 13:00)`, !!W.isPhone])
    fact(sc, 'amber line drawn in', drew)
    await mark(p, ['wnew'], ['wnew'], ['wnew']); await shot(p, sc + '-warn-new', ['warn'])
    /* his puck on the jet: today no ring; proposed the amber ring (the app's own "warn" class) and an "S" chip in the markup
       of the live "A" chip read on this build (scene a1: <span class="lchip l-a" title="…">A</span>) */
    const sp = await seatPuck(p); fact(sc, 'his puck on the jet today', sp)
    must(sc, 'his puck on the jet: no amber ring, no chip', !!sp && !/\bwarn\b/.test(sp.cls) && !sp.chip, sp)
    await reveal(p, 'seat'); await mark(p, ['seat']); await shot(p, sc + '-puck-today', ['seat'], { padX: 90, padY: 16 })
    await p.evaluate(() => {
      const e = document.querySelector('[data-sw="seat"]'); e.classList.add('warn')
      const c = document.createElement('span'); c.className = 'lchip l-a'; c.title = 'SANS availability — nothing filed, or planned outside it'; c.textContent = 'S'
      e.insertBefore(c, e.querySelector('.nm'))
    })
    await mark(p, ['seat']); await shot(p, sc + '-puck-s', ['seat'], { padX: 90, padY: 16 })
    await L.closeBoard(p, W)
    /* the Logic page's line for the check (C3), and the check's name (Fable's suggestion, for the further question) */
    await L.go(p, 'logic'); await sleep(500)
    const lg = await p.evaluate(() => { const e = document.querySelector('[data-chk="sansavail"]'); if (!e) return null; e.dataset.sw = 'logic'; return (e.textContent || '').replace(/\s+/g, ' ').trim() })
    must(sc, 'the Logic page shows the SANS availability check', !!lg && /Filing nothing raises nothing/.test(lg), lg)
    /* (its list clips at the row's sides: the outline is drawn just inside the row) */
    await reveal(p, 'logic'); await mark(p, ['logic'], [], ['logic']); await shot(p, sc + '-logic-today', ['logic'], { padX: 8, padY: 4 })
    await p.evaluate(w => { document.querySelector('[data-sw="logic"] .lgwhy').textContent = w }, W_.C3)
    await mark(p, ['logic'], [], ['logic']); await shot(p, sc + '-logic-c3', ['logic'], { padX: 8, padY: 4 })
    await p.evaluate(w => { const n = document.querySelector('[data-sw="logic"] .lgnm'); const sr = n.querySelector('.lgsr'); n.textContent = ''; n.appendChild(sr); n.appendChild(document.createTextNode(w)) }, W_.C3name)
    await mark(p, ['logic'], [], ['logic']); await shot(p, sc + '-logic-name', ['logic'], { padX: 8, padY: 4 })
    /* Edit Schedule's Legend (D2580): today's amber "A" line; a new "S" line cloned from it, beside it */
    await L.go(p, 'editsched')
    const sum = p.locator('#eLegendBox summary:visible').first()
    must(sc, 'Edit Schedule shows its Legend fold', (await sum.count()) > 0, '')
    await W.press(p, sum, 'legend'); await sleep(500)
    const lgA = await p.evaluate(() => {
      const spans = [...document.querySelectorAll('#eLegend > span')]
      const a = spans.find(x => /advisory — shift \+ ground/.test(x.textContent)); if (!a) return null
      a.dataset.sw = 'legA'
      const f = spans.find(x => /^Flags:/.test(x.textContent.trim())); if (f) f.dataset.sw = 'legF'
      spans[spans.length - 1].dataset.sw = 'legZ'
      return a.outerHTML
    })
    must(sc, 'the Legend\'s amber "A" line', !!lgA, lgA)
    await reveal(p, 'legA'); await mark(p, ['legA']); await shot(p, sc + '-legend-today', ['legA'], { pad: 10, also: ['#eLegend'] })
    for (const [k, w] of [['a', W_.Da], ['b', W_.Db]]) {
      await p.evaluate(w => {
        document.querySelectorAll('[data-sw="legS"]').forEach(e => e.remove())
        const a = document.querySelector('[data-sw="legA"]'); const n = a.cloneNode(true); n.dataset.sw = 'legS'
        n.querySelector('.qk').textContent = 'S'
        n.lastChild.textContent = w
        a.after(n)
      }, w)
      await mark(p, ['legS'], [W.isPhone ? 'legS:right' : 'legS:below']); await shot(p, sc + '-legend-' + k, ['legS'], { pad: 10, also: ['#eLegend'] })
    }
  },
  /* Sat 18, nothing filed: the flying line with no times (built), a sim with no times, SC MAIN and AVALON */
  async sb(p, W) {
    const sc = 'sb'
    await post(p, W)
    await T.gotoWeek(p, W, '2026-07-13')
    /* built (D2573): a flying line with no times, its seat armed */
    const l = await A.addLine(p, W, 5, {}); fact(sc, 'line with no times', l.f)
    await settle(p, W, 'S'); await T.gotoWeek(p, W, '2026-07-13'); await L.openBoard(p, W, 5)
    await arm(p, W, `[data-slot="5.${l.wi}.0.0.p"]`)
    let c = await crew(p); fact(sc, 'crew, flying seat with no times armed', c)
    must(sc, 'built: Ranger struck for a flying seat with no times', !!c && c.struck && /no availability filed/.test(c.why), c)
    await shotCrew(p, 'c7-crew-built')
    await disarm(p, W)
    /* a sim with no times: an OFT box added by its own "+", nothing typed */
    await W.press(p, L.B('[data-sradd="5.oft"]'), 'sradd'); await sleep(400)
    const ri0 = await p.evaluate(() => window.DAYS[5].sims.oft.length - 1)
    fact(sc, 'OFT box with no times', await p.evaluate(r => window.DAYS[5].sims.oft[r], ri0))
    await arm(p, W, `[data-fill="s:5.oft.${ri0}.+"]`)
    c = await crew(p); fact(sc, 'crew, OFT with no times armed', c)
    must(sc, 'today: Ranger plain for an OFT seat with no times', !!c && !c.struck, c)
    await shotCrew(p, 'c6-crew-today')
    await disarm(p, W)
    /* the words of a timed OFT seat's real strike, read on this build */
    const s2 = await T.W5.addSim(p, W, 5, 'oft', 'OFT', '10:00', '11:00'); fact(sc, 'timed OFT box', s2)
    await arm(p, W, `[data-fill="s:5.oft.${s2.ri}.+"]`)
    const ct = await crew(p); fact(sc, 'crew, timed OFT armed (the words copied)', ct)
    must(sc, 'a timed OFT seat strikes him for nothing filed', !!ct && ct.struck && /no availability filed/.test(ct.why), ct)
    await shotCrew(p, 'c6-crew-timed')
    const timedAll = await sansAll(p); fact(sc, 'SANS Avail with the timed OFT armed (copied)', timedAll)
    await disarm(p, W)
    await arm(p, W, `[data-fill="s:5.oft.${ri0}.+"]`)
    await crew(p)
    /* every SANS man with nothing filed struck as on the timed seat, not Ranger alone; the heading's count recomputed */
    fact(sc, 'OFT no times drawn struck', await sansLay(p, timedAll, 'strike'))
    await shotCrew(p, 'c6-crew-new')
    await disarm(p, W)
    /* SC: a seat on SC AM MAIN armed (Ranger not on it) */
    const s = await A.addLine(p, W, 5, { kind: 'SC' }); fact(sc, 'SC wave', s.f)
    const main = await p.evaluate(w => window.DAYS[5].waves[w].formations[0].aircraft[0].role, s.wi)
    must(sc, 'the first SC AM aircraft is a MAIN', main === 'MAIN', main)
    await arm(p, W, `[data-slot="5.${s.wi}.0.0.p"]`)
    c = await crew(p); fact(sc, 'crew, SC MAIN armed', c)
    must(sc, 'today: Ranger struck for SC MAIN with nothing filed', !!c && c.struck, c)
    await shotCrew(p, 'c5-sc-today')
    /* every SANS man struck only for nothing filed drawn plain, Ranger among them; the heading's count recomputed */
    fact(sc, 'SC drawn plain (before his bell has told him)', await sansLay(p, { men: {} }, 'plain'))
    await shotCrew(p, 'c5-sc-before')
    await disarm(p, W)
    /* Ranger put on that SC MAIN seat; then the crew list with nothing armed */
    const pk = await A.armSeat(p, W, `5.${s.wi}.0.0.p`, 'scpick', true)
    must(sc, 'Ranger seated on SC AM MAIN (read back)', pk.placed === true, pk.placed)
    /* (Escape with nothing armed closes the board itself: only an armed seat is let go) */
    await disarm(p, W)
    await T.W5.boardDrawer(p, W, true)
    await sleep(1500)   // the pick's own fade settles first (a picture taken at once came out dimmed)
    c = await crew(p); fact(sc, 'crew, nothing armed, Ranger on SC MAIN', c)
    must(sc, 'nothing armed', !(await p.evaluate(() => !!(window.ARM && window.ARM.key))), '')
    fact(sc, 'what covers his puck (top element at its centre)', await p.evaluate(() => { const e = document.querySelector('[data-sw="crew"]'); e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return t ? t.className + ' / ' + (t.closest('[class]') || {}).className + ' opacity ' + getComputedStyle(e).opacity + ' filter ' + getComputedStyle(e.closest('.ros-body') || e).filter : 'none' }))
    await W.pic(p, 'on-today-full')
    await shotCrew(p, 'c5-on-today')
    fact(sc, 'SC told drawn', await crewWords(p, { struck: false, why: W_.E1 }))
    await shotCrew(p, 'c5-on-told', ['crew'])
    await T.W5.boardDrawer(p, W, false)
    /* AVALON: a seat armed, Ranger (nothing filed) */
    const av = await A.addLine(p, W, 5, { kind: 'AVALON' }); fact(sc, 'AVALON wave', av.f)
    await arm(p, W, `[data-slot="5.${av.wi}.0.0.p"]`)
    c = await crew(p); fact(sc, 'crew, AVALON armed', c)
    must(sc, 'today: Ranger plain for AVALON', !!c && !c.struck, c)
    await shotCrew(p, 'c5-av-today')
    await disarm(p, W)
  },
}
const W_ = W

for (const name of ONLY) {
  if (!SCENES[name]) continue
  console.log('=== ' + name + ' ' + size)
  await T.run(name, SZ, async (p, Wk) => {
    p.on('pageerror', e => fact(name, 'PAGE ERROR', e.message))
    await SCENES[name](p, Wk)
  })
  const bad = T.L.results.filter(r => r.scn === name && r.ok === false)
  if (bad.length) fact(name, 'FAILED', bad.map(r => `${r.id}: ${String(r.note).slice(0, 300)}`))
  writeFileSync(path.join(process.env.W2_OUT, `facts-${SZ}.json`), JSON.stringify(facts, null, 1))
}
console.log('DONE ' + size)
process.exit(0)
