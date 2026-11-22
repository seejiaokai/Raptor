// Multi-squadron build, batch 1 — the batch's page of pictures (chat 106), drawn on the REAL running app by
// .claude/skills/brainstorming/mockups-on-the-real-app.md, for the batch plan
// docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md §3 (its open points O1–O7).
// Approved drawings are redrawn from their own scripts, the sole source (his D1478), changed only where batch 1 needs:
//   b1-1  round 3's 3-switch (docs/mock/2026-11-17-multi-sqn-r3/draw.mjs pic3): "142 ▾" and "Schedules" with 142 and 149
//         only, no detachment line; on a phone the menu opens as a sheet from the top (O5).
//   b1-2  round 4's 4f (docs/mock/2026-11-17-multi-sqn-r4/draw.mjs it4b): the board's bar, a small grey "142" beside its
//         day title, on 142's own board — none of the joined wave.
//   b1-3  Admin → Squadrons (round 2's C1, round 4's and round 7's builder, draw-r7f.mjs): the two squadrons only, both
//         at Home base, "Perth · GMT+8" in their sub-lines (O1); no detachment sections (batch 2); NEW "+ New squadron".
//   b1-4  the same page, 149's row opened on its place (round 4's 8-place) with draw-r7f.mjs F3's TIME ZONE select; its
//         line "Saved at once; counts from tomorrow." — the approved card's line without "can plan each other's people"
//         (batch 3, plan §3.2).
//   b1-5  Request access with "Squadron" first (round 2's 4-c2, docs/mock/2026-11-16-multi-sqn-r2/draw.mjs pic4).
//   b1-6  Admin → Users, Saber's row opened (draw-r7d.mjs d1): "Other squadrons · 149 · View", NEW "Home squadron · 142".
//   b1-7  Admin → Users' New person form: NEW "Home squadron" choice, the admin's own (142) picked.
//   b1-8  the Leave War's holiday "+ Add" as 149's admin (draw-r7d.mjs d6), its amber warning; NEW line on the Kind
//         label's row, "Off days stay each squadron's own" (in the app an Off day is a dated entry beside the public
//         holidays, so the line names no weekday).
// Marks: approved parts are drawn plain, unmarked; each NEW piece wears round 7's "new" mark — the pink #ff2d95 outline
// drawn ON the element by mq.mark (outline + child tag "New"), never laid over. No ids, codes or ruling numbers drawn.
// Every proposed frame adds nodes marked data-mine, hides an app node (display:none, never removed) or changes a real
// node's words. Demo data only; the places "Home base" and "Northern base" and the city "Perth" are made up.
//
// Run from raptor-port/, against a built preview already serving:
//   MQ_URL=http://localhost:4391/ node docs/mock/2026-11-17-multi-sqn-b1/draw-b1.mjs
// MQ_ONLY=b1,b3 draws only those; MQ_SZ=d or p one size; MQ_PROBE=1 prints what the screens hold and draws nothing.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4391/'
const IMG = 'docs/mock/2026-11-22-msq-b1-screens/img'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(IMG, { recursive: true })

const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const PINK = '#0e7fa6' // blue: approved earlier (chat 135 redraw)

const MARK_CSS = `
.mkq { outline: 2px solid ${PINK} !important; outline-offset: -2px !important; }
.mkq.mkq-o { outline-offset: 2px !important; }
.mkq.mkq-p { outline-offset: 5px !important; }
.mkq-tag { position: absolute; z-index: 60; background: ${PINK}; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; font-style: normal; }
.toast, .toasts, #toast, #toastEl { display: none !important; }
.mkq.mkn { outline-color: #ff2d95 !important; }
.mkq-tag.mkn-tag { background: #ff2d95 !important; }

*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}
`

// the kit: round 7's (draw-r7f.mjs), the mark kept to the one "new" colour
function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.strip = root => {
    const A = ['id', 'data-inprow', 'data-inpedit', 'data-inp', 'data-txt', 'data-slot', 'data-fill', 'data-drag', 'data-inpseat',
      'tabindex', 'data-plangolive', 'data-plandup', 'data-avtog', 'data-planmenu', 'for', 'data-person', 'data-testid', 'contenteditable', 'data-acc', 'data-acck',
      'data-gline', 'data-gdel', 'data-itadd', 'data-sortsec', 'data-air', 'data-wvadd', 'data-acct', 'data-editing', 'data-bfld', 'data-move']
    for (const n of [root, ...root.querySelectorAll('*')]) for (const a of A) n.removeAttribute(a)
    root.setAttribute('data-mine', '1')
    return root
  }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  // the "new" mark: pink outline on the element, the tag "New" in its own child
  mq.mark = (el, where = 'in') => {
    if (where === 'right' && el.getAttribute('data-mine') === '1') el.style.width = 'fit-content'
    const b = el.getBoundingClientRect()
    if (el.getAttribute('data-mine') === '1' && getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.classList.add('mkq')
    if (where === 'below' || where === 'right' || where === 'left' || where === 'above') el.classList.add('mkq-o')
    if (where === 'pad') el.classList.add('mkq-p')
    if (where === 'inO') { el.classList.add('mkq-o'); if (getComputedStyle(el).position === 'static') el.style.position = 'relative' }
    const t = document.createElement('span')
    t.className = 'mkq-tag'; t.textContent = 'Approved'; t.setAttribute('data-mine', '1')
    if (where === 'pad') { if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; t.style.top = '-12px'; t.style.right = '-10px'; el.appendChild(t) }
    else if (where === 'below') { t.style.top = 'calc(100% + 4px)'; t.style.right = '0'; el.appendChild(t) }
    else if (where === 'above') { t.style.bottom = 'calc(100% + 4px)'; t.style.right = '0'; el.appendChild(t) }
    else if (where === 'right') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.left = 'calc(100% + 5px)'; el.appendChild(t) }
    else if (where === 'left') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.right = 'calc(100% + 5px)'; el.appendChild(t) }
    else if (getComputedStyle(el).position !== 'static') { t.style.top = '1px'; t.style.right = '1px'; el.appendChild(t) }
    else el.insertBefore(t, el.firstChild)
    const a = el.getBoundingClientRect()
    const same = ['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.5)
    if (!same) throw new Error('mark moved its element')
    return t
  }
  mq.markNew = (el, where) => { const t = mq.mark(el, where); el.classList.add('mkn'); t.classList.add('mkn-tag'); t.textContent = 'New'; return t }
  mq.checkTags = () => {
    const bad = []
    for (const t of document.querySelectorAll('.mkq-tag')) {
      const r = t.getBoundingClientRect()
      if (!(r.width > 0)) { bad.push('tag not drawn'); continue }
      if (r.left < 0 || r.right > innerWidth) bad.push('tag off screen')
      for (let a = t.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        const cs = getComputedStyle(a)
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
          const c = a.getBoundingClientRect()
          if (r.left < c.left - 0.5 || r.right > c.right + 0.5 || r.top < c.top - 0.5 || r.bottom > c.bottom + 0.5) bad.push('tag clipped by ' + a.className)
        }
      }
    }
    return bad
  }
  mq.topH = () => { const t = document.querySelector('.topbar'); return t && mq.vis(t) ? t.getBoundingClientRect().bottom : 0 }
  // the top bar's own squadron number re-lettered (round 4's way)
  mq.asSqn = (num) => { const k = document.querySelector('.topbar .mark .k'); if (k && mq.vis(k)) { const k2 = mq.strip(k.cloneNode(true)); k2.textContent = num; mq.hide(k); k.after(k2) } }
  // round 3's grey badge (round 2's look 2): the standby lines' MAIN badge recipe, in neutral grey
  mq.badge = (txt, small) => {
    const c = document.createElement('span'); c.className = 'sarole ro'; c.textContent = txt; c.setAttribute('data-mine', '1')
    c.style.background = 'rgba(255,255,255,.08)'; c.style.borderColor = 'rgba(255,255,255,.22)'; c.style.color = 'var(--ink-2)'
    c.style.verticalAlign = 'middle'; c.style.alignSelf = 'center'
    if (small) { c.style.fontSize = '7px'; c.style.padding = '0 4px' }
    return c
  }
  window.__mq = mq
}

