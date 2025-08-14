import { apiGet, apiPost } from '../client';
import { k } from '../queryKeys';
import { createQueryOptions, createMutationOptions } from '../queryOptions';

// 코스 추천 (POST) — mutate용
export const courseRecommendOptions = (payloadShape = 'default') =>
  createMutationOptions({
    mutationFn: (payload) => apiPost('/api/ai', payload),
    invalidateKeys: [k.ai.recommend(payloadShape)],
  });

// 키워드 조회 (/api/ai/type?keyword=업종)
export const aiKeywordsOptions = ({ type, keyword }) =>
  createQueryOptions({
    queryKey: k.ai.keywords(type, keyword),
    queryFn: ({ signal }) => apiGet('/api/ai/type', { signal, params: { keyword, type } }),
    staleTime: 30 * 60_000,
  });
