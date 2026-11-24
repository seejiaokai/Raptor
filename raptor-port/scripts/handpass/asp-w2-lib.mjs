// asp-w2 — walker w2's shared helpers (ALL AVAIL counts a man posted out as SANS, 22 Nov 26, chat 141).
// Copied from sfd-w1-lib.mjs, frf-w1.mjs, od-walk.mjs (archive), aa-C-s20c.mjs (New person + post-in) and
// lw-m5b-walk-w1.mjs ("+ SANS" chip / the SANS group's ✕). Nothing here writes to window.* — reads only.
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(HERE, '../..')
export const URL_ = process.env.W2_URL || 'http://localhost:4392/'
export const OUT = process.env.W2_OUT || path.join(ROOT, 'docs/img/handpass/2026-11-22-allavail-sans-posted/w2')
mkdirSync(path.join(OUT, 'taps'), { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const SIZES = {
  d: { name: 'desktop', eng: chromium, launch: existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}, opts: { viewport: { width: 1536, height: 864 } } },
  p: { name: 'phone', eng: webkit, launch: {}, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
}
export const HEX = 'rocky'
export const results = []
export const log = (...a) => console.log(...a)
export const sleep = ms => new Promise(r => setTimeout(r, ms))
const p2 = n => String(n).padStart(2, '0')
export const J = o => JSON.stringify(o)
export function saveResults(name) { writeFileSync(path.join(OUT, `results-${name}.json`), JSON.stringify(results, null, 1)) }

export function mk(scn, sz) {
  let tapN = 0
  const errs = []
  const W = {
    scn, sz, errs, isPhone: sz.name === 'phone',
    async pic(p, step) { const f = path.join(OUT, `${scn}-${step}-${sz.name}.png`); await p.screenshot({ path: f }); return path.basename(f) },
    async press(p, loc, label = 'press') {
      const l = typeof loc === 'string' ? p.locator(loc).first() : loc
      await l.waitFor({ state: 'visible', timeout: 8000 })
      await l.scrollIntoViewIfNeeded().catch(() => {})
      if (W.isPhone) {
        await l.tap({ timeout: 5000 })
        await p.screenshot({ path: path.join(OUT, 'taps', `${scn}-${p2(++tapN)}-${label}-now-phone.png`) }).catch(() => {})
      } else await l.click({ timeout: 5000 })
      await sleep(350)
    },
    rec(id, what, ok, note, pics) { results.push({ scn, size: sz.name, id, what, ok, note, pics }); log(`${ok === true ? 'PASS' : ok === false ? 'FAIL' : ok === 'REC' ? 'RECORDED' : ok === 'NW' ? 'NOT WALKED' : 'NOTE'} ${scn}/${sz.name} ${id} — ${what}${note ? ' :: ' + note : ''}${pics ? ' [' + pics + ']' : ''}`) },
  }
  return W
}

export async function world(sz, W, when = '2026-07-15T09:00:00') {
  const b = await sz.eng.launch(sz.launch)
  const ctx = await b.newContext(sz.opts)
  await ctx.clock.install({ time: new Date(when) })
  const p = await ctx.newPage()
  p.on('pageerror', e => W.errs.push('PAGEERROR ' + e.message))
  p.on('console', m => { if (m.type() === 'error') W.errs.push('CONSOLE ' + m.text().slice(0, 200)) })
  p.on('response', r => { if (r.status() >= 400) W.errs.push('HTTP ' + r.status() + ' ' + r.url()) })
  p.on('requestfailed', r => W.errs.push('REQFAIL ' + r.url()))
  await p.goto(URL_)
  return { b, ctx, p }
}
export async function signIn(p, user, pass) {
  await p.waitForSelector('#luser'); await p.fill('#luser', user); await p.fill('#lpass', pass)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(800)
}
export async function signOut(p, W) {
  if (await p.locator('#logout:visible').count()) await W.press(p, '#logout:visible', 'logout')
  else { await W.press(p, '#burger:visible', 'burger'); await W.press(p, '#drawerLogout:visible', 'drawer-logout') }
  await sleep(600)
  if (!(await p.locator('#luser:visible').count())) {
    const conf = p.getByRole('button', { name: /^(Logout|Sign out|Yes|Confirm|OK)/ })
    if (await conf.count()) { await conf.first().click(); await sleep(500) }
  }
  await p.waitForSelector('#luser', { timeout: 8000 })
}
export async function go(p, to) { await p.evaluate(t => window.go(t), to); await p.waitForFunction(t => window.CURPAGE === t, to); await sleep(600) }
export const today = p => p.evaluate(() => { const d = new Date(); return d.toDateString() + ' ' + d.toTimeString().slice(0, 5) })
export const weekOf = p => p.evaluate(() => (window.DAYS || []).map(d => d.dt).join(','))
export const B = sel => `#schedBoard ${sel}:visible`
export const hideToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.style.transition = 'none'; t.style.opacity = '0' } })
export const toastSaid = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.textContent || '').replace(/\s+/g, ' ').trim() : '' })
export const txtOf = async (p, sel) => ((await p.locator(sel).first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()

export async function openBoard(p, W, di) {
  if (await p.locator('#schedBoard').count()) {
    const cur = await p.evaluate(() => window.SBDAY)
    if (cur === di) return
    await closeBoard(p, W)
  }
  await go(p, 'editsched')
  const d = p.locator(`#eWeek [data-sbday="${di}"]`).first()
  await d.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(300)
  if (W.isPhone) { await d.tap(); await sleep(80); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-board-open-${di}-now-phone.png`) }) }
  else await d.click()
  await p.waitForSelector('#schedBoard'); await sleep(800)
}
export async function closeBoard(p, W) {
  if (!(await p.locator('#schedBoard').count())) return
  const done = p.locator('#sbDone:visible').first()
  if (await done.count()) await W.press(p, done, 'done'); else await p.keyboard.press('Escape')
  await sleep(600)
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
/* arm a fill zone on the board, then press a crew-list puck (a man, or the ALL AVAIL / ALL placeholder) */
export async function armAndPick(p, W, armSel, pid, label) {
  /* aim at the zone's own "+ add" box where it has one: a zone holding a man has his puck at its centre (walk-scripts §4) */
  /* the "+ add" mark takes no presses itself, so the press goes to the zone at the mark's own place */
  const addz = p.locator(`#schedBoard ${armSel} .addz:visible`).first()
  const zone = p.locator(B(armSel)).first()
  const ab = (await addz.count()) ? (await addz.scrollIntoViewIfNeeded().catch(() => {}), await addz.boundingBox()) : null
  const zb = ab ? await zone.boundingBox() : null
  if (ab && zb) {
    const pos = { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 }
    if (W.isPhone) { await zone.tap({ position: pos }); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-arm-${label}-now-phone.png`) }).catch(() => {}) }
    else await zone.click({ position: pos })
    await sleep(350)
  } else await W.press(p, B(armSel), 'arm-' + label)
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  /* always the crew list's own puck (.rpuck): once a placeholder stands on a row, that row's small puck comes first */
  const pk = `#schedBoard .rpuck[data-person="${pid}"]:visible`
  await W.press(p, pk, 'pick-' + pid)
  await sleep(400)
  return armed
}

/* a Ground Programme row (+ Item) named `name`, from..to, holding `pid` */
export async function groundRow(p, W, di, name, from, to, pid) {
  await W.press(p, B(`[data-gradd="${di}"]`), 'gr-add')
  const ri = await p.evaluate(i => window.DAYS[i].ground.length - 1, di)
  await typeBox(p, W, `[data-bfld="gr:${di}.${ri}.prog"]`, name)
  await typeBox(p, W, `[data-bfld="gr:${di}.${ri}.str"]`, from)
  await typeBox(p, W, `[data-bfld="gr:${di}.${ri}.end"]`, to)
  const armed = pid ? await armAndPick(p, W, `[data-fill="g:${di}.${ri}.+"]`, pid, 'gr') : null
  const row = await p.evaluate(([i, r]) => { const x = window.DAYS[i].ground[r]; return x ? { prog: x.prog, str: x.str, end: x.end, who: x.who, rid: x.rid } : null }, [di, ri])
  return { ri, armed, row }
}
/* a Common Programme row (+ Item) with ALL AVAIL */
export async function progRow(p, W, di, name, from, to, pid = 'allavail') {
  await W.press(p, B(`[data-padd="${di}"]`), 'add-item')
  const ri = await p.evaluate(i => window.DAYS[i].allhands.length - 1, di)
  await typeBox(p, W, `[data-bfld="ap:${di}.${ri}.prog"]`, name)
  await typeBox(p, W, `[data-bfld="ap:${di}.${ri}.str"]`, from)
  await typeBox(p, W, `[data-bfld="ap:${di}.${ri}.end"]`, to)
  const armed = await armAndPick(p, W, `[data-fill="a:${di}.${ri}.+"]`, pid, 'ap')
  const row = await p.evaluate(([i, r]) => { const x = window.DAYS[i].allhands[r]; return x ? { prog: x.prog, str: x.str, end: x.end, who: x.who, rid: x.rid } : null }, [di, ri])
  return { ri, armed, row }
}
/* the main fixture on the open board's day: BRIEF 08:00–09:00 naming the man, SQN EVENT 10:00–17:00 for ALL AVAIL */
export async function mainFixture(p, W, di, pid = HEX, brief = ['08:00', '09:00'], ev = ['10:00', '17:00']) {
  await openBoard(p, W, di)
  const g = await groundRow(p, W, di, 'BRIEF', brief[0], brief[1], pid)
  const a = await progRow(p, W, di, 'SQN EVENT', ev[0], ev[1])
  const ok = !!(g.row && JSON.stringify(g.row.who || '').includes(pid) && a.row && JSON.stringify(a.row.who || '').includes('allavail'))
  return { g, a, ok }
}

/* the count chip of one row (by the row's own id), opened; the ALL AVAIL window read; the chip's words */
export async function readCount(p, W, rid, where = '#schedBoard', who = HEX) {
  const sel = `${where} [data-oilsent="r:${rid}"]:visible`
  const c = p.locator(sel).first()
  if (!(await c.count())) return { chip: 'NO CHIP', win: null }
  /* bring it to the middle of its own scroller, below the board's sticky bar (a plain scrollIntoView left a sim row's
     chip under the bar) */
  await c.evaluate(e => {
    let s = e.parentElement
    while (s && !(s.scrollHeight > s.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement
    const r = e.getBoundingClientRect()
    ;(s || document.scrollingElement).scrollBy(0, r.top - window.innerHeight * 0.55)
  }); await sleep(300)
  const chip = ((await c.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
  /* pressed as a person presses: at the chip's own middle, by a mouse click or a finger tap (no actionability wait, so a
     chip something else covers is pressed — and what the press reached is recorded) */
  const bb = await c.boundingBox()
  const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2
  const topAt = await p.evaluate(([x, y]) => { const t = document.elementFromPoint(x, y); return t ? (t.className || t.tagName) + (t.dataset && t.dataset.slot ? ' slot=' + t.dataset.slot : '') + (t.dataset && t.dataset.oilsent ? ' (the chip)' : '') : 'nothing' }, [x, y])
  if (W.isPhone) { await p.touchscreen.tap(x, y); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-chip-${Date.now() % 100000}-now-phone.png`) }).catch(() => {}) }
  else await p.mouse.click(x, y)
  await sleep(700)
  const win = await readWin(p, who)
  const arm = await p.evaluate(() => window.ARM && window.ARM.key)
  if (win === 'no window' && arm) { await p.keyboard.press('Escape'); await sleep(300) }
  return { chip, win, topAt, arm: win === 'no window' ? arm : undefined }
}
export const readWin = (p, who = HEX) => p.evaluate(id => {
  const w = [...document.querySelectorAll('.availwin')].find(e => e.getBoundingClientRect().width > 0)
  if (!w) return 'no window'
  const P = window.PEOPLE
  const rows = [...w.querySelectorAll('.rpuck[data-awp]')]
  const me = w.querySelector(`.rpuck[data-awp="${id}"]`)
  const pk = me && (me.querySelector('.puck') || me)
  return {
    n: rows.length, has: !!me, san: pk ? pk.classList.contains('san') : null,
    why: me ? ((me.querySelector('.rwhy') || {}).textContent || '').trim() : '',
    flag: me ? (me.classList.contains('clash') ? 'RED' : me.classList.contains('flagged') ? 'AMBER' : '') : '',
    ttl: ((w.querySelector('.win-ttl') || {}).textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90),
    who: rows.map(r => (P[r.dataset.awp] || {}).cs || r.dataset.awp).join(','),
  }
}, who)
export async function closeWin(p, W) {
  const x = p.locator('.availwin:visible .win-x').first()
  if (await x.count()) await W.press(p, x, 'win-x'); else await p.keyboard.press('Escape')
  await sleep(300)
}

/* the day's pending chip and sign line (frf-w1's pendingOf, board or Edit Schedule) */
export const pendingOf = (p, di) => p.evaluate(i => {
  const vis = e => e.getBoundingClientRect().width > 0
  const board = document.querySelector('#schedBoard')
  let root = board
  if (!board) {
    const wd = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]
    root = document.querySelector(`#eWeek section.day[data-day="${i}"]`) || document.body
  }
  /* Edit Schedule: the day's own "N pending" button carries data-pendlist (its day card's section may not hold it) */
  const pl = board ? null : [...document.querySelectorAll(`#eWeek [data-pendlist="${i}"]`)].find(vis)
  const all = pl ? [pl] : [...root.querySelectorAll('*')].filter(e => vis(e) && /^\d+\s*pending/i.test((e.innerText || '').trim()) && (e.innerText || '').trim().length < 20)
  const pendEl = all[all.length - 1]
  const pend = pendEl ? parseInt(pendEl.innerText, 10) : 0
  const txt = (root.innerText || '').replace(/\s+/g, ' ')
  const k = txt.toUpperCase().indexOf('SIGNED ')
  const k2 = k >= 0 ? txt.toUpperCase().indexOf('SIGN-OFF', k) : -1
  const sm = k >= 0 ? txt.slice(k, k2 > k ? k2 : k + 90).trim() : ''
  return { pend, notSigned: /Not yet signed/i.test(txt), signed: sm, approved: window.dayApproved ? window.dayApproved(i) : 'n/a' }
}, di)
export async function signAll(p, W) {
  const roles = ['cur', 'sked', 'plan', 'appr'], nth = [0, 0, 1, 2]
  for (let i = 0; i < 4; i++) {
    const sel = p.locator(`#schedBoard .sb-sign select[data-sign="${roles[i]}"]:visible`).first()
    const v = await sel.locator('option').evaluateAll((os, n) => os.map(o => o.value).filter(Boolean)[n], nth[i])
    await sel.selectOption(v); await sleep(300)
    const later = p.locator('[data-testid="win-oilday"] button', { hasText: 'Later' })
    if (await later.count() && await later.first().isVisible()) { await later.first().click(); await sleep(300) }
  }
}
export async function publish(p, W, di) {
  await signAll(p, W)
  let btn = null
  for (const s of [`[data-beak="${di}"]`, `[data-alpub="${di}"]`]) { const l = p.locator(B(s)).first(); if (await l.count()) { btn = l; break } }
  if (!btn) return 'no publish button'
  const label = ((await btn.innerText()) || '').trim()
  await W.press(p, btn, 'publish'); await sleep(900); await hideToast(p)
  return label
}
/* the pending list of a day, opened from its "N pending" on Edit Schedule; its lines; closed by Escape */
export async function pendingLines(p, W, di) {
  await closeBoard(p, W); await go(p, 'editsched')
  const b = p.locator(`#eWeek [data-pendlist="${di}"]:visible`).first()
  if (!(await b.count())) return { open: false, lines: '' }
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
  await W.press(p, b, 'pendlist'); await sleep(700)
  const lines = await p.evaluate(() => [...document.querySelectorAll('.floatwin, .chgwin, [class*="chg"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ')).sort((a, b) => b.length - a.length)[0] || '')
  return { open: true, lines: lines.slice(0, 700) }
}

/* ---- the Leave War ---- */
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
/* his cell → ⋯ → Post out → (chip) → Post out. chip: 'sans' | 'none' (tap SANS twice) */
export async function postOut(p, W, id, iso, tag, chip = 'sans') {
  const c = (await lwCell(p, W, id, iso)).cell
  if (!c) return { line: 'NO CELL for ' + iso }
  await W.press(p, c, 'cell-' + iso)
  await W.press(p, '[data-testid="bid-more"]:visible', 'more')
  await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
  const pic0 = await W.pic(p, tag + '-postout-open')
  const chips0 = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="po-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid + (e.classList.contains('on') || e.getAttribute('aria-pressed') === 'true' ? '[on]' : '')).join(' '))
  /* 'none': the chip already chosen (Overseas Sqn, the sheet's default) tapped again, so no chip is chosen */
  if (chip === 'none') await W.press(p, '[data-testid^="po-"][aria-pressed="true"]:visible', 'po-chosen-again')
  else await W.press(p, '[data-testid="po-sans"]:visible', 'po-sans')
  const chips1 = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="po-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid + (e.classList.contains('on') || e.getAttribute('aria-pressed') === 'true' ? '[on]' : '')).join(' '))
  const line = ((await p.locator('[data-testid="po-line"]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ')
  const pic = await W.pic(p, tag + '-postout-sheet')
  await W.press(p, '[data-testid="po-confirm"]:visible', 'po-confirm'); await sleep(1000)
  const after = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null } }, id)
  return { line, pic: pic0 + ', ' + pic, after, chips0, chips1 }
}
/* "+ SANS" on (the add chip) or off (the SANS group's ✕) in the Leave War's ⚙ Settings; returns whether the group shows */
export async function sansGroup(p, W, on, tag) {
  await go(p, 'leavewar'); await sleep(700)
  await W.press(p, '[data-testid="settings-open"]:visible', 'settings-open')
  await p.waitForSelector('[data-testid="settings-sheet"]'); await sleep(400)
  const has = await p.locator('[data-testid="grow-SANS"]').count()
  if (on && !has) await W.press(p, '[data-testid="gadd-SANS"]:visible', 'gadd-SANS')
  if (!on && has) await W.press(p, '[data-testid="gdrop-SANS"]:visible', 'gdrop-SANS')
  await sleep(400)
  const now = await p.locator('[data-testid="grow-SANS"]').count()
  const pic = tag ? await W.pic(p, tag + '-settings-' + (on ? 'on' : 'off')) : ''
  await W.press(p, '[data-testid="settings-close"]:visible', 'settings-close'); await sleep(400)
  if (await p.locator('[data-testid="settings-sheet"]').count()) { await W.press(p, '[data-testid="settings-close"]:visible', 'settings-close2'); await sleep(400) }
  return { group: now > 0, pic }
}

/* ---- Admin → Users ---- */
export async function usersOpen(p, W) {
  await go(p, 'admin'); await sleep(400)
  if (!(await p.locator('#accList:visible').count())) {
    const cat = p.locator('.adm-cat', { hasText: 'Users' }).first()
    if (await cat.count()) await W.press(p, cat, 'adm-users')
    else { const s = p.getByText('Sign-in and roster').first(); if (await s.count()) await W.press(p, s, 'adm-users') }
    await sleep(400)
  }
  await p.waitForSelector('#accList')
}
export async function archive(p, W, id, tag) {
  await usersOpen(p, W)
  await W.press(p, `#accList [data-person="${id}"] .acc-tap`, 'acc-row')
  const pic0 = await W.pic(p, tag + '-acc-open')
  await W.press(p, '#accEdArchive:visible', 'archive'); await sleep(500)
  const said = await toastSaid(p)
  const pic = await W.pic(p, tag + '-archived')
  return { archived: await p.evaluate(id => !!window.PEOPLE[id].archived, id), said, pic: pic0 + ', ' + pic }
}
/* New person: callsign, seat, cat, a post-in date (typed in the box), Add person */
export async function newPerson(p, W, cs, ini, seat, cat, postIn, tag) {
  await usersOpen(p, W)
  const before = await p.evaluate(() => Object.keys(window.PEOPLE))
  const nb = p.locator('#accAddModeNew:visible').first()
  if (await nb.count()) await W.press(p, nb, 'mode-new')
  await p.locator('#accAddCs').scrollIntoViewIfNeeded()
  await p.fill('#accAddCs', cs)
  if (await p.locator('#accAddIni').count()) await p.fill('#accAddIni', ini)
  await p.selectOption('#accAddSeat', seat)
  if (cat) await p.selectOption('#accAddCat', cat).catch(() => {})
  const pi = p.locator('#accAddPostIn')
  await pi.scrollIntoViewIfNeeded()
  const tagName = await pi.evaluate(e => e.tagName + ':' + (e.getAttribute('type') || ''))
  /* the box is the app's own date button: pressed, it opens the app's calendar; the date is pressed there */
  await W.press(p, pi, 'postin-box')
  const day = p.locator(`[data-iso="${postIn}"]:visible`).first()
  if (await day.count()) await W.press(p, day, 'postin-day')
  await sleep(300)
  const piVal = ((await pi.innerText().catch(() => '')) || (await pi.inputValue().catch(() => '?'))).replace(/\s+/g, ' ').trim()
  const pic0 = await W.pic(p, tag + '-newperson-form')
  await W.press(p, '#accAdd:visible', 'add-person'); await sleep(800)
  const said = await toastSaid(p)
  const after = await p.evaluate(b => Object.keys(window.PEOPLE).filter(k => !b.includes(k)), before)
  const id = after[0] || null
  const rec = id ? await p.evaluate(id => { const q = window.PEOPLE[id]; return { cs: q.cs, seat: q.seat, san: !!q.san } }, id) : null
  const pic = await W.pic(p, tag + '-newperson-added')
  return { id, rec, said, piVal, tagName, pic: pic0 + ', ' + pic }
}
/* the Quals hand tick: the seat's view, ✎ Edit, his SANS cell, Done */
export async function qualsTick(p, W, id, tag) {
  await go(p, 'quals')
  const seat = await p.evaluate(id => window.PEOPLE[id].seat, id)
  await W.press(p, seat === 'FCP' ? '#qViewP' : '#qViewW', 'qview')
  if (await p.locator('#qEdit:visible').count()) await W.press(p, '#qEdit:visible', 'qedit')
  const cell = p.locator(`td[data-q="${id}|san"]`).first()
  if (!(await cell.count())) return { st: 'NO SANS CELL', pic: await W.pic(p, tag + '-quals-nocell') }
  await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  await W.press(p, cell, 'san-cell'); await sleep(400)
  const st = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null } }, id)
  const pic = await W.pic(p, tag + '-quals')
  if (await p.locator('#qSave:visible').count()) await W.press(p, '#qSave:visible', 'qdone')
  return { st, pic }
}

/* one count read "both ways": with "+ SANS" off, on, off — each time the board reopened on the day and the row's chip
   opened. Returns three readings. */
export async function bothWays(p, W, di, rid, tag, who = HEX) {
  const rids = Array.isArray(rid) ? rid : [rid]
  const out = rids.map(() => [])
  for (const [i, on] of [[0, false], [1, true], [2, false]]) {
    const sg = await sansGroup(p, W, on, i === 1 ? tag : '')
    await openBoard(p, W, di)
    for (let k = 0; k < rids.length; k++) {
      const r = await readCount(p, W, rids[k], '#schedBoard', who)
      r.sans = on; r.group = sg.group
      r.pic = await W.pic(p, `${tag}${rids.length > 1 ? '-r' + k : ''}-${['off', 'on', 'off2'][i]}-win`)
      await closeWin(p, W)
      r.pend = await pendingOf(p, di)
      out[k].push(r)
    }
    await closeBoard(p, W)
  }
  return Array.isArray(rid) ? out : out[0]
}
/* the three readings agree on who is in, and each says `want` about the man (true = in, false = out) */
export const agree = (rs, want) => rs.length === 3 && rs.every(r => r.win && typeof r.win === 'object' && r.win.has === want) && rs.every(r => r.win.who === rs[0].win.who)
export const brief = r => r && r.win && typeof r.win === 'object' ? `SANS ${r.sans ? 'on' : 'off'} (group ${r.group}): chip "${r.chip}", window ${r.win.n} people, Hex ${r.win.has ? 'IN' : 'out'}${r.win.has ? (r.win.san ? ' (purple line)' : '') + (r.win.why ? ' "' + r.win.why + '"' : '') : ''}, pending ${r.pend ? r.pend.pend : '?'}` : `SANS ${r && r.sans ? 'on' : 'off'}: chip "${r && r.chip}", window ${J(r && r.win)}; at the chip's middle stands "${r && r.topAt}"; the press armed ${r && r.arm}`
