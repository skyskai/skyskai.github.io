# 트랜스포트 관리

이 페이지에서는 ABAP ADT API를 사용하여 트랜스포트 요청을 관리하는 방법을 설명합니다.

## 트랜스포트 정보

### 트랜스포트 정보 조회

```typescript
async transportInfo(
  URI: string,
  DEVCLASS: string = "",
  OPERATION: string = "I"
): Promise<TransportInfo>
```

객체에 대한 트랜스포트 정보를 조회합니다.

**매개변수:**
- `URI`: 객체 URI
- `DEVCLASS`: 개발 클래스(패키지) (선택적)
- `OPERATION`: 작업 유형 (기본값: "I")

**반환 값:**
- `TransportInfo`: 트랜스포트 정보

**예제:**
```typescript
// 객체의 트랜스포트 정보 조회
const transportInfo = await client.transportInfo('/sap/bc/adt/programs/programs/ZEXAMPLE');
console.log('트랜스포트 정보:', transportInfo);

// 사용 가능한 트랜스포트 목록
if (transportInfo.TRANSPORTS && transportInfo.TRANSPORTS.length > 0) {
  console.log('사용 가능한 트랜스포트:');
  transportInfo.TRANSPORTS.forEach(transport => {
    console.log(`${transport.TRKORR}: ${transport.AS4TEXT}`);
  });
}
```

### 트랜스포트 등록 정보

```typescript
async objectRegistrationInfo(objectUrl: string): Promise<RegistrationInfo>
```

객체의 등록 정보를 조회합니다.

**매개변수:**
- `objectUrl`: 객체 URL

**반환 값:**
- `RegistrationInfo`: 등록 정보

**예제:**
```typescript
// 객체 등록 정보 조회
const registrationInfo = await client.objectRegistrationInfo('/sap/bc/adt/programs/programs/ZEXAMPLE');
console.log('객체 등록 정보:', registrationInfo);
```

## 트랜스포트 요청 관리

### 트랜스포트 요청 생성

```typescript
async createTransport(
  objSourceUrl: string,
  REQUEST_TEXT: string,
  DEVCLASS: string,
  transportLayer?: string
): Promise<string>
```

새 트랜스포트 요청을 생성합니다.

**매개변수:**
- `objSourceUrl`: 객체 소스 URL
- `REQUEST_TEXT`: 요청 설명 텍스트
- `DEVCLASS`: 개발 클래스(패키지)
- `transportLayer`: 트랜스포트 레이어 (선택적)

**반환 값:**
- `string`: 생성된 트랜스포트 요청 번호

**예제:**
```typescript
// 새 트랜스포트 요청 생성
const transportNumber = await client.createTransport(
  '/sap/bc/adt/programs/programs/ZEXAMPLE',
  '예제 프로그램 변경',
  'ZEXAMPLE_PKG',
  'Z_LAYER'
);
console.log('생성된 트랜스포트 번호:', transportNumber);
```

### 사용자 트랜스포트 목록

```typescript
async userTransports(
  user: string,
  targets: boolean = true
): Promise<TransportsOfUser>
```

특정 사용자의 트랜스포트 요청 목록을 조회합니다.

**매개변수:**
- `user`: 사용자 ID
- `targets`: 대상 포함 여부 (기본값: true)

**반환 값:**
- `TransportsOfUser`: 사용자 트랜스포트 정보

**예제:**
```typescript
// 현재 사용자의 트랜스포트 목록 조회
const userTransports = await client.userTransports(client.username);

// 워크벤치 요청 목록
console.log('워크벤치 요청:');
userTransports.workbench.forEach(target => {
  console.log(`대상: ${target['tm:name']}`);
  target.modifiable.forEach(req => {
    console.log(`- ${req['tm:number']}: ${req['tm:desc']}`);
  });
});

// 커스터마이징 요청 목록
console.log('커스터마이징 요청:');
userTransports.customizing.forEach(target => {
  console.log(`대상: ${target['tm:name']}`);
  target.modifiable.forEach(req => {
    console.log(`- ${req['tm:number']}: ${req['tm:desc']}`);
  });
});
```

### 구성별 트랜스포트 목록

```typescript
async transportsByConfig(
  configUri: string,
  targets: boolean = true
): Promise<TransportsOfUser>
```

