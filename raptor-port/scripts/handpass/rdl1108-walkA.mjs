// [RD-LEFT-1108] Walker A, part 2 — Astra's S12, S13, S14, S16, S18, S20, S23, S24 and the plain-user round, on `main`'s
// build and the branch's, the same presses in the same order, every value each screen showed written down and the two
// builds' records compared step by step. A picture right after the presses that matter (the phone's first).
// Usage, from raptor-port/:  node scripts/handpass/rdl1108-walkA.mjs <before dist> <after dist> <out folder> [only parts, e.g. s12,s18]
import { chromium, webkit, LAUNCH, world, fixtures, request, adminCat, tab, press, pressText, openRow, rowOf, phoneOf, V, firstLine, signIn, logout, addPerson, note } from './rdl1108-a-lib.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
console.log('[rdl1108-walkA v1]')
const [before, after, out, onlyArg = ''] = process.argv.slice(2)
const ONLY = onlyArg.split(',').filter(Boolean), run = part => !ONLY.length || ONLY.includes(part)
mkdirSync(out, { recursive: true })
const R = {}            // R[size][step][build] = value
const pics = []
const errsAll = {}

/* what the open editors on the page say: each field's value, each button, the armed note */
const editors = p => p.evaluate(() => [...document.querySelectorAll('.acc-edit')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({
  who: e.dataset.editing || e.dataset.restoring || e.dataset.approving || '',
  fields: [...e.querySelectorAll('input,select')].map(i => (i.id || i.tagName) + '=' + (i.tagName === 'SELECT' ? i.selectedOptions[0]?.textContent : i.value)),
  btns: [...e.querySelectorAll('button')].filter(b => b.getBoundingClientRect().height > 0).map(b => b.textContent.trim() + (b.disabled ? '(off)' : '') + (b.classList.contains('del-armed') ? '(ARMED)' : '')),
  notes: [...e.querySelectorAll('.adm-note,.od-err')].map(n => n.textContent.trim().slice(0, 90)),
})))
const active = p => p.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.tagName.toLowerCase() + (a.className ? '.' + String(a.className).split(' ')[0] : '')) : 'none' })
const undoOf = p => p.evaluate(() => { const g = l => { const b = document.querySelector(`button[aria-label="${l}"]`); return b ? (b.disabled ? 'off' : 'on') + ':' + b.title : 'none' }; return g('Undo') + ' / ' + g('Redo') })
const list = p => p.evaluate(() => [...document.querySelectorAll('#accList .acc-row[data-person], #accArchList .acc-row[data-person]')].filter(r => r.getBoundingClientRect().height > 0 && /^RD/.test(r.querySelector('.acc-name')?.textContent || '')).map(r => (r.dataset.archived ? 'ARCH ' : '') + (r.querySelector('.acc-name')?.textContent || '') + ' | ' + (r.querySelector('.acc-sub')?.textContent || '').replace(/\s+/g, ' ') + ' | ' + [...r.querySelectorAll('.od-c')].map(d => d.getAttribute('title')).join(',')))

