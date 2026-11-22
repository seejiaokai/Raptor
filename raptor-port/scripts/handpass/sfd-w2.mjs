// Walker w2 — SANS from its date (D2313) and the publish note's names (D2314), 22 Nov 26, chat 140.
// Brief: docs/superpowers/briefs/2026-11-22-sans-from-date-walk-brief.md — scenarios S2, S5 (+S9 inside it), S6.
// Run from raptor-port/:  ONLY=s5d,s5p,s2d,s2p,s6d,s6p node scripts/handpass/sfd-w2.mjs
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const VERSION = 'sfd-w2 v3'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const URL_ = process.env.W2_URL || 'http://localhost:4322/'
const ONLY = (process.env.ONLY || 's5d,s5p,s2d,s2p,s6d,s6p').split(',')
const RUN = process.env.RUN || 'run1'
const BASE_OUT = path.join(ROOT, 'docs/img/handpass/2026-11-22-sans-from-date/w2', RUN)
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
console.log(VERSION, URL_, ONLY.join(','), RUN)

const SIZES = {
  d: { name: 'desktop', eng: chromium, launch: existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}, opts: { viewport: { width: 1536, height: 864 } } },
  p: { name: 'phone', eng: webkit, launch: {}, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
}
const results = []
const log = (...a) => console.log(...a)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const p2 = n => String(n).padStart(2, '0')
const MAN = 'rocky'

function mk(scn, sz) {
  const dir = BASE_OUT
  mkdirSync(dir, { recursive: true }); mkdirSync(path.join(dir, 'taps'), { recursive: true })
  let tapN = 0
  const errs = []
  const W = {
    scn, sz, dir, errs, isPhone: sz.name === 'phone',
    async pic(p, step) { const f = path.join(dir, `${scn}-${step}-${sz.name}.png`); await p.screenshot({ path: f }); return path.basename(f) },
    async press(p, loc, label = 'press') {
      const l = typeof loc === 'string' ? p.locator(loc).first() : loc
      await l.waitFor({ state: 'visible', timeout: 8000 })
      await l.scrollIntoViewIfNeeded().catch(() => {})
      if (W.isPhone) {
        await l.tap({ timeout: 5000 })
        await p.screenshot({ path: path.join(dir, 'taps', `${scn}-${p2(++tapN)}-${label}-now-phone.png`) }).catch(() => {})
      } else await l.click({ timeout: 5000 })
      await sleep(350)
    },
    rec(id, what, ok, note, pics) { results.push({ scn, size: sz.name, id, what, ok, note, pics }); log(`${ok === true ? 'PASS' : ok === false ? 'FAIL' : 'NOTE'} ${scn}/${sz.name} ${id} — ${what}${note ? ' :: ' + note : ''}${pics ? ' [' + pics + ']' : ''}`) },
  }
  return W
}

async function world(sz, W, at) {
  const b = await sz.eng.launch(sz.launch)
  const ctx = await b.newContext(sz.opts)
  await ctx.clock.install({ time: new Date(at) })
  const p = await ctx.newPage()
  p.on('pageerror', e => W.errs.push('PAGEERROR ' + e.message))
  p.on('console', m => { if (m.type() === 'error') W.errs.push('CONSOLE ' + m.text().slice(0, 200)) })
  p.on('response', r => { if (r.status() >= 400) W.errs.push('HTTP ' + r.status() + ' ' + r.url()) })
  p.on('requestfailed', r => W.errs.push('REQFAIL ' + r.url()))
  await p.goto(URL_)
  return { b, ctx, p }
}
async function signIn(p, user, pass) {
  await p.waitForSelector('#luser'); await p.fill('#luser', user); await p.fill('#lpass', pass)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(800)
}
async function signOut(p, W) {
  if (await p.locator('#schedBoard').count()) await closeBoard(p, W)
  if (await p.locator('#logout:visible').count()) await W.press(p, '#logout:visible', 'logout')
  else if (await p.locator('#burger:visible').count()) { await W.press(p, '#burger:visible', 'burger'); await W.press(p, '#drawerLogout:visible', 'drawer-logout') }
  else await p.evaluate(() => window.logout && window.logout())
  await sleep(600)
  const conf = p.getByRole('button', { name: /^(Logout|Sign out|Yes|Confirm|OK)/ })
  if (!(await p.locator('#luser:visible').count()) && await conf.count()) { await conf.first().click(); await sleep(500) }
}
async function go(p, to) { await p.evaluate(t => window.go(t), to); await p.waitForFunction(t => window.CURPAGE === t, to); await sleep(600) }
const B = sel => `#schedBoard ${sel}:visible`
const hideToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.style.transition = 'none'; t.style.opacity = '0' } })
const toastText = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.textContent : null })
const today = p => p.evaluate(() => new Date().toString().slice(0, 21))
const wk0 = p => p.evaluate(() => window.DAYS[0].dt)

