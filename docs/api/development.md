# Development Features

This page describes features that support code development using the ABAP ADT API. It includes functionality for syntax checking, code completion, refactoring, and more.

## Syntax Checking

### Perform Syntax Check

```typescript
async syntaxCheck(cdsUrl: string): Promise<SyntaxCheckResult[]>

async syntaxCheck(
  url: string,
  mainUrl: string,
  content: string,
  mainProgram?: string,
  version?: string
): Promise<SyntaxCheckResult[]>
```

Checks the syntax of ABAP code. Supports different call formats for CDS objects and regular ABAP objects.

**Parameters (CDS format):**
- `cdsUrl`: CDS object URL

**Parameters (regular format):**
- `url`: Object URL
- `mainUrl`: Main URL
- `content`: Source code to check
- `mainProgram`: Main program (optional)
- `version`: Object version (default: 'active')

**Return value:**
- `SyntaxCheckResult[]`: Array of syntax check results

**Example:**
```typescript
// Retrieve object structure
const objectStructure = await client.objectStructure('/sap/bc/adt/programs/programs/ZEXAMPLE');
const sourceUrl = ADTClient.mainInclude(objectStructure);

// Retrieve source code
const source = await client.getObjectSource(sourceUrl);

// Perform syntax check
const syntaxResults = await client.syntaxCheck(
  objectStructure.objectUrl,  // Object URL
  sourceUrl,                  // Main URL
  source                      // Source code
);

// Output check results
if (syntaxResults.length === 0) {
  console.log('No syntax errors.');
} else {
  syntaxResults.forEach(result => {
    console.log(`${result.line}:${result.offset} - ${result.severity}: ${result.text}`);
  });
}
```

### Retrieve Syntax Check Types

```typescript
async syntaxCheckTypes(): Promise<Map<string, string[]>>
```

Retrieves available syntax check types.

**Return value:**
- `Map<string, string[]>`: Map of checkers and their supported types

**Example:**
```typescript
const checkTypes = await client.syntaxCheckTypes();
console.log('Available checkers:');
for (const [checker, types] of checkTypes.entries()) {
  console.log(`- ${checker}: ${types.join(', ')}`);
}
```

## Code Completion

### Code Completion Proposals

```typescript
async codeCompletion(
  sourceUrl: string,
  source: string,
  line: number,
  column: number
): Promise<CompletionProposal[]>
```

Gets code completion proposals.

**Parameters:**
- `sourceUrl`: Source code URL
- `source`: Source code
- `line`: Cursor position line number
- `column`: Cursor position column number

**Return value:**
- `CompletionProposal[]`: Array of completion proposals

**Example:**
```typescript
// Source code URL and source code
const sourceUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE/source/main';
const source = 'REPORT zexample.\n\nDATA: lv_text TYPE string.\n\nlv_text = ';

// Get completion proposals at line 3, column 11 (lv_text = |<cursor>)
const completions = await client.codeCompletion(sourceUrl, source, 3, 11);

// Output proposals
completions.forEach(completion => {
  console.log(completion.IDENTIFIER);
});
```

### Code Completion Element Information

```typescript
async codeCompletionElement(
  sourceUrl: string,
  source: string,
  line: number,
  column: number
): Promise<CompletionElementInfo | string>
```

Gets detailed information about a code completion element.

**Parameters:**
- `sourceUrl`: Source code URL
- `source`: Source code
- `line`: Cursor position line number
- `column`: Cursor position column number

**Return value:**
- `CompletionElementInfo | string`: Completion element information or information string

**Example:**
```typescript
// Get code completion element information
const elementInfo = await client.codeCompletionElement(sourceUrl, source, 3, 11);

// Output element information
if (typeof elementInfo !== 'string') {
  console.log(`Name: ${elementInfo.name}`);
  console.log(`Type: ${elementInfo.type}`);
  console.log(`Documentation: ${elementInfo.doc}`);
}
```

### Full Code Completion

```typescript
async codeCompletionFull(
  sourceUrl: string,
  source: string,
  line: number,
  column: number,
  patternKey: string
): Promise<string>
```

Gets the full code completion content.

**Parameters:**
- `sourceUrl`: Source code URL
- `source`: Source code
- `line`: Cursor position line number
- `column`: Cursor position column number
- `patternKey`: Pattern key

**Return value:**
- `string`: Completed code

**Example:**
```typescript
const fullCompletion = await client.codeCompletionFull(
  sourceUrl,
  source,
  3,
  11,
  'pattern1'
);
console.log('Completed code:', fullCompletion);
```

