# 고급 기능

이 페이지에서는 ABAP ADT API의 고급 기능인 ATC(ABAP Test Cockpit), 런타임 추적 및 기타 고급 기능에 대해 설명합니다.

## ABAP Test Cockpit (ATC)

ABAP Test Cockpit(ATC)은 ABAP 코드의 품질을 분석하는 도구입니다. ABAP ADT API를 통해 ATC 검사를 실행하고 결과를 확인할 수 있습니다.

### ATC 커스터마이징 정보 조회

```typescript
async atcCustomizing(): Promise<AtcCustomizing>
```

ATC 커스터마이징 정보를 조회합니다.

**반환 값:**
- `AtcCustomizing`: ATC 커스터마이징 정보

**예제:**
```typescript
// ATC 커스터마이징 정보 조회
const customizing = await client.atcCustomizing();

console.log('ATC 속성:');
customizing.properties.forEach(prop => {
  console.log(`- ${prop.name}: ${prop.value}`);
});

console.log('ATC 제외 사유:');
customizing.excemptions.forEach(ex => {
  console.log(`- ${ex.id}: ${ex.title} (정당화 필수: ${ex.justificationMandatory})`);
});
```

### ATC 검사 변형 선택

```typescript
async atcCheckVariant(variant: string): Promise<string>
```

ATC 검사에 사용할 변형을 선택합니다.

**매개변수:**
- `variant`: 변형 이름

**반환 값:**
- `string`: 결과 메시지

**예제:**
```typescript
// ATC 검사 변형 선택
const result = await client.atcCheckVariant('DEFAULT');
console.log('ATC 검사 변형 선택 결과:', result);
```

### ATC 검사 실행

```typescript
async createAtcRun(
  variant: string,
  mainUrl: string,
  maxResults: number = 100
): Promise<AtcRunResult>
```

ATC 검사를 실행합니다.

**매개변수:**
- `variant`: 변형 이름
- `mainUrl`: 객체 URL
- `maxResults`: 최대 결과 수 (기본값: 100)

**반환 값:**
- `AtcRunResult`: ATC 실행 결과

**예제:**
```typescript
// ATC 검사 실행
const runResult = await client.createAtcRun(
  'DEFAULT',                             // 변형 이름
  '/sap/bc/adt/programs/programs/ZEXAMPLE', // 객체 URL
  100                                    // 최대 결과 수
);

console.log('ATC 검사 실행 결과:');
console.log(`- ID: ${runResult.id}`);
console.log(`- 타임스탬프: ${new Date(runResult.timestamp * 1000).toISOString()}`);
console.log(`- 정보 항목 수: ${runResult.infos.length}`);
```

### ATC 결과 조회

```typescript
async atcWorklists(
  runResultId: string,
  timestamp?: number,
  usedObjectSet?: string,
  includeExempted: boolean = false
): Promise<AtcWorkList>
```

ATC 검사 결과 목록을 조회합니다.

**매개변수:**
- `runResultId`: 실행 결과 ID
- `timestamp`: 타임스탬프 (선택적)
- `usedObjectSet`: 사용된 객체 세트 (선택적)
- `includeExempted`: 제외된 항목 포함 여부 (선택적, 기본값: false)

**반환 값:**
- `AtcWorkList`: ATC 작업 목록

**예제:**
```typescript
// ATC 검사 실행
const runResult = await client.createAtcRun(
  'DEFAULT',
  '/sap/bc/adt/programs/programs/ZEXAMPLE',
  100
);

// ATC 결과 조회
const worklist = await client.atcWorklists(
  runResult.id,            // 실행 결과 ID
  runResult.timestamp,     // 타임스탬프
  undefined,               // 객체 세트
  false                    // 제외된 항목 포함 여부
);

console.log('ATC 결과:');
console.log(`- 객체 수: ${worklist.objects.length}`);

// 객체별 결과 출력
worklist.objects.forEach(obj => {
  console.log(`객체: ${obj.name} (${obj.type})`);
  console.log(`- 발견 항목 수: ${obj.findings.length}`);
  
  // 발견 항목 출력
  obj.findings.forEach(finding => {
    console.log(`  - ${finding.checkTitle} (${finding.messageTitle})`);
    console.log(`    위치: ${finding.location.uri}, 라인 ${finding.location.range.start.line}`);
    console.log(`    우선순위: ${finding.priority}`);
  });
});
```

### ATC 사용자 조회

```typescript
async atcUsers(): Promise<AtcUser[]>
```

ATC 사용자 목록을 조회합니다.

**반환 값:**
- `AtcUser[]`: ATC 사용자 배열

**예제:**
```typescript
// ATC 사용자 조회
const users = await client.atcUsers();

console.log('ATC 사용자:');
users.forEach(user => {
  console.log(`- ${user.id}: ${user.title}`);
});
```

### ATC 예외 제안

