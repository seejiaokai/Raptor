/* [UI-CONSISTENCY-LOOK] round 3 built (D1134–D1137) — the walk, written as assertions of the RIGHT behaviour (a PASS means
   correct), so running it again on a fixed build IS the re-walk (bug-check order §5). Every place a pencil is drawn is SEEN
   (the solid drawing there, no typed ✎ / ✏ left) and PRESSED (it still does its job): Quals, Logic, the Scheduler Board's
   Templates menu, its "+ Block" menu, its plans menu (a plan made first with "+ Alt Plan"), a row's CX window, a jet's
   stores list, the Inputs list's dates pop-up, a note in a day on the Inputs calendar, the input window's title box, the
   Tracker's bar, Course / Syllabus / File menus, a ball's pop-up, Edit chart layout's tools and the Students card; the
   Tracker's labels against Quals' "Viewing"; the Medical row and the Inputs list's dates button. Desktop 1536 × 864 (his
   PC) and a phone 402 × 874 by touch.
   Answers 5–7 (D1138, D1139, D1170 — sizes57 and the break test): Help's and Admin's titles against Logic's page name, the
   Inputs list's two buttons 36, every control on the Tracker's bar as tall as its dropdowns at nine widths, its height set
   beside a build of the old look (bar-before.json, by cr3-barheights.mjs), each control pressed at its new height.
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/cr3-walk.mjs → <folder>/walk/ (CR3_WALK_DIR) */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/' + (process.env.CR3_WALK_DIR || 'walk')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const results = []; const errors = []
const ok = (name, pass, detail = '') => { results.push({ name, pass: !!pass, detail }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')) }
let n = 0
const shot = async (page, name, clip) => { await page.screenshot({ path: `${OUT}/${String(++n).padStart(2, '0')}-${name}.png`, ...(clip ? { clip } : {}) }) }
async function world(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(`${vp.width}: page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${vp.width}: console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${vp.width}: ${r.status()} ${r.url()}`) })
  page.on('dialog', d => d.dismiss().catch(() => {}))
  await page.goto(BASE + '/'); await login(page, 'a')
  await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' })
  return { ctx, page }
}
const press = async (page, sel, touch) => { const l = page.locator(sel).first(); await l.scrollIntoViewIfNeeded().catch(() => {}); if (touch) await l.tap(); else await l.click(); await sleep(450) }
const esc = async page => { await page.keyboard.press('Escape'); await sleep(300) }
const visible = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel)].some(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' }), sel)
/* the pencil inside a control: the solid drawing (filled, turned -45°), how big it is against the control's letters, and
   whether any typed ✎ / ✏ is left in its words */
const penIn = (page, sel, cls = 'pen-ic') => page.evaluate(([sel, cls]) => {
  const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!b) return null
  const svg = b.querySelector('svg.' + cls); const g = svg && svg.querySelector('g')
  const r = svg ? svg.getBoundingClientRect() : null
  return { has: !!svg, solid: !!g && g.getAttribute('fill') === 'currentColor' && g.getAttribute('transform') === 'rotate(-45 12 12)',
    w: r ? Math.round(r.width) : 0, typed: /[✎✏]/.test(b.textContent), text: b.textContent.trim().slice(0, 40), fs: parseFloat(getComputedStyle(b).fontSize) }
}, [sel, cls])
const penOk = (tag, what, p) => ok(`${tag} ${what}: the solid pencil, no typed mark`, p && p.has && p.solid && !p.typed && p.w >= 9, p ? `${p.w}px, "${p.text}"` : 'not found')
/* any typed pencil left as a visible mark anywhere on screen (a sentence of help text says so in words, never as a mark) */
const typedLeft = page => page.evaluate(() => [...document.querySelectorAll('button, [role=button], .ren, .x, span.ren')]
  .filter(e => e.getBoundingClientRect().width > 0 && /[✎✏]/.test(e.textContent)).map(e => e.textContent.trim().slice(0, 30)))
async function openBoard(page) {
  await go(page, 'editsched'); await sleep(300)
  await page.locator('#eWeek [data-sbday="0"]:visible').first().click(); await page.waitForSelector('#schedBoard'); await sleep(600)
}
const closeBoard = page => page.evaluate(() => document.querySelector('#sbDone')?.click()).then(() => sleep(400))
const boxOf = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, b: r.bottom, r: r.right } }, sel)
const around = async (page, name, sel, pad = 16) => { const b = await boxOf(page, sel); if (b) await shot(page, name, { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: Math.min(b.w + pad * 2, page.viewportSize().width - Math.max(0, b.x - pad)), height: Math.min(b.h + pad * 2, page.viewportSize().height - Math.max(0, b.y - pad)) }); else await shot(page, name) }

