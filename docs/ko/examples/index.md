# 예제 개요

이 섹션에서는 ABAP ADT API 라이브러리를 사용하는 실제 예제를 제공합니다. 기본 예제부터 고급 예제까지 다양한 사용 사례를 다룹니다.

## 기본 예제

[기본 예제](./basic.md) 페이지에서는 다음과 같은 기본적인 작업에 대한 예제를 찾을 수 있습니다:

- 로그인 및 세션 관리
- 객체 구조 탐색
- 소스 코드 조회 및 수정
- 구문 검사 및 활성화
- 코드 분석 및 완성

## 고급 예제

[고급 예제](./advanced.md) 페이지에서는 다음과 같은 고급 작업에 대한 예제를 찾을 수 있습니다:

- 트랜스포트 관리 자동화
- ABAP Git 저장소 동기화
- 단위 테스트 자동화
- 코드 품질 분석 (ATC)
- 성능 추적 및 분석
- 디버깅 자동화
- 대량 변경 처리

## 예제 살펴보기

각 예제는 다음 구조로 구성되어 있습니다:

1. **목적**: 예제의 목적 및 해결하려는 문제 설명
2. **설정**: 필요한 설정 및 전제 조건
3. **코드**: 예제 코드와 설명
4. **실행**: 코드 실행 방법 및 예상 결과
5. **확장**: 예제를 확장하거나 사용자 지정하는 방법에 대한 제안

## 예제 실행 방법

예제를 실행하려면 다음이 필요합니다:

1. Node.js 및 npm 설치
2. 유효한 SAP 시스템 접근 권한
3. abap-adt-api 라이브러리 설치

### 설치 방법

```bash
# 새 프로젝트 디렉토리 생성
mkdir abap-adt-examples
cd abap-adt-examples

# npm 프로젝트 초기화
npm init -y

# abap-adt-api 및 필요한 패키지 설치
npm install abap-adt-api typescript ts-node

# TypeScript 구성 파일 생성
npx tsc --init
```

### 예제 파일 실행

```bash
# TypeScript 예제 실행
npx ts-node example-file.ts
```

## 예제 구성 파일

대부분의 예제에서는 시스템 연결 정보를 포함하는 구성 파일을 사용하는 것이 좋습니다. 이렇게 하면 여러 예제에서 동일한 연결 정보를 재사용할 수 있습니다.

아래는 `config.ts` 파일의 기본 구조입니다:

```typescript
// config.ts
export const SAP_CONFIG = {
  server: 'https://your-sap-server.com',
  username: 'your-username',
  password: 'your-password',
  client: '001',  // 선택적
  language: 'EN'  // 선택적
};

// 개발, 테스트, 프로덕션 시스템에 대한 구성
export const SYSTEMS = {
  dev: {
    ...SAP_CONFIG,
    server: 'https://dev-sap-server.com'
  },
  test: {
    ...SAP_CONFIG,
    server: 'https://test-sap-server.com'
  },
  prod: {
    ...SAP_CONFIG,
    server: 'https://prod-sap-server.com'
  }
};

// 자주 사용하는 패키지 및 객체
export const COMMON_OBJECTS = {
  mainPackage: 'ZEXAMPLE_PKG',
  mainProgram: 'ZEXAMPLE_PROGRAM',
  mainClass: 'ZCL_EXAMPLE_CLASS',
  transportRequests: {
    dev: 'DEVK900123',
    test: 'TESTK900456'
  }
};
```

## 예제 기여 방법

자신만의 예제를 기여하거나 기존 예제를 개선하려면 GitHub 저장소에 풀 리퀘스트(PR)를 제출하세요.

1. 저장소를 포크하고 로컬에 클론합니다.
2. 새 예제를 작성하거나 기존 예제를 수정합니다.
3. 변경 사항을 커밋하고 포크로 푸시합니다.
4. 원본 저장소에 풀 리퀘스트를 제출합니다.

예제 작성 시 다음 지침을 따르세요:

- 명확한 문서화: 목적과 사용 방법을 명확히 설명
- 모범 사례 준수: 오류 처리, 리소스 정리 등
- 실제 사용 사례: 실제 업무에서 발생하는 문제 해결
- 재사용성: 다양한 환경에서 활용 가능하도록 작성

## 다음 단계

지금부터 다음 섹션의 예제를 살펴보세요:

- [기본 예제](./basic.md): 라이브러리의 기본 기능 학습
- [고급 예제](./advanced.md): 복잡한 시나리오 및 고급 기능 학습

또는 [API 문서](/api/) 섹션을 참조하여 라이브러리의 다양한 기능에 대해 자세히 알아보세요.