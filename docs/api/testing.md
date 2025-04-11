# 테스트 기능

이 페이지에서는 ABAP ADT API를 사용하여 ABAP 단위 테스트를 실행하고 결과를 분석하는 방법을 설명합니다.

## 단위 테스트 실행

### 단위 테스트 실행

```typescript
async unitTestRun(
  url: string,
  flags: UnitTestRunFlags = DefaultUnitTestRunFlags
): Promise<UnitTestClass[]>
```

ABAP 객체에 대한 단위 테스트를 실행합니다.

**매개변수:**
- `url`: 객체 URL
- `flags`: 테스트 실행 플래그 (선택적, 기본값: DefaultUnitTestRunFlags)

**반환 값:**
- `UnitTestClass[]`: 테스트 클래스 결과 배열

**예제:**
```typescript
// 클래스에 대한 단위 테스트 실행
const testResults = await client.unitTestRun('/sap/bc/adt/oo/classes/ZCL_TEST_CLASS');

console.log(`테스트 클래스 수: ${testResults.length}`);

// 테스트 결과 출력
testResults.forEach(testClass => {
  console.log(`테스트 클래스: ${testClass['adtcore:name']}`);
  console.log(`- 위험 수준: ${testClass.riskLevel}`);
  console.log(`- 메서드 수: ${testClass.testmethods.length}`);
  
  // 테스트 메서드 결과
  testClass.testmethods.forEach(method => {
    console.log(`  메서드: ${method['adtcore:name']}`);
    console.log(`  - 실행 시간: ${method.executionTime}ms`);
    console.log(`  - 알림 수: ${method.alerts.length}`);
    
    // 알림(오류/예외) 출력
    method.alerts.forEach(alert => {
      console.log(`    알림: ${alert.kind} (${alert.severity})`);
      console.log(`    - 제목: ${alert.title}`);
      alert.details.forEach(detail => {
        console.log(`    - 상세: ${detail}`);
      });
    });
  });
});
```

### 테스트 실행 플래그

```typescript
interface UnitTestRunFlags {
  harmless: boolean;   // 위험 없는 테스트 실행
  dangerous: boolean;  // 위험한 테스트 실행
  critical: boolean;   // 중요한 테스트 실행
  short: boolean;      // 짧은 테스트 실행
  medium: boolean;     // 중간 길이 테스트 실행
  long: boolean;       // 긴 테스트 실행
}
```

**기본 플래그:**
```typescript
const DefaultUnitTestRunFlags: UnitTestRunFlags = {
  harmless: true,   // 위험 없는 테스트만 실행
  dangerous: false, // 위험한 테스트 제외
  critical: false,  // 중요한 테스트 제외
  short: true,      // 짧은 테스트만 실행
  medium: false,    // 중간 길이 테스트 제외
  long: false       // 긴 테스트 제외
};
```

**사용자 정의 플래그 예제:**
```typescript
// 모든 유형의 테스트 실행
const allTestsFlags: UnitTestRunFlags = {
  harmless: true,
  dangerous: true,
  critical: true,
  short: true,
  medium: true,
  long: true
};

// 사용자 정의 플래그로 테스트 실행
const testResults = await client.unitTestRun('/sap/bc/adt/oo/classes/ZCL_TEST_CLASS', allTestsFlags);
```

### 특정 테스트 메서드 평가

```typescript
async unitTestEvaluation(
  clas: UnitTestClass,
  flags: UnitTestRunFlags = DefaultUnitTestRunFlags
): Promise<UnitTestMethod[]>
```

특정 테스트 클래스의 메서드를 평가합니다.

**매개변수:**
- `clas`: 테스트 클래스
- `flags`: 테스트 실행 플래그 (선택적, 기본값: DefaultUnitTestRunFlags)

**반환 값:**
- `UnitTestMethod[]`: 테스트 메서드 결과 배열

**예제:**
```typescript
// 클래스에 대한 테스트 실행
const testResults = await client.unitTestRun('/sap/bc/adt/oo/classes/ZCL_TEST_CLASS');

// 첫 번째 테스트 클래스에 대한 자세한 평가
if (testResults.length > 0) {
  const evaluationResults = await client.unitTestEvaluation(testResults[0]);
  
  console.log('테스트 메서드 평가 결과:');
  evaluationResults.forEach(method => {
    console.log(`메서드: ${method['adtcore:name']}`);
    console.log(`- 실행 시간: ${method.executionTime}ms`);
    
    // 알림 출력
    if (method.alerts.length > 0) {
      console.log('- 알림:');
      method.alerts.forEach(alert => {
        console.log(`  - ${alert.kind} (${alert.severity}): ${alert.title}`);
      });
    } else {
      console.log('- 알림 없음 (성공)');
    }
  });
}
```

