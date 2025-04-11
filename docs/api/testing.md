# Testing Features

This page explains how to run ABAP unit tests and analyze the results using the ABAP ADT API.

## Running Unit Tests

### Execute Unit Tests

```typescript
async unitTestRun(
  url: string,
  flags: UnitTestRunFlags = DefaultUnitTestRunFlags
): Promise<UnitTestClass[]>
```

Runs unit tests for an ABAP object.

**Parameters:**
- `url`: Object URL
- `flags`: Test run flags (optional, default: DefaultUnitTestRunFlags)

**Return value:**
- `UnitTestClass[]`: Array of test class results

**Example:**
```typescript
// Run unit tests for a class
const testResults = await client.unitTestRun('/sap/bc/adt/oo/classes/ZCL_TEST_CLASS');

console.log(`Number of test classes: ${testResults.length}`);

// Output test results
testResults.forEach(testClass => {
  console.log(`Test class: ${testClass['adtcore:name']}`);
  console.log(`- Risk level: ${testClass.riskLevel}`);
  console.log(`- Number of methods: ${testClass.testmethods.length}`);
  
  // Test method results
  testClass.testmethods.forEach(method => {
    console.log(`  Method: ${method['adtcore:name']}`);
    console.log(`  - Execution time: ${method.executionTime}ms`);
    console.log(`  - Number of alerts: ${method.alerts.length}`);
    
    // Output alerts (errors/exceptions)
    method.alerts.forEach(alert => {
      console.log(`    Alert: ${alert.kind} (${alert.severity})`);
      console.log(`    - Title: ${alert.title}`);
      alert.details.forEach(detail => {
        console.log(`    - Detail: ${detail}`);
      });
    });
  });
});
```

### Test Run Flags

```typescript
interface UnitTestRunFlags {
  harmless: boolean;   // Run harmless tests
  dangerous: boolean;  // Run dangerous tests
  critical: boolean;   // Run critical tests
  short: boolean;      // Run short tests
  medium: boolean;     // Run medium-length tests
  long: boolean;       // Run long tests
}
```

**Default flags:**
```typescript
const DefaultUnitTestRunFlags: UnitTestRunFlags = {
  harmless: true,   // Only run harmless tests
  dangerous: false, // Exclude dangerous tests
  critical: false,  // Exclude critical tests
  short: true,      // Only run short tests
  medium: false,    // Exclude medium-length tests
  long: false       // Exclude long tests
};
```

**Custom flags example:**
```typescript
// Run all types of tests
const allTestsFlags: UnitTestRunFlags = {
  harmless: true,
  dangerous: true,
  critical: true,
  short: true,
  medium: true,
  long: true
};

// Run tests with custom flags
const testResults = await client.unitTestRun('/sap/bc/adt/oo/classes/ZCL_TEST_CLASS', allTestsFlags);
```

### Evaluate Specific Test Methods

```typescript
async unitTestEvaluation(
  clas: UnitTestClass,
  flags: UnitTestRunFlags = DefaultUnitTestRunFlags
): Promise<UnitTestMethod[]>
```

Evaluates methods of a specific test class.

**Parameters:**
- `clas`: Test class
- `flags`: Test run flags (optional, default: DefaultUnitTestRunFlags)

**Return value:**
- `UnitTestMethod[]`: Array of test method results

**Example:**
```typescript
// Run tests for a class
const testResults = await client.unitTestRun('/sap/bc/adt/oo/classes/ZCL_TEST_CLASS');

// Detailed evaluation for the first test class
if (testResults.length > 0) {
  const evaluationResults = await client.unitTestEvaluation(testResults[0]);
  
  console.log('Test method evaluation results:');
  evaluationResults.forEach(method => {
    console.log(`Method: ${method['adtcore:name']}`);
    console.log(`- Execution time: ${method.executionTime}ms`);
    
    // Output alerts
    if (method.alerts.length > 0) {
      console.log('- Alerts:');
      method.alerts.forEach(alert => {
        console.log(`  - ${alert.kind} (${alert.severity}): ${alert.title}`);
      });
    } else {
      console.log('- No alerts (success)');
    }
  });
}
```

## Check Test Markers

### Retrieve Test Occurrence Markers

```typescript
async unitTestOccurrenceMarkers(
  uri: string,
  source: string
): Promise<UnitTestOccurrenceMarker[]>
```

