import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import favoritesData from '../../mocks/favorites_mocks.json';
import closeIcon from '../../assets/close_icon_white.svg';

const FavoriteCard = ({ favorite, showDelete, onDelete }) => (
  <div className="flex items-center gap-[1.2rem] p-[0.8rem] bg-[#181818] rounded-[2rem]">
    <div className="w-[6rem] h-[6rem] flex items-center justify-center">
      <img
        src={favorite.store_icon}
        alt={favorite.store_name}
        className="w-[4rem] h-[4rem] object-contain"
      />
    </div>
    <div className="flex-1">
      <div className="text-[#787878] text-[1.2rem]">
        {favorite.market_name} #{favorite.category}
      </div>
      <div className="text-white text-body-secondary font-semibold mt-[0.4rem]">
        {favorite.store_name}
      </div>
    </div>
    {showDelete && (
      <button
        onClick={() => onDelete(favorite)}
        className="w-[2rem] h-[2rem] rounded-full cursor-pointer bg-[#FF4444] flex items-center justify-center flex-shrink-0 mr-[2rem]"
      >
        <img src={closeIcon} alt="삭제" className="w-[0.86rem] h-[0.86rem]" />
      </button>
    )}
  </div>
);

const MyFavorite = () => {
  const navigate = useNavigate();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [favorites, setFavorites] = useState(favoritesData.data.favorites);
  const { total } = favoritesData.data;

  const handleDelete = (favoriteToDelete) => {
    setFavorites((prev) => prev.filter((fav) => fav !== favoriteToDelete));
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
  };

  return (
    <div className="bg-black min-h-screen pb-[8.3rem]">
      <Header title="즐겨찾기" variant="dark" onBack={() => navigate(-1)} />

      {/* Main Title */}
      <div className="px-[4rem] mt-[3.5rem]">
        <div className="text-white text-heading-medium font-semibold">고구마햇반님의 즐겨찾기</div>
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
        {favorites.map((favorite, idx) => (
          <FavoriteCard
            key={`favorite-${idx}`}
            favorite={favorite}
            showDelete={isDeleteMode}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default MyFavorite;