/* ================= the desktop ================= */
{
  const PC = { width: 1536, height: 864 }
  const { ctx, page } = await world(PC, false)
  const tag = 'pc'
  /* --- Quals and Logic: "Edit" --- */
  await go(page, 'quals'); await sleep(400)
  penOk(tag, 'Quals "Edit"', await penIn(page, '#qEdit'))
  await around(page, 'pc-quals-edit', '#qEdit, #qExport', 20)
  await press(page, '#qEdit', false)
  ok(`${tag} Quals "Edit" pressed: editing, Done shown`, await visible(page, '#qSave'))
  await press(page, '#qSave', false)
  ok(`${tag} Quals: Done ends editing, "Edit" back`, await visible(page, '#qEdit'))
  await go(page, 'logic'); await sleep(400)
  penOk(tag, 'Logic "Edit"', await penIn(page, '#lgEdit'))
  const qe = await boxOf(page, '#lgEdit')
  await around(page, 'pc-logic-edit', '#lgEdit', 20)
  await press(page, '#lgEdit', false)
  ok(`${tag} Logic "Edit" pressed: editing, Done shown`, await visible(page, '#lgDone'))
  await press(page, '#lgDone', false)
  ok(`${tag} Logic: the row stays one line`, qe && qe.h <= 40, qe ? `Edit ${Math.round(qe.h)} tall` : '')

  /* --- the Scheduler Board --- */
  await openBoard(page)
  await page.locator('#schedBoard button:visible', { hasText: 'Templates' }).first().click(); await sleep(450)
  penOk(tag, 'board Templates "Manage templates"', await penIn(page, '.wavemenu [data-daytpledit]'))
  await around(page, 'pc-board-templates', '.wavemenu', 10)
  await press(page, '.wavemenu [data-daytpledit]', false)
  ok(`${tag} "Manage templates" pressed: the day templates window opens`, await visible(page, '#daytplModal'))
  await page.locator('#daytplClose').click(); await sleep(300)   /* its own ✕ — Escape does not close it (older; the sheet §7) */
  /* "+ Block": its heading's pencil, alone */
  const blk = page.locator('#schedBoard [data-dwadd]:visible').first()
  if (await blk.count()) {
    await blk.scrollIntoViewIfNeeded(); await blk.click(); await sleep(450)
    penOk(tag, 'board "+ Block" menu\'s heading pencil', await penIn(page, '.wavemenu [data-blkedit]'))
    await around(page, 'pc-board-block', '.wavemenu', 10)
    await press(page, '.wavemenu [data-blkedit]', false)
    ok(`${tag} the "+ Block" pencil pressed: the duty templates window opens`, await visible(page, '#tplModal'))
    await page.locator('#tplClose').click(); await sleep(300)
  } else ok(`${tag} board "+ Block" found`, false)
  /* the plans menu: one plan made with "+ Alt Plan", then its own pencil and "Manage plans" */
  await page.locator('#schedBoard .planselbtn:visible').first().click(); await sleep(450)
  await press(page, '.wavemenu [data-plandup]', false); await sleep(300)
  if (!(await visible(page, '.wavemenu [data-planedit]'))) { await page.locator('#schedBoard .planselbtn:visible').first().click(); await sleep(450) }
  penOk(tag, 'board plans menu: a plan\'s pencil', await penIn(page, '.wavemenu [data-planedit]'))
  penOk(tag, 'board plans menu: "Manage plans"', await penIn(page, '.wavemenu [data-planmanage]'))
  await around(page, 'pc-board-plans', '.wavemenu', 10)
  await press(page, '.wavemenu [data-planmanage]', false)
  ok(`${tag} "Manage plans" pressed: the plans window opens`, await visible(page, '#draftsModal'))
  await page.locator('#draftsClose').click(); await sleep(300)
  /* a row's CX window */
  const cx = page.locator('#schedBoard button:visible').filter({ hasText: /^CX$/ }).first()
  await cx.scrollIntoViewIfNeeded(); await cx.click(); await page.waitForSelector('#cxPop:not([hidden])'); await sleep(350)
  penOk(tag, 'the CX window\'s "Edit"', await penIn(page, '#cxPop [data-cxedit]'))
  await around(page, 'pc-board-cx', '#cxReason, #cxPop [data-cxedit]', 30)
  await press(page, '#cxPop [data-cxedit]', false)
  ok(`${tag} the CX "Edit" pressed: the reasons list opens`, await visible(page, '#cxEdit'))
  await page.locator('#cxPop [data-cxdone]').click().catch(() => {}); await sleep(200)
  await page.locator('#cxClose').click().catch(() => esc(page)); await sleep(300)
  /* a jet's stores list */
  const st = page.locator('#schedBoard [data-stcfg]:visible').first(); await st.scrollIntoViewIfNeeded(); await st.click(); await sleep(450)
  penOk(tag, 'a jet\'s stores list pencil', await penIn(page, '.stmenu .st-pen'))
  await around(page, 'pc-board-stores', '.stmenu', 10)
  await press(page, '.stmenu .st-pen', false)
  ok(`${tag} the stores pencil pressed: the list is in edit (lit)`, await page.evaluate(() => !!document.querySelector('.stmenu .st-pen.on')))
  await press(page, '.stmenu .st-pen', false)
  ok(`${tag} pressed again: out of edit`, await page.evaluate(() => !document.querySelector('.stmenu .st-pen.on')))
  await esc(page)
  ok(`${tag} the board: no typed pencil left on screen`, (await typedLeft(page)).length === 0, (await typedLeft(page)).join(' | '))
  await closeBoard(page)

  /* --- Inputs: the list's dates button and its pop-up, a calendar note, the input window's title box --- */
  await go(page, 'inputs'); await sleep(500)
  await press(page, '#inListBtn', false)
  const rb = await page.evaluate(() => { const b = document.querySelector('#inRangeBtn'); return { svg: !!b.querySelector('svg.btnglyph'), emoji: /📅/.test(b.textContent), text: b.textContent.trim() } })
  ok(`${tag} the Inputs list's dates button wears the line calendar, no emoji`, rb.svg && !rb.emoji, rb.text)
  /* and beside its words, on one line — the first build stacked it above them on a desktop (found picturing round 3b) */
  const side = await page.evaluate(() => { const b = document.querySelector('#inRangeBtn'), s = b.querySelector('svg').getBoundingClientRect(), t = b.querySelector('.inrange-t').getBoundingClientRect(); return { beside: s.right <= t.left + 1, mid: Math.round(Math.abs((s.top + s.height / 2) - (t.top + t.height / 2))), h: Math.round(b.getBoundingClientRect().height), nh: Math.round(document.querySelector('#inNew').getBoundingClientRect().height) } })
  ok(`${tag} the dates button's calendar sits beside its dates, one line, as tall as "+ Input"`, side.beside && side.mid <= 3 && side.h === side.nh, JSON.stringify(side))
  await around(page, 'pc-inputs-list-row', '#inNew, #inRangeBtn', 14)
  await press(page, '#inRangeBtn', false)
  ok(`${tag} the dates button pressed: its pop-up opens`, await visible(page, '#inRangePop'))
  penOk(tag, 'the dates pop-up\'s "Default window"', await penIn(page, '#inRangeEdit'))
  await around(page, 'pc-inputs-defwindow', '#inRangeEdit', 14)
  await press(page, '#inRangeEdit', false)
  ok(`${tag} "Default window" pressed: its weeks box shows`, await visible(page, '#inLookWeeks'))
  await press(page, '#inRangeBtn', false)
  await press(page, '#inCalBtn', false)
  await page.locator('#inpCal [data-icday="2026-07-16"]').click({ position: { x: 8, y: 8 } }); await sleep(500)
  await page.locator('#icAddPuck').click(); await sleep(200)
  await page.locator('.ic-newnote .ic-poppuck-edit').fill('Brief at 0700'); await page.keyboard.press('Enter'); await sleep(400)
  penOk(tag, 'a calendar note\'s pencil (was the ✏ emoji)', await penIn(page, '[data-ppedit]'))
  await around(page, 'pc-inputs-note', '.ic-secs', 12)
  await press(page, '[data-ppedit]', false)
  ok(`${tag} the note's pencil pressed: its words open to type`, await visible(page, '.ic-note .ic-poppuck-edit'))
  await esc(page)
  await page.locator('[data-ppdel]').first().click().catch(() => {}); await sleep(250)
  await esc(page)
  /* the input window's title box (a commitment kind) */
  await press(page, '#inListBtn', false); await press(page, '#inNew', false); await sleep(400)
  const kind = page.locator('#inpEditType').first()
  if (await kind.count()) { const opts = await kind.evaluate(s => [...s.options].map(o => o.value)); const pick = opts.find(v => /^(Meeting|Duty|Event|Appointment)/i.test(v)); if (pick) { await kind.selectOption(pick); await sleep(300) } }
  const tb = await penIn(page, '.inped-pen')
  ok(`${tag} the input window's title box: the solid pencil inside it`, tb && tb.has && tb.solid, tb ? `${tb.w}px` : 'no title box shown for the kind picked')
  if (tb) await around(page, 'pc-input-titlebox', '.inped-pen', 60)
  await esc(page); await esc(page)

  /* --- Medical --- */
  await press(page, '#inCalBtn', false); await press(page, '#inMedBtn', false); await sleep(400)
  const mn = await boxOf(page, '#medNew'), mc = await boxOf(page, '#medCalBtn')
  ok(`${tag} Medical: "+ Medical" first, at the left, before "as of"`, mn && mc && mn.r <= mc.x + 1, mn && mc ? `+ Medical x ${Math.round(mn.x)}, as of x ${Math.round(mc.x)}` : '')
  /* "+ Input" stands on the tabs' left edge (measured: both 12 at 1536, 8 at 402) — "+ Medical" must too (D1137) */
  const li = await page.evaluate(() => Math.round(document.querySelector('.inputs-tabs').getBoundingClientRect().left))
  ok(`${tag} Medical: "+ Medical" on the tabs' left edge, where "+ Input" stands`, mn && Math.abs(mn.x - li) <= 1, mn ? `+ Medical ${Math.round(mn.x)}, tabs ${li}` : '')
  const fr = await page.evaluate(() => { const v = document.querySelector('#medView'); const c = getComputedStyle(v); return { bw: c.borderTopWidth, sec: [...document.querySelectorAll('#medView .med-sec, #medView section')].filter(e => parseFloat(getComputedStyle(e).borderTopWidth) > 0).length } })
  ok(`${tag} Medical: no frame round the tab, the sections keep their boxes`, fr.bw === '0px' && fr.sec >= 3, `frame ${fr.bw}, boxed sections ${fr.sec}`)
  ok(`${tag} Medical: "+ Medical" the same height as "as of"`, mn && mc && Math.abs(mn.h - mc.h) <= 1, mn && mc ? `${Math.round(mn.h)} / ${Math.round(mc.h)}` : '')
  await shot(page, 'pc-medical', { x: 0, y: 56, width: 1536, height: 330 })
  /* the as-of picker hangs under its own button, inside the screen (the code read's finding 2: under "+ Medical" at first) */
  await press(page, '#medCalBtn', false)
  const pk = await page.evaluate(() => { const c = document.querySelector('.med-cal').getBoundingClientRect(), b = document.querySelector('#medCalBtn').getBoundingClientRect(); return { dx: Math.round(c.left - b.left), r: Math.round(c.right), vw: innerWidth, below: c.top >= b.bottom } })
  ok(`${tag} the as-of picker opens under "as of", inside the screen`, pk.below && pk.r <= pk.vw && (pk.dx === 0 || pk.r >= pk.vw - 13), JSON.stringify(pk))
  await shot(page, 'pc-medical-asof-open', { x: 0, y: 50, width: Math.min(page.viewportSize().width, 700), height: 500 })
  await page.locator('.med-cal-scrim').click({ position: { x: 5, y: 300 } }).catch(() => esc(page)); await sleep(300)
  await press(page, '#medNew', false); await sleep(400)
  const kindNow = await page.evaluate(() => { const s = document.querySelector('#inpEditType'); return s ? s.value : '' })
  ok(`${tag} "+ Medical" pressed: the input window opens on ATT C`, /ATT C/.test(kindNow), kindNow)
  await esc(page); await esc(page)

  /* --- the Tracker --- */
  await go(page, 'tracker'); await sleep(900)
  penOk(tag, 'the Tracker bar\'s course pencil', await penIn(page, '#courseMenuBtn', 'trkpen'))
  penOk(tag, 'the Tracker bar\'s syllabus pencil', await penIn(page, '#sylMenuBtn', 'trkpen'))
  /* the labels, against Quals' "Viewing" */
  const lab = await page.evaluate(() => [...document.querySelectorAll('#page-tracker .lbltx')].map(e => { const c = getComputedStyle(e); return [e.textContent, c.fontSize, c.fontWeight, c.letterSpacing, c.textTransform, c.color].join('|') }))
  await go(page, 'quals'); await sleep(300)
  const view = await page.evaluate(() => { const e = document.querySelector('#page-quals .seglab'); const c = getComputedStyle(e); return [c.fontSize, c.fontWeight, c.letterSpacing, c.textTransform, c.color].join('|') })
  await go(page, 'tracker'); await sleep(600)
  ok(`${tag} the Tracker's three labels wear Quals' "Viewing" style`, lab.length === 3 && lab.every(l => l.split('|').slice(1).join('|') === view), lab.map(l => l.split('|')[0]).join(', ') + ' · ' + view)
  const bar = await page.evaluate(() => { const els = ['#activeSel', '#courseSel', '#courseMenuBtn', '#sylSel', '#sylMenuBtn', '#detailsBtn', '#showAllBtn', '#fileMenuBtn'].map(s => document.querySelector(s).getBoundingClientRect()); const mids = els.map(r => r.top + r.height / 2); return { spread: Math.round(Math.max(...mids) - Math.min(...mids)), h: Math.round(document.querySelector('#page-tracker header').getBoundingClientRect().height) } })
  ok(`${tag} the Tracker's bar stays one line`, bar.spread <= 3, `middles within ${bar.spread}px, bar ${bar.h} tall`)
  await shot(page, 'pc-tracker-bar', { x: 0, y: 56, width: 1200, height: 60 })
  /* the Course menu */
  await press(page, '#courseMenuBtn', false)
  penOk(tag, 'Course menu "Rename course"', await penIn(page, '#renCourse', 'trkpen'))
  for (const id of ['ordCourse', 'delCourse']) {
    const g = await page.evaluate(id => { const b = document.querySelector('#' + id); return { svg: !!b.querySelector('svg.trkglyph'), typed: /[⇅🗑]/u.test(b.textContent), t: b.textContent.trim() } }, id)
    ok(`${tag} Course menu "${g.t}": a line icon, no typed mark`, g.svg && !g.typed)
  }
  await around(page, 'pc-trk-coursemenu', '#addCourse, #delCourse', 12)
  await press(page, '#ordCourse', false)
  ok(`${tag} "Reorder courses" pressed: its window opens`, await page.evaluate(() => [...document.querySelectorAll('.modal, [role=dialog]')].some(e => e.getBoundingClientRect().width > 0 && /order|course/i.test(e.textContent))))
  await esc(page); await esc(page)
  /* the Syllabus menu */
  await press(page, '#sylMenuBtn', false)
  penOk(tag, 'Syllabus menu "Edit chart layout"', await penIn(page, '#arrangeBtn', 'trkpen'))
  penOk(tag, 'Syllabus menu "Rename syllabus"', await penIn(page, '#renSyl', 'trkpen'))
  for (const id of ['dupSyl', 'ordSyl', 'delSyl']) {
    const g = await page.evaluate(id => { const b = document.querySelector('#' + id); return { svg: !!b.querySelector('svg.trkglyph'), typed: /[⇅⧉🗑]/u.test(b.textContent), t: b.textContent.trim() } }, id)
    ok(`${tag} Syllabus menu "${g.t}": a line icon, no typed mark`, g.svg && !g.typed)
  }
  await around(page, 'pc-trk-sylmenu', '#arrangeBtn, #delSyl', 12)
  await press(page, '#arrangeBtn', false); await sleep(400)
  const textTool = await page.evaluate(() => { const b = [...document.querySelectorAll('#arrTools button')].find(b => /Text$/.test(b.textContent.trim())); if (b) b.id = 'zzTextTool'; return !!b })
  ok(`${tag} "Edit chart layout" pressed: the chart tools show`, textTool)
  penOk(tag, 'Edit chart layout\'s "Text" tool', await penIn(page, '#zzTextTool', 'trkpen'))
  await around(page, 'pc-trk-texttool', '#zzTextTool', 24)
  await press(page, '#zzTextTool', false)
  ok(`${tag} the Text tool pressed: it is the tool in use`, await page.evaluate(() => document.querySelector('#zzTextTool').classList.contains('primary')))
  await press(page, '#sylMenuBtn', false); await press(page, '#arrangeBtn', false); await sleep(300)
  ok(`${tag} "Done editing chart": out of chart layout`, !(await visible(page, '#arrTools.on')))
  /* the File menu */
  await press(page, '#fileMenuBtn', false)
  for (const id of ['importFileBtn', 'exportBtn']) {
    const g = await page.evaluate(id => { const b = document.querySelector('#' + id); return { svg: !!b.querySelector('svg.trkglyph'), typed: /[⇪⤓]/u.test(b.textContent), t: b.textContent.trim() } }, id)
    ok(`${tag} File menu "${g.t}": a line icon, no typed mark`, g.svg && !g.typed)
  }
  await around(page, 'pc-trk-filemenu', '#importFileBtn, #exportBtn', 12)
  await press(page, '#exportBtn', false)
  ok(`${tag} "Export…" pressed: its window opens`, await page.evaluate(() => [...document.querySelectorAll('.modal, [role=dialog]')].some(e => e.getBoundingClientRect().width > 0)))
  await esc(page); await esc(page)
  /* a ball's pop-up */
  const ball = await page.evaluate(() => { const g = document.querySelector('#flowSvg .ball'); const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })
  await page.mouse.click(ball.x, ball.y); await page.waitForSelector('#popEditInfo', { state: 'visible', timeout: 5000 }); await sleep(300)
  penOk(tag, 'a ball\'s pop-up "Edit details"', await penIn(page, '#popEditInfo', 'trkpen'))
  await around(page, 'pc-trk-pop', '#popEditInfo', 40)
  await press(page, '#popEditInfo', false)
  ok(`${tag} "Edit details" pressed: the details window opens`, await visible(page, '#infoModal'))
  await esc(page); await esc(page)
  /* the Students card */
  const chips = await page.evaluate(() => [...document.querySelectorAll('#page-tracker .chips .chip')].filter(c => c.querySelector('[data-rm]')).filter(c => c.getBoundingClientRect().width > 0).map(c => ({ pen: !!c.querySelector('.ren svg.trkpen'), x: !!c.querySelector('.x svg.trkglyph'), typed: /[✎×]/.test(c.textContent), pw: Math.round(c.querySelector('.ren svg')?.getBoundingClientRect().width || 0) })))
  ok(`${tag} Students card: each name's rename is the solid pencil and its remove the drawn ✕`, chips.length >= 2 && chips.every(c => c.pen && c.x && !c.typed), JSON.stringify(chips))
  const oc = await page.evaluate(() => { const b = document.querySelector('#ordCrew'); return { svg: !!b.querySelector('svg.trkglyph'), typed: /⇅/.test(b.textContent) } })
  ok(`${tag} Students card "Reorder": the line icon`, oc.svg && !oc.typed)
  ok(`${tag} Students card: each ✕ is named for a screen reader ("Remove this student")`, await page.evaluate(() => [...document.querySelectorAll('#page-tracker .chips [data-rm]')].every(x => x.getAttribute('aria-label') === 'Remove this student')))
  await around(page, 'pc-trk-students', '#ordCrew, #addStu, #page-tracker .chips', 12)
  await press(page, '#ordCrew', false)
  ok(`${tag} "Reorder" pressed: the crew order window opens`, await page.evaluate(() => [...document.querySelectorAll('.modal, [role=dialog]')].some(e => e.getBoundingClientRect().width > 0)))
  await esc(page); await esc(page)
  ok(`${tag} the Tracker: no typed pencil left on screen`, (await typedLeft(page)).length === 0, (await typedLeft(page)).join(' | '))
  /* the close-up beside the typed ✎ he chose: the app's pencil and the character side by side, at the same size */
  await page.evaluate(() => { const d = document.createElement('div'); d.id = 'zzPair'; d.style.cssText = 'position:fixed;left:20px;top:200px;z-index:99999;background:#14181D;padding:14px 18px;border-radius:10px;color:#F1F4F7;font:600 40px/1 "Segoe UI Symbol","Segoe UI",sans-serif;display:flex;gap:28px;align-items:center'; d.innerHTML = '<span>✎</span>' + document.querySelector('#courseMenuBtn svg').outerHTML.replace('class="', 'style="width:40px;height:40px" class="'); document.body.appendChild(d) })
  await around(page, 'pc-pencil-closeup', '#zzPair', 6)
  await page.evaluate(() => document.querySelector('#zzPair')?.remove())
  await sizes57(page, tag, false, 30)
  await ctx.close()
}

