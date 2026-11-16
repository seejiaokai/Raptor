// Caps and ops limits — round 1 pictures (17 Nov 26, the night's job 1): the four points his D2084 left open, drawn on
// the REAL running app, today beside proposed, by .claude/skills/brainstorming/mockups-on-the-real-app.md.
// The kit (mark, hide, strip, checkTags, unclone) is round 3's of the multi-squadron design
// (docs/mock/2026-11-17-multi-sqn-r3/draw.mjs). Each "today" frame is the app as it draws itself; each "proposed" frame
// clones a real neighbour (marked data-mine) or hides an app node (display:none, never removed):
//   - every window is Week insights' own window (#insightModal: .modal-box, .modal-head, .itiles, .isec-h), opened by a
//     real press of Insights and re-lettered;
//   - the who-has-done-it list is the Quals page's own table (.qtbl, its group row and its rows, each man's CAT cell
//     taken from his own Quals row);
//   - the test's boxes are the app's window field (.mfield input); the CAPS / Ops limits switch is Quals' own
//     .segview; the on/off switch is the Logic page's (.lg-switch-read), lit as a live control;
//   - the schedule's advisory is the app's own amber look (a puck's "warn advf", the warning list's .witem.adv, cloned
//     from the real advisory line on the same day);
//   - the Logic card and its check are Logic's own .lggrp / .lgset / .lgchk.
// The words in the test's boxes are made up for the picture; they are not the squadron's real procedures.
//
// Run from raptor-port/, against a built preview already serving:  MQ_URL=http://localhost:4180/ node docs/mock/2026-11-17-caps-r1/draw.mjs
// MQ_ONLY=pic1,pic3 draws only those. Pictures and manifest.json go to docs/img/2026-11-17-caps-r1/.
// Demo data only; the squadron is the bare number 142.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
const OUT = 'docs/img/2026-11-17-caps-r1'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(OUT, { recursive: true })

const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const WEEK = 'Jul 13 – Jul 19'

const MARK_CSS = `
.mkq { outline: 2px solid #ff2d95 !important; outline-offset: -2px !important; }
.mkq.mkq-o { outline-offset: 2px !important; }
.mkq-tag { position: absolute; z-index: 60; background: #ff2d95; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; }
`
const TOAST_CSS = `.toast, .toasts, #toast, #toastEl { display: none !important; }`

function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.strip = root => {
    const A = ['id', 'data-person', 'data-q', 'data-testid', 'tabindex', 'data-wdi', 'data-wix', 'data-woff', 'data-lgkey', 'data-chk',
      'data-code', 'data-how', 'data-sort', 'data-page', 'data-daywarn', 'for', 'aria-controls']
    for (const n of [root, ...root.querySelectorAll('*')]) for (const a of A) n.removeAttribute(a)
    root.setAttribute('data-mine', '1')
    return root
  }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  mq.mark = (el, label, where = 'in') => {
    const b = el.getBoundingClientRect()
    if (getComputedStyle(el).position === 'static' && el.getAttribute('data-mine') === '1') el.style.position = 'relative'
    el.classList.add('mkq'); if (where !== 'in') el.classList.add('mkq-o')
    const t = document.createElement('span')
    t.className = 'mkq-tag'; t.textContent = label; t.setAttribute('data-mine', '1')
    const pos = getComputedStyle(el).position !== 'static'
    if (where === 'right' && pos) { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.left = 'calc(100% + 5px)'; el.appendChild(t) }
    else if (where === 'left' && pos) { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.right = 'calc(100% + 5px)'; el.appendChild(t) }
    else if (where === 'above' && pos) { t.style.bottom = 'calc(100% + 3px)'; t.style.right = '0'; el.appendChild(t) }
    else if (pos) { t.style.top = '1px'; t.style.right = '1px'; el.appendChild(t) }
    else el.insertBefore(t, el.firstChild)
    const a = el.getBoundingClientRect()
    if (!['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.5)) throw new Error('mark moved its element: ' + label)
    return true
  }
  // a tag placed by hand inside a container (made a place of its own), for marks whose own box clips, dims or is
  // covered by the tag: the outline still goes on the element, the tag sits where it covers nothing it is about
  mq.tagAt = (el, container, label, css) => {
    el.classList.add('mkq', 'mkq-o')
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative'
    const t = document.createElement('span'); t.className = 'mkq-tag'; t.textContent = label; t.setAttribute('data-mine', '1')
    Object.assign(t.style, css); container.appendChild(t)
    return t
  }
  mq.checkTags = () => {
    const bad = []
    for (const t of document.querySelectorAll('.mkq-tag')) {
      const r = t.getBoundingClientRect()
      if (!(r.width > 0)) { bad.push(t.textContent + ': not drawn'); continue }
      for (let a = t.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        const cs = getComputedStyle(a)
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
          const c = a.getBoundingClientRect()
          if (r.left < c.left - 0.5 || r.right > c.right + 0.5 || r.top < c.top - 0.5 || r.bottom > c.bottom + 0.5) bad.push(t.textContent + ': clipped by ' + (a.id || a.className))
        }
      }
    }
    return bad
  }
  window.__mq = mq
}

const manifest = {}
const notes = []
const errs = []
let browser

