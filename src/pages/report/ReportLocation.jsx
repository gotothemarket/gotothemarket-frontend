import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { loadKakaoMaps, createMap, makeMarkerImage } from '../../utils/kakaoMap';
import { validateLocationOptions } from '../../apis/apis';
import pinUrl from '../../assets/pin.svg';
import closeIcon from '../../assets/close_icon.svg';

const ReportLocation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initialLocation, initialAddress } = location.state || {};

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState(initialAddress || '');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateStores, setDuplicateStores] = useState([]);
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

  // 위치 검증 API 호출
  const { data: validationData } = useQuery({
    ...validateLocationOptions(
      selectedLocation?.lat,
      selectedLocation?.lng,
      10 // 10m 반경 내 중복 체크
    ),
    enabled: !!(selectedLocation?.lat && selectedLocation?.lng),
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    console.log('🔍 ReportLocation useEffect 실행:', {
      KAKAO_KEY: !!KAKAO_KEY,
      initialLocation,
      initialAddress,
    });

    if (!KAKAO_KEY) {
      console.error('KAKAO_KEY가 설정되지 않았습니다');
      return;
    }

    // 지도 초기화 함수
    const initializeMap = async () => {
      try {
        console.log('🗺️ 지도 초기화 시작');

        // DOM 요소 찾기
        const mapContainer = document.getElementById('kakao-map-container');
        console.log('🔍 지도 컨테이너 찾기:', mapContainer);

        if (!mapContainer) {
          console.error('지도 컨테이너를 찾을 수 없습니다');
          return;
        }

        // 카카오맵 로딩
        console.log('📚 카카오맵 로딩 시작');
        await loadKakaoMaps(KAKAO_KEY);
        console.log('✅ 카카오맵 로딩 완료');

        // localStorage에서 저장된 위치와 줌 레벨 가져오기
        const savedLocation = localStorage.getItem('lastMapLocation');
        let initialLat, initialLng, initialLevel;
        
        if (savedLocation) {
          const saved = JSON.parse(savedLocation);
          initialLat = saved.lat;
          initialLng = saved.lng;
          initialLevel = saved.level || 3;
          console.log('📍 ReportLocation - localStorage에서 가져온 위치와 줌:', saved);
        } else if (initialLocation) {
          initialLat = initialLocation.lat;
          initialLng = initialLocation.lng;
          initialLevel = initialLocation.level || 3;
          console.log('📍 ReportLocation - initialLocation 사용:', initialLocation);
        } else {
          // 기본값
          initialLat = 37.4976451;
          initialLng = 126.9527737;
          initialLevel = 3;
          console.log('📍 ReportLocation - 기본 위치 사용');
        }

        console.log('🗺️ ReportLocation 지도 초기화:', {
          initialLocation,
          finalLat: initialLat,
          finalLng: initialLng,
          finalLevel: initialLevel,
        });

        // 지도 생성
        console.log('🏗️ 지도 생성 시작');
        const { map } = createMap(mapContainer, {
          lat: initialLat,
          lng: initialLng,
          level: initialLevel,
        });
        console.log('✅ 지도 생성 완료:', map);

        // 전역 변수에 지도 객체 저장 (닫기 기능용)
        window.currentMap = map;
        console.log('💾 전역 변수에 지도 객체 저장 완료');

        // 지도가 생성된 후 초기 위치로 강제 이동 (전달받은 위치가 있는 경우)
        if (initialLocation) {
          const center = new window.kakao.maps.LatLng(initialLat, initialLng);
          map.setCenter(center);
          console.log('🗺️ 지도 중심을 전달받은 위치로 이동:', center);
        }

        // 초기 위치에 마커 표시 (전달받은 위치가 있는 경우)
        if (initialLocation) {
          console.log('📍 초기 위치 마커 생성 시작');
          const markerImage = makeMarkerImage(pinUrl, { width: 40, height: 40 });
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(initialLat, initialLng),
            image: markerImage,
            map: map,
          });
          window.currentMarker = marker;
          console.log('✅ 초기 위치 마커 생성 완료');

          // 초기 위치 정보 설정
          setSelectedLocation({
            lat: initialLat,
            lng: initialLng,
            address: initialAddress || '주소 변환 중...',
          });

          // 주소가 없으면 변환 시도
          if (!initialAddress) {
            console.log('🏠 주소 변환 시도');
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2Address(initialLng, initialLat, (result, status) => {
              if (status === window.kakao.maps.services.Status.OK) {
                const addr = result[0].address.address_name;
                setAddress(addr);
                setSelectedLocation((prev) => ({ ...prev, address: addr }));
                console.log('✅ 주소 변환 완료:', addr);
              } else {
                console.log('❌ 주소 변환 실패:', status);
              }
            });
          }
        }

        // 마커 이미지 생성
        const markerImage = makeMarkerImage(pinUrl, { width: 40, height: 40 });

        // 지도 클릭 이벤트
        window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
          const latlng = mouseEvent.latLng;

          // 기존 마커 제거
          if (window.currentMarker) {
            window.currentMarker.setMap(null);
          }

          // 새 마커 생성
          const marker = new window.kakao.maps.Marker({
            position: latlng,
            image: markerImage,
            map: map,
          });
          window.currentMarker = marker;

          // 좌표 정보 저장
          const location = {
            lat: latlng.getLat(),
            lng: latlng.getLng(),
            address: '주소 변환 중...',
          };
          setSelectedLocation(location);
          setAddress('주소 변환 중...');

          // 주소 변환
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const addr = result[0].address.address_name;
              setAddress(addr);
              setSelectedLocation((prev) => ({ ...prev, address: addr }));
            } else {
              setAddress('주소를 가져올 수 없습니다');
              setSelectedLocation((prev) => ({ ...prev, address: '주소를 가져올 수 없습니다' }));
            }
          });
        });

        console.log('🗺️ ReportLocation 지도 초기화 완료');
      } catch (error) {
        console.error('지도 초기화 실패:', error);
        console.error('에러 상세:', {
          message: error.message,
          stack: error.stack,
          initialLocation,
          initialAddress,
          KAKAO_KEY: !!KAKAO_KEY,
        });
      }
    };

    // DOM 준비 후 초기화 (더 긴 지연 시간)
    const timer = setTimeout(initializeMap, 1000);

    return () => {
      clearTimeout(timer);
      if (window.currentMarker) {
        window.currentMarker.setMap(null);
      }
      // 전역 변수 정리
      if (window.currentMap) {
        delete window.currentMap;
      }
    };
  }, [KAKAO_KEY, initialLocation, initialAddress]);

  const moveToCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        alert(`현재 위치: ${lat.toFixed(4)}, ${lng.toFixed(4)}\n페이지를 새로고침합니다.`);
        window.location.reload();
      },
      (error) => {
        console.error('위치 가져오기 실패:', error);
        alert('현재 위치를 가져올 수 없습니다.');
      },
    );
  };

  const handleSubmit = () => {
    if (!selectedLocation) {
      alert('지도에서 위치를 선택해주세요.');
      return;
    }

    console.log('제출된 위치:', selectedLocation);
    
    // 중복 체크 결과 확인
    if (validationData && (!validationData.isValid || validationData.nearbyStores?.length > 0)) {
      // 중복 가게가 있으면 모달 표시 (지도 위에)
      setDuplicateStores(validationData.nearbyStores || []);
      setShowDuplicateModal(true);
      return;
    }

    // 중복이 없으면 바로 등록창으로 이동
    navigate('/report/form', {
      state: {
        location: selectedLocation,
        address: address,
      },
    });
  };

  const handleClose = () => {
    // 현재 지도의 중심 좌표와 줌 레벨을 홈으로 전달
    if (window.currentMap) {
      const center = window.currentMap.getCenter();
      const currentLat = center.getLat();
      const currentLng = center.getLng();
      const currentLevel = window.currentMap.getLevel();

      console.log('🏠 ReportLocation 닫기 - 현재 지도 상태를 홈으로 전달:', {
        lat: currentLat,
        lng: currentLng,
        level: currentLevel,
      });

      // 홈으로 이동하면서 현재 좌표와 줌 레벨 전달
      navigate('/', {
        state: {
          returnLocation: {
            lat: currentLat,
            lng: currentLng,
            level: currentLevel,
          },
        },
      });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center">
      <div className="w-full max-w-[43rem] h-full flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center relative justify-center px-4 pt-[4rem] pb-[2rem] bg-white text-black">
          <h1
            className="text-center text-[1.7rem] font-medium leading-normal"
            style={{ fontFamily: 'Pretendard Variable', color: '#0A0A0A' }}
          >
            가게 제보하기
          </h1>
          <button
            onClick={handleClose}
            className="absolute right-[2.5rem] hover:opacity-70 transition-opacity"
          >
            <img src={closeIcon} alt="닫기" className="w-6 h-6" />
          </button>
        </div>

        {/* 지도 */}
        <div className="flex-1 relative">
          <div
            id="kakao-map-container"
            className="absolute inset-0 w-full h-full bg-gray-200"
            style={{ minHeight: '400px' }}
          />

          {/* 현재 위치 버튼 */}
          <button
            onClick={moveToCurrentLocation}
            className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {/* 하단 정보 */}
        <div className="bg-white p-6 px-[4.7rem]">
          <div className="mb-4">
            <h2 className="text-[2rem] font-bold mb-[2.9rem]">숨겨진 가게는 바로 여기!</h2>
            <div
              className="h-[4.4rem] flex-shrink-0 text-center text-[1.6rem] font-semibold leading-normal rounded-[1rem] bg-[#F4F4F4] text-[#5A5A5A] flex items-center justify-center"
              style={{ fontFamily: 'Pretendard Variable' }}
            >
              <p className="">{address || '지도에서 위치를 선택해주세요'}</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedLocation}
            className={`w-full h-[4.4rem] flex-shrink-0 text-center text-[1.4rem] font-semibold leading-normal rounded-[1rem] transition-all ${
              selectedLocation
                ? 'bg-[#FF9C1F] text-[#FEFEFE] hover:bg-[#FF8A00] active:scale-[0.98]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            style={{ fontFamily: 'Pretendard Variable' }}
          >
            이 위치로 하기
          </button>
        </div>

        {/* 중복 가게 안내 모달 - 지도 위에 투명 배경으로 표시 */}
        {showDuplicateModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Frame 1057 */}
            <div 
              className="bg-[#FEFEFE] flex flex-col items-start gap-[10px]"
              style={{
                width: '262px',
                height: Math.ceil(duplicateStores.length / 2) === 1 ? '192px' : Math.ceil(duplicateStores.length / 2) > 2 ? '250px' : '221px',
                padding: '14px 15px',
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              }}
            >
              {/* Frame 1062 */}
              <div className="flex flex-col items-center gap-[10px] w-[232px]" style={{ height: Math.ceil(duplicateStores.length / 2) === 1 ? '164px' : '193px' }}>
                
                {/* Frame 1296 - 제목 영역 */}
                <div className="flex flex-col items-start gap-[5px] w-[232px] h-[47px]">
                  {/* 👀 이모지 */}
                  <div 
                    className="w-[232px] h-[25px] flex items-center justify-center text-[#0A0A0A]"
                    style={{
                      fontFamily: 'Pretendard Variable',
                      fontWeight: 600,
                      fontSize: '25px',
                      lineHeight: '30px',
                    }}
                  >
                    👀
                  </div>
                  
                  {/* 제목 텍스트 */}
                  <div 
                    className="w-[232px] h-[17px] flex items-center justify-center text-[#0A0A0A]"
                    style={{
                      fontFamily: 'Pretendard Variable',
                      fontWeight: 600,
                      fontSize: '14px',
                      lineHeight: '17px',
                    }}
                  >
                    근처에 제보된 가게가 이미 있어요!
                  </div>
                </div>

                {/* Frame 1063 - 가게 목록 영역 */}
                <div className="flex flex-col items-center gap-[10px] w-[232px]">
                  
                  {/* Frame 1297 - 가게 리스트 */}
                  <div className="flex flex-col items-center gap-[5px] w-[207.8px]">
                    {/* 2개씩 행으로 나누어서 표시 */}
                    {Array.from({ length: Math.ceil(duplicateStores.length / 2) }, (_, rowIndex) => (
                      <div key={rowIndex} className="flex flex-row justify-center items-start gap-[5px] w-[207.8px] h-[24px]">
                        {duplicateStores.slice(rowIndex * 2, (rowIndex + 1) * 2).map((store, index) => {
                          // 가게 이름 5자 이상 시 말줄임표 처리
                          const displayName = store.storeName && store.storeName.length > 5 
                            ? store.storeName.substring(0, 5) + '...' 
                            : store.storeName;
                          
                          return (
                            <div 
                              key={`${rowIndex}-${index}`}
                              className="flex flex-row justify-center items-center gap-[5px] bg-[#FFF3DE] rounded-[10px]"
                              style={{
                                padding: '5px 12px',
                                height: '24px'
                              }}
                            >
                              {/* Pin 아이콘 - SVG 사용 */}
                              <div className="flex-shrink-0" style={{ width: '12px', height: '18px' }}>
                                <svg width="12" height="18" viewBox="0 0 28 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <ellipse cx="13.5" cy="39.5" rx="12.5" ry="4.5" fill="url(#paint0_radial_302_977)"/>
                                  <path d="M12.4004 27.5127L12.0576 27.4629C8.82024 26.9956 5.85879 25.3774 3.71777 22.9043C1.57687 20.4313 0.399617 17.2691 0.400391 13.998C0.40106 11.3911 1.15094 8.83935 2.56055 6.64648C3.97011 4.45372 5.97956 2.71175 8.35059 1.62891C10.7217 0.546121 13.3545 0.167276 15.9346 0.538086C18.5147 0.908962 20.9341 2.01391 22.9043 3.7207C24.8745 5.42756 26.3128 7.66491 27.0479 10.166C27.7829 12.6672 27.7843 15.3275 27.0508 17.8291C26.3173 20.3305 24.8802 22.5684 22.9111 24.2764C20.9419 25.9844 18.5224 27.0905 15.9424 27.4629L15.5996 27.5127V38C15.5996 38.4241 15.4316 38.8309 15.1318 39.1309C14.8318 39.4309 14.4243 39.5996 14 39.5996C13.5757 39.5996 13.1682 39.4309 12.8682 39.1309C12.5684 38.8309 12.4004 38.4241 12.4004 38V27.5127Z" fill="#0A0A0A" stroke="#FEA900" strokeWidth="0.8"/>
                                  <path d="M7.94776 15.176C6.61143 13.7248 6.69883 11.4597 8.14299 10.1168L8.43354 9.8466C9.71723 8.6529 11.7208 8.73098 12.9087 10.021L18.8234 16.4443L14.4667 20.7671C14.1457 21.0655 13.5527 21.0896 13.2557 20.7671L7.94776 15.176Z" fill="#FFAA00"/>
                                  <path d="M15.3028 9.94842C16.5852 8.75331 18.5889 8.82918 19.7781 10.1179L20.0489 10.4113C21.3878 11.862 21.3028 14.1288 19.8591 15.4742L16.0877 18.9889C14.8053 20.184 12.8016 20.1082 11.6123 18.8195L8.91739 15.8992L15.3028 9.94842Z" fill="#FFAA00"/>
                                  <defs>
                                    <radialGradient id="paint0_radial_302_977" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(13.5 39.5) scale(12.5 4.5)">
                                      <stop stopColor="#FFAA00" stopOpacity="0.6"/>
                                      <stop offset="0.5" stopColor="#FFAA00" stopOpacity="0.2"/>
                                      <stop offset="1" stopColor="#FFAA00" stopOpacity="0"/>
                                    </radialGradient>
                                  </defs>
                                </svg>
                              </div>
                              
                              {/* 가게 이름 */}
                              <span 
                                className="text-[#FF9C1F] text-center whitespace-nowrap"
                                style={{
                                  fontFamily: 'Pretendard Variable',
                                  fontWeight: 700,
                                  fontSize: '12px',
                                  lineHeight: '14px',
                                }}
                              >
                                {displayName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* 안내 메시지 */}
                  <div 
                    className="w-[232px] flex items-center justify-center text-[#0A0A0A] text-center"
                    style={{
                      fontFamily: 'Pretendard Variable',
                      fontWeight: 500,
                      fontSize: '10px',
                      lineHeight: '12px',
                      opacity: 0.3,
                    }}
                  >
                    중복 제보를 막기 위해,<br />같은 가게가 아닌지 확인해주세요!
                  </div>
                </div>

                {/* Frame 1061 - 버튼 영역 */}
                <div className="flex flex-row items-center gap-[13px] w-[232px] h-[39px]">
                  
                  {/* 가게 제보하기 버튼 */}
                  <div className="relative w-[109px] h-[39px] bg-[#F7F7F7] rounded-[10px]">
                    <button
                      onClick={() => {
                        setShowDuplicateModal(false);
                        navigate('/report/form', {
                          state: {
                            location: selectedLocation,
                            address: address,
                          },
                        });
                      }}
                      className="absolute inset-0 flex flex-col justify-center items-center opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <span 
                        className="text-[#0A0A0A] text-center"
                        style={{
                          fontFamily: 'Pretendard Variable',
                          fontWeight: 600,
                          fontSize: '12px',
                          lineHeight: '14px',
                        }}
                      >
                        가게 제보하기
                      </span>
                    </button>
                  </div>

                  {/* 뒤로가기 버튼 */}
                  <div className="relative w-[110px] h-[39px] bg-[#F7F7F7] rounded-[10px]">
                    <button
                      onClick={() => setShowDuplicateModal(false)}
                      className="absolute inset-0 flex flex-col justify-center items-center opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <span 
                        className="text-[#0A0A0A] text-center"
                        style={{
                          fontFamily: 'Pretendard Variable',
                          fontWeight: 600,
                          fontSize: '12px',
                          lineHeight: '14px',
                        }}
                      >
                        뒤로가기
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportLocation;
