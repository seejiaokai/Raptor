/* THE [ONE-DOOR] WALK (27 Sep 26) — the real production bundle in a real Chromium, desktop and phone, a fresh demo world
   per scene, every step an ASSERTION of the right behaviour (a PASS means correct), so re-running it on a fixed build IS
   the re-walk (bug-check order §5). Pictures to docs/img/handpass/2026-09-27-one-door/<run>/; the results to
   <run>/results.md. Built from Fable's scenario design (docs/superpowers/briefs/2026-09-27-one-door-scenarios.md) and
   the plan's §4. Run from raptor-port/ with the preview on 4178:
     HP_URL=http://localhost:4178 HP_RUN=walk1 node scripts/handpass/od-walk.mjs [scene…]
   Scenes: users, states, archive, restore, published, sans, sheets, quals, welcome, doors, reload. */
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
const count = (s, sel) => s.page.locator(sel).count()
const cellCls = (s, id, d) => attr(s, `[data-testid="cell-${id}-${d}"]`, 'class')
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
  await shot(s, 'archive-01-group')
  await war(s, 'SEP')
  check('archive', s, 'war: here on 25 Sep (his past kept)', !/\bgone\b/.test(await cellCls(s, 'rocky', '2026-09-25') || ''), await cellCls(s, 'rocky', '2026-09-25'))
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
  check('restore', s, 'war: counted again from 19 Oct', !/\bgone\b/.test(await cellCls(s, 'rocky', '2026-10-19') || ''))
  await s.page.evaluate(() => document.querySelector('[data-testid="row-rocky"]')?.scrollIntoView({ block: 'center' }))
  await shot(s, 'restore-03-war-gap')
  await war(s, 'SEP')
  check('restore', s, 'war: his September before he left stands', !/\bgone\b/.test(await cellCls(s, 'rocky', '2026-09-24') || ''))
  /* the same day reopens (no boundary) — a second man */
  await users(s)
  await s.page.locator('#accList [data-person="casper"] .acc-tap').click(); await s.page.click('#accEdArchive'); await s.page.waitForTimeout(300)
  await s.page.click('#accArchToggle'); await s.page.locator('#accArchList [data-person="casper"] .acc-tap').click()
  await s.page.click('#accArRestore'); await s.page.waitForTimeout(350)
  await war(s, 'SEP')
  check('restore', s, 'restored the same day: no PO corner, never away', !/pofin|\bgone\b/.test((await cellCls(s, 'casper', '2026-09-26') || '') + (await cellCls(s, 'casper', '2026-09-28') || '')))
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

/* ---- sans: a SANS man hidden (Show SANS off) with a past keeps his row after Archive ---- */
await scene('sans', [DESK], async s => {
  await signIn(s.page, 'ad', 'a')
  await go(s.page, 'quals'); await s.page.click('#qViewW'); await s.page.click('#qEdit'); await s.page.waitForTimeout(200)
  await s.page.evaluate(() => { const c = document.querySelector('#qtbl [data-q="rocky|san"]'); c && c.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
  await s.page.click('#qSave').catch(() => {}); await s.page.waitForTimeout(300)
  await war(s, 'SEP')
  check('sans', s, 'a SANS man is hidden from the war (Show SANS off)', (await count(s, '[data-testid="row-rocky"]')) === 0)
  await users(s)
  await s.page.locator('#accList [data-person="rocky"] .acc-tap').click(); await s.page.click('#accEdArchive'); await s.page.waitForTimeout(400)
  check('sans', s, 'Archive went through for a hidden SANS man', await s.page.evaluate(() => window.PEOPLE.rocky.archived))
  await war(s, 'SEP')
  await shot(s, 'sans-01-after-archive')
  const shown = await count(s, '[data-testid="row-rocky"]')
  check('sans', s, `his row (with a past on the war, or not — the delete's rule): ${shown ? 'kept, hatched from today' : 'no row (no past record)'}`, true)
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
  await shot(s, 'welcome-01-note')
  await s.page.click('#welcomeCheck'); await s.page.waitForTimeout(500)
  check('welcome', s, 'Check my quals: Quals, his own row outlined', (await s.page.evaluate(() => window.CURPAGE)) === 'quals' && (await count(s, '#qtbl tr.back-hl td.qname[data-person="rocky"]')) === 1)
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
  check('doors', s, 'war: Newface not yet here on 4 Oct, here from 5 Oct', /\bgone\b/.test(await cellCls(s, id, '2026-10-04') || '') && !/\bgone\b/.test(await cellCls(s, id, '2026-10-05') || ''))
  await users(s)
  await s.page.fill('#accAddCs', 'Groundy'); await s.page.selectOption('#accAddSeat', 'GND'); await s.page.fill('#accAddPostIn', '2026-10-01')
  await shot(s, 'doors-02-add', '#accAddBlock')
  await s.page.click('#accAdd'); await s.page.waitForTimeout(400)
  const g = await s.page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Groundy'))
  check('doors', s, 'Add a person (no sign-in): on the list, grey Sign-in', !!g && (await attr(s, `[data-testid="dot-signin-${g}"]`, 'aria-label')) === 'No sign-in')
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
  check('reload', s, 'after a reload: the gap still reads PO, 19 Oct still counted', (await text(s, '[data-testid="cell-rocky-2026-10-05"]')) === 'PO' && !/\bgone\b/.test(await cellCls(s, 'rocky', '2026-10-19') || ''))
  await war(s, 'SEP')
  check('reload', s, 'after a reload: his September before he left stands', !/\bgone\b/.test(await cellCls(s, 'rocky', '2026-09-24') || ''))
  await users(s)
  check('reload', s, 'after a reload: on the list, can sign in', (await attr(s, '[data-testid="dot-signin-rocky"]', 'aria-label')) === 'Can sign in')
}, false)

await browser.close()
const pass = results.filter(r => r.ok).length, fail = results.length - pass
const md = [`# [ONE-DOOR] walk — ${RUN} (27 Sep 26)`, '', `${pass} passed, ${fail} failed.`, '', '| Scene | Width | Step | Result | Detail |', '|---|---|---|---|---|',
  ...results.map(r => `| ${r.scene} | ${r.width} | ${r.what.replace(/\|/g, '/')} | ${r.ok ? 'PASS' : '**FAIL**'} | ${r.ok ? '' : r.detail.replace(/\|/g, '/')} |`)].join('\n')
writeFileSync(`${OUT}/results.md`, md + '\n')
console.log(`\n${pass} passed, ${fail} failed — ${OUT}/results.md`)
