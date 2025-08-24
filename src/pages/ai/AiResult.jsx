import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import MapBox from '../market/components/MapBox'
import closeIcon from '../../assets/close_icon.svg'
import 과일야채 from '../../assets/과일야채.svg';
import 수산 from '../../assets/수산.svg';
import 축산 from '../../assets/축산.svg';
import 요리 from '../../assets/요리.svg';
import 의류 from '../../assets/의류.svg';
import 잡화 from '../../assets/잡화.svg';
import 빵떡 from '../../assets/빵떡.svg';
import 길거리음식 from '../../assets/길거리.svg';
import arrowOrangeIcon from '../../assets/arrow_orange.svg';

const AiResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const { requestData, responseData, showAsPopup, centerLat, centerLng, nearestMarket } =
    location.state || {};

  // store_type을 카테고리 이름으로 변환
  const getCategoryName = (storeType) => {
    const categoryMap = {
      1: '과일·야채',
      2: '수산',
      3: '식당',
      4: '빵·떡',
      5: '잡화',
      6: '길거리음식',
      7: '축산',
      8: '의류',
    };
    return categoryMap[storeType] || '기타';
  };

  // store_type을 카테고리 아이콘으로 변환
  const getCategoryIcon = (storeType) => {
    const iconMap = {
      1: 과일야채,
      2: 수산,
      3: 요리,
      4: 빵떡,
      5: 잡화,
      6: 길거리음식,
      7: 축산,
      8: 의류,
    };
    return iconMap[storeType] || 과일야채;
  };

  // API 응답 데이터에서 코스 정보 추출
  const courseData = responseData?.data
    ? {
        marketName: 'AI 추천 코스', // 실제로는 nearestMarket에서 가져온 시장명을 사용할 수 있음
        course: responseData.data.courses.map((item, index) => ({
          id: item.order,
          storeId: item.store_id,
          storeName: item.store_name,
          category: getCategoryName(item.store_type),
          keywords: item.keywords,
          icon: getCategoryIcon(item.store_type),
        })),
      }
    : null;

  useEffect(() => {
    // 팝업 느낌을 위한 애니메이션
    if (showAsPopup) {
      setIsVisible(true);
    }
  }, [showAsPopup]);

  const handleClose = () => {
    if (showAsPopup) {
      setIsVisible(false);
      // 애니메이션 완료 후 홈화면으로 이동
      setTimeout(() => {
        navigate('/');
      }, 300);
    } else {
      navigate('/');
    }
  };

  if (showAsPopup) {
    return (
      <div
        className={`min-h-screen py-[6rem] flex  justify-center transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(to bottom, #FF9C1F 0%, #F8FA90 50%, #FFF8C8 100%)',
        }}
      >
        <div
          className={` transition-all duration-300 ${isVisible ? 'bg-opacity-50' : 'bg-opacity-0'}`}
          onClick={handleClose}
        ></div>
        <div
          className={`relative w-full max-w-4xl mx-4 transform transition-all duration-300 ${
            isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        >
          <div className="w-full">
            <div className="relative">
              {/* 닫기 버튼 */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-[1.6rem] h-[1.6rem] flex items-center justify-center cursor-pointer"
              >
                <img src={closeIcon} alt="닫기" className="w-[1.6rem] h-[1.6rem]" />
              </button>

              {/* 헤더 */}
              <div className=" p-6 text-center">
                <p
                  className="mb-2"
                  style={{
                    color: '#907F60',
                    textAlign: 'center',
                    fontFamily: 'Pretendard Variable',
                    fontSize: '1.2rem',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: 'normal',
                  }}
                >
                  {nearestMarket?.marketName || nearestMarket?.market_name || 'AI 추천 코스'}
                </p>
                <h1
                  style={{
                    color: '#0A0A0A',
                    textAlign: 'center',
                    fontFamily: 'Pretendard Variable',
                    fontSize: '2rem',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: 'normal',
                  }}
                >
                  코스 추천 완료
                </h1>
              </div>

              {!courseData ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">코스 추천 데이터를 불러오는 중...</p>
                </div>
              ) : (
                <>
                  {/* 지도 섹션 */}
                  <div className="px-[1rem]">
                    <MapBox
                      title=""
                      lat={centerLat || 37.5665}
                      lng={centerLng || 126.978}
                      markers={responseData?.data?.courses || []}
                      className="h-[25rem] aspect-[317.01/250.00]"
                      sectionClassName="pb-[3rem] pt-[-1rem]"
                      zoomLevel={2}
                      fitBounds={false}
                    />

                    {/* 코스 리스트 */}
                    <div className="space-y-[2rem] w-[80%] mx-auto">
                      {courseData.course.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center space-x-4 relative"
                        >
                          {/* 왼쪽 번호 원 */}
                          <div className="w-[2.4rem] h-[2.4rem] mb-1 pb-1 border-1 border-white bg-[#FF9C1F] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                            {item.id}
                          </div>

                          {/* 점선 연결선 */}
                          {index < courseData.course.length - 1 && (
                            <div className="absolute left-[1rem] top-20 w-0.5 h-30 border-l-3 border-dashed border-[#FF9C1F]"></div>
                          )}

                          {/* 아이콘과 카테고리 */}
                          <div className="flex flex-col items-center">
                            <img
                              src={item.icon}
                              alt={item.category}
                              className="w-[6rem] h-[6rem] object-fit"
                            />

                            <div className="bg-[#FEFEFE] px-3 py-1 rounded-[2rem] text-[1rem] text-[#FF9C1F] font-medium">
                              {item.category}
                            </div>
                          </div>

                          {/* 가게 정보 */}
                          <div className="flex-1">
                            <h3
                              className="text-lg font-semibold text-black mb-1"
                              style={{
                                color: '#0A0A0A',
                                fontFamily: 'Pretendard Variable',
                                fontSize: '1.4rem',
                                fontStyle: 'normal',
                                fontWeight: 600,
                                lineHeight: 'normal',
                              }}
                            >
                              {item.storeName}
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {item.keywords.map((keyword, keywordIndex) => (
                                <span
                                  key={keywordIndex}
                                  className="text-xs text-[black] pr-2 py-1 rounded-full"
                                  style={{
                                    color: '#0A0A0A',
                                    fontFamily: 'Pretendard Variable',
                                    fontSize: '1rem',
                                    fontStyle: 'normal',
                                    fontWeight: 400,
                                    lineHeight: 'normal',
                                  }}
                                >
                                  #{keyword}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* 오른쪽 화살표 */}
                          <div
                            className="flex items-center w-[1.2rem] h-[1.8rem] mr-[2rem] object-fit text-gray-400 cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => navigate(`/stores/${item.storeId}`)}
                          >
                            <img
                              src={arrowOrangeIcon}
                              alt="화살표"
                              className="w-full h-full object-fit"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 일반 페이지로 표시 (showAsPopup이 false인 경우)
  return (
    <div
      className="w-full min-h-screen"
      style={{
        background: 'linear-gradient(to bottom, #FF9C1F 0%, #F8FA90 50%, #FFF8C8 100%)',
      }}
    >
      <div className="relative">
        <Header
          title="AI 코스 추천"
          onBack={() => navigate(-1)}
          backgroundColor="rgba(254, 254, 254, 0.30)"
        />

        <div className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">코스 추천 결과</h2>
            <p className="text-gray-600">선택하신 조건을 바탕으로 AI가 추천하는 코스입니다.</p>

            {/* 여기에 실제 코스 추천 결과 내용이 들어갈 예정 */}
            <div>
              <p className="text-sm text-gray-500">코스 추천 결과가 여기에 표시됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiResult