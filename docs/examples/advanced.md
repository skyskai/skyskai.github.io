# Advanced Examples

This page provides complex examples utilizing advanced features of the ABAP ADT API library.

## Table of Contents

- [Code Quality Analysis and Improvement](#code-quality-analysis-and-improvement)
- [Mass Object Modification](#mass-object-modification)
- [Test Automation](#test-automation)
- [ABAP Git Integration](#abap-git-integration)
- [Performance Tracing and Analysis](#performance-tracing-and-analysis)
- [Debugging Automation](#debugging-automation)

## Code Quality Analysis and Improvement

### Purpose

Shows how to analyze and improve code quality using ABAP Test Cockpit (ATC).

### Code

```typescript
// code-quality-analyzer.ts
import { ADTClient } from 'abap-adt-api';
import * as fs from 'fs';

async function analyzeCodeQuality() {
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password'
  );
  
  try {
    await client.login();
    
    // 1. Retrieve package contents
    const packageName = 'ZEXAMPLE_PKG';
    console.log(`Retrieving package '${packageName}' contents...`);
    
    const packageContents = await client.nodeContents('DEVC/K', packageName);
    console.log(`Number of objects in package: ${packageContents.nodes.length}`);
    
    // Filter objects to analyze (programs and classes only)
    const objectsToAnalyze = packageContents.nodes.filter(node => 
      node.OBJECT_TYPE === 'PROG/P' || node.OBJECT_TYPE === 'CLAS/OC'
    );
    
    console.log(`Number of objects to analyze: ${objectsToAnalyze.length}`);
    
    // 2. Retrieve ATC customizing information
    console.log('\nRetrieving ATC customizing information...');
    const customizing = await client.atcCustomizing();
    
    console.log('ATC properties:');
    customizing.properties.forEach(prop => {
      console.log(`- ${prop.name}: ${prop.value}`);
    });
    
    // 3. Select ATC check variant
    const checkVariant = 'DEFAULT';
    console.log(`\nSelecting ATC check variant '${checkVariant}'...`);
    await client.atcCheckVariant(checkVariant);
    
    // 4. Run ATC check for each object and analyze results
    console.log('\nStarting object analysis...');
    
    const analysisResults = [];
    
    for (let i = 0; i < objectsToAnalyze.length; i++) {
      const obj = objectsToAnalyze[i];
      console.log(`\n[${i + 1}/${objectsToAnalyze.length}] Analyzing '${obj.OBJECT_NAME}' (${obj.OBJECT_TYPE})...`);
      
      try {
        // Run ATC check
        const runResult = await client.createAtcRun(
          checkVariant,
          obj.OBJECT_URI,
          100 // Maximum number of results
        );
        
        // Retrieve ATC results
        const worklist = await client.atcWorklists(
          runResult.id,
          runResult.timestamp
        );
        
        // Aggregate results
        let totalFindings = 0;
        let priorityCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
        
        worklist.objects.forEach(object => {
          totalFindings += object.findings.length;
          
          object.findings.forEach(finding => {
            priorityCounts[finding.priority] = (priorityCounts[finding.priority] || 0) + 1;
          });
        });
        
        console.log(`Number of findings: ${totalFindings}`);
        console.log(`- Priority 1 (Very High): ${priorityCounts[1] || 0}`);
        console.log(`- Priority 2 (High): ${priorityCounts[2] || 0}`);
        console.log(`- Priority 3 (Medium): ${priorityCounts[3] || 0}`);
        console.log(`- Priority 4 (Low): ${priorityCounts[4] || 0}`);
        
        // Print top findings
        if (totalFindings > 0) {
          console.log('\nKey findings:');
          
          // Collect all findings
          const allFindings = [];
          worklist.objects.forEach(object => {
            object.findings.forEach(finding => {
              allFindings.push({
                object: object.name,
                type: object.type,
                checkId: finding.checkId,
                checkTitle: finding.checkTitle,
                messageTitle: finding.messageTitle,
                priority: finding.priority,
                location: `${finding.location.range.start.line}, ${finding.location.range.start.column}`
              });
            });
          });
          
          // Sort by priority
          allFindings.sort((a, b) => a.priority - b.priority);
          
          // Print top 5
          allFindings.slice(0, 5).forEach(finding => {
            console.log(`- [P${finding.priority}] ${finding.checkTitle}: ${finding.messageTitle}`);
            console.log(`  Location: ${finding.object}, line ${finding.location}`);
          });
        }
        
        // Save analysis results
        analysisResults.push({
          objectName: obj.OBJECT_NAME,
          objectType: obj.OBJECT_TYPE,
          totalFindings,
          priorityCounts,
          findings: worklist.objects.flatMap(object => 
            object.findings.map(finding => ({
              object: object.name,
              type: object.type,
              checkId: finding.checkId,
              checkTitle: finding.checkTitle,
              messageTitle: finding.messageTitle,
              priority: finding.priority,
              location: {
                line: finding.location.range.start.line,
                column: finding.location.range.start.column
              }
            }))
          )
        });
        
      } catch (error) {
        console.error(`Error analyzing '${obj.OBJECT_NAME}':`, error);
      }
    }
    
    // 5. Generate analysis report
    console.log('\nGenerating analysis report...');
    
    let reportMarkdown = `# ABAP Code Quality Analysis Report\n\n`;
    reportMarkdown += `Analysis date: ${new Date().toISOString()}\n\n`;
    reportMarkdown += `## Summary\n\n`;
    reportMarkdown += `- Number of analyzed objects: ${analysisResults.length}\n`;
    
    // Total number of findings
    const totalIssues = analysisResults.reduce((sum, result) => sum + result.totalFindings, 0);
    reportMarkdown += `- Total number of findings: ${totalIssues}\n`;
    
    // Aggregate by priority
    const totalPriorityCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    analysisResults.forEach(result => {
      Object.entries(result.priorityCounts).forEach(([priority, count]) => {
        totalPriorityCounts[priority] = (totalPriorityCounts[priority] || 0) + count;
      });
    });
    
    reportMarkdown += `- Findings by priority:\n`;
    reportMarkdown += `  - Priority 1 (Very High): ${totalPriorityCounts[1] || 0}\n`;
    reportMarkdown += `  - Priority 2 (High): ${totalPriorityCounts[2] || 0}\n`;
    reportMarkdown += `  - Priority 3 (Medium): ${totalPriorityCounts[3] || 0}\n`;
    reportMarkdown += `  - Priority 4 (Low): ${totalPriorityCounts[4] || 0}\n\n`;
    
    // Priority 1 findings (immediate action required)
    const priority1Findings = analysisResults.flatMap(result => 
      result.findings.filter(f => f.priority === 1)
    );
    
    if (priority1Findings.length > 0) {
      reportMarkdown += `## Priority 1 Findings (Immediate Action Required)\n\n`;
      
      priority1Findings.forEach(finding => {
        reportMarkdown += `### ${finding.object}\n\n`;
        reportMarkdown += `- Check: ${finding.checkTitle}\n`;
        reportMarkdown += `- Message: ${finding.messageTitle}\n`;
        reportMarkdown += `- Location: Line ${finding.location.line}, Column ${finding.location.column}\n\n`;
      });
    }
    
    // Findings by object
    reportMarkdown += `## Findings by Object\n\n`;
    
    const sortedResults = [...analysisResults].sort((a, b) => b.totalFindings - a.totalFindings);
    
    sortedResults.forEach(result => {
      reportMarkdown += `### ${result.objectName} (${result.objectType})\n\n`;
      reportMarkdown += `- Total findings: ${result.totalFindings}\n`;
      reportMarkdown += `- Priority distribution:\n`;
      reportMarkdown += `  - P1: ${result.priorityCounts[1] || 0}\n`;
      reportMarkdown += `  - P2: ${result.priorityCounts[2] || 0}\n`;
      reportMarkdown += `  - P3: ${result.priorityCounts[3] || 0}\n`;
      reportMarkdown += `  - P4: ${result.priorityCounts[4] || 0}\n\n`;
      
      if (result.findings.length > 0) {
        reportMarkdown += `#### Finding List\n\n`;
        reportMarkdown += `| Priority | Check | Message | Location |\n`;
        reportMarkdown += `|----------|------|--------|------|\n`;
        
        result.findings.forEach(finding => {
          reportMarkdown += `| P${finding.priority} | ${finding.checkTitle} | ${finding.messageTitle} | ${finding.location.line}, ${finding.location.column} |\n`;
        });
        
        reportMarkdown += `\n`;
      }
    });
    
    // 6. Save report
    const reportFile = './atc-report.md';
    fs.writeFileSync(reportFile, reportMarkdown);
    console.log(`Analysis report saved to ${reportFile}`);
    
    // 7. Improvement suggestions (priority 1 items)
    if (priority1Findings.length > 0) {
      console.log('\nImprovement suggestions for priority 1 items:');
      
      for (const finding of priority1Findings.slice(0, 3)) { // Process only first 3
        try {
          console.log(`\nProcessing finding for ${finding.object}...`);
          
          // Retrieve exemption proposal for finding
          if (finding.quickfixInfo) {
            const proposal = await client.atcExemptProposal(finding.quickfixInfo);
            
            if (!client.isProposalMessage(proposal)) {
              console.log('Exemption proposal information:');
              console.log(`- Package: ${proposal.package}`);
              console.log(`- Reason: ${proposal.reason}`);
              
              // Prepare exemption request (not executed in this example)
              console.log('Exemption request prepared (not executed in this example)');
              /* Uncomment to actually execute
              proposal.reason = 'FPOS';  // False Positive
              proposal.justification = 'This check does not apply in this situation.';
              
              const result = await client.atcRequestExemption(proposal);
              console.log(`Exemption request result: ${result.message} (${result.type})`);
              */
            } else {
              console.log(`Message: ${proposal.message} (${proposal.type})`);
            }
          }
        } catch (error) {
          console.error('Error processing exemption proposal:', error);
        }
      }
    }
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
    console.log('Logout completed');
  }
}

analyzeCodeQuality().catch(console.error);
```

### Output Example

```
Retrieving package 'ZEXAMPLE_PKG' contents...
Number of objects in package: 15
Number of objects to analyze: 8

Retrieving ATC customizing information...
ATC properties:
- useAsDefault: true
- hideInWorkbench: false
...

Starting object analysis...

[1/8] Analyzing 'ZCL_EXAMPLE_CLASS' (CLAS/OC)...
Number of findings: 12
- Priority 1 (Very High): 2
- Priority 2 (High): 3
- Priority 3 (Medium): 4
- Priority 4 (Low): 3

Key findings:
- [P1] Unused variable: Variable 'LV_TEMP' is declared but not used
  Location: ZCL_EXAMPLE_CLASS, line 42, 5
- [P1] Memory leak: Internal table not released
  Location: ZCL_EXAMPLE_CLASS, line 78, 3
...

Generating analysis report...
Analysis report saved to ./atc-report.md

Improvement suggestions for priority 1 items:

Processing finding for ZCL_EXAMPLE_CLASS...
Exemption proposal information:
- Package: ZEXAMPLE_PKG
- Reason: 
Exemption request prepared (not executed in this example)

Logout completed
```

### How to Extend

- Implement automatic fix functionality
- Schedule regular code quality monitoring
- Integrate with team code review systems

## Mass Object Modification

### Purpose

Shows how to modify multiple ABAP objects in batch.

### Code

```typescript
// mass-object-modifier.ts
import { ADTClient } from 'abap-adt-api';
import * as fs from 'fs';

async function massObjectModifier() {
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password'
  );
  
  try {
    await client.login();
    
    // Set stateful session (required for object locking)
    client.stateful = "stateful";
    
    // 1. Define patterns to change
    const searchPattern = 'OLD_PATTERN';
    const replacePattern = 'NEW_PATTERN';
    
    console.log(`Search pattern: '${searchPattern}'`);
    console.log(`Replace pattern: '${replacePattern}'`);
    
    // 2. Retrieve package contents
    const packageName = 'ZEXAMPLE_PKG';
    console.log(`\nRetrieving package '${packageName}' contents...`);
    
    const packageContents = await client.nodeContents('DEVC/K', packageName);
    
    // Filter programs only (can add more types)
    const programs = packageContents.nodes.filter(node => 
      node.OBJECT_TYPE === 'PROG/P' || node.OBJECT_TYPE === 'CLAS/OC'
    );
    
    console.log(`Number of objects to modify: ${programs.length}`);
    
    // 3. Retrieve transport information
    console.log('\nRetrieving transport information...');
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
        'Mass object modification',
        packageName
      );
      
      console.log(`New transport created: ${transportNumber}`);
    }
    
    // 4. Prepare change log
    const changeLog = {
      timestamp: new Date().toISOString(),
      searchPattern,
      replacePattern,
      package: packageName,
      transport: transportNumber,
      totalObjects: programs.length,
      changedObjects: [],
      errorObjects: []
    };
    
    // 5. Process each object
    console.log('\nStarting object processing...');
    
    for (let i = 0; i < programs.length; i++) {
      const program = programs[i];
      console.log(`\n[${i + 1}/${programs.length}] Processing '${program.OBJECT_NAME}' (${program.OBJECT_TYPE})...`);
      
      try {
        // Retrieve object structure
        const objectStructure = await client.objectStructure(program.OBJECT_URI);
        
        // Create list of source files based on object type
        let sourceFiles = [];
        
        if (program.OBJECT_TYPE === 'CLAS/OC' && client.isClassStructure(objectStructure)) {
          // For classes, process all includes
          const includes = ADTClient.classIncludes(objectStructure);
          sourceFiles = Array.from(includes.entries()).map(([type, url]) => ({ type, url }));
        } else {
          // For other object types, process only main source
          const mainUrl = ADTClient.mainInclude(objectStructure);
          sourceFiles = [{ type: 'main', url: mainUrl }];
        }
        
        // Process each source file
        let objectChanged = false;
        const objectChanges = [];
        
        for (const sourceFile of sourceFiles) {
          // Retrieve source code
          const source = await client.getObjectSource(sourceFile.url);
          
          // Search for pattern
          if (source.includes(searchPattern)) {
            // Lock object
            const lock = await client.lock(program.OBJECT_URI);
            
            try {
              // Modify source code
              const modifiedSource = source.replace(new RegExp(searchPattern, 'g'), replacePattern);
              
              // Track changed lines
              const changes = [];
              const originalLines = source.split('\n');
              const modifiedLines = modifiedSource.split('\n');
              
              for (let j = 0; j < originalLines.length; j++) {
                if (originalLines[j] !== modifiedLines[j]) {
                  changes.push({
                    line: j + 1,
                    original: originalLines[j],
                    modified: modifiedLines[j]
                  });
                }
              }
              
              // Save modified source
              await client.setObjectSource(sourceFile.url, modifiedSource, lock.LOCK_HANDLE, transportNumber);
              
              // Add to change log
              objectChanges.push({
                sourceType: sourceFile.type,
                changes: changes
              });
              
              objectChanged = true;
              console.log(`  ${sourceFile.type} source modified: ${changes.length} lines changed`);
              
              // Unlock object
              await client.unLock(program.OBJECT_URI, lock.LOCK_HANDLE);
            } catch (error) {
              // Try to unlock on error
              try {
                await client.unLock(program.OBJECT_URI, lock.LOCK_HANDLE);
              } catch { /* ignore */ }
              
              throw error;
            }
          } else {
            console.log(`  No pattern found in ${sourceFile.type} source`);
          }
        }
        
        // Activate if changed
        if (objectChanged) {
          console.log('  Activating object...');
          const activationResult = await client.activate(
            program.OBJECT_NAME,
            program.OBJECT_URI
          );
          
          if (activationResult.success) {
            console.log('  Activation successful');
            
            // Add to change log
            changeLog.changedObjects.push({
              name: program.OBJECT_NAME,
              type: program.OBJECT_TYPE,
              sourceChanges: objectChanges,
              activated: true
            });
          } else {
            console.log('  Activation failed');
            
            // Add to change log (activation failed)
            changeLog.changedObjects.push({
              name: program.OBJECT_NAME,
              type: program.OBJECT_TYPE,
              sourceChanges: objectChanges,
              activated: false,
              activationMessages: activationResult.messages
            });
          }
        }
        
      } catch (error) {
        console.error(`  Error processing '${program.OBJECT_NAME}':`, error);
        
        // Add to error log
        changeLog.errorObjects.push({
          name: program.OBJECT_NAME,
          type: program.OBJECT_TYPE,
          error: error.toString()
        });
      }
    }
    
    // 6. Change summary and log saving
    console.log('\nChange summary:');
    console.log(`- Total objects: ${programs.length}`);
    console.log(`- Changed objects: ${changeLog.changedObjects.length}`);
    console.log(`- Error objects: ${changeLog.errorObjects.length}`);
    
    // Save log file
    const logFile = './change-log.json';
    fs.writeFileSync(logFile, JSON.stringify(changeLog, null, 2));
    console.log(`\nChange log saved to ${logFile}`);
    
    // 7. Generate change report
    const reportMarkdown = generateChangeReport(changeLog);
    const reportFile = './change-report.md';
    fs.writeFileSync(reportFile, reportMarkdown);
    console.log(`Change report saved to ${reportFile}`);
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
    console.log('Logout completed');
  }
}

// Function to generate change report
function generateChangeReport(changeLog) {
  let report = `# ABAP Mass Object Change Report\n\n`;
  report += `Execution date: ${changeLog.timestamp}\n\n`;
  report += `## Change Information\n\n`;
  report += `- Search pattern: \`${changeLog.searchPattern}\`\n`;
  report += `- Replace pattern: \`${changeLog.replacePattern}\`\n`;
  report += `- Package: ${changeLog.package}\n`;
  report += `- Transport: ${changeLog.transport}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Total objects: ${changeLog.totalObjects}\n`;
  report += `- Changed objects: ${changeLog.changedObjects.length}\n`;
  report += `- Error objects: ${changeLog.errorObjects.length}\n\n`;
  
  // List of changed objects
  if (changeLog.changedObjects.length > 0) {
    report += `## Changed Objects\n\n`;
    report += `| Object Name | Type | Changed Lines | Activation Status |\n`;
    report += `|-----------|------|--------------|------------|\n`;
    
    changeLog.changedObjects.forEach(obj => {
      const totalChangedLines = obj.sourceChanges.reduce(
        (sum, src) => sum + src.changes.length, 0
      );
      
      report += `| ${obj.name} | ${obj.type} | ${totalChangedLines} | ${obj.activated ? 'Success' : 'Failed'} |\n`;
    });
    
    report += `\n`;
    
    // Activation failure details
    const failedObjects = changeLog.changedObjects.filter(obj => !obj.activated);
    if (failedObjects.length > 0) {
      report += `### Objects with Activation Failures\n\n`;
      
      failedObjects.forEach(obj => {
        report += `#### ${obj.name} (${obj.type})\n\n`;
        report += `Activation messages:\n\n`;
        
        obj.activationMessages.forEach(msg => {
          report += `- ${msg.type}: ${msg.shortText}\n`;
        });
        
        report += `\n`;
      });
    }
    
    // Change examples
    report += `### Key Change Examples\n\n`;
    
    // Show only first 3 objects
    changeLog.changedObjects.slice(0, 3).forEach(obj => {
      report += `#### ${obj.name} (${obj.type})\n\n`;
      
      obj.sourceChanges.forEach(src => {
        report += `**${src.sourceType} source:**\n\n`;
        
        // Show only first 5 changes
        src.changes.slice(0, 5).forEach(change => {
          report += `Line ${change.line}:\n`;
          report += `- Before: \`${change.original}\`\n`;
          report += `- After: \`${change.modified}\`\n\n`;
        });
        
        if (src.changes.length > 5) {
          report += `*... plus ${src.changes.length - 5} more changes*\n\n`;
        }
      });
    });
    
    if (changeLog.changedObjects.length > 3) {
      report += `*... plus ${changeLog.changedObjects.length - 3} more objects*\n\n`;
    }
  }
  
  // List of error objects
  if (changeLog.errorObjects.length > 0) {
    report += `## Error Objects\n\n`;
    
    changeLog.errorObjects.forEach(obj => {
      report += `### ${obj.name} (${obj.type})\n\n`;
      report += `Error: ${obj.error}\n\n`;
    });
  }
  
  return report;
}

massObjectModifier().catch(console.error);
```

### How to Extend

- Enhance regex pattern support
- Add change preview and confirmation functionality
- Implement rollback mechanism

## Test Automation

### Purpose

Shows how to automate ABAP unit tests and report test results.

### Code

```typescript
// test-automation.ts
import { ADTClient, UnitTestRunFlags } from 'abap-adt-api';
import * as fs from 'fs';

async function automateTests() {
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password'
  );
  
  try {
    await client.login();
    
    // 1. Test configuration
    const packageName = 'ZEXAMPLE_PKG';
    
    // Set test flags (run all types of tests)
    const testFlags: UnitTestRunFlags = {
      harmless: true,
      dangerous: true,
      critical: false,  // Exclude critical tests
      short: true,
      medium: true,
      long: false       // Exclude long tests
    };
    
    console.log(`Starting test automation for package '${packageName}'`);
    console.log('Test flags:', testFlags);
    
    // 2. Retrieve package contents
    console.log('\nRetrieving package contents...');
    const packageContents = await client.nodeContents('DEVC/K', packageName);
    
    // Filter only classes
    const classes = packageContents.nodes.filter(node => 
      node.OBJECT_TYPE === 'CLAS/OC'
    );
    
    console.log(`Number of classes found: ${classes.length}`);
    
    // 3. Identify test classes
    console.log('\nIdentifying test classes...');
    const testClasses = [];
    
    for (const cls of classes) {
      // Retrieve object structure
      const objectStructure = await client.objectStructure(cls.OBJECT_URI);
      
      // Verify if it's a class structure
      if (client.isClassStructure(objectStructure)) {
        // Check for test class include
        const includes = ADTClient.classIncludes(objectStructure);
        
        if (includes.has('testclasses')) {
          testClasses.push({
            name: cls.OBJECT_NAME,
            uri: cls.OBJECT_URI,
            includeUrl: includes.get('testclasses')
          });
          
          console.log(`- ${cls.OBJECT_NAME} (has test class include)`);
        }
      }
    }
    
    console.log(`Number of classes with test class includes: ${testClasses.length}`);
    
    // 4. Run tests
    console.log('\nRunning tests...');
    
    const testResults = [];
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    for (let i = 0; i < testClasses.length; i++) {
      const testClass = testClasses[i];
      console.log(`\n[${i + 1}/${testClasses.length}] Running tests for '${testClass.name}'...`);
      
      try {
        // Run unit tests
        const results = await client.unitTestRun(testClass.uri, testFlags);
        
        // Aggregate results
        let classTests = 0;
        let classPassed = 0;
        let classFailed = 0;
        
        // There may be no test results
        if (results.length === 0) {
          console.log('  No test results found');
          continue;
        }
        
        results.forEach(result => {
          console.log(`  Test class: ${result['adtcore:name']} (${result.testmethods.length} methods)`);
          
          result.testmethods.forEach(method => {
            classTests++;
            
            if (method.alerts.length === 0) {
              classPassed++;
            } else {
              classFailed++;
              
              console.log(`    ❌ ${method['adtcore:name']} - Failed`);
              method.alerts.forEach(alert => {
                console.log(`      - ${alert.kind} (${alert.severity}): ${alert.title}`);
              });
            }
          });
        });
        
        console.log(`  Results: ${classPassed}/${classTests} passed (${(classPassed / classTests * 100).toFixed(2)}%)`);
        
        // Update overall statistics
        totalTests += classTests;
        passedTests += classPassed;
        failedTests += classFailed;
        
        // Save results
        testResults.push({
          className: testClass.name,
          classUri: testClass.uri,
          results: results,
          summary: {
            total: classTests,
            passed: classPassed,
            failed: classFailed,
            passRate: classPassed / classTests
          }
        });
        
      } catch (error) {
        console.error(`  Error running tests for '${testClass.name}':`, error);
        
        // Save error result
        testResults.push({
          className: testClass.name,
          classUri: testClass.uri,
          error: error.toString()
        });
      }
    }
    
    // 5. Test summary
    console.log('\nTest results summary:');
    console.log(`- Total tests: ${totalTests}`);
    console.log(`- Passed tests: ${passedTests}`);
    console.log(`- Failed tests: ${failedTests}`);
    console.log(`- Pass rate: ${(passedTests / totalTests * 100).toFixed(2)}%`);
    
    // 6. Generate test report
    console.log('\nGenerating test report...');
    
    const reportMarkdown = generateTestReport(testResults, {
      totalTests,
      passedTests,
      failedTests
    });
    
    const reportFile = './test-report.md';
    fs.writeFileSync(reportFile, reportMarkdown);
    console.log(`Test report saved to ${reportFile}`);
    
    // 7. Generate JUnit XML report (for CI/CD integration)
    console.log('\nGenerating JUnit XML report...');
    
    const junitXml = generateJUnitXml(testResults, packageName);
    
    const junitFile = './test-results.xml';
    fs.writeFileSync(junitFile, junitXml);
    console.log(`JUnit XML report saved to ${junitFile}`);
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
    console.log('Logout completed');
  }
}

