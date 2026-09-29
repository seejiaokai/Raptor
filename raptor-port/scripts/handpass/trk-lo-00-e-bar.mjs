/* [TRK-LEFTOVERS] baseline — the Tracker's bar at several widths:
   I  the Crew box on a phone (w3 O1): what it reads for STUDENT A / B, its
      width at 390, 1000 and 1440 wide;
   K  the status words beside ✓ Save changes at 1200 and 1440 (w3 O2 and the
      1200px note): cut or whole, and does the bar wrap to a second row;
   L  Edit chart layout on a sideways phone 844x390 (touch) — [TRK-EDIT-SIDEWAYS]:
      the heights of Raptor's top bar, the Tracker's bar, the Edit tool strip and
      the chart area (#board); the upright phone 390x844 for comparison.
   Adapted from trk-w3-07-phone.mjs, trk-w3-13b-save-widths.mjs,
   trk-w3-13d-wrap-pictures.mjs and trk-pinch.mjs. Admin, a fresh browser each. */
import { open, shot, save, log, PHONE, DESK } from './trk-lib.mjs'
import { sleep, menuItem, dlg, pickFrom } from './trk-w3-lib.mjs'

const L = log()
const allErrors = []
const measure = page => page.evaluate(() => {
  const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { top: Math.round(b.top), h: Math.round(b.height), bottom: Math.round(b.bottom), shown: b.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' } }
  /* Raptor's own top bar: the outermost element above the page that holds the nav (desktop) or the burger (phone) */
  const nav = document.querySelector('#topnav') || document.querySelector('#burger')
  let top = nav; while (top && top.parentElement && !top.parentElement.contains(document.getElementById('page-tracker'))) top = top.parentElement
  const bd = document.getElementById('board'), bb = bd.getBoundingClientRect()
  return {
    viewport: innerWidth + 'x' + innerHeight,
    raptorBar: r(top), raptorBarIs: top ? top.tagName.toLowerCase() + (top.id ? '#' + top.id : '') + (typeof top.className === 'string' && top.className ? '.' + top.className.trim().split(/\s+/).join('.') : '') : null,
    trackerBar: r(document.querySelector('#page-tracker header')),
    editStrip: r(document.getElementById('arrTools')),
    board: r(bd),
    boardOnScreen: Math.max(0, Math.round(Math.min(bb.bottom, innerHeight) - Math.max(bb.top, 0))),
    pageScrollH: document.scrollingElement.scrollHeight,
  }
})
const crewInfo = page => page.evaluate(() => {
  const s = document.getElementById('activeSel'), cs = getComputedStyle(s)
  const c = document.createElement('canvas').getContext('2d'); c.font = cs.font
  const txt = s.options[s.selectedIndex].textContent
  return { w: Math.round(s.getBoundingClientRect().width), picked: txt, textNeeds: Math.round(c.measureText(txt).width), padL: cs.paddingLeft, padR: cs.paddingRight, maxW: cs.maxWidth, bar: Math.round(document.querySelector('#page-tracker header').getBoundingClientRect().width) }
})

/* ---- I. the Crew box ---- */
for (const [label, size, touch] of [['390', PHONE, true], ['1000', { width: 1000, height: 800 }, false], ['1440', DESK, false]]) {
  const { browser, page, errors } = await open({ size, who: 'a', touch })
  const a = await crewInfo(page)
  await shot(page, `lo-I-${label}-crew-A`, { el: '#activeSel' })
  await pickFrom(page, '#activeSel', /STUDENT B/)
  const b = await crewInfo(page)
  await shot(page, `lo-I-${label}-crew-B`, { el: '#activeSel' })
  await shot(page, `lo-I-${label}-bar`, { el: '#page-tracker header' })
  L.note(`I ${label} wide: the Crew box`, JSON.stringify({ A: a, B: { w: b.w, picked: b.picked, textNeeds: b.textNeeds } }))
  L.ok(`I ${label} wide: the Crew box is wide enough for the picked name (box ${a.w}px, "${a.picked}" needs ~${a.textNeeds}px + padding)`, a.w >= a.textNeeds + 30, `box ${a.w}px; text ${a.textNeeds}px; bar ${a.bar}px`)
  allErrors.push(...errors.map(e => 'I' + label + ' ' + e))
  await browser.close()
}

/* ---- K. the save corner at 1200 and 1440 ---- */
const saveInfo = page => page.evaluate(() => {
  const st = document.getElementById('saveStat'), sv = document.getElementById('saveChanges'), h = document.querySelector('#page-tracker header'), slot = document.querySelector('#page-tracker .saveslot')
  const rb = el => el ? (b => ({ x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), r: Math.round(b.right) }))(el.getBoundingClientRect()) : null
  return { text: st ? st.textContent : null, cut: st ? st.scrollWidth > st.clientWidth + 1 : null, statBox: rb(st), statScrollW: st ? st.scrollWidth : null, save: rb(sv), slot: rb(slot), barH: Math.round(h.getBoundingClientRect().height), barRight: Math.round(h.getBoundingClientRect().right), boardTop: Math.round(document.getElementById('board').getBoundingClientRect().top) }
})
for (const width of [1200, 1440]) {
  const { browser, page, errors } = await open({ size: { width, height: 900 }, who: 'a' })
  const s0 = await saveInfo(page)
  await menuItem(page, 'syl', 'arrangeBtn')
  const s1 = await saveInfo(page)
  await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(250); await dlg(page, { value: 'LO' + width }); await sleep(400)
  const s2 = await saveInfo(page)
  await shot(page, `lo-K-${width}-editing-after-edit`)
  await shot(page, `lo-K-${width}-editing-after-edit-bar`, { el: '#page-tracker header' })
  await menuItem(page, 'syl', 'arrangeBtn')
  const s3 = await saveInfo(page)
  await shot(page, `lo-K-${width}-after-done`)
  await shot(page, `lo-K-${width}-after-done-bar`, { el: '#page-tracker header' })
  L.note(`K ${width}: not editing / editing / after the first edit / after Done`, JSON.stringify({ s0, s1, s2, s3 }))
  L.ok(`K ${width}: the bar does not wrap when ✓ Save changes appears (bar ${s1.barH} → ${s2.barH} → ${s3.barH}px)`, s1.barH === s2.barH && s0.barH === s3.barH, `bar ${s0.barH}/${s1.barH}/${s2.barH}/${s3.barH}; chart top ${s1.boardTop} → ${s2.boardTop}; ${s0.boardTop} → ${s3.boardTop}`)
  L.ok(`K ${width}: the status words beside ✓ Save changes are whole`, !s2.cut && !s3.cut, `editing: "${s2.text}" cut=${s2.cut} (${s2.statBox && s2.statBox.w}px shown of ${s2.statScrollW}); after Done: "${s3.text}" cut=${s3.cut} (${s3.statBox && s3.statBox.w}px of ${s3.statScrollW})`)
  allErrors.push(...errors.map(e => 'K' + width + ' ' + e))
  await browser.close()
}

