# Advanced Features

This page describes the advanced features of ABAP ADT API, including ABAP Test Cockpit (ATC), runtime tracing, and other advanced functionalities.

## ABAP Test Cockpit (ATC)

ABAP Test Cockpit (ATC) is a tool for analyzing the quality of ABAP code. Through the ABAP ADT API, you can run ATC checks and view the results.

### Retrieve ATC Customizing Information

```typescript
async atcCustomizing(): Promise<AtcCustomizing>
```

Retrieves ATC customizing information.

**Return value:**
- `AtcCustomizing`: ATC customizing information

**Example:**
```typescript
// Retrieve ATC customizing information
const customizing = await client.atcCustomizing();

console.log('ATC properties:');
customizing.properties.forEach(prop => {
  console.log(`- ${prop.name}: ${prop.value}`);
});

console.log('ATC exemption reasons:');
customizing.excemptions.forEach(ex => {
  console.log(`- ${ex.id}: ${ex.title} (Justification required: ${ex.justificationMandatory})`);
});
```

### Select ATC Check Variant

```typescript
async atcCheckVariant(variant: string): Promise<string>
```

Selects a variant to use for ATC checks.

**Parameters:**
- `variant`: Variant name

**Return value:**
- `string`: Result message

**Example:**
```typescript
// Select ATC check variant
const result = await client.atcCheckVariant('DEFAULT');
console.log('ATC check variant selection result:', result);
```

### Run ATC Check

```typescript
async createAtcRun(
  variant: string,
  mainUrl: string,
  maxResults: number = 100
): Promise<AtcRunResult>
```

Runs an ATC check.

**Parameters:**
- `variant`: Variant name
- `mainUrl`: Object URL
- `maxResults`: Maximum number of results (default: 100)

**Return value:**
- `AtcRunResult`: ATC run result

**Example:**
```typescript
// Run ATC check
const runResult = await client.createAtcRun(
  'DEFAULT',                             // Variant name
  '/sap/bc/adt/programs/programs/ZEXAMPLE', // Object URL
  100                                    // Maximum number of results
);

console.log('ATC check run result:');
console.log(`- ID: ${runResult.id}`);
console.log(`- Timestamp: ${new Date(runResult.timestamp * 1000).toISOString()}`);
console.log(`- Number of info items: ${runResult.infos.length}`);
```

### Retrieve ATC Results

```typescript
async atcWorklists(
  runResultId: string,
  timestamp?: number,
  usedObjectSet?: string,
  includeExempted: boolean = false
): Promise<AtcWorkList>
```

Retrieves ATC check result list.

**Parameters:**
- `runResultId`: Run result ID
- `timestamp`: Timestamp (optional)
- `usedObjectSet`: Used object set (optional)
- `includeExempted`: Whether to include exempted items (optional, default: false)

**Return value:**
- `AtcWorkList`: ATC work list

**Example:**
```typescript
// Run ATC check
const runResult = await client.createAtcRun(
  'DEFAULT',
  '/sap/bc/adt/programs/programs/ZEXAMPLE',
  100
);

// Retrieve ATC results
const worklist = await client.atcWorklists(
  runResult.id,            // Run result ID
  runResult.timestamp,     // Timestamp
  undefined,               // Object set
  false                    // Whether to include exempted items
);

console.log('ATC results:');
console.log(`- Number of objects: ${worklist.objects.length}`);

// Output results by object
worklist.objects.forEach(obj => {
  console.log(`Object: ${obj.name} (${obj.type})`);
  console.log(`- Number of findings: ${obj.findings.length}`);
  
  // Output findings
  obj.findings.forEach(finding => {
    console.log(`  - ${finding.checkTitle} (${finding.messageTitle})`);
    console.log(`    Location: ${finding.location.uri}, Line ${finding.location.range.start.line}`);
    console.log(`    Priority: ${finding.priority}`);
  });
});
```

### Retrieve ATC Users

```typescript
async atcUsers(): Promise<AtcUser[]>
```

Retrieves ATC user list.

**Return value:**
- `AtcUser[]`: Array of ATC users

**Example:**
```typescript
// Retrieve ATC users
const users = await client.atcUsers();

console.log('ATC users:');
users.forEach(user => {
  console.log(`- ${user.id}: ${user.title}`);
});
```

### ATC Exemption Proposal

