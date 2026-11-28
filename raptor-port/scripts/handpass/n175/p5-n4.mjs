// p5-n4 - P5 case N4 (the build plan's §8.3): a holiday's bell line while he views another squadron.
// SET-UP by presses (p5-setup.mjs view): Hunter given VIEW (not Plan) of 149; his Duty on Tue 8 Dec 2026 filed on 142;
// 8 Dec made a public holiday on 142 ("N175 Day") and its OIL list left with "Later" = state B.
// Then, in a fresh browser with that saved data: Hunter (142's admin) signs in, picks 149 (top-bar picker; ☰ list on a
// phone), taps the bell, presses the holiday's line. Read: what opens, over which squadron's page, what the bar says, the
// window's controls; then a row's "Yes" and the list's Save pressed - which saved record changed (the browser's storage
// keys before and after), what the bar says after.
//   node raptor-port/scripts/handpass/n175/p5-n4.mjs <d|p>
// Pictures: p5-n4-<d|p>-1-bell-list, p5-n4-<d|p>-2-after-line
import { mk, closeAll, FACT, signIn, wait, vis, hit, shot, scratch, reachPick, barSq, pageOn, windowsNow, roleNow, toastNow, bands, covered, boxOf } from './lib.mjs'
import { setupP5 } from './p5-setup.mjs'
const SZ = process.argv[2] || 'd'; const SEC = 'p5'
const via = s => (s.desk ? 'bar' : 'menu')
const BELL = '#notifyBell, .bellbtn'
const LIST = '[data-testid="bell-list"]'
async function tapBell(s) {
  const c = await covered(s, BELL); if (c !== 'free') return { covered: c }
  const b = await boxOf(s, BELL); if (s.desk) await s.page.mouse.click(b.x + b.w / 2, b.y + b.h / 2); else await s.page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2)
  await wait(s, 800); return { covered: 'free', pressed: true }
}
const bellLit = s => s.page.evaluate(() => { const b = [...document.querySelectorAll('#notifyBell, .bellbtn')].find(e => e.getBoundingClientRect().width > 0); return b ? b.classList.contains('on') : null })
const lines = s => s.page.evaluate(l => [...document.querySelectorAll(l + ' .bl-line')].filter(e => e.getBoundingClientRect().height > 0).map(e => (e.classList.contains('unread') ? '[unread] ' : '[read] ') + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 100)), LIST)
const winFacts = async s => (await windowsNow(s)).map(w => `${w.what}${w.inert ? ' [inert]' : ''}: ${w.words.slice(0, 220)} | buttons: ${w.buttons.join(', ')}`)
const snap = s => s.page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k) } return o })
const changed = (a, b) => Object.keys({ ...a, ...b }).filter(k => a[k] !== b[k] && !/seen|view|ui|pref|last|sess/i.test(k)).map(k => {
  if (!/^raptor:inputs\//.test(k)) return `${k} ${String(b[k] ?? '(removed)').replace(/\s+/g, ' ').slice(0, 220)}`
  try { const r = JSON.parse(b[k] || 'null') || {}; return `${k} {person:${r.person}, date:${r.date}, unit:${r.u ?? r.unit ?? '(none: the home squadron)'}, oil:${JSON.stringify(r.oil ?? null)}}` } catch { return k }
})
const state = async s => ({ squadron: await barSq(s), page: await pageOn(s), role: (await roleNow(s)).badge, toast: await toastNow(s), bands: await bands(s) })
/* what the page under the window is: its first heading words */
const under = s => s.page.evaluate(() => { const p = document.querySelector('.page.on'); return p ? (p.id + ': ' + (p.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120)) : null })
try {
  console.log('p5-n4 v1', SZ)
  const st = await setupP5('view')
  const k = `p5.n4.${SZ}`, P = `p5-n4-${SZ}`
  const s = await mk(SZ, { storageState: st.B })
  try {
    await signIn(s, 'ad2', 'a2')
    FACT(`${k}.0.signedIn`, await state(s))
    const p = await reachPick(s, 149, via(s)); FACT(`${k}.1.pick149`, { pressed: !!p.pressed, rows: p.listRows })
    FACT(`${k}.1.on149`, { ...(await state(s)), bellLit: await bellLit(s) })
    FACT(`${k}.2.bellTap`, await tapBell(s)); FACT(`${k}.2.lines`, await lines(s))
    const hl = s.page.locator(`${LIST} .bl-line`).filter({ hasText: /N175 Day|holiday|OIL answer/i }).filter({ visible: true }).first()
    if (!(await hl.count())) { FACT(`${k}.2.holidayLine`, 'none in his bell on 149'); await scratch(s, SEC, P + '-noline'); throw new Error('no holiday line') }
    await hl.evaluate(e => e.setAttribute('data-n175line', '1'))
    await shot(s, `${P}-1-bell-list`, ['[data-n175line]'], [LIST], 16)
    const b = await hl.boundingBox(); if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
    await wait(s, 1200)
    FACT(`${k}.3.afterLine`, await state(s)); FACT(`${k}.3.pageUnder`, await under(s)); FACT(`${k}.3.windows`, await winFacts(s))
    const ctl = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid^="odl-"]')].filter(e => e.getBoundingClientRect().width > 0 && e.tagName === 'BUTTON').map(e => e.getAttribute('data-testid') + ' "' + e.textContent.trim().slice(0, 20) + '"' + (e.disabled ? ' [greyed]' : ' live')))
    FACT(`${k}.3.listControls`, ctl)
    const ring = (await vis(s, '[data-testid="odl-count"]').count()) ? '.floatwin, [role=dialog]' : '.floatwin, [role=dialog], .airpop'
    await shot(s, `${P}-2-after-line`, [s.desk ? '#sqnMenuBtn' : '.topbar .mark', ring], null, 24)
    /* a row's Yes, then the list's Save - as he presses them */
    const yes = vis(s, '[data-testid^="odl-yes-"]').first()
    if (await yes.count()) {
      const before = await snap(s)
      await hit(s, yes, 500)
      const sv = vis(s, '[data-testid="odl-save"]').first()
      FACT(`${k}.4.saveButton`, (await sv.count()) ? ((await sv.isDisabled()) ? 'greyed' : 'live') : 'not drawn')
      if (await sv.count() && !(await sv.isDisabled())) await hit(s, sv, 1000)
      FACT(`${k}.4.afterSave`, { ...(await state(s)), windows: (await winFacts(s)).map(w => w.slice(0, 120)) })
      FACT(`${k}.4.storageChanged`, changed(before, await snap(s)))
      await scratch(s, SEC, `${P}-3-after-save`)
    } else FACT(`${k}.4.yes`, 'no Yes row drawn')
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
