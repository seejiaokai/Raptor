/* Assemble src/engine/*.ts from verbatim line ranges of reference/scheduler.html.
   Transforms applied (and nothing else):
   - `export ` prefixed to top-level (col-0) function/const/let declarations
   - `:any` annotations on simple identifier parameters (top-level and
     const-assigned arrow helpers), since strict TS forbids implicit any
   - explicit `:any` on listed mutable/dictionary declarations
   - per-module import/glue headers */
const fs = require('fs');
const SRC = require('path').join(__dirname,'..','reference','scheduler.html');
const OUT = require('path').join(__dirname,'..','src','engine');
const lines = fs.readFileSync(SRC, 'utf8').split('\n');
const grab = (a, b) => lines.slice(a - 1, b).join('\n');

// decl-name -> type to inject after the name
const TYPED = {
  PEOPLE: ':any', QORDER: ':any', SAWAVE: ':any', MTYPE: ':any',
  LEAVE_TYPES: ':any', INPUTS: ':any[]', VCONF: ':any', SHIFT_HARD: ':any',
  WCODE: ':any', CHIP_TEXT: ':any', RANK: ':any', CHIP_LABEL: ':any',
  SEVWORD: ':any', WARN: ':any', REST: ':any', EVD: ':any', SCHED: ':any',
  AL_COLORS: ':any[]', SIGN_ROLES: ':any[]', RULE_STD: ':any', RULE_SPEC: ':any',
  KIND_LABEL: ':any', ID_BY_CS: ':any', DAYS: ':any[]', HIST: ':any',
};
// functions whose trailing params must be optional (callers omit them)
const OPTIONAL = { win: ['openEnd'], signPeople: ['keep'], markEdit: ['key'], slotBar: ['rules'], armSlot: ['el'], puck: [] };

function annotateParams(fnName, params) {
  if (!params.trim()) return params;
  const parts = params.split(',');
  if (!parts.every(p => /^\s*[A-Za-z_$][\w$]*\s*$/.test(p))) return params; // leave destructuring/defaults alone
  const opt = OPTIONAL[fnName] || [];
  return parts.map(p => {
    const id = p.trim();
    return id + (opt.includes(id) ? '?' : '') + ':any';
  }).join(',');
}

