// Walker d — D4b: walker c's own order, to find how the WEEK's Ground Programme copy can be left on an old time.
// (v1) on the Board's input row: 0900, 0800, 09:00 in turn (c's goodAt order: tap away, tap the box, type, Tab);
// (v2) 0900 on the Board's input row, then the Board's Ground Programme row's start box (still showing 08:00) is
// tapped and left by Tab with nothing typed. Close the Board; read the week's two rows; reload; read again.
// Run: node scripts/handpass/wr4-d-d4b.mjs [run] [fixed,main] [desk,phone]
import { setup, B } from './wr4-d-common.mjs'
console.log('wr4-d-d4b v2 + v3, the week alone; was v1')
const RUN = process.argv[2] || 'd4b-r1'
const BUILDS = (process.argv[3] || 'fixed,main').split(',')
const SIZES = (process.argv[4] || 'desk,phone').split(',')
const { L, A } = await setup(RUN)
const { newPage, signIn, handOver, fileInput, recOf, bundleOf, log, go, sleep, shot, boxOf, WED, RANGER, HEX } = L
const hm = m => typeof m === 'number' ? String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') : m
const valOf = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 2); return e ? (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' ? e.value : (e.textContent || '').trim()) : null }, sel)
const groundKey = (page, di, root, attr) => page.evaluate(([di, root, attr]) => { const e = [...document.querySelectorAll(`${root} [${attr}^="gr:${di}."][${attr}$=".prog"]`)].find(x => /range brief/i.test(x.value || x.textContent || '')); return e ? e.getAttribute(attr).replace(/\.prog$/, '') : null }, [di, root, attr])
const BPI = (iid, f) => `#schedBoard [data-ifld^="${iid}"][data-ifld$=".${f}"]`
const WPI = (iid, f) => `#eWeek [data-inp^="${iid}"][data-inp$=".${f}"]`
async function typeIn(w, sel, v) {
  await w.page.mouse.click(5, w.page.viewportSize().height - 5).catch(() => {}); await sleep(300)
  const el = w.page.locator(sel).filter({ visible: true }).first(); await el.scrollIntoViewIfNeeded()
  if (w.tap) await el.tap(); else await el.click(); await sleep(250)
  if (v != null) { await el.fill(''); await w.page.keyboard.type(v, { delay: 15 }) }
  await w.page.keyboard.press('Tab'); await sleep(700)
}
async function shotRow(w, c, name, sel, text) {
  await w.page.evaluate(sel => { document.querySelectorAll('[data-w4d]').forEach(x => x.removeAttribute('data-w4d')); const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 2); if (!e) return; const r = e.closest('.pl-row, .sb-arow, tr') || e.parentElement.parentElement; r.setAttribute('data-w4d', '1'); r.scrollIntoView({ block: 'center' }) }, sel)
  await sleep(250); await shot(w.page, c, name, await boxOf(w.page, ['[data-w4d]'], 10), text, w.size)
}
async function week(w, c, step, iid, di) {
  await go(w.page, 'editsched'); await sleep(500)
  const gk = await groundKey(w.page, di, '#eWeek', 'data-txt')
  const tog = w.page.locator(`#eWeek [data-pitog="${di}"]`)
  if (!(await w.page.evaluate(s => [...document.querySelectorAll(s)].some(x => x.getBoundingClientRect().width > 2), WPI(iid, 'str')))) for (let i = 0; i < (await tog.count()); i++) await tog.nth(i).evaluate(e => e.click())
  await sleep(300)
  const out = { step, saved: (r => r && `${hm(r.s)}-${hm(r.e)}`)(await recOf(w.page, iid)), weekGround: gk ? `${await valOf(w.page, `#eWeek [data-txt="${gk}.str"]`)}-${await valOf(w.page, `#eWeek [data-txt="${gk}.end"]`)}` : 'not drawn', weekPI: `${await valOf(w.page, WPI(iid, 'str'))}-${await valOf(w.page, WPI(iid, 'end'))}` }
  if (gk) await shotRow(w, c, `${c}-${step}-week-ground-${w.size}`, `#eWeek [data-txt="${gk}.str"]`, out.weekGround)
  await shotRow(w, c, `${c}-${step}-week-pi-${w.size}`, WPI(iid, 'str'), out.weekPI)
  A.judge(c, `${w.size} ${step}`, null, out)
}
async function board(w, c, step, iid, di) {
  const gk = await groundKey(w.page, di, '#schedBoard', 'data-bfld')
  const out = { step, saved: (r => r && `${hm(r.s)}-${hm(r.e)}`)(await recOf(w.page, iid)), boardGround: gk ? `${await valOf(w.page, `#schedBoard [data-bfld="${gk}.str"]`)}-${await valOf(w.page, `#schedBoard [data-bfld="${gk}.end"]`)}` : 'not drawn', boardPI: `${await valOf(w.page, BPI(iid, 'str'))}-${await valOf(w.page, BPI(iid, 'end'))}`, note: await L.shownToast(w.page) }
  if (gk) await shotRow(w, c, `${c}-${step}-board-ground-${w.size}`, `#schedBoard [data-bfld="${gk}.str"]`, out.boardGround)
  A.judge(c, `${w.size} ${step}`, null, out)
  return gk
}
for (const bk of BUILDS) for (const size of SIZES) for (const v of (process.argv[5] || 'v1,v2').split(',')) {
  const dir = B[bk], c = `D4b-${bk}-${v}`
  try {
    let w = await newPage('desk', undefined, dir); await signIn(w, 'ad')
    log(c, `build ${dir} bundle ${await bundleOf(w.page)}`)
    const iid = await fileInput(w, c, WED, { type: 'Training', people: [RANGER, HEX], from: '08:00', to: '10:00', title: 'Range brief' })
    if (size === 'phone') w = await handOver(w, 'phone', 'ad', dir)
    const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15'))
    await week(w, c, '1-filed', iid, di)
    if (v === 'v3') {
      /* no Board: the week's own Personal Inputs start box, 0900 then 0800 then 09:00, the week read in place after each */
      const gk = await groundKey(w.page, di, '#eWeek', 'data-txt')
      for (const t of ['0900', '0800', '09:00']) {
        await typeIn(w, WPI(iid, 'str'), t)
        const out = { saved: (r => r && `${hm(r.s)}-${hm(r.e)}`)(await recOf(w.page, iid)), weekGroundInPlace: `${await valOf(w.page, `#eWeek [data-txt="${gk}.str"]`)}-${await valOf(w.page, `#eWeek [data-txt="${gk}.end"]`)}`, weekPI: `${await valOf(w.page, WPI(iid, 'str'))}-${await valOf(w.page, WPI(iid, 'end'))}` }
        await shotRow(w, c, `${c}-2-week-after-${t.replace(':', '')}-ground-${w.size}`, `#eWeek [data-txt="${gk}.str"]`, out.weekGroundInPlace)
        A.judge(c, `${w.size} 2-week-after-${t} (read in place)`, null, out)
      }
      await go(w.page, 'viewsched'); await week(w, c, '4-away-and-back', iid, di)
      await w.page.reload(); await sleep(800)
      if (await w.page.locator('#luser').isVisible().catch(() => false)) await signIn(w, 'ad')
      await week(w, c, '5-after-reload', iid, di)
      await w.ctx.close(); continue
    }
    await w.page.evaluate(i => window.openScheduler(i), di); await w.page.waitForSelector('#schedBoard'); await sleep(900)
    if (v === 'v1') {
      for (const t of ['0900', '0800', '09:00']) { await typeIn(w, BPI(iid, 'str'), t); await board(w, c, `2-board-after-${t.replace(':', '')}`, iid, di) }
    } else {
      await typeIn(w, BPI(iid, 'str'), '0900'); const gk = await board(w, c, '2-board-after-0900', iid, di)
      if (gk) { await typeIn(w, `#schedBoard [data-bfld="${gk}.str"]`, null); await board(w, c, '3-board-ground-box-tapped-and-left', iid, di) }
    }
    const off = w.page.locator('#sbDone:visible, #sbClose:visible, #schedBoard [aria-label="Close"]:visible').first()
    if (await off.count()) { if (w.tap) await off.tap(); else await off.click(); await sleep(700) }
    await week(w, c, '4-board-closed', iid, di)
    await w.page.reload(); await sleep(800)
    if (await w.page.locator('#luser').isVisible().catch(() => false)) await signIn(w, 'ad')
    await w.page.addStyleTag({ content: L.NOMOTION })
    await week(w, c, '5-after-reload', iid, di)
    await w.ctx.close()
  } catch (e) { L.facts.errors.push(c + ' ' + size + ': ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
}
await A.done(RUN)
