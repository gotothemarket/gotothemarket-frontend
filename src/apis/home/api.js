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

// 홈 지도 데이터 (/api/home)
export const homeMapOptions = () =>
  createQueryOptions({
    queryKey: k.home.home(),
    queryFn: ({ signal }) => apiGet('/api/home', { signal }),
  });