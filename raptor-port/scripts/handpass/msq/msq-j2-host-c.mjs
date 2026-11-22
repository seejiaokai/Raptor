/* msq-j2-host-c v2 — job 2 (19 Nov 26): the host's re-run of W1-C, read from what is SAVED (reading only): the master
   archives Falcon (149), renames him FalconQ by "Save name", Undo, Redo — which squadron's history is each line filed in,
   and does either squadron's changes window draw it. usage: MSQ_DIST MSQ_BUNDLE MSQ_IMGDIR set; node …/msq-j2-host-c.mjs */
process.env.MSQ_WHO = 'host'
process.env.MSQ_RUN = 'c-d'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep, row } = X
say('msq-j2-host-c v2')
const w = await X.open({ user: 'ad' })
const { page } = w
const elogs = () => page.evaluate(() => Object.keys(localStorage).filter(k => k.includes('elog:')).map(k => {
  let v = localStorage.getItem(k); try { v = JSON.parse(v) } catch {}
  const r = v && (v.v || v.value || v)
  return { k, u: r?.u, sub: r?.sub, fld: r?.fld, lbl: String(r?.lbl || r?.what || '').slice(0, 60), date: r?.date }
}).filter(r => r.sub === 'fal9' || /Falcon/.test(r.lbl)))
async function openUsers(cs) {
  await X.L.go(page, 'admin'); await sleep(900)
  const f = page.locator('input[aria-label="Find a callsign or sign-in"]')
  await f.fill(cs); await sleep(600)
  const pid = await U.pidOf(page, cs)
  const tap = page.locator(`.acc-row[data-person="${pid}"] .acc-tap`).first()
  if (await tap.count()) { await tap.click(); await sleep(700) }
  return pid
}
await openUsers('Falcon')
await page.getByRole('button', { name: /^Archive$/ }).first().click(); await sleep(1200)
await X.pic(w, 'c01-falcon-archived')
/* the archived row (W1's proven route): search, open the Archived fold, the row, its name box #accArCs */
await page.locator('input[aria-label="Find a callsign or sign-in"]').fill('Falcon'); await sleep(600)
const tap = page.locator('.acc-row[data-person="fal9"] .acc-tap').first()
if (!(await tap.isVisible().catch(() => false))) { const fold = page.getByRole('button', { name: /Archived/ }).first(); if (await fold.count()) { await fold.click(); await sleep(600) } }
if (!(await page.locator('#accArCs').first().isVisible().catch(() => false))) { await tap.click(); await sleep(800) }
await X.pic(w, 'c02-archived-open')
await page.locator('#accArCs').fill('FalconQ'); await sleep(400)
await page.getByRole('button', { name: /^Save name$/ }).first().click(); await sleep(1200)
await X.pic(w, 'c03-saved-name')
say('after save', JSON.stringify(await elogs()))
await page.locator('button[aria-label="Undo"]').first().click(); await sleep(1000)
say('after undo', JSON.stringify(await elogs()))
await page.locator('button[aria-label="Redo"]').first().click(); await sleep(1000)
const all = await elogs()
say('after redo', JSON.stringify(all))
const us = [...new Set(all.map(r => r.u))]
row('W1-C host', 'desktop', 'ad: archive Falcon, Save name FalconQ, Undo, Redo; the saved history lines about him', 'every line about Falcon filed in 149 (u149)', JSON.stringify(all.map(r => [r.u, r.fld, r.lbl])), all.length >= 3 && us.length === 1 && /149/.test(String(us[0])) ? 'PASS' : 'FAIL', 'c03-saved-name')
await X.fin(w)
