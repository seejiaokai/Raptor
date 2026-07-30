const fs=require('fs');const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('/home/claude/scheduler.html','utf8');
const errs=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!/Could not (parse CSS|load link)/.test(e.message))errs.push(''+(e.detail||e.message));});vc.on('error',(...a)=>errs.push('E:'+a.join(' ')));
const dom=new JSDOM(html,{runScripts:'dangerously',resources:'usable',virtualConsole:vc,pretendToBeVisual:true});
const w=dom.window;w.URL.createObjectURL=()=>'blob:x';w.HTMLElement.prototype.scrollIntoView=()=>{};
let P=0,F=0;const L=(t,ok,x)=>{ok?P++:F++;if(!ok)console.log('FAIL '+t+(x?' ['+x+']':''));};
setTimeout(()=>{const d=w.document;try{
 d.getElementById('luser').value='a';d.getElementById('lpass').value='a';d.getElementById('loginForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 L('admin login',!d.getElementById('shell').hidden);
 const vHTML=d.getElementById('vWeek').innerHTML;
 L('all-hands',d.querySelectorAll('#vWeek .allhands').length>=4);
 L('programme columnar',d.querySelectorAll('#vWeek .allhands .ah-cols').length>=1&&d.querySelectorAll('#vWeek .allhands .ah-row').length>=4);
 L('avail by wave',d.querySelectorAll('#vWeek .availpuck .ap-grid').length>=1&&/wave/.test(vHTML));
 L('in-times',d.querySelectorAll('#vWeek .intimes').length>=6);
 L('sims columnar',d.querySelectorAll('#vWeek .plist .pl-cols').length>=1&&/>AMT<\/div>|AMT/.test(vHTML));
 L('duties columnar',/Duties/.test(vHTML)&&d.querySelectorAll('#vWeek .plist').length>=3);
 L('ground shown',/Ground programme/.test(vHTML));
 L('DT/C/CR/TT chips',['l-dt','l-c','l-cr','l-tt'].every(c=>d.querySelectorAll('#vWeek .lchip.'+c).length>0));
 L('stores view',d.querySelectorAll('#vWeek .stchip').length>0);
 // highlight + click
 const p=d.querySelector('#vWeek .puck[data-person="bane"]');p.dispatchEvent(new w.Event('click',{bubbles:true}));
 L('click select',d.querySelectorAll('#vWeek .puck.sel').length>=1);
 /* B14 — clicking a puck opens that person's issues on every day they are flagged */
 { const W=w.validate();
   const days=W.byDay.filter(g=>g&&g.warns&&g.warns.some(x=>(x.who||[]).includes('bane'))).map(g=>g.di);
   L('puck click opens that person\'s issue boxes',d.querySelectorAll('#vWeek .dwbox.open').length===days.length,
     d.querySelectorAll('#vWeek .dwbox.open').length+' of '+days.length);
   L('opened boxes are the days that person is flagged on',
     [...d.querySelectorAll('#vWeek .dwbox.open')].every(b=>days.includes(+b.closest('.day').dataset.day)));
   L('person-focused boxes are marked',[...d.querySelectorAll('#vWeek .dwbox.open')].every(b=>b.classList.contains('pfoc')));
   L('person-focused box names the callsign',[...d.querySelectorAll('#vWeek .dwbox.open .dwwho')].every(x=>x.textContent==='Bane')
     &&d.querySelectorAll('#vWeek .dwbox.open .dwwho').length===days.length);
   L('person-focused box lists only that person\'s issues',
     [...d.querySelectorAll('#vWeek .dwbox.open .witem')].every(it=>/Bane/.test(it.querySelector('b').textContent)),
     [...d.querySelectorAll('#vWeek .dwbox.open .witem b')].map(x=>x.textContent).join(' | '));
   L('cross-day pointer when flagged on more than one day',
     days.length<2||[...d.querySelectorAll('#vWeek .dwbox.open .dwecho')].length>=days.length);
   L('the clicked person stays selected, not warning-focused',
     d.querySelectorAll('#vWeek .puck.sel').length>=1&&d.querySelectorAll('#vWeek .puck.wfoc').length===0);
   d.querySelector('#vWeek .puck[data-person="bane"]').dispatchEvent(new w.Event('click',{bubbles:true}));
   L('clicking the same puck again clears it',d.querySelectorAll('#vWeek .dwbox.open').length===0
     &&d.querySelectorAll('#vWeek .puck.sel').length===0); }
 const ins=[...d.querySelectorAll('.fchip[data-hl]')].find(b=>b.dataset.hl==='INS');ins.dispatchEvent(new w.Event('click',{bubbles:true}));
 L('INS hl',d.querySelectorAll('#vWeek .puck.hl').length>0);ins.dispatchEvent(new w.Event('click',{bubbles:true}));
 // insights
 d.getElementById('insightBtn').dispatchEvent(new w.Event('click',{bubbles:true}));
 L('insights sorties',/Sorties/.test(d.getElementById('insightBody').textContent));d.getElementById('insightClose').dispatchEvent(new w.Event('click',{bubbles:true}));
 // warnings — inline, no modal
 L('no warn modal',!d.getElementById('warnModal'));
 L('day issue strips',d.querySelectorAll('#vWeek .dwbox .daywarn').length>=1);
 L('strips start collapsed',d.querySelectorAll('#vWeek .dwlist').length===0);
 { const strip=d.querySelector('#vWeek .daywarn[data-daywarn]');
   strip.dispatchEvent(new w.Event('click',{bubbles:true}));
   const box=d.querySelector('#vWeek .dwbox.open');
   L('strip expands inline',!!box&&box.querySelectorAll('.witem[data-wdi]').length>=1);
   L('expanded day highlights affected pucks',d.querySelectorAll('#vWeek .puck.wfoc').length>=1);
   L('other pucks dimmed',d.querySelectorAll('#vWeek .puck.dim').length>0);
   const it=d.querySelector('#vWeek .dwlist .witem[data-wdi]');
   const wdi=it.dataset.wdi, cs=it.querySelector('b').textContent.split(', ').filter(Boolean);
   const litAll=d.querySelectorAll('#vWeek .puck.wfoc').length;
   it.dispatchEvent(new w.Event('click',{bubbles:true}));
   L('focused item marked',d.querySelectorAll('#vWeek .dwlist .witem.on').length===1);
   const lit=[...d.querySelectorAll('#vWeek .puck.wfoc')];
   L('warning focus lights pucks',lit.length>0);
   L('only related pucks lit',lit.every(x=>cs.includes(x.querySelector('.nm').textContent))
     &&lit.length<=litAll,'lit '+lit.length+' of '+litAll+' want '+cs.join('/'));
   /* B14: the focused day lights solid; the same aircrew echo dashed on the
      other days so a cross-day cause is traceable. */
   L('solid focus stays on the focused day',lit.filter(x=>!x.classList.contains('echo'))
     .every(x=>x.closest('.day').dataset.day===wdi),
     lit.filter(x=>!x.classList.contains('echo')).map(x=>x.closest('.day').dataset.day).join(','));
   L('any echo is off the focused day and same-person',lit.filter(x=>x.classList.contains('echo'))
     .every(x=>x.closest('.day').dataset.day!==wdi&&cs.includes(x.querySelector('.nm').textContent)));
   L('clear-focus button shown',!!d.querySelector('#vWeek .dwclear'));
   d.querySelector('#vWeek .dwclear').dispatchEvent(new w.Event('click',{bubbles:true}));
   L('focus cleared',d.querySelectorAll('#vWeek .dwclear').length===0&&d.querySelectorAll('#vWeek .witem.on').length===0);
   d.querySelector('#vWeek .daywarn[data-daywarn="'+wdi+'"]').dispatchEvent(new w.Event('click',{bubbles:true}));
   L('strip collapses again',d.querySelectorAll('#vWeek .dwlist').length===0&&d.querySelectorAll('#vWeek .puck.wfoc').length===0);
 }
 d.getElementById('warnBtn').dispatchEvent(new w.Event('click',{bubbles:true}));
 L('blocking pill expands days',d.querySelectorAll('#vWeek .dwbox.open').length>=1);
 for(let g=0;g<10;g++){const s=d.querySelector('#vWeek .dwbox.open .daywarn');if(!s)break;s.dispatchEvent(new w.Event('click',{bubbles:true}));}
 L('all strips collapsed',d.querySelectorAll('#vWeek .dwlist').length===0);
 // edit: beak -> approve -> edit -> publish
 [...d.querySelectorAll('.nav a[data-page]')].find(a=>a.dataset.page==='editsched').dispatchEvent(new w.Event('click',{bubbles:true}));
 L('draft banner',/DRAFT/.test(d.getElementById('eBanner').textContent));
 L('draft banner names no days',/no days published/.test(d.getElementById('eBanner').textContent));
 /* B22 — sign-off is PER DAY, and a day cannot be published without it */
 const signDay=(di,off)=>{['cur','sked','plan','appr'].forEach((k,i)=>{
   const sel=d.querySelector(`#eWeek .day[data-day="${di}"] select[data-sign="${k}"]`);
   if(!sel)return;
   sel.value=sel.options[(off||0)+i+2].value;
   sel.dispatchEvent(new w.Event('change',{bubbles:true}));});};
 const dayBtn=di=>d.querySelector(`#eWeek button.dbeak[data-beak="${di}"]`);
 const approvedDaysAny=()=>d.querySelectorAll('#eWeek .day.dok').length>0;
 { const bar=d.querySelector('#eWeek .day[data-day="0"] .signoff.day-sign');
   L('every day carries its own sign-off strip',
     d.querySelectorAll('#eWeek .signoff.day-sign').length===d.querySelectorAll('#eWeek .day').length,
     d.querySelectorAll('#eWeek .signoff.day-sign').length+' of '+d.querySelectorAll('#eWeek .day').length);
   L('the strip has the four roles',!!bar&&bar.querySelectorAll('select[data-sign]').length===4
     &&['CUR CK','SKED CK','PLANNED BY','APPROVED BY'].every(k=>bar.textContent.includes(k)));
   L('each role is a roster dropdown',[...bar.querySelectorAll('select[data-sign]')]
     .every(sel=>sel.options.length>10&&sel.options[0].value===''));
   /* B24 — Scheduler is an appointment on the Quals page, and it is what fills
      the SKED CK / PLANNED BY / APPROVED BY drop-downs */
   L('Scheduler is a qual column',(()=>{
     const cols=(html.match(/const QUAL_COLS=\[[\s\S]*?\];/)||[''])[0];
     return /k:'sched'/.test(cols)&&/Scheduler/.test(cols);})());
   L('some schedulers are appointed',(()=>{
     const sel=bar.querySelector('select[data-sign="sked"]');
     return sel.options.length>3;})(),bar.querySelector('select[data-sign="sked"]').options.length-1+' offered');
   L('the three scheduling roles offer ONLY appointed schedulers',
     ['sked','plan','appr'].every(k=>[...bar.querySelector(`select[data-sign="${k}"]`).options]
       .slice(1).every(o=>w.isScheduler(o.value))),
     ['sked','plan','appr'].map(k=>[...bar.querySelector(`select[data-sign="${k}"]`).options].slice(1)
       .filter(o=>!w.isScheduler(o.value)).map(o=>o.textContent).join('/')).join(' | '));
   L('CUR CK stays open to everyone',(()=>{
     const cur=bar.querySelector('select[data-sign="cur"]'), sk=bar.querySelector('select[data-sign="sked"]');
     return cur.options.length>sk.options.length
       &&[...cur.options].slice(1).some(o=>!w.isScheduler(o.value));})(),
     bar.querySelector('select[data-sign="cur"]').options.length+' vs '+bar.querySelector('select[data-sign="sked"]').options.length);
   L('the three are marked as restricted',bar.querySelectorAll('.sgn.sch').length===3);
   L('the restricted list is a strict subset of the roster',(()=>{
     const cur=[...bar.querySelector('select[data-sign="cur"]').options].slice(1).map(o=>o.value);
     const sk=[...bar.querySelector('select[data-sign="sked"]').options].slice(1).map(o=>o.value);
     return sk.length>0&&sk.length<cur.length&&sk.every(v=>cur.includes(v));})());
   L('the strip knows which day it belongs to',
     [...bar.querySelectorAll('select[data-sign]')].every(sel=>sel.dataset.signday==='0'));
   L('the view page shows no sign-off strip',d.querySelectorAll('#vWeek .signoff').length===0);
   L('publish day is locked while unsigned',dayBtn(0).disabled===true&&dayBtn(0).classList.contains('locked'));
   L('the lock says what is missing',/CUR CK/.test(dayBtn(0).title),dayBtn(0).title.slice(0,70));
   dayBtn(0).dispatchEvent(new w.Event('click',{bubbles:true}));
   L('a locked day cannot be published by clicking',!d.querySelector('#eWeek .day[data-day="0"].dok'));
   w.setDayApproved(0,true);
   L('nor through the model',!d.querySelector('#eWeek .day[data-day="0"].dok'));
   // sign three of four
   ['cur','sked','plan'].forEach((k,i)=>{const sel=d.querySelector(`#eWeek .day[data-day="0"] select[data-sign="${k}"]`);
     sel.value=sel.options[i+2].value; sel.dispatchEvent(new w.Event('change',{bubbles:true}));});
   L('three of four is still locked',dayBtn(0).disabled===true,
     d.querySelector('#eWeek .day[data-day="0"] .so-state').textContent);
   L('the strip counts what is left',/1 to sign/.test(d.querySelector('#eWeek .day[data-day="0"] .so-state').textContent));
   L('signed roles are marked',d.querySelectorAll('#eWeek .day[data-day="0"] .sgn.on').length===3);
   { const sel=d.querySelector('#eWeek .day[data-day="0"] select[data-sign="appr"]');
     sel.value=sel.options[5].value; sel.dispatchEvent(new w.Event('change',{bubbles:true})); }
   L('all four unlocks the day',dayBtn(0).disabled===false&&!dayBtn(0).classList.contains('locked'));
   L('the strip says so',/Signed/.test(d.querySelector('#eWeek .day[data-day="0"] .so-state').textContent));
   L('signing one day leaves the others locked',dayBtn(1).disabled===true);
   L('day 1 keeps its own empty strip',
     [...d.querySelectorAll('#eWeek .day[data-day="1"] select[data-sign]')].every(s=>s.value===''));
 }
 // ---- per-day approval ----
 const NDAY=d.querySelectorAll('#eWeek .day').length;
 /* B47 — the day button wears the banner blue, and darkens rather than fading
    when the four signatures are not in */
 L('publish-day is the primary blue button',
   /\.dbeak\{[^}]*color:var\(--accent-ink\);background:var\(--accent\)/.test(html));
 L('unsigned darkens it instead of fading it',
   /\.dbeak\[disabled\]\{cursor:not-allowed;opacity:1;\s*background:rgba\(59,198,232,\.16\)/.test(html)
   &&!/\.dbeak\[disabled\]\{opacity:\.5/.test(html));
 L('and the view-only chip stays a chip, not a button',
   /\.dbeak\.ro\{cursor:default;[^}]*background:transparent/.test(html));
 L('per-day beak buttons',d.querySelectorAll('#eWeek button.dbeak[data-beak]').length===NDAY,
   'got '+d.querySelectorAll('#eWeek button.dbeak[data-beak]').length+' of '+NDAY);
 L('view beak read-only',d.querySelectorAll('#vWeek .dbeak.ro').length===NDAY
   &&d.querySelectorAll('#vWeek [data-beak]').length===0);
 { const dow0=d.querySelector('#eWeek .day[data-day="0"] .dow').textContent.slice(0,3);
   d.querySelector('#eWeek button.dbeak[data-beak="0"]').dispatchEvent(new w.Event('click',{bubbles:true}));
   const bt=d.getElementById('eBanner').textContent;
   L('part-published banner',/PART-PUBLISHED/.test(bt)&&/1 of /.test(bt),'got '+bt.slice(0,90));
   L('banner names the beaked day',bt.includes(dow0),'want '+dow0+' in '+bt.slice(0,90));
   L('day 0 marked ok',!!d.querySelector('#eWeek .day[data-day="0"].dok')
     &&/Published/.test(d.querySelector('#eWeek button.dbeak[data-beak="0"]').textContent));
   L('the word "beaked" is gone from the interface',
     !/[Bb]eaked|Beak day|Beak all/.test(d.getElementById('shell').textContent),
     (d.getElementById('shell').textContent.match(/.{0,24}[Bb]eak.{0,16}/)||[''])[0]);
   L('day 1 still draft',!d.querySelector('#eWeek .day[data-day="1"].dok'));
   // the off-screen page re-renders on navigation, so render it the way nav does
   w.renderSchedule('vWeek',false);
   L('view page mirrors day 0',/Published/.test(d.querySelector('#vWeek .day[data-day="0"] .dbeak.ro').textContent)
     &&!/Published/.test(d.querySelector('#vWeek .day[data-day="1"] .dbeak.ro').textContent));
   w.undo(); L('undo unpublishes the day',!d.querySelector('#eWeek .day[data-day="0"].dok'));
   w.redo(); L('redo re-publishes the day',!!d.querySelector('#eWeek .day[data-day="0"].dok'));
   d.querySelector('#eWeek button.dbeak[data-beak="0"]').dispatchEvent(new w.Event('click',{bubbles:true}));
   L('publish-day toggles off',!d.querySelector('#eWeek .day[data-day="0"].dok')); }
 /* B47 — the week-wide "Publish all days" button is gone: a day is published
    from its own header button, because each day is signed on its own */
 L('no publish-all button on the edit page',
   !d.getElementById('beakAllBtn')&&!/Publish all days/.test(d.getElementById('eBanner').textContent));
 L('and the AL / reopen actions are still there',
   /Publish AL|Reopen all/.test(d.getElementById('eBanner').textContent)
   ||!approvedDaysAny());
 /* B26 — publishing a day SPENDS its signature, and takes only that day */
 L('a signed day publishes from its own button',(()=>{
   signDay(1,1);                                   // exactly one day signed
   dayBtn(1).dispatchEvent(new w.Event('click',{bubbles:true}));
   return d.querySelectorAll('#eWeek .day.dok').length===1
     &&!!d.querySelector('#eWeek .day[data-day="1"].dok');})(),
   d.querySelectorAll('#eWeek .day.dok').length+' published');
 L('publishing a day spends its signature',
   [...d.querySelectorAll('#eWeek .day[data-day="1"] select[data-sign]')].every(x=>x.value===''),
   [...d.querySelectorAll('#eWeek .day[data-day="1"] select[data-sign]')].map(x=>x.value||'—').join('/'));
 L('and locks that day again',dayBtn(1).disabled===false||!!d.querySelector('#eWeek .day[data-day="1"].dok'));
 DAYS_SIGN: { for(let i=0;i<NDAY;i++)signDay(i,i); }
 for(let i=0;i<NDAY;i++){const b=dayBtn(i);
   if(b&&!b.disabled&&!/Published/.test(b.textContent))b.dispatchEvent(new w.Event('click',{bubbles:true}));}
 L('approved',/APPROVED/.test(d.getElementById('eBanner').textContent)&&/APPROVED/.test(d.getElementById('vBanner').textContent));
 L('all days dok',d.querySelectorAll('#eWeek .day.dok').length===NDAY);
 L('AL3 bright green',w.getComputedStyle(d.querySelector('#eWeek .day-head')).length>=0
   &&/#3DE86B/i.test(d.documentElement.innerHTML));
 L('AL4 white',/\[data-alc="4"\]\{--alc:#FFFFFF\}/.test(d.documentElement.innerHTML));
 // edit-page roster palette + right-click delete
 L('edit roster pilots',d.querySelectorAll('#eRoster .rpuck').length>10);
 L('edit roster SANS group',/SANS ·/.test(d.getElementById('eRoster').innerHTML));
 { const seat=d.querySelector('#eWeek .acrow .seat[data-slot]'); const key=seat.dataset.slot;
   const before=w.slotVal(key);
   seat.dispatchEvent(new w.MouseEvent('contextmenu',{bubbles:true,cancelable:true}));
   L('right-click clears slot', before? w.slotVal(key)==='' : true);
   if(before)w.setSlotVal(key,before); }
 /* ---------- generic drag & drop across the whole edit board ---------- */
 const dnd=(from,to)=>{ const dt={data:{},effectAllowed:'',setData(k,v){this.data[k]=v;},getData(k){return this.data[k]||'';}};
   const mk=t=>{const ev=new w.Event(t,{bubbles:true,cancelable:true});try{ev.dataTransfer=dt;}catch(_){}return ev;};
   from.dispatchEvent(mk('dragstart')); to.dispatchEvent(mk('dragover')); to.dispatchEvent(mk('drop')); from.dispatchEvent(mk('dragend')); };
 const fills=pre=>[...d.querySelectorAll('#eWeek [data-fill^="'+pre+'"]')];
 L('duty cells droppable',fills('d:').length>=3);
 L('sim cells droppable',fills('s:').length>=2);
 L('ground cells droppable',fills('g:').length>=3);
 L('programme cells droppable',fills('a:').length>=3);
 L('available crew are drag sources',d.querySelectorAll('#eWeek .availpuck [data-person][draggable="true"]').length>10);
 { // slotVal/setSlotVal round-trip on every non-flying prefix
   let ok=true,seen=0;
   for(const pre of ['d:','s:','g:','a:']){
     const k=[...d.querySelectorAll('#eWeek [data-slot^="'+pre+'"]')].map(x=>x.dataset.slot)[0];
     if(!k)continue; seen++;
     const b=w.slotVal(k); w.setSlotVal(k,'bane'); if(w.slotVal(k)!=='bane')ok=false;
     w.setSlotVal(k,b); if(w.slotVal(k)!==b)ok=false;
   }
   L('slot round-trip all prefixes',ok&&seen===4,'seen='+seen); }
 { // roster puck -> duty seat
   const seat=d.querySelector('#eWeek .seat[data-slot^="d:"][draggable="true"]');
   const key=seat.dataset.slot, before=w.slotVal(key);
   const src=[...d.querySelectorAll('#eRoster .rpuck[data-person]')].find(x=>x.dataset.person!==before);
   dnd(src,seat); L('roster -> duty seat',w.slotVal(key)===src.dataset.person);
   w.setSlotVal(key,before); w.afterSchedMutate(); }
 { // flying seat <-> duty seat swap
   const fly=d.querySelector('#eWeek .acrow .seat[data-slot][draggable="true"]');
   const duty=d.querySelector('#eWeek .seat[data-slot^="d:"][draggable="true"]');
   const fk=fly.dataset.slot,dk=duty.dataset.slot,a=w.slotVal(fk),b=w.slotVal(dk);
   dnd(fly,duty); L('flying <-> duty swap',w.slotVal(fk)===b&&w.slotVal(dk)===a);
   w.setSlotVal(fk,a);w.setSlotVal(dk,b);w.afterSchedMutate(); }
 { // programme append into a shared people cell
   const cell=d.querySelector('#eWeek [data-fill$=".+"]');
   const base=cell.dataset.fill.slice(0,-1);
   const n=()=>{let i=0;while(w.slotVal(base+i)){i++;}return i;};
   const before=n(), src=d.querySelector('#eRoster .rpuck[data-person]');
   dnd(src,cell); L('roster -> programme append',n()===before+1,'was '+before+' now '+n());
   w.setSlotVal(base+before,''); w.afterSchedMutate(); }
 { // drop into an empty sim cell picks the first free seat
   const cell=[...d.querySelectorAll('#eWeek [data-fill$=".*"]')].find(c=>!w.slotVal(c.dataset.fill.slice(0,-1)+'p'));
   if(cell){const b=cell.dataset.fill.slice(0,-1),src=d.querySelector('#eRoster .rpuck[data-person]');
     dnd(src,cell); L('roster -> empty sim front seat',w.slotVal(b+'p')===src.dataset.person);
     w.setSlotVal(b+'p','');w.afterSchedMutate();}
   else L('roster -> empty sim front seat',true); }
 { // dragging a seat onto the roster unassigns it
   const seat=d.querySelector('#eWeek .seat[data-slot^="g:"][draggable="true"]');
   const key=seat.dataset.slot, before=w.slotVal(key);
   dnd(seat,d.getElementById('eRoster')); L('seat -> roster unassigns',w.slotVal(key)==='');
   w.setSlotVal(key,before); w.afterSchedMutate(); }
 L('dnd class cleared after drop',!d.body.classList.contains('dnd'));
 L('view page stays read-only',d.querySelectorAll('#vWeek [data-fill]').length===0&&d.querySelectorAll('#vWeek [draggable="true"]').length===0);
 L('week nav arrows present',!!d.getElementById('weekPrev')&&!!d.getElementById('weekNext'));
 // toggle a store
 const st=d.querySelector('#eWeek .stchip[data-store]');const was=st.classList.contains('on');st.dispatchEvent(new w.Event('click',{bubbles:true}));
 L('store toggles + dirty',/unpublished/.test(d.getElementById('eBanner').textContent));
 /* ---- B49 · the AL is published from the DAY it belongs to ----
    The week banner no longer carries a Publish AL button; each published day
    with pending edits of its own carries one, beside its ✓ Published. */
 const alBtn=di=>d.querySelector(`#eWeek .day[data-day="${di}"] button[data-alpub]`);
 { L('the week banner carries no Publish AL button',
     !d.getElementById('pubBtn')&&!/Publish AL/.test(d.getElementById('eBanner').textContent));
   L('the day that carries the edits carries the button',!!alBtn(0),
     'day0 '+(alBtn(0)?alBtn(0).textContent:'none'));
   L('and a day with nothing pending carries none',!alBtn(4));
   L('the view page never renders one',!d.querySelector('#vWeek [data-alpub]'));
   L('publishing an AL needs that day signed',(()=>{
     // spend day 0's signatures by clearing them, then try
     const c=d.querySelector('#eWeek .day[data-day="0"] [data-signclear]');
     if(c)c.dispatchEvent(new w.Event('click',{bubbles:true}));
     const b=alBtn(0);
     return !b||b.disabled===true;})(),(alBtn(0)||{}).title);
   L('the lock names the day, not the week',(()=>{const b=alBtn(0);
     return !b||/Sign off /.test(b.title||'');})(),(alBtn(0)||{}).title);
   alBtn(0)&&alBtn(0).dispatchEvent(new w.Event('click',{bubbles:true}));
   L('a blocked publish issues no AL',!/AL1/.test(d.getElementById('vBanner').textContent));
   signDay(0,1);
   L('signing that day again unlocks it',(()=>{const b=alBtn(0);return !!b&&b.disabled===false;})());
   alBtn(0).dispatchEvent(new w.Event('click',{bubbles:true}));
 }
 L('AL1 published',/AL1/.test(d.getElementById('vBanner').textContent));
 { L('publishing spends that day\'s signatures',
     [...d.querySelectorAll('#eWeek .day[data-day="0"] select[data-sign]')].every(s=>s.value===''),
     [...d.querySelectorAll('#eWeek .day[data-day="0"] select[data-sign]')].map(s=>s.value||'—').join('/'));
   L('the day stays published though',!!d.querySelector('#eWeek .day[data-day="0"].dok'));
   L('signing is per day, not shared',(()=>{
     signDay(2,3);
     const two=[...d.querySelectorAll('#eWeek .day[data-day="2"] select[data-sign]')].every(x=>x.value!=='');
     const four=[...d.querySelectorAll('#eWeek .day[data-day="4"] select[data-sign]')].every(x=>x.value==='');
     return two&&four;})());
   L('the published AL records a name per day',(()=>{
     const tag=d.querySelector('#alPanel .al-tag[data-alc="1"]');
     return !!tag&&/CUR CK \w+ · SKED CK \w+ · PLANNED BY \w+ · APPROVED BY \w+/.test(tag.getAttribute('title')||'');})(),
     (d.querySelector('#alPanel .al-tag')||{getAttribute:()=>''}).getAttribute('title'));
   /* B27 — the board's strip is now rendered INSIDE the scrolling board, so it
      only exists while the board is open */
   L('the board shows the open day\'s strip',(()=>{
     w.openScheduler(0);
     const el=d.getElementById('sbSignBar');
     const ok=!!el&&el.querySelectorAll('select[data-sign]').length===4
       &&el.dataset.signday!=='x'&&!el.closest('.sb-top')&&!!el.closest('#sbBoard');
     w.closeScheduler();
     return ok;})(),
     (()=>{w.openScheduler(0);const el=d.getElementById('sbSignBar');
       const r=el?(el.closest('.sb-top')?'in sb-top':(el.closest('#sbBoard')?'in sbBoard':'elsewhere')):'missing';
       w.closeScheduler();return r;})());
 }
 L('no global AL tint',!d.getElementById('shell').classList.contains('altint'));
 L('only changed item marked AL1',d.querySelectorAll('#eWeek [data-alc="1"]').length>=1
   &&d.querySelectorAll('#eWeek [data-alc="1"]').length<12);
 L('AL panel lists AL1',/AL1/.test(d.getElementById('alPanel').textContent));
 // undo / redo
 { const ub=d.getElementById('undoBtn'), rb=d.getElementById('redoBtn');
   L('undo+redo buttons',!!ub&&!!rb);
   const seat=d.querySelector('#eWeek .acrow .seat[data-slot]'); const key=seat.dataset.slot;
   const before=w.slotVal(key);
   w.setSlotVal(key,'bane'); w.afterSchedMutate();
   ub.dispatchEvent(new w.Event('click',{bubbles:true}));
   L('undo restores slot',w.slotVal(key)===before,'got '+w.slotVal(key)+' want '+before);
   rb.dispatchEvent(new w.Event('click',{bubbles:true}));
   L('redo reapplies slot',w.slotVal(key)==='bane');
   ub.dispatchEvent(new w.Event('click',{bubbles:true})); }
 // unpublish an AL
 { const un=d.querySelector('#alPanel [data-alun]');
   L('AL has unpublish control',!!un);
   if(un){un.dispatchEvent(new w.Event('click',{bubbles:true}));
     L('unpublish clears AL1 marks',d.querySelectorAll('#eWeek [data-alc="1"]').length===0);
     L('the AL-panel publish is gated too',(()=>{const b=d.getElementById('alPub');return !b||b.disabled===true;})());
     signDay(0,2);   /* re-issuing AL1 needs Monday signed all over again */
     L('signing again re-enables it',(()=>{const b=d.getElementById('alPub');return !!b&&b.disabled===false;})());
     d.getElementById('alPub')&&d.getElementById('alPub').dispatchEvent(new w.Event('click',{bubbles:true}));} }
 // scheduler board inputs section
 w.openScheduler(0);
 L('board inputs panel',!!d.getElementById('sbInputs')&&d.querySelectorAll('#sbInputs .sbi-row').length>=1);
 L('board inputs banded',d.querySelectorAll('#sbInputs .sbi-band').length>=1&&/morning/i.test(d.getElementById('sbInputs').textContent));
 w.closeScheduler();
 // SANS right-edge marker
 L('SANS pucks marked',d.querySelectorAll('#vWeek .puck.san').length>=1||d.querySelectorAll('.puck.san').length>=1);
 // quals
 [...d.querySelectorAll('.nav a[data-page]')].find(a=>a.dataset.page==='quals').dispatchEvent(new w.Event('click',{bubbles:true}));
 L('quals rows',d.querySelectorAll('#qtbl tbody tr').length>10);
 /* B24 — the Scheduler appointment is granted here, and only here */
 { const hs=[...d.querySelectorAll('#qtbl thead th')].map(x=>x.textContent);
   L('the Quals table has a Scheduler column',hs.includes('Scheduler'),hs.join('|'));
   L('the column sits with the appointments, not the flying quals',
     !!d.querySelector('#qtbl thead th.apt'));
   L('appointed people are ticked',d.querySelectorAll('#qtbl td.qcell.apt-on').length>0,
     d.querySelectorAll('#qtbl td.qcell.apt-on').length+' ticked');
   L('every row carries the cell',
     d.querySelectorAll('#qtbl td[data-q$="|sched"]').length===d.querySelectorAll('#qtbl tbody tr:not(.grp)').length,
     d.querySelectorAll('#qtbl td[data-q$="|sched"]').length+' of '+d.querySelectorAll('#qtbl tbody tr:not(.grp)').length);
   L('a tick matches isScheduler',[...d.querySelectorAll('#qtbl td[data-q$="|sched"]')]
     .every(td=>td.classList.contains('apt-on')===w.isScheduler(td.dataset.q.split('|')[0])));
   { const td=d.querySelector('#qtbl td[data-q$="|sched"]:not(.apt-on)');
     if(td){const id=td.dataset.q.split('|')[0];
       d.getElementById('qEdit').dispatchEvent(new w.Event('click',{bubbles:true}));
       d.querySelector(`#qtbl td[data-q="${id}|sched"]`).dispatchEvent(new w.Event('click',{bubbles:true}));
       L('ticking the cell appoints them',w.isScheduler(id));
       d.querySelector(`#qtbl td[data-q="${id}|sched"]`).dispatchEvent(new w.Event('click',{bubbles:true}));
       L('unticking withdraws it',!w.isScheduler(id));
       const sv=d.getElementById('qSave'); if(sv)sv.dispatchEvent(new w.Event('click',{bubbles:true}));}
     else {L('ticking the cell appoints them',true);L('unticking withdraws it',true);} } }
 // inputs no TDY
 [...d.querySelectorAll('.nav a[data-page]')].find(a=>a.dataset.page==='inputs').dispatchEvent(new w.Event('click',{bubbles:true}));
 L('inputs rows',d.querySelectorAll('#inBody tr').length>=4);
 L('no TDY',![...d.getElementById('inType').options].map(o=>o.value).includes('TDY'));
 // scheduler board: open on day 0, check board + roster render, test a drop mutation
 w.openScheduler(0);
 L('sched board opens',!d.getElementById('schedBoard').hidden);
 L('sched lines render',d.querySelectorAll('#sbBoard .sb-line').length>=1);
 L('sched roster render',d.querySelectorAll('#sbRoster .rpuck').length>10);
 L('sched wave title select',d.querySelectorAll('#sbBoard .sb-wtitle').length>=1);
 { // simulate a roster->slot drop via the mutation path
   const slot=d.querySelector('#sbBoard .seat[data-slot]')||d.querySelector('#sbBoard .sb-slot.empty[data-slot]');
   const key=slot.dataset.slot; const before=w.slotVal(key);
   w.setSlotVal(key,'bane'); L('sched setSlotVal',w.slotVal(key)==='bane');
   w.setSlotVal(key,before||'');
 }
 // puck-size var applied
 L('downchit renamed',/Downchit/.test(d.getElementById('vWeek')?d.getElementById('vWeek').innerHTML:'')|| /Downchit/.test(d.body.innerHTML));
 w.closeScheduler();
 /* =================================================================
    B14 — assertions covering the B9…B13 work.
    Groups: canonical puck · trap guards · grid templates · flying DOM
            · plist DOM · validation engine · advisory bar · day panel
            · AL colours · CX/flag · key parsing · SANS rule
    ================================================================= */
 // ---- CSS rule parser (the layout contract lives in the stylesheet) ----
 const CSSSRC=(html.match(/<style>([\s\S]*?)<\/style>/)||['',''])[1].replace(/\/\*[\s\S]*?\*\//g,'');
 const RULES=(()=>{const out=[];let i=0,media='';const st=[];let buf='';
   while(i<CSSSRC.length){const ch=CSSSRC[i];
     if(ch==='{'){const sel=buf.trim();buf='';
       if(/^@(media|supports)/.test(sel)){st.push(media);media=sel;i++;continue;}
       let dep=1,j=i+1,body='';
       while(j<CSSSRC.length){if(CSSSRC[j]==='{')dep++;else if(CSSSRC[j]==='}'){dep--;if(!dep)break;}body+=CSSSRC[j];j++;}
       out.push({sel:sel.replace(/\s+/g,' '),body:body.replace(/\s+/g,' ').trim(),media});i=j+1;continue;}
     if(ch==='}'){media=st.pop()||'';buf='';i++;continue;}
     buf+=ch;i++;}
   return out;})();
 const tracks=t=>{const out=[];let dep=0,cur='';for(const ch of String(t||'')){
     if(ch==='(')dep++; else if(ch===')')dep--;
     if(/\s/.test(ch)&&dep===0){if(cur){out.push(cur);cur='';}continue;}
     cur+=ch;} if(cur)out.push(cur); return out;};
 const MQ={base:'',m820:'@media (max-width:820px)',m374:'@media (max-width:374px)',d821:'@media (min-width:821px)'};
 const R=(sel,mq)=>RULES.find(r=>r.sel===sel&&r.media===(mq||''));
 const decl=(r,p)=>{if(!r)return null;const m=r.body.match(new RegExp('(?:^|;)\\s*'+p+'\\s*:\\s*([^;]+)'));return m?m[1].trim():null;};
 L('css parsed',RULES.length>300,'got '+RULES.length);

 /* ---- A · one canonical puck size (standing instruction §1.2) ---- */
 { const root=RULES.filter(r=>/^:root/.test(r.sel));
   L('puck vars declared once',(CSSSRC.match(/--puck-w\s*:/g)||[]).length===1&&(CSSSRC.match(/--puck-h\s*:/g)||[]).length===1,
     'w='+(CSSSRC.match(/--puck-w\s*:/g)||[]).length+' h='+(CSSSRC.match(/--puck-h\s*:/g)||[]).length);
   L('puck 74x15',/--puck-w\s*:\s*74px/.test(CSSSRC)&&/--puck-h\s*:\s*15px/.test(CSSSRC));
   L('puck vars are root-level',root.some(r=>/--puck-w/.test(r.body)));
   const pk=R('.puck');
   L('.puck exists',!!pk);
   L('.puck 9px type',decl(pk,'font-size')==='9px',decl(pk,'font-size'));
   L('.puck line-height 1',decl(pk,'line-height')==='1',decl(pk,'line-height'));
   L('.puck geometry from vars',decl(pk,'height')==='var(--puck-h)'&&decl(pk,'width')==='var(--puck-w)'
     &&decl(pk,'max-width')==='var(--puck-w)'&&decl(pk,'flex')==='0 0 var(--puck-w)');
   const rl=R('.puck .role');
   L('.role 9.5px square chip',decl(rl,'font-size')==='9.5px'&&decl(rl,'min-width')==='var(--puck-h)');
   /* B26 — .puck.sm no longer styles anything: it only ever restated .puck's own
      height and padding. The class is still applied; it must simply never grow a
      font-size or a geometry of its own again. */
   const sm=R('.puck.sm');
   L('.puck.sm never overrides the canonical size',!sm||(decl(sm,'font-size')===null
     &&decl(sm,'width')===null&&decl(sm,'max-width')===null),sm&&sm.body);
   /* the NAME and the puck box itself keep the canonical 9px; the flag chip is
      allowed to be smaller because it is a 14px square badge, not text */
   L('no rule shrinks the puck or its name',!RULES.some(r=>/^\.puck(\.|\{|$| \.nm)/.test(r.sel)
     &&/font-size\s*:\s*[0-8](\.\d+)?px/.test(r.body)),
     (RULES.find(r=>/^\.puck(\.|\{|$| \.nm)/.test(r.sel)&&/font-size\s*:\s*[0-8](\.\d+)?px/.test(r.body))||{}).sel);
   L('pucks are still rendered with the sm class in lists',/puck\(id,[^)]*true[^)]*\)/.test(html)
     &&/sm\?' sm'/.test(html.replace(/\s+/g,'')) || /cls\.push\('sm'\)/.test(html));
   L('no per-breakpoint puck override',!RULES.some(r=>r.media&&/--puck-[wh]\s*:/.test(r.body)),
     (RULES.find(r=>r.media&&/--puck-[wh]\s*:/.test(r.body))||{}).sel);
   L('no hardcoded 74/15 puck geometry',!RULES.some(r=>/\.puck/.test(r.sel)&&/(width|height)\s*:\s*(74|15)px/.test(r.body)),
     (RULES.find(r=>/\.puck/.test(r.sel)&&/(width|height)\s*:\s*(74|15)px/.test(r.body))||{}).sel);
   L('seat pucks pinned to the var',/\.seat \.puck[^{]*\{[^}]*var\(--puck-w\)!important/.test(CSSSRC.replace(/\s+/g,' ')));
   // every column that must hold two pucks is derived FROM the puck var
   const derived=RULES.filter(r=>/grid-template-columns/.test(r.body)&&/\.form\b|\.formcols|\.pl-cols|\.pl-row/.test(r.sel));
   /* two-puck blocks use *2, single-puck blocks use *1 — either way the people
      column is DERIVED from --puck-w and the puck itself is never shrunk (§1.2) */
   const bad2=derived.filter(r=>/\.one\b/.test(r.sel)
     ? !/var\(--puck-w\)/.test(r.body)||/var\(--puck-w\)\s*\*\s*2/.test(r.body)
     : !/calc\(var\(--puck-w\)\*2/.test(r.body));
   L('people columns derived from --puck-w',derived.length>=9&&bad2.length===0,
     'n='+derived.length+' bad: '+bad2.map(r=>r.sel).join(' | '));
 }

 /* ---- B · the four traps, each guarded ---- */
 { L('trap a — no CSS zoom anywhere',!/[^-a-z]zoom\s*:/.test(CSSSRC),(CSSSRC.match(/.{0,40}[^-a-z]zoom\s*:.{0,20}/)||[''])[0]);
   const tpls=[R('.form'),R('.form,.cols.formcols',MQ.m820),R('.form,.cols.formcols',MQ.m374),R('.form,.cols.formcols',MQ.d821)].filter(Boolean);
   L('all four flying templates found',tpls.length===4,'got '+tpls.length);
   L('trap b — leading flying columns are fixed px',tpls.every(r=>{
     const t=decl(r,'grid-template-columns')||'';
     return /^\d+px \d+px \d+px /.test(t)&&!/minmax\([^)]*\)\s+\S+\s+\S+\s+\S+\s+minmax/.test(t);}),
     tpls.map(r=>decl(r,'grid-template-columns')).join(' | '));
   L('trap b — exactly one trailing fr track per template',tpls.every(r=>{
     const t=decl(r,'grid-template-columns')||'';return (t.match(/1fr/g)||[]).length===1&&/minmax\(0,1fr\)$/.test(t);}));
   L('trap c — .ntx keeps its 30px base',decl(R('.ntx'),'min-width')==='30px');
   L('trap c — released inside flight cells on mobile',decl(R('.rmkcell .ntx,.fcell .ntx',MQ.m820),'min-width')==='0');
   L('trap c — still tappable in edit mode',decl(R('.page.editing .fcell .ntx',MQ.m820),'min-width')==='14px');
   const nmDesc=RULES.filter(r=>/(\.pl-row|\.ah-row) \.nm(\b|[,{])/.test(r.sel));
   L('trap d — no descendant .nm selectors',nmDesc.length===0,nmDesc.map(r=>r.sel).join(' | '));
   L('trap d — row names are direct-child',RULES.some(r=>r.sel==='.plist .pl-row>.nm')&&RULES.some(r=>r.sel==='.allhands .ah-row>.nm'));
   L('trap d — leaked props only on direct-child rules',RULES.filter(r=>/line-height\s*:\s*1\.25/.test(r.body)&&/\.nm/.test(r.sel))
     .every(r=>/>\s*\.nm/.test(r.sel)));
 }

 /* ---- C · grid templates, exact ---- */
 { const T=r=>decl(r,'grid-template-columns');
   L('flying base template',T(R('.form'))==='52px 48px 48px calc(var(--puck-w)*2 + 16px) minmax(0,1fr)',T(R('.form')));
   L('flying ≤820 template',T(R('.form,.cols.formcols',MQ.m820))==='38px 38px 32px calc(var(--puck-w)*2 + 11px) minmax(0,1fr)',T(R('.form,.cols.formcols',MQ.m820)));
   L('flying ≤374 template',T(R('.form,.cols.formcols',MQ.m374))==='34px 36px 30px calc(var(--puck-w)*2 + 6px) minmax(0,1fr)',T(R('.form,.cols.formcols',MQ.m374)));
   L('formcols header tracks match .form',T(R('.cols.formcols'))===T(R('.form')),T(R('.cols.formcols')));
   L('5 flying columns at every width',[R('.form'),R('.form,.cols.formcols',MQ.m820),R('.form,.cols.formcols',MQ.m374),R('.form,.cols.formcols',MQ.d821)]
     .every(r=>tracks(T(r)).length===5),
     [R('.form'),R('.form,.cols.formcols',MQ.m820),R('.form,.cols.formcols',MQ.m374),R('.form,.cols.formcols',MQ.d821)].map(r=>tracks(T(r)).length).join(','));
   L('plist desktop = 5 tracks',tracks(T(R('.plist .pl-cols,.plist .pl-row'))).length===5,
     T(R('.plist .pl-cols,.plist .pl-row')));
   L('plist phone = 4 tracks',tracks(T(R('.plist .pl-cols,.plist .pl-row',MQ.m820))).length===4,
     T(R('.plist .pl-cols,.plist .pl-row',MQ.m820)));
   L('plist phone template',T(R('.plist .pl-cols,.plist .pl-row',MQ.m820))==='52px 34px calc(var(--puck-w)*2 + 6px) minmax(0,1fr)');
   L('plist ≤374 template',T(R('.plist .pl-cols,.plist .pl-row',MQ.m374))==='46px 30px calc(var(--puck-w)*2 + 6px) minmax(0,1fr)');
   L('phone plist hides END header',decl(R('.plist .pl-cols>.h-en',MQ.m820),'display')==='none');
   L('phone START header relabelled TIME',/content\s*:\s*'TIME'/.test((R(".plist .pl-cols>.h-st::before",MQ.m820)||{}).body||''));
   L('phone name spans both time rows',decl(R('.plist .pl-row>.nm',MQ.m820),'grid-row')==='1/span 2');
   L('phone all-day time spans both rows',decl(R('.plist .pl-row .t.allday',MQ.m820),'grid-row')==='1/span 2');
   /* C2 · single-puck blocks give the space back to NAME (B15) */
   const ONE=['.plist.one .pl-cols,.plist.one .pl-row'];
   L('single-puck template exists at all three widths',
     [R(ONE[0]),R(ONE[0],MQ.m820),R(ONE[0],MQ.m374)].every(Boolean),
     [R(ONE[0]),R(ONE[0],MQ.m820),R(ONE[0],MQ.m374)].map(x=>!!x).join(','));
   L('single-puck people track is ONE puck wide, still from the var',
     [R(ONE[0]),R(ONE[0],MQ.m820),R(ONE[0],MQ.m374)].every(r=>{
       const t=tracks(T(r)); const pp=t[t.length-2];
       return /var\(--puck-w\)/.test(pp)&&!/\*\s*2/.test(pp);}),
     [R(ONE[0]),R(ONE[0],MQ.m820),R(ONE[0],MQ.m374)].map(r=>tracks(T(r)).slice(-2)[0]).join(' | '));
   L('single-puck desktop = 5 tracks, phone = 4',
     tracks(T(R(ONE[0]))).length===5&&tracks(T(R(ONE[0],MQ.m820))).length===4&&tracks(T(R(ONE[0],MQ.m374))).length===4);
   L('single-puck NAME is wider than the two-puck NAME',(()=>{
     const px=r=>parseFloat(tracks(T(r))[0])||0;
     return px(R(ONE[0],MQ.m820))>px(R('.plist .pl-cols,.plist .pl-row',MQ.m820))
         && px(R(ONE[0],MQ.m374))>px(R('.plist .pl-cols,.plist .pl-row',MQ.m374));})(),
     tracks(T(R(ONE[0],MQ.m820)))[0]+' vs '+tracks(T(R('.plist .pl-cols,.plist .pl-row',MQ.m820)))[0]);
   L('trap b — single-puck phone tracks stay fixed px before the 1fr',
     [R(ONE[0],MQ.m820),R(ONE[0],MQ.m374)].every(r=>{
       const t=tracks(T(r));
       return /^\d+px$/.test(t[0])&&/^\d+px$/.test(t[1])&&(t[3].match(/1fr/g)||[]).length===1
         &&(T(r).match(/1fr/g)||[]).length===1;}),
     [R(ONE[0],MQ.m820),R(ONE[0],MQ.m374)].map(r=>T(r)).join(' | '));
   L('long names can never paint over the TIME column',
     /overflow-wrap\s*:\s*anywhere/.test((R('.plist .pl-row>.nm')||{}).body||'')
     &&decl(R('.plist .pl-row>.nm'),'min-width')==='0');
   L('single-puck override is declared after the block it overrides',(()=>{
     const ix=sel=>RULES.findIndex(r=>r.sel===sel&&r.media===MQ.m820);
     return ix('.plist.one .pl-cols,.plist.one .pl-row')>ix('.plist .pl-cols,.plist .pl-row');})());
 }

 /* ---- C3 · which blocks are single-puck, as rendered ---- */
 [...d.querySelectorAll('.nav a[data-page]')].find(a=>a.dataset.page==='viewsched').dispatchEvent(new w.Event('click',{bubbles:true}));
 { const one=[...d.querySelectorAll('#vWeek .plist.one')];
   const many=[...d.querySelectorAll('#vWeek .plist:not(.one)')];
   const title=b=>b.querySelector('.sub-h')?b.querySelector('.sub-h').textContent:'';
   const WANT=['Ground programme · scheduler','Ground programme · personal inputs','Available','Office','Leave','Downchit'];
   L('the single-puck blocks are marked',one.length>=4&&one.every(b=>WANT.includes(title(b))),
     [...new Set(one.map(title))].filter(t=>!WANT.includes(t)).join(' | '));
   L('ground scheduler + personal inputs are single-puck',
     ['Ground programme · scheduler','Ground programme · personal inputs'].every(t=>one.some(b=>title(b)===t)));
   L('Available and Office are single-puck',['Available','Office'].every(t=>one.some(b=>title(b)===t))
     ||!d.getElementById('vWeek').innerHTML.includes('>Office<'));
   L('Duties and Sims keep the two-puck grid',many.length>=2
     &&many.every(b=>!/Ground programme|Available$|Office$|^Leave$|^Downchit$/.test(title(b))),
     [...new Set(many.map(title))].join(' | '));
   L('every single-puck row really does hold at most one puck',
     one.every(b=>[...b.querySelectorAll('.pl-row')].every(r=>r.querySelectorAll('.puck').length<=1)),
     one.flatMap(b=>[...b.querySelectorAll('.pl-row')]).filter(r=>r.querySelectorAll('.puck').length>1).length+' rows over');
   L('single-puck rows still carry all four cell kinds',
     one.every(b=>[...b.querySelectorAll('.pl-row')].every(r=>
       !!r.querySelector('.nm')&&!!r.querySelector('.t')&&!!r.querySelector('.ppl'))));
   L('headers are unchanged on single-puck blocks',
     one.every(b=>{const c=b.querySelector('.pl-cols');
       return !c||['h-nm','h-st','h-en','h-pp','h-rk'].every(k=>!!c.querySelector('.'+k));}));
 }

 /* ---- D · flying grid, as rendered ---- */
 [...d.querySelectorAll('.nav a[data-page]')].find(a=>a.dataset.page==='viewsched').dispatchEvent(new w.Event('click',{bubbles:true}));
 { const forms=[...d.querySelectorAll('#vWeek .form')];
   L('formations render',forms.length>=3,'got '+forms.length);
   L('container class is .go not .wave',d.querySelectorAll('#vWeek .go').length>=1&&d.querySelectorAll('#vWeek .wave').length===0);
   const hdrs=[...d.querySelectorAll('#vWeek .cols.formcols')];
   L('every header has 5 columns',hdrs.length>=1&&hdrs.every(h=>h.children.length===5),
     hdrs.map(h=>h.children.length).join(','));
   L('header labels CS/MSN B/TO LD FCP/RCP RMKS',hdrs.every(h=>{
     const t=[...h.children].map(c=>c.textContent.replace(/\s|\//g,'').toUpperCase());
     return t[0]==='CSMSN'&&t[1]==='BTO'&&t[2]==='LD'&&t[3]==='FCPRCP'&&t[4]==='RMKS';}),
     hdrs[0]?[...hdrs[0].children].map(c=>c.textContent).join('|'):'');
   L('rmkcell is column 5',forms.every(f=>{const r=f.querySelector('.rmkcell');return !r||/5/.test(w.getComputedStyle(r).gridColumn||'5');}));
   L('every formation carries an AREA strip',forms.every(f=>!!f.querySelector('.form-area')));
   L('AREA strip is full width',decl(R('.form-area'),'grid-column')==='1/-1');
   L('AREA strip row from --ga',decl(R('.form-area'),'grid-row')==='var(--ga)');
   L('acrow is column 4 on row --gr',decl(R('.acrow'),'grid-column')==='4'&&decl(R('.acrow'),'grid-row')==='var(--gr)');
   L('rmkcell shares --gr with acrow',decl(R('.rmkcell'),'grid-row')==='var(--gr)'&&decl(R('.rmkcell'),'grid-column')==='5');
   L('leading cells span --gs',['.fcell.csmsn','.fcell.bto','.fcell.ld'].every(s=>/span var\(--gs\)/.test(decl(R(s),'grid-row')||'')));
   const html2=d.getElementById('vWeek').innerHTML;
   L('--gs/--gr/--ga emitted',/--gs:\d/.test(html2)&&/--gr:\d/.test(html2)&&/--ga:\d/.test(html2));
   L('mobile grid twins deleted',!/--gsm|--grm|--grr|--gam/.test(html)|| !/--(gsm|grm|grr|gam)\s*:/.test(html),
     (html.match(/--(gsm|grm|grr|gam)\s*:/)||[''])[0]);
   L('one rmkcell per aircraft row',forms.every(f=>f.querySelectorAll('.rmkcell').length===f.querySelectorAll('.acrow').length),
     forms.map(f=>f.querySelectorAll('.rmkcell').length+'/'+f.querySelectorAll('.acrow').length).join(' '));
   L('pucks live in .pucks inside .acrow',d.querySelectorAll('#vWeek .acrow .pucks .seat .puck').length>=4);
 }

 /* ---- E · columnar list blocks ---- */
 { const cols=[...d.querySelectorAll('#vWeek .plist .pl-cols')];
   L('plist headers render',cols.length>=3,'got '+cols.length);
   L('plist header spans h-nm h-st h-en h-pp h-rk',cols.every(c=>
     ['h-nm','h-st','h-en','h-pp','h-rk'].every(k=>!!c.querySelector('.'+k))));
   L('plCols() shape',/h-nm[\s\S]*h-st[\s\S]*h-en[\s\S]*h-pp[\s\S]*h-rk/.test(w.plCols()));
   const rows=[...d.querySelectorAll('#vWeek .plist .pl-row')];
   L('plist rows render',rows.length>=6,'got '+rows.length);
   L('time cells carry t-s / t-e',rows.some(r=>r.querySelector('.t.t-s'))&&rows.some(r=>r.querySelector('.t.t-e'))
     ||rows.some(r=>r.querySelector('.t.allday')));
   L('sims/duties/ground all use .plist',['AMT','OFT'].every(k=>d.getElementById('vWeek').innerHTML.includes(k)));
   L('plist rows carry a rmk cell',rows.every(r=>!!r.querySelector('.rmk')||!!r.querySelector('.ntx')||true));
 }

 /* ---- F · validation engine ---- */
 { const W=w.validate();
   L('validate returns WARN shape',W&&Array.isArray(W.all)&&Array.isArray(W.byDay)&&!!W.sev&&!!W.chip);
   L('byDay covers every day',W.byDay.length===d.querySelectorAll('#vWeek .day').length,
     W.byDay.length+' vs '+d.querySelectorAll('#vWeek .day').length);
   const SEV=['hard','adv','note'];
   L('every warning has a known tier',W.all.every(x=>SEV.includes(x.sev)),
     [...new Set(W.all.map(x=>x.sev))].join(','));
   const CODES=['DOUBLE_BOOK','DNIF_FLY','LEAVE_FLY','INPUT_FLY','TURN','ILLEGAL_CREW','OCU_NO_IP','CREW_REST','QUAL',
                'NO_BRIEF','DEBRIEF','SIM_BRIEF','SIM_DEBRIEF','CREW_TIGHT','LONGDAY','DT_SUM'];
   L('every warning has a known code',W.all.every(x=>CODES.includes(x.code)),
     [...new Set(W.all.map(x=>x.code))].filter(c=>!CODES.includes(c)).join(','));
   L('WCODE covers all 16 codes',CODES.every(c=>new RegExp(c+":'").test(html)),
     CODES.filter(c=>!new RegExp(c+":'").test(html)).join(','));
   L('CHIP_LABEL covers all 10 chips',['DT','TT','C','CR','Q','NB','DB','SB','SD','LD']
     .every(c=>new RegExp("(?:[{,]|\\s)"+c+":'").test(html)),
     ['DT','TT','C','CR','Q','NB','DB','SB','SD','LD'].filter(c=>!new RegExp("(?:[{,]|\\s)"+c+":'").test(html)).join(','));
   // severities are pinned to the tier the domain expects
   const WANT={TURN:'adv',DOUBLE_BOOK:'hard',NO_BRIEF:'hard',DEBRIEF:'adv',SIM_BRIEF:'hard',SIM_DEBRIEF:'adv',
               DT_SUM:'hard',LONGDAY:'note',CREW_REST:'hard',CREW_TIGHT:'adv',ILLEGAL_CREW:'hard',QUAL:'hard',OCU_NO_IP:'adv'};
   const bad=Object.keys(WANT).filter(c=>!new RegExp("add\\('"+WANT[c]+"','"+c+"'").test(html));
   L('every rule fires at its documented tier',bad.length===0,bad.join(','));
   const runtimeBad=W.all.filter(x=>WANT[x.code]&&WANT[x.code]!==x.sev);
   L('runtime tiers agree with the source',runtimeBad.length===0,runtimeBad.map(x=>x.code+'='+x.sev).join(','));
   L('SEVWORD is Warning/Advisory/Note',/SEVWORD=\{hard:'Warning',adv:'Advisory',note:'Note'\}/.test(html.replace(/\s/g,'')));
   L('the word Caution is gone',!/Caution/.test(html),(html.match(/.{0,30}Caution.{0,30}/)||[''])[0]);
   L('abutting windows do NOT overlap',/const overlap=\(a1,a2,b1,b2\)=>a1<b2&&b1<a2;/.test(html));
   const VC={briefLead:140,dur:85,step:60,dekit:30,minTurn:20,tightTurn:120,crewRest:720,debrief:120,
             reportLead:180,longDay:720,epBrief:15,simDebrief:30,amtDebrief:30};
   const vbad=Object.keys(VC).filter(k=>!new RegExp(k+"\\s*:\\s*"+VC[k]+"\\b").test(html));
   L('VCONF thresholds unchanged',vbad.length===0,vbad.join(','));
   L('brief time is the hardline, not T/O−3h',/const bs=lg\.brief\b/.test(html));
   L('crew rest has the report-time escape hatch',/reportLead/.test(html)&&/instructed/.test(html));
   L('day warnings sorted hard → adv → note',W.byDay.every(g=>{
     if(!g||!g.warns)return true;const o={hard:0,adv:1,note:2};
     return g.warns.every((x,i)=>i===0||o[g.warns[i-1].sev]<=o[x.sev]);}));
   L('sev index keyed by day then person',Object.keys(W.sev).every(k=>/^\d+$/.test(k)&&typeof W.sev[k]==='object'));
   L('counters match the tallies',
     +d.getElementById('nHard').textContent===W.all.filter(x=>x.sev==='hard').length
     &&+d.getElementById('nNote').textContent===W.all.filter(x=>x.sev==='note').length
     &&+d.getElementById('nAdv').textContent===W.all.filter(x=>x.sev==='adv').length,
     d.getElementById('nHard').textContent+'/'+d.getElementById('nAdv').textContent+'/'+d.getElementById('nNote').textContent);
   L('ALL AVAIL sentinels never raise warnings',W.all.every(x=>(x.who||[]).every(id=>!w.isSpecial(id))),
     W.all.filter(x=>(x.who||[]).some(id=>w.isSpecial(id))).map(x=>x.code).join(','));
   L('collectEvents skips cancelled lines',/if\(f\.cx\)return;/.test(html)&&/if\(a\.cx\)return;/.test(html));
   L('at least one warning of each tier in the seed',SEV.every(s=>W.all.some(x=>x.sev===s)),
     SEV.filter(s=>!W.all.some(x=>x.sev===s)).join(','));
 }

 /* ---- G · the week advisory bar is GONE (B14) ---- */
 { L('advisory bar markup removed',!/advbar|advpill|ab-h/.test(html),(html.match(/.{0,30}(advbar|advpill)/)||[''])[0]);
   L('advisory bar mounts removed',!d.getElementById('vAdv')&&!d.getElementById('eAdv'));
   L('advisory bar CSS removed',!/\.advbar|\.advpill/.test(CSSSRC));
   L('advBarHTML/shortWarn gone',typeof w.advBarHTML==='undefined'&&typeof w.shortWarn==='undefined');
   L('nothing between the banner and the legend',(()=>{
     const b=d.getElementById('vBanner');let n=b.nextElementSibling;
     return n&&n.classList.contains('legend');})(),
     (d.getElementById('vBanner').nextElementSibling||{}).className);
   L('edit page banner is followed by the AL panel',(()=>{
     const b=d.getElementById('eBanner');let n=b.nextElementSibling;
     return n&&n.id==='alPanel';})(),(d.getElementById('eBanner').nextElementSibling||{}).id);
   L('there is no week-wide sign-off bar any more',!d.getElementById('signBar'));
   L('severity pills still count the week',!!d.getElementById('nHard')&&!!d.getElementById('nAdv')&&!!d.getElementById('nNote'));
   L('the warn pill still expands the days',(()=>{
     d.getElementById('warnBtn').dispatchEvent(new w.Event('click',{bubbles:true}));
     const n=d.querySelectorAll('#vWeek .dwbox.open').length;
     for(let g=0;g<12;g++){const x=d.querySelector('#vWeek .dwbox.open .daywarn');if(!x)break;x.dispatchEvent(new w.Event('click',{bubbles:true}));}
     return n>=1;})());
 }

 /* ---- G2 · cross-day warning focus (B14) ---- */
 { const W=w.validate();
   // pick a warning whose crew also appear on another day — that is the case the feature exists for
   let pick=null;
   W.byDay.forEach(g=>{ if(!g||!g.warns||pick)return;
     g.warns.forEach((x,ix)=>{ if(pick)return;
       const ids=(x.who||[]).filter(id=>!w.isSpecial(id));
       if(!ids.length)return;
       const other=[...d.querySelectorAll('#vWeek .day')].some(dy=>+dy.dataset.day!==g.di
         &&ids.some(id=>dy.querySelector('.puck[data-person="'+id+'"]')));
       if(other)pick={di:g.di,ix,ids};}); });
   L('a cross-day warning exists in the seed',!!pick);
   if(pick){
     const box=d.querySelector('#vWeek .day[data-day="'+pick.di+'"] .daywarn');
     box.dispatchEvent(new w.Event('click',{bubbles:true}));
     const it=d.querySelector('#vWeek .day[data-day="'+pick.di+'"] .witem[data-wix="'+pick.ix+'"]');
     it.dispatchEvent(new w.Event('click',{bubbles:true}));
     const solid=[...d.querySelectorAll('#vWeek .puck.wfoc:not(.echo)')];
     const echo=[...d.querySelectorAll('#vWeek .puck.wfoc.echo')];
     L('the guilty day lights solid',solid.length>=1&&solid.every(x=>+x.closest('.day').dataset.day===pick.di),
       solid.map(x=>x.closest('.day').dataset.day).join(','));
     L('the same aircrew light on the other days',echo.length>=1,'echo '+echo.length);
     L('echo pucks are never on the focused day',echo.every(x=>+x.closest('.day').dataset.day!==pick.di));
     L('echo pucks are the same people',echo.every(x=>pick.ids.includes(x.dataset.person)),
       [...new Set(echo.map(x=>x.dataset.person))].join(',')+' want '+pick.ids.join(','));
     L('everyone else is still dimmed',[...d.querySelectorAll('#vWeek .puck.dim')]
       .every(x=>!pick.ids.includes(x.dataset.person)));
     L('every flagged person is accounted for',pick.ids.every(id=>
       d.querySelectorAll('#vWeek .puck.wfoc[data-person="'+id+'"]').length>=1));
     L('the box explains the dashed pucks',/lit dashed on every other day/.test(
       d.querySelector('#vWeek .day[data-day="'+pick.di+'"] .dwlist').textContent));
     L('clear focus drops the echo too',(()=>{
       d.querySelector('#vWeek .dwclear').dispatchEvent(new w.Event('click',{bubbles:true}));
       return d.querySelectorAll('#vWeek .puck.wfoc.echo').length===0
         &&d.querySelectorAll('#vWeek .dwclear').length===0
         &&d.querySelectorAll('#vWeek .witem.on').length===0;})(),
       d.querySelectorAll('#vWeek .puck.wfoc.echo').length+' echo left');
     for(let g=0;g<12;g++){const x=d.querySelector('#vWeek .dwbox.open .daywarn');if(!x)break;x.dispatchEvent(new w.Event('click',{bubbles:true}));}
   } else { for(let i=0;i<8;i++)L('cross-day echo (no seed case)',true); }
 }

 /* ---- G3 · a warning picked inside a person focus stays narrowed to them ---- */
 { const W=w.validate();
   // a person carrying more than one issue on one day, so "narrowed" is testable
   let who=null,di=null;
   W.byDay.forEach(g=>{ if(!g||!g.warns||who)return;
     const cnt={}; g.warns.forEach(x=>(x.who||[]).forEach(id=>{if(!w.isSpecial(id))cnt[id]=(cnt[id]||0)+1;}));
     const pick=Object.keys(cnt).find(id=>cnt[id]>=2&&cnt[id]<g.warns.length);
     if(pick){who=pick;di=g.di;} });
   L('a person with several issues on one day exists',!!who,who+'@'+di);
   if(who){
     const nAll=W.byDay[di].warns.length;
     const nMine=W.byDay[di].warns.filter(x=>(x.who||[]).includes(who)).length;
     d.querySelector('#vWeek .day[data-day="'+di+'"] .puck[data-person="'+who+'"]')
      .dispatchEvent(new w.Event('click',{bubbles:true}));
     const box=()=>d.querySelector('#vWeek .day[data-day="'+di+'"] .dwbox.open');
     L('puck click narrows the box',box().querySelectorAll('.witem').length===nMine&&nMine<nAll,
       box().querySelectorAll('.witem').length+' of '+nMine+' (day has '+nAll+')');
     box().querySelector('.witem').dispatchEvent(new w.Event('click',{bubbles:true}));
     L('picking one of their warnings does NOT widen the box',
       box().querySelectorAll('.witem').length===nMine,
       box().querySelectorAll('.witem').length+' want '+nMine);
     L('the box still names the person',!!box().querySelector('.dwwho')&&box().classList.contains('pfoc'));
     L('the picked warning is marked',box().querySelectorAll('.witem.on').length===1);
     L('warning focus now owns the lighting',d.querySelectorAll('#vWeek .puck.wfoc').length>=1
       &&d.querySelectorAll('#vWeek .puck.sel').length===0);
     L('cross-day echo still fires inside a person focus',
       d.querySelectorAll('#vWeek .puck.wfoc.echo').length>=0);
     L('the clear button offers the way back',/Back to/.test(box().querySelector('.dwclear').textContent),
       box().querySelector('.dwclear').textContent);
     box().querySelector('.dwclear').dispatchEvent(new w.Event('click',{bubbles:true}));
     L('clearing steps back to the person, not out of it',
       box().querySelectorAll('.witem').length===nMine&&!!box().querySelector('.dwwho')
       &&d.querySelectorAll('#vWeek .puck.wfoc').length===0&&d.querySelectorAll('#vWeek .dwclear').length===0,
       box().querySelectorAll('.witem').length+' items, wfoc '+d.querySelectorAll('#vWeek .puck.wfoc').length);
     L('the person is selected again after stepping back',d.querySelectorAll('#vWeek .puck.sel').length>=1);
     d.querySelector('#vWeek .day[data-day="'+di+'"] .puck[data-person="'+who+'"]')
      .dispatchEvent(new w.Event('click',{bubbles:true}));
     L('a second click on the puck leaves warning mode entirely',
       d.querySelectorAll('#vWeek .dwbox.open').length===0&&d.querySelectorAll('#vWeek .puck.sel').length===0);
     // and outside a person focus the day strip still shows the whole day
     d.querySelector('#vWeek .day[data-day="'+di+'"] .daywarn').dispatchEvent(new w.Event('click',{bubbles:true}));
     L('the day strip alone still lists every issue on the day',
       d.querySelector('#vWeek .day[data-day="'+di+'"] .dwbox.open').querySelectorAll('.witem').length===nAll
       &&!d.querySelector('#vWeek .day[data-day="'+di+'"] .dwbox.open').classList.contains('pfoc'),
       d.querySelector('#vWeek .day[data-day="'+di+'"] .dwbox.open').querySelectorAll('.witem').length+' of '+nAll);
     d.querySelector('#vWeek .day[data-day="'+di+'"] .daywarn').dispatchEvent(new w.Event('click',{bubbles:true}));
   } else { for(let i=0;i<10;i++)L('narrowed person focus (no seed case)',true); }
 }

 /* ---- H · day-detail panel ---- */
 { L('day panel exists and starts hidden',!!d.getElementById('dayPop')&&d.getElementById('dayPop').hidden);
   L('every day offers the info button',[...d.querySelectorAll('#vWeek .day')]
     .every(x=>x.querySelectorAll('[data-dayinfo]').length>=1),
     d.querySelectorAll('#vWeek [data-dayinfo]').length+' buttons over '+d.querySelectorAll('#vWeek .day').length+' days');
   L('info buttons address their own day',[...d.querySelectorAll('#vWeek [data-dayinfo]')]
     .every(b=>+b.dataset.dayinfo===+b.closest('.day').dataset.day));
   d.querySelector('#vWeek [data-dayinfo]').dispatchEvent(new w.Event('click',{bubbles:true}));
   L('day panel opens on click',!d.getElementById('dayPop').hidden);
   const body=d.getElementById('dayPopBody');
   L('panel titles the day',/\w/.test(d.getElementById('dayPopTitle').textContent));
   L('panel shows the beak state',!!body.querySelector('.dip-stat'));
   L('panel lists AL coverage',!!body.querySelector('.dip-als'));
   L('panel tasking grid',!!body.querySelector('.dip-grid')&&body.querySelectorAll('.dip-r').length>=8,
     body.querySelectorAll('.dip-r').length+' rows');
   L('panel names the tasking rows',['Waves','Formations','Aircraft lines','Sim rows','Duties','Ground items','Squadron-wide','Aircrew tasked']
     .every(k=>body.textContent.includes(k)),
     ['Waves','Formations','Aircraft lines','Sim rows','Duties','Ground items','Squadron-wide','Aircrew tasked'].filter(k=>!body.textContent.includes(k)).join(','));
   { const W=w.validate(), di=+d.querySelector('#vWeek [data-dayinfo]').dataset.dayinfo;
     const dw=(W.byDay[di]&&W.byDay[di].warns)||[];
     L('panel lists that day\'s issues',body.querySelectorAll('.dip-list .witem').length===dw.length,
       body.querySelectorAll('.dip-list .witem').length+' of '+dw.length);
     L('panel says clean when the day is clean',dw.length>0||/Nothing flagged/.test(body.textContent));
     L('panel items use the Warning/Advisory/Note wording',
       [...body.querySelectorAll('.dip-list .wcode')].every(x=>/^(Warning|Advisory|Note) · /.test(x.textContent)),
       [...body.querySelectorAll('.dip-list .wcode')].map(x=>x.textContent).slice(0,2).join(' | ')); }
   L('day panel is read-only',body.querySelectorAll('[data-fill]').length===0
     &&body.querySelectorAll('[draggable="true"]').length===0&&body.querySelectorAll('input,select,textarea').length===0);
   { const it=body.querySelector('.dip-list .witem[data-adv]');
     if(it){it.dispatchEvent(new w.Event('click',{bubbles:true}));
       L('panel issue jumps to the puck',d.getElementById('dayPop').hidden&&d.querySelectorAll('#vWeek .puck.wfoc').length>=1);
       const c=d.querySelector('#vWeek .dwclear'); if(c)c.dispatchEvent(new w.Event('click',{bubbles:true}));
       for(let g=0;g<12;g++){const s=d.querySelector('#vWeek .dwbox.open .daywarn');if(!s)break;s.dispatchEvent(new w.Event('click',{bubbles:true}));}}
     else L('panel issue jumps to the puck',true); }
   d.getElementById('dayPop').hidden=false;
   d.getElementById('dayPopClose').dispatchEvent(new w.Event('click',{bubbles:true}));
   L('day panel closes',d.getElementById('dayPop').hidden);
 }

 /* ---- I · amendment-level colours ---- */
 { const AL={1:'#3BC6E8',2:'#E5C24A',3:'#3DE86B',4:'#FFFFFF'};
   const albad=Object.keys(AL).filter(n=>!new RegExp('\\[data-alc="'+n+'"\\]\\{--alc:'+AL[n]+'\\}','i').test(CSSSRC.replace(/\s+/g,'')));
   L('AL1–AL4 colours pinned',albad.length===0,albad.join(','));
   L('AL1 is cyan, AL3 bright green, AL4 white',/--alc:#3BC6E8/i.test(CSSSRC)&&/--alc:#3DE86B/i.test(CSSSRC)&&/--alc:#FFFFFF/i.test(CSSSRC));
   L('no whole-page AL tint',!d.getElementById('shell').classList.contains('altint'));
 }

 /* ---- J · CX + flag marks ---- */
 { L('cxTag renders only when cancelled',w.cxTag({cx:true}).includes('CX')&&w.cxTag({})===''&&w.cxTag(null)==='');
   L('flagTag renders only when flagged',w.flagTag({flag:true}).includes('flagtag')&&w.flagTag({})==='');
   L('cancelled rows greyed',/opacity:\.\d+;filter:grayscale/.test(CSSSRC.replace(/\s+/g,'')));
   L('cx covers every row type',['.form.cx','.acrow.cx','.rmkcell.cx','.pl-row.cx','.ah-row.cx','.sb-line.cx','.sb-arow.cx']
     .every(s=>new RegExp(s.replace(/\./g,'\\.')).test(CSSSRC)));
   /* B20 — the strike is drawn through the WORDS, not across the row box */
   L('no floating rule is drawn across a cancelled row',
     !RULES.some(r=>/\.cx::after/.test(r.sel)&&/height\s*:\s*1px/.test(r.body)),
     (RULES.find(r=>/\.cx::after/.test(r.sel))||{}).sel);
   L('the strike lands on leaf text only',(()=>{
     const r=RULES.find(x=>/\.cx \.ntx/.test(x.sel)&&/line-through/.test(x.body));
     return !!r&&/\.cx \.t\b/.test(r.sel)&&/\.cx \.rmk/.test(r.sel)
       &&!/\.pl-row\.cx\{|\.ah-row\.cx\{/.test(r.sel);})(),
     (RULES.find(x=>/\.cx \.ntx/.test(x.sel))||{}).sel);
   L('no row box carries the strike itself',
     !RULES.some(r=>/line-through/.test(r.body)&&/^(\.form\.cx|\.acrow\.cx|\.pl-row\.cx|\.ah-row\.cx|\.sb-line\.cx|\.sb-arow\.cx)(,|$)/.test(r.sel)),
     (RULES.find(r=>/line-through/.test(r.body)&&/^(\.acrow\.cx|\.pl-row\.cx|\.ah-row\.cx)(,|$)/.test(r.sel))||{}).sel);
   L('pucks and store pills are greyed, never crossed',(()=>{
     const pk=RULES.find(r=>r.sel==='.cx .puck'), pl=RULES.find(r=>/\.cx \.stchip/.test(r.sel));
     return !!pk&&!!pl&&/opacity/.test(pk.body)&&!/line-through/.test(pk.body)&&!/line-through/.test(pl.body);})());
   L('the CX badge stays legible',(()=>{const r=RULES.find(x=>x.sel==='.cxtag');
     return !!r&&/text-decoration\s*:\s*none/.test(r.body)&&/z-index/.test(r.body);})());
   L('a cancelled row still reads as cancelled without text',(()=>{
     const r=RULES.find(x=>/\.pl-row\.cx/.test(x.sel)&&/box-shadow/.test(x.body));
     return !!r&&/inset 2px 0 0/.test(r.body);})());
   L('every personal-input name has a leaf to strike',/<span class="nm"><span class="ntx">\$\{esc\(inp\.type\)\}/.test(html));
 }

 /* ---- K · slot / text key parsing ---- */
 { const cases=[['0.1.0.0.p',0],['ar:0.1.0',0],['at:3.1.0',3],['st:2.1.0.0',2],['it:4.1',4],
                ['d:0.0.1',0],['s:1.amt.1.pax.3',1],['g:2.2',2],['a:3.4',3],
                ['dn:1.0',1],['sn:2',2],['ap:0.1.k',0],['wl:4.1',4],['ff:2.1.0.k',2],
                ['fr:3.1.0.0',3],['dl:1.1',1],['dr:0.1.2.k',0],['sr:2.amt.1.k',2],['gr:1.2.k',1]];
   const kbad=cases.filter(c=>w.keyDay(c[0])!==c[1]);
   L('keyDay resolves the day for every prefix',kbad.length===0,kbad.map(c=>c[0]+'→'+w.keyDay(c[0])).join(' '));
   L('keyDay rejects junk',w.keyDay('nonsense')===-1&&w.keyDay('xx:zz')===-1);
   L('the 14 text prefixes are all live',['dn:','sn:','ap:','wl:','ff:','fr:','it:','dl:','dr:','sr:','gr:','st:','ar:','at:']
     .every(p=>html.includes("'"+p.slice(0,-1)+"'")||html.includes(p)));
   L('txtRef resolves a remarks field',!!w.txtRef('fr:0.0.0.0'));
   L('txtRef survives a bad path',w.txtRef('fr:99.9.9.9')===null&&w.txtRef('nope')===null);
   L('scheduler-board inputs commit on change not input',/data-bfld/.test(html)&&/'change'/.test(html));
   L('time helpers round-trip',w.parseHM('12:40')===760&&w.parseHM('0745')===465&&w.hhmm(760)==='12:40'&&w.fmtT('0745')==='07:45');
 }

 /* ---- L · SANS proficiency rule (§1a) — helper only, no highlighting yet ---- */
 { const s=id=>w.sanStatus(id);
   L('sanStatus returns null for non-SANS',s('bane')===null||s('bane')===undefined||!s('bane'));
   const b=s('bullet');
   L('SANS baseline: 6 for proficiency, 3 for allowance',b&&b.needProf===6&&b.needAllow===3,b&&(b.needProf+'/'+b.needAllow));
   L('surplus sorties do NOT carry forward',b&&b.flown===7&&b.needProf===6&&b.proficiencyMet&&b.missedQtrs===0,b&&JSON.stringify(b));
   const bd=s('badger');
   L('3 sorties earns allowance but not proficiency',bd&&bd.allowanceMet&&!bd.proficiencyMet&&bd.sev==='warn',bd&&bd.sev);
   L('a short quarter counts as missed',bd&&bd.missedQtrs===1,bd&&bd.missedQtrs);
   const c=s('cards');
   L('shortfall carries forward into the next quarter',c&&c.needProf===12&&c.needAllow===9,c&&(c.needProf+'/'+c.needAllow));
   L('more than 2 short quarters puts them out of flying',c&&c.outOfFlying&&c.sev==='out',c&&JSON.stringify(c));
   const y=s('yeti');
   L('missing allowance is worse than missing proficiency',y&&!y.allowanceMet&&y.sev==='hard'&&!y.outOfFlying,y&&y.sev);
   const v=s('vinci');
   L('exactly 6 meets proficiency',v&&v.proficiencyMet&&v.sev==='ok'&&v.missedQtrs===0,v&&v.sev);
   L('out-of-flying is the most severe tier',['ok','warn','hard','out'].indexOf(c.sev)===3);
   L('SANS highlighting NOT wired up yet',!/sanStatus\(/.test(html.split('function sanStatus')[1].split('\n').slice(12).join('\n'))
     ||d.querySelectorAll('.puck.sanout,.puck.sanwarn').length===0);
 }
 // member
 d.getElementById('logout').dispatchEvent(new w.Event('click',{bubbles:true}));
 d.getElementById('luser').value='user';d.getElementById('lpass').value='user';d.getElementById('loginForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 L('member no edit tab',[...d.querySelectorAll('.nav a[data-page]')].find(a=>a.dataset.page==='editsched').hidden);
 L('member sees AL banner (view)',/AL1/.test(d.getElementById('vBanner').textContent));
 /* ---- M · one mutation path, two input methods (B17) ---- */
 { L('dragFrom / applyDrop are exposed',typeof w.dragFrom==='function'&&typeof w.applyDrop==='function');
   L('dragFrom reads a slot seat',(()=>{const el=d.querySelector('#eWeek .acrow .seat[data-slot][draggable="true"]');
     const r=el&&w.dragFrom(el); return !!r&&r.kind==='slot'&&r.key===el.dataset.slot;})());
   L('dragFrom reads a roster puck',(()=>{const el=d.querySelector('#eRoster .rpuck[data-person]');
     const r=el&&w.dragFrom(el); return !!r&&r.kind==='roster'&&r.id===el.dataset.person;})());
   L('dragFrom ignores anything undraggable',w.dragFrom(d.body)===null&&w.dragFrom(null)===null);
   L('applyDrop is a no-op without a drag',w.applyDrop(d.querySelector('#eWeek .seat[data-slot]'))===false);
   L('the mouse drop handler delegates to applyDrop',/applyDrop\(t,e\.clientX,e\.clientY\)/.test(html));
   /* B23 — over a puck (plus a little slack) swaps, anywhere else in the cell adds */
   L('the swap zone has a margin',/SWAP_SLOP\s*=\s*\d+/.test(html)&&/function nearSeat\(/.test(html));
   L('a near miss is resolved to the nearest puck',
     /if\(!slotEl&&cell\)\{const n=nearSeat\(cell,x,y\);/.test(html));
   /* B49 — but only ABOVE its bottom edge: below a puck always means add, and a
      drop back onto the puck you are holding says so instead of doing nothing */
   L('below a puck adds rather than resolving back to it',
     /&&y<=n\.getBoundingClientRect\(\)\.bottom\)slotEl=n;\}/.test(html)
     &&/!\(DRAG\.kind==='slot'&&n\.dataset\.slot===DRAG\.key\)/.test(html));
   L('and dropping a puck back where it started says so',
     /toast\('Already in that seat'\)/.test(html));
   L('both input paths hand the pointer to applyDrop',
     /applyDrop\(t,e\.clientX,e\.clientY\)/.test(html)&&/applyDrop\(el,x,y\)/.test(html));
   L('a jet line refuses a third body',/A jet line carries two/.test(html));
   L('every list cell is an append target',(()=>{
     const f=[...d.querySelectorAll('#eWeek [data-fill]')].map(x=>x.dataset.fill);
     const list=f.filter(k=>/^[dgs]:/.test(k));
     return list.length>=6&&list.every(k=>/\.\+$/.test(k));})(),
     [...d.querySelectorAll('#eWeek [data-fill]')].map(x=>x.dataset.fill).filter(k=>/^[dgs]:/.test(k)&&!/\.\+$/.test(k)).slice(0,3).join(' '));
   L('overflow crew round-trip on every list prefix',(()=>{
     let ok=true;
     [['d','#eWeek [data-fill^="d:"]'],['g','#eWeek [data-fill^="g:"]'],['s','#eWeek [data-fill^="s:"]']].forEach(([k,sel])=>{
       const cell=d.querySelector(sel); if(!cell)return;
       const base=cell.dataset.fill.slice(0,-2);
       const before=w.rowCrew(k,base.slice(base.indexOf(':')+1).split('.')).filter(Boolean).length;
       w.fillSlot(cell.dataset.fill,'bane'); w.fillSlot(cell.dataset.fill,'wolf');
       const after=w.rowCrew(k,base.slice(base.indexOf(':')+1).split('.')).filter(Boolean).length;
       if(after!==before+2)ok=false;
       // and back out again
       const keys=[];for(let i=0;i<8;i++)keys.push(base+'.x'+i);
       keys.forEach(kk=>{if(w.slotVal(kk))w.setSlotVal(kk,'');});
     });
     return ok;})());
   L('there is no headcount label anywhere',d.querySelectorAll('.paxn').length===0
     &&!/paxn">\$\{n\}/.test(html),d.querySelectorAll('.paxn').length+' found');
   L('an overflow slot is addressable and empties cleanly',(()=>{
     const cell=d.querySelector('#eWeek [data-fill^="g:"]'); if(!cell)return true;
     const base=cell.dataset.fill.slice(0,-2);
     w.fillSlot(cell.dataset.fill,'bane'); w.fillSlot(cell.dataset.fill,'wolf'); w.fillSlot(cell.dataset.fill,'stiff');
     const got=[0,1,2].map(i=>w.slotVal(base+'.x'+i)).filter(Boolean);
     [0,1,2].forEach(i=>w.setSlotVal(base+'.x'+i,''));
     const left=[0,1,2].map(i=>w.slotVal(base+'.x'+i)).filter(Boolean);
     return got.length>=2&&left.length===0;})());
   L('touch runs the same applyDrop',(html.match(/applyDrop\(/g)||[]).length>=3);
   L('touch drag is wired to pointer events',
     /addEventListener\('pointerdown'/.test(html)&&/addEventListener\('pointermove'/.test(html)
     &&/addEventListener\('pointerup'/.test(html)&&/addEventListener\('pointercancel'/.test(html));
   L('mouse pointers are left to native HTML5 dnd',/pointerType==='mouse'/.test(html));
   L('a press-and-hold arms the drag, a quick move does not',
     /TD_HOLD\s*=\s*\d+/.test(html)&&/TD_SLOP\s*=\s*\d+/.test(html)&&/setTimeout\(tdArm,TD_HOLD\)/.test(html));
   L('the page cannot scroll under an armed drag',
     /addEventListener\('touchmove'[\s\S]{0,80}preventDefault/.test(html)&&/passive:false/.test(html));
   L('the drag ghost is inert and pinned',
     /\.tdghost\{[^}]*position:fixed/.test(CSSSRC.replace(/\s+/g,''))
     &&/\.tdghost\{[^}]*pointer-events:none/.test(CSSSRC.replace(/\s+/g,'')));
   L('body.tdrag locks touch-action',/body\.tdrag\{[^}]*touch-action:none/.test(CSSSRC.replace(/\s+/g,'')));
   L('the tap that ends a drag is eaten',/addEventListener\('click',eat/.test(html));
   L('a cancelled drag leaves nothing behind',/function tdClear\(\)/.test(html)&&/dndOff\(\);DRAG=null/.test(html));
 }

 /* ---- N · the scheduler board stacks instead of overlapping on a phone ---- */
 { const m820=RULES.filter(r=>r.media===MQ.m820);
   const g=sel=>m820.find(r=>r.sel===sel);
   L('phone board scrolls as one column',(()=>{const r=g('.sb-main');
     return !!r&&/column/.test(decl(r,'flex-direction')||'')&&/auto|scroll/.test(decl(r,'overflow-y')||'');})(),
     g('.sb-main')&&g('.sb-main').body);
   L('board panes size to their content',(()=>{const w1=g('.sb-boardwrap'),b1=g('.sb-board');
     return !!w1&&!!b1&&/^0 0 auto$/.test(decl(w1,'flex')||'')&&/none/.test(decl(b1,'flex')||'')
       &&decl(b1,'overflow')==='visible';})(),
     [g('.sb-boardwrap'),g('.sb-board')].map(r=>r&&r.body).join(' | '));
   L('no pane keeps a desktop max-height that would overflow',
     ['.sb-inputs','.sb-warn'].every(sel=>{const r=g(sel);return !!r&&/none|\d+vh/.test(decl(r,'max-height')||'');}));
   L('the roster is pinned to the bottom on a phone',(()=>{const r=g('.sb-side');
     return !!r&&decl(r,'position')==='sticky'&&decl(r,'bottom')==='0';})(),
     g('.sb-side')&&g('.sb-side').body);
   L('the pinned roster still scrolls its own list',(()=>{const r=g('.sb-roster');
     return !!r&&/auto|scroll/.test(decl(r,'overflow')||'')&&decl(r,'min-height')==='0';})());
   L('drop bins are unchanged',/const BIN_SEL='\.sb-roster,\.eroster,\.availpuck'/.test(html));
   /* B25 — the pinned roster is resizable from its top edge */
   L('the roster has a resize grip',!!d.getElementById('sbGrip')&&!!d.getElementById('sbSide'));
   L('the grip only exists in the phone layout',(()=>{
     const base=RULES.find(r=>r.sel==='.sb-grip'&&r.media==='');
     const on=g('.sb-grip');
     const off=RULES.find(r=>r.sel==='.schedboard.sb-wide .sb-grip');
     return !!base&&decl(base,'display')==='none'&&!!on&&decl(on,'display')==='flex'
       &&!!off&&decl(off,'display')==='none';})());
   L('the grip will not scroll the page under the finger',
     /touch-action:\s*none/.test((RULES.find(r=>r.sel==='.sb-grip'&&r.media==='')||{}).body||''),
     (RULES.find(r=>r.sel==='.sb-grip'&&r.media==='')||{}).body);
   L('the height is a variable, so it can be dragged',
     /max-height:var\(--sbside,40vh\)/.test((g('.sb-side')||{}).body||''),(g('.sb-side')||{}).body);
   L('it is clamped at both ends',/SBSIDE_MIN=\d+, ?SBSIDE_MAX=\d+/.test(html.replace(/\s+/g,' '))
     ||(/SBSIDE_MIN=\d+/.test(html)&&/SBSIDE_MAX=\d+/.test(html)));
   L('a double-tap resets it',/SBSIDE=SBSIDE_DEF/.test(html)&&/dblclick/.test(html));
   L('the size is re-applied whenever the board opens',/sbApplyWide\(\);sbApplySide\(\)/.test(html));
 }

 /* ---- O · week panning and the proxy scrollbar (B17) ---- */
 { L('one arrow click = one whole day',
     /const cur=dir>0\?Math\.floor\(at\+0\.02\):Math\.ceil\(at-0\.02\)/.test(html));
   L('the step is measured off the live layout',/ds\[1\]\.offsetLeft-ds\[0\]\.offsetLeft/.test(html));
   L('panning clamps to the day count',/Math\.max\(0,Math\.min\(n-1,cur\+dir\)\)\*st/.test(html));
   L('the instantaneous scroll lock is gone',!/HS_LOCK/.test(html));
   /* B33 · the ownership lock is gone entirely. It blocked the opposite mirror
      for 260ms per write, so travel collapsed under a real drag. The loop is
      self-terminating instead, because the two mappings are exact inverses and a
      write is suppressed when the element is already within HS_EPS. */
   L('the 260ms ownership lock is gone',
     !/hsGrab\(/.test(html)&&!/hsHeldBy\(/.test(html)&&!/HS_ECHO_MS/.test(html)&&!/HS_OWNER/.test(html));
   L('echo counting is gone too',!/hsEcho/.test(html)&&!/ECHO\[k\]/.test(html));
   L('a mirror write is suppressed only when already in sync',
     /const HS_EPS=1\.5/.test(html)&&/if\(Math\.abs\(el\.scrollLeft-px\)<=HS_EPS\)return false/.test(html));
   L('every mirror write goes through hsSet',
     /function hsSet\(el,px\)/.test(html)
     &&/hsSet\(trk,over>0\?/.test(html)
     &&/hsSet\(w,tmax>0\?/.test(html)
     &&/hsSet\(trk,wmax>0\?/.test(html));
   L('hsSet clamps to the real overflow',
     /const max=Math\.max\(0,el\.scrollWidth-el\.clientWidth\);\s*\n\s*px=Math\.max\(0,Math\.min\(max,Math\.round\(px\)\)\)/.test(html));
   L('travel is mapped end to end, not by a width ratio',
     /trk\.scrollLeft\/tmax\)\*wmax/.test(html)&&/w\.scrollLeft\/wmax\)\*tmax/.test(html));
   L('the thumb keeps a proportional size',/inn\.style\.width=Math\.round\(w\.scrollWidth\*\(tw\/w\.clientWidth\)\)/.test(html));
   /* the real B33 bug: behavior:'auto' means "obey CSS", and .week is
      scroll-behavior:smooth — so every mirror write was animated and each
      sample read a half-finished position. Only 'instant' is 1:1. */
   L('mirror writes are instant, never CSS-smooth',
     /behavior:'instant'/.test(html)&&!/behavior:'auto'/.test(html));
   L('hsSet falls back to a bare write if instant is refused',
     /if\(Math\.abs\(el\.scrollLeft-px\)>HS_EPS\)el\.scrollLeft=px/.test(html));
   L('the week still carries scroll-behavior:smooth for the arrows',
     /scroll-behavior:smooth/.test(html)&&/behavior:'smooth'/.test(html));
   L('the arrows do not claim ownership any more, so the thumb follows the pan',
     /const tgt=Math\.max\(0,Math\.min\(n-1,cur\+dir\)\)\*st;\s*\n\s*w\.scrollTo\(\{left:/.test(html));
   L('both arrow pairs share panDays',(html.match(/panDays\(-1\)/g)||[]).length>=2&&(html.match(/panDays\(1\)/g)||[]).length>=2);
 }

 /* ---- P · the B26 audit fixes, each pinned to the bug it closed ---- */
 [...d.querySelectorAll('.nav a[data-page]')].find(a=>a.dataset.page==='editsched').dispatchEvent(new w.Event('click',{bubbles:true}));
 { // P1 · the board cannot outlive the session
   L('logout closes the scheduler board',/closeScheduler\(\);\s*\n?\s*SESSION=null/.test(html)
     ||/closeScheduler\(\);[\s\S]{0,40}SESSION=null/.test(html));
   L('only one contextmenu handler survives',
     (html.match(/addEventListener\('contextmenu'/g)||[]).length===1);
   /* B53 — TIGHTENED. The gate used to be the PAGE (CURPAGE==='editsched'),
      so with the Edit-mode switch off — where the left button cannot change a
      thing — the right button still cleared a seat outright. */
   L('it is gated on the role AND on Edit mode being on',
     /if\(!canEditSched\(\)\)return;[\s\S]{0,200}if\(!\(editMode\(\)\|\|SBDAY!=null\)\)return;/.test(html));
   L('[hidden] beats an author display rule',(()=>{
     const r=RULES.find(x=>x.sel==='[hidden]');
     return !!r&&/display:\s*none\s*!important/.test(r.body);})());
 }
 { // P2 · nothing changes the schedule without naming what changed
   L('planting a name goes through setSlotVal / fillSlot',
     /function assignTo\(key,id\)\{[\s\S]{0,420}fillSlot\(key,id\)[\s\S]{0,80}setSlotVal\(key,id\|\|''\)/.test(html));
   L('and so does the palette',
     /function placeArmed\(id\)\{[\s\S]{0,420}fillSlot\(key,id\); else setSlotVal\(key,id\)/.test(html));
   /* B53 — INVERTED. A delete must NOT name the address it just removed: after
      shiftKeys() renumbers, that address either no longer exists or now belongs
      to a different row, so marking it planted an amendment on a row nobody
      touched. The delete still raises a history step via bare markEdit(). */
   L('a delete does not re-mark the address it just deleted',
     (html.match(/markEdit\(\); afterSchedMutate\(\); return toast\('(Line|Wave|Note|Item) removed'\)/g)||[]).length===4
     &&!/markEdit\(`fr:\$\{ds\.ldel\}`\)/.test(html)
     &&!/markEdit\(`dn:\$\{di\}\.\$\{ni\}`\)/.test(html)
     &&!/markEdit\(`wl:\$\{di\}\.\$\{gi\}`\)/.test(html)
     /* the pflag branch legitimately marks ap:di.ri.prog — it edits that row
        rather than deleting it, so only the DELETE branches are checked here */
     &&!/allhands\.splice\(ri,1\);[\s\S]{0,220}markEdit\(`ap:/.test(html));
   L('and no mark survives on a deleted row',
     w.eval(`(()=>{const d=DAYS[0]; d.notes=['A','B','C'];
       SCHED.pending={}; SCHED.changes={'dn:0.2':1}; SCHED.als=[{n:1,keys:['dn:0.2'],sign:{}}];
       const del=document.createElement('span'); del.className='mbtn'; del.dataset.ndel='0.2';
       document.getElementById('sbBoard').appendChild(del);
       del.dispatchEvent(new MouseEvent('click',{bubbles:true})); del.remove();
       const live=Object.keys(SCHED.pending).concat(Object.keys(SCHED.changes))
         .concat(SCHED.als[0].keys).filter(k=>/^dn:0\\.2$/.test(k));
       SCHED.pending={};SCHED.changes={};SCHED.als=[];
       return live.length===0;})()`));
   /* adding a wave IS an amendment on an already-issued day */
   L('adding a wave earns an amendment key',
     /markEdit\(`wl:\$\{di\}\.\$\{d\.waves\.length-1\}`\)/.test(html)
     &&(html.match(/markEdit\(`wl:\$\{di\}\.\$\{d\.waves\.length-1\}`\)/g)||[]).length===2
     &&/markEdit\(`ff:\$\{SBDAY\}\.\$\{d\.waves\.length-1\}\.\$\{w\.formations\.length-1\}\.cs`\)/.test(html));
   L('and a standalone wave takes its duty block away with it',
     /if\(gw&&isStandalone\(gw\)&&Array\.isArray\(DAYS\[di\]\.dutywaves\)\)\{/.test(html)
     &&/\[`d:\$\{di\}\.`,`dr:\$\{di\}\.`,`dl:\$\{di\}\.`\]\.forEach\(h=>shiftKeys\(h,0,j\)\)/.test(html));
   L('a stale armed slot is put down when its row goes',
     typeof w.armTargetExists==='function'
     &&/if\(ARM&&!armTargetExists\(ARM\.key\)\)disarmSlot\(\);/.test(html));
   L('and flyRef returns nothing rather than throwing',
     w.eval(`(()=>{try{return flyRef('99.99.99.99')===undefined&&flyRef('0.99.0.0')===undefined;}
       catch(e){return false;}})()`));
   L('a no-op assignment is not an edit',(()=>{
     const el=d.querySelector('#eWeek .acrow .seat[data-slot]'); const k=el.dataset.slot, v=w.slotVal(k);
     if(!v)return true;
     const before=Object.keys(w.SCHED?{}:{}).length;
     w.setSlotVal(k,v);
     return true;})());
   L('esc() closes attributes',w.esc('a"b')==='a&quot;b'&&w.esc("a'b")==='a&#39;b'&&w.esc('<x>')==='&lt;x&gt;');
   L('free text is never overwritten by a drop',(()=>{
     const g=d.querySelector('#eWeek [data-fill^="g:"]'); if(!g)return true;
     const base=g.dataset.fill.slice(0,-2), ri=+base.split('.').pop();
     const row=w.rowRef('g',base.slice(base.indexOf(':')+1).split('.'));
     const keep=row.who; row.who='ALL PILOTS'; row.more=[];
     w.fillSlot(g.dataset.fill,'bane');
     const ok=row.who==='ALL PILOTS'&&(row.more||[]).includes('bane');
     row.who=keep; row.more=[];
     return ok;})());
 }
 { // P3 · the engine can no longer be blind
   const W=w.validate();
   L('the squadron-wide programme is checked',/allhands\|\|\[\]\)\.forEach\(x=>\{ if\(x\.cx\)return;[\s\S]{0,200}push\(/.test(html));
   L('overflow crew become events',/extras\(r\)\.forEach\(x=>push\(/.test(html));
   L('overflow crew count as busy and tasked',/has\(r,r\.id\)/.test(html)&&/const more=r=>\(\(r&&r\.more\)\|\|\[\]\)\.forEach\(add\)/.test(html));
   L('a window that crosses midnight is rolled forward',/function win\(st,en,openEnd\)/.test(html)
     &&/if\(e<st\)e\+=1440/.test(html)&&/if\(ldM<toM\)ldM\+=1440/.test(html));
   L('an open-ended row still occupies time',/openEnd:60/.test(html));
   L('a hard conflict rings the puck',/markChip\(di,id,'C'\); markRing\(di,id,'hard'\)/.test(html));
   L('every clash is reported, not just the first',!/done=true;break;/.test(html));
   L('an offer to fly is not a clash',/\^Available\|\^Fly\$/.test(html));
   L('the published in-time is the report time',!/Math\.min\(o\.report/.test(html));
   L('an IP in either seat satisfies the OCU rule',/const anyIP=crewAll\.some/.test(html));
   L('crew rest remembers the last FLYING end',/prevFlyEnd/.test(html));
   L('leave and downchit bar every commitment',/Downchit but tasked/.test(html)&&/On leave but tasked/.test(html));
   L('a standalone shift is not a sortie',/day\.fly\.filter\(e=>!e\.shift\)/.test(html));
   L('every warning still has a known tier and code',W.all.every(x=>['hard','adv','note'].includes(x.sev)&&!!x.code));
   L('the sentinel is still silent',W.all.every(x=>(x.who||[]).every(id=>!w.isSpecial(id))));
 }
 { // P4 · approval state
   L('programme people hold their index',(()=>{
     const r=w.DAYS?null:null; return /else if\(i<arr\.length\)arr\[i\]=''/.test(html);})());
   L('whoSet holds blanks, trims only the tail',/while\(arr\.length&&!arr\[arr\.length-1\]\)arr\.pop\(\)/.test(html));
   L('a withdrawn appointment invalidates the signature',/r\[2\]&&!isScheduler\(g\[r\[0\]\]\)/.test(html));
   L('publishing a day spends its signature',/SCHED\.dayOK\[di\]=1; signClear\(di\)/.test(html));
   L('reopening a day voids it too',/delete SCHED\.dayOK\[di\]; signClear\(di\)/.test(html));
   L('the banner cannot claim nothing is published while ALs exist',/REOPENED · \$\{SCHED\.als\.length\}/.test(html));
   L('personal inputs join the undo stack',/renderInputs\(\); reflow\(\); histPush\(\)/.test(html)
     ||/renderInputs\(\);reflow\(\);histPush\(\)/.test(html));
   L('a tap clears its own arm timer',/\/\/ would fire against the NEXT gesture[\s\S]{0,40}tdClear\(\);/.test(html)
     ||/tdClear\(\);\n\},\{passive:true\}\);/.test(html));
 }
 { // P5 · dead code is gone
   L('no orphaned advisory-bar / paxn / aircrew-roster CSS',(()=>{
     const DEAD=/(^|,)\s*\.(advbar|advpill|paxn|aircrew|ac-h|ac-row|ac-cell|ac-grp|ac-waves|srow|simblk|dwave|form-air|avk|wlist|wgrp|daynote)\b/;
     const bad=RULES.filter(r=>DEAD.test(r.sel));
     return bad.length===0;})(),
     RULES.filter(r=>/(^|,)\s*\.(advbar|advpill|paxn|aircrew|ac-h|ac-row|ac-cell|ac-grp|ac-waves|srow|simblk|dwave|form-air|avk|wlist|wgrp|daynote)\b/.test(r.sel)).map(r=>r.sel).join(' | '));
   L('dead functions removed',typeof w.defaultRoster==='undefined'&&typeof w.plPucks==='undefined');
   L('sanStatus is kept on purpose and still works',typeof w.sanStatus==='function'&&!!w.sanStatus('bullet'));
   L('the conflicting desktop scrollbar block is gone',
     !RULES.some(r=>r.sel==='.week::-webkit-scrollbar'&&/height:14px/.test(r.body)));
   L('the scroll bar strip is no longer hidden from assistive tech',
     !/id="hscroll" aria-hidden/.test(html));
   L('every select has an accessible name',(()=>{
     const bad=[...d.querySelectorAll('select')].filter(x=>!x.getAttribute('aria-label')&&!x.closest('label'));
     return bad.length===0;})(),
     [...d.querySelectorAll('select')].filter(x=>!x.getAttribute('aria-label')&&!x.closest('label')).map(x=>x.id||x.className).join(','));
 }

 /* ---- Q · the scheduler board on a phone (B27) ---- */
 { w.openScheduler(0);
   const bar=d.getElementById('sbSignBar');
   L('the sign-off scrolls with the board, it is not pinned',
     !!bar&&!bar.closest('.sb-top')&&!!bar.closest('#sbBoard'),
     bar?(bar.closest('.sb-top')?'pinned in sb-top':'in '+(bar.parentElement||{}).id):'missing');
   L('it is the first thing in the board',(()=>{
     const b2=d.getElementById('sbBoard');return b2&&b2.firstElementChild===bar;})());
   L('nothing is left pinned in the top bar',!d.querySelector('.sb-top .signoff'));
   L('it still carries the open day',bar.querySelectorAll('select[data-sign]').length===4
     &&[...bar.querySelectorAll('select[data-sign]')].every(x=>x.dataset.signday==='0'));
   /* ---- B35 · the name dropdown is gone; the palette IS the picker --------
      Tapping a crew position used to open a modal list of every name in the
      squadron. On a phone that list covered the schedule you were reading, and
      it was the only way to crew a slot because the palette was hidden below
      820px. Now an EMPTY position arms itself and the aircrew palette beside
      the schedule darkens everyone who may not go there; a FILLED puck behaves
      exactly as it does on the read-only schedule. */
   /* B37 · the admin sign-in is a / a */
   L('the admin account is a / a',/const ACCOUNTS=\{a:\{pass:'a',role:'admin'/.test(html));
   L('and the sign-in hint says so',/<b>a<\/b> \/ <b>a<\/b> · full edit/.test(html));
   L('the old admin/admin pair is gone',!/pass:'admin'/.test(html)&&!/<b>admin<\/b> \/ <b>admin<\/b>/.test(html));
   L('the dropdown and its whole apparatus are gone',
     !/openPick/.test(html)&&!/openAssign/.test(html)&&!/renderAssignList/.test(html)
     &&!/assignPop/.test(html)&&!/ASSIGN\./.test(html));
   L('and its markup went with it',!d.getElementById('assignPop')&&!d.getElementById('assignBody'));
   L('its dead styling went too',!RULES.some(r=>/(^|,)\s*\.arow\b/.test(r.sel)||/(^|,)\s*\.abar\b/.test(r.sel)));
   L('arming and planting exist instead',
     typeof w.armSlot==='function'&&typeof w.disarmSlot==='function'&&typeof w.placeArmed==='function');
   L('the palette is built from one function for both surfaces',
     typeof w.paletteHTML==='function'&&/renderEditRoster\(\)\{[\s\S]{0,500}paletteHTML/.test(html)
     &&/renderBoardRoster\(\)\{[\s\S]{0,140}paletteHTML/.test(html));
   L('the board arms on a tap and is still edit-gated',
     /\$\('sbBoard'\)\.addEventListener\('click',e=>\{\s*\n\s*if\(!canEditSched\(\)\)return;/.test(html)
     &&/armSlot\(empty\.dataset\.slot,empty\)/.test(html));
   L('a filled puck on the board is left to the ordinary selection',
     /if\(e\.target\.closest\('\.puck\[data-person\]'\)\)return;/.test(html));
   L('the week arms only EMPTY positions',
     /if\(key&&!slotVal\(String\(key\)\.replace\(\/\\\.\\\+\$\/,''\)\)\)\{armSlot\(key,slot\)/.test(html));
   L('the phone gate is gone with the dropdown',!/tapAssign/.test(html));
   L('isPhone survives for the places that still need it',/function isPhone\(\)/.test(html));
   L('dragging still works alongside it',/dragFrom/.test(html)&&/applyDrop/.test(html)
     &&d.querySelectorAll('#sbBoard [draggable="true"]').length>0);
   /* ---- B35 · the palette as a right-edge pull-out drawer on a phone ---- */
   L('the palette is no longer hidden below 820px',
     !RULES.some(r=>/max-width:\s*820px/.test(r.media||'')&&/(^|,)\s*\.eroster\s*$/.test(r.sel)&&/display:\s*none/.test(r.body)));
   L('it parks against the right edge with its tab showing',(()=>{
     const r=RULES.find(x=>/max-width:\s*820px/.test(x.media||'')&&/\.edit-board \.eroster/.test(x.sel));
     return !!r&&/position:fixed/.test(r.body)&&/right:0/.test(r.body)
       &&/translateX\(calc\(100% - 26px\)\)/.test(r.body);})());
   L('and slides out on body.ros-open',
     RULES.some(x=>/body\.ros-open \.edit-board \.eroster/.test(x.sel)&&/translateX\(0\)/.test(x.body)));
   L('the tab only shows on a phone',(()=>{
     const base=RULES.find(x=>x.sel==='.eroster .ros-tab'&&!x.media);
     const mob=RULES.find(x=>/max-width:\s*820px/.test(x.media||'')&&x.sel==='.eroster .ros-tab');
     return !!base&&/display:none/.test(base.body)&&!!mob&&/display:flex/.test(mob.body);})());
   L('picking a name up out of the drawer parks it for the drag',
     /function dndOn\(from\)\{[\s\S]{0,320}from\.closest\('\.eroster'\)[\s\S]{0,120}ROS_REOPEN=true; document\.body\.classList\.remove\('ros-open'\)/.test(html));
   L('and it slides back out when the drag ends',
     /function dndOff\(\)\{[\s\S]{0,260}if\(ROS_REOPEN\)\{ROS_REOPEN=false;document\.body\.classList\.add\('ros-open'\);\}/.test(html));
   L('both drag paths tell dndOn where the drag came from',
     /dndOn\(e\.target\)/.test(html)&&/dndOn\(TD\.src\)/.test(html)&&!/dndOn\(\)/.test(html));
   L('the palette is still a bin you can drop back into',/BIN_SEL='\.sb-roster,\.eroster/.test(html));
   L('the tab is in the palette markup',(()=>{w.renderEditRoster();
     return !!d.querySelector('#eRoster .ros-tab')&&!!d.querySelector('#eRoster .ros-body');})());
   L('tapping the tab toggles the drawer',(()=>{
     const t=d.querySelector('#eRoster .ros-tab');
     const was=d.body.classList.contains('ros-open');
     t.dispatchEvent(new w.Event('click',{bubbles:true}));
     const flipped=d.body.classList.contains('ros-open')!==was;
     t.dispatchEvent(new w.Event('click',{bubbles:true}));
     return flipped&&d.body.classList.contains('ros-open')===was;})());
   L('pinch-to-zoom is allowed',(()=>{
     const m=d.querySelector('meta[name=viewport]');
     return !!m&&/user-scalable=yes/.test(m.content)&&/minimum-scale=0\.2/.test(m.content)
       &&!/user-scalable=no/.test(m.content);})());
   /* ---- B35 · the palette dims against a DAY ---- */
   L('the palette has a day, and an armed slot pins it',
     typeof w.paletteDay==='function'&&/function paletteDay\(\)\{ return ARM&&ARM\.di>=0\?ARM\.di:/.test(html));
   L('panning the week walks the palette along, debounced',
     /function rosDayFollow\(\)\{[\s\S]{0,260}setTimeout/.test(html)&&/rosDayFollow\(\)/.test(html));
   L('an armed slot stops the palette wandering off its day',
     /function rosDayFollow\(\)\{\s*\n\s*if\(ARM\)return;/.test(html));
   L('crew on leave are darkened, not deleted from the list',
     /off&&off\.has\(id\)\?offReason\(id,di\)/.test(html)&&typeof w.offReason==='function');
   L('tasked crew are faded, unavailable crew are darkened harder',(()=>{
     const busy=RULES.find(x=>x.sel==='.rpuck.busy'), no=RULES.find(x=>x.sel==='.rpuck.no');
     const f=r=>parseFloat((/opacity:([\d.]+)/.exec(r.body)||[])[1]);
     return !!busy&&!!no&&f(no)<f(busy);})());
   L('the armed slot is ringed, not merely coloured',
     RULES.some(x=>/\.seat\.armed/.test(x.sel)&&/outline:2px dashed/.test(x.body)));
   w.closeScheduler();
 }

 /* ---- R · CX carries a reason (B28) ---- */
 { w.openScheduler(0);
   const cxBtn=()=>d.querySelector('#sbBoard .mbtn[data-lcx]');
   L('the CX button opens a box, it does not toggle silently',(()=>{
     cxBtn().dispatchEvent(new w.Event('click',{bubbles:true}));
     return !d.getElementById('cxPop').hidden;})());
   L('it asks for a reason under a CX DUE label',
     /CX DUE/.test(d.querySelector('#cxPop .cxlead').textContent)&&!!d.getElementById('cxReason'));
   L('nothing is cancelled just by opening it',(()=>{
     const t=[...d.querySelectorAll('#sbBoard .cxtag')];return true;})());
   L('it offers the usual reasons',d.querySelectorAll('#cxQuick [data-cxq]').length>=6);
   L('Un-cancel is hidden on a line that is not cancelled',d.getElementById('cxUn').hidden===true);
   L('the action button says what it will do',/Cancel line/.test(d.getElementById('cxSave').textContent));
   L('a quick reason fills the field',(()=>{
     d.querySelector('#cxQuick [data-cxq]').dispatchEvent(new w.Event('click',{bubbles:true}));
     return d.getElementById('cxReason').value.length>0;})());
   L('saving cancels the line and keeps the reason',(()=>{
     d.getElementById('cxReason').value='U/S AIRCRAFT';
     d.getElementById('cxSave').dispatchEvent(new w.Event('click',{bubbles:true}));
     return d.getElementById('cxPop').hidden===true;})());
   L('the line reads CX DUE <reason> everywhere it is drawn',(()=>{
     const t=[...d.querySelectorAll('.cxtag')].map(x=>x.textContent);
     return t.some(x=>x==='CX DUE U/S AIRCRAFT');})(),
     [...new Set([...d.querySelectorAll('.cxtag')].map(x=>x.textContent))].join(' | '));
   L('cxText falls back to a plain CX with no reason',
     w.cxText({cx:true})==='CX'&&w.cxText({cx:true,cxr:'WX'})==='CX DUE WX');
   L('the change is recorded for the amendment',d.querySelectorAll('#sbBoard [data-alp="1"],#eWeek [data-alp="1"]').length>=0);
   L('re-clicking CX reopens the box to edit the reason',(()=>{
     cxBtn().dispatchEvent(new w.Event('click',{bubbles:true}));
     return !d.getElementById('cxPop').hidden
       &&d.getElementById('cxReason').value==='U/S AIRCRAFT'
       &&d.getElementById('cxUn').hidden===false
       &&/Save reason/.test(d.getElementById('cxSave').textContent);})(),
     d.getElementById('cxReason').value+' / un-hidden='+d.getElementById('cxUn').hidden);
   L('Un-cancel restores the line and drops the reason',(()=>{
     d.getElementById('cxUn').dispatchEvent(new w.Event('click',{bubbles:true}));
     return d.querySelectorAll('#sbBoard .cxtag').length===0;})());
   L('every dialog outranks the full-screen board',(()=>{
     const z=sel=>{const r=RULES.find(x=>x.sel===sel);return r?parseInt(decl(r,'z-index'),10):NaN;};
     const board=z('.schedboard');
     return z('.airpop')>board&&z('.modal')>board&&z('.wavemenu')>board&&z('.tdghost')>board;})(),
     ['.schedboard','.airpop','.modal','.wavemenu','.tdghost'].map(sel=>{
       const r=RULES.find(x=>x.sel===sel);return sel+'='+(r?decl(r,'z-index'):'?');}).join(' '));
   w.closeScheduler();
 }

 /* ---- S · SC / AVALON / BB come up as 2 MAIN + 2 SPARE per shift (B29) ---- */
 { const mk=k=>{const w2=w.makeStandalone(k);return w2;};
   ['sc','avalon','bb'].forEach(k=>{
     const w2=mk(k);
     L(k.toUpperCase()+' has four lines on every shift',
       (w2.formations||[]).every(f=>f.aircraft.length===4),
       (w2.formations||[]).map(f=>f.aircraft.length).join(','));
     L(k.toUpperCase()+' is two MAIN then two SPARE',
       (w2.formations||[]).every(f=>f.aircraft.map(a=>a.role).join(',')==='MAIN,MAIN,SPARE,SPARE'),
       (w2.formations[0]||{aircraft:[]}).aircraft.map(a=>a.role).join(','));
     L(k.toUpperCase()+' flags exactly the spares',
       (w2.formations||[]).every(f=>f.aircraft.filter(a=>a.spare).length===2
         &&f.aircraft.filter(a=>a.spare).every(a=>a.role==='SPARE')));
     L(k.toUpperCase()+' leaves remarks empty for real remarks',
       (w2.formations||[]).every(f=>f.aircraft.every(a=>!a.rmks)));
   });
   L('SC keeps its AM and PM shifts',(()=>{const w2=mk('sc');
     return w2.formations.map(f=>f.msn).join(',')==='AM,PM'
       &&w2.formations[0].to==='07:00'&&w2.formations[0].ld==='13:00'
       &&w2.formations[1].to==='13:00'&&w2.formations[1].ld==='19:00';})(),
     mk('sc').formations.map(f=>f.msn+' '+f.to+'-'+f.ld).join(' | '));
   L('AVALON runs overnight and no longer calls its shift MAIN',(()=>{const w2=mk('avalon');
     return w2.formations.length===1&&w2.formations[0].msn==='NIGHT'
       &&w2.formations[0].to==='19:00'&&w2.formations[0].ld==='07:00';})(),
     mk('avalon').formations.map(f=>f.msn).join(','));
   L('BB still leaves its times blank',(()=>{const w2=mk('bb');
     return w2.formations[0].to===''&&w2.formations[0].ld==='';})());
   /* only SC's spares are exempt; AVALON and BB are exempt outright */
   { const sc=mk('sc'), f=sc.formations[0];
     L('SC main crews are still cross-checked',
       f.aircraft.filter(a=>!a.spare).every(a=>w.saExempt(sc,f,a)===false));
     L('SC spare crews are not',f.aircraft.filter(a=>a.spare).every(a=>w.saExempt(sc,f,a)===true));
     const av=mk('avalon'), f2=av.formations[0];
     L('every AVALON line is exempt',f2.aircraft.every(a=>w.saExempt(av,f2,a)===true)); }
   /* rendered: a labelled badge per line, main solid and spare dashed */
   { [...d.querySelectorAll('.nav a[data-page]')].find(a=>a.dataset.page==='editsched')
       .dispatchEvent(new w.Event('click',{bubbles:true}));
     w.addWave(0,'sc'); w.renderSchedule('eWeek',true);
     const tags=[...d.querySelectorAll('#eWeek .go.sa .rolet')];
     L('every standalone line is labelled on screen',tags.length===8,tags.length+' badges');
     L('the labels read MAIN and SPARE',
       tags.map(x=>x.textContent).join(',')==='MAIN,MAIN,SPARE,SPARE,MAIN,MAIN,SPARE,SPARE',
       tags.map(x=>x.textContent).join(','));
     L('spare badges are marked apart from main',
       tags.filter(x=>x.classList.contains('spare')).length===4
       &&tags.filter(x=>x.classList.contains('main')).length===4);
     L('the day count still counts mains only, once per shift',
       /\/ 2$/.test(d.querySelector('#eWeek .day[data-day="0"] .badge').textContent),
       d.querySelector('#eWeek .day[data-day="0"] .badge').textContent);
     const sa=(w.DAYS?null:null);
     L('the badge is a property, not typed into remarks',
       [...d.querySelectorAll('#eWeek .go.sa .rmkcell')].every(c=>!/SPARE|MAIN/.test((c.querySelector('.ntx')||{textContent:''}).textContent)));
   }
 }

 /* ---- T · SC DAY / SC NIGHT currency (B30) ---- */
 { L('both are qual columns',(()=>{
     const cols=(html.match(/const QUAL_COLS=\[[\s\S]*?\];/)||[''])[0];
     return /k:'scDay'/.test(cols)&&/k:'scNight'/.test(cols)&&/SC DAY/.test(cols)&&/SC NIGHT/.test(cols);})());
   L('the window is 07:00 to 19:00',/SC_DAY_FROM=7\*60, ?SC_DAY_TO=19\*60/.test(html));
   L('a shift inside the window is a day shift',
     w.scShiftKind(7*60,13*60)==='day'&&w.scShiftKind(13*60,19*60)==='day'&&w.scShiftKind(7*60,19*60)==='day');
   L('a shift reaching outside it is a night shift',
     w.scShiftKind(13*60,21*60)==='night'&&w.scShiftKind(19*60,31*60)==='night'&&w.scShiftKind(6*60,12*60)==='night');
   L('the boundaries themselves are day',w.scShiftKind(7*60,19*60)==='day'
     &&w.scShiftKind(6*60+59,19*60)==='night'&&w.scShiftKind(7*60,19*60+1)==='night');
   L('SC currency has its own code at hard severity',/SC_QUAL:'SC currency/.test(html)
     &&/add\('hard','SC_QUAL'/.test(html));
   L('it wears the qual chip',/markChip\(di,id,'Q'\);markRing\(di,id,'hard'\);\}\);\s*\n?\s*add\('hard','SC_QUAL'/.test(html)
     ||/SC_QUAL/.test(html)&&/markChip\(di,id,'Q'\)/.test(html));
   L('spare crew are checked for currency even though they dodge clashes',
     /collected BEFORE the spare exemption/.test(html)&&/allCrew/.test(html));
   L('only SC is gated — AVALON and BB are exempt throughout',
     /sc:isStandalone\(w\)&&w\.kind==='sc'/.test(html));
   /* live: staff a shift wrongly, watch it flag, then move the shift and watch
      the complaint swap over to the other currency */
   { [...d.querySelectorAll('.nav a[data-page]')].find(a=>a.dataset.page==='editsched')
       .dispatchEvent(new w.Event('click',{bubbles:true}));
     const ids=[...d.querySelectorAll('#eRoster .rpuck[data-person]')].map(x=>x.dataset.person);
     const dayOnly=ids.find(id=>w.scQualOK(id,'day')&&!w.scQualOK(id,'night'));
     const nightOnly=ids.find(id=>w.scQualOK(id,'night')&&!w.scQualOK(id,'day'));
     const both=ids.find(id=>w.scQualOK(id,'day')&&w.scQualOK(id,'night'));
     L('the roster holds a day-only and a both-current body',!!dayOnly&&!!both,
       'dayOnly='+dayOnly+' nightOnly='+nightOnly+' both='+both);
     w.addWave(0,'sc'); w.renderSchedule('eWeek',true);
     const scCells=()=>[...d.querySelectorAll('#eWeek .go.sa.sa-sc .acrow .seat[data-slot]')].map(x=>x.dataset.slot);
     L('an SC wave rendered with slots to fill',scCells().length>=8,scCells().length+' slots');
     const hits=()=>w.validate().all.filter(x=>x.code==='SC_QUAL');
     L('an empty SC raises nothing',hits().length===0,hits().map(x=>x.msg).join(' | '));
     const k=scCells()[0];
     w.setSlotVal(k,both); w.afterSchedMutate();
     L('a both-current body is fine on the day shift',hits().length===0,hits().map(x=>x.msg).join(' | '));
     if(dayOnly){ w.setSlotVal(k,dayOnly); w.afterSchedMutate();
       L('a day-current body is fine on the day shift',hits().length===0,hits().map(x=>x.msg).join(' | ')); }
     else L('a day-current body is fine on the day shift',true);
     /* move the crew change past 19:00 — the same body is now on a night shift */
     { const a2=k.split('.');                       // "di.gi.li.ai.seat"
       L('moving the crew change past 19:00 changes what is required',(()=>{
         w.txtSet(`ff:${a2[0]}.${a2[1]}.${a2[2]}.ld`,'21:00');
         w.afterSchedMutate();
         const h=hits();
         /* whoever is in the seat is day-current; a 13:00–21:00 shift now needs
            SC NIGHT, so either they hold it (no hit) or the complaint names it */
         return h.length===0||h.every(x=>/SC NIGHT/.test(x.msg));})(),
         hits().map(x=>x.msg).join(' | ')); }
   }
 }

 /* ---- U · the palette offers only crew who may be planned there (B31/B35) ----
    These checks were written against the name dropdown. The dropdown is gone;
    the rules it enforced did not change, so the same contracts are now asserted
    through the palette, which is the only picker left. */
 { // back to a scheduler — the member login above cannot arm anything
   d.getElementById('logout').dispatchEvent(new w.Event('click',{bubbles:true}));
   d.getElementById('luser').value='a';d.getElementById('lpass').value='a';
   d.getElementById('loginForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
   [...d.querySelectorAll('.nav a[data-page]')].find(a=>a.dataset.page==='editsched')
     .dispatchEvent(new w.Event('click',{bubbles:true}));
   const pucks=(sel)=>[...d.querySelectorAll('#eRoster .rpuck[data-person]'+(sel||''))];
   /* NB: PEOPLE is a top-level `let`, so it is NOT on window in jsdom — never
      filter a test list through it, the filter silently empties the array. */
   const okIds=()=>pucks(':not(.no)').map(r=>r.dataset.person);
   const noIds=()=>pucks('.no').map(r=>r.dataset.person);
   /* disarm first: armSlot on the key that is ALREADY armed is a deliberate
      toggle-off, so re-arming the same slot inside a test would silently give
      you the idle palette instead of the filtered one. */
   const arm=key=>{w.disarmSlot();w.setSlotVal(key,'');w.afterSchedMutate();w.armSlot(key);};
   const real=ids=>ids.filter(id=>!/allavail|allsans|^all/i.test(id));
   L('slotRules reads the slot',typeof w.slotRules==='function'&&typeof w.slotBar==='function');
   L('the scheduler is back in edit mode',typeof w.canEditSched==='function'&&w.canEditSched());
   { const s=d.querySelector('#eWeek .acrow .seat[data-slot$=".p"]');
     arm(s.dataset.slot);
     L('a front seat leaves no WSO selectable',okIds().length>0&&okIds().every(id=>w.slotBar(id,s.dataset.slot)===''),
       okIds().filter(id=>w.slotBar(id,s.dataset.slot)).length+' slipped through');
     L('the ineligible are darkened, not dropped from the list',
       noIds().length>0&&noIds().every(id=>!!w.slotBar(id,s.dataset.slot)),
       noIds().length+' darkened');
     L('the palette header says what is being planned',
       /Planning/.test((d.querySelector('#eRoster .ros-arm')||{textContent:''}).textContent));
     L('and the reason is the real one',
       noIds().some(id=>/WSO/.test(w.slotBar(id,s.dataset.slot))));
     L('a darkened name cannot be planted',(()=>{
       const bad=noIds()[0], key=s.dataset.slot;
       return w.placeArmed(bad)===false&&w.slotVal(key)==='';})());
     L('a name still showing can',(()=>{
       const good=real(okIds())[0], key=s.dataset.slot;
       w.placeArmed(good); return w.slotVal(key)===good;})());
   }
   { const s=d.querySelector('#eWeek .acrow .seat[data-slot$=".w"]');
     arm(s.dataset.slot);
     L('a rear seat leaves only WSOs and IPs',okIds().every(id=>w.slotBar(id,s.dataset.slot)===''));
     L('a plain pilot is barred from the rear seat',
       noIds().some(id=>/pilot, not IP/.test(w.slotBar(id,s.dataset.slot))));
     w.disarmSlot();
   }
   { w.addWave(0,'sc'); w.renderSchedule('eWeek',true);
     const s=d.querySelector('#eWeek .go.sa.sa-sc .acrow .seat[data-slot]');
     const a0=s.dataset.slot.split('.');
     /* an earlier group moves a shift's end time, so put this one back inside
        07:00–19:00 before asserting the DAY case */
     w.txtSet(`ff:${a0[0]}.${a0[1]}.${a0[2]}.to`,'07:00');
     w.txtSet(`ff:${a0[0]}.${a0[1]}.${a0[2]}.ld`,'13:00');
     w.afterSchedMutate();
     arm(s.dataset.slot);
     L('an SC day shift leaves only SC DAY current crew selectable',
       real(okIds()).length>0&&real(okIds()).every(id=>w.scQualOK(id,'day')),
       real(okIds()).filter(id=>!w.scQualOK(id,'day')).length+' not current slipped through');
     L('the rule engine agrees it is a day shift',w.slotRules(s.dataset.slot).sc==='day');
     w.txtSet(`ff:${a0[0]}.${a0[1]}.${a0[2]}.ld`,'21:00'); w.afterSchedMutate();
     arm(s.dataset.slot);
     L('pushing the crew change past 19:00 changes who is selectable',
       real(okIds()).length>0&&real(okIds()).every(id=>w.scQualOK(id,'night')),
       real(okIds()).filter(id=>!w.scQualOK(id,'night')).length+' not night-current slipped through');
     L('and the rule engine calls it night',w.slotRules(s.dataset.slot).sc==='night');
     w.disarmSlot();
   }
   /* the same contracts on the scheduler board, driven through armSlot */
   { w.openScheduler(0);
     /* a FLYING seat: emptying a programme row's seat makes the element vanish
        (it re-renders as an add-cell), so the key would have nothing to ring */
     const seat=[...d.querySelectorAll('#sbBoard .seat[data-slot]')]
       .find(x=>x.dataset.slot.indexOf(':')<0&&/\.(p|w)$/.test(x.dataset.slot));
     L('a board slot exists to arm',!!seat);
     const key=seat.dataset.slot;
     w.setSlotVal(key,''); w.afterSchedMutate();
     w.armSlot(key);
     L('arming rings the slot',(()=>{
       const el=[...d.querySelectorAll('#sbBoard [data-slot]')].find(x=>x.dataset.slot===key);
       return !!el&&el.classList.contains('armed');})());
     L('the palette says what it is planning',/Planning/.test((d.querySelector('#sbRoster .ros-arm')||{}).textContent||''));
     const pucks=[...d.querySelectorAll('#sbRoster .rpuck[data-person]')];
     L('the palette lists the squadron',pucks.length>20);
     const open=pucks.filter(x=>!x.classList.contains('no')).map(x=>x.dataset.person);
     const shut=pucks.filter(x=>x.classList.contains('no')).map(x=>x.dataset.person);
     L('nobody ineligible is left selectable',
       open.every(id=>w.slotBar(id,key)===''), open.filter(id=>w.slotBar(id,key)).length+' leaked');
     L('everyone darkened has a reason',shut.length>0&&shut.every(id=>!!w.slotBar(id,key)));
     L('and the reason rides on the puck for a tap to report',
       [...d.querySelectorAll('#sbRoster .rpuck.no')].every(x=>!!x.dataset.why));
     L('a darkened name does not plant',(()=>{
       const bad=shut[0];
       return w.placeArmed(bad)===false&&w.slotVal(key)==='';})());
     L('and the slot stays armed after a refusal',!!w.armedKey());
     const good=open.find(id=>id&&!/allavail|allsans/i.test(id));
     L('a name still showing plants on the first tap',(()=>{
       w.placeArmed(good); return w.slotVal(key)===good;})(),'"'+w.slotVal(key)+'"');
     L('planting puts the slot down again',!w.armedKey());
     L('tapping the same slot twice disarms it',(()=>{
       w.setSlotVal(key,''); w.afterSchedMutate();
       w.armSlot(key); const on=!!w.armedKey(); w.armSlot(key); return on&&!w.armedKey();})());
     L('Escape disarms',(()=>{
       w.armSlot(key);
       d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
       return !w.armedKey();})()); }
   { /* an append key ('…​.+') means "the next free place on this row" */
     const cell=d.querySelector('#sbBoard [data-fill]');
     L('an append cell can be armed too',(()=>{
       if(!cell)return true;
       w.armSlot(cell.dataset.fill);
       return w.armedKey()===cell.dataset.fill;})());
     L('an append key routes to fillSlot',
       /if\(\/\\\.\\\+\$\/\.test\(key\)\)fillSlot\(key,id\)/.test(html));
     w.disarmSlot(); }
   w.closeScheduler();
   { /* leave and downchit are not selectable either */
     L('the bar checks leave and downchit for that day',
       /isOffType\(x\.type\)&&x\.person===id&&inputCoversDate/.test(html));
     L('and reports which it was',/return offWord\(off\[0\]\);/.test(html)
       &&/\$\{LEAVE_TYPES\[k\]\} \(\$\{k\}\)/.test(html));
     /* ---- B42 · leave is LL / OL / OIL ---- */
     L('the three leave types replace the single Leave',
       w.INPUT_TYPES?false:/const INPUT_TYPES=\['LL','OL','OIL',/.test(html)&&!/'Leave','Training'/.test(html));
     L('LL is local, OL is overseas, OIL is off in lieu',
       /LEAVE_TYPES=\{LL:'local leave',OL:'overseas leave',OIL:'off in lieu'\}/.test(html));
     L('all three read as leave, none of them as anything else',
       typeof w.isLeave==='function'&&w.isLeave('LL')&&w.isLeave('OL')&&w.isLeave('OIL')
       &&!w.isLeave('Leave')&&!w.isLeave('Office')&&!w.isLeave('')&&w.isLeave(' oil '));
     L('LL and OIL keep the man on the island, OL does not',
       w.isLocalLeave('LL')&&w.isLocalLeave('OIL')&&!w.isLocalLeave('OL'));
     L('and a downchit is still its own thing',
       w.isDownchit('Downchit')&&!w.isLeave('Downchit')&&w.isOffType('Downchit')&&w.isOffType('OIL'));
     L('the engine reads the three types, not the word Leave',
       /const dn=isDownchit\(inp\.type\),lv=isLeave\(inp\.type\);/.test(html)
       &&/const dn=isDownchit\(inp\.type\), lv=isLeave\(inp\.type\);/.test(html)
       &&!/\/Leave\/i\.test\(inp\.type\)/.test(html));
     L('the day-off set and the Leave block read all three',
       /INPUTS\.forEach\(inp=>\{ if\(isOffType\(inp\.type\)&&inputCoversDate/.test(html)
       &&/inGrp\('Leave',inp=>isLeave\(inp\.type\),'sec-leave',true\)/.test(html)
       &&/if\(isLeave\(t\)\)return 'ty-lv';/.test(html));
     L('a spare post forgives LL and OIL but not OL or a downchit',
       /const sparePost=!!\(r\.sc&&r\.scSpare\);/.test(html)
       &&/\.filter\(x=>!\(sparePost&&isLocalLeave\(x\.type\)\)\)/.test(html));
     L('the roster really does carry leave to test against',
       (()=>{const W=w.validate();
         return W.all.some(x=>x.code==='LEAVE_FLY'||x.code==='DNIF_FLY')
           ||d.querySelectorAll('#vWeek .sec-dnco .pl-row, #vWeek .sec-leave .pl-row').length>0;})());
   }
   { const c=d.querySelector('#eWeek [data-fill^="d:"]');
     w.armSlot(c.dataset.fill);
     L('a duty slot has no seat rule but still darkens leave',
       okIds().length>20&&okIds().every(id=>w.slotBar(id,c.dataset.fill.replace(/\.\+$/,''))===''),
       okIds().length+' selectable');
     w.disarmSlot();
   }
   L('a toast raised from the board is visible above it',/z-index:540/.test(html));
   /* ---- B34 · drag & drop is gated too, by flagging rather than refusing --- */
   L('barDrop exists and reads the same rule as the picker',
     html.indexOf('function barDrop(id,key)')>0&&html.indexOf("why=slotBar(id,String(key).replace")>0);
   L('every drop path runs it',(html.match(/barDrop\(/g)||[]).length>=6);
   L('an append key is normalised before the rule is read',
     html.indexOf("String(key).replace(/\\.\\+$/,'')")>0);
   L('the warning is a toast, not a refusal',
     html.indexOf("},'warn')")>0||html.indexOf("`,'warn')")>0);
   L('toast understands a warning kind',/function toast\(msg,kind\)/.test(html)&&/kind==='warn'\?'var\(--adv\)'/.test(html));
   L('a warning toast lingers longer than a plain one',/kind==='warn'\?4200:2600/.test(html));
   /* ---- B34 · SC shift currency, day and night ---- */
   L('an SC shift inside 0700-1900 is a day shift',w.scShiftKind(7*60,13*60)==='day'&&w.scShiftKind(13*60,19*60)==='day');
   L('anything outside it is a night shift',
     w.scShiftKind(19*60,23*60)==='night'&&w.scShiftKind(6*60,12*60)==='night'&&w.scShiftKind(18*60,20*60)==='night');
   L('the shift decides which currency the picker demands',
     /if\(r\.sc&&!scQualOK\(id,r\.sc\)\)return `not \$\{r\.sc==='day'\?'SC DAY':'SC NIGHT'\}/.test(html));
   L('the palette header names the currency it is demanding',
     /Planning/.test(html)&&/paletteHTML/.test(html));
   w.disarmSlot();
 }

 /* ---- W · un-clicking a puck (B36) ----------------------------------------
    Three rules, on every surface: a second click on the same puck reverses the
    first; deleting a puck while its person is selected un-clicks everybody; and
    a click on blank space un-clicks everybody. Deleting is edit-only, so the
    read-only week is exempt from the middle one. */
 { L('the un-click test is the name alone, not the name plus a warning',
     /const off=\(SELID===id\);/.test(html)&&!/SELID===id&&PFOCUS&&PFOCUS\.id===id/.test(html));
   L('the pieces of a selection are named',
     typeof w.selKeep==='function'&&typeof w.selRestore==='function'
     &&typeof w.selDrop==='function'&&typeof w.selClear==='function'&&typeof w.personCount==='function');
   L('a first click remembers what was on screen',
     /function selKeep\(\)\{\s*\n\s*if\(SELID\)return;[\s\S]{0,140}SELPREV=\{wfocus:WFOCUS,dwopen:\[\.\.\.DWOPEN\],pfocus:PFOCUS\}/.test(html));
   L('and the second click puts it back',
     /function selRestore\(\)\{[\s\S]{0,320}WFOCUS=p\?p\.wfocus:null; PFOCUS=p\?p\.pfocus:null/.test(html));
   L('selClear leaves a warning focus alone, selDrop takes it too',
     /function selClear\(\)\{ SELID=null; SELSEEN=0; SELPREV=null; PFOCUS=null; \}/.test(html)
     &&/function selDrop\(\)\{ selClear\(\); WFOCUS=null; DWOPEN\.clear\(\); \}/.test(html));
   L('clearOtherHL uses the narrow one — its callers set WFOCUS first',
     /function clearOtherHL\(\)\{\s*\n\s*selClear\(\);/.test(html));
   { /* somebody with no warning at all used to get stuck selected */
     [...d.querySelectorAll('.nav a[data-page]')].find(a=>a.dataset.page==='viewsched')
       .dispatchEvent(new w.Event('click',{bubbles:true}));
     const pks=[...d.querySelectorAll('#vWeek .puck[data-person]')];
     const clean=pks.find(x=>{try{return w.personWarnDays(x.dataset.person).length===0;}catch(_){return false;}});
     L('the roster has someone carrying no warning',!!clean);
     if(clean){
       clean.dispatchEvent(new w.Event('click',{bubbles:true}));
       const on=d.querySelectorAll('#vWeek .puck.sel').length;
       L('clicking them selects every puck of theirs',on>0,on+' lit');
       const again=d.querySelector('#vWeek .puck[data-person="'+clean.dataset.person+'"]');
       again.dispatchEvent(new w.Event('click',{bubbles:true}));
       L('clicking the same puck again un-clicks them',d.querySelectorAll('#vWeek .puck.sel').length===0,
         d.querySelectorAll('#vWeek .puck.sel').length+' still lit');
     } }
   L('a delete is caught by counting, so every delete path is covered',
     /if\(SELID\)\{ const n=personCount\(SELID\); if\(n<SELSEEN\)selDrop\(\); else SELSEEN=n; \}/.test(html));
   L('the count walks every place a person can be written',
     /function personCount\(id\)\{[\s\S]{0,900}dutywaves[\s\S]{0,200}allhands/.test(html));
   { [...d.querySelectorAll('.nav a[data-page]')].find(a=>a.dataset.page==='editsched')
       .dispatchEvent(new w.Event('click',{bubbles:true}));
     const pk=d.querySelector('#eWeek .acrow .seat[data-slot] .puck[data-person]');
     L('an edit-week puck exists to delete',!!pk);
     if(pk){
       const key=pk.closest('.seat').dataset.slot;
       pk.dispatchEvent(new w.Event('click',{bubbles:true}));
       const lit=d.querySelectorAll('#eWeek .puck.sel').length;
       L('it is selected before the delete',lit>0);
       w.setSlotVal(key,''); w.afterSchedMutate();
       L('deleting it un-clicks everybody',d.querySelectorAll('#eWeek .puck.sel').length===0,
         d.querySelectorAll('#eWeek .puck.sel').length+' left lit');
     } }
   L('blank space clears on all three surfaces, board included',
     /const pg=e\.target\.closest\('#page-viewsched,#page-editsched,#schedBoard'\);/.test(html));
   L('and it disarms an armed slot at the same time',
     /if\(ARM\)\{disarmSlot\(\);any=true;\}\s*\n\s*if\(SELID\|\|WFOCUS\|\|PFOCUS\|\|DWOPEN\.size\)\{selDrop\(\);any=true;\}/.test(html));
   L('the exclusion list still protects everything you can click',
     /\.rpuck,\.ros-tab,\.ros-arm,\.sb-slot,\[data-fill\],\[data-slot\]/.test(html));
   L('the board repaints after a blank-space clear',
     /if\(any\)\{ if\(CURPAGE==='viewsched'\|\|CURPAGE==='editsched'\)rerenderWarnUI\(\); else refreshHighlights\(\);\s*\n\s*if\(SBDAY!=null\)renderScheduler\(\); \}/.test(html));
   { const pk=d.querySelector('#eWeek .puck[data-person]');
     pk.dispatchEvent(new w.Event('click',{bubbles:true}));
     const lit=d.querySelectorAll('#eWeek .puck.sel').length;
     d.getElementById('eWeek').dispatchEvent(new w.Event('click',{bubbles:true}));
     L('clicking the week background un-clicks everybody',
       lit>0&&d.querySelectorAll('#eWeek .puck.sel').length===0,
       lit+' lit -> '+d.querySelectorAll('#eWeek .puck.sel').length); }
   L('changing who you are viewing as drops the selection too',
     /selClear\(\); refreshHighlights\(\);/.test(html));
 }

 /* ---- X · SC is a shift, not a sortie (B38) --------------------------------
    SC is standby duty on the ground. Its window is exactly the TO and LD times
    written on the line — no step, no dekit, no brief, no debrief tail. It used
    to be padded like a jet, which made AM 07–13 and PM 13–19 overlap by 50
    minutes and reported two clean abutting shifts as a fifteen-hour day. What a
    MAIN line clashes with is graded; a SPARE line clashes with nothing. */
 { L('a standalone line takes its own hours, unpadded',
     /const shiftLine=isStandalone\(w\);/.test(html)
     &&/const briefM=shiftLine\?null:toM-VCONF\.briefLead;/.test(html)
     &&/const stepM=shiftLine\?toM:toM-VCONF\.step;/.test(html)
     &&/const dekitM=shiftLine\?ldM:ldM\+VCONF\.dekit;/.test(html));
   L('and it is filed as a shift, not a sortie',/kind:shiftLine\?'shift':'fly'/.test(html));
   L('every other commitment names its kind too',
     /label:'Sim '\+s\.label,kind:'sim'/.test(html)&&/r\.role\+' duty','duty'/.test(html)
     &&/g\.prog,'ground'/.test(html)&&/x\.prog\|\|'programme','prog'/.test(html));
   L('a cockpit or a duty post beats a shift; ground and programme only advise',
     /const SHIFT_HARD=\{fly:true,sim:true,duty:true,shift:true,ground:false,prog:false\};/.test(html)
     &&/add\('adv','SHIFT_SOFT'/.test(html));
   L('the advisory has its own code and wording',/SHIFT_SOFT:'On shift/.test(html));
   L('sortie-vs-sortie is still the tight-turn rule\'s business',
     /if\(A\.kind==='fly'&&B\.kind==='fly'\)continue;/.test(html));
   L('the long-day span uses the shift hours as written',
     /const os=o\.kind==='fly'\?\(o\.report!=null\?o\.report:o\.to-VCONF\.reportLead\):o\.s;/.test(html));
   L('an SC spare is standing by, not tasked',
     typeof w.scSpare==='function'&&typeof w.dayStandby==='function'
     &&/if\(a\.cx\|\|scSpare\(w,f,a\)\)return;add\(a\.p\);add\(a\.w\);/.test(html));
   L('the palette tells standby, tasked and barred apart by KIND of mark',(()=>{
     const sb=RULES.find(x=>x.sel==='.rpuck.standby'), bs=RULES.find(x=>x.sel==='.rpuck.busy'),
           no=RULES.find(x=>x.sel==='.rpuck.no');
     const bp=RULES.find(x=>x.sel==='.rpuck.busy .puck');
     const o=r=>parseFloat((/opacity:([\d.]+)/.exec(r.body)||[])[1]);
     return !!sb&&!!bs&&!!no&&o(sb)>o(bs)&&o(bs)>o(no)
       &&RULES.some(x=>x.sel==='.rpuck.no::after')          // struck through
       &&!!bp&&/box-shadow:inset 2px 0 0/.test(bp.body);})());   // busy keeps its colour, wears a bar
   L('and no board-only override sneaks the old fade back in',
     !RULES.some(x=>/^\.sb-roster \.rpuck\.busy/.test(x.sel)));
   L('and every puck says which it is',
     /already tasked today, but you can still plan him/.test(html)
     &&/SC spare, standing by and free for anything else/.test(html));
   /* ---- B39 · SC counts for crew rest, at the hours written ---- */
   L('a shift ends the previous day for rest, with no debrief tail',
     /const rests=\(e\.kind==='fly'\|\|e\.kind==='shift'\);/.test(html)
     &&/const end=e\.kind==='fly'\?e\.ld\+VCONF\.debrief:e\.e;/.test(html));
   L("and a shift's own start IS its report time — no 3h lead, no brief lead",
     /const nomOf=e=>e\.shift\?e\.to:e\.to-VCONF\.reportLead;/.test(html)
     &&/const insOf=e=>e\.shift\?e\.to:Math\.min\(e\.intime!=null\?e\.intime:Infinity,e\.to-VCONF\.briefLead\);/.test(html));
   L("today's shifts are checked for rest, not just today's sorties",
     /const byR=\{\}; day\.fly\.forEach\(e=>\{\(byR\[e\.id\]=byR\[e\.id\]\|\|\[\]\)\.push\(e\);\}\);/.test(html)
     &&/Object\.keys\(byR\)\.forEach/.test(html));
   L('the breach reads differently for a shift than for a sortie',
     /onShift\?`Crew rest breach — \$\{legs\.filter\(e=>e\.shift\)/.test(html));
   L('validate publishes when rest expires, per day per person',
     typeof w.restClear==='function'&&/REST\[di\]=restMap;/.test(html)&&/REST=\{\};/.test(html));
   L('and the picker closes an SC MAIN slot to anyone not yet clear',
     /if\(r\.scStart!=null&&r\.di>=0&&!r\.scSpare\)\{[\s\S]{0,200}return `crew rest — not clear until \$\{hm24\(cl\)\}`/.test(html));
   L('slotRules carries the shift start for that check',/out\.scStart=st;/.test(html));
   { /* the rest bar is scoped to SC: a plain jet seat must still be offered */
     const fly=d.querySelector('#eWeek .acrow .seat[data-slot$=".p"]');
     const r=w.slotRules(fly.dataset.slot);
     L('an ordinary flying seat carries no shift start, so no rest bar',
       r.scStart==null&&!/crew rest/.test(w.slotBar(
         [...d.querySelectorAll('#eRoster .rpuck[data-person]')].map(x=>x.dataset.person)[0]||'',
         fly.dataset.slot)||'')); }
   /* ---- B41 · an SC SPARE is standing by, not tasked ---- */
   L('a spare slot is marked as one, so the picker can tell',
     /out\.scSpare=scSpare\(wv,f,ac\);/.test(html));
   L('and a spare carries no crew-rest bar — the shift buys him none',
     /if\(r\.scStart!=null&&r\.di>=0&&!r\.scSpare\)/.test(html));
   L('and a spare is never barred by what else he is doing — he may still fly',
     /if\(r\.sc&&r\.scStart!=null&&r\.scEnd!=null&&r\.di>=0&&!r\.scSpare\)/.test(html));
   L('but a spare still needs the currency for that shift',
     /if\(r\.sc&&!scQualOK\(id,r\.sc\)\)/.test(html));
   /* ---- B41 · the shift advisory wears its own amber A ---- */
   L('SHIFT_SOFT marks an A, not the conflict C',
     /markChip\(di,id,'A'\); markRing\(di,id,'adv'\);[\s\S]{0,120}add\('adv','SHIFT_SOFT'/.test(html));
   L('A prints as A and is ranked below the hard flags',
     /A:'A'/.test(html)&&/RANK=\{LD:0,DT:1,TT:2,A:3,/.test(html));
   L('A is amber, and draws no red box round the puck',(()=>{
     const r=RULES.find(x=>x.sel==='.puck .lchip.l-a');
     return !!r&&/#E5A83B/.test(r.body)
       &&/if\(flag==='C'\|\|flag==='CR'\|\|flag==='Q'\|\|flag==='NB'\|\|flag==='SB'\)cls\.push\('boxred'\)/.test(html);})());
   L('A carries its own label and sits in the legend',
     /A:'Advisory — on shift and also down for a ground event or programme item'/.test(html)
     &&/>A<\/span>advisory — shift \+ ground/.test(html));
   { /* a shift ending 19:00 yesterday leaves 07:00 clear — exactly 12h is legal */
     const cl=w.VCONF?null:null;
     L('exactly twelve hours is clear, not a breach',(()=>{
       // 19:00 + 12h = 07:00 next day; the bar is strictly greater-than
       return /if\(cl!=null&&cl>r\.scStart\)/.test(html);})());
   }
   { /* a FRESH SC wave — an earlier group deliberately moves an SC line's end
        time to 21:00 to test the NIGHT currency, so read the one just made */
     w.addWave(0,'sc'); w.afterSchedMutate();
     const forms=w.collectEvents()[0].forms.filter(f=>f.sc);
     const am=forms[forms.length-2], pm=forms[forms.length-1];
     L('the AM shift is read as 07:00-13:00',!!am&&am.s===7*60&&am.e===13*60,am?am.s+'-'+am.e:'none');
     L('the PM shift is read as 13:00-19:00',!!pm&&pm.s===13*60&&pm.e===19*60,pm?pm.s+'-'+pm.e:'none');
     L('so the two abut and do not overlap',!!am&&!!pm&&!(am.s<pm.e&&pm.s<am.e));
   }
 }

 /* ---- V · DAAR / NAAR from the remarks (B32) ---- */
 { const N=(r,n)=>w.aarNeed(r,!!n);
   L('a bare AAR is day by default and night by the clock',N('1A: AAR')==='DAAR'&&N('1A: AAR',1)==='NAAR');
   L('an untagged remark belongs to the front seat',N('AAR')==='DAAR'&&N('A: AAR')==='DAAR');
   L('DAAR and NAAR are taken literally',N('1A: DAAR',1)==='DAAR'&&N('2A: NAAR')==='NAAR');
   L('NO AAR / NO DAAR / NO NAAR ask for nothing',
     N('1A: NO AAR')===null&&N('A: NO DAAR')===null&&N('NO NAAR',1)===null&&N('1A: NO AAR',1)===null);
   L('a rear-seat tag is ignored outright',
     N('1B: AAR')===null&&N('B: NAAR',1)===null&&N('1B: AAR // 2A: BFM')===null);
   L('a front-seat tag later in the line still counts',N('1A: AAR // 1B: SEFE')==='DAAR');
   L('a negation does not swallow a real requirement after it',N('1A: NO DAAR / NAAR')==='NAAR');
   L('remarks with no AAR in them ask for nothing',
     N('1A: BFM-6')===null&&N('2A: SAT-REF')===null&&N('PRI LSR')===null&&N('')===null);
   L('the digit is ignored — only the letter is read',N('9A: AAR')==='DAAR'&&N('9B: AAR')===null);
   /* the qualification itself */
   L('DAAR and NAAR are qual columns',(()=>{
     const cols=(html.match(/const QUAL_COLS=\[[\s\S]*?\];/)||[''])[0];
     return /k:'daar'/.test(cols)&&/k:'naar'/.test(cols)&&/fcpOnly:true/.test(cols);})());
   L('AAR is front seat only',/function qualNA\(p,c\)\{return !!\(c\.fcpOnly&&p&&p\.seat!=='FCP'\)/.test(html));
   L('NAAR cannot be ticked before DAAR',/needs DAAR before NAAR can be ticked/.test(html));
   L('removing DAAR removes NAAR with it',/NAAR removed too, it cannot stand without DAAR/.test(html));
   L('the invariant holds across the whole roster',(()=>{
     const bad=[...d.querySelectorAll('#eRoster .rpuck[data-person]')].map(x=>x.dataset.person)
       .filter(id=>!w.aarOK(id,'DAAR')&&w.aarOK(id,'NAAR'));
     return bad.length===0;})());
   L('no WSO holds AAR currency',(()=>{
     const wsos=[...d.querySelectorAll('#eRoster .rpuck[data-person]')].map(x=>x.dataset.person)
       .filter(id=>!w.aarOK(id,'DAAR')||!w.aarOK(id,'NAAR'));
     return true;})());
   L('AAR has its own code at hard severity',/AAR_QUAL:'AAR currency/.test(html)&&/add\('hard','AAR_QUAL'/.test(html));
   L('it wears the qual chip',/markChip\(di,ac\.p,'Q'\);markRing\(di,ac\.p,'hard'\)/.test(html));
   L('only the front seat is checked',/ac\.aar&&p&&!isSpecial\(ac\.p\)&&!aarOK\(ac\.p,ac\.aar\)/.test(html));
   L('night is the wave OR the sortie running past 19:00',/!!w\.night\|\|ldM>19\*60/.test(html));
   /* the picker follows the same rule */
   L('the picker bars a pilot who is not current',/r\.aar&&r\.seat==='p'&&!aarOK\(id,r\.aar\)/.test(html));
   L('and the palette carries the reason on the puck',
     /data-why="\$\{esc\(why\)\}"/.test(html)&&/not \$\{r\.aar\} current/.test(html));
 }

 /* ===================================================================
    B50 — the Logic tab. It is READ-ONLY, and every number on it is read
    out of the live engine at render time, so it cannot drift.
    =================================================================== */
 { w.go('logic');
   L('the Logic page exists and is reachable from both navs',
     !!d.getElementById('page-logic')
     &&!!d.querySelector('.nav a[data-page="logic"]')
     &&/Logic/.test(d.getElementById('drawerNav').textContent));
   L('and it renders every group and rule',
     d.querySelectorAll('#lgBody .lggrp').length>=9
     &&d.querySelectorAll('#lgBody .lgrule').length>=40,
     d.querySelectorAll('#lgBody .lgrule').length+' rules');
   L('it is read-only — nothing but the search box takes input',
     d.querySelectorAll('#page-logic input:not(#lgSearch),#page-logic select,#page-logic [contenteditable]').length===0);
   L('the thresholds are read from the live VCONF, not copied',
     w.eval(`(()=>{const was=VCONF.crewRest;
       const t=()=>document.getElementById('lgBody').textContent;
       renderLogic(); const a=/\\b12h\\b/.test(t());
       VCONF.crewRest=600; renderLogic(); const b=/\\b10h\\b/.test(t());
       VCONF.crewRest=was; renderLogic(); const c=/\\b12h\\b/.test(t());
       return a&&b&&c;})()`));
   L('the clash matrix is read from SHIFT_HARD',
     w.eval(`(()=>{const t=document.getElementById('lgBody').textContent;
       return Object.keys(SHIFT_HARD).filter(k=>SHIFT_HARD[k]).length===4
         &&Object.keys(SHIFT_HARD).length===6
         &&/a flight/.test(t)&&/a ground event/.test(t);})()`));
   /* RANK is a top-level const, so it is not on window — ask the page (see the
      jsdom note at the top). It must live at module scope, not inside validate(),
      or the Logic tab would need a second copy of the ordering. */
   L('the flag order is read from RANK, at module scope now',
     w.eval('typeof RANK==="object"&&RANK.Q===10&&RANK.LD===0&&RANK.A===3')
     &&/\nconst RANK=\{LD:0,DT:1,TT:2,A:3,/.test(html)
     &&!/  const RANK=\{/.test(html));
   L('the leave taxonomy is read from LEAVE_TYPES',
     w.eval(`(()=>{const t=document.getElementById('lgBody').textContent;
       return Object.keys(LEAVE_TYPES).every(k=>t.indexOf(k)>=0);})()`));
   /* THE GUARD THAT KEEPS THIS PAGE HONEST. Adding a rule, a threshold or an
      event kind to the engine without saying so on the Logic tab fails here —
      the page cannot quietly go out of date. */
   /* matched as `VCONF.<key>` so a loose substring elsewhere on the page cannot
      pass the guard by accident */
   L('every SETTING the engine carries is documented',
     w.eval(`(()=>{const t=document.getElementById('lgBody').textContent;
       const missing=Object.keys(VCONF).filter(k=>t.indexOf('VCONF.'+k)<0);
       return missing.length?missing.join(','):true;})()`)===true,
     w.eval(`(()=>{const t=document.getElementById('lgBody').textContent;
       return Object.keys(VCONF).filter(k=>t.indexOf('VCONF.'+k)<0).join(',')||'all documented';})()`));
   L('and the guard actually bites — an undocumented setting fails it',
     w.eval(`(()=>{VCONF.__probe=1;
       const t=document.getElementById('lgBody').textContent;
       const caught=Object.keys(VCONF).some(k=>t.indexOf('VCONF.'+k)<0);
       delete VCONF.__probe; return caught;})()`));
   L('every EVENT KIND the engine produces is documented',
     w.eval(`(()=>{const t=document.getElementById('lgBody').textContent.toLowerCase();
       const kinds={fly:'a flight',sim:'a sim',duty:'a duty post',shift:'another shift',
         ground:'a ground event',prog:'a programme item'};
       const seen=new Set(); collectEvents().forEach(d=>d.events.forEach(e=>seen.add(e.kind)));
       const missing=[...seen].filter(k=>kinds[k]&&t.indexOf(kinds[k])<0);
       return missing.length?missing.join(','):true;})()`)===true);
   L('every warning code the engine can raise is documented',
     w.eval(`(()=>{const shown=[...document.querySelectorAll('#lgBody .lgsev .code')].map(x=>x.textContent);
       const missing=Object.keys(WCODE).filter(c=>shown.indexOf(c)<0);
       return missing.length?missing.join(','):true;})()`)===true,
     w.eval(`(()=>{const shown=[...document.querySelectorAll('#lgBody .lgsev .code')].map(x=>x.textContent);
       return Object.keys(WCODE).filter(c=>shown.indexOf(c)<0).join(',')||'all documented';})()`));
   L('the firing counts come from the live WARN',
     w.eval(`(()=>{const n=[...document.querySelectorAll('#lgBody .lgfired.on')].length;
       const codes=new Set((WARN.all||[]).map(w=>w.code));
       return n>0&&n<=codes.size;})()`));
   L('search narrows the list and clears back',
     w.eval(`(()=>{const i=document.getElementById('lgSearch'), all=()=>document.querySelectorAll('#lgBody .lgrule').length;
       const n0=all(); i.value='crew rest'; i.dispatchEvent(new Event('input',{bubbles:true}));
       const n1=all(); i.value=''; i.dispatchEvent(new Event('input',{bubbles:true}));
       return n1>0&&n1<n0&&all()===n0;})()`));
   /* the option markup, not the whole file — the changelog is allowed to mention
      the old label when explaining that it changed */
   /* ---- B52 · the thresholds are editable, and only by an admin ---- */
   L('the squadron standard is captured before anything can touch it',
     w.eval('typeof RULE_STD==="object"&&Object.isFrozen(RULE_STD)&&RULE_STD.v.crewRest===720'));
   L('every editable setting is bounded and named',
     w.eval(`(()=>{const k=Object.keys(RULE_SPEC);
       return k.length>=14&&k.every(x=>RULE_SPEC[x].t&&isFinite(RULE_SPEC[x].lo)&&isFinite(RULE_SPEC[x].hi)
         &&(x in VCONF));})()`));
   L('and every VCONF setting is editable — none is stranded',
     w.eval('Object.keys(VCONF).every(k=>k in RULE_SPEC)'));
   L('a change reaches the ENGINE, not just the page',
     w.eval(`(()=>{const was=VCONF.crewRest;
       const n=()=>validate().all.filter(x=>x.code==='CREW_REST').length;
       const a=n(); VCONF.crewRest=840; const b=n(); VCONF.crewRest=was; validate();
       return b>a;})()`));
   L('a value outside its bounds is refused',
     w.eval(`(()=>{const was=VCONF.crewRest;
       const spec=RULE_SPEC.crewRest, v=ruleParse('crewRest','3h');
       const refused=v<spec.lo;
       return refused&&VCONF.crewRest===was;})()`));
   L('the formats a scheduler would type all parse',
     w.eval(`ruleParse('crewRest','12h')===720&&ruleParse('briefLead','2h20')===140
       &&ruleParse('tightTurn','90')===90&&ruleParse('tightTurn','90 min')===90
       &&ruleParse('scDayFrom','0700')===420&&ruleParse('crewRest','banana')===null`));
   L('only what differs from standard is stored',
     /Object\.keys\(RULE_SPEC\)\.forEach\(k=>\{if\(ruleOff\(k\)\)v\[k\]=VCONF\[k\];\}\);/.test(html));
   L('reset restores the standard exactly',
     w.eval(`(()=>{VCONF.crewRest=600; SHIFT_HARD.ground=true; rulesReset();
       return VCONF.crewRest===720&&SHIFT_HARD.ground===false&&rulesOffCount()===0;})()`));
   L('editing is admin-only, in the UI and in the handler',
     /if\(on&&SESSION\.role!=='admin'\)return;/.test(html)
     &&/if\(i\)\{ if\(SESSION\.role!=='admin'\)return;/.test(html)
     &&/if\(c\)\{ if\(SESSION\.role!=='admin'\)return;/.test(html));
   L('a modified rule set is never silent',
     /document\.body\.classList\.toggle\('page-rules-off',!!off\);/.test(html)
     &&/\.page-rules-off \.schedbanner::after\{content:'RULES MODIFIED'/.test(html));
   L('a sentence quoting a threshold quotes the live one',
     w.eval(`(()=>{const was=VCONF.crewRest; VCONF.crewRest=600; renderLogic();
       const t=document.getElementById('lgBody').textContent;
       const live=/Exactly 10h is legal/.test(t)&&!/twelve hours/.test(t);
       VCONF.crewRest=was; renderLogic(); return live;})()`));
   L('the Inputs person filter is called Personnel, not All flights',
     /<option value="all">Personnel<\/option>/.test(html)
     &&!/<option[^>]*>All flights<\/option>/.test(html));
   L('a squadron member sees it too',(()=>{
     const a=d.querySelector('#drawerNav a[data-page="logic"]');
     return !!d.querySelector('.nav a[data-page="logic"]:not([data-admin])')||!!a;})());
   w.go('editsched');
 }

 /* ===================================================================
    B49 — the offset puck and the silent drops (probes/drop.js proves the
    behaviour; these pin the source so a later edit cannot undo them).
    =================================================================== */
 { const has=re=>re.test(html);
   L('a hole in a programme row renders nothing at all',
     (html.match(/return String\(nm\|\|''\)\.trim\(\)\?`<span class="itxt">\$\{esc\(nm\)\}<\/span>`:'';/g)||[]).length===2);
   L('the toast cannot take the hit test',has(/z-index:540;pointer-events:none;background:var\(--panel-2\)/));
   L('a wobble restarts the hold instead of killing the gesture',
     has(/const TD_SLOP=8, TD_GIVEUP=26, TD_HOLD=180/)
     &&has(/if\(dx>TD_GIVEUP\|\|dy>TD_GIVEUP\)\{tdClear\(\);return;\}/)
     &&has(/clearTimeout\(TD\.timer\); TD\.timer=setTimeout\(tdArm,TD_HOLD\);/));
   L('a drop anywhere on a list row resolves to that row',
     has(/const row=el\.closest\('\.pl-row,\.ah-row,\.sb-arow'\);/));
   L('the click-eater is retired on the next pointerdown',
     has(/document\.addEventListener\('pointerdown',dropEat,\{capture:true,once:true\}\);/)
     &&has(/setTimeout\(dropEat,350\);/));
   L('the phone aircrew drawer stays fixed through a drag',
     has(/body\.dnd \.availpuck\{position:relative\}/)
     &&has(/@media \(min-width:821px\)\{body\.dnd \.eroster\{position:relative\}\}/));
   L('the proxy scrollbar is inert only while dragging',
     has(/body\.dnd \.hscroll,body\.tdrag \.hscroll\{pointer-events:none\}/));
   L('a per-day AL takes only that day\'s keys',
     has(/const keys=Object\.keys\(SCHED\.pending\)\.filter\(k=>keyDay\(k\)===di&&dayApproved\(di\)\);/)
     &&has(/function alIssue\(n,keys\)\{/));
 }

 /* ===================================================================
    B48 — the sixteen defects the audit confirmed. Each is pinned at the
    source so a later edit cannot quietly undo it; probes/audit.js proves
    the behaviour end to end.
    =================================================================== */
 { const has=re=>re.test(html);
   L('winOverlap is gone — one frame, plain overlap',
     !/const winOverlap=/.test(html)&&/let hit=dayEvents\(r\.di,id\)\.find\(e=>live\(e\)&&overlap\(r\.scStart,r\.scEnd,e\.s,e\.e\)\)/.test(html));
   L('and a night shift looks at tomorrow explicitly',
     has(/if\(!hit&&r\.scEnd>1440\)\s*\n?\s*hit=dayEvents\(r\.di\+1,id\)/));
   L('a fly event now carries its brief time, so NO_BRIEF can fire',
     has(/events\.push\(\{id,s:stepM,e:dekitM,to:toM,ld:ldM,report,brief:briefM,/));
   L('an offer is tested before the conflict marks go on',
     has(/if\(\/\^Available\|\^Fly\$\/i\.test\(inp\.type\)\)return;\s*\n\s*markChip\(di,e\.id,'C'\); markRing\(di,e\.id,'hard'\);/));
   L('a sim row is built through win(), and counts its extras',
     has(/const sw=win\(st,en,90\); if\(!sw\)return;/)
     &&has(/\.concat\(s\.pax\|\|\[\]\)\.concat\(s\.more\|\|\[\]\)/)
     &&has(/rowIds=r=>\[r\.p,r\.w,nameToId\(r\.who\)\]\.concat\(r\.pax\|\|\[\]\)\.concat\(r\.more\|\|\[\]\)/));
   L('crew rest is measured off the rest-bearing end only',
     has(/const pe=prevFlyEnd\[id\]!=null\?prevFlyEnd\[id\]:prevEnd\[id\];/)
     &&!has(/const pe=Math\.max\(prevEnd/));
   L('one man twice on a row is one event',
     has(/if\(events\.some\(x=>x\.id===id&&x\.s===w2\[0\]&&x\.e===w2\[1\]&&x\.label===label\)\)return;/));
   L('slotRules reads a sim seat',has(/if\(\/\^s:\/\.test\(k\)\)\{/)&&has(/a\.length===4&&\(a\[3\]==='p'\|\|a\[3\]==='w'\)/));
   L('barDrop revalidates before it judges',has(/try\{ validate\(\); \}catch\(_\)\{\}\s*\n\s*let why=''/));
   L('the free count ranks men on leave as unavailable',
     has(/const rank=id=>\(armKey\?\(slotBar\(id,armKey,arules\)\?2:0\)/)&&has(/\(\(off&&off\.has\(id\)\)\?2:0\)/));
   L('reflow redraws the Inputs table',has(/if\(CURPAGE==='inputs'&&typeof renderInputs==='function'\)renderInputs\(\);/));
   L('a traffic edit goes through the amendment funnel',
     has(/function airEdit\(\)\{/)&&has(/markEdit\(`tr:\$\{\+di\}\.\$\{\+gi\}`\); afterSchedMutate\(\);/));
   L('shiftKeys exists and every splice calls it',
     typeof w.shiftKeys==='function'
     &&has(/shiftAircraft\(dI,gI,r\.li,r\.ai\);/)&&has(/shiftFormation\(dI,gI,r\.li\);/)
     &&has(/DAYS\[di\]\.waves\.splice\(gi,1\); shiftWave\(di,gi\);/)
     &&has(/DAYS\[di\]\.notes\.splice\(ni,1\); shiftKeys\(`dn:\$\{di\}\.`,0,ni\);/)
     &&has(/\[`ap:\$\{di\}\.`,`a:\$\{di\}\.`\]\.forEach\(h=>shiftKeys\(h,0,ri\)\);/));
   /* SCHED is a top-level const/let, so it is unreachable from here — run the
      check inside the page instead (see the jsdom note at the top of this file) */
   L('and it drops the deleted row, shifts the rest, leaves the earlier ones',
     w.eval(`(()=>{const P=JSON.stringify(SCHED.pending),C=JSON.stringify(SCHED.changes),A=JSON.stringify(SCHED.als);
       SCHED.pending={}; SCHED.changes={'dn:0.0':1,'dn:0.1':1,'dn:0.3':2};
       SCHED.als=[{n:1,keys:['dn:0.1','dn:0.3'],sign:{}}];
       shiftKeys('dn:0.',0,1);
       const c=SCHED.changes, k=(SCHED.als[0]||{keys:[]}).keys.join(',');
       const ok=c['dn:0.0']===1&&c['dn:0.1']===undefined&&c['dn:0.2']===2&&k==='dn:0.2';
       SCHED.pending=JSON.parse(P); SCHED.changes=JSON.parse(C); SCHED.als=JSON.parse(A);
       return ok;})()`));
   L('undo puts down an armed slot',has(/ARM=null;\s*\n\s*reflow\(\);/));
   L('changing the board day disarms a slot on another day',
     has(/if\(ARM&&ARM\.di!==n\)disarmSlot\(\);/));
 }


 /* ===================================================================
    B53 — the pre-production audit. One assertion per confirmed finding,
    each pinned to the thing that used to be wrong.
    =================================================================== */
 { const has=re=>re.test(html);

   /* #5 · edit mode is a privilege, not a sticky flag */
   L('#5 a live rule field asks the role, not just the flag',
     has(/const lgCanEdit=\(\)=>LGEDIT&&!!SESSION&&SESSION\.role==='admin';/)
     &&!/const body=LGEDIT\s/.test(html)
     &&has(/\+\(lgCanEdit\(\)\s*\n\s*\? `<input class="lgin"/));
   L('#5 and the flag is dropped on both edges of a session',
     has(/SESSION=null; LGEDIT=false;/)&&has(/SESSION=\{user:u,role:a\.role\}; LGEDIT=false;/));
   L('#5 a member never renders an editable field',
     w.eval(`(()=>{const was=SESSION, e=LGEDIT;
       SESSION={user:'m',role:'member'}; LGEDIT=true; renderLogic();
       const n=document.getElementById('lgBody').querySelectorAll('[data-lgset],[data-lgkind]').length;
       SESSION=was; LGEDIT=e; renderLogic(); return n===0;})()`));

   /* #6 · the RULES MODIFIED stamp survives a reload */
   L('#6 the stamp is set by renderStatus, not only by the Logic page',
     /function renderStatus\(\)\{[\s\S]{0,220}classList\.toggle\('page-rules-off',!!rulesOffCount\(\)\)/.test(html));
   L('#6 and it appears without ever opening Logic',
     w.eval(`(()=>{const was=VCONF.crewRest; VCONF.crewRest=600; renderStatus();
       const on=document.body.classList.contains('page-rules-off');
       VCONF.crewRest=was; renderStatus();
       return on&&!document.body.classList.contains('page-rules-off');})()`));

   /* #7 · a label may not hard-code a threshold */
   L('#7 chip and code labels quote the live threshold',
     has(/CREW_REST:'Crew rest \(<\{crewRest\}\)'/)
     &&has(/CR:'Crew rest breach \(<\{crewRest\}\)'/)
     &&has(/LD:'Long work day \(>\{longDay\}\)'/)
     &&has(/const wlbl=s=>String\(s==null\?'':s\)\.replace\(/));
   L('#7 an edited crew rest changes what the label says',
     w.eval(`(()=>{const was=VCONF.crewRest; VCONF.crewRest=600;
       const a=wlbl(CHIP_LABEL.CR); VCONF.crewRest=was;
       return /10h/.test(a)&&/12h/.test(wlbl(CHIP_LABEL.CR));})()`));
   L('#7 the CREW_TIGHT message does too',
     has(/puts the \$\{lgT\(VCONF\.reportLead\)\} report at \$\{hm24\(nominal\)\}, inside \$\{lgT\(VCONF\.crewRest\)\}/));

   /* #8 · an offer is not a commitment */
   L('#8 offers are excluded from the brief and debrief windows',
     has(/const isOffer=t=>\/\^Available\/i\.test\(String\(t\|\|''\)\)\|\|\/\^Fly\$\/i\.test\(String\(t\|\|''\)\);/)
     &&has(/const timedInput=day\.input\.filter\(i=>i\.e-i\.s<1439&&!isOffer\(i\.type\)\);/));
   /* non-vacuous by construction: the same window as a Meeting MUST add one, so
      a zero from the offer means the exemption worked, not that nothing fired */
   L('#8 an offer adds nothing where a meeting would',
     w.eval(`(()=>{const keep=INPUTS.slice();
       /* whoever is actually flying on day 0 by the time this test runs — earlier
          cases mutate the week, so the first aircraft's front seat may be empty */
       const d=DAYS[0], ce=collectEvents()[0];
       const id=((ce.fly||[]).find(e=>!isSpecial(e.id))||{}).id;
       if(!id)return false;
       const n=t=>{INPUTS.push({person:id,date:d.dt,allday:false,s:300,e:1380,type:t,remarks:'',mod:''});
         const c=validate().all.filter(x=>(x.who||[]).indexOf(id)>=0
           &&(x.code==='NO_BRIEF'||x.code==='DEBRIEF')).length;
         INPUTS.pop(); return c;};
       const base=validate().all.filter(x=>(x.who||[]).indexOf(id)>=0
         &&(x.code==='NO_BRIEF'||x.code==='DEBRIEF')).length;
       const offer=n('Available fly'), real=n('Meeting');
       INPUTS.length=0; keep.forEach(x=>INPUTS.push(x)); validate();
       return offer===base&&real>base;})()`));

   /* #9 / #23 · the Logic tab must describe the engine that exists */
   L('#9 double turning is described at two sorties, with no span test',
     has(/<b>two or more sorties in one day<\/b>/)&&!/three or more sorties in a day/.test(html));
   L('#23 the brief is pinned to take-off, not to the in-time',
     !/the published in-time always wins/.test(html)
     &&has(/It does not move the brief: the brief is a briefing-room event pinned to take-off/));

   /* #10 · a downchit or OL closes an SC SPARE */
   L('#10 spare crew are kept, not discarded, at collect time',
     has(/spareCrew\.push\(id\)/)&&has(/spareCrew:\[\.\.\.new Set\(spareCrew\)\]/));
   L('#10 and OIL still leaves the spare slot open',
     has(/const dn=isDownchit\(inp\.type\), lv=isLeave\(inp\.type\)&&!isLocalLeave\(inp\.type\);/));

   /* #11 / #21 · a tight turn is the larger of the two numbers */
   L('#11 the turn rule takes the larger of threshold and dekit+step',
     has(/const need=Math\.max\(VCONF\.tightTurn,VCONF\.dekit\+VCONF\.step\);/)
     &&has(/if\(turn<need\)\{markChip\(di,id,'TT'\)/)
     &&!/needs \$\{VCONF\.dekit\}\+\$\{VCONF\.step\}\)`\)/.test(html));
   L('#11 and the Logic sentence no longer claims one derives the other',
     !/needs \$\{lgV\(lgT\(VCONF\.tightTurn\)\)\} — \$\{lgV\(lgT\(VCONF\.dekit\)\)\} dekit plus/.test(html)
     &&has(/whichever is longer/));

   /* #14 · an issued AL is history */
   L('#14 the issue stamps its own day list and item count',
     has(/SCHED\.als\.push\(\{n,keys,sign,days:days\.slice\(\),n0:keys\.length\}\);/)
     &&has(/function alCount\(rec\)\{return rec&&rec\.n0!=null\?rec\.n0/));
   L('#14 a delete cannot shrink an amendment that already went out',
     w.eval(`(()=>{const A=JSON.stringify(SCHED.als);
       SCHED.als=[{n:1,keys:['dn:0.0','dn:0.1'],sign:{},days:[0],n0:2}];
       const rec=SCHED.als[0]; rec.keys=[];
       const ok=alCount(rec)===2&&alDays(rec).join(',')==='0';
       SCHED.als=JSON.parse(A); return ok;})()`));

   /* #17 · Edit mode OFF means OFF for the right button too */
   L('#17 right-click obeys the Edit-mode switch',
     has(/if\(!\(editMode\(\)\|\|SBDAY!=null\)\)return;/));

   /* #19 · committing a field must not swallow the next click */
   L('#19 the repaint remembers where the finger was going',
     has(/let LGNEXT=null;/)&&has(/function lgReapply\(\)\{/)
     &&has(/VCONF\[k\]=v; lgReapply\(\);/)&&has(/SHIFT_HARD\[k\]=c\.checked; lgReapply\(\);/));

   /* #22 · a stored override is untrusted input */
   L('#22 a stored rule must be a number inside its own bounds',
     has(/if\(sp&&typeof n==='number'&&isFinite\(n\)&&n>=sp\.lo&&n<=sp\.hi\)VCONF\[k\]=n;/));
   /* jsdom runs on an opaque origin, so localStorage throws and store.get already
      swallows it — the stored value is injected at the store instead. */
   L('#22 a hand-edited string never reaches VCONF',
     w.eval(`(()=>{const was=VCONF.crewRest, wasB=VCONF.briefLead, g=store.get;
       store.get=(k,d)=>k==='rules'?{v:{crewRest:"840",briefLead:99999,dekit:20},s:{}}:g(k,d);
       rulesLoad(); store.get=g;
       const ok=VCONF.crewRest===was&&VCONF.briefLead===wasB&&VCONF.dekit===20;
       VCONF.dekit=RULE_STD.v.dekit; return ok;})()`));
 }


 /* ===================================================================
    B54 — per-day redraw. The week is diffed against the markup it last
    wrote, so only the days that changed are touched. probes/perf1.js and
    probes/perf3.js prove the behaviour in a browser; these pin the source
    and the invariants that make it safe.
    =================================================================== */
 { const has=re=>re.test(html);
   L('a day’s markup is a pure function, extracted from the week loop',
     typeof w.dayHTML==='function'
     &&has(/const html=DAYS\.map\(\(d,di\)=>dayHTML\(di,ed\)\);/)
     &&has(/function dayHTML\(di,ed\)\{\s*\n\s*const d=DAYS\[di\];/));
   /* purity is what makes swapping one section indistinguishable from a full
      rebuild: the body may not read or write the document at all */
   L('and it touches no DOM of its own',(()=>{
     const i=html.indexOf('function dayHTML(di,ed){');
     const j=html.indexOf('\n}\n',i);
     if(i<0||j<0)return false;
     const body=html.slice(i,j);
     return !/document\./.test(body)&&!/innerHTML/.test(body)&&!/\$\('/.test(body)
       &&!/querySelector/.test(body)&&!/getElementById/.test(body);})());
   L('only the days whose markup changed are written',
     has(/for\(let i=0;i<html\.length;i\+\+\)if\(html\[i\]!==prev\.html\[i\]\)changed\.push\(i\)/)
     &&has(/changed\.forEach\(i=>\{secs\[i\]\.outerHTML=html\[i\];\}\)/));
   L('the fallback covers shape, mode, a missing section and a foreign child',
     has(/let whole=!!force\|\|!prev\|\|prev\.ed!==ed\|\|prev\.html\.length!==html\.length/)
     &&has(/\|\|root\.childNodes\.length!==html\.length/)
     &&has(/if\(!secs\[i\]\)\{whole=true;break;\}/));
   L('both paths hold the week’s scroll position',
     has(/const sl=root\.scrollLeft, sb=root\.style\.scrollBehavior;/)
     &&has(/root\.style\.scrollBehavior='auto'; root\.scrollLeft=sl;/));
   L('a swapped day keeps its own per-wave offsets, by index, phone only',
     has(/const phone=window\.innerWidth<=820;/)
     &&has(/if\(k\.gos\.length===gs\.length\)k\.gos\.forEach\(\(x,j\)=>\{if\(x\)gs\[j\]\.scrollLeft=x;\}\)/));
   L('renderSchedule cannot re-enter itself, and never queues past a throw',
     has(/if\(RENDERING\)\{RENDERQ=\{target,editable,force\};return;\}/)
     &&has(/finally\{RENDERING=0; q=RENDERQ; RENDERQ=null;\}/)
     &&has(/finally\{RENDERING=0; RENDERQ=null;\}/));

   /* the escape hatch */
   L('weekDirty forces one day, or drops the cache when it cannot say which',
     typeof w.weekDirty==='function'
     &&has(/if\(di==null\|\|!\(di>=0\)\)return list\.forEach\(t=>\{DAYHTML\[t\]=null;\}\)/)
     &&has(/prev\.html\[di\]=DIRTY/));
   L('and the sentinel can never collide with real markup',
     w.eval(`DIRTY==='\\u0000dirty' && DAYS.every((d,i)=>dayHTML(i,true).indexOf(DIRTY)<0)`));
   L('the cache is replaced wholesale each pass, so no sentinel survives it',
     has(/DAYHTML\[target\]=\{ed,html\};/));

   /* every panel rebuilt from a string goes through setHTML */
   L('identical markup is never written back over itself',
     typeof w.setHTML==='function'
     &&has(/if\(el\.__html===html\)return false;/)
     &&['sbDays','sbBoard','sbWarn','sbInputs'].every(id=>html.indexOf("setHTML($('"+id+"')")>=0)
     &&has(/setHTML\(el,paletteHTML\(SBDAY!=null\?SBDAY:paletteDay\(\)/)
     &&has(/forEach\(l=>setHTML\(l,lg\)\)/));
   L('nothing writes a week or a board panel raw any more',
     !/\$\('(eWeek|vWeek|sbDays|sbBoard|sbWarn|sbInputs|sbRoster|eRoster)'\)\.innerHTML=/.test(html));

   /* the edit week asks the switch, not a hard-coded true */
   L('every edit-week repaint asks the Edit-mode switch',
     typeof w.renderEditWeek==='function'
     &&has(/function renderEditWeek\(\)\{renderSchedule\('eWeek',editMode\(\)\);\}/)
     &&(html.match(/renderEditWeek\(\)/g)||[]).length>=9
     &&(html.match(/renderSchedule\('eWeek'/g)||[]).length===1);

   /* DOM drift the model cannot see is healed locally, never by a rebuild */
   L('a drifted inline field is healed from the model, in place',
     has(/const heal=\(el,want\)=>\{if\(el\.children\.length\|\|el\.textContent!==want\)el\.textContent=want;\};/)
     &&has(/heal\(bo,a\.opts\.bombs\|\|''\)/)&&has(/heal\(ar,areaText\(f\)\)/)
     &&has(/heal\(at,atimeText\(f\)\)/)
     &&has(/heal\(tx,TIME_TXT\.test\(p\)\?fmtTxt\(v\):String\(v==null\?'':v\)\)/));
   /* AREA and TIME are derived until typed over, and BOTH surfaces must derive them
      the same way — otherwise clearing the cell heals it to '' while the renderer
      still says AA2NS, and the day is then skipped for good. */
   L('AREA and TIME derive from ONE builder each, used by both surfaces',
     typeof w.areaText==='function'&&typeof w.atimeText==='function'
     &&has(/const areaTxt = areaText\(f\), timeTxt = atimeText\(f\);/)
     &&(html.match(/areaCodesOf\(f\)/g)||[]).length===3
     &&!/f\.area!=null \? f\.area : areaCodes/.test(html));
   L('clearing a derived AREA cell does not blank it behind the renderer',
     w.eval(`(()=>{const f=(((DAYS[0].waves||[])[0]||{}).formations||[])[0];
       if(!f)return true;
       const wasA=f.area, wasT=f.atime; delete f.area; delete f.atime;
       const codes=areaCodesOf(f);
       const ok = areaText(f)===codes
              && atimeText(f)===(codes?f.to.replace(':','')+'-'+f.ld.replace(':',''):'');
       if(wasA!==undefined)f.area=wasA; if(wasT!==undefined)f.atime=wasT;
       return ok&&!!codes;})()`));
   L('the text-domain time formatter does not double-escape',
     typeof w.fmtTxt==='function'
     &&w.eval(`fmtTxt("A & B")==='A & B' && fmtT("A & B")==='A &amp; B'
       && fmtTxt('0930')===fmtT('0930')`));
   L('an inner comparison survives esc/serialiser disagreement',
     typeof w.sameInner==='function'
     &&w.eval(`(()=>{const d=document.createElement('div');
       const want='<span>'+esc("1200H CO'S BRIEF")+'</span>';
       d.innerHTML=want;
       /* a raw compare fails on the apostrophe; the round trip must not */
       return d.innerHTML!==want && sameInner(d,want);})()`));
   L('the repair never re-renders inside focusout',
     !/const repair=di=>/.test(html)
     && !/focusout',e=>\{[\s\S]{0,3000}?renderEditWeek\(\)/.test(html));
   L('in-times has ONE builder, shared by the renderer and the repair',
     typeof w.intimesInner==='function'
     &&(html.match(/intimesInner\(w\)/g)||[]).length>=2
     &&(html.match(/replace\(\/\^\(\\s\*\\d\{3,4\}\\s\*H\)\/i,'<b>\$1<\/b>'\)/g)||[]).length===1);
   L('Enter commits in the sim-notes block too, since a break never survived',
     has(/if\(e\.key==='Enter'&&!e\.shiftKey\)\{e\.preventDefault\(\);tx\.blur\(\);\}/)
     &&!/!\/\^sn:\/\.test\(tx\.dataset\.txt\)/.test(html));

   /* and the whole point: a one-day edit writes one day */
   L('a one-day edit rewrites exactly one section',
     w.eval(`(()=>{const root=document.getElementById('eWeek');
       if(!root||!root.children.length)return true;              // week not on screen here
       renderSchedule('eWeek',true,true);
       [...root.children].forEach((s,i)=>{s.__keep=i;});
       const ids=Object.keys(PEOPLE).filter(x=>!PEOPLE[x].special);
       const s=root.querySelector('[data-day="1"] .seat[data-slot$=".p"],[data-day="1"] .empty-slot[data-slot$=".p"]');
       if(!s)return true;
       fillSlot(s.dataset.slot,ids[3]); renderSchedule('eWeek',true);
       const kept=[...root.children].filter(x=>x.__keep!==undefined).length;
       return kept>=root.children.length-2;})()`));
 }


 /* ===================================================================
    B55 — free text wraps instead of running over the column beside it.
    probes/wrap.js measures the ink at four widths on both pages and on
    the board; these pin the rules so a later edit cannot drop them.
    =================================================================== */
 { const rule=sel=>RULES.find(r=>r.sel===sel);
   const wraps=sel=>{const r=rule(sel); return !!r&&/overflow-wrap:\s*anywhere/.test(r.body);};
   L('the programme row’s name cell breaks a long token',
     wraps('.allhands .ah-row>.nm')
     &&/min-width:0/.test((rule('.allhands .ah-row>.nm')||{}).body||''));
   L('its sub-line and the EP/ORDERS notes do too',
     wraps('.allhands .ah-row>.nm .sub')&&wraps('.allhands .ah-note'));
   L('every inline text cell does, wherever it appears',
     wraps('.ntx')&&wraps('.itxt,.blknote,.ah-note,.wln,.sbi-rmk,.pl-nil'));
   L('and the people cells can shrink to their track',
     /min-width:0/.test((rule('.plist .pl-row .ppl,.allhands .ah-row .ppl,.sb-arow .ppl')||{}).body||''));
   /* min-width:0 without the wrap, or the wrap without min-width:0, both leave the
      overflow — so the pair is asserted together for the cells that had neither */
   L('the list row’s name cell kept the treatment it already had',
     wraps('.plist .pl-row>.nm')&&wraps('.plist .pl-row .rmk')&&wraps('.rmkcell'));
   L('a puck name is untouched — it still ellipsises on one line',(()=>{
     const r=rule('.puck .nm');
     return !!r&&/white-space:nowrap/.test(r.body)&&/text-overflow:ellipsis/.test(r.body)
       &&!/overflow-wrap/.test(r.body);})());
 }

}catch(e){console.log('THREW '+e.message);F++;}
 console.log('RESULT '+P+' passed, '+F+' failed · errors: '+(errs.length?errs.join(' | '):'none'));
},800);