## 테스트 마커 확인

### 테스트 발생 마커 조회

```typescript
async unitTestOccurrenceMarkers(
  uri: string,
  source: string
): Promise<UnitTestOccurrenceMarker[]>
```

소스 코드에서 테스트 발생 마커를 조회합니다.

**매개변수:**
- `uri`: 소스 코드 URI
- `source`: 소스 코드

**반환 값:**
- `UnitTestOccurrenceMarker[]`: 테스트 발생 마커 배열

**예제:**
```typescript
// 클래스 소스 코드 가져오기
const classURL = '/sap/bc/adt/oo/classes/ZCL_TEST_CLASS';
const objectStructure = await client.objectStructure(classURL);
const sourceURL = ADTClient.mainInclude(objectStructure);
const source = await client.getObjectSource(sourceURL);

// 테스트 발생 마커 조회
const markers = await client.unitTestOccurrenceMarkers(sourceURL, source);

console.log(`테스트 마커 수: ${markers.length}`);
markers.forEach(marker => {
  console.log(`마커 종류: ${marker.kind}`);
  console.log(`- 위치: 라인 ${marker.location.range.start.line}, 열 ${marker.location.range.start.column}`);
  console.log(`- 결과 유지: ${marker.keepsResult}`);
});
```

## 테스트 포함(Include) 관리

### 테스트 포함 생성

```typescript
async createTestInclude(
  clas: string,
  lockHandle: string,
  transport: string = ""
): Promise<void>
```

클래스에 대한 테스트 포함을 생성합니다.

**매개변수:**
- `clas`: 클래스 이름
- `lockHandle`: 잠금 핸들
- `transport`: 트랜스포트 번호 (선택적)

**예제:**
```typescript
// 클래스 객체 조회
const classURL = '/sap/bc/adt/oo/classes/ZCL_EXAMPLE';
const objectStructure = await client.objectStructure(classURL);

// 클래스 잠금
const lock = await client.lock(classURL);

// 테스트 포함 생성
await client.createTestInclude('ZCL_EXAMPLE', lock.LOCK_HANDLE, 'DEVK900123');
console.log('테스트 포함이 생성되었습니다.');

// 클래스 잠금 해제
await client.unLock(classURL, lock.LOCK_HANDLE);
```

## 전체 단위 테스트 워크플로우 예제

다음 예제는 ABAP 단위 테스트의 일반적인 워크플로우를 보여줍니다:

```typescript
import { ADTClient, UnitTestRunFlags } from 'abap-adt-api';

async function testingWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // 1. 테스트할 클래스의 URL
    const classURL = '/sap/bc/adt/oo/classes/ZCL_TEST_CLASS';
    
    // 2. 클래스에 테스트 포함이 없는 경우 생성
    const objectStructure = await client.objectStructure(classURL);
    
    if (client.isClassStructure(objectStructure)) {
      const includes = ADTClient.classIncludes(objectStructure);
      
      // 테스트 클래스 포함이 없으면 생성
      if (!includes.has('testclasses')) {
        console.log('테스트 포함 생성 중...');
        
        // 클래스 잠금
        const lock = await client.lock(classURL);
        
        // 테스트 포함 생성
        await client.createTestInclude(
          objectStructure.metaData['adtcore:name'],
          lock.LOCK_HANDLE,
          'DEVK900123' // 트랜스포트 번호
        );
        
        console.log('테스트 포함이 생성되었습니다.');
        
        // 클래스 잠금 해제
        await client.unLock(classURL, lock.LOCK_HANDLE);
        
        // 업데이트된 객체 구조 가져오기
        objectStructure = await client.objectStructure(classURL);
      }
    }
    
    // 3. 단위 테스트 실행 플래그 설정
    const testFlags: UnitTestRunFlags = {
      harmless: true,    // 위험 없는 테스트
      dangerous: true,   // 위험한 테스트
      critical: false,   // 중요한 테스트는 제외
      short: true,       // 짧은 테스트
      medium: true,      // 중간 길이 테스트
      long: false        // 긴 테스트는 제외
    };
    
    // 4. 단위 테스트 실행
    console.log('단위 테스트 실행 중...');
    const testResults = await client.unitTestRun(classURL, testFlags);
    
    // 5. 테스트 결과 분석
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    testResults.forEach(testClass => {
      console.log(`\n테스트 클래스: ${testClass['adtcore:name']}`);
      console.log(`위험 수준: ${testClass.riskLevel}`);
      console.log(`지속 시간 분류: ${testClass.durationCategory}`);
      
      testClass.testmethods.forEach(method => {
        totalTests++;
        
        const hasFailed = method.alerts.some(alert => 
          alert.kind === 'failedAssertion' || alert.kind === 'exception'
        );
        
        if (hasFailed) {
          failedTests++;
          console.log(`❌ ${method['adtcore:name']} - 실패 (${method.executionTime}ms)`);
          
          // 실패 세부 정보 출력
          method.alerts.forEach(alert => {
            console.log(`  - ${alert.kind} (${alert.severity}): ${alert.title}`);
            alert.details.forEach(detail => {
              console.log(`    ${detail}`);
            });
            
            // 스택 추적 출력
            if (alert.stack && alert.stack.length > 0) {
              console.log('  - 스택 추적:');
              alert.stack.forEach(entry => {
                console.log(`    ${entry['adtcore:name']} (${entry['adtcore:uri']})`);
              });
            }
          });
        } else {
          passedTests++;
          console.log(`✅ ${method['adtcore:name']} - 성공 (${method.executionTime}ms)`);
        }
      });
    });
    
    // 6. 요약 출력
    console.log('\n테스트 요약:');
    console.log(`- 총 테스트 수: ${totalTests}`);
    console.log(`- 성공한 테스트: ${passedTests}`);
    console.log(`- 실패한 테스트: ${failedTests}`);
    console.log(`- 성공률: ${(passedTests / totalTests * 100).toFixed(2)}%`);
    
    // 7. 테스트 소스 코드의 마커 확인
    if (client.isClassStructure(objectStructure) && objectStructure.includes) {
      const testInclude = objectStructure.includes.find(i => i["class:includeType"] === "testclasses");
      
      if (testInclude) {
        const sourceURL = testInclude["abapsource:sourceUri"];
        const source = await client.getObjectSource(sourceURL);
        
        console.log('\n테스트 마커 확인 중...');
        const markers = await client.unitTestOccurrenceMarkers(sourceURL, source);
        
        console.log(`테스트 마커 수: ${markers.length}`);
        markers.forEach(marker => {
          const line = marker.location.range.start.line;
          const column = marker.location.range.start.column;
          console.log(`- 마커 (라인 ${line}, 열 ${column}): ${marker.kind}`);
        });
      }
    }
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  } finally {
    await client.logout();
  }
}

testingWorkflow();
```