```typescript
async atcExemptProposal(
  markerId: string
): Promise<AtcProposal | AtcProposalMessage>
```

Retrieves ATC exemption proposal.

**Parameters:**
- `markerId`: Marker ID

**Return value:**
- `AtcProposal | AtcProposalMessage`: ATC exemption proposal or message

**Example:**
```typescript
// Retrieve ATC results
const worklist = await client.atcWorklists(runResultId);

// Get exemption proposal for the first finding
if (worklist.objects.length > 0 && worklist.objects[0].findings.length > 0) {
  const finding = worklist.objects[0].findings[0];
  
  // Retrieve exemption proposal
  const proposal = await client.atcExemptProposal(finding.quickfixInfo);
  
  // Check if it's a message or proposal
  if (client.isProposalMessage(proposal)) {
    console.log(`Message: ${proposal.message} (${proposal.type})`);
  } else {
    console.log('Exemption proposal:');
    console.log(`- Package: ${proposal.package}`);
    console.log(`- Reason: ${proposal.reason}`);
    console.log(`- Justification: ${proposal.justification}`);
  }
}
```

### Request ATC Exemption

```typescript
async atcRequestExemption(
  proposal: AtcProposal
): Promise<AtcProposalMessage>
```

Requests an ATC exemption.

**Parameters:**
- `proposal`: ATC exemption proposal

**Return value:**
- `AtcProposalMessage`: ATC proposal message

**Example:**
```typescript
// Retrieve ATC results
const worklist = await client.atcWorklists(runResultId);

// Get exemption proposal for the first finding
if (worklist.objects.length > 0 && worklist.objects[0].findings.length > 0) {
  const finding = worklist.objects[0].findings[0];
  
  // Retrieve exemption proposal
  const proposal = await client.atcExemptProposal(finding.quickfixInfo);
  
  // Process if it's a proposal
  if (!client.isProposalMessage(proposal)) {
    // Modify proposal
    proposal.reason = 'FPOS';  // False Positive
    proposal.justification = 'The check rule does not apply in this case.';
    proposal.notify = 'never'; // No notification
    
    // Request exemption
    const result = await client.atcRequestExemption(proposal);
    console.log(`Exemption request result: ${result.message} (${result.type})`);
  }
}
```

### Change ATC Contact

```typescript
async atcContactUri(
  findingUri: string
): Promise<string>
```

Retrieves the contact URI for an ATC finding.

**Parameters:**
- `findingUri`: Finding URI

**Return value:**
- `string`: Contact URI

```typescript
async atcChangeContact(
  itemUri: string,
  userId: string
): Promise<void>
```

Changes the contact for an ATC item.

**Parameters:**
- `itemUri`: Item URI
- `userId`: User ID

**Example:**
```typescript
// Retrieve ATC results
const worklist = await client.atcWorklists(runResultId);

// Change contact for the first finding
if (worklist.objects.length > 0 && worklist.objects[0].findings.length > 0) {
  const finding = worklist.objects[0].findings[0];
  
  // Retrieve contact URI
  const contactUri = await client.atcContactUri(finding.uri);
  
  // Change contact
  await client.atcChangeContact(contactUri, 'DEVELOPER');
  console.log('Contact has been changed.');
}
```

## Runtime Tracing

You can analyze program execution using ABAP runtime tracing functionality.

### Retrieve Trace List

```typescript
async tracesList(user?: string): Promise<TraceResults>
```

Retrieves the trace list for a user.

**Parameters:**
- `user`: User ID (optional, default: current user)

**Return value:**
- `TraceResults`: Trace results

**Example:**
```typescript
// Retrieve trace list
const traces = await client.tracesList();

console.log(`Number of traces: ${traces.runs.length}`);
console.log(`Author: ${traces.author}`);
console.log(`Contributor: ${traces.contributor}`);

// Output trace information
traces.runs.forEach(run => {
  console.log(`Trace ID: ${run.id}`);
  console.log(`- Title: ${run.title}`);
  console.log(`- Published: ${run.published.toISOString()}`);
  console.log(`- Updated: ${run.updated.toISOString()}`);
  console.log(`- Object name: ${run.extendedData.objectName}`);
  console.log(`- State: ${run.extendedData.state.text}`);
});
```

### Retrieve Trace Request List

```typescript
async tracesListRequests(user?: string): Promise<TraceRequestList>
```

