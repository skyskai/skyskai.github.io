# 디버깅 기능

이 페이지에서는 ABAP ADT API를 사용하여 ABAP 프로그램을 원격으로 디버깅하는 방법을 설명합니다.

## 디버깅 개요

ABAP ADT API를 통한 원격 디버깅은 ADT(ABAP Development Tools)의 디버깅 기능을 프로그래밍 방식으로 구현합니다. 이를 통해 다음과 같은 작업을 수행할 수 있습니다:

- 디버그 세션 설정 및 리스닝
- 브레이크포인트 설정 및 관리
- 디버깅 중인 프로그램의 변수 검사
- 디버깅 단계 제어(Step Into, Step Over 등)
- 실행 스택 검사

## 디버그 리스너 관리

### 디버그 리스너 조회

```typescript
async debuggerListeners(
  debuggingMode: "user",
  terminalId: string,
  ideId: string,
  user: string,
  checkConflict?: boolean
): Promise<DebugListenerError | undefined>

async debuggerListeners(
  debuggingMode: DebuggingMode,
  terminalId: string,
  ideId: string,
  user?: string,
  checkConflict?: boolean
): Promise<DebugListenerError | undefined>
```

현재 활성화된 디버그 리스너를 조회합니다.

**매개변수:**
- `debuggingMode`: 디버깅 모드 ('user' 또는 'terminal')
- `terminalId`: 터미널 ID
- `ideId`: IDE ID
- `user`: 사용자 ID (사용자 모드에서 필수)
- `checkConflict`: 충돌 확인 여부 (선택적, 기본값: true)

**반환 값:**
- `DebugListenerError | undefined`: 충돌 시 오류 정보, 그렇지 않으면 undefined

**예제:**
```typescript
// 디버그 리스너 조회
const conflict = await client.debuggerListeners(
  'user',             // 사용자 모드
  'terminal-id-123',  // 터미널 ID
  'ide-id-456',       // IDE ID
  'DEVELOPER',        // 사용자 ID
  true                // 충돌 확인
);

if (conflict) {
  console.log('디버그 리스너 충돌 발생:');
  console.log(`- 타입: ${conflict.type}`);
  console.log(`- 메시지: ${conflict.message.text}`);
} else {
  console.log('활성화된 디버그 리스너가 없습니다.');
}
```

### 디버그 리스너 시작

```typescript
async debuggerListen(
  debuggingMode: "user",
  terminalId: string,
  ideId: string,
  user: string,
  checkConflict?: boolean,
  isNotifiedOnConflict?: boolean
): Promise<DebugListenerError | Debuggee | undefined>

async debuggerListen(
  debuggingMode: DebuggingMode,
  terminalId: string,
  ideId: string,
  user?: string,
  checkConflict?: boolean,
  isNotifiedOnConflict?: boolean
): Promise<DebugListenerError | Debuggee | undefined>
```

디버그 리스너를 시작하고 디버그 이벤트를 기다립니다.

**매개변수:**
- `debuggingMode`: 디버깅 모드 ('user' 또는 'terminal')
- `terminalId`: 터미널 ID
- `ideId`: IDE ID
- `user`: 사용자 ID (사용자 모드에서 필수)
- `checkConflict`: 충돌 확인 여부 (선택적, 기본값: true)
- `isNotifiedOnConflict`: 충돌 시 알림 여부 (선택적, 기본값: true)

**반환 값:**
- `DebugListenerError | Debuggee | undefined`: 충돌 시 오류 정보, 디버그 이벤트 발생 시 디버기 정보, 타임아웃 시 undefined

**중요:** 이 메서드는 디버그 이벤트가 발생하거나 타임아웃될 때까지 차단됩니다.

**예제:**
```typescript
// 디버그 리스너 시작
console.log('디버그 리스너 시작 중...');
const result = await client.debuggerListen(
  'user',             // 사용자 모드
  'terminal-id-123',  // 터미널 ID
  'ide-id-456',       // IDE ID
  'DEVELOPER',        // 사용자 ID
  true,               // 충돌 확인
  true                // 충돌 시 알림
);

if (!result) {
  console.log('디버그 리스너가 타임아웃되었습니다.');
} else if ('type' in result) {
  // DebugListenerError
  console.log('디버그 리스너 충돌 발생:');
  console.log(`- 타입: ${result.type}`);
  console.log(`- 메시지: ${result.message.text}`);
} else {
  // Debuggee
  console.log('디버그 이벤트 발생:');
  console.log(`- 프로그램: ${result.PRG_CURR}`);
  console.log(`- 포함: ${result.INCL_CURR}`);
  console.log(`- 라인: ${result.LINE_CURR}`);
  console.log(`- 사용자: ${result.DEBUGGEE_USER}`);
}
```

