import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import PageHeader from './components/PageHeader';
import EntityHeader from './components/EntityHeader';
import InfoRows from './components/InfoRows';
import PhotoStrip from './components/PhotoStrip';
import MapBox from './components/MapBox';
import RatingSummary from './components/RatingSummary';
import ReviewList from './components/ReviewList';

import ReviewModal from '../../components/ReviewModal';
import { formatTime } from '../../utils/formatTime';
import { storeDetailOptions } from '../../apis/apis';
import { useMutation } from '@tanstack/react-query';
import { createReviewOptions } from '../../apis/apis';
import { toggleFavoriteOptions } from '../../apis/apis';

export default function StoreInfo() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, error } = useQuery(storeDetailOptions(id));

  // API 응답 형태를 UI에서 쓰는 형태로 정규화
  const normalized = useMemo(() => {
    const s = data?.data ?? data ?? {};

    const toTimeNumber = (t) => {
      if (t == null) return undefined;
      if (typeof t === 'number') return t;
      const m = String(t).match(/^(\d{1,2}):(\d{2})$/);
      if (m) return Number(m[1]) * 100 + Number(m[2]);
      // e.g. "오전 9시" 같은 포맷은 기본값으로 둠
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

    // 원본 응답에서 store 블록 우선 사용
    const srcStore = s.store ?? {};
    const coord = srcStore.storeCoord ??
      srcStore.coord ??
      srcStore.location ?? {
        lat: srcStore.lat,
        lng: srcStore.lng,
      };

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
    };

    const rs = s.review_summary ?? s.reviewSummary ?? {};
    const review_summary = {
      average_rating: rs.average_rating ?? rs.averageRating ?? 0,
      review_count: rs.review_count ?? rs.reviewCount ?? 0,
    };

    const reviews = Array.isArray(s.reviews)
      ? s.reviews.map((r) => ({
          review_id: r.review_id ?? r.reviewId ?? r.id,
          member_nickname: r.member_nickname ?? r.memberNickname ?? r.nickname,
          created_at: r.created_at ?? r.createdAt,
          rating: r.rating,
          content: r.content,
          badges: r.badges ?? (r.badge ? [r.badge] : []),
        }))
      : [];

    const photos = Array.isArray(s.photos) 
      ? s.photos.map((p, i) => ({
          photo_id: p.photo_id ?? p.photoId ?? p.id ?? i,
          photo_url: p.photo_url ?? p.photoUrl ?? p.url,
        }))
      : [];

    return { store, photos, review_summary, reviews };
  }, [data]);

  // 디버그 로그: 파라미터/원본 응답/정규화된 데이터
  useEffect(() => {
    if (id) console.log('[store_info] route id:', id);
  }, [id]);

  useEffect(() => {
    if (data) console.log('[store_info] raw response:', data);
  }, [data]);

  useEffect(() => {
    if (normalized) console.log('[store_info] normalized:', normalized);
  }, [normalized]);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // 리뷰 등록 뮤테이션
  const createReviewMutation = useMutation(createReviewOptions(id));
  // 즐겨찾기 토글 뮤테이션
  const toggleFavoriteMutation = useMutation(toggleFavoriteOptions(id));

  useEffect(() => {
    if (normalized?.store?.favorite_check != null) {
      setIsBookmarked(Boolean(normalized.store.favorite_check));
    }
  }, [normalized]);

  if (isLoading) {
    return (
      <div className="h-full bg-white overflow-y-scroll scrollbar-hidden">
        <PageHeader onBack={() => navigate(-1)} />
        <div className="px-4 py-8 text-center text-gray-500">가게 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-white overflow-y-scroll scrollbar-hidden">
        <PageHeader onBack={() => navigate(-1)} />
        <div className="px-4 py-8 text-center text-red-500">가게 정보를 불러오지 못했습니다.</div>
      </div>
    );
  }

  const { store, photos, review_summary, reviews } = normalized;

  const handleBack = () => navigate(-1);
  const handleBookmark = async () => {
    try {
      const action = isBookmarked ? 'remove' : 'add';
      await toggleFavoriteMutation.mutateAsync({ action });
      setIsBookmarked((v) => !v);
    } catch (e) {
      alert('즐겨찾기 처리에 실패했습니다.');
    }
  };
  const handleEdit = () => {
    // 제보 폼을 수정 모드로 열기: 기존 데이터 전달
    navigate('/report/form', {
      state: {
        mode: 'edit',
        storeId: store.store_id,
        initial: {
          storeName: store.store_name,
          storeTypeName: store.type_name,
          openingHours: store.opening_hours,
          closingHours: store.closing_hours,
          phoneNumber: store.phone_number,
          coord: store.store_coord,
        },
      },
    });
  };
  const handlePhotoReport = () => console.log('사진 제보하기 클릭');
  const handleReview = () => setIsReviewModalOpen(true);
  const handleReviewSubmit = async (payload) => {
    try {
      await createReviewMutation.mutateAsync(payload);
      setIsReviewModalOpen(false);
      // 성공 시 새로고침 또는 쿼리 무효화는 createMutationOptions의 invalidateKeys로 처리됨
      alert('리뷰가 등록되었습니다.');
    } catch (e) {
      alert('리뷰 등록에 실패했습니다.');
    }
  };

  const infoRows = [
    { label: '종류', value: store.type_name || '정보 없음' },
    {
      label: '영업시간',
      value:
        store.opening_hours != null && store.closing_hours != null
          ? `${formatTime(store.opening_hours)} - ${formatTime(store.closing_hours)}`
          : '정보 없음',
    },
    { label: '연락처', value: store.phone_number || '정보 없음' },
  ];

  return (
    <div className="h-full bg-white overflow-y-scroll scrollbar-hidden">
      <PageHeader onBack={handleBack} />

      <div className="px-4 pb-[10rem]">
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
          storeId={store.store_id}
        />

        {review_summary && (
          <section className="pt-[3rem] px-[1.5rem]">
            <RatingSummary
              average={review_summary.average_rating || 0}
              count={review_summary.review_count || 0}
            />
            <div className="max-h-[50rem] overflow-y-auto scrollbar-hidden">
              <ReviewList reviews={reviews || []} />
            </div>
          </section>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div
        className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white border-t border-gray-200 p-[1.5rem_2.7rem_3rem_2.7rem] z-50"
        style={{ width: 'calc(100% - 2rem)', maxWidth: 'calc(430px - 2rem)' }}
      >
        <button
          onClick={handleReview}
          className="w-full py-4 px-6 rounded-[1rem]"
          style={{
            backgroundColor: '#FF9C1F',
            color: 'white',
            textAlign: 'center',
            fontFamily: 'Pretendard Variable',
            fontSize: '1.4rem',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 'normal',
            height: '4.8rem',
          }}
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
