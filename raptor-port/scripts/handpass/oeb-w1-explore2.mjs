console.log('oeb-w1-explore2 v1')
import { launch, closeAll, open, oilOn, sleep, pic, BAR, toTop } from './oeb-w1-lib.mjs'
const W = await launch(process.argv[2] || 'pc', { saved: true })
try {
  await open(W)
  console.log('men on Sat:', await W.page.evaluate(() => window.DAYS[5] && Object.keys(window.DAYS[5]).join(',')))
  console.log('day heads:', await W.page.evaluate(() => [...document.querySelectorAll('#schedBoard .dchip, #schedBoard [data-sbday]')].map(e => e.innerText.trim()).join(' | ')))
  await oilOn(W)
  console.log(await W.page.evaluate(() => ({
    pucks: [...document.querySelectorAll('#schedBoard .puck')].filter(p => p.getBoundingClientRect().width > 0 && !p.closest('.rpuck')).map(p => p.innerText.trim().replace(/\n/g, '/') + ' [' + p.className + '] <' + p.parentElement.className + '>').slice(0, 80),
    marks: [...document.querySelectorAll('#schedBoard [data-oilitem], #schedBoard .oilmark, #schedBoard [data-oilev]')].slice(0, 10).map(e => e.outerHTML.slice(0, 160)),
    panels: [...document.querySelectorAll('#schedBoard .sb-panel')].map(p => (p.querySelector('.sb-ph')?.innerText || p.className).trim().slice(0, 40)),
  })))
  console.log(W.errs)
} finally { await closeAll(W) }