Retrieves the trace request list for a user.

**Parameters:**
- `user`: User ID (optional, default: current user)

**Return value:**
- `TraceRequestList`: Trace request list

**Example:**
```typescript
// Retrieve trace request list
const traceRequests = await client.tracesListRequests();

console.log(`Number of trace requests: ${traceRequests.requests.length}`);
console.log(`Title: ${traceRequests.title}`);
console.log(`Contributor: ${traceRequests.contributorName}`);

// Output request information
traceRequests.requests.forEach(request => {
  console.log(`Request ID: ${request.id}`);
  console.log(`- Title: ${request.title}`);
  console.log(`- Description: ${request.extendedData.description}`);
  console.log(`- Process type: ${request.extendedData.processType}`);
  console.log(`- Object type: ${request.extendedData.objectType}`);
});
```

### Retrieve Hit List

```typescript
async tracesHitList(
  id: string,
  withSystemEvents: boolean = false
): Promise<TraceHitList>
```

Retrieves the hit list for a trace.

**Parameters:**
- `id`: Trace ID
- `withSystemEvents`: Whether to include system events (optional, default: false)

**Return value:**
- `TraceHitList`: Hit list

**Example:**
```typescript
// Retrieve trace list
const traces = await client.tracesList();

// Retrieve hit list for the first trace
if (traces.runs.length > 0) {
  const hitList = await client.tracesHitList(traces.runs[0].id);
  
  console.log(`Number of hit items: ${hitList.entries.length}`);
  console.log(`Parent link: ${hitList.parentLink}`);
  
  // Output hit items
  hitList.entries.slice(0, 5).forEach((entry, index) => {
    console.log(`Hit item #${index + 1}:`);
    console.log(`- Description: ${entry.description}`);
    console.log(`- Hit count: ${entry.hitCount}`);
    console.log(`- Recursion depth: ${entry.recursionDepth}`);
    console.log(`- Gross time: ${entry.grossTime.time}ms (${entry.grossTime.percentage}%)`);
  });
}
```

### Retrieve Database Access

```typescript
async tracesDbAccess(
  id: string,
  withSystemEvents: boolean = false
): Promise<TraceDBAccessResponse>
```

Retrieves database access information for a trace.

**Parameters:**
- `id`: Trace ID
- `withSystemEvents`: Whether to include system events (optional, default: false)

**Return value:**
- `TraceDBAccessResponse`: Database access information

**Example:**
```typescript
// Retrieve trace list
const traces = await client.tracesList();

// Retrieve database access for the first trace
if (traces.runs.length > 0) {
  const dbAccess = await client.tracesDbAccess(traces.runs[0].id);
  
  console.log(`Number of DB access items: ${dbAccess.dbaccesses.length}`);
  console.log(`Number of tables: ${dbAccess.tables.length}`);
  
  // Output database access items
  dbAccess.dbaccesses.slice(0, 5).forEach((access, index) => {
    console.log(`DB access item #${index + 1}:`);
    console.log(`- Table name: ${access.tableName}`);
    console.log(`- Statement: ${access.statement}`);
    console.log(`- Type: ${access.type}`);
    console.log(`- Total count: ${access.totalCount}`);
    console.log(`- Buffered count: ${access.bufferedCount}`);
    console.log(`- Total time: ${access.accessTime.total}ms`);
  });
  
  // Output table information
  dbAccess.tables.slice(0, 5).forEach((table, index) => {
    console.log(`Table #${index + 1}:`);
    console.log(`- Name: ${table.name}`);
    console.log(`- Type: ${table.type}`);
    console.log(`- Description: ${table.description}`);
    console.log(`- Buffer mode: ${table.bufferMode}`);
    console.log(`- Package: ${table.package}`);
  });
}
```

### Retrieve Statements

```typescript
async tracesStatements(
  id: string,
  options: TraceStatementOptions = {}
): Promise<TraceStatementResponse>
```

Retrieves statement information for a trace.

**Parameters:**
- `id`: Trace ID
- `options`: Statement retrieval options (optional)
  - `id`: Statement ID
  - `withDetails`: Whether to include details
  - `autoDrillDownThreshold`: Auto drill-down threshold
  - `withSystemEvents`: Whether to include system events

**Return value:**
- `TraceStatementResponse`: Statement information

**Example:**
```typescript
// Retrieve trace list
const traces = await client.tracesList();

