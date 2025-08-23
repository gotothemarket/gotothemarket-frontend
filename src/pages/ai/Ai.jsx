import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../../components/Header';
import CategoryChip from '../../components/CategoryChip';
import AiResult from './AiResult';
import produceIcon from '../../assets/과일야채.svg';
import seafoodIcon from '../../assets/수산.svg';
import restaurantIcon from '../../assets/요리.svg';
import clothingIcon from '../../assets/의류.svg';
import miscIcon from '../../assets/잡화.svg';
import meatIcon from '../../assets/축산.svg';
import streetIcon from '../../assets/길거리.svg';
import bakeryIcon from '../../assets/빵떡.svg';

const Ai = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [storeSets, setStoreSets] = useState([]); // 최대 4개까지 저장
  const [currentSetIndex, setCurrentSetIndex] = useState(0); // 현재 선택 중인 세트 인덱스
  const [showAiResult, setShowAiResult] = useState(false); // AiResult 모달 표시 여부

  // 전달받은 좌표
  const centerLat = location.state?.centerLat || 37.4961;
  const centerLng = location.state?.centerLng || 126.98231;

  console.log('🎯 AI 페이지 진입');
  console.log('📍 전달받은 좌표:', { centerLat, centerLng });
  console.log('📍 location.state:', location.state);

  // 가장 가까운 시장 API 호출
  const {
    data: nearestMarketData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['nearestMarket', centerLat, centerLng],
    queryFn: async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const apiUrl = `${baseUrl}/api/markets/nearest?lat=${centerLat}&lng=${centerLng}`;

      console.log('🌐 API 호출 시작:', apiUrl);
      console.log('🔑 환경변수 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

      const response = await fetch(apiUrl);
      console.log('📡 API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error('가장 가까운 시장 정보를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      console.log('📊 API 응답 데이터:', data);
      return data;
    },
    enabled: !!centerLat && !!centerLng,
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 업종별 키워드 API 호출
  const {
    data: keywordData,
    isLoading: keywordLoading,
    error: keywordError,
  } = useQuery({
    queryKey: ['aiTypeKeywords', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return null;

      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const categoryLabel =
        categories.find((cat) => cat.id === selectedCategory)?.label || selectedCategory;
      const apiUrl = `${baseUrl}/api/ai/type?keyword=${encodeURIComponent(categoryLabel)}`;

      console.log('🔍 키워드 API 호출 시작:', apiUrl);
      console.log('🏷️ 선택된 업종:', categoryLabel);

      const response = await fetch(apiUrl);
      console.log('📡 키워드 API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error('업종별 키워드 정보를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      console.log('📊 키워드 API 응답 데이터:', data);
      return data;
    },
    enabled: !!selectedCategory,
    staleTime: 5 * 60 * 1000, // 5분
  });

  console.log('🔄 API 쿼리 상태:', { isLoading, error });
  console.log('📋 nearestMarketData:', nearestMarketData);
  console.log('🔑 키워드 API 상태:', { keywordLoading, keywordError });
  console.log('📋 keywordData:', keywordData);

  const nearestMarket = nearestMarketData?.data;
  console.log('🏪 가장 가까운 시장 정보:', nearestMarket);
  console.log('🔍 nearestMarket 구조:', JSON.stringify(nearestMarket, null, 2));

  const categories = [
    { id: 'misc', label: '잡화', icon: miscIcon },
    { id: 'meat', label: '축산', icon: meatIcon },
    { id: 'street', label: '길거리음식', icon: streetIcon },
    { id: 'bakery', label: '빵·떡', icon: bakeryIcon },
    { id: 'produce', label: '과일·야채', icon: produceIcon },
    { id: 'seafood', label: '수산', icon: seafoodIcon },
    { id: 'restaurant', label: '식당', icon: restaurantIcon },
    { id: 'clothing', label: '의류', icon: clothingIcon },
  ];

  // 목데이터 - 과일·야채 카테고리 선택 시
  const mockData = {
    success: true,
    status: 200,
    data: {
      store_type: {
        id: 1,
        name: '과일·야채',
      },
      groups: [
        {
          vibe_type_id: 1,
          vibe_type_name: '맛·품질',
          keywords: [
            {
              code: 101,
              label_code: '맛있음',
              display: '음식이 맛있어요',
            },
            {
              code: 102,
              label_code: '신선함',
              display: '신선도가 뛰어나요',
            },
            {
              code: 103,
              label_code: '양',
              display: '양이 뛰어나요',
            },
            {
              code: 104,
              label_code: '원산지',
              display: '원산지가 분명해요',
            },
          ],
        },
        {
          vibe_type_id: 2,
          vibe_type_name: '서비스',
          keywords: [
            {
              code: 201,
              label_code: '친절',
              display: '사장님이 친절해요',
            },
            {
              code: 202,
              label_code: '요청',
              display: '요청사항을 잘 들어줘요',
            },
            {
              code: 203,
              label_code: '결제',
              display: '결제가 편리해요',
            },
            {
              code: 204,
              label_code: '대기',
              display: '대기가 짧거나 편안해요',
            },
          ],
        },
        {
          vibe_type_id: 3,
          vibe_type_name: '가격',
          keywords: [
            {
              code: 301,
              label_code: '가성비',
              display: '가성비가 좋아요',
            },
            {
              code: 302,
              label_code: '서비스',
              display: '서비스',
            },
            {
              code: 303,
              label_code: '카드결제',
              display: '카드 결제',
            },
            {
              code: 304,
              label_code: '지역화폐',
              display: '지역화폐',
            },
          ],
        },
      ],
    },
  };

  // API 응답 데이터 또는 mockData 사용
  const getSelectedCategoryData = () => {
    if (selectedCategory && keywordData?.data) {
      return keywordData.data;
    }
    // API 데이터가 없을 때만 mockData 사용 (개발용)
    if (selectedCategory === 'produce') {
      return mockData.data;
    }
    return null;
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedConditions([]); // 카테고리 변경 시 선택된 조건 초기화
  };

  const handleConditionToggle = (conditionCode) => {
    setSelectedConditions((prev) => {
      if (prev.includes(conditionCode)) {
        return prev.filter((code) => code !== conditionCode);
      } else {
        if (prev.length < 5) {
          // 최대 5개 선택
          return [...prev, conditionCode];
        }
        return prev;
      }
    });
  };

  const handleAddStore = () => {
    if (selectedCategory && selectedConditions.length > 0) {
      const newSet = {
        store_type: getStoreTypeId(selectedCategory),
        keywords: getSelectedConditionLabels(selectedConditions),
      };

      setStoreSets((prev) => [...prev, newSet]);
      setSelectedCategory(null);
      setSelectedConditions([]);
      setCurrentSetIndex((prev) => prev + 1);
    }
  };

  const getStoreTypeId = (categoryId) => {
    // 카테고리 ID를 store_type ID로 매핑
    const categoryMap = {
      produce: 1,
      seafood: 2,
      restaurant: 3,
      clothing: 4,
      misc: 5,
      meat: 6,
      street: 7,
      bakery: 8,
    };
    return categoryMap[categoryId] || 1;
  };

  const getSelectedConditionLabels = (conditionCodes) => {
    // 선택된 조건 코드를 라벨로 변환
    const allKeywords = [];
    const categoryData = getSelectedCategoryData();
    if (categoryData?.groups) {
      categoryData.groups.forEach((group) => {
        group.keywords.forEach((keyword) => {
          if (conditionCodes.includes(keyword.code)) {
            allKeywords.push(keyword.display);
          }
        });
      });
    }
    return allKeywords;
  };

  const handleSubmitRecommendation = async () => {
    if (storeSets.length === 0) {
      alert('최소 하나의 가게를 선택해주세요.');
      return;
    }

    const requestBody = {
      market_id: nearestMarket?.marketId || nearestMarket?.market_id || 1,
      sets: storeSets,
    };

    console.log('코스 추천 요청:', requestBody);

    try {
      // AI 코스 추천 API 호출
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const apiUrl = `${baseUrl}/api/ai/courses?memberId=1`;

      console.log('🚀 AI 코스 추천 API 호출 시작:', apiUrl);
      console.log('📤 요청 데이터:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 AI 코스 추천 API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error('AI 코스 추천 요청에 실패했습니다.');
      }

      const data = await response.json();
      console.log('📊 AI 코스 추천 API 응답 데이터:', data);

      // 성공 시 AiResult 페이지로 이동 (팝업 느낌으로)
      navigate('/ai/result', {
        state: {
          requestData: requestBody,
          responseData: data,
          showAsPopup: true,
          centerLat: centerLat,
          centerLng: centerLng,
          nearestMarket: nearestMarket,
        },
      });
    } catch (error) {
      console.error('AI 코스 추천 요청 실패:', error);
      alert('AI 코스 추천 요청에 실패했습니다.');
    }
  };

  const categoryData = getSelectedCategoryData();
  const canAddMore = storeSets.length < 4;

  return (
    <>
      <div
        className="w-full min-h-screen"
        style={{
          background: 'linear-gradient(to bottom, #FF9C1F 0%, #F8FA90 50%, #FFF8C8 100%)',
        }}
      >
        <Header
          title="AI 코스 추천"
          onBack={() => navigate(-1)}
          backgroundColor="rgba(254, 254, 254, 0.30)"
        />

        <div className="w-full h-full">
          {/* Content */}
          <div className="">
            {/* Introduction */}
            <p className="text-black text-lg p-[3rem]">
              {nearestMarket ? (
                <span>
                  <span
                    style={{
                      color: '#FFF9C9',
                      fontFamily: 'Pretendard Variable',
                      fontSize: '1.6rem',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 'normal',
                    }}
                  >
                    {nearestMarket.marketName || nearestMarket?.market_name}
                  </span>
                  <span
                    style={{
                      color: '#0A0A0A',
                      fontFamily: 'Pretendard Variable',
                      fontSize: '1.6rem',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 'normal',
                    }}
                  >
                    의 코스를 추천해드릴게요.
                  </span>
                </span>
              ) : (
                '가장 가까운 시장의 코스를 추천해드릴게요.'
              )}
            </p>

            {/* Store Categories */}
            <div className="space-y-4 px-[3rem]">
              <h2
                className="font-semibold text-lg"
                style={{
                  color: '#0A0A0A',
                  fontFamily: 'Pretendard Variable',
                  fontSize: '1.6rem',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: 'normal',
                }}
              >
                어떤 가게를 찾아볼까요?
              </h2>
              <div className="flex justify-center flex-wrap gap-3">
                {categories.map((category) => (
                  <CategoryChip
                    key={category.id}
                    id={category.id}
                    label={category.label}
                    icon={category.icon}
                    isSelected={selectedCategory === category.id}
                    onClick={handleCategorySelect}
                    className="h-[4rem]"
                  />
                ))}
              </div>
            </div>

            {/* Store Conditions - 항상 표시 */}
            <div className="space-y-4">
              <h2
                className="font-semibold text-lg mt-[3rem] px-[3rem]"
                style={{
                  color: '#0A0A0A',
                  fontFamily: 'Pretendard Variable',
                  fontSize: '1.6rem',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: 'normal',
                }}
              >
                마음에 드는 가게 조건을 골라주세요
              </h2>
              <p
                className="px-[3rem]"
                style={{
                  color: '#787878',
                  fontFamily: 'Pretendard Variable',
                  fontSize: '1.1rem',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '3rem',
                }}
              >
                최대 5개 선택할 수 있어요!
              </p>

              {!selectedCategory && (
                <div className="text-center py-8 px-[3rem]">
                  <p
                    className="text-gray-600"
                    style={{
                      color: '#787878',
                      fontFamily: 'Pretendard Variable',
                      fontSize: '1.1rem',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: '1.3rem',
                    }}
                  >
                    먼저 위에서 업종을 선택해주세요
                  </p>
                </div>
              )}

              {selectedCategory && keywordLoading && (
                <div className="text-center py-4">
                  <p className="text-gray-600">키워드를 불러오는 중...</p>
                </div>
              )}

              {selectedCategory && keywordError && (
                <div className="text-center py-4">
                  <p className="text-red-600">키워드 로딩에 실패했습니다.</p>
                </div>
              )}

              {selectedCategory && !keywordLoading && !keywordError && categoryData?.groups && (
                <div className="flex gap-4 overflow-x-auto pb-2 w-full pl-[3rem]">
                  {categoryData.groups.map((group) => (
                    <div key={group.vibe_type_id} className="space-y-2 flex-shrink-0 min-w-fit">
                      <h3
                        style={{
                          color: '#FF9C1F',
                          fontFamily: 'Pretendard Variable',
                          fontSize: '1.4rem',
                          fontStyle: 'normal',
                          fontWeight: 600,
                          lineHeight: '3rem',
                        }}
                      >
                        {group.vibe_type_name}
                      </h3>
                      <div className="space-y-2 flex gap-2 flex-col">
                        {group.keywords.map((keyword) => (
                          <button
                            key={keyword.code}
                            onClick={() => handleConditionToggle(keyword.code)}
                            className={`w-auto rounded-[1.2rem] p-[0.2rem_1.6rem] text-[1.4rem] font-medium transition-colors ${
                              selectedConditions.includes(keyword.code)
                                ? 'border-2 border-dotted border-primary-1000'
                                : ''
                            }`}
                            style={{
                              color: '#0A0A0A',
                              fontFamily: 'Pretendard Variable',
                              lineHeight: '3rem',
                              background: 'rgba(254, 254, 254, 0.70)',
                              display: 'inline-block',
                              width: 'fit-content',
                            }}
                          >
                            {keyword.display}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions - 항상 표시 */}
            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                <p
                  className="ml-auto mt-[7.1rem] text-right px-[3rem]"
                  style={{
                    color: '#787878',
                    fontFamily: 'Pretendard Variable',
                    fontSize: '1.1rem',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '1.3rem',
                  }}
                >
                  최대 4개 선택할 수 있어요!{' '}
                  <span
                    style={{
                      color: '#FF9C1F',
                      textAlign: 'center',
                      fontFamily: 'Pretendard Variable',
                      fontSize: '1.4rem',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 'normal',
                    }}
                  >
                    {storeSets.length}
                  </span>
                  <span
                    style={{
                      color: '#0A0A0A',
                      fontFamily: 'Pretendard Variable',
                      fontSize: '1.4rem',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 'normal',
                    }}
                  >
                    /4
                  </span>
                </p>

                {canAddMore && (
                  <button
                    onClick={handleAddStore}
                    disabled={!selectedCategory || selectedConditions.length === 0}
                    className="ml-auto mx-[3rem] flex justify-center items-center flex-shrink-0 rounded-[2rem] border border-[#FF9C1F] bg-[#FEFEFE] w-[12rem] h-[3.7rem]  hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      color: '#FF9C1F',
                      textAlign: 'center',
                      fontFamily: 'Pretendard Variable',
                      fontSize: '1.4rem',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 'normal',
                      borderRadius: '2rem',
                      border: '0.8px solid #FF9C1F',
                      background: '#FEFEFE',
                    }}
                  >
                    + 가게 추가
                  </button>
                )}

                <button
                  onClick={handleSubmitRecommendation}
                  disabled={storeSets.length < 2}
                  className="mx-auto mt-[4.8rem] flex justify-center items-center flex-shrink-0 rounded-[1rem] bg-[#FF9C1F] w-[30rem] h-[4.8rem] text-white font-semibold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderRadius: '1rem',
                    background: '#FF9C1F',
                    width: '30rem',
                    height: '4.8rem',
                    color: '#FEFEFE',
                    textAlign: 'center',
                    fontFamily: 'Pretendard Variable',
                    fontSize: '1.4rem',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: 'normal',
                  }}
                >
                  코스 추천받기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Ai;
