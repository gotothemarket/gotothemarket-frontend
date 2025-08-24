import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { myReviewsOptions } from '../../apis/mypage/api';

const ReviewCard = ({ review, onClick }) => (
  <div 
    className="flex flex-col justify-center items-center w-full h-[13rem] bg-[#181818] rounded-[1.2rem] p-[1rem] text-body-medium text-white cursor-pointer hover:bg-[#2A2A2A] transition-colors"
    onClick={onClick}
  >
    <div className="text-[1.4rem] text-[#787878]">{review.market_name}</div>
    <div className="w-full text-center mt-[0.6rem] text-white text-[1.2rem] font-normal leading-[1.4rem] h-[5rem] overflow-hidden px-[0.4rem]">
      {review.content.length > 27 ? `${review.content.slice(0, 27)}...` : review.content}
    </div>
    <div className="mt-[0.4rem] w-full max-w-[10.8rem] text-center bg-[#2E2E2E] py-[0.5rem] text-[1.6rem] text-body-medium rounded-[3rem]">
      {review.store_name}
    </div>
  </div>
);

const MyReview = () => {
  const navigate = useNavigate();
  
  // 리뷰 데이터 가져오기
  const { data: reviewsData, isLoading, error } = useQuery(myReviewsOptions({ size: 10000 }));
  
  const reviews = reviewsData?.data?.reviews || [];

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
      <Header title="리뷰 내역" variant="dark" onBack={() => navigate(-1)} />

      {/* Reviews Grid */}
      <div className="mt-[3rem] px-[4rem] grid grid-cols-2 gap-[1.2rem] sm:gap-[1.6rem]">
        {reviews.length > 0 ? (
          reviews.map((review, idx) => (
            <ReviewCard
              key={`review-${idx}`}
              review={review}
              onClick={() => navigate(`/stores/${review.store_id || idx}`)}
            />
          ))
        ) : (
          <div className="col-span-2 text-center text-[#787878] text-[1.4rem] py-[3rem]">
            작성한 리뷰가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReview;
