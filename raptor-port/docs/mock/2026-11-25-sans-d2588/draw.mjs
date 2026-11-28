// Chat 185, 25 Nov 26: D2588 (the schedulers' bell line when a SANS man deletes or cuts back his availability for a day he
// is planned on) and D2581 / D2582 (the crew list's F / O / A letters in one column, straight after the widest reason),
// drawn on the real app before anything is built (D1625). Brief: docs/superpowers/briefs/2026-11-25-sans-d2588-draw-brief.md.
// Words: Fable's §Wording 2 (a)–(d), docs/superpowers/briefs/2026-11-25-sans-d2587-d2588-words-fable.md, used exactly;
// the host's recommended lines for Q1–Q5 written in the same shape. Each case is staged through the app's own controls on
// the frozen build (D:/raptor-work/c185-build, index-SXKkjfaJ.js), its premise asserted ON SCREEN, pictured as it reads
// TODAY; only then are the words or marks of the part the app drew changed (a new part cloned from its real neighbour and
// marked "New"), and it is pictured again. window.* is only READ. Template copied, never edited:
// docs/mock/2026-11-25-sans-leftovers/draw.mjs (its marks, crops and bell kit).
// Run from raptor-port/ against the build served on port 4880, one size a process (the "cap" scene first: it records a
// real line of Saber's bell, which every drawn bell line is cloned from):
//   SZ=d ONLY=cap,a,b node docs/mock/2026-11-25-sans-d2588/draw.mjs
import path from 'node:path'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
const SZ = process.env.SZ || 'd'
process.env.W2_URL = process.env.DRAW_URL || 'http://localhost:4880/'
process.env.W2_OUT = process.env.DRAW_OUT || `D:/raptor-work/c185-draw/runs/run-${SZ}`
process.env.W1_URL = process.env.W2_URL
process.env.W1_OUT = process.env.W2_OUT
mkdirSync(path.join(process.env.W2_OUT, 'taps'), { recursive: true })
const HERE = path.dirname(fileURLToPath(import.meta.url))
const A = await import(pathToFileURL(path.resolve(HERE, '../../../scripts/handpass/swd-w14a-lib.mjs')).href)
const { T, L, X, RANGER } = A
const IMG = path.join(HERE, 'img')
mkdirSync(IMG, { recursive: true })
T.L.SIZES.d.opts.deviceScaleFactor = 2
const ONLY = (process.env.ONLY || 'cap,a,b,c,d,q1,q2,q3,q4,q5,col').split(',')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const size = SZ === 'd' ? 'desktop' : 'phone'
const CAPF = path.join(process.env.W2_OUT, `cap-${SZ}.json`)
const facts = []
const fact = (scene, what, v) => { facts.push({ scene, size, what, v }); console.log(`[${scene}] ${what}:`, typeof v === 'string' ? v : JSON.stringify(v)) }
const must = (scene, what, ok, v) => { fact(scene, (ok ? 'ASSERTED ' : 'PREMISE FAILED ') + what, v); if (!ok) throw new Error('premise failed: ' + what + ' :: ' + JSON.stringify(v)) }
/* the bell's crop takes in the top bar's name of whose bell it is (the method: a picture keeps whose view it is) */
const WHOSE = { also: ['#roleBadge'] }
const SAT = '2026-07-18', SUN = '2026-07-19'

/* ---------------- the words ---------------- */
/* Chat 186: every line read by a fresh Fable after his D2589 / D2590 ("changed", never "cut back"; q3's quieter line names
   Ranger so it cannot be read as Saber) — the set is D:/raptor-work/c186-draw/words.json, used exactly. */
const W = {
  a: ['Ranger deleted his SANS availability for Sat 18 Jul.', "He's planned on VL BFM (T/O 13:00)."],
  b: ['Ranger changed his SANS availability for Sat 18 Jul.', "He now offers Fly 08:00–10:00. He's planned on VL BFM (T/O 13:00)."],
  c: ['Ranger changed his SANS availability for Sat 18 Jul.', "He now offers OFT only. He's planned on VL BFM (T/O 13:00)."],
  d: ['Ranger deleted his SANS availability for Sat 18 Jul.', "He's planned on OFT (10:00) and VL BFM (T/O 13:00)."],
  /* Q1, option B only (the recommendation, A, is no line) */
  q1b: ['Ranger changed his SANS availability for Sat 18 Jul.', "He now offers Fly 10:00–17:00. He's planned on VL BFM (T/O 13:00)."],
  q2: ['Ranger changed his SANS availability for Sat 18 Jul.', "He now offers Fly 14:00–20:00. He's planned on VL BFM (T/O 13:00)."],
  q3: ["Saber deleted Ranger's SANS availability for Sat 18 Jul.", "Ranger is planned on VL BFM (T/O 13:00)."],
  q4sat: ['Ranger deleted his SANS availability for Sat 18 Jul.', "He's planned on VL BFM (T/O 13:00)."],
  q4sun: ['Ranger deleted his SANS availability for Sun 19 Jul.', "He's planned on OFT (10:00)."],
  /* Q5: the recommendation (only what is no longer covered), and the other answer (both, as (d) names them) */
  q5: ['Ranger changed his SANS availability for Sat 18 Jul.', "He now offers OFT only. He's planned on VL BFM (T/O 13:00)."],
  q5both: ['Ranger changed his SANS availability for Sat 18 Jul.', "He now offers OFT only. He's planned on OFT (10:00) and VL BFM (T/O 13:00)."],
  /* the crew list's reasons in the words he already chose for a mismatch (D2584 Q2) */
  flyOnly: 'SANS — offered Fly only, not AMT',
  oftOnly: 'SANS — offered OFT only, not AMT',
  flyOft: 'SANS — offered Fly and OFT only, not AMT',
}

