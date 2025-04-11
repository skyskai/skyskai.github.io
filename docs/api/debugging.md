# Debugging Features

This page explains how to remotely debug ABAP programs using the ABAP ADT API.

## Debugging Overview

Remote debugging through the ABAP ADT API implements the debugging functionality of ADT (ABAP Development Tools) programmatically. This allows you to perform the following tasks:

- Set up and listen for debug sessions
- Set and manage breakpoints
- Inspect variables in the program being debugged
- Control debugging steps (Step Into, Step Over, etc.)
- Examine the execution stack

## Debug Listener Management

### Query Debug Listeners

```typescript
async debuggerListeners(
  debuggingMode: "user",
  terminalId: string,
  ideId: string,
  user: string,
  checkConflict?: boolean
): Promise<DebugListenerError | undefined>

async debuggerListeners(
  debuggingMode: DebuggingMode,
  terminalId: string,
  ideId: string,
  user?: string,
  checkConflict?: boolean
): Promise<DebugListenerError | undefined>
```

Queries currently active debug listeners.

**Parameters:**
- `debuggingMode`: Debugging mode ('user' or 'terminal')
- `terminalId`: Terminal ID
- `ideId`: IDE ID
- `user`: User ID (required in user mode)
- `checkConflict`: Whether to check for conflicts (optional, default: true)

**Return value:**
- `DebugListenerError | undefined`: Error information if there's a conflict, otherwise undefined

**Example:**
```typescript
// Query debug listeners
const conflict = await client.debuggerListeners(
  'user',             // User mode
  'terminal-id-123',  // Terminal ID
  'ide-id-456',       // IDE ID
  'DEVELOPER',        // User ID
  true                // Check for conflicts
);

if (conflict) {
  console.log('Debug listener conflict occurred:');
  console.log(`- Type: ${conflict.type}`);
  console.log(`- Message: ${conflict.message.text}`);
} else {
  console.log('No active debug listeners.');
}
```

### Start Debug Listener

```typescript
async debuggerListen(
  debuggingMode: "user",
  terminalId: string,
  ideId: string,
  user: string,
  checkConflict?: boolean,
  isNotifiedOnConflict?: boolean
): Promise<DebugListenerError | Debuggee | undefined>

async debuggerListen(
  debuggingMode: DebuggingMode,
  terminalId: string,
  ideId: string,
  user?: string,
  checkConflict?: boolean,
  isNotifiedOnConflict?: boolean
): Promise<DebugListenerError | Debuggee | undefined>
```

Starts a debug listener and waits for debug events.

**Parameters:**
- `debuggingMode`: Debugging mode ('user' or 'terminal')
- `terminalId`: Terminal ID
- `ideId`: IDE ID
- `user`: User ID (required in user mode)
- `checkConflict`: Whether to check for conflicts (optional, default: true)
- `isNotifiedOnConflict`: Whether to notify on conflicts (optional, default: true)

**Return value:**
- `DebugListenerError | Debuggee | undefined`: Error information if there's a conflict, debuggee information if a debug event occurs, undefined if it times out

**Important:** This method blocks until a debug event occurs or it times out.

**Example:**
```typescript
// Start debug listener
console.log('Starting debug listener...');
const result = await client.debuggerListen(
  'user',             // User mode
  'terminal-id-123',  // Terminal ID
  'ide-id-456',       // IDE ID
  'DEVELOPER',        // User ID
  true,               // Check for conflicts
  true                // Notify on conflicts
);

if (!result) {
  console.log('Debug listener timed out.');
} else if ('type' in result) {
  // DebugListenerError
  console.log('Debug listener conflict occurred:');
  console.log(`- Type: ${result.type}`);
  console.log(`- Message: ${result.message.text}`);
} else {
  // Debuggee
  console.log('Debug event occurred:');
  console.log(`- Program: ${result.PRG_CURR}`);
  console.log(`- Include: ${result.INCL_CURR}`);
  console.log(`- Line: ${result.LINE_CURR}`);
  console.log(`- User: ${result.DEBUGGEE_USER}`);
}
```

### Stop Debug Listener

```typescript
async debuggerDeleteListener(
  debuggingMode: "user",
  terminalId: string,
  ideId: string,
  user: string
): Promise<void>

async debuggerDeleteListener(
  debuggingMode: DebuggingMode,
  terminalId: string,
  ideId: string,
  user?: string
): Promise<void>
```

Stops an active debug listener.

**Parameters:**
- `debuggingMode`: Debugging mode ('user' or 'terminal')
- `terminalId`: Terminal ID
- `ideId`: IDE ID
- `user`: User ID (required in user mode)

