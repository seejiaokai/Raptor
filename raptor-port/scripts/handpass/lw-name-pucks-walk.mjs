// THE WALK of [LW-NAME-PUCKS] (his D1468–D1471, D1476 — 28 Oct 26): the Leave War grid's names as the schedule's own
// puck. Written as assertions of the RIGHT behaviour, so re-running it on a fixed build IS the re-walk (bug-check order
// §5). On his iPhone's 402 x 874 (WebKit, scale 3) and his PC's 1536 x 860 at 125% (Chromium), admin and member:
//   1. every drawn name is a puck holding .nm and its chip; no old bar or badge; the chip whole inside the puck and the
//      puck inside its column (a phone's frozen copy too); names that fade are counted
//   2. every KIND (pilot, WSO, ground, OCU, each CAT, SXO, instructor) — the puck's fill and the chip's text/fill
//      measured, a pilot's and a WSO's fill the same as the schedule's own puck on View-only Sched (lesson 9 of §7.11)
//   3. a tap on a chip with qualifications lists them (a picture right after the tap and settled — D1281); a second tap
//      closes it; a tap on the name opens his window, which closes
//   4. the member's own row: the accent ring on his puck
//   5. Rearrange (admin): the grip beside the puck, the puck still whole
// Run from raptor-port/ against the build served on PORT (default 4173): node scripts/handpass/lw-name-pucks-walk.mjs
// OUT names the picture folder (default docs/img/handpass/2026-10-28-lw-name-pucks/walk).
import { webkit, chromium, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve(process.env.OUT || 'docs/img/handpass/2026-10-28-lw-name-pucks/walk')
mkdirSync(OUT, { recursive: true })
const results = []
const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')) }

async function open(browser, ctxOpts, who) {
  const ctx = await browser.newContext(ctxOpts)
  const P = await ctx.newPage()
  P.on('pageerror', e => ok('no page error', false, String(e).slice(0, 160)))
  P.on('console', m => { if (m.type() === 'error') ok('no console error', false, m.text().slice(0, 160)) })
  await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
  await P.fill('#luser', who[0]); await P.fill('#lpass', who[1]); await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  return P
}
async function toWar(P) {
  await P.evaluate(() => window.go('leavewar'))
  await P.waitForSelector('.mx .who .whoedit .puck'); await P.waitForTimeout(800)
}
// the schedule's own pilot and WSO puck fills, read off View-only Sched
async function schedFills(P) {
  return P.evaluate(() => {
    const pk = [...document.querySelectorAll('#vWeek .puck[data-person]')]
    const f = pk.find(e => !e.classList.contains('r') && !e.classList.contains('pers') && !e.classList.contains('me') && !e.classList.contains('allavail'))
    const w = pk.find(e => e.classList.contains('r') && !e.classList.contains('me'))
    return { pilot: f && getComputedStyle(f).backgroundColor, wso: w && getComputedStyle(w).backgroundColor }
  })
}
async function audit(P, tag) {
  return P.evaluate(() => {
    const rows = [...document.querySelectorAll('.mx .who .whoedit')].filter(e => e.getBoundingClientRect().width > 0)
    const out = { n: rows.length, noPuck: [], oldBits: 0, chipCut: [], puckOver: [], faded: [], kinds: {} }
    for (const w of rows) {
      const pk = w.querySelector(':scope > .puck'); if (!pk) { out.noPuck.push(w.textContent); continue }
      if (w.querySelector('.cs, .catchip')) out.oldBits++
      const nm = pk.querySelector('.nm'), ch = pk.querySelector('.role')
      const pr = pk.getBoundingClientRect(), cr = ch.getBoundingClientRect(), td = w.closest('td').getBoundingClientRect()
      if (cr.left < pr.left - 0.5 || cr.right > pr.right + 0.5 || cr.width < 8) out.chipCut.push(nm.textContent)
      if (pr.right > td.right + 0.5) out.puckOver.push(nm.textContent)
      if (nm.scrollWidth > nm.clientWidth) out.faded.push(nm.textContent)
      const kind = (pk.classList.contains('pers') ? 'gnd' : pk.classList.contains('r') ? 'wso' : 'pilot') + ':' + ch.textContent + ':' + ([...ch.classList].find(c => c.startsWith('q-')) || '')
      if (!out.kinds[kind]) out.kinds[kind] = { fill: getComputedStyle(pk).backgroundColor, chip: getComputedStyle(ch).backgroundColor, ink: getComputedStyle(ch).color, w: Math.round(pr.width), h: Math.round(pr.height), ex: nm.textContent }
    }
    return out
  })
}
async function frame(P, heading) {
  await P.evaluate(h => {
    const hd = [...document.querySelectorAll('.mx [data-testid^="group-"]')].find(e => new RegExp('^\\W*' + h + '\\b').test(e.textContent.trim()))
    hd?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -60)
  }, heading)
  await P.waitForTimeout(400)
}

