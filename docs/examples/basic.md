# 기본 예제

이 페이지에서는 ABAP ADT API 라이브러리의 기본 기능을 보여주는 예제를 제공합니다.

## 목차

- [시스템 연결 및 기본 정보 조회](#시스템-연결-및-기본-정보-조회)
- [객체 구조 탐색](#객체-구조-탐색)
- [소스 코드 조회 및 수정](#소스-코드-조회-및-수정)
- [구문 검사 및 활성화](#구문-검사-및-활성화)
- [코드 완성 활용](#코드-완성-활용)
- [객체 생성](#객체-생성)

## 시스템 연결 및 기본 정보 조회

### 목적

SAP 시스템에 연결하고 기본 시스템 정보를 조회하는 방법을 보여줍니다.

### 코드

```typescript
// connect-and-info.ts
import { ADTClient } from 'abap-adt-api';

async function connectAndGetInfo() {
  // 클라이언트 생성
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password',
    '001',  // 클라이언트 (선택적)
    'KO'    // 언어 (선택적)
  );
  
  try {
    // 로그인
    console.log('로그인 중...');
    const loggedIn = await client.login();
    
    if (!loggedIn) {
      console.error('로그인 실패');
      return;
    }
    
    console.log('로그인 성공');
    console.log(`사용자: ${client.username}`);
    console.log(`기본 URL: ${client.baseUrl}`);
    console.log(`세션 ID: ${client.sessionID}`);
    
    // 시스템 정보 조회
    console.log('\n시스템 정보 조회 중...');
    
    // 1. ADT 디스커버리 서비스 조회
    const discovery = await client.adtDiscovery();
    console.log(`발견된 워크스페이스 수: ${discovery.length}`);
    
    discovery.forEach((workspace, index) => {
      console.log(`\n워크스페이스 #${index + 1}: ${workspace.title}`);
      console.log('컬렉션:');
      
      workspace.collection.forEach(collection => {
        console.log(`- ${collection.href}`);
        
        // 템플릿 링크 출력
        if (collection.templateLinks && collection.templateLinks.length > 0) {
          console.log('  템플릿 링크:');
          collection.templateLinks.forEach(link => {
            console.log(`  - ${link.rel}: ${link.template}`);
          });
        }
      });
    });
    
    // 2. 객체 유형 조회
    console.log('\n객체 유형 조회 중...');
    const types = await client.objectTypes();
    
    console.log(`발견된 객체 유형 수: ${types.length}`);
    console.log('주요 객체 유형:');
    
    types.slice(0, 10).forEach(type => {
      console.log(`- ${type.name}: ${type.description} (${type.type})`);
    });
    
    // 3. 시스템 사용자 조회
    console.log('\n시스템 사용자 조회 중...');
    const users = await client.systemUsers();
    
    console.log(`발견된 사용자 수: ${users.length}`);
    console.log('사용자 샘플:');
    
    users.slice(0, 5).forEach(user => {
      console.log(`- ${user.id}: ${user.title}`);
    });
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    // 로그아웃
    await client.logout();
    console.log('\n로그아웃 완료');
  }
}

connectAndGetInfo().catch(console.error);
```

### 실행 결과

```
로그인 중...
로그인 성공
사용자: username
기본 URL: https://your-sap-server.com
세션 ID: SAP_SESSIONID_001_A1B2C3D4E5

시스템 정보 조회 중...
발견된 워크스페이스 수: 3

워크스페이스 #1: ABAP
컬렉션:
- /sap/bc/adt/repository/nodestructure
  템플릿 링크:
  - http://www.sap.com/adt/relations/packagestructure: /sap/bc/adt/repository/nodestructure?parent_name={package_name}&parent_type=DEVC/K
...

객체 유형 조회 중...
발견된 객체 유형 수: 287
주요 객체 유형:
- PROG/P: ABAP 프로그램 (PROG)
- CLAS/OC: ABAP 클래스 (CLAS)
...

시스템 사용자 조회 중...
발견된 사용자 수: 124
사용자 샘플:
- DEVELOPER: 개발자
...

로그아웃 완료
```

### 확장 방법

- 다른 시스템 정보 API를 탐색하여 더 많은 정보 수집
- 정기적으로 실행하여 시스템 상태 모니터링
- 사용자 권한 및 역할 분석 추가

## 객체 구조 탐색

### 목적

ABAP 객체 구조를 탐색하고 패키지, 프로그램, 클래스 등의 내용을 조회하는 방법을 보여줍니다.

### 코드

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
    
    // 1. 패키지 내용 조회
    console.log('패키지 내용 조회 중...');
    const packageName = 'ZEXAMPLE_PKG';
    const packageContents = await client.nodeContents('DEVC/K', packageName);
    
    console.log(`패키지 '${packageName}'의 객체 수: ${packageContents.nodes.length}`);
    console.log('객체 유형 별 카운트:');
    
    // 객체 유형 별로 그룹화
    const typeGroups = packageContents.nodes.reduce((groups, node) => {
      const type = node.OBJECT_TYPE;
      groups[type] = (groups[type] || 0) + 1;
      return groups;
    }, {});
    
    Object.entries(typeGroups).forEach(([type, count]) => {
      console.log(`- ${type}: ${count}`);
    });
    
    // 2. 특정 프로그램 구조 조회
    console.log('\n프로그램 구조 조회 중...');
    const programName = 'ZEXAMPLE_PROGRAM';
    const programUrl = `/sap/bc/adt/programs/programs/${programName}`;
    
    const programStructure = await client.objectStructure(programUrl);
    
    console.log(`프로그램: ${programStructure.metaData['adtcore:name']}`);
    console.log(`설명: ${programStructure.metaData['adtcore:description']}`);
    console.log(`유형: ${programStructure.metaData['adtcore:type']}`);
    console.log(`언어: ${programStructure.metaData['adtcore:language']}`);
    console.log(`담당자: ${programStructure.metaData['adtcore:responsible']}`);
    
    // 프로그램 링크 출력
    console.log('링크:');
    programStructure.links.forEach(link => {
      console.log(`- ${link.rel}: ${link.href}`);
    });
    
    // 3. 클래스 구조 조회
    console.log('\n클래스 구조 조회 중...');
    const className = 'ZCL_EXAMPLE_CLASS';
    const classUrl = `/sap/bc/adt/oo/classes/${className}`;
    
    const classStructure = await client.objectStructure(classUrl);
    
    // 클래스인지 확인
    if (client.isClassStructure(classStructure)) {
      console.log(`클래스: ${classStructure.metaData['adtcore:name']}`);
      console.log(`설명: ${classStructure.metaData['adtcore:description']}`);
      console.log(`추상: ${classStructure.metaData['class:abstract']}`);
      console.log(`최종: ${classStructure.metaData['class:final']}`);
      console.log(`가시성: ${classStructure.metaData['class:visibility']}`);
      
      // 클래스 포함 출력
      console.log('\n클래스 포함:');
      classStructure.includes.forEach(include => {
        console.log(`- ${include['class:includeType']}: ${include['adtcore:name']}`);
      });
      
      // 클래스 구성요소 조회
      console.log('\n클래스 구성요소 조회 중...');
      const components = await client.classComponents(classUrl);
      
      // 메서드, 속성 등 출력
      const methods = components.components.filter(c => c['adtcore:type'] === 'method');
      const attributes = components.components.filter(c => c['adtcore:type'] === 'attribute');
      
      console.log(`메서드 수: ${methods.length}`);
      console.log('메서드 샘플:');
      methods.slice(0, 5).forEach(method => {
        console.log(`- ${method['adtcore:name']} (가시성: ${method.visibility})`);
      });
      
      console.log(`\n속성 수: ${attributes.length}`);
      console.log('속성 샘플:');
      attributes.slice(0, 5).forEach(attr => {
        console.log(`- ${attr['adtcore:name']} (가시성: ${attr.visibility})`);
      });
    }
    
    // 4. 객체 경로 찾기
    console.log('\n객체 경로 찾기...');
    const objectPath = await client.findObjectPath(classUrl);
    
    console.log(`객체 '${className}'의 경로:`);
    objectPath.forEach((step, index) => {
      const indent = ' '.repeat(index * 2);
      console.log(`${indent}${index + 1}. ${step['adtcore:type']}: ${step['adtcore:name']}`);
    });
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
  }
}

exploreObjects().catch(console.error);
```

### 확장 방법

- 재귀적 패키지 탐색 추가
- 특정 유형의 객체만 필터링하여 탐색
- 객체 간 의존성 분석 구현

## 소스 코드 조회 및 수정

### 목적

ABAP 객체의 소스 코드를 조회하고 수정하는 방법을 보여줍니다.

### 코드

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
    
    // 상태 유지 세션으로 설정 (객체 잠금을 위해 필요)
    client.stateful = "stateful";
    
    // 1. 객체 구조 조회
    const objectUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE_PROGRAM';
    console.log(`객체 구조 조회 중: ${objectUrl}`);
    
    const objectStructure = await client.objectStructure(objectUrl);
    console.log(`객체 이름: ${objectStructure.metaData['adtcore:name']}`);
    
    // 2. 소스 코드 URL 조회
    const sourceUrl = ADTClient.mainInclude(objectStructure);
    console.log(`소스 코드 URL: ${sourceUrl}`);
    
    // 3. 소스 코드 조회
    console.log('소스 코드 조회 중...');
    const source = await client.getObjectSource(sourceUrl);
    
    console.log(`소스 코드 (처음 100자): ${source.substring(0, 100)}...`);
    
    // 소스 코드를 로컬 파일로 저장
    const localFilePath = './source_backup.abap';
    fs.writeFileSync(localFilePath, source);
    console.log(`소스 코드를 ${localFilePath}에 저장했습니다.`);
    
    // 4. 트랜스포트 정보 조회
    console.log('트랜스포트 정보 조회 중...');
    const transportInfo = await client.transportInfo(objectUrl);
    
    // 사용 가능한 트랜스포트 찾기
    let transportNumber = '';
    if (transportInfo.TRANSPORTS && transportInfo.TRANSPORTS.length > 0) {
      transportNumber = transportInfo.TRANSPORTS[0].TRKORR;
      console.log(`사용 가능한 트랜스포트: ${transportNumber} (${transportInfo.TRANSPORTS[0].AS4TEXT})`);
    } else {
      console.log('사용 가능한 트랜스포트가 없습니다. 필요한 경우 새 트랜스포트를 생성하세요.');
      
      // 새 트랜스포트 생성 (주석 처리됨 - 필요한 경우 주석 해제)
      /*
      transportNumber = await client.createTransport(
        objectUrl,
        '소스 코드 수정',
        objectStructure.metaData['adtcore:packageName'] || 'ZEXAMPLE_PKG'
      );
      console.log(`새 트랜스포트 생성됨: ${transportNumber}`);
      */
    }
    
    // 5. 객체 잠금
    console.log('객체 잠금 중...');
    const lock = await client.lock(objectUrl);
    console.log(`잠금 핸들: ${lock.LOCK_HANDLE}`);
    
    // 6. 소스 코드 수정
    console.log('소스 코드 수정 중...');
    
    // 예: 소스 끝에 주석 추가
    const timestamp = new Date().toISOString();
    const modifiedSource = source + `\n\n* Modified by ADT API at ${timestamp}\n`;
    
    // 7. 수정된 소스 코드 저장
    console.log('수정된 소스 코드 저장 중...');
    await client.setObjectSource(
      sourceUrl,
      modifiedSource,
      lock.LOCK_HANDLE,
      transportNumber // 트랜스포트 번호 (선택적)
    );
    
    console.log('소스 코드가 저장되었습니다.');
    
    // 8. 구문 검사
    console.log('구문 검사 중...');
    const syntaxCheckResults = await client.syntaxCheck(
      objectUrl,
      sourceUrl,
      modifiedSource
    );
    
    if (syntaxCheckResults.length === 0) {
      console.log('구문 오류가 없습니다.');
    } else {
      console.log(`구문 오류 발견: ${syntaxCheckResults.length}개`);
      syntaxCheckResults.forEach(result => {
        console.log(`- ${result.line}:${result.offset} - ${result.severity}: ${result.text}`);
      });
    }
    
    // 9. 활성화 (구문 오류가 없는 경우)
    if (syntaxCheckResults.length === 0) {
      console.log('객체 활성화 중...');
      const activationResult = await client.activate(
        objectStructure.metaData['adtcore:name'],
        objectUrl
      );
      
      if (activationResult.success) {
        console.log('객체가 성공적으로 활성화되었습니다.');
      } else {
        console.log('활성화 실패:');
        activationResult.messages.forEach(msg => {
          console.log(`- ${msg.type}: ${msg.shortText}`);
        });
      }
    }
    
    // 10. 객체 잠금 해제
    console.log('객체 잠금 해제 중...');
    await client.unLock(objectUrl, lock.LOCK_HANDLE);
    console.log('객체 잠금이 해제되었습니다.');
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    // 상태 유지 세션 종료 및 로그아웃
    await client.logout();
    console.log('로그아웃 완료');
  }
}

