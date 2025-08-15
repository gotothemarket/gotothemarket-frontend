// /src/pages/Home.jsx
import React, { useEffect, useRef, useState } from 'react';
import pinUrl from '../../assets/pin.svg';
import marketIconUrl from '../../assets/market_icon.svg';
import { loadKakaoMaps, createMap, makeMarkerImage, addMarker } from '../../utils/kakaoMap';
import CategoryChips from '../../components/CategoryChips';
import resetIcon from '../../assets/resetIcon.svg';
import DetailSheet from '../../components/DetailSheet';
import mapData from '../../mocks/map_mocks.json';

export const Home = () => {
  const mapRef = useRef(null);
  const [category, setCategory] = useState(null);
  const [selected, setSelected] = useState(null); // { type:'store'|'market', id, data? }
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

  useEffect(() => {
    if (!mapRef.current || !KAKAO_KEY) return;
    let markers = [];

    loadKakaoMaps(KAKAO_KEY).then(async () => {
      const { map, center } = createMap(mapRef.current, {
        lat: 37.4961,
        lng: 126.98231,
        level: 3,
      });

      // Store 핀들 추가 (pin 아이콘 사용)
      const storeImage = makeMarkerImage(pinUrl, { width: 36, height: 36 });
      mapData.data.pins.stores.forEach((store) => {
        const storePos = new window.kakao.maps.LatLng(store.store_coord.lat, store.store_coord.lng);
        const storeMarker = new window.kakao.maps.Marker({
          position: storePos,
          image: storeImage,
          map,
        });

        window.kakao.maps.event.addListener(storeMarker, 'click', () => {
          setSelected({ type: 'store', id: store.store_id });
        });

        markers.push(storeMarker);
      });

      // Market 핀들 추가 (market_icon 사용)
      const marketImage = makeMarkerImage(marketIconUrl, { width: 36, height: 36 });
      mapData.data.pins.markets.forEach((market) => {
        const marketPos = new window.kakao.maps.LatLng(
          market.market_coord.lat,
          market.market_coord.lng,
        );
        const marketMarker = new window.kakao.maps.Marker({
          position: marketPos,
          image: marketImage,
          map,
        });

        window.kakao.maps.event.addListener(marketMarker, 'click', () => {
          setSelected({ type: 'market', id: market.market_id });
        });

        markers.push(marketMarker);
      });
    });

    return () => {
      // 모든 마커 제거
      markers.forEach((marker) => {
        if (marker) marker.setMap(null);
      });
    };
  }, [KAKAO_KEY]);

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center">
      {/* 주소 박스 */}
      <div className="absolute top-[4.9rem] left-1/2 -translate-x-1/2 z-10 bg-white w-[80%] h-[4.8rem] pl-[1.5rem] leading-[4.8rem] rounded-xl shadow">
        {mapData.data.road_address}
      </div>

      {/* 카테고리 칩 */}
      <div className="absolute top-[11.1rem] z-10 w-full  px-4 py-2">
        <CategoryChips value={category} onChange={setCategory} />
      </div>

      <div className="absolute top-[16.1rem] z-10 flex items-center gap-2 px-4 py-2 text-white rounded-[3rem] bg-[#FA0]">
        <img src={resetIcon} alt="resetIcon" />
        <span>현 위치에서 검색</span>
      </div>

      {/* 지도 */}
      <div ref={mapRef} className="absolute inset-0 w-full" />

      {/* 상세 바텀시트 */}
      <DetailSheet selected={selected} onClose={() => setSelected(null)} />

      {/* 하단 박스 */}
      <div className="absolute bottom-[8.3rem] left-1/2 -translate-x-1/2 z-10 flex py-[1.4rem] px-[2rem] justify-center items-center gap-2 rounded-3xl border border-[#FF661F] bg-[#FEFEFE] shadow-[0.5px_4px_7px_0_rgba(255,102,31,0.80)]">
        <span className="text-center text-[#FF661F] font-['Pretendard_Variable'] text-[1.4rem] font-semibold leading-none">
          ⛳ AI 코스 추천
        </span>
      </div>
    </div>
  );
};
