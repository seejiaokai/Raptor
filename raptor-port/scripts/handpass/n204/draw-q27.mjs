// draw-q27 - question 27 (chat 204, 27 Nov 26; brief docs/superpowers/briefs/2026-11-27-msq-s1-q27-draw-brief.md): the
// Undo that would take the squadron in view away, refused while something is open - the note under the Undo button.
// A desktop, 1536x864, at 2x. The app is the BUILT one in dist, served at 4741; nothing here writes the app's code.
// THE ONE ROAD, all real presses: Saber (ad / a) on Admin -> Squadrons -> "+ New squadron", 151, a first admin, Save;
// 151 picked in the top bar's squadron list (three squadrons: 142, 149, 151); something started; the top bar's Undo.
// THE NOTE IS THE APP'S OWN: the Undo door raises it (built in K8). Only its fade is held (its opacity), so it can be
// pictured. For the proposed words, the words after "Blocked:" are replaced in the note's own element and the app asked
// to place it again (a resize, which its own listener answers) - its look and place unchanged. Said so in each caption.
//   q27-5   Squadrons: "+ New squadron" again, 152 typed, not saved -> Users -> Undo. As built, then (A) and (B).
//   q27-14  Inputs -> its calendar settings -> Calendar... -> Holidays "+ Add", a day picked, Save (kept waiting: 151 has
//           no leave period) -> Undo. As built (real, nothing replaced).
//   q27-1   Users: a person's row opened, its sign-in changed, not saved -> Squadrons -> Undo. As built, then proposed.
//   node raptor-port/scripts/handpass/n204/draw-q27.mjs        (ONLY=5,14,1)
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { ROOT, run, closeAll, FACT, signIn, wait, vis, hit, boxOf, barSq, adminCat, pick, go, curPage, tring, untring, W, H } from './q2425-lib.mjs'

const OUT = resolve(ROOT, 'docs/mock/2026-11-26-msq-questions/q27'); mkdirSync(OUT, { recursive: true })
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
console.log('draw-q27 v1 (27 Nov 26)')

async function sshot(s, name, rects, pad = 14, whole = true) {
  const { page } = s
  await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(300)
  if (whole) await page.screenshot({ path: `${OUT}/${name}.png` })
  rects = (rects || []).filter(Boolean)
  if (rects.length) {
    const L = Math.min(...rects.map(r => r.x)), Tp = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
    const x = Math.max(0, L - pad), y = Math.max(0, Tp - pad)
    const clip = { x, y, width: Math.max(20, Math.min(W, R + pad) - x), height: Math.max(20, Math.min(H, B + pad) - y) }
    await page.screenshot({ path: `${OUT}/${name}-crop.png`, clip })
    FACT(`${name}.crop`, clip)
  }
  console.log('  picture ' + name + (whole ? '.png' : '') + (rects.length ? ' + -crop' : ''))
}
const catBox = (s, label) => s.page.evaluate(label => { const b = [...document.querySelectorAll('#page-admin button.adm-cat')].find(e => e.getBoundingClientRect().width > 0 && e.textContent.trim().startsWith(label)); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, label)
const noteNow = s => s.page.evaluate(() => {
  const t = document.querySelector('#toastEl'); if (!t) return null
  const c = getComputedStyle(t), b = t.getBoundingClientRect()
  return { words: t.textContent.replace(/\s+/g, ' ').trim(), face: t.dataset.face || null, at: t.dataset.at || null, opacity: c.opacity, box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } }
})
const undoNow = s => s.page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { title: b.getAttribute('title') || b.getAttribute('aria-label'), disabled: b.disabled } : null })

