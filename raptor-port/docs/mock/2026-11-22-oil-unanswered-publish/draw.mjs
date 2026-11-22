// A weekend whose only work is an input with no OIL answer — two ways for the day and the publish to say so (22 Nov 26).
// The fault (Fable's OIL read, F2): Sat 18 Jul holds only Ranger's Training 08:00–17:00, its OIL question unanswered; the four
// sign, Publish day, and nothing on the day or in the publish note says nobody earns OIL.
//
// Drawn on the REAL running app by .claude/skills/brainstorming/mockups-on-the-real-app.md. Every "today" frame is the app as
// it draws itself; every "proposed" frame changes only words, hides one of the app's own nodes (display:none, never removed)
// or adds a node in the app's own markup and classes, marked "New":
//   A1  the board's list of the day's checks: one line in the shape of the app's "no usable times" line, in the same red
//       warning class (.wln.hard), with a button in the shape of the one check that already carries one (.wln-act,
//       "Create the 2026 period") reading "Answer OIL" — the words of the app's own "not answered" bar
//   A2  the publish note: the words after "published and approved" changed, in the pattern the app already uses for a desk
//       with no times ("… published and approved. The Common Programme has no usable times, so nobody on it earns OIL.")
//   A3  (desktop) the same line in Edit Schedule's week list (.witem.hard + .witem-act), which the app draws from the same list
//   B1  the day's one list of open OIL questions, opened by the app's own door (the Original loaded back onto the working copy
//       after the input was taken off the programme — the door that opens it today, D818), with a new lead line and a new
//       foot line in the window's own classes; then Yes + Save are pressed for real to read what an answer does to the
//       published day (recorded in manifest.json)
//
// Staging: the Saturday is emptied and the input pushed through the probe bridge, as the proof test does
// (src/leavewar/fableoil-unanswered-publish.test.tsx) — every door of the app asks the OIL question at a filing, so the
// unanswered input is put in directly; it is asserted ON SCREEN (the board's row) before anything is drawn.
//
// Run from raptor-port/, against a built preview already serving:
//   TS_URL=http://localhost:4183/ node docs/mock/2026-11-22-oil-unanswered-publish/draw.mjs
// Pictures and manifest.json go to docs/mock/2026-11-22-oil-unanswered-publish/img/.
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const URL_ = process.env.TS_URL || 'http://localhost:4183/'
const OUT = 'docs/mock/2026-11-22-oil-unanswered-publish/img'
mkdirSync(OUT, { recursive: true })
const ONLY = process.env.TS_ONLY ? process.env.TS_ONLY.split(',') : null

