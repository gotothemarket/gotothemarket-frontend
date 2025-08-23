import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeDetailOptions } from '../../apis/apis';
import Header from '../../components/Header';
import trashIcon from '../../assets/trash_icon.svg';
import closeIcon from '../../assets/close_icon_white.svg';

const StoreGallery = () => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  const { data, isLoading, error } = useQuery(storeDetailOptions(storeId));

  // 사진 삭제 뮤테이션
  const deletePhotoMutation = useMutation({
    mutationFn: async ({ storeId, photoId }) => {
      console.log('🚀 사진 삭제 시작:', { storeId, photoId });

      const response = await fetch(`/api/stores/${storeId}/photo/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API 응답:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 에러 응답:', errorText);
        throw new Error(`사진 삭제에 실패했습니다. (${response.status})`);
      }

      const result = await response.json();
      console.log('✅ 삭제 성공:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('🎉 삭제 뮤테이션 성공:', data);
      // 성공 시 가게 상세 정보 쿼리 무효화하여 사진 목록 갱신
      queryClient.invalidateQueries(['store', 'detail', storeId]);
      setShowDeleteConfirm(false);
      setPhotoToDelete(null);
      setSelectedPhoto(null);
    },
    onError: (error) => {
      console.error('💥 삭제 뮤테이션 실패:', error);
      alert(`사진 삭제에 실패했습니다: ${error.message}`);
    },
  });

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

  // 삭제 확인 팝업 표시
  const handleDeleteClick = (photo) => {
    setPhotoToDelete(photo);
    setShowDeleteConfirm(true);
  };

  // 사진 삭제 실행
  const handleDeleteConfirm = () => {
    console.log('🔘 삭제 확인 버튼 클릭됨');
    console.log('📸 삭제할 사진 정보:', photoToDelete);

    if (photoToDelete) {
      console.log('🚀 삭제 뮤테이션 실행:', {
        storeId,
        photoId: photoToDelete.photo_id,
      });

      deletePhotoMutation.mutate({
        storeId,
        photoId: photoToDelete.photo_id,
      });
    } else {
      console.error('❌ 삭제할 사진 정보가 없음');
    }
  };

  // 삭제 확인 팝업 닫기
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setPhotoToDelete(null);
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
    <div className="min-h-screen bg-black">
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
          </div>
        </div>
      )}

      {/* 삭제 확인 팝업 */}
      {showDeleteConfirm && (
        <div className="fixed top-0 w-full max-w-[430px] h-full bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">사진을 삭제하시겠습니까?</h3>
              <p className="text-sm text-gray-600 mb-6">삭제된 사진은 복구할 수 없습니다.</p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletePhotoMutation.isPending}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletePhotoMutation.isPending ? '삭제 중...' : '삭제'}
                </button>

                {/* 디버깅용 상태 표시 */}
                <div className="mt-2 text-xs text-gray-500">
                  상태: {deletePhotoMutation.isPending ? '진행중' : '대기중'} | 에러:{' '}
                  {deletePhotoMutation.error ? '있음' : '없음'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreGallery;
