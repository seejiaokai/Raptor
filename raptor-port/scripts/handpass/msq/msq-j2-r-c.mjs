/* msq-j2-r-c v1 — R-C: the changes window shows ordinary work; 149 and 142 each their own history (desktop, fresh world) */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'rc1'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, U, say, sleep, row } = H
say('msq-j2-r-c v1')
const w = await X.open({ user: 'ad9' })
const p = w.page
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, 'desktop', 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
const elogs = () => p.evaluate(() => Object.keys(localStorage).filter(k => k.includes('elog:')).map(k => {
  let v = localStorage.getItem(k); try { v = JSON.parse(v) } catch {}
  const r = v && (v.v || v.value || v)
  return { u: r?.u, sub: r?.sub, fld: r?.fld, lbl: String(r?.lbl || r?.what || '').slice(0, 70), date: r?.date, to: String(r?.to ?? r?.after ?? '').slice(0, 30) }
}))
const chg = async (name, tabAll = true) => {
  await p.locator('#histBtn').click(); await sleep(1000)
  if (tabAll) { await p.locator('.chgwin').getByText('All changes').first().click().catch(() => {}); await sleep(900) }
  await X.pic(w, name)
  const t = await p.evaluate(() => (document.querySelector('.chgwin')?.innerText || '').replace(/\s+/g, ' ').trim())
  await p.keyboard.press('Escape'); await sleep(500)
  return t
}
const edit = async (sel, val) => { await X.W.typeIn(w, sel, val); await sleep(900) }
let l0 = []
await safe('RC-ad9', async () => {
  await X.L.go(p, 'editsched'); await sleep(2000)
  l0 = await elogs(); say('elog before', JSON.stringify(l0))
  await edit('[data-txt="fr:0.0.0.0"]', 'R149 remark')
  await X.pic(w, 'c01-ad9-edited')
  const t = await chg('c02-ad9-changes-window')
  const l1 = await elogs(); const nw = l1.filter(x => !l0.some(o => JSON.stringify(o) === JSON.stringify(x)))
  say('elog after ad9', JSON.stringify(nw))
  row('R-C', 'desktop', 'ad9: Edit Schedule (week Jul 06 is the first offered), change a flying remark to "R149 remark", open the changes clock -> All changes', 'his change listed under the item', `window words: ${t.slice(0, 500)}`, /R149/.test(t) || /BFM-2/.test(t) ? 'PASS' : 'FAIL', 'c02-ad9-changes-window.png')
  row('R-C', 'desktop', 'stored history lines after ad9 edit (new ones)', 'RECORD squadron (u) and label', JSON.stringify(nw.map(x => [x.u, x.fld, x.lbl, x.to])), 'RECORD', 'c02-ad9-changes-window.png')
})
await safe('RC-ad2', async () => {
  await H.swap(w, 'ad2')
  await X.L.go(p, 'editsched'); await sleep(2000)
  const l0b = await elogs()
  await edit('[data-txt="fr:0.0.0.0"]', 'R142 remark')
  await X.pic(w, 'c03-ad2-edited')
  const t = await chg('c04-ad2-changes-window')
  const l1 = await elogs(); const nw = l1.filter(x => !l0b.some(o => JSON.stringify(o) === JSON.stringify(x)))
  say('elog after ad2', JSON.stringify(nw)); say('all elogs', JSON.stringify(l1))
  row('R-C', 'desktop', 'ad2: Edit Schedule, change a flying remark to "R142 remark", open the changes clock -> All changes', "his change listed", `window words: ${t.slice(0, 500)}`, /R142/.test(t) || /BFM-2/.test(t) ? 'PASS' : 'FAIL', 'c04-ad2-changes-window.png')
  row('R-C', 'desktop', "does Kestrel's change show in Hunter's window", 'no (each squadron its own history)', `contains R149: ${/R149/.test(t)}`, 'RECORD', 'c04-ad2-changes-window.png')
  row('R-C', 'desktop', 'stored history lines after ad2 edit (new ones)', 'RECORD squadron (u) and label', JSON.stringify(nw.map(x => [x.u, x.fld, x.lbl, x.to])), 'RECORD', 'c04-ad2-changes-window.png')
  row('R-C', 'desktop', 'all stored lines at the end by squadron', 'RECORD', JSON.stringify(l1.map(x => [x.u, x.fld, x.lbl, x.to])), 'RECORD', 'c04-ad2-changes-window.png')
})
await X.fin(w)
