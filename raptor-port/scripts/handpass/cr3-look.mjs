/* [UI-CONSISTENCY-LOOK] round 3 (D1124) — the pictures put to him: each mismatch ringed on the real app, and beside it
   the recommended look DRAWN on the running app (text or a style changed in the page, nothing saved). Desktop
   1536 × 864 (his PC), phone 402 × 874 (touch). Every picture is real except the ones named "-proposed".
   The pattern is round 2's cr2-look.mjs.
     q1 (finding 16) every typed pencil ✎ / ✏ in the app, against the drawn pencil (D919, D1133)
     q2 (finding 16) the Tracker's other typed marks — its menus' items, the Students card's × and ⇅ Reorder
     q3 (finding 6)  the labels before fields — the Tracker's ordinary words against the small spaced capitals
     q4 (finding 7)  the Medical tab's row against the Inputs list's
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/cr3-look.mjs → <folder>/
        CR3_ONLY=q1,q3 redoes only those questions' pictures. */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS; mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PC = { width: 1536, height: 864 }, PHONE = { width: 402, height: 874 }
const ONLY = process.env.CR3_ONLY || ''
const want = q => !ONLY || ONLY.split(',').includes(q)
const made = []
async function world(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log('PAGE ERROR', e.message))
  await page.goto(BASE + '/'); await login(page, 'a')
  await page.addStyleTag({ content: '.toast,.snack,[role=status].toast{display:none!important} *{scroll-behavior:auto!important}' })
  return { ctx, page }
}
/* ring each selector's box (amber, numbered) — drawn over the page, not part of it */
async function ring(page, marks) {
  await page.evaluate(marks => {
    document.querySelectorAll('.zz-ring').forEach(e => e.remove())
    for (const [sel, n] of marks) {
      const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
      if (!els.length) throw new Error('ring: nothing at ' + sel)
      for (const e of (n === '*' ? els : [els])) {
        const rs = (Array.isArray(e) ? e : [e]).map(x => x.getBoundingClientRect())
        const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top)), r = Math.max(...rs.map(r => r.right)), b = Math.max(...rs.map(r => r.bottom))
        const d = document.createElement('div'); d.className = 'zz-ring'
        d.style.cssText = `position:fixed;left:${l - 4}px;top:${t - 4}px;width:${r - l + 8}px;height:${b - t + 8}px;border:3px solid #ffb020;border-radius:9px;z-index:2147483647;pointer-events:none`
        if (n && n !== '*') { const s = document.createElement('span'); s.textContent = n; s.style.cssText = 'position:absolute;left:-3px;' + (t < 30 ? 'bottom:-24px;' : 'top:-24px;') + 'background:#ffb020;color:#000;font:800 13px/20px sans-serif;padding:0 7px;border-radius:6px'; d.appendChild(s) }
        document.body.appendChild(d)
      }
    }
  }, marks)
}
const unring = page => page.evaluate(() => document.querySelectorAll('.zz-ring').forEach(e => e.remove()))
async function strip(page, name, y, h, vp, x = 0, w = vp.width) {
  const X = Math.max(0, Math.round(x)), Y = Math.max(0, Math.round(y))
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: X, y: Y, width: Math.min(Math.round(w), vp.width - X), height: Math.min(Math.round(h), vp.height - Y) } })
  made.push(name)
}
const boxOf = (page, sel) => page.evaluate(sel => {
  const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  if (!els.length) return null
  const rs = els.map(e => e.getBoundingClientRect())
  return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) }
}, sel)
/* a picture of a region around one or more selectors, padded */
async function around(page, name, sel, vp, pad = 24, padX = null) {
  const b = await boxOf(page, sel); if (!b) throw new Error('around: nothing at ' + sel)
  const px = padX == null ? pad : padX
  await strip(page, name, b.y - pad, b.b - b.y + pad * 2, vp, b.x - px, b.r - b.x + px * 2)
}
const press = async (page, sel, touch) => { const l = page.locator(sel).first(); if (touch) await l.tap(); else await l.click(); await sleep(450) }
const tryQ = async (label, fn) => { try { await fn() } catch (e) { console.log('SKIPPED', label, '—', e.message.split('\n')[0]) } }

