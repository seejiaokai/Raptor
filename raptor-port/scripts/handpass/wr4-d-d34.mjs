// Walker d — D3 (an input's start changed in its in-place box on the Scheduler Board; the other man's bell) and D4 (the
// lead: is the week's Ground Programme copy left on the old time?). Per build and size: Saber files a Training for Ranger
// and Hex 08:00-10:00 "Range brief" on Wed 15 Jul; every place that draws it is read; the start is changed to 0900 on
// the Board's row; the Board closed; every place read; reload; read again.
// Run: node scripts/handpass/wr4-d-d34.mjs [run] [fixed,main] [desk,phone]
import { setup, B } from './wr4-d-common.mjs'
console.log('wr4-d-d34 v3 + the Board pencil pressed (looks only); was v2')
const RUN = process.argv[2] || 'd34-r1'
const BUILDS = (process.argv[3] || 'fixed,main').split(',')
const SIZES = (process.argv[4] || 'desk,phone').split(',')
const { L, A } = await setup(RUN)
const { newPage, signIn, handOver, fileInput, recOf, bundleOf, log, go, sleep, shot, boxOf, press, RANGER, HEX, WED } = L

const hm = m => typeof m === 'number' ? String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') : m
const valOf = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 2); return e ? (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' ? e.value : (e.textContent || '').trim()) : null }, sel)
/* the ground programme copy of the input on day `di` (its row key k), found by its title on the given surface */
const groundKey = (page, di, root, attr) => page.evaluate(([di, root, attr]) => {
  const e = [...document.querySelectorAll(`${root} [${attr}^="gr:${di}."][${attr}$=".prog"]`)].find(x => /range brief/i.test(x.value || x.textContent || ''))
  return e ? e.getAttribute(attr).replace(/\.prog$/, '') : null
}, [di, root, attr])
/* a shared input's row is keyed <id>~<man> (probe 2): its boxes are found by the id's prefix */
const WPI = (iid, f) => `#eWeek [data-inp^="${iid}"][data-inp$=".${f}"]`
const BPI = (iid, f) => `#schedBoard [data-ifld^="${iid}"][data-ifld$=".${f}"]`
async function unfoldPI(w, di, iid) {
  const sel = WPI(iid, 'str')
  const shown = () => w.page.evaluate(s => [...document.querySelectorAll(s)].some(x => x.getBoundingClientRect().width > 2), sel)
  if (await shown()) return true
  const tog = w.page.locator(`#eWeek [data-pitog="${di}"]`)
  for (let i = 0; i < (await tog.count()); i++) { await tog.nth(i).evaluate(e => e.click()); await sleep(350); if (await shown()) return true }
  return shown()
}
/* a picture cropped to the row holding `sel` (its nearest row container), scrolled into view first */
async function rowShot(w, c, name, sel, text) {
  const ok = await w.page.evaluate(sel => {
    const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 2); if (!e) return false
    document.querySelectorAll('[data-w4d]').forEach(x => x.removeAttribute('data-w4d'))
    const row = e.closest('.pl-row, .sb-arow, tr, .pi-row, [data-iid]') || e.parentElement.parentElement
    row.setAttribute('data-w4d', '1'); row.scrollIntoView({ block: 'center' }); return true
  }, sel)
  if (!ok) { log(c, `NO PICTURE ${name}: ${sel} not drawn`); return }
  await sleep(250)
  await shot(w.page, c, name, await boxOf(w.page, ['[data-w4d]'], 10), text, w.size)
}
/* read every place that draws the input; picture each */
async function readAll(w, c, step, iid, di, onBoard) {
  const out = { step }
  const rec = await recOf(w.page, iid); out.saved = rec ? `${hm(rec.s)}-${hm(rec.e)}` : null
  if (onBoard) {
    const gk = await groundKey(w.page, di, '#schedBoard', 'data-bfld')
    out.boardGround = gk ? `${await valOf(w.page, `#schedBoard [data-bfld="${gk}.str"]`)}-${await valOf(w.page, `#schedBoard [data-bfld="${gk}.end"]`)}` : 'not drawn'
    out.boardPI = `${await valOf(w.page, BPI(iid, 'str'))}-${await valOf(w.page, BPI(iid, 'end'))}`
    out.boardPIkeys = await w.page.evaluate(s => [...document.querySelectorAll(s)].map(e => e.getAttribute('data-ifld') + ' w' + Math.round(e.getBoundingClientRect().width)), BPI(iid, 'str'))
    if (gk) await rowShot(w, c, `${c}-${step}-board-ground-${w.size}`, `#schedBoard [data-bfld="${gk}.str"]`, out.boardGround)
    await rowShot(w, c, `${c}-${step}-board-pi-${w.size}`, BPI(iid, 'str'), out.boardPI)
  } else {
    await go(w.page, 'editsched'); await sleep(500)
    const gk = await groundKey(w.page, di, '#eWeek', 'data-txt')
    out.weekGround = gk ? `${await valOf(w.page, `#eWeek [data-txt="${gk}.str"]`)}-${await valOf(w.page, `#eWeek [data-txt="${gk}.end"]`)}` : 'not drawn'
    if (gk) await rowShot(w, c, `${c}-${step}-week-ground-${w.size}`, `#eWeek [data-txt="${gk}.str"]`, out.weekGround)
    out.weekPIshown = await unfoldPI(w, di, iid)
    out.weekPI = `${await valOf(w.page, WPI(iid, 'str'))}-${await valOf(w.page, WPI(iid, 'end'))}`
    await rowShot(w, c, `${c}-${step}-week-pi-${w.size}`, WPI(iid, 'str'), out.weekPI)
    /* the Inputs page: its list opens on today's fortnight (not July 2026), so the calendar's day card is read */
    await L.openDay(w, WED)
    const CARD = `[data-testid="win-inputsday"] [data-iid="${iid}"], [data-testid="win-inputsday"] [data-popiid="${iid}"]`
    out.inputsDayCard = await w.page.evaluate(s => { const r = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 2); return r ? (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140) : 'not drawn' }, CARD)
    await rowShot(w, c, `${c}-${step}-inputs-daycard-${w.size}`, CARD, out.inputsDayCard)
    if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  }
  A.judge(c, `${w.size} ${step}: every place`, null, out)
  return out
}
async function openBoard(w, di) {
  await go(w.page, 'editsched'); await sleep(300)
  await w.page.evaluate(i => window.openScheduler(i), di); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
}
async function closeBoard(w) {
  const off = w.page.locator('#sbDone:visible, #sbClose:visible, #schedBoard [aria-label="Close"]:visible').first()
  if (await off.count()) { if (w.tap) await off.tap(); else await off.click(); await sleep(700) }
  return w.page.evaluate(() => { const b = document.getElementById('schedBoard'); return !b || b.getBoundingClientRect().width < 2 || getComputedStyle(b).display === 'none' })
}

