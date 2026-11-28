// Round 4's drawings (28 Nov 26, chat 211), on the REAL running app (kit.mjs's rules: a "today" frame is the app as it
// draws itself after staging; a "proposed" frame changes only the words of an element the app drew).
//   f7 — the Leave War's OIL card for a day whose OIL came from an accepted duty input (his D2856: F7 drawn first).
//        Staged on the desktop: an admin files a Duty for Romeo on Sat 18 Jul 09:00–12:00 on the Inputs page, answers
//        its OIL question Yes, signs Saturday's four boxes and publishes it; then Romeo's Sat 18 box on the Leave War.
//        The demo week has no weekend duty input, and the demo's 4 Jul one earns only once its day is published.
//   sb — an "Overlaps standby:" line on Edit Schedule's warning list and its ✕'s hover words, today and with F5's words
//        (the question his D2855 left). Staged: an SC line added on Monday by the app's own command (+ Block's — the
//        demo week has no standby line), Romeo put in its front seat by the app's own seat command, and a Training
//        09:00–10:00 filed for him on the Inputs page.
// Words come from words.json beside this file. Run from raptor-port with the app served on GW_URL (default :4791).
import * as K from './kit.mjs'
import { readFileSync } from 'node:fs'
import path from 'node:path'
const W = JSON.parse(readFileSync(path.join(K.HERE, 'words.json'), 'utf8'))
const sleep = K.wait
const MAN = 'romeo'          // the standby scene's man (the app shows him as Rebel)
const F7MAN = 'shaft'        // F7's man (Anvil): free on Sat 18 Jul and on the Leave War

/* the Inputs page's calendar on July 2026, a day opened, an input filed (draw-f.mjs's steps, copied) */
async function inputsCal(p) {
  await K.go(p, 'inputs')
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await p.locator('#inCalBtn').click()
  await p.locator('#inpCal').waitFor(); await sleep(p, 400)
  const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  for (let i = 0; i < 30 && !(await p.locator('[data-icday="2026-07-16"]').count()); i++) {
    const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MON.findIndex(x => x.startsWith(m)), want = 2026 * 12 + 6
    await p.locator(at < want ? '#icNext' : '#icPrev').click(); await sleep(p, 350)
  }
}
async function dayOpen(p, iso) {
  await p.locator(`[data-icday="${iso}"]`).focus(); await p.keyboard.press('Enter')
  await p.waitForSelector('[data-testid="win-inputsday"]'); await sleep(p, 500)
}
async function fileIt(p, iso, spec) {
  const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
  await inputsCal(p); await dayOpen(p, iso)
  await p.locator('#icPopAdd').click(); await p.waitForSelector('#inpEditPop #inpEditType')
  await p.selectOption('#inpEditPop #inpEditType', spec.type)
  await p.selectOption('#inpEditPop #inpEditPerson', spec.person)
  const ad = p.locator('#inpEditPop #inpEditAllday')
  if (await ad.count() && await ad.isChecked()) await ad.click()
  await p.fill('#inpEditPop #inpEditStart', spec.from); await p.fill('#inpEditPop #inpEditEnd', spec.to)
  const own = p.locator('#inpEditPop #inpEditOwnTitle'); if (spec.title && await own.count()) await own.fill(spec.title)
  await p.locator('#inpEditSave').click(); await sleep(p, 500)
  for (let k = 0; k < 3; k++) {
    if (await p.locator('[data-testid="oilconf"]').count()) { await p.locator('[data-testid="oilconf"] [data-testid="oil-yes"]').first().click(); await p.locator('[data-testid="oilconf-save"]').click(); await sleep(p, 400) }
    else if (await p.locator('[data-testid="docconf"]').count()) { await p.locator('[data-testid="docconf-nodoc"]').click(); await sleep(p, 400) }
  }
  const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await x.click(); await sleep(p, 250) }
  const made = await p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, type: r.type, acc: r.acc, oil: r.oil, people: r.people })), had)
  if (!made.length) throw new Error('nothing filed: ' + JSON.stringify(spec) + ' note: ' + await K.noteText(p))
  return made[0]
}

