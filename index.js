const {ADTClient} = require('abap-adt-api');

/**
 * ADT API를 사용하여 ABAP 프로그램을 생성하는 함수
 * 
 * @param {Object} config - 연결 설정
 * @param {string} config.baseUrl - 서버 URL (예: "http://server:port")
 * @param {string} config.username - SAP 로그인 사용자
 * @param {string} config.password - 비밀번호
 * @param {string} config.client - SAP 클라이언트 (선택사항)
 * @param {string} config.language - 언어 키 (선택사항)
 * @param {Object} programOptions - 프로그램 옵션
 * @param {string} programOptions.programId - 프로그램 ID (예: "ZPG_TEST")
 * @param {string} programOptions.description - 프로그램 설명
 * @param {string} programOptions.devClass - 개발 클래스 (예: "$TMP")
 * @param {string} programOptions.transportNumber - 워크벤치 요청 번호 (선택사항)
 * @param {string} programOptions.sourceCode - ABAP 소스 코드
 * @returns {Promise<Object>} - 생성 결과
 */
async function createAbapProgram(config, programOptions) {
  // 기본값 설정
  const options = {
    programId: programOptions.programId || '',
    description: programOptions.description || '',
    devClass: programOptions.devClass || '$TMP',
    transportNumber: programOptions.transportNumber || '',
    sourceCode: programOptions.sourceCode || ''
  };

  // 반환할 결과 객체
  const result = {
    success: false,
    message: '',
    details: null
  };

  // 입력값 검증
  if (!options.programId) {
    result.message = '프로그램 ID가 필요합니다';
    return result;
  }

  if (!options.sourceCode) {
    result.message = '소스 코드가 필요합니다';
    return result;
  }

  // ADT 클라이언트 생성
  const client = new ADTClient(
    config.baseUrl,
    config.username,
    config.password,
    config.client,
    config.language
  );

  try {
    // stateful 모드로 설정
    client.stateful = "stateful";
    
    // 로그인
    await client.login();
    console.log('로그인 성공');

    // 객체 생성 옵션
    const createOptions = {
      objtype: 'PROG/P',
      name: options.programId,
      parentName: options.devClass,
      description: options.description,
      parentPath: 'source/main',
      transport: options.transportNumber
    };

    // 프로그램 생성
    await client.createObject(createOptions);
    console.log(`프로그램 ${options.programId} 생성 완료`);

    // 객체 URL과 구조 가져오기
    const objectUrl = `/sap/bc/adt/programs/programs/${options.programId.toLowerCase()}`;
    const objectStructure = await client.objectStructure(objectUrl);
    
    // 메인 인클루드 URL 가져오기
    const mainIncludeUrl = ADTClient.mainInclude(objectStructure);
    console.log('메인 인클루드 URL:', mainIncludeUrl);

    // 소스 코드 작성을 위한 잠금 획득
    const lock = await client.lock(mainIncludeUrl);
    console.log('프로그램 잠금 획득:', lock.LOCK_HANDLE);

    // 소스 코드 설정
    await client.setObjectSource(mainIncludeUrl, options.sourceCode, lock.LOCK_HANDLE, options.transportNumber);
    console.log('프로그램 소스 코드 설정 완료');

    // 잠금 해제
    await client.unLock(mainIncludeUrl, lock.LOCK_HANDLE);
    console.log('프로그램 잠금 해제 완료');

    // 비활성 객체 확인 (선택사항)
    const inactiveObjects = await client.inactiveObjects();
    
    // 활성화
    const activationResult = await client.activate(options.programId, objectUrl);
    console.log('프로그램 활성화 완료:', activationResult);

    // 성공 결과 반환
    result.success = true;
    result.message = `프로그램 ${options.programId} 생성 및 활성화 완료`;
    result.details = {
      objectUrl,
      activationResult
    };

  } catch (error) {
    // 오류 처리
    console.error('오류 발생:', error);
    result.message = `오류: ${error.message || '알 수 없는 오류'}`;
    result.details = error;
    
    if (error.response) {
      console.error('오류 상세:', error.response.data || error.response.statusText);
    }
  } finally {
    // 로그아웃
    try {
      await client.logout();
      console.log('로그아웃 완료');
    } catch (logoutError) {
      console.error('로그아웃 중 오류:', logoutError);
    }
  }

  return result;
}

// 사용 예시
async function example() {
  const config = {
    baseUrl: "http://awslnx01.samsung.com:52000",
    username: "25579",
    password: "Tmdcjf10",
    client: "", // 필요한 경우 지정
    language: "" // 필요한 경우 지정
  };

  const programOptions = {
    programId: "YSC_HELLOWORLD",
    description: "Hello World Program",
    devClass: "$TMP",
    sourceCode: `REPORT YSC_HELLOWORLD.
* Hello World Program
WRITE: 'HELLO WORLD'.`
  };

  const result = await createAbapProgram(config, programOptions);
  console.log('함수 실행 결과:', result);
}

// 모듈로 내보내기
module.exports = {
  createAbapProgram
};

// 직접 실행할 경우 예시 함수 호출
if (require.main === module) {
  example().catch(console.error);
}