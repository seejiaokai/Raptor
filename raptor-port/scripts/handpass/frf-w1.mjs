// Walker w1 — the fable-read-faults walk (22 Nov 26, brief docs/superpowers/briefs/2026-11-22-fable-read-faults-walk-brief.md).
// S1: a SANS posting keeps an earlier day's ALL AVAIL crowd (OIL F1).  S5: OIL leave on dates no Leave War period holds
// comes off his OIL at once (Leave War F1). Each scenario at two sizes, each in a fresh browser context.
// Run from raptor-port/:  W1_URL=http://localhost:4311/ ONLY=s1d|s1p|s5d|s5p node scripts/handpass/frf-w1.mjs
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const VERSION = 'frf-w1 v8'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const URL_ = process.env.W1_URL || 'http://localhost:4311/'
const ONLY = (process.env.ONLY || 's1d,s1p,s5d,s5p').split(',')
const BASE_OUT = path.join(ROOT, 'docs/img/handpass/2026-11-22-fable-read-faults/w1')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
console.log(VERSION, URL_, ONLY.join(','))

const SIZES = {
  d: { name: 'desktop', eng: chromium, launch: existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}, opts: { viewport: { width: 1536, height: 864 } } },
  p: { name: 'phone', eng: webkit, launch: {}, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
}
const results = []
const log = (...a) => console.log(...a)
const sleep = ms => new Promise(r => setTimeout(r, ms))

function mk(scn, sz) {
  const dir = BASE_OUT
  mkdirSync(dir, { recursive: true }); mkdirSync(path.join(dir, 'taps'), { recursive: true })
  let tapN = 0
  const errs = []
  const W = {
    scn, sz, dir, errs, isPhone: sz.name === 'phone',
    async pic(p, step) { const f = path.join(dir, `${scn}-${step}-${sz.name}.png`); await p.screenshot({ path: f }); return path.basename(f) },
    /* a press as a person makes it: a real tap on the phone (picture within ~100 ms, then settled), a click on the desktop */
    async press(p, loc, label = 'press') {
      const l = typeof loc === 'string' ? p.locator(loc).first() : loc
      await l.waitFor({ state: 'visible', timeout: 8000 })
      await l.scrollIntoViewIfNeeded().catch(() => {})
      if (W.isPhone) {
        await l.tap({ timeout: 5000 })
        const f = path.join(dir, 'taps', `${scn}-${p2(++tapN)}-${label}-now-phone.png`)
        await p.screenshot({ path: f }).catch(() => {})
      } else await l.click({ timeout: 5000 })
      await sleep(350)
    },
    rec(id, what, ok, note, pics) { results.push({ scn, size: sz.name, id, what, ok, note, pics }); log(`${ok === true ? 'PASS' : ok === false ? 'FAIL' : 'NOTE'} ${scn}/${sz.name} ${id} — ${what}${note ? ' :: ' + note : ''}${pics ? ' [' + pics + ']' : ''}`) },
  }
  return W
}
const p2 = n => String(n).padStart(2, '0')

async function world(sz, W) {
  const b = await sz.eng.launch(sz.launch)
  const ctx = await b.newContext(sz.opts)
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
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(700)
}
async function go(p, to) { await p.evaluate(t => window.go(t), to); await p.waitForFunction(t => window.CURPAGE === t, to); await sleep(600) }
const B = sel => `#schedBoard ${sel}:visible`
const hideToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.style.transition = 'none'; t.style.opacity = '0' } })