async function f7(key, state) {
  const { b, ctx, p, sz } = await K.world(key, state)
  let saved = null
  await K.signIn(p, 'ad', 'a')
  if (key === 'd') {
    const rec = await fileIt(p, '2026-07-18', { type: 'Duty', person: F7MAN, from: '09:00', to: '12:00', title: 'Range safety' })
    K.fact('F7', sz.name, 'staged: the duty filed', rec)
    await K.weekDay(p, sz, 5)
    for (const role of ['cur', 'sked', 'plan', 'appr']) {
      const s = p.locator(`#eWeek [data-signbar="5"] select[data-sign="${role}"]`).first()
      const opts = await s.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
      await s.selectOption(opts[0]); await sleep(p, 500)
      for (let k = 0; k < 2; k++) if (await p.locator('[data-testid="oilsign-save"], [data-testid^="oilsign"] button').count()) { K.fact('F7', sz.name, 'an OIL list opened at a sign-off', await p.locator('[data-testid^="oilsign"]').first().innerText().catch(() => '')); break }
    }
    await p.locator('#eWeek [data-beak="5"]').click(); await sleep(p, 1000)
    K.fact('F7', sz.name, 'Saturday published: the note', await K.noteText(p))
    const pub = await p.evaluate(() => !!(window.SCHED && window.SCHED.orig && Object.keys(window.SCHED.orig).length))
    K.fact('F7', sz.name, 'anything published', pub)
    saved = await K.saveState(ctx, 'f7-staged')
  }
  await K.go(p, 'leavewar')
  await p.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await sleep(p, 900)
  const bar = p.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await sleep(p, 300) }
  const m = p.locator('[data-testid="month-july"]').filter({ visible: true }).first()
  if (await m.count()) { await m.click(); await sleep(p, 900) }
  const rowId = await p.evaluate(man => { const cs = window.PEOPLE[man]?.cs; const r = [...document.querySelectorAll('[data-testid^="row-"]')].find(e => cs && e.textContent.trim().startsWith(cs)); return r ? { id: r.getAttribute('data-testid').slice(4), cs } : { id: null, cs, rows: [...document.querySelectorAll('[data-testid^="row-"]')].slice(0, 6).map(e => e.getAttribute('data-testid') + ' = ' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40)), n: document.querySelectorAll('[data-testid^="row-"]').length } }, F7MAN).then(r => { K.fact('F7', sz.name, 'the man on the Leave War', r); return r.id })
  const cell = p.locator(`[data-testid="cell-${rowId}-2026-07-18"]`).first()
  await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(p, 400)
  K.fact('F7', sz.name, `${F7MAN}'s Sat 18 box`, K.clean(await cell.innerText()))
  await cell.click(); await sleep(p, 900)
  const where = await p.evaluate(() => {
    const ns = [...document.querySelectorAll('[data-testid="raptor-note"]')].filter(e => e.getBoundingClientRect().width > 0)
    const e = ns.find(n => /duty input/.test(n.textContent)) || ns[ns.length - 1]; if (!e) return null
    e.setAttribute('data-gwf7', 'note'); const row = e.closest('.bidsheet-row'); row && row.setAttribute('data-gwf7', 'row')
    const sheet = e.closest('.bidsheet, [role="dialog"], [data-testid^="win-"]') || e.parentElement.parentElement.parentElement
    sheet.setAttribute('data-gwf7', 'sheet'); e.scrollIntoView({ block: 'center' })
    return e.textContent.trim()
  })
  K.fact('F7', sz.name, 'the card: "Where it came from" (today)', where)
  if (!where || !/duty input/.test(where)) {
    await p.screenshot({ path: path.join(K.STATE, `f7-fail-${sz.name}.png`) })
    throw new Error('F7: no card naming a duty input; see ' + path.join(K.STATE, `f7-fail-${sz.name}.png`))
  }
  await sleep(p, 300); await K.neutral(p); await K.hideNote(p)
  await K.markEl(p, '[data-gwf7="note"]', '1')
  const sels = ['[data-gwf7="sheet"]', '[data-gwf7="row"]']
  await K.shot(p, sz, 'f7-today', sels, 8)
  await p.evaluate(w => { document.querySelector('[data-gwf7="note"]').textContent = w }, W.f7)
  await K.shot(p, sz, 'f7-proposed', sels, 8)
  K.fact('F7', sz.name, 'errors', p.errs)
  await b.close()
  return saved
}