function transform(text) {
  text = text.split('\n').map(line => {
    let m;
    // top-level exports
    if ((m = line.match(/^function\s+([A-Za-z_$][\w$]*)\(([^)]*)\)/))) {
      line = 'export ' + line.replace(/^function\s+([A-Za-z_$][\w$]*)\(([^)]*)\)/,
        (_, n, p) => `function ${n}(${annotateParams(n, p)})`);
    } else if ((m = line.match(/^(const|let)\s+([A-Za-z_$][\w$]*)\s*=/))) {
      const name = m[2];
      if (TYPED[name]) line = line.replace(new RegExp(`^(const|let)\\s+(${name})\\s*=`), `$1 $2${TYPED[name]}=`);
      line = 'export ' + line;
    }
    // arrows with simple parenthesised params: (a,b)=>  →  (a:any,b:any)=>
    line = line.replace(/\(([A-Za-z_$][\w$]*(?:,[A-Za-z_$][\w$]*)*)\)=>/g,
      (all, p) => `(${p.split(',').map(x => x + ':any').join(',')})=>`);
    // arrows with array-destructured params: ([a,b])=>  →  ([a,b]:any)=>
    line = line.replace(/\(\[([\w$,\s]*)\]\)=>/g, '([$1]:any)=>');
    // bare single-param arrows: x=>  →  (x:any)=>   (preceded by = ( , or whitespace)
    line = line.replace(/([=(,\s])([A-Za-z_$][\w$]*)=>/g, '$1($2:any)=>');
    // untyped empty-literal / null declarations (first declarator after const/let)
    line = line.replace(/((?:const|let)\s+)([A-Za-z_$][\w$]*)=\{\}/g, '$1$2:any={}');
    line = line.replace(/((?:const|let)\s+)([A-Za-z_$][\w$]*)=\[\]/g, '$1$2:any[]=[]');
    line = line.replace(/((?:const|let)\s+)([A-Za-z_$][\w$]*)=null([,;])/g, '$1$2:any=null$3');
    return line;
  }).join('\n');
  // targeted arity/inference fixes (annotation-only; call sites in the
  // reference legitimately omit these trailing args)
  const targeted = [
    ['const has=(r:any,who:any)=>', 'const has=(r:any,who?:any)=>'],
    ['const add=(st:any,en:any,dflt:any)=>', 'const add=(st:any,en:any,dflt?:any)=>'],
    ['out={seat:null,sc:null,scStart:null,scEnd:null,scSpare:false,aar:null,di:-1}',
     'out:any={seat:null,sc:null,scStart:null,scEnd:null,scSpare:false,aar:null,di:-1}'],
    ['const w={label:S.label,kind,standalone:true,noconf:!!S.all,night:kind!==\'sc\',intimes:[],traffic:[],formations:[]};',
     'const w:any={label:S.label,kind,standalone:true,noconf:!!S.all,night:kind!==\'sc\',intimes:[],traffic:[],formations:[]};'],
    // multi-declarator lines: later declarators typed too (first is handled above)
    ['const ev=collectEvents(), all=[], byDay=[], sev={}, chip={};',
     'const ev=collectEvents(), all:any[]=[], byDay:any[]=[], sev:any={}, chip:any={};'],
    ['const di=day.di, ws=[], seen=new Set();',
     'const di=day.di, ws:any[]=[], seen=new Set();'],
    ['const evd:any={}; day.events', 'const evd:any={}; day.events'],
    ['const evd=EVD[di]={};', 'const evd:any=EVD[di]={};'],
    ['let s:any=null,e=null;', 'let s:any=null,e:any=null;'],
    ['const fly:any[]=[],forms=[],events=[],simcrew=[];',
     'const fly:any[]=[],forms:any[]=[],events:any[]=[],simcrew:any[]=[];'],
    ['const fcps:any[]=[],acs=[],allCrew=[],spareCrew=[];',
     'const fcps:any[]=[],acs:any[]=[],allCrew:any[]=[],spareCrew:any[]=[];'],
    ['const prevEnd:any={}, prevFlyEnd={};', 'const prevEnd:any={}, prevFlyEnd:any={};'],
    ['const v:any={},s={};', 'const v:any={},s:any={};'],
    ['const fc:any={}, dayStats=[];', 'const fc:any={}, dayStats:any[]=[];'],
    ['const byWave=wins.map(()=>[]), anyWave=[];', 'const byWave=wins.map(()=>[] as any[]), anyWave:any[]=[];'],
    ['const g=signOf(di),o={};', 'const g=signOf(di),o:any={};'],
    ['const wins=waveWindows(d), off=dayOff(d), eng=dayEngaged(d);',
     'const wins:any[]=waveWindows(d), off=dayOff(d), eng=dayEngaged(d);'],
    // literal-keyed lookup tables indexed with any keys
    ['const SEVR={note:1,adv:2,hard:3};', 'const SEVR:any={note:1,adv:2,hard:3};'],
    ['const SORD={hard:0,adv:1,note:2};', 'const SORD:any={hard:0,adv:1,note:2};'],
    // [...new Set(...)] infers unknown[] under strict TS
    ['export function uniqDays(keys:any){', 'export function uniqDays(keys:any):any[]{'],
    /* history.ts: ARM lives in src/state/view.ts — armDrop() is its exported
       put-down, doing exactly what the reference's `ARM=null;` did here (an
       ESM module cannot reassign another module's binding). */
    ['  ARM=null;', '  armDrop();'],
  ];
  for (const [a, b] of targeted) text = text.split(a).join(b);
  return text;
}

