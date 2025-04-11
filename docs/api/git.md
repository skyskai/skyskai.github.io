# ABAP Git Integration

This page explains how to manage ABAP Git repositories using the ABAP ADT API.

## Repository Management

### Retrieve Repository List

```typescript
async gitRepos(): Promise<GitRepo[]>
```

Retrieves the list of ABAP Git repositories registered in the system.

**Return value:**
- `GitRepo[]`: Array of repository information

**Example:**
```typescript
// Retrieve repository list
const repositories = await client.gitRepos();
console.log(`Number of registered repositories: ${repositories.length}`);

// Output repository information
repositories.forEach(repo => {
  console.log(`Repository: ${repo.key}`);
  console.log(`- URL: ${repo.url}`);
  console.log(`- Package: ${repo.sapPackage}`);
  console.log(`- Branch: ${repo.branch_name}`);
  console.log(`- Status: ${repo.status_text}`);
});
```

### Retrieve External Repository Information

```typescript
async gitExternalRepoInfo(
  repourl: string,
  user: string = "",
  password: string = ""
): Promise<GitExternalInfo>
```

Retrieves information about an external Git repository.

**Parameters:**
- `repourl`: Repository URL
- `user`: Username (optional)
- `password`: Password (optional)

**Return value:**
- `GitExternalInfo`: External repository information

**Example:**
```typescript
// Retrieve external repository information
const repoInfo = await client.gitExternalRepoInfo(
  'https://github.com/example/abap-project.git',
  'gituser',      // Username
  'gitpassword'   // Password
);

console.log(`Access mode: ${repoInfo.access_mode}`);
console.log('Branches:');
repoInfo.branches.forEach(branch => {
  console.log(`- ${branch.name} (${branch.type})`);
  if (branch.is_head) {
    console.log('  (HEAD)');
  }
});
```

### Create Repository

```typescript
async gitCreateRepo(
  packageName: string,
  repourl: string,
  branch: string = "refs/heads/master",
  transport: string = "",
  user: string = "",
  password: string = ""
): Promise<GitObject[]>
```

Creates a new ABAP Git repository.

**Parameters:**
- `packageName`: Package name
- `repourl`: Repository URL
- `branch`: Branch name (default: "refs/heads/master")
- `transport`: Transport number (optional)
- `user`: Git username (optional)
- `password`: Git password (optional)

**Return value:**
- `GitObject[]`: Array of created Git objects

**Example:**
```typescript
// Create a new repository
const objects = await client.gitCreateRepo(
  'ZEXAMPLE_PKG',                               // Package
  'https://github.com/example/abap-project.git', // Repository URL
  'refs/heads/main',                            // Branch
  'DEVK900123',                                 // Transport
  'gituser',                                    // Username
  'gitpassword'                                 // Password
);

console.log('Created objects:');
objects.forEach(obj => {
  console.log(`${obj.obj_type} ${obj.obj_name}: ${obj.obj_status}`);
});
```

### Pull Repository

```typescript
async gitPullRepo(
  repoId: string,
  branch: string = "refs/heads/master",
  transport: string = "",
  user: string = "",
  password: string = ""
): Promise<GitObject[]>
```

Pulls changes from an ABAP Git repository.

**Parameters:**
- `repoId`: Repository ID
- `branch`: Branch name (default: "refs/heads/master")
- `transport`: Transport number (optional)
- `user`: Git username (optional)
- `password`: Git password (optional)

**Return value:**
- `GitObject[]`: Array of pulled Git objects

**Example:**
```typescript
// Retrieve repository list
const repositories = await client.gitRepos();
if (repositories.length > 0) {
  // Pull from the first repository
  const pullResult = await client.gitPullRepo(
    repositories[0].key,      // Repository ID
    'refs/heads/main',        // Branch
    'DEVK900123',             // Transport
    'gituser',                // Username
    'gitpassword'             // Password
  );
  
  console.log('Pull result:');
  pullResult.forEach(obj => {
    console.log(`${obj.obj_type} ${obj.obj_name}: ${obj.obj_status}`);
    if (obj.msg_text) {
      console.log(`- Message: ${obj.msg_text}`);
    }
  });
}
```

### Unlink Repository

```typescript
async gitUnlinkRepo(repoId: string): Promise<void>
```

Unlinks an ABAP Git repository.

**Parameters:**
- `repoId`: Repository ID

**Example:**
```typescript
// Unlink repository
await client.gitUnlinkRepo('Z_EXAMPLE_REPO');
console.log('Repository has been unlinked.');
```

## Staging and Pushing

### Check Repository

```typescript
async checkRepo(
  repo: GitRepo,
  user: string = "",
  password: string = ""
): Promise<void>
```

Checks an ABAP Git repository.

