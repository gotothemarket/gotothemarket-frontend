// /src/features/detail/DetailSheet.jsx
import React, { useEffect, useState } from 'react';
import HomeBottomsheet from '../components/HomeBottomsheet';
import EntityHeader from '../pages/market/components/EntityHeader';
import InfoRows from '../pages/market/components/InfoRows';
import PhotoStrip from '../pages/market/components/PhotoStrip';
import marketIcon from '../assets/market_icon.svg';

// selected: { type: 'store'|'market', id?, data? }
export default function DetailSheet({ selected, onClose, showMap = false }) {
  const open = !!selected;

  const [{ loading, error, payload }, setState] = useState({
    loading: false,
    error: null,
    payload: null,
  });

  useEffect(() => {
    let cancel = false;
    if (!selected) return;

    async function run() {
      setState({ loading: true, error: null, payload: null });

      try {
        // 1) 이미 data가 들어오면 그대로 사용
        if (selected.data) {
          if (!cancel) setState({ loading: false, error: null, payload: selected.data });
          return;
        }
        // 2) 예시: 목업 fetch (실서비스는 API 호출로 교체)
        if (selected.type === 'store') {
          const res = (await import('../mocks/store_mocks.json')).default;
          if (!cancel) setState({ loading: false, error: null, payload: res });
        } else if (selected.type === 'market') {
          const res = (await import('../mocks/market_mocks.json')).default;
          if (!cancel) setState({ loading: false, error: null, payload: res });
        } else {
          throw new Error('Unknown type');
        }
      } catch (e) {
        if (!cancel) setState({ loading: false, error: e, payload: null });
      }
    }
    run();
    return () => {
      cancel = true;
    };
  }, [selected]);

  return (
    <HomeBottomsheet open={open} onClose={onClose} height="78vh">
      {loading && <div className="p-6 text-center text-gray-500">불러오는 중…</div>}
      {error && <div className="p-6 text-center text-red-500">불러오기에 실패했어요</div>}

      {!loading && !error && selected?.type === 'store' && payload && (
        <StoreDetail payload={payload} />
      )}

      {!loading && !error && selected?.type === 'market' && payload && (
        <MarketDetail payload={payload} />
      )}
    </HomeBottomsheet>
  );
}

/* ============================= */
/* ========== STORE ============ */
/* ============================= */
function StoreDetail({ payload }) {
  const { store, photos = [] } = payload;

  const rows = [
    { label: '종류', value: store.type_name },
    {
      label: '영업시간',
      value: `${formatHHMM(store.opening_hours)} - ${formatHHMM(store.closing_hours)}`,
    },
    { label: '연락처', value: store.phone_number },
  ];

  return (
    <div className="px-2">
      <EntityHeader
        icon={store.store_icon}
        title={store.store_name}
        subtitle="대창마니아님 제보"
        // 모달에서는 즐겨찾기 토글 생략 → 버튼 숨김
      />

      <section>
        <div className="flex justify-between px-[1.5rem] pt-[2.4rem]">
          <h3 className="text-lg font-semibold text-gray-900">가게 정보</h3>
          <button className="text-sm text-main-1000">수정하기</button>
        </div>
        <InfoRows rows={rows} />
      </section>

      <PhotoStrip title="가게 사진" photos={normalizePhotos(photos)} />

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
  // 목업/API 형태 방어 (payload.data 형태 or 직접 필드)
  const { market, photos = [] } = payload.data ?? payload;

  const stallText =
    typeof market.stall_store_count === 'number' && market.stall_store_count > 0
      ? ` (노점 ${market.stall_store_count}개)`
      : '';

  const rows = [
    { label: '개업연수', value: market.opening_years ? `${market.opening_years}년` : '정보 없음' },
    { label: '개설주기', value: market.opening_cycle || '정보 없음' },
    { label: '점포 수', value: `${market.fixed_store_count ?? 0}개${stallText}` },
  ];

  return (
    <div className="px-2">
      <EntityHeader icon={marketIcon} title={market.market_name} subtitle={market.market_address} />

      <section className="">
        <InfoRows title="시장 정보" rows={rows} />
      </section>

      <PhotoStrip title="시장 대표 사진" photos={normalizePhotos(photos)} />

      {/* 필요 시 지도를 시트에서도 노출
      {showMap && (
        <MapBox title="시장 위치" lat={market.market_coord?.lat} lng={market.market_coord?.lng} />
      )} */}
    </div>
  );
}

/* ============ helpers ============ */
function formatHHMM(time) {
  const h = Math.floor(time / 100);
  const m = time % 100;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function normalizePhotos(photos) {
  return photos.map((p, i) => ({ photo_id: p.photo_id ?? i, photo_url: p.photo_url }));
}
