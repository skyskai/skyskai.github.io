# Basic Features

This page describes the basic features of ABAP ADT API, including login, session management, system information retrieval, and more.

## ADTClient Class

The `ADTClient` class is the main entry point of the library and handles all interactions with the ABAP system.

### Constructor

```typescript
constructor(
  baseUrlOrClient: string | HttpClient,
  username: string,
  password: string | BearerFetcher,
  client: string = "",
  language: string = "",
  options: ClientOptions = {}
)
```

**Parameters:**
- `baseUrlOrClient`: Base URL of the SAP server (e.g., 'http://vhcalnplci.local:8000') or an HTTP client instance
- `username`: SAP login username
- `password`: User password or a function to retrieve a Bearer token
- `client`: SAP client number (optional)
- `language`: Language key (optional)
- `options`: Additional client options (optional)

### SSL Configuration

If you are using self-signed certificates or private certificate authorities, you can configure SSL settings using the `createSSLConfig` function.

```typescript
import { createSSLConfig } from 'abap-adt-api';

const sslConfig = createSSLConfig(
  true,                       // Whether to bypass certificate verification
  'optional-ca-certificate'   // CA certificate (optional)
);
```

## Login and Session Management

### Login

```typescript
async login(): Promise<boolean>
```

Logs in to the SAP system. Returns `true` on success.

**Example:**
```typescript
const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
const success = await client.login();
console.log(`Login ${success ? 'successful' : 'failed'}`);
```

### Logout

```typescript
async logout(): Promise<void>
```

Handles the logout of the current user and cleans up cookies.
**Note:** After logout, you cannot log in again with this client instance.

**Example:**
```typescript
await client.logout();
```

### Drop Session

```typescript
async dropSession(): Promise<void>
```

Drops the current session. Unlike logout, the client instance can be reused.

**Example:**
```typescript
await client.dropSession();
// Can log in again afterwards
await client.login();
```

### Check Session Status

Properties to check session status and information:

```typescript
get loggedin: boolean            // Login status
get isStateful: boolean          // Whether the session is stateful
get baseUrl: string              // Server base URL
get client: string               // SAP client
get language: string             // Language key
get username: string             // Username
get sessionID: string            // Session ID
get csrfToken: string            // CSRF token
```

### Set Session Type

```typescript
set stateful(type: session_types)
get stateful: session_types
```

Sets or gets the session type. Possible values:
- `"stateful"`: Stateful session
- `"stateless"`: Stateless session (default)

**Example:**
```typescript
// Set to stateful session
client.stateful = "stateful";
console.log(`Stateful session: ${client.isStateful}`);
```

### Stateless Client 

```typescript
get statelessClone: ADTClient
```

Returns a stateless client that uses the same credentials as the original client.
This is useful when you need to perform stateless requests within a stateful session.

**Example:**
```typescript
client.stateful = "stateful";          // Base client is stateful
const stateless = client.statelessClone; // Create stateless clone
```

## System Information and Navigation

### Get Reentrance Ticket

```typescript
async reentranceTicket(): Promise<string>
```

Gets a ticket for reentrance from SAP GUI to ADT.

**Example:**
```typescript
const ticket = await client.reentranceTicket();
console.log(`Reentrance ticket: ${ticket}`);
```

### System Discovery

```typescript
async adtDiscovery(): Promise<AdtDiscoveryResult[]>
```

Discovers available ADT services in the system.

**Example:**
```typescript
const discovery = await client.adtDiscovery();
discovery.forEach(service => {
  console.log(`Service: ${service.title}`);
  service.collection.forEach(col => {
    console.log(` - Collection: ${col.href}`);
  });
});
```

### Core Discovery

```typescript
async adtCoreDiscovery(): Promise<AdtCoreDiscoveryResult[]>
```

Retrieves ADT core service information.

**Example:**
```typescript
const coreServices = await client.adtCoreDiscovery();
```

### Compatibility Graph

```typescript
async adtCompatibiliyGraph(): Promise<AdtCompatibilityGraph>
```

Retrieves the ADT compatibility graph.

**Example:**
```typescript
const graph = await client.adtCompatibiliyGraph();
```

### Retrieve Feeds

```typescript
async feeds(): Promise<Feed[]>
```

Retrieves available ADT feeds from the system.

**Example:**
```typescript
const feeds = await client.feeds();
```

### Retrieve Dumps

```typescript
async dumps(query?: string): Promise<DumpsFeed>
```

Retrieves system dumps. Optionally, you can use a query string to filter.

**Example:**
```typescript
// Retrieve all dumps
const allDumps = await client.dumps();
// Retrieve filtered dumps
const filteredDumps = await client.dumps('type eq "ABAP runtime error"');
```

## Advanced Features

### Retrieve Feature Details

```typescript
async featureDetails(title: string): Promise<AdtDiscoveryResult | undefined>
```

Retrieves details of a specific ADT feature by title.

```typescript
async collectionFeatureDetails(url: string): Promise<AdtDiscoveryResult | undefined>
```

Retrieves feature details of a specific ADT collection by URL.

```typescript
async findCollectionByUrl(url: string): Promise<{ discoveryResult: AdtDiscoveryResult, collection: any } | undefined>
```

Finds a specific ADT collection by URL.

## Example: Basic Session Management Workflow

The following example shows a basic session management workflow with ADTClient:

```typescript
import { ADTClient } from 'abap-adt-api';

async function basicWorkflow() {
  // Initialize client
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password',
    '001',  // Client
    'EN'    // Language
  );
  
  try {
    // Login
    const loginSuccess = await client.login();
    if (!loginSuccess) {
      console.error('Login failed');
      return;
    }
    
    console.log('Login successful');
    console.log(`Session ID: ${client.sessionID}`);
    
    // Switch to stateful session (required for object locking, etc.)
    client.stateful = "stateful";
    console.log(`Stateful session: ${client.isStateful}`);
    
    // Retrieve system information
    const discovery = await client.adtDiscovery();
    console.log(`Number of available services: ${discovery.length}`);
    
    // Perform tasks...
    
    // Drop session (can be reused after session ends)
    await client.dropSession();
    console.log('Session ended');
    
    // Can log in again
    await client.login();
    console.log('Re-login successful');
    
    // Final logout (no longer possible to log in with this client instance)
    await client.logout();
    console.log('Logout complete');
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

basicWorkflow();
```

## Example: Using Stateful and Stateless Sessions

The following example shows how to use stateful and stateless sessions together with the same client:

```typescript
import { ADTClient } from 'abap-adt-api';

async function statefulAndStateless() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  // Set to stateful session
  client.stateful = "stateful";
  
  // Lock object (requires stateful session)
  const objectUrl = '/sap/bc/adt/programs/programs/Z_EXAMPLE';
  const lock = await client.lock(objectUrl);
  console.log('Object locked:', lock.LOCK_HANDLE);
  
  // Create stateless clone (original session is not affected)
  const statelessClient = client.statelessClone;
  
  // Retrieve object structure with stateless client
  const objectStructure = await statelessClient.objectStructure(objectUrl);
  console.log('Object structure retrieved:', objectStructure.metaData['adtcore:name']);
  
  // Unlock with original stateful client
  await client.unLock(objectUrl, lock.LOCK_HANDLE);
  console.log('Object unlocked');
  
  // End session
  await client.logout();
}

statefulAndStateless();
```

## Notes

- A stateful session is required to modify ABAP objects or use locks.
- For read-only operations where performance is important and state doesn't need to be maintained, it's better to use stateless sessions.
- After logging out, you cannot log in again with the same client instance, so use `dropSession()` if you need to reuse the session.