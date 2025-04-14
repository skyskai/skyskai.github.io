---
layout: home
hero:
  name: ABAP ADT API
  text: SAP ABAP 개발 도구 API 라이브러리
  tagline: SAP ABAP 개발을 위한 JavaScript/TypeScript 라이브러리
  actions:
    - theme: brand
      text: 시작하기
      link: /ko/getting-started
    - theme: alt
      text: API 문서
      link: /ko/api/
    - theme: alt
      text: GitHub
      link: https://github.com/skyskai/skyskai.github.io

features:
  - icon: 🔄
    title: SAP ABAP과 통합
    details: SAP NetWeaver ABAP 개발 도구(ADT)와 통합된 API를 제공합니다.
  - icon: 💻
    title: 프로그래밍 친화적
    details: JavaScript/TypeScript에서 사용하기 쉬운 API 인터페이스를 제공합니다.
  - icon: 🚀
    title: 강력한 기능
    details: ABAP 객체 관리, 코드 개발, 디버깅, 테스트 등 다양한 기능을 지원합니다.
---

# ABAP ADT API 라이브러리

ABAP ADT API는 SAP의 ABAP Development Tools(ADT) REST API를 JavaScript/TypeScript에서 사용할 수 있게 해주는 라이브러리입니다. 이 라이브러리를 통해 ABAP 개발 환경과 상호작용하는 애플리케이션을 쉽게 개발할 수 있습니다.

## 주요 기능

- ABAP 시스템 로그인 및 세션 관리
- ABAP 객체 탐색 및 관리
- 소스 코드 조회 및 수정
- 구문 검사 및 활성화
- 트랜스포트 관리
- ABAP Git 통합
- 디버깅
- 단위 테스트
- 그 외 다양한 ADT 기능

## 설치

```bash
npm install abap-adt-api
```

## 간단한 사용 예제

```typescript
import { ADTClient } from 'abap-adt-api';

async function main() {
  // 클라이언트 생성 및 로그인
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  // ABAP 객체 정보 조회
  const objectStructure = await client.objectStructure('/sap/bc/adt/programs/programs/Z_YOUR_PROGRAM');
  
  // 소스 코드 조회
  const sourceUrl = ADTClient.mainInclude(objectStructure);
  const source = await client.getObjectSource(sourceUrl);
  
  console.log(source);
}

main().catch(console.error);
```

자세한 내용은 [시작하기](/ko/getting-started) 가이드를 참고하세요.