/* msq-fr15-w4 v1 — W4: a deleted man stays off Quals. FR15_PHONE=1 for the iPhone. */
process.env.FR15_SC = 'w4'
const L = await import('./msq-fr15-lib.mjs')
const { X, U, say, sleep, row, tapIt, openAt, FIND, size } = L
const P = L.phone ? 'phone' : 'desktop'
const pn = (s, what) => `${s}-${P}-${what}`
say('msq-fr15-w4 v1', size)
const w = await openAt('ad2')
const p = w.page
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, size, 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
/* the number of drawn elements (box wider than 1px) whose own trimmed text is exactly the word, plus inputs holding it */
const drawn = (word) => p.evaluate(wd => {
  let n = 0
  for (const e of document.querySelectorAll('#page-quals *')) {
    if (e.children.length) continue
    const r = e.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    if ((e.textContent || '').trim().toLowerCase() === wd.toLowerCase()) n++
  }
  return n
}, word)
const mentions = (word, scope = 'body') => p.evaluate(([wd, sc]) => [...document.querySelectorAll(sc + ' *')].filter(e => !e.children.length && e.getBoundingClientRect().width > 1 && new RegExp(wd, 'i').test(e.textContent || '')).map(e => e.textContent.trim().slice(0, 40)).slice(0, 6), [word, scope])
const quals = async name => {
  await X.L.go(p, 'quals'); await sleep(1800)
  await X.pic(w, name)
  return { exact: await drawn('Outlaw'), any: await mentions('Outlaw', '#page-quals') }
}
await safe('W4-0', async () => {
  const q0 = await quals(pn('s0', 'quals-before'))
  row('W4-0', size, 'before: Quals page (Hunter)', 'Outlaw is on Quals (premise: he exists before the delete)', JSON.stringify(q0), q0.exact > 0 ? 'PASS' : 'FAIL', pn('s0', 'quals-before') + '.png')
})
await safe('W4-1', async () => {
  await X.L.go(p, 'admin'); await sleep(1200); if (!(await p.locator(FIND).isVisible().catch(() => false))) { await tapIt(p.locator('#page-admin >> text=/^Users/').first()); await sleep(1000) }
  await p.locator(FIND).fill('Outlaw'); await sleep(700)
  await tapIt(p.locator('.acc-row[data-person="casper"] .acc-tap').first()); await sleep(900)
  await X.pic(w, pn('s1', 'row-open'))
  await tapIt(p.locator('#accEdDel')); await sleep(110)
  await X.pic(w, pn('s1', 'delete-press'))
  await sleep(800)
  await X.pic(w, pn('s1', 'delete-asked'))
  const btns = await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 2).map(b => (b.id || '') + '|' + b.innerText.trim().slice(0, 30)).filter(s => /Delete|Confirm|Yes|Cancel|OK/i.test(s)))
  say('buttons', JSON.stringify(btns))
  await sleep(700)
  say('second press text', await p.locator('#accEdDel').innerText().catch(() => 'none'))
  await tapIt(p.locator('#accEdDel')); await sleep(110); await X.pic(w, pn('s1', 'confirm-press')); await sleep(1500)
  const btn2 = await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 2).map(b => (b.id || '') + '|' + b.innerText.trim().slice(0, 30)).filter(s => /Delete|Confirm|Yes|OK|Archived/i.test(s)))
  say('buttons after', JSON.stringify(btn2))
  await X.pic(w, pn('s1', 'after-delete'))
  const left = await p.locator('.acc-row[data-person="casper"]').count()
  row('W4-1', size, 'Hunter deletes Outlaw (Casper) on Admin > Users', 'the person is deleted (his row gone)', `rows for casper now ${left}; buttons seen ${JSON.stringify(btns)}`, left === 0 ? 'PASS' : 'FAIL', pn('s1', 'after-delete') + '.png')
})
const lookAll = async tag => {
  const q = await quals(pn(tag, 'quals'))
  row('W4-' + tag, size, `${tag}: Quals page`, 'Outlaw on no list of Quals', JSON.stringify(q), q.any.length === 0 ? 'PASS' : 'FAIL', pn(tag, 'quals') + '.png')
  await X.L.go(p, 'admin'); await sleep(1200); if (!(await p.locator(FIND).isVisible().catch(() => false))) { await tapIt(p.locator('#page-admin >> text=/^Users/').first()); await sleep(1000) }
  await p.locator(FIND).fill('Outlaw'); await sleep(700)
  await X.pic(w, pn(tag, 'admin-search'))
  const a1 = await p.evaluate(() => [...document.querySelectorAll('.acc-row')].filter(e => e.getBoundingClientRect().width > 1).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 60)))
  await p.locator(FIND).fill(''); await sleep(500)
  const allTxt = await mentions('Outlaw', '#page-admin')
  say(tag, 'admin controls', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#page-admin button, #page-admin summary, #page-admin [role=tab]')].filter(e => e.getBoundingClientRect().width > 2).map(e => e.innerText.trim().slice(0, 24)).filter(Boolean).slice(0, 40))))
  say(tag, 'admin: rows for the search', JSON.stringify(a1), 'mentions with no search', JSON.stringify(allTxt))
  // the Archived list
  say(tag, 'archive-ish text', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#page-admin *')].filter(e => !e.children.length && e.getBoundingClientRect().width > 2 && /archiv/i.test(e.textContent || '')).map(e => e.tagName + ':' + e.textContent.trim().slice(0, 40)))))
  const arch = p.locator('#page-admin >> text=/Archived/i').first()
  let archTxt = 'no Archived control'
  if (await arch.count()) { await tapIt(arch); await sleep(800); await X.pic(w, pn(tag, 'admin-archived')); archTxt = JSON.stringify(await mentions('Outlaw', '#page-admin')) }
  row('W4-' + tag + 'b', size, `${tag}: Admin > Users lists, search "Outlaw", all lists, and the Archived list`, 'Outlaw nowhere', `search rows ${JSON.stringify(a1)}; mentions in the whole page ${JSON.stringify(allTxt)}; archived list open: ${archTxt}`, a1.length === 0 && allTxt.length === 0 && (archTxt === '[]' || archTxt === 'no Archived control') ? (archTxt === 'no Archived control' ? 'BLOCKED' : 'PASS') : 'FAIL', pn(tag, 'admin-archived') + '.png')
}
await safe('W4-2', async () => { await lookAll('s2') })
await safe('W4-3', async () => { await p.reload(); await sleep(1500); if (await p.locator('#luser').count()) await X.login(p, 'ad2'); await lookAll('s3') })
await safe('W4-4', async () => {
  await X.L.go(p, 'leavewar'); await sleep(2600)
  const m = await mentions('Outlaw', '#page-leavewar')
  const c = await p.locator('[data-testid="cell-casper-2026-07-17"]').count()
  await X.pic(w, pn('s4', 'leavewar-after-delete'))
  row('W4-4', size, 'extra look (not in the brief): Leave War grid after the delete', 'RECORD', `Outlaw mentions in the Leave War page ${JSON.stringify(m)}; Outlaw's cells ${c}`, 'RECORD', pn('s4', 'leavewar-after-delete') + '.png')
})
await X.pic(w, pn('s9', 'whole-screen'))
await X.fin(w)