async function body(w, size, tag, rec) {
  const p = w.p, phone = size === 'phone'
  let n = 0
  const put = (step, v) => { ((R[size] ||= {})[step] ||= {})[tag] = JSON.stringify(v) }
  const snap = async name => { const f = path.join(out, `${tag}-${size}-${name}.png`); await p.screenshot({ path: f }); pics.push(f) }
  const tap = async (sel, nth = 0) => press(p, sel, nth)
  const fill = async (sel, v) => { const l = p.locator(V(sel)).first(); await l.scrollIntoViewIfNeeded(); await l.fill(v); await p.clock.runFor(250) }
  const find = async v => { await p.evaluate(() => scrollTo(0, 0)); await p.locator(V('#accFind')).first().fill(v); await p.clock.runFor(400) }
  const cancelAny = async () => { for (const s of ['#accEdCancel', '#accArCancel', '#apvCancel']) if (await p.locator(V(s)).count()) { await press(p, s) } }
  const safe = async (name, fn) => { try { await fn() } catch (e) { put(name + '!NOT-WALKED', firstLine(e)); console.log(`  ${tag} ${size} ${name}: ${firstLine(e)}`) } }
  const nameBox = '#accEdName, #accGiveName'

  await fixtures(p); await request(p); await adminCat(p, 'Users')
  put('fixtures', await list(p).catch(() => []))

  /* ---------------- S12 — the roster editor, every row kind, closed every way */
  if (run('s12')) for (const cs of ['RDACTIVE', 'RDWSO', 'RDGROUND', 'RDNOSIGN', 'RDSUSP', 'RDADMIN2']) await safe(`s12-${cs}`, async () => {
    await find('RD')
    await openRow(p, cs); put(`s12 ${cs} opened`, await editors(p)); if (cs === 'RDACTIVE') await snap('s12-RDACTIVE-open')
    await fill(nameBox, 'unsaved@example.test'); await p.locator(V('#accEdRole, #accGiveRole')).first().selectOption('admin')
    if (await p.locator(V('#accEdDel')).count()) await tap('#accEdDel')
    put(`s12 ${cs} typed+armed`, await editors(p)); if (cs === 'RDACTIVE') await snap('s12-RDACTIVE-typed')
    await tap('#accEdCancel'); put(`s12 ${cs} closed by Cancel`, await editors(p))
    await openRow(p, cs); put(`s12 ${cs} reopen after Cancel`, await editors(p))
    await fill(nameBox, 'again@example.test'); if (await p.locator(V('#accEdDel')).count()) await tap('#accEdDel')
    await openRow(p, cs); put(`s12 ${cs} same-row tap closes`, await editors(p))
    await openRow(p, cs); put(`s12 ${cs} reopen after row tap`, await editors(p))
    await fill(nameBox, 'third@example.test')
    const other = cs === 'RDWSO' ? 'RDGROUND' : 'RDWSO'
    await openRow(p, other); put(`s12 ${cs} other row opened`, await editors(p))
    await openRow(p, cs); put(`s12 ${cs} back after other row`, await editors(p))
    await tap('#accEdCancel')
  })
  if (run('s12')) await safe('s12-own', async () => { await find('Saber'); const r = rowOf(p, 'Saber'); put('s12 own row: tap', await (async () => { await r.locator('.acc-main').click({ force: true, timeout: 1500 }).catch(() => {}); await p.clock.runFor(400); return { editors: (await editors(p)).length, disabled: await r.locator('.acc-main').isDisabled() } })()) })
  if (run('s12')) await safe('s12-torch', async () => { await find('Torch'); await openRow(p, 'Torch'); put('s12 Torch (posted out) opened', await editors(p)); await snap('s12-Torch-open'); await cancelAny() })

  /* ---------------- S16 — refusals, no-ops, the dangerous action's order */
  if (run('s16')) await safe('s16', async () => {
    await find('RD'); await openRow(p, 'RDNOSIGN')
    await tap('#accGive'); put('s16 give with blank', { note: await note(p), editors: await editors(p) })
    await fill('#accGiveName', 'rdwso@example.test'); await tap('#accGive'); put('s16 give duplicate', { note: await note(p), editors: await editors(p) }); await snap('s16-duplicate')
    await p.locator(V('#accFind')).first().focus(); await p.clock.runFor(300)           // tap away
    const b = p.locator(V('#accGiveName')).first(); await b.focus(); await fill('#accGiveName', 'rdwso@example.test'); await tap('#accGive'); put('s16 same duplicate typed again', { note: await note(p), active: await active(p) })
    await fill('#accGiveName', 'rdnosign@example.test'); const u0 = await undoOf(p); await tap('#accGive'); put('s16 give valid', { note: await note(p), undoBefore: u0, undoAfter: await undoOf(p), list: await list(p) })
    await find('RD'); await openRow(p, 'RDNOSIGN'); const u1 = await undoOf(p); await tap('#accEdSave'); put('s16 save unchanged', { note: await note(p), undoBefore: u1, undoAfter: await undoOf(p) })
    await openRow(p, 'RDNOSIGN'); await tap('#accEdDel'); await p.locator(V('#accEdRole')).first().selectOption('admin'); await tap('#accEdSave'); put('s16 delete armed, edit, Save', await editors(p)); await cancelAny()
    await openRow(p, 'RDNOSIGN'); await tap('#accEdDel'); await tap('#accEdCancel'); await openRow(p, 'RDNOSIGN'); put('s16 delete armed, Cancel, reopen', await editors(p)); await tap('#accEdDel'); await openRow(p, 'RDWSO'); await openRow(p, 'RDNOSIGN'); put('s16 delete armed, other row, return', await editors(p)); await cancelAny()
  })

  /* ---------------- S13 — the archived editor */
  if (run('s13')) await safe('s13', async () => {
    for (const cs of ['RDARCH', 'RDARCHF', 'RDARCHN']) await safe('s13-' + cs, async () => {
      await find('RDARCH'); await openRow(p, cs, true); put(`s13 ${cs} opened`, await editors(p)); await snap(`s13-${cs}-open`)
      await fill('#accArCs', 'RDACTIVE'); put(`s13 ${cs} typed a taken name`, await editors(p))
      await tap('#accArRestore'); put(`s13 ${cs} Restore as a taken name: refusal`, { note: await note(p), editors: await editors(p) }); await snap(`s13-${cs}-refusal`)
      await p.locator(V('#accFind')).first().focus(); await fill('#accArCs', 'RDACTIVE'); put(`s13 ${cs} typed again`, await editors(p)); await tap('#accArRestore'); put(`s13 ${cs} refused again`, { note: await note(p), editors: await editors(p) })
      await tap('#accArDel'); put(`s13 ${cs} delete armed`, await editors(p))
      await tap('#accArCancel'); await openRow(p, cs, true); put(`s13 ${cs} reopen after Cancel`, await editors(p)); await tap('#accArCancel')
    })
    await find('RDARCH'); await openRow(p, 'RDARCHN', true); await fill('#accArCs', 'RDARCHN2'); await tap('#accArSave'); put('s13 RDARCHN Save name', { note: await note(p), list: await list(p) })
    await find('RDARCH'); await openRow(p, 'RDARCHF', true); const u = await undoOf(p); await tap('#accArRestore'); put('s13 RDARCHF Restore', { note: await note(p), list: await list(p), undo: [u, await undoOf(p)] })
    await find('RDARCH'); await openRow(p, 'RDARCH', true); put('s13 RDARCH (taken) before Restore as', await editors(p)); await fill('#accArCs', 'RDARCHB'); await tap('#accArRestore'); put('s13 RDARCH Restore as RDARCHB', { note: await note(p), list: await list(p) })
  })

  /* ---------------- S14 — hidden is not closed */
  if (run('s14')) await safe('s14', async () => {
    await find('RD'); await openRow(p, 'RDACTIVE'); await fill('#accEdName', 'hidden-draft@example.test'); await tap('#accEdDel'); put('s14 before hiding', await editors(p))
    if (phone) await tap('.adm-back'); await pressText(p, '.adm-cat', 'Data'); await pressText(p, '.adm-back, .adm-cat', phone ? 'Users' : 'Users').catch(() => {})
    if (phone && await p.locator(V('.adm-cat')).count()) await pressText(p, '.adm-cat', 'Users')
    put('s14 after another category and back', { editors: await editors(p), find: await p.locator(V('#accFind')).first().inputValue().catch(() => 'none') })
    await tab(p, 'quals'); await p.clock.runFor(800); await adminCat(p, 'Users'); put('s14 after leaving Admin and returning', { editors: await editors(p), find: await p.locator(V('#accFind')).first().inputValue().catch(() => 'none') })
    await p.clock.runFor(70000); put('s14 after idle (70 s)', { editors: await editors(p) })
    await find('RDACTIVE'); await openRow(p, 'RDACTIVE').catch(() => {}); await fill('#accEdName', 'search-draft@example.test').catch(() => {}); await find('zzzzzzz'); put('s14 search hides the row', { editors: await editors(p) }); await find('RDACTIVE'); put('s14 search shows it again', await editors(p))
    await cancelAny(); await find('RDARCH'); await openRow(p, 'RDARCHN2', true).catch(async () => { await openRow(p, 'RDARCHN', true) }); await fill('#accArCs', 'folded-draft'); await tap('#accArchToggle'); put('s14 Archived folded', { editors: await editors(p) }); await tap('#accArchToggle'); put('s14 Archived unfolded again', await editors(p)); await cancelAny()
  })

  /* ---------------- S17 — Give access, both ways */
  if (run('s17')) await safe('s17', async () => {
    await find(''); await p.evaluate(() => scrollTo(0, 0)); await tap('[data-approve]'); put('s17 give access opened', await editors(p)); await snap('s17-give-roster')
    await fill('#apvPid', '').catch(() => {}); await tap('#apvModeNew'); put('s17 New person', await editors(p)); await snap('s17-give-new')
    await fill('#apvCs', 'TYPED'); await tap('#apvModeRoster'); await tap('#apvModeNew'); put('s17 switched away and back', await editors(p))
    await tap('#apvCancel'); await tap('[data-approve]'); put('s17 reopened after Cancel', await editors(p)); await tap('#apvCancel')
  })

  /* ---------------- S18 — the clearing forms' labels and calendars */
  if (run('s18')) await safe('s18', async () => {
    await adminCat(p, 'Data')
    const forms = [['#admWipe', 'admWipe', 'Old clutter'], ['#admLog', 'admLog', 'Edit history']]
    for (const [, idp] of forms) {
      const f = p.locator(V('.adm-clear')).nth(idp === 'admWipe' ? 0 : 1)
      await f.locator('label', { hasText: 'Period' }).first().scrollIntoViewIfNeeded()
      await f.locator('label', { hasText: 'Period' }).first().click(); await p.clock.runFor(300)
      put(`s18 ${idp}: press on "Period"`, { keysOn: await active(p) }); await snap(`s18-${idp}-period`)
      await p.keyboard.press('ArrowDown'); await p.clock.runFor(200); put(`s18 ${idp}: Down key`, { mode: await p.locator(`#${idp}Mode`).inputValue(), active: await active(p) })
      await p.locator(`#${idp}Mode`).selectOption('range'); await p.clock.runFor(300)
      put(`s18 ${idp}: range shown`, await p.evaluate(i => { const g = document.getElementById(i + 'Run'); const lbl = g && g.parentElement.firstElementChild; const cs = lbl && getComputedStyle(lbl); return { role: g?.getAttribute('role'), labelledby: g?.getAttribute('aria-labelledby'), name: g?.getAttribute('aria-label'), head: lbl ? lbl.tagName.toLowerCase() + ':' + lbl.textContent : null, look: cs ? [cs.fontSize, cs.fontWeight, cs.letterSpacing, cs.textTransform, cs.color, cs.marginBottom].join(' ') : null } }, idp))
      put(`s18 ${idp}: a11y of the range`, await p.locator(`#${idp}Run`).ariaSnapshot().then(s => s.slice(0, 120)).catch(e => 'no snapshot: ' + firstLine(e)))
      const dh = f.locator('.mfield > label, .mfield > .mfield-lbl').first(); await dh.scrollIntoViewIfNeeded()
      await p.locator(`#${idp}Run [data-testid$="-day-2026-11-05"], #${idp}Run [data-iso="2026-11-05"]`).first().click().catch(() => {}); await p.clock.runFor(200)
      await p.locator(`#${idp}Run [data-iso="2026-11-07"]`).first().click().catch(() => {}); await p.clock.runFor(300)
      put(`s18 ${idp}: run 5–7 Nov picked`, await p.evaluate(i => ({ from: document.getElementById(i + 'Run')?.dataset.from, to: document.getElementById(i + 'Run')?.dataset.to, foot: document.querySelector(`#${i}Run .dcal-foot`)?.textContent, btn: document.getElementById(i)?.textContent, dis: document.getElementById(i)?.disabled }), idp))
      await snap(`s18-${idp}-range`)
      await tap(`#${idp}`); put(`s18 ${idp}: first press`, { btn: await p.locator(`#${idp}`).textContent(), note: await note(p) })
      await p.locator(`#${idp}Mode`).selectOption('on'); put(`s18 ${idp}: mode changed while armed`, { btn: await p.locator(`#${idp}`).textContent() })
      await p.locator(`#${idp}Mode`).selectOption('before')
      /* the date box's calendar, closed every way */
      for (const way of ['Escape', 'scrim', 'ring']) {
        await tap(`#${idp}Date`); const o1 = await p.locator('[data-testid="dcal-card"]').count()
        if (way === 'Escape') await p.keyboard.press('Escape'); else if (way === 'scrim') await p.locator('[data-testid="dcal-scrim"]').first().click({ position: { x: 4, y: 4 } }).catch(() => {}); else await p.mouse.click(4, 400)
        await p.clock.runFor(500); put(`s18 ${idp}: date calendar closed by ${way}`, { openBefore: o1, openAfter: await p.locator('[data-testid="dcal-card"]').count() })
        await p.keyboard.press('Escape'); await p.clock.runFor(300)
      }
    }
    await p.locator(V('#admWipeMode')).first().selectOption('range'); await p.locator(V('#admLogMode')).first().selectOption('range'); await p.clock.runFor(300)
    put('s18 both forms range', await p.evaluate(() => ['admWipeRun', 'admLogRun'].map(i => { const g = document.getElementById(i); return g && [g.getAttribute('aria-labelledby'), document.getElementById(g.getAttribute('aria-labelledby') || '')?.textContent].join('/') })))
    put('s18 labels for= of both Period', await p.evaluate(() => [...document.querySelectorAll('.adm-clear label')].map(l => l.textContent + '>' + (l.htmlFor || 'no-for'))))
    /* "Person": the heading over the approval's two choices */
    await adminCat(p, 'Users'); await p.evaluate(() => scrollTo(0, 0)); await tap('[data-approve]')
    put('s18 approval form headings', await p.evaluate(() => [...document.querySelectorAll('[data-approving] .mfield > label, [data-approving] .mfield > .mfield-lbl, [data-approving] .pchoice-lbl, [data-approving] .mfield-lbl')].map(l => { const c = getComputedStyle(l); return l.tagName.toLowerCase() + ':' + l.textContent + ':' + [c.fontSize, c.fontWeight, c.letterSpacing, c.textTransform, c.color].join(' ') })))
    put('s18 Person: press its word', await (async () => { const w = p.locator(V('[data-approving]')).first().getByText('Person', { exact: true }).first(); await w.click().catch(() => {}); await p.clock.runFor(300); return { keysOn: await active(p) } })())
    await cancelAny()
  })

  /* ---------------- S23 — every opener and its way out */
  if (run('s23')) await safe('s23', async () => {
    await tab(p, 'quals'); await p.clock.runFor(800); await tap('#qAddToggle'); await p.clock.runFor(900)
    put('s23 Quals + Add person lands', { page: await p.evaluate(() => document.querySelector('#page-admin')?.getBoundingClientRect().height > 0), cs: await p.locator(V('#accAddCs')).count(), keysOn: await active(p), scroll: await p.evaluate(() => Math.round(scrollY)) }); await snap('s23-quals-add-person')
    await fill('#accAddCs', 'RDKEEP'); await tab(p, 'help'); await adminCat(p, 'Users'); put('s23 draft kept after leaving', await p.locator(V('#accAddCs')).first().inputValue().catch(() => 'none'))
    await tab(p, 'help'); await p.locator(V('#notifyBell')).first().click().catch(() => {}); if (phone) {}; await p.clock.runFor(500)
    put('s23 bell list', await p.evaluate(() => [...document.querySelectorAll('[data-testid^="bell-line-"]')].map(l => l.textContent.replace(/\s+/g, ' ').trim().slice(0, 80))))
    await snap('s23-bell')
    const line = p.locator(V('[data-testid^="bell-line-"]')).filter({ hasText: /access|asked|request/i }).first()
    if (await line.count()) { await (phone ? line.tap() : line.click()); await p.clock.runFor(900); put('s23 bell access line lands', { admin: await p.evaluate(() => document.querySelector('#page-admin')?.getBoundingClientRect().height > 0), waiting: await p.locator(V('#admWaiting')).count(), bellOpen: await p.locator(V('[data-testid="bell-list"]')).count(), scroll: await p.evaluate(() => Math.round(scrollY)) }); await snap('s23-bell-landed') }
    else put('s23 bell access line', 'no line')
  })

  /* ---------------- S24 — measures: paired fields, the heading against the rows, overflow */
  if (run('s24')) await safe('s24', async () => {
    await adminCat(p, 'Users'); await p.evaluate(() => scrollTo(0, 0)); await tap('[data-approve]'); await tap('#apvModeNew')
    const meas = sel => p.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.getBoundingClientRect().height > 0).map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.left * 10) / 10, Math.round(r.top * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10].join(',') }), sel)
    put('s24 approval New person: paired boxes', { cols: await meas('[data-approving] .adm-2col'), mfields: await meas('[data-approving] .adm-2col .mfield'), labels: await meas('[data-approving] .adm-2col .mfield > label'), inputs: await meas('[data-approving] .adm-2col .mfield > input, [data-approving] .adm-2col .mfield > select, [data-approving] .adm-2col .mfield > .datebox') })
    await snap('s24-approval-new'); await cancelAny()
    put('s24 Add a person: paired boxes', { cols: await meas('#accAddBlock .adm-2col'), labels: await meas('#accAddBlock .mfield > label'), inputs: await meas('#accAddBlock .mfield > input, #accAddBlock .mfield > select, #accAddBlock .mfield > .datebox') })
    put('s24 list heading vs rows', { head: await meas('#accList .od-cols > *, #accList > :first-child *'), dots: await meas('#accList .acc-row .od-c').then(a => a.slice(0, 4)) })
    put('s24 overflow', await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })))
    await find('RD'); await openRow(p, 'RDACTIVE'); await tap('#accEdDel')
    put('s24 editor armed: boxes', { editor: await meas('.acc-edit'), btns: await meas('.acc-edit .abtn'), note: await meas('.acc-del-note') }); await snap('s24-armed'); await cancelAny()
  })

  /* ---------------- the plain-user round (the order's 7.0a) */
  if (run('plain')) await safe('plain', async () => {
    const seen = async () => { const out = {}; for (const [pg, key] of [['quals', 'Quals'], ['leavewar', 'Leave War'], ['editsched', 'Edit Schedule']]) { await tab(p, pg); await p.clock.runFor(1500); out[key] = await p.evaluate(() => { const t = document.body.innerText; return ['RDPLAIN', 'RDACTIVE', 'RDGROUND', 'RDREQUEST', 'RDREQ2'].filter(c => t.includes(c)).join(',') }) } ; return out }
    await adminCat(p, 'Users'); await addPerson(p, { cs: 'RDPLAIN', seat: 'FCP', cat: 'C' }); put('plain: added RDPLAIN', { note: await note(p), list: await list(p) })
    await find('RDPLAIN'); await openRow(p, 'RDPLAIN'); await fill('#accGiveName', 'rdplain@example.test'); await tap('#accGive'); put('plain: gave sign-in', { note: await note(p), list: await list(p) })
    await find('RDACTIVE'); await openRow(p, 'RDACTIVE'); await tap('#accEdOnOff'); put('plain: suspended RDACTIVE', { note: await note(p), list: await list(p) }); await snap('plain-suspended')
    await openRow(p, 'RDACTIVE'); await tap('#accEdOnOff'); put('plain: enabled RDACTIVE', { note: await note(p), list: await list(p) }); await snap('plain-enabled')
    await find('RDGROUND'); await openRow(p, 'RDGROUND'); await tap('#accEdArchive'); put('plain: archived RDGROUND', { note: await note(p), list: await list(p) })
    await openRow(p, 'RDGROUND', true); await tap('#accArRestore'); put('plain: restored RDGROUND', { note: await note(p), list: await list(p) })
    await find('RDGROUND'); await openRow(p, 'RDGROUND'); await tap('#accEdArchive'); await openRow(p, 'RDGROUND', true); await tap('#accArDel'); put('plain: delete first press', { note: await note(p), editors: await editors(p) }); await tap('#accArDel'); put('plain: delete second press', { note: await note(p), list: await list(p) })
    await find(''); await p.evaluate(() => scrollTo(0, 0)); await tap('[data-approve]'); await tap('#apvModeNew'); await fill('#apvCs', 'RDREQUEST'); await tap('#apvGo'); put('plain: approved as New person', { note: await note(p), list: await list(p) })
    await request(p, { user: 'rdreq2@example.test', cs: 'RDREQ2', ini: 'R2' }); await adminCat(p, 'Users'); await tap('[data-approve]'); await tap('#apvModeRoster')
    await p.locator(V('#apvPid')).first().selectOption({ label: 'RDPLAIN' }).catch(e => put('plain: roster pick', firstLine(e))); await tap('#apvGo'); put('plain: approved On the roster (RDPLAIN already has a sign-in, so refused or picked)', { note: await note(p), editors: await editors(p) }); await cancelAny()
    await request(p, { user: 'rdreq3@example.test', cs: 'RDNOSIGN', ini: 'R3' }); await adminCat(p, 'Users'); put('plain: waiting list', await p.evaluate(() => [...document.querySelectorAll('[data-req]')].map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 100))))
    await tap('[data-decline]'); put('plain: refused one', { note: await note(p) })
    put('plain: where each place shows them', await seen())
    await tab(p, 'editsched'); await p.clock.runFor(500); if (await p.locator(V('#histBtn')).count()) { await tap('#histBtn'); put('plain: change history window', await p.evaluate(() => document.body.innerText.includes('RDPLAIN') || /Admin/.test(document.body.innerText))); await snap('plain-history'); await tap('#histBtn').catch(() => {}) }
    await adminCat(p, 'Data'); await p.locator(V('#admLogMode')).first().selectOption('range'); await p.clock.runFor(300)
    await p.locator('#admLogRun [data-iso="2026-11-05"]').first().click(); await p.locator('#admLogRun [data-iso="2026-11-07"]').first().click(); await p.clock.runFor(300)
    await tap('#admLog'); put('plain: clear history, first press', { btn: await p.locator('#admLog').textContent(), note: await note(p) }); await tap('#admLog'); put('plain: clear history, second press', { note: await note(p) }); await snap('plain-cleared')
    await p.locator(V('#admWipeMode')).first().selectOption('range'); await p.locator('#admWipeRun [data-iso="2026-11-05"]').first().click(); await p.locator('#admWipeRun [data-iso="2026-11-07"]').first().click(); await p.clock.runFor(300)
    await tap('#admWipe'); put('plain: clear clutter, first press', { btn: await p.locator('#admWipe').textContent(), note: await note(p) }); await tap('#admWipe').catch(() => {}); put('plain: clear clutter, second press', { note: await note(p) })
  })

  /* ---------------- x2 — a bell landing, and Give access both ways (a request that matches a roster man, and a new one) */
  if (run('x2')) await safe('x2', async () => {
    await request(p, { user: 'rdmatch@example.test', cs: 'RDNOSIGN', ini: 'RN' })
    await tab(p, 'help'); await p.clock.runFor(500)
    await p.locator(V('#notifyBell')).first().click(); await p.clock.runFor(500)
    put('x2 bell lines', await p.evaluate(() => [...document.querySelectorAll('[data-testid^="bell-line-"]')].map(l => l.textContent.replace(/s+/g, ' ').trim().slice(0, 90))))
    await snap('x2-bell')
    const line = p.locator(V('[data-testid^="bell-line-"]')).first()
    if (await line.count()) { await (phone ? line.tap() : line.click()); await p.clock.runFor(900); put('x2 bell line lands', { admin: await p.evaluate(() => document.querySelector('#page-admin')?.getBoundingClientRect().height > 0), waiting: await p.locator(V('#admWaiting')).count(), bellOpen: await p.locator(V('[data-testid="bell-list"]')).count(), editors: (await editors(p)).length }); await snap('x2-bell-landed') }
    else put('x2 bell line', 'no line')
    put('x2 waiting list', await p.evaluate(() => [...document.querySelectorAll('[data-req]')].map(r => r.textContent.replace(/s+/g, ' ').trim().slice(0, 100))))
    const second = p.locator(V('[data-approve]')).nth(1); await second.scrollIntoViewIfNeeded(); await (phone ? second.tap() : second.click()); await p.clock.runFor(500)
    put('x2 give access to a roster match: opened', await editors(p)); await snap('x2-roster-open')
    await p.locator(V('#apvModeNew')).first().click().catch(() => {}); await p.clock.runFor(300); put('x2 roster match: New person', await editors(p)); await snap('x2-roster-new')
    await tap('#apvModeRoster'); put('x2 roster match: back to On the roster', await editors(p))
    await p.locator(V('#apvPid')).first().selectOption({ label: 'RDNOSIGN' }); await p.locator(V('#apvRole')).first().selectOption('admin'); await snap('x2-roster-picked')
    const u0 = await undoOf(p); await tap('#apvGo'); put('x2 gave access on the roster', { note: await note(p), undo: [u0, await undoOf(p)], list: await list(p), waiting: await p.locator(V('[data-req]')).count() }); await snap('x2-roster-done')
    await tap('[data-approve]'); put('x2 New person approval opened', await editors(p)); await tap('#apvModeNew'); await tap('#apvGo'); put('x2 approved New person', { note: await note(p), list: await list(p), waiting: await p.locator(V('[data-req]')).count() })
    await tab(p, 'quals'); await p.clock.runFor(1500); put('x2 Quals shows them', await p.evaluate(() => ['RDNOSIGN', 'RDREQUEST'].map(c => c + ':' + document.body.innerText.includes(c))))
    await tab(p, 'leavewar'); await p.clock.runFor(1500); put('x2 Leave War shows them', await p.evaluate(() => ['RDNOSIGN', 'RDREQUEST'].map(c => c + ':' + document.body.innerText.includes(c))))
  })
  errsAll[`${size}-${tag}`] = { page: w.errs.slice(0, 8), http: w.bad.slice(0, 8) }
}

