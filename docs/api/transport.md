# Transport Management

This page explains how to manage transport requests using the ABAP ADT API.

## Transport Information

### Retrieve Transport Information

```typescript
async transportInfo(
  URI: string,
  DEVCLASS: string = "",
  OPERATION: string = "I"
): Promise<TransportInfo>
```

Retrieves transport information for an object.

**Parameters:**
- `URI`: Object URI
- `DEVCLASS`: Development class (package) (optional)
- `OPERATION`: Operation type (default: "I")

**Return value:**
- `TransportInfo`: Transport information

**Example:**
```typescript
// Retrieve transport information for an object
const transportInfo = await client.transportInfo('/sap/bc/adt/programs/programs/ZEXAMPLE');
console.log('Transport information:', transportInfo);

// Available transport list
if (transportInfo.TRANSPORTS && transportInfo.TRANSPORTS.length > 0) {
  console.log('Available transports:');
  transportInfo.TRANSPORTS.forEach(transport => {
    console.log(`${transport.TRKORR}: ${transport.AS4TEXT}`);
  });
}
```

### Object Registration Information

```typescript
async objectRegistrationInfo(objectUrl: string): Promise<RegistrationInfo>
```

Retrieves registration information for an object.

**Parameters:**
- `objectUrl`: Object URL

**Return value:**
- `RegistrationInfo`: Registration information

**Example:**
```typescript
// Retrieve object registration information
const registrationInfo = await client.objectRegistrationInfo('/sap/bc/adt/programs/programs/ZEXAMPLE');
console.log('Object registration information:', registrationInfo);
```

## Transport Request Management

### Create Transport Request

```typescript
async createTransport(
  objSourceUrl: string,
  REQUEST_TEXT: string,
  DEVCLASS: string,
  transportLayer?: string
): Promise<string>
```

Creates a new transport request.

**Parameters:**
- `objSourceUrl`: Object source URL
- `REQUEST_TEXT`: Request description text
- `DEVCLASS`: Development class (package)
- `transportLayer`: Transport layer (optional)

**Return value:**
- `string`: Created transport request number

**Example:**
```typescript
// Create a new transport request
const transportNumber = await client.createTransport(
  '/sap/bc/adt/programs/programs/ZEXAMPLE',
  'Example program changes',
  'ZEXAMPLE_PKG',
  'Z_LAYER'
);
console.log('Created transport number:', transportNumber);
```

### User Transport List

```typescript
async userTransports(
  user: string,
  targets: boolean = true
): Promise<TransportsOfUser>
```

Retrieves the list of transport requests for a specific user.

**Parameters:**
- `user`: User ID
- `targets`: Whether to include targets (default: true)

**Return value:**
- `TransportsOfUser`: User transport information

**Example:**
```typescript
// Retrieve transport list for the current user
const userTransports = await client.userTransports(client.username);

// Workbench request list
console.log('Workbench requests:');
userTransports.workbench.forEach(target => {
  console.log(`Target: ${target['tm:name']}`);
  target.modifiable.forEach(req => {
    console.log(`- ${req['tm:number']}: ${req['tm:desc']}`);
  });
});

// Customizing request list
console.log('Customizing requests:');
userTransports.customizing.forEach(target => {
  console.log(`Target: ${target['tm:name']}`);
  target.modifiable.forEach(req => {
    console.log(`- ${req['tm:number']}: ${req['tm:desc']}`);
  });
});
```

### Transport List by Configuration

```typescript
async transportsByConfig(
  configUri: string,
  targets: boolean = true
): Promise<TransportsOfUser>
```

Retrieves the list of transport requests according to a specific configuration.

**Parameters:**
- `configUri`: Configuration URI
- `targets`: Whether to include targets (default: true)

**Return value:**
- `TransportsOfUser`: User transport information

**Example:**
```typescript
// Retrieve transport list by configuration
const configs = await client.transportConfigurations();
if (configs.length > 0) {
  const transports = await client.transportsByConfig(configs[0].link);
  console.log('Transport list by configuration:', transports);
}
```

### Delete Transport

```typescript
async transportDelete(transportNumber: string): Promise<void>
```

Deletes a transport request.

**Parameters:**
- `transportNumber`: Transport request number

**Example:**
```typescript
// Delete transport
await client.transportDelete('DEVK900123');
console.log('Transport has been deleted.');
```

### Release Transport

```typescript
async transportRelease(
  transportNumber: string,
  ignoreLocks: boolean = false,
  IgnoreATC: boolean = false
): Promise<TransportReleaseReport[]>
```

Releases a transport request.

**Parameters:**
- `transportNumber`: Transport request number
- `ignoreLocks`: Whether to ignore locks (default: false)
- `IgnoreATC`: Whether to ignore ATC checks (default: false)

