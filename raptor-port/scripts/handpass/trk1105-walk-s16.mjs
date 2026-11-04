/* S16 — sign out with unsaved chart edits, from another page (D admin; P admin WebKit).
   "Unsaved chart edit" = a STRUCTURE edit made in Edit chart layout (the typed crew of ST-01 through a double-tap on the ball):
   a moved ball saves itself and is not an unsaved edit (the first run's finding about the script's world).
   node scripts/handpass/trk1105-walk-s16.mjs */
import { open, back, login, navTo, keys, diffKeys, classify, ocuAny, pair, words, click, shot, revealBall, answerDialogs, mk, sleep, D, P } from './trk1105-walk-lib.mjs'
console.log('trk1105-walk-s16 v2')
const L = mk('S16')
const logoutBtn = async (page, touch) => {
  if (touch) { await page.click('#burger'); await sleep(400); await page.locator('#drawer').getByText(/Log ?out/i).first().tap() }
  else await page.locator('#logout').click()
}
const showAllHas = async (page, touch, txt) => {
  await click(page, touch ? '#page-tracker button:visible:has-text("Show All")' : '#showAllBtn', touch); await sleep(700)
  const has = (await page.locator('body').innerText()).includes(txt)
  await page.keyboard.press('Escape'); await sleep(400)
  if (await page.getByText('All events — name, crew & prerequisites').first().isVisible().catch(() => false)) { await page.locator('button:visible:has-text("Close")').first().click(); await sleep(300) }
  return has
}
for (const [tag, engine, size, touch] of [['D', 'chromium', D, false]]) {
  const { browser, page, errors } = await open({ engine, size, touch, who: 'a' })
  const T = async (name, fn) => { try { await fn() } catch (e) { L.ok(name, tag, 'admin', false, 'SCRIPT STOP: ' + String(e.message).split('\n').slice(0, 3).join(' ').slice(0, 300)) } }
  const editDetail = async (txt, id = 'ST-01') => {
    await click(page, '#sylMenuBtn', touch); await click(page, '#arrangeBtn', touch); await sleep(600)
    if (touch) { const tb = page.locator('#arrTools button[title^="Click a ball to edit"]').first(); await tb.tap(); await sleep(300) }
    const c = await revealBall(page, id)
    await page.mouse.dblclick(c.x, c.y)
    await page.waitForSelector('#edText', { state: 'visible' })
    await page.fill('#edText', txt); await click(page, '#edSave', touch); await sleep(700)
  }
  await T('save route', async () => {
    const kStart = await keys(page)
    await editDetail('S16NAME')
    const stillArr = await page.locator('#arrTools.on').count()
    L.note('Edit chart layout still on, edit made and not saved', 'arrange on ' + stillArr)
    await navTo(page, 'editsched', touch); await sleep(500)
        await logoutBtn(page, touch); await sleep(1000)
    const onTracker = await page.evaluate(() => window.CURPAGE)
    const dlgText = (await page.locator('#dlgModal:visible').innerText().catch(() => '')).replace(/\n+/g, ' / ')
    const labels = await page.locator('#dlgModal button:visible').allInnerTexts().catch(() => [])
    L.ok('Logout from Edit Schedule: the Tracker comes to the front with Save / Discard / Stay', tag, 'admin', onTracker === 'tracker' && /Save/i.test(labels.join()) && /Discard/i.test(labels.join()) && /Stay/i.test(labels.join()), `page ${onTracker}; dialog "${dlgText.slice(0, 140)}" buttons ${JSON.stringify(labels)}`, await shot(page, `S16-${tag}-1-question`))
    const stay = page.locator('#dlgModal button:visible', { hasText: /Stay/i }).first()
    if (touch) await stay.tap(); else await stay.click()
    await sleep(900)
    const still = (await page.locator('#luser').count()) === 0
    L.ok('Stay: still signed in, the edit is still there to save', tag, 'admin', still && (await page.locator('#arrTools.on').count()) === 1, `signed in ${still}`, await shot(page, `S16-${tag}-2-stay`))
    await navTo(page, 'inputs', touch); await sleep(500)
    await logoutBtn(page, touch); await sleep(1000)
    const b2 = await page.locator('#dlgModal button:visible').allInnerTexts().catch(() => [])
    const save = page.locator('#dlgModal button:visible', { hasText: /^Save/i }).first()
    if (touch) await save.tap(); else await save.click()
    await sleep(2500)
    const k1 = await keys(page), cl = classify(diffKeys(kStart, k1))
    L.ok('Logout (started from Inputs) then Save: saved under raptor:tracker/ only; the sign-in card shows', tag, 'admin', (await page.locator('#luser').count()) === 1 && cl.tracker.length > 0 && cl.ocu.length === 0 && ocuAny(k1).length === 0, `buttons ${JSON.stringify(b2)}; tracker keys changed ${cl.tracker.length}; ocu ${cl.ocu.length}`, await shot(page, `S16-${tag}-3-after-save-logout`))
    await login(page, 'u')
    await navTo(page, 'tracker', touch); await page.waitForSelector('#flowSvg .ball'); await sleep(600)
    const pr = await pair(page), w = await words(page)
    const has = await showAllHas(page, touch, 'S16NAME')
    L.ok('signed in as the member: the saved edit shows (Show All); the top bar undo is greyed; no stale words in the corner', tag, 'member', has && pr.undoOff === true, `S16NAME shown ${has}; undo ${pr.undoOff ? 'greyed' : 'lit'} "${pr.title}"; corner "${w.corner}"`, await shot(page, `S16-${tag}-4-member`))
  })
  await T('discard route', async () => {
    await logoutBtn(page, touch); await sleep(1000)
    if (await page.locator('#dlgModal:visible').count()) await answerDialogs(page, [/^Discard/i], 2000)
    await login(page, 'a'); await navTo(page, 'tracker', touch); await page.waitForSelector('#flowSvg .ball'); await sleep(600)
    await editDetail('S16DISCARD', 'ST-02')
    await navTo(page, 'leavewar', touch); await sleep(900)
    await logoutBtn(page, touch); await sleep(1000)
    const onT = await page.evaluate(() => window.CURPAGE)
    const labels = await page.locator('#dlgModal button:visible').allInnerTexts().catch(() => [])
    L.ok('Logout from the Leave War: the Tracker comes to the front with the question', tag, 'admin', onT === 'tracker' && labels.length >= 3, `page ${onT}; buttons ${JSON.stringify(labels)}`, await shot(page, `S16-${tag}-5-question-from-leavewar`))
    const disc = page.locator('#dlgModal button:visible', { hasText: /^Discard/i }).first()
    if (touch) await disc.tap(); else await disc.click()
    await sleep(2200)
    await login(page, 'a'); await navTo(page, 'tracker', touch); await page.waitForSelector('#flowSvg .ball'); await sleep(600)
    const a1 = await showAllHas(page, touch, 'S16DISCARD')
    await page.reload(); await back(page, 'a', touch)
    const a2 = await showAllHas(page, touch, 'S16DISCARD')
    const keep = await showAllHas(page, touch, 'S16NAME')
    L.ok('Discard: the discarded edit is gone, also after a reload; the earlier saved one stays', tag, 'admin', !a1 && !a2 && keep, `discarded shown after discard ${a1}, after reload ${a2}; saved S16NAME still shown ${keep}`, await shot(page, `S16-${tag}-6-after-discard`))
  })
  L.note(`${tag} errors`, errors.join(' | ').slice(0, 400) || 'none')
  await browser.close()
}
L.ok('P: the ball editor on a phone (double-tap / Text tool) in WebKit and in Chromium touch', 'P', 'admin', null, 'NOT WALKED: after 4 attempts (two taps, the Text tool then a tap, a mouse double-click, in WebKit and in Chromium touch) the ball editor never opened on the phone-size screen, so no unsaved chart edit could be made there; the question itself is covered at D')
L.save('S16')
