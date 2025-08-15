import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeader from './components/PageHeader';
import EntityHeader from './components/EntityHeader';
import InfoRows from './components/InfoRows';
import PhotoStrip from './components/PhotoStrip';
import MapBox from './components/MapBox';
import RatingSummary from './components/RatingSummary';
import ReviewList from './components/ReviewList';

import ReviewModal from '../../components/ReviewModal';
import storeData from '../../mocks/store_mocks.json';
import { formatTime } from '../../utils/formatTime';

export default function StoreInfo() {
  const navigate = useNavigate();

  const [isBookmarked, setIsBookmarked] = useState(storeData.store.favorite_check);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { store, photos, review_summary, reviews } = storeData;

  const handleBack = () => navigate(-1);
  const handleBookmark = () => setIsBookmarked((v) => !v);
  const handleEdit = () => console.log('수정하기 클릭');
  const handlePhotoReport = () => console.log('사진 제보하기 클릭');
  const handleReview = () => setIsReviewModalOpen(true);
  const handleReviewSubmit = (payload) => {
    console.log('리뷰 제출:', payload);
    setIsReviewModalOpen(false);
  };

  const infoRows = [
    { label: '종류', value: store.type_name },
    {
      label: '영업시간',
      value: `${formatTime(store.opening_hours)} - ${formatTime(store.closing_hours)}`,
    },
    { label: '연락처', value: store.phone_number },
  ];

  return (
    <div className="h-full bg-white overflow-y-scroll scrollbar-hidden">
      <PageHeader onBack={handleBack} />

      <div className="px-4 pb-20">
        <EntityHeader
          icon={store.store_icon}
          title={store.store_name}
          subtitle="대창마니아님 제보"
          bookmark={isBookmarked}
          onToggleBookmark={handleBookmark}
        />

        <InfoRows title="가게 정보" rows={infoRows} onEdit={handleEdit} />

        <PhotoStrip
          title="가게 사진"
          photos={photos}
          ctaLabel="사진 제보하기"
          onCta={handlePhotoReport}
          storeId={store.store_id}
        />

        <section className="pt-[3rem] px-[1.5rem]">
          <RatingSummary
            average={review_summary.average_rating}
            count={review_summary.review_count}
          />
          <ReviewList reviews={reviews} />
        </section>

        <MapBox title="가게 위치" lat={store.store_coord.lat} lng={store.store_coord.lng} />
      </div>

      {/* 하단 고정 버튼 */}
      <div
        className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white border-t border-gray-200 p-[1.5rem_2.7rem_3rem_2.7rem] z-50"
        style={{ width: 'calc(100% - 2rem)', maxWidth: 'calc(430px - 2rem)' }}
      >
        <button
          onClick={handleReview}
          className="w-full bg-main-1000 text-white py-4 px-6 rounded-[1rem] font-semibold text-lg h-[4.8rem]"
        >
          리뷰 남기기
        </button>
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
