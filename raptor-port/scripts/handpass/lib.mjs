/* Shared driver for the OIL hand pass (21 Sep 26).
   Drives the REAL production bundle in a real Chromium, exactly as
   raptor-port/CLAUDE.md §Build & verify prescribes. Pictures go to disk so the
   evidence sheet has something to show. */
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

export const SHOTS = process.env.HP_SHOTS
  || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-21-oil'
export const BASE = process.env.HP_URL || 'http://localhost:4173'
/* the drivers read the app's probe bridge, which exists on THIS PC only since [ACCOUNTS]
   (26 Sep 26 — src/main.tsx): refuse a deployed URL rather than report missing
   behaviour that is really a missing bridge (Astra R2-5) */
{ const h = new URL(BASE).hostname
  if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(h)) throw new Error(`HP_URL must be a local build (localhost): the probe bridge the drivers read is not installed on ${h}`) }

export const STATE = process.env.HP_STATE
  || 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat.json'

/** A saved world is keyed to the ORIGIN it was captured on, because that is how
    browser storage is partitioned. Loading one against a different port restores
    NOTHING and the app renders a perfectly valid EMPTY day — which reads exactly
    like a legitimate "nobody earns here" result. That is a false PASS waiting to
    happen (it nearly was one, 22 Sep 26), so it is refused here rather than
    documented. To drive on another port, re-save the state against that port.  */
function assertStateOrigin(state) {
  let j
  try { j = JSON.parse(readFileSync(state, 'utf8')) } catch { return }   // not a state file we wrote; let Playwright complain
  const origins = (j.origins || []).map(o => String(o.origin || ''))
  if (!origins.length || origins.includes(BASE)) return
  throw new Error(
    `The saved world was captured on ${origins.join(', ')} but the driver is pointed at ${BASE}.
` +
    `Browser storage is per-origin, so this would restore an EMPTY world that looks like a real result.
` +
    `Either serve the build on ${origins[0]}, or set HP_URL to it, or re-save the state against ${BASE}.`)
}

/** `state` loads a saved world (the built Saturday) so a scenario starts in
    two seconds instead of rebuilding the day for seventy. */
export async function open({ width = 1440, height = 900, who = 'a', fresh = false, state = null } = {}) {
  if (state) assertStateOrigin(state)
  mkdirSync(SHOTS, { recursive: true })
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({ viewport: { width, height }, ...(state ? { storageState: state } : {}) })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + (fresh ? '/?fresh=1' : '/'))
  /* Smooth scrolling makes Playwright call every target "not stable"; the app's
     own scroll-behavior is a comfort setting, not a contract under test. */
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who)
  return { browser, ctx, page, errors }
}

export async function login(page, who = 'a') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who === 'a' ? 'ad' : 'us')
  await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
}

export async function go(page, to) {
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p, to)
  await page.waitForTimeout(400)
}

/** Close the scheduler board through its own ✕ Close control. */
export async function closeBoard(page) {
  if (!(await page.locator('#schedBoard').count())) return false
  const x = page.locator('#schedBoard').getByRole('button', { name: /Close/ }).first()
  if (await x.count()) { await x.click(); await page.waitForTimeout(600) }
  else { await page.keyboard.press('Escape'); await page.waitForTimeout(500) }
  return true
}

/** Open the scheduler board for day index di through its own door on the week.
    An already-open board covers the week, so it is closed first. */
export async function board(page, di) {
  const openDay = await page.evaluate(() => (document.querySelector('#schedBoard') ? window.SBDAY : null))
  if (openDay === di) return
  if (openDay != null) await closeBoard(page)
  await go(page, 'editsched')
  await page.click(`#eWeek [data-sbday="${di}"]:visible`)
  await page.waitForSelector('#schedBoard')
  await page.waitForTimeout(500)
}