async function accessPart(br, dist, origin, size, tag) {
  const phone = size === 'phone'
  const put = (step, v) => { ((R[size] ||= {})[step] ||= {})[tag] = JSON.stringify(v) }
  const snapq = async (q, name) => { const f = path.join(out, `${tag}-${size}-${name}.png`); await q.screenshot({ path: f }); pics.push(f) }
  for (const sv of ['', '?savefail']) {
    const w = await world(br, dist, origin, { phone, noSign: true, q: sv || '?fresh=1', quiet: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
    const q = w.p, k = sv ? 'F ' : ''
    const active = () => q.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.tagName.toLowerCase()) : 'none' })
    try {
      await q.fill('#luser', 'newcomer@example.test'); await q.fill('#lpass', 'x'); await q.click('#loginForm button[type=submit]'); await q.clock.runFor(900)
      put(`s20 ${k}on arrival`, { keysOn: await active(), cs: await q.locator('#accCs').inputValue() }); await snapq(q, `s20${sv ? 'F' : ''}-arrival`)
      await q.keyboard.type('abc'); put(`s20 ${k}typed at once`, { cs: await q.locator('#accCs').inputValue() })
      const inv = []; for (let i = 0; i < 7; i++) { await q.keyboard.press('Tab'); inv.push(await active()) } ; put(`s20 ${k}Tab inventory`, inv)
      await q.fill('#accCs', ''); await q.click('#accSend'); await q.clock.runFor(300); put(`s20 ${k}blank send`, { err: await q.locator('#accErr').textContent() })
      await q.fill('#accCs', 'ABCDEFGHIJKLMNO'); await q.clock.runFor(200); put(`s20 ${k}15 characters`, { long: await q.locator('#accCsLong').textContent().catch(() => 'none'), cs: await q.locator('#accCs').inputValue() }); await snapq(q, `s20${sv ? 'F' : ''}-15chars`)
      await q.click('#accSend'); await q.clock.runFor(300); put(`s20 ${k}15 chars send`, { err: await q.locator('#accErr').textContent(), asked: await q.locator('#accAsked').count() })
      await q.fill('#accCs', 'ABCDEFGHIJKLMN'); await q.fill('#accIni', 'AB'); await q.click('#accSend'); await q.clock.runFor(300); put(`s20 ${k}no seat`, { err: await q.locator('#accErr').textContent() })
      await q.selectOption('#accSeat', 'GND'); put(`s20 ${k}personnel: CAT`, { cat: await q.evaluate(() => { const c = document.getElementById('accCat'); return c ? c.outerHTML.slice(0, 80) : 'none' }) })
      await q.selectOption('#accSeat', 'RCP'); await q.selectOption('#accCat', 'B'); await q.click('#accSend'); await q.clock.runFor(900)
      put(`s20 ${k}sent`, { asked: await q.locator('#accAsked').textContent().catch(() => 'none'), state: await q.locator('.pass-state').textContent().catch(() => 'none'), steps: await q.locator('.pass-steps').textContent().catch(() => 'none'), band: await q.evaluate(() => (document.querySelector('.savestat.failed,.saveband')?.textContent || '').trim().slice(0, 60)) }); await snapq(q, `s20${sv ? 'F' : ''}-sent`)
      if (!sv) { await q.click('#accOut'); await q.clock.runFor(700); await q.fill('#luser', 'other@example.test'); await q.fill('#lpass', 'x'); await q.click('#loginForm button[type=submit]'); await q.clock.runFor(900); put('s20 another identity', { keysOn: await active(), cs: await q.locator('#accCs').inputValue().catch(() => 'none') }) }
    } catch (e) { put(`s20 ${k}NOT-WALKED`, firstLine(e)); console.log(`  ${tag} ${size} s20${k}: ${firstLine(e)}`) }
    errsAll[`${size}-${tag}-access${sv}`] = { page: w.errs.slice(0, 6), http: w.bad.slice(0, 6) }
    await w.ctx.close()
  }
}