// Retrieve statements for the first trace
if (traces.runs.length > 0) {
  const statements = await client.tracesStatements(
    traces.runs[0].id,
    {
      withDetails: true,
      withSystemEvents: false
    }
  );
  
  console.log(`Number of statement items: ${statements.statements.length}`);
  console.log(`Include details: ${statements.withDetails}`);
  console.log(`Include system events: ${statements.withSysEvents}`);
  
  // Output statement items
  statements.statements.slice(0, 5).forEach((stmt, index) => {
    console.log(`Statement item #${index + 1}:`);
    console.log(`- ID: ${stmt.id}`);
    console.log(`- Description: ${stmt.description}`);
    console.log(`- Hit count: ${stmt.hitCount}`);
    console.log(`- Call level: ${stmt.callLevel}`);
    console.log(`- Gross time: ${stmt.grossTime.time}ms (${stmt.grossTime.percentage}%)`);
    
    // Output calling program information
    if (stmt.callingProgram) {
      console.log(`- Calling program:`);
      console.log(`  - Context: ${stmt.callingProgram.context}`);
      if (stmt.callingProgram.name) {
        console.log(`  - Name: ${stmt.callingProgram.name}`);
        console.log(`  - Type: ${stmt.callingProgram.type}`);
      }
    }
  });
}
```

### Set Trace Parameters

```typescript
async tracesSetParameters(
  parameters: TraceParameters
): Promise<string>
```

Sets trace parameters.

**Parameters:**
- `parameters`: Trace parameters

**Return value:**
- `string`: URI of the set parameters

**Example:**
```typescript
// Set trace parameters
const parametersUri = await client.tracesSetParameters({
  allMiscAbapStatements: true,     // All miscellaneous ABAP statements
  allProceduralUnits: true,        // All procedural units
  allInternalTableEvents: false,   // All internal table events
  allDynproEvents: false,          // All dynpro events
  description: 'Test trace',        // Description
  aggregate: true,                 // Aggregate
  explicitOnOff: false,            // Explicit on/off
  withRfcTracing: true,            // Include RFC tracing
  allSystemKernelEvents: false,    // All system kernel events
  sqlTrace: true,                  // SQL trace
  allDbEvents: true,               // All DB events
  maxSizeForTraceFile: 100,        // Maximum trace file size
  maxTimeForTracing: 600           // Maximum tracing time (seconds)
});

console.log(`Trace parameters URI: ${parametersUri}`);
```

### Create Trace Configuration

```typescript
async tracesCreateConfiguration(
  config: TracesCreationConfig
): Promise<TraceRequestList>
```

Creates a trace configuration.

**Parameters:**
- `config`: Trace creation configuration

**Return value:**
- `TraceRequestList`: Trace request list

**Example:**
```typescript
// Set parameters
const parametersUri = await client.tracesSetParameters({
  /* Parameter settings... */
});

// Create trace configuration
const requestList = await client.tracesCreateConfiguration({
  server: '*',                     // Server (all servers)
  description: 'URL trace',        // Description
  traceUser: client.username,      // Trace user
  traceClient: '*',                // Trace client
  processType: 'HTTP',             // Process type
  objectType: 'URL',               // Object type
  expires: new Date(Date.now() + 86400000), // Expires (1 day later)
  maximalExecutions: 10,           // Maximum executions
  parametersId: parametersUri      // Parameters ID
});

console.log('Trace configuration has been created.');
console.log(`Number of configuration requests: ${requestList.requests.length}`);
```

### Delete Trace Configuration

```typescript
async tracesDeleteConfiguration(id: string): Promise<void>
```

Deletes a trace configuration.

**Parameters:**
- `id`: Configuration ID

**Example:**
```typescript
// Retrieve trace request list
const traceRequests = await client.tracesListRequests();

// Delete the first request
if (traceRequests.requests.length > 0) {
  await client.tracesDeleteConfiguration(traceRequests.requests[0].id);
  console.log('Trace configuration has been deleted.');
}
```

### Delete Trace

```typescript
async tracesDelete(id: string): Promise<void>
```

Deletes a trace.

**Parameters:**
- `id`: Trace ID

**Example:**
```typescript
// Retrieve trace list
const traces = await client.tracesList();

