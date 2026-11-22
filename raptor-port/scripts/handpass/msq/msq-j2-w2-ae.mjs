/* msq-j2-w2-ae v1 — W2-A … W2-E in one world (desktop). */
process.env.MSQ_WHO = 'w2'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'ae1'
const H = await (await import('./msq-j2-w2-h.mjs')).mk()
const { X, U, say, sleep, row, iso, T } = H
const ONLY = (process.env.ONLY || 'A,B,C,D,E').split(',')
say('msq-j2-w2-ae v1', ONLY.join(','))
const w = await X.open({ user: 'ad2' })
const p = w.page
const step = async (name, fn) => { if (!ONLY.includes(name)) return; try { await fn() } catch (e) { say('STEP FAILED', name, e.message.slice(0, 300)); try { await X.pic(w, 'fail-' + name) } catch {}; row('W2-' + name, 'desktop', 'script step', 'completes', 'script error: ' + e.message.slice(0, 200), 'OWED', 'fail-' + name + '.png') } }
const pid = {}
for (const n of ['Osprey', 'Merlin', 'Heron', 'Saber', 'Ace', 'Kestrel', 'Prowler', 'Ranger']) pid[n] = await U.pidOf(p, n)
say('pids', JSON.stringify(pid))
const WORDS_ACC = "He is 149's. Only an admin of 149 can change his account."
const WORDS_PER = "He is 149's. Only an admin of 149 can change him."
// one press: picture after it, words new on screen, the known refusal sentence
async function door(tag, pic, fn) {
  // a refusal band from an earlier press is waited out first, so what is read after the press is this press's own
  for (let i = 0; i < 40; i++) { if (!H.known(await U.bodyText(p))) break; await sleep(500) }
  const before = await U.bodyText(p)
  try { await fn() } catch (e) { say('door error', tag, e.message.slice(0, 120)) }
  await sleep(1000)
  await X.pic(w, pic)
  const after = await U.bodyText(p)
  return { nw: H.newWords(before, after), kw: H.known(after), after }
}
let r2
const listRow = async cs => { await H.usersPage(w); await p.locator(H.FIND).fill(cs); await sleep(700); return H.rowWords(p, pid[cs]) }
const reaches = async (cs) => (await H.controls(p, pid[cs])).map(c => c.id || c.label).join(' | ')