```typescript
async atcExemptProposal(
  markerId: string
): Promise<AtcProposal | AtcProposalMessage>
```

ATC 예외 제안을 조회합니다.

**매개변수:**
- `markerId`: 마커 ID

**반환 값:**
- `AtcProposal | AtcProposalMessage`: ATC 예외 제안 또는 메시지

**예제:**
```typescript
// ATC 결과 조회
const worklist = await client.atcWorklists(runResultId);

// 첫 번째 발견 항목에 대한 예외 제안
if (worklist.objects.length > 0 && worklist.objects[0].findings.length > 0) {
  const finding = worklist.objects[0].findings[0];
  
  // 예외 제안 조회
  const proposal = await client.atcExemptProposal(finding.quickfixInfo);
  
  // 메시지인지 제안인지 확인
  if (client.isProposalMessage(proposal)) {
    console.log(`메시지: ${proposal.message} (${proposal.type})`);
  } else {
    console.log('예외 제안:');
    console.log(`- 패키지: ${proposal.package}`);
    console.log(`- 사유: ${proposal.reason}`);
    console.log(`- 정당화: ${proposal.justification}`);
  }
}
```

### ATC 예외 요청

```typescript
async atcRequestExemption(
  proposal: AtcProposal
): Promise<AtcProposalMessage>
```

ATC 예외를 요청합니다.

**매개변수:**
- `proposal`: ATC 예외 제안

**반환 값:**
- `AtcProposalMessage`: ATC 제안 메시지

**예제:**
```typescript
// ATC 결과 조회
const worklist = await client.atcWorklists(runResultId);

// 첫 번째 발견 항목에 대한 예외 제안
if (worklist.objects.length > 0 && worklist.objects[0].findings.length > 0) {
  const finding = worklist.objects[0].findings[0];
  
  // 예외 제안 조회
  const proposal = await client.atcExemptProposal(finding.quickfixInfo);
  
  // 예외 제안인 경우 처리
  if (!client.isProposalMessage(proposal)) {
    // 제안 수정
    proposal.reason = 'FPOS';  // False Positive
    proposal.justification = '이 경우에는 검사 규칙이 적용되지 않습니다.';
    proposal.notify = 'never'; // 알림 없음
    
    // 예외 요청
    const result = await client.atcRequestExemption(proposal);
    console.log(`예외 요청 결과: ${result.message} (${result.type})`);
  }
}
```

### ATC 담당자 변경

```typescript
async atcContactUri(
  findingUri: string
): Promise<string>
```

ATC 발견 항목의 담당자 URI를 조회합니다.

**매개변수:**
- `findingUri`: 발견 항목 URI

**반환 값:**
- `string`: 담당자 URI

```typescript
async atcChangeContact(
  itemUri: string,
  userId: string
): Promise<void>
```

ATC 항목의 담당자를 변경합니다.

**매개변수:**
- `itemUri`: 항목 URI
- `userId`: 사용자 ID

**예제:**
```typescript
// ATC 결과 조회
const worklist = await client.atcWorklists(runResultId);

// 첫 번째 발견 항목에 대한 담당자 변경
if (worklist.objects.length > 0 && worklist.objects[0].findings.length > 0) {
  const finding = worklist.objects[0].findings[0];
  
  // 담당자 URI 조회
  const contactUri = await client.atcContactUri(finding.uri);
  
  // 담당자 변경
  await client.atcChangeContact(contactUri, 'DEVELOPER');
  console.log('담당자가 변경되었습니다.');
}
```

## 런타임 추적

ABAP 런타임 추적 기능을 사용하여 프로그램 실행을 분석할 수 있습니다.

### 추적 목록 조회

```typescript
async tracesList(user?: string): Promise<TraceResults>
```

사용자의 추적 목록을 조회합니다.

**매개변수:**
- `user`: 사용자 ID (선택적, 기본값: 현재 사용자)

**반환 값:**
- `TraceResults`: 추적 결과

**예제:**
```typescript
// 추적 목록 조회
const traces = await client.tracesList();

console.log(`추적 수: ${traces.runs.length}`);
console.log(`작성자: ${traces.author}`);
console.log(`기여자: ${traces.contributor}`);

// 추적 정보 출력
traces.runs.forEach(run => {
  console.log(`추적 ID: ${run.id}`);
  console.log(`- 제목: ${run.title}`);
  console.log(`- 게시: ${run.published.toISOString()}`);
  console.log(`- 업데이트: ${run.updated.toISOString()}`);
  console.log(`- 객체 이름: ${run.extendedData.objectName}`);
  console.log(`- 상태: ${run.extendedData.state.text}`);
});
```

### 추적 요청 목록 조회

```typescript
async tracesListRequests(user?: string): Promise<TraceRequestList>
```

사용자의 추적 요청 목록을 조회합니다.

**매개변수:**
- `user`: 사용자 ID (선택적, 기본값: 현재 사용자)