**Example:**
```typescript
// Stop debug listener
await client.debuggerDeleteListener(
  'user',             // User mode
  'terminal-id-123',  // Terminal ID
  'ide-id-456',       // IDE ID
  'DEVELOPER'         // User ID
);
console.log('Debug listener has been stopped.');
```

## Breakpoint Management

### Set Breakpoints

```typescript
async debuggerSetBreakpoints(
  debuggingMode: "user",
  terminalId: string,
  ideId: string,
  clientId: string,
  breakpoints: (string | DebugBreakpoint)[],
  user: string,
  scope?: DebuggerScope,
  systemDebugging?: boolean,
  deactivated?: boolean,
  syncScopeUri?: string
): Promise<(DebugBreakpoint | DebugBreakpointError)[]>

async debuggerSetBreakpoints(
  debuggingMode: DebuggingMode,
  terminalId: string,
  ideId: string,
  clientId: string,
  breakpoints: (string | DebugBreakpoint)[],
  user?: string,
  scope?: DebuggerScope,
  systemDebugging?: boolean,
  deactivated?: boolean,
  syncScopeUri?: string
): Promise<(DebugBreakpoint | DebugBreakpointError)[]>
```

Sets breakpoints for debugging.

**Parameters:**
- `debuggingMode`: Debugging mode ('user' or 'terminal')
- `terminalId`: Terminal ID
- `ideId`: IDE ID
- `clientId`: Client ID
- `breakpoints`: Array of breakpoints (URL strings or breakpoint objects)
- `user`: User ID (required in user mode)
- `scope`: Debugger scope ('external' or 'debugger', default: 'external')
- `systemDebugging`: Whether to enable system debugging (optional, default: false)
- `deactivated`: Whether breakpoints are deactivated (optional, default: false)
- `syncScopeUri`: Synchronization scope URI (optional)

**Return value:**
- `(DebugBreakpoint | DebugBreakpointError)[]`: Set breakpoints or error information

**Example:**
```typescript
// Set breakpoints
const breakpoints = await client.debuggerSetBreakpoints(
  'user',             // User mode
  'terminal-id-123',  // Terminal ID
  'ide-id-456',       // IDE ID
  'client-id-789',    // Client ID
  [
    // Set breakpoint using a simple URL
    '/sap/bc/adt/programs/programs/ZEXAMPLE#start=10,0',
    
    // Set using a breakpoint object
    {
      kind: 'line',
      clientId: 'bp-1',
      uri: {
        uri: '/sap/bc/adt/oo/classes/ZCL_EXAMPLE/source/main',
        range: {
          start: { line: 20, column: 0 },
          end: { line: 20, column: 0 }
        }
      }
    }
  ],
  'DEVELOPER',        // User ID
  'external',         // Scope
  false,              // System debugging
  false,              // Deactivated
  ''                  // Synchronization scope URI
);

// Check set breakpoints
breakpoints.forEach(bp => {
  if ('uri' in bp) {
    // Success
    console.log(`Breakpoint set: ${bp.id}`);
    console.log(`- URI: ${bp.uri.uri}`);
    console.log(`- Line: ${bp.uri.range.start.line}`);
  } else {
    // Error
    console.log(`Breakpoint error: ${bp.errorMessage}`);
  }
});
```

### Delete Breakpoints

```typescript
async debuggerDeleteBreakpoints(
  breakpoint: DebugBreakpoint,
  debuggingMode: "user",
  terminalId: string,
  ideId: string,
  requestUser: string,
  scope?: DebuggerScope
): Promise<void>

async debuggerDeleteBreakpoints(
  breakpoint: DebugBreakpoint,
  debuggingMode: DebuggingMode,
  terminalId: string,
  ideId: string,
  requestUser?: string,
  scope?: DebuggerScope
): Promise<void>
```

Deletes a set breakpoint.

**Parameters:**
- `breakpoint`: Breakpoint to delete
- `debuggingMode`: Debugging mode ('user' or 'terminal')
- `terminalId`: Terminal ID
- `ideId`: IDE ID
- `requestUser`: User ID (required in user mode)
- `scope`: Debugger scope ('external' or 'debugger', default: 'external')

**Example:**
```typescript
// Set breakpoints
const breakpoints = await client.debuggerSetBreakpoints(/* ... */);

// Delete the first set breakpoint
if (breakpoints.length > 0 && 'uri' in breakpoints[0]) {
  await client.debuggerDeleteBreakpoints(
    breakpoints[0],      // Breakpoint
    'user',              // User mode
    'terminal-id-123',   // Terminal ID
    'ide-id-456',        // IDE ID
    'DEVELOPER',         // User ID
    'external'           // Scope
  );
  console.log(`Breakpoint deleted: ${breakpoints[0].id}`);
}
```