await step('A', async () => {
  const ok = await H.openRowBy(w, 'Osprey', pid.Osprey)
  const w0 = await H.rowWords(p, pid.Osprey), d0 = await H.dots(p, pid.Osprey), s0 = await H.pstate(p, pid.Osprey)
  say('A Osprey before', w0, '|', d0, '|', s0)
  await X.pic(w, 'a1-00-osprey-open')
  const exp = WORDS_ACC
  const mark = (id, name, r) => row('W2-A1', 'desktop', name, exp, `new words: ${r.nw} ; known refusal: ${r.kw}`, r.kw === exp ? 'PASS' : (r.kw ? 'FAIL' : 'FAIL'), id)
  let r = await door('signin', 'a1-01-signin-save', async () => { await p.locator('#accEdName').fill('osp9x'); await p.locator('#accEdSave').click() })
  mark('a1-01-signin-save.png', 'ad2: Osprey sign-in box → "osp9x" → Save', r)
  await H.openRowBy(w, 'Osprey', pid.Osprey)
  const roleOpts = await H.selRole(p, 'admin'); say('role options', roleOpts)
  r = await door('role', 'a1-02-role-admin-save', async () => { await p.locator('#accEdRole').evaluate(s => { }); await H.selRole(p, '^admin|admin$'); await p.locator('#accEdSave').click() })
  mark('a1-02-role-admin-save.png', 'ad2: Osprey role → Admin → Save', r)
  await H.openRowBy(w, 'Osprey', pid.Osprey)
  r = await door('suspend', 'a1-03-suspend', async () => { await p.locator('#accEdOnOff').click() })
  mark('a1-03-suspend.png', 'ad2: Osprey → Suspend', r)
  await H.openRowBy(w, 'Osprey', pid.Osprey)
  r = await door('archive', 'a1-04-archive', async () => { await p.locator('#accEdArchive').click() })
  row('W2-A1', 'desktop', 'ad2: Osprey → Archive', WORDS_PER, `new words: ${r.nw} ; known refusal: ${r.kw}`, r.kw === WORDS_PER ? 'PASS' : 'FAIL', 'a1-04-archive.png')
  await H.openRowBy(w, 'Osprey', pid.Osprey)
  r = await door('delete1', 'a1-05-delete-first', async () => { await p.locator('#accEdDel').click() })
  const rd2 = await door('delete2', 'a1-06-delete-second', async () => { await p.locator('#accEdDel').click({ timeout: 3000 }) })
  row('W2-A1', 'desktop', 'ad2: Osprey → Delete (press twice)', exp, `first press (armed words): ${r.nw.slice(0, 200)} ; second press: ${rd2.nw.slice(0, 200)} ; known refusal: ${rd2.kw}`, rd2.kw === exp ? 'PASS' : 'FAIL', 'a1-05, a1-06')
  await p.locator('#accEdCancel').click().catch(() => {}); await sleep(600)
  await H.openRowBy(w, 'Osprey', pid.Osprey)
  const w1 = await H.rowWords(p, pid.Osprey), d1 = await H.dots(p, pid.Osprey), s1 = await H.pstate(p, pid.Osprey)
  const inp = await p.locator('#accEdName').inputValue().catch(() => '(no box)')
  const rl = await p.locator('#accEdRole').evaluate(s => s.options[s.selectedIndex]?.text).catch(() => '(no role)')
  await X.pic(w, 'a1-07-osprey-after')
  row('W2-A1', 'desktop', 'Osprey unchanged after all five doors', 'sign-in us9, Member, both dots as before', `row before: ${w0} ; after: ${w1} ; dots before: ${d0} after: ${d1} ; PEOPLE: ${s0} -> ${s1} ; sign-in box now: ${inp} ; role now: ${rl}`, w0 === w1 && d0 === d1 && inp === 'us9' ? 'PASS' : 'FAIL', 'a1-07-osprey-after.png')
  await p.locator('#accEdCancel').click().catch(() => {})
  // A2 Merlin
  await H.openRowBy(w, 'Merlin', pid.Merlin)
  const m0 = await H.rowWords(p, pid.Merlin)
  const hasGive = await p.locator('#accGive').count()
  if (!hasGive) row('W2-A2', 'desktop', 'ad2: Merlin → Give sign-in', exp, 'no Give sign-in control offered; controls: ' + await reaches('Merlin'), 'RECORD', '')
  else {
    r = await door('give', 'a2-01-give-signin', async () => { await p.locator('#accGiveName').fill('mer9x'); await p.locator('#accGive').click() })
    await H.openRowBy(w, 'Merlin', pid.Merlin)
    const m1 = await H.rowWords(p, pid.Merlin)
    row('W2-A2', 'desktop', 'ad2: Merlin → sign-in box "mer9x" → Give sign-in', exp, `new words: ${r.nw} ; known refusal: ${r.kw} ; Merlin row before: ${m0} after: ${m1}`, r.kw === exp && m0 === m1 ? 'PASS' : 'FAIL', 'a2-01-give-signin.png')
  }
  // A3
  await H.swap(w, 'ad')
  await H.openRowBy(w, 'Heron', pid.Heron)
  await p.locator('#accEdArchive').click(); await sleep(1000)
  await X.pic(w, 'a3-00-ad-archived-heron')
  say('A3 Heron by master', await H.pstate(p, pid.Heron))
  await H.swap(w, 'ad2')
  await H.openArchivedRow(w, 'Heron', pid.Heron)
  await X.pic(w, 'a3-01-archived-row')
  say('A3 Heron controls', await reaches('Heron'))
  const wp = WORDS_PER
  r = await door('restore', 'a3-02-restore', async () => { await p.locator('#accArRestore').click() })
  row('W2-A3', 'desktop', 'ad2: archived Heron → Restore', wp, `new words: ${r.nw} ; known refusal: ${r.kw}`, r.kw === wp ? 'PASS' : 'FAIL', 'a3-02-restore.png')
  await H.openArchivedRow(w, 'Heron', pid.Heron)
  await p.locator('#accArCs').fill('HeronB'); await sleep(400)
  const lab = (await p.locator('#accArRestore').textContent()).trim()
  r = await door('restoreas', 'a3-03-restore-as', async () => { await p.locator('#accArRestore').click() })
  row('W2-A3', 'desktop', `ad2: name box "HeronB" → button reads "${lab}" → press`, wp, `new words: ${r.nw} ; known refusal: ${r.kw}`, r.kw === wp ? 'PASS' : 'FAIL', 'a3-03-restore-as.png')
  await H.openArchivedRow(w, 'Heron', pid.Heron)
  await p.locator('#accArCs').fill('HeronB'); await sleep(400)
  r = await door('savename', 'a3-04-save-name', async () => { await p.getByRole('button', { name: 'Save name' }).first().click() })
  const st = await H.pstate(p, pid.Heron)
  row('W2-A3', 'desktop', 'ad2: name box "HeronB" → Save name', wp, `new words: ${r.nw} ; known refusal: ${r.kw} ; Heron now: ${st}`, r.kw === wp && /cs=Heron archived=true/.test(st) ? 'PASS' : 'FAIL', 'a3-04-save-name.png')
  // A4 Prowler's own work: Ranger (Ace has no sign-in, so he has no role box)
  await H.openRowBy(w, 'Ranger', pid.Ranger)
  const ro0 = await p.locator('#accEdRole').evaluate(s => s.options[s.selectedIndex]?.text).catch(() => '(none)')
  r = await door('r1', 'a4-01-ranger-admin', async () => { await H.selRole(p, '^admin|admin$'); await p.locator('#accEdSave').click() })
  await H.openRowBy(w, 'Ranger', pid.Ranger)
  const ro1 = await p.locator('#accEdRole').evaluate(s => s.options[s.selectedIndex]?.text).catch(() => '(none)')
  r2 = await door('r2', 'a4-02-ranger-member', async () => { await H.selRole(p, '^member|member$'); await p.locator('#accEdSave').click() })
  await H.openRowBy(w, 'Ranger', pid.Ranger)
  const ro2 = await p.locator('#accEdRole').evaluate(s => s.options[s.selectedIndex]?.text).catch(() => '(none)')
  row('W2-A4', 'desktop', "ad2 (142's plain admin): 142's Ranger role → Admin → Save, then → Member → Save (Ace has no sign-in, so Ranger stands for 'a 142 man')", 'both work', `role before: ${ro0} ; after first save: ${ro1} (words: ${r.nw}) ; after second: ${ro2} (words: ${r2.nw})`, /admin/i.test(ro1) && /member/i.test(ro2) ? 'PASS' : 'FAIL', 'a4-01, a4-02')
  await p.locator('#accEdCancel').click().catch(() => {})
})
await step('B', async () => {
  await H.openRowBy(w, 'Saber', pid.Saber)
  const w0 = await H.rowWords(p, pid.Saber), s0 = await H.pstate(p, pid.Saber)
  const ex = 'Only a master admin can do that'
  const kw = t => (t.match(/Only a master admin[^.]*\.?|[A-Za-z0-9]+ is a master admin[^.]*/) || [''])[0]
  const doors = [
    ['sign-in', async () => { await p.locator('#accEdName').fill('adx'); await p.locator('#accEdSave').click() }],
    ['role → Member', async () => { await H.selRole(p, '^member|member$'); await p.locator('#accEdSave').click() }],
    ['Suspend', async () => { await p.locator('#accEdOnOff').click() }],
    ['Archive', async () => { await p.locator('#accEdArchive').click() }],
  ]
  let i = 0
  for (const [nm, fn] of doors) {
    i++
    await H.openRowBy(w, 'Saber', pid.Saber)
    const r = await door(nm, `b-0${i}-${nm.replace(/\W+/g, '-')}`, fn)
    row('W2-B', 'desktop', `ad2: Saber → ${nm}`, ex, `new words: ${r.nw} ; refusal: ${kw(r.after)}`, /Only a master admin can do that/.test(r.after) ? 'PASS' : 'FAIL', `b-0${i}-${nm.replace(/\W+/g, '-')}.png`)
  }
  await H.openRowBy(w, 'Saber', pid.Saber)
  let r = await door('del1', 'b-05-delete-first', async () => { await p.locator('#accEdDel').click() })
  let r2b = await door('del2', 'b-06-delete-second', async () => { await p.locator('#accEdDel').click({ timeout: 3000 }) })
  const dx = "Saber is a master admin, so he can't be deleted"
  row('W2-B', 'desktop', 'ad2: Saber → Delete (twice)', dx, `first: ${r.nw} ; second: ${r2b.nw}`, (r.after + r2b.after).includes(dx) ? 'PASS' : 'FAIL', 'b-05, b-06')
  await p.locator('#accEdCancel').click().catch(() => {}); await sleep(600)
  await H.openRowBy(w, 'Saber', pid.Saber)
  const w1 = await H.rowWords(p, pid.Saber), s1 = await H.pstate(p, pid.Saber), inp = await p.locator('#accEdName').inputValue().catch(() => '(none)')
  row('W2-B', 'desktop', 'Saber unchanged', 'nothing changed', `row before: ${w0} after: ${w1} ; PEOPLE ${s0} -> ${s1} ; sign-in box: ${inp}`, w0 === w1 && inp === 'ad' ? 'PASS' : 'FAIL', '')
  await p.locator('#accEdCancel').click().catch(() => {})
  // Quals (the table is read-only until Edit is pressed)
  await X.L.go(p, 'quals'); await sleep(1500)
  await p.getByRole('button', { name: /^.?\s*Edit$/ }).first().click(); await sleep(900)
  await X.pic(w, 'b-07-quals-edit')
  const csBox = p.locator('input[aria-label="Callsign/Name for Saber"]').first()
  if (!(await csBox.count())) row('W2-B', 'desktop', 'Quals: Saber callsign → SaberX', 'refused', 'no callsign box for Saber', 'OWED', 'b-07-quals-edit.png')
  else {
    await csBox.scrollIntoViewIfNeeded()
    const bq = await U.bodyText(p)
    await csBox.fill('SaberX'); await csBox.press('Tab'); await sleep(1200)
    await X.pic(w, 'b-08-quals-callsign')
    const aq = await U.bodyText(p)
    const now = await H.pstate(p, pid.Saber)
    const boxNow = await p.locator('input[aria-label^="Callsign/Name for Saber"]').first().inputValue().catch(() => '(box gone)')
    row('W2-B', 'desktop', 'Quals (142): Saber callsign → "SaberX", leave the box', 'refused (RECORD words)', `new words: ${H.newWords(bq, aq).slice(0, 300)} ; PEOPLE: ${now} ; box now: ${boxNow}`, 'RECORD', 'b-08-quals-callsign.png')
    const back = p.locator('input[aria-label^="Callsign/Name for"]').filter({ hasNot: p.locator('x') })
    const sx = p.locator('input[aria-label="Callsign/Name for SaberX"]').first()
    if (await sx.count()) { await sx.fill('Saber'); await sx.press('Tab'); await sleep(800) }
  }
  const catSel = p.locator('select[aria-label="CAT for Saber"]').first()
  if (!(await catSel.count())) row('W2-B', 'desktop', "Quals: Saber's CAT", 'saves', 'no CAT select for Saber', 'OWED', 'b-07-quals-edit.png')
  else {
    const opts = await catSel.evaluate(s => [...s.options].map(o => o.text))
    const was = await catSel.evaluate(s => s.selectedIndex)
    const newIdx = was === 0 ? 1 : 0
    const before = await U.bodyText(p)
    await catSel.selectOption({ index: newIdx }); await sleep(1000)
    await X.pic(w, 'b-09-quals-cat-changed')
    const nowVal = await catSel.evaluate(s => s.options[s.selectedIndex].text)
    const aft = await U.bodyText(p)
    await p.locator('#undoBtn').first().click({ timeout: 3000 }).catch(e => say('undo refused', e.message.slice(0, 60))); await sleep(1000)
    await X.pic(w, 'b-10-after-undo')
    const backVal = await p.locator('select[aria-label="CAT for Saber"]').first().evaluate(s => s.options[s.selectedIndex].text).catch(() => '(gone)')
    row('W2-B', 'desktop', "Quals: Saber's CAT " + opts[was] + " → " + opts[newIdx] + ", then top bar Undo", 'saves (allowed), Undo puts it back', `after change: ${nowVal} (new words: ${H.newWords(before, aft).slice(0, 200)}) ; after Undo: ${backVal}`, nowVal === opts[newIdx] && backVal === opts[was] ? 'PASS' : 'RECORD', 'b-09, b-10')
  }
  // Leave War
  await X.L.go(p, 'leavewar'); await sleep(2500)
  const sd = iso(T, 2)
  const so = await H.postOutSheet(w, pid.Saber, sd, 'Delete')
  await X.pic(w, 'b-11-leavewar-postout-delete')
  row('W2-B', 'desktop', `Leave War (142): Saber's cell ${sd} → ⋯ → Post out → Delete chip`, dx + ' on the sheet, nothing saved', so.ok ? so.text.slice(0, 500) : so.text, so.ok && so.text.includes(dx) ? 'PASS' : 'FAIL', 'b-11-leavewar-postout-delete.png')
  await p.locator('button:visible', { hasText: '✕' }).last().click().catch(() => p.keyboard.press('Escape')); await sleep(700)
  await X.pic(w, 'b-12-sheet-closed')
  say('B Saber after', await H.pstate(p, pid.Saber))
  // ad9 → Saber Suspend
  await H.swap(w, 'ad9')
  const op = await H.openRowBy(w, 'Saber', pid.Saber)
  await X.pic(w, 'b-13-ad9-saber-row')
  if (!op) row('W2-B', 'desktop', 'ad9: Users → Saber', 'RECORD', 'Saber is not on 149 admin\'s Users list', 'RECORD', 'b-13-ad9-saber-row.png')
  else {
    const r = await door('sus9', 'b-14-ad9-saber-suspend', async () => { await p.locator('#accEdOnOff').click() })
    row('W2-B', 'desktop', 'ad9 (149): Saber (142, master) → Suspend', 'RECORD the words', `new words: ${r.nw} ; known: ${r.kw}`, 'RECORD', 'b-14-ad9-saber-suspend.png')
  }
})