/* every visible element holding a typed pencil (✎ or ✏) in its own text gets the class zz-pen, so it can be ringed */
const tagPens = page => page.evaluate(() => {
  const out = []
  for (const e of document.querySelectorAll('body *')) {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height || e.closest('.zz-ring')) continue
    if ([...e.childNodes].some(n => n.nodeType === 3 && /[✎✏]/.test(n.nodeValue))) { e.classList.add('zz-pen'); out.push(e.textContent.trim().slice(0, 40)) }
  }
  return out
})
/* the proposed look: each typed pencil swapped for the app's drawn pencil (PenIcon, ui/icons.tsx — mirrored by D1133) */
const pencilize = page => page.evaluate(() => {
  const SVG = '<svg class="zz-ic" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;width:1.05em;height:1.05em"><path d="M3 20h9"/><path d="M7.5 3.5a2.1 2.1 0 0 0-3 3L17 19l4 1-1-4Z"/></svg>'
  for (const e of document.querySelectorAll('.zz-pen')) {
    for (const n of [...e.childNodes]) {
      if (n.nodeType !== 3 || !/[✎✏]/.test(n.nodeValue)) continue
      const span = document.createElement('span')
      span.innerHTML = n.nodeValue.replace(/[✎✏]️?/g, SVG)
      n.replaceWith(...span.childNodes)
    }
  }
})
/* the Tracker's other typed marks, swapped for line icons in the same style (Lucide shapes, as Glyphs.jsx draws) */
const MARKS = {
  '⇅': '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  '⧉': '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  '🗑': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  '⇪': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  '⤓': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  '×': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  '✓': '<path d="M20 6 9 17l-5-5"/>',
}
const tagMarks = (page, scope) => page.evaluate(([scope, keys]) => {
  const out = []
  for (const e of document.querySelectorAll(scope + ' *')) {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue
    if ([...e.childNodes].some(n => n.nodeType === 3 && keys.some(k => n.nodeValue.includes(k)))) { e.classList.add('zz-mk'); out.push(e.textContent.trim().slice(0, 30)) }
  }
  return out
}, [scope, Object.keys(MARKS)])
const iconMarks = page => page.evaluate(MARKS => {
  const S = d => '<svg class="zz-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;width:1.05em;height:1.05em">' + d + '</svg>'
  for (const e of document.querySelectorAll('.zz-mk')) {
    for (const n of [...e.childNodes]) {
      if (n.nodeType !== 3) continue
      let v = n.nodeValue, hit = false
      for (const [k, d] of Object.entries(MARKS)) if (v.includes(k)) { v = v.split(k).join('\u0000' + k + '\u0000'); hit = true }
      if (!hit) continue
      const span = document.createElement('span')
      span.innerHTML = v.split('\u0000').map(p => MARKS[p] ? S(MARKS[p]) : p.replace(/&/g, '&amp;').replace(/</g, '&lt;')).join('')
      n.replaceWith(...span.childNodes)
    }
  }
}, MARKS)
async function openBoard(page) {
  await go(page, 'editsched'); await sleep(400)
  await page.locator('#eWeek [data-sbday="0"]:visible').first().click(); await page.waitForSelector('#schedBoard'); await sleep(700)
}
const closeBoard = page => page.evaluate(() => document.querySelector('#sbDone')?.click()).then(() => sleep(400))
const esc = async page => { await page.keyboard.press('Escape'); await sleep(250) }
/* a pencil picture pair: ring every typed pencil inside `scope`, picture `region`, then the same with the drawn pencil */
async function penPair(page, name, scope, region, vp, pad = 20) {
  await page.evaluate(() => document.querySelectorAll('.zz-pen').forEach(e => e.classList.remove('zz-pen')))
  const found = await tagPens(page)
  const inScope = await page.evaluate(scope => [...document.querySelectorAll('.zz-pen')].filter(e => !scope || e.closest(scope)).length, scope)
  if (!inScope) throw new Error('no typed pencil in ' + scope + ' (seen: ' + found.join(' | ') + ')')
  const sel = (scope ? scope + ' .zz-pen, ' + scope + '.zz-pen' : '.zz-pen')
  await ring(page, [[sel, '*']]); await around(page, name + '-today', region, vp, pad); await unring(page)
  await pencilize(page)
  await ring(page, [[sel, '*']]).catch(() => {})
  await around(page, name + '-proposed', region, vp, pad); await unring(page)
}

