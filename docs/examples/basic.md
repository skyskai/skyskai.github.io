# Basic Examples

This page provides examples demonstrating the basic functionality of the ABAP ADT API library.

## Table of Contents

- [System Connection and Basic Information Retrieval](#system-connection-and-basic-information-retrieval)
- [Object Structure Exploration](#object-structure-exploration)
- [Source Code Retrieval and Modification](#source-code-retrieval-and-modification)
- [Syntax Check and Activation](#syntax-check-and-activation)
- [Using Code Completion](#using-code-completion)
- [Object Creation](#object-creation)

## System Connection and Basic Information Retrieval

### Purpose

Shows how to connect to an SAP system and retrieve basic system information.

### Code

```typescript
// connect-and-info.ts
import { ADTClient } from 'abap-adt-api';

async function connectAndGetInfo() {
  // Create client
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password',
    '001',  // Client (optional)
    'KO'    // Language (optional)
  );
  
  try {
    // Login
    console.log('Logging in...');
    const loggedIn = await client.login();
    
    if (!loggedIn) {
      console.error('Login failed');
      return;
    }
    
    console.log('Login successful');
    console.log(`User: ${client.username}`);
    console.log(`Base URL: ${client.baseUrl}`);
    console.log(`Session ID: ${client.sessionID}`);
    
    // Retrieve system information
    console.log('\nRetrieving system information...');
    
    // 1. Query ADT discovery service
    const discovery = await client.adtDiscovery();
    console.log(`Number of workspaces discovered: ${discovery.length}`);
    
    discovery.forEach((workspace, index) => {
      console.log(`\nWorkspace #${index + 1}: ${workspace.title}`);
      console.log('Collections:');
      
      workspace.collection.forEach(collection => {
        console.log(`- ${collection.href}`);
        
        // Print template links
        if (collection.templateLinks && collection.templateLinks.length > 0) {
          console.log('  Template links:');
          collection.templateLinks.forEach(link => {
            console.log(`  - ${link.rel}: ${link.template}`);
          });
        }
      });
    });
    
    // 2. Query object types
    console.log('\nRetrieving object types...');
    const types = await client.objectTypes();
    
    console.log(`Number of object types discovered: ${types.length}`);
    console.log('Major object types:');
    
    types.slice(0, 10).forEach(type => {
      console.log(`- ${type.name}: ${type.description} (${type.type})`);
    });
    
    // 3. Query system users
    console.log('\nRetrieving system users...');
    const users = await client.systemUsers();
    
    console.log(`Number of users discovered: ${users.length}`);
    console.log('Sample users:');
    
    users.slice(0, 5).forEach(user => {
      console.log(`- ${user.id}: ${user.title}`);
    });
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    // Logout
    await client.logout();
    console.log('\nLogout completed');
  }
}

connectAndGetInfo().catch(console.error);
```

### Execution Results

```
Logging in...
Login successful
User: username
Base URL: https://your-sap-server.com
Session ID: SAP_SESSIONID_001_A1B2C3D4E5

Retrieving system information...
Number of workspaces discovered: 3

Workspace #1: ABAP
Collections:
- /sap/bc/adt/repository/nodestructure
  Template links:
  - http://www.sap.com/adt/relations/packagestructure: /sap/bc/adt/repository/nodestructure?parent_name={package_name}&parent_type=DEVC/K
...

Retrieving object types...
Number of object types discovered: 287
Major object types:
- PROG/P: ABAP Program (PROG)
- CLAS/OC: ABAP Class (CLAS)
...

Retrieving system users...
Number of users discovered: 124
Sample users:
- DEVELOPER: Developer
...

Logout completed
```

### How to Extend

- Explore other system information APIs to collect more data
- Run periodically to monitor system status
- Add user permission and role analysis

## Object Structure Exploration

### Purpose

Shows how to explore ABAP object structures and retrieve content of packages, programs, classes, etc.

### Code

```typescript
// explore-objects.ts
import { ADTClient } from 'abap-adt-api';

async function exploreObjects() {
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password'
  );
  
  try {
    await client.login();
    
    // 1. Retrieve package contents
    console.log('Retrieving package contents...');
    const packageName = 'ZEXAMPLE_PKG';
    const packageContents = await client.nodeContents('DEVC/K', packageName);
    
    console.log(`Number of objects in package '${packageName}': ${packageContents.nodes.length}`);
    console.log('Count by object type:');
    
    // Group by object type
    const typeGroups = packageContents.nodes.reduce((groups, node) => {
      const type = node.OBJECT_TYPE;
      groups[type] = (groups[type] || 0) + 1;
      return groups;
    }, {});
    
    Object.entries(typeGroups).forEach(([type, count]) => {
      console.log(`- ${type}: ${count}`);
    });
    
    // 2. Retrieve specific program structure
    console.log('\nRetrieving program structure...');
    const programName = 'ZEXAMPLE_PROGRAM';
    const programUrl = `/sap/bc/adt/programs/programs/${programName}`;
    
    const programStructure = await client.objectStructure(programUrl);
    
    console.log(`Program: ${programStructure.metaData['adtcore:name']}`);
    console.log(`Description: ${programStructure.metaData['adtcore:description']}`);
    console.log(`Type: ${programStructure.metaData['adtcore:type']}`);
    console.log(`Language: ${programStructure.metaData['adtcore:language']}`);
    console.log(`Responsible: ${programStructure.metaData['adtcore:responsible']}`);
    
    // Print program links
    console.log('Links:');
    programStructure.links.forEach(link => {
      console.log(`- ${link.rel}: ${link.href}`);
    });
    
    // 3. Retrieve class structure
    console.log('\nRetrieving class structure...');
    const className = 'ZCL_EXAMPLE_CLASS';
    const classUrl = `/sap/bc/adt/oo/classes/${className}`;
    
    const classStructure = await client.objectStructure(classUrl);
    
    // Verify if it's a class
    if (client.isClassStructure(classStructure)) {
      console.log(`Class: ${classStructure.metaData['adtcore:name']}`);
      console.log(`Description: ${classStructure.metaData['adtcore:description']}`);
      console.log(`Abstract: ${classStructure.metaData['class:abstract']}`);
      console.log(`Final: ${classStructure.metaData['class:final']}`);
      console.log(`Visibility: ${classStructure.metaData['class:visibility']}`);
      
      // Print class includes
      console.log('\nClass includes:');
      classStructure.includes.forEach(include => {
        console.log(`- ${include['class:includeType']}: ${include['adtcore:name']}`);
      });
      
      // Retrieve class components
      console.log('\nRetrieving class components...');
      const components = await client.classComponents(classUrl);
      
      // Print methods, attributes, etc.
      const methods = components.components.filter(c => c['adtcore:type'] === 'method');
      const attributes = components.components.filter(c => c['adtcore:type'] === 'attribute');
      
      console.log(`Number of methods: ${methods.length}`);
      console.log('Sample methods:');
      methods.slice(0, 5).forEach(method => {
        console.log(`- ${method['adtcore:name']} (Visibility: ${method.visibility})`);
      });
      
      console.log(`\nNumber of attributes: ${attributes.length}`);
      console.log('Sample attributes:');
      attributes.slice(0, 5).forEach(attr => {
        console.log(`- ${attr['adtcore:name']} (Visibility: ${attr.visibility})`);
      });
    }
    
    // 4. Find object path
    console.log('\nFinding object path...');
    const objectPath = await client.findObjectPath(classUrl);
    
    console.log(`Path for object '${className}':`);
    objectPath.forEach((step, index) => {
      const indent = ' '.repeat(index * 2);
      console.log(`${indent}${index + 1}. ${step['adtcore:type']}: ${step['adtcore:name']}`);
    });
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
  }
}

exploreObjects().catch(console.error);
```

### How to Extend

- Add recursive package exploration
- Filter to explore only specific types of objects
- Implement object dependency analysis

## Source Code Retrieval and Modification

### Purpose

Shows how to retrieve and modify source code of ABAP objects.

### Code

```typescript
// source-code-management.ts
import { ADTClient } from 'abap-adt-api';
import * as fs from 'fs';

async function manageSourceCode() {
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password'
  );
  
  try {
    await client.login();
    
    // Set stateful session (required for object locking)
    client.stateful = "stateful";
    
    // 1. Retrieve object structure
    const objectUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE_PROGRAM';
    console.log(`Retrieving object structure: ${objectUrl}`);
    
    const objectStructure = await client.objectStructure(objectUrl);
    console.log(`Object name: ${objectStructure.metaData['adtcore:name']}`);
    
    // 2. Get source code URL
    const sourceUrl = ADTClient.mainInclude(objectStructure);
    console.log(`Source code URL: ${sourceUrl}`);
    
    // 3. Retrieve source code
    console.log('Retrieving source code...');
    const source = await client.getObjectSource(sourceUrl);
    
    console.log(`Source code (first 100 chars): ${source.substring(0, 100)}...`);
    
    // Save source code to local file
    const localFilePath = './source_backup.abap';
    fs.writeFileSync(localFilePath, source);
    console.log(`Source code saved to ${localFilePath}`);
    
    // 4. Get transport information
    console.log('Retrieving transport information...');
    const transportInfo = await client.transportInfo(objectUrl);
    
    // Find available transport
    let transportNumber = '';
    if (transportInfo.TRANSPORTS && transportInfo.TRANSPORTS.length > 0) {
      transportNumber = transportInfo.TRANSPORTS[0].TRKORR;
      console.log(`Available transport: ${transportNumber} (${transportInfo.TRANSPORTS[0].AS4TEXT})`);
    } else {
      console.log('No available transport. Create a new transport if needed.');
      
      // Create new transport (commented out - uncomment if needed)
      /*
      transportNumber = await client.createTransport(
        objectUrl,
        'Source code modification',
        objectStructure.metaData['adtcore:packageName'] || 'ZEXAMPLE_PKG'
      );
      console.log(`New transport created: ${transportNumber}`);
      */
    }
    
    // 5. Lock object
    console.log('Locking object...');
    const lock = await client.lock(objectUrl);
    console.log(`Lock handle: ${lock.LOCK_HANDLE}`);
    
    // 6. Modify source code
    console.log('Modifying source code...');
    
    // Example: Add comment at the end of source
    const timestamp = new Date().toISOString();
    const modifiedSource = source + `\n\n* Modified by ADT API at ${timestamp}\n`;
    
    // 7. Save modified source code
    console.log('Saving modified source code...');
    await client.setObjectSource(
      sourceUrl,
      modifiedSource,
      lock.LOCK_HANDLE,
      transportNumber // Transport number (optional)
    );
    
    console.log('Source code has been saved.');
    
    // 8. Syntax check
    console.log('Performing syntax check...');
    const syntaxCheckResults = await client.syntaxCheck(
      objectUrl,
      sourceUrl,
      modifiedSource
    );
    
    if (syntaxCheckResults.length === 0) {
      console.log('No syntax errors found.');
    } else {
      console.log(`Syntax errors found: ${syntaxCheckResults.length}`);
      syntaxCheckResults.forEach(result => {
        console.log(`- ${result.line}:${result.offset} - ${result.severity}: ${result.text}`);
      });
    }
    
    // 9. Activate (if no syntax errors)
    if (syntaxCheckResults.length === 0) {
      console.log('Activating object...');
      const activationResult = await client.activate(
        objectStructure.metaData['adtcore:name'],
        objectUrl
      );
      
      if (activationResult.success) {
        console.log('Object successfully activated.');
      } else {
        console.log('Activation failed:');
        activationResult.messages.forEach(msg => {
          console.log(`- ${msg.type}: ${msg.shortText}`);
        });
      }
    }
    
    // 10. Unlock object
    console.log('Unlocking object...');
    await client.unLock(objectUrl, lock.LOCK_HANDLE);
    console.log('Object has been unlocked.');
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    // End stateful session and logout
    await client.logout();
    console.log('Logout completed');
  }
}

