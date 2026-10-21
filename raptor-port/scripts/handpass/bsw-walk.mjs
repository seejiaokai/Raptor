/* [BOARD-SIDE-WIDTH] — the walk of the built bundle (D1113, D1116, D1118–D1120), written as assertions of the RIGHT
   behaviour, so a PASS is correct and a re-run is the re-walk. Three sizes: his PC (1536 × 864), a small desktop
   (1024 × 768, where 40% is 410) and his iPhone's (402 × 874, touch). Fixtures by the app's own controls: + Wave →
   AVALON on the board and a man placed on its line from the crew list; the one exception, an ATT B input, goes through
   the Inputs' own write (window.fileInput → writeInputs, the door the Inputs page uses) — the filing is not what changed.
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/bsw-walk.mjs  → <folder>/walk.json */
console.log('bsw-walk v3')
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/' + (process.env.WALK_DIR || 'walk')
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const res = []
const check = (id, ok, saw) => { res.push({ id, ok: !!ok, saw }); console.log((ok ? 'PASS ' : 'FAIL ') + id + ' — ' + saw) }
const errors = []

async function world(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: touch ? 3 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(`${vp.width}: PAGEERROR ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${vp.width}: ${m.text()}`) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, 'a')
  return { ctx, page }
}
const ids = page => page.evaluate(() => { const P = window.PEOPLE, f = cs => Object.keys(P).find(k => P[k].cs === cs); return { havoc: f('Havoc'), comet: f('Comet'), nomad: f('Nomad') } })
const noToasts = page => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
const press = async (page, sel, touch) => { const l = page.locator(sel).first(); await l.scrollIntoViewIfNeeded(); if (touch) await l.tap(); else await l.click(); await sleep(450) }
const openBoard = async (page, touch) => { await go(page, 'editsched'); await press(page, '#eWeek [data-sbday="0"]:visible', touch); await page.waitForSelector('#schedBoard:not([hidden])'); await sleep(400) }
const closeBoard = async page => { await page.evaluate(() => (document.querySelector('#sbDone') || [...document.querySelectorAll('#schedBoard button')].find(b => /Done|Close/.test(b.textContent)))?.click()); await sleep(500) }
const entry = (page, scope, id) => page.evaluate(([s, id]) => {
  const e = document.querySelector(`${s} .rpuck[data-person="${id}"]`); if (!e) return null
  const p = e.querySelector('.puck').getBoundingClientRect(), w = e.querySelector('.rwhy'), r = w && w.getBoundingClientRect()
  return { cls: e.className, why: w ? w.textContent : '', beside: !!r && r.left >= p.right - 1 && r.top < p.bottom, under: !!r && r.top >= p.bottom - 1, opacity: getComputedStyle(e).opacity, title: e.title }
}, [scope, id])
const section = (page, scope, cls) => page.evaluate(([s, c]) => {
  const sec = document.querySelector(`${s} .${c}`); if (!sec) return null
  return { head: sec.querySelector('.rh,.rh2').textContent, looks: [...sec.querySelectorAll('.rpuck')].map(e => e.classList.contains('no') ? 'X' : (e.classList.contains('busy') ? 'd' : 'F')).join('') }
}, [scope, cls])
const sideW = page => page.evaluate(() => Math.round(document.querySelector('#schedBoard .sb-side').getBoundingClientRect().width))
const shot = async (page, name, clipSel) => {
  await noToasts(page)
  if (clipSel) { const b = await page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: Math.max(0, r.left), y: Math.max(0, r.top), width: Math.min(r.width, innerWidth), height: Math.min(r.height, innerHeight - Math.max(0, r.top)) } }, clipSel); await page.screenshot({ path: `${OUT}/${name}.png`, clip: b }) }
  else await page.screenshot({ path: `${OUT}/${name}.png` })
}
const dragGrip = async (page, dx) => {
  const g = await page.locator('#schedBoard [data-sidegrip]').boundingBox()
  const x = g.x + g.width / 2, y = g.y + g.height / 2
  await page.mouse.move(x, y); await page.mouse.down()
  for (let i = 1; i <= 10; i++) await page.mouse.move(x + dx * i / 10, y)
  await page.mouse.up(); await sleep(200)
}
const reasonsAll = page => page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-roster .rcol .rpuck.no.haswhy, #schedBoard .sb-roster .rsans .rpuck.no.haswhy')].map(e => {
  const p = e.querySelector('.puck').getBoundingClientRect(), r = e.querySelector('.rwhy').getBoundingClientRect(), side = document.querySelector('#schedBoard .sb-side').getBoundingClientRect()
  /* the rule (D1118, the ALL AVAIL window's): beside where 92 is free beside the puck in what holds it, under where not */
  const room = e.parentElement.getBoundingClientRect().width - p.width - 6
  return { beside: r.left >= p.right - 1 && r.top < p.bottom, under: r.top >= p.bottom - 1, room: Math.round(room), strike: Math.round(parseFloat(getComputedStyle(e, '::after').width)), puck: Math.round(p.width), inside: r.right <= side.right + 1 }
}))