async function world(sz, who = 'ad') {
  const ctx = await browser.newContext(SIZES[sz].opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`); console.log('PAGEERROR', String(e)) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await page.waitForSelector('#luser')
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : who)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(700)
  await page.addStyleTag({ content: MARK_CSS + TOAST_CSS })
  return { ctx, page }
}
async function go(page, pg, sel) {
  await page.evaluate(p => window.go(p), pg)
  if (sel) await page.waitForSelector(sel)
  await page.waitForTimeout(900)
}
function rec(file, question, sz, kind, caption) { manifest[file] = { question, size: SIZES[sz].name, kind, caption } }
async function shot(page, file, clip, fullPage = false) {
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) throw new Error(file + ': ' + bad.join('; '))
  await page.mouse.move(Math.round(page.viewportSize().width / 2), 1)
  await page.waitForTimeout(120)
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}), fullPage })
  console.log('  wrote', file)
}
// two pictures one above the other, the lower one after a 16px gap in the page's dark, so the cut reads as a cut
function stitch(top, bottom, out) {
  const w = f => +execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width', '-of', 'csv=p=0', f]).toString().trim()
  const W = Math.max(w(top), w(bottom))
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', top, '-i', bottom, '-filter_complex',
    `[0]pad=${W}:ih:0:0:color=0x0B0D10[a];[1]pad=${W}:ih+32:0:32:color=0x0B0D10[b];[a][b]vstack=inputs=2`, out])
}
// a neutral tap so no control the drawn flow never touches is left focused (the method's trap)
async function settle(page) { await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() }) }

// The Quals page's table, its group row and every aircrew man's CAT cell, kept for the windows drawn later
async function grabQuals(page) {
  await go(page, 'quals', '#page-quals .qtbl')
  // the seat switch redraws the table after the click, so each seat is read in its own step
  await page.evaluate(() => { window.__qCat = {}; window.__qKind = {} })
  for (const [btn, kind] of [['#qViewP', 'pilot'], ['#qViewW', 'wso']]) {
    await page.click(btn); await page.waitForTimeout(500)
    await page.evaluate(kind => {
      for (const tr of document.querySelectorAll('#page-quals .qtbl tbody tr')) {
        const nm = tr.querySelector('td.qname')
        if (nm) { window.__qCat[nm.textContent.trim()] = tr.children[3].innerHTML; window.__qKind[nm.textContent.trim()] = kind }
      }
    }, kind)
  }
  await page.click('#qViewP'); await page.waitForTimeout(500)
  const n = await page.evaluate(() => {
    const pg = document.querySelector('#page-quals')
    const cat = window.__qCat, kinds = window.__qKind
    const tbl = pg.querySelector('.qtbl')
    window.__qT = tbl.cloneNode(false)
    window.__qHead = tbl.querySelector('thead tr').cloneNode(true)
    window.__qGrp = [...tbl.querySelectorAll('tbody tr')].find(r => !r.querySelector('td.qname')).cloneNode(true)
    window.__qRow = [...tbl.querySelectorAll('tbody tr')].find(r => r.querySelector('td.qname')).cloneNode(true)
    window.__qSeg = pg.querySelector('.segview').cloneNode(true)
    window.__qCat = cat; window.__qKind = kinds
    return Object.keys(cat).length
  })
  return n
}
async function grabSwitch(page) {
  await go(page, 'logic', '#page-logic .lggrp')
  await page.evaluate(() => {
    const m = document.querySelector('#page-logic .lgmix')
    window.__lgMix = m.cloneNode(true)
  })
}
async function openInsights(page, sz, member) {
  if (sz === 'd') await page.click('#insightBtn')
  else {
    const pg = member ? '#page-viewsched' : '#page-editsched'
    await page.click(`${pg} .schedule-morewrap button`)
    await page.waitForTimeout(300)
    await page.click(member ? '#viewSchedMoreInsights' : '#editSchedMoreInsights')
  }
  await page.waitForSelector('#insightModal .modal-box')
  await page.waitForTimeout(500)
}

// ---------- 1 (Q1): the test a man fills in — CAPS, checked, then submitted ----------
async function pic1(sz) {
  for (const stage of ['fill', 'checked']) {
    const { ctx, page } = await world(sz, 'us')
    await grabQuals(page)
    await go(page, 'viewsched', '#page-viewsched.on')
    await openInsights(page, sz, true)
    const info = await page.evaluate(({ stage, WEEK }) => {
      const mq = window.__mq, box = document.querySelector('#insightModal .modal-box'), head = box.querySelector('.modal-head b'), body = box.querySelector('#insightBody')
      head.textContent = 'CAPS · ' + WEEK
      ;[...body.children].forEach(c => mq.hide(c))
      const wrap = document.createElement('div'); wrap.setAttribute('data-mine', '1'); body.appendChild(wrap)
      const seg = mq.strip(window.__qSeg.cloneNode(true))
      const bs = [...seg.querySelectorAll('button')]; bs[0].textContent = 'CAPS'; bs[1].textContent = 'Ops limits'; bs[1].classList.remove('on'); bs.slice(2).forEach(b => b.remove())
      wrap.appendChild(seg)
      const field = v => { const f = document.createElement('div'); f.className = 'mfield'; f.style.margin = '0'; f.style.flex = '1 1 0'; f.style.minWidth = '0'; const i = document.createElement('input'); i.value = v; i.setAttribute('value', v); i.style.width = '100%'; i.style.boxSizing = 'border-box'; i.style.textTransform = 'uppercase'; f.appendChild(i); return f }
      const H = t => { const h = document.createElement('div'); h.className = 'isec-h'; h.textContent = t; wrap.appendChild(h); return h }
      const rows = []
      const R = (a, b, verdict) => {
        const r = document.createElement('div'); r.style.display = 'flex'; r.style.alignItems = 'center'; r.style.gap = '6px'; r.style.marginBottom = '6px'
        const fa = field(a), fb = field(b)
        const dash = document.createElement('span'); dash.textContent = '–'; dash.style.color = 'var(--ink-3)'
        r.append(fa, dash, fb); wrap.appendChild(r); rows.push(r)
        if (stage === 'checked' && verdict) {
          for (const f of [fa, fb]) f.querySelector('input').style.borderColor = verdict === 'ok' ? 'var(--ok)' : (f === fb ? 'var(--hard)' : 'var(--ok)')
        }
        return r
      }
      const h1 = H('Fire during start or ground operation')
      R('THROTTLES', 'OFF', 'ok'); R('JFS', 'OFF', 'ok'); const bad1 = R('FUEL MASTER', 'ON', 'bad')
      if (stage === 'fill') R('', '', null); else R('CANOPY', 'OPEN', 'ok')
      const h2 = H('Abort')
      R('THROTTLES', 'IDLE', 'ok'); R('HOOK', 'DOWN', 'ok')
      const h3 = H('Loss of brakes')
      R('BRAKES', 'RELEASE', 'ok'); const bad2 = R('ANTI-SKID', 'ON', 'bad')
      // the foot: what checking found, then Check answers and Submit — Submit lights only once every box is right
      const foot = document.createElement('div'); foot.style.display = 'flex'; foot.style.alignItems = 'center'; foot.style.gap = '8px'; foot.style.marginTop = '14px'
      const note = document.createElement('span'); note.style.fontSize = '12.5px'; note.style.marginRight = 'auto'
      // the count matches what is drawn: three headings, nine pairs, 18 boxes, one pair still empty
      if (stage === 'checked') { note.textContent = '2 answers to fix'; note.style.color = 'var(--hard)'; note.style.fontWeight = '600' }
      else { note.textContent = '16 of 18 boxes filled'; note.style.color = 'var(--ink-3)' }
      const chk = document.createElement('button'); chk.type = 'button'; chk.className = 'abtn'; chk.textContent = 'Check answers'
      const sub = document.createElement('button'); sub.type = 'button'; sub.className = 'abtn primary'; sub.textContent = 'Submit'; sub.disabled = true
      foot.append(note, chk, sub); wrap.appendChild(foot)
      // each tag sits where it covers nothing it points at: over the gap above a row (centred on its dash), above the
      // heading's right end, above a button from the foot (a disabled button would dim a tag inside it)
      foot.style.position = 'relative'
      if (stage === 'fill') {
        mq.mark(seg, '1a', 'right')
        mq.tagAt(h1, h1, '1b', { right: '0', bottom: 'calc(100% + 2px)' })
        mq.tagAt(rows[0], rows[0], '1c', { right: 'calc(50% - 12px)', top: '-11px' })
        mq.tagAt(chk, foot, '1d', { right: (sub.offsetWidth + 8 + chk.offsetWidth / 2 - 12) + 'px', bottom: 'calc(100% + 3px)' })
        mq.tagAt(sub, foot, '1e', { right: (sub.offsetWidth / 2 - 12) + 'px', bottom: 'calc(100% + 3px)' })
      } else {
        mq.tagAt(bad1, bad1, '1f', { right: 'calc(50% - 12px)', top: '-11px' })
        mq.tagAt(note, foot, '1g', { left: '0', bottom: 'calc(100% + 3px)' })
      }
      box.scrollTop = 0
      return { boxH: Math.round(box.getBoundingClientRect().height), scrollH: box.scrollHeight }
    }, { stage, WEEK })
    await settle(page)
    const clip = await page.evaluate(() => { const r = document.querySelector('#insightModal .modal-box').getBoundingClientRect(); return { x: Math.max(0, r.left - 12), y: Math.max(0, r.top - 12), width: Math.min(innerWidth, r.width + 24), height: Math.min(innerHeight - Math.max(0, r.top - 12), r.height + 24) } })
    const f = `1-test-${stage}-${sz}-proposed.png`
    await shot(page, f, clip)
    const words = {
      fill: 'Proposed, drawn in. The CAPS test as a window, laid out as his squadron\'s current page is: two tabs, CAPS and Ops limits (1a), each procedure\'s heading (1b), each step a pair of boxes typed from memory (1c), then "Check answers" (1d) and "Submit" (1e), dimmed and not pressable until every box is right. Three headings are drawn; the real test has more, further down the same window. The words in the boxes are made up for the picture.',
      checked: 'Proposed, drawn in. After "Check answers": a wrong box is edged red (1f), right ones green, and the foot says how many are left to fix (1g); nothing gives away the right answer. Submit can be pressed once all are right.',
    }
    rec(f, 'Q1', sz, 'proposed', words[stage] + ' (Signed in as Ranger, a member.)')
    notes.push(`pic1 ${stage} ${sz}: ${JSON.stringify(info)}`)
    await ctx.close()
  }
}

// ---------- 2 (Q6): where a man opens it — beside Insights ----------
async function pic2(sz) {
  // the desktop is drawn twice: a member's View-only Sched, and a scheduler's Edit Schedule at 1536 wide (the crowded
  // bar: Undo, Redo, the changes clock). Insights stays beside the bell, as the rulings place it; CAPS goes after it.
  const who = sz === 'd' ? ['us', 'ad'] : ['us']
  for (const w of who) for (const kind of ['today', 'proposed']) {
    const { ctx, page } = await world(sz, w)
    if (w === 'ad') await go(page, 'editsched', '#page-editsched.on #eWeek .day')
    let clip
    if (sz === 'd') {
      await page.evaluate(kind => {
        const mq = window.__mq, ins = document.querySelector('#insightBtn')
        if (kind === 'proposed') {
          const b = mq.strip(ins.cloneNode(true)); b.textContent = 'CAPS'; b.title = 'CAPS and Ops limits'; ins.after(b)
          mq.tagAt(b, b, '6a', { left: 'calc(50% - 11px)', top: 'calc(100% + 3px)' })
        }
      }, kind)
      clip = await page.evaluate(() => { const t = document.querySelector('.topbar').getBoundingClientRect(); return { x: 0, y: 0, width: innerWidth, height: Math.round(t.bottom) + 22 } })
    } else {
      await page.click('#page-viewsched .schedule-morewrap button'); await page.waitForTimeout(400)
      await page.evaluate(kind => {
        const mq = window.__mq, it = document.querySelector('#viewSchedMoreInsights')
        if (kind === 'proposed') { const b = mq.strip(it.cloneNode(true)); b.textContent = 'CAPS and Ops limits'; it.after(b); mq.mark(b, '6b', 'in') }
      }, kind)
      clip = await page.evaluate(() => { const m = document.querySelector('#viewSchedMoreMenu').getBoundingClientRect(); return { x: 0, y: 0, width: innerWidth, height: Math.round(m.bottom) + 40 } })
    }
    const f = w === 'ad' ? `6-door-sched-${sz}-${kind}.png` : `6-door-${sz}-${kind}.png`
    await shot(page, f, clip)
    const words = {
      'us-d-today': 'Real. A member\'s top bar on a desktop (View-only Sched): Insights stands beside the bell.',
      'us-d-proposed': 'Proposed, drawn in. A "CAPS" button after Insights (6a), in its look, so Insights keeps its place beside the bell. A member opens his own tests with it; a scheduler also sees who has done them (Q2).',
      'ad-d-today': 'Real. A scheduler\'s top bar on Edit Schedule at 1536 wide, the most crowded bar: the page names, Undo, Redo, the changes clock, the sync dot, the bell and Insights.',
      'ad-d-proposed': 'Proposed, drawn in. The same bar with "CAPS" after Insights (6a): it still fits on one row at 1536 wide.',
      'us-p-today': 'Real. A member\'s phone: the schedule\'s ⋯ menu holds Insights.',
      'us-p-proposed': 'Proposed, drawn in. "CAPS and Ops limits" joins Insights in the same menu (6b). The bell line that opens the test is not drawn: the demo has no bell lines to copy.',
    }
    rec(f, 'Q6', sz, kind, words[`${w}-${sz}-${kind}`])
    if (w === 'ad') notes.push(`pic2 ad ${kind}: bar rows ${await page.evaluate(() => { const t = document.querySelector('.topbar'); return Math.round(t.getBoundingClientRect().height) + 'px; ins ' + Math.round(document.querySelector('#insightBtn').getBoundingClientRect().top) })}`)
    await ctx.close()
  }
}

// the who-has-done-it window, as a scheduler sees it — shared by pictures 3 and 5
async function doneWindow(page, sz, mode) {
  const all = page.locator('#insightBody button', { hasText: 'Show all' }).first()
  if (await all.count()) { await all.click(); await page.waitForTimeout(400) }
  return page.evaluate(({ mode, WEEK, narrow }) => {
    const mq = window.__mq, box = document.querySelector('#insightModal .modal-box'), head = box.querySelector('.modal-head'), body = box.querySelector('#insightBody')
    // the week's flyers, read off the real Week insights list before it is hidden ("Flying load · sorties this week")
    // (only that section: the work-hours section below it lists everyone; "Show all" was pressed first)
    const flyers = []
    let inFly = false
    for (const el of body.querySelectorAll('.isec-h, .ibar')) {
      if (el.classList.contains('isec-h')) { inFly = /Flying load/i.test(el.textContent); continue }
      if (inFly) { const nm = el.querySelector('.nm'); if (nm && !flyers.includes(nm.textContent.trim())) flyers.push(nm.textContent.trim()) }
    }
    const tiles = body.querySelector('.itiles')
    const flyingN = +([...tiles.querySelectorAll('.itile')].find(t => /Aircrew flying/i.test(t.textContent))?.querySelector('.n').textContent || 0)
    head.querySelector('b').textContent = 'CAPS and Ops limits · ' + WEEK
    ;[...body.children].forEach(c => mq.hide(c))
    const wrap = document.createElement('div'); wrap.setAttribute('data-mine', '1'); body.appendChild(wrap)
    const cat = window.__qCat, all = Object.keys(cat)
    const total = all.length
    // One set of people for the whole page (made up for the pictures, real flyers of this demo week): Blade (Q4's
    // example, flies Thursday) and Relay (Q5's excused man) have not done CAPS, with two more spread down the list;
    // one man further down the flying list has Ops limits run out (not in the nine rows drawn); every date shown sits inside its period (CAPS this week from the Saturday
    // before, Ops limits this month).
    const fly = flyers.filter(n => cat[n])
    const pick = ['Blade', 'Relay', fly[2], fly[6], fly[11]].filter((n, i, a) => n && fly.includes(n) && a.indexOf(n) === i).slice(0, 4)
    const notDone = new Set(pick)
    const doneFly = fly.filter(n => !notDone.has(n))
    const opsOut = fly.includes('Warden') && !notDone.has('Warden') ? 'Warden' : doneFly[3]
    const offWeek = mode === 'person' ? (notDone.has('Relay') ? 'Relay' : pick[1]) : null
    const weekOff = mode === 'week'
    const flyDone = flyingN - notDone.size
    const open = notDone.size - (offWeek ? 1 : 0)
    const amber = on => on && !weekOff
    // tiles: Insights' own
    const t2 = mq.strip(tiles.cloneNode(true)); t2.style.removeProperty('display')
    const tl = [...t2.querySelectorAll('.itile')]
    // the "not done" figure in the advisory's amber, never the red of a hard warning: it stops nothing; grey while
    // the whole week's check is off
    const setT = (t, n, l, am) => { t.querySelector('.n').textContent = n; t.querySelector('.l').textContent = l; t.classList.remove('hard'); t.querySelector('.n').style.color = am ? (weekOff ? 'var(--ink-3)' : 'var(--adv)') : '' }
    setT(tl[0], `${flyDone} of ${flyingN}`, 'Flying, CAPS done'); setT(tl[1], `${total - 9} of ${total}`, 'All aircrew, CAPS done')
    setT(tl[2], `${total - 4} of ${total}`, 'Ops limits in date'); setT(tl[3], String(open), 'Flying, not done', true)
    wrap.appendChild(t2)
    // the table: the Quals page's own; on a phone without the CAT column, so it fits the window's width
    const cols = narrow ? [0, 4, 5, 6] : [0, 3, 4, 5, 6]
    const C = cols.length
    const tbl = mq.strip(window.__qT.cloneNode(false)); tbl.style.minWidth = '0'; tbl.style.width = '100%'; tbl.style.marginTop = '12px'
    const th = document.createElement('thead'); const hr = mq.strip(window.__qHead.cloneNode(true))
    const ths = [...hr.children]
    const keep = cols.map(i => ths[i])
    ths.forEach(t => { if (!keep.includes(t)) t.remove() })
    const labels = narrow ? ['Callsign', 'CAPS', 'Ops limits', 'Check'] : ['Callsign', 'Cat', 'CAPS', 'Ops limits', 'Check']
    keep.forEach((t, i) => { t.textContent = labels[i]; t.className = ''; t.style.position = 'static' })
    th.appendChild(hr); tbl.appendChild(th)
    const tb = document.createElement('tbody'); tbl.appendChild(tb)
    const grp = t => { const g = mq.strip(window.__qGrp.cloneNode(true)); const c = g.querySelector('td, th'); c.textContent = t; c.colSpan = C; [...g.children].slice(1).forEach(x => x.remove()); tb.appendChild(g); return g }
    const sw = on => { const m = mq.strip(window.__lgMix.cloneNode(true)); const s = m.querySelector('.lg-switch-read'); s.classList.toggle('on', on); s.style.opacity = '1'; s.setAttribute('aria-checked', String(on)); s.removeAttribute('aria-disabled'); m.lastChild.textContent = on ? 'On' : 'Off'; m.style.display = 'inline-flex'; m.style.alignItems = 'center'; m.style.gap = '6px'; return m }
    const rowsBy = {}
    const row = (name, caps, ops, on) => {
      const r = mq.strip(window.__qRow.cloneNode(true)); const tds = [...r.children]
      const keepTd = cols.map(i => tds[i]); tds.forEach(t => { if (!keepTd.includes(t)) t.remove() })
      keepTd[0].textContent = name; keepTd[0].style.position = 'static'; keepTd[0].style.textAlign = 'left'
      if (!narrow) keepTd[1].innerHTML = cat[name] || ''
      const k = narrow ? 1 : 2
      const cell = (td, v) => {
        td.className = 'qcell'; td.innerHTML = ''
        if (v === null || v === 'out') { td.textContent = v === null ? 'Not done' : 'Out of date'; td.style.color = amber(true) ? 'var(--adv)' : 'var(--ink-3)'; td.style.fontWeight = '600' }
        else if (v === 'off') { td.textContent = 'Not checked'; td.style.color = 'var(--ink-3)' }
        else { const s = document.createElement('span'); s.className = 'qchk'; s.textContent = '✓'; s.style.color = 'var(--ok)'; td.append(s, ' ' + v) }
      }
      cell(keepTd[k], caps); cell(keepTd[k + 1], ops)
      keepTd[k + 2].className = ''; keepTd[k + 2].innerHTML = ''; keepTd[k + 2].appendChild(sw(on))
      tb.appendChild(r); rowsBy[name] = r; return r
    }
    const gF = grp(`Flying this week · ${flyingN}`)
    const order = [...pick, ...doneFly].slice(0, 9)
    const capsDates = ['Mon 13', 'Sat 11', 'Sun 12', 'Mon 13', 'Sat 11']
    const opsDates = ['2 Jul', '4 Jul', '1 Jul', '6 Jul', '3 Jul', '8 Jul', '5 Jul', '1 Jul', '7 Jul']
    order.forEach((n, i) => {
      const off = n === offWeek
      row(n, off ? 'off' : notDone.has(n) ? null : capsDates[i % capsDates.length], off ? 'off' : n === opsOut ? 'out' : opsDates[i % opsDates.length], !off)
    })
    const more = document.createElement('tr'); more.setAttribute('data-mine', '1'); const mc = document.createElement('td'); mc.colSpan = C; mc.style.textAlign = 'left'
    const mb = document.createElement('button'); mb.type = 'button'; mb.className = 'abtn'; mb.textContent = `Show all ${flyingN} ↓`; mc.appendChild(mb); more.appendChild(mc); tb.appendChild(more)
    const gN = grp(`Not flying this week · ${all.filter(n => !flyers.includes(n)).length}`)
    const rest = all.filter(n => !flyers.includes(n)).slice(0, 2)
    rest.forEach((n, i) => row(n, i ? null : 'Sun 12', i ? '9 Jul' : '3 Jul', true))
    wrap.appendChild(tbl)
    // mode 'week': the other way — one switch for the whole week, at the top of the window
    let weekSw = null
    if (weekOff) {
      weekSw = sw(false); weekSw.lastChild.textContent = 'Check this week: Off'; weekSw.style.fontSize = '13px'; weekSw.style.color = 'var(--ink-2)'; weekSw.style.marginBottom = '12px'
      weekSw.style.position = 'relative'; weekSw.style.paddingRight = '34px'
      wrap.insertBefore(weekSw, wrap.firstChild)
      // with the week's check off, the per-man column goes and nothing is amber: every row reads as it is, nothing warns
      tbl.querySelectorAll('tr').forEach(r => { const c = r.children[C - 1]; if (c && r.children.length === C) mq.hide(c) })
      gF.firstElementChild.colSpan = C - 1; gN.firstElementChild.colSpan = C - 1; mc.colSpan = C - 1
    }
    box.scrollTop = 0
    return { flyingN, total, flyersSeen: flyers.length, flyInQuals: fly.length, notDoneShown: pick, opsOut, offWeek, blade: fly.includes('Blade'), relay: fly.includes('Relay'), rows: Object.keys(rowsBy).length, weekSw: !!weekSw, tilesN: tl.length }
  }, { mode, WEEK, narrow: sz === 'p' })
}

// ---------- 3 (Q2): who must do it, and the one button's list — flyers first ----------
async function pic3(sz) {
  const { ctx, page } = await world(sz, 'ad')
  await grabQuals(page); await grabSwitch(page)
  await go(page, 'editsched', '#page-editsched.on #eWeek .day')
  await openInsights(page, sz, false)
  const info = await doneWindow(page, sz, 'plain')
  await page.evaluate(() => {
    const mq = window.__mq, box = document.querySelector('#insightModal .modal-box')
    const tiles = box.querySelector('[data-mine] .itiles'); mq.mark(tiles, '2a', 'in')
    // the group rows' tags hang at their right end, clear of their words; "Not done"'s tag straddles its cell's top edge
    const rel = e => { if (getComputedStyle(e).position === 'static') e.style.position = 'relative'; return e }
    const g = [...box.querySelectorAll('[data-mine] tbody tr')][0]; mq.mark(rel(g.firstElementChild), '2b', 'in')
    const nd = [...box.querySelectorAll('[data-mine] td.qcell')].find(td => /Not done/.test(td.textContent)); mq.tagAt(nd, rel(nd), '2c', { right: '2px', top: '-8px' })
    const g2 = [...box.querySelectorAll('[data-mine] tbody tr')].find(r => /Not flying/.test(r.textContent)); mq.mark(rel(g2.firstElementChild), '2d', 'in')
  })
  await settle(page)
  const clip = await page.evaluate(() => { const r = document.querySelector('#insightModal .modal-box').getBoundingClientRect(); return { x: Math.max(0, r.left - 12), y: Math.max(0, r.top - 12), width: Math.min(innerWidth, r.width + 24), height: Math.min(innerHeight - Math.max(0, r.top - 12), r.height + 24) } })
  const f = `2-who-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'Q2', sz, 'proposed', `Proposed, drawn in. What a scheduler sees on pressing "CAPS": the week's figures (2a); the people who fly this week first (2b), those not done at the top in amber, "Not done" (2c); then everyone else on the Quals page, under "Not flying this week" (2d). Each man's two tests and the check's switch (Q5) on his row; the four whose Ops limits have run out (the third figure) sit further down, out of this picture. The flyers are the real ones of this demo week (${info.flyingN} flying, ${info.total} pilots and WSOs on the Quals page); who has not done it is made up for the picture.${sz === 'p' ? ' On a phone the CAT column is left out so the table fits.' : ''}`)
  notes.push(`pic3 ${sz}: ${JSON.stringify(info)}`)
  await ctx.close()
}

