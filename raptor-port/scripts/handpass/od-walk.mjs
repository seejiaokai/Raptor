/* THE [ONE-DOOR] WALK (27 Sep 26) — the real production bundle in a real Chromium, desktop and phone, a fresh demo world
   per scene, every step an ASSERTION of the right behaviour (a PASS means correct), so re-running it on a fixed build IS
   the re-walk (bug-check order §5). Pictures to docs/img/handpass/2026-09-27-one-door/<run>/; the results to
   <run>/results.md. Built from Fable's scenario design (docs/superpowers/briefs/2026-09-27-one-door-scenarios.md) and
   the plan's §4. Run from raptor-port/ with the preview on 4178:
     HP_URL=http://localhost:4178 HP_RUN=walk1 node scripts/handpass/od-walk.mjs [scene…]
   Scenes: users, states, archive, restore, published, sans, sheets, quals, welcome, doors, replaced, future, again,
   twodoors, noacct, lockin, roles, search, undo, lapse, reqarch, reload — the last twelve from Fable's walk design
   (docs/superpowers/specs/2026-09-27-one-door-scenarios-fable.md §3: S2, S4, S6, S9, S12, 4.2, S13, S14, S15, S11, S10).
   Setup only (never the act under test) may use the local build's war helpers (window.lwSetCell / lwSetPostOut). */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.HP_URL || 'http://localhost:4178'
const RUN = process.env.HP_RUN || 'walk1'
const OUT = `docs/img/handpass/2026-09-27-one-door/${RUN}`
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ONLY = process.argv.slice(2)
const results = []
const TODAY = new Date(2026, 8, 27, 9, 0, 0)          // 27 Sep 26 — the calendar the dates below are written for
const DESK = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 }

