import { VCONF } from './rules'
import { parseHM } from './time'
import { isStandalone } from './waves'
import { PEOPLE, realP, nameToId, isSpecial } from './people'
import { whoArr } from './slots'
/* =====================================================================
   WEEKEND / PUBLIC-HOLIDAY WORK EARNS OIL — Leave War sync wire 4
   (owner, 16-17 Aug 26, REWRITTEN 28 Aug 26: "It will just use the same
   rule as all I mentioned … they see if the person works 6 hours or less,
   it's auto HO credited. If it's more than 6 hours, it's FO. Regardless of
   time or shift in that day.")

   This module answers ONE question: given a day's content, how much OIL
   does each person's work on it earn — 0.5 (Leave War's HO) or 1 (FO).
   It does not know what a weekend or a public holiday is; whether the day
   is non-working at all is Leave War's answer (DayInfo.ph and the 'off'
   event tags live there), asked by src/leavewar/sync.ts, which is also
   where the credit is posted. Keeping this half DOM-free and Leave-War-free
   means the rule is testable against a bare day blob — including a frozen
   snapshot, which is what the sync wire actually feeds it: an ISSUED day is
   the squadron's word that the work stood.

   THE RULE (one law, every source — the 28 Aug 26 rewrite): pool each
   person's worked minutes for the day as an interval UNION (overlapping
   rows count once — a man on a flying seat and its ground brief has not
   worked the hour twice), then apply ONE threshold: under VCONF.oilFullMin
   (361 — "6 hours 1 min or more is full", so exactly six hours is still a
   half) is HO, at or over it is FO. The old SC shift-window rule (AM/PM
   halves of the SC day window, the midpoint, the night-shift clause) is
   DELETED — do not resurrect it; the owner removed it by name.

   What pools, exactly:
   - An SC MAIN seat, by its shift's written times (to→ld).
   - Any ORDINARY flying seat, by the working day the sortie costs: report
     (T-O minus VCONF.reportLead) through landing plus VCONF.debrief — the
     owner's pick (28 Aug 26), the same family of definition as the
     Insights work-hours span. Typed in-time lines are deliberately NOT
     consulted here (a stated simplification; the snapshot-pure read keeps
     this file free of the events.ts machinery).
   - A sim row (AMT and OFT), by its written str→end.
   - A duty row, by its written str→end — summed with everything else.
   - A ground-programme row, by its written str→end — EXCEPT a row carrying
     `src` (an accepted personal input): those are the ask-flow's to credit
     (row.oil on the input), never auto — a Saturday dental appointment must
     not mint OIL uninvited.
   - A Common Programme row (day.allhands), by its written str→end. A `who`
     entry that is a sentinel puck (ALL / ALL AVAIL) expands — via the
     injected opts.expandAll, so this file stays Leave-War-free — to
     everyone available for that window (aircrew minus SANS, the owner's
     28 Aug 26 pick, resolved by the caller). Without a resolver the
     sentinel simply drops, as it always did.
   NOT earning, deliberately:
   - An SC SPARE — standing by at home, reachable but not at work.
   - AVALON and BB — the whole wave AND the desk block it brings (`dw.sa`).
   - A cancelled structure at any level (cx) — a duty that did not stand.
   - A row with no readable times: the owner's rule is "based on what timing
     was written", and inventing openEnd/simLen defaults here would mint
     OIL from a guess (events.ts may guess for display; money may not). */

/* union of [s,e) spans in minutes — sort, sweep, sum. The cap-at-one-day
   falls out of this structurally: a day pooled as one union can never pay
   twice for the same hour. */
export function mergeMin(spans:[number,number][]){
  if(!spans.length)return 0;
  const s=spans.slice().sort((a,b)=>a[0]-b[0]);
  let tot=0,cs=s[0][0],ce=s[0][1];
  for(let i=1;i<s.length;i++){const [a,b]=s[i];
    if(a>ce){tot+=ce-cs;cs=a;ce=b;} else if(b>ce)ce=b;}
  return tot+(ce-cs);
}
/* the one threshold: 0 for no measured work, HO under the line, FO at it */
export function uniformOil(min:number){
  return min<=0?0:(min>=VCONF.oilFullMin?1:0.5);
}
/* an INPUT's own standing under the same law (the ask-flow's suggestion):
   all-day is a full day (owner, 28 Aug 26 — "ask as FO"), a timed record by
   its length, unreadable times ask nothing. */
