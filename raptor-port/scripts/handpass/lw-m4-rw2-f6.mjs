// Re-walk 2 F6 — leaving the Leave War from Approvals (M6): from the slim bar and from the Approvals page, to Edit Schedule and Inputs; the page opens at its top and does not jump; come back.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk2'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, pressLoc, lineLoc } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-rw2-f6 v1]')
const w = await L.newCtx('desk'); const P = w.page
const navBtn = name => P.locator('#nav, header, nav, body').first().getByText(name, { exact: true }).first()
async function clickNav(name) {
  const el = P.locator('a, button').filter({ hasText: new RegExp('^' + name + '$') }).first()
  const b = await el.boundingBox(); await P.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
}
const state = () => P.evaluate(() => {
  const vis = e => e && e.getBoundingClientRect().height > 0
  const pages = [...document.querySelectorAll('[id^="page-"]')].filter(vis).map(e => e.id)
  const lw = document.querySelector('#page-leavewar'); const lwVis = vis(lw)
  const sc = document.scrollingElement
  const scrollers = [...document.querySelectorAll('[id^="page-"]')].filter(vis).map(e => ({ id: e.id, top: Math.round(e.scrollTop) }))
  const first = [...document.querySelectorAll('[id^="page-"]')].filter(vis)[0]
  const fr = first ? first.getBoundingClientRect() : null
  return { pages, lwVisible: lwVis, winY: Math.round(sc.scrollTop), winMax: Math.round(sc.scrollHeight - innerHeight), scrollers, firstTop: fr ? Math.round(fr.top) : null, slim: !!document.querySelector('[data-testid="appr-slim"]') && vis(document.querySelector('[data-testid="appr-slim"]')), appr: !!document.querySelector('[data-testid="approvals-page"]') && vis(document.querySelector('[data-testid="approvals-page"]')) }
})
async function leaveAndWatch(tag, page) {
  const samples = []
  await clickNav(page)
  for (const ms of [50, 150, 400, 900, 1800]) { await P.waitForTimeout(ms === 50 ? 50 : ms - samples.t || 100); samples.push({ ms, ...(await state()) }) }
  await shot(w, `${tag}-at-${page.replace(/\s/g, '')}`)
  return samples
}
const ok = (s) => s.every(x => !x.lwVisible && x.winY === 0 && x.scrollers.every(k => k.top === 0))
async function scenario(tag, route) {
  // set-up: Approvals, scroll a little for realism, then route
  await L.openGrid(w); await L.openApprovals(w)
  await P.evaluate(() => window.scrollTo(0, 0))
  if (route === 'slim') { await pressLoc(w, lineLoc(P, 'Fri 23 Jan').locator('[data-testid="appr-dates"]')); await P.waitForTimeout(1200) }
  const before = await state(); console.log(tag, 'before leaving', JSON.stringify(before))
  await shot(w, `${tag}-0-before-leaving`)
  const res = {}
  for (const pg of ['Edit Schedule', 'Inputs']) {
    const s = await leaveAndWatch(`${tag}-${pg === 'Inputs' ? 'inputs' : 'edit'}`, pg)
    res[pg] = s
    console.log(tag, pg, JSON.stringify(s.map(x => ({ ms: x.ms, pages: x.pages, lw: x.lwVisible, winY: x.winY, sc: x.scrollers, firstTop: x.firstTop }))))
    rec(`F6.${tag} ${pg}: opens at its top, no Leave War showing, no jump over 1.8 s`, 'desk', ok(s) ? 'PASS' : 'FAIL', JSON.stringify(s.map(x => `${x.ms}ms win=${x.winY} lw=${x.lwVisible} pages=${x.pages}`)), [`${tag}-${pg === 'Inputs' ? 'inputs' : 'edit'}-at-${pg.replace(/\s/g, '')}`])
    if (pg === 'Edit Schedule') { /* go directly to Inputs from here */ }
  }
  // come back
  await clickNav('Leave War'); await P.waitForTimeout(1500)
  const back = await state(); await shot(w, `${tag}-3-back`)
  console.log(tag, 'after returning', JSON.stringify(back))
  return { before, back }
}
try {
  await L.signIn(w, 'admin')
  // lit a line first so "as left" is visible
  await L.openApprovals(w)
  await pressLoc(w, A.approveBtn(P, 'Thu 8 Jan')); await P.waitForTimeout(400)
  const a = await scenario('slim', 'slim')
  rec('F6.slim back in the Leave War: the grid and Approvals as left (slim bar route)', 'desk', a.back.lwVisible ? 'PASS' : 'FAIL', `before ${JSON.stringify({ slim: a.before.slim, appr: a.before.appr })}; after ${JSON.stringify({ lw: a.back.lwVisible, slim: a.back.slim, appr: a.back.appr, pages: a.back.pages, winY: a.back.winY })} (judge on the picture)`, ['slim-3-back'])
  const b = await scenario('page', 'page')
  rec('F6.page back in the Leave War: Approvals as left (page route)', 'desk', b.back.lwVisible ? 'PASS' : 'FAIL', `before ${JSON.stringify({ slim: b.before.slim, appr: b.before.appr })}; after ${JSON.stringify({ lw: b.back.lwVisible, slim: b.back.slim, appr: b.back.appr, pages: b.back.pages, winY: b.back.winY })} (judge on the picture)`, ['page-3-back'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'f6-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close(); L.writeResults('f6'); await L.closeBrowser(); console.log('DONE')
