// The drawing check's part list for the crew list's SANS section (owner D2581, D2582 — the F / O / A letters in one
// column straight after the widest reason; D2584 Q2 — the mismatch words; D2750, D2751 — the hours never cut, on a
// second line under the letter): Sun 19 Jul, an AMT box 13:00–14:00 on the Scheduler Board, five SANS men filed —
// Bolt (yeti) Fly, Rebel (romeo) OFT, Jester (ipman) AMT 08:00–10:00, Kraken (krait) Fly + OFT, Zenith (vinci) AMT.
// Drawn on 25–26 Nov 26 (chats 185, 186) on the frozen build D:/raptor-work/c185-build (index-SXKkjfaJ.js) by
// docs/mock/2026-11-25-sans-d2588/draw.mjs, scene `col`:
//   col-nopick-<size>   no place picked: the section as it read then, no reason line on any row
//   col-new-<size>      the AMT box's "+ add" pressed: the new words, every puck entry as wide as the widest, so the
//                       letters start at one place (the column), Jester's hours still beside his "A"
//   col-wrap-<size>     the same, Jester's hours split onto a second line directly under his "A" (span.sw-hrs, a block
//                       line inside the badge — the drawing's own element; the build's is named in `HOURS_BUILD`)
// The drawing's marks (a pink outline on the letters, a "New" tag) are not compared: no part checks an outline or the tag.
// The drawing script's own read of the section (draw.mjs `read`) is copied into `PARTS` as selectors: the section
// `#schedBoard .rsans`, each row `.rsans-row`, its puck `.rpuck[data-person]` / `.puck`, its reason `.rwhy`, its letters
// `.rsans-b`. Its column measure (the letters' left edges, the widest reason's last letter to the column) is the
// `place` of each row's letters measured from the section (`rel: 'sec'`), so one row's letters standing elsewhere is a
// difference of that row.
// Record the drawing (from raptor-port/; the script writes its pictures beside itself, so it is replayed from a
// byte-identical copy under a path ending in docs/mock/2026-11-25-sans-d2588/draw.mjs, its scripts/handpass a junction
// to this checkout's):
//   SZ=d ONLY=col DRAW_URL=http://localhost:4881/ DRAW_OUT=<scratch> DRAWCHECK_SPEC=scripts/drawcheck/specs/sans-col.mjs \
//     DRAWCHECK_DIST=D:/raptor-work/c185-build DRAWCHECK_ORIGIN=http://localhost:4881 \
//     DRAWCHECK_APPROVED=docs/mock/2026-11-25-sans-d2588/img DRAWCHECK_DRAWN_ON='the frozen build c185-build (index-SXKkjfaJ.js)' \
//     node --import ./scripts/drawcheck/record.mjs <copy>/raptor-port/docs/mock/2026-11-25-sans-d2588/draw.mjs   (then SZ=p)
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/sans-col.mjs --dist <built folder> --out <folder>
import { fileURLToPath } from 'node:url'

const SCRIPT = 'docs/mock/2026-11-25-sans-d2588/draw.mjs'
const SUN = '2026-07-19', DI = 6
const AT = new Date('2026-07-15T09:00:00')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const MEN = [['yeti', ['fly'], null], ['romeo', ['oft'], null], ['ipman', ['amt'], ['08:00', '10:00']], ['krait', ['fly', 'oft'], null], ['vinci', ['amt'], null]]

/* the drawing script's own way there (draw.mjs `col`, through swd-w14a-lib / sah-w10-lib / sud-w5-lib / asp-w2-lib:
   T.run's world and sign-in, T.file, T.W5.addSim, settle, T.gotoWeek, L.openBoard, the "+ add" press, boardDrawer) */
