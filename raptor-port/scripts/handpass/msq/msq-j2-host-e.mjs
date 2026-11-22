/* msq-j2-host-e v1 — job 2 (19 Nov 26): the host's runs of W2's two OWED orders, on the frozen build of 2b792ebc5.
   C: 142's plain admin's "Clear edit history…" leaves 149's lines (security H5). E: Kestrel's held posting once 149 has
   a second admin. Reading the saved rows only through localStorage. usage: MSQ_DIST MSQ_BUNDLE MSQ_IMGDIR set. */
process.env.MSQ_WHO = 'host'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'e-d'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep, row } = X
say('msq-j2-host-e v2')
const w = await X.open({ user: 'ad' })
const { page } = w
const swap = async u => { await X.signOut(w); await X.login(page, u) }
const lines = () => page.evaluate(() => Object.keys(localStorage).filter(k => k.includes('elog:')).map(k => {
  let v = localStorage.getItem(k); try { v = JSON.parse(v) } catch {}
  const r = v && (v.v || v.value || v); return { u: r?.u || '(none)', lbl: String(r?.lbl || '').slice(0, 50) }
}))
async function openRow(cs) {
  await X.L.go(page, 'admin'); await sleep(900)
  await page.locator('input[aria-label="Find a callsign or sign-in"]').fill(cs); await sleep(600)
  const pid = await U.pidOf(page, cs)
  const tap = page.locator(`.acc-row[data-person="${pid}"] .acc-tap`).first()
  if (await tap.count()) { await tap.click(); await sleep(700) }
  return pid
}
const words = () => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
/* C — a 149 line (the master archives Gannet) and a 142 line (Hunter archives Ace) */
await openRow('Gannet'); await page.getByRole('button', { name: /^Archive$/ }).first().click(); await sleep(1200)
await swap('ad2')
await openRow('Ace'); await page.getByRole('button', { name: /^Archive$/ }).first().click(); await sleep(1200)
const before = await lines()
say('C before', JSON.stringify(before))
await X.L.go(page, 'admin'); await sleep(800)
const dataTab = page.locator('button:visible', { hasText: /^Data/ }).first()
await dataTab.click(); await sleep(800)
await page.locator('#admLogMode').selectOption('range'); await sleep(500)
const today = page.locator('[data-testid="admLogRun-day-2026-11-19"]').first()
say('today cell', await today.count())
await today.click(); await sleep(400)
await X.pic(w, 'c10-clear-ready')
await page.locator('#admLog').click(); await sleep(500)
const armed = (await page.locator('#admLog').textContent()).trim()
await X.pic(w, 'c11-clear-armed')
await page.locator('#admLog').click(); await sleep(1200)
await X.pic(w, 'c12-cleared')
const after = await lines()
say('C after', JSON.stringify(after))
const b149 = before.filter(l => l.u === 'u149').length, a149 = after.filter(l => l.u === 'u149').length
const a142 = after.filter(l => l.u !== 'u149').length
row('W2-C host', 'desktop', `Hunter: Admin → Data → Clear edit history, today's run; button read "${armed}"`, "142's lines gone, every u149 line kept",
  `u149 before ${b149} after ${a149}; other lines after ${a142}; words: ${(await words()).match(/(Cleared|No edits|removed).{0,80}/)?.[0] || '(none)'}`,
  b149 > 0 && a149 === b149 && a142 === 0 ? 'PASS' : 'FAIL', 'c11-clear-armed, c12-cleared')
/* E — Kestrel's Overseas Sqn posting held; then a second 149 admin who can sign in; reload */
await swap('ad9')
await openRow('Osprey')
await page.locator('select:visible').filter({ hasText: 'Member' }).first().selectOption({ label: /Admin/ }).catch(async () => {
  const s = page.locator('select:visible').first(); const opts = await s.locator('option').allTextContents(); say('role opts', opts.join('|'))
  await s.selectOption({ index: opts.findIndex(o => /^Admin/.test(o)) })
})
await sleep(300)
await page.getByRole('button', { name: /^Save$/ }).first().click(); await sleep(1000)
await X.pic(w, 'e01-osprey-admin')
say('E osprey row', (await words()).match(/Osprey.{0,120}/)?.[0])
row('W2-E host', 'desktop', 'Kestrel makes Osprey (149, us9) an admin', 'saved; Osprey Admin', (await words()).match(/Osprey.{0,80}/)?.[0] || '', 'RECORD', 'e01-osprey-admin')
/* now Kestrel archived by the master — no longer the last admin */
await swap('ad')
await openRow('Kestrel'); await page.getByRole('button', { name: /^Archive$/ }).first().click(); await sleep(1200)
const kw = (await words()).match(/(Kestrel is 149.s last admin[^.]*\.|Archived\s*·\s*\d+)/)?.[0] || ''
await X.pic(w, 'e02-kestrel-archive-by-master')
row('W2-E host', 'desktop', 'with Osprey a second 149 admin, the master archives Kestrel', 'allowed now (no last-admin words)', kw, /last admin/.test(kw) ? 'FAIL' : 'PASS', 'e02-kestrel-archive-by-master')
await X.fin(w)