/* Saber makes 151 (three squadrons in the list: 142, 149, 151) and picks it */
async function saberOn151(s, k) {
  const { page } = s
  await signIn(s, 'ad', 'a')
  await adminCat(s, 'Squadrons')
  await hit(s, '#sqNew', 500)
  await page.fill('#sqNewNum', '151'); await page.selectOption('#sqNewPlace', 'p1').catch(() => {})
  const adm = await page.evaluate(() => { const o = [...document.querySelectorAll('#sqNewAdmin option')]; return (o.find(x => /^Kestrel/.test(x.textContent.trim())) || o.find(x => x.value))?.value })
  await page.selectOption('#sqNewAdmin', adm)
  await hit(s, '#sqNewSave', 1000)
  FACT(`${k}.made151`, { list: (await page.locator('#sqList').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200), undo: await undoNow(s) })
  await pick(s, '151')
  FACT(`${k}.squadronList`, await page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-num')].map(e => e.textContent.trim())))
  if (!/151/.test(await barSq(s) || '')) throw new Error('151 is not in view: ' + await barSq(s))
}
/* the top bar's Undo pressed, as a person presses it; the note's fade then held */
async function pressUndo(s, k) {
  const before = { bar: await barSq(s), page: await curPage(s), undo: await undoNow(s) }
  await vis(s, '#undoBtn').first().click({ timeout: 8000 })
  await wait(s, 350)
  await s.page.evaluate(() => {
    const t = document.querySelector('#toastEl'); if (!t) return
    t.getAnimations?.().forEach(a => a.finish())
    const put = () => { if (t.style.opacity !== '1') t.style.opacity = '1' }
    put(); window.__q27hold?.disconnect(); window.__q27hold = new MutationObserver(put); window.__q27hold.observe(t, { attributes: true, attributeFilter: ['style'] })
  })
  await wait(s, 300)
  const n = await noteNow(s)
  FACT(`${k}.undo`, { before, after: { bar: await barSq(s), page: await curPage(s), undo: await undoNow(s) }, note: n })
  if (!n || n.face !== 'blocked') throw new Error('no Blocked note after Undo: ' + JSON.stringify(n))
  return n
}
/* the proposed words, replaced in the note's own element, then placed again by the app */
async function swapWords(s, k, text) {
  const r = await s.page.evaluate(text => {
    const t = document.querySelector('#toastEl'), rest = t.querySelector('.bk-rest'), lead = t.querySelector('.bk-words b')
    const i = text.indexOf(':'); lead.textContent = text.slice(0, i + 1); rest.textContent = ' ' + text.slice(i + 1).trim()
    window.dispatchEvent(new Event('resize'))
    return t.textContent.replace(/\s+/g, ' ').trim()
  }, text)
  await wait(s, 350)
  FACT(`${k}.swapped`, { words: r, note: await noteNow(s) })
  if (r !== text) throw new Error('the swap did not take: ' + r)
  return noteNow(s)
}
const markBox = s => boxOf(s, '.topbar .mark')
const undoBox = s => boxOf(s, '#undoBtn')

/* 27-5: two squadrons being made at once */
if (want('5')) await run('q27-5', async s => {
  const k = 'q27-5', { page } = s
  await saberOn151(s, k)
  await adminCat(s, 'Squadrons')
  await hit(s, '#sqNew', 500)
  await vis(s, '#sqNewNum').first().click(); await page.keyboard.type('152'); await wait(s, 300)
  FACT(`${k}.typed`, await page.inputValue('#sqNewNum'))
  await adminCat(s, 'Users')
  const built = 'Blocked: cancel the new squadron, then press Undo again.'
  let n = await pressUndo(s, k)
  if (n.words !== built) FACT(`${k}.DIFFERENT`, { expected: built, got: n.words })
  const rects = async () => [await undoBox(s), await catBox(s, 'Users'), await catBox(s, 'Squadrons'), await markBox(s)]
  let ring = await tring(s, n.box, 'the note')
  await sshot(s, 'q27-5-today', [ring, ...(await rects())])
  await untring(s)
  for (const [tagw, text] of [['a', 'Blocked: cancel the squadron you are adding on Squadrons, then press Undo again.'], ['b', 'Blocked: cancel the new squadron on Squadrons, then press Undo again.']]) {
    n = await swapWords(s, `${k}.${tagw}`, text)
    ring = await tring(s, n.box, 'the note')
    await sshot(s, `q27-5-proposed-${tagw}`, [ring, ...(await rects())])
    await untring(s)
  }
})

/* 27-14: the holiday kept waiting */
if (want('14')) await run('q27-14', async s => {
  const k = 'q27-14', { page } = s
  await saberOn151(s, k)
  await go(s, 'inputs'); await wait(s, 800)
  let gear = vis(s, '[aria-label="Inputs calendar settings"]')
  if (!(await gear.count())) { const cal = vis(s, 'button[aria-pressed]').filter({ hasText: /^Calendar$/ }); if (await cal.count()) await hit(s, cal.first(), 600); gear = vis(s, '[aria-label="Inputs calendar settings"]') }
  await hit(s, gear.first(), 600)
  await hit(s, '[data-testid="iset-days"]', 800)
  /* the first run (v1) found 2026 covered: a holiday there saved at once. So the Holidays list's year arrow is pressed
     until it says no leave period covers the year, and the holiday is put in that year */
  let year = null
  for (let i = 0; i < 8; i++) {
    const no = await page.locator('[data-testid="hol-nocover"]').filter({ visible: true }).first().innerText().catch(() => null)
    const y = await page.locator('[data-testid="hol-year"]').first().innerText()
    FACT(`${k}.year${i}`, { year: y, nocover: no })
    if (no && /No leave period covers \d{4} yet/.test(no)) { year = +y; break }
    await hit(s, '[data-testid="hol-next"]', 300)
  }
  if (!year) throw new Error('no year without a leave period found')
  await hit(s, '[data-testid="hol-add"]', 600)
  await vis(s, '[data-testid="hol-name"]').first().fill('Founders Day'); await wait(s, 200)
  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const calAt = () => page.evaluate(M => { const [m, y] = document.querySelector('[data-testid="holcal-title"] .dcal-my').textContent.trim().split(/\s+/); return +y * 12 + M.indexOf(m.toLowerCase()) }, MONTHS)
  const target = year * 12 + 2 /* March */
  for (let d = target - await calAt(), n = 0; d !== 0 && n < 60; d = target - await calAt(), n++) await hit(s, `[data-testid="${d > 0 ? 'holcal-next' : 'holcal-prev'}"]`, 80)
  const day = `holcal-day-${year}-03-09`
  FACT(`${k}.day`, day)
  await hit(s, `[data-testid="${day}"]`, 250); await hit(s, `[data-testid="${day}"]`, 300)
  await hit(s, '[data-testid="hol-save"]', 800)
  const waiting = await page.locator('[data-testid="hol-waiting"]').first().innerText().catch(() => null)
  FACT(`${k}.waiting`, { waiting, err: await page.locator('[data-testid="hol-err"]').first().innerText().catch(() => null), buttons: await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-holiday"] button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim())) })
  if (!waiting) throw new Error('the holiday was not kept waiting')
  /* the form's own scroll brought to its waiting line and its offer, as a person scrolls it (v1 left them half hidden) */
  /* (v2: scrollIntoView took the offer as in view, since the form's button row lies over it; the mouse wheel over the
     form, as a person scrolls it, brings it up) */
  await page.mouse.move(260, 700); await page.mouse.wheel(0, 600); await wait(s, 400)
  const n = await pressUndo(s, k)
  const built = 'Blocked: cancel the new holiday, then press Undo again.'
  if (n.words !== built) FACT(`${k}.DIFFERENT`, { expected: built, got: n.words })
  const ring = await tring(s, n.box, 'the note')
  FACT(`${k}.inSight`, { waiting: await boxOf(s, '[data-testid="hol-waiting"]'), cancel: await boxOf(s, '[data-testid="hol-cancel"]'), offer: await boxOf(s, '[data-testid="hol-wait-create"], [data-testid="hol-wait-period"]') })
  /* the waiting form sits at the left and the note under the Undo at the right: a crop would be the whole screen, so the
     whole screen is the picture */
  await sshot(s, 'q27-14-today', [])
})

/* 27-1: one example of the "on Users" family */
if (want('1')) await run('q27-1', async s => {
  const k = 'q27-1', { page } = s
  await saberOn151(s, k)
  await adminCat(s, 'Users')
  const row = await page.evaluate(() => { const e = [...document.querySelectorAll('#page-admin [data-person]:not([data-archived])')].find(r => r.getBoundingClientRect().height > 0 && r.querySelector('.acc-tap:not([disabled])')); if (e) e.setAttribute('data-q27r', '1'); return e ? e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) : null })
  FACT(`${k}.row`, row)
  if (!row) throw new Error('no row to open on 151\'s Users')
  await hit(s, '[data-q27r] .acc-tap', 600)
  const box = vis(s, '#accEdName, #accGiveName').first()
  await box.click(); await page.keyboard.press('End'); await page.keyboard.type('x'); await wait(s, 300)
  FACT(`${k}.typed`, await box.inputValue())
  await adminCat(s, 'Squadrons')
  const built = 'Blocked: cancel the open row, then press Undo again.'
  let n = await pressUndo(s, k)
  if (n.words !== built) FACT(`${k}.DIFFERENT`, { expected: built, got: n.words })
  const rects = async () => [await undoBox(s), await catBox(s, 'Users'), await catBox(s, 'Squadrons'), await markBox(s)]
  let ring = await tring(s, n.box, 'the note')
  await sshot(s, 'q27-1-today', [ring, ...(await rects())])
  await untring(s)
  n = await swapWords(s, `${k}.p`, 'Blocked: cancel the open row on Users, then press Undo again.')
  ring = await tring(s, n.box, 'the note')
  await sshot(s, 'q27-1-proposed', [ring, ...(await rects())])
})
await closeAll()