{ /* ---- the desktop ---- */
  const { ctx, page } = await world(PC, false)

  if (want('q1')) {
    /* Quals and Logic: "✎ Edit" */
    await tryQ('q1 quals', async () => { await go(page, 'quals'); await sleep(500); await penPair(page, 'q1-quals', '#page-quals', '#qEdit, #qExport, #page-quals .qbar button', PC, 16) })
    await tryQ('q1 logic', async () => { await go(page, 'logic'); await sleep(500); await penPair(page, 'q1-logic', '#page-logic', '#lgEdit', PC, 18) })
    /* the drawn pencil today, for comparison: the Tracker's bar (D1132, D1133) */
    await tryQ('q1 tracker bar', async () => { await go(page, 'tracker'); await sleep(900)
      await ring(page, [['#courseMenuBtn, #sylMenuBtn', '*']]); await around(page, 'q1-drawn-tracker', '#courseSel, #sylMenuBtn', PC, 14); await unring(page) })
    /* the Scheduler Board: the Templates menu, the plans menu, a row's Cancel window, a jet's stores list */
    await openBoard(page)
    await tryQ('q1 templates', async () => {
      await page.locator('#schedBoard button:visible', { hasText: 'Templates' }).first().click(); await sleep(500)
      await penPair(page, 'q1-board-templates', '.wavemenu', '.wavemenu', PC, 14); await esc(page) })
    await tryQ('q1 plans', async () => {
      await page.locator('#schedBoard .planselbtn:visible, .planselbtn:visible').first().click(); await sleep(500)
      await penPair(page, 'q1-board-plans', '.wavemenu', '.wavemenu', PC, 14); await esc(page) })
    await tryQ('q1 cx', async () => {
      const btn = page.locator('#schedBoard button:visible').filter({ hasText: /^CX$/ }).first()
      await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForSelector('#cxPop:not([hidden])'); await sleep(400)
      await penPair(page, 'q1-board-cx', '#cxPop', '#cxReason, [data-cxedit]', PC, 40)
      await page.locator('#cxClose').click().catch(() => esc(page)); await sleep(300) })
    await tryQ('q1 stores', async () => {
      const b = page.locator('#schedBoard [data-stcfg]:visible').first(); await b.scrollIntoViewIfNeeded(); await b.click(); await sleep(500)
      await penPair(page, 'q1-board-stores', '.stmenu', '.stmenu', PC, 12); await esc(page) })
    await closeBoard(page)
    /* Inputs: the admin's "✎ Default window" in the list's dates pop-up; a note's ✏ in a day opened on the calendar */
    await tryQ('q1 inputs window', async () => {
      await go(page, 'inputs'); await sleep(500); await press(page, '#inListBtn', false); await press(page, '#inRangeBtn', false)
      await penPair(page, 'q1-inputs-defwindow', '#inRangePop, .inrange', '#inRangePop, #inRangeBtn', PC, 14); await press(page, '#inRangeBtn', false) })
    await tryQ('q1 inputs note', async () => {
      await press(page, '#inCalBtn', false)
      const cell = page.locator('#inpCal [data-icday="2026-07-16"]'); await cell.click({ position: { x: 8, y: 8 } }); await sleep(500)
      await page.locator('#icAddPuck').click(); await sleep(200)
      await page.locator('.ic-newnote .ic-poppuck-edit').fill('Brief at 0700'); await page.keyboard.press('Enter'); await sleep(400)
      await penPair(page, 'q1-inputs-note', '.ic-secs', '.ic-secs', PC, 16)
      await page.locator('[data-ppdel]').first().click().catch(() => {}); await sleep(200); await esc(page) })
    /* the Tracker: the Students card, the Course and Syllabus menus, the marking pop-up, Edit chart layout's tools */
    /* (the Students card's ✎ on each name is already drawn: its typed character is hidden and the drawn pencil shown) */
    await go(page, 'tracker'); await sleep(900)
    await tryQ('q1 tracker course menu', async () => { await press(page, '#courseMenuBtn', false); await penPair(page, 'q1-trk-coursemenu', '#page-tracker', '#addCourse, #delCourse, #courseMenuBtn', PC, 12); await esc(page) })
    await tryQ('q1 tracker syl menu', async () => { await press(page, '#sylMenuBtn', false); await penPair(page, 'q1-trk-sylmenu', '#page-tracker', '#arrangeBtn, #delSyl, #sylMenuBtn', PC, 12); await esc(page) })
    await tryQ('q1 tracker pop', async () => {
      const b = await page.evaluate(() => { const g = document.querySelector('#flowSvg .ball'); const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })
      await page.mouse.click(b.x, b.y); await page.waitForSelector('#popEditInfo', { state: 'visible', timeout: 5000 }); await sleep(300)
      await penPair(page, 'q1-trk-pop', '#page-tracker', '#popEditInfo', PC, 40); await esc(page) })
    await tryQ('q1 tracker tools', async () => {
      await press(page, '#sylMenuBtn', false); await press(page, '#arrangeBtn', false); await sleep(500)
      const tb = await page.evaluate(() => { const b = [...document.querySelectorAll('#page-tracker button')].find(b => b.offsetWidth && /✎\s*Text/.test(b.textContent)); if (b) b.id = 'zzTextTool'; return !!b })
      if (!tb) throw new Error('no ✎ Text tool')
      await penPair(page, 'q1-trk-tools', '#page-tracker', '#zzTextTool', PC, 22)
      await press(page, '#sylMenuBtn', false); await press(page, '#arrangeBtn', false) })
  }

  if (want('q2')) { /* the Tracker's menus and Students card: their typed marks */
    await go(page, 'tracker'); await sleep(900)
    const pair = async (name, region, open) => {
      if (open) await press(page, open, false)
      await page.evaluate(() => document.querySelectorAll('.zz-mk').forEach(e => e.classList.remove('zz-mk')))
      const got = await tagMarks(page, '#page-tracker'); console.log(name, 'marks:', got.join(' | '))
      await ring(page, [['.zz-mk', '*']]); await around(page, name + '-today', region, PC, 14); await unring(page)
      /* the proposed look carries question 1's drawn pencil too, so the menu is shown whole as it would be */
      await iconMarks(page); await tagPens(page); await pencilize(page); await around(page, name + '-proposed', region, PC, 14)
      if (open) await esc(page)
      await go(page, 'help'); await go(page, 'tracker'); await sleep(700)   /* the page drawn again, its own marks back */
    }
    await tryQ('q2 students', () => pair('q2-trk-students', '#ordCrew, #addStu, [data-rm]', null))
    await tryQ('q2 course', () => pair('q2-trk-coursemenu', '#addCourse, #delCourse, #courseMenuBtn', '#courseMenuBtn'))
    await tryQ('q2 syl', () => pair('q2-trk-sylmenu', '#arrangeBtn, #delSyl, #sylMenuBtn', '#sylMenuBtn'))
    await tryQ('q2 file', () => pair('q2-trk-filemenu', '#importFileBtn, #exportBtn, #fileMenuBtn', '#fileMenuBtn'))
  }

  if (want('q3')) { /* labels before fields */
    const tagLab = (words, cls) => page.evaluate(([words, cls]) => {
      let n = 0
      for (const e of document.querySelectorAll('body *')) {
        const r = e.getBoundingClientRect(); if (!r.width || e.children.length) continue
        if (words.includes(e.textContent.trim())) { e.classList.add(cls); n++ }
      }
      return n
    }, [words, cls])
    await tryQ('q3 quals', async () => { await go(page, 'quals'); await sleep(500); await tagLab(['Viewing'], 'zz-lab')
      await ring(page, [['#page-quals .zz-lab', '1']]); await around(page, 'q3-quals', '#page-quals .zz-lab', PC, 22, 40); await unring(page) })
    await tryQ('q3 leavewar', async () => { await go(page, 'leavewar'); await sleep(700); await tagLab(['Period', 'Stage', 'Bidding on', 'Under-manned', 'Viewing as'], 'zz-lab')
      await ring(page, [['#page-leavewar .zz-lab', '*']]); const b = await boxOf(page, '#page-leavewar .zz-lab'); await strip(page, 'q3-leavewar', b.y - 26, b.b - b.y + 52, PC, 0, 1000); await unring(page) })
    await tryQ('q3 help', async () => { await go(page, 'help'); await sleep(500); await tagLab(['Category', 'What happened'], 'zz-lab')
      await ring(page, [['#page-help .zz-lab, .zz-lab', '*']]); const b = await boxOf(page, '.zz-lab'); await strip(page, 'q3-help', b.y - 30, b.b - b.y + 90, PC, b.x - 30, 720); await unring(page) })
    await tryQ('q3 tracker', async () => {
      await go(page, 'tracker'); await sleep(900)
      await ring(page, [['#page-tracker .lbltx', '*']]); const b = await boxOf(page, '#page-tracker .lbltx, #sylMenuBtn')
      await strip(page, 'q3-tracker-today', b.y - 22, b.b - b.y + 44, PC, 0, 1100); await unring(page)
      /* proposed: the same small spaced capitals as Quals' "Viewing" — its font, size, weight, spacing and colour read off it */
      await go(page, 'quals'); await sleep(400)
      const st = await page.evaluate(() => { const e = [...document.querySelectorAll('#page-quals *')].find(e => !e.children.length && e.textContent.trim() === 'Viewing'); const c = getComputedStyle(e); return { fs: c.fontSize, fw: c.fontWeight, ls: c.letterSpacing, tt: c.textTransform, col: c.color, ff: c.fontFamily } })
      console.log('Quals label style', JSON.stringify(st))
      await go(page, 'tracker'); await sleep(700)
      await page.evaluate(st => { for (const e of document.querySelectorAll('#page-tracker .lbltx')) Object.assign(e.style, { fontSize: st.fs, fontWeight: st.fw, letterSpacing: st.ls, textTransform: st.tt, color: st.col, fontFamily: st.ff }) }, st)
      await sleep(200)
      await ring(page, [['#page-tracker .lbltx', '*']]); await strip(page, 'q3-tracker-proposed', b.y - 22, b.b - b.y + 44, PC, 0, 1100); await unring(page)
      await go(page, 'help'); await go(page, 'tracker') })
  }

  if (want('q4')) { /* the Medical tab's row against the Inputs list's */
    await go(page, 'inputs'); await sleep(500)
    await tryQ('q4 list', async () => {
      await press(page, '#inListBtn', false)
      await ring(page, [['#inNew', '1'], ['#inRangeBtn', '2']]); await strip(page, 'q4-list-today', 56, 150, PC); await unring(page)
      /* proposed: the dates button's 📅 emoji becomes the app's line calendar, as Medical's "as of" wears */
      await page.evaluate(() => { const b = document.querySelector('#inRangeBtn'); for (const n of [...b.childNodes]) if (n.nodeType === 3 && n.nodeValue.includes('📅')) { const s = document.createElement('span'); s.innerHTML = '<svg class="btnglyph zz-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;vertical-align:-3px;margin-right:6px"><path d="M8 2v4M16 2v4M3 9.5h18"/><rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01"/></svg>'; n.replaceWith(s.firstChild) } })
      await sleep(150)
      await ring(page, [['#inNew', '1'], ['#inRangeBtn', '2']]); await strip(page, 'q4-list-proposed', 56, 150, PC); await unring(page)
      await press(page, '#inCalBtn', false) })
    await tryQ('q4 medical', async () => {
      await press(page, '#inMedBtn', false); await sleep(400)
      const frame = await page.evaluate(() => {
        /* the bordered panel the whole tab sits in: the nearest ancestor of "+ Medical" with a visible border */
        let e = document.querySelector('#medNew').parentElement
        while (e && e !== document.body) { const c = getComputedStyle(e); if (parseFloat(c.borderTopWidth) > 0 && e.getBoundingClientRect().height > 200) { e.classList.add('zz-frame'); return e.className } e = e.parentElement }
        return null
      })
      console.log('medical frame:', frame)
      await ring(page, [['.zz-frame', '3'], ['#medNew', '1'], ['#medCalBtn', '2']]); await strip(page, 'q4-medical-today', 56, 300, PC); await unring(page)
      /* proposed: "+ Medical" first, at the left, as "+ Input" stands (D729); the outer frame goes, the three sections keep theirs */
      await page.evaluate(() => {
        const add = document.querySelector('#medNew'), cal = document.querySelector('#medCalBtn')
        cal.parentElement.insertBefore(add, cal)
        const f = document.querySelector('.zz-frame'); if (f) Object.assign(f.style, { border: '0', background: 'transparent', boxShadow: 'none' })
      })
      await sleep(200)
      await ring(page, [['#medNew', '1'], ['#medCalBtn', '2']]); await strip(page, 'q4-medical-proposed', 56, 300, PC); await unring(page) })
  }
  await ctx.close()
}

