// Kakao Maps SDK 로더 + 유틸
let kakaoLoadingPromise = null;

/** Kakao Maps SDK를 로드하고 window.kakao 반환 */
export function loadKakaoMaps(appKey) {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR not supported'));

  // 이미 로드되어 있고 maps 객체도 사용 가능한 경우
  if (window.kakao?.maps && typeof window.kakao.maps.load === 'function') {
    return Promise.resolve(window.kakao);
  }

  if (kakaoLoadingPromise) return kakaoLoadingPromise;

  kakaoLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.async = true;
    script.onerror = () => reject(new Error('Failed to load Kakao Maps SDK'));
    script.onload = () => {
      if (window.kakao?.maps?.load) {
        window.kakao.maps.load(() => resolve(window.kakao));
      } else {
        reject(new Error('Kakao Maps SDK loaded but maps object not available'));
      }
    };
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
  const options = {
    center,
    level,
    draggable: true,        // 드래그 가능
    zoomable: true,         // 확대/축소 가능
    scrollwheel: true,      // 마우스 휠로 확대/축소 가능
    disableDoubleClick: false, // 더블클릭 확대 가능
    disableDoubleTap: false,   // 더블탭 확대 가능 (모바일)
    keyboardShortcuts: true,   // 키보드 단축키 활성화
  };
  const map = new window.kakao.maps.Map(container, options);
  
  // 확대/축소 이벤트 리스너 추가
  window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
    console.log('🔍 현재 확대 레벨:', map.getLevel());
  });
  
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
