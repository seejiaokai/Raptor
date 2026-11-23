// Chat 156, 24 Nov 26: every new SANS wording of D2388, D2390, D2391 and D2394, drawn on the real app before it is built
// (D1625). Each case is staged through the app's own controls on the unchanged build and pictured as it reads TODAY; only
// then are the words of the element the app drew changed, and it is pictured again. window.* is only READ.
// Run from raptor-port/ against the build served on port 4180, one size a process:
//   SZ=d ONLY=note,due node docs/mock/2026-11-24-sans-words/draw.mjs
import path from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const SZ = process.env.SZ || 'd'
process.env.W2_URL ||= 'http://localhost:4180/'
process.env.W2_OUT ||= `D:/raptor-work/c156-draw/run-${SZ}`
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
mkdirSync(path.join(process.env.W2_OUT, 'taps'), { recursive: true })
const X = await import('../../../scripts/handpass/sah-w8-lib.mjs')
const T = await import('../../../scripts/handpass/sah-w10-lib.mjs')
const { L, RANGER, HEX } = X
const IMG = path.join(path.dirname(fileURLToPath(import.meta.url)), 'img')
mkdirSync(IMG, { recursive: true })
T.L.SIZES.d.opts.deviceScaleFactor = 2
const ONLY = (process.env.ONLY || 'note,due,needed,crew,hint,a,b,c,d,e,offer').split(',')
const D = { 16: '2026-07-16', 17: '2026-07-17', 18: '2026-07-18', 19: '2026-07-19', 20: '2026-07-20', 24: '2026-07-24' }
const WK1 = '2026-07-13', WK2 = '2026-07-20'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const size = SZ === 'd' ? 'desktop' : 'phone'
const facts = []
const fact = (scene, what, v) => { facts.push({ scene, size, what, v }); console.log(`[${scene}] ${what}:`, typeof v === 'string' ? v : JSON.stringify(v)) }

/* ---- the picture: the union of the named parts, on the page as it stands ---- */
async function mark(p, sel) {
  await p.evaluate(sel => {
    if (!document.getElementById('sw-style')) { const s = document.createElement('style'); s.id = 'sw-style'; s.textContent = '.sw-mark{outline:2px solid #FFC83D !important;outline-offset:2px}'; document.head.appendChild(s) }
    document.querySelectorAll('.sw-mark').forEach(e => e.classList.remove('sw-mark'))
    for (const q of [].concat(sel)) { const e = [...document.querySelectorAll(q)].filter(x => x.getBoundingClientRect().width > 0).pop(); if (e) e.classList.add('sw-mark') }
  }, sel)
}
async function shot(p, name, sels, pad = 14) {
  const box = await p.evaluate(([sels, pad]) => {
    const rs = sels.flatMap(q => [...document.querySelectorAll(q)].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 }).slice(-1)).map(e => e.getBoundingClientRect())
    if (!rs.length) return null
    const x = Math.max(0, Math.min(...rs.map(r => r.left)) - pad), y = Math.max(0, Math.min(...rs.map(r => r.top)) - pad)
    const x2 = Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + pad), y2 = Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)) + pad)
    return { x, y, width: x2 - x, height: y2 - y }
  }, [sels, pad])
  if (!box) throw new Error('nothing to picture: ' + name + ' ' + sels)
  const f = `${name}-${size}.png`
  await p.screenshot({ path: path.join(IMG, f), clip: box })
  console.log('  picture', f, Math.round(box.width) + 'x' + Math.round(box.height))
}

/* ---- the note at the foot: the app's own, its words changed just before the picture ---- */
const noteWords = (p, words) => p.evaluate(words => { const t = document.getElementById('toastEl'); if (!t) return false; t.textContent = words; t.style.opacity = '1'; t.classList.add('sw-mark'); return true }, words)

