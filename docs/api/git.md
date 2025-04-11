# ABAP Git 통합

이 페이지에서는 ABAP ADT API를 사용하여 ABAP Git 저장소를 관리하는 방법을 설명합니다.

## 저장소 관리

### 저장소 목록 조회

```typescript
async gitRepos(): Promise<GitRepo[]>
```

시스템에 등록된 ABAP Git 저장소 목록을 조회합니다.

**반환 값:**
- `GitRepo[]`: 저장소 정보 배열

**예제:**
```typescript
// 저장소 목록 조회
const repositories = await client.gitRepos();
console.log(`등록된 저장소 수: ${repositories.length}`);

// 저장소 정보 출력
repositories.forEach(repo => {
  console.log(`저장소: ${repo.key}`);
  console.log(`- URL: ${repo.url}`);
  console.log(`- 패키지: ${repo.sapPackage}`);
  console.log(`- 브랜치: ${repo.branch_name}`);
  console.log(`- 상태: ${repo.status_text}`);
});
```

### 외부 저장소 정보 조회

```typescript
async gitExternalRepoInfo(
  repourl: string,
  user: string = "",
  password: string = ""
): Promise<GitExternalInfo>
```

외부 Git 저장소의 정보를 조회합니다.

**매개변수:**
- `repourl`: 저장소 URL
- `user`: 사용자 이름 (선택적)
- `password`: 비밀번호 (선택적)

**반환 값:**
- `GitExternalInfo`: 외부 저장소 정보

**예제:**
```typescript
// 외부 저장소 정보 조회
const repoInfo = await client.gitExternalRepoInfo(
  'https://github.com/example/abap-project.git',
  'gituser',      // 사용자 이름
  'gitpassword'   // 비밀번호
);

console.log(`접근 모드: ${repoInfo.access_mode}`);
console.log('브랜치:');
repoInfo.branches.forEach(branch => {
  console.log(`- ${branch.name} (${branch.type})`);
  if (branch.is_head) {
    console.log('  (HEAD)');
  }
});
```

### 저장소 생성

```typescript
async gitCreateRepo(
  packageName: string,
  repourl: string,
  branch: string = "refs/heads/master",
  transport: string = "",
  user: string = "",
  password: string = ""
): Promise<GitObject[]>
```

새 ABAP Git 저장소를 생성합니다.

**매개변수:**
- `packageName`: 패키지 이름
- `repourl`: 저장소 URL
- `branch`: 브랜치 이름 (기본값: "refs/heads/master")
- `transport`: 트랜스포트 번호 (선택적)
- `user`: Git 사용자 이름 (선택적)
- `password`: Git 비밀번호 (선택적)

**반환 값:**
- `GitObject[]`: 생성된 Git 객체 배열

**예제:**
```typescript
// 새 저장소 생성
const objects = await client.gitCreateRepo(
  'ZEXAMPLE_PKG',                               // 패키지
  'https://github.com/example/abap-project.git', // 저장소 URL
  'refs/heads/main',                            // 브랜치
  'DEVK900123',                                 // 트랜스포트
  'gituser',                                    // 사용자 이름
  'gitpassword'                                 // 비밀번호
);

console.log('생성된 객체:');
objects.forEach(obj => {
  console.log(`${obj.obj_type} ${obj.obj_name}: ${obj.obj_status}`);
});
```

### 저장소 풀(Pull)

```typescript
async gitPullRepo(
  repoId: string,
  branch: string = "refs/heads/master",
  transport: string = "",
  user: string = "",
  password: string = ""
): Promise<GitObject[]>
```

ABAP Git 저장소에서 변경 사항을 가져옵니다(Pull).

**매개변수:**
- `repoId`: 저장소 ID
- `branch`: 브랜치 이름 (기본값: "refs/heads/master")
- `transport`: 트랜스포트 번호 (선택적)
- `user`: Git 사용자 이름 (선택적)
- `password`: Git 비밀번호 (선택적)

**반환 값:**
- `GitObject[]`: 가져온 Git 객체 배열