const SIZES = {
  d: { name: 'desktop', eng: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', eng: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
}

/* the words of each option, one place */
const W = {
  a_line: 'Training has no OIL answer, so nobody on it earns OIL for this day',
  a_btn: 'Answer OIL',
  a_note_tail: "Ranger's Training has no OIL answer, so nobody on it earns OIL.",
  b_lead: 'Saturday 18 Jul published and approved. 1 input has no OIL answer, so nobody on it earns OIL yet.',
  b_foot: 'An answer makes Saturday pending again: it needs signing and publishing once more',
}

const MARK_CSS = `
.mkq { outline: 2px solid #ff2d95 !important; outline-offset: -2px !important; }
.mkq-tag { position: fixed; z-index: 2147483647; background: #ff2d95; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; }
.mkdim { position: fixed; inset: 0; z-index: 2147483600; pointer-events: none; }
`
const manifest = { drawn: new Date().toISOString(), url: URL_, words: W, frames: [], checks: {} }
const log = (...a) => console.log(...a)

async function shot(p, sz, name, sel, pad = 10, extra = null) {
  /* clear of the board's bar that stays: the part is brought to the middle of the screen first (a fixed part stays put),
     then the tags are placed again from its new box */
  const moved = await p.evaluate(sel => {
    const el = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!el) return false
    const t0 = el.getBoundingClientRect().top; el.scrollIntoView({ block: 'center', inline: 'nearest' }); return Math.abs(el.getBoundingClientRect().top - t0) > 1
  }, sel)
  if (moved) {
    await p.waitForTimeout(250)
    await p.evaluate(() => { for (const t of document.querySelectorAll('.mkq-tag')) t.remove() })
    await p.evaluate(() => { for (const el of document.querySelectorAll('.mkq')) { const b = el.getBoundingClientRect(), t = document.createElement('span')
      t.className = 'mkq-tag'; t.textContent = 'New'; t.setAttribute('data-mine', '1'); document.body.appendChild(t)
      t.style.left = (b.right - t.offsetWidth - 2) + 'px'; t.style.top = (b.top - t.offsetHeight + 4) + 'px' } })
  }
  /* nothing the app keeps pinned may sit over the part: asked of the page at the part's own top edge */
  const covered = await p.evaluate(sel => {
    const el = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); const b = el.getBoundingClientRect()
    const at = document.elementFromPoint(b.left + 8, b.top + 3); return at && !el.contains(at) && !at.classList.contains('mkq-tag') ? (at.className || at.tagName) : null
  }, sel)
  if (covered) log(`${name}: its top edge is under`, covered)
  const box = await p.evaluate(([sel, extra]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    const els = [...document.querySelectorAll(sel)].filter(vis)
    if (!els.length) return null
    const rs = [els[0].getBoundingClientRect()]
    if (extra) for (const e of [...document.querySelectorAll(extra)].filter(vis)) rs.push(e.getBoundingClientRect())
    const x = Math.min(...rs.map(r => r.left)), y = Math.min(...rs.map(r => r.top))
    const r = Math.max(...rs.map(r => r.right)), b = Math.max(...rs.map(r => r.bottom))
    return { x, y, w: r - x, h: b - y }
  }, [sel, extra])
  if (!box) throw new Error(`${name}: nothing visible for ${sel}`)
  const vw = sz.opts.viewport.width, vh = sz.opts.viewport.height
  const x = Math.max(0, box.x - pad), y = Math.max(0, box.y - pad)
  const clip = { x, y, width: Math.min(vw - x, box.w + 2 * pad), height: Math.min(vh - y, box.h + 2 * pad) }
  const file = `${OUT}/${name}-${sz.name}.png`
  await p.screenshot({ path: file, clip })
  manifest.frames.push({ name, size: sz.name, file: file.split('/').pop(), clip })
  log('shot', file)
}

/* a tag on the page, placed from the element's box just before the picture (the screen is still) */
async function tag(p, sel, label) {
  await p.evaluate(([sel, label]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    const el = [...document.querySelectorAll(sel)].filter(vis)[0]; if (!el) throw new Error('tag: no ' + sel)
    el.classList.add('mkq')
    const b = el.getBoundingClientRect(), t = document.createElement('span')
    t.className = 'mkq-tag'; t.textContent = label; t.setAttribute('data-mine', '1'); document.body.appendChild(t)
    t.style.left = (b.right - t.offsetWidth - 2) + 'px'; t.style.top = (b.top - t.offsetHeight + 4) + 'px'
  }, [sel, label])
}
const untag = p => p.evaluate(() => { document.querySelectorAll('[data-mine]').forEach(e => e.remove()); document.querySelectorAll('.mkq').forEach(e => e.classList.remove('mkq')) })