manageSourceCode().catch(console.error);
```

### 확장 방법

- 여러 객체의 소스 코드를 일괄 수정하는 기능 추가
- 소스 코드 백업 및 복원 메커니즘 구현
- Pretty Printer를 사용하여 코드 포맷팅 추가

## 구문 검사 및 활성화

### 목적

ABAP 객체의 구문을 검사하고 활성화하는 방법을 보여줍니다.

### 코드

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
    
    // 검사할 객체 URL
    const objectUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE_PROGRAM';
    
    // 1. 객체 구조 조회
    console.log(`객체 구조 조회 중: ${objectUrl}`);
    const objectStructure = await client.objectStructure(objectUrl);
    
    // 2. 소스 코드 URL 조회
    const sourceUrl = ADTClient.mainInclude(objectStructure);
    
    // 3. 소스 코드 조회
    console.log('소스 코드 조회 중...');
    const source = await client.getObjectSource(sourceUrl);
    console.log(`소스 코드 길이: ${source.length} 자`);
    
    // 4. 구문 검사
    console.log('구문 검사 중...');
    const syntaxResults = await client.syntaxCheck(
      objectUrl,
      sourceUrl,
      source
    );
    
    if (syntaxResults.length === 0) {
      console.log('구문 오류가 없습니다.');
    } else {
      console.log(`구문 오류 발견: ${syntaxResults.length}개`);
      
      // 오류 및 경고 그룹화
      const errors = syntaxResults.filter(result => result.severity === 'E' || result.severity === 'A');
      const warnings = syntaxResults.filter(result => result.severity === 'W');
      
      if (errors.length > 0) {
        console.log(`\n오류: ${errors.length}개`);
        errors.forEach(error => {
          console.log(`- 라인 ${error.line}, 열 ${error.offset}: ${error.text}`);
        });
      }
      
      if (warnings.length > 0) {
        console.log(`\n경고: ${warnings.length}개`);
        warnings.forEach(warning => {
          console.log(`- 라인 ${warning.line}, 열 ${warning.offset}: ${warning.text}`);
        });
      }
    }
    
    // 5. 비활성 객체 목록 조회
    console.log('\n비활성 객체 조회 중...');
    const inactiveObjects = await client.inactiveObjects();
    
    console.log(`비활성 객체 수: ${inactiveObjects.length}`);
    inactiveObjects.forEach(record => {
      if (record.object) {
        console.log(`- ${record.object["adtcore:type"]}: ${record.object["adtcore:name"]}`);
      }
    });
    
    // 6. 활성화 수행
    const objName = objectStructure.metaData['adtcore:name'];
    
    console.log(`\n'${objName}' 활성화 중...`);
    const activationResult = await client.activate(objName, objectUrl);
    
    if (activationResult.success) {
      console.log('활성화 성공');
    } else {
      console.log('활성화 실패:');
      
      // 메시지 출력
      if (activationResult.messages.length > 0) {
        console.log('활성화 메시지:');
        activationResult.messages.forEach(msg => {
          console.log(`- ${msg.type}: ${msg.shortText}`);
        });
      }
      
      // 여전히 비활성 상태인 객체 출력
      if (activationResult.inactive.length > 0) {
        console.log('비활성 상태인 객체:');
        activationResult.inactive.forEach(record => {
          if (record.object) {
            console.log(`- ${record.object["adtcore:type"]}: ${record.object["adtcore:name"]}`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
    console.log('로그아웃 완료');
  }
}

checkAndActivate().catch(console.error);
```

