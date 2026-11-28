// draw-q25 v2 - question 25 (chat 204, 27 Nov 26): "Add a person" open when his own move lands at midnight - for a master
// admin (Saber) and, by the orchestrator's change of 27 Nov, for a non-master admin (Hunter). A desktop, 1536x864, at 2x,
// the page clock installed on Wed 15 Jul 2026 late evening (Singapore time) and left RUNNING, then run forward past midnight
// (q2425-lib.mjs clockTo - the app's own timers fire on the way, and the window's focus event is sent, as the tests'
// pastMidnight does).
// NO SCREEN SAVES A MOVE OF SQUADRON (the posting sheet is not built): each move is written as SETUP into the browser's
// saved data, as the walk libraries do it (msq/msq-rs-lib.mjs writeHome) - his home rows, the old squadron from 1 Jan, the
// new from Thu 16 Jul. Everything else is a real press, except where a drawing is named DRAWN, NOT BUILT.
//   b         the look 25-2 would copy: Hunter (142's admin) moves to 149 (as the Input window's midnight test). Inputs ->
//             List -> "+ Input", Remarks typed; midnight: the window held, its band and Close, his words under it. Its
//             band's markup is read and handed to s-band.
//   s-today   Saber makes 150; his move 142 -> 150 written; Admin -> Users (142's) -> "+ Add a person", callsign, seat, CAT
//             typed; before midnight; after midnight (the page 150's, the form open, nothing said); 25-2 DRAWN: the band on
//             the form, Add doing nothing; then the drawing taken away and Add pressed: the toast and 150's list.
//   s-note    25-1 DRAWN, NOT BUILT, for Saber: the same to after midnight, then the form closed by its own Cancel and the
//             app's own passing note raised with the DRAFT words "Bandit was not added: you are 150’s from today."
//   h         Hunter (142's admin, not a master), his move 142 -> 150 written (Saber makes 150 first, then signs out);
//             first, for comparison, the app's own passing note raised with his ruled words for a row thrown away
//             ("<callsign>’s row changed while it was open, so nothing was saved. Open it again." - built on the Users
//             branch, not in this build); then "+ Add a person", callsign typed; before midnight; after midnight: where the
//             app lands him, nothing said (today); 25-1 DRAWN: the draft note "Typedman was not added: you are 150’s from
//             today." raised there.
//   node raptor-port/scripts/handpass/n204/draw-q25.mjs        (ONLY=b,s-today,s-note,h)
import { run, closeAll, FACT, signIn, wait, vis, hit, boxOf, barSq, badge, curPage, go, adminCat, make150, tring, untring, sshot, toastNow, clockTo, URL_, sayNote, tag } from './q2425-lib.mjs'

const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const EVE = '2026-07-15T23:40:00', PAST = '2026-07-16T00:00:05', MOVE_DAY = '2026-07-16'
const DRAFT = cs => `${cs} was not added: you are 150’s from today.`
const ROWNOTE = cs => `${cs}’s row changed while it was open, so nothing was saved. Open it again.`

/* SETUP: his move of squadron as the walk libraries write it (no screen saves one) */
const writeHome = (s, m) => s.page.evaluate(m => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('raptor:settings/home:'))
  const has = keys.some(k => { try { return JSON.parse(localStorage.getItem(k)).pid === m.pid } catch { return false } })
  const id = n => 'h' + (Date.now() + n).toString(36) + Math.random().toString(36).slice(2, 6)
  const out = []
  if (!has) { const a = id(0); localStorage.setItem('raptor:settings/home:' + a, JSON.stringify({ id: a, pid: m.pid, unit: m.from, from: '2026-01-01' })); out.push(a) }
  const b = id(1); localStorage.setItem('raptor:settings/home:' + b, JSON.stringify({ id: b, pid: m.pid, unit: m.to, from: m.day })); out.push(b)
  return { hadRow: has, wrote: out }
}, m)
const unitIdOf = (s, num) => s.page.evaluate(num => {
  for (const k of Object.keys(localStorage)) {
    if (!k.startsWith('raptor:settings/unit:')) continue
    try { const v = JSON.parse(localStorage.getItem(k)); if (v && String(v.num) === String(num)) return v.id } catch {}
  }
  return null
}, num)
async function reloadSignIn(s, u, p) {
  await s.page.reload(); await wait(s, 1500)
  if (await s.page.locator('#luser:visible').count()) await signIn(s, u, p)
  else await s.page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' })
}
const formNow = s => s.page.evaluate(() => {
  const f = document.querySelector('#accAddBlock')
  const v = id => document.querySelector(id)?.value ?? null
  return f ? { open: f.getBoundingClientRect().height > 0, cs: v('#accAddCs'), seat: v('#accAddSeat'), cat: v('#accAddCat'), postIn: v('#accAddPostIn') } : { open: false }
})
const usersHead = s => s.page.evaluate(() => [...document.querySelectorAll('#page-admin .adm-sub, #page-admin .od-head')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 4))
const where = async s => ({ bar: await barSq(s), badge: await badge(s), page: await curPage(s), head: await usersHead(s), form: await formNow(s), toast: await toastNow(s) })

