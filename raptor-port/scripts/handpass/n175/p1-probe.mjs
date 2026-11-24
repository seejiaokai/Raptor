// p1-probe - finding controls only (not a case). node raptor-port/scripts/handpass/n175/p1-probe.mjs <d|p> <what>
import { mk, closeAll, signIn, go, wait, vis, hit, scratch } from './p1-lib.mjs'
const SZ = process.argv[2] || 'd', WHAT = process.argv[3] || 'edit'
const s = await mk(SZ)
const btns = sel => s.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${String(e.className).split(/\s+/).slice(0, 2).join('.')}${e.dataset && Object.keys(e.dataset).length ? ' ' + JSON.stringify(e.dataset).slice(0, 60) : ''} "${(e.textContent || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 40)}"`).slice(0, 120), sel)
try {
  await signIn(s, process.env.U || 'ad', process.env.P || 'a')
  if (WHAT === 'edit') { await go(s, 'editsched'); await wait(s, 800); console.log(await btns('.page.on button, .page.on [role=button]')) }
  if (WHAT === 'board') { await go(s, 'editsched'); await wait(s, 800); await hit(s, '.page.on .sb-open[data-sbday]', 1000); console.log(await btns('#schedBoard button, #schedBoard [role=button], #schedBoard [data-lcx], #schedBoard [data-pcx], #schedBoard [data-drcx]')); await scratch(s, `probe-board-${SZ}`) }
  if (WHAT === 'tracker') { await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 800); console.log(await btns('.page.on button, .page.on [role=button]')); await scratch(s, `probe-trk-${SZ}`) }
  if (WHAT === 'logic') { await go(s, 'logic'); await wait(s, 800); console.log(await btns('.page.on button, .page.on [role=button], .page.on input')); await scratch(s, `probe-logic-${SZ}`) }
  if (WHAT === 'quals') { await go(s, 'quals'); await wait(s, 800); console.log(await btns('.page.on button, .page.on [role=button]')); await scratch(s, `probe-quals-${SZ}`) }
  if (WHAT === 'inputs') { await go(s, 'inputs'); await wait(s, 800); console.log(await btns('.page.on button, .page.on [role=button]')); await scratch(s, `probe-inputs-${SZ}`) }
  if (WHAT === 'logicedit') { await go(s, 'logic'); await wait(s, 800); await hit(s, '#lgEdit', 800); console.log(await btns('.page.on button, .page.on input, .page.on select, .page.on [role=switch]')); await scratch(s, `probe-logicedit-${SZ}`) }
  if (WHAT === 'qualsedit') { await go(s, 'quals'); await wait(s, 800); await hit(s, '#qEdit', 800); console.log((await btns('.page.on button, .page.on input, .page.on [role=checkbox], .page.on td[data-q], .page.on [data-qual]')).slice(0, 60)); await scratch(s, `probe-qualsedit-${SZ}`) }
  if (WHAT === 'plans') { await go(s, 'editsched'); await wait(s, 800); for (const wk of ['06/07/2026', '13/07/2026']) { await hit(s, `.page.on button.wk[data-wk="${wk}"]`, 900); console.log(wk, await s.page.evaluate(() => [...document.querySelectorAll('.page.on .dbeak, .page.on .dstat, .page.on .vertag')].map(e => e.textContent.trim()).slice(0, 30))) } await hit(s, '.page.on .planselbtn', 700); console.log(await btns('[role=menu] button, [role=menu] [role=menuitem], .planmenu button')); await scratch(s, `probe-plans-${SZ}`) }
  if (WHAT === 'slot') { await go(s, 'editsched'); await wait(s, 800); console.log(await s.page.evaluate(() => [...document.querySelectorAll('.page.on [data-slot], .page.on [data-fill]')].slice(0, 12).map(e => e.outerHTML.slice(0, 160)))) }
  if (WHAT === 'view') { await go(s, 'viewsched'); await wait(s, 800); console.log(await btns('.page.on button, .page.on [role=button]')) }
} catch (e) { console.log('ERR', String(e).split('\n')[0]) } finally { await closeAll() }
void vis
