import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MapBox from '../market/components/MapBox';
import closeIcon from '../../assets/close_icon.svg';
import backIcon from '../../assets/left_arrow.svg';
import dropdownOpenedIcon from '../../assets/dropdown_opened.svg';
import dropdownClosedIcon from '../../assets/dropdown_closed.svg';
import CategoryChip from '../../components/CategoryChip';
import produceIcon from '../../assets/과일야채.svg';
import seafoodIcon from '../../assets/수산.svg';
import restaurantIcon from '../../assets/요리.svg';
import clothingIcon from '../../assets/의류.svg';
import miscIcon from '../../assets/잡화.svg';
import meatIcon from '../../assets/축산.svg';
import streetIcon from '../../assets/길거리.svg';
import bakeryIcon from '../../assets/빵떡.svg';

const ReportForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { location: selectedLocation, address } = location.state || {};

  const [marketName, setMarketName] = useState('상도전통시장');
  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('');
  const [startTime, setStartTime] = useState('오전 9시');
  const [endTime, setEndTime] = useState('오후 9시');
  const [contact, setContact] = useState('');
  const [isMarketDropdownOpen, setIsMarketDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const marketOptions = [
    '상도전통시장',
    '흑석시장',
    '성대전통시장',
    '남성역골목시장',
    '남성사계시장',
  ];

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMarketDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleClose = () => {
    navigate('/'); // 홈으로 이동
  };

  const handleSubmit = () => {
    if (!storeName.trim()) {
      alert('가게 이름을 입력해주세요.');
      return;
    }

    const storeData = {
      location: selectedLocation,
      address: address,
      marketName,
      storeName,
      storeType,
      businessHours: `${startTime} - ${endTime}`,
      contact,
    };

    console.log('등록할 가게 정보:', storeData);
    alert('가게가 등록되었습니다!');
    navigate('/');
  };

  const storeTypes = [
    { id: 'produce', label: '과일·야채', icon: produceIcon },
    { id: 'seafood', label: '수산', icon: seafoodIcon },
    { id: 'restaurant', label: '식당', icon: restaurantIcon },
    { id: 'clothing', label: '의류', icon: clothingIcon },
    { id: 'misc', label: '잡화', icon: miscIcon },
    { id: 'meat', label: '축산', icon: meatIcon },
    { id: 'street', label: '길거리음식', icon: streetIcon },
    { id: 'bakery', label: '빵·떡', icon: bakeryIcon },
  ];

  if (!selectedLocation) {
    return (
      <div className="z-[9999] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">위치 정보가 없습니다.</p>
          <button
            onClick={() => navigate('/report/location')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg"
          >
            위치 선택하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center">
      <div className="w-full max-w-[43rem] h-full flex flex-col bg-white">
        {/* 헤더 */}
        <div className="flex items-center justify-between pt-[4rem] pb-[2rem]">
          <button onClick={handleBack} className="pl-[2.5rem] hover:opacity-70 transition-opacity">
            <img src={backIcon} alt="뒤로가기" className=" h-[2rem]" />
          </button>

          <h1
            className="text-center text-[1.7rem] font-medium leading-normal"
            style={{ fontFamily: 'Pretendard Variable', color: '#0A0A0A' }}
          >
            가게 제보하기
          </h1>

          <button onClick={handleClose} className="pr-[2.5rem] hover:opacity-70 transition-opacity">
            <img src={closeIcon} alt="닫기" className="w-6 h-6" />
          </button>
        </div>

        {/* 스크롤 가능한 컨텐츠 */}
        <div className="flex-1 overflow-y-auto relative">
          {/* 지도 */}
          <div className="px-4 mb-6">
            <div className="w-full h-[200px] rounded-[1rem] overflow-hidden">
              <MapBox title="" lat={selectedLocation.lat} lng={selectedLocation.lng} />
            </div>
          </div>

          {/* 주소 표시 */}
          <div className="absolute top-[13rem] z-[200] left-0 right-0 mx-[4.7rem]">
            <div className="h-[4.4rem] w-full flex items-center px-[1.6rem] rounded-[1rem] bg-[#FEFEFE] text-[#969696] text-[1.2rem] font-normal leading-normal border border-[#F4F4F4]">
              <p
                className="text-[1.2rem] font-normal text-[#969696]"
                style={{ fontFamily: 'Pretendard Variable' }}
              >
                {address || '주소를 가져올 수 없습니다'}
              </p>
            </div>
          </div>

          {/* 시장 선택 */}
          <div className="px-[2.1rem] mb-8">
            <h3
              className="text-[1.4rem] font-semibold mb-4 text-[#0A0A0A]"
              style={{ fontFamily: 'Pretendard Variable' }}
            >
              어느 시장의 가게인가요?
            </h3>
            <div className="relative" ref={dropdownRef}>
              {/* 드롭다운 버튼 */}
              <button
                onClick={() => setIsMarketDropdownOpen(!isMarketDropdownOpen)}
                className="w-full h-[4.4rem] px-4 rounded-[1rem] bg-[#FFF8C8] text-[1.4rem] font-normal leading-normal flex items-center justify-between border border-[#F4EBAA]"
                style={{ fontFamily: 'Pretendard Variable', color: '#969696' }}
              >
                <span>{marketName}</span>
                <img
                  src={isMarketDropdownOpen ? dropdownOpenedIcon : dropdownClosedIcon}
                  alt={isMarketDropdownOpen ? '드롭다운 열림' : '드롭다운 닫힘'}
                  className="w-5 h-5"
                />
              </button>

              {/* 드롭다운 메뉴 */}
              {isMarketDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[1rem] shadow-lg border border-gray-200 z-10">
                  {marketOptions.map((option, index) => (
                    <button
                      key={option}
                      onClick={() => {
                        setMarketName(option);
                        setIsMarketDropdownOpen(false);
                      }}
                      className={`w-full h-[4.4rem] px-4 text-left text-[1.4rem] font-normal leading-normal ${
                        index % 2 === 0
                          ? 'bg-[#FFF8C8] text-[#969696]'
                          : 'bg-[#FFF6BE] text-[#969696] border-[#F4EBAA] border-[0.8px]'
                      } ${option === marketOptions[0] ? 'rounded-t-[1rem]' : ''} ${
                        option === marketOptions[marketOptions.length - 1] ? 'rounded-b-[1rem]' : ''
                      }`}
                      style={{ fontFamily: 'Pretendard Variable' }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 가게 이름 */}
          <div className="px-[2.1rem] mb-8">
            <h3
              className="text-[1.4rem] font-semibold mb-4 text-[#0A0A0A]"
              style={{ fontFamily: 'Pretendard Variable' }}
            >
              가게 이름
            </h3>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="가게 이름"
              className="w-full h-[4.4rem] px-4 rounded-[1rem] bg-gray-50 text-[1.4rem] font-normal leading-normal placeholder-gray-400"
              style={{ fontFamily: 'Pretendard Variable', color: '#969696' }}
            />
          </div>

          {/* 가게 종류 */}
          <div className="px-[2.1rem] mb-8">
            <h3
              className="text-[1.4rem] font-semibold mb-4 text-[#0A0A0A]"
              style={{ fontFamily: 'Pretendard Variable' }}
            >
              가게 종류
            </h3>
            <div className="flex justify-center flex-wrap gap-3 bg-gray-50 rounded-[1rem] px-[1.8rem] py-[1rem]">
              {storeTypes.map((type) => (
                <CategoryChip
                  key={type.id}
                  id={type.id}
                  label={type.label}
                  icon={type.icon}
                  isSelected={storeType === type.id}
                  onClick={setStoreType}
                  className="h-[4rem]"
                />
              ))}
            </div>
          </div>

          {/* 영업시간 (선택) */}
          <div className="px-[2.1rem] mb-8">
            <h3
              className="text-[1.4rem] font-semibold mb-2 text-[#0A0A0A]"
              style={{ fontFamily: 'Pretendard Variable' }}
            >
              영업시간
              <span className="text-[1.4rem] text-gray-400 font-normal ml-2">(선택)</span>
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="오전 9시"
                className="flex-1 h-[4.4rem] w-[13.7rem] px-4 rounded-[1rem] bg-gray-50 text-[1.4rem] font-normal leading-normal placeholder-gray-400"
                style={{ fontFamily: 'Pretendard Variable', color: '#969696' }}
              />
              <span
                className="text-[1.4rem] font-normal text-[#0A0A0A]"
                style={{ fontFamily: 'Pretendard Variable' }}
              >
                부터
              </span>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="오후 9시"
                className="flex-1 h-[4.4rem] w-[13.7rem] px-4 rounded-[1rem] bg-gray-50 text-[1.4rem] font-normal leading-normal placeholder-gray-400"
                style={{ fontFamily: 'Pretendard Variable', color: '#969696' }}
              />
              <span
                className="text-[1.4rem] font-normal text-[#0A0A0A]"
                style={{ fontFamily: 'Pretendard Variable' }}
              >
                까지
              </span>
            </div>
          </div>

          {/* 가게 연락처 (선택) */}
          <div className="px-[2.1rem] mb-8">
            <h3
              className="text-[1.4rem] font-semibold mb-2 text-[#0A0A0A]"
              style={{ fontFamily: 'Pretendard Variable' }}
            >
              가게 연락처
              <span className="text-[1.4rem] text-gray-400 font-normal ml-2">(선택)</span>
            </h3>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full h-[4.4rem] px-4 rounded-[1rem] bg-gray-50 text-[1.6rem] text-[#969696] placeholder-gray-400"
              style={{ fontFamily: 'Pretendard Variable' }}
            />
          </div>
        </div>

        {/* 하단 등록 버튼 */}

        <button
          onClick={handleSubmit}
          disabled={!storeName.trim()}
          className={`w-full h-[4.4rem] pb-[7.2rem] pt-[2.3rem] text-[1.4rem] font-semibold transition-all ${
            storeName.trim()
              ? 'bg-[#FF9C1F] text-[#FEFEFE] hover:bg-[#FF8A00] active:scale-[0.98]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          style={{ fontFamily: 'Pretendard Variable' }}
        >
          가게 등록하기
        </button>
      </div>
    </div>
  );
};

export default ReportForm;
