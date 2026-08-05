/* The probe bridge — the reference is a single script, so its Playwright
   probes call app globals straight off window (openScheduler(0),
   slotVal('d:0.0.0'), DAYS[2]…). The port's modules are ESM, so nothing
   lands on window by itself. This shim republishes the same names the
   probes use, backed by the real modules, so the reference probe sweep can
   drive the React build unchanged. It changes no behaviour — it only makes
   the existing API reachable — and it weighs a few hundred bytes. */
import { DAYS } from './engine/data'
import { PEOPLE, isScheduler, isLead, isInstr, isOcu, sanStatus, nameToId, aarNeed, aarOK, scShiftKind } from './engine/people'
import { INPUTS, INPUT_TYPES, DATES, isLeave, isLocalLeave, isDownchit, isOffType, isPersonal, isUnavail, isFly, isAway, inputFlags, inputCoversDate, inpLabel, isOther, dateOrd } from './engine/inputs'
import { VCONF, SHIFT_HARD, RULE_STD, RULE_SPEC, ruleParse, rulesOffCount, rulesReset, rulesLoad, rulesSave, ruleFmt, ruleOff, kindOff, KIND_LABEL } from './engine/rules'
import { SCHED, SIGN_ROLES, markEdit, publishALDay, setDayApproved, signOf, dayApproved, alColor, alCount, alDays, signMissing, unpublishAL, pendDays, pendCount, approvedDays, daysLabel, daySnapOf, dayVersions, verLabel, dayCurVer } from './engine/publish'
import { restoreDayVersion, dayKeys } from './engine/restore'
import * as V from './engine/validate'
import { validate, WCODE, wlbl, chipOf, sevOf, CHIP_LABEL, RANK, restClear, dayEvents } from './engine/validate'
import { collectEvents } from './engine/events'
import { slotVal, setSlotVal, fillSlot, txtGet, txtSet, rowCrew, acRef, rollCx, whoArr, rowRef, acceptInput, unacceptInput, inpKey, acceptedDay, renameCallsign } from './engine/slots'
import { slotBar, dayEngaged, slotRules, dayOff } from './engine/avail'
import { isStandalone, makeStandalone, SAWAVE, dayCount, saExempt } from './engine/waves'
import { keyDay, shiftKeys, shiftAircraft, shiftFormation, shiftWave, uniqDays } from './engine/keys'
import { hhmm, parseHM, minus, overlap, hm24 } from './engine/time'
import { HIST, histApply, histSnap, histPush } from './state/history'
import { HOOKS } from './engine/hooks'
import * as view from './state/view'
import { setLgEdit } from './state/auth'
import { notify, undo, redo } from './state/store'