**Return value:**
- `TransportReleaseReport[]`: Release reports

**Example:**
```typescript
// Release transport
const releaseReports = await client.transportRelease('DEVK900123');

// Check release results
if (releaseReports.length > 0) {
  const report = releaseReports[0];
  console.log(`Release status: ${report['chkrun:status']}`);
  console.log(`Status text: ${report['chkrun:statusText']}`);
  
  // Output messages
  if (report.messages && report.messages.length > 0) {
    console.log('Messages:');
    report.messages.forEach(msg => {
      console.log(`${msg['chkrun:type']}: ${msg['chkrun:shortText']}`);
    });
  }
}
```

### Change Transport Owner

```typescript
async transportSetOwner(
  transportNumber: string,
  targetuser: string
): Promise<TransportOwnerResponse>
```

Changes the owner of a transport request.

**Parameters:**
- `transportNumber`: Transport request number
- `targetuser`: New owner user ID

**Return value:**
- `TransportOwnerResponse`: Owner change response

**Example:**
```typescript
// Change transport owner
const ownerResponse = await client.transportSetOwner('DEVK900123', 'NEWUSER');
console.log('Owner changed:', ownerResponse);
```

### Add User to Transport

```typescript
async transportAddUser(
  transportNumber: string,
  user: string
): Promise<TransportAddUserResponse>
```

Adds a user to a transport request.

**Parameters:**
- `transportNumber`: Transport request number
- `user`: User ID to add

**Return value:**
- `TransportAddUserResponse`: User addition response

**Example:**
```typescript
// Add user to transport
const addUserResponse = await client.transportAddUser('DEVK900123', 'DEVELOPER1');
console.log('User added:', addUserResponse);
```

### Retrieve Transport Reference

```typescript
async transportReference(
  pgmid: string,
  obj_wbtype: string,
  obj_name: string,
  tr_number: string = ""
): Promise<string>
```

Retrieves transport reference.

**Parameters:**
- `pgmid`: Program ID
- `obj_wbtype`: Object workbench type
- `obj_name`: Object name
- `tr_number`: Transport request number (optional)

**Return value:**
- `string`: Transport reference URL

**Example:**
```typescript
// Retrieve transport reference
const reference = await client.transportReference(
  'LIMU',        // Program ID
  'PROG',        // Object type
  'ZEXAMPLE',    // Object name
  'DEVK900123'   // Transport number
);
console.log('Transport reference:', reference);
```

## Transport Configuration

### Retrieve Transport Configurations

```typescript
async transportConfigurations(): Promise<TransportConfigurationEntry[]>
```

Retrieves the list of transport configurations in the system.

**Return value:**
- `TransportConfigurationEntry[]`: Array of transport configuration entries

**Example:**
```typescript
// Retrieve transport configuration list
const configurations = await client.transportConfigurations();
console.log('Transport configuration list:');
configurations.forEach(config => {
  console.log(`- ${config.title} (Created by: ${config.createdBy})`);
});
```

### Create Transport Configuration

```typescript
async createTransportsConfig(): Promise<TransportConfigurationEntry>
```

Creates a new transport configuration.

**Return value:**
- `TransportConfigurationEntry`: Created configuration entry

**Example:**
```typescript
// Create new transport configuration
const newConfig = await client.createTransportsConfig();
console.log('New configuration created:', newConfig);
```

### Retrieve Transport Configuration

```typescript
async getTransportConfiguration(
  url: string
): Promise<TransportConfiguration>
```

Retrieves transport configuration for a specific URL.

**Parameters:**
- `url`: Configuration URL

**Return value:**
- `TransportConfiguration`: Transport configuration

**Example:**
```typescript
// Retrieve transport configuration
const configurations = await client.transportConfigurations();
if (configurations.length > 0) {
  const config = await client.getTransportConfiguration(configurations[0].link);
  console.log('Transport configuration:', config);
}
```

### Set Transport Configuration

```typescript
async setTransportsConfig(
  uri: string,
  etag: string,
  config: TransportConfiguration
): Promise<TransportConfiguration>
```

Sets transport configuration.

**Parameters:**
- `uri`: Configuration URI
- `etag`: ETag value
- `config`: Transport configuration

**Return value:**
- `TransportConfiguration`: Updated transport configuration

**Example:**
```typescript
// Get transport configuration
const configurations = await client.transportConfigurations();
if (configurations.length > 0) {
  const configUrl = configurations[0].link;
  const etag = configurations[0].etag;
  
  // Retrieve existing configuration
  const config = await client.getTransportConfiguration(configUrl);
  
  // Modify configuration
  config.User = client.username;
  config.DateFilter = 1; // Within 2 weeks
  config.WorkbenchRequests = true;
  config.CustomizingRequests = false;
  
  // Update configuration
  const updatedConfig = await client.setTransportsConfig(configUrl, etag, config);
  console.log('Configuration updated:', updatedConfig);
}
```