/* ================= his PC, 1536 × 864 ================= */
{
  const { ctx, page } = await world({ width: 1536, height: 864 })
  const P = await ids(page)
  await page.evaluate(id => window.fileInput({ person: id, date: 'Jul 13', allday: true, type: 'ATT B', remarks: 'Medically down', mod: '2026-07-10' }), P.havoc)
  await openBoard(page)
  /* the fixture: + Wave → AVALON, Comet put on its first line from the crew list */
  await press(page, '#schedBoard [data-wvadd="0"]:visible'); await press(page, '.wavemenu [data-wmkind="avalon"]')
  const gi = await page.evaluate(() => window.DAYS[0].waves.length - 1)
  await press(page, `#schedBoard [data-slot="0.${gi}.0.0.p"]:visible`)
  await press(page, `#sbRoster .rpuck[data-person="${P.comet}"]:visible`)
  check('fixture: Comet on the AVALON line', await page.evaluate(([gi, id]) => window.DAYS[0].waves[gi].formations[0].aircraft[0].p === id, [gi, P.comet]), 'placed by arming its seat and tapping him in the crew list')
  await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click()); await sleep(300)

  /* no place picked */
  const R = '#schedBoard .sb-roster'
  let h = await entry(page, R, P.havoc), c = await entry(page, R, P.comet)
  check('D1118 ATT B, no seat: full colour, its words', h && /grounded/.test(h.cls) && !/busy|\bno\b/.test(h.cls) && h.why === 'ATT B: no flying' && h.opacity === '1', JSON.stringify(h))
  check('D1120 AVALON man, no seat: the standby look, not faded', c && /standby/.test(c.cls) && !/busy/.test(c.cls) && /AVALON standby/.test(c.title), JSON.stringify(c))
  const pil = await section(page, R, 'rcols > .rcol')
  check('D1118 Pilots count leaves Havoc out, Comet counted', /Pilots · \d+ free/.test(pil.head), pil.head + ' ' + pil.looks)
  const order = await page.evaluate(([h]) => [...document.querySelectorAll('#schedBoard .sb-roster .rcols > .rcol:first-child .rpuck')].map(e => e.dataset.person === h ? 'H' : (e.classList.contains('busy') ? 'd' : (e.classList.contains('no') ? 'X' : 'F'))).join(''), [P.havoc])
  check('D1118 Havoc straight after the free men', /^F+Hd*X*$/.test(order), order)
  const sans = await section(page, R, 'rsans')
  check('D1119 SANS heading counted, free first', /SANS Avail · \d+ free/.test(sans.head) && /^F*d*X*$/.test(sans.looks), sans.head + ' ' + sans.looks)
  await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-roster'); r.scrollTop = 0 })
  await shot(page, 'pc-none-side', '#schedBoard .sb-side')
  check('grip present on the desktop', await page.locator('#schedBoard [data-sidegrip]').isVisible(), 'visible')

  /* a desk picked at 320: reasons under, strike across the puck only */
  await press(page, '#schedBoard [data-fill="d:0.0.0.+"]:visible')
  let rs = await reasonsAll(page)
  check('320, desk picked: crew columns under; each reason beside where 92 is free, under where not', rs.length > 5 && rs.every(x => (x.room >= 92 ? x.beside : x.under)), `${rs.length} reasons: ${rs.filter(x => x.under).length} under, ${rs.filter(x => x.beside).length} beside (SANS rows, full width)`)
  check('D1118 strike across the puck only (puck − 6)', rs.every(x => x.strike === x.puck - 6), rs.slice(0, 3).map(x => `${x.strike}/${x.puck}`).join(' '))
  h = await entry(page, R, P.havoc)
  check('desk picked: Havoc (ATT B) free for the desk', h && !/\bno\b/.test(h.cls), JSON.stringify(h))
  await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-roster'); r.scrollTop = r.querySelector('.rcols').offsetTop - r.offsetTop - 8 })
  await shot(page, 'pc-desk-320', '#schedBoard .sb-side')

  /* order A: desk picked, THEN widened by the grip */
  await dragGrip(page, -400)
  check('D1113 dragged to 40% and no further', (await sideW(page)) === Math.round(1536 * 0.4), String(await sideW(page)))
  rs = await reasonsAll(page)
  check('the desk is still picked after the drag', (await page.evaluate(() => window.ARM && window.ARM.key)) === 'd:0.0.0.+', 'ARM kept')
  check('wide, desk picked: every reason beside its puck, inside the panel', rs.length > 5 && rs.every(x => x.beside && x.inside), `${rs.filter(x => x.beside).length} of ${rs.length} beside`)
  await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-roster'); r.scrollTop = r.querySelector('.rcols').offsetTop - r.offsetTop - 8 })
  await shot(page, 'pc-desk-wide-full')
  /* the board's day still usable: its first row's boxes inside the window, left of the panel */
  const dayOk = await page.evaluate(() => { const s = document.querySelector('#schedBoard .sb-side').getBoundingClientRect(), b = document.querySelector('#schedBoard .sb-line, #schedBoard .sb-arow').getBoundingClientRect(); return b.right <= s.left + 1 && b.width > 400 })
  check('the day narrows beside the panel, never under it', dayOk, 'first row right of panel edge')
  /* remembered: closed and opened again, then a reload */
  await closeBoard(page); await openBoard(page)
  check('remembered across closing the board', (await sideW(page)) === 614, String(await sideW(page)))
  await page.reload(); await page.waitForSelector('#vWeek .day', { state: 'attached' }).catch(() => {}); await sleep(500)
  if (await page.locator('#luser').count()) await login(page, 'a')
  await openBoard(page)
  check('remembered across a reload', (await sideW(page)) === 614, String(await sideW(page)))
  /* order B: widened first, THEN a seat picked (a blank line's front seat): the strip has no dot */
  await press(page, '#schedBoard [data-gline="0.0"]:visible')
  const fs = await page.evaluate(() => { const gi = 0, fi = window.DAYS[0].waves[0].formations.length - 1; return `0.${gi}.${fi}.0.p` })
  await press(page, `#schedBoard [data-slot="${fs}"]:visible`)
  const strip = await page.evaluate(() => document.querySelector('#schedBoard .ros-arm span')?.textContent.trim())
  check('D1119 the strip reads "Planning FCP" on a blank line', strip === 'Planning FCP', JSON.stringify(strip))
  h = await entry(page, R, P.havoc)
  check('front seat, wide: Havoc struck, his reason beside him', h && /\bno\b/.test(h.cls) && h.beside, JSON.stringify(h))
  await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-roster'); r.scrollTop = 0 })
  await shot(page, 'pc-front-wide', '#schedBoard .sb-side')
  await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click()); await sleep(300)
  /* the keyboard and the double-click */
  await page.locator('#schedBoard [data-sidegrip]').dblclick(); await sleep(200)
  check('a double-click puts it back to 320', (await sideW(page)) === 320, String(await sideW(page)))
  await page.locator('#schedBoard [data-sidegrip]').focus()
  for (let i = 0; i < 3; i++) { await page.keyboard.press('ArrowLeft'); await sleep(60) }
  check('← three times: 380', (await sideW(page)) === 380, String(await sideW(page)))
  await shot(page, 'pc-grip-focus', '#schedBoard .sb-side')
  await page.keyboard.press('End'); await sleep(80); const e = await sideW(page)
  await page.keyboard.press('Home'); await sleep(80); const hm = await sideW(page)
  check('End the widest, Home 320', e === 614 && hm === 320, `${e} / ${hm}`)
  /* a smaller window shows less, the width asked for comes back */
  await page.keyboard.press('End'); await sleep(80)
  await page.setViewportSize({ width: 1024, height: 768 }); await sleep(300)
  const small = await sideW(page)
  await page.setViewportSize({ width: 1536, height: 864 }); await sleep(300)
  check('window made smaller: clamped to 40%; larger again: back', small === 410 && (await sideW(page)) === 614, `${small} → ${await sideW(page)}`)
  await page.locator('#schedBoard [data-sidegrip]').dblclick(); await sleep(150)

  /* Edit Schedule's week: the same crew list, and its heading under the top bar (D1116) */
  await closeBoard(page); await go(page, 'editsched'); await sleep(400)
  const E = '.edit-board .eroster'
  h = await entry(page, E, P.havoc); c = await entry(page, E, P.comet)
  check('Edit Schedule: Havoc full colour, words under (puck-wide column)', h && /grounded/.test(h.cls) && h.under, JSON.stringify(h))
  check('Edit Schedule: Comet standby, not faded', c && /standby/.test(c.cls), JSON.stringify(c))
  check('Edit Schedule: no grip there', !(await page.locator('.edit-board [data-sidegrip]').count()), 'none')
  await page.evaluate(() => window.scrollTo(0, 900)); await sleep(350)
  const head = await page.evaluate(() => { const bar = document.querySelector('.topbar').getBoundingClientRect(), hd = document.querySelector('.edit-board .eroster .er-h').getBoundingClientRect(), hit = document.elementFromPoint(hd.left + 40, hd.top + hd.height / 2); return { y: scrollY, bar: Math.round(bar.bottom), top: Math.round(hd.top), on: !!(hit && hit.closest('.er-h')), text: document.querySelector('.edit-board .eroster .er-h').textContent.trim() } })
  check('D1116 scrolled: "AIRCREW · ‹ day ›" under the top bar, in sight', head.y > 400 && head.top >= head.bar && head.on, JSON.stringify(head))
  await shot(page, 'pc-week-scrolled')
  /* its ‹ › still steps the day while scrolled */
  await page.locator('.edit-board .eroster [data-crewstep="1"]').click(); await sleep(300)
  const head2 = await page.evaluate(() => document.querySelector('.edit-board .eroster .er-h').textContent.trim())
  check('D1116 the day picker works scrolled', head2 !== head.text && /TUESDAY|Tuesday/i.test(head2), `${head.text} → ${head2}`)
  await ctx.close()
}

