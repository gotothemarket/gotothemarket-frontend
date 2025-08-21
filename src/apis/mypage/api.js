import { apiGet, apiDelete } from '../client';
import { k } from '../queryKeys';
import { createQueryOptions, createMutationOptions } from '../queryOptions';

// 마이페이지 전체
export const mypageAllOptions = () =>
  createQueryOptions({
    queryKey: k.mypage.all(),
    queryFn: ({ signal }) => apiGet('/api/mypage?memberId=1', { signal }),
    staleTime: 60_000,
  });

// 즐겨찾기 목록
export const favoritesOptions = (filters = {}) =>
  createQueryOptions({
    queryKey: k.mypage.favorites(filters),
    queryFn: ({ signal }) => apiGet('/api/mypage/favorite', { signal, params: filters }),
  });

// 즐겨찾기 삭제
export const deleteFavoriteOptions = (favoriteId) =>
  createMutationOptions({
    mutationFn: () => apiDelete(`/api/mypage/favorite/${favoriteId}`),
    invalidateKeys: [k.mypage.favorites(), k.store.all()],
  });

// 내 리뷰/배지
export const myReviewsOptions = (filters = {}) =>
  createQueryOptions({
    queryKey: k.mypage.reviews(filters),
    queryFn: ({ signal }) => apiGet('/api/mypage/review', { signal, params: filters }),
  });

export const myBadgesOptions = () =>
  createQueryOptions({
    queryKey: k.mypage.badges(),
    queryFn: ({ signal }) => apiGet('/api/mypage/badge', { signal }),
    staleTime: 10 * 60_000,
  });