// Function to generate test report
function generateTestReport(testResults, summary) {
  let report = `# ABAP Unit Test Report\n\n`;
  report += `Execution date: ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Total tests: ${summary.totalTests}\n`;
  report += `- Passed tests: ${summary.passedTests}\n`;
  report += `- Failed tests: ${summary.failedTests}\n`;
  report += `- Pass rate: ${(summary.passedTests / summary.totalTests * 100).toFixed(2)}%\n\n`;
  
  // Results by class
  report += `## Results by Class\n\n`;
  report += `| Class | Tests | Passed | Failed | Pass Rate |\n`;
  report += `|--------|-----------|------|------|--------|\n`;
  
  testResults.forEach(result => {
    if (result.error) {
      report += `| ${result.className} | - | - | - | ❌ Error |\n`;
    } else {
      const summary = result.summary;
      report += `| ${result.className} | ${summary.total} | ${summary.passed} | ${summary.failed} | ${(summary.passRate * 100).toFixed(2)}% |\n`;
    }
  });
  
  report += `\n`;
  
  // Failed test details
  const failedTestResults = testResults.filter(r => r.summary && r.summary.failed > 0);
  
  if (failedTestResults.length > 0) {
    report += `## Failed Test Details\n\n`;
    
    failedTestResults.forEach(result => {
      report += `### ${result.className}\n\n`;
      
      result.results.forEach(cls => {
        const failedMethods = cls.testmethods.filter(m => m.alerts.length > 0);
        
        failedMethods.forEach(method => {
          report += `#### ${method['adtcore:name']}\n\n`;
          
          method.alerts.forEach(alert => {
            report += `- **${alert.kind} (${alert.severity})**: ${alert.title}\n`;
            
            if (alert.details.length > 0) {
              report += `  Details:\n`;
              alert.details.forEach(detail => {
                report += `  - ${detail}\n`;
              });
            }
            
            if (alert.stack && alert.stack.length > 0) {
              report += `  Stack trace:\n`;
              alert.stack.forEach(entry => {
                report += `  - ${entry['adtcore:name']} (${entry['adtcore:type']})\n`;
              });
            }
            
            report += `\n`;
          });
        });
      });
    });
  }
  
  // Error classes
  const errorResults = testResults.filter(r => r.error);
  
  if (errorResults.length > 0) {
    report += `## Classes with Errors\n\n`;
    
    errorResults.forEach(result => {
      report += `### ${result.className}\n\n`;
      report += `Error: ${result.error}\n\n`;
    });
  }
  
  return report;
}

