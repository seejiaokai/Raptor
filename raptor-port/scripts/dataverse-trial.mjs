#!/usr/bin/env node
/* THE DATAVERSE TRIAL'S TABLES — his D1450 (his own paid Power Apps environment) and D1451 (the trial's tables
 * built now, tried once his account comes on 1 Nov 26).
 *
 *   node raptor-port/scripts/dataverse-trial.mjs https://<org>.crm<N>.dynamics.com            make what is missing
 *   node raptor-port/scripts/dataverse-trial.mjs https://<org>.crm<N>.dynamics.com --dry-run  print, send nothing
 *
 * Makes, inside ONE unmanaged solution ("RaptorTrial", publisher prefix `rap`), the three tables of the trial —
 * Person, Input, Schedule Day — cut down from `docs/data-model.md` §3, then a few demo rows. Why a script and not
 * the maker portal by hand: the same definitions can be run again (it skips whatever already exists, so a run that
 * stopped half way is finished by running it again), they live in the repo beside the data model, and the same
 * script grows to the full set later. Why the Web API and not a hand-written solution file: a solution file's table
 * XML is long and its import errors are opaque; the Web API answers each step with a plain message. The solution can
 * still be exported as a file for the IT side (`pac solution export --name RaptorTrial`).
 *
 * Only what the IT side's platform allows is used (D1450's reading 2): tables, columns, choices, lookups — no
 * plug-ins, no Custom APIs.
 *
 * Sign-in: Microsoft's device-code sign-in. The script prints a short code and a Microsoft address; HE opens it,
 * types the code and signs in himself. The agent never types a password (its safety rules). The access token lives
 * in this process's memory only — never written to disk, never printed — and is sent only to the environment
 * address given, which must be a `*.dynamics.com` address over https.
 * The client used for the sign-in is the Azure CLI's public client (it allows the device-code sign-in and is
 * accepted for Dataverse); set DATAVERSE_CLIENT_ID to use another — the Power Platform CLI's, or an app he registers.
 *
 * Demo data only (D1450): the rows are the demo callsigns, never a real person. */

const API = '/api/data/v9.2'
const PREFIX = 'rap'
const OPTION_PREFIX = 47210 // choice values are 472100000, 472100001, … — the publisher's option-value prefix
const SOLUTION = 'RaptorTrial'
const PUBLISHER = 'raptortrial'
const LANG = 1033
const CLIENT_ID = process.env.DATAVERSE_CLIENT_ID || '04b07795-8ddb-461a-bbee-02f9e1bf7b46'

// ─── the trial's tables ────────────────────────────────────────────────────────────────────────────────────────
// Each column: [schema name without prefix, display name, kind, options]. Kinds: text, email, memo, choice, yesno,
// date (date only), datetime, whole. A lookup is listed apart, because Dataverse makes it as a relationship.

