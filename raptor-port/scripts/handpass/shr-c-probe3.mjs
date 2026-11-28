// shr-c-probe3 v1 — walker C: the Leave War's tabs and doors to a leave's remark window (for C7), as the admin and as Ranger.
import * as C from './shr-c-lib.mjs'
const { L, T, J, sleep } = C
console.log('shr-c-probe3 v1')
const w = await C.world(process.env.SZ || 'desk')
const P = w.page
await C.signIn(w, 'ad')
await C.fileRange(w, 'p3', '2026-07-13', '2026-07-15')
for (const who of ['ad', 'us']) {
  if (who === 'us') await C.signOutIn(w, 'us')
  await C.toWar(w)
  const tabs = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="lw-tab"], [role=tab]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.testid || '') + ':' + e.innerText.replace(/\s+/g, ' ').trim()))
  console.log(who, 'TABS', J(tabs))
  const btns = await P.evaluate(() => [...document.querySelectorAll('button')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top < 260 }).map(e => (e.dataset.testid || e.id || '') + ':' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 24)))
  console.log(who, 'TOP BUTTONS', J(btns))
  await C.reachCell(w, 'bane', '2026-07-14')
  const we = await P.locator('[data-testid="row-bane"] .whoedit').count()
  console.log(who, 'whoedit', we)
  if (we) {
    await C.press(w, '[data-testid="row-bane"] .whoedit'); await sleep(800)
    const pw = await C.sheet(P)
    console.log(who, 'PERSON WINDOW', J(pw), 'pw', J(await P.evaluate(() => { const s = document.querySelector('[data-testid="person-window"]'); return s ? [...s.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid + ':' + e.innerText.replace(/\s+/g, ' ').slice(0, 40)).slice(0, 40) : null })))
    await C.pic(w, `p3-${who}-person-window`)
    for (let i = 0; i < 3; i++) { await P.keyboard.press('Escape'); await sleep(250) }
  }
  for (const t of tabs) {
    const id = t.split(':')[0]; if (!id) continue
    await P.evaluate(() => window.scrollTo(0, 0))
    await C.press(w, T(id)); await sleep(900)
    const leaves = await P.evaluate(() => [...document.querySelectorAll('main [data-testid], #page-leavewar [data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && /Ranger|LL|13 Jul/.test(e.innerText || '')).map(e => e.dataset.testid).slice(0, 25))
    console.log(who, 'TAB', id, J(leaves))
    await C.pic(w, `p3-${who}-tab-${id}`)
  }
}
console.log('ERRORS', J(L.facts.errors))
await L.finish()
