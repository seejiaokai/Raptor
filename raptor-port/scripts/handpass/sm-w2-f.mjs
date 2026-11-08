// W2 part F: S4 next week damaged (preview), S15 older week (am removed), S3 Admin delete on U, S5 print/export controls, S14 publish reachability.
import * as L from './sm-lib.mjs'
import { readFileSync } from 'node:fs'
const size = process.env.SZ || 'pc'
console.log('sm-w2-f v1', size)
const OUT = L.outDir('w2')
const ORIGIN = 'http://localhost:4393'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const s3 = JSON.parse(readFileSync(SCR + '/w2-state3.json', 'utf8'))
const log = (k, v) => console.log(k, JSON.stringify(v))
const S = async (k, fn) => { try { log(k, await fn()) } catch (e) { log(k, { ERR: e.message.split('\n')[0] }) } }
const full = W => { const v = W.page.viewportSize(); return { x: 0, y: 0, width: v.width, height: v.height } }
const noticeWords = page => page.evaluate(() => [...new Set([...document.querySelectorAll('#eWeek .dprev-bar, #eWeek .dayunsup, #eWeek section.day *')].filter(e => e.children.length === 0 && e.getBoundingClientRect().width > 0 && /saved copy|older version|device that created/i.test(e.textContent)).map(e => e.textContent.replace(/\s+/g, ' ').trim()))])

/* ---- S4: damage next week's Tuesday row ---- */
{
  const key = 'raptor:weeks/20-07-2026#1'
  const N = await L.launch(size, { origin: ORIGIN, state: s3, init: { fn: k => { try { if (!sessionStorage.getItem('smdone')) { localStorage.setItem(k, '{"broken'); sessionStorage.setItem('smdone', '1') } } catch (e) {} }, arg: key } })
  await L.signIn(N); await L.goEdit(N)
  await S('s4.week13', async () => ({ notices: (await noticeWords(N.page)).length, rowsOnDays: await N.page.evaluate(() => [...document.querySelectorAll('#eWeek section.day')].map(d => d.dataset.day + ':' + d.querySelectorAll('.pl-row').length)) }))
  await S('s4.preview', () => N.page.evaluate(() => { const ds = [...document.querySelectorAll('#eWeek section.day')]; return ds.slice(7).map(d => ({ day: d.dataset.day, head: d.textContent.trim().slice(0, 18), rows: d.querySelectorAll('.pl-row').length, w: Math.round(d.getBoundingClientRect().width), notice: /saved copy/.test(d.textContent) })) }))
  if (size === 'pc') {
    await N.page.evaluate(() => { const d = document.querySelector('#eWeek section.day[data-day="8"]') || document.querySelectorAll('#eWeek section.day')[8]; if (d) d.scrollIntoView({ inline: 'center', block: 'nearest' }) }); await L.sleep(800)
    await L.pic(N, OUT, 's4-pc-edit-preview-tue21', { clip: full(N) })
  }
  await N.page.evaluate(() => window.go('viewsched')); await L.sleep(1200)
  await S('s4.view.preview', () => N.page.evaluate(() => { const ds = [...document.querySelectorAll('#vWeek section.day')]; return ds.slice(7).map(d => ({ day: d.dataset.day, rows: d.querySelectorAll('.pl-row').length, notice: /saved copy/.test(d.textContent) })) }))
  await L.goEdit(N)
  await S('s4.load20', async () => { await N.page.locator('[data-wk="20/07/2026"]').filter({ visible: true }).first().click(); await L.sleep(2000); return { words: await noticeWords(N.page), days: await N.page.evaluate(() => [...document.querySelectorAll('#eWeek section.day')].slice(0, 7).map(d => d.dataset.day + ':' + d.querySelectorAll('.pl-row').length + ':' + /saved copy/.test(d.textContent))) } })
  await L.pic(N, OUT, `s4-${size}-week20-loaded`, { clip: full(N) })
  log('s4.errs', N.errs); await L.closeAll(N)
}

/* ---- S15: older-version week: remove `am` from the week row ---- */
{
  const O = await L.launch(size, { origin: ORIGIN, state: s3, init: { fn: () => { try { if (sessionStorage.getItem('smdone')) return; const k = Object.keys(localStorage).find(x => /weeks\/13-07-2026$/.test(x)); if (!k) return; const o = JSON.parse(localStorage.getItem(k)); delete o.am; localStorage.setItem(k, JSON.stringify(o)); sessionStorage.setItem('smdone', '1') } catch (e) {} }, arg: null } })
  await L.signIn(O); await L.goEdit(O)
  await S('s15.notice', async () => ({ words: await noticeWords(O.page), days: await O.page.evaluate(() => [...document.querySelectorAll('#eWeek section.day')].slice(0, 7).map(d => d.dataset.day + ':' + d.querySelectorAll('.pl-row').length)) }))
  await L.center(O.page, '#eWeek section.day[data-day="2"]'); await L.sleep(400)
  await L.pic(O, OUT, `s15-${size}-day2`, { sel: '#eWeek section.day[data-day="2"]' })
  await S('s15.refusal', async () => {
    await L.fillNew(O, { who: 'Saint', type: 'Meeting', iso: '2026-07-16', remarks: 'older week' })
    await O.page.locator('#inpEditSave').click(); await L.sleep(600)
    return { toast: await L.toastText(O.page) }
  })
  await L.pic(O, OUT, `s15-${size}-refusal`, { clip: full(O) })
  log('s15.errs', O.errs); await L.closeAll(O)
}

/* ---- U: S3, S5, S14 ---- */
const U = await L.launch(size, { origin: ORIGIN, state: s3, init: L.damageInit('raptor:weeks/13-07-2026#2') })
await L.signIn(U); await L.goEdit(U)
await S('s5.controls.edit', () => U.page.evaluate(() => [...document.querySelectorAll('button, a, [role=button]')].filter(b => b.getBoundingClientRect().width > 0 && /print|pdf|export|download|csv|spreadsheet|xls/i.test((b.textContent || '') + (b.title || '') + (b.id || '') + (b.getAttribute('aria-label') || ''))).map(b => (b.id || '') + '|' + b.textContent.trim().slice(0, 30) + '|' + (b.title || ''))))
await U.page.evaluate(() => window.go('viewsched')); await L.sleep(1200)
await S('s5.controls.view', () => U.page.evaluate(() => [...document.querySelectorAll('button, a, [role=button]')].filter(b => b.getBoundingClientRect().width > 0 && /print|pdf|export|download|csv|spreadsheet|xls/i.test((b.textContent || '') + (b.title || '') + (b.id || '') + (b.getAttribute('aria-label') || ''))).map(b => (b.id || '') + '|' + b.textContent.trim().slice(0, 30) + '|' + (b.title || ''))))
await S('s14.controls', () => U.page.evaluate(() => [...document.querySelectorAll('#vWeek button, #eWeek button')].filter(b => b.getBoundingClientRect().width > 0 && /publish|amend|sign/i.test(b.textContent + (b.title || ''))).map(b => b.textContent.trim().slice(0, 30))))
// S3: Admin delete person
await U.page.evaluate(() => window.go('admin')); await L.sleep(1500)
await S('s3.admin', () => U.page.evaluate(() => ({ tabs: [...document.querySelectorAll('[data-testid^="admin"],[role=tab],.admtab,button')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.dataset.testid || '') + ':' + b.textContent.trim().slice(0, 18)).slice(0, 40) })))
await L.pic(U, OUT, `s3-${size}-admin`, { clip: full(U) })
log('errs', U.errs); await L.closeAll(U)
console.log('DONE')