## Definition and Usage Navigation

### Find Definition

```typescript
async findDefinition(
  url: string,
  source: string,
  line: number,
  startCol: number,
  endCol: number,
  implementation: boolean = false,
  mainProgram: string = ""
): Promise<DefinitionLocation>
```

Finds the definition location of a code element.

**Parameters:**
- `url`: Source code URL
- `source`: Source code
- `line`: Line number
- `startCol`: Start column
- `endCol`: End column
- `implementation`: Whether to find implementation (optional, default: false)
- `mainProgram`: Main program (optional)

**Return value:**
- `DefinitionLocation`: Definition location

**Example:**
```typescript
// Find definition of REPORT keyword in source code
const definition = await client.findDefinition(
  sourceUrl,
  source,
  1,       // Line
  0,       // Start column
  6,       // End column
  false    // Find definition (not implementation)
);

console.log(`Definition location: ${definition.url}#${definition.line},${definition.column}`);
```

### Find Usage References

```typescript
async usageReferences(
  url: string,
  line?: number,
  column?: number
): Promise<UsageReference[]>
```

Finds usage references of a code element.

**Parameters:**
- `url`: Object URL
- `line`: Line number (optional)
- `column`: Column number (optional)

**Return value:**
- `UsageReference[]`: Array of usage references

**Example:**
```typescript
// Find all usages of an object
const usages = await client.usageReferences('/sap/bc/adt/programs/programs/ZEXAMPLE');

// Find usages of an element at a specific position
const elementUsages = await client.usageReferences(
  '/sap/bc/adt/programs/programs/ZEXAMPLE',
  10,  // Line
  5    // Column
);

// Output usages
usages.forEach(usage => {
  console.log(`${usage['adtcore:type']}: ${usage['adtcore:name']}`);
});
```

### Usage Reference Snippets

```typescript
async usageReferenceSnippets(
  references: UsageReference[]
): Promise<UsageReferenceSnippet[]>
```

Gets code snippets for usage references.

**Parameters:**
- `references`: Array of usage references

**Return value:**
- `UsageReferenceSnippet[]`: Array of usage code snippets

**Example:**
```typescript
// Find usages
const usages = await client.usageReferences('/sap/bc/adt/programs/programs/ZEXAMPLE');

// Get usage code snippets
const snippets = await client.usageReferenceSnippets(usages);

// Output snippets
snippets.forEach(snippet => {
  snippet.snippets.forEach(s => {
    console.log(`${s.description}:\n${s.content}`);
  });
});
```

## Quick Fixes and Refactoring

### Quick Fix Proposals

```typescript
async fixProposals(
  url: string,
  source: string,
  line: number,
  column: number
): Promise<FixProposal[]>
```

Gets quick fix proposals for code issues.

**Parameters:**
- `url`: Source code URL
- `source`: Source code
- `line`: Line number
- `column`: Column number

**Return value:**
- `FixProposal[]`: Array of fix proposals

**Example:**
```typescript
// Get fix proposals for a code issue
const fixes = await client.fixProposals(
  sourceUrl,
  source,
  5,  // Line
  10  // Column
);

// Output proposals
fixes.forEach(fix => {
  console.log(`${fix['adtcore:name']}: ${fix['adtcore:description']}`);
});
```

### Apply Quick Fix

```typescript
async fixEdits(
  proposal: FixProposal,
  source: string
): Promise<Delta[]>
```

Applies a quick fix proposal.

**Parameters:**
- `proposal`: Fix proposal
- `source`: Source code

**Return value:**
- `Delta[]`: Array of changes

**Example:**
```typescript
// Get fix proposals
const fixes = await client.fixProposals(sourceUrl, source, 5, 10);
if (fixes.length > 0) {
  // Apply first proposal
  const edits = await client.fixEdits(fixes[0], source);
  
  // Output changes
  edits.forEach(edit => {
    console.log(`Change location: ${edit.range.start.line},${edit.range.start.column}`);
    console.log(`Change content: ${edit.content}`);
  });
}
```

### Refactoring: Rename

```typescript
async renameEvaluate(
  uri: string,
  line: number,
  startColumn: number,
  endColumn: number
): Promise<RenameRefactoringProposal>
```

Evaluates a rename refactoring.

**Parameters:**
- `uri`: Source code URL
- `line`: Line number
- `startColumn`: Start column
- `endColumn`: End column

**Return value:**
- `RenameRefactoringProposal`: Rename refactoring proposal

```typescript
async renamePreview(
  renameRefactoring: RenameRefactoringProposal,
  transport: string = ""
): Promise<RenameRefactoring>
```

Gets a preview of a rename refactoring.

**Parameters:**
- `renameRefactoring`: Rename refactoring proposal
- `transport`: Transport number (optional)

**Return value:**
- `RenameRefactoring`: Rename refactoring

```typescript
async renameExecute(
  refactoring: RenameRefactoring
): Promise<RenameRefactoring>
```

Executes a rename refactoring.

**Parameters:**
- `refactoring`: Rename refactoring

**Return value:**
- `RenameRefactoring`: Executed rename refactoring

**Example:**
```typescript
// Evaluate rename refactoring
const proposal = await client.renameEvaluate(
  sourceUrl,
  10,       // Line
  5,        // Start column
  15        // End column
);

