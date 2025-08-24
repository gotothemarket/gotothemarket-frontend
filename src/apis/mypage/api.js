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
    queryFn: ({ signal }) => apiGet('/api/mypage/favorite?memberId=1', { signal, params: filters }),
  });

// 즐겨찾기 삭제
export const deleteFavoriteOptions = (storeId) => ({
  mutationKey: ['deleteFavorite', storeId],
  mutationFn: async () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const response = await fetch(`${baseUrl}/api/stores/${storeId}/toggle-favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'remove',
      }),
    });

    if (!response.ok) {
      throw new Error('즐겨찾기 삭제에 실패했습니다.');
    }

    return response.json();
  },
});

// 내 리뷰/배지
export const myReviewsOptions = (filters = {}) =>
  createQueryOptions({
    queryKey: k.mypage.reviews(filters),
    queryFn: ({ signal }) =>
      apiGet('/api/mypage/review?memberId=1&size=1000', { signal, params: filters }),
  });

export const myBadgesOptions = () =>
  createQueryOptions({
    queryKey: k.mypage.badges(),
    queryFn: ({ signal }) => apiGet('/api/badges?memberId=1', { signal }),
    staleTime: 10 * 60_000,
  });
