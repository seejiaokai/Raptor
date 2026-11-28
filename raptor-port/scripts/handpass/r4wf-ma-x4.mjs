// r4wf-ma-x4 — merge walk, walker A, X4 (Reject on his held row: one input on two rows) and M2 (carried on: his duty's
// Ground button under Personal Inputs, its Ground Programme End 1100, a box of another section).
// Shared overseas duty (OD) Ranger + Hex 08:00–12:00. PI=open|fold (Personal Inputs open or folded). M2=1 to carry on.
// KEEP=tap|js — how the two Rejects are pressed.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=phone ENG=webkit PI=open M2=1 node scripts/handpass/r4wf-ma-x4.mjs
import * as A from './r4wf-ma-lib.mjs'
const { L, J, sleep } = A
const PI = process.env.PI || 'open'
console.log('r4wf-ma-x4 v1', A.TAG, 'PI', PI, 'M2', !!process.env.M2, 'KEEP', process.env.KEEP || 'tap', 'bundle', A.EXPECT_BUNDLE)
const ID = `X4-${PI}`
const steps = [], pics = []
let p, ids
const persRead = () => p.evaluate(() => { const s = document.querySelector('#sbBoard > [data-secmove$=".inputs"]'); if (!s) return 'no Personal Inputs section'; const open = [...s.querySelectorAll('[data-ifld]')].some(e => e.getBoundingClientRect().height > 0); return { open, head: (s.querySelector('.sb-ph')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80), rows: [...s.querySelectorAll('[data-inprow]')].map(r => `${r.getAttribute('data-inprow')} ${[...r.querySelectorAll('.seat [data-person] .nm')].map(e => e.textContent.trim()).join('+')} ${r.querySelector('[data-ifld$=".str"]')?.value}-${r.querySelector('[data-ifld$=".end"]')?.value} "${r.querySelector('[data-ifld$=".rmks"]')?.value ?? ''}" [${[...r.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => b.textContent.trim()).join('/')}]`), text: s.innerText.replace(/\s+/g, ' ').slice(0, 200) } })
const unavRows = () => p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-inprow]')].map(r => `${r.getAttribute('data-inprow')} ${[...r.querySelectorAll('.seat [data-person] .nm')].map(e => e.textContent.trim()).join('+')} ${r.querySelector('[data-ifld$=".str"]')?.value}-${r.querySelector('[data-ifld$=".end"]')?.value} "${r.querySelector('[data-ifld$=".rmks"]')?.value ?? ''}" [${[...r.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => b.textContent.trim()).join('/')}]`))
const rd = async (label, extra = {}) => { const r = { ...(await A.read(p, label, ids)), unav: await unavRows(), pers: await persRead(), note: await A.note(p), ...extra }; steps.push(r); console.log('  pers', J(r.pers), 'unav', J(r.unav)); return r }
const top = () => p.evaluate(() => { const a = document.activeElement; return a && a !== document.body ? Math.round(a.getBoundingClientRect().top * 10) / 10 : null })
const hexOk = s => s.filter(x => /Hex/.test(x)).length === 1 && s.filter(x => /Hex/.test(x)).every(x => / 480-720 ""/.test(x) && !/acc=/.test(x))
try {
  const w = await A.world(); p = w.page
  const outlaw = await A.idOf(p, 'Outlaw'); A.NAMES[outlaw] = 'Outlaw'; ids = ['bane', 'rocky']
  const iid = await A.fixture(w, [L.RANGER, L.HEX], { type: 'OD', from: '08:00', to: '12:00' })
  await A.openBoard(w)
  const inUnav = await p.locator(`#sbBoard > [data-secmove$=".unav"] [data-inprow^="${iid}"]`).count()
  if (!inUnav) {
    const acc = p.locator(`#schedBoard [data-inprow^="${iid}"] .accb:not(.undo)`).first()
    if (!(await acc.count())) throw new Error('the shared OD is not under Unavailable and offers no accept')
    await acc.scrollIntoViewIfNeeded(); await (w.tap ? acc.tap() : acc.click()); await sleep(800)
  }
  /* Personal Inputs open or folded, as the pass says */
  const pr = await persRead()
  if (typeof pr === 'object' && pr.open !== (PI === 'open')) { const t = p.locator('#schedBoard [data-pitog]').first(); if (await t.count()) { await t.scrollIntoViewIfNeeded(); await (w.tap ? t.tap() : t.click()); await sleep(500) } }
  await rd('filed (OD shared, under Unavailable)')
  /* 1. Ranger's End 1000, tap his Remark box */
  await A.typeIn(w, await A.boxSel(p, 'Ranger', 'end'), '1000', null, 'r-end-tap')
  await A.pressAt(w, await A.boxSel(p, 'Ranger', 'rmks'), 'r-rmks-tap')
  await rd('Ranger End 1000, his Remark box tapped')
  pics.push(await A.pic(w, `${ID}-1-cut-held`, ['#sbBoard > [data-secmove$=".unav"]', '#sbBoard > [data-secmove$=".inputs"]']))
  /* 2. Reject on Ranger's row, keeping the caret; the Remark box's top before and after */
  const row = await A.rowSel(p, 'Ranger')
  const t0 = await top()
  const k1 = await A.keepPress(w, `${row} .accb[data-acc="x"]`, `${ID}-reject1`)
  const t1 = await top()
  await rd('Reject on Ranger\'s row', { keep: k1, remarkTop: [t0, t1] })
  pics.push(await A.pic(w, `${ID}-2-after-reject`, ['#sbBoard > [data-secmove$=".unav"]', '#sbBoard > [data-secmove$=".inputs"]']))
  /* 3. x typed in the still-standing Remark box; Reject on it again, keeping the caret */
  let k2 = null, t2 = null, t3 = null
  if (k1.kept) {
    await p.keyboard.type('x'); await sleep(300)
    await rd('x typed in the Remark box (not left)')
    const rej2 = await p.evaluate(() => { const r = document.activeElement.closest('[data-inprow]'); const b = r?.querySelector('.accb[data-acc="x"]'); if (!b) return null; b.setAttribute('data-ma-rej2', '1'); return r.getAttribute('data-inprow') })
    if (rej2) {
      t2 = await top()
      k2 = await A.keepPress(w, '[data-ma-rej2="1"]', `${ID}-reject2`)
      t3 = await top()
      await rd(`second Reject on the row the caret is in (${rej2})`, { keep: k2, remarkTop: [t2, t3] })
    } else await rd('no Reject on the row the caret is in')
    pics.push(await A.pic(w, `${ID}-3-after-reject2`, ['#sbBoard > [data-secmove$=".unav"]', '#sbBoard > [data-secmove$=".inputs"]']))
  }
  /* 4. blank */
  await A.away(w); await rd('blank tapped')
  pics.push(await A.pic(w, `${ID}-4-caret-left`, ['#sbBoard > [data-secmove$=".unav"]', '#sbBoard > [data-secmove$=".inputs"]']))
  const last = steps.at(-1)
  const hexAll = steps.every(s => hexOk(s.store))
  const moved1 = t0 != null && t1 != null ? Math.abs(t1 - t0) : null, moved2 = t2 != null && t3 != null ? Math.abs(t3 - t2) : null
  const rangerPers = typeof last.pers === 'object' ? last.pers.rows.filter(r => /Ranger/.test(r)).length : -1
  const hexUnav = last.unav.filter(r => /Hex/.test(r)).length, rangerUnav = last.unav.filter(r => /Ranger/.test(r)).length
  const okEnd = PI === 'open' ? (rangerPers === 1 && hexUnav === 1 && rangerUnav === 0) : (hexUnav === 1 && rangerUnav === 0)
  const ok = k1.kept && hexAll && moved1 != null && moved1 <= 1 && (moved2 == null || moved2 <= 1) && okEnd
  A.res(ID, !k1.kept ? 'COULD NOT BE MADE (this try)' : ok ? 'PASS' : 'FAIL', { hexUntouched: hexAll, remarkMoved: [moved1, moved2], rangerPersRows: rangerPers, hexUnav, rangerUnav, k1, k2, steps }, pics)
  if (process.env.M2) {
    /* M2 — his duty's Ground button under Personal Inputs; its Ground Programme End 1100; a box of another section */
    const pers = await persRead()
    const grow = await p.evaluate(() => { const s = document.querySelector('#sbBoard > [data-secmove$=".inputs"]'); const r = [...s.querySelectorAll('[data-inprow]')].find(r => r.querySelector('.seat [data-person="bane"]')); if (!r) return null; const b = [...r.querySelectorAll('button')].find(b => b.offsetWidth && /ground/i.test(b.textContent + ' ' + (b.title || '') + ' ' + (b.getAttribute('aria-label') || ''))); if (!b) return { row: r.getAttribute('data-inprow'), buttons: [...r.querySelectorAll('button')].map(b => b.textContent.trim() + '|' + (b.title || '')) }; b.setAttribute('data-ma-ground', '1'); return { row: r.getAttribute('data-inprow'), button: b.textContent.trim() } })
    console.log('M2 ground button', J(grow))
    if (!grow || !grow.button) { A.res('M2', 'NOT WALKED', { reason: 'no Ground button on Ranger\'s Personal Inputs row', grow, pers }, pics) }
    else {
      const rIid = grow.row.split('~')[0]
      await A.pressAt(w, '[data-ma-ground="1"]', 'm2-ground')
      const gk = await p.evaluate(id => { const ri = (window.DAYS[2].ground || []).findIndex(r => r.src === id); return ri < 0 ? null : `gr:2.${ri}` }, rIid)
      await rd(`Ground pressed on Ranger's Personal Inputs row (${grow.button}); his Ground Programme row: ${gk}`)
      pics.push(await A.pic(w, 'M2-1-after-ground', ['#sbBoard > [data-secmove$=".ground"]', '#sbBoard > [data-secmove$=".inputs"]']))
      if (!gk) A.res('M2', 'FAIL', { reason: 'no Ground Programme row for Ranger\'s duty after Ground', steps: steps.slice(-1) }, pics)
      else {
        await A.typeIn(w, `#schedBoard [data-bfld="${gk}.end"]`, '1100', null, 'm2-end-tap')
        await A.tapBox(w, await A.boxSel(p, 'Hex', 'str'), 'm2-hex-str-tap')
        const gl = await p.evaluate(gk => [...document.querySelectorAll(`#schedBoard [data-bfld^="${gk}."]`)].map(e => e.getAttribute('data-bfld') + '=' + e.value), gk)
        await rd('Ground Programme End 1100 typed, Hex\'s Start (Unavailable) tapped', { ground: gl })
        pics.push(await A.pic(w, 'M2-2-1100-caret-in-unav', ['#sbBoard > [data-secmove$=".ground"]', '#sbBoard > [data-secmove$=".inputs"]', '#sbBoard > [data-secmove$=".unav"]']))
        await A.away(w)
        const gl2 = await p.evaluate(gk => [...document.querySelectorAll(`#schedBoard [data-bfld^="${gk}."]`)].map(e => e.getAttribute('data-bfld') + '=' + e.value), gk)
        await rd('blank tapped', { ground: gl2 })
        pics.push(await A.pic(w, 'M2-3-caret-left', ['#sbBoard > [data-secmove$=".ground"]', '#sbBoard > [data-secmove$=".inputs"]', '#sbBoard > [data-secmove$=".unav"]']))
        const s = steps.at(-1)
        const r = s.store.filter(x => /^OD Ranger /.test(x)), h = s.store.filter(x => /^OD Hex /.test(x))
        const persR = (s.pers.rows || []).filter(x => /Ranger/.test(x))
        const ok2 = r.length === 1 && / -?\d+-660 /.test(r[0]) && h.length === 1 && / 480-720 /.test(h[0]) && persR.length === 1 && /-11:00 /.test(persR[0]) && gl2.some(x => /\.end=11:00/.test(x)) && s.unav.filter(x => /Hex/.test(x)).length === 1 && !s.unav.some(x => /Ranger/.test(x))
        A.res('M2', ok2 ? 'PASS' : 'FAIL', { ranger: r, hex: h, persRanger: persR, ground: gl2, unav: s.unav, steps: steps.slice(-3) }, pics)
      }
    }
  }
  await w.ctx.close()
} catch (e) { A.res(ID, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J(steps).slice(0, 3000), pics) }
await A.fin(`x4-${PI}-${process.env.KEEP || 'tap'}`)