// Set new name
proposal.newName = 'NEW_NAME';

// Preview
const preview = await client.renamePreview(proposal, 'DEVK900000');

// Execute refactoring
const result = await client.renameExecute(preview);

console.log('Rename completed:', result);
```

### Refactoring: Extract Method

```typescript
async extractMethodEvaluate(
  uri: string,
  range: Range
): Promise<ExtractMethodProposal>
```

Evaluates an extract method refactoring.

**Parameters:**
- `uri`: Source code URL
- `range`: Code range

**Return value:**
- `ExtractMethodProposal`: Extract method proposal

```typescript
async extractMethodPreview(
  proposal: ExtractMethodProposal
): Promise<GenericRefactoring>
```

Gets a preview of an extract method refactoring.

**Parameters:**
- `proposal`: Extract method proposal

**Return value:**
- `GenericRefactoring`: Refactoring information

```typescript
async extractMethodExecute(
  refactoring: GenericRefactoring
): Promise<GenericRefactoring>
```

Executes an extract method refactoring.

**Parameters:**
- `refactoring`: Refactoring information

**Return value:**
- `GenericRefactoring`: Executed refactoring information

**Example:**
```typescript
// Evaluate extract method refactoring
const proposal = await client.extractMethodEvaluate(
  '/sap/bc/adt/oo/classes/ZCL_EXAMPLE/source/main',
  {
    start: { line: 15, column: 2 },
    end: { line: 20, column: 30 }
  }
);

// Set method name
proposal.name = 'EXTRACTED_METHOD';
proposal.isStatic = false;
proposal.visibility = 'PRIVATE';

// Preview
const preview = await client.extractMethodPreview(proposal);

// Execute refactoring
const result = await client.extractMethodExecute(preview);

console.log('Method extraction completed');
```

## Documentation and Code Style

### Retrieve ABAP Documentation

```typescript
async abapDocumentation(
  objectUri: string,
  body: string,
  line: number,
  column: number,
  language: string = "EN"
): Promise<string>
```

Retrieves ABAP documentation.

**Parameters:**
- `objectUri`: Object URI
- `body`: Source code
- `line`: Line number
- `column`: Column number
- `language`: Language (default: "EN")

**Return value:**
- `string`: ABAP documentation HTML

**Example:**
```typescript
// Object URI and source code
const objectUri = '/sap/bc/adt/programs/programs/ZEXAMPLE';
const source = 'REPORT zexample.\n\nDATA: lv_text TYPE string.';

// Retrieve documentation at line 1, column 0 (REPORT keyword)
const documentation = await client.abapDocumentation(
  objectUri,
  source,
  1,     // Line
  0,     // Column
  'EN'   // English documentation
);

console.log('Documentation:', documentation);
```

### Code Style: Pretty Printer

```typescript
async prettyPrinterSetting(): Promise<PrettyPrinterSettings>
```

Retrieves Pretty Printer settings.

**Return value:**
- `PrettyPrinterSettings`: Pretty Printer settings

```typescript
async setPrettyPrinterSetting(
  indent: boolean,
  style: PrettyPrinterStyle
): Promise<string>
```

Changes Pretty Printer settings.

**Parameters:**
- `indent`: Whether to use indentation
- `style`: Style ('toLower', 'toUpper', 'keywordUpper', 'keywordLower', 'keywordAuto', 'none')

**Return value:**
- `string`: Response message

```typescript
async prettyPrinter(body: string): Promise<string>
```

Formats code using Pretty Printer.

**Parameters:**
- `body`: Original source code

**Return value:**
- `string`: Formatted source code

**Example:**
```typescript
// Retrieve Pretty Printer settings
const settings = await client.prettyPrinterSetting();
console.log('Current settings:', settings);