async function press(page, sel, phone) {
  const l = typeof sel === 'string' ? page.locator(sel).first() : sel
  await l.waitFor({ state: 'visible', timeout: 8000 })
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (phone) await l.tap({ timeout: 5000 }); else await l.click({ timeout: 5000 })
  await sleep(350)
}
async function signIn(page, user, pass) {
  await page.waitForSelector('#luser'); await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(800)
}
const go = async (page, to) => { await page.evaluate(t => window.go(t), to); await page.waitForFunction(t => window.CURPAGE === t, to); await sleep(600) }
async function closeAll(page, phone) {
  for (const s of ['[data-testid="win-sansday-x"]:visible', '[data-testid="win-inputedit-x"]:visible', '[data-testid="inped-escask-go"]:visible']) {
    const x = page.locator(s).first(); if (await x.count()) { await press(page, x, phone); await sleep(300) }
  }
  await closeBoard(page, phone)
}
async function closeBoard(page, phone) {
  if (!(await page.locator('#schedBoard').count())) return
  const done = page.locator('#sbDone:visible').first()
  if (await done.count()) await press(page, done, phone); else await page.keyboard.press('Escape')
  await sleep(600)
}
async function openBoard(page, phone, di) {
  if (await page.locator('#schedBoard').count()) { if ((await page.evaluate(() => window.SBDAY)) === di) return; await closeBoard(page, phone) }
  await go(page, 'editsched')
  const d = page.locator(`#eWeek [data-sbday="${di}"]`).first()
  await d.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  if (phone) { await d.tap(); await sleep(80) } else await d.click()
  await page.waitForSelector('#schedBoard'); await sleep(800)
}
const B = sel => `#schedBoard ${sel}:visible`
async function typeBox(page, phone, sel, value) {
  const el = page.locator(B(sel)).first()
  await el.scrollIntoViewIfNeeded()
  if (phone) await el.tap(); else await el.click()
  await sleep(150)
  await page.keyboard.press('Control+A').catch(() => {})
  await el.fill('')
  await el.type(String(value), { delay: 10 })
  await page.keyboard.press('Enter').catch(() => {})
  await el.evaluate(e => e.blur())
  await sleep(300)
}
/* T.file: Saber files for the man on the SANS tab — the day's window, "+ Commitment", the man, the events, the hours */
async function file(page, phone, id, kinds, span) {
  await closeAll(page, phone)
  await go(page, 'inputs')
  await press(page, '#inSansMode:visible', phone)
  await page.waitForSelector('[data-testid="sanscal"]'); await sleep(400)
  if (!(await page.locator(`[data-testid="sc-day-${SUN}"]`).count())) return 'July 2026 is not the month the SANS tab shows'
  await press(page, `[data-testid="sc-day-${SUN}"]`, phone)
  await page.waitForSelector('[data-testid="win-sansday"]', { timeout: 5000 }); await sleep(400)
  const add = page.locator('[data-testid="win-sansday"] [data-testid="sd-add"]').first()
  if (await add.isDisabled().catch(() => true)) return 'the + Commitment button is greyed for ' + id
  const before = await page.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  await press(page, add, phone)
  await page.waitForSelector('#inpEditPop', { timeout: 6000 })
  const opts = await page.locator('#inpEditPerson option').evaluateAll(os => os.map(o => o.value)).catch(() => [])
  if (!opts.includes(id)) return 'not offered in the Person box: ' + id
  await page.selectOption('#inpEditPerson', id); await sleep(200)
  for (const k of ['fly', 'oft', 'amt']) {
    const label = { fly: 'Fly', oft: 'OFT', amt: 'AMT' }[k]
    const cb = page.locator('#inpEditSans label', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).locator('input').first()
    if ((await cb.isChecked()) !== kinds.includes(k)) { if (phone) await cb.tap(); else await cb.click(); await sleep(150) }
  }
  if (Array.isArray(span)) {
    await press(page, '#inpEditSpan [data-span="custom"]', phone)
    await page.fill('#inpEditStart', span[0]); await page.fill('#inpEditEnd', span[1])
  }
  await press(page, '#inpEditSave:visible', phone); await sleep(900)
  const nd = page.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click().catch(() => {}); await sleep(400) }
  const after = await page.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  if (!after.some(x => !before.includes(x))) return 'the filing for ' + id + ' was not made'
  await closeAll(page, phone)
}
const drawerOut = page => page.evaluate(() => { const b = document.querySelector('#schedBoard .sb-ros .ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 60 })
async function drawer(page, phone, open) {
  if (!phone || !(await page.locator('#schedBoard .sb-ros .ros-tab').count())) return
  if ((await drawerOut(page)) !== open) { await press(page, '#schedBoard .sb-ros .ros-tab', phone); await sleep(500) }
}
const revealSec = page => page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .rsans')].filter(x => x.getBoundingClientRect().width > 0).pop(); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }); return !!e }).then(r => sleep(350).then(() => r))
async function stage(page, origin, phone) {
  await page.clock.install({ time: AT })
  await page.goto(origin + '/')
  await signIn(page, 'ad', 'a')
  for (const [id, kinds, span] of MEN) { const why = await file(page, phone, id, kinds, span); if (why) return why }
  await closeBoard(page, phone); await go(page, 'editsched')
  if ((await page.evaluate(() => window.CURWEEK)) !== '13/07/2026') return 'Edit Schedule does not open on the week of Mon 13 Jul'
  await openBoard(page, phone, DI)
  await press(page, B(`[data-sradd="${DI}.amt"]`), phone); await sleep(400)
  const ri = await page.evaluate(i => window.DAYS[i].sims.amt.length - 1, DI)
  await typeBox(page, phone, `[data-bfld="sr:${DI}.amt.${ri}.label"]`, 'AMT').catch(() => {})
  await typeBox(page, phone, `[data-bfld="sr:${DI}.amt.${ri}.str"]`, '13:00')
  await typeBox(page, phone, `[data-bfld="sr:${DI}.amt.${ri}.end"]`, '14:00')
  if (!(await page.evaluate(([i, r]) => { const x = window.DAYS[i].sims.amt[r]; return !!x && JSON.stringify(x).includes('13:00') }, [DI, ri]))) return 'the AMT box 13:00–14:00 was not made'
  /* settle: on the phone a typed box can leave the page zoomed — a reload clears it (the app keeps no sign-in) */
  if (phone) {
    await page.reload(); await sleep(1500)
    if (await page.locator('#luser:visible').count()) await signIn(page, 'ad', 'a')
    await page.waitForSelector('#vWeek .day, #eWeek .day', { state: 'attached', timeout: 15000 }).catch(() => {})
  }
  await closeBoard(page, phone); await go(page, 'editsched')
  await openBoard(page, phone, DI)
  return ri
}
async function reachNoPick(page, { origin, phone }) {
  const ri = await stage(page, origin, phone); if (typeof ri === 'string') return ri
  await drawer(page, phone, true)
  if (await page.evaluate(() => !!(window.ARM && window.ARM.key))) return 'a place is picked'
  if (!(await revealSec(page))) return 'no SANS section in the crew list'
}
async function reachPicked(page, { origin, phone }) {
  const ri = await stage(page, origin, phone); if (typeof ri === 'string') return ri
  const zone = page.locator(B(`[data-fill="s:${DI}.amt.${ri}.+"]`)).first()
  await zone.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  const addz = zone.locator('.addz').first()
  const ab = (await addz.count()) ? await addz.boundingBox() : null, zb = await zone.boundingBox()
  const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
  if (phone) await zone.tap({ position: pos }); else await zone.click({ position: pos })
  await sleep(500)
  if (!(await page.evaluate(() => !!(window.ARM && window.ARM.key)))) return 'the AMT seat did not arm on a press of its "+ add"'
  await drawer(page, phone, true)
  if (!(await revealSec(page))) return 'no SANS section in the crew list'
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const SEC = '#schedBoard .rsans'
const row = id => `${SEC} .rsans-row:has(.rpuck[data-person="${id}"])`
const CS = { yeti: 'Bolt', romeo: 'Rebel', ipman: 'Jester', krait: 'Kraken', vinci: 'Zenith' }
/* the build's element for Jester's hours under his letter (found with check.mjs --explore on the c203 build) */
const HOURS_BUILD = `${row('ipman')} .rsans-b .rsans-h`
function PARTS(withWhy, withHours) {
  const out = [
    P('sec', 'the SANS section of the crew list', SEC, SEC, ['place', 'size', 'fill', 'edge']),
    P('head', "the section's heading", `${SEC} .rh2`, `${SEC} .rh2`, ['place', 'text', 'words-place', 'colour'], { rel: 'sec' }),
  ]
  for (const id of Object.keys(CS)) {
    out.push(P(`row-${id}`, `${CS[id]}'s row`, row(id), row(id), ['place', 'size'], { rel: 'sec' }))
    out.push(P(`name-${id}`, `${CS[id]}'s name puck`, `${row(id)} .rpuck .puck`, `${row(id)} .rpuck .puck`, ['place', 'size', 'fill', 'text', 'words-place'], { rel: `row-${id}` }))
    if (withWhy && id !== 'vinci') out.push(P(`why-${id}`, `${CS[id]}'s reason under his name`, `${row(id)} .rwhy`, `${row(id)} .rwhy`, ['place', 'text', 'words-place', 'colour'], { rel: `row-${id}` }))
    /* the letters' box is see-through (no fill, no edge, both sides): judged by where it starts (the column) and where
       its words are drawn, never by its width (walk-scripts §10 — the first run's 4-55px "widths" were the box only) */
    out.push(P(`let-${id}`, `${CS[id]}'s letters (the column)`, `${row(id)} .rsans-b`, `${row(id)} .rsans-b`, ['place', 'text', 'words-place', 'colour'], { rel: 'sec' }))
  }
  if (withHours) out.push(P('hours-ipman', "Jester's hours, on a second line under his letter", `${row('ipman')} .rsans-b .sw-hrs`, HOURS_BUILD, ['place', 'text', 'words-place', 'colour'], { rel: 'let-ipman' }))
  return out
}
const st = (id, title, shot, phone, reach, parts) => ({ id, title, ...(phone ? { phone: true, engine: 'webkit' } : {}), drawing: { script: SCRIPT, shot }, reach, parts })

export default {
  name: "The crew list's SANS section — the reasons and the F / O / A column",
  slug: 'sans-col',
  origin: 'http://localhost:4881',
  timezone: 'Asia/Singapore',
  records: fileURLToPath(new URL('../../../docs/mock/2026-11-25-sans-d2588/drawcheck/', import.meta.url)),
  states: [
    st('nopick-desk', 'Sun 19 board, no place picked — the SANS section, desktop', 'col-nopick-desktop', false, reachNoPick, PARTS(false, false)),
    st('nopick-phone', 'Sun 19 board, no place picked — the SANS section, iPhone (WebKit)', 'col-nopick-phone', true, reachNoPick, PARTS(false, false)),
    st('picked-desk', "Sun 19 board, the AMT box's + add pressed — the new words and the column, desktop", 'col-new-desktop', false, reachPicked, PARTS(true, false)),
    st('picked-phone', "Sun 19 board, the AMT box's + add pressed — the new words and the column, iPhone (WebKit)", 'col-new-phone', true, reachPicked, PARTS(true, false)),
    st('wrap-desk', "Sun 19 board, + add pressed — Jester's hours on a second line under his A, desktop", 'col-wrap-desktop', false, reachPicked, PARTS(true, true)),
    st('wrap-phone', "Sun 19 board, + add pressed — Jester's hours on a second line under his A, iPhone (WebKit)", 'col-wrap-phone', true, reachPicked, PARTS(true, true)),
  ],
  accepted: [],
}
