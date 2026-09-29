/* [TRK-DLG-LEFTOVERS] 2 — Enter while a word is still being composed is not an answer
   (the leftovers walk, walker a, 28 Sep 26). Assertions of the RIGHT behaviour: a PASS
   means correct. Order list: Fable's B2, Astra scenario 6.
   A word "in composition" is driven through the browser's own input-method path (CDP
   Input.imeSetComposition — the word held underlined, as a phone keyboard's predictive
   text or a kana/pinyin input holds it), then Enter / Ctrl+Enter pressed through the
   browser's own key path (Input.dispatchKeyEvent) while it is still held; then the word
   is committed (Input.insertText) and the same key pressed again.
   Desktop 1440x900, then a phone 390x844 with touch.

     HP_URL=http://localhost:4175 HP_SHOTS=<dir> HP_OUT=<dir> node scripts/handpass/trk-lo-2a-ime.mjs
     LO_ONLY=desk|phone to run one size. */
import { open, save, log, DESK, PHONE } from './trk-lib.mjs'
import { sleep, press, menu, qText, waitQ, half, choose, shot } from './trk-lo-2a-lib.mjs'

const L = log()
const allErrors = []
const j = o => JSON.stringify(o)

for (const mode of (process.env.LO_ONLY ? [process.env.LO_ONLY] : ['desk', 'phone'])) {
  const touch = mode === 'phone'
  const M = touch ? 'P' : 'D'
  const S = (n, what) => `lo-2a-C${M}${n}-${what}`
  const { browser, page, errors } = await open({ size: touch ? PHONE : DESK, who: 'a', touch })
  const cdp = await page.context().newCDPSession(page)
  /* every keydown the page sees, with its composing flag — reading only */
  await page.evaluate(() => { window.__keys = []; document.addEventListener('keydown', e => { if (e.key === 'Enter') window.__keys.push({ t: e.target.id || e.target.tagName.toLowerCase(), composing: e.isComposing, ctrl: e.ctrlKey }) }, true) })
  const lastKey = () => page.evaluate(() => window.__keys[window.__keys.length - 1] || null)
  const compose = async text => { await cdp.send('Input.imeSetComposition', { text, selectionStart: text.length, selectionEnd: text.length }); await sleep(150) }
  const commit = async text => { await cdp.send('Input.insertText', { text }); await sleep(200) }
  const enter = async (ctrl = false) => {
    const k = { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, modifiers: ctrl ? 2 : 0 }
    await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...k })
    await cdp.send('Input.dispatchKeyEvent', { type: 'char', ...k, text: '\r', unmodifiedText: '\r' }).catch(() => {})
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...k })
    await sleep(400)
  }
  const course = () => page.evaluate(() => { const c = document.getElementById('courseSel'); return c.options[c.selectedIndex].textContent })
  const students = () => page.evaluate(() => [...document.querySelectorAll('#activeSel option')].map(o => o.textContent))

  /* ---- 1. the question box's text box (✎ Rename course) ---- */
  await menu(page, 'course', 'renCourse', touch); await waitQ(page); await sleep(250)
  await page.keyboard.press('End')
  await compose('か')
  const v1 = await page.inputValue('#dlgInput')
  await enter()
  const k1 = await lastKey()
  const up1 = await qText(page)
  L.ok(`${M} 1 Rename course: Enter while "か" is still being composed does NOT answer — the question stays, nothing renamed`, !!up1 && (await course()) === '26ABSG' && k1 && k1.composing === true,
    `box "${v1}" · the Enter the page saw: ${j(k1)} · question up: ${!!up1} · course "${await course()}"`)
  await shot(page, S('01', 'rename-composing-enter'))
  await commit('か')
  await enter()
  L.ok(`${M} 1 …the word committed, Enter answers OK as usual: renamed`, !(await qText(page)) && (await course()) === '26ABSGか', `course now "${await course()}" · the Enter: ${j(await lastKey())}`)
  await menu(page, 'course', 'renCourse', touch); await waitQ(page); await page.fill('#dlgInput', '26ABSG'); await press(page, '#dlgOk', touch); await sleep(500)

  /* ---- 2. + Add's roster search with ONE match left ---- */
  await half(page, 'info', touch)
  await press(page, '#addStu:visible', touch); await waitQ(page); await sleep(300)
  await page.locator('#dlgFilter').pressSequentially('Talis', { delay: 40 })
  await compose('m')
  const rows2 = await page.evaluate(() => [...document.querySelectorAll('#dlgList .dlg-item')].map(b => b.querySelector('.dlg-lbl').textContent))
  await enter()
  const k2 = await lastKey()
  L.ok(`${M} 2 + Add search "Talis" + "m" being composed, one person left: Enter does NOT pick him`, !!(await qText(page)) && !(await students()).some(s => s.toUpperCase() === 'TALISMAN') && k2 && k2.composing === true,
    `rows ${j(rows2)} · the Enter: ${j(k2)} · box still up: ${!!(await qText(page))} · students ${j(await students())}`)
  await shot(page, S('02', 'add-search-composing-enter'))
  await commit('m')
  await enter()
  L.ok(`${M} 2 …committed, Enter picks the one person left as usual`, !(await qText(page)) && (await students()).some(s => s.toUpperCase() === 'TALISMAN'), `students ${j(await students())}`)

  /* ---- 3. + Add's roster search with a name matching NOBODY (D191: OK adds it) ---- */
  await press(page, '#addStu:visible', touch); await waitQ(page); await sleep(300)
  await page.locator('#dlgFilter').pressSequentially('ZQX', { delay: 40 })
  await compose('Q')
  const line3 = await page.evaluate(() => { const m = document.getElementById('dlgModal'); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 200) : '' })
  await enter()
  const k3 = await lastKey()
  L.ok(`${M} 3 + Add search "ZQX" + "Q" being composed, nobody matches: Enter does NOT add a half-typed name`, !!(await qText(page)) && !(await students()).some(s => /^ZQX/.test(s)) && k3 && k3.composing === true,
    `box said "${line3}" · the Enter: ${j(k3)} · students ${j(await students())}`)
  await commit('Q')
  await enter()
  L.ok(`${M} 3 …committed, Enter adds the whole name "ZQXQ" as usual (D191)`, !(await qText(page)) && (await students()).includes('ZQXQ'), `students ${j(await students())}`)
  await half(page, 'flow', touch)

  /* ---- 4. the Find event box ---- */
  if (touch) await press(page, '#hSearchBtn', true)
  await page.locator('#hSearch').click(); await sleep(150)
  await page.locator('#hSearch').pressSequentially('ACG', { delay: 40 })
  await compose('-0')
  const stat0 = await page.locator('#hSearchStat').innerText()
  await enter()
  const k4 = await lastKey()
  const stat1 = await page.locator('#hSearchStat').innerText()
  L.ok(`${M} 4 Find event "ACG" + "-0" being composed: Enter does NOT step to the next match`, stat1 === stat0 && k4 && k4.composing === true, `"${stat0}" → "${stat1}" · the Enter: ${j(k4)} · box "${await page.inputValue('#hSearch')}"`)
  await shot(page, S('03', 'find-composing-enter'))
  await commit('-0')
  const stat2 = await page.locator('#hSearchStat').innerText()
  await enter()
  const stat3 = await page.locator('#hSearchStat').innerText()
  L.ok(`${M} 4 …committed, Enter steps to the next match as usual`, stat3 !== stat2 && /^2 of/.test(stat3), `"${stat2}" → "${stat3}"`)
  await press(page, '#hSearchClear', touch).catch(() => {})
  if (touch && await page.locator('#hSearchPanel.on').count()) await press(page, '#hSearchBtn', true).catch(() => {})

  /* ---- 5. Show All's editor: Ctrl+Enter saves, not while a word is composed ---- */
  if (touch) await press(page, '#viewtabs button:has-text("Show All")', true); else await press(page, '#showAllBtn', false)
  await page.waitForSelector('#showAllPanel', { state: 'visible' }); await sleep(250)
  await page.fill('#saSearch', 'ACG-01'); await sleep(300)
  const row = page.locator('#saBody .sarow').filter({ has: page.locator('.sid', { hasText: /^ACG-01$/ }) }).first()
  for (const [field, sel] of [['Name', '.saedit label:has-text("Name") input'], ['Crew', '.saedit label:has-text("Crew") textarea']]) {
    await row.locator('button.sedit').click(); await sleep(300)
    const box = page.locator(sel).first()
    await box.click(); await page.keyboard.press('End')
    const was = await box.inputValue()
    await compose('ね')
    await enter(true)
    const k5 = await lastKey()
    const open5 = await page.locator('.saedit').count()
    L.ok(`${M} 5 Show All → ACG-01 → Edit → ${field}: Ctrl+Enter while "ね" is being composed does NOT save — the editor stays open`, open5 === 1 && k5 && k5.composing === true && k5.ctrl === true, `the Ctrl+Enter: ${j(k5)} · editor open: ${open5}`)
    if (field === 'Name') await shot(page, S('04', 'showall-composing-ctrl-enter'))
    await commit('ね')
    await enter(true)
    const open6 = await page.locator('.saedit').count()
    const txt = (await row.innerText()).replace(/\s+/g, ' ')
    L.ok(`${M} 5 …committed, Ctrl+Enter saves as usual: the editor closes, the row shows the new ${field}`, open6 === 0 && txt.includes(was + 'ね'), `editor open: ${open6} · row "${txt.slice(0, 140)}"`)
  }
  await press(page, '#saClose', touch).catch(() => {})

  L.note(`${M} console / page errors`, errors.join(' | ') || 'none')
  allErrors.push(...errors.map(e => M + ': ' + e))
  await browser.close()
}

save('lo-2a-ime', { rows: L.rows, errors: allErrors })
const fails = L.rows.filter(r => r.pass === false).length
console.log(`\n${fails} FAIL · errors ${JSON.stringify(allErrors)}`)
process.exit(fails ? 1 : 0)