**Parameters:**
- `repo`: Repository information
- `user`: Git username (optional)
- `password`: Git password (optional)

**Example:**
```typescript
// Retrieve repository list
const repositories = await client.gitRepos();
if (repositories.length > 0) {
  // Check the first repository
  await client.checkRepo(
    repositories[0],  // Repository
    'gituser',        // Username
    'gitpassword'     // Password
  );
  console.log('Repository check completed');
}
```

### Retrieve Staging Information

```typescript
async stageRepo(
  repo: GitRepo,
  user: string = "",
  password: string = ""
): Promise<GitStaging>
```

Retrieves the staging area of an ABAP Git repository.

**Parameters:**
- `repo`: Repository information
- `user`: Git username (optional)
- `password`: Git password (optional)

**Return value:**
- `GitStaging`: Staging information

**Example:**
```typescript
// Retrieve repository list
const repositories = await client.gitRepos();
if (repositories.length > 0) {
  // Retrieve staging information for the first repository
  const staging = await client.stageRepo(
    repositories[0],  // Repository
    'gituser',        // Username
    'gitpassword'     // Password
  );
  
  console.log('Staging information:');
  console.log(`- Staged objects: ${staging.staged.length}`);
  console.log(`- Unstaged objects: ${staging.unstaged.length}`);
  console.log(`- Ignored objects: ${staging.ignored.length}`);
  
  // Output staged objects
  staging.staged.forEach(obj => {
    console.log(`Staged object: ${obj.name} (${obj.type})`);
    obj.abapGitFiles.forEach(file => {
      console.log(`- File: ${file.path}`);
    });
  });
  
  // Output unstaged objects
  staging.unstaged.forEach(obj => {
    console.log(`Unstaged object: ${obj.name} (${obj.type})`);
    obj.abapGitFiles.forEach(file => {
      console.log(`- File: ${file.path}`);
    });
  });
}
```

### Push Changes

```typescript
async pushRepo(
  repo: GitRepo,
  staging: GitStaging,
  user: string = "",
  password: string = ""
): Promise<void>
```

Pushes changes from an ABAP Git repository to an external repository.

**Parameters:**
- `repo`: Repository information
- `staging`: Staging information
- `user`: Git username (optional)
- `password`: Git password (optional)

**Example:**
```typescript
// Retrieve repository list
const repositories = await client.gitRepos();
if (repositories.length > 0) {
  // Retrieve staging information
  const staging = await client.stageRepo(
    repositories[0],
    'gituser',
    'gitpassword'
  );
  
  // Set commit message
  staging.comment = 'Commit changes: ' + new Date().toISOString();
  
  // Set author and committer
  staging.author = {
    name: 'Your Name',
    email: 'your.email@example.com'
  };
  staging.committer = {
    name: 'Your Name',
    email: 'your.email@example.com'
  };
  
  // Push
  await client.pushRepo(
    repositories[0],
    staging,
    'gituser',
    'gitpassword'
  );
  
  console.log('Changes have been successfully pushed.');
}
```

## Branch Management

### Switch Repository Branch

```typescript
async switchRepoBranch(
  repo: GitRepo,
  branch: string,
  create: boolean = false,
  user: string = "",
  password: string = ""
): Promise<void>
```

Switches the branch of an ABAP Git repository.

**Parameters:**
- `repo`: Repository information
- `branch`: Branch name
- `create`: Whether to create the branch (default: false)
- `user`: Git username (optional)
- `password`: Git password (optional)

**Example:**
```typescript
// Retrieve repository list
const repositories = await client.gitRepos();
if (repositories.length > 0) {
  // Switch branch
  await client.switchRepoBranch(
    repositories[0],  // Repository
    'feature/new-feature',  // Branch name
    true,            // Create new branch
    'gituser',       // Username
    'gitpassword'    // Password
  );
  
  console.log('Branch has been switched.');
}
```

### Remote Repository Information

```typescript
async remoteRepoInfo(
  repo: GitRepo,
  user: string = "",
  password: string = ""
): Promise<GitRemoteInfo>
```

Retrieves information about a remote repository.

**Note:** This method is deprecated since version 1.2.1 as it duplicates `gitExternalRepoInfo`.

**Parameters:**
- `repo`: Repository information
- `user`: Git username (optional)
- `password`: Git password (optional)

**Return value:**
- `GitRemoteInfo`: Remote repository information

**Example:**
```typescript
// Retrieve repository list
const repositories = await client.gitRepos();
if (repositories.length > 0) {
  // Retrieve remote repository information
  const remoteInfo = await client.remoteRepoInfo(
    repositories[0],
    'gituser',
    'gitpassword'
  );
  
  console.log(`Access mode: ${remoteInfo.access_mode}`);
  console.log('Branches:');
  remoteInfo.branches.forEach(branch => {
    console.log(`- ${branch.name}`);
  });
}
```

