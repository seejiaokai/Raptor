# The Dataverse trial — its tables, and the steps on 1 Nov 26

Backlog item: `[DATAVERSE-TRIAL]` (`OUTSTANDING.md`). His rulings: D1450 (his own paid Power Apps environment, two test
accounts, demo data only, only what the IT side's platform allows) and D1451 (the trial's tables built now, tried once his
account comes on 1 Nov 26). The database step itself stays at the end (D473).

## What the trial is for

To learn, before anything is handed to the IT side, whether RAPTOR works as a Power Apps code app on Dataverse:

1. The app opens inside Power Apps (about 1–2 hours of work).
2. Microsoft sign-in makes account 1 the admin Saber and account 2 the member Ranger (about 2–3 hours).
3. Inputs save to Dataverse; the other account sees a change within about 30 seconds; two people changing the same thing is
   caught (half a day to a day).
4. The day lock — one scheduler per day — works without plug-ins (about half a day).
5. A security read (D1411 — it touches sign-in), a fresh code read, and a plain report to him (1–2 hours).

Parts 1 and the tables need only his own account; parts 2–4 need both test accounts.

## The tables — built 28 Oct 26

`raptor-port/scripts/dataverse-trial.mjs` makes, inside one solution "RAPTOR Trial" (publisher prefix `rap`):

| Table | Columns | Demo rows |
|---|---|---|
| Person | Callsign/Name (14), Initials, Seat (Pilot · WSO · Ground), Category, Is admin, Is SANS, Archived, Defence mail | Saber (admin), Ranger, Viper |
| Input | Title, Person (link), Filed by (link), Type (the app's input types), Start date, End date, All day, Start time, End time, Half day, Remarks | Ranger's leave, Viper's dentist |
| Schedule Day | Day, Date, Day of week, Snapshot (the day as one block of text), Published, Taken by (link), Taken at | 2 Nov 26 |

They are cut down from `docs/data-model.md` §3. It uses Dataverse's own Web API only — no plug-ins, no Custom APIs — and can
be run again safely: it skips what already exists, so a run that stops half way is finished by running it again. The
solution can be exported as a file for the IT side.

Checked so far: a dry run prints every request and ends cleanly; the address check refuses anything that is not a
Dataverse address; one fresh code reader. Not checked until 1 Nov: a real run, since there is no environment yet.

## His steps on 1 Nov 26

1. Open make.powerapps.com with the new account and pick his environment (top right).
2. Copy the environment's address: the gear at the top right → **Session details** → **Instance url** (it ends in
   `.dynamics.com`). Paste it to the agent.
3. The agent runs the setup and gives him a short code. He opens **microsoft.com/devicelogin**, types the code and signs in
   with the new account. Nothing else to type; the agent never sees his password.
4. When it says done: make.powerapps.com → **Solutions** → **RAPTOR Trial** shows the three tables and their demo rows.
5. For part 1 the environment needs code apps switched on: Power Platform admin center → Environments → his environment →
   **Settings** → **Product** → **Features** → **Power Apps code apps** → On. (The account needs a Power Apps Premium licence.)

## What could go wrong on the first run

- Microsoft refuses the sign-in with the default sign-in app → the setup is run with the Power Platform CLI's sign-in app
  instead (`DATAVERSE_CLIENT_ID=9cee029c-6210-4654-90bb-17e6e9d36617`, the reader's suggestion, unverified), or he registers a
  small app of his own in Microsoft Entra (the agent gives the steps).
- A table step is refused → the message says why; the agent fixes the setup and runs it again, nothing lost.
- "Not reachable yet" just after a table is made, or "another customization is running" after a stopped run → wait a
  minute and run again.