**예제:**
```typescript
// 저장소 목록 조회
const repositories = await client.gitRepos();
if (repositories.length > 0) {
  // 첫 번째 저장소에서 풀
  const pullResult = await client.gitPullRepo(
    repositories[0].key,      // 저장소 ID
    'refs/heads/main',        // 브랜치
    'DEVK900123',             // 트랜스포트
    'gituser',                // 사용자 이름
    'gitpassword'             // 비밀번호
  );
  
  console.log('풀 결과:');
  pullResult.forEach(obj => {
    console.log(`${obj.obj_type} ${obj.obj_name}: ${obj.obj_status}`);
    if (obj.msg_text) {
      console.log(`- 메시지: ${obj.msg_text}`);
    }
  });
}
```

### 저장소 연결 해제

```typescript
async gitUnlinkRepo(repoId: string): Promise<void>
```

ABAP Git 저장소 연결을 해제합니다.

**매개변수:**
- `repoId`: 저장소 ID

**예제:**
```typescript
// 저장소 연결 해제
await client.gitUnlinkRepo('Z_EXAMPLE_REPO');
console.log('저장소 연결이 해제되었습니다.');
```

## 스테이징 및 푸시

### 저장소 확인

```typescript
async checkRepo(
  repo: GitRepo,
  user: string = "",
  password: string = ""
): Promise<void>
```

ABAP Git 저장소를 확인합니다.

**매개변수:**
- `repo`: 저장소 정보
- `user`: Git 사용자 이름 (선택적)
- `password`: Git 비밀번호 (선택적)

**예제:**
```typescript
// 저장소 목록 조회
const repositories = await client.gitRepos();
if (repositories.length > 0) {
  // 첫 번째 저장소 확인
  await client.checkRepo(
    repositories[0],  // 저장소
    'gituser',        // 사용자 이름
    'gitpassword'     // 비밀번호
  );
  console.log('저장소 확인 완료');
}
```

### 스테이징 조회

```typescript
async stageRepo(
  repo: GitRepo,
  user: string = "",
  password: string = ""
): Promise<GitStaging>
```

ABAP Git 저장소의 스테이징 영역을 조회합니다.

**매개변수:**
- `repo`: 저장소 정보
- `user`: Git 사용자 이름 (선택적)
- `password`: Git 비밀번호 (선택적)

**반환 값:**
- `GitStaging`: 스테이징 정보

**예제:**
```typescript
// 저장소 목록 조회
const repositories = await client.gitRepos();
if (repositories.length > 0) {
  // 첫 번째 저장소의 스테이징 조회
  const staging = await client.stageRepo(
    repositories[0],  // 저장소
    'gituser',        // 사용자 이름
    'gitpassword'     // 비밀번호
  );
  
  console.log('스테이징 정보:');
  console.log(`- 스테이징된 객체: ${staging.staged.length}개`);
  console.log(`- 스테이징되지 않은 객체: ${staging.unstaged.length}개`);
  console.log(`- 무시된 객체: ${staging.ignored.length}개`);
  
  // 스테이징된 객체 출력
  staging.staged.forEach(obj => {
    console.log(`스테이징된 객체: ${obj.name} (${obj.type})`);
    obj.abapGitFiles.forEach(file => {
      console.log(`- 파일: ${file.path}`);
    });
  });
  
  // 스테이징되지 않은 객체 출력
  staging.unstaged.forEach(obj => {
    console.log(`스테이징되지 않은 객체: ${obj.name} (${obj.type})`);
    obj.abapGitFiles.forEach(file => {
      console.log(`- 파일: ${file.path}`);
    });
  });
}
```

### 변경 사항 푸시(Push)

```typescript
async pushRepo(
  repo: GitRepo,
  staging: GitStaging,
  user: string = "",
  password: string = ""
): Promise<void>
```

ABAP Git 저장소의 변경 사항을 외부 저장소로 푸시합니다.

**매개변수:**
- `repo`: 저장소 정보
- `staging`: 스테이징 정보
- `user`: Git 사용자 이름 (선택적)
- `password`: Git 비밀번호 (선택적)