## Debug Session Control

### Attach to Debuggee

```typescript
async debuggerAttach(
  debuggingMode: "user",
  debuggeeId: string,
  user: string,
  dynproDebugging?: boolean
): Promise<DebugAttach>

async debuggerAttach(
  debuggingMode: DebuggingMode,
  debuggeeId: string,
  user?: string,
  dynproDebugging?: boolean
): Promise<DebugAttach>
```

Attaches to a debuggee.

**Parameters:**
- `debuggingMode`: Debugging mode ('user' or 'terminal')
- `debuggeeId`: Debuggee ID
- `user`: User ID (required in user mode)
- `dynproDebugging`: Whether to enable dynamic program debugging (optional, default: false)

**Return value:**
- `DebugAttach`: Debug attachment information

**Example:**
```typescript
// Get debuggee information via debug listener
const debuggee = await client.debuggerListen(/* ... */);

// Verify and attach
if (debuggee && !('type' in debuggee)) {
  // Attach to debuggee
  const attachInfo = await client.debuggerAttach(
    'user',             // User mode
    debuggee.DEBUGGEE_ID, // Debuggee ID
    'DEVELOPER',        // User ID
    true                // Dynamic program debugging
  );
  
  console.log('Attached to debuggee:');
  console.log(`- Session ID: ${attachInfo.debugSessionId}`);
  console.log(`- Session title: ${attachInfo.sessionTitle}`);
  console.log(`- Stepping possible: ${attachInfo.isSteppingPossible}`);
  
  // Check reached breakpoints
  if (attachInfo.reachedBreakpoints && attachInfo.reachedBreakpoints.length > 0) {
    console.log('Reached breakpoints:');
    attachInfo.reachedBreakpoints.forEach(bp => {
      console.log(`- ID: ${bp.id}`);
    });
  }
}
```

### Save Debugger Settings

```typescript
async debuggerSaveSettings(
  settings: Partial<DebugSettings>
): Promise<DebugSettings>
```

Saves debugger settings.

**Parameters:**
- `settings`: Debugger settings (partial)

**Return value:**
- `DebugSettings`: Saved settings

**Example:**
```typescript
// Save debugger settings
const settings = await client.debuggerSaveSettings({
  systemDebugging: true,           // System debugging
  createExceptionObject: true,     // Create exception object
  backgroundRFC: false,            // Background RFC
  sharedObjectDebugging: false,    // Shared object debugging
  showDataAging: true,             // Show data aging
  updateDebugging: false           // Update debugging
});

console.log('Debugger settings saved:', settings);
```

### Retrieve Stack Trace

```typescript
async debuggerStackTrace(
  semanticURIs: boolean = true
): Promise<DebugStackInfo>
```

Retrieves the current debugging stack trace.

**Parameters:**
- `semanticURIs`: Whether to use semantic URIs (default: true)

**Return value:**
- `DebugStackInfo`: Stack trace information

**Example:**
```typescript
// Retrieve stack trace
const stackInfo = await client.debuggerStackTrace(true);

console.log('Stack trace:');
console.log(`- RFC: ${stackInfo.isRfc}`);
console.log(`- Same system: ${stackInfo.isSameSystem}`);
console.log(`- Server: ${stackInfo.serverName}`);

// Output stack entries
stackInfo.stack.forEach((entry, index) => {
  console.log(`Stack entry #${index}:`);
  console.log(`- Program: ${entry.programName}`);
  console.log(`- Include: ${entry.includeName}`);
  console.log(`- Line: ${entry.line}`);
  console.log(`- Event: ${entry.eventType} - ${entry.eventName}`);
});
```

### Retrieve Variable Values

```typescript
async debuggerVariables(
  parents: string[]
): Promise<DebugVariable[]>
```

Retrieves debug variable values.

**Parameters:**
- `parents`: Array of parent variable IDs

**Return value:**
- `DebugVariable[]`: Array of variable information

**Example:**
```typescript
// Retrieve root variable values
const variables = await client.debuggerVariables(['@ROOT']);

