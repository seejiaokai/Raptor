// draw-q20 - question 20 (chat 204): a row or a form on the Admin page whose section is not showing. A desktop, 1536x864,
// at 2x. Saber (150 made first, so three squadrons are in the list), Admin. Each case in its own fresh browser:
//   a     Squadrons: "+ New squadron", 151 typed -> Users shown -> 149 pressed for. Whole + crop, both wordings.
//   b     Squadrons: 142's row opened, its Place changed -> Users shown -> 149. Crop only, both wordings.
//   c     Users: "+ Add a person", a callsign typed -> Squadrons shown -> 149. Whole + crop, both wordings.
//   d     (someone asks for access first, on the sign-in screen) Users: "Give access", its Role changed -> Squadrons
//         shown -> 149. Crop only, both wordings.
//   twin  his ruled twin, as the app says it today: a man's row on Users changed -> Squadrons shown -> 149. Crop only.
// The picker's list is opened and closed again (the press refused), then the app's own whatIsOpen / guardSay raise the
// note (q-lib.mjs). The recommended wording is swapped into the same note.
//   node raptor-port/scripts/handpass/n204/draw-q20.mjs        (ONLY=a,b,c,d,twin)
import { run, closeAll, FACT, signIn, URL_, wait, vis, hit, boxOf, barSq, windowsNow, listOpenedAndClosed, refuseAppWay, swapWords, noteFacts, tring, untring, sshot, make150, adminCat } from './q-lib.mjs'