특정 구성에 따른 트랜스포트 요청 목록을 조회합니다.

**매개변수:**
- `configUri`: 구성 URI
- `targets`: 대상 포함 여부 (기본값: true)

**반환 값:**
- `TransportsOfUser`: 사용자 트랜스포트 정보

**예제:**
```typescript
// 구성별 트랜스포트 목록 조회
const configs = await client.transportConfigurations();
if (configs.length > 0) {
  const transports = await client.transportsByConfig(configs[0].link);
  console.log('구성별 트랜스포트 목록:', transports);
}
```

### 트랜스포트 삭제

```typescript
async transportDelete(transportNumber: string): Promise<void>
```

트랜스포트 요청을 삭제합니다.

**매개변수:**
- `transportNumber`: 트랜스포트 요청 번호

**예제:**
```typescript
// 트랜스포트 삭제
await client.transportDelete('DEVK900123');
console.log('트랜스포트가 삭제되었습니다.');
```

### 트랜스포트 릴리스

```typescript
async transportRelease(
  transportNumber: string,
  ignoreLocks: boolean = false,
  IgnoreATC: boolean = false
): Promise<TransportReleaseReport[]>
```

트랜스포트 요청을 릴리스합니다.

**매개변수:**
- `transportNumber`: 트랜스포트 요청 번호
- `ignoreLocks`: 잠금 무시 여부 (기본값: false)
- `IgnoreATC`: ATC 검사 무시 여부 (기본값: false)

**반환 값:**
- `TransportReleaseReport[]`: 릴리스 보고서

**예제:**
```typescript
// 트랜스포트 릴리스
const releaseReports = await client.transportRelease('DEVK900123');

// 릴리스 결과 확인
if (releaseReports.length > 0) {
  const report = releaseReports[0];
  console.log(`릴리스 상태: ${report['chkrun:status']}`);
  console.log(`상태 텍스트: ${report['chkrun:statusText']}`);
  
  // 메시지 출력
  if (report.messages && report.messages.length > 0) {
    console.log('메시지:');
    report.messages.forEach(msg => {
      console.log(`${msg['chkrun:type']}: ${msg['chkrun:shortText']}`);
    });
  }
}
```

### 트랜스포트 소유자 변경

```typescript
async transportSetOwner(
  transportNumber: string,
  targetuser: string
): Promise<TransportOwnerResponse>
```

트랜스포트 요청의 소유자를 변경합니다.

**매개변수:**
- `transportNumber`: 트랜스포트 요청 번호
- `targetuser`: 새 소유자 사용자 ID

**반환 값:**
- `TransportOwnerResponse`: 소유자 변경 응답

**예제:**
```typescript
// 트랜스포트 소유자 변경
const ownerResponse = await client.transportSetOwner('DEVK900123', 'NEWUSER');
console.log('소유자 변경됨:', ownerResponse);
```

### 트랜스포트에 사용자 추가

```typescript
async transportAddUser(
  transportNumber: string,
  user: string
): Promise<TransportAddUserResponse>
```

트랜스포트 요청에 사용자를 추가합니다.

**매개변수:**
- `transportNumber`: 트랜스포트 요청 번호
- `user`: 추가할 사용자 ID

**반환 값:**
- `TransportAddUserResponse`: 사용자 추가 응답

**예제:**
```typescript
// 트랜스포트에 사용자 추가
const addUserResponse = await client.transportAddUser('DEVK900123', 'DEVELOPER1');
console.log('사용자 추가됨:', addUserResponse);
```

### 트랜스포트 참조 조회

```typescript
async transportReference(
  pgmid: string,
  obj_wbtype: string,
  obj_name: string,
  tr_number: string = ""
): Promise<string>
```

트랜스포트 참조를 조회합니다.

**매개변수:**
- `pgmid`: 프로그램 ID
- `obj_wbtype`: 객체 워크벤치 유형
- `obj_name`: 객체 이름
- `tr_number`: 트랜스포트 요청 번호 (선택적)

**반환 값:**
- `string`: 트랜스포트 참조 URL

**예제:**
```typescript
// 트랜스포트 참조 조회
const reference = await client.transportReference(
  'LIMU',        // 프로그램 ID
  'PROG',        // 객체 유형
  'ZEXAMPLE',    // 객체 이름
  'DEVK900123'   // 트랜스포트 번호
);
console.log('트랜스포트 참조:', reference);
```

