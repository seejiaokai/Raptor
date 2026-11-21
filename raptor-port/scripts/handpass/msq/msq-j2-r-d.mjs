/* msq-j2-r-d v1 — R-D, R-E, R-F in ONE world (desktop 1536, fresh): the master's delete of a 149 man and 149's history;
   149's Approvals and access-request bell; the last admin again. Set ONLY=D,E,F to choose (they chain in one world). */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'rd1'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, U, say, sleep, row } = H
const ONLY = (process.env.ONLY || 'D,E,F').split(',')
say('msq-j2-r-d v1', ONLY.join(','))
const w = await X.open({ user: 'ad9' })
const p = w.page
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, 'desktop', 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
const elogs = () => p.evaluate(() => Object.keys(localStorage).filter(k => k.includes('elog:')).map(k => {
  let v = localStorage.getItem(k); try { v = JSON.parse(v) } catch {}
  const r = v && (v.v || v.value || v)
  return { u: r?.u, sub: r?.sub, lbl: String(r?.lbl || r?.what || '').slice(0, 90), date: r?.date, kind: r?.kind || r?.fld }
}))
const words = () => U.bodyText(p)
const cellTxt = async (pid, d) => (await p.locator(`[data-testid="cell-${pid}-${d}"]`).first().innerText().catch(() => '(no cell)')).replace(/\s+/g, ' ').trim()
const cellCls = async (pid, d) => p.locator(`[data-testid="cell-${pid}-${d}"]`).first().evaluate(e => e.className).catch(() => '(no cell)')
const pid = {}
for (const n of ['Merlin', 'Osprey', 'Kestrel']) pid[n] = await U.pidOf(p, n)
say('pids', JSON.stringify(pid))
const lw = async () => { await X.L.go(p, 'leavewar'); await sleep(2500) }
const approveState = () => p.locator('[data-testid="bid-approve-tick"]').first().evaluate(e => 'aria-pressed=' + e.getAttribute('aria-pressed') + ' aria-checked=' + e.getAttribute('aria-checked') + ' class=' + e.className)
async function bidLL(who, d, picName) {
  await H.lwCell(w, pid[who], d)
  const st = await approveState()
  await X.pic(w, picName + '-window')
  return st
}
if (ONLY.includes('D')) {
  await safe('RD-bid', async () => {
    await lw()
    const st = await bidLL('Merlin', '2026-11-26', 'd01')
    say('approve state', st)
    // Auto-approve OFF: the tick's "on" look is read from its class / aria; press it only if it reads on
    if (/aria-pressed=true|aria-checked=true|\bon\b/.test(st)) { await p.locator('[data-testid="bid-approve-tick"]').first().click(); await sleep(500); say('approve now', await approveState()) }
    await X.pic(w, 'd02-approve-off')
    await p.locator('[data-testid="bid-LL"]').click(); await sleep(900)
    await X.pic(w, 'd03-ll-pressed')
    say('sheet after LL', await p.evaluate(() => (document.querySelector('.bidsheet')?.innerText || '').replace(/\s+/g, ' ').slice(0, 300)))
    // a below-zero confirm: tap the same leave again if the sheet is still open and asks
    if (await p.locator('.bidsheet:visible').count()) {
      const t = await p.evaluate(() => (document.querySelector('.bidsheet')?.innerText || ''))
      if (/again|below zero/i.test(t)) { await p.locator('[data-testid="bid-LL"]').click(); await sleep(900); await X.pic(w, 'd04-ll-again') }
    }
    if (await p.locator('.bidsheet:visible').count()) { await p.keyboard.press('Escape'); await sleep(600) }
    await X.pic(w, 'd05-after-bid')
    const t = await cellTxt(pid.Merlin, '2026-11-26'), c = await cellCls(pid.Merlin, '2026-11-26')
    row('R-D', 'desktop', 'ad9: Merlin Thu 26 Nov, Auto-approve off, LL', 'a bid (not approved) shows on the day', `cell "${t}" class ${c.slice(0, 80)}; approve state before: ${st}`, /LL/.test(t) ? 'PASS' : 'FAIL', 'd05-after-bid.png')
  })
  await safe('RD-oil', async () => {
    await H.lwCell(w, pid.Merlin, '2026-11-24')
    await p.getByRole('button', { name: 'Grant OIL' }).click(); await sleep(700)
    await p.locator('input[placeholder^="why"]').fill('r walk'); await X.pic(w, 'd06-grant-form')
    await p.getByRole('button', { name: /^Give (FO|HO)/ }).first().click(); await sleep(900)
    await p.keyboard.press('Escape'); await sleep(500)
    await X.pic(w, 'd07-after-grant')
    const t = await cellTxt(pid.Merlin, '2026-11-24')
    row('R-D', 'desktop', 'ad9: Merlin Tue 24 Nov, Grant OIL, reason, Give FO', 'FO on the day', `cell "${t}"`, /FO/.test(t) ? 'PASS' : 'FAIL', 'd07-after-grant.png')
  })
  await safe('RD-del', async () => {
    await H.swap(w, 'ad')
    await X.L.go(p, 'admin'); await sleep(900)
    await p.locator(H.FIND).fill('Merlin'); await sleep(600)
    await p.locator(`.acc-row[data-person="${pid.Merlin}"] .acc-tap`).first().click(); await sleep(800)
    const before = await elogs(); say('elog before delete', JSON.stringify(before))
    await p.locator('#accEdDel').click(); await sleep(700)
    await p.locator('#accEdDel').click(); await sleep(1500)
    await X.pic(w, 'd08-merlin-deleted')
    const after = await elogs(); say('elog after delete', JSON.stringify(after))
    const nw = after.filter(x => !before.some(o => JSON.stringify(o) === JSON.stringify(x)))
    const mine = after.filter(x => /Merlin|mer9/.test(x.lbl + x.sub) || x.sub === 'mer9')
    row('R-D', 'desktop', 'ad: Admin -> Users -> Merlin -> Delete (twice); the stored history lines', 'filed under u149: Merlin deleted; bid removed 26 Nov; OIL award taken away 24 Nov', `new lines: ${JSON.stringify(nw.map(x => [x.u, x.lbl, x.date]))}`,
      nw.some(x => x.u === 'u149' && /delet/i.test(x.lbl)) && nw.some(x => x.u === 'u149' && /bid.*remov|remov.*bid/i.test(x.lbl)) && nw.some(x => x.u === 'u149' && /OIL.*(taken|remov)/i.test(x.lbl)) && nw.every(x => x.u === 'u149') ? 'PASS' : 'FAIL', 'd08-merlin-deleted.png')
    await H.swap(w, 'ad9')
    await lw()
    const r = {}
    for (const d of ['2026-11-19', '2026-11-20', '2026-11-24', '2026-11-26', '2026-12-01']) r[d] = await cellTxt(pid.Merlin, d)
    const nm = await p.locator('tr:has([data-testid="cell-' + pid.Merlin + '-2026-11-19"]) .puck, tr:has([data-testid="cell-' + pid.Merlin + '-2026-11-19"]) .nm').first().innerText().catch(() => '(no name)')
    await p.locator(`[data-testid="cell-${pid.Merlin}-2026-11-24"]`).first().scrollIntoViewIfNeeded().catch(() => {})
    await X.pic(w, 'd09-ad9-war-after')
    row('R-D', 'desktop', "ad9: the war after Merlin's delete", "Merlin's row with nothing from today on", `name "${nm}" cells ${JSON.stringify(r)}`, 'RECORD', 'd09-ad9-war-after.png')
  })
}
if (ONLY.includes('E')) {
  await safe('RE-open', async () => {
    await H.swap(w, 'ad9')
    await lw()
    await p.locator('[data-testid="open-chip"]').first().click(); await p.locator('[data-testid="open-dates"]').waitFor(); await sleep(500)
    await p.locator('[data-testid="od-month-2026-11"]').click(); await sleep(800)
    const ln = (await p.locator('[data-testid^="od-line-"]').allInnerTexts()).map(s => s.replace(/\s+/g, ' ').trim())
    await X.pic(w, 'e00-nov-opened')
    await p.locator('[data-testid="open-dates-close"]').click(); await sleep(700)
    row('E-setup', 'desktop', 'ad9: open November for bidding (so Osprey can bid on Mon 30 Nov)', 'RECORD', `lines ${JSON.stringify(ln)}; chip "${(await p.locator('[data-testid="open-chip"]').first().innerText()).replace(/\s+/g, ' ')}"`, 'RECORD', 'e00-nov-opened.png')
  })
  await safe('RE-bid', async () => {
    await H.swap(w, 'us9')
    await lw()
    await H.lwCell(w, pid.Osprey, '2026-11-30')
    await X.pic(w, 'e01-us9-day-window')
    say('us9 sheet', await p.evaluate(() => (document.querySelector('.bidsheet')?.innerText || '').replace(/\s+/g, ' ').slice(0, 300)))
    await p.locator('[data-testid="bid-LL"]').click(); await sleep(900)
    await X.pic(w, 'e02-us9-ll')
    const t0 = await p.evaluate(() => (document.querySelector('.bidsheet')?.innerText || ''))
    if (/again|below zero/i.test(t0)) { await p.locator('[data-testid="bid-LL"]').click(); await sleep(900) }
    if (await p.locator('.bidsheet:visible').count()) { await p.keyboard.press('Escape'); await sleep(600) }
    await X.pic(w, 'e03-us9-after')
    row('E-setup', 'desktop', 'us9: Mon 30 Nov bid LL', 'a bid shows', 'cell "' + await cellTxt(pid.Osprey, '2026-11-30') + '"', 'RECORD', 'e03-us9-after.png')
  })
  await safe('RE-approvals', async () => {
    await H.swap(w, 'ad9')
    await lw()
    await p.locator('[data-testid="lw-tab-approvals"]').click(); await sleep(1500)
    await X.pic(w, 'e04-approvals')
    const t = await words()
    const newMark = await p.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /^new$/i.test((e.textContent || '').trim()) && e.getBoundingClientRect().width > 2).length)
    row('R-E', 'desktop', "ad9: Leave War -> Approvals", "Osprey's bid listed and marked new", `Osprey on screen: ${/Osprey/.test(t)}; 'new' marks: ${newMark}; words: ${t.slice(t.indexOf('Approvals'), t.indexOf('Approvals') + 400)}`, /Osprey/.test(t) && newMark > 0 ? 'PASS' : 'FAIL', 'e04-approvals.png')
    await p.locator('[data-testid="lw-tab-grid"]').click(); await sleep(1200)
    await p.locator('[data-testid="lw-tab-approvals"]').click(); await sleep(1500)
    await X.pic(w, 'e05-approvals-again')
    const newMark2 = await p.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /^new$/i.test((e.textContent || '').trim()) && e.getBoundingClientRect().width > 2).length)
    row('R-E', 'desktop', 'ad9: leave Approvals (Grid), come back', 'no longer marked new', `'new' marks: ${newMark2}; Osprey still listed: ${/Osprey/.test(await words())}`, newMark2 === 0 ? 'PASS' : 'FAIL', 'e05-approvals-again.png')
  })
  await safe('RE-access', async () => {
    await X.signOut(w)
    await p.fill('#luser', 'newr1'); await p.fill('#lpass', 'x'); await p.click('#loginForm button[type=submit]'); await sleep(1500)
    await X.pic(w, 'e06-request-card')
    say('request card', await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 500)))
    say('fields', await p.evaluate(() => [...document.querySelectorAll('input,select,button,textarea')].filter(b => b.getBoundingClientRect().width > 2).map(b => b.tagName + '#' + b.id + '[' + (b.placeholder || b.innerText || b.value || '').slice(0, 24) + ']').join(' ')))
    const inputs = p.locator('input:visible')
    await inputs.nth(0).fill('Newbird'); await inputs.nth(1).fill('NB')
    const sels = p.locator('select:visible')
    const n = await sels.count()
    for (let k = 0; k < n; k++) { const opts = await sels.nth(k).locator('option').allTextContents(); say('select', k, opts.join('|')); const pick = opts.find(o => /^Pilot$/.test(o.trim())) || opts.find(o => /149/.test(o)) || opts.find(o => !/^Pick/.test(o.trim())); await sels.nth(k).selectOption({ label: pick }); say('picked', pick) }
    await X.pic(w, 'e07-request-filled')
    say('card after fill', await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 600)))
    await p.locator('#accSend').click(); await sleep(1500)
    await X.pic(w, 'e08-request-sent')
    say('after send', await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 500)))
    await H.swap(w, 'ad9').catch(async e => { say('swap err', e.message.slice(0, 100)) })
  })
  await safe('RE-bell', async () => {
    await sleep(500)
    const b = await H.bellOpen(w, 'e09-ad9-bell')
    row('R-E', 'desktop', 'ad9 signs in after a new person asked for access', 'his bell lights with the access request', `bell cls "${b.cls}"; lines ${JSON.stringify(b.lines)}`, b.lines && b.lines.some(l => /access|Newbird|request/i.test(l)) ? 'PASS' : 'FAIL', 'e09-ad9-bell.png')
    const line = p.locator('[data-testid="bell-list"] *, .bell-list *').filter({ hasText: /access|Newbird|request/i }).last()
    if (await line.count()) { await line.click().catch(() => {}); await sleep(1200); await X.pic(w, 'e10-after-line-tap'); say('page after tap', await p.evaluate(() => window.CURPAGE), (await words()).slice(0, 300)) }
    await H.bellClose(w)
    await X.L.go(p, 'admin'); await sleep(1200)
    await X.pic(w, 'e11-admin-users')
    say('admin words', (await words()).slice(0, 500))
    await X.L.go(p, 'leavewar'); await sleep(1500)
    const b2 = await H.bellOpen(w, 'e12-ad9-bell-after-leaving')
    row('R-E', 'desktop', 'ad9: open the bell, then Admin -> Users, leave; bell again', 'RECORD whether the bell is dark again', `bell cls "${b2.cls}"; lines ${JSON.stringify(b2.lines)}`, 'RECORD', 'e12-ad9-bell-after-leaving.png')
    await H.bellClose(w)
    await H.swap(w, 'ad')
    const b3 = await H.bellOpen(w, 'e13-master-bell')
    row('R-E', 'desktop', 'ad (the master): bell', 'RECORD what it shows', `bell cls "${b3.cls}"; lines ${JSON.stringify(b3.lines)}`, 'RECORD', 'e13-master-bell.png')
    await H.bellClose(w)
  })
}
if (ONLY.includes('F')) {
  await safe('RF-last', async () => {
    await H.swap(w, 'ad')
    await X.L.go(p, 'admin'); await sleep(900)
    const open = async cs => { await p.locator(H.FIND).fill(cs); await sleep(600); await p.locator(`.acc-row[data-person="${pid[cs]}"] .acc-tap`).first().click(); await sleep(800) }
    await open('Kestrel')
    await p.getByRole('button', { name: /^Archive$/ }).first().click(); await sleep(1200)
    await X.pic(w, 'f01-kestrel-archive-refused')
    const t = await words()
    const m = t.match(/Kestrel is 149.s last admin[^.]*\./)?.[0] || '(no refusal words)'
    row('R-F', 'desktop', 'ad: Admin -> Users -> Kestrel -> Archive', "refused: Kestrel is 149's last admin. Make another admin of 149 first.", m, /last admin/.test(m) ? 'PASS' : 'FAIL', 'f01-kestrel-archive-refused.png')
    await open('Osprey')
    const sel = p.locator('select:visible').filter({ hasText: 'Member' }).first()
    await sel.selectOption({ label: 'Admin' }).catch(async () => { const opts = await sel.locator('option').allTextContents(); say('opts', opts.join('|')); await sel.selectOption({ index: opts.findIndex(o => /^Admin/.test(o)) }) })
    await sleep(300)
    await p.getByRole('button', { name: /^Save$/ }).first().click(); await sleep(1200)
    await X.pic(w, 'f02-osprey-admin')
    row('R-F', 'desktop', 'ad: Osprey -> role Admin -> Save', 'saved', (await words()).match(/Osprey.{0,80}/)?.[0] || '', 'RECORD', 'f02-osprey-admin.png')
    await p.locator(H.FIND).fill('Kestrel'); await sleep(600)
    await p.locator(`.acc-row[data-person="${pid.Kestrel}"] .acc-tap`).first().click().catch(() => {}); await sleep(700)
    await p.getByRole('button', { name: /^Archive$/ }).first().click(); await sleep(1300)
    await X.pic(w, 'f03-kestrel-archived')
    const t2 = await words()
    const m2 = t2.match(/(Kestrel is 149.s last admin[^.]*\.|Kestrel archived[^.]{0,60}|Archived\s*·\s*\d+)/)?.[0] || '(no words)'
    row('R-F', 'desktop', 'ad: Kestrel -> Archive again', 'archived', m2, /last admin/.test(m2) ? 'FAIL' : 'PASS', 'f03-kestrel-archived.png')
  })
}
await X.fin(w)
