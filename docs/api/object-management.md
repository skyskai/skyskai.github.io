# 객체 관리

이 페이지에서는 ABAP ADT API를 사용하여 ABAP 객체를 탐색하고 관리하는 방법을 설명합니다.

## 객체 탐색

### 노드 내용 조회

```typescript
async nodeContents(
  parent_type: NodeParents,
  parent_name?: string,
  user_name?: string,
  parent_tech_name?: string,
  rebuild_tree?: boolean,
  parentnodes?: number[]
): Promise<NodeStructure>
```

ABAP Repository의 노드 구조를 조회합니다. 패키지, 프로그램, 펑션션 그룹 등의 내용을 탐색할 수 있습니다.

**매개변수:**
- `parent_type`: 부모 노드 유형 ('DEVC/K' (패키지), 'PROG/P' (프로그램), 'FUGR/F' (펑션 그룹), 'PROG/PI' (Include 프로그램))
- `parent_name`: 부모 노드 이름 (선택사항)
- `user_name`: 사용자 이름 (선택사항)
- `parent_tech_name`: 부모 노드 기술 이름 (선택사항)
- `rebuild_tree`: 트리 재구성 여부 (선택사항)
- `parentnodes`: 부모 노드 ID 배열 (선택사항)

**반환 값:**
- `NodeStructure`: 노드 구조 정보

**예제:**
```typescript
// 패키지 내용 조회
const packageContents = await client.nodeContents('DEVC/K', 'ZEXAMPLE_PKG');

// 노드 출력
packageContents.nodes.forEach(node => {
  console.log(`${node.OBJECT_TYPE}: ${node.OBJECT_NAME}`);
});

// 펑션 그룹 내용 조회
const functionGroupContents = await client.nodeContents('FUGR/F', 'ZEXAMPLE_FUGR');
```

### 객체 검색

```typescript
async searchObject(
  query: string,
  objType?: string,
  max: number = 100
): Promise<SearchResult[]>
```

패턴으로 ABAP 객체를 검색합니다.

**매개변수:**
- `query`: 검색 쿼리 (대소문자 구분 가능, 와일드카드 추가되지 않음)
- `objType`: 객체 유형 필터 (선택적)
- `max`: 최대 결과 수 (기본값: 100)

**반환 값:**
- `SearchResult[]`: 검색 결과 배열

**예제:**
```typescript
// 클래스 검색
const classes = await client.searchObject('ZCL_', 'CLAS');

// 모든 객체 유형 검색
const allObjects = await client.searchObject('ZEXAMPLE');

// 패키지 검색
const packages = await client.searchObject('Z*', 'DEVC');
```

### 객체 경로 찾기

```typescript
async findObjectPath(objectUrl: string): Promise<PathStep[]>
```

객체의 계층 구조 경로를 찾습니다.

**매개변수:**
- `objectUrl`: 객체 URL

**반환 값:**
- `PathStep[]`: 경로 단계 배열

**예제:**
```typescript
const path = await client.findObjectPath('/sap/bc/adt/programs/programs/ZEXAMPLE');

// 경로 출력
path.forEach(step => {
  console.log(`${step['adtcore:type']}: ${step['adtcore:name']}`);
});
```

## 객체 구조 조회

### 객체 구조 조회

```typescript
async objectStructure(
  objectUrl: string,
  version?: ObjectVersion
): Promise<AbapObjectStructure>
```

ABAP 객체의 구조를 조회합니다.

**매개변수:**
- `objectUrl`: 객체 URL
- `version`: 객체 버전 ('active', 'inactive', 'workingArea' 중 하나, 선택적)

**반환 값:**
- `AbapObjectStructure`: 객체 구조 정보

**예제:**
```typescript
// 프로그램 구조 조회
const programStructure = await client.objectStructure('/sap/bc/adt/programs/programs/ZEXAMPLE');

// 클래스 구조 조회
const classStructure = await client.objectStructure('/sap/bc/adt/oo/classes/ZCL_EXAMPLE');

// 비활성 버전 조회
const inactiveStructure = await client.objectStructure('/sap/bc/adt/programs/programs/ZEXAMPLE', 'inactive');
```

### 메인 Include 조회

```typescript
static mainInclude(
  object: AbapObjectStructure,
  withDefault: boolean = true
): string
```

객체의 메인 Include URL을 가져옵니다.

**매개변수:**
- `object`: 객체 구조
- `withDefault`: 기본값 포함 여부 (기본값: true)

**반환 값:**
- 메인 Include URL

**예제:**
```typescript
const objectStructure = await client.objectStructure('/sap/bc/adt/oo/classes/ZCL_EXAMPLE');
const mainIncludeUrl = ADTClient.mainInclude(objectStructure);
```

### 클래스 Include 조회

```typescript
static classIncludes(clas: AbapClassStructure): Map<classIncludes, string>
```

클래스의 모든 Include URL을 가져옵니다.

**매개변수:**
- `clas`: 클래스 구조

**반환 값:**
- Include 유형과 URL의 맵

