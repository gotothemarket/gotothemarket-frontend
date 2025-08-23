import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import HomeBottomsheet from '../components/HomeBottomsheet'; // 업데이트된 컴포넌트
import EntityHeader from '../pages/market/components/EntityHeader';
import InfoRows from '../pages/market/components/InfoRows';
import PhotoStrip from '../pages/market/components/PhotoStrip';
import marketIcon from '../assets/market_icon.svg';
import { marketDetailOptions } from '../apis/home/api';
import { storeDetailOptions } from '../apis/apis';

// selected: { type: 'store'|'market', id?, data? }
export default function DetailSheet({ selected, onClose, showMap = false }) {
  const navigate = useNavigate();
  const open = !!selected;

  const [{ loading, error, payload }, setState] = useState({
    loading: false,
    error: null,
    payload: null,
  });

  // 전체 페이지로 전환하는 함수
  const handleFullPage = () => {
    if (!selected) return;

    // 부드러운 전환을 위한 약간의 지연
    setTimeout(() => {
      if (selected.type === 'store') {
        navigate(`/stores/${selected.id}`);
      } else if (selected.type === 'market') {
        navigate(`/markets/${selected.id}`);
      }
      onClose(); // 모달 닫기
    }, 100);
  };

  useEffect(() => {
    let cancel = false;
    if (!selected) return;

    async function run() {
      setState({ loading: true, error: null, payload: null });

      try {
        // 이미 data가 들어오면 그대로 사용
        if (selected.data) {
          if (!cancel) setState({ loading: false, error: null, payload: selected.data });
          return;
        }
        // 쿼리에서 가져오도록 로컬 상태는 비움
        if (!cancel) setState({ loading: false, error: null, payload: null });
      } catch (e) {
        if (!cancel) setState({ loading: false, error: e, payload: null });
      }
    }
    run();
    return () => {
      cancel = true;
    };
  }, [selected]);

  // 시장 상세: API 연동
  const isMarket = selected?.type === 'market';
  const marketId = isMarket ? selected?.id : undefined;
  const marketQuery = useQuery({
    ...marketDetailOptions(marketId),
    enabled: !!isMarket && !!marketId,
  });

  // 가게 상세: API 연동
  const isStore = selected?.type === 'store';
  const storeId = isStore ? selected?.id : undefined;
  const storeQuery = useQuery({
    ...storeDetailOptions(storeId),
    enabled: !!isStore && !!storeId,
  });

  return (
    <HomeBottomsheet open={open} onClose={onClose} onFullPage={handleFullPage}>
      {/* Loading */}
      {((isStore && storeQuery.isLoading) || (isMarket && marketQuery.isLoading)) && (
        <div className="p-6 text-center text-gray-500 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-3"></div>
          불러오는 중…
        </div>
      )}

      {/* Error */}
      {((isStore && storeQuery.error) || (isMarket && marketQuery.error)) && (
        <div className="p-6 text-center text-red-500">
          <div className="mb-2">⚠️</div>
          불러오기에 실패했어요
          <button
            onClick={() => window.location.reload()}
            className="block mx-auto mt-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm"
          >
            다시 시도
          </button>
        </div>
      )}

      {isStore && !storeQuery.isLoading && !storeQuery.error && storeQuery.data && (
        <StoreDetail payload={normalizeStorePayload(storeQuery.data)} navigate={navigate} />
      )}

      {isMarket && !marketQuery.isLoading && !marketQuery.error && marketQuery.data && (
        <MarketDetail payload={marketQuery.data} />
      )}
    </HomeBottomsheet>
  );
}