/** THE PERSONAL INPUTS PANEL IS FOLDED BY DEFAULT, and folded it renders NO
    ROWS — so a claim's own edit button (`data-inpedit`) is ABSENT from the DOM,
    not merely hidden. That cost the 21 Sep session job 1's last mile: it
    measured zero buttons and concluded the button was never drawn. The header
    is the toggle (`data-pitog`, sbInputsGroupPanel in ui/board-html.ts).

    The fold is `!readOnly`, so a read-only board keeps the panel OPEN — which
    is why the rows do appear once the OIL mode is on, with the edit button
    correctly swapped for the OIL cell. Call this before reaching for any
    request row on the board. */
export async function openInputs(page, di) {
  /* `data-pitog` rides the header in BOTH states, so its presence says nothing
     about which way the panel is folded — pressing on that would SHUT an open
     one. The rows are the honest signal: folded draws none at all. */
  const rows = () => page.evaluate(() =>
    document.querySelectorAll('#schedBoard .pinp .sb-arow, #schedBoard .pinp .sbi-row').length)
  if (await rows()) return await rows()
  if (await page.locator(`#schedBoard [data-pitog="${di}"]:visible`).count()) {
    await tap(page, `[data-pitog="${di}"]`)
    await page.waitForTimeout(500)
  }
  return await rows()
}

/** The board is rendered TWICE in the DOM (the desktop board and the phone
    board), so a bare attribute selector matches a hidden twin as well as the
    real one. Everything here goes through the visible copy. */
export const V = (sel) => sel.split(',').map(s => s.trim() + ':visible').join(', ')

/* The SAME data-slot / data-bfld keys exist on the edit WEEK behind the board
   overlay, so a page-wide selector can click the copy nobody can see. Every
   board action is scoped to #schedBoard, and the crew palette to the board's
   own #sbRoster. */
export const B = (sel) => sel.split(',').map(s => '#schedBoard ' + s.trim() + ':visible').join(', ')

/** Click a board control. A real mouse press at the element's own centre —
    but the board's sticky top bar and roster panel overlay parts of the page,
    so bring the target to the MIDDLE of the window first and, if something is
    still on top of it, press where the element actually is rather than giving
    up. */
export async function tap(page, sel, n = 0) {
  const inBoard = await page.locator('#schedBoard').count()
  const el = page.locator(inBoard ? B(sel) : V(sel)).nth(n)
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(120)
  try {
    await el.click({ timeout: 2500 })
  } catch {
    /* the board's sticky top bar sits over the middle of the window, so bring
       the target LOWER and press it where it actually is */
    await el.evaluate(e => {
      const r = e.getBoundingClientRect()
      window.scrollBy(0, r.top - window.innerHeight * 0.68)
    })
    await page.waitForTimeout(150)
    const box = await el.boundingBox()
    if (!box) throw new Error('no box for ' + sel)
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  }
  await page.waitForTimeout(260)
}

/** Same press, but by index within the visible matches. */
export async function tapNth(page, sel, idx) {
  return tap(page, sel, idx)
}

/** Type into one of the board's string-built fields and commit it. */
export async function type(page, sel, value) {
  const inBoard = await page.locator('#schedBoard').count()
  const el = page.locator(inBoard ? B(sel) : V(sel)).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(100)
  await el.click({ force: true })
  await el.fill('')
  await el.type(String(value), { delay: 8 })
  await el.blur()
  await page.waitForTimeout(220)
}

/** Arm a seat / fill-zone and drop the first offered person from `prefs`.
    Verifies: the arm actually took, the palette offered the person, and the
    seat is filled afterwards. Returns 'pid' on success, 'FAILED …' otherwise —
    a silent miss here would quietly gut the fixture. */
