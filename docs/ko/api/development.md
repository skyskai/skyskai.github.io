# 개발 기능

이 페이지에서는 ABAP ADT API를 사용하여 코드 개발을 지원하는 기능들을 설명합니다. 구문 검사, 코드 완성, 리팩토링 등의 기능이 포함됩니다.

## 구문 검사

### 구문 검사 수행

```typescript
async syntaxCheck(cdsUrl: string): Promise<SyntaxCheckResult[]>

async syntaxCheck(
  url: string,
  mainUrl: string,
  content: string,
  mainProgram?: string,
  version?: string
): Promise<SyntaxCheckResult[]>
```

ABAP 코드의 구문을 검사합니다. CDS 객체와 일반 ABAP 객체에 대해 다른 형식의 호출을 지원합니다.

**매개변수 (CDS 형식):**
- `cdsUrl`: CDS 객체 URL

**매개변수 (일반 형식):**
- `url`: 객체 URL
- `mainUrl`: 메인 URL
- `content`: 검사할 소스 코드
- `mainProgram`: 메인 프로그램 (선택적)
- `version`: 객체 버전 (기본값: 'active')

**반환 값:**
- `SyntaxCheckResult[]`: 구문 검사 결과 배열

**예제:**
```typescript
// 객체 구조 조회
const objectStructure = await client.objectStructure('/sap/bc/adt/programs/programs/ZEXAMPLE');
const sourceUrl = ADTClient.mainInclude(objectStructure);

// 소스 코드 조회
const source = await client.getObjectSource(sourceUrl);

// 구문 검사 수행
const syntaxResults = await client.syntaxCheck(
  objectStructure.objectUrl,  // 객체 URL
  sourceUrl,                  // 메인 URL
  source                      // 소스 코드
);

// 검사 결과 출력
if (syntaxResults.length === 0) {
  console.log('구문 오류가 없습니다.');
} else {
  syntaxResults.forEach(result => {
    console.log(`${result.line}:${result.offset} - ${result.severity}: ${result.text}`);
  });
}
```

### 구문 검사 유형 조회

```typescript
async syntaxCheckTypes(): Promise<Map<string, string[]>>
```

사용 가능한 구문 검사 유형을 조회합니다.

**반환 값:**
- `Map<string, string[]>`: 검사기와 지원되는 유형의 맵

**예제:**
```typescript
const checkTypes = await client.syntaxCheckTypes();
console.log('사용 가능한 검사기:');
for (const [checker, types] of checkTypes.entries()) {
  console.log(`- ${checker}: ${types.join(', ')}`);
}
```

## 코드 완성

### 코드 완성 제안

```typescript
async codeCompletion(
  sourceUrl: string,
  source: string,
  line: number,
  column: number
): Promise<CompletionProposal[]>
```

코드 완성 제안을 가져옵니다.

**매개변수:**
- `sourceUrl`: 소스 코드 URL
- `source`: 소스 코드
- `line`: 커서 위치 줄 번호
- `column`: 커서 위치 열 번호

**반환 값:**
- `CompletionProposal[]`: 완성 제안 배열

**예제:**
```typescript
// 소스 코드 URL과 소스 코드
const sourceUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE/source/main';
const source = 'REPORT zexample.\n\nDATA: lv_text TYPE string.\n\nlv_text = ';

// 줄 3, 열 11 위치에서 완성 제안 가져오기 (lv_text = |<커서>)
const completions = await client.codeCompletion(sourceUrl, source, 3, 11);

// 제안 출력
completions.forEach(completion => {
  console.log(completion.IDENTIFIER);
});
```

### 코드 완성 항목 정보

```typescript
async codeCompletionElement(
  sourceUrl: string,
  source: string,
  line: number,
  column: number
): Promise<CompletionElementInfo | string>
```

코드 완성 항목에 대한 상세 정보를 가져옵니다.

**매개변수:**
- `sourceUrl`: 소스 코드 URL
- `source`: 소스 코드
- `line`: 커서 위치 줄 번호
- `column`: 커서 위치 열 번호

**반환 값:**
- `CompletionElementInfo | string`: 완성 항목 정보 또는 정보 문자열

