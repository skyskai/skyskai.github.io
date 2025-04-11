# 시작하기

ABAP ADT API 라이브러리를 사용하여 SAP ABAP 시스템과 상호작용하는 애플리케이션을 개발하는 방법을 알아보겠습니다.

## 설치

npm을 사용하여 라이브러리를 설치할 수 있습니다.

```bash
npm install abap-adt-api
```

또는 yarn을 사용할 경우:

```bash
yarn add abap-adt-api
```

## 기본 설정

ABAP ADT API를 사용하기 위해서는 다음과 같은 기본 설정이 필요합니다.

### ADTClient 초기화

```typescript
import { ADTClient } from 'abap-adt-api';

// 기본 클라이언트 생성
const client = new ADTClient(
  'https://your-sap-server.com', // SAP 서버 URL
  'username',                    // 사용자 이름
  'password',                    // 비밀번호
  '001',                         // 클라이언트 (선택적)
  'EN'                           // 언어 (선택적)
);
```

### SSL 인증서 설정

자체 서명된 인증서나 사설 인증 기관을 사용하는 경우, SSL 설정을 추가해야 할 수 있습니다.

```typescript
import { ADTClient, createSSLConfig } from 'abap-adt-api';
import fs from 'fs';

// SSL 설정
const sslConfig = createSSLConfig(
  true,                           // 인증서 검증 우회 (개발용)
  fs.readFileSync('ca.pem', 'utf8') // CA 인증서 (선택적)
);

// SSL 설정을 포함한 클라이언트 생성
const client = new ADTClient(
  'https://your-sap-server.com',
  'username',
  'password',
  '001',
  'EN',
  sslConfig
);
```

## 로그인 및 세션 관리

ADT API를 사용하기 위해서는 먼저 SAP 시스템에 로그인해야 합니다.

```typescript
async function main() {
  try {
    // 로그인
    await client.login();
    console.log('로그인 성공');
    
    // 세션 상태 확인
    console.log(`로그인 상태: ${client.loggedin}`);
    console.log(`세션 ID: ${client.sessionID}`);
    
    // 작업 수행...
    
    // 로그아웃
    await client.logout();
    console.log('로그아웃 성공');
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

main();
```

### 세션 유형

ABAP ADT API는 다음과 같은 세션 유형을 지원합니다:

- **Stateless**: 각 요청이 독립적으로 처리됩니다. (기본값)
- **Stateful**: 서버에서 상태를 유지합니다. 오브젝트 잠금 등의 기능에 필요합니다.

```typescript
// 상태 유지 세션으로 설정
client.stateful = "stateful";

// 상태 확인
console.log(`상태 유지 세션: ${client.isStateful}`);
```

## 기본 작업 흐름 예제

다음은 ABAP 프로그램의 소스 코드를 조회하고 수정하는 기본적인 작업 흐름입니다.

```typescript
import { ADTClient } from 'abap-adt-api';

async function editProgram() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  
  try {
    await client.login();
    
    // 상태 유지 세션으로 설정 (객체 잠금을 위해 필요)
    client.stateful = "stateful";
    
    // 프로그램 구조 조회
    const objectUrl = '/sap/bc/adt/programs/programs/Z_YOUR_PROGRAM';
    const objectStructure = await client.objectStructure(objectUrl);
    
    // 소스 코드 URL 얻기
    const sourceUrl = ADTClient.mainInclude(objectStructure);
    
    // 소스 코드 조회
    const source = await client.getObjectSource(sourceUrl);
    console.log('현재 소스 코드:', source);
    
    // 객체 잠금
    const lock = await client.lock(objectUrl);
    console.log('객체 잠금 핸들:', lock.LOCK_HANDLE);
    
    // 수정된 소스 코드
    const modifiedSource = source + '\n* 주석 추가됨';
    
    // 소스 코드 업데이트
    await client.setObjectSource(sourceUrl, modifiedSource, lock.LOCK_HANDLE);
    console.log('소스 코드 업데이트 성공');
    
    // 활성화
    const activationResult = await client.activate(
      objectStructure.metaData['adtcore:name'], 
      objectUrl
    );
    
    if (activationResult.success) {
      console.log('활성화 성공');
    } else {
      console.log('활성화 실패:', activationResult.messages);
    }
    
    // 객체 잠금 해제
    await client.unLock(objectUrl, lock.LOCK_HANDLE);
    console.log('객체 잠금 해제됨');
    
    // 세션 종료
    await client.logout();
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

editProgram();
```

## 다음 단계

기본적인 설정과 사용법을 알아보았습니다. 이제 다음 단계로 진행하여 더 많은 API 기능을 살펴보세요.

- [객체 관리](/api/object-management) - ABAP 객체 관리 기능
- [개발 기능](/api/development) - 코드 개발 관련 기능
- [트랜스포트](/api/transport) - 트랜스포트 관리
- [디버깅](/api/debugging) - ABAP 디버깅 기능