// Delete the first trace
if (traces.runs.length > 0) {
  await client.tracesDelete(traces.runs[0].id);
  console.log('Trace has been deleted.');
}
```

## Table Content Management

### Retrieve Table Contents

```typescript
async tableContents(
  ddicEntityName: string,
  rowNumber: number = 100,
  decode: boolean = true,
  sqlQuery: string = ""
): Promise<QueryResult>
```

Retrieves the contents of an ABAP table.

**Parameters:**
- `ddicEntityName`: Table name
- `rowNumber`: Number of rows (default: 100)
- `decode`: Whether to decode values (default: true)
- `sqlQuery`: SQL query (optional)

**Return value:**
- `QueryResult`: Query result

**Example:**
```typescript
// Retrieve table contents
const result = await client.tableContents('SFLIGHT', 10);

console.log(`Number of columns: ${result.columns.length}`);
console.log(`Number of rows: ${result.values.length}`);

// Output column information
console.log('Columns:');
result.columns.forEach(column => {
  console.log(`- ${column.name} (${column.type}): ${column.description}`);
});

// Output the first row
if (result.values.length > 0) {
  console.log('First row:');
  const row = result.values[0];
  Object.entries(row).forEach(([key, value]) => {
    console.log(`- ${key}: ${value}`);
  });
}
```

### Run SQL Query

```typescript
async runQuery(
  sqlQuery: string,
  rowNumber: number = 100,
  decode: boolean = true
): Promise<QueryResult>
```

Runs an SQL query.

**Parameters:**
- `sqlQuery`: SQL query
- `rowNumber`: Number of rows (default: 100)
- `decode`: Whether to decode values (default: true)

**Return value:**
- `QueryResult`: Query result

**Example:**
```typescript
// Run SQL query
const result = await client.runQuery(
  'SELECT * FROM SFLIGHT WHERE CARRID = \'LH\' AND CONNID = \'0400\'',
  10
);

console.log(`Number of columns: ${result.columns.length}`);
console.log(`Number of rows: ${result.values.length}`);

// Output results
result.values.forEach((row, index) => {
  console.log(`Row #${index + 1}:`);
  Object.entries(row).forEach(([key, value]) => {
    console.log(`- ${key}: ${value}`);
  });
});
```

## CDS Related Features

### Retrieve CDS Annotation Definitions

```typescript
async annotationDefinitions(): Promise<string>
```

Retrieves CDS annotation definitions.

**Return value:**
- `string`: CDS annotation definitions

**Example:**
```typescript
// Retrieve CDS annotation definitions
const annotations = await client.annotationDefinitions();
console.log('CDS annotation definitions:', annotations);
```

### Retrieve DDIC Element

```typescript
async ddicElement(
  path: string | string[],
  getTargetForAssociation: boolean = false,
  getExtensionViews: boolean = true,
  getSecondaryObjects: boolean = true
): Promise<DdicElement>
```

Retrieves a DDIC element.

**Parameters:**
- `path`: Element path (single or array)
- `getTargetForAssociation`: Whether to include association targets (default: false)
- `getExtensionViews`: Whether to include extension views (default: true)
- `getSecondaryObjects`: Whether to include secondary objects (default: true)

**Return value:**
- `DdicElement`: DDIC element information

**Example:**
```typescript
// Retrieve DDIC element for a CDS view
const element = await client.ddicElement('ZCDS_VIEW_NAME');

console.log(`Element name: ${element.name}`);
console.log(`Element type: ${element.type}`);

// Output properties
if (element.properties.elementProps) {
  console.log('Element properties:');
  console.log(`- Data element: ${element.properties.elementProps.ddicDataElement}`);
  console.log(`- Data type: ${element.properties.elementProps.ddicDataType}`);
  console.log(`- Length: ${element.properties.elementProps.ddicLength}`);
}

// Output annotations
console.log('Annotations:');
element.properties.annotations.forEach(anno => {
  console.log(`- ${anno.key}: ${anno.value}`);
});

// Output child elements
console.log(`Number of child elements: ${element.children.length}`);
element.children.forEach((child, index) => {
  console.log(`Child #${index + 1}: ${child.name} (${child.type})`);
});
```

### DDIC Repository Access

```typescript
async ddicRepositoryAccess(
  path: string | string[]
): Promise<DdicObjectReference[]>
```

Retrieves DDIC repository access information.

**Parameters:**
- `path`: Access path (single or array)

**Return value:**
- `DdicObjectReference[]`: Array of DDIC object references

**Example:**
```typescript
// Retrieve DDIC repository access information for a CDS view
const references = await client.ddicRepositoryAccess('ZCDS_VIEW_NAME');

