// asp-w1 — walker w1's helpers for the ALL AVAIL / SANS-posted walk (22 Nov 26, chat 141).
// Copied from sfd-w1-lib.mjs, frf-w1.mjs, aa-B-lib.mjs and lw-m5b-walk-w1.mjs; nothing guessed from the source but the
// row-delete, plans-menu and settings attributes, read off board-html.ts / board.ts / html.ts.
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(HERE, '../..')
export const URL_ = process.env.W1_URL || 'http://localhost:4393/'
export const BASE_OUT = path.join(ROOT, 'docs/img/handpass/2026-11-22-allavail-sans-posted/w1')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const SIZES = {
  d: { name: 'desktop', eng: chromium, launch: existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}, opts: { viewport: { width: 1536, height: 864 } } },
  p: { name: 'phone', eng: webkit, launch: {}, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
}
export const results = []
export const log = (...a) => console.log(...a)
export const sleep = ms => new Promise(r => setTimeout(r, ms))
const p2 = n => String(n).padStart(2, '0')
export const J = o => JSON.stringify(o)
export const HEX = 'rocky', SAT = 5, SAT_ISO = '2026-07-18'

/* one run = one folder (walk-scripts §5): <run>/ emptied at the start of that run */
export function mk(run, scn, sz) {
  const dir = path.join(BASE_OUT, run)
  mkdirSync(path.join(dir, 'taps'), { recursive: true })
  let tapN = 0, picN = 0
  const errs = []
  const W = {
    scn, sz, errs, dir, isPhone: sz.name === 'phone',
    async pic(p, step) { const f = path.join(dir, `${p2(++picN)}-${scn}-${step}-${sz.name}.png`); await p.screenshot({ path: f }); return run + '/' + path.basename(f) },
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
    rec(id, what, ok, note, pics) { results.push({ run, scn, size: sz.name, id, what, ok, note, pics }); log(`${ok === true ? 'PASS' : ok === false ? 'FAIL' : 'NOTE'} ${scn}/${sz.name} ${id} — ${what}${note ? ' :: ' + note : ''}${pics ? ' [' + pics + ']' : ''}`) },
  }
  return W
}
export function clearRun(run) { const d = path.join(BASE_OUT, run); if (existsSync(d)) rmSync(d, { recursive: true, force: true }) }
export function saveResults(name) { mkdirSync(BASE_OUT, { recursive: true }); writeFileSync(path.join(BASE_OUT, `results-${name}.json`), JSON.stringify(results, null, 1)) }

export async function world(sz, W, when = '2026-07-15T09:00:00') {
  const b = await sz.eng.launch(sz.launch)
  const ctx = await b.newContext(sz.opts)
  await ctx.clock.install({ time: new Date(when) })
  const p = await ctx.newPage()
  p.on('pageerror', e => W.errs.push('PAGEERROR ' + e.message))
  p.on('console', m => { if (m.type() === 'error') W.errs.push('CONSOLE ' + m.text().slice(0, 200)) })
  p.on('response', r => { if (r.status() >= 400) W.errs.push('HTTP ' + r.status() + ' ' + r.url()) })
  p.on('requestfailed', r => W.errs.push('REQFAIL ' + r.url()))
  p.on('dialog', d => { W.errs.push('NATIVE DIALOG ' + d.message()); d.dismiss().catch(() => {}) })
  await p.goto(URL_)
  return { b, ctx, p }
}
export async function signIn(p, user, pass) {
  await p.waitForSelector('#luser'); await p.fill('#luser', user); await p.fill('#lpass', pass)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await sleep(800)
}
export async function signOut(p, W) {
  if (await p.locator('#schedBoard').count()) await closeBoard(p, W)
  if (await p.locator('#logout:visible').count()) await W.press(p, '#logout:visible', 'logout')
  else { await W.press(p, '#burger:visible', 'burger'); await W.press(p, '#drawerLogout:visible', 'drawer-logout') }
  await sleep(600)
  if (!(await p.locator('#luser:visible').count())) {
    const conf = p.getByRole('button', { name: /^(Logout|Sign out|Yes|Confirm|OK)/ })
    if (await conf.count()) { await conf.first().click(); await sleep(500) }
  }
  await p.waitForSelector('#luser', { timeout: 8000 })
}
/* a real reload: wait for the page to come back (the sign-in card or the week), then sign in if it asks */
export async function reloadIn(p) {
  await p.reload()
  await p.waitForFunction(() => !!document.querySelector('#luser') || (typeof window.go === 'function' && !!document.querySelector('#vWeek .day')), null, { timeout: 30000 })
  await sleep(500)
  if (await p.locator('#luser').count()) await signIn(p, 'ad', 'a')
  await p.waitForFunction(() => typeof window.go === 'function', null, { timeout: 20000 }); await sleep(500)
}
export async function go(p, to) { await p.evaluate(t => window.go(t), to); await p.waitForFunction(t => window.CURPAGE === t, to); await sleep(600) }
export const today = p => p.evaluate(() => { const d = new Date(); return d.toDateString() + ' ' + d.toTimeString().slice(0, 5) })
export const weekOf = p => p.evaluate(() => (window.DAYS || []).map(d => d.dt).join(','))
export const B = sel => `#schedBoard ${sel}:visible`
export const hideToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.style.transition = 'none'; t.style.opacity = '0' } })

