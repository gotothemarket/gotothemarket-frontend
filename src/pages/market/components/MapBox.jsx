// components/MapBox.jsx
import { loadKakaoMaps, createMap, makeMarkerImage, addMarker } from '../../../utils/kakaoMap';
import pinIcon from '../../../assets/pin.svg';
import { useEffect, useRef } from 'react';

export default function MapBox({
  title,
  lat,
  lng,
  markers = [],
  className = '',
  sectionClassName = '',
  zoomLevel = 3,
  fitBounds = false,
}) {
  const ref = useRef(null);
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

  useEffect(() => {
    if (!ref.current) return;
    if (!KAKAO_KEY) return;
    if (lat == null || lng == null) return;

    let markerInstances = [];

    loadKakaoMaps(KAKAO_KEY)
      .then(() => {
        // 마커가 있는 경우 마커들의 중심점을 계산하여 지도 중심 설정
        let mapCenter = { lat, lng };
        let mapLevel = zoomLevel;

        if (markers && markers.length > 0) {
          const validMarkers = markers.filter((marker) => marker.coord && marker.coord.coordinates);

          if (validMarkers.length > 0) {
            // 모든 마커의 좌표를 수집
            const coordinates = validMarkers.map((marker) => marker.coord.coordinates);

            // 위도와 경도의 최소/최대값 계산
            const lats = coordinates.map((coord) => coord[1]);
            const lngs = coordinates.map((coord) => coord[0]);

            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);

            // 중심점 계산
            const centerLat = (minLat + maxLat) / 2;
            const centerLng = (minLng + maxLng) / 2;

            // fitBounds가 true일 때 적절한 줌 레벨 계산 (마커들이 모두 보이면서 최대한 확대)
            if (fitBounds) {
              const latDiff = maxLat - minLat;
              const lngDiff = maxLng - minLng;
              const maxDiff = Math.max(latDiff, lngDiff);

              // 마커들 사이의 거리에 따라 적절한 줌 레벨 설정
              if (maxDiff > 0.01)
                mapLevel = 1; // 매우 넓은 범위
              else if (maxDiff > 0.005)
                mapLevel = 2; // 넓은 범위
              else if (maxDiff > 0.002)
                mapLevel = 3; // 중간 범위
              else if (maxDiff > 0.001)
                mapLevel = 4; // 좁은 범위
              else if (maxDiff > 0.0005)
                mapLevel = 5; // 매우 좁은 범위
              else mapLevel = 6; // 최대 확대
            }

            mapCenter = { lat: centerLat, lng: centerLng };
          }
        }

        const { map } = createMap(ref.current, { ...mapCenter, level: mapLevel });

        // 마커들 추가
        if (markers && markers.length > 0) {
          markers.forEach((markerData, index) => {
            if (markerData.coord && markerData.coord.coordinates) {
              const [lng, lat] = markerData.coord.coordinates;
              const markerPosition = new window.kakao.maps.LatLng(lat, lng);

              // 커스텀 오버레이로 숫자만 표시 (기본 마커 없음)
              const customOverlay = new window.kakao.maps.CustomOverlay({
                position: markerPosition,
                content: `
                  <div style="
                    width: 32px; 
                    height: 32px; 
                    background: #FF9C1F; 
                    border: 2px solid white; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-weight: bold; 
                    font-size: 14px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    cursor: pointer;
                  ">
                    ${index + 1}
                  </div>
                `,
                xAnchor: 0.5,
                yAnchor: 1,
              });

              customOverlay.setMap(map);

              // 커스텀 오버레이에 클릭 이벤트 추가
              setTimeout(() => {
                const overlayElement = customOverlay.getContent();
                if (overlayElement && overlayElement.nodeType === 1) {
                  overlayElement.addEventListener('click', () => {
                    console.log(`마커 ${index + 1} 클릭:`, markerData.store_name);
                  });
                }
              }, 100);

              markerInstances.push(customOverlay);
            }
          });
        }
      })
      .catch((err) => {
        console.error('카카오맵 로딩 에러:', err);
      });

    return () => {
      // 모든 마커 제거
      markerInstances.forEach((marker) => {
        if (marker) marker.setMap(null);
      });
      if (ref.current) ref.current.innerHTML = '';
    };
  }, [KAKAO_KEY, lat, lng, markers, zoomLevel, fitBounds]);

  return (
    <section className={` px-[1.5rem] ${sectionClassName}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div ref={ref} className={`w-full rounded-[2rem] overflow-hidden ${className}`} />
    </section>
  );
}