console.log(`Number of references: ${references.length}`);
references.forEach((ref, index) => {
  console.log(`Reference #${index + 1}:`);
  console.log(`- URI: ${ref.uri}`);
  console.log(`- Name: ${ref.name}`);
  console.log(`- Type: ${ref.type}`);
  console.log(`- Path: ${ref.path}`);
});
```

### Service Binding Operations

```typescript
async publishServiceBinding(
  name: string,
  version: string
): Promise<{ severity: string, shortText: string, longText: string }>
```

Publishes a service binding.

**Parameters:**
- `name`: Service name
- `version`: Service version

**Return value:**
- Publication result object

```typescript
async unpublishServiceBinding(
  name: string,
  version: string
): Promise<{ severity: string, shortText: string, longText: string }>
```

Unpublishes a service binding.

**Parameters:**
- `name`: Service name
- `version`: Service version

**Return value:**
- Unpublication result object

**Example:**
```typescript
// Publish service binding
const publishResult = await client.publishServiceBinding(
  'Z_SERVICE_BINDING',
  'ODATA\\V2'
);

console.log('Service binding publication result:');
console.log(`- Severity: ${publishResult.severity}`);
console.log(`- Title: ${publishResult.shortText}`);
console.log(`- Content: ${publishResult.longText}`);

// Unpublish service binding
const unpublishResult = await client.unpublishServiceBinding(
  'Z_SERVICE_BINDING',
  'ODATA\\V2'
);

console.log('Service binding unpublication result:');
console.log(`- Severity: ${unpublishResult.severity}`);
console.log(`- Title: ${unpublishResult.shortText}`);
console.log(`- Content: ${unpublishResult.longText}`);
```

## Complete Workflow Example

### ATC Analysis and Report Generation

The following example shows how to run an ATC check on an ABAP object, analyze the results, and generate a report:

```typescript
import { ADTClient } from 'abap-adt-api';

// ATC report generation function
async function generateAtcReport(client: ADTClient, objectUrl: string): Promise<string> {
  // 1. Retrieve ATC customizing information
  const customizing = await client.atcCustomizing();
  
  // 2. Select ATC check variant (use default)
  await client.atcCheckVariant('DEFAULT');
  
  // 3. Run ATC check
  console.log(`Running ATC check for ${objectUrl}...`);
  const runResult = await client.createAtcRun('DEFAULT', objectUrl, 1000);
  
  // 4. Retrieve ATC results
  const worklist = await client.atcWorklists(
    runResult.id,
    runResult.timestamp,
    undefined,
    false
  );
  
  // 5. Generate report
  let report = '# ABAP Test Cockpit (ATC) Analysis Report\n\n';
  
  // Run information
  report += '## Run Information\n\n';
  report += `- **Object:** ${objectUrl}\n`;
  report += `- **Run ID:** ${runResult.id}\n`;
  report += `- **Run Time:** ${new Date(runResult.timestamp * 1000).toISOString()}\n`;
  report += `- **Object Set:** ${worklist.usedObjectSet}\n`;
  report += `- **Complete Object Set:** ${worklist.objectSetIsComplete ? 'Yes' : 'No'}\n\n`;
  
  // Findings summary
  let totalObjects = worklist.objects.length;
  let totalFindings = 0;
  let findingsByPriority = {
    1: 0, // Very high
    2: 0, // High
    3: 0, // Medium
    4: 0  // Low
  };
  
  worklist.objects.forEach(obj => {
    totalFindings += obj.findings.length;
    obj.findings.forEach(finding => {
      findingsByPriority[finding.priority] = (findingsByPriority[finding.priority] || 0) + 1;
    });
  });
  
  report += '## Summary\n\n';
  report += `- **Number of objects checked:** ${totalObjects}\n`;
  report += `- **Total number of findings:** ${totalFindings}\n`;
  report += `- **Findings by priority:**\n`;
  report += `  - Very high (1): ${findingsByPriority[1] || 0}\n`;
  report += `  - High (2): ${findingsByPriority[2] || 0}\n`;
  report += `  - Medium (3): ${findingsByPriority[3] || 0}\n`;
  report += `  - Low (4): ${findingsByPriority[4] || 0}\n\n`;
  
  // Findings by object
  report += '## Findings by Object\n\n';
  
  worklist.objects.forEach(obj => {
    report += `### ${obj.name} (${obj.type})\n\n`;
    report += `- **Package:** ${obj.packageName}\n`;
    report += `- **Author:** ${obj.author}\n`;
    report += `- **Number of findings:** ${obj.findings.length}\n\n`;
    
    if (obj.findings.length === 0) {
      report += 'No findings\n\n';
    } else {
      report += '| Priority | Check | Message | Location |\n';
      report += '|---------|------|--------|------|\n';
      
      obj.findings.forEach(finding => {
        const priority = finding.priority === 1 ? 'Very high' : 
                        finding.priority === 2 ? 'High' : 
                        finding.priority === 3 ? 'Medium' : 'Low';
        
        const location = `${finding.location.range.start.line}:${finding.location.range.start.column}`;
        
        report += `| ${priority} | ${finding.checkTitle} | ${finding.messageTitle} | ${location} |\n`;
      });
      
      report += '\n';
    }
  });
  
  // Action plan
  report += '## Action Plan\n\n';
  report += 'It is recommended to address higher priority items first. Here is the recommended action plan:\n\n';
  
  if (findingsByPriority[1] > 0) {
    report += '### Items to Resolve Immediately (Very High Priority)\n\n';
    worklist.objects.forEach(obj => {
      obj.findings.filter(f => f.priority === 1).forEach(finding => {
        report += `- **${obj.name}:** ${finding.messageTitle} (line ${finding.location.range.start.line})\n`;
      });
    });
    report += '\n';
  }
  
  if (findingsByPriority[2] > 0) {
    report += '### Items to Resolve as Soon as Possible (High Priority)\n\n';
    worklist.objects.forEach(obj => {
      obj.findings.filter(f => f.priority === 2).forEach(finding => {
        report += `- **${obj.name}:** ${finding.messageTitle} (line ${finding.location.range.start.line})\n`;
      });
    });
    report += '\n';
  }
  
  return report;
}