### 디버그 리스너 중지

```typescript
async debuggerDeleteListener(
  debuggingMode: "user",
  terminalId: string,
  ideId: string,
  user: string
): Promise<void>

async debuggerDeleteListener(
  debuggingMode: DebuggingMode,
  terminalId: string,
  ideId: string,
  user?: string
): Promise<void>
```

활성화된 디버그 리스너를 중지합니다.

**매개변수:**
- `debuggingMode`: 디버깅 모드 ('user' 또는 'terminal')
- `terminalId`: 터미널 ID
- `ideId`: IDE ID
- `user`: 사용자 ID (사용자 모드에서 필수)

**예제:**
```typescript
// 디버그 리스너 중지
await client.debuggerDeleteListener(
  'user',             // 사용자 모드
  'terminal-id-123',  // 터미널 ID
  'ide-id-456',       // IDE ID
  'DEVELOPER'         // 사용자 ID
);
console.log('디버그 리스너가 중지되었습니다.');
```

## 브레이크포인트 관리

### 브레이크포인트 설정

```typescript
async debuggerSetBreakpoints(
  debuggingMode: "user",
  terminalId: string,
  ideId: string,
  clientId: string,
  breakpoints: (string | DebugBreakpoint)[],
  user: string,
  scope?: DebuggerScope,
  systemDebugging?: boolean,
  deactivated?: boolean,
  syncScopeUri?: string
): Promise<(DebugBreakpoint | DebugBreakpointError)[]>

async debuggerSetBreakpoints(
  debuggingMode: DebuggingMode,
  terminalId: string,
  ideId: string,
  clientId: string,
  breakpoints: (string | DebugBreakpoint)[],
  user?: string,
  scope?: DebuggerScope,
  systemDebugging?: boolean,
  deactivated?: boolean,
  syncScopeUri?: string
): Promise<(DebugBreakpoint | DebugBreakpointError)[]>
```

디버깅을 위한 브레이크포인트를 설정합니다.

**매개변수:**
- `debuggingMode`: 디버깅 모드 ('user' 또는 'terminal')
- `terminalId`: 터미널 ID
- `ideId`: IDE ID
- `clientId`: 클라이언트 ID
- `breakpoints`: 브레이크포인트 배열 (URL 문자열 또는 브레이크포인트 객체)
- `user`: 사용자 ID (사용자 모드에서 필수)
- `scope`: 디버거 범위 ('external' 또는 'debugger', 기본값: 'external')
- `systemDebugging`: 시스템 디버깅 여부 (선택적, 기본값: false)
- `deactivated`: 비활성화 여부 (선택적, 기본값: false)
- `syncScopeUri`: 동기화 범위 URI (선택적)

**반환 값:**
- `(DebugBreakpoint | DebugBreakpointError)[]`: 설정된 브레이크포인트 또는 오류 정보

**예제:**
```typescript
// 브레이크포인트 설정
const breakpoints = await client.debuggerSetBreakpoints(
  'user',             // 사용자 모드
  'terminal-id-123',  // 터미널 ID
  'ide-id-456',       // IDE ID
  'client-id-789',    // 클라이언트 ID
  [
    // 단순 URL로 브레이크포인트 설정
    '/sap/bc/adt/programs/programs/ZEXAMPLE#start=10,0',
    
    // 브레이크포인트 객체로 설정
    {
      kind: 'line',
      clientId: 'bp-1',
      uri: {
        uri: '/sap/bc/adt/oo/classes/ZCL_EXAMPLE/source/main',
        range: {
          start: { line: 20, column: 0 },
          end: { line: 20, column: 0 }
        }
      }
    }
  ],
  'DEVELOPER',        // 사용자 ID
  'external',         // 범위
  false,              // 시스템 디버깅
  false,              // 비활성화 여부
  ''                  // 동기화 범위 URI
);

// 설정된 브레이크포인트 확인
breakpoints.forEach(bp => {
  if ('uri' in bp) {
    // 성공
    console.log(`브레이크포인트 설정됨: ${bp.id}`);
    console.log(`- URI: ${bp.uri.uri}`);
    console.log(`- 라인: ${bp.uri.range.start.line}`);
  } else {
    // 오류
    console.log(`브레이크포인트 오류: ${bp.errorMessage}`);
  }
});
```

