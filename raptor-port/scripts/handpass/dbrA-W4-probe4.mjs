/* W4 probe 4 (30 Sep 26) — read-only: Quals' archive buttons once editing is on. */
process.env.HP_URL ||= 'http://localhost:4204'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W4'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W4-probe.json'
const L = await import('./dbrA-lib.mjs')
const b = await L.launch(); const ctx = await L.context(b); const errors = []; const p = await L.page(ctx, errors)
await L.signIn(p, 'a'); await L.go(p, 'quals')
await p.click('#qViewA'); await L.sleep(300)
await p.click('#qEdit'); await L.sleep(400)
console.log(JSON.stringify(await p.evaluate(() => ({ arch: [...document.querySelectorAll('[data-arch]')].map(e => e.getAttribute('data-arch') + ':' + e.tagName + ':' + (e.offsetWidth > 0)).slice(0, 12), n: document.querySelectorAll('[data-arch]').length, pid: Object.keys(window.PEOPLE).filter(k => /razer|glass|dice|shaft|stiff|nact|mamba/.test(k)).map(k => k + '=' + window.PEOPLE[k].cs) }))))
await L.shot(p, '_probe4-quals-edit')
await b.close()
