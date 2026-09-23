/* [HUMAN-RETEST] Tracker — walk 4: the marking pop-up's lifetime.

   The standing UI rule (raptor-port/CLAUDE.md, owner 4 Sep 26): a click-open
   popup closes on a click outside it. And the pop-up is bound to ONE event and
   ONE student — so if it outlives a chart switch, a course switch or the
   removal of its student, the next grade lands somewhere the person never
   aimed at (Astra #7, #8, #13, #20).

   Every step is a real pointer press on the real control — a dropdown is
   CLICKED first (that is what a person's press does), then its option chosen. */
import { open, shot, save, log, reveal, dlg, DESK } from './trk-lib.mjs'

const L = log()
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ball = (page, id) => page.locator(`#flowSvg .ball[data-id="${id}"]`).first()
const popOpen = page => page.locator('#pop').isVisible().catch(() => false)
const popTitle = page => page.locator('#popTitle').innerText().catch(() => '')
/* the fills of one ball's wedges, in roster order — what the chart SHOWS */
const wedges = (page, id) => page.evaluate(id => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id)
  return g ? [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')) : null
}, id)
async function tapBall(page, id) {
  await reveal(page, id)
  /* the centre of the ball: the selected student's own tap (a wedge of someone
     else PICKS them instead) */
  const b = await ball(page, id).boundingBox()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(350)
}
async function pickFrom(page, sel, labelRe) {
  await page.click(sel); await sleep(150)                       // the person's press on the dropdown
  const v = await page.evaluate(({ sel, src }) => { const re = new RegExp(src); const o = [...document.querySelector(sel).options].find(o => re.test(o.textContent)); return o ? o.value : null }, { sel, src: labelRe.source })
  if (v == null) throw new Error('no option ' + labelRe)
  await page.selectOption(sel, v); await sleep(800)
}

const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const who = await page.evaluate(() => [...document.querySelectorAll('#activeSel option')].map(o => o.textContent))
L.note('roster', who.join(', '))

/* 1. does it close on a press outside it? */
await tapBall(page, 'ST-01')
L.ok('1. a tap on the ball\'s centre opens the pop-up', await popOpen(page), await popTitle(page))
await shot(page, '04-pop-open')
const bd = await page.locator('#board').boundingBox()
await page.mouse.click(bd.x + 30, bd.y + bd.height - 40); await sleep(300)          // empty chart, bottom-left
L.ok('1a. a press on EMPTY CHART closes it (standing rule: outside click)', !(await popOpen(page)), (await popOpen(page)) ? 'still open' : 'closed')
if (await popOpen(page)) {
  const sp = await page.locator('#sidePanel, .side, aside').first().boundingBox().catch(() => null)
  if (sp) { await page.mouse.click(sp.x + sp.width - 20, sp.y + sp.height - 30); await sleep(300) }
  L.ok('1b. a press on the SIDE PANEL closes it', !(await popOpen(page)), (await popOpen(page)) ? 'still open' : 'closed')
}
if (await popOpen(page)) { await page.keyboard.press('Escape'); await sleep(200) }

/* 2. chart switch with the pop-up open, then DCO */
await tapBall(page, 'ST-01')
const t2 = await popTitle(page)
await pickFrom(page, '#sylSel', /^Tx/)
const open2 = await popOpen(page)
L.ok('2. switching CHART closes the pop-up', !open2, open2 ? `still open: "${await popTitle(page)}" on ${await page.locator('#sylSel option:checked').innerText()}` : 'closed')
await shot(page, '04-pop-after-chart-switch')
if (open2) {
  const before = await wedges(page, 'ST-01')
  await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(500)
  const after = await wedges(page, 'ST-01')
  L.ok('2a. …and a DCO pressed on the leftover pop-up marks nothing on the NEW chart', JSON.stringify(before) === JSON.stringify(after), `Tx ST-01 wedges ${JSON.stringify(before)} → ${JSON.stringify(after)} (opened on 2026 as "${t2}")`)
  await shot(page, '04-pop-dco-landed-on-new-chart')
}
if (await popOpen(page)) { await page.keyboard.press('Escape'); await sleep(200) }
await pickFrom(page, '#sylSel', /^2026/)

/* 3. remove the pop-up's student while it is open */
await tapBall(page, 'ST-02')
const t3 = await popTitle(page)
const chipX = page.locator('.chips .chip').filter({ hasText: who[0] }).locator('[data-rm]').first()
let removed = false
if (await chipX.count()) {
  await chipX.click(); await sleep(250)
  if (await page.locator('#dlgModal').isVisible().catch(() => false)) { const q = await dlg(page, { ok: true }); L.note('3. remove asked', q.text.replace(/\s+/g, ' ')) }
  removed = true; await sleep(500)
} else L.note('3. could not find the × on the first student\'s chip', '')
const open3 = await popOpen(page)
L.ok('3. removing the pop-up\'s student closes the pop-up', !open3, open3 ? `still open, now titled "${await popTitle(page)}" (was "${t3}")` : 'closed')
await shot(page, '04-pop-after-remove-student')
if (open3 && removed) {
  const before = await wedges(page, 'ST-02')
  await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(500)
  const after = await wedges(page, 'ST-02')
  L.ok('3a. …and DCO on it marks nobody', JSON.stringify(before) === JSON.stringify(after), `ST-02 wedges ${JSON.stringify(before)} → ${JSON.stringify(after)}`)
}
if (await popOpen(page)) { await page.keyboard.press('Escape'); await sleep(200) }

/* 4. an EMPTY course: does a ball offer grades that do nothing? */
await page.click('#courseMenuBtn'); await page.waitForSelector('#addCourse', { state: 'visible' }); await page.click('#addCourse'); await sleep(200)
await dlg(page, { value: 'Empty course' }); await sleep(900)
L.note('4. course now', await page.locator('#courseSel option:checked').innerText())
await tapBall(page, 'ST-01')
const open4 = await popOpen(page)
L.note('4. a tap on a ball with NO students', open4 ? `opens the pop-up: "${await popTitle(page)}"` : 'opens nothing')
await shot(page, '04-empty-course-tap')
if (open4) {
  await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(400)
  L.ok('4a. on a course with no students, a ball does not offer grades that do nothing', false, `DCO pressed → pop-up ${await popOpen(page) ? 'still open' : 'closed silently'}, nothing written`)
}
save('04-popup', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 4).join(' | ')}`)
await browser.close()