/* ================= a small desktop, 1024 × 768 ================= */
{
  const { ctx, page } = await world({ width: 1024, height: 768 })
  await openBoard(page)
  await press(page, '#schedBoard [data-fill="d:0.0.0.+"]:visible')
  await dragGrip(page, -400)
  check('1024: 40% is 410', (await sideW(page)) === 410, String(await sideW(page)))
  const rs = await reasonsAll(page)
  check('1024, 410 wide: every reason beside, inside the panel', rs.length > 5 && rs.every(x => x.beside && x.inside), `${rs.filter(x => x.beside).length} of ${rs.length}`)
  await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-roster'); r.scrollTop = r.querySelector('.rcols').offsetTop - r.offsetTop - 8 })
  await shot(page, 'small-desk-410')
  await page.evaluate(() => window.scrollTo(0, 0)); await closeBoard(page)
  await go(page, 'editsched'); await page.evaluate(() => window.scrollTo(0, 900)); await sleep(350)
  const head = await page.evaluate(() => { const bar = document.querySelector('.topbar').getBoundingClientRect(), hd = document.querySelector('.edit-board .eroster .er-h')?.getBoundingClientRect(); return hd ? { bar: Math.round(bar.bottom), top: Math.round(hd.top), y: scrollY } : null })
  check('1024: Edit Schedule heading under the top bar when scrolled', head && head.top >= head.bar, JSON.stringify(head))
  await shot(page, 'small-week-scrolled')
  await ctx.close()
}

