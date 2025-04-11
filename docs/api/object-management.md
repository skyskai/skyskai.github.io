# Object Management

This page explains how to explore and manage ABAP objects using the ABAP ADT API.

## Object Navigation

### Retrieve Node Contents

```typescript
async nodeContents(
  parent_type: NodeParents,
  parent_name?: string,
  user_name?: string,
  parent_tech_name?: string,
  rebuild_tree?: boolean,
  parentnodes?: number[]
): Promise<NodeStructure>
```

Retrieves the node structure of an ABAP Repository. You can explore the contents of packages, programs, function groups, etc.

**Parameters:**
- `parent_type`: Parent node type ('DEVC/K' (package), 'PROG/P' (program), 'FUGR/F' (function group), 'PROG/PI' (Include program))
- `parent_name`: Parent node name (optional)
- `user_name`: User name (optional)
- `parent_tech_name`: Parent node technical name (optional)
- `rebuild_tree`: Whether to rebuild the tree (optional)
- `parentnodes`: Array of parent node IDs (optional)

**Return value:**
- `NodeStructure`: Node structure information

**Example:**
```typescript
// Retrieve package contents
const packageContents = await client.nodeContents('DEVC/K', 'ZEXAMPLE_PKG');

// Output nodes
packageContents.nodes.forEach(node => {
  console.log(`${node.OBJECT_TYPE}: ${node.OBJECT_NAME}`);
});

// Retrieve function group contents
const functionGroupContents = await client.nodeContents('FUGR/F', 'ZEXAMPLE_FUGR');
```

### Search for Objects

```typescript
async searchObject(
  query: string,
  objType?: string,
  max: number = 100
): Promise<SearchResult[]>
```

Searches for ABAP objects using a pattern.

**Parameters:**
- `query`: Search query (can be case-sensitive, wildcards not added)
- `objType`: Object type filter (optional)
- `max`: Maximum number of results (default: 100)

**Return value:**
- `SearchResult[]`: Array of search results

**Example:**
```typescript
// Search for classes
const classes = await client.searchObject('ZCL_', 'CLAS');

// Search for all object types
const allObjects = await client.searchObject('ZEXAMPLE');

// Search for packages
const packages = await client.searchObject('Z*', 'DEVC');
```

### Find Object Path

```typescript
async findObjectPath(objectUrl: string): Promise<PathStep[]>
```

Finds the hierarchical path of an object.

**Parameters:**
- `objectUrl`: Object URL

**Return value:**
- `PathStep[]`: Array of path steps

**Example:**
```typescript
const path = await client.findObjectPath('/sap/bc/adt/programs/programs/ZEXAMPLE');

// Output path
path.forEach(step => {
  console.log(`${step['adtcore:type']}: ${step['adtcore:name']}`);
});
```

## Object Structure Retrieval

### Retrieve Object Structure

```typescript
async objectStructure(
  objectUrl: string,
  version?: ObjectVersion
): Promise<AbapObjectStructure>
```

Retrieves the structure of an ABAP object.

**Parameters:**
- `objectUrl`: Object URL
- `version`: Object version (one of 'active', 'inactive', 'workingArea', optional)

**Return value:**
- `AbapObjectStructure`: Object structure information

**Example:**
```typescript
// Retrieve program structure
const programStructure = await client.objectStructure('/sap/bc/adt/programs/programs/ZEXAMPLE');

// Retrieve class structure
const classStructure = await client.objectStructure('/sap/bc/adt/oo/classes/ZCL_EXAMPLE');

// Retrieve inactive version
const inactiveStructure = await client.objectStructure('/sap/bc/adt/programs/programs/ZEXAMPLE', 'inactive');
```

### Get Main Include

```typescript
static mainInclude(
  object: AbapObjectStructure,
  withDefault: boolean = true
): string
```

Gets the main include URL of an object.

**Parameters:**
- `object`: Object structure
- `withDefault`: Whether to include default value (default: true)

**Return value:**
- Main include URL

**Example:**
```typescript
const objectStructure = await client.objectStructure('/sap/bc/adt/oo/classes/ZCL_EXAMPLE');
const mainIncludeUrl = ADTClient.mainInclude(objectStructure);
```

### Get Class Includes

```typescript
static classIncludes(clas: AbapClassStructure): Map<classIncludes, string>
```

Gets all include URLs of a class.

**Parameters:**
- `clas`: Class structure

**Return value:**
- Map of include types and URLs

