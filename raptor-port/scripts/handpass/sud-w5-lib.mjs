// sud-w5-lib — walker w5's own helpers for the D2338 walk (the look-ahead SANS note, the seat, the crowd, the published
// day), 23 Nov 26, chat 147. Built on asp-w2-lib (its world, sign-in, board, posting, ALL AVAIL window) and
// sfd-w1-lib's crew-panel steps. Nothing here writes to window.* — reads only.
import './sud-w5-env.mjs'
import path from 'node:path'
const L = await import('./asp-w2-lib.mjs')
const S = await import('./sfd-w1-lib.mjs')
export { L, S }
const { sleep, J, HEX } = L
export const OUT = L.OUT

export const NOTE17 = "SANS from Fri 17 Jul: no availability filed. It can be filed from that day on the Inputs page's SANS tab."
export const noteFrom = d => `SANS from ${d}: no availability filed. It can be filed from that day on the Inputs page's SANS tab.`
export const TODAYW = 'SANS — no availability filed for today'

/* run one scenario at one size in a fresh context; signs in as Saber */
export async function run(name, szKey, fn, when) {
  const sz = L.SIZES[szKey], W = L.mk(name, sz)
  const { b, ctx, p } = await L.world(sz, W, when)
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('today', "the app's today", null, await L.today(p))
    await fn(p, W, ctx)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
}

/* a picture cut round one element (scrolled into view inside its own scroller first) */
export async function clip(p, W, loc, step, pad = 60) {
  const l = typeof loc === 'string' ? p.locator(loc).first() : loc
  if (!(await l.count())) return ''
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })).catch(() => {})
  await sleep(250)
  const bb = await l.boundingBox().catch(() => null)
  if (!bb) return ''
  const vp = p.viewportSize()
  const x = Math.max(0, bb.x - pad * 3), y = Math.max(0, bb.y - pad)
  const w = Math.min(vp.width - x, bb.width + pad * 6), h = Math.min(vp.height - y, bb.height + pad * 2)
  if (w < 4 || h < 4) return ''
  const f = path.join(OUT, `${W.scn}-${step}-clip-${W.sz.name}.png`)
  await p.screenshot({ path: f, clip: { x, y, width: w, height: h } })
  return path.basename(f)
}

/* Hex's crew-list puck(s) under `root` (the board, or Edit Schedule's crew panel): where each stands, its title, data-why,
   the reason PRINTED under the name (a box wider than 1px), struck or not */
export const crewOf = (p, root, id = HEX) => p.evaluate(([root, id]) => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && r.left < window.innerWidth - 4 && r.right > 4 }
  const R = document.querySelector(root)
  if (!R) return { root: 'none' }
  const all = [...R.querySelectorAll(`.rpuck[data-person="${id}"]`)].filter(e => !e.closest('.availwin'))
  return {
    n: all.length,
    pucks: all.map(e => {
      const rw = e.querySelector('.rwhy')
      return {
        shown: vis(e),
        where: e.closest('.rsans') ? 'SANS Avail' : e.closest('.rcol') ? ((e.closest('.rcol').querySelector('.rh') || {}).innerText || 'col').replace(/\s+/g, ' ').trim() : '?',
        cls: e.className, title: e.getAttribute('title') || '', why: e.getAttribute('data-why') || '',
        printed: rw && vis(rw) ? (rw.textContent || '').trim() : '',
        struck: /(^|\s)no(\s|$)/.test(e.className),
      }
    }),
  }
}, [root, id])
export const crewLine = c => c && c.pucks ? c.pucks.map(x => `[${x.where}${x.shown ? '' : ' (hidden)'}${x.struck ? ', struck' : ''}] title "${x.title}"${x.printed ? ` printed "${x.printed}"` : ''}`).join(' ') : J(c)
export const firstShown = c => (c && c.pucks || []).find(x => x.shown) || (c && c.pucks || [])[0] || null

