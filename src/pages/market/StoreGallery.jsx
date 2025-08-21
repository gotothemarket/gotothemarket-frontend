import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { storeDetailOptions } from '../../apis/apis';
import Header from '../../components/Header';
import trashIcon from '../../assets/trash_icon.svg';
import closeIcon from '../../assets/close_icon_white.svg';

const StoreGallery = () => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const { data, isLoading, error } = useQuery(storeDetailOptions(storeId));

  const normalized = useMemo(() => {
    const s = data?.data ?? data ?? {};
    const photos = Array.isArray(s.photos)
      ? s.photos.map((p, i) => ({
          photo_id: p.photo_id ?? p.photoId ?? p.id ?? i,
          photo_url: p.photo_url ?? p.photoUrl ?? p.url,
        }))
      : [];
    const store = s.store || {};
    return { store, photos };
  }, [data]);

  const handleBack = () => navigate(-1);
  const handlePhotoReport = () => console.log('사진 제보하기 클릭');
  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  if (isLoading) {
    return (
      <div className="h-full bg-black">
        <Header title="가게 사진" onBack={handleBack} variant="dark" />
        <div className="p-4 text-center text-gray-300">불러오는 중…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-black">
        <Header title="가게 사진" onBack={handleBack} variant="dark" />
        <div className="p-4 text-center text-red-400">사진을 불러올 수 없습니다.</div>
      </div>
    );
  }

  const { store, photos } = normalized;

  return (
    <div className="h-full bg-black">
      {/* 헤더 */}
      <Header title="가게 사진" onBack={handleBack} variant="dark" />

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
                  alt={`사진 ${index + 1}`}
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
