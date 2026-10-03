/* Design overlays only: no feature implementation, settings writer or owner data changes. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict')
const {chromium}=require('@playwright/test'),dist=path.resolve(__dirname,'../../../dist')
const chrome=process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium'
const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname),p=path.resolve(dist,'.'+(name==='/'?'/index.html':name))
  if(!p.startsWith(dist+path.sep)){res.writeHead(403);res.end();return}
  const chosen=fs.existsSync(p)&&fs.statSync(p).isFile()?p:path.join(dist,'index.html')
  res.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'}[path.extname(chosen)]||'application/octet-stream');res.end(fs.readFileSync(chosen))
})
const style='.tracking-picture{padding:18px;border:1px solid var(--edge);border-radius:10px;background:var(--panel);max-width:600px;margin:12px 0;color:var(--ink);font:13px Inter,sans-serif}.tracking-picture h2{font-size:16px;margin:0 0 16px}.tracking-picture label{display:flex;align-items:center;gap:10px;cursor:pointer}.tracking-picture strong{flex:1;font-size:13px}.tracking-picture p{font-size:12px;line-height:1.5;color:var(--ink-2);margin:12px 0 0}.tracking-picture input{appearance:none;position:relative;flex:none;width:40px;height:23px;border:1px solid var(--edge);border-radius:12px;background:var(--panel-2);cursor:pointer}.tracking-picture input:before{content:"";position:absolute;left:3px;top:3px;width:15px;height:15px;border-radius:50%;background:var(--ink-2)}.tracking-picture input:checked{background:var(--flight)}.tracking-picture input:checked:before{left:20px;background:var(--bg)}.tracking-picture .state{width:23px;font-size:12px}.mix-row{display:grid;grid-template-columns:74px minmax(0,1fr) 42px;gap:2px 8px;margin:5px 0 8px;font-size:12px;align-items:center}.mix-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mix-track{height:12px;background:var(--panel-2);border-radius:6px;overflow:hidden}.mix-fill{height:100%;display:flex;border-radius:6px;overflow:hidden}.mix-blue{background:var(--flight)}.mix-red{background:var(--hard)}.mix-total{text-align:right;color:var(--ink-2);font:11px monospace}.mix-counts{grid-column:2/4;font-size:10px;line-height:14px;color:var(--ink-2)}.mix-key{display:flex;gap:14px;font-size:11px;color:var(--ink-2);margin:0 0 10px;align-items:center}.mix-key i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px}.mix-show{margin:2px 0 4px;padding:0;border:0;background:none;color:var(--accent);font:inherit;font-size:11px}.mix-total-only{background:linear-gradient(90deg,var(--flight),#59c899)}'
const result={designOnly:true,defaultOff:true,checks:[],errors:[]};let browser
async function run(){
 await new Promise(resolve=>server.listen(4248,'127.0.0.1',resolve));browser=await chromium.launch({...fs.existsSync(chrome)?{executablePath:chrome}:{},headless:true})
 for(const[label,viewport]of[['phone',{width:390,height:844}],['desktop',{width:1440,height:1000}]]){
  const ctx=await browser.newContext({viewport,deviceScaleFactor:1,isMobile:label==='phone',hasTouch:label==='phone'}),page=await ctx.newPage()
  page.on('pageerror',e=>result.errors.push(`${label}: ${e.message}`));await page.goto('http://127.0.0.1:4248/')
  await page.locator('#luser').fill('ad');await page.locator('#lpass').fill('a');await page.locator('#loginForm button[type=submit]').click();await page.locator('#vWeek .day').first().waitFor({state:'attached'})
  await page.evaluate(()=>window.go('logic'));await page.locator('#lgBody').waitFor();await page.addStyleTag({content:style})
  await page.evaluate(()=>{
   const section=document.createElement('section');section.className='tracking-picture';section.innerHTML='<h2>Insights</h2><label><strong>Track blue/red sorties</strong><input type="checkbox" role="switch" aria-label="Track blue/red sorties"><span class="state">Off</span></label><p>Optional for this squadron. Off keeps ordinary sortie totals and work hours, with no Blue/Red questions.</p>'
   document.querySelector('#lgBody').prepend(section)
   section.querySelector('input').addEventListener('change',e=>{section.querySelector('.state').textContent=e.target.checked?'On':'Off';section.querySelector('p').textContent=e.target.checked?'Show the blue/red breakdown where roles are recorded. Flights with missing roles keep an ordinary total bar until chosen.':'Optional for this squadron. Off keeps ordinary sortie totals and work hours, with no Blue/Red questions.'})
  })
  const card=page.locator('.tracking-picture'),input=card.locator('input');assert.equal(await input.isChecked(),false)
  await card.screenshot({path:path.join(__dirname,`logic-off-${label}.png`)});await input.check();assert.equal(await input.isChecked(),true)
  await card.screenshot({path:path.join(__dirname,`logic-on-${label}.png`)});await input.uncheck();assert.equal(await input.isChecked(),false)
  const m=await card.evaluate(el=>({width:el.getBoundingClientRect().width,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));assert.ok(m.scrollWidth<=m.clientWidth+1)
  result.checks.push({label,kind:'mock Logic switch',...m,buttonsDOMOnly:true})
  if(label==='phone'){
   // Open the existing modal for the static chart fixture; this is not opener hit-testing evidence.
   await page.evaluate(()=>{window.go('viewsched');document.getElementById('insightBtn').click()});await page.locator('#insightModal .modal-box').waitFor()
   const fixture=fs.readFileSync(path.join(__dirname,'sorties-phone.html'),'utf8')
   await page.evaluate(html=>{
    document.querySelector('#insightModal .modal-box').outerHTML=html
    const row=document.querySelector('#insightBody .mix-row'),fill=row.querySelector('.mix-fill')
    fill.replaceChildren();fill.classList.add('mix-total-only');row.querySelector('.mix-counts').textContent='Total only · roles not recorded'
    document.querySelectorAll('#insightBody .mix-fill').forEach(track=>{
     track.style.display='flex';track.style.height='12px'
     Array.from(track.children).forEach(segment=>{segment.style.flex='0 0 '+(segment.style.flexBasis||segment.style.width);segment.style.width='auto';segment.style.height='100%'})
    })
   },fixture)
   const rows=await page.locator('#insightBody .mix-row').count();assert.equal(rows,12)
   assert.equal(await page.locator('#insightBody .mix-row').first().locator('.mix-total').textContent(),'4')
   const segments=await page.locator('#insightBody .mix-row').evaluateAll(rows=>rows.slice(1).map(row=>{
    const track=row.querySelector('.mix-fill'),t=track.getBoundingClientRect().width
    return{name:row.querySelector('.mix-name').textContent,width:t,segments:Array.from(track.children).map(s=>({width:s.getBoundingClientRect().width,percent:parseFloat(s.style.flexBasis)}))}
   }))
   for(const row of segments)for(const s of row.segments)assert.ok(Math.abs(s.width-row.width*s.percent/100)<1)
   await page.locator('#insightModal .modal-box').screenshot({path:path.join(__dirname,'sorties-unanswered-phone.png')})
   result.checks.push({label,kind:'illustrative unanswered Relay bar',total:4,rows:12,segments,countsGuessed:false})
  }
  await ctx.close()
 }
 assert.deepEqual(result.errors,[]);fs.writeFileSync(path.join(__dirname,'logic-switch-result.json'),JSON.stringify(result,null,2))
 console.log('Design only: mock Logic switch starts Off and toggles, phone/desktop cards fit; unanswered example retains total4 and 12 initial people; zero page errors. Real saving/access/reset/keyboard/issuing unbuilt.')
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()})