const TABLES = [
  {
    name: 'Person', plural: 'People',
    about: 'One record for each person. Every other table points back to it (data-model.md §3, Person).',
    primary: { schema: 'Name', label: 'Callsign/Name', max: 14, required: true }, // D219, D226: one field, 14 letters
    columns: [
      ['Initials', 'Initials', 'text', { max: 4 }], // D225: asked, never required
      ['Seat', 'Seat', 'choice', { required: true, options: ['Pilot', 'WSO', 'Ground'] }], // D220
      ['Category', 'Category', 'choice', { options: ['OCU', 'D', 'C', 'B', 'A', 'IW', 'IP', 'IR', 'FI'] }],
      ['IsAdmin', 'Is admin', 'yesno', {}],
      ['IsSans', 'Is SANS', 'yesno', {}],
      ['Archived', 'Archived', 'yesno', {}],
      ['DefenceMail', 'Defence mail', 'email', { max: 100 }], // D165: the address he signs in with
    ],
    lookups: [],
  },
  {
    name: 'Input', plural: 'Inputs',
    about: 'One leave, medical, appointment or duty a person files (data-model.md §3, Input) — one person each in the trial.',
    primary: { schema: 'Name', label: 'Title', max: 40, required: false },
    columns: [
      ['Type', 'Type', 'choice', { required: true, options: ['LL', 'OL', 'OIL', 'CCL', 'ATT B', 'ATT C', 'Upchit', 'Training', 'Meeting', 'Appointment', 'Duty', 'OD', 'SANS Availability'] }],
      ['StartDate', 'Start date', 'date', { required: true }],
      ['EndDate', 'End date', 'date', {}],
      ['AllDay', 'All day', 'yesno', { default: true }],
      ['StartTime', 'Start time', 'text', { max: 5 }], // HH:MM, only when not all day
      ['EndTime', 'End time', 'text', { max: 5 }],
      ['HalfDay', 'Half day', 'choice', { options: ['AM', 'PM'] }],
      ['Remarks', 'Remarks', 'memo', { max: 2000 }],
    ],
    // A person is never erased (D290): Restrict keeps a person with inputs from being hard-deleted at all.
    lookups: [
      ['Person', 'Person', 'Person', { required: true, onDelete: 'Restrict' }],
      ['FiledBy', 'Filed by', 'Person', { onDelete: 'RemoveLink' }],
    ],
  },
  {
    name: 'ScheduleDay', label: 'Schedule Day', plural: 'Schedule Days',
    about: 'One day of the flying programme, the app\'s own copy of the day as one block of text (data-model.md §3, ScheduleDay stage 1).',
    primary: { schema: 'Name', label: 'Day', max: 20, required: true },
    columns: [
      ['Date', 'Date', 'date', { required: true }],
      ['DayOfWeek', 'Day of week', 'whole', { required: true, min: 0, max: 6 }], // 0 = Monday … 6 = Sunday
      ['Snapshot', 'Snapshot', 'memo', { max: 1000000 }], // the day as JSON, written by the app
      ['Published', 'Published', 'yesno', {}],
      ['TakenAt', 'Taken at', 'datetime', {}], // the day lock (D355): when the scheduler took it
    ],
    lookups: [
      ['TakenBy', 'Taken by', 'Person', { onDelete: 'RemoveLink' }], // the scheduler editing it now
    ],
  },
]

// The demo rows — demo callsigns only (D1450). Choice values are given by their label; lookups by the person's name.
const ROWS = {
  Person: [
    { Name: 'Saber', Initials: 'SB', Seat: 'Pilot', Category: 'IP', IsAdmin: true },
    { Name: 'Ranger', Initials: 'RG', Seat: 'WSO', Category: 'B', IsAdmin: false },
    { Name: 'Viper', Initials: 'VP', Seat: 'Pilot', Category: 'OCU', IsAdmin: false },
  ],
  Input: [
    { Name: 'Annual leave', Person: 'Ranger', FiledBy: 'Ranger', Type: 'LL', StartDate: '2026-11-02', EndDate: '2026-11-04', AllDay: true },
    { Name: 'Dentist', Person: 'Viper', FiledBy: 'Saber', Type: 'Appointment', StartDate: '2026-11-03', AllDay: false, StartTime: '09:00', EndTime: '10:30' },
  ],
  ScheduleDay: [
    { Name: '2026-11-02', Date: '2026-11-02', DayOfWeek: 0, Snapshot: '{"test":true}', Published: false },
  ],
}

// ─── metadata bodies ──────────────────────────────────────────────────────────────────────────────────────────

const lower = s => s.toLowerCase()
const schemaOf = s => `${PREFIX}_${s}`
const logicalOf = s => lower(schemaOf(s))
const tableLabel = t => t.label || t.name
const label = text => ({
  '@odata.type': 'Microsoft.Dynamics.CRM.Label',
  LocalizedLabels: [{ '@odata.type': 'Microsoft.Dynamics.CRM.LocalizedLabel', Label: text, LanguageCode: LANG }],
})
const required = on => ({ Value: on ? 'ApplicationRequired' : 'None', CanBeChanged: true, ManagedPropertyLogicalName: 'canmodifyrequirementlevelsettings' })
const optionValue = i => OPTION_PREFIX * 10000 + i