export function installProbeBridge() {
  const w = window as any
  /* the engine singletons the probes read */
  w.DAYS = DAYS; w.PEOPLE = PEOPLE; w.INPUTS = INPUTS; w.VCONF = VCONF
  w.SCHED = SCHED
  /* WARN/REST/EVD are REASSIGNED by every validate() — getters, or a probe
     reads the pre-validate snapshot */
  Object.defineProperty(w, 'WARN', { get: () => V.WARN, configurable: true })
  Object.defineProperty(w, 'REST', { get: () => V.REST, configurable: true })
  Object.defineProperty(w, 'EVD', { get: () => V.EVD, configurable: true })
  /* live lets, published as getters so a probe always reads the current value */
  Object.defineProperty(w, 'ARM', { get: () => view.ARM, configurable: true })
  Object.defineProperty(w, 'SBDAY', { get: () => view.SBDAY, configurable: true })
  Object.defineProperty(w, 'CURPAGE', { get: () => view.CURPAGE, configurable: true })
  /* the mutation funnel + validation */
  w.slotVal = slotVal; w.setSlotVal = setSlotVal; w.fillSlot = fillSlot
  w.txtGet = txtGet; w.txtSet = txtSet
  w.validate = validate; w.collectEvents = collectEvents; w.slotBar = slotBar
  w.markEdit = markEdit; w.publishALDay = publishALDay; w.setDayApproved = setDayApproved; w.signOf = signOf
  w.afterSchedMutate = () => { view.afterSchedMutate(); notify() }
  /* selection / arm */
  w.armSlot = (k: any, el: any) => { view.armSlot(k, el); notify() }
  w.disarmSlot = () => { view.disarmSlot(); notify() }
  w.selectPerson = (id: any, inWeek?: any) => { view.selectPerson(id, inWeek); notify() }
  w.undo = undo; w.redo = redo
  w.toast = (...a: any[]) => HOOKS.toast(...a)
  /* the renderers all collapse to the store's notify in React */
  w.renderSchedule = () => notify()
  w.renderEditWeek = () => notify()
  w.renderScheduler = () => notify()
  w.refreshHighlights = () => notify()
  /* page navigation: click the same nav link a user would */
  w.go = (p: string) => {
    const a = document.querySelector(`.nav a[data-page="${p}"]`) as HTMLElement | null
    if (a) a.click(); else { const d = document.querySelector(`#drawerNav a[data-page="${p}"]`) as HTMLElement | null; d && d.click() }
  }
  /* the board — loaded lazily to keep module order simple */
  /* the id-getter every probe leans on, and the wider engine surface */
  w.$ = (id: string) => document.getElementById(id)
  w.editMode = () => HOOKS.editMode()
  w.INPUT_TYPES = INPUT_TYPES; w.SHIFT_HARD = SHIFT_HARD; w.RULE_STD = RULE_STD; w.RULE_SPEC = RULE_SPEC
  w.ruleParse = ruleParse; w.rulesOffCount = rulesOffCount
  w.HIST = HIST; w.SAWAVE = SAWAVE
  w.overlap = overlap; w.rowCrew = rowCrew; w.acRef = acRef; w.rollCx = rollCx
  w.isStandalone = isStandalone; w.makeStandalone = makeStandalone; w.dayCount = dayCount
  w.keyDay = keyDay; w.shiftKeys = shiftKeys; w.shiftAircraft = shiftAircraft
  w.shiftFormation = shiftFormation; w.shiftWave = shiftWave; w.uniqDays = uniqDays
  w.hhmm = hhmm; w.parseHM = parseHM; w.minus = minus
  w.dayApproved = dayApproved; w.alColor = alColor; w.signMissing = signMissing; w.unpublishAL = unpublishAL
  w.isScheduler = isScheduler; w.isLead = isLead; w.isInstr = isInstr; w.isOcu = isOcu
  w.sanStatus = sanStatus; w.nameToId = nameToId
  w.aarNeed = aarNeed; w.aarOK = aarOK; w.WCODE = WCODE; w.wlbl = wlbl
  /* the reference's `sa` probe reads RANK by regexing the page source — the
     whole app is one inline script there, so its consts are literally in the
     HTML. ESM has no source to scrape, so publish the object itself. */
  w.RANK = RANK
  w.chipOf = chipOf; w.sevOf = sevOf; w.isLeave = isLeave; w.SIGN_ROLES = SIGN_ROLES
  w.CHIP_LABEL = CHIP_LABEL; w.restClear = restClear; w.dayEvents = dayEvents
  w.isLocalLeave = isLocalLeave; w.slotRules = slotRules; w.saExempt = saExempt
  w.isDownchit = isDownchit; w.isOffType = isOffType; w.dayOff = dayOff; w.rulesReset = rulesReset
  w.isFly = isFly; w.isAway = isAway; w.inputFlags = inputFlags
  w.inputCoversDate = inputCoversDate; w.inpLabel = inpLabel; w.isOther = isOther; w.dateOrd = dateOrd
  w.isPersonal = isPersonal; w.isUnavail = isUnavail
  w.acceptInput = acceptInput; w.unacceptInput = unacceptInput; w.inpKey = inpKey
  w.acceptedDay = acceptedDay; w.renameCallsign = renameCallsign
  w.rulesLoad = rulesLoad; w.rulesSave = rulesSave; w.DATES = DATES
  w.alCount = alCount; w.alDays = alDays; w.pendDays = pendDays; w.pendCount = pendCount; w.approvedDays = approvedDays
  w.daySnapOf = daySnapOf; w.dayVersions = dayVersions; w.verLabel = verLabel; w.dayCurVer = dayCurVer
  w.restoreDayVersion = restoreDayVersion; w.dayKeys = dayKeys
  w.setDayPreview = (di: any, v: any) => { view.setDayPreview(di, v); notify() }
  w.renderInputs = () => notify()
  w.renderStatus = () => notify()
  w.ruleFmt = ruleFmt; w.ruleOff = ruleOff; w.kindOff = kindOff; w.KIND_LABEL = KIND_LABEL
  w.lgSetEdit = (on: any) => { setLgEdit(on); notify() }
  w.daysLabel = daysLabel
  w.findGo = (key: any) => { const [di, gi] = String(key).split('|'); return DAYS[+di!] && DAYS[+di!].waves[+gi!] }
  w.histApply = histApply; w.histSnap = histSnap; w.histPush = histPush
  w.dayEngaged = dayEngaged; w.scShiftKind = scShiftKind; w.hm24 = hm24; w.rowRef = rowRef
  w.armedKey = () => view.armedKey()
  w.placeArmed = (id: any) => { view.placeArmed(id); notify() }
  w.reflow = () => HOOKS.reflow()
  /* mechanism shims: the reference exposes its render internals; in React the
     equivalent of "poke the cache, re-render" is a plain store tick */
  w.renderLogic = () => notify()
  w.weekDirty = () => notify()
  w.ruleApply = () => { rulesSave(); validate(); notify() }
  import('./ui/board').then(b => {
    w.openScheduler = b.openScheduler
    w.closeScheduler = b.closeScheduler
    w.addWave = b.addWave
    w.waveMenu = b.waveMenu
    Object.defineProperty(w, 'CXT', { get: () => b.CXT, configurable: true })
  })
  w.whoArr = whoArr
  import('./ui/html').then(m => { w.cxText = m.cxText; w.dayHTML = m.dayHTML; w.puck = m.puck })
  import('./ui/pan').then(m => { w.hsSync = m.hsSync; w.panDays = m.panDays })
  import('./ui/drag').then(m => { w.applyDrop = m.applyDrop; w.dragFrom = m.dragFrom; w.nearSeat = m.nearSeat; w.barDrop = m.barDrop; Object.defineProperty(w, 'DRAG', { get: () => m.DRAG, set: v => m.setDrag(v), configurable: true }) })
  import('./ui/palette-html').then(m => { w.paletteDay = m.paletteDay; w.paletteHTML = m.paletteHTML; w.offReason = (m as any).offReason })
  import('./ui/board-html').then(m => { w.inTypeCls = (m as any).inTypeCls; w.sbInputsHTML = m.sbInputsHTML })
}