Retrieves test occurrence markers from source code.

**Parameters:**
- `uri`: Source code URI
- `source`: Source code

**Return value:**
- `UnitTestOccurrenceMarker[]`: Array of test occurrence markers

**Example:**
```typescript
// Get class source code
const classURL = '/sap/bc/adt/oo/classes/ZCL_TEST_CLASS';
const objectStructure = await client.objectStructure(classURL);
const sourceURL = ADTClient.mainInclude(objectStructure);
const source = await client.getObjectSource(sourceURL);

// Retrieve test occurrence markers
const markers = await client.unitTestOccurrenceMarkers(sourceURL, source);

console.log(`Number of test markers: ${markers.length}`);
markers.forEach(marker => {
  console.log(`Marker kind: ${marker.kind}`);
  console.log(`- Location: Line ${marker.location.range.start.line}, Column ${marker.location.range.start.column}`);
  console.log(`- Keeps result: ${marker.keepsResult}`);
});
```

## Test Include Management

### Create Test Include

```typescript
async createTestInclude(
  clas: string,
  lockHandle: string,
  transport: string = ""
): Promise<void>
```

Creates a test include for a class.

**Parameters:**
- `clas`: Class name
- `lockHandle`: Lock handle
- `transport`: Transport number (optional)

**Example:**
```typescript
// Retrieve class object
const classURL = '/sap/bc/adt/oo/classes/ZCL_EXAMPLE';
const objectStructure = await client.objectStructure(classURL);

// Lock class
const lock = await client.lock(classURL);

// Create test include
await client.createTestInclude('ZCL_EXAMPLE', lock.LOCK_HANDLE, 'DEVK900123');
console.log('Test include has been created.');

// Release class lock
await client.unLock(classURL, lock.LOCK_HANDLE);
```

## Complete Unit Testing Workflow Example

The following example demonstrates a typical workflow for ABAP unit testing:

```typescript
import { ADTClient, UnitTestRunFlags } from 'abap-adt-api';

async function testingWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // 1. URL of the class to test
    const classURL = '/sap/bc/adt/oo/classes/ZCL_TEST_CLASS';
    
    // 2. Create test include if the class doesn't have one
    const objectStructure = await client.objectStructure(classURL);
    
    if (client.isClassStructure(objectStructure)) {
      const includes = ADTClient.classIncludes(objectStructure);
      
      // Create test class include if it doesn't exist
      if (!includes.has('testclasses')) {
        console.log('Creating test include...');
        
        // Lock class
        const lock = await client.lock(classURL);
        
        // Create test include
        await client.createTestInclude(
          objectStructure.metaData['adtcore:name'],
          lock.LOCK_HANDLE,
          'DEVK900123' // Transport number
        );
        
        console.log('Test include has been created.');
        
        // Release class lock
        await client.unLock(classURL, lock.LOCK_HANDLE);
        
        // Get updated object structure
        objectStructure = await client.objectStructure(classURL);
      }
    }
    
    // 3. Set unit test run flags
    const testFlags: UnitTestRunFlags = {
      harmless: true,    // Harmless tests
      dangerous: true,   // Dangerous tests
      critical: false,   // Exclude critical tests
      short: true,       // Short tests
      medium: true,      // Medium-length tests
      long: false        // Exclude long tests
    };
    
    // 4. Run unit tests
    console.log('Running unit tests...');
    const testResults = await client.unitTestRun(classURL, testFlags);
    
    // 5. Analyze test results
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    testResults.forEach(testClass => {
      console.log(`\nTest class: ${testClass['adtcore:name']}`);
      console.log(`Risk level: ${testClass.riskLevel}`);
      console.log(`Duration category: ${testClass.durationCategory}`);
      
      testClass.testmethods.forEach(method => {
        totalTests++;
        
        const hasFailed = method.alerts.some(alert => 
          alert.kind === 'failedAssertion' || alert.kind === 'exception'
        );
        
        if (hasFailed) {
          failedTests++;
          console.log(`❌ ${method['adtcore:name']} - Failed (${method.executionTime}ms)`);
          
          // Output failure details
          method.alerts.forEach(alert => {
            console.log(`  - ${alert.kind} (${alert.severity}): ${alert.title}`);
            alert.details.forEach(detail => {
              console.log(`    ${detail}`);
            });
            
            // Output stack trace
            if (alert.stack && alert.stack.length > 0) {
              console.log('  - Stack trace:');
              alert.stack.forEach(entry => {
                console.log(`    ${entry['adtcore:name']} (${entry['adtcore:uri']})`);
              });
            }
          });
        } else {
          passedTests++;
          console.log(`✅ ${method['adtcore:name']} - Success (${method.executionTime}ms)`);
        }
      });
    });
    
    // 6. Output summary
    console.log('\nTest Summary:');
    console.log(`- Total tests: ${totalTests}`);
    console.log(`- Passed tests: ${passedTests}`);
    console.log(`- Failed tests: ${failedTests}`);
    console.log(`- Success rate: ${(passedTests / totalTests * 100).toFixed(2)}%`);
    
    // 7. Check markers in test source code
    if (client.isClassStructure(objectStructure) && objectStructure.includes) {
      const testInclude = objectStructure.includes.find(i => i["class:includeType"] === "testclasses");
      
      if (testInclude) {
        const sourceURL = testInclude["abapsource:sourceUri"];
        const source = await client.getObjectSource(sourceURL);
        
        console.log('\nChecking test markers...');
        const markers = await client.unitTestOccurrenceMarkers(sourceURL, source);
        
        console.log(`Number of test markers: ${markers.length}`);
        markers.forEach(marker => {
          const line = marker.location.range.start.line;
          const column = marker.location.range.start.column;
          console.log(`- Marker (Line ${line}, Column ${column}): ${marker.kind}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await client.logout();
  }
}

