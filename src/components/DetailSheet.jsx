import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import HomeBottomsheet from '../components/HomeBottomsheet'; // 업데이트된 컴포넌트
import EntityHeader from '../pages/market/components/EntityHeader';
import InfoRows from '../pages/market/components/InfoRows';
import PhotoStrip from '../pages/market/components/PhotoStrip';
import marketIcon from '../assets/market_icon.svg';
import { marketDetailOptions } from '../apis/home/api';

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
        // 1) 이미 data가 들어오면 그대로 사용
        if (selected.data) {
          if (!cancel) setState({ loading: false, error: null, payload: selected.data });
          return;
        }
        // 2) 가게는 목업 유지 (시장 상세는 아래 별도 쿼리 처리)
        if (selected.type === 'store') {
          const res = (await import('../mocks/store_mocks.json')).default;
          if (!cancel) setState({ loading: false, error: null, payload: res });
        } else {
          throw new Error('Unknown type');
        }
      } catch (e) {
        if (!cancel) setState({ loading: false, error: e, payload: null });
      }
    }
    // 시장 상세는 React Query 사용
    if (selected.type !== 'market') run();
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

  return (
    <HomeBottomsheet open={open} onClose={onClose} onFullPage={handleFullPage}>
      {/* Loading */}
      {((selected?.type !== 'market' && loading) || (isMarket && marketQuery.isLoading)) && (
        <div className="p-6 text-center text-gray-500 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-3"></div>
          불러오는 중…
        </div>
      )}

      {/* Error */}
      {((selected?.type !== 'market' && error) || (isMarket && marketQuery.error)) && (
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

      {!isMarket && !loading && !error && selected?.type === 'store' && payload && (
        <StoreDetail payload={payload} />
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
function StoreDetail({ payload }) {
  const { store, photos = [] } = payload;

  const rows = [
    { label: '종류', value: store.type_name },
    {
      label: '영업시간',
      value: `${formatHHMM(store.opening_hours)} - ${formatHHMM(store.closing_hours)}`,
    },
    { label: '연락처', value: store.phone_number },
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
          <h3 className="text-lg font-semibold text-gray-900">가게 정보</h3>
          <button className="text-sm text-main-1000 hover:text-main-800 transition-colors">
            수정하기
          </button>
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
  // API 응답 필드 사용
  const rows = [
    { label: '주소', value: payload.marketAddress || '정보 없음' },
    { label: '개업연수', value: payload.openingYears ? `${payload.openingYears}년` : '정보 없음' },
    { label: '개설주기', value: payload.openingCycle || '정보 없음' },
    { label: '점포 수', value: `${payload.storeCount ?? 0}개` },
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
      <EntityHeader icon={marketIcon} title={payload.marketName} subtitle={payload.marketAddress} />

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
  return photos.map((p, i) => ({ photo_id: p.photo_id ?? i, photo_url: p.photo_url }));
}