### 브레이크포인트 삭제

```typescript
async debuggerDeleteBreakpoints(
  breakpoint: DebugBreakpoint,
  debuggingMode: "user",
  terminalId: string,
  ideId: string,
  requestUser: string,
  scope?: DebuggerScope
): Promise<void>

async debuggerDeleteBreakpoints(
  breakpoint: DebugBreakpoint,
  debuggingMode: DebuggingMode,
  terminalId: string,
  ideId: string,
  requestUser?: string,
  scope?: DebuggerScope
): Promise<void>
```

설정된 브레이크포인트를 삭제합니다.

**매개변수:**
- `breakpoint`: 삭제할 브레이크포인트
- `debuggingMode`: 디버깅 모드 ('user' 또는 'terminal')
- `terminalId`: 터미널 ID
- `ideId`: IDE ID
- `requestUser`: 사용자 ID (사용자 모드에서 필수)
- `scope`: 디버거 범위 ('external' 또는 'debugger', 기본값: 'external')

**예제:**
```typescript
// 브레이크포인트 설정
const breakpoints = await client.debuggerSetBreakpoints(/* ... */);

// 설정된 브레이크포인트 중 첫 번째 삭제
if (breakpoints.length > 0 && 'uri' in breakpoints[0]) {
  await client.debuggerDeleteBreakpoints(
    breakpoints[0],      // 브레이크포인트
    'user',              // 사용자 모드
    'terminal-id-123',   // 터미널 ID
    'ide-id-456',        // IDE ID
    'DEVELOPER',         // 사용자 ID
    'external'           // 범위
  );
  console.log(`브레이크포인트 삭제됨: ${breakpoints[0].id}`);
}
```

## 디버그 세션 제어

### 디버깅 대상 연결

```typescript
async debuggerAttach(
  debuggingMode: "user",
  debuggeeId: string,
  user: string,
  dynproDebugging?: boolean
): Promise<DebugAttach>

async debuggerAttach(
  debuggingMode: DebuggingMode,
  debuggeeId: string,
  user?: string,
  dynproDebugging?: boolean
): Promise<DebugAttach>
```

디버깅 대상에 연결합니다.

**매개변수:**
- `debuggingMode`: 디버깅 모드 ('user' 또는 'terminal')
- `debuggeeId`: 디버기 ID
- `user`: 사용자 ID (사용자 모드에서 필수)
- `dynproDebugging`: 다이내믹 프로그램 디버깅 여부 (선택적, 기본값: false)

**반환 값:**
- `DebugAttach`: 디버그 연결 정보

**예제:**
```typescript
// 디버그 리스너로 디버기 정보 가져오기
const debuggee = await client.debuggerListen(/* ... */);

// 연결 검증 및 연결
if (debuggee && !('type' in debuggee)) {
  // 디버깅 대상에 연결
  const attachInfo = await client.debuggerAttach(
    'user',             // 사용자 모드
    debuggee.DEBUGGEE_ID, // 디버기 ID
    'DEVELOPER',        // 사용자 ID
    true                // 다이내믹 프로그램 디버깅
  );
  
  console.log('디버깅 대상에 연결됨:');
  console.log(`- 세션 ID: ${attachInfo.debugSessionId}`);
  console.log(`- 세션 제목: ${attachInfo.sessionTitle}`);
  console.log(`- 단계 가능: ${attachInfo.isSteppingPossible}`);
  
  // 도달한 브레이크포인트 확인
  if (attachInfo.reachedBreakpoints && attachInfo.reachedBreakpoints.length > 0) {
    console.log('도달한 브레이크포인트:');
    attachInfo.reachedBreakpoints.forEach(bp => {
      console.log(`- ID: ${bp.id}`);
    });
  }
}
```

### 디버깅 설정 저장

```typescript
async debuggerSaveSettings(
  settings: Partial<DebugSettings>
): Promise<DebugSettings>
```

디버거 설정을 저장합니다.

**매개변수:**
- `settings`: 디버거 설정 (부분적)

**반환 값:**
- `DebugSettings`: 저장된 설정

