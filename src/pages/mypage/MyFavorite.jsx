import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesOptions, deleteFavoriteOptions } from '../../apis/mypage/api';
import closeIcon from '../../assets/close_icon_white.svg';

const FavoriteCard = ({ favorite, showDelete, onDelete, onClick, isDeleting }) => (
  <div
    className="flex items-center gap-[1.2rem] p-[0.8rem] bg-[#181818] rounded-[2rem] cursor-pointer hover:bg-[#2A2A2A] transition-colors"
    onClick={onClick}
  >
    <div className="w-[6rem] h-[6rem] flex items-center justify-center">
      <img
        src={favorite.storeIcon}
        alt={favorite.storeName}
        className="w-[4rem] h-[4rem] object-contain"
      />
    </div>
    <div className="flex-1">
      <div className="text-[#787878] text-[1.2rem]">{favorite.marketName}</div>
      <div className="text-white text-body-secondary font-semibold mt-[0.4rem]">
        {favorite.storeName}
      </div>
    </div>
    {showDelete && (
      <button
        onClick={(e) => {
          e.stopPropagation(); // 부모 클릭 이벤트 방지
          onDelete(favorite);
        }}
        disabled={isDeleting}
        className={`w-[2rem] h-[2rem] rounded-full cursor-pointer flex items-center justify-center flex-shrink-0 mr-[2rem] transition-colors ${
          isDeleting 
            ? 'bg-[#666666] cursor-not-allowed' 
            : 'bg-[#FF4444] hover:bg-[#FF6666]'
        }`}
      >
        {isDeleting ? (
          <div className="w-[0.86rem] h-[0.86rem] border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <img src={closeIcon} alt="삭제" className="w-[0.86rem] h-[0.86rem]" />
        )}
      </button>
    )}
  </div>
);

const MyFavorite = () => {
  const navigate = useNavigate();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const queryClient = useQueryClient();

  // 즐겨찾기 데이터 가져오기
  const { data: favoritesData, isLoading, error } = useQuery(favoritesOptions());

  // 즐겨찾기 삭제 mutation
  const deleteFavoriteMutation = useMutation({
    ...deleteFavoriteOptions(),
    onSuccess: () => {
      // 삭제 성공 시 즐겨찾기 목록을 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      console.log('즐겨찾기 삭제 성공');
      // 삭제 모드 자동 종료
      setIsDeleteMode(false);
    },
    onError: (error) => {
      console.error('즐겨찾기 삭제 실패:', error);
      alert('즐겨찾기 삭제에 실패했습니다.');
    },
  });

  const favorites = favoritesData?.data?.favorites || [];
  const total = favoritesData?.data?.total || 0;

  const handleDelete = async (favoriteToDelete) => {
    try {
      await deleteFavoriteMutation.mutateAsync(favoriteToDelete.storeId);
    } catch (error) {
      console.error('즐겨찾기 삭제 중 오류 발생:', error);
    }
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="bg-black min-h-screen pb-[8.3rem] flex items-center justify-center">
        <div className="text-white text-[1.8rem]">로딩 중...</div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="bg-black min-h-screen pb-[8.3rem] flex items-center justify-center">
        <div className="text-white text-[1.8rem]">데이터를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pb-[8.3rem]">
      <Header title="즐겨찾기" variant="dark" onBack={() => navigate(-1)} />

      {/* Main Title */}
      <div className="px-[4rem] mt-[3.5rem]">
        <div className="text-white text-heading-medium font-semibold">즐겨찾기한 가게</div>
      </div>

      {/* Section Header */}
      <div className="px-[2rem] mx-[2rem] mt-[5.2rem] flex items-center justify-between">
        <div className="text-[#FFAA00] text-[1.4rem] font-semibold">
          {favorites.length}개의 리스트
        </div>
        <button
          onClick={toggleDeleteMode}
          className={`px-[1rem] py-[0.1rem] rounded-[1rem] cursor-pointer text-[1.4rem] ${
            isDeleteMode ? 'bg-[#181818] text-[#787878]' : 'text-[#787878]'
          }`}
        >
          {isDeleteMode ? '완료' : '삭제하기'}
        </button>
      </div>

      {/* Favorites List */}
      <div className="px-[3.4rem] mt-[1.2rem] space-y-[1.5rem]">
        {favorites.length > 0 ? (
          favorites.map((favorite, idx) => (
            <FavoriteCard
              key={`favorite-${idx}`}
              favorite={favorite}
              showDelete={isDeleteMode}
              onDelete={handleDelete}
              onClick={() => navigate(`/stores/${favorite.storeId}`)}
              isDeleting={deleteFavoriteMutation.isLoading}
            />
          ))
        ) : (
          <div className="text-center text-[#787878] text-[1.4rem] py-[3rem]">
            즐겨찾기한 가게가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFavorite;