**반환 값:**
- `TraceRequestList`: 추적 요청 목록

**예제:**
```typescript
// 추적 요청 목록 조회
const traceRequests = await client.tracesListRequests();

console.log(`추적 요청 수: ${traceRequests.requests.length}`);
console.log(`제목: ${traceRequests.title}`);
console.log(`기여자: ${traceRequests.contributorName}`);

// 요청 정보 출력
traceRequests.requests.forEach(request => {
  console.log(`요청 ID: ${request.id}`);
  console.log(`- 제목: ${request.title}`);
  console.log(`- 설명: ${request.extendedData.description}`);
  console.log(`- 프로세스 유형: ${request.extendedData.processType}`);
  console.log(`- 객체 유형: ${request.extendedData.objectType}`);
});
```

### 히트 목록 조회

```typescript
async tracesHitList(
  id: string,
  withSystemEvents: boolean = false
): Promise<TraceHitList>
```

추적의 히트 목록을 조회합니다.

**매개변수:**
- `id`: 추적 ID
- `withSystemEvents`: 시스템 이벤트 포함 여부 (선택적, 기본값: false)

**반환 값:**
- `TraceHitList`: 히트 목록

**예제:**
```typescript
// 추적 목록 조회
const traces = await client.tracesList();

// 첫 번째 추적의 히트 목록 조회
if (traces.runs.length > 0) {
  const hitList = await client.tracesHitList(traces.runs[0].id);
  
  console.log(`히트 항목 수: ${hitList.entries.length}`);
  console.log(`부모 링크: ${hitList.parentLink}`);
  
  // 히트 항목 출력
  hitList.entries.slice(0, 5).forEach((entry, index) => {
    console.log(`히트 항목 #${index + 1}:`);
    console.log(`- 설명: ${entry.description}`);
    console.log(`- 히트 횟수: ${entry.hitCount}`);
    console.log(`- 재귀 깊이: ${entry.recursionDepth}`);
    console.log(`- 총 시간: ${entry.grossTime.time}ms (${entry.grossTime.percentage}%)`);
  });
}
```

### 데이터베이스 접근 조회

```typescript
async tracesDbAccess(
  id: string,
  withSystemEvents: boolean = false
): Promise<TraceDBAccessResponse>
```

추적의 데이터베이스 접근 정보를 조회합니다.

**매개변수:**
- `id`: 추적 ID
- `withSystemEvents`: 시스템 이벤트 포함 여부 (선택적, 기본값: false)

**반환 값:**
- `TraceDBAccessResponse`: 데이터베이스 접근 정보

**예제:**
```typescript
// 추적 목록 조회
const traces = await client.tracesList();

// 첫 번째 추적의 데이터베이스 접근 조회
if (traces.runs.length > 0) {
  const dbAccess = await client.tracesDbAccess(traces.runs[0].id);
  
  console.log(`DB 접근 항목 수: ${dbAccess.dbaccesses.length}`);
  console.log(`테이블 수: ${dbAccess.tables.length}`);
  
  // 데이터베이스 접근 항목 출력
  dbAccess.dbaccesses.slice(0, 5).forEach((access, index) => {
    console.log(`DB 접근 항목 #${index + 1}:`);
    console.log(`- 테이블 이름: ${access.tableName}`);
    console.log(`- 구문: ${access.statement}`);
    console.log(`- 유형: ${access.type}`);
    console.log(`- 총 횟수: ${access.totalCount}`);
    console.log(`- 버퍼링된 횟수: ${access.bufferedCount}`);
    console.log(`- 총 시간: ${access.accessTime.total}ms`);
  });
  
  // 테이블 정보 출력
  dbAccess.tables.slice(0, 5).forEach((table, index) => {
    console.log(`테이블 #${index + 1}:`);
    console.log(`- 이름: ${table.name}`);
    console.log(`- 유형: ${table.type}`);
    console.log(`- 설명: ${table.description}`);
    console.log(`- 버퍼 모드: ${table.bufferMode}`);
    console.log(`- 패키지: ${table.package}`);
  });
}
```

### 구문 조회

```typescript
async tracesStatements(
  id: string,
  options: TraceStatementOptions = {}
): Promise<TraceStatementResponse>
```

추적의 구문 정보를 조회합니다.

**매개변수:**
- `id`: 추적 ID
- `options`: 구문 조회 옵션 (선택적)
  - `id`: 구문 ID
  - `withDetails`: 세부 정보 포함 여부
  - `autoDrillDownThreshold`: 자동 드릴다운 임계값
  - `withSystemEvents`: 시스템 이벤트 포함 여부

**반환 값:**
- `TraceStatementResponse`: 구문 정보

**예제:**
```typescript
// 추적 목록 조회
const traces = await client.tracesList();