for (const bk of BUILDS) for (const size of SIZES) {
  const dir = B[bk], c = `D4-${bk}`
  try {
    let w = await newPage('desk', undefined, dir); await signIn(w, 'ad')
    log(c, `build ${dir} bundle ${await bundleOf(w.page)}`)
    const iid = await fileInput(w, c, WED, { type: 'Training', people: [RANGER, HEX], from: '08:00', to: '10:00', title: 'Range brief' })
    if (!iid) { A.judge(c, 'fixture', false, 'not filed'); await w.ctx.close(); continue }
    log(c, 'filed ' + JSON.stringify(await recOf(w.page, iid)))
    if (size === 'phone') { w = await handOver(w, 'phone', 'ad', dir); log(c, 'phone bundle ' + await bundleOf(w.page)) }
    const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15'))
    if (await recOf(w.page, iid) == null) { A.judge(c, `${size}: the filed input carried over`, false, null); await w.ctx.close(); continue }
    await readAll(w, c, '1-filed', iid, di, false)
    await openBoard(w, di)
    await readAll(w, c, '2-board-open', iid, di, true)
    const pen = await w.page.evaluate(i => [...document.querySelectorAll(`#schedBoard [data-inpedit="${i}"]`)].filter(e => e.getBoundingClientRect().width > 2).length, iid)
    A.judge(c, `${size}: a pencil for the input on the Board's row (RECORD)`, null, pen)
    /* the change: 0900 typed in the Board's own start box of the input's row, left by Tab */
    const sel = BPI(iid, 'str')
    if (!(await w.page.evaluate(s => [...document.querySelectorAll(s)].some(x => x.getBoundingClientRect().width > 2), sel))) {
      const togs = await w.page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-pitog], #schedBoard [data-sbfold], #schedBoard .sb-sec [aria-expanded]')].map(e => e.outerHTML.slice(0, 160)))
      log(c, `${size}: the Board's Personal Inputs box not drawn; folds on the Board: ${JSON.stringify(togs)}`)
      await shot(w.page, c, `${c}-2b-board-whole-${w.size}`, { x: 0, y: 0, ...w.page.viewportSize() }, 'the Board as opened', w.size)
    }
    const el =w.page.locator(sel).filter({ visible: true }).first()
    if (!(await el.count())) { A.judge(c, `${size}: the Board's start box`, null, 'NOT WALKED — not drawn'); await w.ctx.close(); continue }
    await el.scrollIntoViewIfNeeded()
    const tag = await el.evaluate(e => e.tagName)
    if (w.tap) await el.tap(); else await el.click()
    await sleep(w.tap ? 300 : 150)
    if (tag === 'INPUT') { await el.fill(''); await w.page.keyboard.type('0900', { delay: 15 }) } else { await w.page.keyboard.press('Control+A'); await w.page.keyboard.type('0900', { delay: 15 }) }
    await w.page.keyboard.press('Tab')
    await sleep(700)
    log(c, `${size}: typed 0900 in ${tag}; note ${JSON.stringify(await L.shownToast(w.page))}`)
    await readAll(w, c, '3-after-0900-on-board', iid, di, true)
    const closed = await closeBoard(w)
    log(c, `${size}: board closed: ${closed}`)
    await readAll(w, c, '4-board-closed', iid, di, false)
    await w.page.reload(); await sleep(800)
    if (await w.page.locator('#luser').isVisible().catch(() => false)) await signIn(w, 'ad')
    await w.page.waitForSelector('#vWeek .day, #eWeek .day', { state: 'attached' }).catch(() => {})
    await w.page.addStyleTag({ content: L.NOMOTION })
    await readAll(w, c, '5-after-reload', iid, di, false)
    await openBoard(w, di)
    await readAll(w, c, '6-board-after-reload', iid, di, true)
    /* the Board's pencil for the input: does it open the input's own window? (looks only; closed by Escape, nothing changed) */
    const penL = w.page.locator(`#schedBoard [data-inpedit="${iid}"]`).filter({ visible: true }).first()
    if (await penL.count()) {
      const rowOf = await penL.evaluate(e => (e.closest('.sb-arow, .pl-row, tr')?.className || '') + ' :: ' + (e.closest('.sb-arow, .pl-row, tr')?.textContent || '').replace(/\s+/g, ' ').slice(0, 80))
      await penL.scrollIntoViewIfNeeded(); if (w.tap) await penL.tap(); else await penL.click()
      const opened = await w.page.locator('#inpEditPop #inpEditStart').waitFor({ timeout: 6000 }).then(() => true).catch(() => false)
      await sleep(400)
      const st = opened ? await w.page.locator('#inpEditPop #inpEditStart').inputValue() : null
      await shot(w.page, c, `${c}-7-board-pencil-${w.size}`, opened ? await boxOf(w.page, ['[data-testid="win-inputedit"]'], 8) : { x: 0, y: 0, ...w.page.viewportSize() }, { opened, start: st }, w.size)
      A.judge(c, `${size}: the Board's pencil on the input's row opens its window (RECORD)`, null, { row: rowOf, opened, startShown: st, recAfter: await recOf(w.page, iid) })
      await w.page.keyboard.press('Escape'); await sleep(400)
    }
    await closeBoard(w)
    if (bk === 'fixed' && size === 'desk') {
      for (const who of ['hex', 'us']) {
        w = await handOver(w, 'phone', who, dir)
        const r = await A.bell(w, 'D3', `${who}-bell`)
        const ls = r.filter(l => l.day === 'Wed 15 Jul' && !/You were added/.test(l.what)).map(l => `${l.name} ${l.day} / ${l.what}`)
        A.judge('D3', `phone: ${who} reads "Now 09:00–10:00 · Saber"`, r.some(l => l.day === 'Wed 15 Jul' && l.what === 'Now 09:00–10:00 · Saber'), ls)
      }
    }
    await w.ctx.close()
  } catch (e) { L.facts.errors.push(c + ' ' + size + ': ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
}
await A.done(RUN)
