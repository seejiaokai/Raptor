// sfd-w1 — walker w1's shared helpers (SANS from its date, D2313; 22 Nov 26). Copied from sfd-host.mjs and frf-w1.mjs.
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(HERE, '../..')
export const URL_ = process.env.W1_URL || 'http://localhost:4321/'
export const OUT = process.env.W1_OUT || path.join(ROOT, 'docs/img/handpass/2026-11-22-sans-from-date/w1')
mkdirSync(path.join(OUT, 'taps'), { recursive: true })
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
    rec(id, what, ok, note, pics) { results.push({ scn, size: sz.name, id, what, ok, note, pics }); log(`${ok === true ? 'PASS' : ok === false ? 'FAIL' : 'NOTE'} ${scn}/${sz.name} ${id} — ${what}${note ? ' :: ' + note : ''}${pics ? ' [' + pics + ']' : ''}`) },
  }
  return W
}

export async function world(sz, W, when) {
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

export async function openBoard(p, W, di) {
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
/* the board's day step (‹ ›); returns the board's day and the loaded week after it */
export async function boardStep(p, W, dir) {
  if (W.isPhone) { await W.press(p, dir > 0 ? '#sbNextDay' : '#sbPrevDay', dir > 0 ? 'next-day' : 'prev-day'); await sleep(700) }
  else {
    /* the desktop's day chips (data-sbtab) and the week arrows beside them (data-sbweek) */
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
  return p.evaluate(() => ({ sbday: window.SBDAY, week: (window.DAYS || []).map(d => d.dt).join(','), title: ((document.querySelector('#schedBoard .sb-title, #schedBoard h1, #schedBoard h2') || {}).innerText || '').replace(/\s+/g, ' ') }))
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

/* one man on the open board: every drawn copy of his puck — where it stands (a row, a crew-list column, SANS Avail, the
   ALL AVAIL window), whether it wears the purple SANS line (class `san` on the puck), its title; and the drawn headings */
export const readBoard = (p, id) => p.evaluate(id => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const root = document.querySelector('#schedBoard')
  const pucks = [...root.querySelectorAll(`.puck[data-person="${id}"]`)].filter(vis).map(e => {
    const where = e.closest('.availwin') ? 'ALLAVAIL-window' : e.closest('.rsans') ? 'SANS Avail' : e.closest('.rcol') ? ((e.closest('.rcol').querySelector('.rh') || {}).innerText || 'col').replace(/\s+/g, ' ') : 'row'
    const rp = e.closest('.rpuck, .rsans-row')
    const slot = (e.closest('[data-slot]') || e.closest('[data-iu]') || {}).dataset || {}
    const panel = e.closest('.sb-panel, .sec, .sb-sec')
    const ph = panel ? ((panel.querySelector('.sb-ph, .sec-h, h3') || {}).innerText || panel.className).replace(/\s+/g, ' ').slice(0, 30) : ''
    return { where, san: e.classList.contains('san'), title: e.getAttribute('title') || '', why: rp ? ((rp.querySelector('.rwhy') || {}).textContent || '') : '', rpcls: rp ? rp.className : '', ...(where === 'row' ? { slot: slot.slot || slot.iu || '', panel: ph } : {}) }
  })
  const heads = [...root.querySelectorAll('.rh, .rh2')].filter(vis).filter(h => !h.closest('.availwin')).map(h => h.innerText.replace(/\s+/g, ' ').trim())
  return { pucks, heads }
}, id)
/* the Edit Schedule week (and its crew panel): copies of his puck per day, and the crew panel's day */
export const readWeek = (p, id, root = '#eWeek') => p.evaluate(([id, root]) => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const days = {}
  for (const e of document.querySelectorAll(`${root} .puck[data-person="${id}"]`)) {
    const d = e.closest('section.day'); if (!d) continue
    const k = (d.classList.contains('peek') ? 'peek' : '') + ((d.querySelector('.day-head') || d).innerText.replace(/\s+/g, ' ').slice(0, 22))
    ;(days[k] = days[k] || []).push({ san: e.classList.contains('san'), title: e.getAttribute('title') || '', shown: vis(e) })
  }
  return days
}, [id, root])
export const readCrewPanel = (p, id) => p.evaluate(id => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const body = document.querySelector('.ros-body'); if (!body) return 'no panel'
  const day = ((body.querySelector('.er-dayname') || {}).textContent || '').trim()
  const pucks = [...body.querySelectorAll(`.puck[data-person="${id}"]`)].map(e => ({ where: e.closest('.rsans') ? 'SANS Avail' : e.closest('.rcol') ? ((e.closest('.rcol').querySelector('.rh') || {}).innerText || 'col').replace(/\s+/g, ' ') : '?', san: e.classList.contains('san'), title: e.getAttribute('title') || '', shown: vis(e), why: ((e.closest('.rpuck, .rsans-row') || { querySelector: () => null }).querySelector('.rwhy') || {}).textContent || '' }))
  const heads = [...body.querySelectorAll('.rh, .rh2')].map(h => h.innerText.replace(/\s+/g, ' ').trim())
  return { day, pucks, heads }
}, id)
/* the crew panel stepped to a weekday by its own ‹ › (opened by its tab on the phone) */
export async function crewPanelTo(p, W, dow) {
  if (W.isPhone) {
    const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
    if (!shown) await W.press(p, '#rosTab', 'crew-tab')
  }
  for (let i = 0; i < 8; i++) {
    const cur = ((await p.locator('.ros-body .er-dayname').first().textContent().catch(() => '')) || '').trim().toLowerCase()
    if (cur.startsWith(dow.toLowerCase().slice(0, 3))) return cur
    const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    const dir = order.indexOf(dow.toLowerCase().slice(0, 3)) > order.indexOf(cur.slice(0, 3)) ? 1 : -1
    await W.press(p, `.ros-body [data-crewstep="${dir}"]`, 'crewstep'); await sleep(300)
  }
  return 'not reached'
}
export async function crewPanelClose(p, W) {
  if (!W.isPhone) return
  const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
  if (shown) await W.press(p, '#rosTab', 'crew-tab-close')
}
/* the day's Available crew panel folded: its count line ("N all day · … · N SANS offering"), then unfolded again */
export async function availCount(p, W, di, tag = '') {
  const t = p.locator(`#eWeek section.day[data-day="${di}"] [data-avtog="${di}"]`).first()
  if (!(await t.count())) return { line: 'no Available crew panel', pic: '' }
  await t.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(200)
  await W.press(p, t, 'avtog')
  const line = ((await p.locator(`#eWeek section.day[data-day="${di}"] .sec-avail .ap-h`).first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ')
  const pic = await W.pic(p, `${tag}avail-${di}`)
  await W.press(p, p.locator(`#eWeek section.day[data-day="${di}"] [data-avtog="${di}"]`).first(), 'avtog-back')
  return { line, pic }
}

/* a new Ground Programme row (+ Item) with one man on it: tap the row's people box, then his puck in the crew list */
export async function groundRowWith(p, W, di, id) {
  const n0 = await p.evaluate(i => (window.DAYS[i].ground || []).length, di)
  await W.press(p, B(`[data-gradd="${di}"]`), 'gr-add')
  const ri = await p.evaluate(i => window.DAYS[i].ground.length - 1, di)
  await typeBox(p, W, `[data-bfld="gr:${di}.${ri}.prog"]`, 'W1 GROUND').catch(() => {})
  await W.press(p, B(`[data-fill="g:${di}.${ri}.+"]`), 'gr-arm')
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  await W.press(p, `#schedBoard .rpuck[data-person="${id}"]:visible`, 'crew-' + id)
  await sleep(400)
  const row = await p.evaluate(([i, r]) => { const x = window.DAYS[i].ground[r]; return x ? { prog: x.prog, who: x.who, more: x.more } : null }, [di, ri])
  return { n0, ri, armed, row }
}

/* the Leave War cell of a man on a date (frf-w1's lwCell) */
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
/* post a man out as SANS from a date: his cell → ⋯ → Post out → SANS → Post out (frf-w1 s1 step 4) */
export async function postOutSans(p, W, id, iso, tag) {
  const c = (await lwCell(p, W, id, iso)).cell
  await W.press(p, c, 'cell-' + iso)
  await W.press(p, '[data-testid="bid-more"]:visible', 'more')
  await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
  await W.press(p, '[data-testid="po-sans"]:visible', 'po-sans')
  const line = ((await p.locator('[data-testid="po-line"]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ')
  const pic = await W.pic(p, tag + '-postout-sheet')
  await W.press(p, '[data-testid="po-confirm"]:visible', 'po-confirm'); await sleep(1000)
  const after = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null, sanWas: q.sanWas || null } }, id)
  return { line, pic, after }
}
/* the Quals hand tick: the seat's view, ✎ Edit, his SANS cell, Done */
export async function qualsTick(p, W, id, tag) {
  await go(p, 'quals')
  const seat = await p.evaluate(id => window.PEOPLE[id].seat, id)
  await W.press(p, seat === 'FCP' ? '#qViewP' : '#qViewW', 'qview')
  if (await p.locator('#qEdit:visible').count()) await W.press(p, '#qEdit:visible', 'qedit')
  const cell = p.locator(`td[data-q="${id}|san"]`).first()
  await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  await W.press(p, cell, 'san-cell'); await sleep(400)
  const st = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null, sanWas: q.sanWas || null, sanTo: q.sanTo || null } }, id)
  const pic = await W.pic(p, tag + '-quals')
  if (await p.locator('#qSave:visible').count()) await W.press(p, '#qSave:visible', 'qdone')
  return { st, pic }
}
