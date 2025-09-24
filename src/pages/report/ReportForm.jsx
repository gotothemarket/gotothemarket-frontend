import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import MapBox from '../market/components/MapBox';
import { reportStoreOptions, updateStoreOptions, validateLocationOptions } from '../../apis/apis';
import { loadKakaoMaps } from '../../utils/kakaoMap';
import closeIcon from '../../assets/close_icon.svg';
import backIcon from '../../assets/left_arrow.svg';
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
  const { location: selectedLocation, address, mode, storeId, initial } = location.state || {};
  const effectiveLocation = selectedLocation || initial?.coord || null;
  
  console.log('🔍 ReportForm에서 받은 데이터:', {
    selectedLocation,
    address,
    mode,
    storeId,
    initial,
    effectiveLocation,
  });
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

  const [storeName, setStoreName] = useState(initial?.storeName || '');
  const [storeType, setStoreType] = useState('');
  const [startTime, setStartTime] = useState(
    initial?.openingHours ? toTimeString(initial.openingHours) : '',
  );
  const [endTime, setEndTime] = useState(
    initial?.closingHours ? toTimeString(initial.closingHours) : '',
  );
  const [contact, setContact] = useState(initial?.phoneNumber || '');
  const [displayAddress, setDisplayAddress] = useState(address || initial?.address || '');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateStores, setDuplicateStores] = useState([]);

  // 가게 제보 API 호출
  const reportStoreMutation = useMutation(reportStoreOptions());
  const updateStoreMutation = useMutation(updateStoreOptions(storeId));

  // 위치 검증 API 호출 (편집 모드에서는 건너뛰기)
  const { data: validationData, isLoading: isValidating } = useQuery({
    ...validateLocationOptions(
      effectiveLocation?.lat,
      effectiveLocation?.lng,
      10 // 10m 반경 내 중복 체크
    ),
    enabled: !!(effectiveLocation?.lat && effectiveLocation?.lng && mode !== 'edit'),
    staleTime: 0, // 캐시 무효화 - 항상 최신 데이터
    gcTime: 0, // 가비지 컬렉션 시간도 0으로
  });

  // 검증 데이터 변경 시 로그 출력
  useEffect(() => {
    console.log('🔄 validationData 업데이트:', validationData);
    console.log('🔄 isValidating 상태:', isValidating);
  }, [validationData, isValidating]);

  // 중복 모달 상태 변경 추적
  useEffect(() => {
    console.log('🔄 showDuplicateModal 상태 변경:', showDuplicateModal);
  }, [showDuplicateModal]);


  // 초기 타입 세팅 (텍스트 → 내부 id 매핑은 간단화)
  useEffect(() => {
    if (initial?.storeTypeName) {
      const id = reverseTypeMap(initial.storeTypeName);
      if (id) setStoreType(id);
    }
  }, [initial?.storeTypeName]);

  // 좌표 → 주소 역지오코딩 (주소가 없을 때만)
  useEffect(() => {
    let cancelled = false;
    async function ensureKakao() {
      if (window.kakao?.maps?.services) return true;
      if (!KAKAO_KEY) return false;
      try {
        await loadKakaoMaps(KAKAO_KEY);
        return true;
      } catch {
        return false;
      }
    }

    async function geocode() {
      if (!effectiveLocation || !effectiveLocation.lat || !effectiveLocation.lng) return;
      if (displayAddress) return; // 이미 주소가 있으면 스킵
      const ok = await ensureKakao();
      if (!ok) return;
      try {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(effectiveLocation.lng, effectiveLocation.lat, (result, status) => {
          if (cancelled) return;
          if (status === window.kakao.maps.services.Status.OK) {
            const name = result?.[0]?.address?.address_name || '';
            if (name) setDisplayAddress(name);
          }
        });
      } catch (e) {
        console.warn('주소 역지오코딩 실패:', e);
      }
    }

    geocode();
    return () => {
      cancelled = true;
    };
  }, [effectiveLocation?.lat, effectiveLocation?.lng, displayAddress, KAKAO_KEY]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleClose = () => {
    navigate('/'); // 홈으로 이동
  };

  const handleSubmit = async (forceRegister = false) => {
    console.log('🚀 handleSubmit 호출됨, forceRegister:', forceRegister);
    if (!storeName.trim()) {
      alert('가게 이름을 입력해주세요.');
      return;
    }

    if (!storeType) {
      alert('가게 종류를 선택해주세요.');
      return;
    }

    // 위치 검증 (편집 모드가 아니고 강제 등록이 아닌 경우에만)
    console.log('🔍 중복 체크 데이터:', { mode, forceRegister, validationData });
    if (mode !== 'edit' && !forceRegister && validationData) {
      console.log('🚨 중복 체크 조건:', { 
        isValid: validationData.isValid, 
        nearbyStoresLength: validationData.nearbyStores?.length,
        nearbyStores: validationData.nearbyStores 
      });
      if (!validationData.isValid || validationData.nearbyStores?.length > 0) {
        console.log('🚨 중복 모달 표시!');
        console.log('🚨 nearbyStores:', validationData.nearbyStores);
        setDuplicateStores(validationData.nearbyStores || []);
        setShowDuplicateModal(true);
        console.log('🚨 showDuplicateModal 상태 변경 완료');
        return;
      }
    }

    // API 요청 본문 형식에 맞춰 데이터 변환
    const typeNumber = getStoreTypeNumber(storeType);
    const typeNameById = {
      1: '과일·야채',
      2: '수산',
      3: '식당',
      4: '빵·떡',
      5: '잡화',
      6: '길거리음식',
      7: '축산',
      8: '의류',
    };
    const storeData = {
      memberId: 1, // 임시로 1로 설정 (실제로는 로그인된 사용자 ID 사용)
      storeType: typeNumber, // 숫자 타입
      storeTypeId: typeNumber, // PATCH 대비 호환 필드
      storeTypeName: typeNameById[typeNumber],
      storeName: storeName.trim(),
      address: displayAddress || address || initial?.address || '주소 정보 없음',
      storeCoord: {
        lat: selectedLocation?.lat ?? initial?.coord?.lat,
        lng: selectedLocation?.lng ?? initial?.coord?.lng,
      },
      phoneNumber: contact.trim() || '',
      openingHours: startTime,
      closingHours: endTime,
      storeIcon: getStoreIcon(storeType), // 가게 종류에 따른 아이콘
      ...(forceRegister && { forceRegister: true }), // 강제 등록 플래그 (필요시에만 추가)
    };

    console.log('🚀 가게 제보 요청 데이터:', storeData);

    try {
      const response =
        mode === 'edit'
          ? await updateStoreMutation.mutateAsync(storeData)
          : await reportStoreMutation.mutateAsync(storeData);

      console.log('✅ 가게 제보/수정 성공 응답:', response);

      // 응답에서 가게 ID 추출 (없으면 수정 모드의 storeId 사용)
      const responseStoreId =
        response?.storeId ?? response?.id ?? response?.data?.storeId ?? response?.data?.id;
      const resolvedStoreId = responseStoreId ?? (mode === 'edit' ? storeId : undefined);

      console.log('🔍 이동 대상 가게 ID:', resolvedStoreId);

      if (resolvedStoreId) {
        // 해당 가게 정보 페이지로 이동
        console.log('📍 가게 정보 페이지로 이동:', `/stores/${resolvedStoreId}`);
        navigate(`/stores/${resolvedStoreId}`);
      } else {
        // 가게 ID를 찾을 수 없는 경우 홈으로 이동
        console.log('⚠️ 가게 ID를 찾을 수 없어 홈으로 이동');
        alert(
          mode === 'edit' ? '가게 정보가 수정되었습니다!' : '가게가 성공적으로 제보되었습니다!',
        );
        navigate('/');
      }
    } catch (error) {
      console.error('❌ 가게 제보 에러:', error);
      console.error('❌ 에러 상세 정보:', {
        message: error.message,
        status: error.status,
        response: error.response,
      });
      alert(
        mode === 'edit'
          ? '가게 정보 수정에 실패했습니다.'
          : '가게 제보에 실패했습니다. 다시 시도해주세요.',
      );
    }
  };

  // 중복 무시하고 강제 등록
  const handleForceSubmit = () => {
    setShowDuplicateModal(false);
    // 기존 handleSubmit 재활용 (검증 건너뛰고 바로 등록)
    handleSubmit(true); // forceRegister 플래그 전달
  };

  // 가게 종류를 숫자로 변환하는 함수
  const getStoreTypeNumber = (storeType) => {
    const typeMap = {
      produce: 1, // 과일·야채
      seafood: 2, // 수산
      restaurant: 3, // 식당
      bakery: 4, // 빵·떡
      misc: 5, // 잡화
      street: 6, // 길거리음식
      meat: 7, // 축산
      clothing: 8, // 의류
    };
    return typeMap[storeType] || 0;
  };

  // 가게 종류에 따른 아이콘 반환 함수
  const getStoreIcon = (storeType) => {
    const iconMap = {
      produce: '과일야채',
      seafood: '수산',
      restaurant: '요리',
      clothing: '의류',
      misc: '잡화',
      meat: '축산',
      street: '길거리',
      bakery: '빵떡',
    };
    return iconMap[storeType] || '잡화';
  };

  // 유틸: 내부 숫자 시각용 포맷 → "HHMM" 혹은 "오전/오후" 단순화가 되어있어 그대로 둠
  function toTimeString(n) {
    if (typeof n !== 'number') return String(n ?? '');
    const h = Math.floor(n / 100);
    const m = String(n % 100).padStart(2, '0');
    return `${String(h).padStart(2, '0')}:${m}`;
  }

  function reverseTypeMap(typeName) {
    const map = {
      '과일·야채': 'produce',
      수산: 'seafood',
      식당: 'restaurant',
      '빵·떡': 'bakery',
      잡화: 'misc',
      길거리음식: 'street',
      축산: 'meat',
      의류: 'clothing',
    };
    return map[typeName];
  }

  const storeTypes = [
    { id: 'produce', label: '과일·야채', icon: produceIcon },
    { id: 'seafood', label: '수산', icon: seafoodIcon },
    { id: 'restaurant', label: '식당', icon: restaurantIcon },
    { id: 'bakery', label: '빵·떡', icon: bakeryIcon },
    { id: 'misc', label: '잡화', icon: miscIcon },
    { id: 'street', label: '길거리음식', icon: streetIcon },
    { id: 'meat', label: '축산', icon: meatIcon },
    { id: 'clothing', label: '의류', icon: clothingIcon },
  ];

  if (!effectiveLocation) {
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
          <div className="px-4 mb-8">
            <div className="w-full h-[200px] rounded-[1rem] overflow-hidden">
              {effectiveLocation && effectiveLocation.lat && effectiveLocation.lng ? (
                <MapBox
                  title=""
                  lat={effectiveLocation.lat}
                  lng={effectiveLocation.lng}
                  className="h-[200px]"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <p>위치 정보를 불러올 수 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 주소 표시 */}
          <div className="absolute top-[13rem] z-[200] left-0 right-0 mx-[4.7rem]">
            <div className="h-[4.4rem] w-full flex items-center px-[1.6rem] rounded-[1rem] bg-[#FEFEFE] text-[#969696] text-[1.2rem] font-normal leading-normal border border-[#F4F4F4]">
              <p
                className="text-[1.2rem] font-normal text-[#969696]"
                style={{ fontFamily: 'Pretendard Variable' }}
              >
                {displayAddress || '주소를 가져올 수 없습니다'}
              </p>
            </div>
          </div>

          {/* 가게 이름 */}
          <div className="px-[2.1rem] mb-8">
            <h3
              className="mb-4"
              style={{
                color: '#0A0A0A',
                fontFamily: 'Pretendard Variable',
                fontSize: '1.6rem',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
              }}
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
              className="mb-4"
              style={{
                color: '#0A0A0A',
                fontFamily: 'Pretendard Variable',
                fontSize: '1.6rem',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
              }}
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
              className="mb-2"
              style={{
                color: '#0A0A0A',
                fontFamily: 'Pretendard Variable',
                fontSize: '1.6rem',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
              }}
            >
              영업시간
              <span className="text-[1.4rem] text-gray-400 font-normal ml-2">(선택)</span>
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="9:00"
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
                placeholder="21:00"
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
              className="mb-2"
              style={{
                color: '#0A0A0A',
                fontFamily: 'Pretendard Variable',
                fontSize: '1.6rem',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
              }}
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
          disabled={
            !storeName.trim() ||
            !storeType ||
            reportStoreMutation.isPending ||
            updateStoreMutation.isPending ||
            isValidating
          }
          className={`w-full h-[4.4rem] pb-[7.2rem] pt-[2.3rem] text-[1.4rem] font-semibold transition-all ${
            storeName.trim() &&
            storeType &&
            !reportStoreMutation.isPending &&
            !updateStoreMutation.isPending &&
            !isValidating
              ? 'bg-[#FF9C1F] text-[#FEFEFE] hover:bg-[#FF8A00] active:scale-[0.98]'
              : 'bg-[#D9D9D9] text-white cursor-not-allowed'
          }`}
          style={{ fontFamily: 'Pretendard Variable' }}
        >
          {reportStoreMutation.isPending || updateStoreMutation.isPending
            ? '제출 중...'
            : isValidating
              ? '위치 검증 중...'
              : mode === 'edit'
                ? '수정 완료'
                : '가게 등록하기'}
        </button>
      </div>

      {/* 중복 가게 안내 모달 - Figma 디자인 */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-[10000] bg-black bg-opacity-50 flex items-center justify-center p-4">
          {/* Frame 1057 */}
          <div 
            className="bg-[#FEFEFE] flex flex-col items-start gap-[10px]"
            style={{
              width: '262px',
              height: '221px',
              padding: '14px 15px',
              borderRadius: '20px',
            }}
          >
            {/* Frame 1062 */}
            <div className="flex flex-col items-center gap-[10px] w-[232px] h-[193px]">
              
              {/* Frame 1296 - 제목 영역 */}
              <div className="flex flex-col items-start gap-[5px] w-[232px] h-[47px]">
                {/* 👀 이모지 */}
                <div 
                  className="w-[232px] h-[25px] flex items-center justify-center text-[#0A0A0A]"
                  style={{
                    fontFamily: 'Pretendard Variable',
                    fontWeight: 600,
                    fontSize: '25px',
                    lineHeight: '30px',
                  }}
                >
                  👀
                </div>
                
                {/* 제목 텍스트 */}
                <div 
                  className="w-[232px] h-[17px] flex items-center justify-center text-[#0A0A0A]"
                  style={{
                    fontFamily: 'Pretendard Variable',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '17px',
                  }}
                >
                  근처에 제보된 가게가 이미 있어요!
                </div>
              </div>

              {/* Frame 1063 - 가게 목록 영역 */}
              <div className="flex flex-col items-center gap-[10px] w-[232px] h-[87px]">
                
                {/* Frame 1297 - 가게 리스트 */}
                <div className="flex flex-col items-center gap-[5px]" style={{ width: '207.8px', height: '53px' }}>
                  
                  {/* 가게 목록 - 첫 번째 줄 */}
                  <div className="flex flex-row items-start gap-[5px]" style={{ width: '207.8px', height: '24px' }}>
                    {duplicateStores.slice(0, 2).map((store, index) => (
                      <div 
                        key={index}
                        className="flex flex-row justify-center items-center gap-[5px] bg-[#FFF3DE] rounded-[10px]"
                        style={{
                          padding: '5px 12px',
                          minWidth: index === 0 ? '123.4px' : '79.4px',
                          height: '24px'
                        }}
                      >
                        {/* Pin 아이콘 */}
                        <div 
                          className="relative"
                          style={{ width: '8.4px', height: '13.2px' }}
                        >
                          <div 
                            className="absolute rounded-full"
                            style={{
                              width: '7.5px',
                              height: '2.7px',
                              left: '0.3px',
                              top: '10.5px',
                              background: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 170, 0, 0.6) 0%, rgba(255, 170, 0, 0.2) 50%, rgba(255, 170, 0, 0) 100%)'
                            }}
                          />
                          <div 
                            className="absolute bg-[#0A0A0A]"
                            style={{
                              width: '100%',
                              height: '90.91%',
                              border: '0.24px solid #FEA900',
                              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
                            }}
                          />
                          <div 
                            className="absolute bg-[#FEA900] rounded-full"
                            style={{
                              width: '4.2px',
                              height: '3.6px',
                              left: '2.1px',
                              top: '2.7px'
                            }}
                          />
                        </div>
                        
                        {/* 가게 이름 */}
                        <span 
                          className="text-[#FF9C1F] text-center"
                          style={{
                            fontFamily: 'Pretendard Variable',
                            fontWeight: 700,
                            fontSize: '12px',
                            lineHeight: '14px',
                          }}
                        >
                          {store.storeName || (index === 0 ? '바다를 사랑하는...' : '전성시대')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 가게 목록 - 두 번째 줄 (3개 이상일 때) */}
                  {duplicateStores.length > 2 && (
                    <div className="flex flex-row items-start gap-[5px]" style={{ width: '207.8px', height: '24px' }}>
                      {duplicateStores.slice(2, 4).map((store, index) => (
                        <div 
                          key={index + 2}
                          className="flex flex-row justify-center items-center gap-[5px] bg-[#FFF3DE] rounded-[10px]"
                          style={{
                            padding: '5px 12px',
                            minWidth: index === 1 ? '123.4px' : '79.4px',
                            height: '24px'
                          }}
                        >
                          {/* Pin 아이콘 */}
                          <div 
                            className="relative"
                            style={{ width: '8.4px', height: '13.2px' }}
                          >
                            <div 
                              className="absolute rounded-full"
                              style={{
                                width: '7.5px',
                                height: '2.7px',
                                left: '0.3px',
                                top: '10.5px',
                                background: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 170, 0, 0.6) 0%, rgba(255, 170, 0, 0.2) 50%, rgba(255, 170, 0, 0) 100%)'
                              }}
                            />
                            <div 
                              className="absolute bg-[#0A0A0A]"
                              style={{
                                width: '100%',
                                height: '90.91%',
                                border: '0.24px solid #FEA900',
                                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
                              }}
                            />
                            <div 
                              className="absolute bg-[#FEA900] rounded-full"
                              style={{
                                width: '4.2px',
                                height: '3.6px',
                                left: '2.1px',
                                top: '2.7px'
                              }}
                            />
                          </div>
                          
                          {/* 가게 이름 */}
                          <span 
                            className="text-[#FF9C1F] text-center"
                            style={{
                              fontFamily: 'Pretendard Variable',
                              fontWeight: 700,
                              fontSize: '12px',
                              lineHeight: '14px',
                            }}
                          >
                            {store.storeName || (index === 0 ? '전성시대' : '귀뚜리미의 신나는')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 안내 메시지 */}
                <div 
                  className="w-[232px] h-[24px] flex items-center justify-center text-[#0A0A0A]"
                  style={{
                    fontFamily: 'Pretendard Variable',
                    fontWeight: 500,
                    fontSize: '10px',
                    lineHeight: '12px',
                    opacity: 0.3,
                  }}
                >
                  중복 제보를 막기 위해, 같은 가게가 아닌지 확인해주세요!
                </div>
              </div>

              {/* Frame 1061 - 버튼 영역 */}
              <div className="flex flex-row items-center gap-[13px] w-[232px] h-[39px]">
                
                {/* 가게 제보하기 버튼 */}
                <div className="relative w-[109px] h-[39px] bg-[#F7F7F7] rounded-[10px]">
                  <button
                    onClick={handleForceSubmit}
                    className="absolute inset-0 flex flex-col justify-center items-center opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <span 
                      className="text-[#0A0A0A] text-center"
                      style={{
                        fontFamily: 'Pretendard Variable',
                        fontWeight: 600,
                        fontSize: '14px',
                        lineHeight: '17px',
                      }}
                    >
                      가게 제보하기
                    </span>
                  </button>
                </div>

                {/* 뒤로가기 버튼 */}
                <div className="relative w-[109px] h-[39px] bg-[#F7F7F7] rounded-[10px]">
                  <button
                    onClick={() => setShowDuplicateModal(false)}
                    className="absolute inset-0 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <span 
                      className="text-[#0A0A0A] text-center"
                      style={{
                        fontFamily: 'Pretendard Variable',
                        fontWeight: 600,
                        fontSize: '14px',
                        lineHeight: '17px',
                      }}
                    >
                      뒤로가기
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportForm;