### 확장 방법

- 여러 객체를 순차적으로 활성화하는 배치 프로세스 구현
- 활성화 실패 시 자동 수정 로직 추가
- 활성화 전후 객체 상태 비교 기능 구현

## 코드 완성 활용

### 목적

ABAP 코드 편집 시 코드 완성 및 요소 정보를 활용하는 방법을 보여줍니다.

### 코드

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
    
    // 1. 객체 구조 조회
    const objectUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE_PROGRAM';
    console.log(`객체 구조 조회 중: ${objectUrl}`);
    const objectStructure = await client.objectStructure(objectUrl);
    
    // 2. 소스 코드 URL 조회
    const sourceUrl = ADTClient.mainInclude(objectStructure);
    
    // 3. 소스 코드 조회
    console.log('소스 코드 조회 중...');
    const source = await client.getObjectSource(sourceUrl);
    
    // 소스 코드 내에서 특정 위치 선택 (예: 10번 줄, 5번 열)
    const line = 10;
    const column = 5;
    
    // 4. 코드 완성 제안 가져오기
    console.log(`위치 (${line}, ${column})에서 코드 완성 제안 조회 중...`);
    const completions = await client.codeCompletion(
      sourceUrl,
      source,
      line,
      column
    );
    
    console.log(`완성 제안 수: ${completions.length}`);
    console.log('상위 10개 제안:');
    completions.slice(0, 10).forEach(completion => {
      console.log(`- ${completion.IDENTIFIER} (유형: ${completion.KIND})`);
    });
    
    // 5. 첫 번째 제안에 대한 상세 정보 조회
    if (completions.length > 0) {
      const firstCompletion = completions[0];
      console.log(`\n'${firstCompletion.IDENTIFIER}'에 대한 상세 정보 조회 중...`);
      
      const elementInfo = await client.codeCompletionElement(
        sourceUrl,
        source,
        line,
        column
      );
      
      if (typeof elementInfo !== 'string') {
        console.log('요소 정보:');
        console.log(`- 이름: ${elementInfo.name}`);
        console.log(`- 유형: ${elementInfo.type}`);
        console.log(`- 문서: ${elementInfo.doc}`);
        
        // 구성요소 출력
        if (elementInfo.components && elementInfo.components.length > 0) {
          console.log('\n구성요소:');
          elementInfo.components.forEach(component => {
            console.log(`- ${component['adtcore:type']}: ${component['adtcore:name']}`);
          });
        }
      } else {
        console.log(`요소 정보: ${elementInfo}`);
      }
    }
    
    // 6. 정의 찾기
    console.log('\n정의 찾기 중...');
    // 예를 들어 METHOD 키워드의 정의를 찾습니다
    const definitionLine = 15;  // 예시 라인 번호
    const startColumn = 2;     // 예시 시작 열
    const endColumn = 8;       // 예시 끝 열
    
    try {
      const definition = await client.findDefinition(
        sourceUrl,
        source,
        definitionLine,
        startColumn,
        endColumn,
        false  // 정의 찾기(구현 아님)
      );
      
      console.log('정의 위치:');
      console.log(`- URL: ${definition.url}`);
      console.log(`- 라인: ${definition.line}`);
      console.log(`- 열: ${definition.column}`);
    } catch (e) {
      console.log('정의를 찾을 수 없습니다.');
    }
    
    // 7. 사용처 찾기
    console.log('\n사용처 찾기 중...');
    try {
      const usages = await client.usageReferences(
        objectUrl,
        definitionLine,
        startColumn
      );
      
      console.log(`사용처 수: ${usages.length}`);
      
      if (usages.length > 0) {
        console.log('상위 5개 사용처:');
        usages.slice(0, 5).forEach(usage => {
          console.log(`- ${usage['adtcore:type']}: ${usage['adtcore:name']}`);
        });
        
        // 첫 번째 사용처에 대한 코드 조각 가져오기
        const snippets = await client.usageReferenceSnippets(usages.slice(0, 1));
        
        if (snippets.length > 0 && snippets[0].snippets.length > 0) {
          console.log('\n사용처 코드 조각:');
          snippets[0].snippets.forEach(snippet => {
            console.log(`- ${snippet.description}:`);
            console.log(`  ${snippet.content}`);
          });
        }
      }
    } catch (e) {
      console.log('사용처를 찾을 수 없습니다.');
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
    console.log('로그아웃 완료');
  }
}