**예제:**
```typescript
// 디버거 설정 저장
const settings = await client.debuggerSaveSettings({
  systemDebugging: true,           // 시스템 디버깅
  createExceptionObject: true,     // 예외 객체 생성
  backgroundRFC: false,            // 백그라운드 RFC
  sharedObjectDebugging: false,    // 공유 객체 디버깅
  showDataAging: true,             // 데이터 에이징 표시
  updateDebugging: false           // 업데이트 디버깅
});

console.log('디버거 설정이 저장되었습니다:', settings);
```

### 스택 추적 조회

```typescript
async debuggerStackTrace(
  semanticURIs: boolean = true
): Promise<DebugStackInfo>
```

현재 디버깅 스택 추적을 조회합니다.

**매개변수:**
- `semanticURIs`: 시맨틱 URI 사용 여부 (기본값: true)

**반환 값:**
- `DebugStackInfo`: 스택 추적 정보

**예제:**
```typescript
// 스택 추적 조회
const stackInfo = await client.debuggerStackTrace(true);

console.log('스택 추적:');
console.log(`- RFC: ${stackInfo.isRfc}`);
console.log(`- 동일 시스템: ${stackInfo.isSameSystem}`);
console.log(`- 서버: ${stackInfo.serverName}`);

// 스택 항목 출력
stackInfo.stack.forEach((entry, index) => {
  console.log(`스택 항목 #${index}:`);
  console.log(`- 프로그램: ${entry.programName}`);
  console.log(`- 포함: ${entry.includeName}`);
  console.log(`- 라인: ${entry.line}`);
  console.log(`- 이벤트: ${entry.eventType} - ${entry.eventName}`);
});
```

### 변수 값 조회

```typescript
async debuggerVariables(
  parents: string[]
): Promise<DebugVariable[]>
```

디버그 변수 값을 조회합니다.

**매개변수:**
- `parents`: 부모 변수 ID 배열

**반환 값:**
- `DebugVariable[]`: 변수 정보 배열

**예제:**
```typescript
// 루트 변수 값 조회
const variables = await client.debuggerVariables(['@ROOT']);

console.log('변수:');
variables.forEach(variable => {
  console.log(`- ${variable.NAME}: ${variable.VALUE} (유형: ${variable.META_TYPE})`);
  console.log(`  선언 유형: ${variable.DECLARED_TYPE_NAME}`);
  console.log(`  실제 유형: ${variable.ACTUAL_TYPE_NAME}`);
});
```

### 자식 변수 조회

```typescript
async debuggerChildVariables(
  parent: string[] = ['@DATAAGING', '@ROOT']
): Promise<DebugChildVariablesInfo>
```

디버그 자식 변수 정보를 조회합니다.

**매개변수:**
- `parent`: 부모 변수 ID 배열 (기본값: ['@DATAAGING', '@ROOT'])

**반환 값:**
- `DebugChildVariablesInfo`: 자식 변수 정보

**예제:**
```typescript
// 자식 변수 조회
const childInfo = await client.debuggerChildVariables(['@ROOT']);

console.log('계층 구조:');
childInfo.hierarchies.forEach(h => {
  console.log(`- 부모: ${h.PARENT_ID}, 자식: ${h.CHILD_ID} (${h.CHILD_NAME})`);
});

console.log('변수:');
childInfo.variables.forEach(variable => {
  console.log(`- ${variable.NAME}: ${variable.VALUE} (유형: ${variable.META_TYPE})`);
});
```

### 변수 값 설정

```typescript
async debuggerSetVariableValue(
  variableName: string,
  value: string
): Promise<string>
```

디버그 변수 값을 설정합니다.

**매개변수:**
- `variableName`: 변수 이름
- `value`: 새 값

**반환 값:**
- `string`: 응답 메시지

**예제:**
```typescript
// 변수 값 설정
const response = await client.debuggerSetVariableValue('LV_COUNT', '10');
console.log('변수 값 설정 응답:', response);
```

### 디버깅 단계 제어

```typescript
async debuggerStep(
  steptype: "stepRunToLine" | "stepJumpToLine",
  url: string
): Promise<DebugStep>

