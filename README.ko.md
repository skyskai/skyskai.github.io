# ABAP ADT API 문서

[English](./README.md) | 한국어

이 저장소는 Marcello Urbani가 만든 [abap-adt-api](https://github.com/marcellourbani/abap-adt-api) 라이브러리에 대한 문서를 포함하고 있습니다. 원본 라이브러리는 SAP의 ABAP Development Tools(ADT) REST API를 JavaScript/TypeScript에서 사용할 수 있게 해주며, ABAP 개발 환경과 상호작용하는 애플리케이션을 쉽게 개발할 수 있도록 합니다.

> **참고:** 이 문서 프로젝트는 비공식적이며 원본 라이브러리 제작자와 관련이 없습니다. 공식 저장소는 [https://github.com/marcellourbani/abap-adt-api](https://github.com/marcellourbani/abap-adt-api)를 방문해 주세요.

## 주요 기능

- ABAP 시스템 로그인 및 세션 관리
- ABAP 객체 탐색 및 관리
- 소스 코드 조회 및 수정
- 구문 검사 및 활성화
- 트랜스포트 관리
- ABAP Git 통합
- 디버깅
- 단위 테스트
- 다양한 ADT 기능

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
  
  // 소스 코드 가져오기
  const sourceUrl = ADTClient.mainInclude(objectStructure);
  const source = await client.getObjectSource(sourceUrl);
  
  console.log(source);
}

main().catch(console.error);
```

## 문서

더 자세한 정보는 다음 섹션에서 확인할 수 있습니다:

- [시작하기](/ko/getting-started) - 기본 설정 및 첫 번째 애플리케이션 만들기
- [API 문서](/ko/api/) - 상세한 API 레퍼런스 및 사용법
- [예제](/ko/examples/) - 일반적인 사용 사례 및 시나리오별 예제

## 기여하기

이 문서에 기여하고 싶으신가요? [GitHub 저장소](https://github.com/skyskai/skyskai.github.io)를 방문하여 이슈를 제출하거나 풀 리퀘스트를 보내주세요.

라이브러리 자체에 관한 이슈나 기능 요청은 [원본 저장소](https://github.com/marcellourbani/abap-adt-api)를 방문해 주세요.

## 라이선스

이 문서는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.

원본 abap-adt-api 라이브러리는 MIT 라이선스 하에 있습니다. 라이브러리의 라이선스에 관한 자세한 정보는 [원본 저장소](https://github.com/marcellourbani/abap-adt-api)를 참조해 주세요.

## 지원

질문이나 문제가 있으시면 GitHub 이슈를 통해 문의해 주세요.