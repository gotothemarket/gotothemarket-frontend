// components/PhotoStrip.jsx
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { queryClient } from '../../../apis/queryClient';
import { k } from '../../../apis/queryKeys';
import { uploadPhotoOptions } from '../../../apis/apis';

export default function PhotoStrip({
  title,
  photos = [],
  ctaLabel,
  onCta,
  storeId,
  isMarket = false,
}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handleViewMore = () => {
    if (storeId) {
      navigate(`/store/${storeId}/gallery`);
    }
  };

  const handlePhotoClick = (photo, index) => {
    if (isMarket) {
      // 시장 사진일 때는 확대 모달 표시
      setSelectedPhoto({ ...photo, index });
    } else if (index === 3) {
      // 가게 사진일 때는 4번째 사진 클릭 시 더보기
      handleViewMore();
    }
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  // 업로드 UI는 storeId가 준비된 뒤에만 렌더링되도록 별도 컴포넌트 사용

  return (
    <section className="pt-[3rem] px-[1.5rem]">
      <div className="flex justify-between items-center mb-4">
        <h3
          style={{
            color: '#0A0A0A',
            fontFamily: 'Pretendard Variable',
            fontSize: '1.6rem',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 'normal',
          }}
        >
          {title}
        </h3>
        {!isMarket && storeId && (
          <PhotoUploader storeId={storeId} ctaLabel={ctaLabel || '사진 제보하기'} />
        )}
      </div>

      {photos.length === 0 ? (
        <div className="w-full h-[6.7rem] bg-gray-50 rounded-[1rem] flex flex-col items-center justify-center text-gray-400">
          {isMarket ? '사진이 없습니다' : '사진을 제보해주세요!'}
        </div>
      ) : (
        <div className="flex gap-3">
          {photos.slice(0, 4).map((p, idx) => (
            <div
              key={p.photo_id ?? idx}
              className="flex-1 rounded-lg overflow-hidden relative cursor-pointer"
              style={{ height: '6.6rem' }}
              onClick={() => handlePhotoClick(p, idx)}
            >
              <img
                src={p.photo_url}
                alt={`${title} ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {/* 가게 정보일 때만 4번째 사진에 더보기 오버레이 표시 */}
              {!isMarket && idx === 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white gap-1">
                  <div className="text-lg font-semibold">+</div>
                  <div className="text-xs">더보기</div>
                </div>
              )}
            </div>
          ))}
          {/* 가게 정보일 때만 사진이 4개 미만하면 더보기 버튼 표시 */}
          {!isMarket && photos.length < 4 && (
            <button
              onClick={handleViewMore}
              className="flex-1 h-[6.6rem] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-sm hover:border-gray-400 transition-colors"
            >
              + 더보기
            </button>
          )}
        </div>
      )}

      {/* 사진 확대 모달 */}
      {selectedPhoto &&
        createPortal(<PhotoModal photo={selectedPhoto} onClose={closePhotoModal} />, document.body)}
    </section>
  );
}

function PhotoUploader({ storeId, ctaLabel }) {
  const fileInputRef = useRef(null);
  const uploadMutation = useMutation(uploadPhotoOptions(storeId));

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadMutation.mutateAsync(file);
      const newPhoto = {
        photo_id: res?.photoId ?? res?.data?.photoId ?? Date.now(),
        photo_url: res?.photoUrl ?? res?.data?.photoUrl ?? '',
      };
      const keyId = String(storeId);
      // 즉시 캐시 반영
      queryClient.setQueryData(k.store.detail(keyId), (prev) => {
        if (!prev) return prev;
        if (prev.data) {
          const photos = Array.isArray(prev.data.photos) ? prev.data.photos : [];
          return { ...prev, data: { ...prev.data, photos: [...photos, newPhoto] } };
        }
        const photos = Array.isArray(prev.photos) ? prev.photos : [];
        return { ...prev, photos: [...photos, newPhoto] };
      });
      // 동기화 위해 무효화도 수행
      queryClient.invalidateQueries({ queryKey: k.store.detail(keyId) });
      queryClient.invalidateQueries({ queryKey: k.store.photos(keyId) });
      alert('사진이 업로드되었습니다.');
    } catch (err) {
      console.error('사진 업로드 실패:', err);
      alert('사진 업로드에 실패했습니다.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={handleUploadClick}
        className="disabled:opacity-50"
        disabled={uploadMutation.isPending}
        style={{
          color: '#FF9C1F',
          textAlign: 'right',
          fontFamily: 'Pretendard Variable',
          fontSize: '1.2rem',
          fontStyle: 'normal',
          fontWeight: 600,
          lineHeight: 'normal',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0',
          margin: '0',
        }}
      >
        {uploadMutation.isPending ? '업로드 중...' : ctaLabel || '사진 제보하기'}
      </button>
    </>
  );
}

// 사진 확대 모달 컴포넌트
function PhotoModal({ photo, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-[430px] flex items-center justify-center">
        <img
          src={photo.photo_url}
          alt={`확대된 사진`}
          className="w-full h-auto max-h-[90vh] object-contain"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-2xl hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full w-8 h-8 flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
