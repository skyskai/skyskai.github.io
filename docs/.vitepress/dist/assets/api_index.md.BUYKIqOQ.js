import{_ as s,c as t,o as a,ag as e}from"./chunks/framework.DPDPlp3K.js";const c=JSON.parse('{"title":"API 문서 개요","description":"","frontmatter":{},"headers":[],"relativePath":"api/index.md","filePath":"api/index.md"}'),l={name:"api/index.md"};function n(h,i,p,r,d,o){return a(),t("div",null,i[0]||(i[0]=[e(`<h1 id="api-문서-개요" tabindex="-1">API 문서 개요 <a class="header-anchor" href="#api-문서-개요" aria-label="Permalink to &quot;API 문서 개요&quot;">​</a></h1><p>ABAP ADT API 라이브러리는 SAP ABAP Development Tools(ADT)의 REST API를 래핑하여 사용하기 쉬운 JavaScript/TypeScript 인터페이스를 제공합니다. 이 문서에서는 라이브러리의 주요 구성 요소와 기능을 살펴봅니다.</p><h2 id="라이브러리-구조" tabindex="-1">라이브러리 구조 <a class="header-anchor" href="#라이브러리-구조" aria-label="Permalink to &quot;라이브러리 구조&quot;">​</a></h2><p>ABAP ADT API 라이브러리는 크게 다음과 같은 구성 요소로 이루어져 있습니다.</p><h3 id="핵심-클래스" tabindex="-1">핵심 클래스 <a class="header-anchor" href="#핵심-클래스" aria-label="Permalink to &quot;핵심 클래스&quot;">​</a></h3><ul><li><strong>ADTClient</strong>: 라이브러리의 주요 클래스로, ABAP 시스템과의 모든 상호작용을 처리합니다.</li><li><strong>AdtHTTP</strong>: HTTP 통신을 담당하는 내부 클래스로, RESTful API 호출을 처리합니다.</li></ul><h3 id="주요-api-모듈" tabindex="-1">주요 API 모듈 <a class="header-anchor" href="#주요-api-모듈" aria-label="Permalink to &quot;주요 API 모듈&quot;">​</a></h3><p>라이브러리는 다음과 같은 주요 API 모듈로 구분됩니다:</p><ol><li><strong>기본 기능</strong>: 로그인, 세션 관리, 시스템 정보 등</li><li><strong>객체 관리</strong>: ABAP 객체 탐색, 생성, 수정, 삭제 등</li><li><strong>개발 기능</strong>: 코드 편집, 구문 검사, 코드 완성, 리팩토링 등</li><li><strong>트랜스포트</strong>: 트랜스포트 요청 관리</li><li><strong>ABAP Git</strong>: ABAP Git 저장소 관리</li><li><strong>디버깅</strong>: ABAP 프로그램 디버깅</li><li><strong>테스트</strong>: 단위 테스트 실행 및 결과 처리</li><li><strong>고급 기능</strong>: ATC(ABAP Test Cockpit), 추적 등</li></ol><h2 id="api-사용-패턴" tabindex="-1">API 사용 패턴 <a class="header-anchor" href="#api-사용-패턴" aria-label="Permalink to &quot;API 사용 패턴&quot;">​</a></h2><p>ABAP ADT API는 일반적으로 다음과 같은 패턴으로 사용됩니다:</p><ol><li><p><strong>클라이언트 초기화 및 로그인</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> client</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ADTClient</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(url, username, password);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> client.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">login</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div></li><li><p><strong>객체 조회 및 조작</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> objectStructure</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> client.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">objectStructure</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(objectUrl);</span></span></code></pre></div></li><li><p><strong>상태 유지가 필요한 작업 수행</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">client.stateful </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;stateful&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 상태 유지 세션 설정</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> lock</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> client.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(objectUrl);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 객체 잠금</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 작업 수행...</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> client.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(objectUrl, lock.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">LOCK_HANDLE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 잠금 해제</span></span></code></pre></div></li><li><p><strong>비동기 작업 처리</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 대부분의 API 메서드는 Promise를 반환합니다</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> client.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">someAsyncMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 결과 처리...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (error) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 오류 처리...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></li></ol><h2 id="api-문서-사용-방법" tabindex="-1">API 문서 사용 방법 <a class="header-anchor" href="#api-문서-사용-방법" aria-label="Permalink to &quot;API 문서 사용 방법&quot;">​</a></h2><p>각 API 페이지는 다음 구조로 구성되어 있습니다:</p><ul><li><strong>개요</strong>: 해당 API 모듈에 대한 간략한 설명</li><li><strong>주요 클래스 및 인터페이스</strong>: 관련 타입 정의</li><li><strong>메서드</strong>: 사용 가능한 메서드 및 매개변수 설명</li><li><strong>예제</strong>: 일반적인 사용 사례와 코드 예제</li></ul><h2 id="주요-api-모듈-1" tabindex="-1">주요 API 모듈 <a class="header-anchor" href="#주요-api-모듈-1" aria-label="Permalink to &quot;주요 API 모듈&quot;">​</a></h2><p>다음 페이지에서 각 API 모듈에 대한 자세한 내용을 확인할 수 있습니다:</p><ul><li><a href="./core.html">기본 기능</a>: 로그인, 세션 관리, 시스템 정보 등</li><li><a href="./object-management.html">객체 관리</a>: ABAP 객체 관리 기능</li><li><a href="./development.html">개발 기능</a>: 코드 개발 관련 기능</li><li><a href="./transport.html">트랜스포트</a>: 트랜스포트 관리</li><li><a href="./git.html">ABAP Git</a>: ABAP Git 통합</li><li><a href="./debugging.html">디버깅</a>: ABAP 디버깅 기능</li><li><a href="./testing.html">테스트</a>: 단위 테스트 관련 기능</li><li><a href="./advanced.html">고급 기능</a>: 기타 고급 기능</li></ul><h2 id="api-참조-표" tabindex="-1">API 참조 표 <a class="header-anchor" href="#api-참조-표" aria-label="Permalink to &quot;API 참조 표&quot;">​</a></h2><table tabindex="0"><thead><tr><th>API 모듈</th><th>주요 기능</th><th>관련 클래스/인터페이스</th></tr></thead><tbody><tr><td>기본 기능</td><td>로그인, 세션 관리, 시스템 정보</td><td><code>ADTClient</code>, <code>AdtHTTP</code></td></tr><tr><td>객체 관리</td><td>객체 탐색, 생성, 수정, 삭제</td><td><code>ObjectStructure</code>, <code>NodeStructure</code></td></tr><tr><td>개발 기능</td><td>코드 편집, 구문 검사, 리팩토링</td><td><code>SyntaxCheckResult</code>, <code>CompletionProposal</code></td></tr><tr><td>트랜스포트</td><td>트랜스포트 요청 관리</td><td><code>TransportInfo</code>, <code>TransportsOfUser</code></td></tr><tr><td>ABAP Git</td><td>Git 저장소 관리</td><td><code>GitRepo</code>, <code>GitStaging</code></td></tr><tr><td>디버깅</td><td>프로그램 디버깅</td><td><code>DebugAttach</code>, <code>DebugStackInfo</code></td></tr><tr><td>테스트</td><td>단위 테스트 실행</td><td><code>UnitTestClass</code>, <code>UnitTestMethod</code></td></tr><tr><td>고급 기능</td><td>ATC, 추적 등</td><td><code>AtcWorkList</code>, <code>TraceResults</code></td></tr></tbody></table>`,20)]))}const g=s(l,[["render",n]]);export{c as __pageData,g as default};
