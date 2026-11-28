// shr-c-c7 v1 — Share C, C7 (lesson 12): every place the remark window of Ranger's shared leave can be opened from — the
// grid's cell, the day's list, the person window's leave line, MY LEAVE, the Approvals page — as Ranger (member) and as the
// admin. From each: open it, say which window opened and whether it is in sight (its box inside the screen, its middle not
// covered), save a remark where it has a box (typed, Enter), close it by ✕, and read which page and tab are left under it.
// EXPECTED: the window in sight, the page under it the one left. RECORD the list.
//   WR4_OUT=<dir> WR4_NEW=.tmp/build-6c7f3aac7 SZ=desk|phone node scripts/handpass/shr-c-c7.mjs
import * as C from './shr-c-lib.mjs'
const { L, T, J, sleep } = C
const SZ = process.env.SZ || 'desk', ENG = 'chromium', tg = `${SZ}-${ENG}`
console.log('shr-c-c7 v1', tg, L.OUT)
const DAYS = ['Jul 13', 'Jul 14', 'Jul 15'], MON = '2026-07-13', TUE = '2026-07-14', WED = '2026-07-15'
const WINS = ['[data-testid="remarks-sheet"]', '[data-testid="bid-picker"]', '[data-testid="daylist-sheet"]', '[data-testid="person-window"]', '[data-testid="select-sheet"]', '[role=dialog]', '#docViewPop']
/* the topmost shown window: its id, whether it sits inside the screen and is on top at its middle; its remark boxes */
const top = P => P.evaluate(sels => {
  const all = sels.flatMap(s => [...document.querySelectorAll(s)]).filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.closest('[hidden]') })
  if (!all.length) return null
  const z = e => { let n = e, m = 0; while (n && n !== document.body) { const v = parseInt(getComputedStyle(n).zIndex); if (!isNaN(v)) m = Math.max(m, v); n = n.parentElement } return m }
  all.sort((a, b) => z(b) - z(a))
  const s = all[0], r = s.getBoundingClientRect()
  const mid = document.elementFromPoint(r.left + r.width / 2, Math.min(innerHeight - 2, r.top + Math.min(r.height / 2, 60)))
  const boxes = [...s.querySelectorAll('textarea, input[type=text]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid || e.id)
  return { id: s.dataset.testid || s.id || String(s.className).slice(0, 30), inside: r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1, onTop: !!mid && s.contains(mid), box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], text: s.innerText.replace(/\s+/g, ' ').slice(0, 160), boxes, all: all.map(e => e.dataset.testid || e.id) }
}, WINS)
const under = P => P.evaluate(() => ({ page: window.CURPAGE, tab: [...document.querySelectorAll('[data-testid^="lw-tab-"], [data-testid="oil-tracker"]')].filter(e => e.classList.contains('on') || e.getAttribute('aria-selected') === 'true' || e.getAttribute('aria-pressed') === 'true').map(e => e.dataset.testid).join(',') || null, scrollY: Math.round(scrollY) }))
const st = P => C.store(P, ['bane', 'rocky'], DAYS)
const list = []
async function door(w, who, name, open) {
  const P = w.page, pics = []
  try {
    await C.toWar(w); await P.evaluate(() => scrollTo(0, 0)); await C.press(w, T('lw-tab-grid')); await sleep(500)
    const before = await under(P)
    const ok = await open()
    await sleep(600)
    const t = await top(P); const u0 = await under(P)
    pics.push(await C.pic(w, `c7-${tg}-${who}-${name}-1-open`))
    if (!ok || !t) { list.push({ who, door: name, opened: t?.id || 'nothing', note: ok === false ? 'no such door here' : '' }); C.rec(`C7 ${who}: ${name}`, tg, 'RECORDED', `opened ${J(t)}; page under ${J(u0)}`, pics); return }
    let saved = null, box = t.boxes.find(b => /remarks/.test(b))
    if (box) {
      const s0 = await st(P)
      await C.typeInto(w, `[data-testid="${box}"]`, `C7 ${who} ${name}`); await P.keyboard.press('Enter'); await sleep(700)
      const s1 = await st(P); saved = { box, value: await C.valueOf(P, `[data-testid="${box}"]`), note: await L.shownToast(P), changed: J(s0) !== J(s1), store: s1 }
      pics.push(await C.pic(w, `c7-${tg}-${who}-${name}-2-saved`))
    }
    const t2 = await top(P)
    /* close by its own ✕ */
    /* the ✕ of the topmost window itself */
    const x = await P.evaluate(id => { const s = document.querySelector(`[data-testid="${id}"]`) || document.getElementById(id); if (!s) return null; const b = [...s.querySelectorAll('button')].find(b => b.getBoundingClientRect().width > 0 && (/^[✕×]$/.test(b.innerText.trim()) || /close/i.test(b.getAttribute('aria-label') || '') || /cancel|close/.test(b.dataset.testid || ''))); if (!b) return null; b.setAttribute('data-shrc', 'x'); return b.dataset.testid || b.getAttribute('aria-label') || 'x' }, t2.id)
    if (x) await C.press(w, '[data-shrc="x"]'); await sleep(500)
    await P.evaluate(() => document.querySelector('[data-shrc="x"]')?.removeAttribute('data-shrc'))
    const t3 = await top(P), u1 = await under(P)
    pics.push(await C.pic(w, `c7-${tg}-${who}-${name}-3-closed`))
    const entry = { who, door: name, opened: t.id, inSight: t.inside && t.onTop, pageWas: before, pageUnder: u0, closedBy: x, afterClose: t3?.id || 'none', pageLeft: u1, saved }
    list.push(entry)
    entry.savedOn = saved ? (saved.store.find(s => s.includes(`C7 ${who} ${name}`)) || 'NOWHERE') : null
    const good = t.inside && t.onTop && u1.page === u0.page && u1.tab === u0.tab
    C.rec(`C7 ${who}: the remark window from ${name}`, tg, good ? 'PASS' : 'FAIL', J(entry), pics)
    for (let i = 0; i < 3; i++) { if (!(await top(P))) break; await P.keyboard.press('Escape'); await sleep(250) }
  } catch (e) { list.push({ who, door: name, error: String(e).slice(0, 160) }); C.rec(`C7 ${who}: ${name}`, tg, 'NOT WALKED', 'the script could not act: ' + String(e).split('\n')[0].slice(0, 260), pics); for (let i = 0; i < 3; i++) { await P.keyboard.press('Escape').catch(() => {}); await sleep(250) } }
}
const w = await C.world(SZ, ENG); const P = w.page
try {
  await C.signIn(w, 'ad')
  const iid = await C.fileRange(w, 'c7', MON, WED)
  if (!iid) throw new Error('fixture did not land')
  /* a second entry on Ranger's Wednesday, for the day's list: an approved PM LL placed by the admin in the war */
  await C.toWar(w); await C.openCell(w, 'bane', WED)
  if (await C.vis(P, T('bid-LL'))) { if ((await P.locator(T('bid-approve-tick')).getAttribute('aria-checked')) !== 'true') await C.press(w, T('bid-approve-tick')); await C.press(w, T('bid-LL')); await sleep(600); if (await C.vis(P, T('bid-picker'))) { await C.press(w, T('bid-LL')); await sleep(600) } }
  await C.closeAny(w)
  console.log('FIXTURE', J(await st(P)))
  for (const who of ['us', 'ad']) {
    if (who === 'us') await C.signOutIn(w, 'us'); else await C.signOutIn(w, 'ad')
    const nm = who === 'us' ? 'ranger' : 'admin'
    await door(w, nm, 'grid-cell', async () => { await C.openCell(w, 'bane', TUE); return true })
    await door(w, nm, 'day-list', async () => { await C.openCell(w, 'bane', WED); return true })
    await door(w, nm, 'person-window-line', async () => {
      await C.reachCell(w, 'bane', TUE)
      if (!(await P.locator('[data-testid="row-bane"] .whoedit').count())) return false
      await C.press(w, '[data-testid="row-bane"] .whoedit'); await sleep(800)
      if (!(await C.vis(P, T(`pw-line-${MON}`)))) return false
      await C.press(w, T(`pw-line-${MON}`)); return true
    })
    await door(w, nm, 'my-leave', async () => {
      if (!(await C.vis(P, T('my-leave')))) return false
      await P.evaluate(() => scrollTo(0, 0)); await C.press(w, T('my-leave')); await sleep(800)
      /* the line of the shared leave in the window MY LEAVE opened (the person window's own list) */
      if (await C.vis(P, `[data-testid="person-window"] ${T(`pw-line-${MON}`)}`)) await C.press(w, `[data-testid="person-window"] ${T(`pw-line-${MON}`)}`)
      return true
    })
    if (who === 'ad') await door(w, nm, 'approvals', async () => {
      await P.evaluate(() => scrollTo(0, 0)); await C.press(w, T('lw-tab-approvals')); await sleep(900)
      const ln = await P.evaluate(() => { const e = [...document.querySelectorAll('[data-testid="appr-line-bane"]')].find(e => /13 Jul|Jul 13|13–15|13 – 15/.test(e.innerText)); if (!e) return null; e.setAttribute('data-shrc', 'appr'); return true })
      if (!ln) return false
      await C.press(w, '[data-shrc="appr"]'); return true
    })
  }
} catch (e) { C.rec('C7', tg, 'NOT WALKED', 'the script could not act: ' + String(e).split('\n')[0].slice(0, 300), []) }
C.rec('C7 RECORD the list of doors to the remark window', tg, 'RECORDED', J(list), [])
console.log('FINAL STORE', J(await st(P)))
console.log('ERRORS', J(L.facts.errors))
C.saveResults(`c7-${tg}.json`)
await L.finish()