useCodeCompletion().catch(console.error);
```

### 확장 방법

- 코드 자동 완성 기능이 있는 편집기 통합
- 자주 사용하는 코드 스니펫 관리 기능 추가
- 심볼 정보 캐싱 메커니즘 구현

## 객체 생성

### 목적

다양한 유형의 ABAP 객체를 생성하는 방법을 보여줍니다.

### 코드

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
    
    // 상태 유지 세션으로 설정
    client.stateful = "stateful";
    
    // 1. 트랜스포트 정보 조회 (객체 생성에 필요)
    const packageName = 'ZEXAMPLE_PKG';
    console.log(`패키지 '${packageName}'의 트랜스포트 정보 조회 중...`);
    
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
        '객체 생성 예제',
        packageName
      );
      
      console.log(`새 트랜스포트 생성됨: ${transportNumber}`);
    }
    
    // 2. 사용 가능한 객체 유형 로드
    console.log('\n사용 가능한 객체 유형 로드 중...');
    const objectTypes = await client.loadTypes();
    
    // 생성 가능한 유형 출력
    console.log('생성 가능한 주요 객체 유형:');
    const creatableTypes = objectTypes.filter(t => 
      t.CAPABILITIES.includes('create') && t.OBJNAME_MAXLENGTH > 0
    );
    
    creatableTypes.slice(0, 10).forEach(type => {
      console.log(`- ${type.OBJECT_TYPE}: ${type.OBJECT_TYPE_LABEL} (최대 길이: ${type.OBJNAME_MAXLENGTH})`);
    });
    
    // 3. 프로그램 생성
    const programName = 'ZEXAMPLE_NEW_PROG';
    console.log(`\n새 프로그램 '${programName}' 생성 중...`);
    
    // 객체 이름 유효성 검사
    try {
      const validationResult = await client.validateNewObject({
        objtype: 'PROG/P',
        objname: programName,
        description: '예제 프로그램',
        packagename: packageName
      });
      
      console.log(`유효성 검사 결과: ${validationResult.success ? '성공' : '실패'}`);
      if (!validationResult.success) {
        console.log(`오류: ${validationResult.SHORT_TEXT}`);
        return;
      }
    } catch (error) {
      console.error('유효성 검사 중 오류 발생:', error);
      return;
    }
    
    // 프로그램 생성
    try {
      await client.createObject({
        objtype: 'PROG/P',
        name: programName,
        description: '예제 프로그램',
        parentName: packageName,
        parentPath: `/sap/bc/adt/packages/${packageName}`,
        responsible: client.username,
        transport: transportNumber
      });
      
      console.log(`프로그램 '${programName}'이 성공적으로 생성되었습니다.`);
    } catch (error) {
      console.error('프로그램 생성 중 오류 발생:', error);
      return;
    }
    
    // 4. 생성된 프로그램 소스 코드 수정
    console.log('\n생성된 프로그램 소스 코드 수정 중...');
    const programUrl = `/sap/bc/adt/programs/programs/${programName}`;
    
    // 객체 구조 조회
    const objectStructure = await client.objectStructure(programUrl);
    const sourceUrl = ADTClient.mainInclude(objectStructure);
    
    // 현재 소스 코드 조회
    const currentSource = await client.getObjectSource(sourceUrl);
    console.log('현재 소스 코드:');
    console.log(currentSource);
    
    // 객체 잠금
    const lock = await client.lock(programUrl);
    
    // 소스 코드 수정
    const newSource = `REPORT ${programName}.
    
