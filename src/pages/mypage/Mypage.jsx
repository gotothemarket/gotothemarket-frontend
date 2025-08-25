import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../../components/Header';
import { mypageAllOptions, favoritesOptions, myReviewsOptions } from '../../apis/mypage/api';
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

  // API를 통해 마이페이지 데이터 가져오기
  const { data: mypageData, isLoading, error } = useQuery(mypageAllOptions());

  // 즐겨찾기 데이터 가져오기
  const { data: favoritesData, isLoading: favoritesLoading } = useQuery(favoritesOptions());

  // 리뷰 데이터 가져오기
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery(
    myReviewsOptions({ size: 10000 }),
  );

  // 디버깅을 위한 콘솔 로그
  console.log('API 응답 전체 데이터:', mypageData);
  console.log('API 응답 data:', mypageData?.data);
  console.log('API 응답 profile:', mypageData?.data?.profile);
  console.log('즐겨찾기 데이터:', favoritesData);
  console.log('리뷰 데이터:', reviewsData);
  console.log('로딩 상태:', isLoading);
  console.log('에러 상태:', error);

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
    console.error('API 에러 상세:', error);
    return (
      <div className="bg-black min-h-screen pb-[8.3rem] flex items-center justify-center">
        <div className="text-white text-[1.8rem]">데이터를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  // 데이터가 없을 경우 처리
  if (!mypageData?.data?.profile) {
    console.log('데이터가 없습니다. mypageData:', mypageData);
    return (
      <div className="bg-black min-h-screen pb-[8.3rem] flex items-center justify-center">
        <div className="text-white text-[1.8rem]">데이터가 없습니다.</div>
      </div>
    );
  }

  const { profile } = mypageData.data;
  const favorites = favoritesData?.data?.favorites || [];
  const reviews = reviewsData?.data?.reviews || [];

  return (
    <div className="bg-black min-h-screen pb-[8.3rem]">
      <Header title="마이페이지" variant="dark" />

      {/* Profile Section */}
      <section className="flex justify-center gap-[7rem] w-full px-[5.7rem] pt-[2rem] pb-[1rem] text-white">
        <div className="flex flex-col items-center justify-center gap-[1rem]">
          {/* Badge thumbnail */}
          <div
            className="w-[7.2rem] h-[7.2rem] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/mypage/badge')}
          >
            <img
              src={profile.badges?.[0]?.badge_icon}
              alt="badge image"
              className="w-[5.6rem] h-[5.6rem]"
            />
          </div>
          <div
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/mypage/badge')}
          >
            {profile.badges?.[0] && <Pill>{profile.badges[0].badge_name}</Pill>}
          </div>
          <div className="text-[2.4rem] font-semibold">{profile.nickname}</div>
        </div>

        <div className="mt-[2.4rem] flex flex-col gap-[3rem]">
          <StatItem label="제보한 가게" value={profile.store_count} />
          <StatItem label="리뷰" value={profile.review_count} />
          <div
            className="flex items-center gap-[1rem] w-[8rem] cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/mypage/badge')}
          >
            <span className="text-white text-body-large whitespace-nowrap">획득한 뱃지</span>
            <span className="text-secondary-600 text-white-bold font-semibold">
              {profile.badge_count}
            </span>
          </div>
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
          {favoritesLoading ? (
            <div className="text-[#787878] text-[1.4rem]">즐겨찾기 로딩 중...</div>
          ) : favorites.length > 0 ? (
            favorites.map((fav, idx) => (
              <div
                key={`fav-${idx}`}
                className="flex-shrink-0 flex flex-col justify-center items-center w-[12.8rem] h-[13rem] bg-[#181818] rounded-[1.2rem] p-[1rem] text-body-medium text-white cursor-pointer hover:bg-[#2A2A2A] transition-colors"
                onClick={() => navigate(`/stores/${fav.storeId || idx}`)}
              >
                <div className="text-[1.4rem] text-[#787878]">{fav.marketName}</div>
                <div className="w-full flex items-center justify-center overflow-hidden">
                  <img
                    src={fav.storeIcon}
                    alt="store icon"
                    className="w-[5rem] h-[5rem] object-cover"
                  />
                </div>
                <div className="mt-[0.4rem] w-full text-center">
                  <div className="inline-block max-w-[90%] bg-[#2E2E2E] px-7 py-[0.6rem] rounded-[3rem] mx-auto">
                    <span className="block overflow-hidden whitespace-nowrap text-ellipsis text-[1.6rem] text-body-medium">
                      {fav.storeName}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-[#787878] text-[1.4rem]">즐겨찾기한 가게가 없습니다.</div>
          )}
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
          {reviewsLoading ? (
            <div className="text-[#787878] text-[1.4rem]">리뷰 로딩 중...</div>
          ) : reviews.length > 0 ? (
            reviews.map((rv, idx) => (
              <div
                key={`rv-${idx}`}
                className="flex-shrink-0 flex flex-col justify-center items-center w-[12.8rem] h-[13rem] bg-[#181818] rounded-[1.2rem] p-[1rem] text-body-medium text-white cursor-pointer hover:bg-[#2A2A2A] transition-colors"
                onClick={() => navigate(`/stores/${rv.store_id || idx}`)}
              >
                <div className="text-[1.4rem] text-[#787878]">{rv.market_name}</div>
                <div className="w-full text-center mt-[0.6rem] text-white text-[1.2rem] font-normal leading-[1.4rem] h-[5rem] overflow-hidden px-[0.4rem]">
                  {rv.content.length > 27 ? `${rv.content.slice(0, 27)}...` : rv.content}
                </div>
                <div className="mt-[0.4rem] w-full text-center">
                  <div className="inline-block max-w-[90%] bg-[#2E2E2E] px-7 py-[0.6rem] rounded-[3rem] mx-auto">
                    <span className="block overflow-hidden whitespace-nowrap text-ellipsis text-[1.6rem] text-body-medium">
                      {rv.store_name}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-[#787878] text-[1.4rem]">작성한 리뷰가 없습니다.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Mypage;