## 고급 테스트 기능 예제

### 테스트 결과 보고서 생성

다음 예제는 테스트 결과를 기반으로 보고서를 생성하는 함수를 보여줍니다:

```typescript
import { ADTClient, UnitTestClass, UnitTestMethod } from 'abap-adt-api';

// 테스트 결과 보고서 생성 함수
function generateTestReport(testResults: UnitTestClass[]): string {
  let report = '# ABAP 단위 테스트 보고서\n\n';
  
  // 요약 통계
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
  
  // 요약 추가
  report += '## 요약\n\n';
  report += `- **총 테스트 수:** ${totalTests}\n`;
  report += `- **성공한 테스트:** ${passedTests}\n`;
  report += `- **실패한 테스트:** ${failedTests}\n`;
  report += `- **성공률:** ${(passedTests / totalTests * 100).toFixed(2)}%\n`;
  report += `- **총 실행 시간:** ${totalTime}ms\n\n`;
  
  // 클래스별 결과
  report += '## 클래스별 결과\n\n';
  
  testResults.forEach(testClass => {
    const className = testClass['adtcore:name'];
    report += `### ${className}\n\n`;
    report += `- **위험 수준:** ${testClass.riskLevel}\n`;
    report += `- **지속 시간 분류:** ${testClass.durationCategory}\n\n`;
    
    if (testClass.testmethods.length === 0) {
      report += '_테스트 메서드 없음_\n\n';
    } else {
      report += '| 메서드 | 상태 | 시간(ms) | 문제 |\n';
      report += '|--------|------|----------|-------|\n';
      
      testClass.testmethods.forEach(method => {
        const methodName = method['adtcore:name'];
        const time = method.executionTime;
        const hasFailed = method.alerts.length > 0;
        const status = hasFailed ? '❌ 실패' : '✅ 성공';
        
        // 문제 요약
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
    
    // 실패한 테스트에 대한 자세한 정보
    const failedMethods = testClass.testmethods.filter(m => m.alerts.length > 0);
    if (failedMethods.length > 0) {
      report += '#### 실패 세부 정보\n\n';
      
      failedMethods.forEach(method => {
        report += `##### ${method['adtcore:name']}\n\n`;
        
        method.alerts.forEach(alert => {
          report += `- **${alert.kind} (${alert.severity}):** ${alert.title}\n`;
          
          if (alert.details.length > 0) {
            report += '  - 세부 정보:\n';
            alert.details.forEach(detail => {
              report += `    - ${detail}\n`;
            });
          }
          
          if (alert.stack && alert.stack.length > 0) {
            report += '      - 스택 추적:\n';
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

// 실제 사용 예시
async function generateTestReportExample() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // 단위 테스트 실행
    const testResults = await client.unitTestRun('/sap/bc/adt/oo/classes/ZCL_TEST_CLASS');
    
    // 테스트 보고서 생성
    const report = generateTestReport(testResults);
    
    // 보고서 저장 또는 출력
    console.log(report);
    
    // 파일 시스템이 사용 가능한 경우 파일로 저장
    // require('fs').writeFileSync('test-report.md', report);
    
    return report;
  } catch (error) {
    console.error('테스트 보고서 생성 중 오류 발생:', error);
    throw error;
  } finally {
    await client.logout();
  }
}
```

### 특정 패키지의 모든 테스트 실행

다음 예제는 특정 패키지 내의 모든 테스트 클래스를 찾아 실행하는 방법을 보여줍니다:

```typescript
import { ADTClient, UnitTestRunFlags } from 'abap-adt-api';

async function runAllPackageTests(client: ADTClient, packageName: string) {
  console.log(`패키지 '${packageName}'의 모든 테스트 실행 중...`);
  
  // 1. 패키지 내 객체 조회
  const packageContents = await client.nodeContents('DEVC/K', packageName);
  
  // 2. 클래스 객체 필터링
  const classes = packageContents.nodes.filter(node => 
    node.OBJECT_TYPE === 'CLAS/OC'
  );
  
  console.log(`패키지에서 ${classes.length}개의 클래스를 찾았습니다.`);
  
  // 3. 테스트 플래그 설정
  const testFlags: UnitTestRunFlags = {
    harmless: true,
    dangerous: false,
    critical: false,
    short: true,
    medium: true,
    long: false
  };
  
  // 4. 각 클래스에 대해 테스트 실행
  const results = [];
  
  for (let i = 0; i < classes.length; i++) {
    const classNode = classes[i];
    const classUrl = classNode.OBJECT_URI;
    const className = classNode.OBJECT_NAME;
    
    console.log(`[${i+1}/${classes.length}] 클래스 '${className}' 테스트 실행 중...`);
    
    try {
      // 단위 테스트 실행
      const testResult = await client.unitTestRun(classUrl, testFlags);
      
      // 테스트 결과가 있는 경우에만 추가
      if (testResult.length > 0) {
        results.push({ className, classUrl, testResult });
        
        // 간단한 요약 출력
        const totalMethods = testResult.reduce((sum, tc) => sum + tc.testmethods.length, 0);
        const failedMethods = testResult.reduce((sum, tc) => 
          sum + tc.testmethods.filter(m => m.alerts.length > 0).length, 0);
        
        console.log(`- ${totalMethods}개 테스트 중 ${totalMethods - failedMethods}개 성공, ${failedMethods}개 실패`);
      } else {
        console.log(`- 테스트 결과 없음`);
      }
    } catch (error) {
      console.error(`- '${className}' 테스트 실행 중 오류 발생:`, error);
    }
  }
  
  // 5. 종합 결과 집계
  console.log('\n패키지 테스트 종합 결과:');
  
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
  
  console.log(`- 테스트가 있는 클래스: ${totalClasses}개`);
  console.log(`- 총 테스트 메서드: ${totalTests}개`);
  console.log(`- 성공한 테스트: ${passedTests}개`);
  console.log(`- 실패한 테스트: ${failedTests}개`);
  console.log(`- 성공률: ${(passedTests / totalTests * 100).toFixed(2)}%`);
  
  return results;
}

// 사용 예시
async function packageTestingExample() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    await runAllPackageTests(client, 'ZEXAMPLE_PKG');
  } catch (error) {
    console.error('패키지 테스트 중 오류 발생:', error);
  } finally {
    await client.logout();
  }
}
```

## 참고 사항

- 단위 테스트를 실행하려면 테스트 클래스에 `FOR TESTING` 섹션이 필요합니다.
- 테스트 실행은 시스템 리소스를 소비하므로 대량의 테스트를 실행할 때는 주의해야 합니다.
- 위험도가 높은 테스트(`dangerous` 또는 `critical`)는 기본적으로 제외됩니다. 필요한 경우에만 실행하세요.
- 테스트 포함이 없는 클래스에 대해 `createTestInclude`를 사용하면 표준 테스트 템플릿이 생성됩니다.
- 실패한 단위 테스트에 대한 상세 정보는 `alerts` 배열에서 확인할 수 있습니다.
- 테스트 마커는 소스 코드에서 테스트 관련 위치를 식별하는 데 도움이 됩니다.
- 장기 실행 테스트를 사용할 때는 클라이언트 타임아웃 설정을 고려해야 합니다.