async function login(p) {
  await p.goto(URL_)
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' })
  await p.waitForTimeout(500)
  await p.addStyleTag({ content: MARK_CSS })
}
async function go(p, to) { await p.evaluate(t => window.go(t), to); await p.waitForFunction(t => window.CURPAGE === t, to); await p.waitForTimeout(400) }
async function board(p, di) {
  await go(p, 'editsched')
  await p.locator(`#eWeek [data-sbday="${di}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await p.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' })
  await p.waitForTimeout(500)
}
/* the board's list of checks, open (on a phone it is a fold) */
async function openChecks(p) {
  const open = await p.evaluate(() => { const w = [...document.querySelectorAll('#schedBoard .sbwrap')].find(e => e.getBoundingClientRect().width > 0); return w ? w.classList.contains('open') : null })
  if (open === false) { await p.locator('#schedBoard .sbwrap [data-sbwtog]').first().click(); await p.waitForTimeout(300) }
}
const neutralTap = p => p.evaluate(() => { const h = document.querySelector('#schedBoard .sb-sec'); if (h) h.dispatchEvent(new MouseEvent('click', { bubbles: false })); (document.activeElement)?.blur?.() })

async function run(key) {
  const sz = SIZES[key]
  const b = await sz.eng.launch()
  const ctx = await b.newContext(sz.opts)
  const p = await ctx.newPage()
  p.on('pageerror', e => log('PAGE ERROR', e.message))
  p.on('console', m => { if (m.type() === 'error') log('console error', m.text()) })
  await login(p)

  /* the Saturday holds one thing: Ranger's Training 08:00–17:00 on the programme, no OIL answer */
  await p.evaluate(() => {
    const w = window, d = w.DAYS[5]
    d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = []
    w.INPUTS.unshift({ iid: 'mk-train', person: 'bane', type: 'Training', date: 'Jul 18', yr: 2026, allday: false, s: 480, e: 1020, remarks: '', mod: 'now', acc: 'g' })
    w.afterSchedMutate()
  })
  await board(p, 5)
  await openChecks(p)
  const premise = await p.evaluate(() => {
    const w = window
    const del = document.querySelector('#schedBoard [data-grdel="5.0"]'), sec = del && del.closest('.sb-sec')
    const txt = sec ? sec.innerText + ' ' + [...sec.querySelectorAll('input,textarea')].map(i => i.value).join(' ') : ''
    return { dow: w.DAYS[5].dow, ground: (w.DAYS[5].ground || []).map(g => String(g.src || '')), training: /TRAINING/i.test(txt) && /08:00/.test(txt) && /17:00/.test(txt), ranger: /Ranger/.test(txt),
      checks: [...document.querySelectorAll('#schedBoard .sbwrap .wln')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()),
      open: (w.INPUTS.find(i => i.iid === 'mk-train') || {}).oil || null }
  })
  log('premise', JSON.stringify(premise))
  if (premise.dow !== 'Sat' && premise.dow !== 'Saturday') throw new Error('day 5 is not the Saturday')
  if (!premise.ground.includes('mk-train') || !premise.training || !premise.ranger) throw new Error('the Training row is not on the Saturday board')
  manifest.checks[sz.name + '-premise'] = premise
  await neutralTap(p)

  /* T0 — the premise on screen: the Saturday's Ground Programme holding only Ranger's Training */
  await p.evaluate(() => { const s = document.querySelector('#schedBoard [data-grdel="5.0"]').closest('.sb-sec'); s.setAttribute('data-mkgp', '1'); s.scrollIntoView({ block: 'center' }) })
  await p.waitForTimeout(300)
  await shot(p, sz, 't0-row', '[data-mkgp]', 6)
  await p.evaluate(() => { const s = document.querySelector('#schedBoard .sbwrap'); if (s) s.scrollIntoView({ block: 'start' }) })
  await p.waitForTimeout(300)
  /* T1 — today, before signing: the list of the day's checks */
  await shot(p, sz, 't1-checks', '#schedBoard .sbwrap', 10)

  /* A1 — the new line, in the app's own warning markup */
  await p.evaluate(W => {
    const vis = e => e.getBoundingClientRect().width > 0
    const wrap = [...document.querySelectorAll('#schedBoard .sbwrap')].find(vis)
    const wh = wrap.querySelector('.wh')
    wh.setAttribute('data-mkold', wh.innerHTML); wh.setAttribute('data-mkcls', wh.className)
    const shown = [...wrap.querySelectorAll('.wln')].filter(e => vis(e) && !e.classList.contains('ok') && !e.classList.contains('hid'))
    const n = shown.length + 1, nh = shown.filter(e => e.classList.contains('hard')).length + 1
    const car = wh.querySelector('.sbw-car')
    wh.className = 'wh hard'
    wh.innerHTML = (car ? car.outerHTML : '') + `<b>⚠ ${n} issue${n > 1 ? 's' : ''}</b> · ${nh} warning${nh > 1 ? 's' : ''}`
    wrap.querySelectorAll('.wln.ok').forEach(e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') })
    const row = document.createElement('div')
    row.className = 'wln hard'; row.setAttribute('data-mknew', '1')
    row.innerHTML = `<span class="wln-t">Ranger — ${W.a_line}</span><button class="wln-mute">✕</button><button class="wln-act">${W.a_btn}</button>`
    const first = wrap.querySelector('.wln'); first ? wrap.insertBefore(row, first) : wrap.appendChild(row)
  }, W)
  await tag(p, '#schedBoard [data-mknew]', 'New')
  await shot(p, sz, 'a1-checks', '#schedBoard .sbwrap', 12)
  await untag(p)
  await p.evaluate(() => {
    document.querySelectorAll('[data-mknew]').forEach(e => e.style.setProperty('display', 'none', 'important'))
    document.querySelectorAll('[data-mqhid]').forEach(e => e.style.removeProperty('display'))
    document.querySelectorAll('[data-mkold]').forEach(e => { e.innerHTML = e.getAttribute('data-mkold'); e.className = e.getAttribute('data-mkcls'); e.removeAttribute('data-mkold') })
  })

  /* sign the four, through the board's own boxes, then Publish day */
  const sels = p.locator('#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible')
  const ns = await sels.count()
  for (let i = 0; i < ns; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
  }
  log('signed boxes', ns)
  const beak = p.locator('#schedBoard [data-beak="5"]:visible').first()
  await beak.click()
  await p.waitForFunction(() => { const t = document.getElementById('toastEl'); return t && +getComputedStyle(t).opacity > 0.5 && /published/i.test(t.textContent || '') }, null, { timeout: 8000 })
  const note = await p.evaluate(() => document.getElementById('toastEl').textContent.trim())
  log('publish note', note)
  manifest.checks[sz.name + '-publishNote'] = note
  await p.evaluate(() => { const t = document.getElementById('toastEl'); t.style.transition = 'none'; t.style.opacity = '1' })
  /* T2 — today: the publish note */
  await shot(p, sz, 't2-note', '#toastEl', 10)
  /* A2 — the publish note's words after "published and approved" */
  await p.evaluate(W => {
    const t = document.getElementById('toastEl')
    t.setAttribute('data-mkold', t.innerHTML)
    const walk = document.createTreeWalker(t, NodeFilter.SHOW_TEXT)
    let n, done = false
    while ((n = walk.nextNode())) {
      if (!done && /published and approved/.test(n.nodeValue)) {
        /* the app's own join for a desk with no times names the day with its date: "Monday 13 Jul published and approved. …" */
        n.nodeValue = n.nodeValue.replace(/^(\w+) published and approved\.?/, '$1 18 Jul published and approved. ')
        const s = document.createElement('span'); s.setAttribute('data-mknew', '1'); s.textContent = W.a_note_tail
        n.parentNode.insertBefore(s, n.nextSibling); done = true
      }
    }
    if (!done) throw new Error('A2: no "published and approved" in the note')
  }, W)
  await tag(p, '#toastEl [data-mknew]', 'New')
  await shot(p, sz, 'a2-note', '#toastEl', 10)
  await untag(p)
  await p.evaluate(() => { const t = document.getElementById('toastEl'); t.innerHTML = t.getAttribute('data-mkold'); t.removeAttribute('data-mkold'); t.style.opacity = '0' })

  /* T3 — today, after publishing: the list of checks on the published day */
  await neutralTap(p)
  await openChecks(p)
  await shot(p, sz, 't3-checks-published', '#schedBoard .sbwrap', 10)
  {
    const s0 = (await p.locator('#schedBoard .sb-sign:visible').count()) ? '#schedBoard .sb-sign' : '#schedBoard [data-signbar]'
    try { await shot(p, sz, 't3b-sign-published', s0, 8) } catch (e) { log('t3b:', e.message) }
    manifest.checks[sz.name + '-signPublished'] = await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); return e ? e.innerText : null }, s0)
  }

  /* what an OIL answer given after publishing does to the published day — read through the probe bridge (a data check
     for the page's words, not a picture): the answer written as the list would write it, then taken off again */
  manifest.checks[sz.name + '-answerOnPublished'] = await p.evaluate(() => {
    const w = window, r = w.INPUTS.find(x => x.iid === 'mk-train')
    const look = () => ({ approved: w.dayApproved(5), unsigned: w.signMissing(5), pending: w.pendCount ? w.pendCount(5) : null })
    const before = look(); r.oil = { '2026-07-18': 1 }; w.afterSchedMutate(); const answered = look()
    delete r.oil; w.afterSchedMutate(); const back = look()
    return { before, answered, back }
  })
  log('answer on published', JSON.stringify(manifest.checks[sz.name + '-answerOnPublished']))

  /* B — the day's one list, by the door that opens it today: the input taken off the programme, the Original loaded back */
  const ri = await p.evaluate(() => window.DAYS[5].ground.findIndex(g => String(g.src) === 'mk-train'))
  const del = p.locator(`#schedBoard [data-grdel="5.${ri}"]`).first()
  await del.scrollIntoViewIfNeeded(); await del.click()
  await p.waitForFunction(() => window.INPUTS.find(x => x.iid === 'mk-train').acc !== 'g')
  await p.locator('#schedBoard [data-planmenu="5"]').first().click()
  const pv = p.locator('[data-planpv]').first()
  const ver = await pv.getAttribute('data-planpv')
  await pv.click()
  const load = p.locator(`#schedBoard button[data-restore="5"][data-rver="${ver}"]`).first()
  await load.click(); await p.waitForTimeout(200)
  if (await load.count()) await load.click()
  const win = p.locator('[data-testid="win-oilday"]')
  await win.waitFor({ timeout: 8000 })
  await p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.style.transition = 'none'; t.style.opacity = '0' } })
  await p.waitForTimeout(400)
  manifest.checks[sz.name + '-listToday'] = await win.evaluate(e => e.innerText)
  await shot(p, sz, 'b0-list-today', '[data-testid="win-oilday"]', 8)
  await p.evaluate(W => {
    const w = document.querySelector('[data-testid="win-oilday"]')
    const count = w.querySelector('.odl-count')
    const lead = document.createElement('p'); lead.className = 'odl-lead'; lead.setAttribute('data-mknew', 'lead'); lead.textContent = W.b_lead
    count.parentNode.insertBefore(lead, count)
    const left = w.querySelector('[data-testid="odl-left"]')
    left.setAttribute('data-mkold', left.textContent); left.textContent = W.b_foot; left.setAttribute('data-mknew', 'foot')
  }, W)
  await tag(p, '[data-mknew="lead"]', 'New')
  await tag(p, '[data-mknew="foot"]', 'New')
  await shot(p, sz, 'b1-list', '[data-testid="win-oilday"]', 8)
  await untag(p)
  await p.evaluate(() => {
    document.querySelectorAll('[data-mknew="lead"]').forEach(e => e.style.setProperty('display', 'none', 'important'))
    const f = document.querySelector('[data-mknew="foot"]'); if (f) { f.textContent = f.getAttribute('data-mkold') || ''; f.removeAttribute('data-mknew') }
  })
  /* what an answer does to the published day, pressed for real */
  const before = await p.evaluate(() => ({ approved: window.dayApproved(5), missing: window.signMissing(5), pending: window.pendDays ? window.pendDays() : null }))
  before.signLine = await p.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .sb-sign, #schedBoard [data-signbar]')].find(x => x.getBoundingClientRect().width > 0); return e ? e.innerText.split('\n').slice(-6).join(' | ') : null })
  await p.locator('[data-testid="odl-yes-mk-train"]').click()
  await p.locator('[data-testid="odl-save"]').click()
  await p.waitForTimeout(600)
  const after = await p.evaluate(() => ({ approved: window.dayApproved(5), missing: window.signMissing(5), pending: window.pendDays ? window.pendDays() : null, oil: window.INPUTS.find(x => x.iid === 'mk-train').oil }))
  /* the day's sign-off block after that answer, as the app draws it (what B's foot line has to say) */
  await p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.style.transition = 'none'; t.style.opacity = '0' } })
  await p.evaluate(() => { const s = [...document.querySelectorAll('#schedBoard .sb-sign, #schedBoard [data-signbar]')].find(e => e.getBoundingClientRect().width > 0); if (s) s.scrollIntoView({ block: 'center' }) })
  await p.waitForTimeout(300)
  const signSel = (await p.locator('#schedBoard .sb-sign:visible').count()) ? '#schedBoard .sb-sign' : '#schedBoard [data-signbar]'
  try { await shot(p, sz, 'b2-after-answer', signSel, 8) } catch (e) { log('b2:', e.message) }
  after.signText = await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); return e ? e.innerText : null }, signSel)
  manifest.checks[sz.name + '-answerAfterPublish'] = { before, after }
  log('answer after publish', JSON.stringify({ before, after }))

  /* A3 (desktop) — Edit Schedule's week list for the same Saturday, the same new line */
  if (key === 'd') {
    await p.evaluate(() => { const x = document.getElementById('sbDone'); if (x) x.click() })
    await p.waitForTimeout(400)
    await go(p, 'editsched')
    /* a fresh, unanswered copy of the premise for the week's list: the answer taken off again */
    await p.evaluate(() => { const r = window.INPUTS.find(x => x.iid === 'mk-train'); delete r.oil; window.afterSchedMutate() })
    await p.waitForTimeout(400)
    /* today the week draws NO checks box for this Saturday at all (a day with nothing to say has none): the box is
       cloned from another day's, opened, its one line replaced, and put where the app puts it — first in the day's body */
    const sat = await p.evaluate(() => {
      const sb = document.querySelector('#eWeek [data-signbar="5"]'), body = sb && sb.parentElement.querySelector('.day-body')
      return { body: !!body, box: !!document.querySelector('#eWeek [data-dwbox="5"]'), donor: !!document.querySelector('#eWeek [data-dwbox]') }
    })
    log('week Saturday', JSON.stringify(sat))
    manifest.checks['desktop-weekSaturday'] = sat
    if (sat.body && sat.donor) {
      await p.evaluate(() => {
        const sb = document.querySelector('#eWeek [data-signbar="5"]'); sb.parentElement.setAttribute('data-mksat', '1')
        sb.parentElement.scrollIntoView({ block: 'start', inline: 'center' })
      })
      await p.waitForTimeout(500)
      await shot(p, sz, 't4-week', '[data-mksat] [data-signbar="5"]', 8, '[data-mksat] .day-body > :first-child')
      await p.evaluate(W => {
        const day = document.querySelector('[data-mksat]'), body = day.querySelector('.day-body')
        const donor = document.querySelector('#eWeek [data-dwbox]')
        const box = donor.cloneNode(true)
        box.className = 'dwbox open'; box.setAttribute('data-dwbox', '5'); box.setAttribute('data-mknew', 'box')
        const head = box.querySelector('.daywarn'); head.setAttribute('data-daywarn', '5'); head.className = 'daywarn hard'
        head.innerHTML = `<b>⚠ 1 issue</b> · 1 warning<span class="dwcar">▲</span>`
        box.querySelectorAll('.dwlist').forEach(e => e.remove())
        const list = document.createElement('div'); list.className = 'dwlist'
        list.innerHTML = `<div class="witem hard" data-mknew="row"><span class="wbar"></span><span class="wtx"><span class="wcode">No OIL earned — an input has no OIL answer</span><b>Ranger</b> — ${W.a_line}</span><button class="witem-mute">✕</button><button class="witem-act">${W.a_btn}</button></div>`
        box.appendChild(list)
        body.insertBefore(box, body.firstChild)
      }, W)
      await tag(p, '[data-mknew="box"]', 'New')
      await shot(p, sz, 'a3-week', '[data-mksat] [data-signbar="5"]', 8, '[data-mknew="box"]')
      await untag(p)
    } else log('A3: no Saturday column or no other day box to copy')
  }
  await b.close()
}

for (const k of ['d', 'p']) { if (ONLY && !ONLY.includes(k)) continue; await run(k) }
/* a run of one size keeps the other size's frames and checks from an earlier run */
if (ONLY && existsSync(`${OUT}/manifest.json`)) {
  const old = JSON.parse(readFileSync(`${OUT}/manifest.json`, 'utf8'))
  const mine = new Set(ONLY.map(k => SIZES[k].name))
  manifest.frames = old.frames.filter(f => !mine.has(f.size)).concat(manifest.frames)
  for (const [k, v] of Object.entries(old.checks || {})) if (!(k in manifest.checks) && ![...mine].some(s => k.startsWith(s + '-'))) manifest.checks[k] = v
}
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2))
log('done')
