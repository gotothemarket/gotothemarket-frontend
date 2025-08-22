import React, { createContext, useContext, useState, useEffect } from 'react';

const MapContext = createContext();

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};

export const MapProvider = ({ children }) => {
  const [mapState, setMapState] = useState({
    center: { lat: 37.4961, lng: 126.98231 }, // 기본값 (서울시청)
    level: 1,
    address: '서울 동작구 동작동 102-33'
  });

  // localStorage에서 지도 상태 복원
  useEffect(() => {
    const savedMapState = localStorage.getItem('mapState');
    if (savedMapState) {
      try {
        const parsed = JSON.parse(savedMapState);
        setMapState(parsed);
      } catch (error) {
        console.error('저장된 지도 상태 파싱 실패:', error);
      }
    }
  }, []);

  // 지도 상태 변경 시 localStorage에 저장 (디바운싱 적용)
  const updateMapState = (newState) => {
    const updatedState = { ...mapState, ...newState };
    
    // 실제로 변경된 경우에만 상태 업데이트
    if (JSON.stringify(updatedState) !== JSON.stringify(mapState)) {
      setMapState(updatedState);
      
      // 디바운싱으로 localStorage 저장 최적화
      if (window.mapStateSaveTimeout) {
        clearTimeout(window.mapStateSaveTimeout);
      }
      window.mapStateSaveTimeout = setTimeout(() => {
        localStorage.setItem('mapState', JSON.stringify(updatedState));
      }, 1000); // 1초 후 저장
    }
  };

  // 지도 중심 위치 업데이트
  const updateMapCenter = (lat, lng) => {
    updateMapState({ center: { lat, lng } });
  };

  // 지도 줌 레벨 업데이트
  const updateMapLevel = (level) => {
    updateMapState({ level });
  };

  // 지도 주소 업데이트
  const updateMapAddress = (address) => {
    updateMapState({ address });
  };

  // 전체 지도 상태 업데이트
  const updateFullMapState = (center, level, address) => {
    updateMapState({ center, level, address });
  };

  const value = {
    mapState,
    updateMapCenter,
    updateMapLevel,
    updateMapAddress,
    updateFullMapState
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
};