export async function put(page, armSel, prefs) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await tap(page, armSel)
    await page.waitForTimeout(220)
    const armed = await page.evaluate(() => window.ARM && window.ARM.key)
    if (!armed) continue
    let picked = null
    for (const pid of prefs) {
      const inBoard = await page.locator('#sbRoster').count()
      const p = page.locator(`${inBoard ? '#sbRoster' : '#eRoster'} .rpuck[data-person="${pid}"]:visible`).first()
      if (!(await p.count()) || !(await p.isVisible())) continue
      await p.evaluate(e => e.scrollIntoView({ block: 'center' }))
      await page.waitForTimeout(100)
      try { await p.click({ timeout: 2500 }) }
      catch { const b = await p.boundingBox(); if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
      await page.waitForTimeout(350)
      picked = pid
      break
    }
    if (!picked) { await page.keyboard.press('Escape'); return 'FAILED nobody offered for ' + armSel }
    const filled = await page.evaluate(([sel, pid]) => {
      const root = document.querySelector('#schedBoard') || document
      const seats = [...root.querySelectorAll(sel)]
      return seats.some(seat => !!seat.querySelector(`[data-person="${pid}"]`) || seat.dataset.person === pid)
    }, [armSel, picked])
    if (filled) return picked
  }
  return 'FAILED ' + armSel
}

export async function shot(page, name, locator) {
  const file = `${SHOTS}/${name}.png`
  if (locator) await locator.screenshot({ path: file })
  else await page.screenshot({ path: file, fullPage: false })
  return file
}

/** Everything the money and the marks depend on, read straight off the app. */
export async function readDay(page, di) {
  return page.evaluate(i => {
    const d = window.DAYS[i]
    const P = window.PEOPLE
    const cs = id => (P[id] && P[id].cs) || id || ''
    /* the crew palette is inside the board too — it is a source of pucks to
       drag, not a place a man is scheduled, so it never counts here */
    const pucks = [...document.querySelectorAll('#schedBoard [data-person]')]
      .filter(e => e.classList.contains('puck') && !e.closest('#sbRoster') && !e.closest('#eRoster'))
      .map(e => ({
        who: cs(e.dataset.person),
        id: e.dataset.person,
        bar: e.className.match(/oilbar-(fo|ho)/)?.[1] || (e.className.includes('oilbar') ? 'plain' : null),
        cls: e.className,
        title: e.getAttribute('title') || '',
      }))
    return {
      waves: d.waves.map(w => ({ label: w.label, kind: w.kind, sa: w.sa,
        f: w.formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld,
          ac: f.aircraft.map(a => `${cs(a.p)}/${cs(a.w)}${a.role ? ':' + a.role : ''}`) })) })),
      duties: d.dutywaves.map(b => ({ label: b.label, sa: b.sa,
        rows: b.rows.map(r => `${r.role}|${r.str}-${r.end}|${cs(r.id)}`) })),
      sims: { oft: d.sims.oft.map(s => `${s.label}|${s.str}-${s.end}|${cs(s.p)}/${cs(s.w)}`),
              amt: d.sims.amt.map(s => `${s.label}|${s.str}-${s.end}|${(s.pax || []).map(cs).join(',')}`) },
      ground: d.ground.map(g => `${g.prog}|${g.str}-${g.end}|${cs(g.who)}${g.info ? '|INFO' : ''}${g.cx ? '|CX' : ''}`),
      prog: d.allhands.map(a => `${a.prog}|${a.str}-${a.end}|${Array.isArray(a.who) ? a.who.map(cs).join(',') : cs(a.who)}`),
      pucks,
      warn: [...document.querySelectorAll('#sbSide .sb-warn li, #sbSide .warn, #sbSide [data-daywarn], #sbWarn li, #sbWarn .wrow')]
        .map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 14),
      version: (document.querySelector('#schedBoard .verchip') || {}).innerText || '',
      pending: (document.querySelector('#schedBoard [data-alcount], #schedBoard .alchip') || {}).innerText || '',
    }
  }, di)
}


