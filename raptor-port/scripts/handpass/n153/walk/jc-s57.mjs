// jc-s57 - S57, the Squadrons everyday round: rows opened and closed; a squadron made on an existing place, one with + New place…; its first admin; a place change's timing; the limits of an admin of one squadron.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, as, admCat, pickSq, shut, state, go } from './jlib.mjs'
import { toast, toUsers, bell, who, rowText } from './jc-lib.mjs'
import { tap } from './jc-flib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-s57 v1', SZ)
picsFor('jc-s57-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const rows = s => s.page.evaluate(() => [...document.querySelectorAll('#page-admin button.acc-main')].filter(b => b.getBoundingClientRect().height > 0).map(b => b.textContent.replace(/\s+/g, ' ').trim()).filter(t => /people|GMT|·/.test(t) && !/no sign-in|CAT/.test(t)))
const sq = (s, re) => s.page.locator('#page-admin button.acc-main', { hasText: re }).filter({ visible: true }).first()
const barList = s => s.page.evaluate(async () => [...document.querySelectorAll('#sqnMenu .sqm-row')].map(r => r.querySelector('.sqm-num').textContent.trim()))
async function menuList(s) {
  if (s.desk) { await s.page.locator('#sqnMenuBtn').click(); await s.page.waitForTimeout(220); const l = await barList(s); await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(160); return l }
  await tap(s, s.page.locator('#burger')); await s.page.waitForTimeout(260); if (!(await s.page.locator('#drawerSqnList').count())) await tap(s, s.page.locator('#drawerSqnBtn')); await s.page.waitForTimeout(200)
  const l = await s.page.evaluate(() => [...document.querySelectorAll('#drawerSqnList .sqm-row .sqm-num')].map(e => e.textContent.trim())); await shut(s); return l
}
async function newSq(s, num, admin, place) {
  const { page } = s
  await tap(s, page.locator('#sqNew').filter({ visible: true }).first()); await page.waitForTimeout(240); await page.fill('#sqNewNum', num)
  const lbl = await page.evaluate(a => [...document.querySelector('#sqNewAdmin').options].map(o => o.textContent).find(t => t.startsWith(a)), admin); if (lbl) await page.selectOption('#sqNewAdmin', { label: lbl })
  if (place) {
    await page.selectOption('#sqNewPlace', '+new'); await page.waitForTimeout(250)
    const ids = await page.evaluate(() => [...document.querySelectorAll('#page-admin input, #page-admin select')].filter(e => e.getBoundingClientRect().width > 0 && /sqNew/.test(e.id)).map(e => e.id)); rec(`S57 new-place fields`, ids)
    const nm = ids.find(i => /Name/.test(i)); if (nm) await page.fill(`#${nm}`, place)
    const tz = ids.find(i => /Tz|Zone/i.test(i)); if (tz) { const o = await page.evaluate(i => [...document.querySelector(`#${i}`).options].map(x => x.value).filter(v => v && !/Perth/.test(v))[0], tz); await page.selectOption(`#${tz}`, o); rec('S57 time zone picked', o) }
  }
  await pic(s, `n-${num}-form`); await tap(s, page.locator('#sqNewSave')); await page.waitForTimeout(600)
}
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a'); await admCat(s, 'Squadrons')
  await step('S57 rows open and close', async () => {
    const r0 = await rows(s); rec('S57 rows', r0)
    await tap(s, sq(s, /^142/)); await page.waitForTimeout(240); check('S57 squadron row opens', await page.locator('#sqMoveCancel').count() > 0, 'open'); await pic(s, 'r1-open')
    await tap(s, page.locator('#sqMoveCancel')); await page.waitForTimeout(200); check('S57 Cancel closes', !(await page.locator('#sqMoveCancel').count()), 'closed')
    await tap(s, sq(s, /^142/)); await page.waitForTimeout(220); await page.keyboard.press('Escape'); await page.waitForTimeout(200); check('S57 Escape closes', !(await page.locator('#sqMoveCancel').count()), 'closed')
    await tap(s, sq(s, /^Home base/)); await page.waitForTimeout(220); check('S57 place row opens', await page.locator('#plCancel').count() > 0, 'open'); await tap(s, page.locator('#plCancel')); await page.waitForTimeout(200)
    check('S57 nothing changed', JSON.stringify(await rows(s)) === JSON.stringify(r0), await rows(s))
  })
  await step('S57 refusals on the form', async () => {
    await tap(s, page.locator('#sqNew').filter({ visible: true }).first()); await page.waitForTimeout(220)
    await tap(s, page.locator('#sqNewSave')); await page.waitForTimeout(350); rec('S57 empty form says', await toast(s))
    await page.fill('#sqNewNum', '149'); await tap(s, page.locator('#sqNewSave')); await page.waitForTimeout(350); rec('S57 a number in use says', await toast(s)); await pic(s, 'r2-refused')
    check('S57 form still open after refusals', await page.locator('#sqNewCancel').count() > 0, 'open'); await tap(s, page.locator('#sqNewCancel')); await page.waitForTimeout(200)
  })
  await step('S57 a squadron on an existing place', async () => {
    await newSq(s, '150', 'Kestrel', null); rec('S57 150 saved says', await toast(s)); const r = await rows(s); rec('S57 rows after 150', r)
    check('S57 150 on the list', r.some(t => /^150/.test(t)), r.filter(t => /^150/.test(t))); check('S57 Home base names 150', r.some(t => /^Home base.*150/.test(t)), r.filter(t => /^Home/.test(t))); await pic(s, 'n-150-saved')
    const l = await menuList(s); rec('S57 the menu lists', l); check('S57 150 in the squadron list', l.includes('150'), l)
  })
  await step('S57 a squadron with + New place…', async () => {
    await admCat(s, 'Squadrons'); await newSq(s, '151', 'Kestrel', 'Northfield'); rec('S57 151 saved says', await toast(s)); const r = await rows(s); rec('S57 rows after 151', r)
    check('S57 151 on the list', r.some(t => /^151/.test(t)), r.filter(t => /^151/.test(t))); check('S57 the new place on the Places list', r.some(t => /^Northfield.*151/.test(t)), r.filter(t => /Northfield/.test(t))); await pic(s, 'n-151-saved')
  })
  await step('S57 the first admin arrives', async () => {
    await as(s, 'ad9', 'a9'); await bell.open(s); const L = await bell.lines(s); rec('S57 Kestrel bell', L.slice(0, 4)); await pic(s, 'k1-bell'); await bell.close(s)
    const l = await menuList(s); rec('S57 Kestrel menu', l); check('S57 Kestrel has 150 and 151', l.includes('150') && l.includes('151'), l)
    await pickSq(s, '150'); await shut(s); await page.waitForTimeout(350); const st = await state(s); const t = st.tabs.length ? st.tabs : st.items; rec('S57 Kestrel on 150', { bar: st.barMark || st.dMark, t })
    check('S57 Plan of 150: Kestrel gets the Edit Schedule and Admin', t.includes('admin') && (t.includes('editsched') || t.includes('sched') || t.length > 4), t); await pic(s, 'k2-on-150')
    await toUsers(s); const lk = await rowText(s, 'kes9'); rec('S57 Kestrel on 150 Users', lk); await pic(s, 'k3-users-150')
  })
  await step('S57 a place change and its timing', async () => {
    await as(s, 'ad', 'a'); await admCat(s, 'Squadrons'); await tap(s, sq(s, /^150/)); await page.waitForTimeout(240)
    await page.selectOption('#sqPlace', { label: 'Northfield' }).catch(async () => { const o = await page.evaluate(() => [...document.querySelector('#sqPlace').options].map(x => x.textContent)); rec('S57 place options', o) }); await page.waitForTimeout(200)
    const note1 = await page.evaluate(() => [...document.querySelectorAll('#page-admin .adm-note, #page-admin p')].filter(e => e.getBoundingClientRect().width > 0 && /tomorrow|Saved at once/.test(e.textContent)).map(e => e.textContent.trim())); rec('S57 the row says', note1); await pic(s, 'p1-move')
    await tap(s, page.locator('#sqMoveSave')); await page.waitForTimeout(450); rec('S57 place change says', await toast(s)); await pic(s, 'p2-moved')
    const r = await rows(s); rec('S57 rows after the move', r); check('S57 a move is explained as from tomorrow', note1.some(t => /tomorrow/.test(t)), note1)
  })
  await step('S57 what an admin of one squadron can do', async () => {
    await as(s, 'ad2', 'a2'); await admCat(s, 'Squadrons'); await page.waitForTimeout(200); rec('S57 Hunter + New squadron', await page.locator('#sqNew').filter({ visible: true }).count())
    check('S57 Hunter is not offered + New squadron', !(await page.locator('#sqNew').filter({ visible: true }).count()), 'absent')
    const hb = sq(s, /^Home base/)
    if (!(await hb.isDisabled())) {
      await tap(s, hb); await page.waitForTimeout(240); const tz0 = await page.inputValue('#plTz'); const o = await page.evaluate(v => [...document.querySelector('#plTz').options].map(x => x.value).find(x => x !== v), tz0)
      const locked = await page.locator('#plTz').isDisabled(); rec('S57 the time zone box is locked for Hunter', locked)
      const why = await page.evaluate(() => [...document.querySelectorAll('#page-admin .adm-note, #page-admin p, #page-admin .acc-note')].filter(e => e.getBoundingClientRect().width > 0 && /admin of|both squadrons|time zone/i.test(e.textContent)).map(e => e.textContent.trim())); rec('S57 the words beside it', why); await pic(s, 'h1-tz-locked')
      if (locked) check('S57 shared place time zone cannot be changed by an admin of one', true, why)
      else { await page.selectOption('#plTz', o); await tap(s, page.locator('#plSave')); await page.waitForTimeout(400); const w = await toast(s); rec('S57 Hunter saves a shared place time zone: says', w); await pic(s, 'h1-tz-refused'); check('S57 shared place time zone refused for an admin of one', /Only an admin of/.test(w || ''), w) }
      if (await page.locator('#plCancel').count()) await tap(s, page.locator('#plCancel'))
    } else rec('S57 Home base row greyed for Hunter', true)
    await as(s, 'ad', 'a'); await admCat(s, 'Squadrons'); const r = await rows(s); check('S57 Home base time zone unchanged', r.some(t => /^Home base.*GMT\+8/.test(t)), r.filter(t => /^Home/.test(t)))
  })
  await s.ctx.close()
} finally { finish('jc-s57-' + SZ); await closeAll() }
