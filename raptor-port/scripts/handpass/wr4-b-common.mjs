// Walker b's own small helpers (round 4 of the words pass, 24 Nov 26) — built on wr4-lib.mjs, which must already be
// imported (WR4_OUT set by the calling script first). Nothing here wipes a folder or writes outside WR4_OUT / .tmp/wr4-b.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const L = await import('./wr4-lib.mjs')
const { sleep, log, shot, bellClip, boxOf, go } = L
const HERE = dirname(fileURLToPath(import.meta.url))
export const TMP = join(HERE, '../../.tmp/wr4-b')
mkdirSync(TMP, { recursive: true })
export const dump = (name, obj) => writeFileSync(join(TMP, name), JSON.stringify(obj, null, 1))

/* the bell's lines as drawn, with their unread state; the list is opened from View-only Sched (openBell) */
export const readLines = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map((l, i) => {
  l.setAttribute('data-w4', String(i))
  const t = s => (l.querySelector(s)?.textContent || '').replace(/\s+/g, ' ').trim()
  return { i, id: l.getAttribute('data-testid'), name: t('.bl-name'), day: t('.bl-day'), what: t('.bl-what'), ago: t('.bl-ago'), unread: l.classList.contains('unread') }
}))
export const bellState = page => page.evaluate(() => {
  const b = [...document.querySelectorAll('.bellbtn')].find(x => x.offsetParent !== null)
  const foot = document.querySelector('[data-testid="bell-more"]')
  return { lit: !!(b && b.classList.contains('on')), bellId: b && b.id, more: foot ? foot.textContent.trim() : null, markAll: !!document.querySelector('[data-testid="bell-markall"]'), listOpen: !!document.querySelector('[data-testid="bell-list"]') }
})
export const said = lines => lines.map(l => `${l.unread ? '(unread) ' : '(read) '}${l.name} ${l.day} / ${l.what}`)
export const stored = (page, to) => page.evaluate(r => window.NOTICES.filter(n => n.to === r).map(n => ({ id: n.id, name: n.name, day: n.day, iid: n.iid, what: n.what })), to)

/* what the input's own window shows: its frame, its fields' values, the page behind it */
export const winShows = page => page.evaluate(() => {
  const w = document.querySelector('[data-testid="win-inputedit"]')
  if (!w || !w.getBoundingClientRect().height) return { open: false, page: window.CURPAGE }
  const v = s => { const e = w.querySelector(s); return e ? e.value : null }
  const span = [...w.querySelectorAll('[data-span][aria-pressed="true"]')].map(b => b.getAttribute('data-span'))
  const cal = [...w.querySelectorAll('#inpEdCal [data-iso]')].filter(b => b.getAttribute('aria-pressed') === 'true' || b.classList.contains('on') || b.classList.contains('sel')).map(b => b.getAttribute('data-iso'))
  const head = (w.querySelector('h2,h3,.fw-title,.win-title,[class*="title"]')?.textContent || '').replace(/\s+/g, ' ').trim()
  return { open: true, page: window.CURPAGE, head, type: v('#inpEditType'), title: v('#inpEditOwnTitle'), remarks: v('#inpEditRmk'), start: v('#inpEditStart'), end: v('#inpEditEnd'), span, calPicked: cal, text: (w.innerText || '').replace(/\s+/g, ' ').slice(0, 300) }
})
/* close the input's window by Escape, discarding if asked */
export async function closeWin(w) {
  if (!(await w.page.locator('[data-testid="win-inputedit"]:visible').count())) return
  await w.page.keyboard.press('Escape'); await sleep(350)
  const d = w.page.getByRole('button', { name: /Discard|Close it/ }).first()
  if (await d.count() && await d.isVisible().catch(() => false)) { await d.click().catch(() => {}); await sleep(300) }
}
/* press a bell line; on a phone a picture within ~100ms of the lift as well as the settled one */
export async function tapLine(w, c, idx, name) {
  const l = w.page.locator(`[data-testid="bell-list"] .bl-line[data-w4="${idx}"]`)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (w.tap) {
    await l.tap()
    await w.page.screenshot({ path: join(L.OUT, name + '-justafter.png') })
    L.facts.pictures.push({ file: name + '-justafter.png', case: c })
    await sleep(700)
  } else { await l.click(); await sleep(400) }
  await w.page.screenshot({ path: join(L.OUT, name + '-settled.png') })
  L.facts.pictures.push({ file: name + '-settled.png', case: c })
  return winShows(w.page)
}
export async function bellPic(w, c, name, lines) {
  await shot(w.page, c, name, await bellClip(w.page), said(lines), w.size)
}