await step('C', async () => {
  const G149 = 'W2 149 LINE', G142 = 'W2 142 LINE'
  await H.swap(w, 'ad9')
  await X.L.go(p, 'editsched'); await sleep(2000)
  const r9 = await H.addGround(w, G149, 'Kestrel', 2)
  await X.L.go(p, 'editsched'); await sleep(2000)
  await X.pic(w, 'c-01-ad9-added')
  say('C 149 add', JSON.stringify(r9), (await U.groundNames(p, 2)).join('|'))
  await H.swap(w, 'ad2')
  await X.L.go(p, 'editsched'); await sleep(2000)
  const r2c = await H.addGround(w, G142, 'Hunter', 2)
  await X.L.go(p, 'editsched'); await sleep(2000)
  await X.pic(w, 'c-02-ad2-added')
  say('C 142 add', JSON.stringify(r2c), (await U.groundNames(p, 2)).join('|'))
  const e0 = await H.elog(p)
  say('C elog before', JSON.stringify(e0))
  await H.usersPage(w)
  // Admin -> Data
  await p.getByRole('button', { name: /^Data/ }).first().click(); await sleep(900)
  await X.pic(w, 'c-03-admin-data')
  const sels = p.locator('select:visible')
  const nsel = await sels.count()
  const periodOpts = await sels.nth(nsel - 1).evaluate(s => [...s.options].map(o => o.value + '=' + o.text))
  say('C period options (edit history)', JSON.stringify(periodOpts))
  const allOpt = periodOpts.find(o => /all|everything|whole/i.test(o))
  if (allOpt) await sels.nth(nsel - 1).selectOption(allOpt.split('=')[0]); else {
    await X.pic(w, 'c-04a-before-pick')
    await p.locator('#accDataHistDate, button:visible:has-text("Pick a date"), [role=button]:visible:has-text("Pick a date"), :text-is("Pick a date")').last().click(); await sleep(700)
    await p.locator(`[data-testid="dcal-day-${iso(T, 1)}"]`).click().catch(e => say('cal press failed', e.message.slice(0, 80))); await sleep(700)
  }
  await X.pic(w, 'c-04-period-chosen')
  const clr = p.getByRole('button', { name: /Clear edit history/ }).first()
  const logWords = ['period options: ' + periodOpts.join(' / ') + ' ; chose: ' + (allOpt || 'older than T+1')]
  if (!(await clr.isEnabled())) { row('W2-C', 'desktop', 'ad2: Admin → Data → Clear edit history…', 'offered', 'button disabled after choosing period', 'OWED', 'c-04-period-chosen.png'); return }
  await clr.click(); await sleep(900)
  await X.pic(w, 'c-05-clear-step1')
  for (let s = 1; s <= 4; s++) {
    const vis = await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetWidth > 1).map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40)).filter(Boolean).join(' | '))
    const bt = await U.bodyText(p)
    const seen = (bt.match(/.{0,120}(Permanently|permanently|can.t be undone|Clear [a-z]+|removed)[^.]{0,200}/g) || []).slice(0, 3).join(' // ')
    logWords.push(`step${s}: ${seen} ; buttons: ${vis.slice(0, 400)}`)
    say('C clear step', s, seen.slice(0, 400), '||', vis.slice(0, 400))
    const go = p.locator('button:visible', { hasText: /^(Tap again to clear|Clear everything|Clear all|Yes, clear|Clear it|Confirm|Yes)/ }).filter({ hasNotText: /Clear edit history|Clear old clutter/ }).last()
    if (!(await go.count())) break
    await go.click({ timeout: 3000 }).catch(() => {}); await sleep(1200)
    await X.pic(w, 'c-06-clear-step' + (s + 1))
  }
  const e1 = await H.elog(p)
  say('C elog after', JSON.stringify(e1))
  const is149 = l => /u=u149|who=(Kestrel|Osprey|Merlin|Harrier|Condor|Falcon|Heron|Raven|Shrike|Gannet|J2)/.test(l)
  const n149b = e0.filter(is149).length, n149a = e1.filter(is149).length, n142b = e0.length - n149b, n142a = e1.length - n149a
  row('W2-C', 'desktop', 'ad2: Admin → Data → Clear edit history… all it offers', "142's lines gone; every 149 line still there", `steps: ${logWords.join(' ### ').slice(0, 1100)} ; lines before: ${JSON.stringify(e0).slice(0, 700)} ; after: ${JSON.stringify(e1).slice(0, 700)} ; 149 lines before ${n149b} after ${n149a} ; 142 lines before ${n142b} after ${n142a}`, n149a === n149b && n149a > 0 && n142a === 0 ? 'PASS' : 'FAIL', 'c-05, c-06')
  await H.swap(w, 'ad9')
  await X.L.go(p, 'editsched'); await sleep(2000)
  await p.locator('#histBtn').click(); await sleep(1000)
  await p.locator('.chgwin').getByText('All changes').first().click().catch(() => {}); await sleep(900)
  const hwords = await p.evaluate(() => (document.querySelector('.chgwin')?.textContent || '').replace(/\s+/g, ' ').trim())
  await X.pic(w, 'c-06-ad9-allchanges-wed15')
  row('W2-C', 'desktop', 'ad9: Edit Schedule (week of Wed 15 Jul) → clock → All changes', '"W2 149 LINE" still listed', hwords.slice(0, 600), /W2 149 LINE/.test(hwords) ? 'PASS' : 'FAIL', 'c-06-ad9-allchanges-wed15.png')
  await p.keyboard.press('Escape'); await sleep(400)
})