## System Users

### Retrieve System Users

```typescript
async systemUsers(): Promise<SystemUser[]>
```

Retrieves the list of users registered in the system.

**Return value:**
- `SystemUser[]`: Array of system users

**Example:**
```typescript
// Retrieve system user list
const users = await client.systemUsers();
console.log('System users:');
users.forEach(user => {
  console.log(`- ${user.id}: ${user.title}`);
});
```

## Transport API Usage Examples

### Example: Transport Request Creation and Management

```typescript
import { ADTClient } from 'abap-adt-api';

async function transportWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // 1. Retrieve transport information for a package
    const objectUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE';
    const transportInfo = await client.transportInfo(objectUrl, 'ZEXAMPLE_PKG');
    console.log('Transport information:', transportInfo);
    
    let transportNumber: string;
    
    // 2. Check if there are existing transports
    if (transportInfo.TRANSPORTS && transportInfo.TRANSPORTS.length > 0) {
      // Use the first transport
      transportNumber = transportInfo.TRANSPORTS[0].TRKORR;
      console.log('Using existing transport:', transportNumber);
    } else {
      // Create a new transport
      transportNumber = await client.createTransport(
        objectUrl,
        'Example program changes',
        'ZEXAMPLE_PKG'
      );
      console.log('New transport created:', transportNumber);
    }
    
    // 3. Add another user to the transport
    const addUserResponse = await client.transportAddUser(transportNumber, 'DEVELOPER2');
    console.log('User added:', addUserResponse);
    
    // 4. Retrieve transport list for the current user
    const userTransports = await client.userTransports(client.username);
    console.log('User transport list:');
    
    // Calculate number of workbench requests
    let workbenchCount = 0;
    userTransports.workbench.forEach(target => {
      workbenchCount += target.modifiable.length;
    });
    console.log(`- Workbench requests: ${workbenchCount}`);
    
    // 5. Release transport (use in real environment as needed)
    if (false) { // Not executed in this example
      const releaseReports = await client.transportRelease(transportNumber);
      console.log('Release result:', releaseReports);
    }
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
  }
}

transportWorkflow();
```

### Example: Transport Configuration Management

```typescript
import { ADTClient, TransportDateFilter } from 'abap-adt-api';

async function transportConfigWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // 1. Check if transport configuration is supported
    const hasTransportConfig = await client.hasTransportConfig();
    if (!hasTransportConfig) {
      console.log('Transport configuration is not supported.');
      return;
    }
    
    // 2. Retrieve existing configuration list
    let configurations = await client.transportConfigurations();
    console.log(`Number of existing configurations: ${configurations.length}`);
    
    let configUrl: string;
    let configEtag: string;
    
    // 3. Create new configuration or use existing one
    if (configurations.length === 0) {
      // Create new configuration
      const newConfig = await client.createTransportsConfig();
      configUrl = newConfig.link;
      configEtag = newConfig.etag;
      console.log('New configuration created:', configUrl);
      
      // Retrieve configuration list again
      configurations = await client.transportConfigurations();
    } else {
      // Use the first configuration
      configUrl = configurations[0].link;
      configEtag = configurations[0].etag;
      console.log('Using existing configuration:', configUrl);
    }
    
    // 4. Retrieve configuration details
    const config = await client.getTransportConfiguration(configUrl);
    console.log('Current configuration:', config);
    
    // 5. Modify configuration
    const updatedConfig = {
      ...config,
      DateFilter: TransportDateFilter.SinceYesterday, // Since yesterday
      WorkbenchRequests: true,                        // Include workbench requests
      CustomizingRequests: true,                      // Include customizing requests
      Released: false,                                // Only unreleased requests
      User: client.username,                          // Only current user's requests
      Modifiable: true                                // Only modifiable requests
    };
    
    // 6. Save updated configuration
    const savedConfig = await client.setTransportsConfig(configUrl, configEtag, updatedConfig);
    console.log('Configuration updated:', savedConfig);
    
    // 7. Retrieve transports with updated configuration
    const transports = await client.transportsByConfig(configUrl);
    
    // Calculate number of workbench requests
    let workbenchCount = 0;
    transports.workbench.forEach(target => {
      workbenchCount += target.modifiable.length;
    });
    console.log(`Filtered workbench requests: ${workbenchCount}`);
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
  }
}

transportConfigWorkflow();
```

## Notes

- Transport management API functions may be limited depending on the SAP system's permission settings.
- Transport release should be performed carefully. Released transports cannot be canceled.
- Transport configuration features may only be supported in some SAP systems.
- Transport request numbers are always 10 characters long and typically start with prefixes like 'DEVK'.
- Large-scale transport manipulation operations can affect system performance, so use them with caution.