testingWorkflow();
```

## Advanced Testing Features Examples

### Generate Test Results Report

The following example shows a function that generates a report based on test results:

```typescript
import { ADTClient, UnitTestClass, UnitTestMethod } from 'abap-adt-api';

// Function to generate test results report
function generateTestReport(testResults: UnitTestClass[]): string {
  let report = '# ABAP Unit Test Report\n\n';
  
  // Summary statistics
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let totalTime = 0;
  
  testResults.forEach(testClass => {
    testClass.testmethods.forEach(method => {
      totalTests++;
      totalTime += method.executionTime;
      
      if (method.alerts.length === 0) {
        passedTests++;
      } else {
        failedTests++;
      }
    });
  });
  
  // Add summary
  report += '## Summary\n\n';
  report += `- **Total tests:** ${totalTests}\n`;
  report += `- **Passed tests:** ${passedTests}\n`;
  report += `- **Failed tests:** ${failedTests}\n`;
  report += `- **Success rate:** ${(passedTests / totalTests * 100).toFixed(2)}%\n`;
  report += `- **Total execution time:** ${totalTime}ms\n\n`;
  
  // Results by class
  report += '## Results by Class\n\n';
  
  testResults.forEach(testClass => {
    const className = testClass['adtcore:name'];
    report += `### ${className}\n\n`;
    report += `- **Risk level:** ${testClass.riskLevel}\n`;
    report += `- **Duration category:** ${testClass.durationCategory}\n\n`;
    
    if (testClass.testmethods.length === 0) {
      report += '_No test methods_\n\n';
    } else {
      report += '| Method | Status | Time(ms) | Issues |\n';
      report += '|--------|------|----------|-------|\n';
      
      testClass.testmethods.forEach(method => {
        const methodName = method['adtcore:name'];
        const time = method.executionTime;
        const hasFailed = method.alerts.length > 0;
        const status = hasFailed ? '❌ Failed' : '✅ Success';
        
        // Issue summary
        let issues = '';
        if (hasFailed) {
          issues = method.alerts.map(alert => {
            return `${alert.kind} (${alert.severity}): ${alert.title}`;
          }).join('<br>');
        }
        
        report += `| ${methodName} | ${status} | ${time} | ${issues} |\n`;
      });
      
      report += '\n';
    }
    
    // Detailed information for failed tests
    const failedMethods = testClass.testmethods.filter(m => m.alerts.length > 0);
    if (failedMethods.length > 0) {
      report += '#### Failure Details\n\n';
      
      failedMethods.forEach(method => {
        report += `##### ${method['adtcore:name']}\n\n`;
        
        method.alerts.forEach(alert => {
          report += `- **${alert.kind} (${alert.severity}):** ${alert.title}\n`;
          
          if (alert.details.length > 0) {
            report += '  - Details:\n';
            alert.details.forEach(detail => {
              report += `    - ${detail}\n`;
            });
          }
          
          if (alert.stack && alert.stack.length > 0) {
            report += '      - Stack trace:\n';
            alert.stack.forEach(entry => {
              report += `    - ${entry['adtcore:name']} (${entry['adtcore:type']})\n`;
            });
          }
          
          report += '\n';
        });
      });
    }
  });
  
  return report;
}

