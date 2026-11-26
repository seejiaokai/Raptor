// k0p-lw-probe - what the Leave War of the world shows a member (Ranger): toolbar controls, leave inputs, award cells
import { mk, signIn, go, FACT, closeAll, WORLD, wait, ERRS, world } from './k0p-lib.mjs'
console.log('k0p-lw-probe v1')
try {
  await world()
  const s = await mk('d', { storageState: WORLD })
  await signIn(s, 'ranger'); await go(s, 'leavewar'); await wait(s, 1500)
  FACT('bridge', await s.page.evaluate(() => ({ INPUTS: typeof window.INPUTS, lwSetMemberToday: typeof window.lwSetMemberToday, fileInput: typeof window.fileInput })))
  FACT('testids', await s.page.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid).filter(t => !/^cell-|^row-/.test(t)))].slice(0, 80)))
  FACT('rows', await s.page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].slice(0, 6).map(e => e.dataset.testid)))
  FACT('cells', await s.page.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="cell-"]')].filter(e => (e.textContent || '').trim()); return { n: c.length, sample: c.slice(0, 60).map(e => e.dataset.testid + '=' + e.textContent.trim().slice(0, 6)) } }))
  FACT('leaveInputs', await s.page.evaluate(() => (window.INPUTS || []).filter(x => /LL|AL|CL|ML|leave/i.test(x.type || '')).slice(0, 15).map(x => ({ p: x.person, t: x.type, d: x.date, yr: x.yr }))))
  FACT('headerText', await s.page.evaluate(() => document.querySelector('.page.on')?.innerText.slice(0, 400)))
  await s.page.screenshot({ path: 'C:/Users/User/AppData/Local/Temp/claude/00ab7012662cb686/8de3d66f-3385-4e5a-81b9-b2ffa5bbbba2/scratchpad/lw-probe.png' })
  await s.ctx.close()
} finally { FACT('errors', ERRS); await closeAll() }