manageSourceCode().catch(console.error);
```

### How to Extend

- Add functionality to batch modify source code of multiple objects
- Implement source code backup and restore mechanism
- Add code formatting using Pretty Printer

## Syntax Check and Activation

### Purpose

Shows how to check syntax and activate ABAP objects.

### Code

```typescript
// syntax-check-activate.ts
import { ADTClient } from 'abap-adt-api';

async function checkAndActivate() {
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password'
  );
  
  try {
    await client.login();
    
    // Object URL to check
    const objectUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE_PROGRAM';
    
    // 1. Retrieve object structure
    console.log(`Retrieving object structure: ${objectUrl}`);
    const objectStructure = await client.objectStructure(objectUrl);
    
    // 2. Get source code URL
    const sourceUrl = ADTClient.mainInclude(objectStructure);
    
    // 3. Retrieve source code
    console.log('Retrieving source code...');
    const source = await client.getObjectSource(sourceUrl);
    console.log(`Source code length: ${source.length} characters`);
    
    // 4. Syntax check
    console.log('Performing syntax check...');
    const syntaxResults = await client.syntaxCheck(
      objectUrl,
      sourceUrl,
      source
    );
    
    if (syntaxResults.length === 0) {
      console.log('No syntax errors found.');
    } else {
      console.log(`Syntax errors found: ${syntaxResults.length}`);
      
      // Group errors and warnings
      const errors = syntaxResults.filter(result => result.severity === 'E' || result.severity === 'A');
      const warnings = syntaxResults.filter(result => result.severity === 'W');
      
      if (errors.length > 0) {
        console.log(`\nErrors: ${errors.length}`);
        errors.forEach(error => {
          console.log(`- Line ${error.line}, Column ${error.offset}: ${error.text}`);
        });
      }
      
      if (warnings.length > 0) {
        console.log(`\nWarnings: ${warnings.length}`);
        warnings.forEach(warning => {
          console.log(`- Line ${warning.line}, Column ${warning.offset}: ${warning.text}`);
        });
      }
    }
    
    // 5. Get list of inactive objects
    console.log('\nRetrieving inactive objects...');
    const inactiveObjects = await client.inactiveObjects();
    
    console.log(`Number of inactive objects: ${inactiveObjects.length}`);
    inactiveObjects.forEach(record => {
      if (record.object) {
        console.log(`- ${record.object["adtcore:type"]}: ${record.object["adtcore:name"]}`);
      }
    });
    
    // 6. Perform activation
    const objName = objectStructure.metaData['adtcore:name'];
    
    console.log(`\nActivating '${objName}'...`);
    const activationResult = await client.activate(objName, objectUrl);
    
    if (activationResult.success) {
      console.log('Activation successful');
    } else {
      console.log('Activation failed:');
      
      // Print messages
      if (activationResult.messages.length > 0) {
        console.log('Activation messages:');
        activationResult.messages.forEach(msg => {
          console.log(`- ${msg.type}: ${msg.shortText}`);
        });
      }
      
      // Print objects that are still inactive
      if (activationResult.inactive.length > 0) {
        console.log('Objects still inactive:');
        activationResult.inactive.forEach(record => {
          if (record.object) {
            console.log(`- ${record.object["adtcore:type"]}: ${record.object["adtcore:name"]}`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
    console.log('Logout completed');
  }
}

checkAndActivate().catch(console.error);
```

### How to Extend

- Implement batch process to activate multiple objects sequentially
- Add auto-fix logic for activation failures
- Implement object state comparison before and after activation

## Using Code Completion

### Purpose

Shows how to use code completion and element information when editing ABAP code.

### Code

```typescript
// code-completion.ts
import { ADTClient } from 'abap-adt-api';

async function useCodeCompletion() {
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password'
  );
  
  try {
    await client.login();
    
    // 1. Retrieve object structure
    const objectUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE_PROGRAM';
    console.log(`Retrieving object structure: ${objectUrl}`);
    const objectStructure = await client.objectStructure(objectUrl);
    
    // 2. Get source code URL
    const sourceUrl = ADTClient.mainInclude(objectStructure);
    
    // 3. Retrieve source code
    console.log('Retrieving source code...');
    const source = await client.getObjectSource(sourceUrl);
    
    // Select specific position in source code (e.g. line 10, column 5)
    const line = 10;
    const column = 5;
    
    // 4. Get code completion proposals
    console.log(`Retrieving code completion proposals at position (${line}, ${column})...`);
    const completions = await client.codeCompletion(
      sourceUrl,
      source,
      line,
      column
    );
    
    console.log(`Number of completion proposals: ${completions.length}`);
    console.log('Top 10 proposals:');
    completions.slice(0, 10).forEach(completion => {
      console.log(`- ${completion.IDENTIFIER} (Type: ${completion.KIND})`);
    });
    
    // 5. Get detailed information for first proposal
    if (completions.length > 0) {
      const firstCompletion = completions[0];
      console.log(`\nRetrieving detailed information for '${firstCompletion.IDENTIFIER}'...`);
      
      const elementInfo = await client.codeCompletionElement(
        sourceUrl,
        source,
        line,
        column
      );
      
      if (typeof elementInfo !== 'string') {
        console.log('Element information:');
        console.log(`- Name: ${elementInfo.name}`);
        console.log(`- Type: ${elementInfo.type}`);
        console.log(`- Documentation: ${elementInfo.doc}`);
        
        // Print components
        if (elementInfo.components && elementInfo.components.length > 0) {
          console.log('\nComponents:');
          elementInfo.components.forEach(component => {
            console.log(`- ${component['adtcore:type']}: ${component['adtcore:name']}`);
          });
        }
      } else {
        console.log(`Element information: ${elementInfo}`);
      }
    }
    
    // 6. Find definition
    console.log('\nFinding definition...');
    // For example, find the definition of the METHOD keyword
    const definitionLine = 15;  // Example line number
    const startColumn = 2;     // Example start column
    const endColumn = 8;       // Example end column
    
    try {
      const definition = await client.findDefinition(
        sourceUrl,
        source,
        definitionLine,
        startColumn,
        endColumn,
        false  // Find definition (not implementation)
      );
      
      console.log('Definition location:');
      console.log(`- URL: ${definition.url}`);
      console.log(`- Line: ${definition.line}`);
      console.log(`- Column: ${definition.column}`);
    } catch (e) {
      console.log('Definition not found.');
    }
    
    // 7. Find usages
    console.log('\nFinding usages...');
    try {
      const usages = await client.usageReferences(
        objectUrl,
        definitionLine,
        startColumn
      );
      
      console.log(`Number of usages: ${usages.length}`);
      
      if (usages.length > 0) {
        console.log('Top 5 usages:');
        usages.slice(0, 5).forEach(usage => {
          console.log(`- ${usage['adtcore:type']}: ${usage['adtcore:name']}`);
        });
        
        // Get code snippet for first usage
        const snippets = await client.usageReferenceSnippets(usages.slice(0, 1));
        
        if (snippets.length > 0 && snippets[0].snippets.length > 0) {
          console.log('\nUsage code snippets:');
          snippets[0].snippets.forEach(snippet => {
            console.log(`- ${snippet.description}:`);
            console.log(`  ${snippet.content}`);
          });
        }
      }
    } catch (e) {
      console.log('Usages not found.');
    }
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
    console.log('Logout completed');
  }
}

useCodeCompletion().catch(console.error);
```

### How to Extend

- Integrate with an editor featuring code auto-completion
- Add management of frequently used code snippets
- Implement symbol information caching mechanism

## Object Creation

### Purpose

Shows how to create various types of ABAP objects.

### Code

```typescript
// create-objects.ts
import { ADTClient, CreatableTypeIds } from 'abap-adt-api';

async function createObjects() {
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password'
  );
  
  try {
    await client.login();
    
    // Set stateful session
    client.stateful = "stateful";
    
    // 1. Get transport information (needed for object creation)
    const packageName = 'ZEXAMPLE_PKG';
    console.log(`Retrieving transport information for package '${packageName}'...`);
    
    const transportInfo = await client.transportInfo(
      `/sap/bc/adt/packages/${packageName}`,
      packageName
    );
    
    // Find available transport
    let transportNumber = '';
    if (transportInfo.TRANSPORTS && transportInfo.TRANSPORTS.length > 0) {
      transportNumber = transportInfo.TRANSPORTS[0].TRKORR;
      console.log(`Available transport: ${transportNumber} (${transportInfo.TRANSPORTS[0].AS4TEXT})`);
    } else {
      console.log('No available transport. Creating new transport...');
      
      transportNumber = await client.createTransport(
        `/sap/bc/adt/packages/${packageName}`,
        'Object creation example',
        packageName
      );
      
      console.log(`New transport created: ${transportNumber}`);
    }
    
    // 2. Load available object types
    console.log('\nLoading available object types...');
    const objectTypes = await client.loadTypes();
    
    // Print creatable types
    console.log('Major creatable object types:');
    const creatableTypes = objectTypes.filter(t => 
      t.CAPABILITIES.includes('create') && t.OBJNAME_MAXLENGTH > 0
    );
    
    creatableTypes.slice(0, 10).forEach(type => {
      console.log(`- ${type.OBJECT_TYPE}: ${type.OBJECT_TYPE_LABEL} (Max length: ${type.OBJNAME_MAXLENGTH})`);
    });
    
    // 3. Create program
    const programName = 'ZEXAMPLE_NEW_PROG';
    console.log(`\nCreating new program '${programName}'...`);
    
    // Validate object name
    try {
      const validationResult = await client.validateNewObject({
        objtype: 'PROG/P',
        objname: programName,
        description: 'Example Program',
        packagename: packageName
      });
      
      console.log(`Validation result: ${validationResult.success ? 'Success' : 'Failure'}`);
      if (!validationResult.success) {
        console.log(`Error: ${validationResult.SHORT_TEXT}`);
        return;
      }
    } catch (error) {
      console.error('Error during validation:', error);
      return;
    }
    
    // Create program
    try {
      await client.createObject({
        objtype: 'PROG/P',
        name: programName,
        description: 'Example Program',
        parentName: packageName,
        parentPath: `/sap/bc/adt/packages/${packageName}`,
        responsible: client.username,
        transport: transportNumber
      });
      
      console.log(`Program '${programName}' successfully created.`);
    } catch (error) {
      console.error('Error creating program:', error);
      return;
    }
    
    // 4. Modify source code of created program
    console.log('\nModifying source code of created program...');
    const programUrl = `/sap/bc/adt/programs/programs/${programName}`;
    
    // Retrieve object structure
    const objectStructure = await client.objectStructure(programUrl);
    const sourceUrl = ADTClient.mainInclude(objectStructure);
    
    // Get current source code
    const currentSource = await client.getObjectSource(sourceUrl);
    console.log('Current source code:');
    console.log(currentSource);
    
    // Lock object
    const lock = await client.lock(programUrl);
    
    // Modify source code
    const newSource = `REPORT ${programName}.
    
* This program was created using the ABAP ADT API
* Creation date: ${new Date().toISOString()}

PARAMETERS: p_input TYPE string.

START-OF-SELECTION.
  WRITE: / 'Hello, World!'.
  WRITE: / 'Input:', p_input.
`;
    
    // Save source code
    await client.setObjectSource(sourceUrl, newSource, lock.LOCK_HANDLE, transportNumber);
    console.log('Source code has been modified.');
    
    // Activate
    const activationResult = await client.activate(programName, programUrl);
    
    if (activationResult.success) {
      console.log('Program successfully activated.');
    } else {
      console.log('Program activation failed:');
      activationResult.messages.forEach(msg => {
        console.log(`- ${msg.type}: ${msg.shortText}`);
      });
    }
    
    // Unlock object
    await client.unLock(programUrl, lock.LOCK_HANDLE);
    
    // 5. Create class (additional example)
    const className = 'ZCL_EXAMPLE_NEW_CLASS';
    console.log(`\nCreating new class '${className}'...`);
    
    try {
      // Validate class
      await client.validateNewObject({
        objtype: 'CLAS/OC',
        objname: className,
        description: 'Example Class',
        packagename: packageName
      });
      
      // Create class
      await client.createObject({
        objtype: 'CLAS/OC',
        name: className,
        description: 'Example Class',
        parentName: packageName,
        parentPath: `/sap/bc/adt/packages/${packageName}`,
        responsible: client.username,
        transport: transportNumber
      });
      
      console.log(`Class '${className}' successfully created.`);
      
      // Create test class include
      console.log('Creating test class include...');
      const classUrl = `/sap/bc/adt/oo/classes/${className}`;
      const classLock = await client.lock(classUrl);
      
      await client.createTestInclude(className, classLock.LOCK_HANDLE, transportNumber);
      console.log('Test class include successfully created.');
      
      // Unlock class
      await client.unLock(classUrl, classLock.LOCK_HANDLE);
      
    } catch (error) {
      console.error('Error creating class:', error);
    }
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
    console.log('Logout completed');
  }
}

createObjects().catch(console.error);
```

### How to Extend

- Implement template-based object creation mechanism
- Develop object creation wizard UI
- Add functionality to create multiple related objects together

## Other Basic Examples

This page has provided basic examples for the most common use cases of the ABAP ADT API library. For more complex scenarios and advanced features, refer to the [Advanced Examples](./advanced.md) page.

Each example can be executed individually and can be modified to fit your needs. You can also combine functionalities from multiple examples to create scripts that perform more complex tasks.

For more details on the ABAP ADT API, refer to the [API Documentation](/api/) section.