/* Saber's world: 150 made by his presses, his move to 150 written; signed in again on 142's Users with the form typed */
async function saberForm(s, k) {
  const { page } = s
  await signIn(s, 'ad', 'a')
  await make150(s, k)
  const u150 = await unitIdOf(s, 150); FACT(`${k}.u150`, u150)
  if (!u150) throw new Error('150\'s id not found in the saved data')
  FACT(`${k}.setup`, await writeHome(s, { pid: 'stiff', from: 'u142', to: u150, day: MOVE_DAY }))
  await reloadSignIn(s, 'ad', 'a')
  await go(s, 'viewsched'); await wait(s, 400)
  await adminCat(s, 'Users')
  FACT(`${k}.before`, { ...(await where(s)), clock: await page.evaluate(() => new Date().toString()) })
  await hit(s, '#accAddOpen', 700)
  const cs = vis(s, '#accAddCs').first(); await cs.click(); await page.keyboard.type('Bandit'); await wait(s, 200)
  await page.fill('#accAddIni', 'BD').catch(() => {})
  const seat = await page.evaluate(() => [...document.querySelector('#accAddSeat').options].find(o => /^Pilot/i.test(o.textContent))?.value)
  if (seat) await page.selectOption('#accAddSeat', seat)
  await page.selectOption('#accAddCat', 'C').catch(async () => { const v = await page.evaluate(() => [...document.querySelector('#accAddCat').options].map(o => o.value).find(v => v)); if (v) await page.selectOption('#accAddCat', v) })
  await wait(s, 300)
  FACT(`${k}.form`, await formNow(s))
}
const formCrop = async s => [await boxOf(s, '#accAddBlock'), await boxOf(s, '#sqnMenuBtn'), await boxOf(s, '#roleBadge')]

let BAND = null

if (want('b') || want('s-today')) await run('q25b', async s => {
  const { page } = s
  await page.goto(URL_); await page.waitForSelector('#luser', { timeout: 20000 })
  FACT('b.setup', await writeHome(s, { pid: 'prowler', from: 'u142', to: 'u149', day: MOVE_DAY }))
  await page.reload(); await page.waitForSelector('#luser', { timeout: 20000 }); await wait(s, 600)
  await signIn(s, 'ad2', 'a2')
  FACT('b.before', { bar: await barSq(s), clock: await page.evaluate(() => new Date().toString()) })
  await go(s, 'inputs'); await wait(s, 600)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  await hit(s, '#inNew', 900)
  const rmk = vis(s, '#inpEditRmk').first(); await rmk.click(); await page.keyboard.type('Course brief, 0800')
  await wait(s, 300)
  FACT('b.window', { open: !!(await boxOf(s, '[data-testid="win-inputedit"]')), remarks: await rmk.inputValue(), band: !!(await boxOf(s, '[data-testid="inped-moveband"]')) })
  await clockTo(s, PAST)
  const band = await page.evaluate(() => { const b = document.querySelector('[data-testid="inped-moveband"]'); return b ? { html: b.outerHTML, words: b.innerText.replace(/\s+/g, ' ').trim(), w: b.getBoundingClientRect().width } : null })
  FACT('b.band', band)
  FACT('b.after', { bar: await barSq(s), toast: await toastNow(s), remarks: await page.locator('#inpEditRmk').first().inputValue().catch(() => null), page: await curPage(s) })
  if (!band) throw new Error('the Input window\'s band did not come at midnight')
  BAND = band.html
  const win = await boxOf(s, '[data-testid="win-inputedit"]')
  await sshot(s, 'q25b-input-band', [win])
}, { clock: EVE })

