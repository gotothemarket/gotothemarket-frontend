// Kakao Maps SDK 로더 + 유틸
let kakaoLoadingPromise = null;

/** Kakao Maps SDK를 로드하고 window.kakao 반환 */
export function loadKakaoMaps(appKey) {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR not supported'));
  if (window.kakao?.maps) return Promise.resolve(window.kakao);
  if (kakaoLoadingPromise) return kakaoLoadingPromise;

  kakaoLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onerror = () => reject(new Error('Failed to load Kakao Maps SDK'));
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao));
    document.head.appendChild(script);
  });

  return kakaoLoadingPromise;
}

/** LatLng 헬퍼 */
export function toLatLng(lat, lng) {
  return new window.kakao.maps.LatLng(lat, lng);
}

/** 지도 생성 */
export function createMap(container, { lat, lng, level = 3 }) {
  const center = toLatLng(lat, lng);
  const map = new window.kakao.maps.Map(container, { center, level });
  return { map, center };
}

/** 마커 이미지 생성 (SVG/PNG 등) */
export function makeMarkerImage(url, { width = 36, height = 36, anchorX, anchorY } = {}) {
  const size = new window.kakao.maps.Size(width, height);
  const offset = new window.kakao.maps.Point(anchorX ?? Math.round(width / 2), anchorY ?? height);
  return new window.kakao.maps.MarkerImage(url, size, { offset });
}

/** 마커 추가 */
export function addMarker(map, position, image) {
  const marker = new window.kakao.maps.Marker({ position, image });
  marker.setMap(map);
  return marker;
}