export async function openBoard(p, W, di) {
  if (await boardUp(p)) return
  await go(p, 'editsched')
  const d = p.locator(`#eWeek [data-sbday="${di}"]`).first()
  await d.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(300)
  if (W.isPhone) { await d.tap(); await sleep(80); await p.screenshot({ path: path.join(W.dir, 'taps', `${W.scn}-board-open-${di}-now-phone.png`) }) }
  else await d.click()
  await p.waitForSelector('#schedBoard'); await sleep(800)
}
/* the board is up when its own Done is drawn (the #schedBoard element stays in the page when it is closed) */
export const boardUp = async p => (await p.locator('#sbDone:visible').count()) > 0
export async function closeBoard(p, W) {
  if (!(await boardUp(p))) return
  await W.press(p, p.locator('#sbDone:visible').first(), 'done')
  await sleep(600)
}
export async function boardStep(p, W, dir) {
  if (W.isPhone) { await W.press(p, dir > 0 ? '#sbNextDay' : '#sbPrevDay', dir > 0 ? 'next-day' : 'prev-day'); await sleep(700) }
  else {
    const cur = await p.evaluate(() => window.SBDAY)
    const nx = cur + dir
    if (nx >= 0 && nx <= 6) await W.press(p, `#schedBoard [data-sbtab="${nx}"]:visible`, 'tab' + nx)
    else {
      await W.press(p, `#schedBoard [data-sbweek="${dir}"]:visible`, 'week' + dir); await sleep(700)
      const want = dir > 0 ? 0 : 6
      if ((await p.evaluate(() => window.SBDAY)) !== want) await W.press(p, `#schedBoard [data-sbtab="${want}"]:visible`, 'tab' + want)
    }
    await sleep(700)
  }
  return p.evaluate(() => ({ sbday: window.SBDAY, week: (window.DAYS || []).map(d => d.dt).join(',') }))
}
export async function typeBox(p, W, sel, value) {
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

/* the main fixture, on the open board's Saturday: an ALL AVAIL Common Programme row 10:00–17:00 and a Ground
   Programme BRIEFING 08:00–09:00 naming Hex (+ Item, typing, a tap on the row, a tap on his puck) */
export async function eventRow(p, W, di, s = '1000', e = '1700') {
  await W.press(p, B(`[data-padd="${di}"]`), 'add-item')
  const ri = await p.evaluate(i => window.DAYS[i].allhands.length - 1, di)
  await typeBox(p, W, `[data-bfld="ap:${di}.${ri}.prog"]`, 'SQN EVENT')
  await typeBox(p, W, `[data-bfld="ap:${di}.${ri}.str"]`, s)
  await typeBox(p, W, `[data-bfld="ap:${di}.${ri}.end"]`, e)
  await W.press(p, B(`[data-fill="a:${di}.${ri}.+"]`), 'arm-cmn')
  await W.press(p, `#schedBoard [data-person="allavail"]:visible`, 'allavail'); await sleep(500)
  const row = await p.evaluate(([i, r]) => { const x = window.DAYS[i].allhands[r]; return { prog: x.prog, str: x.str, end: x.end, who: x.who } }, [di, ri])
  return { ri, row }
}
export async function briefingRow(p, W, di, id, s = '0800', e = '0900') {
  await W.press(p, B(`[data-gradd="${di}"]`), 'gr-add')
  const ri = await p.evaluate(i => window.DAYS[i].ground.length - 1, di)
  await typeBox(p, W, `[data-bfld="gr:${di}.${ri}.prog"]`, 'BRIEFING')
  await typeBox(p, W, `[data-bfld="gr:${di}.${ri}.str"]`, s)
  await typeBox(p, W, `[data-bfld="gr:${di}.${ri}.end"]`, e)
  await W.press(p, B(`[data-fill="g:${di}.${ri}.+"]`), 'gr-arm')
  await W.press(p, `#schedBoard .rpuck[data-person="${id}"]:visible`, 'crew-' + id); await sleep(400)
  const row = await p.evaluate(([i, r]) => { const x = window.DAYS[i].ground[r]; return x ? { prog: x.prog, str: x.str, end: x.end, who: x.who, more: x.more } : null }, [di, ri])
  return { ri, row }
}

/* sign-offs and publish (frf-w1) */
export async function signAll(p) {
  const roles = ['cur', 'sked', 'plan', 'appr'], nth = [0, 0, 1, 2]
  for (let i = 0; i < 4; i++) {
    const sel = p.locator(`#schedBoard .sb-sign select[data-sign="${roles[i]}"]:visible`).first()
    const v = await sel.locator('option').evaluateAll((os, n) => os.map(o => o.value).filter(Boolean)[n], nth[i])
    await sel.selectOption(v); await sleep(300)
    const later = p.locator('[data-testid="win-oilday"] button', { hasText: 'Later' })
    if (await later.count() && await later.first().isVisible()) { await later.first().click(); await sleep(300) }
  }
}
export async function publish(p, W, di, label = 'publish') {
  let btn = null
  for (const s of [`[data-beak="${di}"]`, `[data-alpub="${di}"]`]) { const l = p.locator(B(s)).first(); if (await l.count()) { btn = l; break } }
  if (!btn) return 'no publish button'
  const txt = (await btn.innerText()).trim()
  await W.press(p, btn, label); await sleep(900); await hideToast(p)
  return txt
}
/* the day's pending chip / sign line (frf-w1 pendingOf) */
export const pendingOf = (p, di) => p.evaluate(i => {
  const vis = e => e.getBoundingClientRect().width > 0
  const board = document.querySelector('#schedBoard')
  let root = board
  if (!board || !document.querySelector('#sbDone') || document.querySelector('#sbDone').getBoundingClientRect().width === 0) root = document.querySelector(`#eWeek section.day[data-day="${i}"]`) || document.querySelector(`#vWeek section.day[data-day="${i}"]`)
  if (!root) {
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
  const head = [...document.querySelectorAll(`[data-pendlist="${i}"]`)].filter(vis).map(e => e.innerText.trim()).join('|')
  return { pend, pendWords: pendEl ? pendEl.innerText.trim() : '', head, notSigned: /Not yet signed/i.test(txt), notPub: /Not yet published/i.test(txt), signed: sm }
}, di)

/* the count chips drawn for the Saturday on the surface in view; the chip of the event row = the one whose item names
   a:<di>.<ri> (data-oilsent), else the last drawn */
export const chipsOf = (p, root, di) => p.evaluate(([root, di]) => [...document.querySelectorAll(`${root} .oilcount[data-oilday="${di}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ sent: e.dataset.oilsent, ver: e.dataset.oilver, txt: e.innerText.trim(), title: e.getAttribute('title') })), [root, di])
export async function openChip(p, W, root, di, ri) {
  const chips = await chipsOf(p, root, di)
  let k = typeof ri === 'string' ? chips.findIndex(c => c.sent === ri) : chips.findIndex(c => (c.sent || '').includes(`a:${di}.${ri}`) || (c.sent || '').includes(`${di}.${ri}`))
  if (k < 0) k = chips.length - 1
  if (k < 0) return { chips, chip: null, win: 'no chip drawn' }
  const loc = p.locator(`${root} .oilcount[data-oilday="${di}"]`).filter({ visible: true }).nth(k)
  await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(250)
  await W.press(p, loc, 'count-chip'); await sleep(700)
  const win = await readWin(p)
  return { chips, chip: chips[k], win }
}
/* the open ALL AVAIL window: everyone listed, whether Hex is, his purple SANS line, his column, the tabs */
export const readWin = p => p.evaluate(id => {
  const w = [...document.querySelectorAll('.availwin')].find(x => x.getBoundingClientRect().width > 0)
  if (!w) return 'no window'
  const all = [...w.querySelectorAll('.rpuck[data-awp]')]
  const me = w.querySelector(`.rpuck[data-awp="${id}"]`)
  const pk = me && (me.querySelector('.puck') || me)
  const seat = w.querySelector(`.seat.oilpk[data-oilp="${id}"]`)
  return {
    n: all.length, has: !!me, san: pk ? pk.classList.contains('san') : null, why: me ? ((me.querySelector('.rwhy') || {}).textContent || '') : null,
    col: me && me.closest('.rcol') ? ((me.closest('.rcol').querySelector('.rh') || {}).innerText || '').replace(/\s+/g, ' ') : null,
    tabs: [...w.querySelectorAll('.win-tab')].map(t => t.innerText.replace(/\s+/g, ' ').trim()),
    head: ((w.querySelector('.win-ttl, .win-h, h3') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 80),
    earnSeat: seat ? ['on', 'off', 'inert'].find(k => seat.classList.contains(k)) || '?' : null,
  }
}, HEX)
export async function closeWin(p, W) {
  const x = p.locator('.availwin .win-x:visible').first()
  if (await x.count()) await W.press(p, x, 'win-x'); else await p.keyboard.press('Escape')
  await sleep(350)
}
/* OIL Earn on the board: #sbOil (aria-pressed); on a phone it may sit behind ⋯ */
export async function oilEarn(p, W, on) {
  const btn = p.locator('#sbOil')
  const state = async () => (await btn.getAttribute('aria-pressed').catch(() => null)) === 'true' || (await p.locator('#schedBoard .daybar-h.on').filter({ visible: true }).count()) > 0
  if ((await state()) === on) return 'already ' + on
  /* the desktop's bar button; on a phone the day bar's "OIL Earn" (data-oilmode, oilmode.ts) */
  let how = '#sbOil'
  if (await p.locator('#sbOil:visible').count()) await W.press(p, '#sbOil:visible', 'oil-earn')
  else { how = 'day bar OIL Earn'; await W.press(p, p.locator(`#schedBoard [data-oilmode="${SAT}"]`).filter({ visible: true }).first(), 'oil-earn-daybar') }
  await sleep(600)
  return `now ${await state()} (by ${how})`
}

/* the Leave War cell (frf-w1) */
export async function lwCell(p, W, id, iso) {
  await go(p, 'leavewar'); await sleep(900)
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][Number(iso.slice(5, 7)) - 1]
  const m = p.locator(`[data-testid="month-${mon}"]:visible`).first()
  if (await m.count()) { await W.press(p, m, 'month-' + mon); await sleep(900) }
  const c = p.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  if (!(await c.count())) return { cell: null, text: 'NO CELL' }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
  return { cell: c, text: ((await c.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim() }
}
export async function postOutSans(p, W, id, iso, tag) {
  const c = (await lwCell(p, W, id, iso)).cell
  await W.press(p, c, 'cell-' + iso)
  await W.press(p, '[data-testid="bid-more"]:visible', 'more')
  await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
  await W.press(p, '[data-testid="po-sans"]:visible', 'po-sans')
  const line = ((await p.locator('[data-testid="po-line"]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ')
  const pic = await W.pic(p, tag + '-postout-sheet')
  await W.press(p, '[data-testid="po-confirm"]:visible', 'po-confirm'); await sleep(1000)
  const after = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null } }, id)
  return { line, pic, after }
}
/* the Leave War's ⚙ Settings: "+ SANS" (gadd-SANS) on, the SANS group's ✕ (gdrop-SANS) off (lw-m5b-walk-w1) */
const T = (p, id) => p.locator(`[data-testid="${id}"]`)
export async function sansOnWar(p, W, on, tag) {
  await go(p, 'leavewar'); await sleep(700)
  const has0 = await p.locator('tr[data-testid="group-SANS"]').count()
  await W.press(p, T(p, 'settings-open').first(), 'settings-open')
  await p.waitForSelector('[data-testid="settings-sheet"]'); await sleep(500)
  let did = 'nothing'
  if (on && !(await T(p, 'grow-SANS').count())) {
    await W.press(p, T(p, 'gadd-SANS').first(), 'gadd-SANS'); await sleep(700); did = 'pressed + SANS'
    const ex = await T(p, 'grow-SANS').locator('[data-testid^="gcolor-"]').first().getAttribute('aria-expanded').catch(() => null)
    if (ex === 'true') { await p.locator('[data-testid="settings-sheet"]').getByText(/^groups$/i).first().click({ force: true }); await sleep(350) }
  } else if (!on && (await T(p, 'grow-SANS').count())) {
    await W.press(p, T(p, 'gdrop-SANS').first(), 'gdrop-SANS'); await sleep(600); did = 'pressed the SANS group ✕'
  }
  const pic = await W.pic(p, tag + '-settings')
  await W.press(p, T(p, 'settings-close').first(), 'settings-close'); await sleep(450)
  if (await T(p, 'settings-sheet').count()) { await W.press(p, T(p, 'settings-close').first(), 'settings-close2'); await sleep(450) }
  const has1 = await p.locator('tr[data-testid="group-SANS"]').count()
  return { did, groupBefore: has0 > 0, groupAfter: has1 > 0, pic }
}

/* S1's fixture made again for S5/S6/S7: the two rows, the posting from Wed 15 Jul, the four sign-offs, Publish.
   Every step through the app's controls; each asserted. Returns the rows' indexes and the published crowd. */
export async function publishedFixture(p, W) {
  await openBoard(p, W, SAT)
  const ev = await eventRow(p, W, SAT)
  const br = await briefingRow(p, W, SAT, HEX)
  W.rec('fx-01', 'fixture: SQN EVENT 10:00–17:00 for ALL AVAIL and BRIEFING 08:00–09:00 naming Hex on Sat 18 Jul', J(ev.row.who).includes('allavail') && br.row && br.row.who === HEX, `${J(ev.row)} · ${J(br.row)}`, await W.pic(p, 'fx-01-rows'))
  await closeBoard(p, W)
  const po = await postOutSans(p, W, HEX, '2026-07-15', 'fx-02')
  W.rec('fx-02', 'fixture: Hex posted out as SANS from Wed 15 Jul on the Leave War', po.after.san === true, `line "${po.line}" · ${J(po.after)}`, po.pic)
  await openBoard(p, W, SAT)
  await signAll(p)
  const pt = await publish(p, W, SAT)
  const o = await openChip(p, W, '#schedBoard', SAT, ev.ri)
  const pe = await pendingOf(p, SAT)
  W.rec('fx-03', `fixture: signed and published (${pt}); the window lists Hex`, pe.pend === 0 && o.win.has === true, `${J(pe)} · chip ${J(o.chip)} · window ${J(o.win)}`, await W.pic(p, 'fx-03-published-window'))
  await closeWin(p, W)
  await closeBoard(p, W)
  const lw = await lwCell(p, W, HEX, SAT_ISO)
  W.rec('fx-04', 'fixture: Hex\'s Leave War cell Sat 18 Jul', /^FO/.test(lw.text), `cell "${lw.text}"`, await W.pic(p, 'fx-04-lw'))
  return { evRi: ev.ri, brRi: br.ri, base: { n: o.win.n, chipTxt: o.chip && o.chip.txt }, lw: lw.text }
}

/* one look at the Saturday from Edit Schedule: pending / signed line, the count chip opened, Hex in it */
export async function satLook(p, W, tag, ri) {
  if (await p.locator('#schedBoard').count()) await closeBoard(p, W)
  await go(p, 'editsched'); await sleep(400)
  const card = p.locator(`#eWeek section.day[data-day="${SAT}"]`).first()
  await card.evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })).catch(() => {}); await sleep(400)
  const pe = await pendingOf(p, SAT)
  const picDay = await W.pic(p, tag + '-editsched-sat')
  const o = await openChip(p, W, '#eWeek', SAT, ri)
  const picWin = await W.pic(p, tag + '-availwin')
  if (o.chip) await closeWin(p, W)
  return { pe, chip: o.chip, chips: o.chips, win: o.win, picDay, picWin }
}
