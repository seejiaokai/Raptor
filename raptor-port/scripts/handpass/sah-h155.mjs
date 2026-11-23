// The host's short re-look (chat 155, 23 Nov 26): after the second re-reads' fixes, an ISSUED Sat 18 keeps the SANS card of
// a man whose posting has since moved later (Astra's re-read #2 = the fresh Opus re-read's R1 — D44, D178), and that one
// posting move reads ONE pending change on the published day, not two (the Opus re-read's open check — D109, D113).
// World made through the app's own controls as Saber: Ranger and Hex posted out as SANS from Fri 17; one shared offer for
// both on Sat 18; Sat 18 signed and published on the board; then Hex's posting moved to Fri 24. Read: the board's working
// Sat 18 (Ranger's card only), its pending count (1), and the issued version opened from the day's plans menu (both cards).
// window.* is only READ. Run from raptor-port/ against the build served on a free port:
//   W2_URL=http://localhost:4181/ W2_OUT=D:/raptor-work/c155-look/run1 ONLY=h-d,h-p node scripts/handpass/sah-h155.mjs
process.env.W2_URL ||= 'http://localhost:4181/'
process.env.W2_OUT ||= 'D:/raptor-work/c155-look/run1'
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
import path from 'node:path'
import { writeFileSync } from 'node:fs'
const X = await import('./sah-w8-lib.mjs')
const T = await import('./sah-w10-lib.mjs')
const { L, J, RANGER, HEX } = X
console.log('sah-h155 v1', L.URL_, L.OUT)
const ONLY = (process.env.ONLY || 'h-d,h-p').split(',').filter(Boolean)
const D17 = '2026-07-17', D18 = '2026-07-18', D24 = '2026-07-24', SAT = 5
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function run(name, szKey, fn) {
  const sz = L.SIZES[szKey], W = L.mk(name, sz)
  const { b, p } = await L.world(sz, W, '2026-07-15T09:00:00')
  try { await L.signIn(p, 'ad', 'a'); await fn(p, W) } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
}
async function post(p, W, id, iso, tag) {
  const po = await L.postOut(p, W, id, iso, tag)
  W.rec(tag, `Saber: ${id === RANGER ? 'Ranger' : 'Hex'} posted out as SANS from ${iso.slice(8)} Jul (read back)`, /becomes SANS/.test(po.line), po.line, po.pic)
}
/* the four sign-offs on the board, by their own boxes (asp-w1-lib signAll), then its Publish button */
async function signAndPublish(p, W, tag) {
  const roles = ['cur', 'sked', 'plan', 'appr'], nth = [0, 0, 1, 2]
  for (let i = 0; i < 4; i++) {
    const sel = p.locator(`#schedBoard .sb-sign select[data-sign="${roles[i]}"]:visible`).first()
    const v = await sel.locator('option').evaluateAll((os, n) => os.map(o => o.value).filter(Boolean)[n], nth[i])
    await sel.selectOption(v); await sleep(300)
    const later = p.locator('[data-testid="win-oilday"] button', { hasText: 'Later' })
    if (await later.count() && await later.first().isVisible()) { await later.first().click(); await sleep(300) }
  }
  let btn = null
  for (const s of [`#schedBoard [data-beak="${SAT}"]`, `#schedBoard [data-alpub="${SAT}"]`]) { const l = p.locator(s).first(); if (await l.count()) { btn = l; break } }
  if (!btn) { W.rec(tag, 'Saber: Sat 18 signed and published', false, 'no publish button', await W.pic(p, tag)); return }
  const txt = (await btn.innerText()).trim()
  await btn.click(); await sleep(1200)
  const ok = await p.evaluate(i => !!window.SCHED && !!window.SCHED.dayOK && !!window.SCHED.dayOK[i], SAT).catch(() => false)
  W.rec(tag, 'Saber: Sat 18 signed (four sign-offs) and published', ok, `pressed "${txt}"`, await W.pic(p, tag))
}
const pendingOn = p => p.evaluate(() => {
  const vis = e => e.getBoundingClientRect().width > 0
  const el = [...document.querySelectorAll('#schedBoard *')].filter(e => vis(e) && /^\d+\s*pending/i.test((e.innerText || '').trim()) && (e.innerText || '').trim().length < 20).pop()
  return el ? parseInt(el.innerText, 10) : 0
})
const panelWho = (p, root) => p.evaluate(root => {
  const el = [...document.querySelectorAll(`${root} .sb-panel.sansav`)].find(e => e.getBoundingClientRect().width > 0)
  if (!el) return null
  const P = window.PEOPLE
  return [...new Set([...el.querySelectorAll('[data-person]')].filter(x => x.getBoundingClientRect().width > 0).map(x => (P[x.getAttribute('data-person')] || {}).cs || x.getAttribute('data-person')))]
}, root)
async function lookBoard(p, W, tag, wantWorking, wantPending) {
  await L.openBoard(p, W, SAT)
  const pl = p.locator('#schedBoard .sb-panel.sansav').first()
  if (await pl.count()) await pl.scrollIntoViewIfNeeded().catch(() => {})
  const who = await panelWho(p, '#schedBoard')
  const pic = await T.W5.clip(p, W, pl, `${tag}-panel`).catch(() => '')
  W.rec(`${tag}-panel`, `the board's working Sat 18, SANS Avail panel: ${wantWorking.join(' + ')} only`, !!who && who.slice().sort().join() === wantWorking.slice().sort().join(), J(who), [pic, await W.pic(p, `${tag}-panel`)].filter(Boolean).join(', '))
  const n = await pendingOn(p)
  W.rec(`${tag}-pending`, `Sat 18's pending count reads ${wantPending}`, n === wantPending, `read ${n}`, await W.pic(p, `${tag}-pending`))
}
async function lookIssued(p, W, tag) {
  /* the day's plans menu, then its published version (ff-w1's route: [data-planmenu] → [data-planpv]) */
  const menu = p.locator(`#schedBoard [data-planmenu="${SAT}"]`).first()
  if (!await menu.count()) { W.rec(tag, 'the plans menu on Sat 18', false, 'no plans menu', await W.pic(p, tag)); return }
  await menu.click(); await sleep(500)
  const items = p.locator('[data-planpv]:visible')
  const labels = await items.evaluateAll(es => es.map(e => (e.innerText || '').trim().replace(/\s+/g, ' ')))
  const k = labels.findIndex(t => /ORIG|AL\d|published/i.test(t))
  await W.pic(p, `${tag}-menu`)
  if (k < 0) { W.rec(tag, 'the published version in the plans menu', false, J(labels), await W.pic(p, tag)); return }
  await items.nth(k).click(); await sleep(800)
  const frozen = await p.evaluate(() => !!document.querySelector('#schedBoard .pv-frozen'))
  const pl = p.locator('#schedBoard .pv-frozen .sb-panel.sansav').first()
  if (await pl.count()) await pl.scrollIntoViewIfNeeded().catch(() => {})
  const who = await panelWho(p, '#schedBoard .pv-frozen')
  const pic = await T.W5.clip(p, W, pl, `${tag}-panel`).catch(() => '')
  W.rec(tag, `the issued Sat 18 (${labels[k]}), SANS Avail panel: Ranger AND Hex, as it went out`, frozen && !!who && who.includes('Ranger') && who.includes('Hex'), J(who), [pic, await W.pic(p, tag)].filter(Boolean).join(', '))
}
async function h(p, W) {
  await post(p, W, RANGER, D17, 'h-01'); await T.closeAll(p, W)
  await post(p, W, HEX, D17, 'h-02'); await T.closeAll(p, W)
  const f = await T.file(p, W, D18, [RANGER, HEX], ['fly', 'oft', 'amt'], 'all', 'h-03')
  W.rec('h-03', 'Saber: one shared offer for Ranger + Hex on Sat 18 (read back)', !!f.made, J(f.made) + ' ' + f.refused, f.pic)
  await T.closeAll(p, W)
  await L.openBoard(p, W, SAT)
  await signAndPublish(p, W, 'h-04')
  await lookBoard(p, W, 'h-05', ['Ranger', 'Hex'], 0)
  await L.closeBoard(p, W)
  const m = await T.movePo(p, W, HEX, D17, D24, 'h-06')
  W.rec('h-06', "Saber: Hex's posting moved to Fri 24 (Ranger's stays 17)", m.ok && /24 Jul/.test(m.line), `"${m.before}" → "${m.line}"`, m.pic)
  await T.closeAll(p, W)
  await lookBoard(p, W, 'h-07', ['Ranger'], 1)
  await lookIssued(p, W, 'h-08')
  await L.closeBoard(p, W)
}
for (const k of ONLY) { const i = k.lastIndexOf('-'); await run(k.slice(0, i), k.slice(i + 1), h) }
writeFileSync(path.join(L.OUT, 'results-h155.json'), JSON.stringify(L.results, null, 1))
for (const r of L.results) console.log(`${r.size} ${r.id} ${r.ok === true ? 'PASS' : r.ok === false ? 'FAIL' : r.ok} — ${String(r.note || '').slice(0, 160)}`)
console.log('done')