const MODS = {
  'time.ts': {
    head: `import { VCONF } from './rules'\n`,
    ranges: [[2121, 2123], [2281, 2281], [2734, 2750], [2716, 2716], [6103, 6105]],
  },
  'rules.ts': {
    head: `import { hhmm, parseHM, lgT } from './time'\nimport { store } from './hooks'\n`,
    ranges: [[2620, 2641], [2717, 2726], [6278, 6294], [6295, 6316], [6317, 6350]],
  },
  'people.ts': {
    head: `import { VCONF } from './rules'\n`,
    ranges: [[1895, 2050], [2110, 2112], [2618, 2618], [2642, 2688], [5844, 5844]],
  },
  'inputs.ts': {
    head: ``,
    ranges: [[2239, 2280], [2282, 2286]],
  },
  'waves.ts': {
    head: ``,
    ranges: [[2051, 2109], [2114, 2115], [2118, 2120], [3243, 3245]],
  },
  'data.ts': {
    head: ``,
    ranges: [[2125, 2236]],
  },
  'keys.ts': {
    head: `import { DAYS } from './data'\nimport { SCHED } from './publish'\n`,
    ranges: [[5618, 5625], [5630, 5630], [5667, 5708]],
  },
  'slots.ts': {
    head: `import { DAYS } from './data'\nimport { PEOPLE, nameToId } from './people'\nimport { SCHED } from './publish'\nimport { parseHM, hhmm } from './time'\n`,
    ranges: [[4485, 4678], [4162, 4171], [5420, 5428]],
  },
  'events.ts': {
    head: `import { DAYS } from './data'\nimport { INPUTS, inputCoversDate } from './inputs'\nimport { PEOPLE, isSpecial, nameToId, aarNeed } from './people'\nimport { toMin, parseHM, win } from './time'\nimport { VCONF } from './rules'\nimport { isStandalone, saExempt } from './waves'\nimport { whoArr } from './slots'\n`,
    ranges: [[2751, 2875], [3204, 3218]],
  },
  'validate.ts': {
    head: `import { PEOPLE, isSpecial, realP, isOcu, isInstr, aarOK, scShiftKind, scQualOK } from './people'\nimport { isDownchit, isLeave, isLocalLeave, isOffer } from './inputs'\nimport { VCONF, SHIFT_HARD } from './rules'\nimport { overlap, hm24, lgT } from './time'\nimport { collectEvents } from './events'\nimport { HOOKS } from './hooks'\n\n/* the reference guards its header counters with $() lookups; the engine takes\n   $ from the hooks (null outside a browser) so the guarded lines stay verbatim */\nconst $=(id:any)=>HOOKS.$(id);\n`,
    ranges: [[2689, 2715], [2876, 2886], [2887, 3194], [6107, 6112]],
  },
  'avail.ts': {
    head: `import { DAYS } from './data'\nimport { INPUTS, inputCoversDate, isOffType, isLocalLeave, offWord } from './inputs'\nimport { PEOPLE, isSpecial, nameToId, aarNeed, aarOK, scShiftKind, scQualOK, isInstr } from './people'\nimport { parseHM, win, overlap, hm24 } from './time'\nimport { SHIFT_HARD } from './rules'\nimport { isStandalone, scSpare } from './waves'\nimport { WARN, restClear, dayEvents } from './validate'\nimport { waveWindows } from './events'\nimport { whoArr } from './slots'\nimport { keyDay } from './keys'\n`,
    ranges: [[3219, 3242], [3246, 3281], [2409, 2423], [2435, 2445], [4218, 4306]],
  },
  'insights.ts': {
    head: `import { DAYS } from './data'\nimport { PEOPLE } from './people'\nimport { validate, WARN } from './validate'\n`,
    ranges: [[4011, 4027]],
  },
  'publish.ts': {
    head: `import { DAYS } from './data'\nimport { PEOPLE } from './people'\nimport { keyDay, uniqDays } from './keys'\nimport { isScheduler } from './people'\nimport { HOOKS } from './hooks'\n\n/* the reference calls straight into the UI here; the engine routes those four\n   calls through injected hooks (no-ops until the app provides them) so the\n   bodies below stay verbatim */\nconst toast=(...a:any[])=>HOOKS.toast(...a);\nconst reflow=()=>HOOKS.reflow();\nconst histPush=()=>HOOKS.histPush();\nconst renderStatus=()=>HOOKS.renderStatus();\n`,
    ranges: [[5606, 5617], [5626, 5629], [5631, 5666], [5709, 5781], [5843, 5843], [5845, 5860], [5899, 5900]],
  },
};