/* ================= his iPhone's size, 402 × 874, touch ================= */
{
  const { ctx, page } = await world({ width: 402, height: 874 }, true)
  const P = await ids(page)
  await page.evaluate(id => window.fileInput({ person: id, date: 'Jul 13', allday: true, type: 'ATT B', remarks: 'Medically down', mod: '2026-07-10' }), P.havoc)
  await openBoard(page, true)
  check('phone: no grip', !(await page.locator('#schedBoard [data-sidegrip]').isVisible()), 'hidden')
  await press(page, '#schedBoard .ros-tab:visible', true); await sleep(300)
  const R = '#schedBoard .sb-roster'
  const h = await entry(page, R, P.havoc)
  check('phone drawer: Havoc full colour, words under', h && /grounded/.test(h.cls) && h.under, JSON.stringify(h))
  const sans = await section(page, R, 'rsans')
  check('phone drawer: SANS counted, free first', /· \d+ free/.test(sans.head) && /^F*d*X*$/.test(sans.looks), sans.head + ' ' + sans.looks)
  await shot(page, 'phone-drawer')
  /* a blank line's front seat picked (the desk's "+" sits elsewhere on a phone): reasons under, strike across the puck */
  await press(page, '#schedBoard .ros-tab:visible', true)
  await press(page, '#schedBoard [data-gline="0.0"]:visible', true)
  const fs = await page.evaluate(() => `0.0.${window.DAYS[0].waves[0].formations.length - 1}.0.p`)
  await press(page, `#schedBoard [data-slot="${fs}"]:visible`, true); await sleep(300)
  check('phone: the front seat is picked', (await page.evaluate(() => window.ARM && window.ARM.key)) === fs, fs)
  const rs = await reasonsAll(page)
  check('phone, a seat picked: reasons under their pucks, strike on the puck', rs.length >= 2 && rs.every(x => x.under && x.strike === x.puck - 6), `${rs.filter(x => x.under).length} of ${rs.length} under`)
  await shot(page, 'phone-desk')
  await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click()); await sleep(300)
  /* the desktop layout on a phone: the side column stays 320, no grip (the crew drawer closed first, as a person would) */
  if (await page.evaluate(() => document.body.classList.contains('ros-open'))) await press(page, '#schedBoard .ros-tab:visible', true)
  await press(page, '#sbMore', true); await press(page, '#sbMoreWide', true); await sleep(400)
  const wide = await page.evaluate(() => ({ w: Math.round(document.querySelector('#schedBoard .sb-side').getBoundingClientRect().width), grip: getComputedStyle(document.querySelector('#schedBoard [data-sidegrip]')).display }))
  check('phone, desktop layout: side 320, no grip', wide.w === 320 && wide.grip === 'none', JSON.stringify(wide))
  await shot(page, 'phone-wide')
  await ctx.close()
}

check('no errors in the browser', errors.length === 0, errors.slice(0, 5).join(' | ') || 'none')
writeFileSync(`${OUT}/walk.json`, JSON.stringify({ res, errors }, null, 1))
console.log(`${res.filter(r => r.ok).length} / ${res.length} PASS`)
await browser.close()