function columnBody([schema, display, kind, o]) {
  const base = { SchemaName: schemaOf(schema), DisplayName: label(display), RequiredLevel: required(!!o.required) }
  switch (kind) {
    case 'text':
    case 'email':
      return { ...base, '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata', AttributeType: 'String', AttributeTypeName: { Value: 'StringType' }, MaxLength: o.max || 100, FormatName: { Value: kind === 'email' ? 'Email' : 'Text' } }
    case 'memo':
      return { ...base, '@odata.type': 'Microsoft.Dynamics.CRM.MemoAttributeMetadata', AttributeType: 'Memo', AttributeTypeName: { Value: 'MemoType' }, MaxLength: o.max || 2000, Format: 'TextArea' }
    case 'choice':
      return {
        ...base, '@odata.type': 'Microsoft.Dynamics.CRM.PicklistAttributeMetadata', AttributeType: 'Picklist', AttributeTypeName: { Value: 'PicklistType' },
        OptionSet: { '@odata.type': 'Microsoft.Dynamics.CRM.OptionSetMetadata', IsGlobal: false, OptionSetType: 'Picklist', Options: o.options.map((t, i) => ({ Value: optionValue(i), Label: label(t) })) },
      }
    case 'yesno':
      return {
        ...base, '@odata.type': 'Microsoft.Dynamics.CRM.BooleanAttributeMetadata', AttributeType: 'Boolean', AttributeTypeName: { Value: 'BooleanType' }, DefaultValue: !!o.default,
        OptionSet: { '@odata.type': 'Microsoft.Dynamics.CRM.BooleanOptionSetMetadata', OptionSetType: 'Boolean', TrueOption: { Value: 1, Label: label('Yes') }, FalseOption: { Value: 0, Label: label('No') } },
      }
    case 'date':
      return { ...base, '@odata.type': 'Microsoft.Dynamics.CRM.DateTimeAttributeMetadata', AttributeType: 'DateTime', AttributeTypeName: { Value: 'DateTimeType' }, Format: 'DateOnly', DateTimeBehavior: { Value: 'DateOnly' } }
    case 'datetime':
      return { ...base, '@odata.type': 'Microsoft.Dynamics.CRM.DateTimeAttributeMetadata', AttributeType: 'DateTime', AttributeTypeName: { Value: 'DateTimeType' }, Format: 'DateAndTime', DateTimeBehavior: { Value: 'UserLocal' } }
    case 'whole':
      return { ...base, '@odata.type': 'Microsoft.Dynamics.CRM.IntegerAttributeMetadata', AttributeType: 'Integer', AttributeTypeName: { Value: 'IntegerType' }, Format: 'None', MinValue: o.min ?? -2147483648, MaxValue: o.max ?? 2147483647 }
    default:
      throw new Error(`unknown column kind ${kind}`)
  }
}

function tableBody(t) {
  const p = t.primary
  return {
    '@odata.type': 'Microsoft.Dynamics.CRM.EntityMetadata',
    SchemaName: schemaOf(t.name),
    DisplayName: label(tableLabel(t)),
    DisplayCollectionName: label(t.plural),
    Description: label(t.about),
    OwnershipType: 'UserOwned',
    IsActivity: false,
    HasActivities: false,
    HasNotes: false,
    PrimaryNameAttribute: logicalOf(p.schema),
    Attributes: [{
      '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata', AttributeType: 'String', AttributeTypeName: { Value: 'StringType' },
      SchemaName: schemaOf(p.schema), IsPrimaryName: true, MaxLength: p.max, FormatName: { Value: 'Text' },
      DisplayName: label(p.label), RequiredLevel: required(p.required),
    }],
  }
}