for (const [size, engine] of [['desk', 'chromium'], ['phone', 'webkit']]) {
  const br = engine === 'webkit' ? await webkit.launch() : await chromium.launch(LAUNCH)
  for (const [dist, tag, origin] of [[before, 'main', 'http://localhost:4401'], [after, 'branch', 'http://localhost:4402']]) {
    try { const w = await world(br, dist, origin, { phone: size === 'phone' }); await body(w, size, tag); await w.ctx.close() } catch (e) { console.log(`  ${tag} ${size}: BODY FAILED — ${firstLine(e)}`) }
    if (run('s20')) try { await accessPart(br, dist, origin, size, tag) } catch (e) { console.log(`  ${tag} ${size}: ACCESS FAILED — ${firstLine(e)}`) }
  }
  await br.close()
}
let same = 0, diff = 0, notw = 0
const rows = []
for (const size of Object.keys(R)) for (const step of Object.keys(R[size])) {
  /* a minted person id differs run to run (the app's own random ids): not a difference of the screens */
  const norm = x => typeof x === 'string' ? x.replace(/"who":"[^"]*"/g, '"who":"ID"') : x
  const m = norm(R[size][step].main), b = norm(R[size][step].branch)
  const nw = step.includes('!NOT-WALKED') || m === undefined || b === undefined
  const v = nw ? 'NOT-WALKED' : m === b ? 'SAME' : 'DIFF'
  v === 'SAME' ? same++ : v === 'DIFF' ? diff++ : notw++
  rows.push({ size, step, v, main: m, branch: b })
  console.log(`${v.padEnd(10)} ${size} ${step}${v === 'SAME' ? '' : `\n     main:   ${String(m).slice(0, 400)}\n     branch: ${String(b).slice(0, 400)}`}`)
}
writeFileSync(path.join(out, 'walkA-record' + (ONLY.length ? '-' + ONLY.join('+') : '') + '.json'), JSON.stringify({ rows, errs: errsAll, pics }, null, 1))
console.log(`errors/http: ${JSON.stringify(errsAll)}`)
console.log(`Walk: ${rows.length} steps, ${same} SAME, ${diff} DIFF, ${notw} NOT-WALKED, ${pics.length} pictures`)
