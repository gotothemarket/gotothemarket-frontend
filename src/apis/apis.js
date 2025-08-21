import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import { k } from './queryKeys';
import { createQueryOptions, createMutationOptions } from './queryOptions';

// ----- Queries -----
export const storeDetailOptions = (storeId) =>
  createQueryOptions({
    queryKey: k.store.detail(storeId),
    queryFn: ({ signal }) => apiGet(`/api/store/${storeId}`, { signal }),
    staleTime: 5 * 60_000,
  });

// (필요 시) 시장별 가게 리스트
export const storesByMarketOptions = (marketId, filters = {}) =>
  createQueryOptions({
    queryKey: k.store.listByMarket(marketId, filters),
    queryFn: ({ signal }) => apiGet(`/api/market/${marketId}`, { signal, params: filters }), // 백엔드 규칙에 맞게 조절
  });

// ----- Mutations -----
export const createStoreOptions = () =>
  createMutationOptions({
    mutationFn: (payload) => apiPost('/api/store', payload),
    invalidateKeys: [k.store.all()],
  });

export const reportStoreOptions = () =>
  createMutationOptions({
    mutationFn: (payload) => apiPost('/api/stores', payload),
    invalidateKeys: [k.store.all()],
  });

export const updateStoreOptions = (storeId) =>
  createMutationOptions({
    mutationFn: (payload) => apiPatch(`/api/store/${storeId}`, payload),
    invalidateKeys: [k.store.detail(storeId), k.store.all()],
  });

export const createReviewOptions = (storeId) =>
  createMutationOptions({
    mutationFn: (payload) => apiPost(`/api/store/${storeId}/review`, payload),
    invalidateKeys: [k.store.reviews(storeId), k.store.detail(storeId)],
  });

export const uploadPhotoOptions = (storeId) =>
  createMutationOptions({
    mutationFn: (payload /* { url or file meta } */) =>
      apiPost(`/api/store/${storeId}/photo`, payload),
    invalidateKeys: [k.store.photos(storeId), k.store.detail(storeId)],
  });

export const deletePhotoOptions = (storeId, photoId) =>
  createMutationOptions({
    mutationFn: () => apiDelete(`/api/store/${storeId}/photo/${photoId}`),
    invalidateKeys: [k.store.photos(storeId), k.store.detail(storeId)],
  });

export const registerLocationOptions = () =>
  createMutationOptions({
    mutationFn: (payload /* { storeId, lat, lng } */) => apiPost('/api/location', payload),
    invalidateKeys: [k.store.location()],
  });

// 즐겨찾기 등록 & 취소 (POST 토글이라고 적혀 있었음)
export const toggleFavoriteOptions = (storeId) =>
  createMutationOptions({
    mutationFn: (payload /* { on: boolean } or 빈값 */) =>
      apiPost(`/api/store/${storeId}/favorite`, payload),
    invalidateKeys: [k.store.favorite(storeId), k.mypage.favorites(), k.store.detail(storeId)],
  });

// 첫 실행 체크 및 뱃지 지급
export const firstLaunchOptions = () =>
  createMutationOptions({
    mutationFn: () => apiPost('/api/session/first-launch?memberId=1'),
  });
