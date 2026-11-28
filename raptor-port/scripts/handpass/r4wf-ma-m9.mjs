// r4wf-ma-m9 — merge walk, walker A, M9 (Astra): Available crew grows above the typing box. A shared ALL-DAY leave Ranger
// + Hex on Wed 15 Jul; Available crew dragged by its grip to just above Unavailable; 1800 typed in Ranger's Start; his End
// tapped and typed into at once (2359). His End box's place on screen measured across the tap; what is typed kept;
// his saved end 23:59; Hex still all day; Available crew read for Ranger before and after.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=phone ENG=webkit node scripts/handpass/r4wf-ma-m9.mjs
import * as A from './r4wf-ma-lib.mjs'
const { L, J, sleep } = A
console.log('r4wf-ma-m9 v2', A.TAG, 'bundle', A.EXPECT_BUNDLE)
const ID = 'M9', steps = [], pics = []
let p
const availRanger = () => p.evaluate(() => { const s = document.querySelector('#sbBoard > [data-secmove$=".avail"]'); if (!s) return 'no Available crew section'; const r = s.getBoundingClientRect(); return { ranger: [...s.querySelectorAll('[data-person="bane"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim() + ' @' + (e.closest('[class]')?.className || '')), hex: [...s.querySelectorAll('[data-person="rocky"]')].filter(e => e.getBoundingClientRect().width > 0).length, height: Math.round(r.height), text: s.innerText.replace(/\s+/g, ' ').slice(0, 160) } })
const rd = async (label, extra = {}) => { const r = { ...(await A.read(p, label)), avail: await availRanger(), ...extra }; steps.push(r); return r }
try {
  const w = await A.world(); p = w.page
  await A.fixture(w, [L.RANGER, L.HEX], { from: undefined, to: undefined })
  await A.openBoard(w)
  await rd('filed (all day?)')
  if (!steps[0].store.some(x => / allday /.test(x))) throw new Error('the leave was not filed all day: ' + J(steps[0].store))
  /* Available crew by its grip to just above Unavailable */
  const s0 = await A.secs(p)
  const grip = p.locator('#sbBoard > [data-secmove$=".avail"] .secgrip').first()
  const tgt = p.locator('#sbBoard > [data-secmove$=".unav"]').first()
  let dragged = 'not tried'
  /* v2: dragged only when Available crew is not already above Unavailable (v1's drag on the desktop dropped it BELOW) */
  if (s0.indexOf('2.avail') > s0.indexOf('2.unav') || process.env.FORCEDRAG) {
    await tgt.evaluate(el => el.scrollIntoView({ block: 'center' })); await sleep(300)
    const a = await grip.boundingBox(), b = await tgt.boundingBox()
    if (a && b) {
      await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down()
      for (let i = 1; i <= 14; i++) await p.mouse.move(a.x + a.width / 2, a.y + (b.y + 6 - a.y) * i / 14)
      await p.mouse.up(); await sleep(700)
      const asked = p.getByRole('button', { name: /^(No|Not now|Just this day|Only this day|Keep)/i })
      if (await asked.count()) { await asked.first().click().catch(() => {}); await sleep(400) }
      dragged = 'dragged by mouse'
    } else dragged = 'grip or target not measured'
  } else dragged = 'not dragged: Available crew already sits above Unavailable (SANS Avail between)'
  const s1 = await A.secs(p)
  await rd('sections arranged', { sectionsBefore: s0, sectionsAfter: s1, dragged })
  pics.push(await A.pic(w, 'M9-0-arranged', ['#sbBoard > [data-secmove$=".avail"]', '#sbBoard > [data-secmove$=".unav"]']))
  /* 1800 in Ranger's Start, not left; his End tapped and typed into at once */
  await A.typeIn(w, await A.boxSel(p, 'Ranger', 'str'), '1800', null, 'r-str-tap')
  const endSel = await A.boxSel(p, 'Ranger', 'end')
  await p.evaluate(s => { const e = document.querySelector(s); window.__maEnd = e; window.__maTop0 = e.getBoundingClientRect().top; window.__maAv = document.querySelector('#sbBoard > [data-secmove$=".avail"]'); window.__maAvH = window.__maAv?.getBoundingClientRect().height }, endSel)
  const l = p.locator(endSel).first()
  if (w.tap) await l.tap(); else await l.click()
  const right = await p.evaluate(() => ({ top: window.__maEnd.isConnected ? window.__maEnd.getBoundingClientRect().top : 'gone', focus: document.activeElement === window.__maEnd }))
  await p.keyboard.press('Control+A'); await p.keyboard.type('2359')
  await sleep(700)
  const meas = await p.evaluate(s => { const e = document.querySelector(s); const av = document.querySelector('#sbBoard > [data-secmove$=".avail"]'); return { top0: Math.round(window.__maTop0 * 10) / 10, sameNode: e === window.__maEnd, top1: Math.round(e.getBoundingClientRect().top * 10) / 10, focusIsBox: document.activeElement === e, value: e.value, availRewritten: av !== window.__maAv, availH: [Math.round(window.__maAvH), Math.round(av?.getBoundingClientRect().height)] } }, endSel)
  meas.rightAfterTap = right
  await rd('End tapped, 2359 typed at once (not left)', { meas })
  pics.push(await A.pic(w, 'M9-1-typing-in-end', ['#sbBoard > [data-secmove$=".avail"]', '#sbBoard > [data-secmove$=".unav"]']))
  await A.away(w); await rd('blank tapped')
  pics.push(await A.pic(w, 'M9-2-caret-left', ['#sbBoard > [data-secmove$=".avail"]', '#sbBoard > [data-secmove$=".unav"]']))
  const mid = steps.at(-2), fin = steps.at(-1)
  const moved = Math.abs(meas.top1 - meas.top0)
  const rEnd = mid.store.find(x => /^LL Ranger /.test(x)), hexAll = mid.store.some(x => /^LL Hex Jul 15 allday/.test(x)) && fin.store.some(x => /^LL Hex Jul 15 allday/.test(x))
  const ok = moved <= 1 && meas.focusIsBox && meas.value === '2359' && !!rEnd && / 1080-1439 /.test(rEnd) && hexAll
  A.res(ID, ok ? 'PASS' : 'FAIL', { endBoxMoved: moved, meas, rangerSaved: rEnd, hexAllDay: hexAll, availBefore: steps[1].avail, availWhileTyping: mid.avail, availAfter: fin.avail, final: fin.store, steps }, pics)
  await w.ctx.close()
} catch (e) { A.res(ID, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J(steps).slice(0, 3000), pics) }
await A.fin('m9')