**예제:**
```typescript
const classStructure = await client.objectStructure('/sap/bc/adt/oo/classes/ZCL_EXAMPLE');
if (client.isClassStructure(classStructure)) {
  const includes = ADTClient.classIncludes(classStructure);
  
  // 메인 Include URL
  console.log('메인:', includes.get('main'));
  
  // Definition Include URL
  console.log('정의:', includes.get('definitions'));
  
  // Implementation Include URL
  console.log('구현:', includes.get('implementations'));
  
  // 테스트 클래스 Include URL (있는 경우)
  console.log('테스트 클래스:', includes.get('testclasses'));
}
```

## 소스 코드 관리

### 소스 코드 조회

```typescript
async getObjectSource(
  objectSourceUrl: string,
  options?: ObjectSourceOptions
): Promise<string>
```

객체의 소스 코드를 조회합니다.

**매개변수:**
- `objectSourceUrl`: 소스 코드 URL
- `options`: 조회 옵션 (선택적)
  - `version`: 객체 버전 ('active', 'inactive', 'workingArea' 중 하나)
  - `gitUser`: Git 사용자 이름 (ABAP Git 객체만 해당)
  - `gitPassword`: Git 비밀번호 (ABAP Git 객체만 해당)

**반환 값:**
- 소스 코드 텍스트

**예제:**
```typescript
// 객체 구조 조회
const objectStructure = await client.objectStructure('/sap/bc/adt/programs/programs/ZEXAMPLE');

// 메인 포함 URL 얻기
const sourceUrl = ADTClient.mainInclude(objectStructure);

// 소스 코드 조회
const source = await client.getObjectSource(sourceUrl);
console.log(source);

// 비활성 버전 조회
const inactiveSource = await client.getObjectSource(sourceUrl, { version: 'inactive' });
```

### 소스 코드 수정

```typescript
async setObjectSource(
  objectSourceUrl: string,
  source: string,
  lockHandle: string,
  transport?: string
): Promise<void>
```

객체의 소스 코드를 수정합니다.

**매개변수:**
- `objectSourceUrl`: 소스 코드 URL
- `source`: 새 소스 코드
- `lockHandle`: 잠금 핸들 (객체 잠금으로 얻음)
- `transport`: 트랜스포트 번호 (선택적)

**예제:**
```typescript
// 객체 구조 조회
const objectStructure = await client.objectStructure('/sap/bc/adt/programs/programs/ZEXAMPLE');
const sourceUrl = ADTClient.mainInclude(objectStructure);

// 현재 소스 조회
const currentSource = await client.getObjectSource(sourceUrl);

// 객체 잠금
const lock = await client.lock(objectStructure.objectUrl);

// 소스 코드 수정
const newSource = currentSource + '\n* 주석 추가됨';
await client.setObjectSource(sourceUrl, newSource, lock.LOCK_HANDLE);

// 객체 잠금 해제
await client.unLock(objectStructure.objectUrl, lock.LOCK_HANDLE);
```

## 객체 잠금 관리

### 객체 잠금

```typescript
async lock(
  objectUrl: string,
  accessMode: string = "MODIFY"
): Promise<AdtLock>
```

객체를 잠급니다.

**매개변수:**
- `objectUrl`: 객체 URL
- `accessMode`: 접근 모드 (기본값: "MODIFY")

**반환 값:**
- `AdtLock`: 잠금 정보

**예제:**
```typescript
// 객체 잠금
const lock = await client.lock('/sap/bc/adt/programs/programs/ZEXAMPLE');
console.log('잠금 핸들:', lock.LOCK_HANDLE);
```

### 객체 잠금 해제

```typescript
async unLock(
  objectUrl: string,
  lockHandle: string
): Promise<void>
```

객체 잠금을 해제합니다.

**매개변수:**
- `objectUrl`: 객체 URL
- `lockHandle`: 잠금 핸들

**예제:**
```typescript
// 객체 잠금 해제
await client.unLock('/sap/bc/adt/programs/programs/ZEXAMPLE', lockHandle);
```

## 객체 활성화

### 객체 활성화

```typescript
async activate(
  object: InactiveObject | InactiveObject[],
  preauditRequested?: boolean
): Promise<ActivationResult>

async activate(
  objectName: string,
  objectUrl: string,
  mainInclude?: string,
  preauditRequested?: boolean
): Promise<ActivationResult>
```

객체를 활성화합니다.

**매개변수:**
- `object` / `objectName`: 활성화할 객체 또는 객체 이름
- `objectUrl`: 객체 URL
- `mainInclude`: 메인 포함 (선택적)
- `preauditRequested`: 사전 감사 요청 여부 (선택적)

**반환 값:**
- `ActivationResult`: 활성화 결과

**예제:**
```typescript
// 객체 이름과 URL로 활성화
const result = await client.activate('ZEXAMPLE', '/sap/bc/adt/programs/programs/ZEXAMPLE');

if (result.success) {
  console.log('활성화 성공');
} else {
  console.log('활성화 실패:', result.messages);
  
  // 비활성 객체 목록
  console.log('비활성 객체:', result.inactive);
}
```

### 비활성 객체 조회