export function inputOilAmt(allday:any,s:any,e:any){
  if(allday)return 1;
  if(s==null||e==null)return null;
  let en=e; if(en<s)en+=1440;
  const d=en-s;
  return d<=0?null:(d>=VCONF.oilFullMin?1:0.5);
}

/* every person's pooled work spans for one day blob: id -> [s,e][].
   opts.expandAll resolves a sentinel puck (ALL / ALL AVAIL) on a ground or
   Common Programme row into the people it stands for at that window. */
export function dayOilSpans(day:any,opts?:{expandAll?:(win:[number,number])=>string[]}){
  const out:Record<string,[number,number][]>={};
  const rid=(v:any)=>{const id=PEOPLE[v]?v:nameToId(v);return realP(id)?id:null;};
  const put=(v:any,win:[number,number]|null)=>{if(!win)return;const id=rid(v);if(id)(out[id]=out[id]||[]).push(win);};
  const w2=(st:any,en:any):[number,number]|null=>{
    if(st==null||en==null)return null;
    if(en<st)en+=1440;
    return en>st?[st,en]:null;   // a zero-length row measures nothing and mints nothing
  };
  /* a who value that names a sentinel (by id or callsign) expands or drops */
  const putWho=(v:any,win:[number,number]|null,more?:any[])=>{
    if(win){
      const id=PEOPLE[v]?v:nameToId(v);
      if(id&&isSpecial(id)){ if(opts&&opts.expandAll)opts.expandAll(win).forEach((p:any)=>put(p,win)); }
      else put(v,win);
    }
    (more||[]).forEach((m:any)=>put(m,win));
  };
  (day.waves||[]).forEach((wv:any)=>{
    if(isStandalone(wv)&&wv.kind!=='sc')return;          // AVALON / BB seats never earn
    const sc=isStandalone(wv);
    (wv.formations||[]).forEach((f:any)=>{
      if(f.cx)return;
      const st=parseHM(f.to),en=parseHM(f.ld);
      /* SC shift = its written window; a flying line = report → land+debrief */
      const win=sc?w2(st,en)
                  :(st==null||en==null?null
                    :w2(st-VCONF.reportLead,(en<st?en+1440:en)+VCONF.debrief));
      if(!win)return;
      (f.aircraft||[]).forEach((ac:any)=>{
        if(ac.cx||f.spare||ac.spare)return;              // spares stand by, they do not work
        [ac.p,ac.w].forEach((v:any)=>put(v,win));
      });
    });
  });
  ['amt','oft'].forEach((k:any)=>((day.sims||{})[k]||[]).forEach((r:any)=>{
    if(r.cx)return;
    const win=w2(parseHM(r.str),parseHM(r.end));
    if(!win)return;
    /* the same id set events.ts rowIds enumerates: seats, who, pax, extras */
    [r.p,r.w,r.who?nameToId(r.who):null].concat(r.pax||[]).concat(r.more||[])
      .forEach((v:any)=>put(v,win));
  }));
  (day.dutywaves||[]).forEach((dw:any)=>{
    if(dw&&(dw.sa==='avalon'||dw.sa==='bb'))return;      // the excluded waves' own desks
    (dw.rows||[]).forEach((r:any)=>{
      if(r.cx)return;
      const win=w2(parseHM(r.str),parseHM(r.end));
      if(!win)return;
      [r.id,...(r.more||[])].forEach((v:any)=>put(v,win));
    });
  });
  (day.ground||[]).forEach((g:any)=>{
    if(g.cx||g.src)return;                               // src = an accepted input: the ask-flow's
    putWho(g.who,w2(parseHM(g.str),parseHM(g.end)),g.more);
  });
  (day.allhands||[]).forEach((x:any)=>{
    if(x.cx)return;
    const win=w2(parseHM(x.str),parseHM(x.end));
    if(!win)return;
    whoArr(x).forEach((v:any)=>putWho(v,win));
    (x.more||[]).forEach((m:any)=>put(m,win));
  });
  return out;
}
/* every person's OIL credit for one day blob: id -> 0.5 | 1 */
export function dayOilCredits(day:any,opts?:{expandAll?:(win:[number,number])=>string[]}){
  const out:any={};
  const spans=dayOilSpans(day,opts);
  Object.keys(spans).forEach((id:any)=>{
    const v=uniformOil(mergeMin(spans[id]));
    if(v)out[id]=v;
  });
  return out;
}
