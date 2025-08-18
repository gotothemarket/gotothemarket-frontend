import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import mypageData from '../../mocks/mypage_mocks.json';
import favoriteIcon from '../../assets/favorite_icon.svg';
import reviewIcon from '../../assets/review_icon.svg';

const StatItem = ({ label, value }) => (
  <div className="flex items-center gap-[1rem] w-[8rem]">
    <span className="text-white text-body-large whitespace-nowrap">{label}</span>
    <span className="text-secondary-600 text-white-bold font-semibold">{value}</span>
  </div>
);

const Pill = ({ children }) => (
  <div className="px-[1rem] py-[0.6rem] text-center rounded-[1rem] bg-[#2E2E2E] text-[#FFAA00] text-[1.2rem]">
    {children}
  </div>
);

const Mypage = () => {
  const navigate = useNavigate();
  const { profile, favorites, reviews } = mypageData.data;

  return (
    <div className="bg-black min-h-screen pb-[8.3rem]">
      <Header title="마이페이지" variant="dark" />

      {/* Profile Section */}
      <section className="flex justify-center gap-[7rem] w-full px-[5.7rem] pt-[2rem] pb-[1rem] text-white">
        <div className="flex flex-col items-center justify-center gap-[1rem]">
          {/* Badge thumbnail */}
          <div className="w-[7.2rem] h-[7.2rem] flex items-center justify-center">
            <img
              src={profile.badges?.[0]?.badge_icon}
              alt="badge image"
              className="w-[5.6rem] h-[5.6rem]"
            />
          </div>
          <div>{profile.badges?.[0] && <Pill>{profile.badges[0].badge_name}</Pill>}</div>
          <div className="text-[2.4rem] font-semibold">{profile.nickname}</div>
        </div>

        <div className="mt-[2.4rem] flex flex-col gap-[3rem]">
          <StatItem label="제보한 가게" value={profile.store_count} />
          <StatItem label="리뷰" value={profile.review_count} />
          <StatItem label="획득한 뱃지" value={profile.badge_count} />
        </div>
      </section>

      {/* Favorites Section */}
      <section className="mt-[8rem]">
        <div className="px-[2rem] flex items-center justify-between">
          <div className="pl-[2rem]">
            <div className="flex items-center gap-[0.5rem] text-[#787878] text-body-medium">
              <img src={favoriteIcon} alt="favorite icon" />
              즐겨찾기
            </div>
            <div className="text-white text-[1.8rem] font-semibold">내가 좋아하는 가게</div>
          </div>
          <button
            onClick={() => navigate('/mypage/favorite')}
            className="text-primary-900 text-body-large cursor-pointer hover:opacity-80"
          >
            {favorites.length}개 <span className="text-secondary-600 mr-[1.5rem]">〉</span>
          </button>
        </div>
        <div className="mt-[1.2rem] pl-[4rem] pr-[1rem] flex gap-[1.2rem] overflow-x-auto">
          {favorites.map((fav, idx) => (
            <div
              key={`fav-${idx}`}
              className="flex-shrink-0 flex flex-col justify-center items-center w-[12.8rem] h-[13rem] bg-[#181818] rounded-[1.2rem] p-[1rem] text-body-medium text-white"
            >
              <div className="text-[1.4rem] text-[#787878]">{fav.market_name}</div>
              <div className="w-full flex items-center justify-center overflow-hidden">
                <img
                  src={fav.store_icon}
                  alt="store icon"
                  className="w-[5rem] h-[5rem] object-cover"
                />
              </div>
              <div className="mt-[0.4rem] w-[10.8rem] text-center bg-[#2E2E2E] py-[0.5rem] text-[1.6rem] text-body-medium rounded-[3rem]">
                {fav.store_name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mt-[3.5rem]">
        <div className="px-[2rem] flex items-center justify-between">
          <div className="pl-[2rem]">
            <div className="flex items-center gap-[0.5rem] text-[#787878] text-body-medium">
              <img src={reviewIcon} alt="review icon" />
              리뷰
            </div>
            <div className="text-white text-[1.8rem] font-semibold">내가 작성한 리뷰</div>
          </div>
          <button
            onClick={() => navigate('/mypage/review')}
            className="text-primary-900 text-body-large cursor-pointer hover:opacity-80 mr-[1.5rem]"
          >
            {reviews.length}개 <span className="text-secondary-600">〉</span>
          </button>
        </div>
        <div className="mt-[1.2rem] pl-[4rem] pr-[1rem] flex gap-[1.2rem] overflow-x-auto">
          {reviews.map((rv, idx) => (
            <div
              key={`rv-${idx}`}
              className="flex-shrink-0 flex flex-col justify-center items-center w-[12.8rem] h-[13rem] bg-[#181818] rounded-[1.2rem] p-[1rem] text-body-medium text-white"
            >
              <div className="text-[1.4rem] text-[#787878]">{rv.market_name}</div>
              <div className="w-full text-center mt-[0.6rem] text-white text-[1.2rem] font-normal leading-[1.4rem] h-[5rem] overflow-hidden px-[0.4rem]">
                {rv.content.length > 27 ? `${rv.content.slice(0, 27)}...` : rv.content}
              </div>
              <div className="mt-[0.4rem] w-[10.8rem] text-center bg-[#2E2E2E] py-[0.5rem] text-[1.6rem] text-body-medium rounded-[3rem]">
                {rv.store_name}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Mypage;
