// A probe (not a drawing): what Sat 4 Jul's OIL box opens on the Leave War, and which days carry an input-earned credit.
import * as K from './kit.mjs'
const { b, p, sz } = await K.world('d')
await K.signIn(p, 'ad', 'a')
await K.go(p, 'leavewar')
await p.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await K.wait(p, 900)
const m = p.locator('[data-testid="month-july"]').filter({ visible: true }).first()
if (await m.count()) { await m.click(); await K.wait(p, 900) }
const cells = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"][data-testid*="-2026-07-0"]')].map(e => e.getAttribute('data-testid') + '=' + e.textContent.replace(/\s+/g, ' ').trim()).filter(s => /=.*\S/.test(s)).slice(0, 60))
K.log('july 1-9 boxes with text', JSON.stringify(cells))
const c = p.locator('[data-testid="cell-ammo-2026-07-04"]').first()
await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await c.click(); await K.wait(p, 1200)
const txt = await p.evaluate(() => { const d = [...document.querySelectorAll('[role="dialog"], .bidsheet, [data-testid^="win-"]')].filter(e => e.getBoundingClientRect().width > 0); return d.map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 900)) })
K.log('opened', JSON.stringify(txt))
await p.screenshot({ path: K.STATE + '/probe-f7.png' })
K.log('errors', JSON.stringify(p.errs))
await b.close()
