# Power Apps code apps — the data side: Dataverse, Microsoft 365 connectors and Power Automate (as of 19 Nov 2026)

Source-date key used below (each page's `ms.date` / `updated_at` as served on 19 Nov 2026):
- Connect to Dataverse — ms.date 14 Aug 2026, updated 30 Oct 2026
- Connect to data (connectors) — 2 Oct 2026
- Power Apps CLI reference — 10 Nov 2026 (updated 11 Nov 2026)
- Overview (features, limitations) — 23 Sep 2026
- Architecture — 12 Aug 2026
- Add Power Automate flows — 13 Aug 2026
- Add a Dataverse action or function — 13 Aug 2026
- Configure hosting/header/access text ("system limits and configuration") — 10 Nov 2026
- Content Security Policy for code apps — 7 Apr 2026
- Create a connection — 19 Aug 2026
- Quickstart (Power Apps CLI) — 13 Aug 2026
- Dataverse service protection API limits — 26 Oct 2026
- Requests limits and allocations — 10 Nov 2026
- Security roles and privileges — 9 Dec 2025 (updated 14 Aug 2026)
- Manage group teams — 15 Jul 2025 (updated 14 Aug 2026)
- Dataverse capacity storage — 2 Nov 2026 (updated 16 Nov 2026)
- npm `@microsoft/power-apps` — latest 1.6.0, published 4 Nov 2026 (type definitions read directly from the package on unpkg)

## 1. Connecting a code app to Dataverse: command, generated files, CRUD calls and query options

### Takeaway
The CLI is now the npm-based **Power Apps CLI (`pa`)**, not `pac code`: `pa app add data-source --connector dataverse --table <logicalname>` generates `<Table>Model.ts` and `<Table>Service.ts` with static `create / get / getAll / update / delete` methods that all return `IOperationResult<T>` = `{ success, data, error?, skipToken?, nextLink?, count?, fileName? }`. Query options are OData strings (`select`, `filter`, `orderBy`, `top`, `skip`, `skipToken`, `maxPageSize`, plus — in the library typings but not on the Learn page — `count`, `expand`, `apply`, `partitionId`). Lookups are written with `@odata.bind`; reads return `_x_value` GUIDs; multi-select choices have helper functions; formatted values come back as annotations because the library always asks for them.

### Cited Findings

**Status / versions**
- Code apps reached general availability in February 2026 ("Generally available: host and run code apps in Power Apps") — [Microsoft Power Platform blog](https://microsoft.com/en-us/power-platform/blog/power-apps/generally-available-host-and-run-code-apps-in-power-apps); a third-party tracker dates it 10 Feb 2026 — [powerappsguide.com](https://powerappsguide.com/blog/post/code-apps-are-generally-available) (community).
- Within Dataverse support, "Image and file upload and download (preview)" is the only item explicitly marked preview on the Dataverse page — [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse).
- End users need Power Apps Premium (or pay-as-you-go, an App Pass, or auto-claim); admins must switch on "Enable code apps" per environment (Admin center > Environments > Settings > Product > Features) — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview).
- npm `@microsoft/power-apps` latest is **1.6.0 (4 Nov 2026)**; 1.1.1 (8 Apr 2026) is the minimum for flows and Dataverse actions — [npm registry](https://registry.npmjs.org/@microsoft/power-apps) (read directly); [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows).

**The CLI changed: `pa`, installed from npm**
- Install: `npm install --global @microsoft/power-apps-cli` and `npm install --global @microsoft/power-apps`; then `pa app init`, `pa app run` (open the "Local Play" URL in the same browser profile as your tenant), `npm run build`, `pa app push` — [Quickstart](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch).
- The npm CLI "replaces the Power Platform CLI's pac code commands, which are deprecated in a future release" (quoted in search snippets of the npm quickstart and the `pac code` reference page) — [npm quickstart](https://learn.microsoft.com/power-apps/developer/code-apps/how-to/npm-quickstart), [pac code reference](https://learn.microsoft.com/en-ca/power-platform/developer/cli/reference/code). A community post (28 Jul 2026) describes the mapping `pac code init → power-apps init` etc. — [Rajeev Pentyala](https://rajeevpentyala.com/2026/07/28/did-you-know-power-apps-code-apps-have-a-new-cli-power-apps-that-replaces-pac-code/) (community).
- Command to add a Dataverse table (current syntax): `pa app add data-source --connector dataverse --table <table-logical-name>`; one native Dataverse table per command; `--org-url` gives the Dataverse organisation URL (prompted if missing); native Dataverse "doesn't use a connection ID, connection reference, or dataset" — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli).
- Other data commands: `pa app refresh data-source --name <name>` (regenerate after a schema change), `pa app remove data-source --connector <id> --name <name> [--force]`, `pa app add dataverse-api --api-name <op>`, `pa app find-dataverse-api --search <op> [--json]`, `pa app add flow --flow-id <id>`, `pa app list-flows`, `pa app share --principal <emails|objectIds> [--access play|edit]`, `pa app push [--solution-id <id>] [--non-interactive]` — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli).

**Generated files**
- Adding the Accounts table generates `AccountsModel.ts` and `AccountsService.ts`; Microsoft's import example — [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse):
  ```typescript
  import { AccountsService } from './generated/services/AccountsService';
  import type { Accounts } from './generated/models/AccountsModel';
  ```
- Adding a Dataverse API also writes `<schemaPath>/dataverse/<ApiName>.Schema.json`, `<schemaPath>/appschemas/dataSourcesInfo.ts`, updates `power.config.json`, and generates `<codeGenPath>/generated/models/<TableName>Model.ts` and `<codeGenPath>/generated/services/<ApiName>Service.ts` — [Add a Dataverse action or function](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-dataverse-action-function).
- Folder naming is inconsistent across Microsoft pages: Dataverse page says `/generated/services/`; the flows page shows `src/services/` and `src/models/`; the SQL example on the connectors page says `src/Models` and `src/Services` — [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse); [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows); [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data).
- `power.config.json` holds the metadata the CLI and library use for connections and publishing; "Your app logic doesn't need to interact with the power.config.json file" — [Architecture](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture).

**CRUD, as Microsoft shows it** — [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse):
- Create (exclude primary key and ownership columns such as `accountid`, `ownerid`, `owneridname`, `owneridtype`, `owneridyominame`):
  ```typescript
  const result = await AccountsService.create(newAccount as Omit<Accounts, 'accountid'>);
  if (result.data) { console.log('Account created:', result.data); }
  ```
- Get one: `const result = await AccountsService.get(accountId);`
- Get many: `const result = await AccountsService.getAll(options);` with
  ```typescript
  interface IGetAllOptions {
     maxPageSize?: number;    // Maximum number of records per page
     select?: string[];       // Specific fields to retrieve
     filter?: string;         // OData filter string
     orderBy?: string[];     // Fields to sort by
     top?: number;           // Maximum number of records to retrieve
     skip?: number;          // Number of records to skip
     skipToken?: string;     // Token for pagination
  }
  ```
  Example options: `select: ['name','accountnumber','address1_city'], filter: "address1_country eq 'USA'", orderBy: ['name asc'], top: 50`. "Always limit the number of columns you retrieve by using the select parameter."
- Update: `await AccountsService.update(accountId, changes);` — "only include the properties you're changing… False updates… can trigger business logic… or can corrupt auditing data."
- Delete: `await AccountsService.delete(accountId);`
- Supported: CRUD, formatted values (labels) for option sets, table metadata, lookups (via Web API associate guidance), image/file upload and download (preview), delegation for Filter, Sort, Top, and paging.

**What the library's own type definitions add (v1.6.0, read from the package)**
- The real options type is broader than the Learn page's `IGetAllOptions`:
  ```typescript
  export interface IOperationOptions {
      maxPageSize?: number; partitionId?: string; select?: string[]; filter?: string;
      orderBy?: string[]; top?: number; skip?: number; count?: boolean;
      skipToken?: string; expand?: string[]; apply?: string;
  }
  ```
  — [`dist/internal/data/core/types/index.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/types/index.d.ts)
- Result shape:
  ```typescript
  export interface IOperationResult<TResponse> {
      success: boolean;
      data: TResponse;
      error?: Error | PowerDataRuntimeHttpError;   // { message, status?, requestId?, stack? }
      skipToken?: string;   // next page
      nextLink?: string;    // full continuation URL (saved queries)
      count?: number;       // when count:true; "the platform caps at 5000"
      fileName?: string;    // file/image downloads
  }
  ```
  — same file; `PowerDataRuntimeHttpError` in [`error/types.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/error/types.d.ts).
- Options are turned into `$select`, `$filter`, `$orderby`, `$top`, `$skip`, `$count`, `$skiptoken`, `$expand`, `$apply` query parameters (plain OData syntax, URL-encoded by the library) — [`stringQueryOptions.js`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/data/executors/shared/stringQueryOptions.js).
- `maxPageSize` is sent as a header: `Prefer: odata.maxpagesize=<n>,odata.include-annotations=*`; ordinary requests carry `Prefer: return=representation,odata.include-annotations=*` — [`dataverseDataOperationExecutor.js`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/data/executors/dataverseDataOperationExecutor.js), [`runtimeDataClient.js`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/runtimeClient/runtimeDataClient.js).
- A lower-level client is public: `import { getClient } from '@microsoft/power-apps/data'` returns a `DataverseQueryDataClient` with `createRecordAsync, updateRecordAsync(table, id, changes, partitionId?), deleteRecordAsync, retrieveRecordAsync, retrieveMultipleRecordsAsync, executeAsync, uploadFileToRecord, downloadFileFromRecord, downloadImageFromRecord(table, id, column, fullSize?), deleteFileOrImageFromRecord`, and `retrieveSavedQueryAsync(tableName, savedQueryId, { maxPageSize?, nextLink? })` (runs a saved view) — [`dist/data/Data.types.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/data/Data.types.d.ts), [`dist/data/index.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/data/index.d.ts).
- App context: `import { getContext } from '@microsoft/power-apps/app'` gives `user.{fullName, objectId, systemUserId, tenantId, userPrincipalName}` and `app.{appId, environmentId, dataverseOrgUrl?, appUrl?, queryParams}` — [`dist/app/App.Types.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/app/App.Types.d.ts).

**Lookups** (official sample, Microsoft's GitHub repo)
- Write: `contact['parentcustomerid_account@odata.bind'] = `/accounts(${accountId})`;` ("<SchemaName>@odata.bind": "/<entitysetname>(<guid>)"); clear: `updates['parentcustomerid_account@odata.bind'] = null;` — [LOOKUPS.md, Dataverse sample](https://github.com/microsoft/PowerAppsCodeApps/blob/main/samples/Dataverse/LOOKUPS.md).
- Read: lookups come back as `_<schemaname>_value` GUIDs; include them in `select`; resolve names with a targeted `Service.get(guid, { select: [...] })`; the sample says "Do not use $expand to eagerly load related records" — [LOOKUPS.md](https://github.com/microsoft/PowerAppsCodeApps/blob/main/samples/Dataverse/LOOKUPS.md).
- Contradiction inside the same sample: LOOKUPS.md says set `@odata.bind` to `null` to clear, while `useContacts.ts` says "Clearing lookup fields requires a separate DELETE operation to the navigation property reference (not shown in this demo)" — [useContacts.ts](https://github.com/microsoft/PowerAppsCodeApps/blob/main/samples/Dataverse/src/hooks/useContacts.ts). The Learn page itself says a dedicated lookups how-to is "coming soon" and points to the Web API associate/disassociate guidance — [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse).
- The sample's LOOKUPS.md reads `r.value?.fullname`, but the library's result type has `data`, not `value` — compare [LOOKUPS.md](https://github.com/microsoft/PowerAppsCodeApps/blob/main/samples/Dataverse/LOOKUPS.md) with [`types/index.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/types/index.d.ts) (the WhoAmI example on Learn also says `result.value` — [Add a Dataverse action](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-dataverse-action-function)).

**Choices, multi-select choices, files, images**
- Multi-select choices: generated types are `number[]`; the wire format is `"100,200,300"`; use `serializeMultiSelectPicklistFields(record, fields)` before create/update (empty array → `null`, "because Dataverse rejects an empty string") and `deserializeMultiSelectPicklistFields(record, fields)` after reads — [`multiSelectPicklistUtils.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/data/multiSelectPicklistUtils.d.ts).
- Files: generated `Service.upload(id, columnName, file, name)`, `downloadFile(id, columnName)`, `downloadImage(id, columnName, fullSize)`, `deleteFileOrImage(id, columnName)` — [Dataverse sample README](https://github.com/microsoft/PowerAppsCodeApps/tree/main/samples/Dataverse). Upload is a single request "maximum size 128 MB"; "For file columns the limit is 128 MB or the column's MaxSizeInKB setting, whichever is lower. For image columns the maximum configurable size is 30 MB"; size is not checked client-side — [`uploadRecord.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/api/uploadRecord.d.ts), [`runtimeDataClient.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/runtimeClient/runtimeDataClient.d.ts).
- Elastic tables: `partitionId` parameters exist on update, delete and file calls ("Only applicable to file columns on elastic tables") — [`Data.types.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/data/Data.types.d.ts).

### Inferences
- Because every request asks for `odata.include-annotations=*`, formatted values (choice labels, formatted dates/currency, lookup names) should arrive as standard Dataverse Web API annotations on each row (`<column>@OData.Community.Display.V1.FormattedValue`, `_x_value@Microsoft.Dynamics.CRM.lookuplogicalname`). That would make the sample's extra `get()` per lookup unnecessary for display names. This is inferred from the library code plus standard Web API behaviour; the code-apps docs only say formatted values are "supported". It should be checked against a real response before the adapter relies on it.
- `skipToken` paging: the library pulls the skip token out of `@odata.nextLink`. The adapter loops `getAll({ ...opts, skipToken })` until `result.skipToken` is undefined.
- Dates, time zones and currency are not covered by any code-apps page. The app should expect plain Web API behaviour: date-time columns in UTC ISO strings; "date only" behaviour columns as `YYYY-MM-DD`; currency columns as numbers plus a `_transactioncurrencyid_value` lookup. The adapter should store day-level schedule data in "Date only" columns, so a user's time zone never shifts a day. This is inference from general Dataverse behaviour, not from code-apps docs.
- `$apply` (aggregation), `$expand` and `$count` work at the library level even though the Learn page doesn't list them. Microsoft's sample discourages `$expand`. `count` caps at 5,000.

### Gaps
- No official page on formatted values, dates/time zones, currency, or clearing a lookup in a code app; the lookups how-to is "coming soon".
- The legacy `pac code add-data-source -a dataverse -t <table>` syntax (named in the brief) was not re-verified on its reference page this session. Only the deprecation notice was seen, in search snippets.
- Exact generated service method signatures (e.g. whether `getAll` exposes `count`/`expand`) were not seen. The sample's generated folder was not reachable via raw GitHub.

## 2. What is not supported, workarounds, concurrency, and calling the Web API directly

### Takeaway
Officially unsupported: polymorphic lookups, schema (metadata) CRUD, FetchXML, alternate keys, and the Excel connectors. Dataverse **actions, functions and custom APIs are now supported** via `pa app add dataverse-api`. Public `$batch`, transactions, change tracking and ETag-based optimistic concurrency are not exposed. The library forces `If-Match: *` on every update, which means "update only, never create" — not "update only if unchanged". Calls must go through the library, because the host supplies the token and the default CSP blocks direct `fetch`.

### Cited Findings
- "The following features aren't yet supported: Polymorphic lookups; Schema definition (entity metadata) CRUD; FetchXML support; Alternate key support" — [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse).
- Connectors not yet supported: Excel Online (Business) and Excel Online (OneDrive); "All connectors are officially supported except" those — [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data).
- Dataverse actions and functions: `pa app find-dataverse-api --search "WhoAmI"`, then `pa app add dataverse-api --api-name WhoAmI`. Generated call: `const result = await WhoAmIService.WhoAmI();`. For a bound action, the first argument is the record ID (`AddToQueueService.AddToQueue(queueId, target, sourceQueue, queueItemProperties)`). GUIDs are `string`; table references are `Record<string, unknown>`. Returns are `Promise<IOperationResult<void | T | Record<string, unknown>>>`. Requires `@microsoft/power-apps` ≥ 1.1.1 — [Add a Dataverse action or function](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-dataverse-action-function).
- The library's request type for these is `{ action: 'customapi', parameters: { operationName, tableName, body? } }` ("Schema name of the action or function to invoke") — [`common/types.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/common/types.d.ts).
- Update always sends `If-Match: *` for Dataverse (`...(apiId === DataSources.Dataverse ? { headers: { 'If-Match': '*' } } : {})`). `updateRecordAsync` takes no headers or ETag parameter — [`runtimeDataClient.js`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/runtimeClient/runtimeDataClient.js), [`Data.types.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/data/Data.types.d.ts).
- Internally, Dataverse requests carry a `BatchInfo` header (base URL, path, Prefer/If-Match headers, `batchId`) to the host, unless it's a file upload or `skipBatch`. Batching is done by the host and is not an app-facing API — [`runtimeDataClient.js`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/runtimeClient/runtimeDataClient.js).
- Tokens: the library gets "a dynamic resource token" for Dataverse from the host (`Authorization: dynamicauth <token>`); `_getAccessToken` is private; failure raises `TOKEN_ACQUISITION_FAILED` — [`runtimeDataClient.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/runtimeClient/runtimeDataClient.d.ts), [`error/codes.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/error/codes.d.ts).
- Default CSP for code apps is enforced with `connect-src 'none'`. Admins can add sources per environment (Admin center > Environment > Settings > Product > Privacy + Security > Content security policy > App tab, or the `PowerApps_CSPConfigCodeApps` setting via the Power Platform API) — [Configure CSP](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy). Message center MC1218747: after 30 Jan 2026, requests from code apps to assets outside Power Apps domains are blocked by default — [mc.merill.net](https://mc.merill.net/message/MC1218747) (aggregator of Microsoft message center). A developer reports `fetch()` to a flow's HTTP endpoint failing under CSP after deployment — [shaheer365 blog](https://shaheer365.blogspot.com/2026/02/power-automate-http-flow-calls-fail.html) (community).
- Saved views (system/personal views, which are FetchXML-based) can be run with `retrieveSavedQueryAsync(tableName, savedQueryId, { maxPageSize, nextLink })` — [`Data.types.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/data/Data.types.d.ts).
- Code apps don't support Power Platform Git integration, Power Apps for Windows, the Power BI integration function, SharePoint forms integration, Secure Implicit Connections, or SAS IP binding — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview).

### Inferences
- **Optimistic concurrency:** there is no way through the public library to send `If-Match: <etag>`. Two schedulers saving the same row will both win, last-write-wins. Workarounds, in order of fit:
  1. A Dataverse **custom API** (built by IT, called via `pa app add dataverse-api`) whose plug-in compares a version column and rejects stale writes, all in one server transaction.
  2. An app-level version column (`rowversion` is read-only, so use a custom integer). Read it, compare it, then write — not atomic, so it only narrows the race.
  3. An instant flow. This is slow and still not atomic.
  Not confirmed by Microsoft docs; derived from the typings.
- **Transactions / multi-row atomic saves:** not available client-side. A custom API (one plug-in transaction) is the only in-platform route. A restricted tenant may not allow plug-ins, which would leave non-atomic sequential writes plus compensation logic.
- **Alternate keys / upsert:** unsupported, and `If-Match: *` blocks upsert-by-PATCH. The adapter must query by business key (`filter`) and then create or update by GUID. Better: keep Dataverse GUIDs as the app's stable ids, which fits "one command layer over stable IDs".
- **FetchXML:** use `filter`/`$apply` OData, or a saved view via `retrieveSavedQueryAsync`.
- **Change tracking:** the typings have no delta-token option. Poll with `filter: "modifiedon gt <lastSync>"` plus a narrow `select`.
- **Calling the Web API with your own `fetch`:** you would need (a) the org URL added to `connect-src` by an admin, and (b) your own Entra token (MSAL with an app registration), because the host's token isn't exposed. For a restricted tenant that is effectively ruled out. Treat "only through generated services / `getClient`" as the rule.

### Gaps
- No official statement either way on ETag/If-Match, `$batch`, change tracking or transactions for code apps. These conclusions are from the library code (v1.6.0) and may change in later versions.
- Whether `pa app find-dataverse-api` lists custom APIs isn't stated explicitly. The library's `customapi` request type and `$metadata` source suggest yes.

## 3. Errors, throttling (service protection), Power Platform request limits and retries

### Takeaway
Calls resolve to `{ success: false, error }` rather than always throwing, though Microsoft's samples also wrap them in try/catch. The library has no documented automatic 429 retry, so the adapter should do it. Dataverse service protection is **per user, per web server: 6,000 requests / 5 min, 20 min execution time / 5 min, 52 concurrent**, returned as HTTP 429 with `Retry-After`. Separately, each Premium user is entitled to **40,000 Power Platform requests / 24 h**, and every Dataverse CRUD and connector call counts.

### Cited Findings
- Result object: `success: boolean; data; error?: Error | PowerDataRuntimeHttpError` where `PowerDataRuntimeHttpError = { message: string; status?: number; requestId?: string; stack?: string }` — [`types/index.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/types/index.d.ts), [`error/types.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/error/types.d.ts). The flows page documents the same `success / data / error` triple — [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows).
- Library error codes include `CONNECTION_NOT_FOUND`, `DATA_SOURCES_INFO_NOT_FOUND`, `DATA_CLIENT_INIT_FAILED`, `CONNECTION_REFERENCE_NOT_FOUND`, `INVALID_PARAMETER_VALUE`, `TOKEN_ACQUISITION_FAILED` (thrown as `PowerDataRuntimeError` with `.code`) — [`error/codes.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/error/codes.d.ts).
- The client config type has `retryAttempts?` and `timeout?` fields, but they're marked `@private` — [`common/types.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/common/types.d.ts).
- Service protection limits, per web server: "Number of requests… 6,000 within the five-minute sliding window"; "Execution time… 20 minutes (1,200 seconds) within the five-minute sliding window"; "Number of concurrent requests… 52 or higher". They're evaluated per user; each web server enforces them independently; "These limits can change and might vary between different environments" — [Service protection API limits](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/api-limits).
- Errors: Web API returns 429 with a `Retry-After` header in seconds. Hex codes `0x80072322` (requests), `0x80072321` (execution time), `0x80072326` (concurrency). "Exceeding the number of concurrent requests returns an error immediately" — [Service protection API limits](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/api-limits).
- Interactive apps: "display a message that the server is busy while you retry… Don't allow users to submit more requests until the previous request you sent is complete"; don't show the raw error to users. Without `Retry-After`, Microsoft's sample backs off `2^count` seconds — [Service protection API limits](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/api-limits).
- "Batch operations aren't a valid strategy to bypass entitlement limits… Entitlement limits are based on CRUD operations and accrue whether or not they're included in a batch" — [Service protection API limits](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/api-limits).
- What counts: "Power Apps: All API requests to connectors and Microsoft Dataverse"; Dataverse: "All create, read, update, and delete (CRUD), assign, and share operations", but "login, logout, and system metadata operations" are excluded — [Requests limits and allocations](https://learn.microsoft.com/en-us/power-platform/admin/api-request-limits-allocations).
- Paid Power Platform licences (incl. Power Apps per user / Premium): **40,000 requests per paid licence per 24 hours**. Power Apps per app, pay-as-you-go and Microsoft 365 licences: 6,000. Limits don't roll over. "Microsoft reserves the right to enforce limits for overages… you might see throttling". Request add-on packs give +50,000 / 24 h but "can't currently [be assigned] to users or flows" — [Requests limits and allocations](https://learn.microsoft.com/en-us/power-platform/admin/api-request-limits-allocations).
- Usage reports in the admin center (preview) "are currently limited to Power Automate API requests. API requests from Dataverse, Microsoft Copilot Studio, and Power Apps aren't included" — [Requests limits and allocations](https://learn.microsoft.com/en-us/power-platform/admin/api-request-limits-allocations).
- Code apps have operational health metrics in the admin center and maker portal — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview).

### Inferences
- Polling budget: one `getAll` every 30 s is 120 an hour, so 960 per user in an 8-hour shift, or 2,880 if left open 24 h. Polling 5 queries per tick over 8 hours is about 4,800 a day — fine against 40,000, but a tab left open all day multiplies it. Pause polling when the tab is hidden (`document.visibilityState`). Use one "change marker" query (for example `modifiedon gt <t>`, `select` of ids only, `top`) before any full reload.
- The 6,000 / 5 min limit (≈20 requests a second sustained) won't be reached by normal use. Bulk actions (publishing a whole week, importing) could hit the 52-concurrent limit if the adapter fires `Promise.all` over hundreds of rows. Cap concurrency at about 4–8.
- Retry design for the adapter: on `success === false` with `error.status === 429` (or 503/504), wait for `Retry-After`. The library doesn't seem to expose response headers in `IOperationResult`, so fall back to exponential backoff (2, 4, 8 … s, with jitter, max about 5 tries). Mark the save "pending" in the UI and never fire duplicate writes. Unconfirmed whether `error.status` is filled for 429.

### Gaps
- Whether the library or host retries 429s automatically isn't documented. The private `retryAttempts` field hints at some retry logic.
- Whether `Retry-After` is surfaced to app code wasn't found. `IOperationResult` has no headers field.
- Whether host-side batching (the `BatchInfo` header) changes how requests are counted wasn't found. Microsoft says batched CRUD still counts per operation.

## 4. Microsoft 365 connectors from code apps (Office 365 Users, Outlook, Teams, SharePoint)

### Takeaway
Every connector except the two Excel ones is supported. Create a connection (`pa connection create --connector shared_office365users`), then add it (`pa app add data-source --connector <id> --connection-id <id>`, or `--connection-ref <logical> --solution-id <id>` for solution-based ALM). That generates `<Connector>Model.ts` and `<Connector>Service.ts`. End users get a consent prompt for the connector on first run. SharePoint works both as a table (list) and as actions (files).

### Cited Findings
- Steps and commands — [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data); [Create a connection](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-connection); [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli):
  ```powershell
  pa connector list --search teams
  pa connection create --connector shared_office365        # Outlook
  pa connection create --connector shared_teams --display-name "My Teams"
  pa connection list
  pa app add data-source --connector "shared_office365users" --connection-id "<connection-id>"
  # SharePoint list as a table (dataset = site URL, table = list name):
  pa app add data-source --connector "shared_sharepointonline" --connection-id <id> --table "Travel%20Request" --dataset "https://contoso.sharepoint.com/sites/TravelPolicies"
  # SharePoint actions (files etc.):
  pa app add data-source --connector shared_sharepointonline --connection-id <id> --as action
  # Through a connection reference in a solution:
  pa solution list
  pa connection list-references --solution-id <solution-id>
  pa app add data-source --connector <connector-id> --connection-ref <connection-reference-logical-name> --solution-id <solution-id>
  ```
  In non-interactive (CI) mode, a table-and-action connector "fails until you include `--as table` or `--as action`". Office 365 Users is action-only.
- Connection references "make the solution environment-aware and portable across Dev, Test, and Prod". Use the logical name (e.g. `cr123_sharedsharepointonline_1a2b3`) — [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data).
- Office 365 Users code, as Microsoft shows it — [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data):
  ```typescript
  import { Office365UsersService } from './generated/services/Office365UsersService';
  import type { User } from './generated/models/Office365UsersModel';
  const profile = (await Office365UsersService.MyProfile_V2("id,displayName,jobTitle,id,userPrincipalName")).data;
  const photoData = (await Office365UsersService.UserPhoto_V2(profile.id || profile.userPrincipalName)).data;
  if (photoData) setPhoto(`data:image/jpeg;base64,${photoData}`);
  ```
- Tabular connector services follow the same pattern: `create(record)`, `update(id, record)`, `delete(id)`, `get(id)`, `getall()` — [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data).
- Managed-platform behaviour: "End-users see consent dialog for connector permissions"; admin consent suppression works for Microsoft OAuth connectors; DLP is enforced at app launch; conditional access per app, tenant isolation and sharing limits (canvas-app limits) apply — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview).
- The library's connection type carries `isShareableConnection`, which separates shared connections (e.g. SQL with stored credentials) from per-user ones — [`Data.types.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/data/Data.types.d.ts).
- Connector calls also count toward the 40,000 / day ("All API requests to connectors") — [Requests limits and allocations](https://learn.microsoft.com/en-us/power-platform/admin/api-request-limits-allocations).

### Inferences
- Office 365 Users, Outlook, Teams and SharePoint use per-user OAuth connections. Each user consents once and acts as themselves, so a Teams post appears from that user, not a service account. For "post as the app/bot", use an instant flow whose connections belong to a service account (section 5).
- Upload and download of SharePoint files: available as connector actions after `--as action` (the SharePoint connector has file actions such as Create file / Get file content). The method names aren't documented for code apps; read the generated service.
- Licensing: Office 365 Users, Outlook, Teams and SharePoint are generally "standard" (non-premium) connectors. Code-app users need Premium anyway, so connector tier doesn't change licensing here. Not verified this session.

### Gaps
- No code-apps page shows Outlook send-mail, Teams post-message or SharePoint file upload/download code. The method names come from each connector's OpenAPI and are only visible in generated files.
- Exact consent and "shareable connection" behaviour for end users isn't spelled out on the code-apps pages.
- Premium vs standard status of these four connectors was not checked against the connector reference pages this session.

## 5. Calling Power Automate flows from a code app

### Takeaway
Supported: since about April 2026 (`@microsoft/power-apps` ≥ 1.1.1), only **solution-aware instant flows with the Power Apps trigger** can be called. Add one with `pa app add flow --flow-id <id>` and call `XService.Run({...})` → `{ success, data, error }`. Scheduled and automated flows can't be called from the app. They run on their own and use their owner's (or a Process licence's) limits.

### Cited Findings
- "Code apps support only solution-aware instant flows that use the Power Apps trigger. Scheduled flows, automated flows, and instant flows that use other triggers aren't supported." Prerequisite: `@microsoft/power-apps` 1.1.1 or later — [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows).
- Commands: `pa app list-flows [--search approval]`, `pa app add flow --flow-id <id>` (downloads the flow's OpenAPI definition, generates typed models/services, adds the flow and its connection references to `power.config.json`), rerun to update, `pa app remove flow --flow-name <name> | --flow-id <id>` — [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows).
- Call:
  ```typescript
  import { ApprovalWorkflowService } from './services/ApprovalWorkflowService';
  const result = await ApprovalWorkflowService.Run({ requester: 'Alex', amount: 1500 });
  if (result.success) { console.log('Flow triggered. Response:', result.data); }
  else { console.error('Flow failed:', result.error); }
  ```
  — [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows).
- Limitations table: Power Apps trigger required; must be in a solution; "The person adding the flow must have access to the flow and its underlying connections"; "End users need sufficient Dataverse permissions to invoke the flow. Assign the App Opener security role or an equivalent role"; manual regeneration after the flow changes — [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows).
- Timing: community posts from April–May 2026 report flow calling became available then (e.g. "Code Apps Integration with Power Automate Flows is now available") — [powerappsguide.com](https://powerappsguide.com/blog/post/code-apps-office-hours-april), [Rajeev Pentyala, 5 May 2026](https://rajeevpentyala.com/2026/05/05/power-apps-code-apps-trigger-a-power-automate-flow/) (community). Some coverage called it preview — [Collab365](https://spaces.collab365.com/posts/microsoft-adds-flow-triggers-to-code-apps-preview-icKr16). The current Learn page carries no preview label.
- Whose limits: "Instant flows, which run on demand, use the limits of the account that starts the process. Workflows or automated and scheduled flows that run in the background always use the limits of the owner of the process, regardless of… which accounts are used for connections" — [Requests limits and allocations](https://learn.microsoft.com/en-us/power-platform/admin/api-request-limits-allocations).
- Power Automate limits per user: Power Apps Premium 40k per user (transition period: 200k per cloud flow); Office 365 6k per user (10k per flow in transition); the 5-minute flow limit is 100,000. The transition period ends in a phased rollout "starting April 2027" — [Requests limits and allocations](https://learn.microsoft.com/en-us/power-platform/admin/api-request-limits-allocations).
- Service-principal-owned flows: they use the tenant's non-licensed pool (Power Apps and Power Automate: "25,000 base requests with no per-license accrual"; all application/non-interactive users share it), unless the flow has a Process licence (250,000 / 24 h, stackable to 10) or a designated licensed user — [Requests limits and allocations](https://learn.microsoft.com/en-us/power-platform/admin/api-request-limits-allocations).

### Inferences
- In an instant flow called from the app, the trigger runs as the calling user, but actions use the connections embedded in the flow, which belong to the flow's maker/owner or its connection references. So a flow can post to Teams or send mail "as" a service account while the request count lands on the caller. This matches the standard Power Apps-triggered flow model; the code-apps page doesn't restate it.
- A scheduled job (e.g. nightly OIL rollups or reminders) should be a separate scheduled flow owned by a licensed service account (Power Automate Premium or Power Apps Premium gives 40k), or by a service principal using the 25k tenant pool or a Process licence. It can't be triggered from the app.
- A plain HTTP-trigger flow called with `fetch` is blocked by CSP by default, and an "outside connector" HTTP trigger is premium. Use the native flow integration.

### Gaps
- Flow-call round-trip latency and timeout (Power Apps trigger flows normally have a synchronous response limit) aren't documented for code apps.
- No official GA date for flow calling was found.

## 6. Dataverse security model as it affects a code app

### Takeaway
A code app calls Dataverse with the signed-in user's own token, so Dataverse security roles are the real enforcement. The app's own roles are only a UI layer. Users need a custom security role granting privileges on the app's custom tables (Basic User covers "core business tables", not your custom ones). Assign it to a Dataverse **Microsoft Entra security-group team**, so access follows the one Entra group, with "member's privilege inheritance" if team members must own rows themselves.

### Cited Findings
- The host "manages end-user authentication"; data requests go through Power Platform connectors via the library — [Architecture](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture). The library gets a per-user "dynamic resource token" for Dataverse from the host — [`runtimeDataClient.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/runtimeClient/runtimeDataClient.d.ts). `getContext().user.systemUserId` is the "ID of the current user's systemuser row in the linked Dataverse environment" — [`App.Types.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/app/App.Types.d.ts).
- Sharing the app: `pa app share --principal <emails or Entra object IDs> [--access play|edit]`; for service principals use the Enterprise Application object ID — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli). Custom request-access text "doesn't grant access or change app permissions" — [Configure hosting/header/access text](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration).
- Template roles: "Use App Opener role, which has the minimum privileges to run an app. Use Basic User role for the minimum privileges and including privileges to the core business tables" — [Security roles and privileges](https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges).
- Table privileges: Create, Read, Write, Delete, Append, Append To, Assign, Share. Access levels: Organization, Parent:Child BU, Business Unit, User, None. Privileges across roles are cumulative. Preset permission sets: No Access, Full Access, Collaborate, Private, Reference — [Security roles and privileges](https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges).
- Member's privilege inheritance: "Team privileges only" vs "Direct User (Basic) access level and Team privileges" (the default for new roles) — [Security roles and privileges](https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges).
- Entra group teams: Security and Microsoft 365 groups (Assigned or Dynamic User membership); "Team members are dynamically derived… when they access the environment"; new users are "created in the environment under the root business unit"; membership changes are cached at sign-in and refresh "after 8 hours of continuous sign in"; a group team can own records; "If your environment has a security group, you need to add the group team's Microsoft Entra group as a member of that security group" — [Manage group teams](https://learn.microsoft.com/en-us/power-platform/admin/manage-group-teams).
- Flows need the App Opener role "or an equivalent role" for end users — [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows).
- A community pattern for code apps: link an Entra security group to a Dataverse team, assign the security role to that team, and share the code app with that team — [Rajeev Pentyala, 3 Sep 2026](https://rajeevpentyala.com/2026/09/03/microsoft-entra-access-package-automate-power-apps-code-app-access/) (community).

### Inferences
- Because every call carries the user's identity, any rule the app enforces only in the browser (e.g. "only schedulers may publish") can be bypassed by a user who calls the same endpoints, for example through the browser console using the library. Data that matters (OIL, the published record, permissions) needs Dataverse-side protection: security-role scope (User vs Organization), column security on sensitive columns, or writes routed through a custom API or flow that checks the app role server-side.
- With one Entra group and app-held roles, the simplest Dataverse design is one custom role ("Raptor user"), organization-level Read on shared tables, with Write/Create/Delete as tight as the app's model allows. Schedulers' extra powers need a second Entra group and team, or server-side checks.
- Auditing: turn on Dataverse auditing per table for a server-side change history. It costs log capacity. Not researched in detail.

### Gaps
- No page explicitly states "Basic User grants nothing on custom tables". The Learn wording only says it covers core business tables. Confirm in the target environment.
- Column-level security, business-unit design (modernized business units) and auditing settings weren't fetched in detail.
- No official code-apps page on Dataverse permissions beyond "share the app" and the flows App Opener note.

## 7. Capacity and storage: file/image columns vs SharePoint, elastic tables, Dataverse search

### Takeaway
File and image columns live in Dataverse **file capacity** (128 MB per upload through the library; image columns at most 30 MB). The default environment has 3 GB database / 3 GB file / 1 GB log. A tenant in overage loses environment lifecycle operations at once, and sandboxes go to admin mode at 30 days and are disabled at 90. SharePoint storage is separate and cheaper, but reaching it from the app needs the SharePoint connector (per-user). Elastic tables are supported (via `partitionId`); Dataverse search isn't exposed by the library.

### Cited Findings
- File storage holds attachments and "Any custom or out-of-the-box table that has columns of datatype file or image (full size)"; the database keeps the attributes needed to reach the files — [Dataverse capacity storage](https://learn.microsoft.com/en-us/power-platform/admin/capacity-storage).
- "The default environment has the following included storage capacity: 3 GB Dataverse database capacity, 3 GB Dataverse file capacity, and 1 GB Dataverse log capacity" — [Dataverse capacity storage](https://learn.microsoft.com/en-us/power-platform/admin/capacity-storage).
- Borrowing: database can offset log or file overage; log can offset file; file can't offset others. Overage lifecycle: Stage 1 at T0 blocks create/copy/restore environment; Stage 2 at 30 days puts affected sandboxes in admin mode; Stage 3 at 90 days disables affected sandboxes ("Affected environments are sandbox environments that don't have pay-as-you-go billing enabled"). Notifications fire under 15% and 5% remaining — [Dataverse capacity storage](https://learn.microsoft.com/en-us/power-platform/admin/capacity-storage).
- Library upload limits: "maximum size 128 MB"; "For file columns the limit is 128 MB or the column's MaxSizeInKB setting, whichever is lower. For image columns the maximum configurable size is 30 MB" — [`uploadRecord.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/api/uploadRecord.d.ts), [`runtimeDataClient.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/runtimeClient/runtimeDataClient.d.ts).
- Elastic tables: `partitionId` on update, delete and file operations — [`Data.types.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/data/Data.types.d.ts).
- Dataverse search uses `api/search`, not `api/data`, and has "a throttling limit of one request per second for each user" — [Service protection API limits](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/api-limits).
- Don't store sensitive data in the compiled app: assets are served from "a publicly accessible endpoint" — [Configure hosting/header/access text](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration).

### Inferences
- For a scheduling/leave app with mostly small rows, database capacity matters more than file capacity. Keep files (briefing packs, scans) in SharePoint via the connector, or keep Dataverse file columns small. Avoid large JSON blobs in text columns, which use database capacity, the most expensive kind.
- Elastic tables (Cosmos-backed) suit high-volume logs, such as an audit or change-history table, but they have limits on relationships and transactions. Not needed for about 45 normal tables.
- The library has no Dataverse search API, so search would need `filter` with `contains()` / `startswith()`.

### Gaps
- Per-licence capacity accruals (the figures usually quoted from the licensing guide — tenant base database and file capacity plus per-Premium-user additions) weren't on the page fetched and weren't verified this session.
- Whether a production environment (not sandbox) goes through Stage 2/3 isn't stated in the excerpt; the table names sandboxes.

## 8. Testing: mocking, local runs and CI

### Takeaway
The npm package ships a **mock data executor** (`createMockDataExecutor` from `@microsoft/power-apps/data/executors`), but it only answers `retrieveRecordAsync` and `retrieveMultipleRecordsAsync`, ignoring filter, sort and paging. Every write returns `success: false`. Real data needs `pa app run`, signed in, in the user's browser profile. So CI should mock behind the team's own storage adapter, not at the library level.

### Cited Findings
- Exports: `createMockDataExecutor(data: MockDataStore)` and type `IDataOperationExecutor` from `./data/executors`; `MockDataStore = { [tableName]: { [id]: TRecord } }` — [`dist/data/executors/index.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/data/executors/index.d.ts), [`mockDataOperationExecutor.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/data/executors/mockDataOperationExecutor.d.ts).
- The mock implementation returns `{ success: false, error: { message: 'createRecordAsync is not supported by MockDataOperationExecutor' } }` for create, update, delete, file operations and `executeAsync`. `retrieveMultipleRecordsAsync` returns `Object.values(store[table])` and ignores options; saved queries and `nextLink` are refused — [`mockDataOperationExecutor.js`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/internal/data/core/data/executors/mockDataOperationExecutor.js).
- `setDataOperationExecutor(override: IDataOperationExecutor)` and `getDataOperationExecutor()` are declared in `powerAppsData.d.ts`, but the public `./data` entry re-exports only `getClient` and the multi-select helpers — [`powerAppsData.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/data/powerAppsData.d.ts), [`dist/data/index.d.ts`](https://unpkg.com/@microsoft/power-apps@1.6.0/dist/data/index.d.ts).
- Local runs: `pa app run [--port <port>] [--local-app-url <url>]` starts "the Power Apps local host". Open "Local Play" "in the same browser profile that you use for your Power Platform tenant". Chrome and Edge "block requests from public origins to local endpoints by default", so a local-network-access permission may be needed — [Quickstart](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch), [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli).
- CI publishing: `pa app push --non-interactive` with a service principal; `pa app share` with `edit` for the principal — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli).

### Inferences
- Because the app already has one storage doorway, the best test design is: keep the existing in-browser store as the test and CI backend. Write the Dataverse adapter against an interface, and unit-test it with a hand-written fake of the generated services (or of `IDataOperationExecutor`) that records calls and simulates `success:false` / 429 results. Microsoft's mock is too thin for write paths.
- End-to-end tests against real Dataverse need an interactive Entra sign-in in a browser profile, which a headless CI runner can't do without a test account and stored credentials. Keep those as manual walks on a dev or test environment.

### Gaps
- No documented way to install the mock executor at runtime (since `setDataOperationExecutor` isn't on the public entry point), and no Microsoft guidance on unit-testing code apps.
- Whether `pa app run` sessions can be automated headlessly (for example with Playwright and a stored login) isn't documented.