/* ---------------- marks and pictures (the template's kit, copied) ---------------- */
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
async function mark(p, keys, newKeys = [], inKeys = [], all = false) {
  await prep(p)
  return p.evaluate(([keys, newKeys, inKeys, all]) => {
    const out = {}
    for (const k of keys) {
      const es = [...document.querySelectorAll(`[data-sw="${k}"]`)].filter(x => x.getBoundingClientRect().width > 0)
      const list = all ? es : es.slice(-1)
      if (!list.length) { out[k] = 'MISSING'; continue }
      const res = []
      for (const e of list) {
        const b0 = e.getBoundingClientRect()
        e.classList.add('sw-mark'); if (inKeys.includes(k)) e.classList.add('sw-in')
        const b1 = e.getBoundingClientRect()
        res.push(Math.abs(b0.width - b1.width) + Math.abs(b0.height - b1.height) + Math.abs(b0.left - b1.left) + Math.abs(b0.top - b1.top) < 0.5 ? 'box unchanged' : 'BOX MOVED')
        const nk = newKeys.find(x => x.split(':')[0] === k)
        if (nk) {
          const where = nk.split(':')[1] || 'above'
          const t = document.createElement('div'); t.className = 'sw-tag'; t.textContent = 'New'; document.body.appendChild(t)
          const tb = t.getBoundingClientRect()
          /* 'edge' (chat 186): above, its right end just past the element's, clear of a short neighbour at the element's left */
          if (where === 'edge') { t.style.left = Math.min(innerWidth - tb.width - 2, b1.right + 4 - tb.width) + 'px'; t.style.top = Math.max(2, b1.top - tb.height - 3) + 'px' }
          else if (where === 'right') { t.style.left = (b1.right + 6) + 'px'; t.style.top = (b1.top + (b1.height - tb.height) / 2) + 'px' }
          else { t.style.left = Math.max(2, b1.right - tb.width - 6) + 'px'; t.style.top = (where === 'below' ? b1.bottom + 3 : Math.max(2, b1.top - tb.height - 3)) + 'px' }
        }
      }
      out[k] = res.join(',')
    }
    return out
  }, [keys, newKeys, inKeys, all])
}
async function shot(p, name, keys, o = {}) {
  const box = await p.evaluate(([keys, o]) => {
    const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 }
    const rs = []
    for (const k of keys) for (const e of [...document.querySelectorAll(`[data-sw="${k}"]`)].filter(vis).slice(o.allKeys ? 0 : -1)) rs.push(e.getBoundingClientRect())
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
async function bellOpen(p, Wk) {
  await T.closeAll(p, Wk)
  await Wk.press(p, '.bellbtn:visible', 'bell')
  await p.waitForSelector('[data-testid="bell-list"]', { timeout: 6000 })
  await sleep(400)
  return p.evaluate(() => {
    const list = [...document.querySelectorAll('[data-testid="bell-list"]')].find(e => e.getBoundingClientRect().width > 0)
    const t = e => e ? (e.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() : ''
    list.dataset.sw = 'bell'
    const b = [...document.querySelectorAll('.bellbtn')].find(e => e.getBoundingClientRect().width > 0); if (b) b.dataset.sw = 'bellbtn'
    const empty = list.querySelector('.bl-empty'); if (empty) empty.dataset.sw = 'empty'
    const lines = [...list.querySelectorAll('.bl-line')].map(e => ({ id: e.dataset.testid, unread: e.classList.contains('unread'), text: t(e) }))
    /* whose bell: the signed-in name on the top bar (the role badge) */
    const who = t(document.querySelector('#roleBadge'))
    return { lines, empty: t(empty), lit: b ? b.classList.contains('on') : null, who }
  })
}
/* lines drawn in on the bell, each a copy of the real line captured from Saber's bell (the "cap" scene), its words changed:
   the bold part (.bl-name) takes the title, the quieter part (.bl-what) the second line; its date and "· who" part
   (.bl-day) and any second quieter part are hidden (Fable: no "· Ranger" after the title — the title names him) */
const bellDraw = (p, cap, lines) => p.evaluate(([cap, lines]) => {
  const list = [...document.querySelectorAll('[data-testid="bell-list"]')].find(e => e.getBoundingClientRect().width > 0)
  const scroll = list.querySelector('.bl-scroll') || list
  const empty = list.querySelector('.bl-empty'); if (empty) empty.style.display = 'none'
  lines.slice().reverse().forEach((w, ri) => {
    const i = lines.length - 1 - ri
    const tmp = document.createElement('div'); tmp.innerHTML = cap.line
    const el = tmp.firstElementChild
    el.dataset.testid = 'bell-line-drawn-' + i; el.classList.add('unread')
    const main = el.querySelector('.bl-main') || el; main.dataset.sw = 'new' + i
    el.querySelector('.bl-name').textContent = w[0]
    el.querySelectorAll('.bl-day').forEach(x => { x.style.display = 'none' })
    const whats = [...el.querySelectorAll('.bl-what')]
    whats.forEach((x, k) => { if (k) x.style.display = 'none' })
    if (whats[0]) whats[0].textContent = w[1]
    el.querySelectorAll('.bl-struck, s').forEach(x => { x.style.display = 'none' })
    scroll.prepend(el)
  })
  if (!list.querySelector('.bl-foot') && cap.foot) { const t = document.createElement('div'); t.innerHTML = cap.foot; const f = t.firstElementChild; f.dataset.sw = 'foot'; list.appendChild(f) }
  const b = [...document.querySelectorAll('.bellbtn')].find(e => e.getBoundingClientRect().width > 0); if (b) b.classList.add('on')
  return [...list.querySelectorAll('.bl-line')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim())
}, [cap, lines])
const capRead = () => { if (!existsSync(CAPF)) throw new Error('run the "cap" scene first (no ' + CAPF + ')'); return JSON.parse(readFileSync(CAPF, 'utf8')) }

/* a scheduler's bell: today (asserted: nothing about Ranger's SANS availability), then the drawn line(s) */
async function schedBell(p, Wk, sc, lines, o = {}) {
  const b = await bellOpen(p, Wk)
  fact(sc, `${o.whose || 'Saber'}'s bell today`, b)
  must(sc, `${o.whose || 'Saber'}'s bell today says nothing of Ranger's SANS availability`, !b.lines.some(l => /Ranger|SANS/.test(l.text)), b.lines.map(l => l.text))
  await mark(p, b.empty ? ['empty'] : ['bell'], [], b.empty ? ['empty'] : ['bell'])
  await shot(p, sc + '-bell-today', ['bell', 'bellbtn'], WHOSE)
  if (!lines) return b
  const drawn = await bellDraw(p, capRead(), lines)
  fact(sc, 'bell lines drawn in', drawn)
  const keys = lines.map((_, i) => 'new' + i)
  await mark(p, keys, keys); await shot(p, sc + '-bell-new', ['bell', 'bellbtn'], WHOSE)
  for (const [tag, alt] of (o.alts || [])) {
    await p.evaluate(([alt]) => { const el = document.querySelector('[data-sw="new0"]').closest('.bl-line'); el.querySelector('.bl-name').textContent = alt[0]; const w = el.querySelector('.bl-what'); if (w) w.textContent = alt[1] }, [alt])
    await mark(p, keys, keys); await shot(p, sc + '-bell-' + tag, ['bell', 'bellbtn'], WHOSE)
  }
  await T.closeAll(p, Wk)
  return b
}

/* ---------------- the warning list of the open board's day ---------------- */
async function warnRead(p, Wk, di) {
  const w = await A.warns(p, Wk, di, '')
  await p.evaluate(phone => {
    const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim()
    const box = document.querySelector('#sbWarn'); box.dataset.sw = 'warn'
    const rg = [...box.querySelectorAll('.wln')].find(e => /Ranger/.test(t(e))); if (rg) (phone ? rg.querySelector('.wln-t') || rg : rg).dataset.sw = 'wranger'
  }, !!Wk.isPhone)
  return w
}

/* ---------------- staging ---------------- */
const post = (p, Wk) => A.post(p, Wk, RANGER, '2026-07-17', 'post')
async function flightSat(p, Wk, sc) {
  await T.gotoWeek(p, Wk, '2026-07-13')
  const l = await A.addLine(p, Wk, 5, { cs: 'VL BFM', to: '13:00', ld: '15:00' })
  must(sc, 'a flying line VL BFM, T/O 13:00, LD 15:00 on Sat 18 (times typed, read back)', l.wi >= 0 && l.f.cs === 'VL BFM' && l.f.to === '13:00' && l.f.ld === '15:00', l.f)
  const a = await A.armSeat(p, Wk, `5.${l.wi}.0.0.p`, sc + '-seat', true)
  must(sc, 'Ranger seated on VL BFM (read back from the day)', a.placed === true, { armed: a.armed, placed: a.placed })
  await L.closeBoard(p, Wk)
  return l
}
const oftSat = (p, Wk, sc) => A.planSim(p, Wk, 18, 'oft', sc, { a: '10:00', b: '11:00', label: 'OFT' })
const oftSun = (p, Wk, sc) => A.planSim(p, Wk, 19, 'oft', sc, { a: '10:00', b: '11:00', label: 'OFT' })
/* Ranger (signed in) files for himself on the SANS tab; read back */
async function fileAs(p, Wk, iso, kinds, span, sc, o = {}) {
  const f = await T.file(p, Wk, iso, o.who || null, kinds, span, sc + '-file', o.endIso ? { endIso: o.endIso } : {})
  must(sc, `${o.who ? o.who : 'Ranger'} filed ${kinds.join('+')}${span ? ' ' + span.join('–') : ' all day'} for ${iso}${o.endIso ? ' to ' + o.endIso : ''} on the SANS tab (read back)`, !!f.iid, f.made || f.refused)
  fact(sc, 'the filing window read before Add', f.read)
  await T.closeAll(p, Wk)
  return f
}
/* the SANS day read on screen: Ranger's line on that day, its letters and hours as the day prints them */
async function sansLine(p, Wk, iso, sc, label) {
  const r = await T.sansRead(p, Wk, iso, sc + '-sday-' + label)
  const mine = r.day ? r.day.rows.filter(x => x.who === 'Ranger') : []
  fact(sc, `the SANS day ${iso} on screen (${label})`, T.rowsLine(r.day))
  await T.closeAll(p, Wk)
  return mine
}
/* his filing opened from the SANS day (its own row), changed in its window and saved; or deleted by its Delete */
async function changeFiling(p, Wk, iso, iid, sc, how) {
  await T.closeAll(p, Wk)
  await X.openSans(p, Wk)
  const o = await X.openLine(p, Wk, iso, iid, sc + '-open')
  must(sc, `the filing opens from the SANS day of ${iso}, with Save and Delete`, o.ok && o.r && o.r.save && o.r.del, o.ok ? o.r : o.why)
  fact(sc, 'the window before the change', o.r)
  if (how.del) {
    await Wk.press(p, '#inpEditDel:visible', 'delete'); await sleep(800)
  } else {
    if (how.kinds) await X.setKinds(p, Wk, how.kinds)
    if (how.span) {
      await Wk.press(p, '#inpEditSpan [data-span="custom"]', 'span-custom')
      await p.fill('#inpEditStart', how.span[0]); await p.fill('#inpEditEnd', how.span[1])
    }
    fact(sc, 'the window after the change, before Save', await X.inpRead(p))
    await Wk.press(p, '#inpEditSave:visible', 'save'); await sleep(900)
  }
  fact(sc, 'passing note', await L.toastSaid(p))
  await T.closeAll(p, Wk)
  return T.inp(p, iid)
}
/* on the phone a typed box can leave the page zoomed (the method's trap): a reload clears it before the pictures */
async function settle(p, Wk, who) {
  if (!Wk.isPhone) return
  await T.reload(p, who === 'R' ? 'us' : who === 'H' ? 'ad2' : 'ad', who === 'R' ? 'us' : who === 'H' ? 'a2' : 'a')
  fact('settle', 'phone zoom after reload', await p.evaluate(() => window.visualViewport ? window.visualViewport.scale : 1))
}
/* Saber's warning list for Sat 18, read on screen (the plan still there; what it says of Ranger) */
async function warnSat(p, Wk, sc, label) {
  await T.gotoWeek(p, Wk, '2026-07-13')
  const w = await warnRead(p, Wk, 5)
  fact(sc, `Sat 18's warning list (${label})`, { head: w.head, ranger: w.ranger })
  await L.closeBoard(p, Wk)
  return w
}
/* Ranger's puck on the Sat 18 board, on the flight (and the OFT box): the plan read on screen */
async function plannedSat(p, Wk, sc, want) {
  await T.gotoWeek(p, Wk, '2026-07-13'); await L.openBoard(p, Wk, 5)
  const r = await p.evaluate(() => {
    const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim()
    const ps = [...document.querySelectorAll('#schedBoard .puck[data-person="bane"]')].filter(x => x.getBoundingClientRect().width > 0 && !x.closest('.sb-ros, .ros-body, .rpuck, .availwin, .sb-roster'))
    return ps.map(x => { const row = x.closest('[data-slot], [data-fill], tr, .fm, .srow, .sb-sim, .sbline') || x.parentElement; return (x.closest('[data-slot]') ? 'seat ' + x.closest('[data-slot]').dataset.slot : x.closest('[data-fill]') ? 'sim ' + x.closest('[data-fill]').dataset.fill : 'puck') })
  })
  await L.closeBoard(p, Wk)
  must(sc, `on the Sat 18 board Ranger's puck stands on ${want.join(' and ')}`, want.every(k => r.some(x => x.includes(k))), r)
  return r
}

const SCENES = {
  /* a real line on Saber's bell, to clone every drawn line from: Ranger files a Meeting naming Saber and himself on Thu 16
     Jul, 22:00–22:30, on the Inputs calendar; Saber's bell then carries the app's own line for it */
  async cap(p, Wk) {
    const sc = 'cap'
    await A.asR(p, Wk)
    await L.go(p, 'inputs'); await sleep(800)
    await Wk.press(p, p.locator('#inpCal [data-icday="2026-07-16"]').first(), 'day16'); await sleep(500)
    await Wk.press(p, p.locator('#icPopAdd:visible').first(), 'add'); await sleep(600)
    await p.selectOption('#inpEditType', 'Meeting'); await sleep(300)
    fact(sc, 'who', await X.setWho(p, Wk, [RANGER, 'stiff']))
    const ad = p.locator('#inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.uncheck()
    const cu = p.locator('#inpEditSpan [data-span="custom"]'); if (await cu.count()) await Wk.press(p, cu, 'custom')
    if (await p.locator('#inpEditStart').count()) { await p.fill('#inpEditStart', '22:00'); await p.fill('#inpEditEnd', '22:30') }
    const s = await X.saveInp(p, Wk, 'cap')
    must(sc, 'a Meeting naming Ranger and Saber on Thu 16 Jul saved', s.made.length === 1, s.made)
    await A.asS(p, Wk); await settle(p, Wk, 'S')
    await T.closeAll(p, Wk)
    await Wk.press(p, '.bellbtn:visible', 'bell'); await sleep(600)
    const cap = await p.evaluate(() => {
      const list = [...document.querySelectorAll('[data-testid="bell-list"]')].find(e => e.getBoundingClientRect().width > 0)
      const line = list && list.querySelector('.bl-line')
      return { line: line ? line.outerHTML : null, foot: (list && list.querySelector('.bl-foot') || {}).outerHTML || '', text: line ? line.textContent.replace(/\s+/g, ' ').trim() : '', list: list ? list.outerHTML.slice(0, 4000) : '' }
    })
    must(sc, "Saber's bell carries a real line about the Meeting", !!cap.line && /Meeting/.test(cap.text), cap.text)
    writeFileSync(CAPF, JSON.stringify(cap, null, 1))
    await p.evaluate(() => { const l = [...document.querySelectorAll('[data-testid="bell-list"]')].find(e => e.getBoundingClientRect().width > 0); l.dataset.sw = 'bell'; const ln = l.querySelector('.bl-line .bl-main') || l.querySelector('.bl-line'); ln.dataset.sw = 'capline' })
    await mark(p, ['capline']); await shot(p, 'cap-saber-real', ['bell'])
  },

  /* (a) planned on VL BFM; Ranger deletes his Fly 08:00–17:00 filing for Sat 18 on his phone */
  async a(p, Wk) {
    const sc = 'a'
    await post(p, Wk)
    await A.asR(p, Wk)
    const f = await fileAs(p, Wk, SAT, ['fly'], ['08:00', '17:00'], sc)
    await A.asS(p, Wk)
    await flightSat(p, Wk, sc)
    await plannedSat(p, Wk, sc, ['5.'])
    await A.asR(p, Wk)
    must(sc, 'the SANS day shows his Fly 08:00–17:00 line before he deletes it', (await sansLine(p, Wk, SAT, sc, 'before')).length === 1, '')
    const after = await changeFiling(p, Wk, SAT, f.iid, sc, { del: true })
    must(sc, 'his filing is gone (read back)', after === null, after)
    must(sc, 'the SANS day of Sat 18 no longer lists Ranger (on screen)', (await sansLine(p, Wk, SAT, sc, 'after')).length === 0, '')
    await A.asS(p, Wk); await settle(p, Wk, 'S')
    const w = await warnSat(p, Wk, sc, 'after the delete')
    fact(sc, 'the warning list now (for the caption)', w.ranger)
    await plannedSat(p, Wk, sc, ['5.'])
    await schedBell(p, Wk, sc, [W.a])
  },

  /* (b) cut back to Fly 08:00–10:00 */
  async b(p, Wk) {
    const sc = 'b'
    await post(p, Wk)
    await A.asR(p, Wk)
    const f = await fileAs(p, Wk, SAT, ['fly'], ['08:00', '17:00'], sc)
    await A.asS(p, Wk)
    await flightSat(p, Wk, sc)
    let w = await warnSat(p, Wk, sc, 'before the cut')
    must(sc, 'before the cut the warning list says nothing of Ranger (covered)', !w.ranger.length, w.ranger)
    await A.asR(p, Wk)
    const after = await changeFiling(p, Wk, SAT, f.iid, sc, { span: ['08:00', '10:00'] })
    fact(sc, 'filing after (read back)', after)
    const ln = await sansLine(p, Wk, SAT, sc, 'after')
    must(sc, 'the SANS day shows Ranger Fly 08:00–10:00 (on screen)', ln.length === 1 && /F/.test(ln[0].letters) && /08:00.10:00/.test(ln[0].hours), ln)
    await A.asS(p, Wk); await settle(p, Wk, 'S')
    w = await warnSat(p, Wk, sc, 'after the cut')
    must(sc, "after the cut Sat 18's warning list flags Ranger's hours", w.ranger.some(r => /08:00.10:00/.test(r)), w.ranger)
    await schedBell(p, Wk, sc, [W.b])
  },

  /* (c) cut back to OFT only (all day) */
  async c(p, Wk) {
    const sc = 'c'
    await post(p, Wk)
    await A.asR(p, Wk)
    const f = await fileAs(p, Wk, SAT, ['fly'], ['08:00', '17:00'], sc)
    await A.asS(p, Wk)
    await flightSat(p, Wk, sc)
    await A.asR(p, Wk)
    const after = await changeFiling(p, Wk, SAT, f.iid, sc, { kinds: ['o'] })
    fact(sc, 'filing after (read back)', after)
    const ln = await sansLine(p, Wk, SAT, sc, 'after')
    must(sc, 'the SANS day shows Ranger OFT only (on screen)', ln.length === 1 && /O/.test(ln[0].letters) && !/F/.test(ln[0].letters), ln)
    await A.asS(p, Wk); await settle(p, Wk, 'S')
    const w = await warnSat(p, Wk, sc, 'after the cut')
    must(sc, "after the cut Sat 18's warning list flags Ranger (Fly not offered)", w.ranger.some(r => /SANS/.test(r)), w.ranger)
    await schedBell(p, Wk, sc, [W.c])
  },

  /* (d) planned on an OFT at 10:00 and VL BFM; he deletes his Fly + OFT filing */
  async d(p, Wk) {
    const sc = 'd'
    await post(p, Wk)
    await A.asR(p, Wk)
    const f = await fileAs(p, Wk, SAT, ['fly', 'oft'], ['08:00', '17:00'], sc)
    await A.asS(p, Wk)
    await flightSat(p, Wk, sc)
    await oftSat(p, Wk, sc)
    await plannedSat(p, Wk, sc, ['5.', 's:5.oft'])
    await A.asR(p, Wk)
    const after = await changeFiling(p, Wk, SAT, f.iid, sc, { del: true })
    must(sc, 'his filing is gone (read back)', after === null, after)
    must(sc, 'the SANS day of Sat 18 no longer lists Ranger (on screen)', (await sansLine(p, Wk, SAT, sc, 'after')).length === 0, '')
    await A.asS(p, Wk); await settle(p, Wk, 'S')
    await schedBell(p, Wk, sc, [W.d])
  },

  /* Q1: a cut-back that still covers the flight — Fly 08:00–17:00 to 10:00–17:00 */
  async q1(p, Wk) {
    const sc = 'q1'
    await post(p, Wk)
    await A.asR(p, Wk)
    const f = await fileAs(p, Wk, SAT, ['fly'], ['08:00', '17:00'], sc)
    await A.asS(p, Wk)
    await flightSat(p, Wk, sc)
    await A.asR(p, Wk)
    const after = await changeFiling(p, Wk, SAT, f.iid, sc, { span: ['10:00', '17:00'] })
    fact(sc, 'filing after (read back)', after)
    const ln = await sansLine(p, Wk, SAT, sc, 'after')
    must(sc, 'the SANS day shows Ranger Fly 10:00–17:00 (on screen)', ln.length === 1 && /10:00.17:00/.test(ln[0].hours), ln)
    await A.asS(p, Wk); await settle(p, Wk, 'S')
    const w = await warnSat(p, Wk, sc, 'after the cut')
    must(sc, "after the cut Sat 18's warning list still says nothing of Ranger (the flight still covered)", !w.ranger.length, w.ranger)
    /* the recommendation (A) is no line: today's bell is the proposal; option B drawn beside it */
    await schedBell(p, Wk, sc, [W.q1b])
  },

  /* Q2: hours moved, not cut — Fly 10:00–16:00 (covers the flight's 12:00 step to 15:30 de-kit) to 14:00–20:00 (six hours
     either way; the flight no longer covered). The brief's 08:00–12:00 never covered the 13:00 flight (see the report). */
  async q2(p, Wk) {
    const sc = 'q2'
    await post(p, Wk)
    await A.asR(p, Wk)
    const f = await fileAs(p, Wk, SAT, ['fly'], ['10:00', '16:00'], sc)
    await A.asS(p, Wk)
    await flightSat(p, Wk, sc)
    let w = await warnSat(p, Wk, sc, 'before the move')
    must(sc, 'before the move the warning list says nothing of Ranger (10:00–16:00 covers the flight)', !w.ranger.length, w.ranger)
    await A.asR(p, Wk)
    const after = await changeFiling(p, Wk, SAT, f.iid, sc, { span: ['14:00', '20:00'] })
    fact(sc, 'filing after (read back)', after)
    const ln = await sansLine(p, Wk, SAT, sc, 'after')
    must(sc, 'the SANS day shows Ranger Fly 14:00–20:00 (on screen)', ln.length === 1 && /14:00.20:00/.test(ln[0].hours), ln)
    await A.asS(p, Wk); await settle(p, Wk, 'S')
    w = await warnSat(p, Wk, sc, 'after the move')
    must(sc, "after the move Sat 18's warning list flags Ranger's hours", w.ranger.some(r => /14:00.20:00/.test(r)), w.ranger)
    await schedBell(p, Wk, sc, [W.q2])
  },

  /* Q3: Saber deletes Ranger's filing for him; Saber's own bell (none recommended) and Hunter's (another admin) */
  async q3(p, Wk) {
    const sc = 'q3'
    await post(p, Wk)
    await A.asR(p, Wk)
    const f = await fileAs(p, Wk, SAT, ['fly'], ['08:00', '17:00'], sc)
    await A.asS(p, Wk)
    await flightSat(p, Wk, sc)
    const after = await changeFiling(p, Wk, SAT, f.iid, sc, { del: true })
    must(sc, 'Saber deleted it: the filing is gone (read back)', after === null, after)
    must(sc, 'the SANS day of Sat 18 no longer lists Ranger (on screen, Saber)', (await sansLine(p, Wk, SAT, sc, 'after')).length === 0, '')
    await settle(p, Wk, 'S')
    await schedBell(p, Wk, sc + 's', null, { whose: 'Saber' })
    const who = await T.as(p, Wk, 'ad2', 'a2'); await settle(p, Wk, 'H')
    must(sc, 'Hunter (another admin) signed in', /HUNTER/i.test(who), who)
    await schedBell(p, Wk, sc, [W.q3], { whose: 'Hunter' })
  },

  /* Q4: one filing over Sat 18 and Sun 19, planned on both, deleted in one press */
  async q4(p, Wk) {
    const sc = 'q4'
    await post(p, Wk)
    await A.asR(p, Wk)
    const f = await fileAs(p, Wk, SAT, ['fly', 'oft'], null, sc, { endIso: SUN })
    must(sc, 'the one filing covers Sat 18 and Sun 19 (read back)', f.made && f.made.date === 'Jul 18' && f.made.endDate === 'Jul 19', f.made)
    await A.asS(p, Wk)
    await flightSat(p, Wk, sc)
    await oftSun(p, Wk, sc)
    await A.asR(p, Wk)
    const after = await changeFiling(p, Wk, SAT, f.iid, sc, { del: true })
    must(sc, 'his filing is gone (read back)', after === null, after)
    must(sc, 'the SANS day of Sat 18 no longer lists Ranger', (await sansLine(p, Wk, SAT, sc, 'after-sat')).length === 0, '')
    must(sc, 'the SANS day of Sun 19 no longer lists Ranger', (await sansLine(p, Wk, SUN, sc, 'after-sun')).length === 0, '')
    await A.asS(p, Wk); await settle(p, Wk, 'S')
    await schedBell(p, Wk, sc, [W.q4sat, W.q4sun])
  },

  /* Q5: planned on OFT 10:00 and VL BFM; filed Fly + OFT 08:00–17:00; cut back to OFT only */
  async q5(p, Wk) {
    const sc = 'q5'
    await post(p, Wk)
    await A.asR(p, Wk)
    const f = await fileAs(p, Wk, SAT, ['fly', 'oft'], ['08:00', '17:00'], sc)
    await A.asS(p, Wk)
    await flightSat(p, Wk, sc)
    await oftSat(p, Wk, sc)
    await A.asR(p, Wk)
    const after = await changeFiling(p, Wk, SAT, f.iid, sc, { kinds: ['o'] })
    fact(sc, 'filing after (read back)', after)
    const ln = await sansLine(p, Wk, SAT, sc, 'after')
    must(sc, 'the SANS day shows Ranger OFT only (on screen)', ln.length === 1 && /O/.test(ln[0].letters) && !/F/.test(ln[0].letters), ln)
    await A.asS(p, Wk); await settle(p, Wk, 'S')
    const w = await warnSat(p, Wk, sc, 'after the cut')
    /* (the OFT at 10:00–11:00 also runs into the flight's suggested brief, 10:40: a separate warning, not a SANS one) */
    const sw = w.ranger.filter(r => /SANS/.test(r))
    must(sc, "Sat 18's warning list flags Ranger's SANS availability for the flight only, not the OFT", sw.length === 1 && /VL BFM/.test(sw[0]) && !/Sim OFT/.test(sw[0]), w.ranger)
    await schedBell(p, Wk, sc, [W.q5], { alts: [['both', W.q5both]] })
  },

  /* the crew list's F / O / A letters: Sun 19, an AMT seat (times typed) pressed, SANS men with different filings */
  async col(p, Wk) {
    const sc = 'col'
    const men = [['yeti', ['fly'], null], ['romeo', ['oft'], null], ['ipman', ['amt'], ['08:00', '10:00']], ['krait', ['fly', 'oft'], null], ['vinci', ['amt'], null]]
    for (const [id, kinds, span] of men) await fileAs(p, Wk, SUN, kinds, span, sc, { who: id })
    await T.gotoWeek(p, Wk, '2026-07-13')
    const s = await T.W5.addSim(p, Wk, 6, 'amt', 'AMT', '13:00', '14:00'); fact(sc, 'AMT box', s)
    must(sc, 'an AMT box 13:00–14:00 on Sun 19 (read back)', await p.evaluate(r => { const x = window.DAYS[6].sims.amt[r]; return !!x && JSON.stringify(x).includes('13:00') }, s.ri), s)
    await settle(p, Wk, 'S'); await T.gotoWeek(p, Wk, '2026-07-13'); await L.openBoard(p, Wk, 6)
    /* the SANS section read on screen: each man's reason and letters (and, chat 186 for D2750, each badge's cut and each
       row's height) */
    const read = () => p.evaluate(() => {
      const t = e => e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : ''
      const sec = [...document.querySelectorAll('#schedBoard .rsans')].find(x => x.getBoundingClientRect().width > 0)
      if (!sec) return null
      sec.dataset.sw = 'sec'
      return { head: t(sec.querySelector('.rh2')), rows: [...sec.querySelectorAll('.rsans-row')].map(r => {
        const pk = r.querySelector('.rpuck'), b = r.querySelector('.rsans-b'), w = r.querySelector('.rwhy')
        const bb = b ? b.getBoundingClientRect() : null
        return { id: pk.dataset.person, cs: window.PEOPLE[pk.dataset.person].cs, struck: pk.classList.contains('no'), why: w && w.getBoundingClientRect().width > 0 ? t(w) : '', letters: t(b), lettersLeft: bb ? Math.round(bb.left * 10) / 10 : null, puckW: Math.round(pk.querySelector('.puck').getBoundingClientRect().width * 10) / 10, rpuckW: Math.round(pk.getBoundingClientRect().width * 10) / 10,
          cut: b ? [b, ...b.querySelectorAll('*')].some(x => x.scrollWidth > x.clientWidth + 0.5) : false, rowH: Math.round(r.getBoundingClientRect().height * 100) / 100 }
      }) }
    })
    /* chat 186 (D2750), picture 1: NO place picked — the SANS section as it reads today, nothing changed */
    {
      await T.W5.boardDrawer(p, Wk, true)
      const np = await read()
      fact(sc, 'SANS section, no place picked', np)
      const jn = np && np.rows.find(r => r.id === 'ipman')
      const armed = await p.evaluate(() => !!(window.ARM && window.ARM.key))
      must(sc, 'no place picked: the SANS section shows, no reason line shows on any row, and Jester\'s "A · 08:00–10:00" is whole (not cut)',
        !!np && np.rows.length >= 5 && np.rows.every(r => r.why === '') && !!jn && jn.letters === 'A · 08:00–10:00' && !jn.cut && !armed,
        np ? { armed, rows: np.rows.map(r => `${r.cs} "${r.why}" [${r.letters}]${r.cut ? ' CUT' : ''}`) } : null)
      await p.evaluate(() => { document.querySelectorAll('#schedBoard .rsans .rsans-b').forEach(e => { if (e.getBoundingClientRect().width > 0) e.dataset.sw = 'let' }) })
      await reveal(p, 'sec')
      await mark(p, ['let'], [], [], true)
      await shot(p, sc + '-nopick', ['sec'], { pad: 8 })
      await prep(p)
      await T.W5.boardDrawer(p, Wk, false)
    }
    /* its seat pressed (the "+ add" place) */
    const zone = p.locator(L.B(`[data-fill="s:6.amt.${s.ri}.+"]`)).first()
    await zone.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
    const addz = zone.locator('.addz').first()
    const ab = (await addz.count()) ? await addz.boundingBox() : null, zb = await zone.boundingBox()
    const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
    if (Wk.isPhone) await zone.tap({ position: pos }); else await zone.click({ position: pos })
    await sleep(500)
    must(sc, 'the AMT seat is pressed (armed)', !!(await p.evaluate(() => window.ARM && window.ARM.key)), await p.evaluate(() => window.ARM && window.ARM.key))
    await T.W5.boardDrawer(p, Wk, true)
    const today = await read()
    fact(sc, 'SANS section today', today)
    const by = id => today.rows.find(r => r.id === id)
    must(sc, 'on screen: Bolt (Fly only), Rebel (OFT only), Kraken (Fly + OFT) struck "not offering AMT"; Jester struck for his hours; Zenith plain with "A"',
      by('yeti') && by('yeti').struck && /not offering AMT/.test(by('yeti').why) && by('romeo') && by('romeo').struck && by('krait') && by('krait').struck && by('ipman') && by('ipman').struck && /08:00.10:00/.test(by('ipman').why) && by('vinci') && !by('vinci').struck && by('vinci').letters === 'A',
      today.rows.map(r => `${r.cs}${r.struck ? ' struck' : ''} "${r.why}" [${r.letters}]`))
    /* mark the letters of every row that has them, and crop the section */
    await p.evaluate(() => { document.querySelectorAll('#schedBoard .rsans .rsans-b').forEach(e => { if (e.getBoundingClientRect().width > 0) e.dataset.sw = 'let' }) })
    await reveal(p, 'sec')
    await mark(p, ['let'], [], [], true)
    await shot(p, sc + '-today', ['sec'], { pad: 8 })
    /* proposed, step 1: the reasons in the words he already chose (D2584 Q2), the hours line as it is */
    const words = { yeti: W.flyOnly, romeo: W.oftOnly, krait: W.flyOft }
    await p.evaluate(words => {
      const sec = document.querySelector('[data-sw="sec"]')
      for (const [id, w] of Object.entries(words)) { const pk = sec.querySelector(`.rpuck[data-person="${id}"]`); const rw = pk && pk.querySelector('.rwhy'); if (rw) rw.textContent = w; if (pk) { pk.dataset.why = w; pk.title = window.PEOPLE[id].cs + ' — ' + w } }
    }, words)
    const mid = await read(); fact(sc, 'SANS section, the new words (letters not moved)', mid)
    await mark(p, ['let'], [], [], true)
    await shot(p, sc + '-words', ['sec'], { pad: 8 })
    /* proposed, step 2: one column — every row's puck entry as wide as the widest (its reason's own width), so the letters
       after it start at one place; measured: the widest reason's last letter to the column */
    const colr = await p.evaluate(() => {
      const sec = document.querySelector('[data-sw="sec"]')
      const pks = [...sec.querySelectorAll('.rsans-row > .rpuck')]
      const w = Math.max(...pks.map(e => e.getBoundingClientRect().width))
      const widest = pks.find(e => e.getBoundingClientRect().width === w)
      const pw0 = pks.map(e => e.querySelector('.puck').getBoundingClientRect().width)
      /* each badge's own words, whole, before the move (a badge that is cut afterwards shows here as wider than its box) */
      const badges = () => [...sec.querySelectorAll('.rsans-b')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ text: e.textContent, cut: e.scrollWidth > e.clientWidth + 0.5 }))
      const cut0 = badges()
      pks.forEach(e => { e.style.flex = `0 0 ${w}px` })
      const pw1 = pks.map(e => e.querySelector('.puck').getBoundingClientRect().width)
      const lefts = [...sec.querySelectorAll('.rsans-b')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.getBoundingClientRect().left)
      /* the widest reason's last letter (a text range), to the column's left edge */
      const rw = widest.querySelector('.rwhy'); let gap = null
      if (rw && rw.firstChild) { const r = document.createRange(); r.selectNodeContents(rw); const rs = [...r.getClientRects()]; const end = Math.max(...rs.map(x => x.right)); gap = Math.round((Math.min(...lefts) - end) * 10) / 10 }
      return { widest: window.PEOPLE[widest.dataset.person].cs + ': ' + (rw ? rw.textContent : ''), badgesBefore: cut0, badgesAfter: badges(), width: Math.round(w * 10) / 10, lefts: lefts.map(x => Math.round(x * 10) / 10), spread: Math.round((Math.max(...lefts) - Math.min(...lefts)) * 100) / 100, puckWidthsUnchanged: pw0.every((x, i) => Math.abs(x - pw1[i]) < 0.5), gapAfterWidestReason: gap, sectionRight: Math.round(sec.getBoundingClientRect().right), rowsOverflow: [...sec.querySelectorAll('.rsans-row')].map(r => r.scrollWidth - r.clientWidth) }
    })
    fact(sc, 'the column', colr)
    must(sc, 'the letters stand in one column (left edges within 0.5px) and no puck changed size', colr.spread <= 0.5 && colr.puckWidthsUnchanged, colr)
    const fin = await read(); fact(sc, 'SANS section, proposed', fin)
    await mark(p, ['let'], [], [], true)
    await shot(p, sc + '-new', ['sec'], { pad: 8 })
    /* chat 186 (D2750), picture 2: the place picked, the letters in one column as above, and Jester's hours moved onto a
       second line directly under his "A" — the badge's own words split at its " · ", the hours a block line inside the
       badge itself, so they take its font, size and colour by inheritance; nothing else changes. Measured: the hours'
       first letter against the "A" (text ranges), the hours whole, no badge cut, every other row's height unchanged. */
    const wrap = await p.evaluate(() => {
      const sec = document.querySelector('[data-sw="sec"]')
      const rows = [...sec.querySelectorAll('.rsans-row')]
      const h0 = rows.map(r => r.getBoundingClientRect().height)
      const jr = rows.find(r => r.querySelector('.rpuck[data-person="ipman"]'))
      const b = jr && jr.querySelector('.rsans-b')
      if (!b) return { ok: false, why: 'no badge on Jester\'s row' }
      const was = b.textContent
      const parts = was.split(' · ')
      if (parts.length !== 2) return { ok: false, why: 'badge words not "letter · hours"', was }
      b.textContent = parts[0]
      const hrs = document.createElement('span'); hrs.className = 'sw-hrs'; hrs.style.display = 'block'; hrs.textContent = parts[1]
      b.appendChild(hrs)
      b.dataset.sw = 'wrap'
      const h1 = rows.map(r => r.getBoundingClientRect().height)
      const ji = rows.indexOf(jr)
      const rng = n => { const r = document.createRange(); r.selectNodeContents(n); return [...r.getClientRects()][0] }
      const aBox = rng(b.firstChild), hBox = rng(hrs.firstChild)
      const cs = e => { const s = getComputedStyle(e); return { font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, colour: s.color, opacity: s.opacity } }
      const lineH = hrs.getBoundingClientRect().height
      const badges = [...sec.querySelectorAll('.rsans-b')].filter(e => e.getBoundingClientRect().width > 0)
      return {
        ok: true, was, line1: b.firstChild.textContent, line2: hrs.textContent,
        hoursShownWhole: hrs.textContent === parts[1] && hrs.scrollWidth <= hrs.clientWidth + 0.5 && b.scrollWidth <= b.clientWidth + 0.5,
        hoursLeftMinusALeft: Math.round((hBox.left - aBox.left) * 100) / 100, hoursTopMinusABottom: Math.round((hBox.top - aBox.bottom) * 100) / 100,
        badgeStyle: cs(b), hoursStyle: cs(hrs),
        badgesCut: badges.map(e => ({ text: e.textContent, sw: e.scrollWidth, cw: e.clientWidth, cut: e.scrollWidth > e.clientWidth + 0.5 })),
        jesterRowH: [Math.round(h0[ji] * 100) / 100, Math.round(h1[ji] * 100) / 100], hoursLineH: Math.round(lineH * 100) / 100,
        otherRowsMoved: rows.map((r, i) => i === ji ? null : Math.round((h1[i] - h0[i]) * 100) / 100).filter(x => x !== null && Math.abs(x) >= 0.5),
        badgeW: Math.round(b.getBoundingClientRect().width * 10) / 10, hoursW: Math.round(hBox.width * 10) / 10, sectionRight: Math.round(sec.getBoundingClientRect().right * 10) / 10, badgeRight: Math.round(b.getBoundingClientRect().right * 10) / 10,
      }
    })
    fact(sc, 'the hours on a second line', wrap)
    must(sc, 'the hours split off Jester\'s badge ("A" over "08:00–10:00")', wrap.ok && wrap.line1 === 'A' && wrap.line2 === '08:00–10:00', wrap)
    must(sc, 'the hours\' full text shows (not cut)', wrap.hoursShownWhole, wrap)
    must(sc, 'nothing in the section is cut (scrollWidth <= clientWidth on every badge)', wrap.badgesCut.every(x => !x.cut), wrap.badgesCut)
    must(sc, 'the hours stand directly under the "A", left-aligned with it (within 0.5px), on the next line', Math.abs(wrap.hoursLeftMinusALeft) <= 0.5 && wrap.hoursTopMinusABottom >= -0.5 && wrap.hoursTopMinusABottom <= 3, { left: wrap.hoursLeftMinusALeft, top: wrap.hoursTopMinusABottom })
    must(sc, 'the hours in the badge\'s own font, size and colour', JSON.stringify(wrap.badgeStyle) === JSON.stringify(wrap.hoursStyle), [wrap.badgeStyle, wrap.hoursStyle])
    must(sc, 'every other row\'s height unchanged; Jester\'s row grows no more than the second line', wrap.otherRowsMoved.length === 0 && wrap.jesterRowH[1] - wrap.jesterRowH[0] <= wrap.hoursLineH + 0.5, { other: wrap.otherRowsMoved, jester: wrap.jesterRowH, line: wrap.hoursLineH })
    const fw = await read(); fact(sc, 'SANS section, the hours on a second line', fw)
    const mk = await mark(p, ['let', 'wrap'], ['wrap:edge'], [], true)
    must(sc, 'the marks leave every box unchanged', !/MOVED|MISSING/.test(JSON.stringify(mk)), mk)
    /* the "New" tag covers no letters, reason or puck in the section (text ranges for the words) */
    const cover = await p.evaluate(() => {
      const sec = document.querySelector('[data-sw="sec"]'), tag = document.querySelector('.sw-tag')
      if (!tag) return ['no tag']
      const tb = tag.getBoundingClientRect(), hit = []
      const ov = (r, what) => { if (r.width > 0 && r.left < tb.right && r.right > tb.left && r.top < tb.bottom && r.bottom > tb.top) hit.push(what) }
      for (const e of sec.querySelectorAll('.rsans-b, .rwhy, .puck')) {
        if (e.getBoundingClientRect().width <= 0) continue
        if (e.classList.contains('puck')) { ov(e.getBoundingClientRect(), 'puck'); continue }
        const r = document.createRange(); r.selectNodeContents(e); [...r.getClientRects()].forEach(x => ov(x, (e.textContent || '').trim()))
      }
      return hit
    })
    must(sc, 'the "New" tag covers no letters, reason or puck', cover.length === 0, cover)
    await shot(p, sc + '-wrap', ['sec'], { pad: 8 })
    await p.keyboard.press('Escape'); await sleep(300)
  },
}

for (const name of ONLY) {
  if (!SCENES[name]) continue
  console.log('=== ' + name + ' ' + size)
  await T.run(name, SZ, async (p, Wk) => {
    p.on('pageerror', e => fact(name, 'PAGE ERROR', e.message))
    await SCENES[name](p, Wk)
  })
  const bad = T.L.results.filter(r => r.scn === name && r.ok === false)
  if (bad.length) fact(name, 'FAILED', bad.map(r => `${r.id}: ${String(r.note).slice(0, 300)}`))
  writeFileSync(path.join(process.env.W2_OUT, `facts-${SZ}-${ONLY.join('_')}.json`), JSON.stringify(facts, null, 1))
}
console.log('DONE ' + size)
process.exit(0)