## 트랜스포트 구성

### 트랜스포트 구성 조회

```typescript
async transportConfigurations(): Promise<TransportConfigurationEntry[]>
```

시스템의 트랜스포트 구성 목록을 조회합니다.

**반환 값:**
- `TransportConfigurationEntry[]`: 트랜스포트 구성 항목 배열

**예제:**
```typescript
// 트랜스포트 구성 목록 조회
const configurations = await client.transportConfigurations();
console.log('트랜스포트 구성 목록:');
configurations.forEach(config => {
  console.log(`- ${config.title} (생성자: ${config.createdBy})`);
});
```

### 트랜스포트 구성 생성

```typescript
async createTransportsConfig(): Promise<TransportConfigurationEntry>
```

새 트랜스포트 구성을 생성합니다.

**반환 값:**
- `TransportConfigurationEntry`: 생성된 구성 항목

**예제:**
```typescript
// 새 트랜스포트 구성 생성
const newConfig = await client.createTransportsConfig();
console.log('새 구성 생성됨:', newConfig);
```

### 트랜스포트 구성 조회

```typescript
async getTransportConfiguration(
  url: string
): Promise<TransportConfiguration>
```

특정 URL의 트랜스포트 구성을 조회합니다.

**매개변수:**
- `url`: 구성 URL

**반환 값:**
- `TransportConfiguration`: 트랜스포트 구성

**예제:**
```typescript
// 트랜스포트 구성 조회
const configurations = await client.transportConfigurations();
if (configurations.length > 0) {
  const config = await client.getTransportConfiguration(configurations[0].link);
  console.log('트랜스포트 구성:', config);
}
```

### 트랜스포트 구성 설정

```typescript
async setTransportsConfig(
  uri: string,
  etag: string,
  config: TransportConfiguration
): Promise<TransportConfiguration>
```

트랜스포트 구성을 설정합니다.

**매개변수:**
- `uri`: 구성 URI
- `etag`: ETag 값
- `config`: 트랜스포트 구성

**반환 값:**
- `TransportConfiguration`: 업데이트된 트랜스포트 구성

**예제:**
```typescript
// 트랜스포트 구성 가져오기
const configurations = await client.transportConfigurations();
if (configurations.length > 0) {
  const configUrl = configurations[0].link;
  const etag = configurations[0].etag;
  
  // 기존 구성 조회
  const config = await client.getTransportConfiguration(configUrl);
  
  // 구성 수정
  config.User = client.username;
  config.DateFilter = 1; // 2주 이내
  config.WorkbenchRequests = true;
  config.CustomizingRequests = false;
  
  // 구성 업데이트
  const updatedConfig = await client.setTransportsConfig(configUrl, etag, config);
  console.log('구성 업데이트됨:', updatedConfig);
}
```

## 시스템 사용자

### 시스템 사용자 조회

```typescript
async systemUsers(): Promise<SystemUser[]>
```

시스템에 등록된 사용자 목록을 조회합니다.

**반환 값:**
- `SystemUser[]`: 시스템 사용자 배열

**예제:**
```typescript
// 시스템 사용자 목록 조회
const users = await client.systemUsers();
console.log('시스템 사용자:');
users.forEach(user => {
  console.log(`- ${user.id}: ${user.title}`);
});
```

## 트랜스포트 API 활용 예제

### 예제: 트랜스포트 요청 생성 및 관리