// 첫 번째 추적의 구문 조회
if (traces.runs.length > 0) {
  const statements = await client.tracesStatements(
    traces.runs[0].id,
    {
      withDetails: true,
      withSystemEvents: false
    }
  );
  
  console.log(`구문 항목 수: ${statements.statements.length}`);
  console.log(`세부 정보 포함: ${statements.withDetails}`);
  console.log(`시스템 이벤트 포함: ${statements.withSysEvents}`);
  
  // 구문 항목 출력
  statements.statements.slice(0, 5).forEach((stmt, index) => {
    console.log(`구문 항목 #${index + 1}:`);
    console.log(`- ID: ${stmt.id}`);
    console.log(`- 설명: ${stmt.description}`);
    console.log(`- 히트 횟수: ${stmt.hitCount}`);
    console.log(`- 호출 레벨: ${stmt.callLevel}`);
    console.log(`- 총 시간: ${stmt.grossTime.time}ms (${stmt.grossTime.percentage}%)`);
    
    // 호출 프로그램 정보 출력
    if (stmt.callingProgram) {
      console.log(`- 호출 프로그램:`);
      console.log(`  - 컨텍스트: ${stmt.callingProgram.context}`);
      if (stmt.callingProgram.name) {
        console.log(`  - 이름: ${stmt.callingProgram.name}`);
        console.log(`  - 유형: ${stmt.callingProgram.type}`);
      }
    }
  });
}
```

### 추적 매개변수 설정

```typescript
async tracesSetParameters(
  parameters: TraceParameters
): Promise<string>
```

추적 매개변수를 설정합니다.

**매개변수:**
- `parameters`: 추적 매개변수

**반환 값:**
- `string`: 설정된 매개변수의 URI

**예제:**
```typescript
// 추적 매개변수 설정
const parametersUri = await client.tracesSetParameters({
  allMiscAbapStatements: true,     // 모든 기타 ABAP 구문
  allProceduralUnits: true,        // 모든 프로시저 단위
  allInternalTableEvents: false,   // 모든 내부 테이블 이벤트
  allDynproEvents: false,          // 모든 다이내믹 프로그램 이벤트
  description: '테스트 추적',        // 설명
  aggregate: true,                 // 집계
  explicitOnOff: false,            // 명시적 온/오프
  withRfcTracing: true,            // RFC 추적 포함
  allSystemKernelEvents: false,    // 모든 시스템 커널 이벤트
  sqlTrace: true,                  // SQL 추적
  allDbEvents: true,               // 모든 DB 이벤트
  maxSizeForTraceFile: 100,        // 최대 추적 파일 크기
  maxTimeForTracing: 600           // 최대 추적 시간(초)
});

console.log(`추적 매개변수 URI: ${parametersUri}`);
```

### 추적 구성 생성

```typescript
async tracesCreateConfiguration(
  config: TracesCreationConfig
): Promise<TraceRequestList>
```

추적 구성을 생성합니다.

**매개변수:**
- `config`: 추적 생성 구성

**반환 값:**
- `TraceRequestList`: 추적 요청 목록

**예제:**
```typescript
// 매개변수 설정
const parametersUri = await client.tracesSetParameters({
  /* 매개변수 설정... */
});

// 추적 구성 생성
const requestList = await client.tracesCreateConfiguration({
  server: '*',                     // 서버(모든 서버)
  description: 'URL 추적',          // 설명
  traceUser: client.username,      // 추적 사용자
  traceClient: '*',                // 추적 클라이언트
  processType: 'HTTP',             // 프로세스 유형
  objectType: 'URL',               // 객체 유형
  expires: new Date(Date.now() + 86400000), // 만료(1일 후)
  maximalExecutions: 10,           // 최대 실행 횟수
  parametersId: parametersUri      // 매개변수 ID
});

console.log('추적 구성이 생성되었습니다.');
console.log(`구성 요청 수: ${requestList.requests.length}`);
```

### 추적 구성 삭제

```typescript
async tracesDeleteConfiguration(id: string): Promise<void>
```

추적 구성을 삭제합니다.

**매개변수:**
- `id`: 구성 ID

**예제:**
```typescript
// 추적 요청 목록 조회
const traceRequests = await client.tracesListRequests();

// 첫 번째 요청 삭제
if (traceRequests.requests.length > 0) {
  await client.tracesDeleteConfiguration(traceRequests.requests[0].id);
  console.log('추적 구성이 삭제되었습니다.');
}
```

### 추적 삭제

```typescript
async tracesDelete(id: string): Promise<void>
```

추적을 삭제합니다.

**매개변수:**
- `id`: 추적 ID

**예제:**
```typescript
// 추적 목록 조회
const traces = await client.tracesList();

