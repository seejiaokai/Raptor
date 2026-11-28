// p6-cundo - P6 case C-undo (the code read's row C8): "Undo adding a squadron" - a master admin adds a squadron, then
// picks another: is the Undo offered there? Desktop. No set-up: Saber (master admin) signs in on 142, Admin → Squadrons
// → "+ New squadron": number 150, the first admin the list offers, Save. Then picks 149: the Undo button as drawn (its
// hover words, live or greyed) on Edit Schedule; then on Inputs. (P4 1a/1c pressed the same Undo across squadrons; this
// reads it once more on 149 for this roll-call - nothing is undone here.)
//   node raptor-port/scripts/handpass/n175/p6-cundo.mjs d
// Pictures: p6-cundo-d-1-on149 (Undo and the bar ringed)
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, reachPick, barSq, pageOn, toastNow, SEC } from './p6-lib.mjs'
const SZ = 'd', k = `p6.cundo.${SZ}`, P = `p6-cundo-${SZ}`
const undo = s => s.page.evaluate(() => [...document.querySelectorAll('#undoBtn, #redoBtn')].filter(e => e.getBoundingClientRect().width > 0).map(b => `${b.id}: "${(b.getAttribute('title') || b.getAttribute('aria-label') || b.textContent || '').trim()}"${b.disabled ? ' [greyed]' : ' live'}`))
try {
  console.log('p6-cundo v1', SZ)
  const s = await mk(SZ); const { page } = s
  try {
    await signIn(s, 'ad', 'a')
    await go(s, 'admin'); await wait(s, 700)
    if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back')
    const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Squadrons/ }); if (await t.count()) await hit(s, t.first(), 700)
    await hit(s, '#sqNew', 500)
    await vis(s, '#sqNewNum').first().click(); await page.keyboard.type('150')
    const opts = await page.locator('#sqNewAdmin').first().evaluate(e => [...e.options].map(o => ({ v: o.value, t: o.text }))).catch(() => [])
    const first = opts.find(o => o.v); if (first) await vis(s, '#sqNewAdmin').first().selectOption(first.v)
    await hit(s, '#sqNewSave', 1200)
    FACT(`${k}.1.added`, { squadron: await barSq(s), toast: await toastNow(s), firstAdmin: first?.t ?? null, undo: await undo(s) })
    const p = await reachPick(s, 149, 'bar'); FACT(`${k}.2.pick149`, { pressed: !!p.pressed, rows: p.listRows, squadron: await barSq(s) })
    await go(s, 'editsched'); await wait(s, 900)
    FACT(`${k}.3.on149EditSchedule`, { squadron: await barSq(s), page: await pageOn(s), undo: await undo(s) })
    await shot(s, `${P}-1-on149`, ['#undoBtn', '#sqnMenuBtn'], ['.topbar'], 8)
    await go(s, 'inputs'); await wait(s, 700)
    FACT(`${k}.4.on149Inputs`, { squadron: await barSq(s), page: await pageOn(s), undo: await undo(s) })
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