if (want('s-today')) await run('q25-saber-today', async s => {
  const { page } = s
  await saberForm(s, 's')
  await sshot(s, 'q25-saber-before-midnight', await formCrop(s))
  await clockTo(s, PAST)
  FACT('s.afterMidnight', await where(s))
  await sshot(s, 'q25-saber-today-after-midnight', await formCrop(s))

  /* 25-2 - DRAWN, NOT BUILT: the Input window's own band across the top of the form; Add does nothing */
  if (!BAND) throw new Error('no band read from the Input window')
  const put = await page.evaluate(html => {
    const f = document.querySelector('#accAddBlock'); if (!f) return null
    const t = document.createElement('div'); t.innerHTML = html; const band = t.firstElementChild
    band.dataset.testid = 'n204-drawn-band'; band.style.marginBottom = '10px'
    band.querySelector('button')?.addEventListener('click', () => document.querySelector('#accAddCancel')?.click())
    f.insertBefore(band, f.firstChild)
    window.__n204block = e => { if (e.target.closest && e.target.closest('#accAdd')) { e.stopImmediatePropagation(); e.preventDefault(); window.__n204blocked = (window.__n204blocked || 0) + 1 } }
    document.addEventListener('click', window.__n204block, true)
    return band.innerText.replace(/\s+/g, ' ').trim()
  }, BAND)
  FACT('s.drawnBand', put)
  if (!put) throw new Error('the form is not on the page for the drawn band')
  await wait(s, 300)
  await hit(s, '#accAdd', 600)
  FACT('s.drawnAddPressed', { blocked: await page.evaluate(() => window.__n204blocked || 0), form: await formNow(s), toast: await toastNow(s) })
  const ring = await tring(s, await boxOf(s, '[data-testid="n204-drawn-band"]'), 'the drawn band')
  await sshot(s, 'q25-2-saber-band', [ring, ...(await formCrop(s))])
  await untring(s)
  await page.evaluate(() => { document.removeEventListener('click', window.__n204block, true); document.querySelector('[data-testid="n204-drawn-band"]')?.remove() })
  await wait(s, 300)
  FACT('s.drawingRemoved', { form: await formNow(s), band: !!(await boxOf(s, '[data-testid="n204-drawn-band"]')) })

  /* today, on: Add pressed */
  await hit(s, '#accAdd', 300)
  FACT('s.added', await where(s))
  await sshot(s, 'q25-saber-today-added', [await boxOf(s, '#toastEl'), await boxOf(s, '#sqnMenuBtn'), await boxOf(s, '#page-admin .od-findrow')])
  await wait(s, 4500)
  const rb = await page.evaluate(() => { const e = [...document.querySelectorAll('#page-admin .acc-row[data-person]')].find(r => r.getBoundingClientRect().height > 0 && r.querySelector('.acc-name')?.textContent.trim().startsWith('Bandit')); if (!e) return null; e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height } })
  await wait(s, 400)
  FACT('s.list', { bar: await barSq(s), head: await usersHead(s), zulu: rb, rows: await page.evaluate(() => [...document.querySelectorAll('#page-admin [data-testid="acc-groups"] .acc-row[data-person]')].filter(r => r.getBoundingClientRect().height > 0).map(r => r.querySelector('.acc-name')?.textContent.trim())) })
  if (!rb) throw new Error('Bandit is not on the list in view')
  const r2 = await tring(s, rb, 'the new man')
  const list = await boxOf(s, '#page-admin [data-testid="acc-groups"]')
  await sshot(s, 'q25-saber-today-list150', [r2, await boxOf(s, '#sqnMenuBtn'), list ? { x: list.x, y: Math.max(rb.y - 160, list.y), w: list.w, h: 10 } : null])
}, { clock: EVE })

