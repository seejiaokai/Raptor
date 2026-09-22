import { VCONF } from './rules'
import { parseHM } from './time'
import { isStandalone, saExemptKind } from './waves'
import { PEOPLE, realP, whoId, isSpecial } from './people'
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

   THE RULE (one law, every source — the 28 Aug 26 rewrite; the measure
   corrected 29 Aug 26): a person's worked minutes for the day are the
   ENVELOPE of everything they did — FIRST start to LAST end, the gaps
   between events included (owner, 29 Aug 26: "the in between timing, even
   tho there's nothing, they are still in squadron") — then ONE threshold:
   under VCONF.oilFullMin (361 — "6 hours 1 min or more is full", so exactly
   six hours is still a half, re-confirmed by the owner 29 Aug 26 for the
   envelope reading) is HO, at or over it is FO. The first cut summed an
   interval union instead; do not bring the sum back — 7-8am plus 12-1pm is
   a six-hour day at work, not a two-hour one. The old SC shift-window rule
   (AM/PM halves of the SC day window, the midpoint, the night-shift clause)
   stays DELETED — do not resurrect it; the owner removed it by name.

   What pools, exactly:
   - An SC MAIN seat, by its shift's written times (to→ld).
   - Any ORDINARY flying seat, by the working day the sortie costs: report
     (T-O minus VCONF.reportLead) through landing plus VCONF.debrief — the
     owner's pick (28 Aug 26), the same family of definition as the
     Insights work-hours span. Typed in-time lines are deliberately NOT
     consulted here (a stated simplification; the snapshot-pure read keeps
     this file free of the events.ts machinery).
   - A sim row (AMT and OFT), by its written str→end.
   - A duty row, by its written str→end — stretching the same envelope.
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
   NOT earning BY DEFAULT, but reachable and switchable (D24/D35, 22 Sep 26 —
   [OIL-SEATS-CAN-EARN] step 4; they used to be skipped before this walk saw
   them at all, so no switch could be drawn and no decision could exist):
   - An SC SPARE — standing by at home, reachable but not at work.
   - AVALON and BB — the whole wave AND the desk block it brings (`dw.sa`),
     including a block MINTED from an AVALON template (D35).
   Each arrives with `dflt:false`; an item mark of `1`, or an `allow` on one
   man, is what credits it.
   NOT earning, deliberately, and nothing switches these on:
   - A cancelled structure at any level (cx) — a duty that did not stand.
   - A row with no readable times: the owner's rule is "based on what timing
     was written", and inventing openEnd/simLen defaults here would mint
     OIL from a guess (events.ts may guess for display; money may not). */

/* the ENVELOPE of [s,e) spans in minutes — first start to last end, gaps
   included (owner, 29 Aug 26: between two events the person is still in
   squadron, so the day at work runs report to release, not the sum of the
   bookings). The cap-at-one-day is structural: one envelope per day can
   never pay twice for the same hour. */
export function envMin(spans:[number,number][]){
  if(!spans.length)return 0;
  let lo=spans[0][0],hi=spans[0][1];
  for(const [a,b] of spans){ if(a<lo)lo=a; if(b>hi)hi=b; }
  return hi-lo;
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

/* WHAT KIND of work a span was — the word the OIL tracker shows as the
   credit's reason (owner, 2 Sep 26: "be slightly more specific, like SIM,
   FLT, Duty"). FLT = a flying seat, SIM = a sim row, Duty = a duty row, the
   Ground and Common Programme, and an ALL / ALL AVAIL puck on either. */
export type OilWorkSrc='FLT'|'SIM'|'Duty';
/* `item` is the ITEM this span came off — the address a scheduler's OIL
   decision hangs on ([OIL-AUTO-REMOVE] §7.4, engine/oilev.ts). It is keyed by
   what SURVIVES an ordinary member edit: an input-derived row by the INPUT's own
   id, a hand-built row by its `rid`. `via` says which half of the evidence
   produced it — the schedule, or a duty-and-commitments claim. */
/* `dflt` is THE SEAT'S OWN ANSWER before anyone decides anything: does this
   piece of work earn by default? It rides the SPAN and not the item because one
   `item` is stamped per ROW and every occupant takes it — a duty row's named man
   and an ALL AVAIL in its extras share one address, and an SC formation's MAIN
   and SPARE seats share one address. An item-level default would therefore have
   to answer for both at once, which is exactly the finding Codex OSE-01 and
   Fable M3 reached from opposite directions. The span is the only thing that is
   not shared.

   EVERYTHING IS `true` UNTIL THE FOUR EXEMPT KINDS ARRIVE (D28: nothing earns
   less than it does today). The kinds that will carry `false` — an SC SPARE
   seat, an AVALON or BB line, an AVALON desk — are still skipped before this
   walk reaches them; step 4 lifts those skips and they arrive already off. */
export interface OilWork{s:number;e:number;src:OilWorkSrc;item?:string;dflt:boolean;via?:'schedule'|'input'}
/* THE ITEM ADDRESS GRAMMAR, in one place so the walk below, the evidence block
   and the board's OIL mode can never spell it differently. A row with no rid
   yet has NO item address: it cannot be marked individually (the day blanket
   still covers it) rather than taking a positional address a reorder would move
   under it. */
export const inputItemKey=(iid:any)=>`i:${iid}`;
export const rowItemKey=(rid:any)=>rid?`r:${rid}`:'';
/* a ground row's item: the input it came from, else the row itself */
export const groundItemKey=(g:any)=>(g&&g.src)?inputItemKey(g.src):rowItemKey(g&&g.rid);

/* every person's work for one day blob, each span tagged with its kind:
   id -> {s,e,src}[]. The envelope of a person's spans is the day's measure.
   opts.expandAll resolves a sentinel puck (ALL / ALL AVAIL) into the people it
   stands for at that window. It is asked on every seat a placeholder may sit
   on — ground rows, duty desks, sim seats and passengers, the Common Programme,
   and every extras line — but NEVER on a flying line's cockpit, and never for a
   row that has no id yet (see `putAny`). */
export function dayOilWork(day:any,opts?:{expandAll?:(win:[number,number],item:string)=>string[];onItem?:(item:string)=>void}){
  const out:Record<string,OilWork[]>={};
  /* EVERY ROW THIS WALK REACHES WITH REAL TIMES, whether or not anybody is
     sitting on it (21 Sep 26). The mode needs to know which events CAN earn so
     it does not offer a switch on one that never could — an AVALON line, its
     desk, an SC spare, a cancelled or ⓘ row, a desk with no times. Reported
     from THIS walk rather than from a second rulebook, so the switch and the
     money can never disagree about what is capable of earning. */
  const reach=(it:string)=>{ if(opts&&opts.onItem)opts.onItem(it); };
  const rid=(v:any)=>{const id=whoId(v);return realP(id)?id:null;};
  let src:OilWorkSrc='Duty';
  /* the item each span is being collected for — set at the top of every row so
     a span can never be tagged with its neighbour's address */
  let item='';
  /* and the seat's own default, set beside it for the same reason. A placeholder
     expands through `put` like any other body, so the crowd INHERITS the seat's
     answer rather than carrying one of its own — which is D43 in one line. */
  let dflt=true;
  const put=(v:any,win:[number,number]|null)=>{if(!win)return;const id=rid(v);if(id)(out[id]=out[id]||[]).push({s:win[0],e:win[1],src,item,dflt,via:'schedule'});};
  const w2=(st:any,en:any):[number,number]|null=>{
    if(st==null||en==null)return null;
    if(en<st)en+=1440;
    return en>st?[st,en]:null;   // a zero-length row measures nothing and mints nothing
  };
  /* A SEAT A PLACEHOLDER MAY SIT ON ([OIL-SEATS-CAN-EARN] step 5). A who value
     naming ALL or ALL AVAIL (by id or callsign) stands for the people who would
     attend, so it expands into them and each one is credited exactly as a typed
     name is (D43). Anything else goes straight through.

     THIS USED TO BE THE GROUND ROW'S AND THE COMMON PROGRAMME'S PRIMARY SEATS
     ONLY, which is the owner's Sunday desk: he put ALL AVAIL on a duty desk,
     published the day, and nobody earned a thing, because every other seat used
     the bare `put` above and `put` drops anything that is not a person. Duty
     desks, sim seats, sim passengers and every extras line now come through
     here as well. The FLYING branch deliberately does not — see the belt below.

     AN UNIDENTIFIED ROW GATHERS NOBODY. The day's frozen membership is written
     per ITEM (`oilev.ts`: `if (item) sent[item] = people`), so a row with no id
     yet has nowhere to record who it stood for: it would draw a crowd in the
     mode and pay none of them through the evidence, the screen and the money
     disagreeing about the same row. Every painted row is minted an id by the
     mutation, load, publish and draft paths alike, so in practice this never
     fires — it is the belt, and `oilexpand.test.ts` pins it. */
  const putAny=(v:any,win:[number,number]|null)=>{
    if(!win)return;
    const id=whoId(v);
    if(id&&isSpecial(id)){
      if(!item)return;                                   // no address: nowhere to freeze the crowd
      if(opts&&opts.expandAll)opts.expandAll(win,item).forEach((p:any)=>put(p,win));
      return;
    }
    put(v,win);
  };
  /* a seat and the extras line under it, which answer the same way */
  const putWho=(v:any,win:[number,number]|null,more?:any[])=>{
    putAny(v,win);
    (more||[]).forEach((m:any)=>putAny(m,win));
  };
  src='FLT';
  (day.waves||[]).forEach((wv:any)=>{
    /* THE EXEMPT KINDS NOW HAVE A DEFAULT INSTEAD OF AN ABSENCE (D24/D35,
       [OIL-SEATS-CAN-EARN] step 3b). An AVALON or BB wave earns nothing BY
       DEFAULT rather than being unable to earn at all, so the admin can switch
       one on when it really was work. The skip a line below still keeps them out
       of this walk entirely — step 4 removes it, and they then arrive already
       carrying this answer rather than defaulting to yes and paying at once,
       which is F1's silent money. */
    const exemptWave=isStandalone(wv)&&wv.kind!=='sc';
    const sc=isStandalone(wv);
    (wv.formations||[]).forEach((f:any)=>{
      if(f.cx)return;
      item=rowItemKey(f.rid);                            // the LINE is the item a scheduler taps
      const st=parseHM(f.to),en=parseHM(f.ld);
      /* SC shift = its written window; a flying line = report → land+debrief */
      const win=sc?w2(st,en)
                  :(st==null||en==null?null
                    :w2(st-VCONF.reportLead,(en<st?en+1440:en)+VCONF.debrief));
      if(!win)return;
      /* A SPARE LINE IS CAPABLE NOW, so the switch is drawn on it (D24/D32:
         wherever a puck may land the switch must be offered). It used to be
         hidden here, which is why "SC SPARE offers the switch" had nowhere to
         appear. A line with no readable times still reaches nothing — that is
         D31, and it is the `win` test above, not this one. */
      reach(item);
      (f.aircraft||[]).forEach((ac:any)=>{
        if(ac.cx)return;                                 // a cancelled jet is not work, ever
        /* BOTH SPARE FLAGS (Codex OSE-R2-02). The exclusion this replaces read
           `f.spare||ac.spare`, and a saved SC formation can carry the
           FORMATION-level flag with none on the aircraft row. Naming only the
           aircraft one — which the first rewrite did — would default every
           occupant of such a shift ON, and pay a spare shift that has never
           been paid. */
        dflt=!exemptWave&&!f.spare&&!ac.spare;
        /* THE NON-EXPANDING BELT, and it is the bare `put` on purpose (D33/D36,
           Fable M4.5). A placeholder is refused in a cockpit at every door, but
           data can arrive by COPY — a captured day template or a parked plan
           bypasses those doors — so the money keeps its own guard rather than
           trusting the doors alone. And the window here is report→debrief, three
           hours wider each side than availability: handing it to the expander
           would gather the men the squadron deliberately schedules around an ops
           brief (D36, plan §5a) and pay every one of them. */
        [ac.p,ac.w].forEach((v:any)=>put(v,win));
      });
    });
  });
  src='SIM';
  ['amt','oft'].forEach((k:any)=>((day.sims||{})[k]||[]).forEach((r:any)=>{
    if(r.cx)return;
    item=rowItemKey(r.rid); dflt=true;
    const win=w2(parseHM(r.str),parseHM(r.end));
    if(!win)return;
    reach(item);
    /* the same id set events.ts rowIds enumerates: seats, pax, extras — sim who
       is free text (1C), never a person */
    [r.p,r.w].concat(r.pax||[]).concat(r.more||[])
      .forEach((v:any)=>putAny(v,win));
  }));
  src='Duty';
  (day.dutywaves||[]).forEach((dw:any)=>{
    /* the desk an exempt wave brings with it (D35 — and it reaches a block
       MINTED from an AVALON template too, because the mint stamps `sa` and this
       reads `dw.sa`). Same shape as the wave above: a default, not an absence;
       the skip is lifted at step 4. */
    const exemptDuty=!!(dw&&saExemptKind(dw.sa));
    (dw.rows||[]).forEach((r:any)=>{
      if(r.cx)return;
      item=rowItemKey(r.rid); dflt=!exemptDuty;
      const win=w2(parseHM(r.str),parseHM(r.end));
      if(!win)return;
      reach(item);
      [r.id,...(r.more||[])].forEach((v:any)=>putAny(v,win));
    });
  });
  (day.ground||[]).forEach((g:any)=>{
    if(g.cx||g.src)return;                               // src = an accepted input: the ask-flow's
    if(g.info)return;                                    // ⓘ info-only: shown, never worked — mints no OIL
    item=groundItemKey(g); dflt=true;
    { const gw=w2(parseHM(g.str),parseHM(g.end)); if(gw)reach(item); putWho(g.who,gw,g.more); }
  });
  (day.allhands||[]).forEach((x:any)=>{
    if(x.cx)return;
    if(x.info)return;                                    // ⓘ info-only: mints no OIL
    item=rowItemKey(x.rid); dflt=true;
    const win=w2(parseHM(x.str),parseHM(x.end));
    if(!win)return;
    reach(item);
    /* the Common Programme's own extras array joins the rest. Nothing on screen
       drops a puck there — its "extras" append to the `who` list beside it — but
       the engine reads `more` as tasked work everywhere else (events.ts), and a
       day that arrived by copy or import can carry one. Leaving it as the single
       extras line that silently swallowed a placeholder would be a hole with no
       reason behind it. */
    whoArr(x).forEach((v:any)=>putAny(v,win));
    (x.more||[]).forEach((m:any)=>putAny(m,win));
  });
  return out;
}
/* THE DESKS THAT MEASURE NOTHING (owner, 20 Sep 26 — "Yes i want a warning").
 *
 *  The rule above mints strictly from WRITTEN times, so a duty desk with a man
 *  on it and no start and end earns him nothing. That is correct — money must
 *  not come from a guess — but it used to happen in silence: the day was
 *  published, no OIL appeared, and nothing said why. A man's leave balance was
 *  short and no screen admitted it.
 *
 *  This lists the places on a day that NAME somebody and carry no usable times,
 *  by the name the day itself uses for them (the desk's role, the programme's
 *  own name). The caller decides when to speak; Leave War knows which days can
 *  earn at all. Blank-and-nameless is not listed — an empty desk is an empty
 *  desk, not a mistake. */
/* ONE wording for the blind places, so the day's warning strip and the publish
   message can never name them differently: the list, and the verb that agrees
   with it. A day can carry three desks and only one be blank, which is why the
   plural is built rather than assumed.
   The names arrive BARE ("SDO", "the ground programme") because only the caller
   knows the sentence it is building — the publish message wraps a desk name in
   "the ... desk", which read "the The ground programme desk" while the names
   carried their own article (Fable, 21 Sep 26). `desk` says whether every name
   in the list is a duty desk, which is what lets a caller add that wrapper. */
export function blindDesks(names:readonly string[]):{list:string;verb:string;desk:boolean}{
  const many=names.length>1;
  return {
    list: many?`${names.slice(0,-1).join(', ')} and ${names[names.length-1]}`:names.join(''),
    verb: many?'have':'has',
    desk: names.length>0&&names.every(n=>!/^the /.test(n)),
  };
}

export function dayOilBlind(day:any):string[]{
  const out:string[]=[];
  const seen=new Set<string>();
  const add=(name:string)=>{if(!seen.has(name)){seen.add(name);out.push(name);}};
  const timed=(st:any,en:any)=>{
    const s=parseHM(st);let e=parseHM(en);
    if(s==null||e==null)return false;
    if(e<s)e+=1440;
    return e>s;
  };
  const named=(vs:any[])=>vs.some((v:any)=>{const id=whoId(v);return !!id&&(realP(id)||isSpecial(id));});
  /* A FLYING LINE WITH CREW ON IT AND NO READABLE TIMES ([OIL-SEATS-CAN-EARN]
     step 8, as D49 left it). The duty desks below have been named here since
     20 Sep 26, when the owner asked for the warning on the day itself; a flying
     line was never added and it fails in exactly the same way — the day
     publishes, no OIL appears, and no screen admits why.
     A line whose take-off and landing are the SAME is deliberately NOT named
     here. It still earns (D49 — the man reported and debriefed), so "nobody on
     it earns OIL" would be false about it; the day says what is wrong with
     THOSE times separately, as an advisory on the line. */
  const readable=(st:any,en:any)=>parseHM(st)!=null&&parseHM(en)!=null;
  (day.waves||[]).forEach((wv:any)=>{
    (wv.formations||[]).forEach((f:any)=>{
      if(f.cx)return;
      if(readable(f.to,f.ld))return;
      const crew:any[]=[];
      (f.aircraft||[]).forEach((ac:any)=>{if(!ac.cx){crew.push(ac.p);crew.push(ac.w);}});
      if(!named(crew))return;
      add(String(f.cs||wv.label||'a flying line'));
    });
  });
  (day.dutywaves||[]).forEach((dw:any)=>{
    /* THE FOURTH SKIP, LIFTED (plan C4 / Fable S2 — the plan counted three).
       This is the one that makes an exempt desk SPEAK at publish. While AVALON
       and BB could not earn at all, a desk of theirs carrying a man and no
       written times was correctly silent: there was no money to miss. Now that
       the admin can switch such a desk ON, a blank pair of times is the same
       trap it is anywhere else — the day publishes, no OIL appears, and nothing
       says why. Screen, not money: this names the desk, it does not pay it. */
    (dw.rows||[]).forEach((r:any)=>{
      if(r.cx)return;
      if(timed(r.str,r.end))return;
      if(!named([r.id,...(r.more||[])]))return;
      add(String(r.role||dw.label||'a duty desk'));
    });
  });
  (day.ground||[]).forEach((g:any)=>{
    if(g.cx||g.src||g.info)return;
    if(timed(g.str,g.end))return;
    if(!named([g.who,...(g.more||[])]))return;
    add('the ground programme');
  });
  ['amt','oft'].forEach((k:any)=>((day.sims||{})[k]||[]).forEach((r:any)=>{
    if(r.cx)return;
    if(timed(r.str,r.end))return;
    if(!named([r.p,r.w,...(r.pax||[]),...(r.more||[])]))return;
    add(k==='amt'?'the AMT sim':'the OFT sim');
  }));
  (day.allhands||[]).forEach((x:any)=>{
    if(x.cx||x.info)return;
    if(timed(x.str,x.end))return;
    if(!named([...whoArr(x),...(x.more||[])]))return;
    add('the common programme');
  });
  return out;
}

/* the same work as bare [s,e] spans: id -> [s,e][] — the shape envMin takes
   and the probe bridge exposes. */
export function dayOilSpans(day:any,opts?:{expandAll?:(win:[number,number],item:string)=>string[]}){
  const work=dayOilWork(day,opts);
  const out:Record<string,[number,number][]>={};
  Object.keys(work).forEach((id:any)=>{out[id]=work[id].map((w:OilWork)=>[w.s,w.e] as [number,number]);});
  return out;
}
/* the distinct kinds in first-seen order, joined for a reason line:
   "FLT", "FLT + SIM". */
export function oilWorkWhy(work:OilWork[]){
  const seen:OilWorkSrc[]=[];
  work.forEach((w:OilWork)=>{if(seen.indexOf(w.src)<0)seen.push(w.src);});
  return seen.join(' + ');
}
/* every person's OIL credit for one day blob: id -> 0.5 | 1 */
export function dayOilCredits(day:any,opts?:{expandAll?:(win:[number,number],item:string)=>string[]}){
  const out:any={};
  const spans=dayOilSpans(day,opts);
  Object.keys(spans).forEach((id:any)=>{
    const v=uniformOil(envMin(spans[id]));
    if(v)out[id]=v;
  });
  return out;
}

/** WHICH EVENTS ON THIS DAY ARE CAPABLE OF EARNING AT ALL — the set of item
 *  addresses the OIL walk actually reaches. An empty ground row IS capable (put
 *  a man on it and he earns); an AVALON line, its desk, an SC spare, a cancelled
 *  row, an ⓘ row and a desk with no written times are NOT, whoever is added
 *  later. The mode uses this so it never draws a switch that could not change
 *  anything: such a switch reads "tap to stop this item earning" beside pucks
 *  that already say they earn nothing, and on a published day tapping it would
 *  cost a real amendment for a decision that moves no money (Fable, 21 Sep 26).
 *  Derived from dayOilWork's own walk, so it cannot drift from the money. */
export function oilCapableItems(day:any):Set<string>{
  const out=new Set<string>();
  dayOilWork(day,{expandAll:()=>[],onItem:(it:string)=>{if(it)out.add(it);}});
  return out;
}
