// jc-req - S35 (Request access with no squadron chosen), S36 (correct the choice, then approve or refuse), S37 (the second part: Add a person's own default).
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, logout, pickSq, state } from './jlib.mjs'
import { toUsers, bell, rowText } from './jc-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-req v1', SZ)
picsFor('jc-req-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const URL_ = `http://localhost:${process.env.MQ_PORT}/`
async function arrive(s, who) {
  const { page } = s
  await page.goto(URL_); await page.waitForSelector('#luser'); await page.fill('#luser', who); await page.fill('#lpass', 'x')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#accForm, #accessWaiting', { timeout: 15000 }); await page.waitForTimeout(300)
}
const card = s => s.page.evaluate(() => {
  const q = document.querySelector('#accSqn')
  return { sqn: q ? q.value : null, label: q ? q.options[q.selectedIndex]?.textContent : null, opts: q ? [...q.options].map(o => `${o.value}|${o.textContent}${o.disabled ? '(off)' : ''}`) : null, err: document.querySelector('#accErr')?.textContent ?? null, form: !!document.querySelector('#accForm'), waiting: !!document.querySelector('#accessWaiting') }
})
async function fillCard(s, name) { await s.page.fill('#accCs', name); await s.page.fill('#accIni', 'KT'); await s.page.selectOption('#accSeat', { index: 1 }).catch(() => {}); await s.page.selectOption('#accCat', { index: 1 }).catch(() => {}); await s.page.waitForTimeout(120) }
const outOfCard = async s => { await s.page.locator('#accOut').first().click(); await s.page.waitForSelector('#luser'); await s.page.waitForTimeout(250) }
const waitList = s => s.page.evaluate(() => { const e = [...document.querySelectorAll('#admWaiting [data-req]')].filter(r => r.getBoundingClientRect().height > 0); return e.map(r => r.innerText.replace(/\s+/g, ' ').trim().slice(0, 80)) })
try {
  const s = await newPage(SZ); const { page } = s
  await step('S35 button with no squadron', async () => {
    await arrive(s, 'kite1@mail')
    const c0 = await card(s); rec('S35 card opens', c0)
    check('S35 starts on Pick…', c0.sqn === '' && /^Pick/.test(c0.label || ''), c0.label)
    await pic(s, 's35-1-opens', ['#accForm'])
    await fillCard(s, 'Kite')
    if (s.desk) await page.click('#accSend'); else await page.tap('#accSend')
    await page.waitForTimeout(350)
    const c1 = await card(s); rec('S35 after button', c1)
    check('S35 words on button', c1.err === 'Pick your squadron', c1.err)
    check('S35 not sent by button', c1.form && !c1.waiting, { form: c1.form, waiting: c1.waiting })
    await pic(s, 's35-2-error', ['#accForm'])
  })
  await step('S35 Enter with no squadron', async () => {
    await page.fill('#accIni', 'KT2'); await page.waitForTimeout(100)
    const cleared = await card(s); rec('S35 error after typing', cleared.err)
    await page.focus('#accIni'); await page.keyboard.press('Enter'); await page.waitForTimeout(350)
    const c2 = await card(s); check('S35 words on Enter', c2.err === 'Pick your squadron', c2.err)
    check('S35 not sent by Enter', c2.form && !c2.waiting, { form: c2.form, waiting: c2.waiting })
    await outOfCard(s)
  })
  await step('S35 nothing reached an admin', async () => {
    await signIn(s, 'ad', 'a'); await toUsers(s)
    let w142 = await waitList(s); rec('S35 142 waiting', w142)
    check('S35 none waiting on 142', !w142.some(x => /Kite/.test(x)), w142)
    await pickSq(s, '149'); await toUsers(s); const w149 = await waitList(s); rec('S35 149 waiting', w149)
    check('S35 none waiting on 149', !w149.some(x => /Kite/.test(x)), w149)
    await bell.open(s); const L = await bell.lines(s); check('S35 no bell line', !L.some(x => /Kite/.test(x)), L.slice(0, 3)); await bell.close(s)
  })
  await s.ctx.close()

  for (const end of ['approve', 'refuse']) {
    const t = await newPage(SZ); const p = t.page; const mail = `kite-${end}@mail`, cs = end === 'approve' ? 'KiteA' : 'KiteR'
    await step(`S36 ${end}`, async () => {
      await arrive(t, mail); await fillCard(t, cs)
      if (t.desk) await p.click('#accSend'); else await p.tap('#accSend')
      await p.waitForTimeout(300); check(`S36 ${end} error first`, (await card(t)).err === 'Pick your squadron', (await card(t)).err)
      await p.selectOption('#accSqn', { label: (await card(t)).opts.find(o => /142/.test(o)).split('|')[1] }); await p.waitForTimeout(120)
      check(`S36 ${end} error clears on a choice`, (await card(t)).err === '', (await card(t)).err)
      await p.selectOption('#accSqn', { label: (await card(t)).opts.find(o => /149/.test(o)).split('|')[1] }); await p.waitForTimeout(120)
      if (t.desk) await p.click('#accSend'); else await p.tap('#accSend')
      await p.waitForSelector('#accessWaiting', { timeout: 6000 }); await p.waitForTimeout(300)
      const words = await p.evaluate(() => document.querySelector('#accessWaiting').innerText.replace(/\s+/g, ' ').slice(0, 220)); rec(`S36 ${end} waiting screen`, words)
      await pic(t, `s36-${end}-1-waiting`)
      await p.locator('#accOut').first().click(); await p.waitForSelector('#luser'); await p.waitForTimeout(200)
      await signIn(t, 'ad', 'a')
      const lit = () => p.evaluate(() => { const e = [...document.querySelectorAll('#notifyBell')].find(x => x.getBoundingClientRect().width > 0); return !!e && e.classList.contains('on') })
      rec(`S36 ${end} Saber's bell lit at sign-in (Show 149 off)`, await lit())
      if (!(await lit())) {
        await bell.open(t); const sh = p.locator('[data-testid="bell-show"] button', { hasText: /^149$/ })
        rec(`S36 ${end} Show 149 before`, await sh.first().getAttribute('aria-pressed'))
        if ((await sh.first().getAttribute('aria-pressed')) !== 'true') await sh.first().click()
        await p.waitForTimeout(220); await bell.close(t)
      }
      const l2 = await lit(); check(`S36 ${end} the bell lights for 149's request once 149 is shown`, l2, l2)
      await p.locator('#notifyBell').filter({ visible: true }).first().click(); await p.waitForTimeout(600)
      const tw = await p.evaluate(() => document.querySelector('#toastEl')?.textContent?.trim()); const st0 = await state(t)
      check(`S36 ${end} the bell's tap names 149`, /waiting for access to 149/.test(tw || ''), tw)
      check(`S36 ${end} the bell lands on 149's Admin`, st0.page === 'page-admin' && /149/.test(st0.barMark || st0.dMark || ''), { page: st0.page, bar: st0.barMark || st0.dMark })
      await pic(t, `s36-${end}-2-bell`)
      const w149a = await waitList(t); check(`S36 ${end} the bell opens the waiting list with him`, w149a.filter(x => x.includes(cs)).length === 1, w149a)
      await pickSq(t, '142'); await toUsers(t); const w142 = await waitList(t); check(`S36 ${end} not on 142's list`, !w142.some(x => x.includes(cs)), w142)
      await pickSq(t, '149'); await toUsers(t); const w149 = await waitList(t); rec(`S36 ${end} 149 list`, w149)
      check(`S36 ${end} on 149's list once`, w149.filter(x => x.includes(cs)).length === 1, w149)
      await pic(t, `s36-${end}-3-list`, ['#admWaiting'])
      const row = p.locator('#admWaiting [data-req]', { hasText: cs }).first()
      if (end === 'approve') {
        await row.locator('[data-approve]').click(); await p.waitForTimeout(350); await pic(t, `s36-${end}-4-approving`)
        rec(`S36 ${end} approve button`, await p.locator('#apvGo').textContent())
        await p.locator('#apvGo').click(); await p.waitForTimeout(600)
      } else { await row.locator('[data-decline]').click(); await p.waitForTimeout(500) }
      const after = await waitList(t); rec(`S36 ${end} 149 list after`, after); check(`S36 ${end} gone from the list`, !after.some(x => x.includes(cs)), after)
      await pic(t, `s36-${end}-5-after`)
      if (end === 'approve') {
        const rowLine = await p.evaluate(n => { const e = [...document.querySelectorAll('#page-admin [data-person]')].find(r => r.innerText.includes(n) && r.getBoundingClientRect().height > 0); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 120) : null }, cs)
        rec(`S36 ${end} row on 149`, rowLine); check(`S36 ${end} on 149's people`, !!rowLine, rowLine)
      }
      await logout(t)
      await signIn(t, mail, 'x', { pending: end !== 'approve' }); await p.waitForTimeout(500)
    })
    await step(`S36 ${end} what the applicant gets`, async () => {
      const st = await state(t); const ca = await card(t); rec(`S36 ${end} applicant state`, { bar: st.barMark, page: st.page, form: ca.form, waiting: ca.waiting })
      if (end === 'approve') {
        check(`S36 ${end} applicant is in 149`, /149/.test(st.barMark || st.dMark || ''), st.barMark || st.dMark)
        await bell.open(t); const B = await bell.lines(t); rec(`S36 ${end} applicant bell`, B.slice(0, 3)); await pic(t, `s36-${end}-6-applicant`); await bell.close(t)
      } else {
        check(`S36 ${end} applicant has no access`, ca.form || ca.waiting || !st.page, { page: st.page, form: ca.form, waiting: ca.waiting })
        const words = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 260)); rec(`S36 ${end} applicant sees`, words); await pic(t, `s36-${end}-6-applicant`)
      }
    })
    await t.ctx.close()
  }

  const u = await newPage(SZ)
  await signIn(u, 'ad', 'a')
  await step('S37 Add a person keeps its own default', async () => {
    await toUsers(u)
    const home = () => u.page.evaluate(() => { const h = document.querySelector('#accAddHome'); return h ? { v: h.value, label: h.options[h.selectedIndex]?.textContent, opts: [...h.options].map(o => o.textContent) } : null })
    if (!(await u.page.locator('#accAddHome').count())) { const b = u.page.locator('#accAddBlock button').filter({ visible: true }); rec('S37 Add block buttons', await b.allTextContents()); if (await b.count()) await b.first().click(); await u.page.waitForTimeout(350) }
    const h = await home(); rec('S37 Home squadron (142 in view)', h); check('S37 defaults to the list in view, not Pick', !!h && /142/.test(h.label || ''), h && h.label)
    await u.page.locator('#accAddHome').scrollIntoViewIfNeeded().catch(() => {}); await pic(u, 's37-1-add-person')
    await pickSq(u, '149'); await toUsers(u)
    if (!(await u.page.locator('#accAddHome').count())) { const b = u.page.locator('#accAddBlock button').filter({ visible: true }); if (await b.count()) await b.first().click(); await u.page.waitForTimeout(350) }
    const h2 = await home(); rec('S37 Home squadron (149 in view)', h2); check('S37 follows the list in view', !!h2 && /149/.test(h2.label || ''), h2 && h2.label)
  })
  await u.ctx.close()
} finally { finish('jc-req-' + SZ); await closeAll() }