/* the phone board parks its crew list in a right-edge AIRCREW drawer: open / closed by its tab, as a person does */
const drawerOut = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-ros .ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 60 })
export async function boardDrawer(p, W, open) {
  if (!W.isPhone || !(await p.locator('#schedBoard .sb-ros .ros-tab').count())) return 'n/a'
  if ((await drawerOut(p)) !== open) { await W.press(p, '#schedBoard .sb-ros .ros-tab', open ? 'aircrew-open' : 'aircrew-close'); await sleep(500) }
  return (await drawerOut(p)) ? 'open' : 'closed'
}
/* the crew list of a day on the open board, read and pictured (cut round Hex's puck) */
export async function boardCrew(p, W, di, step) {
  await L.openBoard(p, W, di)
  await boardDrawer(p, W, true)
  const c = await crewOf(p, '#schedBoard')
  const pk = p.locator(`#schedBoard .rpuck[data-person="${HEX}"]:visible`).first()
  const pc = await clip(p, W, pk, step)
  const full = await W.pic(p, step)
  await boardDrawer(p, W, false)
  return { c, pic: [pc, full].filter(Boolean).join(', ') }
}
/* the Edit Schedule crew panel stepped to a weekday ('thu'), read and pictured */
export async function weekCrew(p, W, dow, step) {
  await L.closeBoard(p, W)
  await L.go(p, 'editsched')
  const day = await S.crewPanelTo(p, W, dow)
  const c = await crewOf(p, '.ros-body')
  const pk = p.locator(`.ros-body .rpuck[data-person="${HEX}"]`).first()
  const pc = await clip(p, W, pk, step)
  const full = await W.pic(p, step)
  await S.crewPanelClose(p, W)
  return { day, c, pic: [pc, full].filter(Boolean).join(', ') }
}

/* the bell, opened by a press, its lines read (the name in bold, the day, the words, struck words, unread); left open
   for the picture, closed by Escape at the start of the next step */
export async function bell(p, W, step) {
  const sel = (await p.locator('#sbBell:visible').count()) ? '#sbBell:visible' : '#notifyBell:visible'
  await W.press(p, sel, 'bell')
  await p.waitForSelector('[data-testid="bell-list"]', { timeout: 5000 }).catch(() => {})
  await sleep(400)
  const lines = await p.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(e => ({
    id: e.dataset.testid, unread: e.classList.contains('unread'),
    name: ((e.querySelector('.bl-name') || {}).textContent || '').trim(),
    day: ((e.querySelector('.bl-day') || {}).textContent || '').trim(),
    what: ((e.querySelector('.bl-what') || {}).textContent || '').replace(/ /g, ' ').trim(),
    struck: ((e.querySelector('.bl-struck') || {}).textContent || '').trim(),
  })))
  const empty = await p.locator('[data-testid="bell-empty"]').count()
  const pic = await W.pic(p, step)
  const sans = lines.filter(l => l.name === 'Your SANS availability')
  return { lines, sans, empty, pic }
}
export async function bellClose(p) { if (await p.locator('[data-testid="bell-list"]').count()) { await p.keyboard.press('Escape'); await sleep(300) } }
export const bellLine = r => r.sans.length ? r.sans.map(l => `"${l.name} | ${l.day} | ${l.struck ? '~' + l.struck + '~ · ' : ''}${l.what}"${l.unread ? ' (unread)' : ' (read)'}`).join(' + ') : `no SANS line (${r.lines.length} lines${r.empty ? ', "Nothing new"' : ''})`

