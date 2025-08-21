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

  console.log('🔄 API 쿼리 상태:', { isLoading, error });
  console.log('📋 nearestMarketData:', nearestMarketData);

  const nearestMarket = nearestMarketData?.data;
  console.log('🏪 가장 가까운 시장 정보:', nearestMarket);

  const categories = [
    { id: 'misc', label: '잡화', icon: miscIcon },
    { id: 'meat', label: '축산', icon: meatIcon },
    { id: 'street', label: '길거리음식', icon: streetIcon },
    { id: 'bakery', label: '빵/떡', icon: bakeryIcon },
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
    mockData.data.groups.forEach((group) => {
      group.keywords.forEach((keyword) => {
        if (conditionCodes.includes(keyword.code)) {
          allKeywords.push(keyword.display);
        }
      });
    });
    return allKeywords;
  };

  const handleSubmitRecommendation = async () => {
    if (storeSets.length === 0) {
      alert('최소 하나의 가게를 선택해주세요.');
      return;
    }

    const requestBody = {
      market_id: 1,
      sets: storeSets,
    };

    console.log('코스 추천 요청:', requestBody);

    try {
      // 여기에 실제 API 호출 로직 추가
      // const response = await fetch('/api/ai/recommend', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(requestBody)
      // })

      // 성공 시 AiResult 페이지로 이동 (팝업 느낌으로)
      navigate('/ai/result', {
        state: {
          requestData: requestBody,
          showAsPopup: true,
        },
      });
    } catch (error) {
      console.error('코스 추천 요청 실패:', error);
      alert('코스 추천 요청에 실패했습니다.');
    }
  };

  const getSelectedCategoryData = () => {
    if (selectedCategory === 'produce') {
      return mockData.data;
    }
    return null;
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
          onBack={() => {}}
          backgroundColor="rgba(254, 254, 254, 0.30)"
        />

        <div className="w-full h-full">
          {/* Content */}
          <div className="">
            {/* Introduction */}
            <p className="text-black text-lg p-[3rem]">
              {nearestMarket
                ? `${nearestMarket.marketName}의 코스를 추천해드릴게요.`
                : '가장 가까운 시장의 코스를 추천해드릴게요.'}
            </p>

            {/* Store Categories */}
            <div className="space-y-4 px-[3rem]">
              <h2 className="text-black font-semibold text-lg">어떤 가게를 찾아볼까요?</h2>
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

            {/* Store Conditions - 카테고리 선택 시에만 표시 */}
            {categoryData && (
              <div className="space-y-4">
                <h2 className="text-black font-semibold text-lg mt-[3rem] px-[3rem]">
                  마음에 드는 가게 조건을 골라주세요
                </h2>
                <p className="text-black">
                  최대 5개 선택할 수 있어요! ({selectedConditions.length}/5)
                </p>

                <div className="flex gap-4 overflow-x-auto pb-2 w-full pl-[3rem]">
                  {categoryData.groups.map((group) => (
                    <div key={group.vibe_type_id} className="space-y-2 flex-shrink-0 min-w-fit">
                      <h3 className="text-orange-600 text-sm">{group.vibe_type_name}</h3>
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
              </div>
            )}

            {/* Footer Actions */}
            {categoryData && (
              <div className="space-y-4 pt-4">
                <div className="space-y-3">
                  <p className="ml-auto mt-[7.1rem] text-black text-sm text-right px-[3rem]">
                    최대 4개 선택할 수 있어요! {storeSets.length}/4
                  </p>

                  {canAddMore && (
                    <button
                      onClick={handleAddStore}
                      disabled={!selectedCategory || selectedConditions.length === 0}
                      className="ml-auto mx-[3rem] flex justify-center items-center flex-shrink-0 rounded-[2rem] border border-[#FF9C1F] bg-[#FEFEFE] w-[12rem] h-[3.7rem] p-[1rem_2.7rem_1rem_2.8rem] text-orange-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + 가게 추가
                    </button>
                  )}

                  <button
                    onClick={handleSubmitRecommendation}
                    disabled={storeSets.length === 0}
                    className="mx-auto mt-[4.8rem] flex justify-center items-center flex-shrink-0 rounded-[1rem] bg-[#FF9C1F] w-[30rem] h-[4.8rem] text-white font-semibold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    코스 추천받기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Ai;
