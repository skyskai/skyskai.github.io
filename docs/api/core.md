# 기본 기능

이 페이지에서는 ABAP ADT API의 기본 기능인 로그인, 세션 관리, 시스템 정보 조회 등에 대해 설명합니다.

## ADTClient 클래스

`ADTClient` 클래스는 라이브러리의 주요 진입점이며, ABAP 시스템과의 모든 상호작용을 처리합니다.

### 생성자

```typescript
constructor(
  baseUrlOrClient: string | HttpClient,
  username: string,
  password: string | BearerFetcher,
  client: string = "",
  language: string = "",
  options: ClientOptions = {}
)
```

**매개변수:**
- `baseUrlOrClient`: SAP 서버의 기본 URL(예: 'http://vhcalnplci.local:8000') 또는 HTTP 클라이언트 인스턴스
- `username`: SAP 로그인 사용자 이름
- `password`: 사용자 비밀번호 또는 Bearer 토큰을 가져오는 함수
- `client`: SAP 클라이언트 번호(선택적)
- `language`: 언어 키(선택적)
- `options`: 추가 클라이언트 옵션(선택적)

### SSL 설정

자체 서명된 인증서나 사설 인증 기관을 사용하는 경우, `createSSLConfig` 함수를 사용하여 SSL 설정을 구성할 수 있습니다.

```typescript
import { createSSLConfig } from 'abap-adt-api';

const sslConfig = createSSLConfig(
  true,                       // 인증서 검증 우회 여부
  'optional-ca-certificate'   // CA 인증서(선택적)
);
```

## 로그인 및 세션 관리

### 로그인

```typescript
async login(): Promise<boolean>
```

SAP 시스템에 로그인합니다. 성공 시 `true`를 반환합니다.

**예제:**
```typescript
const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
const success = await client.login();
console.log(`로그인 ${success ? '성공' : '실패'}`);
```

### 로그아웃

```typescript
async logout(): Promise<void>
```

현재 사용자의 로그아웃을 처리하고 쿠키를 정리합니다.
**참고:** 로그아웃 후에는 이 클라이언트 인스턴스로 다시 로그인할 수 없습니다.

**예제:**
```typescript
await client.logout();
```

### 세션 삭제

```typescript
async dropSession(): Promise<void>
```

현재 세션을 삭제합니다. 로그아웃과 달리 클라이언트 인스턴스는 재사용 가능합니다.

**예제:**
```typescript
await client.dropSession();
// 이후에 다시 로그인 가능
await client.login();
```

### 세션 상태 확인

세션 상태 및 정보를 확인하는 속성들:

```typescript
get loggedin: boolean            // 로그인 상태
get isStateful: boolean          // 상태 유지 세션 여부
get baseUrl: string              // 서버 기본 URL
get client: string               // SAP 클라이언트
get language: string             // 언어 키
get username: string             // 사용자 이름
get sessionID: string            // 세션 ID
get csrfToken: string            // CSRF 토큰
```

### 세션 유형 설정

```typescript
set stateful(type: session_types)
get stateful: session_types
```

세션 유형을 설정하거나 가져옵니다. 가능한 값:
- `"stateful"`: 상태 유지 세션
- `"stateless"`: 상태 비유지 세션(기본값)

**예제:**
```typescript
// 상태 유지 세션으로 설정
client.stateful = "stateful";
console.log(`상태 유지 세션: ${client.isStateful}`);
```

### 상태 비유지 클라이언트 

```typescript
get statelessClone: ADTClient
```

원본 클라이언트와 동일한 인증 정보를 사용하는 상태 비유지 클라이언트를 반환합니다.
이는 상태 유지 세션 내에서 상태 비유지 요청을 수행할 때 유용합니다.

**예제:**
```typescript
client.stateful = "stateful";          // 기본 클라이언트는 상태 유지 세션
const stateless = client.statelessClone; // 상태 비유지 클론 생성
```

## 시스템 정보 및 탐색

### 재진입 티켓 가져오기

```typescript
async reentranceTicket(): Promise<string>
```

SAP GUI에서 ADT로의 재진입을 위한 티켓을 가져옵니다.

**예제:**
```typescript
const ticket = await client.reentranceTicket();
console.log(`재진입 티켓: ${ticket}`);
```

### 시스템 디스커버리

```typescript
async adtDiscovery(): Promise<AdtDiscoveryResult[]>
```

시스템에서 사용 가능한 ADT 서비스를 검색합니다.

**예제:**
```typescript
const discovery = await client.adtDiscovery();
discovery.forEach(service => {
  console.log(`서비스: ${service.title}`);
  service.collection.forEach(col => {
    console.log(` - 컬렉션: ${col.href}`);
  });
});
```

### 코어 디스커버리

```typescript
async adtCoreDiscovery(): Promise<AdtCoreDiscoveryResult[]>
```

ADT 코어 서비스 정보를 검색합니다.

