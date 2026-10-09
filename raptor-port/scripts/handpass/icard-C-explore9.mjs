import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('desk', 'ad')
const p = w.page
await L.go(p, 'inputs'); await L.toCal(w)
await p.locator('[data-testid="in-gear"]').click(); await sleep(500)
console.log('memberfile checked by default:', await p.locator('[data-testid="iset-memberfile"]').isChecked())
console.log(await p.locator('[data-testid="iset-memberfile"]').evaluate(e => e.closest('label,div').innerText))
await w.browser.close()
