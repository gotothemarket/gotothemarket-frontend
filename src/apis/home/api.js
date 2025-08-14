import { apiGet } from '../client';
import { k } from '../queryKeys';
import { createQueryOptions } from '../queryOptions';

// 시장 상세
export const marketDetailOptions = (marketId) =>
  createQueryOptions({
    queryKey: k.home.marketDetail(marketId),
    queryFn: ({ signal }) => apiGet(`/api/market/${marketId}`, { signal }),
    staleTime: 5 * 60_000,
  });

// 지도 조회 (/api/map?...)
export const mapOptions = (params = {}) =>
  createQueryOptions({
    queryKey: k.home.map(params),
    queryFn: ({ signal }) => apiGet('/api/map', { signal, params }),
  });