* 이 프로그램은 ABAP ADT API를 사용하여 생성되었습니다
* 생성 날짜: ${new Date().toISOString()}

PARAMETERS: p_input TYPE string.

START-OF-SELECTION.
  WRITE: / 'Hello, World!'.
  WRITE: / '입력값:', p_input.
`;
    
    // 소스 코드 저장
    await client.setObjectSource(sourceUrl, newSource, lock.LOCK_HANDLE, transportNumber);
    console.log('소스 코드가 수정되었습니다.');
    
    // 활성화
    const activationResult = await client.activate(programName, programUrl);
    
    if (activationResult.success) {
      console.log('프로그램이 성공적으로 활성화되었습니다.');
    } else {
      console.log('프로그램 활성화 실패:');
      activationResult.messages.forEach(msg => {
        console.log(`- ${msg.type}: ${msg.shortText}`);
      });
    }
    
    // 객체 잠금 해제
    await client.unLock(programUrl, lock.LOCK_HANDLE);
    
    // 5. 클래스 생성 (추가 예제)
    const className = 'ZCL_EXAMPLE_NEW_CLASS';
    console.log(`\n새 클래스 '${className}' 생성 중...`);
    
    try {
      // 클래스 유효성 검사
      await client.validateNewObject({
        objtype: 'CLAS/OC',
        objname: className,
        description: '예제 클래스',
        packagename: packageName
      });
      
      // 클래스 생성
      await client.createObject({
        objtype: 'CLAS/OC',
        name: className,
        description: '예제 클래스',
        parentName: packageName,
        parentPath: `/sap/bc/adt/packages/${packageName}`,
        responsible: client.username,
        transport: transportNumber
      });
      
      console.log(`클래스 '${className}'이 성공적으로 생성되었습니다.`);
      
      // 테스트 클래스 포함 생성
      console.log('테스트 클래스 포함 생성 중...');
      const classUrl = `/sap/bc/adt/oo/classes/${className}`;
      const classLock = await client.lock(classUrl);
      
      await client.createTestInclude(className, classLock.LOCK_HANDLE, transportNumber);
      console.log('테스트 클래스 포함이 성공적으로 생성되었습니다.');
      
      // 클래스 잠금 해제
      await client.unLock(classUrl, classLock.LOCK_HANDLE);
      
    } catch (error) {
      console.error('클래스 생성 중 오류 발생:', error);
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
    console.log('로그아웃 완료');
  }
}

createObjects().catch(console.error);
```

### 확장 방법

- 템플릿 기반 객체 생성 메커니즘 구현
- 객체 생성 마법사 UI 개발
- 여러 관련 객체를 함께 생성하는 기능 추가

## 기타 기본 예제

이 페이지에서는 ABAP ADT API 라이브러리의 가장 일반적인 사용 사례에 대한 기본 예제를 제공했습니다. 더 복잡한 시나리오와 고급 기능에 대한 예제는 [고급 예제](./advanced.md) 페이지를 참조하세요.

각 예제는 개별적으로 실행할 수 있으며, 자신의 필요에 맞게 수정할 수 있습니다. 또한 여러 예제의 기능을 결합하여 더 복잡한 작업을 수행하는 스크립트를 만들 수도 있습니다.

ABAP ADT API에 대한 자세한 내용은 [API 문서](/api/) 섹션을 참조하세요.