// 첫 번째 추적 삭제
if (traces.runs.length > 0) {
  await client.tracesDelete(traces.runs[0].id);
  console.log('추적이 삭제되었습니다.');
}
```

## 테이블 내용 관리

### 테이블 내용 조회

```typescript
async tableContents(
  ddicEntityName: string,
  rowNumber: number = 100,
  decode: boolean = true,
  sqlQuery: string = ""
): Promise<QueryResult>
```

ABAP 테이블의 내용을 조회합니다.

**매개변수:**
- `ddicEntityName`: 테이블 이름
- `rowNumber`: 행 수 (기본값: 100)
- `decode`: 값 디코딩 여부 (기본값: true)
- `sqlQuery`: SQL 쿼리 (선택적)

**반환 값:**
- `QueryResult`: 쿼리 결과

**예제:**
```typescript
// 테이블 내용 조회
const result = await client.tableContents('SFLIGHT', 10);

console.log(`컬럼 수: ${result.columns.length}`);
console.log(`행 수: ${result.values.length}`);

// 컬럼 정보 출력
console.log('컬럼:');
result.columns.forEach(column => {
  console.log(`- ${column.name} (${column.type}): ${column.description}`);
});

// 첫 번째 행 출력
if (result.values.length > 0) {
  console.log('첫 번째 행:');
  const row = result.values[0];
  Object.entries(row).forEach(([key, value]) => {
    console.log(`- ${key}: ${value}`);
  });
}
```

### SQL 쿼리 실행

```typescript
async runQuery(
  sqlQuery: string,
  rowNumber: number = 100,
  decode: boolean = true
): Promise<QueryResult>
```

SQL 쿼리를 실행합니다.

**매개변수:**
- `sqlQuery`: SQL 쿼리
- `rowNumber`: 행 수 (기본값: 100)
- `decode`: 값 디코딩 여부 (기본값: true)

**반환 값:**
- `QueryResult`: 쿼리 결과

**예제:**
```typescript
// SQL 쿼리 실행
const result = await client.runQuery(
  'SELECT * FROM SFLIGHT WHERE CARRID = \'LH\' AND CONNID = \'0400\'',
  10
);

console.log(`컬럼 수: ${result.columns.length}`);
console.log(`행 수: ${result.values.length}`);

// 결과 출력
result.values.forEach((row, index) => {
  console.log(`행 #${index + 1}:`);
  Object.entries(row).forEach(([key, value]) => {
    console.log(`- ${key}: ${value}`);
  });
});
```

## CDS 관련 기능

### CDS 주석 정의 조회

```typescript
async annotationDefinitions(): Promise<string>
```

CDS 주석 정의를 조회합니다.

**반환 값:**
- `string`: CDS 주석 정의

**예제:**
```typescript
// CDS 주석 정의 조회
const annotations = await client.annotationDefinitions();
console.log('CDS 주석 정의:', annotations);
```

### DDIC 요소 조회

```typescript
async ddicElement(
  path: string | string[],
  getTargetForAssociation: boolean = false,
  getExtensionViews: boolean = true,
  getSecondaryObjects: boolean = true
): Promise<DdicElement>
```

DDIC 요소를 조회합니다.

**매개변수:**
- `path`: 요소 경로(단일 또는 배열)
- `getTargetForAssociation`: 연관 대상 포함 여부 (기본값: false)
- `getExtensionViews`: 확장 뷰 포함 여부 (기본값: true)
- `getSecondaryObjects`: 보조 객체 포함 여부 (기본값: true)

**반환 값:**
- `DdicElement`: DDIC 요소 정보

**예제:**
```typescript
// CDS 뷰의 DDIC 요소 조회
const element = await client.ddicElement('ZCDS_VIEW_NAME');

console.log(`요소 이름: ${element.name}`);
console.log(`요소 유형: ${element.type}`);

// 속성 출력
if (element.properties.elementProps) {
  console.log('요소 속성:');
  console.log(`- 데이터 요소: ${element.properties.elementProps.ddicDataElement}`);
  console.log(`- 데이터 유형: ${element.properties.elementProps.ddicDataType}`);
  console.log(`- 길이: ${element.properties.elementProps.ddicLength}`);
}

// 주석 출력
console.log('주석:');
element.properties.annotations.forEach(anno => {
  console.log(`- ${anno.key}: ${anno.value}`);
});

// 자식 요소 출력
console.log(`자식 요소 수: ${element.children.length}`);
element.children.forEach((child, index) => {
  console.log(`자식 #${index + 1}: ${child.name} (${child.type})`);
});
```

### DDIC 저장소 접근

```typescript
async ddicRepositoryAccess(
  path: string | string[]
): Promise<DdicObjectReference[]>
```

DDIC 저장소 접근 정보를 조회합니다.

**매개변수:**
- `path`: 접근 경로(단일 또는 배열)

**반환 값:**
- `DdicObjectReference[]`: DDIC 객체 참조 배열

**예제:**
```typescript
// CDS 뷰의 DDIC 저장소 접근 정보 조회
const references = await client.ddicRepositoryAccess('ZCDS_VIEW_NAME');

