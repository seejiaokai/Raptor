/* ---- schedule data (week of Mon 13 Jul 26, Monday..Sunday) ---- */
export const DAYS:any[]=[
 {dow:'Monday',dt:'Jul 13',wc:'4 X 4 X 0',today:true,
  notes:['EP: AB BURN THROUGH ON TAKE OFF','ORDERS: FG SOP CHAP 2 PARA 1-2'],
  allhands:[{prog:'SODB',str:'0745',end:'0815'},{prog:'MET + NOTAM BRIEF',str:'0815',end:'0830',who:'nact'},{prog:'FLIGHT SAFETY STAND-DOWN',str:'0830',end:'0900',who:'bane'},{prog:'WPNS & TACTICS SYNC',str:'1130',end:'1200',who:'harpoon'},{prog:'STANDARDISATION MEETING',str:'1330',end:'1430',who:'pump'},{prog:'OCU PROGRESS REVIEW',str:'1445',end:'1530',who:'bapster'},{prog:'INTEL UPDATE',str:'1600',end:'1620',who:'romeo'},{prog:'OPS SHARING + EGI SYS BRIEF',str:'1755',end:'',who:'stiff'},{prog:'DINNER WITH CFG',str:'1830',end:''},{prog:'CFG ENGAGEMENT @ CREW ROOM (ALL)',str:'2130',end:''}],
  waves:[
   {label:'WAVE 1',night:false,intimes:['1200H: FIRST WAVE VL IN TIME + WX/NOTAMS','1300H: FIRST WAVE RU IN TIME + WX/NOTAMS'],traffic:['1 X G550 / D15HOH / FL240 / 1300H - 1715H'],formations:[
     {cs:'VL',msn:'BFM',to:'12:40',ld:'14:05',aircraft:[
       {p:'stiff',w:'freak',area:'D1415',rmks:'1B: BFM-6',opts:{tk2:true,tpod:true,nav:false,bombs:''}},
       {p:'bane',w:'wolf',area:'AA2NS',rmks:'2A: BFM-5',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]},
     {cs:'RU',msn:'BFM',to:'13:40',ld:'15:05',aircraft:[
       {p:'slipway',w:'divot',area:'D1415',rmks:'PRI LSR',opts:{tk2:true,tpod:true,nav:false,bombs:''}},
       {p:'pump',w:'dirty',area:'AA2NS',rmks:'2A: BFM-ADD',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]}]},
   {label:'WAVE 2',night:true,intimes:['1900H: NIGHT WAVE VL IN TIME + WX/NOTAMS','1920H: NIGHT WAVE RU IN TIME + WX/NOTAMS'],traffic:[],formations:[
     {cs:'VL',msn:'BFM',to:'19:45',ld:'21:10',aircraft:[
       {p:'stiff',w:'freak',area:'D15R',rmks:'1B: NIGHT BFM',opts:{tk2:true,tpod:false,nav:true,bombs:''}},
       {p:'bapster',w:'nick',area:'AA2NS',rmks:'2A: DT / OCU',opts:{tk2:false,tpod:false,nav:true,bombs:''}}]},
     {cs:'RU',msn:'BFM',to:'19:20',ld:'20:45',aircraft:[
       {p:'pump',w:'dirty',area:'D15R',rmks:'1A: NIGHT',opts:{tk2:true,tpod:false,nav:true,bombs:''}},
       {p:'casper',w:'shrek',area:'AA2NS',rmks:'2A: NIGHT BFM',opts:{tk2:false,tpod:false,nav:true,bombs:''}}]}]}],
  /* sim rows take EITHER a 2-seat crew (p / w) OR a pax list of any size — AMT box
     sessions routinely run a full 8, and an OFT can carry a 3rd body (IP / observer). */
  sims:{amt:[{label:'BRIEF',str:'1100',end:'',rmks:'ALL 8 PAX @ AMT BLDG'},
             {label:'BOX',str:'1130',end:'1230',pax:['prowler','drill','taipan','nasty','ignite','rocky','bruise','psy'],rmks:'2 X 4-SHIP // 2TK TPOD 9X'},
             {label:'DEBRIEF',str:'1230',end:'',rmks:''}],
        oft:[{label:'EP-4',str:'0800',end:'0930',p:'haowen',w:'stiff',rmks:'A: IEPE / EP-3N // BRIEF 30 PRIOR'},{label:'EP-4',str:'1200',end:'1330',p:'bane',w:'snap',rmks:'A: SA(S)-3 // BRIEF 30 PRIOR'},{label:'SIMS (149)',str:'1330',end:'1500',who:'149',rmks:'149 SQN SLOT'},{label:'EP-6',str:'1500',end:'1630',p:'prism',rmks:'B: SEFE'},
             {label:'EP-6N',str:'1700',end:'1830',pax:['shaft','riddler','sufa'],rmks:'NIGHT EP // 3RD BODY = OBSERVER'}]},
  dutywaves:[{label:'1st wave',rows:[{role:'SXO',id:'razer',str:'0600',end:'1300'},{role:'OPS-O',id:'glass',str:'0600',end:'1400'},{role:'SDO',id:'mamba',str:'0700',end:'1300'}]},
             {label:'2nd wave',rows:[{role:'SXO',id:'yeti',str:'1300',end:'2130'},{role:'OPS-O',id:'stuff',str:'1400',end:'2130'},{role:'SDO',id:'chaps',str:'1300',end:'2130'}]}],
  ground:[{prog:'CAF ENGAGEMENT @ MINDEF HQ',str:'0845',end:'1630',who:'dj'},{prog:'MTG W CACC @ MINDEF',str:'0930',end:'1100',who:'vegas'},{prog:'MEDICAL APPT',str:'1030',end:'1230',who:'fantom'},{prog:'DENTAL APPT',str:'1200',end:'1330',who:'krait'},{prog:'HAM ENGAGEMENT @ AFTC',str:'1630',end:'1800',who:'dj'},{prog:'OPS/LOGS @ 149 SQN',str:'1400',end:'1530',who:'slash'}]},

 {dow:'Tuesday',dt:'Jul 14',wc:'4 X 4 X 0',
  notes:['ORDERS: FG SOP CHAP 3 PARA 4'],
  allhands:[{prog:'SODB',str:'0545',end:'0600'},{prog:'MASS BRIEF',str:'0600',end:'0630'}],
  waves:[
   {label:'WAVE 1',night:false,intimes:['0600H: FIRST WAVE VL IN TIME + WX/NOTAMS','0700H: FIRST WAVE RU IN TIME + WX/NOTAMS'],traffic:[],formations:[
     {cs:'VL',msn:'BFM',to:'08:40',ld:'10:05',aircraft:[
       {p:'nact',w:'glass',area:'D4445',rmks:'1B: BFM-3',opts:{tk2:true,tpod:true,nav:false,bombs:''}},
       {p:'casper',w:'rocky',area:'AA2NS',rmks:'2A: BFM-6',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]},
     {cs:'RU',msn:'BFM',to:'09:40',ld:'11:05',aircraft:[
       {p:'slipway',w:'divot',area:'D4445',rmks:'1A: NO AAR',opts:{tk2:true,tpod:false,nav:false,bombs:''}},
       {p:'bruise',w:'spaceman',area:'AA2NS',rmks:'PRI LSR',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]}]},
   {label:'WAVE 2',night:false,intimes:['1200H: SECOND WAVE VL IN TIME + WX/NOTAMS','1300H: SECOND WAVE RU IN TIME + WX/NOTAMS'],traffic:[],formations:[
     {cs:'VL',msn:'SAT',to:'14:40',ld:'16:05',aircraft:[
       {p:'dj',w:'wolf',area:'D14154445',rmks:'SAT 2VX',opts:{tk2:true,tpod:true,nav:false,bombs:'2 X GBU-12'}},
       {p:'salsa',w:'pain',area:'AA2NS',rmks:'2A: SAT-REF',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]},
     {cs:'RU',msn:'ACM',to:'14:40',ld:'16:05',aircraft:[
       {p:'romeo',w:'ammo',area:'D14154445',rmks:'RED AIR',opts:{tk2:true,tpod:false,nav:false,bombs:''}},
       {p:'vegas',w:'cards',area:'AA2NS',rmks:'2A: ACM-2',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]}]}],
  sims:{amt:[{label:'BRIEF',str:'1400',end:''},{label:'BOX',str:'1430',end:'1530'},{label:'DEBRIEF',str:'1530',end:''}],
        oft:[{label:'EP-5',str:'0930',end:'1100',p:'haowen',w:'freak'},{label:'SIMS (149)',str:'1200',end:'1330',who:'149'}]},
  dutywaves:[{label:'1st wave',rows:[{role:'SXO',id:'snap',str:'0500',end:'1200'},{role:'OPS-O',id:'wolf',str:'0500',end:'1200'},{role:'SDO',id:'boosh',str:'0530',end:'1200'}]},
             {label:'2nd wave',rows:[{role:'SXO',id:'razer',str:'1200',end:'1700'},{role:'OPS-O',id:'stuff',str:'1200',end:'1700'},{role:'SDO',id:'beams',str:'1200',end:'1700'}]}],
  ground:[{prog:'OPS BRIEFER / EP SUP',str:'0500',end:'',who:'dice'},{prog:'FLY W 149',str:'0845',end:'',who:'ipman'},{prog:'MEDICAL APPT',str:'1330',end:'1500',who:'yeti'}]},

 {dow:'Wednesday',dt:'Jul 15',wc:'4 X 4 X 0',
  notes:['ORDERS: FG SOP CHAP 2 PARA 1-2'],
  allhands:[{prog:'SODB',str:'0745',end:'0800'}],
  waves:[
   {label:'WAVE 1',night:false,intimes:['1000H: FIRST WAVE VL IN TIME + WX/NOTAMS','1000H: FIRST WAVE RU IN TIME + WX/NOTAMS'],traffic:[],formations:[
     {cs:'VL',msn:'ACM',to:'10:35',ld:'12:00',aircraft:[
       {p:'harpoon',w:'dirty',area:'D4445',rmks:'1B: ACM-4',opts:{tk2:true,tpod:true,nav:false,bombs:''}},
       {p:'bruise',w:'rocky',area:'AA2NS',rmks:'2A: ACM ADD',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]},
     {cs:'RU',msn:'ACM',to:'10:35',ld:'12:00',aircraft:[
       {p:'ignite',w:'psy',area:'D4445',rmks:'RED AIR',opts:{tk2:true,tpod:false,nav:false,bombs:''}},
       {p:'krait',w:'wrangler',area:'AA2NS',rmks:'2A: ACM-8',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]}]},
   {label:'WAVE 2',night:false,intimes:['1200H: SECOND WAVE VL IN TIME + WX/NOTAMS','1200H: SECOND WAVE RU IN TIME + WX/NOTAMS'],traffic:[],formations:[
     {cs:'VL',msn:'BFM',to:'13:00',ld:'14:25',aircraft:[
       {p:'harpoon',w:'dirty',area:'D14154445',rmks:'1B: BFM-4 // TIGHT TURN',opts:{tk2:true,tpod:false,nav:false,bombs:''}},
       {p:'yeti',w:'shrek',area:'AA2NS',rmks:'2A: BFM ADD',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]},
     {cs:'RU',msn:'BFM',to:'13:00',ld:'14:25',aircraft:[
       {p:'vinci',w:'plasma',area:'D14154445',rmks:'PRI LSR',opts:{tk2:true,tpod:false,nav:false,bombs:''}},
       {p:'pike',w:'badger',area:'AA2NS',rmks:'2A: BFM-8',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]}]}],
  sims:{amt:[{label:'BRIEF',str:'1100',end:''},{label:'BOX',str:'1130',end:'1230'},{label:'DEBRIEF',str:'1230',end:''}],
        oft:[{label:'EP-4',str:'0900',end:'1030',pax:['boosh','xray','waldo']},
             {label:'IAT-3',str:'1500',end:'1630',p:'prism',w:'nasty'}]},
  dutywaves:[{label:'1st wave',rows:[{role:'SXO',id:'shaft',str:'0800',end:'1400'},{role:'OPS-O',id:'divot',str:'0800',end:'1400'},{role:'SDO',id:'mamba',str:'0800',end:'1400'}]}],
  ground:[{prog:'CFG-C7 CONF @ 7-AELG',str:'1400',end:'1630',who:'dj'},{prog:'EGI-GPS TRIAL PREP',str:'1400',end:'',who:'vegas'}]},

 {dow:'Thursday',dt:'Jul 16',wc:'4 X 4 X 0',
  notes:['EXAM PERIOD RESTRICTIONS / 21 JUL 0700H - 24 JUL 1800H','ORDERS: FG SOP CHAP 2 PARA 8'],
  allhands:[{prog:'SODB',str:'0745',end:'0800'},{prog:'CAF ENGAGEMENT @ MINDEF HQ',str:'0845',end:'1630',who:'dj'}],
  waves:[
   {label:'WAVE 1',night:false,intimes:['1200H: FIRST WAVE VL IN TIME + WX/NOTAMS','1200H: FIRST WAVE RU IN TIME + WX/NOTAMS'],traffic:[],formations:[
     {cs:'VL',msn:'SAT',to:'12:45',ld:'14:10',aircraft:[
       {p:'slash',w:'glass',area:'D15R',rmks:'1B: SAT-REF',opts:{tk2:true,tpod:true,nav:false,bombs:''}},
       {p:'salsa',w:'stuff',area:'AA2NS',rmks:'2A: SAT-2',opts:{tk2:true,tpod:false,nav:false,bombs:''}}]},
     {cs:'RU',msn:'AD',to:'12:45',ld:'14:10',aircraft:[
       {p:'dj',w:'wolf',area:'D15R',rmks:'DS FOR VL',opts:{tk2:true,tpod:false,nav:false,bombs:''}},
       {p:'bapster',w:'badger',area:'AA2NS',rmks:'2A: AD-1 / CX M1',opts:{tk2:false,tpod:false,nav:false,bombs:''}}]}]},
   {label:'WAVE 2',night:true,intimes:['1615H: NIGHT WAVE VL IN TIME + WX/NOTAMS','1615H: NIGHT WAVE RU IN TIME + WX/NOTAMS'],traffic:[],formations:[
     {cs:'VL',msn:'BFM',to:'16:45',ld:'18:10',aircraft:[
       {p:'nact',w:'freak',area:'D15R',rmks:'1A: D-N CURRENCY',opts:{tk2:true,tpod:false,nav:true,bombs:''}},
       {p:'ignite',w:'nasty',area:'AA2NS',rmks:'2A: BFM-ADD',opts:{tk2:true,tpod:false,nav:true,bombs:''}}]},
     {cs:'RU',msn:'BFM',to:'16:45',ld:'18:10',aircraft:[
       {p:'bane',w:'rocky',area:'D15R',rmks:'1B: NIGHT',opts:{tk2:true,tpod:false,nav:true,bombs:''}},
       {p:'vinci',w:'drill',area:'AA2NS',rmks:'2A: BFM-8X / OC CHK',opts:{tk2:true,tpod:false,nav:true,bombs:''}}]}]}],
  sims:{amt:[{label:'BRIEF',str:'1100',end:''},{label:'BOX',str:'1130',end:'1230'},{label:'DEBRIEF',str:'1230',end:''}],
        oft:[{label:'EP-4',str:'0900',end:'1030',p:'haowen',w:'plasma'},{label:'SIMS (149)',str:'1200',end:'1330',who:'149'}]},
  dutywaves:[{label:'1st wave',rows:[{role:'SXO',id:'shaft',str:'0800',end:'1400'},{role:'OPS-O',id:'divot',str:'0800',end:'1400'},{role:'SDO',id:'razer',str:'0800',end:'1400'}]},
             {label:'2nd wave',rows:[{role:'SXO',id:'chaps',str:'1400',end:'1900'},{role:'OPS-O',id:'spaceman',str:'1400',end:'1900'},{role:'SDO',id:'beams',str:'1400',end:'1900'}]}],
  ground:[{prog:'MEDICAL APPT',str:'1030',end:'1230',who:'fantom'},{prog:'DENTAL APPT',str:'1200',end:'1330',who:'krait'}]},

 {dow:'Friday',dt:'Jul 17',wc:'0 X 0 X 0',
  notes:['NO FLYING - GROUND TRAINING DAY','ORDERS: FG SOP CHAP 5'],
  allhands:[{prog:'SODB',str:'0745',end:'0800'},{prog:'SQN PT',str:'1500',end:'1630'},{prog:'MASS DEBRIEF + BEER CALL',str:'1700',end:''}],
  waves:[],
  sims:{amt:[],oft:[{label:'SIMS (149)',str:'0900',end:'1030',who:'149'},{label:'EP-6',str:'1400',end:'1530',p:'bapster',w:'shaft'}]},
  dutywaves:[{label:'Duty',rows:[{role:'SXO',id:'razer',str:'0730',end:'1730'},{role:'SDO',id:'yeti',str:'0730',end:'1730'}]}],
  ground:[{prog:'GROUND SCHOOL - EW',str:'0900',end:'1100',who:'stiff'},{prog:'AIRCREW ADMIN',str:'1100',end:'1200'}]},
 /* The week runs Monday..Sunday (owner, Aug 26). The weekend is non-flying:
    every section is present but empty, exactly as Friday's shape, because
    dayCount reads `wc` for the head badge and dayKeys walks every section to
    build a day's snapshot key space — an omitted key would leave holes in
    both. A duty crew still stands the weekend, which is what the squadron
    actually does, and gives the days something real to validate. */
 {dow:'Saturday',dt:'Jul 18',wc:'0 X 0 X 0',
  notes:['WEEKEND - NO FLYING','DUTY CREW ON CALL'],
  allhands:[],
  waves:[],
  sims:{amt:[],oft:[]},
  dutywaves:[{label:'Duty',rows:[{role:'SDO',id:'plasma',str:'0800',end:'1800'}]}],
  ground:[]},
 {dow:'Sunday',dt:'Jul 19',wc:'0 X 0 X 0',
  notes:['WEEKEND - NO FLYING','DUTY CREW ON CALL'],
  allhands:[],
  waves:[],
  sims:{amt:[],oft:[]},
  dutywaves:[{label:'Duty',rows:[{role:'SDO',id:'spaceman',str:'0800',end:'1800'}]}],
  ground:[]},
];

