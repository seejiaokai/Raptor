/* P3-04 templates, P3-05 saved plans */
import * as C from './stk2-Q-lib.mjs'
import { handPut } from './seat-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)
const CREW = ['Saber', 'Echo']
const mixNow = async p => C.mixOf(await C.insightsRead(p), ...CREW)
const fm = (p, di) => p.evaluate(i => { const f = window.DAYS[i].waves[0].formations[0]; return `${f.cs}/${f.msn}/${f.aircraft.map(a => a.rmks + '[' + a.p + ',' + a.w + ']').join(' ; ')}` }, di)

async function setup(answer = 'red', text = 'DS FOR RU') {
  const w = await C.world()
  const p = w.p
  await C.tracking(p, true)
  await C.board(p, 0)
  await C.bset(p, 'ff:0.0.0.msn', 'ACM')
  await C.bset(p, 'fr:0.0.0.0', text)
  if ((await C.question(p)).nQ) await C.side(p, answer)
  return w
}
async function chosen(p, di) { return C.openQuestion(p, di, { published: false }) }

async function p304() {
  const { browser, p } = await setup('red')
  const pics = []
  try {
    const base0 = await mixNow(p)
    await p.locator('#sbTpl').click(); await C.sleep(300)
    await p.locator('[data-daytplsave]').click(); await C.sleep(600)
    const modalTxt = await p.evaluate(() => { const m = document.querySelector('#daytplModal'); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 300) : null })
    pics.push(await C.pic(p, 'p304-save'))
    await p.locator('#daytplClose').click(); await C.sleep(400)
    // Tuesday before
    await C.board(p, 1)
    const tueBefore = await fm(p, 1)
    const mixBefore = await mixNow(p)
    await p.locator('#sbTpl').click(); await C.sleep(300)
    const pick = p.locator('[data-daytplpick]').first()
    const nTpl = await p.locator('[data-daytplpick]').count()
    await pick.click(); await C.sleep(900)
    // may ask confirmation
    const conf = await p.evaluate(() => { const c = document.querySelector('.confirm, .cfm, [data-cfm]'); return c ? c.innerText.slice(0, 100) : null })
    const tueApplied = await fm(p, 1)
    const put1 = await handPut(p, '1.0.0.0.p', 'stiff'); const put2 = await handPut(p, '1.0.0.0.w', 'freak')
    const qTue = await chosen(p, 1)
    pics.push(await C.pic(p, 'p304-tue-applied'))
    await p.locator('#schedBoard [data-bfld="fr:1.0.0.0"]').first().press('Tab'); await C.sleep(300)
    const mixApplied = await mixNow(p)
    // change Tuesday's answer to Blue
    await chosen(p, 1)
    await C.side(p, 'blue')
    const mixTueBlue = await mixNow(p)
    pics.push(await C.pic(p, 'p304-tue-blue'))
    // Monday unchanged?
    await C.board(p, 0)
    const qMon = await chosen(p, 0)
    pics.push(await C.pic(p, 'p304-mon'))
    await p.locator('#schedBoard [data-bfld="fr:0.0.0.0"]').first().press('Tab'); await C.sleep(300)
    const mixMon = await mixNow(p)
    // history of the week
    await C.board(p, 1)
    const hist = await C.histRead(p, { tab: 'All changes' })
    // Undo / Redo
    const steps = []
    for (const [dir, n] of [['undo', 4], ['redo', 4]]) for (let i = 1; i <= n; i++) {
      const d = await W.door(p, 'board', dir)
      steps.push(`${dir}${i} ${J((d.toasts && d.toasts[0]) || d.title)} → Tue ${await fm(p, 1)}, Insights ${await mixNow(p)}`)
      if (i === 4) pics.push(await C.pic(p, 'p304-after-4-' + dir))
    }
    const hist2 = await C.histRead(p, { tab: 'All changes' })
    C.row('P3-04', 'saved Mon (VL ACM "DS FOR RU", answered Red) as a day template; applied it to Tue from Templates; on Tue pressed Change mission role → Blue; looked at Mon; Undo ×2 then Redo ×2 on the board bar; read the Changes window',
      `before: Insights ${base0}; template modal ${J(modalTxt)} (templates listed ${nTpl}). Tue before: ${tueBefore}, Insights ${mixBefore}. Applied: Tue ${tueApplied} (crew placed by hand: ${put1.took}/${put2.took}, now ${await fm(p, 1)}); confirm ${J(conf)}; Tue Remarks door: ${J(qTue)}; Insights ${mixApplied}. Tue answer → Blue: Insights ${mixTueBlue}. Monday: Remarks door ${J(qMon)}, Insights ${mixMon}. Changes window (All changes): ${hist.text}. Undo/Redo steps: ${steps.join(" || ")}. Changes after: ${hist2.text}`,
      'RECORD', pics)
  } catch (e) { C.row('P3-04', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p304-error')]) }
  finally { await browser.close() }
}

async function p305() {
  const { browser, p } = await setup('red', 'DS FOR RU')
  const pics = []
  try {
    const mixA = await mixNow(p)
    await C.menuOpen(p)
    const menu0 = await p.evaluate(() => [...document.querySelectorAll('.wavemenu button')].map(e => [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',') + '|' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 50)))
    await p.locator('[data-plandup]').first().click(); await C.sleep(900)
    pics.push(await C.pic(p, 'p305-dup'))
    const nowB = await fm(p, 0)
    // plan B: different wording answered Blue
    await C.bset(p, 'fr:0.0.0.0', 'DS FROM RU')
    const qB = await C.question(p)
    if (qB.nQ) await C.side(p, 'blue')
    const mixB = await mixNow(p)
    pics.push(await C.pic(p, 'p305-planB'))
    await C.menuOpen(p)
    const menu1 = await p.evaluate(() => [...document.querySelectorAll('.wavemenu button')].map(e => [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',') + '|' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 50)))
    await p.keyboard.press('Escape'); await C.sleep(200)
    // switch to the other plan (A) through the menu: the entry that is not "live now" / not the one we are on
    async function switchTo(name) {
      await C.menuOpen(p)
      const sel = p.locator('.wavemenu [data-plansel]').filter({ hasText: name }).first()
      if (await sel.count()) { await sel.click(); await C.sleep(900); return 'switched to ' + name }
      const live = p.locator('.wavemenu [data-plangolive]').filter({ hasText: name }).first()
      await p.keyboard.press('Escape'); await C.sleep(200)
      return (await live.count()) ? name + ' already live' : 'no entry ' + name
    }
    const read = async tag => {
      const f = await fm(p, 0)
      const qa = await C.question(p)
      const door = await C.doorLabel(p, 0)
      const mix = await mixNow(p)
      pics.push(await C.pic(p, 'p305-' + tag))
      return `${tag}: formation ${f}; question on arrival ${qa.nQ}; Remarks door says ${J(door.label)} (question open ${door.nQ}); Insights ${mix}`
    }
    const logs = []
    logs.push(await read('B-current'))
    logs.push('→A: ' + await switchTo('Plan A')); logs.push(await read('A-after-switch'))
    logs.push('→B: ' + await switchTo('Plan B')); logs.push(await read('B-after-switch'))
    logs.push('→A: ' + await switchTo('Plan A')); logs.push(await read('A-again'))
    // reload and read both
    await C.sleep(1200)
    await p.reload(); await L.signIn(p, 'a', { goto: false })
    await C.board(p, 0)
    logs.push('after reload ' + await read('after-reload-A'))
    logs.push('→B: ' + await switchTo('Plan B')); logs.push(await read('after-reload-B'))
    C.row('P3-05', 'Mon VL ACM "DS FOR RU" answered Red (the live working copy = plan A); + Alt Plan from the plan menu → plan B, wording → "DS FROM RU", answered Blue; switched A→B→A through the menu; reload; B again',
      `A before: ${mixA}. menu before: ${J(menu0)}; after dup the formation on screen: ${nowB}. B after edits: Insights ${mixB}; menu: ${J(menu1)}. ${logs.join(' || ')}`,
      'CHECK', pics)
  } catch (e) { C.row('P3-05', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p305-error')]) }
  finally { await browser.close() }
}
const only = (process.env.ONLY || 'p304,p305').split(',')
if (only.includes('p304')) await p304()
if (only.includes('p305')) await p305()
C.save('b')