**예제:**
```typescript
// 저장소 목록 조회
const repositories = await client.gitRepos();
if (repositories.length > 0) {
  // 스테이징 정보 조회
  const staging = await client.stageRepo(
    repositories[0],
    'gituser',
    'gitpassword'
  );
  
  // 커밋 메시지 설정
  staging.comment = '변경 사항 커밋: ' + new Date().toISOString();
  
  // 작성자 및 커미터 설정
  staging.author = {
    name: 'Your Name',
    email: 'your.email@example.com'
  };
  staging.committer = {
    name: 'Your Name',
    email: 'your.email@example.com'
  };
  
  // 푸시
  await client.pushRepo(
    repositories[0],
    staging,
    'gituser',
    'gitpassword'
  );
  
  console.log('변경 사항이 성공적으로 푸시되었습니다.');
}
```

## 브랜치 관리

### 저장소 브랜치 전환

```typescript
async switchRepoBranch(
  repo: GitRepo,
  branch: string,
  create: boolean = false,
  user: string = "",
  password: string = ""
): Promise<void>
```

ABAP Git 저장소의 브랜치를 전환합니다.

**매개변수:**
- `repo`: 저장소 정보
- `branch`: 브랜치 이름
- `create`: 브랜치 생성 여부 (기본값: false)
- `user`: Git 사용자 이름 (선택적)
- `password`: Git 비밀번호 (선택적)

**예제:**
```typescript
// 저장소 목록 조회
const repositories = await client.gitRepos();
if (repositories.length > 0) {
  // 브랜치 전환
  await client.switchRepoBranch(
    repositories[0],  // 저장소
    'feature/new-feature',  // 브랜치 이름
    true,            // 새 브랜치 생성
    'gituser',       // 사용자 이름
    'gitpassword'    // 비밀번호
  );
  
  console.log('브랜치가 전환되었습니다.');
}
```

### 원격 저장소 정보

```typescript
async remoteRepoInfo(
  repo: GitRepo,
  user: string = "",
  password: string = ""
): Promise<GitRemoteInfo>
```

원격 저장소의 정보를 조회합니다.

**주의:** 이 메서드는 버전 1.2.1부터 `gitExternalRepoInfo`와 중복되어 더 이상 사용되지 않습니다.

**매개변수:**
- `repo`: 저장소 정보
- `user`: Git 사용자 이름 (선택적)
- `password`: Git 비밀번호 (선택적)

**반환 값:**
- `GitRemoteInfo`: 원격 저장소 정보

**예제:**
```typescript
// 저장소 목록 조회
const repositories = await client.gitRepos();
if (repositories.length > 0) {
  // 원격 저장소 정보 조회
  const remoteInfo = await client.remoteRepoInfo(
    repositories[0],
    'gituser',
    'gitpassword'
  );
  
  console.log(`접근 모드: ${remoteInfo.access_mode}`);
  console.log('브랜치:');
  remoteInfo.branches.forEach(branch => {
    console.log(`- ${branch.name}`);
  });
}
```

## 전체 워크플로우 예제

다음 예제는 ABAP Git 저장소를 사용하는 전체 워크플로우를 보여줍니다:

