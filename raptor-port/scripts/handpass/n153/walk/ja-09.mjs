// S9 delete a person with training records (unfinished and completed courses); S10 medical and last-flown readers. PART=s9|s10
import { mk, closeAll, finish, go, pic, picsFor, note, step, check, T, hit, pickCourse, pickCrew, pickSyl, info, grade, addCourse, addEvent, ask, half, pickDate, shut, sleep, admCat, openRow, menuItem, state } from './ja-lib.mjs'
import { fixture, waitTrk, openTrk, move, reload, readBoth, whole142, whole149 } from './ja-fx.mjs'
const SZ = process.env.SZ || 'd', PART = process.env.PART || 's9'
console.log('ja-09 v1', SZ, PART)
picsFor(`j09-${SZ}-${PART}`)
const WIN = '.floatwin.inpedwin'
const pids = s => s.page.evaluate(() => [...document.querySelectorAll('#page-admin [data-person]')].map(e => e.dataset.person))
const done = async s => { const i = await info(s); return +(/Done=(\d+)/.exec(i.overall) || [])[1] }
async function enrol(s, pid) {
  await half(s, 'info'); await hit(s, '#addStu', 300); const r = s.page.locator(`#dlgList .dlg-item[data-key="${pid}"]`)
  if (!(await r.count())) { note(`no ${pid} in the picker`); await hit(s, '#dlgCancel', 200); await half(s, 'flow'); return false }
  await hit(s, r.first(), 700); await half(s, 'flow'); return true
}
/* a week-day label in the window's calendar */
const dayLabel = iso => { const d = new Date(iso + 'T12:00:00Z'); return `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()]} ${d.getUTCDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]} ${d.getUTCFullYear()}` }
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const shift = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
async function fileMedical(s, who, iso) {
  await go(s, 'inputs'); await shut(s); await sleep(s, 350)
  if (await s.page.locator('#inMemberMode').filter({ visible: true }).count()) await hit(s, '#inMemberMode', 250)
  await hit(s, '#inListBtn', 250); await hit(s, '#inNew', 400)
  const v = await s.page.evaluate(w => { const o = [...document.querySelector('#inpEditPerson').options].find(x => new RegExp(w, 'i').test(x.textContent)); return o?.value }, who)
  await s.page.selectOption('#inpEditPerson', v); await sleep(s, 200)
  const types = await s.page.evaluate(() => [...document.querySelector('#inpEditType').options].map(o => o.value)); note('input types: ' + types.join(' '))
  const med = types.find(t => /^MC$/.test(t)) || types.find(t => /^MC|MED|^HL/i.test(t)); await s.page.selectOption('#inpEditType', med); await sleep(s, 250)
  const lab = dayLabel(iso), b = () => s.page.locator(`${WIN} button[aria-label^="${lab}"]`).first()
  for (let i = 0; i < 12 && !(await b().count()); i++) await hit(s, s.page.locator(`${WIN} button[aria-label="Next month"]`).first(), 200)
  if (!(await b().count())) { note('no day ' + lab); return null }
  await hit(s, b(), 300); await s.page.fill('#inpEditRmk', 'ja s10 medical'); await hit(s, '#inpEditSave', 450)
  for (let i = 0; i < 3; i++) {
    const nd = s.page.locator('button', { hasText: /^No document$/ }).filter({ visible: true }); if (await nd.count()) await hit(s, nd.first(), 450)
    if (await s.page.locator('#dlgModal').count()) { note('input asked: ' + (await ask(s)).msg); await hit(s, '#dlgOk', 450) }
  }
  const open = await s.page.locator(WIN).filter({ visible: true }).count(); if (open) { note('input window still open'); await pic(s, 'x-input-open') }
  return med
}
const curr = async s => {
  await half(s, 'info')
  const v = await s.page.evaluate(() => {
    const kv = [...document.querySelectorAll('.curKv .kv')].map(k => k.textContent.replace(/\s+/g, ' ').trim())
    return { who: document.querySelector('#side .c-overall .who')?.textContent.trim(), down: document.querySelector('#downDays .datebox-txt')?.textContent.trim(), syll: document.getElementById('lastSyll')?.getAttribute('data-value') || '', cur: document.getElementById('lastCurr')?.getAttribute('data-value') || '', kv }
  })
  await half(s, 'flow'); return v
}
async function setDay(s, box, iso) { await half(s, 'info'); await s.page.locator(box).first().scrollIntoViewIfNeeded(); const ok = await pickDate(s, box, iso); await half(s, 'flow'); return ok }

