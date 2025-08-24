// /src/pages/Home.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import pinUrl from '../../assets/pin.svg';
import marketIconUrl from '../../assets/market_icon.svg';
import { loadKakaoMaps, createMap, makeMarkerImage } from '../../utils/kakaoMap';
import CategoryChips from '../../components/CategoryChips';
import DetailSheet from '../../components/DetailSheet';
import BadgeModal from '../../components/BadgeModal';
import { firstLaunchOptions } from '../../apis/apis';
import { homeMapOptions } from '../../apis/home/api';
import mapData from '../../mocks/map_mocks.json';

export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { returnLocation } = location.state || {};
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null); // 지도 객체 저장용 ref 추가
  const [category, setCategory] = useState(null);
  const [selected, setSelected] = useState(null); // { type:'store'|'market', id, data? }
  const [markers, setMarkers] = useState([]); // [{ marker, type, id, data }]
  const [currentAddress, setCurrentAddress] = useState(''); // 현재 주소 상태
  const [currentLocation, setCurrentLocation] = useState(null); // 현재 위치 좌표 상태
  const [showBadgeModal, setShowBadgeModal] = useState(false); // 뱃지 모달 상태
  const [badgeInfo, setBadgeInfo] = useState(null); // 뱃지 정보 상태
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

  // 마커 이미지(기본/선택) 준비
  const STORE_IMG = {
    normal: null, // 나중에 초기화
    selected: null,
  };
  const MARKET_IMG = {
    normal: null, // 나중에 초기화
    selected: null,
  };

  // 카테고리 ID를 storeTypeId로 변환하는 함수
  const getCategoryStoreTypeId = (categoryId) => {
    const categoryMap = {
      produce: 1, // 과일·야채
      seafood: 2, // 수산
      restaurant: 3, // 식당
      bakery: 4, // 빵/떡
      misc: 5, // 잡화
      street: 6, // 길거리음식
      meat: 7, // 축산
      clothing: 8, // 의류
    };
    return categoryMap[categoryId];
  };

  // 마커 업데이트 함수
  const updateMarkers = (data) => {
    // 기존 마커 제거
    markers.forEach((m) => m.marker?.setMap(null));

    // 마커 이미지가 초기화되지 않았다면 초기화
    if (!STORE_IMG.normal || !MARKET_IMG.normal) {
      STORE_IMG.normal = makeMarkerImage(pinUrl, { width: 36, height: 36 });
      STORE_IMG.selected = makeMarkerImage(pinUrl, { width: 42, height: 42 });
      MARKET_IMG.normal = makeMarkerImage(marketIconUrl, { width: 36, height: 36 });
      MARKET_IMG.selected = makeMarkerImage(marketIconUrl, { width: 42, height: 42 });
    }

    const newMarkers = [];

    // Store 마커 (API 응답 사용)
    data?.stores?.forEach((store) => {
      const pos = new window.kakao.maps.LatLng(store.latitude, store.longitude);
      const marker = new window.kakao.maps.Marker({
        position: pos,
        image: STORE_IMG.normal,
        map: mapInstanceRef.current,
        opacity: 1,
      });
      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelected({ type: 'store', id: store.storeId });
      });
      newMarkers.push({
        marker,
        type: 'store',
        id: store.storeId,
        data: store,
        images: STORE_IMG,
      });
    });

    // Market 마커 (API 응답 사용)
    data?.markets?.forEach((market) => {
      const pos = new window.kakao.maps.LatLng(market.latitude, market.longitude);
      const marker = new window.kakao.maps.Marker({
        position: pos,
        image: MARKET_IMG.normal,
        map: mapInstanceRef.current,
        opacity: 1,
      });
      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelected({ type: 'market', id: market.marketId });
      });
      newMarkers.push({
        marker,
        type: 'market',
        id: market.marketId,
        data: market,
        images: MARKET_IMG,
      });
    });

    setMarkers(newMarkers);

    // 선택 상태 초기화 및 스타일 적용
    setSelected(null);
    applyMarkerStyles(null);
  };

  // first-launch API 호출
  const firstLaunchMutation = useMutation(firstLaunchOptions());
  const { data: homeData } = useQuery(
    homeMapOptions(category ? getCategoryStoreTypeId(category) : null),
  );

  // 사용자가 처음 접속했는지 확인하는 함수
  const checkFirstVisit = async () => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      try {
        // API 호출하여 뱃지 정보 가져오기
        const response = await firstLaunchMutation.mutateAsync();

        if (response.success && response.data.awarded) {
          // 뱃지 지급 성공 시
          setBadgeInfo(response.data);
          setShowBadgeModal(true);
          localStorage.setItem('hasVisitedBefore', 'true');
        }
      } catch (error) {
        console.error('First launch API 호출 실패:', error);
        // API 실패 시에도 기본 모달 표시
        setShowBadgeModal(true);
        localStorage.setItem('hasVisitedBefore', 'true');
      }
    }
  };

  // 개발용: 모달 테스트 함수 (나중에 제거 가능)
  const resetFirstVisit = async () => {
    localStorage.removeItem('hasVisitedBefore');
    setBadgeInfo(null);

    try {
      // API 다시 호출
      const response = await firstLaunchMutation.mutateAsync();
      if (response.success && response.data.awarded) {
        setBadgeInfo(response.data);
        setShowBadgeModal(true);
        localStorage.setItem('hasVisitedBefore', 'true');
      }
    } catch (error) {
      console.error('First launch API 재호출 실패:', error);
      // API 실패 시 기본 모달 표시
      setShowBadgeModal(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  };

  // 컴포넌트 마운트 시 첫 방문 확인
  useEffect(() => {
    checkFirstVisit();
  }, []);

  // 선택 상태에 따라 마커 스타일(투명도/이미지/zIndex) 갱신
  const applyMarkerStyles = (selectedItem) => {
    if (markers.length === 0) return;

    markers.forEach(({ marker, type, id, images }) => {
      const isSelected = !!selectedItem && selectedItem.type === type && selectedItem.id === id;

      // 투명도
      marker.setOpacity(isSelected || !selectedItem ? 1 : 0.4);

      // 이미지 (선택 시 살짝 큰 이미지로 교체)
      if (images) {
        marker.setImage(isSelected ? images.selected : images.normal);
      }

      // zIndex로 시각적 강조
      marker.setZIndex(isSelected ? 10 : 0);
    });
  };

  // 좌표를 주소로 변환하는 함수
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const geocoder = new window.kakao.maps.services.Geocoder();
      return new Promise((resolve, reject) => {
        geocoder.coord2Address(lng, lat, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            resolve(result[0].address.address_name);
          } else {
            reject(new Error('주소 변환 실패'));
          }
        });
      });
    } catch (error) {
      console.error('주소 변환 에러:', error);
      return '주소를 가져올 수 없습니다';
    }
  };

  // 지도 중앙 좌표의 주소를 업데이트하는 함수
  const updateCenterAddress = async (map) => {
    try {
      const center = map.getCenter();
      const lat = center.getLat();
      const lng = center.getLng();
      const address = await getAddressFromCoords(lat, lng);
      setCurrentAddress(address);
      setCurrentLocation({ lat, lng });
    } catch (error) {
      console.error('중앙 주소 업데이트 실패:', error);
    }
  };

  // selected / markers 변경 시마다 반영
  useEffect(() => {
    applyMarkerStyles(selected);
  }, [selected, markers]);

  // homeData 변경 시 마커 업데이트
  useEffect(() => {
    if (homeData && mapInstanceRef.current) {
      updateMarkers(homeData);
    }
  }, [homeData]);

  // ReportLocation에서 돌아올 때 지도 위치 업데이트
  useEffect(() => {
    if (returnLocation && mapInstanceRef.current) {
      console.log('🏠 홈으로 돌아옴 - 지도 위치 업데이트:', returnLocation);
      const center = new window.kakao.maps.LatLng(returnLocation.lat, returnLocation.lng);
      mapInstanceRef.current.setCenter(center);

      // 주소도 업데이트
      getAddressFromCoords(returnLocation.lat, returnLocation.lng)
        .then((address) => {
          setCurrentAddress(address);
          setCurrentLocation(returnLocation);
        })
        .catch((error) => {
          console.error('주소 업데이트 실패:', error);
        });
    }
  }, [returnLocation]);

  // 카테고리 변경 시 선택 상태 초기화
  useEffect(() => {
    if (selected) {
      setSelected(null);
    }
  }, [category]);

  // 현재 위치 요청 이벤트 리스너
  useEffect(() => {
    const handleGetCurrentLocation = (event) => {
      const { callback } = event.detail;
      callback(currentLocation);
    };

    window.addEventListener('getCurrentLocation', handleGetCurrentLocation);
    return () => {
      window.removeEventListener('getCurrentLocation', handleGetCurrentLocation);
    };
  }, [currentLocation]);

  useEffect(() => {
    if (!mapRef.current || !KAKAO_KEY || !homeData) return;

    // 이미 지도가 생성되어 있다면 재생성하지 않음
    if (mapInstanceRef.current) {
      console.log('🗺️ 지도가 이미 존재함, 재생성하지 않음');
      return;
    }

    const newMarkers = [];

    loadKakaoMaps(KAKAO_KEY).then(async () => {
      // 목업 첫 위치 설정
      let initialLat = 37.4976451;
      let initialLng = 126.9527737;
      let initialAddress = ''

      // 지도 생성 (현재 위치 또는 기본 위치)
      const { map } = createMap(mapRef.current, {
        lat: initialLat,
        lng: initialLng,
        level: 3, // 기본 줌 레벨
      });

      // 확대/축소 범위 설정 (레벨 1-14)
      map.setMinLevel(1); // 최소 확대 레벨 (가장 자세)
      map.setMaxLevel(14); // 최대 확대 레벨 (가장 넓음)

      // 확대/축소 기능 강제 활성화
      map.setZoomable(true);

      // 마우스 휠 이벤트 직접 추가
      const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 1 : -1;
        const currentLevel = map.getLevel();
        const newLevel = Math.max(1, Math.min(14, currentLevel + delta));
        if (newLevel !== currentLevel) {
          map.setLevel(newLevel);
        }
      };

      mapRef.current.addEventListener('wheel', handleWheel, { passive: false });

      mapInstanceRef.current = map; // 지도 객체를 ref에 저장

      // 전역 변수에 지도 객체 저장 (Navbar에서 접근용)
      window.currentHomeMap = map;

      // 정리 함수에서 사용할 수 있도록 handleWheel을 저장
      mapRef.current._handleWheel = handleWheel;

      console.log('🗺️ 지도 생성 완료!');
      console.log('📍 초기 좌표:', { lat: initialLat, lng: initialLng });
      console.log('🗺️ 지도 객체:', map);
      console.log('🔗 mapInstanceRef.current:', mapInstanceRef.current);

      // 초기 주소 설정
      try {
        initialAddress = await getAddressFromCoords(initialLat, initialLng);
        setCurrentAddress(initialAddress);
        setCurrentLocation({ lat: initialLat, lng: initialLng });
      } catch (error) {
        setCurrentAddress(mapData.data.road_address); // 기본값으로 fallback
        setCurrentLocation({ lat: initialLat, lng: initialLng });
      }

      // 지도 이동 이벤트 리스너 추가 (한 번만)
      if (!map._hasEventListeners) {
        window.kakao.maps.event.addListener(map, 'dragend', () => {
          updateCenterAddress(map);
          // 전역 변수 업데이트
          window.currentHomeMap = map;
        });

        window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
          updateCenterAddress(map);
          // 전역 변수 업데이트
          window.currentHomeMap = map;
        });

        map._hasEventListeners = true;
      }

      // 마커 이미지(기본/선택) 초기화
      STORE_IMG.normal = makeMarkerImage(pinUrl, { width: 36, height: 36 });
      STORE_IMG.selected = makeMarkerImage(pinUrl, { width: 42, height: 42 }); // 약 1.15배
      MARKET_IMG.normal = makeMarkerImage(marketIconUrl, { width: 36, height: 36 });
      MARKET_IMG.selected = makeMarkerImage(marketIconUrl, { width: 42, height: 42 });

      // Store 마커 (API 응답 사용)
      homeData?.stores?.forEach((store) => {
        const pos = new window.kakao.maps.LatLng(store.latitude, store.longitude);
        const marker = new window.kakao.maps.Marker({
          position: pos,
          image: STORE_IMG.normal,
          map,
          opacity: 1,
        });
        window.kakao.maps.event.addListener(marker, 'click', () => {
          setSelected({ type: 'store', id: store.storeId });
        });
        newMarkers.push({
          marker,
          type: 'store',
          id: store.storeId,
          data: store,
          images: STORE_IMG,
        });
      });

      // Market 마커 (API 응답 사용)
      homeData?.markets?.forEach((market) => {
        const pos = new window.kakao.maps.LatLng(market.latitude, market.longitude);
        const marker = new window.kakao.maps.Marker({
          position: pos,
          image: MARKET_IMG.normal,
          map,
          opacity: 1,
        });
        window.kakao.maps.event.addListener(marker, 'click', () => {
          setSelected({ type: 'market', id: market.marketId });
        });
        newMarkers.push({
          marker,
          type: 'market',
          id: market.marketId,
          data: market,
          images: MARKET_IMG,
        });
      });

      setMarkers(newMarkers);

      // 초기 상태(선택 없음) 스타일 보정
      applyMarkerStyles(null);
    });

    return () => {
      newMarkers.forEach((m) => m.marker?.setMap(null));
      setMarkers([]);

      // 마우스 휠 이벤트 리스너 제거
      if (mapRef.current && mapRef.current._handleWheel) {
        mapRef.current.removeEventListener('wheel', mapRef.current._handleWheel);
        delete mapRef.current._handleWheel;
      }

      // 전역 변수 정리
      if (window.currentHomeMap === mapInstanceRef.current) {
        delete window.currentHomeMap;
      }
    };
  }, [KAKAO_KEY, homeData]);

  const handleCloseDetailSheet = () => setSelected(null);

  const handleResetFromHere = async () => {
    setSelected(null);
    applyMarkerStyles(null);

    // 현재 위치로 지도 이동 및 주소 업데이트
    if (navigator.geolocation && mapInstanceRef.current) {
      // mapInstanceRef.current 사용
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const latlng = new window.kakao.maps.LatLng(lat, lng);

          // 지도 중앙 이동
          mapInstanceRef.current.setCenter(latlng);

          try {
            const address = await getAddressFromCoords(lat, lng);
            setCurrentAddress(address);
          } catch (error) {
            console.error('현재 위치 주소 변환 실패:', error);
          }
        },
        (error) => {
          console.error('현재 위치 가져오기 실패:', error);
          alert('현재 위치를 가져올 수 없습니다.');
        },
      );
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center">
      {/* 주소 박스 */}
      <div className="absolute top-[4.9rem] left-1/2 -translate-x-1/2 z-10 bg-white w-[80%] h-[4.8rem] pl-[1.5rem] leading-[4.8rem] rounded-xl shadow flex items-center">
        <span
          data-address
          className="text-[1.4rem] font-semibold leading-normal"
          style={{
            fontFamily: 'Pretendard Variable',
            color: '#0A0A0A',
            textAlign: 'center',
          }}
        >
          {currentAddress || mapData.data.road_address}
        </span>
      </div>

      {/* 카테고리 칩 */}
      <div className="absolute top-[11.1rem] z-10 w-full pl-4 py-2">
        <CategoryChips value={category} onChange={setCategory} />
      </div>

      {/* 지도 */}
      <div ref={mapRef} className="absolute inset-0 w-full" />

      {/* 상세 바텀시트 */}
      <DetailSheet selected={selected} onClose={handleCloseDetailSheet} />

      {/* 하단 박스들 */}
      <div className="absolute bottom-[8.3rem] left-1/2 -translate-x-1/2 z-10 flex flex-col gap-3">
        {/* AI 코스 추천 버튼 */}
        <div
          className="flex py-[1.4rem] px-[2rem] justify-center items-center gap-2 rounded-3xl border border-[#FF661F] bg-[#FEFEFE] shadow-[0.5px_4px_7px_0_rgba(255,102,31,0.80)] cursor-pointer hover:bg-orange-50 transition-colors"
          onClick={() => {
            // 현재 지도 상태를 가져와서 전달
            console.log('🚀 AI 코스 추천 버튼 클릭!');

            if (mapInstanceRef.current) {
              const center = mapInstanceRef.current.getCenter();
              const currentLat = center.getLat();
              const currentLng = center.getLng();

              console.log('📍 현재 지도 중심 좌표:', { lat: currentLat, lng: currentLng });

              navigate('/ai', {
                state: {
                  centerLat: currentLat,
                  centerLng: currentLng,
                },
              });
            } else {
              // 지도가 아직 생성되지 않은 경우 기본값 사용
              navigate('/ai', {
                state: {
                  centerLat: 37.4976451,
                  centerLng: 126.9527737,
                },
              });
            }
          }}
        >
          <span className="text-center text-[#FF661F] text-[1.4rem] font-semibold leading-none">
            ⛳ AI 코스 추천
          </span>
        </div>
      </div>

      {/* 뱃지 모달 */}
      <BadgeModal
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        badgeInfo={badgeInfo}
      />
    </div>
  );
};