/* ---- L. Edit chart layout on a phone, sideways and upright ---- */
for (const [label, size] of [['sideways-844x390', { width: 844, height: 390 }], ['upright-390x844', PHONE]]) {
  const { browser, page, errors } = await open({ size, who: 'a', touch: true })
  const m0 = await measure(page)
  await shot(page, `lo-L-${label}-1-before`)
  await menuItem(page, 'syl', 'arrangeBtn')
  await sleep(400)
  const m1 = await measure(page)
  await shot(page, `lo-L-${label}-2-editing`)
  L.note(`L ${label}: before / editing`, JSON.stringify({ before: m0, editing: m1 }))
  L.ok(`L ${label}: the chart area keeps room while editing (#board ${m1.board && m1.board.h}px tall, ${m1.boardOnScreen}px on screen)`, m1.boardOnScreen >= 120, `Raptor bar ${m1.raptorBar && m1.raptorBar.h}px (${m1.raptorBarIs}) · Tracker bar ${m1.trackerBar && m1.trackerBar.h}px · edit strip ${m1.editStrip && m1.editStrip.h}px · chart ${m1.board && m1.board.h}px (on screen ${m1.boardOnScreen}px)`)
  allErrors.push(...errors.map(e => 'L' + label + ' ' + e))
  await browser.close()
}

save('lo-E-bar', { rows: L.rows, errors: allErrors })
console.log('errors', JSON.stringify(allErrors))
