/* The toast — verbatim; wired into the engine's HOOKS.toast at app boot */
import { VIEW_RESET } from '../state/view'
import { phoneLayout } from './floatwin'
const $=(id:any)=>document.getElementById(id)
export let toastT:any=null;
/* ONE PRESS, ONE MESSAGE ([AMEND-SMALL-SEEN] 1, 28 Sep 26 — the amendment re-test's walker W1: Saturday's "Published AL1 ·
   14 items" was replaced in the same instant by the OIL check's warning, so the person only ever saw the warning). While
   a batch is open every toast is COLLECTED instead of shown; when it closes they are said as one line — in order, a
   repeat said once, in the strongest colour any of them asked for (hard > warn > plain). A throw inside drops them (the
   command rolled back; nothing it said is true). Only the publish command opens one (state/sched-commit.ts
   commitPublish, through HOOKS.toastBatch) — scoped, never a global "same breath" join: other code says a failure after
   a success on purpose (Astra 03). A batch opened inside a batch is the outer one's. */
/* TWO NOTES ABOUT ONE DAY NAME IT ONCE (owner D837, 14 Oct 26 — the passing note N1; the words of record:
   docs/superpowers/briefs/2026-10-13-wording-recheck.md, "For the builder"). Publishing Monday said "Monday published —
   APPROVED · Monday 13 Jul: the common programme has no usable times, so nobody on it earns OIL": the day twice, and two
   sentences held apart by a dot. A note may now say, beside its words, which day it names at its head and what it says
   of that day (`part` — the third argument of toast). Where two such notes about the SAME day follow one another in a
   batch, they are said as one: the day once, at the head, in the fuller of the two names (the one with its date), and
   each note's own words as a sentence — the join adds the capital and the full stops, so each note shown alone still
   has none (the writing guide's §1b test 4). `after` is whatever else the second note carried, joined as it always was.
   NOTHING ELSE IS JOINED DIFFERENTLY: a note with no `part` — an amendment's receipt ("Published AL2 · 3 items…"), the
   OIL line's other form, the two lines that ride behind it — keeps its own words and the dot, and so does a `part`
   whose neighbour names another day or none. Only engine/publish.ts setDayApproved and leavewar/sync.ts
   publishFlagsBids pass one. */
export type ToastPart={day:number|string,head:string,body:string,after?:string};
let BATCH:Array<{msg:string,kind:any,part?:ToastPart}>|null=null;
/** how many notes the batch that is open has been handed so far — 0 where none is open. The input's window asks it
 *  (ui/inputedit.tsx `saidSaved`): a save that said something of its own keeps "Input added" beside it, in the one note. */
export function toastHeld():number{ return BATCH?BATCH.filter(m=>m.msg).length:0 }
const RANK=(k:any)=>k==='hard'?3:k==='warn'?2:1;
const sentence=(s:string)=>s.charAt(0).toUpperCase()+s.slice(1)+'.';
export function toastBatch<T>(fn:()=>T):T{
  if(BATCH)return fn();
  BATCH=[];
  let out:T, ok=false;
  try{ out=fn(); ok=true; }
  finally{
    const got=BATCH; BATCH=null;
    if(ok&&got.length){
      const said:string[]=[]; let kind:any=undefined;
      /* `last` — the part of the note said last, while that note still stands whole at the end of `said` */
      let last:ToastPart|null=null;
      for(const m of got){
        if(RANK(m.kind)>RANK(kind))kind=m.kind;
        if(!m.msg||said.includes(m.msg))continue;
        const a=last, b=m.part;
        if(a&&b&&a.day===b.day&&b.head.startsWith(a.head)){
          said[said.length-1]=`${b.head} ${a.body}. ${sentence(b.body)}${b.after?' · '+b.after:''}`;
          last=null; continue;
        }
        said.push(m.msg); last=b||null;
      }
      if(said.length)toast(said.join(' · '),kind);
    }
  }
  return out!;
}
/* WHERE IT STANDS (owner D731 (1), 10 Oct 26 — "on a phone, while a window is open, the passing note is shown at the TOP
   of the screen, not over the window's buttons at its foot"; walker B of the input card's check: "OIL answer saved" lay
   between "Take me out" and "Close" for as long as it showed). On a phone a window of the shell (ui/FloatWindow.tsx —
   a day opened on a calendar, an input, a calendar's settings, "Calendar") is a panel standing on the foot of the
   screen with its buttons at its own foot — exactly where the note is drawn. So while one is up, on a phone, the note
   is drawn at the top; a desktop, and a phone with no window up, keep it at the foot as before. Asked again when a
   window opens (FloatWindow.tsx), so a note already showing moves clear of the buttons that have just arrived under
   it; NOT when one closes — a note is not moved about while it is being read for no reason.
   "A window" is the shell's: the Leave War's sheets and the schedule's dialogs are other chassis, not pictured to him
   for this choice, and keep the note where it was (told to him as a reading). */
