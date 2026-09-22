/* RULES SWEEP 11 — D18's "the crowd beside him never buries it or PAYS HIM
   TWICE". The same man shows two pucks under one request item — where are they
   drawn, and is that two surfaces of one decision or two decisions? */
import { open, board, tap, shot, oilMode, openInputs, STATE } from './lib.mjs'
import { allPucks, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
await oilMode(page, true)
const where = await page.evaluate(() => { const b=document.querySelector('#schedBoard')
  const out={}
  for (const e of b.querySelectorAll('[data-oilp]')) { if(e.offsetParent===null) continue
    const k=e.dataset.oilp+'|'+e.dataset.oilitem; (out[k] ||= []).push(
      [e,e.parentElement,e.parentElement&&e.parentElement.parentElement,e.closest('.sb-arow,.sb-line,.pinp,.sbi-row,.sb-sec')]
        .filter(Boolean).map(x=>x.tagName+'.'+String(x.className).slice(0,24)).join(' < ')) }
  return Object.fromEntries(Object.entries(out).filter(([,v])=>v.length>1)) })
console.log('men drawn more than once under one item:')
console.log(JSON.stringify(where, null, 1).slice(0, 1800))
const key = Object.keys(where)[0]
if (key) { const [who, item] = key.split('|')
  const on0 = await page.evaluate(([w,i])=>[...document.querySelectorAll(`#schedBoard [data-oilp="${w}"][data-oilitem="${i}"]`)]
    .filter(e=>e.offsetParent!==null).map(e=>e.classList.contains('on')), [who,item])
  console.log('\nbefore tapping:', who, JSON.stringify(on0))
  await tap(page, `[data-oilp="${who}"][data-oilitem="${item}"]`); await page.waitForTimeout(600)
  console.log('said:', await toast(page))
  const on1 = await page.evaluate(([w,i])=>[...document.querySelectorAll(`#schedBoard [data-oilp="${w}"][data-oilitem="${i}"]`)]
    .filter(e=>e.offsetParent!==null).map(e=>e.classList.contains('on')), [who,item])
  console.log('after tapping ONE of them:', JSON.stringify(on1), '-> both moved together?', on1.every(v=>v===on1[0]))
  await shot(page, 'RULE-11-double-puck') }
console.log('\nerrors:', errors.slice(0,6))
await browser.close()