## Complete Workflow Example

The following example demonstrates a complete workflow using an ABAP Git repository:

```typescript
import { ADTClient } from 'abap-adt-api';

async function gitWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // Git repository information
    const gitUrl = 'https://github.com/example/abap-project.git';
    const gitUser = 'gituser';
    const gitPassword = 'gitpassword';
    const packageName = 'ZEXAMPLE_PKG';
    const transportNumber = 'DEVK900123';
    
    // 1. Retrieve repository list
    const repositories = await client.gitRepos();
    console.log(`Number of registered repositories: ${repositories.length}`);
    
    let repo;
    
    // 2. Search for existing repository or create a new one
    const existingRepo = repositories.find(r => r.url === gitUrl && r.sapPackage === packageName);
    if (existingRepo) {
      console.log('Using existing repository:', existingRepo.key);
      repo = existingRepo;
    } else {
      console.log('Creating a new repository...');
      
      // Retrieve external repository information
      const externalInfo = await client.gitExternalRepoInfo(gitUrl, gitUser, gitPassword);
      console.log('External repository information:');
      console.log(`- Access mode: ${externalInfo.access_mode}`);
      console.log(`- Number of branches: ${externalInfo.branches.length}`);
      
      // Find default branch
      const defaultBranch = externalInfo.branches.find(b => b.is_head) || externalInfo.branches[0];
      console.log(`- Default branch: ${defaultBranch?.name || 'refs/heads/master'}`);
      
      // Create new repository
      const branchName = defaultBranch?.name || 'refs/heads/master';
      const objects = await client.gitCreateRepo(
        packageName,
        gitUrl,
        branchName,
        transportNumber,
        gitUser,
        gitPassword
      );
      
      console.log('Created objects:');
      objects.forEach(obj => {
        console.log(`- ${obj.obj_type} ${obj.obj_name}: ${obj.obj_status}`);
      });
      
      // Retrieve repository list again
      const updatedRepos = await client.gitRepos();
      repo = updatedRepos.find(r => r.url === gitUrl && r.sapPackage === packageName);
      
      if (!repo) {
        throw new Error('Repository not found after creation.');
      }
      
      console.log('New repository has been created:', repo.key);
    }
    
    // 3. Perform repository pull
    console.log('Pulling changes from repository...');
    const pullResults = await client.gitPullRepo(
      repo.key,
      repo.branch_name,
      transportNumber,
      gitUser,
      gitPassword
    );
    
    console.log('Pull results:');
    pullResults.forEach(obj => {
      console.log(`- ${obj.obj_type} ${obj.obj_name}: ${obj.obj_status}`);
      if (obj.msg_text) {
        console.log(`  Message: ${obj.msg_text}`);
      }
    });
    
    // 4. Retrieve staging status
    console.log('Retrieving staging status...');
    const staging = await client.stageRepo(repo, gitUser, gitPassword);
    
    console.log('Staging information:');
    console.log(`- Staged objects: ${staging.staged.length}`);
    console.log(`- Unstaged objects: ${staging.unstaged.length}`);
    
    // 5. Push local changes if there are any
    if (staging.unstaged.length > 0) {
      console.log('Processing unstaged changes...');
      
      // Add all changes to staging
      // (In this example, move all unstaged items to staged for simplicity)
      staging.staged = [...staging.staged, ...staging.unstaged];
      staging.unstaged = [];
      
      // Set commit information
      staging.comment = 'Commit changes: ' + new Date().toISOString();
      staging.author = {
        name: 'Your Name',
        email: 'your.email@example.com'
      };
      staging.committer = {
        name: 'Your Name',
        email: 'your.email@example.com'
      };
      
      // Push changes
      console.log('Pushing changes...');
      await client.pushRepo(repo, staging, gitUser, gitPassword);
      console.log('Changes have been successfully pushed.');
    } else {
      console.log('No changes to push.');
    }
    
    // 6. Branch switching example (not actually executed)
    if (false) { // For example only
      console.log('Switching to a new branch...');
      await client.switchRepoBranch(
        repo,
        'feature/new-feature',
        true, // Create new branch
        gitUser,
        gitPassword
      );
      console.log('Branch has been switched.');
    }
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
  }
}

gitWorkflow();
```

## Notes

- ABAP Git functionality requires the ABAP Git extension to be installed in the SAP system.
- Always provide Git username and password when accessing private repositories.
- Transport-related operations (pull, push, etc.) require a valid transport request.
- Be cautious when using large-scale ABAP Git operations as they can impact system performance.
- Branch management operations may vary depending on the SAP version and ABAP Git extension version.
- Always provide appropriate commit messages and author information in staging and pushing operations.