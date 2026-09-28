/* Walker a's shared helpers — the Tracker leftovers walk (28 Sep 26).
   Everything acts through the app's own controls the way a person does; the only
   reads of state are to CHECK what the screen claims (the pick keys in browser
   storage, the store through core()). */
import { logout, toTracker, shot } from './trk-lib.mjs'

export const sleep = ms => new Promise(r => setTimeout(r, ms))

/** Sign in with any seeded account: ad/a (Saber, stiff), us/us (Ranger, bane),
    hex/<any> (Hex, rocky). */
export async function signIn(page, name, pass) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', name)
  await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await sleep(400)
}
export const WHO = {
  admin: { name: 'ad', pass: 'a', pid: 'stiff' },
  member: { name: 'us', pass: 'us', pid: 'bane' },
  hex: { name: 'hex', pass: 'hx', pid: 'rocky' },
}
export async function as(page, who) { await signIn(page, WHO[who].name, WHO[who].pass) }
export { logout, toTracker }

/** What the Tracker's bar has picked: the course and the student (label + id). */
export const picked = page => page.evaluate(() => {
  const c = document.getElementById('courseSel'), a = document.getElementById('activeSel'), s = document.getElementById('sylSel')
  const o = sel => sel && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex] : null
  return {
    course: o(c) ? o(c).textContent : null, courseId: o(c) ? o(c).value : null, courseIndex: c ? c.selectedIndex : -1,
    student: o(a) ? o(a).textContent : null, studentId: o(a) ? o(a).value : null,
    students: a ? [...a.options].map(x => x.textContent) : [],
    syllabus: o(s) ? o(s).textContent : null,
  }
})
export const optIds = (page, sel) => page.evaluate(sel => Object.fromEntries([...document.querySelectorAll(sel + ' option')].map(o => [o.textContent, o.value])), sel)

/** Every per-browser pick key the Tracker keeps (ocuLocal:…). */
export const pickKeys = page => page.evaluate(() => {
  const out = {}
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^ocuLocal:/.test(k)) out[k] = localStorage.getItem(k) }
  return out
})
/** The Tracker's stored data, pick keys left out — to prove a press wrote nothing. */
export const dataDump = page => page.evaluate(() => {
  const out = {}
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/tracker|ocu/i.test(k) && !/^ocuLocal:/.test(k)) out[k] = localStorage.getItem(k) }
  return out
})

/** A watcher on the page: when the "Loading…" of a person's resume shows and goes,
    and every pointer press with whether that was on screen at the time. Reading
    only — it changes nothing. Re-install after a reload. */
export const watch = page => page.evaluate(() => {
  const t0 = performance.now()
  const seen = () => !!document.querySelector('#page-tracker .resumenote')
  window.__lo = { resume: [], presses: [], t0 }
  if (window.__loObs) window.__loObs.disconnect()
  window.__loObs = new MutationObserver(() => {
    const s = seen(), L = window.__lo.resume
    if ((L.length ? L[L.length - 1].on : false) !== s) {
      const row = { on: s, t: Math.round(performance.now() - t0), text: s ? document.querySelector('#page-tracker .resumenote').textContent : '' }
      if (s) {
        /* what a person could see at that moment: the last person's chart and panel
           hidden? and did the browser paint a frame while it read "Loading…"? */
        const root = document.querySelector('#page-tracker .tr-root')
        row.shown = [...root.children].filter(c => !c.classList.contains('resumenote') && getComputedStyle(c).visibility !== 'hidden').map(c => c.id || c.className)
        row.visibleBalls = [...document.querySelectorAll('#flowSvg .ball')].filter(b => getComputedStyle(b).visibility !== 'hidden').length
        requestAnimationFrame(() => { row.paintedWhileOn = seen() })
      }
      L.push(row)
    }
  })
  window.__loObs.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] })
  if (!window.__loPress) {
    window.__loPress = true
    document.addEventListener('pointerdown', e => {
      const t = e.target
      window.__lo && window.__lo.presses.push({ t: Math.round(performance.now() - window.__lo.t0), resuming: !!document.querySelector('#page-tracker .tr-root.resuming'),
        target: t.tagName.toLowerCase() + (t.id ? '#' + t.id : '') + (t.getAttribute && t.getAttribute('class') ? '.' + t.getAttribute('class').split(/\s+/).join('.') : '') })
    }, true)
  }
})
export const watched = page => page.evaluate(() => window.__lo || null)

