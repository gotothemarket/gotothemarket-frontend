import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadKakaoMaps, createMap, makeMarkerImage } from '../../utils/kakaoMap';
import pinUrl from '../../assets/pin.svg';
import closeIcon from '../../assets/close_icon.svg';
import { useMapContext } from '../../contexts/MapContext';

const ReportLocation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initialLocation, initialAddress } = location.state || {};

  // MapContext 사용
  const { mapState, updateMapCenter, updateMapLevel, updateMapAddress } = useMapContext();

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState(initialAddress || mapState.address);
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

  useEffect(() => {
    if (!KAKAO_KEY) {
      console.error('KAKAO_KEY가 설정되지 않았습니다');
      return;
    }

    // 지도 초기화 함수
    const initializeMap = async () => {
      try {
        // DOM 요소 찾기
        const mapContainer = document.getElementById('kakao-map-container');

        if (!mapContainer) {
          console.error('지도 컨테이너를 찾을 수 없습니다');
          return;
        }

        await loadKakaoMaps(KAKAO_KEY);

        // 초기 위치 설정 (MapContext 우선, 전달받은 위치, 기본 위치 순)
        const initialLat = initialLocation?.lat || mapState.center.lat;
        const initialLng = initialLocation?.lng || mapState.center.lng;

        const { map } = createMap(mapContainer, {
          lat: initialLat,
          lng: initialLng,
          level: mapState.level,
        });

        // 초기 위치에 마커 표시 (전달받은 위치가 있는 경우)
        if (initialLocation) {
          const markerImage = makeMarkerImage(pinUrl, { width: 40, height: 40 });
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(initialLat, initialLng),
            image: markerImage,
            map: map,
          });
          window.currentMarker = marker;

          // 초기 위치 정보 설정
          setSelectedLocation({
            lat: initialLat,
            lng: initialLng,
            address: initialAddress || '주소 변환 중...',
          });

          // 주소가 없으면 변환 시도
          if (!initialAddress) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2Address(initialLng, initialLat, (result, status) => {
              if (status === window.kakao.maps.services.Status.OK) {
                const addr = result[0].address.address_name;
                setAddress(addr);
                setSelectedLocation((prev) => ({ ...prev, address: addr }));
                // MapContext 업데이트
                updateMapAddress(addr);
              }
            });
          }
        }

        // 마커 이미지 생성
        const markerImage = makeMarkerImage(pinUrl, { width: 40, height: 40 });

        // 지도 이동 이벤트 리스너 추가
        window.kakao.maps.event.addListener(map, 'dragend', () => {
          const center = map.getCenter();
          updateMapCenter(center.getLat(), center.getLng());
        });

        window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
          updateMapLevel(map.getLevel());
        });

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
              // MapContext 업데이트
              updateMapAddress(addr);
            } else {
              setAddress('주소를 가져올 수 없습니다');
              setSelectedLocation((prev) => ({ ...prev, address: '주소를 가져올 수 없습니다' }));
            }
          });
        });
      } catch (error) {
        console.error('지도 초기화 실패:', error);
      }
    };

    // DOM 준비 후 초기화
    const timer = setTimeout(initializeMap, 500);

    return () => {
      clearTimeout(timer);
      if (window.currentMarker) {
        window.currentMarker.setMap(null);
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
    // ReportForm으로 좌표 데이터와 함께 네비게이트
    navigate('/report/form', {
      state: {
        location: selectedLocation,
        address: address,
      },
    });
  };

  const handleClose = () => {
    navigate(-1);
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
          <div id="kakao-map-container" className="absolute inset-0 w-full h-full bg-gray-200" />

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
      </div>
    </div>
  );
};

export default ReportLocation;