async debuggerStep(
  steptype: "stepInto" | "stepOver" | "stepReturn" | "stepContinue" | "terminateDebuggee"
): Promise<DebugStep>
```

디버깅 단계를 제어합니다.

**매개변수:**
- `steptype`: 단계 유형
- `url`: 대상 URL (stepRunToLine 또는 stepJumpToLine 사용 시)

**반환 값:**
- `DebugStep`: 디버그 단계 정보

**예제:**
```typescript
// 단계별 실행
console.log('단계별 실행 중...');
const stepIntoResult = await client.debuggerStep('stepInto');
console.log('단계별 실행 완료.');

// 단계 넘기기
console.log('단계 넘기기 중...');
const stepOverResult = await client.debuggerStep('stepOver');
console.log('단계 넘기기 완료.');

// 특정 줄로 실행
console.log('특정 줄로 실행 중...');
const runToLineResult = await client.debuggerStep(
  'stepRunToLine',
  '/sap/bc/adt/programs/programs/ZEXAMPLE#start=20,0'
);
console.log('특정 줄로 실행 완료.');

// 계속 실행
console.log('계속 실행 중...');
const continueResult = await client.debuggerStep('stepContinue');
console.log('계속 실행 완료.');

// 디버기 종료
console.log('디버기 종료 중...');
const terminateResult = await client.debuggerStep('terminateDebuggee');
console.log('디버기 종료 완료.');
```

### 스택 위치 이동

```typescript
async debuggerGoToStack(
  urlOrPosition: number | string
): Promise<void>
```

스택 추적에서 특정 위치로 이동합니다.

**매개변수:**
- `urlOrPosition`: 스택 URL 또는 스택 위치 번호

**예제:**
```typescript
// 스택 추적 조회
const stackInfo = await client.debuggerStackTrace();

// 스택의 특정 위치로 이동
if (stackInfo.stack.length > 1) {
  // 스택 URL로 이동 (DebugStackInfo에 stackUri가 있는 경우)
  if ('stackUri' in stackInfo.stack[1]) {
    await client.debuggerGoToStack(stackInfo.stack[1].stackUri);
    console.log(`스택 위치 ${stackInfo.stack[1].stackPosition}로 이동했습니다.`);
  } 
  // 스택 위치 번호로 이동
  else {
    await client.debuggerGoToStack(1); // 두 번째 스택 항목으로 이동
    console.log('스택 위치 1로 이동했습니다.');
  }
}
```

## 전체 디버깅 워크플로우 예제

다음 예제는 ABAP 디버깅의 일반적인 워크플로우를 보여줍니다:

```typescript
import { ADTClient } from 'abap-adt-api';
import { v4 as uuidv4 } from 'uuid'; // 고유 ID 생성을 위해 uuid 패키지 사용

