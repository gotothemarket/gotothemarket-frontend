// components/MapBox.jsx
import { loadKakaoMaps, createMap, makeMarkerImage, addMarker } from '../../../utils/kakaoMap';
import pinIcon from '../../../assets/pin.svg';
import { useEffect, useRef } from 'react';

export default function MapBox({ title, lat, lng, className = '', sectionClassName = '' }) {
  const ref = useRef(null);
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

  useEffect(() => {
    if (!ref.current) return;
    if (!KAKAO_KEY) return;
    if (lat == null || lng == null) return;

    let marker;

    loadKakaoMaps(KAKAO_KEY)
      .then(() => {
        const { map, center } = createMap(ref.current, { lat, lng, level: 3 });
        const image = makeMarkerImage(pinIcon, { width: 36, height: 36 });
        marker = addMarker(map, center, image);
      })
      .catch((err) => {
        console.error('카카오맵 로딩 에러:', err);
      });

    return () => {
      if (marker) marker.setMap(null);
      if (ref.current) ref.current.innerHTML = '';
    };
  }, [KAKAO_KEY, lat, lng]);

  return (
    <section className={` px-[1.5rem] ${sectionClassName}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div ref={ref} className={`w-full rounded-[2rem] overflow-hidden ${className}`} />
    </section>
  );
}