const manifest = {}
const notes = []
const errs = []
let browser

async function world(sz, { user = 'ad', pass = 'a' } = {}) {
  const ctx = await browser.newContext(SIZES[sz].opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`); console.log('PAGEERROR', String(e)) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  if (user === 'ad') { await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(700) }
  else await page.waitForTimeout(1200)
  await page.addStyleTag({ content: MARK_CSS })
  return { ctx, page }
}
function rec(file, item, sz, caption) { manifest[file] = { item, size: SIZES[sz].name, caption } }
async function shot(page, file, clip) {
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) throw new Error(file + ': ' + bad.join('; '))
  await page.mouse.move(Math.round(page.viewportSize().width / 2), 1)
  await page.waitForTimeout(150)
  const vp = page.viewportSize()
  if (clip) clip = { x: Math.max(0, Math.round(clip.x)), y: Math.max(0, Math.round(clip.y)), width: Math.round(Math.min(clip.width, vp.width - Math.max(0, clip.x))), height: Math.round(Math.min(clip.height, vp.height - Math.max(0, clip.y))) }
  await page.screenshot({ path: `${IMG}/${file}`, ...(clip ? { clip } : {}) })
  console.log('  wrote', file)
}
async function clipOf(page, { pad = 8, top = 0, extraH = 0 } = {}) {
  return page.evaluate(({ pad, top, extraH }) => {
    const e = window.__mqClipEl, r = e.getBoundingClientRect()
    const x = Math.max(0, r.left - pad), y = Math.max(window.__mq.topH(), r.top - pad - top)
    const w = Math.min(innerWidth - x, r.width + pad * 2), h = Math.min(innerHeight - y, r.bottom + pad + extraH - y)
    return { x, y, width: w, height: h }
  }, { pad, top, extraH })
}
async function toEdit(page) {
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day')
  await page.waitForTimeout(900)
}
async function toBoard(page, di = 0) {
  await toEdit(page)
  await page.evaluate(di => document.querySelector(`#eWeek .day:not(.peek) [data-sbday="${di}"]`).click(), di)
  await page.waitForSelector('.sb-go [data-gline]')
  await page.waitForTimeout(1200)
}
async function toUsers(page) {
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on button.acc-main', { state: 'attached' })
  await page.waitForTimeout(500)
  if (!(await page.locator('#page-admin button.acc-main').first().isVisible())) {
    await page.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first().click()
    await page.waitForSelector('#page-admin.on button.acc-main')
    await page.waitForTimeout(500)
  }
}

// ---------- probe ----------
async function probe(sz) {
  const { ctx, page } = await world(sz)
  console.log('TOP', await page.evaluate(() => document.querySelector('.topbar .mark').outerHTML.slice(0, 600)))
  await toUsers(page)
  console.log('ADDFORM', await page.evaluate(() => {
    const f = document.querySelector('#accAddCs'); let k = f; for (let i = 0; i < 6 && k.parentElement; i++) k = k.parentElement
    return k.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').slice(0, 5000)
  }))
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await page.waitForTimeout(800)
  await page.locator('[data-testid="settings-open"]').filter({ visible: true }).first().click()
  await page.locator('[data-testid="settings-days"]').filter({ visible: true }).first().click()
  await page.waitForSelector('[data-testid="win-days"]')
  if (await page.locator('[data-testid="days-tabs"]').filter({ visible: true }).count()) await page.locator('[data-testid="days-tab-holidays"]').filter({ visible: true }).first().click()
  await page.waitForTimeout(400)
  console.log('DAYS', await page.evaluate(() => document.querySelector('[data-testid="win-days"]').innerText.slice(0, 2000)))
  console.log('DAYSHTML', await page.evaluate(() => document.querySelector('[data-testid="win-days"]').outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').slice(0, 4000)))
  await page.locator('[data-testid="hol-add"]').filter({ visible: true }).first().click()
  await page.waitForSelector('[data-testid="win-holiday"]'); await page.waitForTimeout(500)
  console.log('HOLWIN', await page.evaluate(() => document.querySelector('[data-testid="win-holiday"]').outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').replace(/<div class="hol-cal"[\s\S]*$/, '…').slice(0, 3000)))
  await ctx.close()
}

// ---------- b1-1 · the "142 ▾" button and its "Schedules" menu (round 3's pic3, no detachment line) ----------
// Real: Edit Schedule, the plans selector's own menu (.wavemenu) opened for real, taken whole, closed. Drawn: the top
// bar's small number re-lettered "142 ▾" (Saber's own, the schedule in view); the menu re-lettered "Schedules", its two
// rows "142 ●" in the menu's own picked look and "149" in its plain look. Desktop: under the mark, as round 3 drew it.
// Phone (O5): the same menu as a sheet from the top — the screen's full width, hung from the top bar's foot, its lower
// corners rounded, the page under it dimmed by the app's own dark; the button stays where it is.
async function b1(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('#page-editsched .day .planselbtn').filter({ visible: true }).first().click()
  await page.waitForSelector('.wavemenu'); await page.waitForTimeout(300)
  await page.evaluate(() => { window.__mqMenu = document.querySelector('.wavemenu').cloneNode(true) })
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur())
  if (await page.locator('.wavemenu').count()) { await page.mouse.click(sz === 'd' ? 900 : 200, sz === 'd' ? 150 : 210); await page.waitForTimeout(250) }
  if (await page.locator('.wavemenu:not([data-mine])').count()) throw new Error('b1: the real plans menu did not close')
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
  const m = await page.evaluate((sz) => {
    const mq = window.__mq
    const k = document.querySelector('.topbar .mark .k')
    const k2 = mq.strip(k.cloneNode(true)); k2.textContent = '142 ▾'
    mq.hide(k); k.after(k2)
    const menu = mq.strip(window.__mqMenu)
    const rows = [...menu.querySelectorAll('.wm-row')]
    const selRow = rows.find(r => r.querySelector('.wm.sa')), plainRow = rows.find(r => r.querySelector('.wm:not(.sa)'))
    menu.querySelector('h5').textContent = 'Schedules'
    const mk = (tpl, text) => { const r = tpl.cloneNode(true); const b = r.querySelector('.wm'); b.textContent = text; b.style.textAlign = 'left'; return r }
    const r1 = mk(selRow, '142 ●'), r2 = mk(plainRow, '149')
    rows.forEach(r => r.remove())
    menu.append(r1, r2)
    const mark = document.querySelector('.topbar .mark').getBoundingClientRect()
    const top = Math.round(mq.topH())
    menu.style.position = 'fixed'
    if (sz === 'd') {
      menu.style.left = Math.round(mark.left) + 'px'
      menu.style.top = (top + 12) + 'px'
    } else {
      // the sheet: full width from the top bar's foot; the page under it dimmed
      const dim = document.createElement('div'); dim.setAttribute('data-mine', '1')
      dim.style.cssText = `position:fixed;left:0;right:0;top:${top}px;bottom:0;background:rgba(0,0,0,.55);z-index:${(parseInt(getComputedStyle(menu).zIndex) || 50) - 1}`
      document.body.appendChild(dim)
      menu.style.left = '0'; menu.style.right = '0'; menu.style.top = top + 'px'
      menu.style.width = '100%'; menu.style.maxWidth = 'none'; menu.style.minWidth = '0'; menu.style.boxSizing = 'border-box'
      menu.style.borderRadius = '0 0 16px 16px'; menu.style.borderTop = '0'; menu.style.margin = '0'
    }
    document.body.appendChild(menu)
    const r = menu.getBoundingClientRect()
    return { bottom: Math.round(r.bottom), right: Math.round(r.right), left: Math.round(r.left), top, z: getComputedStyle(menu).zIndex,
      rows: [...menu.querySelectorAll('.wm')].map(b => b.textContent) }
  }, sz)
  notes.push(`b1 ${sz}: ${JSON.stringify(m)}`)
  const clip = sz === 'd' ? { x: 0, y: 0, width: 720, height: Math.max(300, m.bottom + 40) } : { x: 0, y: 0, width: 390, height: m.bottom + 90 }
  const f = `b1-1-${sz}.png`
  await shot(page, f, clip)
  rec(f, 'b1-1', sz, `Round 3's approved "Schedules" button redrawn for batch 1, as Saber (142) sees it on Edit Schedule: the TALON mark's small number reads "142 ▾"; its menu lists only 142 (picked, ●) and 149 — no detachment line (detachments are batch 2).${sz === 'p' ? ' On a phone the menu opens as a sheet from the top: the full width, hung from the top bar, the page under it dimmed.' : ''}`)
  await ctx.close()
}

// ---------- b1-2 · the board's bar, a small grey "142" beside its day title (round 4's 4f) ----------
// Real: 142's Scheduler Board, Monday, as it opens. Drawn: round 4's it4b bar badge only — the grey badge recipe, placed
// absolutely beside the day title so nothing in the bar moves (measured); none of the joined wave's parts.
async function b2(sz) {
  const { ctx, page } = await world(sz)
  await toBoard(page)
  const m = await page.evaluate(() => {
    const mq = window.__mq
    const top = document.querySelector('.sb-top')
    const spans = [...top.querySelectorAll('span')].filter(mq.vis)
    const title = innerWidth < 600 ? spans.find(e => e.classList.contains('mono') && /^Jul \d+$/.test(e.textContent.trim())) : spans.find(e => e.textContent.trim() === '· scheduler board')
    if (!title) return { err: 'no board day title' }
    const before = [...top.querySelectorAll('button, .sbday')].filter(mq.vis).map(e => { const r = e.getBoundingClientRect(); return [r.left, r.top] })
    if (getComputedStyle(top).position === 'static') top.style.position = 'relative'
    const tb = mq.badge('142', innerWidth < 600); tb.style.position = 'absolute'; tb.style.lineHeight = 'normal'; tb.style.zIndex = '3'
    top.appendChild(tb)
    const T = top.getBoundingClientRect(), r0 = title.getBoundingClientRect(), br = tb.getBoundingClientRect()
    // on a phone the date is followed by the board's small green dot (drawn by the date's own style, not a node): clear it
    tb.style.left = Math.round(r0.right - T.left + (innerWidth < 600 ? 16 : 6)) + 'px'; tb.style.top = Math.round(r0.top + r0.height / 2 - br.height / 2 - T.top) + 'px'
    const after = [...top.querySelectorAll('button, .sbday')].filter(mq.vis).map(e => { const r = e.getBoundingClientRect(); return [r.left, r.top] })
    const moved = before.some((p, i) => Math.abs(p[0] - after[i][0]) + Math.abs(p[1] - after[i][1]) > 0.5)
    const B = tb.getBoundingClientRect()
    const hits = [...top.querySelectorAll('button, .sbday, span')].filter(e => mq.vis(e) && e !== title && !e.contains(title) && !title.contains(e) && e !== tb && !tb.contains(e)).filter(e => { const r = e.getBoundingClientRect(); return !(B.right <= r.left || B.left >= r.right || B.bottom <= r.top || B.top >= r.bottom) && r.width < 400 }).map(e => e.textContent.trim().slice(0, 12))
    return { moved, hits, barBottom: Math.round(top.getBoundingClientRect().bottom), title: title.textContent }
  })
  if (m.err) throw new Error('b2: ' + m.err)
  if (m.moved || m.hits.length) throw new Error('b2 bar badge: ' + JSON.stringify(m))
  notes.push(`b2 ${sz}: ${JSON.stringify(m)}`)
  // the whole bar, both sizes: a cut through its buttons would read as a fault
  const clip = { x: 0, y: 0, width: sz === 'd' ? 1440 : 390, height: m.barBottom + 8 }
  const f = `b1-2-${sz}.png`
  await shot(page, f, clip)
  rec(f, 'b1-2', sz, `Round 4's approved mark redrawn on 142's own Scheduler Board: a small grey "142" beside the day title in the board's own bar (nothing in the bar moves, measured). Nothing of a shared wave is drawn — that is batch 3.`)
  await ctx.close()
}

// ---------- Admin → Squadrons (round 7's builder, draw-r7f.mjs, cut to batch 1) ----------
// toAdmin and the builder's helpers (H, list, R, editor) are draw-r7f.mjs's, copied whole; batch 1 changes only what it
// lays out: the two squadrons, both at Home base, their sub-lines carrying "Perth · GMT+8"; no Detachments or Past
// detachments (batch 2) — so the category's grey line reads "Places", not "Places and detachments"; and, NEW, a
// "+ New squadron" button (the Users editor's own button, re-lettered, as "+ New detachment" was), a master admin's only.
async function toAdmin(page) {
  await toUsers(page)
  await page.locator('#page-admin button.acc-main', { hasText: /^Hex/ }).first().click()
  await page.waitForSelector('#accEdArchive')
  await page.evaluate(() => {
    window.__mqEdit = document.querySelector('#accEdSave').closest('.acc-edit').cloneNode(true)
    window.__mqBtn = document.querySelector('#accEdArchive').cloneNode(true)
  })
  await page.click('#accEdCancel')
  await page.waitForTimeout(400)
  await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur && document.activeElement.blur() })
  await page.waitForTimeout(250)
}
async function squadrons(page, opts) {
  return page.evaluate(({ opts }) => {
    const mq = window.__mq, pg = document.querySelector('#page-admin')
    let panel = pg.querySelector('button.acc-main').parentElement
    while (panel && !panel.querySelector('h3')) panel = panel.parentElement
    const realRow = panel.querySelector('.acc-row.od-row')
    const realInset = Math.round(realRow.querySelector('.acc-name').getBoundingClientRect().left - panel.getBoundingClientRect().left)
    const cats = [...pg.querySelectorAll('button.adm-cat')].filter(mq.vis)
    const users = cats.find(c => /Users/.test(c.textContent)), cfg = cats.find(c => /Squadron config/.test(c.textContent))
    if (users && cfg) {
      const sq = mq.strip(users.cloneNode(true))
      sq.querySelector('.adm-cat-l').textContent = 'Squadrons'; sq.querySelector('.adm-cat-s').textContent = 'Places'
      // the 19 Nov drawing's own icon for the tile (one thing, one icon): a line map pin, never Users' people icon
      { const sv = sq.querySelector('svg'); if (sv) sv.innerHTML = '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>' }
      const u2 = mq.strip(cfg.cloneNode(true))
      u2.querySelector('.adm-cat-ic').replaceWith(mq.strip(users.querySelector('.adm-cat-ic').cloneNode(true)))
      u2.querySelector('.adm-cat-l').textContent = 'Users'; u2.querySelector('.adm-cat-s').textContent = 'Sign-in and roster'
      mq.hide(users); users.after(u2); u2.after(sq)
    }
    const h3 = panel.querySelector('h3'), sub = panel.querySelector('h4.adm-sub'), row = realRow
    const kids = [...panel.children]
    const h3c = mq.strip(h3.cloneNode(true)); h3c.textContent = 'Squadrons'
    kids.forEach(k => mq.hide(k))
    const hostOf = h3.parentElement === panel ? null : h3.parentElement
    const head = hostOf ? mq.strip(hostOf.cloneNode(false)) : null
    if (head) { head.appendChild(h3c); panel.appendChild(head) } else panel.appendChild(h3c)
    const listSec = row.closest('.acc-list').parentElement
    const sec = mq.strip(listSec.cloneNode(false)); panel.appendChild(sec)
    sec.style.paddingBottom = '14px'
    const H = t => { const h = mq.strip(sub.cloneNode(true)); h.textContent = t; sec.appendChild(h); return h }
    const list = () => { const l = mq.strip(row.closest('.acc-list').cloneNode(false)); sec.appendChild(l); return l }
    const R = (l, name, subTx, btn) => {
      const r = mq.strip(row.cloneNode(true)); r.classList.remove('od-row-on')
      r.querySelector('.acc-name').textContent = name; r.querySelector('.acc-sub').textContent = subTx
      r.querySelectorAll('.od-c, .acc-edit').forEach(x => x.remove())
      const rc = r.querySelector('.od-rc'); rc.innerHTML = ''
      if (btn) { const b = mq.strip(window.__mqBtn.cloneNode(true)); b.textContent = btn; b.style.whiteSpace = 'nowrap'; rc.appendChild(b); rc.style.display = 'flex'; rc.style.alignItems = 'center' }
      l.appendChild(r); return r
    }
    const editor = (r, fields, note) => {
      r.classList.add('od-row-on')
      const ed = mq.strip(window.__mqEdit.cloneNode(true))
      const col = ed.querySelector('.adm-2col'), mfIn = col.querySelector('.mfield'), mfSel = col.querySelectorAll('.mfield')[1]
      const cols = []
      for (let i = 0; i < fields.length; i += 2) {
        const c = mq.strip(col.cloneNode(false)); cols.push(c)
        for (const [lab, kind, val, choices, ph] of fields.slice(i, i + 2)) {
          const f = mq.strip((kind === 'sel' ? mfSel : mfIn).cloneNode(true))
          f.querySelector('label').textContent = lab
          if (kind === 'sel') { const s = f.querySelector('select'); s.innerHTML = ''; for (const t of choices) { const o = document.createElement('option'); o.textContent = t; s.appendChild(o) } s.selectedIndex = 0; s.removeAttribute('aria-label') }
          else { const inp = f.querySelector('input'); inp.setAttribute('value', val); inp.value = val; if (ph) inp.setAttribute('placeholder', ph); else inp.removeAttribute('placeholder') }
          c.appendChild(f)
        }
      }
      col.replaceWith(...cols)
      let noteEl = null
      if (note) {
        noteEl = document.createElement('div'); noteEl.setAttribute('data-mine', '1'); noteEl.className = 'acc-sub'
        noteEl.textContent = note; noteEl.style.cssText = 'display:block;margin:2px 0 10px;white-space:normal'
        ed.querySelector('.acc-acts').before(noteEl)
      }
      const acts = ed.querySelector('.acc-acts')
      ;[...acts.children].forEach(b => { if (!/^(Save|Cancel)$/.test(b.textContent.trim())) b.remove() })
      r.appendChild(ed)
      return { ed, cols, noteEl }
    }
    const out = {}
    // Saber may see 149's schedule too (View), so the top bar's mark is the "142 ▾" button of b1-1 on every page
    mq.asSqn('142 ▾')
    H('Squadrons · 2')
    const l1 = list()
    R(l1, '142', 'Home base · 61 people')
    // the demo's 149 holds 10 people (state/demoseed.ts DEMO_149_PEOPLE) — batch 1's page said 48, a made-up figure
    const r149 = R(l1, '149', 'Home base · 10 people')
    if (opts.edit149) out.edit = editor(r149, opts.edit149.fields, opts.edit149.note)
    // chat 135: "+ New squadron" pressed — a new row opened, as "+ New detachment" opened its fields (round 4): the
    // number box with a faded example (D2116's way), the place, and the first admin, a master admin's pick (D2191, D2247)
    if (opts.newForm) {
      const rn = R(l1, 'New squadron', 'Not saved yet')
      out.newForm = editor(rn, opts.newForm.fields, opts.newForm.note)
      out.newRow = rn
    }
    if (opts.newSqn) {
      const add = mq.strip(window.__mqBtn.cloneNode(true)); add.textContent = '+ New squadron'
      const addWrap = document.createElement('div'); addWrap.setAttribute('data-mine', '1'); addWrap.style.cssText = 'margin:10px 0 4px'; addWrap.appendChild(add); sec.appendChild(addWrap)
      add.style.whiteSpace = 'nowrap'
      out.add = add
    }
    // chat 135: the time zone is the place's (D2196) — a Places list under the squadrons, as the 19 Nov drawing has it
    {
      const wrap = document.createElement('div'); wrap.setAttribute('data-mine', '1'); wrap.style.marginTop = '14px'
      sec.appendChild(wrap)
      const h = H('Places · 1'); const l2 = list(); wrap.appendChild(h); wrap.appendChild(l2)
      R(l2, 'Home base', '142 · 149 · Perth · GMT+8')
      out.places = wrap
    }
    const mine = Math.round(sec.querySelector('.acc-name').getBoundingClientRect().left - panel.getBoundingClientRect().left)
    if (mine < realInset) { sec.style.paddingLeft = (realInset - mine) + 'px'; sec.style.paddingRight = (realInset - mine) + 'px'; h3c.style.paddingLeft = (realInset - mine) + 'px' }
    out.r149 = r149
    window.__mqSq = out
    window.__mqClipEl = panel
    return { inset: { realInset, mine } }
  }, { opts })
}
async function adminClip(page, sz, extra = 0) {
  return page.evaluate(({ sz, extra }) => {
    const mq = window.__mq, pg = document.querySelector('#page-admin')
    const panel = window.__mqClipEl, pr = panel.getBoundingClientRect()
    const cats = [...pg.querySelectorAll('button.adm-cat')].filter(mq.vis)
    const left = sz === 'd' && cats.length ? Math.min(pr.left, cats[0].getBoundingClientRect().left) - 12 : 0
    const x = Math.max(0, left), w = sz === 'd' ? Math.min(innerWidth - x, pr.right + 12 - x) : innerWidth
    let bottom = pr.bottom
    if (sz === 'd' && cats.length) bottom = Math.max(bottom, cats[cats.length - 1].getBoundingClientRect().bottom)
    return { x, y: 0, width: w, height: Math.min(innerHeight, bottom + 14 + extra) }
  }, { sz, extra })
}
async function b3(sz) {
  const { ctx, page } = await world(sz)
  await toAdmin(page)
  await squadrons(page, { newSqn: true })
  await page.evaluate(() => { const mq = window.__mq; mq.mark(window.__mqSq.add, 'right'); mq.markNew(window.__mqSq.places, 'pad') })
  await page.waitForTimeout(250)
  const f = `b1-3-${sz}.png`
  await shot(page, f, await adminClip(page, sz))
  rec(f, 'b1-3', sz, `Admin → Squadrons, as a master admin sees it: the two squadrons, 142 and 149, both at Home base, "Perth · GMT+8" in each row's grey line (round 7's approved rows). No detachment sections — they come in batch 2 — so the category's grey line reads "Places". New (pink): "+ New squadron", the Users editor's own button re-lettered, shown only to a master admin.`)
  await ctx.close()
}

// ---------- b1-4 · 149's row opened on its place, the TIME ZONE select (round 4's 8-place + draw-r7f.mjs F3) ----------
async function b4(sz) {
  const { ctx, page } = await world(sz)
  await toAdmin(page)
  await squadrons(page, { newSqn: true, edit149: {
    fields: [['Place', 'sel', '', ['Home base', 'Northern base', '+ New place…']]],
    note: 'Saved at once; counts from tomorrow.' } })
  const st = await page.evaluate(() => {
    const mq = window.__mq, e = window.__mqSq.edit
    mq.mark(window.__mqSq.add, 'right'); mq.markNew(window.__mqSq.places, 'pad')
    const fs = [...e.ed.querySelectorAll('.mfield')]
    return { fields: fs.map(f => f.querySelector('label').textContent + '=' + f.querySelector('select').options[0].textContent), note: e.noteEl.textContent }
  })
  notes.push(`b4 ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f = `b1-4-${sz}.png`
  await shot(page, f, await adminClip(page, sz))
  rec(f, 'b1-4', sz, `The same page, 149's row opened on its place (round 4's approved place row): PLACE "Home base", and beside it round 7's approved TIME ZONE select, "Perth · GMT+8". The line under them reads "Saved at once; counts from tomorrow." — the approved card's line without its promise that the squadrons can plan each other's people (that comes in batch 3). "+ New squadron" (pink) as on the picture before.`)
  await ctx.close()
}

// ---------- b1-5 · Request access with "Squadron" first (round 2's pic4, its proposed frame) ----------
async function b5(sz) {
  const { ctx, page } = await world(sz, { user: 'newbie', pass: 'x' })
  await page.waitForSelector('#accSend')
  await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
  await page.locator('h2.acc-h').click()
  await page.waitForTimeout(300)
  await page.evaluate(() => { const c = document.querySelector('#accSend').closest('form') || document.querySelector('#accSend').parentElement; let k = c; while (k && k.parentElement && k.getBoundingClientRect().width < 300) k = k.parentElement; window.__mqClipEl = k.closest('.login-card, .lcard, [class*="card"]') || k })
  const st = await page.evaluate(() => {
    const mq = window.__mq
    const cat = document.querySelector('#accCat'), lab = document.querySelector('label[for="accCat"]')
    const cs = document.querySelector('label[for="accCs"]')
    const l2 = mq.strip(lab.cloneNode(true)); l2.textContent = 'Squadron'
    const s2 = mq.strip(cat.cloneNode(true)); s2.innerHTML = ''
    for (const t of ['Pick…', '142', '149']) { const o = document.createElement('option'); o.textContent = t; s2.appendChild(o) }
    s2.selectedIndex = 1
    cs.before(l2, s2)
    return { labels: [...window.__mqClipEl.querySelectorAll('label')].filter(mq.vis).map(l => l.textContent) }
  })
  notes.push(`b5 ${sz}: ${JSON.stringify(st)}`)
  const clip = await page.evaluate(() => { const r = window.__mqClipEl.getBoundingClientRect(), pad = 14; return { x: Math.max(0, r.left - pad), y: Math.max(0, r.top - pad), width: Math.min(innerWidth, r.width + 2 * pad), height: Math.min(innerHeight - Math.max(0, r.top - pad), r.height + 2 * pad) } })
  const f = `b1-5-${sz}.png`
  await shot(page, f, clip)
  rec(f, 'b1-5', sz, `Round 2's approved "Request access" card: "Squadron" is its first choice, reading 142 (choices 142 and 149), the real CAT choice cloned. The request goes to that squadron's admins only.`)
  await ctx.close()
}

// ---------- b1-6 · Admin → Users, Saber's row opened: "Home squadron · 142" (NEW) above "Other squadrons · 149 · View" ----------
// draw-r7d.mjs d1 copied whole (Hex's row opened and re-lettered Saber with Saber's own list line, since the app does
// not open one's own account); its blue ring dropped (approved, drawn plain). NEW: a grey line "Home squadron · 142" in
// the row's own grey-line look, above the Other squadrons field — a line, not a choice: the home squadron changes only
// by a transfer (batch 4).
async function b6(sz) {
  const { ctx, page } = await world(sz)
  await toUsers(page)
  const real = await page.evaluate(() => {
    const b = [...document.querySelectorAll('#page-admin button.acc-main')].find(x => /^Saber/.test(x.innerText.trim()))
    const row = b.closest('.acc-row') || b.parentElement
    const chip = [...row.querySelectorAll('*')].find(e => !e.children.length && /^(member|admin)$/i.test(e.textContent.trim()))
    return { sub: b.querySelector('.acc-sub') ? b.querySelector('.acc-sub').textContent : '', chip: chip ? chip.textContent : '' }
  })
  const hex = page.locator('#page-admin button.acc-main', { hasText: /^Hex/ }).first()
  await hex.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  await hex.click()
  await page.waitForSelector('#accEdSave'); await page.waitForTimeout(400)
  const st = await page.evaluate((real) => {
    const mq = window.__mq
    const ed = document.querySelector('#accEdSave').closest('.acc-edit')
    const rowR = ed.closest('.acc-row') || ed.parentElement
    const nm = rowR.querySelector('.acc-name'); nm.textContent = 'Saber'
    const sb = rowR.querySelector('.acc-sub'); if (sb && real.sub) sb.textContent = real.sub.replace(/\s*YOU\s*$/i, '')
    const sin = ed.querySelector('#accEdName'); sin.value = 'ad'; sin.setAttribute('value', 'ad')
    const role = ed.querySelector('#accEdRole'); role.value = 'admin'
    const chip = [...rowR.querySelectorAll('*')].find(e => !e.children.length && /^(member|admin)$/i.test(e.textContent.trim()))
    if (chip) chip.textContent = real.chip || 'Admin'
    const col = ed.querySelector('.adm-2col'), mfSel = [...col.querySelectorAll('.mfield')].find(f => f.querySelector('select'))
    const c = mq.strip(col.cloneNode(false))
    const f = mq.strip(mfSel.cloneNode(true)); f.querySelector('label').textContent = 'Other squadrons'
    const s = f.querySelector('select'); s.innerHTML = ''; const o = document.createElement('option'); o.textContent = '149 · View'; s.appendChild(o); s.selectedIndex = 0; s.removeAttribute('aria-label')
    c.appendChild(f); col.after(c)
    // NEW: the home squadron, a line in the row's own grey-line look
    const home = document.createElement('div'); home.setAttribute('data-mine', '1'); home.className = 'acc-sub'
    // padded so the mark's outline stands clear of its letters; the negative margin keeps the words on the fields' edge
    home.textContent = 'Home squadron · 142'; home.style.cssText = 'display:block;width:fit-content;margin:0 0 6px -6px;padding:3px 6px;white-space:nowrap'
    c.before(home)
    mq.mark(home, 'right')
    const row = ed.closest('.acc-row') || ed.parentElement
    window.__mqClipEl = row
    row.scrollIntoView({ block: 'center' })
    document.activeElement && document.activeElement.blur && document.activeElement.blur()
    return { fields: [...ed.querySelectorAll('.mfield label')].map(l => l.textContent), real }
  }, real)
  notes.push(`b6 ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f = `b1-6-${sz}.png`
  await shot(page, f, await clipOf(page, { pad: 14, top: 40 }))
  rec(f, 'b1-6', sz, `Admin → Users, Saber's row opened (round 7's approved picture): "Other squadrons", its one choice "149 · View". New (pink): the line "Home squadron · 142" above it, in the row's own grey-line look — shown, not chosen here: a man's home squadron changes only by a transfer.`)
  await ctx.close()
}

// ---------- b1-7 · Admin → Users → New person: a "Home squadron" choice, the admin's own (142) picked (NEW) ----------
// Real: the foot's "Add a person" form. Drawn: a row of its own at the form's top, the form's own Pilot / WSO choice
// cloned and re-lettered "Home squadron", its choices 142 and 149, 142 picked (the admin's own).
async function b7(sz) {
  const { ctx, page } = await world(sz)
  await toUsers(page)
  const st = await page.evaluate(() => {
    const mq = window.__mq
    const blk = document.querySelector('#accAddBlock')
    const firstCol = blk.querySelector('.adm-2col')
    const seatF = document.querySelector('#accAddSeat').closest('.mfield')
    const c = mq.strip(firstCol.cloneNode(false))
    const f = mq.strip(seatF.cloneNode(true)); f.querySelector('label').textContent = 'Home squadron'
    const s = f.querySelector('select'); s.innerHTML = ''
    for (const t of ['142', '149']) { const o = document.createElement('option'); o.textContent = t; s.appendChild(o) }
    s.selectedIndex = 0
    c.appendChild(f); firstCol.before(c)
    mq.mark(f, 'pad')
    window.__mqClipEl = blk
    blk.scrollIntoView({ block: 'center' })
    document.activeElement && document.activeElement.blur && document.activeElement.blur()
    return { labels: [...blk.querySelectorAll('.mfield label')].map(l => l.textContent) }
  })
  notes.push(`b7 ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f = `b1-7-${sz}.png`
  await shot(page, f, await clipOf(page, { pad: 16 }))
  rec(f, 'b1-7', sz, `Admin → Users, the "Add a person" form at the foot of the list. New (pink): "Home squadron", a choice of 142 or 149, the admin's own squadron (142) picked to start; the form's own Pilot / WSO choice cloned. Everything else as built.`)
  await ctx.close()
}

// ---------- b1-8 · the shared holiday list: 149's admin adds Fri 7 Aug; each squadron's own Off days (NEW) ----------
// draw-r7d.mjs d6 copied whole (the date picked for real on the window's own calendar, the top bar's "142" re-lettered
// "149", the approved amber warning drawn plain). NEW: at the right of the Kind label a quiet line in the Calendar
// window's own hint look ("Public holidays and Off days, the whole year."): Off days stay each squadron's own.
async function b8(sz) {
  const { ctx, page } = await world(sz)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await page.waitForTimeout(800)
  await page.locator('[data-testid="settings-open"]').filter({ visible: true }).first().click()
  await page.locator('[data-testid="settings-days"]').filter({ visible: true }).first().click()
  await page.waitForSelector('[data-testid="win-days"]')
  if (await page.locator('[data-testid="days-tabs"]').filter({ visible: true }).count()) await page.locator('[data-testid="days-tab-holidays"]').filter({ visible: true }).first().click()
  await page.locator('[data-testid="hol-add"]').filter({ visible: true }).first().click()
  await page.waitForSelector('[data-testid="win-holiday"]'); await page.waitForTimeout(500)
  for (let i = 0; i < 12; i++) {
    const m = await page.locator('[data-testid="holcal"]').getAttribute('data-month')
    if (m === '2026-08') break
    await page.locator('[data-testid="holcal-prev"]').click(); await page.waitForTimeout(120)
  }
  await page.locator('[data-testid="holcal-day-2026-08-07"]').click(); await page.waitForTimeout(300)
  const st = await page.evaluate(() => {
    const mq = window.__mq
    mq.asSqn('149')
    const win = document.querySelector('[data-testid="win-holiday"]')
    const acts = win.querySelector('.hol-acts')
    const w = document.createElement('div'); w.className = 'hol-nocover'; w.setAttribute('data-mine', '1')
    const sp = document.createElement('span'); sp.textContent = '142\'s published Fri 7 Aug and 149\'s published Fri 7 Aug become holidays after publishing: each needs republishing for its OIL. Both squadrons\' admins are told.'
    w.appendChild(sp); acts.before(w)
    // NEW: on the Kind label's own row, at its right, a quiet line in the Calendar window's hint look — on that row so
    // the window grows no taller (a line of its own pushed the amber warning under the window's foot on a phone)
    const kindLab = win.querySelector('#holKindLab')
    const hint = document.createElement('span'); hint.setAttribute('data-mine', '1')
    hint.textContent = 'Off days stay each squadron\'s own'
    const real = document.querySelector('[data-testid="win-days"] .days-hint')
    const cs = real ? getComputedStyle(real) : null
    const lb = kindLab.getBoundingClientRect()
    if (getComputedStyle(kindLab).position === 'static') kindLab.style.position = 'relative'
    hint.style.cssText = `position:absolute;right:0;top:50%;transform:translateY(-50%);white-space:nowrap;text-transform:none;letter-spacing:normal;font-weight:400;padding:1px 4px;` +
      (cs ? `font-size:${cs.fontSize};color:${cs.color};font-family:${cs.fontFamily}` : '')
    kindLab.appendChild(hint)
    const lb2 = kindLab.getBoundingClientRect()
    if (Math.abs(lb2.height - lb.height) > 0.5) throw new Error('b8: the Kind row grew')
    mq.mark(hint, 'left')
    window.__mqClipEl = win
    const body = win.querySelector('.win-body')
    // the window's body scrolls (draw-r7d.mjs d6): brought to its foot, so the whole warning shows above the buttons
    for (let a = w.parentElement; a && a !== win.parentElement; a = a.parentElement) if (a.scrollHeight > a.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(a).overflowY)) a.scrollTop = a.scrollHeight
    const ttl = win.querySelector('.win-ttl'); ttl && ttl.click()
    return { dates: win.querySelector('[data-testid="hol-dates"]').getAttribute('data-from'), bodyScroll: body ? [body.scrollHeight, body.clientHeight] : null,
      hintStyle: cs ? [cs.fontSize, cs.color] : 'no real hint' }
  })
  if (st.dates !== '2026-08-07') throw new Error('b8: date not picked ' + JSON.stringify(st))
  notes.push(`b8 ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f = `b1-8-${sz}.png`
  await shot(page, f, await clipOf(page, { pad: 10 }))
  rec(f, 'b1-8', sz, `Leave War → settings → Calendar → Holidays → "+ Add", as 149's admin (the top bar's "142" re-lettered "149"), Fri 7 Aug picked on the window's own calendar; round 7's approved amber warning before Save, naming both squadrons' published days. New (pink): a quiet line at the right of the KIND label, "Off days stay each squadron's own" — the two squadrons at one place share their public holidays (the warning above names both), each keeping its own Off days.`)
  await ctx.close()
}

// probe 2: Admin → Users' add form, its markup
async function probe2(sz) {
  const { ctx, page } = await world(sz)
  await toUsers(page)
  console.log(await page.evaluate(() => {
    const f = document.querySelector('#accAddCs'); let k = f
    while (k.parentElement && !/adm-panel/.test(k.parentElement.className)) k = k.parentElement
    const out = []; for (let n = k; n; n = n.nextElementSibling) out.push(n.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').slice(0, 3000))
    const q = []; for (let n = k.previousElementSibling, i = 0; n && i < 3; n = n.previousElementSibling, i++) q.push(n.outerHTML.slice(0, 300))
    return 'PREV:' + q.join(' || ') + ' NODE+:' + out.join(' --- ')
  }))
  await ctx.close()
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
// ---------- b9 · chat 135: "+ New squadron" pressed (Saber, the master admin) ----------
async function b9(sz) {
  const { ctx, page } = await world(sz)
  await toAdmin(page)
  await squadrons(page, { newForm: {
    fields: [['Squadron number', 'in', '', null, '150'], ['Place', 'sel', '', ['Home base', 'Northern base', '+ New place…']],
      ['First admin', 'sel', '', ['Pick an admin…', 'Hunter · 142', 'Kestrel · 149', 'Osprey · 149']]],
    note: 'The first admin gets Plan of 150: full access to it, so 150 never starts without an admin.' } })
  await page.evaluate(() => { const mq = window.__mq; mq.markNew(window.__mqSq.newRow, 'in') })
  await page.waitForTimeout(250)
  const f = `b1-9-${sz}.png`
  await shot(page, f, await adminClip(page, sz))
  rec(f, 'b1-9', sz, `"+ New squadron" pressed, as Saber, the master admin: a new row opens under 142 and 149 (as "+ New detachment" opened its fields). New (pink): the squadron's number, a faded "150" showing what to type; its place; and its first admin, picked from the admins of the squadrons there are — he gets Plan of the new squadron, so it never starts with no admin.`)
  await ctx.close()
}

// ---------- b10 · his D2298: "+ New place…" picked in the new squadron's Place list — its name and time zone in the form ----------
async function b10(sz) {
  const { ctx, page } = await world(sz)
  await toAdmin(page)
  await squadrons(page, { newForm: {
    fields: [['Squadron number', 'in', '150', null, ''], ['Place', 'sel', '', ['+ New place…', 'Home base']],
      ['New place\'s name', 'in', 'Northern base', null, ''], ['Time zone', 'sel', '', ['Darwin · GMT+9:30', 'Perth · GMT+8', 'Brisbane · GMT+10']],
      ['First admin', 'sel', '', ['Hunter · 142', 'Kestrel · 149', 'Osprey · 149']]],
    note: 'Saved together: 150 and its new place, Northern base. Hunter gets Plan of 150: full access to it, so 150 never starts without an admin.' } })
  await page.evaluate(() => {
    const mq = window.__mq, ed = window.__mqSq.newForm.ed
    const fs = [...ed.querySelectorAll('.mfield')].filter(f => /New place's name|Time zone/.test(f.querySelector('label').textContent))
    mq.markNew(fs[0].parentElement, 'in')
  })
  await page.waitForTimeout(250)
  const f = `b1-10-${sz}.png`
  await shot(page, f, await adminClip(page, sz))
  rec(f, 'b1-10', sz, `The same row with "+ New place…" picked from its Place list (his "yes"): the place's name and its time zone open right there in the form, no going somewhere else first. Save makes 150 and its new place together; the place then shows on the Places list for every squadron.`)
  await ctx.close()
}

const ALL = { b1, b2, b3, b4, b5, b6, b7, b8, b9, b10 }
try {
  if (process.env.MQ_PROBE === '2') { await probe2(process.env.MQ_SZ || 'd') }
  else if (process.env.MQ_PROBE) { await probe(process.env.MQ_SZ || 'd') }
  else for (const sz of (process.env.MQ_SZ ? process.env.MQ_SZ.split(',') : ['d', 'p'])) {
    console.log('== ' + SIZES[sz].name)
    for (const [k, f] of Object.entries(ALL)) {
      if (ONLY && !ONLY.includes(k)) continue
      try { await f(sz) } catch (e) { errs.push(`[${sz}] ${k} FAILED: ${e.message}`); console.log(k, 'FAILED', e.message) }
    }
  }
} finally {
  await browser.close()
}
if (!process.env.MQ_PROBE) {
  let old = {}
  try { old = JSON.parse(readFileSync(`${IMG}/manifest.json`, 'utf8')) } catch {}
  const merged = { ...old, ...manifest }
  writeFileSync(`${IMG}/manifest.json`, JSON.stringify(Object.fromEntries(Object.keys(merged).sort().map(k => [k, merged[k]])), null, 2) + '\n')
}
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