const relSchema = (t, [schema]) => `${PREFIX}_${lower(t.name)}_${lower(schema)}`

function lookupBody(t, lk) {
  const [schema, display, target, o] = lk
  return {
    '@odata.type': 'Microsoft.Dynamics.CRM.OneToManyRelationshipMetadata',
    SchemaName: relSchema(t, lk),
    ReferencedEntity: logicalOf(target),
    ReferencingEntity: logicalOf(t.name),
    CascadeConfiguration: { Assign: 'NoCascade', Delete: o.onDelete, Merge: 'NoCascade', Reparent: 'NoCascade', Share: 'NoCascade', Unshare: 'NoCascade' },
    Lookup: {
      '@odata.type': 'Microsoft.Dynamics.CRM.LookupAttributeMetadata', AttributeType: 'Lookup', AttributeTypeName: { Value: 'LookupType' },
      SchemaName: schemaOf(schema), DisplayName: label(display), RequiredLevel: required(!!o.required),
    },
  }
}

// ─── the run ──────────────────────────────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const DRY = args.includes('--dry-run')
const rawUrl = args.find(a => !a.startsWith('--'))

function environmentOrigin(raw) {
  let u
  try { u = new URL(raw) } catch { return null }
  // The token goes only to a Dataverse environment over https — never to an address a typo or a page supplied.
  if (u.protocol !== 'https:' || !/^[a-z0-9-]+\.crm\d*\.dynamics\.com$/i.test(u.hostname)) return null
  return u.origin
}

const say = (...a) => console.log(...a)
const ORIGIN = rawUrl ? environmentOrigin(rawUrl) : (DRY ? 'https://example.crm.dynamics.com' : null)
if (!ORIGIN) {
  say('Give the environment address, for example:\n  node raptor-port/scripts/dataverse-trial.mjs https://yourorg.crm5.dynamics.com')
  say('(make.powerapps.com → the gear at the top right → Session details → "Instance url". It must end in .dynamics.com.)')
  process.exit(2)
}

let TOKEN = null

async function signIn() {
  const tenant = 'organizations'
  const scope = `${ORIGIN}/.default offline_access`
  const form = o => new URLSearchParams(o).toString()
  const hdr = { 'Content-Type': 'application/x-www-form-urlencoded' }
  const dc = await (await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/devicecode`, { method: 'POST', headers: hdr, body: form({ client_id: CLIENT_ID, scope }) })).json()
  if (!dc.device_code) throw new Error(`Microsoft refused to start the sign-in: ${dc.error_description || dc.error || 'no reason given'}`)
  say(`\nSign in: open ${dc.verification_uri} and type the code ${dc.user_code}\n(waiting for you…)`)
  let wait = (dc.interval || 5) * 1000
  const until = Date.now() + (dc.expires_in || 900) * 1000
  while (Date.now() < until) {
    await new Promise(r => setTimeout(r, wait))
    const t = await (await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: 'POST', headers: hdr,
      body: form({ grant_type: 'urn:ietf:params:oauth:grant-type:device_code', client_id: CLIENT_ID, device_code: dc.device_code }),
    })).json()
    if (t.access_token) { TOKEN = t.access_token; say('Signed in.'); return }
    if (t.error === 'authorization_pending') continue
    if (t.error === 'slow_down') { wait += 5000; continue }
    throw new Error(`The sign-in did not finish: ${t.error_description || t.error}`)
  }
  throw new Error('The sign-in code ran out before it was used; run the script again.')
}

// One request to the environment. Returns { status, json, headers }; a 404 on a GET is returned, not thrown, so
// "does it exist?" reads plainly. Any other failure — a 404 on a write included — stops the run with Dataverse's own
// message: a swallowed write would end in "Done." with nothing saved (the fresh read of 28 Oct 26).
async function dv(method, path, body, extra = {}) {
  const url = `${ORIGIN}${API}${path}`
  if (DRY && method !== 'GET') {
    say(`\n[dry-run] ${method} ${path}${extra['MSCRM.SolutionUniqueName'] ? `  (into ${SOLUTION})` : ''}`)
    if (body) say(JSON.stringify(body, null, 1).slice(0, 4000))
    return { status: 204, json: null, headers: new Headers() }
  }
  if (DRY) return { status: 404, json: null, headers: new Headers() } // a dry run treats everything as missing
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`, Accept: 'application/json', 'OData-MaxVersion': '4.0', 'OData-Version': '4.0',
      ...(body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}), ...extra,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* an error page, not JSON: its text is shown below */ }
  if (res.status === 404 && method === 'GET') return { status: 404, json, headers: res.headers }
  if (!res.ok) {
    const why = json?.error?.message || text.slice(0, 500) || res.headers.get('www-authenticate') || 'no reason given'
    throw new Error(`${method} ${path} was refused (${res.status}): ${why}`)
  }
  return { status: res.status, json, headers: res.headers }
}