console.log('Variables:');
variables.forEach(variable => {
  console.log(`- ${variable.NAME}: ${variable.VALUE} (Type: ${variable.META_TYPE})`);
  console.log(`  Declared type: ${variable.DECLARED_TYPE_NAME}`);
  console.log(`  Actual type: ${variable.ACTUAL_TYPE_NAME}`);
});
```

### Retrieve Child Variables

```typescript
async debuggerChildVariables(
  parent: string[] = ['@DATAAGING', '@ROOT']
): Promise<DebugChildVariablesInfo>
```

Retrieves debug child variable information.

**Parameters:**
- `parent`: Array of parent variable IDs (default: ['@DATAAGING', '@ROOT'])

**Return value:**
- `DebugChildVariablesInfo`: Child variable information

**Example:**
```typescript
// Retrieve child variables
const childInfo = await client.debuggerChildVariables(['@ROOT']);

console.log('Hierarchy:');
childInfo.hierarchies.forEach(h => {
  console.log(`- Parent: ${h.PARENT_ID}, Child: ${h.CHILD_ID} (${h.CHILD_NAME})`);
});

console.log('Variables:');
childInfo.variables.forEach(variable => {
  console.log(`- ${variable.NAME}: ${variable.VALUE} (Type: ${variable.META_TYPE})`);
});
```

### Set Variable Value

```typescript
async debuggerSetVariableValue(
  variableName: string,
  value: string
): Promise<string>
```

Sets a debug variable value.

**Parameters:**
- `variableName`: Variable name
- `value`: New value

**Return value:**
- `string`: Response message

**Example:**
```typescript
// Set variable value
const response = await client.debuggerSetVariableValue('LV_COUNT', '10');
console.log('Variable value set response:', response);
```

### Control Debugging Steps

```typescript
async debuggerStep(
  steptype: "stepRunToLine" | "stepJumpToLine",
  url: string
): Promise<DebugStep>

async debuggerStep(
  steptype: "stepInto" | "stepOver" | "stepReturn" | "stepContinue" | "terminateDebuggee"
): Promise<DebugStep>
```

Controls debugging steps.

**Parameters:**
- `steptype`: Step type
- `url`: Target URL (when using stepRunToLine or stepJumpToLine)

**Return value:**
- `DebugStep`: Debug step information

**Example:**
```typescript
// Step into
console.log('Stepping into...');
const stepIntoResult = await client.debuggerStep('stepInto');
console.log('Step into completed.');

// Step over
console.log('Stepping over...');
const stepOverResult = await client.debuggerStep('stepOver');
console.log('Step over completed.');

// Run to line
console.log('Running to line...');
const runToLineResult = await client.debuggerStep(
  'stepRunToLine',
  '/sap/bc/adt/programs/programs/ZEXAMPLE#start=20,0'
);
console.log('Run to line completed.');

// Continue execution
console.log('Continuing execution...');
const continueResult = await client.debuggerStep('stepContinue');
console.log('Continue completed.');

// Terminate debuggee
console.log('Terminating debuggee...');
const terminateResult = await client.debuggerStep('terminateDebuggee');
console.log('Terminate completed.');
```

### Navigate Stack Position

```typescript
async debuggerGoToStack(
  urlOrPosition: number | string
): Promise<void>
```

Navigates to a specific position in the stack trace.

**Parameters:**
- `urlOrPosition`: Stack URL or stack position number

**Example:**
```typescript
// Retrieve stack trace
const stackInfo = await client.debuggerStackTrace();

// Navigate to a specific position in the stack
if (stackInfo.stack.length > 1) {
  // Navigate by stack URL (if stackUri is available in DebugStackInfo)
  if ('stackUri' in stackInfo.stack[1]) {
    await client.debuggerGoToStack(stackInfo.stack[1].stackUri);
    console.log(`Navigated to stack position ${stackInfo.stack[1].stackPosition}.`);
  } 
  // Navigate by stack position number
  else {
    await client.debuggerGoToStack(1); // Navigate to the second stack entry
    console.log('Navigated to stack position 1.');
  }
}
```

## Complete Debugging Workflow Example

The following example demonstrates a typical workflow for ABAP debugging:

```typescript
import { ADTClient } from 'abap-adt-api';
import { v4 as uuidv4 } from 'uuid'; // Use uuid package to generate unique IDs

