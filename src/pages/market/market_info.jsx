import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import PageHeader from './components/PageHeader';
import EntityHeader from './components/EntityHeader';
import InfoRows from './components/InfoRows';
import PhotoStrip from './components/PhotoStrip';
import MapBox from './components/MapBox';

import marketIcon from '../../assets/market_icon.svg';
import { marketDetailOptions } from '../../apis/home/api';
import leftArrowWhite from '../../assets/left_arrow_white.svg';

export default function MarketInfo() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, error } = useQuery(marketDetailOptions(id));

  const normalized = useMemo(() => {
    const s = data?.data ?? data ?? {};
    const rows = [
      { label: '점포 수', value: `${s.storeCount ?? 0}개` },
      { label: '개설주기', value: s.openingCycle || '정보 없음' },
      { label: '교통', value: s.transport || '정보 없음' },
      { label: '주차', value: s.parking ? '가능' : '불가' },
      { label: '화장실', value: s.toilet ? '있음' : '없음' },
    ];
    const photos = (s.marketMainImageUrls || []).map((url, i) => ({ photo_url: url, photo_id: i }));
    const eventImages = Array.isArray(s.marketEventImageUrls) ? s.marketEventImageUrls : [];
    return { s, rows, photos, eventImages };
  }, [data]);

  // 디버그 로그: 파라미터/원본 응답/정규화된 데이터
  useEffect(() => {
    if (id) console.log('[market_info] route id:', id);
  }, [id]);
  useEffect(() => {
    if (data) console.log('[market_info] raw response:', data);
  }, [data]);
  useEffect(() => {
    if (normalized) console.log('[market_info] normalized:', normalized);
  }, [normalized]);

  const { s, rows, photos, eventImages } = normalized;
  const [eventIndex, setEventIndex] = useState(0);
  const eventScrollRef = useRef(null);
  useEffect(() => {
    setEventIndex(0);
  }, [eventImages?.length]);
  const handleEventScroll = () => {
    const el = eventScrollRef.current;
    if (!el) return;
    const width = el.clientWidth;
    if (!width) return;
    const idx = Math.round(el.scrollLeft / width);
    if (idx !== eventIndex) setEventIndex(idx);
  };
  const goToEventIndex = (i) => {
    const el = eventScrollRef.current;
    if (!el) return;
    const width = el.clientWidth;
    el.scrollTo({ left: width * i, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="h-full bg-white overflow-y-scroll scrollbar-hidden">
        <PageHeader onBack={() => navigate(-1)} />
        <div className="px-4 py-8 text-center text-gray-500">시장 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-white overflow-y-scroll scrollbar-hidden">
        <PageHeader onBack={() => navigate(-1)} />
        <div className="px-4 py-8 text-center text-red-500">시장 정보를 불러오지 못했습니다.</div>
      </div>
    );
  }

  const handleBack = () => navigate(-1);
  const handlePhotoReport = () => console.log('시장 사진 제보하기');

  // 표시값 유틸 (필요 시 사용)
  // const yesNo = (b) => (b ? '있음' : '없음');

  return (
    <div className="h-full bg-white overflow-y-scroll scrollbar-hidden">
      <PageHeader onBack={handleBack} />

      <div className="px-4 pb-12">
        <EntityHeader
          icon={marketIcon}
          className="h-full" // 필요 시 시장 아이콘 경로로 교체
          title={s.marketName}
          subtitle={s.marketAddress} // 상단 서브텍스트는 주소 노출
          // bookmark 생략 (원하면 bookmark, onToggleBookmark 추가)
          isMarket={true}
          openingYears={s.openingYears} // 개설주기
        />

        <InfoRows title="전통시장 정보" rows={rows} />

        <PhotoStrip
          title="시장 대표 사진"
          photos={photos}
          ctaLabel="사진 제보하기"
          onCta={handlePhotoReport}
          isMarket={true}
        />

        {Array.isArray(eventImages) && eventImages.length > 0 && (
          <section className="mt-6">
            <div className="px-[1.5rem]">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">행사 정보</h3>
            </div>
            <div className="px-[1.5rem]">
              {/* Scrollable carousel */}
              <div
                ref={eventScrollRef}
                onScroll={handleEventScroll}
                className="w-full h-[14.6rem] overflow-x-auto scrollbar-hidden scroll-smooth snap-x snap-mandatory flex"
              >
                {eventImages.map((url, i) => (
                  <div
                    key={i}
                    className="shrink-0 basis-full h-[14.6rem] rounded-[2rem] overflow-hidden bg-gray-100 snap-center mr-0"
                  >
                    <img
                      src={url}
                      alt={`시장 행사 이미지 ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-2 mt-3">
                {eventImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToEventIndex(i)}
                    className={`w-2 h-2 rounded-full ${i === eventIndex ? 'bg-[#FF661F]' : 'bg-gray-300'}`}
                    aria-label={`행사 이미지 ${i + 1} 보기`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