/* …AND HOW WIDE IT IS ON A PHONE (owner D828, 13 Oct 26 — "on a phone a passing note takes the screen's full width less
   a small margin — never half the screen; the desktop's note stays as it is"). The note is centred by `left:50%` and a
   shift back of half its own width; a box placed that way has only the screen's right half to be wide in, so on a phone
   it was never more than 195 of 390 across and his two notes ran five lines deep. Nobody chose that width. On a phone
   the note is now held 12px from each side and not shifted, its words centred in it as the picture put to him drew
   them (docs/mock/2026-10-13-design-look/note-phone-*-wide.png); a desktop keeps `left:50%` and the shift, exactly as
   before. Set HERE and not where the note is made, because the one element is made once and reused: a window narrowed
   or a phone turned between two notes must be answered by the next note. "A phone" is the shell's own answer
   (ui/floatwin.ts phoneLayout — the stylesheet's ≤620px), the same one `up` below asks. The rise-in in toast() reads
   `data-wide` to keep its movement in step with this place. */
export function placeToast(){
  const t=$('toastEl'); if(!t)return;
  const phone=phoneLayout();
  if(phone)t.dataset.wide='1'; else delete t.dataset.wide;
  t.style.left=phone?'12px':'50%';
  t.style.right=phone?'12px':'';
  t.style.transform=phone?'none':'translateX(-50%)';
  t.style.textAlign=phone?'center':'';
  /* the changes window is a window too, a panel at the foot on a phone — a note at the foot sat over its first lines
     ([BUBBLE-SMALL-SEEN] (3), the change-recording re-walk, 29 Sep 26); its placeholder is always mounted, hidden. And
     the ALL AVAIL window, its twin at the foot (D997): "ALL AVAIL planned" stood over its last lines (the look-and-keys
     walk, 21 Oct 26) — its placeholder is mounted hidden too */
  const up=phone&&!!document.querySelector('.floatwin, .chgwin:not([hidden]), .availwin:not([hidden])');
  /* …AND NEVER ON THE BAR THAT STAYS ([OIL-ASK-NOTIFY] — the check's walk, 13 Oct 26: "Not swapped — OIL not answered ·
     Answer OIL · OK" stands at the foot until it is tapped (D783 (2)), exactly where a note is drawn, and the note is the
     layer above — so every note raised while it was up, and one still showing when it arrived, covered its words and half
     its "Answer OIL" button). While that bar is up the note sits just above it; ui/OilWaitSheet.tsx calls this when the
     bar arrives. The "Set as default" offer goes by itself after seven seconds and is left as it was. */
  t.dataset.at=up?'top':'foot';
  t.style.top=up?'calc(env(safe-area-inset-top, 0px) + 10px)':'';
  t.style.bottom=up?'auto':'26px';
}
/* A NOTE IS TOLD TO A SCREEN READER TOO ([BATCH-14OCT-LEFTOVERS] (f), 21 Oct 26 — found by the leftovers' own walk,
   14 Oct 26): the note's box was a plain box, so where a note was shown a screen reader heard nothing. Every note's words
   now go to ONE polite region (`#srSay`, hidden from the eye, `aria-atomic` so a long published-day note is read whole,
   never only its changed end) — the same region that tells a reader what the just-added mark shows where no note is
   raised (ui/seen.ts). One region, so a note and the mark's words can never be read twice over: each save either raises
   its note or tells its words, never both (seen.ts noteUnlessSeen). The box the eye reads is hidden from a reader, who
   has the region's copy. The region is emptied first and filled a beat later, so the same words said twice running are
   read twice; a region made and filled in the same breath is often not read the first time, so it is made when first
   asked and filled a beat after. */
let sayT:ReturnType<typeof setTimeout>|null=null;
/** the reader's region, made once (ui/seen.ts makes it the moment a save asks, a beat before anything is put in it) */
export function readerRegion():HTMLElement{
  let el=$('srSay');
  if(!el){
    el=document.createElement('div'); el.id='srSay';
    el.setAttribute('role','status'); el.setAttribute('aria-live','polite'); el.setAttribute('aria-atomic','true');
    el.style.cssText='position:fixed;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0';
    document.body.appendChild(el);
  }
  return el;
}
/** tell a screen reader these words, politely, whole */
export function sayToReader(words:string):void{
  if(typeof document==='undefined')return;
  const el=readerRegion();
  el.textContent='';
  if(sayT)clearTimeout(sayT);
  sayT=setTimeout(()=>{ sayT=null; el.textContent=words },30);
}
/* kind==='warn' tints the toast amber — used when something was allowed but is
   not right, e.g. dropping crew who are not current for the shift. */
/* how many notes have been SHOWN — a note that is waiting to be said asks it, so as not to replace one raised since
   (ui/seen.ts; the fresh read of the leftovers batch, 14 Oct 26 — F3) */