// Change settings
await client.setPrettyPrinterSetting(true, 'keywordUpper');

// Format code
const formattedSource = await client.prettyPrinter(source);
console.log('Formatted source code:', formattedSource);
```

## Type Hierarchy

```typescript
async typeHierarchy(
  url: string,
  body: string,
  line: number,
  offset: number,
  superTypes: boolean = false
): Promise<HierarchyNode[]>
```

Retrieves type hierarchy.

**Parameters:**
- `url`: Source code URL
- `body`: Source code
- `line`: Line number
- `offset`: Column number
- `superTypes`: Whether to include super types (optional, default: false)

**Return value:**
- `HierarchyNode[]`: Array of hierarchy nodes

**Example:**
```typescript
// Retrieve class hierarchy
const hierarchy = await client.typeHierarchy(
  '/sap/bc/adt/oo/classes/ZCL_EXAMPLE/source/main',
  source,
  5,     // Line
  10,    // Column
  true   // Include super types
);

// Output hierarchy
hierarchy.forEach(node => {
  console.log(`${node.type}: ${node.name}`);
});
```

## Class Components

```typescript
async classComponents(url: string): Promise<ClassComponent>
```

Retrieves class components.

**Parameters:**
- `url`: Class URL

**Return value:**
- `ClassComponent`: Class component information

**Example:**
```typescript
// Retrieve class components
const components = await client.classComponents('/sap/bc/adt/oo/classes/ZCL_EXAMPLE');

// Output component information
console.log(`Class: ${components['adtcore:name']}`);
console.log(`Visibility: ${components.visibility}`);

// Method list
const methods = components.components.filter(c => c['adtcore:type'] === 'method');
methods.forEach(method => {
  console.log(`Method: ${method['adtcore:name']}`);
});
```

## Fragment Mapping

```typescript
async fragmentMappings(
  url: string,
  type: string,
  name: string
): Promise<FragmentLocation>
```

Finds the location of an object fragment.

**Parameters:**
- `url`: Object URL
- `type`: Fragment type
- `name`: Fragment name

**Return value:**
- `FragmentLocation`: Fragment location

**Example:**
```typescript
// Find the location of a method in a class
const location = await client.fragmentMappings(
  '/sap/bc/adt/oo/classes/ZCL_EXAMPLE',
  'method',
  'CONSTRUCTOR'
);

console.log(`Method location: ${location.uri}#${location.line},${location.column}`);
```

## Example: Code Development Workflow

The following example demonstrates a code development workflow:

```typescript
import { ADTClient } from 'abap-adt-api';

async function developmentWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // Set stateful session
    client.stateful = "stateful";
    
    // 1. Retrieve object structure
    const programUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE';
    const programStructure = await client.objectStructure(programUrl);
    const sourceUrl = ADTClient.mainInclude(programStructure);
    
    // 2. Retrieve source code
    let source = await client.getObjectSource(sourceUrl);
    console.log('Current source code:', source);
    
    // 3. Syntax check
    const syntaxResults = await client.syntaxCheck(programUrl, sourceUrl, source);
    if (syntaxResults.length === 0) {
      console.log('No syntax errors');
    } else {
      console.log('Syntax errors:', syntaxResults);
    }
    
    // 4. Code completion proposals
    const completions = await client.codeCompletion(sourceUrl, source, 3, 10);
    console.log('Completion proposals:', completions.map(c => c.IDENTIFIER));
    
    // 5. Lock object
    const lock = await client.lock(programUrl);
    
    // 6. Modify code
    source += '\n* Modified: ' + new Date().toISOString();
    
    // 7. Format with Pretty Printer
    source = await client.prettyPrinter(source);
    
    // 8. Save modified source
    await client.setObjectSource(sourceUrl, source, lock.LOCK_HANDLE);
    console.log('Source code saved');
    
    // 9. Activate
    const result = await client.activate(
      programStructure.metaData['adtcore:name'],
      programUrl
    );
    console.log('Activation result:', result.success ? 'Success' : 'Failure');
    
    // 10. Release object lock
    await client.unLock(programUrl, lock.LOCK_HANDLE);
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
  }
}

developmentWorkflow();
```

## Notes

- Code completion and syntax checking work in stateless sessions as well, but code modification always requires a stateful session.
- Refactoring operations typically require a transport.
- ABAP documentation retrieval may be limited by the languages installed in the system.
- Pretty Printer settings affect server settings, so be careful when changing them in shared systems.