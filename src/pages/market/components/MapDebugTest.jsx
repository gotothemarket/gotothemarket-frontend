import React, { useEffect, useState } from 'react';

const MapDebugTest = () => {
  const [debugInfo, setDebugInfo] = useState({
    envKey: null,
    scriptLoaded: false,
    kakaoObject: false,
    mapsObject: false,
    servicesObject: false,
    error: null,
  });

  const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

  useEffect(() => {
    const runDebugTest = async () => {
      console.log('=== 카카오맵 디버깅 테스트 시작 ===');

      // 1. 환경변수 확인
      console.log('1. 환경변수 확인:', KAKAO_KEY);
      setDebugInfo((prev) => ({ ...prev, envKey: !!KAKAO_KEY }));

      if (!KAKAO_KEY) {
        setDebugInfo((prev) => ({
          ...prev,
          error: 'VITE_KAKAO_MAP_API_KEY가 설정되지 않았습니다',
        }));
        return;
      }

      try {
        // 2. 카카오맵 스크립트 로드 테스트
        console.log('2. 카카오맵 스크립트 로드 테스트...');

        // 기존 스크립트 제거
        const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
        if (existingScript) {
          existingScript.remove();
          console.log('기존 카카오맵 스크립트 제거됨');
        }

        // 새 스크립트 로드
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;
        script.async = true;

        const scriptLoadPromise = new Promise((resolve, reject) => {
          script.onload = () => {
            console.log('카카오맵 스크립트 로드 성공');
            setDebugInfo((prev) => ({ ...prev, scriptLoaded: true }));
            resolve();
          };
          script.onerror = (error) => {
            console.error('카카오맵 스크립트 로드 실패:', error);
            reject(new Error('스크립트 로드 실패'));
          };
        });

        document.head.appendChild(script);
        await scriptLoadPromise;

        // 3. window.kakao 객체 확인
        console.log('3. window.kakao 객체 확인:', !!window.kakao);
        setDebugInfo((prev) => ({ ...prev, kakaoObject: !!window.kakao }));

        if (!window.kakao) {
          throw new Error('window.kakao 객체가 없습니다');
        }

        // 4. 카카오맵 초기화
        console.log('4. 카카오맵 초기화...');
        await new Promise((resolve, reject) => {
          window.kakao.maps.load(() => {
            console.log('카카오맵 로드 완료');
            resolve();
          });

          // 10초 타임아웃
          setTimeout(() => {
            reject(new Error('카카오맵 로드 타임아웃'));
          }, 10000);
        });

        // 5. window.kakao.maps 객체 확인
        console.log('5. window.kakao.maps 객체 확인:', !!window.kakao.maps);
        setDebugInfo((prev) => ({ ...prev, mapsObject: !!window.kakao.maps }));

        // 6. services 객체 확인
        console.log('6. services 객체 확인:', !!window.kakao.maps.services);
        setDebugInfo((prev) => ({ ...prev, servicesObject: !!window.kakao.maps.services }));

        console.log('=== 디버깅 테스트 완료 - 모든 체크 통과 ===');
      } catch (error) {
        console.error('디버깅 테스트 실패:', error);
        setDebugInfo((prev) => ({ ...prev, error: error.message }));
      }
    };

    runDebugTest();
  }, [KAKAO_KEY]);

  const createTestMap = () => {
    if (!window.kakao || !window.kakao.maps) {
      alert('카카오맵이 아직 로드되지 않았습니다');
      return;
    }

    try {
      const container = document.getElementById('test-map');
      const options = {
        center: new window.kakao.maps.LatLng(37.49612, 126.98231),
        level: 3,
      };

      const map = new window.kakao.maps.Map(container, options);
      console.log('테스트 지도 생성 성공:', map);
      alert('테스트 지도가 성공적으로 생성되었습니다!');
    } catch (error) {
      console.error('테스트 지도 생성 실패:', error);
      alert('테스트 지도 생성 실패: ' + error.message);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">카카오맵 디버깅 테스트</h1>

      {/* 환경변수 정보 */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">환경변수</h2>
        <p>VITE_KAKAO_MAP_API_KEY: {KAKAO_KEY ? '설정됨' : '설정되지 않음'}</p>
        {KAKAO_KEY && (
          <p className="text-xs text-gray-600">
            키: {KAKAO_KEY.substring(0, 10)}...{KAKAO_KEY.substring(KAKAO_KEY.length - 4)}
          </p>
        )}
      </div>

      {/* 디버그 정보 */}
      <div className="mb-4 p-4 bg-blue-50 rounded">
        <h2 className="font-bold mb-2">디버그 정보</h2>
        <div className="space-y-1 text-sm">
          <div
            className={`flex items-center ${debugInfo.envKey ? 'text-green-600' : 'text-red-600'}`}
          >
            <span className="mr-2">{debugInfo.envKey ? '✅' : '❌'}</span>
            환경변수 로드
          </div>
          <div
            className={`flex items-center ${debugInfo.scriptLoaded ? 'text-green-600' : 'text-gray-400'}`}
          >
            <span className="mr-2">{debugInfo.scriptLoaded ? '✅' : '⏳'}</span>
            스크립트 로드
          </div>
          <div
            className={`flex items-center ${debugInfo.kakaoObject ? 'text-green-600' : 'text-gray-400'}`}
          >
            <span className="mr-2">{debugInfo.kakaoObject ? '✅' : '⏳'}</span>
            window.kakao 객체
          </div>
          <div
            className={`flex items-center ${debugInfo.mapsObject ? 'text-green-600' : 'text-gray-400'}`}
          >
            <span className="mr-2">{debugInfo.mapsObject ? '✅' : '⏳'}</span>
            window.kakao.maps 객체
          </div>
          <div
            className={`flex items-center ${debugInfo.servicesObject ? 'text-green-600' : 'text-gray-400'}`}
          >
            <span className="mr-2">{debugInfo.servicesObject ? '✅' : '⏳'}</span>
            services 객체
          </div>
        </div>
      </div>

      {/* 에러 정보 */}
      {debugInfo.error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="font-bold mb-2">에러</h2>
          <p className="text-sm">{debugInfo.error}</p>
        </div>
      )}

      {/* 테스트 지도 */}
      <div className="mb-4">
        <h2 className="font-bold mb-2">테스트 지도</h2>
        <button
          onClick={createTestMap}
          className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={!debugInfo.mapsObject}
        >
          테스트 지도 생성
        </button>
        <div id="test-map" className="w-full h-64 bg-gray-200 rounded"></div>
      </div>

      {/* 시스템 정보 */}
      <div className="p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">시스템 정보</h2>
        <div className="text-sm space-y-1">
          <p>User Agent: {navigator.userAgent}</p>
          <p>Current URL: {window.location.href}</p>
          <p>Protocol: {window.location.protocol}</p>
          <p>Is HTTPS: {window.location.protocol === 'https:' ? '예' : '아니오'}</p>
        </div>
      </div>
    </div>
  );
};

export default MapDebugTest;