const inSolution = { 'MSCRM.SolutionUniqueName': SOLUTION }
// An id the environment must have sent back; a dry run, which sends nothing, stands in a marked one.
const idOr = (id, stand) => { if (id) return id; if (DRY) return stand; throw new Error(`no id came back for ${stand}`) }
const q = s => s.replace(/'/g, "''")

async function ensurePublisherAndSolution() {
  const pub = await dv('GET', `/publishers?$select=publisherid,customizationprefix&$filter=uniquename eq '${PUBLISHER}'`)
  let pubId = pub.json?.value?.[0]?.publisherid
  if (!pubId) {
    say(`Making the publisher (prefix "${PREFIX}")…`)
    const r = await dv('POST', '/publishers', { uniquename: PUBLISHER, friendlyname: 'RAPTOR Trial', customizationprefix: PREFIX, customizationoptionvalueprefix: OPTION_PREFIX }, { Prefer: 'return=representation' })
    pubId = idOr(r.json?.publisherid, 'DRY-PUBLISHER')
  } else if (pub.json.value[0].customizationprefix !== PREFIX) {
    throw new Error(`A publisher named ${PUBLISHER} exists with another prefix; stopping rather than mixing prefixes.`)
  }
  const sol = await dv('GET', `/solutions?$select=solutionid&$filter=uniquename eq '${SOLUTION}'`)
  if (!sol.json?.value?.[0]) {
    say(`Making the solution "${SOLUTION}"…`)
    await dv('POST', '/solutions', { uniquename: SOLUTION, friendlyname: 'RAPTOR Trial', version: '1.0.0.0', 'publisherid@odata.bind': `/publishers(${pubId})` })
  }
}

async function ensureTables() {
  for (const t of TABLES) {
    const ent = logicalOf(t.name)
    const have = await dv('GET', `/EntityDefinitions(LogicalName='${ent}')?$select=LogicalName`)
    if (have.status === 404) { say(`Making the table ${tableLabel(t)}…`); await dv('POST', '/EntityDefinitions', tableBody(t), inSolution) }
    else say(`Table ${tableLabel(t)} is already there.`)
    for (const c of t.columns) {
      const col = logicalOf(c[0])
      const hc = await dv('GET', `/EntityDefinitions(LogicalName='${ent}')/Attributes(LogicalName='${col}')?$select=LogicalName`)
      if (hc.status === 404) { say(`  column ${c[1]}`); await dv('POST', `/EntityDefinitions(LogicalName='${ent}')/Attributes`, columnBody(c), inSolution) }
    }
  }
  // Lookups after every table exists, since a lookup needs the table it points at.
  for (const t of TABLES) for (const lk of t.lookups) {
    const rs = relSchema(t, lk)
    const hr = await dv('GET', `/RelationshipDefinitions(SchemaName='${rs}')?$select=SchemaName`)
    if (hr.status === 404) { say(`  link ${tableLabel(t)} → ${lk[2]} (${lk[1]})`); await dv('POST', '/RelationshipDefinitions', lookupBody(t, lk), inSolution) }
  }
  // Publish only the trial's tables: publishing everything can outlast the wait for an answer on a large environment.
  say('Publishing the changes…')
  const ents = TABLES.map(t => `<entity>${logicalOf(t.name)}</entity>`).join('')
  await dv('POST', '/PublishXml', { ParameterXml: `<importexportxml><entities>${ents}</entities></importexportxml>` })
}

// The names the Web API wants for rows: each table's collection name and each lookup's link name, read back
// rather than guessed (Dataverse decides them).
async function rowNames() {
  const names = {}
  for (const t of TABLES) {
    const ent = logicalOf(t.name)
    const e = await dv('GET', `/EntityDefinitions(LogicalName='${ent}')?$select=EntitySetName`)
    const links = {}
    for (const lk of t.lookups) {
      const r = await dv('GET', `/RelationshipDefinitions(SchemaName='${relSchema(t, lk)}')/Microsoft.Dynamics.CRM.OneToManyRelationshipMetadata?$select=ReferencingEntityNavigationPropertyName`)
      links[lk[0]] = r.json?.ReferencingEntityNavigationPropertyName || schemaOf(lk[0]) // a custom lookup's link name is its schema name, case and all
    }
    names[t.name] = { set: e.json?.EntitySetName || `${ent}s`, links }
  }
  return names
}

async function ensureRows() {
  const names = await rowNames()
  const ids = { Person: {} }
  const idField = t => `${logicalOf(t.name)}id`
  for (const t of TABLES) {
    const { set, links } = names[t.name]
    for (const row of ROWS[t.name] || []) {
      const nameCol = logicalOf(t.primary.schema)
      const found = await dv('GET', `/${set}?$select=${idField(t)}&$filter=${nameCol} eq '${q(row.Name)}'`)
      // Just after a table is made its rows can briefly answer "not found"; never read that as "no such row".
      if (found.status === 404 && !DRY) throw new Error(`the table ${tableLabel(t)} is not reachable yet — wait a minute and run again`)
      let id = found.json?.value?.[0]?.[idField(t)]
      if (!id) {
        const body = {}
        for (const [k, v] of Object.entries(row)) {
          const col = t.columns.find(c => c[0] === k)
          const lk = t.lookups.find(l => l[0] === k)
          if (k === t.primary.schema) body[nameCol] = v
          else if (lk) {
            const pid = ids[lk[2]]?.[v]
            if (!pid) throw new Error(`demo row "${row.Name}": no ${lk[2]} named ${v}`)
            body[`${links[k]}@odata.bind`] = `/${names[lk[2]].set}(${pid})`
          } else if (col?.[2] === 'choice') {
            const i = col[3].options.indexOf(v)
            if (i < 0) throw new Error(`demo row "${row.Name}": ${v} is not a ${col[1]} choice`)
            body[logicalOf(k)] = optionValue(i)
          } else if (col) body[logicalOf(k)] = v
          else throw new Error(`demo row "${row.Name}": no column ${k}`)
        }
        say(`  row ${tableLabel(t)}: ${row.Name}`)
        const r = await dv('POST', `/${set}`, body, { Prefer: 'return=representation' })
        id = idOr(r.json?.[idField(t)], `DRY-${row.Name}`)
      }
      if (ids[t.name]) ids[t.name][row.Name] = id
    }
  }
}

try {
  if (DRY) say(`Dry run against ${ORIGIN}: nothing is sent; every request is printed instead.`)
  else await signIn()
  await ensurePublisherAndSolution()
  await ensureTables()
  say('Adding the demo rows…')
  await ensureRows()
  say(`\nDone. In make.powerapps.com → Solutions → "RAPTOR Trial" you should see Person, Input and Schedule Day.`)
} catch (e) {
  console.error(`\nStopped: ${e.message}`)
  console.error('Nothing is lost: run the same command again and it carries on from where it stopped.')
  process.exit(1)
}
