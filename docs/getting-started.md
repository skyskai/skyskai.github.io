# Getting Started

Let's learn how to develop applications that interact with SAP ABAP systems using the ABAP ADT API library.

## Installation

You can install the library using npm:

```bash
npm install abap-adt-api
```

Or if you're using yarn:

```bash
yarn add abap-adt-api
```

## Basic Configuration

The following basic setup is required to use the ABAP ADT API.

### Initializing ADTClient

```typescript
import { ADTClient } from 'abap-adt-api';

// Create basic client
const client = new ADTClient(
  'https://your-sap-server.com', // SAP server URL
  'username',                    // Username
  'password',                    // Password
  '001',                         // Client (optional)
  'EN'                           // Language (optional)
);
```

### SSL Certificate Configuration

If you're using self-signed certificates or private certificate authorities, you may need to add SSL settings.

```typescript
import { ADTClient, createSSLConfig } from 'abap-adt-api';
import fs from 'fs';

// SSL configuration
const sslConfig = createSSLConfig(
  true,                           // Bypass certificate verification (for development)
  fs.readFileSync('ca.pem', 'utf8') // CA certificate (optional)
);

// Create client with SSL configuration
const client = new ADTClient(
  'https://your-sap-server.com',
  'username',
  'password',
  '001',
  'EN',
  sslConfig
);
```

## Login and Session Management

You need to log in to the SAP system first to use the ADT API.

```typescript
async function main() {
  try {
    // Login
    await client.login();
    console.log('Login successful');
    
    // Check session status
    console.log(`Login status: ${client.loggedin}`);
    console.log(`Session ID: ${client.sessionID}`);
    
    // Perform tasks...
    
    // Logout
    await client.logout();
    console.log('Logout successful');
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

main();
```

### Session Types

ABAP ADT API supports the following session types:

- **Stateless**: Each request is processed independently. (default)
- **Stateful**: The server maintains state. Required for features like object locking.

```typescript
// Set to stateful session
client.stateful = "stateful";

// Check status
console.log(`Stateful session: ${client.isStateful}`);
```

## Basic Workflow Example

The following is a basic workflow for retrieving and modifying the source code of an ABAP program.

```typescript
import { ADTClient } from 'abap-adt-api';

async function editProgram() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  
  try {
    await client.login();
    
    // Set to stateful session (required for object locking)
    client.stateful = "stateful";
    
    // Retrieve program structure
    const objectUrl = '/sap/bc/adt/programs/programs/Z_YOUR_PROGRAM';
    const objectStructure = await client.objectStructure(objectUrl);
    
    // Get source code URL
    const sourceUrl = ADTClient.mainInclude(objectStructure);
    
    // Retrieve source code
    const source = await client.getObjectSource(sourceUrl);
    console.log('Current source code:', source);
    
    // Lock object
    const lock = await client.lock(objectUrl);
    console.log('Object lock handle:', lock.LOCK_HANDLE);
    
    // Modified source code
    const modifiedSource = source + '\n* Comment added';
    
    // Update source code
    await client.setObjectSource(sourceUrl, modifiedSource, lock.LOCK_HANDLE);
    console.log('Source code update successful');
    
    // Activation
    const activationResult = await client.activate(
      objectStructure.metaData['adtcore:name'], 
      objectUrl
    );
    
    if (activationResult.success) {
      console.log('Activation successful');
    } else {
      console.log('Activation failed:', activationResult.messages);
    }
    
    // Release object lock
    await client.unLock(objectUrl, lock.LOCK_HANDLE);
    console.log('Object lock released');
    
    // End session
    await client.logout();
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

editProgram();
```

## Next Steps

We've covered the basic setup and usage. Now move on to explore more API features.

- [Object Management](/api/object-management) - ABAP object management features
- [Development Features](/api/development) - Code development related features
- [Transport](/api/transport) - Transport management
- [Debugging](/api/debugging) - ABAP debugging features