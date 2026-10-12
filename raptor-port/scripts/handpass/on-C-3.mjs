import * as L from './on-C-lib.mjs'
const { tid, shot, check } = L
const WHO = process.argv[2] || 'us'          // 'us' = C3 (member Ranger); 'ad' = C4 (Saber, another person's input)
const browser = await L.launch()
const { ctx, page, errors } = WHO === 'ad' ? await L.world(browser, { who: 'ad', pass: 'a' }) : await L.world(browser, { who: 'us', pass: 'us' })
const tag = WHO === 'ad' ? 'C4' : 'C3'
const F = []
const rec = iid => page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? JSON.stringify({ date: r.date, end: r.date2 || r.dateTo || r.to || r.endDate || r.until || null, s: r.s, e: r.e, oil: r.oil || null, type: r.type, other: Object.keys(r).filter(k => !['people','at','modAt','mod','by','modBy','iid','ord','remarks','allday','yr','title','type','date','s','e','oil','acc'].includes(k)).map(k => k + '=' + JSON.stringify(r[k])).join(' ') }) : 'GONE' }, iid)
const flashProbe = () => page.evaluate(() => [...document.querySelectorAll('[class*="land"], [class*="flash"], [class*="lift"]')].filter(e => /land|flash/.test(e.className)).map(e => (e.getAttribute('data-testid') || e.getAttribute('data-icday') || e.tagName) + '.' + String(e.className).replace(/\s+/g, '.').slice(0, 60)))

async function dragBar(iid, fromFrac, toIso) {
  const bar = page.locator(`[data-testid="ib-bar-${iid}"]`).first()
  const b = await bar.boundingBox()
  const c = await page.locator(`[data-icday="${toIso}"]`).boundingBox()
  await L.mouseDrag(page, { x: b.x + b.width * fromFrac, y: b.y + b.height / 2 }, { x: c.x + c.width / 2, y: c.y + c.height - 12 })
}
async function scenario(label, iid, fromFrac, toIso, ptag) {
  const r0 = await rec(iid), und0 = await L.undoLabel(page)
  await L.toMonth(page); await page.waitForTimeout(200)
  await dragBar(iid, fromFrac, toIso)
  const up = await tid(page, 'oilconf').count() === 1
  const lead = up ? await tid(page, 'oilconf-lead').innerText().catch(() => '') : ''
  const head = up ? await tid(page, 'oilconf').locator('.airpop-head b').innerText().catch(() => '') : ''
  const btns = up ? [await tid(page, 'oilconf-cancel').innerText(), await tid(page, 'oilconf-save').innerText(), await tid(page, 'oilconf-save').isDisabled()] : []
  const text = up ? (await tid(page, 'oilconf').innerText()).replace(/\s+/g, ' ').slice(0, 260) : 'NO QUESTION; toast: ' + await L.toast(page)
  const mid = await rec(iid)
  console.log(label, 'QUESTION', up, '| head', head, '| lead', lead, '| btns', JSON.stringify(btns), '| record unchanged', mid === r0, '|', mid)
  console.log(label, 'question text:', text)
  console.log(label, 'measure question', JSON.stringify(await L.measure(page, '[data-testid="oilconf"]')))
  await L.hush(page); await shot(page, `${tag}-${ptag}-1-question`); await L.unhush(page)
  if (!up) { F.push(`${label}: no question; ${text}; record ${mid}`); return false }
  await tid(page, 'oilconf-cancel').click()
  const probes = []
  for (const ms of [20, 60, 100, 200, 300]) { await page.waitForTimeout(ms === 20 ? 20 : 40); probes.push([ms, await flashProbe()]); if (ms === 100) await shot(page, `${tag}-${ptag}-2a-flash-100ms`) }
  const bar = await tid(page, 'oilbar-text').innerText().catch(() => 'NONE')
  const btxt = [await tid(page, 'oilbar-answer').innerText().catch(() => ''), await tid(page, 'oilbar-ok').innerText().catch(() => '')]
  const bm = await L.measure(page, '[data-testid="oilbar"]')
  const r1 = await rec(iid), und1 = await L.undoLabel(page), t1 = await L.toast(page)
  console.log(label, 'CANCEL bar', bar, JSON.stringify(btxt), JSON.stringify(bm), '| record unchanged', r1 === r0, '| undo', und0, '->', und1, '| toast', t1)
  console.log(label, 'FLASH PROBES', JSON.stringify(probes))
  await shot(page, `${tag}-${ptag}-2-bar`)
  /* where does the chip sit? */
  const where = await page.evaluate(iid => { const b = document.querySelector(`[data-testid="ib-bar-${iid}"]`); if (!b) return 'no bar'; const r = b.getBoundingClientRect(); const cell = [...document.querySelectorAll('[data-icday]')].find(c => { const q = c.getBoundingClientRect(); return r.x >= q.x - 1 && r.x < q.right && r.y >= q.y && r.y < q.bottom }); return cell ? cell.getAttribute('data-icday') : 'unknown' }, iid)
  /* answer */
  await tid(page, 'oilbar-answer').click(); await page.waitForTimeout(300)
  const again = await tid(page, 'oilconf').count() === 1 && await tid(page, 'oilbar').count() === 0
  const yesAll = (await tid(page, 'oil-yes').count()) ? 'oil-yes' : 'oil-all'
  await tid(page, yesAll).click(); await tid(page, 'oilconf-save').click(); await page.waitForTimeout(700)
  console.log(label, 'picked', yesAll)
  const t2 = await L.toast(page), r2 = await rec(iid), und2 = await L.undoLabel(page)
  console.log(label, 'ANSWERED toast', t2, '| record', r2, '| undo', und2, '| question back/bar gone', again)
  await L.hush(page); await shot(page, `${tag}-${ptag}-3-answered`); await L.unhush(page)
  await L.clickUndo(page)
  const r3 = await rec(iid)
  console.log(label, 'UNDO once ->', r3, 'same as start', r3 === r0)
  await L.clickRedo(page)
  const r4 = await rec(iid)
  console.log(label, 'REDO ->', r4, 'same as answered', r4 === r2)
  F.push(`${label}: question up=${up}; heading "${head}"; lead "${lead}"; buttons ${JSON.stringify(btns)}; text "${text}"; box ${JSON.stringify(await L.measure(page, '[data-testid="oilconf"]'))}; record unchanged behind it=${mid === r0}. Don’t move: bar "${bar}" ${JSON.stringify(btxt)} ${JSON.stringify(bm)}; record unchanged=${r1 === r0}; Undo ${und0} -> ${und1}; chip at ${where} (picture-100ms); flash probes ${JSON.stringify(probes)}. Answer OIL -> question back & bar gone=${again}; Yes -> Move: toast "${t2}"; record ${r2}; Undo once -> ${r3} (same as start=${r3 === r0}); Redo -> ${r4} (same as answered=${r4 === r2})`)
  await L.clickUndo(page)   // back to start for the next scenario
  return true
}