```typescript
import { ADTClient } from 'abap-adt-api';

async function transportWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // 1. 패키지의 트랜스포트 정보 조회
    const objectUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE';
    const transportInfo = await client.transportInfo(objectUrl, 'ZEXAMPLE_PKG');
    console.log('트랜스포트 정보:', transportInfo);
    
    let transportNumber: string;
    
    // 2. 기존 트랜스포트가 있는지 확인
    if (transportInfo.TRANSPORTS && transportInfo.TRANSPORTS.length > 0) {
      // 첫 번째 트랜스포트 사용
      transportNumber = transportInfo.TRANSPORTS[0].TRKORR;
      console.log('기존 트랜스포트 사용:', transportNumber);
    } else {
      // 새 트랜스포트 생성
      transportNumber = await client.createTransport(
        objectUrl,
        '예제 프로그램 변경',
        'ZEXAMPLE_PKG'
      );
      console.log('새 트랜스포트 생성됨:', transportNumber);
    }
    
    // 3. 트랜스포트에 다른 사용자 추가
    const addUserResponse = await client.transportAddUser(transportNumber, 'DEVELOPER2');
    console.log('사용자 추가됨:', addUserResponse);
    
    // 4. 현재 사용자의 트랜스포트 목록 조회
    const userTransports = await client.userTransports(client.username);
    console.log('사용자 트랜스포트 목록:');
    
    // 워크벤치 요청 수 계산
    let workbenchCount = 0;
    userTransports.workbench.forEach(target => {
      workbenchCount += target.modifiable.length;
    });
    console.log(`- 워크벤치 요청: ${workbenchCount}개`);
    
    // 5. 트랜스포트 릴리스 (실제 환경에서는 필요에 따라 사용)
    if (false) { // 예시에서는 실행하지 않음
      const releaseReports = await client.transportRelease(transportNumber);
      console.log('릴리스 결과:', releaseReports);
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
  }
}

transportWorkflow();
```

### 예제: 트랜스포트 구성 관리

```typescript
import { ADTClient, TransportDateFilter } from 'abap-adt-api';

async function transportConfigWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // 1. 트랜스포트 구성 지원 확인
    const hasTransportConfig = await client.hasTransportConfig();
    if (!hasTransportConfig) {
      console.log('트랜스포트 구성이 지원되지 않습니다.');
      return;
    }
    
    // 2. 기존 구성 목록 조회
    let configurations = await client.transportConfigurations();
    console.log(`기존 구성 수: ${configurations.length}`);
    
    let configUrl: string;
    let configEtag: string;
    
    // 3. 새 구성 생성 또는 기존 구성 사용
    if (configurations.length === 0) {
      // 새 구성 생성
      const newConfig = await client.createTransportsConfig();
      configUrl = newConfig.link;
      configEtag = newConfig.etag;
      console.log('새 구성 생성됨:', configUrl);
      
      // 구성 목록 다시 조회
      configurations = await client.transportConfigurations();
    } else {
      // 첫 번째 구성 사용
      configUrl = configurations[0].link;
      configEtag = configurations[0].etag;
      console.log('기존 구성 사용:', configUrl);
    }
    
    // 4. 구성 상세 조회
    const config = await client.getTransportConfiguration(configUrl);
    console.log('현재 구성:', config);
    
    // 5. 구성 수정
    const updatedConfig = {
      ...config,
      DateFilter: TransportDateFilter.SinceYesterday, // 어제부터
      WorkbenchRequests: true,                        // 워크벤치 요청 포함
      CustomizingRequests: true,                      // 커스터마이징 요청 포함
      Released: false,                                // 릴리스되지 않은 요청만
      User: client.username,                          // 현재 사용자의 요청만
      Modifiable: true                                // 수정 가능한 요청만
    };
    
    // 6. 업데이트된 구성 저장
    const savedConfig = await client.setTransportsConfig(configUrl, configEtag, updatedConfig);
    console.log('구성 업데이트됨:', savedConfig);
    
    // 7. 업데이트된 구성으로 트랜스포트 조회
    const transports = await client.transportsByConfig(configUrl);
    
    // 워크벤치 요청 수 계산
    let workbenchCount = 0;
    transports.workbench.forEach(target => {
      workbenchCount += target.modifiable.length;
    });
    console.log(`필터링된 워크벤치 요청: ${workbenchCount}개`);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
  }
}

transportConfigWorkflow();
```

## 참고 사항

- 트랜스포트 관리 API는 SAP 시스템의 권한 설정에 따라 일부 기능이 제한될 수 있습니다.
- 트랜스포트 릴리스는 신중하게 수행해야 합니다. 릴리스된 트랜스포트는 취소할 수 없습니다.
- 트랜스포트 구성 기능은 일부 SAP 시스템에서만 지원될 수 있습니다.
- 트랜스포트 요청 번호는 항상 10자리이며, 대개 'DEVK' 등의 접두사로 시작합니다.
- 대규모 트랜스포트 조작 작업은 시스템 성능에 영향을 줄 수 있으므로 주의해서 사용하세요.