// ---------- 5 (Q5): what the switch turns off — one man for the week, or the whole week ----------
async function pic5(sz) {
  for (const mode of ['person', 'week']) {
    const { ctx, page } = await world(sz, 'ad')
    await grabQuals(page); await grabSwitch(page)
    await go(page, 'editsched', '#page-editsched.on #eWeek .day')
    await openInsights(page, sz, false)
    const info = await doneWindow(page, sz, mode)
    await page.evaluate(({ mode, off }) => {
      const mq = window.__mq, box = document.querySelector('#insightModal .modal-box')
      if (mode === 'person') {
        const r = [...box.querySelectorAll('[data-mine] tbody tr')].find(r => r.children[0] && r.children[0].textContent === off)
        r.scrollIntoView({ block: 'center' })
        const C = r.children.length, sw = r.children[C - 1], caps = r.children[C - 3]
        for (const c of [sw, caps]) if (getComputedStyle(c).position === 'static') c.style.position = 'relative'
        // tags straddle each cell's top edge, so neither covers "Off" nor "Not checked"
        mq.tagAt(sw, sw, '5a', { right: '2px', top: '-8px' }); mq.tagAt(caps, caps, '5b', { right: '2px', top: '-8px' })
      } else {
        const s = box.querySelector('#insightBody > [data-mine] > [data-mine]'); mq.mark(s, '5c', 'in')
      }
    }, { mode, off: info.offWeek })
    await settle(page)
    const clip = await page.evaluate(() => { const r = document.querySelector('#insightModal .modal-box').getBoundingClientRect(); return { x: Math.max(0, r.left - 12), y: Math.max(0, r.top - 12), width: Math.min(innerWidth, r.width + 24), height: Math.min(innerHeight - Math.max(0, r.top - 12), Math.min(r.height, 520) + 24) } })
    const f = `5-switch-${mode}-${sz}-proposed.png`
    await shot(page, f, clip)
    const words = {
      person: `Recommended, drawn in. The switch on one man's row (5a), here ${info.offWeek}, who did this week's CAPS on paper, set off for this week: his row reads "Not checked" (5b), he raises nothing on the schedule, the "Flying, not done" figure drops by one, and next week his check is on again by itself.${sz === 'p' ? ' On a phone the CAT column is left out so the table fits.' : ''}`,
      week: 'The other way, drawn in. One switch for the whole week at the top of the window (5c), "Check this week: Off": nobody is checked that week (a stand-down, a holiday week); the rows lose their own switch and nothing is amber.',
    }
    rec(f, 'Q5', sz, 'proposed', words[mode])
    notes.push(`pic5 ${mode} ${sz}: ${JSON.stringify(info)}`)
    await ctx.close()
  }
}

