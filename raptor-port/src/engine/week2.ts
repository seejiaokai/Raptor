/* ---- SECOND DEMO WEEK (week of Mon 20 Jul 26) ----
   A second, switchable week of demo data (owner, 21 Aug 26). It is authored to
   EXERCISE MOST OF THE WARNING FAMILIES so a first-time visitor can see the app
   working — a realistic week with a few deliberate issues sprinkled through it,
   each noted in the seat remarks:
     · Mon  — a crew solo (two OCU in one jet), a CO-approval pairing (D+C), a
              tight turn / double turn (a lead flies both waves), a double
              booking (a man in a jet and a sim at the same time)
     · Tue  — an OCU formation with no IP (OCU-no-IP), an illegal seat (a
              non-instructor pilot in the back), more OCU crew solos
     · Wed  — a long work day (early ground + a night wave)
     · Thu  — a crew-rest breach (Wed night → Thu early) and a medical
              downchit flown against (from WEEK2_INPUTS)
     · Fri  — ground training day; Sat/Sun the non-flying weekend
   It is NOT compared against the read-only reference (parity only ever loads
   the Jul 13 week), so these warnings cost nothing there. It deliberately stays
   clear of the two blind spots the demo keeps out (owner): nobody on ATT B is
   seated to fly, there is no IRT mission (which would want the lone IR
   examiner), and no seat carries an AAR remark that would want AAR currency.
   The roster ids are the shared PEOPLE ids — their DISPLAY names are the same
   fictional handles as week 1. */
