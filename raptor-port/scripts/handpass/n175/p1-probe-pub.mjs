// p1-probe-pub - finding controls only: can Monday be signed and published by presses, and what the Plans menu then offers.
import { mk, closeAll, signIn, go, wait, vis, hit, scratch, askNow } from './p1-lib.mjs'
const s = await mk('d')
const say = (...a) => console.log(...a)
try {
  await signIn(s, 'ad', 'a'); await go(s, 'editsched'); await wait(s, 800)
  const sels = s.page.locator('.page.on select[data-signday="0"]')
  say('signs', await sels.count())
  for (let i = 0; i < await sels.count(); i++) {
    const opts = await sels.nth(i).evaluate(e => [...e.options].map(o => o.value).filter(Boolean))
    say(i, await sels.nth(i).getAttribute('data-sign'), opts.slice(0, 5))
    await sels.nth(i).selectOption(opts.includes('saber') ? 'saber' : opts[0]); await wait(s, 300)
  }
  say('beak', await s.page.locator('.page.on [data-beak="0"]').first().evaluate(e => e.className + ' | ' + e.textContent))
  await hit(s, '.page.on [data-beak="0"]', 800)
  say('ask', JSON.stringify(await askNow(s)))
  for (const b of ['#dlgOk', 'button:has-text("Publish")']) { const l = vis(s, b); if (await l.count()) { say('press', b, await l.first().textContent()); await hit(s, l.first(), 900); break } }
  say('ask2', JSON.stringify(await askNow(s)))
  say('after', await s.page.evaluate(() => [...document.querySelectorAll('.page.on .dbeak, .page.on .planselbtn, .page.on .vertag')].slice(0, 6).map(e => e.textContent.trim())))
  await scratch(s, 'probe-pub-1')
  await hit(s, '.page.on .planselbtn[data-planmenu="0"]', 700)
  say('menu', await s.page.evaluate(() => [...document.querySelectorAll('[role=menu] button, [role=menuitem], .planmenu *')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.className + ':' + e.textContent.trim()).slice(0, 80)).slice(0, 20)))
  await scratch(s, 'probe-pub-2')
} catch (e) { say('ERR', String(e).split('\n')[0]) } finally { await closeAll() }