// ---------- 4 (Q4): a flyer who has not done it, on the schedule — Thursday, the demo week's last flying day ----------
async function pic4(sz) {
  for (const kind of ['today', 'proposed']) {
    const { ctx, page } = await world(sz, 'ad')
    await go(page, 'editsched', '#page-editsched.on #eWeek .day')
    const info = await page.evaluate(kind => {
      const mq = window.__mq
      const days = [...document.querySelectorAll('#eWeek > .day')].filter(d => !d.classList.contains('peek'))
      const fri = days[3]
      // the week is a sideways scroller: bring Thursday to the front, as the › arrow would
      const wk = document.querySelector('#eWeek'); wk.scrollLeft += fri.getBoundingClientRect().left - wk.getBoundingClientRect().left
      window.scrollTo(0, 0)
      return { head: fri.querySelector('.daywarn').textContent.trim() }
    }, kind)
    // the week glides there smoothly; the list is opened only once it has landed
    await page.waitForTimeout(900)
    await page.evaluate(() => { const days = [...document.querySelectorAll('#eWeek > .day')].filter(d => !d.classList.contains('peek')); days[3].querySelector('.daywarn').click() })
    await page.waitForTimeout(700)
    const res = await page.evaluate(kind => {
      const mq = window.__mq
      const days = [...document.querySelectorAll('#eWeek > .day')].filter(d => !d.classList.contains('peek'))
      const fri = days[3]
      const dw = fri.querySelector('.daywarn'), list = fri.querySelector('.dwlist')
      // the first clean puck in the day's first flying wave
      const go = fri.querySelector('.go')
      const pucks = [...go.querySelectorAll('.puck')]
      const pk = pucks.find(p => !p.classList.contains('warn') && p.querySelector('.nm') && mq.vis(p))
      if (!pk || !list) return { err: 'no puck or list', pk: !!pk, list: !!list, n: pucks.length, cls: [...new Set(pucks.map(p => p.className))].slice(0, 8) }
      const name = pk.querySelector('.nm').textContent.trim()
      const out = { name, headBefore: dw.textContent.trim() }
      if (kind === 'proposed') {
        // his puck: the app's own amber advisory look, as a real advisory puck wears it
        const adv = document.querySelector('#eWeek .puck.warn.advf')
        out.advClass = adv ? adv.className : null
        out.warnCls = [...new Set([...document.querySelectorAll('#eWeek .puck.warn')].map(p => p.className))].slice(0, 10)
        // the amber advisory puck's own classes, as the real ones on this week wear them ("puck … warn")
        pk.classList.add('warn'); pk.classList.remove('dim')
        const real = list.querySelector('.witem.adv') || list.querySelector('.witem')
        out.realItem = real.outerHTML.slice(0, 400)
        out.items = { hard: list.querySelectorAll('.witem.hard').length, adv: list.querySelectorAll('.witem.adv').length, all: list.querySelectorAll('.witem').length }
        const w = mq.strip(real.cloneNode(true)); w.className = 'witem adv'
        w.querySelector('.wtx').innerHTML = ''
        const code = document.createElement('span'); code.className = 'wcode'; code.textContent = 'CAPS not done'
        const b = document.createElement('b'); b.textContent = name
        // written to read on its own, as every warning does (D2045): who, what, when he flies
        // (his line, VL with take-off 12:45, is read off this demo day's wave 1; the week is drawn in divs, not a table)
        w.querySelector('.wtx').append(code, b, ' — CAPS not done: this week\'s test not submitted, flies VL (T/O 12:45)')
        real.after(w)
        // the day's issues count rises by one; "warnings" counts the red lines, and an amber advisory is not one
        const tw = document.createTreeWalker(dw, NodeFilter.SHOW_TEXT), texts = []
        while (tw.nextNode()) texts.push(tw.currentNode)
        for (const n of texts) n.textContent = n.textContent.replace(/(\d+) issues?/, (_, d) => `${+d + 1} issues`)
        if (getComputedStyle(dw).position === 'static') dw.style.position = 'relative'
        // the puck clips its own content, so its tag hangs in the seat cell, just left of the puck
        pk.classList.add('mkq', 'mkq-o')
        const cellEl = pk.parentElement; if (getComputedStyle(cellEl).position === 'static') cellEl.style.position = 'relative'
        const t4 = document.createElement('span'); t4.className = 'mkq-tag'; t4.textContent = '4a'; t4.setAttribute('data-mine', '1')
        const pr = pk.getBoundingClientRect(), cr = cellEl.getBoundingClientRect()
        t4.style.left = (pr.left - cr.left - 2) + 'px'; t4.style.top = (pr.top - cr.top - 15) + 'px'
        cellEl.appendChild(t4)
        mq.mark(w, '4b', 'in'); mq.mark(dw, '4c', 'in')
        // move the two in-box tags off the line's ✕ and the list's caret
        w.querySelector(':scope > .mkq-tag').style.right = '40px'; dw.querySelector(':scope > .mkq-tag').style.right = '34px'
      }
      out.headAfter = dw.textContent.trim()
      return out
    }, kind)
    await settle(page)
    // Two crops of the same day, stitched with a thin gap: the warning list at the day's head, then his puck in its wave
    // far below (the Common Programme lies between). A whole-page picture would reset the week's sideways scroll.
    const crop = async which => page.evaluate(which => {
      const days = [...document.querySelectorAll('#eWeek > .day')].filter(d => !d.classList.contains('peek'))
      const day = days[3], dw = day.querySelector('.daywarn'), list = day.querySelector('.dwlist')
      const pk = day.querySelector('.go .puck.mkq') || [...day.querySelectorAll('.go .puck')].find(p => p.querySelector('.nm') && p.querySelector('.nm').textContent.trim() === window.__pk4)
      const a = day.getBoundingClientRect()
      let top, bot
      if (which === 'list') { dw.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70); top = dw.getBoundingClientRect().top - 8; bot = list.getBoundingClientRect().bottom + 8 }
      else { pk.scrollIntoView({ block: 'center' }); const p = pk.getBoundingClientRect(); top = p.top - 120; bot = p.bottom + 70 }
      const x = Math.max(0, a.left - 6)
      return { x, y: Math.max(0, top), width: Math.min(innerWidth - x, a.width + 12), height: Math.min(innerHeight - Math.max(0, top), bot - Math.max(0, top)) }
    }, which)
    await page.evaluate(n => { window.__pk4 = n }, res.name)
    const f = `4-sched-${sz}-${kind}.png`
    const tmpA = `${OUT}/_a.png`, tmpB = `${OUT}/_b.png`
    const c1 = await crop('list'); await page.waitForTimeout(250); await shot(page, '_a.png', c1)
    const c2 = await crop('puck'); await page.waitForTimeout(250); await shot(page, '_b.png', c2)
    stitch(tmpA, tmpB, `${OUT}/${f}`); unlinkSync(tmpA); unlinkSync(tmpB)
    console.log('  wrote', f, '(stitched)')
    const words = {
      today: `Real. Thursday on Edit Schedule, its warning list open: today the app knows nothing of CAPS, so ${res.name} flies with no mark.`,
      proposed: `Recommended, drawn in. ${res.name} has not done this week's CAPS: his puck wears the app's amber advisory ring (4a), the warning list gains an amber line, "CAPS not done" (4b), and the day's issues count goes from 6 to 7 (4c); the red warnings stay at 3. Amber is the app's "have a look" colour: it never stops a publish.`,
    }
    rec(f, 'Q4', sz, kind, words[kind])
    notes.push(`pic4 ${kind} ${sz}: ${JSON.stringify({ ...info, ...res })}`)
    await ctx.close()
  }
}