**예제:**
```typescript
const coreServices = await client.adtCoreDiscovery();
```

### 호환성 그래프

```typescript
async adtCompatibiliyGraph(): Promise<AdtCompatibilityGraph>
```

ADT 호환성 그래프를 검색합니다.

**예제:**
```typescript
const graph = await client.adtCompatibiliyGraph();
```

### 피드 조회

```typescript
async feeds(): Promise<Feed[]>
```

시스템에서 사용 가능한 ADT 피드를 조회합니다.

**예제:**
```typescript
const feeds = await client.feeds();
```

### 덤프 조회

```typescript
async dumps(query?: string): Promise<DumpsFeed>
```

시스템 덤프를 조회합니다. 선택적으로 쿼리 문자열을 사용하여 필터링할 수 있습니다.

**예제:**
```typescript
// 모든 덤프 조회
const allDumps = await client.dumps();
// 필터링된 덤프 조회
const filteredDumps = await client.dumps('type eq "ABAP runtime error"');
```

## 고급 기능

### 기능 세부 정보 조회

```typescript
async featureDetails(title: string): Promise<AdtDiscoveryResult | undefined>
```

제목으로 특정 ADT 기능의 세부 정보를 조회합니다.

```typescript
async collectionFeatureDetails(url: string): Promise<AdtDiscoveryResult | undefined>
```

URL로 특정 ADT 컬렉션의 기능 세부 정보를 조회합니다.

```typescript
async findCollectionByUrl(url: string): Promise<{ discoveryResult: AdtDiscoveryResult, collection: any } | undefined>
```

URL로 특정 ADT 컬렉션을 찾습니다.

## 예제: 기본 세션 관리 워크플로우

다음 예제는 ADTClient의 기본적인 세션 관리 워크플로우를 보여줍니다:

```typescript
import { ADTClient } from 'abap-adt-api';

async function basicWorkflow() {
  // 클라이언트 초기화
  const client = new ADTClient(
    'https://your-sap-server.com',
    'username',
    'password',
    '001',  // 클라이언트
    'KO'    // 언어
  );
  
  try {
    // 로그인
    const loginSuccess = await client.login();
    if (!loginSuccess) {
      console.error('로그인 실패');
      return;
    }
    
    console.log('로그인 성공');
    console.log(`세션 ID: ${client.sessionID}`);
    
    // 상태 유지 세션으로 전환 (객체 잠금 등에 필요)
    client.stateful = "stateful";
    console.log(`상태 유지 세션: ${client.isStateful}`);
    
    // 시스템 정보 조회
    const discovery = await client.adtDiscovery();
    console.log(`사용 가능한 서비스 수: ${discovery.length}`);
    
    // 작업 수행...
    
    // 세션 드롭 (세션 종료 후 재사용 가능)
    await client.dropSession();
    console.log('세션 종료됨');
    
    // 재로그인 가능
    await client.login();
    console.log('재로그인 성공');
    
    // 최종 로그아웃 (이 클라이언트 인스턴스로는 더 이상 로그인 불가)
    await client.logout();
    console.log('로그아웃 완료');
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

basicWorkflow();
```

## 예제: 상태 유지 및 상태 비유지 세션 사용

다음 예제는 같은 클라이언트에서 상태 유지 세션과 상태 비유지 세션을 함께 사용하는 방법을 보여줍니다:

```typescript
import { ADTClient } from 'abap-adt-api';

async function statefulAndStateless() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  // 상태 유지 세션으로 설정
  client.stateful = "stateful";
  
  // 객체 잠금 (상태 유지 세션 필요)
  const objectUrl = '/sap/bc/adt/programs/programs/Z_EXAMPLE';
  const lock = await client.lock(objectUrl);
  console.log('객체가 잠금 처리됨:', lock.LOCK_HANDLE);
  
  // 상태 비유지 클론 생성 (원본 세션은 영향 없음)
  const statelessClient = client.statelessClone;
  
  // 상태 비유지 클라이언트로 객체 구조 조회
  const objectStructure = await statelessClient.objectStructure(objectUrl);
  console.log('객체 구조 조회 완료:', objectStructure.metaData['adtcore:name']);
  
  // 원본 상태 유지 클라이언트로 잠금 해제
  await client.unLock(objectUrl, lock.LOCK_HANDLE);
  console.log('객체 잠금 해제됨');
  
  // 세션 종료
  await client.logout();
}

statefulAndStateless();
```

## 참고 사항

- ABAP 객체를 수정하거나 잠금을 사용하려면 상태 유지 세션이 필요합니다.
- 성능이 중요하고 상태를 유지할 필요가 없는 읽기 전용 작업의 경우 상태 비유지 세션을 사용하는 것이 좋습니다.
- 로그아웃한 후에는 동일한 클라이언트 인스턴스로 다시 로그인할 수 없으므로, 세션을 재사용해야 하는 경우 `dropSession()`을 사용하세요.