/** A tap or a click on an element, the way the device does it. */
export async function press(page, sel, touch) {
  const loc = page.locator(sel).first()
  if (touch) await loc.tap(); else await loc.click()
  await sleep(250)
}
export async function pressAt(page, x, y, touch) {
  if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y)
  await sleep(300)
}

/** A dropdown the way a person uses it: press it, then choose the option by text. */
export async function choose(page, sel, text) {
  await page.click(sel); await sleep(150)
  const v = await page.evaluate(({ sel, text }) => { const o = [...document.querySelector(sel).options].find(o => o.textContent === text || o.textContent.replace(/ ✎$/, '') === text); return o ? o.value : null }, { sel, text })
  if (v == null) { await page.keyboard.press('Escape'); throw new Error('no option "' + text + '" in ' + sel) }
  await page.selectOption(sel, v)
  /* the headless browser keeps the native list drawn after a scripted choice;
     moving focus off the box closes it (trk-w1-lib's note) */
  await page.evaluate(sel => { const el = document.querySelector(sel); if (el && document.activeElement === el) el.blur() }, sel)
  await sleep(800)
  return v
}

/** The phone shows the chart and the panel as two halves (Flow / Info). */
export async function half(page, which, touch) {
  const b = page.locator(`#viewtabs button[data-view="${which}"]:visible`)
  if (await b.count()) { if (touch) await b.first().tap(); else await b.first().click(); await sleep(350) }
}

/** A ball's centre on screen, and a point on one student's slice of its ring. */
export const ballCentre = (page, id) => page.evaluate(id => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); if (!g) return null
  const r = g.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}, id)
export const wedgePoint = (page, id, wi) => page.evaluate(({ id, wi }) => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); if (!g) return null
  const r = g.getBoundingClientRect()
  for (let fy = 0.04; fy < 1; fy += 0.03) for (let fx = 0.04; fx < 1; fx += 0.03) {
    const x = r.left + r.width * fx, y = r.top + r.height * fy
    const el = document.elementFromPoint(x, y)
    const w = el && el.closest && el.closest('.wedge')
    if (w && g.contains(w) && w.dataset.wi === String(wi)) return { x: Math.round(x), y: Math.round(y) }
  }
  return null
}, { id, wi })

/** The app's question box: up? its words. */
export async function qText(page) {
  if (!(await page.locator('#dlgModal').isVisible().catch(() => false))) return null
  return (await page.locator('#dlgMsg').innerText().catch(() => '')).trim()
}
export async function waitQ(page, timeout = 4000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) { const t = await qText(page); if (t != null) return t; await sleep(100) }
  return null
}
/** Open one of the bar's ✎ / ⇪ menus and press an item. */
export async function menu(page, which, item, touch) {
  await press(page, `#${which}MenuBtn`, touch)
  await page.waitForSelector(`#${item}`, { state: 'visible', timeout: 4000 })
  await press(page, `#${item}`, touch)
  await sleep(250)
}
/** Where the keyboard focus is, in words. */
export const focusAt = page => page.evaluate(() => {
  const e = document.activeElement
  if (!e || e === document.body) return { d: 'body', inDlg: false, inTracker: false, id: '' }
  const d = e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + ' "' + ((e.innerText || e.value || e.getAttribute('aria-label') || e.title || '').replace(/\s+/g, ' ').trim().slice(0, 28)) + '"'
  return { d, id: e.id, inDlg: !!e.closest('#dlgModal'), inTracker: !!e.closest('#page-tracker .tr-root') && !e.closest('#dlgModal') }
})
export { shot }