await step('D', async () => {
  await H.swap(w, 'ad9')
  await H.usersPage(w)
  const T3 = iso(T, 3)
  async function addPerson(cs, ini, signin) {
    await H.usersPage(w)
    await p.locator('#accAddCs').fill(cs); await p.locator('#accAddIni').fill(ini)
    await p.locator('#accAddSeat').selectOption({ label: 'Pilot' })
    await p.locator('#accAddCat').selectOption({ index: 1 })
    if (signin) await p.locator('#accAddName').fill(signin)
    await p.locator('#accAddPostIn').click(); await sleep(700)
    await p.locator(`[data-testid="dcal-day-${T3}"]`).click(); await sleep(700)
    const pi = (await p.locator('#accAddPostIn').textContent()).trim()
    const lab = (await p.locator('#accAdd').textContent()).trim()
    const before = await U.bodyText(p)
    await X.pic(w, 'd-' + cs + '-1-filled')
    await p.locator('#accAdd').click(); await sleep(1500)
    await X.pic(w, 'd-' + cs + '-2-added')
    const after = await U.bodyText(p)
    return { pi, lab, nw: H.newWords(before, after), after }
  }
  const a = await addPerson('J2New', 'JN', 'j2new')
  row('W2-D', 'desktop', 'ad9: Add a person J2New, JN, Pilot, a CAT, post in T+3 (calendar), sign-in j2new', 'added', `button read "${a.lab}" ; post-in box ${a.pi} ; new words: ${a.nw}`, /J2New/.test(a.after) ? 'RECORD' : 'FAIL', 'd-J2New-1, d-J2New-2')
  const b = await addPerson('J2Bare', 'JB', '')
  row('W2-D', 'desktop', 'ad9: Add a person J2Bare, no sign-in', 'added', `button read "${b.lab}" ; post-in box ${b.pi} ; new words: ${b.nw}`, /J2Bare/.test(b.after) ? 'RECORD' : 'FAIL', 'd-J2Bare-1, d-J2Bare-2')
  pid.J2New = await U.pidOf(p, 'J2New'); pid.J2Bare = await U.pidOf(p, 'J2Bare')
  say('D pids', pid.J2New, pid.J2Bare)
  await H.openRowBy(w, 'J2Bare', pid.J2Bare)
  await X.pic(w, 'd-J2Bare-3-row-open')
  const r = await door('give', 'd-J2Bare-4-give', async () => { await p.locator('#accGiveName').fill('j2bare'); await p.locator('#accGive').click() })
  await H.openRowBy(w, 'J2Bare', pid.J2Bare)
  row('W2-D', 'desktop', "ad9: J2Bare's row → sign-in box j2bare → Give sign-in", 'sign-in given', `new words: ${r.nw} ; his row now: ${await H.rowWords(p, pid.J2Bare)}`, 'RECORD', 'd-J2Bare-4-give.png')
  await p.locator('#accEdCancel').click().catch(() => {})
  await X.L.go(p, 'quals'); await sleep(1500)
  await X.pic(w, 'd-quals149')
  const qt = await U.bodyText(p)
  row('W2-D', 'desktop', 'ad9: Quals (149)', 'both listed', `J2New: ${/J2New/.test(qt)} J2Bare: ${/J2Bare/.test(qt)}`, /J2New/.test(qt) && /J2Bare/.test(qt) ? 'PASS' : 'FAIL', 'd-quals149.png')
  const days = []; for (let n = -4; n <= 6; n++) days.push(iso(T, n))
  const warRows = async tag => {
    await X.L.go(p, 'leavewar'); await sleep(2500)
    for (const cs of ['J2New', 'J2Bare']) {
      const c = p.locator(`[data-testid="cell-${pid[cs]}-${T3}"]`).first(); if (await c.count()) await c.scrollIntoViewIfNeeded().catch(() => {})
      const rr = await H.Hm.lwRow(p, pid[cs], days)
      await X.pic(w, `d-war-${tag}-${cs}`)
      say('D war', tag, cs, JSON.stringify(Object.entries(rr).map(([d, v]) => d.slice(5) + '=' + v.slice(0, 40))))
      row('W2-D', 'desktop', `ad9: Leave War (149) ${tag}: ${cs}'s row T-4..T+6`, `starts at T+3 (${T3}); nothing before`, Object.entries(rr).map(([d, v]) => d.slice(5) + '=' + v.slice(0, 35)).join(' ; '), 'RECORD', `d-war-${tag}-${cs}.png`)
    }
  }
  await warRows('first')
  await p.reload(); await sleep(1500)
  await X.login(p, 'ad9').catch(async () => { await sleep(1000) })
  await warRows('after-reload')
  await H.swap(w, 'j2new')
  await X.L.go(p, 'leavewar'); await sleep(2500)
  await X.pic(w, 'd-j2new-leavewar')
  const lt = await U.bodyText(p)
  row('W2-D', 'desktop', 'sign in as j2new (any password): Leave War', "149's names, not 142's", `Kestrel ${/Kestrel/.test(lt)} Osprey ${/Osprey/.test(lt)} Saber ${/Saber/.test(lt)} Ranger ${/Ranger/.test(lt)} ; first 300: ${lt.slice(0, 300)}`, 'RECORD', 'd-j2new-leavewar.png')
  await X.L.go(p, 'editsched'); await sleep(1500)
  await X.pic(w, 'd-j2new-week')
  await H.swap(w, 'ad9')
  const d = await addPerson('J2Dup', 'JD', 'US9')
  await H.usersPage(w); await p.locator(H.FIND).fill('J2Dup'); await sleep(800)
  await X.pic(w, 'd-J2Dup-3-search')
  const left = await p.locator('.acc-row').count()
  row('W2-D', 'desktop', 'ad9: Add a person J2Dup with sign-in "US9"', 'refused with words; no J2Dup left (Users search: none)', `new words: ${d.nw} ; known: ${H.known(d.after)} ; J2Dup rows on Users after search: ${left} ; PEOPLE has J2Dup: ${await U.pidOf(p, 'J2Dup')}`, left === 0 && !(await U.pidOf(p, 'J2Dup')) && /sign-in|taken|already|use/i.test(d.nw) ? 'PASS' : 'FAIL', 'd-J2Dup-2-added.png, d-J2Dup-3-search.png')
  for (const u of ['ad', 'ad2', 'us', 'ad9', 'us9']) {
    try { await H.swap(w, u); await X.pic(w, 'd-signin-' + u); row('W2-D', 'desktop', 'sign in as ' + u, 'works', 'signed in; week visible', 'RECORD', 'd-signin-' + u + '.png') } catch (e) { row('W2-D', 'desktop', 'sign in as ' + u, 'works', 'failed: ' + e.message.slice(0, 100), 'FAIL', '') }
  }
})

