import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import mypageData from '../../mocks/mypage_mocks.json';

const ReviewCard = ({ review }) => (
  <div className="flex flex-col justify-center items-center w-full h-[13rem] bg-[#181818] rounded-[1.2rem] p-[1rem] text-body-medium text-white">
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
  const { reviews } = mypageData.data;

  return (
    <div className="bg-black min-h-screen pb-[8.3rem]">
      <Header title="리뷰 내역" variant="dark" onBack={() => navigate(-1)} />

      {/* Reviews Grid */}
      <div className="mt-[3rem] px-[4rem] grid grid-cols-2 gap-[1.2rem] sm:gap-[1.6rem]">
        {reviews.map((review, idx) => (
          <ReviewCard key={`review-${idx}`} review={review} />
        ))}
      </div>
    </div>
  );
};

export default MyReview;
