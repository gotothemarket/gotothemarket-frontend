// 직렬화 가능한 값만 키에 넣기!
export const k = {
  store: {
    all: () => ['store'],
    detail: (storeId) => ['store', 'detail', storeId],
    reviews: (storeId) => ['store', 'reviews', storeId],
    photos: (storeId) => ['store', 'photos', storeId],
    favorite: (storeId) => ['store', 'favorite', storeId],
    location: () => ['store', 'location'], // 좌표 등록
    listByMarket: (marketId, filters = {}) => ['store', 'listByMarket', marketId, filters],
  },

  home: {
    marketDetail: (marketId) => ['home', 'market', marketId],
    map: (params = {}) => ['home', 'map', params],
    home: () => ['home', 'home'],
  },

  mypage: {
    all: () => ['mypage'],
    favorites: (filters = {}) => ['mypage', 'favorites', filters],
    favoriteItem: (favoriteId) => ['mypage', 'favorite', favoriteId],
    reviews: (filters = {}) => ['mypage', 'reviews', filters],
    badges: () => ['mypage', 'badges'],
  },

  ai: {
    recommend: (payloadShape = 'default') => ['ai', 'recommend', payloadShape], // POST는 mutate용; 키는 무효화용
    keywords: (type, keyword) => ['ai', 'keywords', { type, keyword }],
  },
};
