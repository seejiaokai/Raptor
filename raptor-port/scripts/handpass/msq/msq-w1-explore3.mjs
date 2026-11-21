/* msq-w1-explore3 v1 — W1 adds a ground item as ad9 and reads what the row offers */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = 'explore3'
const X = await import('./msq-lib.mjs')
const { say, sleep } = X
say('msq-w1-explore3 v1')
const w = await X.open({ phone: false, user: 'ad9' })
const { page } = w
await X.W.board(w, 2); await sleep(800)
await X.W.press(w, '[data-gradd="2"]', { scope: 'board' })
await sleep(800)
await X.pic(w, 'e3-after-add')
const info = await page.evaluate(() => {
  const sec = [...document.querySelectorAll('#schedBoard *')].find(e => /GROUND PROGRAMME/.test(e.innerText || '') && e.querySelector('[data-gradd]') && e.offsetWidth > 0 && e.querySelectorAll('[data-gradd]').length === 1 && e.innerText.length < 600)
  const root = sec || document.querySelector('#schedBoard')
  return [...root.querySelectorAll('input,textarea,select,button,[data-gr],[data-gslot],[data-seat],[data-slot]')].filter(e => e.offsetWidth > 0).map(e => e.tagName + '|' + (e.id || '') + '|' + [...e.attributes].filter(a => /^data-|placeholder/.test(a.name)).map(a => a.name + '=' + a.value).join(',') + '|' + (e.value || e.innerText || '').replace(/\s+/g, ' ').slice(0, 25)).slice(0, 60)
})
say('GROUND', JSON.stringify(info))
await X.fin(w)