```typescript
import { ADTClient } from 'abap-adt-api';

async function gitWorkflow() {
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  try {
    // Git 저장소 정보
    const gitUrl = 'https://github.com/example/abap-project.git';
    const gitUser = 'gituser';
    const gitPassword = 'gitpassword';
    const packageName = 'ZEXAMPLE_PKG';
    const transportNumber = 'DEVK900123';
    
    // 1. 저장소 목록 조회
    const repositories = await client.gitRepos();
    console.log(`등록된 저장소 수: ${repositories.length}`);
    
    let repo;
    
    // 2. 기존 저장소 검색 또는 새 저장소 생성
    const existingRepo = repositories.find(r => r.url === gitUrl && r.sapPackage === packageName);
    if (existingRepo) {
      console.log('기존 저장소를 사용합니다:', existingRepo.key);
      repo = existingRepo;
    } else {
      console.log('새 저장소를 생성합니다...');
      
      // 외부 저장소 정보 조회
      const externalInfo = await client.gitExternalRepoInfo(gitUrl, gitUser, gitPassword);
      console.log('외부 저장소 정보:');
      console.log(`- 접근 모드: ${externalInfo.access_mode}`);
      console.log(`- 브랜치 수: ${externalInfo.branches.length}`);
      
      // 기본 브랜치 찾기
      const defaultBranch = externalInfo.branches.find(b => b.is_head) || externalInfo.branches[0];
      console.log(`- 기본 브랜치: ${defaultBranch?.name || 'refs/heads/master'}`);
      
      // 새 저장소 생성
      const branchName = defaultBranch?.name || 'refs/heads/master';
      const objects = await client.gitCreateRepo(
        packageName,
        gitUrl,
        branchName,
        transportNumber,
        gitUser,
        gitPassword
      );
      
      console.log('생성된 객체:');
      objects.forEach(obj => {
        console.log(`- ${obj.obj_type} ${obj.obj_name}: ${obj.obj_status}`);
      });
      
      // 저장소 목록 재조회
      const updatedRepos = await client.gitRepos();
      repo = updatedRepos.find(r => r.url === gitUrl && r.sapPackage === packageName);
      
      if (!repo) {
        throw new Error('저장소 생성 후 찾을 수 없습니다.');
      }
      
      console.log('새 저장소가 생성되었습니다:', repo.key);
    }
    
    // 3. 저장소 풀(Pull) 수행
    console.log('저장소에서 변경 사항을 가져오는 중...');
    const pullResults = await client.gitPullRepo(
      repo.key,
      repo.branch_name,
      transportNumber,
      gitUser,
      gitPassword
    );
    
    console.log('풀 결과:');
    pullResults.forEach(obj => {
      console.log(`- ${obj.obj_type} ${obj.obj_name}: ${obj.obj_status}`);
      if (obj.msg_text) {
        console.log(`  메시지: ${obj.msg_text}`);
      }
    });
    
    // 4. 스테이징 상태 조회
    console.log('스테이징 상태를 조회하는 중...');
    const staging = await client.stageRepo(repo, gitUser, gitPassword);
    
    console.log('스테이징 정보:');
    console.log(`- 스테이징된 객체: ${staging.staged.length}개`);
    console.log(`- 스테이징되지 않은 객체: ${staging.unstaged.length}개`);
    
    // 5. 로컬 변경 사항이 있는 경우 푸시(Push) 수행
    if (staging.unstaged.length > 0) {
      console.log('스테이징되지 않은 변경 사항을 처리하는 중...');
      
      // 모든 변경 사항을 스테이징에 추가
      // (이 예에서는 단순화를 위해 모든 unstaged 항목을 staged로 이동)
      staging.staged = [...staging.staged, ...staging.unstaged];
      staging.unstaged = [];
      
      // 커밋 정보 설정
      staging.comment = '변경 사항 커밋: ' + new Date().toISOString();
      staging.author = {
        name: 'Your Name',
        email: 'your.email@example.com'
      };
      staging.committer = {
        name: 'Your Name',
        email: 'your.email@example.com'
      };
      
      // 변경 사항 푸시
      console.log('변경 사항을 푸시하는 중...');
      await client.pushRepo(repo, staging, gitUser, gitPassword);
      console.log('변경 사항이 성공적으로 푸시되었습니다.');
    } else {
      console.log('푸시할 변경 사항이 없습니다.');
    }
    
    // 6. 브랜치 전환 예제 (실제로 실행하진 않음)
    if (false) { // 예시용
      console.log('새 브랜치로 전환하는 중...');
      await client.switchRepoBranch(
        repo,
        'feature/new-feature',
        true, // 새 브랜치 생성
        gitUser,
        gitPassword
      );
      console.log('브랜치가 전환되었습니다.');
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.logout();
  }
}

gitWorkflow();
```

## 참고 사항

- ABAP Git 기능을 사용하려면 SAP 시스템에 ABAP Git 확장이 설치되어 있어야 합니다.
- 비공개 저장소에 접근할 때는 항상 Git 사용자 이름과 비밀번호를 제공해야 합니다.
- 트랜스포트 관련 작업(풀, 푸시 등)에는 유효한 트랜스포트 요청이 필요합니다.
- 대규모 ABAP Git 작업은 시스템 성능에 영향을 줄 수 있으므로 주의해서 사용하세요.
- 브랜치 관리 작업은 SAP 버전과 ABAP Git 확장 버전에 따라 다를 수 있습니다.
- 스테이징 및 푸시 작업에서는 항상 적절한。 커밋 메시지와 작성자 정보를 제공하세요.