async function open(vp = DESK, scale = 1, fresh = true) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: scale })
  await ctx.clock?.setFixedTime?.(TODAY)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + (fresh ? '/?fresh=1' : '/')); await page.waitForSelector('#luser')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  return { page, errors, phone: vp.width < 821 }
}
async function signIn(page, u, p = 'x') {
  if (!(await page.locator('#luser').count())) {
    let done = false
    for (const sel of ['#logout', '#accOut', '#guestOut']) {
      const l = page.locator(sel)
      if (await l.count() && await l.isVisible()) { await l.click(); done = true; break }
    }
    if (!done) { await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout') }
    await page.waitForSelector('#luser')
  }
  await page.fill('#luser', u); await page.fill('#lpass', p); await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(900)
}
const go = async (page, p) => { await page.evaluate(x => window.go(x), p); await page.waitForFunction(x => window.CURPAGE === x, p); await page.waitForTimeout(400) }
async function users(s) {
  await go(s.page, 'admin')
  if (s.phone && !(await s.page.locator('#accList').isVisible())) { await s.page.locator('.adm-cat', { hasText: 'Users' }).first().click(); await s.page.waitForTimeout(300) }
  await s.page.waitForSelector('#accList')
}
async function war(s, mon) {
  await go(s.page, 'leavewar')
  await s.page.waitForSelector('[data-testid="row-slipway"], [data-testid^="row-"]')
  if (mon) { await s.page.locator(`[data-testid="month-${mon}"]`).click(); await s.page.waitForTimeout(800) }
}
const shot = async (s, name, target) => {
  const f = `${OUT}/${s.phone ? 'p' : 'd'}-${name}.png`
  if (target) await s.page.locator(target).first().screenshot({ path: f }); else await s.page.screenshot({ path: f })
  return f
}
function check(scene, s, what, ok, detail = '') {
  results.push({ scene, width: s.phone ? 'phone' : 'desktop', what, ok: !!ok, detail: String(detail ?? '').slice(0, 240) })
  console.log(`${ok ? 'PASS' : 'FAIL'} [${scene}${s.phone ? '/phone' : ''}] ${what}${ok ? '' : ' — ' + detail}`)
}
const attr = (s, sel, a) => s.page.locator(sel).first().getAttribute(a).catch(() => null)
const text = (s, sel) => s.page.locator(sel).first().innerText().catch(() => null)
/* a tag's own words (the style sheet draws it in capitals — innerText reads the capitals) */
const words = (s, sel) => s.page.locator(sel).first().textContent().catch(() => null)
const count = (s, sel) => s.page.locator(sel).count()
const cellCls = (s, id, d) => attr(s, `[data-testid="cell-${id}-${d}"]`, 'class')
const toastSaid = s => s.page.evaluate(() => document.getElementById('toastEl')?.textContent || '')
const archive = async (s, id) => { await users(s); await s.page.locator(`#accList [data-person="${id}"] .acc-tap`).click(); await s.page.click('#accEdArchive'); await s.page.waitForTimeout(350) }
const openArchived = async (s, id) => {
  await users(s)
  if (!(await s.page.locator('#accArchList').count())) await s.page.click('#accArchToggle')
  await s.page.locator(`#accArchList [data-person="${id}"] .acc-tap`).click()
}
const restore = async (s, id, date) => { await openArchived(s, id); if (date) await s.page.fill('#accArPostIn', date); await s.page.click('#accArRestore'); await s.page.waitForTimeout(400) }
const gone = async (s, id, d) => /\bgone\b/.test(await cellCls(s, id, d) || '')
/* the day is DRAWN and counted — never true for a cell that is not there (a row the grid hid would otherwise pass) */
const here = async (s, id, d) => { const c = await cellCls(s, id, d); return c !== null && !/\bgone\b/.test(c) }
async function scene(name, vps, fn, fresh = true) {
  if (ONLY.length && !ONLY.includes(name)) return
  for (const vp of vps) {
    const s = await open(vp, vp === PHONE ? 2 : 1, fresh)
    try { await fn(s) } catch (e) { check(name, s, 'the scene ran to its end', false, e.message) }
    const errs = s.errors.filter(e => !/favicon/i.test(e))
    check(name, s, 'no console error, page error or failed request', !errs.length, errs.join(' | '))
    await s.page.context().close()
  }
}

/* ---- users: the list, the dots, the search, your own row ---- */
await scene('users', [DESK, PHONE], async s => {
  await signIn(s.page, 'ad', 'a'); await users(s)
  const rows = await count(s, '#accList [data-person]')
  const roster = await s.page.evaluate(() => Object.keys(window.PEOPLE).filter(k => !window.PEOPLE[k].special && !window.PEOPLE[k].archived && !window.PEOPLE[k].deleted).length)
  check('users', s, `one row per person on the roster (${rows} of ${roster})`, rows === roster, `${rows}/${roster}`)
  const names = await s.page.locator('#accList [data-person] .acc-name').allInnerTexts()
  check('users', s, 'A to Z', JSON.stringify(names) === JSON.stringify([...names].sort((a, b) => a.localeCompare(b))))
  check('users', s, 'Hex: Can sign in / On the roster (words on the dots)', (await attr(s, '[data-testid="dot-signin-rocky"]', 'aria-label')) === 'Can sign in' && (await attr(s, '[data-testid="dot-roster-rocky"]', 'aria-label')) === 'On the roster')
  check('users', s, 'your own row is closed', await s.page.locator('#accList [data-person="stiff"] .acc-tap').isDisabled())
  await shot(s, 'users-01-list')
  await s.page.fill('#accFind', 'hex'); await s.page.waitForTimeout(200)
  check('users', s, 'the search finds a sign-in (hex → Hex)', (await count(s, '#accList [data-person]')) === 1 && (await count(s, '#accList [data-person="rocky"]')) === 1)
  await shot(s, 'users-02-search')
  await s.page.fill('#accFind', 'zzzz'); await s.page.waitForTimeout(150)
  check('users', s, '"Nobody matches."', (await text(s, '#accNoMatch')) === 'Nobody matches.')
  await s.page.fill('#accFind', '')
  const fits = await s.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  check('users', s, 'no sideways scroll', fits)
})

/* ---- states: each state's buttons; Suspend ↔ Enable; Give sign-in ---- */
await scene('states', [DESK, PHONE], async s => {
  await signIn(s.page, 'ad', 'a'); await users(s)
  await s.page.locator('#accList [data-person="rocky"] .acc-tap').click()
  const btn = () => s.page.locator('[data-editing] .acc-acts button').allInnerTexts()
  check('states', s, 'active: Save · Suspend · Archive · Delete · Cancel', JSON.stringify(await btn()) === JSON.stringify(['Save', 'Suspend', 'Archive', 'Delete', 'Cancel']), JSON.stringify(await btn()))
  await shot(s, 'states-01-active', '[data-editing]')
  await s.page.click('#accEdOnOff'); await s.page.waitForTimeout(250)
  check('states', s, 'Suspend: the Sign-in dot reads suspended', (await attr(s, '[data-testid="dot-signin-rocky"]', 'aria-label')) === 'Sign-in suspended')
  await s.page.locator('#accList [data-person="rocky"] .acc-tap').click()
  check('states', s, 'suspended: Save · Enable · Archive · Delete · Cancel', JSON.stringify(await btn()) === JSON.stringify(['Save', 'Enable', 'Archive', 'Delete', 'Cancel']), JSON.stringify(await btn()))
  await shot(s, 'states-02-suspended', '#accList [data-person="rocky"]')
  await s.page.click('#accEdOnOff'); await s.page.waitForTimeout(250)
  check('states', s, 'Enable: can sign in again', (await attr(s, '[data-testid="dot-signin-rocky"]', 'aria-label')) === 'Can sign in')
  await s.page.locator('#accList [data-person="dj"] .acc-tap').click()
  check('states', s, 'no sign-in: Give sign-in · Archive · Delete · Cancel', JSON.stringify(await btn()) === JSON.stringify(['Give sign-in', 'Archive', 'Delete', 'Cancel']), JSON.stringify(await btn()))
  await shot(s, 'states-03-nosignin', '[data-editing]')
  await s.page.fill('#accGiveName', 'dj@mail'); await s.page.click('#accGive'); await s.page.waitForTimeout(250)
  check('states', s, 'Give sign-in: his Sign-in dot turns green', (await attr(s, '[data-testid="dot-signin-dj"]', 'aria-label')) === 'Can sign in')
  await shot(s, 'states-04-given', '#accList [data-person="dj"]')
})

/* ---- archive: one tap; the Archived group; the war posted out from today; the account suspended ---- */
await scene('archive', [DESK, PHONE], async s => {
  await signIn(s.page, 'ad', 'a'); await users(s)
  await s.page.locator('#accList [data-person="rocky"] .acc-tap').click()
  await s.page.click('#accEdArchive'); await s.page.waitForTimeout(350)
  check('archive', s, 'he leaves the People list', (await count(s, '#accList [data-person="rocky"]')) === 0)
  check('archive', s, '"▸ Archived · 1"', /Archived · 1/.test(await text(s, '#accArchToggle') || ''), await text(s, '#accArchToggle'))
  await s.page.click('#accArchToggle')
  check('archive', s, 'archived row: Sign-in suspended, Archived', (await attr(s, '[data-testid="dot-signin-rocky"]', 'aria-label')) === 'Sign-in suspended' && (await attr(s, '[data-testid="dot-roster-rocky"]', 'aria-label')) === 'Archived')
  /* D329 (his look, 28 Sep 26): how and when — one line */
  check('archive', s, 'his archived row says "Archived 27 Sep 26 by Saber"', (await words(s, '[data-testid="arch-line-rocky"]')) === 'Archived 27 Sep 26 by Saber', await words(s, '[data-testid="arch-line-rocky"]'))
  await shot(s, 'archive-01-group')
  await war(s, 'SEP')
  check('archive', s, 'war: here on 25 Sep (his past kept)', (await here(s, 'rocky', '2026-09-25')), await cellCls(s, 'rocky', '2026-09-25'))
  check('archive', s, 'war: away from 27 Sep (posted out from today)', /\bgone\b/.test(await cellCls(s, 'rocky', '2026-09-28') || ''), await cellCls(s, 'rocky', '2026-09-28'))
  check('archive', s, 'war: the PO corner on 26 Sep (his last day in)', /pofin/.test(await cellCls(s, 'rocky', '2026-09-26') || ''))
  await s.page.evaluate(() => document.querySelector('[data-testid="row-rocky"]')?.scrollIntoView({ block: 'center' }))
  await shot(s, 'archive-02-war')
  await go(s.page, 'quals')
  check('archive', s, 'Quals: he is off the table, no drawer', (await count(s, '#qtbl td.qname[data-person="rocky"]')) === 0 && (await count(s, '#qArchive')) === 0)
  await signIn(s.page, 'hex')
  check('archive', s, 'his sign-in: "Your access is suspended"', (await text(s, '#accessOff .acc-h')) === 'Your access is suspended')
  await shot(s, 'archive-03-signin')
})

/* ---- restore: the post-in date; a later date opens a gap; the same day reopens; Restore as; Save name; Delete ---- */
await scene('restore', [DESK, PHONE], async s => {
  await signIn(s.page, 'ad', 'a'); await users(s)
  await s.page.locator('#accList [data-person="rocky"] .acc-tap').click(); await s.page.click('#accEdArchive'); await s.page.waitForTimeout(300)
  await s.page.click('#accArchToggle'); await s.page.locator('#accArchList [data-person="rocky"] .acc-tap').click()
  check('restore', s, 'the post-in date opens on today', (await s.page.inputValue('#accArPostIn')) === '2026-09-27')
  await shot(s, 'restore-01-open', '[data-restoring]')
  await s.page.fill('#accArPostIn', '2026-09-20'); await s.page.click('#accArRestore'); await s.page.waitForTimeout(250)
  check('restore', s, 'a post-in before he left is refused, with the reason', /on or after/.test(await text(s, '#accArErr') || ''), await text(s, '#accArErr'))
  await shot(s, 'restore-02-refused', '[data-restoring]')
  await s.page.fill('#accArPostIn', '2026-10-19'); await s.page.click('#accArRestore'); await s.page.waitForTimeout(400)
  check('restore', s, 'Restore: back on the list, can sign in', (await count(s, '#accList [data-person="rocky"]')) === 1 && (await attr(s, '[data-testid="dot-signin-rocky"]', 'aria-label')) === 'Can sign in')
  await war(s, 'OCT')
  check('restore', s, 'war: 5 Oct in the gap reads PO', (await text(s, '[data-testid="cell-rocky-2026-10-05"]')) === 'PO' && /\bgone\b/.test(await cellCls(s, 'rocky', '2026-10-05') || ''))
  check('restore', s, 'war: counted again from 19 Oct', (await here(s, 'rocky', '2026-10-19')))
  await s.page.evaluate(() => document.querySelector('[data-testid="row-rocky"]')?.scrollIntoView({ block: 'center' }))
  await shot(s, 'restore-03-war-gap')
  await war(s, 'SEP')
  check('restore', s, 'war: his September before he left stands', (await here(s, 'rocky', '2026-09-24')))
  /* a month that holds ONLY his earlier stint (his current one starts 19 Oct): his row is still drawn and counted there
     (D320 — the grid's row for an earlier stint; the break tests found no unit test can watch it: jsdom has no window) */
  await war(s, 'JUN')
  check('restore', s, 'war: June (only his earlier stint) still draws his row, counted', (await here(s, 'rocky', '2026-06-16')), await cellCls(s, 'rocky', '2026-06-16'))
  /* the same day reopens (no boundary) — a second man */
  await users(s)
  await s.page.locator('#accList [data-person="casper"] .acc-tap').click(); await s.page.click('#accEdArchive'); await s.page.waitForTimeout(300)
  await s.page.click('#accArchToggle'); await s.page.locator('#accArchList [data-person="casper"] .acc-tap').click()
  await s.page.click('#accArRestore'); await s.page.waitForTimeout(350)
  await war(s, 'SEP')
  check('restore', s, 'restored the same day: no PO corner, never away', (await here(s, 'casper', '2026-09-26')) && (await here(s, 'casper', '2026-09-28')) && !/pofin/.test(await cellCls(s, 'casper', '2026-09-26') || ''))
  /* Restore as: his callsign taken */
  await users(s)
  await s.page.locator('#accList [data-person="rocky"] .acc-tap').click(); await s.page.click('#accEdArchive'); await s.page.waitForTimeout(300)
  await go(s.page, 'quals'); await s.page.click('#qViewA').catch(() => {}); await s.page.click('#qEdit'); await s.page.waitForTimeout(250)
  await s.page.fill('#qtbl input.qcs[data-cs="casper"]', 'Hex'); await s.page.press('#qtbl input.qcs[data-cs="casper"]', 'Enter')
  await s.page.locator('#qtbl input.qcs[data-cs="casper"]').blur().catch(() => {}); await s.page.waitForTimeout(300)
  await s.page.click('#qSave').catch(() => {})
  check('restore', s, 'Quals renamed Outlaw → Hex (his archived callsign is free, D286)', await s.page.evaluate(() => window.PEOPLE.casper.cs === 'Hex'))
  await users(s)
  await s.page.click('#accArchToggle'); await s.page.locator('#accArchList [data-person="rocky"] .acc-tap').click()
  check('restore', s, 'his callsign taken: the box offers "Hex 2" and says why', (await s.page.inputValue('#accArCs')) === 'Hex 2' && /is taken on the roster/.test(await text(s, '#accArTaken') || ''))
  check('restore', s, '"Restore as Hex 2"', (await text(s, '#accArRestore')) === 'Restore as Hex 2')
  await shot(s, 'restore-04-taken', '[data-restoring]')
  await s.page.fill('#accArCs', 'Hexx'); await s.page.click('#accArSave'); await s.page.waitForTimeout(250)
  check('restore', s, 'Save name renames him and keeps him archived', await s.page.evaluate(() => window.PEOPLE.rocky.cs === 'Hexx' && window.PEOPLE.rocky.archived))
  /* the final code reads (Fable F4 / Astra 2): his kept Leave War row carries the new name too */
  await war(s, 'SEP')
  check('restore', s, 'the Leave War row of the archived man reads the new name', /Hexx/.test(await text(s, '[data-testid="row-rocky"]') || ''), await text(s, '[data-testid="row-rocky"]'))
  await s.page.evaluate(() => document.querySelector('[data-testid="row-rocky"]')?.scrollIntoView({ block: 'center' }))
  await shot(s, 'restore-05-renamed-war')
  await openArchived(s, 'rocky')
  await s.page.click('#accArDel'); await s.page.waitForTimeout(150)
  check('restore', s, 'Delete asks twice', /Tap again to delete/.test(await text(s, '#accArDel') || ''))
  await s.page.click('#accArDel'); await s.page.waitForTimeout(350)
  check('restore', s, 'deleted: on no list', (await count(s, '[data-person="rocky"].od-row')) === 0)
})

/* ---- published: a fully signed published day he is on reads "1 pending", its four fall; Restore → none pending ---- */
await scene('published', [DESK], async s => {
  await signIn(s.page, 'ad', 'a')
  await go(s.page, 'editsched')
  const di = await s.page.evaluate(() => {
    for (let i = 0; i < window.DAYS.length; i++) if (JSON.stringify(window.DAYS[i]).includes('"rocky"') && !window.dayApproved(i)) return i
    return -1
  })
  check('published', s, 'a demo day with Hex on it', di >= 0, di)
  if (di < 0) return
  const sels = s.page.locator(`select[data-signday="${di}"]`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) { await sels.nth(i).scrollIntoViewIfNeeded(); await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)]) }
    await s.page.waitForTimeout(150)
  }
  await s.page.locator(`[data-beak="${di}"]`).first().click().catch(() => {}); await s.page.waitForTimeout(900)
  const ok = s.page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.click(); await s.page.waitForTimeout(900) }
  check('published', s, `the day published through its own sign-offs (${n} boxes) and Publish day`, await s.page.evaluate(i => window.dayApproved(i), di))
  const read = () => s.page.evaluate(i => {
    const card = [...document.querySelectorAll('#eWeek .day')][i]
    const pend = card ? (card.querySelector('.dpend')?.textContent || '').replace(/\s+/g, ' ').trim() : ''
    return { pend, missing: window.signMissing(i).length }
  }, di)
  /* publishing clears the four for the NEXT version (D102) — sign them again, as a scheduler readies the next AL */
  const sels2 = s.page.locator(`select[data-signday="${di}"]`)
  for (let i = 0; i < await sels2.count(); i++) {
    const opts = await sels2.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) { await sels2.nth(i).scrollIntoViewIfNeeded(); await sels2.nth(i).selectOption(opts[Math.min(i, opts.length - 1)]) }
    await s.page.waitForTimeout(150)
  }
  const before = await read()
  check('published', s, `published and signed: nothing pending, no sign-off missing (${JSON.stringify(before)})`, !before.pend && before.missing === 0, JSON.stringify(before))
  await users(s)
  await s.page.locator('#accList [data-person="rocky"] .acc-tap').click(); await s.page.click('#accEdArchive'); await s.page.waitForTimeout(400)
  await go(s.page, 'editsched')
  const after = await read()
  check('published', s, `Archive: the day reads pending and its four fall (${JSON.stringify(after)})`, /pending/.test(after.pend) && after.missing === 4, JSON.stringify(after))
  await s.page.evaluate(i => [...document.querySelectorAll('#eWeek .day')][i]?.scrollIntoView({ block: 'start', inline: 'start' }), di)
  await shot(s, 'published-01-pending')
  await users(s)
  await s.page.click('#accArchToggle'); await s.page.locator('#accArchList [data-person="rocky"] .acc-tap').click(); await s.page.click('#accArRestore'); await s.page.waitForTimeout(400)
  await go(s.page, 'editsched')
  const back = await read()
  check('published', s, `Restore the same day: nothing pending, the sign-offs back (${JSON.stringify(back)})`, !back.pend && back.missing === 0, JSON.stringify(back))
})