async function openBoard(p, W, di) {
  await go(p, 'editsched')
  const d = p.locator(`#eWeek [data-sbday="${di}"]`).first()
  await d.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(300)
  if (W.isPhone) { await d.tap(); await sleep(100); await p.screenshot({ path: path.join(W.dir, 'taps', `${W.scn}-board-open-now-phone.png`) }) }
  else await d.click()
  await p.waitForSelector('#schedBoard'); await sleep(700)
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
async function signAll(p, W) {
  const roles = ['cur', 'sked', 'plan', 'appr'], nth = [0, 0, 1, 2]
  for (let i = 0; i < 4; i++) {
    const sel = p.locator(`#schedBoard .sb-sign select[data-sign="${roles[i]}"]:visible`).first()
    const v = await sel.locator('option').evaluateAll((os, n) => os.map(o => o.value).filter(Boolean)[n], nth[i])
    await sel.selectOption(v); await sleep(300)
    /* a sign-off press may open the day's OIL list (D2294) — close by Later if it does */
    const later = p.locator('[data-testid="win-oilday"] button', { hasText: 'Later' })
    if (await later.count() && await later.first().isVisible()) { await later.first().click(); await sleep(300) }
  }
}
async function publishBtn(p, di) {
  for (const s of [`[data-beak="${di}"]`, `[data-alpub="${di}"]`]) { const l = p.locator(B(s)).first(); if (await l.count()) return l }
  return null
}
async function lwCell(p, W, id, iso) {
  await go(p, 'leavewar'); await sleep(900)
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][Number(iso.slice(5, 7)) - 1]
  const m = p.locator(`[data-testid="month-${mon}"]:visible`).first()
  if (await m.count()) { await W.press(p, m, 'month-' + mon); await sleep(900) }
  const c = p.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  if (!(await c.count())) return { cell: null, text: 'NO CELL' }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
  return { cell: c, text: ((await c.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim() }
}
/* what the screen draws for the day: the board's sign block when the board is open, else the Edit Schedule day card.
   pend = the number on a drawn "N pending" chip (0 when none is drawn); signed = the "SIGNED <ver> CUR CK …" line's words;
   notSigned = a drawn "Not yet signed" marker. approved / missing from the bridge, for the log only. */
const pendingOf = (p, di) => p.evaluate(i => {
  const vis = e => e.getBoundingClientRect().width > 0
  const board = document.querySelector('#schedBoard')
  let root = board
  if (!board) {
    /* the Edit Schedule week: the smallest drawn block holding this day's date words and its sign-off */
    const dd = window.DAYS[i] && (window.DAYS[i].date || '')
    const wd = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]
    const cands = [...document.querySelectorAll('#eWeek *')].filter(e => vis(e) && e.getBoundingClientRect().width < 900 && (e.innerText || '').includes(wd) && /SIGN-OFF/i.test(e.innerText || '') && !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].filter(x => x !== wd).some(x => (e.innerText || '').includes(x + '\n') || (e.innerText || '').startsWith(x)))
    cands.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)
    root = cands[0] || document.body
  }
  /* the smallest drawn element whose own words start "N pending" (a chip may carry a ▾ child) */
  const all = [...root.querySelectorAll('*')].filter(e => vis(e) && /^\d+\s*pending/i.test((e.innerText || '').trim()) && (e.innerText || '').trim().length < 20)
  const pendEl = all[all.length - 1]
  const pend = pendEl ? parseInt(pendEl.innerText, 10) : 0
  const txt = (root.innerText || '').replace(/\s+/g, ' ')
  const k = txt.toUpperCase().indexOf('SIGNED ')
  /* the "SIGNED <ver> …four names…" line, up to the next SIGN-OFF block: desktop with roles, phone names only (D102) */
  const k2 = k >= 0 ? txt.toUpperCase().indexOf('SIGN-OFF', k) : -1
  const sm = k >= 0 ? txt.slice(k, k2 > k ? k2 : k + 90).trim() : ''
  return { pend, pendWords: pendEl ? pendEl.innerText.trim() : '', notSigned: /Not yet signed/i.test(txt), signed: sm, approved: window.dayApproved ? window.dayApproved(i) : 'n/a' }
}, di)