export const WEEK2_DAYS:any[]=[
 {dow:'Monday',dt:'Jul 20',wc:'4 X 2 X 0',
  notes:['DEMO — SECOND SCHEDULE WEEK','ORDERS: FG SOP CHAP 2 PARA 1-2'],
  allhands:[{prog:'SODB',str:'0745',end:'0800'},{prog:'MASS BRIEF',str:'0800',end:'0830'},{prog:'STANDARDISATION MEETING',str:'1330',end:'1430',who:'pump'}],
  waves:[
   {label:'WAVE 1',night:false,intimes:['0700H: FIRST WAVE VL IN TIME + WX/NOTAMS','0700H: FIRST WAVE RU IN TIME + WX/NOTAMS'],traffic:[],formations:[
     {cs:'VL',msn:'BFM',to:'08:40',ld:'10:05',aircraft:[
       {p:'bane',w:'freak',area:'D1415',rmks:'1B: BFM-4',opts:{tk2:true,tpod:true,nav:false,bombs:''}},
       {p:'bapster',w:'nick',area:'AA2NS',rmks:'2A: OCU CREW SOLO',opts:{tk2:false,tpod:false,nav:false,bombs:''}}]},
     {cs:'RU',msn:'BFM',to:'08:40',ld:'10:05',aircraft:[
       {p:'fantom',w:'rocky',area:'D1415',rmks:'1A: CO APPR PAIR',opts:{tk2:true,tpod:false,nav:false,bombs:''}},
       {p:'casper',w:'shrek',area:'AA2NS',rmks:'2A: BFM-5 (ALSO ON SIM)',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]}]},
   {label:'WAVE 2',night:false,intimes:['1000H: SECOND WAVE VL IN TIME + WX/NOTAMS'],traffic:[],formations:[
     {cs:'VL',msn:'ACM',to:'10:30',ld:'11:55',aircraft:[
       {p:'bane',w:'freak',area:'D1415',rmks:'1B: ACM // TIGHT TURN OFF WAVE 1',opts:{tk2:true,tpod:false,nav:false,bombs:''}},
       {p:'slash',w:'dirty',area:'AA2NS',rmks:'2A: ACM-2',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]}]}],
  sims:{amt:[{label:'BRIEF',str:'1100',end:'',rmks:'PAX @ AMT BLDG'},
             {label:'BOX',str:'1130',end:'1230',pax:['prowler','drill','taipan','nasty'],rmks:'2 X 2-SHIP'},
             {label:'DEBRIEF',str:'1230',end:''}],
        oft:[{label:'EP-4',str:'0900',end:'1030',p:'casper',w:'stiff',rmks:'A: EP // BRIEF 30 PRIOR'},{label:'SIMS (EXT SQN)',str:'1330',end:'1500',who:'EXT SQN',rmks:'EXT SQN SLOT'}]},
  dutywaves:[{label:'1st wave',rows:[{role:'SDO',id:'mamba',str:'0700',end:'1300'},{role:'SXO',id:'razer',str:'0600',end:'1300'},{role:'OPS-O',id:'glass',str:'0600',end:'1400'}]},
             {label:'2nd wave',rows:[{role:'SDO',id:'chaps',str:'1300',end:'1900'},{role:'SXO',id:'yeti',str:'1300',end:'1900'}]}],
  ground:[{prog:'MEDICAL APPT',str:'1030',end:'1230',who:'vegas'},{prog:'AIRCREW ADMIN',str:'1400',end:'1500'}]},

 {dow:'Tuesday',dt:'Jul 21',wc:'4 X 2 X 0',
  notes:['ORDERS: FG SOP CHAP 3 PARA 4'],
  allhands:[{prog:'SODB',str:'0545',end:'0600'},{prog:'MASS BRIEF',str:'0600',end:'0630'}],
  waves:[
   {label:'WAVE 1',night:false,intimes:['0500H: FIRST WAVE VL IN TIME + WX/NOTAMS'],traffic:[],formations:[
     {cs:'VL',msn:'SAT',to:'09:00',ld:'10:25',aircraft:[
       {p:'harpoon',w:'glass',area:'D4445',rmks:'1B: SAT-2',opts:{tk2:true,tpod:true,nav:false,bombs:'2 X GBU-12'}},
       {p:'ignite',w:'freak',area:'AA2NS',rmks:'2A: SAT-REF',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]},
     {cs:'RU',msn:'BFM',to:'09:00',ld:'10:25',aircraft:[
       {p:'prism',w:'nick',area:'D4445',rmks:'1A: OCU // FORMATION HAS NO IP',opts:{tk2:false,tpod:false,nav:false,bombs:''}},
       {p:'bapster',w:'bullet',area:'AA2NS',rmks:'2A: OCU',opts:{tk2:false,tpod:false,nav:false,bombs:''}}]}]},
   {label:'WAVE 2',night:false,intimes:[],traffic:[],formations:[
     {cs:'VL',msn:'BFM',to:'13:00',ld:'14:25',aircraft:[
       {p:'harpoon',w:'ignite',area:'D15R',rmks:'1B: ILLEGAL SEAT — PILOT IN BACK',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]}]}],
  sims:{amt:[],oft:[{label:'EP-5',str:'1000',end:'1130',p:'stiff',w:'plasma'},{label:'SIMS (EXT SQN)',str:'1200',end:'1330',who:'EXT SQN'}]},
  dutywaves:[{label:'1st wave',rows:[{role:'SDO',id:'boosh',str:'0530',end:'1200'},{role:'SXO',id:'snap',str:'0500',end:'1200'}]}],
  ground:[{prog:'GROUND SCHOOL - EW',str:'0900',end:'1100',who:'chaps'},{prog:'MEDICAL APPT',str:'1330',end:'1500',who:'yeti'}]},

 {dow:'Wednesday',dt:'Jul 22',wc:'2 X 2 X 0',
  notes:['ORDERS: FG SOP CHAP 2 PARA 1-2'],
  allhands:[{prog:'SODB',str:'0745',end:'0800'}],
  waves:[
   {label:'WAVE 1',night:false,intimes:[],traffic:[],formations:[
     {cs:'VL',msn:'ACM',to:'10:00',ld:'11:25',aircraft:[
       {p:'pump',w:'dirty',area:'D4445',rmks:'1B: ACM-4',opts:{tk2:true,tpod:false,nav:false,bombs:''}},
       {p:'bruise',w:'rocky',area:'AA2NS',rmks:'2A: ACM ADD',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]}]},
   {label:'WAVE 2',night:true,intimes:['1900H: NIGHT WAVE VL IN TIME + WX/NOTAMS'],traffic:[],formations:[
     {cs:'VL',msn:'BFM',to:'20:05',ld:'21:30',aircraft:[
       {p:'salsa',w:'stuff',area:'D15R',rmks:'1B: NIGHT BFM — EARLY SORTIE THU',opts:{tk2:true,tpod:false,nav:true,bombs:''}},
       {p:'nact',w:'freak',area:'AA2NS',rmks:'2A: NIGHT // LONG DAY',opts:{tk2:true,tpod:false,nav:true,bombs:''}}]}]}],
  sims:{amt:[],oft:[]},
  dutywaves:[{label:'1st wave',rows:[{role:'SDO',id:'shaft',str:'0800',end:'1400'}]}],
  ground:[{prog:'MET BRIEF',str:'0600',end:'0630',who:'nact'},{prog:'STAFF MTG @ HQ',str:'1400',end:'1600',who:'vegas'}]},

 {dow:'Thursday',dt:'Jul 23',wc:'2 X 0 X 0',
  notes:['ORDERS: FG SOP CHAP 2 PARA 8'],
  allhands:[{prog:'SODB',str:'0700',end:'0715'}],
  waves:[
   {label:'WAVE 1',night:false,intimes:['0600H: FIRST WAVE VL IN TIME + WX/NOTAMS'],traffic:[],formations:[
     {cs:'VL',msn:'BFM',to:'07:30',ld:'08:55',aircraft:[
       {p:'salsa',w:'pain',area:'D4445',rmks:'1B: EARLY — CREW REST TIGHT',opts:{tk2:true,tpod:false,nav:false,bombs:''}},
       {p:'bruise',w:'spaceman',area:'AA2NS',rmks:'2A: BFM // MED DOWN',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]}]}],
  sims:{amt:[],oft:[]},
  dutywaves:[{label:'1st wave',rows:[{role:'SDO',id:'beams',str:'0630',end:'1300'}]}],
  ground:[{prog:'DENTAL APPT',str:'1000',end:'1130',who:'yeti'}]},

 {dow:'Friday',dt:'Jul 24',wc:'0 X 0 X 0',
  notes:['NO FLYING - GROUND TRAINING DAY','ORDERS: FG SOP CHAP 5'],
  allhands:[{prog:'SODB',str:'0745',end:'0800'},{prog:'SQN PT',str:'1500',end:'1630'},{prog:'MASS DEBRIEF + BEER CALL',str:'1700',end:''}],
  waves:[],
  sims:{amt:[],oft:[{label:'EP-6',str:'1400',end:'1530',p:'boosh',w:'shaft'}]},
  dutywaves:[{label:'Duty',rows:[{role:'SDO',id:'yeti',str:'0730',end:'1730'},{role:'SXO',id:'razer',str:'0730',end:'1730'}]}],
  ground:[{prog:'GROUND SCHOOL - EW',str:'0900',end:'1100',who:'stiff'},{prog:'AIRCREW ADMIN',str:'1100',end:'1200'}]},
 {dow:'Saturday',dt:'Jul 25',wc:'0 X 0 X 0',
  notes:['WEEKEND - NO FLYING','DUTY CREW ON CALL'],
  allhands:[],
  waves:[],
  sims:{amt:[],oft:[]},
  dutywaves:[{label:'Duty',rows:[{role:'SDO',id:'plasma',str:'0800',end:'1800'}]}],
  ground:[]},
 {dow:'Sunday',dt:'Jul 26',wc:'0 X 0 X 0',
  notes:['WEEKEND - NO FLYING','DUTY CREW ON CALL'],
  allhands:[],
  waves:[],
  sims:{amt:[],oft:[]},
  dutywaves:[{label:'Duty',rows:[{role:'SDO',id:'spaceman',str:'0800',end:'1800'}]}],
  ground:[]},
];
export const WEEK2_DATES=['Jul 20','Jul 21','Jul 22','Jul 23','Jul 24','Jul 25','Jul 26'];
/* week-2 personal inputs (loaded with the week): a medical downchit flown
   against on Thu (bruise → DNIF_FLY), plus an ordinary appointment and a leave
   so the Inputs page and the board's Unavailable rows have something to show.
   No ATT B — the deliberate blind spot stays out. */
export const WEEK2_INPUTS=[
  {person:'bruise', date:'Jul 23', allday:true,               type:'OML',         remarks:'Medical leave — grounded', mod:'2026-07-06'},
  {person:'vegas',  date:'Jul 20', allday:false, s:600, e:720, type:'Appointment', remarks:'Medical / PHA', mod:'2026-07-06'},
  {person:'nick',   date:'Jul 24', allday:true,               type:'LL',          remarks:'Local leave', mod:'2026-07-10'},
];
