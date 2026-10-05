/* P1-06 — the removed button across roles and sizes. HP_PHONE=1 for the phone. */
import * as S from './stk2-M-alib.mjs'
const { world, L, W, pic, row, judge, savePart, sleep } = S
const PHONE = !!process.env.HP_PHONE
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const log = (...a) => console.log(...a)

async function report(p, label) {
  return p.evaluate(() => {
    const vis = e => { if (!e.checkVisibility()) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight }
    const hit = e => { const r = e.getBoundingClientRect(); if (!(r.width > 0 && r.bottom > 0 && r.top < innerHeight)) return 'offscreen'; const x = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1), y = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1); const t = document.elementFromPoint(x, y); return !!t && (t === e || e.contains(t)) }
    const bd = document.querySelector('#schedBoard'), root = bd && vis(bd) ? bd : document
    const q = s => [...root.querySelectorAll(s)].filter(vis)
    const size = e => { const r = e.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height) }
    const names = ['#logout', '#insightBtn', '#histBtn', '#roleBadge', '#burger', '#alPanel .abtn', '[data-alpub]', '[data-beak]', '[data-unpub]']
    const ctl = {}
    names.forEach(n => { const e = q(n)[0]; if (e) ctl[n] = { txt: (e.innerText || '').trim().slice(0, 24), size: size(e), hit: hit(e), disabled: !!e.disabled } })
    const all = [...document.querySelectorAll('button, [role=button], a')].filter(e => /discard\s+marks/i.test((e.textContent || '') + (e.title || '') + (e.getAttribute('aria-label') || '')))
    return { page: window.CURPAGE, role: (document.querySelector('#roleBadge') || {}).innerText || null, alDrop: document.querySelectorAll('#alDrop').length, discardInDom: all.length, discardInText: /discard\s+marks/i.test(document.body.textContent), panelVisible: !!q('#alPanel').length, alpubVisible: q('[data-alpub]').length, ctl }
  })
}

// fixture: Monday published then edited (a published day with a pending change); Tuesday unpublished with an edit; Thu unpublished edit
await S.publishNew(p, 0); await S.closeBoard(p)
await S.weekText(p, 'fr:0.0.0.0', 'D488 P1-06 MON PENDING')
await S.weekText(p, 'dn:1.0', 'D488 P1-06 TUE DRAFT')
await S.weekText(p, 'dn:3.0', 'D488 P1-06 THU DRAFT')
const pend = { mon: await S.pendingKeys(p, 0), tue: await S.pendingKeys(p, 1), thu: await S.pendingKeys(p, 3) }
log('pend', JSON.stringify(pend))
await S.W.showDay(p, 0)

const out = {}
// admin
out.admin = await report(p, 'admin')
const picA = await pic(p, 'P1-06-a-admin-week')
await S.toBoard(p, 0)
out.adminBoard = await report(p, 'admin board')
const picB = await pic(p, 'P1-06-b-admin-board')
await S.closeBoard(p)

// member view (the admin's own switch)
async function switchView() {
  if (PHONE) { await p.locator('#burger').click(); await sleep(400); await p.locator('.drawer-row button', { hasText: /member view|admin view/i }).first().click(); await sleep(700) }
  else { await p.locator('#roleBadge').click(); await sleep(700) }
}
await switchView()
out.memberView = await report(p, 'member view')
const picC = await pic(p, 'P1-06-c-member-view')
await L.go(p, 'viewsched'); await sleep(300)
out.memberViewSched = await report(p, 'member view on View-only Sched')
await switchView()   // back to admin
out.backToAdmin = await report(p, 'back as admin')

// a real member
if (PHONE) { await p.locator('#burger').click(); await sleep(400); await p.locator('#drawerLogout').click() } else await p.locator('#logout').click()
await sleep(700)
await L.signIn(p, 'm', { goto: false })
out.member = await report(p, 'member')
const picD = await pic(p, 'P1-06-d-member')
await L.go(p, 'editsched').catch(() => {}); await sleep(300)
out.navItems = await p.evaluate(() => [...document.querySelectorAll('.nav [data-page]')].filter(e => e.checkVisibility()).map(e => e.innerText.trim()))
const picE = await pic(p, 'P1-06-e-member-nav')
log(JSON.stringify(out, null, 1))
const bad = k => { const o = out[k]; return o.alDrop > 0 || o.discardInDom > 0 || o.discardInText }
judge('P1-06' + (PHONE ? '-phone' : '-desk'), 'draft changes (Tue, Thu) + published Mon with a pending change; inspected as admin, admin-as-member, then real member', [
  ['fixture: a draft day and a published day each carry marks', pend.mon.length === 1 && pend.tue.length === 1 && pend.thu.length === 1, pend],
  ['admin: no Discard marks anywhere (not even hidden)', !bad('admin') && !bad('adminBoard'), { a: out.admin.discardInDom, b: out.adminBoard.discardInDom }],
  ['member view: none', !bad('memberView') && !bad('memberViewSched'), {}],
  ['real member: none, and no Publish AL / panel', !bad('member') && out.member.alpubVisible === 0 && !out.member.panelVisible, { alpub: out.member.alpubVisible, panel: out.member.panelVisible }],
  ['admin: the Publish controls are what a finger lands on', Object.values(out.adminBoard.ctl).every(c => c.hit === true || c.hit === 'offscreen'), out.adminBoard.ctl],
], [picA, picB, picC, picD, picE])
console.log(errors)
savePart('p1b')
await browser.close()