let SHOWN=0;
export function toastCount():number{ return SHOWN }
export function toast(msg:any,kind:any,part?:ToastPart){
  if(BATCH){ BATCH.push({msg:String(msg==null?'':msg).trim(),kind,part}); return; }
  SHOWN++;
  let t=$('toastEl'); if(!t){t=document.createElement('div');t.id='toastEl';
    /* above the scheduler board (400) and the drag ghost (520) — a toast raised
   from inside the board used to render behind it */
    /* pointer-events:none — a toast is never clicked, and it is only FADED, never
       removed, so at opacity 0 it went on swallowing every drop that landed on the
       bottom-centre of the screen: applyDrop got the toast, matched nothing, and
       returned silently. The dead rectangle even changed size with the last message,
       which is what made it feel random. */
    /* transition:opacity — part of the 25 Aug 26 motion set: the show fades
       in and the timeout's opacity='0' fades out instead of snapping. The
       blanket reduced-motion rule in scheduler.css kills it (its !important
       beats an inline style), so no JS gate is needed for this half. */
    t.style.cssText='position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:540;pointer-events:none;background:var(--panel-2);border:1px solid var(--edge-2);color:var(--ink);padding:10px 16px;border-radius:10px;font-size:12.5px;box-shadow:0 20px 50px -20px rgba(0,0,0,.8);transition:opacity .22s ease';
    /* the reader hears the region's copy (sayToReader, above), never this box as well */
    t.setAttribute('aria-hidden','true');document.body.appendChild(t);}
  t.textContent=msg; t.style.opacity='1';
  sayToReader(String(msg==null?'':msg));
  placeToast();
  /* 'hard' (5 Sep 26) — the drop delta's colour for a breach the validator
     raised at hard severity: same red as the puck's own ring, same hold as
     a warn toast. Anything else keeps the plain face. */
  const tint=kind==='hard'?'var(--hard)':kind==='warn'?'var(--adv)':null;
  t.style.borderColor=tint||'var(--edge-2)';
  t.style.color=tint||'var(--ink)';
  /* the pop — a WAAPI rise, because the element's position is inline style,
     not a class a keyframe could target cleanly. Same guard idiom as
     InputsCal's month slide: no animate() in jsdom, and reduced-motion
     opts out (WAAPI is the one motion the CSS blanket cannot reach). The
     keyframes carry the base translateX(-50%) — dropping it would walk the
     toast off-centre for the length of the animation. On a phone the note is
     not shifted at all (D828 — placeToast), so there the keyframes carry no
     translateX: with it the full-width note would slide in from half a screen
     to the left. */
  try{
    if(typeof (t as any).animate==='function'&&!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)){
      const shift=t.dataset.wide?'':'translateX(-50%) ';
      (t as any).animate(
        /* it rises into its place at the foot, and drops into it at the top */
        [{transform:`${shift}translateY(${t.dataset.at==='top'?-8:8}px)`},{transform:shift?'translateX(-50%)':'none'}],
        {duration:200,easing:'cubic-bezier(.22,.61,.36,1)'})
    }
  }catch(_){/* motion is decoration — a throw here must never eat the toast */}
  /* HOW LONG IT HOLDS — long enough to READ (owner, 21 Sep 26: "the inputs
     bubble warning timing is a bit too short as well to read it. Maybe
     increase the timing a bit if conflicts are recognised").
     It was a flat 2.6s plain / 4.2s tinted, which is fine for "Saved" and far
     too quick for the clash notes, which are whole sentences and sometimes
     several of them joined end to end — the longer the message, the more it
     mattered and the less time there was. So the hold now GROWS with the
     message: the flat time as a floor, then reading time on top, capped so a
     runaway message cannot park a toast on screen for ever. */
  const hold=Math.min(12000,Math.max(tint?4200:2600,String(msg).length*60+1200));
  if(toastT)clearTimeout(toastT); toastT=setTimeout(()=>t.style.opacity='0',hold);
}
/* A SIGN-IN OR SIGN-OUT TAKES THE TOAST DOWN ([ACCOUNTS], 26 Sep 26 — found by the walk):
   a message raised by one person ("viper@mail can sign in now") held for its full
   reading time and was still on screen when the next person signed in on the same
   browser. Every other transient already ends at the session reset (VIEW_RESET
   'session', ui/pops.ts); the toast joins them. */
export function clearToast(){ if(toastT){clearTimeout(toastT);toastT=null} if(sayT){clearTimeout(sayT);sayT=null} if(typeof document==='undefined')return; const t=$('toastEl'); if(t)t.style.opacity='0'; const r=$('srSay'); if(r)r.textContent='' }   // no DOM in the node tests that sign in and out; the reader's copy goes with the note, so the next person to sign in never finds the last one's words
VIEW_RESET.push({ name: 'TOAST', scopes: ['session'], reset: clearToast })
