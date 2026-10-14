/* The helper's own readers for the small OIL job walk (ou-h-<n>.mjs): the board's pending/sign-off state, the bells,
   the lists and a member sign-in. Built on ou-lib.mjs. Nothing here edits the app. */
export * from './ou-lib.mjs'
import { L, list, noteNow, board, closeBoard } from './ou-lib.mjs'
import { publish } from './lib.mjs'
export { publish }
export const J = x => JSON.stringify(x)
export const undo = async p => { await p.evaluate(() => { const b = [...document.querySelectorAll('#sbUndo, #undoBtn')].find(e => e.getClientRects().length && !e.disabled); if (b) b.click() }); await L.sleep(650) }
export const redo = async p => { await p.evaluate(() => { const b = [...document.querySelectorAll('#sbRedo, #redoBtn')].find(e => e.getClientRects().length && !e.disabled); if (b) b.click() }); await L.sleep(650) }

/** the open Scheduler Board's day-head state: version chip, pending count/chip, publish button and sign-off selects */
export const bstate = p => p.evaluate(() => {
  const b = document.querySelector('#schedBoard'); if (!b || b.hidden) return null
  const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : null
  const beak = b.querySelector('[data-beak]'), alpub = b.querySelector('[data-alpub]')
  return { chip: t(b.querySelector('.verchip')), pend: t(b.querySelector('.dpend')), so: t(b.querySelector('.so-state')), nys: t(b.querySelector('.nysmark')), plan: t(b.querySelector('.psl')), beak: beak ? { t: t(beak), dis: beak.disabled } : null, alpub: alpub ? { t: t(alpub), dis: alpub.disabled } : null }
})
/** open the bell (the visible one) and read its lines; closes it again with Escape */
export async function bellLines(w, { keepOpen = false } = {}) {
  const p = w.page
  const sel = await p.evaluate(() => { const b = [...document.querySelectorAll('#sbBell, #notifyBell')].find(e => e.getClientRects().length); return b ? '#' + b.id : null })
  if (!sel) return { error: 'no visible bell' }
  const badge = await p.evaluate(s => (document.querySelector(s).innerText || '').replace(/\s+/g, ' ').trim(), sel)
  await p.locator(sel).evaluate(e => e.click()); await L.sleep(500)
  const txt = await p.evaluate(() => {
    const cands = [...document.querySelectorAll('[data-testid^="win-"], .airpop, #notifyPop, #bellPop, .notif-pop, [role=dialog]')].filter(e => e.getClientRects().length && /notif|bell|OIL|read|unread/i.test(e.textContent))
    const e = cands[cands.length - 1]; return e ? (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1500) : null
  })
  return { sel, badge, txt }
}
export async function closeBell(w) { await w.page.keyboard.press('Escape'); await L.sleep(250) }
/** the bell: its count badge and its lines */
export async function bell(p, open = true) {
  const info = await p.evaluate(() => {
    const b = document.querySelector('#bellBtn, [data-testid="bell"], .bell, #tbBell')
    return b ? { id: b.id, tid: b.getAttribute('data-testid'), cls: String(b.className).slice(0, 60), text: (b.innerText || '').replace(/\s+/g, ' ').trim() } : null
  })
  return info
}
/** sign out through the top bar's Logout, sign in as someone else in the same browser world */
export async function signAs(w, user, pass) {
  const p = w.page
  const lg = p.locator('#logoutBtn, [data-testid="logout"], button:has-text("Logout")').first()
  await lg.evaluate(e => e.click()).catch(() => {})
  await p.waitForSelector('#luser', { state: 'visible', timeout: 8000 })
  await p.fill('#luser', user); await p.fill('#lpass', pass)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await L.sleep(500)
}
/** how an input's title is drawn inside a scope: how many places, whether any is struck through / wears a CX tag */
export const faces = (p, scope, title) => p.evaluate(([scope, title]) => {
  const root = document.querySelector(scope); if (!root) return { error: 'no ' + scope }
  const hits = [...root.querySelectorAll('*')].filter(e => e.children.length === 0 && (e.textContent || '').toLowerCase().includes(title.toLowerCase()) && e.getClientRects().length)
  const struck = hits.filter(e => { let x = e; for (let i = 0; i < 4 && x; i++, x = x.parentElement) if (/line-through/.test(getComputedStyle(x).textDecorationLine)) return true; return false }).length
  const rows = hits.map(e => e.closest('tr, .grow, .gr, li, .ground-row, [class*=row]') || e.parentElement)
  const cx = rows.filter(r => r && (/\bcx\b/i.test(String(r.className)) || [...r.querySelectorAll('*')].some(c => /^CX$/.test((c.textContent || '').trim()) && /tag|chip|cx/i.test(String(c.className))))).length
  return { n: hits.length, struck, cxrows: cx, ctx: rows[0] ? (rows[0].innerText || '').replace(/\s+/g, ' ').slice(0, 120) : '' }
}, [scope, title])
/** open the day's pending-changes window from the board's "N pending" chip and read it */
export async function pendText(w) {
  const p = w.page
  const ok = await p.evaluate(() => { const b = document.querySelector('#schedBoard [data-pendlist]'); if (!b) return false; b.click(); return true })
  if (!ok) return { opened: false, txt: null }
  await L.sleep(600)
  const txt = await p.evaluate(() => {
    const c = [...document.querySelectorAll('*')].filter(e => e.getClientRects().length && /Waiting to go out/i.test(e.innerText || ''))
    c.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)
    let e = c[0]; for (let i = 0; e && i < 8 && !/Tap a change/.test(e.innerText || ''); i++) e = e.parentElement; return e ? (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 600) : null
  })
  return { opened: true, txt }
}
export async function closePend(w) { await w.page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(b => b.getClientRects().length && /^[✕×]$/.test((b.textContent || '').trim()) && b.closest('[class*=win], .airpop')); if (x) x.click() }); await L.sleep(300) }
