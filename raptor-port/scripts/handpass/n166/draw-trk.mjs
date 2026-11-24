// draw-trk - [MSQ-PICK-GUARD] step 2, pictures 5 and 8 (desktop), the Tracker.
//  p5: an unsaved chart edit (a new test event "N166EV" made in Edit chart layout, the editor closed again - step 1's
//      trk-b way), then the member-view switch (the name badge) pressed.
//      TODAY: pressed through - nothing asked, the member view, the edit still on the chart.
//      AFTER: T1 - the pick's own question card (raised here by the pick of 149, the badge itself NOT pressed: that is the
//      part to build), its words changed to the member-view wording; its three answers as they are (Stay, Discard them,
//      Save them).
//  p8: the Tracker failing part-way through a switch (step 1's trk-e3 way, WITHOUT an Input window open - with the guard a
//      window open would refuse the pick): Saber opens the Tracker (loaded on 142), goes to Inputs, and picks 149 with the
//      STAND-IN of chat 162 ('mapget': every read of 149's Tracker records throws, installed just before the pick), then
//      opens the Tracker page. TODAY: the buttonless "Couldn't finish upgrading your Tracker data" panel. AFTER: the same
//      screen with the shade and the F3 card over it.
//   node raptor-port/scripts/handpass/n166/draw-trk.mjs        (ONLY=p5,p8)
// Pictures: drawn/p5-d-*.png, drawn/p8-d-*.png
import { mk, closeAll, FACT, signIn, go, barSq, pageOn, roleNow, reachPick, reachView, wait } from './lib.mjs'
import { hit, vis, shot, refreshCard } from './draw-lib.mjs'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const T1 = 'You have unsaved chart edits on “2026”. Save them before switching to the member view?'
const F3 = { title: 'The switch to 149 didn\'t finish', body: 'The Tracker stopped part-way. Refresh and sign in again. Anything you hadn\'t saved is lost.' }
const hasEdit = s => s.page.evaluate(() => (document.querySelector('#page-tracker')?.innerText || '').includes('N166EV'))
async function chartEdit(s) {
  const { page } = s
  await go(s, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 600)
  await hit(s, '#sylMenuBtn', 300); await hit(s, '#arrangeBtn', 400)
  const add = page.locator('#arrTools button', { hasText: '+ Test' }).first()
  if (!(await add.isVisible())) await hit(s, page.locator('#page-tracker button', { hasText: 'Tools ▾' }).filter({ visible: true }).first(), 300)
  await hit(s, add, 400); await page.waitForSelector('#dlgInput:visible')
  await vis(s, '#dlgInput').first().fill('N166EV'); await hit(s, '#dlgOk', 400)
  await hit(s, '#sylMenuBtn', 300); await hit(s, '#arrangeBtn', 500)
  if (!(await hasEdit(s))) throw new Error('the unsaved chart edit N166EV is not on the chart')
}
const question = s => s.page.evaluate(() => {
  const m = document.querySelector('#dlgMsg'), d = document.querySelector('#dlgModal')
  if (!m || m.getBoundingClientRect().width < 1) return null
  return { words: m.textContent.replace(/\s+/g, ' ').trim(), buttons: [...d.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()) }
})
const saveDrawn = s => s.page.evaluate(() => [...document.querySelectorAll('#page-tracker button')].filter(b => b.getBoundingClientRect().width > 0 && /Save changes/.test(b.textContent)).map(b => b.textContent.trim()))
async function run(key, fn) { const s = await mk('d'); try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 200)); process.exitCode = 1 } finally { await s.ctx.close().catch(() => {}) } }

if (want('p5')) {
  await run('p5.d.today', async s => {
    await signIn(s, 'ad', 'a'); await chartEdit(s); FACT('p5.d.today.editMade', true)
    FACT('p5.d.today.press', await reachView(s)); await wait(s, 600)
    FACT('p5.d.today.after', { question: await question(s), role: (await roleNow(s)).badge, page: await pageOn(s), editOnChart: await hasEdit(s), saveButton: await saveDrawn(s) })
    await shot(s, 'p5-d-today'); await shot(s, 'p5-d-today-crop', ['#roleBadge', '#page-tracker .tr-root button', '[data-id="N166EV"], .ball'], 14)
  })
  await run('p5.d.after', async s => {
    await signIn(s, 'ad', 'a'); await chartEdit(s); FACT('p5.d.after.editMade', true)
    /* the pick's own question raised by its own press; then only its words changed */
    const p = await reachPick(s, 149, 'bar'); FACT('p5.d.after.raisedByThePickOf149', { pressed: !!p.pressed })
    const q0 = await question(s); FACT('p5.d.after.realQuestion', q0)
    if (!q0) throw new Error('the pick raised no question')
    await s.page.evaluate(t => { document.querySelector('#dlgMsg').textContent = t }, T1)
    await wait(s, 200)
    FACT('p5.d.after.question', await question(s))
    FACT('p5.d.after.state', { squadron: await barSq(s), role: (await roleNow(s)).badge, page: await pageOn(s) })
    await shot(s, 'p5-d-after'); await shot(s, 'p5-d-after-crop', ['#dlgModal', '#roleBadge'], 16)
  })
}
async function failedSwitch(s, k) {
  const { page } = s
  await signIn(s, 'ad', 'a')
  await go(s, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 600)
  FACT(`${k}.trackerLoadedOn`, await barSq(s))
  await go(s, 'inputs'); await wait(s, 600)
  await page.evaluate(() => { window.__n166 = { hits: 0 }; const g = Map.prototype.get; Map.prototype.get = function (key) { if (typeof key === 'string' && key.startsWith('tracker/u149@')) { window.__n166.hits++; throw new Error('store refused a read') } return g.call(this, key) } })
  FACT(`${k}.standIn`, 'reads of 149\'s Tracker records refused (Map.prototype.get throws for tracker/u149@ keys), from just before the pick')
  const p = await reachPick(s, 149, 'bar'); FACT(`${k}.press`, { pressed: !!p.pressed }); await wait(s, 2500)
  await go(s, 'tracker'); await wait(s, 1500)
  const panel = await page.evaluate(() => { const root = document.querySelector('#page-tracker .tr-root'); return { text: (document.querySelector('#page-tracker')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 240), buttons: root ? [...root.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()).slice(0, 8) : [], chart: !!document.querySelector('#flowSvg .ball'), standInHits: window.__n166.hits } })
  FACT(`${k}.trackerPage`, { squadron: await barSq(s), page: await pageOn(s), ...panel })
  if (!/Couldn.t finish/.test(panel.text)) throw new Error('the failed-switch panel did not show')
}
if (want('p8')) {
  await run('p8.d.today', async s => {
    await failedSwitch(s, 'p8.d.today')
    await shot(s, 'p8-d-today')
    /* the crop: the panel's own words (its heading and its line), marked for the crop only */
    await s.page.evaluate(() => { for (const e of document.querySelectorAll('#page-tracker *')) if (!e.children.length && /Couldn.t finish|Reload to try again/.test(e.textContent) && e.getBoundingClientRect().width > 0) e.setAttribute('data-n166p', '1') })
    await shot(s, 'p8-d-today-crop', ['[data-n166p]', '.topbar .mark'], 40)
  })
  await run('p8.d.after', async s => {
    await failedSwitch(s, 'p8.d.after')
    await refreshCard(s, 'p8.d.after', F3)
    await shot(s, 'p8-d-after'); await shot(s, 'p8-d-after-crop', ['#n166card'], 60)
  })
}
await closeAll()
