/* msq-j2-w3-de v1 — W3-D, E, F-probe (world 2): the master archives a 149 man by touch; 142's plain admin refused; 149's admin round */
process.env.MSQ_WHO = 'w3'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'de1'
const H = await (await import('./msq-j2-w3-h.mjs')).mk()
const { X, U, say, sleep, row } = H
say('msq-j2-w3-de v1')
const w = await X.open({ phone: true, user: 'ad' })
const { page } = w
const safe = async (label, fn) => { try { return await fn() } catch (e) { say('ERR', label, String(e.message).split('\n')[0]); return null } }
const FIND = 'input[aria-label="Find a callsign or sign-in"]'
const openUsers = async cs => {
  await X.L.go(page, 'admin'); await sleep(1000)
  const f = page.locator(FIND)
  if (!(await f.isVisible())) { const t = page.locator('button:visible', { hasText: /^Users/ }).first(); if (await t.count()) { await t.tap(); await sleep(800) } }
  await f.fill(cs); await sleep(700)
  const pid = await U.pidOf(page, cs)
  const tap = page.locator(`.acc-row[data-person="${pid}"] .acc-tap`).first()
  if (!(await tap.count())) return { pid, opened: false }
  await tap.tap(); await sleep(900)
  return { pid, opened: true }
}
const controls = pid => page.evaluate(pid => {
  const root = document.querySelector(`.acc-row[data-person="${pid}"]`)
  const scope = root ? [root, root.nextElementSibling, root.parentElement].filter(Boolean) : []
  const seen = new Set(), out = []
  for (const s of scope) for (const e of s.querySelectorAll('button,input,select,[role=button]')) {
    if (seen.has(e)) continue; seen.add(e)
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue
    out.push(`${e.tagName}#${e.id || ''}[${(e.getAttribute('aria-label') || e.textContent || e.value || '').replace(/\s+/g, ' ').trim().slice(0, 30)}]@${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}`)
  }
  return out
}, pid)
const cells = async (pid, isos) => page.evaluate(([pid, isos]) => isos.map(i => { const c = document.querySelector(`[data-testid="cell-${pid}-${i}"]`); return i.slice(5) + '=' + (c ? (c.innerText.replace(/\s+/g, ' ').trim() || '·') + (c.className ? '{' + String(c.className).replace(/\s+/g, '.').slice(0, 40) + '}' : '') : 'nocell') }).join(' '), [pid, isos])
const ISOS = ['2026-11-10', '2026-11-15', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-23', '2026-11-30']
const warLook = async (user, cs, tag) => {
  await X.L.go(page, 'leavewar'); await sleep(2800)
  const pid = await U.pidOf(page, cs)
  const c = page.locator(`[data-testid="cell-${pid}-2026-11-19"]`).first()
  say(cs, 'cell 19 Nov count', await c.count())
  await X.pic(w, tag + '-lw-first')
  if (await c.count()) { await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(600) }
  await X.pic(w, tag + '-lw-at-19nov')
  const sig = await cells(pid, ISOS)
  say(cs, 'ROW CELLS', sig)
  return sig
}
/* ---- D */
let condor
await safe('D master archives Condor', async () => {
  const o = await openUsers('Condor')
  await X.pic(w, 'd01-condor-row-opened')
  say('Condor controls', JSON.stringify(await controls(o.pid)))
  const arch = page.getByRole('button', { name: /^Archive/ }).locator('visible=true').first()
  say('archive box', arch ? await arch.evaluate(e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom].map(Math.round).join(',') }).catch(() => 'none') : 'none')
  await arch.tap(); await sleep(1200)
  await X.pic(w, 'd02-after-archive')
  const t = await U.bodyText(page)
  say('USERS TEXT', t.slice(0, 700))
  row('W3-D', 'iPhone', 'ad (master) Admin -> Users -> Condor -> Archive', 'Condor in the Archived fold', `${(t.match(/Archived · \d+/) || ['(no Archived count)'])[0]}; ${(t.match(/Condor[^.]{0,80}archived[^.]{0,60}/i) || ['(no toast)'])[0]}; ${(t.match(/Archived 19 Nov[^.]{0,30}/) || ['(no archived-on line)'])[0]}`, /Archived 19 Nov|Archived · \d/.test(t) ? 'PASS' : 'FAIL', 'd02-after-archive.png')
  // open the Archived fold
  const fold = page.locator('button:visible, summary:visible, [role=button]:visible', { hasText: /^Archived/ }).first()
  if (await fold.count()) { await fold.tap(); await sleep(800) }
  await page.locator(FIND).fill('Condor').catch(() => {}); await sleep(600)
  await X.pic(w, 'd03-archived-fold')
  const t2 = await U.bodyText(page)
  row('W3-D', 'iPhone', 'the Archived fold, with Condor', 'Condor listed under Archived', (t2.match(/.{0,60}Condor.{0,100}/) || ['(Condor not found in words)'])[0], /Condor/.test(t2) ? 'PASS' : 'FAIL', 'd03-archived-fold.png')
})
await H.swap(w, 'ad9')
await safe('D ad9 looks at the war', async () => {
  condor = await warLook('ad9', 'Condor', 'd04')
  row('W3-D', 'iPhone', "ad9 opens 149's Leave War, Condor's row around Thu 19 Nov", 'months before 19 Nov kept; from 19 Nov posted out (hatched PO)', condor, 'RECORD', 'd04-lw-at-19nov.png')
})
await safe('D heron', async () => {
  const o = await openUsers('Heron')
  await X.pic(w, 'd05-heron-row')
  const arch = page.getByRole('button', { name: /^Archive/ }).locator('visible=true').first()
  await arch.tap(); await sleep(1200)
  await X.pic(w, 'd06-heron-archived')
  const t = await U.bodyText(page)
  row('W3-D', 'iPhone', 'ad9 Admin -> Users -> Heron -> Archive (his own man)', 'Heron archived', (t.match(/Archived 19 Nov[^.]{0,30}/) || ['(no archived-on line)'])[0] + ' ; ' + (t.match(/Archived · \d+/) || [''])[0], /Archived 19 Nov|Archived · \d/.test(t) ? 'PASS' : 'FAIL', 'd06-heron-archived.png')
  const heron = await warLook('ad9', 'Heron', 'd07')
  const norm = s => (s || '').replace(/\{[^}]*\}/g, '')
  row('W3-D', 'iPhone', "the war: Heron's row looks the same as Condor's at Thu 19 Nov", "the same shape as Condor's", `Heron: ${heron} || Condor: ${condor}`, norm(heron) === norm(condor) ? 'PASS' : 'FAIL', 'd07-lw-at-19nov.png vs d04-lw-at-19nov.png')
})
/* ---- E */
await H.swap(w, 'ad2')
await safe('E', async () => {
  const o = await openUsers('Osprey')
  await X.pic(w, 'e01-osprey-row')
  const ctl = await controls(o.pid)
  say('Osprey controls', JSON.stringify(ctl))
  const before = await page.locator(`.acc-row[data-person="${o.pid}"]`).first().innerText().catch(() => '').then(s => s.replace(/\s+/g, ' '))
  for (const [name, exp] of [['Suspend', "He is 149's. Only an admin of 149 can change his account."], ['Archive', "He is 149's. Only an admin of 149 can change him."]]) {
    const b = page.getByRole('button', { name: new RegExp('^' + name) }).locator('visible=true').first()
    if (!(await b.count())) { row('W3-E', 'iPhone', `ad2 presses ${name} on Osprey`, exp, `no ${name} button; controls: ${ctl.join(' | ')}`, 'RECORD', 'e01-osprey-row.png'); continue }
    await b.tap(); await sleep(150); await X.pic(w, 'e-' + name + '-tap'); await sleep(1100)
    await X.pic(w, 'e-' + name)
    const t = await U.bodyText(page)
    const m = t.match(/He is 14\d.s\. Only an admin of 14\d can change (his account|him)\./)
    const box = m ? await page.evaluate(() => { const es = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /He is 14\d.s\. Only an admin/.test(e.textContent) && e.getBoundingClientRect().width > 2); const e = es[0]; if (!e) return 'no leaf'; const r = e.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)} ${r.right <= 402 && r.left >= 0 && r.bottom <= 874 && r.top >= 0 ? 'inside' : 'OUTSIDE'}` }) : 'n/a'
    row('W3-E', 'iPhone', `ad2 presses ${name} on Osprey`, exp, `${m ? m[0] : 'no refusal words; page tail: ' + t.slice(-200)}; words box: ${box}`, m && m[0] === exp && /inside/.test(box) ? 'PASS' : 'FAIL', 'e-' + name + '.png')
    await page.getByRole('button', { name: /^(Cancel|Close|No|Keep)/ }).locator('visible=true').first().tap({ timeout: 1500 }).catch(() => {}); await sleep(500)
  }
  await X.L.go(page, 'admin'); await sleep(900)
  await page.locator(FIND).fill('Osprey'); await sleep(700)
  const after = (await page.locator(`.acc-row[data-person="${o.pid}"]`).first().innerText().catch(() => '(none)')).replace(/\s+/g, ' ')
  await X.pic(w, 'e-osprey-after')
  row('W3-E', 'iPhone', 'Osprey looked at afterwards', 'unchanged', `before: ${before.slice(0, 120)} || after: ${after.slice(0, 120)}`, after.slice(0, 80) === before.slice(0, 80) || /Osprey/.test(after) ? 'RECORD' : 'FAIL', 'e-osprey-after.png')
})
/* ---- F probe: the Users page's own controls for ad9 */
await H.swap(w, 'ad9')
await safe('F probe', async () => {
  await X.L.go(page, 'admin'); await sleep(1000)
  await X.pic(w, 'f00-users')
  say('USERS PAGE controls:\n' + await H.vis(page, '#page-admin button, #page-admin input, #page-admin select, #page-admin summary'))
})
await X.fin(w)
