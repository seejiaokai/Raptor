/* WALK — [STANDBY-WEEK-B] (D1083, D1084, 20 Oct 26): the week's SC, AVALON and BB lines read R over B, then START over
   END; the B is the line's own box, the one the Scheduler Board writes. Written as assertions of the RIGHT behaviour, so a
   PASS means correct and a re-run is the re-walk. The fixture is made through the app's own controls: the waves added by
   the board's "+ Wave" menu, the men seated by arming a seat and tapping the crew list, the day published by its own
   sign-offs and Publish button, the B typed by a real press and real keys.
   Desktop 1440 × 900 by mouse (D1–D10); a phone 402 × 874 by touch (P1–P4).
   Run: HP_URL=http://localhost:4183 node scripts/handpass/walk-standby-week-b.mjs
   Pictures: docs/img/handpass/2026-10-20-standby-week-b/walk/ */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4183'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-20-standby-week-b/walk')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const results = [], errors = []
const check = (id, ok, said) => { results.push([id, ok, said]); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${said}`) }
let n = 0
/* the walk: */
const pic = async (p, name, loc) => { const f = resolve(OUT, `${String(++n).padStart(2, '0')}-${name}.png`); if (loc) await loc.screenshot({ path: f }); else await p.screenshot({ path: f }); return f }

async function start(phone) {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: false, colorScheme: 'dark' }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'dark' })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  p.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  p.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await p.goto(BASE + '/?fresh=1')
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.waitForTimeout(500)
  return { ctx, p }
}
/* a press where the person would put it: the element brought into view, then a finger or a mouse at its centre */
async function press(p, loc, phone) {
  await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' }))
  await p.waitForTimeout(150)
  const b = await loc.boundingBox()
  if (phone) await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await p.waitForTimeout(250)
}
const go = async (p, page) => { await p.evaluate(x => window.go(x), page); await p.waitForFunction(x => window.CURPAGE === x, page); await p.waitForTimeout(500) }
async function openBoard(p, phone) {
  await go(p, 'editsched')
  await press(p, p.locator('#eWeek [data-sbday="0"]:visible').first(), phone)
  await p.waitForSelector('#schedBoard'); await p.waitForTimeout(600)
}
async function closeBoard(p, phone) {
  /* the board's one way out, ✓ Done (on a phone its word is hidden, only the tick shows) */
  /* a menu left open (the + Wave menu) takes the first press outside it to close itself — as a person would, Done is
     pressed again while the board stands */
  for (let i = 0; i < 3 && (await p.locator('#schedBoard').isVisible().catch(() => false)); i++) { await press(p, p.locator('#sbDone:visible').first(), phone); await p.waitForTimeout(500) }
  /* the board stays in the page, hidden, once closed — so it is its being SHOWN that is asked */
  if ((await p.locator('#schedBoard').isVisible().catch(() => false))) throw new Error('the board did not close')
  await p.waitForTimeout(400)
}
/* the three standby waves added through the board's own "+ Wave" menu */
async function addWaves(p, phone) {
  for (const k of ['sc', 'avalon', 'bb']) {
    await press(p, p.locator('#schedBoard [data-wvadd="0"]:visible').first(), phone)
    await press(p, p.locator(`[data-wmkind="${k}"]:visible`).first(), phone)
    await p.waitForTimeout(400)
  }
  return p.evaluate(() => ['sc', 'avalon', 'bb'].map(k => window.DAYS[0].waves.findIndex(w => w.kind === k)))
}
const weekGo = (p, g) => p.locator(`#eWeek .day[data-day="0"] [data-move="mv:w.0.${g}"]`)
const heads = (p, g, root = '#eWeek .day[data-day="0"]') => p.evaluate(([g, root]) => {
  const go = document.querySelector(`${root} [data-move="mv:w.0.${g}"]`) || [...document.querySelectorAll(`${root} .go.sa`)][g]
  const hs = go.querySelector('.cols.formcols').children
  return { h: [hs[1].innerText.replace(/\s+/g, ' '), hs[2].innerText.replace(/\s+/g, ' ')], fit: [hs[1], hs[2]].every(h => h.scrollWidth <= h.clientWidth), size: getComputedStyle(hs[2]).fontSize }
}, [g, root])
const times = (p, g, root) => p.evaluate(([g, root]) => {
  const go = document.querySelector(`${root} [data-move="mv:w.0.${g}"]`) || [...document.querySelectorAll(`${root} .go.sa`)][g]
  const f = go.querySelector('.form')
  return { rb: [...f.querySelector('.bto').children].map(c => c.textContent), se: [...f.querySelector('.ld').children].map(c => c.textContent) }
}, [g, root])
const br = (p, g) => p.evaluate(g => window.DAYS[0].waves[g].formations[0].br || '', g)

try {
  /* ---------------- desktop ---------------- */
  {
    const { ctx, p } = await start(false)
    await openBoard(p, false)
    const [sc, av, bb] = await addWaves(p, false)
    check('D1', sc >= 0 && av >= 0 && bb >= 0, `SC, AVALON and BB added by the board's "+ Wave" menu (waves ${sc}, ${av}, ${bb})`)
    await closeBoard(p, false)
    await go(p, 'editsched')
    for (const [g, k] of [[sc, 'SC'], [av, 'AVALON'], [bb, 'BB']]) {
      const h = await heads(p, g)
      check(`D2 ${k}`, h.h[0] === 'R B' && h.h[1] === 'START END' && h.fit, `Edit Schedule's week, ${k}: headed "${h.h[0]}" and "${h.h[1]}", whole (${h.size})`)
    }
    await weekGo(p, sc).scrollIntoViewIfNeeded()
    await pic(p, 'desktop-edit-week-three-waves', p.locator('#eWeek .day[data-day="0"]'))
    /* D3 — the B typed on the week */
    const bBox = p.locator(`#eWeek [data-txt="ff:0.${sc}.0.br"]`)
    await press(p, bBox, false)
    await p.keyboard.type('0545')
    await press(p, p.locator('#eWeek .day[data-day="0"] .day-head').first(), false)   // a press elsewhere lets the box go
    await p.waitForTimeout(500)
    const t3 = await times(p, sc, '#eWeek .day[data-day="0"]')
    check('D3', (await br(p, sc)) === '05:45' && t3.rb[1] === '05:45', `SC AM's B typed on the week: saved ${await br(p, sc)}, the box reads ${t3.rb[1]}; R over B ${JSON.stringify(t3.rb)}, START over END ${JSON.stringify(t3.se)}`)
    const flies = await p.evaluate(g => [...document.querySelectorAll(`#eWeek .day[data-day="0"] [data-move="mv:w.0.${g}"] .form`)][0].innerText.includes('✓ FLIES'), sc)
    check('D3b', flies, 'the typed B flies the shift: the lit "✓ FLIES" shows on its rows on the week ([STANDBY-FLIES], D1045)')
    await pic(p, 'desktop-sc-b-typed-on-week', weekGo(p, sc))
    /* D4 — undo and redo from the top bar */
    await press(p, p.locator('#undoBtn:visible').first(), false); await p.waitForTimeout(500)
    const u = await br(p, sc), uText = (await times(p, sc, '#eWeek .day[data-day="0"]')).rb[1]
    await press(p, p.locator('#redoBtn:visible').first(), false); await p.waitForTimeout(500)
    const r = await br(p, sc), rText = (await times(p, sc, '#eWeek .day[data-day="0"]')).rb[1]
    check('D4', u === '' && uText === '' && r === '05:45' && rText === '05:45', `Undo took the B out (saved "${u}", box "${uText}"); Redo put it back ("${r}", box "${rText}")`)
    /* D5 — the board shows the same B; D6 — one typed on the board shows on the week */
    await openBoard(p, false)
    const bv = await p.locator(`#schedBoard [data-bfld="ff:0.${sc}.0.br"]:visible`).first().inputValue()
    check('D5', bv === '05:45', `the Scheduler Board's B box for SC AM reads ${bv} — the same box`)
    const hb = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-lcols')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ')).find(t => /R/.test(t)) || '')
    check('D5b', /R/.test(hb) && /TO/.test(hb) && !/START/.test(hb), `the board keeps its own R · B · TO · LD headings ("${hb.slice(0, 40)}")`)
    const avB = p.locator(`#schedBoard [data-bfld="ff:0.${av}.0.br"]:visible`).first()
    await press(p, avB, false); await p.keyboard.type('1830'); await p.keyboard.press('Enter'); await p.waitForTimeout(400)
    await pic(p, 'desktop-board-standby-b', p.locator(`#schedBoard [data-bfld="ff:0.${av}.0.br"]:visible`).first().locator('xpath=ancestor::*[contains(@class,"sb-wave") or contains(@class,"go")][1]'))
    await closeBoard(p, false); await go(p, 'editsched')
    const t6 = await times(p, av, '#eWeek .day[data-day="0"]')
    check('D6', t6.rb[1] === '18:30', `AVALON's B typed on the board (18:30) shows on the week: ${JSON.stringify(t6.rb)}`)
    /* D7 — View-only Sched */
    await go(p, 'viewsched')
    const vh = await p.evaluate(() => [...document.querySelectorAll('#vWeek .day[data-day="0"] .go.sa .cols.formcols')].map(c => [c.children[1].innerText, c.children[2].innerText].map(s => s.replace(/\s+/g, ' ')).join(' | ')))
    const vt = await p.evaluate(() => [...document.querySelectorAll('#vWeek .day[data-day="0"] .go.sa')].map(go => { const f = go.querySelector('.form'); return [...f.querySelector('.bto').children].map(c => c.textContent).join('/') + ' ' + [...f.querySelector('.ld').children].map(c => c.textContent).join('/') }))
    const ved = await p.locator('#vWeek .day[data-day="0"] .go.sa [contenteditable="true"]').count()
    check('D7', vh.length === 3 && vh.every(h => h === 'R B | START END') && vt[0].startsWith('/05:45') && vt[1].startsWith('/18:30') && ved === 0, `View-only Sched: headings ${JSON.stringify(vh)}, times ${JSON.stringify(vt)}, ${ved} editable boxes`)
    await p.locator('#vWeek .day[data-day="0"] .go.sa').first().scrollIntoViewIfNeeded()
    await pic(p, 'desktop-view-only', p.locator('#vWeek .day[data-day="0"]'))
    /* D8 — publish Monday, then type BB's B on the week: a pending change; the issued face keeps what went out */
    await openBoard(p, false)
    const sels = p.locator('#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible')
    for (let i = 0; i < await sels.count(); i++) { const o = await sels.nth(i).locator('option').evaluateAll(os => os.map(x => x.value).filter(v => v && v !== '—')); if (o.length) await sels.nth(i).selectOption(o[Math.min(i, o.length - 1)]); await p.waitForTimeout(120) }
    const beak = p.locator('#schedBoard [data-beak="0"]:visible').first()
    let pub = false
    if (await beak.count() && !(await beak.isDisabled())) { await press(p, beak, false); await p.waitForTimeout(900); const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first(); if (await ok.count() && await ok.isVisible()) { await ok.click(); await p.waitForTimeout(900) } pub = await p.evaluate(() => !!(window.SCHED.approved || {})[0] || !!(window.SCHED.issued || {})[0] || document.querySelector('#schedBoard .verchip')?.innerText.includes('ORIG')) }
    check('D8a', pub, 'Monday published through its own sign-offs and Publish button')
    await closeBoard(p, false); await go(p, 'editsched')
    const pend0 = await p.evaluate(() => (document.querySelector('#eWeek .day[data-day="0"] [data-pendlist], #eWeek .day[data-day="0"] .pendchip, #eWeek .day[data-day="0"] [data-chgday]') || {}).innerText || '')
    const bbB = p.locator(`#eWeek [data-txt="ff:0.${bb}.0.br"]`)
    await press(p, bbB, false); await p.keyboard.type('2000')
    await press(p, p.locator('#eWeek .day[data-day="0"] .day-head').first(), false); await p.waitForTimeout(600)
    const pend1 = await p.evaluate(() => (document.querySelector('#eWeek .day[data-day="0"] [data-pendlist], #eWeek .day[data-day="0"] .pendchip, #eWeek .day[data-day="0"] [data-chgday]') || {}).innerText || '')
    const marked = await p.evaluate(g => { const e = document.querySelector(`#eWeek [data-txt="ff:0.${g}.0.br"]`); return { alp: e.getAttribute('data-alp'), aln: e.getAttribute('data-aln') } }, bb)
    check('D8b', (await br(p, bb)) === '20:00' && (marked.alp != null || marked.aln != null), `BB's B typed on the published week: saved ${await br(p, bb)}; the box wears the pending mark ${JSON.stringify(marked)}; the day's count "${pend0.trim()}" → "${pend1.trim()}"`)
    await pic(p, 'desktop-published-bb-b-pending', weekGo(p, bb))
    await go(p, 'viewsched')
    const issued = await p.evaluate(() => { const gs = [...document.querySelectorAll('#vWeek .day[data-day="0"] .go.sa')]; const f = gs[2] && gs[2].querySelector('.form'); return f ? [...f.querySelector('.bto').children].map(c => c.textContent) : null })
    check('D8c', issued && issued[1] === '', `View-only Sched shows the issued Monday: BB's B still empty until the amendment goes out (${JSON.stringify(issued)})`)
    /* D9 — the changes window: a tap on the BB B change lands on the week's box */
    await go(p, 'editsched')
    const hist = p.locator('#histBtn:visible, [data-chgwin]:visible, #chgBtn:visible').first()
    let landed = 'no changes button found'
    if (await hist.count()) {
      await press(p, hist, false); await p.waitForTimeout(700)
      const all = p.locator('.chgwin .win-tab').filter({ hasText: /All changes/ }).first()
      if (await all.count()) { await press(p, all, false); await p.waitForTimeout(400) }
      /* the line of that change: a BUTTON when this page can go to it — a "still" line says it has no place here */
      /* its address is the row's hidden id (ff:0.<wave id>.<line id>.br), so it is found by its words: BB SHIFT's Brief */
      const line = p.locator('.chgwin [data-cwkey$=".br"]').filter({ hasText: /BB SHIFT/ }).first()
      const isBtn = (await line.count()) ? await line.evaluate(e => e.tagName === 'BUTTON') : false
      if (isBtn) {
        await press(p, line, false); await p.waitForTimeout(900)
        landed = await p.evaluate(g => { const a = document.activeElement, t = document.querySelector(`#eWeek [data-txt="ff:0.${g}.0.br"]`); const r = t && t.getBoundingClientRect(); const toast = (document.querySelector('#toastEl') || {}).innerText || ''; return JSON.stringify({ inView: !!r && r.top >= 0 && r.bottom <= innerHeight, lit: !!t && (t.classList.contains('hist-hit') || t.closest('.histhit,.hl-hit') !== null || !!t.getAttribute('data-histhit')), toast, onBoard: !!document.querySelector('#schedBoard')?.offsetParent, active: document.activeElement?.getAttribute('data-txt') || '' }) }, bb)
        await pic(p, 'desktop-changes-window-tap-bb-b')
      } else landed = (await line.count()) ? 'the line is there but has no place on this page to go to' : 'no line for the BB B in the window — its lines: ' + JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.chgwin [data-cwkey]')].map(e => e.tagName + ' ' + e.dataset.cwkey + ' ' + e.innerText.replace(/s+/g, ' ').slice(0, 60))))
    }
    const L = (() => { try { return JSON.parse(landed) } catch { return null } })()
    check('D9', !!L && L.inView && !L.onBoard && !/scheduler board/i.test(L.toast), `a tap on the BB B change in the changes window: ${landed}`)
    /* D10 — the Tab route on a standby line: R, B, START, END in turn */
    await p.keyboard.press('Escape'); await p.waitForTimeout(300)
    const rl = p.locator(`#eWeek [data-txt="ff:0.${av}.0.rl"]`)
    await press(p, rl, false)
    const route = [await p.evaluate(() => document.activeElement?.getAttribute('data-txt'))]
    for (let i = 0; i < 3; i++) { await p.keyboard.press('Tab'); await p.waitForTimeout(150); route.push(await p.evaluate(() => document.activeElement?.getAttribute('data-txt'))) }
    const want = ['rl', 'br', 'to', 'ld'].map(k => `ff:0.${av}.0.${k}`)
    check('D10', JSON.stringify(route) === JSON.stringify(want), `Tab from AVALON's R: ${route.map(k => (k || 'nothing').split('.').pop()).join(' → ')}`)
    await p.keyboard.press('Escape')
    await ctx.close()
  }
  /* ---------------- phone, by touch ---------------- */
  {
    const { ctx, p } = await start(true)
    await openBoard(p, true)
    const [sc, av, bb] = await addWaves(p, true)
    check('P1', sc >= 0 && av >= 0 && bb >= 0, `on a phone, SC, AVALON and BB added by the board's "+ Wave" menu by touch (${sc}, ${av}, ${bb})`)
    await closeBoard(p, true); await go(p, 'editsched')
    for (const [g, k] of [[sc, 'SC'], [av, 'AVALON'], [bb, 'BB']]) {
      const h = await heads(p, g)
      check(`P2 ${k}`, h.h[0] === 'R B' && h.h[1] === 'START END' && h.fit && h.size === '7px', `phone week, ${k}: "${h.h[0]}" / "${h.h[1]}", whole, START / END at ${h.size}`)
    }
    const bBox = p.locator(`#eWeek [data-txt="ff:0.${sc}.0.br"]`)
    await press(p, bBox, true)
    const focused = await p.evaluate(() => document.activeElement?.getAttribute('data-txt') || '')
    await p.keyboard.type('0545')
    await press(p, p.locator('#eWeek .day[data-day="0"] .day-head').first(), true); await p.waitForTimeout(600)
    const t = await times(p, sc, '#eWeek .day[data-day="0"]')
    check('P3', focused === `ff:0.${sc}.0.br` && (await br(p, sc)) === '05:45' && t.rb[1] === '05:45', `a finger on SC AM's B took the caret (${focused.split('.').pop()}); typed 0545: saved ${await br(p, sc)}, the box reads ${t.rb[1]}`)
    await weekGo(p, sc).evaluate(e => e.scrollIntoView({ block: 'start' })); await p.evaluate(() => scrollBy(0, -90)); await p.waitForTimeout(200)
    await pic(p, 'phone-edit-week-sc')
    await weekGo(p, av).evaluate(e => e.scrollIntoView({ block: 'start' })); await p.evaluate(() => scrollBy(0, -90)); await p.waitForTimeout(200)
    await pic(p, 'phone-edit-week-avalon-bb')
    await go(p, 'viewsched')
    const v = await p.evaluate(() => [...document.querySelectorAll('#vWeek .day[data-day="0"] .go.sa')].map(go => { const hs = go.querySelector('.cols.formcols').children; return { h: hs[2].innerText.replace(/\s+/g, ' '), fit: hs[2].scrollWidth <= hs[2].clientWidth, b: go.querySelector('.form .bto').children[1].textContent } }))
    check('P4', v.length === 3 && v.every(x => x.h === 'START END' && x.fit) && v[0].b === '05:45', `phone View-only Sched: ${JSON.stringify(v)}`)
    await p.locator('#vWeek .day[data-day="0"] .go.sa').first().evaluate(e => e.scrollIntoView({ block: 'start' })); await p.evaluate(() => scrollBy(0, -90)); await p.waitForTimeout(200)
    await pic(p, 'phone-view-only-sc')
    await ctx.close()
  }
} finally {
  await browser.close()
  const bad = results.filter(r => !r[1])
  console.log(`\n${results.length - bad.length} PASS, ${bad.length} FAIL · ${n} pictures · errors seen: ${errors.length}${errors.length ? ' — ' + errors.slice(0, 4).join(' | ') : ''}`)
}