/* ---- the bell ---- */
async function bellOpen(p, W) {
  await T.closeAll(p, W)
  await W.press(p, '.bellbtn:visible', 'bell')
  await p.waitForSelector('[data-testid="bell-list"]', { timeout: 6000 })
  await sleep(350)
  return T.bellLines(p)
}
/* the SANS line the app drew, given new words (title, who, body); with none drawn, a new line in the same markup */
const bellWords = (p, { title, who, body, match = 'SANS', keepMarks = false }) => p.evaluate(({ title, who, body, match, keepMarks }) => {
  const list = [...document.querySelectorAll('[data-testid="bell-list"]')].find(e => e.getBoundingClientRect().width > 0)
  const scroll = list.querySelector('.bl-scroll')
  let line = [...list.querySelectorAll('.bl-line')].find(e => new RegExp(match).test(e.textContent))
  if (!line) {
    line = document.createElement('button'); line.type = 'button'; line.className = 'bl-line unread'
    line.innerHTML = '<span class="bl-dot" aria-hidden="true"></span><span class="bl-main"><span class="bl-t"><b class="bl-name"></b></span><span class="bl-what"></span></span><span class="bl-ago">now</span>'
    const empty = list.querySelector('.bl-empty'); if (empty) empty.style.display = 'none'
    scroll.prepend(line)
  }
  line.classList.add('unread')
  const t = line.querySelector('.bl-t')
  t.innerHTML = ''; const b = document.createElement('b'); b.className = 'bl-name'; b.textContent = title; t.appendChild(b)
  if (who) { const i = document.createElement('i'); i.className = 'bl-day'; i.textContent = '· ' + who; t.appendChild(i) }
  const parts = [...line.querySelectorAll('.bl-what')]
  parts.forEach((e, i) => { if (i) e.style.display = 'none' })
  if (body) { parts[0].textContent = body; parts[0].style.display = '' } else parts[0].style.display = 'none'
  if (!keepMarks) document.querySelectorAll('.sw-mark').forEach(e => e.classList.remove('sw-mark'))
  line.querySelector('.bl-main').classList.add('sw-mark')
  return true
}, { title, who, body, match, keepMarks })
const BELL = ['[data-testid="bell-list"]']
async function markRead(p, W) { await bellOpen(p, W); const m = p.locator('[data-testid="bell-markall"]:visible').first(); if (await m.count()) await W.press(p, m, 'markall'); await T.closeAll(p, W) }

/* ---- staging ---- */
const post = async (p, W, id = RANGER, iso = D[17]) => { const r = await L.postOut(p, W, id, iso, 'post'); if (!/becomes SANS/.test(r.line)) throw new Error('posting not made: ' + r.line); return r }
const plan = async (p, W, id = RANGER) => {
  const a = await X.row(p, W, WK1, 5, 'Ops brief', '09:00', '10:00', id)
  const b = await X.row(p, W, WK2, 0, 'Ops brief', '09:00', '10:00', id)
  if (!a.ok || !b.ok) throw new Error('not planned: ' + a.ok + ' ' + b.ok)
  await L.gotoWeek(p, W, WK1)
}
const fileOwn = async (p, W, iso) => { const r = await T.file(p, W, iso, null, ['fly'], null, 'file' + iso.slice(8)); if (!r.iid) throw new Error('not filed ' + iso + ': ' + r.refused); await T.closeAll(p, W); return r }
const asR = (p, W) => T.as(p, W, 'us', 'us')
const asS = (p, W) => T.as(p, W, 'ad', 'a')