/* ---- round 3's answers 5–7 (D1138, D1139, D1170), measured and pressed at each width ---- */
async function sizes57(page, tag, touch, barH) {
  const font = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const c = getComputedStyle(e); return { size: c.fontSize, weight: c.fontWeight, spacing: c.letterSpacing } }, sel)
  /* D1138 — Help's and Admin's titles at Logic's page name's size and weight, each in its own place */
  await go(page, 'logic'); await sleep(400)
  const lg = await font('#page-logic h1')
  for (const [pg, sel] of [['help', '#page-help h2'], ['admin', '#page-admin .adm-rail h2']]) {
    await page.evaluate(p => window.go(p), pg); await page.waitForFunction(p => window.CURPAGE === p, pg); await sleep(450)
    const t = await font(sel), b = await boxOf(page, sel)
    ok(`${tag} ${pg}'s title: Logic's page name's size and weight`, t && lg && t.size === lg.size && t.weight === lg.weight && t.spacing === lg.spacing, `${t && t.size} ${t && t.weight} vs Logic ${lg && lg.size} ${lg && lg.weight}`)
    ok(`${tag} ${pg}'s title: in its place, top left of the page's column`, b && b.y < 140 && b.h < 30, b ? `at ${Math.round(b.x)},${Math.round(b.y)}, ${Math.round(b.h)} tall` : 'not found')
    await shot(page, `${tag}-q5-${pg}-title`, { x: 0, y: 40, width: Math.min(page.viewportSize().width, 1000), height: 180 })
  }
  /* Admin's rail still works: a category opens its pane (on a phone, the drill-in) */
  await press(page, '#page-admin .adm-cat:not(.on)', touch)
  ok(`${tag} Admin: a category pressed opens its pane`, await visible(page, '#page-admin .adm-pane'))
  /* D1139 — the desktop Inputs list's "+ Input" and dates button 36 tall; a phone keeps its 36 (D910) */
  await go(page, 'inputs'); await sleep(500)
  await press(page, '#inMemberMode', touch)
  await press(page, '#inListBtn', touch)
  const hs = await page.evaluate(() => Object.fromEntries(['#inNew', '#inRangeBtn', '#inCalBtn', '#inListBtn', '#inGear'].map(s => [s, Math.round((document.querySelector(s)?.getBoundingClientRect().height || 0) * 10) / 10])))
  ok(`${tag} the Inputs list's "+ Input" and dates button are 36 tall, as its other buttons`, hs['#inNew'] === 36 && hs['#inRangeBtn'] === 36 && hs['#inCalBtn'] === 36, JSON.stringify(hs))
  const one = await page.evaluate(() => { const b = document.querySelector('#inRangeBtn'), s = b.querySelector('svg').getBoundingClientRect(), t = b.querySelector('.inrange-t').getBoundingClientRect(); return s.right <= t.left + 1 && Math.abs((s.top + s.bottom) / 2 - (t.top + t.bottom) / 2) <= 3 })
  ok(`${tag} the dates button stays one line, its calendar beside the dates`, one)
  const reach = await page.evaluate(() => ['inNew', 'inRangeBtn'].map(id => { const b = document.getElementById(id), r = b.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top - 3); return !!h && (h === b || b.contains(h)) }))
  ok(`${tag} the two buttons pressed 46: a press 3px above each still meets it`, reach.every(Boolean), JSON.stringify(reach))
  await shot(page, `${tag}-q6-inputs-list`, { x: 0, y: 40, width: Math.min(page.viewportSize().width, 1536), height: touch ? 140 : 170 })
  await press(page, '#inRangeBtn', touch)
  ok(`${tag} the dates button pressed: its pop-up opens under it`, await visible(page, '#inRangePop'))
  await esc(page)
  await press(page, '#inNew', touch)
  ok(`${tag} "+ Input" pressed: the input window opens`, await visible(page, '#inpEditType'))
  await esc(page); await esc(page)
  await press(page, '#inCalBtn', touch)
  /* D1170 — every control on the Tracker's bar as tall as its dropdowns */
  await go(page, 'tracker'); await sleep(900)
  const bar = await page.evaluate(() => { const hd = document.querySelector('#page-tracker header')
    return { hd: Math.round(hd.getBoundingClientRect().height), c: [...hd.querySelectorAll('select, button, .findbox')].filter(b => b.getClientRects().length && !b.closest('.menupanel')).map(b => ({ id: b.id || b.className, h: Math.round(b.getBoundingClientRect().height * 10) / 10, w: Math.round(b.getBoundingClientRect().width) })) } })
  const off = bar.c.filter(c => c.h !== barH)
  ok(`${tag} the Tracker's bar: every control ${barH} tall, as its dropdowns`, bar.c.length >= 8 && off.length === 0, off.length ? JSON.stringify(off) : bar.c.map(c => c.id + ' ' + c.h).join(', '))
  await shot(page, `${tag}-q7-tracker-bar`, { x: 0, y: 40, width: Math.min(page.viewportSize().width, 1536), height: touch ? 110 : 70 })
  /* a menu's items keep their own size, and each control still does its job at its new height */
  await press(page, '#courseMenuBtn', touch)
  const item = await page.evaluate(() => Math.round(document.querySelector('#addCourse').getBoundingClientRect().height))
  ok(`${tag} the Course menu's items keep their size (not stretched to the bar)`, item > 0 && item < barH, `${item} tall`)
  await around(page, `${tag}-q7-coursemenu`, '#courseMenuBtn, #delCourse', 10)
  await esc(page)
  await press(page, '#legendBtn', touch)
  ok(`${tag} Legend pressed: its pop-out opens`, await visible(page, '#trkLegend'))
  await esc(page)
  await press(page, '#flexBtn', touch)
  ok(`${tag} the gear pressed: the flex settings open`, await visible(page, '#trkFlexWin'))
  const fb = await page.evaluate(() => [...document.querySelectorAll('#trkFlexWin button.sm')].map(b => Math.round(b.getBoundingClientRect().height)))
  ok(`${tag} the flex window's own buttons keep their size (40, their own rule)`, fb.length > 0 && fb.every(h => h === 40), JSON.stringify(fb))
  await esc(page)
  await press(page, '#detailsBtn', touch)
  ok(`${tag} ⓘ pressed: on`, await page.evaluate(() => document.querySelector('#detailsBtn').getAttribute('aria-pressed') === 'true'))
  await press(page, '#detailsBtn', touch)
  if (touch) {
    await press(page, '#hSearchBtn', touch)
    const sp = await page.evaluate(() => ['.findbox', '#hSearchClear'].map(s => Math.round(document.querySelector(s).getBoundingClientRect().height)))
    ok(`${tag} the search strip: its box and ✕ as tall as the bar's controls`, sp.every(h => h === barH), JSON.stringify(sp))
    await shot(page, `${tag}-q7-search-strip`, { x: 0, y: 40, width: page.viewportSize().width, height: 150 })
    await esc(page)
  } else {
    await page.locator('#hSearch').fill('ST'); await sleep(400)
    ok(`${tag} the search typed: it finds`, await page.evaluate(() => /match|of/.test(document.querySelector('#hSearchStat').textContent)))
    await press(page, '#hSearchClear', touch)
    ok(`${tag} the search's ✕ pressed: cleared`, await page.evaluate(() => document.querySelector('#hSearch').value === ''))
    await press(page, '#showAllBtn', touch)
    ok(`${tag} Show All pressed: its panel opens`, await visible(page, '#showAllPanel'))
    await esc(page)
  }
  await press(page, '#barHideBtn', touch)
  ok(`${tag} Hide pressed: the bar hides, its strip in its place`, await visible(page, '#barShowBtn') && !(await visible(page, '#page-tracker header')))
  await press(page, '#barShowBtn', touch)
  ok(`${tag} the strip pressed: the bar is back`, await visible(page, '#page-tracker header'))
  /* the save corner's button takes the bar's height too (probed: a bar button put in the slot, as "✓ Save changes" sits) */
  const sv = await page.evaluate(() => { const s = document.querySelector('#page-tracker .saveslot'); const b = document.createElement('button'); b.className = 'sm dirty'; b.textContent = '✓ Save changes ●'; s.appendChild(b); const h = Math.round(b.getBoundingClientRect().height); b.remove(); return h })
  ok(`${tag} the save corner's "✓ Save changes" takes the bar's height`, sv === barH, `${sv} tall`)
}