if (want('s-note')) await run('q25-1-saber', async s => {
  await saberForm(s, 'sn')
  await clockTo(s, PAST)
  FACT('sn.afterMidnight', await where(s))
  /* 25-1 - DRAWN, NOT BUILT: the form closed (by its own Cancel, as the app closes it), the app's own note, draft words */
  await hit(s, '#accAddCancel', 500)
  const nb = await sayNote(s, DRAFT('Bandit'))
  FACT('sn.drawn', await where(s))
  const ring = await tring(s, nb, 'the drawn note'); const t = await tag(s, nb, 'Draft words')
  await sshot(s, 'q25-1-saber-note', [ring, t, await boxOf(s, '#sqnMenuBtn'), await boxOf(s, '#accAddOpen'), await boxOf(s, '#roleBadge')])
}, { clock: EVE, probe: true })

if (want('h')) await run('q25-hunter', async s => {
  const { page } = s
  await signIn(s, 'ad', 'a')
  await make150(s, 'h')
  const u150 = await unitIdOf(s, 150); FACT('h.u150', u150)
  if (!u150) throw new Error('150\'s id not found in the saved data')
  FACT('h.setup', await writeHome(s, { pid: 'prowler', from: 'u142', to: u150, day: MOVE_DAY }))
  await go(s, 'viewsched'); await wait(s, 400)
  await hit(s, '#logout', 1500)
  if (!(await page.locator('#luser:visible').count())) throw new Error('Logout did not reach the sign-in card')
  await page.reload(); await page.waitForSelector('#luser', { timeout: 20000 }); await wait(s, 600)
  await signIn(s, 'ad2', 'a2')
  await adminCat(s, 'Users')
  FACT('h.before', { ...(await where(s)), clock: await page.evaluate(() => new Date().toString()) })
  /* for comparison: the app's own passing note with his ruled words for a row it throws away (built on the Users branch) */
  const other = await page.evaluate(() => [...document.querySelectorAll('#page-admin [data-testid="acc-groups"] .acc-row[data-person] .acc-name')].map(e => e.childNodes[0]?.textContent.trim()).find(n => n && !/^(Hunter|Saber)$/.test(n)))
  FACT('h.compareCallsign', other)
  const cb = await sayNote(s, ROWNOTE(other))
  const cr = await tring(s, cb, 'his ruled note')
  await sshot(s, 'q25-1-compare-row-note', [cr, await boxOf(s, '#sqnMenuBtn'), await boxOf(s, '#accAddOpen')])
  await untring(s)
  await page.evaluate(() => { window.__n204hold?.disconnect(); const t = document.querySelector('#toastEl'); if (t) t.style.opacity = '0' })
  await wait(s, 400)
  /* the form typed */
  await hit(s, '#accAddOpen', 700)
  const cs = vis(s, '#accAddCs').first(); await cs.click(); await page.keyboard.type('Typedman'); await wait(s, 300)
  FACT('h.form', await formNow(s))
  await sshot(s, 'q25-hunter-before-midnight', await formCrop(s))
  await clockTo(s, PAST)
  await wait(s, 1000)
  FACT('h.afterMidnight', { ...(await where(s)), bands: await page.evaluate(() => [...document.querySelectorAll('.saveband, [role=status]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()).slice(0, 4)) })
  const top = [await boxOf(s, '#sqnMenuBtn'), await boxOf(s, '#roleBadge'), await boxOf(s, '#topnav')]
  await sshot(s, 'q25-hunter-today-after-midnight', top)
  /* 25-1 - DRAWN, NOT BUILT: the app's own note, draft words, where the app has landed him */
  const nb = await sayNote(s, DRAFT('Typedman'))
  const ring = await tring(s, nb, 'the drawn note'); const t = await tag(s, nb, 'Draft words')
  await sshot(s, 'q25-1-hunter-note', [ring, t, ...top])
}, { clock: EVE, probe: true })

await closeAll()
