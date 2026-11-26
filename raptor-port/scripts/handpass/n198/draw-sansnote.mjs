// draw-sansnote - section 1 (the guard rail), chat 198, 26 Nov 26: the refusal note for SANS calendar settings under the
// Calendar, drawn on the BUILT app (port 4741) in the very recipe n191/draw-s1-notes.mjs used for the approved Inputs
// note (its case `settings` and the "words gap 1a" block): the app's own grey "Blocked:" note raised by
// window.toast(text, 'blocked'), its fade stopped, only its place changed - on a phone at the foot (D2590), lifted
// above any control its words name; on a desktop just under the squadron picker (D2590) - ringed teal dashed. The pick
// itself is not made: the squadron list is opened and closed again, as the built guard would leave it.
// His words, D2741 (26 Nov 26): phone "Blocked: close the Calendar, save or cancel SANS calendar settings, then pick
// 149."; desktop "Blocked: save or cancel SANS calendar settings, then pick 149."
//   node <repo>/raptor-port/scripts/handpass/n198/draw-sansnote.mjs        (ONLY=alt-p,d,side)
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, boxOf, covered, windowsNow, refusePick, tring, sshot, sideBySide, DRAWN, TMP } from './sansnote-lib.mjs'

const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
/* RULED D2741 - his words, never reworded here */
const PHONE = 'Blocked: close the Calendar, save or cancel SANS calendar settings, then pick 149.'
const DESK = 'Blocked: save or cancel SANS calendar settings, then pick 149.'
const SET = '[data-testid="win-sansset"]'

async function run(key, sz, fn) {
  const s = await mk(sz)
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await s.page.screenshot({ path: `${TMP}/${key}-error.png` }).catch(() => {}) } finally { FACT(`${key}.errs`, s.errs); await s.ctx.close().catch(() => {}) }
}
/* the SANS calendar -> its gear -> SANS calendar settings -> the late cut-off's first number box one up, NOT saved ->
   its "Calendar..." button (the presses of n194/k0p-b-settings.mjs; the change itself as the Inputs recipe makes it) */
async function sansSettingsThenCalendar(s, k) {
  await go(s, 'inputs'); await wait(s, 700)
  const sm = vis(s, '#inSansMode'); if (await sm.count()) await hit(s, sm.first(), 900)
  await hit(s, '[data-testid="sc-gear"]', 700)
  FACT(`${k}.settingsOpen`, (await windowsNow(s)).map(w => w.testid || w.what))
  /* THE ONE DIFFERENCE FROM THE INPUTS RECIPE'S PRESSES: there the first number box was the late cut-off's days; here
     the first number boxes are the day colours, and the late cut-off stands as "A weekday" (two lists: the weekday and
     how many weeks before). The cut-off's weekday list is moved one day on, as a person would pick it, and not saved. */
  const before = await s.page.evaluate(sel => document.querySelector(sel)?.innerText.match(/commitments are due by[^.]*\./)?.[0] ?? null, SET)
  const ch = await s.page.evaluate(sel => { const w = document.querySelector(sel); const i = w && [...w.querySelectorAll('select')].find(e => e.getBoundingClientRect().width > 0 && [...e.options].some(o => /day$/.test(o.textContent.trim()))); if (!i) return null; i.setAttribute('data-s1n', '1'); const o = [...i.options], n = (i.selectedIndex + 1) % o.length; return { label: i.getAttribute('aria-label') || null, value: o[i.selectedIndex].textContent.trim(), next: o[n].value, nextText: o[n].textContent.trim() } }, SET)
  if (!ch) throw new Error('no late cut-off weekday list in SANS calendar settings')
  await s.page.selectOption('[data-s1n]', ch.next)
  await wait(s, 300)
  FACT(`${k}.changed`, { list: ch.label, from: ch.value, to: ch.nextText, dueBefore: before, dueAfter: await s.page.evaluate(sel => document.querySelector(sel)?.innerText.match(/commitments are due by[^.]*\./)?.[0] ?? null, SET), saveLit: await s.page.evaluate(sel => { const w = document.querySelector(sel); const b = w && [...w.querySelectorAll('button')].find(b => /^Save$/.test(b.textContent.trim())); return b ? !b.disabled : null }, SET) })
  FACT(`${k}.calendarButton`, await covered(s, '[data-testid="sset-days"]'))
  await hit(s, '[data-testid="sset-days"]', 900)
  FACT(`${k}.windows`, (await windowsNow(s)).map(w => w.testid || w.what))
  FACT(`${k}.settingsCovered`, await covered(s, '[data-s1n]'))
  FACT(`${k}.cutStill`, await s.page.evaluate(() => document.querySelector('[data-s1n]')?.value ?? null))
}

if (want('alt-p')) await run('alt-p', 'p', async s => {
  const k = 's1.cal.sansSettingsAlt.p'
  await signIn(s, 'ad', 'a')
  await sansSettingsThenCalendar(s, k)
  const m = await refusePick(s, k, PHONE, { cal: '.floatwin.dayswin', settings: SET })
  const ring = (await tring(s, m.box, 'the note')).ring
  await sshot(s, 'cal-sanssettings-alt-p', [ring, { x: 0, y: 0, w: s.W, h: 60 }], 8)
})
if (want('d')) await run('d', 'd', async s => {
  const k = 's1.cal.sansSettings.d'
  await signIn(s, 'ad', 'a')
  await sansSettingsThenCalendar(s, k)
  const m = await refusePick(s, k, DESK, { cal: '.floatwin.dayswin', settings: SET })
  const ring = (await tring(s, m.box, 'the note')).ring
  const cw = await boxOf(s, '.floatwin.dayswin')
  await sshot(s, 'cal-sanssettings-d', [ring, await boxOf(s, '#sqnMenuBtn'), await boxOf(s, SET), cw && { x: cw.x, y: cw.y, w: cw.w, h: 40 }], 16)
})
if (want('side')) {
  const L = resolve(DRAWN, 's1-cal-settings-alt-p.png'), R = resolve(DRAWN, 's1-cal-sanssettings-alt-p.png')
  if (!existsSync(R)) { FACT('side.error', 'the SANS phone picture is not drawn'); process.exitCode = 1 }
  else {
    /* the same part of both screens: the Calendar's last weeks and its foot, where the note stands (CSS px of a 402x874
       phone; both pictures are 2x) */
    const cut = { x: 0, y: 1110 / 2, w: 402, h: 874 - 1110 / 2, phoneW: 402 }
    await sideBySide(resolve(DRAWN, 's1-cal-sanssettings-side-p.png'), { file: L, label: 'Approved — Inputs calendar settings' }, { file: R, label: 'New — SANS calendar settings' }, cut)
  }
}
await closeAll()