console.log(`참조 수: ${references.length}`);
references.forEach((ref, index) => {
  console.log(`참조 #${index + 1}:`);
  console.log(`- URI: ${ref.uri}`);
  console.log(`- 이름: ${ref.name}`);
  console.log(`- 유형: ${ref.type}`);
  console.log(`- 경로: ${ref.path}`);
});
```

### 서비스 바인딩 작업

```typescript
async publishServiceBinding(
  name: string,
  version: string
): Promise<{ severity: string, shortText: string, longText: string }>
```

서비스 바인딩을 게시합니다.

**매개변수:**
- `name`: 서비스 이름
- `version`: 서비스 버전

**반환 값:**
- 게시 결과 객체

```typescript
async unpublishServiceBinding(
  name: string,
  version: string
): Promise<{ severity: string, shortText: string, longText: string }>
```

서비스 바인딩 게시를 취소합니다.

**매개변수:**
- `name`: 서비스 이름
- `version`: 서비스 버전

**반환 값:**
- 게시 취소 결과 객체

**예제:**
```typescript
// 서비스 바인딩 게시
const publishResult = await client.publishServiceBinding(
  'Z_SERVICE_BINDING',
  'ODATA\\V2'
);

console.log('서비스 바인딩 게시 결과:');
console.log(`- 심각도: ${publishResult.severity}`);
console.log(`- 제목: ${publishResult.shortText}`);
console.log(`- 내용: ${publishResult.longText}`);

// 서비스 바인딩 게시 취소
const unpublishResult = await client.unpublishServiceBinding(
  'Z_SERVICE_BINDING',
  'ODATA\\V2'
);

console.log('서비스 바인딩 게시 취소 결과:');
console.log(`- 심각도: ${unpublishResult.severity}`);
console.log(`- 제목: ${unpublishResult.shortText}`);
console.log(`- 내용: ${unpublishResult.longText}`);
```

## 전체 워크플로우 예제

### ATC 분석 및 보고서 생성

다음 예제는 ABAP 객체에 대한 ATC 검사를 실행하고 결과를 분석하여 보고서를 생성하는 방법을 보여줍니다:

```typescript
import { ADTClient } from 'abap-adt-api';

// ATC 보고서 생성 함수
async function generateAtcReport(client: ADTClient, objectUrl: string): Promise<string> {
  // 1. ATC 커스터마이징 정보 조회
  const customizing = await client.atcCustomizing();
  
  // 2. ATC 검사 변형 선택 (기본값 사용)
  await client.atcCheckVariant('DEFAULT');
  
  // 3. ATC 검사 실행
  console.log(`${objectUrl}에 대한 ATC 검사 실행 중...`);
  const runResult = await client.createAtcRun('DEFAULT', objectUrl, 1000);
  
  // 4. ATC 결과 조회
  const worklist = await client.atcWorklists(
    runResult.id,
    runResult.timestamp,
    undefined,
    false
  );
  
  // 5. 보고서 생성
  let report = '# ABAP Test Cockpit (ATC) 분석 보고서\n\n';
  
  // 실행 정보
  report += '## 실행 정보\n\n';
  report += `- **객체:** ${objectUrl}\n`;
  report += `- **실행 ID:** ${runResult.id}\n`;
  report += `- **실행 시간:** ${new Date(runResult.timestamp * 1000).toISOString()}\n`;
  report += `- **객체 세트:** ${worklist.usedObjectSet}\n`;
  report += `- **완전한 객체 세트:** ${worklist.objectSetIsComplete ? '예' : '아니오'}\n\n`;
  
  // 발견 항목 요약
  let totalObjects = worklist.objects.length;
  let totalFindings = 0;
  let findingsByPriority = {
    1: 0, // 매우 높음
    2: 0, // 높음
    3: 0, // 중간
    4: 0  // 낮음
  };
  
  worklist.objects.forEach(obj => {
    totalFindings += obj.findings.length;
    obj.findings.forEach(finding => {
      findingsByPriority[finding.priority] = (findingsByPriority[finding.priority] || 0) + 1;
    });
  });
  
  report += '## 요약\n\n';
  report += `- **검사된 객체 수:** ${totalObjects}\n`;
  report += `- **총 발견 항목 수:** ${totalFindings}\n`;
  report += `- **우선순위별 발견 항목:**\n`;
  report += `  - 매우 높음 (1): ${findingsByPriority[1] || 0}\n`;
  report += `  - 높음 (2): ${findingsByPriority[2] || 0}\n`;
  report += `  - 중간 (3): ${findingsByPriority[3] || 0}\n`;
  report += `  - 낮음 (4): ${findingsByPriority[4] || 0}\n\n`;
  
  // 객체별 발견 항목
  report += '## 객체별 발견 항목\n\n';
  
  worklist.objects.forEach(obj => {
    report += `### ${obj.name} (${obj.type})\n\n`;
    report += `- **패키지:** ${obj.packageName}\n`;
    report += `- **작성자:** ${obj.author}\n`;
    report += `- **발견 항목 수:** ${obj.findings.length}\n\n`;
    
    if (obj.findings.length === 0) {
      report += '발견 항목 없음\n\n';
    } else {
      report += '| 우선순위 | 검사 | 메시지 | 위치 |\n';
      report += '|---------|------|--------|------|\n';
      
      obj.findings.forEach(finding => {
        const priority = finding.priority === 1 ? '매우 높음' : 
                        finding.priority === 2 ? '높음' : 
                        finding.priority === 3 ? '중간' : '낮음';
        
        const location = `${finding.location.range.start.line}:${finding.location.range.start.column}`;
        
        report += `| ${priority} | ${finding.checkTitle} | ${finding.messageTitle} | ${location} |\n`;
      });
      
      report += '\n';
    }
  });
  
  // 조치 계획
  report += '## 조치 계획\n\n';
  report += '우선순위가 높은 항목부터 조치하는 것이 좋습니다. 다음은 권장되는 조치 계획입니다:\n\n';
  
  if (findingsByPriority[1] > 0) {
    report += '### 즉시 해결해야 할 항목 (매우 높은 우선순위)\n\n';
    worklist.objects.forEach(obj => {
      obj.findings.filter(f => f.priority === 1).forEach(finding => {
        report += `- **${obj.name}:** ${finding.messageTitle} (라인 ${finding.location.range.start.line})\n`;
      });
    });
    report += '\n';
  }
  
  if (findingsByPriority[2] > 0) {
    report += '### 가능한 빨리 해결해야 할 항목 (높은 우선순위)\n\n';
    worklist.objects.forEach(obj => {
      obj.findings.filter(f => f.priority === 2).forEach(finding => {
        report += `- **${obj.name}:** ${finding.messageTitle} (라인 ${finding.location.range.start.line})\n`;
      });
    });
    report += '\n';
  }
  
  return report;
}