// ---------- 6 (Q3): how often each test clears, on the Logic page ----------
async function pic6(sz) {
  for (const kind of ['today', 'proposed']) {
    const { ctx, page } = await world(sz, 'ad')
    await go(page, 'logic', '#page-logic .lggrp')
    const info = await page.evaluate(kind => {
      const mq = window.__mq, pg = document.querySelector('#page-logic')
      const ins = [...pg.querySelectorAll('#lgSettings .lggrp')].find(s => /Insights/.test(s.querySelector('h3').textContent))
      const out = {}
      let card = null
      if (kind === 'proposed') {
        card = mq.strip(ins.cloneNode(true)); card.querySelector('h3').textContent = 'CAPS and Ops limits'
        const tmpl = [...pg.querySelectorAll('#lgSettings .lgset')].find(r => r.querySelector('.lgv .val'))
        const setRow = mq.strip(card.querySelector('.lgset'))
        const mk = (nm, val, why) => { const r = mq.strip(tmpl.cloneNode(true)); r.querySelector('.lgnm').textContent = nm; r.querySelector('.lgv').innerHTML = '<span class="val"></span>'; r.querySelector('.val').textContent = val; r.querySelector('.lgwhy').textContent = why; return r }
        const r1 = mk('CAPS', 'Every week', 'Clears every Monday. A test done from the Saturday before counts for the coming week.')
        const r2 = mk('Ops limits', 'Every month', 'Runs out on the 1st of each month.')
        setRow.querySelector('.lgnm').textContent = 'Check on the schedule'
        const s = setRow.querySelector('.lg-switch-read'); s.classList.add('on'); s.setAttribute('aria-checked', 'true'); setRow.querySelector('.lgmix').lastChild.textContent = 'On'
        setRow.querySelector('.lgwhy').textContent = 'A man in a flying seat shows an amber advisory: "CAPS not done", or "Ops limits out of date".'
        card.insertBefore(r1, setRow); card.insertBefore(r2, setRow)
        ins.after(card)
        // a word value, not a number: its box takes the words' width; each value box gets a place so its tag hangs left of it
        for (const r of [r1, r2]) { const v = r.querySelector('.lgv'), val = r.querySelector('.val'); for (const e of [v, val]) { e.style.width = 'auto'; e.style.minWidth = '0'; e.style.maxWidth = 'none'; e.style.whiteSpace = 'nowrap'; e.style.overflow = 'visible' } }
        for (const r of [r1, r2, setRow]) { const v = r.querySelector('.lgv'); if (getComputedStyle(v).position === 'static') v.style.position = 'relative' }
        // each tag sits above the right end of its value, covering none of the row's words
        mq.mark(r1.querySelector('.lgv'), '3a', 'above'); mq.mark(r2.querySelector('.lgv'), '3b', 'above'); mq.mark(setRow.querySelector('.lgv'), '3c', 'above')
        // The checks: an amber check of its own, Logic's own advisory row
        const advChk = pg.querySelector('#lgChecks .lgchk.adv') || [...pg.querySelectorAll('#lgChecks .lgchk')].find(c => !c.classList.contains('hard'))
        out.advChk = advChk ? advChk.className : null
        const c = mq.strip(advChk.cloneNode(true)); c.querySelector('.lgnm').innerHTML = '<span class="lgsr">Advisory: </span>CAPS not done · Ops limits out of date'
        c.querySelector('.lgwhy').textContent = 'A man in a flying seat whose CAPS for this week is not done, or whose Ops limits have run out, unless his check is switched off for the week. Each says which.'
        c.querySelectorAll('details').forEach(d => d.remove())
        // a group of its own at the end of The checks, named as the settings card is (it is no crew-rest check)
        const grpEl = advChk.closest('.lggrp'), lastGrp = [...pg.querySelectorAll('#lgChecks .lggrp')].pop()
        const g = mq.strip(grpEl.cloneNode(false)); const h = mq.strip(grpEl.querySelector('h3').cloneNode(true)); h.textContent = 'CAPS and Ops limits'
        g.append(h, c); lastGrp.after(g)
        out.chkGroup = 'own group after ' + lastGrp.querySelector('h3').textContent
        mq.mark(c, '4d', 'in')
      }
      const target = card || ins
      target.scrollIntoView({ block: 'center' })
      return out
    }, kind)
    await page.waitForTimeout(300)
    await settle(page)
    const clip = await page.evaluate(kind => {
      const pg = document.querySelector('#page-logic')
      const ins = [...pg.querySelectorAll('#lgSettings .lggrp')].find(s => /Insights/.test(s.querySelector('h3').textContent))
      const card = pg.querySelector('#lgSettings .lggrp[data-mine]') || ins
      const cols = ins.parentElement.getBoundingClientRect()
      const top = Math.min(ins.getBoundingClientRect().top, card.getBoundingClientRect().top) - 60
      const bot = Math.max(ins.getBoundingClientRect().bottom, card.getBoundingClientRect().bottom) + 14
      const x = Math.max(0, cols.left - 8)
      return { x, y: Math.max(0, top) + scrollY, width: Math.min(innerWidth - x, cols.width + 16), height: bot - Math.max(0, top) }
    }, kind)
    const f = `3-logic-${sz}-${kind}.png`
    await shot(page, f, clip, true)
    const words = {
      today: 'Real. The end of the Logic page\'s settings, a scheduler\'s view.',
      proposed: 'Proposed, drawn in. A "CAPS and Ops limits" card: how often CAPS clears (3a, every week, as you ruled), how often Ops limits runs out (3b, the question; every month drawn), and the schedule check\'s switch (3c), which turns the check off for the whole squadron. Values change with Logic\'s own Edit, as every setting does.',
    }
    rec(f, 'Q3', sz, kind, words[kind])
    if (kind === 'proposed') {
      // the check itself, in Logic's list of checks
      const clip2 = await page.evaluate(() => {
        const c = document.querySelector('#lgChecks .lgchk[data-mine]'); c.scrollIntoView({ block: 'center' })
        const g = c.closest('.lggrp').getBoundingClientRect(), r = c.getBoundingClientRect()
        const x = Math.max(0, g.left - 8)
        return { x, y: Math.max(0, g.top - 8) + scrollY, width: Math.min(innerWidth - x, g.width + 16), height: Math.min(r.bottom - g.top + 70, 520) }
      })
      await page.waitForTimeout(200)
      const f2 = `4-check-${sz}-proposed.png`
      await shot(page, f2, clip2, true)
      rec(f2, 'Q4', sz, 'proposed', 'Proposed, drawn in. The check, listed in amber after Logic\'s other checks, in a group of its own (4d), naming both things it looks for in their own words, so a scheduler can read what it does, as he can for every other check.')
    }
    notes.push(`pic6 ${kind} ${sz}: ${JSON.stringify(info)}`)
    await ctx.close()
  }
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ALL = { pic1, pic2, pic3, pic4, pic5, pic6 }
try {
  for (const sz of ['d', 'p']) {
    console.log('== ' + SIZES[sz].name)
    for (const [k, f] of Object.entries(ALL)) {
      if (ONLY && !ONLY.includes(k)) continue
      try { await f(sz) } catch (e) { errs.push(`[${sz}] ${k} FAILED: ${e.message}`); console.log(k, 'FAILED', e.message) }
    }
  }
} finally {
  await browser.close()
}
let old = {}
try { old = JSON.parse(readFileSync(`${OUT}/manifest.json`, 'utf8')) } catch {}
const merged = { ...old, ...manifest }
const sorted = Object.fromEntries(Object.keys(merged).sort().map(k => [k, merged[k]]))
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(sorted, null, 2) + '\n')
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