async function debuggingWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // Define IDs needed for debugging
    const terminalId = 'terminal-' + uuidv4();
    const ideId = 'ide-' + uuidv4();
    const clientId = 'client-' + uuidv4();
    const userId = client.username.toUpperCase();
    
    // 1. Set breakpoint
    console.log('Setting breakpoint...');
    const breakpointUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE#start=10,0';
    const breakpoints = await client.debuggerSetBreakpoints(
      'user',       // User mode
      terminalId,   // Terminal ID
      ideId,        // IDE ID
      clientId,     // Client ID
      [breakpointUrl], // Breakpoint URL
      userId        // User ID
    );
    
    if (breakpoints.length === 0 || !('uri' in breakpoints[0])) {
      console.log('Failed to set breakpoint');
      return;
    }
    
    const breakpoint = breakpoints[0];
    console.log(`Breakpoint set: ${breakpoint.id}`);
    
    // 2. Start debug listener
    console.log('Starting debug listener... (waiting for user to run ZEXAMPLE program)');
    const debuggee = await client.debuggerListen(
      'user',     // User mode
      terminalId, // Terminal ID
      ideId,      // IDE ID
      userId      // User ID
    );
    
    // Exit if no debug event
    if (!debuggee || 'type' in debuggee) {
      if (!debuggee) {
        console.log('Debug listener timed out');
      } else {
        console.log(`Debug listener error: ${debuggee.message.text}`);
      }
      
      // Clean up listener
      await client.debuggerDeleteListener('user', terminalId, ideId, userId);
      return;
    }
    
    console.log('Debug event occurred:');
    console.log(`- Program: ${debuggee.PRG_CURR}`);
    console.log(`- Include: ${debuggee.INCL_CURR}`);
    console.log(`- Line: ${debuggee.LINE_CURR}`);
    
    // 3. Attach to debuggee
    console.log('Attaching to debuggee...');
    const attachInfo = await client.debuggerAttach(
      'user',             // User mode
      debuggee.DEBUGGEE_ID, // Debuggee ID
      userId              // User ID
    );
    
    console.log('Attached to debuggee:');
    console.log(`- Session ID: ${attachInfo.debugSessionId}`);
    
    // 4. Configure debugger
    console.log('Configuring debugger...');
    await client.debuggerSaveSettings({
      systemDebugging: false,
      createExceptionObject: true
    });
    
    // 5. Retrieve stack trace
    console.log('Retrieving stack trace...');
    const stackInfo = await client.debuggerStackTrace();
    console.log('Stack trace:');
    stackInfo.stack.forEach((entry, index) => {
      console.log(`- Stack ${index}: ${entry.programName}, line ${entry.line}`);
    });
    
    // 6. Retrieve variables
    console.log('Retrieving variables...');
    const variables = await client.debuggerVariables(['@ROOT']);
    console.log('Variables:');
    variables.slice(0, 5).forEach(variable => { // Show only first 5
      console.log(`- ${variable.NAME}: ${variable.VALUE}`);
    });
    
    // 7. Perform step-by-step debugging
    console.log('Stepping into...');
    const stepResult = await client.debuggerStep('stepInto');
    console.log('Step into completed.');
    
    // 8. Retrieve variables again after moving
    console.log('Retrieving variables again after step...');
    const updatedVariables = await client.debuggerVariables(['@ROOT']);
    console.log('Updated variables:');
    updatedVariables.slice(0, 5).forEach(variable => { // Show only first 5
      console.log(`- ${variable.NAME}: ${variable.VALUE}`);
    });
    
    // 9. Change variable value (if available)
    if (variables.some(v => v.NAME === 'LV_COUNT')) {
      console.log('Changing LV_COUNT variable value...');
      await client.debuggerSetVariableValue('LV_COUNT', '10');
      console.log('Variable value changed.');
    }
    
    // 10. Continue execution
    console.log('Continuing execution...');
    await client.debuggerStep('stepContinue');
    console.log('Continue execution completed.');
    
    // 11. Terminate debugging
    console.log('Terminating debugging...');
    await client.debuggerStep('terminateDebuggee');
    console.log('Debugging terminated.');
    
    // 12. Remove breakpoint
    console.log('Removing breakpoint...');
    if ('uri' in breakpoint) {
      await client.debuggerDeleteBreakpoints(
        breakpoint,  // Breakpoint
        'user',      // User mode
        terminalId,  // Terminal ID
        ideId,       // IDE ID
        userId       // User ID
      );
      console.log('Breakpoint removed.');
    }
    
    // 13. Stop debug listener
    console.log('Stopping debug listener...');
    await client.debuggerDeleteListener('user', terminalId, ideId, userId);
    console.log('Debug listener stopped.');
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    await client.logout();
  }
}

debuggingWorkflow();
```

## Notes

- Debugging requires a high level of permissions and may be restricted depending on SAP system configuration.
- Debug listeners run for a long time, so you should consider network timeouts.
- Debugging in production systems can have a significant impact on performance, so use it with caution.
- Debug sessions use a lot of resources, so always clean up when your work is complete.
- Conflicts can occur if multiple developers debug the same user.
- Terminal ID and IDE ID must be unique, typically using UUIDs.
- Variables with complex object structures should be explored hierarchically using `debuggerChildVariables`.