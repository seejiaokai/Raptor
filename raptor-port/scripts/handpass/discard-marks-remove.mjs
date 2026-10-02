/* D488: operate the remaining edit / undo / publish doors on the exact production bundle.
   A fresh browser context owns its world; only reads use the localhost bridge. */
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
process.env.HP_URL ||= 'http://localhost:4226'
process.env.HP_SHOTS ||= resolve('docs/img/handpass/2026-10-02-discard-marks-remove')
const { open, login, board, type, publish, go } = await import('./lib.mjs')
// The historical shared helper tries the retired Close control. This walk uses today's Done.
const closeBoard = async page => {
  if (await page.locator('#schedBoard').isVisible()) {
    await page.locator('#sbDone').click()
    await page.locator('#schedBoard').waitFor({state:'hidden'})
  }
}
const sign = async page => {
  const sels=page.locator('#schedBoard .sb-sign select:visible')
  assert.equal(await sels.count(),4,'all four sign-offs must be on the board')
  for(let i=0;i<4;i++) {
    const opts=await sels.nth(i).locator('option').evaluateAll(es=>es.map(e=>e.value).filter(Boolean))
    assert.ok(opts.length); await sels.nth(i).selectOption(opts[Math.min(i,opts.length-1)])
  }
}
const pending = (page,di) => page.evaluate(i=>Object.keys(window.SCHED.pending).filter(k=>window.keyDay(k)===i),di)
const out = process.env.HP_SHOTS
mkdirSync(out, { recursive: true })
const results = []
for (const [name, width, height] of [['desktop',1440,900],['phone',390,844],['short',1440,700]].filter(v=>!process.argv[2]||v[0]===process.argv[2])) {
  const { browser, page, errors } = await open({ width, height })
  const check = async (label, fn) => { await fn(); results.push({ width:name, label, status:'PASS' }) }
  const shot = async label => page.screenshot({ path:resolve(out, `${name}-${label}.png`), fullPage:false })
  try {
    await go(page, 'editsched')
    await check('no Discard marks control on the edit week', async()=>{
      assert.equal(await page.locator('#alDrop').count(),0)
      assert.equal(await page.getByRole('button',{name:'Discard marks',exact:true}).count(),0)
    })
    await shot('week')
    const info = await page.evaluate(()=>({
      draft:window.DAYS.map((d,di)=>({di,orig:!!window.SCHED.orig?.[di],notes:d.notes})),
      panel:document.querySelector('#alPanel')?.textContent,
    }))
    writeFileSync(resolve(out,`${name}-inventory.json`),JSON.stringify(info,null,2))
    const draft = info.draft.find(d=>!d.orig && d.notes?.length)
    assert.ok(draft,'the fixture has a draft day with a note')
    const di=draft.di, key=`dn:${di}.0`
    if(process.argv[3]==='history') {
      await board(page,di)
      await type(page,`[data-bfld="${key}"]`,`D488 ${name} history note`)
      await closeBoard(page)
      await page.locator('#histBtn').click()
      const history=page.locator('.chgwin')
      await history.waitFor({state:'visible'})
      await history.getByRole('tab',{name:/All changes/}).click()
      await check('the visible change history retains ordinary edits and adds no marks-cleared line',async()=>{
        assert.ok(await history.locator('.cw-g').count())
        assert.ok(!/draft marks cleared/i.test(await history.innerText()))
        assert.ok((await pending(page,di)).length)
      })
      await shot('history-open')
      assert.deepEqual(errors,[])
      results.push({width:name,label:'browser errors',status:'PASS'})
      continue
    }
    const [other,held]=info.draft.filter(d=>d.di!==di&&!d.orig&&d.notes?.length).slice(0,2).map(d=>d.di)
    assert.ok(other!=null&&held!=null,'two adjacent draft days provide isolation evidence')
    await board(page, di)
    await type(page, `[data-bfld="${key}"]`, `D488 ${name} draft note`)
    await check('draft editing retains a pending mark and its history', async()=>{
      const s=await page.evaluate(i=>({pending:Object.keys(window.SCHED.pending).length,orig:!!window.SCHED.orig?.[i],lines:window.ELOG?.rows?.filter(r=>r.di===i).map(r=>r.lbl)||[]}),di)
      assert.equal(s.orig,false); assert.ok(s.pending>0)
      assert.ok(s.lines.length>0); assert.ok(!s.lines.some(l=>/draft marks cleared/i.test(l)))
    })
    await shot('draft-edited')
    const note = () => page.locator(`#schedBoard [data-bfld="${key}"]:visible`).first()
    await check('Undo then Redo preserves the ordinary draft edit', async()=>{
      await page.locator('#sbUndo').click()
      await page.waitForFunction(([k,t])=>document.querySelector(`#schedBoard [data-bfld="${k}"]`)?.value!==t,[key,`D488 ${name} draft note`])
      await page.locator('#sbRedo').click()
      await page.waitForFunction(([k,t])=>document.querySelector(`#schedBoard [data-bfld="${k}"]`)?.value===t,[key,`D488 ${name} draft note`])
      assert.equal(await note().inputValue(),`D488 ${name} draft note`)
    })
    await shot('draft-redone')
    writeFileSync(resolve(out,`${name}-board-controls.json`),JSON.stringify(await page.locator('#schedBoard button').evaluateAll(es=>es.map(e=>({id:e.id,text:e.textContent,title:e.title,disabled:e.disabled}))),null,2))
    await closeBoard(page)
    for(const i of [other,held]) {
      await board(page,i)
      await type(page,`[data-bfld="dn:${i}.0"]`,`D488 ${name} adjacent ${i}`)
      await closeBoard(page)
    }
    await check('draft-only panel has guidance and no clearing door',async()=>{
      assert.equal(await page.locator('#alDrop').count(),0)
      assert.match(await page.locator('#alPanel').textContent(),/unpublished days|changes to publish/)
      assert.equal(await page.locator('#alPanel').isVisible(),width>=820)
    })
    await shot('draft-panel')
    await page.reload()
    await login(page)
    await check('reload before publication keeps the draft note and marks',async()=>{
      const s=await page.evaluate(i=>({note:window.DAYS[i].notes[0],pending:Object.keys(window.SCHED.pending).length,orig:!!window.SCHED.orig?.[i]}),di)
      assert.match(JSON.stringify(s.note),/draft note/); assert.ok(s.pending>0); assert.equal(s.orig,false)
    })
    await board(page,di)
    const p=await publish(page,di)
    assert.equal(p.published,true,JSON.stringify(p))
    await check('first publish clears this day’s marks and keeps its note',async()=>{
      const s=await page.evaluate(i=>({orig:!!window.SCHED.orig?.[i],note:window.DAYS[i].notes[0],pending:Object.keys(window.SCHED.pending).filter(k=>window.keyDay(k)===i)}),di)
      assert.equal(s.orig,true); assert.equal(s.pending.length,0); assert.match(JSON.stringify(s.note),/D488/)
      assert.ok((await pending(page,other)).length);assert.ok((await pending(page,held)).length)
    })
    await shot('first-published')
    await check('Undo and Redo of first publication preserve the edited days',async()=>{
      await page.locator('#sbUndo').click()
      await page.waitForFunction(i=>!window.SCHED.orig?.[i],di)
      assert.ok((await pending(page,di)).length)
      assert.ok((await pending(page,other)).length);assert.ok((await pending(page,held)).length)
      assert.match(JSON.stringify(await page.evaluate(i=>window.DAYS[i].notes[0],di)),/draft note/)
      await page.locator('#sbRedo').click()
      await page.waitForFunction(i=>!!window.SCHED.orig?.[i],di)
      assert.equal((await pending(page,di)).length,0)
      assert.ok((await pending(page,other)).length);assert.ok((await pending(page,held)).length)
    })
    await shot('publication-redone')
    await type(page,`[data-bfld="${key}"]`,`D488 ${name} amended note`)
    await check('an amendment clears the four sign-offs and cannot publish unsigned',async()=>{
      const values=await page.locator('#schedBoard .sb-sign select:visible').evaluateAll(es=>es.map(e=>e.value))
      assert.equal(values.length,4);assert.deepEqual(values,['','','',''])
      assert.equal(await page.locator(`#schedBoard [data-alpub="${di}"]:visible`).isDisabled(),true)
    })
    await closeBoard(page)
    await board(page,other)
    assert.equal((await publish(page,other)).published,true)
    await closeBoard(page)
    await check('publishing draft A keeps draft B and published C pending',async()=>{
      assert.equal((await pending(page,other)).length,0)
      assert.ok((await pending(page,held)).length);assert.ok((await pending(page,di)).length)
    })
    await page.reload();await login(page);await go(page,'editsched')
    await check('reload keeps the mixed-day marks and notes',async()=>{
      assert.equal((await pending(page,other)).length,0)
      assert.ok((await pending(page,held)).length);assert.ok((await pending(page,di)).length)
      assert.match(JSON.stringify(await page.evaluate(i=>window.DAYS[i].notes[0],held)),/adjacent/)
    })
    if(width>=820) {
      const current=await page.evaluate(()=>window.CURWEEK)
      const weeks=page.locator('#page-editsched [data-wk]:visible')
      const next=await weeks.evaluateAll((es,c)=>es.map(e=>e.dataset.wk).find(v=>v!==c),current)
      assert.ok(next);await page.locator(`#page-editsched [data-wk="${next}"]:visible`).click()
      await page.locator(`#page-editsched [data-wk="${current}"]:visible`).click()
      await check('leaving and returning to the week keeps the mixed-day marks',async()=>{
        assert.equal((await pending(page,other)).length,0)
        assert.ok((await pending(page,held)).length);assert.ok((await pending(page,di)).length)
      })
    }
    await check('published day still offers its amendment with no clearing door',async()=>{
      assert.equal(await page.locator('#alDrop').count(),0)
      assert.match(await page.locator('#alPanel').textContent(),/Publish AL1/)
      assert.equal(await page.locator('#alPanel').isVisible(),width>=820)
    })
    await shot('amendment-panel')
    await go(page,'viewsched')
    await check('view-only schedule still shows the original before AL1',async()=>{
      assert.ok(await page.locator('#vWeek').getByText(`D488 ${name} draft note`,{exact:false}).count())
      assert.equal(await page.locator('#vWeek').getByText(`D488 ${name} amended note`,{exact:false}).count(),0)
    })
    await shot('issued-before-al')
    await board(page,di)
    if(width>=820) {
      await sign(page);await closeBoard(page)
      const btn=page.locator('#alPanel').getByRole('button',{name:'Publish AL1',exact:true})
      assert.equal(await btn.isEnabled(),true);await btn.click()
      await page.waitForFunction(i=>window.SCHED.als.some(a=>a.di===i&&a.seq===1),di)
      await shot('panel-al-issued')
    } else assert.equal((await publish(page,di)).published,true)
    await check('AL1 retains the change in the issued record',async()=>{
      const s=await page.evaluate(i=>({als:window.SCHED.als.filter(a=>a.di===i).map(a=>({seq:a.seq,note:a.snap?.d?.notes}))}),di)
      assert.ok(s.als.some(a=>a.seq===1)); assert.match(JSON.stringify(s.als),/amended note/)
    })
    await shot('amendment-published')
    await closeBoard(page);await go(page,'viewsched')
    await check('view-only schedule shows the amendment only after AL1',async()=>{
      assert.ok(await page.locator('#vWeek').getByText(`D488 ${name} amended note`,{exact:false}).count())
      assert.equal(await page.locator('#vWeek').getByText(`D488 ${name} draft note`,{exact:false}).count(),0)
    })
    await shot('issued-after-al')
    await page.reload()
    await login(page)
    await check('reload retains the issued amendment and no clearing door',async()=>{
      const s=await page.evaluate(i=>({als:window.SCHED.als.filter(a=>a.di===i),note:window.DAYS[i].notes[0]}),di)
      assert.ok(s.als.some(a=>a.seq===1)); assert.match(JSON.stringify(s.note),/amended note/)
      assert.equal(await page.locator('#alDrop').count(),0)
    })
    await shot('reloaded')
    // Sign in as the member in the same saved world, never replace the fixture.
    if (width < 820) {
      await page.locator('#burger').click()
      await page.locator('#drawerLogout').click()
    } else await page.locator('#logout').click()
    await login(page,'u')
    await check('member view has no clearing or amendment-publish control',async()=>{
      assert.equal(await page.getByRole('button',{name:'Discard marks',exact:true}).count(),0)
      assert.equal(await page.locator('#alPanel:visible').count(),0)
      assert.equal(await page.locator('[data-alpub]:visible').count(),0)
    })
    await shot('member')
    assert.deepEqual(errors,[])
    results.push({width:name,label:'browser errors',status:'PASS'})
  } catch(e) {
    results.push({width:name,label:'walk completed',status:'FAIL',error:e.stack})
    await shot('failure').catch(()=>{})
  } finally { await browser.close(); writeFileSync(resolve(out,'results.json'),JSON.stringify(results,null,2)) }
}
console.log(JSON.stringify(results,null,2))
if(results.some(r=>r.status==='FAIL'))process.exitCode=1