const SCENES = {
  /* 1. A run that starts before his SANS date. Today refused whole; new: the days from his date saved, a note says why */
  async note(p, W) {
    await post(p, W); await asR(p, W); await T.sansTab(p, W, D[17])
    const r = await X.dragDays(p, W, D[16], D[18])
    const said = await L.toastSaid(p)
    fact('note', 'today, Ranger drags Thu 16 – Sat 18', { opened: r.opened, said })
    if (!/SANS from Fri 17 Jul/.test(said)) throw new Error('premise: no refusal')
    const cells = [`[data-testid="sc-day-${D[16]}"]`, `[data-testid="sc-day-${D[18]}"]`, '#toastEl']
    await p.evaluate(() => document.getElementById('toastEl').classList.add('sw-mark'))
    await mark(p, '#toastEl'); await shot(p, 'note-today', cells)
    /* the real filing of Fri 17 – Sat 18, through the same drag, then the refusal's own note given the new words */
    const r2 = await X.dragDays(p, W, D[17], D[18])
    fact('note', 'Ranger drags Fri 17 – Sat 18', { opened: r2.opened })
    if (!r2.opened) throw new Error('window did not open')
    await p.locator('#inpEditSave:visible').first().click(); await sleep(900)
    const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) await nd.first().click()
    await T.closeAll(p, W); await sleep(400)
    fact('note', 'saved records', await T.sansInputs(p))
    await X.dragDays(p, W, D[16], D[18])     // raises the app's note in its real place, the month showing the saved days
    await noteWords(p, 'Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you\'re SANS from Fri 17 Jul.')
    await shot(p, 'note-new-own', cells)
    await noteWords(p, 'Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul.')
    await shot(p, 'note-new-admin', cells)
  },
  /* 2. His reminder's last words (D2390) */
  async due(p, W) {
    await post(p, W); await plan(p, W); await asR(p, W)
    const l = await bellOpen(p, W); fact('due', 'today', l.map(x => x.text))
    await mark(p, '[data-testid="bell-list"] .bl-line .bl-main'); await shot(p, 'due-today', BELL)
    /* the days are the ones the app itself named */
    const days = /planned on (.*) with nothing filed/.exec(l[0].text)[1]; fact('due', 'days the app named', days)
    await bellWords(p, { title: "You're SANS from Fri 17 Jul.", body: `You're planned on ${days} with nothing filed. Tap to file for availability.` })
    await shot(p, 'due-new', BELL)
  },
  /* 3. 2b: a man ticked SANS on Quals, no posting */
  async needed(p, W) {
    const q = await L.qualsTick(p, W, RANGER, 'tick'); fact('needed', 'ticked on Quals', q.st); if (!q.st.san) throw new Error('not ticked')
    await plan(p, W); await asR(p, W)
    const l = await bellOpen(p, W); fact('needed', 'today', l.map(x => x.text))
    await mark(p, '[data-testid="bell-list"]'); await shot(p, 'needed-today', BELL)
    /* he is SANS from today, so a planned Wed 15 would lead the list; the rest are the days the posted cases named */
    await T.closeAll(p, W); await L.gotoWeek(p, W, WK1)
    const wed = (await X.holds(p, RANGER)).split(' | ').find(x => /15/.test(x.split(':')[0])) || ''
    const days = /:-$/.test(wed) ? 'Thu 16, Sat 18, Mon 20 Jul and 1 more' : 'Wed 15, Thu 16, Sat 18 Jul and 2 more'
    fact('needed', 'Wed 15 holds him', wed.slice(0, 60)); fact('needed', 'days', days)
    await bellOpen(p, W)
    await bellWords(p, { title: 'Your SANS availability is needed.', body: `You're planned on ${days} with nothing filed. Tap to file for availability.` })
    await shot(p, 'needed-new', BELL)
  },
  /* 4. 2c: why a SANS man is struck, on the crew list with no seat picked */
  async crew(p, W) {
    await post(p, W); await L.closeBoard(p, W); await L.go(p, 'editsched')
    /* (the section whole on a desktop, clear of the page's foot bar) */
    if (!W.isPhone) await p.setViewportSize({ width: 1536, height: 1300 })
    const day = await T.S.crewPanelTo(p, W, 'sat'); fact('crew', 'crew list on', day)
    const sec = '.ros-body .rall.rsans'
    await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'start' }), sec); await sleep(300)
    const h0 = await p.evaluate(s => Math.round(document.querySelector(s).getBoundingClientRect().height), sec)
    const rows = await p.evaluate(s => [...document.querySelectorAll(s + ' .rpuck')].map(e => ({ cs: e.textContent.trim().slice(0, 10), why: e.dataset.why || '' })), sec)
    fact('crew', 'rows', rows); fact('crew', 'section height today', h0)
    await mark(p, sec); await shot(p, 'crew-today', [sec], 8)
    /* A: each struck man his own line, in the app's own reason line (the one an armed seat prints) */
    await p.evaluate(s => {
      for (const e of document.querySelectorAll(s + ' .rpuck.no')) {
        const why = e.dataset.why || ''
        const w = /^SANS from/.test(why) ? why : "No availability filed. File it on the Inputs page's SANS tab."
        e.classList.add('haswhy'); const r = document.createElement('span'); r.className = 'rwhy sw-why'; r.textContent = w; e.appendChild(r)
      }
    }, sec); await sleep(200)
    const h1 = await p.evaluate(s => Math.round(document.querySelector(s).getBoundingClientRect().height), sec)
    fact('crew', 'section height, a line on every struck man', h1)
    await shot(p, 'crew-new-each', [sec], 8)
    /* B: the men who share the plain reason say it once under the heading; Ranger keeps his own line */
    await p.evaluate(s => {
      const root = document.querySelector(s); let n = 0
      for (const r of root.querySelectorAll('.sw-why')) if (/^No availability/.test(r.textContent)) { r.parentElement.classList.remove('haswhy'); r.style.display = 'none'; n++ }
      const h = root.querySelector('.rh2'), l = document.createElement('div'); l.className = 'rwhy sw-shared'
      l.style.cssText = 'padding:0 1px 4px'; l.textContent = "No availability filed. File it on the Inputs page's SANS tab."
      /* it stands above the first man it speaks for, so a free man above it is never read as one of them */
      const first = [...root.querySelectorAll('.sw-why')].find(r => /^No availability/.test(r.textContent))
      ;(first ? first.closest('.rsans-row') : h.nextSibling).before(l); return n
    }, sec); await sleep(200)
    const h2 = await p.evaluate(s => Math.round(document.querySelector(s).getBoundingClientRect().height), sec)
    fact('crew', 'section height, the shared reason said once', h2)
    await shot(p, 'crew-new-once', [sec], 8)
  },
  /* 5. Q4: the grey "+ Commitment" on his days before his SANS date */
  async hint(p, W) {
    await post(p, W); await asR(p, W); await T.sansTab(p, W, D[16])
    await W.press(p, `[data-testid="sc-day-${D[16]}"]`, 'day'); await p.waitForSelector('[data-testid="win-sansday"]'); await sleep(400)
    const dis = await p.locator('[data-testid="sd-add"]:visible').first().isDisabled()
    fact('hint', 'today', { greyed: dis, words: await p.locator('[data-testid="sd-addwhy"]').first().textContent() })
    await mark(p, '[data-testid="sd-addwhy"]'); await shot(p, 'hint-today', ['[data-testid="win-sansday"] .sd-acts', '[data-testid="sd-addwhy"]'], 16)
    await p.evaluate(() => { document.querySelector('[data-testid="sd-addwhy"]').textContent = "You're SANS from Fri 17 Jul." })
    await shot(p, 'hint-new', ['[data-testid="win-sansday"] .sd-acts', '[data-testid="sd-addwhy"]'], 16)
    /* does an admin ever see this line? his "+ Commitment" on the same day */
    await asS(p, W); await T.sansTab(p, W, D[16])
    await W.press(p, `[data-testid="sc-day-${D[16]}"]`, 'day'); await p.waitForSelector('[data-testid="win-sansday"]'); await sleep(400)
    fact('hint', 'Saber on Thu 16', { greyed: await p.locator('[data-testid="sd-add"]:visible').first().isDisabled(), lineShown: await p.locator('[data-testid="sd-addwhy"]').count() })
  },
  /* 6–10. Q5 A–E: his posting or tick changes */
  async a(p, W) {
    await post(p, W); await asR(p, W); await fileOwn(p, W, D[17]); await asS(p, W)
    const m = await T.movePo(p, W, RANGER, D[17], D[18], 'move'); fact('a', 'moved', m.rec)
    await asR(p, W); const l = await bellOpen(p, W); fact('a', 'today', l.map(x => x.text))
    await mark(p, '[data-testid="bell-list"] .bl-line .bl-main'); await shot(p, 'a-today', BELL)
    await bellWords(p, { title: 'Your SANS date moved to Sat 18 Jul.', who: 'Saber', body: "You're active until then, so the SANS availability you filed for Fri 17 Jul is hidden. It comes back if you're SANS that day again." })
    await shot(p, 'a-new', BELL)
  },
  async b(p, W) {
    await post(p, W); await asR(p, W); await fileOwn(p, W, D[17]); await fileOwn(p, W, D[18]); await asS(p, W)
    const m = await T.undoPo(p, W, RANGER, D[17], 'undo'); fact('b', 'undone', m.rec)
    await asR(p, W); const l = await bellOpen(p, W); fact('b', 'today', l.map(x => x.text))
    await mark(p, '[data-testid="bell-list"] .bl-line .bl-main'); await shot(p, 'b-today', BELL)
    await bellWords(p, { title: "You're no longer posted out as SANS.", who: 'Saber', body: "You're active again, so the SANS availability you filed for Fri 17, Sat 18 Jul is hidden. It comes back if you're SANS those days again." })
    await shot(p, 'b-new', BELL)
  },
  async c(p, W) {
    const q = await L.qualsTick(p, W, RANGER, 'tick'); if (!q.st.san) throw new Error('not ticked')
    await asR(p, W); await fileOwn(p, W, D[17]); await fileOwn(p, W, D[18]); await asS(p, W)
    const q2 = await L.qualsTick(p, W, RANGER, 'untick'); fact('c', 'unticked', q2.st); if (q2.st.san) throw new Error('still ticked')
    await asR(p, W); const l = await bellOpen(p, W); fact('c', 'today', l.map(x => x.text))
    await mark(p, '[data-testid="bell-list"]'); await shot(p, 'c-today', BELL)
    await bellWords(p, { title: "You're no longer SANS.", who: 'Saber', body: "You're active again, so the SANS availability you filed for Fri 17, Sat 18 Jul is hidden. It comes back if you're SANS those days again." })
    await shot(p, 'c-new', BELL)
  },
  async d(p, W) {
    await post(p, W); await plan(p, W); await asR(p, W); await markRead(p, W); await asS(p, W)
    const m = await T.movePo(p, W, RANGER, D[17], D[16], 'move'); fact('d', 'moved', m.rec)
    await asR(p, W); const l = await bellOpen(p, W); fact('d', 'today', l.map(x => x.text))
    await mark(p, '[data-testid="bell-list"] .bl-line .bl-main'); await shot(p, 'd-today', BELL)
    /* the struck line becomes the title alone; his live reminder stays, with its new last words */
    const live = /planned on (.*) with nothing filed\. Tap/.exec(l.find(x => /Tap to file/.test(x.text)).text)[1]
    await bellWords(p, { title: 'Your SANS date moved to Thu 16 Jul.', who: 'Saber', body: '', match: 'taken back' })
    await bellWords(p, { title: "You're SANS from Thu 16 Jul.", body: `You're planned on ${live} with nothing filed. Tap to file for availability.`, match: 'Tap to file', keepMarks: true })
    await shot(p, 'd-new', BELL)
  },
  async e(p, W) {
    await post(p, W); await asR(p, W); await fileOwn(p, W, D[17]); await fileOwn(p, W, D[18]); await asS(p, W)
    const m = await T.sansChip(p, W, RANGER, D[17], 'chip'); fact('e', 'other outcome', { line: m.line, rec: m.rec })
    await asR(p, W); const l = await bellOpen(p, W); fact('e', 'today', l.map(x => x.text))
    await mark(p, '[data-testid="bell-list"] .bl-line .bl-main'); await shot(p, 'e-today', BELL)
    await bellWords(p, { title: "You're no longer posted out as SANS.", who: 'Saber', body: "The SANS availability you filed for Fri 17, Sat 18 Jul is hidden while you're not SANS those days." })
    await shot(p, 'e-new', BELL)
  },
  /* 11. Q10: a shared offer, one of its men not SANS on the day being added */
  async offer(p, W) {
    await post(p, W, RANGER, D[17]); await post(p, W, HEX, D[17])
    const f = await T.file(p, W, D[18], [RANGER, HEX], ['fly'], null, 'shared'); if (!f.iid) throw new Error('shared offer not filed: ' + f.refused)
    await T.closeAll(p, W)
    const m = await T.movePo(p, W, HEX, D[17], D[24], 'move'); fact('offer', 'Hex moved', m.rec)
    await T.sansTab(p, W, D[18]); await W.press(p, `[data-testid="sc-day-${D[18]}"]`, 'day'); await p.waitForSelector('[data-testid="win-sansday"]'); await sleep(400)
    await X.openLine(p, W, D[18], f.iid, 'line')
    await p.waitForSelector('#inpEditPop'); await sleep(300)
    const d = p.locator(`[data-testid="inpEdCal-day-${D[19]}"]`).first()
    await d.scrollIntoViewIfNeeded(); await W.press(p, d, 'cal-19'); await sleep(300)
    await W.press(p, '#inpEditSave:visible', 'save'); await sleep(500)
    const said = await L.toastSaid(p); fact('offer', 'today', said)
    if (!/Hex is SANS from Fri 24 Jul/.test(said)) throw new Error('premise: no refusal: ' + said)
    await p.evaluate(() => { const t = document.getElementById('toastEl'); t.style.opacity = '1'; t.classList.add('sw-mark') })
    const parts = ['#toastEl']
    await shot(p, 'offer-today', parts)
    await noteWords(p, 'Hex is SANS from Fri 24 Jul. Take him out of this offer to add earlier days.')
    await shot(p, 'offer-new', parts)
  },
}

for (const name of ONLY) {
  if (!SCENES[name]) continue
  console.log('=== ' + name + ' ' + size)
  await T.run(name, SZ, async (p, W) => { await SCENES[name](p, W) })
  const bad = T.L.results.filter(r => r.scn === name && r.ok === false)
  if (bad.length) fact(name, 'FAILED', bad.map(r => `${r.id}: ${String(r.note).slice(0, 240)}`))
  writeFileSync(path.join(process.env.W2_OUT, `facts-${SZ}.json`), JSON.stringify(facts, null, 1))
}
console.log('DONE ' + size)
process.exit(0)
