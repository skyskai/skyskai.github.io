# API 문서 개요

ABAP ADT API 라이브러리는 SAP ABAP Development Tools(ADT)의 REST API를 래핑하여 사용하기 쉬운 JavaScript/TypeScript 인터페이스를 제공합니다. 이 문서에서는 라이브러리의 주요 구성 요소와 기능을 살펴봅니다.

## 라이브러리 구조

ABAP ADT API 라이브러리는 크게 다음과 같은 구성 요소로 이루어져 있습니다.

### 핵심 클래스

- **ADTClient**: 라이브러리의 주요 클래스로, ABAP 시스템과의 모든 상호작용을 처리합니다.
- **AdtHTTP**: HTTP 통신을 담당하는 내부 클래스로, RESTful API 호출을 처리합니다.

### 주요 API 모듈

라이브러리는 다음과 같은 주요 API 모듈로 구분됩니다:

1. **기본 기능**: 로그인, 세션 관리, 시스템 정보 등
2. **객체 관리**: ABAP 객체 탐색, 생성, 수정, 삭제 등
3. **개발 기능**: 코드 편집, 구문 검사, 코드 완성, 리팩토링 등
4. **트랜스포트**: 트랜스포트 요청 관리
5. **ABAP Git**: ABAP Git 저장소 관리
6. **디버깅**: ABAP 프로그램 디버깅
7. **테스트**: 단위 테스트 실행 및 결과 처리
8. **고급 기능**: ATC(ABAP Test Cockpit), 추적 등

## API 사용 패턴

ABAP ADT API는 일반적으로 다음과 같은 패턴으로 사용됩니다:

1. **클라이언트 초기화 및 로그인**
   ```typescript
   const client = new ADTClient(url, username, password);
   await client.login();
   ```

2. **객체 조회 및 조작**
   ```typescript
   const objectStructure = await client.objectStructure(objectUrl);
   ```

3. **상태 유지가 필요한 작업 수행**
   ```typescript
   client.stateful = "stateful";  // 상태 유지 세션 설정
   const lock = await client.lock(objectUrl);  // 객체 잠금
   // 작업 수행...
   await client.unLock(objectUrl, lock.LOCK_HANDLE);  // 잠금 해제
   ```

4. **비동기 작업 처리**
   ```typescript
   // 대부분의 API 메서드는 Promise를 반환합니다
   try {
     const result = await client.someAsyncMethod();
     // 결과 처리...
   } catch (error) {
     // 오류 처리...
   }
   ```

## API 문서 사용 방법

각 API 페이지는 다음 구조로 구성되어 있습니다:

- **개요**: 해당 API 모듈에 대한 간략한 설명
- **주요 클래스 및 인터페이스**: 관련 타입 정의
- **메서드**: 사용 가능한 메서드 및 매개변수 설명
- **예제**: 일반적인 사용 사례와 코드 예제

## 주요 API 모듈

다음 페이지에서 각 API 모듈에 대한 자세한 내용을 확인할 수 있습니다:

- [기본 기능](./core.md): 로그인, 세션 관리, 시스템 정보 등
- [객체 관리](./object-management.md): ABAP 객체 관리 기능
- [개발 기능](./development.md): 코드 개발 관련 기능
- [트랜스포트](./transport.md): 트랜스포트 관리
- [ABAP Git](./git.md): ABAP Git 통합
- [디버깅](./debugging.md): ABAP 디버깅 기능
- [테스트](./testing.md): 단위 테스트 관련 기능
- [고급 기능](./advanced.md): 기타 고급 기능

## API 참조 표

| API 모듈 | 주요 기능 | 관련 클래스/인터페이스 |
|----------|----------|------------------------|
| 기본 기능 | 로그인, 세션 관리, 시스템 정보 | `ADTClient`, `AdtHTTP` |
| 객체 관리 | 객체 탐색, 생성, 수정, 삭제 | `ObjectStructure`, `NodeStructure` |
| 개발 기능 | 코드 편집, 구문 검사, 리팩토링 | `SyntaxCheckResult`, `CompletionProposal` |
| 트랜스포트 | 트랜스포트 요청 관리 | `TransportInfo`, `TransportsOfUser` |
| ABAP Git | Git 저장소 관리 | `GitRepo`, `GitStaging` |
| 디버깅 | 프로그램 디버깅 | `DebugAttach`, `DebugStackInfo` |
| 테스트 | 단위 테스트 실행 | `UnitTestClass`, `UnitTestMethod` |
| 고급 기능 | ATC, 추적 등 | `AtcWorkList`, `TraceResults` |