/* ================= the phone ================= */
{
  const PH = { width: 402, height: 874 }
  const { ctx, page } = await world(PH, true)
  const tag = 'phone'
  await go(page, 'quals'); await sleep(400)
  penOk(tag, 'Quals "Edit"', await penIn(page, '#qEdit'))
  await press(page, '#qEdit', true)
  ok(`${tag} Quals "Edit" tapped: editing`, await visible(page, '#qSave'))
  await press(page, '#qSave', true)
  await shot(page, 'phone-quals', { x: 0, y: 50, width: 402, height: 110 })
  await go(page, 'inputs'); await sleep(500)
  await press(page, '#inListBtn', true)
  const rb = await page.evaluate(() => { const b = document.querySelector('#inRangeBtn'); return { svg: !!b.querySelector('svg.btnglyph'), emoji: /📅/.test(b.textContent), r: Math.round(b.getBoundingClientRect().right), h: Math.round(b.getBoundingClientRect().height) } })
  const row = await page.evaluate(() => { const ids = ['#inNew', '#inRangeBtn', '#inCalBtn', '#inListBtn']; const rs = ids.map(s => document.querySelector(s)?.getBoundingClientRect()).filter(Boolean); return Math.round(Math.max(...rs.map(r => r.top)) - Math.min(...rs.map(r => r.top))) })
  ok(`${tag} the Inputs list's dates button: the line calendar, one row with + Input and the switch`, rb.svg && !rb.emoji && row <= 2, `tops within ${row}px, ${rb.h} tall`)
  const side = await page.evaluate(() => { const b = document.querySelector('#inRangeBtn'), s = b.querySelector('svg').getBoundingClientRect(), t = b.querySelector('.inrange-t').getBoundingClientRect(); return { beside: s.right <= t.left + 1, mid: Math.round(Math.abs((s.top + s.height / 2) - (t.top + t.height / 2))) } })
  ok(`${tag} the dates button's calendar sits beside its dates, one line`, side.beside && side.mid <= 3, JSON.stringify(side))
  await shot(page, 'phone-inputs-list', { x: 0, y: 50, width: 402, height: 130 })
  await press(page, '#inCalBtn', true)
  await page.locator('#inpCal [data-icday="2026-07-16"]').tap({ position: { x: 8, y: 8 } }); await sleep(600)
  await page.locator('#icAddPuck').tap(); await sleep(250)
  await page.locator('.ic-newnote .ic-poppuck-edit').fill('Brief at 0700'); await page.keyboard.press('Enter'); await sleep(400)
  penOk(tag, 'a calendar note\'s pencil', await penIn(page, '[data-ppedit]'))
  await around(page, 'phone-inputs-note', '.ic-secs', 10)
  await press(page, '[data-ppedit]', true)
  ok(`${tag} the note's pencil tapped: its words open`, await visible(page, '.ic-note .ic-poppuck-edit'))
  await esc(page)
  await page.locator('[data-ppdel]').first().tap().catch(() => {}); await sleep(250)
  await esc(page)
  await press(page, '#inMedBtn', true); await sleep(400)
  const mn = await boxOf(page, '#medNew'), mc = await boxOf(page, '#medCalBtn')
  ok(`${tag} Medical: "+ Medical" first, then "as of", one row`, mn && mc && mn.r <= mc.x + 1 && Math.abs(mn.y - mc.y) <= 2, mn && mc ? `${Math.round(mn.x)} / ${Math.round(mc.x)}` : '')
  ok(`${tag} Medical: no frame round the tab`, await page.evaluate(() => getComputedStyle(document.querySelector('#medView')).borderTopWidth === '0px'))
  await shot(page, 'phone-medical', { x: 0, y: 50, width: 402, height: 420 })
  /* the as-of picker hangs under its own button, inside the screen (the code read's finding 2: under "+ Medical" at first) */
  await press(page, '#medCalBtn', true)
  const pk = await page.evaluate(() => { const c = document.querySelector('.med-cal').getBoundingClientRect(), b = document.querySelector('#medCalBtn').getBoundingClientRect(); return { dx: Math.round(c.left - b.left), r: Math.round(c.right), vw: innerWidth, below: c.top >= b.bottom } })
  ok(`${tag} the as-of picker opens under "as of", inside the screen`, pk.below && pk.r <= pk.vw && (pk.dx === 0 || pk.r >= pk.vw - 13), JSON.stringify(pk))
  await shot(page, 'phone-medical-asof-open', { x: 0, y: 50, width: Math.min(page.viewportSize().width, 700), height: 500 })
  await page.locator('.med-cal-scrim').click({ position: { x: 5, y: 300 } }).catch(() => esc(page)); await sleep(300)
  await press(page, '#medNew', true); await sleep(400)
  const k = await page.evaluate(() => { const s = document.querySelector('#inpEditType'); return s ? s.value : '' })
  ok(`${tag} "+ Medical" tapped: the window opens on ATT C`, /ATT C/.test(k), k)
  await esc(page); await esc(page)
  await go(page, 'tracker'); await sleep(900)
  penOk(tag, 'the Tracker bar\'s course pencil', await penIn(page, '#courseMenuBtn', 'trkpen'))
  ok(`${tag} the Tracker's labels stay hidden on a phone`, !(await visible(page, '#page-tracker .lbltx')))
  await press(page, '#sylMenuBtn', true)
  penOk(tag, 'Syllabus menu "Rename syllabus"', await penIn(page, '#renSyl', 'trkpen'))
  ok(`${tag} Syllabus menu's other items: line icons`, await page.evaluate(() => ['dupSyl', 'ordSyl', 'delSyl'].every(id => { const b = document.querySelector('#' + id); return b.querySelector('svg.trkglyph') && !/[⇅⧉🗑]/u.test(b.textContent) })))
  await around(page, 'phone-trk-sylmenu', '#arrangeBtn, #delSyl', 10)
  await esc(page)
  await shot(page, 'phone-tracker-bar', { x: 0, y: 40, width: 402, height: 120 })
  ok(`${tag} the Tracker: no typed pencil left on screen`, (await typedLeft(page)).length === 0, (await typedLeft(page)).join(' | '))
  await sizes57(page, tag, true, 26)
  await ctx.close()
}

