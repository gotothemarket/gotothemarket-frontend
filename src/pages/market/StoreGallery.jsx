import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import storeData from '../../mocks/store_mocks.json';
import backIcon from '../../assets/left_arrow_white.svg';
import trashIcon from '../../assets/trash_icon.svg';
import closeIcon from '../../assets/close_icon_white.svg';

const StoreGallery = () => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // 실제로는 API에서 가게 정보를 가져와야 합니다
  const { store, photos } = storeData;

  const handleBack = () => navigate(-1);
  const handlePhotoReport = () => console.log('사진 제보하기 클릭');
  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  return (
    <div className="h-full bg-black">
      {/* 헤더 */}
      <div className="sticky top-0 bg-black text-white px-[1.3rem] pt-[6.2rem]  pb-[1.2rem] z-10">
        <div className="flex items-center justify-center">
          <button
            onClick={handleBack}
            className="absolute left-[1.2rem] p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <img src={backIcon} alt="뒤로가기" />
          </button>
          <h1 className="text-[1.7rem] font-medium text-[#FEFEFE] text-center font-['Pretendard_Variable'] leading-normal">
            가게 사진
          </h1>
        </div>
      </div>

      {/* 갤러리 그리드 */}
      <div className="p-4 pb-20">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-lg mb-2">아직 등록된 사진이 없어요</p>
            <p className="text-sm">첫 번째 사진을 제보해보세요!</p>
            <button
              onClick={handlePhotoReport}
              className="mt-4 px-6 py-3 bg-main-1000 text-white rounded-lg font-medium hover:bg-main-900 transition-colors"
            >
              사진 제보하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[0.8rem]">
            {photos.map((photo, index) => (
              <div
                key={photo.photo_id ?? index}
                className="rounded-[1rem] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                style={{ aspectRatio: '181/174' }}
                onClick={() => handlePhotoClick(photo)}
              >
                <img
                  src={photo.photo_url}
                  alt={`${store.store_name} 사진 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 사진 모달 */}
      {selectedPhoto && (
        <div
          className="fixed top-0 w-full max-w-[430px] h-full bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-[430px] h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.photo_url}
              alt="확대된 사진"
              className="max-w-full max-h-full w-full h-full object-contain"
            />
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <img src={closeIcon} alt="사진 닫기" />
            </button>
            <button
              onClick={handlePhotoReport}
              className="absolute bottom-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <img src={trashIcon} alt="사진 삭제" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreGallery;