/* =================== S1 =================== */
async function s1(szKey) {
  const sz = SIZES[szKey], W = mk('s1', sz)
  const { b, p } = await world(sz, W)
  const SAT = 5, SAT_ISO = '2026-07-18', PO_ISO = '2026-07-20', MAN = 'rocky'
  try {
    await signIn(p, 'ad', 'a')
    const man = await p.evaluate(id => ({ cs: window.PEOPLE[id].cs, seat: window.PEOPLE[id].seat, san: !!window.PEOPLE[id].san }), MAN)
    W.rec('premise', 'the man of the crowd', null, `id ${MAN} callsign ${man.cs} seat ${man.seat} SANS ${man.san}; no callsign "Rocky" on the roster`)
    /* 1. the Saturday's Common Programme: + Item, its name and times, ALL AVAIL on it */
    await openBoard(p, W, SAT)
    await W.press(p, B(`[data-padd="${SAT}"]`), 'add-item')
    const ri = await p.evaluate(i => window.DAYS[i].allhands.length - 1, SAT)
    await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.prog"]`, 'SQN EVENT')
    await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.str"]`, '0800')
    await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.end"]`, '1500')
    await W.press(p, B(`[data-fill="a:${SAT}.${ri}.+"]`), 'arm-row')
    const armed = await p.evaluate(() => window.ARM && window.ARM.key)
    await W.press(p, `#schedBoard [data-person="allavail"]:visible`, 'allavail')
    await sleep(500)
    const row = await p.evaluate(i => { const a = window.DAYS[i].allhands; const r = a[a.length - 1]; return { prog: r.prog, str: r.str, end: r.end, who: r.who } }, SAT)
    const okRow = row.str.replace(':', '') === '0800' && row.end.replace(':', '') === '1500' && JSON.stringify(row.who).includes('allavail')
    W.rec('s1-01', 'Common Programme row SQN EVENT 08:00–15:00 with ALL AVAIL, made by + Item, typing and a tap (armed ' + armed + ')', okRow, JSON.stringify(row), await W.pic(p, '01-row'))
    /* 2. sign the four and publish */
    await signAll(p, W)
    const pub = await publishBtn(p, SAT)
    await W.press(p, pub, 'publish'); await sleep(900)
    const ok2 = await p.evaluate(i => window.dayApproved(i), SAT)
    await hideToast(p)
    const pe2 = await pendingOf(p, SAT)
    W.rec('s1-02', 'Saturday signed and published (Publish day pressed)', ok2 && pe2.pend === 0 && /Bolt/.test(pe2.signed), JSON.stringify(pe2), await W.pic(p, '02-published'))
    /* the count chip on the published day, opened */
    const chipTxt = async () => ((await p.locator(B(`.oilcount[data-oilday="${SAT}"]`)).first().innerText().catch(() => '')) || '').trim()
    const c0 = await chipTxt()
    await closeBoard(p, W)
    /* 3. the Leave War: his FO on 18 Jul */
    const lw1 = await lwCell(p, W, MAN, SAT_ISO)
    W.rec('s1-03', `Leave War: ${man.cs}'s 18 Jul reads FO after the publish`, /^FO/.test(lw1.text), `cell "${lw1.text}", chip before ${c0}`, await W.pic(p, '03-lw-fo'))
    /* 4. post him out as SANS on 20 Jul: tap his 20 Jul → ⋯ → Post out → SANS → Post out */
    const c20 = (await lwCell(p, W, MAN, PO_ISO)).cell
    await W.press(p, c20, 'cell-20jul')
    await W.pic(p, '04a-bidsheet')
    await W.press(p, '[data-testid="bid-more"]:visible', 'more')
    await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
    await W.press(p, '[data-testid="po-sans"]:visible', 'po-sans')
    const line = ((await p.locator('[data-testid="po-line"]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ')
    const posheet = await W.pic(p, '04b-postout-sheet')
    await W.press(p, '[data-testid="po-confirm"]:visible', 'po-confirm'); await sleep(1000)
    const after = await p.evaluate(id => ({ san: !!window.PEOPLE[id].san, sanBy: window.PEOPLE[id].sanBy || '' }), MAN)
    W.rec('s1-04', `posted out as SANS from Mon 20 Jul through the bid sheet's ⋯ → Post out → SANS`, after.san === true, `line "${line}" · ${JSON.stringify(after)}`, posheet)
    const lw2 = await lwCell(p, W, MAN, SAT_ISO)
    const nameSans = await p.evaluate(id => { const r = document.querySelector(`[data-testid="row-${id}"]`) || document.querySelector(`[data-testid="name-${id}"]`); return r ? r.outerHTML.slice(0, 300) : 'no row' }, MAN)
    W.rec('s1-05', `after the posting: his 18 Jul FO still on the Leave War`, /^FO/.test(lw2.text), `cell "${lw2.text}"`, await W.pic(p, '05-lw-after-po'))
    W.rec('s1-05b', 'his row after the posting (purple SANS line from 20 Jul)', null, nameSans.replace(/\s+/g, ' ').slice(0, 220))
    /* the bell: what the admin is told of the posting; closed by Escape */
    const bell = p.locator('button.bellbtn:visible').first()
    if (await bell.count()) {
      await W.press(p, bell, 'bell'); await sleep(500)
      const bl = await txtOf(p, '[data-testid="bell-list"]')
      W.rec('s1-05c', 'the bell after the posting', null, bl.slice(0, 260), await W.pic(p, '05c-bell'))
      await p.keyboard.press('Escape'); await sleep(400)
      const open = await p.locator('[data-testid="bell-list"]:visible').count()
      if (open) { await p.mouse.click(5, 400); await sleep(400) }
      W.rec('s1-05d', 'the bell list closes (Escape, else a tap outside)', (await p.locator('[data-testid="bell-list"]:visible').count()) === 0, open ? 'Escape left it open; a tap outside closed it' : 'Escape closed it', await W.pic(p, '05d-bell-closed'))
    }
    /* 5. the published Saturday: nothing pending, four sign-offs */
    await go(p, 'editsched'); await sleep(500)
    const head = await p.evaluate(i => { const d = [...document.querySelectorAll(`#eWeek [data-pendlist="${i}"]`)].filter(e => e.getBoundingClientRect().width > 0); return d.map(e => e.innerText.trim()).join('|') }, SAT)
    await p.locator(`#eWeek [data-sbday="${SAT}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
    const pe5 = await pendingOf(p, SAT)
    W.rec('s1-06', 'Edit Schedule: the published Saturday reads nothing pending, its four sign-offs kept', pe5.pend === 0 && !pe5.notSigned && /Bolt/.test(pe5.signed) && !head, `day head pending chip "${head}" · ${JSON.stringify(pe5)}`, await W.pic(p, '06-editsched-sat'))
    await go(p, 'viewsched').catch(() => {}); await sleep(500)
    await p.locator(`#vWeek .day`).nth(SAT).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {})
    W.rec('s1-06b', 'View-only Sched on the Saturday', null, '', await W.pic(p, '06b-viewsched-sat'))
    /* 6. a real change on the published day: retime the row to end 16:00, sign, publish AL */
    await openBoard(p, W, SAT)
    const c1 = await chipTxt()
    await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.end"]`, '1600')
    const pe6 = await pendingOf(p, SAT)
    W.rec('s1-07', 'retimed the row to 08:00–16:00 on the published Saturday: 1 pending, sign-offs fall', pe6.pend >= 1 && pe6.notSigned, `${JSON.stringify(pe6)} chip "${c1}"`, await W.pic(p, '07-retimed'))
    await signAll(p, W)
    const pub2 = await publishBtn(p, SAT)
    const pubLabel = pub2 ? (await pub2.innerText()).trim() : 'none'
    await W.press(p, pub2, 'publish-al'); await sleep(900); await hideToast(p)
    const pe7 = await pendingOf(p, SAT)
    const ver = await p.evaluate(i => window.verLabel && window.dayCurVer ? window.verLabel(window.dayCurVer(i)) : '', SAT)
    W.rec('s1-08', `amendment published (${pubLabel})`, pe7.pend === 0 && !pe7.notSigned && /AL1/.test(pe7.signed) && /Bolt/.test(pe7.signed), `${JSON.stringify(pe7)} version ${ver}`, await W.pic(p, '08-al-published'))
    /* the ALL AVAIL count chip, and its window: does the crowd include him? */
    const c2 = await chipTxt()
    const chip = p.locator(B(`.oilcount[data-oilday="${SAT}"]`)).first()
    let inWin = 'chip not found'
    if (await chip.count()) {
      await W.press(p, chip, 'count-chip'); await sleep(600)
      inWin = await p.evaluate(id => { const w = document.querySelector('.availwin'); if (!w) return 'no window'; const ids = [...w.querySelectorAll('.rpuck[data-awp]')].map(e => e.dataset.awp); return { n: ids.length, has: ids.includes(id) } }, MAN)
    }
    W.rec('s1-09', `ALL AVAIL count chip after AL ("${c2}") — its window lists ${man.cs}`, inWin && inWin.has === true, JSON.stringify(inWin), await W.pic(p, '09-availwin'))
    /* close the window by Escape (plain-user round), then the board */
    await p.keyboard.press('Escape'); await sleep(400)
    const winGone = await p.evaluate(() => { const w = document.querySelector('.availwin'); return !w || w.getBoundingClientRect().width === 0 })
    W.rec('s1-09b', 'ALL AVAIL window closes on Escape', winGone, '', await W.pic(p, '09b-availwin-esc'))
    await closeBoard(p, W)
    const lw3 = await lwCell(p, W, MAN, SAT_ISO)
    W.rec('s1-10', `after AL: his 18 Jul FO still on the Leave War`, /^FO/.test(lw3.text), `cell "${lw3.text}"`, await W.pic(p, '10-lw-after-al'))
  } catch (e) {
    W.rec('s1-ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}

/* =================== S5 =================== */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
async function lwTab(p, W, tid) { await go(p, 'leavewar'); await sleep(700); const t = p.locator(`[data-testid="${tid}"]:visible`).first(); if (await t.count()) await W.press(p, t, tid); await sleep(700) }
const txtOf = async (p, sel) => ((await p.locator(sel).first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
/* his OIL in three admin places: the OIL tracker's balance cell, the Balances page, his person window (opened from his
   name on the grid, closed by its ✕) */
async function oilFigs(p, W, id, tag) {
  await lwTab(p, W, 'oil-tracker')
  const cellLoc = p.locator(`[data-testid="oil-bal-${id}"]`).first()
  if (await cellLoc.count()) await cellLoc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  const tracker = await txtOf(p, `[data-testid="oil-bal-${id}"]`)
  const pT = await W.pic(p, tag + '-tracker')
  const ox = p.locator('[data-testid="oil-close"]:visible').first()
  if (await ox.count()) { await W.press(p, ox, 'oil-close'); await sleep(400) }
  await lwTab(p, W, 'lw-tab-balances')
  const bl = p.locator(`[data-testid="bal-oil-${id}"]`).first()
  if (await bl.count()) await bl.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  const balances = await txtOf(p, `[data-testid="bal-oil-${id}"]`)
  const pB = await W.pic(p, tag + '-balances')
  await lwTab(p, W, 'lw-tab-grid')
  const nm = p.locator(`[data-testid="person-${id}"]`).first()
  let pw = 'no name button'
  if (await nm.count()) {
    await nm.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
    await W.press(p, nm, 'person-' + id); await sleep(500)
    pw = await txtOf(p, '[data-testid="pw-tile-OIL"]')
  }
  const pP = await W.pic(p, tag + '-personwin')
  const x = p.locator('[data-testid="pw-close"]:visible').first()
  if (await x.count()) await W.press(p, x, 'pw-close')
  const num = s => { const m = String(s).match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : NaN }
  return { tracker, balances, pw, n: [num(tracker), num(balances), num(pw)], pics: [pT, pB, pP].join(', ') }
}
async function toInputsMonth(p, W, year, mon0) {
  await go(p, 'inputs'); await sleep(500)
  if (!(await p.locator('#inpCal').count())) { const c = p.locator('#inCalBtn').first(); if (await c.count()) await W.press(p, c, 'cal-view') }
  for (let i = 0; i < 40; i++) {
    const [name, y] = (await p.locator('#inpCal .ic-mon').first().innerText()).trim().toLowerCase().split(/\s+/)
    const d = year * 12 + mon0 - (+y * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return `${name} ${y}`
    await p.locator(d > 0 ? '#icNext' : '#icPrev').first().click(); await sleep(320)
  }
  return 'not reached'
}
async function openInputsDay(p, W, iso) {
  const [y, m] = iso.split('-').map(Number)
  const reached = await toInputsMonth(p, W, y, m - 1)
  await sleep(400)
  const day = p.locator(`#inpCal [data-icday="${iso}"]`).first()
  if (W.isPhone) { await day.tap({ position: { x: 8, y: 8 } }); await p.screenshot({ path: path.join(W.dir, 'taps', `${W.scn}-day-${iso}-now-phone.png`) }) }
  else await day.click({ position: { x: 8, y: 8 } })
  await sleep(500)
  return reached
}

async function s5(szKey) {
  const sz = SIZES[szKey], W = mk('s5', sz)
  const { b, p } = await world(sz, W)
  const MAN = 'bane'
  try {
    await signIn(p, 'ad', 'a')
    await go(p, 'leavewar'); await sleep(900)
    const periods = await p.locator('[data-testid="war-picker"] option').allInnerTexts().catch(() => [])
    W.rec('premise', 'the Leave War periods on the View picker', null, periods.join(' | '), await W.pic(p, '00-periods'))
    /* the first year from next year that no period names */
    let Y = 2027
    while (periods.some(t => t.includes(String(Y)) || t.includes(' ' + String(Y).slice(2)))) Y++
    const ISO = `${Y}-02-03`                                   // a Wednesday
    let f0 = await oilFigs(p, W, MAN, '01-before')
    if (!(f0.n[0] >= 1)) {
      /* he has none: credit him 3 in the OIL tracker — tap his name, amount 3, a reason, Save */
      W.rec('s5-00', `Ranger starts with OIL ${f0.tracker}: crediting him 3 through the OIL tracker`, null, JSON.stringify({ tracker: f0.tracker, balances: f0.balances, pw: f0.pw }), f0.pics)
      await lwTab(p, W, 'oil-tracker')
      const nm = p.locator(`[data-testid="oil-name-${MAN}"]`).first()
      await nm.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
      await W.press(p, nm, 'oil-name')
      await p.locator('[data-testid="oil-amt"]:visible').first().fill('3')
      await p.locator('[data-testid="oil-reason"]:visible').first().fill('walk credit')
      await W.pic(p, '00b-credit-panel')
      await W.press(p, '[data-testid="oil-credit-save"]:visible', 'credit-save'); await sleep(600)
      W.rec('s5-00b', 'credit saved', null, await txtOf(p, `[data-testid="oil-bal-${MAN}"]`), await W.pic(p, '00c-credited'))
      const ox = p.locator('[data-testid="oil-close"]:visible').first(); if (await ox.count()) await W.press(p, ox, 'oil-close')
      f0 = await oilFigs(p, W, MAN, '01-before')
    }
    W.rec('s5-01', `Ranger's OIL before (tracker · Balances · person window); filing on ${ISO}, year ${Y} in no period`, f0.n.every(x => x === f0.n[0]) && f0.n[0] >= 1, JSON.stringify({ tracker: f0.tracker, balances: f0.balances, pw: f0.pw }), f0.pics)
    const start = f0.n[0]
    /* what the Inputs month shows: the number of "Ranger · OIL" bars in February of that year (the page is left there) */
    const filed = async () => {
      await toInputsMonth(p, W, Y, 1); await sleep(300)
      return p.evaluate(() => [...document.querySelectorAll('#inpCal [data-testid^="ib-bar-"]')].filter(e => e.getBoundingClientRect().width > 0 && /Ranger/.test(e.innerText) && /OIL/.test(e.innerText)).length)
    }
    /* file OIL for him on the Inputs page: open the day → + Input → type OIL, person Ranger → Add */
    const reached = await openInputsDay(p, W, ISO)
    await W.pic(p, '02a-day')
    await W.press(p, '#icPopAdd:visible', 'plus-input')
    await p.waitForSelector('#inpEditPop', { timeout: 6000 })
    const types = await p.locator('#inpEditType option').evaluateAll(os => os.map(o => o.value + '=' + o.textContent.trim()))
    const oilOpt = types.find(t => t.startsWith('OIL='))
    await p.selectOption('#inpEditType', 'OIL'); await sleep(250)
    if (await p.locator('#inpEditPerson').count()) await p.selectOption('#inpEditPerson', MAN)
    await sleep(250)
    const draft = await W.pic(p, '02b-window')
    await W.press(p, '#inpEditSave:visible', 'add'); await sleep(800)
    /* leave asks for its document (D1150): "No document" files it now */
    const nodoc = p.getByRole('button', { name: 'No document' })
    if (await nodoc.count() && await nodoc.first().isVisible()) { await W.pic(p, '02b2-doc-ask'); await W.press(p, nodoc.first(), 'no-document'); await sleep(800) }
    const after = await filed()
    const winOpen = await p.locator('#inpEditPop:visible').count()
    W.rec('s5-02', `OIL filed for Ranger on ${ISO} through + Input (month reached "${reached}", option ${oilOpt || 'NONE'})`, after === 1, `window still open ${winOpen} · Ranger OIL bars on the month ${after}`, draft + ', ' + await W.pic(p, '02c-filed'))
    if (winOpen) { await W.pic(p, '02d-window-left-open'); const x = p.locator('#inpEditClose:visible, #inpEditCancel:visible').first(); if (await x.count()) await W.press(p, x, 'close-win') }
    const f1 = await oilFigs(p, W, MAN, '03-filed')
    W.rec('s5-03', `no reload: Ranger's OIL drops by 1 in all three places (${start} → ${start - 1})`, f1.n.every(x => x === start - 1), JSON.stringify({ tracker: f1.tracker, balances: f1.balances, pw: f1.pw }), f1.pics)
    /* delete it from its own window: the day's card → Delete */
    await openInputsDay(p, W, ISO)
    const card = p.locator('[data-testid="win-inputsday"] .icard').filter({ hasText: 'Ranger' }).first()
    let delOk = false, how = ''
    if (await card.count()) { await W.press(p, card, 'card'); how = 'card' }
    else { const bar = p.locator(`#inpCal [data-icday="${ISO}"] .ic-bar, #inpCal .ic-bar`).first(); if (await bar.count()) { await W.press(p, bar, 'bar'); how = 'bar' } }
    await sleep(500)
    if (await p.locator('#inpEditDel:visible').count()) { await W.pic(p, '04a-open-input'); await W.press(p, '#inpEditDel:visible', 'delete'); await sleep(700); delOk = true }
    const left = await filed()
    W.rec('s5-04', `deleted the OIL input from its own window (opened by its ${how || 'NOTHING'})`, delOk && left === 0, `left ${left}`, await W.pic(p, '04b-deleted'))
    const f2 = await oilFigs(p, W, MAN, '05-deleted')
    W.rec('s5-05', `after delete: Ranger's OIL back to ${start}`, f2.n.every(x => x === start), JSON.stringify({ tracker: f2.tracker, balances: f2.balances, pw: f2.pw }), f2.pics)
    /* Undo (brings the input back) → drops; Redo (deletes again) → back */
    await W.press(p, '#undoBtn:visible', 'undo'); await sleep(600)
    const u = await filed()
    const f3 = await oilFigs(p, W, MAN, '06-undo')
    W.rec('s5-06', `Undo of the delete: the input back (${u}), OIL ${start - 1} again`, u === 1 && f3.n.every(x => x === start - 1), JSON.stringify({ tracker: f3.tracker, balances: f3.balances, pw: f3.pw }), f3.pics)
    await W.press(p, '#redoBtn:visible', 'redo'); await sleep(600)
    const r = await filed()
    const f4 = await oilFigs(p, W, MAN, '07-redo')
    W.rec('s5-07', `Redo of the delete: the input gone (${r}), OIL ${start} again`, r === 0 && f4.n.every(x => x === start), JSON.stringify({ tracker: f4.tracker, balances: f4.balances, pw: f4.pw }), f4.pics)
    /* leave the input filed (Undo once more) and look as the member */
    await W.press(p, '#undoBtn:visible', 'undo2'); await sleep(600)
    await go(p, 'leavewar'); await sleep(500)
    const adminMy = await txtOf(p, '[data-testid="my-leave"]')
    /* sign out (the top bar's Logout, or the side menu on a phone) and in as us / us */
    if (await p.locator('#logout:visible').count()) await W.press(p, '#logout:visible', 'logout')
    else { await W.press(p, '#burger:visible', 'burger'); await W.press(p, '#drawerLogout:visible', 'drawer-logout') }
    await sleep(600)
    const conf = p.getByRole('button', { name: /^(Logout|Sign out|Yes|Confirm|OK)/ })
    if (!(await p.locator('#luser:visible').count()) && await conf.count()) { await conf.first().click(); await sleep(500) }
    await signIn(p, 'us', 'us')
    await go(p, 'leavewar'); await sleep(900)
    const my = await txtOf(p, '[data-testid="my-leave-oil"]')
    const myPic = await W.pic(p, '08-member-myleave')
    const still = await filed()
    await go(p, 'leavewar'); await sleep(800)
    const myN = Number((my.match(/-?\d+(\.\d+)?/) || [NaN])[0])
    W.rec('s5-08', `signed in as Ranger (us/us): My leave's OIL reads ${start - 1} (his ${Y} OIL still filed: ${still})`, still === 1 && myN === start - 1, `My leave "${my}"`, myPic)
    const ml = p.locator('[data-testid="my-leave"]:visible').first()
    if (await ml.count()) { await W.press(p, ml, 'my-leave'); await sleep(500); W.rec('s5-09', 'Ranger\'s own person window from My leave', null, await txtOf(p, '[data-testid="pw-tile-OIL"]'), await W.pic(p, '09-member-personwin')); await p.keyboard.press('Escape'); await sleep(400); W.rec('s5-09b', 'his person window after Escape', (await p.locator('[data-testid="pw-close"]:visible').count()) === 0, '', await W.pic(p, '09b-member-esc')) }
    await lwTab(p, W, 'oil-tracker')
    const mt = await txtOf(p, `[data-testid="oil-bal-${MAN}"]`)
    W.rec('s5-10', 'as Ranger: the OIL tracker\'s figure for him', Number((mt.match(/-?\d+(\.\d+)?/) || [NaN])[0]) === start - 1, `"${mt}"`, await W.pic(p, '10-member-tracker'))
  } catch (e) {
    W.rec('s5-ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}

for (const k of ONLY) {
  if (k === 's1d') await s1('d')
  if (k === 's1p') await s1('p')
  if (k === 's5d') await s5('d')
  if (k === 's5p') await s5('p')
}
writeFileSync(path.join(BASE_OUT, `results-${ONLY.join('_')}.json`), JSON.stringify(results, null, 1))
log('done')