/* sign out, sign in as someone else (the same browser storage) */
export async function as(p, W, user, pass) {
  /* a SANS day's window left open after a save covers the phone's menu button: closed by its ✕ first */
  await closeSansWin(p, W); await bellClose(p); await L.closeBoard(p, W)
  await L.signOut(p, W)
  await L.signIn(p, user, pass)
  /* who is signed in, read off the top bar's badge ("Hex · Member") — the board covers it, so read it here */
  return ((await p.locator('#roleBadge').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
}
/* the clock moved to a new time (setSystemTime), the page reloaded, signed in again as `user` if asked */
export async function moveClock(p, W, when, user = 'ad', pass = 'a') {
  await p.clock.setSystemTime(new Date(when))
  await p.reload(); await sleep(1500)
  if (await p.locator('#luser:visible').count()) await L.signIn(p, user, pass)
  return L.today(p)
}

/* ---- the SANS calendar ---- */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function sansTab(p, W, iso) {
  await L.go(p, 'inputs')
  await W.press(p, '#inSansMode:visible', 'sans-tab')
  await p.waitForSelector('[data-testid="sanscal"]')
  const y = +iso.slice(0, 4), m = +iso.slice(5, 7)
  for (let i = 0; i < 24; i++) {
    const t = ((await p.locator('[data-testid="sc-month"]').first().innerText()) || '').trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+t[1] * 12 + MONTHS.findIndex(x => x.startsWith(t[0])))
    if (!d) break
    await W.press(p, d > 0 ? '[data-testid="sc-next"]' : '[data-testid="sc-prev"]', 'month')
    await sleep(500)
  }
  await sleep(400)
  return ((await p.locator('[data-testid="sc-month"]').first().innerText()) || '').trim()
}
/* a SANS day opened (its window) */
export async function sansDay(p, W, iso) {
  await sansTab(p, W, iso)
  await W.press(p, `[data-testid="sc-day-${iso}"]`, 'sc-day')
  await p.waitForSelector('[data-testid="win-sansday"]', { timeout: 5000 })
  await sleep(400)
}
/* "+ Commitment" on a day: who (an admin's pick; null = the man himself), kinds ['fly','oft','amt'], span 'all' or
   ['09:00','10:00']; save or cancel. Returns the new record's id (the difference of ids), the window's person list. */
export async function commit(p, W, iso, who, kinds, span, step, action = 'save') {
  await sansDay(p, W, iso)
  const add = p.locator('[data-testid="win-sansday"] [data-testid="sd-add"]').first()
  const dis = await add.isDisabled().catch(() => null)
  const addWhy = ((await p.locator('[data-testid="sd-addwhy"]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
  if (dis) return { disabled: true, addWhy, pic: await W.pic(p, step + '-add-off') }
  const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  await W.press(p, add, 'sd-add')
  await p.waitForSelector('#inpEditPop', { timeout: 5000 })
  const opts = await p.locator('#inpEditPerson option').evaluateAll(os => os.map(o => o.value + ':' + o.textContent.trim())).catch(() => [])
  const fixed = ((await p.locator('#inpEditPersonFixed').first().innerText().catch(() => '')) || '').trim()
  if (Array.isArray(who)) {
    /* several people: the picker's "Several people" switch, then each puck pressed until exactly `who` is picked */
    await W.press(p, '[data-testid="pp-several"]:visible', 'pp-several'); await sleep(300)
    for (let i = 0; i < 3; i++) {
      const on = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop .pp-puck.on')].map(e => e.dataset.pp))
      const flip = [...on.filter(x => !who.includes(x)), ...who.filter(x => !on.includes(x))]
      if (!flip.length) break
      for (const id of flip) {
        const b = p.locator(`#inpEditPop .pp-puck[data-pp="${id}"]`).first()
        if (!(await b.count())) { const pic = await W.pic(p, step + '-noperson'); await W.press(p, '#inpEditCancel:visible', 'cancel'); return { noPerson: true, opts: on, pic } }
        await W.press(p, b, 'pp-' + id)
      }
    }
  } else if (who) {
    if (!opts.some(o => o.startsWith(who + ':'))) { const pic = await W.pic(p, step + '-noperson'); await W.press(p, '#inpEditCancel:visible', 'cancel'); return { noPerson: true, opts, pic } }
    await p.selectOption('#inpEditPerson', who); await sleep(200)
  }
  /* each of the three boxes set to exactly what is asked (the window opens with Fly ticked) */
  for (const k of ['fly', 'oft', 'amt']) {
    const label = { fly: 'Fly', oft: 'OFT', amt: 'AMT' }[k]
    const cb = p.locator('#inpEditSans label', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).locator('input').first()
    if ((await cb.isChecked()) !== kinds.includes(k)) { if (W.isPhone) await cb.tap(); else await cb.click(); await sleep(150) }
  }
  if (Array.isArray(span)) {
    await W.press(p, '#inpEditSpan [data-span="custom"]', 'span-custom')
    await p.fill('#inpEditStart', span[0]); await p.fill('#inpEditEnd', span[1])
  } else if (await p.locator('#inpEditSpan [data-span="all"]').count()) {
    const on = await p.locator('#inpEditSpan [data-span="all"]').getAttribute('aria-pressed')
    if (on !== 'true') await W.press(p, '#inpEditSpan [data-span="all"]', 'span-all')
  }
  const pic0 = await W.pic(p, step + '-form')
  if (action === 'cancel') {
    await W.press(p, '#inpEditCancel:visible', 'cancel'); await sleep(400)
    const after = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
    return { cancelled: true, added: after.filter(x => !before.includes(x)), opts, fixed, pic: pic0 + ', ' + await W.pic(p, step + '-cancelled') }
  }
  await W.press(p, '#inpEditSave:visible', 'save'); await sleep(700)
  const after = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  const iid = after.filter(x => !before.includes(x))[0] || null
  const rec = iid ? await p.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return { person: r.person || (Array.isArray(r.people) ? r.people.map(x => x.p || x).join(',') : r.who), date: r.date, sans: r.sans, allday: r.allday, s: r.s, e: r.e, keys: Object.keys(r).join('/') } }, iid) : null
  const pic = await W.pic(p, step + '-saved')
  return { iid, rec, opts, fixed, pic: pic0 + ', ' + pic }
}
/* a filed commitment opened from its SANS day and deleted (the window's Delete) */
export async function uncommit(p, W, iso, iid, step) {
  await sansDay(p, W, iso)
  const row = p.locator(`[data-testid="win-sansday"] [data-popiid="${iid}"] [data-testid="sd-open"]`).first()
  if (!(await row.count())) return { ok: false, why: 'no such line on the day', pic: await W.pic(p, step + '-noline') }
  await W.press(p, row, 'sd-open')
  await p.waitForSelector('#inpEditDel', { timeout: 5000 })
  const pic0 = await W.pic(p, step + '-open')
  await W.press(p, '#inpEditDel:visible', 'delete'); await sleep(700)
  const gone = await p.evaluate(i => !(window.INPUTS || []).some(r => r.iid === i), iid)
  return { ok: gone, pic: pic0 + ', ' + await W.pic(p, step + '-deleted') }
}
export async function closeSansWin(p, W) {
  const x = p.locator('[data-testid="win-sansday-x"]:visible').first()
  if (await x.count()) { await W.press(p, x, 'sansday-x'); await sleep(300) }
}

/* ---- the board: a flying wave on a day (+ Wave → Flying wave), times typed ---- */
export async function addWave(p, W, di, cs, to, ld) {
  await L.openBoard(p, W, di)
  await W.press(p, L.B(`[data-wvadd="${di}"]`), 'wvadd')
  const fw = p.getByRole('button', { name: 'Flying wave', exact: true }).first()
  await W.press(p, fw, 'flying-wave'); await sleep(700)
  const wi = await p.evaluate(i => window.DAYS[i].waves.length - 1, di)
  for (const [k, v] of [['cs', cs], ['to', to], ['ld', ld]]) await L.typeBox(p, W, `[data-bfld="ff:${di}.${wi}.0.${k}"]`, v)
  const f = await p.evaluate(([i, w]) => { const x = window.DAYS[i].waves[w].formations[0]; return { cs: x.cs, to: x.to, ld: x.ld, n: x.aircraft.length } }, [di, wi])
  return { wi, f }
}
/* a sim row (+ on OFT / AMT), its label and times typed */
export async function addSim(p, W, di, kind, label, str, end) {
  await L.openBoard(p, W, di)
  await W.press(p, L.B(`[data-sradd="${di}.${kind}"]`), 'sradd-' + kind); await sleep(400)
  const ri = await p.evaluate(([i, k]) => window.DAYS[i].sims[k].length - 1, [di, kind])
  await L.typeBox(p, W, `[data-bfld="sr:${di}.${kind}.${ri}.label"]`, label).catch(() => {})
  await L.typeBox(p, W, `[data-bfld="sr:${di}.${kind}.${ri}.str"]`, str)
  await L.typeBox(p, W, `[data-bfld="sr:${di}.${kind}.${ri}.end"]`, end)
  const r = await p.evaluate(([i, k, n]) => { const x = window.DAYS[i].sims[k][n]; return { label: x.label, str: x.str, end: x.end } }, [di, kind, ri])
  return { ri, r }
}
/* arm a place on the open board (a seat's own box, or a row's people box at its "+ add" mark), read Hex's crew puck */
export async function armRead(p, W, sel, step) {
  const zone = p.locator(L.B(sel)).first()
  if (!(await zone.count())) return { armed: null, c: null, pic: await W.pic(p, step + '-nozone') }
  await zone.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  const addz = zone.locator('.addz').first()
  const ab = (await addz.count()) ? await addz.boundingBox() : null
  const zb = await zone.boundingBox()
  const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
  if (W.isPhone) { await zone.tap({ position: pos }); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${step}-arm-now-phone.png`) }).catch(() => {}) }
  else await zone.click({ position: pos })
  await sleep(500)
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  const c = await crewOf(p, '#schedBoard')
  const pk = p.locator(`#schedBoard .rpuck[data-person="${HEX}"]:visible`).first()
  const pc = await clip(p, W, pk, step)
  const full = await W.pic(p, step)
  return { armed, c, pic: [pc, full].filter(Boolean).join(', ') }
}
export async function disarm(p, W) {
  if (await p.evaluate(() => !!(window.ARM && window.ARM.key))) { await p.keyboard.press('Escape'); await sleep(300) }
  if (W) await boardDrawer(p, W, false)
  return p.evaluate(() => !!(window.ARM && window.ARM.key))
}

/* the posted-out sheet of Hex (tap his PO cell), its date moved to `iso` through the app's own date box; ✕ to close */
export async function movePosting(p, W, cellIso, iso, step) {
  const c = (await L.lwCell(p, W, HEX, cellIso)).cell
  if (!c) return { ok: false, why: 'no cell' }
  await W.press(p, c, 'po-cell')
  await sleep(400)
  let route = 'cell'
  if (!(await p.locator('[data-testid="postout-sheet"]:visible').count())) {
    if (await p.locator('[data-testid="bid-more"]:visible').count()) {
      await W.press(p, '[data-testid="bid-more"]:visible', 'more'); await W.press(p, '[data-testid="bid-postout"]:visible', 'postout'); route = 'bid window → ⋯ → Post out'
    }
  }
  const has = await p.locator('[data-testid="postout-sheet"]:visible').count()
  const pic0 = await W.pic(p, step + '-sheet')
  if (!has) return { ok: false, why: 'no posted-out sheet', route, pic: pic0 }
  const lineBefore = ((await p.locator('[data-testid="postout-line"]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ')
  await W.press(p, '[data-testid="postout-date"]:visible', 'po-date')
  const day = p.locator(`[data-iso="${iso}"]:visible`).first()
  if (await day.count()) await W.press(p, day, 'po-day')
  await sleep(600)
  const lineAfter = ((await p.locator('[data-testid="postout-line"]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ')
  const err = ((await p.locator('[data-testid="postout-err"]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ')
  const pic1 = await W.pic(p, step + '-moved')
  await W.press(p, '[data-testid="postout-cancel"]:visible', 'po-x'); await sleep(400)
  const rec = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null } }, HEX)
  return { ok: true, route, lineBefore, lineAfter, err, rec, pic: pic0 + ', ' + pic1 }
}
export const sleep_ = sleep