/* ============================= */
/* ========== STORE ============ */
/* ============================= */
function StoreDetail({ payload, navigate }) {
  const { store, photos = [] } = payload;

  console.log('🔍 StoreDetail payload:', payload);
  console.log('🔍 StoreDetail photos:', photos);

  const rows = [
    { label: '종류', value: store.type_name },
    {
      label: '영업시간',
      value: `${formatHHMM(store.opening_hours)} - ${formatHHMM(store.closing_hours)}`,
    },
    { label: '연락처', value: store.phone_number || '정보 없음' },
    { label: '주소', value: store.store_address || '정보 없음' },
  ];

  return (
    <div className="px-2 pb-6">
      <EntityHeader
        icon={store.store_icon}
        title={store.store_name}
        subtitle="대창마니아님 제보"
        // 모달에서는 즐겨찾기 토글 생략 → 버튼 숨김
      />

      <section>
        <div className="flex justify-between px-[1.5rem] pt-[2.4rem]">
          <h3
            style={{
              color: '#0A0A0A',
              fontFamily: 'Pretendard Variable',
              fontSize: '1.6rem',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
            }}
          >
            가게 정보
          </h3>
          {/* 모달에서는 수정하기 버튼 숨김 */}
          {/* <button
             onClick={() => {
               console.log('🔍 수정하기 버튼 클릭 - 전달할 데이터:', {
                 editMode: true,
                 storeData: store,
                 photos: photos,
               });
               console.log('🔍 좌표 정보 별도 확인:', {
                 store_coord: store.store_coord,
                 lat: store.store_coord?.lat,
                 lng: store.store_coord?.lng,
                 hasCoordinates: !!store.store_coord?.lat && !!store.store_coord?.lng,
               });
               navigate('/report/form', {
                 state: {
                   editMode: true,
                   storeData: store,
                   photos: photos,
                 },
               });
             }}
             className="hover:opacity-80 transition-opacity"
             style={{
               color: '#FF9C1F',
               textAlign: 'right',
               fontFamily: 'Pretendard Variable',
               fontSize: '1.2rem',
               fontStyle: 'normal',
               fontWeight: 600,
               lineHeight: 'normal',
             }}
           >
             수정하기
           </button> */}
        </div>
        <InfoRows rows={rows} />
      </section>

      <PhotoStrip title="가게 사진" photos={normalizePhotos(photos)} storeId={store.store_id} />

      {/* 시트 안에 지도를 넣고 싶으면 주석 해제
      {showMap && (
        <MapBox title="가게 위치" lat={store.store_coord?.lat} lng={store.store_coord?.lng} />
      )} */}
    </div>
  );
}

/* ============================= */
/* ========== MARKET =========== */
/* ============================= */
function MarketDetail({ payload }) {
  // API 응답 필드 사용
  const rows = [
    { label: '점포 수', value: `${payload.storeCount ?? 0}개` },
    { label: '개설주기', value: payload.openingCycle || '정보 없음' },
    { label: '교통', value: payload.transport || '정보 없음' },
    { label: '주차', value: payload.parking ? '가능' : '불가' },
    { label: '화장실', value: payload.toilet ? '있음' : '없음' },
  ];

  const photos = (payload.marketMainImageUrls || []).map((url, i) => ({
    photo_id: i,
    photo_url: url,
  }));

  return (
    <div className="px-2 pb-6">
      <EntityHeader
        icon={marketIcon}
        title={payload.marketName}
        subtitle={payload.marketAddress}
        isMarket={true}
        openingYears={payload.openingYears}
      />

      <section className="">
        <InfoRows title="시장 정보" rows={rows} />
      </section>

      <PhotoStrip title="시장 대표 사진" isMarket={true} photos={normalizePhotos(photos)} />
    </div>
  );
}