**예제:**
```typescript
// 코드 완성 항목 정보 가져오기
const elementInfo = await client.codeCompletionElement(sourceUrl, source, 3, 11);

// 항목 정보 출력
if (typeof elementInfo !== 'string') {
  console.log(`이름: ${elementInfo.name}`);
  console.log(`유형: ${elementInfo.type}`);
  console.log(`문서: ${elementInfo.doc}`);
}
```

### 전체 코드 완성

```typescript
async codeCompletionFull(
  sourceUrl: string,
  source: string,
  line: number,
  column: number,
  patternKey: string
): Promise<string>
```

전체 코드 완성 내용을 가져옵니다.

**매개변수:**
- `sourceUrl`: 소스 코드 URL
- `source`: 소스 코드
- `line`: 커서 위치 줄 번호
- `column`: 커서 위치 열 번호
- `patternKey`: 패턴 키

**반환 값:**
- `string`: 완성된 코드

**예제:**
```typescript
const fullCompletion = await client.codeCompletionFull(
  sourceUrl,
  source,
  3,
  11,
  'pattern1'
);
console.log('완성된 코드:', fullCompletion);
```

## 정의 및 사용처 탐색

### 정의 찾기

```typescript
async findDefinition(
  url: string,
  source: string,
  line: number,
  startCol: number,
  endCol: number,
  implementation: boolean = false,
  mainProgram: string = ""
): Promise<DefinitionLocation>
```

코드 요소의 정의 위치를 찾습니다.

**매개변수:**
- `url`: 소스 코드 URL
- `source`: 소스 코드
- `line`: 줄 번호
- `startCol`: 시작 열
- `endCol`: 끝 열
- `implementation`: 구현을 찾을지 여부 (선택적, 기본값: false)
- `mainProgram`: 메인 프로그램 (선택적)

**반환 값:**
- `DefinitionLocation`: 정의 위치

**예제:**
```typescript
// 소스 코드에서 REPORT 키워드의 정의 찾기
const definition = await client.findDefinition(
  sourceUrl,
  source,
  1,       // 줄
  0,       // 시작 열
  6,       // 끝 열
  false    // 정의 찾기 (구현 아님)
);

console.log(`정의 위치: ${definition.url}#${definition.line},${definition.column}`);
```

### 사용처 찾기

```typescript
async usageReferences(
  url: string,
  line?: number,
  column?: number
): Promise<UsageReference[]>
```

코드 요소의 사용처를 찾습니다.

**매개변수:**
- `url`: 객체 URL
- `line`: 줄 번호 (선택적)
- `column`: 열 번호 (선택적)

**반환 값:**
- `UsageReference[]`: 사용처 참조 배열

**예제:**
```typescript
// 객체의 모든 사용처 찾기
const usages = await client.usageReferences('/sap/bc/adt/programs/programs/ZEXAMPLE');

// 특정 위치의 요소 사용처 찾기
const elementUsages = await client.usageReferences(
  '/sap/bc/adt/programs/programs/ZEXAMPLE',
  10,  // 줄
  5    // 열
);

// 사용처 출력
usages.forEach(usage => {
  console.log(`${usage['adtcore:type']}: ${usage['adtcore:name']}`);
});
```

### 사용처 코드 조각

```typescript
async usageReferenceSnippets(
  references: UsageReference[]
): Promise<UsageReferenceSnippet[]>
```

사용처 참조에 대한 코드 조각을 가져옵니다.

**매개변수:**
- `references`: 사용처 참조 배열

**반환 값:**
- `UsageReferenceSnippet[]`: 사용처 코드 조각 배열

**예제:**
```typescript
// 사용처 찾기
const usages = await client.usageReferences('/sap/bc/adt/programs/programs/ZEXAMPLE');

// 사용처 코드 조각 가져오기
const snippets = await client.usageReferenceSnippets(usages);