const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const T = lead => `Blocked: ${lead}, then pick 149.`
const shownCat = s => s.page.evaluate(() => {
  const cats = [...document.querySelectorAll('#page-admin button.adm-cat')].filter(b => b.getBoundingClientRect().width > 0)
  return cats.map(b => b.textContent.replace(/\s+/g, ' ').trim() + (b.getAttribute('aria-pressed') === 'true' || b.getAttribute('aria-current') || b.classList.contains('on') || b.classList.contains('active') ? ' (showing)' : ''))
})
const catBox = (s, label) => s.page.evaluate(label => { const b = [...document.querySelectorAll('#page-admin button.adm-cat')].find(e => e.getBoundingClientRect().width > 0 && e.textContent.trim().startsWith(label)); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, label)
const openNow = s => s.page.evaluate(() => { const w = window.__n204.open([]); return w && { reason: w.reason, id: w.row.id } })

/* the refusal, drawn with its words as built, then the recommended words in the same note */
async function draw(s, k, name, showing, built, rec, whole) {
  FACT(`${k}.before`, { squadron: await barSq(s), sections: await shownCat(s), openNow: await openNow(s), windows: (await windowsNow(s)).map(w => w.testid || w.what) })
  await listOpenedAndClosed(s, k)
  const r = await refuseAppWay(s, k, 'u149')
  const m = await noteFacts(s, `${k}.built`, built, { picker: '#sqnMenuBtn' })
  FACT(`${k}.after`, { squadron: await barSq(s), refusal: r.refusal })
  const pick = await boxOf(s, '#sqnMenuBtn'), cat = await catBox(s, showing), other = await catBox(s, showing === 'Users' ? 'Squadrons' : 'Users')
  /* what the note stands over: the page's own title, drawn under the bar at the left */
  FACT(`${k}.underTheNote`, await s.page.evaluate(() => { const t = document.querySelector('#toastEl'), b = t.getBoundingClientRect(); t.style.visibility = 'hidden'; const e = document.elementFromPoint(b.right + 3, b.top + b.height / 2); t.style.visibility = ''; return e ? { tag: e.tagName.toLowerCase(), cls: String(e.className).slice(0, 40), words: (e.textContent || '').trim().slice(0, 30) } : null }))
  let ring = await tring(s, m.box, 'the note')
  await sshot(s, `${name}-built`, [ring, pick, cat, other], 14, whole)
  await untring(s)
  if (!rec) return
  await swapWords(s, k, rec)
  const m2 = await noteFacts(s, `${k}.rec`, rec, { picker: '#sqnMenuBtn' })
  ring = await tring(s, m2.box, 'the note')
  await sshot(s, `${name}-recommended`, [ring, pick, cat, other], 14, whole)
}
async function start(s, k) { await signIn(s, 'ad', 'a'); await make150(s, k) }

if (want('a')) await run('q20a', 'd', async s => {
  const k = 'q20a'
  await start(s, k)
  await adminCat(s, 'Squadrons')
  await hit(s, '#sqNew', 500)
  await vis(s, '#sqNewNum').first().click(); await s.page.keyboard.type('151'); await wait(s, 300)
  FACT(`${k}.typed`, await s.page.inputValue('#sqNewNum'))
  await adminCat(s, 'Users')
  await draw(s, k, 'q20a', 'Users', T('save or cancel the new squadron'), T('save or cancel the new squadron on Squadrons'), true)
})

if (want('b')) await run('q20b', 'd', async s => {
  const k = 'q20b'
  await start(s, k)
  await adminCat(s, 'Squadrons')
  await hit(s, '#sqList [data-unit="u142"] .acc-tap', 600)
  const opts = await s.page.evaluate(() => [...(document.querySelector('#sqPlace')?.options || [])].map(o => ({ v: o.value, t: o.textContent.trim(), on: o.selected })))
  FACT(`${k}.placeOptions`, opts)
  const other = opts.find(o => !o.on)
  if (!other) throw new Error('the Place list offers nothing else')
  await s.page.selectOption('#sqPlace', other.v); await wait(s, 400)
  FACT(`${k}.placeChangedTo`, other.t)
  await adminCat(s, 'Users')
  await draw(s, k, 'q20b', 'Users', T('save or cancel the open row'), T('save or cancel the open row on Squadrons'), false)
})

if (want('c')) await run('q20c', 'd', async s => {
  const k = 'q20c'
  await start(s, k)
  await adminCat(s, 'Users')
  await hit(s, '#accAddOpen', 600)
  await vis(s, '#accAddCs').first().click(); await s.page.keyboard.type('Nova'); await wait(s, 300)
  FACT(`${k}.typed`, await s.page.inputValue('#accAddCs'))
  await adminCat(s, 'Squadrons')
  await draw(s, k, 'q20c', 'Squadrons', T('add or cancel the new person'), T('add or cancel the new person on Users'), true)
})

if (want('d')) await run('q20d', 'd', async s => {
  const k = 'q20d', { page } = s
  /* someone asks for access: a new name on the sign-in screen, the access form filled and sent, then signed out */
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', 'newface@mail'); await page.fill('#lpass', 'x')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#accForm', { timeout: 15000 })
  const sq = await page.evaluate(() => [...document.querySelector('#accSqn')?.options || []].map(o => ({ v: o.value, t: o.textContent.trim() })))
  FACT(`${k}.accessSquadrons`, sq)
  const o142 = sq.find(o => /142/.test(o.t)); if (o142) await page.selectOption('#accSqn', o142.v)
  await page.fill('#accCs', 'Newface'); await page.fill('#accIni', 'NF')
  const seat = await page.evaluate(() => [...document.querySelector('#accSeat').options].map(o => o.value).find(v => v)); if (seat) await page.selectOption('#accSeat', seat)
  const cat = await page.evaluate(() => { const e = document.querySelector('#accCat'); return e ? [...e.options].map(o => o.value).find(v => v) : null }); if (cat) await page.selectOption('#accCat', cat)
  await page.click('#accSend'); await wait(s, 900)
  FACT(`${k}.asked`, { err: await page.locator('#accErr').textContent().catch(() => null), waiting: await page.locator('#accAsked').textContent().catch(() => null) })
  await page.click('#accOut'); await wait(s, 800)
  await start(s, k)
  await adminCat(s, 'Users')
  await hit(s, '[data-approve]', 600)
  const roles = await page.evaluate(() => [...(document.querySelector('#apvRole')?.options || [])].map(o => ({ v: o.value, t: o.textContent.trim(), on: o.selected })))
  FACT(`${k}.roles`, roles)
  const other = roles.find(o => !o.on && /admin/i.test(o.t)) || roles.find(o => !o.on)
  await page.selectOption('#apvRole', other.v); await wait(s, 400)
  FACT(`${k}.roleChangedTo`, other.t)
  await adminCat(s, 'Squadrons')
  await draw(s, k, 'q20d', 'Squadrons', T('finish or cancel giving access'), T('finish or cancel giving access on Users'), false)
})

if (want('twin')) await run('q20twin', 'd', async s => {
  const k = 'q20twin', { page } = s
  await start(s, k)
  await adminCat(s, 'Users')
  const pid = await page.evaluate(() => { const e = [...document.querySelectorAll('#page-admin [data-person]:not([data-archived])')].find(r => r.getBoundingClientRect().height > 0 && r.querySelector('.acc-tap:not([disabled])') && !/Saber/.test(r.innerText)); if (e) e.setAttribute('data-q20t', '1'); return e ? e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) : null })
  FACT(`${k}.row`, pid)
  await hit(s, '[data-q20t] .acc-tap', 600)
  const box = vis(s, '#accEdName, #accGiveName').first()
  await box.click(); await page.keyboard.press('End'); await page.keyboard.type('x'); await wait(s, 300)
  FACT(`${k}.typed`, await box.inputValue())
  await adminCat(s, 'Squadrons')
  await draw(s, k, 'q20twin', 'Squadrons', T('save or cancel the open row on Users'), null, false)
})
await closeAll()
