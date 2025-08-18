import React from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeader from './components/PageHeader';
import EntityHeader from './components/EntityHeader';
import InfoRows from './components/InfoRows';
import PhotoStrip from './components/PhotoStrip';
import MapBox from './components/MapBox';

import marketPayload from '../../mocks/market_mocks.json';
import marketIcon from '../../assets/market_icon.svg';

export default function MarketInfo() {
  const navigate = useNavigate();

  // API/목업 해체
  const { market, photos = [] } = marketPayload.data;

  const handleBack = () => navigate(-1);
  const handleEdit = () => console.log('시장 정보 수정');
  const handlePhotoReport = () => console.log('시장 사진 제보하기');

  // 표시값 유틸
  const yesNo = (b) => (b ? '있음' : '없음');

  // 점포/노점 표기: 노점이 있으면 함께 표기
  const stallText =
    typeof market.stall_store_count === 'number' && market.stall_store_count > 0
      ? ` (노점 ${market.stall_store_count}개)`
      : '';

  // InfoRows용 라인업
  const rows = [
    { label: '개설연도', value: market.opening_years ? `${market.opening_years}년` : '정보 없음' },
    { label: '개설주기', value: market.opening_cycle || '정보 없음' },
    { label: '점포 수', value: `${market.fixed_store_count ?? 0}개${stallText}` },
  ];

  // PhotoStrip은 photo_id 없어도 idx fallback으로 키 처리됨
  const photoList = photos.map((p, i) => ({ photo_url: p.photo_url, photo_id: i }));

  return (
    <div className="h-full bg-white overflow-y-scroll scrollbar-hidden">
      <PageHeader onBack={handleBack} />

      <div className="px-4 pb-12">
        <EntityHeader
          icon={marketIcon}
          className="h-full" // 필요 시 시장 아이콘 경로로 교체
          title={market.market_name}
          subtitle={market.market_address} // 상단 서브텍스트는 주소 노출
          // bookmark 생략 (원하면 bookmark, onToggleBookmark 추가)
        />

        <InfoRows title="전통시장 정보" rows={rows} onEdit={handleEdit} />

        <PhotoStrip
          title="시장 대표 사진"
          photos={photoList}
          ctaLabel="사진 제보하기"
          onCta={handlePhotoReport}
          isMarket={true}
        />

        <MapBox title="시장 위치" lat={market.market_coord?.lat} lng={market.market_coord?.lng} />
      </div>
    </div>
  );
}