/* break test: the Tracker's bar either side of its 1050 break — a narrow desktop where the bar wraps keeps 30, a tablet 26 */
const { barNow } = await import('./cr3-barheights.mjs')
const BAR_BASE = existsSync(SHOTS + '/bar-before.json') ? JSON.parse(readFileSync(SHOTS + '/bar-before.json', 'utf8')) : null
for (const [w, barH, grow] of [[1536, 30, 0], [1440, 30, 0], [1300, 30, 0], [1100, 30, 2], [1051, 30, 2], [1050, 26, 0], [402, 26, 0], [375, 26, 0], [320, 26, 0]]) {
  const { ctx, page } = await world({ width: w, height: 800 }, w < 600)
  await go(page, 'tracker'); await sleep(900)
  const c = await page.evaluate(() => [...document.querySelector('#page-tracker header').querySelectorAll('select, button, .findbox')].filter(b => b.getClientRects().length && !b.closest('.menupanel')).map(b => ({ id: b.id || b.className, h: Math.round(b.getBoundingClientRect().height * 10) / 10 })))
  const off = c.filter(x => x.h !== barH)
  ok(`${w} wide: every control on the Tracker's bar ${barH} tall`, c.length >= 8 && off.length === 0, off.length ? JSON.stringify(off) : `${c.length} controls`)
  /* the bar's height against the old look, measured on a build of it (cr3-barheights.mjs → bar-before.json): where the bar is
     one row, and on a phone, it is no taller; where a narrow desktop wraps it, its second row (no dropdown on it) is 2 taller */
  const was = BAR_BASE && BAR_BASE[w], now = await barNow(page)
  ok(`${w} wide: the bar grows ${grow ? 'at most ' + grow : 'no taller'} (${now.rows} row${now.rows > 1 ? 's' : ''})`, was && now.h <= was.h + grow + 0.2 && now.rows === was.rows, was ? `${was.h} → ${now.h}` : 'no baseline')
  await shot(page, `w${w}-q7-tracker-bar`, { x: 0, y: 40, width: w, height: 110 })
  await ctx.close()
}

await browser.close()
const pass = results.filter(r => r.pass).length
ok('no page error, console error or failed request', errors.length === 0, errors.slice(0, 5).join(' · '))
writeFileSync(OUT + '/results.json', JSON.stringify({ pass: results.filter(r => r.pass).length, total: results.length, results, errors }, null, 1))
console.log(`\n${results.filter(r => r.pass).length}/${results.length} PASS`)