{ /* ---- the phone ---- */
  const { ctx, page } = await world(PHONE, true)
  if (want('q1')) {
    await tryQ('q1 phone quals', async () => { await go(page, 'quals'); await sleep(500); await penPair(page, 'q1-phone-quals', '#page-quals', '#qEdit', PHONE, 16) })
    await tryQ('q1 phone tracker', async () => { await go(page, 'tracker'); await sleep(900)
      await ring(page, [['#courseMenuBtn, #sylMenuBtn', '*']]); await strip(page, 'q1-phone-drawn-tracker', 40, 120, PHONE); await unring(page) })
  }
  if (want('q2')) {
    await tryQ('q2 phone syl', async () => { await go(page, 'tracker'); await sleep(900); await press(page, '#sylMenuBtn', true)
      await tagMarks(page, '#page-tracker'); await ring(page, [['.zz-mk', '*']]); await around(page, 'q2-phone-sylmenu-today', '#arrangeBtn, #delSyl', PHONE, 14, 10); await unring(page)
      await iconMarks(page); await tagPens(page); await pencilize(page); await around(page, 'q2-phone-sylmenu-proposed', '#arrangeBtn, #delSyl', PHONE, 14, 10); await esc(page) })
  }
  if (want('q4')) {
    await go(page, 'inputs'); await sleep(500)
    await tryQ('q4 phone list', async () => { await press(page, '#inListBtn', true)
      await ring(page, [['#inNew', '1'], ['#inRangeBtn', '2']]); await strip(page, 'q4-phone-list-today', 50, 140, PHONE); await unring(page)
      await press(page, '#inCalBtn', true) })
    await tryQ('q4 phone medical', async () => { await press(page, '#inMedBtn', true); await sleep(400)
      await page.evaluate(() => { let e = document.querySelector('#medNew').parentElement; while (e && e !== document.body) { const c = getComputedStyle(e); if (parseFloat(c.borderTopWidth) > 0 && e.getBoundingClientRect().height > 200) { e.classList.add('zz-frame'); return } e = e.parentElement } })
      await ring(page, [['.zz-frame', '3'], ['#medNew', '1'], ['#medCalBtn', '2']]); await strip(page, 'q4-phone-medical-today', 50, 330, PHONE); await unring(page)
      await page.evaluate(() => { const add = document.querySelector('#medNew'), cal = document.querySelector('#medCalBtn'); cal.parentElement.insertBefore(add, cal); const f = document.querySelector('.zz-frame'); if (f) Object.assign(f.style, { border: '0', background: 'transparent', boxShadow: 'none' }) })
      await sleep(200)
      await ring(page, [['#medNew', '1'], ['#medCalBtn', '2']]); await strip(page, 'q4-phone-medical-proposed', 50, 330, PHONE); await unring(page) })
  }
  await ctx.close()
}
await browser.close()
console.log('pictures:', made.length, made.join(' '))