// 사용 예시
async function atcAnalysisExample() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    const report = await generateAtcReport(
      client,
      '/sap/bc/adt/programs/programs/ZEXAMPLE_PROGRAM'
    );
    
    console.log('ATC 보고서 생성 완료');
    
    // 보고서 출력 또는 저장
    console.log(report);
    
    // 파일 시스템이 사용 가능한 경우 파일로 저장
    // require('fs').writeFileSync('atc-report.md', report);
    
  } catch (error) {
    console.error('ATC 분석 중 오류 발생:', error);
  } finally {
    await client.logout();
  }
}

atcAnalysisExample();
```

### 성능 추적 및 분석

다음 예제는 ABAP 프로그램의 성능을 추적하고 분석하는 방법을 보여줍니다:

```typescript
import { ADTClient } from 'abap-adt-api';

async function performanceTraceWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // 1. 추적 매개변수 설정
    console.log('추적 매개변수 설정 중...');
    const parametersUri = await client.tracesSetParameters({
      allMiscAbapStatements: true,
      allProceduralUnits: true,
      allInternalTableEvents: false,
      allDynproEvents: false,
      description: '성능 분석 추적',
      aggregate: true,
      explicitOnOff: false,
      withRfcTracing: true,
      allSystemKernelEvents: false,
      sqlTrace: true,
      allDbEvents: true,
      maxSizeForTraceFile: 100,
      maxTimeForTracing: 600
    });
    
    // 2. 추적 구성 생성
    console.log('추적 구성 생성 중...');
    const requestList = await client.tracesCreateConfiguration({
      server: '*',
      description: '프로그램 성능 추적',
      traceUser: client.username,
      traceClient: '*',
      processType: 'BATCH',
      objectType: 'REPORT',
      expires: new Date(Date.now() + 86400000), // 1일 후 만료
      maximalExecutions: 1,
      parametersId: parametersUri
    });
    
    console.log('추적 구성이 생성되었습니다.');
    console.log('이제 분석할 프로그램을 실행하세요...');
    console.log('실행 후 Enter 키를 눌러 결과를 분석하세요...');
    
    // 사용자 입력 대기 (실제 구현에서는 적절한 방법 사용)
    // await new Promise(resolve => process.stdin.once('data', resolve));
    await new Promise(resolve => setTimeout(resolve, 30000)); // 예제용 30초 대기
    
    // 3. 추적 목록 조회
    console.log('추적 목록 조회 중...');
    const traces = await client.tracesList();
    
    if (traces.runs.length === 0) {
      console.log('추적 결과가 없습니다. 프로그램이 실행되었는지 확인하세요.');
      return;
    }
    
    // 가장 최근 추적 선택
    const latestTrace = traces.runs[0];
    console.log(`추적 결과 발견: ${latestTrace.title}`);
    
    // 4. 히트 목록 분석
    console.log('히트 목록 분석 중...');
    const hitList = await client.tracesHitList(latestTrace.id);
    
    console.log(`히트 항목 수: ${hitList.entries.length}`);
    
    // 상위 10개 시간 소비 항목 출력
    const topTimeConsumers = [...hitList.entries]
      .sort((a, b) => b.grossTime.time - a.grossTime.time)
      .slice(0, 10);
    
    console.log('상위 시간 소비 항목:');
    topTimeConsumers.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.description}`);
      console.log(`   - 시간: ${entry.grossTime.time}ms (${entry.grossTime.percentage}%)`);
      console.log(`   - 히트 횟수: ${entry.hitCount}`);
    });
    
    // 5. 데이터베이스 액세스 분석
    console.log('데이터베이스 액세스 분석 중...');
    const dbAccess = await client.tracesDbAccess(latestTrace.id);
    
    console.log(`데이터베이스 액세스 항목 수: ${dbAccess.dbaccesses.length}`);
    
    // 상위 5개 DB 액세스 항목 출력
    const topDbAccesses = [...dbAccess.dbaccesses]
      .sort((a, b) => b.accessTime.total - a.accessTime.total)
      .slice(0, 5);
    
    console.log('상위 데이터베이스 액세스 항목:');
    topDbAccesses.forEach((access, index) => {
      console.log(`${index + 1}. ${access.tableName} (${access.type})`);
      console.log(`   - 시간: ${access.accessTime.total}ms`);
      console.log(`   - 총 액세스 횟수: ${access.totalCount}`);
      console.log(`   - 버퍼링된 횟수: ${access.bufferedCount}`);
    });
    
    // 6. 구문 분석
    console.log('구문 분석 중...');
    const statements = await client.tracesStatements(latestTrace.id, {
      withDetails: true
    });
    
    console.log(`구문 항목 수: ${statements.statements.length}`);
    
    // 상위 5개 구문 항목 출력
    const topStatements = [...statements.statements]
      .sort((a, b) => b.grossTime.time - a.grossTime.time)
      .slice(0, 5);
    
    console.log('상위 시간 소비 구문:');
    topStatements.forEach((stmt, index) => {
      console.log(`${index + 1}. ${stmt.description}`);
      console.log(`   - 시간: ${stmt.grossTime.time}ms (${stmt.grossTime.percentage}%)`);
      console.log(`   - 히트 횟수: ${stmt.hitCount}`);
      console.log(`   - 호출 레벨: ${stmt.callLevel}`);
    });
    
    // 7. 성능 최적화 권장 사항
    console.log('\n성능 최적화 권장 사항:');
    
    // DB 액세스 최적화 권장
    if (topDbAccesses.length > 0) {
      console.log('데이터베이스 액세스 최적화:');
      topDbAccesses.forEach((access, index) => {
        console.log(`- "${access.tableName}" 테이블 액세스 최적화 고려`);
        if (access.bufferedCount / access.totalCount < 0.5) {
          console.log(`  테이블 버퍼링을 개선하세요. 현재 버퍼링 비율: ${Math.round(access.bufferedCount / access.totalCount * 100)}%`);
        }
      });
    }
    
    // 구문 최적화 권장
    if (topStatements.length > 0) {
      console.log('\n코드 최적화:');
      topStatements.forEach((stmt, index) => {
        console.log(`- "${stmt.description}" 최적화 고려`);
        if (stmt.hitCount > 100) {
          console.log(`  이 구문이 ${stmt.hitCount}번 실행됩니다. 루프 내에서 불필요한 호출이 있는지 확인하세요.`);
        }
      });
    }
    
    // 8. 추적 구성 정리
    console.log('추적 구성 정리 중...');
    const traceRequests = await client.tracesListRequests();
    for (const request of traceRequests.requests) {
      await client.tracesDeleteConfiguration(request.id);
    }
    
    // 9. 추적 삭제 (필요한 경우)
    // await client.tracesDelete(latestTrace.id);
    
    console.log('성능 분석이 완료되었습니다.');
    
  } catch (error) {
    console.error('성능 추적 중 오류 발생:', error);
  } finally {
    await client.logout();
  }
}

performanceTraceWorkflow();
```

## 참고 사항

- ATC 검사는 시스템 리소스를 많이 사용하므로 대량의 객체를 검사할 때는 주의해야 합니다.
- 추적 기능은 시스템 성능에 영향을 줄 수 있으므로 프로덕션 시스템에서는 신중하게 사용해야 합니다.
- 서비스 바인딩 게시 및 게시 취소는 트랜스포트에 영향을 줄 수 있습니다.
- SQL 쿼리 실행은 시스템에 직접적인 영향을 미치므로 SELECT 문만 사용하는 것이 안전합니다.
- 일부 고급 기능은 특정 SAP 버전 또는 특정 권한이 필요할 수 있습니다.