```typescript
async inactiveObjects(): Promise<InactiveObjectRecord[]>
```

시스템의 모든 비활성 객체를 조회합니다.

**반환 값:**
- `InactiveObjectRecord[]`: 비활성 객체 목록

**예제:**
```typescript
const inactive = await client.inactiveObjects();
console.log(`비활성 객체 수: ${inactive.length}`);

// 비활성 객체 정보 출력
inactive.forEach(record => {
  if (record.object) {
    console.log(`${record.object["adtcore:type"]}: ${record.object["adtcore:name"]}`);
  }
});
```

## 객체 생성 및 삭제

### 객체 생성

```typescript
async createObject(
  objtype: CreatableTypeIds,
  name: string,
  parentName: string,
  description: string,
  parentPath: string,
  responsible?: string,
  transport?: string
): Promise<void>

async createObject(options: NewObjectOptions): Promise<void>
```

새 ABAP 객체를 생성합니다.

**매개변수 (첫 번째 형식):**
- `objtype`: 객체 유형 (PROG/P, CLAS/OC 등)
- `name`: 객체 이름
- `parentName`: 부모 이름 (패키지 등)
- `description`: 객체 설명
- `parentPath`: 부모 경로
- `responsible`: 담당자 (선택적)
- `transport`: 트랜스포트 번호 (선택적)

**매개변수 (두 번째 형식):**
- `options`: 객체 생성 옵션

**예제:**
```typescript
// 새 프로그램 생성
await client.createObject(
  'PROG/P',              // 객체 유형: 프로그램
  'ZEXAMPLE_PROGRAM',    // 이름
  'ZEXAMPLE_PKG',        // 패키지
  '예제 프로그램',         // 설명
  '/sap/bc/adt/packages/ZEXAMPLE_PKG', // 패키지 경로
  'DEVELOPER',           // 담당자
  'DEVK900000'           // 트랜스포트
);

// 테스트 포함 생성
await client.createTestInclude(
  'ZCL_EXAMPLE_CLASS',   // 클래스 이름
  lockHandle,            // 잠금 핸들
  'DEVK900000'           // 트랜스포트
);
```

### 객체 삭제

```typescript
async deleteObject(
  objectUrl: string,
  lockHandle: string,
  transport?: string
): Promise<void>
```

객체를 삭제합니다.

**매개변수:**
- `objectUrl`: 객체 URL
- `lockHandle`: 잠금 핸들
- `transport`: 트랜스포트 번호 (선택적)

**예제:**
```typescript
// 객체 잠금
const lock = await client.lock('/sap/bc/adt/programs/programs/ZEXAMPLE');

// 객체 삭제
await client.deleteObject('/sap/bc/adt/programs/programs/ZEXAMPLE', lock.LOCK_HANDLE, 'DEVK900000');
```

## 예제: 객체 관리 워크플로우

다음 예제는 객체 관리의 일반적인 워크플로우를 보여줍니다:

```typescript
import { ADTClient } from 'abap-adt-api';

async function objectManagementWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // 상태 유지 세션으로 설정 (필수)
    client.stateful = "stateful";
    
    // 1. 패키지 내용 조회
    const packageContents = await client.nodeContents('DEVC/K', 'ZEXAMPLE_PKG');
    console.log(`패키지 내 객체 수: ${packageContents.nodes.length}`);
    
    // 2. 프로그램 구조 조회
    const programUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE';
    const programStructure = await client.objectStructure(programUrl);
    
    // 3. 소스 코드 URL 가져오기
    const sourceUrl = ADTClient.mainInclude(programStructure);
    
    // 4. 현재 소스 코드 조회
    const currentSource = await client.getObjectSource(sourceUrl);
    console.log('현재 소스 코드 길이:', currentSource.length);
    
    // 5. 객체 잠금
    const lock = await client.lock(programUrl);
    console.log('잠금 핸들:', lock.LOCK_HANDLE);
    
    // 6. 소스 코드 수정
    const newSource = currentSource + '\n* 수정됨: ' + new Date().toISOString();
    await client.setObjectSource(sourceUrl, newSource, lock.LOCK_HANDLE);
    console.log('소스 코드 수정됨');
    
    // 7. 활성화
    const activationResult = await client.activate(
      programStructure.metaData['adtcore:name'],
      programUrl
    );
    
    if (activationResult.success) {
      console.log('활성화 성공');
    } else {
      console.log('활성화 실패:', activationResult.messages);
    }
    
    // 8. 객체 잠금 해제
    await client.unLock(programUrl, lock.LOCK_HANDLE);
    console.log('잠금 해제됨');
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
  }
}

objectManagementWorkflow();
```

## 참고 사항

- 객체를 수정하거나 삭제하려면 항상 상태 유지 세션(`client.stateful = "stateful"`)이 필요합니다.
- 객체를 수정하기 전에 항상 잠금을 획득하고, 작업 후에는 잠금을 해제해야 합니다.
- 활성화에 실패하면 비활성 객체 목록을 확인하고 필요한 경우 수정하세요.
- 패키지에 종속된 객체를 관리할 때는 트랜스포트가 필요합니다.