// 코드 조각 출력
snippets.forEach(snippet => {
  snippet.snippets.forEach(s => {
    console.log(`${s.description}:\n${s.content}`);
  });
});
```

## 빠른 수정 및 리팩토링

### 빠른 수정 제안

```typescript
async fixProposals(
  url: string,
  source: string,
  line: number,
  column: number
): Promise<FixProposal[]>
```

코드 문제에 대한 빠른 수정 제안을 가져옵니다.

**매개변수:**
- `url`: 소스 코드 URL
- `source`: 소스 코드
- `line`: 줄 번호
- `column`: 열 번호

**반환 값:**
- `FixProposal[]`: 수정 제안 배열

**예제:**
```typescript
// 코드 문제에 대한 수정 제안 가져오기
const fixes = await client.fixProposals(
  sourceUrl,
  source,
  5,  // 줄
  10  // 열
);

// 제안 출력
fixes.forEach(fix => {
  console.log(`${fix['adtcore:name']}: ${fix['adtcore:description']}`);
});
```

### 빠른 수정 적용

```typescript
async fixEdits(
  proposal: FixProposal,
  source: string
): Promise<Delta[]>
```

빠른 수정 제안을 적용합니다.

**매개변수:**
- `proposal`: 수정 제안
- `source`: 소스 코드

**반환 값:**
- `Delta[]`: 변경 사항 배열

**예제:**
```typescript
// 수정 제안 가져오기
const fixes = await client.fixProposals(sourceUrl, source, 5, 10);
if (fixes.length > 0) {
  // 첫 번째 제안 적용
  const edits = await client.fixEdits(fixes[0], source);
  
  // 변경 사항 출력
  edits.forEach(edit => {
    console.log(`변경 위치: ${edit.range.start.line},${edit.range.start.column}`);
    console.log(`변경 내용: ${edit.content}`);
  });
}
```

### 리팩토링: 이름 변경

```typescript
async renameEvaluate(
  uri: string,
  line: number,
  startColumn: number,
  endColumn: number
): Promise<RenameRefactoringProposal>
```

이름 변경 리팩토링을 평가합니다.

**매개변수:**
- `uri`: 소스 코드 URL
- `line`: 줄 번호
- `startColumn`: 시작 열
- `endColumn`: 끝 열

**반환 값:**
- `RenameRefactoringProposal`: 이름 변경 리팩토링 제안

```typescript
async renamePreview(
  renameRefactoring: RenameRefactoringProposal,
  transport: string = ""
): Promise<RenameRefactoring>
```

이름 변경 리팩토링 미리보기를 가져옵니다.

**매개변수:**
- `renameRefactoring`: 이름 변경 리팩토링 제안
- `transport`: 트랜스포트 번호 (선택적)

**반환 값:**
- `RenameRefactoring`: 이름 변경 리팩토링

```typescript
async renameExecute(
  refactoring: RenameRefactoring
): Promise<RenameRefactoring>
```

이름 변경 리팩토링을 실행합니다.

**매개변수:**
- `refactoring`: 이름 변경 리팩토링

**반환 값:**
- `RenameRefactoring`: 실행된 이름 변경 리팩토링

**예제:**
```typescript
// 이름 변경 리팩토링 평가
const proposal = await client.renameEvaluate(
  sourceUrl,
  10,       // 줄
  5,        // 시작 열
  15        // 끝 열
);

// 새 이름 설정
proposal.newName = 'NEW_NAME';

// 미리보기
const preview = await client.renamePreview(proposal, 'DEVK900000');

// 리팩토링 실행
const result = await client.renameExecute(preview);

console.log('이름 변경 완료:', result);
```

### 리팩토링: 메서드 추출

```typescript
async extractMethodEvaluate(
  uri: string,
  range: Range
): Promise<ExtractMethodProposal>
```

메서드 추출 리팩토링을 평가합니다.

**매개변수:**
- `uri`: 소스 코드 URL
- `range`: 코드 범위

**반환 값:**
- `ExtractMethodProposal`: 메서드 추출 제안

```typescript
async extractMethodPreview(
  proposal: ExtractMethodProposal
): Promise<GenericRefactoring>
```

메서드 추출 리팩토링 미리보기를 가져옵니다.

**매개변수:**
- `proposal`: 메서드 추출 제안

**반환 값:**
- `GenericRefactoring`: 리팩토링 정보

```typescript
async extractMethodExecute(
  refactoring: GenericRefactoring
): Promise<GenericRefactoring>
```

메서드 추출 리팩토링을 실행합니다.

**매개변수:**
- `refactoring`: 리팩토링 정보

**반환 값:**
- `GenericRefactoring`: 실행된 리팩토링 정보

**예제:**
```typescript
// 메서드 추출 리팩토링 평가
const proposal = await client.extractMethodEvaluate(
  '/sap/bc/adt/oo/classes/ZCL_EXAMPLE/source/main',
  {
    start: { line: 15, column: 2 },
    end: { line: 20, column: 30 }
  }
);