try {
  const s = await mk(SZ)
  await step('fixture', async () => { await fixture(s) })
  if (PART === 's9') {
    let zid
    await step('S9 a disposable person made through Users', async () => {
      await admCat(s, 'Users'); await sleep(s, 300); const before = await pids(s)
      await s.page.fill('#accAddCs', 'Quokka'); await s.page.fill('#accAddIni', 'QK'); await s.page.selectOption('#accAddSeat', { index: 1 }); await s.page.selectOption('#accAddCat', { index: 1 }); await s.page.fill('#accAddName', 'jaquokka')
      await s.page.locator('#accAdd').scrollIntoViewIfNeeded(); await hit(s, '#accAdd', 600)
      const nw = (await pids(s)).filter(x => !before.includes(x)); check('S9 one new person', nw.length === 1, nw); zid = nw[0]
    })
    await step('S9 enrolled on an unfinished and a completed course', async () => {
      await go(s, 'tracker'); await shut(s); await waitTrk(s, '142'); await pickCourse(s, 'JA-142')
      check('S9 enrolled on the running course', await enrol(s, zid), (await T(s)).crew.now); await grade(s, 'ST-01', 'dco')
      await addCourse(s, 'JA-DONE'); await menuItem(s, 'syl', 'addSyl'); await s.page.locator('#dlgInput').fill('JADONE SYL'); await hit(s, '#dlgOk', 900)
      const ta = await T(s); note('new chart: ' + JSON.stringify({ syl: ta.syl.now, ev: ta.events }))
      await addEvent(s, 'JD1'); await sleep(s, 200); await hit(s, '#saveChanges', 700)
      check('S9 enrolled on the finished course', await enrol(s, zid), (await T(s)).crew?.now)
      await grade(s, 'JD1', 'dco'); const d = await done(s); check('S9 all his events done there', d === 1 && /Remaining=0/.test((await info(s)).overall), (await info(s)).overall); await pic(s, '01-completed')
      await move(s, '149'); await sleep(s, 200); const c = (await T(s)).crew.list; check('S9 not on 149', !c.includes('QUOKKA'), c); await move(s, '142')
    })
    await step('S9 delete him through Users', async () => {
      await admCat(s, 'Users'); await sleep(s, 300); await openRow(s, zid)
      const d = s.page.locator('#accEdDel'); await d.scrollIntoViewIfNeeded(); await hit(s, d, 250); const armed = await d.textContent(); note('armed: ' + armed); await pic(s, '02-armed'); await hit(s, d, 500)
      if (await s.page.locator('#dlgOk:visible').count()) { note('delete asked: ' + (await ask(s)).msg); await hit(s, '#dlgOk', 400) }
      check('S9 gone from Users', !(await pids(s)).includes(zid), (await pids(s)).length)
    })
    const inspect = async tag => {
      await pickCourse(s, 'JA-142'); await pickSyl(s, '2026'); let t = await T(s); check(`S9 ${tag} off the unfinished course`, !t.crew.list.includes('QUOKKA') && t.crew.list.includes('JA142A'), t.crew.list); await pic(s, `03-${tag}-running`)
      await pickCrew(s, 'JA142A'); check(`S9 ${tag} another student's marks untouched`, await done(s) === 3, 'JA142A')
      await pickCourse(s, 'JA-DONE'); await pickSyl(s, 'JADONE SYL'); await sleep(s, 300); t = await T(s)
      check(`S9 ${tag} stays on the completed course`, (t.crew?.list || []).includes('QUOKKA'), t.crew?.list)
      if ((t.crew?.list || []).includes('QUOKKA')) { await pickCrew(s, 'QUOKKA'); const i = await info(s); check(`S9 ${tag} his completed marks kept`, /Done=1 /.test(i.overall), i.overall); await pic(s, `04-${tag}-completed`) }
      const b = await readBoth(s); check(`S9 ${tag} both squadrons whole`, whole142(b['142']) && whole149(b['149']), b)
    }
    await step('S9 inspect', async () => { await go(s, 'tracker'); await shut(s); await waitTrk(s, '142'); await inspect('after delete') })
    await step('S9 reload', async () => { await reload(s); await openTrk(s, '142'); await inspect('after reload') })
  }
  if (PART === 's10') {
    const today = localToday(), S1 = shift(today, -10), C1 = shift(today, -4), S2 = shift(today, -20), C2 = shift(today, -2)
    await step('S10 enrol different people on each squadron', async () => {
      await openTrk(s, '142'); await pickCourse(s, 'JA-142')
      check('S10 Hunter on 142', await enrol(s, 'prowler'), (await T(s)).crew.now); check('S10 Ranger on 142', await enrol(s, 'bane'), (await T(s)).crew.now)
      await move(s, '149'); await pickCourse(s, 'JA-149')
      check('S10 Osprey on 149', await enrol(s, 'osp9'), (await T(s)).crew.now); check('S10 Kestrel on 149', await enrol(s, 'kes9'), (await T(s)).crew.now)
      await move(s, '142')
    })
    await step('S10 a medical for Hunter through Inputs', async () => {
      const m = await fileMedical(s, 'Hunter', today); check('S10 medical filed', !!m, m); await pic(s, '01-input-filed')
      await go(s, 'tracker'); await shut(s); await waitTrk(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'HUNTER'); const h = await curr(s); note('Hunter: ' + JSON.stringify(h))
      check('S10 Hunter counts the medical', /^1/.test(h.down || ''), h.down); await pic(s, '02-hunter')
      await half(s, 'info'); await hit(s, '#downDays', 350); const w = await s.page.evaluate(() => ({ title: document.querySelector('#downLog .lullhd b')?.textContent, rows: [...document.querySelectorAll('#downLog .frow')].map(r => r.textContent.replace(/\s+/g, ' ').trim()) })); await pic(s, '03-downlog'); await hit(s, '#downLogClose', 250); await half(s, 'flow')
      check('S10 the Down days window lists his medical', /HUNTER/.test(w.title || '') && w.rows.length === 1, w)
      await pickCrew(s, 'RANGER'); const r = await curr(s); check('S10 Ranger shows none', !/^1/.test(r.down || ''), r.down)
      await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'OSPREY'); const o = await curr(s); check('S10 149 Osprey shows none', !/^1/.test(o.down || ''), o.down); await pickCrew(s, 'KESTREL'); const k = await curr(s); check('S10 149 Kestrel shows none', !/^1/.test(k.down || ''), k.down)
      await move(s, '142')
    })
    await step('S10 last-flown dates, each on its own person and squadron', async () => {
      await pickCourse(s, 'JA-142'); await pickCrew(s, 'HUNTER')
      await setDay(s, '#lastSyll', S1); let h = await curr(s); check('S10 Hunter syllabus date (a syllabus flight also moves currency, D1005)', h.syll === S1 && h.cur === S1, h); check('S10 days since syllabus 10', h.kv.some(x => x.includes('syllabus') && x.includes('10d')), h.kv)
      await setDay(s, '#lastCurr', C1); h = await curr(s); check('S10 Hunter currency date', h.syll === S1 && h.cur === C1, h); check('S10 currency moved alone: syllabus still 10, currency 4', h.kv.some(x => x.includes('syllabus') && x.includes('10d')) && h.kv.some(x => x.includes('currency') && x.includes('4d')), h.kv)
      await pickCrew(s, 'RANGER'); const r = await curr(s); check('S10 Ranger untouched', !r.syll && !r.cur, r)
      await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'OSPREY'); const o = await curr(s); check('S10 149 Osprey untouched', !o.syll && !o.cur, o)
      await setDay(s, '#lastSyll', S2); await setDay(s, '#lastCurr', C2); const o2 = await curr(s); check('S10 Osprey takes his own dates', o2.syll === S2 && o2.cur === C2, o2); await pic(s, '04-osprey')
      await move(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'HUNTER'); h = await curr(s); check('S10 back on 142, Hunter keeps his', h.syll === S1 && h.cur === C1 && /^1/.test(h.down || ''), h); await pic(s, '05-hunter-back')
    })
    await step('S10 reload', async () => {
      await reload(s); await openTrk(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'HUNTER'); const h = await curr(s); check('S10 Hunter after reload', h.syll === S1 && h.cur === C1 && /^1/.test(h.down || ''), h)
      await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'OSPREY'); const o = await curr(s); check('S10 Osprey after reload', o.syll === S2 && o.cur === C2 && !/^1/.test(o.down || ''), o)
      await pickCrew(s, 'KESTREL'); const k = await curr(s); check('S10 Kestrel after reload', !k.syll && !k.cur, k)
      const b = await readBoth(s); check('S10 marks whole', whole142(b['142']) && whole149(b['149']), b)
    })
  }
  await s.ctx.close()
} finally { finish(`j09-${SZ}-${PART}`); await closeAll() }