// Function to generate JUnit XML report (for CI/CD integration)
function generateJUnitXml(testResults, packageName) {
  const timestamp = new Date().toISOString();
  let totalTests = 0;
  let failures = 0;
  let errors = 0;
  let skipped = 0;
  let time = 0;
  
  let testCases = '';
  
  // Process each test case
  testResults.forEach(result => {
    if (result.error) {
      // Class with error
      testCases += `  <testcase classname="${packageName}.${result.className}" name="${result.className}" time="0">\n`;
      testCases += `    <error message="Test execution error" type="ExecutionError">${escapeXml(result.error)}</error>\n`;
      testCases += `  </testcase>\n`;
      errors++;
      totalTests++;
    } else if (result.results) {
      // Class with test results
      result.results.forEach(cls => {
        cls.testmethods.forEach(method => {
          totalTests++;
          time += method.executionTime / 1000; // Convert milliseconds to seconds
          
          testCases += `  <testcase classname="${packageName}.${result.className}" name="${method['adtcore:name']}" time="${method.executionTime / 1000}">\n`;
          
          if (method.alerts.length > 0) {
            failures++;
            
            // Use only first alert
            const alert = method.alerts[0];
            testCases += `    <failure message="${escapeXml(alert.title)}" type="${alert.kind}">\n`;
            
            // Add details
            if (alert.details.length > 0) {
              testCases += escapeXml(alert.details.join('\n'));
            }
            
            testCases += `\n    </failure>\n`;
          }
          
          testCases += `  </testcase>\n`;
        });
      });
    }
  });
  
  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<testsuites name="${packageName}" tests="${totalTests}" failures="${failures}" errors="${errors}" skipped="${skipped}" time="${time}">\n`;
  xml += `<testsuite name="${packageName}" tests="${totalTests}" failures="${failures}" errors="${errors}" skipped="${skipped}" time="${time}" timestamp="${timestamp}">\n`;
  xml += testCases;
  xml += '</testsuite>\n';
  xml += '</testsuites>';
  
  return xml;
}

// XML escape function
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

automateTests().catch(console.error);
```

### How to Extend

- Add code coverage analysis
- Implement test result visualization
- Integrate with CI/CD pipeline

## ABAP Git Integration

### Purpose

Shows how to synchronize ABAP objects with external Git repositories using ABAP Git.

### Code

```typescript
// abap-git-integration.ts
import { ADTClient, GitRepo, GitStaging } from 'abap-adt-api';
import * as fs from 'fs';

async function abapGitIntegration() {
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password'
  );
  
  try {
    await client.login();
    
    // 1. Retrieve registered Git repositories
    console.log('Retrieving registered Git repositories...');
    const repositories = await client.gitRepos();
    
    console.log(`Number of repositories found: ${repositories.length}`);
    repositories.forEach((repo, index) => {
      console.log(`\n[${index + 1}] ${repo.url}`);
      console.log(`  - Package: ${repo.sapPackage}`);
      console.log(`  - Branch: ${repo.branch_name}`);
      console.log(`  - Status: ${repo.status_text || 'Normal'}`);
    });
    
    // 2. Register new repository (optional)
    const createNewRepo = false; // Change as needed
    
    if (createNewRepo) {
      const packageName = 'ZEXAMPLE_PKG';
      const repoUrl = 'https://github.com/example/example-repo.git';
      const branch = 'refs/heads/main';
      
      console.log(`\nRegistering new Git repository...`);
      console.log(`  - Package: ${packageName}`);
      console.log(`  - URL: ${repoUrl}`);
      console.log(`  - Branch: ${branch}`);
      
      try {
        const result = await client.gitCreateRepo(
          packageName,
          repoUrl,
          branch
        );
        
        console.log('Repository registered successfully!');
        
        if (result && result.length > 0) {
          console.log('Pull results:');
          result.forEach(obj => {
            console.log(`  - ${obj.obj_name} (${obj.obj_type}): ${obj.obj_status}`);
          });
        }
      } catch (error) {
        console.error('Repository registration failed:', error);
      }
    }
    
    // Exit if no repositories are found
    if (repositories.length === 0) {
      console.log('\nNo repositories to work with.');
      return;
    }
    
    // 3. Work with first repository
    const repo = repositories[0];
    console.log(`\nStarting work with repository '${repo.url}'`);
    
    // 4. Retrieve remote repository information
    console.log('\nRetrieving remote repository information...');
    
    try {
      const repoInfo = await client.gitExternalRepoInfo(repo.url);
      
      console.log(`Access mode: ${repoInfo.access_mode}`);
      console.log('Branches:');
      
      repoInfo.branches.forEach(branch => {
        console.log(`  - ${branch.display_name} (${branch.is_head ? 'Current HEAD' : ''})`);
      });
      
      // 5. Check repository status
      console.log('\nChecking repository status...');
      await client.checkRepo(repo);
      console.log('Repository status normal');
      
      // 6. Retrieve staging area
      console.log('\nRetrieving staging area...');
      const staging = await client.stageRepo(repo);
      
      console.log('Changes:');
      console.log(`  - Staged objects: ${staging.staged.length}`);
      console.log(`  - Unstaged objects: ${staging.unstaged.length}`);
      console.log(`  - Ignored objects: ${staging.ignored.length}`);
      
      // Log changes to file
      const stagingLog = {
        timestamp: new Date().toISOString(),
        repository: {
          url: repo.url,
          package: repo.sapPackage,
          branch: repo.branch_name
        },
        staged: staging.staged.map(obj => ({
          name: obj.name,
          type: obj.type,
          files: obj.abapGitFiles.map(file => file.name)
        })),
        unstaged: staging.unstaged.map(obj => ({
          name: obj.name,
          type: obj.type,
          files: obj.abapGitFiles.map(file => file.name)
        })),
        ignored: staging.ignored.map(obj => ({
          name: obj.name,
          type: obj.type
        }))
      };
      
      fs.writeFileSync('./git-staging.json', JSON.stringify(stagingLog, null, 2));
      console.log('Staging status saved to git-staging.json');
      
      // 7. Stage and push changes (optional)
      const performPush = false; // Change as needed
      
      if (performPush && staging.unstaged.length > 0) {
        console.log('\nStaging changes...');
        
        // Move all unstaged objects to staging area
        for (const obj of staging.unstaged) {
          // Check if not conflicting with already staged object
          const existingStagedObj = staging.staged.find(s => s.wbkey === obj.wbkey);
          
          if (!existingStagedObj) {
            // Move to staging area
            staging.staged.push(obj);
            
            // Remove from unstaged list
            staging.unstaged = staging.unstaged.filter(u => u.wbkey !== obj.wbkey);
            
            console.log(`  - '${obj.name}' (${obj.type}) staged`);
          } else {
            console.log(`  - '${obj.name}' (${obj.type}) staging skipped (already exists)`);
          }
        }
        
        // Set commit info
        staging.comment = `Automatic push via ADT API (${new Date().toISOString()})`;
        staging.author = {
          name: client.username,
          email: `${client.username.toLowerCase()}@example.com`
        };
        staging.committer = { ...staging.author };
        
        console.log('\nPushing changes...');
        console.log(`  - Commit message: ${staging.comment}`);
        console.log(`  - Commit author: ${staging.author.name} <${staging.author.email}>`);
        
        try {
          await client.pushRepo(repo, staging);
          console.log('Push successful!');
        } catch (error) {
          console.error('Push failed:', error);
        }
      }
      
      // 8. Pull repository (optional)
      const performPull = false; // Change as needed
      
      if (performPull) {
        console.log('\nPulling remote changes...');
        
        try {
          const pullResult = await client.gitPullRepo(
            repo.key,
            repo.branch_name
          );
          
          console.log('Pull successful!');
          
          if (pullResult && pullResult.length > 0) {
            console.log('Objects pulled:');
            pullResult.forEach(obj => {
              console.log(`  - ${obj.obj_name} (${obj.obj_type}): ${obj.obj_status}`);
            });
          } else {
            console.log('No changes pulled');
          }
        } catch (error) {
          console.error('Pull failed:', error);
        }
      }
      
      // 9. Switch branch (optional)
      const switchBranch = false; // Change as needed
      const targetBranch = 'refs/heads/feature/example';
      
      if (switchBranch && repoInfo.branches.some(b => b.name === targetBranch)) {
        console.log(`\nSwitching to branch '${targetBranch}'...`);
        
        try {
          await client.switchRepoBranch(repo, targetBranch);
          console.log('Branch switch successful!');
        } catch (error) {
          console.error('Branch switch failed:', error);
        }
      }
      
    } catch (error) {
      console.error('Error during repository operations:', error);
    }
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
    console.log('\nLogout completed');
  }
}

abapGitIntegration().catch(console.error);
```

### How to Extend

- Integrate Git repository with CI/CD pipeline
- Automate regular synchronization of changes
- Add branch and tag management functionality

## Performance Tracing and Analysis

### Purpose

Shows how to identify and analyze performance issues using ABAP tracing functionality.

### Code

```typescript
// performance-analyzer.ts
import { ADTClient, TracesCreationConfig, TraceParameters } from 'abap-adt-api';
import * as fs from 'fs';

async function performanceAnalyzer() {
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password'
  );
  
  try {
    await client.login();
    
    // 1. Retrieve existing traces for current user
    console.log('Retrieving existing traces...');
    const traceRuns = await client.tracesList();
    
    console.log(`Number of traces found: ${traceRuns.runs.length}`);
    traceRuns.runs.forEach((run, index) => {
      console.log(`\n[${index + 1}] ${run.title}`);
      console.log(`  - ID: ${run.id.split(',').pop()}`);
      console.log(`  - Creation date: ${run.published.toISOString()}`);
      console.log(`  - Status: ${run.extendedData.state.text}`);
      console.log(`  - Object: ${run.extendedData.objectName}`);
      console.log(`  - Runtime: ${run.extendedData.runtime}μs`);
    });
    
    // 2. Set trace parameters
    console.log('\nSetting trace parameters...');
    
    const traceParameters: TraceParameters = {
      allMiscAbapStatements: true,
      allProceduralUnits: true,
      allInternalTableEvents: false,
      allDynproEvents: false,
      description: 'Performance Analysis Trace',
      aggregate: true,
      explicitOnOff: true,
      withRfcTracing: true,
      allSystemKernelEvents: false,
      sqlTrace: true,
      allDbEvents: true,
      maxSizeForTraceFile: 100, // MB
      maxTimeForTracing: 60     // minutes
    };
    
    const parametersId = await client.tracesSetParameters(traceParameters);
    console.log(`Trace parameters set: ${parametersId}`);
    
    // 3. Create new trace configuration (optional)
    const createNewTrace = true; // Change as needed
    
    if (createNewTrace) {
      console.log('\nCreating new trace configuration...');
      
      const traceConfig: TracesCreationConfig = {
        description: 'Transaction Performance Analysis',
        traceUser: client.username,
        traceClient: client.client,
        processType: 'HTTP',
        objectType: 'URL',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        maximalExecutions: 3,
        parametersId
      };
      
      try {
        const result = await client.tracesCreateConfiguration(traceConfig);
        console.log('Trace configuration created successfully!');
        console.log(`  - Title: ${result.title}`);
        console.log(`  - Number of requests: ${result.requests.length}`);
        
        // Save trace configuration ID
        if (result.requests.length > 0) {
          const traceId = result.requests[0].id;
          fs.writeFileSync('./trace-id.txt', traceId);
          console.log(`  - Trace ID '${traceId}' saved to trace-id.txt`);
        }
      } catch (error) {
        console.error('Trace configuration creation failed:', error);
      }
    }
    
    // 4. Analyze existing trace (select first trace)
    if (traceRuns.runs.length === 0) {
      console.log('\nNo traces available to analyze.');
      return;
    }
    
    const traceRun = traceRuns.runs[0];
    console.log(`\nStarting analysis of trace '${traceRun.title}'`);
    
    // 5. Retrieve hit list
    console.log('\nRetrieving hit list...');
    const hitList = await client.tracesHitList(traceRun.id);
    
    console.log(`Number of hit items found: ${hitList.entries.length}`);
    console.log('Top 5 hit items:');
    
    const sortedHits = [...hitList.entries].sort(
      (a, b) => b.grossTime.time - a.grossTime.time
    );
    
    sortedHits.slice(0, 5).forEach((hit, index) => {
      console.log(`\n[${index + 1}] ${hit.description}`);
      console.log(`  - Gross time: ${hit.grossTime.time}μs (${hit.grossTime.percentage}%)`);
      console.log(`  - Net time: ${hit.traceEventNetTime.time}μs (${hit.traceEventNetTime.percentage}%)`);
      
      if (hit.callingProgram) {
        console.log(`  - Calling program: ${hit.callingProgram.name || hit.callingProgram.context}`);
      }
    });
    
    // 6. Retrieve database accesses
    console.log('\nRetrieving database accesses...');
    const dbAccesses = await client.tracesDbAccess(traceRun.id);
    
    console.log(`Number of DB accesses found: ${dbAccesses.dbaccesses.length}`);
    console.log('Top 5 DB accesses:');
    
    const sortedDbAccesses = [...dbAccesses.dbaccesses].sort(
      (a, b) => b.accessTime.total - a.accessTime.total
    );
    
    sortedDbAccesses.slice(0, 5).forEach((access, index) => {
      console.log(`\n[${index + 1}] ${access.tableName} (${access.type || 'Unknown'})`);
      console.log(`  - Statement: ${access.statement || 'None'}`);
      console.log(`  - Total time: ${access.accessTime.total}μs (${access.accessTime.ratioOfTraceTotal}%)`);
      console.log(`  - Total calls: ${access.totalCount} (Buffered: ${access.bufferedCount})`);
      
      if (access.callingProgram) {
        console.log(`  - Calling program: ${access.callingProgram.name || access.callingProgram.context}`);
      }
    });
    
    // 7. Retrieve statement tree
    console.log('\nRetrieving statement tree...');
    const statements = await client.tracesStatements(traceRun.id, {
      withDetails: true
    });
    
    console.log(`Number of statements found: ${statements.statements.length}`);
    console.log('Top 5 statements:');
    
    const sortedStatements = [...statements.statements].sort(
      (a, b) => b.grossTime.time - a.grossTime.time
    );
    
    sortedStatements.slice(0, 5).forEach((stmt, index) => {
      console.log(`\n[${index + 1}] ${stmt.description}`);
      console.log(`  - Level: ${stmt.callLevel}`);
      console.log(`  - Gross time: ${stmt.grossTime.time}μs (${stmt.grossTime.percentage}%)`);
      console.log(`  - Net time: ${stmt.traceEventNetTime.time}μs (${stmt.traceEventNetTime.percentage}%)`);
      console.log(`  - Procedural net time: ${stmt.proceduralNetTime.time}μs (${stmt.proceduralNetTime.percentage}%)`);
      
      if (stmt.callingProgram) {
        console.log(`  - Program: ${stmt.callingProgram.name || stmt.callingProgram.context}`);
        if (stmt.callingProgram.uri) {
          console.log(`  - URI: ${stmt.callingProgram.uri}`);
        }
      }
    });
    
    // 8. Generate performance report
    console.log('\nGenerating performance report...');
    
    const performanceReport = generatePerformanceReport({
      trace: traceRun,
      hitList: sortedHits,
      dbAccesses: sortedDbAccesses,
      statements: sortedStatements
    });
    
    const reportFile = './performance-report.md';
    fs.writeFileSync(reportFile, performanceReport);
    console.log(`Performance report saved to ${reportFile}`);
    
    // 9. Delete trace (optional)
    const deleteTrace = false; // Change as needed
    
    if (deleteTrace) {
      console.log(`\nDeleting trace '${traceRun.title}'...`);
      
      try {
        await client.tracesDelete(traceRun.id);
        console.log('Trace deleted successfully!');
      } catch (error) {
        console.error('Trace deletion failed:', error);
      }
    }
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.logout();
    console.log('\nLogout completed');
  }
}

// Function to generate performance report
function generatePerformanceReport(data) {
  const trace = data.trace;
  const hitList = data.hitList;
  const dbAccesses = data.dbAccesses;
  const statements = data.statements;
  
  let report = `# ABAP Performance Analysis Report\n\n`;
  report += `Analysis date: ${new Date().toISOString()}\n\n`;
  report += `## Trace Information\n\n`;
  report += `- Title: ${trace.title}\n`;
  report += `- Object: ${trace.extendedData.objectName}\n`;
  report += `- Creation date: ${trace.published.toISOString()}\n`;
  report += `- Host: ${trace.extendedData.host}\n`;
  report += `- System: ${trace.extendedData.system}\n`;
  report += `- Client: ${trace.extendedData.client}\n`;
  report += `- Status: ${trace.extendedData.state.text}\n\n`;
  
  report += `## Runtime Summary\n\n`;
  report += `- Total runtime: ${trace.extendedData.runtime}μs (${(trace.extendedData.runtime / 1000000).toFixed(3)} seconds)\n`;
  report += `- ABAP runtime: ${trace.extendedData.runtimeABAP}μs (${(trace.extendedData.runtimeABAP / 1000000).toFixed(3)} seconds)\n`;
  report += `- System runtime: ${trace.extendedData.runtimeSystem}μs (${(trace.extendedData.runtimeSystem / 1000000).toFixed(3)} seconds)\n`;
  report += `- Database runtime: ${trace.extendedData.runtimeDatabase}μs (${(trace.extendedData.runtimeDatabase / 1000000).toFixed(3)} seconds)\n\n`;
  
  // Hit list section
  report += `## Top 10 Hit Items\n\n`;
  report += `| Rank | Description | Gross Time (μs) | Gross Time (%) | Net Time (μs) | Net Time (%) | Calling Program |\n`;
  report += `|------|------|--------------|------------|--------------|------------|----------------|\n`;
  
  hitList.slice(0, 10).forEach((hit, index) => {
    const callingProgram = hit.callingProgram 
      ? (hit.callingProgram.name || hit.callingProgram.context) 
      : '';
    
    report += `| ${index + 1} | ${hit.description} | ${hit.grossTime.time} | ${hit.grossTime.percentage} | ${hit.traceEventNetTime.time} | ${hit.traceEventNetTime.percentage} | ${callingProgram} |\n`;
  });
  
  report += `\n`;
  
  // Database access section
  report += `## Top 10 Database Accesses\n\n`;
  report += `| Rank | Table | Statement | Total Time (μs) | Total Time (%) | Call Count | Buffered Count | Calling Program |\n`;
  report += `|------|--------|------|--------------|------------|---------|------------|----------------|\n`;
  
  dbAccesses.slice(0, 10).forEach((access, index) => {
    const callingProgram = access.callingProgram 
      ? (access.callingProgram.name || access.callingProgram.context) 
      : '';
    
    report += `| ${index + 1} | ${access.tableName} | ${access.statement || ''} | ${access.accessTime.total} | ${access.accessTime.ratioOfTraceTotal} | ${access.totalCount} | ${access.bufferedCount} | ${callingProgram} |\n`;
  });
  
  report += `\n`;
  
  // Statement section
  report += `## Top 10 Statements\n\n`;
  report += `| Rank | Description | Level | Gross Time (μs) | Gross Time (%) | Net Time (μs) | Net Time (%) | Program |\n`;
  report += `|------|------|------|--------------|------------|--------------|------------|----------|\n`;
  
  statements.slice(0, 10).forEach((stmt, index) => {
    const callingProgram = stmt.callingProgram 
      ? (stmt.callingProgram.name || stmt.callingProgram.context) 
      : '';
    
    report += `| ${index + 1} | ${stmt.description} | ${stmt.callLevel} | ${stmt.grossTime.time} | ${stmt.grossTime.percentage} | ${stmt.traceEventNetTime.time} | ${stmt.traceEventNetTime.percentage} | ${callingProgram} |\n`;
  });
  
  report += `\n`;
  
  // Performance improvement suggestions
  report += `## Performance Improvement Suggestions\n\n`;
  
  // Database-related suggestions
  const dbIssues = dbAccesses.filter(a => a.accessTime.ratioOfTraceTotal > 5);
  
  if (dbIssues.length > 0) {
    report += `### Database Performance Issues\n\n`;
    
    dbIssues.forEach((access, index) => {
      report += `${index + 1}. **${access.tableName}** (${access.accessTime.ratioOfTraceTotal}% of total time)\n`;
      report += `   - Statement: \`${access.statement || 'None'}\`\n`;
      report += `   - Call count: ${access.totalCount} (Buffered: ${access.bufferedCount})\n`;
      
      // Additional suggestions
      if (access.totalCount > 1 && access.bufferedCount === 0) {
        report += `   - **Suggestion**: Consider buffering\n`;
      }
      
      if (access.statement && access.statement.toLowerCase().includes('select') && !access.statement.toLowerCase().includes('where')) {
        report += `   - **Suggestion**: Review SELECT without WHERE clause\n`;
      }
      
      report += `\n`;
    });
  }
  
  // Deep call structure suggestions
  const deepCalls = statements.filter(s => s.callLevel > 10 && s.grossTime.percentage > 2);
  
  if (deepCalls.length > 0) {
    report += `### Deep Call Structures\n\n`;
    
    deepCalls.forEach((stmt, index) => {
      report += `${index + 1}. **${stmt.description}** (Level ${stmt.callLevel}, ${stmt.grossTime.percentage}% of total time)\n`;
      
      if (stmt.callingProgram) {
        report += `   - Program: ${stmt.callingProgram.name || stmt.callingProgram.context}\n`;
      }
      
      report += `   - **Suggestion**: Consider simplifying call structure\n\n`;
    });
  }
  
  // Long runtime function suggestions
  const longRunning = hitList.filter(h => h.grossTime.percentage > 10);
  
  if (longRunning.length > 0) {
      report += `### Long Runtime Functions\n\n`;
      
      longRunning.forEach((hit, index) => {
        report += `${index + 1}. **${hit.description}** (${hit.grossTime.percentage}% of total time)\n`;
        
        if (hit.callingProgram) {
          report += `   - Call location: ${hit.callingProgram.name || hit.callingProgram.context}\n`;
        }
        
        report += `   - **Suggestion**: Consider optimization and parallel processing if possible\n\n`;
      });
    }
    
  return report;
}