async function walk(browser, size, ctxOpts, clip) {
  // ---- admin
  const P = await open(browser, ctxOpts, ['ad', 'a', 'admin'])
  const sched = await schedFills(P)
  await toWar(P)
  const a = await audit(P, size)
  ok(`${size} admin: every drawn name is a puck`, a.n > 20 && a.noPuck.length === 0, `${a.n} names, ${a.noPuck.length} without a puck`)
  ok(`${size} admin: no old bar or badge left`, a.oldBits === 0, String(a.oldBits))
  ok(`${size} admin: every chip whole inside its puck`, a.chipCut.length === 0, a.chipCut.join(', '))
  ok(`${size} admin: every puck inside its column`, a.puckOver.length === 0, a.puckOver.join(', '))
  console.log(`${size} names that fade:`, a.faded.length, a.faded.join(', '))
  console.log(`${size} kinds:`, JSON.stringify(a.kinds))
  const pil = Object.entries(a.kinds).find(([k]) => k.startsWith('pilot:')), wso = Object.entries(a.kinds).find(([k]) => k.startsWith('wso:'))
  ok(`${size}: a pilot's puck is the schedule's own fill`, !!pil && pil[1].fill === sched.pilot, `${pil?.[1].fill} vs ${sched.pilot}`)
  ok(`${size}: a WSO's puck is the schedule's own fill`, !!wso && wso[1].fill === sched.wso, `${wso?.[1].fill} vs ${sched.wso}`)
  ok(`${size}: OCU reads "O"`, Object.keys(a.kinds).some(k => k.includes(':O:q-ocu')) && !Object.keys(a.kinds).some(k => k.includes(':OCU:')))
  ok(`${size}: ground personnel read "G"`, Object.keys(a.kinds).some(k => k === 'gnd:G:q-pers') && !Object.keys(a.kinds).some(k => k.includes(':GND:')))
  ok(`${size}: every puck one height`, new Set(Object.values(a.kinds).map(k => k.h)).size === 1, JSON.stringify([...new Set(Object.values(a.kinds).map(k => k.h))]))
  await frame(P, 'IWSO'); await P.screenshot({ path: path.join(OUT, `${size}-admin-iwso-ocu.png`), clip })
  await frame(P, 'Personnel'); await P.screenshot({ path: path.join(OUT, `${size}-admin-personnel.png`), clip })
  // the phone's frozen copy: same puck, same names as the real rows
  if (size === 'phone') {
    const band = await P.evaluate(() => {
      const b = [...document.querySelectorAll('.mxband [data-band-id]')].filter(e => e.getBoundingClientRect().height > 0)
      const bad = b.filter(r => !r.querySelector('.puck .nm') || r.querySelector('.cs, .catchip')).length
      const cut = b.filter(r => { const pk = r.querySelector('.puck'), ch = pk?.querySelector('.role'); if (!pk || !ch) return true; const a = pk.getBoundingClientRect(), c = ch.getBoundingClientRect(), td = r.querySelector('td.who').getBoundingClientRect(); return c.right > a.right + 0.5 || a.right > td.right + 0.5 }).length
      return { n: b.length, bad, cut }
    })
    ok('phone: the frozen copy draws the same puck, whole', band.n > 10 && band.bad === 0 && band.cut === 0, JSON.stringify(band))
    // scroll the grid sideways: the frozen names stay, still pucks
    await P.evaluate(() => { const w = document.querySelector('.mx-wrap'); if (w) w.scrollLeft += 600 })
    await P.waitForTimeout(500)
    await frame(P, 'IWSO'); await P.screenshot({ path: path.join(OUT, `phone-admin-scrolled.png`), clip })
  }
  // the chip's qualifications: open by tap (a picture at once and settled), close by a second tap
  await frame(P, 'IP')
  const chip = P.locator('.mx .who .whoedit .puck .role.has-quals').filter({ visible: true }).first()
  if (await chip.count()) {
    // a phone taps; a desktop's mouse opens the list on hover (D: 3 Sep 26) and a click there toggles it
    if (size === 'phone') await chip.tap(); else await chip.hover()
    await P.screenshot({ path: path.join(OUT, `${size}-admin-chip-pressed.png`), clip })
    await P.waitForTimeout(400)
    const popped = await P.locator('[data-testid="qualpop"]').count()
    ok(`${size}: a tap on the chip lists his qualifications`, popped === 1)
    ok(`${size}: …and opens no window`, (await P.locator('[data-testid="person-figures"]').count()) === 0)
    await P.screenshot({ path: path.join(OUT, `${size}-admin-chip-list.png`), clip })
    if (size === 'phone') await chip.tap(); else await P.mouse.move(5, 5)
    await P.waitForTimeout(300)
    ok(`${size}: a second tap (a phone) or moving the mouse away (a desktop) closes the list`, (await P.locator('[data-testid="qualpop"]').count()) === 0)
  } else ok(`${size}: a chip with qualifications on the page`, false, 'none found')
  // the name opens his window
  // a name in the middle of the screen (the top rows sit under the sticky bars): the phone's frozen copy, else the row
  const tgt = await P.evaluate(sel => {
    const mid = innerHeight / 2
    const n = [...document.querySelectorAll(sel)].map(e => ({ e, r: e.getBoundingClientRect() })).filter(x => x.r.height > 0 && x.r.top > mid - 150 && x.r.bottom < mid + 150)[0]
    return n ? { x: n.r.left + n.r.width / 2, y: n.r.top + n.r.height / 2, who: n.e.textContent } : null
  }, size === 'phone' ? '.mxband .who .whoedit .puck .nm' : '.mx-wrap .mx .who .whoedit .puck .nm')
  const who = tgt?.who
  if (tgt) { if (size === 'phone') await P.touchscreen.tap(tgt.x, tgt.y); else await P.mouse.click(tgt.x, tgt.y) }
  await P.waitForTimeout(600)
  const win = await P.locator('[data-testid="person-figures"]').count()
  ok(`${size}: a tap on the name opens his window`, win === 1, who)
  await P.screenshot({ path: path.join(OUT, `${size}-admin-name-window.png`) })
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  ok(`${size}: Escape closes it`, (await P.locator('[data-testid="person-figures"]').count()) === 0)
  // Rearrange: the grip beside a whole puck
  await P.evaluate(() => (document.querySelector('[data-testid="settings-open"]'))?.click()); await P.waitForTimeout(500)
  const rb = P.locator('[data-testid="settings-rearrange"]')
  if (await rb.count()) {
    await rb.click(); await P.waitForTimeout(600)
    const ar = await audit(P, size)
    const grips = await P.locator('.mx .whorow .drag').count()
    ok(`${size}: in Rearrange every name keeps a whole puck beside its grip`, grips > 10 && ar.chipCut.length === 0 && ar.puckOver.length === 0, `${grips} grips; cut ${ar.chipCut.join(',')}; over ${ar.puckOver.join(',')}`)
    await frame(P, 'IWSO'); await P.screenshot({ path: path.join(OUT, `${size}-admin-rearrange.png`), clip })
  } else ok(`${size}: Rearrange reachable`, false, 'no settings-rearrange')
  await P.context().close()
  // ---- member: his own row
  const M = await open(browser, ctxOpts, ['us', 'us', 'member'])
  await toWar(M)
  const me = await M.evaluate(() => {
    const tr = document.querySelector('.mx-wrap .mx tbody tr.me'); const pk = tr?.querySelector('.who .puck')
    return pk ? { cs: pk.querySelector('.nm').textContent, ring: getComputedStyle(pk).outlineStyle + ' ' + getComputedStyle(pk).outlineWidth } : null
  })
  ok(`${size} member: his own row's puck wears the accent ring`, !!me && /^solid 1px/.test(me.ring), JSON.stringify(me))
  await M.evaluate(() => document.querySelector('.mx-wrap .mx tbody tr.me')?.scrollIntoView({ block: 'center' })); await M.waitForTimeout(400)
  await M.screenshot({ path: path.join(OUT, `${size}-member-own-row.png`), clip })
  const am = await audit(M, size)
  ok(`${size} member: every drawn name is a puck, chips whole`, am.noPuck.length === 0 && am.chipCut.length === 0 && am.puckOver.length === 0)
  await M.context().close()
}

const wk = await webkit.launch()
await walk(wk, 'phone', { ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 }, { x: 0, y: 60, width: 402, height: 700 })
await wk.close()
const cr = await chromium.launch()
await walk(cr, 'desk', { viewport: { width: 1536, height: 860 }, deviceScaleFactor: 1.25 }, { x: 0, y: 100, width: 900, height: 660 })
await cr.close()
writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1))
const fails = results.filter(r => !r.pass)
console.log(fails.length ? `FAILS: ${fails.length}` : `ALL ${results.length} PASS`)