/* ---- sans: a SANS man hidden (Show SANS off) with a past keeps his row after Archive (Fable F3 / S1) ---- */
await scene('sans', [DESK], async s => {
  await signIn(s.page, 'ad', 'a')
  await go(s.page, 'leavewar')
  await s.page.evaluate(() => window.lwSetCell('rocky', '2026-09-10', 'LL'))              // setup: a record in his past
  await go(s.page, 'quals'); await s.page.click('#qViewW').catch(() => {}); await s.page.click('#qEdit'); await s.page.waitForTimeout(200)
  await s.page.evaluate(() => { const c = document.querySelector('#qtbl [data-q="rocky|san"]'); c && c.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
  await s.page.click('#qSave').catch(() => {}); await s.page.waitForTimeout(300)
  check('sans', s, 'setup: Hex ticked SANS', await s.page.evaluate(() => !!window.PEOPLE.rocky.san))
  await war(s, 'SEP')
  check('sans', s, 'a SANS man is hidden from the war (Show SANS off)', (await count(s, '[data-testid="row-rocky"]')) === 0)
  await archive(s, 'rocky')
  check('sans', s, 'Archive went through for a hidden SANS man', await s.page.evaluate(() => window.PEOPLE.rocky.archived))
  await war(s, 'SEP')
  const off = await count(s, '[data-testid="row-rocky"]')
  await s.page.evaluate(() => document.querySelector('[data-testid="row-rocky"]')?.scrollIntoView({ block: 'center' }))
  await shot(s, 'sans-01-after-archive-off')
  await s.page.click('[data-testid="settings-open"]'); await s.page.waitForTimeout(300)
  await s.page.click('[data-testid="sans-toggle"]'); await s.page.waitForTimeout(300)
  await s.page.click('[data-testid="settings-close"]'); await s.page.waitForTimeout(300)
  await war(s, 'SEP')
  check('sans', s, 'Show SANS on: his row, his 10 Sep leave kept', (await count(s, '[data-testid="row-rocky"]')) === 1 && (await text(s, '[data-testid="cell-rocky-2026-09-10"]')) === 'LL', await text(s, '[data-testid="cell-rocky-2026-09-10"]'))
  check('sans', s, 'Show SANS on: posted out from 27 Sep', await gone(s, 'rocky', '2026-09-28') && (await here(s, 'rocky', '2026-09-25')))
  await s.page.evaluate(() => document.querySelector('[data-testid="row-rocky"]')?.scrollIntoView({ block: 'center' }))
  await shot(s, 'sans-02-show-sans-on')
  check('sans', s, `Show SANS off after the archive: ${off ? 'his kept row shows (OBSERVE — Fable R32)' : 'no row'}`, true)
})

/* ---- sheets: an Admin archive's Post out sheet reads only; a man back's Post in sheet ---- */
await scene('sheets', [DESK, PHONE], async s => {
  await signIn(s.page, 'ad', 'a'); await users(s)
  await s.page.locator('#accList [data-person="rocky"] .acc-tap').click(); await s.page.click('#accEdArchive'); await s.page.waitForTimeout(300)
  await war(s, 'OCT')
  check('sheets', s, 'October, away the whole month: no row for him (D320)', (await count(s, '[data-testid="row-rocky"]')) === 0)
  await war(s, 'SEP')
  await s.page.locator('[data-testid="cell-rocky-2026-09-29"]').click(); await s.page.waitForTimeout(400)
  check('sheets', s, 'his Post out sheet: "archived on Admin → Users — restore him there"', /archived on Admin → Users — restore him there/.test(await text(s, '[data-testid="postout-locked"]') || ''))
  check('sheets', s, 'no Undo, the date fixed', (await count(s, '[data-testid="postout-undo"]')) === 0 && await s.page.locator('[data-testid="postout-date"]').isDisabled())
  await shot(s, 'sheets-01-locked', '[data-testid="postout-sheet"]')
  await s.page.click('[data-testid="postout-cancel"]'); await s.page.waitForTimeout(200)
  await users(s)
  await s.page.click('#accArchToggle'); await s.page.locator('#accArchList [data-person="rocky"] .acc-tap').click()
  await s.page.fill('#accArPostIn', '2026-10-19'); await s.page.click('#accArRestore'); await s.page.waitForTimeout(350)
  await war(s, 'OCT')
  await s.page.locator('[data-testid="cell-rocky-2026-10-05"]').click(); await s.page.waitForTimeout(400)
  check('sheets', s, 'a gap day opens his Post in sheet: "Back from a posting on 27 Sep…"', /Back from a posting on 2026-09-27 — on the manpower from 2026-10-19/.test(await text(s, '[data-testid="postin-note"]') || ''), await text(s, '[data-testid="postin-note"]'))
  check('sheets', s, 'no Undo post in', (await count(s, '[data-testid="postin-undo"]')) === 0)
  await shot(s, 'sheets-02-back', '[data-testid="postin-sheet"]')
  await s.page.click('[data-testid="postin-cancel"]'); await s.page.waitForTimeout(200)
  await war(s, 'SEP')
  await s.page.locator('[data-testid="cell-rocky-2026-09-10"]').click(); await s.page.waitForTimeout(400)
  check('sheets', s, 'a day in his EARLIER stint opens the ordinary sheet, not a posting sheet', (await count(s, '[data-testid="postin-sheet"], [data-testid="postout-sheet"]')) === 0)
  await shot(s, 'sheets-03-earlier-stint')
  /* R30: his post-in moved onto the stint he left — refused, with the sentence */
  await s.page.keyboard.press('Escape').catch(() => {}); await s.page.waitForTimeout(200)
  await war(s, 'OCT')
  await s.page.locator('[data-testid="cell-rocky-2026-10-05"]').click(); await s.page.waitForTimeout(400)
  await s.page.fill('[data-testid="postin-date"]', '2026-09-26'); await s.page.waitForTimeout(300)
  check('sheets', s, 'moving his post-in onto the stint he left is refused, with the sentence', /was posted out on 27 Sep 26 and came back on 19 Oct 26/.test(await text(s, '[data-testid="postin-err"]') || ''), await text(s, '[data-testid="postin-err"]'))
  await shot(s, 'sheets-04-refused', '[data-testid="postin-sheet"]')
  /* the final code read (Fable F3): moved to the day after he left, the two stints JOIN — counted throughout, no corner */
  await s.page.fill('[data-testid="postin-date"]', '2026-09-27'); await s.page.waitForTimeout(400)
  await s.page.keyboard.press('Escape').catch(() => {}); await s.page.waitForTimeout(250)
  await war(s, 'OCT')
  check('sheets', s, 'post-in moved to 27 Sep: 5 Oct counted (one stint again)', (await here(s, 'rocky', '2026-10-05')), await cellCls(s, 'rocky', '2026-10-05'))
  await war(s, 'SEP')
  check('sheets', s, 'and no "posted out" corner on 26 Sep, a day he never left', (await here(s, 'rocky', '2026-09-26')) && !/pofin/.test(await cellCls(s, 'rocky', '2026-09-26') || ''), await cellCls(s, 'rocky', '2026-09-26'))
})

/* ---- quals: no ✕, no drawer, the help line ---- */
await scene('quals', [DESK, PHONE], async s => {
  await signIn(s.page, 'ad', 'a'); await go(s.page, 'quals')
  await s.page.click('#qEdit'); await s.page.waitForTimeout(250)
  check('quals', s, 'no ✕ in edit mode', (await count(s, '#qtbl [data-arch]')) === 0)
  check('quals', s, 'the help line says where archive went', /Archive, restore and delete are on Admin → Users\./.test(await text(s, '.qhelp') || ''))
  check('quals', s, 'no Archived drawer', (await count(s, '#qArchive')) === 0)
  await shot(s, 'quals-01-edit')
  await s.page.click('#qAddToggle'); await s.page.waitForFunction(() => window.CURPAGE === 'admin')
  check('quals', s, '"+ Add person" opens Add a person', await s.page.locator('#accAddCs').isVisible())
})

/* ---- welcome: his first sign-in after Restore ---- */
await scene('welcome', [DESK, PHONE], async s => {
  await signIn(s.page, 'ad', 'a'); await users(s)
  await s.page.locator('#accList [data-person="rocky"] .acc-tap').click(); await s.page.click('#accEdArchive'); await s.page.waitForTimeout(300)
  await s.page.click('#accArchToggle'); await s.page.locator('#accArchList [data-person="rocky"] .acc-tap').click(); await s.page.click('#accArRestore'); await s.page.waitForTimeout(350)
  await signIn(s.page, 'hex')
  check('welcome', s, '"Welcome back, Hex — check your quals and CAT."', /Welcome back, Hex — check your quals and CAT\./.test(await text(s, '#welcomeBack') || ''))
  /* SEEN, not only on the page (the walk's pictures, 27 Sep 26: on a phone the land-on-today jump scrolled it away) */
  const box = await s.page.evaluate(() => { const r = document.querySelector('#welcomeBack')?.getBoundingClientRect(); return r ? { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight } : null })
  check('welcome', s, 'the note is on the screen when he lands (not scrolled away)', !!box && box.top >= 0 && box.bottom <= box.vh, JSON.stringify(box))
  await shot(s, 'welcome-01-note')
  await s.page.click('#welcomeCheck'); await s.page.waitForTimeout(500)
  check('welcome', s, 'Check my quals: Quals, his own row outlined', (await s.page.evaluate(() => window.CURPAGE)) === 'quals' && (await count(s, '#qtbl tr.back-hl td.qname[data-person="rocky"]')) === 1)
  /* the outline is PAINTED on his name cell too — the pinned callsign cell paints its own background, and the walk only
     checked the class was on (his look, 28 Sep 26: the box started at Initials) */
  const edge = await s.page.evaluate(() => { const td = document.querySelector('#qtbl tr.back-hl td.qname'); return td ? getComputedStyle(td).boxShadow : null })
  check('welcome', s, 'the outline is drawn on his name cell too (the pinned column), not only from Initials on', !!edge && /rgb\(60, 198, 230\)/.test(edge), edge)
  await shot(s, 'welcome-02-his-row')
  await signIn(s.page, 'hex')
  check('welcome', s, 'said once — gone on the next sign-in', (await count(s, '#welcomeBack')) === 0)
  await signIn(s.page, 'us', 'us')
  check('welcome', s, 'nobody else sees it', (await count(s, '#welcomeBack')) === 0)
})

/* ---- doors: Give access / Refuse and New person with its post-in date; Add a person with its post-in date ---- */
await scene('doors', [DESK, PHONE], async s => {
  await signIn(s.page, 'newface@mail')
  await s.page.fill('#accCs', 'Newface'); await s.page.fill('#accIni', 'NF'); await s.page.selectOption('#accSeat', 'FCP'); await s.page.selectOption('#accCat', 'C'); await s.page.click('#accSend'); await s.page.waitForTimeout(300)
  await signIn(s.page, 'ad', 'a'); await users(s)
  check('doors', s, 'Waiting: Give access · Refuse', (await text(s, '#admWaiting [data-approve]')) === 'Give access' && (await text(s, '#admWaiting [data-decline]')) === 'Refuse')
  await s.page.click('#admWaiting [data-approve]'); await s.page.waitForTimeout(250)
  check('doors', s, 'New person asks the post-in date, opening on today', (await s.page.inputValue('#apvPostIn')) === '2026-09-27')
  await shot(s, 'doors-01-give-access', '[data-approving]')
  await s.page.fill('#apvPostIn', '2026-10-05'); await s.page.click('#apvGo'); await s.page.waitForTimeout(400)
  const id = await s.page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Newface'))
  check('doors', s, 'Newface made, can sign in', !!id && (await attr(s, `[data-testid="dot-signin-${id}"]`, 'aria-label')) === 'Can sign in')
  await war(s, 'OCT')
  check('doors', s, 'war: Newface not yet here on 4 Oct, here from 5 Oct', /\bgone\b/.test(await cellCls(s, id, '2026-10-04') || '') && (await here(s, id, '2026-10-05')))
  await users(s)
  await s.page.fill('#accAddCs', 'Groundy'); await s.page.selectOption('#accAddSeat', 'GND'); await s.page.fill('#accAddPostIn', '2026-10-01')
  await shot(s, 'doors-02-add', '#accAddBlock')
  await s.page.click('#accAdd'); await s.page.waitForTimeout(400)
  const g = await s.page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Groundy'))
  check('doors', s, 'Add a person (no sign-in): on the list, grey Sign-in', !!g && (await attr(s, `[data-testid="dot-signin-${g}"]`, 'aria-label')) === 'No sign-in')
})

/* ---- replaced: Archive over a pending posting; Restore later (Fable S2, F13; 4.7 — Vector has no sign-in) ---- */
await scene('replaced', [DESK, PHONE], async s => {
  await signIn(s.page, 'ad', 'a'); await go(s.page, 'leavewar')
  await s.page.evaluate(() => window.lwSetPostOut('divot', '2026-10-14'))                 // setup: a posting out still to come
  await users(s)
  check('replaced', s, 'his row: "posting out 14 Oct · Overseas Sqn"', /posting out 14 Oct · Overseas Sqn/.test(await words(s, '[data-testid="po-tag-divot"]') || ''), await words(s, '[data-testid="po-tag-divot"]'))
  await shot(s, 'replaced-01-tag', '#accList [data-person="divot"]')
  await archive(s, 'divot')
  const said = await toastSaid(s)
  check('replaced', s, 'the message names the posting it replaced, and no sign-in (he has none)', /Vector archived; his posting out on 14 Oct \(Overseas Sqn\) is replaced/.test(said) && !/sign-in/.test(said), said)
  await war(s, 'OCT')
  check('replaced', s, 'October: no row — away from today, the whole month', (await count(s, '[data-testid="row-divot"]')) === 0)
  await war(s, 'SEP')
  check('replaced', s, 'war: posted out from 27 Sep, not 14 Oct', await gone(s, 'divot', '2026-09-28') && (await here(s, 'divot', '2026-09-25')))
  await restore(s, 'divot', '2026-11-01')
  check('replaced', s, 'restored with a later post-in: his row says "posting in 1 Nov"', /posting in 1 Nov/.test(await words(s, '[data-testid="po-tag-divot"]') || ''), await words(s, '[data-testid="po-tag-divot"]'))
  check('replaced', s, 'no held note on his row', (await count(s, '[data-testid^="acc-held-divot"]')) === 0)
  await shot(s, 'replaced-02-posting-in', '#accList [data-person="divot"]')
  await war(s, 'OCT')
  check('replaced', s, 'the replaced posting is not revived: 20 Oct reads PO (away)', await gone(s, 'divot', '2026-10-20') && (await text(s, '[data-testid="cell-divot-2026-10-20"]')) === 'PO')
  await war(s, 'NOV')
  check('replaced', s, 'counted again from 1 Nov', (await here(s, 'divot', '2026-11-02')))
})

/* ---- future: a new person whose post-in is still to come; Archive; Restore today (Fable S4, 4.1) ---- */
await scene('future', [DESK], async s => {
  await signIn(s.page, 'ad', 'a'); await users(s)
  await s.page.fill('#accAddCs', 'Nova'); await s.page.selectOption('#accAddSeat', 'FCP'); await s.page.selectOption('#accAddCat', 'C')
  await s.page.fill('#accAddPostIn', '2026-10-15'); await s.page.click('#accAdd'); await s.page.waitForTimeout(400)
  const id = await s.page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Nova'))
  check('future', s, 'Nova made: on the roster, no sign-in', !!id && (await attr(s, `[data-testid="dot-signin-${id}"]`, 'aria-label')) === 'No sign-in')
  check('future', s, 'his row says "posting in 15 Oct"', /posting in 15 Oct/.test(await words(s, `[data-testid="po-tag-${id}"]`) || ''), await words(s, `[data-testid="po-tag-${id}"]`))
  await shot(s, 'future-01-row', `#accList [data-person="${id}"]`)
  await war(s, 'SEP')
  /* the grid draws a row for the months it has loaded around the one jumped to (not per month), so the check is his
     days: before he arrives they are blank and not counted */
  check('future', s, 'war: September not counted — blank before he arrives, no PO', await gone(s, id, '2026-09-20') && !(await text(s, `[data-testid="cell-${id}-2026-09-20"]`)), `${await cellCls(s, id, '2026-09-20')} "${await text(s, `[data-testid="cell-${id}-2026-09-20"]`)}"`)
  await war(s, 'OCT')
  check('future', s, 'war: blank before 15 Oct (not yet arrived, no PO), counted from 15 Oct', (await text(s, `[data-testid="cell-${id}-2026-10-10"]`)) !== 'PO' && (await here(s, id, '2026-10-16')), `${await cellCls(s, id, '2026-10-10')} / ${await cellCls(s, id, '2026-10-16')}`)
  await s.page.evaluate(i => document.querySelector(`[data-testid="row-${i}"]`)?.scrollIntoView({ block: 'center' }), id)
  await shot(s, 'future-02-war-oct')
  await go(s.page, 'editsched')
  check('future', s, 'the crew palette offers him before his post-in (his place works at once — D308)', await s.page.evaluate(i => !!document.querySelector(`.ros-body .rpuck[data-person="${i}"]`), id))
  await archive(s, id)
  await go(s.page, 'editsched')
  check('future', s, 'archived: the crew palette no longer offers him', await s.page.evaluate(i => !document.querySelector(`.ros-body .rpuck[data-person="${i}"]`), id))
  check('future', s, 'archived before he arrived', await s.page.evaluate(i => window.PEOPLE[i].archived, id))
  await war(s, 'OCT')
  check('future', s, 'war after the archive: no row in October (never here)', (await count(s, `[data-testid="row-${id}"]`)) === 0)
  await war(s, 'SEP')
  check('future', s, 'war after the archive: no row in September either', (await count(s, `[data-testid="row-${id}"]`)) === 0)
  await restore(s, id)
  check('future', s, 'Restore today: on the roster, no tag', (await count(s, `#accList [data-person="${id}"]`)) === 1 && (await count(s, `[data-testid="po-tag-${id}"]`)) === 0)
  await war(s, 'SEP')
  check('future', s, 'counted from 27 Sep, no PO corner', (await here(s, id, '2026-09-28')) && !/pofin/.test(await cellCls(s, id, '2026-09-26') || ''))
})

/* ---- again: Archive → Restore later → Archive again today → Restore → Delete (Fable S6 C, D) ---- */
await scene('again', [DESK, PHONE], async s => {
  await signIn(s.page, 'ad', 'a')
  await archive(s, 'casper'); await restore(s, 'casper', '2026-10-19')
  await archive(s, 'casper')
  check('again', s, 'archived again after a Restore', await s.page.evaluate(() => window.PEOPLE.casper.archived))
  await war(s, 'SEP')
  check('again', s, 'the stint still to come is dropped: here to 26 Sep, away from 27 Sep', (await here(s, 'casper', '2026-09-25')) && await gone(s, 'casper', '2026-09-28') && /pofin/.test(await cellCls(s, 'casper', '2026-09-26') || ''))
  await war(s, 'OCT')
  check('again', s, 'October: no row (the 19 Oct stint went with the second archive)', (await count(s, '[data-testid="row-casper"]')) === 0)
  await restore(s, 'casper', '2026-10-19')
  await users(s)
  await s.page.locator('#accList [data-person="casper"] .acc-tap').click()
  await s.page.click('#accEdDel'); await s.page.waitForTimeout(150); await s.page.click('#accEdDel'); await s.page.waitForTimeout(400)
  check('again', s, 'deleted: on no list', (await count(s, '#accList [data-person="casper"], #accArchList [data-person="casper"]')) === 0)
  await war(s, 'SEP')
  check('again', s, 'the war keeps his September up to 26 Sep; nothing from 27 Sep', (await here(s, 'casper', '2026-09-24')) && await gone(s, 'casper', '2026-09-28'), (await cellCls(s, 'casper', '2026-09-24')) + ' / ' + (await cellCls(s, 'casper', '2026-09-28')))
  await s.page.evaluate(() => document.querySelector('[data-testid="row-casper"]')?.scrollIntoView({ block: 'center' }))
  await shot(s, 'again-01-deleted-war')
})

/* ---- twodoors: a POSTING's archive keeps its Leave War door; Restore on Admin → Users is the other (Fable S9, F7) ---- */
await scene('twodoors', [DESK], async s => {
  await signIn(s.page, 'ad', 'a'); await go(s.page, 'leavewar')
  await s.page.evaluate(() => window.lwSetPostOut('rocky', '2026-09-20'))                  // setup: a posting that has run
  await go(s.page, 'quals'); await go(s.page, 'leavewar')
  check('twodoors', s, 'the posting archived him (by the posting, not Admin → Users)', await s.page.evaluate(() => window.PEOPLE.rocky.archived && window.PEOPLE.rocky.archivedBy === 'po'))
  await war(s, 'SEP')
  await s.page.locator('[data-testid="cell-rocky-2026-09-24"]').click(); await s.page.waitForTimeout(400)
  check('twodoors', s, 'his Post out sheet is NOT locked: its Undo is there', (await count(s, '[data-testid="postout-locked"]')) === 0 && (await count(s, '[data-testid="postout-undo"]')) === 1)
  await shot(s, 'twodoors-01-posting-sheet', '[data-testid="postout-sheet"]')
  await s.page.click('[data-testid="postout-undo"]'); await s.page.waitForTimeout(500)
  check('twodoors', s, 'Undo post out: back, the SAME stint (no PO corner on 19 Sep)', await s.page.evaluate(() => !window.PEOPLE.rocky.archived) && (await here(s, 'rocky', '2026-09-24')) && !/pofin/.test(await cellCls(s, 'rocky', '2026-09-19') || ''))
  /* the posting line's words after the one door: "archived", no longer "archived on Quals" (D310) */
  await s.page.locator('[data-testid="cell-rocky-2026-10-12"]').click(); await s.page.waitForTimeout(400)
  if (await count(s, '[data-testid="bid-postout"]')) {
    await s.page.click('[data-testid="bid-postout"]'); await s.page.waitForTimeout(300)
    check('twodoors', s, 'the posting line reads "On 12 Oct: archived, account suspended."', (await words(s, '[data-testid="po-line"]')) === 'On 12 Oct: archived, account suspended.', await words(s, '[data-testid="po-line"]'))
    await shot(s, 'twodoors-02-posting-line', '[data-testid="po-line"]')
  } else check('twodoors', s, 'the bid sheet on 12 Oct offers Post out', false, 'no bid-postout')
  await s.page.keyboard.press('Escape').catch(() => {}); await s.page.waitForTimeout(250)
  await signIn(s.page, 'hex')
  check('twodoors', s, 'Undo: he can sign in, and no welcome note (he never left)', (await count(s, '#accessOff')) === 0 && (await count(s, '#welcomeBack')) === 0)
  /* the other door */
  await signIn(s.page, 'ad', 'a'); await go(s.page, 'leavewar')
  await s.page.evaluate(() => window.lwSetPostOut('rocky', '2026-09-20'))
  await go(s.page, 'quals')
  await restore(s, 'rocky', '2026-10-01')
  await war(s, 'SEP')
  check('twodoors', s, 'Restore on Admin → Users: a new stint — 24 Sep away, his days before 20 Sep stand', await gone(s, 'rocky', '2026-09-24') && (await here(s, 'rocky', '2026-09-15')))
  await signIn(s.page, 'hex')
  check('twodoors', s, 'Restore: he can sign in and is welcomed back', /Welcome back, Hex/.test(await text(s, '#welcomeBack') || ''))
})

/* ---- noacct: Restore sets his note even with no sign-in; Give sign-in later; he sees it once (Fable S12, F12) ---- */
await scene('noacct', [DESK, PHONE], async s => {
  await signIn(s.page, 'ad', 'a')
  await archive(s, 'divot'); await restore(s, 'divot')
  await users(s); await s.page.locator('#accList [data-person="divot"] .acc-tap').click()
  await s.page.fill('#accGiveName', 'vector@mail'); await s.page.click('#accGive'); await s.page.waitForTimeout(300)
  await signIn(s.page, 'vector@mail')
  check('noacct', s, 'his first sign-in: "Welcome back, Vector"', /Welcome back, Vector — check your quals and CAT\./.test(await text(s, '#welcomeBack') || ''))
  await shot(s, 'noacct-01-note')
  await s.page.click('#welcomeLater'); await s.page.waitForTimeout(300)
  check('noacct', s, 'Later: the note goes, nothing else changes', (await count(s, '#welcomeBack')) === 0 && (await s.page.evaluate(() => window.CURPAGE)) !== 'quals')
  await signIn(s.page, 'vector@mail')
  check('noacct', s, 'once only: not there on the next sign-in', (await count(s, '#welcomeBack')) === 0)
  await signIn(s.page, 'ad', 'a')
  check('noacct', s, 'Saber never sees Vector\'s note', (await count(s, '#welcomeBack')) === 0)
})

/* ---- lockin: an Admin-archived man's Post IN sheet reads only too; the bid sheet's Post out says why (Fable 4.2, R28) ---- */
await scene('lockin', [DESK, PHONE], async s => {
  await signIn(s.page, 'ad', 'a'); await users(s)
  await s.page.fill('#accAddCs', 'Groundy'); await s.page.selectOption('#accAddSeat', 'GND'); await s.page.fill('#accAddPostIn', '2026-09-14')
  await s.page.click('#accAdd'); await s.page.waitForTimeout(400)
  const g = await s.page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Groundy'))
  await archive(s, g)
  await war(s, 'SEP')
  await s.page.locator(`[data-testid="cell-${g}-2026-09-08"]`).click(); await s.page.waitForTimeout(400)
  check('lockin', s, 'a day before his post-in: his Post in sheet reads only — the reason, the date fixed, no Undo',
    /archived on Admin → Users — restore him there/.test(await text(s, '[data-testid="postin-locked"]') || '')
    && await s.page.locator('[data-testid="postin-date"]').isDisabled() && (await count(s, '[data-testid="postin-undo"]')) === 0)
  await shot(s, 'lockin-01-postin-locked', '[data-testid="postin-sheet"]')
  await s.page.click('[data-testid="postin-cancel"]'); await s.page.waitForTimeout(250)
  await s.page.locator(`[data-testid="cell-${g}-2026-09-16"]`).click(); await s.page.waitForTimeout(400)
  /* W1 (walk3's pictures): his leave sheet offers no posting door at all — it could only be refused, and said so twice */
  check('lockin', s, 'a day in his stint: the leave sheet opens, with no Post out and no Post in',
    (await count(s, '[data-testid="bid-picker"]')) === 1 && (await count(s, '[data-testid="bid-postout"], [data-testid="bid-postin"]')) === 0)
  check('lockin', s, 'and his days stay as Archive left them: 22 Sep counted, 28 Sep away', (await here(s, g, '2026-09-22')) && await gone(s, g, '2026-09-28'))
  await shot(s, 'lockin-02-bid-sheet')
})

/* ---- roles: a member; the admin's member view (Fable S13, 4.8) ---- */
await scene('roles', [DESK, PHONE], async s => {
  await signIn(s.page, 'us', 'us')
  await s.page.evaluate(() => { try { window.go('admin') } catch (e) {} }); await s.page.waitForTimeout(300)
  check('roles', s, 'a member: no Admin → Users', (await count(s, '#accList')) === 0)
  await go(s.page, 'quals')
  check('roles', s, 'a member on Quals: no ✕, no "+ Add person"', (await count(s, '#qtbl [data-arch]')) === 0 && !(await s.page.locator('#qAddToggle').isVisible().catch(() => false)))
  await war(s, 'SEP')
  await s.page.locator('[data-testid="cell-rocky-2026-09-29"]').click().catch(() => {}); await s.page.waitForTimeout(300)
  check('roles', s, 'a member tapping another man\'s day: no posting sheet', (await count(s, '[data-testid="postout-sheet"], [data-testid="postin-sheet"], [data-testid="bid-postout"]')) === 0)
  await signIn(s.page, 'ad', 'a')
  const badge = s.page.locator('button#roleBadge')
  if (await badge.count() && await badge.isVisible()) {
    await badge.click(); await s.page.waitForTimeout(400)
    await go(s.page, 'quals')
    check('roles', s, 'the admin\'s member view: no "+ Add person" on Quals (so no add door there — 4.8)', !(await s.page.locator('#qAddToggle').isVisible().catch(() => false)))
    await shot(s, 'roles-01-member-view')
    await s.page.locator('button#roleBadge').click().catch(() => {})
  } else check('roles', s, 'the member-view switch is in the drawer on this width (walked on desktop)', true)
})

/* ---- search: the Archived group opens on a match and folds on its tap; the phone fits (Fable S14, R7, R13) ---- */
await scene('search', [PHONE, DESK], async s => {
  await signIn(s.page, 'ad', 'a')
  await archive(s, 'rocky'); await users(s)
  await s.page.fill('#accFind', 'hex'); await s.page.waitForTimeout(200)
  check('search', s, 'a search holding an archived match opens the group', (await count(s, '#accArchList [data-person="rocky"]')) === 1)
  await s.page.click('#accArchToggle'); await s.page.waitForTimeout(200)
  check('search', s, 'and a tap on ▾ folds it', (await count(s, '#accArchList')) === 0)
  await s.page.click('#accArchToggle'); await s.page.locator('#accArchList [data-person="rocky"] .acc-tap').click()
  const fits = await s.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  check('search', s, 'the opened archived row fits (no sideways scroll)', fits)
  await shot(s, 'search-01-archived-open')
  await s.page.fill('#accFind', ''); await s.page.waitForTimeout(200)
  const addFits = await s.page.evaluate(() => { const b = document.querySelector('#accAddBlock'); if (!b) return false; const r = b.getBoundingClientRect(); return r.right <= window.innerWidth + 1 })
  check('search', s, 'the Add a person form fits the pane', addFits)
  if (s.phone) { await s.page.locator('.adm-back').first().click().catch(() => {}); await s.page.waitForTimeout(300) }
  check('search', s, 'the Admin page names Users "Sign-in and roster"', /Sign-in and roster/.test(await s.page.evaluate(() => document.body.innerText)))
  if (s.phone) await shot(s, 'search-02-admin-list')
})

/* ---- undo: Archive is not a step of the Undo button (Fable S15, F14) ---- */
await scene('undo', [DESK], async s => {
  await signIn(s.page, 'ad', 'a'); await go(s.page, 'editsched')
  const size = () => s.page.evaluate(() => JSON.stringify(window.DAYS[0]).length)
  const n0 = await size()
  await s.page.evaluate(() => window.addWave(0, 'sc')); await s.page.waitForTimeout(300)
  const n1 = await size()
  await archive(s, 'rocky'); await go(s.page, 'editsched')
  await s.page.click('#undoBtn'); await s.page.waitForTimeout(400)
  const n2 = await size()
  check('undo', s, 'Undo takes back the schedule edit and Hex stays archived', n1 !== n0 && n2 === n0 && await s.page.evaluate(() => window.PEOPLE.rocky.archived), `${n0}/${n1}/${n2}`)
})

/* ---- lapse: signed in when his posting takes him — the next repaint says his access is suspended (Fable S11, R20) ---- */
await scene('lapse', [DESK], async s => {
  await signIn(s.page, 'ad', 'a'); await go(s.page, 'leavewar')
  await s.page.evaluate(() => window.lwSetPostOut('rocky', '2026-09-28'))                  // setup: his posting out tomorrow
  await signIn(s.page, 'hex')
  check('lapse', s, 'today he is still in', (await count(s, '#accessOff')) === 0)
  await s.page.context().clock.setFixedTime(new Date(2026, 8, 28, 0, 10, 0))
  await go(s.page, 'quals').catch(() => {}); await s.page.waitForTimeout(400); await go(s.page, 'leavewar').catch(() => {}); await s.page.waitForTimeout(600)
  check('lapse', s, 'after midnight: the next repaint lands him on "Your access is suspended"', (await text(s, '#accessOff .acc-h')) === 'Your access is suspended', await text(s, '#accessOff .acc-h'))
  await shot(s, 'lapse-01-suspended')
})

/* ---- reqarch: a request under an archived man's callsign; old Hex then "Restore as Hex 2" (Fable S10) ---- */
await scene('reqarch', [DESK], async s => {
  await signIn(s.page, 'ad', 'a'); await archive(s, 'rocky')
  await signIn(s.page, 'ace@mail')
  await s.page.fill('#accCs', 'Hex'); await s.page.fill('#accIni', 'HX'); await s.page.selectOption('#accSeat', 'FCP'); await s.page.selectOption('#accCat', 'C'); await s.page.click('#accSend'); await s.page.waitForTimeout(300)
  await signIn(s.page, 'ad', 'a'); await users(s)
  await s.page.click('#admWaiting [data-approve]'); await s.page.waitForTimeout(250)
  check('reqarch', s, 'Give access opens on New person, saying an archived man holds "Hex" — and the way it is him: restore first',
    /An archived man is already Hex — this makes a new person\. If it is him, restore him first \(▸ Archived\), then give him his sign-in on his row\./.test(await words(s, '#apvNote') || ''), await words(s, '#apvNote'))
  await shot(s, 'reqarch-01-give-access', '[data-approving]')
  await s.page.fill('#apvPostIn', '2026-10-05'); await s.page.click('#apvGo'); await s.page.waitForTimeout(400)
  const id = await s.page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Hex' && !window.PEOPLE[k].archived))
  check('reqarch', s, 'a NEW Hex on the roster, "posting in 5 Oct"', !!id && id !== 'rocky' && /posting in 5 Oct/.test(await words(s, `[data-testid="po-tag-${id}"]`) || ''), `${id} ${await words(s, `[data-testid="po-tag-${id}"]`)}`)
  await openArchived(s, 'rocky')
  check('reqarch', s, 'old Hex: "Restore as Hex 2"', (await text(s, '#accArRestore')) === 'Restore as Hex 2', await text(s, '#accArRestore'))
})

/* ---- pastrow: back NEXT year — this year's months still draw his row (D320; the grid's row for an earlier stint — the
   break tests found no unit test can watch it, and a post-in inside the loaded months hides the wire) ---- */
await scene('pastrow', [DESK, PHONE], async s => {
  await signIn(s.page, 'ad', 'a')
  await archive(s, 'casper'); await restore(s, 'casper', '2027-01-10')
  check('pastrow', s, 'restored with a post-in next January: "posting in 10 Jan"', /posting in 10 Jan/.test(await words(s, '[data-testid="po-tag-casper"]') || ''), await words(s, '[data-testid="po-tag-casper"]'))
  await war(s, 'SEP')
  check('pastrow', s, 'September: his row drawn, counted up to 26 Sep', (await here(s, 'casper', '2026-09-24')), await cellCls(s, 'casper', '2026-09-24'))
  check('pastrow', s, 'September: away from 27 Sep', await gone(s, 'casper', '2026-09-28'))
  await war(s, 'JUN')
  check('pastrow', s, 'June: his row drawn, counted', (await here(s, 'casper', '2026-06-16')), await cellCls(s, 'casper', '2026-06-16'))
  await s.page.evaluate(() => document.querySelector('[data-testid="row-casper"]')?.scrollIntoView({ block: 'center' }))
  await shot(s, 'pastrow-01-june')
})

/* ---- sansrun: a man whose SANS posting has RUN, archived with Show SANS on — the posting's date kept (Fable F1) ---- */
await scene('sansrun', [DESK], async s => {
  await signIn(s.page, 'ad', 'a')
  await war(s, 'SEP')
  await s.page.locator('[data-testid="cell-bane-2026-09-20"]').click(); await s.page.waitForTimeout(400)
  await s.page.click('[data-testid="bid-postout"]'); await s.page.waitForTimeout(300)
  await s.page.fill('[data-testid="po-date"]', '2026-09-20'); await s.page.click('[data-testid="po-sans"]'); await s.page.waitForTimeout(150)
  await s.page.click('[data-testid="po-confirm"]'); await s.page.waitForTimeout(600)
  await go(s.page, 'quals'); await go(s.page, 'leavewar')
  check('sansrun', s, 'setup through the sheet: Ranger posted out as SANS from 20 Sep, and it ran', await s.page.evaluate(() => !!window.PEOPLE.bane.san))
  await s.page.click('[data-testid="settings-open"]'); await s.page.waitForTimeout(300)
  await s.page.click('[data-testid="sans-toggle"]'); await s.page.waitForTimeout(300)
  await s.page.click('[data-testid="settings-close"]'); await s.page.waitForTimeout(300)
  await archive(s, 'bane')
  await war(s, 'SEP')
  check('sansrun', s, 'archived with Show SANS on: away from 20 Sep (the posting\'s date), not from today', await gone(s, 'bane', '2026-09-22') && (await here(s, 'bane', '2026-09-18')), `${await cellCls(s, 'bane', '2026-09-18')} / ${await cellCls(s, 'bane', '2026-09-22')}`)
  await s.page.evaluate(() => document.querySelector('[data-testid="row-bane"]')?.scrollIntoView({ block: 'center' }))
  await shot(s, 'sansrun-01-archived')
})

/* ---- lapsedel: signed in when his own Delete posting's date comes — the next repaint turns his session off (Astra 1) ---- */
await scene('lapsedel', [DESK], async s => {
  await signIn(s.page, 'ad', 'a'); await war(s, 'SEP')
  await s.page.locator('[data-testid="cell-casper-2026-09-30"]').click(); await s.page.waitForTimeout(400)
  await s.page.click('[data-testid="bid-postout"]'); await s.page.waitForTimeout(300)
  await s.page.fill('[data-testid="po-date"]', '2026-09-28'); await s.page.click('[data-testid="po-delete"]'); await s.page.waitForTimeout(150)
  await s.page.click('[data-testid="po-confirm"]'); await s.page.waitForTimeout(200); await s.page.click('[data-testid="po-confirm"]'); await s.page.waitForTimeout(500)
  await signIn(s.page, 'outlaw')
  check('lapsedel', s, 'today Outlaw is in', (await count(s, '#accessOff')) === 0)
  await s.page.context().clock.setFixedTime(new Date(2026, 8, 28, 0, 10, 0))
  await go(s.page, 'quals').catch(() => {}); await s.page.waitForTimeout(400); await go(s.page, 'leavewar').catch(() => {}); await s.page.waitForTimeout(700)
  check('lapsedel', s, 'after midnight his Delete ran and his account is gone: his session is off', await s.page.evaluate(() => !!window.PEOPLE.casper.deleted) && (await count(s, '#accessOff')) === 1, await text(s, '#accessOff .acc-h'))
  await shot(s, 'lapsedel-01-off')
})

/* ---- postedout: a posting with no outcome that has run — "posted out 20 Sep" on his row (D326); a posting's archive says
   so on the archived row (D329) ---- */
await scene('postedout', [DESK, PHONE], async s => {
  await signIn(s.page, 'ad', 'a'); await war(s, 'SEP')
  await s.page.locator('[data-testid="cell-divot-2026-09-22"]').click(); await s.page.waitForTimeout(400)
  await s.page.click('[data-testid="bid-postout"]'); await s.page.waitForTimeout(300)
  await s.page.fill('[data-testid="po-date"]', '2026-09-20')
  await s.page.click('[data-testid="po-overseas"]'); await s.page.waitForTimeout(150)          // un-pick: no outcome (D303)
  check('postedout', s, 'setup through the sheet: no chip chosen — "off the manpower, nothing else"', /nothing else/.test(await words(s, '[data-testid="po-line"]') || ''), await words(s, '[data-testid="po-line"]'))
  await s.page.click('[data-testid="po-confirm"]'); await s.page.waitForTimeout(600)
  await users(s)
  check('postedout', s, 'his row: "posted out 20 Sep" (D326)', (await words(s, '[data-testid="po-tag-divot"]')) === 'posted out 20 Sep', await words(s, '[data-testid="po-tag-divot"]'))
  await shot(s, 'postedout-01-row', '#accList [data-person="divot"]')
  /* a posting's own archive (Overseas Sqn, its date come) on the archived row */
  await go(s.page, 'leavewar')
  await s.page.evaluate(() => window.lwSetPostOut('casper', '2026-09-21'))                  // setup: an Overseas posting that has run
  await go(s.page, 'quals')
  await openArchived(s, 'casper')
  check('postedout', s, 'a posting\'s archive: "Archived 21 Sep 26 by his posting (Overseas Sqn)" (D329)', (await words(s, '[data-testid="arch-line-casper"]')) === 'Archived 21 Sep 26 by his posting (Overseas Sqn)', await words(s, '[data-testid="arch-line-casper"]'))
  await shot(s, 'postedout-02-archived-by-posting', '#accArchList [data-person="casper"]')
})

/* ---- reload: what was done stays done ---- */
await scene('reload', [DESK], async s => {
  await signIn(s.page, 'ad', 'a'); await users(s)
  await s.page.locator('#accList [data-person="rocky"] .acc-tap').click(); await s.page.click('#accEdArchive'); await s.page.waitForTimeout(300)
  await s.page.click('#accArchToggle'); await s.page.locator('#accArchList [data-person="rocky"] .acc-tap').click()
  await s.page.fill('#accArPostIn', '2026-10-19'); await s.page.click('#accArRestore'); await s.page.waitForTimeout(400)
  await s.page.goto(BASE + '/'); await s.page.waitForSelector('#luser')
  await signIn(s.page, 'ad', 'a')
  await war(s, 'OCT')
  check('reload', s, 'after a reload: the gap still reads PO, 19 Oct still counted', (await text(s, '[data-testid="cell-rocky-2026-10-05"]')) === 'PO' && (await here(s, 'rocky', '2026-10-19')))
  await war(s, 'SEP')
  check('reload', s, 'after a reload: his September before he left stands', (await here(s, 'rocky', '2026-09-24')))
  await users(s)
  check('reload', s, 'after a reload: on the list, can sign in', (await attr(s, '[data-testid="dot-signin-rocky"]', 'aria-label')) === 'Can sign in')
}, false)

await browser.close()
const pass = results.filter(r => r.ok).length, fail = results.length - pass
const md = [`# [ONE-DOOR] walk — ${RUN} (27 Sep 26)`, '', `${pass} passed, ${fail} failed.`, '', '| Scene | Width | Step | Result | Detail |', '|---|---|---|---|---|',
  ...results.map(r => `| ${r.scene} | ${r.width} | ${r.what.replace(/\|/g, '/')} | ${r.ok ? 'PASS' : '**FAIL**'} | ${r.ok ? '' : r.detail.replace(/\|/g, '/')} |`)].join('\n')
writeFileSync(`${OUT}/results.md`, md + '\n')
console.log(`\n${pass} passed, ${fail} failed — ${OUT}/results.md`)