// 메서드 이름 설정
proposal.name = 'EXTRACTED_METHOD';
proposal.isStatic = false;
proposal.visibility = 'PRIVATE';

// 미리보기
const preview = await client.extractMethodPreview(proposal);

// 리팩토링 실행
const result = await client.extractMethodExecute(preview);

console.log('메서드 추출 완료');
```

## 문서화 및 코드 스타일

### ABAP 문서 조회

```typescript
async abapDocumentation(
  objectUri: string,
  body: string,
  line: number,
  column: number,
  language: string = "EN"
): Promise<string>
```

ABAP 문서를 조회합니다.

**매개변수:**
- `objectUri`: 객체 URI
- `body`: 소스 코드
- `line`: 줄 번호
- `column`: 열 번호
- `language`: 언어 (기본값: "EN")

**반환 값:**
- `string`: ABAP 문서 HTML

**예제:**
```typescript
// 객체 URI와 소스 코드
const objectUri = '/sap/bc/adt/programs/programs/ZEXAMPLE';
const source = 'REPORT zexample.\n\nDATA: lv_text TYPE string.';

// 줄 1, 열 0 위치에서 문서 조회 (REPORT 키워드)
const documentation = await client.abapDocumentation(
  objectUri,
  source,
  1,     // 줄
  0,     // 열
  'KO'   // 한국어 문서
);

console.log('문서:', documentation);
```

### 코드 스타일: Pretty Printer

```typescript
async prettyPrinterSetting(): Promise<PrettyPrinterSettings>
```

Pretty Printer 설정을 조회합니다.

**반환 값:**
- `PrettyPrinterSettings`: Pretty Printer 설정

```typescript
async setPrettyPrinterSetting(
  indent: boolean,
  style: PrettyPrinterStyle
): Promise<string>
```

Pretty Printer 설정을 변경합니다.

**매개변수:**
- `indent`: 들여쓰기 사용 여부
- `style`: 스타일 ('toLower', 'toUpper', 'keywordUpper', 'keywordLower', 'keywordAuto', 'none' 중 하나)

**반환 값:**
- `string`: 응답 메시지

```typescript
async prettyPrinter(body: string): Promise<string>
```

Pretty Printer를 사용하여 코드 서식을 지정합니다.

**매개변수:**
- `body`: 원본 소스 코드

**반환 값:**
- `string`: 서식이 지정된 소스 코드

**예제:**
```typescript
// Pretty Printer 설정 조회
const settings = await client.prettyPrinterSetting();
console.log('현재 설정:', settings);

// 설정 변경
await client.setPrettyPrinterSetting(true, 'keywordUpper');

// 코드 서식 지정
const formattedSource = await client.prettyPrinter(source);
console.log('서식이 지정된 소스 코드:', formattedSource);
```

## 유형 계층 구조

```typescript
async typeHierarchy(
  url: string,
  body: string,
  line: number,
  offset: number,
  superTypes: boolean = false
): Promise<HierarchyNode[]>
```

유형 계층 구조를 조회합니다.

**매개변수:**
- `url`: 소스 코드 URL
- `body`: 소스 코드
- `line`: 줄 번호
- `offset`: 열 번호
- `superTypes`: 상위 유형 포함 여부 (선택적, 기본값: false)

**반환 값:**
- `HierarchyNode[]`: 계층 구조 노드 배열

**예제:**
```typescript
// 클래스 계층 구조 조회
const hierarchy = await client.typeHierarchy(
  '/sap/bc/adt/oo/classes/ZCL_EXAMPLE/source/main',
  source,
  5,     // 줄
  10,    // 열
  true   // 상위 유형 포함
);

