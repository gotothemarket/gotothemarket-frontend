import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import MapBox from '../market/components/MapBox'
import closeIcon from '../../assets/close_icon.svg'
import produceIcon from '../../assets/과일야채.svg'
import seafoodIcon from '../../assets/수산.svg'
import meatIcon from '../../assets/축산.svg'
import restaurantIcon from '../../assets/요리.svg'
import arrowOrangeIcon from '../../assets/arrow_orange.svg'

const AiResult = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const { requestData, showAsPopup } = location.state || {}

  // 코스 추천 결과 데이터 (목데이터)
  const courseData = {
    marketName: "남성사계시장",
    course: [
      {
        id: 1,
        storeName: "싱싱과일나라",
        category: "과일·야채",
        keyword: "#저렴한",
        icon: produceIcon
      },
      {
        id: 2,
        storeName: "금성수산",
        category: "수산",
        keyword: "#깔끔한",
        icon: seafoodIcon
      },
      {
        id: 3,
        storeName: "장터한우촌",
        category: "축산",
        keyword: "#저렴한",
        icon: meatIcon
      },
      {
        id: 4,
        storeName: "황제소고기국밥",
        category: "식당",
        keyword: "#혼밥하기좋은",
        icon: restaurantIcon
      }
    ]
  }

  useEffect(() => {
    // 팝업 느낌을 위한 애니메이션
    if (showAsPopup) {
      setIsVisible(true)
    }
  }, [showAsPopup])

  const handleClose = () => {
    if (showAsPopup) {
      setIsVisible(false)
      // 애니메이션 완료 후 이전 페이지로 이동
      setTimeout(() => {
        navigate(-1)
      }, 300)
    } else {
      navigate(-1)
    }
  }

  if (showAsPopup) {
    return (
      <div className={`min-h-screen py-[6rem] flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`} style={{
        background: 'linear-gradient(to bottom, #FF9C1F 0%, #F8FA90 50%, #FFF8C8 100%)'
      }}>
        <div 
          className={` transition-all duration-300 ${
            isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
          }`} 
          onClick={handleClose}
        ></div>
        <div className={`relative w-full max-w-4xl mx-4 transform transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}>
          <div className='w-full'>
            <div className='relative'>
              {/* 닫기 버튼 */}
              <button 
                onClick={handleClose}
                className='absolute top-4 right-4 z-10 w-[1.6rem] h-[1.6rem] flex items-center justify-center cursor-pointer'
              >
                <img src={closeIcon} alt="닫기" className="w-[1.6rem] h-[1.6rem]" />
              </button>
              
              {/* 헤더 */}
              <div className=' p-6 text-center'>
                <p className='text-sm text-gray-600 mb-2'>{courseData.marketName}</p>
                <h1 className='text-2xl font-bold text-black'>코스 추천 완료</h1>
              </div>
              
              {/* 지도 섹션 */}
              <div className='px-[1rem]'>
                <MapBox 
                  title="" 
                  lat={37.5665} 
                  lng={126.9780}
                  className="h-[18.5rem] aspect-[317.01/185.00]"
                  sectionClassName="pb-[3rem] pt-[-1rem]"
                />
                
                {/* 코스 리스트 */}
                <div className='space-y-[2rem] w-[80%] mx-auto'>
                  {courseData.course.map((item, index) => (
                    <div key={item.id} className='flex justify-between items-center space-x-4 relative'>
                      {/* 왼쪽 번호 원 */}
                      <div className='w-[2.4rem] h-[2.4rem] bg-[#FF9C1F] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0'>
                        {item.id}
                      </div>
                      
                      {/* 점선 연결선 */}
                      {index < courseData.course.length - 1 && (
                        <div className='absolute left-[1rem] top-20 w-0.5 h-30 border-l-3 border-dashed border-[#FF9C1F]'></div>
                      )}
                      
                      {/* 아이콘과 카테고리 */}
                      <div className='flex flex-col items-center'>
                          
                            <img src={item.icon} alt={item.category} className="w-[6rem] h-[6rem] object-fit" />
                         
                         
                          <div className='bg-[#FEFEFE] px-3 py-1 rounded-[2rem] text-[1rem] text-[#FF9C1F] font-medium'>
                            {item.category}
                          </div>
                      </div>
                      
                      {/* 가게 정보 */}
                      <div className='flex-1'>
                        <h3 className='text-lg font-semibold text-black mb-1'>{item.storeName}</h3>
                        <p className='text-sm text-gray-600'>{item.keyword}</p>
                      </div>
                      
                      {/* 오른쪽 화살표 */}
                      <div 
                        className='flex items-center text-gray-400 cursor-pointer hover:scale-110 transition-transform'
                        onClick={() => navigate(`/stores/${item.id}`)}
                      >
                        <img src={arrowOrangeIcon} alt="화살표" className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 일반 페이지로 표시 (showAsPopup이 false인 경우)
  return (
    <div className='w-full min-h-screen' style={{
        background: 'linear-gradient(to bottom, #FF9C1F 0%, #F8FA90 50%, #FFF8C8 100%)'
      }}>
      <div className='relative'>
        <Header 
          title="AI 코스 추천" 
          onBack={() => navigate(-1)} 
          backgroundColor="rgba(254, 254, 254, 0.30)"
        />
        
        <div className='p-6'>
          <div className='text-center space-y-4'>
            <h2 className='text-2xl font-bold text-gray-800'>
              코스 추천 결과
            </h2>
            <p className='text-gray-600'>
              선택하신 조건을 바탕으로 AI가 추천하는 코스입니다.
            </p>
            
            {/* 여기에 실제 코스 추천 결과 내용이 들어갈 예정 */}
            <div >
              <p className='text-sm text-gray-500'>
                코스 추천 결과가 여기에 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiResult