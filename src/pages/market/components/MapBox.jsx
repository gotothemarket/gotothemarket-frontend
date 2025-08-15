// components/MapBox.jsx
import { loadKakaoMaps, createMap, makeMarkerImage, addMarker } from '../../../utils/kakaoMap';
import pinIcon from '../../../assets/pin.svg';
import { useEffect, useRef } from 'react';

export default function MapBox({ title, lat, lng }) {
  const ref = useRef(null);
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

  useEffect(() => {
    if (!ref.current || !KAKAO_KEY) return;
    let marker;
    loadKakaoMaps(KAKAO_KEY).then(() => {
      const { map, center } = createMap(ref.current, { lat, lng, level: 3 });
      const image = makeMarkerImage(pinIcon, { width: 36, height: 36 });
      marker = addMarker(map, center, image);
    });
    return () => {
      if (marker) marker.setMap(null);
      if (ref.current) ref.current.innerHTML = '';
    };
  }, [KAKAO_KEY, lat, lng]);

  return (
    <section className="pt-[3rem] pb-[10rem] px-[1.5rem]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div ref={ref} className="w-full h-[14.6rem] rounded-[2rem] overflow-hidden" />
    </section>
  );
}