**Example:**
```typescript
const classStructure = await client.objectStructure('/sap/bc/adt/oo/classes/ZCL_EXAMPLE');
if (client.isClassStructure(classStructure)) {
  const includes = ADTClient.classIncludes(classStructure);
  
  // Main include URL
  console.log('Main:', includes.get('main'));
  
  // Definition include URL
  console.log('Definitions:', includes.get('definitions'));
  
  // Implementation include URL
  console.log('Implementations:', includes.get('implementations'));
  
  // Test class include URL (if exists)
  console.log('Test classes:', includes.get('testclasses'));
}
```

## Source Code Management

### Retrieve Source Code

```typescript
async getObjectSource(
  objectSourceUrl: string,
  options?: ObjectSourceOptions
): Promise<string>
```

Retrieves the source code of an object.

**Parameters:**
- `objectSourceUrl`: Source code URL
- `options`: Retrieval options (optional)
  - `version`: Object version (one of 'active', 'inactive', 'workingArea')
  - `gitUser`: Git username (only for ABAP Git objects)
  - `gitPassword`: Git password (only for ABAP Git objects)

**Return value:**
- Source code text

**Example:**
```typescript
// Retrieve object structure
const objectStructure = await client.objectStructure('/sap/bc/adt/programs/programs/ZEXAMPLE');

// Get main include URL
const sourceUrl = ADTClient.mainInclude(objectStructure);

// Retrieve source code
const source = await client.getObjectSource(sourceUrl);
console.log(source);

// Retrieve inactive version
const inactiveSource = await client.getObjectSource(sourceUrl, { version: 'inactive' });
```

### Modify Source Code

```typescript
async setObjectSource(
  objectSourceUrl: string,
  source: string,
  lockHandle: string,
  transport?: string
): Promise<void>
```

Modifies the source code of an object.

**Parameters:**
- `objectSourceUrl`: Source code URL
- `source`: New source code
- `lockHandle`: Lock handle (obtained from object lock)
- `transport`: Transport number (optional)

**Example:**
```typescript
// Retrieve object structure
const objectStructure = await client.objectStructure('/sap/bc/adt/programs/programs/ZEXAMPLE');
const sourceUrl = ADTClient.mainInclude(objectStructure);

// Retrieve current source
const currentSource = await client.getObjectSource(sourceUrl);

// Lock object
const lock = await client.lock(objectStructure.objectUrl);

// Modify source code
const newSource = currentSource + '\n* Comment added';
await client.setObjectSource(sourceUrl, newSource, lock.LOCK_HANDLE);

// Release object lock
await client.unLock(objectStructure.objectUrl, lock.LOCK_HANDLE);
```

## Object Lock Management

### Lock Object

```typescript
async lock(
  objectUrl: string,
  accessMode: string = "MODIFY"
): Promise<AdtLock>
```

Locks an object.

**Parameters:**
- `objectUrl`: Object URL
- `accessMode`: Access mode (default: "MODIFY")

**Return value:**
- `AdtLock`: Lock information

**Example:**
```typescript
// Lock object
const lock = await client.lock('/sap/bc/adt/programs/programs/ZEXAMPLE');
console.log('Lock handle:', lock.LOCK_HANDLE);
```

### Release Object Lock

```typescript
async unLock(
  objectUrl: string,
  lockHandle: string
): Promise<void>
```

Releases an object lock.

**Parameters:**
- `objectUrl`: Object URL
- `lockHandle`: Lock handle

**Example:**
```typescript
// Release object lock
await client.unLock('/sap/bc/adt/programs/programs/ZEXAMPLE', lockHandle);
```

## Object Activation

### Activate Object

```typescript
async activate(
  object: InactiveObject | InactiveObject[],
  preauditRequested?: boolean
): Promise<ActivationResult>

async activate(
  objectName: string,
  objectUrl: string,
  mainInclude?: string,
  preauditRequested?: boolean
): Promise<ActivationResult>
```

Activates an object.

**Parameters:**
- `object` / `objectName`: Object to activate or object name
- `objectUrl`: Object URL
- `mainInclude`: Main include (optional)
- `preauditRequested`: Whether pre-audit is requested (optional)

**Return value:**
- `ActivationResult`: Activation result

**Example:**
```typescript
// Activate using object name and URL
const result = await client.activate('ZEXAMPLE', '/sap/bc/adt/programs/programs/ZEXAMPLE');

if (result.success) {
  console.log('Activation successful');
} else {
  console.log('Activation failed:', result.messages);
  
  // List of inactive objects
  console.log('Inactive objects:', result.inactive);
}
```