async function debuggingWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // 디버깅에 필요한 ID 정의
    const terminalId = 'terminal-' + uuidv4();
    const ideId = 'ide-' + uuidv4();
    const clientId = 'client-' + uuidv4();
    const userId = client.username.toUpperCase();
    
    // 1. 브레이크포인트 설정
    console.log('브레이크포인트 설정 중...');
    const breakpointUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE#start=10,0';
    const breakpoints = await client.debuggerSetBreakpoints(
      'user',       // 사용자 모드
      terminalId,   // 터미널 ID
      ideId,        // IDE ID
      clientId,     // 클라이언트 ID
      [breakpointUrl], // 브레이크포인트 URL
      userId        // 사용자 ID
    );
    
    if (breakpoints.length === 0 || !('uri' in breakpoints[0])) {
      console.log('브레이크포인트 설정 실패');
      return;
    }
    
    const breakpoint = breakpoints[0];
    console.log(`브레이크포인트 설정됨: ${breakpoint.id}`);
    
    // 2. 디버그 리스너 시작
    console.log('디버그 리스너 시작 중... (사용자가 ZEXAMPLE 프로그램을 실행할 때까지 대기)');
    const debuggee = await client.debuggerListen(
      'user',     // 사용자 모드
      terminalId, // 터미널 ID
      ideId,      // IDE ID
      userId      // 사용자 ID
    );
    
    // 디버그 이벤트가 없으면 종료
    if (!debuggee || 'type' in debuggee) {
      if (!debuggee) {
        console.log('디버그 리스너 타임아웃');
      } else {
        console.log(`디버그 리스너 오류: ${debuggee.message.text}`);
      }
      
      // 리스너 정리
      await client.debuggerDeleteListener('user', terminalId, ideId, userId);
      return;
    }
    
    console.log('디버그 이벤트 발생:');
    console.log(`- 프로그램: ${debuggee.PRG_CURR}`);
    console.log(`- 포함: ${debuggee.INCL_CURR}`);
    console.log(`- 라인: ${debuggee.LINE_CURR}`);
    
    // 3. 디버깅 대상에 연결
    console.log('디버깅 대상에 연결 중...');
    const attachInfo = await client.debuggerAttach(
      'user',             // 사용자 모드
      debuggee.DEBUGGEE_ID, // 디버기 ID
      userId              // 사용자 ID
    );
    
    console.log('디버깅 대상에 연결됨:');
    console.log(`- 세션 ID: ${attachInfo.debugSessionId}`);
    
    // 4. 디버거 설정
    console.log('디버거 설정 중...');
    await client.debuggerSaveSettings({
      systemDebugging: false,
      createExceptionObject: true
    });
    
    // 5. 스택 추적 조회
    console.log('스택 추적 조회 중...');
    const stackInfo = await client.debuggerStackTrace();
    console.log('스택 추적:');
    stackInfo.stack.forEach((entry, index) => {
      console.log(`- 스택 ${index}: ${entry.programName}, 라인 ${entry.line}`);
    });
    
    // 6. 변수 조회
    console.log('변수 조회 중...');
    const variables = await client.debuggerVariables(['@ROOT']);
    console.log('변수:');
    variables.slice(0, 5).forEach(variable => { // 처음 5개만 출력
      console.log(`- ${variable.NAME}: ${variable.VALUE}`);
    });
    
    // 7. 단계별 디버깅 수행
    console.log('단계별 실행 중...');
    const stepResult = await client.debuggerStep('stepInto');
    console.log('단계별 실행 완료.');
    
    // 8. 이동 후 변수 다시 조회
    console.log('단계 이동 후 변수 다시 조회 중...');
    const updatedVariables = await client.debuggerVariables(['@ROOT']);
    console.log('업데이트된 변수:');
    updatedVariables.slice(0, 5).forEach(variable => { // 처음 5개만 출력
      console.log(`- ${variable.NAME}: ${variable.VALUE}`);
    });
    
    // 9. 변수 값 변경 (사용 가능한 경우)
    if (variables.some(v => v.NAME === 'LV_COUNT')) {
      console.log('LV_COUNT 변수 값 변경 중...');
      await client.debuggerSetVariableValue('LV_COUNT', '10');
      console.log('변수 값 변경됨.');
    }
    
    // 10. 계속 실행
    console.log('계속 실행 중...');
    await client.debuggerStep('stepContinue');
    console.log('계속 실행 완료.');
    
    // 11. 디버깅 종료
    console.log('디버깅 종료 중...');
    await client.debuggerStep('terminateDebuggee');
    console.log('디버깅 종료됨.');
    
    // 12. 브레이크포인트 제거
    console.log('브레이크포인트 제거 중...');
    if ('uri' in breakpoint) {
      await client.debuggerDeleteBreakpoints(
        breakpoint,  // 브레이크포인트
        'user',      // 사용자 모드
        terminalId,  // 터미널 ID
        ideId,       // IDE ID
        userId       // 사용자 ID
      );
      console.log('브레이크포인트 제거됨.');
    }
    
    // 13. 디버그 리스너 중지
    console.log('디버그 리스너 중지 중...');
    await client.debuggerDeleteListener('user', terminalId, ideId, userId);
    console.log('디버그 리스너 중지됨.');
    
  } catch (error) {
    console.error('디버깅 중 오류 발생:', error);
  } finally {
    await client.logout();
  }
}

debuggingWorkflow();
```

## 참고 사항

- 디버깅은 높은 수준의 권한이 필요하며, SAP 시스템 설정에 따라 제한될 수 있습니다.
- 디버그 리스너는 장시간 실행되므로 네트워크 타임아웃을 고려해야 합니다.
- 프로덕션 시스템에서의 디버깅은 성능에 큰 영향을 줄 수 있으므로 주의해서 사용해야 합니다.
- 디버그 세션은 자원을 많이 사용하므로 작업이 완료되면 항상 정리해야 합니다.
- 여러 개발자가 동일한 사용자에 대해 디버깅하면 충돌이 발생할 수 있습니다.
- 터미널 ID와 IDE ID는 고유해야 하며, 일반적으로 UUID를 사용합니다.
- 복잡한 객체 구조를 가진 변수는 `debuggerChildVariables`를 사용하여 계층적으로 탐색해야 합니다.