await step('E', async () => {
  const lock = "Kestrel is 149's last admin. Make another admin of 149 first."
  await H.swap(w, 'ad')
  await H.openRowBy(w, 'Kestrel', pid.Kestrel)
  const k0 = await H.rowWords(p, pid.Kestrel), s0 = await H.pstate(p, pid.Kestrel)
  await X.pic(w, 'e-00-kestrel-row')
  const E = async (nm, pic, fn) => { await H.openRowBy(w, 'Kestrel', pid.Kestrel); const r = await door(nm, pic, fn); row('W2-E', 'desktop', 'ad: Kestrel → ' + nm, lock, `new words: ${r.nw} ; known: ${r.kw}`, r.after.includes(lock) ? 'PASS' : 'FAIL', pic + '.png'); return r }
  await E('Suspend', 'e-01-suspend', async () => { await p.locator('#accEdOnOff').click() })
  await E('role → Member → Save', 'e-02-role-member', async () => { await H.selRole(p, '^member|member$'); await p.locator('#accEdSave').click() })
  await E('Archive', 'e-03-archive', async () => { await p.locator('#accEdArchive').click() })
  await H.openRowBy(w, 'Kestrel', pid.Kestrel)
  const a = await door('d1', 'e-04-delete-first', async () => { await p.locator('#accEdDel').click() })
  const b = await door('d2', 'e-05-delete-second', async () => { await p.locator('#accEdDel').click({ timeout: 3000 }) })
  row('W2-E', 'desktop', 'ad: Kestrel → Delete (twice)', lock, `first: ${a.nw} ; second: ${b.nw}`, (a.after + b.after).includes(lock) ? 'PASS' : 'FAIL', 'e-04, e-05')
  await p.locator('#accEdCancel').click().catch(() => {}); await sleep(600)
  await H.openRowBy(w, 'Kestrel', pid.Kestrel)
  const k1 = await H.rowWords(p, pid.Kestrel), s1 = await H.pstate(p, pid.Kestrel)
  row('W2-E', 'desktop', 'Kestrel unchanged', 'unchanged', `row before: ${k0} after: ${k1} ; PEOPLE ${s0} -> ${s1}`, k0 === k1 ? 'PASS' : 'FAIL', '')
  await p.locator('#accEdCancel').click().catch(() => {})
  await H.swap(w, 'ad9')
  await X.L.go(p, 'leavewar'); await sleep(2500)
  const so = await H.postOutSheet(w, pid.Kestrel, T, 'Overseas Sqn')
  await X.pic(w, 'e-06-sheet')
  const words = "Kestrel is 149's last admin. The posting waits until 149 has another admin."
  row('W2-E', 'desktop', "ad9: Leave War (149) Kestrel's cell T → ⋯ → Post out → Overseas Sqn", words, so.ok ? so.text.slice(0, 500) : so.text, so.ok && so.text.includes(words) ? 'PASS' : (so.ok ? 'FAIL' : 'OWED'), 'e-06-sheet.png')
  const btn = p.locator('button:visible', { hasText: /^Post out$/ }).last()
  const pressable = await btn.count() ? await btn.isEnabled() : false
  row('W2-E', 'desktop', 'is the sheet\'s Post out button pressable', 'RECORD', 'present+enabled: ' + pressable, 'RECORD', 'e-06-sheet.png')
  if (pressable) {
    const r = await door('po', 'e-07-after-post-out', async () => { await btn.click() })
    say('E after post out', r.nw)
    const lr = await listRow('Kestrel')
    await X.pic(w, 'e-08-kestrel-users-row')
    row('W2-E', 'desktop', 'ad9 pressed Post out; Kestrel after', 'stays active, not archived', `new words on press: ${r.nw} ; Users list row: ${lr} ; PEOPLE: ${await H.pstate(p, pid.Kestrel)}`, 'RECORD', 'e-07, e-08')
    await X.L.go(p, 'leavewar'); await sleep(2500)
    const days = []; for (let n = -2; n <= 5; n++) days.push(iso(T, n))
    const rr = await H.Hm.lwRow(p, pid.Kestrel, days)
    await p.locator(`[data-testid="cell-${pid.Kestrel}-${T}"]`).first().scrollIntoViewIfNeeded().catch(() => {})
    await X.pic(w, 'e-09-kestrel-war-row')
    row('W2-E', 'desktop', "Kestrel's war row after the posting", 'RECORD', Object.entries(rr).map(([d, v]) => d.slice(5) + '=' + v.slice(0, 35)).join(' ; '), 'RECORD', 'e-09-kestrel-war-row.png')
  }
  // second admin
  await H.openRowBy(w, 'J2New', pid.J2New)
  const rr = await door('j2 admin', 'e-10-j2new-admin', async () => { await H.selRole(p, 'admin'); await p.locator('#accEdSave').click() })
  await sleep(1500)
  const suspNow = await p.getByText('Your access is suspended').first().isVisible().catch(() => false)
  await X.pic(w, 'e-10c-right-after-save')
  const t10 = await U.bodyText(p)
  row('W2-E', 'desktop', 'ad9 (still signed in, Kestrel): J2New → role Admin → Save (149 now has a second admin who can sign in)', 'saved; RECORD what happens to Kestrel and his open page', `suspended card shown at once, no reload: ${suspNow} ; screen reads: ${t10.slice(0, 250)}`, 'RECORD', 'e-10-j2new-admin.png, e-10c-right-after-save.png')
  await p.reload(); await sleep(1500)
  await p.waitForSelector('#luser', { timeout: 15000 })
  await p.fill('#luser', 'ad9'); await p.fill('#lpass', 'a9'); await p.click('#loginForm button[type=submit]'); await sleep(2500)
  const susp = await p.getByText('Your access is suspended').first().isVisible().catch(() => false)
  await X.pic(w, 'e-10b-after-reload-signin-ad9')
  row('W2-E', 'desktop', 'reload, sign in as ad9 (Kestrel)', 'RECORD', `suspended card: ${susp} ; screen reads: ${(await U.bodyText(p)).slice(0, 200)}`, 'RECORD', 'e-10b-after-reload-signin-ad9.png')
  if (susp) { await p.getByRole('button', { name: /Sign out/ }).first().click(); await p.waitForSelector('#luser', { timeout: 15000 }) }
  await X.login(p, 'j2new')
  say('E signed in as j2new')
  const kw1 = await listRow('Kestrel')
  await X.pic(w, 'e-11-j2new-kestrel-list')
  const ks = await H.pstate(p, pid.Kestrel)
  const archivedOpen = await p.getByRole('button', { name: /Archived/ }).first().textContent().catch(() => '(no fold)')
  await X.L.go(p, 'leavewar'); await sleep(2500)
  const days = []; for (let n = -1; n <= 4; n++) days.push(iso(T, n))
  const rr2 = await H.Hm.lwRow(p, pid.Kestrel, days)
  await p.locator(`[data-testid="cell-${pid.Kestrel}-${T}"]`).first().scrollIntoViewIfNeeded().catch(() => {})
  await X.pic(w, 'e-12-j2new-kestrel-war')
  row('W2-E', 'desktop', "signed in as j2new (149's new admin): Kestrel's posting", 'RECORD', `Users list row (search Kestrel): ${kw1} ; archived fold button: ${archivedOpen} ; PEOPLE: ${ks} ; war row: ${Object.entries(rr2).map(([d, v]) => d.slice(5) + '=' + v.slice(0, 35)).join(' ; ')}`, 'RECORD', 'e-11, e-12')
  await H.swap(w, 'ad2')
  await H.usersPage(w); await p.locator(H.FIND).fill('Kestrel'); await sleep(800)
  await X.pic(w, 'e-13a-ad2-kestrel-search')
  const lr2 = await H.rowWords(p, pid.Kestrel)
  const fold = p.getByRole('button', { name: /Archived/ }).first()
  if (await fold.count()) { await fold.click(); await sleep(700) }
  await X.pic(w, 'e-13b-ad2-archived-fold')
  row('W2-E', 'desktop', "ad2 (142 admin): Admin → Users → search Kestrel (then the Archived fold)", 'RECORD', `active list row: ${lr2} ; after fold: ${await H.rowWords(p, pid.Kestrel)} ; PEOPLE: ${await H.pstate(p, pid.Kestrel)}`, 'RECORD', 'e-13a, e-13b')
  // 149's admin can still open Kestrel as j2new? a master sees him:
  await H.swap(w, 'ad')
  await H.usersPage(w); await p.locator(H.FIND).fill('Kestrel'); await sleep(800)
  await X.pic(w, 'e-14-master-kestrel')
  row('W2-E', 'desktop', 'master (ad): Users → search Kestrel', 'RECORD', `row: ${await H.rowWords(p, pid.Kestrel)}`, 'RECORD', 'e-14-master-kestrel.png')
})
await X.fin(w)