### Retrieve Inactive Objects

```typescript
async inactiveObjects(): Promise<InactiveObjectRecord[]>
```

Retrieves all inactive objects in the system.

**Return value:**
- `InactiveObjectRecord[]`: List of inactive objects

**Example:**
```typescript
const inactive = await client.inactiveObjects();
console.log(`Number of inactive objects: ${inactive.length}`);

// Output inactive object information
inactive.forEach(record => {
  if (record.object) {
    console.log(`${record.object["adtcore:type"]}: ${record.object["adtcore:name"]}`);
  }
});
```

## Object Creation and Deletion

### Create Object

```typescript
async createObject(
  objtype: CreatableTypeIds,
  name: string,
  parentName: string,
  description: string,
  parentPath: string,
  responsible?: string,
  transport?: string
): Promise<void>

async createObject(options: NewObjectOptions): Promise<void>
```

Creates a new ABAP object.

**Parameters (first form):**
- `objtype`: Object type (PROG/P, CLAS/OC, etc.)
- `name`: Object name
- `parentName`: Parent name (package, etc.)
- `description`: Object description
- `parentPath`: Parent path
- `responsible`: Person responsible (optional)
- `transport`: Transport number (optional)

**Parameters (second form):**
- `options`: Object creation options

**Example:**
```typescript
// Create a new program
await client.createObject(
  'PROG/P',              // Object type: Program
  'ZEXAMPLE_PROGRAM',    // Name
  'ZEXAMPLE_PKG',        // Package
  'Example Program',     // Description
  '/sap/bc/adt/packages/ZEXAMPLE_PKG', // Package path
  'DEVELOPER',           // Responsible
  'DEVK900000'           // Transport
);

// Create test include
await client.createTestInclude(
  'ZCL_EXAMPLE_CLASS',   // Class name
  lockHandle,            // Lock handle
  'DEVK900000'           // Transport
);
```

### Delete Object

```typescript
async deleteObject(
  objectUrl: string,
  lockHandle: string,
  transport?: string
): Promise<void>
```

Deletes an object.

**Parameters:**
- `objectUrl`: Object URL
- `lockHandle`: Lock handle
- `transport`: Transport number (optional)

**Example:**
```typescript
// Lock object
const lock = await client.lock('/sap/bc/adt/programs/programs/ZEXAMPLE');

// Delete object
await client.deleteObject('/sap/bc/adt/programs/programs/ZEXAMPLE', lock.LOCK_HANDLE, 'DEVK900000');
```

## Example: Object Management Workflow

The following example demonstrates a typical workflow for object management:

```typescript
import { ADTClient } from 'abap-adt-api';

async function objectManagementWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // Set stateful session (required)
    client.stateful = "stateful";
    
    // 1. Retrieve package contents
    const packageContents = await client.nodeContents('DEVC/K', 'ZEXAMPLE_PKG');
    console.log(`Number of objects in package: ${packageContents.nodes.length}`);
    
    // 2. Retrieve program structure
    const programUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE';
    const programStructure = await client.objectStructure(programUrl);
    
    // 3. Get source code URL
    const sourceUrl = ADTClient.mainInclude(programStructure);
    
    // 4. Retrieve current source code
    const currentSource = await client.getObjectSource(sourceUrl);
    console.log('Current source code length:', currentSource.length);
    
    // 5. Lock object
    const lock = await client.lock(programUrl);
    console.log('Lock handle:', lock.LOCK_HANDLE);
    
    // 6. Modify source code
    const newSource = currentSource + '\n* Modified: ' + new Date().toISOString();
    await client.setObjectSource(sourceUrl, newSource, lock.LOCK_HANDLE);
    console.log('Source code modified');
    
    // 7. Activate
    const activationResult = await client.activate(
      programStructure.metaData['adtcore:name'],
      programUrl
    );
    
    if (activationResult.success) {
      console.log('Activation successful');
    } else {
      console.log('Activation failed:', activationResult.messages);
    }
    
    // 8. Release object lock
    await client.unLock(programUrl, lock.LOCK_HANDLE);
    console.log('Lock released');
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
  }
}

objectManagementWorkflow();
```

## Notes

- A stateful session (`client.stateful = "stateful"`) is always required to modify or delete objects.
- Always acquire a lock before modifying an object, and release the lock after completing your work.
- If activation fails, check the list of inactive objects and make necessary corrections.
- A transport is required when managing objects that are dependent on a package.