performanceAnalyzer().catch(console.error);
```

### How to Extend

- Build automatic performance alerting system
- Implement performance benchmarking and baselines
- Create visual performance dashboards

## Debugging Automation

### Purpose

Shows how to automate debugging processes using the ABAP debugging API.

### Code

```typescript
// automated-debugger.ts
import { ADTClient, DebuggingMode, DebugBreakpoint, DebugVariable } from 'abap-adt-api';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Debugger configuration
interface DebuggerConfig {
  terminalId: string;
  ideId: string;
  clientId: string;
  breakpoints: Array<{
    uri: string;
    line: number;
    column: number;
    condition?: string;
  }>;
  watchVariables: string[];
  maxSteps: number;
  recordTrace: boolean;
}

async function automatedDebugger() {
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password'
  );
  
  try {
    await client.login();
    
    // 1. Load debugger configuration
    console.log('Loading debugger configuration...');
    
    // Create default configuration if no config file exists
    const configFile = './debugger-config.json';
    let config: DebuggerConfig;
    
    if (fs.existsSync(configFile)) {
      config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      console.log('Existing configuration loaded');
    } else {
      // Create default configuration
      config = {
        terminalId: uuidv4(),
        ideId: uuidv4(),
        clientId: uuidv4(),
        breakpoints: [
          {
            uri: '/sap/bc/adt/programs/programs/ZEXAMPLE_PROGRAM/source/main',
            line: 10,
            column: 1
          }
        ],
        watchVariables: ['ls_data', 'lt_table'],
        maxSteps: 100,
        recordTrace: true
      };
      
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
      console.log('New configuration created');
    }
    
    console.log(`Debugging mode: User`);
    console.log(`Terminal ID: ${config.terminalId}`);
    console.log(`IDE ID: ${config.ideId}`);
    console.log(`Number of breakpoints: ${config.breakpoints.length}`);
    
    // 2. Check if debugger is already running
    console.log('\nChecking debugger status...');
    
    try {
      const listenerStatus = await client.debuggerListeners(
        'user',
        config.terminalId,
        config.ideId,
        client.username
      );
      
      if (listenerStatus) {
        console.log('Conflict found:');
        console.log(`- Message: ${listenerStatus.message.text}`);
        console.log(`- User: ${listenerStatus.ideUser}`);
        
        // Terminate existing listener
        console.log('\nTerminating existing debugger...');
        await client.debuggerDeleteListener(
          'user',
          config.terminalId,
          config.ideId,
          client.username
        );
        
        console.log('Existing debugger terminated');
      } else {
        console.log('No running debugger found');
      }
    } catch (error) {
      console.error('Error checking debugger status:', error);
    }
    
    // 3. Set breakpoints
    console.log('\nSetting breakpoints...');
    
    const breakpoints: DebugBreakpoint[] = config.breakpoints.map(bp => ({
      clientId: config.clientId,
      kind: 'line',
      id: `bp-${uuidv4()}`,
      nonAbapFlavour: '',
      uri: {
        uri: bp.uri,
        range: {
          start: {
            line: bp.line,
            column: bp.column
          },
          end: {
            line: bp.line,
            column: bp.column
          }
        }
      },
      type: '',
      name: '',
      condition: bp.condition
    }));
    
    try {
      const setBreakpoints = await client.debuggerSetBreakpoints(
        'user',
        config.terminalId,
        config.ideId,
        config.clientId,
        breakpoints,
        client.username
      );
      
      console.log(`${setBreakpoints.length} breakpoints set`);
      
      setBreakpoints.forEach((bp, i) => {
        if ('uri' in bp) {
          console.log(`- BP${i+1}: ${bp.uri.uri} (line ${bp.uri.range.start.line})`);
          if (bp.condition) {
            console.log(`  Condition: ${bp.condition}`);
          }
        } else if ('errorMessage' in bp) {
          console.log(`- BP${i+1} error: ${bp.errorMessage}`);
        }
      });
    } catch (error) {
      console.error('Error setting breakpoints:', error);
    }
    
    // 4. Configure debugger settings
    console.log('\nConfiguring debugger settings...');
    
    try {
      await client.debuggerSaveSettings({
        systemDebugging: false,
        createExceptionObject: true,
        backgroundRFC: true,
        sharedObjectDebugging: false,
        showDataAging: true,
        updateDebugging: false
      });
      
      console.log('Debugger settings configured');
    } catch (error) {
      console.error('Error configuring debugger settings:', error);
    }
    
    // 5. Start debugger listening
    console.log('\nStarting debugger listening...');
    console.log('(Note: This step will wait until the debugger is triggered)');
    console.log('Please run the transaction to debug...');
    
    let debugSession;
    try {
      debugSession = await client.debuggerListen(
        'user',
        config.terminalId,
        config.ideId,
        client.username
      );
      
      if (!debugSession) {
        console.log('\nDebugger session ended or timed out');
        return;
      }
      
      if ('conflictText' in debugSession) {
        console.log('\nDebugger conflict:');
        console.log(`- Message: ${debugSession.message.text}`);
        console.log(`- User: ${debugSession.ideUser}`);
        return;
      }
      
      console.log('\nDebugger session started!');
      console.log(`- Program: ${debugSession.PRG_CURR}`);
      console.log(`- Include: ${debugSession.INCL_CURR}`);
      console.log(`- Line: ${debugSession.LINE_CURR}`);
      console.log(`- User: ${debugSession.DEBUGGEE_USER}`);
      
      // 6. Attach to debugger session
      console.log('\nAttaching to debugger session...');
      
      const attach = await client.debuggerAttach(
        'user',
        debugSession.DEBUGGEE_ID,
        client.username
      );
      
      console.log('Debugger session attached!');
      console.log(`- Session ID: ${attach.debugSessionId}`);
      console.log(`- Title: ${attach.sessionTitle}`);
      
      if (attach.reachedBreakpoints.length > 0) {
        console.log(`- Breakpoints reached: ${attach.reachedBreakpoints.length}`);
        attach.reachedBreakpoints.forEach(bp => {
          console.log(`  - ID: ${bp.id}, Type: ${bp.kind}`);
        });
      }
      
      // Prepare debug session log file
      const debugLog = {
        timestamp: new Date().toISOString(),
        session: {
          program: debugSession.PRG_CURR,
          include: debugSession.INCL_CURR,
          line: debugSession.LINE_CURR,
          user: debugSession.DEBUGGEE_USER
        },
        steps: []
      };
      
      // 7. Retrieve stack trace
      console.log('\nRetrieving stack trace...');
      
      const stack = await client.debuggerStackTrace();
      
      console.log(`Stack depth: ${stack.stack.length}`);
      stack.stack.slice(0, 5).forEach((frame, i) => {
        console.log(`[${i}] ${frame.programName} - ${frame.eventType} ${frame.eventName || ''}`);
        console.log(`    Line ${frame.line}`);
      });
      
      // 8. Retrieve and watch variables
      console.log('\nRetrieving variables...');
      
      // Get root variables
      const childVars = await client.debuggerChildVariables();
      
      console.log(`Variable hierarchy structures: ${childVars.hierarchies.length}`);
      console.log(`Root variables: ${childVars.variables.length}`);
      
      // Find watch variable IDs
      const watchIds: string[] = [];
      
      for (const watchName of config.watchVariables) {
        const foundVar = childVars.variables.find(v => 
          v.NAME.toLowerCase() === watchName.toLowerCase()
        );
        
        if (foundVar) {
          watchIds.push(foundVar.ID);
          console.log(`Variable '${watchName}' found (ID: ${foundVar.ID})`);
        } else {
          console.log(`Variable '${watchName}' not found`);
        }
      }
      
      // Load watch variables
      if (watchIds.length > 0) {
        console.log('\nLoading watch variables...');
        const watchVars = await client.debuggerVariables(watchIds);
        
        watchVars.forEach(v => {
          console.log(`Variable: ${v.NAME} (${v.META_TYPE}, ${v.ACTUAL_TYPE_NAME})`);
          console.log(`Value: ${v.VALUE}`);
          
          if (v.META_TYPE === 'table') {
            console.log(`Table lines: ${v.TABLE_LINES}`);
          }
        });
        
        // Record watch variables
        debugLog.steps.push({
          action: 'observe',
          variables: watchVars.map(v => ({
            name: v.NAME,
            type: v.META_TYPE,
            value: v.VALUE,
            lines: v.TABLE_LINES
          }))
        });
      }
      
      // 9. Execute debugging steps
      console.log('\nStarting debugging steps execution...');
      
      const stepTypes = ['stepInto', 'stepOver', 'stepOver', 'stepReturn'] as const;
      let stepCount = 0;
      let continueDebugging = true;
      
      while (continueDebugging && stepCount < config.maxSteps) {
        // Determine step type (simple rotation)
        const stepType = stepTypes[stepCount % stepTypes.length];
        
        console.log(`\n[${stepCount + 1}/${config.maxSteps}] Executing ${stepType}...`);
        
        try {
          // Execute step
          const stepResult = await client.debuggerStep(stepType);
          
          console.log(`- Position: Line ${stepResult.actions[0]?.value || '?'}`);
          
          // Update stack trace
          const updatedStack = await client.debuggerStackTrace();
          
          if (updatedStack.stack.length > 0) {
            const topFrame = updatedStack.stack[0];
            console.log(`- Program: ${topFrame.programName}`);
            console.log(`- Line: ${topFrame.line}`);
            
            // Update watch variables
            if (watchIds.length > 0) {
              const updatedVars = await client.debuggerVariables(watchIds);
              
              updatedVars.forEach(v => {
                console.log(`- ${v.NAME}: ${v.VALUE}`);
              });
              
              // Record step in log
              debugLog.steps.push({
                action: stepType,
                position: {
                  program: topFrame.programName,
                  line: topFrame.line,
                  event: topFrame.eventType
                },
                variables: updatedVars.map(v => ({
                  name: v.NAME,
                  type: v.META_TYPE,
                  value: v.VALUE,
                  lines: v.TABLE_LINES
                }))
              });
            }
          }
          
          // Determine whether to continue debugging
          stepCount++;
          
          // Stop if max steps reached or specific condition met
          if (stepCount >= config.maxSteps) {
            console.log('\nMaximum step count reached.');
            continueDebugging = false;
          }
          
          // Add additional termination conditions here if needed
          
        } catch (error) {
          console.error(`Error executing step:`, error);
          continueDebugging = false;
        }
      }
      
      // 10. Terminate debugging session
      console.log('\nTerminating debugging session...');
      
      try {
        await client.debuggerStep('terminateDebuggee');
        console.log('Debugging session terminated');
      } catch (error) {
        console.error('Error terminating debugging session:', error);
      }
      
      // 11. Save debugging log
      if (config.recordTrace) {
        const logFile = `./debug-log-${new Date().toISOString().replace(/:/g, '-')}.json`;
        fs.writeFileSync(logFile, JSON.stringify(debugLog, null, 2));
        console.log(`\nDebugging log saved to ${logFile}`);
      }
      
    } catch (error) {
      console.error('Error during debugging session:', error);
    }
    
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    // Try to terminate debugger
    try {
      await client.debuggerDeleteListener(
        'user',
        config.terminalId,
        config.ideId,
        client.username
      );
    } catch { /* ignore */ }
    
    await client.logout();
    console.log('\nLogout completed');
  }
}

automatedDebugger().catch(console.error);
```

### How to Extend

- Enhance conditional breakpoints and watch expressions
- Automatically trace specific data flow patterns
- Auto-detect memory leaks and performance bottlenecks