// Example usage
async function generateTestReportExample() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // Run unit tests
    const testResults = await client.unitTestRun('/sap/bc/adt/oo/classes/ZCL_TEST_CLASS');
    
    // Generate test report
    const report = generateTestReport(testResults);
    
    // Save or output report
    console.log(report);
    
    // Save to file if file system is available
    // require('fs').writeFileSync('test-report.md', report);
    
    return report;
  } catch (error) {
    console.error('Error generating test report:', error);
    throw error;
  } finally {
    await client.logout();
  }
}
```

### Run All Tests in a Specific Package

The following example shows how to find and run all test classes in a specific package:

```typescript
import { ADTClient, UnitTestRunFlags } from 'abap-adt-api';

async function runAllPackageTests(client: ADTClient, packageName: string) {
  console.log(`Running all tests in package '${packageName}'...`);
  
  // 1. Retrieve objects in the package
  const packageContents = await client.nodeContents('DEVC/K', packageName);
  
  // 2. Filter class objects
  const classes = packageContents.nodes.filter(node => 
    node.OBJECT_TYPE === 'CLAS/OC'
  );
  
  console.log(`Found ${classes.length} classes in the package.`);
  
  // 3. Set test flags
  const testFlags: UnitTestRunFlags = {
    harmless: true,
    dangerous: false,
    critical: false,
    short: true,
    medium: true,
    long: false
  };
  
  // 4. Run tests for each class
  const results = [];
  
  for (let i = 0; i < classes.length; i++) {
    const classNode = classes[i];
    const classUrl = classNode.OBJECT_URI;
    const className = classNode.OBJECT_NAME;
    
    console.log(`[${i+1}/${classes.length}] Running tests for class '${className}'...`);
    
    try {
      // Run unit tests
      const testResult = await client.unitTestRun(classUrl, testFlags);
      
      // Add only if there are test results
      if (testResult.length > 0) {
        results.push({ className, classUrl, testResult });
        
        // Output simple summary
        const totalMethods = testResult.reduce((sum, tc) => sum + tc.testmethods.length, 0);
        const failedMethods = testResult.reduce((sum, tc) => 
          sum + tc.testmethods.filter(m => m.alerts.length > 0).length, 0);
        
        console.log(`- ${totalMethods - failedMethods} of ${totalMethods} tests passed, ${failedMethods} failed`);
      } else {
        console.log(`- No test results`);
      }
    } catch (error) {
      console.error(`- Error running tests for '${className}':`, error);
    }
  }
  
  // 5. Aggregate overall results
  console.log('\nPackage Test Overall Results:');
  
  let totalClasses = results.length;
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  results.forEach(result => {
    result.testResult.forEach(testClass => {
      testClass.testmethods.forEach(method => {
        totalTests++;
        if (method.alerts.length === 0) {
          passedTests++;
        } else {
          failedTests++;
        }
      });
    });
  });
  
  console.log(`- Classes with tests: ${totalClasses}`);
  console.log(`- Total test methods: ${totalTests}`);
  console.log(`- Passed tests: ${passedTests}`);
  console.log(`- Failed tests: ${failedTests}`);
  console.log(`- Success rate: ${(passedTests / totalTests * 100).toFixed(2)}%`);
  
  return results;
}

// Example usage
async function packageTestingExample() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    await runAllPackageTests(client, 'ZEXAMPLE_PKG');
  } catch (error) {
    console.error('Error during package testing:', error);
  } finally {
    await client.logout();
  }
}
```

## Notes

- Unit tests require a `FOR TESTING` section in the test class.
- Test execution consumes system resources, so be careful when running a large number of tests.
- High-risk tests (`dangerous` or `critical`) are excluded by default. Only run them when necessary.
- Using `createTestInclude` for a class without a test include will create a standard test template.
- Detailed information for failed unit tests can be found in the `alerts` array.
- Test markers help identify test-related locations in the source code.
- When using long-running tests, consider client timeout settings.