/* the week whose Monday reads `mon` ("Jul 13" / "Jul 20"), by the page's own week arrows (#weekPrev / #weekNext) */
/* desktop: the week window's own week button (data-wk); phone: the filter row's calendar → Jump to a date → the Monday */
async function toWeek(p, W, mon) {
  const cur = await wk0(p)
  if (cur === mon) return cur
  const dd = mon.split(' ')[1].padStart(2, '0')
  const wk = p.locator(`[data-wk="${dd}/07/2026"]:visible`).first()
  if (await wk.count()) await W.press(p, wk, 'wk-' + dd)
  else {
    await W.press(p, '.filt-cal:visible', 'jump-cal')
    await W.press(p, `[data-testid="wcal-day-2026-07-${dd}"]:visible`, 'wcal-' + dd)
  }
  await sleep(900)
  const now = await wk0(p)
  log(`  toWeek: from "${cur}" to "${now}" (wanted "${mon}")`)
  return now
}
async function openBoard(p, W, mon, di) {
  await go(p, 'editsched')
  await toWeek(p, W, mon)
  const d = p.locator(`#eWeek [data-sbday="${di}"]`).first()
  await d.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(300)
  if (W.isPhone) { await d.tap(); await sleep(80); await p.screenshot({ path: path.join(W.dir, 'taps', `${W.scn}-board-open-${di}-now-phone.png`) }) }
  else await d.click()
  await p.waitForSelector('#schedBoard'); await sleep(800)
  return p.evaluate(() => (document.getElementById('sbDate') || {}).textContent)
}
async function closeBoard(p, W) {
  if (!(await p.locator('#schedBoard').count())) return
  const done = p.locator('#schedBoard button:visible', { hasText: 'Done' }).first()
  if (await done.count()) await W.press(p, done, 'done'); else await p.keyboard.press('Escape')
  await sleep(500)
}
async function typeBox(p, W, sel, value) {
  const el = p.locator(B(sel)).first()
  await el.scrollIntoViewIfNeeded()
  if (W.isPhone) await el.tap(); else await el.click()
  await sleep(150)
  await p.keyboard.press('Control+A').catch(() => {})
  await el.fill('')
  await el.type(String(value), { delay: 10 })
  await p.keyboard.press('Enter').catch(() => {})
  await el.evaluate(e => e.blur())
  await sleep(300)
}
/* a Ground Programme row with a name and times, then the man by the crew list: tap the row's people box, then his puck */
async function addGround(p, W, di, name, who) {
  await W.press(p, B(`[data-gradd="${di}"]`), 'add-ground')
  const ri = await p.evaluate(i => window.DAYS[i].ground.length - 1, di)
  await typeBox(p, W, `[data-bfld="gr:${di}.${ri}.prog"]`, name)
  await typeBox(p, W, `[data-bfld="gr:${di}.${ri}.str"]`, '0900')
  await typeBox(p, W, `[data-bfld="gr:${di}.${ri}.end"]`, '1000')
  await W.press(p, B(`[data-fill="g:${di}.${ri}.+"]`), 'arm-ground')
  const crew = p.locator(`#schedBoard .rcol [data-person="${who}"]:visible, #schedBoard .rsans [data-person="${who}"]:visible`).first()
  await W.press(p, crew, 'crew-' + who)
  await sleep(400)
  return { ri, row: await p.evaluate(([i, r]) => { const x = window.DAYS[i].ground[r]; return { prog: x.prog, str: x.str, end: x.end, who: x.who } }, [di, ri]) }
}
async function signAll(p, W) {
  const roles = ['cur', 'sked', 'plan', 'appr'], nth = [0, 0, 1, 2]
  for (let i = 0; i < 4; i++) {
    const sel = p.locator(`#schedBoard .sb-sign select[data-sign="${roles[i]}"]:visible`).first()
    await sel.scrollIntoViewIfNeeded().catch(() => {})
    const v = await sel.locator('option').evaluateAll((os, n) => os.map(o => o.value).filter(Boolean)[n], nth[i])
    await sel.selectOption(v); await sleep(300)
    const later = p.locator('[data-testid="win-oilday"] [data-testid="odl-later"]')
    if (await later.count() && await later.first().isVisible()) { await later.first().click(); await sleep(300) }
  }
}
async function publish(p, W, di) {
  let l = null
  for (const s of [`[data-alpub="${di}"]`, `[data-beak="${di}"]`]) { const x = p.locator(B(s)).first(); if (await x.count()) { l = x; break } }
  if (!l) return { label: 'NO PUBLISH BUTTON', toast: null }
  const label = (await l.innerText()).trim()
  await W.press(p, l, 'publish'); await sleep(900)
  const toast = await toastText(p)
  return { label, toast }
}
/* the day's state as drawn (copied from frf-w1 pendingOf) */
const pendingOf = (p, di) => p.evaluate(i => {
  const vis = e => e.getBoundingClientRect().width > 0
  const board = document.querySelector('#schedBoard')
  let root = board
  if (!board) {
    const wd = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]
    const cands = [...document.querySelectorAll('#eWeek *')].filter(e => vis(e) && e.getBoundingClientRect().width < 900 && (e.innerText || '').includes(wd) && /SIGN-OFF/i.test(e.innerText || '') && !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].filter(x => x !== wd).some(x => (e.innerText || '').includes(x + '\n') || (e.innerText || '').startsWith(x)))
    cands.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)
    root = cands[0] || document.body
  }
  const all = [...root.querySelectorAll('*')].filter(e => vis(e) && /^\d+\s*pending/i.test((e.innerText || '').trim()) && (e.innerText || '').trim().length < 20)
  const pendEl = all[all.length - 1]
  const pend = pendEl ? parseInt(pendEl.innerText, 10) : 0
  const txt = (root.innerText || '').replace(/\s+/g, ' ')
  const k = txt.toUpperCase().indexOf('SIGNED ')
  const k2 = k >= 0 ? txt.toUpperCase().indexOf('SIGN-OFF', k) : -1
  const sm = k >= 0 ? txt.slice(k, k2 > k ? k2 : k + 90).trim() : ''
  return { pend, notSigned: /Not yet signed/i.test(txt), signed: sm, approved: window.dayApproved ? window.dayApproved(i) : 'n/a' }
}, di)
/* every drawn copy of the man's puck in a root: where it stands and whether it wears the purple SANS line (class san) */
const pucksIn = (p, root, id) => p.evaluate(([root, id]) => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  return [...document.querySelectorAll(`${root} [data-person="${id}"], ${root} [data-awp="${id}"]`)].filter(vis).map(e => {
    const sec = e.closest('.rsans') ? 'SANS Avail' : e.closest('.rcol') ? 'crew-col' : e.closest('.rall') ? 'avail-crew' : e.closest('.sb-panel') ? (e.closest('.sb-panel').querySelector('.sb-ph') || {}).textContent?.trim().slice(0, 22) : e.closest('.availwin') ? 'ALLAVAIL-window' : (e.parentElement && e.parentElement.className) || '?'
    const head = (() => { const c = e.closest('.rcol, .rsans'); const h = c && c.querySelector('.rh2'); return h ? h.innerText.replace(/\s+/g, ' ').trim() : '' })()
    return { sec, head, san: e.classList.contains('san'), cls: e.className, title: (e.getAttribute('title') || '').slice(0, 80) }
  })
}, [root, id])
const heads = p => p.evaluate(() => [...document.querySelectorAll('#schedBoard .rh2')].filter(h => h.getBoundingClientRect().width > 0).map(h => h.innerText.replace(/\s+/g, ' ').trim()))
async function boardTab(p, W, di) {
  const t = p.locator(`#schedBoard [data-sbtab="${di}"]:visible`).first()
  if (await t.count()) await W.press(p, t, 'tab' + di)
  else await p.locator(`#schedBoard [data-sbtab="${di}"]`).first().evaluate(e => e.click())
  await sleep(700)
}
/* the Leave War cell, and the posting sheet (frf-w1's route) */
async function lwCell(p, W, id, iso) {
  if (await p.locator('#schedBoard').count()) await closeBoard(p, W)
  await go(p, 'leavewar'); await sleep(900)
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][Number(iso.slice(5, 7)) - 1]
  const m = p.locator(`[data-testid="month-${mon}"]:visible`).first()
  if (await m.count()) { await W.press(p, m, 'month-' + mon); await sleep(900) }
  const c = p.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  if (!(await c.count())) return { cell: null, text: 'NO CELL' }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
  return { cell: c, text: ((await c.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim() }
}
async function postOutSans(p, W, id, iso, tag) {
  const c = (await lwCell(p, W, id, iso)).cell
  await W.press(p, c, 'cell-' + iso)
  await W.press(p, '[data-testid="bid-more"]:visible', 'more')
  await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
  await W.press(p, '[data-testid="po-sans"]:visible', 'po-sans')
  const line = ((await p.locator('[data-testid="po-line"]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ')
  const pic = await W.pic(p, tag)
  await W.press(p, '[data-testid="po-confirm"]:visible', 'po-confirm'); await sleep(1000)
  const after = await p.evaluate(id => ({ san: !!window.PEOPLE[id].san, sanFrom: window.PEOPLE[id].sanFrom || null }), id)
  return { line, pic, after }
}
async function undoPostOut(p, W, id, iso, tag) {
  const c = (await lwCell(p, W, id, iso)).cell
  await W.press(p, c, 'cell-po-' + iso)
  const u = p.locator('[data-testid="postout-undo"]:visible').first()
  const has = await u.count()
  const pic1 = await W.pic(p, tag + 'a-sheet')
  if (has) { await W.press(p, u, 'postout-undo'); await sleep(900) }
  const err = ((await p.locator('[data-testid="postout-err"]').first().innerText().catch(() => '')) || '').trim()
  const pic2 = await W.pic(p, tag + 'b-after')
  await p.keyboard.press('Escape'); await sleep(400)
  const after = await p.evaluate(id => ({ san: !!window.PEOPLE[id].san, sanFrom: window.PEOPLE[id].sanFrom || null }), id)
  return { has, err, after, pics: pic1 + ', ' + pic2 }
}
/* the View-only Sched day as the member Ranger: his puck(s) on that day's card */
async function viewAsRanger(p, W, mon, di, tag) {
  await signOut(p, W)
  await signIn(p, 'us', 'us')
  await go(p, 'viewsched'); await toWeek(p, W, mon)
  const day = p.locator('#vWeek .day').nth(di)
  await day.evaluate(e => e.scrollIntoView({ block: 'start' })); await sleep(400)
  const pk = await p.evaluate(([di, id]) => {
    const d = document.querySelectorAll('#vWeek .day')[di]; if (!d) return 'no day'
    return [...d.querySelectorAll(`[data-person="${id}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ san: e.classList.contains('san'), cls: e.className, txt: e.textContent.trim().slice(0, 20) }))
  }, [di, MAN])
  /* the man's puck close up */
  let pic = await W.pic(p, tag)
  const one = p.locator(`#vWeek .day >> nth=${di}`).locator(`[data-person="${MAN}"]`).first()
  if (await one.count()) { await one.scrollIntoViewIfNeeded().catch(() => {}); await sleep(200); pic = await W.pic(p, tag) }
  await signOut(p, W)
  await signIn(p, 'ad', 'a')
  return { pk, pic }
}
/* the 👁 look at a published version on the board: Plans ▾ → the newest issued version; back by the working copy row */
async function eyeLook(p, W, di, tag) {
  await W.press(p, B(`[data-planmenu="${di}"]`), 'planmenu')
  const vers = await p.evaluate(() => [...document.querySelectorAll('[data-planpv]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.planpv + '=' + e.textContent.trim().slice(0, 30)))
  const pv = p.locator('[data-planpv]:visible').last()
  if (!(await pv.count())) { await p.keyboard.press('Escape'); return { vers, pk: 'no issued version', pic: await W.pic(p, tag) } }
  await W.press(p, pv, 'planpv'); await sleep(700)
  const pk = await pucksIn(p, '#schedBoard .sb-panel.grnd', MAN)
  const ban = await p.evaluate(() => (document.querySelector('#schedBoard .pvbar, #schedBoard [class*="pv"]') || {}).textContent?.replace(/\s+/g, ' ').trim().slice(0, 120))
  const pic = await picAt(p, W, tag, '#schedBoard .sb-panel.grnd')
  /* back to the working copy: the look's own "← Back to live copy" */
  const back = p.locator('#schedBoard button:visible', { hasText: 'Back to live copy' }).first()
  if (await back.count()) await W.press(p, back, 'back-live')
  await sleep(500)
  return { vers, pk, ban, pic }
}
/* the pending list (the day's "N pending" chip on Edit Schedule's week → the To go out tab) */
async function pendList(p, W, di, tag) {
  if (await p.locator('#schedBoard').count()) await closeBoard(p, W)
  const chip = p.locator(`#eWeek [data-pendlist="${di}"]:visible`).first()
  if (!(await chip.count())) return { text: 'NO PENDING CHIP', pic: await W.pic(p, tag) }
  await W.press(p, chip, 'pendlist'); await sleep(700)
  const text = await p.evaluate(() => { const t = [...document.querySelectorAll('.win-tabs')].find(e => e.getBoundingClientRect().width > 0); const w = t && t.parentElement; return w ? w.innerText.replace(/\s+/g, ' ').trim().slice(0, 700) : 'no window' })
  const pic = await W.pic(p, tag)
  return { text, pic }
}
async function allChanges(p, W, tag) {
  const t = p.locator('.win-tab:visible', { hasText: 'All changes' }).first()
  if (!(await t.count())) return { text: 'no All changes tab', pic: await W.pic(p, tag) }
  await W.press(p, t, 'all-changes'); await sleep(500)
  const text = await p.evaluate(() => { const t = [...document.querySelectorAll('.win-tabs')].find(e => e.getBoundingClientRect().width > 0); const w = t && t.parentElement; return w ? w.innerText.replace(/\s+/g, ' ').trim().slice(0, 900) : 'no window' })
  const pic = await W.pic(p, tag)
  return { text, pic }
}
async function closeWin(p) {
  const x = p.locator('.win-x:visible').first()
  if (await x.count()) await x.click().catch(() => {}); else await p.keyboard.press('Escape')
  await sleep(400)
}
/* a picture with the subject brought into view first (walk-scripts §5) */
async function picAt(p, W, step, sel) {
  const l = p.locator(sel).filter({ visible: true }).first()
  if (await l.count()) { await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(350) }
  return W.pic(p, step)
}
const GP = `#schedBoard .sb-panel.grnd [data-person="${MAN}"]`
const SA = `#schedBoard .rsans [data-person="${MAN}"], #schedBoard .rcol [data-person="${MAN}"]`
/* his OIL in the OIL tracker (frf-w1's oilFigs, first place) — read where the grid no longer draws his row */
async function oilBal(p, W, id, tag) {
  if (await p.locator('#schedBoard').count()) await closeBoard(p, W)
  await go(p, 'leavewar'); await sleep(700)
  const t = p.locator('[data-testid="oil-tracker"]:visible').first(); if (await t.count()) await W.press(p, t, 'oil-tracker'); await sleep(700)
  const c = p.locator(`[data-testid="oil-bal-${id}"]`).first()
  if (await c.count()) await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  const txt = ((await c.innerText().catch(() => 'NO OIL ROW')) || '').replace(/\s+/g, ' ').trim()
  const pic = await W.pic(p, tag)
  const ox = p.locator('[data-testid="oil-close"]:visible').first(); if (await ox.count()) await W.press(p, ox, 'oil-close')
  return { txt, pic }
}

/* =================== S5 (+ S9) =================== */
async function s5(szKey) {
  const sz = SIZES[szKey], W = mk('s5', sz)
  const { b, p } = await world(sz, W, '2026-07-22T09:00:00')
  try {
    await signIn(p, 'ad', 'a')
    const man = await p.evaluate(id => ({ cs: window.PEOPLE[id].cs, seat: window.PEOPLE[id].seat, san: !!window.PEOPLE[id].san }), MAN)
    W.rec('premise', 'the man and the clock', null, `${MAN} = ${man.cs} ${man.seat} SANS ${man.san}; today ${await today(p)}`)
    /* Mon 13 Jul: a ground row with Hex, signed and published */
    const dt0 = await openBoard(p, W, 'Jul 13', 0)
    const g0 = await addGround(p, W, 0, 'W2 MON BRIEF', MAN)
    W.rec('s5-01', `Mon 13 Jul (${dt0}): Ground Programme row with ${man.cs} by + Item and the crew list`, g0.row.who === MAN, JSON.stringify(g0.row), await W.pic(p, '01-mon-row'))
    await signAll(p, W); const pb0 = await publish(p, W, 0); await hideToast(p)
    const st0 = await pendingOf(p, 0)
    W.rec('s5-02', `Mon 13 Jul signed and published (${pb0.label})`, st0.approved === true && st0.pend === 0 && !st0.notSigned, JSON.stringify(st0), await W.pic(p, '02-mon-published'))
    /* Tue 21 Jul (next week) */
    await closeBoard(p, W)
    const dt1 = await openBoard(p, W, 'Jul 20', 1)
    const g1 = await addGround(p, W, 1, 'W2 TUE BRIEF', MAN)
    W.rec('s5-03', `Tue 21 Jul (${dt1}): Ground Programme row with ${man.cs}`, g1.row.who === MAN, JSON.stringify(g1.row), await W.pic(p, '03-tue-row'))
    await signAll(p, W); const pb1 = await publish(p, W, 1); await hideToast(p)
    const st1 = await pendingOf(p, 1)
    const pkTue0 = await pucksIn(p, '#schedBoard', MAN)
    W.rec('s5-04', `Tue 21 Jul signed and published (${pb1.label})`, st1.approved === true && st1.pend === 0, JSON.stringify(st1) + ' pucks ' + JSON.stringify(pkTue0), await W.pic(p, '04-tue-published'))
    /* the posting */
    const po = await postOutSans(p, W, MAN, '2026-07-20', '05-postout-sheet')
    W.rec('s5-05', 'posted out as SANS from Mon 20 Jul (Leave War ⋯ → Post out → SANS → Post out)', po.after.san === true, `line "${po.line}" · ${JSON.stringify(po.after)}`, po.pic)
    /* Mon 13 Jul after the posting: board, Edit Schedule */
    await openBoard(p, W, 'Jul 13', 0)
    const st2 = await pendingOf(p, 0), pk2 = await pucksIn(p, '#schedBoard', MAN), h2 = await heads(p)
    const rowPk2 = pk2.filter(x => /GROUND/i.test(x.sec || ''))
    W.rec('s5-06', 'Mon 13 Jul on the board after the posting: nothing pending, signed line stands, his row puck no purple line, a regular in the crew list', st2.pend === 0 && !st2.notSigned && /SIGNED/i.test(st2.signed) && rowPk2.length > 0 && rowPk2.every(x => !x.san) && pk2.every(x => !x.san) && !pk2.some(x => x.sec === 'SANS Avail'), `${JSON.stringify(st2)} · pucks ${JSON.stringify(pk2.map(x => x.sec + '/' + x.head + '/san=' + x.san))} · heads ${JSON.stringify(h2)}`, (await W.pic(p, '06-mon-board')) + ', ' + await picAt(p, W, '06b-mon-row', GP) + ', ' + await picAt(p, W, '06c-mon-crew', SA))
    await closeBoard(p, W)
    await go(p, 'editsched'); await toWeek(p, W, 'Jul 13')
    await p.locator('#eWeek [data-sbday="0"]').first().evaluate(e => e.scrollIntoView({ block: 'start' })); await sleep(300)
    const st3 = await pendingOf(p, 0)
    const pk3 = await p.evaluate(id => [...document.querySelectorAll(`#eWeek [data-person="${id}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ san: e.classList.contains('san'), day: (e.closest('[data-di],.day') || {}).dataset?.di })), MAN)
    W.rec('s5-07', 'Mon 13 Jul on Edit Schedule: nothing pending, signed, his puck(s) with no purple line', st3.pend === 0 && !st3.notSigned && pk3.length > 0 && pk3.every(x => !x.san), `${JSON.stringify(st3)} · week pucks ${JSON.stringify(pk3)}`, await W.pic(p, '07-mon-editsched'))
    /* Tue 21 Jul: pending, sign-offs fallen */
    await openBoard(p, W, 'Jul 20', 1)
    const st4 = await pendingOf(p, 1), pk4 = await pucksIn(p, '#schedBoard', MAN)
    W.rec('s5-08', 'Tue 21 Jul on the board: "1 pending", sign-offs fallen ("Not yet signed"); RECORD his pucks', st4.pend === 1 && st4.notSigned, `${JSON.stringify(st4)} · pucks ${JSON.stringify(pk4.map(x => x.sec + '/' + x.head + '/san=' + x.san))}`, (await W.pic(p, '08-tue-board-pending')) + ', ' + await picAt(p, W, '08b-tue-row', GP) + ', ' + await picAt(p, W, '08c-tue-crew', SA))
    /* S9 / S5: the 👁 look at the published version */
    const eye = await eyeLook(p, W, 1, '09-tue-eye')
    W.rec('s5-09', 'S9: the 👁 look at Tue 21 Jul\'s published version — his puck as published, no purple line', Array.isArray(eye.pk) && eye.pk.length > 0 && eye.pk.every(x => !x.san), `versions ${JSON.stringify(eye.vers)} · pucks ${JSON.stringify(eye.pk)} · banner "${eye.ban}"`, eye.pic)
    const pl = await pendList(p, W, 1, '10-tue-pendlist')
    W.rec('s5-10', 'Tue 21 Jul: the pending list — RECORD its line', null, pl.text, pl.pic)
    const ac = await allChanges(p, W, '11-all-changes')
    W.rec('s5-11', 'S9: the change history ("All changes") — RECORD the line the posting left on Tue 21 Jul', null, ac.text, ac.pic)
    await closeWin(p)
    const vr = await viewAsRanger(p, W, 'Jul 20', 1, '12-tue-view-ranger')
    W.rec('s5-12', 'S9: View-only Sched as Ranger, Tue 21 Jul — his puck as published, no purple line', Array.isArray(vr.pk) && vr.pk.length > 0 && vr.pk.every(x => !x.san), JSON.stringify(vr.pk), vr.pic)
    const vr0 = await viewAsRanger(p, W, 'Jul 13', 0, '13-mon-view-ranger')
    W.rec('s5-13', 'View-only Sched as Ranger, Mon 13 Jul — his puck no purple line', Array.isArray(vr0.pk) && vr0.pk.length > 0 && vr0.pk.every(x => !x.san), JSON.stringify(vr0.pk), vr0.pic)
    /* AL1 on Tue 21 Jul */
    await openBoard(p, W, 'Jul 20', 1)
    await signAll(p, W); const pb2 = await publish(p, W, 1); await hideToast(p)
    const st5 = await pendingOf(p, 1), pk5 = await pucksIn(p, '#schedBoard', MAN)
    W.rec('s5-14', `Tue 21 Jul AL1 published (${pb2.label}): nothing pending, his puck wears the purple line on the board`, st5.pend === 0 && !st5.notSigned && /AL1/.test(st5.signed) && pk5.length > 0 && pk5.filter(x => /GROUND/i.test(x.sec || '')).every(x => x.san), `${JSON.stringify(st5)} · pucks ${JSON.stringify(pk5.map(x => x.sec + '/' + x.head + '/san=' + x.san))} · toast "${pb2.toast}"`, (await W.pic(p, '14-tue-al1')) + ', ' + await picAt(p, W, '14b-tue-row', GP))
    await closeBoard(p, W)
    await go(p, 'editsched'); await toWeek(p, W, 'Jul 20')
    const pk6 = await p.evaluate(id => [...document.querySelectorAll(`#eWeek [data-person="${id}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ san: e.classList.contains('san') })), MAN)
    await p.locator('#eWeek [data-sbday="1"]').first().evaluate(e => e.scrollIntoView({ block: 'start' })); await sleep(300)
    W.rec('s5-15', 'after AL1: Edit Schedule week Jul 20 — his pucks (Tue row should wear the line)', null, JSON.stringify(pk6), await W.pic(p, '15-editsched-after-al1'))
    const vr2 = await viewAsRanger(p, W, 'Jul 20', 1, '16-tue-view-ranger-al1')
    W.rec('s5-16', 'after AL1: View-only Sched as Ranger, Tue 21 Jul — purple line now', Array.isArray(vr2.pk) && vr2.pk.length > 0 && vr2.pk.every(x => x.san), JSON.stringify(vr2.pk), vr2.pic)
    /* Undo post out */
    const un = await undoPostOut(p, W, MAN, '2026-07-20', '17-undo-po')
    W.rec('s5-17', 'Undo post out on his posting\'s sheet', un.has > 0 && un.after.san === false, `button ${un.has} err "${un.err}" ${JSON.stringify(un.after)}`, un.pics)
    await openBoard(p, W, 'Jul 20', 1)
    const st7 = await pendingOf(p, 1), pk7 = await pucksIn(p, '#schedBoard', MAN)
    W.rec('s5-18', 'after Undo post out: RECORD Tue 21 Jul (expected pending again, a regular there)', null, `${JSON.stringify(st7)} · pucks ${JSON.stringify(pk7.map(x => x.sec + '/' + x.head + '/san=' + x.san))}`, (await W.pic(p, '18-tue-after-undo')) + ', ' + await picAt(p, W, '18b-tue-row', GP) + ', ' + await picAt(p, W, '18c-tue-crew', SA))
    await boardTab(p, W, 0).catch(() => {})
    await closeBoard(p, W)
    const st8 = await (async () => { await openBoard(p, W, 'Jul 13', 0); return pendingOf(p, 0) })()
    W.rec('s5-19', 'after Undo post out: Mon 13 Jul still nothing pending', st8.pend === 0 && !st8.notSigned, JSON.stringify(st8), await W.pic(p, '19-mon-after-undo'))
  } catch (e) {
    W.rec('s5-ERR', 'script stopped', null, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}

/* =================== S2 =================== */
async function s2(szKey) {
  const sz = SIZES[szKey], W = mk('s2', sz)
  const { b, p } = await world(sz, W, '2026-07-22T09:00:00')
  const SAT = 5
  try {
    await signIn(p, 'ad', 'a')
    W.rec('premise', 'clock', null, `today ${await today(p)}`)
    await openBoard(p, W, 'Jul 13', SAT)
    await W.press(p, B(`[data-padd="${SAT}"]`), 'add-item')
    const ri = await p.evaluate(i => window.DAYS[i].allhands.length - 1, SAT)
    await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.prog"]`, 'SQN EVENT')
    await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.str"]`, '0800')
    await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.end"]`, '1500')
    await W.press(p, B(`[data-fill="a:${SAT}.${ri}.+"]`), 'arm-row')
    await W.press(p, `#schedBoard [data-person="allavail"]:visible`, 'allavail'); await sleep(500)
    const row = await p.evaluate(i => { const a = window.DAYS[i].allhands; const r = a[a.length - 1]; return { prog: r.prog, str: r.str, end: r.end, who: r.who } }, SAT)
    W.rec('s2-01', 'Sat 18 Jul: Common Programme SQN EVENT 08:00–15:00 for ALL AVAIL', JSON.stringify(row.who).includes('allavail'), JSON.stringify(row), await W.pic(p, '01-row'))
    await signAll(p, W); const pb = await publish(p, W, SAT); await hideToast(p)
    const st = await pendingOf(p, SAT)
    const chip = async () => ((await p.locator(B(`.oilcount[data-oilday="${SAT}"]`)).first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
    const c0 = await chip()
    W.rec('s2-02', `Sat 18 Jul published (${pb.label}); RECORD the ALL AVAIL count`, st.approved === true && st.pend === 0, `${JSON.stringify(st)} · count chip "${c0}" · toast "${pb.toast}"`, await W.pic(p, '02-published'))
    const win = async tag => {
      const ch = p.locator(B(`.oilcount[data-oilday="${SAT}"]`)).first()
      if (!(await ch.count())) return { r: 'no chip', pic: await W.pic(p, tag) }
      await W.press(p, ch, 'count-chip'); await sleep(600)
      const r = await p.evaluate(id => { const w = document.querySelector('.availwin'); if (!w) return 'no window'; const e = w.querySelector(`.rpuck[data-awp="${id}"]`); const ids = [...w.querySelectorAll('.rpuck[data-awp]')].map(x => x.dataset.awp); return { n: ids.length, has: !!e, san: e ? e.classList.contains('san') : null, cls: e ? e.className : '' } }, MAN)
      const pic = await W.pic(p, tag)
      await p.keyboard.press('Escape'); await sleep(400)
      return { r, pic }
    }
    const w0 = await win('03-availwin')
    W.rec('s2-03', 'ALL AVAIL window lists Hex as a regular (before the tick)', w0.r && w0.r.has === true && !w0.r.san, JSON.stringify(w0.r), w0.pic)
    const lw0 = await lwCell(p, W, MAN, '2026-07-18')
    const lwp0 = await W.pic(p, '04-lw-fo')
    const ob0 = await oilBal(p, W, MAN, '04b-oil-before')
    W.rec('s2-04', 'Leave War: Hex 18 Jul (expected FO…)', /^FO/.test(lw0.text), `cell "${lw0.text}" · OIL tracker "${ob0.txt}"`, lwp0 + ', ' + ob0.pic)
    /* Wed 22 Jul (next week), an ALL AVAIL item, publish */
    const WED = 2
    await openBoard(p, W, 'Jul 20', WED)
    await W.press(p, B(`[data-padd="${WED}"]`), 'add-item-wed')
    const rw = await p.evaluate(i => window.DAYS[i].allhands.length - 1, WED)
    await typeBox(p, W, `[data-bfld="ap:${WED}.${rw}.prog"]`, 'WED EVENT')
    await typeBox(p, W, `[data-bfld="ap:${WED}.${rw}.str"]`, '0800')
    await typeBox(p, W, `[data-bfld="ap:${WED}.${rw}.end"]`, '1500')
    await W.press(p, B(`[data-fill="a:${WED}.${rw}.+"]`), 'arm-row-wed')
    await W.press(p, `#schedBoard [data-person="allavail"]:visible`, 'allavail-wed'); await sleep(500)
    await signAll(p, W); const pbw = await publish(p, W, WED); await hideToast(p)
    const stw = await pendingOf(p, WED)
    W.rec('s2-05', `Wed 22 Jul published with an ALL AVAIL item (${pbw.label})`, stw.approved === true && stw.pend === 0, JSON.stringify(stw), await W.pic(p, '05-wed-published'))
    await closeBoard(p, W)
    /* the hand tick on Quals */
    await go(p, 'quals')
    await W.press(p, '#qViewW', 'qViewW'); await W.press(p, '#qEdit', 'qEdit')
    const cell = p.locator(`td[data-q="${MAN}|san"]`).first()
    await cell.scrollIntoViewIfNeeded(); await W.press(p, cell, 'san-cell'); await sleep(500)
    const tk = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null } }, MAN)
    const tpic = await W.pic(p, '06-quals-ticked')
    if (await p.locator('#qSave:visible').count()) await W.press(p, '#qSave:visible', 'qSave')
    W.rec('s2-06', 'Quals ✎ Edit: Hex SANS ticked by hand (today Wed 22 Jul)', tk.san === true, JSON.stringify(tk), tpic)
    /* Sat 18 Jul after the tick */
    await openBoard(p, W, 'Jul 13', SAT)
    const st2 = await pendingOf(p, SAT), c1 = await chip()
    W.rec('s2-07', 'Sat 18 Jul after the tick: no "N pending", Signed ORIG line and four names stand', st2.pend === 0 && !st2.notSigned && /SIGNED\s+ORIG/i.test(st2.signed), `${JSON.stringify(st2)} · chip "${c1}"`, await W.pic(p, '07-sat-after-tick'))
    const w1 = await win('08-availwin-after-tick')
    W.rec('s2-08', 'ALL AVAIL window still lists Hex as a regular (no purple line)', w1.r && w1.r.has === true && !w1.r.san, JSON.stringify(w1.r), w1.pic)
    const pkS = await pucksIn(p, '#schedBoard', MAN)
    W.rec('s2-08b', 'Sat 18 Jul crew list after the tick: where Hex stands', !pkS.some(x => x.sec === 'SANS Avail') && pkS.every(x => !x.san), JSON.stringify(pkS.map(x => x.sec + '/' + x.head + '/san=' + x.san)), await picAt(p, W, '08b-sat-crew', SA))
    await closeBoard(p, W)
    const lw1 = await lwCell(p, W, MAN, '2026-07-18')
    const lwp1 = await W.pic(p, '09-lw-after-tick')
    const ob1 = await oilBal(p, W, MAN, '09b-oil-after-tick')
    W.rec('s2-09', 'Leave War: Hex 18 Jul still FO after the tick (grid cell; where the grid hides his row, his OIL tracker figure against before)', /^FO/.test(lw1.text) ? true : null, `cell "${lw1.text}" · OIL tracker now "${ob1.txt}" (before: "${ob0.txt}")`, lwp1 + ', ' + ob1.pic)
    /* change one remark on Saturday, sign, publish AL1 */
    await openBoard(p, W, 'Jul 13', SAT)
    await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.rmks"]`, 'W2 REMARK').catch(async () => { await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.rmk"]`, 'W2 REMARK') })
    const st3 = await pendingOf(p, SAT)
    W.rec('s2-10', 'a remark changed on Saturday: pending, sign-offs fall', st3.pend >= 1 && st3.notSigned, JSON.stringify(st3), await W.pic(p, '10-sat-remark'))
    await signAll(p, W); const pb3 = await publish(p, W, SAT); await hideToast(p)
    const st4 = await pendingOf(p, SAT)
    W.rec('s2-11', `Sat 18 Jul AL1 published (${pb3.label})`, st4.pend === 0 && /AL1/.test(st4.signed), `${JSON.stringify(st4)} · toast "${pb3.toast}"`, await W.pic(p, '11-sat-al1'))
    const w2 = await win('12-availwin-after-al1')
    W.rec('s2-12', 'after AL1: ALL AVAIL window — RECORD whether Hex is listed', null, JSON.stringify(w2.r), w2.pic)
    await closeBoard(p, W)
    const lw2 = await lwCell(p, W, MAN, '2026-07-18')
    const lwp2 = await W.pic(p, '13-lw-after-al1')
    const ob2 = await oilBal(p, W, MAN, '13b-oil-after-al1')
    W.rec('s2-13', 'after AL1: Hex 18 Jul FO still there (D142 + D2313)', /^FO/.test(lw2.text) ? true : (ob2.txt === ob0.txt ? null : false), `cell "${lw2.text}" · OIL tracker now "${ob2.txt}" (before the tick "${ob0.txt}")`, lwp2 + ', ' + ob2.pic)
    if (!/^FO/.test(lw2.text)) {
      /* his row left the grid with the tick (SANS men are off the war unless "+ SANS" — D1215): put SANS on through ⚙ Settings → "+ SANS", then read the cell */
      await go(p, 'leavewar'); await sleep(700)
      await W.press(p, '[data-testid="settings-open"]:visible', 'settings')
      await W.press(p, '[data-testid="gadd-SANS"]:visible', 'plus-sans')
      const sp = await W.pic(p, '13c-plus-sans')
      await p.keyboard.press('Escape'); await sleep(500)
      if (await p.locator('[data-testid="settings-sheet"]:visible').count()) { const x = p.locator('[data-testid="settings-sheet"] .win-x:visible, [data-testid="settings-sheet"] button[aria-label="Close"]:visible').first(); if (await x.count()) await W.press(p, x, 'settings-x') }
      const lw3 = await lwCell(p, W, MAN, '2026-07-18')
      const lwp3 = await W.pic(p, '13d-lw-sans-on')
      const ob3 = await oilBal(p, W, MAN, '13e-oil-sans-on')
      W.rec('s2-13b', 'after AL1, SANS put on the war (⚙ → + SANS): Hex 18 Jul FO', /^FO/.test(lw3.text), `cell "${lw3.text}" · OIL tracker "${ob3.txt}" (before the tick "${ob0.txt}")`, sp + ', ' + lwp3 + ', ' + ob3.pic)
    }
    /* Wed 22 Jul: pending, sign-offs fall; the pending list's line */
    await openBoard(p, W, 'Jul 20', WED)
    const st5 = await pendingOf(p, WED), pkW = await pucksIn(p, '#schedBoard', MAN)
    W.rec('s2-14', 'Wed 22 Jul (the tick\'s day): reads pending, sign-offs fallen', st5.pend >= 1 && st5.notSigned, `${JSON.stringify(st5)} · pucks ${JSON.stringify(pkW.map(x => x.sec + '/' + x.head + '/san=' + x.san))}`, (await W.pic(p, '14-wed-pending')) + ', ' + await picAt(p, W, '14b-wed-crew', SA))
    const pl = await pendList(p, W, WED, '15-wed-pendlist')
    W.rec('s2-15', 'Wed 22 Jul pending list — RECORD its line for him exactly', null, pl.text, pl.pic)
    await closeWin(p)
  } catch (e) {
    W.rec('s2-ERR', 'script stopped', null, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}

/* =================== S6 =================== */
const TRAIN = { type: 'Training', allday: false, s: 480, e: 1020, date: 'Jul 18', yr: 2026, remarks: '', acc: 'g' }
async function s6(szKey, variant) {
  const sz = SIZES[szKey], W = mk('s6' + variant, sz)
  const { b, p } = await world(sz, W, '2026-07-15T09:00:00')
  const SAT = 5
  try {
    await signIn(p, 'ad', 'a')
    const ids = { one: ['bane'], two: ['bane', 'rocky'], three: ['bane', 'rocky', 'nick'], aa: ['allavail'] }[variant]
    const css = await p.evaluate(ids => ids.map(i => window.PEOPLE[i] ? window.PEOPLE[i].cs : i), ids)
    /* the real door first (one person only): + Input on the Inputs calendar, Training for Ranger — does it let the OIL question wait? */
    let door = 'not tried'
    if (variant === 'one') {
      await go(p, 'inputs')
      if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await W.press(p, '#inCalBtn', 'cal')
      await p.locator('[data-icday="2026-07-18"]').first().focus(); await p.keyboard.press('Enter')
      await p.locator('[data-testid="win-inputsday"]').waitFor()
      await W.press(p, '#icPopAdd', 'plus-input')
      await p.selectOption('#inpEditPop #inpEditType', 'Training')
      if (await p.locator('#inpEditPop #inpEditPerson').count()) await p.selectOption('#inpEditPop #inpEditPerson', 'bane')
      const ad = p.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.click()
      await p.fill('#inpEditPop #inpEditStart', '08:00'); await p.fill('#inpEditPop #inpEditEnd', '17:00')
      await W.press(p, '#inpEditSave', 'save')
      const asked = await p.locator('[data-testid="oilconf"]').count()
      const btns = await p.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"] button')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim() + (e.disabled ? '(disabled)' : '')).join(' | '))
      const pq = await W.pic(p, '00a-oil-question')
      if (asked) { await W.press(p, '[data-testid="oilconf-cancel"]', 'oil-back') }
      const filed = await p.evaluate(() => window.INPUTS.filter(r => r.date === 'Jul 18' && r.type === 'Training').length)
      const bar = ((await p.locator('body').innerText()).match(/Not (filed|added)[^\n]*/) || [''])[0]
      door = `asked ${asked}; buttons ${btns}; after Back: Training on 18 Jul filed ${filed}; bar "${bar}"`
      W.rec('s6-00', 'the real door: + Input → Training for Ranger on Sat 18 Jul → Save: is there a way to leave the OIL question for later?', null, door, pq + ', ' + await W.pic(p, '00b-after-back'))
      await p.keyboard.press('Escape').catch(() => {}); await sleep(300)
      const x = p.locator('#inpEditPop .win-x:visible, #inpEditCancel:visible').first(); if (await x.count()) await x.click().catch(() => {})
      const dx = p.locator('[data-testid="win-inputsday-x"]:visible'); if (await dx.count()) await dx.click().catch(() => {})
    }
    /* the fixture as frf-w3 makes it: the bridge's own filing command, the real window's shape without its OIL answer (SAID SO) */
    await p.evaluate(([ids, T]) => { const w = window; w.fileInput({ ...T, people: ids.map(x => ({ p: x })), iid: 'w2-t1' }); w.afterSchedMutate() }, [ids, TRAIN])
    const fx = await p.evaluate(() => { const r = window.INPUTS.find(r => r.iid === 'w2-t1'); return r ? { people: r.people, oil: r.oil || {} } : null })
    W.rec('s6-01', `fixture: Training on Sat 18 Jul for ${css.join(' + ')}, no OIL answer (planted through the bridge's fileInput, as frf-w3)`, !!fx && JSON.stringify(fx.oil) === '{}', JSON.stringify(fx))
    await openBoard(p, W, 'Jul 13', SAT)
    /* the four sign-off boxes: the first opens the day's OIL list; Later */
    const roles = ['cur', 'sked', 'plan', 'appr'], nth = [0, 0, 1, 2]
    let listSeen = false, listPic = ''
    for (let i = 0; i < 4; i++) {
      const sel = p.locator(`#schedBoard .sb-sign select[data-sign="${roles[i]}"]:visible`).first()
      await sel.scrollIntoViewIfNeeded().catch(() => {})
      const v = await sel.locator('option').evaluateAll((os, n) => os.map(o => o.value).filter(Boolean)[n], nth[i])
      await sel.selectOption(v); await sleep(400)
      const later = p.locator('[data-testid="win-oilday"] [data-testid="odl-later"]')
      if (await later.count() && await later.first().isVisible()) { listSeen = true; listPic = await W.pic(p, '02-oil-list'); await W.press(p, later.first(), 'later'); await sleep(300) }
    }
    W.rec('s6-02', 'the sign-off press opened the day\'s OIL list; Later pressed', listSeen, '', listPic)
    const pb = await publish(p, W, SAT)
    await sleep(100)
    const fit = await p.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return null; const r = t.getBoundingClientRect(); return { left: r.left, right: r.right, w: innerWidth, sw: t.scrollWidth, cw: t.clientWidth, sh: t.scrollHeight, ch: t.clientHeight } })
    const note = pb.toast || ''
    const want = { one: 'Ranger’s Training has no OIL answer, so nobody on it earns OIL.', two: 'Ranger and Hex’s Training has no OIL answer, so nobody on it earns OIL.', three: 'Training for 3 people has no OIL answer, so nobody on it earns OIL.', aa: 'Training for ALL AVAIL has no OIL answer, so nobody on it earns OIL.' }[variant]
    const fits = fit && fit.left >= 0 && fit.right <= fit.w + 0.5 && fit.sw <= fit.cw + 1 && fit.sh <= fit.ch + 1
    W.rec('s6-03', `publish note for ${variant} (expected "…${want}")`, note.trim().endsWith(want), `NOTE: "${note}" · box ${JSON.stringify(fit)} fits ${fits}`, await W.pic(p, '03-note'))
  } catch (e) {
    W.rec('s6-ERR', 'script stopped', null, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}

for (const k of ONLY) {
  if (k === 's5d') await s5('d')
  if (k === 's5p') await s5('p')
  if (k === 's2d') await s2('d')
  if (k === 's2p') await s2('p')
  if (k === 's6d') for (const v of ['one', 'two', 'three', 'aa']) await s6('d', v)
  if (k === 's6p') for (const v of ['one', 'two', 'three', 'aa']) await s6('p', v)
}
writeFileSync(path.join(BASE_OUT, `results-${ONLY.join('_')}.json`), JSON.stringify(results, null, 1))
log('done')