/* ============ helpers ============ */
function formatHHMM(time) {
  if (!time) return '정보 없음';
  const h = Math.floor(time / 100);
  const m = time % 100;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function normalizePhotos(photos) {
  console.log('🔍 normalizePhotos input:', photos);
  const normalized = photos.map((p, i) => ({
    photo_id: p.photo_id ?? p.photoId ?? p.id ?? i,
    photo_url: p.photo_url ?? p.photoUrl ?? p.url,
  }));
  console.log('🔍 normalizePhotos output:', normalized);
  return normalized;
}

/* ============ helpers (store normalize) ============ */
function normalizeStorePayload(data) {
  console.log('🔍 normalizeStorePayload input:', data);
  const s = data?.data ?? data ?? {};
  console.log('🔍 normalizeStorePayload s:', s);
  console.log('🔍 normalizeStorePayload s.photos:', s.photos);

  const toTimeNumber = (t) => {
    if (t == null) return undefined;
    if (typeof t === 'number') return t;
    const m = String(t).match(/^(\d{1,2}):(\d{2})$/);
    if (m) return Number(m[1]) * 100 + Number(m[2]);
    return undefined;
  };

  const typeLabelByNumber = {
    1: '과일·야채',
    2: '수산',
    3: '식당',
    4: '빵·떡',
    5: '잡화',
    6: '길거리음식',
    7: '축산',
    8: '의류',
  };

  const srcStore = s.store ?? s;
  // 좌표 정보 추출 - storeCoord가 있으면 그대로 사용, 없으면 다른 필드들 확인
  let coord;
  if (srcStore.storeCoord && srcStore.storeCoord.lat && srcStore.storeCoord.lng) {
    coord = srcStore.storeCoord;
  } else if (srcStore.coord && srcStore.coord.lat && srcStore.coord.lng) {
    coord = srcStore.coord;
  } else if (srcStore.location && srcStore.location.lat && srcStore.location.lng) {
    coord = srcStore.location;
  } else if (srcStore.store_coord && srcStore.store_coord.lat && srcStore.store_coord.lng) {
    coord = srcStore.store_coord;
  } else if (srcStore.coordinates && srcStore.coordinates.lat && srcStore.coordinates.lng) {
    coord = srcStore.coordinates;
  } else {
    // 개별 lat, lng 필드 확인
    const lat = srcStore.lat ?? srcStore.latitude ?? srcStore.store_lat;
    const lng = srcStore.lng ?? srcStore.longitude ?? srcStore.store_lng;
    if (lat && lng) {
      coord = { lat, lng };
    } else {
      coord = null;
    }
  }

  console.log('🔍 좌표 정보 추출:', {
    storeCoord: srcStore.storeCoord,
    coord: srcStore.coord,
    location: srcStore.location,
    store_coord: srcStore.store_coord,
    coordinates: srcStore.coordinates,
    lat: srcStore.lat,
    latitude: srcStore.latitude,
    store_lat: srcStore.store_lat,
    lng: srcStore.lng,
    longitude: srcStore.longitude,
    store_lng: srcStore.store_lng,
    finalCoord: coord,
  });

  const store = {
    store_id: srcStore.storeId ?? srcStore.id,
    store_name: srcStore.storeName ?? srcStore.name,
    store_icon: srcStore.storeIcon ?? srcStore.icon,
    favorite_check: Boolean(srcStore.favoriteCheck ?? srcStore.favorite_check),
    store_coord: coord,
    type_name:
      srcStore.typeName ?? typeLabelByNumber?.[srcStore.storeType] ?? srcStore.type_name ?? '',
    opening_hours: toTimeNumber(srcStore.openingHours ?? srcStore.opening_hours),
    closing_hours: toTimeNumber(srcStore.closingHours ?? srcStore.closing_hours),
    phone_number: srcStore.phoneNumber ?? srcStore.phone_number ?? '',
    store_address: srcStore.storeAddress ?? srcStore.address ?? srcStore.store_address ?? '',
  };

  const photos = Array.isArray(s.photos)
    ? s.photos.map((p, i) => ({
        photo_id: p.photo_id ?? p.photoId ?? p.id ?? i,
        photo_url: p.photo_url ?? p.photoUrl ?? p.url,
      }))
    : [];

  return { store, photos };
}