/* ---- phase 3: src/state/ — view state + history, same verbatim discipline ---- */
const STATE_OUT = require('path').join(__dirname, '..', 'src', 'state');
const STATE_MODS = {
  'view.ts': {
    head: `import { DAYS } from '../engine/data'\nimport { PEOPLE } from '../engine/people'\nimport { keyDay } from '../engine/keys'\nimport { slotVal, setSlotVal, fillSlot, armTargetExists } from '../engine/slots'\nimport { slotBar, personCount } from '../engine/avail'\nimport { validate } from '../engine/validate'\nimport { markEdit } from '../engine/publish'\nimport { HOOKS } from '../engine/hooks'\nimport { canEditSched } from './auth'\n\n/* the repaint/gesture call sites inside these verbatim bodies route through\n   the hooks — no-ops headless, mapped to the store's notify() when wired */\nconst toast=(...a:any[])=>HOOKS.toast(...a)\nconst paintArm=()=>HOOKS.paintArm()\nconst renderRosters=()=>HOOKS.renderRosters()\nconst renderScheduler=()=>HOOKS.renderScheduler()\nconst renderEditWeek=()=>HOOKS.renderEditWeek()\nconst renderSchedule=(_t?:any,_e?:any)=>HOOKS.renderSchedule()\nconst isPhone=()=>HOOKS.isPhone()\n\n/* board / page state the reference keeps as globals; the two render gates in\n   afterSchedMutate read them. setBoardDay carries the reference's day-tab\n   rule: changing the board day disarms a slot armed on another day. */\nexport let SBDAY:any=null\nexport let CURPAGE:any='viewsched'\nexport function setBoardDay(n:any){ if(ARM&&ARM.di!==n)disarmSlot(); SBDAY=n }\nexport function setPage(p:any){ CURPAGE=p }\n/* ARM put-down for history.ts (ESM cannot reassign across modules) */\nexport function armDrop(){ ARM=null }\n/* the phase-3 model half of a puck click: toggle the selection and remember\n   the person's count so afterSchedMutate can drop a stale selection. The\n   full click behaviour (highlights, warning boxes) is phase-4 UI. */\nexport function selectPerson(id:any){\n  const off=(SELID===id)\n  if(off){selRestore();return}\n  selKeep(); SELID=id; SELSEEN=personCount(id)\n}\n`,
    ranges: [[2616, 2617], [2386, 2408], [2424, 2434], [4161, 4161], [4172, 4182], [4189, 4200], [4202, 4217], [4710, 4728]],
  },
  'history.ts': {
    head: `import { DAYS } from '../engine/data'\nimport { INPUTS } from '../engine/inputs'\nimport { SCHED } from '../engine/publish'\nimport { HOOKS } from '../engine/hooks'\nimport { armDrop } from './view'\n\nconst toast=(...a:any[])=>HOOKS.toast(...a)\nconst reflow=()=>HOOKS.reflow()\nconst syncHistBtns=()=>HOOKS.syncHistBtns()\n`,
    ranges: [[5931, 5969]],
  },
};
fs.mkdirSync(OUT, { recursive: true });
for (const [file, spec] of Object.entries(MODS)) {
  const body = spec.ranges.map(([a, b]) => grab(a, b)).join('\n');
  fs.writeFileSync(`${OUT}/${file}`, spec.head + transform(body) + '\n');
  console.log(file, spec.ranges.map(([a, b]) => b - a + 1).reduce((x, y) => x + y, 0), 'lines');
}
fs.mkdirSync(STATE_OUT, { recursive: true });
for (const [file, spec] of Object.entries(STATE_MODS)) {
  const body = spec.ranges.map(([a, b]) => grab(a, b)).join('\n');
  fs.writeFileSync(`${STATE_OUT}/${file}`, spec.head + transform(body) + '\n');
  console.log('state/' + file, spec.ranges.map(([a, b]) => b - a + 1).reduce((x, y) => x + y, 0), 'lines');
}
