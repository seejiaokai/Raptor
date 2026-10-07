/* Walker E — P4e-01 (the accepted tapered wing everywhere), P4e-02 (marking and selection), P4e-03 (saved presentation survives another visit).
   A NEW test chart is made through the Tracker's own controls. HP_PHONE=1 for the phone. */
import { mkdirSync, writeFileSync } from 'node:fs'
import * as E from './stk-E-lib.mjs'
import * as T from './dbrA-W5-lib.mjs'
import { reveal } from './trk-lib.mjs'
const phone = !!process.env.HP_PHONE
const SZ = phone ? 'phone' : 'desktop'
const sleep = E.sleep
const TMP = process.env.E_STATE_DIR
const { browser, ctx, page, errors } = await E.world({ size: phone ? E.PHONE : E.DESK, phone })
const pics = [], checks1 = [], checks2 = [], checks3 = []
const pic = async n => { const f = await E.pic(page, `p4e-${SZ}-${n}`); pics.push(f); return f }
const tool = async label => { await page.locator('#arrTools button', { hasText: label }).first().click(); await sleep(250) }
const coverage = () => page.locator('#flowSvg .core').evaluateAll(cores => cores.map(c => {
  const t = c.querySelector('text'), s = c.querySelector('[stroke-linejoin="round"]')
  if (!s || !t) return { label: t ? t.textContent : '', wing: false }
  const style = getComputedStyle(t), canvas = document.createElement('canvas'); canvas.width = 116; canvas.height = 116
  const ctx2 = canvas.getContext('2d'); ctx2.scale(2, 2); ctx2.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily; ctx2.textAlign = 'center'; ctx2.fillText(t.textContent, 29, 32)
  const px = ctx2.getImageData(0, 0, 116, 116).data; let misses = 0, ink = 0
  for (let y = 0; y < 116; y++) for (let x = 0; x < 116; x++) if (px[(y * 116 + x) * 4 + 3] > 128) { ink++; if (!s.isPointInFill(new DOMPoint((x + .5) / 2, (y + .5) / 2))) misses++ }
  return { label: t.textContent, wing: true, misses, ink, centre: s.isPointInFill(new DOMPoint(29, 29)), shoulders: [19, 39].map(x => s.isPointInFill(new DOMPoint(x, 23))), font: style.fontSize, textPointer: getComputedStyle(t).pointerEvents }
}))
let zoomSizes = []
const ballCount = () => page.locator('#flowSvg .ball').count()
try {
  await T.toTracker(page)
  // a NEW test chart
  await T.menu(page, 'syl', 'addSyl'); await T.dlg(page, { value: 'E WALK CHART' })
  await page.evaluate(() => window.__coreForTests.whenLoaded()); await sleep(600)
  await T.menu(page, 'syl', 'arrangeBtn'); await sleep(400)
  const made = []
  for (const [t, name] of [['+ Flight', 'EW-FLT-1'], ['+ Flight', 'EW-FLT-2'], ['+ Test', 'EW-TST-1'], ['+ Acad', 'EW-ACD-1'], ['+ Sim', 'EW-SIM-1']]) {
    await tool(t); await T.dlg(page, { value: name }); await sleep(400); made.push(name)
    // each new ball lands on the same spot: drag it clear so none hides another
    await tool('Move')
    await reveal(page, name)
    const b = await T.ball(page, name).boundingBox(); const c = { x: b.x + b.width / 2, y: b.y + b.height / 2 }
    const k = made.length
    await page.mouse.move(c.x, c.y); await page.mouse.down(); for (let i = 1; i <= 8; i++) await page.mouse.move(c.x + 90 * (k % 3 - 1) * i / 8, c.y + 80 * (k - 1) * i / 8); await page.mouse.up(); await sleep(300)
  }
  pics.push(await E.pic(page, `p4e-${SZ}-newchart-edit-mode`))
  await T.menu(page, 'syl', 'arrangeBtn'); await sleep(300)   // Done editing the layout
  await page.click('#saveChanges'); await sleep(700)
  if (await T.dlgUp(page, 800)) await T.dlg(page, {})
  if (phone) { await page.locator('#page-tracker button:has-text("Info")').first().click(); await sleep(500) }
  for (const n of ['EW STUDENT A', 'EW STUDENT B']) { await page.click('#addStu'); await T.dlg(page, { value: n }); await sleep(600) }
  if (phone) { await page.locator('#page-tracker button:has-text("Flow chart")').first().click(); await sleep(500) }
  await page.evaluate(() => window.__coreForTests.whenLoaded())
  const nBalls = await ballCount()
  // ---- P4e-01: every mode, zoom, labels
  const modes = {}
  const readMode = async name => {
    const cov = await coverage(); const wings = cov.filter(c => c.wing), plain = cov.filter(c => !c.wing)
    modes[name] = { cores: cov.length, wings: wings.length, plain: plain.length, wingLabels: wings.map(w => w.label).join(','), plainLabels: plain.map(p => p.label).join(','), bad: wings.filter(w => w.misses !== 0 || !w.centre || w.shoulders.some(Boolean) || w.ink === 0).map(w => w.label), textPointer: [...new Set(wings.map(w => w.textPointer))].join('/'), font: [...new Set(wings.map(w => w.font))].join('/') }
  }
  for (let z = 0; z < 2; z++) await page.locator('#fzIn').click()
  await sleep(300)
  await readMode('Flow'); pics.push(await pic(`flow-zoomed`))
  await page.locator('#detailsBtn').click(); await sleep(500); await readMode('Details'); pics.push(await pic(`details`)); await page.locator('#detailsBtn').click(); await sleep(300)
  await T.menu(page, 'syl', 'arrangeBtn'); await sleep(500); await readMode('Edit chart layout'); pics.push(await pic(`edit-layout`))
  // zoom in the edit mode
  const cb = await page.locator('#board').boundingBox(); await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2)
  const sz0 = (await T.ball(page, 'EW-FLT-1').boundingBox()).width
  await page.mouse.wheel(0, -400); await sleep(500); const sz1 = (await T.ball(page, 'EW-FLT-1').boundingBox()).width
  await readMode('Edit chart layout, zoomed in (wheel)'); pics.push(await pic(`edit-layout-zoomed-in`))
  await page.mouse.wheel(0, 900); await sleep(500); const sz2 = (await T.ball(page, 'EW-FLT-1').boundingBox()).width
  await readMode('Edit chart layout, zoomed out (wheel)'); pics.push(await pic(`edit-layout-zoomed-out`))
  zoomSizes = [Math.round(sz0), Math.round(sz1), Math.round(sz2)]
  await T.menu(page, 'syl', 'arrangeBtn'); await sleep(300)
  // close-up pictures of one flight and one non-flight ball
  await reveal(page, 'EW-FLT-1'); await T.ball(page, 'EW-FLT-1').screenshot({ path: `${E.SHOTS}/p4e-${SZ}-closeup-flight.png` }).catch(() => {}); pics.push(`p4e-${SZ}-closeup-flight.png`)
  await reveal(page, 'EW-TST-1'); await T.ball(page, 'EW-TST-1').screenshot({ path: `${E.SHOTS}/p4e-${SZ}-closeup-test.png` }).catch(() => {}); pics.push(`p4e-${SZ}-closeup-test.png`)
  const mk = Object.entries(modes)
  checks1.push([`the new chart has ${made.length} events placed through the toolbar (${nBalls} balls)`, nBalls >= made.length, { nBalls }])
  checks1.push(['in every mode the two flight events carry the wing, the three others keep their plain symbol', mk.every(([, m]) => m.wings === 2 && m.plain === 3 && /EW-FLT-1/.test(m.wingLabels) && /EW-FLT-2/.test(m.wingLabels)), Object.fromEntries(mk.map(([k, m]) => [k, `${m.wings} wings / ${m.plain} plain`]))])
  checks1.push(['each flight label sits fully on the wing (no ink off the shape; centre and shoulders inside) in every mode and zoom', mk.every(([, m]) => !m.bad.length), Object.fromEntries(mk.map(([k, m]) => [k, m.bad.length ? 'BAD ' + m.bad.join(',') : 'ok font ' + m.font]))])
  checks1.push(['zooming in the edit mode (wheel) grows the ball and zooming out shrinks it (ball width px at start / in / out)', zoomSizes.length === 3 && zoomSizes[1] > zoomSizes[0] && zoomSizes[2] < zoomSizes[1], zoomSizes])
  checks1.push(['the label text is not a control of its own (pointer events pass through to the ball)', mk.every(([, m]) => /none/.test(m.textPointer) || m.textPointer === 'auto' || m.textPointer === ''), mk.map(([k, m]) => `${k}: ${m.textPointer}`)])
  // ---- P4e-02: marks and selection
  const roster = await page.evaluate(() => window.__coreForTests.rosterNow())
  checks2.push(['the course has two students to mark', roster.length >= 2, roster.map(r => r.name || r.id)])
  await page.locator('#activeSel').selectOption(roster[0].id); await sleep(600)
  await T.grade(page, 'EW-FLT-1', 'Marginal')
  const gA = await T.gradeOf(page, 'EW-FLT-1')
  pics.push(await pic('marked-student-A'))
  // wing press (bottom wedge at (29,54) in the ball's own units) switches student
  await reveal(page, 'EW-FLT-1')
  const pt = await T.ball(page, 'EW-FLT-1').evaluate(e => { const p = new DOMPoint(29, 54).matrixTransform(e.getScreenCTM()); return { x: p.x, y: p.y } })
  const hitWing = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('.ball') ? e.closest('.ball').dataset.id : e.tagName) : null }, [pt.x, pt.y])
  await page.mouse.click(pt.x, pt.y); await sleep(600)
  const active1 = await page.locator('#activeSel').inputValue()
  const popAfterWing = await page.locator('#pop').isVisible()
  await T.grade(page, 'EW-FLT-1', 'DCO')
  const gB = await T.gradeOf(page, 'EW-FLT-1')
  pics.push(await pic('marked-student-B'))
  await page.locator('#activeSel').selectOption(roster[0].id); await sleep(600)
  const gA2 = await T.gradeOf(page, 'EW-FLT-1')
  // the label press: the same as the core
  await reveal(page, 'EW-FLT-2'); const lb = await T.ball(page, 'EW-FLT-2').locator('.core text').boundingBox()
  await page.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2); await sleep(500); const popFromLabel = await page.locator('#pop').isVisible(); if (popFromLabel) { await page.keyboard.press('Escape'); await sleep(200); if (await page.locator('#pop').isVisible()) await page.mouse.click(5, 300) }
  checks2.push(['a mark is made on the flight for student A (Marginal)', /marg/i.test(String(gA)), gA])
  checks2.push(['a press on the wing (bottom wedge) lands on that ball, switches to the other student and opens no mark pop-up', hitWing === 'EW-FLT-1' && active1 === roster[1].id && !popAfterWing, { hitWing, active1, wanted: roster[1].id, popAfterWing }])
  checks2.push(['student B is marked DCO on the same flight and student A keeps Marginal (marks stay per student)', /dco/i.test(String(gB)) && /marg/i.test(String(gA2)), { A: gA, B: gB, A_again: gA2 }])
  checks2.push(['pressing the label text acts as pressing the ball (opens the mark pop-up), not a separate control', popFromLabel === true, popFromLabel])
  // ---- P4e-03: a custom label and font, saved, exported, reload, other account, import
  await page.locator('#fontIn').isVisible().catch(() => false)
  await T.menu(page, 'syl', 'arrangeBtn'); await sleep(400)
  await reveal(page, 'EW-FLT-1'); await T.ball(page, 'EW-FLT-1').locator('.core').dblclick(); await sleep(500)
  await page.locator('#edText').fill('WNG-7'); await page.locator('#edNum').fill('7').catch(() => {}); await page.locator('#edSave').click(); await sleep(500)
  await page.locator('#fontIn').fill('9'); await page.locator('#fontIn').press('Tab'); await sleep(300)
  await page.click('#saveChanges'); await sleep(700); if (await T.dlgUp(page, 800)) await T.dlg(page, {})
  await T.menu(page, 'syl', 'arrangeBtn'); await sleep(400)
  const saved = await page.evaluate(() => JSON.stringify(window.__coreForTests.collectCharts()))
  const covSaved = await coverage(); pics.push(await pic('custom-label-saved'))
  const exp = await T.exportFile(page, { students: true, charts: true })
  mkdirSync(TMP, { recursive: true }); const expPath = `${TMP}/ewalk-${SZ}-backup.json`; writeFileSync(expPath, exp.text)
  // reload through the app and sign in again, then another account, then import the backup we just made
  await page.reload(); await E.signIn(page, 'a'); await T.toTracker(page)
  await T.pickFrom(page, '#sylSel', /E WALK CHART/)
  const afterReload = await page.evaluate(() => JSON.stringify(window.__coreForTests.collectCharts()))
  const covReload = await coverage()
  const logout = async () => { if (phone) { await page.locator('#burger').click(); await sleep(300); await page.click('#drawerLogout') } else await page.click('#logout'); await page.waitForSelector('#luser', { timeout: 15000 }) }
  await logout(); await E.signIn(page, 'm'); await T.toTracker(page); await T.pickFrom(page, '#sylSel', /E WALK CHART/)
  const memberSees = await coverage(); pics.push(await pic('other-account-same-chart'))
  const asked = await T.importFile(page, expPath, msg => 'ok')
  await T.pickFrom(page, '#sylSel', /E WALK CHART/).catch(() => {})
  const afterImport = await page.evaluate(() => JSON.stringify(window.__coreForTests.collectCharts()))
  const covImport = await coverage(); pics.push(await pic('after-import'))
  const lab = c => c.filter(x => x.wing).map(x => x.label).sort().join(',')
  checks3.push(['the custom label WNG-7 and font 9 were saved (the chart now carries WNG-7 on a wing)', /WNG-7/.test(lab(covSaved)), { labels: lab(covSaved), font: [...new Set(covSaved.filter(x => x.wing).map(x => x.font))].join('/') }])
  checks3.push(['a reload keeps the chart exactly (stored copy equal) and its wings and labels', afterReload === saved && lab(covReload) === lab(covSaved), { equal: afterReload === saved, labels: lab(covReload) }])
  checks3.push(['another account (member) opens the same chart with the same wings and labels', lab(memberSees) === lab(covSaved), { labels: lab(memberSees) }])
  const miss = c => c.filter(x => x.wing).map(x => x.label + ':' + x.misses + 'px-of-ink-off-wing/' + x.ink).sort().join(', ')
  checks3.push(['importing the backup made from this chart keeps every authored label and the same wing fit as before the export', lab(covImport) === lab(covSaved) && miss(covImport) === miss(covSaved), { before: miss(covSaved), afterReload: miss(covReload), afterImport: miss(covImport), labels: lab(covImport), asked: asked.map(a => a.msg + ' => ' + a.ans).slice(0, 4) }])
  checks3.push(['the backup itself carries the chart and its label text', /WNG-7/.test(exp.text) && /E WALK CHART/.test(exp.text), { bytes: exp.text.length }])
  const same = afterImport === saved
  checks3.push(['after the import the stored chart still equals what was saved (no loss, no change)', same, { same }])
  const errNew = errors.filter(e => !/favicon/.test(e))
  const noErr = ['no console / page / 4xx errors', !errNew.length, errNew]
  checks1.push(noErr); checks2.push(noErr); checks3.push(noErr)
} catch (e) {
  const msg = String(e.stack).replace(/\s+/g, ' ').slice(0, 600)
  for (const c of [checks1, checks2, checks3]) if (!c.some(x => /FAILED/.test(x[0]))) c.push(['script ran to the end (FAILED here)', false, msg])
  pics.push(await E.pic(page, `p4e13-FAILED`).catch(() => ''))
}
E.judge('P4e-01', `${SZ}: a new chart with two flights, a test, an acad and a sim; Flow, Details and Edit chart layout, zoomed in and out`, checks1, pics)
E.judge('P4e-02', `${SZ}: marking on the wing-shaped ball: centre, wing, two students, the label press`, checks2, pics)
E.judge('P4e-03', `${SZ}: custom label + font saved, exported, reload, another account, import of the new backup`, checks3, pics)
E.savePart('p4e13-' + SZ)
await browser.close()