async function sb(key, state) {
  const { b, ctx, p, sz } = await K.world(key, state)
  let saved = null
  await K.signIn(p)
  if (key === 'd') {
    await K.go(p, 'editsched')
    const gi = await p.evaluate(man => {
      window.addWave(0, 'sc')
      const gi = window.DAYS[0].waves.findIndex(w => w.kind === 'sc')
      const ok = window.fillSlot(`0.${gi}.0.0.p`, man)
      return { gi, ok, label: window.DAYS[0].waves[gi]?.label, f: JSON.stringify(window.DAYS[0].waves[gi]?.formations?.[0] || {}).slice(0, 300) }
    }, MAN)
    K.fact('SB', sz.name, 'staged: the SC line and its front seat', gi)
    const rec = await fileIt(p, '2026-07-13', { type: 'Meeting', person: MAN, from: '09:00', to: '10:00', title: 'Range brief' })
    K.fact('SB', sz.name, 'staged: the training filed', rec)
    await K.weekDay(p, sz, 0); await sleep(p, 2000)   /* the week drawn and its saves settled before the store is handed on */
    saved = await K.saveState(ctx, 'sb-staged')
  }
  await K.weekDay(p, sz, 0)
  K.fact('SB', sz.name, 'Monday holds the SC line and the meeting', await p.evaluate(man => ({ sc: (window.DAYS[0].waves || []).some(w => w.kind === 'sc'), mtg: window.INPUTS.some(r => r.type === 'Meeting' && (r.people || []).some(x => (x.p || x) === man)) }), MAN))
  const day = '#eWeek .day[data-day="0"]'
  const dw = p.locator(`${day} .daywarn`).filter({ visible: true }).first()
  await dw.evaluate(e => e.scrollIntoView({ block: 'center' })); await dw.click(); await sleep(p, 600)
  const found = await p.evaluate(day => {
    const all = [...document.querySelectorAll(`${day} .witem, .witem`)].filter(e => e.getBoundingClientRect().width > 0)
    const l = all.find(e => /Overlaps standby/.test(e.textContent))
    if (!l) return { none: true, lines: all.map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(t => /Romeo/.test(t)) }
    l.setAttribute('data-gwsb', 'line'); l.querySelector('.witem-mute')?.setAttribute('data-gwsb', 'x'); l.scrollIntoView({ block: 'center' })
    return { text: l.textContent.replace(/\s+/g, ' ').trim(), x: l.querySelector('.witem-mute')?.title }
  }, day)
  K.fact('SB', sz.name, 'the standby line and its ✕ hover words (today)', found)
  if (!found || found.none) throw new Error('SB: no "Overlaps standby" line on Monday')
  await sleep(p, 300); await K.neutral(p)
  await K.markEl(p, '[data-gwsb="x"]', '1')
  await K.hoverLabel(p, '[data-gwsb="x"]', found.x)
  await K.shot(p, sz, 'sb-x-today', ['[data-gwsb="line"]', '#gw-hover'], 10)
  await K.hoverLabel(p, '[data-gwsb="x"]', W.d1)
  await K.shot(p, sz, 'sb-x-proposed', ['[data-gwsb="line"]', '#gw-hover'], 10)
  await K.hoverOff(p); await K.unmark(p)
  await p.locator('[data-gwsb="x"]').click(); await sleep(p, 300)
  const note = await K.holdNote(p)
  K.fact('SB', sz.name, 'the note after ✕ (today)', note)
  await K.markEl(p, '#toastEl', '2')
  await K.shot(p, sz, 'sb-note-today', ['#toastEl'], 12)
  await p.evaluate(w => { document.getElementById('toastEl').textContent = w }, W.f5note)
  await K.shot(p, sz, 'sb-note-proposed', ['#toastEl'], 12)
  K.fact('SB', sz.name, 'errors', p.errs)
  await b.close()
  return saved
}

/* f6 — the Logic page's line under "An input closes its hours": today, his approved round-3 words (D2856), and the
   words after the cold reads (copied from draw-f.mjs's f6) */
async function f6(key) {
  const { b, p, sz } = await K.world(key)
  await K.signIn(p); await K.go(p, 'logic')
  const found = await p.evaluate(() => {
    const els = [...document.querySelectorAll('#page-logic *')].filter(e => e.children.length === 0 && /^Every input closes the man/.test((e.textContent || '').trim()) && e.getBoundingClientRect().width > 0)
    if (!els.length) return null
    const e = els[0]; e.setAttribute('data-gwf6', 'line')
    let row = e; for (let i = 0; i < 6 && row && !/An input closes its hours/.test(row.textContent || ''); i++) row = row.parentElement
    if (row) row.setAttribute('data-gwf6row', '1')
    e.scrollIntoView({ block: 'center' })
    return { line: e.textContent.trim() }
  })
  K.fact('F6', sz.name, 'the Logic line today', found)
  if (!found) throw new Error('F6: the line is not on the Logic page')
  await sleep(p, 400)
  await K.markEl(p, '[data-gwf6="line"]', '1')
  const sels = ['[data-gwf6row]', '[data-gwf6="line"]']
  await K.shot(p, sz, 'f6-today', sels, 14)
  await p.evaluate(w => { document.querySelector('[data-gwf6="line"]').textContent = w }, W.f6approved)
  await K.shot(p, sz, 'f6-approved', sels, 14)
  await p.evaluate(w => { document.querySelector('[data-gwf6="line"]').textContent = w }, W.f6)
  await K.shot(p, sz, 'f6-proposed', sels, 14)
  K.fact('F6', sz.name, 'errors', p.errs)
  await b.close()
}

const SCENES = { f7, sb, f6 }
const only = (process.env.GW_ONLY || 'f7,sb').split(',')
const sizes = (process.env.GW_SIZES || 'd,p').split(',')
for (const name of only) {
  let st = null
  for (const s of sizes) {
    K.log('=== ' + name + ' ' + s)
    try { const r = await SCENES[name](s, s === 'd' ? null : (st || path.join(K.STATE, name + '-staged.json'))); if (s === 'd') st = r }
    catch (e) { K.fact(name, s, 'STOPPED', String(e && e.message || e).slice(0, 400)) }
  }
}
K.saveFacts('r4-' + only.join('-'))
K.log('done')
