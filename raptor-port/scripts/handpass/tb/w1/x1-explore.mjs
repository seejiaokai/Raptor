import * as L from '../../dl-lib.mjs'
console.log('w1 x1-explore v1')
const w = await L.world('phone')
const p = w.page
try {
  await L.go(w, 'inputs')
  console.log('tabs', await p.evaluate(() => [...document.querySelectorAll('#page-inputs button')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.id || '') + ':' + (b.textContent || '').trim().slice(0, 20)).join(' | ')))
  await w.press('#inListBtn'); await L.sleep(400)
  const nw = p.locator('#inNew')
  console.log('inNew visible', await nw.isVisible())
  if (!(await nw.isVisible())) {
    const lb = await p.evaluate(() => [...document.querySelectorAll('#page-inputs [id]')].map(e => e.id).slice(0, 60).join(','))
    console.log('ids', lb)
  } else {
    await w.press('#inNew'); await L.sleep(500)
    console.log('form', await p.evaluate(() => [...document.querySelectorAll('#inpEditPop input,#inpEditPop select,#inpEditPop textarea,#inpEditPop button')].map(e => e.tagName + '#' + e.id + '[' + (e.type || '') + ']=' + (e.value || '').slice(0, 20) + (e.tagName === 'SELECT' ? ' opts:' + [...e.options].map(o => o.value).slice(0, 40).join('/') : '')).join('\n')))
    await L.pic(w, 'x1-explore-form')
  }
} finally { await L.close(w) }
