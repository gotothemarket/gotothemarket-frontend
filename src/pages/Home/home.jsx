import React, { useEffect, useRef, useState } from 'react';
import pinUrl from '../../assets/pin.svg';
import { loadKakaoMaps, createMap, makeMarkerImage, addMarker } from '../../utils/kakaoMap';
import CategoryChips from '../../components/CategoryChips';
import resetIcon from '../../assets/resetIcon.svg';

export const Home = () => {
  const mapRef = useRef(null);
  const [category, setCategory] = useState(null); // 선택된 카테고리 (단일)
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

  useEffect(() => {
    if (!mapRef.current || !KAKAO_KEY) return;

    let marker;

    loadKakaoMaps(KAKAO_KEY).then(() => {
      const { map, center } = createMap(mapRef.current, {
        lat: 37.5665, // 서울시청
        lng: 126.978,
        level: 3,
      });

      const image = makeMarkerImage(pinUrl, { width: 36, height: 36 });
      marker = addMarker(map, center, image);

      // TODO: category가 바뀔 때 마커/레이어를 필터링하려면
      // queryClient + 서버 호출 or 클러스터/오버레이 갱신 로직을 여기서 추가하면 됩니다.
    });

    return () => {
      if (marker) marker.setMap(null);
    };
  }, [KAKAO_KEY]);

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center">
      {/* 주소 박스 */}
      <div className="absolute top-[4.9rem] left-1/2 -translate-x-1/2 z-10 bg-white w-[30rem] h-[4.8rem] pl-[1.5rem] leading-[4.8rem] rounded-xl shadow">
        서울 동작구 동작대로29길 13
      </div>

      {/* ▼ 가게 종류 칩 (요청 위치에 배치) */}
      <div className="absolute top-[11.1rem] z-10 w-full  px-4 py-2">
        <CategoryChips value={category} onChange={setCategory} />
      </div>

      <div className="absolute top-[16.1rem] z-10 flex items-center gap-2 px-4 py-2 text-white rounded-[3rem] bg-[#FA0]">
        <img src={resetIcon} alt="resetIcon" />
        <span>현 위치에서 검색</span>
      </div>

      {/* 지도 */}
      <div ref={mapRef} className="absolute inset-0 w-full" />
    </div>
  );
};
