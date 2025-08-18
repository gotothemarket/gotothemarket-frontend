// /src/pages/Home.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pinUrl from '../../assets/pin.svg';
import marketIconUrl from '../../assets/market_icon.svg';
import { loadKakaoMaps, createMap, makeMarkerImage } from '../../utils/kakaoMap';
import CategoryChips from '../../components/CategoryChips';
import DetailSheet from '../../components/DetailSheet';
import mapData from '../../mocks/map_mocks.json';

export const Home = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [category, setCategory] = useState(null);
  const [selected, setSelected] = useState(null); // { type:'store'|'market', id, data? }
  const [markers, setMarkers] = useState([]); // [{ marker, type, id, data }]
  const [currentAddress, setCurrentAddress] = useState(''); // 현재 주소 상태
  const [currentLocation, setCurrentLocation] = useState(null); // 현재 위치 좌표 상태
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

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
    if (!mapRef.current || !KAKAO_KEY) return;

    const newMarkers = [];

    loadKakaoMaps(KAKAO_KEY).then(async () => {
      // 현재 위치 가져오기
      let initialLat = 37.4961; // 기본값 (서울시청)
      let initialLng = 126.98231;
      let initialAddress = '';

      try {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            });
          });

          initialLat = position.coords.latitude;
          initialLng = position.coords.longitude;
          console.log('현재 위치 가져오기 성공:', initialLat, initialLng);
        }
      } catch (error) {
        console.log('현재 위치 가져오기 실패, 기본 위치 사용:', error);
      }

      // 지도 생성 (현재 위치 또는 기본 위치)
      const { map } = createMap(mapRef.current, {
        lat: initialLat,
        lng: initialLng,
        level: 3,
      });

      // 초기 주소 설정
      try {
        initialAddress = await getAddressFromCoords(initialLat, initialLng);
        setCurrentAddress(initialAddress);
        setCurrentLocation({ lat: initialLat, lng: initialLng });
        console.log('초기 주소 설정 완료:', initialAddress);
      } catch (error) {
        console.log('초기 주소 변환 실패, 기본 주소 사용:', error);
        setCurrentAddress(mapData.data.road_address); // 기본값으로 fallback
        setCurrentLocation({ lat: initialLat, lng: initialLng });
      }

      // 지도 이동 이벤트 리스너 추가
      window.kakao.maps.event.addListener(map, 'dragend', () => {
        updateCenterAddress(map);
      });

      window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
        updateCenterAddress(map);
      });

      // 마커 이미지(기본/선택) 준비
      const STORE_IMG = {
        normal: makeMarkerImage(pinUrl, { width: 36, height: 36 }),
        selected: makeMarkerImage(pinUrl, { width: 42, height: 42 }), // 약 1.15배
      };
      const MARKET_IMG = {
        normal: makeMarkerImage(marketIconUrl, { width: 36, height: 36 }),
        selected: makeMarkerImage(marketIconUrl, { width: 42, height: 42 }),
      };

      // Store 마커
      mapData.data.pins.stores.forEach((store) => {
        const pos = new window.kakao.maps.LatLng(store.store_coord.lat, store.store_coord.lng);
        const marker = new window.kakao.maps.Marker({
          position: pos,
          image: STORE_IMG.normal,
          map,
          opacity: 1,
        });
        window.kakao.maps.event.addListener(marker, 'click', () => {
          setSelected({ type: 'store', id: store.store_id });
        });
        newMarkers.push({
          marker,
          type: 'store',
          id: store.store_id,
          data: store,
          images: STORE_IMG,
        });
      });

      // Market 마커
      mapData.data.pins.markets.forEach((market) => {
        const pos = new window.kakao.maps.LatLng(market.market_coord.lat, market.market_coord.lng);
        const marker = new window.kakao.maps.Marker({
          position: pos,
          image: MARKET_IMG.normal,
          map,
          opacity: 1,
        });
        window.kakao.maps.event.addListener(marker, 'click', () => {
          setSelected({ type: 'market', id: market.market_id });
        });
        newMarkers.push({
          marker,
          type: 'market',
          id: market.market_id,
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
    };
  }, [KAKAO_KEY]);

  const handleCloseDetailSheet = () => setSelected(null);

  const handleResetFromHere = async () => {
    setSelected(null);
    applyMarkerStyles(null);

    // 현재 위치로 지도 이동 및 주소 업데이트
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const latlng = new window.kakao.maps.LatLng(lat, lng);

          // 지도 중앙 이동
          window.kakao.maps.event.trigger(mapRef.current, 'dragend');

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
      <div className="absolute top-[4.9rem] left-1/2 -translate-x-1/2 z-10 bg-white w-[80%] h-[4.8rem] pl-[1.5rem] leading-[4.8rem] rounded-xl shadow">
        <span data-address>{currentAddress || mapData.data.road_address}</span>
      </div>

      {/* 카테고리 칩 */}
      <div className="absolute top-[11.1rem] z-10 w-full px-4 py-2">
        <CategoryChips value={category} onChange={setCategory} />
      </div>

      {/* 지도 */}
      <div ref={mapRef} className="absolute inset-0 w-full" />

      {/* 상세 바텀시트 */}
      <DetailSheet selected={selected} onClose={handleCloseDetailSheet} />

      {/* 하단 박스 */}
      <div className="absolute bottom-[8.3rem] left-1/2 -translate-x-1/2 z-10 flex py-[1.4rem] px-[2rem] justify-center items-center gap-2 rounded-3xl border border-[#FF661F] bg-[#FEFEFE] shadow-[0.5px_4px_7px_0_rgba(255,102,31,0.80)]">
        <span className="text-center text-[#FF661F] font-['Pretendard_Variable'] text-[1.4rem] font-semibold leading-none">
          ⛳ AI 코스 추천
        </span>
      </div>
    </div>
  );
};