// 계층 구조 출력
hierarchy.forEach(node => {
  console.log(`${node.type}: ${node.name}`);
});
```

## 클래스 구성요소

```typescript
async classComponents(url: string): Promise<ClassComponent>
```

클래스 구성요소를 조회합니다.

**매개변수:**
- `url`: 클래스 URL

**반환 값:**
- `ClassComponent`: 클래스 구성요소 정보

**예제:**
```typescript
// 클래스 구성요소 조회
const components = await client.classComponents('/sap/bc/adt/oo/classes/ZCL_EXAMPLE');

// 구성요소 정보 출력
console.log(`클래스: ${components['adtcore:name']}`);
console.log(`가시성: ${components.visibility}`);

// 메서드 목록
const methods = components.components.filter(c => c['adtcore:type'] === 'method');
methods.forEach(method => {
  console.log(`메서드: ${method['adtcore:name']}`);
});
```

## 조각 매핑

```typescript
async fragmentMappings(
  url: string,
  type: string,
  name: string
): Promise<FragmentLocation>
```

객체 조각의 위치를 찾습니다.

**매개변수:**
- `url`: 객체 URL
- `type`: 조각 유형
- `name`: 조각 이름

**반환 값:**
- `FragmentLocation`: 조각 위치

**예제:**
```typescript
// 클래스의 메서드 위치 찾기
const location = await client.fragmentMappings(
  '/sap/bc/adt/oo/classes/ZCL_EXAMPLE',
  'method',
  'CONSTRUCTOR'
);

console.log(`메서드 위치: ${location.uri}#${location.line},${location.column}`);
```

## 예제: 코드 개발 워크플로우

다음 예제는 코드 개발 워크플로우를 보여줍니다:

```typescript
import { ADTClient } from 'abap-adt-api';

async function developmentWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // 상태 유지 세션으로 설정
    client.stateful = "stateful";
    
    // 1. 객체 구조 조회
    const programUrl = '/sap/bc/adt/programs/programs/ZEXAMPLE';
    const programStructure = await client.objectStructure(programUrl);
    const sourceUrl = ADTClient.mainInclude(programStructure);
    
    // 2. 소스 코드 조회
    let source = await client.getObjectSource(sourceUrl);
    console.log('현재 소스 코드:', source);
    
    // 3. 구문 검사
    const syntaxResults = await client.syntaxCheck(programUrl, sourceUrl, source);
    if (syntaxResults.length === 0) {
      console.log('구문 오류 없음');
    } else {
      console.log('구문 오류:', syntaxResults);
    }
    
    // 4. 코드 완성 제안
    const completions = await client.codeCompletion(sourceUrl, source, 3, 10);
    console.log('완성 제안:', completions.map(c => c.IDENTIFIER));
    
    // 5. 객체 잠금
    const lock = await client.lock(programUrl);
    
    // 6. 코드 수정
    source += '\n* 수정됨: ' + new Date().toISOString();
    
    // 7. Pretty Printer로 서식 지정
    source = await client.prettyPrinter(source);
    
    // 8. 수정된 소스 저장
    await client.setObjectSource(sourceUrl, source, lock.LOCK_HANDLE);
    console.log('소스 코드 저장됨');
    
    // 9. 활성화
    const result = await client.activate(
      programStructure.metaData['adtcore:name'],
      programUrl
    );
    console.log('활성화 결과:', result.success ? '성공' : '실패');
    
    // 10. 객체 잠금 해제
    await client.unLock(programUrl, lock.LOCK_HANDLE);
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
  }
}

developmentWorkflow();
```

## 참고 사항

- 코드 완성과 구문 검사는 상태 비유지 세션에서도 작동하지만, 코드 수정은 항상 상태 유지 세션이 필요합니다.
- 리팩토링 작업은 보통 트랜스포트를 필요로 합니다.
- ABAP 문서 조회는 시스템에 설치된 언어에 따라 제한될 수 있습니다.
- Pretty Printer 설정은 서버 설정에 영향을 미치므로 공유 시스템에서는 주의해서 변경하세요.