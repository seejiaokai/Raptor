/* [TRK-RETEST-NOTES] C10 + C14 — the Tracker's bar (28 Sep 26): the Crew box reads a callsign
   whole on a phone; beside ✓ Save changes the words read "● unsaved", whole; the bar keeps its
   rows at every width. Assertions of the RIGHT behaviour (a PASS means correct).

     HP_URL=http://localhost:4175 HP_SHOTS=<dir> HP_OUT=<dir> node scripts/handpass/trk-lo-11-bar.mjs
*/
import { open, shot, save, log } from './trk-lib.mjs'

const L = log()
const sleep = ms => new Promise(r => setTimeout(r, ms))
const tap = async (page, sel) => { await page.locator(sel).first().click(); await sleep(250) }
/* the bar's rows: the distinct tops of its visible controls */
const bar = page => page.evaluate(() => {
  const h = document.querySelector('#page-tracker header'); if (!h) return null
  const tops = new Set()
  for (const el of h.querySelectorAll('.controls > *')) { const r = el.getBoundingClientRect(); if (r.width && r.height) tops.add(Math.round(r.top / 8)) }
  const crew = document.getElementById('activeSel'), course = document.getElementById('courseSel')
  /* a select's text is cut when the chosen option's text needs more than the box gives it */
  const need = s => { if (!s) return 0; const c = document.createElement('canvas').getContext('2d'); const cs = getComputedStyle(s); c.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; return Math.ceil(c.measureText(s.selectedOptions[0] ? s.selectedOptions[0].textContent : '').width) }
  const room = s => s ? Math.floor(s.getBoundingClientRect().width - parseFloat(getComputedStyle(s).paddingLeft) - parseFloat(getComputedStyle(s).paddingRight) - 16) : 0
  const stat = document.getElementById('saveStat')
  return { h: Math.round(h.getBoundingClientRect().height), rows: tops.size,
    crew: { w: Math.round(crew.getBoundingClientRect().width), need: need(crew), room: room(crew) },
    course: { w: Math.round(course.getBoundingClientRect().width), need: need(course), room: room(course) },
    stat: stat ? { text: stat.textContent, cut: stat.scrollWidth > stat.clientWidth + 1, title: stat.title } : null }
})

/* the bar's height at rest, measured on main's build (28 Sep 26): 70 on a phone, 38 at 1000, 87 at 1060
   and 1150 (two rows before any edit — as on main, not this work), 51 at 1200 and 1440. It must not grow. */
for (const [name, size, touch, hMain] of [['390', { width: 390, height: 844 }, true, 70], ['1000', { width: 1000, height: 800 }, false, 38], ['1060', { width: 1060, height: 800 }, false, 87], ['1150', { width: 1150, height: 800 }, false, 87], ['1200', { width: 1200, height: 800 }, false, 51], ['1440', { width: 1440, height: 900 }, false, 51]]) {
  const { browser, page, errors } = await open({ size, touch })
  const b0 = await bar(page)
  L.ok(name + ': the Crew box reads the student whole', b0.crew.need <= b0.crew.room, JSON.stringify(b0.crew))
  L.ok(name + ': the Course box reads the course whole', b0.course.need <= b0.course.room, JSON.stringify(b0.course))
  L.ok(name + ': the bar is no taller than on main (' + hMain + 'px)', b0.h <= hMain + 1, JSON.stringify({ h: b0.h }))
  await shot(page, 'bar-' + name + '-at-rest', { el: '#page-tracker header' })
  /* a chart edit lights ✓ Save changes: the words beside it */
  await tap(page, '#sylMenuBtn'); await tap(page, '#arrangeBtn'); await sleep(400)
  if (size.height > 500) {
    await page.locator('#arrTools button', { hasText: '+ Test' }).first().click(); await sleep(300)
    await page.fill('#dlgInput', 'LO-BAR-' + name); await page.click('#dlgOk'); await sleep(500)
  }
  const b1 = await bar(page)
  const saveBtn = await page.locator('#saveChanges').count()
  L.ok(name + ': with ✓ Save changes showing, no cut-off words beside it', saveBtn === 1 && b1.stat && b1.stat.text === '' , JSON.stringify(b1.stat))
  L.ok(name + ': and the bar does not grow when it shows (w3-F5)', b1.h <= b0.h + 1, JSON.stringify({ h: b1.h, was: b0.h }))
  await shot(page, 'bar-' + name + '-unsaved', { el: '#page-tracker header' })
  /* take the test ball back out so the next width starts clean */
  await page.evaluate(() => window.__coreForTests && 0)
  L.ok(name + ': no console or page error', errors.length === 0, errors.join(' | '))
  await browser.close()
}

save('lo-11-bar', L.rows)
const fails = L.rows.filter(r => r.pass === false)
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS')
process.exit(fails.length ? 1 : 0)