/** Sign all four roles and publish the day, through the real controls. */
export async function publish(page, di) {
  const sels = page.locator(`#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(400)
  /* a first publication uses Publish day (data-beak); once the day is out, the
     amendment goes through Publish AL# (data-alpub) instead. */
  let beak = page.locator(`#schedBoard [data-beak="${di}"]:visible`).first()
  if (!await beak.count()) beak = page.locator(`#schedBoard [data-alpub="${di}"]:visible`).first()
  if (!await beak.count()) return { published: false, why: 'no publish button on the day', signSelects: n }
  const label = (await beak.innerText()).trim()
  const locked = await beak.isDisabled()
  if (locked) return { published: false, why: label, signSelects: n }
  await beak.click()
  await page.waitForTimeout(900)
  // a confirm may follow
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.click(); await page.waitForTimeout(900) }
  const ver = await page.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '')
  return { published: true, version: ver, signSelects: n }
}

/** What the day's sign-off strip and publish button look like right now. */
export async function signState(page, di) {
  return page.evaluate(i => {
    const b = document.querySelector('#schedBoard')
    const beak = b.querySelector(`[data-beak="${i}"]`)
    return {
      beak: beak ? { text: beak.innerText.trim(), disabled: beak.disabled, title: beak.title } : null,
      selects: [...b.querySelectorAll('select')].filter(s => s.closest('.sb-sign, .signrow, [class*=sign]'))
        .map(s => ({ cls: s.className, val: s.value })),
      chip: (b.querySelector('.verchip') || {}).innerText || '',
    }
  }, di)
}


/** The day's warning list, as a scheduler reads it. */
export async function warnings(page) {
  return page.evaluate(() => {
    const side = document.querySelector('#sbSide')
    if (!side) return { head: null, lines: [] }
    const txt = (side.innerText || '')
    const cut = txt.indexOf('PLACEHOLDERS')
    const head = (cut > 0 ? txt.slice(0, cut) : txt).split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    return { head: head[0] || null, lines: head.slice(1).filter(l => l !== '✕' && l !== '·') }
  })
}

/** Turn the OIL Earn mode on or off through the desktop button. */
export async function oilMode(page, on = true) {
  const btn = page.locator('#sbOil')
  const isOn = await page.evaluate(() => !!(window.OILDAY != null || document.querySelector('#schedBoard [data-oilitem]')))
  if (isOn !== on) { await btn.click(); await page.waitForTimeout(700) }
  return page.evaluate(() => ({
    items: document.querySelectorAll('#schedBoard [data-oilitem]').length,
    people: document.querySelectorAll('#schedBoard [data-oilp]').length,
    bar: (((document.querySelector('#schedBoard .sb-daybar, #schedBoard .sb-top') || {}).innerText) || '').replace(/[\r\n]+/g, ' | ').slice(0, 260),
  }))
}

/** The Leave War grid: what a man's day cell actually says. Money, not screen. */
export async function lwCell(page, personIds, iso = '2026-07-18') {
  await go(page, 'leavewar')
  await page.waitForTimeout(1200)
  const mon = page.locator(`[data-testid="month-${new Date(iso).toLocaleString('en', { month: 'short' }).toUpperCase()}"]`)
  if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(1200) }
  return page.evaluate(([ids, d]) => {
    const P = window.PEOPLE
    const out = {}
    for (const id of ids) {
      const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`)
      out[(P[id] && P[id].cs) || id] = c ? { text: (c.innerText || '').trim(), cls: c.className.slice(0, 70) } : 'NO CELL DRAWN'
    }
    return out
  }, [personIds, iso])
}

/** Every automatic OIL credit the war is holding for a date, read off the store. */
export async function credits(page, iso = '2026-07-18') {
  return page.evaluate(d => {
    const P = window.PEOPLE
    const w = window.LW || window.__LW || null
    const recs = []
    try {
      const all = (window.lwWorld && window.lwWorld()) || null
      if (all) return 'store not exposed'
    } catch {}
    return recs.length ? recs : 'read the grid instead'
  }, iso)
}