if (WHO === 'us') {
  const iid = await L.fileIt(page, L.WED, { type: 'Meeting', people: ['bane'], from: '10:00', to: '11:00', title: 'Planning meeting' }, 'yes')
  F.push('Meeting filed by Ranger on Wed 15 10:00-11:00: ' + await rec(iid))
  await scenario('C3 one-day Meeting Wed15 -> Sat18', iid, 0.5, L.SAT, 'one')
  await L.clickUndo(page).catch(() => {})
  const run = await L.fileRun(page, '2026-07-14', '2026-07-15', { type: 'Meeting', people: ['bane'], from: '14:00', to: '15:00', title: 'Two-day review' }, 'yes')
  F.push('Two-day Meeting filed by drag across Tue14-Wed15 ("' + run.read + '"): ' + await rec(run.iid))
  await L.toMonth(page)
  const bb = await page.locator(`[data-testid="ib-bar-${run.iid}"]`).boundingBox(); console.log('two-day bar box', JSON.stringify(bb))
  await scenario('C3 two-day bar Tue14-Wed15 -> Sat18 (grabbed at its left end)', run.iid, 0.1, L.SAT, 'two')
} else {
  /* C4: Saber drags ANOTHER person's weekday Training onto Sun 19; then a weekday input onto another weekday */
  const iid = await L.fileIt(page, L.WED, { type: 'Training', people: ['nick'], from: '10:00', to: '12:00', title: 'Sim refresher' }, 'yes')
  F.push('Training filed for Tally on Wed 15 by Saber: ' + await rec(iid))
  await scenario('C4 Tally\'s Training Wed15 -> Sun19', iid, 0.5, '2026-07-19', 'sun')
  await L.toMonth(page)
  const r0 = await rec(iid); const und0 = await L.undoLabel(page)
  await dragBar(iid, 0.5, '2026-07-16')
  await page.waitForTimeout(500)
  const q = await tid(page, 'oilconf').count(), bar = await tid(page, 'oilbar').count()
  const r1 = await rec(iid), t = await L.toast(page), und1 = await L.undoLabel(page)
  console.log('C4 WEEKDAY->WEEKDAY question', q, 'bar', bar, 'toast', t, '| before', r0, '| after', r1, '| undo', und0, '->', und1)
  await shot(page, 'C4-wd-moved')
  F.push(`C4 Wed15 -> Thu16 (weekday to weekday): question count ${q}, OIL bar count ${bar}, toast "${t}", record before ${r0} after ${r1}, Undo ${und0} -> ${und1}`)
  await L.clickUndo(page)
  F.push('Undo once after the weekday move: ' + await rec(iid))
}
console.log('FACTS\n' + F.join('\n'))
console.log('ERRORS', JSON.stringify(errors))
await ctx.close(); await browser.close()
