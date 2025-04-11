# 고급 예제

이 페이지에서는 ABAP ADT API 라이브러리의 고급 기능을 활용하는 복잡한 예제를 제공합니다.

## 목차

- [코드 품질 분석 및 개선](#코드-품질-분석-및-개선)
- [대량 객체 변경](#대량-객체-변경)
- [테스트 자동화](#테스트-자동화)
- [ABAP Git 통합](#abap-git-통합)
- [성능 추적 및 분석](#성능-추적-및-분석)
- [디버깅 자동화](#디버깅-자동화)

## 코드 품질 분석 및 개선

### 목적

ABAP Test Cockpit(ATC)을 사용하여 코드 품질을 분석하고 개선하는 방법을 보여줍니다.

### 코드

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
    
    // 1. 패키지 내용 조회
    const packageName = 'ZEXAMPLE_PKG';
    console.log(`패키지 '${packageName}' 내용 조회 중...`);
    
    const packageContents = await client.nodeContents('DEVC/K', packageName);
    console.log(`패키지 내 객체 수: ${packageContents.nodes.length}`);
    
    // 분석할 객체 필터링 (프로그램 및 클래스만)
    const objectsToAnalyze = packageContents.nodes.filter(node => 
      node.OBJECT_TYPE === 'PROG/P' || node.OBJECT_TYPE === 'CLAS/OC'
    );
    
    console.log(`분석할 객체 수: ${objectsToAnalyze.length}`);
    
    // 2. ATC 커스터마이징 정보 조회
    console.log('\nATC 커스터마이징 정보 조회 중...');
    const customizing = await client.atcCustomizing();
    
    console.log('ATC 속성:');
    customizing.properties.forEach(prop => {
      console.log(`- ${prop.name}: ${prop.value}`);
    });
    
    // 3. ATC 검사 변형 선택
    const checkVariant = 'DEFAULT';
    console.log(`\nATC 검사 변형 '${checkVariant}' 선택 중...`);
    await client.atcCheckVariant(checkVariant);
    
    // 4. 각 객체에 대한 ATC 검사 실행 및 결과 분석
    console.log('\n객체 분석 시작...');
    
    const analysisResults = [];
    
    for (let i = 0; i < objectsToAnalyze.length; i++) {
      const obj = objectsToAnalyze[i];
      console.log(`\n[${i + 1}/${objectsToAnalyze.length}] '${obj.OBJECT_NAME}' (${obj.OBJECT_TYPE}) 분석 중...`);
      
      try {
        // ATC 검사 실행
        const runResult = await client.createAtcRun(
          checkVariant,
          obj.OBJECT_URI,
          100 // 최대 결과 수
        );
        
        // ATC 결과 조회
        const worklist = await client.atcWorklists(
          runResult.id,
          runResult.timestamp
        );
        
        // 결과 집계
        let totalFindings = 0;
        let priorityCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
        
        worklist.objects.forEach(object => {
          totalFindings += object.findings.length;
          
          object.findings.forEach(finding => {
            priorityCounts[finding.priority] = (priorityCounts[finding.priority] || 0) + 1;
          });
        });
        
        console.log(`발견 항목 수: ${totalFindings}`);
        console.log(`- 우선순위 1 (매우 높음): ${priorityCounts[1] || 0}`);
        console.log(`- 우선순위 2 (높음): ${priorityCounts[2] || 0}`);
        console.log(`- 우선순위 3 (중간): ${priorityCounts[3] || 0}`);
        console.log(`- 우선순위 4 (낮음): ${priorityCounts[4] || 0}`);
        
        // 상위 발견 항목 출력
        if (totalFindings > 0) {
          console.log('\n주요 발견 항목:');
          
          // 모든 발견 항목 수집
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
          
          // 우선순위로 정렬
          allFindings.sort((a, b) => a.priority - b.priority);
          
          // 상위 5개 출력
          allFindings.slice(0, 5).forEach(finding => {
            console.log(`- [P${finding.priority}] ${finding.checkTitle}: ${finding.messageTitle}`);
            console.log(`  위치: ${finding.object}, 라인 ${finding.location}`);
          });
        }
        
        // 분석 결과 저장
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
        console.error(`'${obj.OBJECT_NAME}' 분석 중 오류 발생:`, error);
      }
    }
    
    // 5. 분석 보고서 생성
    console.log('\n분석 보고서 생성 중...');
    
    let reportMarkdown = `# ABAP 코드 품질 분석 보고서\n\n`;
    reportMarkdown += `분석 날짜: ${new Date().toISOString()}\n\n`;
    reportMarkdown += `## 요약\n\n`;
    reportMarkdown += `- 분석된 객체 수: ${analysisResults.length}\n`;
    
    // 총 발견 항목 수
    const totalIssues = analysisResults.reduce((sum, result) => sum + result.totalFindings, 0);
    reportMarkdown += `- 총 발견 항목 수: ${totalIssues}\n`;
    
    // 우선순위별 집계
    const totalPriorityCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    analysisResults.forEach(result => {
      Object.entries(result.priorityCounts).forEach(([priority, count]) => {
        totalPriorityCounts[priority] = (totalPriorityCounts[priority] || 0) + count;
      });
    });
    
    reportMarkdown += `- 우선순위별 발견 항목:\n`;
    reportMarkdown += `  - 우선순위 1 (매우 높음): ${totalPriorityCounts[1] || 0}\n`;
    reportMarkdown += `  - 우선순위 2 (높음): ${totalPriorityCounts[2] || 0}\n`;
    reportMarkdown += `  - 우선순위 3 (중간): ${totalPriorityCounts[3] || 0}\n`;
    reportMarkdown += `  - 우선순위 4 (낮음): ${totalPriorityCounts[4] || 0}\n\n`;
    
    // 우선순위 1 발견 항목 (즉시 조치 필요)
    const priority1Findings = analysisResults.flatMap(result => 
      result.findings.filter(f => f.priority === 1)
    );
    
    if (priority1Findings.length > 0) {
      reportMarkdown += `## 우선순위 1 발견 항목 (즉시 조치 필요)\n\n`;
      
      priority1Findings.forEach(finding => {
        reportMarkdown += `### ${finding.object}\n\n`;
        reportMarkdown += `- 검사: ${finding.checkTitle}\n`;
        reportMarkdown += `- 메시지: ${finding.messageTitle}\n`;
        reportMarkdown += `- 위치: 라인 ${finding.location.line}, 열 ${finding.location.column}\n\n`;
      });
    }
    
    // 객체별 발견 항목
    reportMarkdown += `## 객체별 발견 항목\n\n`;
    
    const sortedResults = [...analysisResults].sort((a, b) => b.totalFindings - a.totalFindings);
    
    sortedResults.forEach(result => {
      reportMarkdown += `### ${result.objectName} (${result.objectType})\n\n`;
      reportMarkdown += `- 총 발견 항목 수: ${result.totalFindings}\n`;
      reportMarkdown += `- 우선순위 분포:\n`;
      reportMarkdown += `  - P1: ${result.priorityCounts[1] || 0}\n`;
      reportMarkdown += `  - P2: ${result.priorityCounts[2] || 0}\n`;
      reportMarkdown += `  - P3: ${result.priorityCounts[3] || 0}\n`;
      reportMarkdown += `  - P4: ${result.priorityCounts[4] || 0}\n\n`;
      
      if (result.findings.length > 0) {
        reportMarkdown += `#### 발견 항목 목록\n\n`;
        reportMarkdown += `| 우선순위 | 검사 | 메시지 | 위치 |\n`;
        reportMarkdown += `|----------|------|--------|------|\n`;
        
        result.findings.forEach(finding => {
          reportMarkdown += `| P${finding.priority} | ${finding.checkTitle} | ${finding.messageTitle} | ${finding.location.line}, ${finding.location.column} |\n`;
        });
        
        reportMarkdown += `\n`;
      }
    });
    
    // 6. 보고서 저장
    const reportFile = './atc-report.md';
    fs.writeFileSync(reportFile, reportMarkdown);
    console.log(`분석 보고서가 ${reportFile}에 저장되었습니다.`);
    
    // 7. 개선 제안 (우선순위 1 항목)
    if (priority1Findings.length > 0) {
      console.log('\n우선순위 1 항목에 대한 개선 제안:');
      
      for (const finding of priority1Findings.slice(0, 3)) { // 처음 3개만 처리
        try {
          console.log(`\n${finding.object}의 발견 항목 처리 중...`);
          
          // 발견 항목에 대한 예외 제안 조회
          if (finding.quickfixInfo) {
            const proposal = await client.atcExemptProposal(finding.quickfixInfo);
            
            if (!client.isProposalMessage(proposal)) {
              console.log('예외 제안 정보:');
              console.log(`- 패키지: ${proposal.package}`);
              console.log(`- 이유: ${proposal.reason}`);
              
              // 예외 요청 (실제로 실행하진 않음)
              console.log('예외 요청 준비됨 (이 예제에서는 실행하지 않음)');
              /* 실제 실행 시 주석 해제
              proposal.reason = 'FPOS';  // False Positive
              proposal.justification = '이 검사는 이 상황에 적용되지 않습니다.';
              
              const result = await client.atcRequestExemption(proposal);
              console.log(`예외 요청 결과: ${result.message} (${result.type})`);
              */
            } else {
              console.log(`메시지: ${proposal.message} (${proposal.type})`);
            }
          }
        } catch (error) {
          console.error('예외 제안 처리 중 오류 발생:', error);
        }
      }
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
    console.log('로그아웃 완료');
  }
}

analyzeCodeQuality().catch(console.error);
```

### 출력 예제

```
패키지 'ZEXAMPLE_PKG' 내용 조회 중...
패키지 내 객체 수: 15
분석할 객체 수: 8

ATC 커스터마이징 정보 조회 중...
ATC 속성:
- useAsDefault: true
- hideInWorkbench: false
...

객체 분석 시작...

[1/8] 'ZCL_EXAMPLE_CLASS' (CLAS/OC) 분석 중...
발견 항목 수: 12
- 우선순위 1 (매우 높음): 2
- 우선순위 2 (높음): 3
- 우선순위 3 (중간): 4
- 우선순위 4 (낮음): 3

주요 발견 항목:
- [P1] 사용되지 않는 변수: 변수 'LV_TEMP'이(가) 선언되었지만 사용되지 않음
  위치: ZCL_EXAMPLE_CLASS, 라인 42, 5
- [P1] 메모리 누수: 내부 테이블이 해제되지 않음
  위치: ZCL_EXAMPLE_CLASS, 라인 78, 3
...

분석 보고서 생성 중...
분석 보고서가 ./atc-report.md에 저장되었습니다.

우선순위 1 항목에 대한 개선 제안:

ZCL_EXAMPLE_CLASS의 발견 항목 처리 중...
예외 제안 정보:
- 패키지: ZEXAMPLE_PKG
- 이유: 
예외 요청 준비됨 (이 예제에서는 실행하지 않음)

로그아웃 완료
```

### 확장 방법

- 자동 수정 기능 구현
- 정기적인 코드 품질 모니터링 스케줄링
- 팀 코드 리뷰 시스템과의 통합

## 대량 객체 변경

### 목적

여러 ABAP 객체를 일괄적으로 변경하는 방법을 보여줍니다.

### 코드

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
    
    // 상태 유지 세션으로 설정 (객체 잠금을 위해 필요)
    client.stateful = "stateful";
    
    // 1. 변경할 패턴 정의
    const searchPattern = 'OLD_PATTERN';
    const replacePattern = 'NEW_PATTERN';
    
    console.log(`검색 패턴: '${searchPattern}'`);
    console.log(`대체 패턴: '${replacePattern}'`);
    
    // 2. 패키지 내용 조회
    const packageName = 'ZEXAMPLE_PKG';
    console.log(`\n패키지 '${packageName}' 내용 조회 중...`);
    
    const packageContents = await client.nodeContents('DEVC/K', packageName);
    
    // 프로그램만 필터링 (더 많은 유형 추가 가능)
    const programs = packageContents.nodes.filter(node => 
      node.OBJECT_TYPE === 'PROG/P' || node.OBJECT_TYPE === 'CLAS/OC'
    );
    
    console.log(`변경 대상 객체 수: ${programs.length}`);
    
    // 3. 트랜스포트 정보 조회
    console.log('\n트랜스포트 정보 조회 중...');
    const transportInfo = await client.transportInfo(
      `/sap/bc/adt/packages/${packageName}`,
      packageName
    );
    
    // 사용 가능한 트랜스포트 찾기
    let transportNumber = '';
    if (transportInfo.TRANSPORTS && transportInfo.TRANSPORTS.length > 0) {
      transportNumber = transportInfo.TRANSPORTS[0].TRKORR;
      console.log(`사용 가능한 트랜스포트: ${transportNumber} (${transportInfo.TRANSPORTS[0].AS4TEXT})`);
    } else {
      console.log('사용 가능한 트랜스포트가 없습니다. 새 트랜스포트 생성 중...');
      
      transportNumber = await client.createTransport(
        `/sap/bc/adt/packages/${packageName}`,
        '대량 객체 변경',
        packageName
      );
      
      console.log(`새 트랜스포트 생성됨: ${transportNumber}`);
    }
    
    // 4. 객체 변경 로그 준비
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
    
    // 5. 각 객체 처리
    console.log('\n객체 처리 시작...');
    
    for (let i = 0; i < programs.length; i++) {
      const program = programs[i];
      console.log(`\n[${i + 1}/${programs.length}] '${program.OBJECT_NAME}' (${program.OBJECT_TYPE}) 처리 중...`);
      
      try {
        // 객체 구조 조회
        const objectStructure = await client.objectStructure(program.OBJECT_URI);
        
        // 객체 유형에 따라 소스 파일 목록 생성
        let sourceFiles = [];
        
        if (program.OBJECT_TYPE === 'CLAS/OC' && client.isClassStructure(objectStructure)) {
          // 클래스의 경우 모든 포함 처리
          const includes = ADTClient.classIncludes(objectStructure);
          sourceFiles = Array.from(includes.entries()).map(([type, url]) => ({ type, url }));
        } else {
          // 다른 객체 유형의 경우 메인 소스만 처리
          const mainUrl = ADTClient.mainInclude(objectStructure);
          sourceFiles = [{ type: 'main', url: mainUrl }];
        }
        
        // 각 소스 파일 처리
        let objectChanged = false;
        const objectChanges = [];
        
        for (const sourceFile of sourceFiles) {
          // 소스 코드 조회
          const source = await client.getObjectSource(sourceFile.url);
          
          // 패턴 검색
          if (source.includes(searchPattern)) {
            // 객체 잠금
            const lock = await client.lock(program.OBJECT_URI);
            
            try {
              // 소스 코드 변경
              const modifiedSource = source.replace(new RegExp(searchPattern, 'g'), replacePattern);
              
              // 변경된 라인 추적
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
              
              // 변경된 소스 저장
              await client.setObjectSource(sourceFile.url, modifiedSource, lock.LOCK_HANDLE, transportNumber);
              
              // 변경 로그 추가
              objectChanges.push({
                sourceType: sourceFile.type,
                changes: changes
              });
              
              objectChanged = true;
              console.log(`  ${sourceFile.type} 소스 변경됨: ${changes.length}개 라인 수정`);
              
              // 객체 잠금 해제
              await client.unLock(program.OBJECT_URI, lock.LOCK_HANDLE);
            } catch (error) {
              // 오류 발생 시 잠금 해제 시도
              try {
                await client.unLock(program.OBJECT_URI, lock.LOCK_HANDLE);
              } catch { /* 무시 */ }
              
              throw error;
            }
          } else {
            console.log(`  ${sourceFile.type} 소스에 패턴이 없음`);
          }
        }
        
        // 변경된 경우 활성화 수행
        if (objectChanged) {
          console.log('  객체 활성화 중...');
          const activationResult = await client.activate(
            program.OBJECT_NAME,
            program.OBJECT_URI
          );
          
          if (activationResult.success) {
            console.log('  활성화 성공');
            
            // 변경 로그에 추가
            changeLog.changedObjects.push({
              name: program.OBJECT_NAME,
              type: program.OBJECT_TYPE,
              sourceChanges: objectChanges,
              activated: true
            });
          } else {
            console.log('  활성화 실패');
            
            // 변경 로그에 추가 (활성화 실패)
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
        console.error(`  '${program.OBJECT_NAME}' 처리 중 오류 발생:`, error);
        
        // 오류 로그에 추가
        changeLog.errorObjects.push({
          name: program.OBJECT_NAME,
          type: program.OBJECT_TYPE,
          error: error.toString()
        });
      }
    }
    
    // 6. 변경 요약 및 로그 저장
    console.log('\n변경 요약:');
    console.log(`- 총 객체 수: ${programs.length}`);
    console.log(`- 변경된 객체 수: ${changeLog.changedObjects.length}`);
    console.log(`- 오류 객체 수: ${changeLog.errorObjects.length}`);
    
    // 로그 파일 저장
    const logFile = './change-log.json';
    fs.writeFileSync(logFile, JSON.stringify(changeLog, null, 2));
    console.log(`\n변경 로그가 ${logFile}에 저장되었습니다.`);
    
    // 7. 변경 리포트 생성
    const reportMarkdown = generateChangeReport(changeLog);
    const reportFile = './change-report.md';
    fs.writeFileSync(reportFile, reportMarkdown);
    console.log(`변경 리포트가 ${reportFile}에 저장되었습니다.`);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
    console.log('로그아웃 완료');
  }
}

// 변경 리포트 생성 함수
function generateChangeReport(changeLog) {
  let report = `# ABAP 객체 대량 변경 리포트\n\n`;
  report += `실행 날짜: ${changeLog.timestamp}\n\n`;
  report += `## 변경 정보\n\n`;
  report += `- 검색 패턴: \`${changeLog.searchPattern}\`\n`;
  report += `- 대체 패턴: \`${changeLog.replacePattern}\`\n`;
  report += `- 패키지: ${changeLog.package}\n`;
  report += `- 트랜스포트: ${changeLog.transport}\n\n`;
  
  report += `## 요약\n\n`;
  report += `- 총 객체 수: ${changeLog.totalObjects}\n`;
  report += `- 변경된 객체 수: ${changeLog.changedObjects.length}\n`;
  report += `- 오류 객체 수: ${changeLog.errorObjects.length}\n\n`;
  
  // 변경된 객체 목록
  if (changeLog.changedObjects.length > 0) {
    report += `## 변경된 객체\n\n`;
    report += `| 객체 이름 | 유형 | 변경된 라인 수 | 활성화 상태 |\n`;
    report += `|-----------|------|--------------|------------|\n`;
    
    changeLog.changedObjects.forEach(obj => {
      const totalChangedLines = obj.sourceChanges.reduce(
        (sum, src) => sum + src.changes.length, 0
      );
      
      report += `| ${obj.name} | ${obj.type} | ${totalChangedLines} | ${obj.activated ? '성공' : '실패'} |\n`;
    });
    
    report += `\n`;
    
    // 활성화 실패 객체 세부 정보
    const failedObjects = changeLog.changedObjects.filter(obj => !obj.activated);
    if (failedObjects.length > 0) {
      report += `### 활성화 실패 객체\n\n`;
      
      failedObjects.forEach(obj => {
        report += `#### ${obj.name} (${obj.type})\n\n`;
        report += `활성화 메시지:\n\n`;
        
        obj.activationMessages.forEach(msg => {
          report += `- ${msg.type}: ${msg.shortText}\n`;
        });
        
        report += `\n`;
      });
    }
    
    // 주요 변경 예시
    report += `### 주요 변경 예시\n\n`;
    
    // 처음 3개 객체만 표시
    changeLog.changedObjects.slice(0, 3).forEach(obj => {
      report += `#### ${obj.name} (${obj.type})\n\n`;
      
      obj.sourceChanges.forEach(src => {
        report += `**${src.sourceType} 소스:**\n\n`;
        
        // 처음 5개 변경만 표시
        src.changes.slice(0, 5).forEach(change => {
          report += `라인 ${change.line}:\n`;
          report += `- 이전: \`${change.original}\`\n`;
          report += `- 이후: \`${change.modified}\`\n\n`;
        });
        
        if (src.changes.length > 5) {
          report += `*... 외 ${src.changes.length - 5}개 변경*\n\n`;
        }
      });
    });
    
    if (changeLog.changedObjects.length > 3) {
      report += `*... 외 ${changeLog.changedObjects.length - 3}개 객체*\n\n`;
    }
  }
  
  // 오류 객체 목록
  if (changeLog.errorObjects.length > 0) {
    report += `## 오류 객체\n\n`;
    
    changeLog.errorObjects.forEach(obj => {
      report += `### ${obj.name} (${obj.type})\n\n`;
      report += `오류: ${obj.error}\n\n`;
    });
  }
  
  return report;
}

massObjectModifier().catch(console.error);
```

### 확장 방법

- 정규식 패턴 지원 강화
- 변경 미리보기 및 확인 기능 추가
- 롤백 메커니즘 구현

## 테스트 자동화

### 목적

ABAP 단위 테스트를 자동화하고 테스트 결과를 보고하는 방법을 보여줍니다.

### 코드

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
    
    // 1. 테스트 설정
    const packageName = 'ZEXAMPLE_PKG';
    
    // 테스트 플래그 설정 (모든 유형의 테스트 실행)
    const testFlags: UnitTestRunFlags = {
      harmless: true,
      dangerous: true,
      critical: false,  // 위험한 테스트는 제외
      short: true,
      medium: true,
      long: false       // 긴 테스트는 제외
    };
    
    console.log(`패키지 '${packageName}'의 테스트 자동화 시작`);
    console.log('테스트 플래그:', testFlags);
    
    // 2. 패키지 내용 조회
    console.log('\n패키지 내용 조회 중...');
    const packageContents = await client.nodeContents('DEVC/K', packageName);
    
    // 클래스만 필터링
    const classes = packageContents.nodes.filter(node => 
      node.OBJECT_TYPE === 'CLAS/OC'
    );
    
    console.log(`발견된 클래스 수: ${classes.length}`);
    
    // 3. 테스트 클래스 식별
    console.log('\n테스트 클래스 식별 중...');
    const testClasses = [];
    
    for (const cls of classes) {
      // 객체 구조 조회
      const objectStructure = await client.objectStructure(cls.OBJECT_URI);
      
      // 클래스 구조인지 확인
      if (client.isClassStructure(objectStructure)) {
        // 테스트 클래스 포함 확인
        const includes = ADTClient.classIncludes(objectStructure);
        
        if (includes.has('testclasses')) {
          testClasses.push({
            name: cls.OBJECT_NAME,
            uri: cls.OBJECT_URI,
            includeUrl: includes.get('testclasses')
          });
          
          console.log(`- ${cls.OBJECT_NAME} (테스트 클래스 포함 있음)`);
        }
      }
    }
    
    console.log(`발견된 테스트 클래스 포함이 있는 클래스 수: ${testClasses.length}`);
    
    // 4. 테스트 실행
    console.log('\n테스트 실행 중...');
    
    const testResults = [];
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    for (let i = 0; i < testClasses.length; i++) {
      const testClass = testClasses[i];
      console.log(`\n[${i + 1}/${testClasses.length}] '${testClass.name}' 테스트 실행 중...`);
      
      try {
        // 단위 테스트 실행
        const results = await client.unitTestRun(testClass.uri, testFlags);
        
        // 결과 집계
        let classTests = 0;
        let classPassed = 0;
        let classFailed = 0;
        
        // 테스트 결과가 없을 수 있음
        if (results.length === 0) {
          console.log('  테스트 결과 없음');
          continue;
        }
        
        results.forEach(result => {
          console.log(`  테스트 클래스: ${result['adtcore:name']} (${result.testmethods.length} 메서드)`);
          
          result.testmethods.forEach(method => {
            classTests++;
            
            if (method.alerts.length === 0) {
              classPassed++;
            } else {
              classFailed++;
              
              console.log(`    ❌ ${method['adtcore:name']} - 실패`);
              method.alerts.forEach(alert => {
                console.log(`      - ${alert.kind} (${alert.severity}): ${alert.title}`);
              });
            }
          });
        });
        
        console.log(`  결과: ${classPassed}/${classTests} 성공 (${(classPassed / classTests * 100).toFixed(2)}%)`);
        
        // 전체 집계 업데이트
        totalTests += classTests;
        passedTests += classPassed;
        failedTests += classFailed;
        
        // 결과 저장
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
        console.error(`  '${testClass.name}' 테스트 실행 중 오류 발생:`, error);
        
        // 오류 결과 저장
        testResults.push({
          className: testClass.name,
          classUri: testClass.uri,
          error: error.toString()
        });
      }
    }
    
    // 5. 테스트 요약
    console.log('\n테스트 결과 요약:');
    console.log(`- 총 테스트 수: ${totalTests}`);
    console.log(`- 성공한 테스트: ${passedTests}`);
    console.log(`- 실패한 테스트: ${failedTests}`);
    console.log(`- 성공률: ${(passedTests / totalTests * 100).toFixed(2)}%`);
    
    // 6. 테스트 보고서 생성
    console.log('\n테스트 보고서 생성 중...');
    
    const reportMarkdown = generateTestReport(testResults, {
      totalTests,
      passedTests,
      failedTests
    });
    
    const reportFile = './test-report.md';
    fs.writeFileSync(reportFile, reportMarkdown);
    console.log(`테스트 보고서가 ${reportFile}에 저장되었습니다.`);
    
    // 7. JUnit XML 보고서 생성 (CI/CD 통합용)
    console.log('\nJUnit XML 보고서 생성 중...');
    
    const junitXml = generateJUnitXml(testResults, packageName);
    
    const junitFile = './test-results.xml';
    fs.writeFileSync(junitFile, junitXml);
    console.log(`JUnit XML 보고서가 ${junitFile}에 저장되었습니다.`);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
    console.log('로그아웃 완료');
  }
}

// 테스트 보고서 생성 함수
function generateTestReport(testResults, summary) {
  let report = `# ABAP 단위 테스트 보고서\n\n`;
  report += `실행 날짜: ${new Date().toISOString()}\n\n`;
  
  report += `## 요약\n\n`;
  report += `- 총 테스트 수: ${summary.totalTests}\n`;
  report += `- 성공한 테스트: ${summary.passedTests}\n`;
  report += `- 실패한 테스트: ${summary.failedTests}\n`;
  report += `- 성공률: ${(summary.passedTests / summary.totalTests * 100).toFixed(2)}%\n\n`;
  
  // 클래스별 결과
  report += `## 클래스별 결과\n\n`;
  report += `| 클래스 | 테스트 수 | 성공 | 실패 | 성공률 |\n`;
  report += `|--------|-----------|------|------|--------|\n`;
  
  testResults.forEach(result => {
    if (result.error) {
      report += `| ${result.className} | - | - | - | ❌ 오류 |\n`;
    } else {
      const summary = result.summary;
      report += `| ${result.className} | ${summary.total} | ${summary.passed} | ${summary.failed} | ${(summary.passRate * 100).toFixed(2)}% |\n`;
    }
  });
  
  report += `\n`;
  
  // 실패한 테스트 세부 정보
  const failedTestResults = testResults.filter(r => r.summary && r.summary.failed > 0);
  
  if (failedTestResults.length > 0) {
    report += `## 실패한 테스트 세부 정보\n\n`;
    
    failedTestResults.forEach(result => {
      report += `### ${result.className}\n\n`;
      
      result.results.forEach(cls => {
        const failedMethods = cls.testmethods.filter(m => m.alerts.length > 0);
        
        failedMethods.forEach(method => {
          report += `#### ${method['adtcore:name']}\n\n`;
          
          method.alerts.forEach(alert => {
            report += `- **${alert.kind} (${alert.severity})**: ${alert.title}\n`;
            
            if (alert.details.length > 0) {
              report += `  세부 정보:\n`;
              alert.details.forEach(detail => {
                report += `  - ${detail}\n`;
              });
            }
            
            if (alert.stack && alert.stack.length > 0) {
              report += `  스택 추적:\n`;
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
  
  // 오류 발생 클래스
  const errorResults = testResults.filter(r => r.error);
  
  if (errorResults.length > 0) {
    report += `## 오류 발생 클래스\n\n`;
    
    errorResults.forEach(result => {
      report += `### ${result.className}\n\n`;
      report += `오류: ${result.error}\n\n`;
    });
  }
  
  return report;
}

// JUnit XML 보고서 생성 함수 (CI/CD 통합용)
function generateJUnitXml(testResults, packageName) {
  const timestamp = new Date().toISOString();
  let totalTests = 0;
  let failures = 0;
  let errors = 0;
  let skipped = 0;
  let time = 0;
  
  let testCases = '';
  
  // 각 테스트 케이스 처리
  testResults.forEach(result => {
    if (result.error) {
      // 오류가 있는 클래스
      testCases += `  <testcase classname="${packageName}.${result.className}" name="${result.className}" time="0">\n`;
      testCases += `    <error message="Test execution error" type="ExecutionError">${escapeXml(result.error)}</error>\n`;
      testCases += `  </testcase>\n`;
      errors++;
      totalTests++;
    } else if (result.results) {
      // 테스트 결과가 있는 클래스
      result.results.forEach(cls => {
        cls.testmethods.forEach(method => {
          totalTests++;
          time += method.executionTime / 1000; // 밀리초를 초로 변환
          
          testCases += `  <testcase classname="${packageName}.${result.className}" name="${method['adtcore:name']}" time="${method.executionTime / 1000}">\n`;
          
          if (method.alerts.length > 0) {
            failures++;
            
            // 첫 번째 알림만 사용
            const alert = method.alerts[0];
            testCases += `    <failure message="${escapeXml(alert.title)}" type="${alert.kind}">\n`;
            
            // 세부 정보 추가
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
  
  // XML 생성
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<testsuites name="${packageName}" tests="${totalTests}" failures="${failures}" errors="${errors}" skipped="${skipped}" time="${time}">\n`;
  xml += `<testsuite name="${packageName}" tests="${totalTests}" failures="${failures}" errors="${errors}" skipped="${skipped}" time="${time}" timestamp="${timestamp}">\n`;
  xml += testCases;
  xml += '</testsuite>\n';
  xml += '</testsuites>';
  
  return xml;
}

// XML 이스케이프 함수
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

### 확장 방법

- 코드 커버리지 분석 추가
- 테스트 결과 시각화 구현
- CI/CD 파이프라인 통합

## ABAP Git 통합

### 목적

ABAP Git을 사용하여 ABAP 객체와 외부 Git 저장소를 동기화하는 방법을 보여줍니다.

### 코드

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
    
    // 1. 등록된 Git 저장소 목록 조회
    console.log('등록된 Git 저장소 조회 중...');
    const repositories = await client.gitRepos();
    
    console.log(`발견된 저장소 수: ${repositories.length}`);
    repositories.forEach((repo, index) => {
      console.log(`\n[${index + 1}] ${repo.url}`);
      console.log(`  - 패키지: ${repo.sapPackage}`);
      console.log(`  - 브랜치: ${repo.branch_name}`);
      console.log(`  - 상태: ${repo.status_text || '정상'}`);
    });
    
    // 2. 새 저장소 등록 (선택적)
    const createNewRepo = false; // 필요에 따라 변경
    
    if (createNewRepo) {
      const packageName = 'ZEXAMPLE_PKG';
      const repoUrl = 'https://github.com/example/example-repo.git';
      const branch = 'refs/heads/main';
      
      console.log(`\n새 Git 저장소 등록 중...`);
      console.log(`  - 패키지: ${packageName}`);
      console.log(`  - URL: ${repoUrl}`);
      console.log(`  - 브랜치: ${branch}`);
      
      try {
        const result = await client.gitCreateRepo(
          packageName,
          repoUrl,
          branch
        );
        
        console.log('저장소 등록 성공!');
        
        if (result && result.length > 0) {
          console.log('객체 가져오기 결과:');
          result.forEach(obj => {
            console.log(`  - ${obj.obj_name} (${obj.obj_type}): ${obj.obj_status}`);
          });
        }
      } catch (error) {
        console.error('저장소 등록 실패:', error);
      }
    }
    
    // 저장소가 없으면 종료
    if (repositories.length === 0) {
      console.log('\n작업할 저장소가 없습니다.');
      return;
    }
    
    // 3. 첫 번째 저장소 작업
    const repo = repositories[0];
    console.log(`\n저장소 '${repo.url}' 작업 시작`);
    
    // 4. 원격 저장소 정보 조회
    console.log('\n원격 저장소 정보 조회 중...');
    
    try {
      const repoInfo = await client.gitExternalRepoInfo(repo.url);
      
      console.log(`접근 모드: ${repoInfo.access_mode}`);
      console.log('브랜치 목록:');
      
      repoInfo.branches.forEach(branch => {
        console.log(`  - ${branch.display_name} (${branch.is_head ? '현재 HEAD' : ''})`);
      });
      
      // 5. 저장소 상태 확인
      console.log('\n저장소 상태 확인 중...');
      await client.checkRepo(repo);
      console.log('저장소 상태 정상');
      
      // 6. 스테이징 영역 조회
      console.log('\n스테이징 영역 조회 중...');
      const staging = await client.stageRepo(repo);
      
      console.log('변경 내용:');
      console.log(`  - 스테이징 객체 수: ${staging.staged.length}`);
      console.log(`  - 미스테이징 객체 수: ${staging.unstaged.length}`);
      console.log(`  - 무시된 객체 수: ${staging.ignored.length}`);
      
      // 변경 내용 파일에 로깅
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
      console.log('스테이징 상태가 git-staging.json에 저장되었습니다.');
      
      // 7. 변경 사항 스테이징 및 푸시 (선택적)
      const performPush = false; // 필요에 따라 변경
      
      if (performPush && staging.unstaged.length > 0) {
        console.log('\n변경 사항 스테이징 중...');
        
        // 모든 미스테이징 객체를 스테이징 영역으로 이동
        for (const obj of staging.unstaged) {
          // 이미 스테이징된 객체와 충돌하지 않는지 확인
          const existingStagedObj = staging.staged.find(s => s.wbkey === obj.wbkey);
          
          if (!existingStagedObj) {
            // 스테이징 영역으로 이동
            staging.staged.push(obj);
            
            // 미스테이징 목록에서 제거
            staging.unstaged = staging.unstaged.filter(u => u.wbkey !== obj.wbkey);
            
            console.log(`  - '${obj.name}' (${obj.type}) 스테이징됨`);
          } else {
            console.log(`  - '${obj.name}' (${obj.type}) 스테이징 건너뜀 (이미 존재)`);
          }
        }
        
        // 커밋 정보 설정
        staging.comment = `ADT API를 통한 자동 푸시 (${new Date().toISOString()})`;
        staging.author = {
          name: client.username,
          email: `${client.username.toLowerCase()}@example.com`
        };
        staging.committer = { ...staging.author };
        
        console.log('\n변경 사항 푸시 중...');
        console.log(`  - 커밋 메시지: ${staging.comment}`);
        console.log(`  - 커밋 작성자: ${staging.author.name} <${staging.author.email}>`);
        
        try {
          await client.pushRepo(repo, staging);
          console.log('푸시 성공!');
        } catch (error) {
          console.error('푸시 실패:', error);
        }
      }
      
      // 8. 저장소 풀 (선택적)
      const performPull = false; // 필요에 따라 변경
      
      if (performPull) {
        console.log('\n원격 변경 사항 가져오는 중...');
        
        try {
          const pullResult = await client.gitPullRepo(
            repo.key,
            repo.branch_name
          );
          
          console.log('풀 성공!');
          
          if (pullResult && pullResult.length > 0) {
            console.log('가져온 객체:');
            pullResult.forEach(obj => {
              console.log(`  - ${obj.obj_name} (${obj.obj_type}): ${obj.obj_status}`);
            });
          } else {
            console.log('가져온 변경 사항 없음');
          }
        } catch (error) {
          console.error('풀 실패:', error);
        }
      }
      
      // 9. 브랜치 전환 (선택적)
      const switchBranch = false; // 필요에 따라 변경
      const targetBranch = 'refs/heads/feature/example';
      
      if (switchBranch && repoInfo.branches.some(b => b.name === targetBranch)) {
        console.log(`\n브랜치 '${targetBranch}'로 전환 중...`);
        
        try {
          await client.switchRepoBranch(repo, targetBranch);
          console.log('브랜치 전환 성공!');
        } catch (error) {
          console.error('브랜치 전환 실패:', error);
        }
      }
      
    } catch (error) {
      console.error('저장소 작업 중 오류 발생:', error);
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
    console.log('\n로그아웃 완료');
  }
}

abapGitIntegration().catch(console.error);
```

### 확장 방법

- Git 저장소와 CI/CD 파이프라인 통합
- 정기적인 변경 사항 동기화 자동화
- 브랜치 및 태그 관리 기능 추가

## 성능 추적 및 분석

### 목적

ABAP 추적 기능을 사용하여 성능 문제를 식별하고 분석하는 방법을 보여줍니다.

### 코드

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
    
    // 1. 현재 사용자의 기존 추적 조회
    console.log('기존 추적 조회 중...');
    const traceRuns = await client.tracesList();
    
    console.log(`발견된 추적 수: ${traceRuns.runs.length}`);
    traceRuns.runs.forEach((run, index) => {
      console.log(`\n[${index + 1}] ${run.title}`);
      console.log(`  - ID: ${run.id.split(',').pop()}`);
      console.log(`  - 생성 날짜: ${run.published.toISOString()}`);
      console.log(`  - 상태: ${run.extendedData.state.text}`);
      console.log(`  - 객체: ${run.extendedData.objectName}`);
      console.log(`  - 런타임: ${run.extendedData.runtime}μs`);
    });
    
    // 2. 추적 매개변수 설정
    console.log('\n추적 매개변수 설정 중...');
    
    const traceParameters: TraceParameters = {
      allMiscAbapStatements: true,
      allProceduralUnits: true,
      allInternalTableEvents: false,
      allDynproEvents: false,
      description: '성능 분석 추적',
      aggregate: true,
      explicitOnOff: true,
      withRfcTracing: true,
      allSystemKernelEvents: false,
      sqlTrace: true,
      allDbEvents: true,
      maxSizeForTraceFile: 100, // MB
      maxTimeForTracing: 60     // 분
    };
    
    const parametersId = await client.tracesSetParameters(traceParameters);
    console.log(`추적 매개변수 설정 완료: ${parametersId}`);
    
    // 3. 새 추적 구성 생성 (선택적)
    const createNewTrace = true; // 필요에 따라 변경
    
    if (createNewTrace) {
      console.log('\n새 추적 구성 생성 중...');
      
      const traceConfig: TracesCreationConfig = {
        description: '트랜잭션 성능 분석',
        traceUser: client.username,
        traceClient: client.client,
        processType: 'HTTP',
        objectType: 'URL',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후
        maximalExecutions: 3,
        parametersId
      };
      
      try {
        const result = await client.tracesCreateConfiguration(traceConfig);
        console.log('추적 구성 생성 성공!');
        console.log(`  - 제목: ${result.title}`);
        console.log(`  - 요청 수: ${result.requests.length}`);
        
        // 추적 구성 ID 저장
        if (result.requests.length > 0) {
          const traceId = result.requests[0].id;
          fs.writeFileSync('./trace-id.txt', traceId);
          console.log(`  - 추적 ID '${traceId}'가 trace-id.txt에 저장되었습니다.`);
        }
      } catch (error) {
        console.error('추적 구성 생성 실패:', error);
      }
    }
    
    // 4. 기존 추적 분석 (첫 번째 추적 선택)
    if (traceRuns.runs.length === 0) {
      console.log('\n분석할 추적이 없습니다.');
      return;
    }
    
    const traceRun = traceRuns.runs[0];
    console.log(`\n추적 '${traceRun.title}' 분석 시작`);
    
    // 5. 히트 목록 조회
    console.log('\n히트 목록 조회 중...');
    const hitList = await client.tracesHitList(traceRun.id);
    
    console.log(`발견된 히트 항목 수: ${hitList.entries.length}`);
    console.log('상위 5개 히트 항목:');
    
    const sortedHits = [...hitList.entries].sort(
      (a, b) => b.grossTime.time - a.grossTime.time
    );
    
    sortedHits.slice(0, 5).forEach((hit, index) => {
      console.log(`\n[${index + 1}] ${hit.description}`);
      console.log(`  - 총 시간: ${hit.grossTime.time}μs (${hit.grossTime.percentage}%)`);
      console.log(`  - 순 시간: ${hit.traceEventNetTime.time}μs (${hit.traceEventNetTime.percentage}%)`);
      
      if (hit.callingProgram) {
        console.log(`  - 호출 프로그램: ${hit.callingProgram.name || hit.callingProgram.context}`);
      }
    });
    
    // 6. 데이터베이스 접근 조회
    console.log('\n데이터베이스 접근 조회 중...');
    const dbAccesses = await client.tracesDbAccess(traceRun.id);
    
    console.log(`발견된 DB 접근 수: ${dbAccesses.dbaccesses.length}`);
    console.log('상위 5개 DB 접근:');
    
    const sortedDbAccesses = [...dbAccesses.dbaccesses].sort(
      (a, b) => b.accessTime.total - a.accessTime.total
    );
    
    sortedDbAccesses.slice(0, 5).forEach((access, index) => {
      console.log(`\n[${index + 1}] ${access.tableName} (${access.type || '알 수 없음'})`);
      console.log(`  - 문장: ${access.statement || '없음'}`);
      console.log(`  - 총 시간: ${access.accessTime.total}μs (${access.accessTime.ratioOfTraceTotal}%)`);
      console.log(`  - 총 호출 수: ${access.totalCount} (버퍼링됨: ${access.bufferedCount})`);
      
      if (access.callingProgram) {
        console.log(`  - 호출 프로그램: ${access.callingProgram.name || access.callingProgram.context}`);
      }
    });
    
    // 7. 문장 트리 조회
    console.log('\n문장 트리 조회 중...');
    const statements = await client.tracesStatements(traceRun.id, {
      withDetails: true
    });
    
    console.log(`발견된 문장 수: ${statements.statements.length}`);
    console.log('상위 5개 문장:');
    
    const sortedStatements = [...statements.statements].sort(
      (a, b) => b.grossTime.time - a.grossTime.time
    );
    
    sortedStatements.slice(0, 5).forEach((stmt, index) => {
      console.log(`\n[${index + 1}] ${stmt.description}`);
      console.log(`  - 레벨: ${stmt.callLevel}`);
      console.log(`  - 총 시간: ${stmt.grossTime.time}μs (${stmt.grossTime.percentage}%)`);
      console.log(`  - 순 시간: ${stmt.traceEventNetTime.time}μs (${stmt.traceEventNetTime.percentage}%)`);
      console.log(`  - 프로시저 순 시간: ${stmt.proceduralNetTime.time}μs (${stmt.proceduralNetTime.percentage}%)`);
      
      if (stmt.callingProgram) {
        console.log(`  - 프로그램: ${stmt.callingProgram.name || stmt.callingProgram.context}`);
        if (stmt.callingProgram.uri) {
          console.log(`  - URI: ${stmt.callingProgram.uri}`);
        }
      }
    });
    
    // 8. 성능 보고서 생성
    console.log('\n성능 보고서 생성 중...');
    
    const performanceReport = generatePerformanceReport({
      trace: traceRun,
      hitList: sortedHits,
      dbAccesses: sortedDbAccesses,
      statements: sortedStatements
    });
    
    const reportFile = './performance-report.md';
    fs.writeFileSync(reportFile, performanceReport);
    console.log(`성능 보고서가 ${reportFile}에 저장되었습니다.`);
    
    // 9. 추적 삭제 (선택적)
    const deleteTrace = false; // 필요에 따라 변경
    
    if (deleteTrace) {
      console.log(`\n추적 '${traceRun.title}' 삭제 중...`);
      
      try {
        await client.tracesDelete(traceRun.id);
        console.log('추적 삭제 성공!');
      } catch (error) {
        console.error('추적 삭제 실패:', error);
      }
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
    console.log('\n로그아웃 완료');
  }
}

// 성능 보고서 생성 함수
function generatePerformanceReport(data) {
  const trace = data.trace;
  const hitList = data.hitList;
  const dbAccesses = data.dbAccesses;
  const statements = data.statements;
  
  let report = `# ABAP 성능 분석 보고서\n\n`;
  report += `분석 날짜: ${new Date().toISOString()}\n\n`;
  report += `## 추적 정보\n\n`;
  report += `- 제목: ${trace.title}\n`;
  report += `- 객체: ${trace.extendedData.objectName}\n`;
  report += `- 생성 날짜: ${trace.published.toISOString()}\n`;
  report += `- 호스트: ${trace.extendedData.host}\n`;
  report += `- 시스템: ${trace.extendedData.system}\n`;
  report += `- 클라이언트: ${trace.extendedData.client}\n`;
  report += `- 상태: ${trace.extendedData.state.text}\n\n`;
  
  report += `## 런타임 요약\n\n`;
  report += `- 총 런타임: ${trace.extendedData.runtime}μs (${(trace.extendedData.runtime / 1000000).toFixed(3)}초)\n`;
  report += `- ABAP 런타임: ${trace.extendedData.runtimeABAP}μs (${(trace.extendedData.runtimeABAP / 1000000).toFixed(3)}초)\n`;
  report += `- 시스템 런타임: ${trace.extendedData.runtimeSystem}μs (${(trace.extendedData.runtimeSystem / 1000000).toFixed(3)}초)\n`;
  report += `- 데이터베이스 런타임: ${trace.extendedData.runtimeDatabase}μs (${(trace.extendedData.runtimeDatabase / 1000000).toFixed(3)}초)\n\n`;
  
  // 히트 목록 섹션
  report += `## 상위 10개 히트 항목\n\n`;
  report += `| 순위 | 설명 | 총 시간 (μs) | 총 시간 (%) | 순 시간 (μs) | 순 시간 (%) | 호출 프로그램 |\n`;
  report += `|------|------|--------------|------------|--------------|------------|----------------|\n`;
  
  hitList.slice(0, 10).forEach((hit, index) => {
    const callingProgram = hit.callingProgram 
      ? (hit.callingProgram.name || hit.callingProgram.context) 
      : '';
    
    report += `| ${index + 1} | ${hit.description} | ${hit.grossTime.time} | ${hit.grossTime.percentage} | ${hit.traceEventNetTime.time} | ${hit.traceEventNetTime.percentage} | ${callingProgram} |\n`;
  });
  
  report += `\n`;
  
  // 데이터베이스 접근 섹션
  report += `## 상위 10개 데이터베이스 접근\n\n`;
  report += `| 순위 | 테이블 | 문장 | 총 시간 (μs) | 총 시간 (%) | 호출 수 | 버퍼링 수 | 호출 프로그램 |\n`;
  report += `|------|--------|------|--------------|------------|---------|------------|----------------|\n`;
  
  dbAccesses.slice(0, 10).forEach((access, index) => {
    const callingProgram = access.callingProgram 
      ? (access.callingProgram.name || access.callingProgram.context) 
      : '';
    
    report += `| ${index + 1} | ${access.tableName} | ${access.statement || ''} | ${access.accessTime.total} | ${access.accessTime.ratioOfTraceTotal} | ${access.totalCount} | ${access.bufferedCount} | ${callingProgram} |\n`;
  });
  
  report += `\n`;
  
  // 문장 섹션
  report += `## 상위 10개 문장\n\n`;
  report += `| 순위 | 설명 | 레벨 | 총 시간 (μs) | 총 시간 (%) | 순 시간 (μs) | 순 시간 (%) | 프로그램 |\n`;
  report += `|------|------|------|--------------|------------|--------------|------------|----------|\n`;
  
  statements.slice(0, 10).forEach((stmt, index) => {
    const callingProgram = stmt.callingProgram 
      ? (stmt.callingProgram.name || stmt.callingProgram.context) 
      : '';
    
    report += `| ${index + 1} | ${stmt.description} | ${stmt.callLevel} | ${stmt.grossTime.time} | ${stmt.grossTime.percentage} | ${stmt.traceEventNetTime.time} | ${stmt.traceEventNetTime.percentage} | ${callingProgram} |\n`;
  });
  
  report += `\n`;
  
  // 성능 개선 제안
  report += `## 성능 개선 제안\n\n`;
  
  // 데이터베이스 관련 제안
  const dbIssues = dbAccesses.filter(a => a.accessTime.ratioOfTraceTotal > 5);
  
  if (dbIssues.length > 0) {
    report += `### 데이터베이스 성능 문제\n\n`;
    
    dbIssues.forEach((access, index) => {
      report += `${index + 1}. **${access.tableName}** (${access.accessTime.ratioOfTraceTotal}% 소요)\n`;
      report += `   - 문장: \`${access.statement || '없음'}\`\n`;
      report += `   - 호출 수: ${access.totalCount} (버퍼링됨: ${access.bufferedCount})\n`;
      
      // 추가 제안
      if (access.totalCount > 1 && access.bufferedCount === 0) {
        report += `   - **제안**: 버퍼링 검토 필요\n`;
      }
      
      if (access.statement && access.statement.toLowerCase().includes('select') && !access.statement.toLowerCase().includes('where')) {
        report += `   - **제안**: WHERE 절 없는 SELECT 검토 필요\n`;
      }
      
      report += `\n`;
    });
  }
  
  // 큰 호출 트리 제안
  const deepCalls = statements.filter(s => s.callLevel > 10 && s.grossTime.percentage > 2);
  
  if (deepCalls.length > 0) {
    report += `### 깊은 호출 구조\n\n`;
    
    deepCalls.forEach((stmt, index) => {
      report += `${index + 1}. **${stmt.description}** (레벨 ${stmt.callLevel}, ${stmt.grossTime.percentage}% 소요)\n`;
      
      if (stmt.callingProgram) {
        report += `   - 프로그램: ${stmt.callingProgram.name || stmt.callingProgram.context}\n`;
      }
      
      report += `   - **제안**: 호출 구조 단순화 검토\n\n`;
    });
  }
  
  // 긴 런타임 함수 제안
  const longRunning = hitList.filter(h => h.grossTime.percentage > 10);
  
  if (longRunning.length > 0) {
    report += `### 긴 런타임 함수\n\n`;
    
    longRunning.forEach((hit, index) => {
      report += `${index + 1}. **${hit.description}** (${hit.grossTime.percentage}% 소요)\n`;
      
      if (hit.callingProgram) {
        report += `   - 호출 위치: ${hit.callingProgram.name || hit.callingProgram.context}\n`;
      }
      
      report += `   - **제안**: 최적화 및 가능하면 병렬 처리 검토\n\n`;
    });
  }
  
  return report;
}

performanceAnalyzer().catch(console.error);
```

### 확장 방법

- 자동 성능 알림 시스템 구축
- 성능 벤치마킹 및 기준 설정
- 시각적 성능 대시보드 구현

## 디버깅 자동화

### 목적

ABAP 디버깅 API를 사용하여 디버깅 프로세스를 자동화하는 방법을 보여줍니다.

### 코드

```typescript
// automated-debugger.ts
import { ADTClient, DebuggingMode, DebugBreakpoint, DebugVariable } from 'abap-adt-api';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 디버거 설정
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
    
    // 1. 디버거 설정 로드
    console.log('디버거 설정 로드 중...');
    
    // 설정 파일이 없으면 기본 설정 생성
    const configFile = './debugger-config.json';
    let config: DebuggerConfig;
    
    if (fs.existsSync(configFile)) {
      config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      console.log('기존 설정 로드됨');
    } else {
      // 기본 설정 생성
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
      console.log('새 설정 생성됨');
    }
    
    console.log(`디버깅 모드: 사용자`);
    console.log(`터미널 ID: ${config.terminalId}`);
    console.log(`IDE ID: ${config.ideId}`);
    console.log(`중단점 수: ${config.breakpoints.length}`);
    
    // 2. 디버거 이미 실행 중인지 확인
    console.log('\n디버거 상태 확인 중...');
    
    try {
      const listenerStatus = await client.debuggerListeners(
        'user',
        config.terminalId,
        config.ideId,
        client.username
      );
      
      if (listenerStatus) {
        console.log('충돌 발견:');
        console.log(`- 메시지: ${listenerStatus.message.text}`);
        console.log(`- 사용자: ${listenerStatus.ideUser}`);
        
        // 기존 리스너 종료
        console.log('\n기존 디버거 종료 중...');
        await client.debuggerDeleteListener(
          'user',
          config.terminalId,
          config.ideId,
          client.username
        );
        
        console.log('기존 디버거 종료됨');
      } else {
        console.log('실행 중인 디버거 없음');
      }
    } catch (error) {
      console.error('디버거 상태 확인 중 오류 발생:', error);
    }
    
    // 3. 중단점 설정
    console.log('\n중단점 설정 중...');
    
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
      
      console.log(`중단점 ${setBreakpoints.length}개 설정됨`);
      
      setBreakpoints.forEach((bp, i) => {
        if ('uri' in bp) {
          console.log(`- BP${i+1}: ${bp.uri.uri} (라인 ${bp.uri.range.start.line})`);
          if (bp.condition) {
            console.log(`  조건: ${bp.condition}`);
          }
        } else if ('errorMessage' in bp) {
          console.log(`- BP${i+1} 오류: ${bp.errorMessage}`);
        }
      });
    } catch (error) {
      console.error('중단점 설정 중 오류 발생:', error);
    }
    
    // 4. 디버거 설정 구성
    console.log('\n디버거 설정 구성 중...');
    
    try {
      await client.debuggerSaveSettings({
        systemDebugging: false,
        createExceptionObject: true,
        backgroundRFC: true,
        sharedObjectDebugging: false,
        showDataAging: true,
        updateDebugging: false
      });
      
      console.log('디버거 설정 구성 완료');
    } catch (error) {
      console.error('디버거 설정 중 오류 발생:', error);
    }
    
    // 5. 디버거 리스닝 시작
    console.log('\n디버거 리스닝 시작 중...');
    console.log('(참고: 이 단계는 디버거가 트리거될 때까지 대기합니다)');
    console.log('디버깅할 트랜잭션을 실행하세요...');
    
    let debugSession;
    try {
      debugSession = await client.debuggerListen(
        'user',
        config.terminalId,
        config.ideId,
        client.username
      );
      
      if (!debugSession) {
        console.log('\n디버거 세션이 종료되거나 시간 초과됨');
        return;
      }
      
      if ('conflictText' in debugSession) {
        console.log('\n디버거 충돌 발생:');
        console.log(`- 메시지: ${debugSession.message.text}`);
        console.log(`- 사용자: ${debugSession.ideUser}`);
        return;
      }
      
      console.log('\n디버거 세션 시작됨!');
      console.log(`- 프로그램: ${debugSession.PRG_CURR}`);
      console.log(`- 포함: ${debugSession.INCL_CURR}`);
      console.log(`- 라인: ${debugSession.LINE_CURR}`);
      console.log(`- 사용자: ${debugSession.DEBUGGEE_USER}`);
      
      // 6. 디버거 세션에 연결
      console.log('\n디버거 세션에 연결 중...');
      
      const attach = await client.debuggerAttach(
        'user',
        debugSession.DEBUGGEE_ID,
        client.username
      );
      
      console.log('디버거 세션 연결됨!');
      console.log(`- 세션 ID: ${attach.debugSessionId}`);
      console.log(`- 제목: ${attach.sessionTitle}`);
      
      if (attach.reachedBreakpoints.length > 0) {
        console.log(`- 도달한 중단점: ${attach.reachedBreakpoints.length}개`);
        attach.reachedBreakpoints.forEach(bp => {
          console.log(`  - ID: ${bp.id}, 유형: ${bp.kind}`);
        });
      }
      
      // 디버깅 세션 기록 파일 준비
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
      
      // 7. 스택 추적 조회
      console.log('\n스택 추적 조회 중...');
      
      const stack = await client.debuggerStackTrace();
      
      console.log(`스택 깊이: ${stack.stack.length}`);
      stack.stack.slice(0, 5).forEach((frame, i) => {
        console.log(`[${i}] ${frame.programName} - ${frame.eventType} ${frame.eventName || ''}`);
        console.log(`    라인 ${frame.line}`);
      });
      
      // 8. 변수 조회 및 관찰
      console.log('\n변수 조회 중...');
      
      // 루트 변수 조회
      const childVars = await client.debuggerChildVariables();
      
      console.log(`변수 계층 구조: ${childVars.hierarchies.length}개`);
      console.log(`루트 변수: ${childVars.variables.length}개`);
      
      // 관찰 변수 ID 찾기
      const watchIds: string[] = [];
      
      for (const watchName of config.watchVariables) {
        const foundVar = childVars.variables.find(v => 
          v.NAME.toLowerCase() === watchName.toLowerCase()
        );
        
        if (foundVar) {
          watchIds.push(foundVar.ID);
          console.log(`'${watchName}' 변수 발견 (ID: ${foundVar.ID})`);
        } else {
          console.log(`'${watchName}' 변수를 찾을 수 없음`);
        }
      }
      
      // 관찰 변수 로드
      if (watchIds.length > 0) {
        console.log('\n관찰 변수 로드 중...');
        const watchVars = await client.debuggerVariables(watchIds);
        
        watchVars.forEach(v => {
          console.log(`변수: ${v.NAME} (${v.META_TYPE}, ${v.ACTUAL_TYPE_NAME})`);
          console.log(`값: ${v.VALUE}`);
          
          if (v.META_TYPE === 'table') {
            console.log(`테이블 라인 수: ${v.TABLE_LINES}`);
          }
        });
        
        // 관찰 변수 기록
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
      
      // 9. 디버깅 단계 실행
      console.log('\n디버깅 단계 실행 시작...');
      
      const stepTypes = ['stepInto', 'stepOver', 'stepOver', 'stepReturn'] as const;
      let stepCount = 0;
      let continueDebugging = true;
      
      while (continueDebugging && stepCount < config.maxSteps) {
        // 스텝 유형 결정 (간단한 순환)
        const stepType = stepTypes[stepCount % stepTypes.length];
        
        console.log(`\n[${stepCount + 1}/${config.maxSteps}] ${stepType} 실행 중...`);
        
        try {
          // 단계 실행
          const stepResult = await client.debuggerStep(stepType);
          
          console.log(`- 위치: 라인 ${stepResult.actions[0]?.value || '?'}`);
          
          // 스택 추적 업데이트
          const updatedStack = await client.debuggerStackTrace();
          
          if (updatedStack.stack.length > 0) {
            const topFrame = updatedStack.stack[0];
            console.log(`- 프로그램: ${topFrame.programName}`);
            console.log(`- 라인: ${topFrame.line}`);
            
            // 관찰 변수 업데이트
            if (watchIds.length > 0) {
              const updatedVars = await client.debuggerVariables(watchIds);
              
              updatedVars.forEach(v => {
                console.log(`- ${v.NAME}: ${v.VALUE}`);
              });
              
              // 로그에 단계 기록
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
          
          // 디버깅 계속 여부 결정
          stepCount++;
          
          // 최대 단계 수에 도달하거나 특정 조건 만족 시 중단
          if (stepCount >= config.maxSteps) {
            console.log('\n최대 단계 수에 도달했습니다.');
            continueDebugging = false;
          }
          
          // 여기에 특정 상태에 따른 중단 조건 추가 가능
          
        } catch (error) {
          console.error(`단계 실행 중 오류 발생:`, error);
          continueDebugging = false;
        }
      }
      
      // 10. 디버깅 세션 종료
      console.log('\n디버깅 세션 종료 중...');
      
      try {
        await client.debuggerStep('terminateDebuggee');
        console.log('디버깅 세션 종료됨');
      } catch (error) {
        console.error('디버깅 세션 종료 중 오류 발생:', error);
      }
      
      // 11. 디버깅 로그 저장
      if (config.recordTrace) {
        const logFile = `./debug-log-${new Date().toISOString().replace(/:/g, '-')}.json`;
        fs.writeFileSync(logFile, JSON.stringify(debugLog, null, 2));
        console.log(`\n디버깅 로그가 ${logFile}에 저장되었습니다.`);
      }
      
    } catch (error) {
      console.error('디버깅 세션 중 오류 발생:', error);
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    // 디버거 종료 시도
    try {
      await client.debuggerDeleteListener(
        'user',
        config.terminalId,
        config.ideId,
        client.username
      );
    } catch { /* 무시 */ }
    
    await client.logout();
    console.log('\n로그아웃 완료');
  }
}

automatedDebugger().catch(console.error);
```

### 확장 방법

- 조건부 중단점 및 감시식 고도화
- 특정 패턴의 데이터 흐름 자동 추적
- 메모리 누수 및 성능 병목 자동 감지