// Usage example
async function atcAnalysisExample() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    const report = await generateAtcReport(
      client,
      '/sap/bc/adt/programs/programs/ZEXAMPLE_PROGRAM'
    );
    
    console.log('ATC report generation complete');
    
    // Output or save report
    console.log(report);
    
    // Save to file if file system is available
    // require('fs').writeFileSync('atc-report.md', report);
    
  } catch (error) {
    console.error('Error during ATC analysis:', error);
  } finally {
    await client.logout();
  }
}

atcAnalysisExample();
```

### Performance Tracing and Analysis

The following example shows how to trace and analyze the performance of an ABAP program:

```typescript
import { ADTClient } from 'abap-adt-api';

async function performanceTraceWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // 1. Set trace parameters
    console.log('Setting trace parameters...');
    const parametersUri = await client.tracesSetParameters({
      allMiscAbapStatements: true,
      allProceduralUnits: true,
      allInternalTableEvents: false,
      allDynproEvents: false,
      description: 'Performance Analysis Trace',
      aggregate: true,
      explicitOnOff: false,
      withRfcTracing: true,
      allSystemKernelEvents: false,
      sqlTrace: true,
      allDbEvents: true,
      maxSizeForTraceFile: 100,
      maxTimeForTracing: 600
    });
    
    // 2. Create trace configuration
    console.log('Creating trace configuration...');
    const requestList = await client.tracesCreateConfiguration({
      server: '*',
      description: 'Program Performance Trace',
      traceUser: client.username,
      traceClient: '*',
      processType: 'BATCH',
      objectType: 'REPORT',
      expires: new Date(Date.now() + 86400000), // Expires in 1 day
      maximalExecutions: 1,
      parametersId: parametersUri
    });
    
    console.log('Trace configuration has been created.');
    console.log('Now run the program to analyze...');
    console.log('After running, press Enter to analyze the results...');
    
    // Wait for user input (use appropriate method in actual implementation)
    // await new Promise(resolve => process.stdin.once('data', resolve));
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds for example
    
    // 3. Retrieve trace list
    console.log('Retrieving trace list...');
    const traces = await client.tracesList();
    
    if (traces.runs.length === 0) {
      console.log('No trace results. Make sure the program has been executed.');
      return;
    }
    
    // Select the most recent trace
    const latestTrace = traces.runs[0];
    console.log(`Trace result found: ${latestTrace.title}`);
    
    // 4. Analyze hit list
    console.log('Analyzing hit list...');
    const hitList = await client.tracesHitList(latestTrace.id);
    
    console.log(`Number of hit items: ${hitList.entries.length}`);
    
    // Output top 10 time consumers
    const topTimeConsumers = [...hitList.entries]
      .sort((a, b) => b.grossTime.time - a.grossTime.time)
      .slice(0, 10);
    
    console.log('Top time consumers:');
    topTimeConsumers.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.description}`);
      console.log(`   - Time: ${entry.grossTime.time}ms (${entry.grossTime.percentage}%)`);
      console.log(`   - Hit count: ${entry.hitCount}`);
    });
    
    // 5. Analyze database access
    console.log('Analyzing database access...');
    const dbAccess = await client.tracesDbAccess(latestTrace.id);
    
    console.log(`Number of database access items: ${dbAccess.dbaccesses.length}`);
    
    // Output top 5 DB access items
    const topDbAccesses = [...dbAccess.dbaccesses]
      .sort((a, b) => b.accessTime.total - a.accessTime.total)
      .slice(0, 5);
    
    console.log('Top database access items:');
    topDbAccesses.forEach((access, index) => {
      console.log(`${index + 1}. ${access.tableName} (${access.type})`);
      console.log(`   - Time: ${access.accessTime.total}ms`);
      console.log(`   - Total access count: ${access.totalCount}`);
      console.log(`   - Buffered count: ${access.bufferedCount}`);
    });
    
    // 6. Analyze statements
    console.log('Analyzing statements...');
    const statements = await client.tracesStatements(latestTrace.id, {
      withDetails: true
    });
    
    console.log(`Number of statement items: ${statements.statements.length}`);
    
    // Output top 5 statement items
    const topStatements = [...statements.statements]
      .sort((a, b) => b.grossTime.time - a.grossTime.time)
      .slice(0, 5);
    
    console.log('Top time-consuming statements:');
    topStatements.forEach((stmt, index) => {
      console.log(`${index + 1}. ${stmt.description}`);
      console.log(`   - Time: ${stmt.grossTime.time}ms (${stmt.grossTime.percentage}%)`);
      console.log(`   - Hit count: ${stmt.hitCount}`);
      console.log(`   - Call level: ${stmt.callLevel}`);
    });
    
    // 7. Performance optimization recommendations
    console.log('\nPerformance Optimization Recommendations:');
    
    // DB access optimization recommendations
    if (topDbAccesses.length > 0) {
      console.log('Database Access Optimization:');
      topDbAccesses.forEach((access, index) => {
        console.log(`- Consider optimizing "${access.tableName}" table access`);
        if (access.bufferedCount / access.totalCount < 0.5) {
          console.log(`  Improve table buffering. Current buffering ratio: ${Math.round(access.bufferedCount / access.totalCount * 100)}%`);
        }
      });
    }
    
    // Statement optimization recommendations
    if (topStatements.length > 0) {
      console.log('\nCode Optimization:');
      topStatements.forEach((stmt, index) => {
        console.log(`- Consider optimizing "${stmt.description}"`);
        if (stmt.hitCount > 100) {
          console.log(`  This statement is executed ${stmt.hitCount} times. Check for unnecessary calls within loops.`);
        }
      });
    }
    
    // 8. Clean up trace configuration
    console.log('Cleaning up trace configuration...');
    const traceRequests = await client.tracesListRequests();
    for (const request of traceRequests.requests) {
      await client.tracesDeleteConfiguration(request.id);
    }
    
    // 9. Delete trace (if needed)
    // await client.tracesDelete(latestTrace.id);
    
    console.log('Performance analysis complete.');
    
  } catch (error) {
    console.error('Error during performance tracing:', error);
  } finally {
    await client.logout();
  }
}

performanceTraceWorkflow();
```

## Notes

- ATC checks use a lot of system resources, so be careful when checking a large number of objects.
- Tracing functionality can impact system performance, so use it carefully in production systems.
- Publishing and unpublishing service bindings can affect transports.
- Running SQL queries directly affects the system, so it's safer to use only SELECT statements.
- Some advanced features may require specific SAP versions or specific permissions.